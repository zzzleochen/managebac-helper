let currentAssignments = [];

document.getElementById('extractBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const button = document.getElementById('extractBtn');
  const exportBtn = document.getElementById('exportBtn');
  const assignmentsDiv = document.getElementById('assignments');
  
  // 更新按钮状态
  button.textContent = '正在提取...';
  button.disabled = true;
  exportBtn.disabled = true;
  
  chrome.tabs.sendMessage(tab.id, { action: 'extract' }, response => {
    // 恢复按钮状态
    button.textContent = '提取作业';
    button.disabled = false;
    
    if (response && response.assignments) {
      currentAssignments = response.assignments;
      assignmentsDiv.innerHTML = '';
      
      if (response.assignments.length === 0) {
        assignmentsDiv.innerHTML = '<div class="no-assignments">没有找到作业信息</div>';
        exportBtn.disabled = true;
        return;
      }
      
      exportBtn.disabled = false;
      
      response.assignments.forEach(assignment => {
        const div = document.createElement('div');
        div.className = 'assignment';
        
        const typeClass = assignment.type.toLowerCase().includes('formative') ? 'type-formative' : 'type-summative';
        
        div.innerHTML = `
          <div class="assignment-title">
            <span class="type-tag ${typeClass}">${assignment.type}</span>
            ${assignment.title}
          </div>
          <div class="assignment-meta">
            <div>课程: ${assignment.course}</div>
            <div>截止日期: ${assignment.dueDate}</div>
          </div>
        `;
        assignmentsDiv.appendChild(div);
      });
    } else {
      assignmentsDiv.innerHTML = '<div class="no-assignments">获取作业信息失败，请刷新页面后重试</div>';
      exportBtn.disabled = true;
    }
  });
});

document.getElementById('exportBtn').addEventListener('click', () => {
  if (currentAssignments.length === 0) return;
  
  const text = currentAssignments.map(assignment => {
    return `标题: ${assignment.title}
类型: ${assignment.type}
课程: ${assignment.course}
截止日期: ${assignment.dueDate}
----------------------------------------`;
  }).join('\n\n');
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `managebac-assignments-${timestamp}.txt`;
  a.click();
  
  URL.revokeObjectURL(url);
}); 