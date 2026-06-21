import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourse } from '../courses'
import { useAuth } from '../context/AuthContext'
import { Home, ArrowLeft } from 'lucide-react'
import styles from './TopicPage.module.css'

import Assignment1_PaintLine from '../courses/cv/assignments/Assignment1_PaintLine'
import Assignment2_PCBQuality from '../courses/cv/assignments/Assignment2_PCBQuality'
import Assignment3_SteelMill from '../courses/cv/assignments/Assignment3_SteelMill'
import Assignment1_BankChatbot from '../courses/llm/assignments/Assignment1_BankChatbot'
import Assignment2_ContentMod from '../courses/llm/assignments/Assignment2_ContentMod'
import Assignment3_LegalDocs from '../courses/llm/assignments/Assignment3_LegalDocs'

const assignmentComponents = {
  cv: {
    1: Assignment1_PaintLine,
    2: Assignment2_PCBQuality,
    3: Assignment3_SteelMill,
  },
  llm: {
    1: Assignment1_BankChatbot,
    2: Assignment2_ContentMod,
    3: Assignment3_LegalDocs,
  },
}

export default function AssignmentPage() {
  const { courseId, assignmentId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const course = getCourse(courseId)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/login')
  }, [isLoggedIn, authLoading])

  if (authLoading || !isLoggedIn) return null
  if (!course) { navigate('/'); return null }

  const courseAssignments = assignmentComponents[courseId]
  const AssignmentComponent = courseAssignments?.[Number(assignmentId)]
  if (!AssignmentComponent) { navigate('/'); return null }

  const assignmentConfig = course.assignments?.[Number(assignmentId) - 1]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <Home size={16} /><span>Home</span>
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          {assignmentConfig?.icon || '📋'} {assignmentConfig?.title || `Assignment ${assignmentId}`}
        </div>
        <button className={styles.backBtn} onClick={() => navigate(`/course/${courseId}/1`)}>
          <ArrowLeft size={16} /><span>Back to Course</span>
        </button>
      </header>

      <div className={styles.topicBanner}>
        <div className={styles.topicBannerInner}>
          <div className={styles.topicMeta}>
            <span className={styles.topicNum}>Case Study Assignment</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className={styles.topicIcon}>{assignmentConfig?.icon || '📋'}</span>
            <h1 className={styles.topicTitle}>{assignmentConfig?.title || `Assignment ${assignmentId}`}</h1>
          </div>
          <p className={styles.topicSubtitle}>{assignmentConfig?.subtitle || ''}</p>
        </div>
      </div>

      <main className={styles.main}>
        <AssignmentComponent />
      </main>
    </div>
  )
}
