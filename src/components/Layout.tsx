import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import styles from './Layout.module.css'

export default function Layout() {
  const { displayName } = useProfile()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.logoMark}>◆</span>
          <span className={styles.logoText}>Reflective Log</span>
        </button>
        <div className={styles.headerRight}>
          {!isHome && (
            <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back</button>
          )}
          <button className={styles.userBtn} onClick={() => navigate('/settings')} title="Settings">
            <span className={styles.userAvatar}>{displayName.charAt(0).toUpperCase()}</span>
            <span className={styles.userName}>{displayName}</span>
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
