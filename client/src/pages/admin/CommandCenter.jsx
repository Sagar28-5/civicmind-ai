import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Brain, CheckCircle, Clock, MapPin, Send,
  TrendingUp, Users, Zap, Activity, BarChart2, RefreshCw, X
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import CountUp from 'react-countup'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PRIORITY_COLORS = { critical: '#EF4444', high: '#F59E0B', medium: '#06B6D4', low: '#22C55E' }
const CAT_COLORS = { road: '#F59E0B', water: '#06B6D4', electricity: '#EAB308', garbage: '#22C55E', health: '#EF4444', traffic: '#7C3AED', other: '#6B7280' }
const PIE_COLORS = ['#2563EB', '#7C3AED', '#06B6D4', '#22C55E', '#EF4444', '#F59E0B', '#EC4899']

const KPI_CONFIG = [
  { key: 'total', label: 'Total Complaints', icon: Activity, color: 'from-blue-500 to-cyan-500', suffix: '' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'from-yellow-500 to-orange-500', suffix: '' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'from-green-500 to-teal-500', suffix: '' },
  { key: 'critical', label: 'Critical', icon: AlertTriangle, color: 'from-red-500 to-pink-500', suffix: '' },
  { key: 'officers', label: 'Officers', icon: Users, color: 'from-purple-500 to-indigo-500', suffix: '' },
  { key: 'aiAccuracy', label: 'AI Accuracy', icon: Brain, color: 'from-pink-500 to-rose-500', suffix: '%' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark rounded-xl p-3 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function CommandCenter() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [heatmap, setHeatmap] = useState([])
  const [feed, setFeed] = useState([])
  const [predictions, setPredictions] = useState([])
  const [ariaOpen, setAriaOpen] = useState(false)
  const [ariaMessages, setAriaMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m ARIA, your AI assistant. Ask me about complaints, officers, or city predictions.' }
  ])
  const [ariaInput, setAriaInput] = useState('')
  const [ariaLoading, setAriaLoading] = useState(false)
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const feedRef = useRef(null)

  const fetchData = async () => {
    try {
      const [statsRes, heatRes, feedRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/heatmap'),
        api.get('/admin/feed'),
      ])
      setStats(statsRes.data)
      setHeatmap(heatRes.data)
      setFeed(feedRes.data)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    }
  }

  const fetchPredictions = async () => {
    setLoadingPredictions(true)
    try {
      const { data } = await api.post('/ai/predict')
      setPredictions(data)
      toast.success('AI Predictions updated!')
    } catch {
      toast.error('Could not fetch predictions')
    } finally {
      setLoadingPredictions(false)
    }
  }

  const sendAria = async (e) => {
    e.preventDefault()
    if (!ariaInput.trim()) return
    const msg = ariaInput.trim()
    setAriaInput('')
    setAriaMessages(prev => [...prev, { role: 'user', text: msg }])
    setAriaLoading(true)
    try {
      const { data } = await api.post('/ai/chat', { message: msg })
      setAriaMessages(prev => [...prev, { role: 'assistant', text: data.response }])
    } catch {
      setAriaMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I\'m having trouble connecting. Please try again.' }])
    } finally {
      setAriaLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto-refresh feed every 30s
    const interval = setInterval(() => fetchData(), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-scroll feed
    if (feedRef.current) feedRef.current.scrollTop = 0
  }, [feed])

  const handleKpiClick = (key) => {
    if (key === 'pending') navigate('/admin/complaints?status=pending')
    else if (key === 'resolved') navigate('/admin/complaints?status=resolved')
    else if (key === 'critical') navigate('/admin/complaints?priority=critical')
    else if (key === 'total') navigate('/admin/complaints')
    else if (key === 'officers') toast.success('Officers view coming soon!')
    else if (key === 'aiAccuracy') toast.success('AI Diagnostics coming soon!')
  }

  // Build chart data from stats
  const trendData = stats?.last7Days?.map(d => ({ date: d._id?.slice(5), count: d.count })) || []
  const categoryData = stats?.categoryStats?.map(c => ({ name: c._id, value: c.count })) || []

  return (
    <DashboardLayout title="AI Command Center">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">Real-time city intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl text-sm text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
          <button onClick={fetchData} className="glass hover:bg-white/10 p-2 rounded-xl transition-all">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {KPI_CONFIG.map((kpi, i) => (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => handleKpiClick(kpi.key)}
            className="stat-card cursor-pointer hover:scale-105 hover:border-cyan-500/30 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${kpi.color} flex items-center justify-center mb-2`}>
              <kpi.icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats ? <CountUp end={stats[kpi.key] || 0} duration={1.5} suffix={kpi.suffix} /> : '—'}
            </div>
            <div className="text-gray-500 text-xs">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Map + Feed */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Map */}
        <div className="lg:col-span-2 card overflow-hidden" style={{ height: 380 }}>
          <div className="flex items-center gap-2 p-4 border-b border-white/5">
            <MapPin size={16} className="text-blue-400" />
            <span className="font-semibold text-sm">Live Complaint Heatmap</span>
            <span className="ml-auto text-xs text-gray-500">{heatmap.length} active pins</span>
          </div>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: 'calc(100% - 52px)', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {heatmap.map((c) => (
              <CircleMarker
                key={c._id}
                center={[c.location.lat, c.location.lng]}
                radius={c.priority === 'critical' ? 12 : c.priority === 'high' ? 9 : 6}
                fillColor={PRIORITY_COLORS[c.priority] || '#2563EB'}
                fillOpacity={0.7}
                color={PRIORITY_COLORS[c.priority] || '#2563EB'}
                weight={2}
              >
                <Popup>
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.category} · {c.priority}</div>
                  <div className="text-xs text-gray-500">{c.location.address}</div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Live AI Feed */}
        <div className="card flex flex-col" style={{ height: 380 }}>
          <div className="flex items-center gap-2 p-4 border-b border-white/5">
            <Zap size={16} className="text-yellow-400" />
            <span className="font-semibold text-sm">AI Live Feed</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {feed.length === 0 && <p className="text-gray-500 text-sm text-center mt-8">No recent activity</p>}
            {feed.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-3"
              >
                <div className="font-medium text-sm mb-1">{item.event}</div>
                <div className="text-gray-400 text-xs truncate">{item.title}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`badge badge-${item.priority}`}>{item.priority}</span>
                  <span className="text-gray-600 text-xs">{item.department}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-blue-400" />
            <span className="font-semibold">Complaint Trend (Last 7 Days)</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#2563EB', r: 5 }} activeDot={{ r: 8 }} name="Complaints" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={16} className="text-purple-400" />
            <span className="font-semibold">By Category</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-purple-400" />
            <span className="font-semibold">AI Predictions — Next 7 Days</span>
          </div>
          <button onClick={fetchPredictions} disabled={loadingPredictions}
            className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-all text-purple-400">
            {loadingPredictions ? <><RefreshCw size={14} className="animate-spin" /> Analyzing...</> : <><Brain size={14} /> Run AI Forecast</>}
          </button>
        </div>
        {predictions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Brain size={40} className="mx-auto mb-3 text-gray-700" />
            <p>Click "Run AI Forecast" to generate predictions</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {predictions.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">
                    {p.category === 'road' ? '🏗️' : p.category === 'water' ? '💧' : p.category === 'garbage' ? '🗑️' : p.category === 'electricity' ? '⚡' : p.category === 'health' ? '🏥' : '🚦'}
                  </span>
                  <div className={`text-lg font-black ${p.probability > 70 ? 'text-red-400' : p.probability > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {p.probability}%
                  </div>
                </div>
                <div className="font-semibold text-sm mb-1">{p.issue}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{p.reasoning}</div>
                <div className="mt-2">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.probability}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full rounded-full ${p.probability > 70 ? 'bg-red-500' : p.probability > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ARIA Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAriaOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-2xl glow-blue z-40"
      >
        <Brain size={28} className="text-white" />
      </motion.button>

      {/* ARIA Chat Panel */}
      <AnimatePresence>
        {ariaOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-6 bottom-6 w-96 h-[520px] glass-dark rounded-3xl border border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">ARIA</div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> AI Assistant Online
                </div>
              </div>
              <button onClick={() => setAriaOpen(false)} className="ml-auto text-gray-500 hover:text-white"><X size={18} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {ariaMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white' : 'glass text-gray-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {ariaLoading && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-4 pb-2">
              <div className="flex gap-2 flex-wrap">
                {['Summarize today', 'Top issues', 'Officer stats'].map(q => (
                  <button key={q} onClick={() => setAriaInput(q)} className="text-xs glass px-3 py-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all">{q}</button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={sendAria} className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  value={ariaInput}
                  onChange={e => setAriaInput(e.target.value)}
                  placeholder="Ask ARIA anything..."
                  className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button type="submit" disabled={ariaLoading || !ariaInput.trim()} className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50">
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
