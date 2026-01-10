import './TemplateSelector.css'

// 模板图片列表
const templates = [
  {
    name: 'EQBY4595',
    path: '/assets/EQBY4595.JPG',
  },
  {
    name: 'FNCJ8436',
    path: '/assets/FNCJ8436.JPG',
  },
  {
    name: 'EMKA9041',
    path: '/assets/EMKA9041.JPG',
  },
  {
    name: 'ESLW9369',
    path: '/assets/ESLW9369.JPG',
  },
]

function TemplateSelector({ onTemplateSelect }) {
  const handleTemplateClick = async (template) => {
    try {
      // 获取图片并转换为 File 对象
      const response = await fetch(template.path)
      const blob = await response.blob()
      const file = new File([blob], `${template.name}.JPG`, { type: 'image/jpeg' })
      onTemplateSelect(file)
    } catch (error) {
      console.error('加载模板失败:', error)
      alert('加载模板失败，请重试')
    }
  }

  return (
    <div className="template-selector">
      <h3 className="template-title">选择模板</h3>
      <div className="template-grid">
        {templates.map((template, index) => (
          <div
            key={index}
            className="template-item"
            onClick={() => handleTemplateClick(template)}
          >
            <img
              src={template.path}
              alt={template.name}
              className="template-thumbnail"
              loading="lazy"
            />
            <div className="template-overlay">
              <span className="template-name">{template.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TemplateSelector
