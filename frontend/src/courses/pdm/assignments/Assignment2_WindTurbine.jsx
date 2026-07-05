import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'pdm'
const ASSIGNMENT_ID = 2
const TOTAL_QUESTIONS = 10
const ACCENT = '#6366f1'
const ACCENT_LIGHT = 'rgba(99,102,241,0.12)'
const ACCENT_BORDER = 'rgba(99,102,241,0.3)'

const SECTIONS = [
  { id: 1, title: 'Failure Analysis', questions: [1, 2] },
  { id: 2, title: 'Sensor Strategy', questions: [3] },
  { id: 3, title: 'Feature Engineering', questions: [4, 5] },
  { id: 4, title: 'Model Design', questions: [6] },
  { id: 5, title: 'Maintenance Scheduling', questions: [7, 8] },
  { id: 6, title: 'ROI Analysis', questions: [9, 10] },
  { id: 7, title: 'Hindi Summary', questions: [] },
]

const MCQ_DATA = {
  2: {
    question: 'Why is gearbox failure the most costly failure mode for RajWindPower?',
    options: [
      { key: 'a', text: "It's the most common failure — happens every month" },
      { key: 'b', text: 'It requires crane mobilization + 2-week downtime + ₹50L replacement cost' },
      { key: 'c', text: "It's the easiest to detect and therefore gets the most attention" },
      { key: 'd', text: 'It affects all 25 turbines simultaneously due to shared components' },
    ],
    answer: 'b',
  },
  5: {
    question: 'A turbine\'s power output is 30% lower than expected for the current wind speed. This is called a power curve deviation. What does it most likely indicate?',
    options: [
      { key: 'a', text: 'The turbine is producing more power than expected — a good sign' },
      { key: 'b', text: 'Less power than expected for current wind speed — indicates mechanical or aerodynamic loss' },
      { key: 'c', text: 'Normal seasonal variation — wind turbines fluctuate naturally' },
      { key: 'd', text: 'Sensor calibration error in the wind speed anemometer' },
    ],
    answer: 'b',
  },
  8: {
    question: 'Batching 3 turbine repairs into one technician visit to Jaisalmer costs ₹2L. If each visit were separate it would cost ₹6L. How much does batching save?',
    options: [
      { key: 'a', text: '₹2L — the cost of one visit saved' },
      { key: 'b', text: '₹4L (₹6L separate visits − ₹2L batched visit)' },
      { key: 'c', text: '₹6L — total cost of all visits avoided' },
      { key: 'd', text: 'No savings — you still have to pay for all repairs' },
    ],
    answer: 'b',
  },
  10: {
    question: 'If PdM extends average gearbox life by 2 years across all 25 turbines, what is the total replacement cost avoided?',
    options: [
      { key: 'a', text: '₹5 Cr' },
      { key: 'b', text: '₹12.5 Cr (25 turbines × ₹50L per gearbox)' },
      { key: 'c', text: '₹25 Cr — including crane and labor' },
      { key: 'd', text: '₹2.5 Cr — only counting the first 5 turbines' },
    ],
    answer: 'b',
  },
}

/* ─── STYLES ─── */
const card = {
  background: 'var(--bg-card)',
  borderRadius: 16,
  border: '1px solid var(--border)',
  padding: 24,
  marginBottom: 20,
}

