import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 7 — Anatomy of a Production Request
   Tracing a real RAG app request end-to-end:
   auth → embedding → vector search → LLM → response
================================================================ */

const STAGES = [
  { id: 'dns',       label: 'DNS + TCP + TLS',           ms: 20,   type: 'io',  color: '#f59e0b', detail: 'Initial connection setup. DNS resolves hostname, TCP handshake establishes connection, TLS negotiates encryption. Cached after first request so subsequent requests skip this.' },
  { id: 'lb',        label: 'Load Balancer routing',      ms: 2,    type: 'io',  color: '#f59e0b', detail: 'The load balancer (e.g. NGINX, ALB) picks a healthy backend server using round-robin or least-connections. Lightning fast.' },
  { id: 'parse',     label: 'Request parsing & validation',ms: 3,   type: 'cpu', color: '#10b981', detail: 'FastAPI parses JSON body, validates against Pydantic model, extracts query string. Pure CPU work -- fast.' },
  { id: 'auth',      label: 'JWT Authentication',          ms: 15,  type: 'cpu', color: '#10b981', detail: 'Decode JWT token, verify signature (CPU crypto), optionally check user in DB. Mostly CPU but may have a small DB call.' },
  { id: 'embed',     label: 'Embedding generation',        ms: 200, type: 'io',  color: '#f59e0b', detail: 'API call to OpenAI/Cohere to convert the user question into a 1536-dim vector. Network round-trip to external service.' },
  { id: 'vector',    label: 'Vector search (Qdrant)',       ms: 50,  type: 'io',  color: '#f59e0b', detail: 'Send embedding to Qdrant/Pinecone, get top-5 most similar documents. Approximate nearest neighbor search over millions of vectors.' },
  { id: 'context',   label: 'Context assembly',            ms: 5,   type: 'cpu', color: '#10b981', detail: 'Combine retrieved documents with system prompt and user question into the final LLM prompt. String concatenation -- pure CPU.' },
  { id: 'llm',       label: 'LLM call (GPT-4)',            ms: 2000,type: 'io',  color: '#8b5cf6', detail: 'The heavyweight. Send assembled prompt to GPT-4 API and wait for the full response. Inference on OpenAI servers takes time.' },
  { id: 'format',    label: 'Response formatting',         ms: 3,   type: 'cpu', color: '#10b981', detail: 'Parse LLM output, format into JSON response, add metadata (latency, sources). Pure CPU.' },
  { id: 'log',       label: 'Logging & metrics',           ms: 2,   type: 'io',  color: '#f59e0b', detail: 'Fire-and-forget async call to log the request to your observability stack. Does NOT block the response.' },
]

const ARCHITECTURE_STEPS = [
  { label: 'Client', icon: '👤', color: '#3b82f6' },
  { label: 'Load Balancer', icon: '⚖️', color: '#6366f1' },
  { label: 'FastAPI Server', icon: '⚡', color: '#10b981' },
  { label: 'Authentication', icon: '🔐', color: '#f59e0b' },
  { label: 'Embedding Service', icon: '🔢', color: '#ec4899' },
  { label: 'Vector DB', icon: '🗄️', color: '#8b5cf6' },
  { label: 'LLM (GPT-4)', icon: '🧠', color: '#ef4444' },
  { label: 'Response', icon: '✅', color: '#10b981' },
]

