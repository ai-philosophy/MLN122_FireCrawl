'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Smartphone, Mouse, SlidersHorizontal, Tag, Star, ArrowRight, Store } from 'lucide-react';
import ProductImage from '../components/ProductImage';

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  lowestPrice?: number;
  highestPrice?: number;
  offerCount?: number;
}

const BACKEND = 'http://localhost:8080';

const CATEGORIES = ['Tất cả', 'Điện thoại', 'Chuột'];
const BRANDS_PHONE = ['Tất cả', 'Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Realme', 'Asus', 'Vivo', 'OnePlus'];
const BRANDS_MOUSE = ['Tất cả', 'Logitech', 'Razer', 'Corsair', 'SteelSeries', 'Asus', 'Dareu', 'Glorious'];

function formatVND(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + ' tr₫';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k₫';
  return n + '₫';
}

function ProductCard({ product }: { product: Product }) {
  const savings = product.highestPrice && product.lowestPrice
    ? product.highestPrice - product.lowestPrice : 0;

  return (
    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="card-hover" style={{
        background: 'white', borderRadius: 18, border: '1px solid rgba(124,58,237,0.1)',
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
      }}>
        {/* Image */}
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
          height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, position: 'relative',
        }}>
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            category={product.category}
            iconSize={64}
            style={{ maxHeight: 140, maxWidth: '100%', objectFit: 'contain' }}
          />
          {/* Category badge */}
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(124,58,237,0.12)', color: '#7c3aed',
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {product.category === 'Điện thoại' ? '📱' : '🖱️'} {product.category}
          </span>
          {savings > 0 && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              background: '#059669', color: 'white',
              fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 99,
            }}>
              Tiết kiệm {formatVND(savings)}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>
            {product.brand.toUpperCase()}
          </div>
          <h3 style={{
            fontSize: 13, fontWeight: 700, color: '#1e1b4b',
            lineHeight: 1.4, marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.name}
          </h3>

          {/* Price range */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>GIÁ TỪ</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>
                {product.lowestPrice ? formatVND(product.lowestPrice) : '—'}
              </div>
            </div>
            {product.offerCount && product.offerCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#f5f3ff', padding: '4px 10px', borderRadius: 99,
                fontSize: 11, fontWeight: 600, color: '#6d28d9',
              }}>
                <Store size={12} />
                {product.offerCount} nền tảng
              </div>
            )}
          </div>

          {/* CTA */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: 'white', fontSize: 12, fontWeight: 700,
          }}>
            <span>Xem & So sánh giá</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [brand, setBrand] = useState('Tất cả');

  const fetchProducts = useCallback(async (q: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND}/api/tracker/products/search?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data: Product[] = await res.json();

      // Enrich with price data
      const enriched = await Promise.all(data.map(async (p) => {
        try {
          const r = await fetch(`${BACKEND}/api/tracker/products/${p.id}`);
          if (!r.ok) return p;
          const detail = await r.json();
          const prices = (detail.offers || []).map((o: any) => o.currentPrice).filter(Boolean);
          return {
            ...p,
            lowestPrice: prices.length ? Math.min(...prices) : undefined,
            highestPrice: prices.length ? Math.max(...prices) : undefined,
            offerCount: prices.length,
          };
        } catch { return p; }
      }));
      setProducts(enriched);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(''); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const filtered = products.filter(p => {
    if (category !== 'Tất cả' && p.category !== category) return false;
    if (brand !== 'Tất cả' && p.brand !== brand) return false;
    return true;
  });

  const brands = category === 'Chuột' ? BRANDS_MOUSE : category === 'Điện thoại' ? BRANDS_PHONE : ['Tất cả'];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Hero */}
      <div style={{
        borderRadius: 24,
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)',
        padding: '48px 40px', marginBottom: 40, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 280, height: 280,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: 200, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{ position: 'relative', maxWidth: 600 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)', borderRadius: 99,
            padding: '4px 12px', marginBottom: 16, fontSize: 11, fontWeight: 700,
            color: 'rgba(255,255,255,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <Star size={11} fill="white" /> Dữ liệu giá thật từ các nền tảng lớn
          </div>
          <h1 style={{
            fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1.2,
            marginBottom: 14, letterSpacing: '-0.5px',
          }}>
            So sánh giá <br />thông minh hơn
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 28, lineHeight: 1.6 }}>
            Theo dõi giá điện thoại, chuột gaming từ CellphoneS, FPT Shop, ShopDunk, PhuCanh, GearVN — cập nhật tự động.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, maxWidth: 480 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} color="rgba(255,255,255,0.6)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm sản phẩm... (iPhone 16, Logitech G502...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px 12px 40px',
                  borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.15)', color: 'white',
                  fontSize: 13, outline: 'none', backdropFilter: 'blur(8px)',
                }}
              />
            </div>
            <button type="submit" style={{
              padding: '12px 20px', borderRadius: 12, border: 'none',
              background: 'white', color: '#7c3aed', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap',
      }}>
        {[
          { label: 'Sản phẩm', value: products.length, icon: '📦' },
          { label: 'Nền tảng', value: 6, icon: '🏪' },
          { label: 'Điện thoại', value: products.filter(p => p.category === 'Điện thoại').length, icon: '📱' },
          { label: 'Chuột gaming', value: products.filter(p => p.category === 'Chuột').length, icon: '🖱️' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 120, background: 'white', borderRadius: 14,
            padding: '14px 20px', border: '1px solid rgba(124,58,237,0.1)',
            boxShadow: '0 2px 8px rgba(124,58,237,0.05)',
          }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b', lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c3aed', fontWeight: 700, fontSize: 13 }}>
          <SlidersHorizontal size={15} /> Lọc:
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setBrand('Tất cả'); }} style={{
              padding: '6px 14px', borderRadius: 99, border: '1.5px solid',
              borderColor: category === c ? '#7c3aed' : '#e5e7eb',
              background: category === c ? '#7c3aed' : 'white',
              color: category === c ? 'white' : '#6b7280',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {c}
            </button>
          ))}
        </div>

        {/* Brand filter */}
        {category !== 'Tất cả' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {brands.map(b => (
              <button key={b} onClick={() => setBrand(b)} style={{
                padding: '5px 12px', borderRadius: 99, border: '1.5px solid',
                borderColor: brand === b ? '#4f46e5' : '#e5e7eb',
                background: brand === b ? '#4f46e5' : 'white',
                color: brand === b ? 'white' : '#6b7280',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                {b}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
          {filtered.length} sản phẩm
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid #f3f0ff' }}>
              <div className="skeleton" style={{ height: 180 }} />
              <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 10, marginBottom: 8, width: '40%' }} />
                <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 36 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', color: '#9ca3af',
        }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 600 }}>Không tìm thấy sản phẩm nào</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 20,
        }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
