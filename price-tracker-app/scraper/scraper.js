/**
 * Price Tracker Scraper — Phiên bản nguồn thật đã kiểm tra
 *
 * Nguồn đã xác nhận crawl được với giá thật:
 *   - CellphoneS    (cellphones.com.vn)
 *   - FPT Shop      (fptshop.com.vn)
 *   - ShopDunk      (shopdunk.com)  ← Apple Premium Reseller
 *   - PhuCanh       (phucanh.vn)   ← Chuỗi điện tử lớn
 *   - GearVN        (gearvn.com)   ← Gaming gear
 *   - Tin Học Ngôi Sao (tinhocngoisao.com) ← Gaming gear
 */

import 'dotenv/config';
import FirecrawlApp from '@mendable/firecrawl-js';

// =============================================
// CẤU HÌNH
// =============================================
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'local-no-key-needed';
const FIRECRAWL_API_URL = process.env.FIRECRAWL_API_URL || 'http://localhost:3002';
const BACKEND_INGEST_URL = process.env.BACKEND_INGEST_URL || 'http://localhost:8080/api/tracker/offers/ingest';
const DELAY_BETWEEN_REQUESTS_MS = 2500;

const app = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY, apiUrl: FIRECRAWL_API_URL });

// =============================================
// DANH SÁCH SẢN PHẨM — CHỈ URL ĐÃ KIỂM TRA CÒN HÀNG
// Nguồn: CellphoneS, FPT Shop, ShopDunk, PhuCanh, GearVN, Tin Học Ngôi Sao
// =============================================
const PRODUCTS = [

  // ══════════════════════════════════════════
  // ĐIỆN THOẠI (25 sản phẩm)
  // ══════════════════════════════════════════

  {
    name: "iPhone 16 Pro Max 256GB", brand: "Apple", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/iphone-16-pro-max.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/iphone-16-pro-max",
      "ShopDunk":    "https://shopdunk.com/iphone-16-pro-max",
      "PhuCanh":     "https://www.phucanh.vn/apple-iphone-16-pro-max-256gb.html"
    }
  },
  {
    name: "iPhone 16 Pro 256GB", brand: "Apple", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/iphone-16-pro.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/iphone-16-pro",
      "ShopDunk":    "https://shopdunk.com/iphone-16-pro",
      "PhuCanh":     "https://www.phucanh.vn/apple-iphone-16-pro-256gb.html"
    }
  },
  {
    name: "iPhone 16 Plus 128GB", brand: "Apple", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/iphone-16-plus.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/iphone-16-plus",
      "ShopDunk":    "https://shopdunk.com/iphone-16-plus",
      "PhuCanh":     "https://www.phucanh.vn/apple-iphone-16-plus-128gb.html"
    }
  },
  {
    name: "iPhone 16 128GB", brand: "Apple", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/iphone-16.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/iphone-16",
      "ShopDunk":    "https://shopdunk.com/iphone-16",
      "PhuCanh":     "https://www.phucanh.vn/apple-iphone-16-128gb.html"
    }
  },
  {
    name: "iPhone 15 Pro Max 256GB", brand: "Apple", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/iphone-15-pro-max.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/iphone-15-pro-max",
      "ShopDunk":    "https://shopdunk.com/iphone-15-pro-max",
      "PhuCanh":     "https://www.phucanh.vn/apple-iphone-15-pro-max-256gb.html"
    }
  },
  {
    name: "iPhone 15 Pro 128GB", brand: "Apple", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/iphone-15-pro.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/iphone-15-pro",
      "ShopDunk":    "https://shopdunk.com/iphone-15-pro",
      "PhuCanh":     "https://www.phucanh.vn/apple-iphone-15-pro-128gb.html"
    }
  },
  {
    name: "iPhone 15 128GB", brand: "Apple", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/iphone-15.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/iphone-15",
      "ShopDunk":    "https://shopdunk.com/iphone-15",
      "PhuCanh":     "https://www.phucanh.vn/apple-iphone-15-128gb.html"
    }
  },
  {
    name: "iPhone 14 Pro Max 128GB", brand: "Apple", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/iphone-14-pro-max.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/iphone-14-pro-max",
      "ShopDunk":    "https://shopdunk.com/iphone-14-pro-max",
      "PhuCanh":     "https://www.phucanh.vn/apple-iphone-14-pro-max-128gb.html"
    }
  },
  {
    name: "Samsung Galaxy S24 Ultra 256GB", brand: "Samsung", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/samsung-galaxy-s24-ultra.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/samsung-galaxy-s24-ultra",
      "PhuCanh":     "https://www.phucanh.vn/samsung-galaxy-s24-ultra-256gb.html"
    }
  },
  {
    name: "Samsung Galaxy S24 Plus 256GB", brand: "Samsung", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/samsung-galaxy-s24-plus.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/samsung-galaxy-s24-plus",
      "PhuCanh":     "https://www.phucanh.vn/samsung-galaxy-s24-plus-256gb.html"
    }
  },
  {
    name: "Samsung Galaxy S24 256GB", brand: "Samsung", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/samsung-galaxy-s24.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/samsung-galaxy-s24",
      "PhuCanh":     "https://www.phucanh.vn/samsung-galaxy-s24-256gb.html"
    }
  },
  {
    name: "Samsung Galaxy S23 Ultra 256GB", brand: "Samsung", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/samsung-galaxy-s23-ultra.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/samsung-galaxy-s23-ultra",
      "PhuCanh":     "https://www.phucanh.vn/samsung-galaxy-s23-ultra-256gb.html"
    }
  },
  {
    name: "Samsung Galaxy Z Fold6 256GB", brand: "Samsung", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/samsung-galaxy-z-fold-6.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/samsung-galaxy-z-fold-6",
      "PhuCanh":     "https://www.phucanh.vn/samsung-galaxy-z-fold6-256gb.html"
    }
  },
  {
    name: "Samsung Galaxy Z Flip6 256GB", brand: "Samsung", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/samsung-galaxy-z-flip-6.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/samsung-galaxy-z-flip-6",
      "PhuCanh":     "https://www.phucanh.vn/samsung-galaxy-z-flip6-256gb.html"
    }
  },
  {
    name: "Samsung Galaxy A55 128GB", brand: "Samsung", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/samsung-galaxy-a55.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/samsung-galaxy-a55",
      "PhuCanh":     "https://www.phucanh.vn/samsung-galaxy-a55-5g-128gb.html"
    }
  },
  {
    name: "Xiaomi 14 Ultra 512GB", brand: "Xiaomi", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/xiaomi-14-ultra.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/xiaomi-14-ultra",
      "PhuCanh":     "https://www.phucanh.vn/xiaomi-14-ultra-512gb.html"
    }
  },
  {
    name: "Xiaomi 14 256GB", brand: "Xiaomi", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/xiaomi-14.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/xiaomi-14",
      "PhuCanh":     "https://www.phucanh.vn/xiaomi-14-256gb.html"
    }
  },
  {
    name: "Xiaomi Redmi Note 13 Pro 256GB", brand: "Xiaomi", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/xiaomi-redmi-note-13-pro.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/redmi-note-13-pro",
      "PhuCanh":     "https://www.phucanh.vn/xiaomi-redmi-note-13-pro-256gb.html"
    }
  },
  {
    name: "Xiaomi Redmi 13C 128GB", brand: "Xiaomi", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/xiaomi-redmi-13c.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/xiaomi-redmi-13c",
      "PhuCanh":     "https://www.phucanh.vn/xiaomi-redmi-13c-128gb.html"
    }
  },
  {
    name: "Oppo Reno12 Pro 512GB", brand: "Oppo", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/oppo-reno-12-pro.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/oppo-reno-12-pro",
      "PhuCanh":     "https://www.phucanh.vn/oppo-reno12-pro-512gb.html"
    }
  },
  {
    name: "Realme GT6 256GB", brand: "Realme", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/realme-gt-6.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/realme-gt-6",
      "PhuCanh":     "https://www.phucanh.vn/realme-gt6-256gb.html"
    }
  },
  {
    name: "Asus ROG Phone 8 Pro 512GB", brand: "Asus", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/asus-rog-phone-8-pro.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/asus-rog-phone-8",
      "PhuCanh":     "https://www.phucanh.vn/asus-rog-phone-8-pro-512gb.html"
    }
  },
  {
    name: "OnePlus 12 256GB", brand: "OnePlus", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/oneplus-12.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/oneplus-12",
      "PhuCanh":     "https://www.phucanh.vn/oneplus-12-256gb.html"
    }
  },
  {
    name: "Vivo V30 Pro 512GB", brand: "Vivo", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/vivo-v30-pro.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/vivo-v30-pro",
      "PhuCanh":     "https://www.phucanh.vn/vivo-v30-pro-512gb.html"
    }
  },
  {
    name: "Oppo Find X7 Ultra 256GB", brand: "Oppo", category: "Điện thoại",
    urls: {
      "CellphoneS":  "https://cellphones.com.vn/oppo-find-x7-ultra.html",
      "FPT Shop":    "https://fptshop.com.vn/dien-thoai/oppo-find-x7-ultra",
      "PhuCanh":     "https://www.phucanh.vn/oppo-find-x7-ultra-256gb.html"
    }
  },

  // ══════════════════════════════════════════
  // CHUỘT GAMING (25 sản phẩm)
  // Nguồn: CellphoneS, GearVN, Tin Học Ngôi Sao, PhuCanh
  // ══════════════════════════════════════════

  {
    name: "Logitech G102 Lightsync RGB", brand: "Logitech", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-choi-game-logitech-g102-lightsync.html",
      "GearVN":             "https://gearvn.com/products/chuot-logitech-g102-lightsync-rgb-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-gaming-logitech-g102-gen-ii-lightsync-den",
      "PhuCanh":            "https://www.phucanh.vn/chuot-logitech-g102-lightsync-rgb-den.html"
    }
  },
  {
    name: "Logitech G304 Lightspeed Wireless", brand: "Logitech", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-khong-day-logitech-g304-lightspeed.html",
      "GearVN":             "https://gearvn.com/products/chuot-logitech-g304-lightspeed-wireless-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-logitech-g304-lightspeed",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-logitech-g304-lightspeed.html"
    }
  },
  {
    name: "Logitech G502 Hero High Performance", brand: "Logitech", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-logitech-g502-hero.html",
      "GearVN":             "https://gearvn.com/products/chuot-logitech-g502-hero",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-gaming-logitech-g502-hero",
      "PhuCanh":            "https://www.phucanh.vn/chuot-co-day-logitech-g502-hero.html"
    }
  },
  {
    name: "Logitech G502 X Plus Wireless", brand: "Logitech", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-logitech-g502-x-plus-wireless.html",
      "GearVN":             "https://gearvn.com/products/chuot-logitech-g502-x-plus-wireless",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-logitech-g502-x-plus-lightspeed",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-logitech-g502-x-plus-lightspeed.html"
    }
  },
  {
    name: "Logitech G Pro X Superlight 2", brand: "Logitech", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-logitech-g-pro-x-superlight-2.html",
      "GearVN":             "https://gearvn.com/products/chuot-logitech-g-pro-x-superlight-2-wireless-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-logitech-g-pro-x-superlight-2",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-logitech-g-pro-x-superlight-2.html"
    }
  },
  {
    name: "Logitech MX Master 3S Wireless", brand: "Logitech", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-khong-day-logitech-mx-master-3s.html",
      "GearVN":             "https://gearvn.com/products/chuot-logitech-mx-master-3s-wireless-graphite",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-logitech-mx-master-3s",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-logitech-mx-master-3s.html"
    }
  },
  {
    name: "Razer DeathAdder V3 Pro Wireless", brand: "Razer", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-razer-deathadder-v3-pro.html",
      "GearVN":             "https://gearvn.com/products/chuot-razer-deathadder-v3-pro-wireless-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-razer-deathadder-v3-pro",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-razer-deathadder-v3-pro.html"
    }
  },
  {
    name: "Razer Basilisk V3 Pro Wireless", brand: "Razer", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-razer-basilisk-v3-pro-wireless.html",
      "GearVN":             "https://gearvn.com/products/chuot-razer-basilisk-v3-pro-wireless",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-razer-basilisk-v3-pro",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-razer-basilisk-v3-pro.html"
    }
  },
  {
    name: "Razer Viper V3 HyperSpeed Wireless", brand: "Razer", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-razer-viper-v3-hyperspeed.html",
      "GearVN":             "https://gearvn.com/products/chuot-razer-viper-v3-hyperspeed-wireless",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-razer-viper-v3-hyperspeed",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-razer-viper-v3-hyperspeed.html"
    }
  },
  {
    name: "Razer Orochi V2 Mobile Wireless", brand: "Razer", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-razer-orochi-v2.html",
      "GearVN":             "https://gearvn.com/products/chuot-razer-orochi-v2-wireless-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-razer-orochi-v2",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-razer-orochi-v2.html"
    }
  },
  {
    name: "Razer Cobra Pro Wireless", brand: "Razer", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-razer-cobra-pro-wireless.html",
      "GearVN":             "https://gearvn.com/products/chuot-razer-cobra-pro-wireless",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-razer-cobra-pro",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-razer-cobra-pro.html"
    }
  },
  {
    name: "Razer DeathAdder Essential Wired", brand: "Razer", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-razer-deathadder-essential.html",
      "GearVN":             "https://gearvn.com/products/chuot-razer-deathadder-essential",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-gaming-razer-deathadder-essential",
      "PhuCanh":            "https://www.phucanh.vn/chuot-co-day-razer-deathadder-essential.html"
    }
  },
  {
    name: "Corsair Harpoon RGB Pro Wired", brand: "Corsair", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-corsair-harpoon-rgb-pro.html",
      "GearVN":             "https://gearvn.com/products/chuot-corsair-harpoon-rgb-pro",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-gaming-corsair-harpoon-rgb-pro",
      "PhuCanh":            "https://www.phucanh.vn/chuot-co-day-corsair-harpoon-rgb-pro.html"
    }
  },
  {
    name: "Corsair Dark Core RGB Pro Wireless", brand: "Corsair", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-corsair-dark-core-rgb-pro.html",
      "GearVN":             "https://gearvn.com/products/chuot-corsair-dark-core-rgb-pro-se-wireless",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-corsair-dark-core-rgb-pro",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-corsair-dark-core-rgb-pro.html"
    }
  },
  {
    name: "Corsair M65 RGB Ultra Elite", brand: "Corsair", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-corsair-m65-rgb-ultra.html",
      "GearVN":             "https://gearvn.com/products/chuot-corsair-m65-rgb-ultra-wireless",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-gaming-corsair-m65-rgb-ultra",
      "PhuCanh":            "https://www.phucanh.vn/chuot-gaming-corsair-m65-rgb-ultra.html"
    }
  },
  {
    name: "SteelSeries Rival 3 Wireless", brand: "SteelSeries", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-steelseries-rival-3-wireless.html",
      "GearVN":             "https://gearvn.com/products/chuot-steelseries-rival-3-wireless",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-steelseries-rival-3",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-steelseries-rival-3.html"
    }
  },
  {
    name: "SteelSeries Aerox 3 Wireless", brand: "SteelSeries", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-steelseries-aerox-3-wireless.html",
      "GearVN":             "https://gearvn.com/products/chuot-steelseries-aerox-3-wireless-onyx",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-steelseries-aerox-3",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-steelseries-aerox-3.html"
    }
  },
  {
    name: "SteelSeries Prime Wireless Gaming", brand: "SteelSeries", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-steelseries-prime-wireless.html",
      "GearVN":             "https://gearvn.com/products/chuot-steelseries-prime-wireless",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-steelseries-prime",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-steelseries-prime.html"
    }
  },
  {
    name: "Asus ROG Harpe Ace Aim Lab", brand: "Asus", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-asus-rog-harpe-ace-aim-lab.html",
      "GearVN":             "https://gearvn.com/products/chuot-gaming-khong-day-asus-rog-harpe-ace-aim-lab-edition",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-asus-rog-harpe-ace",
      "PhuCanh":            "https://www.phucanh.vn/chuot-gaming-asus-rog-harpe-ace.html"
    }
  },
  {
    name: "Asus TUF Gaming M3 Gen II", brand: "Asus", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-asus-tuf-gaming-m3-gen-ii.html",
      "GearVN":             "https://gearvn.com/products/chuot-asus-tuf-gaming-m3-gen-ii",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-gaming-asus-tuf-gaming-m3",
      "PhuCanh":            "https://www.phucanh.vn/chuot-gaming-asus-tuf-gaming-m3-gen-ii.html"
    }
  },
  {
    name: "Dareu EM901X RGB Wireless", brand: "Dareu", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-khong-day-dareu-em901x.html",
      "GearVN":             "https://gearvn.com/products/chuot-dareu-em901x-rgb-wireless-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-dareu-em901x",
      "PhuCanh":            "https://www.phucanh.vn/chuot-gaming-khong-day-dareu-em901x.html"
    }
  },
  {
    name: "Dareu A950 Alcantara Tri-mode", brand: "Dareu", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-khong-day-dareu-a950.html",
      "GearVN":             "https://gearvn.com/products/chuot-gaming-dareu-a950-wireless-docking-charger-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-dareu-a950",
      "PhuCanh":            "https://www.phucanh.vn/chuot-gaming-dareu-a950.html"
    }
  },
  {
    name: "Glorious Model O Wireless", brand: "Glorious", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-glorious-model-o-wireless.html",
      "GearVN":             "https://gearvn.com/products/chuot-glorious-model-o-wireless-matte-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-glorious-model-o",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-glorious-model-o.html"
    }
  },
  {
    name: "Glorious Model D Wireless", brand: "Glorious", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-gaming-glorious-model-d-wireless.html",
      "GearVN":             "https://gearvn.com/products/chuot-glorious-model-d-wireless-matte-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-glorious-model-d",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-glorious-model-d.html"
    }
  },
  {
    name: "Logitech Pebble M350 Silent", brand: "Logitech", category: "Chuột",
    urls: {
      "CellphoneS":         "https://cellphones.com.vn/chuot-khong-day-logitech-pebble-m350.html",
      "GearVN":             "https://gearvn.com/products/chuot-logitech-pebble-m350-black",
      "Tin Học Ngôi Sao":   "https://tinhocngoisao.com/products/chuot-khong-day-logitech-pebble-m350",
      "PhuCanh":            "https://www.phucanh.vn/chuot-khong-day-logitech-pebble-m350.html"
    }
  }
];

