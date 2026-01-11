# 问题修复记录

## 修复时间
2026-01-11

## 修复的问题

### 1. 认证问题：`db.auth.signUp is not a function`

**问题原因：**
- InstantDB 不支持传统的邮箱/密码 `signUp` 和 `signIn` 方法
- InstantDB 使用魔法链接认证（Magic Code）作为主要认证方式

**解决方案：**
- 更新 `src/components/Auth.jsx`，改用 InstantDB 支持的认证方式：
  - 魔法链接认证：`sendMagicCode` + `signInWithMagicCode`
  - Google OAuth：`createAuthorizationURL`
  - 访客登录：`signInAsGuest`
- 更新 `src/lib/instantdb.js` 中的错误处理，移除不支持的认证方法

### 2. Meme 无法显示问题

**问题原因：**
- React Hooks 规则违反：在条件语句中调用 `useQuery` 
- `MemeGallery.jsx` 中使用了 `try-catch` 包裹 hooks 调用
- `TemplateSelector.jsx` 和其他组件中也存在类似问题

**解决方案：**
- 修复 `src/components/MemeGallery.jsx`：
  - 将 `db.useQuery()` 移到组件顶层，无条件调用
  - 移除条件判断和 try-catch 包裹
  
- 修复 `src/components/TemplateSelector.jsx`：
  - 将 `db.useAuth()` 和 `db.useQuery()` 移到组件顶层
  
- 修复 `src/App.jsx` 和 `src/components/Navigation.jsx`：
  - 简化 `useAuth()` 调用，移除不必要的条件判断

- 添加调试日志：
  - 在 `saveMeme` 中添加保存日志
  - 在 `MemeGallery` 中添加查询结果日志

## React Hooks 规则

React Hooks 必须遵循以下规则：
1. **只在组件顶层调用 Hooks**
2. **不要在条件语句、循环或嵌套函数中调用 Hooks**
3. **不要在 try-catch 中调用 Hooks**

### 错误示例 ❌

```javascript
// 错误：在条件语句中调用 hooks
try {
  const result = db.useQuery ? db.useQuery(query) : { data: [] }
} catch (error) {
  // ...
}

// 错误：在条件判断中调用 hooks
const auth = db && typeof db.useAuth === 'function' ? db.useAuth() : { user: null }
```

### 正确示例 ✅

```javascript
// 正确：在组件顶层无条件调用
const memesResult = db.useQuery({ memes: {} })
const upvotesResult = db.useQuery({ upvotes: {} })

const memesData = memesResult?.data || { memes: [] }
const isLoading = memesResult?.isLoading || false
```

## InstantDB 认证方式

InstantDB 支持以下认证方式：

### 1. 魔法链接认证（推荐）

```javascript
// 发送验证码
await db.auth.sendMagicCode({ email })

// 验证登录
await db.auth.signInWithMagicCode({ email, code })
```

### 2. OAuth 认证

```javascript
// 创建授权 URL
const url = db.auth.createAuthorizationURL({
  clientName: 'google',
  redirectURL: window.location.href,
})
window.location.href = url
```

### 3. 访客登录

```javascript
await db.auth.signInAsGuest()
```

### 4. Token 认证

```javascript
await db.auth.signInWithToken(token)
```

## 测试步骤

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **测试认证流程**
   - 访问 http://localhost:5173/
   - 点击"登录/注册"
   - 输入邮箱，点击"发送验证码到邮箱"
   - 查收邮件中的验证码
   - 输入验证码，点击"验证并登录"
   - 或者：点击"访客登录"快速登录

3. **测试创建 Meme**
   - 登录后，点击"创建 Meme"
   - 选择模板或上传图片
   - 点击图片添加文字
   - 调整文字样式
   - 点击"保存"按钮

4. **测试显示 Meme**
   - 点击"画廊"查看所有 memes
   - 点击"我的 Memes"查看自己创建的 memes
   - 检查控制台日志，确认数据查询成功

5. **检查控制台输出**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签页
   - 应该看到类似以下日志：
     ```
     Initializing InstantDB with appId: 2eec2daf-3ad4-4471-b06f-23d75cbe6f3a
     InstantDB initialized successfully: {...}
     Saving meme: {memeId: "...", userId: "...", ...}
     Meme saved successfully: ...
     MemeGallery render: {memesCount: 1, upvotesCount: 0, ...}
     ```

## 可能仍需要的配置

### InstantDB Schema 配置

如果 memes 仍然无法显示，可能需要在 InstantDB 控制台手动配置 schema：

1. 访问 [InstantDB Dashboard](https://instantdb.com/dash)
2. 选择你的应用
3. 在 Schema 标签页配置以下表结构：

**memes 表：**
- userId (string)
- imageUrl (string)
- imageName (string)
- textItems (json)
- upvoteCount (number)
- createdAt (number)
- updatedAt (number)

**templates 表：**
- userId (string, optional)
- name (string)
- imageUrl (string)
- isDefault (boolean)
- createdAt (number)

**upvotes 表：**
- userId (string)
- memeId (string)
- createdAt (number)

### 权限规则配置

在 InstantDB 控制台配置权限规则：

```javascript
// 用户可以读取所有 memes
allow(namespace.memes, {
  read: 'public',
  write: auth.userId === record.userId
})

// 用户只能删除自己的 memes
allow(namespace.memes, {
  delete: auth.userId === record.userId
})
```

## 相关文件

修改的文件列表：
- `src/components/Auth.jsx` - 更新认证方式
- `src/components/Auth.css` - 添加样式
- `src/lib/instantdb.js` - 修复错误处理
- `src/lib/db.js` - 添加调试日志
- `src/components/MemeGallery.jsx` - 修复 hooks 调用
- `src/components/TemplateSelector.jsx` - 修复 hooks 调用
- `src/App.jsx` - 修复 hooks 调用
- `src/components/Navigation.jsx` - 修复 hooks 调用

## 注意事项

1. **确保网络连接正常**：InstantDB 需要与服务器同步数据
2. **检查浏览器控制台**：查看是否有错误信息
3. **清除缓存**：如果问题持续，尝试清除浏览器缓存和 IndexedDB
4. **检查 App ID**：确保使用正确的 InstantDB App ID

## 后续改进建议

1. **改进错误提示**：添加更友好的错误提示界面
2. **添加加载状态**：在数据加载时显示加载动画
3. **优化图片存储**：考虑使用 InstantDB Storage API 存储图片，而不是 base64
4. **添加离线支持**：利用 InstantDB 的离线功能
5. **添加实时更新提示**：当其他用户创建新 meme 时显示提示