/* ---- Section 1: Architecture Diagram ---- */
function ArchitectureDiagram() {
  const [activeStep, setActiveStep] = useState(-1)
  const [animating, setAnimating] = useState(false)

  const runAnimation = () => {
    if (animating) return
    setAnimating(true)
    setActiveStep(0)
    let current = 0
    const interval = setInterval(() => {
      current++
      if (current >= ARCHITECTURE_STEPS.length) {
        clearInterval(interval)
        setAnimating(false)
        return
      }
      setActiveStep(current)
    }, 600)
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        Click "Trace Request" to watch a request flow through the architecture.
      </p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto',
        padding: '20px 8px', marginBottom: 20,
      }}>
        {ARCHITECTURE_STEPS.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <motion.div
              animate={{
                scale: activeStep === i ? 1.15 : 1,
                boxShadow: activeStep === i ? `0 0 24px ${step.color}66` : '0 2px 8px rgba(0,0,0,0.1)',
              }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 16px', borderRadius: 14,
                background: activeStep >= i ? `${step.color}18` : 'var(--bg-secondary)',
                border: `2px solid ${activeStep >= i ? step.color : 'var(--border)'}`,
                minWidth: 90,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 24 }}>{step.icon}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: activeStep >= i ? step.color : 'var(--text-muted)',
                textAlign: 'center', lineHeight: 1.3,
              }}>
                {step.label}
              </span>
              {activeStep === i && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 14, height: 14, borderRadius: '50%',
                    background: step.color,
                    boxShadow: `0 0 10px ${step.color}`,
                  }}
                />
              )}
            </motion.div>
            {i < ARCHITECTURE_STEPS.length - 1 && (
              <motion.div
                animate={{
                  background: activeStep > i ? `linear-gradient(90deg, ${step.color}, ${ARCHITECTURE_STEPS[i + 1].color})` : 'var(--border)',
                }}
                style={{
                  width: 32, height: 3, borderRadius: 2, flexShrink: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>
      <motion.button
        onClick={runAnimation}
        disabled={animating}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{
          padding: '10px 28px', borderRadius: 12, fontWeight: 700, fontSize: 14,
          background: animating ? 'var(--bg-secondary)' : 'var(--gradient-primary)',
          color: animating ? 'var(--text-muted)' : '#fff',
          border: 'none', cursor: animating ? 'default' : 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {animating ? 'Tracing...' : 'Trace Request'}
      </motion.button>
    </div>
  )
}

/* ---- Section 2: Request Timeline Builder (HERO) ---- */
function RequestTimeline() {
  const [selectedStage, setSelectedStage] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const totalMs = STAGES.reduce((sum, s) => sum + s.ms, 0)
  const cpuMs = STAGES.filter(s => s.type === 'cpu').reduce((sum, s) => sum + s.ms, 0)
  const ioMs = totalMs - cpuMs
  const cpuPct = ((cpuMs / totalMs) * 100).toFixed(1)
  const ioPct = ((ioMs / totalMs) * 100).toFixed(1)
  const maxMs = Math.max(...STAGES.map(s => s.ms))

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        Click each stage to see details. Watch how the LLM call dominates everything.
      </p>

      {/* Waterfall timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {STAGES.map((stage, i) => {
          const barPct = Math.max(3, (stage.ms / maxMs) * 100)
          const isSelected = selectedStage === i
          const typeColor = stage.type === 'cpu' ? '#10b981' : stage.id === 'llm' ? '#8b5cf6' : '#f59e0b'

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: revealed ? i * 0.06 : 0 }}
            >
              <motion.button
                onClick={() => setSelectedStage(isSelected ? null : i)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  background: isSelected ? `${typeColor}10` : 'var(--bg-secondary)',
                  border: `1.5px solid ${isSelected ? typeColor : 'var(--border)'}`,
                  borderRadius: 12, padding: '12px 16px', position: 'relative',
                  overflow: 'hidden', transition: 'border-color 0.2s',
                }}
              >
                {/* Animated bar background */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: revealed ? `${barPct}%` : 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.06 }}
                  style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    background: `${typeColor}15`, borderRadius: 12,
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: typeColor, flexShrink: 0,
                        boxShadow: `0 0 6px ${typeColor}66`,
                      }} />
                      <span style={{
                        fontWeight: 600, color: 'var(--text-primary)', fontSize: 14,
                      }}>
                        {i + 1}. {stage.label}
                      </span>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 10,
                        background: stage.type === 'cpu' ? '#10b98120' : '#f59e0b20',
                        color: stage.type === 'cpu' ? '#10b981' : '#f59e0b',
                        fontWeight: 700, textTransform: 'uppercase',
                      }}>
                        {stage.type}
                      </span>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: 14, color: typeColor,
                      fontFamily: 'monospace',
                    }}>
                      {stage.ms.toLocaleString()}ms
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* Detail panel */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      margin: '6px 0 0 20px', padding: '12px 16px', borderRadius: 10,
                      background: `${typeColor}08`, border: `1px solid ${typeColor}30`,
                      fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
                    }}>
                      {stage.detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Reveal button */}
      {!revealed && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <motion.button
            onClick={() => setRevealed(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15,
              background: 'var(--gradient-primary)', color: '#fff',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            Animate the Timeline
          </motion.button>
        </div>
      )}

      {/* Total and Breakdown */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Total bar */}
          <div style={{
            padding: '16px 20px', borderRadius: 14, marginBottom: 20,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total Request Time: </span>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              ~{totalMs.toLocaleString()}ms
            </span>
          </div>

          {/* CPU vs I/O breakdown */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
          }}>
            <div style={{
              padding: '16px 20px', borderRadius: 14, textAlign: 'center',
              background: '#10b98110', border: '1.5px solid #10b98130',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 4, letterSpacing: 1 }}>
                CPU TIME
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
                {cpuMs}ms
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {cpuPct}% of total
              </div>
            </div>
            <div style={{
              padding: '16px 20px', borderRadius: 14, textAlign: 'center',
              background: '#f59e0b10', border: '1.5px solid #f59e0b30',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 4, letterSpacing: 1 }}>
                I/O WAIT TIME
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>
                {ioMs.toLocaleString()}ms
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {ioPct}% of total
              </div>
            </div>
          </div>

          {/* Visual stacked bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              CPU vs I/O (proportional)
            </div>
            <div style={{
              height: 32, borderRadius: 16, overflow: 'hidden',
              display: 'flex', border: '1px solid var(--border)',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cpuPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  background: 'linear-gradient(90deg, #10b981, #22c55e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#fff',
                  minWidth: cpuMs > 0 ? 40 : 0,
                }}
              >
                CPU
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ioPct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                style={{
                  background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}
              >
                I/O Wait ({ioPct}%)
              </motion.div>
            </div>
          </div>

          {/* Insight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{
              padding: '16px 20px', borderRadius: 14,
              background: 'linear-gradient(135deg, #8b5cf620, #6366f120)',
              border: '1.5px solid #8b5cf640', textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Your server is a WAITING machine, not a computing machine.
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
              CPU does real work for only {cpuMs}ms out of {totalMs.toLocaleString()}ms. The rest is pure waiting.
            </span>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

/* ---- Section 3: Time Budget Allocator ---- */
function TimeBudgetAllocator() {
  const [auth, setAuth] = useState(15)
  const [embed, setEmbed] = useState(200)
  const [vectorSearch, setVectorSearch] = useState(50)
  const [llmCall, setLlmCall] = useState(2000)

  const fixedOverhead = 20 + 2 + 3 + 5 + 3 + 2 // dns + lb + parse + context + format + log
  const total = fixedOverhead + auth + embed + vectorSearch + llmCall

  const sliders = [
    { label: 'Authentication', value: auth, set: setAuth, min: 5, max: 500, color: '#10b981' },
    { label: 'Embedding API', value: embed, set: setEmbed, min: 50, max: 500, color: '#ec4899' },
    { label: 'Vector Search', value: vectorSearch, set: setVectorSearch, min: 10, max: 200, color: '#3b82f6' },
    { label: 'LLM Call (GPT-4)', value: llmCall, set: setLlmCall, min: 500, max: 5000, color: '#8b5cf6' },
  ]

  const stages = [
    { label: 'Fixed overhead', ms: fixedOverhead, color: '#6b7280' },
    { label: 'Authentication', ms: auth, color: '#10b981' },
    { label: 'Embedding', ms: embed, color: '#ec4899' },
    { label: 'Vector Search', ms: vectorSearch, color: '#3b82f6' },
    { label: 'LLM Call', ms: llmCall, color: '#8b5cf6' },
  ]

  const bottleneck = stages.reduce((max, s) => s.ms > max.ms ? s : max, stages[0])

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        Drag the sliders to see how each stage affects total latency. Watch which stage dominates.
      </p>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {sliders.map(s => {
          const pct = ((s.value / total) * 100).toFixed(1)
          return (
            <div key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', background: s.color,
                    boxShadow: bottleneck.label === s.label ? `0 0 10px ${s.color}` : 'none',
                  }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                    {s.label}
                  </span>
                  {bottleneck.label === s.label && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                      background: '#ef444420', color: '#ef4444', textTransform: 'uppercase',
                    }}>
                      Bottleneck
                    </span>
                  )}
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: s.color, fontFamily: 'monospace' }}>
                  {s.value.toLocaleString()}ms ({pct}%)
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={s.value}
                onChange={e => s.set(Number(e.target.value))}
                style={{
                  width: '100%', height: 6, borderRadius: 3,
                  accentColor: s.color, cursor: 'pointer',
                }}
              />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11, color: 'var(--text-muted)',
              }}>
                <span>{s.min}ms</span>
                <span>{s.max.toLocaleString()}ms</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stacked bar visualization */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
          Time Distribution
        </div>
        <div style={{
          height: 36, borderRadius: 18, overflow: 'hidden',
          display: 'flex', border: '1px solid var(--border)',
        }}>
          {stages.map(s => {
            const w = (s.ms / total) * 100
            return (
              <motion.div
                key={s.label}
                animate={{ width: `${w}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  background: s.color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden',
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                }}
                title={`${s.label}: ${s.ms}ms`}
              >
                {w > 8 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Total */}
      <div style={{
        padding: '14px 20px', borderRadius: 14, textAlign: 'center',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total: </span>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {total.toLocaleString()}ms
        </span>
      </div>

      {/* Optimization insight */}
      <div style={{
        padding: '14px 18px', borderRadius: 12,
        background: '#8b5cf610', border: '1px solid #8b5cf630',
      }}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: '#8b5cf6' }}>Key insight:</strong> At defaults, the LLM call is {((2000 / 2300) * 100).toFixed(0)}% of total time.
          Optimizing auth from 15ms to 5ms saves 10ms = {((10 / 2300) * 100).toFixed(1)}% improvement.
          Optimizing LLM from 2000ms to 1500ms saves 500ms = {((500 / 2300) * 100).toFixed(0)}% improvement.
          <strong> Optimize the bottleneck, not the fast parts.</strong>
        </p>
      </div>
    </div>
  )
}

/* ---- Section 4: Capacity Calculator ---- */
function CapacityCalculator() {
  const [requestMs] = useState(2300)
  const [cpuMs] = useState(13)
  const [vCPUs, setVCPUs] = useState(4)
  const [workers, setWorkers] = useState(5)
  const [concurrentUsers, setConcurrentUsers] = useState(10000)

  const concurrentPerWorker = Math.floor(requestMs / cpuMs)
  const realisticPerWorker = Math.min(100, Math.floor(concurrentPerWorker * 0.56))
  const perServer = workers * realisticPerWorker
  const serversNeeded = Math.ceil(concurrentUsers / perServer)

  const llmCallsPerSec = Math.ceil(concurrentUsers / (requestMs / 1000))
  const memoryPerRequestMB = 2
  const totalMemoryGB = ((concurrentUsers * memoryPerRequestMB) / 1024).toFixed(1)

  const constraints = [
    {
      label: 'Compute (servers)',
      value: `${serversNeeded} servers`,
      limit: `${perServer} concurrent/server`,
      color: '#3b82f6',
      isCritical: false,
    },
    {
      label: 'OpenAI Rate Limit',
      value: `${llmCallsPerSec.toLocaleString()} calls/sec needed`,
      limit: 'Most plans: ~500-3,500/min',
      color: '#ef4444',
      isCritical: llmCallsPerSec > 60,
    },
    {
      label: 'DB Connection Pool',
      value: `${concurrentUsers.toLocaleString()} concurrent queries`,
      limit: 'Typical pool: 20-100 per server',
      color: '#f59e0b',
      isCritical: concurrentUsers > 1000,
    },
    {
      label: 'Memory',
      value: `${totalMemoryGB} GB total`,
      limit: `~${memoryPerRequestMB}MB per request context`,
      color: '#8b5cf6',
      isCritical: parseFloat(totalMemoryGB) > 50,
    },
  ]

  const weakestLink = constraints.reduce((worst, c) =>
    c.isCritical && !worst.isCritical ? c : worst, constraints[0]
  )

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        Adjust the parameters to see how many servers you need -- and what other constraints you will hit.
      </p>

      {/* Inputs */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24,
      }}>
        {[
          { label: 'vCPUs', value: vCPUs, set: setVCPUs, min: 1, max: 16 },
          { label: 'Workers', value: workers, set: setWorkers, min: 1, max: 20 },
          { label: 'Concurrent Users', value: concurrentUsers, set: setConcurrentUsers, min: 100, max: 100000, step: 100 },
        ].map(inp => (
          <div key={inp.label} style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 0.5 }}>
              {inp.label.toUpperCase()}
            </div>
            <input
              type="range"
              min={inp.min}
              max={inp.max}
              step={inp.step || 1}
              value={inp.value}
              onChange={e => inp.set(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', fontFamily: 'monospace' }}>
              {inp.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Calculation steps */}
      <div style={{
        padding: '16px 20px', borderRadius: 14, marginBottom: 20,
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: 1 }}>
          CALCULATION
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.8 }}>
          <div>Theoretical concurrent/worker = {requestMs}/{cpuMs} = <strong style={{ color: '#10b981' }}>{concurrentPerWorker}</strong></div>
          <div>Realistic (with overhead) = <strong style={{ color: '#10b981' }}>{realisticPerWorker}</strong>/worker</div>
          <div>Per server = {workers} workers x {realisticPerWorker} = <strong style={{ color: '#3b82f6' }}>{perServer}</strong> concurrent</div>
          <div>Servers needed = {concurrentUsers.toLocaleString()}/{perServer} = <strong style={{ color: '#ef4444' }}>{serversNeeded}</strong> servers</div>
        </div>
      </div>

      {/* Constraint chain */}
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>
        CONSTRAINT CHAIN -- weakest link determines capacity:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {constraints.map((c, i) => (
          <motion.div
            key={c.label}
            animate={{
              borderColor: c.isCritical ? '#ef4444' : `${c.color}40`,
              background: c.isCritical ? '#ef444410' : `${c.color}08`,
            }}
            style={{
              padding: '12px 16px', borderRadius: 12,
              border: `1.5px solid ${c.color}40`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'relative',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: `${c.color}20`, fontSize: 12, fontWeight: 800, color: c.color,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  {c.label}
                </span>
                {c.isCritical && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                    background: '#ef444420', color: '#ef4444',
                  }}>
                    CRITICAL
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginLeft: 32 }}>
                Limit: {c.limit}
              </div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: c.color, fontFamily: 'monospace' }}>
              {c.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Chain link visual */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 20px', borderRadius: 14, marginBottom: 0,
        background: 'linear-gradient(135deg, #ef444415, #f59e0b15)',
        border: '1px solid var(--border)',
      }}>
        {constraints.map((c, i) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: c.isCritical ? '#ef4444' : `${c.color}30`,
              color: c.isCritical ? '#fff' : c.color,
              fontSize: 14, fontWeight: 800,
              boxShadow: c.isCritical ? '0 0 12px #ef444466' : 'none',
            }}>
              {i + 1}
            </div>
            {i < constraints.length - 1 && (
              <div style={{ width: 20, height: 3, background: 'var(--border)', borderRadius: 2 }} />
            )}
          </div>
        ))}
        <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          Chain is only as strong as its weakest link
        </span>
      </div>
    </div>
  )
}

/* ---- Section 5: Optimization Toggle ---- */
function OptimizationToggle() {
  const [caching, setCaching] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [parallel, setParallel] = useState(false)

  const baseMs = 2300
  let actualMs = baseMs
  let perceivedMs = baseMs

  // Caching: skip embedding step (save 200ms)
  if (caching) actualMs -= 200
  // Parallel: run embedding + auth in parallel instead of sequential (save 200ms from overlap)
  if (parallel) actualMs -= 200

  perceivedMs = actualMs
  // Streaming: perceived latency drops to time-to-first-token
  if (streaming) perceivedMs = Math.min(200, actualMs)

  const optimizations = [
    {
      id: 'caching',
      label: 'Embedding Cache',
      desc: 'Cache embedding results for common/repeated questions. Skip the 200ms embedding API call entirely.',
      enabled: caching,
      toggle: () => setCaching(v => !v),
      color: '#10b981',
      savingActual: 200,
      icon: '💾',
    },
    {
      id: 'streaming',
      label: 'LLM Streaming',
      desc: 'Stream tokens as they are generated. User sees first token in ~200ms instead of waiting 2s for full response.',
      enabled: streaming,
      toggle: () => setStreaming(v => !v),
      color: '#3b82f6',
      savingPerceived: true,
      icon: '🌊',
    },
    {
      id: 'parallel',
      label: 'Parallel Calls',
      desc: 'Run embedding generation + user profile fetch in parallel using asyncio.gather() instead of awaiting sequentially.',
      enabled: parallel,
      toggle: () => setParallel(v => !v),
      color: '#8b5cf6',
      savingActual: 200,
      icon: '⚡',
    },
  ]

  const stages = [
    { label: 'Network setup', ms: 22, color: '#6b7280', optimized: false },
    { label: 'Parse + Auth', ms: 18, color: '#10b981', optimized: false },
    { label: 'Embedding', ms: caching ? 2 : (parallel ? 0 : 200), color: '#ec4899', optimized: caching, note: caching ? 'CACHED' : (parallel ? 'PARALLEL' : '') },
    { label: 'Vector Search', ms: 50, color: '#3b82f6', optimized: false },
    { label: 'Context', ms: 5, color: '#10b981', optimized: false },
    { label: 'LLM Call', ms: 2000, color: '#8b5cf6', optimized: false, streaming: streaming },
    { label: 'Format + Log', ms: 5, color: '#6b7280', optimized: false },
  ]

  const visibleTotal = stages.reduce((sum, s) => sum + s.ms, 0)
  const maxStageMs = Math.max(...stages.map(s => s.ms))

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        Toggle each optimization ON/OFF and watch the timeline change in real time.
      </p>

      {/* Toggle buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {optimizations.map(opt => (
          <motion.button
            key={opt.id}
            onClick={opt.toggle}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
              background: opt.enabled ? `${opt.color}12` : 'var(--bg-secondary)',
              border: `2px solid ${opt.enabled ? opt.color : 'var(--border)'}`,
              textAlign: 'left', transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 22 }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 700, fontSize: 15,
                color: opt.enabled ? opt.color : 'var(--text-primary)',
              }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {opt.desc}
              </div>
            </div>
            <div style={{
              width: 48, height: 26, borderRadius: 13,
              background: opt.enabled ? opt.color : 'var(--bg-primary)',
              border: `2px solid ${opt.enabled ? opt.color : 'var(--border)'}`,
              position: 'relative', transition: 'all 0.2s', flexShrink: 0,
            }}>
              <motion.div
                animate={{ x: opt.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: opt.enabled ? '#fff' : 'var(--text-muted)',
                  position: 'absolute', top: 1,
                }}
              />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Optimized timeline */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: 1 }}>
          OPTIMIZED TIMELINE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {stages.map(s => {
            const barPct = maxStageMs > 0 ? Math.max(2, (s.ms / maxStageMs) * 100) : 2
            return (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 100, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                  textAlign: 'right', flexShrink: 0,
                }}>
                  {s.label}
                </span>
                <div style={{ flex: 1, position: 'relative', height: 22 }}>
                  <motion.div
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 6,
                      background: s.optimized
                        ? `repeating-linear-gradient(45deg, ${s.color}, ${s.color} 4px, ${s.color}66 4px, ${s.color}66 8px)`
                        : s.streaming
                          ? `repeating-linear-gradient(90deg, ${s.color}, ${s.color}88 30%, transparent 60%)`
                          : s.color,
                      display: 'flex', alignItems: 'center', paddingLeft: 6,
                      overflow: 'hidden',
                    }}
                  >
                    {s.note && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                        {s.note}
                      </span>
                    )}
                    {s.streaming && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                        STREAMING
                      </span>
                    )}
                  </motion.div>
                </div>
                <span style={{
                  width: 55, fontSize: 12, fontWeight: 700,
                  color: s.optimized ? '#10b981' : 'var(--text-muted)',
                  fontFamily: 'monospace', textAlign: 'right', flexShrink: 0,
                }}>
                  {s.ms}ms
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Before / After comparison */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
      }}>
        <div style={{
          padding: '14px 16px', borderRadius: 14, textAlign: 'center',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: 0.5 }}>
            ORIGINAL
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {baseMs.toLocaleString()}ms
          </div>
        </div>
        <div style={{
          padding: '14px 16px', borderRadius: 14, textAlign: 'center',
          background: '#3b82f610', border: '1.5px solid #3b82f630',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', marginBottom: 4, letterSpacing: 0.5 }}>
            ACTUAL
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6', fontFamily: 'monospace' }}>
            {actualMs.toLocaleString()}ms
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {actualMs < baseMs ? `-${baseMs - actualMs}ms saved` : 'no change'}
          </div>
        </div>
        <div style={{
          padding: '14px 16px', borderRadius: 14, textAlign: 'center',
          background: '#10b98110', border: '1.5px solid #10b98130',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 4, letterSpacing: 0.5 }}>
            PERCEIVED
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
            {perceivedMs.toLocaleString()}ms
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {perceivedMs < baseMs ? `${((1 - perceivedMs / baseMs) * 100).toFixed(0)}% faster feel` : 'no change'}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic7_RequestAnatomy() {
  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '0 16px',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* ---- Opening: Bridge from Module 2 ---- */}
      <Neuron
        mood="explaining"
        message="You now know HOW servers handle requests -- workers, threads, async. But to plan capacity, you need to know WHERE time goes in a real request. Let's trace one end-to-end through a production RAG application."
        typed
      />

      {/* ---- Section 1: The RAG App ---- */}
      <SectionBlock title="The RAG App -- Our Case Study" icon="🏗️" color="#3b82f6">
        <Neuron
          mood="happy"
          message="You built a RAG-powered customer support chatbot for an e-commerce company. Users ask questions about products, orders, and policies. Let's see the full architecture of what happens when someone types a question."
          typed
        />

        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
            This is a real production architecture. Every component exists in actual deployed systems.
            The question we need to answer: when a user sends a query, where does the time actually go?
          </p>
        </div>

        <InteractiveDemo title="Architecture Flow Diagram">
          <ArchitectureDiagram />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 2: Request Lifecycle (HERO) ---- */}
      <SectionBlock title="Request Lifecycle -- The Big Timeline" icon="⏱️" color="#8b5cf6">
        <Neuron
          mood="excited"
          message="This is the most important visualization. Every stage of a request, with real timings. Click each one to see what is happening under the hood. You will be shocked at how little CPU work there is!"
          typed
        />

        <InteractiveDemo title="Request Timeline Builder">
          <RequestTimeline />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 3: Where the Time Goes ---- */}
      <SectionBlock title="Where the Time Goes -- Deep Dive" icon="🔍" color="#ec4899">
        <Neuron
          mood="thinking"
          message="Now that you see the breakdown, let's play with the numbers. What happens if your auth is slow? What if your LLM is faster? The key lesson: always optimize the bottleneck, never the fast parts."
          typed
        />

        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: '#8b5cf610', border: '1px solid #8b5cf630',
        }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
            Drag the sliders below to see how each stage affects the total. Watch the bottleneck indicator --
            it shows you which stage dominates. Spoiler: it is almost always the LLM call.
          </p>
        </div>

        <InteractiveDemo title="Time Budget Allocator">
          <TimeBudgetAllocator />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 4: The 10K User Challenge ---- */}
      <SectionBlock title="The 10K User Challenge" icon="🚀" color="#ef4444">
        <Neuron
          mood="thinking"
          message="Now let's think bigger. What if 10,000 users send this request at the same time? How many servers do you need? It is not just about compute -- you will hit surprising constraints like API rate limits and connection pools."
          typed
        />

        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: '#ef444410', border: '1px solid #ef444430',
        }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
            The key insight: capacity planning is not just about servers. It is a chain of constraints --
            compute, API limits, DB connections, memory. The weakest link determines your real capacity.
          </p>
        </div>

        <InteractiveDemo title="Capacity Calculator">
          <CapacityCalculator />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 5: Optimizing the Pipeline ---- */}
      <SectionBlock title="Optimizing the Pipeline" icon="⚡" color="#10b981">
        <Neuron
          mood="excited"
          message="Three strategies can dramatically change the performance profile of your RAG app. Toggle them on and off to see the impact. Pay special attention to streaming -- it changes PERCEIVED latency without changing actual latency!"
          typed
        />

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20,
        }}>
          {[
            { label: 'Caching', desc: 'Skip redundant work', color: '#10b981', icon: '💾' },
            { label: 'Streaming', desc: 'Perceived speed', color: '#3b82f6', icon: '🌊' },
            { label: 'Parallelism', desc: 'Overlap I/O calls', color: '#8b5cf6', icon: '⚡' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '14px 16px', borderRadius: 12, textAlign: 'center',
              background: `${s.color}10`, border: `1px solid ${s.color}30`,
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <InteractiveDemo title="Optimization Toggle">
          <OptimizationToggle />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 6: Hindi Explainer ---- */}
      <SectionBlock title="Hindi Explainer" icon="🇮🇳" color="#ff9933">
        <HindiExplainer
          concept="प्रोडक्शन Request की बनावट"
          english="Anatomy of a Production Request"
          explanation="जब user एक question पूछता है RAG chatbot से, तो request कई stages से गुज़रती है: पहले authentication (कौन है user?), फिर embedding (question को numbers में बदलो), फिर vector search (related documents खोजो), और finally LLM call (जवाब बनाओ)। पूरी journey में 99% समय I/O waiting में जाता है — CPU सिर्फ 1% busy रहता है!"
          example="ये ऐसा है जैसे restaurant में order देना: waiter order ले (3 sec), kitchen को भेजे (1 sec), kitchen बनाए (20 min), waiter serve करे (1 sec)। total 20+ min लेकिन waiter (CPU) सिर्फ 5 sec busy था — बाकी समय wait कर रहा था!"
          terms={[
            { hindi: 'बॉटलनेक', english: 'Bottleneck', meaning: 'सबसे धीमा हिस्सा जो पूरे system को slow करे' },
            { hindi: 'लेटेंसी', english: 'Latency', meaning: 'request भेजने से response मिलने तक का समय' },
            { hindi: 'कैशिंग', english: 'Caching', meaning: 'बार-बार का result save करके रखना — दोबारा calculate न करना पड़े' },
            { hindi: 'स्ट्रीमिंग', english: 'Streaming', meaning: 'पूरा जवाब एक साथ नहीं, टुकड़ों में भेजना — user को fast लगता है' },
          ]}
        />
      </SectionBlock>
    </div>
  )
}
