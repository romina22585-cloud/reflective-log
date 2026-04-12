import { useNavigate, useParams } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { format } from 'date-fns'
import { DailyContent, FreewriteContent, WeeklyContent } from '../types'
import styles from './EntryDetail.module.css'

const DAILY_LABELS: Record<string, string> = {
  highlight: 'Highlight of the day',
  challenge: 'Challenge faced',
  decision: 'A decision I made',
  emotion: 'Emotional check-in',
  tomorrow: 'Intention for tomorrow',
}

const WEEKLY_LABELS: Record<string, string> = {
  wins: 'Wins this week',
  patterns: 'Patterns I noticed',
  difficult: 'What was difficult',
  learned: 'What I learned',
  nextWeek: 'Intention for next week',
}

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>()
  const { entries } = useEntries()
  const navigate = useNavigate()

  const entry = entries.find(e => e.id === id)

  if (!entry) {
    return (
      <div className={styles.notFound}>
        <p>Entry not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to log</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={`tag tag-${entry.type}`}>
          {entry.type === 'daily' ? 'Daily Check-in' : entry.type === 'freewrite' ? 'Free Write' : 'Weekly Review'}
        </span>
        <h1 className={styles.date}>
          {format(new Date(entry.created_at), 'EEEE, d MMMM yyyy')}
        </h1>
        <p className={styles.time}>{format(new Date(entry.created_at), 'h:mm a')}</p>
      </div>

      <hr className="divider" />

      {entry.type === 'daily' && (
        <div className={styles.sections}>
          {Object.entries(entry.content as DailyContent).map(([key, value]) => (
            <div key={key} className={styles.section}>
              <p className={styles.sectionLabel}>{DAILY_LABELS[key] || key}</p>
              <p className={styles.sectionText}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {entry.type === 'freewrite' && (
        <div className={styles.freewrite}>
          <p>{(entry.content as FreewriteContent).text}</p>
        </div>
      )}

      {entry.type === 'weekly' && (
        <div className={styles.sections}>
          {Object.entries(entry.content as WeeklyContent).map(([key, value]) => {
            if (key === 'rating') return (
              <div key={key} className={styles.section}>
                <p className={styles.sectionLabel}>Week rating</p>
                <p className={styles.stars}>{'★'.repeat(value as number)}{'☆'.repeat(5 - (value as number))}</p>
              </div>
            )
            return (
              <div key={key} className={styles.section}>
                <p className={styles.sectionLabel}>{WEEKLY_LABELS[key] || key}</p>
                <p className={styles.sectionText}>{value as string}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
