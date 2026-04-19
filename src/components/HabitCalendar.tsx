import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, subMonths, addMonths } from 'date-fns'
import { Habit, HabitLog } from '../types'
import styles from './HabitCalendar.module.css'

interface Props {
  habits: Habit[]
  logs: HabitLog[]
  selectedHabit: Habit | null
  onSelectHabit: (h: Habit | null) => void
}

export default function HabitCalendar({ habits, logs, selectedHabit, onSelectHabit }: Props) {
  const [month, setMonth] = useState(new Date())

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const firstDayOfWeek = (startOfMonth(month).getDay() + 6) % 7 // Mon=0

  const habit = selectedHabit

  const isCompleted = (date: Date) => {
    if (!habit) return false
    const dateStr = format(date, 'yyyy-MM-dd')
    return logs.some(l => l.habit_id === habit.id && l.logged_date === dateStr)
  }

  // Weekly summary — last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  // Completion rate this month
  const completedDays = days.filter(d => isCompleted(d)).length
  const pastDays = days.filter(d => d <= new Date()).length
  const rate = pastDays > 0 ? Math.round((completedDays / pastDays) * 100) : 0

  return (
    <div className={styles.calendar}>
      {/* Habit selector */}
      <div className={styles.habitTabs}>
        {habits.map(h => (
          <button
            key={h.id}
            type="button"
            className={`${styles.habitTab} ${selectedHabit?.id === h.id ? styles.habitTabActive : ''}`}
            onClick={() => onSelectHabit(selectedHabit?.id === h.id ? null : h)}
          >
            <span>{h.emoji}</span>
          </button>
        ))}
      </div>

      {habit && (
        <>
          {/* Selected habit name + rate */}
          <div className={styles.habitTitle}>
            <span className={styles.habitTitleEmoji}>{habit.emoji}</span>
            <span className={styles.habitTitleName}>{habit.name}</span>
            <span className={styles.habitTitleRate}>{rate}% this month</span>
          </div>

          {/* Weekly summary */}
          <div className={styles.weekStrip}>
            {last7.map(d => {
              const done = isCompleted(d)
              const isT = isToday(d)
              return (
                <div key={d.toISOString()} className={styles.weekDay}>
                  <span className={styles.weekDayLabel}>{format(d, 'EEE')[0]}</span>
                  <div className={`${styles.weekDot} ${done ? styles.weekDotDone : ''} ${isT ? styles.weekDotToday : ''}`} />
                  <span className={styles.weekDayNum}>{format(d, 'd')}</span>
                </div>
              )
            })}
          </div>

          {/* Monthly calendar */}
          <div className={styles.monthNav}>
            <button type="button" className={styles.navBtn} onClick={() => setMonth(m => subMonths(m, 1))}>←</button>
            <p className={styles.monthLabel}>{format(month, 'MMMM yyyy')}</p>
            <button type="button" className={styles.navBtn} onClick={() => setMonth(m => addMonths(m, 1))} disabled={month >= new Date()}>→</button>
          </div>

          <div className={styles.grid}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} className={styles.gridHeader}>{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(d => {
              const done = isCompleted(d)
              const isT = isToday(d)
              const isFuture = d > new Date()
              return (
                <div
                  key={d.toISOString()}
                  className={`${styles.gridDay} ${done ? styles.gridDayDone : ''} ${isT ? styles.gridDayToday : ''} ${isFuture ? styles.gridDayFuture : ''} ${!isSameMonth(d, month) ? styles.gridDayOther : ''}`}
                >
                  {format(d, 'd')}
                  {done && <span className={styles.gridDot} />}
                </div>
              )
            })}
          </div>
        </>
      )}

      {!habit && (
        <p className={styles.selectHint}>Tap a habit above to see its history</p>
      )}
    </div>
  )
}
