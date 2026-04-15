import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from './Login.module.css'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError(''); setMessage(''); setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      const { error, pending } = await signUp(email, password)
      if (error) setError(error)
      else if (pending) setMessage('Request received! The administrator will review your access. You\'ll be able to sign in once approved.')
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.mark}>◆</span>
          <h1 className={styles.title}>In Bloom</h1>
          <p className={styles.subtitle}>
            {mode === 'signin' ? 'A space for growth, one entry at a time.' : 'Request access to begin your practice.'}
          </p>
        </div>

        <div className={styles.form}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="you@example.com" autoComplete="email" />
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {message && (
            <div className={styles.pending}>
              <p className={styles.pendingIcon}>⏳</p>
              <p>{message}</p>
            </div>
          )}

          {!message && (
            <>
              <button className={`btn btn-primary ${styles.submitBtn}`} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Request Access'}
              </button>
              <div className="deco-line">or</div>
              <button className={`btn btn-secondary ${styles.switchBtn}`} onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('') }}>
                {mode === 'signin' ? 'Request access to this log' : 'Already have an account? Sign in'}
              </button>
            </>
          )}

          {message && (
            <button className={`btn btn-secondary ${styles.switchBtn}`} onClick={() => { setMode('signin'); setMessage(''); setError('') }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>

      <div className={styles.quote}>
        <blockquote>"Without reflection, we go blindly on our way."</blockquote>
        <cite>— Margaret J. Wheatley</cite>
      </div>
    </div>
  )
}
