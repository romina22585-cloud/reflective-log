import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { format, isToday, isThisWeek } from 'date-fns'
import { Entry } from '../types'
import HabitsTracker from '../components/HabitsTracker'
import { useProfile } from '../hooks/useProfile'
import MultiEntryInsights from '../components/MultiEntryInsights'
import TravelLog from '../components/TravelLog'
import ClaudeInsights from '../components/ClaudeInsights'
import styles from './Dashboard.module.css'

const TYPE_LABELS = { daily: 'Evening Check-in', freewrite: 'Free Write', weekly: 'Weekly Reflection', morning: 'Morning Check-in' }
const TYPE_PROMPTS = {
  morning: 'Energy · Gratitude · Intention · ~5 min',
  daily: '6 guided questions · ~10 minutes',
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


// ── Grouped entries by month ──────────────────────────────────
function GroupedEntries({ entries, onNavigate, onDelete, typeLabels, getPreview }: {
  entries: Entry[]
  onNavigate: (id: string) => void
  onDelete: (id: string, e: React.MouseEvent) => void
  typeLabels: Record<string, string>
  getPreview: (e: Entry) => string
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Group by month key e.g. "May 2026"
  const grouped = useMemo(() => {
    const map: Record<string, Entry[]> = {}
    for (const entry of entries) {
      const key = format(new Date(entry.created_at), 'MMMM yyyy')
      if (!map[key]) map[key] = []
      map[key].push(entry)
    }
    return map
  }, [entries])

  const monthKeys = Object.keys(grouped)

  const toggleMonth = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      {monthKeys.map((monthKey, mi) => {
        const isOpen = !collapsed[monthKey] // open by default
        const monthEntries = grouped[monthKey]
        return (
          <div key={monthKey} className={styles.monthGroup}>
            <button
              className={styles.monthHeader}
              onClick={() => toggleMonth(monthKey)}
            >
              <span className={styles.monthLabel}>{monthKey}</span>
              <span className={styles.monthMeta}>{monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'}</span>
              <span className={styles.monthChevron}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className={styles.monthEntries}>
                {monthEntries.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={styles.entryRow}
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => onNavigate(entry.id)}
                  >
                    <div className={styles.entryMeta}>
                      <span className={`tag tag-${entry.type}`}>{typeLabels[entry.type]}</span>
                      <span className={styles.entryDate}>{format(new Date(entry.created_at), 'd MMM')}</span>
                    </div>
                    <p className={styles.entryPreview}>{getPreview(entry)}</p>
                    <button className={styles.deleteBtn} onClick={(e) => onDelete(entry.id, e)} title="Delete entry">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

type Tab = 'habits' | 'journal' | 'travel' | null

export default function Dashboard() {
  const { displayName } = useProfile()
  const { entries, loading, deleteEntry } = useEntries()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>(null)
  const [search, setSearch] = useState('')

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
        <h1 className={styles.greetingName}>{displayName}</h1>
        <p className={styles.greetingDate}>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* Tab chooser — always visible */}
      <div className={styles.tabChooser}>
        <button
          className={`${styles.tabCard} ${styles.tabCardHabits} ${tab === 'habits' ? styles.tabCardActive : ''}`}
          onClick={() => setTab(tab === 'habits' ? null : 'habits')}
        >
          <span className={styles.tabCardIcon}>✦</span>
          <span className={styles.tabCardLabel}>Habit Tracking</span>
          <span className={styles.tabCardArrow}>{tab === 'habits' ? '▲' : '▼'}</span>
        </button>

        <button
          className={`${styles.tabCard} ${styles.tabCardJournal} ${tab === 'journal' ? styles.tabCardActive : ''}`}
          onClick={() => setTab(tab === 'journal' ? null : 'journal')}
        >
          <span className={styles.tabCardIcon}>◈</span>
          <span className={styles.tabCardLabel}>Reflection Journal</span>
          <span className={styles.tabCardArrow}>{tab === 'journal' ? '▲' : '▼'}</span>
        </button>

        <button
          className={`${styles.tabCard} ${styles.tabCardTravel} ${tab === 'travel' ? styles.tabCardActive : ''}`}
          onClick={() => setTab(tab === 'travel' ? null : 'travel')}
        >
          <span className={styles.tabCardIcon}>✈</span>
          <span className={styles.tabCardLabel}>Travel Log</span>
          <span className={styles.tabCardArrow}>{tab === 'travel' ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* ── HABITS PANEL ── */}
      {tab === 'habits' && (
        <div className={`${styles.tabPanel} ${styles.tabPanelHabits}`} key="habits">
          <HabitsTracker />
        </div>
      )}

      {/* ── JOURNAL PANEL ── */}
      {tab === 'journal' && (
        <div className={`${styles.tabPanel} ${styles.tabPanelJournal}`} key="journal">

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Begin a new entry</h2>
            <div className={styles.entryCards}>
              {(['morning', 'daily', 'freewrite', 'weekly'] as const).map(type => {
                const done = type === 'morning' ? hasMorningToday : type === 'daily' ? hasEntryToday : type === 'weekly' ? hasWeeklyThisWeek : false
                const icons = { morning: '🌅', daily: '🌆', freewrite: '✦', weekly: '◈' }
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

          <section className={styles.section}>
            <MultiEntryInsights entries={entries} />
          </section>

          <section className={styles.section}>
            <ClaudeInsights />
          </section>

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
              <GroupedEntries
                entries={filtered}
                onNavigate={(id) => navigate(`/entry/${id}`)}
                onDelete={handleDelete}
                typeLabels={TYPE_LABELS}
                getPreview={getPreview}
              />
            )}
          </section>
        </div>
      )}

      {/* ── TRAVEL PANEL ── */}
      {tab === 'travel' && (
        <div className={`${styles.tabPanel} ${styles.tabPanelTravel}`} key="travel">
          <TravelLog />
        </div>
      )}

    </div>
  )
}
