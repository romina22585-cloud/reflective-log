import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEntries } from '../hooks/useEntries'
import { format, isToday, isThisWeek } from 'date-fns'
import { Entry } from '../types'
import styles from './Dashboard.module.css'

const TYPE_LABELS = { daily: 'Daily Check-in', freewrite: 'Free Write', weekly: 'Weekly Review' }
const TYPE_PROMPTS = {
  daily: '5 guided questions · ~10 minutes',
  freewrite: 'Open page · write freely',
  weekly: 'Patterns & growth · ~15 minutes',
}

function getPreview(entry: Entry): string {
  const c = entry.content as Record<string, unknown>
  if (entry.type === 'daily') return (c.highlight as string) || ''
  if (entry.type === 'freewrite') return (c.text as string) || ''
  if (entry.type === 'weekly') return (c.wins as string) || ''
  return ''
}

export default function Dashboard() {
  const { user } = useAuth()
  const { entries, loading, deleteEntry } = useEntries()
  const navigate = useNavigate()

  const firstName = user?.email?.split('@')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const hasEntryToday = entries.some(e => isToday(new Date(e.created_at)))
  const hasWeeklyThisWeek = entries.some(e => e.type === 'weekly' && isThisWeek(new Date(e.created_at)))

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this entry? This cannot be undone.')) {
      await deleteEntry(id)
    }
  }

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <p className={styles.greetingLabel}>{greeting},</p>
        <h1 className={styles.greetingName}>{firstName}</h1>
        <p className={styles.greetingDate}>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* New Entry section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Begin a new entry</h2>
        <div className={styles.entryCards}>

          <button
            className={`${styles.entryTypeCard} ${hasEntryToday ? styles.done : ''}`}
            onClick={() => navigate('/new/daily')}
          >
            <span className={styles.typeIcon}>☀</span>
            <div>
              <p className={styles.typeName}>{TYPE_LABELS.daily}</p>
              <p className={styles.typeHint}>{TYPE_PROMPTS.daily}</p>
            </div>
            {hasEntryToday && <span className={styles.doneBadge}>✓</span>}
          </button>

          <button
            className={styles.entryTypeCard}
            onClick={() => navigate('/new/freewrite')}
          >
            <span className={styles.typeIcon}>✦</span>
            <div>
              <p className={styles.typeName}>{TYPE_LABELS.freewrite}</p>
              <p className={styles.typeHint}>{TYPE_PROMPTS.freewrite}</p>
            </div>
          </button>

          <button
            className={`${styles.entryTypeCard} ${hasWeeklyThisWeek ? styles.done : ''}`}
            onClick={() => navigate('/new/weekly')}
          >
            <span className={styles.typeIcon}>◈</span>
            <div>
              <p className={styles.typeName}>{TYPE_LABELS.weekly}</p>
              <p className={styles.typeHint}>{TYPE_PROMPTS.weekly}</p>
            </div>
            {hasWeeklyThisWeek && <span className={styles.doneBadge}>✓</span>}
          </button>

        </div>
      </section>

      {/* Past entries */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Past entries</h2>

        {loading && <p className={styles.empty}>Loading your entries…</p>}

        {!loading && entries.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>◇</p>
            <p>Your log is empty. Begin your first entry above.</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className={styles.entryList}>
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className={styles.entryRow}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => navigate(`/entry/${entry.id}`)}
              >
                <div className={styles.entryMeta}>
                  <span className={`tag tag-${entry.type}`}>{TYPE_LABELS[entry.type]}</span>
                  <span className={styles.entryDate}>
                    {format(new Date(entry.created_at), 'd MMM yyyy')}
                  </span>
                </div>
                <p className={styles.entryPreview}>{getPreview(entry)}</p>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(entry.id, e)}
                  title="Delete entry"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
