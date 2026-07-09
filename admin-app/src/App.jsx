import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Layout from './components/Layout'
import MenuManagement from './pages/MenuManagement'
import PromoSettings from './pages/PromoSettings'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>

  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/menu" /> : <Login />} />
        <Route path="/" element={session ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/menu" />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="promo" element={<PromoSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App