import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircleQuestion, X, Send, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'
const TAGS = ['llm', 'transformer', 'attention', 'tokenization', 'training', 'prompting', 'agents', 'embeddings', 'diffusion', 'safety', 'general']

/*
  FloatingDoubt — appears on every course page.
  Expands into a mini form to ask a quick question.
  Links to full community page for browsing.
  Props:
    - courseId: auto-tags the question with course
    - topicId: auto-tags with topic number
*/
export default function FloatingDoubt({ courseId, topicId }) {
  const navigate = useNavigate()
  const { token, isLoggedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState([])
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (t) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 5 ? [...prev, t] : prev)

  const submit = async () => {
    if (!title.trim() || !body.trim()) { setError('Title and details required'); return }
    if (!isLoggedIn) { navigate('/login'); return }
    setPosting(true)
    setError('')
    try {
      const res = await fetch(`${API}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, body, tags, courseId: courseId || '', topicId: topicId ?? null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosted(true)
      setTimeout(() => { setOpen(false); setPosted(false); setTitle(''); setBody(''); setTags([]) }, 2000)
    } catch (e) {
      setError(e.message)
    } finally { setPosting(false) }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed', bottom: 80, right: 28, zIndex: 900,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--gradient-primary)', color: 'white',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(79,70,229,0.4)',
        }}
      >
        {open ? <X size={22} /> : <MessageCircleQuestion size={22} />}
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: 'fixed', bottom: 148, right: 28, zIndex: 900,
              width: 380, maxHeight: '70vh', overflowY: 'auto',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 20, boxShadow: 'var(--shadow-lg)', padding: 24,
            }}
          >
            {posted ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>Question Posted!</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>The community will help you soon.</div>
              </motion.div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Ask a Doubt
                  </h3>
                  <button onClick={() => navigate('/community')} style={{
                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--accent)',
                    fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
                  }}>
                    Browse Q&A <ExternalLink size={12} />
                  </button>
                </div>

                {error && <div style={{ padding: 10, background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

                <div style={{ marginBottom: 12 }}>
                  <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200}
                    placeholder="What's your question?"
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{title.length}/200</div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={2500}
                    placeholder="Add details... (max ~500 words)"
                    style={{ width: '100%', minHeight: 80, padding: '10px 14px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}
                  />
                  <div style={{ textAlign: 'right', fontSize: 11, color: body.length > 2300 ? 'var(--danger)' : 'var(--text-muted)', marginTop: 2 }}>{body.length}/2500</div>
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                  {TAGS.slice(0, 8).map(t => (
                    <button key={t} onClick={() => toggleTag(t)}
                      style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${tags.includes(t) ? 'var(--accent)' : 'var(--border)'}`,
                        background: tags.includes(t) ? 'var(--accent-lighter)' : 'var(--bg-secondary)',
                        color: tags.includes(t) ? 'var(--accent)' : 'var(--text-muted)',
                      }}>{t}</button>
                  ))}
                </div>

                <button onClick={submit} disabled={posting || !title.trim() || !body.trim()}
                  style={{
                    width: '100%', padding: '12px', background: 'var(--gradient-primary)', color: 'white',
                    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: posting ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: (!title.trim() || !body.trim()) ? 0.5 : 1,
                  }}>
                  <Send size={14} /> {posting ? 'Posting...' : 'Post Question'}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
