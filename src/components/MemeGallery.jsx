import { useState } from 'react'
import { db } from '../lib/instantdb'
import { deleteMeme, toggleUpvote } from '../lib/db'
import MemeViewer from './MemeViewer'
import './MemeGallery.css'

function MemeGallery({ userId, onEditMeme }) {
  const [filter, setFilter] = useState('all') // 'all', 'mine', 'drafts'
  const [selectedMeme, setSelectedMeme] = useState(null) // 用于查看的meme
  
  // 查询所有 memes 和 upvotes - React hooks 必须在组件顶层无条件调用
  const memesResult = db.useQuery({ memes: {} })
  const upvotesResult = db.useQuery({ upvotes: {} })
  
  const memesData = memesResult?.data || { memes: [] }
  const isLoading = memesResult?.isLoading || false
  const upvotesData = upvotesResult?.data || { upvotes: [] }
  
  // 添加调试信息
  console.log('MemeGallery render:', {
    memesCount: memesData?.memes?.length || 0,
    upvotesCount: upvotesData?.upvotes?.length || 0,
    isLoading,
    userId,
    filter,
  })

  // 过滤 memes
  let memes = memesData?.memes || []
  
  if (filter === 'all') {
    // 画廊视图：只显示已发布的 memes
    memes = memes.filter(meme => meme.isPublished === true)
  } else if (filter === 'mine' && userId) {
    // 我的 memes：显示自己的所有已发布的 memes
    memes = memes.filter(meme => meme.userId === userId && meme.isPublished === true)
  } else if (filter === 'drafts' && userId) {
    // 草稿：显示自己的未发布的 memes
    memes = memes.filter(meme => meme.userId === userId && meme.isPublished !== true)
  }

  // 对 memes 按 upvoteCount 和 createdAt 排序
  const sortedMemes = [...memes].sort((a, b) => {
    if (b.upvoteCount !== a.upvoteCount) {
      return b.upvoteCount - a.upvoteCount
    }
    return (b.createdAt || 0) - (a.createdAt || 0)
  })

  // 检查用户是否已点赞某个 meme
  const getUserUpvote = (memeId) => {
    if (!userId || !upvotesData?.upvotes) return null
    return upvotesData.upvotes.find(
      (u) => u.memeId === memeId && u.userId === userId
    )
  }

  const handleUpvote = (meme) => {
    if (!userId) {
      alert('请先登录')
      return
    }
    
    const existingUpvote = getUserUpvote(meme.id)
    toggleUpvote(meme, userId, !!existingUpvote, existingUpvote?.id)
  }

  const handleDelete = (memeId) => {
    if (window.confirm('确定要删除这个 meme 吗？')) {
      deleteMeme(memeId)
    }
  }

  const handleViewMeme = (meme) => {
    setSelectedMeme(meme)
  }

  const handleCloseViewer = () => {
    setSelectedMeme(null)
  }

  const convertBase64ToBlob = (base64String) => {
    // 如果已经是 data URL，直接返回
    if (base64String.startsWith('data:')) {
      return base64String
    }
    // 如果不是完整的 data URL，添加前缀
    if (!base64String.startsWith('data:image')) {
      return `data:image/jpeg;base64,${base64String}`
    }
    return base64String
  }

  if (isLoading) {
    return (
      <div className="meme-gallery-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="meme-gallery">
      <div className="gallery-header">
        <h2>Meme Gallery</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          {userId && (
            <>
              <button
                className={filter === 'mine' ? 'active' : ''}
                onClick={() => setFilter('mine')}
              >
                我的 Memes
              </button>
              <button
                className={filter === 'drafts' ? 'active' : ''}
                onClick={() => setFilter('drafts')}
              >
                草稿箱
              </button>
            </>
          )}
        </div>
      </div>

      {sortedMemes.length === 0 ? (
        <div className="empty-gallery">
          <p>
            {filter === 'drafts' 
              ? '还没有草稿，开始创建你的第一个 meme 吧！'
              : filter === 'mine'
              ? '还没有发布任何 meme，快去创建吧！'
              : '还没有 meme，开始创建你的第一个吧！'
            }
          </p>
        </div>
      ) : (
        <div className="gallery-grid">
          {sortedMemes.map((meme) => {
            const upvote = getUserUpvote(meme.id)
            const hasUpvoted = !!upvote

            return (
              <div key={meme.id} className="meme-card">
                <div className="meme-image-container">
                  <img
                    src={convertBase64ToBlob(meme.imageUrl)}
                    alt={meme.imageName || 'Meme'}
                    className="meme-image"
                    onClick={() => handleViewMeme(meme)}
                    style={{ cursor: 'pointer' }}
                    title="点击查看大图"
                  />
                  {/* 草稿标签 */}
                  {!meme.isPublished && (
                    <div className="draft-badge">草稿</div>
                  )}
                  {onEditMeme && (
                    <button
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditMeme(meme)
                      }}
                      title="编辑"
                    >
                      ✏️
                    </button>
                  )}
                  {userId && meme.userId === userId && (
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(meme.id)
                      }}
                      title="删除"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div className="meme-info">
                  <div className="meme-name">{meme.imageName || 'Untitled'}</div>
                  <div className="meme-actions">
                    <button
                      className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
                      onClick={() => handleUpvote(meme)}
                      disabled={!userId}
                      title={hasUpvoted ? '取消点赞' : '点赞'}
                    >
                      <span className="upvote-icon">⬆️</span>
                      <span className="upvote-count">{meme.upvoteCount || 0}</span>
                    </button>
                    <div className="meme-date">
                      {meme.createdAt
                        ? new Date(meme.createdAt).toLocaleDateString('zh-CN')
                        : ''}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Meme 查看器 */}
      {selectedMeme && (
        <MemeViewer meme={selectedMeme} onClose={handleCloseViewer} />
      )}
    </div>
  )
}

export default MemeGallery
