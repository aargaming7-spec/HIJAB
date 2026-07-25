// Supabase Edge Function: create-transaction
// Dipanggil dari halaman Checkout. Membuat order di database,
// lalu minta "Snap Token" ke Midtrans supaya frontend bisa buka
// popup pembayaran. Server Key Midtrans HANYA ada di sini, aman.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')
const MIDTRANS_IS_PRODUCTION = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

// Produk dari fallback lokal (sebelum admin import ke Supabase) punya id
// seperti "voal-clara", bukan UUID. Kolom product_id di database bertipe
// uuid, jadi kalau bukan format UUID, kirim null saja.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function safeProductId(id) {
  return UUID_REGEX.test(id || '') ? id : null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { customer, items, shippingCost = 0 } = body

    if (!customer?.name || !customer?.phone || !customer?.address || !items?.length) {
      return new Response(JSON.stringify({ error: 'Data tidak lengkap' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const total = subtotal + Number(shippingCost)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const orderNumber = `ALR-${Date.now()}`

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        shipping_address: customer.address,
        city: customer.city || null,
        postal_code: customer.postalCode || null,
        notes: customer.notes || null,
        subtotal,
        shipping_cost: shippingCost,
        total,
        payment_status: 'pending',
        order_status: 'processing',
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: safeProductId(i.id),
      product_name: i.name,
      product_image: i.image || null,
      color: i.color || null,
      size: i.size || null,
      price: i.price,
      quantity: i.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Minta Snap Token ke Midtrans
    const midtransRes = await fetch(MIDTRANS_SNAP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(MIDTRANS_SERVER_KEY + ':'),
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderNumber,
          gross_amount: total,
        },
        customer_details: {
          first_name: customer.name,
          phone: customer.phone,
          email: customer.email || undefined,
        },
        item_details: [
          ...items.map((i) => ({
            id: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name.slice(0, 50),
          })),
          ...(shippingCost > 0
            ? [{ id: 'shipping', price: shippingCost, quantity: 1, name: 'Ongkos Kirim' }]
            : []),
        ],
      }),
    })

    const midtransData = await midtransRes.json()

    if (!midtransRes.ok) {
      throw new Error(midtransData.error_messages?.join(', ') || 'Gagal membuat transaksi Midtrans')
    }

    await supabase.from('orders').update({ midtrans_order_id: orderNumber }).eq('id', order.id)

    return new Response(
      JSON.stringify({
        orderNumber,
        snapToken: midtransData.token,
        redirectUrl: midtransData.redirect_url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
