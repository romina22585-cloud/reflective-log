import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single()
    setProfile(data)
    setLoading(false)
  }

  const updateDisplayName = async (name: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() || null })
      .eq('id', user!.id)
      .select()
      .single()
    if (!error && data) setProfile(data)
    return { error: error?.message ?? null }
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there'
  const isApproved = profile?.is_approved ?? false

  return { profile, loading, displayName, isApproved, updateDisplayName, refetch: fetchProfile }
}
