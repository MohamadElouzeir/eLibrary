import { useEffect, useState } from 'react'
import api from '../api/http'

type Genre = { id:number, name:string }

export default function Admin() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [copies, setCopies] = useState(1)
  const [genres, setGenres] = useState<Genre[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/genres').then(r => setGenres(r.data))
  }, [])

  function toggle(id:number) {
    setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id])
  }

  async function addBook(e:React.FormEvent) {
    e.preventDefault()
    setMsg(''); setErr('')
    if (!title.trim() || !author.trim()) { setErr('Title and Author are required.'); return }
    if (selected.length === 0) { setErr('Pick at least one genre.'); return }
    setSaving(true)
    try {
      await api.post('/books', {
        title: title.trim(),
        author: author.trim(),
        copiesTotal: copies,
        copiesAvailable: copies,
        genreIds: selected
      })
      setMsg('Book added successfully.')
      setTitle(''); setAuthor(''); setCopies(1); setSelected([])
    } catch (e:any) {
      setErr(e?.response?.data || 'Failed to add book.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Admin · Add Book</h2>
        </div>

        {msg && <div className="mb-3 text-sm text-emerald-300 bg-emerald-900/40 border border-emerald-700/60 rounded px-3 py-2">{msg}</div>}
        {err && <div className="mb-3 text-sm text-rose-300 bg-rose-900/40 border border-rose-700/60 rounded px-3 py-2">{err}</div>}

        <form onSubmit={addBook} className="space-y-4">
          <div>
            <label className="text-sm text-gray-200">Title</label>
            <input
              className="mt-1 w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400
                         outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="e.g., Clean Architecture"
              value={title}
              onChange={e=>setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-200">Author</label>
            <input
              className="mt-1 w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400
                         outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="e.g., Robert C. Martin"
              value={author}
              onChange={e=>setAuthor(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-200">Copies</label>
            <input
              type="number" min={1}
              className="mt-1 w-36 rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400
                         outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={copies}
              onChange={e=>setCopies(parseInt(e.target.value || '1'))}
            />
          </div>

          <div>
            <div className="text-sm text-gray-200 mb-2">Genres</div>
            <div className="flex flex-wrap gap-2">
              {genres.map(g => {
                const active = selected.includes(g.id)
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => toggle(g.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition
                      ${active
                        ? 'bg-blue-600 border-blue-600 text-white shadow'
                        : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'}`}
                  >
                    {g.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                         text-white font-medium shadow disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
