import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

// Default berisi konten yang sama seperti versi hardcode sebelumnya, jadi
// selama admin belum mengisi apa pun di tab "Konten", tampilan website
// tidak berubah sama sekali.
export const defaultSettings = {
  hero: {
    eyebrow: 'Koleksi Pertengahan Tahun',
    title: 'Voal yang jatuh dengan sendirinya.',
    subtitle:
      'Kami membuat pilihan bahan lebih sedikit, tapi lebih tepat — supaya hijab yang kamu pakai hari ini masih terasa sama nyamannya tahun depan.',
    image: 'https://picsum.photos/seed/hero-main/900/1100',
    badge: 'Edisi 07 — 2026',
  },
  promo: {
    eyebrow: 'Edisi Terbatas',
    title: 'Pashmina silk feel, hanya tersisa untuk musim ini.',
    image: 'https://picsum.photos/seed/promo-campaign/900/700',
    ctaLabel: 'Belanja Koleksi',
    ctaLink: '/shop?collection=Pashmina',
  },
  about: {
    title: 'Dibuat untuk dipakai, bukan sekadar dipajang',
    body: 'Alara dimulai dari kebutuhan sederhana: hijab dengan bahan yang benar-benar nyaman dipakai seharian, tanpa mengorbankan tampilan. Kami memilih material secara langsung, menguji jatuh kain dan warna sebelum masuk ke koleksi, dan menjaga setiap produksi dalam jumlah terbatas agar kualitas tetap terjaga.',
  },
  contact: {
    email: 'hello@alara.co.id',
    whatsapp: '+62 812 3456 7890',
    address: 'Bandung, Jawa Barat, Indonesia',
  },
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase.from('site_settings').select('data').eq('id', 'main').maybeSingle()
    if (data?.data && Object.keys(data.data).length > 0) {
      setSettings({
        hero: { ...defaultSettings.hero, ...data.data.hero },
        promo: { ...defaultSettings.promo, ...data.data.promo },
        about: { ...defaultSettings.about, ...data.data.about },
        contact: { ...defaultSettings.contact, ...data.data.contact },
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { settings, loading, refresh }
}
