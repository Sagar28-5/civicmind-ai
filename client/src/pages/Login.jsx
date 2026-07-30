import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { label: '👤 Citizen Demo', email: 'citizen@demo.com' },
  { label: '👮 Officer Demo', email: 'officer@demo.com' },
  { label: '⚙️ Admin Demo', email: 'admin@demo.com' },
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(`/${user.role}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  const quickLogin = (email) => setForm({ email, password: 'Demo@123' })

  return (
    <div className="min-h-screen hero-bg flex">
      {/* Left Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-md"
        >
          <div className="text-8xl mb-8 animate-float">🏙️</div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CivicMind AI
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            The AI Operating System for Smart City Governance. Every complaint. Every citizen. Every solution.
          </p>
          <div className="mt-10 space-y-3">
            {['AI-powered classification', 'Real-time officer routing', 'Predictive city analytics', 'Enterprise-grade security'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Login Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">Welcome Back</div>
                <div className="text-gray-400 text-sm">Sign in to CivicMind AI</div>
              </div>
            </div>

            {/* Quick Demo Buttons */}
            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Quick Demo Access</div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    onClick={() => quickLogin(a.email)}
                    className="text-xs glass hover:bg-white/10 px-2 py-2 rounded-lg transition-all text-gray-300 hover:text-white"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500">or login manually</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Register here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
