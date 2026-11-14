import { useState } from 'react'
import { format, subDays, isToday } from 'date-fns'
import { useEI } from '../hooks/useEI'
import { useSavedReflections } from '../hooks/useSavedReflections'
import { getClaudeApiKey } from '../lib/claudeKey'
import { EICheckin, EIPracticeLog, EIAssessment, EICoachingItem } from '../types'
import {
  DOMAINS, COMPETENCIES, PRACTICES, QUADRANTS, REACTIONS,
  competencyByKey, practiceById, Practice,
} from '../lib/eiContent'
import styles from './EmotionalIntelligence.module.css'

type View = 'home' | 'checkin' | 'practices' | 'assessment' | 'coach' | 'coaching'

export default function EmotionalIntelligence() {
  const ei = useEI()
  const [view, setView] = useState<View>('home')

  if (ei.loading) return <p className={styles.muted}>Loading…</p>

  if (ei.setupNeeded) {
    return (
      <div className={styles.setup}>
        <p className={styles.setupTitle}>One-time setup needed</p>
        <p>Run the file <strong>supabase-emotional-intelligence.sql</strong> in Supabase → SQL Editor, then refresh this page.</p>
      </div>
    )
  }

  const latest = ei.assessments[0] ?? null
  const focus = latest?.focus ? competencyByKey(latest.focus) : null
  const back = () => setView('home')

  return (
    <div className={styles.wrapper}>
      {view === 'home' && (
        <Home
          checkins={ei.checkins}
          practiceLogs={ei.practiceLogs}
          latest={latest}
          focusLabel={focus?.label ?? null}
          coachingItems={ei.coachingItems}
          onOpen={setView}
          onDeleteCheckin={ei.deleteCheckin}
          onFlagCheckin={ei.flagCheckin}
        />
      )}
      {view === 'checkin' && <CheckinForm onSave={ei.addCheckin} onBack={back} />}
      {view === 'practices' && (
        <PracticeLibrary
          logs={ei.practiceLogs}
          focusKey={latest?.focus ?? null}
          onLog={ei.logPractice}
          onDeleteLog={ei.deletePracticeLog}
          onBack={back}
        />
      )}
      {view === 'assessment' && <Assessment assessments={ei.assessments} onSave={ei.saveAssessment} onBack={back} />}
      {view === 'coaching' && (
        <CoachingLog items={ei.coachingItems} onAdd={ei.addCoachingItem} onDiscussed={ei.markDiscussed} onDelete={ei.deleteCoachingItem} onBack={back} />
      )}
      {view === 'coach' && <Coach checkins={ei.checkins} practiceLogs={ei.practiceLogs} latest={latest} onBack={back} />}
    </div>
  )
}

