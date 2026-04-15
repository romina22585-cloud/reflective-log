import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import styles from './Settings.module.css'

export default function Settings() {
  const { profile, displayName, updateDisplayName } = useProfile()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    const { error } = await updateDisplayName(name)
    if (error) setError(error)
    else setSaved(true)
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your profile and preferences.</p>
      </div>

      <hr className="divider" />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your profile</h2>

        <div className={styles.card}>
          <div className="field">
            <label>Display name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setSaved(false) }}
              placeholder={displayName}
              maxLength={40}
            />
            <p className={styles.hint}>This is the name shown in your greeting. Leave blank to use your email username.</p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save name'}
            </button>
            {saved && <span className={styles.savedMsg}>✓ Saved</span>}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <div className={styles.card}>
          <div className={styles.accountRow}>
            <div>
              <p className={styles.accountLabel}>Email address</p>
              <p className={styles.accountValue}>{user?.email}</p>
            </div>
          </div>
          <hr className="divider" />
          <button className={`btn btn-secondary ${styles.signOutBtn}`} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sharing access</h2>
        <div className={styles.card}>
          <p className={styles.shareInfo}>
            Colleagues can request access by visiting your app URL and clicking <strong>"Request access to this log"</strong> on the sign-in page.
          </p>
          <p className={styles.shareInfo}>
            To approve a new user, go to your <strong>Supabase dashboard → Table Editor → profiles</strong> and set their <code>is_approved</code> field to <code>true</code>.
          </p>
          <div className={styles.urlBox}>
            <p className={styles.urlLabel}>Your app URL</p>
            <p className={styles.urlValue}>{window.location.origin}{window.location.pathname.replace('/settings', '')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
