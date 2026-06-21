import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 3 — Docker Architecture
   Cinematic visual: Engine, Daemon, CLI, Images, Containers, Registry
================================================================ */

/* ---- 1. Architecture Diagram — Interactive node map ---- */
function ArchitectureDiagram() {
  const [selected, setSelected] = useState(null)

  const nodes = [
    {
      id: 'cli',
      label: 'Docker CLI',
      icon: '⌨️',
      x: 8, y: 42,
      color: '#6366f1',
      desc: 'Your command center. When you type "docker run" or "docker build", the CLI translates your intent into API calls and sends them to the Docker Daemon.',
    },
    {
      id: 'daemon',
      label: 'Docker Daemon',
      icon: '⚙️',
      x: 38, y: 42,
      color: '#0ea5e9',
      desc: 'The brain of Docker. A background service (dockerd) that manages images, containers, networks, and volumes. It listens for API requests and does the heavy lifting.',
    },
    {
      id: 'images',
      label: 'Images',
      icon: '📐',
      x: 65, y: 18,
      color: '#8b5cf6',
      desc: 'Read-only blueprints. An image is a snapshot containing your app code, runtime, libraries, and configs. Think of it as a recipe — you never eat the recipe itself.',
    },
    {
      id: 'containers',
      label: 'Containers',
      icon: '📦',
      x: 65, y: 65,
      color: '#10b981',
      desc: 'Living instances created from images. Each container is an isolated process with its own filesystem, network, and process tree. Lightweight and ephemeral.',
    },
    {
      id: 'registry',
      label: 'Registry',
      icon: '☁️',
      x: 92, y: 42,
      color: '#f59e0b',
      desc: 'A library of images. Docker Hub is the default public registry. You push images to share them, and pull images to use them. Like GitHub, but for container images.',
    },
  ]

  /* Connection paths between nodes */
  const connections = [
    { from: 'cli', to: 'daemon', label: 'REST API' },
    { from: 'daemon', to: 'images', label: 'build / pull' },
    { from: 'daemon', to: 'containers', label: 'run / create' },
    { from: 'images', to: 'registry', label: 'push / pull' },
    { from: 'images', to: 'containers', label: 'instantiate' },
  ]

  const getNodePos = (id) => {
    const n = nodes.find(n => n.id === id)
    return { x: n.x, y: n.y }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* The interactive canvas */}
      <div style={{
        position: 'relative', width: '100%', height: 380,
        background: 'var(--bg-card)', borderRadius: 20,
        border: '1px solid var(--border)', overflow: 'hidden',
      }}>
        {/* Animated background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* SVG connections */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {connections.map((conn, i) => {
            const from = getNodePos(conn.from)
            const to = getNodePos(conn.to)
            const isActive = selected === conn.from || selected === conn.to
            return (
              <g key={i}>
                <line
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`} y2={`${to.y}%`}
                  stroke={isActive ? '#6366f1' : 'var(--border)'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeDasharray={isActive ? '0' : '6 4'}
                  opacity={isActive ? 1 : 0.5}
                />
                {/* Flowing dot */}
                <circle r={isActive ? 5 : 3} fill={isActive ? '#6366f1' : 'var(--text-muted)'} opacity={isActive ? 1 : 0.4}>
                  <animateMotion
                    dur={isActive ? '1.5s' : '3s'}
                    repeatCount="indefinite"
                    path={`M${from.x * 3.8},${from.y * 3.8} L${to.x * 3.8},${to.y * 3.8}`}
                  />
                </circle>
                {/* Label on connection */}
                {isActive && (
                  <text
                    x={`${(from.x + to.x) / 2}%`}
                    y={`${(from.y + to.y) / 2 - 3}%`}
                    textAnchor="middle"
                    fill="#6366f1"
                    fontSize={11}
                    fontWeight={700}
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.button
            key={node.id}
            onClick={() => setSelected(selected === node.id ? null : node.id)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1, opacity: 1,
              boxShadow: selected === node.id
                ? `0 0 28px ${node.color}50`
                : `0 4px 16px ${node.color}20`,
            }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              left: `${node.x}%`, top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 90, height: 90, borderRadius: '50%',
              background: selected === node.id
                ? `linear-gradient(135deg, ${node.color}, ${node.color}cc)`
                : 'var(--bg-card)',
              border: `3px solid ${node.color}`,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              color: selected === node.id ? 'white' : node.color,
              zIndex: selected === node.id ? 10 : 2,
            }}
          >
            <span style={{ fontSize: 26, lineHeight: 1 }}>{node.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1.1, textAlign: 'center' }}>
              {node.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              marginTop: 16, padding: '22px 28px', borderRadius: 16,
              background: `${nodes.find(n => n.id === selected).color}10`,
              border: `2px solid ${nodes.find(n => n.id === selected).color}30`,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
            }}>
              <span style={{ fontSize: 32 }}>{nodes.find(n => n.id === selected).icon}</span>
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800,
                color: nodes.find(n => n.id === selected).color,
              }}>
                {nodes.find(n => n.id === selected).label}
              </span>
            </div>
            <div style={{
              fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75,
            }}>
              {nodes.find(n => n.id === selected).desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            textAlign: 'center', marginTop: 14, fontSize: 14,
            color: 'var(--text-muted)', fontWeight: 500,
          }}
        >
          Click any node to explore its role
        </motion.p>
      )}
    </div>
  )
}

/* ---- 2. Image vs Container — Blueprint vs Running Instance ---- */
function ImageVsContainer() {
  const [containers, setContainers] = useState([])
  const [nextId, setNextId] = useState(1)

  const spawnContainer = () => {
    const id = nextId
    setNextId(id + 1)
    setContainers(prev => [...prev, {
      id,
      name: `container-${id}`,
      color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444'][id % 6],
      port: 3000 + id,
    }])
  }

  const removeContainer = (id) => {
    setContainers(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 24, alignItems: 'start',
      }}>
        {/* Image — the blueprint */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ boxShadow: ['0 0 0px #8b5cf630', '0 0 30px #8b5cf630', '0 0 0px #8b5cf630'] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              padding: '28px 20px', borderRadius: 20,
              background: 'linear-gradient(145deg, #8b5cf610, #6366f110)',
              border: '2px solid #8b5cf630',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 8 }}>📐</div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800,
              color: '#8b5cf6', marginBottom: 6,
            }}>
              Image
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Read-only blueprint. Never changes. Like a cookie cutter.
            </div>

            {/* Layers visualization */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {['App Code', 'Dependencies', 'Runtime', 'Base OS'].map((layer, i) => (
                <motion.div
                  key={layer}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
                  style={{
                    padding: '6px 12px', borderRadius: 6,
                    background: `#8b5cf6${15 + i * 8}`,
                    fontSize: 11, fontWeight: 600,
                    color: '#7c3aed',
                  }}
                >
                  {layer}
                </motion.div>
              ))}
            </div>

            <motion.div
              style={{
                position: 'absolute', top: 8, right: 8,
                background: '#8b5cf6', color: 'white',
                padding: '3px 10px', borderRadius: 20,
                fontSize: 10, fontWeight: 700,
              }}
            >
              READ-ONLY
            </motion.div>
          </motion.div>

          <motion.button
            onClick={spawnContainer}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              marginTop: 16, padding: '14px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
              boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
            }}
          >
            docker run ▶
          </motion.button>
        </div>

        {/* Arrow */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          paddingTop: 60, gap: 8,
        }}>
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: 32, color: '#10b981' }}
          >
            ➜
          </motion.div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>creates</span>
        </div>

        {/* Containers — running instances */}
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800,
            color: '#10b981', marginBottom: 12, textAlign: 'center',
          }}>
            Running Containers
          </div>

          <div style={{
            minHeight: 200, padding: 16, borderRadius: 16,
            border: '2px dashed var(--border)',
            background: 'var(--bg-card)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {containers.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 16px',
                color: 'var(--text-muted)', fontSize: 14,
              }}>
                No containers running. Click "docker run" to spawn one!
              </div>
            ) : (
              <AnimatePresence>
                {containers.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ scale: 0, x: -40, opacity: 0 }}
                    animate={{ scale: 1, x: 0, opacity: 1 }}
                    exit={{ scale: 0, x: 40, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 12,
                      background: `${c.color}10`,
                      border: `1.5px solid ${c.color}30`,
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: c.color,
                        boxShadow: `0 0 8px ${c.color}60`,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>:{c.port} running</div>
                    </div>
                    <motion.button
                      onClick={() => removeContainer(c.id)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: '#ef444420', border: '1px solid #ef444430',
                        color: '#ef4444', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      ✕
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {containers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 10, padding: '8px 14px', borderRadius: 10,
                background: '#10b98110', textAlign: 'center',
                fontSize: 12, color: '#059669', fontWeight: 600,
              }}
            >
              {containers.length} container{containers.length > 1 ? 's' : ''} from the same image — each isolated!
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- 3. Docker Flow Animation — Pull → Store → Run → App ---- */
function DockerFlowAnimation() {
  const [step, setStep] = useState(-1)
  const [auto, setAuto] = useState(false)

  const steps = [
    {
      id: 0,
      command: 'docker pull nginx',
      title: 'Pull Image',
      icon: '☁️',
      visual: '⬇️',
      desc: 'Docker contacts the registry (Docker Hub) and downloads the nginx image layer by layer.',
      color: '#f59e0b',
      metaphor: 'Ordering a blueprint from the warehouse',
    },
    {
      id: 1,
      command: '',
      title: 'Image Stored Locally',
      icon: '💾',
      visual: '📐',
      desc: 'The image is now cached on your machine. Layers are shared between images — no duplicate downloads!',
      color: '#8b5cf6',
      metaphor: 'Blueprint filed in your local library',
    },
    {
      id: 2,
      command: 'docker run -d -p 80:80 nginx',
      title: 'Container Created',
      icon: '📦',
      visual: '🏗️',
      desc: 'Docker creates a thin writable layer on top of the image, sets up networking, and isolates the process.',
      color: '#0ea5e9',
      metaphor: 'Building from the blueprint, adding a fresh workspace',
    },
    {
      id: 3,
      command: '',
      title: 'App Running!',
      icon: '🚀',
      visual: '🌐',
      desc: 'Your nginx server is live, serving traffic on port 80. Fully isolated. Started in under a second.',
      color: '#10b981',
      metaphor: 'The building is open for business',
    },
  ]

  useEffect(() => {
    if (!auto || step >= steps.length - 1) {
      if (step >= steps.length - 1) setAuto(false)
      return
    }
    const timer = setTimeout(() => setStep(s => s + 1), 2000)
    return () => clearTimeout(timer)
  }, [auto, step])

  const startAutoPlay = () => {
    setStep(0)
    setAuto(true)
  }

  return (
    <div>
      {/* Pipeline bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, marginBottom: 32, position: 'relative',
      }}>
        {/* Track line */}
        <div style={{
          position: 'absolute', top: '50%', left: '10%', right: '10%',
          height: 4, background: 'var(--border)', borderRadius: 4,
          transform: 'translateY(-50%)',
        }}>
          <motion.div
            animate={{ width: step < 0 ? '0%' : `${(step / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 4,
              background: 'linear-gradient(90deg, #f59e0b, #8b5cf6, #0ea5e9, #10b981)',
            }}
          />
        </div>

        {steps.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => { setAuto(false); setStep(i) }}
            animate={{
              scale: i === step ? 1.2 : 1,
              background: i <= step
                ? `linear-gradient(135deg, ${s.color}, ${s.color}cc)`
                : 'var(--bg-secondary)',
              boxShadow: i === step ? `0 0 24px ${s.color}50` : 'none',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'relative', zIndex: 2,
              width: 64, height: 64, borderRadius: '50%',
              border: `3px solid ${i <= step ? s.color : 'var(--border)'}`,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: i <= step ? 'white' : 'var(--text-muted)',
              margin: '0 auto',
              flex: 1,
            }}
          >
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <span style={{ fontSize: 8, fontWeight: 700, marginTop: 1 }}>{i + 1}</span>
          </motion.button>
        ))}
      </div>

      {/* Step detail */}
      <AnimatePresence mode="wait">
        {step >= 0 ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{
              padding: '28px 32px', borderRadius: 20,
              background: `${steps[step].color}08`,
              border: `2px solid ${steps[step].color}25`,
              textAlign: 'center',
            }}
          >
            {/* Big animated visual */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: step === 2 ? [0, 5, -5, 0] : 0,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: 64, marginBottom: 12 }}
            >
              {steps[step].visual}
            </motion.div>

            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800,
              color: steps[step].color, marginBottom: 8,
            }}>
              {steps[step].title}
            </div>

            {/* Command line */}
            {steps[step].command && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{
                  display: 'inline-block', padding: '8px 20px', borderRadius: 10,
                  background: '#1e1e2e', color: '#10b981',
                  fontFamily: 'monospace', fontSize: 14, fontWeight: 600,
                  marginBottom: 14, letterSpacing: 0.5,
                }}
              >
                <span style={{ color: '#6b7280' }}>$ </span>
                {steps[step].command}
              </motion.div>
            )}

            <div style={{
              fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75,
              maxWidth: 520, margin: '0 auto', marginBottom: 12,
            }}>
              {steps[step].desc}
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 10,
              background: `${steps[step].color}12`,
              fontSize: 13, color: steps[step].color, fontWeight: 600,
            }}>
              <span>💡</span> {steps[step].metaphor}
            </div>

            {/* Progress indicator */}
            <div style={{
              display: 'flex', gap: 6, justifyContent: 'center', marginTop: 18,
            }}>
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === step ? 28 : 8,
                    background: i <= step ? steps[i].color : 'var(--border)',
                  }}
                  style={{ height: 8, borderRadius: 4 }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '48px 32px', borderRadius: 20,
              background: 'var(--bg-secondary)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🐳</div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800,
              color: 'var(--text-primary)', marginBottom: 8,
            }}>
              Ready to See the Docker Flow?
            </div>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 20 }}>
              Watch how a single command travels through Docker's architecture.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
        <motion.button
          onClick={startAutoPlay}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 28px', borderRadius: 12,
            background: auto
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
            boxShadow: auto ? '0 6px 20px #ef444430' : '0 6px 20px #6366f130',
          }}
        >
          {auto ? '⏸ Playing...' : '▶ Auto-Play Flow'}
        </motion.button>

        {step >= 0 && (
          <motion.button
            onClick={() => { setAuto(false); setStep(-1) }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 22px', borderRadius: 12,
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)', border: '1px solid var(--border)',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            ↺ Reset
          </motion.button>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic3_DockerArchitecture() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Neuron mood="excited" typed message="Time to look under the hood! Docker isn't just one thing — it's an elegant architecture of cooperating parts. Let me show you how they all fit together, visually." />

      <SectionBlock title="The Docker Architecture Map" icon="🗺️">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Docker has five key components that work together. Click each one to explore:
        </p>
        <InteractiveDemo title="Interactive Architecture Explorer">
          <ArchitectureDiagram />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="explaining">
        Think of it like a restaurant: the CLI is the waiter taking your order, the Daemon is the kitchen preparing everything, Images are the recipes, Containers are the actual dishes served, and the Registry is the cookbook library where recipes are shared.
      </NeuronTip>

      <SectionBlock title="Images vs Containers" icon="📐">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          This is the most important distinction in Docker. An image is the blueprint. A container is the living, running thing built from that blueprint.
        </p>
        <InteractiveDemo title="Spawn Containers from an Image">
          <ImageVsContainer />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="thinking">
        One image can spawn hundreds of identical containers. When a container is destroyed, the image remains untouched. This is why containers are called "ephemeral" — they come and go, but the image is forever.
      </NeuronTip>

      <SectionBlock title="The Docker Flow" icon="🔄">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Watch the full journey from typing a command to a running application:
        </p>
        <InteractiveDemo title="From Command to Container">
          <DockerFlowAnimation />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="happy" typed message="Now you understand Docker's inner workings! You know the Client-Daemon architecture, the difference between images and containers, and how a command flows through the system. Next, we'll get hands-on and actually build things with Docker!" />
    </div>
  )
}
