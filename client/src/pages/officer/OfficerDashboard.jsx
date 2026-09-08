import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, MapPin, ShieldAlert, ShieldCheck, Camera, Upload } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useSocket } from '../../contexts/SocketContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const COLUMNS = [
  { id: 'pending', label: 'Pending', icon: '⏳', color: 'border-amber-500/30' },
  { id: 'assigned', label: 'Assigned', icon: '👮', color: 'border-blue-500/30' },
  { id: 'in_progress', label: 'In Progress', icon: '🔧', color: 'border-purple-500/30' },
  { id: 'resolved', label: 'Resolved', icon: '✅', color: 'border-emerald-500/30' },
]

const CAT_ICONS = { road: '🏗️', water: '💧', electricity: '⚡', garbage: '🗑️', health: '🏥', traffic: '🚦', other: '📋' }

const NEXT_STATUS = { pending: 'assigned', assigned: 'in_progress', in_progress: 'resolved' }
const NEXT_LABELS = { pending: 'Accept Task', assigned: 'Start Work', in_progress: 'Mark Resolved & Upload Proof' }

export default function OfficerDashboard() {
  const { socket } = useSocket()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [note, setNote] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [image, setImage] = useState(null)

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/complaints/officer/assigned')
      setComplaints(data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTasks() }, [])

  useEffect(() => {
    if (!socket) return
    const handleEvent = () => fetchTasks()
    socket.on('new_complaint', handleEvent)
    socket.on('complaint_assigned', handleEvent)
    socket.on('complaint_updated', handleEvent)
    return () => {
      socket.off('new_complaint', handleEvent)
      socket.off('complaint_assigned', handleEvent)
      socket.off('complaint_updated', handleEvent)
    }
  }, [socket])

  const updateStatus = async (complaint) => {
    const next = NEXT_STATUS[complaint.status]
    if (!next) return
    setUpdating(true)
    try {
      let payload
      if (image) {
        payload = new FormData()
        payload.append('status', next)
        payload.append('note', note || `Status updated to ${next}`)
        if (next === 'resolved') payload.append('resolutionNote', note || 'Work completed successfully')
        payload.append('image', image)
      } else {
        payload = {
          status: next,
          note: note || `Status updated to ${next}`,
          resolutionNote: next === 'resolved' ? (note || 'Work completed successfully') : undefined,
        }
      }

      await api.patch(`/complaints/${complaint._id}/status`, payload)
      toast.success(`Ticket status updated to ${next.replace('_', ' ')}!`, { icon: '✅' })
      setNote('')
      setImage(null)
      setSelected(null)
      fetchTasks()
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
    <DashboardLayout title="Officer Work Portal">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.total}</div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Assigned Tasks</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-3xl font-black text-rose-500">{stats.critical}</div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Critical Urgency</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-3xl font-black text-emerald-500">{stats.resolved}</div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Resolved</div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none cursor-pointer">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-20">Loading assigned tasks...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className={`bg-white dark:bg-slate-900 border ${col.color} rounded-2xl flex flex-col min-h-[400px] shadow-sm overflow-hidden`}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/40">
                <span>{col.icon}</span>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">{col.label}</span>
                <span className="ml-auto text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">{byStatus(col.id).length}</span>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {byStatus(col.id).length === 0 && (
                  <p className="text-slate-400 text-xs text-center pt-8">No tickets</p>
                )}
                {byStatus(col.id).map((c, i) => (
                  <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(c)}
                    className={`bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border cursor-pointer hover:border-indigo-500/50 hover:shadow-md transition ${selected?._id === c._id ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}`}>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{CAT_ICONS[c.category]}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">{c.priority}</span>
                      {c.isFakeFlagged && (
                        <span className="ml-auto flex items-center gap-0.5 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                          <ShieldAlert size={10} /> Flagged
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-sm leading-snug mb-1 line-clamp-2 text-slate-900 dark:text-white">{c.title}</div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <MapPin size={12} /> {c.location?.address?.substring(0, 25) || 'Location pinned'}
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
          className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 max-h-[60vh] overflow-y-auto shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{CAT_ICONS[selected.category]}</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{selected.title}</h3>
                  <p className="text-slate-400 text-xs">{selected.citizen?.name} · {selected.location?.address}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl">&times;</button>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 leading-relaxed">{selected.description}</p>

            {selected.imageUrl && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Original Citizen Photo ("Before")</div>
                <img src={selected.imageUrl} alt="Complaint Attachment" className="w-full max-h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-800" />
              </div>
            )}

            {NEXT_STATUS[selected.status] && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                {(NEXT_STATUS[selected.status] === 'resolved' || selected.status === 'in_progress') && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <Camera size={14} className="text-indigo-600 dark:text-indigo-400" /> Upload Resolution Photo Proof ("After")
                    </label>
                    <input
                      type="file"
                      onChange={e => setImage(e.target.files[0])}
                      accept="image/*" 
                      className="text-xs text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add work progress note or completion message..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => updateStatus(selected)}
                    disabled={updating}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg transition flex items-center gap-2 whitespace-nowrap"
                  >
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

