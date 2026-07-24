import Hero from '../components/Hero.jsx'
import CategorySection from '../components/CategorySection.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import PromoBanner from '../components/PromoBanner.jsx'
import WhyChooseUs from '../components/WhyChooseUs.jsx'
import InstagramGallery from '../components/InstagramGallery.jsx'
import Newsletter from '../components/Newsletter.jsx'
import Reveal from '../components/Reveal.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { Link } from 'react-router-dom'

export default function Home() {
  const { products } = useProducts()
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8)
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 8)

  return (
    <>
      <Hero />

      <CategorySection />

      <section className="container-page py-16 md:py-24">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Favorit Pelanggan</p>
              <h2 className="section-title">Best Seller</h2>
            </div>
            <Link to="/shop?sort=bestseller" className="btn-ghost hidden sm:inline-flex">
              Lihat Semua
            </Link>
          </div>
        </Reveal>
        <ProductGrid products={bestSellers} />
        <div className="mt-8 text-center sm:hidden">
          <Link to="/shop?sort=bestseller" className="btn-outline">
            Lihat Semua
          </Link>
        </div>
      </section>

      <PromoBanner />

      <section className="container-page py-16 md:py-24">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Koleksi Terbaru</p>
              <h2 className="section-title">New Arrival</h2>
            </div>
            <Link to="/shop?sort=newest" className="btn-ghost hidden sm:inline-flex">
              Lihat Semua
            </Link>
          </div>
        </Reveal>
        <ProductGrid products={newArrivals} />
        <div className="mt-8 text-center sm:hidden">
          <Link to="/shop?sort=newest" className="btn-outline">
            Lihat Semua
          </Link>
        </div>
      </section>

      <WhyChooseUs />
      <InstagramGallery />
      <Newsletter />
    </>
  )
}
