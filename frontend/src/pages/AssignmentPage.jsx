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
import ScaleAssignment1_RAG from '../courses/scale/assignments/Assignment1_ScaleRAG'
import ScaleAssignment2_Deploy from '../courses/scale/assignments/Assignment2_DeployProd'
import ScaleAssignment3_Git from '../courses/scale/assignments/Assignment3_GitWorkflow'
import ScaleAssignment4_Database from '../courses/scale/assignments/Assignment4_DatabaseScaling'
import DSAAssignment1_Sort from '../courses/dsa/assignments/Assignment1_SortWarehouse'
import DSAAssignment2_Nav from '../courses/dsa/assignments/Assignment2_NavigationSystem'
import DSAAssignment3_Social from '../courses/dsa/assignments/Assignment3_SocialNetwork'
import DSAAssignment4_SQL from '../courses/dsa/assignments/Assignment4_ECommerceSQL'
import PdMAssignment1_Steel from '../courses/pdm/assignments/Assignment1_SteelPlant'
import PdMAssignment2_Wind from '../courses/pdm/assignments/Assignment2_WindTurbine'
import PdMAssignment3_Metro from '../courses/pdm/assignments/Assignment3_MetroRail'

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
  scale: {
    1: ScaleAssignment1_RAG,
    2: ScaleAssignment2_Deploy,
    3: ScaleAssignment3_Git,
    4: ScaleAssignment4_Database,
  },
  dsa: {
    1: DSAAssignment1_Sort,
    2: DSAAssignment2_Nav,
    3: DSAAssignment3_Social,
    4: DSAAssignment4_SQL,
  },
  pdm: {
    1: PdMAssignment1_Steel,
    2: PdMAssignment2_Wind,
    3: PdMAssignment3_Metro,
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
