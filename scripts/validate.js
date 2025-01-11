const puppeteer = require('puppeteer');
const path = require('path');
const { execSync } = require('child_process');
const assert = require('assert').strict;
require('dotenv').config();

// 添加日志记录函数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : '✓';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// 添加断言函数
function assertWithLog(condition, message) {
  try {
    assert.ok(condition, message);
    log(message);
  } catch (error) {
    log(message, 'error');
    throw error;
  }
}

async function validateImplementation() {
  log('\n=== 验证代码实现 ===');
  
  const requiredFiles = [
    'manifest.json',
    'content.js',
    'popup.js',
    'popup.html'
  ];
  
  for (const file of requiredFiles) {
    try {
      require('fs').accessSync(path.resolve(__dirname, '..', file));
      log(`${file} 存在`);
    } catch (error) {
      throw new Error(`${file} 不存在`);
    }
  }

  // 验证 manifest.json 内容
  const manifest = require('../manifest.json');
  assertWithLog(manifest.manifest_version === 3, 'manifest版本为V3');
  assertWithLog(manifest.name === 'ManageBac Helper', '扩展名称正确');
  assertWithLog(manifest.permissions.includes('activeTab'), '包含activeTab权限');
  
  // 验证 content.js 是否在 manifest 中正确配置
  assertWithLog(
    manifest.content_scripts && 
    manifest.content_scripts.some(script => 
      script.matches.includes('*://*.managebac.cn/*') && 
      script.js.includes('content.js')
    ),
    'content.js 在 manifest 中配置正确'
  );
  
  // 验证 popup 配置
  assertWithLog(
    manifest.action && 
    manifest.action.default_popup === 'popup.html',
    'popup.html 在 manifest 中配置正确'
  );
}

async function runTests() {
  log('\n=== 运行单元测试 ===');
  try {
    execSync('npm test', { stdio: 'inherit' });
    log('单元测试通过');
  } catch (error) {
    throw new Error('单元测试失败');
  }
}

async function validateAssignment(assignment) {
  // 验证作业数据结构
  assertWithLog(typeof assignment.title === 'string' && assignment.title.length > 0, 
    '作业标题格式正确');
  
  assertWithLog(['Formative', 'Summative'].includes(assignment.type), 
    '作业类型格式正确');
  
  assertWithLog(typeof assignment.course === 'string' && assignment.course.length > 0,
    '课程名称格式正确');
  
  // 验证日期格式 (YYYY-MM-DD HH:mm)
  const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
  assertWithLog(dateRegex.test(assignment.dueDate),
    '截止日期格式正确');
  
  assertWithLog(['未交', '已提交'].includes(assignment.status),
    '作业状态格式正确');
  
  assertWithLog(typeof assignment.score === 'string',
    '分数格式正确');
}

