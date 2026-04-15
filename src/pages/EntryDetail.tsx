import { useNavigate, useParams } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { format } from 'date-fns'
import { DailyContent, FreewriteContent, WeeklyContent, MorningContent } from '../types'
import AIReflection from '../components/AIReflection'
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

const MORNING_LABELS: Record<string, string> = {
  energy: 'Energy level',
  gratitude: 'Gratitude',
  intention: 'Intention for today',
  lookingForward: 'Looking forward to',
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
          {entry.type === 'daily' ? 'Daily Check-in' : entry.type === 'freewrite' ? 'Free Write' : entry.type === 'morning' ? 'Morning' : 'Weekly Review'}
        </span>
        <h1 className={styles.date}>{format(new Date(entry.created_at), 'EEEE, d MMMM yyyy')}</h1>
        <p className={styles.time}>{format(new Date(entry.created_at), 'h:mm a')}</p>
      </div>

      <hr className="divider" />

      {entry.type === 'morning' && (
        <div className={styles.sections}>
          {Object.entries(entry.content as MorningContent).map(([key, value]) => {
            if (key === 'energy') return (
              <div key={key} className={styles.section}>
                <p className={styles.sectionLabel}>{MORNING_LABELS[key]}</p>
                <div className={styles.energyDisplay}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={`${styles.energyDot} ${n <= (value as number) ? styles.energyDotFilled : ''}`} />
                  ))}
                  <span className={styles.energyText}>{['','Low','Tired','Ok','Good','Great'][value as number]}</span>
                </div>
              </div>
            )
            return (
              <div key={key} className={styles.section}>
                <p className={styles.sectionLabel}>{MORNING_LABELS[key] || key}</p>
                <p className={styles.sectionText}>{value as string}</p>
              </div>
            )
          })}
        </div>
      )}

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

      {entry.type === 'freewrite' && (() => {
        const c = entry.content as FreewriteContent
        return (
          <div>
            <div className={styles.freewrite}><p>{c.text}</p></div>
            {c.articles && c.articles.length > 0 && (
              <div className={styles.pinnedArticles}>
                <p className={styles.pinnedLabel}>📎 Pinned articles</p>
                {c.articles.map(a => (
                  <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className={styles.pinnedCard}>
                    <span className={styles.pinnedTitle}>{a.title}</span>
                    <span className={styles.pinnedArrow}>→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )
      })()}

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

      <AIReflection entry={entry} />
    </div>
  )
}
