# Meme生成器

一个基于React的Meme生成器，支持图片上传、文字编辑和下载功能。

## 功能特性

- 📸 图片上传：支持选择本地图片作为Meme模板
- ✏️ 文字编辑：支持在图片顶部和底部添加文字
- 🎨 文字样式：黑底白字，经典Meme风格
- 📏 字体大小：可调整字体大小（20px - 100px）
- 💾 图片下载：一键下载生成的Meme图片（PNG格式）

## 技术栈

- React 18
- Vite
- HTML5 Canvas API

## 安装和运行

### 快速启动（推荐）

使用启动脚本，一键启动开发服务器：

```bash
./start.sh
```

或者：

```bash
bash start.sh
```

启动脚本会自动：
- 加载Node.js环境（nvm）
- 检查并安装依赖（如果需要）
- 启动开发服务器

### 手动启动

#### 安装依赖

```bash
npm install
```

#### 开发模式

```bash
npm run dev
```

**注意：** 如果重启电脑后无法运行npm命令，需要先加载nvm：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用方法

1. 点击"选择图片"按钮，选择一张图片作为Meme模板
2. 在"顶部文字"输入框中输入顶部文字
3. 在"底部文字"输入框中输入底部文字
4. 使用滑块调整字体大小
5. 点击"下载Meme"按钮保存图片

## 项目结构

```
vibe-meme/
├── src/
│   ├── components/
│   │   ├── ImageUploader.jsx    # 图片上传组件
│   │   ├── MemeEditor.jsx       # Meme编辑器组件
│   │   └── TextControls.jsx     # 文字控制面板组件
│   ├── styles/
│   │   └── App.css              # 主样式文件
│   ├── App.jsx                  # 主应用组件
│   └── main.jsx                 # 入口文件
├── index.html                   # HTML模板
├── package.json                 # 项目配置
├── vite.config.js              # Vite配置
├── start.sh                    # 启动脚本
└── README.md                    # 项目说明
```

## 浏览器支持

支持所有现代浏览器（Chrome、Firefox、Safari、Edge等）

