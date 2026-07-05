import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 9 — From 100 to 10,000 Users: The Scaling Simulator
   THE STAR TOPIC — Progressive scaling simulation
================================================================ */

/* ---------- Constants ---------- */

const E = {
  green: '\u{1F7E2}',
  yellow: '\u{1F7E1}',
  orange: '\u{1F7E0}',
  red: '\u{1F534}',
  skull: '\u{1F480}',
  fire: '\u{1F525}',
  rocket: '\u{1F680}',
  check: '✅',
  warn: '⚠️',
  server: '\u{1F5A5}️',
  people: '\u{1F465}',
  balance: '⚖️',
  alert: '\u{1F6A8}',
  spark: '✨',
  chart: '\u{1F4CA}',
  bolt: '⚡',
  brain: '\u{1F9E0}',
  cache: '\u{1F4BE}',
  stream: '\u{1F30A}',
  route: '\u{1F500}',
  pool: '\u{1F4E6}',
  plus: '➕',
  money: '\u{1F4B0}',
  gear: '⚙️',
  book: '\u{1F4D6}',
  zap: '\u{1F3AF}',
}

const LEVELS = [
  {
    id: 1,
    label: '100 Users',
    badge: '1',
    color: '#10b981',
    emoji: E.green,
    concurrent: 100,
    servers: 1,
    cpuPerServer: 26,
    memUsed: 4.2,
    memTotal: 16,
    p50: 2300,
    p95: 2600,
    p99: 2800,
    errorRate: 0,
    rps: 43,
    costMonth: 80,
    status: 'Life is good. One server handles it easily.',
    statusIcon: E.check,
    bottlenecks: [],
    canAddServer: false,
    optimized: false,
  },
  {
    id: 2,
    label: '500 Users',
    badge: '2',
    color: '#f59e0b',
    emoji: E.yellow,
    concurrent: 500,
    servers: 1,
    serversAfter: 2,
    cpuPerServer: 130,
    cpuAfter: 65,
    memUsed: 5,
    memTotal: 16,
    p50: 2500,
    p95: 4500,
    p99: 6000,
    p99After: 3200,
    errorRate: 2,
    errorAfter: 0,
    rps: 217,
    costMonth: 80,
    costAfter: 160,
    status: 'CPU is overloaded. Requests are queuing. Time to scale!',
    statusAfter: 'Added second server. Load balanced. Back to healthy!',
    statusIcon: E.warn,
    statusIconAfter: E.check,
    bottlenecks: ['CPU overloaded past 100% - tasks queuing behind each other'],
    canAddServer: true,
    optimized: false,
  },
  {
    id: 3,
    label: '1,000 Users',
    badge: '3',
    color: '#f97316',
    emoji: E.orange,
    concurrent: 1000,
    servers: 3,
    cpuPerServer: 87,
    memUsed: 6,
    memTotal: 16,
    p50: 2400,
    p95: 3800,
    p99: 4500,
    errorRate: 0.5,
    rps: 435,
    costMonth: 240,
    status: 'Approaching OpenAI rate limits. Need to add caching or batch.',
    statusIcon: E.warn,
    bottlenecks: ['OpenAI rate limit: ~435 LLM calls/sec approaching cap', 'LLM API latency variability increasing P99'],
    canAddServer: false,
    optimized: false,
  },
  {
    id: 4,
    label: '2,000 Users',
    badge: '4',
    color: '#ef4444',
    emoji: E.red,
    concurrent: 2000,
    servers: 5,
    cpuPerServer: 70,
    memUsed: 8,
    memTotal: 16,
    p50: 2500,
    p95: 5500,
    p99: 8000,
    errorRate: 3,
    rps: 870,
    costMonth: 400,
    status: 'Rate limits hitting hard. Need caching, connection pooling, and maybe a cheaper LLM for simple queries.',
    statusIcon: E.fire,
    bottlenecks: [
      'Database connection pool exhausted (500 max connections)',
      'OpenAI 429 rate limit errors',
      'LLM API latency spikes under sustained load',
    ],
    canAddServer: false,
    optimized: false,
  },
  {
    id: 5,
    label: '10,000 Users',
    badge: '5',
    color: '#dc2626',
    emoji: E.skull,
    concurrent: 10000,
    // Unoptimized
    servers: 20,
    cpuPerServer: 95,
    memUsed: 14,
    memTotal: 16,
    p50: 4500,
    p95: 12000,
    p99: 18000,
    errorRate: 15,
    rps: 4348,
    costMonth: 1600,
    status: 'Money on fire. Everything is breaking.',
    statusIcon: E.skull,
    // Optimized
    serversOpt: 8,
    cpuOpt: 55,
    memUsedOpt: 9,
    p50Opt: 1800,
    p50Perceived: 200,
    p95Opt: 3200,
    p99Opt: 4000,
    errorOpt: 2,
    rpsOpt: 4348,
    costOpt: 640,
    statusOpt: 'Optimized and scaling smoothly!',
    statusIconOpt: E.rocket,
    bottlenecks: [
      'OpenAI rate limit completely exhausted',
      'DB connection pool (500) shared across 20 servers',
      'Memory nearly full on all servers',
      'Cost spiraling out of control',
    ],
    bottlenecksOpt: [],
    optimizations: [
      { icon: E.cache, label: 'Semantic Cache', desc: '30% hit rate saves ~3,000 LLM calls' },
      { icon: E.stream, label: 'Streaming Responses', desc: 'Perceived P50 drops to 200ms' },
      { icon: E.brain, label: 'Smaller LLM for simple queries', desc: '40% of queries use GPT-3.5 instead' },
      { icon: E.pool, label: 'Connection Pool + Read Replicas', desc: 'DB connections no longer a bottleneck' },
    ],
    canAddServer: false,
    optimized: false,
  },
]

