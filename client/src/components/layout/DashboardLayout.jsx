import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, LogOut, Menu, X, Bell, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const NAV_BY_ROLE = {
  citizen: [
    { path: '/citizen', label: 'Dashboard', icon: '🏠' },
    { path: '/citizen/new', label: 'New Complaint', icon: '📝' },
    { path: '/citizen/complaints', label: 'My Complaints', icon: '📋' },
  ],
  officer: [
    { path: '/officer', label: 'My Tasks', icon: '📋' },
  ],
  admin: [
    { path: '/admin', label: 'Command Center', icon: '🎯' },
    { path: '/admin/insights', label: 'AI Insights', icon: '🤖' },
  ],
}

const ROLE_COLORS = { citizen: 'from-green-500 to-teal-500', officer: 'from-blue-500 to-cyan-500', admin: 'from-purple-500 to-pink-500' }
const ROLE_BADGES = { citizen: '👤 Citizen', officer: '👮 Officer', admin: '⚙️ Admin' }

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = NAV_BY_ROLE[user?.role] || []

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">CivicMind AI</div>
            <div className="text-gray-500 text-xs">Smart Governance</div>
          </div>
        </Link>
      </div>

      {/* User Card */}
      <div className="p-4 m-4 glass rounded-2xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${ROLE_COLORS[user?.role]} flex items-center justify-center text-white font-bold text-sm`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{user?.name}</div>
            <div className="text-gray-400 text-xs">{ROLE_BADGES[user?.role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-white/5 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 h-full w-64 bg-card z-50 lg:hidden">
              <div className="p-4 flex justify-end">
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-card/50 backdrop-blur flex items-center px-6 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-lg flex-1">{title}</h1>
          <div className="flex items-center gap-3">
            <button className="relative glass p-2 rounded-xl hover:bg-white/10 transition-all">
              <Bell size={18} className="text-gray-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">3</div>
            </button>
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${ROLE_COLORS[user?.role]} flex items-center justify-center text-white font-bold text-sm`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
