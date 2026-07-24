import ProductCard from './ProductCard.jsx'
import Reveal from './Reveal.jsx'

export default function ProductGrid({ products, columns = 4 }) {
  const colClass =
    columns === 3
      ? 'md:grid-cols-3'
      : columns === 2
      ? 'md:grid-cols-2'
      : 'md:grid-cols-4'

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-ink/60">Tidak ada produk yang cocok dengan filter kamu.</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 ${colClass}`}>
      {products.map((product, i) => (
        <Reveal key={product.id} delay={(i % 8) * 40}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  )
}
