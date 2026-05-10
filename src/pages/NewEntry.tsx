import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { EntryType, DailyContent, FreewriteContent, WeeklyContent, MorningContent, Article } from '../types'
import styles from './NewEntry.module.css'

const WEEKLY_FIELDS = [
  { key: 'wins', label: 'Wins this week', prompt: 'What went well? What are you proud of, professionally or personally?' },
  { key: 'patterns', label: 'Patterns I noticed', prompt: 'Any recurring themes — in your behaviour, reactions, or situations? What are they telling you?' },
  { key: 'difficult', label: 'What was difficult', prompt: 'What challenged you most this week? What did it reveal about you?' },
  { key: 'learned', label: 'What I learned', prompt: 'What is one insight or lesson from this week you want to carry forward?' },
  { key: 'nextWeek', label: 'Intention for next week', prompt: 'What do you want to do differently or focus on next week?' },
]

function EnergyPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className={styles.energyPicker}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" className={`${styles.energyBtn} ${value === n ? styles.energyActive : ''}`} onClick={() => onChange(n)}>
          <span className={styles.energyNum}>{n}</span>
          <span className={styles.energyLabel}>{['Low', 'Tired', 'Ok', 'Good', 'Great'][n - 1]}</span>
        </button>
      ))}
    </div>
  )
}

