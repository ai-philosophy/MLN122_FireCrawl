/**
 * Database Seeder - Khởi tạo dữ liệu mẫu cho toàn bộ sản phẩm và cửa hàng
 *
 * Chạy: node seed-database.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scraperPath = path.join(__dirname, 'scraper.js');
const BACKEND_INGEST_URL = 'http://localhost:8080/api/tracker/offers/ingest-raw';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('📖 Đang đọc danh sách sản phẩm từ scraper.js...');
  if (!fs.existsSync(scraperPath)) {
    console.error('❌ Không tìm thấy file scraper.js!');
    return;
  }

  const content = fs.readFileSync(scraperPath, 'utf8');
  
  // Trích xuất mảng PRODUCTS từ scraper.js
  const startIdx = content.indexOf('const PRODUCTS = [');
  if (startIdx === -1) {
    console.error('❌ Không tìm thấy mảng PRODUCTS trong scraper.js!');
    return;
  }

  // Tìm dấu đóng ngoặc của mảng PRODUCTS ];
  const endMarker = '\n];';
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    console.error('❌ Không tìm thấy điểm kết thúc của mảng PRODUCTS!');
    return;
  }

  const productsArrayStr = content.substring(startIdx, endIdx + endMarker.length);
  
  // Viết ra file tạm thời để import động
  const tempFilePath = path.join(__dirname, 'temp-products.js');
  fs.writeFileSync(tempFilePath, `${productsArrayStr}\nexport { PRODUCTS };\n`);

  console.log('⚡ Đang import danh sách sản phẩm...');
  const { PRODUCTS } = await import('./temp-products.js');
  
  // Xóa file tạm thời
  try {
    fs.unlinkSync(tempFilePath);
  } catch (e) {}

  console.log(`📋 Đã tải thành công ${PRODUCTS.length} sản phẩm.`);
  console.log('🚀 Bắt đầu gửi yêu cầu tạo dữ liệu mẫu (fallback) về Backend...');

  let totalIngested = 0;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    console.log(`\n[${i + 1}/${PRODUCTS.length}] Đang xử lý: ${p.name} (${p.brand} - ${p.category})`);

    const merchants = Object.keys(p.urls);
    for (const merchant of merchants) {
      const url = p.urls[merchant];
      const payload = {
        merchantName: merchant,
        originalUrl: url,
        rawMarkdown: 'FAILED_TO_CRAWL_CLOUDFLARE_OR_TIMEOUT', // Kích hoạt cơ chế fallback của Backend
        brand: p.brand,
        category: p.category,
        targetProductName: p.name
      };

      try {
        const res = await fetch(BACKEND_INGEST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          console.log(`  ✅ [${merchant}] Đã nạp thành công giá Ước lượng.`);
          successCount++;
        } else {
          const text = await res.text();
          console.error(`  ❌ [${merchant}] Lỗi (${res.status}): ${text}`);
          failCount++;
        }
      } catch (err) {
        console.error(`  ❌ [${merchant}] Không kết nối được API: ${err.message}`);
        failCount++;
      }
      totalIngested++;
      // Nghỉ 50ms để tránh quá tải backend
      await delay(50);
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log(`║  Hoàn thành Seeding! Tổng cộng: ${totalIngested} liên kết.                  ║`);
  console.log(`║  ✅ Thành công: ${successCount}  |  ❌ Thất bại: ${failCount}                          ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
}

main().catch(err => console.error('❌ Lỗi:', err));
