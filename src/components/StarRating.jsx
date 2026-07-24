import { Star } from 'lucide-react'

export default function StarRating({ value, className = '' }) {
  if (!value) return null
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`Rating ${value} dari 5`}>
      <Star size={13} className="fill-gold text-gold" strokeWidth={0} />
      <span className="text-xs text-ink/60">{value.toFixed(1)}</span>
    </div>
  )
}
