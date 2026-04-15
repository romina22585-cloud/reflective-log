import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { SavedReflection } from '../types'
import { useAuth } from './useAuth'

export function useSavedReflections(entryId?: string) {
  const { user } = useAuth()
  const [reflections, setReflections] = useState<SavedReflection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetch()
  }, [user, entryId])

  const fetch = async () => {
    setLoading(true)
    let query = supabase
      .from('saved_reflections')
      .select('*')
      .order('created_at', { ascending: false })

    if (entryId) {
      query = query.eq('entry_id', entryId)
    }

    const { data } = await query
    setReflections(data || [])
    setLoading(false)
  }

  const saveReflection = async (
    content: string,
    type: 'single' | 'multi',
    entry_id?: string
  ) => {
    const { data, error } = await supabase
      .from('saved_reflections')
      .insert([{ content, type, entry_id: entry_id ?? null, user_id: user!.id }])
      .select()
      .single()

    if (!error && data) setReflections(prev => [data, ...prev])
    return { error: error?.message ?? null }
  }

  const deleteReflection = async (id: string) => {
    await supabase.from('saved_reflections').delete().eq('id', id)
    setReflections(prev => prev.filter(r => r.id !== id))
  }

  return { reflections, loading, saveReflection, deleteReflection }
}
