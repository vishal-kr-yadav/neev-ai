import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ: Docker Networking Puzzle
  Visual diagram where users click to connect/disconnect containers
  and configure port mappings. 4 scenarios with visual feedback.
*/

const SCENARIOS = [
  {
    id: 1,
    title: 'Frontend talks to Backend',
    description: 'The frontend container needs to communicate with the backend container on the same network.',
    nodes: [
      { id: 'frontend', label: 'Frontend', x: 80, y: 60, icon: '🌐' },
      { id: 'backend', label: 'Backend', x: 320, y: 60, icon: '⚙️' },
      { id: 'database', label: 'Database', x: 200, y: 180, icon: '🗄️' },
    ],
    correctConnections: [['frontend', 'backend']],
    wrongConnections: [],
    hint: 'Connect the two services that need to talk.',
  },
  {
    id: 2,
    title: 'Database isolation',
    description: 'The database should NOT be exposed to the internet. Only the backend should access it.',
    nodes: [
      { id: 'internet', label: 'Internet', x: 80, y: 60, icon: '🌍' },
      { id: 'backend', label: 'Backend', x: 200, y: 180, icon: '⚙️' },
      { id: 'database', label: 'Database', x: 320, y: 60, icon: '🗄️' },
    ],
    correctConnections: [['backend', 'database']],
    wrongConnections: [['internet', 'database']],
    hint: 'Connect backend to database, but do NOT connect internet to database.',
  },
  {
    id: 3,
    title: 'Microservice mesh',
    description: 'API Gateway must connect to both Auth and Orders services. Auth and Orders do NOT talk to each other.',
    nodes: [
      { id: 'gateway', label: 'API Gateway', x: 200, y: 40, icon: '🚪' },
      { id: 'auth', label: 'Auth Service', x: 80, y: 180, icon: '🔑' },
      { id: 'orders', label: 'Orders', x: 320, y: 180, icon: '📦' },
    ],
    correctConnections: [['gateway', 'auth'], ['gateway', 'orders']],
    wrongConnections: [['auth', 'orders']],
    hint: 'Gateway connects to both services. Services stay isolated from each other.',
  },
  {
    id: 4,
    title: 'Full stack networking',
    description: 'Internet connects to Nginx. Nginx connects to App. App connects to Redis. No direct internet to App or Redis.',
    nodes: [
      { id: 'internet', label: 'Internet', x: 40, y: 120, icon: '🌍' },
      { id: 'nginx', label: 'Nginx', x: 160, y: 40, icon: '🔀' },
      { id: 'app', label: 'App', x: 280, y: 120, icon: '📱' },
      { id: 'redis', label: 'Redis', x: 400, y: 40, icon: '💾' },
    ],
    correctConnections: [['internet', 'nginx'], ['nginx', 'app'], ['app', 'redis']],
    wrongConnections: [['internet', 'app'], ['internet', 'redis']],
    hint: 'Traffic flows: Internet -> Nginx -> App -> Redis. No shortcuts!',
  },
]

function connKey(a, b) {
  return [a, b].sort().join('--')
}

