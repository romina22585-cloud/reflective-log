import { useState } from 'react'
import { useTravel } from '../hooks/useTravel'
import { Trip, TravelEntry } from '../types'
import { format, differenceInDays, parseISO } from 'date-fns'
import styles from './TravelLog.module.css'

type View = 'home' | 'newTrip' | 'dailyEntry' | 'closeTrip' | 'tripDetail'

export default function TravelLog() {
  const { trips, loading, activeTrip, startTrip, closeTrip, addDailyEntry, deleteTrip, entriesForTrip } = useTravel()
  const [view, setView] = useState<View>('home')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (loading) return null

  return (
    <div className={styles.wrapper}>
      {view === 'home' && (
        <HomeView
          activeTrip={activeTrip}
          trips={trips}
          entriesForTrip={entriesForTrip}
          onNewTrip={() => setView('newTrip')}
          onDailyEntry={() => setView('dailyEntry')}
          onCloseTrip={() => setView('closeTrip')}
          onViewTrip={(trip) => { setSelectedTrip(trip); setView('tripDetail') }}
          onDeleteTrip={deleteTrip}
        />
      )}
      {view === 'newTrip' && (
        <NewTripForm
          onSave={async (dest, country, date) => {
            setSaving(true)
            await startTrip(dest, country, date)
            setSaving(false)
            setView('home')
          }}
          onCancel={() => setView('home')}
          saving={saving}
        />
      )}
      {view === 'dailyEntry' && activeTrip && (
        <DailyEntryForm
          trip={activeTrip}
          onSave={async (entry) => {
            setSaving(true)
            await addDailyEntry(activeTrip.id, entry)
            setSaving(false)
            setSaved(true)
            setTimeout(() => { setSaved(false); setView('home') }, 1200)
          }}
          onCancel={() => setView('home')}
          saving={saving}
          saved={saved}
        />
      )}
      {view === 'closeTrip' && activeTrip && (
        <CloseTripForm
          trip={activeTrip}
          onSave={async (summary, endDate) => {
            setSaving(true)
            await closeTrip(activeTrip.id, summary, endDate)
            setSaving(false)
            setView('home')
          }}
          onCancel={() => setView('home')}
          saving={saving}
        />
      )}
      {view === 'tripDetail' && selectedTrip && (
        <TripDetail
          trip={selectedTrip}
          entries={entriesForTrip(selectedTrip.id)}
          onBack={() => { setSelectedTrip(null); setView('home') }}
        />
      )}
    </div>
  )
}

