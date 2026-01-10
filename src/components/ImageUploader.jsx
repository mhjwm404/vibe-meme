import { useRef } from 'react'
import './ImageUploader.css'

function ImageUploader({ onImageUpload }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      // 检查文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert('图片文件过大，请选择小于10MB的图片')
        return
      }
      onImageUpload(file)
    } else if (file) {
      alert('请选择有效的图片文件')
    }
    // 重置input，允许重复选择同一文件
    e.target.value = ''
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button className="upload-btn" onClick={handleClick}>
        选择图片
      </button>
    </div>
  )
}

export default ImageUploader

