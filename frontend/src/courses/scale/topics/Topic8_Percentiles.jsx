import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 8 — Latency Percentiles & SLAs
   P50, P90, P95, P99, why averages lie, and how to measure real performance
================================================================ */

/* Helper: generate realistic response times */
function generateResponseTimes(count = 100) {
  const times = []
  for (let i = 0; i < count; i++) {
    const r = Math.random()
    if (r < 0.70) times.push(Math.round(150 + Math.random() * 100))
    else if (r < 0.90) times.push(Math.round(250 + Math.random() * 200))
    else if (r < 0.95) times.push(Math.round(800 + Math.random() * 2200))
    else if (r < 0.99) times.push(Math.round(3000 + Math.random() * 3000))
    else times.push(Math.round(5000 + Math.random() * 3000))
  }
  return times.sort((a, b) => a - b)
}

function calcPercentile(sorted, p) {
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

/* ---- Section 1 Interactive: Average vs Reality ---- */
function AverageVsReality() {
  const [animated, setAnimated] = useState(false)
  const [data] = useState(() => {
    const normal = Array.from({ length: 95 }, () => Math.round(150 + Math.random() * 100))
    const outliers = [3200, 4100, 5500, 6800, 8000]
    return [...normal, ...outliers].sort((a, b) => a - b)
  })

  const avg = Math.round(data.reduce((s, v) => s + v, 0) / data.length)
  const p50 = calcPercentile(data, 50)
  const p90 = calcPercentile(data, 90)
  const p95 = calcPercentile(data, 95)
  const p99 = calcPercentile(data, 99)

  // Build histogram buckets
  const buckets = []
  const bucketSize = 500
  const maxVal = Math.max(...data)
  for (let low = 0; low <= maxVal; low += bucketSize) {
    const count = data.filter(v => v >= low && v < low + bucketSize).length
    buckets.push({ low, high: low + bucketSize, count })
  }
  const maxCount = Math.max(...buckets.map(b => b.count))

  const markers = [
    { label: 'P50', value: p50, color: '#22c55e' },
    { label: 'P90', value: p90, color: '#eab308' },
    { label: 'P95', value: p95, color: '#f97316' },
    { label: 'P99', value: p99, color: '#ef4444' },
  ]

  const stats = [
    { label: 'Average', value: `${avg}ms`, verdict: 'Looks fine...', color: '#6366f1', icon: '=' },
    { label: 'Median (P50)', value: `${p50}ms`, verdict: 'Half are faster', color: '#22c55e', icon: '~' },
    { label: 'P95', value: `${p95}ms`, verdict: '5% wait 3+ seconds', color: '#f97316', icon: '!' },
    { label: 'P99', value: `${p99}ms`, verdict: '1% wait 8+ seconds', color: '#ef4444', icon: '!!' },
  ]

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        100 response times: 95 around 200ms, 5 outliers at 3000-8000ms. Click to reveal the truth.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAnimated(true)}
        disabled={animated}
        style={{
          padding: '10px 28px', borderRadius: 10, border: 'none',
          background: animated ? 'var(--bg-secondary)' : 'var(--gradient-primary)',
          color: animated ? 'var(--text-muted)' : '#fff',
          fontWeight: 700, fontSize: 14, cursor: animated ? 'default' : 'pointer',
          fontFamily: 'var(--font-heading)', marginBottom: 24,
        }}
      >
        {animated ? 'Histogram Revealed' : 'Build Histogram'}
      </motion.button>

      {/* Histogram */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 3, height: 200,
        padding: '0 8px', marginBottom: 8, position: 'relative',
      }}>
        {buckets.map((b, i) => {
          const height = maxCount > 0 ? (b.count / maxCount) * 180 : 0
          const markerHere = markers.find(m => m.value >= b.low && m.value < b.high)
          const isOutlier = b.low >= 2500
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={animated ? { height } : { height: 0 }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  background: isOutlier
                    ? 'linear-gradient(180deg, #ef4444, #dc2626)'
                    : 'linear-gradient(180deg, #3b82f6, #2563eb)',
                  minHeight: animated && b.count > 0 ? 4 : 0,
                }}
              />
              {markerHere && animated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  style={{
                    position: 'absolute', top: -28,
                    background: markerHere.color, color: '#fff',
                    padding: '2px 8px', borderRadius: 6, fontSize: 10,
                    fontWeight: 800, whiteSpace: 'nowrap',
                  }}
                >
                  {markerHere.label}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {/* X-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', marginBottom: 24 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0ms</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {Math.round(maxVal / 2)}ms
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{maxVal}ms</span>
      </div>

      {/* Stats cards */}
      <AnimatePresence>
        {animated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.15 }}
                style={{
                  background: `${s.color}10`, border: `2px solid ${s.color}30`,
                  borderRadius: 14, padding: '16px 18px', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: s.color, fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {s.verdict}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 2 Interactive: Percentile Explorer ---- */
function PercentileExplorer() {
  const [data] = useState(() => generateResponseTimes(100))
  const [selectedPercentile, setSelectedPercentile] = useState(50)

  const percentiles = [50, 75, 90, 95, 99, 99.9]
  const pValue = calcPercentile(data, selectedPercentile)
  const belowCount = data.filter(v => v <= pValue).length

  const descriptions = {
    50: { label: 'Median', desc: 'The typical experience' },
    75: { label: 'P75', desc: 'Upper quartile' },
    90: { label: 'P90', desc: "Most users' worst case" },
    95: { label: 'P95', desc: 'The bar for a good service' },
    99: { label: 'P99', desc: 'Almost everyone is happy' },
    99.9: { label: 'P99.9', desc: 'Enterprise SLA territory' },
  }

  return (
    <div>
      {/* Percentile buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {percentiles.map(p => {
          const active = selectedPercentile === p
          return (
            <motion.button
              key={p}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPercentile(p)}
              style={{
                padding: '8px 20px', borderRadius: 10, border: 'none',
                background: active ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                color: active ? '#fff' : 'var(--text-primary)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                boxShadow: active ? 'var(--shadow-lg)' : 'none',
              }}
            >
              P{p}
            </motion.button>
          )
        })}
      </div>

      {/* Big display */}
      <motion.div
        key={selectedPercentile}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          textAlign: 'center', padding: '24px', marginBottom: 20,
          background: 'var(--bg-secondary)', borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
          {descriptions[selectedPercentile]?.label || `P${selectedPercentile}`}
        </div>
        <div style={{
          fontSize: 48, fontWeight: 900, fontFamily: 'var(--font-heading)',
          background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {pValue}ms
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {selectedPercentile}% of requests are faster than this
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {descriptions[selectedPercentile]?.desc}
        </div>
      </motion.div>

      {/* Response time grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4,
      }}>
        {data.map((v, i) => {
          const isBelow = v <= pValue
          return (
            <motion.div
              key={i}
              animate={{
                background: isBelow ? '#22c55e20' : '#ef444420',
                borderColor: isBelow ? '#22c55e50' : '#ef444450',
              }}
              transition={{ duration: 0.3 }}
              style={{
                padding: '4px 2px', borderRadius: 6, textAlign: 'center',
                fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                color: isBelow ? '#22c55e' : '#ef4444',
                border: '1px solid',
              }}
            >
              {v}
            </motion.div>
          )
        })}
      </div>

      <div style={{
        marginTop: 12, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)',
      }}>
        <span style={{ color: '#22c55e', fontWeight: 700 }}>{belowCount} below</span>
        {' / '}
        <span style={{ color: '#ef4444', fontWeight: 700 }}>{data.length - belowCount} above</span>
        {' the P'}{selectedPercentile}{' threshold'}
      </div>
    </div>
  )
}

/* ---- Section 3 Interactive: User Impact Calculator ---- */
function UserImpactCalculator() {
  const [requestsPerHour, setRequestsPerHour] = useState(10000)
  const [p99Latency, setP99Latency] = useState(5)
  const [requestsPerSession, setRequestsPerSession] = useState(10)

  const affectedPerHour = Math.round(requestsPerHour * 0.01)
  const probHitP99 = 1 - Math.pow(0.99, requestsPerSession)
  const percentHit = (probHitP99 * 100).toFixed(1)

  return (
    <div>
      {/* Requests per hour */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Requests per hour
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
            {requestsPerHour.toLocaleString()}
          </span>
        </div>
        <input
          type="range" min={1000} max={100000} step={1000}
          value={requestsPerHour}
          onChange={e => setRequestsPerHour(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      {/* P99 latency */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            P99 Latency
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>
            {p99Latency}s
          </span>
        </div>
        <input
          type="range" min={1} max={10} step={0.5}
          value={p99Latency}
          onChange={e => setP99Latency(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#ef4444' }}
        />
      </div>

      {/* Requests per session */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Requests per session
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
            {requestsPerSession}
          </span>
        </div>
        <input
          type="range" min={1} max={50} step={1}
          value={requestsPerSession}
          onChange={e => setRequestsPerSession(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <motion.div
          key={`${affectedPerHour}`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          style={{
            background: '#ef444412', border: '2px solid #ef444430',
            borderRadius: 16, padding: '20px', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
            AFFECTED USERS / HOUR
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-heading)' }}>
            {affectedPerHour.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            experience {'>'}{p99Latency}s wait
          </div>
        </motion.div>

        <motion.div
          key={`${percentHit}`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          style={{
            background: '#f9731612', border: '2px solid #f9731630',
            borderRadius: 16, padding: '20px', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
            USERS WHO HIT P99
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#f97316', fontFamily: 'var(--font-heading)' }}>
            {percentHit}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            ~1 in {Math.round(1 / probHitP99)} users per session
          </div>
        </motion.div>
      </div>

      {/* Formula explanation */}
      <div style={{
        marginTop: 16, padding: '14px 18px', borderRadius: 12,
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)',
      }}>
        P(hit P99 at least once) = 1 - 0.99^{requestsPerSession} = {(probHitP99 * 100).toFixed(2)}%
      </div>
    </div>
  )
}

/* ---- Section 4 Interactive: SLA Builder ---- */
function SLABuilder() {
  const [uptime, setUptime] = useState(99.9)
  const [p95Target, setP95Target] = useState(500)
  const [p99Target, setP99Target] = useState(2000)

  const uptimeOptions = [
    { value: 99.9, label: '99.9%', yearDown: '8h 45m', monthDown: '43.8 min', dayDown: '1m 26s' },
    { value: 99.95, label: '99.95%', yearDown: '4h 22m', monthDown: '21.9 min', dayDown: '43s' },
    { value: 99.99, label: '99.99%', yearDown: '52m 36s', monthDown: '4.38 min', dayDown: '8.6s' },
  ]
  const current = uptimeOptions.find(o => o.value === uptime) || uptimeOptions[0]

  const slaExamples = [
    { service: 'AWS API Gateway', sla: '99.95% uptime', p99: '<1s', penalty: 'Service credits' },
    { service: 'Stripe API', sla: '99.99%', p99: '<500ms', penalty: 'None' },
    { service: 'Your Startup', sla: '???', p99: '???', penalty: 'Users leave' },
  ]

  return (
    <div>
      {/* Real-world examples table */}
      <div style={{
        borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)',
        marginBottom: 24,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
          background: 'var(--bg-secondary)', padding: '12px 16px',
          fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1,
        }}>
          <span>SERVICE</span>
          <span>SLA</span>
          <span>P99 TARGET</span>
          <span>PENALTY</span>
        </div>
        {slaExamples.map((ex, i) => (
          <div
            key={ex.service}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
              padding: '12px 16px', fontSize: 13, color: 'var(--text-primary)',
              borderTop: '1px solid var(--border)',
              background: i === 2 ? '#ef444408' : 'transparent',
            }}
          >
            <span style={{ fontWeight: 700 }}>{ex.service}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{ex.sla}</span>
            <span style={{ fontFamily: 'monospace', color: i === 2 ? '#ef4444' : '#22c55e' }}>{ex.p99}</span>
            <span style={{ fontSize: 12, color: i === 2 ? '#ef4444' : 'var(--text-muted)' }}>{ex.penalty}</span>
          </div>
        ))}
      </div>

      {/* Uptime selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          Target Uptime
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {uptimeOptions.map(opt => (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUptime(opt.value)}
              style={{
                flex: 1, padding: '12px', borderRadius: 12, cursor: 'pointer',
                border: uptime === opt.value ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: uptime === opt.value ? 'var(--accent-lighter)' : 'var(--bg-card)',
                fontWeight: 800, fontSize: 16, color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Downtime display */}
      <motion.div
        key={uptime}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { period: 'Per Year', value: current.yearDown },
          { period: 'Per Month', value: current.monthDown },
          { period: 'Per Day', value: current.dayDown },
        ].map(item => (
          <div
            key={item.period}
            style={{
              background: 'var(--bg-secondary)', borderRadius: 12,
              padding: '16px', textAlign: 'center',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>
              {item.period}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-heading)' }}>
              {item.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              allowed downtime
            </div>
          </div>
        ))}
      </motion.div>

      {/* Latency targets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>P95 Target</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#22c55e' }}>{p95Target}ms</span>
          </div>
          <input
            type="range" min={100} max={5000} step={100}
            value={p95Target}
            onChange={e => setP95Target(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#22c55e' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>P99 Target</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#f97316' }}>{p99Target}ms</span>
          </div>
          <input
            type="range" min={200} max={10000} step={200}
            value={p99Target}
            onChange={e => setP99Target(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f97316' }}
          />
        </div>
      </div>

      {/* Summary */}
      <div style={{
        marginTop: 18, padding: '14px 18px', borderRadius: 12,
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
      }}>
        Your SLA: <strong style={{ color: 'var(--text-primary)' }}>{uptime}% uptime</strong>,
        P95 {'<'} <strong style={{ color: '#22c55e' }}>{p95Target}ms</strong>,
        P99 {'<'} <strong style={{ color: '#f97316' }}>{p99Target}ms</strong>.
        {' '}Allowed downtime: <strong style={{ color: '#ef4444' }}>{current.monthDown}/month</strong>.
      </div>
    </div>
  )
}

/* ---- Section 5 Interactive: Percentile Calculator ---- */
function PercentileCalculator() {
  const [input, setInput] = useState('')
  const [data, setData] = useState(null)

  const generateRandom = () => {
    const times = generateResponseTimes(30)
    setInput(times.join(', '))
    processData(times)
  }

  const processData = (values) => {
    if (!values || values.length === 0) { setData(null); return }
    const sorted = [...values].sort((a, b) => a - b)
    const sum = sorted.reduce((s, v) => s + v, 0)
    const mean = sum / sorted.length
    const variance = sorted.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / sorted.length
    const stdDev = Math.sqrt(variance)

    setData({
      sorted,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      p50: calcPercentile(sorted, 50),
      p75: calcPercentile(sorted, 75),
      p90: calcPercentile(sorted, 90),
      p95: calcPercentile(sorted, 95),
      p99: calcPercentile(sorted, 99),
    })
  }

  const handleParse = () => {
    const values = input
      .split(/[,\s]+/)
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n) && n > 0)
    processData(values)
  }

  const maxVal = data ? data.max : 0
  const bucketSize = data ? Math.max(1, Math.ceil(maxVal / 12)) : 1
  const buckets = []
  if (data) {
    for (let low = 0; low <= maxVal; low += bucketSize) {
      const count = data.sorted.filter(v => v >= low && v < low + bucketSize).length
      buckets.push({ low, count })
    }
  }
  const maxBucket = Math.max(1, ...buckets.map(b => b.count))

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter comma-separated response times (e.g., 120, 150, 200, 350, 5000)..."
          style={{
            width: '100%', minHeight: 70, padding: '12px 16px', borderRadius: 12,
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: 14, fontFamily: 'monospace',
            resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleParse}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: 'var(--gradient-primary)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Calculate
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateRandom}
          style={{
            padding: '10px 24px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
          }}
        >
          Generate Random
        </motion.button>
      </div>

      {data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Basic stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Min', value: `${data.min}ms`, color: '#22c55e' },
              { label: 'Max', value: `${data.max}ms`, color: '#ef4444' },
              { label: 'Mean', value: `${data.mean}ms`, color: '#6366f1' },
              { label: 'Std Dev', value: `${data.stdDev}ms`, color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} style={{
                background: `${s.color}10`, border: `1px solid ${s.color}30`,
                borderRadius: 10, padding: '10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Percentile stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'P50', value: data.p50, color: '#22c55e' },
              { label: 'P75', value: data.p75, color: '#84cc16' },
              { label: 'P90', value: data.p90, color: '#eab308' },
              { label: 'P95', value: data.p95, color: '#f97316' },
              { label: 'P99', value: data.p99, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{
                background: `${s.color}10`, border: `1px solid ${s.color}30`,
                borderRadius: 10, padding: '10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}ms</div>
              </div>
            ))}
          </div>

          {/* Mini histogram */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 3, height: 100,
            padding: '0 4px', background: 'var(--bg-secondary)', borderRadius: 12,
            border: '1px solid var(--border)', paddingTop: 12, paddingBottom: 8,
          }}>
            {buckets.map((b, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(b.count / maxBucket) * 80}%` }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                style={{
                  flex: 1, borderRadius: '4px 4px 0 0', minHeight: b.count > 0 ? 4 : 0,
                  background: b.low >= (data.p95 || Infinity)
                    ? '#ef4444' : b.low >= (data.p90 || Infinity)
                    ? '#f97316' : '#3b82f6',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{data.min}ms</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{data.max}ms</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ---- Section 6 Interactive: Tail Killer ---- */
function TailKiller() {
  const fixes = [
    { id: 'coldstart', label: 'Fix cold starts', desc: 'Add keep-alive / warm-up requests', before: 5000, after: 3000, icon: '🧊' },
    { id: 'dbindex', label: 'Add DB index', desc: 'Index slow query columns', before: 3000, after: 1500, icon: '🗄' },
    { id: 'connpool', label: 'Connection pooling', desc: 'Reuse database connections', before: 1500, after: 800, icon: '🔗' },
    { id: 'caching', label: 'Add caching layer', desc: 'Redis/Memcached for hot paths', before: 800, after: 400, icon: '💾' },
    { id: 'infra', label: 'Dedicated infrastructure', desc: 'No noisy neighbors', before: 400, after: 250, icon: '🏗' },
  ]

  const [applied, setApplied] = useState({})

  // Determine current P99 based on which fixes have been applied in order
  let currentP99 = 5000
  for (const fix of fixes) {
    if (applied[fix.id]) {
      currentP99 = fix.after
    } else {
      break
    }
  }

  // Next available fix
  const nextFixIndex = fixes.findIndex(f => !applied[f.id])

  const applyFix = (id) => {
    setApplied(prev => ({ ...prev, [id]: true }))
  }

  const resetAll = () => setApplied({})

  const appliedCount = Object.values(applied).filter(Boolean).length
  const p99Color = currentP99 > 3000 ? '#ef4444' : currentP99 > 1000 ? '#f97316' : currentP99 > 500 ? '#eab308' : '#22c55e'

  return (
    <div>
      {/* Current P99 display */}
      <motion.div
        key={currentP99}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        style={{
          textAlign: 'center', marginBottom: 24, padding: '20px',
          background: `${p99Color}08`, borderRadius: 16,
          border: `2px solid ${p99Color}30`,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: p99Color, letterSpacing: 1 }}>
          CURRENT P99 LATENCY
        </div>
        <motion.div
          key={currentP99}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ fontSize: 56, fontWeight: 900, color: p99Color, fontFamily: 'var(--font-heading)' }}
        >
          {currentP99}ms
        </motion.div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {appliedCount === 0 ? 'No optimizations applied' :
           appliedCount === fixes.length ? 'All optimizations applied! 20x improvement!' :
           `${appliedCount}/${fixes.length} optimizations applied`}
        </div>
      </motion.div>

      {/* Progress bar */}
      <div style={{
        height: 8, borderRadius: 4, background: 'var(--bg-secondary)',
        marginBottom: 20, overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${(appliedCount / fixes.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{ height: '100%', borderRadius: 4, background: 'var(--gradient-primary)' }}
        />
      </div>

      {/* Fix cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {fixes.map((fix, i) => {
          const isApplied = !!applied[fix.id]
          const isNext = i === nextFixIndex
          const isLocked = i > nextFixIndex && nextFixIndex !== -1

          return (
            <motion.div
              key={fix.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 14,
                border: isApplied ? '2px solid #22c55e40' : isNext ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: isApplied ? '#22c55e08' : isNext ? 'var(--accent-lighter)' : 'var(--bg-card)',
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 24 }}>{fix.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  {fix.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {fix.desc}
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 10 }}>
                <div style={{
                  fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace',
                }}>
                  {fix.before}ms {'→'} {fix.after}ms
                </div>
              </div>
              {isApplied ? (
                <div style={{
                  padding: '6px 16px', borderRadius: 8,
                  background: '#22c55e20', color: '#22c55e',
                  fontWeight: 700, fontSize: 12,
                }}>
                  Fixed
                </div>
              ) : (
                <motion.button
                  whileHover={isNext ? { scale: 1.08 } : {}}
                  whileTap={isNext ? { scale: 0.95 } : {}}
                  onClick={() => isNext && applyFix(fix.id)}
                  disabled={!isNext}
                  style={{
                    padding: '8px 18px', borderRadius: 8, border: 'none',
                    background: isNext ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                    color: isNext ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: 12,
                    cursor: isNext ? 'pointer' : 'default',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {isNext ? 'Apply Fix' : 'Locked'}
                </motion.button>
              )}
            </motion.div>
          )
        })}
      </div>

      {appliedCount > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetAll}
          style={{
            padding: '8px 20px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
          }}
        >
          Reset All
        </motion.button>
      )}
    </div>
  )
}

/* ================================================================
   Main Component
================================================================ */
export default function Topic8_Percentiles() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* --- Opening --- */}
      <Neuron
        mood="thinking"
        message="Your app's average response time is 200ms. Sounds great, right? But some users are waiting 5 seconds. The average hides the pain. Let's learn the metrics that tell the REAL story."
        typed
      />

      {/* --- Section 1: The Average Problem --- */}
      <SectionBlock title="The Average Problem" icon="📊" color="#ef4444">
        <Neuron
          mood="explaining"
          message="Imagine 100 users. 95 get a response in ~200ms. But 5 unlucky users hit a slow DB query or cold LLM call and wait 3-8 seconds. The average says 390ms — looks fine! But is it?"
          typed
        />
        <InteractiveDemo title="Average vs Reality" instruction="Click 'Build Histogram' to see how averages hide the truth.">
          <AverageVsReality />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 2: Understanding Percentiles --- */}
      <SectionBlock title="Understanding Percentiles" icon="📈" color="#3b82f6">
        <Neuron
          mood="explaining"
          message="A percentile tells you: X% of requests are faster than this value. P50 is the median — the typical experience. P99 means 99% are faster, only 1% are slower. Higher percentiles reveal the tail — where the real pain hides."
          typed
        />

        {/* Big visual breakdown */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12, margin: '20px 0',
        }}>
          {[
            { label: 'P50', sub: 'Median', desc: 'The typical experience', pct: '50%', color: '#22c55e' },
            { label: 'P90', sub: '90th', desc: "Most users' worst case", pct: '90%', color: '#84cc16' },
            { label: 'P95', sub: '95th', desc: 'The bar for good service', pct: '95%', color: '#eab308' },
            { label: 'P99', sub: '99th', desc: 'Almost everyone is happy', pct: '99%', color: '#f97316' },
            { label: 'P99.9', sub: '99.9th', desc: 'Enterprise SLA territory', pct: '99.9%', color: '#ef4444' },
          ].map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: `${p.color}10`, border: `2px solid ${p.color}30`,
                borderRadius: 16, padding: '18px 14px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: p.color, fontFamily: 'var(--font-heading)' }}>
                {p.label}
              </div>
              <div style={{ fontSize: 12, color: p.color, fontWeight: 600, marginBottom: 6 }}>
                {p.pct} faster
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {p.desc}
              </div>
            </motion.div>
          ))}
        </div>

        <InteractiveDemo title="Percentile Explorer" instruction="Click a percentile to see which response times fall below it.">
          <PercentileExplorer />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 3: Why P99 Matters More Than Average --- */}
      <SectionBlock title="Why P99 Matters More Than Average" icon="🎯" color="#f97316">
        <Neuron
          mood="excited"
          message="Here's the scary math: if your P99 is 5 seconds and you have 10,000 requests per hour, that's 100 users EVERY HOUR with a terrible experience. And if each user makes 10 requests per session, nearly 1 in 10 users will hit that P99 at least once!"
          typed
        />

        {/* Impact numbers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '20px 0',
        }}>
          <div style={{
            background: '#ef444410', border: '2px solid #ef444430',
            borderRadius: 16, padding: '20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, letterSpacing: 1 }}>
              P99 = 5s @ 10K req/hr
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-heading)' }}>
              100
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              users/hour have terrible experience
            </div>
          </div>
          <div style={{
            background: '#22c55e10', border: '2px solid #22c55e30',
            borderRadius: 16, padding: '20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, letterSpacing: 1 }}>
              P99.9 = 5s @ 10K req/hr
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#22c55e', fontFamily: 'var(--font-heading)' }}>
              10
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              users/hour — much better!
            </div>
          </div>
        </div>

        <InteractiveDemo title="User Impact Calculator" instruction="Adjust the sliders to see how P99 latency affects real users.">
          <UserImpactCalculator />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 4: Real-World SLAs --- */}
      <SectionBlock title="Real-World SLAs" icon="📋" color="#8b5cf6">
        <Neuron
          mood="explaining"
          message="An SLA (Service Level Agreement) is a promise you make to users about uptime and performance. 99.9% uptime sounds great until you realize that's almost 9 hours of downtime per year. Let's build your own SLA."
          typed
        />
        <InteractiveDemo title="SLA Builder" instruction="Pick your uptime target and see the allowed downtime. Set latency targets.">
          <SLABuilder />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 5: Measuring Percentiles --- */}
      <SectionBlock title="Measuring Percentiles" icon="🔬" color="#0ea5e9">
        <Neuron
          mood="thinking"
          message="Knowing about percentiles is useless if you don't measure them. Here are three levels of measurement: application-level timing, infrastructure monitoring (Prometheus + Grafana), and full APM tools (Datadog, New Relic, Sentry)."
          typed
        />

        {/* Measurement approaches */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, margin: '20px 0',
        }}>
          {[
            { level: 'Application', tool: 'Timing Middleware', desc: 'Measure each endpoint response time in your code', color: '#22c55e', icon: '⏱' },
            { level: 'Infrastructure', tool: 'Prometheus + Grafana', desc: 'Dashboards with histogram queries and alerts', color: '#3b82f6', icon: '📊' },
            { level: 'APM', tool: 'Datadog / New Relic', desc: 'Full tracing, auto-instrumentation, anomaly detection', color: '#8b5cf6', icon: '🔍' },
          ].map((m, i) => (
            <motion.div
              key={m.level}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: `${m.color}08`, border: `2px solid ${m.color}25`,
                borderRadius: 16, padding: '20px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 11, color: m.color, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                {m.level.toUpperCase()}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-heading)' }}>
                {m.tool}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {m.desc}
              </div>
            </motion.div>
          ))}
        </div>

        <InteractiveDemo title="Percentile Calculator" instruction="Enter response times or generate random data to calculate percentiles.">
          <PercentileCalculator />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 6: Tail Latency Optimization --- */}
      <SectionBlock title="Improving Percentiles — Tail Latency" icon="🚀" color="#10b981">
        <Neuron
          mood="excited"
          message="The tail (P99, P99.9) is where the dragons live. Cold starts, GC pauses, missing indexes, network retries, noisy neighbors — each one adds spikes. Let's slay them one by one and watch P99 drop!"
          typed
        />

        {/* Causes list */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 0 20px',
        }}>
          {[
            { cause: 'Cold starts', desc: 'First request after idle warms up the service' },
            { cause: 'GC pauses', desc: 'Garbage collector freezes the process' },
            { cause: 'Missing DB index', desc: 'Full table scans on large tables' },
            { cause: 'Network retries', desc: 'Timeout + retry doubles latency' },
            { cause: 'Noisy neighbors', desc: 'Shared infra means unpredictable performance' },
          ].map((c, i) => (
            <motion.div
              key={c.cause}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: '#ef444408', border: '1px solid #ef444420',
              }}
            >
              <span style={{ color: '#ef4444', fontWeight: 800, fontSize: 16 }}>!</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{c.cause}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <InteractiveDemo title="Tail Killer" instruction="Apply fixes one by one and watch P99 drop from 5000ms to 250ms.">
          <TailKiller />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 7: Hindi Explainer --- */}
      <SectionBlock title="Summary" icon="📖" color="#ff9933">
        <Neuron
          mood="happy"
          message="You now understand why averages lie, what percentiles really measure, how P99 impacts real users, how to set SLAs, and how to hunt down tail latency. This is essential knowledge for building reliable systems at scale."
          typed
        />
        <div style={{ marginTop: 20 }}>
          <HindiExplainer
            concept="परसेंटाइल और SLA"
            english="Latency Percentiles & SLAs"
            explanation="Average भरोसेमंद नहीं है — ये outliers छुपा देता है। P99 मतलब 99% requests इससे तेज़ हैं। अगर P99 = 5 seconds और 10,000 users/hour हैं, तो हर घंटे 100 users को बुरा experience मिलता है। SLA = Service Level Agreement — company की guarantee कि service कितनी reliable होगी।"
            example="सोचो Delhi Metro की average delay 2 min है। लेकिन P99 = 30 min मतलब हर 100 में से 1 बार 30 min late होगी। अगर तुम रोज़ office जाते हो (22 दिन/month), तो महीने में कम से कम 1 बार बहुत late पहुँचोगे। Average 2 min सुनकर लगता है सब ठीक है, लेकिन P99 बताता है असली कहानी!"
            terms={[
              { hindi: 'परसेंटाइल', english: 'Percentile', meaning: 'P99 = 99% values इससे कम हैं' },
              { hindi: 'टेल लेटेंसी', english: 'Tail Latency', meaning: 'सबसे slow requests — P99/P99.9 में दिखती है' },
              { hindi: 'एस.एल.ए.', english: 'SLA', meaning: 'Service Level Agreement — uptime/speed की guarantee' },
              { hindi: 'अपटाइम', english: 'Uptime', meaning: 'Service कितने % समय available रहती है' },
            ]}
          />
        </div>
      </SectionBlock>

    </div>
  )
}
