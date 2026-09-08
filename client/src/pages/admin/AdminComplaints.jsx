import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, MapPin, Users, Search, ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useSocket } from '../../contexts/SocketContext'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import ProfileModal from '../../components/ui/ProfileModal'

const STATUS_ICONS = { pending: '⏳', assigned: '👮', in_progress: '🔧', resolved: '✅', rejected: '❌' }
const CAT_ICONS = { road: '🏗️', water: '💧', electricity: '⚡', garbage: '🗑️', health: '🏥', traffic: '🚦', other: '📋' }

export default function AdminComplaints() {
  const { socket } = useSocket()
  const [complaints, setComplaints] = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(queryParams.get('status') || 'all')
  const [priorityFilter, setPriorityFilter] = useState(queryParams.get('priority') || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [profileModalUser, setProfileModalUser] = useState(null)

  const fetchData = async () => {
    try {
      const [compRes, offRes] = await Promise.all([
        api.get('/complaints/admin/all', { params: { limit: 100 } }),
        api.get('/admin/officers')
      ])
      setComplaints(compRes.data.complaints || [])
      setOfficers(offRes.data || [])
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!socket) return
    const handleEvent = () => fetchData()
    socket.on('new_complaint', handleEvent)
    socket.on('complaint_updated', handleEvent)
    return () => {
      socket.off('new_complaint', handleEvent)
      socket.off('complaint_updated', handleEvent)
    }
  }, [socket])

  const assignOfficer = async (complaintId) => {
    if (!selectedOfficer) {
      toast.error('Please select an officer first');
      return;
    }
    setAssigning(true)
    try {
      await api.patch(`/complaints/${complaintId}/assign`, { officerId: selectedOfficer })
      toast.success('Officer assigned successfully!')
      fetchData()
      setSelected(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  const filtered = complaints.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchPriority && matchSearch
  })

  return (
    <DashboardLayout title="Manage Complaints">
      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex gap-4 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} 
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none cursor-pointer">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white focus:outline-none cursor-pointer">
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search complaints..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-center text-slate-400 py-12">Loading tickets...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-400 py-12">No complaints found</div>
          ) : (
            filtered.map((c, i) => (
              <motion.button key={c._id} onClick={() => setSelected(c)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`w-full bg-white dark:bg-slate-900 border rounded-2xl p-4 text-left hover:border-indigo-500/50 hover:shadow-lg transition-all ${selected?._id === c._id ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{CAT_ICONS[c.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-slate-900 dark:text-white">{c.title}</div>
                    <div className="text-slate-400 text-xs">{c.createdAt ? format(new Date(c.createdAt), 'dd MMM yy') : ''}</div>
                  </div>
                  <span className="text-xl">{STATUS_ICONS[c.status]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase">{c.priority}</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">{c.status?.replace('_', ' ')}</span>
                  {c.isFakeFlagged && (
                    <span className="ml-auto text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ShieldAlert size={10} /> Flagged
                    </span>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Detail */}
        <div className={`lg:col-span-2 ${selected ? 'fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 p-6 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:p-0 lg:max-h-none lg:rounded-none lg:border-none lg:shadow-none' : 'hidden lg:block'}`}>
          {!selected ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-5xl mb-4 text-slate-400">👈</div>
              <p className="text-slate-400">Select a complaint to view and assign officers</p>
            </div>
          ) : (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">&times;</button>
              
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-6">
                <ArrowLeft size={16} /> Back to List
              </button>

              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex gap-4">
                  <span className="text-4xl">{CAT_ICONS[selected.category]}</span>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{selected.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                      <MapPin size={14}/> {selected.location?.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-slate-400 text-xs mb-1">Status</div>
                   <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs uppercase">{selected.status?.replace('_', ' ')}</div>
                </div>
              </div>

              {/* Authenticity Badge */}
              <div className={`p-4 rounded-2xl mb-6 border flex items-center gap-3 ${selected.isFakeFlagged ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'}`}>
                {selected.isFakeFlagged ? (
                  <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selected.isFakeFlagged ? 'Flagged by AI (Potential Spam/Fake)' : 'AI Authenticity Verified'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Authenticity Score: {selected.authenticityScore || 90}/100 — {selected.authenticityReason || 'Genuine report pattern'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 mb-6">
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{selected.description}</p>
              </div>

              {(selected.imageUrl || selected.resolutionImageUrl) && (
                <div className={`grid gap-4 mb-6 ${selected.imageUrl && selected.resolutionImageUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {selected.imageUrl && (
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Before (Citizen Upload)</div>
                      <img src={selected.imageUrl} alt="Before" className="w-full h-40 object-cover rounded-2xl border border-slate-200 dark:border-slate-800" />
                    </div>
                  )}
                  {selected.resolutionImageUrl && (
                    <div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 font-semibold">After (Officer Resolution Proof)</div>
                      <img src={selected.resolutionImageUrl} alt="After" className="w-full h-40 object-cover rounded-2xl border border-emerald-500/50" />
                    </div>
                  )}
                </div>
              )}

              {/* Assignment Section */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-5 mb-6 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Users size={18} className="text-indigo-600 dark:text-indigo-400"/> Assign Municipal Officer
                </h4>
                
                {selected.assignedOfficer ? (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl mb-3 border border-slate-200 dark:border-slate-800 cursor-pointer" onClick={() => setProfileModalUser({ ...selected.assignedOfficer, role: 'officer' })}>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{selected.assignedOfficer.name}</div>
                      <div className="text-xs text-slate-400">Currently Assigned</div>
                    </div>
                    <CheckCircle size={20} className="text-emerald-500" />
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <select 
                    value={selectedOfficer} 
                    onChange={e => setSelectedOfficer(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">-- Select an Officer --</option>
                    {officers.map(o => (
                      <option key={o._id} value={o._id}>
                        {o.name} ({o.department?.name || 'No Dept'}) - {o.assigned} assigned
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => assignOfficer(selected._id)} 
                    disabled={assigning || !selectedOfficer || selectedOfficer === selected.assignedOfficer?._id}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg transition disabled:opacity-50"
                  >
                    {assigning ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Status Timeline</h4>
                <div className="space-y-3">
                  {(selected.timeline || []).map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">{i + 1}</div>
                        {i < selected.timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-1" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="font-semibold text-sm capitalize text-slate-900 dark:text-white">{t.status?.replace('_', ' ')}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">{t.note}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{t.timestamp ? format(new Date(t.timestamp), 'dd MMM yyyy HH:mm') : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {profileModalUser && (
        <ProfileModal user={profileModalUser} onClose={() => setProfileModalUser(null)} />
      )}
    </DashboardLayout>
  )
}

