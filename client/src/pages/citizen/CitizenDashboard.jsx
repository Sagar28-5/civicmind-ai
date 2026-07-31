import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, Clock, CheckCircle, AlertCircle, Mic } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'badge-pending', icon: Clock },
  assigned: { label: 'Assigned', color: 'badge-assigned', icon: TrendingUp },
  in_progress: { label: 'In Progress', color: 'badge-in_progress', icon: TrendingUp },
  resolved: { label: 'Resolved', color: 'badge-resolved', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'badge-rejected', icon: AlertCircle },
}

const CAT_ICONS = { road: '🏗️', water: '💧', electricity: '⚡', garbage: '🗑️', health: '🏥', traffic: '🚦', other: '📋' }

export default function CitizenDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    api.get('/complaints/my').then(r => setComplaints(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => ['assigned', 'in_progress'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return alert('Speech recognition not supported in this browser')
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-IN'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      navigate('/citizen/new', { state: { voiceText: text } })
    }
    recognition.start()
  }

  return (
    <DashboardLayout title="My Dashboard">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6 bg-gradient-card border-blue-500/20 border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-gray-400">Track your complaints and help build a smarter city.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center glass px-4 py-3 rounded-2xl">
              <div className="text-2xl font-black text-yellow-400">{user?.rewardPoints || 0}</div>
              <div className="text-xs text-gray-500">Civic Points</div>
            </div>
            <div className="text-center glass px-4 py-3 rounded-2xl">
              <div className="text-2xl">🏅</div>
              <div className="text-xs text-gray-500 truncate max-w-[80px]">{user?.badge}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { key: 'all', label: 'Total Filed', value: stats.total, icon: '📋', color: 'text-blue-400' },
          { key: 'pending', label: 'Pending', value: stats.pending, icon: '⏳', color: 'text-yellow-400' },
          { key: 'in_progress', label: 'In Progress', value: stats.inProgress, icon: '🔄', color: 'text-purple-400' },
          { key: 'resolved', label: 'Resolved', value: stats.resolved, icon: '✅', color: 'text-green-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} 
            onClick={() => navigate(`/citizen/complaints?status=${s.key}`)}
            className="stat-card cursor-pointer hover:scale-105 hover:border-cyan-500/30 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div className="text-2xl">{s.icon}</div>
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button onClick={startVoice} className={`cyber-card p-5 hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all group flex items-center gap-4 cursor-pointer text-left ${listening ? 'border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : ''}`}>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center transition-transform ${listening ? 'animate-pulse scale-110' : 'group-hover:scale-110'}`}>
            <Mic size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold glow-text">{listening ? 'Listening...' : 'Voice Report'}</div>
            <div className="text-gray-400 text-sm">Speak your issue</div>
          </div>
        </button>
        <Link to="/citizen/new" className="cyber-card p-5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all group flex items-center gap-4 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold">New Complaint</div>
            <div className="text-gray-400 text-sm">AI-powered filing</div>
          </div>
        </Link>
        <Link to="/citizen/complaints" className="card p-5 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all group flex items-center gap-4 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold">Track Complaints</div>
            <div className="text-gray-400 text-sm">Real-time status</div>
          </div>
        </Link>
        <button onClick={() => alert('Emergency SOS triggered. Help is on the way (demo only).')} className="card p-5 hover:border-red-500/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/20 transition-all group flex items-center gap-4 text-left cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertCircle size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold">Emergency SOS</div>
            <div className="text-gray-400 text-sm">Critical issues</div>
          </div>
        </button>
      </div>

      {/* Recent Complaints */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Recent Complaints</h3>
          <Link to="/citizen/complaints" className="text-blue-400 hover:text-blue-300 text-sm">View all →</Link>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400 mb-4">No complaints yet</p>
            <Link to="/citizen/new" className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> File First Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.slice(0, 5).map((c, i) => {
              const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending
              return (
                <motion.div key={c._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 glass rounded-2xl p-4 hover:bg-white/5 transition-all">
                  <div className="text-3xl">{CAT_ICONS[c.category] || '📋'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.title}</div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {c.department?.name || 'Unassigned'} · {c.createdAt ? format(new Date(c.createdAt), 'dd MMM yyyy') : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${c.priority ? `badge-${c.priority}` : ''}`}>{c.priority}</span>
                    <span className={`badge ${sc.color}`}>{sc.label}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
