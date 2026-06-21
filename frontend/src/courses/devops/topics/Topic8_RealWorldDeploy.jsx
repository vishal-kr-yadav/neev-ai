import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 8 — Real-World Docker Deployment
   Grand Finale: CI/CD Pipelines, Registries, Production, Scale
================================================================ */

/* ---- 1. CI/CD Pipeline Animation ---- */
function CICDPipelineAnimation() {
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)
  const [completed, setCompleted] = useState([])
  const [particles, setParticles] = useState([])

  const steps = [
    { icon: '📝', label: 'Git Push', color: '#8b5cf6', detail: 'git push origin main', glow: '#8b5cf680' },
    { icon: '🔍', label: 'CI Picks Up', color: '#3b82f6', detail: 'GitHub Actions triggered', glow: '#3b82f680' },
    { icon: '🧪', label: 'Run Tests', color: '#f59e0b', detail: 'pytest / jest passing...', glow: '#f59e0b80' },
    { icon: '🐳', label: 'Build Image', color: '#06b6d4', detail: 'docker build -t app:v2.1 .', glow: '#06b6d480' },
    { icon: '📤', label: 'Push Registry', color: '#10b981', detail: 'docker push registry/app:v2.1', glow: '#10b98180' },
    { icon: '🚀', label: 'Deploy!', color: '#ef4444', detail: 'Rolling update → Production', glow: '#ef444480' },
  ]

  const runPipeline = () => {
    if (running) return
    setRunning(true)
    setActiveStep(-1)
    setCompleted([])
    setParticles([])

    steps.forEach((_, i) => {
      setTimeout(() => {
        setActiveStep(i)
        // spawn particles along the connector
        if (i > 0) {
          const id = Date.now() + i
          setParticles(prev => [...prev, { id, from: i - 1, to: i }])
        }
      }, i * 1200)
      setTimeout(() => {
        setCompleted(prev => [...prev, i])
      }, i * 1200 + 800)
    })

    setTimeout(() => {
      setRunning(false)
    }, steps.length * 1200 + 400)
  }

  const allDone = completed.length === steps.length

  return (
    <div>
      {/* Pipeline Track */}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '40px 10px', overflow: 'hidden',
      }}>
        {/* Connector line */}
        <div style={{
          position: 'absolute', top: '50%', left: 60, right: 60,
          height: 3, background: 'var(--border)', transform: 'translateY(-50%)',
          zIndex: 0,
        }} />
        {/* Animated fill line */}
        <motion.div
          animate={{ width: activeStep >= 0 ? `${(activeStep / (steps.length - 1)) * 100}%` : '0%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '50%', left: 60,
            height: 4, borderRadius: 2,
            background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #f59e0b, #06b6d4, #10b981, #ef4444)',
            transform: 'translateY(-50%)', zIndex: 1,
          }}
        />

        {steps.map((step, i) => {
          const isActive = i === activeStep
          const isDone = completed.includes(i)
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{
                scale: isActive ? 1.2 : isDone ? 1.05 : 0.9,
                opacity: isDone || isActive ? 1 : 0.45,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                position: 'relative', zIndex: 3,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                minWidth: 80,
              }}
            >
              {/* Glow ring */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    position: 'absolute', top: -8, width: 80, height: 80,
                    borderRadius: '50%', background: step.glow,
                    filter: 'blur(12px)', zIndex: -1,
                  }}
                />
              )}

              {/* Node */}
              <motion.div
                animate={{
                  boxShadow: isActive
                    ? `0 0 30px ${step.glow}, 0 0 60px ${step.glow}`
                    : isDone ? `0 0 15px ${step.color}30` : 'none',
                  background: isDone || isActive
                    ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)`
                    : 'var(--bg-secondary)',
                  borderColor: isDone || isActive ? step.color : 'var(--border)',
                }}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, border: '3px solid',
                  transition: 'background 0.3s, border-color 0.3s',
                }}
              >
                {isDone ? (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    style={{ fontSize: 26, filter: 'brightness(2)' }}
                  >
                    {step.icon}
                  </motion.span>
                ) : (
                  <span style={{ opacity: isDone || isActive ? 1 : 0.4 }}>{step.icon}</span>
                )}
              </motion.div>

              {/* Label */}
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: isDone || isActive ? step.color : 'var(--text-muted)',
                textAlign: 'center', fontFamily: 'var(--font-heading)',
              }}>
                {step.label}
              </span>

              {/* Detail bubble */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    style={{
                      position: 'absolute', bottom: -44,
                      background: step.color, color: 'white',
                      padding: '6px 14px', borderRadius: 10, fontSize: 11,
                      fontFamily: 'monospace', whiteSpace: 'nowrap',
                      boxShadow: `0 4px 20px ${step.glow}`,
                    }}
                  >
                    {step.detail}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Launch button / Success */}
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <AnimatePresence mode="wait">
          {allDone ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '24px 32px', borderRadius: 20,
                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                border: '2px solid #6ee7b7', display: 'inline-block',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800,
                color: '#065f46', marginBottom: 6,
              }}>
                Deployed to Production!
              </div>
              <div style={{ fontSize: 14, color: '#047857' }}>
                Zero downtime. Fully automated. This is CI/CD.
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={runPipeline}
                style={{
                  marginTop: 16, padding: '10px 24px', borderRadius: 12,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)',
                }}
              >
                Run Again
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="launch"
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
              onClick={runPipeline}
              disabled={running}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: '18px 48px', borderRadius: 16,
                background: running
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white', border: 'none', fontWeight: 800, fontSize: 18,
                cursor: running ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-heading)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                opacity: running ? 0.7 : 1,
              }}
            >
              {running ? 'Pipeline Running...' : 'Launch CI/CD Pipeline'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---- 2. Registry Explorer ---- */
function RegistryExplorer() {
  const [action, setAction] = useState(null) // 'push' | 'pull'
  const [phase, setPhase] = useState(0)
  const [layerProgress, setLayerProgress] = useState([])

  const layers = [
    { name: 'base OS', size: '72 MB', color: '#6366f1' },
    { name: 'runtime', size: '45 MB', color: '#8b5cf6' },
    { name: 'dependencies', size: '28 MB', color: '#06b6d4' },
    { name: 'app code', size: '3 MB', color: '#10b981' },
  ]

  const startAction = (type) => {
    if (action) return
    setAction(type)
    setPhase(0)
    setLayerProgress([])

    layers.forEach((_, i) => {
      setTimeout(() => {
        setLayerProgress(prev => [...prev, i])
        setPhase(i + 1)
      }, (i + 1) * 700)
    })

    setTimeout(() => {
      setPhase(99) // done
      setTimeout(() => { setAction(null); setPhase(0); setLayerProgress([]) }, 3000)
    }, (layers.length + 1) * 700)
  }

  const isPush = action === 'push'
  const isPull = action === 'pull'
  const directionLabel = isPush ? 'Pushing' : isPull ? 'Pulling' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Visual: Local ↔ Registry ↔ Remote */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Local Machine */}
        <motion.div
          animate={{
            boxShadow: isPush ? '0 0 25px #8b5cf640' : 'none',
            borderColor: isPush ? '#8b5cf6' : 'var(--border)',
          }}
          style={{
            flex: 1, padding: 24, borderRadius: 18,
            background: 'var(--bg-card)', border: '2px solid var(--border)',
            textAlign: 'center', minHeight: 160,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>💻</div>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
            color: 'var(--text-primary)', marginBottom: 6,
          }}>
            Your Machine
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)',
            background: 'var(--bg-secondary)', borderRadius: 8, padding: '6px 10px',
          }}>
            myapp:v2.1
          </div>
        </motion.div>

        {/* Arrow / Layer animation area */}
        <div style={{ flex: 1.5, position: 'relative', minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {!action && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>
              Click push or pull below
            </div>
          )}

          {action && (
            <div style={{ width: '100%' }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: isPush ? '#8b5cf6' : '#06b6d4',
                textAlign: 'center', marginBottom: 12, fontFamily: 'var(--font-heading)',
              }}>
                {directionLabel} Layers {isPush ? '→' : '←'}
              </div>
              {layers.map((layer, i) => {
                const done = layerProgress.includes(i)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3, x: isPush ? -40 : 40 }}
                    animate={{
                      opacity: done ? 1 : 0.3,
                      x: done ? 0 : (isPush ? -40 : 40),
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 6, justifyContent: 'center',
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: 4,
                      background: done ? layer.color : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                    <span style={{
                      fontSize: 12, fontFamily: 'monospace',
                      color: done ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>
                      {layer.name} ({layer.size})
                    </span>
                    {done && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ fontSize: 13, color: '#10b981' }}
                      >
                        done
                      </motion.span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {phase === 99 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: 12, padding: '8px 16px', borderRadius: 10,
                background: '#10b98120', color: '#10b981',
                fontWeight: 700, fontSize: 13, textAlign: 'center',
              }}
            >
              {isPush ? 'Image pushed successfully!' : 'Image pulled successfully!'}
            </motion.div>
          )}
        </div>

        {/* Registry */}
        <motion.div
          animate={{
            boxShadow: isPull ? '0 0 25px #06b6d440' : action ? '0 0 25px #10b98140' : 'none',
            borderColor: action ? '#10b981' : 'var(--border)',
          }}
          style={{
            flex: 1, padding: 24, borderRadius: 18,
            background: 'var(--bg-card)', border: '2px solid var(--border)',
            textAlign: 'center', minHeight: 160,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>☁️</div>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
            color: 'var(--text-primary)', marginBottom: 6,
          }}>
            Docker Hub
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)',
            background: 'var(--bg-secondary)', borderRadius: 8, padding: '6px 10px',
          }}>
            hub.docker.com/r/you/myapp
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => startAction('push')}
          disabled={!!action}
          style={{
            padding: '14px 32px', borderRadius: 14,
            background: action ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: action ? 'var(--text-muted)' : 'white',
            border: 'none', fontWeight: 700, fontSize: 15,
            cursor: action ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          docker push
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => startAction('pull')}
          disabled={!!action}
          style={{
            padding: '14px 32px', borderRadius: 14,
            background: action ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
            color: action ? 'var(--text-muted)' : 'white',
            border: 'none', fontWeight: 700, fontSize: 15,
            cursor: action ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          docker pull
        </motion.button>
      </div>
    </div>
  )
}

/* ---- 3. Production Checklist ---- */
function ProductionChecklist() {
  const [checked, setChecked] = useState([])
  const [flipped, setFlipped] = useState(null)

  const items = [
    {
      icon: '🏷️', title: 'Specific Image Tags',
      short: 'Never use :latest in production',
      detail: 'Pin exact versions like myapp:v2.1.3. :latest is unpredictable and makes rollbacks impossible. Always tag with git SHA or semver.',
      color: '#8b5cf6',
    },
    {
      icon: '🏗️', title: 'Multi-Stage Builds',
      short: 'Smaller, cleaner production images',
      detail: 'Build in one stage, copy only the artifact to a slim final image. Reduces size by 10x and removes build tools from production.',
      color: '#3b82f6',
    },
    {
      icon: '🔒', title: 'Non-Root User',
      short: 'Never run containers as root',
      detail: 'Add USER appuser in your Dockerfile. Root in a container = root on the host if there\'s an escape. Always use a least-privilege user.',
      color: '#ef4444',
    },
    {
      icon: '💓', title: 'Health Checks',
      short: 'Let Docker monitor your app',
      detail: 'HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1. Docker and orchestrators use this to restart unhealthy containers automatically.',
      color: '#10b981',
    },
    {
      icon: '📏', title: 'Resource Limits',
      short: 'Prevent runaway containers',
      detail: 'Set --memory=512m and --cpus=1.0. Without limits, one container can starve the entire host. Always set boundaries.',
      color: '#f59e0b',
    },
    {
      icon: '🚫', title: '.dockerignore',
      short: 'Keep build context lean',
      detail: 'Exclude node_modules, .git, .env, and test files. A bloated build context slows builds and may leak secrets into images.',
      color: '#06b6d4',
    },
    {
      icon: '🛡️', title: 'Security Scanning',
      short: 'Scan images for vulnerabilities',
      detail: 'Use docker scout, Trivy, or Snyk in your CI pipeline. Catch CVEs before they reach production. Automate it — never skip it.',
      color: '#ec4899',
    },
  ]

  const readiness = Math.round((checked.length / items.length) * 100)

  const toggleCheck = (i) => {
    setChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  return (
    <div>
      {/* Readiness Meter */}
      <div style={{
        marginBottom: 28, padding: '20px 24px', borderRadius: 16,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
            color: 'var(--text-primary)',
          }}>
            Production Readiness
          </span>
          <motion.span
            key={readiness}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24,
              color: readiness === 100 ? '#10b981' : readiness > 50 ? '#f59e0b' : '#ef4444',
            }}
          >
            {readiness}%
          </motion.span>
        </div>
        <div style={{
          width: '100%', height: 12, borderRadius: 6,
          background: 'var(--bg-secondary)', overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${readiness}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 6,
              background: readiness === 100
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : readiness > 50
                  ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                  : 'linear-gradient(90deg, #ef4444, #dc2626)',
            }}
          />
        </div>
      </div>

      {/* Checklist Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {items.map((item, i) => {
          const isChecked = checked.includes(i)
          const isFlipped = flipped === i
          return (
            <motion.div
              key={i}
              layout
              whileHover={{ y: -3 }}
              style={{
                borderRadius: 16, overflow: 'hidden',
                border: `2px solid ${isChecked ? item.color : 'var(--border)'}`,
                background: isChecked ? `${item.color}08` : 'var(--bg-card)',
                transition: 'border-color 0.3s, background 0.3s',
                cursor: 'pointer', minHeight: 130, position: 'relative',
              }}
            >
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setFlipped(i)}
                    style={{ padding: 20, height: '100%' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 28 }}>{item.icon}</span>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15,
                        color: 'var(--text-primary)', flex: 1,
                      }}>
                        {item.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {item.short}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                      Tap to learn more
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ padding: 20, height: '100%' }}
                  >
                    <div
                      onClick={() => setFlipped(null)}
                      style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}
                    >
                      {item.detail}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); toggleCheck(i); setFlipped(null) }}
                      style={{
                        padding: '8px 20px', borderRadius: 10,
                        background: isChecked ? 'var(--bg-secondary)' : `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                        color: isChecked ? 'var(--text-muted)' : 'white',
                        border: 'none', fontWeight: 700, fontSize: 13,
                        cursor: 'pointer', fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {isChecked ? 'Uncheck' : 'Mark as Done'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Checkmark badge */}
              <AnimatePresence>
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 28, height: 28, borderRadius: '50%',
                      background: item.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 15, fontWeight: 700,
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* 100% celebration */}
      <AnimatePresence>
        {readiness === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 24, padding: '24px 28px', borderRadius: 18,
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '2px solid #6ee7b7', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: '#065f46',
            }}>
              Production Ready!
            </div>
            <div style={{ fontSize: 14, color: '#047857', marginTop: 6 }}>
              Your Docker deployment follows all best practices. Ship it with confidence.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- 4. Scale Animation ---- */
