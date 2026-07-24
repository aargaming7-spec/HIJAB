import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const shopMenu = {
  Hijab: ['Voal', 'Pashmina', 'Bergo', 'Segi Empat'],
  Accessories: ['Ciput', 'Inner', 'Pin'],
}

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Collection', to: '/shop?filter=new' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar({ onSearchOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const { count, setCartOpen } = useCart()
  const { ids } = useWishlist()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header
      className={`sticky top-0 z-40 bg-paper/95 backdrop-blur transition-shadow duration-250 ${
        scrolled ? 'shadow-[0_1px_0_0_rgba(42,36,31,0.08)]' : ''
      }`}
    >
      <div className="container-page flex h-[76px] items-center justify-between">
        <button
          className="grid h-9 w-9 place-items-center md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="font-display text-xl tracking-widest2 uppercase">
          Alara
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] tracking-wide">
          {navLinks.map((link) =>
            link.label === 'Shop' ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1 py-2 hover:text-mauve-600 transition-colors duration-250 ${
                      isActive ? 'text-mauve-600' : ''
                    }`
                  }
                >
                  {link.label}
                  <ChevronDown size={13} />
                </NavLink>

                <div
                  className={`absolute left-1/2 top-full w-[560px] -translate-x-1/2 bg-paper border border-line shadow-sm transition-all duration-250 ${
                    shopOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="grid grid-cols-3 gap-8 p-8">
                    {Object.entries(shopMenu).map(([group, items]) => (
                      <div key={group}>
                        <p className="eyebrow mb-3">{group}</p>
                        <ul className="space-y-2">
                          {items.map((item) => (
                            <li key={item}>
                              <Link
                                to={`/shop?collection=${encodeURIComponent(item)}`}
                                className="text-sm text-ink/80 hover:text-mauve-600 transition-colors duration-250"
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div>
                      <p className="eyebrow mb-3">Highlight</p>
                      <ul className="space-y-2">
                        <li>
                          <Link to="/shop?filter=new" className="text-sm text-ink/80 hover:text-mauve-600 transition-colors duration-250">
                            New Arrival
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?filter=best" className="text-sm text-ink/80 hover:text-mauve-600 transition-colors duration-250">
                            Best Seller
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?filter=sale" className="text-sm text-mauve-600 hover:text-mauve-700 transition-colors duration-250">
                            Sale
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `py-2 hover:text-mauve-600 transition-colors duration-250 ${isActive ? 'text-mauve-600' : ''}`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button aria-label="Cari produk" onClick={onSearchOpen} className="hidden sm:grid h-9 w-9 place-items-center hover:text-mauve-600 transition-colors duration-250">
            <Search size={19} />
          </button>
          <Link to="/account" aria-label="Akun" className="hidden sm:grid h-9 w-9 place-items-center hover:text-mauve-600 transition-colors duration-250">
            <User size={19} />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative grid h-9 w-9 place-items-center hover:text-mauve-600 transition-colors duration-250">
            <Heart size={19} />
            {ids.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-mauve-500 text-[9px] text-paper">
                {ids.length}
              </span>
            )}
          </Link>
          <button aria-label="Keranjang" onClick={() => setCartOpen(true)} className="relative grid h-9 w-9 place-items-center hover:text-mauve-600 transition-colors duration-250">
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-mauve-500 text-[9px] text-paper">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-250 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute left-0 top-0 h-full w-[82%] max-w-xs bg-paper transition-transform duration-350 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-[76px] items-center justify-between px-5 border-b border-line">
            <span className="font-display text-lg tracking-widest2 uppercase">Alara</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col px-5 py-6 gap-1 text-[15px]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="py-3 border-b border-line/70"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4">
              <p className="eyebrow mb-3">Shop by Category</p>
              {Object.entries(shopMenu).map(([group, items]) => (
                <div key={group} className="mb-4">
                  <p className="text-sm text-ink/50 mb-2">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <Link
                        key={item}
                        to={`/shop?collection=${encodeURIComponent(item)}`}
                        onClick={() => setMobileOpen(false)}
                        className="text-xs border border-line px-3 py-1.5"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
