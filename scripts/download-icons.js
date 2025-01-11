const https = require('https');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const baseUrl = 'https://cdn-icons-png.flaticon.com/128/2979/2979415.png';

function downloadIcon(size) {
  console.log(`Starting download for ${size}px icon...`);
  const filePath = path.join(__dirname, '..', 'images', `icon${size}.png`);
  
  return new Promise((resolve, reject) => {
    const request = https.get(baseUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download icon: ${response.statusCode}`));
        return;
      }
      
      console.log(`Got response for ${size}px icon, writing file...`);
      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Created ${size}px icon successfully`);
        resolve();
      });
      
      file.on('error', (err) => {
        console.error(`Error writing ${size}px icon:`, err.message);
        fs.unlink(filePath, () => {});
        reject(err);
      });

      response.on('error', (err) => {
        console.error(`Error downloading ${size}px icon:`, err.message);
        reject(err);
      });
    });

    // 添加请求错误处理
    request.on('error', (err) => {
      console.error(`Request error for ${size}px icon:`, err.message);
      reject(err);
    });

    // 设置超时
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${size}px icon`));
    });
  });
}

async function main() {
  try {
    console.log('Starting icon download process...');
    
    // 确保images目录存在
    const imagesDir = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(imagesDir)) {
      console.log('Creating images directory...');
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // 下载一次，然后复制到其他尺寸
    console.log('Downloading 128px icon...');
    await downloadIcon(128);
    
    // 复制到其他尺寸
    const source = path.join(__dirname, '..', 'images', 'icon128.png');
    for (const size of sizes.filter(s => s !== 128)) {
      console.log(`Copying to ${size}px icon...`);
      const dest = path.join(__dirname, '..', 'images', `icon${size}.png`);
      fs.copyFileSync(source, dest);
      console.log(`Copied to ${size}px icon successfully`);
    }
    
    console.log('All icons created successfully');
  } catch (error) {
    console.error('Error creating icons:', error.message);
    process.exit(1);
  }
}

main(); 