const REQUEST_SPEC = [
  { label: 'Authentication', time: 15, color: '#6366f1' },
  { label: 'Embedding API', time: 200, color: '#3b82f6' },
  { label: 'Vector DB Query', time: 50, color: '#0ea5e9' },
  { label: 'LLM Call (GPT-4)', time: 2000, color: '#f59e0b' },
]

const SUMMARY_TABLE = [
  { users: '100', servers: '1', cpu: '26%', p99: '2.8s', error: '0%', cost: '$80' },
  { users: '500', servers: '2', cpu: '65%', p99: '3.2s', error: '0%', cost: '$160' },
  { users: '1,000', servers: '3', cpu: '87%', p99: '4.5s', error: '0.5%', cost: '$240' },
  { users: '2,000', servers: '5', cpu: '70%', p99: '8s', error: '3%', cost: '$400' },
  { users: '10,000', servers: '20 → 8*', cpu: 'varies', p99: 'varies', error: 'varies', cost: '$1600 → $640*' },
]

/* ---------- Helper: animated number ---------- */
function useAnimatedNumber(target, duration = 600) {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef(null)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    const start = performance.now()
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (target - from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        fromRef.current = target
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return display
}

/* ---------- Sub-component: CPU Gauge ---------- */
function CpuGauge({ value }) {
  const pct = Math.min(value, 100)
  const displayVal = useAnimatedNumber(pct)
  const overloaded = value > 100
  const gaugeColor = value > 90 ? '#ef4444' : value > 70 ? '#f59e0b' : value > 50 ? '#eab308' : '#10b981'
  const circumference = 2 * Math.PI * 32

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 6 }}>
        CPU
      </div>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
          <motion.circle
            cx="40" cy="40" r="32"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontWeight: 800, fontSize: overloaded ? 14 : 18,
          fontFamily: 'monospace',
          color: gaugeColor,
        }}>
          {overloaded ? `${Math.round(displayVal)}%!` : `${Math.round(displayVal)}%`}
        </div>
      </div>
      {overloaded && (
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          style={{ fontSize: 11, color: '#ef4444', fontWeight: 800, marginTop: 4 }}
        >
          OVERLOADED
        </motion.div>
      )}
    </div>
  )
}

/* ---------- Sub-component: Memory Bar ---------- */
function MemoryBar({ used, total }) {
  const pct = (used / total) * 100
  const color = pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
        <span>Memory</span>
        <span>{used}GB / {total}GB</span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: 'var(--border)', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 5, background: color }}
        />
      </div>
    </div>
  )
}

