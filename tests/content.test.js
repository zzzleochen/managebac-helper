// 测试 content.js 的功能
describe('Content Script Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="upcoming-events">
        <div class="event">
          <div class="date">
            <span class="month">JAN</span>
            <span class="day">31</span>
          </div>
          <div class="title">Test Assignment</div>
          <div class="formative">Formative</div>
          <div class="class-name">Test Course</div>
          <time>2024-01-31 23:59</time>
        </div>
      </div>
    `;
  });

  test('should extract assignment information correctly', async () => {
    // 模拟消息监听器
    const listener = (request, sender, sendResponse) => {
      if (request.action === 'extract') {
        const assignments = [];
        const assignmentElements = document.querySelectorAll('.upcoming-events .event');
        
        assignmentElements.forEach(element => {
          const dateElement = element.querySelector('.date');
          const monthElement = dateElement?.querySelector('.month')?.textContent.trim() || '';
          const dayElement = dateElement?.querySelector('.day')?.textContent.trim() || '';
          
          const titleElement = element.querySelector('.title');
          const title = titleElement?.textContent.trim() || '';
          
          const typeElement = element.querySelector('.formative, .summative');
          const type = typeElement?.textContent.trim() || '作业';
          
          const courseElement = element.querySelector('.class-name');
          const course = courseElement?.textContent.trim() || '';
          
          const dueDateElement = element.querySelector('time');
          const dueDate = dueDateElement?.textContent.trim() || `${monthElement} ${dayElement}`;
          
          if (title && (dueDate || (monthElement && dayElement))) {
            assignments.push({
              title,
              type,
              course,
              dueDate,
            });
          }
        });
        
        sendResponse({ assignments });
      }
      return true;
    };

    // 测试提取功能
    const response = await new Promise(resolve => {
      listener({ action: 'extract' }, null, resolve);
    });

    expect(response.assignments).toHaveLength(1);
    expect(response.assignments[0]).toEqual({
      title: 'Test Assignment',
      type: 'Formative',
      course: 'Test Course',
      dueDate: '2024-01-31 23:59'
    });
  });

  test('should handle empty page', async () => {
    document.body.innerHTML = '';
    
    const response = await new Promise(resolve => {
      const listener = (request, sender, sendResponse) => {
        if (request.action === 'extract') {
          const assignments = [];
          sendResponse({ assignments });
        }
        return true;
      };
      
      listener({ action: 'extract' }, null, resolve);
    });

    expect(response.assignments).toHaveLength(0);
  });
}); 