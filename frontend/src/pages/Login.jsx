import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import styles from './Auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <motion.div className={styles.left}
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

        <Logo size="medium" onClick={() => navigate('/')} />

        <h1 className={styles.formTitle}>Welcome back</h1>
        <p className={styles.formSubtitle}>Sign in to continue your learning journey</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Email</label>
            <input className={styles.fieldInput} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Password</label>
            <input className={styles.fieldInput} type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.switchText}>
          Don't have an account?{' '}
          <button className={styles.switchLink} onClick={() => navigate('/register')}>
            Create one
          </button>
        </div>
      </motion.div>

      <div className={styles.right}>
        <div className={styles.rightOrb} style={{ width: 300, height: 300, background: '#a78bfa', top: -50, right: -50 }} />
        <div className={styles.rightOrb} style={{ width: 200, height: 200, background: '#38bdf8', bottom: -30, left: -30 }} />
        <motion.div className={styles.rightContent}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <h2 className={styles.rightTitle}>Learn AI by Doing</h2>
          <p className={styles.rightDesc}>
            Interactive 3D visualizations, hands-on exercises, and a friendly AI guide.
            Your progress is saved and tracked across all courses.
          </p>
          <div className={styles.rightStats}>
            <div className={styles.rightStat}>
              <div className={styles.rightStatNum}>16</div>
              <div className={styles.rightStatLabel}>Topics</div>
            </div>
            <div className={styles.rightStat}>
              <div className={styles.rightStatNum}>16</div>
              <div className={styles.rightStatLabel}>Quizzes</div>
            </div>
            <div className={styles.rightStat}>
              <div className={styles.rightStatNum}>1</div>
              <div className={styles.rightStatLabel}>Project</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
