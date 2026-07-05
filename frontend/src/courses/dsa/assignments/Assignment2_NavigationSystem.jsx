import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'dsa'
const ASSIGNMENT_ID = 2
const TOTAL_QUESTIONS = 10
const ACCENT = '#f59e0b'
const ACCENT_LIGHT = 'rgba(245,158,11,0.12)'
const ACCENT_BORDER = 'rgba(245,158,11,0.3)'

const SECTIONS = [
  { id: 1, title: 'Graph Modeling', questions: [1, 2] },
  { id: 2, title: 'Shortest Path Algorithm', questions: [3, 4] },
  { id: 3, title: 'Real-Time Traffic', questions: [5, 6] },
  { id: 4, title: 'Multi-Stop Routes', questions: [7] },
  { id: 5, title: 'Alternative Routes', questions: [8] },
  { id: 6, title: 'Offline Navigation', questions: [9, 10] },
  { id: 7, title: 'Hindi Summary', questions: [] },
]

const MCQ_DATA = {
  2: {
    question: 'For representing 50,000 intersections with an average of 3 roads each, which graph representation is most space-efficient?',
    options: [
      { key: 'a', text: 'Adjacency Matrix — O(V²)' },
      { key: 'b', text: 'Adjacency List — O(V + E)' },
      { key: 'c', text: 'Edge List — O(E)' },
      { key: 'd', text: 'Incidence Matrix — O(V × E)' },
    ],
    answer: 'b',
  },
  4: {
    question: "Why can't BFS be used directly for finding the fastest route (by travel time)?",
    options: [
      { key: 'a', text: "BFS doesn't work on directed graphs" },
      { key: 'b', text: 'BFS finds shortest by hop count, not by edge weights — a 3-hop highway route may be faster than a 2-hop local route' },
      { key: 'c', text: 'BFS requires too much memory' },
      { key: 'd', text: "BFS can't handle cycles" },
    ],
    answer: 'b',
  },
  6: {
    question: "If a road's travel time doubles due to an accident, which data structure allows O(log n) update of the affected route weight in Dijkstra's?",
    options: [
      { key: 'a', text: 'Array' },
      { key: 'b', text: 'Linked List' },
      { key: 'c', text: 'Min-Heap / Priority Queue' },
      { key: 'd', text: 'Hash Map' },
    ],
    answer: 'c',
  },
  10: {
    question: 'To pre-compute all-pairs shortest paths for 50,000 nodes, Floyd-Warshall takes O(V³). For V=50,000, approximately how many operations is that?',
    options: [
      { key: 'a', text: '125 billion' },
      { key: 'b', text: '125 trillion' },
      { key: 'c', text: '2.5 billion' },
      { key: 'd', text: '50 million' },
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
export default function Assignment2_NavigationSystem() {
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
            Your Delhi NCR navigation system design has been submitted. An AI instructor will review your
            routing algorithm choices, data structure decisions, and real-time traffic handling strategy.
          </p>
          <div style={{ ...card, textAlign: 'left' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              Submission Summary
            </h3>
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
          <AIEvaluationPanel courseId={COURSE_ID} assignmentId={ASSIGNMENT_ID} />
        </motion.div>
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
            Build a Navigation System &mdash; MapMyIndia / Mappls
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            Assignment 2 &mdash; Graph Algorithms &amp; Data Structures Case Study
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
              style={{ height: '100%', background: `linear-gradient(90deg, ${ACCENT}, #f97316)`, borderRadius: 4 }}
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
            background: `linear-gradient(135deg, ${ACCENT_LIGHT}, rgba(245,158,11,0.03))`,
            border: `1px solid ${ACCENT_BORDER}`,
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>{'&#x1F5FA;'}</span>
            <span style={{ color: ACCENT, fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-heading)' }}>
              Mission Brief
            </span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            You are the lead engineer at <strong>MapMyIndia</strong> (now <strong>Mappls</strong>), India&rsquo;s
            largest digital map company. Your task: build a real-time navigation system for <strong>Delhi NCR</strong>.
            The network has <strong>50,000 intersections</strong>, <strong>150,000 road segments</strong>, and live
            traffic feeds updating every few minutes. Design the routing algorithm from scratch &mdash; graph
            representation, shortest path, real-time updates, multi-stop optimization, and offline fallback.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
            {[
              { l: 'Intersections', v: '50,000' },
              { l: 'Road Segments', v: '1,50,000' },
              { l: 'Traffic Updates', v: 'Every 2 min' },
              { l: 'Target Accuracy', v: '>95%' },
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
                background: `linear-gradient(135deg, ${ACCENT}, #f97316)`,
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
          {total === 0 && (
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              Hindi concept explainer
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
   TEXT INPUT WITH CHAR COUNT
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
              {isSelected && (
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
   SECTION 1 — Graph Modeling (Q1-2)
   ═══════════════════════════════════════════════════════════════════ */
function Section1({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q1: How would you model Delhi's road network as a graph? Define what nodes and edges represent, what the edge weights would be, and whether the graph is directed or undirected. Give specific examples (e.g., one-way streets, flyovers, U-turns)."
        value={getR(1)}
        onChange={v => setR(1, v)}
        rows={8}
        placeholder={'Nodes: Each intersection or point of interest (e.g., Connaught Place roundabout, DND flyway entry point)\nEdges: Road segments connecting two intersections\nEdge weights: Travel time in seconds (dynamic), or distance in metres (static)\n\nDirected graph because:\n- One-way streets: e.g., inner CP road is one-way clockwise\n- Flyovers: entry/exit are at different points\n- U-turns: not allowed at many Delhi intersections\n\nExample: NH-48 (Delhi-Gurgaon expressway) has a directed edge from Mahipalpur to Rajiv Chowk but not the reverse on the same physical lane...'}
      />
      <MCQ qId={2} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — Shortest Path Algorithm (Q3-4)
   ═══════════════════════════════════════════════════════════════════ */
function Section2({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q3: Compare BFS, Dijkstra's, and A* for finding the shortest route from Connaught Place to Gurgaon Cyber Hub. For each algorithm: when it works, time complexity, and limitations. Which would you choose and why?"
        value={getR(3)}
        onChange={v => setR(3, v)}
        rows={10}
        placeholder={'BFS:\n  Works when: all edges have equal weight (hop count only)\n  Time complexity: O(V + E)\n  Limitation: Cannot handle weighted edges — ignores that a highway is faster than a local road\n\nDijkstra\'s:\n  Works when: all edge weights are non-negative\n  Time complexity: O((V + E) log V) with min-heap\n  Limitation: No direction bias — explores uniformly in all directions\n\nA* (A-star):\n  Works when: we have a heuristic (e.g., Euclidean/Haversine distance to destination)\n  Time complexity: O(E log V) in practice, faster than Dijkstra\n  Limitation: Requires admissible heuristic; more complex to implement\n\nChoice: A* — because we have GPS coordinates for every node, so Haversine distance is a perfect admissible heuristic. For CP to Cyber Hub, A* will explore nodes roughly in the direction of Gurgaon, not waste time looking at Noida or Rohini.'}
      />
      <MCQ qId={4} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — Real-Time Traffic (Q5-6)
   ═══════════════════════════════════════════════════════════════════ */
function Section3({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q5: Traffic changes every few minutes. How would you update edge weights in real-time? Describe the data structure and update mechanism. What happens to a route being calculated when traffic data changes mid-computation?"
        value={getR(5)}
        onChange={v => setR(5, v)}
        rows={9}
        placeholder={'Data structure: Graph stored as an adjacency list with each edge holding a weight value in a shared in-memory store (e.g., Redis). Traffic feed sends delta updates: {edge_id: "NH48_seg_23", new_weight_seconds: 480}\n\nUpdate mechanism:\n1. Traffic server polls GPS probes from Ola/Uber every 2 minutes\n2. Edge weights recomputed: travel_time = distance / avg_speed\n3. Delta updates pushed to navigation servers via message queue (Kafka)\n4. Navigation server updates the in-memory edge weight atomically\n\nMid-computation scenario:\n- Dijkstra\'s is already running — snapshot weights at start of computation\n- Route is computed on the snapshot; served immediately\n- On next re-route trigger (user deviates or traffic changes >20%), recompute on fresh snapshot\n- This avoids race conditions and inconsistent routes during a single navigation session'}
      />
      <MCQ qId={6} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — Multi-Stop Routes (Q7)
   ═══════════════════════════════════════════════════════════════════ */
function Section4({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q7: A user wants to go from Point A → Petrol Pump → ATM → Restaurant → Home, visiting all stops but in the optimal order. Explain why this is related to the Traveling Salesman Problem. How would you solve it for 5 stops practically? What if there were 20 stops?"
        value={getR(7)}
        onChange={v => setR(7, v)}
        rows={10}
        placeholder={'TSP connection:\nFinding the optimal order to visit N stops is the Traveling Salesman Problem — an NP-hard problem. With N stops, there are (N-1)!/2 possible orderings. For 5 stops = 12 permutations (manageable). For 20 stops = 6 x 10^16 permutations (impossible to brute-force).\n\n5 stops solution:\n1. Pre-compute pairwise shortest paths between all 5 waypoints using Dijkstra\'s — creates a 5x5 distance matrix\n2. Try all (5-1)!/2 = 12 orderings (brute force is fine)\n3. Return the ordering with minimum total travel time\nTime: 5 Dijkstra runs + 12 permutation checks = fast\n\n20 stops solution:\n1. Use a greedy nearest-neighbour heuristic: always go to the closest unvisited stop next\n2. Or use dynamic programming (Held-Karp): O(2^N * N^2) — feasible up to ~20 stops\n3. For > 20 stops: genetic algorithms or simulated annealing\nIn practice, Google Maps caps multi-stop at ~10 waypoints for this exact reason.'}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — Alternative Routes (Q8)
   ═══════════════════════════════════════════════════════════════════ */
function Section5({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q8: Google Maps shows 3 alternative routes. How would you generate multiple distinct routes? Describe two approaches: (1) penalty-based (increase weights on the first shortest path and re-run), (2) k-shortest paths algorithm. What tradeoffs exist?"
        value={getR(8)}
        onChange={v => setR(8, v)}
        rows={10}
        placeholder={'Approach 1 — Penalty-based:\n1. Run Dijkstra\'s once to get Route 1\n2. Increase weights of all edges in Route 1 by a penalty factor (e.g., 5x)\n3. Run Dijkstra\'s again to get Route 2 — it will avoid heavily penalised edges\n4. Restore original weights, penalise Route 2 edges, run again for Route 3\nPros: Simple to implement, guaranteed distinct routes\nCons: Routes may share significant segments; penalty value is a magic number; not truly optimal\n\nApproach 2 — Yen\'s k-shortest paths:\n1. Uses Dijkstra\'s as a subroutine\n2. Systematically generates the k-th shortest path by removing edges from previous shortest paths\n3. Returns truly k-shortest simple paths (no repeated nodes)\nPros: Mathematically optimal, well-defined\nCons: O(kV(V+E)log V) — expensive for large k on a 50K-node graph\n\nReal-world tradeoff:\n- Penalty-based is faster and good enough for 3 routes\n- Routes should also differ in "character": one fastest, one avoid tolls, one scenic\n- Diversity constraint: alternative routes must differ by at least X% of edges from primary'}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 6 — Offline Navigation (Q9-10)
   ═══════════════════════════════════════════════════════════════════ */
function Section6({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q9: The user goes into a tunnel with no internet. How would you design an offline routing system? Consider: pre-computed routing tables, map tile caching, graph partitioning (split Delhi into zones). What data must be stored on the phone?"
        value={getR(9)}
        onChange={v => setR(9, v)}
        rows={10}
        placeholder={'Offline routing design:\n\n1. Graph partitioning — divide Delhi NCR into ~50 zones (e.g., 5km x 5km cells)\n   - Pre-compute all-pairs shortest paths WITHIN each zone\n   - Store only boundary nodes and inter-zone edge data\n\n2. Pre-computed routing tables:\n   - For each zone boundary node, store compressed shortest-path trees\n   - Hierarchical routing: local streets -> arterial roads -> highways\n\n3. Map tile caching:\n   - Download vector map tiles for the current route + 5km buffer\n   - Tiles stored as SQLite/MBTiles on device storage (~200MB for Delhi)\n\n4. Data stored on phone:\n   - Compressed graph for current route corridor (~50MB)\n   - Cached map tiles for visual display\n   - Turn-by-turn instruction list pre-generated before entering tunnel\n   - GPS continues to work offline (satellite-based, no internet needed)\n\n5. Tunnel behaviour:\n   - Dead-reckoning: use last known speed + compass to estimate position\n   - Resume live routing when signal returns, check for route deviation'}
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
        concept="Navigation System ka Algorithm"
        english="Graph-Based Navigation Algorithm"
        explanation="Delhi ka road network ek graph hai — jahan har chauraha (intersection) ek node hai aur har sadak ek edge. Dijkstra's algorithm sab se kam time wala raasta dhundhta hai, lekin A* aur bhi smart hai kyunki woh destination ki direction mein pehle dekhta hai. Real-time traffic ke liye edge weights update hote rehte hain — jab accident hota hai, us sadak ka weight badh jaata hai toh algorithm doosra raasta dikhata hai."
        example="Socho ek auto-rickshaw wala Connaught Place se Cyber Hub jaana chahta hai. Pehle woh sochta hai — NH-48 pe jam hai ya DND flyway se jaao? Yahi kaam Dijkstra's algorithm karta hai — sabhi raston ka time calculate karke sabse kam time wala select karta hai. Ola aur Uber bhi yehi algorithm use karte hain real-time ETA calculate karne ke liye."
        terms={[
          { hindi: 'ग्राफ', english: 'Graph', meaning: 'Nodes (chauraha) aur edges (sadak) ka network — Delhi ka map ek graph hai' },
          { hindi: 'भार (Weight)', english: 'Edge Weight', meaning: 'Har sadak ka travel time ya distance — traffic se badalta rehta hai' },
          { hindi: 'न्यूनतम पथ', english: 'Shortest Path', meaning: 'Sabse kam time ya distance mein source se destination tak ka raasta' },
          { hindi: 'हेयुरिस्टिक', english: 'Heuristic', meaning: 'A* mein: seedhi doori ka estimate jo algorithm ko sahi direction mein guide karta hai' },
        ]}
      />
    </div>
  )
}
