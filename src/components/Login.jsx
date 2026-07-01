import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode,     setMode]     = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [message,  setMessage]  = useState(null)
  const [busy,     setBusy]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setMessage(null); setBusy(true)

    const { error } = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (error) setError(error.message)
    else if (mode === 'signup')
      setMessage('Account created! Check your email to confirm, then sign in.')

    setBusy(false)
  }

  function switchMode() {
    setMode(m => m === 'signin' ? 'signup' : 'signin')
    setError(null); setMessage(null)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo"><i className="ti ti-trees"></i></div>
        <h1>Family Tree</h1>
        <p className="auth-subtitle">
          {mode === 'signin' ? 'Sign in to your family tree' : 'Create an account to get started'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="ft-field">
            <label>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" placeholder="you@example.com"
            />
          </div>
          <div className="ft-field">
            <label>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="At least 6 characters"
            />
          </div>

          {error   && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <button type="submit" className="ft-save-btn" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button className="auth-switch" onClick={switchMode}>
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
