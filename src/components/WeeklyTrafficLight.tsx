import styles from './WeeklyTrafficLight.module.css'

interface Props {
  group1Score: number
  group2Score: number
  group3Score: number
}

type Status = 'green' | 'amber' | 'red'

function getStatus(g1: number, g2: number, g3: number): Status {
  if (g1 >= 40 && g2 >= 25 && g3 >= 1) return 'green'
  if (g1 >= 25 && g2 >= 15 && g3 >= 1) return 'amber'
  return 'red'
}

const STATUS_CONFIG = {
  green: {
    color: '#4a7c4e',
    bg: 'rgba(74, 124, 78, 0.1)',
    border: 'rgba(74, 124, 78, 0.3)',
    label: 'Thriving',
    emoji: '🟢',
    message: 'You\'re hitting your targets across all three groups. Keep this up.',
  },
  amber: {
    color: '#b07a20',
    bg: 'rgba(176, 122, 32, 0.1)',
    border: 'rgba(176, 122, 32, 0.3)',
    label: 'Building',
    emoji: '🟡',
    message: 'Good progress — a little more consistency will get you to green.',
  },
  red: {
    color: '#a0522d',
    bg: 'rgba(160, 82, 45, 0.1)',
    border: 'rgba(160, 82, 45, 0.3)',
    label: 'Needs attention',
    emoji: '🔴',
    message: 'This week needs more focus. Small steps today still count.',
  },
}

export default function WeeklyTrafficLight({ group1Score, group2Score, group3Score }: Props) {
  const status = getStatus(group1Score, group2Score, group3Score)
  const config = STATUS_CONFIG[status]

  // Max possible scores
  const g1Max = 70 // 10 habits × 7 days
  const g2Max = 56 // 8 habits × 7 days
  const g3Max = 4  // 4 habits

  const g1Pct = Math.min((group1Score / g1Max) * 100, 100)
  const g2Pct = Math.min((group2Score / g2Max) * 100, 100)
  const g3Pct = Math.min((group3Score / g3Max) * 100, 100)

  // Traffic light thresholds as percentages of max
  const g1GreenPct = (40 / g1Max) * 100
  const g1AmberPct = (25 / g1Max) * 100
  const g2GreenPct = (25 / g2Max) * 100
  const g2AmberPct = (15 / g2Max) * 100

  return (
    <div className={styles.wrapper} style={{ background: config.bg, borderColor: config.border }}>
      {/* Status header */}
      <div className={styles.header}>
        <div className={styles.statusLeft}>
          <span className={styles.statusEmoji}>{config.emoji}</span>
          <div>
            <p className={styles.statusLabel}>This week — {config.label}</p>
            <p className={styles.statusMessage}>{config.message}</p>
          </div>
        </div>
        <div className={styles.lights}>
          {(['green', 'amber', 'red'] as Status[]).map(s => (
            <div key={s} className={`${styles.light} ${status === s ? styles.lightActive : ''}`}
              style={{ background: status === s ? STATUS_CONFIG[s].color : 'var(--parchment-deeper)' }} />
          ))}
        </div>
      </div>

      {/* Progress bars */}
      <div className={styles.bars}>
        <div className={styles.barGroup}>
          <div className={styles.barLabel}>
            <span>Daily habits</span>
            <span style={{ color: config.color }}>{group1Score} / 70</span>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${g1Pct}%`, background: config.color }} />
            <div className={styles.barMarker} style={{ left: `${g1GreenPct}%` }} title="Green threshold" />
            <div className={styles.barMarker} style={{ left: `${g1AmberPct}%` }} title="Amber threshold" />
          </div>
        </div>

        <div className={styles.barGroup}>
          <div className={styles.barLabel}>
            <span>4×/week habits</span>
            <span style={{ color: config.color }}>{group2Score} / 56</span>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${g2Pct}%`, background: config.color }} />
            <div className={styles.barMarker} style={{ left: `${g2GreenPct}%` }} title="Green threshold" />
            <div className={styles.barMarker} style={{ left: `${g2AmberPct}%` }} title="Amber threshold" />
          </div>
        </div>

        <div className={styles.barGroup}>
          <div className={styles.barLabel}>
            <span>Weekly habits</span>
            <span style={{ color: config.color }}>{group3Score} / 4</span>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${g3Pct}%`, background: config.color }} />
          </div>
        </div>
      </div>
    </div>
  )
}
