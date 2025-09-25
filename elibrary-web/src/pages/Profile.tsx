import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../api/http'

type Borrow = { id:number, book:string, borrowedAt:string, dueAt:string | null, returnedAt?: string | null }
type Me = { id:number, userName:string, email:string, role:string }

type Countdown = { ms:number, label:string, status:'ok'|'soon'|'due' }

function computeCountdown(dueAt: string | null): Countdown | null {
  if (!dueAt) return null
  const now = Date.now()
  const due = new Date(dueAt).getTime()
  const ms = due - now

  if (ms <= 0) {
    const lateMs = Math.abs(ms)
    const d = Math.floor(lateMs / 86400000)
    const h = Math.floor((lateMs % 86400000) / 3600000)
    const m = Math.floor((lateMs % 3600000) / 60000)
    const label =
      d > 0 ? `Overdue by ${d}d ${h}h`
      : h > 0 ? `Overdue by ${h}h ${m}m`
      : `Overdue by ${m}m`
    return { ms, label, status: 'due' }
  }

  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)

  const label =
    d > 0 ? `${d}d ${h}h left`
    : h > 0 ? `${h}h ${m}m left`
    : `${m}m left`

  // warn if < 24h left
  const status: Countdown['status'] = ms < 86400000 ? 'soon' : 'ok'
  return { ms, label, status }
}

export default function Profile() {
  const [me, setMe] = useState<Me | null>(null)
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [tick, setTick] = useState(0) // forces re-render every second
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    (async () => {
      const m = await api.get('/users/me'); setMe(m.data)
      const b = await api.get('/borrows/my'); setBorrows(b.data)
    })()
  }, [])

  // 1-second ticker for live countdown
  useEffect(() => {
    timerRef.current = window.setInterval(() => setTick(t => t + 1), 1000)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [])

  async function returnBook(id:number) {
    await api.post(`/borrows/${id}/return`)
    const b = await api.get('/borrows/my'); setBorrows(b.data)
  }

  // derive countdowns (recompute each tick)
  const rows = useMemo(() => {
    return borrows.map(b => ({
      ...b,
      countdown: computeCountdown(b.dueAt)
    }))
  }, [borrows, tick])

  return (
    <div className="space-y-4 text-white">
      {/* Profile card */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="font-semibold text-lg">Profile</div>
        {me && (
          <div className="mt-2 text-sm text-gray-200">
            <div><span className="text-gray-400">User:</span> {me.userName}</div>
            <div><span className="text-gray-400">Email:</span> {me.email}</div>
            <div><span className="text-gray-400">Role:</span> {me.role}</div>
          </div>
        )}
      </div>

      {/* Borrows */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="font-semibold text-lg mb-2">Current borrows</div>
        <div className="space-y-2 text-sm">
          {rows.length === 0 && <div className="text-gray-300">No active borrows.</div>}
          {rows.map(b => {
            const borrowedDate = new Date(b.borrowedAt).toLocaleString()
            const dueDate = b.dueAt ? new Date(b.dueAt).toLocaleString() : null
            const cd = b.countdown

            const badgeStyle =
              cd?.status === 'due'  ? 'bg-rose-600/80 text-white border-rose-400/30' :
              cd?.status === 'soon' ? 'bg-amber-500/80 text-black border-amber-300/40' :
                                      'bg-emerald-600/80 text-white border-emerald-300/30'

            return (
              <div key={b.id}
                   className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-white/10 rounded-lg px-3 py-3 bg-white/5">
                <div>
                  <div className="font-medium">{b.book}</div>
                  <div className="text-gray-300">
                    Borrowed: {borrowedDate}
                    {dueDate && <> • Due: {dueDate}</>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* countdown badge */}
                  {cd && (
                    <span className={`text-xs px-2 py-1 rounded-md border ${badgeStyle}`}>
                      {cd.label}
                    </span>
                  )}

                  {/* Return button */}
                  <button
                    onClick={() => returnBook(b.id)}
                    className="text-xs md:text-sm bg-gray-900 hover:bg-gray-800 active:bg-black text-white px-3 py-1.5 rounded-md border border-white/10"
                  >
                    Return
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
