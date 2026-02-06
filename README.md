# 🐴 马年贺卡生成器

AI 生成中国风水墨画贺卡，发送给好友独特的新春祝福！

## 功能特点

- 📷 上传照片，AI 生成水墨画风格人像
- 🎨 两种风格：古风飘逸 / 可爱Q版
- ✉️ 生成分享链接，好友收到「贺卡待签收」惊喜
- 🎉 拆卡动画，仪式感满满
- 💾 支持下载保存

## 部署指南（小白友好版）

### 第一步：安装必要工具

1. **安装 Node.js**
   - 打开 https://nodejs.org/
   - 下载 LTS 版本并安装

2. **安装 Vercel CLI**
   - 打开终端，运行：
   ```bash
   npm install -g vercel
   ```

### 第二步：配置项目

1. **进入项目目录**
   ```bash
   cd /Users/piiing/claude/projects/马年贺卡祝福语项目
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

### 第三步：配置 Gemini API Key

1. 打开 https://aistudio.google.com/apikey
2. 创建一个 API Key
3. 复制保存好（不要分享给别人）

### 第四步：部署到 Vercel

1. **登录 Vercel**
   ```bash
   vercel login
   ```
   - 按提示用 GitHub 账号登录

2. **部署项目**
   ```bash
   vercel
   ```
   - 按提示操作，选择默认选项即可

3. **配置环境变量**
   - 打开 https://vercel.com/dashboard
   - 找到你的项目
   - 点击 Settings → Environment Variables
   - 添加：
     - Name: `GEMINI_API_KEY`
     - Value: 你的 API Key
   - 点击 Save

4. **重新部署**
   ```bash
   vercel --prod
   ```

5. **完成！** 你会得到一个类似 `https://xxx.vercel.app` 的网址

## 本地开发

```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env，填入你的 API Key
# GEMINI_API_KEY=你的key

# 启动本地开发服务器
npm run dev
```

## 项目结构

```
马年贺卡祝福语项目/
├── public/                 # 前端文件
│   ├── index.html         # 主页面
│   ├── card.html          # 收卡页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   ├── js/
│   │   ├── main.js        # 主页面脚本
│   │   └── card.js        # 收卡页面脚本
│   └── images/            # 图片资源
├── api/                    # 后端 API
│   ├── generate.js        # 生成水墨画
│   ├── save-card.js       # 保存贺卡
│   └── get-card.js        # 获取贺卡
├── docs/                   # 文档
│   └── prd/
│       └── PRD-001.md     # 产品需求文档
├── vercel.json            # Vercel 配置
├── package.json           # 项目配置
└── README.md              # 说明文档
```

## 注意事项

1. **API Key 安全**：不要将 API Key 提交到 GitHub
2. **数据存储**：当前版本使用浏览器本地存储，分享链接在同一设备上有效
3. **生产环境**：如需持久化存储，建议配置 Firebase

## 后续优化建议

- [ ] 接入 Firebase 实现数据持久化
- [ ] 添加更多贺卡模板
- [ ] 添加马年运势抽签功能
- [ ] 优化移动端体验

---

🎊 祝你马年大吉，马到成功！