export default function Quiz6_NetworkingPuzzle({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [connections, setConnections] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const scenario = SCENARIOS[currentIdx]

  const handleNodeClick = (nodeId) => {
    if (checked) return
    if (selectedNode === null) {
      setSelectedNode(nodeId)
    } else if (selectedNode === nodeId) {
      setSelectedNode(null)
    } else {
      const key = connKey(selectedNode, nodeId)
      if (connections.includes(key)) {
        setConnections((prev) => prev.filter((c) => c !== key))
      } else {
        setConnections((prev) => [...prev, key])
      }
      setSelectedNode(null)
    }
  }

  const checkAnswer = () => {
    const correctKeys = scenario.correctConnections.map(([a, b]) => connKey(a, b))
    const wrongKeys = scenario.wrongConnections.map(([a, b]) => connKey(a, b))

    const hasAllCorrect = correctKeys.every((k) => connections.includes(k))
    const hasNoWrong = wrongKeys.every((k) => !connections.includes(k))
    const noExtra = connections.every((c) => correctKeys.includes(c))

    const isCorrect = hasAllCorrect && hasNoWrong && noExtra

    setChecked(true)
    if (isCorrect) {
      setScore((s) => s + 1)
      setFeedback({ correct: true, msg: 'Network configured correctly!' })
    } else {
      setFeedback({ correct: false, msg: 'Not quite right. Check the connections.' })
    }
  }

  const handleNext = () => {
    const nextIdx = currentIdx + 1
    if (nextIdx >= SCENARIOS.length) {
      setDone(true)
      onComplete()
    } else {
      setCurrentIdx(nextIdx)
      setConnections([])
      setSelectedNode(null)
      setFeedback(null)
      setChecked(false)
    }
  }

  const getNodePos = (id) => scenario.nodes.find((n) => n.id === id)

  const renderConnection = (key) => {
    const [a, b] = key.split('--')
    const na = getNodePos(a)
    const nb = getNodePos(b)
    if (!na || !nb) return null

    const correctKeys = scenario.correctConnections.map(([x, y]) => connKey(x, y))
    let strokeColor = 'var(--accent)'
    if (checked) {
      strokeColor = correctKeys.includes(key) ? '#10b981' : '#ef4444'
    }

    return (
      <motion.line
        key={key}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        x1={na.x + 40} y1={na.y + 30}
        x2={nb.x + 40} y2={nb.y + 30}
        stroke={strokeColor}
        strokeWidth={3}
        strokeDasharray={checked && !correctKeys.includes(key) ? '8 4' : 'none'}
        strokeLinecap="round"
      />
    )
  }

  // Show correct connections user missed
  const renderMissedConnections = () => {
    if (!checked || feedback?.correct) return null
    const correctKeys = scenario.correctConnections.map(([a, b]) => connKey(a, b))
    return correctKeys
      .filter((k) => !connections.includes(k))
      .map((key) => {
        const [a, b] = key.split('--')
        const na = getNodePos(a)
        const nb = getNodePos(b)
        if (!na || !nb) return null
        return (
          <motion.line
            key={`missed-${key}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            x1={na.x + 40} y1={na.y + 30}
            x2={nb.x + 40} y2={nb.y + 30}
            stroke="#10b981"
            strokeWidth={3}
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        )
      })
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Networking Puzzle
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Click two nodes to connect (or disconnect) them. Build the correct network topology.
      </p>

      {!done ? (
        <>
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              padding: '14px 18px', borderRadius: 12, marginBottom: 16,
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              Scenario {currentIdx + 1}/{SCENARIOS.length}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {scenario.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {scenario.description}
            </div>
          </motion.div>

          {/* Network diagram */}
          <div style={{
            position: 'relative', background: 'var(--bg-card)', borderRadius: 16,
            border: '1px solid var(--border)', height: 260, marginBottom: 16, overflow: 'hidden',
          }}>
            {/* Grid background */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Connection lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {connections.map(renderConnection)}
              {renderMissedConnections()}
            </svg>

            {/* Nodes */}
            {scenario.nodes.map((node) => (
              <motion.div
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                whileHover={!checked ? { scale: 1.1, y: -4 } : {}}
                whileTap={!checked ? { scale: 0.95 } : {}}
                animate={{
                  borderColor: selectedNode === node.id ? 'var(--accent)' : 'var(--border)',
                  boxShadow: selectedNode === node.id ? '0 0 16px rgba(99,102,241,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                }}
                style={{
                  position: 'absolute', left: node.x, top: node.y,
                  width: 80, padding: '12px 0', borderRadius: 14,
                  background: 'var(--bg-secondary)', border: '2px solid var(--border)',
                  textAlign: 'center', cursor: checked ? 'default' : 'pointer',
                  zIndex: 2, userSelect: 'none',
                }}
              >
                <div style={{ fontSize: 24 }}>{node.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                  {node.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '12px 16px', borderRadius: 10, marginBottom: 12,
                  background: feedback.correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${feedback.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: feedback.correct ? '#10b981' : '#ef4444',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                {feedback.correct ? '✓' : '✗'} {feedback.msg}
                {!feedback.correct && (
                  <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, opacity: 0.8 }}>
                    Dashed green = missed connections, dashed red = wrong connections
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            {!checked ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={checkAnswer}
                disabled={connections.length === 0}
                style={{
                  padding: '12px 28px', borderRadius: 10, border: 'none',
                  background: connections.length > 0 ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: connections.length > 0 ? '#fff' : 'var(--text-muted)',
                  cursor: connections.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                Check Network
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                style={{
                  padding: '12px 28px', borderRadius: 10, border: 'none',
                  background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                {currentIdx < SCENARIOS.length - 1 ? 'Next Scenario' : 'Finish'}
              </motion.button>
            )}
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#x1f310;</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>
            {score}/{SCENARIOS.length} networks configured correctly!
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {score === SCENARIOS.length ? 'Perfect! You\'re a networking expert!' : 'Keep learning about Docker networking!'}
          </div>
        </motion.div>
      )}

      {/* Progress */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((done ? SCENARIOS.length : currentIdx) / SCENARIOS.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {done ? SCENARIOS.length : currentIdx}/{SCENARIOS.length}
        </span>
      </div>
    </div>
  )
}
