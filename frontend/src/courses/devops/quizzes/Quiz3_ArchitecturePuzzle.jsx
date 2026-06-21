import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   QUIZ 3 — Architecture Puzzle: Drag-to-Place
   Format: Place Docker components into the correct architecture slots
================================================================ */

const SLOTS = [
  {
    id: 'cli',
    label: 'Docker CLI',
    hint: 'Where you type docker commands',
    row: 0,
    col: 1,
    icon: '⌨️',
  },
  {
    id: 'daemon',
    label: 'Docker Daemon',
    hint: 'Background service managing containers',
    row: 1,
    col: 1,
    icon: '⚙️',
  },
  {
    id: 'runtime',
    label: 'Container Runtime',
    hint: 'Actually runs the containers (containerd/runc)',
    row: 2,
    col: 0,
    icon: '🏃',
  },
  {
    id: 'images',
    label: 'Images',
    hint: 'Stored templates used to create containers',
    row: 2,
    col: 1,
    icon: '📦',
  },
  {
    id: 'registry',
    label: 'Registry',
    hint: 'Remote storage for images (Docker Hub)',
    row: 2,
    col: 2,
    icon: '☁️',
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const CONNECTION_ARROWS = [
  { from: 'cli', to: 'daemon', label: 'REST API' },
  { from: 'daemon', to: 'runtime', label: 'manages' },
  { from: 'daemon', to: 'images', label: 'uses' },
  { from: 'daemon', to: 'registry', label: 'pull/push' },
]

export default function Quiz3_ArchitecturePuzzle({ onComplete }) {
  const [pool] = useState(() => shuffle(SLOTS))
  const [placed, setPlaced] = useState({}) // slotId -> true
  const [selected, setSelected] = useState(null) // pool item id
  const [shaking, setShaking] = useState(null) // slot id that's shaking
  const [wrongCount, setWrongCount] = useState(0)

  const allPlaced = Object.keys(placed).length === SLOTS.length

  const handleSlotClick = (slotId) => {
    if (placed[slotId] || !selected) return

    if (selected === slotId) {
      // Correct
      setPlaced((prev) => ({ ...prev, [slotId]: true }))
      setSelected(null)
    } else {
      // Wrong: shake
      setShaking(slotId)
      setWrongCount((c) => c + 1)
      setTimeout(() => setShaking(null), 600)
    }
  }

  const handlePoolClick = (id) => {
    if (placed[id]) return
    setSelected(selected === id ? null : id)
  }

  const getSlotPosition = (slot) => ({
    gridRow: slot.row + 1,
    gridColumn: slot.col + 1,
  })

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: 8,
          fontSize: 24,
        }}
      >
        Docker Architecture Puzzle
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: 14 }}
      >
        Select a component from the pool, then click the correct slot in the diagram.
      </motion.p>

      {!allPlaced ? (
        <>
          {/* Architecture diagram */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, auto)',
              gap: 16,
              marginBottom: 32,
              padding: 24,
              background: 'var(--bg-secondary)',
              borderRadius: 16,
              border: '1px solid var(--border)',
              position: 'relative',
            }}
          >
            {/* Connection arrows shown when both ends are placed */}
            {CONNECTION_ARROWS.map((arrow) => {
              if (!placed[arrow.from] || !placed[arrow.to]) return null
              return (
                <motion.div
                  key={`${arrow.from}-${arrow.to}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    zIndex: 0,
                  }}
                />
              )
            })}

            {SLOTS.map((slot) => {
              const isPlaced = placed[slot.id]
              const isShaking = shaking === slot.id

              return (
                <motion.div
                  key={slot.id}
                  onClick={() => handleSlotClick(slot.id)}
                  animate={
                    isShaking
                      ? { x: [0, -10, 10, -10, 10, 0], borderColor: '#ef4444' }
                      : isPlaced
                      ? { borderColor: '#10b981' }
                      : selected
                      ? { borderColor: 'var(--accent)' }
                      : {}
                  }
                  transition={isShaking ? { duration: 0.4 } : { duration: 0.3 }}
                  style={{
                    ...getSlotPosition(slot),
                    padding: '20px 16px',
                    borderRadius: 14,
                    border: `2px dashed ${isPlaced ? '#10b981' : 'var(--border)'}`,
                    background: isPlaced ? '#10b98112' : 'var(--bg-card)',
                    textAlign: 'center',
                    cursor: selected && !isPlaced ? 'pointer' : 'default',
                    minHeight: 90,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isPlaced ? (
                      <motion.div
                        key="filled"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                      >
                        <span style={{ fontSize: 28 }}>{slot.icon}</span>
                        <span style={{ fontWeight: 700, color: '#10b981', fontSize: 14 }}>{slot.label}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                      >
                        <span style={{ fontSize: 24, opacity: 0.3 }}>❓</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{slot.hint}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Connection labels between placed items */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {CONNECTION_ARROWS.map((arrow) => {
              if (!placed[arrow.from] || !placed[arrow.to]) return null
              return (
                <motion.div
                  key={`${arrow.from}-${arrow.to}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: '#10b98118',
                    border: '1px solid #10b98140',
                    fontSize: 11,
                    color: '#10b981',
                  }}
                >
                  {SLOTS.find((s) => s.id === arrow.from)?.label} &rarr; {arrow.label} &rarr; {SLOTS.find((s) => s.id === arrow.to)?.label}
                </motion.div>
              )
            })}
          </div>

          {/* Component pool */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>
              COMPONENT POOL — Click to select, then place
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {pool.map((item) => {
              const isPlaced = placed[item.id]
              const isSelected = selected === item.id

              return (
                <motion.div
                  key={item.id}
                  onClick={() => handlePoolClick(item.id)}
                  whileHover={!isPlaced ? { scale: 1.06 } : {}}
                  whileTap={!isPlaced ? { scale: 0.95 } : {}}
                  animate={isSelected ? { y: -4, boxShadow: '0 6px 20px rgba(0,0,0,0.2)' } : {}}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    background: isPlaced ? 'transparent' : isSelected ? 'var(--accent)' : 'var(--bg-card)',
                    border: `2px solid ${isPlaced ? 'transparent' : isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    color: isPlaced ? 'transparent' : isSelected ? '#fff' : 'var(--text-primary)',
                    cursor: isPlaced ? 'default' : 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    userSelect: 'none',
                    opacity: isPlaced ? 0.3 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {isPlaced && <span style={{ marginLeft: 4 }}>✅</span>}
                </motion.div>
              )
            })}
          </div>

          {wrongCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}
            >
              Wrong attempts: {wrongCount}
            </motion.p>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: 56, marginBottom: 16 }}
          >
            🏗️
          </motion.div>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            Architecture Complete!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
            You assembled the Docker architecture correctly{wrongCount === 0 ? ' with no mistakes!' : ` with ${wrongCount} wrong attempt${wrongCount > 1 ? 's' : ''}.`}
          </p>

          {/* Full diagram summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, auto)',
              gap: 12,
              padding: 20,
              background: 'var(--bg-secondary)',
              borderRadius: 16,
              border: '1px solid #10b98140',
              marginBottom: 24,
            }}
          >
            {SLOTS.map((slot, i) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                style={{
                  ...getSlotPosition(slot),
                  padding: '16px 12px',
                  borderRadius: 12,
                  background: '#10b98115',
                  border: '2px solid #10b981',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{slot.icon}</div>
                <div style={{ fontWeight: 700, color: '#10b981', fontSize: 13 }}>{slot.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete()}
            style={{
              padding: '12px 32px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Continue
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
