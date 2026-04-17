import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MessageCircle, ThumbsUp, ChevronLeft, Eye, Check, Search, Plus, ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import styles from './Community.module.css'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'
const TAGS = ['llm', 'transformer', 'attention', 'tokenization', 'training', 'prompting', 'agents', 'embeddings', 'diffusion', 'safety', 'general']

/* ---- Ask Question Modal ---- */
function AskModal({ onClose, onSubmit, prefillCourse, prefillTopic }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleTag = (t) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 5 ? [...prev, t] : prev)

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) { setError('Title and body are required'); return }
    if (body.length > 2500) { setError('Body exceeds 500 word limit (~2500 chars)'); return }
    setLoading(true)
    setError('')
    try {
      await onSubmit({ title, body, tags, courseId: prefillCourse || '', topicId: prefillTopic ?? null })
      onClose()
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div className={styles.modal} onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={styles.modalTitle}>Ask a Question</h2>
        {error && <div style={{ padding: 12, background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>{error}</div>}

        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Title *</label>
          <input className={styles.modalInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="What's your question? Be specific." maxLength={200} />
          <div className={styles.charCount}>{title.length}/200</div>
        </div>

        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Details * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(max ~500 words)</span></label>
          <textarea className={styles.textarea} value={body} onChange={e => setBody(e.target.value)} placeholder="Explain your question with context. What have you tried? What do you expect?" maxLength={2500} style={{ minHeight: 140 }} />
          <div className={styles.charCount} style={{ color: body.length > 2300 ? 'var(--danger)' : 'var(--text-muted)' }}>{body.length}/2500</div>
        </div>

        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Tags <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(up to 5)</span></label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TAGS.map(t => (
              <button key={t} onClick={() => toggleTag(t)} className={`${styles.tagBtn} ${tags.includes(t) ? styles.tagBtnActive : ''}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>Cancel</button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading || !title.trim() || !body.trim()}>
            {loading ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ---- Question Detail View ---- */
function QuestionDetail({ questionId, onBack, token, userId }) {
  const [q, setQ] = useState(null)
  const [answerBody, setAnswerBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    fetch(`${API}/questions/${questionId}`).then(r => r.json()).then(d => setQ(d.question)).catch(() => {})
  }
  useEffect(() => { load() }, [questionId])

  const toggleVoteQ = async () => {
    if (!token) return
    await fetch(`${API}/questions/${questionId}/upvote`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    load()
  }
  const toggleVoteA = async (aid) => {
    if (!token) return
    await fetch(`${API}/questions/${questionId}/answers/${aid}/upvote`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    load()
  }
  const acceptAnswer = async (aid) => {
    if (!token) return
    await fetch(`${API}/questions/${questionId}/answers/${aid}/accept`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    load()
  }
  const submitAnswer = async () => {
    if (!answerBody.trim() || !token) return
    if (answerBody.length > 25000) return
    setSubmitting(true)
    await fetch(`${API}/questions/${questionId}/answers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body: answerBody }),
    })
    setAnswerBody('')
    setSubmitting(false)
    load()
  }

  if (!q) return <div className={styles.empty}>Loading...</div>
  const isAuthor = userId === q.author?._id

  return (
    <div>
      <button className={styles.backBtn} onClick={onBack}><ArrowLeft size={16} /> Back to questions</button>

      <div style={{ marginTop: 16 }}>
        <h1 className={styles.detailTitle}>{q.title}</h1>
        <div className={styles.detailMeta}>
          <div className={styles.qAuthor}>
            <div className={styles.qAuthorAvatar}>{q.author?.name?.charAt(0)}</div>
            <strong>{q.author?.name}</strong> · {q.author?.profession || 'Member'}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(q.createdAt).toLocaleDateString()}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}><Eye size={12} /> {q.views} views</span>
          {q.tags?.map(t => <span key={t} className={styles.qTag}>{t}</span>)}
        </div>
        <div className={styles.detailBody}>{q.body}</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <button className={`${styles.voteBtn} ${q.upvotes?.includes(userId) ? styles.voteBtnActive : ''}`} onClick={toggleVoteQ}>
            <ThumbsUp size={14} /> {q.upvotes?.length || 0}
          </button>
        </div>

        {/* Answers */}
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
          {q.answers?.length || 0} Answer{q.answers?.length !== 1 ? 's' : ''}
        </h3>

        {q.answers?.sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0) || (b.upvotes?.length || 0) - (a.upvotes?.length || 0)).map(a => (
          <div key={a._id} className={`${styles.answerCard} ${a.isAccepted ? styles.answerAccepted : ''}`}>
            {a.isAccepted && <div className={styles.acceptBadge}><Check size={12} /> Accepted Answer</div>}
            <div className={styles.answerBody}>{a.body}</div>
            <div className={styles.answerMeta}>
              <button className={`${styles.voteBtn} ${a.upvotes?.includes(userId) ? styles.voteBtnActive : ''}`} onClick={() => toggleVoteA(a._id)}>
                <ThumbsUp size={14} /> {a.upvotes?.length || 0}
              </button>
              <div className={styles.qAuthor}>
                <div className={styles.qAuthorAvatar}>{a.author?.name?.charAt(0)}</div>
                <strong>{a.author?.name}</strong>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
              {isAuthor && !a.isAccepted && (
                <button className={styles.voteBtn} onClick={() => acceptAnswer(a._id)} style={{ fontSize: 12 }}>
                  <Check size={12} /> Accept
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Write answer */}
        <div className={styles.answerForm}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Your Answer</h4>
          <textarea className={styles.textarea} value={answerBody} onChange={e => setAnswerBody(e.target.value)} placeholder="Write your answer here... Be helpful and specific." maxLength={25000} />
          <div className={styles.charCount} style={{ color: answerBody.length > 24000 ? 'var(--danger)' : 'var(--text-muted)' }}>{answerBody.length}/25000</div>
          <button className={styles.submitBtn} onClick={submitAnswer} disabled={submitting || !answerBody.trim()}>
            <Send size={14} style={{ marginRight: 6 }} /> {submitting ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN COMMUNITY PAGE
================================================================ */
export default function Community() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, token, isLoggedIn, loading: authLoading } = useAuth()
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showAsk, setShowAsk] = useState(false)
  const [viewingId, setViewingId] = useState(searchParams.get('q') || null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [tag, setTag] = useState(searchParams.get('tag') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/login')
  }, [isLoggedIn, authLoading])

  const fetchQuestions = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page, sort, limit: 15 })
    if (search) params.set('search', search)
    if (tag) params.set('tag', tag)
    try {
      const res = await fetch(`${API}/questions?${params}`)
      const data = await res.json()
      setQuestions(data.questions || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (e) {}
    setLoading(false)
  }

  useEffect(() => { fetchQuestions() }, [page, sort, tag])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchQuestions()
  }

  const handleAsk = async (data) => {
    const res = await fetch(`${API}/questions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    const d = await res.json()
    if (!res.ok) throw new Error(d.error)
    fetchQuestions()
  }

  if (authLoading || !isLoggedIn) return null

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Logo size="medium" onClick={() => navigate('/')} />
          <div className={styles.navRight}>
            <button className={styles.navBtn} onClick={() => navigate('/')}><Home size={16} /> Home</button>
            <button className={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.headerTitle}>Community Q&A</h1>
            <p className={styles.headerSub}>{total} questions · Ask doubts, share knowledge, help others</p>
          </div>
          <motion.button className={styles.askBtn} onClick={() => setShowAsk(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Plus size={18} /> Ask a Question
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      {!viewingId && (
        <div className={styles.filters}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: 8 }}>
            <input className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..." />
            <button type="submit" className={styles.filterBtn} style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>
              <Search size={14} />
            </button>
          </form>
          {['newest', 'popular', 'unanswered'].map(s => (
            <button key={s} className={`${styles.filterBtn} ${sort === s ? styles.filterBtnActive : ''}`}
              onClick={() => { setSort(s); setPage(1) }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      {!viewingId && (
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 40px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`${styles.tagBtn} ${!tag ? styles.tagBtnActive : ''}`} onClick={() => { setTag(''); setPage(1) }}>All</button>
          {TAGS.map(t => (
            <button key={t} className={`${styles.tagBtn} ${tag === t ? styles.tagBtnActive : ''}`}
              onClick={() => { setTag(tag === t ? '' : t); setPage(1) }}>{t}</button>
          ))}
        </div>
      )}

      {/* Main content */}
      <main className={styles.main}>
        {viewingId ? (
          <QuestionDetail questionId={viewingId} onBack={() => setViewingId(null)} token={token} userId={user?._id} />
        ) : loading ? (
          <div className={styles.empty}>Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤔</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No questions yet</div>
            <div>Be the first to ask!</div>
          </div>
        ) : (
          <>
            {questions.map(q => (
              <motion.div key={q._id} className={styles.questionCard} onClick={() => setViewingId(q._id)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className={styles.qStats}>
                  <div className={styles.qStatBox} style={{ background: q.upvoteCount > 0 ? '#ede9fe' : 'var(--bg-secondary)' }}>
                    <div className={styles.qStatNum} style={{ color: q.upvoteCount > 0 ? '#4f46e5' : 'var(--text-muted)' }}>{q.upvoteCount || 0}</div>
                    <div className={styles.qStatLabel}>votes</div>
                  </div>
                  <div className={styles.qStatBox} style={{ background: q.answerCount > 0 ? '#d1fae5' : 'var(--bg-secondary)' }}>
                    <div className={styles.qStatNum} style={{ color: q.answerCount > 0 ? '#10b981' : 'var(--text-muted)' }}>{q.answerCount || 0}</div>
                    <div className={styles.qStatLabel}>answers</div>
                  </div>
                </div>
                <div className={styles.qBody}>
                  <div className={styles.qTitle}>{q.title}</div>
                  <div className={styles.qExcerpt}>{q.body}</div>
                  <div className={styles.qMeta}>
                    {q.tags?.map(t => <span key={t} className={styles.qTag}>{t}</span>)}
                    <div className={styles.qAuthor}>
                      <div className={styles.qAuthorAvatar}>{q.author?.name?.charAt(0)}</div>
                      {q.author?.name} · {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}><Eye size={11} /> {q.views}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {pages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className={styles.pageBtn} disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Ask Modal */}
      <AnimatePresence>
        {showAsk && <AskModal onClose={() => setShowAsk(false)} onSubmit={handleAsk} />}
      </AnimatePresence>
    </div>
  )
}
