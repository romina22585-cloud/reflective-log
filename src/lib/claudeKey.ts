import { supabase } from './supabase'

let cachedKey: string | null = null

export async function getClaudeApiKey(): Promise<string | null> {
  // First try environment variable (for local dev)
  const envKey = import.meta.env.VITE_CLAUDE_API_KEY
  if (envKey) return envKey

  // Then try cached value
  if (cachedKey) return cachedKey

  // Finally fetch from Supabase
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'claude_api_key')
      .single()

    if (!error && data?.value) {
      cachedKey = data.value
      return cachedKey
    }
  } catch {
    // ignore
  }

  return null
}
