import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Minus, Plus, Truck, RotateCcw } from 'lucide-react'
import { useProducts } from '../hooks/useProducts.js'
import { formatIDR } from '../utils/format.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { getVariantStock, getTotalStock } from '../utils/variants.js'
import StarRating from '../components/StarRating.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

const tabs = [
  { key: 'details', label: 'Detail Produk' },
  { key: 'care', label: 'Cara Perawatan' },
  { key: 'shipping', label: 'Pengiriman' },
  { key: 'reviews', label: 'Review' },
]

const dummyReviews = [
  { name: 'Salsabila R.', rating: 5, text: 'Bahannya adem dan jatuhnya bagus, sesuai foto.' },
  { name: 'Putri A.', rating: 4, text: 'Warnanya sedikit lebih gelap dari foto tapi tetap suka.' },
  { name: 'Nadia F.', rating: 5, text: 'Repeat order, kualitas konsisten dari awal beli.' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, loading } = useProducts()
  const product = products.find((p) => p.id === id)

  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState('details')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Produk baru kebaca setelah data dari Supabase selesai loading (async),
  // jadi pilihan warna/ukuran default di-set di sini, bukan di useState awal.
  useEffect(() => {
    if (product) {
      setColor(product.colors?.[0] ?? null)
      setSize(product.sizes?.[0] ?? null)
      setQuantity(1)
    }
  }, [product?.id])

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink/60">{loading ? 'Memuat produk...' : 'Produk tidak ditemukan.'}</p>
        {!loading && (
          <Link to="/shop" className="btn-outline mt-6 inline-flex">
            Kembali ke Shop
          </Link>
        )}
      </div>
    )
  }

  const hasDiscount = Boolean(product.discountPrice)
  const wishlisted = isWishlisted(product.id)
  const totalStock = getTotalStock(product)
  const variantStock = getVariantStock(product, color, size)
  const hasVariants = product.variants && product.variants.length > 0

  function isColorAvailable(c) {
    if (!hasVariants) return true
    if (!product.sizes || product.sizes.length === 0) {
      return getVariantStock(product, c, null) > 0
    }
    return product.sizes.some((s) => getVariantStock(product, c, s) > 0)
  }

  function isSizeAvailable(s) {
    if (!hasVariants) return true
    return getVariantStock(product, color, s) > 0
  }

  const related = products
    .filter((p) => p.id !== product.id && p.collection === product.collection)
    .slice(0, 4)

  function handleAddToCart() {
    addToCart(product, { color, size, quantity })
  }

  function handleBuyNow() {
    addToCart(product, { color, size, quantity })
    navigate('/cart')
  }

  return (
    <div className="container-page py-10 md:py-14">
      <nav className="mb-8 text-xs text-ink/50">
        <Link to="/" className="hover:text-mauve-600 transition-colors duration-250">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-mauve-600 transition-colors duration-250">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-mist">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-16 overflow-hidden bg-mist transition-opacity duration-250 ${
                    activeImage === i ? 'opacity-100 ring-1 ring-ink' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow mb-2">{product.collection}</p>
          <h1 className="font-display text-2xl md:text-3xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StarRating value={product.rating} />
            <span className="text-xs text-ink/40">·</span>
            <span className="text-xs text-ink/50">{totalStock > 0 ? 'Tersedia' : 'Stok habis'}</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="text-xl text-mauve-600">{formatIDR(product.discountPrice)}</span>
                <span className="text-sm text-ink/40 line-through">{formatIDR(product.price)}</span>
              </>
            ) : (
              <span className="text-xl">{formatIDR(product.price)}</span>
            )}
          </div>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/65">{product.description}</p>

          {product.colors && (
            <div className="mt-7">
              <p className="mb-2.5 text-xs uppercase tracking-wide text-ink/50">
                Warna {color && <span className="text-ink">— {color}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const available = isColorAvailable(c)
                  return (
                    <button
                      key={c}
                      onClick={() => available && setColor(c)}
                      disabled={!available}
                      className={`border px-3 py-1.5 text-xs transition-colors duration-250 ${
                        color === c
                          ? 'border-ink bg-ink text-paper'
                          : available
                          ? 'border-line text-ink/70 hover:border-ink'
                          : 'border-line text-ink/30 line-through cursor-not-allowed'
                      }`}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {product.sizes && (
            <div className="mt-6">
              <p className="mb-2.5 text-xs uppercase tracking-wide text-ink/50">Ukuran</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const available = isSizeAvailable(s)
                  return (
                    <button
                      key={s}
                      onClick={() => available && setSize(s)}
                      disabled={!available}
                      className={`h-9 min-w-[2.25rem] border px-3 text-xs transition-colors duration-250 ${
                        size === s
                          ? 'border-ink bg-ink text-paper'
                          : available
                          ? 'border-line text-ink/70 hover:border-ink'
                          : 'border-line text-ink/30 line-through cursor-not-allowed'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-2 text-xs text-ink/50">
            {hasVariants
              ? variantStock > 0
                ? `Stok tersedia: ${variantStock}`
                : 'Kombinasi warna/ukuran ini sedang habis'
              : null}
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center border border-line">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center hover:bg-mist"
                aria-label="Kurangi jumlah"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(hasVariants ? variantStock : totalStock, q + 1))}
                className="grid h-11 w-11 place-items-center hover:bg-mist"
                aria-label="Tambah jumlah"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wishlisted}
              aria-label="Tambah ke wishlist"
              className="grid h-11 w-11 place-items-center border border-line hover:border-ink transition-colors duration-250"
            >
              <Heart size={17} className={wishlisted ? 'fill-mauve-500 text-mauve-500' : ''} />
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAddToCart} disabled={hasVariants ? variantStock === 0 : totalStock === 0} className="btn-outline flex-1 disabled:opacity-40">
              Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={hasVariants ? variantStock === 0 : totalStock === 0} className="btn-primary flex-1 disabled:opacity-40">
              Buy Now
            </button>
          </div>

          <div className="mt-8 space-y-3 border-t border-line pt-6 text-xs text-ink/55">
            <div className="flex items-center gap-2">
              <Truck size={15} /> Pengiriman 1–3 hari kerja dari Bandung
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={15} /> Bisa dikembalikan dalam 7 hari jika ada cacat produksi
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16 border-t border-line pt-10">
        <div className="flex gap-6 border-b border-line text-sm">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 pb-3 transition-colors duration-250 ${
                tab === t.key ? 'border-ink text-ink' : 'border-transparent text-ink/50 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-w-2xl py-8 text-sm leading-relaxed text-ink/70">
          {tab === 'details' && (
            <ul className="space-y-2">
              <li>Material: {product.material}</li>
              <li>Kategori: {product.category} · {product.collection}</li>
              {product.sizes && <li>Ukuran tersedia: {product.sizes.join(', ')}</li>}
            </ul>
          )}
          {tab === 'care' && (
            <ul className="list-disc space-y-2 pl-4">
              <li>Cuci dengan tangan menggunakan air dingin</li>
              <li>Hindari merendam terlalu lama</li>
              <li>Jangan gunakan pemutih</li>
              <li>Setrika suhu rendah dari bagian dalam</li>
            </ul>
          )}
          {tab === 'shipping' && (
            <ul className="space-y-2">
              <li>Dikirim dari Bandung, Jawa Barat dalam 1x24 jam kerja setelah pembayaran dikonfirmasi.</li>
              <li>Estimasi tiba 1–3 hari untuk area Jabodetabek, 2–6 hari untuk luar Jawa.</li>
            </ul>
          )}
          {tab === 'reviews' && (
            <div className="space-y-6">
              {dummyReviews.map((r) => (
                <div key={r.name} className="border-b border-line pb-5">
                  <div className="flex items-center justify-between">
                    <p className="text-ink">{r.name}</p>
                    <StarRating value={r.rating} />
                  </div>
                  <p className="mt-2 text-ink/60">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-line pt-14">
          <p className="eyebrow mb-3">Kamu Mungkin Suka</p>
          <h2 className="section-title mb-8">Related Products</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  )
}