// ── HOME ──────────────────────────────────────────────────────
function HomeView({ activeTrip, trips, entriesForTrip, onNewTrip, onDailyEntry, onCloseTrip, onViewTrip, onDeleteTrip }: {
  activeTrip: Trip | null
  trips: Trip[]
  entriesForTrip: (id: string) => TravelEntry[]
  onNewTrip: () => void
  onDailyEntry: () => void
  onCloseTrip: () => void
  onViewTrip: (t: Trip) => void
  onDeleteTrip: (id: string) => void
}) {
  const pastTrips = trips.filter(t => !t.is_active)

  return (
    <div className={styles.home}>
      {/* Active trip banner */}
      {activeTrip ? (
        <div className={styles.activeBanner}>
          <div className={styles.activeBannerLeft}>
            <span className={styles.activeDot} />
            <div>
              <p className={styles.activeBannerLabel}>Currently travelling</p>
              <p className={styles.activeBannerDest}>{activeTrip.destination}{activeTrip.country ? `, ${activeTrip.country}` : ''}</p>
              <p className={styles.activeBannerDays}>
                Day {differenceInDays(new Date(), parseISO(activeTrip.start_date)) + 1} · since {format(parseISO(activeTrip.start_date), 'd MMM yyyy')}
              </p>
            </div>
          </div>
          <div className={styles.activeBannerActions}>
            <button className={styles.actionBtn} onClick={onDailyEntry}>+ Today's entry</button>
            <button className={styles.closeBtn} onClick={onCloseTrip}>Close trip</button>
          </div>
        </div>
      ) : (
        <button className={styles.newTripBtn} onClick={onNewTrip}>
          <span className={styles.newTripIcon}>✈</span>
          <div>
            <p className={styles.newTripLabel}>Start a new trip</p>
            <p className={styles.newTripHint}>Begin logging your travels</p>
          </div>
        </button>
      )}

      {/* Past trips */}
      {pastTrips.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Past trips</p>
          <div className={styles.tripList}>
            {pastTrips.map(trip => {
              const entryCount = entriesForTrip(trip.id).length
              const days = trip.end_date ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1 : null
              return (
                <div key={trip.id} className={styles.tripCard} onClick={() => onViewTrip(trip)}>
                  <div className={styles.tripCardLeft}>
                    <p className={styles.tripCardDest}>{trip.destination}{trip.country ? `, ${trip.country}` : ''}</p>
                    <p className={styles.tripCardMeta}>
                      {format(parseISO(trip.start_date), 'd MMM')}
                      {trip.end_date ? ` – ${format(parseISO(trip.end_date), 'd MMM yyyy')}` : ''}
                      {days ? ` · ${days} days` : ''}
                      {entryCount > 0 ? ` · ${entryCount} entries` : ''}
                    </p>
                  </div>
                  <div className={styles.tripCardRight}>
                    <span className={styles.tripArrow}>→</span>
                    <button className={styles.tripDelete} onClick={e => { e.stopPropagation(); if (confirm('Delete this trip?')) onDeleteTrip(trip.id) }}>✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {trips.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>🌍</p>
          <p>Your travel memories start here.</p>
          <p>Start a trip to begin logging.</p>
        </div>
      )}
    </div>
  )
}

// ── NEW TRIP FORM ─────────────────────────────────────────────
function NewTripForm({ onSave, onCancel, saving }: { onSave: (d: string, c: string, date: string) => void; onCancel: () => void; saving: boolean }) {
  const [destination, setDestination] = useState('')
  const [country, setCountry] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Start a new trip</h2>
      <div className="field">
        <label>Destination / City</label>
        <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Tokyo" autoFocus />
      </div>
      <div className="field">
        <label>Country</label>
        <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Japan" />
      </div>
      <div className="field">
        <label>Start date</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>
      <div className={styles.formActions}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(destination, country, startDate)} disabled={!destination.trim() || saving}>
          {saving ? 'Starting…' : 'Start trip ✈'}
        </button>
      </div>
    </div>
  )
}

// ── DAILY ENTRY FORM ──────────────────────────────────────────
function DailyEntryForm({ trip, onSave, onCancel, saving, saved }: {
  trip: Trip; onSave: (e: Omit<TravelEntry, 'id' | 'user_id' | 'trip_id' | 'created_at'>) => void
  onCancel: () => void; saving: boolean; saved: boolean
}) {
  const [step, setStep] = useState(0)
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [location, setLocation] = useState('')
  const [moment, setMoment] = useState('')
  const [food, setFood] = useState('')
  const [people, setPeople] = useState('')
  const [surprise, setSurprise] = useState('')
  const [feeling, setFeeling] = useState('')

  const STEPS = [
    { key: 'location', label: 'Where are you today?', prompt: 'Neighbourhood, area, or what you explored today.', value: location, set: setLocation, optional: false },
    { key: 'moment', label: 'One moment that stood out', prompt: 'The scene, the feeling, the detail you don\'t want to forget.', value: moment, set: setMoment, optional: false },
    { key: 'food', label: 'Best thing you ate or drank', prompt: 'What was it, where did you have it, what made it special?', value: food, set: setFood, optional: true },
    { key: 'people', label: 'Someone you met', prompt: 'A local, a fellow traveller, a conversation worth keeping.', value: people, set: setPeople, optional: true },
    { key: 'surprise', label: 'Something that surprised you', prompt: 'What challenged or shifted your perspective today?', value: surprise, set: setSurprise, optional: true },
    { key: 'feeling', label: 'How did today feel?', prompt: 'One word or one sentence — your emotional snapshot.', value: feeling, set: setFeeling, optional: false },
  ]

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isValid = current.value.trim().length > 0

  const handleNext = () => {
    if (!isValid && !current.optional) return
    if (isLast) {
      onSave({ entry_date: entryDate, location, moment, food, people, surprise, feeling })
    } else {
      setStep(s => s + 1)
    }
  }

  if (saved) return (
    <div className={styles.savedScreen}>
      <span className={styles.savedIcon}>✈</span>
      <h2>Entry saved.</h2>
    </div>
  )

  return (
    <div className={styles.form}>
      <div className={styles.tripContext}>
        <span>✈</span>
        <p>{trip.destination}{trip.country ? `, ${trip.country}` : ''}</p>
      </div>

      {step === 0 && (
        <div className="field" style={{ marginBottom: '1rem' }}>
          <label>Date</label>
          <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} />
        </div>
      )}

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
        <div className="field">
          <textarea autoFocus placeholder="Write freely…" value={current.value} onChange={e => current.set(e.target.value)} rows={4} />
        </div>
      </div>

      <div className={styles.formActions}>
        {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {current.optional && !isValid && (
          <button className="btn btn-secondary" onClick={() => isLast ? onSave({ entry_date: entryDate, location, moment, food, people, surprise, feeling }) : setStep(s => s + 1)}>Skip</button>
        )}
        <button className="btn btn-primary" onClick={handleNext} disabled={!isValid && !current.optional || saving}>
          {saving ? 'Saving…' : isLast ? 'Save entry' : 'Next →'}
        </button>
      </div>
      <button className="btn btn-ghost" onClick={onCancel} style={{ width: '100%', marginTop: '0.5rem' }}>Cancel</button>
    </div>
  )
}

// ── CLOSE TRIP FORM ───────────────────────────────────────────
function CloseTripForm({ trip, onSave, onCancel, saving }: {
  trip: Trip; onSave: (s: { overallFeeling: string; topMemories: string; wouldGoBack: string; whatItGaveYou: string }, endDate: string) => void
  onCancel: () => void; saving: boolean
}) {
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [overallFeeling, setOverallFeeling] = useState('')
  const [topMemories, setTopMemories] = useState('')
  const [wouldGoBack, setWouldGoBack] = useState('')
  const [whatItGaveYou, setWhatItGaveYou] = useState('')
  const allFilled = overallFeeling.trim() && topMemories.trim() && wouldGoBack.trim() && whatItGaveYou.trim()

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>Close trip — {trip.destination}</h2>
      <div className="field">
        <label>End date</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} />
      </div>
      <div className="field">
        <label>Overall feeling about this place</label>
        <textarea placeholder="How would you describe this place in a sentence or two?" value={overallFeeling} onChange={e => setOverallFeeling(e.target.value)} rows={3} />
      </div>
      <div className="field">
        <label>Top 3 memories</label>
        <textarea placeholder="The moments you'll carry with you…" value={topMemories} onChange={e => setTopMemories(e.target.value)} rows={4} />
      </div>
      <div className="field">
        <label>Would you go back, and why?</label>
        <textarea placeholder="Write freely…" value={wouldGoBack} onChange={e => setWouldGoBack(e.target.value)} rows={3} />
      </div>
      <div className="field">
        <label>What did this trip give you?</label>
        <textarea placeholder="What shifted, opened up, or became clearer…" value={whatItGaveYou} onChange={e => setWhatItGaveYou(e.target.value)} rows={3} />
      </div>
      <div className={styles.formActions}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave({ overallFeeling, topMemories, wouldGoBack, whatItGaveYou }, endDate)} disabled={!allFilled || saving}>
          {saving ? 'Saving…' : 'Close trip'}
        </button>
      </div>
    </div>
  )
}

