/**
 * Scheduler — Tự động chạy scraper mỗi ngày lúc 2:00 AM
 * 
 * Chạy: npm run scrape:schedule
 */

import 'dotenv/config'; // Load file .env tự động
import cron from 'node-cron';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🕐 Scheduler đang chạy...');
console.log('📅 Lịch: Mỗi ngày lúc 00:00 AM (nửa đêm)');
console.log('   (Cron expression: 0 0 * * *)\n');

// Chạy ngay một lần khi khởi động để test
console.log('▶️  Chạy lần đầu tiên ngay bây giờ...\n');
try {
  execSync('node scraper.js', { stdio: 'inherit', cwd: __dirname });
} catch (err) {
  console.error('❌ Lỗi khi chạy scraper lần đầu:', err.message);
}

// Lập lịch cào tự động mỗi ngày lúc 00:00 AM
cron.schedule('0 0 * * *', () => {
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  console.log(`\n⏰ [${now}] Bắt đầu cào dữ liệu theo lịch...`);
  
  try {
    execSync('node scraper.js', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Cào dữ liệu theo lịch hoàn thành!');
  } catch (err) {
    console.error('❌ Lỗi khi cào dữ liệu theo lịch:', err.message);
  }
}, {
  timezone: 'Asia/Ho_Chi_Minh'
});

console.log('✅ Scheduler đã sẵn sàng. Để tắt, nhấn Ctrl+C\n');
