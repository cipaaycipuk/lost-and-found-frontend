import { resolveMediaUrl } from '../lib/formatters'

export default function Avatar({ src, name = '', className = '' }) {
  const resolvedSrc = resolveMediaUrl(src)
  if (resolvedSrc) {
    return <img src={resolvedSrc} alt={name} className={`rounded-full object-cover ${className}`} />
  }

  const initials = name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center rounded-full bg-neutral-300 font-semibold text-neutral-600 ${className}`}
    >
      {initials} 
    </div>
  )
}