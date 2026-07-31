// Compress & resize gambar di browser (pakai Canvas API) sebelum di-upload
// ke Supabase Storage. Ini mengecilkan ukuran file produk secara signifikan
// (foto HP 3-5MB bisa turun jadi ~150-300KB) tanpa perlu library tambahan,
// jadi hemat storage DAN hemat bandwidth setiap kali foto itu dimuat
// pengunjung web.

/**
 * @param {File} file - file gambar asli dari input
 * @param {object} opts
 * @param {number} opts.maxWidth - lebar maksimum hasil (px)
 * @param {number} opts.quality - kualitas WebP (0-1)
 * @returns {Promise<File>} file baru dalam format WebP, sudah di-resize
 */
export async function compressImage(file, { maxWidth = 1200, quality = 0.8 } = {}) {
  // Kalau browser tidak support canvas/WebP (sangat jarang), fallback ke file asli
  // daripada gagal total.
  try {
    const bitmap = await createImageBitmap(file)

    const scale = Math.min(1, maxWidth / bitmap.width)
    const targetWidth = Math.round(bitmap.width * scale)
    const targetHeight = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))

    if (!blob) return file // fallback kalau toBlob gagal

    const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
    return new File([blob], newName, { type: 'image/webp' })
  } catch (err) {
    console.warn('Gagal compress gambar, pakai file asli:', err)
    return file
  }
}

/**
 * Compress beberapa file sekaligus, dengan progress callback opsional.
 * @param {File[]} files
 * @param {object} opts
 * @param {(done: number, total: number) => void} [onProgress]
 */
export async function compressImages(files, opts, onProgress) {
  const results = []
  for (let i = 0; i < files.length; i++) {
    results.push(await compressImage(files[i], opts))
    onProgress?.(i + 1, files.length)
  }
  return results
}
