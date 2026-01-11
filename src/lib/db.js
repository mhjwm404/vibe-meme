import { db } from './instantdb'
import { id, tx } from '@instantdb/react'

// 保存 meme（草稿或已发布）
export const saveMeme = (memeData) => {
  const { userId, imageUrl, imageName, textItems, isPublished = false } = memeData
  const memeId = id()
  
  console.log('Saving meme:', { memeId, userId, imageName, textItemsCount: textItems?.length, isPublished })
  
  db.transact([
    tx.memes[memeId].update({
      userId,
      imageUrl,
      imageName,
      textItems: textItems || [],
      upvoteCount: 0,
      isPublished,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  ])
  
  console.log('Meme saved successfully:', memeId)
  return memeId
}

// 更新 meme
export const updateMeme = (memeId, updates) => {
  console.log('Updating meme:', { memeId, updates })
  db.transact([
    tx.memes[memeId].update({
      ...updates,
      updatedAt: Date.now(),
    }),
  ])
}

// 发布 meme
export const publishMeme = (memeId) => {
  console.log('Publishing meme:', memeId)
  db.transact([
    tx.memes[memeId].update({
      isPublished: true,
      updatedAt: Date.now(),
    }),
  ])
}

// 删除 meme
export const deleteMeme = (memeId) => {
  db.transact([
    tx.memes[memeId].delete(),
  ])
}

// Upvote meme - 使用查询获取当前值然后更新
export const toggleUpvote = (meme, userId, hasUpvoted, currentUpvoteId) => {
  if (hasUpvoted && currentUpvoteId) {
    // 取消点赞
    db.transact([
      tx.upvotes[currentUpvoteId].delete(),
      tx.memes[meme.id].update({
        upvoteCount: Math.max(0, (meme.upvoteCount || 0) - 1),
      }),
    ])
  } else {
    // 点赞
    const upvoteId = id()
    db.transact([
      tx.upvotes[upvoteId].update({
        userId,
        memeId: meme.id,
        createdAt: Date.now(),
      }),
      tx.memes[meme.id].update({
        upvoteCount: (meme.upvoteCount || 0) + 1,
      }),
    ])
  }
}

// 保存模板
export const saveTemplate = (templateData) => {
  const { userId, name, imageUrl, isDefault } = templateData
  const templateId = id()
  
  db.transact([
    tx.templates[templateId].update({
      userId: userId || null,
      name,
      imageUrl,
      isDefault: isDefault || false,
      createdAt: Date.now(),
    }),
  ])
  
  return templateId
}

// 删除模板
export const deleteTemplate = (templateId) => {
  db.transact([
    tx.templates[templateId].delete(),
  ])
}
