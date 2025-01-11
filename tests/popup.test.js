// 测试 popup.js 的功能
describe('Popup Tests', () => {
  beforeEach(() => {
    // 重置 DOM
    document.body.innerHTML = `
      <div class="header">
        <h2>ManageBac Helper</h2>
        <div class="button-group">
          <button id="extractBtn">提取未交作业</button>
          <button id="exportBtn" class="secondary" disabled>导出</button>
        </div>
      </div>
      <div id="assignments">
        <div class="no-assignments">点击"提取未交作业"按钮获取作业信息</div>
      </div>
    `;

    // 重置所有模拟
    jest.clearAllMocks();

    // 加载 popup.js
    jest.isolateModules(() => {
      require('../popup.js');
    });
  });

  test('should update UI when extracting assignments', async () => {
    const extractBtn = document.getElementById('extractBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    // 模拟 chrome.tabs.sendMessage 返回作业数据
    chrome.tabs.sendMessage.mockImplementationOnce((tabId, message, callback) => {
      callback({
        assignments: [{
          title: 'Test Assignment',
          type: 'Formative',
          course: 'Test Course',
          dueDate: '2024-01-31 23:59',
          score: '未评分',
          status: '未交'
        }]
      });
    });

    // 点击提取按钮
    extractBtn.click();
    
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 验证 UI 更新
    expect(extractBtn.textContent).toBe('提取未交作业');
    expect(extractBtn.disabled).toBe(false);
    expect(exportBtn.disabled).toBe(false);
    expect(document.querySelector('.assignment')).toBeTruthy();
  });

  test('should handle no assignments', async () => {
    const extractBtn = document.getElementById('extractBtn');
    const exportBtn = document.getElementById('exportBtn');
    const assignmentsDiv = document.getElementById('assignments');
    
    // 模拟没有作业的响应
    chrome.tabs.sendMessage.mockImplementationOnce((tabId, message, callback) => {
      callback({ assignments: [] });
    });

    // 点击提取按钮
    extractBtn.click();
    
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 验证 UI 更新
    expect(assignmentsDiv.querySelector('.no-assignments')).toBeTruthy();
    expect(exportBtn.disabled).toBe(true);
  });

  test('should export assignments correctly', async () => {
    const extractBtn = document.getElementById('extractBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    // 模拟有作业数据的情况
    chrome.tabs.sendMessage.mockImplementationOnce((tabId, message, callback) => {
      callback({
        assignments: [{
          title: 'Test Assignment',
          type: 'Formative',
          course: 'Test Course',
          dueDate: '2024-01-31 23:59',
          score: '未评分',
          status: '未交'
        }]
      });
    });

    // 点击提取按钮
    extractBtn.click();
    
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 点击导出按钮
    exportBtn.click();
    
    // 验证导出功能
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
}); 