function ScaleAnimation() {
  const [scale, setScale] = useState(1)
  const [requests, setRequests] = useState([])
  const [requestId, setRequestId] = useState(0)

  const maxScale = 10
  const containerCount = Math.min(scale, maxScale)
  const containerArr = Array.from({ length: containerCount }, (_, i) => i)

  const scaleUp = () => {
    if (scale >= maxScale) return
    const next = scale === 1 ? 3 : scale === 3 ? 6 : 10
    setScale(Math.min(next, maxScale))
  }

  const scaleDown = () => {
    if (scale <= 1) return
    const next = scale === 10 ? 6 : scale === 6 ? 3 : 1
    setScale(next)
  }

  // Simulate requests
  useEffect(() => {
    if (scale < 3) return
    const interval = setInterval(() => {
      setRequestId(prev => prev + 1)
    }, 800)
    return () => clearInterval(interval)
  }, [scale])

  useEffect(() => {
    if (requestId === 0) return
    const target = requestId % containerCount
    const id = requestId
    setRequests(prev => [...prev.slice(-8), { id, target }])
  }, [requestId, containerCount])

  return (
    <div>
      {/* Load Balancer */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <motion.div
          animate={{
            boxShadow: scale > 1 ? '0 0 30px #6366f140' : 'none',
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '16px 28px', borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f115, #8b5cf615)',
            border: '2px solid #6366f130',
          }}
        >
          <span style={{ fontSize: 28 }}>⚖️</span>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
              color: '#6366f1',
            }}>
              Load Balancer
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Distributes incoming requests
            </div>
          </div>
        </motion.div>
      </div>

      {/* Connector lines visual */}
      {scale > 1 && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 24 }}
            style={{
              width: 2, background: '#6366f140',
              margin: '0 auto',
            }}
          />
        </div>
      )}

      {/* Containers Grid */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12,
        justifyContent: 'center', marginBottom: 28,
        minHeight: 120,
      }}>
        <AnimatePresence>
          {containerArr.map((i) => {
            const hasRequest = requests.some(r => r.target === i)
            return (
              <motion.div
                key={`container-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: i * 0.05 }}
                style={{
                  width: scale <= 3 ? 100 : scale <= 6 ? 80 : 64,
                  padding: scale <= 3 ? 16 : 10,
                  borderRadius: 14,
                  background: hasRequest
                    ? 'linear-gradient(135deg, #06b6d420, #10b98120)'
                    : 'var(--bg-card)',
                  border: `2px solid ${hasRequest ? '#10b981' : 'var(--border)'}`,
                  textAlign: 'center',
                  transition: 'background 0.3s, border-color 0.3s',
                }}
              >
                <div style={{ fontSize: scale <= 3 ? 28 : 20 }}>🐳</div>
                <div style={{
                  fontFamily: 'monospace', fontSize: scale <= 3 ? 11 : 9,
                  color: 'var(--text-muted)', marginTop: 4,
                }}>
                  #{i + 1}
                </div>
                {hasRequest && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                      fontSize: 8, color: '#10b981', fontWeight: 700, marginTop: 2,
                    }}
                  >
                    ACTIVE
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Scale Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={scaleDown}
          disabled={scale <= 1}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: scale <= 1 ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: scale <= 1 ? 'var(--text-muted)' : 'white',
            border: 'none', fontWeight: 700, fontSize: 14,
            cursor: scale <= 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Scale Down
        </motion.button>

        <div style={{
          padding: '10px 20px', borderRadius: 12,
          background: 'var(--bg-secondary)', fontFamily: 'var(--font-heading)',
          fontWeight: 800, fontSize: 20, color: 'var(--accent)',
          minWidth: 60, textAlign: 'center',
        }}>
          {scale}x
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={scaleUp}
          disabled={scale >= maxScale}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: scale >= maxScale ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #10b981, #059669)',
            color: scale >= maxScale ? 'var(--text-muted)' : 'white',
            border: 'none', fontWeight: 700, fontSize: 14,
            cursor: scale >= maxScale ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Scale Up
        </motion.button>
      </div>

      {/* Kubernetes teaser */}
      <AnimatePresence>
        {scale >= 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 24, padding: '20px 24px', borderRadius: 16,
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              border: '2px solid #6366f140',
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{ fontSize: 40 }}>☸️</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17,
                color: '#a5b4fc', marginBottom: 4,
              }}>
                This is where Kubernetes enters
              </div>
              <div style={{ fontSize: 13, color: '#c7d2fe', lineHeight: 1.6 }}>
                At this scale, you need an orchestrator. Kubernetes manages thousands of containers across multiple machines — auto-scaling, self-healing, rolling updates. It is the next level.
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
export default function Topic8_RealWorldDeploy() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Neuron mood="excited" typed message="This is it. The grand finale. Everything you have learned about Docker — images, containers, Dockerfiles, Compose — it all comes together when you deploy to the real world. Let me show you how the pros do it." />

      <SectionBlock title="The CI/CD Pipeline" icon="🔄">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          In production, nobody runs <code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6 }}>docker build</code> by hand. Every push triggers an automated pipeline.
        </p>
        <InteractiveDemo title="Watch a CI/CD Pipeline in Action">
          <CICDPipelineAnimation />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="explaining">
        GitHub Actions, GitLab CI, Jenkins, CircleCI — they all follow this same pattern. Code pushed, tests run, image built, registry updated, production deployed. Fully automated. Zero human intervention.
      </NeuronTip>

      <SectionBlock title="Container Registries" icon="☁️">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Docker Hub is like GitHub for container images. Push your built images up, pull them down anywhere in the world.
        </p>
        <InteractiveDemo title="Push & Pull Images to a Registry">
          <RegistryExplorer />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Production Best Practices" icon="🛡️">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Running Docker in production is different from development. Check off each best practice to reach 100% production readiness.
        </p>
        <InteractiveDemo title="Production Readiness Checklist">
          <ProductionChecklist />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="warning">
        The number one mistake beginners make: using :latest in production. Always pin your image tags. Your future self will thank you when you need to rollback at 2 AM.
      </NeuronTip>

      <SectionBlock title="Scaling with Containers" icon="📈">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          The real power of containers: horizontal scaling. Need more capacity? Spin up more containers. A load balancer distributes traffic.
        </p>
        <InteractiveDemo title="Scale Your Application">
          <ScaleAnimation />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="happy" typed message="You have completed the Docker journey. From 'what even is a container?' to CI/CD pipelines, registries, production best practices, and scaling. You now understand how modern software gets from a developer's laptop to millions of users. That is real DevOps." />
    </div>
  )
}
