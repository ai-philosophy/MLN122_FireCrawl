'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ExternalLink, Award, ChevronDown, ChevronUp,
  ShoppingBag, Smartphone, Mouse, Store, TrendingDown, TrendingUp, ArrowLeftRight
} from 'lucide-react';
import PriceHistoryChart from '@/components/PriceHistoryChart';

const BACKEND = 'http://localhost:8080';

interface MerchantOffer {
  merchantName: string;
  merchantProductName: string;
  currentPrice: number;
  originalPrice: number;
  url: string;
  inStock: boolean;
  isFallback?: boolean;
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'merchant'>('price_asc');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${BACKEND}/api/tracker/products/${id}`);
        if (!res.ok) throw new Error();
        setProduct(await res.json());
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #7c3aed', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#9ca3af', fontSize: 13 }}>Đang tải thông tin sản phẩm...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ fontSize: 18, color: '#9ca3af' }}>Không tìm thấy sản phẩm</p>
      <Link href="/" style={{ color: '#7c3aed', fontWeight: 700, marginTop: 12, display: 'inline-block' }}>← Quay lại</Link>
    </div>
  );

  const offers = [...(product.offers || [])];
  if (sortBy === 'price_asc') offers.sort((a, b) => a.currentPrice - b.currentPrice);
  if (sortBy === 'price_desc') offers.sort((a, b) => b.currentPrice - a.currentPrice);
  if (sortBy === 'merchant') offers.sort((a, b) => a.merchantName.localeCompare(b.merchantName));

  const cheapest = offers.reduce((m, o) => o.currentPrice < m.currentPrice ? o : m, offers[0]);
  const priceDiff = offers.length > 1 ? Math.max(...offers.map(o => o.currentPrice)) - Math.min(...offers.map(o => o.currentPrice)) : 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
          borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white',
          fontSize: 13, fontWeight: 600, color: '#4b5563', cursor: 'pointer',
        }}>
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span style={{ color: '#d1d5db' }}>›</span>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>{product.category}</span>
        <span style={{ color: '#d1d5db' }}>›</span>
        <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 28 }}>

        {/* Left: Product image + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Image card */}
          <div style={{
            background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
            borderRadius: 20, padding: 32, border: '1px solid rgba(124,58,237,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260,
          }}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name}
                style={{ maxHeight: 220, maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#c4b5fd', opacity: 0.5 }}>
                {product.category === 'Điện thoại' ? <Smartphone size={80} strokeWidth={1} /> : <Mouse size={80} strokeWidth={1} />}
              </div>
            )}
          </div>

          {/* Info card */}
          <div style={{
            background: 'white', borderRadius: 18, padding: '20px',
            border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <span style={{
                background: 'rgba(124,58,237,0.1)', color: '#7c3aed',
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{product.brand}</span>
              <span style={{
                background: 'rgba(79,70,229,0.08)', color: '#4f46e5',
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{product.category}</span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1e1b4b', lineHeight: 1.35, marginBottom: 16 }}>
              {product.name}
            </h1>

            {/* Price summary */}
            {cheapest && (
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                borderRadius: 14, padding: '14px 16px', color: 'white',
              }}>
                <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>GIÁ TỐT NHẤT</div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{formatVND(cheapest.currentPrice)}</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>tại {cheapest.merchantName}</div>
              </div>
            )}

          </div>
        </div>

        {/* Right: Offers table + chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Offers table */}
          <div style={{
            background: 'white',
            borderRadius: 24,
            padding: '28px',
            border: '1px solid rgba(124,58,237,0.08)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Store size={18} color="#7c3aed" /> So sánh giá tại các cửa hàng
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { key: 'price_asc', label: '↑ Giá thấp' },
                  { key: 'price_desc', label: '↓ Giá cao' },
                  { key: 'merchant', label: 'Tên A-Z' },
                ].map(s => (
                  <button key={s.key} onClick={() => setSortBy(s.key as any)} style={{
                    padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                    border: '1.5px solid', cursor: 'pointer',
                    borderColor: sortBy === s.key ? '#7c3aed' : '#f1f5f9',
                    background: sortBy === s.key ? '#7c3aed' : '#fafafa',
                    color: sortBy === s.key ? 'white' : '#64748b',
                    transition: 'all 0.2s',
                  }}>{s.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {offers.map((offer, idx) => {
                const isBest = offer.currentPrice === cheapest?.currentPrice;
                const diff = cheapest ? offer.currentPrice - cheapest.currentPrice : 0;
                const diffPct = cheapest && diff > 0 ? ((diff / cheapest.currentPrice) * 100).toFixed(0) : null;
                const gradientBg = MERCHANT_GRADIENTS[offer.merchantName] || 'linear-gradient(135deg, #a78bfa, #7c3aed)';
                const discount = offer.originalPrice > offer.currentPrice
                  ? ((offer.originalPrice - offer.currentPrice) / offer.originalPrice * 100).toFixed(0) : null;
                const merchantInitial = offer.merchantName.charAt(0);

                return (
                  <div key={idx} className={isBest ? 'merchant-best-row' : 'merchant-row'} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px', borderRadius: 18,
                    flexWrap: 'wrap',
                  }}>
                    {/* Rank Indicator */}
                    <div style={{ flexShrink: 0 }}>
                      {isBest ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#fef08a',
                          color: '#ca8a04',
                          boxShadow: '0 2px 6px rgba(250, 204, 21, 0.2)',
                        }}>
                          <Award size={13} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                        }}>
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Merchant Avatar logo */}
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: gradientBg,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 15,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                      flexShrink: 0,
                    }}>
                      {merchantInitial}
                    </div>

                    {/* Store details */}
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#1e1b4b' }}>
                          {offer.merchantName}
                        </span>
                        {isBest && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: 99,
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            Rẻ nhất 🏆
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {offer.merchantProductName}
                      </div>
                    </div>

                    {/* Stock Status Badge */}
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 99,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: offer.inStock ? '#ecfdf5' : '#fef2f2',
                        color: offer.inStock ? '#059669' : '#dc2626',
                        border: `1px solid ${offer.inStock ? '#d1fae5' : '#fee2e2'}`,
                      }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: offer.inStock ? '#10b981' : '#ef4444',
                        }} />
                        {offer.inStock ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </div>

                    {/* Price and discount column */}
                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 120 }}>
                      {discount && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{
                            fontSize: 9,
                            background: '#fee2e2',
                            color: '#ef4444',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 6,
                          }}>
                            -{discount}%
                          </span>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: 11 }}>
                            {formatVND(offer.originalPrice)}
                          </span>
                        </div>
                      )}
                      <div style={{ fontSize: 18, fontWeight: 900, color: isBest ? '#059669' : '#1e1b4b' }}>
                        {formatVND(offer.currentPrice)}
                      </div>
                      {diffPct && (
                        <div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: 9,
                            color: '#e11d48',
                            fontWeight: 800,
                            marginTop: 2,
                            background: '#fff1f2',
                            padding: '2px 8px',
                            borderRadius: 99,
                            border: '1px solid #ffe4e6',
                          }}>
                            +{diffPct}% so với rẻ nhất
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Link button to buy */}
                    <a href={offer.url} target="_blank" rel="noopener noreferrer" className="btn-visit" style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: '1.5px solid #e2e8f0',
                      background: 'white',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: 11,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0,
                    }}>
                      Mua ngay <ExternalLink size={12} />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price history chart */}
          <div style={{
            background: 'white', borderRadius: 20, padding: '24px',
            border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e1b4b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="#7c3aed" /> Lịch sử giá
            </h2>
            <PriceHistoryChart productId={product.id} backendUrl={BACKEND} />
          </div>
        </div>
      </div>
    </div>
  );
}
