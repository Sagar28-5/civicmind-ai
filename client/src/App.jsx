import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import NewComplaint from './pages/citizen/NewComplaint'
import MyComplaints from './pages/citizen/MyComplaints'
import OfficerDashboard from './pages/officer/OfficerDashboard'
import CommandCenter from './pages/admin/CommandCenter'
import AIInsights from './pages/admin/AIInsights'
import AdminComplaints from './pages/admin/AdminComplaints'

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      <Route path="/citizen" element={<PrivateRoute roles={['citizen']}><CitizenDashboard /></PrivateRoute>} />
      <Route path="/citizen/new" element={<PrivateRoute roles={['citizen']}><NewComplaint /></PrivateRoute>} />
      <Route path="/citizen/complaints" element={<PrivateRoute roles={['citizen']}><MyComplaints /></PrivateRoute>} />

      <Route path="/officer" element={<PrivateRoute roles={['officer']}><OfficerDashboard /></PrivateRoute>} />

      <Route path="/admin" element={<PrivateRoute roles={['admin']}><CommandCenter /></PrivateRoute>} />
      <Route path="/admin/complaints" element={<PrivateRoute roles={['admin']}><AdminComplaints /></PrivateRoute>} />
      <Route path="/admin/insights" element={<PrivateRoute roles={['admin']}><AIInsights /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { SocketProvider } from './contexts/SocketContext'

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { background: '#0F172A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
                }}
              />
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