async function retry(fn, retries = 3, delay = 5000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      log(`重试 ${i + 1}/${retries}: ${error.message}`, 'error');
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function testExtension() {
  log('\n=== 测试浏览器插件 ===');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      defaultViewport: null,
      args: [
        `--disable-extensions-except=${path.resolve(__dirname, '..')}`,
        `--load-extension=${path.resolve(__dirname, '..')}`,
        '--no-sandbox',
        '--start-maximized'
      ]
    });

    // 检查环境变量
    assertWithLog(process.env.MANAGEBAC_TEST_EMAIL && process.env.MANAGEBAC_TEST_PASSWORD,
      '环境变量配置完整');

    const page = await browser.newPage();
    
    // 设置页面错误处理
    page.on('error', err => log(`页面错误: ${err.message}`, 'error'));
    page.on('pageerror', err => log(`页面JavaScript错误: ${err.message}`, 'error'));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        log(`控制台错误: ${msg.text()}`, 'error');
      }
    });
    
    // 设置更长的默认超时时间
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    
    // 导航到登录页面
    log('正在访问登录页面...');
    const loginResponse = await retry(async () => {
      const response = await page.goto('https://vkbs.managebac.cn/login', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
      if (!response.ok()) {
        throw new Error(`页面加载失败: ${response.status()} ${response.statusText()}`);
      }
      return response;
    });
    assertWithLog(loginResponse.ok(), '登录页面加载成功');
    
    // 验证登录表单
    const emailInput = await page.$('#session_login');
    const passwordInput = await page.$('#session_password');
    const submitButton = await page.$('input[type="submit"]');
    assertWithLog(emailInput !== null, '找到邮箱输入框');
    assertWithLog(passwordInput !== null, '找到密码输入框');
    assertWithLog(submitButton !== null, '找到登录按钮');
    
    // 自动填写登录表单
    log('正在填写登录信息...');
    await page.type('#session_login', process.env.MANAGEBAC_TEST_EMAIL);
    await page.type('#session_password', process.env.MANAGEBAC_TEST_PASSWORD);
    
    // 点击登录并等待导航
    log('正在登录...');
    await retry(async () => {
      await Promise.all([
        page.waitForNavigation({ 
          waitUntil: 'networkidle0',
          timeout: 60000 
        }),
        page.click('input[type="submit"]')
      ]);
      
      if (page.url().includes('login')) {
        throw new Error('登录失败，仍在登录页面');
      }
    });
    
    assertWithLog(page.url().includes('managebac.cn'), '登录成功');
    assertWithLog(!page.url().includes('login'), '成功跳转到主页');
    
    // 导航到目标页面
    log('正在访问作业列表页面...');
    const taskResponse = await retry(async () => {
      const response = await page.goto('https://vkbs.managebac.cn/student/tasks_and_deadlines', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
      if (!response.ok()) {
        throw new Error(`页面加载失败: ${response.status()} ${response.statusText()}`);
      }
      return response;
    });
    assertWithLog(taskResponse.ok(), '作业列表页面加载成功');
    
    // 等待页面加载
    const taskElement = await retry(async () => {
      const element = await page.waitForSelector('.task-list .task, .upcoming-events .event', { 
        timeout: 60000,
        visible: true 
      });
      if (!element) {
        throw new Error('未找到作业列表元素');
      }
      return element;
    });
    assertWithLog(taskElement !== null, '找到作业列表元素');
    
    // 验证页面标题
    const pageTitle = await page.title();
    assertWithLog(pageTitle.includes('Tasks'), '页面标题正确');
    
    // 等待扩展加载
    log('等待扩展加载...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 验证扩展图标存在
    try {
      const extensionIcon = await Promise.race([
        page.evaluate(() => {
          const icons = Array.from(document.querySelectorAll('div[role="button"]'));
          return icons.some(icon => icon.title === 'ManageBac Helper');
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('图标加载超时，继续执行测试')), 5000)
        )
      ]);
      if (extensionIcon) {
        log('扩展图标已加载');
      }
    } catch (error) {
      log('扩展图标加载失败: ' + error.message);
      // 继续执行测试，不中断
    }
    
    // 测试内容脚本
    log('正在提取作业信息...');
    const assignments = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('提取作业信息超时'));
        }, 5000);
        
        chrome.runtime.sendMessage({ action: 'extract' }, response => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response?.assignments || []);
          }
        });
      });
    }).catch(error => {
      log(error.message, 'error');
      return [];
    });
    
    assertWithLog(Array.isArray(assignments), '成功获取作业数组');
    assertWithLog(assignments.length > 0, `成功提取作业信息: ${assignments.length} 个作业`);
    
    // 检查作业数据结构
    if (assignments.length > 0) {
      log('验证作业数据结构...');
      await validateAssignment(assignments[0]);
      
      // 输出第一个作业的详细信息用于调试
      log('示例作业信息:');
      console.log(JSON.stringify(assignments[0], null, 2));
      
      // 验证所有作业
      log('验证所有作业数据...');
      for (let i = 0; i < assignments.length; i++) {
        try {
          await validateAssignment(assignments[i]);
          log(`作业 ${i + 1}/${assignments.length} 验证通过`);
        } catch (error) {
          throw new Error(`作业 ${i + 1} 验证失败: ${error.message}`);
        }
      }
    }
    
    log('浏览器插件测试通过');
    
  } catch (error) {
    log(error.message, 'error');
    // 保存错误截图
    if (browser) {
      const pages = await browser.pages();
      const page = pages[pages.length - 1];
      await page.screenshot({ 
        path: `error-${Date.now()}.png`,
        fullPage: true 
      });
      log('已保存错误截图', 'error');
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function main() {
  try {
    await validateImplementation();
    await runTests();
    await testExtension();
    log('\n=== 所有测试通过 ===');
    process.exit(0);
  } catch (error) {
    log('\n测试失败: ' + error.message, 'error');
    process.exit(1);
  }
}

main(); 