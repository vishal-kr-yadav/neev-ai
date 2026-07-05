import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 3 — Big O Notation
   Visual-first: growth curves, race animations, operation counters
================================================================ */

// ─── Utility ────────────────────────────────────────────────────
function calcOps(n, type) {
  switch (type) {
    case 'O(1)':       return 1
    case 'O(log n)':   return Math.max(1, Math.round(Math.log2(n)))
    case 'O(n)':       return n
    case 'O(n log n)': return Math.round(n * Math.log2(n))
    case 'O(n²)':      return n * n
    case 'O(2^n)':     return Math.min(n <= 30 ? Math.pow(2, n) : Infinity, 1e15)
    default:           return 0
  }
}

function fmtNum(x) {
  if (x >= 1e12) return (x / 1e12).toFixed(1) + 'T'
  if (x >= 1e9)  return (x / 1e9).toFixed(1) + 'B'
  if (x >= 1e6)  return (x / 1e6).toFixed(2) + 'M'
  if (x >= 1e3)  return (x / 1e3).toFixed(1) + 'K'
  return x.toString()
}

function timeEstimate(ops) {
  const opsPerSec = 1e9
  const secs = ops / opsPerSec
  if (!isFinite(ops) || secs > 1e13) return '> age of universe'
  if (secs > 3.15e7 * 1000) return (secs / (3.15e7 * 1000)).toFixed(0) + 'K years'
  if (secs > 3.15e7)        return (secs / 3.15e7).toFixed(1) + ' years'
  if (secs > 86400)         return (secs / 86400).toFixed(1) + ' days'
  if (secs > 3600)          return (secs / 3600).toFixed(1) + ' hrs'
  if (secs > 60)            return (secs / 60).toFixed(1) + ' min'
  if (secs > 1)             return secs.toFixed(2) + 's'
  if (secs > 1e-3)          return (secs * 1e3).toFixed(1) + 'ms'
  return (secs * 1e6).toFixed(1) + 'µs'
}

const BIG_O_META = [
  { label: 'O(1)',       color: '#10b981', grade: 'Excellent', icon: '⚡' },
  { label: 'O(log n)',   color: '#22d3ee', grade: 'Great',     icon: '🎯' },
  { label: 'O(n)',       color: '#6366f1', grade: 'Good',      icon: '✅' },
  { label: 'O(n log n)', color: '#f59e0b', grade: 'Fair',      icon: '⚠️' },
  { label: 'O(n²)',      color: '#ef4444', grade: 'Slow',      icon: '🐌' },
  { label: 'O(2^n)',     color: '#7c3aed', grade: 'Terrible',  icon: '💀' },
]

// ─── Section 1: The Race ────────────────────────────────────────
function TheRace() {
  const [n, setN] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const animRef = useRef(null)

  const BOOK_SIZE = 1000
  const linearSteps = BOOK_SIZE
  const binarySteps = Math.ceil(Math.log2(BOOK_SIZE))

  useEffect(() => {
    if (!running) return
    let start = null
    const duration = 3200

    const tick = (ts) => {
      if (!start) start = ts
      const pct = Math.min((ts - start) / duration, 1)
      setN(pct)
      if (pct < 1) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        setRunning(false)
        setDone(true)
      }
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [running])

  const reset = () => { setN(0); setRunning(false); setDone(false) }
  const start = () => { reset(); setTimeout(() => setRunning(true), 50) }

  // Linear: position is linear with time
  const linearPct = Math.min(n * 100, 100)
  // Binary: reaches 100% very quickly (log scale)
  const binaryPct = Math.min(n > 0 ? (Math.log(n * 10 + 1) / Math.log(11)) * 100 : 0, 100)

  const linearStepsNow = Math.round(n * linearSteps)
  const binaryStepsNow = Math.round(n * binarySteps)

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Phone book: <strong style={{ color: 'var(--text-primary)' }}>1,000 pages</strong>. Find the name "Zara Khan".
        </div>
      </div>

      {/* Algorithm cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {[
          {
            label: 'Solution A — Linear Search',
            icon: '📖',
            desc: 'Check every single page from page 1 to 1000',
            color: '#ef4444',
            bigO: 'O(n)',
            steps: linearSteps,
            stepsNow: linearStepsNow,
            pct: linearPct,
          },
          {
            label: 'Solution B — Binary Search',
            icon: '🎯',
            desc: 'Open to middle → eliminate half → repeat',
            color: '#10b981',
            bigO: 'O(log n)',
            steps: binarySteps,
            stepsNow: binaryStepsNow,
            pct: binaryPct,
          },
        ].map((sol) => (
          <motion.div
            key={sol.label}
            style={{
              background: 'var(--bg-card)',
              border: `2px solid ${sol.color}33`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{sol.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{sol.label}</div>
                <div style={{
                  display: 'inline-block', marginTop: 2, padding: '2px 10px',
                  borderRadius: 20, background: sol.color + '20', color: sol.color,
                  fontSize: 12, fontWeight: 700,
                }}>{sol.bigO}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{sol.desc}</div>

            {/* Progress track */}
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 12, height: 22,
              position: 'relative', overflow: 'hidden', marginBottom: 8,
            }}>
              <motion.div
                animate={{ width: sol.pct + '%' }}
                transition={{ ease: 'linear' }}
                style={{
                  height: '100%', borderRadius: 12,
                  background: `linear-gradient(90deg, ${sol.color}cc, ${sol.color})`,
                }}
              />
              {/* Finish line */}
              {sol.pct >= 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 14,
                  }}
                >🏁</motion.div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Steps: <strong style={{ color: sol.color }}>{fmtNum(sol.stepsNow)}</strong></span>
              <span style={{ color: 'var(--text-secondary)' }}>Max: <strong>{fmtNum(sol.steps)}</strong></span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          onClick={start} disabled={running}
          style={{
            padding: '12px 32px', borderRadius: 30, border: 'none', cursor: running ? 'not-allowed' : 'pointer',
            background: running ? '#6366f150' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
          }}
        >
          {running ? '⏳ Racing...' : done ? '🔄 Race Again' : '🏁 Start Race'}
        </motion.button>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginTop: 24, padding: 20, borderRadius: 16,
              background: 'linear-gradient(135deg, #10b98115, #22d3ee10)',
              border: '2px solid #10b98133', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#10b981', marginBottom: 6 }}>
              Binary Search wins by 100x!
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Linear Search: <strong style={{ color: '#ef4444' }}>{linearSteps} steps</strong> &nbsp;|&nbsp;
              Binary Search: <strong style={{ color: '#10b981' }}>{binarySteps} steps</strong>
            </div>
            <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              For 1 million pages? Linear = 1,000,000 steps. Binary = only <strong style={{ color: '#10b981' }}>20 steps</strong>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section 2: Growth Curves Visualizer ───────────────────────
