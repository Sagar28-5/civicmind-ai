import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, FileText, Download } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../services/api'
import { format } from 'date-fns'

export default function AIInsights() {
  const [logs, setLogs] = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [logsRes, offRes] = await Promise.all([
          api.get('/admin/audit'),
          api.get('/admin/officers'),
        ])
        setLogs(logsRes.data)
        setOfficers(offRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const ACTION_COLORS = {
    LOGIN: 'text-green-400', REGISTER: 'text-blue-400',
    CREATE_COMPLAINT: 'text-yellow-400', UPDATE_STATUS: 'text-purple-400',
    ASSIGN_OFFICER: 'text-cyan-400', DEFAULT: 'text-gray-400'
  }

  return (
    <DashboardLayout title="Security & Insights">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Officer Leaderboard */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-lg">Officer Leaderboard</span>
          </div>
          <div className="space-y-3">
            {officers.sort((a, b) => b.resolved - a.resolved).map((o, i) => (
              <motion.div key={o._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 glass rounded-xl p-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-white/10'}`}>
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                  {o.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{o.name}</div>
                  <div className="text-gray-400 text-xs">{o.department?.name || 'General'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">{o.resolved}</div>
                  <div className="text-gray-500 text-xs">resolved</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400">{o.assigned}</div>
                  <div className="text-gray-500 text-xs">assigned</div>
                </div>
              </motion.div>
            ))}
            {officers.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-8">No officer data</p>
            )}
          </div>
        </div>

        {/* Audit Log */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-blue-400" />
            <span className="font-bold text-lg">Security Audit Log</span>
            <span className="ml-auto text-xs text-gray-500 glass px-2 py-1 rounded-lg">{logs.length} entries</span>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {logs.map((log, i) => (
              <motion.div key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 glass rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-xs ${ACTION_COLORS[log.action] || ACTION_COLORS.DEFAULT}`}>{log.action}</span>
                    <span className="text-gray-500 text-xs">·</span>
                    <span className="text-gray-400 text-xs truncate">{log.userEmail}</span>
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {log.resource} {log.resourceId ? `#${String(log.resourceId).slice(-6)}` : ''}
                  </div>
                </div>
                <div className="text-gray-600 text-xs flex-shrink-0">
                  {log.timestamp ? format(new Date(log.timestamp), 'HH:mm') : ''}
                </div>
              </motion.div>
            ))}
            {logs.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-8">No audit logs found</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
