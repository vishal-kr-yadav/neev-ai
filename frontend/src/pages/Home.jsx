import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Sparkles, ArrowRight, Eye, Zap, BookOpen, Clock, Award, Play, Users, BarChart3, Lightbulb, LogOut, User, Shield, Container } from 'lucide-react'
import { courses as courseRegistry } from '../courses'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import styles from './Home.module.css'

const courseIcons = { llm: <Brain size={28} />, devops: <Container size={28} />, cv: <Eye size={28} />, rl: <Zap size={28} /> }

const features = [
  {
    icon: '🎮',
    bg: '#ede9fe',
    title: 'Interactive Learning',
    desc: 'No passive reading. Every concept has hands-on exercises, drag-and-drop activities, and live experiments you can try yourself.',
  },
  {
    icon: '🧊',
    bg: '#e0f2fe',
    title: '3D Visualizations',
    desc: 'Complex architectures like neural networks and transformers come alive with interactive 3D models you can rotate and explore.',
  },
  {
    icon: '🤖',
    bg: '#fce7f3',
    title: 'AI Guide Character',
    desc: 'Meet Neuron, your friendly AI guide who explains concepts with real-life analogies — from simple stories to deep technical details.',
  },
  {
    icon: '📊',
    bg: '#ccfbf1',
    title: 'Real-World Examples',
    desc: 'Every topic is grounded in real use cases — autocomplete, translation, chatbots, code generation, and more.',
  },
  {
    icon: '🧪',
    bg: '#fff7ed',
    title: 'Unique Quizzes',
    desc: 'Each topic has a different quiz format — sort cards, split tokens, connect concepts, fix prompts, and more.',
  },
  {
    icon: '🎓',
    bg: '#d1fae5',
    title: 'For Everyone',
    desc: 'Whether you\'re 5 or 50, beginner or expert — content adapts with simple analogies AND deep technical details.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuth()

  return (
    <div className={styles.home}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Logo size="medium" onClick={() => navigate('/')} />
          <div className={styles.navLinks}>
            <button className={styles.navLink} onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}>
              Courses
            </button>
            <button className={styles.navLink} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Features
            </button>
            {isLoggedIn ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                </div>
                <button className={styles.navLink} onClick={() => navigate('/community')}>
                  Q&A
                </button>
                {user?.role === 'admin' && (
                  <button className={styles.navLink} onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4f46e5' }}>
                    <Shield size={14} /> Admin
                  </button>
                )}
                <button className={styles.navCta} onClick={() => navigate('/dashboard')}>
                  Dashboard
                </button>
                <button className={styles.navLink} onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <button className={styles.navLink} onClick={() => navigate('/login')}>
                  Sign In
                </button>
                <button className={styles.navCta} onClick={() => navigate('/register')}>
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className={styles.heroBadge}>
            <div className={styles.heroBadgeDot} />
            Free & Interactive
          </div>

          <h1 className={styles.heroTitle}>
            Learn AI by <span className={styles.heroHighlight}>Doing</span>,<br />
            Not Just Reading
          </h1>

          <p className={styles.heroSubtitle}>
            Interactive visual lessons with 3D models, hands-on exercises, and a friendly AI guide
            that makes complex topics simple and fun — for beginners and experts alike.
          </p>

          <div className={styles.heroActions}>
            <motion.button
              className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
              onClick={() => navigate('/course/llm/1')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Play size={18} />
              Start Learning — It's Free
            </motion.button>
            <motion.button
              className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <BookOpen size={18} />
              Browse Courses
            </motion.button>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>24+</div>
              <div className={styles.heroStatLabel}>Interactive Topics</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>24+</div>
              <div className={styles.heroStatLabel}>Unique Quizzes</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>6</div>
              <div className={styles.heroStatLabel}>Case Studies</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroStatNum}>1 Week</div>
              <div className={styles.heroStatLabel}>Per Course</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <div className="section-label" style={{ marginBottom: 20 }}>
            <Lightbulb size={14} />
            Why Neev
          </div>
          <h2 className={styles.sectionTitle}>Learning That Actually Works</h2>
          <p className={styles.sectionSubtitle}>
            We built the course we wished existed when we first learned about AI.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className={styles.featureIcon} style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className={styles.courses} id="courses">
        <div className={styles.coursesInner}>
          <div className={styles.sectionHeader}>
            <div className="section-label" style={{ marginBottom: 20 }}>
              <BookOpen size={14} />
              Courses
            </div>
            <h2 className={styles.sectionTitle}>Choose Your Learning Path</h2>
            <p className={styles.sectionSubtitle}>
              Deep-dive courses built from the ground up with interactive content.
            </p>
          </div>

          <div className={styles.courseGrid}>
            {courseRegistry.map((course, i) => (
              <motion.div
                key={course.id}
                className={`${styles.courseCard} ${!course.available ? styles.courseCardDisabled : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={course.available ? { y: -6 } : {}}
                onClick={() => course.available && navigate(`/course/${course.id}/1`)}
              >
                <div className={styles.courseCardBanner} style={{ background: course.gradient }}>
                  <div className={styles.courseCardBannerContent}>
                    <div className={styles.courseCardBannerIcon}>
                      {courseIcons[course.id] || <BookOpen size={28} />}
                    </div>
                    <div className={styles.courseCardBannerTitle}>
                      {course.available ? 'Available Now' : 'Coming Soon'}
                    </div>
                  </div>
                </div>

                <div className={styles.courseCardBody}>
                  <h3 className={styles.courseCardTitle}>{course.title}</h3>
                  <p className={styles.courseCardSubtitle}>{course.subtitle}</p>

                  {course.available && (
                    <div className={styles.courseCardMeta}>
                      <span className={styles.courseCardMetaItem}>
                        <BookOpen size={14} /> {course.topics.length} topics{course.assignments?.length ? ` + ${course.assignments.length} assignments` : ''}{course.project ? ' + project' : ''}
                      </span>
                      <span className={styles.courseCardMetaItem}>
                        <Clock size={14} /> {course.duration}
                      </span>
                      <span className={styles.courseCardMetaItem}>
                        <Users size={14} /> {course.level}
                      </span>
                    </div>
                  )}

                  {course.available ? (
                    <button className={styles.courseCardBtn}>
                      Start Course <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div className={styles.comingSoon}>
                      <Clock size={16} /> Coming Soon
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Built with curiosity by <span className={styles.footerBrand}>Neev नींव</span> — Your foundation to understand AI.
        </p>
      </footer>
    </div>
  )
}
