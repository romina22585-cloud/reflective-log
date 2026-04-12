import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.logoMark}>◆</span>
          <span className={styles.logoText}>Reflective Log</span>
        </button>
        <div className={styles.headerRight}>
          {location.pathname !== '/' && (
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              ← Back
            </button>
          )}
          <span className={styles.userEmail}>{user?.email?.split('@')[0]}</span>
          <button className="btn btn-ghost" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>Your thoughts, your growth.</p>
      </footer>
    </div>
  )
}
