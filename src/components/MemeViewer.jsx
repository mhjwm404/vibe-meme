import { useEffect } from 'react'
import './MemeViewer.css'

function MemeViewer({ meme, onClose }) {
  // 按ESC键关闭
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // 防止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!meme) return null

  const convertBase64ToBlob = (base64String) => {
    if (base64String.startsWith('data:')) {
      return base64String
    }
    if (!base64String.startsWith('data:image')) {
      return `data:image/jpeg;base64,${base64String}`
    }
    return base64String
  }

  return (
    <div className="meme-viewer-overlay" onClick={onClose}>
      <div className="meme-viewer-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} title="关闭 (ESC)">
          ✕
        </button>
        
        <div className="meme-viewer-content">
          <img
            src={convertBase64ToBlob(meme.imageUrl)}
            alt={meme.imageName || 'Meme'}
            className="meme-viewer-image"
          />
        </div>

        <div className="meme-viewer-info">
          <div className="meme-viewer-title">
            {meme.imageName || 'Untitled Meme'}
          </div>
          <div className="meme-viewer-meta">
            <span className="meme-viewer-upvotes">
              ⬆️ {meme.upvoteCount || 0} 点赞
            </span>
            <span className="meme-viewer-date">
              {meme.createdAt
                ? new Date(meme.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemeViewer
