import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import localProducts from '../data/products.js'

// Supabase rows use snake_case; the rest of the app (ProductCard, Shop, etc.)
// expects the same camelCase shape as src/data/products.js.
function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    collection: row.collection,
    price: Number(row.price) || 0,
    discountPrice: row.discount_price != null ? Number(row.discount_price) : null,
    images: row.images?.length ? row.images : ['https://picsum.photos/seed/placeholder/800/1000'],
    colors: row.colors || [],
    sizes: row.sizes?.length ? row.sizes : null,
    material: row.material || '',
    description: row.description || '',
    stock: row.stock ?? 0,
    variants: Array.isArray(row.variants) ? row.variants : [],
    rating: row.rating ?? 0,
    isBestSeller: row.is_best_seller || false,
    isNewArrival: row.is_new_arrival || false,
  }
}

export function useProducts() {
  const [products, setProducts] = useState(localProducts)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [source, setSource] = useState(isSupabaseConfigured ? 'loading' : 'local')

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts(localProducts)
      setSource('local')
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      // Belum ada tabel/data di Supabase yet -> tampilkan data lokal sebagai fallback
      setProducts(localProducts)
      setSource('local')
    } else {
      setProducts(data.map(mapRow))
      setSource('supabase')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { products, loading, source, refresh }
}
