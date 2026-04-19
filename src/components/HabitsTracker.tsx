import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import HabitBenefitsPanel from './HabitBenefitsPanel'
import HabitCalendar from './HabitCalendar'
import StreakMilestone from './StreakMilestone'
import WeeklyTrafficLight from './WeeklyTrafficLight'
import { HABIT_GROUPS } from '../lib/habitBenefits'
import { Habit } from '../types'
import styles from './HabitsTracker.module.css'

type View = 'today' | 'history'

const GROUP_CONFIG = {
  daily: { title: 'Aim for every day', color: 'var(--sage)' },
  weekly4: { title: 'Aim for 4+ times a week', color: 'var(--gold)' },
  weekly1: { title: 'Aim for at least once a week', color: 'var(--rust)' },
}

export default function HabitsTracker() {
  const {
    habits, logs, loading,
    toggleHabit, addHabit, deleteHabit, resetToDefaults,
    isCompletedToday, getStreak, getWeeklyScores,
    todayCompletedCount, totalHabits
  } = useHabits()

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('✦')
  const [confirmReset, setConfirmReset] = useState(false)
  const [view, setView] = useState<View>('today')
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addHabit(newName.trim(), newEmoji)
    setNewName(''); setNewEmoji('✦'); setAdding(false)
  }

  const handleReset = async () => {
    await resetToDefaults()
    setConfirmReset(false)
  }

  if (loading) return null

  // Group habits
  const grouped = {
    daily: habits.filter(h => (HABIT_GROUPS[h.name]?.group || 'daily') === 'daily'),
    weekly4: habits.filter(h => HABIT_GROUPS[h.name]?.group === 'weekly4'),
    weekly1: habits.filter(h => HABIT_GROUPS[h.name]?.group === 'weekly1'),
    custom: habits.filter(h => !HABIT_GROUPS[h.name]),
  }

  const weeklyScores = getWeeklyScores()

  const renderHabitRow = (habit: Habit) => {
    const done = isCompletedToday(habit.id)
    const streak = getStreak(habit.id)
    return (
      <div key={habit.id} className={`${styles.habitRow} ${done ? styles.habitDone : ''}`} onClick={() => toggleHabit(habit.id)}>
        <div className={`${styles.checkbox} ${done ? styles.checkboxChecked : ''}`}>
          {done && <span className={styles.checkmark}>✓</span>}
        </div>
        <span className={styles.habitEmoji}>{habit.emoji}</span>
        <span className={styles.habitName}>{habit.name}</span>
        <div className={styles.habitRight}>
          {streak >= 2 && <span className={styles.streak}>{streak}🔥</span>}
          <HabitBenefitsPanel habitName={habit.name} />
          <button type="button" className={styles.deleteHabit}
            onClick={e => { e.stopPropagation(); deleteHabit(habit.id) }} title="Remove">✕</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <StreakMilestone habits={habits} getStreak={getStreak} />

      {/* Traffic light — top */}
      {view === 'today' && (
        <WeeklyTrafficLight
          group1Score={weeklyScores.group1Score}
          group2Score={weeklyScores.group2Score}
          group3Score={weeklyScores.group3Score}
        />
      )}

      <div className={styles.tracker}>
        <div className={styles.trackerHeader}>
          <div>
            <p className={styles.trackerTitle}>Today's habits</p>
            <p className={styles.trackerScore}>{todayCompletedCount} of {totalHabits} completed</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.viewToggle}>
              <button type="button" className={`${styles.viewBtn} ${view === 'today' ? styles.viewBtnActive : ''}`} onClick={() => setView('today')}>Today</button>
              <button type="button" className={`${styles.viewBtn} ${view === 'history' ? styles.viewBtnActive : ''}`} onClick={() => setView('history')}>History</button>
            </div>
            <div className={styles.progressRing}>
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--parchment-deeper)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--gold)" strokeWidth="3"
                  strokeDasharray={`${totalHabits > 0 ? (todayCompletedCount / totalHabits) * 94 : 0} 94`}
                  strokeLinecap="round" transform="rotate(-90 18 18)" />
              </svg>
              <span>{totalHabits > 0 ? Math.round((todayCompletedCount / totalHabits) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {view === 'today' && (
          <>
            {/* Group 1 */}
            {grouped.daily.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupLabel} style={{ color: GROUP_CONFIG.daily.color }}>
                  {GROUP_CONFIG.daily.title}
                </p>
                <div className={styles.habitList}>{grouped.daily.map(renderHabitRow)}</div>
              </div>
            )}

            {/* Group 2 */}
            {grouped.weekly4.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupLabel} style={{ color: GROUP_CONFIG.weekly4.color }}>
                  {GROUP_CONFIG.weekly4.title}
                </p>
                <div className={styles.habitList}>{grouped.weekly4.map(renderHabitRow)}</div>
              </div>
            )}

            {/* Group 3 */}
            {grouped.weekly1.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupLabel} style={{ color: GROUP_CONFIG.weekly1.color }}>
                  {GROUP_CONFIG.weekly1.title}
                </p>
                <div className={styles.habitList}>{grouped.weekly1.map(renderHabitRow)}</div>
              </div>
            )}

            {/* Custom habits */}
            {grouped.custom.length > 0 && (
              <div className={styles.group}>
                <p className={styles.groupLabel}>Custom habits</p>
                <div className={styles.habitList}>{grouped.custom.map(renderHabitRow)}</div>
              </div>
            )}

            {adding ? (
              <div className={styles.addForm}>
                <input type="text" placeholder="🙂" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} className={styles.emojiInput} maxLength={2} />
                <input type="text" placeholder="New habit name…" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} className={styles.nameInput} autoFocus />
                <button className="btn btn-primary" onClick={handleAdd} disabled={!newName.trim()}>Add</button>
                <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
              </div>
            ) : (
              <div className={styles.trackerFooter}>
                <button type="button" className={styles.addBtn} onClick={() => setAdding(true)}>+ Add habit</button>
                {!confirmReset ? (
                  <button type="button" className={styles.resetBtn} onClick={() => setConfirmReset(true)}>Reset to defaults</button>
                ) : (
                  <div className={styles.confirmReset}>
                    <span>Replace all habits with defaults?</span>
                    <button type="button" className={styles.confirmYes} onClick={handleReset}>Yes</button>
                    <button type="button" className={styles.confirmNo} onClick={() => setConfirmReset(false)}>No</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {view === 'history' && (
          <HabitCalendar habits={habits} logs={logs} selectedHabit={selectedHabit} onSelectHabit={setSelectedHabit} />
        )}
      </div>
    </div>
  )
}