const textarea = {
  width: '100%',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '14px 16px',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  fontSize: 15,
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 10,
  fontSize: 15,
  lineHeight: 1.6,
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function Assignment2_WindTurbine() {
  const { saveAssignment, getAssignment } = useAuth()
  const [responses, setResponses] = useState({})
  const [expanded, setExpanded] = useState({ 1: true })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  /* ── Load saved responses on mount ── */
  useEffect(() => {
    async function load() {
      const data = await getAssignment(COURSE_ID, ASSIGNMENT_ID)
      if (data && data.responses) {
        setResponses(data.responses)
        if (data.submitted) setSubmitted(true)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Helpers ── */
  const setR = (qId, value) => {
    setResponses(prev => ({ ...prev, [qId]: value }))
  }

  const getR = (qId) => responses[qId] || ''

  const answeredCount = () => {
    let count = 0
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
      const val = responses[i]
      if (val && typeof val === 'string' && val.trim().length > 0) count++
    }
    return count
  }

  const toggleSection = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, responses, false)
      setSaveMsg('Progress saved!')
    } catch {
      setSaveMsg('Failed to save. Try again.')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const handleSubmit = async () => {
    if (!window.confirm('Submit your final answers? You can still view them after submission.')) return
    setSaving(true)
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, responses, true)
      setSubmitted(true)
    } catch {
      setSaveMsg('Failed to submit. Try again.')
    }
    setSaving(false)
  }

  const answered = answeredCount()
  const progress = Math.round((answered / TOTAL_QUESTIONS) * 100)

  /* ── Submitted state ── */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}
        >
          <div style={{ fontSize: 64, marginBottom: 20 }}>&#10003;</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 32, marginBottom: 16 }}>
            Assignment Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Your RajWindPower PdM strategy has been submitted. An AI instructor will review your failure
            analysis, sensor strategy, and maintenance scheduling approach.
          </p>
          <div style={{ ...card, textAlign: 'left' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Submission Summary</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Questions answered: <strong style={{ color: ACCENT }}>{answered}/{TOTAL_QUESTIONS}</strong>
            </p>
            {SECTIONS.filter(s => s.questions.length > 0).map(sec => {
              const filled = sec.questions.filter(q => responses[q] && String(responses[q]).trim()).length
              return (
                <div key={sec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: filled === sec.questions.length ? ACCENT : 'var(--text-secondary)', fontSize: 16 }}>
                    {filled === sec.questions.length ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 15, flex: 1 }}>
                    Section {sec.id}: {sec.title}
                  </span>
                  <span style={{ fontSize: 13, color: filled === sec.questions.length ? ACCENT : 'var(--text-secondary)' }}>
                    {filled}/{sec.questions.length}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
        <AIEvaluationPanel courseId={COURSE_ID} assignmentId={ASSIGNMENT_ID} />
      </div>
    )
  }

  /* ── Main layout ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 30, margin: '0 0 8px',
          }}>
            Wind Turbine Health Monitoring &mdash; RajWindPower
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            Assignment 2 &mdash; Remote Asset PdM Strategy &amp; Maintenance Optimization
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ ...card, marginBottom: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Progress</span>
            <span style={{ color: ACCENT, fontSize: 14, fontWeight: 700 }}>{answered}/{TOTAL_QUESTIONS} answered</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${ACCENT}, #818cf8)`, borderRadius: 4 }}
            />
          </div>
        </motion.div>

        {/* Scenario Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            ...card,
            background: `linear-gradient(135deg, ${ACCENT_LIGHT}, rgba(99,102,241,0.03))`,
            border: `1px solid ${ACCENT_BORDER}`,
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>{'💨'}</span>
            <span style={{ color: ACCENT, fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-heading)' }}>
              Mission Brief
            </span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            You are the ML engineer for <strong>RajWindPower</strong>, operating <strong>25 wind turbines</strong> in the
            Jaisalmer desert. Each turbine cost <strong>₹8 Cr</strong>. Gearbox replacement costs <strong>₹50L + crane
            mobilization</strong>. Last year there were <strong>4 gearbox, 2 generator, and 8 blade pitch failures</strong>.
            Each maintenance visit to this remote site costs <strong>₹2L in transport alone</strong>. SCADA logs
            include wind speed, RPM, power output, nacelle temperature, gearbox vibration, and oil temperature
            over <strong>5 years</strong>. Design a PdM system that cuts costs and extends equipment life.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
            {[
              { l: 'Turbines', v: '25' },
              { l: 'Turbine Cost', v: '₹8 Cr each' },
              { l: 'Gearbox Cost', v: '₹50L + crane' },
              { l: 'Visit Cost', v: '₹2L/trip' },
              { l: 'Last Year Failures', v: '14 total' },
              { l: 'SCADA History', v: '5 years' },
            ].map(m => (
              <div key={m.l} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 16px', flex: '1 1 120px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{m.l}</div>
                <div style={{ color: ACCENT, fontWeight: 700, fontSize: 18, marginTop: 2 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        {SECTIONS.map((sec, idx) => (
          <motion.div
            key={sec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            style={{ marginBottom: 16 }}
          >
            <SectionCard
              section={sec}
              expanded={!!expanded[sec.id]}
              onToggle={() => toggleSection(sec.id)}
              responses={responses}
              setR={setR}
              getR={getR}
              onSave={handleSave}
              saving={saving}
            />
          </motion.div>
        ))}

        {/* Save / Submit Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ ...card, textAlign: 'center', marginTop: 32, marginBottom: 40 }}
        >
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '14px 36px', borderRadius: 12, border: `2px solid ${ACCENT}`,
                background: 'transparent', color: ACCENT, fontSize: 16, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heading)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: '14px 36px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${ACCENT}, #818cf8)`,
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heading)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              Submit Final
            </motion.button>
          </div>
          {saveMsg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: saveMsg.includes('Failed') ? '#ef4444' : ACCENT, fontSize: 14, margin: 0 }}
            >
              {saveMsg}
            </motion.p>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
            You can save your progress at any time and come back later. Submit when you are ready for review.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION CARD (Expandable)
   ═══════════════════════════════════════════════════════════════════ */
function SectionCard({ section, expanded, onToggle, responses, setR, getR, onSave, saving }) {
  const filledCount = section.questions.filter(q => responses[q] && String(responses[q]).trim()).length
  const total = section.questions.length
  const allFilled = total > 0 && filledCount === total

  return (
    <div style={{
      ...card,
      marginBottom: 0,
      border: expanded ? `1px solid ${ACCENT_BORDER}` : '1px solid var(--border)',
    }}>
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, gap: 14,
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: allFilled ? ACCENT : expanded ? ACCENT_LIGHT : 'var(--bg-secondary)',
          color: allFilled ? '#fff' : expanded ? ACCENT : 'var(--text-secondary)',
          fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-heading)',
        }}>
          {allFilled ? '✓' : section.id}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 18, margin: 0,
          }}>
            Section {section.id}: {section.title}
          </h3>
          {total > 0 && (
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {filledCount}/{total} question{total > 1 ? 's' : ''} answered
            </span>
          )}
        </div>
        <span style={{
          fontSize: 20, color: 'var(--text-secondary)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
        }}>
          {'▼'}
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          style={{ marginTop: 20, overflow: 'hidden' }}
        >
          {section.id === 1 && <Section1 setR={setR} getR={getR} />}
          {section.id === 2 && <Section2 setR={setR} getR={getR} />}
          {section.id === 3 && <Section3 setR={setR} getR={getR} />}
          {section.id === 4 && <Section4 setR={setR} getR={getR} />}
          {section.id === 5 && <Section5 setR={setR} getR={getR} />}
          {section.id === 6 && <Section6 setR={setR} getR={getR} />}
          {section.id === 7 && <Section7 />}

          {total > 0 && (
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSave}
                disabled={saving}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: `1px solid ${ACCENT}`,
                  background: ACCENT_LIGHT, color: ACCENT, fontSize: 14, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {saving ? 'Saving...' : 'Save Progress'}
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TEXTAREA WITH CHAR COUNT
   ═══════════════════════════════════════════════════════════════════ */
function TextInput({ label, value, onChange, rows, placeholder }) {
  const len = (value || '').length
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        rows={rows || 5}
        style={textarea}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
      <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
        {len} character{len !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MCQ COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
function MCQ({ qId, setR, getR }) {
  const data = MCQ_DATA[qId]
  const selected = getR(qId)
  const hasAnswered = !!selected

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{data.question}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.options.map(opt => {
          const isSelected = selected === opt.key
          const isCorrect = opt.key === data.answer

          let borderColor = 'var(--border)'
          let bg = 'var(--bg-secondary)'
          let textColor = 'var(--text-primary)'

          if (isSelected) {
            borderColor = isCorrect ? '#22c55e' : '#ef4444'
            bg = isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'
          } else if (hasAnswered && isCorrect) {
            borderColor = '#22c55e'
            bg = 'rgba(34,197,94,0.06)'
          }

          return (
            <button
              key={opt.key}
              onClick={() => setR(qId, opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${borderColor}`,
                background: bg, textAlign: 'left', width: '100%',
                transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: `2px solid ${isSelected ? borderColor : 'var(--border)'}`,
                background: isSelected ? borderColor : 'transparent',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700,
              }}>
                {opt.key}
              </span>
              <span style={{ color: textColor, fontSize: 15, lineHeight: 1.5 }}>{opt.text}</span>
              {hasAnswered && isSelected && (
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: isCorrect ? '#22c55e' : '#ef4444' }}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {hasAnswered && selected !== data.answer && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: '#22c55e', fontSize: 13, marginTop: 8 }}
        >
          The correct answer is highlighted above.
        </motion.p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 1 — Failure Analysis
   ═══════════════════════════════════════════════════════════════════ */
function Section1({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q1: Analyze the failure history: 4 gearbox failures, 2 generator failures, 8 blade pitch failures. For each failure type, describe: (a) the physical mechanism of failure, (b) which SCADA signals would show early warning signs, and (c) the business impact per event (downtime, cost, logistics)."
        value={getR(1)}
        onChange={v => setR(1, v)}
        rows={10}
        placeholder="Gearbox Failures (4 events):&#10;  Mechanism: Gear tooth wear, bearing degradation, lubricant breakdown under high torque — amplified by desert heat&#10;  Early signals: Rising gearbox oil temperature (>80°C threshold), increasing vibration RMS at gear mesh frequencies, oil debris particle count&#10;  Business impact: ₹50L replacement + crane hire ₹5-10L + 2-week downtime × ₹40K/day revenue loss = ~₹65L per event&#10;&#10;Generator Failures (2 events):&#10;  Mechanism: Winding insulation breakdown from thermal cycling, bearing failure, rotor imbalance&#10;  Early signals: Rising stator winding temperature, increasing reactive power draw, voltage imbalance between phases&#10;  Business impact: ₹15-20L rewind or replacement + 1-week downtime + ₹2L site visit&#10;&#10;Blade Pitch Failures (8 events):&#10;  Mechanism: Pitch actuator motor burnout, hydraulic seal failure, pitch bearing corrosion from desert sand ingress&#10;  Early signals: Increasing pitch motor current, slower pitch response time, asymmetric blade angle between the three blades&#10;  Business impact: Less severe — turbine throttles down, ₹3-5L repair + ₹2L visit; but 8 events = high frequency"
      />
      <MCQ qId={2} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — Sensor Strategy
   ═══════════════════════════════════════════════════════════════════ */
function Section2({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q3: The existing SCADA system collects wind speed, RPM, power output, nacelle temperature, gearbox vibration, and oil temperature. Design an enhanced sensor strategy: (a) identify gaps — which failure modes are NOT covered by current sensors, (b) recommend additional sensors with justification and estimated cost, and (c) explain the data transmission challenge for a remote desert site."
        value={getR(3)}
        onChange={v => setR(3, v)}
        rows={11}
        placeholder="Current SCADA Coverage Gaps:&#10;  Blade pitch: No pitch angle encoder feedback, no pitch motor current — 8 blade failures are invisible until they happen&#10;  Generator: No winding temperature per phase, no rotor vibration — generator health is undermonitored&#10;  Gearbox: Vibration exists but no oil particle counter — early metal debris predicts failure 3 months earlier than vibration&#10;&#10;Recommended Additional Sensors:&#10;  1. Blade pitch encoders (3 per turbine): Continuous pitch angle → detect actuator lag. Cost: ₹15K × 25 turbines = ₹3.75L&#10;  2. Pitch motor current clamps (3 per turbine): Rising current = mechanical friction. Cost: ₹5K × 25 × 3 = ₹3.75L&#10;  3. Oil particle counter (gearbox): Online debris monitoring. Cost: ₹80K × 25 = ₹20L — justified by ₹65L gearbox event cost&#10;  4. Generator winding temperature (3 phases): ₹10K × 25 × 3 = ₹7.5L&#10;  Total additional sensor investment: ~₹35L&#10;&#10;Data Transmission Challenge:&#10;  Jaisalmer is remote — no fiber, limited cellular coverage&#10;  Solution: 4G LTE gateway per turbine cluster (5 turbines share one gateway)&#10;  Bandwidth optimization: Transmit 1-minute aggregates normally; trigger 1-second raw burst on anomaly detection&#10;  Backup: Onsite edge device buffers 7 days of data locally in case of connectivity loss"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — Feature Engineering
   ═══════════════════════════════════════════════════════════════════ */
function Section3({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q4: Wind turbines have a complex relationship between wind speed and power output called the power curve. Explain what the power curve is, how to model the expected power curve from 5 years of historical data, and how deviations from the expected curve can serve as a health indicator feature."
        value={getR(4)}
        onChange={v => setR(4, v)}
        rows={9}
        placeholder="What is the Power Curve:&#10;  The power curve maps wind speed (m/s) to expected power output (kW). Each turbine has a design curve from the manufacturer. In real operation, the actual curve depends on air density, turbine health, and blade condition.&#10;&#10;Modeling the Baseline Curve from Historical Data:&#10;  Use 5 years of (wind_speed, power_output) pairs when the turbine was known healthy (post-maintenance periods)&#10;  Bin wind speeds into 0.5 m/s intervals; compute median power in each bin → empirical baseline curve&#10;  Fit a piecewise polynomial or isotonic regression to smooth the curve&#10;&#10;Power Curve Deviation as Health Feature:&#10;  At each timestep: deviation = actual_power − expected_power(wind_speed)&#10;  Rolling 24h mean deviation: persistent underperformance signals aerodynamic or mechanical loss&#10;  Rolling 24h std deviation: high variance signals unstable operation (pitch control issues)&#10;  These features capture degradation across ALL failure modes simultaneously without knowing which component is failing"
      />
      <MCQ qId={5} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — Model Design
   ═══════════════════════════════════════════════════════════════════ */
function Section4({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q6: Design a multi-component PdM model architecture for wind turbines. Should you use one model for all failure types (gearbox, generator, blade pitch) or separate models per component? Justify your choice, describe the model inputs and outputs, and explain how you handle the challenge of rare events (only 14 failures across 25 turbines over one year)."
        value={getR(6)}
        onChange={v => setR(6, v)}
        rows={11}
        placeholder="Architecture Decision: Separate models per component vs. one shared model&#10;&#10;Recommendation: Separate models per component type — with a shared anomaly detection layer&#10;&#10;Justification:&#10;  Each component has different failure mechanisms and sensor signals — a gearbox model uses oil temp and gear mesh vibration; blade model uses pitch angle and motor current. A combined model would dilute these signals.&#10;  However, a shared anomaly detection score (power curve deviation, overall vibration level) acts as a first-pass filter to flag turbines for closer inspection.&#10;&#10;Per-Component Model Design:&#10;  Gearbox model: Inputs = oil_temp, oil_particle_count, gear_mesh_vibration_spectrum, operating_hours_since_last_oil_change. Output = P(failure within 30 days)&#10;  Blade pitch model: Inputs = pitch_angle_3blades, pitch_motor_current_3blades, pitch_response_time, wind_speed. Output = P(pitch actuator failure within 14 days)&#10;  Generator model: Inputs = winding_temp_3phases, reactive_power, rotor_vibration. Output = P(generator failure within 30 days)&#10;&#10;Handling Rare Events (14 failures / 25 turbines / year):&#10;  With only ~14 positive labels per year, supervised learning is underpowered. Strategy:&#10;  Phase 1: Unsupervised anomaly detection (Isolation Forest, autoencoder) to flag deviations from normal without labeled failures&#10;  Phase 2: As more failure events accumulate over 2-3 years, train semi-supervised gradient boosted classifier with synthetic minority oversampling (SMOTE)&#10;  Transfer learning: Use gearbox failure patterns from published wind energy research as prior"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — Maintenance Scheduling
   ═══════════════════════════════════════════════════════════════════ */
function Section5({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q7: Design a maintenance scheduling optimizer that uses PdM predictions to batch turbine repairs and minimize total trip costs. Describe the optimization problem: what are the decision variables, constraints (weather windows, spare part availability, crew count), and objective function? How do you balance the risk of waiting to batch repairs vs acting immediately?"
        value={getR(7)}
        onChange={v => setR(7, v)}
        rows={10}
        placeholder="Optimization Problem:&#10;  Decision variable: For each turbine t with alert, choose repair_date[t] from [today, today+30days]&#10;  Group turbines with repair_date within 3 days of each other into one visit batch&#10;&#10;Objective: Minimize total_trip_cost + expected_failure_cost_from_waiting&#10;  total_trip_cost = ₹2L × number_of_distinct_visits&#10;  failure_cost_from_waiting = P(failure before scheduled repair) × failure_severity (₹65L for gearbox)&#10;&#10;Constraints:&#10;  Weather window: Jaisalmer dust storms April-June — visits must be scheduled outside monsoon season&#10;  Spare parts: Gearbox lead time is 6 weeks — must order before scheduling repair&#10;  Crew: 2 technician teams available — max 2 turbines per 3-day visit window&#10;  Max wait: Never delay a Red alert (>85% failure probability) more than 48 hours&#10;&#10;Risk Balancing Logic:&#10;  Calculate expected_value_of_waiting: if P(fail_next_7days) = 20% and failure_cost = ₹65L, then EV = ₹13L&#10;  If trip_savings_from_batching < EV_of_waiting → act immediately&#10;  If trip_savings > EV_of_waiting → batch with next scheduled visit&#10;  Refresh calculation daily as failure probabilities evolve"
      />
      <MCQ qId={8} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 6 — ROI Analysis
   ═══════════════════════════════════════════════════════════════════ */
function Section6({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q9: Calculate the annual cost of failures under the current reactive maintenance approach. Break down costs by failure type (gearbox, generator, blade pitch), including part cost, crane, technician travel, and lost energy production revenue."
        value={getR(9)}
        onChange={v => setR(9, v)}
        rows={9}
        placeholder="Current Annual Failure Costs:&#10;&#10;Gearbox (4 failures):&#10;  Part + crane: 4 × ₹60L = ₹2.40 Cr&#10;  2-week downtime × ₹40K/day energy revenue: 4 × 14 × 40,000 = ₹2.24 Cr&#10;  Travel (separate emergency trips): 4 × ₹2L = ₹8L&#10;  Subtotal: ~₹4.72 Cr&#10;&#10;Generator (2 failures):&#10;  Part + labor: 2 × ₹18L = ₹36L&#10;  1-week downtime: 2 × 7 × ₹40K = ₹56L&#10;  Travel: 2 × ₹2L = ₹4L&#10;  Subtotal: ~₹96L&#10;&#10;Blade Pitch (8 failures):&#10;  Part + labor: 8 × ₹4L = ₹32L&#10;  2-day downtime: 8 × 2 × ₹40K = ₹64L&#10;  Travel: 8 × ₹2L = ₹16L (emergency single-turbine trips)&#10;  Subtotal: ~₹1.12 Cr&#10;&#10;Total Annual Failure Cost: ₹4.72 + ₹0.96 + ₹1.12 = ₹6.80 Cr/year"
      />
      <MCQ qId={10} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 7 — Hindi Summary
   ═══════════════════════════════════════════════════════════════════ */
function Section7() {
  return (
    <div>
      <HindiExplainer
        concept="विंड टर्बाइन प्रेडिक्टिव मेंटेनेंस"
        english="Wind Turbine Predictive Maintenance"
        explanation="जैसलमेर के रेगिस्तान में 25 wind turbines हैं, हर एक ₹8 Cr का। Gearbox बदलने का खर्च ₹50L + crane — और site तक पहुंचने में ही ₹2L! SCADA system हर turbine से wind speed, RPM, power, nacelle temperature, gearbox vibration और oil temperature collect करता है। PdM system इन signals से failure की 2-4 हफ्ते पहले prediction देता है ताकि maintenance visit plan हो सके।"
        example="मान लो तीन turbines के gearbox का oil temperature धीरे-धीरे बढ़ रहा है — 65°C, 70°C, 75°C। PdM model alert देता है कि तीनों को अगले महीने attention चाहिए। हम एक ही trip में तीनों का maintenance करते हैं — ₹6L की जगह सिर्फ ₹2L खर्च। यही है 'batched maintenance' का फायदा।"
        terms={[
          { hindi: 'पावर कर्व', english: 'Power Curve', meaning: 'Wind speed और power output का relationship — इससे turbine की health measure होती है' },
          { hindi: 'SCADA', english: 'SCADA System', meaning: 'Supervisory Control and Data Acquisition — industrial machines का real-time monitoring system' },
          { hindi: 'बैच्ड मेंटेनेंस', english: 'Batched Maintenance', meaning: 'Multiple turbines का एक साथ maintenance — travel cost बचाने के लिए' },
          { hindi: 'एनोमली डिटेक्शन', english: 'Anomaly Detection', meaning: 'Normal pattern से deviation detect करना — labeled failure data के बिना भी काम करता है' },
        ]}
      />
    </div>
  )
}
