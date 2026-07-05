import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'dsa'
const ASSIGNMENT_ID = 3
const TOTAL_QUESTIONS = 10
const ACCENT = '#f59e0b'
const ACCENT_LIGHT = 'rgba(245,158,11,0.12)'
const ACCENT_BORDER = 'rgba(245,158,11,0.3)'

const SECTIONS = [
  { id: 'graph', num: 1, title: 'Graph Representation', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'recommend', num: 2, title: 'Friend Recommendations', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { id: 'community', num: 3, title: 'Community Detection', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { id: 'influence', num: 4, title: 'Influence Scoring', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'hashtag', num: 5, title: 'Hashtag Trending', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { id: 'mutual', num: 6, title: 'Mutual Friends & Privacy', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { id: 'hindi', num: 7, title: 'Hindi Summary', gradient: 'linear-gradient(135deg, #ff9933, #e67e22)' },
]

/* ─── MCQ DATA ─── */
const MCQ_DATA = {
  q2: {
    question: 'Storing 10,000 users in an adjacency matrix requires how much space?',
    options: [
      { key: 'a', text: '10,000 bytes' },
      { key: 'b', text: '100 million entries (10,000 × 10,000)' },
      { key: 'c', text: '50,000 entries (edges only)' },
      { key: 'd', text: '20,000 entries (edges × 2)' },
    ],
    answer: 'b',
  },
  q4: {
    question: 'To find all friends-of-friends for a user with 200 friends, where each friend has ~200 friends, how many users do you examine?',
    options: [
      { key: 'a', text: '200' },
      { key: 'b', text: '400' },
      { key: 'c', text: 'Up to 40,000 (200 × 200)' },
      { key: 'd', text: '10,000 (all users)' },
    ],
    answer: 'c',
  },
  q6: {
    question: 'In a social graph, a "bridge" edge is one whose removal disconnects the graph. What does a bridge represent socially?',
    options: [
      { key: 'a', text: 'The most popular user' },
      { key: 'b', text: 'A connection between two otherwise separate communities' },
      { key: 'c', text: 'A user with no friends' },
      { key: 'd', text: 'A mutual friendship' },
    ],
    answer: 'b',
  },
  q10: {
    question: 'Finding mutual friends between User A (500 friends) and User B (100 friends) using hash set intersection takes:',
    options: [
      { key: 'a', text: 'O(500 × 100) = O(50,000)' },
      { key: 'b', text: 'O(500 + 100) = O(600) — build set from smaller, iterate larger' },
      { key: 'c', text: 'O(500 log 500 + 100 log 100) — sort both first' },
      { key: 'd', text: 'O(10,000) — check all users' },
    ],
    answer: 'b',
  },
}

/* ─── SHARED STYLES ─── */
const crd = {
  background: 'var(--bg-card)', borderRadius: 16,
  border: '1px solid var(--border)', padding: 24, marginBottom: 20,
}
const ta = {
  width: '100%', background: 'var(--bg-secondary)',
  border: '1px solid var(--border)', borderRadius: 12,
  padding: '14px 16px', color: 'var(--text-primary)',
  fontFamily: 'inherit', fontSize: 15, lineHeight: 1.6,
  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
}
const lb = {
  display: 'block', fontWeight: 600, color: 'var(--text-primary)',
  marginBottom: 10, fontSize: 15, lineHeight: 1.6,
}

/* ─── HELPERS ─── */
function countAnswered(resp) {
  let count = 0
  const textFields = ['q1', 'q3', 'q5', 'q7', 'q8', 'q9']
  const mcqFields = ['q2', 'q4', 'q6', 'q10']
  textFields.forEach(f => { if (resp[f] && resp[f].trim()) count++ })
  mcqFields.forEach(f => { if (resp[f]) count++ })
  return count
}

/* ─── MCQ WIDGET ─── */
function McqQuestion({ qNum, mcq, value, onChange, submitted }) {
  const isCorrect = value === mcq.answer
  return (
    <div style={crd}>
      <label style={lb}>Q{qNum}: {mcq.question}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mcq.options.map(opt => {
          const selected = value === opt.key
          const showFeedback = submitted && selected
          let borderColor = 'var(--border)'
          let bg = 'var(--bg-secondary)'
          if (selected && !submitted) {
            borderColor = ACCENT
            bg = ACCENT_LIGHT
          }
          if (showFeedback && isCorrect) {
            borderColor = '#22c55e'
            bg = 'rgba(34,197,94,0.08)'
          }
          if (showFeedback && !isCorrect) {
            borderColor = '#ef4444'
            bg = 'rgba(239,68,68,0.08)'
          }
          if (submitted && opt.key === mcq.answer && !selected) {
            borderColor = '#22c55e'
            bg = 'rgba(34,197,94,0.06)'
          }
          return (
            <button
              key={opt.key}
              onClick={() => !submitted && onChange(opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12,
                cursor: submitted ? 'default' : 'pointer',
                border: `2px solid ${borderColor}`, background: bg,
                textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                border: selected ? 'none' : '2px solid var(--border)',
                background: selected ? (submitted ? (isCorrect ? '#22c55e' : '#ef4444') : ACCENT) : 'transparent',
                color: selected ? '#fff' : 'var(--text-secondary)',
              }}>
                {opt.key.toUpperCase()}
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{opt.text}</span>
            </button>
          )
        })}
      </div>
      {submitted && value && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 14, padding: '10px 16px', borderRadius: 10,
            background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
            color: isCorrect ? '#22c55e' : '#ef4444',
            fontSize: 14, fontWeight: 600,
          }}
        >
          {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${mcq.answer.toUpperCase()}.`}
        </motion.div>
      )}
    </div>
  )
}

/* ─── TEXTAREA WITH CHAR COUNT ─── */
function TextArea({ qNum, label, placeholder, rows, value, onChange }) {
  const len = (value || '').length
  return (
    <div style={crd}>
      <label style={lb}>Q{qNum}: {label}</label>
      <textarea
        rows={rows || 6}
        style={ta}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
        {len} characters
      </div>
    </div>
  )
}

/* ─── SECTION CARD ─── */
function SectionCard({ section, expanded, onToggle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: section.num * 0.05 }}
      style={{
        background: 'var(--bg-card)', borderRadius: 20,
        border: '1px solid var(--border)', marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '20px 28px', border: 'none', cursor: 'pointer',
          background: expanded ? section.gradient : 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
            background: expanded ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
            color: expanded ? '#fff' : 'var(--text-secondary)',
          }}>
            {section.num}
          </span>
          <span style={{
            fontSize: 17, fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: expanded ? '#fff' : 'var(--text-primary)',
          }}>
            {section.title}
          </span>
        </div>
        <span style={{
          fontSize: 20, color: expanded ? '#fff' : 'var(--text-secondary)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
        }}>
          &#9660;
        </span>
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ padding: 28 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

/* =====================================================================
   ROOT COMPONENT
   ===================================================================== */
export default function Assignment3_SocialNetwork() {
  const { saveAssignment, getAssignment } = useAuth()
  const [resp, setResp] = useState({})
  const [expanded, setExpanded] = useState({ 1: true })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState({})
  const [saveMsg, setSaveMsg] = useState({})
  const [loaded, setLoaded] = useState(false)

  /* ── Load saved responses on mount ── */
  useEffect(() => {
    async function load() {
      try {
        const data = await getAssignment(COURSE_ID, ASSIGNMENT_ID)
        if (data && data.responses) {
          setResp(data.responses)
          if (data.submitted) setSubmitted(true)
        }
      } catch (_) {
        /* ignore load errors */
      }
      setLoaded(true)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setR = (field, val) => setResp(prev => ({ ...prev, [field]: val }))
  const getR = (field) => resp[field] || ''

  const answeredCount = countAnswered(resp)

  const toggleSection = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  /* ── Save progress ── */
  const handleSave = async (sectionId) => {
    setSaving(prev => ({ ...prev, [sectionId]: true }))
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, resp, false)
      setSaveMsg(prev => ({ ...prev, [sectionId]: 'Saved!' }))
    } catch (_) {
      setSaveMsg(prev => ({ ...prev, [sectionId]: 'Error saving' }))
    }
    setTimeout(() => {
      setSaving(prev => ({ ...prev, [sectionId]: false }))
      setSaveMsg(prev => ({ ...prev, [sectionId]: '' }))
    }, 1400)
  }

  /* ── Final submit ── */
  const handleSubmit = async () => {
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, resp, true)
      setSubmitted(true)
    } catch (_) {
      /* ignore submit errors */
    }
  }

  /* ── Save Button ── */
  const SaveBtn = ({ sectionId }) => (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => handleSave(sectionId)}
      style={{
        marginTop: 16, padding: '10px 28px', borderRadius: 10,
        border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        background: saveMsg[sectionId] === 'Saved!' ? '#22c55e' : ACCENT,
        color: '#fff', transition: 'background 0.3s',
      }}
    >
      {saving[sectionId] ? 'Saving...' : (saveMsg[sectionId] || 'Save Progress')}
    </motion.button>
  )

  /* ── SUBMITTED STATE ── */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}
        >
          <div style={{ fontSize: 72, marginBottom: 20 }}>&#10003;</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 32, marginBottom: 16 }}>
            Assignment Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Your social network analyzer design for ShareChat will be reviewed. You answered {answeredCount} out of {TOTAL_QUESTIONS} questions.
          </p>
          <div style={{ ...crd, textAlign: 'left' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              Submission Summary
            </h3>
            {SECTIONS.map(sec => {
              const sectionQuestions = {
                graph: ['q1', 'q2'],
                recommend: ['q3', 'q4'],
                community: ['q5', 'q6'],
                influence: ['q7'],
                hashtag: ['q8'],
                mutual: ['q9', 'q10'],
                hindi: [],
              }
              const qs = sectionQuestions[sec.id] || []
              const filled = qs.filter(q => resp[q] && (typeof resp[q] === 'string' ? resp[q].trim() : resp[q])).length
              const ok = qs.length === 0 || filled > 0
              return (
                <div key={sec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: ok ? '#22c55e' : 'var(--text-secondary)', fontSize: 16 }}>
                    {ok ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 24 }}>S{sec.num}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{sec.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: ok ? '#22c55e' : 'var(--text-secondary)' }}>
                    {qs.length === 0 ? 'Reference' : ok ? `${filled}/${qs.length}` : 'Skipped'}
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

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Loading...</p>
      </div>
    )
  }

  /* ── MAIN LAYOUT ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 30, margin: '0 0 10px' }}>
            Social Network Analyzer — ShareChat
          </h1>

          {/* ── Scenario Card ── */}
          <div style={{
            background: `linear-gradient(135deg, ${ACCENT_LIGHT}, rgba(245,158,11,0.04))`,
            border: `1px solid ${ACCENT_BORDER}`,
            borderRadius: 16, padding: '20px 24px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>&#128101;</span>
              <div>
                <div style={{ color: ACCENT, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                  Assignment 3 — Case Study
                </div>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700 }}>
                  Data Engineer at ShareChat
                </div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, margin: '0 0 14px' }}>
              You are the data engineer at <strong style={{ color: 'var(--text-primary)' }}>ShareChat</strong>, India's homegrown
              social platform with <strong style={{ color: 'var(--text-primary)' }}>180 million users</strong>. The platform needs
              three new features: friend recommendations, community detection, and influence scoring.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              You have a graph of <strong style={{ color: ACCENT }}>10,000 users</strong> and <strong style={{ color: ACCENT }}>~50,000 friendship connections</strong>.
              Your task: apply graph algorithms and hash maps to solve real social network engineering problems.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
              {[
                { label: 'Total Users', value: '10,000' },
                { label: 'Friendships', value: '50,000' },
                { label: 'Platform MAU', value: '180M' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px',
                  textAlign: 'center', border: `1px solid ${ACCENT_BORDER}`,
                }}>
                  <div style={{ color: ACCENT, fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{stat.value}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Progress Bar ── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '16px 20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Progress</span>
              <span style={{ color: ACCENT, fontSize: 13, fontWeight: 700 }}>
                {answeredCount}/{TOTAL_QUESTIONS} answered
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }}
                style={{
                  height: '100%', borderRadius: 3,
                  background: answeredCount === TOTAL_QUESTIONS
                    ? 'linear-gradient(90deg, #22c55e, #10b981)'
                    : `linear-gradient(90deg, ${ACCENT}, #f97316)`,
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1 — Graph Representation
        ══════════════════════════════════════════════════════════════ */}
        <SectionCard section={SECTIONS[0]} expanded={!!expanded[1]} onToggle={() => toggleSection(1)}>
          <TextArea
            qNum={1}
            label="ShareChat has 10,000 users and 50,000 friendships. Each user has a profile (name, city, interests stored in a hash map). How would you represent this social graph? Describe the node/edge model and justify your choice of adjacency list vs adjacency matrix for this use case."
            placeholder={`Consider:\n- Node = user object (id, name, city, interests hashmap)\n- Edge = friendship connection (undirected)\n\nAdjacency List: { userId: [friendId1, friendId2, ...] }\n  - Space: O(V + E) = O(10,000 + 50,000) = O(60,000)\n  - Good when edges are sparse\n\nAdjacency Matrix: 10,000 × 10,000 boolean grid\n  - Space: O(V²) = O(100,000,000)\n  - Overkill for sparse social graphs\n\nWhich would you choose and why? Consider: memory, lookup time for 'are these two users friends?', iteration over a user's friends...`}
            rows={10}
            value={getR('q1')}
            onChange={v => setR('q1', v)}
          />
          <McqQuestion
            qNum={2}
            mcq={MCQ_DATA.q2}
            value={getR('q2')}
            onChange={v => setR('q2', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="graph" />
        </SectionCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2 — Friend Recommendations
        ══════════════════════════════════════════════════════════════ */}
        <SectionCard section={SECTIONS[1]} expanded={!!expanded[2]} onToggle={() => toggleSection(2)}>
          <TextArea
            qNum={3}
            label="Design a 'People You May Know' algorithm. Consider three approaches: (1) Friends-of-Friends (BFS depth=2), (2) Common interests (hash map intersection), (3) Mutual friends count. Write pseudo-code for the Friends-of-Friends approach and explain how you'd rank recommendations."
            placeholder={`Pseudo-code for Friends-of-Friends BFS:\n\nfunction getFriendRecommendations(userId):\n  visited = Set()\n  direct_friends = graph[userId]    // BFS depth 1\n  candidates = HashMap()            // candidate -> mutual_count\n\n  visited.add(userId)\n  for friend in direct_friends:\n    visited.add(friend)\n\n  // BFS depth 2\n  for friend in direct_friends:\n    for fof in graph[friend]:       // friend of friend\n      if fof not in visited:\n        candidates[fof] = candidates.get(fof, 0) + 1\n\n  // Rank by mutual friend count\n  return sorted(candidates, key=mutual_count, descending=True)\n\nHow would you combine all three signals for better ranking?`}
            rows={12}
            value={getR('q3')}
            onChange={v => setR('q3', v)}
          />
          <McqQuestion
            qNum={4}
            mcq={MCQ_DATA.q4}
            value={getR('q4')}
            onChange={v => setR('q4', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="recommend" />
        </SectionCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3 — Community Detection
        ══════════════════════════════════════════════════════════════ */}
        <SectionCard section={SECTIONS[2]} expanded={!!expanded[3]} onToggle={() => toggleSection(3)}>
          <TextArea
            qNum={5}
            label="Users naturally form communities (college groups, city groups, interest groups). Describe how you'd use BFS/DFS to find connected components in the graph. What does each connected component represent? How would you handle the case where all 10,000 users are in one giant connected component but still have distinct communities?"
            placeholder={`Connected Components via BFS:\n\nfunction findComponents(graph):\n  visited = Set()\n  components = []\n\n  for each userId in graph:\n    if userId not in visited:\n      component = BFS(userId, visited)\n      components.append(component)\n\n  return components  // each list = one community\n\nBFS(start, visited):\n  queue = [start]\n  component = []\n  while queue not empty:\n    user = queue.pop()\n    component.add(user)\n    visited.add(user)\n    for neighbor in graph[user]:\n      if neighbor not in visited:\n        queue.append(neighbor)\n  return component\n\nIf all 10,000 users are connected (one giant component):\n- Consider sub-community detection: clustering coefficient, betweenness centrality\n- Describe algorithms like Louvain or Girvan-Newman for deeper community structure`}
            rows={12}
            value={getR('q5')}
            onChange={v => setR('q5', v)}
          />
          <McqQuestion
            qNum={6}
            mcq={MCQ_DATA.q6}
            value={getR('q6')}
            onChange={v => setR('q6', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="community" />
        </SectionCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 4 — Influence Scoring
        ══════════════════════════════════════════════════════════════ */}
        <SectionCard section={SECTIONS[3]} expanded={!!expanded[4]} onToggle={() => toggleSection(4)}>
          <TextArea
            qNum={7}
            label="Design an influence scoring system. Consider: (1) Degree centrality (most connections), (2) BFS-based reach (how many users can you reach in 3 hops), (3) PageRank-style approach (friends of influential people are more influential). Compare all three, explain which captures 'real' influence best, and write pseudo-code for the BFS-based reach scorer."
            placeholder={`1. Degree Centrality:\n   score = len(graph[userId])\n   Simple but shallow — a celebrity with 10,000 followers but isolated communities\n\n2. BFS-based Reach Score (3 hops):\n\nfunction reachScore(userId, maxHops=3):\n  visited = {userId}\n  queue = [(userId, 0)]\n  while queue:\n    current, depth = queue.pop()\n    if depth < maxHops:\n      for neighbor in graph[current]:\n        if neighbor not in visited:\n          visited.add(neighbor)\n          queue.append((neighbor, depth+1))\n  return len(visited) - 1  // exclude self\n\n   Time: O(V + E) per user — can be expensive for 10,000 users\n\n3. PageRank-style:\n   score[u] = sum(score[v] / degree[v]) for v in friends[u]\n   Iterative until convergence\n\nWhich is best for ShareChat's use case and why?`}
            rows={14}
            value={getR('q7')}
            onChange={v => setR('q7', v)}
          />
          <SaveBtn sectionId="influence" />
        </SectionCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 5 — Hashtag Trending
        ══════════════════════════════════════════════════════════════ */}
        <SectionCard section={SECTIONS[4]} expanded={!!expanded[5]} onToggle={() => toggleSection(5)}>
          <TextArea
            qNum={8}
            label="Users post with hashtags (#cricket, #IPL, #coding). Design a system using hash maps to: (1) Count hashtag frequency in real-time, (2) Find top 10 trending hashtags, (3) Detect when a hashtag 'goes viral' (growth rate > 5x in 1 hour). Describe the data structures and time complexity for each operation."
            placeholder={`1. Real-time Frequency Count:\n   HashMap<String, Integer> counts\n   On each post: counts[hashtag]++\n   Time: O(1) average per insert\n\n2. Top 10 Trending (Min-Heap approach):\n   - Maintain a min-heap of size 10\n   - For each entry in counts map:\n     if heap.size < 10: heap.push(entry)\n     else if entry.count > heap.min: heap.pop(), heap.push(entry)\n   Time: O(N log 10) ≈ O(N) where N = unique hashtags\n   Space: O(N) for the hashmap + O(10) for heap\n\n3. Viral Detection (growth rate):\n   HashMap<String, Integer> countThisHour, countLastHour\n   Every hour: rotate buffers\n   viral = [tag for tag in countThisHour\n            if countThisHour[tag] / max(1, countLastHour[tag]) >= 5]\n\n   How would you handle hashtag normalization?\n   (#Cricket vs #cricket vs #CRICKET)`}
            rows={14}
            value={getR('q8')}
            onChange={v => setR('q8', v)}
          />
          <SaveBtn sectionId="hashtag" />
        </SectionCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 6 — Mutual Friends & Privacy
        ══════════════════════════════════════════════════════════════ */}
        <SectionCard section={SECTIONS[5]} expanded={!!expanded[6]} onToggle={() => toggleSection(6)}>
          <TextArea
            qNum={9}
            label="When user A views user B's profile, show 'X mutual friends'. Design an efficient algorithm to find mutual friends between two users. Compare: (1) Set intersection with hash sets (2) Sorting both friend lists and two-pointer merge. Analyze time complexity of both. Which is better when friend lists are very different in size?"
            placeholder={`Approach 1 — Hash Set Intersection:\n  setA = HashSet(graph[userA])   // O(|A|) build\n  mutual = []\n  for friend in graph[userB]:    // O(|B|) iterate\n    if friend in setA:            // O(1) lookup\n      mutual.append(friend)\n  Total: O(|A| + |B|)\n\nApproach 2 — Sort + Two-Pointer:\n  sortedA = sort(graph[userA])   // O(|A| log |A|)\n  sortedB = sort(graph[userB])   // O(|B| log |B|)\n  i, j = 0, 0\n  while i < |A| and j < |B|:\n    if sortedA[i] == sortedB[j]: mutual.add; i++; j++\n    elif sortedA[i] < sortedB[j]: i++\n    else: j++\n  Total: O(|A| log |A| + |B| log |B|)\n\nOptimization tip: when |A| >> |B|, build set from B (smaller), iterate A?\nConsider: pre-sorted adjacency lists to skip sorting overhead`}
            rows={12}
            value={getR('q9')}
            onChange={v => setR('q9', v)}
          />
          <McqQuestion
            qNum={10}
            mcq={MCQ_DATA.q10}
            value={getR('q10')}
            onChange={v => setR('q10', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="mutual" />
        </SectionCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 7 — Hindi Summary
        ══════════════════════════════════════════════════════════════ */}
        <SectionCard section={SECTIONS[6]} expanded={!!expanded[7]} onToggle={() => toggleSection(7)}>
          <HindiExplainer
            concept="सोशल नेटवर्क एनालिसिस"
            english="Social Network Analysis with Graphs & Hash Maps"
            explanation="Social network ko ek graph ki tarah socho — jaise WhatsApp mein aapke contacts (nodes) aur unke beech connections (edges) hote hain. Graph algorithms se hum yeh pata kar sakte hain: kaun kaun se log ek group mein hain (community detection), kiske zyada dost hain (influence scoring), aur aapko kaun naye log jaanne chahiye (friend recommendation). Hash maps se hashtag trending aur mutual friends dhundhna bahut fast ho jaata hai — O(1) time mein!"
            example="Instagram pe jab #IPL trending ho jaata hai — woh hash map counter se track hota hai. PhonePe pe 'People You May Know' — woh BFS algorithm se 2 hops door ke log dhundhe jaate hain. ShareChat pe 'X mutual friends' — woh hash set intersection se calculate hota hai. Ye sab real-world mein daily crores of users ke liye chalte hain!"
            terms={[
              { hindi: 'ग्राफ', english: 'Graph', meaning: 'Users (nodes) aur unke connections (edges) ka network — jaise social media friends list' },
              { hindi: 'BFS (चौड़ाई-पहले खोज)', english: 'Breadth-First Search', meaning: 'Level by level graph traverse karna — pehle direct friends, phir friends ke friends' },
              { hindi: 'हैश मैप', english: 'Hash Map', meaning: 'Key-value store jo O(1) mein data dhundh leta hai — jaise hashtag ka count rakhna' },
              { hindi: 'समुदाय पहचान', english: 'Community Detection', meaning: 'Connected users ke clusters dhundhhna — jaise IIT Bombay group ya Mumbai foodies' },
              { hindi: 'प्रभाव स्कोरिंग', english: 'Influence Scoring', meaning: 'Kaun kitne logon tak pahunch sakta hai — PageRank ya BFS reach se measure karo' },
            ]}
          />
        </SectionCard>

        {/* ── SUBMIT FINAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            ...crd, textAlign: 'center',
            background: `linear-gradient(135deg, ${ACCENT_LIGHT}, rgba(245,158,11,0.04))`,
            border: `1px solid ${ACCENT_BORDER}`,
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 20, margin: '0 0 8px' }}>
            Ready to Submit?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
            You have answered <strong>{answeredCount}</strong> out of <strong>{TOTAL_QUESTIONS}</strong> questions.
            You can submit even with incomplete answers.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            style={{
              padding: '14px 48px', fontSize: 17, fontWeight: 700,
              fontFamily: 'var(--font-heading)', borderRadius: 14, cursor: 'pointer',
              border: 'none', color: '#fff',
              background: `linear-gradient(135deg, ${ACCENT}, #f97316)`,
              boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
            }}
          >
            Submit Final
          </motion.button>
        </motion.div>

      </div>
    </div>
  )
}
