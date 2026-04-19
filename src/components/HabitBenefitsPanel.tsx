import { useState } from 'react'
import { HABIT_BENEFITS, CHEMICAL_INFO } from '../lib/habitBenefits'
import styles from './HabitBenefitsPanel.module.css'

interface Props {
  habitName: string
}

export default function HabitBenefitsPanel({ habitName }: Props) {
  const [open, setOpen] = useState(false)
  const benefits = HABIT_BENEFITS[habitName]
  if (!benefits) return null

  const chemicals = Object.entries(benefits.chemicals) as [keyof typeof CHEMICAL_INFO, string][]

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.infoBtn}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        title="View benefits"
      >
        ℹ
      </button>

      {open && (
        <div className={styles.panel} onClick={e => e.stopPropagation()}>
          <div className={styles.panelHeader}>
            <p className={styles.panelTitle}>Why this habit?</p>
            <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>💪 Physical benefits</p>
            <p className={styles.sectionText}>{benefits.physical}</p>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>🧠 Mental benefits</p>
            <p className={styles.sectionText}>{benefits.mental}</p>
          </div>

          {chemicals.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>⚗️ Chemicals triggered</p>
              <div className={styles.chemicals}>
                {chemicals.map(([key, effect]) => {
                  const info = CHEMICAL_INFO[key]
                  if (!info) return null
                  return (
                    <div key={key} className={styles.chemical} style={{ borderColor: info.color }}>
                      <div className={styles.chemicalHeader}>
                        <span className={styles.chemicalEmoji}>{info.emoji}</span>
                        <div>
                          <p className={styles.chemicalName} style={{ color: info.color }}>{info.label}</p>
                          <p className={styles.chemicalDesc}>{info.description}</p>
                        </div>
                      </div>
                      <p className={styles.chemicalEffect}>{effect}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
