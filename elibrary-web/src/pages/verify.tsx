import { useState } from 'react'
import api from '../api/http'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

export default function Verify() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState((params.get('email') || '').trim())
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await api.post('/auth/confirm-email', {
        email: email.trim().toLowerCase(),
        code: code.trim()
      })
      setMsg('Verified! You can log in now.')
      setTimeout(() => nav('/login'), 800)
    } catch (e: any) {
      setErr(e?.response?.data || 'Invalid or expired code')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold tracking-tight">Verify Email</div>
          <div className="text-sm text-gray-300">
            Enter the 6-digit code we sent
          </div>
        </div>

        {msg && (
          <div className="text-sm text-green-300 bg-green-900/40 border border-green-700/60 rounded px-3 py-2">
            {msg}
          </div>
        )}
        {err && (
          <div className="text-sm text-red-300 bg-red-900/40 border border-red-700/60 rounded px-3 py-2">
            {err}
          </div>
        )}

        <input
          className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          placeholder="123456"
          value={code}
          onChange={e => setCode(e.target.value)}
        />

        <button className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg py-2 font-semibold shadow-lg">
          Verify
        </button>

        <div className="text-xs text-center text-gray-300">
          Didn’t get it?{' '}
          <Link className="text-blue-400 hover:underline" to="/login">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  )
}
