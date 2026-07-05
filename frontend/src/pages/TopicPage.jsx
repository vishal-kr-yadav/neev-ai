import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles, Home, Wrench, PanelLeftOpen, PanelLeftClose, ClipboardList, Target, BookOpen } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { getCourse } from '../courses'
import { useAuth } from '../context/AuthContext'
import { useActivity } from '../context/ActivityContext'
import FloatingDoubt from '../components/FloatingDoubt'
import styles from './TopicPage.module.css'

function GoalHindiToggle({ goal }) {
  const [open, setOpen] = useState(false)
  if (!goal.hindiExplanation) return null
  return (
    <div>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: '10px 20px',
          background: open ? '#ff993320' : 'transparent',
          border: '1.5px solid #ff993340',
          borderRadius: 12,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          color: '#ff9933',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        🇮🇳 {open ? 'बंद करें ✕' : 'हिंदी में समझें'}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 16,
              padding: 24,
              background: 'linear-gradient(135deg, #fff8f0, #fff5eb)',
              borderRadius: 16,
              border: '1.5px solid #ff993330',
              borderTop: '4px solid #ff9933',
            }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: '#c2410c', marginBottom: 12 }}>
                {goal.hindiTitle || 'हिंदी में'}
              </h4>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: '#78350f' }}>
                {goal.hindiExplanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TopicPage() {
  const { courseId, topicId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading, getProgress, completeTopic: apiCompleteTopic, saveQuizScore } = useAuth()
  const { trackTopicEnter, trackTopicExit, trackQuizComplete } = useActivity() || {}
  const course = getCourse(courseId)
  const idx = parseInt(topicId) - 1
  const topic = course?.topics[idx]
  const topics = course?.topics || []

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/login')
  }, [isLoggedIn, authLoading])

  const [phase, setPhase] = useState('learn')
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const storageKey = `${courseId}-completed`
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : []
  })

  // Sync with MongoDB on mount (if logged in)
  useEffect(() => {
    if (isLoggedIn) {
      getProgress(courseId).then(p => {
        if (p && p.completedTopics) {
          setCompletedTopics(p.completedTopics)
          localStorage.setItem(storageKey, JSON.stringify(p.completedTopics))
        }
      }).catch(() => {})
    }
  }, [courseId, isLoggedIn])

  const quizStartTimeRef = useRef(null)

  useEffect(() => {
    setPhase('learn')
    setQuizCompleted(false)
    window.scrollTo(0, 0)

    // Track topic entry
    if (trackTopicEnter) trackTopicEnter(courseId, topicId)

    return () => {
      // Track topic exit with time spent
      if (trackTopicExit) trackTopicExit(courseId, topicId)
    }
  }, [topicId, courseId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completedTopics))
  }, [completedTopics, storageKey])

  if (authLoading || !isLoggedIn) return null
  if (!course || !topic) {
    navigate('/')
    return null
  }

  const markComplete = (score) => {
    if (!completedTopics.includes(idx)) {
      setCompletedTopics([...completedTopics, idx])
      if (isLoggedIn) apiCompleteTopic(courseId, idx).catch(() => {})
    }
    if (score !== undefined && isLoggedIn) {
      saveQuizScore(courseId, idx, score).catch(() => {})
    }
    // Track quiz completion with duration since quiz phase started
    if (trackQuizComplete) {
      const duration = quizStartTimeRef.current ? Date.now() - quizStartTimeRef.current : undefined
      trackQuizComplete(courseId, topicId, score, undefined, duration)
    }
    setQuizCompleted(true)
  }

  const goNext = () => {
    if (idx < topics.length - 1) navigate(`/course/${courseId}/${idx + 2}`)
    else navigate(`/course/${courseId}/final-quiz`)
  }

  const goPrev = () => {
    if (idx > 0) navigate(`/course/${courseId}/${idx}`)
  }

  const Content = topic.content
  const Quiz = topic.quiz
  const progress = Math.round((completedTopics.length / topics.length) * 100)
  const hasProject = !!course.project

  // Split topics into sections for sidebar
  const fundamentals = topics.slice(0, 8)
  const advanced = topics.slice(8)

  return (
    <div className={styles.page}>
      {/* Sticky header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <Home size={16} /><span>Home</span>
        </button>
        <div className={styles.progressRow}>
          {topics.map((t, i) => {
            const isComplete = completedTopics.includes(i)
            const isCurrent = i === idx
            return (
              <button key={i} onClick={() => navigate(`/course/${courseId}/${i + 1}`)}
                className={`${styles.dot} ${isCurrent ? styles.dotCurrent : ''} ${isComplete ? styles.dotDone : ''}`}
                title={t.title}>
                {isComplete ? <CheckCircle size={14} /> : <span className={styles.dotNum}>{i + 1}</span>}
              </button>
            )
          })}
          <button onClick={() => navigate(`/course/${courseId}/final-quiz`)} className={styles.dot} title="Final Quiz">
            <Sparkles size={14} />
          </button>
          {hasProject && (
            <button onClick={() => navigate(`/course/${courseId}/project`)} className={styles.dot} title={course.project.title}>
              <Wrench size={14} />
            </button>
          )}
        </div>
        <div className={styles.progressLabel}><span>{progress}%</span></div>
      </header>

      {/* Progress bar */}
      <div className={styles.progressBarTrack}>
        <motion.div className={styles.progressBarFill} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>

      {/* Sidebar toggle (mobile) */}
      <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>

      {/* Body: Sidebar + Main */}
      <div className={styles.bodyLayout}>
        {/* Left Sidebar */}
        <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarHidden : ''}`}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionLabel}>Fundamentals · Day 1–3</div>
          </div>
          {fundamentals.map((t, i) => {
            const isActive = i === idx
            const isDone = completedTopics.includes(i)
            return (
              <button key={i} onClick={() => navigate(`/course/${courseId}/${i + 1}`)}
                className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''} ${isDone && !isActive ? styles.sidebarItemDone : ''}`}>
                <span className={`${styles.sidebarItemNum} ${isActive ? styles.sidebarItemActiveNum : ''} ${isDone && !isActive ? styles.sidebarItemDoneNum : ''}`}>
                  {isDone && !isActive ? '✓' : i + 1}
                </span>
                <span className={styles.sidebarItemIcon}>{t.icon}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
              </button>
            )
          })}

          {advanced.length > 0 && (
            <>
              <div className={styles.sidebarDivider} />
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarSectionLabel}>Advanced · Day 4–7</div>
              </div>
              {advanced.map((t, i) => {
                const realIdx = i + 8
                const isActive = realIdx === idx
                const isDone = completedTopics.includes(realIdx)
                return (
                  <button key={realIdx} onClick={() => navigate(`/course/${courseId}/${realIdx + 1}`)}
                    className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''} ${isDone && !isActive ? styles.sidebarItemDone : ''}`}>
                    <span className={`${styles.sidebarItemNum} ${isActive ? styles.sidebarItemActiveNum : ''} ${isDone && !isActive ? styles.sidebarItemDoneNum : ''}`}>
                      {isDone && !isActive ? '✓' : realIdx + 1}
                    </span>
                    <span className={styles.sidebarItemIcon}>{t.icon}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  </button>
                )
              })}
            </>
          )}

          <div className={styles.sidebarDivider} />
          <button className={styles.sidebarSpecial} onClick={() => navigate(`/course/${courseId}/final-quiz`)}>
            <Sparkles size={16} /> Final Quiz
          </button>
          {course.projects?.length > 1 ? (
            course.projects.map(p => (
              <button key={p.id} className={styles.sidebarSpecial} onClick={() => navigate(`/course/${courseId}/project/${p.id}`)}>
                <Wrench size={16} /> {p.icon} {p.title}
              </button>
            ))
          ) : hasProject && (
            <button className={styles.sidebarSpecial} onClick={() => navigate(`/course/${courseId}/project`)}>
              <Wrench size={16} /> {course.project.title}
            </button>
          )}
          {course.assignments?.length > 0 && (
            <>
              <div className={styles.sidebarDivider} />
              <div style={{ padding: '4px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Assignments
              </div>
              {course.assignments.map(a => (
                <button key={a.id} className={styles.sidebarSpecial} onClick={() => navigate(`/course/${courseId}/assignment/${a.id}`)}>
                  <ClipboardList size={16} /> {a.icon} {a.title}
                </button>
              ))}
            </>
          )}
        </aside>

        {/* Main content area */}
        <div className={styles.mainArea}>
          <AnimatePresence mode="wait">
            {phase === 'learn' ? (
              <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className={styles.topicBanner}>
                  <div className={styles.topicBannerInner}>
                    <div className={styles.topicMeta}>
                      <span className={styles.topicNum}>Topic {idx + 1} of {topics.length}</span>
                      {topic.duration && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>⏱ {topic.duration}</span>}
                      {topic.day && <span style={{ fontSize: 12, color: 'var(--accent)', marginLeft: 8, fontWeight: 600 }}>Day {topic.day}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span className={styles.topicIcon}>{topic.icon}</span>
                      <h1 className={styles.topicTitle}>{topic.title}</h1>
                    </div>
                    <p className={styles.topicSubtitle}>{topic.subtitle}</p>
                  </div>
                </div>
                {topic.storyLink && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                      margin: '0 auto',
                      maxWidth: 900,
                      padding: '20px 28px',
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.06))',
                      borderLeft: '4px solid #f59e0b',
                      borderRadius: '0 16px 16px 0',
                      marginBottom: 0,
                      marginTop: -8,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <BookOpen size={20} style={{ color: '#d97706', marginTop: 2, flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {topic.storyLink}
                      </p>
                    </div>
                  </motion.div>
                )}
                <main className={styles.main}>
                  {idx === 0 && course.goal && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.06))',
                        border: '1px solid rgba(79,70,229,0.15)',
                        borderRadius: 22,
                        padding: '32px 36px',
                        marginBottom: 36,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Target size={22} color="white" />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: 'var(--text-primary)', margin: 0 }}>
                          {course.goal.title}
                        </h2>
                      </div>
                      <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 20 }}>
                        {course.goal.vision}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        {course.goal.points.map((point, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <span style={{
                              minWidth: 28, height: 28, borderRadius: 8,
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white', fontSize: 13, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              marginTop: 2,
                            }}>
                              {i + 1}
                            </span>
                            <span style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{point}</span>
                          </div>
                        ))}
                      </div>
                      {/* Hindi explanation toggle */}
                      <GoalHindiToggle goal={course.goal} />
                    </motion.div>
                  )}
                  <div className={styles.content}><Content /></div>
                  <div className={styles.phaseTransition}>
                    <motion.button className={styles.quizBtn}
                      onClick={() => { setPhase('quiz'); quizStartTimeRef.current = Date.now(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      Ready? Take the Quiz <ArrowRight size={18} />
                    </motion.button>
                  </div>
                </main>
              </motion.div>
            ) : (
              <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <main className={styles.main}>
                  <div className={styles.quizHeader}>
                    <span className={styles.quizBadge}><Sparkles size={14} /> Quiz — {topic.title}</span>
                    <button className={styles.backToLearn} onClick={() => setPhase('learn')}>
                      <ArrowLeft size={14} /> Review Topic
                    </button>
                  </div>
                  <Quiz onComplete={markComplete} />
                  {quizCompleted && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.nextSection}>
                      <div className={styles.completeBanner}><CheckCircle size={20} /> <span>Topic Complete!</span></div>
                      <br />
                      <motion.button className={styles.nextBtn} onClick={goNext} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        {idx < topics.length - 1 ? (<>Next: {topics[idx + 1].title} <ArrowRight size={18} /></>) : (<>Take Final Quiz <Sparkles size={18} /></>)}
                      </motion.button>
                    </motion.div>
                  )}
                </main>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation */}
      <footer className={styles.footer}>
        <button className={styles.navBtn} onClick={goPrev} disabled={idx === 0}>
          <ArrowLeft size={16} /> Previous
        </button>
        <span className={styles.footerTitle}>{topic.title}</span>
        <button className={styles.navBtn} onClick={goNext}>
          Next <ArrowRight size={16} />
        </button>
      </footer>

      <FloatingDoubt courseId={courseId} topicId={idx} />
    </div>
  )
}
