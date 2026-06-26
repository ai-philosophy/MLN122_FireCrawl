'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface HistoryPoint {
  price: number;
  originalPrice: number;
  date: string;
}

interface PriceHistoryAPIResponse {
  [merchantName: string]: HistoryPoint[];
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  [merchantName: string]: number | string;
}

interface PriceHistoryChartProps {
  productId: number;
  backendUrl?: string;
}

const MERCHANT_COLORS: { [key: string]: string } = {
  'CellphoneS': '#e11d48',
  'FPT Shop': '#f97316',
  'ShopDunk': '#7c3aed',
  'PhuCanh': '#0ea5e9',
  'GearVN': '#10b981',
  'Phong Vũ': '#f59e0b',
  'Tin Học Ngôi Sao': '#6366f1',
};

const DEFAULT_COLOR = '#a78bfa';

const getStrokeDasharray = (index: number) => {
  const patterns = [
    undefined,  // Nét liền (Solid)
    '6 4',      // Nét đứt dài (Dashed)
    '2 3',      // Nét chấm (Dotted)
    '8 3 2 3',  // Nét gạch chấm (Dash-dot)
  ];
  return patterns[index % patterns.length];
};

const getDotRadius = (index: number) => {
  // Bán kính chấm giảm dần để tạo vòng tròn đồng tâm khi trùng tọa độ
  return Math.max(3, 6.5 - index * 1.5);
};

