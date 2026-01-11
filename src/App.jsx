import { useState, useEffect } from 'react'
import { db } from './lib/instantdb'
import { saveMeme, updateMeme, publishMeme } from './lib/db'
import ImageUploader from './components/ImageUploader'
import TemplateSelector from './components/TemplateSelector'
import MemeEditor from './components/MemeEditor'
import TextControls from './components/TextControls'
import Navigation from './components/Navigation'
import MemeGallery from './components/MemeGallery'
import Auth from './components/Auth'
import './styles/App.css'

function App() {
  const [currentView, setCurrentView] = useState('gallery') // 'auth', 'create', 'gallery', 'mine'
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null) // 存储 base64 或 URL
  const [imageName, setImageName] = useState('')
  const [textItems, setTextItems] = useState([])
  const [selectedTextId, setSelectedTextId] = useState(null)
  const [currentMemeId, setCurrentMemeId] = useState(null) // 当前编辑的 meme ID
  const [currentMemeIsPublished, setCurrentMemeIsPublished] = useState(false) // 当前meme是否已发布
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  
  // React hooks 必须在组件顶层无条件调用
  const auth = db.useAuth()
  const user = auth?.user || null

  // 将 File 转换为 base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (file) => {
    setImageFile(file)
    setImageName(file.name || `meme-${Date.now()}.jpg`)
    setTextItems([])
    setSelectedTextId(null)
    setCurrentMemeId(null)
    
    try {
      const base64 = await fileToBase64(file)
      setImageUrl(base64)
    } catch (error) {
      console.error('图片转换失败:', error)
      alert('图片加载失败，请重试')
    }
  }

  // 从数据库加载 meme
  const loadMemeForEdit = (meme) => {
    setCurrentMemeId(meme.id)
    setCurrentMemeIsPublished(meme.isPublished || false)
    setImageName(meme.imageName || 'Untitled')
    setImageUrl(meme.imageUrl)
    setTextItems(meme.textItems || [])
    setSelectedTextId(null)
    
    // 将 base64 转换为 File 对象以兼容 MemeEditor
    if (meme.imageUrl.startsWith('data:')) {
      fetch(meme.imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], meme.imageName || 'meme.jpg', { type: 'image/jpeg' })
          setImageFile(file)
        })
        .catch(err => console.error('加载图片失败:', err))
    }
    
    setCurrentView('create')
  }

  // 添加新文字
  const addTextItem = (position) => {
    const newText = {
      id: Date.now().toString(),
      text: '双击编辑',
      position: position,
      fontSize: 48,
      color: '#FFFFFF',
    }
    setTextItems([...textItems, newText])
    setSelectedTextId(newText.id)
  }

  // 更新文字项
  const updateTextItem = (id, updates) => {
    setTextItems(textItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  // 删除文字项
  const deleteTextItem = (id) => {
    setTextItems(textItems.filter(item => item.id !== id))
    if (selectedTextId === id) {
      setSelectedTextId(null)
    }
  }

  // 保存 meme 到数据库（草稿）
  const handleSaveMeme = async () => {
    if (!user) {
      alert('请先登录')
      setCurrentView('auth')
      return
    }

    if (!imageUrl) {
      alert('请先选择一张图片')
      return
    }

    setSaving(true)
    try {
      // 从canvas获取最终渲染的图片（包含文字）
      const canvas = document.getElementById('meme-canvas')
      if (!canvas) {
        alert('Canvas未找到，请重试')
        setSaving(false)
        return
      }

      // 将canvas转换为base64图片
      const finalImageUrl = canvas.toDataURL('image/png')

      const memeData = {
        userId: user.id,
        imageUrl: finalImageUrl, // 使用canvas渲染后的完整图片
        imageName,
        textItems, // 仍然保存文字信息，用于后续编辑
        isPublished: false, // 保存为草稿
      }

      if (currentMemeId) {
        // 更新现有 meme
        updateMeme(currentMemeId, { ...memeData, isPublished: currentMemeIsPublished })
      } else {
        // 创建新 meme（草稿）
        const memeId = saveMeme(memeData)
        setCurrentMemeId(memeId)
        setCurrentMemeIsPublished(false)
      }
      
      alert('保存成功！')
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 发布 meme
  const handlePublishMeme = async () => {
    if (!user) {
      alert('请先登录')
      setCurrentView('auth')
      return
    }

    if (!imageUrl) {
      alert('请先选择一张图片')
      return
    }

    setPublishing(true)
    try {
      // 从canvas获取最终渲染的图片（包含文字）
      const canvas = document.getElementById('meme-canvas')
      if (!canvas) {
        alert('Canvas未找到，请重试')
        setPublishing(false)
        return
      }

      // 将canvas转换为base64图片
      const finalImageUrl = canvas.toDataURL('image/png')

      const memeData = {
        userId: user.id,
        imageUrl: finalImageUrl, // 使用canvas渲染后的完整图片
        imageName,
        textItems, // 仍然保存文字信息，用于后续编辑
        isPublished: true, // 发布状态
      }

      if (currentMemeId) {
        // 如果已经有ID，先更新内容再发布
        updateMeme(currentMemeId, memeData)
        setCurrentMemeIsPublished(true)
      } else {
        // 创建新 meme 并直接发布
        const memeId = saveMeme(memeData)
        setCurrentMemeId(memeId)
        setCurrentMemeIsPublished(true)
      }
      
      alert('发布成功！')
      // 发布后跳转到画廊
      setTimeout(() => {
        setCurrentView('gallery')
      }, 500)
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请重试')
    } finally {
      setPublishing(false)
    }
  }

  const handleDownload = () => {
    const canvas = document.getElementById('meme-canvas')
    if (!canvas || !imageUrl) {
      alert('请先选择一张图片')
      return
    }

    try {
      const link = document.createElement('a')
      link.download = `${imageName || `meme-${Date.now()}`}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    }
  }

  // 新建 meme
  const handleNewMeme = () => {
    if (!user) {
      setCurrentView('auth')
      return
    }
    setImageFile(null)
    setImageUrl(null)
    setImageName('')
    setTextItems([])
    setSelectedTextId(null)
    setCurrentMemeId(null)
    setCurrentMemeIsPublished(false)
    setCurrentView('create')
  }

  // 根据认证状态调整视图
  useEffect(() => {
    if (!user && (currentView === 'create' || currentView === 'mine')) {
      setCurrentView('auth')
    }
  }, [user, currentView])

  // 获取当前选中的文字项
  const selectedText = textItems.find(item => item.id === selectedTextId)

  // 渲染不同视图
  const renderView = () => {
    switch (currentView) {
      case 'auth':
        return <Auth />
      
      case 'gallery':
      case 'mine':
        return (
          <MemeGallery
            userId={currentView === 'mine' ? user?.id : null}
            onEditMeme={loadMemeForEdit}
          />
        )
      
      case 'create':
        return (
          <div className="create-view">
            <header className="app-header">
              <h1>创建 Meme</h1>
              <p className="app-subtitle">点击图片添加文字，拖动调整位置</p>
            </header>
            <main className="app-main">
              <div className="main-layout">
                <aside className="sidebar">
                  <TemplateSelector onTemplateSelect={handleImageUpload} />
                  <ImageUploader onImageUpload={handleImageUpload} />
                </aside>

                <div className="canvas-section">
                  <MemeEditor
                    imageFile={imageFile}
                    textItems={textItems}
                    selectedTextId={selectedTextId}
                    onTextClick={setSelectedTextId}
                    onTextUpdate={updateTextItem}
                    onCanvasClick={addTextItem}
                  />
                </div>
              </div>

              <div className="bottom-controls">
                {selectedText && (
                  <TextControls
                    textItem={selectedText}
                    onUpdate={(updates) => updateTextItem(selectedText.id, updates)}
                    onDelete={() => deleteTextItem(selectedText.id)}
                  />
                )}
                
                {!selectedText && textItems.length > 0 && (
                  <div className="hint-card">
                    <p>💡 点击图片上的文字进行编辑</p>
                  </div>
                )}
                
                {!selectedText && textItems.length === 0 && imageUrl && (
                  <div className="hint-card">
                    <p>💡 点击图片添加文字</p>
                  </div>
                )}

                <div className="action-buttons">
                  <button
                    className="save-btn"
                    onClick={handleSaveMeme}
                    disabled={!imageUrl || saving || !user}
                  >
                    <span className="btn-icon">💾</span>
                    {saving ? '保存中...' : '保存草稿'}
                  </button>
                  <button
                    className="publish-btn"
                    onClick={handlePublishMeme}
                    disabled={!imageUrl || publishing || !user}
                  >
                    <span className="btn-icon">🚀</span>
                    {publishing ? '发布中...' : currentMemeIsPublished ? '已发布' : '发布'}
                  </button>
                  <button
                    className="download-btn"
                    onClick={handleDownload}
                    disabled={!imageUrl}
                  >
                    <span className="btn-icon">↓</span>
                    下载 Meme
                  </button>
                </div>
              </div>
            </main>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="app">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {renderView()}
    </div>
  )
}

export default App

