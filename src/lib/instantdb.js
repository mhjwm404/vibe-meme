import { init, i, id, tx } from '@instantdb/react'

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID || '2eec2daf-3ad4-4471-b06f-23d75cbe6f3a'

// 初始化 InstantDB
// 注意：根据 InstantDB 的文档，schema 可能需要在 InstantDB 控制台中定义
// 或者使用不同的格式。先不使用 schema，让应用能够运行
let db
let schema = null

try {
  console.log('Initializing InstantDB with appId:', APP_ID)
  
  // 尝试不带 schema 初始化（schema 可能在控制台定义）
  db = init({
    appId: APP_ID,
  })
  console.log('InstantDB initialized successfully:', db)
  
  // 尝试定义 schema（如果支持）
  try {
    schema = i.schema({
      memes: {
        userId: i.string(),
        imageUrl: i.string(),
        imageName: i.string(),
        textItems: i.json(),
        upvoteCount: i.number(),
        createdAt: i.number(),
        updatedAt: i.number(),
      },
      templates: {
        userId: i.string().optional(),
        name: i.string(),
        imageUrl: i.string(),
        isDefault: i.boolean(),
        createdAt: i.number(),
      },
      upvotes: {
        userId: i.string(),
        memeId: i.string(),
        createdAt: i.number(),
      },
    })
    console.log('Schema defined successfully')
  } catch (schemaError) {
    console.warn('Schema definition failed (schema may be defined in InstantDB console):', schemaError)
    // Schema 可能需要在 InstantDB 控制台定义，继续使用 db
  }
} catch (error) {
  console.error('Failed to initialize InstantDB:', error)
  // 创建一个模拟的 db 对象以避免应用崩溃
  db = {
    useAuth: () => ({ user: null, isLoading: false }),
    useQuery: () => ({ data: {}, isLoading: false }),
    transact: () => console.warn('InstantDB not initialized'),
    auth: {
      sendMagicCode: () => Promise.resolve({ error: null }),
      signInWithMagicCode: () => Promise.resolve({ error: null }),
      signInAsGuest: () => Promise.resolve({ error: null }),
      createAuthorizationURL: () => '#',
      signOut: () => Promise.resolve(),
    },
  }
}

export { db, schema, id, tx }
