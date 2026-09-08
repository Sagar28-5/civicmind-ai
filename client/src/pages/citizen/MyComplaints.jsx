import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, TrendingUp, AlertCircle, Calendar, MapPin, Building, Flag, ArrowLeft, ThumbsUp, ShieldCheck, Award } from 'lucide-react'

import DashboardLayout from '../../components/layout/DashboardLayout'
import ProfileModal from '../../components/ui/ProfileModal'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSocket } from '../../contexts/SocketContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_ICONS = { pending: '⏳', assigned: '👮', in_progress: '🔧', resolved: '✅', rejected: '❌' }
const CAT_ICONS = { road: '🏗️', water: '💧', electricity: '⚡', garbage: '🗑️', health: '🏥', traffic: '🚦', other: '📋' }

export default function MyComplaints() {
  const { t } = useLanguage()
  const { socket } = useSocket()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const [filter, setFilter] = useState(queryParams.get('status') || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [profileModalUser, setProfileModalUser] = useState(null)

  const fetchComplaints = () => {
    api.get('/complaints/my').then(r => setComplaints(r.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  useEffect(() => {
    if (!socket) return
    const handleUpdate = (data) => {
      fetchComplaints()
      if (selected?._id === data._id) {
        setSelected(data)
      }
    }
    socket.on('complaint_updated', handleUpdate)
    return () => socket.off('complaint_updated', handleUpdate)
  }, [socket, selected])

  const handleUpvote = async (complaintId, e) => {
    e.stopPropagation()
    try {
      const { data } = await api.post(`/complaints/${complaintId}/upvote`)
      toast.success(data.isUpvoted ? 'Issue Upvoted! Priority score boosted.' : 'Upvote removed', { icon: '👍' })
      fetchComplaints()
      if (selected?._id === complaintId) {
        setSelected(prev => ({ ...prev, upvoteCount: data.upvoteCount, priorityScore: data.priorityScore }))
      }
    } catch (err) {
      toast.error('Failed to upvote')
    }
  }

  const filtered = complaints.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <DashboardLayout title={t('myComplaints')}>
      <div className="flex gap-4 mb-6 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'assigned', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-500'}`}>
              {s === 'all' ? `All (${complaints.length})` : `${s.replace('_', ' ')} (${complaints.filter(c => c.status === s).length})`}
            </button>
          ))}
        </div>
        <input 
          type="text" 
          placeholder="Search my complaints..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none w-full md:w-64"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="text-center text-slate-400 py-12">Loading tickets...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-400 py-12">No complaints found</div>
          ) : (
            filtered.map((c, i) => (
              <motion.div key={c._id} onClick={() => setSelected(c)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`w-full bg-white dark:bg-slate-900 border rounded-2xl p-4 text-left hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer ${selected?._id === c._id ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{CAT_ICONS[c.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-slate-900 dark:text-white">{c.title}</div>
                    <div className="text-slate-400 text-xs">{c.createdAt ? format(new Date(c.createdAt), 'dd MMM yyyy') : ''}</div>
                  </div>
                  <span className="text-xl">{STATUS_ICONS[c.status]}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase">{c.priority}</span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">{c.status?.replace('_', ' ')}</span>
                  </div>

                  <button
                    onClick={(e) => handleUpvote(c._id, e)}
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:scale-105 transition"
                  >
                    <ThumbsUp size={12} />
                    {c.upvoteCount || 0}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className={`lg:col-span-2 ${selected ? 'fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 p-6 max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:p-0 lg:max-h-none lg:rounded-none lg:border-none lg:shadow-none' : 'hidden lg:block'}`}>
          {!selected ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-slate-400">Select a complaint to view details and resolution proof</p>
            </div>
          ) : (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition">&times;</button>
              
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mb-6">
                <ArrowLeft size={16} /> Back to List
              </button>

              <div className="flex items-start justify-between gap-4 mb-6">
                <span className="text-4xl">{CAT_ICONS[selected.category]}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{selected.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{selected.description}</p>
                </div>
              </div>

              {/* Side-by-Side Resolution Proof ("Before & After") */}
              <div className="mb-6 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {t('resolutionProof')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">{t('beforePhoto')}</span>
                    {selected.imageUrl ? (
                      <img src={selected.imageUrl} alt="Before" className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm" />
                    ) : (
                      <div className="w-full h-44 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs text-slate-400">No original photo uploaded</div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-1.5">{t('afterPhoto')}</span>
                    {selected.resolutionImageUrl ? (
                      <img src={selected.resolutionImageUrl} alt="After Fix" className="w-full h-44 object-cover rounded-2xl border border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20" />
                    ) : (
                      <div className="w-full h-44 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col items-center justify-center p-4 text-center">
                        <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2 opacity-60" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Resolution in progress</span>
                        <span className="text-[11px] text-slate-400 mt-1">Officer will upload photo evidence upon completion</span>
                      </div>
                    )}
                  </div>
                </div>

                {selected.resolutionVerificationScore > 0 && (
                  <div className="mt-4 p-3 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">{t('aiResolutionVerification')}: {selected.resolutionVerificationScore}% Accuracy</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">{selected.resolutionVerificationNotes}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3">
                  <div className="text-slate-400 text-xs mb-1">Priority Score</div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">{selected.priorityScore}/100</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3">
                  <div className="text-slate-400 text-xs mb-1">Department</div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{selected.department?.name || 'Pending'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 cursor-pointer" onClick={() => selected.assignedOfficer && setProfileModalUser({ ...selected.assignedOfficer, role: 'officer' })}>
                  <div className="text-slate-400 text-xs mb-1">Assigned Officer</div>
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 underline truncate">{selected.assignedOfficer?.name || 'Unassigned'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3">
                  <div className="text-slate-400 text-xs mb-1">SLA Target</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selected.estimatedResolutionDays} days</div>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Status Timeline & Logs</h4>
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
      
      <AnimatePresence>
        {profileModalUser && <ProfileModal user={profileModalUser} onClose={() => setProfileModalUser(null)} />}
      </AnimatePresence>
    </DashboardLayout>
  )
}