// Sinh mảng SCRAPE_TARGETS từ danh sách sản phẩm
const SCRAPE_TARGETS = [];
for (const p of PRODUCTS) {
  for (const [merchant, url] of Object.entries(p.urls)) {
    SCRAPE_TARGETS.push({
      merchantName: merchant,
      brand: p.brand,
      category: p.category,
      url: url,
      targetProductName: p.name
    });
  }
}

// =============================================
// TIỆN ÍCH
// =============================================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkUrlStatus(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(4000)
    });
    return res.status;
  } catch (err) {
    return 'ERROR';
  }
}

async function deleteOfferFromBackend(merchantName, targetProductName) {
  try {
    const deleteUrl = `${BACKEND_INGEST_URL.replace('/offers/ingest', '/offers')}?merchantName=${encodeURIComponent(merchantName)}&targetProductName=${encodeURIComponent(targetProductName)}`;
    const res = await fetch(deleteUrl, {
      method: 'DELETE'
    });
    if (res.ok) {
      console.log(`  🗑️  Đã xóa thành công offer lỗi của ${merchantName} cho ${targetProductName}`);
    } else {
      const text = await res.text();
      console.error(`  ❌ Lỗi xóa offer từ backend (${res.status}): ${text}`);
    }
  } catch (err) {
    console.error(`  ❌ Không kết nối được backend để xóa offer: ${err.message}`);
  }
}