// ── TRIP DETAIL ───────────────────────────────────────────────
function TripDetail({ trip, entries, onBack }: { trip: Trip; entries: TravelEntry[]; onBack: () => void }) {
  const days = trip.end_date ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1 : null
  const sorted = [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date))

  return (
    <div className={styles.tripDetail}>
      <div className={styles.tripDetailHeader}>
        <h1 className={styles.tripDetailDest}>{trip.destination}</h1>
        {trip.country && <p className={styles.tripDetailCountry}>{trip.country}</p>}
        <p className={styles.tripDetailMeta}>
          {format(parseISO(trip.start_date), 'd MMM')}
          {trip.end_date ? ` – ${format(parseISO(trip.end_date), 'd MMM yyyy')}` : ''}
          {days ? ` · ${days} days` : ''}
        </p>
      </div>

      {/* Summary */}
      {trip.summary && (
        <div className={styles.summaryCard}>
          <p className={styles.summaryTitle}>✦ Trip summary</p>
          {[
            { label: 'Overall feeling', value: trip.summary.overallFeeling },
            { label: 'Top memories', value: trip.summary.topMemories },
            { label: 'Would go back?', value: trip.summary.wouldGoBack },
            { label: 'What it gave me', value: trip.summary.whatItGaveYou },
          ].map(item => (
            <div key={item.label} className={styles.summarySection}>
              <p className={styles.summarySectionLabel}>{item.label}</p>
              <p className={styles.summarySectionText}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Daily entries */}
      {sorted.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Daily entries</p>
          {sorted.map(entry => (
            <div key={entry.id} className={styles.entryCard}>
              <p className={styles.entryCardDate}>{format(parseISO(entry.entry_date), 'EEEE, d MMMM yyyy')}</p>
              {entry.location && <div className={styles.entryField}><span className={styles.entryFieldLabel}>📍 Location</span><span>{entry.location}</span></div>}
              {entry.moment && <div className={styles.entryField}><span className={styles.entryFieldLabel}>✨ Moment</span><span>{entry.moment}</span></div>}
              {entry.food && <div className={styles.entryField}><span className={styles.entryFieldLabel}>🍽 Food</span><span>{entry.food}</span></div>}
              {entry.people && <div className={styles.entryField}><span className={styles.entryFieldLabel}>👤 People</span><span>{entry.people}</span></div>}
              {entry.surprise && <div className={styles.entryField}><span className={styles.entryFieldLabel}>💡 Surprise</span><span>{entry.surprise}</span></div>}
              {entry.feeling && <div className={styles.entryField}><span className={styles.entryFieldLabel}>💭 Feeling</span><span>{entry.feeling}</span></div>}
            </div>
          ))}
        </div>
      )}

      {sorted.length === 0 && !trip.summary && (
        <p className={styles.emptyEntries}>No entries recorded for this trip.</p>
      )}
    </div>
  )
}
