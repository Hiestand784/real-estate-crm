import { useSession } from './hooks/useSession'
import { LoginForm } from './components/LoginForm'
import { MfaGate } from './components/MfaGate'
import { supabase } from './lib/supabase'

function App() {
  const { session, loading } = useSession()

  if (loading) return <p>Loading…</p>
  if (!session) return <LoginForm />

  return (
    <MfaGate>
      <main>
        <h1>Real Estate CRM</h1>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </main>
    </MfaGate>
  )
}

export default App