/* ---------- Sub-component: Metric Tile ---------- */
function MetricTile({ label, value, unit, color = 'var(--text-primary)', flash = false }) {
  return (
    <motion.div
      animate={flash ? { borderColor: ['#ef444480', '#ef444400', '#ef444480'] } : {}}
      transition={flash ? { repeat: Infinity, duration: 1 } : {}}
      style={{
        background: 'var(--bg-secondary)', borderRadius: 12, padding: '10px 14px',
        border: flash ? '2px solid #ef444480' : '1px solid var(--border)', textAlign: 'center',
        minWidth: 85, flex: 1,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'monospace' }}>
        {value}
      </div>
      {unit && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{unit}</div>}
    </motion.div>
  )
}

/* ---------- Sub-component: Server Box ---------- */
function ServerBox({ index, cpuPercent, healthy, stressed, fire }) {
  const color = fire ? '#ef4444' : stressed ? '#f59e0b' : healthy ? '#10b981' : '#6b7280'
  const icon = fire ? E.fire : stressed ? E.server : E.server
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        boxShadow: fire
          ? '0 0 20px rgba(239,68,68,0.5)'
          : stressed
            ? '0 0 12px rgba(245,158,11,0.3)'
            : '0 2px 8px rgba(0,0,0,0.06)',
      }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
      style={{
        width: 64, height: 72, borderRadius: 12,
        border: `2px solid ${color}`,
        background: 'var(--bg-card)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2, position: 'relative',
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 0.5 }}>
        S{index + 1}
      </div>
      {/* mini cpu bar */}
      <div style={{ width: '80%', height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${Math.min(cpuPercent, 100)}%` }}
          style={{ height: '100%', borderRadius: 2, background: color }}
        />
      </div>
      {fire && (
        <motion.div
          animate={{ y: [0, -3, 0], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          style={{ position: 'absolute', top: -8, fontSize: 14 }}
        >
          {E.fire}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ---------- Sub-component: Request Flow Animation ---------- */
function RequestFlow({ serverCount, color, active }) {
  const dots = active ? Array.from({ length: Math.min(serverCount * 2, 12) }) : []
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      justifyContent: 'center', padding: '12px 0',
      minHeight: 50, position: 'relative',
    }}>
      {/* Users */}
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 20 }}>{E.people}</span>
        <span>Users</span>
      </div>

      {/* Flow line with dots */}
      <div style={{
        flex: 1, height: 3, background: 'var(--border)',
        borderRadius: 2, position: 'relative', overflow: 'hidden',
        maxWidth: 160,
      }}>
        {dots.map((_, i) => (
          <motion.div
            key={i}
            animate={{ left: ['-8%', '108%'] }}
            transition={{
              duration: 1.2 + Math.random() * 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'linear',
            }}
            style={{
              position: 'absolute', top: -2.5,
              width: 8, height: 8, borderRadius: '50%',
              background: color,
              boxShadow: `0 0 6px ${color}80`,
            }}
          />
        ))}
      </div>

      {/* Load Balancer */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}15`, border: `2px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>
        {E.balance}
      </div>

      {/* Fan-out lines */}
      <div style={{
        flex: 1, height: 3, background: 'var(--border)',
        borderRadius: 2, position: 'relative', overflow: 'hidden',
        maxWidth: 80,
      }}>
        {active && (
          <motion.div
            animate={{ left: ['-8%', '108%'] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', top: -2.5,
              width: 8, height: 8, borderRadius: '50%',
              background: color,
            }}
          />
        )}
      </div>

      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Servers</span>
    </div>
  )
}

/* ---------- Sub-component: Bottleneck Alert ---------- */
function BottleneckAlert({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderRadius: 10,
        background: '#fef2f2', border: '1px solid #fecaca',
        fontSize: 13, color: '#991b1b', fontWeight: 600,
      }}
    >
      <span style={{ fontSize: 16 }}>{E.alert}</span>
      {message}
    </motion.div>
  )
}

/* ---------- Main Component: Scale Level Dashboard ---------- */
function ScaleLevelDashboard({ level, onNext, onPrev, totalLevels, currentIndex }) {
  const [scaled, setScaled] = useState(false)
  const [optimized, setOptimized] = useState(false)

  // Reset state when level changes
  useEffect(() => {
    setScaled(false)
    setOptimized(false)
  }, [level.id])

  const isLevel2 = level.id === 2
  const isLevel5 = level.id === 5

  // Compute current values based on state
  let servers = level.servers
  let cpu = level.cpuPerServer
  let p99 = level.p99
  let errRate = level.errorRate
  let cost = level.costMonth
  let status = level.status
  let statusIcon = level.statusIcon
  let bottlenecks = level.bottlenecks || []

  if (isLevel2 && scaled) {
    servers = level.serversAfter
    cpu = level.cpuAfter
    p99 = level.p99After
    errRate = level.errorAfter
    cost = level.costAfter
    status = level.statusAfter
    statusIcon = level.statusIconAfter
    bottlenecks = []
  }

  if (isLevel5 && optimized) {
    servers = level.serversOpt
    cpu = level.cpuOpt
    p99 = level.p99Opt
    errRate = level.errorOpt
    cost = level.costOpt
    status = level.statusOpt
    statusIcon = level.statusIconOpt
    bottlenecks = level.bottlenecksOpt
  }

  const p50 = isLevel5 && optimized ? level.p50Opt : level.p50
  const p95 = isLevel5 && optimized ? level.p95Opt : level.p95
  const memUsed = isLevel5 && optimized ? level.memUsedOpt : level.memUsed

  const serverHealthy = cpu < 60
  const serverStressed = cpu >= 60 && cpu <= 90
  const serverFire = cpu > 90

  const levelColor = (isLevel2 && scaled) ? '#10b981' : (isLevel5 && optimized) ? '#10b981' : level.color

  return (
    <div>
      {/* Level header */}
      <motion.div
        key={level.id + '-header'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: levelColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading)',
        }}>
          {level.badge}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: 22, color: 'var(--text-primary)',
          }}>
            Level {level.badge}: {level.concurrent.toLocaleString()} Concurrent Users
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {level.emoji} Scaling challenge
          </div>
        </div>
      </motion.div>

      {/* Request Flow */}
      <RequestFlow serverCount={servers} color={levelColor} active />

      {/* Server Rack */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10,
        justifyContent: 'center', marginBottom: 20, padding: '16px',
        background: 'var(--bg-secondary)', borderRadius: 16,
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: '100%', fontSize: 11, fontWeight: 700,
          color: 'var(--text-muted)', letterSpacing: 1,
          marginBottom: 4, textAlign: 'center',
        }}>
          SERVER RACK ({servers} {servers === 1 ? 'server' : 'servers'})
        </div>
        <AnimatePresence>
          {Array.from({ length: servers }).map((_, i) => (
            <ServerBox
              key={i}
              index={i}
              cpuPercent={cpu}
              healthy={serverHealthy}
              stressed={serverStressed}
              fire={serverFire}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Metrics Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 10, marginBottom: 16,
      }}>
        <div style={{
          gridColumn: 'span 1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CpuGauge value={cpu} />
        </div>
        <MetricTile label="P50" value={`${(p50 / 1000).toFixed(1)}s`} color={p50 > 3000 ? '#ef4444' : 'var(--text-primary)'} />
        <MetricTile label="P99" value={`${(p99 / 1000).toFixed(1)}s`} color={p99 > 5000 ? '#ef4444' : p99 > 3000 ? '#f59e0b' : 'var(--text-primary)'} />
        <MetricTile
          label="ERRORS"
          value={`${errRate}%`}
          color={errRate > 5 ? '#ef4444' : errRate > 0 ? '#f59e0b' : '#10b981'}
          flash={errRate > 5}
        />
        <MetricTile label="REQ/SEC" value={level.rps} color="var(--accent)" />
        <MetricTile label="COST/MO" value={`$${cost}`} color={cost > 500 ? '#ef4444' : 'var(--text-primary)'} />
      </div>

      {/* Memory Bar */}
      <div style={{ marginBottom: 16, padding: '0 4px' }}>
        <MemoryBar used={memUsed} total={level.memTotal} />
      </div>

      {/* Perceived latency for Level 5 optimized */}
      {isLevel5 && optimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '12px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #10b98120, #06b6d420)',
            border: '2px solid #10b98150',
            marginBottom: 16, textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
            {E.bolt}  With streaming: Perceived P50 = 200ms (users see tokens instantly!)
          </span>
        </motion.div>
      )}

      {/* Status */}
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '14px 20px', borderRadius: 14,
          background: errRate > 5 ? '#fef2f2' : errRate > 0 ? '#fffbeb' : '#f0fdf4',
          border: `1px solid ${errRate > 5 ? '#fecaca' : errRate > 0 ? '#fde68a' : '#bbf7d0'}`,
          marginBottom: 16, fontSize: 14, fontWeight: 600,
          color: errRate > 5 ? '#991b1b' : errRate > 0 ? '#92400e' : '#166534',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>{statusIcon}</span>
        {status}
      </motion.div>

      {/* Bottleneck Alerts */}
      {bottlenecks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', letterSpacing: 1 }}>
            BOTTLENECKS DETECTED
          </div>
          {bottlenecks.map((b, i) => (
            <BottleneckAlert key={i} message={b} />
          ))}
        </div>
      )}

      {/* Level 2: Add Server button */}
      {isLevel2 && !scaled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 16 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScaled(true)}
            style={{
              padding: '14px 32px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
            }}
          >
            {E.plus}  Add Second Server
          </motion.button>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Click to scale horizontally and fix the overload
          </div>
        </motion.div>
      )}

      {/* Level 5: Apply Optimizations */}
      {isLevel5 && !optimized && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 16 }}
        >
          <div style={{
            padding: '20px', borderRadius: 16,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            marginBottom: 12,
          }}>
            <div style={{
              fontSize: 14, fontWeight: 800, color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)', marginBottom: 12,
            }}>
              Available Optimizations:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {level.optimizations.map((opt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{opt.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOptimized(true)}
              style={{
                padding: '16px 40px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontWeight: 800, fontSize: 16,
                cursor: 'pointer', fontFamily: 'var(--font-heading)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                letterSpacing: 0.5,
              }}
            >
              {E.rocket}  Apply All Optimizations
            </motion.button>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Watch everything turn green!
            </div>
          </div>
        </motion.div>
      )}

      {/* Level 5 optimized: show what changed */}
      {isLevel5 && optimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '16px 20px', borderRadius: 14,
            background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
            border: '2px solid #10b98140',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 10 }}>
            {E.spark}  Optimizations Applied!
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Servers', before: '20', after: '8' },
              { label: 'Error Rate', before: '15%', after: '2%' },
              { label: 'Cost/Month', before: '$1,600', after: '$640' },
              { label: 'P99 Latency', before: '18s', after: '4s' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '8px 12px', borderRadius: 8,
                background: '#fff', border: '1px solid #bbf7d0',
                fontSize: 12,
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{item.label}</div>
                <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>{item.before}</span>
                <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>{'→'}</span>
                <span style={{ color: '#10b981', fontWeight: 800 }}>{item.after}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Nav buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
        <motion.button
          whileHover={{ scale: currentIndex > 0 ? 1.03 : 1 }}
          whileTap={{ scale: currentIndex > 0 ? 0.97 : 1 }}
          onClick={onPrev}
          disabled={currentIndex === 0}
          style={{
            padding: '10px 24px', borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            fontWeight: 600, fontSize: 14, cursor: currentIndex === 0 ? 'default' : 'pointer',
            fontFamily: 'var(--font-heading)', opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          {'←'} Previous
        </motion.button>
        {currentIndex < totalLevels - 1 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none',
              background: 'var(--gradient-primary)', color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Next Level {'→'}
          </motion.button>
        )}
        {currentIndex === totalLevels - 1 && (
          <div style={{
            padding: '10px 24px', borderRadius: 12,
            background: '#10b98115', border: '1px solid #10b98140',
            color: '#10b981', fontWeight: 700, fontSize: 14,
            fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {E.zap}  Final Level
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Level Tabs ---------- */
function LevelTabs({ levels, currentIndex, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, marginBottom: 20,
      overflowX: 'auto', padding: '4px 0',
    }}>
      {levels.map((lvl, i) => {
        const active = i === currentIndex
        return (
          <motion.button
            key={lvl.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(i)}
            style={{
              padding: '8px 16px', borderRadius: 10,
              border: active ? `2px solid ${lvl.color}` : '1px solid var(--border)',
              background: active ? `${lvl.color}15` : 'var(--bg-card)',
              color: active ? lvl.color : 'var(--text-muted)',
              fontWeight: active ? 800 : 600, fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {lvl.emoji} {lvl.label}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ---------- Request Pipeline Visual ---------- */
function RequestPipeline() {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const totalTime = REQUEST_SPEC.reduce((s, r) => s + r.time, 0)

  return (
    <div>
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
        letterSpacing: 1, marginBottom: 12, textAlign: 'center',
      }}>
        SINGLE REQUEST PIPELINE ({totalTime}ms total)
      </div>
      <div style={{
        display: 'flex', gap: 3, borderRadius: 10, overflow: 'hidden',
        height: 40, marginBottom: 8,
      }}>
        {REQUEST_SPEC.map((step, i) => {
          const widthPct = (step.time / totalTime) * 100
          return (
            <motion.div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              animate={{
                opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.4 : 1,
              }}
              style={{
                width: `${widthPct}%`, background: step.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 10, fontWeight: 700,
                cursor: 'pointer', position: 'relative',
                minWidth: widthPct > 5 ? 'auto' : 24,
              }}
            >
              {widthPct > 12 && step.label}
            </motion.div>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {REQUEST_SPEC.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: hoveredIdx === i ? step.color : 'var(--text-muted)',
            fontWeight: hoveredIdx === i ? 700 : 500,
            transition: 'all 0.2s',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: step.color }} />
            {step.label}: {step.time}ms
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12, padding: '10px 16px', borderRadius: 10,
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>CPU time/req:</span>{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 800 }}>13ms</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Memory/req:</span>{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 800 }}>2MB</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Server:</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>4 vCPU, 16GB RAM, 5 workers</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Scaling Summary Table ---------- */
function ScalingSummaryTable() {
  const [hoveredRow, setHoveredRow] = useState(null)
  const headers = ['Users', 'Servers', 'CPU/Server', 'P99', 'Error%', 'Cost/mo']
  const fields = ['users', 'servers', 'cpu', 'p99', 'error', 'cost']

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
        fontSize: 14, fontFamily: 'var(--font-sans)',
      }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '12px 16px', textAlign: 'left',
                fontWeight: 800, fontSize: 12, letterSpacing: 1,
                color: 'var(--text-muted)', borderBottom: '2px solid var(--border)',
                background: 'var(--bg-secondary)',
                borderTopLeftRadius: i === 0 ? 12 : 0,
                borderTopRightRadius: i === headers.length - 1 ? 12 : 0,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SUMMARY_TABLE.map((row, ri) => (
            <motion.tr
              key={ri}
              onMouseEnter={() => setHoveredRow(ri)}
              onMouseLeave={() => setHoveredRow(null)}
              animate={{
                background: hoveredRow === ri ? 'var(--bg-secondary)' : 'transparent',
              }}
              style={{ cursor: 'default' }}
            >
              {fields.map((f, fi) => (
                <td key={fi} style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  fontWeight: fi === 0 ? 700 : 500,
                  color: ri === 4 ? '#f59e0b'
                    : f === 'error' && row[f] !== '0%' ? '#ef4444'
                    : fi === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: fi > 0 ? 'monospace' : 'inherit',
                  borderBottomLeftRadius: ri === SUMMARY_TABLE.length - 1 && fi === 0 ? 12 : 0,
                  borderBottomRightRadius: ri === SUMMARY_TABLE.length - 1 && fi === fields.length - 1 ? 12 : 0,
                }}>
                  {row[f]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'right', fontStyle: 'italic' }}>
        * After applying optimizations (caching, streaming, smart routing)
      </div>
    </div>
  )
}

/* ================================================================
   Main Export: Topic9_ScalingSimulator
================================================================ */
export default function Topic9_ScalingSimulator() {
  const [currentLevel, setCurrentLevel] = useState(0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* --- Opening --- */}
      <Neuron
        mood="excited"
        message="You built a RAG chatbot. It works great locally. Now let's see what happens when REAL users show up -- from 100 to 10,000. Watch the servers sweat."
        typed
      />

      {/* --- Section 1: Request Pipeline --- */}
      <SectionBlock title="Your RAG App Per-Request Cost" icon={E.gear} color="#6366f1">
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20,
        }}>
          Before we scale, let us understand what <strong>one single request</strong> costs in time and resources.
          The LLM call dominates everything -- 2 seconds out of 2.3 total. This is why scaling
          AI apps is fundamentally different from scaling CRUD apps.
        </p>
        <InteractiveDemo title="Request Pipeline Breakdown">
          <RequestPipeline />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 2: THE BIG INTERACTIVE --- */}
      <SectionBlock title="Scale Simulator Dashboard" icon={E.chart} color="#f59e0b">
        <Neuron
          mood="thinking"
          message="This is it -- the main event. Click through each level and watch what breaks. Try to fix it at each stage before moving on!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="From 100 to 10,000 Users -- Live Simulation">
            {/* Level tabs */}
            <LevelTabs
              levels={LEVELS}
              currentIndex={currentLevel}
              onChange={setCurrentLevel}
            />

            {/* Progress bar */}
            <div style={{
              height: 6, borderRadius: 3, background: 'var(--border)',
              marginBottom: 20, overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${((currentLevel + 1) / LEVELS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                style={{
                  height: '100%', borderRadius: 3,
                  background: LEVELS[currentLevel].color,
                }}
              />
            </div>

            {/* Dashboard */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLevel}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <ScaleLevelDashboard
                  level={LEVELS[currentLevel]}
                  currentIndex={currentLevel}
                  totalLevels={LEVELS.length}
                  onNext={() => setCurrentLevel(i => Math.min(i + 1, LEVELS.length - 1))}
                  onPrev={() => setCurrentLevel(i => Math.max(i - 1, 0))}
                />
              </motion.div>
            </AnimatePresence>
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* --- Section 3: Scaling Math Summary --- */}
      <SectionBlock title="The Scaling Math Summary" icon={E.chart} color="#3b82f6">
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20,
        }}>
          Here is the complete picture. Notice how cost does not scale linearly with users --
          and how <strong>optimizations at 10K users cut costs by 60%</strong>.
        </p>
        <InteractiveDemo title="Scaling Numbers at a Glance">
          <ScalingSummaryTable />
        </InteractiveDemo>

        <Neuron
          mood="explaining"
          message="The key insight: throwing more servers at the problem works up to a point. After that, you MUST optimize -- caching, streaming, smart routing. Architecture beats hardware."
          typed
        />
      </SectionBlock>

      {/* --- Section 4: Hindi Explainer --- */}
      <SectionBlock title="Summary" icon={E.book} color="#ff9933">
        <Neuron
          mood="happy"
          message="You have just experienced what it takes to scale a real AI application from a single server to handling 10,000 concurrent users. This is the kind of thinking that separates hobby projects from production systems."
          typed
        />
        <div style={{ marginTop: 20 }}>
          <HindiExplainer
            concept="100 से 10,000 Users तक"
            english="Scaling from 100 to 10,000 Users"
            explanation="100 users पर सब smooth चलता है — एक server काफ़ी है। 500 पर CPU overload होने लगता है। 1,000 पर OpenAI rate limit hit करता है। 2,000 पर database connections ख़त्म होते हैं। 10,000 पर बिना optimization सब crash हो जाता है — caching, streaming, और smart routing से ही handle हो सकता है।"
            example="ये ऐसा है जैसे एक चाय की दुकान: 10 customers — 1 भैया handle कर लेता है। 50 customers — 2 भैया चाहिए। 200 customers — चीनी/दूध ख़त्म हो जाता है (rate limit!), gas cylinder slow है (bottleneck!), जगह नहीं है (memory!). Solution: pre-made chai रखो (caching), ज़्यादा stalls लगाओ (horizontal scaling), और VIP/regular अलग counter (routing)!"
            terms={[
              { hindi: 'कंकरेंट यूजर्स', english: 'Concurrent Users', meaning: 'एक ही समय पर active users की संख्या' },
              { hindi: 'रेट लिमिट', english: 'Rate Limit', meaning: 'API provider की limit — ज़्यादा calls करो तो block' },
              { hindi: 'कनेक्शन पूल', english: 'Connection Pool', meaning: 'Database connections का ready set — limited होता है' },
              { hindi: 'ऑप्टिमाइज़ेशन', english: 'Optimization', meaning: 'कम resources में ज़्यादा काम — caching, batching, streaming' },
            ]}
          />
        </div>
      </SectionBlock>

    </div>
  )
}
