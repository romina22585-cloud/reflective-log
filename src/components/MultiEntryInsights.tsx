import { useState } from 'react'
import { Entry } from '../types'
import { format, subDays } from 'date-fns'
import { useSavedReflections } from '../hooks/useSavedReflections'
import { getClaudeApiKey } from '../lib/claudeKey'
import styles from './MultiEntryInsights.module.css'

interface Props { entries: Entry[] }

const MIN_ENTRIES = 3
const DAYS_WINDOW = 14

function serializeEntry(entry: Entry): string {
  const c = entry.content as Record<string, unknown>
  const date = format(new Date(entry.created_at), 'EEE d MMM')
  const lines: string[] = [`[${date} — ${entry.type === 'daily' ? 'EVENING CHECK-IN' : entry.type === 'morning' ? 'MORNING CHECK-IN' : entry.type.toUpperCase()}]`]
  if (entry.type === 'morning') {
    if (c.energy) lines.push(`Energy: ${c.energy}/5`)
    if (c.gratitude) lines.push(`Gratitude: ${c.gratitude}`)
    if (c.intention) lines.push(`Intention: ${c.intention}`)
    if (c.lookingForward) lines.push(`Looking forward to: ${c.lookingForward}`)
  } else if (entry.type === 'daily') {
    if (c.highlight) lines.push(`Highlight: ${c.highlight}`)
    if (c.challenge) lines.push(`Challenge: ${c.challenge}`)
    if (c.decision) lines.push(`Decision: ${c.decision}`)
    if (c.emotion) lines.push(`Emotion: ${c.emotion}`)
    if (c.tomorrow) lines.push(`Tomorrow: ${c.tomorrow}`)
  } else if (entry.type === 'freewrite') {
    if (c.text) lines.push(`${c.text}`)
  } else if (entry.type === 'weekly') {
    if (c.wins) lines.push(`Wins: ${c.wins}`)
    if (c.patterns) lines.push(`Patterns: ${c.patterns}`)
    if (c.difficult) lines.push(`Difficult: ${c.difficult}`)
    if (c.learned) lines.push(`Learned: ${c.learned}`)
    if (c.nextWeek) lines.push(`Next week: ${c.nextWeek}`)
  }
  return lines.join('\n')
}

function buildPrompt(entries: Entry[]): string {
  const serialized = entries.map(serializeEntry).join('\n\n')
  return `You are a thoughtful executive coach. A professional shared their journal entries from the past ${DAYS_WINDOW} days:
---
${serialized}
---
Respond with exactly three sections:

**Patterns I notice**
2-3 recurring themes, emotions, or situations across these entries.

**Something you may not have seen**
One observation the person is unlikely to have noticed themselves.

**A question to sit with**
One open, unhurried question. An invitation, not a challenge.

Warm, honest, direct. No generic coaching language. No advice. Maximum 250 words total.`
}

interface InsightSection { title: string; content: string }

function parseResponse(text: string): InsightSection[] {
  const sections: InsightSection[] = []
  const parts = text.split(/\*\*([^*]+)\*\*/)
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim()
    const content = parts[i + 1]?.trim() || ''
    if (title && content) sections.push({ title, content })
  }
  if (sections.length === 0) sections.push({ title: 'Insights', content: text })
  return sections
}

function formatInsightText(sections: InsightSection[]): string {
  return sections.map(s => `${s.title}\n${s.content}`).join('\n\n')
}

export default function MultiEntryInsights({ entries }: Props) {
  const [response, setResponse] = useState<InsightSection[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [shown, setShown] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [saved, setSaved] = useState(false)
  const { reflections, saveReflection, deleteReflection } = useSavedReflections()
  const multiReflections = reflections.filter(r => r.type === 'multi')

  const cutoff = subDays(new Date(), DAYS_WINDOW)
  const recentEntries = entries
    .filter(e => new Date(e.created_at) >= cutoff)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const hasEnough = recentEntries.length >= MIN_ENTRIES

  const analyse = async () => {
    setLoading(true)
    setShown(true)
    setSaved(false)

    const apiKey = await getClaudeApiKey()
    if (!apiKey) {
      setResponse([{ title: 'Setup needed', content: 'API key not found in Supabase or environment.' }])
      setLoading(false)
      return
    }

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
          messages: [{ role: 'user', content: buildPrompt(recentEntries) }],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResponse([{ title: 'Error', content: `API error ${res.status}: ${data?.error?.message || 'Unknown'}` }])
        setLoading(false)
        return
      }
      const text = data.content?.map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '').join('') || ''
      setResponse(text ? parseResponse(text) : [{ title: 'Error', content: 'Empty response received.' }])
    } catch (err) {
      setResponse([{ title: 'Error', content: `Connection failed: ${err instanceof Error ? err.message : 'Unknown'}` }])
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!response) return
    await saveReflection(formatInsightText(response), 'multi', undefined)
    setSaved(true)
  }

  if (dismissed && multiReflections.length === 0) return null

  return (
    <div className={styles.wrapper}>
      {multiReflections.length > 0 && (
        <div className={styles.savedList}>
          <p className={styles.savedListTitle}>◈ Saved insights</p>
          {multiReflections.map(r => (
            <div key={r.id} className={styles.savedItem}>
              <p className={styles.savedDate}>{format(new Date(r.created_at), 'd MMM yyyy · h:mm a')}</p>
              <p className={styles.savedText}>{r.content}</p>
              <button className={styles.deleteBtn} onClick={() => deleteReflection(r.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {!dismissed && (
        <>
          {!shown ? (
            <button className={styles.trigger} onClick={hasEnough ? analyse : undefined} disabled={!hasEnough}>
              <span className={styles.triggerLeft}>
                <span className={styles.triggerIcon}>◈</span>
                <span>
                  <span className={styles.triggerTitle}>Analyse my recent entries</span>
                  <span className={styles.triggerSub}>
                    {hasEnough
                      ? `${recentEntries.length} entries · last ${DAYS_WINDOW} days`
                      : `You need ${MIN_ENTRIES - recentEntries.length} more entr${MIN_ENTRIES - recentEntries.length === 1 ? 'y' : 'ies'} to unlock insights`}
                  </span>
                </span>
              </span>
              <span className={styles.triggerArrow}>{hasEnough ? '→' : '🔒'}</span>
            </button>
          ) : (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelMeta}>
                  <span className={styles.panelIcon}>◈</span>
                  <div>
                    <p className={styles.panelTitle}>Insights across your entries</p>
                    <p className={styles.panelSub}>{recentEntries.length} entries · last {DAYS_WINDOW} days</p>
                  </div>
                </div>
                <button className={styles.dismissBtn} onClick={() => setDismissed(true)}>✕</button>
              </div>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingDots}><span /><span /><span /></div>
                  <p className={styles.loadingText}>Reading your entries…</p>
                </div>
              ) : (
                <>
                  <div className={styles.sections}>
                    {response?.map((section, i) => (
                      <div key={i} className={styles.section} style={{ animationDelay: `${i * 100}ms` }}>
                        <p className={styles.sectionTitle}>{section.title}</p>
                        <p className={styles.sectionContent}>{section.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className={styles.panelFooter}>
                    {!saved ? (
                      <button className={styles.saveBtn} onClick={handleSave}>↓ Save these insights</button>
                    ) : (
                      <span className={styles.savedConfirm}>✓ Saved</span>
                    )}
                    <button className={styles.reanalyse} onClick={analyse}>Analyse again →</button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
