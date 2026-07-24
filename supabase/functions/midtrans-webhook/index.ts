// Supabase Edge Function: midtrans-webhook
// Ini URL yang didaftarkan di Midtrans Dashboard -> Settings -> Configuration
// -> Payment Notification URL. Midtrans akan "memanggil" URL ini otomatis
// setiap kali status pembayaran berubah (misal customer selesai bayar QRIS).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts'

const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

async function sha512Hex(text) {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const { order_id, status_code, gross_amount, signature_key, transaction_status, transaction_id } = body

    // Verifikasi keaslian notifikasi (supaya tidak bisa dipalsukan orang lain)
    const expectedSignature = await sha512Hex(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
    if (expectedSignature !== signature_key) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 403 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let paymentStatus = 'pending'
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      paymentStatus = 'paid'
    } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
      paymentStatus = 'failed'
    } else if (transaction_status === 'expire') {
      paymentStatus = 'expired'
    }

    const { data: order } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        midtrans_transaction_id: transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', order_id)
      .select('id')
      .single()

    // Kurangi stok otomatis saat pembayaran berhasil
    if (paymentStatus === 'paid' && order) {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', order.id)

      for (const item of items || []) {
        if (!item.product_id) continue
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()
        if (product) {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, product.stock - item.quantity) })
            .eq('id', item.product_id)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
