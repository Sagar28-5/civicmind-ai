import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, TrendingUp, AlertCircle, Calendar, MapPin, Building, Flag, ArrowLeft } from 'lucide-react'

import DashboardLayout from '../../components/layout/DashboardLayout'
import ProfileModal from '../../components/ui/ProfileModal'
import api from '../../services/api'
import { format } from 'date-fns'

const STATUS_ICONS = { pending: '⏳', assigned: '👮', in_progress: '🔧', resolved: '✅', rejected: '❌' }
const CAT_ICONS = { road: '🏗️', water: '💧', electricity: '⚡', garbage: '🗑️', health: '🏥', traffic: '🚦', other: '📋' }

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const [filter, setFilter] = useState(queryParams.get('status') || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [profileModalUser, setProfileModalUser] = useState(null)

  useEffect(() => {
    api.get('/complaints/my').then(r => setComplaints(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = complaints.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <DashboardLayout title="My Complaints">
      <div className="flex gap-4 mb-6 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'assigned', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === s ? 'bg-primary text-white hover:-translate-y-0.5' : 'glass text-gray-400 hover:text-white hover:-translate-y-0.5'}`}>
              {s === 'all' ? `All (${complaints.length})` : `${s.replace('_', ' ')} (${complaints.filter(c => c.status === s).length})`}
            </button>
          ))}
        </div>
        <input 
          type="text" 
          placeholder="Search my complaints..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary focus:outline-none w-full md:w-64"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No complaints found</div>
          ) : (
            filtered.map((c, i) => (
              <motion.button key={c._id} onClick={() => setSelected(c)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`w-full card p-4 text-left hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer ${selected?._id === c._id ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{CAT_ICONS[c.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{c.title}</div>
                    <div className="text-gray-500 text-xs">{c.createdAt ? format(new Date(c.createdAt), 'dd MMM') : ''}</div>
                  </div>
                  <span className="text-xl">{STATUS_ICONS[c.status]}</span>
                </div>
                <div className="flex gap-2">
                  <span className={`badge badge-${c.priority}`}>{c.priority}</span>
                  <span className={`badge badge-${c.status}`}>{c.status?.replace('_', ' ')}</span>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Detail */}
        <div className={`lg:col-span-2 ${selected ? 'fixed inset-x-0 bottom-0 z-50 glass-dark p-6 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:max-h-none lg:rounded-none lg:border-none lg:shadow-none' : 'hidden lg:block'}`}>
          {!selected ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-gray-400">Select a complaint to view details</p>
            </div>
          ) : (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 h-full overflow-y-auto relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center glass rounded-full text-white text-lg z-10 hover:bg-white/20 transition-all">&times;</button>
              
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium mb-6 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl w-fit transition-all">
                <ArrowLeft size={16} /> Back to List
              </button>

              <div className="flex items-start justify-between gap-4 mb-6">
                <span className="text-4xl">{CAT_ICONS[selected.category]}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{selected.title}</h3>
                  <p className="text-gray-400 text-sm">{selected.description}</p>
                </div>
              </div>

              {(selected.imageUrl || selected.resolutionImageUrl) && (
                <div className={`grid gap-4 mb-6 ${selected.imageUrl && selected.resolutionImageUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {selected.imageUrl && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1 font-semibold">Before (Reported)</div>
                      <img src={selected.imageUrl} alt="Before" className="w-full h-40 object-cover rounded-xl border border-white/10" />
                    </div>
                  )}
                  {selected.resolutionImageUrl && (
                    <div>
                      <div className="text-xs text-green-500 mb-1 font-semibold">After (Resolved)</div>
                      <img src={selected.resolutionImageUrl} alt="After" className="w-full h-40 object-cover rounded-xl border border-white/10 border-green-500/30" />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="glass rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Priority</div>
                  <div className={`font-bold capitalize badge-${selected.priority}`}>{selected.priority}</div>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Department</div>
                  <div className="font-bold text-sm">{selected.department?.name || 'Pending'}</div>
                </div>
                <div className="glass rounded-xl p-3 cursor-pointer" onClick={() => selected.assignedOfficer && setProfileModalUser({ ...selected.assignedOfficer, role: 'officer' })}>
                  <div className="text-gray-500 text-xs mb-1">Officer</div>
                  <div className="font-bold text-sm text-primary underline decoration-primary/30 underline-offset-2">{selected.assignedOfficer?.name || 'Not assigned'}</div>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Est. Resolution</div>
                  <div className="font-bold">{selected.estimatedResolutionDays} days</div>
                </div>
              </div>

              {/* AI Summary */}
              {selected.aiSummary && (
                <div className="glass rounded-xl p-4 mb-6 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-2">🤖 AI Analysis</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{selected.aiSummary}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-bold mb-4">Status Timeline</h4>
                <div className="space-y-3">
                  {(selected.timeline || []).map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">{i + 1}</div>
                        {i < selected.timeline.length - 1 && <div className="w-0.5 flex-1 bg-white/10 my-1" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="font-medium text-sm capitalize">{t.status?.replace('_', ' ')}</div>
                        <div className="text-gray-400 text-xs">{t.note}</div>
                        <div className="text-gray-600 text-xs mt-0.5">{t.timestamp ? format(new Date(t.timestamp), 'dd MMM yyyy HH:mm') : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {profileModalUser && <ProfileModal user={profileModalUser} onClose={() => setProfileModalUser(null)} />}
      </AnimatePresence>
    </DashboardLayout>
  )
}
