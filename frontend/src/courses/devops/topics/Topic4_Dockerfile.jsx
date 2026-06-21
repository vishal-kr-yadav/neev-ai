import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 4 — Dockerfiles
   Cinematic visual: Blueprint metaphor → building Docker images
================================================================ */

const springPop = { type: 'spring', stiffness: 400, damping: 20 }
const springBounce = { type: 'spring', stiffness: 300, damping: 15 }

/* ---- 1. Dockerfile Builder ---- */
function DockerfileBuilder() {
  const instructions = [
    { id: 'from', cmd: 'FROM node:18-alpine', icon: '🏔️', label: 'FROM', desc: 'Base image' },
    { id: 'workdir', cmd: 'WORKDIR /app', icon: '📂', label: 'WORKDIR', desc: 'Set directory' },
    { id: 'copy-pkg', cmd: 'COPY package*.json ./', icon: '📋', label: 'COPY deps', desc: 'Copy package files' },
    { id: 'run', cmd: 'RUN npm install', icon: '⚙️', label: 'RUN', desc: 'Install deps' },
    { id: 'copy-src', cmd: 'COPY . .', icon: '📦', label: 'COPY src', desc: 'Copy source' },
    { id: 'expose', cmd: 'EXPOSE 3000', icon: '🌐', label: 'EXPOSE', desc: 'Open port' },
    { id: 'cmd', cmd: 'CMD ["node", "server.js"]', icon: '🚀', label: 'CMD', desc: 'Start command' },
  ]

  const [placed, setPlaced] = useState([])
  const [wrong, setWrong] = useState(null)
  const [complete, setComplete] = useState(false)

  const nextIndex = placed.length
  const available = instructions.filter(inst => !placed.find(p => p.id === inst.id))

  const handleClick = (inst) => {
    if (complete) return
    const correctInst = instructions[nextIndex]
    if (inst.id === correctInst.id) {
      const newPlaced = [...placed, inst]
      setPlaced(newPlaced)
      setWrong(null)
      if (newPlaced.length === instructions.length) {
        setTimeout(() => setComplete(true), 600)
      }
    } else {
      setWrong(inst.id)
      setTimeout(() => setWrong(null), 800)
    }
  }

  const reset = () => {
    setPlaced([])
    setComplete(false)
    setWrong(null)
  }

  return (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
      {/* Available instructions */}
      <div style={{ flex: '1 1 280px', minWidth: 260 }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
          color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          Available Instructions
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <AnimatePresence>
            {available.map(inst => (
              <motion.button
                key={inst.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: wrong === inst.id ? [0, -8, 8, -6, 6, 0] : 0,
                  background: wrong === inst.id
                    ? 'linear-gradient(135deg, #fecaca, #fca5a5)'
                    : 'var(--bg-secondary)',
                }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.08, boxShadow: '0 6px 20px rgba(99,102,241,0.2)' }}
                whileTap={{ scale: 0.95 }}
                transition={springPop}
                onClick={() => handleClick(inst)}
                style={{
                  padding: '12px 18px', borderRadius: 14,
                  border: '2px solid var(--border)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <span style={{ fontSize: 20 }}>{inst.icon}</span>
                {inst.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {placed.length > 0 && !complete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 16, padding: '10px 16px', borderRadius: 10,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              fontSize: 13, color: '#1e40af', fontWeight: 600,
            }}
          >
            Next: Pick the <strong>{instructions[nextIndex]?.desc}</strong> instruction
          </motion.div>
        )}

        {complete && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            style={{
              marginTop: 16, padding: '12px 28px', borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
            }}
          >
            🔄 Build Again
          </motion.button>
        )}
      </div>

      {/* Dockerfile preview */}
      <div style={{ flex: '1 1 320px', minWidth: 300 }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
          color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          Your Dockerfile
        </div>
        <div style={{
          background: '#1e1e2e', borderRadius: 16, padding: '24px 20px',
          fontFamily: 'monospace', fontSize: 14, lineHeight: 2,
          color: '#cdd6f4', minHeight: 220,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Window dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f38ba8' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f9e2af' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a6e3a1' }} />
            <span style={{ marginLeft: 8, fontSize: 11, color: '#6c7086' }}>Dockerfile</span>
          </div>

          {placed.length === 0 && (
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ color: '#6c7086', fontStyle: 'italic', fontSize: 13 }}
            >
              # Click instructions to build...
            </motion.div>
          )}

          <AnimatePresence>
            {placed.map((inst, i) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, x: -30, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ ...springBounce, delay: 0.05 }}
                style={{ overflow: 'hidden' }}
              >
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>
                  {inst.cmd.split(' ')[0]}
                </span>
                <span style={{ color: '#a6e3a1' }}>
                  {' '}{inst.cmd.split(' ').slice(1).join(' ')}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Cursor blink */}
          {!complete && placed.length > 0 && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ color: '#89b4fa', fontSize: 16, fontWeight: 700 }}
            >
              _
            </motion.span>
          )}

          {/* Success overlay */}
          <AnimatePresence>
            {complete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(166, 227, 161, 0.1)',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  paddingBottom: 16,
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springPop}
                  style={{
                    background: 'linear-gradient(135deg, #a6e3a1, #94e2d5)',
                    color: '#1e1e2e', padding: '8px 20px', borderRadius: 10,
                    fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-heading)',
                  }}
                >
                  ✅ Dockerfile Complete!
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ---- 2. Instruction Explorer ---- */
function InstructionExplorer() {
  const [active, setActive] = useState(null)

  const cards = [
    {
      cmd: 'FROM', icon: '🏔️', color: '#6366f1',
      analogy: 'Choosing Your Base Camp',
      detail: 'Every journey starts somewhere. FROM picks your starting OS + runtime. Like choosing which mountain base camp to start from.',
      example: 'FROM node:18-alpine',
    },
    {
      cmd: 'WORKDIR', icon: '📂', color: '#0ea5e9',
      analogy: 'Setting Up Your Desk',
      detail: 'Creates and moves into your working directory. Like setting up your desk before starting work. Everything after happens here.',
      example: 'WORKDIR /app',
    },
    {
      cmd: 'COPY', icon: '📋', color: '#10b981',
      analogy: 'Packing Your Suitcase',
      detail: 'Brings files from your machine INTO the container. Like carefully packing exactly what you need for the trip.',
      example: 'COPY package.json ./',
    },
    {
      cmd: 'RUN', icon: '⚙️', color: '#f59e0b',
      analogy: 'Building the Furniture',
      detail: 'Executes commands during image BUILD time. Install dependencies, compile code, set up configs. Runs once, result is baked in.',
      example: 'RUN npm install',
    },
    {
      cmd: 'EXPOSE', icon: '🌐', color: '#ec4899',
      analogy: 'Opening the Window',
      detail: 'Declares which port your app listens on. Like putting a "door here" sign. Documents intent, doesn\'t actually publish.',
      example: 'EXPOSE 3000',
    },
    {
      cmd: 'CMD', icon: '🚀', color: '#ef4444',
      analogy: 'The Ignition Key',
      detail: 'The default command when the container STARTS. Only one CMD per Dockerfile. Like turning the ignition key in your car.',
      example: 'CMD ["node", "server.js"]',
    },
    {
      cmd: 'ENV', icon: '🏷️', color: '#8b5cf6',
      analogy: 'Labeling Your Drawers',
      detail: 'Sets environment variables available at build AND runtime. Like labeling drawers so everything knows where to find things.',
      example: 'ENV NODE_ENV=production',
    },
    {
      cmd: 'ARG', icon: '🔑', color: '#14b8a6',
      analogy: 'The Secret Combination',
      detail: 'Build-time only variables. Passed with --build-arg. Gone after build. Like a construction code that expires when building is done.',
      example: 'ARG VERSION=1.0',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 14,
    }}>
      {cards.map((card, i) => {
        const isActive = active === card.cmd
        return (
          <motion.div
            key={card.cmd}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, ...springBounce }}
            onClick={() => setActive(isActive ? null : card.cmd)}
            whileHover={{ y: -4 }}
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${card.color}15, ${card.color}08)`
                : 'var(--bg-secondary)',
              border: `2px solid ${isActive ? card.color : 'var(--border)'}`,
              borderRadius: 18, padding: isActive ? '20px 18px' : '18px 16px',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              gridColumn: isActive ? 'span 2' : 'span 1',
              transition: 'grid-column 0.3s',
            }}
          >
            {/* Glow */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 120, height: 120, borderRadius: '50%',
                  background: `radial-gradient(circle, ${card.color}20, transparent)`,
                }}
              />
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={springPop}
                style={{ fontSize: isActive ? 36 : 30, marginBottom: 8 }}
              >
                {card.icon}
              </motion.div>

              <div style={{
                fontFamily: 'monospace', fontWeight: 800,
                fontSize: isActive ? 20 : 16, color: card.color,
                marginBottom: isActive ? 6 : 4,
              }}>
                {card.cmd}
              </div>

              <AnimatePresence>
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-heading)', fontSize: 14,
                      fontWeight: 700, color: card.color, marginBottom: 8,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ fontSize: 12 }}>💡</span> {card.analogy}
                    </div>
                    <div style={{
                      fontSize: 13, color: 'var(--text-secondary)',
                      lineHeight: 1.7, marginBottom: 12,
                    }}>
                      {card.detail}
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: 12,
                      background: '#1e1e2e', color: '#a6e3a1',
                      padding: '8px 14px', borderRadius: 10,
                      fontWeight: 600,
                    }}>
                      {card.example}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}
                  >
                    {card.analogy}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ---- 3. Layer Visualizer ---- */
function LayerVisualizer() {
  const [changedAt, setChangedAt] = useState(null)
  const [built, setBuilt] = useState(false)

  const layers = [
    { label: 'FROM node:18-alpine', icon: '🏔️', size: '45 MB', color: '#6366f1' },
    { label: 'WORKDIR /app', icon: '📂', size: '0 B', color: '#0ea5e9' },
    { label: 'COPY package.json ./', icon: '📋', size: '2 KB', color: '#10b981' },
    { label: 'RUN npm install', icon: '⚙️', size: '85 MB', color: '#f59e0b' },
    { label: 'COPY . .', icon: '📦', size: '12 MB', color: '#ec4899' },
    { label: 'CMD ["node","server.js"]', icon: '🚀', size: '0 B', color: '#ef4444' },
  ]

  const handleBuild = () => {
    setBuilt(false)
    setChangedAt(null)
    setTimeout(() => setBuilt(true), 100)
  }

  const handleChange = (idx) => {
    setChangedAt(idx)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBuild}
          style={{
            padding: '10px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
          }}
        >
          🔨 Build Image
        </motion.button>

        {built && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChangedAt(null)}
            style={{
              padding: '10px 24px', borderRadius: 12,
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)', border: '2px solid var(--border)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            🔄 Reset Cache
          </motion.button>
        )}
      </div>

      {/* Layer stack */}
      <div style={{
        display: 'flex', flexDirection: 'column-reverse', gap: 6,
        maxWidth: 520,
      }}>
        <AnimatePresence>
          {built && layers.map((layer, i) => {
            const isCached = changedAt !== null && i < changedAt
            const isChanged = changedAt !== null && i === changedAt
            const rebuilds = changedAt !== null && i >= changedAt

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -60, scaleY: 0.3 }}
                animate={{
                  opacity: 1, x: 0, scaleY: 1,
                  background: isCached
                    ? 'linear-gradient(90deg, #ecfdf5, #d1fae5)'
                    : rebuilds
                    ? 'linear-gradient(90deg, #fff7ed, #ffedd5)'
                    : `linear-gradient(90deg, ${layer.color}10, ${layer.color}05)`,
                }}
                transition={{ delay: i * 0.15, ...springBounce }}
                onClick={() => handleChange(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', borderRadius: 14,
                  border: `2px solid ${
                    isChanged ? '#f97316' : isCached ? '#10b981' : rebuilds ? '#fb923c' : `${layer.color}30`
                  }`,
                  cursor: 'pointer', position: 'relative',
                }}
              >
                <span style={{ fontSize: 22 }}>{layer.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 13,
                    fontWeight: 700, color: 'var(--text-primary)',
                  }}>
                    {layer.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {layer.size}
                  </div>
                </div>

                {/* Cache status badge */}
                {changedAt !== null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springPop}
                    style={{
                      padding: '4px 10px', borderRadius: 8,
                      fontSize: 11, fontWeight: 800,
                      background: isCached ? '#10b981' : '#f97316',
                      color: 'white',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {isCached ? '✓ CACHED' : isChanged ? '✎ CHANGED' : '↻ REBUILD'}
                  </motion.div>
                )}

                {/* Layer number */}
                <div style={{
                  position: 'absolute', left: -32, top: '50%', transform: 'translateY(-50%)',
                  width: 22, height: 22, borderRadius: '50%',
                  background: `${layer.color}20`, color: layer.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                }}>
                  {i + 1}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {built && !changedAt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: layers.length * 0.15 + 0.3 }}
          style={{
            marginTop: 16, fontSize: 13, color: 'var(--text-muted)',
            fontWeight: 600, fontStyle: 'italic',
          }}
        >
          Click any layer to simulate changing it and see cache behavior
        </motion.div>
      )}

      {changedAt !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 16, padding: '14px 20px', borderRadius: 14,
            background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
            border: '1px solid #fed7aa', fontSize: 13,
            color: '#9a3412', lineHeight: 1.7, fontWeight: 600,
          }}
        >
          <strong>Layer {changedAt + 1} changed!</strong> All layers below ({changedAt}) are cached (green).
          All layers from the change onward ({layers.length - changedAt}) must rebuild (orange).
          <br />
          <span style={{ fontWeight: 800 }}>
            Tip: Put rarely-changing layers (deps) BEFORE frequently-changing layers (source code)!
          </span>
        </motion.div>
      )}
    </div>
  )
}

/* ---- 4. Multi-Stage Demo ---- */
function MultiStageDemo() {
  const [stage, setStage] = useState('single')
  const [animating, setAnimating] = useState(false)

  const singleStageItems = [
    { label: 'Base OS + build tools', size: 420, color: '#6366f1', icon: '🏗️' },
    { label: 'Dev dependencies', size: 280, color: '#f59e0b', icon: '📦' },
    { label: 'Source code', size: 45, color: '#10b981', icon: '📄' },
    { label: 'Compiled app', size: 12, color: '#ec4899', icon: '⚡' },
    { label: 'Build cache/artifacts', size: 150, color: '#ef4444', icon: '🗑️' },
  ]

  const multiStageItems = [
    { label: 'Alpine base', size: 5, color: '#6366f1', icon: '🏔️' },
    { label: 'Runtime only', size: 18, color: '#10b981', icon: '📦' },
    { label: 'Compiled app', size: 12, color: '#ec4899', icon: '⚡' },
  ]

  const singleTotal = singleStageItems.reduce((a, b) => a + b.size, 0)
  const multiTotal = multiStageItems.reduce((a, b) => a + b.size, 0)
  const items = stage === 'single' ? singleStageItems : multiStageItems
  const total = stage === 'single' ? singleTotal : multiTotal

  const switchStage = (s) => {
    if (s === stage) return
    setAnimating(true)
    setStage(s)
    setTimeout(() => setAnimating(false), 600)
  }

  return (
    <div>
      {/* Toggle */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 28,
        background: 'var(--bg-secondary)', borderRadius: 14,
        padding: 4, width: 'fit-content',
      }}>
        {['single', 'multi'].map(s => (
          <motion.button
            key={s}
            whileTap={{ scale: 0.95 }}
            onClick={() => switchStage(s)}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none',
              background: stage === s
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'transparent',
              color: stage === s ? 'white' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {s === 'single' ? '1️⃣ Single Stage' : '🎯 Multi-Stage'}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {/* Visual bar chart */}
        <div style={{ flex: '1 1 300px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  transition={{ delay: i * 0.1, ...springBounce }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', marginBottom: 4,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>
                        {item.size} MB
                      </span>
                    </div>
                    <div style={{
                      height: 20, borderRadius: 10, background: 'var(--bg-secondary)',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.size / singleTotal) * 100}%` }}
                        transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: 'easeOut' }}
                        style={{
                          height: '100%', borderRadius: 10,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}bb)`,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Total size indicator */}
        <div style={{
          flex: '0 0 160px', textAlign: 'center', paddingBottom: 8,
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={springPop}
            >
              <motion.div
                animate={{
                  width: stage === 'single' ? 140 : 55,
                  height: stage === 'single' ? 140 : 55,
                }}
                transition={{ ...springBounce, duration: 0.8 }}
                style={{
                  borderRadius: '50%',
                  background: stage === 'single'
                    ? 'linear-gradient(135deg, #ef4444, #f97316)'
                    : 'linear-gradient(135deg, #10b981, #14b8a6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', margin: '0 auto 16px',
                  boxShadow: stage === 'single'
                    ? '0 8px 32px rgba(239,68,68,0.3)'
                    : '0 8px 32px rgba(16,185,129,0.3)',
                }}
              >
                <div style={{
                  color: 'white', fontWeight: 800,
                  fontSize: stage === 'single' ? 28 : 16,
                  fontFamily: 'var(--font-heading)',
                  lineHeight: 1,
                }}>
                  {total}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: stage === 'single' ? 12 : 8,
                  fontWeight: 700,
                }}>
                  MB
                </div>
              </motion.div>

              <div style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: 18,
                color: stage === 'single' ? '#ef4444' : '#10b981',
              }}>
                {stage === 'single' ? '907 MB' : '35 MB'}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4,
              }}>
                {stage === 'single' ? 'Bloated image' : '96% smaller!'}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Multi-stage code example */}
      <AnimatePresence>
        {stage === 'multi' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 24, background: '#1e1e2e', borderRadius: 16,
              padding: '20px 24px', fontFamily: 'monospace', fontSize: 13,
              lineHeight: 2, color: '#cdd6f4',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f38ba8' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f9e2af' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a6e3a1' }} />
                <span style={{ marginLeft: 8, fontSize: 11, color: '#6c7086' }}>Dockerfile (multi-stage)</span>
              </div>
              <div><span style={{ color: '#6c7086' }}># Stage 1: Build</span></div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>FROM</span>
                <span style={{ color: '#a6e3a1' }}> node:18 AS builder</span>
              </div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>WORKDIR</span>
                <span style={{ color: '#a6e3a1' }}> /app</span>
              </div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>COPY</span>
                <span style={{ color: '#a6e3a1' }}> . .</span>
              </div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>RUN</span>
                <span style={{ color: '#a6e3a1' }}> npm ci && npm run build</span>
              </div>
              <div style={{ marginTop: 8 }}><span style={{ color: '#6c7086' }}># Stage 2: Production</span></div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>FROM</span>
                <span style={{ color: '#a6e3a1' }}> node:18-alpine</span>
              </div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>WORKDIR</span>
                <span style={{ color: '#a6e3a1' }}> /app</span>
              </div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>COPY</span>
                <span style={{ color: '#f9e2af' }}> --from=builder</span>
                <span style={{ color: '#a6e3a1' }}> /app/dist ./dist</span>
              </div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>COPY</span>
                <span style={{ color: '#f9e2af' }}> --from=builder</span>
                <span style={{ color: '#a6e3a1' }}> /app/node_modules ./node_modules</span>
              </div>
              <div>
                <span style={{ color: '#89b4fa', fontWeight: 700 }}>CMD</span>
                <span style={{ color: '#a6e3a1' }}> ["node", "dist/server.js"]</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic4_Dockerfile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Neuron mood="excited" typed message="Time to write the BLUEPRINT for your Docker image. A Dockerfile is like an architect's plan — every line is an instruction that builds your perfect container, layer by layer." />

      <SectionBlock title="Build a Dockerfile" icon="🏗️">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Click the instructions in the correct order to build a real Dockerfile:
        </p>
        <InteractiveDemo title="Dockerfile Builder" instruction="Click each instruction in the right order">
          <DockerfileBuilder />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Every Instruction Explained" icon="📖">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Click any card to explore its meaning through a real-world analogy:
        </p>
        <InteractiveDemo title="Instruction Explorer" instruction="Click a card to reveal its secrets">
          <InstructionExplorer />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="tip">
        <strong>Order matters!</strong> Docker caches each layer. Put things that change LEAST at the top (base image, dependencies) and things that change MOST at the bottom (source code). This makes rebuilds lightning fast.
      </NeuronTip>

      <SectionBlock title="How Layers & Caching Work" icon="🧱">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Every instruction creates a layer. Watch how caching saves time:
        </p>
        <InteractiveDemo title="Layer Visualizer" instruction="Build the image, then click a layer to simulate a change">
          <LayerVisualizer />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Multi-Stage Builds" icon="🎯">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          The secret weapon for tiny production images:
        </p>
        <InteractiveDemo title="Single vs Multi-Stage" instruction="Toggle between approaches and watch the size difference">
          <MultiStageDemo />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="warning">
        <strong>Never put secrets in your Dockerfile!</strong> No passwords, API keys, or tokens in ENV or ARG. They get baked into the image layers and anyone with the image can extract them. Use runtime environment variables or Docker secrets instead.
      </NeuronTip>

      <NeuronTip type="deep">
        <strong>Best practices checklist:</strong> Use specific tags (node:18-alpine, not node:latest). Combine RUN commands with && to reduce layers. Add a .dockerignore file. Use COPY instead of ADD unless you need tar extraction. Always use multi-stage builds for production.
      </NeuronTip>

      <Neuron mood="happy" typed message="You can now write Dockerfiles like a pro! You understand every instruction, how layers and caching work, and why multi-stage builds are essential. Next up — let's learn how to manage multiple containers with Docker Compose." />
    </div>
  )
}
