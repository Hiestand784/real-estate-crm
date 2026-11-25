import { Route, Routes } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import { LoginForm } from './components/LoginForm'
import { MfaGate } from './components/MfaGate'
import { Layout } from './components/Layout'
import { NewTransactionPage } from './pages/NewTransactionPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  const { session, loading } = useSession()

  if (loading) return <p>Loading…</p>
  if (!session) return <LoginForm />

  return (
    <MfaGate>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions/new" element={<NewTransactionPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Route>
      </Routes>
    </MfaGate>
  )
}

export default App
