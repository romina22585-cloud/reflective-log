import { useEffect, useState } from 'react'
import { Habit } from '../types'
import styles from './StreakMilestone.module.css'

interface Props {
  habits: Habit[]
  getStreak: (id: string) => number
}

const MILESTONES = [5, 10, 21, 30, 50, 100]

export default function StreakMilestone({ habits, getStreak }: Props) {
  const [milestone, setMilestone] = useState<{ habit: Habit; days: number } | null>(null)
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    for (const habit of habits) {
      const streak = getStreak(habit.id)
      if (MILESTONES.includes(streak)) {
        const key = `${habit.id}-${streak}`
        if (!dismissed.includes(key)) {
          setMilestone({ habit, days: streak })

          // Request browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`🔥 ${streak}-day streak!`, {
              body: `You've completed "${habit.name}" for ${streak} days in a row. Keep going!`,
              icon: '/reflective-log/favicon.svg',
            })
          } else if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(perm => {
              if (perm === 'granted') {
                new Notification(`🔥 ${streak}-day streak!`, {
                  body: `You've completed "${habit.name}" for ${streak} days in a row!`,
                })
              }
            })
          }
          break
        }
      }
    }
  }, [habits, getStreak])

  if (!milestone) return null

  const { habit, days } = milestone
  const messages: Record<number, string> = {
    5: "You're building something real.",
    10: "Ten days of showing up. That's discipline.",
    21: "21 days — this is becoming who you are.",
    30: "A full month. Remarkable consistency.",
    50: "50 days. You've changed your baseline.",
    100: "100 days. This is no longer a habit — it's part of you.",
  }

  const dismiss = () => {
    setDismissed(prev => [...prev, `${habit.id}-${days}`])
    setMilestone(null)
  }

  return (
    <div className={styles.banner}>
      <div className={styles.bannerLeft}>
        <span className={styles.fire}>🔥</span>
        <div>
          <p className={styles.title}>{days}-day streak — {habit.emoji} {habit.name}</p>
          <p className={styles.message}>{messages[days] || `${days} days and counting.`}</p>
        </div>
      </div>
      <button type="button" className={styles.dismiss} onClick={dismiss}>✕</button>
    </div>
  )
}
