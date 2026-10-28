import { useSession } from './hooks/useSession'
import { LoginForm } from './components/LoginForm'
import { supabase } from './lib/supabase'

function App() {
  const { session, loading } = useSession()

  if (loading) return <p>Loading…</p>
  if (!session) return <LoginForm />

  return (
    <main>
      <h1>Real Estate CRM</h1>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </main>
  )
}

export default App