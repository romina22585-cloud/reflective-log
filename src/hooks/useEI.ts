import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { EICheckin, EIPracticeLog, EIAssessment, EICoachingItem } from '../types'
import { useAuth } from './useAuth'

export function useEI() {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState<EICheckin[]>([])
  const [practiceLogs, setPracticeLogs] = useState<EIPracticeLog[]>([])
  const [assessments, setAssessments] = useState<EIAssessment[]>([])
  const [coachingItems, setCoachingItems] = useState<EICoachingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [setupNeeded, setSetupNeeded] = useState(false)

  useEffect(() => { if (user) init() }, [user])

  const init = async () => {
    setLoading(true)
    const c = await supabase.from('ei_checkins').select('*').order('created_at', { ascending: false })
    const p = await supabase.from('ei_practice_logs').select('*').order('created_at', { ascending: false })
    const a = await supabase.from('ei_assessments').select('*').order('created_at', { ascending: false })
    // If the tables do not exist yet, the SQL script has not been run
    const k = await supabase.from('ei_coaching_items').select('*').order('created_at', { ascending: false })
    if (c.error || p.error || a.error || k.error) setSetupNeeded(true)
    setCoachingItems(k.data || [])
    setCheckins(c.data || [])
    setPracticeLogs(p.data || [])
    setAssessments(a.data || [])
    setLoading(false)
  }

  type NewCoachingItem = Pick<EICoachingItem, 'title' | 'what_happened' | 'felt' | 'did' | 'want'> & { checkin_id?: string | null }

  const addCoachingItem = async (item: NewCoachingItem) => {
    const { data, error } = await supabase.from('ei_coaching_items')
      .insert([{ ...item, user_id: user!.id }]).select().single()
    if (!error && data) setCoachingItems(prev => [data, ...prev])
    return { error: error?.message ?? null }
  }

  // Copy an emotion check-in into the coaching log
  const flagCheckin = async (c: EICheckin) => {
    return addCoachingItem({
      title: `${c.emotion} (${c.intensity}/5)`,
      what_happened: c.trigger,
      felt: [c.emotion, c.body].filter(Boolean).join(' · '),
      did: c.response,
      want: '',
      checkin_id: c.id,
    })
  }

  const markDiscussed = async (id: string, takeaway: string) => {
    const { data, error } = await supabase.from('ei_coaching_items')
      .update({ discussed: true, takeaway, discussed_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (!error && data) setCoachingItems(prev => prev.map(i => i.id === id ? data : i))
    return { error: error?.message ?? null }
  }

  const deleteCoachingItem = async (id: string) => {
    await supabase.from('ei_coaching_items').delete().eq('id', id)
    setCoachingItems(prev => prev.filter(i => i.id !== id))
  }

  const addCheckin = async (entry: Omit<EICheckin, 'id' | 'user_id' | 'created_at'>, bringToCoaching = false) => {
    const { data, error } = await supabase.from('ei_checkins')
      .insert([{ ...entry, user_id: user!.id }]).select().single()
    if (!error && data) {
      setCheckins(prev => [data, ...prev])
      if (bringToCoaching) await flagCheckin(data)
    }
    return { error: error?.message ?? null }
  }

  const deleteCheckin = async (id: string) => {
    await supabase.from('ei_checkins').delete().eq('id', id)
    setCheckins(prev => prev.filter(c => c.id !== id))
  }

  const logPractice = async (practiceId: string, note: string) => {
    const { data, error } = await supabase.from('ei_practice_logs')
      .insert([{ practice_id: practiceId, note, user_id: user!.id }]).select().single()
    if (!error && data) setPracticeLogs(prev => [data, ...prev])
    return { error: error?.message ?? null }
  }

  const deletePracticeLog = async (id: string) => {
    await supabase.from('ei_practice_logs').delete().eq('id', id)
    setPracticeLogs(prev => prev.filter(p => p.id !== id))
  }

  const saveAssessment = async (ratings: Record<string, number>, focus: string, idealSelf: string) => {
    const { data, error } = await supabase.from('ei_assessments')
      .insert([{ ratings, focus, ideal_self: idealSelf, user_id: user!.id }]).select().single()
    if (!error && data) setAssessments(prev => [data, ...prev])
    return { error: error?.message ?? null }
  }

  return { checkins, practiceLogs, assessments, coachingItems, addCoachingItem, flagCheckin, markDiscussed, deleteCoachingItem, loading, setupNeeded, addCheckin, deleteCheckin, logPractice, deletePracticeLog, saveAssessment }
}
