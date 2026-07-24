import { createContext, useContext, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const CartContext = createContext(null)

function lineKey(productId, color, size) {
  return [productId, color || '-', size || '-'].join('::')
}

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage('alara.cart', [])
  const [isCartOpen, setCartOpen] = useState(false)

  function addToCart(product, { color, size, quantity = 1 } = {}) {
    const key = lineKey(product.id, color, size)
    setItems((prev) => {
      const existing = prev.find((it) => it.key === key)
      if (existing) {
        return prev.map((it) =>
          it.key === key ? { ...it, quantity: it.quantity + quantity } : it
        )
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          image: product.images[0],
          price: product.discountPrice || product.price,
          color: color || null,
          size: size || null,
          quantity,
        },
      ]
    })
    setCartOpen(true)
  }

  function removeFromCart(key) {
    setItems((prev) => prev.filter((it) => it.key !== key))
  }

  function clearCart() {
    setItems([])
  }

  function updateQuantity(key, quantity) {
    if (quantity < 1) return
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, quantity } : it)))
  }

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  )
  const count = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items])

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    count,
    isCartOpen,
    setCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
