import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, MapPin, Upload, Mic, Brain, Send } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'road', label: 'Road Damage', icon: '🏗️', desc: 'Potholes, broken roads, dividers' },
  { id: 'water', label: 'Water Issue', icon: '💧', desc: 'Supply, leaks, drainage' },
  { id: 'electricity', label: 'Electricity', icon: '⚡', desc: 'Power cuts, street lights' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️', desc: 'Waste collection, illegal dumping' },
  { id: 'health', label: 'Health', icon: '🏥', desc: 'Sanitation, mosquitoes' },
  { id: 'traffic', label: 'Traffic', icon: '🚦', desc: 'Signals, congestion, safety' },
  { id: 'other', label: 'Other', icon: '📋', desc: 'Any other civic issue' },
]

const AI_STEPS = [
  { icon: '🔍', label: 'Scanning input...' },
  { icon: '🤖', label: 'Classifying issue...' },
  { icon: '🏛️', label: 'Finding department...' },
  { icon: '🔄', label: 'Checking for duplicates...' },
  { icon: '⚡', label: 'Calculating priority...' },
  { icon: '✅', label: 'Analysis complete!' },
]

export default function NewComplaint() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ category: '', description: '', address: '', lat: '', lng: '', image: null })
  const [aiResult, setAiResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiStep, setAiStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [listening, setListening] = useState(false)
  const [preview, setPreview] = useState(null)
  
  const { state } = useLocation()

  useEffect(() => {
    if (state?.voiceText && !form.description) {
      setForm(f => ({ ...f, description: state.voiceText }))
      setStep(2)
      toast.success('Voice complaint captured!')
    }
  }, [state])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, image: file })
      setPreview(URL.createObjectURL(file))
    }
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return toast.error('Speech recognition not supported in this browser')
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'en-IN'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript
      setForm(f => ({ ...f, description: f.description ? `${f.description} ${text}` : text }))
      toast.success('Voice captured!')
    }
    recognition.start()
  }

  const analyzeWithAI = async () => {
    if (!form.description) return toast.error('Please describe the issue')
    setAnalyzing(true)
    setAiStep(0)
    setStep(3)

    // Animate AI steps
    for (let i = 0; i < AI_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      setAiStep(i + 1)
    }

    try {
      const { data } = await api.post('/ai/analyze', { text: form.description, imageDesc: preview ? 'Image uploaded by user' : '' })
      setAiResult(data)
    } catch {
      toast.error('AI analysis failed, using defaults')
      setAiResult({ category: form.category || 'other', priority: 'medium', priorityScore: 50, department: 'Municipal Corporation', summary: form.description, estimatedResolutionDays: 3, suggestedTitle: form.description.substring(0, 60) })
    } finally {
      setAnalyzing(false)
    }
  }

  const submitComplaint = async () => {
    setSubmitting(true)
    try {
      const fd = new FormData()
      if (form.image) fd.append('image', form.image)
      fd.append('description', form.description)
      fd.append('title', aiResult?.suggestedTitle || form.description.substring(0, 60))
      fd.append('category', aiResult?.category || form.category || 'other')
      fd.append('priority', aiResult?.priority || 'medium')
      fd.append('priorityScore', aiResult?.priorityScore || 50)
      fd.append('urgencyReason', aiResult?.urgencyReason || '')
      fd.append('aiSummary', aiResult?.summary || form.description)
      fd.append('aiKeywords', JSON.stringify(aiResult?.keywords || []))
      fd.append('sentimentScore', aiResult?.sentiment || 'neutral')
      fd.append('address', form.address)
      fd.append('lat', form.lat || '12.9716')
      fd.append('lng', form.lng || '77.5946')
      fd.append('departmentName', aiResult?.department || 'Municipal Corporation')
      fd.append('estimatedResolutionDays', aiResult?.estimatedResolutionDays || 3)
      fd.append('suggestedTitle', aiResult?.suggestedTitle || '')

      await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStep(5)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const PRIORITY_COLORS = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' }

  return (
    <DashboardLayout title="File New Complaint">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-white/10'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Category */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <h2 className="text-2xl font-bold mb-2">What type of issue?</h2>
            <p className="text-gray-400 mb-6">Select the category that best describes the problem</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => { setForm({ ...form, category: cat.id }); setStep(2) }}
                  className={`card p-5 text-left hover:border-primary/50 transition-all group hover:-translate-y-1 ${form.category === cat.id ? 'border-primary bg-primary/10' : ''}`}>
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <div className="font-bold mb-1">{cat.label}</div>
                  <div className="text-gray-400 text-sm">{cat.desc}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Description + Image + Location */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Describe the issue</h2>
            <p className="text-gray-400 mb-6">The more detail you provide, the better AI can prioritize it</p>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400 font-medium">Description *</label>
                  <button onClick={startVoice} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${listening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'glass text-gray-400 hover:text-white'}`}>
                    <Mic size={14} /> {listening ? 'Listening...' : 'Voice Input'}
                  </button>
                </div>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the problem in detail. What happened? Where? How severe?"
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none" />
              </div>

              {/* Image */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Upload Image (optional)</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                      <div className="absolute top-2 right-2 glass px-2 py-1 rounded-lg text-xs text-green-400">✓ Image selected</div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer">
                      <Upload size={28} className="mx-auto text-gray-600 mb-2" />
                      <p className="text-gray-400 text-sm">Click to upload or drag image here</p>
                      <p className="text-gray-600 text-xs mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 flex items-center gap-1"><MapPin size={14} /> Location</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. MG Road, near bus stop, Bengaluru"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                <button onClick={analyzeWithAI} disabled={!form.description} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Brain size={16} /> Analyze with AI <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: AI Analysis Animation */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">CivicMind AI is analyzing...</h2>
            <p className="text-gray-400 mb-10">Our AI is processing your complaint</p>

            <div className="space-y-4 mb-10">
              {AI_STEPS.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: aiStep > i ? 1 : 0.3, x: 0 }}
                  className={`flex items-center gap-4 glass rounded-xl p-4 transition-all ${aiStep > i ? 'border border-primary/30' : ''}`}>
                  <span className="text-2xl">{s.icon}</span>
                  <span className={`font-medium ${aiStep > i ? 'text-white' : 'text-gray-600'}`}>{s.label}</span>
                  {aiStep > i && <CheckCircle size={18} className="text-green-400 ml-auto" />}
                  {aiStep === i + 1 && analyzing && (
                    <div className="ml-auto flex gap-1">
                      {[0, 1, 2].map(j => <div key={j} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.1}s` }} />)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {!analyzing && aiResult && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                onClick={() => setStep(4)} className="btn-primary flex items-center gap-2 mx-auto">
                View Results <ArrowRight size={16} />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Step 4: AI Results + Confirm */}
        {step === 4 && aiResult && (
          <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Analysis Complete</h2>
                <p className="text-gray-400 text-sm">Review before submitting</p>
              </div>
            </div>

            <div className="card p-6 mb-6 border-primary/20 border">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="glass rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Category</div>
                  <div className="font-bold capitalize">{aiResult.category}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Priority</div>
                  <div className={`font-bold capitalize ${PRIORITY_COLORS[aiResult.priority]}`}>{aiResult.priority}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Department</div>
                  <div className="font-bold text-sm">{aiResult.department}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Est. Resolution</div>
                  <div className="font-bold">{aiResult.estimatedResolutionDays} days</div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 mb-4">
                <div className="text-gray-400 text-xs mb-2">AI Priority Score</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${aiResult.priorityScore}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${aiResult.priorityScore > 70 ? 'bg-red-500' : aiResult.priorityScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    />
                  </div>
                  <span className="font-bold text-lg">{aiResult.priorityScore}/100</span>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="text-gray-400 text-xs mb-2">AI Summary</div>
                <p className="text-sm text-gray-200 leading-relaxed">{aiResult.summary}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2"><ArrowLeft size={16} /> Edit</button>
              <button onClick={submitComplaint} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {submitting ? 'Submitting...' : <><Send size={16} /> Submit Complaint</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-8xl mb-6">🎉</motion.div>
            <h2 className="text-3xl font-bold mb-3">Complaint Submitted!</h2>
            <p className="text-gray-400 mb-8">Your complaint has been AI-classified and routed to the right department. You'll receive updates as it progresses.</p>
            <div className="card p-6 mb-6 text-left">
              <div className="flex items-center gap-3 text-green-400 mb-2">
                <CheckCircle size={18} /> AI Classification: Complete
              </div>
              <div className="flex items-center gap-3 text-blue-400 mb-2">
                <CheckCircle size={18} /> Department Routed: {aiResult?.department}
              </div>
              <div className="flex items-center gap-3 text-purple-400">
                <CheckCircle size={18} /> Officer Assignment: In Progress
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/citizen')} className="btn-secondary">Back to Dashboard</button>
              <button onClick={() => navigate('/citizen/complaints')} className="btn-primary">Track Complaint</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
