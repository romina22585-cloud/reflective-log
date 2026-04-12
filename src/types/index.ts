export type EntryType = 'daily' | 'freewrite' | 'weekly'

export interface DailyContent {
  highlight: string
  challenge: string
  decision: string
  emotion: string
  tomorrow: string
}

export interface FreewriteContent {
  text: string
}

export interface WeeklyContent {
  wins: string
  patterns: string
  difficult: string
  learned: string
  nextWeek: string
  rating: number
}

export type EntryContent = DailyContent | FreewriteContent | WeeklyContent

export interface Entry {
  id: string
  user_id: string
  type: EntryType
  content: EntryContent
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
}
