import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'pdm'
const ASSIGNMENT_ID = 3
const TOTAL_QUESTIONS = 10
const ACCENT = '#6366f1'
const ACCENT_LIGHT = 'rgba(99,102,241,0.12)'
const ACCENT_BORDER = 'rgba(99,102,241,0.3)'

const SECTIONS = [
  { id: 1, title: 'Component Criticality', questions: [1, 2] },
  { id: 2, title: 'Data Strategy', questions: [3] },
  { id: 3, title: 'Feature Design', questions: [4, 5] },
  { id: 4, title: 'Fleet Modeling', questions: [6] },
  { id: 5, title: 'Safety Integration', questions: [7, 8] },
  { id: 6, title: 'Operational Constraints', questions: [9, 10] },
  { id: 7, title: 'Hindi Summary', questions: [] },
]

const MCQ_DATA = {
  2: {
    question: 'Which component failure would cause an immediate full train stop, endangering passenger safety?',
    options: [
      { key: 'a', text: 'Lighting failure — passengers are in darkness but train continues' },
      { key: 'b', text: 'Door mechanism failure — doors cannot be secured for travel' },
      { key: 'c', text: 'Braking system failure — train cannot decelerate or stop safely' },
      { key: 'd', text: 'HVAC failure — uncomfortable but not a safety stop' },
    ],
    answer: 'c',
  },
  5: {
    question: 'Which pattern in door sensor data most strongly predicts an imminent door mechanism failure?',
    options: [
      { key: 'a', text: 'Ambient temperature alone — doors fail more in summer' },
      { key: 'b', text: 'Increasing door motor current combined with longer open/close cycle time' },
      { key: 'c', text: 'Paint wear visible on door frames — cosmetic deterioration indicator' },
      { key: 'd', text: 'Passenger count — high usage wears doors faster' },
    ],
    answer: 'b',
  },
  8: {
    question: 'What is the correct role of a PdM system for braking components in a metro rail context?',
    options: [
      { key: 'a', text: 'Replace all manual inspections — the ML model is more reliable' },
      { key: 'b', text: 'Supplement but never replace mandatory safety inspections — PdM adds early warning, safety inspections remain the authority' },
      { key: 'c', text: 'Only alert drivers in the cab — maintenance teams are not needed' },
      { key: 'd', text: 'Proactively disable brakes when model detects risk to prevent harm' },
    ],
    answer: 'b',
  },
  10: {
    question: 'Preventing one emergency stop per month (30-min delay, 50,000 affected passengers) saves how many annual passenger-hours?',
    options: [
      { key: 'a', text: '100,000 passenger-hours per year' },
      { key: 'b', text: '300,000 passenger-hours (12 months × 30 min × 50,000 passengers ÷ 60)' },
      { key: 'c', text: '1,000,000 passenger-hours per year' },
      { key: 'd', text: '50,000 passenger-hours per year' },
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
export default function Assignment3_MetroRail() {
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
            Your Metro Rail PdM architecture has been submitted. An AI instructor will review your safety
            integration approach, fleet modeling strategy, and operational constraints analysis.
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
            Fleet Health Management &mdash; Delhi Metro (Fictionalized)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            Assignment 3 &mdash; Safety-Critical PdM for High-Frequency Urban Transit
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
            <span style={{ fontSize: 22 }}>{'🚇'}</span>
            <span style={{ color: ACCENT, fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-heading)' }}>
              Mission Brief
            </span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            You are the data science lead for a fictionalized <strong>Delhi Metro</strong> rolling stock division.
            The fleet has <strong>300+ coaches</strong>, each with <strong>12 monitored components</strong>:
            traction motor, door mechanism, braking system, HVAC, pantograph, wheel set, suspension, auxiliary power,
            battery, communication, lighting, and coupling. Each coach transmits OBD data in real time, with
            <strong> 10 years of inspection records</strong> and ridership data. Design a fleet-wide PdM
            architecture that prioritizes safety without halting the network.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
            {[
              { l: 'Fleet Size', v: '300+ coaches' },
              { l: 'Components / Coach', v: '12' },
              { l: 'Data Points', v: 'Real-time OBD' },
              { l: 'Historical Records', v: '10 years' },
              { l: 'Peak Ridership', v: '~50K/train' },
              { l: 'Operating Hours', v: '05:30–23:30' },
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
   SECTION 1 — Component Criticality
   ═══════════════════════════════════════════════════════════════════ */
function Section1({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q1: Rank the 12 monitored components (traction motor, door mechanism, braking system, HVAC, pantograph, wheel set, suspension, auxiliary power, battery, communication, lighting, coupling) by criticality for a metro system. Create three tiers — Safety-Critical (immediate stop if fails), Service-Impacting (train continues but degraded), and Passenger Comfort (does not affect operations). Justify your ranking with failure consequence reasoning."
        value={getR(1)}
        onChange={v => setR(1, v)}
        rows={10}
        placeholder="Tier 1 — Safety-Critical (immediate evacuation / train stop):&#10;  1. Braking system: Failure = inability to stop at stations or emergency stop — direct life risk&#10;  2. Wheel set: Derailment risk if flat spot, crack, or axle failure — catastrophic&#10;  3. Coupling: Loss of coach attachment at speed = catastrophic&#10;  4. Pantograph: Loss of traction power at speed causes coasting — secondary safety risk&#10;&#10;Tier 2 — Service-Impacting (train continues, but reduced capacity or speed):&#10;  5. Traction motor: One motor fails → train limps to depot; 2+ fail → service stop&#10;  6. Door mechanism: Doors cannot secure → train cannot depart; high-frequency failure in metro&#10;  7. Suspension: Ride quality degradation at speed; eventual bearing failure escalates to safety&#10;  8. Auxiliary power: Lights, HVAC, communication go offline; train continues but unsafe for passengers&#10;&#10;Tier 3 — Passenger Comfort (no immediate operational impact):&#10;  9. HVAC: Uncomfortable but not unsafe; Delhi summer makes this a PR issue&#10;  10. Battery: Emergency backup fails; concern only during power grid failure&#10;  11. Communication: PA and CCTV offline; safety concern only during emergency&#10;  12. Lighting: Emergency lighting is separate; normal lighting failure is comfort issue"
      />
      <MCQ qId={2} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — Data Strategy
   ═══════════════════════════════════════════════════════════════════ */
function Section2({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q3: The metro generates enormous real-time data from 300+ coaches × 12 components × multiple sensors each, transmitted continuously. Design the data architecture: (a) what data streams need real-time processing vs batch processing, (b) how to handle data volume (estimate daily data volume), and (c) how to use the 10-year historical inspection records as labeled training data despite annotation inconsistencies."
        value={getR(3)}
        onChange={v => setR(3, v)}
        rows={11}
        placeholder="Real-time Processing (sub-second latency required):&#10;  Braking system: pressure, response time — feed directly to onboard edge controller for immediate alert&#10;  Wheel set: vibration, axle load — real-time anomaly detection at each station entry&#10;  Pantograph: contact force, arc voltage — real-time for safety-critical power collection&#10;  Tool: Apache Kafka for streaming; onboard edge ML for safety-critical signals&#10;&#10;Batch Processing (minutes to hours acceptable):&#10;  HVAC, door motor current trends, bearing temperature trends, battery state of health&#10;  Aggregated every 10 minutes; model runs hourly predictions; results pushed to maintenance planning&#10;&#10;Data Volume Estimate:&#10;  300 coaches × 12 components × avg 5 sensors × 10Hz = 180,000 data points/second&#10;  Per day: 180,000 × 86,400 seconds ≈ 15.5 billion readings/day&#10;  With 8-byte float + timestamp: ~370 GB/day of raw sensor data&#10;  Solution: 1-second aggregates for batch → reduces to ~3.7 GB/day for non-safety signals&#10;&#10;Using 10-Year Inspection Records:&#10;  Annotation inconsistencies: different inspectors use different fault codes; some failures logged as 'scheduled replacement' not 'failure'&#10;  Normalization strategy: Map all maintenance codes to unified failure taxonomy (12 component types × 4 failure modes)&#10;  Use inspection date as failure label — define 'failure window' as 30 days before any unscheduled repair"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — Feature Design
   ═══════════════════════════════════════════════════════════════════ */
function Section3({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q4: Design a feature engineering strategy that accounts for the unique operational pattern of metro rail — fixed routes, regular acceleration/deceleration cycles, known station dwell times, and varying ridership. How do you normalize sensor readings for route position and ridership load to make features comparable across different operating conditions?"
        value={getR(4)}
        onChange={v => setR(4, v)}
        rows={10}
        placeholder="Route-Normalized Features:&#10;  Problem: Traction motor current at station departure acceleration is always high — not a fault signal&#10;  Solution: Segment each trip into phases (dwell, accelerate, cruise, decelerate) using GPS + speed profile&#10;  Compute features within each phase separately: 'cruise phase motor current RMS' is a clean health signal&#10;&#10;Load-Normalized Features:&#10;  Problem: Suspension load and wheel stress scale with passenger count (50K peak vs 2K off-peak)&#10;  Solution: Normalize sensor readings by OBD-reported coach weight (weighing at each station via axle load cells)&#10;  Feature: 'suspension deflection per ton of passenger load' removes ridership effect&#10;&#10;Cycle-Count Features:&#10;  Door open/close cycles per day: cumulative cycle count predicts door mechanism wear (door actuators have rated cycle life)&#10;  Pantograph contact events: number of high-current arcing events per route → predicts carbon wear&#10;  Brake applications per trip × average deceleration force → cumulative brake pad wear estimate&#10;&#10;Cross-Coach Features:&#10;  Compare wheel bearing vibration for same coach position across all trains on same route — statistical outlier within fleet is an early warning even before absolute threshold is crossed&#10;  'Fleet-relative anomaly score': how many standard deviations from fleet median for this route segment"
      />
      <MCQ qId={5} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — Fleet Modeling
   ═══════════════════════════════════════════════════════════════════ */
function Section4({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q6: With 300+ coaches each having 12 components, describe how you would structure the ML model fleet. Should you build one model per component type across all coaches, or one model per individual coach-component pair, or something else? Discuss: transfer learning between coaches, handling coaches of different age cohorts (coaches from 2010 vs coaches from 2022), and how to continuously update models without taking the system offline."
        value={getR(6)}
        onChange={v => setR(6, v)}
        rows={11}
        placeholder="Model Architecture Recommendation: Hierarchical Fleet Model&#10;&#10;Level 1 — Component-Type Global Model (one per component type, trained on all 300 coaches):&#10;  Captures universal failure patterns — braking physics is the same regardless of coach ID&#10;  Benefits from all 300 coaches × 10 years = large training set&#10;  Provides a baseline health score for each component type&#10;&#10;Level 2 — Coach-Specific Adaptation Layer (fine-tuned from Level 1 per coach):&#10;  Captures individual coach quirks — a specific coach may run slightly hot due to installation variance&#10;  Fine-tune with last 90 days of that coach's own data as personalization layer&#10;  Low data requirement since Level 1 handles the heavy lifting&#10;&#10;Handling Age Cohorts:&#10;  Coaches from 2010 have different hardware specs, higher baseline wear — create cohort feature (manufacture_year_bucket)&#10;  Do NOT mix 2010 and 2022 coaches in the same fine-tune batch — train separate Level 1 models per hardware generation&#10;&#10;Continuous Updates Without Downtime:&#10;  Blue-green model deployment: train new model weekly on latest data; shadow-mode test on live predictions for 48 hours before promoting&#10;  A/B testing: route new predictions through updated model for 10% of coaches; compare alert quality before full rollout&#10;  Rollback: keep previous model checkpoint; auto-rollback if false alarm rate doubles within 24 hours of deployment"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — Safety Integration
   ═══════════════════════════════════════════════════════════════════ */
function Section5({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q7: Design the safety integration protocol — how PdM alerts integrate with the existing metro safety management system. Address: (a) the chain of authority from ML alert to human decision to maintenance action, (b) which alerts can trigger automated responses vs always requiring human confirmation, and (c) how to prevent a false positive from causing an unnecessary service disruption during peak hours."
        value={getR(7)}
        onChange={v => setR(7, v)}
        rows={11}
        placeholder="Chain of Authority — ML Alert to Action:&#10;  1. ML model generates probabilistic health score every 10 minutes per coach-component&#10;  2. Alert tiers: Green (<30% failure probability) → log only; Yellow (30-60%) → notify maintenance planner; Orange (60-85%) → flag for next depot inspection; Red (>85%) → SMS to duty controller&#10;  3. Human decision required for any service change: no automated train withdrawal — controller confirms with on-train technician before action&#10;  4. Only onboard safety systems (wheel flat detector, brake pressure sensor) can auto-trigger emergency brake — ML PdM cannot&#10;&#10;Automated vs Human-Confirmed Actions:&#10;  Automated (no human needed): Create next-day inspection work order; reorder spare parts when stock < threshold; log health trend report&#10;  Human confirmation required: Withdraw train from service mid-route; reduce operating speed; schedule emergency depot stop&#10;  Never automated: Any safety-related command to the train control system&#10;&#10;False Positive Management During Peak Hours:&#10;  Peak hours (8-10am, 6-8pm) apply higher confirmation threshold: Red alert requires >92% probability, not 85%&#10;  Require corroboration: two independent sensor signals must both be anomalous before generating Orange/Red alert&#10;  Controller UI shows confidence interval: '87% ± 8%' not just '87%' — supports better human judgment&#10;  Post-event review: track every false positive; if a specific sensor type generates >30% false alarms, automatically reduce its weight in the ensemble"
      />
      <MCQ qId={8} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 6 — Operational Constraints
   ═══════════════════════════════════════════════════════════════════ */
function Section6({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q9: Metro coaches can only be maintained in the maintenance depot during the non-operational window (23:30–05:30 — a 6-hour window). Design the maintenance scheduling system: how do you prioritize which of the 300+ coaches to bring into the depot each night, given that only 20 maintenance bays are available, and some repairs require 2 or 3 consecutive nights?"
        value={getR(9)}
        onChange={v => setR(9, v)}
        rows={10}
        placeholder="Nightly Depot Scheduling Optimization:&#10;&#10;Inputs:&#10;  Health scores for all 300 coaches across 12 components (generated by 11 PM)&#10;  Maintenance bay availability: 20 bays total; 5 reserved for emergency, 15 for planned&#10;  Repair duration estimate: minor (1 night), major (2 nights), overhaul (3 nights)&#10;  Next day service plan: which coaches are needed for which lines in the morning&#10;&#10;Priority Scoring per Coach:&#10;  priority = max_component_failure_probability × criticality_weight × urgency_factor&#10;  criticality_weight: brakes=5, wheels=5, doors=3, HVAC=1&#10;  urgency_factor: doubles if same alert was raised yesterday and not actioned&#10;&#10;Scheduling Algorithm:&#10;  Greedy with constraint: Sort coaches by priority score descending; assign to available bays&#10;  Constraint 1: Coach cannot be scheduled if it is needed for first morning service before repair completes&#10;  Constraint 2: Multi-night repairs lock their bay across nights — do not double-book&#10;  Constraint 3: At least 240 coaches must be available for morning service (80% fleet availability)&#10;&#10;Output by Midnight:&#10;  Scheduled coach list with bay assignment and technician assignment sent to depot supervisor&#10;  Unscheduled high-risk coaches flagged for controller awareness during next day's service"
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
        concept="मेट्रो फ्लीट हेल्थ मैनेजमेंट"
        english="Metro Fleet Health Management System"
        explanation="Delhi Metro में 300+ coaches हैं, हर एक में 12 components monitor होते हैं — जैसे brakes, doors, traction motor, wheels। हर coach से real-time OBD data आता है। Safety-critical components (brakes, wheels) के लिए milliseconds में alert चाहिए — इसलिए edge processing onboard होती है। Comfort components (HVAC, lighting) के लिए batch processing ठीक है। PdM model रात को 11 बजे सभी coaches की health score calculate करता है — maintenance depot को पता चलता है कि अगली रात कौन से coaches को depot में लाना है।"
        example="जैसे दिल्ली मेट्रो के driver को ट्रेन चलाते वक्त हर signal, speed limit, और passenger load पता रहता है — वैसे ही PdM dashboard पर duty controller को हर coach की health score दिखती है। अगर coach C-247 के wheels का vibration pattern बदल रहा है, model 3 दिन पहले alert देता है — रात को maintenance होती है, सुबह coach ready। Passengers को पता भी नहीं चलता।"
        terms={[
          { hindi: 'OBD (ऑन-बोर्ड डायग्नोस्टिक्स)', english: 'On-Board Diagnostics', meaning: 'Vehicle में लगा हुआ sensor system जो real-time health data transmit करता है' },
          { hindi: 'क्रिटिकैलिटी रैंकिंग', english: 'Criticality Ranking', meaning: 'Components को उनकी safety importance के हिसाब से rank करना — brakes सबसे critical, lighting सबसे कम' },
          { hindi: 'मेंटेनेंस विंडो', english: 'Maintenance Window', meaning: 'वो समय जब metro बंद रहती है (23:30–05:30) — 6 घंटे में सभी repairs होनी चाहिए' },
          { hindi: 'फ्लीट मॉडल', english: 'Fleet Model', meaning: 'सभी coaches के data से train हुआ एक ML model — individual coach की quirks भी capture करता है' },
        ]}
      />
    </div>
  )
}
