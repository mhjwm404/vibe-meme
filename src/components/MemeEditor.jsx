import { useEffect, useRef, useState } from 'react'
import './MemeEditor.css'

function MemeEditor({
  imageFile,
  topText,
  bottomText,
  fontSize,
  topTextColor,
  bottomTextColor,
  topTextPosition,
  bottomTextPosition,
  onTopTextPositionChange,
  onBottomTextPositionChange,
}) {
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(null) // 'top' | 'bottom' | null
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)

  // 绘制文字函数
  const drawText = (ctx, text, x, y, fontSize, textColor) => {
    // 设置文字样式
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 计算文字宽度，用于添加背景
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = fontSize
    const padding = 10

    // 绘制黑色背景（圆角矩形）
    const bgX = x - textWidth / 2 - padding
    const bgY = y - textHeight / 2 - padding
    const bgWidth = textWidth + padding * 2
    const bgHeight = textHeight + padding * 2
    const radius = 5

    // 绘制圆角矩形（兼容性更好的方法）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
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

    // 绘制指定颜色的文字
    ctx.fillStyle = textColor || '#FFFFFF'
    ctx.fillText(text, x, y)

    // 绘制黑色描边（增强对比度）
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.strokeText(text, x, y)
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

    // 计算文字位置
    const topX = topTextPosition ? canvas.width * topTextPosition.x : canvas.width / 2
    const topY = topTextPosition ? canvas.height * topTextPosition.y : canvas.height * 0.1
    const bottomX = bottomTextPosition ? canvas.width * bottomTextPosition.x : canvas.width / 2
    const bottomY = bottomTextPosition ? canvas.height * bottomTextPosition.y : canvas.height * 0.9

    // 绘制顶部文字
    if (topText) {
      drawText(ctx, topText, topX, topY, fontSize, topTextColor)
    }

    // 绘制底部文字
    if (bottomText) {
      drawText(ctx, bottomText, bottomX, bottomY, fontSize, bottomTextColor)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 如果没有图片，显示占位符
    if (!imageFile) {
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#888'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('请选择一张图片', canvas.width / 2, canvas.height / 2)
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
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ff6b35'
      ctx.font = '24px Arial'
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
  }, [topText, bottomText, fontSize, topTextColor, bottomTextColor, topTextPosition, bottomTextPosition])

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
  const isPointInText = (x, y, text, textX, textY, fontSize) => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const ctx = canvas.getContext('2d')
    ctx.font = `bold ${fontSize}px Arial`
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = fontSize
    const padding = 10

    const bgX = textX - textWidth / 2 - padding
    const bgY = textY - textHeight / 2 - padding
    const bgWidth = textWidth + padding * 2
    const bgHeight = textHeight + padding * 2

    return (
      x >= bgX &&
      x <= bgX + bgWidth &&
      y >= bgY &&
      y <= bgY + bgHeight
    )
  }

  // 鼠标按下事件
  const handleMouseDown = (e) => {
    if (!imageRef.current) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    const topX = topTextPosition ? canvas.width * topTextPosition.x : canvas.width / 2
    const topY = topTextPosition ? canvas.height * topTextPosition.y : canvas.height * 0.1
    const bottomX = bottomTextPosition ? canvas.width * bottomTextPosition.x : canvas.width / 2
    const bottomY = bottomTextPosition ? canvas.height * bottomTextPosition.y : canvas.height * 0.9

    // 检查是否点击在顶部文字上
    if (topText && isPointInText(coords.x, coords.y, topText, topX, topY, fontSize)) {
      setIsDragging('top')
      setDragOffset({
        x: coords.x - topX,
        y: coords.y - topY,
      })
      return
    }

    // 检查是否点击在底部文字上
    if (bottomText && isPointInText(coords.x, coords.y, bottomText, bottomX, bottomY, fontSize)) {
      setIsDragging('bottom')
      setDragOffset({
        x: coords.x - bottomX,
        y: coords.y - bottomY,
      })
      return
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

    if (isDragging === 'top') {
      onTopTextPositionChange({ x: clampedX, y: clampedY })
    } else if (isDragging === 'bottom') {
      onBottomTextPositionChange({ x: clampedX, y: clampedY })
    }
  }

  // 鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(null)
    setDragOffset({ x: 0, y: 0 })
  }

  // 触摸事件支持（移动端）
  const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
    }
    handleMouseDown(syntheticEvent)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (!isDragging) return
    const touch = e.touches[0]
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
    }
    handleMouseMove(syntheticEvent)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    handleMouseUp()
  }

  return (
    <div className="meme-editor" style={{ position: 'relative' }}>
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : (topText || bottomText ? 'grab' : 'default') }}
      />
      {isDragging && (
        <div className="drag-hint">拖动文字到任意位置</div>
      )}
    </div>
  )
}

export default MemeEditor

