// Supabase Edge Function: track-order
// Dipanggil dari halaman "Lacak Pesanan" di website.
// Pakai service role supaya bisa baca data order meski RLS membatasi
// akses publik — tapi cuma dikasih balik kalau order_number + phone cocok,
// supaya orang lain tidak bisa asal tebak nomor pesanan orang lain.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderNumber, phone } = await req.json()

    if (!orderNumber || !phone) {
      return new Response(JSON.stringify({ error: 'Nomor pesanan dan no HP wajib diisi' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber.trim())
      .eq('customer_phone', phone.trim())
      .maybeSingle()

    if (error) throw error

    if (!order) {
      return new Response(JSON.stringify({ error: 'Pesanan tidak ditemukan. Cek kembali nomor pesanan dan no HP.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ order }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
