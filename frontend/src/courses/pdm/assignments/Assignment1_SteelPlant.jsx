import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'pdm'
const ASSIGNMENT_ID = 1
const TOTAL_QUESTIONS = 10
const ACCENT = '#6366f1'
const ACCENT_LIGHT = 'rgba(99,102,241,0.12)'
const ACCENT_BORDER = 'rgba(99,102,241,0.3)'

const SECTIONS = [
  { id: 1, title: 'Data Assessment', questions: [1, 2] },
  { id: 2, title: 'ETL Design', questions: [3] },
  { id: 3, title: 'Data Quality', questions: [4, 5] },
  { id: 4, title: 'Feature Engineering', questions: [6] },
  { id: 5, title: 'Model Selection', questions: [7, 8] },
  { id: 6, title: 'Deployment', questions: [9] },
  { id: 7, title: 'ROI Analysis', questions: [10] },
  { id: 8, title: 'Hindi Summary', questions: [] },
]

const MCQ_DATA = {
  2: {
    question: 'Which sensor signal is most predictive for centrifugal pump bearing failure?',
    options: [
      { key: 'a', text: 'Temperature — heat is the primary indicator' },
      { key: 'b', text: 'Vibration — bearing degradation produces characteristic frequency signatures' },
      { key: 'c', text: 'Flow rate — flow drops when bearings fail' },
      { key: 'd', text: 'Pressure — back-pressure reveals bearing wear' },
    ],
    answer: 'b',
  },
  5: {
    question: 'A temperature sensor reads 9999°C for 3 consecutive readings. What is the most likely cause and correct action?',
    options: [
      { key: 'a', text: 'Actual extreme temperature — alert the plant immediately' },
      { key: 'b', text: 'Sensor malfunction — replace with interpolation from neighboring readings' },
      { key: 'c', text: 'Normal for a steel plant — ignore it' },
      { key: 'd', text: 'Data transmission error — ignore it and wait for the next reading' },
    ],
    answer: 'b',
  },
  8: {
    question: 'With only 5% of readings corresponding to actual failures (class imbalance), which evaluation metric matters most for the PdM model?',
    options: [
      { key: 'a', text: 'Accuracy — overall correctness is paramount' },
      { key: 'b', text: 'Precision — avoid too many false alarms for maintenance crews' },
      { key: 'c', text: 'Recall — missing a real failure is far more costly than a false alarm' },
      { key: 'd', text: 'R² score — measures explained variance in failure timing' },
    ],
    answer: 'c',
  },
  10: {
    question: 'If PdM reduces failures by 70%, what are the expected annual savings on a ₹3.2 Cr loss baseline?',
    options: [
      { key: 'a', text: '₹1.2 Cr' },
      { key: 'b', text: '₹2.24 Cr (70% of ₹3.2 Cr)' },
      { key: 'c', text: '₹3.2 Cr — all failures eliminated' },
      { key: 'd', text: '₹5 Cr — including indirect productivity gains' },
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
export default function Assignment1_SteelPlant() {
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
            Your SteelForge Industries PdM design has been submitted. An AI instructor will review your
            responses and provide feedback on your data pipeline, model choices, and ROI analysis.
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
            Pump Failure Prediction &mdash; SteelForge Industries
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            Assignment 1 &mdash; Predictive Maintenance Data Pipeline &amp; Model Design
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
            <span style={{ fontSize: 22 }}>{'🏭'}</span>
            <span style={{ color: ACCENT, fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-heading)' }}>
              Mission Brief
            </span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            You are the ML lead at <strong>SteelForge Industries</strong>, Jamshedpur. The plant operates
            <strong> 50 centrifugal pumps</strong> for cooling water circulation. Last year, <strong>12 unplanned
            pump failures</strong> caused <strong>₹3.2 Cr</strong> in lost production. You have access to
            6 months of sensor data (vibration, temperature, pressure, current), 3 years of work orders, and
            full asset profiles. Design a Predictive Maintenance solution to cut failures by at least 70%.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
            {[
              { l: 'Total Pumps', v: '50' },
              { l: 'Failures / Year', v: '12' },
              { l: 'Lost Production', v: '₹3.2 Cr' },
              { l: 'Sensor History', v: '6 months' },
              { l: 'Work Orders', v: '3 years' },
              { l: 'Target Reduction', v: '70%' },
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
          {section.id === 7 && <Section7 setR={setR} getR={getR} />}
          {section.id === 8 && <Section8 />}

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
   SECTION 1 — Data Assessment
   ═══════════════════════════════════════════════════════════════════ */
function Section1({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q1: You have three data sources — 6 months of sensor data (vibration, temperature, pressure, current), 3 years of maintenance work orders, and asset profiles for all 50 pumps. For each source, describe: (a) what predictive signal it provides, (b) its format and update frequency, and (c) which failure modes it can detect."
        value={getR(1)}
        onChange={v => setR(1, v)}
        rows={9}
        placeholder="Sensor data (vibration, temp, pressure, current):&#10;  Signal: Early degradation signatures — bearing wear raises vibration RMS, cavitation raises pressure fluctuation&#10;  Format: Time-series at ~1Hz per sensor per pump, ~6 months × 50 pumps × 4 sensors = ~31M rows&#10;  Detects: Bearing failure, impeller cavitation, motor overload, seal degradation&#10;&#10;Work orders (3 years):&#10;  Signal: Historical failure labels — maps timestamps to failure types and components replaced&#10;  Format: Structured records with datetime, pump_id, failure_type, technician notes&#10;  Detects: Provides ground truth for supervised learning; reveals recurring failure patterns&#10;&#10;Asset profiles:&#10;  Signal: Baseline reference — nameplate data, installation date, design operating range&#10;  Format: Static lookup table per pump (manufacturer, rated RPM, flow range, bearing specs)&#10;  Detects: Enables anomaly detection relative to each pump's own design envelope"
      />
      <MCQ qId={2} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — ETL Design
   ═══════════════════════════════════════════════════════════════════ */
function Section2({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q3: Design the ETL (Extract-Transform-Load) pipeline that joins sensor data with work orders and asset profiles. Describe: (a) how you align timestamps between sources, (b) the labeling strategy — how do you create the 'failure' label from work orders, and (c) how you handle the 'time to failure' window for early warning."
        value={getR(3)}
        onChange={v => setR(3, v)}
        rows={10}
        placeholder="Extract:&#10;  Pull sensor data from historian DB (e.g., OSIsoft PI) via SQL at 1-minute aggregates&#10;  Pull work orders from CMMS (SAP PM) via API or daily export&#10;  Load asset profiles from ERP static table&#10;&#10;Transform — Timestamp Alignment:&#10;  Normalize all timestamps to UTC, 1-minute buckets&#10;  Join sensor → work order on pump_id + timestamp range (sensor time BETWEEN work_order_start - 7days AND work_order_start)&#10;&#10;Labeling Strategy:&#10;  Label = 1 for all rows within T hours before a failure work order (e.g., T=24h for 24-hour advance warning)&#10;  Label = 0 for all other rows after excluding post-repair recovery periods (48h after repair)&#10;  Attach failure_type from work order to enable multi-class prediction&#10;&#10;Time-to-Failure Window:&#10;  Create TTF column: minutes from current row to next failure event&#10;  Use TTF to train both classification (TTF < threshold) and regression (predict exact TTF)&#10;  Balance dataset: positive (failure) rows are ~5% — use SMOTE or class weights"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — Data Quality
   ═══════════════════════════════════════════════════════════════════ */
function Section3({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q4: List five common data quality issues you would expect in industrial sensor data from a steel plant, and explain how you would detect and handle each one before model training."
        value={getR(4)}
        onChange={v => setR(4, v)}
        rows={10}
        placeholder="1. Missing values (sensor dropout):&#10;   Detect: >1% NaN in any 1-hour window flags a gap event&#10;   Fix: Forward-fill gaps <5 min; linear interpolation 5–30 min; flag and exclude gaps >30 min&#10;&#10;2. Stuck sensor (constant value):&#10;   Detect: Std deviation of last 60 readings < 0.001 (sensor pegged)&#10;   Fix: Mark as missing; alert maintenance to inspect sensor&#10;&#10;3. Outlier spikes (9999°C readings):&#10;   Detect: Z-score > 4 or physical limit exceeded (temp > 200°C for pump)&#10;   Fix: Replace with median of ±5 adjacent readings (Winsorize)&#10;&#10;4. Calibration drift:&#10;   Detect: Slow monotonic trend across weeks without matching process change&#10;   Fix: Detrend using rolling baseline; flag sensor for recalibration&#10;&#10;5. Clock skew between sensors and CMMS:&#10;   Detect: Work order timestamp vs sensor data timestamp mismatch by >10 min&#10;   Fix: Synchronize to plant master clock (NTP); adjust work order labels by measured offset"
      />
      <MCQ qId={5} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — Feature Engineering
   ═══════════════════════════════════════════════════════════════════ */
function Section4({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q6: Raw sensor readings (temperature, vibration, pressure, current) are not enough — you need engineered features that capture degradation trends. Design at least 8 features derived from the raw signals. For each feature, explain what failure mode it captures and how to compute it."
        value={getR(6)}
        onChange={v => setR(6, v)}
        rows={12}
        placeholder="1. Vibration RMS (rolling 10-min): sqrt(mean(v²)) — captures energy of vibration; rises as bearing wears&#10;&#10;2. Vibration kurtosis: 4th moment / variance² — spikes indicate impulsive bearing defect events&#10;&#10;3. Temperature delta from baseline: current_temp − median_temp_last_7days — detects gradual overheating independent of ambient&#10;&#10;4. Current imbalance: max(I_phase1, I_phase2, I_phase3) − min(...) — detects motor winding asymmetry&#10;&#10;5. Pressure fluctuation std (1-min window): captures cavitation as pressure instability&#10;&#10;6. Operating point deviation: (actual_flow − design_flow) / design_flow — detects off-curve operation that accelerates wear&#10;&#10;7. Bearing defect frequencies (FFT): amplitude at BPFO/BPFI/BSF from vibration spectrum — direct bearing fault signature&#10;&#10;8. Time since last maintenance: days since last PM or repair — encodes age-based degradation prior&#10;&#10;9. Cumulative operating hours: total runtime since last bearing replacement — captures wear accumulation&#10;&#10;10. Cross-sensor anomaly: correlation drop between vibration and current vs historical baseline — detects decoupling that signals mechanical looseness"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — Model Selection
   ═══════════════════════════════════════════════════════════════════ */
function Section5({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q7: Compare three candidate models for this PdM task: Random Forest, XGBoost, and LSTM (Long Short-Term Memory network). For each, discuss: (a) how it handles time-series data, (b) interpretability for maintenance engineers, (c) training data requirements, and (d) your recommendation with justification."
        value={getR(7)}
        onChange={v => setR(7, v)}
        rows={12}
        placeholder="Random Forest:&#10;  Time-series: Does NOT inherently model sequences — you must manually engineer lag features and rolling stats&#10;  Interpretability: HIGH — feature importance scores are explainable to engineers; can point to 'vibration kurtosis at lag-5min is top predictor'&#10;  Data needs: Works well with 6 months of data; handles missing values via surrogates&#10;  Assessment: Good baseline; fast to train and deploy; limited at capturing long temporal dependencies&#10;&#10;XGBoost:&#10;  Time-series: Same as RF — needs feature engineering; but better at capturing non-linear interactions&#10;  Interpretability: MEDIUM — SHAP values provide feature attribution per prediction&#10;  Data needs: Similar to RF; handles class imbalance better with scale_pos_weight parameter&#10;  Assessment: Best performance-to-interpretability tradeoff; recommended as production model&#10;&#10;LSTM:&#10;  Time-series: NATIVELY models sequences — learns long-term dependencies across hours of sensor readings&#10;  Interpretability: LOW — black box; hard to explain to engineers why it fired&#10;  Data needs: Needs much more data (years, not months) and GPU for training&#10;  Assessment: Overkill for 6 months of data from 50 pumps; revisit after 2+ years of data collection&#10;&#10;Recommendation: XGBoost with engineered features for production; LSTM as research track once data grows"
      />
      <MCQ qId={8} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 6 — Deployment
   ═══════════════════════════════════════════════════════════════════ */
function Section6({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q9: Design the alert system that delivers predictions to maintenance engineers on the shop floor. Specify: (a) alert thresholds and lead times (how many hours before predicted failure to alert), (b) how to prioritize when multiple pumps are at risk simultaneously, (c) the alert delivery mechanism (dashboard, SMS, work order creation), and (d) how to handle alert fatigue from false positives."
        value={getR(9)}
        onChange={v => setR(9, v)}
        rows={11}
        placeholder="Alert Thresholds:&#10;  Yellow (watch): Failure probability > 30%, predicted within 72 hours — log to dashboard, no action required&#10;  Orange (plan): Failure probability > 60%, predicted within 48 hours — create scheduled work order, order spares&#10;  Red (act now): Failure probability > 85%, predicted within 24 hours — SMS to shift supervisor + auto-create emergency WO&#10;&#10;Prioritization:&#10;  Priority score = failure_probability × production_impact_factor (pump criticality from asset profile)&#10;  Rank all active alerts; display top 5 on dashboard; only Red alerts trigger SMS&#10;&#10;Delivery Mechanism:&#10;  Real-time dashboard (web app) refreshed every 5 min for shift supervisors&#10;  SMS/WhatsApp via Twilio API for Orange/Red alerts to on-call engineer&#10;  Auto-create SAP PM work order via API for Red alerts with predicted failure type pre-filled&#10;&#10;Alert Fatigue Prevention:&#10;  Track false alarm rate per alert level weekly; auto-raise threshold if false alarm rate >20%&#10;  Require engineer to label each alert as TP/FP after resolution — feeds back into model retraining&#10;  Silence repeated alerts for same pump if work order already raised"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 7 — ROI Analysis
   ═══════════════════════════════════════════════════════════════════ */
function Section7({ setR, getR }) {
  return (
    <div>
      <MCQ qId={10} setR={setR} getR={getR} />
      <TextInput
        label="Bonus: Build a complete ROI case for the SteelForge management team. Include: (a) estimated annual savings at 70% failure reduction, (b) implementation costs (sensors, software, engineering time), (c) payback period, and (d) non-financial benefits that are hard to quantify."
        value={getR('10b')}
        onChange={v => setR('10b', v)}
        rows={9}
        placeholder="Annual Savings:&#10;  Current losses: ₹3.2 Cr/year from 12 failures&#10;  PdM reduces failures by 70% → 8.4 fewer failures → ₹2.24 Cr saved in lost production&#10;  Additional savings: 30% reduction in emergency spare parts cost (rush procurement) ≈ ₹15L&#10;  Total annual benefit: ~₹2.39 Cr&#10;&#10;Implementation Costs (one-time):&#10;  Additional vibration sensors (if gaps): 50 pumps × ₹8,000/sensor = ₹4L&#10;  Data historian license upgrade: ₹10L&#10;  ML platform (cloud or on-prem): ₹12L setup + ₹5L/year&#10;  Engineering + data science effort (6 months): ₹20L&#10;  Total capex: ~₹46L, opex: ~₹5L/year&#10;&#10;Payback Period: ₹46L ÷ ₹2.39 Cr/year ≈ 2.3 months after go-live&#10;&#10;Non-financial Benefits:&#10;  Worker safety — no emergency repairs near hot steel processes&#10;  Equipment life extension — early intervention reduces secondary damage&#10;  Compliance — documented maintenance records for ISO 55000 asset management"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 8 — Hindi Summary
   ═══════════════════════════════════════════════════════════════════ */
function Section8() {
  return (
    <div>
      <HindiExplainer
        concept="प्रेडिक्टिव मेंटेनेंस पाइपलाइन"
        english="Predictive Maintenance Data Pipeline"
        explanation="SteelForge की factory में 50 pumps हैं जो cooling water circulate करते हैं। हर pump में sensors लगे हैं — vibration (कंपन), temperature (तापमान), pressure (दबाव), और current (बिजली)। जब pump खराब होने वाला होता है, तो इन sensors की readings बदलने लगती हैं — जैसे bearing घिसने पर vibration बढ़ती है। हमारा ML model इन patterns को पहचानकर 24-48 घंटे पहले alert देता है।"
        example="जैसे एक अनुभवी मिस्त्री (mechanic) pump की आवाज़ सुनकर बता सकता है कि 'यह bearing 2 हफ्ते में जाएगी' — वैसे ही हमारा model sensor data देखकर failure predict करता है। फ़र्क यह है कि model 50 pumps को एक साथ, 24×7 monitor करता है — कोई भी मिस्त्री इतना नहीं कर सकता।"
        terms={[
          { hindi: 'कंपन (वाइब्रेशन)', english: 'Vibration', meaning: 'Machine का हिलना-डुलना — bearing खराब होने पर ज़्यादा और अलग pattern में हिलती है' },
          { hindi: 'ETL पाइपलाइन', english: 'ETL Pipeline', meaning: 'Extract (निकालो), Transform (साफ़ करो), Load (store करो) — raw sensor data को ML-ready format में बदलना' },
          { hindi: 'फीचर इंजीनियरिंग', english: 'Feature Engineering', meaning: 'Raw readings से meaningful signals निकालना — जैसे average, standard deviation, frequency spectrum' },
          { hindi: 'ROI (रिटर्न ऑन इन्वेस्टमेंट)', english: 'Return on Investment', meaning: 'Invest किए पैसे पर कितना फायदा — ₹46L invest करके ₹2.39 Cr/year बचाना' },
        ]}
      />
    </div>
  )
}
