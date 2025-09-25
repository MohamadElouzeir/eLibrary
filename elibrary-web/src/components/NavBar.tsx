import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-white/20 text-white'
            : 'text-gray-200 hover:text-white hover:bg-white/10'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function NavBar() {
  const { logout, role, userName } = useAuth()

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-black/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-14 flex items-center gap-3">
          {/* Brand */}
          <Link to="/" className="text-white font-semibold tracking-tight">
            eLibrary
          </Link>

          <div className="h-5 w-px bg-white/15 mx-1" />

          {/* Primary nav */}
          <nav className="flex items-center gap-1">
            <NavItem to="/">Books</NavItem>
            <NavItem to="/profile">Profile</NavItem>
            {role === 'Admin' && <NavItem to="/admin">Admin</NavItem>}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {/* User chip */}
            {userName && (
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md border border-white/10 bg-white/5 text-gray-200 text-xs">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white font-semibold">
                  {userName.slice(0,1).toUpperCase()}
                </span>
                <span className="truncate max-w-[120px]">{userName}</span>
                {role && (
                  <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-300">
                    {role}
                  </span>
                )}
              </div>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
                         bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow
                         focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
