import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import TemplateSelector from './components/TemplateSelector'
import MemeEditor from './components/MemeEditor'
import TextControls from './components/TextControls'
import './styles/App.css'

function App() {
  const [imageFile, setImageFile] = useState(null)
  // 文字数组，每个文字都有独立的位置、内容、样式
  const [textItems, setTextItems] = useState([])
  const [selectedTextId, setSelectedTextId] = useState(null)

  const handleImageUpload = (file) => {
    setImageFile(file)
    // 清空已有文字
    setTextItems([])
    setSelectedTextId(null)
  }

  // 添加新文字
  const addTextItem = (position) => {
    const newText = {
      id: Date.now().toString(),
      text: '双击编辑',
      position: position, // {x: 0-1, y: 0-1}
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

  const handleDownload = () => {
    const canvas = document.getElementById('meme-canvas')
    if (!canvas || !imageFile) {
      alert('请先选择一张图片')
      return
    }

    try {
      const link = document.createElement('a')
      link.download = `meme-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    }
  }

  // 获取当前选中的文字项
  const selectedText = textItems.find(item => item.id === selectedTextId)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meme 生成器</h1>
        <p className="app-subtitle">点击图片添加文字，拖动调整位置</p>
      </header>
      <main className="app-main">
        <div className="main-layout">
          {/* 左侧：模板选择器 */}
          <aside className="sidebar">
            <TemplateSelector onTemplateSelect={handleImageUpload} />
            <ImageUploader onImageUpload={handleImageUpload} />
          </aside>

          {/* 中间：Meme编辑器 */}
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

        {/* 底部：控制选项 */}
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
          
          {!selectedText && textItems.length === 0 && imageFile && (
            <div className="hint-card">
              <p>💡 点击图片添加文字</p>
            </div>
          )}

          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={!imageFile}
          >
            <span className="btn-icon">↓</span>
            下载 Meme
          </button>
        </div>
      </main>
    </div>
  )
}

export default App

