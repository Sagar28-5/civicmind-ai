import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../services/api'
import { format } from 'date-fns'

const STATUS_ICONS = { pending: '⏳', assigned: '👮', in_progress: '🔧', resolved: '✅', rejected: '❌' }
const CAT_ICONS = { road: '🏗️', water: '💧', electricity: '⚡', garbage: '🗑️', health: '🏥', traffic: '🚦', other: '📋' }

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/complaints/my').then(r => setComplaints(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter)

  return (
    <DashboardLayout title="My Complaints">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'assigned', 'in_progress', 'resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === s ? 'bg-primary text-white' : 'glass text-gray-400 hover:text-white'}`}>
            {s === 'all' ? `All (${complaints.length})` : `${s.replace('_', ' ')} (${complaints.filter(c => c.status === s).length})`}
          </button>
        ))}
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
                className={`w-full card p-4 text-left hover:border-primary/40 transition-all ${selected?._id === c._id ? 'border-primary bg-primary/5' : ''}`}>
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
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-gray-400">Select a complaint to view details</p>
            </div>
          ) : (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-4xl">{CAT_ICONS[selected.category]}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{selected.title}</h3>
                  <p className="text-gray-400 text-sm">{selected.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="glass rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Priority</div>
                  <div className={`font-bold capitalize badge-${selected.priority}`}>{selected.priority}</div>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Department</div>
                  <div className="font-bold text-sm">{selected.department?.name || 'Pending'}</div>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Officer</div>
                  <div className="font-bold text-sm">{selected.assignedOfficer?.name || 'Not assigned'}</div>
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
    </DashboardLayout>
  )
}
