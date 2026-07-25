import { useState } from 'react'
import { Trash2, Pencil, Plus, LogOut, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { formatIDR } from '../utils/format.js'
import AdminOrders from '../components/AdminOrders.jsx'
import AdminContent from '../components/AdminContent.jsx'
import VariantStockEditor from '../components/VariantStockEditor.jsx'
import localProducts from '../data/products.js'

const emptyForm = {
  id: null,
  name: '',
  category: 'Hijab',
  collection: '',
  price: '',
  discount_price: '',
  images: '',
  colors: '',
  sizes: '',
  material: '',
  description: '',
  stock: '',
  variants: [], // [{ color, size, stock }]
  rating: '',
  is_best_seller: false,
  is_new_arrival: false,
}

export default function AdminDashboard() {
  const { logout } = useAuth()
  const [tab, setTab] = useState('products')
  const { products, loading, source, refresh } = useProducts()
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  async function handleImportLocalProducts() {
    setImporting(true)
    setImportError('')

    // id lokal (misal "voal-clara") bukan format UUID, jadi tidak dikirim —
    // biar Supabase yang generate UUID baru untuk tiap produk.
    const payload = localProducts.map(({ id, discountPrice, isBestSeller, isNewArrival, ...rest }) => ({
      ...rest,
      discount_price: discountPrice,
      is_best_seller: isBestSeller,
      is_new_arrival: isNewArrival,
      variants: [],
    }))

    const { error } = await supabase.from('products').insert(payload)
    setImporting(false)

    if (error) {
      setImportError(error.message)
      return
    }
    refresh()
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setUploadError('')

    const uploadedUrls = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file)
      if (error) {
        setUploadError(error.message)
        continue
      }
      const { data } = supabase.storage.from('products').getPublicUrl(path)
      uploadedUrls.push(data.publicUrl)
    }

    setUploading(false)
    if (uploadedUrls.length) {
      setForm((prev) => {
        const existing = prev.images.split(',').map((s) => s.trim()).filter(Boolean)
        return { ...prev, images: [...existing, ...uploadedUrls].join(', ') }
      })
    }
    e.target.value = ''
  }

  function openCreate() {
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(p) {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      collection: p.collection || '',
      price: p.price,
      discount_price: p.discountPrice ?? '',
      images: (p.images || []).join(', '),
      colors: (p.colors || []).join(', '),
      sizes: (p.sizes || []).join(', '),
      material: p.material || '',
      description: p.description || '',
      stock: p.stock,
      variants: p.variants || [],
      rating: p.rating,
      is_best_seller: p.isBestSeller,
      is_new_arrival: p.isNewArrival,
    })
    setFormOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')

    if (!isSupabaseConfigured) {
      setError('Supabase belum dikonfigurasi.')
      return
    }

    setSaving(true)
    const colorList = form.colors.split(',').map((s) => s.trim()).filter(Boolean)
    const sizeList = form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : []
    const usesVariants = colorList.length > 0
    const totalVariantStock = form.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)

    const payload = {
      name: form.name,
      category: form.category,
      collection: form.collection || null,
      price: Number(form.price) || 0,
      discount_price: form.discount_price === '' ? null : Number(form.discount_price),
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      colors: colorList,
      sizes: sizeList,
      material: form.material,
      description: form.description,
      stock: usesVariants ? totalVariantStock : Number(form.stock) || 0,
      variants: usesVariants
        ? form.variants.map((v) => ({ color: v.color, size: v.size, stock: Number(v.stock) || 0 }))
        : [],
      rating: Number(form.rating) || 0,
      is_best_seller: form.is_best_seller,
      is_new_arrival: form.is_new_arrival,
    }

    const query = form.id
      ? supabase.from('products').update(payload).eq('id', form.id)
      : supabase.from('products').insert(payload)

    const { error } = await query
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setFormOpen(false)
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Hapus produk ini?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    refresh()
  }

  return (
    <div className="container-page py-10 md:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="font-display text-2xl md:text-3xl">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {tab === 'products' && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Tambah Produk
            </button>
          )}
          <button onClick={logout} className="btn-outline flex items-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-2 border-b border-line">
        <button
          onClick={() => setTab('products')}
          className={`border-b-2 px-1 pb-3 text-sm ${tab === 'products' ? 'border-ink text-ink' : 'border-transparent text-ink/50'}`}
        >
          Katalog
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`border-b-2 px-1 pb-3 text-sm ${tab === 'orders' ? 'border-ink text-ink' : 'border-transparent text-ink/50'}`}
        >
          Pesanan
        </button>
        <button
          onClick={() => setTab('content')}
          className={`border-b-2 px-1 pb-3 text-sm ${tab === 'content' ? 'border-ink text-ink' : 'border-transparent text-ink/50'}`}
        >
          Konten
        </button>
      </div>

      {tab === 'orders' ? (
        <AdminOrders />
      ) : tab === 'content' ? (
        <AdminContent />
      ) : (
        <>

      {!isSupabaseConfigured && (
        <p className="mb-6 border border-line bg-mist p-3 text-xs text-ink/60">
          Supabase belum dikonfigurasi — perubahan tidak akan tersimpan. Isi VITE_SUPABASE_URL dan
          VITE_SUPABASE_ANON_KEY di file .env.
        </p>
      )}

      {source === 'local' && isSupabaseConfigured && (
        <div className="mb-6 border border-line bg-mist p-3 text-xs text-ink/60">
          <p className="mb-2">
            Tabel "products" di Supabase masih kosong, jadi website menampilkan data contoh lokal.
            Data ini <span className="font-medium text-ink">belum bisa diedit atau dibeli</span>{' '}
            karena belum tersimpan di database sungguhan.
          </p>
          <button onClick={handleImportLocalProducts} disabled={importing} className="btn-outline text-xs disabled:opacity-50">
            {importing ? 'Mengimpor...' : 'Import 16 Produk Contoh ke Supabase'}
          </button>
          {importError && <p className="mt-2 text-red-600">{importError}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink/50">Memuat produk...</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-mist text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt={p.name} className="h-12 w-10 object-cover" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{p.category}</td>
                  <td className="px-4 py-3">
                    {formatIDR(p.discountPrice ?? p.price)}
                    {p.discountPrice && (
                      <span className="ml-2 text-xs text-ink/40 line-through">{formatIDR(p.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/60">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.isBestSeller && <span className="bg-mauve-100 px-2 py-0.5 text-[10px] text-mauve-700">Best Seller</span>}
                      {p.isNewArrival && <span className="bg-gold/15 px-2 py-0.5 text-[10px] text-gold">New</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} aria-label="Edit" className="grid h-8 w-8 place-items-center hover:text-mauve-600">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} aria-label="Hapus" className="grid h-8 w-8 place-items-center hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-ink/40" onClick={() => setFormOpen(false)} aria-label="Tutup" />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-paper p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg">{form.id ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setFormOpen(false)} aria-label="Tutup">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <input required placeholder="Nama produk" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Hijab</option>
                  <option>Accessories</option>
                </select>
                <input placeholder="Collection (Voal, Pashmina, ...)" className="input-field" value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Harga" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <input type="number" placeholder="Harga diskon (opsional)" className="input-field" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} />
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-ink/50">Foto Produk</label>
                <div className="flex flex-wrap gap-2">
                  {form.images
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((url, i) => (
                      <div key={i} className="relative h-16 w-14">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const list = form.images.split(',').map((s) => s.trim()).filter(Boolean)
                            list.splice(i, 1)
                            setForm({ ...form, images: list.join(', ') })
                          }}
                          className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-paper"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                </div>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 border border-line px-3 py-2 text-xs text-ink/70 hover:border-mauve-400">
                  {uploading ? 'Mengunggah...' : 'Upload Foto'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={handleFileUpload}
                  />
                </label>
                {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
                <p className="mt-2 text-[11px] text-ink/40">
                  Atau tempel URL foto manual (pisahkan dengan koma) di bawah ini:
                </p>
                <input placeholder="URL foto, pisahkan dengan koma" className="input-field mt-1" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              </div>
              <input placeholder="Warna, pisahkan dengan koma" className="input-field" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
              <input placeholder="Ukuran, pisahkan dengan koma (opsional)" className="input-field" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />

              {form.colors.split(',').map((s) => s.trim()).filter(Boolean).length > 0 && (
                <VariantStockEditor
                  colors={form.colors.split(',').map((s) => s.trim()).filter(Boolean)}
                  sizes={form.sizes.split(',').map((s) => s.trim()).filter(Boolean)}
                  variants={form.variants}
                  onChange={(variants) => setForm((prev) => ({ ...prev, variants }))}
                />
              )}

              <input placeholder="Material" className="input-field" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
              <textarea placeholder="Deskripsi" rows={3} className="input-field resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                {form.colors.split(',').map((s) => s.trim()).filter(Boolean).length === 0 && (
                  <input required type="number" placeholder="Stok" className="input-field" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                )}
                <input type="number" step="0.1" placeholder="Rating (0-5)" className="input-field" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>

              <div className="flex gap-6 pt-1 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_best_seller} onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })} />
                  Best Seller
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_new_arrival} onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })} />
                  New Arrival
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
