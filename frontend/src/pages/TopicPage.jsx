import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles, Home, Wrench, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCourse } from '../courses'
import { useAuth } from '../context/AuthContext'
import FloatingDoubt from '../components/FloatingDoubt'
import styles from './TopicPage.module.css'

export default function TopicPage() {
  const { courseId, topicId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading, getProgress, completeTopic: apiCompleteTopic } = useAuth()
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

  useEffect(() => {
    setPhase('learn')
    setQuizCompleted(false)
    window.scrollTo(0, 0)
  }, [topicId, courseId])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completedTopics))
  }, [completedTopics, storageKey])

  if (authLoading || !isLoggedIn) return null
  if (!course || !topic) {
    navigate('/')
    return null
  }

  const markComplete = () => {
    if (!completedTopics.includes(idx)) {
      setCompletedTopics([...completedTopics, idx])
      if (isLoggedIn) apiCompleteTopic(courseId, idx).catch(() => {})
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
            <div className={styles.sidebarSectionLabel}>Fundamentals</div>
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
                <div className={styles.sidebarSectionLabel}>Advanced</div>
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
          {hasProject && (
            <button className={styles.sidebarSpecial} onClick={() => navigate(`/course/${courseId}/project`)}>
              <Wrench size={16} /> {course.project.title}
            </button>
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
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span className={styles.topicIcon}>{topic.icon}</span>
                      <h1 className={styles.topicTitle}>{topic.title}</h1>
                    </div>
                    <p className={styles.topicSubtitle}>{topic.subtitle}</p>
                  </div>
                </div>
                <main className={styles.main}>
                  <div className={styles.content}><Content /></div>
                  <div className={styles.phaseTransition}>
                    <motion.button className={styles.quizBtn}
                      onClick={() => { setPhase('quiz'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
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
