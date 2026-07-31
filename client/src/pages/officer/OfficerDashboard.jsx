import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, MapPin } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const COLUMNS = [
  { id: 'pending', label: 'Pending', icon: '⏳', color: 'border-yellow-500/30' },
  { id: 'assigned', label: 'Assigned', icon: '👮', color: 'border-blue-500/30' },
  { id: 'in_progress', label: 'In Progress', icon: '🔧', color: 'border-purple-500/30' },
  { id: 'resolved', label: 'Resolved', icon: '✅', color: 'border-green-500/30' },
]

const CAT_ICONS = { road: '🏗️', water: '💧', electricity: '⚡', garbage: '🗑️', health: '🏥', traffic: '🚦', other: '📋' }

const NEXT_STATUS = { pending: 'assigned', assigned: 'in_progress', in_progress: 'resolved' }
const NEXT_LABELS = { pending: 'Accept Task', assigned: 'Start Work', in_progress: 'Mark Resolved' }

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [note, setNote] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [image, setImage] = useState(null)

  const fetch = async () => {
    try {
      const { data } = await api.get('/complaints/officer/assigned')
      setComplaints(data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const updateStatus = async (complaint) => {
    const next = NEXT_STATUS[complaint.status]
    if (!next) return
    setUpdating(true)
    try {
      let payload = { status: next, note: note || `Status updated to ${next}` }
      if (next === 'resolved') payload.resolutionNote = note

      if (image) {
        const formData = new FormData()
        Object.entries(payload).forEach(([k, v]) => formData.append(k, v))
        formData.append('image', image)
        payload = formData
      }

      await api.patch(`/complaints/${complaint._id}/status`, payload)
      toast.success(`Complaint marked as ${next}!`)
      setNote('')
      setImage(null)
      setSelected(null)
      fetch()
    } catch { toast.error('Update failed') }
    finally { setUpdating(false) }
  }

  const byStatus = (status) => complaints.filter(c => 
    c.status === status && (filterPriority === 'all' || c.priority === filterPriority)
  )

  const stats = {
    total: complaints.length,
    critical: complaints.filter(c => c.priority === 'critical').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <DashboardLayout title="Officer Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="text-3xl font-black text-blue-400">{stats.total}</div>
          <div className="text-gray-500 text-sm">Assigned Tasks</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-black text-red-400">{stats.critical}</div>
          <div className="text-gray-500 text-sm">Critical</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl font-black text-green-400">{stats.resolved}</div>
          <div className="text-gray-500 text-sm">Resolved</div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary focus:outline-none">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-20">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className={`card border ${col.color} flex flex-col min-h-[400px]`}>
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <span>{col.icon}</span>
                <span className="font-semibold text-sm">{col.label}</span>
                <span className="ml-auto text-xs glass px-2 py-0.5 rounded-full">{byStatus(col.id).length}</span>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {byStatus(col.id).length === 0 && (
                  <p className="text-gray-600 text-sm text-center pt-8">Empty</p>
                )}
                {byStatus(col.id).map((c, i) => (
                  <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(c)}
                    className={`glass rounded-xl p-3 cursor-pointer hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg transition-all ${selected?._id === c._id ? 'border-primary bg-primary/10' : ''}`}>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{CAT_ICONS[c.category]}</span>
                      <span className={`badge badge-${c.priority} text-xs`}>{c.priority}</span>
                    </div>
                    <div className="font-medium text-sm leading-snug mb-1 line-clamp-2">{c.title}</div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <MapPin size={10} /> {c.location?.address?.substring(0, 25) || 'No location'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/10 p-6 max-h-[50vh] overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{CAT_ICONS[selected.category]}</span>
                <div>
                  <h3 className="font-bold">{selected.title}</h3>
                  <p className="text-gray-400 text-sm">{selected.citizen?.name} · {selected.location?.address}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{selected.description}</p>
            {selected.aiSummary && (
              <div className="glass rounded-xl p-3 mb-4 text-sm text-gray-300">
                <span className="text-blue-400 font-semibold">AI: </span>{selected.aiSummary}
              </div>
            )}
            {selected.imageUrl && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Attached Image</div>
                <img src={selected.imageUrl} alt="Complaint Attachment" className="w-full max-h-64 object-cover rounded-xl border border-white/10" />
              </div>
            )}
            {NEXT_STATUS[selected.status] && (
              <div className="space-y-4">
                {NEXT_STATUS[selected.status] === 'resolved' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Upload Resolution Photo (Optional)</label>
                    <input type="file" onChange={e => setImage(e.target.files[0])} accept="image/*" 
                      className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600" />
                  </div>
                )}
                <div className="flex gap-3">
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary" />
                  <button onClick={() => updateStatus(selected)} disabled={updating}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap">
                    <CheckCircle size={16} /> {updating ? 'Updating...' : NEXT_LABELS[selected.status]}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  )
}
