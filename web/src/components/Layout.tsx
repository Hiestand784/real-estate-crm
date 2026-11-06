import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Layout() {
  return (
    <div>
      <header>
        <nav>
          <NavLink to="/transactions/new">New transaction</NavLink>
        </nav>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
