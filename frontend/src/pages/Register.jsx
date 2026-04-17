import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import styles from './Auth.module.css'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', age: '', profession: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (payload.age) payload.age = parseInt(payload.age)
      else delete payload.age
      await register(payload)
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

        <h1 className={styles.formTitle}>Create your account</h1>
        <p className={styles.formSubtitle}>Join thousands learning AI visually</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Full Name *</label>
            <input className={styles.fieldInput} type="text" placeholder="John Doe"
              value={form.name} onChange={e => update('name', e.target.value)} required minLength={2} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Email *</label>
            <input className={styles.fieldInput} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Password *</label>
            <input className={styles.fieldInput} type="password" placeholder="At least 6 characters"
              value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Phone</label>
              <input className={styles.fieldInput} type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Age</label>
              <input className={styles.fieldInput} type="number" placeholder="25" min="5" max="120"
                value={form.age} onChange={e => update('age', e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Profession</label>
            <input className={styles.fieldInput} type="text" placeholder="Student, Engineer, Designer..."
              value={form.profession} onChange={e => update('profession', e.target.value)} />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.switchText}>
          Already have an account?{' '}
          <button className={styles.switchLink} onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
      </motion.div>

      <div className={styles.right}>
        <div className={styles.rightOrb} style={{ width: 300, height: 300, background: '#a78bfa', top: -50, right: -50 }} />
        <div className={styles.rightOrb} style={{ width: 200, height: 200, background: '#38bdf8', bottom: -30, left: -30 }} />
        <motion.div className={styles.rightContent}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <h2 className={styles.rightTitle}>Your AI Learning Journey Starts Here</h2>
          <p className={styles.rightDesc}>
            Track your progress, earn achievements, and build real projects.
            Every step saved to your personal dashboard.
          </p>
          <div className={styles.rightStats}>
            <div className={styles.rightStat}>
              <div className={styles.rightStatNum}>16</div>
              <div className={styles.rightStatLabel}>Topics</div>
            </div>
            <div className={styles.rightStat}>
              <div className={styles.rightStatNum}>100%</div>
              <div className={styles.rightStatLabel}>Hands-on</div>
            </div>
            <div className={styles.rightStat}>
              <div className={styles.rightStatNum}>Free</div>
              <div className={styles.rightStatLabel}>Forever</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
