import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { formatIDR } from '../utils/format'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const wishlisted = isWishlisted(product.id)
  const hasDiscount = Boolean(product.discountPrice)

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-mist aspect-[4/5]">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-opacity duration-350 ease-out group-hover:opacity-0"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover scale-105 opacity-0 transition-all duration-350 ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}

          {(product.isBestSeller || hasDiscount) && (
            <span className="absolute left-3 top-3 bg-paper/95 px-2.5 py-1 text-[10px] tracking-widest2 uppercase text-ink">
              {hasDiscount ? 'Sale' : 'Best Seller'}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggleWishlist(product.id)
            }}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center bg-paper/90 transition-colors duration-250 hover:bg-paper"
          >
            <Heart size={15} className={wishlisted ? 'fill-mauve-500 text-mauve-500' : 'text-ink'} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              addToCart(product)
            }}
            className="absolute inset-x-3 bottom-3 translate-y-3 bg-ink py-2.5 text-xs tracking-wide text-paper opacity-0 transition-all duration-250 ease-out group-hover:translate-y-0 group-hover:opacity-100"
          >
            Add to Cart
          </button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-[15px] text-ink">{product.name}</p>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm text-mauve-600">{formatIDR(product.discountPrice)}</span>
                <span className="text-xs text-ink/40 line-through">{formatIDR(product.price)}</span>
              </>
            ) : (
              <span className="text-sm text-ink/80">{formatIDR(product.price)}</span>
            )}
          </div>
          <StarRating value={product.rating} />
        </div>
      </Link>
    </div>
  )
}
