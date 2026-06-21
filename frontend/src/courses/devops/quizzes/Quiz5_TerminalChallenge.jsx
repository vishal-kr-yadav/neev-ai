import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ: Docker Command Builder
  User builds correct docker commands by clicking tokens in order.
  5 scenarios total — terminal-style UI with success/error feedback.
*/

const scenarios = [
  {
    prompt: 'Run an nginx container on port 8080',
    tokens: ['docker', 'run', '-p', '8080:80', 'nginx'],
    distractors: ['build', '-d', '80:8080', 'apache'],
    successOutput: [
      'Unable to find image \'nginx:latest\' locally',
      'Pulling from library/nginx...',
      'Status: Downloaded newer image for nginx:latest',
      'a1b2c3d4e5f6...',
    ],
  },
  {
    prompt: 'List all running containers',
    tokens: ['docker', 'ps'],
    distractors: ['ls', 'list', 'run', '--all', 'containers'],
    successOutput: [
      'CONTAINER ID   IMAGE   COMMAND   STATUS   PORTS   NAMES',
      'a1b2c3d4e5f6   nginx   "/dock…"  Up 2m    80/tcp  cool_turing',
    ],
  },
  {
    prompt: 'Build an image tagged "myapp:v1" from current directory',
    tokens: ['docker', 'build', '-t', 'myapp:v1', '.'],
    distractors: ['run', 'create', '--tag', 'myapp', 'latest'],
    successOutput: [
      'Sending build context to Docker daemon  2.048kB',
      'Step 1/5 : FROM node:18-alpine',
      'Step 5/5 : CMD ["node", "server.js"]',
      'Successfully tagged myapp:v1',
    ],
  },
  {
    prompt: 'Stop the container named "web-server"',
    tokens: ['docker', 'stop', 'web-server'],
    distractors: ['kill', 'rm', 'remove', '--force', 'container'],
    successOutput: ['web-server'],
  },
  {
    prompt: 'Run a detached Redis container named "cache"',
    tokens: ['docker', 'run', '-d', '--name', 'cache', 'redis'],
    distractors: ['-p', 'start', 'create', '--detach', 'memcached'],
    successOutput: [
      'Unable to find image \'redis:latest\' locally',
      'Pulling from library/redis...',
      'Status: Downloaded newer image for redis:latest',
      'f7e8d9c0b1a2...',
    ],
  },
]

export default function Quiz5_TerminalChallenge({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState([])
  const [available, setAvailable] = useState(() => shuffleTokens(0))
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)
  const [outputLines, setOutputLines] = useState([])

  function shuffleTokens(idx) {
    const s = scenarios[idx]
    const all = [...s.tokens, ...s.distractors]
    return all.sort(() => Math.random() - 0.5)
  }

  const scenario = scenarios[currentIdx]
  const expectedToken = scenario ? scenario.tokens[selected.length] : null

  const handleTokenClick = (token) => {
    if (success || done) return

    if (token === expectedToken) {
      const newSelected = [...selected, token]
      setSelected(newSelected)
      setAvailable((prev) => {
        const idx = prev.indexOf(token)
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
      })
      setError(false)

      if (newSelected.length === scenario.tokens.length) {
        setSuccess(true)
        setScore((s) => s + 1)
        // Animate output lines one by one
        scenario.successOutput.forEach((line, i) => {
          setTimeout(() => {
            setOutputLines((prev) => [...prev, line])
          }, (i + 1) * 300)
        })
      }
    } else {
      setError(true)
      setTimeout(() => setError(false), 600)
    }
  }

  const handleRemoveToken = (idx) => {
    if (success || done) return
    const token = selected[idx]
    // Only allow removing from the end
    if (idx !== selected.length - 1) return
    setSelected((prev) => prev.slice(0, -1))
    setAvailable((prev) => [...prev, token].sort(() => Math.random() - 0.5))
  }

  const handleNext = () => {
    const nextIdx = currentIdx + 1
    if (nextIdx >= scenarios.length) {
      setDone(true)
      onComplete()
    } else {
      setCurrentIdx(nextIdx)
      setSelected([])
      setAvailable(shuffleTokens(nextIdx))
      setSuccess(false)
      setOutputLines([])
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Terminal Challenge
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Build the correct Docker command by clicking tokens in order.
      </p>

      {!done ? (
        <>
          {/* Scenario prompt */}
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              padding: '16px 20px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              Scenario {currentIdx + 1}/{scenarios.length}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {scenario.prompt}
            </div>
          </motion.div>

          {/* Terminal window */}
          <div style={{
            background: '#1a1b2e', borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)', marginBottom: 20,
          }}>
            {/* Terminal header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              background: '#12132a', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ marginLeft: 12, fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                docker-terminal
              </span>
            </div>

            {/* Terminal body */}
            <div style={{ padding: 16, minHeight: 100, fontFamily: 'monospace', fontSize: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#10b981', marginRight: 4 }}>$</span>
                {selected.map((token, i) => (
                  <motion.span
                    key={`${token}-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handleRemoveToken(i)}
                    style={{
                      padding: '3px 10px', borderRadius: 6,
                      background: 'rgba(16,185,129,0.15)', color: '#10b981',
                      cursor: i === selected.length - 1 ? 'pointer' : 'default',
                      fontSize: 14,
                    }}
                  >
                    {token}
                  </motion.span>
                ))}
                {!success && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ color: '#10b981', fontSize: 16 }}
                  >
                    |
                  </motion.span>
                )}
              </div>

              {/* Error shake */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: [0, -5, 5, -5, 5, 0] }}
                    exit={{ opacity: 0 }}
                    style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}
                  >
                    bash: wrong token order — try again
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success output */}
              {outputLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: '#a0a0b8', fontSize: 13, marginTop: i === 0 ? 12 : 2 }}
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Token pool */}
          {!success ? (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                Available tokens
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <AnimatePresence>
                  {available.map((token) => (
                    <motion.button
                      key={token}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTokenClick(token)}
                      style={{
                        padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)',
                        background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer',
                        fontSize: 14, fontFamily: 'monospace', fontWeight: 600,
                      }}
                    >
                      {token}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              style={{
                padding: '12px 32px', borderRadius: 10, border: 'none',
                background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                fontSize: 15, fontWeight: 600,
              }}
            >
              {currentIdx < scenarios.length - 1 ? 'Next Scenario' : 'Finish'}
            </motion.button>
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#x1f4bb;</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>
            {score}/{scenarios.length} commands built correctly!
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {score === scenarios.length ? 'Perfect! You\'re a Docker CLI pro!' : 'Good effort! Practice makes perfect.'}
          </div>
        </motion.div>
      )}

      {/* Progress */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((done ? scenarios.length : currentIdx) / scenarios.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {done ? scenarios.length : currentIdx}/{scenarios.length}
        </span>
      </div>
    </div>
  )
}
