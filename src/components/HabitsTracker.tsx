import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import styles from './HabitsTracker.module.css'

export default function HabitsTracker() {
  const {
    habits, loading,
    toggleHabit, addHabit, deleteHabit, resetToDefaults,
    isCompletedToday, getStreak,
    todayCompletedCount, totalHabits
  } = useHabits()

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('✦')
  const [confirmReset, setConfirmReset] = useState(false)

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addHabit(newName.trim(), newEmoji)
    setNewName('')
    setNewEmoji('✦')
    setAdding(false)
  }

  const handleReset = async () => {
    await resetToDefaults()
    setConfirmReset(false)
  }

  if (loading) return null

  return (
    <div className={styles.tracker}>
      <div className={styles.trackerHeader}>
        <div>
          <p className={styles.trackerTitle}>Today's habits</p>
          <p className={styles.trackerScore}>
            {todayCompletedCount} of {totalHabits} completed
          </p>
        </div>
        <div className={styles.progressRing}>
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--parchment-deeper)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="3"
              strokeDasharray={`${totalHabits > 0 ? (todayCompletedCount / totalHabits) * 94 : 0} 94`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span>{totalHabits > 0 ? Math.round((todayCompletedCount / totalHabits) * 100) : 0}%</span>
        </div>
      </div>

      <div className={styles.habitList}>
        {habits.map(habit => {
          const done = isCompletedToday(habit.id)
          const streak = getStreak(habit.id)
          return (
            <div
              key={habit.id}
              className={`${styles.habitRow} ${done ? styles.habitDone : ''}`}
              onClick={() => toggleHabit(habit.id)}
            >
              {/* Large clear tick box */}
              <div className={`${styles.checkbox} ${done ? styles.checkboxChecked : ''}`}>
                {done && <span className={styles.checkmark}>✓</span>}
              </div>
              <span className={styles.habitEmoji}>{habit.emoji}</span>
              <span className={styles.habitName}>{habit.name}</span>
              <div className={styles.habitRight}>
                {streak > 1 && (
                  <span className={styles.streak}>{streak} 🔥</span>
                )}
                <button
                  className={styles.deleteHabit}
                  onClick={e => { e.stopPropagation(); deleteHabit(habit.id) }}
                  title="Remove habit"
                >✕</button>
              </div>
            </div>
          )
        })}
      </div>

      {adding ? (
        <div className={styles.addForm}>
          <input
            type="text"
            placeholder="🙂"
            value={newEmoji}
            onChange={e => setNewEmoji(e.target.value)}
            className={styles.emojiInput}
            maxLength={2}
          />
          <input
            type="text"
            placeholder="New habit name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className={styles.nameInput}
            autoFocus
          />
          <button className="btn btn-primary" onClick={handleAdd} disabled={!newName.trim()}>Add</button>
          <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      ) : (
        <div className={styles.trackerFooter}>
          <button className={styles.addBtn} onClick={() => setAdding(true)}>
            + Add habit
          </button>
          {!confirmReset ? (
            <button className={styles.resetBtn} onClick={() => setConfirmReset(true)}>
              Reset to defaults
            </button>
          ) : (
            <div className={styles.confirmReset}>
              <span>Replace all habits with defaults?</span>
              <button className={styles.confirmYes} onClick={handleReset}>Yes</button>
              <button className={styles.confirmNo} onClick={() => setConfirmReset(false)}>No</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
