import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useProducts } from '../hooks/useProducts.js'
import ProductGrid from '../components/ProductGrid.jsx'

export default function Wishlist() {
  const { ids } = useWishlist()
  const { products } = useProducts()
  const items = products.filter((p) => ids.includes(p.id))

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <p className="eyebrow mb-3">Wishlist</p>
        <h1 className="section-title mb-5">Wishlist kamu masih kosong</h1>
        <Link to="/shop" className="btn-primary inline-flex">
          Jelajahi Produk
        </Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10 md:py-14">
      <p className="eyebrow mb-3">Wishlist</p>
      <h1 className="section-title mb-10">Favorit Kamu ({items.length})</h1>
      <ProductGrid products={items} />
    </div>
  )
}
