import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, LogOut, Menu, X, Bell, ChevronRight, Sun, Moon, Globe } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSocket } from '../../contexts/SocketContext'
import toast from 'react-hot-toast'
import ProfileModal from '../ui/ProfileModal'
import NotificationPanel from '../ui/NotificationPanel'

const NAV_BY_ROLE = {
  citizen: [
    { path: '/citizen', labelKey: 'dashboard', icon: '🏠' },
    { path: '/citizen/new', labelKey: 'newComplaint', icon: '📝' },
    { path: '/citizen/complaints', labelKey: 'myComplaints', icon: '📋' },
  ],
  officer: [
    { path: '/officer', labelKey: 'assignedComplaints', icon: '📋' },
  ],
  admin: [
    { path: '/admin', labelKey: 'commandCenter', icon: '🎯' },
    { path: '/admin/complaints', labelKey: 'myComplaints', icon: '📋' },
    { path: '/admin/insights', labelKey: 'analytics', icon: '🤖' },
  ],
}

const ROLE_COLORS = { citizen: 'from-emerald-500 to-teal-500', officer: 'from-blue-500 to-indigo-500', admin: 'from-purple-500 to-pink-500' }
const ROLE_BADGES = { citizen: '👤 Citizen', officer: '👮 Officer', admin: '⚙️ Admin' }

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const { unreadCount } = useSocket()
  
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileModalUser, setProfileModalUser] = useState(null)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const navItems = NAV_BY_ROLE[user?.role] || []

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white dark:bg-slate-950">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link to={user ? `/${user.role}` : '/'} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight">{t('appTitle')}</div>
            <div className="text-slate-400 text-xs font-medium">Smart Governance</div>
          </div>
        </Link>
      </div>

      {/* User Card */}
      <div
        className="p-4 m-4 bg-slate-800/60 dark:bg-slate-900/60 border border-slate-700/50 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all group"
        onClick={() => setProfileModalUser(user)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${ROLE_COLORS[user?.role]} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate group-hover:text-indigo-400 transition-colors">{user?.name}</div>
            <div className="text-slate-400 text-xs">{ROLE_BADGES[user?.role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{t(item.labelKey)}</span>
              {active && <ChevronRight size={16} className="ml-auto opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 22 }}
              className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden">
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center px-6 gap-4 flex-shrink-0 z-10 transition-colors">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <Menu size={20} />
          </button>
          
          <h1 className="font-bold text-lg text-slate-900 dark:text-white flex-1 truncate">{title}</h1>
          
          <div className="flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl px-2.5 py-1 border border-slate-200 dark:border-slate-700/60">
              <Globe size={15} className="text-slate-500 dark:text-slate-400 mr-1.5" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">EN (English)</option>
                <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">HI (हिंदी)</option>
                <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">MR (मराठी)</option>
              </select>
            </div>

            {/* Dark/Light Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-r ${ROLE_COLORS[user?.role]} flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-md`}
              onClick={() => setProfileModalUser(user)}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>

      <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      <AnimatePresence>
        {profileModalUser && <ProfileModal user={profileModalUser} onClose={() => setProfileModalUser(null)} />}
      </AnimatePresence>
    </div>
  )
}

