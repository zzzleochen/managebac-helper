# ManageBac Helper

一个帮助从 ManageBac 提取作业信息的 Chrome 扩展。

## 功能特点

- 一键提取当前页面的作业信息
- 支持导出作业信息为文本文件
- 清晰展示作业类型（formative/summative）
- 显示截止日期和课程信息

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
└── content.js       # 内容脚本，用于提取页面信息
```

## 开发说明

本扩展使用纯 JavaScript 开发，不依赖任何外部库。主要文件说明：

- `manifest.json`: 扩展的配置文件，定义了权限和基本信息
- `popup.html`: 弹出窗口的 HTML 结构和样式
- `popup.js`: 处理弹出窗口的交互逻辑
- `content.js`: 负责从网页中提取作业信息

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个扩展。

## 许可证

MIT License 