// ── MORNING FORM ──────────────────────────────────────────────
function MorningForm({ onSave }: { onSave: (content: MorningContent) => void }) {
  const [step, setStep] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const STEPS = [
    { key: 'energy', label: 'Energy level', prompt: 'How is your energy right now, honestly?', optional: false },
    { key: 'gratitude', label: 'Gratitude', prompt: 'What is one thing — small or large — you feel genuinely grateful for today?', optional: false },
    { key: 'intention', label: 'Intention for today', prompt: 'What is the one thing that, if you achieved it today, would make the day feel worthwhile?', optional: false },
    { key: 'lookingForward', label: "Something I'm looking forward to", prompt: 'What is something — however small — that you are looking forward to today?', optional: true },
  ]

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isValid = current.key === 'energy' ? energy > 0 : String(answers[current.key] || '').trim().length > 0

  const handleNext = () => {
    if (!isValid && !current.optional) return
    if (isLast) {
      onSave({ energy, gratitude: answers.gratitude || '', intention: answers.intention || '', lookingForward: answers.lookingForward || '' })
    } else {
      setStep(s => s + 1)
    }
  }

  const handleSkip = () => {
    if (isLast) {
      onSave({ energy, gratitude: answers.gratitude || '', intention: answers.intention || '', lookingForward: '' })
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.progress}>
        {STEPS.map((_, i) => <div key={i} className={`${styles.progressDot} ${i <= step ? styles.progressDotActive : ''}`} />)}
      </div>
      <div className={styles.stepContent} key={step}>
        <div className={styles.stepLabelRow}>
          <p className={styles.stepLabel}>{step + 1} of {STEPS.length}</p>
          {current.optional && <span className={styles.optionalBadge}>Optional</span>}
        </div>
        <h2 className={styles.stepQuestion}>{current.label}</h2>
        <p className={styles.stepPrompt}>{current.prompt}</p>
        {current.key === 'energy' ? (
          <EnergyPicker value={energy} onChange={setEnergy} />
        ) : (
          <div className="field">
            <textarea autoFocus placeholder="Write freely…" value={answers[current.key] || ''} onChange={e => setAnswers(a => ({ ...a, [current.key]: e.target.value }))} rows={4} />
          </div>
        )}
      </div>
      <div className={styles.formActions}>
        {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {current.optional && (
          <button type="button" className="btn btn-secondary" onClick={handleSkip}>Skip</button>
        )}
        <button type="button" className="btn btn-primary" onClick={handleNext} disabled={!isValid && !current.optional}>
          {isLast ? 'Save entry' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ── EVENING FORM ──────────────────────────────────────────────
// Steps: 1) Energy, 2) Day rating + 3 questions, 3) Emotional check-in, 4) Intention
function EveningForm({ onSave }: { onSave: (content: DailyContent) => void }) {
  const [step, setStep] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [dayRating, setDayRating] = useState(0)
  const [whatWasGood, setWhatWasGood] = useState('')
  const [whatWasNotGood, setWhatWasNotGood] = useState('')
  const [dodifferently, setDodifferently] = useState('')
  const [emotion, setEmotion] = useState('')
  const [tomorrow, setTomorrow] = useState('')

  const STEPS = [
    { key: 'energy', label: 'Energy level', prompt: 'How is your energy right now at the end of the day?' },
    { key: 'dayReview', label: 'How was your day?', prompt: 'Rate your day and reflect on it.' },
    { key: 'emotion', label: 'Emotional check-in', prompt: 'How are you feeling right now? What is underneath that feeling?' },
    { key: 'tomorrow', label: 'One intention for tomorrow', prompt: 'What is one thing you want to carry into tomorrow — an action, attitude, or reminder?' },
  ]

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const isValid = () => {
    if (current.key === 'energy') return energy > 0
    if (current.key === 'dayReview') return dayRating > 0
    if (current.key === 'emotion') return emotion.trim().length > 0
    if (current.key === 'tomorrow') return tomorrow.trim().length > 0
    return false
  }

  const handleNext = () => {
    if (!isValid()) return
    if (isLast) {
      onSave({
        energy: energy as unknown as string,
        dayRating: dayRating as unknown as string,
        whatWasGood,
        whatWasNotGood,
        dodifferently,
        emotion,
        tomorrow,
      } as unknown as DailyContent)
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.progress}>
        {STEPS.map((_, i) => <div key={i} className={`${styles.progressDot} ${i <= step ? styles.progressDotActive : ''}`} />)}
      </div>
      <div className={styles.stepContent} key={step}>
        <p className={styles.stepLabel}>{step + 1} of {STEPS.length}</p>
        <h2 className={styles.stepQuestion}>{current.label}</h2>
        <p className={styles.stepPrompt}>{current.prompt}</p>

        {current.key === 'energy' && <EnergyPicker value={energy} onChange={setEnergy} />}

        {current.key === 'dayReview' && (
          <div className={styles.dayReview}>
            <EnergyPicker value={dayRating} onChange={setDayRating} />
            <div className={styles.dayReviewQuestions}>
              <div className="field">
                <label>What was good?</label>
                <textarea placeholder="Write freely…" value={whatWasGood} onChange={e => setWhatWasGood(e.target.value)} rows={2} />
              </div>
              <div className="field">
                <label>What was not so good?</label>
                <textarea placeholder="Write freely…" value={whatWasNotGood} onChange={e => setWhatWasNotGood(e.target.value)} rows={2} />
              </div>
              <div className="field">
                <label>What would you do differently?</label>
                <textarea placeholder="Write freely…" value={dodifferently} onChange={e => setDodifferently(e.target.value)} rows={2} />
              </div>
            </div>
          </div>
        )}

        {current.key === 'emotion' && (
          <div className="field">
            <textarea autoFocus placeholder="Write freely…" value={emotion} onChange={e => setEmotion(e.target.value)} rows={5} />
          </div>
        )}

        {current.key === 'tomorrow' && (
          <div className="field">
            <textarea autoFocus placeholder="Write freely…" value={tomorrow} onChange={e => setTomorrow(e.target.value)} rows={5} />
          </div>
        )}
      </div>
      <div className={styles.formActions}>
        {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
        <button type="button" className="btn btn-primary" onClick={handleNext} disabled={!isValid()}>
          {isLast ? 'Save entry' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ── FREEWRITE FORM ─────────────────────────────────────────────
function ArticlePinner({ articles, onAdd, onRemove }: { articles: Article[]; onAdd: (a: Article) => void; onRemove: (url: string) => void }) {
  const [url, setUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  const fetchTitle = async () => {
    if (!url.trim()) return
    setFetching(true); setError('')
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url.trim())}`
      const res = await fetch(proxyUrl)
      const data = await res.json()
      const match = data.contents?.match(/<title[^>]*>([^<]+)<\/title>/i)
      const title = match ? match[1].trim().replace(/\s+/g, ' ') : new URL(url.trim()).hostname
      onAdd({ url: url.trim(), title, addedAt: new Date().toISOString() })
      setUrl('')
    } catch {
      setError('Saved with URL only.')
      onAdd({ url: url.trim(), title: url.trim(), addedAt: new Date().toISOString() })
      setUrl('')
    }
    setFetching(false)
  }

  return (
    <div className={styles.articlePinner}>
      <p className={styles.articlePinnerLabel}>📎 Pin an article</p>
      <div className={styles.articlePinnerInput}>
        <input type="url" placeholder="Paste article URL…" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchTitle()} />
        <button type="button" className="btn btn-secondary" onClick={fetchTitle} disabled={!url.trim() || fetching}>{fetching ? '…' : 'Add'}</button>
      </div>
      {error && <p className={styles.articleError}>{error}</p>}
      {articles.length > 0 && (
        <div className={styles.articleList}>
          {articles.map(a => (
            <div key={a.url} className={styles.articleCard}>
              <a href={a.url} target="_blank" rel="noopener noreferrer" className={styles.articleTitle}>{a.title}</a>
              <button type="button" className={styles.articleRemove} onClick={() => onRemove(a.url)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FreewriteForm({ onSave }: { onSave: (content: FreewriteContent) => void }) {
  const [text, setText] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  return (
    <div className={styles.form}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepQuestion}>Free write</h2>
        <p className={styles.stepPrompt}>No prompts, no structure. Write freely — or pin an article and reflect on it.</p>
        <div className="field">
          <textarea autoFocus placeholder="Begin writing…" value={text} onChange={e => setText(e.target.value)} rows={12} className={styles.freewriteArea} />
        </div>
        <p className={styles.wordCount}>{text.trim().split(/\s+/).filter(Boolean).length} words</p>
      </div>
      <ArticlePinner articles={articles} onAdd={a => setArticles(p => [...p, a])} onRemove={url => setArticles(p => p.filter(a => a.url !== url))} />
      <div className={styles.formActions}>
        <button type="button" className="btn btn-primary" onClick={() => onSave({ text, articles })} disabled={!text.trim() && articles.length === 0}>Save entry</button>
      </div>
    </div>
  )
}

// ── WEEKLY FORM ────────────────────────────────────────────────
function WeeklyForm({ onSave }: { onSave: (content: WeeklyContent) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [rating, setRating] = useState(0)
  const allFilled = WEEKLY_FIELDS.every(f => answers[f.key]?.trim()) && rating > 0
  return (
    <div className={styles.form}>
      <div className={styles.stepContent}>
        <h2 className={styles.stepQuestion}>Weekly reflection</h2>
        <p className={styles.stepPrompt}>Take 15 minutes to reflect on your week as a whole.</p>
      </div>
      {WEEKLY_FIELDS.map(field => (
        <div className={`${styles.weeklyField} field`} key={field.key}>
          <label>{field.label}</label>
          <p className={styles.fieldPrompt}>{field.prompt}</p>
          <textarea placeholder="Write freely…" value={answers[field.key] || ''} onChange={e => setAnswers(a => ({ ...a, [field.key]: e.target.value }))} rows={3} />
        </div>
      ))}
      <div className={styles.ratingSection}>
        <p className={styles.ratingLabel}>How was this week overall?</p>
        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map(n => (
            <button type="button" key={n} className={`${styles.star} ${n <= rating ? styles.starActive : ''}`} onClick={() => setRating(n)}>★</button>
          ))}
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className="btn btn-primary" onClick={() => onSave({ ...answers, rating } as unknown as WeeklyContent)} disabled={!allFilled}>Save weekly reflection</button>
      </div>
    </div>
  )
}

// ── MAIN ───────────────────────────────────────────────────────
export default function NewEntry() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { createEntry } = useEntries()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const entryType = (type as EntryType) || 'daily'

  const handleSave = async (content: DailyContent | FreewriteContent | WeeklyContent | MorningContent) => {
    setSaving(true); setSaveError('')
    const { error } = await createEntry(entryType, content)
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => navigate('/'), 1200) }
    else setSaveError('Could not save. Please try again.')
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
      {saveError && <p style={{ color: 'var(--rust)', fontSize: '0.85rem', marginBottom: '1rem' }}>{saveError}</p>}
      {entryType === 'morning' && <MorningForm onSave={handleSave} />}
      {entryType === 'daily' && <EveningForm onSave={handleSave} />}
      {entryType === 'freewrite' && <FreewriteForm onSave={handleSave} />}
      {entryType === 'weekly' && <WeeklyForm onSave={handleSave} />}
    </div>
  )
}
