// Cari stok untuk kombinasi warna+ukuran tertentu.
// Kalau produk belum punya data varian (variants kosong), fallback ke
// stok umum (product.stock) supaya produk lama tetap jalan normal.
export function getVariantStock(product, color, size) {
  if (!product.variants || product.variants.length === 0) {
    return product.stock ?? 0
  }
  const match = product.variants.find(
    (v) => (v.color || null) === (color || null) && (v.size || null) === (size || null)
  )
  return match ? match.stock : 0
}

// Total stok keseluruhan produk (dijumlah dari semua varian).
export function getTotalStock(product) {
  if (!product.variants || product.variants.length === 0) {
    return product.stock ?? 0
  }
  return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
}