async function scrapeProduct(target) {
  // Pre-check status
  const status = await checkUrlStatus(target.url);
  if (status === 404) {
    console.warn(`  ❌ Link trả về 404 khi check trước (HEAD/GET)`);
    return 'PRODUCT_NOT_FOUND_404';
  }

  try {
    console.log(`  🔍 Scraping: ${target.url}`);
    const result = await app.scrapeUrl(target.url, {
      formats: ['markdown']
    });

    const statusCode = result.statusCode || result.data?.statusCode;
    if (statusCode === 404) {
      console.warn(`  ❌ Link trả về 404 từ Firecrawl API`);
      return 'PRODUCT_NOT_FOUND_404';
    }

    if (result.success) {
      const md = result.markdown || result.data?.markdown || '';
      const ogImage = result.metadata?.ogImage || result.data?.metadata?.ogImage || null;
      if (md.length > 500) {
        return { markdown: md, ogImage };
      }
      console.warn(`  ⚠️  Nội dung quá ngắn (${md.length} chars), có thể bị block`);
      return null;
    }
    throw new Error('Scrape thất bại: ' + (result.error || 'unknown'));
  } catch (err) {
    console.error(`  ❌ Lỗi scrape: ${err.message}`);
    return null;
  }
}

async function sendToBackend(payload) {
  try {
    const rawIngestUrl = BACKEND_INGEST_URL + '-raw';
    const res = await fetch(rawIngestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      const fallbackFlag = data.isFallback ? ' [FALLBACK]' : ' ✅ THẬT';
      console.log(`  💾 Đã lưu: productId=${data.productId}, offerId=${data.offerId}${fallbackFlag}`);
      return { success: true, isFallback: data.isFallback };
    } else {
      const text = await res.text();
      // If backend throws PRODUCT_NOT_FOUND_404, we count it as skip/cleanup
      if (text.includes('PRODUCT_NOT_FOUND_404')) {
        console.warn(`  🗑️  Backend đã phát hiện 404 trong markdown và dọn dẹp`);
        return { success: false, is404: true };
      }
      console.error(`  ❌ Backend từ chối (${res.status}): ${text}`);
      return { success: false };
    }
  } catch (err) {
    console.error(`  ❌ Không kết nối được backend: ${err.message}`);
    return { success: false };
  }
}

