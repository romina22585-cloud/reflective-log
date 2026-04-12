import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { EntryType, DailyContent, FreewriteContent, WeeklyContent } from '../types'
import styles from './NewEntry.module.css'

const DAILY_STEPS = [
  { key: 'highlight', label: 'Highlight of today', prompt: 'What was the most meaningful moment or achievement today — however small?' },
  { key: 'challenge', label: 'Challenge faced', prompt: 'What was difficult or draining today? What made it hard?' },
  { key: 'decision', label: 'A decision I made', prompt: 'Describe a decision you made today. What drove it? Would you decide the same again?' },
  { key: 'emotion', label: 'Emotional check-in', prompt: 'How are you feeling right now? What is underneath that feeling?' },
  { key: 'tomorrow', label: 'One intention for tomorrow', prompt: 'What is one thing you want to carry into tomorrow — an action, attitude, or reminder?' },
]

const WEEKLY_FIELDS = [
  { key: 'wins', label: 'Wins this week', prompt: 'What went well? What are you proud of, professionally or personally?' },
  { key: 'patterns', label: 'Patterns I noticed', prompt: 'Any recurring themes — in your behaviour, reactions, or situations? What are they telling you?' },
  { key: 'difficult', label: 'What was difficult', prompt: 'What challenged you most this week? What did it reveal about you?' },
  { key: 'learned', label: 'What I learned', prompt: 'What is one insight or lesson from this week you want to carry forward?' },
  { key: 'nextWeek', label: 'Intention for next week', prompt: 'What do you want to do differently or focus on next week?' },
]

function DailyForm({ onSave }: { onSave: (content: DailyContent) => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const current = DAILY_STEPS[step]
  const isLast = step === DAILY_STEPS.length - 1

  const handleNext = () => {
    if (!answers[current.key]?.trim()) return
    if (isLast) {
      onSave(answers as unknown as DailyContent)
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.progress}>
        {DAILY_STEPS.map((_, i) => (
          <div key={i} className={`${styles.progressDot} ${i <= step ? styles.progressDotActive : ''}`} />
        ))}
      </div>

      <div className={styles.stepContent} key={step}>
        <p className={styles.stepLabel}>{step + 1} of {DAILY_STEPS.length}</p>
        <h2 className={styles.stepQuestion}>{current.label}</h2>
        <p className={styles.stepPrompt}>{current.prompt}</p>
        <div className="field">
          <textarea
            autoFocus
            placeholder="Write freely…"
            value={answers[current.key] || ''}
            onChange={e => setAnswers(a => ({ ...a, [current.key]: e.target.value }))}
            rows={5}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        {step > 0 && (
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
            ← Back
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!answers[current.key]?.trim()}
        >
          {isLast ? 'Save entry' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

function FreewriteForm({ onSave }: { onSave: (content: FreewriteContent) => void }) {
  const [text, setText] = useState('')

  return (
    <div className={styles.form}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepQuestion}>Free write</h2>
        <p className={styles.stepPrompt}>
          No prompts, no structure. Just write whatever is on your mind. This is your space.
        </p>
        <div className="field">
          <textarea
            autoFocus
            placeholder="Begin writing…"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={14}
            className={styles.freewriteArea}
          />
        </div>
        <p className={styles.wordCount}>{text.trim().split(/\s+/).filter(Boolean).length} words</p>
      </div>
      <div className={styles.formActions}>
        <button
          className="btn btn-primary"
          onClick={() => onSave({ text })}
          disabled={!text.trim()}
        >
          Save entry
        </button>
      </div>
    </div>
  )
}

function WeeklyForm({ onSave }: { onSave: (content: WeeklyContent) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [rating, setRating] = useState(0)

  const allFilled = WEEKLY_FIELDS.every(f => answers[f.key]?.trim()) && rating > 0

  return (
    <div className={styles.form}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepQuestion}>Weekly review</h2>
        <p className={styles.stepPrompt}>Take 15 minutes to reflect on your week as a whole.</p>
      </div>

      {WEEKLY_FIELDS.map(field => (
        <div className={`${styles.weeklyField} field`} key={field.key}>
          <label>{field.label}</label>
          <p className={styles.fieldPrompt}>{field.prompt}</p>
          <textarea
            placeholder="Write freely…"
            value={answers[field.key] || ''}
            onChange={e => setAnswers(a => ({ ...a, [field.key]: e.target.value }))}
            rows={3}
          />
        </div>
      ))}

      <div className={styles.ratingSection}>
        <p className={styles.ratingLabel}>How was this week overall?</p>
        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`${styles.star} ${n <= rating ? styles.starActive : ''}`}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          className="btn btn-primary"
          onClick={() => onSave({ ...answers, rating } as unknown as WeeklyContent)}
          disabled={!allFilled}
        >
          Save weekly review
        </button>
      </div>
    </div>
  )
}

export default function NewEntry() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { createEntry } = useEntries()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const entryType = (type as EntryType) || 'daily'

  const handleSave = async (content: DailyContent | FreewriteContent | WeeklyContent) => {
    setSaving(true)
    const { error } = await createEntry(entryType, content)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => navigate('/'), 1200)
    }
  }

  if (saved) {
    return (
      <div className={styles.savedScreen}>
        <span className={styles.savedIcon}>✦</span>
        <h2>Entry saved.</h2>
        <p>Returning to your log…</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {saving && <div className={styles.savingOverlay}>Saving…</div>}
      {entryType === 'daily' && <DailyForm onSave={handleSave} />}
      {entryType === 'freewrite' && <FreewriteForm onSave={handleSave} />}
      {entryType === 'weekly' && <WeeklyForm onSave={handleSave} />}
    </div>
  )
}
