chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    const assignments = [];
    
    // 获取近期作业列表
    const assignmentElements = document.querySelectorAll('.upcoming-events .event, .recent-activity-widget .activity-item');
    
    assignmentElements.forEach(element => {
      // 提取日期信息
      const dateElement = element.querySelector('.date, .due-date');
      const monthElement = dateElement?.querySelector('.month')?.textContent.trim() || '';
      const dayElement = dateElement?.querySelector('.day')?.textContent.trim() || '';
      
      // 提取作业信息
      const titleElement = element.querySelector('.title, .event-title');
      const title = titleElement?.textContent.trim() || '';
      
      // 提取作业类型和状态
      const typeElement = element.querySelector('.formative, .summative, .task-type');
      const type = typeElement?.textContent.trim() || '作业';
      
      // 提取课程信息
      const courseElement = element.querySelector('.class-name, .programme');
      const course = courseElement?.textContent.trim() || '';
      
      // 提取截止时间
      const dueDateElement = element.querySelector('time, .due-date');
      const dueDate = dueDateElement?.textContent.trim() || `${monthElement} ${dayElement}`;
      
      if (title && (dueDate || (monthElement && dayElement))) {
        assignments.push({
          title,
          type,
          course,
          dueDate: dueDate || `${monthElement} ${dayElement}`,
        });
      }
    });
    
    sendResponse({ assignments });
  }
  return true;
}); 