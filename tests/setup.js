// 模拟 Chrome API
global.chrome = {
  tabs: {
    query: jest.fn().mockImplementation((queryInfo, callback) => {
      if (callback) {
        callback([{ id: 1 }]);
      }
      return Promise.resolve([{ id: 1 }]);
    }),
    sendMessage: jest.fn().mockImplementation((tabId, message, callback) => {
      if (callback) {
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
      }
      return Promise.resolve({
        assignments: [{
          title: 'Test Assignment',
          type: 'Formative',
          course: 'Test Course',
          dueDate: '2024-01-31 23:59',
          score: '未评分',
          status: '未交'
        }]
      });
    })
  },
  runtime: {
    onMessage: {
      addListener: jest.fn((listener) => {
        // 存储监听器以供测试使用
        global.chrome.runtime.messageListener = listener;
      })
    },
    messageListener: null
  }
};

// 模拟 URL API
global.URL.createObjectURL = jest.fn(() => 'blob:test');
global.URL.revokeObjectURL = jest.fn(); 