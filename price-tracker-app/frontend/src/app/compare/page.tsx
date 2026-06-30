'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight, Search, Plus, X, ChevronDown, Award,
  ExternalLink, TrendingDown, Store, BarChart2, ArrowRight, Smartphone
} from 'lucide-react';
import ProductImage from '@/components/ProductImage';

const BACKEND = 'http://localhost:8080';

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
}

interface MerchantOffer {
  merchantName: string;
  merchantProductName: string;
  currentPrice: number;
  originalPrice: number;
  url: string;
  inStock: boolean;
}

interface ProductDetails {
  id: number;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  offers: MerchantOffer[];
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

const ALL_MERCHANTS = ['CellphoneS', 'FPT Shop', 'ShopDunk', 'PhuCanh', 'GearVN', 'Phong Vũ', 'Tin Học Ngôi Sao'];

const MERCHANT_COLORS: Record<string, string> = {
  'CellphoneS': '#e11d48',
  'FPT Shop': '#f97316',
  'ShopDunk': '#7c3aed',
  'PhuCanh': '#0ea5e9',
  'GearVN': '#10b981',
  'Phong Vũ': '#f59e0b',
  'Tin Học Ngôi Sao': '#6366f1',
};

const MERCHANT_GRADIENTS: Record<string, string> = {
  'CellphoneS': 'linear-gradient(135deg, #f43f5e, #e11d48)',
  'FPT Shop': 'linear-gradient(135deg, #ff7e40, #f97316)',
  'ShopDunk': 'linear-gradient(135deg, #a78bfa, #7c3aed)',
  'PhuCanh': 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
  'GearVN': 'linear-gradient(135deg, #34d399, #10b981)',
  'Phong Vũ': 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  'Tin Học Ngôi Sao': 'linear-gradient(135deg, #818cf8, #6366f1)',
};

export default function ComparePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [productDetails, setProductDetails] = useState<Map<number, ProductDetails>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [showTopSearch, setShowTopSearch] = useState(false);
  const [showCardSearch, setShowCardSearch] = useState(false);

  // Load all products for search
  useEffect(() => {
    fetch(`${BACKEND}/api/tracker/products/search?query=`)
      .then(r => r.json())
      .then(setAllProducts)
      .catch(() => {});
  }, []);

  // Load details for selected products
  const loadDetail = useCallback(async (id: number) => {
    if (productDetails.has(id)) return;
    try {
      const res = await fetch(`${BACKEND}/api/tracker/products/${id}`);
      if (!res.ok) return;
      const data: ProductDetails = await res.json();
      setProductDetails(prev => new Map(prev).set(id, data));
    } catch {}
  }, [productDetails]);

  useEffect(() => {
    selectedIds.forEach(id => loadDetail(id));
  }, [selectedIds]);

  const addProduct = (id: number) => {
    if (selectedIds.includes(id) || selectedIds.length >= 4) return;
    setSelectedIds(prev => [...prev, id]);
    setShowTopSearch(false);
    setShowCardSearch(false);
    setSearchQuery('');
  };

