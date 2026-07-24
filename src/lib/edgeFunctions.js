import { supabase, isSupabaseConfigured } from './supabaseClient.js'

// Memanggil Supabase Edge Function lewat supabase-js client.
// Otomatis mengikutkan anon key yang benar, tidak perlu ditulis manual.
export async function callEdgeFunction(name, payload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: 'Supabase belum dikonfigurasi.' }
  }
  const { data, error } = await supabase.functions.invoke(name, { body: payload })
  if (error) {
    return { data: null, error: error.message || 'Terjadi kesalahan.' }
  }
  if (data?.error) {
    return { data: null, error: data.error }
  }
  return { data, error: null }
}
