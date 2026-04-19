import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Habit, HabitLog } from '../types'
import { useAuth } from './useAuth'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { HABIT_GROUPS } from '../lib/habitBenefits'

export const DEFAULT_HABITS = [
  { name: 'Drink Water (1.5+ lt)', emoji: '💧', is_default: true, sort_order: 0 },
  { name: 'Morning phone fasting (first 30+ min)', emoji: '📵', is_default: true, sort_order: 1 },
  { name: 'Physical connection (pet or person)', emoji: '🤗', is_default: true, sort_order: 2 },
  { name: 'Hug someone', emoji: '🫂', is_default: true, sort_order: 3 },
  { name: 'Phone a friend / family', emoji: '📞', is_default: true, sort_order: 4 },
  { name: 'Sunlight (10+ min)', emoji: '☀️', is_default: true, sort_order: 5 },
  { name: 'Eat Fruit & veg (8+ types)', emoji: '🥦', is_default: true, sort_order: 6 },
  { name: 'Sleep (7-9 hs)', emoji: '🌙', is_default: true, sort_order: 7 },
  { name: 'Walk (10k+ steps)', emoji: '👟', is_default: true, sort_order: 8 },
  { name: 'No Ultra-processed food', emoji: '🚫', is_default: true, sort_order: 9 },
  { name: 'Meditation (10+ min)', emoji: '🧘', is_default: true, sort_order: 10 },
  { name: 'Stretch (20+ min)', emoji: '🤸', is_default: true, sort_order: 11 },
  { name: 'FIIT class (25-40 min)', emoji: '🏋️', is_default: true, sort_order: 12 },
  { name: 'Cold shower (1+ min)', emoji: '🚿', is_default: true, sort_order: 13 },
  { name: 'Journaling / Reflection', emoji: '📓', is_default: true, sort_order: 14 },
  { name: 'No sugar', emoji: '🍬', is_default: true, sort_order: 15 },
  { name: 'No alcohol', emoji: '🍷', is_default: true, sort_order: 16 },
  { name: 'No smoking', emoji: '🚭', is_default: true, sort_order: 17 },
  { name: 'Meet a friend / family', emoji: '👥', is_default: true, sort_order: 18 },
  { name: 'Walk in nature (30+ min)', emoji: '🌿', is_default: true, sort_order: 19 },
  { name: 'Heat - Hot bath/Sauna', emoji: '🛁', is_default: true, sort_order: 20 },
  { name: 'Act of kindness', emoji: '💛', is_default: true, sort_order: 21 },
]

const NEW_HABIT_NAMES = DEFAULT_HABITS.map(h => h.name)

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

  useEffect(() => {
    dateCheckRef.current = setInterval(() => {
      const newDay = getTodayStr()
      if (newDay !== today) { setToday(newDay); fetchLogs() }
    }, 60_000)
    return () => { if (dateCheckRef.current) clearInterval(dateCheckRef.current) }
  }, [today])

  useEffect(() => { if (user) init() }, [user])

  const fetchLogs = async () => {
    const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    const { data } = await supabase.from('habit_logs').select('*').gte('logged_date', thirtyDaysAgo)
    setLogs(data || [])
  }

  const seedDefaults = async () => {
    await supabase.from('habits').delete().eq('user_id', user!.id)
    const { data } = await supabase.from('habits').insert(
      DEFAULT_HABITS.map(h => ({ ...h, user_id: user!.id }))
    ).select()
    setHabits(data || [])
  }

  const init = async () => {
    setLoading(true)
    const { data: existing } = await supabase
      .from('habits').select('*').eq('user_id', user!.id).order('sort_order')
    if (!existing || existing.length === 0) {
      await seedDefaults()
    } else {
      const hasNewHabits = existing.some((h: Habit) => NEW_HABIT_NAMES.includes(h.name))
      if (!hasNewHabits) { await seedDefaults() } else { setHabits(existing) }
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
        habit_id: habitId, user_id: user!.id, logged_date: currentToday,
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

  const resetToDefaults = async () => { await seedDefaults() }

  const isCompletedToday = (habitId: string) =>
    logs.some(l => l.habit_id === habitId && l.logged_date === getTodayStr())

  const isCompletedOnDate = (habitId: string, dateStr: string) =>
    logs.some(l => l.habit_id === habitId && l.logged_date === dateStr)

  const getStreak = (habitId: string): number => {
    let streak = 0
    const d = new Date()
    while (true) {
      const dateStr = format(d, 'yyyy-MM-dd')
      if (logs.some(l => l.habit_id === habitId && l.logged_date === dateStr)) {
        streak++; d.setDate(d.getDate() - 1)
      } else break
    }
    return streak
  }

  const getWeeklyScores = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
    const weekDays: string[] = []
    const d = new Date(weekStart)
    while (d <= weekEnd) {
      weekDays.push(format(d, 'yyyy-MM-dd'))
      d.setDate(d.getDate() + 1)
    }

    let group1Score = 0, group2Score = 0, group3Score = 0

    for (const habit of habits) {
      const group = HABIT_GROUPS[habit.name]?.group || 'daily'
      const completedDays = weekDays.filter(day =>
        logs.some(l => l.habit_id === habit.id && l.logged_date === day)
      ).length

      if (group === 'daily') group1Score += completedDays
      else if (group === 'weekly4') group2Score += completedDays
      else if (group === 'weekly1') group3Score += completedDays > 0 ? 1 : 0
    }

    return { group1Score, group2Score, group3Score }
  }

  const todayCompletedCount = habits.filter(h => isCompletedToday(h.id)).length

  return {
    habits, logs, loading, today,
    toggleHabit, addHabit, deleteHabit, resetToDefaults,
    isCompletedToday, isCompletedOnDate, getStreak, getWeeklyScores,
    todayCompletedCount, totalHabits: habits.length
  }
}