export default function PriceHistoryChart({ productId, backendUrl = 'http://localhost:8080' }: PriceHistoryChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [merchants, setMerchants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'trend' | 'detail'>('trend');

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/api/tracker/products/${productId}/price-history`);
        if (!res.ok) {
          throw new Error('Không thể tải lịch sử giá của sản phẩm');
        }
        
        const data: PriceHistoryAPIResponse = await res.json();
        const merchantList = Object.keys(data);
        setMerchants(merchantList);

        // Hàm làm tròn thời gian về khoảng 10 phút gần nhất để gộp các đợt crawl gần nhau
        const roundToNearest10Minutes = (dateStr: string) => {
          try {
            const [datePart, timePart] = dateStr.split(' ');
            if (!datePart || !timePart) return dateStr;
            
            const dateParts = datePart.split('-');
            const timeParts = timePart.split(':');
            if (dateParts.length !== 3 || timeParts.length !== 2) return dateStr;
            
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            const hour = parseInt(timeParts[0]);
            const minute = parseInt(timeParts[1]);
            
            const dateObj = new Date(year, month, day, hour, minute);
            const mins = dateObj.getMinutes();
            const roundedMins = Math.round(mins / 10) * 10;
            dateObj.setMinutes(roundedMins);
            dateObj.setSeconds(0);
            
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const hh = String(dateObj.getHours()).padStart(2, '0');
            const min = String(dateObj.getMinutes()).padStart(2, '0');
            
            return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
          } catch (e) {
            return dateStr;
          }
        };

        const tempMap: { [rawDate: string]: ChartDataPoint } = {};

        merchantList.forEach((merchant) => {
          const points = data[merchant] || [];
          points.forEach((pt) => {
            const rawDate = roundToNearest10Minutes(pt.date);
            let displayDate = rawDate;
            try {
              const [datePart, timePart] = rawDate.split(' ');
              if (datePart && timePart) {
                const dateParts = datePart.split('-');
                if (dateParts.length === 3) {
                  displayDate = `${timePart} ${dateParts[2]}/${dateParts[1]}`;
                }
              }
            } catch (e) {
              console.error(e);
            }

            if (!tempMap[rawDate]) {
              tempMap[rawDate] = { 
                date: rawDate, 
                displayDate: displayDate 
              };
            }
            tempMap[rawDate][merchant] = pt.price;
          });
        });

        const sortedData = Object.values(tempMap).sort((a, b) => {
          return a.date.localeCompare(b.date);
        });

        setChartData(sortedData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchHistory();
    }
  }, [productId, backendUrl]);

  const formatCurrencyYAxis = (value: any) => {
    if (typeof value === 'number') {
      return `${(value / 1000000).toFixed(1)} Tr`;
    }
    return value;
  };

  const formatCurrencyTooltip = (value: any) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }
    return value;
  };

  // Tính toán dữ liệu xu hướng chung (giá thấp nhất hệ thống)
  const getTrendData = () => {
    return chartData.map(pt => {
      const prices = merchants
        .map(m => pt[m])
        .filter((p): p is number => typeof p === 'number');
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const cheapestMerchant = merchants.find(m => pt[m] === minPrice) || 'Hệ thống';
      
      return {
        ...pt,
        lowestPrice: minPrice,
        cheapestMerchant: cheapestMerchant
      };
    });
  };

  // Tạo lời khuyên mua sắm thông minh dựa trên lịch sử giá
  const getRecommendation = () => {
    if (chartData.length === 0 || merchants.length === 0) return null;
    
    const trendPoints = getTrendData();
    const lowestPrices = trendPoints.map(pt => pt.lowestPrice).filter(p => p > 0);
    
    if (lowestPrices.length === 0) return null;
    
    const currentMin = lowestPrices[lowestPrices.length - 1];
    const initialMin = lowestPrices[0];
    const absoluteMin = Math.min(...lowestPrices);
    const lastPoint = trendPoints[trendPoints.length - 1];
    const cheapestStore = lastPoint.cheapestMerchant;
    
    let trendText = "Giá đang ổn định ở mức tốt nhất.";
    let colorClass = "bg-emerald-50/80 text-emerald-800 border-emerald-100/50";
    let icon = "🟢";
    let advice = `Giá tốt nhất hiện tại là ${formatCurrencyTooltip(currentMin)} (tại ${cheapestStore}). Đây là thời điểm rất thích hợp để mua sản phẩm này.`;
    
    if (currentMin < initialMin) {
      const diff = initialMin - currentMin;
      trendText = `Giá đã giảm mạnh ${formatCurrencyTooltip(diff)} so với thời điểm ban đầu!`;
      colorClass = "bg-emerald-50/80 text-emerald-800 border-emerald-100/50";
      icon = "🔥";
      advice = `Khuyên dùng: NÊN MUA NGAY tại ${cheapestStore} với giá ${formatCurrencyTooltip(currentMin)} để được ưu đãi tốt nhất.`;
    } else if (currentMin > initialMin) {
      const diff = currentMin - initialMin;
      trendText = `Giá tăng nhẹ ${formatCurrencyTooltip(diff)} so với trước.`;
      colorClass = "bg-amber-50/80 text-amber-800 border-amber-100/50";
      icon = "⚠️";
      advice = `Khuyên dùng: CÂN NHẮC thêm hoặc đợi đợt giảm giá tiếp theo, giá hiện tại tại ${cheapestStore} đang tăng nhẹ.`;
    } else if (currentMin === absoluteMin && lowestPrices.length > 1) {
      trendText = "Sản phẩm đang ở mức giá rẻ nhất lịch sử!";
      colorClass = "bg-indigo-50/80 text-indigo-800 border-indigo-100/50";
      icon = "🏆";
      advice = `Nên chốt đơn ngay tại ${cheapestStore} để không bỏ lỡ mức giá hời nhất từ trước đến nay.`;
    }
    
    return { trendText, colorClass, icon, advice };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50/50 border border-slate-100">
        <span className="text-sm text-slate-400 animate-pulse">Đang tải biểu đồ biến động giá...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-rose-50/50 border border-rose-100 text-rose-500">
        <span className="text-sm">Lỗi: {error}</span>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50/50 border border-slate-100 text-slate-400">
        <span className="text-sm">Chưa có đủ dữ liệu lịch sử giá để hiển thị biểu đồ.</span>
      </div>
    );
  }

  const rec = getRecommendation();
  const trendChartData = getTrendData();

  return (
    <div className="w-full">
      {/* View Mode Toggle Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div style={{ display: 'none' }} className="hidden">
          <p className="text-xs text-slate-450">Biểu đồ so sánh giá</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
          <button
            onClick={() => setViewMode('trend')}
            style={{
              padding: '6px 12px',
              borderRadius: '9px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: viewMode === 'trend' ? 'white' : 'transparent',
              color: viewMode === 'trend' ? '#7c3aed' : '#64748b',
              boxShadow: viewMode === 'trend' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            📉 Giá rẻ nhất hệ thống (Dễ hiểu)
          </button>
          <button
            onClick={() => setViewMode('detail')}
            style={{
              padding: '6px 12px',
              borderRadius: '9px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: viewMode === 'detail' ? 'white' : 'transparent',
              color: viewMode === 'detail' ? '#7c3aed' : '#64748b',
              boxShadow: viewMode === 'detail' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            📊 So sánh chi tiết tất cả cửa hàng
          </button>
        </div>
      </div>

      {/* Smart Recommendation Box */}
      {rec && (
        <div className={`mb-4 p-4 rounded-2xl border flex items-start gap-3 text-xs ${rec.colorClass}`}>
          <span className="text-base mt-0.5">{rec.icon}</span>
          <div>
            <div className="font-bold mb-1 text-sm">{rec.trendText}</div>
            <div className="opacity-90 leading-relaxed">{rec.advice}</div>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'trend' ? (
            // 1. SIMPLE TREND VIEW (Only 1 line for Lowest Price)
            <AreaChart
              data={trendChartData}
              margin={{ top: 20, right: 10, left: -5, bottom: 25 }}
            >
              <defs>
                <linearGradient id="gradient-trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={8}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={formatCurrencyYAxis}
                dx={-8}
                domain={['dataMin - 1000000', 'dataMax + 1000000']}
              />
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  formatCurrencyTooltip(value),
                  `Giá rẻ nhất (tại ${props.payload.cheapestMerchant})`
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                  fontSize: '11px',
                  color: '#1e293b',
                  padding: '10px 14px',
                }}
              />
              <Area
                type="monotone"
                dataKey="lowestPrice"
                name="Giá rẻ nhất hệ thống"
                stroke="#7c3aed"
                strokeWidth={4.5}
                fill="url(#gradient-trend)"
                dot={{ r: 5, strokeWidth: 2, fill: 'white', stroke: '#7c3aed' }}
                activeDot={{ r: 7, strokeWidth: 0 }}
              />
            </AreaChart>
          ) : (
            // 2. DETAILED COMPARISON VIEW (Multi-line AreaChart)
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -5, bottom: 25 }}
            >
              <defs>
                {merchants.map((merchant) => (
                  <linearGradient
                    key={merchant}
                    id={`gradient-${merchant.replace(/\s+/g, '-')}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={MERCHANT_COLORS[merchant] || DEFAULT_COLOR}
                      stopOpacity={0.12}
                    />
                    <stop
                      offset="95%"
                      stopColor={MERCHANT_COLORS[merchant] || DEFAULT_COLOR}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={8}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={formatCurrencyYAxis}
                dx={-8}
                domain={['dataMin - 1000000', 'dataMax + 1000000']}
              />
              <Tooltip 
                formatter={formatCurrencyTooltip}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                  fontSize: '11px',
                  color: '#1e293b',
                  padding: '10px 14px',
                }}
              />
              <Legend 
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
              />
              {merchants.map((merchant, index) => (
                <Area
                  key={merchant}
                  type="monotone"
                  dataKey={merchant}
                  name={merchant}
                  stroke={MERCHANT_COLORS[merchant] || DEFAULT_COLOR}
                  strokeWidth={4 - (index % 3) * 0.8}
                  strokeDasharray={getStrokeDasharray(index)}
                  fill={`url(#gradient-${merchant.replace(/\s+/g, '-')})`}
                  dot={{
                    r: getDotRadius(index),
                    strokeWidth: 1.5,
                    fill: 'white',
                    stroke: MERCHANT_COLORS[merchant] || DEFAULT_COLOR
                  }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  connectNulls={true}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
