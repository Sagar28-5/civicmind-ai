import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import {
  Brain, MapPin, Shield, Zap, BarChart3, Users,
  ArrowRight, Star, CheckCircle, Globe, Cpu, TrendingUp
} from 'lucide-react'

const NAV_LINKS = ['Features', 'Analytics', 'Security', 'About']

const STATS = [
  { value: 1547, label: 'Complaints Resolved', suffix: '+' },
  { value: 94, label: 'AI Accuracy', suffix: '%' },
  { value: 18, label: 'Avg Routing Time', suffix: 's' },
  { value: 82, label: 'Citizen Satisfaction', suffix: '%' },
]

const FEATURES = [
  { icon: Brain, title: 'AI Complaint Analysis', desc: 'Gemini AI classifies, prioritizes, and routes every complaint instantly — no human intervention needed.', color: 'from-blue-500 to-cyan-500' },
  { icon: MapPin, title: 'Live City Heatmap', desc: 'Interactive map shows complaint hotspots in real time. Identify problem areas before they escalate.', color: 'from-purple-500 to-pink-500' },
  { icon: TrendingUp, title: 'Predictive Analytics', desc: 'AI forecasts upcoming city issues 7 days in advance using historical patterns and environmental data.', color: 'from-orange-500 to-red-500' },
  { icon: Zap, title: 'Instant Officer Routing', desc: 'Complaints are automatically assigned to the right department and officer in under 18 seconds.', color: 'from-green-500 to-teal-500' },
  { icon: Shield, title: 'Enterprise Security', desc: 'JWT auth, RBAC, audit logs, rate limiting — built with the same security standards as government systems.', color: 'from-indigo-500 to-purple-500' },
  { icon: BarChart3, title: 'Command Dashboard', desc: "Real-time KPIs, charts, and AI insights give administrators a complete view of their city's health.", color: 'from-cyan-500 to-blue-500' },
]

const WORKFLOW = [
  { step: '01', title: 'Citizen Reports', desc: 'Text, voice, or image complaint', icon: '📱' },
  { step: '02', title: 'AI Analyzes', desc: 'Gemini classifies & prioritizes', icon: '🤖' },
  { step: '03', title: 'Auto-Routes', desc: 'Sent to right department & officer', icon: '⚡' },
  { step: '04', title: 'Resolved', desc: 'Tracked with real-time updates', icon: '✅' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Landing() {
  return (
    <div className="min-h-screen hero-bg">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CivicMind AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.15 } } }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Live System — 94% AI Accuracy</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Government That{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Thinks First
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              CivicMind AI automatically classifies, prioritizes, routes and resolves citizen complaints using advanced AI — before problems escalate.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary flex items-center gap-2 justify-center text-base">
                Report a Complaint <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary flex items-center gap-2 justify-center text-base">
                Sign In <Cpu size={18} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {STATS.map((s, i) => (
              <div key={i} className="stat-card text-center glow-blue">
                <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  <CountUp end={s.value} duration={2.5} suffix={s.suffix} />
                </div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How CivicMind Works</h2>
            <p className="text-gray-400 text-lg">From complaint to resolution in minutes, not weeks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {WORKFLOW.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 text-center relative"
              >
                <div className="text-5xl mb-4">{w.icon}</div>
                <div className="text-blue-400 text-xs font-bold mb-2">STEP {w.step}</div>
                <div className="font-bold text-lg mb-2">{w.title}</div>
                <div className="text-gray-400 text-sm">{w.desc}</div>
                {i < 3 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={20} className="text-blue-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for the Future</h2>
            <p className="text-gray-400 text-lg">Every feature designed to make governance smarter</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card p-6 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${f.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-semibold mb-4">
                <Shield size={16} /> ENTERPRISE SECURITY
              </div>
              <h2 className="text-4xl font-bold mb-6">Security You Can Trust</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Built with the same security standards used in government systems. Every API call is authenticated, every action is logged.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {['JWT Authentication', 'Role-Based Access', 'Audit Logging', 'Rate Limiting', 'Input Validation', 'Encrypted Passwords'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-8">
              <div className="space-y-4">
                {[
                  { role: 'Citizen', perms: ['Submit Complaints', 'Track Status', 'AI Assistant'], color: 'text-green-400' },
                  { role: 'Officer', perms: ['View Assigned Tasks', 'Update Status', 'Field Reports'], color: 'text-blue-400' },
                  { role: 'Admin', perms: ['Full Command Center', 'AI Insights', 'Audit Logs', 'All Data'], color: 'text-purple-400' },
                ].map((r) => (
                  <div key={r.role} className="glass rounded-xl p-4">
                    <div className={`font-bold mb-2 ${r.color}`}>{r.role}</div>
                    <div className="flex flex-wrap gap-2">
                      {r.perms.map((p) => (
                        <span key={p} className="text-xs bg-white/5 px-2 py-1 rounded-md text-gray-300">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card p-12 glow-blue"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.15) 100%)' }}
          >
            <div className="text-5xl mb-6">🏙️</div>
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your City?</h2>
            <p className="text-gray-400 mb-8">Join thousands of citizens making their city smarter, one complaint at a time.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary flex items-center gap-2 justify-center">
                Start Now — It's Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary flex items-center gap-2 justify-center">
                Admin Login <Globe size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-blue-400" />
            <span className="font-bold text-gray-300">CivicMind AI</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 CivicMind AI. Built for Innovation Sprint Hackathon 2026.</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star size={14} className="text-yellow-400" /> PS-06: AI Public Service Automation
          </div>
        </div>
      </footer>
    </div>
  )
}
