# GitHub Pages 设置指南

## 如何将你的网页应用部署到GitHub Pages

### 步骤1：创建GitHub仓库

1. **登录GitHub**
   - 访问 [github.com](https://github.com)
   - 登录你的账户

2. **创建新仓库**
   - 点击右上角的 "+" 号
   - 选择 "New repository"
   - 仓库名称：`service-management-system`（或你喜欢的名字）
   - 选择 "Public"（公开，这样GitHub Pages才能工作）
   - 勾选 "Add a README file"
   - 点击 "Create repository"

### 步骤2：上传你的文件

#### 方法A：通过网页界面上传
1. 在仓库页面，点击 "uploading an existing file"
2. 拖拽你的所有文件到上传区域：
   - `index.html`
   - `main.js`
   - `storage.js`
   - `README.md`
   - 其他相关文件
3. 在底部输入提交信息："Initial upload of service management system"
4. 点击 "Commit changes"

#### 方法B：使用Git命令行（推荐）
```bash
# 在项目文件夹中打开终端
cd "/Users/sibenli/Desktop/python note/Service new"

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交文件
git commit -m "Initial commit: Service Management System"

# 添加远程仓库（替换为你的仓库URL）
git remote add origin https://github.com/你的用户名/service-management-system.git

# 推送到GitHub
git push -u origin main
```

### 步骤3：启用GitHub Pages

1. **进入仓库设置**
   - 在你的仓库页面，点击 "Settings" 标签
   - 在左侧菜单中找到 "Pages"

2. **配置Pages设置**
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main"
   - Folder: 选择 "/ (root)"
   - 点击 "Save"

3. **等待部署**
   - GitHub会自动构建你的网站
   - 通常需要1-2分钟
   - 你会看到一个绿色的勾号表示部署成功

### 步骤4：访问你的网页应用

部署成功后，你的网页应用将在以下URL可用：
```
https://你的用户名.github.io/仓库名
```

例如：`https://sibenli.github.io/service-management-system`

### 步骤5：更新你的应用

每次你修改代码后：

1. **通过网页界面**：
   - 编辑文件
   - 提交更改
   - 等待自动重新部署

2. **通过Git命令行**：
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```

## 常见问题解决

### 问题1：页面显示404
- 确保 `index.html` 在仓库根目录
- 检查文件名大小写是否正确
- 等待几分钟让GitHub完成部署

### 问题2：样式或功能不工作
- 检查所有文件都已上传
- 确保文件路径正确
- 查看浏览器控制台是否有错误

### 问题3：数据不保存
- 这是正常的，因为数据存储在浏览器的localStorage中
- 每个设备的数据是独立的
- 如需跨设备同步，需要实现云端存储

## 高级功能

### 自定义域名
1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容：`你的域名.com`
3. 在域名提供商处设置CNAME记录

### 自动部署
- 每次推送到main分支都会自动重新部署
- 无需手动操作

## 安全注意事项

- 公开仓库意味着任何人都能看到你的代码
- 敏感信息不要放在代码中
- 考虑使用环境变量存储配置

## 获取帮助

如果遇到问题：
1. 检查GitHub Pages的部署状态
2. 查看仓库的Actions标签页了解构建日志
3. 确保所有文件都正确上传
4. 检查浏览器控制台是否有JavaScript错误

---

**你的网页应用URL将是：**
`https://你的GitHub用户名.github.io/你的仓库名`
