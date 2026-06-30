import 'dotenv/config';
import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || 'fc-a52add45aaff48a789dc4e13371af13a',
  apiUrl: process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev'
});

async function test() {
  const url = 'https://cellphones.com.vn/chuot-gaming-logitech-g102.html';
  console.log("Scraping:", url);
  const result = await app.scrapeUrl(url, { formats: ['markdown'] });
  if (result.success) {
    const md = result.markdown || '';
    console.log("Markdown length:", md.length);
    
    // Find all images matching (http...)
    const imgReg = /!\[.*?\]\((https?:\/\/.*?)\)/g;
    let match;
    console.log("\n--- Images found: ---");
    while ((match = imgReg.exec(md)) !== null) {
      console.log(match[1]);
    }
  } else {
    console.log("Error:", result.error);
  }
}

test();
