import { useEffect, useRef, useState } from 'react'
import './MemeEditor.css'

function MemeEditor({
  imageFile,
  textItems,
  selectedTextId,
  onTextClick,
  onTextUpdate,
  onCanvasClick,
}) {
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isEditingText, setIsEditingText] = useState(null)
  const imageRef = useRef(null)
  const inputRef = useRef(null)

  // 绘制单个文字项
  const drawTextItem = (ctx, textItem, isSelected) => {
    const canvas = canvasRef.current
    if (!canvas || !textItem.text) return

    const x = canvas.width * textItem.position.x
    const y = canvas.height * textItem.position.y

    // 设置文字样式
    ctx.font = `600 ${textItem.fontSize}px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 计算文字宽度
    const metrics = ctx.measureText(textItem.text)
    const textWidth = metrics.width
    const textHeight = textItem.fontSize * 1.2
    const padding = textItem.fontSize * 0.3

    // 绘制半透明背景
    const bgX = x - textWidth / 2 - padding
    const bgY = y - textHeight / 2 - padding
    const bgWidth = textWidth + padding * 2
    const bgHeight = textHeight + padding * 2
    const radius = textItem.fontSize * 0.2

    // 如果被选中，绘制选中状态
    if (isSelected) {
      ctx.fillStyle = 'rgba(0, 122, 255, 0.15)'
      ctx.strokeStyle = 'rgba(0, 122, 255, 0.8)'
      ctx.lineWidth = 3
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.strokeStyle = 'transparent'
    }

    // 绘制圆角矩形背景
    ctx.beginPath()
    ctx.moveTo(bgX + radius, bgY)
    ctx.lineTo(bgX + bgWidth - radius, bgY)
    ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius)
    ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius)
    ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight)
    ctx.lineTo(bgX + radius, bgY + bgHeight)
    ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius)
    ctx.lineTo(bgX, bgY + radius)
    ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY)
    ctx.closePath()
    ctx.fill()
    
    if (isSelected) {
      ctx.stroke()
    }

    // 绘制文字（带阴影效果）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = textItem.fontSize * 0.1
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = textItem.fontSize * 0.05
    
    ctx.fillStyle = textItem.color
    ctx.fillText(textItem.text, x, y)
    
    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  // 重绘画布
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制图片
    ctx.drawImage(imageRef.current, 0, 0)

    // 绘制所有文字（先绘制未选中的，再绘制选中的，让选中的在最上层）
    textItems
      .filter(item => item.id !== selectedTextId)
      .forEach(item => drawTextItem(ctx, item, false))
    
    const selectedItem = textItems.find(item => item.id === selectedTextId)
    if (selectedItem) {
      drawTextItem(ctx, selectedItem, true)
    }
  }

  // 加载图片
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 如果没有图片，显示占位符
    if (!imageFile) {
      ctx.fillStyle = '#f5f5f7'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#86868b'
      ctx.font = '400 20px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('选择或拖入一张图片开始创作', canvas.width / 2, canvas.height / 2)
      return
    }

    // 加载图片
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      // 设置canvas尺寸为图片尺寸
      canvas.width = img.width
      canvas.height = img.height

      // 绘制图片和文字
      redrawCanvas()
    }

    img.onerror = () => {
      ctx.fillStyle = '#f5f5f7'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ff3b30'
      ctx.font = '400 20px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('图片加载失败', canvas.width / 2, canvas.height / 2)
    }

    // 使用FileReader读取图片
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // 当文字内容、位置或样式改变时重绘
  useEffect(() => {
    if (imageRef.current) {
      redrawCanvas()
    }
  }, [textItems, selectedTextId])

  // 获取canvas上的实际坐标（考虑缩放）
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  // 检查点击是否在文字区域内
  const getTextItemAtPoint = (x, y) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')

    // 从后往前检查（后面的文字在上层）
    for (let i = textItems.length - 1; i >= 0; i--) {
      const item = textItems[i]
      if (!item.text) continue

      const textX = canvas.width * item.position.x
      const textY = canvas.height * item.position.y

      ctx.font = `600 ${item.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
      const metrics = ctx.measureText(item.text)
      const textWidth = metrics.width
      const textHeight = item.fontSize * 1.2
      const padding = item.fontSize * 0.3

      const bgX = textX - textWidth / 2 - padding
      const bgY = textY - textHeight / 2 - padding
      const bgWidth = textWidth + padding * 2
      const bgHeight = textHeight + padding * 2

      if (x >= bgX && x <= bgX + bgWidth && y >= bgY && y <= bgY + bgHeight) {
        return item
      }
    }

    return null
  }

  // 鼠标按下事件
  const handleMouseDown = (e) => {
    if (!imageRef.current) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const clickedItem = getTextItemAtPoint(coords.x, coords.y)

    if (clickedItem) {
      // 点击在文字上
      onTextClick(clickedItem.id)
      
      const canvas = canvasRef.current
      const textX = canvas.width * clickedItem.position.x
      const textY = canvas.height * clickedItem.position.y

      setIsDragging(clickedItem.id)
      setDragOffset({
        x: coords.x - textX,
        y: coords.y - textY,
      })
    } else {
      // 点击在空白处，取消选中
      onTextClick(null)
    }
  }

  // 双击编辑文字
  const handleDoubleClick = (e) => {
    if (!imageRef.current) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const clickedItem = getTextItemAtPoint(coords.x, coords.y)

    if (clickedItem) {
      setIsEditingText(clickedItem.id)
      // 延迟聚焦，确保输入框已渲染
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 0)
    }
  }

  // 鼠标移动事件
  const handleMouseMove = (e) => {
    if (!isDragging || !imageRef.current) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const newX = (coords.x - dragOffset.x) / canvas.width
    const newY = (coords.y - dragOffset.y) / canvas.height

    // 限制在canvas范围内
    const clampedX = Math.max(0, Math.min(1, newX))
    const clampedY = Math.max(0, Math.min(1, newY))

    onTextUpdate(isDragging, {
      position: { x: clampedX, y: clampedY }
    })
  }

  // 鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(null)
    setDragOffset({ x: 0, y: 0 })
  }

  // 点击canvas空白处添加文字
  const handleCanvasClick = (e) => {
    if (isDragging) return // 如果在拖动，不添加新文字
    if (!imageRef.current) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const clickedItem = getTextItemAtPoint(coords.x, coords.y)
    if (clickedItem) return // 如果点击在文字上，不添加新文字

    const canvas = canvasRef.current
    const position = {
      x: coords.x / canvas.width,
      y: coords.y / canvas.height,
    }

    onCanvasClick(position)
  }

  // 触摸事件支持（移动端）
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
    }
    handleMouseDown(syntheticEvent)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
    }
    handleMouseMove(syntheticEvent)
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  return (
    <div className="meme-editor">
      <canvas
        id="meme-canvas"
        ref={canvasRef}
        className="meme-canvas"
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: isDragging ? 'grabbing' : (imageFile ? 'crosshair' : 'default')
        }}
      />
      {isDragging && (
        <div className="drag-hint">
          <span>拖动调整位置</span>
        </div>
      )}
      {isEditingText && (
        <div className="text-input-overlay">
          <input
            ref={inputRef}
            type="text"
            value={textItems.find(t => t.id === isEditingText)?.text || ''}
            onChange={(e) => onTextUpdate(isEditingText, { text: e.target.value })}
            onBlur={() => setIsEditingText(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditingText(null)
              }
            }}
            className="text-input-field"
          />
        </div>
      )}
    </div>
  )
}

export default MemeEditor

