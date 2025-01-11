const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    // 启动浏览器，开启调试模式
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        `--disable-extensions-except=${path.resolve(__dirname, '..')}`,
        `--load-extension=${path.resolve(__dirname, '..')}`,
        '--no-sandbox'
      ]
    });

    // 创建新页面
    const page = await browser.newPage();

    // 导航到目标网站
    await page.goto('https://vkbs.managebac.cn/student');

    // 等待用户手动关闭浏览器
    console.log('浏览器已启动，请在完成调试后手动关闭浏览器窗口...');
    
    // 监听 console 消息
    page.on('console', msg => {
      console.log('页面日志:', msg.text());
    });

    // 监听扩展消息
    await page.evaluate(() => {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('扩展消息:', request);
        return true;
      });
    });

  } catch (error) {
    console.error('调试过程中出错:', error);
    process.exit(1);
  }
})(); 