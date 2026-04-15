import { useState } from 'react'
import { Entry } from '../types'
import { useSavedReflections } from '../hooks/useSavedReflections'
import { format } from 'date-fns'
import styles from './AIReflection.module.css'

interface Props {
  entry: Entry
}

function buildPrompt(entry: Entry): string {
  const lines: string[] = []
  const c = entry.content as Record<string, unknown>

  if (entry.type === 'daily') {
    if (c.highlight) lines.push(`Highlight: ${c.highlight}`)
    if (c.challenge) lines.push(`Challenge: ${c.challenge}`)
    if (c.decision) lines.push(`Decision: ${c.decision}`)
    if (c.emotion) lines.push(`Emotion: ${c.emotion}`)
    if (c.tomorrow) lines.push(`Intention: ${c.tomorrow}`)
  } else if (entry.type === 'morning') {
    if (c.gratitude) lines.push(`Gratitude: ${c.gratitude}`)
    if (c.intention) lines.push(`Intention: ${c.intention}`)
    if (c.lookingForward) lines.push(`Looking forward to: ${c.lookingForward}`)
  } else if (entry.type === 'freewrite') {
    if (c.text) lines.push(`${c.text}`)
  } else if (entry.type === 'weekly') {
    if (c.wins) lines.push(`Wins: ${c.wins}`)
    if (c.patterns) lines.push(`Patterns: ${c.patterns}`)
    if (c.difficult) lines.push(`Difficult: ${c.difficult}`)
    if (c.learned) lines.push(`Learned: ${c.learned}`)
  }

  return `You are a thoughtful executive coach and reflective practice guide. A professional has shared this journal entry with you:

---
${lines.join('\n')}
---

Your role is to help them go deeper. Respond with:
1. One genuine observation about what stands out — something they may not have noticed themselves
2. One powerful open question that would help them reflect further

Keep your response warm, concise, and focused. Do not give advice or solutions — only reflection and curiosity. Maximum 150 words.`
}

export default function AIReflection({ entry }: Props) {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [shown, setShown] = useState(false)
  const [saved, setSaved] = useState(false)
  const { reflections, saveReflection, deleteReflection } = useSavedReflections(entry.id)

  const askClaude = async () => {
    setLoading(true)
    setShown(true)
    setSaved(false)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: buildPrompt(entry) }],
        }),
      })
      const data = await res.json()
      const text = data.content?.map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '').join('') || 'No response received.'
      setResponse(text)
    } catch {
      setResponse('Unable to connect to Claude right now. Please try again.')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    await saveReflection(response, 'single', entry.id)
    setSaved(true)
  }

  return (
    <div>
      {/* Past saved reflections */}
      {reflections.length > 0 && (
        <div className={styles.savedList}>
          <p className={styles.savedListTitle}>✦ Saved reflections</p>
          {reflections.map(r => (
            <div key={r.id} className={styles.savedItem}>
              <p className={styles.savedDate}>{format(new Date(r.created_at), 'd MMM yyyy · h:mm a')}</p>
              <p className={styles.savedText}>{r.content}</p>
              <button className={styles.deleteReflection} onClick={() => deleteReflection(r.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {!shown ? (
        <button className={styles.trigger} onClick={askClaude}>
          <span className={styles.triggerIcon}>✦</span>
          Ask Claude for a reflection
        </button>
      ) : (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>✦</span>
            <p className={styles.panelTitle}>Claude's reflection</p>
          </div>
          {loading ? (
            <div className={styles.loading}>
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
            </div>
          ) : (
            <>
              <p className={styles.response}>{response}</p>
              <div className={styles.actions}>
                {!saved ? (
                  <button className={styles.saveBtn} onClick={handleSave}>
                    ↓ Save this reflection
                  </button>
                ) : (
                  <span className={styles.savedConfirm}>✓ Saved</span>
                )}
                <button className={styles.retry} onClick={askClaude}>Ask again →</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
