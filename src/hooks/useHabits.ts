import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Habit, HabitLog } from '../types'
import { useAuth } from './useAuth'
import { format } from 'date-fns'

const DEFAULT_HABITS = [
  { name: 'Exercise / movement', emoji: '🏃', is_default: true, sort_order: 0 },
  { name: 'Sleep quality', emoji: '🌙', is_default: true, sort_order: 1 },
  { name: 'No alcohol', emoji: '💧', is_default: true, sort_order: 2 },
  { name: 'Meditation', emoji: '🧘', is_default: true, sort_order: 3 },
]

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (user) init()
  }, [user])

  const init = async () => {
    setLoading(true)
    // Check if user has habits, if not seed defaults
    const { data: existing } = await supabase.from('habits').select('*').order('sort_order')
    if (existing && existing.length === 0) {
      await supabase.from('habits').insert(
        DEFAULT_HABITS.map(h => ({ ...h, user_id: user!.id }))
      )
      const { data: seeded } = await supabase.from('habits').select('*').order('sort_order')
      setHabits(seeded || [])
    } else {
      setHabits(existing || [])
    }
    // Fetch logs for last 30 days
    const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    const { data: logData } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('logged_date', thirtyDaysAgo)
    setLogs(logData || [])
    setLoading(false)
  }

  const toggleHabit = async (habitId: string) => {
    const existing = logs.find(l => l.habit_id === habitId && l.logged_date === today)
    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id)
      setLogs(prev => prev.filter(l => l.id !== existing.id))
    } else {
      const { data } = await supabase.from('habit_logs').insert([{
        habit_id: habitId,
        user_id: user!.id,
        logged_date: today,
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

  const isCompletedToday = (habitId: string) =>
    logs.some(l => l.habit_id === habitId && l.logged_date === today)

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

  return { habits, logs, loading, toggleHabit, addHabit, deleteHabit, isCompletedToday, getStreak, todayCompletedCount, totalHabits: habits.length }
}
