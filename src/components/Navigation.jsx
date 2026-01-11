import { db } from '../lib/instantdb'
import './Navigation.css'

function Navigation({ currentView, onViewChange }) {
  const auth = db.useAuth()
  const user = auth?.user || null
  const isLoading = auth?.isLoading || false

  const handleSignOut = async () => {
    try {
      await db.auth.signOut()
      onViewChange('gallery')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => onViewChange('gallery')}>
          <h1>Meme Generator</h1>
        </div>
        
        <div className="nav-links">
          <button
            className={`nav-link ${currentView === 'create' ? 'active' : ''}`}
            onClick={() => onViewChange('create')}
          >
            创建 Meme
          </button>
          <button
            className={`nav-link ${currentView === 'gallery' ? 'active' : ''}`}
            onClick={() => onViewChange('gallery')}
          >
            画廊
          </button>
          {user && (
            <button
              className={`nav-link ${currentView === 'mine' ? 'active' : ''}`}
              onClick={() => onViewChange('mine')}
            >
              我的 Memes
            </button>
          )}
        </div>

        <div className="nav-auth">
          {isLoading ? (
            <div className="loading">加载中...</div>
          ) : user ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">
                  {user.name || user.email || 'User'}
                </span>
                {user.avatar && (
                  <img src={user.avatar} alt="Avatar" className="user-avatar" />
                )}
              </div>
              <button className="sign-out-button" onClick={handleSignOut}>
                登出
              </button>
            </div>
          ) : (
            <button
              className="sign-in-button"
              onClick={() => onViewChange('auth')}
            >
              登录/注册
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