  const removeProduct = (id: number) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
    setProductDetails(prev => { const m = new Map(prev); m.delete(id); return m; });
  };

  const selected = selectedIds.map(id => productDetails.get(id)).filter(Boolean) as ProductDetails[];

  const filteredProducts = allProducts.filter(p =>
    !selectedIds.includes(p.id) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCheapest = (product: ProductDetails) => {
    const offers = product.offers || [];
    if (!offers.length) return null;
    return offers.reduce((m, o) => o.currentPrice < m.currentPrice ? o : m, offers[0]);
  };

  // Find the absolute lowest price across all compared products
  const lowestOverallPrice = selected.reduce((min, p) => {
    const bestOffer = getCheapest(p);
    if (!bestOffer) return min;
    return min === null || bestOffer.currentPrice < min ? bestOffer.currentPrice : min;
  }, null as number | null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 md:p-10 shadow-xl shadow-indigo-150/30 mb-8 border border-white/10">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-black/10">
              <ArrowLeftRight size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                So sánh giá đa nền tảng
              </h1>
              <p className="text-violet-100/90 text-sm mt-1 max-w-xl font-medium">
                Chọn tối đa 4 sản phẩm để đối chiếu trực quan, tìm ra nền tảng cung cấp sản phẩm có giá bán tốt nhất.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selector Top Bar */}
      {selected.length > 0 && (
        <div className="relative z-20 flex items-center justify-between gap-4 mb-8 bg-white border border-slate-150 shadow-sm rounded-2xl p-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Sản phẩm:</span>
            {selected.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-violet-50/80 hover:bg-violet-100/50 border border-violet-100 rounded-full pl-3 pr-2 py-1 transition-all">
                <ProductImage src={p.imageUrl} alt="" category={p.category} className="w-5 h-5 object-contain" iconSize={12} />
                <span className="text-xs font-bold text-violet-900 max-w-[120px] truncate">{p.name}</span>
                <button 
                  onClick={() => removeProduct(p.id)} 
                  className="text-violet-400 hover:text-rose-600 transition-colors p-0.5 rounded-full hover:bg-rose-50 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {selectedIds.length < 4 && (
            <div className="relative">
              <button 
                onClick={() => setShowTopSearch(!showTopSearch)} 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold cursor-pointer transition-all duration-200 shadow-sm"
              >
                <Plus size={14} /> Thêm sản phẩm
              </button>

              {showTopSearch && (
                <div className="absolute top-full right-0 mt-3 z-50 bg-white/95 backdrop-blur-xl rounded-2xl border border-violet-100 shadow-2xl w-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3.5 border-b border-slate-100 relative">
                    <Search size={16} className="text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200/80 focus:border-violet-400 text-sm text-slate-800 outline-none transition-all"
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-50">
                    {filteredProducts.slice(0, 20).map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => addProduct(p.id)} 
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-violet-50/50 cursor-pointer transition-all duration-150 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-50 p-1 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <ProductImage src={p.imageUrl} alt="" category={p.category} className="max-w-full max-h-full object-contain" iconSize={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            {p.brand} · {p.category}
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        Không tìm thấy sản phẩm phù hợp
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selected.length === 0 ? (
        /* Empty State with integrated search box */
        <div className="text-center py-16 px-8 bg-white rounded-3xl border border-violet-100 shadow-xl shadow-slate-100/50 max-w-xl mx-auto mt-6">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6 text-violet-600 shadow-inner">
            <ArrowLeftRight size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-2">
            Bắt đầu so sánh giá
          </h2>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-8 leading-relaxed font-medium">
            Tìm kiếm sản phẩm bên dưới để thêm vào danh sách đối chiếu giá bán thực tế giữa các sàn lớn.
          </p>
          
          <div className="relative max-w-md mx-auto mb-6">
            <div className="relative">
              <Search size={16} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm và thêm sản phẩm... (iPhone, G502...)"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowTopSearch(true);
                }}
                onFocus={() => setShowTopSearch(true)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-2xl border border-slate-200 focus:border-violet-400 text-sm text-slate-800 outline-none transition-all shadow-inner"
              />
            </div>
            
            {showTopSearch && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden max-h-64 overflow-y-auto text-left">
                {filteredProducts.slice(0, 10).map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => addProduct(p.id)} 
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-violet-50/50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                  >
                    <ProductImage src={p.imageUrl} alt="" category={p.category} className="w-8 h-8 object-contain" iconSize={16} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.brand} · {p.category}</div>
                    </div>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="py-6 text-center text-slate-400 text-xs font-medium">
                    Không tìm thấy sản phẩm
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 font-semibold">
            Hoặc <Link href="/" className="text-violet-600 hover:underline">Xem tất cả sản phẩm →</Link>
          </div>
        </div>
      ) : (
        /* Comparison Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {selected.map(p => {
            const best = getCheapest(p);
            const isOverallCheapest = lowestOverallPrice !== null && best !== null && best.currentPrice === lowestOverallPrice;

            return (
              <div 
                key={p.id} 
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 group ${
                  isOverallCheapest 
                    ? 'bg-gradient-to-b from-emerald-50/10 via-white to-white border-2 border-emerald-400 shadow-xl shadow-emerald-100/50' 
                    : 'bg-white border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:border-violet-200/60'
                }`}
              >
                
                {/* Cheapest Ribbons */}
                {isOverallCheapest && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black px-3.5 py-1 rounded-full shadow-md shadow-emerald-100 uppercase tracking-widest border border-emerald-300 z-10 flex items-center gap-1 animate-pulse">
                    <span>🔥 Tiết kiệm nhất</span>
                  </div>
                )}

                {/* Delete button */}
                <button 
                  onClick={() => removeProduct(p.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-450 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer z-10"
                >
                  <X size={14} />
                </button>

                <div>
                  {/* Product Header */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative w-28 h-28 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                      <ProductImage src={p.imageUrl} alt={p.name} category={p.category} className="max-h-full max-w-full object-contain" iconSize={56} />
                    </div>
                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                      {p.brand}
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-relaxed px-2 min-h-[36px]">
                      {p.name}
                    </h3>
                  </div>

                  {/* Best Price Callout */}
                  <div className="mb-6">
                    {best ? (
                      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 text-white text-center shadow-md shadow-indigo-100/40">
                        <div className="text-[10px] text-violet-200 font-extrabold tracking-wider uppercase mb-1">
                          Giá tốt nhất
                        </div>
                        <div className="text-xl font-black tracking-tight">
                          {formatVND(best.currentPrice)}
                        </div>
                        <div className="text-[10px] text-violet-100/90 font-bold mt-1">
                          tại {best.merchantName}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl py-5 text-center text-xs font-semibold">
                        Không có thông tin giá
                      </div>
                    )}
                  </div>

                  {/* Store Offers Stack */}
                  <div className="flex flex-col gap-3">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      Giá từ các cửa hàng
                    </div>
                    {p.offers && p.offers.length > 0 ? (
                      [...p.offers]
                        .sort((a, b) => a.currentPrice - b.currentPrice)
                        .map((offer, idx) => {
                          const isCheapest = offer.currentPrice === best?.currentPrice;
                          const diff = best && !isCheapest ? offer.currentPrice - best.currentPrice : 0;
                          const diffPct = best && diff > 0 ? ((diff / best.currentPrice) * 100).toFixed(0) : null;
                          const color = MERCHANT_COLORS[offer.merchantName] || '#7c3aed';
                          
                          return (
                            <div 
                              key={idx} 
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                                isCheapest 
                                  ? 'bg-emerald-50/20 border-emerald-200/50 shadow-sm' 
                                  : 'bg-slate-50/40 border-slate-100/60 hover:bg-slate-50 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Merchant letter avatar */}
                                <div 
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-sm"
                                  style={{ background: MERCHANT_GRADIENTS[offer.merchantName] || color }}
                                >
                                  {offer.merchantName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-extrabold text-slate-700 truncate">
                                    {offer.merchantName}
                                  </div>
                                  <div className="mt-0.5">
                                    <span className={`inline-flex items-center gap-0.5 text-[8px] font-bold ${
                                      offer.inStock ? 'text-emerald-600' : 'text-rose-500'
                                    }`}>
                                      <span className={`w-1 h-1 rounded-full ${offer.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                      {offer.inStock ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="flex items-center justify-end gap-1">
                                  <span className={`text-xs font-extrabold tracking-tight ${
                                    isCheapest ? 'text-emerald-600 font-black' : 'text-slate-800'
                                  }`}>
                                    {formatVND(offer.currentPrice)}
                                  </span>
                                  {isCheapest && <span className="text-[10px]">🏆</span>}
                                </div>
                                
                                {diffPct && (
                                  <span className="inline-block text-[8px] text-rose-600 bg-rose-50 border border-rose-100 font-bold px-1 rounded mt-0.5">
                                    +{diffPct}%
                                  </span>
                                )}
                                
                                {offer.originalPrice > offer.currentPrice && (
                                  <div className="text-[9px] text-slate-400 line-through decoration-slate-350 font-medium">
                                    {formatVND(offer.originalPrice)}
                                  </div>
                                )}

                                <div>
                                  <a 
                                    href={offer.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[9px] font-bold text-violet-650 hover:text-violet-850 hover:underline mt-1"
                                  >
                                    Mua ngay <ExternalLink size={8} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-8 text-slate-350 text-xs font-semibold">
                        Không có dữ liệu
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}

          {/* Dash additions card in grid */}
          {selectedIds.length < 4 && (
            <div className="relative bg-slate-50/50 hover:bg-violet-50/10 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px] transition-all duration-300">
              <button 
                onClick={() => setShowCardSearch(!showCardSearch)} 
                className="flex flex-col items-center gap-3 cursor-pointer group focus:outline-none"
              >
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-violet-600 shadow-sm group-hover:scale-110 transition-transform duration-200 shadow-slate-100/50">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-bold text-slate-500 group-hover:text-violet-600 transition-colors">
                  Thêm sản phẩm so sánh
                </span>
              </button>

              {showCardSearch && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl border border-violet-100 shadow-2xl w-80 overflow-hidden animate-in scale-in duration-200">
                  <div className="p-3 border-b border-slate-100 relative">
                    <Search size={14} className="text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 focus:border-violet-400 text-xs text-slate-850 outline-none transition-all"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1 divide-y divide-slate-50">
                    {filteredProducts.slice(0, 10).map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => addProduct(p.id)} 
                        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-violet-50/50 cursor-pointer transition-colors"
                      >
                        <ProductImage src={p.imageUrl} alt="" category={p.category} className="w-7 h-7 object-contain" iconSize={14} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-850 truncate">{p.name}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{p.brand}</div>
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="py-6 text-center text-slate-400 text-xs font-medium">
                        Không tìm thấy sản phẩm
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
