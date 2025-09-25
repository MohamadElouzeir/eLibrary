import { useState } from 'react'
import api from '../api/http'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  function validate(p: string): string | null {
    if (!p || p.length < 8) return 'Min 8 characters'
    if (!/[A-Z]/.test(p)) return 'Include an uppercase letter'
    if (!/[a-z]/.test(p)) return 'Include a lowercase letter'
    if (!/[0-9]/.test(p)) return 'Include a digit'
    if (!/[!@#$%^&*()_\-+=\[\]{};:,.<>/?\\|]/.test(p)) return 'Include a special character'
    return null
  }

  const [user, setUser] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setLoading(true)
    try {
      const why = validate(pass)
      if (why) {
        setErr('Weak password: ' + why)
        return
      }

      await api.post('/auth/register', { userName: user, email, password: pass })
      setMsg('Verification code sent. Please check your email.')
      setTimeout(() => nav(`/verify?email=${encodeURIComponent(email)}`), 800)
    } catch (e: any) {
      const msg = e?.response?.data || 'User exists or invalid data'
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold tracking-tight">eLibrary</div>
          <div className="text-sm text-gray-300">Create your account</div>
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

        <div className="space-y-2">
          <label className="text-sm text-gray-200">Username</label>
          <input
            className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="yourname"
            value={user}
            onChange={e => setUser(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-200">Email</label>
          <input
            className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-200">Password</label>
          <div className="flex items-stretch">
            <input
              className="flex-1 rounded-l-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            <button
              type="button"
              className="px-3 text-xs rounded-r-lg border border-l-0 border-white/20 bg-white/10 text-gray-300 hover:bg-white/20"
              onClick={() => setShow(s => !s)}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-lg disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create Account'}
        </button>

        <div className="text-xs text-center text-gray-300">
          Have an account?{' '}
          <Link className="text-blue-400 hover:underline" to="/login">
            Login
          </Link>
        </div>
      </form>
    </div>
  )
}
