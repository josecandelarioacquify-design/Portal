import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Documents from './pages/Documents'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import Contacts from './pages/Contacts'
import Login from './pages/Login'
import PageNotFound from './lib/PageNotFound'
import useCurrentUser from './hooks/useCurrentUser'

const ProtectedLayout = () => {
  const { isLoadingAuth, session } = useAuth()
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }
  return session ? <AppLayout /> : <Navigate to="/login" replace />
}

const AdminRoute = () => {
  const { isAdmin, loading } = useCurrentUser()
  if (loading) return null
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route element={<AdminRoute />}>
                <Route path="/contacts" element={<Contacts />} />
              </Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
