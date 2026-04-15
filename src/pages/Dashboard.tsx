import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEntries } from '../hooks/useEntries'
import { format, isToday, isThisWeek } from 'date-fns'
import { Entry } from '../types'
import HabitsTracker from '../components/HabitsTracker'
import { useProfile } from '../hooks/useProfile'
import MultiEntryInsights from '../components/MultiEntryInsights'
import styles from './Dashboard.module.css'

const TYPE_LABELS = { daily: 'Daily Check-in', freewrite: 'Free Write', weekly: 'Weekly Review', morning: 'Morning' }
const TYPE_PROMPTS = {
  morning: 'Energy · Gratitude · Intention · ~5 min',
  daily: '5 guided questions · ~10 minutes',
  freewrite: 'Open page · write freely',
  weekly: 'Patterns & growth · ~15 minutes',
}

function getPreview(entry: Entry): string {
  const c = entry.content as Record<string, unknown>
  if (entry.type === 'morning') return (c.intention as string) || (c.gratitude as string) || ''
  if (entry.type === 'daily') return (c.highlight as string) || ''
  if (entry.type === 'freewrite') return (c.text as string) || ''
  if (entry.type === 'weekly') return (c.wins as string) || ''
  return ''
}

export default function Dashboard() {
  const { user } = useAuth()
  const { displayName } = useProfile()
  const { entries, loading, deleteEntry } = useEntries()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const firstName = displayName
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const hasMorningToday = entries.some(e => e.type === 'morning' && isToday(new Date(e.created_at)))
  const hasEntryToday = entries.some(e => e.type === 'daily' && isToday(new Date(e.created_at)))
  const hasWeeklyThisWeek = entries.some(e => e.type === 'weekly' && isThisWeek(new Date(e.created_at)))

  const filtered = entries.filter(e => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const preview = getPreview(e).toLowerCase()
    const type = TYPE_LABELS[e.type].toLowerCase()
    const date = format(new Date(e.created_at), 'd MMMM yyyy').toLowerCase()
    const c = e.content as Record<string, unknown>
    const allText = Object.values(c).filter(v => typeof v === 'string').join(' ').toLowerCase()
    return preview.includes(q) || type.includes(q) || date.includes(q) || allText.includes(q)
  })

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this entry? This cannot be undone.')) await deleteEntry(id)
  }

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <p className={styles.greetingLabel}>{greeting},</p>
        <h1 className={styles.greetingName}>{firstName}</h1>
        <p className={styles.greetingDate}>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* Habits */}
      <section className={styles.section}>
        <HabitsTracker />
      </section>

      {/* New Entry */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Begin a new entry</h2>
        <div className={styles.entryCards}>
          {(['morning', 'daily', 'freewrite', 'weekly'] as const).map(type => {
            const done = type === 'morning' ? hasMorningToday : type === 'daily' ? hasEntryToday : type === 'weekly' ? hasWeeklyThisWeek : false
            const icons = { morning: '🌅', daily: '☀', freewrite: '✦', weekly: '◈' }
            return (
              <button key={type} className={`${styles.entryTypeCard} ${done ? styles.done : ''}`} onClick={() => navigate(`/new/${type}`)}>
                <span className={styles.typeIcon}>{icons[type]}</span>
                <div>
                  <p className={styles.typeName}>{TYPE_LABELS[type]}</p>
                  <p className={styles.typeHint}>{TYPE_PROMPTS[type]}</p>
                </div>
                {done && <span className={styles.doneBadge}>✓</span>}
              </button>
            )
          })}
        </div>
      </section>

      {/* Multi-entry insights */}
      <section className={styles.section}>
        <MultiEntryInsights entries={entries} />
      </section>

      {/* Search + Past entries */}
      <section className={styles.section}>
        <div className={styles.pastHeader}>
          <h2 className={styles.sectionTitle}>Past entries</h2>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="search"
              placeholder="Search entries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>}
          </div>
        </div>

        {loading && <p className={styles.empty}>Loading your entries…</p>}

        {!loading && entries.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>◇</p>
            <p>Your log is empty. Begin your first entry above.</p>
          </div>
        )}

        {!loading && entries.length > 0 && filtered.length === 0 && (
          <p className={styles.empty}>No entries match "{search}"</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className={styles.entryList}>
            {filtered.map((entry, i) => (
              <div key={entry.id} className={styles.entryRow} style={{ animationDelay: `${i * 40}ms` }} onClick={() => navigate(`/entry/${entry.id}`)}>
                <div className={styles.entryMeta}>
                  <span className={`tag tag-${entry.type}`}>{TYPE_LABELS[entry.type]}</span>
                  <span className={styles.entryDate}>{format(new Date(entry.created_at), 'd MMM yyyy')}</span>
                </div>
                <p className={styles.entryPreview}>{getPreview(entry)}</p>
                <button className={styles.deleteBtn} onClick={(e) => handleDelete(entry.id, e)} title="Delete entry">✕</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
