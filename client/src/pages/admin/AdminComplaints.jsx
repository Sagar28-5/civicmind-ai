import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, MapPin, Users, Search, ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import ProfileModal from '../../components/ui/ProfileModal'

const STATUS_ICONS = { pending: '⏳', assigned: '👮', in_progress: '🔧', resolved: '✅', rejected: '❌' }
const CAT_ICONS = { road: '🏗️', water: '💧', electricity: '⚡', garbage: '🗑️', health: '🏥', traffic: '🚦', other: '📋' }

export default function AdminComplaints() {
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
      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary focus:outline-none">
            <option value="all" className="bg-slate-900 text-white">All Statuses</option>
            <option value="pending" className="bg-slate-900 text-white">Pending</option>
            <option value="assigned" className="bg-slate-900 text-white">Assigned</option>
            <option value="in_progress" className="bg-slate-900 text-white">In Progress</option>
            <option value="resolved" className="bg-slate-900 text-white">Resolved</option>
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary focus:outline-none">
            <option value="all" className="bg-slate-900 text-white">All Priorities</option>
            <option value="critical" className="bg-slate-900 text-white">Critical</option>
            <option value="high" className="bg-slate-900 text-white">High</option>
            <option value="medium" className="bg-slate-900 text-white">Medium</option>
            <option value="low" className="bg-slate-900 text-white">Low</option>
          </select>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search complaints..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No complaints found</div>
          ) : (
            filtered.map((c, i) => (
              <motion.button key={c._id} onClick={() => setSelected(c)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`w-full card p-4 text-left hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all ${selected?._id === c._id ? 'border-primary bg-primary/10' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{CAT_ICONS[c.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{c.title}</div>
                    <div className="text-gray-500 text-xs">{c.createdAt ? format(new Date(c.createdAt), 'dd MMM yy') : ''}</div>
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
            <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="text-5xl mb-4 text-gray-600">👈</div>
              <p className="text-gray-400">Select a complaint to view and assign</p>
            </div>
          ) : (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 h-full overflow-y-auto relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center glass rounded-full text-white text-lg z-10 hover:bg-white/20 transition-all cursor-pointer">&times;</button>
              
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium mb-6 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl w-fit transition-all cursor-pointer">
                <ArrowLeft size={16} /> Back to List
              </button>

              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex gap-4">
                  <span className="text-4xl">{CAT_ICONS[selected.category]}</span>
                  <div>
                    <h3 className="font-bold text-xl mb-1">{selected.title}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin size={14}/> {selected.location?.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-gray-500 text-xs mb-1">Status</div>
                   <div className={`badge badge-${selected.status}`}>{selected.status?.replace('_', ' ')}</div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 mb-6">
                <p className="text-gray-300 text-sm leading-relaxed">{selected.description}</p>
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
                <div className="glass rounded-xl p-3 cursor-pointer group" onClick={() => selected.citizen && setProfileModalUser({ ...selected.citizen, role: 'citizen' })}>
                  <div className="text-gray-500 text-xs mb-1">Citizen</div>
                  <div className="font-bold text-sm group-hover:text-cyan-400 transition-colors underline decoration-white/20 underline-offset-2">{selected.citizen?.name}</div>
                  <div className="text-gray-500 text-xs">{selected.citizen?.email}</div>
                </div>
              </div>

              {/* Assignment Section */}
              <div className="card p-5 mb-6 border-blue-500/20 border bg-gradient-to-br from-blue-500/10 to-transparent">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Users size={18} className="text-blue-400"/> Assign Officer
                </h4>
                
                {selected.assignedOfficer ? (
                  <div className="flex items-center justify-between glass p-3 rounded-xl mb-3 border-green-500/20 cursor-pointer group" onClick={() => setProfileModalUser({ ...selected.assignedOfficer, role: 'officer' })}>
                    <div>
                      <div className="text-sm font-semibold group-hover:text-cyan-400 transition-colors underline decoration-white/20 underline-offset-2">{selected.assignedOfficer.name}</div>
                      <div className="text-xs text-gray-400">Currently Assigned</div>
                    </div>
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <select 
                    value={selectedOfficer} 
                    onChange={e => setSelectedOfficer(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  >
                    <option value="" className="bg-slate-900 text-white">-- Select an Officer --</option>
                    {officers.map(o => (
                      <option key={o._id} value={o._id} className="bg-slate-900 text-white">
                        {o.name} ({o.department?.name || 'No Dept'}) - {o.assigned} assigned
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => assignOfficer(selected._id)} 
                    disabled={assigning || !selectedOfficer || selectedOfficer === selected.assignedOfficer?._id}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {assigning ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>

              {/* AI Summary */}
              {selected.aiSummary && (
                <div className="glass rounded-xl p-4 mb-6 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-2">🤖 AI Analysis</div>
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
      
      {/* Profile Modal Overlay */}
      {profileModalUser && (
        <ProfileModal user={profileModalUser} onClose={() => setProfileModalUser(null)} />
      )}
    </DashboardLayout>
  )
}
