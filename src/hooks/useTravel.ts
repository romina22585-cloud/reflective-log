import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Trip, TravelEntry, TripSummary } from '../types'
import { useAuth } from './useAuth'

export function useTravel() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [entries, setEntries] = useState<TravelEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) init() }, [user])

  const init = async () => {
    setLoading(true)
    const { data: tripData } = await supabase
      .from('trips').select('*').order('start_date', { ascending: false })
    setTrips(tripData || [])

    const { data: entryData } = await supabase
      .from('travel_entries').select('*').order('entry_date', { ascending: false })
    setEntries(entryData || [])
    setLoading(false)
  }

  const startTrip = async (destination: string, country: string, startDate: string, endDate?: string) => {
    const isPast = !!endDate
    const { data, error } = await supabase.from('trips').insert([{
      destination, country,
      start_date: startDate,
      end_date: endDate ?? null,
      is_active: !isPast,
      user_id: user!.id
    }]).select().single()
    if (!error && data) setTrips(prev => [data, ...prev])
    return { data, error: error?.message ?? null }
  }

  const closeTrip = async (tripId: string, summary: TripSummary, endDate: string) => {
    const { data, error } = await supabase.from('trips')
      .update({ is_active: false, end_date: endDate, summary })
      .eq('id', tripId).select().single()
    if (!error && data) setTrips(prev => prev.map(t => t.id === tripId ? data : t))
    return { error: error?.message ?? null }
  }

  const addDailyEntry = async (tripId: string, entry: Omit<TravelEntry, 'id' | 'user_id' | 'trip_id' | 'created_at'>) => {
    const { data, error } = await supabase.from('travel_entries').insert([{
      ...entry, trip_id: tripId, user_id: user!.id
    }]).select().single()
    if (!error && data) setEntries(prev => [data, ...prev])
    return { error: error?.message ?? null }
  }

  const deleteTrip = async (tripId: string) => {
    await supabase.from('trips').delete().eq('id', tripId)
    setTrips(prev => prev.filter(t => t.id !== tripId))
    setEntries(prev => prev.filter(e => e.trip_id !== tripId))
  }

  const activeTrip = trips.find(t => t.is_active) ?? null
  const entriesForTrip = (tripId: string) => entries.filter(e => e.trip_id === tripId)

  return { trips, entries, loading, activeTrip, startTrip, closeTrip, addDailyEntry, deleteTrip, entriesForTrip }
}
