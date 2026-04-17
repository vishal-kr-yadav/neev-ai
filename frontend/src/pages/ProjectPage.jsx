import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourse } from '../courses'
import { useAuth } from '../context/AuthContext'
import { Home, ArrowLeft } from 'lucide-react'
import FloatingDoubt from '../components/FloatingDoubt'
import styles from './TopicPage.module.css'

import RAGProject from '../courses/llm/project/RAGProject'

const projectComponents = {
  llm: RAGProject,
}

export default function ProjectPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const course = getCourse(courseId)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/login')
  }, [isLoggedIn, authLoading])

  if (authLoading || !isLoggedIn) return null
  if (!course || !course.project) { navigate('/'); return null }

  const ProjectComponent = projectComponents[courseId]
  if (!ProjectComponent) { navigate('/'); return null }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <Home size={16} /><span>Home</span>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          {course.project.icon} {course.project.title}
        </div>
        <button className={styles.backBtn} onClick={() => navigate(`/course/${courseId}/1`)}>
          <ArrowLeft size={16} /><span>Back to Course</span>
        </button>
      </header>

      <div className={styles.topicBanner}>
        <div className={styles.topicBannerInner}>
          <div className={styles.topicMeta}>
            <span className={styles.topicNum}>Hands-On Project</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className={styles.topicIcon}>{course.project.icon}</span>
            <h1 className={styles.topicTitle}>{course.project.title}</h1>
          </div>
          <p className={styles.topicSubtitle}>{course.project.subtitle}</p>
        </div>
      </div>

      <main className={styles.main}>
        <ProjectComponent />
      </main>

      <FloatingDoubt courseId={courseId} />
    </div>
  )
}
