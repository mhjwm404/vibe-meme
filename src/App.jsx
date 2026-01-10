import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import TemplateSelector from './components/TemplateSelector'
import MemeEditor from './components/MemeEditor'
import TextControls from './components/TextControls'
import './styles/App.css'

function App() {
  const [imageFile, setImageFile] = useState(null)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(300)
  const [topTextColor, setTopTextColor] = useState('#FFFFFF')
  const [bottomTextColor, setBottomTextColor] = useState('#FFFFFF')
  // 文字位置（相对于canvas的百分比，null表示使用默认位置）
  const [topTextPosition, setTopTextPosition] = useState(null)
  const [bottomTextPosition, setBottomTextPosition] = useState(null)

  const handleImageUpload = (file) => {
    setImageFile(file)
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meme生成器</h1>
      </header>
      <main className="app-main">
        <div className="editor-container">
          <div className="canvas-section">
            <MemeEditor
              imageFile={imageFile}
              topText={topText}
              bottomText={bottomText}
              fontSize={fontSize}
              topTextColor={topTextColor}
              bottomTextColor={bottomTextColor}
              topTextPosition={topTextPosition}
              bottomTextPosition={bottomTextPosition}
              onTopTextPositionChange={setTopTextPosition}
              onBottomTextPositionChange={setBottomTextPosition}
            />
          </div>
          <div className="controls-section">
            <TemplateSelector onTemplateSelect={handleImageUpload} />
            <ImageUploader onImageUpload={handleImageUpload} />
            <TextControls
              topText={topText}
              bottomText={bottomText}
              fontSize={fontSize}
              topTextColor={topTextColor}
              bottomTextColor={bottomTextColor}
              onTopTextChange={setTopText}
              onBottomTextChange={setBottomText}
              onFontSizeChange={setFontSize}
              onTopTextColorChange={setTopTextColor}
              onBottomTextColorChange={setBottomTextColor}
            />
            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={!imageFile}
            >
              下载Meme
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

