import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Entry, EntryContent, EntryType } from '../types'
import { useAuth } from './useAuth'

export function useEntries() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchEntries()
  }, [user])

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setEntries(data)
    setLoading(false)
  }

  const createEntry = async (type: EntryType, content: EntryContent) => {
    const { data, error } = await supabase
      .from('entries')
      .insert([{ type, content, user_id: user?.id }])
      .select()
      .single()

    if (!error && data) {
      setEntries(prev => [data, ...prev])
      return { data, error: null }
    }
    return { data: null, error: error?.message ?? 'Unknown error' }
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (!error) setEntries(prev => prev.filter(e => e.id !== id))
    return { error: error?.message ?? null }
  }

  return { entries, loading, createEntry, deleteEntry, refetch: fetchEntries }
}
