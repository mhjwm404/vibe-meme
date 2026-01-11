import { useState, useEffect } from 'react'
import { db } from '../lib/instantdb'
import { saveTemplate, deleteTemplate } from '../lib/db'
import './TemplateSelector.css'

// 默认模板列表
const defaultTemplates = [
  {
    name: 'EQBY4595',
    path: '/assets/EQBY4595.JPG',
    isDefault: true,
  },
  {
    name: 'FNCJ8436',
    path: '/assets/FNCJ8436.JPG',
    isDefault: true,
  },
  {
    name: 'EMKA9041',
    path: '/assets/EMKA9041.JPG',
    isDefault: true,
  },
  {
    name: 'ESLW9369',
    path: '/assets/ESLW9369.JPG',
    isDefault: true,
  },
]

function TemplateSelector({ onTemplateSelect }) {
  // React hooks 必须在组件顶层无条件调用
  const auth = db.useAuth()
  const templatesResult = db.useQuery({ templates: {} })
  
  const user = auth?.user || null
  const templatesData = templatesResult?.data || { templates: [] }

  const [templates, setTemplates] = useState(defaultTemplates)

  // 合并默认模板和数据库模板
  useEffect(() => {
    const allTemplates = [...defaultTemplates]
    
    if (templatesData?.templates) {
      // 只显示默认模板或用户自己的模板
      const userTemplates = templatesData.templates
        .filter(t => t.isDefault || (user && t.userId === user.id))
        .map(t => ({
          ...t,
          path: t.imageUrl,
          isDbTemplate: true,
        }))
      
      allTemplates.push(...userTemplates)
    }
    
    setTemplates(allTemplates)
  }, [templatesData, user])

  const handleTemplateClick = async (template) => {
    try {
      let file
      
      if (template.isDefault) {
        // 默认模板：从 public 文件夹加载
        const response = await fetch(template.path)
        const blob = await response.blob()
        file = new File([blob], `${template.name}.JPG`, { type: 'image/jpeg' })
      } else {
        // 数据库模板：从 base64 URL 创建 File
        const response = await fetch(template.path)
        const blob = await response.blob()
        file = new File([blob], `${template.name}.jpg`, { type: 'image/jpeg' })
      }
      
      onTemplateSelect(file)
    } catch (error) {
      console.error('加载模板失败:', error)
      alert('加载模板失败，请重试')
    }
  }

  const handleSaveCurrentAsTemplate = async () => {
    // 这个功能可以在用户点击当前图片时调用
    // 需要在父组件中实现
  }

  const handleDeleteTemplate = async (templateId, e) => {
    e.stopPropagation()
    if (window.confirm('确定要删除这个模板吗？')) {
      try {
        deleteTemplate(templateId)
      } catch (error) {
        console.error('删除模板失败:', error)
        alert('删除失败，请重试')
      }
    }
  }

  return (
    <div className="template-selector">
      <div className="template-header">
        <h3 className="template-title">选择模板</h3>
        {user && (
          <button
            className="save-template-hint"
            title="当前图片可以作为模板保存"
          >
            💾
          </button>
        )}
      </div>
      <div className="template-grid">
        {templates.map((template, index) => (
          <div
            key={template.id || index}
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
              {!template.isDefault && template.isDbTemplate && user?.id === template.userId && (
                <button
                  className="template-delete-btn"
                  onClick={(e) => handleDeleteTemplate(template.id, e)}
                  title="删除模板"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TemplateSelector
