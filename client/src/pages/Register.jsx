import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, User, Mail, Lock, Phone, MapPin, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'citizen', label: 'Citizen', icon: '👤', desc: 'Report issues, track progress' },
  { id: 'officer', label: 'Field Officer', icon: '👮', desc: 'Resolve assigned complaints' },
  { id: 'admin', label: 'Administrator', icon: '⚙️', desc: 'Full command center access' },
]

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', role: 'citizen', password: '', confirm: '' })
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    try {
      const user = await register({ name: form.name, email: form.email, phone: form.phone, location: form.location, role: form.role, password: form.password })
      toast.success('Account created successfully!')
      navigate(`/${user.role}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Choose Role' },
    { num: 3, label: 'Password' },
  ]

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Brain size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Join CivicMind AI</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account to get started</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 flex-1 ${i < steps.length - 1 ? 'mr-2' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > s.num ? 'bg-green-500' : step === s.num ? 'bg-primary' : 'bg-white/10'}`}>
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span className={`text-xs hidden sm:block ${step === s.num ? 'text-white font-medium' : 'text-gray-500'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${step > s.num ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="98765 43210" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">City</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Bengaluru, Karnataka" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <button onClick={() => setStep(2)} disabled={!form.name || !form.email} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-6">Choose Your Role</h2>
                <div className="space-y-3 mb-6">
                  {ROLES.map((r) => (
                    <button key={r.id} onClick={() => setForm({...form, role: r.id})}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${form.role === r.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}>
                      <span className="text-3xl">{r.icon}</span>
                      <div>
                        <div className="font-bold">{r.label}</div>
                        <div className="text-gray-400 text-sm">{r.desc}</div>
                      </div>
                      {form.role === r.id && <CheckCircle size={20} className="text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">Continue <ArrowRight size={16} /></button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold mb-6">Set Your Password</h2>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} placeholder="Repeat password" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {loading ? 'Creating...' : <><CheckCircle size={16} /> Create Account</>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
