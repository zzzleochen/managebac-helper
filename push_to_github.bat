@echo off
echo 正在初始化Git仓库...
git init

echo 配置Git用户信息...
git config user.name "zzzleochen"
git config user.email "zzzleochen@gmail.com"

echo 添加文件到Git...
git add .

echo 创建初始提交...
git commit -m "Initial commit: Chrome extension for ManageBac"

echo 设置main分支...
git branch -M main

echo 添加远程仓库...
git remote add origin https://github.com/zzzleochen/managebac-helper.git

echo 推送到GitHub...
git push -u origin main

echo 完成！
pause 