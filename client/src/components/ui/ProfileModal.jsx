import { motion } from 'framer-motion'
import { X, Mail, Phone, MapPin, Shield, Star, Award, Fingerprint } from 'lucide-react'

const ROLE_COLORS = { citizen: 'from-green-500 to-teal-500', officer: 'from-blue-500 to-cyan-500', admin: 'from-purple-500 to-pink-500' }
const ROLE_BADGES = { citizen: '👤 Citizen', officer: '👮 Officer', admin: '⚙️ Admin' }

export default function ProfileModal({ user, onClose }) {
  if (!user) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md cyber-card rounded-3xl overflow-hidden relative">
        
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px] pointer-events-none" />
        
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center glass rounded-full text-white text-lg z-50 hover:bg-white/20 transition-all cursor-pointer">&times;</button>
        
        <div className="p-8 text-center relative z-10">
          <div className="relative inline-block mb-6">
            <div className={`w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br ${ROLE_COLORS[user.role] || 'from-gray-500 to-gray-700'} p-1 neon-border`}>
              <div className="w-full h-full bg-navy rounded-2xl flex items-center justify-center text-4xl font-black text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-navy flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.6)]">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1 glow-text">{user.name}</h2>
          <div className="text-cyan-400 font-medium mb-6 uppercase tracking-widest text-xs">{ROLE_BADGES[user.role]}</div>

          <div className="space-y-3 text-left">
            <div className="glass p-4 rounded-2xl flex items-center gap-4 hover:border-cyan-500/30 transition-all">
              <Mail size={18} className="text-cyan-400" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-0.5">Contact Email</div>
                <div className="font-medium truncate">{user.email}</div>
              </div>
            </div>
            
            {(user.phone || user.role !== 'admin') && (
              <div className="glass p-4 rounded-2xl flex items-center gap-4 hover:border-cyan-500/30 transition-all">
                <Phone size={18} className="text-cyan-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">Secure Line</div>
                  <div className="font-medium truncate">{user.phone || '+1 (555) 019-283'}</div>
                </div>
              </div>
            )}

            <div className="glass p-4 rounded-2xl flex items-center gap-4 hover:border-cyan-500/30 transition-all">
              <Fingerprint size={18} className="text-cyan-400" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-0.5">System ID</div>
                <div className="font-mono text-xs truncate text-gray-300">{user._id || 'SYS-XXX-999'}</div>
              </div>
            </div>
          </div>
          
          {user.role === 'citizen' && (
            <div className="mt-6 flex gap-4">
              <div className="flex-1 glass p-3 rounded-2xl text-center">
                <Star size={16} className="text-yellow-400 mx-auto mb-1" />
                <div className="text-lg font-bold">{user.rewardPoints || 0}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Points</div>
              </div>
              <div className="flex-1 glass p-3 rounded-2xl text-center">
                <Award size={16} className="text-purple-400 mx-auto mb-1" />
                <div className="text-sm font-bold truncate">{user.badge || 'Newbie'}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Rank</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
