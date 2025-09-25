import { useEffect, useState } from 'react'
import { getCoverUrl } from '../Utils/covers'

type Props = {
  id: number
  title: string
  author: string
  available: number
  genres: string[]
  onBorrow: (id: number) => void
}

export default function BookCard({ id, title, author, available, genres, onBorrow }: Props) {
  const [img, setImg] = useState<string | null>(null)
  const [imgLoading, setImgLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setImgLoading(true)
      ; (async () => {
        const url = await getCoverUrl({ title, author })
        if (!alive) return
        setImg(url)
        setImgLoading(false)
      })()
    return () => { alive = false }
  }, [title, author])

  return (
    <div
      tabIndex={0}
      className="
        group relative flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm
        shadow-sm text-white
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 hover:bg-white/[0.08]
        focus-within:-translate-y-1 focus-within:shadow-2xl focus-within:border-white/20 focus-within:bg-white/[0.08]
        motion-reduce:transition-none
      "
      style={{ willChange: 'transform' }}
    >
      {/* soft glow on hover */}
      <div className="
        pointer-events-none absolute inset-0 rounded-xl
        opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
        transition-opacity duration-300
        ring-0 group-hover:ring-1 group-focus-within:ring-1 ring-blue-300/30
      " />

      {/* Cover */}
      <div className="w-20 h-28 rounded-md overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
        {imgLoading ? (
          <div className="w-full h-full animate-pulse bg-white/10" />
        ) : img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="text-[10px] text-gray-300 px-2 text-center">No cover</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-sm text-gray-300 truncate">{author}</div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mt-2">
          {genres.slice(0, 3).map(g => (
            <span key={g} className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-gray-200">
              {g}
            </span>
          ))}
          {genres.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-gray-200">
              +{genres.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs ${available > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {available > 0 ? `${available} available` : 'Unavailable'}
          </span>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                        ${available > 0
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow'
                : 'bg-white/10 text-gray-300 cursor-not-allowed border border-white/10'
              }`}
            onClick={() => available > 0 && onBorrow(id)}
            disabled={available === 0}
          >
            Borrow
          </button>
        </div>
      </div>
    </div>
  )
}
