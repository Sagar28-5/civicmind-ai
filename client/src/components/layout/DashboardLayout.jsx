import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, LogOut, Menu, X, Bell, ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import ProfileModal from '../ui/ProfileModal'

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
    { path: '/admin/complaints', label: 'Manage Complaints', icon: '📋' },
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
  const [profileModalUser, setProfileModalUser] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Status Updated', message: 'A complaint assigned to you has been marked as In Progress.', read: false, time: '10 mins ago' },
    { id: 2, title: 'System Alert', message: 'Server maintenance scheduled for tonight at 2 AM. Expect brief downtime.', read: false, time: '1 hour ago' },
    { id: 3, title: 'Welcome!', message: 'Welcome to CivicMind AI. Explore your dashboard to get started.', read: true, time: '2 days ago' }
  ])
  const [selectedNotification, setSelectedNotification] = useState(null)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = (n) => {
    setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif))
    setSelectedNotification(n)
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

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
        <Link to={user ? `/${user.role}` : '/'} className="flex items-center gap-3">
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
      <div className="p-4 m-4 cyber-card rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all group" onClick={() => setProfileModalUser(user)}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${ROLE_COLORS[user?.role]} flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate group-hover:text-cyan-400 transition-colors">{user?.name}</div>
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
          <div className="flex items-center gap-3 relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative glass p-2 rounded-xl hover:bg-white/10 transition-all">
              <Bell size={18} className="text-gray-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">
                  {unreadCount}
                </div>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => { setShowNotifications(false); setSelectedNotification(null); }}></div>
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-12 right-0 w-80 cyber-card rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden flex flex-col max-h-[400px]">
                    
                    {!selectedNotification ? (
                      <>
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 flex-shrink-0">
                          <h3 className="font-bold text-sm">Notifications</h3>
                          <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <div className={`font-semibold text-sm ${!n.read ? 'text-cyan-400' : 'text-gray-300'}`}>{n.title}</div>
                                  {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />}
                                </div>
                                <div className="text-xs text-gray-400 truncate">{n.message}</div>
                                <div className="text-[10px] text-gray-500 mt-2">{n.time}</div>
                              </div>
                            ))
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <div className="p-3 text-center border-t border-white/10 bg-white/5 flex-shrink-0">
                            <button onClick={markAllRead} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Mark all as read</button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5 flex-shrink-0">
                          <button onClick={() => setSelectedNotification(null)} className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all">
                            <ArrowLeft size={16} />
                          </button>
                          <h3 className="font-bold text-sm flex-1 truncate">{selectedNotification.title}</h3>
                          <button onClick={() => { setShowNotifications(false); setSelectedNotification(null); }} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1">
                          <div className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider mb-3">{selectedNotification.time}</div>
                          <p className="text-gray-300 text-sm leading-relaxed">{selectedNotification.message}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${ROLE_COLORS[user?.role]} flex items-center justify-center text-white font-bold text-sm cursor-pointer`} onClick={() => setProfileModalUser(user)}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      
      <AnimatePresence>
        {profileModalUser && <ProfileModal user={profileModalUser} onClose={() => setProfileModalUser(null)} />}
      </AnimatePresence>
    </div>
  )
}
