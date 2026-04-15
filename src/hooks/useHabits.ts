import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Habit, HabitLog } from '../types'
import { useAuth } from './useAuth'
import { format } from 'date-fns'

export const DEFAULT_HABITS = [
  { name: 'Water (min. 1.5lt)', emoji: '💧', is_default: true, sort_order: 0 },
  { name: 'Meditation', emoji: '🧘', is_default: true, sort_order: 1 },
  { name: 'Morning phone fasting', emoji: '📵', is_default: true, sort_order: 2 },
  { name: 'Cold shower', emoji: '🚿', is_default: true, sort_order: 3 },
  { name: 'Physical connection', emoji: '🤗', is_default: true, sort_order: 4 },
  { name: 'Meet a friend / family', emoji: '👥', is_default: true, sort_order: 5 },
  { name: 'Phone a friend / family', emoji: '📞', is_default: true, sort_order: 6 },
  { name: 'Sun (min. 10 min)', emoji: '☀️', is_default: true, sort_order: 7 },
  { name: 'Walk in nature', emoji: '🌿', is_default: true, sort_order: 8 },
  { name: 'Fruit & veg (min. 8 types)', emoji: '🥦', is_default: true, sort_order: 9 },
  { name: 'Sleep 7-9 hours', emoji: '🌙', is_default: true, sort_order: 10 },
  { name: 'Walk (10,000 steps)', emoji: '👟', is_default: true, sort_order: 11 },
  { name: 'Stretch class (20 min)', emoji: '🤸', is_default: true, sort_order: 12 },
  { name: 'FIIT class (25-40 min)', emoji: '🏋️', is_default: true, sort_order: 13 },
]

function getTodayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState(getTodayStr)
  const dateCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Watch for midnight — check every minute if the date has changed
  useEffect(() => {
    dateCheckRef.current = setInterval(() => {
      const newDay = getTodayStr()
      if (newDay !== today) {
        setToday(newDay)
        // Reload logs so completed habits reset for the new day
        fetchLogs()
      }
    }, 60_000)
    return () => {
      if (dateCheckRef.current) clearInterval(dateCheckRef.current)
    }
  }, [today])

  useEffect(() => {
    if (user) init()
  }, [user])

  const fetchLogs = async () => {
    const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('logged_date', thirtyDaysAgo)
    setLogs(data || [])
  }

  const init = async () => {
    setLoading(true)
    const { data: existing } = await supabase
      .from('habits')
      .select('*')
      .order('sort_order')

    if (existing && existing.length === 0) {
      await supabase.from('habits').insert(
        DEFAULT_HABITS.map(h => ({ ...h, user_id: user!.id }))
      )
      const { data: seeded } = await supabase.from('habits').select('*').order('sort_order')
      setHabits(seeded || [])
    } else {
      setHabits(existing || [])
    }

    await fetchLogs()
    setLoading(false)
  }

  const toggleHabit = async (habitId: string) => {
    const currentToday = getTodayStr()
    const existing = logs.find(l => l.habit_id === habitId && l.logged_date === currentToday)
    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id)
      setLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const { data } = await supabase.from('habit_logs').insert([{
        habit_id: habitId,
        user_id: user!.id,
        logged_date: currentToday,
      }]).select().single()
      if (data) setLogs(prev => [...prev, data])
    }
  }

  const addHabit = async (name: string, emoji: string) => {
    const { data } = await supabase.from('habits').insert([{
      name, emoji, user_id: user!.id, is_default: false, sort_order: habits.length
    }]).select().single()
    if (data) setHabits(prev => [...prev, data])
  }

  const deleteHabit = async (id: string) => {
    await supabase.from('habits').delete().eq('id', id)
    setHabits(prev => prev.filter(h => h.id !== id))
    setLogs(prev => prev.filter(l => l.habit_id !== id))
  }

  const resetToDefaults = async () => {
    await supabase.from('habits').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('habits').insert(
      DEFAULT_HABITS.map(h => ({ ...h, user_id: user!.id }))
    )
    const { data } = await supabase.from('habits').select('*').order('sort_order')
    setHabits(data || [])
  }

  const isCompletedToday = (habitId: string) => {
    const currentToday = getTodayStr()
    return logs.some(l => l.habit_id === habitId && l.logged_date === currentToday)
  }

  const getStreak = (habitId: string): number => {
    let streak = 0
    const d = new Date()
    while (true) {
      const dateStr = format(d, 'yyyy-MM-dd')
      if (logs.some(l => l.habit_id === habitId && l.logged_date === dateStr)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else break
    }
    return streak
  }

  const todayCompletedCount = habits.filter(h => isCompletedToday(h.id)).length

  return {
    habits, logs, loading, today,
    toggleHabit, addHabit, deleteHabit, resetToDefaults,
    isCompletedToday, getStreak,
    todayCompletedCount, totalHabits: habits.length
  }
}