function GrowthCurves() {
  const [nIdx, setNIdx] = useState(2)
  const nValues = [10, 50, 100, 500, 1000, 5000, 10000, 100000]
  const n = nValues[nIdx]

  const W = 560
  const H = 260
  const PAD = { top: 16, right: 20, bottom: 36, left: 52 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const classes = BIG_O_META.filter(m => m.label !== 'O(2^n)')
  const nRange = Array.from({ length: 60 }, (_, i) => Math.round((n / 60) * (i + 1)))
  const maxOps = Math.max(...nRange.map(x => calcOps(x, 'O(n²)')))

  function toSvgX(x) { return PAD.left + (x / n) * plotW }
  function toSvgY(y) {
    const clamped = Math.min(y, maxOps)
    return PAD.top + plotH - (clamped / maxOps) * plotH
  }

  function buildPath(label) {
    const pts = nRange.map(x => {
      const ops = calcOps(x, label)
      return `${toSvgX(x).toFixed(1)},${toSvgY(ops).toFixed(1)}`
    })
    return 'M' + pts.join('L')
  }

  // Table values
  const tableN = [10, 100, 1000, 10000]

  return (
    <div>
      {/* Slider */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
          Drag to set <strong style={{ color: 'var(--text-primary)' }}>n = {n.toLocaleString()}</strong> items
        </div>
        <input
          type="range" min={0} max={nValues.length - 1} value={nIdx}
          onChange={e => setNIdx(+e.target.value)}
          style={{ width: '100%', maxWidth: 420, accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 420, margin: '4px auto 0', fontSize: 11, color: 'var(--text-secondary)' }}>
          {nValues.map(v => <span key={v}>{v >= 1000 ? v / 1000 + 'K' : v}</span>)}
        </div>
      </div>

      {/* SVG graph */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', margin: '0 auto' }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(f => (
            <g key={f}>
              <line
                x1={PAD.left} x2={PAD.left + plotW}
                y1={PAD.top + plotH * (1 - f)} y2={PAD.top + plotH * (1 - f)}
                stroke="var(--border)" strokeDasharray="4,4" strokeWidth={1}
              />
              <text
                x={PAD.left - 6} y={PAD.top + plotH * (1 - f) + 4}
                fontSize={9} fill="var(--text-secondary)" textAnchor="end"
              >{fmtNum(Math.round(maxOps * f))}</text>
            </g>
          ))}

          {/* Axes */}
          <line x1={PAD.left} x2={PAD.left + plotW} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--border)" strokeWidth={1.5} />

          {/* X-axis label */}
          <text x={PAD.left + plotW / 2} y={H - 4} fontSize={10} fill="var(--text-secondary)" textAnchor="middle">n (input size)</text>

          {/* Curves */}
          {classes.map(({ label, color }) => (
            <motion.path
              key={label}
              d={buildPath(label)}
              fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          ))}

          {/* Legend dots at end of curves */}
          {classes.map(({ label, color }) => {
            const lastX = nRange[nRange.length - 1]
            const lastY = calcOps(lastX, label)
            return (
              <g key={label + '-dot'}>
                <circle cx={toSvgX(lastX)} cy={toSvgY(lastY)} r={4} fill={color} />
                <rect
                  x={toSvgX(lastX) - 28} y={toSvgY(lastY) - 18}
                  width={56} height={14} rx={7} fill={color + '22'}
                />
                <text x={toSvgX(lastX)} y={toSvgY(lastY) - 7} fontSize={9} fill={color} textAnchor="middle" fontWeight="bold">
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Operation count table */}
      <div style={{ marginTop: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>Complexity</th>
              {tableN.map(v => (
                <th key={v} style={{
                  padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600,
                  background: v === n ? 'var(--accent)10' : 'transparent',
                }}>n = {v.toLocaleString()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BIG_O_META.map(({ label, color, icon }) => (
              <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, background: color + '18', color,
                    fontWeight: 700, fontSize: 12,
                  }}>{label}</span>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                </td>
                {tableN.map(v => {
                  const ops = calcOps(v, label)
                  return (
                    <td key={v} style={{
                      padding: '10px 12px', textAlign: 'right',
                      color: ops > 1e10 ? '#ef4444' : ops > 1e6 ? '#f59e0b' : '#10b981',
                      fontWeight: 600, fontSize: 13,
                      background: v === n ? color + '08' : 'transparent',
                    }}>
                      {fmtNum(ops)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Section 3: Identify the Big O ─────────────────────────────
const QUIZ_SNIPPETS = [
  {
    code: 'return arr[0]',
    answer: 'O(1)',
    hint: 'One operation, no matter how big the array is.',
    pattern: 'constant',
    visualSteps: 1,
    explanation: 'Direct array access — always exactly 1 step.',
  },
  {
    code: 'for (item in arr):\n  print(item)',
    answer: 'O(n)',
    hint: 'You visit each element once, so steps grow with n.',
    pattern: 'linear',
    visualSteps: 'n',
    explanation: 'One loop through the array = n steps for n items.',
  },
  {
    code: 'for i in arr:\n  for j in arr:\n    check(i, j)',
    answer: 'O(n²)',
    hint: 'Every element is compared to every other element.',
    pattern: 'quadratic',
    visualSteps: 'n²',
    explanation: 'Nested loops — for each of n items, you do n more operations.',
  },
  {
    code: 'low, high = 0, len(arr)\nwhile low <= high:\n  mid = (low+high)//2\n  low = mid + 1  # or high = mid - 1',
    answer: 'O(log n)',
    hint: 'The search space halves every step.',
    pattern: 'logarithmic',
    visualSteps: 'log n',
    explanation: 'Array halves each step: 1000→500→250→125→... done in ~10 steps.',
  },
  {
    code: 'arr.sort()\nresult = binary_search(arr, x)',
    answer: 'O(n log n)',
    hint: 'Sorting is O(n log n), then binary search is O(log n).',
    pattern: 'n-log-n',
    visualSteps: 'n·log n',
    explanation: 'Sort dominates: O(n log n) + O(log n) = O(n log n).',
  },
  {
    code: 'def subsets(arr):\n  if len(arr) == 0: return [[]]\n  rest = subsets(arr[1:])\n  return rest + [s+[arr[0]] for s in rest]',
    answer: 'O(2^n)',
    hint: 'Every element can either be in or out of a subset.',
    pattern: 'exponential',
    visualSteps: '2^n',
    explanation: 'n=10 → 1,024 subsets. n=30 → 1,073,741,824 subsets!',
  },
]

const CHOICES = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)']

function PatternViz({ pattern, n = 6 }) {
  const cells = Array.from({ length: n })
  const pairs = []
  if (pattern === 'quadratic') {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) pairs.push([i, j])
  }

  if (pattern === 'constant') return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {cells.map((_, i) => (
        <motion.div key={i}
          style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? '#10b981' : 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? 'white' : 'var(--text-secondary)' }}
          animate={i === 0 ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >{i === 0 ? '★' : i}</motion.div>
      ))}
      <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginLeft: 4 }}>1 step</span>
    </div>
  )

  if (pattern === 'linear') return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {cells.map((_, i) => (
        <motion.div key={i}
          initial={{ background: 'var(--bg-secondary)' }}
          animate={{ background: ['var(--bg-secondary)', '#6366f1', 'var(--bg-secondary)'] }}
          transition={{ delay: i * 0.18, duration: 0.4, repeat: Infinity, repeatDelay: n * 0.18 }}
          style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}
        >{i + 1}</motion.div>
      ))}
      <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, marginLeft: 4 }}>n steps</span>
    </div>
  )

  if (pattern === 'quadratic') return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 24px)`, gap: 3 }}>
        {pairs.slice(0, n * n).map(([i, j], idx) => (
          <motion.div key={idx}
            animate={{ background: ['#ef444420', '#ef4444', '#ef444420'] }}
            transition={{ delay: (i * n + j) * 0.04, duration: 0.3, repeat: Infinity, repeatDelay: n * n * 0.04 }}
            style={{ width: 24, height: 24, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#ef4444', fontWeight: 700 }}
          >{i},{j}</motion.div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, marginTop: 6 }}>n² = {n * n} steps (n={n})</div>
    </div>
  )

  if (pattern === 'logarithmic') {
    const steps = []
    let lo = 0, hi = 31
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      steps.push({ lo, hi, mid })
      hi = mid - 1
    }
    return (
      <div>
        <div style={{ position: 'relative', height: 40, background: 'var(--bg-secondary)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
          {steps.map((s, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: idx * 0.5, duration: 0.4, repeat: Infinity, repeatDelay: steps.length * 0.5 }}
              style={{
                position: 'absolute', top: 4, bottom: 4,
                left: (s.lo / 32) * 100 + '%',
                width: ((s.hi - s.lo + 1) / 32) * 100 + '%',
                background: '#22d3ee40', borderRadius: 8,
                border: '2px solid #22d3ee',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#22d3ee',
              }}
            >half {idx + 1}</motion.div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#22d3ee', fontWeight: 700 }}>{steps.length} steps to find in 32 items</div>
      </div>
    )
  }

  if (pattern === 'n-log-n') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[0, 1, 2].map(phase => (
        <motion.div key={phase}
          animate={{ x: [0, 4, 0] }}
          transition={{ delay: phase * 0.3, repeat: Infinity, duration: 1.5 }}
          style={{ display: 'flex', gap: 4 }}
        >
          {cells.slice(0, Math.max(1, n - phase * 2)).map((_, i) => (
            <div key={i} style={{ width: 22, height: 16, borderRadius: 4, background: '#f59e0b' + (phase === 0 ? '40' : phase === 1 ? '70' : 'cc'), border: '1px solid #f59e0b44' }} />
          ))}
          <span style={{ fontSize: 10, color: '#f59e0b', alignSelf: 'center', marginLeft: 4 }}>pass {phase + 1}</span>
        </motion.div>
      ))}
      <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>n · log n steps</div>
    </div>
  )

  if (pattern === 'exponential') {
    const rows = [1, 2, 4, 8]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map((count, i) => (
          <motion.div key={i}
            style={{ display: 'flex', gap: 3 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ delay: i * 0.3, repeat: Infinity, duration: 1.2 }}
          >
            {Array.from({ length: count }).map((_, j) => (
              <div key={j} style={{ width: 16, height: 16, borderRadius: 4, background: '#7c3aed' + (30 + i * 20).toString(16) + 'cc', border: '1px solid #7c3aed44' }} />
            ))}
            <span style={{ fontSize: 10, color: '#7c3aed80', alignSelf: 'center', marginLeft: 4 }}>2^{i} = {count}</span>
          </motion.div>
        ))}
        <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700 }}>EXPONENTIAL: doubles every step</div>
      </div>
    )
  }
  return null
}

function IdentifyBigO() {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const snap = QUIZ_SNIPPETS[idx]

  const handleAnswer = (choice) => {
    if (selected !== null) return
    setSelected(choice)
    if (choice === snap.answer) setScore(s => s + 1)
  }

  const next = () => {
    if (idx >= QUIZ_SNIPPETS.length - 1) {
      setFinished(true)
    } else {
      setIdx(i => i + 1)
      setSelected(null)
    }
  }

  const reset = () => { setIdx(0); setSelected(null); setScore(0); setFinished(false) }

  if (finished) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: 32 }}
    >
      <div style={{ fontSize: 56, marginBottom: 12 }}>
        {score === 6 ? '🏆' : score >= 4 ? '🎉' : '💪'}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        {score} / {QUIZ_SNIPPETS.length} Correct
      </div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>
        {score === 6 ? 'Perfect! You can read Big O at a glance.' : score >= 4 ? 'Great work! Review the ones you missed.' : 'Keep practicing — this skill is crucial!'}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
        onClick={reset}
        style={{ padding: '12px 32px', borderRadius: 30, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'inherit' }}
      >Try Again</motion.button>
    </motion.div>
  )

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {QUIZ_SNIPPETS.map((_, i) => (
          <div key={i} style={{
            height: 6, flex: 1, borderRadius: 3,
            background: i < idx ? '#10b981' : i === idx ? 'var(--accent)' : 'var(--bg-secondary)',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Question {idx + 1} of {QUIZ_SNIPPETS.length} &nbsp;·&nbsp; Score: <strong style={{ color: '#10b981' }}>{score}</strong>
      </div>

      {/* Code */}
      <div style={{
        background: '#0f172a', borderRadius: 16, padding: '20px 24px', marginBottom: 20,
        fontFamily: 'monospace', fontSize: 14, color: '#e2e8f0', lineHeight: 1.9,
        border: '1px solid #334155', whiteSpace: 'pre',
      }}>
        {snap.code}
      </div>

      {/* Pattern visual */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 20px', marginBottom: 20,
        minHeight: 72,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Execution Pattern
        </div>
        <PatternViz pattern={snap.pattern} />
      </div>

      {/* Choices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {CHOICES.map(c => {
          const meta = BIG_O_META.find(m => m.label === c)
          const isCorrect = c === snap.answer
          const isSelected = c === selected
          let bg = 'var(--bg-secondary)'
          let border = '2px solid var(--border)'
          let color = 'var(--text-primary)'
          if (selected !== null) {
            if (isCorrect) { bg = '#10b98120'; border = '2px solid #10b981'; color = '#10b981' }
            else if (isSelected) { bg = '#ef444420'; border = '2px solid #ef4444'; color = '#ef4444' }
          } else if (isSelected) {
            bg = meta.color + '20'; border = `2px solid ${meta.color}`; color = meta.color
          }
          return (
            <motion.button
              key={c}
              whileHover={selected === null ? { scale: 1.04 } : {}}
              whileTap={selected === null ? { scale: 0.97 } : {}}
              onClick={() => handleAnswer(c)}
              style={{
                padding: '12px 8px', borderRadius: 12, border, cursor: selected === null ? 'pointer' : 'default',
                background: bg, color, fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 16 }}>{meta.icon}</span>
              {c}
              {selected !== null && isCorrect && <span>✓</span>}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              padding: '16px 20px', borderRadius: 14, marginBottom: 16,
              background: selected === snap.answer ? '#10b98115' : '#ef444415',
              border: `1px solid ${selected === snap.answer ? '#10b98133' : '#ef444433'}`,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: selected === snap.answer ? '#10b981' : '#ef4444' }}>
              {selected === snap.answer ? '✓ Correct!' : `✗ Not quite. Answer: ${snap.answer}`}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{snap.explanation}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {selected !== null && (
        <div style={{ textAlign: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={next}
            style={{ padding: '12px 32px', borderRadius: 30, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'inherit' }}
          >
            {idx >= QUIZ_SNIPPETS.length - 1 ? 'See Results →' : 'Next Question →'}
          </motion.button>
        </div>
      )}
    </div>
  )
}

// ─── Section 4: Operations Counter ─────────────────────────────
function OperationsCounter() {
  const [inputN, setInputN] = useState('1000')
  const n = Math.max(1, Math.min(1e7, parseInt(inputN) || 1000))

  const presets = [10, 100, 1000, 10000, 1000000, 10000000]

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 14 }}>Array size n =</label>
        <input
          type="number"
          value={inputN}
          onChange={e => setInputN(e.target.value)}
          style={{
            padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontSize: 16, fontWeight: 700, width: 140, fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {presets.map(p => (
          <motion.button
            key={p}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => setInputN(p.toString())}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)',
              background: n === p ? 'var(--accent)' : 'var(--bg-secondary)',
              color: n === p ? 'white' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {p >= 1e6 ? p / 1e6 + 'M' : p >= 1e3 ? p / 1e3 + 'K' : p}
          </motion.button>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {BIG_O_META.map(({ label, color, icon, grade }) => {
          const ops = calcOps(n, label)
          const t = timeEstimate(ops)
          const isHuge = ops > 1e9
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'var(--bg-card)', border: `2px solid ${color}33`,
                borderRadius: 18, padding: 20,
                boxShadow: isHuge ? `0 0 20px ${color}22` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, background: color + '20', color,
                  fontWeight: 700, fontSize: 13,
                }}>{label}</span>
                <span style={{ fontSize: 20 }}>{icon}</span>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Operations</div>
                <div style={{
                  fontSize: isHuge ? 18 : 22, fontWeight: 800, color,
                  fontFamily: 'monospace',
                }}>
                  {ops === Infinity ? '∞' : ops > 1e12 ? ops.toExponential(1) : ops.toLocaleString()}
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Time @ 1B ops/sec</div>
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  color: isHuge ? '#ef4444' : '#10b981',
                }}>{t}</div>
              </div>

              <div style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: color + '15', color,
                display: 'inline-block',
              }}>{grade}</div>
            </motion.div>
          )
        })}
      </div>

      {/* The shocking fact */}
      {n >= 1000 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: 20, padding: 20, borderRadius: 16,
            background: 'linear-gradient(135deg, #7c3aed15, #ef444415)',
            border: '2px solid #ef444433',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16, color: '#ef4444', marginBottom: 6 }}>
            The Shocking Truth for n = {n.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
            O(n²) requires <strong style={{ color: '#ef4444' }}>{(n * n).toLocaleString()} operations</strong> —
            that takes <strong style={{ color: '#ef4444' }}>{timeEstimate(n * n)}</strong> at 1 billion ops/sec.
            <br />
            O(n log n) requires only <strong style={{ color: '#f59e0b' }}>{calcOps(n, 'O(n log n)').toLocaleString()} operations</strong> —
            just <strong style={{ color: '#10b981' }}>{timeEstimate(calcOps(n, 'O(n log n)'))}</strong>.
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Section 5: Space Complexity ───────────────────────────────
function SpaceComplexity() {
  const [n, setN] = useState(8)
  const [view, setView] = useState('O(1)')

  const spaceMeta = [
    {
      label: 'O(1)',
      color: '#10b981',
      title: 'Constant Space',
      icon: '📍',
      desc: 'Uses 1 variable regardless of input size. Most efficient.',
      example: 'Find max in array: just keep one variable `max`.',
      blocks: 1,
    },
    {
      label: 'O(log n)',
      color: '#22d3ee',
      title: 'Logarithmic Space',
      icon: '📉',
      desc: 'Uses log(n) memory — call stack in recursive binary search.',
      example: 'Recursive binary search: log(n) stack frames.',
      blocks: Math.ceil(Math.log2(n)),
    },
    {
      label: 'O(n)',
      color: '#6366f1',
      title: 'Linear Space',
      icon: '📊',
      desc: 'Creates a full copy of the input. Doubles your memory.',
      example: 'Copy an array: you need n more memory slots.',
      blocks: n,
    },
    {
      label: 'O(n²)',
      color: '#ef4444',
      title: 'Quadratic Space',
      icon: '🗃️',
      desc: 'A 2D grid/matrix of size n×n. Dangerous for large n.',
      example: 'Adjacency matrix for n nodes: n² memory cells.',
      blocks: n * n,
    },
  ]

  const current = spaceMeta.find(s => s.label === view)
  const maxBlocks = n * n

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Array size n =</span>
        <input
          type="range" min={4} max={16} value={n} onChange={e => setN(+e.target.value)}
          style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: 140 }}
        />
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: 20 }}>{n}</span>
      </div>

      {/* Space class tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {spaceMeta.map(s => (
          <motion.button
            key={s.label}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setView(s.label)}
            style={{
              padding: '8px 16px', borderRadius: 20, border: `2px solid ${s.color}44`,
              background: view === s.label ? s.color : 'var(--bg-secondary)',
              color: view === s.label ? 'white' : s.color,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {s.icon} {s.label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Info panel */}
        <div style={{
          background: 'var(--bg-card)', border: `2px solid ${current.color}33`,
          borderRadius: 18, padding: 24,
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>{current.icon}</div>
          <div style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            background: current.color + '20', color: current.color,
            fontWeight: 700, fontSize: 13, marginBottom: 12,
          }}>{current.label} Space</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>{current.title}</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{current.desc}</div>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px',
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Example:</strong> {current.example}
          </div>
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: current.color }}>
            Memory blocks used: {current.blocks}
          </div>
        </div>

        {/* Memory visualization */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 18, padding: 24,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
            Memory Grid
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 4,
            maxHeight: 220, overflow: 'hidden',
          }}>
            {Array.from({ length: Math.min(maxBlocks, 256) }, (_, i) => {
              const used = i < current.blocks
              return (
                <motion.div
                  key={i}
                  animate={{
                    background: used ? current.color : 'var(--bg-secondary)',
                    scale: used ? 1 : 0.85,
                  }}
                  transition={{ duration: 0.3, delay: used ? Math.min(i * 0.01, 0.3) : 0 }}
                  style={{
                    width: 14, height: 14, borderRadius: 3,
                    border: `1px solid ${used ? current.color + '44' : 'var(--border)'}`,
                  }}
                />
              )
            })}
            {current.blocks > 256 && (
              <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, padding: '4px 8px' }}>
                +{(current.blocks - 256).toLocaleString()} more blocks!
              </div>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{
              display: 'inline-block', width: 12, height: 12, borderRadius: 3,
              background: current.color, marginRight: 6, verticalAlign: 'middle',
            }} />
            Used: {current.blocks} &nbsp;&nbsp;
            <span style={{
              display: 'inline-block', width: 12, height: 12, borderRadius: 3,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginRight: 6, verticalAlign: 'middle',
            }} />
            Free
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 6: Big O Cheat Sheet ──────────────────────────────
const CHEATSHEET = [
  {
    label: 'O(1)',
    name: 'Constant',
    icon: '⚡',
    color: '#10b981',
    analogy: 'Looking up your name in your own contact card',
    examples: ['Array access arr[i]', 'Hash map lookup', 'Stack push/pop'],
    grade: 'S',
    gradeColor: '#10b981',
  },
  {
    label: 'O(log n)',
    name: 'Logarithmic',
    icon: '🎯',
    color: '#22d3ee',
    analogy: 'Opening a dictionary to the middle and halving',
    examples: ['Binary search', 'BST insert/find', 'Heap operations'],
    grade: 'A',
    gradeColor: '#22d3ee',
  },
  {
    label: 'O(n)',
    name: 'Linear',
    icon: '📏',
    color: '#6366f1',
    analogy: 'Reading every page of a book once',
    examples: ['Linear search', 'Array traversal', 'Linked list access'],
    grade: 'B',
    gradeColor: '#6366f1',
  },
  {
    label: 'O(n log n)',
    name: 'Linearithmic',
    icon: '📊',
    color: '#f59e0b',
    analogy: 'Sorting a deck of cards by dividing and merging',
    examples: ['Merge Sort', 'Quick Sort (avg)', 'Heap Sort'],
    grade: 'C',
    gradeColor: '#f59e0b',
  },
  {
    label: 'O(n²)',
    name: 'Quadratic',
    icon: '🐌',
    color: '#ef4444',
    analogy: 'Comparing every person in a room with every other person',
    examples: ['Bubble Sort', 'Selection Sort', 'Nested loops'],
    grade: 'D',
    gradeColor: '#ef4444',
  },
  {
    label: 'O(2^n)',
    name: 'Exponential',
    icon: '💀',
    color: '#7c3aed',
    analogy: 'Trying every possible on/off combination for n light switches',
    examples: ['All subsets', 'Naive Fibonacci', 'Brute-force passwords'],
    grade: 'F',
    gradeColor: '#7c3aed',
  },
]

function CheatSheet() {
  const [flipped, setFlipped] = useState(null)

  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, textAlign: 'center' }}>
        Click a card to flip it and see details
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {CHEATSHEET.map((item, i) => {
          const isFlipped = flipped === i
          return (
            <motion.div
              key={item.label}
              onClick={() => setFlipped(isFlipped ? null : i)}
              whileHover={{ y: -4, boxShadow: `0 12px 32px ${item.color}33` }}
              style={{
                background: 'var(--bg-card)',
                border: `2px solid ${item.color}44`,
                borderRadius: 22, padding: 24, cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                transition: 'box-shadow 0.2s',
                minHeight: 200,
              }}
            >
              {/* Grade badge */}
              <div style={{
                position: 'absolute', top: 14, right: 14,
                width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, ${item.gradeColor}, ${item.gradeColor}cc)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 18, color: 'white',
                boxShadow: `0 4px 12px ${item.color}44`,
              }}>
                {item.grade}
              </div>

              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{item.icon}</div>
                    <div style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: 20,
                      background: item.color + '20', color: item.color,
                      fontWeight: 800, fontSize: 16, marginBottom: 8,
                    }}>{item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 10 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{item.analogy}"
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20,
                        background: item.color + '20', color: item.color,
                        fontWeight: 800, fontSize: 14,
                      }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Real Algorithms
                    </div>
                    {item.examples.map((ex, j) => (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                        fontSize: 13, color: 'var(--text-primary)',
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: item.color, flexShrink: 0,
                        }} />
                        {ex}
                      </div>
                    ))}
                    <div style={{
                      marginTop: 12, padding: '8px 12px', borderRadius: 10,
                      background: item.color + '10', fontSize: 12, color: item.color, lineHeight: 1.5,
                    }}>
                      {item.label === 'O(1)' && 'n=1M → 1 op'}
                      {item.label === 'O(log n)' && 'n=1M → ~20 ops'}
                      {item.label === 'O(n)' && 'n=1M → 1,000,000 ops'}
                      {item.label === 'O(n log n)' && 'n=1M → ~20M ops'}
                      {item.label === 'O(n²)' && 'n=1M → 1,000,000,000,000 ops!'}
                      {item.label === 'O(2^n)' && 'n=30 → 1,073,741,824 ops!'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Export ─────────────────────────────────────────────────
export default function Topic3Content() {
  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #f59e0b18, #ef444412, #6366f108)',
          border: '1px solid #f59e0b22',
          borderRadius: 24, padding: '32px 36px', marginBottom: 36,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 12 }}>⏱️</div>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 34, fontWeight: 900,
          color: 'var(--text-primary)', marginBottom: 10,
        }}>
          Big O Notation
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          Is your solution fast or slow?<br />
          <strong style={{ color: 'var(--text-primary)' }}>This simple math tells you — before you even run it.</strong>
        </p>
      </motion.div>

      {/* Neuron intro */}
      <div style={{ marginBottom: 36 }}>
        <Neuron
          mood="explaining"
          size="medium"
          message="Big O is not about measuring exact seconds — it's about understanding HOW your algorithm scales. Does doubling the input double the work? Or does it quadruple it? That's the question Big O answers. And it's the #1 thing tech interviewers test."
        />
      </div>

      {/* ── Section 1: The Race ── */}
      <SectionBlock icon="🏁" title="The Race" color="#6366f1">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
          Two algorithms solve the same problem: find a name in a 1,000-page phone book.
          One checks every page. The other uses a smarter strategy. Watch them race.
        </p>
        <InteractiveDemo title="Algorithm Race" instruction="Hit Start Race and watch how the strategies diverge">
          <TheRace />
        </InteractiveDemo>

        <NeuronTip type="tip">
          This difference — 1,000 steps vs 10 steps — is exactly what Big O captures.
          For 1 million entries it becomes 1,000,000 vs 20. The gap only grows.
        </NeuronTip>

        <HindiExplainer
          concept="Big O क्या है?"
          english="What is Big O?"
          explanation="मान लो तुम्हारे पास 1000 pages की phone book है और तुम्हें 'Zara Khan' खोजना है। Solution A हर page check करेगा — 1000 steps। Solution B बीच में खोलेगा, आधा छोड़ेगा, फिर बीच में खोलेगा — सिर्फ 10 steps! Big O यही बताता है: जब n बड़ा होता है, तो कितने steps चाहिए?"
          example="जैसे किसी library में book ढूंढना: हर shelf check करना (linear) vs. alphabetical order में जाना (binary) — दोनों काम करते हैं, पर speed बहुत अलग है!"
          terms={[
            { hindi: 'समय जटिलता', english: 'Time Complexity', meaning: 'Algorithm कितने steps लेता है' },
            { hindi: 'O(n)', english: 'Linear', meaning: 'n items के लिए n steps' },
            { hindi: 'O(log n)', english: 'Logarithmic', meaning: 'n items के लिए सिर्फ log(n) steps' },
          ]}
        />
      </SectionBlock>

      {/* ── Section 2: Growth Curves ── */}
      <SectionBlock icon="📈" title="Growth Curves Visualizer" color="#22d3ee">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
          The real power of Big O is in seeing how different complexities diverge as n grows.
          Drag the slider from small n to large n and watch the gap explode.
        </p>
        <InteractiveDemo title="Growth Curves" instruction="Drag the slider — watch O(n²) and O(2^n) become catastrophically slow">
          <GrowthCurves />
        </InteractiveDemo>

        <NeuronTip type="fun">
          O(1) and O(log n) are the "holy grail" of algorithms. O(n) is acceptable. O(n²) is a red flag.
          O(2^n) means your algorithm literally cannot scale — n=100 would take longer than the age of the universe.
        </NeuronTip>

        <HindiExplainer
          concept="Growth Curves"
          english="How complexities diverge"
          explanation="जब n छोटा है, सब complexities similar लगती हैं। लेकिन जब n बड़ा होता है — O(n²) और O(2^n) बहुत आगे निकल जाते हैं। यही graph दिखाता है कि algorithm का choice क्यों important है।"
          example="O(n²) के लिए n=1000 means 10 lakh operations। O(n log n) के लिए सिर्फ 10,000 operations! यही difference production में crash और success का होता है।"
          terms={[
            { hindi: 'रेखीय', english: 'Linear', meaning: 'सीधी रेखा — O(n)' },
            { hindi: 'लघुगणकीय', english: 'Logarithmic', meaning: 'धीरे बढ़ता — O(log n)' },
            { hindi: 'द्विघात', english: 'Quadratic', meaning: 'तेजी से बढ़ता — O(n²)' },
          ]}
        />
      </SectionBlock>

      {/* ── Section 3: Identify Big O ── */}
      <SectionBlock icon="🔍" title="Identify the Big O" color="#f59e0b">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
          Given a code snippet, can you identify its complexity?
          This is exactly what happens in coding interviews. Study the pattern, then pick.
        </p>
        <InteractiveDemo title="Big O Quiz" instruction="Read the pseudo-code, study the execution pattern, then pick the correct complexity">
          <IdentifyBigO />
        </InteractiveDemo>

        <NeuronTip type="try">
          The trick: count how many times the core work happens. One loop = O(n). Loop inside loop = O(n²).
          Halving each step = O(log n). Look for the DOMINANT term — constants and small terms drop away.
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 4: Operations Counter ── */}
      <SectionBlock icon="🔢" title="The Operations Counter" color="#ef4444">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
          Let's make this concrete. Enter any array size and see the exact operations needed —
          plus how long it would actually take at 1 billion operations per second.
        </p>
        <InteractiveDemo title="Operations Counter" instruction="Enter an array size or click a preset — then feel the difference">
          <OperationsCounter />
        </InteractiveDemo>

        <NeuronTip type="warning">
          Try n = 1,000,000. O(n²) requires a TRILLION operations — that's 31 years at 1 billion ops/sec.
          O(n log n) does it in 20 milliseconds. The algorithm you choose can be the difference between
          a feature working and a server catching fire.
        </NeuronTip>

        <HindiExplainer
          concept="Operations Counter"
          english="Why operation count matters"
          explanation="n=1,000,000 के लिए: O(n²) = 1 trillion operations = 31 years! लेकिन O(n log n) = सिर्फ 20 milliseconds! यही reason है कि companies interviews में Big O पूछती हैं — एक wrong algorithm choice पूरे system को crash कर सकती है।"
          example="Amazon के warehouse में 1 crore products हैं। अगर search algorithm O(n²) है, तो हर search में घंटों लगेंगे। O(log n) से सिर्फ 27 steps!"
          terms={[
            { hindi: 'स्थिर', english: 'Constant', meaning: 'हमेशा same steps — O(1)' },
            { hindi: 'स्थान जटिलता', english: 'Space Complexity', meaning: 'Memory कितनी use होती है' },
          ]}
        />
      </SectionBlock>

      {/* ── Section 5: Space Complexity ── */}
      <SectionBlock icon="🧠" title="Space Complexity" color="#8b5cf6">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
          Big O isn't just about TIME — algorithms also use MEMORY.
          An algorithm can be O(n) fast but O(n²) in memory, which can cause crashes on large inputs.
          Space complexity uses the same notation.
        </p>
        <InteractiveDemo title="Memory Visualizer" instruction="Select a space complexity class and see how much memory it actually uses">
          <SpaceComplexity />
        </InteractiveDemo>

        <NeuronTip type="deep">
          In interviews, always mention BOTH time and space complexity. An algorithm that's O(n log n) time
          but O(n²) space is often worse than O(n²) time with O(1) space — because memory is limited
          and out-of-memory errors crash production.
        </NeuronTip>

        <HindiExplainer
          concept="Space Complexity"
          english="Memory usage of algorithms"
          explanation="Time complexity के साथ-साथ, Space complexity भी important है। O(1) space means algorithm एक ही variable use करता है, चाहे n कितना भी बड़ा हो। O(n) space means पूरी array copy करता है। दोनों को balanced रखना professional engineering है।"
          example="Mobile app में sorting: O(1) space वाला algorithm best है क्योंकि phone की RAM limited है। Server पर अक्सर O(n) space acceptable होता है।"
          terms={[
            { hindi: 'स्थान जटिलता', english: 'Space Complexity', meaning: 'Algorithm कितनी memory use करता है' },
            { hindi: 'इन-प्लेस', english: 'In-place', meaning: 'Extra memory नहीं लेता — O(1) space' },
          ]}
        />
      </SectionBlock>

      {/* ── Section 6: Cheat Sheet ── */}
      <SectionBlock icon="🃏" title="Big O Cheat Sheet" color="#10b981">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
          Your collectible reference cards. Each card has the notation, a real-world analogy, and the
          actual algorithms that use it. Click to flip and see examples.
        </p>
        <CheatSheet />

        <NeuronTip type="example">
          Memorize this order: O(1) — O(log n) — O(n) — O(n log n) — O(n²) — O(2^n).
          In interviews, always aim for the fastest complexity that's practical to implement.
          Sometimes O(n log n) is the best possible — e.g., you can't sort faster than O(n log n)
          using comparison-based algorithms.
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 7: Hindi Summary ── */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी सारांश" color="#ff9933">
        <Neuron
          mood="waving"
          size="medium"
          message="Big O notation सीखना programming की सबसे valuable skill है। अब तुम किसी भी solution देखोगे और तुरंत बोलोगे — यह O(n²) है, यह slow होगा। या यह O(log n) है, यह scale करेगा। यही engineer की असली सोच है!"
        />
        <div style={{ marginTop: 20 }}>
          <HindiExplainer
            concept="Big O Notation — पूरा सारांश"
            english="Complete Big O Summary"
            explanation="Big O एक mathematical notation है जो बताता है कि algorithm की speed और memory usage input size n के साथ कैसे बढ़ती है। यह exact seconds नहीं बताता — यह growth pattern बताता है।"
            example="Phone book race याद है? Linear search = O(n) = 1000 steps for 1000 pages. Binary search = O(log n) = 10 steps for 1000 pages. यही Big O है — 'जैसे-जैसे n बड़ा होता है, steps कैसे बढ़ते हैं?'"
            terms={[
              { hindi: 'समय जटिलता', english: 'Time Complexity', meaning: 'Algorithm कितने steps लेता है' },
              { hindi: 'स्थान जटिलता', english: 'Space Complexity', meaning: 'Algorithm कितनी memory use करता है' },
              { hindi: 'स्थिर', english: 'Constant — O(1)', meaning: 'n बढ़े या घटे, steps same रहते हैं' },
              { hindi: 'रेखीय', english: 'Linear — O(n)', meaning: 'n double होने पर steps भी double' },
              { hindi: 'लघुगणकीय', english: 'Logarithmic — O(log n)', meaning: 'n double होने पर सिर्फ 1 step बढ़ता है' },
              { hindi: 'द्विघात', english: 'Quadratic — O(n²)', meaning: 'n double होने पर steps 4x हो जाते हैं' },
            ]}
          />
        </div>

        {/* Quick recap cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 24 }}>
          {[
            { symbol: 'O(1)', hindi: 'एक ही step', color: '#10b981', icon: '⚡' },
            { symbol: 'O(log n)', hindi: 'आधा-आधा', color: '#22d3ee', icon: '🎯' },
            { symbol: 'O(n)', hindi: 'हर element एक बार', color: '#6366f1', icon: '📏' },
            { symbol: 'O(n log n)', hindi: 'sort + search', color: '#f59e0b', icon: '📊' },
            { symbol: 'O(n²)', hindi: 'हर pair check', color: '#ef4444', icon: '🐌' },
            { symbol: 'O(2^n)', hindi: 'सब possibilities', color: '#7c3aed', icon: '💀' },
          ].map(item => (
            <motion.div
              key={item.symbol}
              whileHover={{ scale: 1.04, y: -2 }}
              style={{
                background: 'var(--bg-card)', border: `2px solid ${item.color}33`,
                borderRadius: 16, padding: '16px 18px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{
                fontWeight: 800, fontSize: 15, color: item.color,
                fontFamily: 'monospace', marginBottom: 6,
              }}>{item.symbol}</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>{item.hindi}</div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Closing Neuron */}
      <div style={{ marginBottom: 16 }}>
        <Neuron
          mood="excited"
          size="medium"
          message="You now think like an engineer! Next up: Bubble Sort — you'll SEE with your own eyes why O(n²) is painfully slow. Those Big O numbers you just learned will finally become real."
        />
      </div>
    </div>
  )
}