// ── HOME ──────────────────────────────────────────────────────
function Home({ checkins, practiceLogs, latest, focusLabel, coachingItems, onOpen, onDeleteCheckin, onFlagCheckin }: {
  coachingItems: EICoachingItem[]
  onFlagCheckin: (c: EICheckin) => Promise<{ error: string | null }>
  checkins: EICheckin[]
  practiceLogs: EIPracticeLog[]
  latest: EIAssessment | null
  focusLabel: string | null
  onOpen: (v: View) => void
  onDeleteCheckin: (id: string) => void
}) {
  const checkedInToday = checkins.some(c => isToday(new Date(c.created_at)))
  const weekAgo = subDays(new Date(), 7)
  const practicesThisWeek = practiceLogs.filter(p => new Date(p.created_at) >= weekAgo).length
  const assessedThisMonth = latest ? format(new Date(latest.created_at), 'yyyy-MM') === format(new Date(), 'yyyy-MM') : false

  const toDiscuss = coachingItems.filter(i => !i.discussed).length
  const flaggedIds = new Set(coachingItems.map(i => i.checkin_id).filter(Boolean))

  const cards: { view: View; icon: string; name: string; hint: string; done: boolean }[] = [
    { view: 'checkin', icon: '◐', name: 'Emotion check-in', hint: 'Name it · trigger · body · response · ~3 min', done: checkedInToday },
    { view: 'practices', icon: '✧', name: 'Practice library', hint: `${PRACTICES.length} activities · ${practicesThisWeek} logged this week`, done: practicesThisWeek > 0 },
    { view: 'assessment', icon: '◍', name: 'Monthly self-assessment', hint: latest ? `Last done ${format(new Date(latest.created_at), 'd MMM yyyy')}` : '12 statements · ~10 min', done: assessedThisMonth },
    { view: 'coaching', icon: '❖', name: 'Coaching log', hint: toDiscuss > 0 ? `${toDiscuss} to discuss at your next session` : 'Situations to bring to your coaching session', done: false },
    { view: 'coach', icon: '❋', name: 'Claude EI coach', hint: 'Patterns in your check-ins and practice', done: false },
  ]

  return (
    <div className={styles.home}>
      {focusLabel && (
        <div className={styles.focusBanner}>
          <p className={styles.focusLabel}>This month's focus</p>
          <p className={styles.focusName}>{focusLabel}</p>
        </div>
      )}

      <div className={styles.cards}>
        {cards.map(c => (
          <button key={c.view} className={`${styles.card} ${c.done ? styles.cardDone : ''}`} onClick={() => onOpen(c.view)}>
            <span className={styles.cardIcon}>{c.icon}</span>
            <div>
              <p className={styles.cardName}>{c.name}</p>
              <p className={styles.cardHint}>{c.hint}</p>
            </div>
            {c.done && <span className={styles.doneBadge}>✓</span>}
          </button>
        ))}
      </div>

      {checkins.length > 0 && (
        <div>
          <p className={styles.sectionTitle}>Recent check-ins</p>
          <div className={styles.list}>
            {checkins.slice(0, 8).map(c => {
              const q = QUADRANTS.find(q => q.key === c.quadrant)
              const reaction = REACTIONS.find(r => r.key === c.reaction)
              return (
                <div key={c.id} className={styles.row}>
                  <div className={styles.rowTop}>
                    <span className={styles.emotionChip} style={{ background: q?.color ?? '#8a7a65' }}>{c.emotion}</span>
                    <span className={styles.rowMeta}>{c.intensity}/5 · {format(new Date(c.created_at), 'EEE d MMM, HH:mm')}</span>
                    <button className={styles.deleteBtn} title="Delete" onClick={() => { if (confirm('Delete this check-in?')) onDeleteCheckin(c.id) }}>✕</button>
                  </div>
                  {c.trigger && <p className={styles.rowText}>{c.trigger}</p>}
                  {reaction && c.reaction !== 'none' && <p className={styles.rowSub}>{reaction.label}</p>}
                  {flaggedIds.has(c.id)
                    ? <p className={styles.rowSub}>✓ In your coaching log</p>
                    : <button type="button" className={styles.linkBtn} onClick={() => onFlagCheckin(c)}>+ Bring to coaching</button>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── EMOTION CHECK-IN ──────────────────────────────────────────
function CheckinForm({ onSave, onBack }: {
  onSave: (e: Omit<EICheckin, 'id' | 'user_id' | 'created_at'>, bringToCoaching?: boolean) => Promise<{ error: string | null }>
  onBack: () => void
}) {
  const [forCoaching, setForCoaching] = useState(false)
  const [quadrant, setQuadrant] = useState('')
  const [emotion, setEmotion] = useState('')
  const [custom, setCustom] = useState('')
  const [intensity, setIntensity] = useState(0)
  const [trigger, setTrigger] = useState('')
  const [body, setBody] = useState('')
  const [reaction, setReaction] = useState('')
  const [response, setResponse] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const q = QUADRANTS.find(x => x.key === quadrant)
  const finalEmotion = custom.trim() || emotion
  const valid = quadrant && finalEmotion && intensity > 0

  const save = async () => {
    if (!valid) return
    setSaving(true); setError('')
    const { error } = await onSave({ quadrant, emotion: finalEmotion, intensity, trigger, body, response, reaction: reaction || 'none' }, forCoaching)
    setSaving(false)
    if (error) { setError('Could not save. Please try again.'); return }
    setSaved(true)
    setTimeout(onBack, 1100)
  }

  if (saved) return <div className={styles.savedScreen}><span>◐</span><p>Check-in saved.</p></div>

  return (
    <div className={styles.form}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>
      <h2 className={styles.formTitle}>Emotion check-in</h2>
      <p className={styles.formIntro}>Emotions are information. Naming one precisely makes it easier to choose what you do with it.</p>

      <div className={styles.block}>
        <p className={styles.label}>1. Where are you right now?</p>
        <div className={styles.quadGrid}>
          {QUADRANTS.map(x => (
            <button key={x.key} type="button"
              className={`${styles.quadBtn} ${quadrant === x.key ? styles.quadActive : ''}`}
              style={quadrant === x.key ? { background: x.color, borderColor: x.color } : { borderColor: x.color, color: x.color }}
              onClick={() => { setQuadrant(x.key); setEmotion('') }}>
              <span className={styles.quadHint}>{x.hint}</span>
              <span className={styles.quadLabel}>{x.label}</span>
            </button>
          ))}
        </div>
      </div>

      {q && (
        <div className={styles.block}>
          <p className={styles.label}>2. Which word fits best?</p>
          <div className={styles.chips}>
            {q.emotions.map(e => (
              <button key={e} type="button"
                className={styles.chip}
                style={emotion === e && !custom.trim() ? { background: q.color, borderColor: q.color, color: 'white' } : undefined}
                onClick={() => { setEmotion(e); setCustom('') }}>{e}</button>
            ))}
          </div>
          <div className="field">
            <input type="text" placeholder="Or use your own word…" value={custom} onChange={e => setCustom(e.target.value)} />
          </div>
        </div>
      )}

      {finalEmotion && (
        <>
          <div className={styles.block}>
            <p className={styles.label}>3. How strong is it?</p>
            <div className={styles.scale}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" className={`${styles.scaleBtn} ${intensity === n ? styles.scaleActive : ''}`} onClick={() => setIntensity(n)}>
                  <span className={styles.scaleNum}>{n}</span>
                  <span className={styles.scaleLabel}>{['Faint', 'Mild', 'Clear', 'Strong', 'Intense'][n - 1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.block} field`}>
            <label>4. What set it off?</label>
            <textarea placeholder="The situation, the person, the thought…" value={trigger} onChange={e => setTrigger(e.target.value)} rows={3} />
          </div>

          <div className={`${styles.block} field`}>
            <label>5. Where did you feel it in your body?</label>
            <input type="text" placeholder="e.g. tight chest, clenched jaw, restless" value={body} onChange={e => setBody(e.target.value)} />
          </div>

          <div className={styles.block}>
            <p className={styles.label}>6. Did you pause, or react straight away?</p>
            <div className={styles.chips}>
              {REACTIONS.map(r => (
                <button key={r.key} type="button" className={`${styles.chip} ${reaction === r.key ? styles.chipActive : ''}`} onClick={() => setReaction(r.key)}>{r.label}</button>
              ))}
            </div>
            <div className="field">
              <textarea placeholder="What did you do or say? What would you do next time?" value={response} onChange={e => setResponse(e.target.value)} rows={3} />
            </div>
          </div>
          <label className={styles.checkRow}>
            <input type="checkbox" checked={forCoaching} onChange={e => setForCoaching(e.target.checked)} />
            <span>Bring this to my next coaching session</span>
          </label>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={save} disabled={!valid || saving}>{saving ? 'Saving…' : 'Save check-in'}</button>
      </div>
    </div>
  )
}

// ── PRACTICE LIBRARY ──────────────────────────────────────────
function PracticeLibrary({ logs, focusKey, onLog, onDeleteLog, onBack }: {
  logs: EIPracticeLog[]
  focusKey: string | null
  onLog: (practiceId: string, note: string) => Promise<{ error: string | null }>
  onDeleteLog: (id: string) => void
  onBack: () => void
}) {
  const [openDomain, setOpenDomain] = useState<string | null>(focusKey ? competencyByKey(focusKey)?.domain ?? null : null)
  const [openPractice, setOpenPractice] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [justLogged, setJustLogged] = useState<string | null>(null)

  const countFor = (id: string) => logs.filter(l => l.practice_id === id).length

  const log = async (p: Practice) => {
    setSaving(true)
    const { error } = await onLog(p.id, note.trim())
    setSaving(false)
    if (!error) { setNote(''); setJustLogged(p.id); setTimeout(() => setJustLogged(null), 1800) }
  }

  return (
    <div className={styles.form}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>
      <h2 className={styles.formTitle}>Practice library</h2>
      <p className={styles.formIntro}>Emotional intelligence grows through small experiments, repeated. Pick one, try it, and note what happened.</p>

      {DOMAINS.map(d => {
        const comps = COMPETENCIES.filter(c => c.domain === d.key)
        const isOpen = openDomain === d.key
        return (
          <div key={d.key} className={styles.domain}>
            <button className={styles.domainHeader} onClick={() => setOpenDomain(isOpen ? null : d.key)}>
              <div>
                <p className={styles.domainPart}>{d.part}</p>
                <p className={styles.domainLabel}>{d.label}</p>
                <p className={styles.domainDesc}>{d.description}</p>
              </div>
              <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && comps.map(c => (
              <div key={c.key} className={styles.competency}>
                <p className={styles.competencyLabel}>
                  {c.label}{focusKey === c.key && <span className={styles.focusTag}>Your focus</span>}
                </p>
                {PRACTICES.filter(p => p.competency === c.key).map(p => {
                  const open = openPractice === p.id
                  const count = countFor(p.id)
                  return (
                    <div key={p.id} className={`${styles.practice} ${open ? styles.practiceOpen : ''}`}>
                      <button className={styles.practiceHeader} onClick={() => { setOpenPractice(open ? null : p.id); setNote('') }}>
                        <span className={styles.practiceTitle}>{p.title}</span>
                        <span className={styles.practiceMeta}>{p.minutes} min{count > 0 ? ` · done ${count}×` : ''}</span>
                      </button>
                      {open && (
                        <div className={styles.practiceBody}>
                          <p className={styles.practiceSub}>How</p>
                          <p>{p.how}</p>
                          <p className={styles.practiceSub}>Why it works</p>
                          <p>{p.why}</p>
                          <p className={styles.practiceSource}>{p.source}</p>
                          <div className="field">
                            <textarea placeholder="What happened when you tried it? (optional)" value={note} onChange={e => setNote(e.target.value)} rows={2} />
                          </div>
                          <button type="button" className="btn btn-primary" onClick={() => log(p)} disabled={saving}>
                            {justLogged === p.id ? '✓ Logged' : saving ? 'Saving…' : 'Log this practice'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )
      })}

      {logs.length > 0 && (
        <div>
          <p className={styles.sectionTitle}>Practice log</p>
          <div className={styles.list}>
            {logs.slice(0, 15).map(l => (
              <div key={l.id} className={styles.row}>
                <div className={styles.rowTop}>
                  <span className={styles.rowTitle}>{practiceById(l.practice_id)?.title ?? l.practice_id}</span>
                  <span className={styles.rowMeta}>{format(new Date(l.created_at), 'd MMM')}</span>
                  <button className={styles.deleteBtn} title="Delete" onClick={() => { if (confirm('Delete this log?')) onDeleteLog(l.id) }}>✕</button>
                </div>
                {l.note && <p className={styles.rowText}>{l.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── MONTHLY SELF-ASSESSMENT ───────────────────────────────────
function Assessment({ assessments, onSave, onBack }: {
  assessments: EIAssessment[]
  onSave: (ratings: Record<string, number>, focus: string, idealSelf: string) => Promise<{ error: string | null }>
  onBack: () => void
}) {
  const latest = assessments[0] ?? null
  const previous = assessments[1] ?? null
  const [mode, setMode] = useState<'results' | 'new'>(latest ? 'results' : 'new')
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [focus, setFocus] = useState('')
  const [idealSelf, setIdealSelf] = useState(latest?.ideal_self ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const allRated = COMPETENCIES.every(c => ratings[c.key] > 0)

  const save = async () => {
    if (!allRated || !focus) return
    setSaving(true); setError('')
    const { error } = await onSave(ratings, focus, idealSelf.trim())
    setSaving(false)
    if (error) { setError('Could not save. Please try again.'); return }
    setRatings({}); setFocus(''); setMode('results')
  }

  if (mode === 'results' && latest) {
    return (
      <div className={styles.form}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <h2 className={styles.formTitle}>Self-assessment</h2>
        <p className={styles.formIntro}>
          {format(new Date(latest.created_at), 'd MMMM yyyy')}
          {previous ? ` · compared with ${format(new Date(previous.created_at), 'd MMMM yyyy')}` : ''}
        </p>

        {latest.ideal_self && (
          <div className={styles.idealSelf}>
            <p className={styles.practiceSub}>The leader I want to be</p>
            <p>{latest.ideal_self}</p>
          </div>
        )}

        {DOMAINS.map(d => (
          <div key={d.key} className={styles.resultDomain}>
            <p className={styles.domainPart}>{d.part}</p>
            <p className={styles.domainLabel}>{d.label}</p>
            {COMPETENCIES.filter(c => c.domain === d.key).map(c => {
              const now = latest.ratings[c.key] ?? 0
              const before = previous?.ratings[c.key]
              const diff = before !== undefined ? now - before : 0
              return (
                <div key={c.key} className={styles.resultRow}>
                  <div className={styles.resultHead}>
                    <span>{c.label}{latest.focus === c.key && <span className={styles.focusTag}>Focus</span>}</span>
                    <span className={styles.resultScore}>
                      {now}/5
                      {diff !== 0 && <span className={diff > 0 ? styles.up : styles.down}>{diff > 0 ? ` ▲ ${diff}` : ` ▼ ${Math.abs(diff)}`}</span>}
                    </span>
                  </div>
                  <div className={styles.bar}><div className={styles.barFill} style={{ width: `${(now / 5) * 100}%` }} /></div>
                </div>
              )
            })}
          </div>
        ))}

        <p className={styles.note}>This is your own view of yourself. Other people's ratings, such as a 360, often differ, and that gap is useful information.</p>

        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={() => setMode('new')}>Start a new assessment</button>
        </div>

        {assessments.length > 1 && (
          <p className={styles.muted}>{assessments.length} assessments so far, the first on {format(new Date(assessments[assessments.length - 1].created_at), 'd MMM yyyy')}.</p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.form}>
      <button className={styles.backBtn} onClick={latest ? () => setMode('results') : onBack}>← Back</button>
      <h2 className={styles.formTitle}>Monthly self-assessment</h2>
      <p className={styles.formIntro}>Think about the last four weeks. How often was each statement true of you? 1 = rarely, 5 = almost always.</p>

      {DOMAINS.map(d => (
        <div key={d.key} className={styles.resultDomain}>
          <p className={styles.domainPart}>{d.part}</p>
          <p className={styles.domainLabel}>{d.label}</p>
          {COMPETENCIES.filter(c => c.domain === d.key).map(c => (
            <div key={c.key} className={styles.rateRow}>
              <p className={styles.rateStatement}>{c.statement}</p>
              <div className={styles.rateBtns}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" className={`${styles.rateBtn} ${ratings[c.key] === n ? styles.rateActive : ''}`} onClick={() => setRatings(r => ({ ...r, [c.key]: n }))}>{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className={`${styles.block} field`}>
        <label>The leader I want to be <span className={styles.optional}>Optional</span></label>
        <p className={styles.fieldPrompt}>A few lines on who you want to be. Lasting change starts here, not with a list of weaknesses.</p>
        <textarea value={idealSelf} onChange={e => setIdealSelf(e.target.value)} rows={3} placeholder="Write freely…" />
      </div>

      <div className={styles.block}>
        <p className={styles.label}>My focus for the next month</p>
        <p className={styles.fieldPrompt}>Choose one. It can be a gap to close or a strength to build on.</p>
        <div className={styles.chips}>
          {COMPETENCIES.map(c => (
            <button key={c.key} type="button" className={`${styles.chip} ${focus === c.key ? styles.chipActive : ''}`} onClick={() => setFocus(c.key)}>
              {c.label}{ratings[c.key] ? ` · ${ratings[c.key]}` : ''}
            </button>
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={save} disabled={!allRated || !focus || saving}>{saving ? 'Saving…' : 'Save assessment'}</button>
      </div>
      {(!allRated || !focus) && <p className={styles.muted}>Rate all {COMPETENCIES.length} statements and choose a focus to save.</p>}
    </div>
  )
}

// ── COACHING LOG ──────────────────────────────────────────────
const COACHING_FIELDS: { key: 'what_happened' | 'felt' | 'did' | 'want'; label: string; prompt: string }[] = [
  { key: 'what_happened', label: 'What happened', prompt: 'The situation in a few lines: where, who was involved, what was said or done.' },
  { key: 'felt', label: 'What I felt', prompt: 'Name it as precisely as you can.' },
  { key: 'did', label: 'What I did', prompt: 'How you responded, or what you held back.' },
  { key: 'want', label: 'What I want from discussing it', prompt: 'A decision, another view, a way to handle it next time?' },
]

function CoachingLog({ items, onAdd, onDiscussed, onDelete, onBack }: {
  items: EICoachingItem[]
  onAdd: (item: Pick<EICoachingItem, 'title' | 'what_happened' | 'felt' | 'did' | 'want'>) => Promise<{ error: string | null }>
  onDiscussed: (id: string, takeaway: string) => Promise<{ error: string | null }>
  onDelete: (id: string) => void
  onBack: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [closing, setClosing] = useState<string | null>(null)
  const [takeaway, setTakeaway] = useState('')
  const [showDiscussed, setShowDiscussed] = useState(false)

  const open = items.filter(i => !i.discussed)
  const discussed = items.filter(i => i.discussed)
  const valid = title.trim() && (answers.what_happened || '').trim()

  const save = async () => {
    if (!valid) return
    setSaving(true); setError('')
    const { error } = await onAdd({
      title: title.trim(),
      what_happened: answers.what_happened || '',
      felt: answers.felt || '',
      did: answers.did || '',
      want: answers.want || '',
    })
    setSaving(false)
    if (error) { setError('Could not save. Please try again.'); return }
    setTitle(''); setAnswers({}); setAdding(false)
  }

  const close = async (id: string) => {
    setSaving(true)
    const { error } = await onDiscussed(id, takeaway.trim())
    setSaving(false)
    if (!error) { setClosing(null); setTakeaway('') }
  }

  const fields = (i: EICoachingItem) => COACHING_FIELDS.filter(f => i[f.key]).map(f => (
    <div key={f.key}>
      <p className={styles.practiceSub}>{f.label}</p>
      <p className={styles.rowText}>{i[f.key]}</p>
    </div>
  ))

  return (
    <div className={styles.form}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>
      <h2 className={styles.formTitle}>Coaching log</h2>
      <p className={styles.formIntro}>Note situations as they happen, so you have them ready for your coaching session.</p>
      <p className={styles.note}>Only you can see this. Open it in your session and share what you choose.</p>

      {!adding && (
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>+ Log a situation</button>
        </div>
      )}

      {adding && (
        <div className={styles.resultDomain}>
          <div className="field">
            <label>Short title</label>
            <input type="text" placeholder="e.g. Late change to the function sheet" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          {COACHING_FIELDS.map(f => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              <p className={styles.fieldPrompt}>{f.prompt}</p>
              <textarea rows={f.key === 'what_happened' ? 4 : 2} placeholder="Write freely…" value={answers[f.key] || ''} onChange={e => setAnswers(a => ({ ...a, [f.key]: e.target.value }))} />
            </div>
          ))}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={!valid || saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}

      <div>
        <p className={styles.sectionTitle}>For my next session · {open.length}</p>
        {open.length === 0 && <p className={styles.muted}>Nothing waiting. Log a situation here, or tick "Bring to coaching" on an emotion check-in.</p>}
        <div className={styles.list}>
          {open.map(i => (
            <div key={i.id} className={styles.row}>
              <div className={styles.rowTop}>
                <span className={styles.rowTitle}>{i.title}</span>
                <span className={styles.rowMeta}>{format(new Date(i.created_at), 'd MMM')}{i.checkin_id ? ' · from a check-in' : ''}</span>
                <button className={styles.deleteBtn} title="Delete" onClick={() => { if (confirm('Delete this item?')) onDelete(i.id) }}>✕</button>
              </div>
              {fields(i)}
              {closing === i.id ? (
                <div className={styles.block} style={{ marginTop: '0.75rem' }}>
                  <div className="field">
                    <label>What I am taking away</label>
                    <textarea rows={3} placeholder="What you learned, or what you will try next…" value={takeaway} onChange={e => setTakeaway(e.target.value)} />
                  </div>
                  <div className={styles.actions}>
                    <button type="button" className="btn btn-secondary" onClick={() => { setClosing(null); setTakeaway('') }}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => close(i.id)} disabled={saving}>Save</button>
                  </div>
                </div>
              ) : (
                <button type="button" className={styles.linkBtn} onClick={() => { setClosing(i.id); setTakeaway('') }}>Mark as discussed</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {discussed.length > 0 && (
        <div>
          <button type="button" className={styles.linkBtn} onClick={() => setShowDiscussed(v => !v)}>
            {showDiscussed ? '▲ Hide' : '▼ Show'} discussed · {discussed.length}
          </button>
          {showDiscussed && (
            <div className={styles.list} style={{ marginTop: '0.75rem' }}>
              {discussed.map(i => (
                <div key={i.id} className={styles.row}>
                  <div className={styles.rowTop}>
                    <span className={styles.rowTitle}>{i.title}</span>
                    <span className={styles.rowMeta}>discussed {i.discussed_at ? format(new Date(i.discussed_at), 'd MMM') : ''}</span>
                    <button className={styles.deleteBtn} title="Delete" onClick={() => { if (confirm('Delete this item?')) onDelete(i.id) }}>✕</button>
                  </div>
                  {fields(i)}
                  {i.takeaway && (
                    <div>
                      <p className={styles.practiceSub}>What I took away</p>
                      <p className={styles.rowText}>{i.takeaway}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── CLAUDE EI COACH ───────────────────────────────────────────
const COACH_DAYS = 30
const COACH_MIN = 3

function buildCoachPrompt(checkins: EICheckin[], logs: EIPracticeLog[], latest: EIAssessment | null): string {
  const ci = checkins.map(c => {
    const reaction = REACTIONS.find(r => r.key === c.reaction)?.label ?? ''
    return `[${format(new Date(c.created_at), 'EEE d MMM HH:mm')}] ${c.emotion} (${c.intensity}/5)` +
      (c.trigger ? `\nTrigger: ${c.trigger}` : '') +
      (c.body ? `\nBody: ${c.body}` : '') +
      (reaction ? `\nReaction: ${reaction}` : '') +
      (c.response ? `\nResponse: ${c.response}` : '')
  }).join('\n\n')

  const pl = logs.map(l => `[${format(new Date(l.created_at), 'd MMM')}] ${practiceById(l.practice_id)?.title ?? l.practice_id}${l.note ? ` — ${l.note}` : ''}`).join('\n')

  const sa = latest
    ? COMPETENCIES.map(c => `${c.label}: ${latest.ratings[c.key] ?? '-'}/5`).join('\n') +
      (latest.focus ? `\nChosen focus: ${competencyByKey(latest.focus)?.label}` : '') +
      (latest.ideal_self ? `\nThe leader they want to be: ${latest.ideal_self}` : '')
    : 'None yet.'

  const library = PRACTICES.map(p => `- ${p.title} (${competencyByKey(p.competency)?.label})`).join('\n')

  return `You are an executive coach who specialises in emotional intelligence. You work with the four-domain model (self-awareness, self-management, social awareness, relationship management). A manager has shared their records from the past ${COACH_DAYS} days.

EMOTION CHECK-INS
${ci || 'None.'}

PRACTICES LOGGED
${pl || 'None.'}

LATEST SELF-ASSESSMENT (self-rated)
${sa}

PRACTICE LIBRARY (the only practices you may suggest, by exact title)
${library}

Respond with exactly four sections:

**Patterns I notice**
2-3 patterns in their emotions, triggers, body signals or reactions. Be specific and quote their own words briefly.

**A strength to build on**
One thing they are already doing well, with the evidence.

**Practice to try next**
One practice from the library, by its exact title, and why it fits what you see. Link it to their chosen focus if they have one.

**A question to sit with**
One open, unhurried question.

Warm, honest, direct. British English. No generic coaching language. Do not diagnose. Maximum 280 words in total.`
}

function parseSections(text: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = []
  const parts = text.split(/\*\*([^*]+)\*\*/)
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim()
    const content = parts[i + 1]?.trim() || ''
    if (title && content) sections.push({ title, content })
  }
  if (sections.length === 0) sections.push({ title: 'Insights', content: text })
  return sections
}

function Coach({ checkins, practiceLogs, latest, onBack }: {
  checkins: EICheckin[]
  practiceLogs: EIPracticeLog[]
  latest: EIAssessment | null
  onBack: () => void
}) {
  const [sections, setSections] = useState<{ title: string; content: string }[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [failed, setFailed] = useState(false)
  const { saveReflection } = useSavedReflections()

  const cutoff = subDays(new Date(), COACH_DAYS)
  const recentCheckins = checkins.filter(c => new Date(c.created_at) >= cutoff).reverse()
  const recentLogs = practiceLogs.filter(l => new Date(l.created_at) >= cutoff).reverse()
  const total = recentCheckins.length + recentLogs.length
  const hasEnough = total >= COACH_MIN

  const fail = (title: string, content: string) => { setSections([{ title, content }]); setFailed(true); setLoading(false) }

  const ask = async () => {
    setLoading(true); setSaved(false); setFailed(false); setSections(null)
    const apiKey = await getClaudeApiKey()
    if (!apiKey) return fail('Setup needed', 'API key not found in Supabase or environment.')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: buildCoachPrompt(recentCheckins, recentLogs, latest) }],
        }),
      })
      const data = await res.json()
      if (!res.ok) return fail('Error', `API error ${res.status}: ${data?.error?.message || 'Unknown'}`)
      const text = data.content?.map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '').join('') || ''
      if (!text) return fail('Error', 'Empty response received.')
      setSections(parseSections(text))
    } catch (err) {
      return fail('Error', `Connection failed: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
    setLoading(false)
  }

  const save = async () => {
    if (!sections) return
    const text = 'EI COACH\n\n' + sections.map(s => `${s.title}\n${s.content}`).join('\n\n')
    const { error } = await saveReflection(text, 'multi')
    if (!error) setSaved(true)
  }

  return (
    <div className={styles.form}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>
      <h2 className={styles.formTitle}>Claude EI coach</h2>
      <p className={styles.formIntro}>
        Claude reads your last {COACH_DAYS} days of check-ins and practice notes, with your latest self-assessment, and suggests what to practise next.
      </p>

      <p className={styles.muted}>{recentCheckins.length} check-ins · {recentLogs.length} practices in the last {COACH_DAYS} days</p>

      {!hasEnough && <p className={styles.note}>Add at least {COACH_MIN} check-ins or practices and the coach will have enough to work with.</p>}

      {hasEnough && !loading && (
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={ask}>{sections ? 'Ask again' : 'Ask the coach'}</button>
        </div>
      )}

      {loading && <p className={styles.muted}>Reading your entries…</p>}

      {sections && (
        <div className={styles.coachCard}>
          {sections.map(s => (
            <div key={s.title} className={styles.coachSection}>
              <p className={styles.practiceSub}>{s.title}</p>
              <p className={styles.coachText}>{s.content}</p>
            </div>
          ))}
          {!failed && (
            <button type="button" className="btn btn-secondary" onClick={save} disabled={saved}>
              {saved ? '✓ Saved to Claude Insights' : 'Save to Claude Insights'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
