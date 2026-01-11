import { useState } from 'react'
import { db } from '../lib/instantdb'
import './Auth.css'

function Auth() {
  const [email, setEmail] = useState('')
  const [magicCode, setMagicCode] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('请输入邮箱地址')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await db.auth.sendMagicCode({
        email,
      })
      setShowCodeInput(true)
      setSuccess('验证码已发送到您的邮箱，请查收')
    } catch (err) {
      setError(err.message || '发送失败，请重试')
      setShowCodeInput(false)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!email || !magicCode) {
      setError('请输入邮箱和验证码')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await db.auth.signInWithMagicCode({
        email,
        code: magicCode,
      })
      setSuccess('登录成功！')
    } catch (err) {
      setError(err.message || '验证失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    try {
      const url = db.auth.createAuthorizationURL({
        clientName: 'google',
        redirectURL: window.location.href,
      })
      window.location.href = url
    } catch (err) {
      setError(err.message || 'Google 登录失败')
    }
  }

  const handleGuestSignIn = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await db.auth.signInAsGuest()
      setSuccess('已作为访客登录')
    } catch (err) {
      setError(err.message || '访客登录失败')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>登录 / 注册</h2>
        {!showCodeInput ? (
          <form onSubmit={handleMagicLink}>
            <div className="form-group">
              <label>邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? '发送中...' : '发送验证码到邮箱'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label>邮箱</label>
              <input
                type="email"
                value={email}
                disabled
                className="disabled-input"
              />
            </div>
            <div className="form-group">
              <label>验证码</label>
              <input
                type="text"
                value={magicCode}
                onChange={(e) => setMagicCode(e.target.value)}
                placeholder="请输入邮箱中的验证码"
                required
                disabled={loading}
                maxLength={6}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? '验证中...' : '验证并登录'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCodeInput(false)
                setMagicCode('')
                setError(null)
                setSuccess(null)
              }}
              className="link-button"
              style={{ marginTop: '10px' }}
            >
              返回重新发送
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>或</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="auth-button google-button"
          disabled={loading}
        >
          <span>🔵</span>
          使用 Google 登录
        </button>

        <button
          onClick={handleGuestSignIn}
          className="auth-button guest-button"
          disabled={loading}
        >
          👤 访客登录
        </button>
      </div>
    </div>
  )
}

export default Auth
