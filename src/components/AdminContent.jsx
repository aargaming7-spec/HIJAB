import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useSiteSettings, defaultSettings } from '../hooks/useSiteSettings.js'

export default function AdminContent() {
  const { settings, loading, refresh } = useSiteSettings()
  const [form, setForm] = useState(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading) setForm(settings)
  }, [loading, settings])

  function update(section, key, value) {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const { error } = await supabase.from('site_settings').upsert({ id: 'main', data: form, updated_at: new Date().toISOString() })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setSaved(true)
    refresh()
  }

  if (loading) return <p className="text-sm text-ink/50">Memuat...</p>

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <h2 className="mb-4 font-display text-lg">Hero (Halaman Utama)</h2>
        <div className="space-y-3">
          <input className="input-field" placeholder="Label kecil (eyebrow)" value={form.hero.eyebrow} onChange={(e) => update('hero', 'eyebrow', e.target.value)} />
          <input className="input-field" placeholder="Judul besar" value={form.hero.title} onChange={(e) => update('hero', 'title', e.target.value)} />
          <textarea rows={2} className="input-field resize-none" placeholder="Subjudul" value={form.hero.subtitle} onChange={(e) => update('hero', 'subtitle', e.target.value)} />
          <input className="input-field" placeholder="URL foto hero" value={form.hero.image} onChange={(e) => update('hero', 'image', e.target.value)} />
          <input className="input-field" placeholder="Label edisi (pojok foto)" value={form.hero.badge} onChange={(e) => update('hero', 'badge', e.target.value)} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg">Promotional Banner</h2>
        <div className="space-y-3">
          <input className="input-field" placeholder="Label kecil (eyebrow)" value={form.promo.eyebrow} onChange={(e) => update('promo', 'eyebrow', e.target.value)} />
          <input className="input-field" placeholder="Judul banner" value={form.promo.title} onChange={(e) => update('promo', 'title', e.target.value)} />
          <input className="input-field" placeholder="URL foto banner" value={form.promo.image} onChange={(e) => update('promo', 'image', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Teks tombol" value={form.promo.ctaLabel} onChange={(e) => update('promo', 'ctaLabel', e.target.value)} />
            <input className="input-field" placeholder="Link tombol (misal /shop)" value={form.promo.ctaLink} onChange={(e) => update('promo', 'ctaLink', e.target.value)} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg">Halaman About</h2>
        <div className="space-y-3">
          <input className="input-field" placeholder="Judul" value={form.about.title} onChange={(e) => update('about', 'title', e.target.value)} />
          <textarea rows={4} className="input-field resize-none" placeholder="Isi paragraf" value={form.about.body} onChange={(e) => update('about', 'body', e.target.value)} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg">Halaman Contact</h2>
        <div className="space-y-3">
          <input className="input-field" placeholder="Email" value={form.contact.email} onChange={(e) => update('contact', 'email', e.target.value)} />
          <input className="input-field" placeholder="No. WhatsApp" value={form.contact.whatsapp} onChange={(e) => update('contact', 'whatsapp', e.target.value)} />
          <input className="input-field" placeholder="Alamat" value={form.contact.address} onChange={(e) => update('contact', 'address', e.target.value)} />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-mauve-600">Perubahan tersimpan.</p>}

      <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  )
}
