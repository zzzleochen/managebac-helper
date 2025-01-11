# ManageBac Helper

一个帮助从 ManageBac 提取作业信息的 Chrome 扩展。

## 功能特点

- 一键提取当前页面的作业信息
- 支持导出作业信息为文本文件
- 清晰展示作业类型（formative/summative）
- 显示截止日期和课程信息
- 支持筛选未提交的作业
- 实时显示加载状态
- 错误处理和提示

## 安装方法

1. 下载或克隆此仓库到本地
2. 打开 Chrome 浏览器，进入扩展管理页面 (chrome://extensions/)
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本仓库的目录

## 使用方法

1. 登录 ManageBac (https://vkbs.managebac.cn/student)
2. 点击浏览器工具栏中的扩展图标
3. 在弹出窗口中点击"提取作业"按钮
4. 查看提取到的作业信息
5. 如需保存，点击"导出"按钮将信息保存为文本文件

## 项目结构

```
managebac-helper/
├── manifest.json      # 扩展配置文件
├── popup.html        # 弹出窗口界面
├── popup.js         # 弹出窗口逻辑
├── content.js       # 内容脚本，用于提取页面信息
├── images/          # 扩展图标
├── tests/           # 测试文件目录
└── scripts/         # 工具脚本
```

## 开发说明

本扩展使用纯 JavaScript 开发，使用 Jest 进行测试。主要文件说明：

- `manifest.json`: 扩展的配置文件，定义了权限和基本信息
- `popup.html`: 弹出窗口的 HTML 结构和样式
- `popup.js`: 处理弹出窗口的交互逻辑
- `content.js`: 负责从网页中提取作业信息
- `tests/`: 包含单元测试和集成测试
- `scripts/validate.js`: 验证脚本，用于检查实现和运行测试

## 测试

项目包含完整的测试套件：

1. 单元测试
   - 使用 Jest 框架
   - 测试核心功能和组件
   - 运行：`npm test`

2. 集成测试
   - 使用 Puppeteer 进行浏览器自动化测试
   - 测试实际场景下的扩展功能
   - 运行：`npm run test:integration`

3. 验证脚本
   - 检查文件完整性
   - 运行所有测试
   - 验证浏览器扩展功能
   - 运行：`npm run validate`

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个扩展。在提交代码前，请确保：

1. 所有测试通过
2. 代码符合项目规范
3. 更新相关文档
4. 添加必要的测试用例

## 许可证

MIT License
