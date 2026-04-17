import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, BookOpen, CheckCircle, Trophy, Clock, ArrowRight, Wrench, Home, BarChart3, Flame } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import { courses as courseRegistry } from '../courses'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, getAllProgress } = useAuth()
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    getAllProgress().then(list => {
      const map = {}
      list.forEach(p => { map[p.courseId] = p })
      setProgressMap(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isLoggedIn])

  if (!isLoggedIn || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ fontSize: 32 }}>⚙️</motion.div>
      </div>
    )
  }

  // Calculate overall stats
  const availableCourses = courseRegistry.filter(c => c.available)
  let totalTopics = 0, totalCompleted = 0, totalQuizzes = 0, projectsDone = 0
  availableCourses.forEach(c => {
    totalTopics += c.topics.length
    const p = progressMap[c.id]
    if (p) {
      totalCompleted += p.completedTopics?.length || 0
      totalQuizzes += p.quizScores ? Object.keys(p.quizScores).length : 0
      if (p.projectCompleted) projectsDone++
    }
  })

  const overallPct = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Logo size="medium" onClick={() => navigate('/')} />
          <div className={styles.navRight}>
            <button className={styles.navBtn} onClick={() => navigate('/')}>
              <Home size={16} /> Home
            </button>
            <button className={styles.navBtn} onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Header with user info */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.headerName}>
              स्वागत है, {user?.name?.split(' ')[0]}! <span style={{ fontSize: '0.6em', fontWeight: 400, color: 'var(--text-muted)' }}>Welcome back</span>
            </h1>
            <div className={styles.headerMeta}>
              {user?.profession && (
                <span className={styles.headerMetaItem}>💼 {user.profession}</span>
              )}
              {user?.age && (
                <span className={styles.headerMetaItem}>🎂 {user.age} years</span>
              )}
              <span className={styles.headerMetaItem}>📧 {user?.email}</span>
              {memberSince && (
                <span className={styles.headerMetaItem}>📅 Joined {memberSince}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className={styles.statsGrid}>
        {[
          { icon: '📊', bg: '#ede9fe', value: `${overallPct}%`, label: 'Overall Progress', color: '#4f46e5' },
          { icon: '✅', bg: '#d1fae5', value: `${totalCompleted}/${totalTopics}`, label: 'Topics Completed', color: '#10b981' },
          { icon: '📝', bg: '#e0f2fe', value: totalQuizzes, label: 'Quizzes Taken', color: '#0ea5e9' },
          { icon: '🔧', bg: '#fff7ed', value: projectsDone, label: 'Projects Done', color: '#f97316' },
        ].map((s, i) => (
          <motion.div key={i} className={styles.statCard}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className={styles.statIcon} style={{ background: s.bg }}>{s.icon}</div>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main: Course progress */}
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}><BookOpen size={22} /> Your Courses</h2>

        {availableCourses.map((course, ci) => {
          const progress = progressMap[course.id]
          const completed = progress?.completedTopics || []
          const pct = course.topics.length > 0 ? Math.round((completed.length / course.topics.length) * 100) : 0
          const lastTopic = progress?.lastAccessedTopic ?? 0
          const nextTopic = Math.min(lastTopic + 1, course.topics.length)
          const quizScores = progress?.quizScores || {}

          return (
            <motion.div key={course.id} className={styles.courseCard}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + ci * 0.15 }}>

              {/* Course header */}
              <div className={styles.courseCardHeader}>
                <div className={styles.courseCardTitle}>
                  <div className={styles.courseCardIcon} style={{ background: course.gradient }}>
                    {course.icon}
                  </div>
                  <div>
                    <div className={styles.courseCardName}>{course.title}</div>
                    <div className={styles.courseCardSub}>{course.topics.length} topics · {course.duration}</div>
                  </div>
                </div>
                <div className={styles.courseCardPct}>{pct}%</div>
              </div>

              {/* Progress bar */}
              <div className={styles.progressBar}>
                <motion.div className={styles.progressFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{ background: course.gradient }}
                />
              </div>

              {/* Topic grid */}
              <div className={styles.topicGrid}>
                {course.topics.map((t, i) => {
                  const isDone = completed.includes(i)
                  const score = quizScores[String(i)]
                  return (
                    <div key={i} className={`${styles.topicItem} ${isDone ? styles.topicItemDone : ''}`}
                      onClick={() => navigate(`/course/${course.id}/${i + 1}`)}>
                      <div className={styles.topicItemNum} style={{
                        background: isDone ? 'var(--success)' : 'var(--bg-secondary)',
                        color: isDone ? 'white' : 'var(--text-muted)',
                      }}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <div>
                        <div className={styles.topicItemLabel}>{t.icon} {t.title}</div>
                        {score !== undefined && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Quiz: {score}/5</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Continue button */}
              <motion.button className={styles.continueBtn}
                onClick={() => navigate(`/course/${course.id}/${nextTopic}`)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {pct === 0 ? 'Start Course' : pct === 100 ? 'Review Course' : `Continue Topic ${nextTopic}`}
                <ArrowRight size={16} />
              </motion.button>

              {/* Project + Final Quiz status */}
              {(course.project || true) && (
                <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
                  <div style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={() => navigate(`/course/${course.id}/final-quiz`)}>
                    <Trophy size={14} color={progress?.finalQuizScore != null ? '#f59e0b' : 'var(--text-muted)'} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Final Quiz {progress?.finalQuizScore != null ? `— ${progress.finalQuizScore}/10` : ''}
                    </span>
                  </div>
                  {course.project && (
                    <div style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                      onClick={() => navigate(`/course/${course.id}/project`)}>
                      <Wrench size={14} color={progress?.projectCompleted ? '#10b981' : 'var(--text-muted)'} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {course.project.title} {progress?.projectCompleted ? '✅' : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}

        {/* Coming Soon courses */}
        {courseRegistry.filter(c => !c.available).length > 0 && (
          <>
            <h2 className={styles.sectionTitle} style={{ marginTop: 40 }}>🔮 Coming Soon</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {courseRegistry.filter(c => !c.available).map(course => (
                <div key={course.id} style={{ padding: 24, background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 16, opacity: 0.6 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{course.icon}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>{course.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{course.subtitle}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
