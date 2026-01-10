import './TextControls.css'

function TextControls({ textItem, onUpdate, onDelete }) {
  return (
    <div className="text-controls">
      <div className="controls-header">
        <h3>文字编辑</h3>
        <button 
          className="delete-text-btn"
          onClick={onDelete}
          title="删除文字"
        >
          <span>✕</span>
        </button>
      </div>

      <div className="control-group">
        <label htmlFor="text-content">内容</label>
        <input
          id="text-content"
          type="text"
          value={textItem.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="输入文字..."
          className="text-input"
        />
      </div>

      <div className="control-group">
        <label htmlFor="font-size">
          大小
          <span className="value-badge">{textItem.fontSize}px</span>
        </label>
        <div className="slider-container">
          <input
            id="font-size"
            type="range"
            min="20"
            max="120"
            value={textItem.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="slider"
          />
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="text-color">颜色</label>
        <div className="color-picker-wrapper">
          <input
            id="text-color"
            type="color"
            value={textItem.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="color-picker"
          />
          <input
            type="text"
            value={textItem.color}
            onChange={(e) => {
              const value = e.target.value
              if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                onUpdate({ color: value })
              }
            }}
            placeholder="#FFFFFF"
            className="color-input"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  )
}

export default TextControls

