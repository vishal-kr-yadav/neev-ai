import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ: Docker Compose Builder
  User reorders scrambled docker-compose.yml blocks into correct order.
  Clicking cards moves them into the build area in sequence.
*/

const BLOCKS = [
  { id: 0, code: 'version: "3.8"', indent: 0 },
  { id: 1, code: 'services:', indent: 0 },
  { id: 2, code: 'web:', indent: 1 },
  { id: 3, code: 'build: .', indent: 2 },
  { id: 4, code: 'ports:\n    - "8080:3000"', indent: 2 },
  { id: 5, code: 'depends_on:\n    - db', indent: 2 },
  { id: 6, code: 'db:', indent: 1 },
  { id: 7, code: 'image: postgres:15', indent: 2 },
]

const CORRECT_ORDER = [0, 1, 2, 3, 4, 5, 6, 7]

function getIndentPx(level) {
  return level * 28
}

export default function Quiz7_ComposeBuilder({ onComplete }) {
  const [pool, setPool] = useState(() => {
    const shuffled = [...BLOCKS]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  })
  const [placed, setPlaced] = useState([])
  const [error, setError] = useState(false)
  const [done, setDone] = useState(false)
  const [shakeId, setShakeId] = useState(null)

  const expectedIndex = placed.length
  const expectedBlock = CORRECT_ORDER[expectedIndex]

  const handleBlockClick = (block) => {
    if (done) return

    if (block.id === expectedBlock) {
      setPlaced((prev) => [...prev, block])
      setPool((prev) => prev.filter((b) => b.id !== block.id))
      setError(false)

      if (placed.length + 1 === BLOCKS.length) {
        setTimeout(() => {
          setDone(true)
          onComplete()
        }, 600)
      }
    } else {
      setError(true)
      setShakeId(block.id)
      setTimeout(() => {
        setError(false)
        setShakeId(null)
      }, 600)
    }
  }

  const handleUndo = () => {
    if (placed.length === 0 || done) return
    const last = placed[placed.length - 1]
    setPlaced((prev) => prev.slice(0, -1))
    setPool((prev) => [...prev, last].sort(() => Math.random() - 0.5))
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Compose Builder
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Build a valid docker-compose.yml by clicking blocks in the correct order.
      </p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* YAML Preview / Build Area */}
        <div style={{ flex: '1 1 280px', minWidth: 280 }}>
          <div style={{
            fontSize: 12, color: 'var(--text-muted)', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>docker-compose.yml</span>
            {placed.length > 0 && !done && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUndo}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: 11, textTransform: 'none',
                }}
              >
                Undo
              </motion.button>
            )}
          </div>
          <div style={{
            background: '#1a1b2e', borderRadius: 12, padding: 16, minHeight: 280,
            border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: 13,
            overflow: 'hidden',
          }}>
            {placed.length === 0 && (
              <div style={{ color: '#555', fontStyle: 'italic', fontSize: 13 }}>
                Click blocks to build the file...
              </div>
            )}
            <AnimatePresence>
              {placed.map((block, i) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  style={{
                    paddingLeft: getIndentPx(block.indent),
                    color: block.indent === 0 ? '#c084fc' : block.indent === 1 ? '#38bdf8' : '#a5f3fc',
                    lineHeight: 1.6, whiteSpace: 'pre',
                  }}
                >
                  {block.code}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cursor line */}
            {!done && placed.length > 0 && placed.length < BLOCKS.length && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{
                  paddingLeft: getIndentPx(BLOCKS[expectedBlock]?.indent || 0),
                  color: '#10b981', fontSize: 12, marginTop: 4,
                }}
              >
                &#9646; next block here...
              </motion.div>
            )}

            {/* Done checkmark */}
            {done && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: 16, color: '#10b981', fontSize: 13, textAlign: 'center' }}
              >
                &#10003; Valid docker-compose.yml
              </motion.div>
            )}
          </div>
        </div>

        {/* Block Pool */}
        <div style={{ flex: '1 1 240px', minWidth: 240 }}>
          <div style={{
            fontSize: 12, color: 'var(--text-muted)', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Available blocks ({pool.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {pool.map((block) => (
                <motion.button
                  key={block.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: shakeId === block.id ? [0, -8, 8, -8, 8, 0] : 0,
                    borderColor: shakeId === block.id ? '#ef4444' : 'var(--border)',
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -100 }}
                  whileHover={{ scale: 1.03, borderColor: 'var(--accent)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleBlockClick(block)}
                  style={{
                    padding: '12px 16px', borderRadius: 10,
                    border: '1px solid var(--border)', background: 'var(--bg-card)',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'monospace',
                    fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre',
                    lineHeight: 1.5,
                  }}
                >
                  {block.code}
                </motion.button>
              ))}
            </AnimatePresence>

            {pool.length === 0 && !done && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                All blocks placed!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error feedback */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 12, padding: '10px 16px', borderRadius: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: 13, fontWeight: 500,
            }}
          >
            Wrong order! Think about YAML structure: version, services, service names, then their config.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done state */}
      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', marginTop: 24 }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>&#x1f3d7;&#xfe0f;</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>
            Compose file built successfully!
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            You understand docker-compose.yml structure.
          </div>
        </motion.div>
      )}

      {/* Progress */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(placed.length / BLOCKS.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {placed.length}/{BLOCKS.length}
        </span>
      </div>
    </div>
  )
}