// =============================================
// MAIN
// =============================================
async function runScraper() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   Price Tracker Scraper — Nguồn thật đã kiểm tra  ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(`📋 Tổng số mục: ${SCRAPE_TARGETS.length}`);
  console.log(`🔑 Firecrawl API: ${FIRECRAWL_API_URL}`);
  console.log(`🔗 Backend: ${BACKEND_INGEST_URL}-raw\n`);

  let successReal = 0;
  let successFallback = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < SCRAPE_TARGETS.length; i++) {
    const target = SCRAPE_TARGETS[i];
    console.log(`\n[${i + 1}/${SCRAPE_TARGETS.length}] ${target.merchantName} — ${target.brand} — ${target.category}`);

    const result = await scrapeProduct(target);

    if (result === 'PRODUCT_NOT_FOUND_404') {
      console.log(`  🗑️  Yêu cầu backend xóa offer lỗi (404)`);
      await deleteOfferFromBackend(target.merchantName, target.targetProductName);
      skipCount++;
    } else if (!result) {
      console.log(`  ⏭️  Bỏ qua (không có content)`);
      skipCount++;
    } else {
      const payload = {
        merchantName: target.merchantName,
        originalUrl: target.url,
        rawMarkdown: result.markdown,
        ogImage: result.ogImage,
        brand: target.brand,
        category: target.category,
        targetProductName: target.targetProductName
      };

      console.log(`  📦 Gửi backend...`);
      const backendRes = await sendToBackend(payload);
      if (backendRes.success) {
        if (backendRes.isFallback) successFallback++;
        else successReal++;
      } else {
        if (backendRes.is404) {
          skipCount++;
        } else {
          failCount++;
        }
      }
    }

    if (i < SCRAPE_TARGETS.length - 1) {
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log(`║  ✅ Thật: ${successReal}  ⚠️ Fallback: ${successFallback}  ⏭️ Bỏ qua: ${skipCount}  ❌ Lỗi: ${failCount}  ║`);
  console.log('╚═══════════════════════════════════════════════════╝');
}

runScraper();
