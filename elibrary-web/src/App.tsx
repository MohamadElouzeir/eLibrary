import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify from './pages/verify'
import Books from './pages/Books'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NavBar from './components/NavBar'
import { useAuth } from './store/auth'

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (role !== 'Admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { token } = useAuth()

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Bold gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black" />

      {/* Glow / overlay effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.4),transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.3),transparent_40%)]" />

      {/* Main content layer */}
      <div className="relative flex-1 flex flex-col text-white">
        {token && <NavBar />}

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/" element={<Protected><Books /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
            </Routes>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} eLibrary
        </footer>
      </div>
    </div>
  )
}
