export type EntryType = 'daily' | 'freewrite' | 'weekly' | 'morning'

export interface DailyContent {
  highlight: string
  challenge: string
  decision: string
  emotion: string
  tomorrow: string
}

export interface MorningContent {
  energy: number
  gratitude: string
  intention: string
  lookingForward: string
}

export interface FreewriteContent {
  text: string
  articles?: Article[]
}

export interface WeeklyContent {
  wins: string
  patterns: string
  difficult: string
  learned: string
  nextWeek: string
  rating: number
}

export interface Article {
  url: string
  title: string
  addedAt: string
}

export type EntryContent = DailyContent | MorningContent | FreewriteContent | WeeklyContent

export interface Entry {
  id: string
  user_id: string
  type: EntryType
  content: EntryContent
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  is_default: boolean
  sort_order: number
  created_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  logged_date: string
  created_at: string
}

export interface User {
  id: string
  email: string
}

export interface Profile {
  id: string
  display_name: string | null
  is_approved: boolean
  requested_at: string
  approved_at: string | null
  created_at: string
}

export interface SavedReflection {
  id: string
  user_id: string
  entry_id: string | null
  type: 'single' | 'multi'
  content: string
  created_at: string
}
