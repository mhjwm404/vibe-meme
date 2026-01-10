import './TextControls.css'

// 验证颜色值是否有效
const isValidColor = (color) => {
  if (!color) return false
  // 检查是否是有效的hex颜色格式
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexPattern.test(color)
}

function TextControls({
  topText,
  bottomText,
  fontSize,
  topTextColor,
  bottomTextColor,
  onTopTextChange,
  onBottomTextChange,
  onFontSizeChange,
  onTopTextColorChange,
  onBottomTextColorChange,
}) {
  return (
    <div className="text-controls">
      <div className="control-group">
        <label htmlFor="top-text">顶部文字</label>
        <input
          id="top-text"
          type="text"
          value={topText}
          onChange={(e) => onTopTextChange(e.target.value)}
          placeholder="输入顶部文字..."
          className="text-input"
        />
      </div>

      <div className="control-group">
        <label htmlFor="bottom-text">底部文字</label>
        <input
          id="bottom-text"
          type="text"
          value={bottomText}
          onChange={(e) => onBottomTextChange(e.target.value)}
          placeholder="输入底部文字..."
          className="text-input"
        />
      </div>

      <div className="control-group">
        <label htmlFor="font-size">
          字体大小: {fontSize}px
        </label>
        <input
          id="font-size"
          type="range"
          min="200"
          max="500"
          value={fontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="font-size-slider"
        />
        <div className="slider-labels">
          <span>200px</span>
          <span>500px</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="top-text-color">顶部文字颜色</label>
        <div className="color-picker-wrapper">
          <input
            id="top-text-color"
            type="color"
            value={topTextColor}
            onChange={(e) => onTopTextColorChange(e.target.value)}
            className="color-picker"
          />
          <input
            type="text"
            value={topTextColor}
            onChange={(e) => {
              const value = e.target.value
              // 如果输入为空或有效颜色值，则更新
              if (!value || isValidColor(value)) {
                onTopTextColorChange(value || '#FFFFFF')
              }
            }}
            placeholder="#FFFFFF"
            className="color-input"
          />
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="bottom-text-color">底部文字颜色</label>
        <div className="color-picker-wrapper">
          <input
            id="bottom-text-color"
            type="color"
            value={bottomTextColor}
            onChange={(e) => onBottomTextColorChange(e.target.value)}
            className="color-picker"
          />
          <input
            type="text"
            value={bottomTextColor}
            onChange={(e) => {
              const value = e.target.value
              // 如果输入为空或有效颜色值，则更新
              if (!value || isValidColor(value)) {
                onBottomTextColorChange(value || '#FFFFFF')
              }
            }}
            placeholder="#FFFFFF"
            className="color-input"
          />
        </div>
      </div>
    </div>
  )
}

export default TextControls

