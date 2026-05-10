import { useState, useMemo } from 'react'
import { useSavedReflections } from '../hooks/useSavedReflections'
import { format } from 'date-fns'
import styles from './ClaudeInsights.module.css'

export default function ClaudeInsights() {
  const { reflections, deleteReflection, loading } = useSavedReflections()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const grouped = useMemo(() => {
    const map: Record<string, typeof reflections> = {}
    for (const r of reflections) {
      const key = format(new Date(r.created_at), 'MMMM yyyy')
      if (!map[key]) map[key] = []
      map[key].push(r)
    }
    return map
  }, [reflections])

  const monthKeys = Object.keys(grouped)

  const toggleMonth = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.headerLabel}>Claude Insights</p>
        <p className={styles.headerCount}>{reflections.length} saved {reflections.length === 1 ? 'reflection' : 'reflections'}</p>
      </div>

      {reflections.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>✦</p>
          <p>No saved insights yet.</p>
          <p>Open any entry and ask Claude for a reflection, then save it.</p>
        </div>
      )}

      {monthKeys.map(monthKey => {
        const isOpen = !collapsed[monthKey]
        const monthReflections = grouped[monthKey]
        return (
          <div key={monthKey} className={styles.monthGroup}>
            <button className={styles.monthHeader} onClick={() => toggleMonth(monthKey)}>
              <span className={styles.monthLabel}>{monthKey}</span>
              <span className={styles.monthMeta}>{monthReflections.length} {monthReflections.length === 1 ? 'insight' : 'insights'}</span>
              <span className={styles.monthChevron}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className={styles.monthEntries}>
                {monthReflections.map(r => (
                  <div key={r.id} className={styles.reflectionCard}>
                    <div className={styles.reflectionMeta}>
                      <span className={`${styles.reflectionType} ${r.type === 'multi' ? styles.reflectionTypeMulti : styles.reflectionTypeSingle}`}>
                        {r.type === 'multi' ? '◈ Multi-entry insight' : '✦ Entry reflection'}
                      </span>
                      <span className={styles.reflectionDate}>
                        {format(new Date(r.created_at), 'd MMM · h:mm a')}
                      </span>
                    </div>
                    <p className={styles.reflectionText}>{r.content}</p>
                    <button className={styles.deleteBtn} onClick={() => deleteReflection(r.id)}>Delete</button>
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
