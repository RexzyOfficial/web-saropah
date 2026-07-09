import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2 className="sidebar-title">Saropah</h2>
        <nav className="sidebar-nav">
          <NavLink to="/menu" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Menu</NavLink>
          <NavLink to="/promo" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Promo</NavLink>
        </nav>
        <button onClick={handleLogout} className="sidebar-logout">Logout</button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}