import { useEffect, useState } from 'react'
import api from '../api/http'
import BookCard from '../components/BookCard'

type BookView = { id:number, title:string, author:string, copiesAvailable:number, genres:string[] }
type Genre = { id:number, name:string }

export default function Books() {
  const [q, setQ] = useState('')
  const [genreId, setGenreId] = useState<number | ''>('')
  const [genres, setGenres] = useState<Genre[]>([])
  const [list, setList] = useState<BookView[]>([])
  const [loading, setLoading] = useState(true)
  const [openFilters, setOpenFilters] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const params: any = { q }
      if (genreId) params.genreId = genreId
      const r = await api.get('/books', { params })
      setList(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      const g = await api.get('/genres')
      setGenres(g.data)
      load()
    })()
  }, [])

  async function borrow(id:number) {
    await api.post('/borrows', id, { headers: { 'Content-Type': 'application/json' } })
    load()
  }

  return (
    <div className="space-y-4 text-white">
      {/* Top bar */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Browse Books</h1>
          <p className="text-sm text-gray-300">Search by title, author, or filter by genre.</p>
        </div>
        <div className="flex gap-2">
          <input
            className="border border-white/20 bg-white/10 text-white rounded-lg px-3 py-2 w-[260px]
                       placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="Search title or author"
            value={q}
            onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if (e.key === 'Enter') load() }}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg shadow"
            onClick={load}
          >
            Search
          </button>
          <button
            className="border border-white/15 text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
            onClick={() => setOpenFilters(v => !v)}
          >
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {openFilters && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-sm p-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <div className="text-xs text-gray-300">Genre</div>
            <select
              className="border border-white/20 bg-white/10 text-white rounded-lg px-3 py-2 min-w-[220px]
                         outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={genreId}
              onChange={e => setGenreId(e.target.value ? parseInt(e.target.value) : '')}
            >
              {/* Note: option text color is forced dark via index.css select option rule */}
              <option className="text-gray-900" value="">All genres</option>
              {genres.map(g => <option className="text-gray-900" key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg shadow" onClick={load}>
              Apply
            </button>
            <button
              className="px-4 py-2 rounded-lg border border-white/15 text-white bg-white/10 hover:bg-white/20"
              onClick={() => { setGenreId(''); setQ(''); load() }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_,i)=>(
            <div key={i} className="h-32 bg-white/10 border border-white/10 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-sm text-gray-300">
          No books found. Try a different search term or genre.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {list.map(b => (
            <BookCard
              key={b.id}
              id={b.id}
              title={b.title}
              author={b.author}
              available={b.copiesAvailable}
              genres={b.genres}
              onBorrow={borrow}
            />
          ))}
        </div>
      )}
    </div>
  )
}
