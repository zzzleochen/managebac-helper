chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    const assignments = [];
    
    // 获取所有作业元素
    const assignmentElements = document.querySelectorAll('.task');
    
    assignmentElements.forEach(element => {
      // 检查是否包含"已提交"标记
      const statusElement = element.querySelector('.status');
      const isSubmitted = statusElement?.textContent.includes('已提交');
      
      // 只处理未提交的作业
      if (!isSubmitted) {
        // 提取日期信息
        const dateElement = element.querySelector('.date');
        const monthElement = dateElement?.querySelector('.month')?.textContent.trim() || '';
        const dayElement = dateElement?.querySelector('.day')?.textContent.trim() || '';
        
        // 提取作业信息
        const titleElement = element.querySelector('.title');
        const title = titleElement?.textContent.trim() || '';
        
        // 提取作业类型
        const typeElement = element.querySelector('.formative, .summative');
        const type = typeElement?.textContent.trim() || '作业';
        
        // 提取课程信息
        const courseElement = element.querySelector('.class-name');
        const course = courseElement?.textContent.trim() || '';
        
        // 提取截止时间
        const dueDateElement = element.querySelector('time');
        const dueDate = dueDateElement?.textContent.trim() || `${monthElement} ${dayElement}`;
        
        // 提取分数信息（如果有）
        const scoreElement = element.querySelector('.grade');
        const score = scoreElement?.textContent.trim() || '未评分';
        
        if (title) {
          assignments.push({
            title,
            type,
            course,
            dueDate,
            score,
            status: '未交'
          });
        }
      }
    });
    
    sendResponse({ assignments });
  }
  return true;
}); 