import { useState } from 'react'
import api from '../api/http'
import { useAuth } from '../store/auth'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { login } = useAuth()

  async function submit(e: React.FormEvent) {
    e.preventDefault()                  // no page refresh
    setErr('')
    setLoading(true)
    try {
      const r = await api.post('/auth/login', {
        userNameOrEmail: user.trim(),
        password: pass
      })
      login(r.data.token)
      nav('/')
    } catch (e: any) {
      const status = e?.response?.status
      const serverMsg = e?.response?.data
      const text = typeof serverMsg === 'string' ? serverMsg : ''

      // Default
      let msg = 'Login failed'

      if (status === 401) {
        // Our API returns messages like:
        // "invalid credentials (user)" or "invalid credentials (password)"
        const lower = text.toLowerCase()
        if (lower.includes('(password)')) msg = 'Invalid password'
        else if (lower.includes('(user)')) msg = 'User not found'
        else if (lower.includes('verify')) msg = 'Please verify your email to continue'
        else msg = 'Invalid credentials'
      } else if (status === 400) {
        msg = text || 'Invalid request'
      } else if (status === 403) {
        msg = text || 'Access denied'
      } else if (text) {
        msg = text
      }

      setErr(msg)

      // If backend hinted “verify”, guide to /verify after a short pause
      if (String(text).toLowerCase().includes('verify')) {
        setTimeout(() => nav('/verify'), 1000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-8 space-y-6"
        noValidate
      >
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold tracking-tight">eLibrary</div>
          <div className="text-sm text-gray-300">Sign in to continue</div>
        </div>

        {err && (
          <div className="text-sm text-red-300 bg-red-900/40 border border-red-700/60 rounded px-3 py-2">
            {err}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm text-gray-200">Username or email</label>
          <input
            className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            placeholder="you@example.com"
            value={user}
            onChange={e => setUser(e.target.value)}
            autoComplete="username"
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
              autoComplete="current-password"
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
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <div className="text-xs text-center text-gray-300">
          No account?{' '}
          <Link className="text-blue-400 hover:underline" to="/register">
            Create one
          </Link>
        </div>
      </form>
    </div>
  )
}
