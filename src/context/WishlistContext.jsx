import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [ids, setIds] = useLocalStorage('alara.wishlist', [])

  function toggleWishlist(productId) {
    setIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  function isWishlisted(productId) {
    return ids.includes(productId)
  }

  return (
    <WishlistContext.Provider value={{ ids, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
