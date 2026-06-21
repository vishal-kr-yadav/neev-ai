import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCourse } from '../courses'
import { useAuth } from '../context/AuthContext'
import { Home, ArrowLeft, ArrowRight } from 'lucide-react'
import FloatingDoubt from '../components/FloatingDoubt'
import styles from './TopicPage.module.css'

import RAGProject from '../courses/llm/project/RAGProject'
import PromptProject from '../courses/llm/project/PromptProject'
import CVProject from '../courses/cv/project/CVProject'
import NumberPlateProject from '../courses/cv/project/NumberPlateProject'

const projectComponents = {
  llm: { rag: RAGProject, prompting: PromptProject },
  cv: { steel: CVProject, numberplate: NumberPlateProject },
}

function ProjectSelector({ course, courseId, navigate }) {
  const projects = course.projects || [{ ...course.project, id: 'default' }]
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <Home size={16} /><span>Home</span>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          {course.icon} {course.title} — Projects
        </div>
        <button className={styles.backBtn} onClick={() => navigate(`/course/${courseId}/1`)}>
          <ArrowLeft size={16} /><span>Back to Course</span>
        </button>
      </header>

      <div className={styles.topicBanner}>
        <div className={styles.topicBannerInner}>
          <div className={styles.topicMeta}>
            <span className={styles.topicNum}>Hands-On Projects</span>
          </div>
          <h1 className={styles.topicTitle}>Choose a Project</h1>
          <p className={styles.topicSubtitle}>Each project gives you hands-on experience building real AI systems.</p>
        </div>
      </div>

      <main className={styles.main}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/course/${courseId}/project/${p.id}`)}
              style={{
                background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
                padding: 32, cursor: 'pointer', transition: 'all 0.3s',
              }}
              whileHover={{ scale: 1.03, borderColor: 'var(--accent)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                {p.subtitle}
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 20,
                background: 'var(--accent)', color: '#fff',
                fontSize: 14, fontWeight: 600,
              }}>
                Start Project <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function ProjectPage() {
  const { courseId, projectId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const course = getCourse(courseId)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/login')
  }, [isLoggedIn, authLoading])

  if (authLoading || !isLoggedIn) return null
  if (!course) { navigate('/'); return null }

  const hasMultipleProjects = course.projects?.length > 1

  if (!projectId && hasMultipleProjects) {
    return <ProjectSelector course={course} courseId={courseId} navigate={navigate} />
  }

  const resolvedId = projectId || (course.projects?.[0]?.id) || 'default'
  const courseProjects = projectComponents[courseId]
  const ProjectComponent = courseProjects?.[resolvedId]
  if (!ProjectComponent) { navigate('/'); return null }

  const projectConfig = course.projects?.find(p => p.id === resolvedId) || course.project

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <Home size={16} /><span>Home</span>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          {projectConfig?.icon} {projectConfig?.title}
        </div>
        <button className={styles.backBtn} onClick={() => hasMultipleProjects ? navigate(`/course/${courseId}/project`) : navigate(`/course/${courseId}/1`)}>
          <ArrowLeft size={16} /><span>{hasMultipleProjects ? 'All Projects' : 'Back to Course'}</span>
        </button>
      </header>

      <div className={styles.topicBanner}>
        <div className={styles.topicBannerInner}>
          <div className={styles.topicMeta}>
            <span className={styles.topicNum}>Hands-On Project</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className={styles.topicIcon}>{projectConfig?.icon}</span>
            <h1 className={styles.topicTitle}>{projectConfig?.title}</h1>
          </div>
          <p className={styles.topicSubtitle}>{projectConfig?.subtitle}</p>
        </div>
      </div>

      <main className={styles.main}>
        <ProjectComponent />
      </main>

      <FloatingDoubt courseId={courseId} />
    </div>
  )
}
