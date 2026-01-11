# Meme生成器 (Full-Stack)

一个基于 React + InstantDB 的全栈 Meme 生成器，支持用户认证、实时数据同步、meme 分享和点赞功能。

## 功能特性

### 核心功能
- 📸 图片上传：支持选择本地图片作为Meme模板
- ✏️ 文字编辑：支持在图片上添加多个文字，拖动调整位置
- 🎨 文字样式：可调整字体大小、颜色
- 💾 图片下载：一键下载生成的Meme图片（PNG格式）

### 全栈功能
- 🔐 用户认证：支持邮箱/密码注册登录，Google OAuth，魔法链接登录
- 💾 数据持久化：所有 memes 自动保存到 InstantDB
- 👥 Meme Gallery：浏览所有用户创建的 memes
- ⬆️ Upvote 功能：用户可以点赞/取消点赞 memes
- 📋 模板管理：支持使用默认模板和保存自定义模板
- 🔄 实时同步：使用 InstantDB 实现数据的实时同步
- 👤 个人空间：查看和管理自己创建的 memes

## 技术栈

- **前端**: React 18, Vite
- **数据库**: InstantDB (实时数据库)
- **UI**: HTML5 Canvas API, CSS3
- **认证**: InstantDB 内置认证系统

## InstantDB 配置

本项目使用 InstantDB 作为后端数据库和认证服务。

- **App ID**: `2eec2daf-3ad4-4471-b06f-23d75cbe6f3a`

### 环境变量

创建 `.env` 文件（已添加到 .gitignore）：

```env
VITE_INSTANT_APP_ID=2eec2daf-3ad4-4471-b06f-23d75cbe6f3a
```

### Schema 和权限设置

在使用前，需要将 schema 和权限规则推送到 InstantDB：

```bash
# 登录 InstantDB CLI
npx instant-cli login

# 推送 schema（如果需要在 InstantDB 控制台定义）
# 注意：schema 在代码中已经定义，InstantDB 会自动同步

# 设置权限规则（如果需要）
# 在 InstantDB 控制台中配置权限，确保用户只能编辑/删除自己的 memes
```

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

### 首次使用

1. **启动应用**：运行 `npm run dev` 或使用 `./start.sh`
2. **注册/登录**：点击导航栏的"登录/注册"按钮
   - 可以使用邮箱/密码注册
   - 或使用 Google OAuth 登录
   - 或使用魔法链接（发送到邮箱）

### 创建 Meme

1. 点击导航栏的"创建 Meme"按钮
2. 选择模板或上传图片：
   - 从模板列表中选择默认模板
   - 或点击"选择图片"上传本地图片
3. 添加文字：
   - 点击图片任意位置添加文字
   - 双击文字进行编辑
   - 拖动文字调整位置
   - 使用底部控制面板调整样式（字体大小、颜色）
4. 保存或下载：
   - 点击"保存"按钮保存到数据库（需要登录）
   - 点击"下载"按钮下载到本地

### 浏览和互动

1. **Meme Gallery**：在导航栏点击"画廊"查看所有 memes
2. **我的 Memes**：登录后点击"我的 Memes"查看自己创建的 memes
3. **点赞**：在 Gallery 中点击 upvote 按钮为喜欢的 memes 点赞
4. **编辑**：在 Gallery 中点击编辑按钮（✏️）可以重新编辑 meme
5. **删除**：在"我的 Memes"中可以删除自己创建的 memes

## 项目结构

```
vibe-meme/
├── src/
│   ├── components/
│   │   ├── Auth.jsx              # 认证组件（登录/注册）
│   │   ├── Auth.css
│   │   ├── Navigation.jsx        # 导航栏组件
│   │   ├── Navigation.css
│   │   ├── MemeGallery.jsx       # Meme 画廊组件
│   │   ├── MemeGallery.css
│   │   ├── ImageUploader.jsx     # 图片上传组件
│   │   ├── MemeEditor.jsx        # Meme 编辑器组件
│   │   ├── TemplateSelector.jsx  # 模板选择器组件
│   │   └── TextControls.jsx      # 文字控制面板组件
│   ├── lib/
│   │   ├── instantdb.js          # InstantDB 配置和初始化
│   │   └── db.js                 # 数据库操作函数
│   ├── styles/
│   │   └── App.css               # 主样式文件
│   ├── App.jsx                   # 主应用组件
│   └── main.jsx                  # 入口文件
├── public/
│   └── assets/                   # 默认模板图片
├── index.html                    # HTML 模板
├── package.json                  # 项目配置
├── vite.config.js                # Vite 配置
├── start.sh                      # 启动脚本
├── .env                          # 环境变量（需要创建）
└── README.md                     # 项目说明
```

## 数据模型

### Memes
- `id`: 唯一标识符
- `userId`: 创建者用户 ID
- `imageUrl`: 图片 URL (base64)
- `imageName`: 图片名称
- `textItems`: 文字项数组
- `upvoteCount`: 点赞数
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### Templates
- `id`: 唯一标识符
- `userId`: 创建者用户 ID（可选）
- `name`: 模板名称
- `imageUrl`: 图片 URL
- `isDefault`: 是否为默认模板
- `createdAt`: 创建时间

### Upvotes
- `id`: 唯一标识符
- `userId`: 点赞用户 ID
- `memeId`: 被点赞的 meme ID
- `createdAt`: 点赞时间

## 开发说明

### 注意事项

1. **InstantDB API**：InstantDB 的 API 可能因版本而异。如果遇到 API 错误，请参考 [InstantDB 官方文档](https://www.instantdb.com/docs)
2. **Schema 同步**：确保在 InstantDB 控制台中正确配置 schema 和权限
3. **图片存储**：当前使用 base64 存储图片，适用于小图片。对于大图片，建议使用云存储（如 Cloudinary、AWS S3）
4. **认证配置**：需要在 InstantDB 控制台中配置 OAuth 提供商（如 Google）才能使用第三方登录

### 常见问题

**Q: 如何配置 Google OAuth 登录？**
A: 在 InstantDB 控制台的认证设置中，添加 Google OAuth 配置。

**Q: 如何推送 schema 到 InstantDB？**
A: Schema 已经在代码中定义，InstantDB 会自动同步。也可以在 InstantDB 控制台中手动配置。

**Q: 如何设置权限规则？**
A: 在 InstantDB 控制台的权限设置中，配置规则确保用户只能编辑/删除自己的 memes。

## 浏览器支持

支持所有现代浏览器（Chrome、Firefox、Safari、Edge等）

## 许可证

MIT
