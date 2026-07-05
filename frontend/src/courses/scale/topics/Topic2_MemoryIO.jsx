import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 2 — Memory & I/O Bottlenecks
   RAM, heap, disk, network latency — where your app really spends time
================================================================ */

const LATENCY_LEVELS = [
  { label: 'L1 Cache', ns: 1, human: '1 second', color: '#10b981' },
  { label: 'L2 Cache', ns: 4, human: '4 seconds', color: '#22c55e' },
  { label: 'L3 Cache', ns: 10, human: '10 seconds', color: '#84cc16' },
  { label: 'RAM', ns: 100, human: '1.5 minutes', color: '#eab308' },
  { label: 'SSD', ns: 100000, human: '~1 day', color: '#f97316' },
  { label: 'HDD', ns: 10000000, human: '~4 months', color: '#ef4444' },
  { label: 'Network (same DC)', ns: 500000, human: '~6 days', color: '#dc2626' },
  { label: 'Network (cross-continent)', ns: 150000000, human: '~5 years', color: '#991b1b' },
]

/* ---- Section 1: Latency Comparison Tower ---- */
function LatencyTower() {
  const [revealed, setRevealed] = useState({})
  const maxNs = 150000000

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
        Click each level to see the human-time analogy. If L1 cache took 1 second...
      </p>
      {LATENCY_LEVELS.map((level, i) => {
        const isOpen = revealed[i]
        const barWidth = Math.max(3, (Math.log10(level.ns + 1) / Math.log10(maxNs)) * 100)
        return (
          <motion.div
            key={level.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <motion.button
              onClick={() => setRevealed(prev => ({ ...prev, [i]: !prev[i] }))}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 18px', position: 'relative',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: isOpen ? `${barWidth}%` : 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  background: `${level.color}20`, borderRadius: 12,
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: level.color, flexShrink: 0,
                    boxShadow: `0 0 8px ${level.color}66`,
                  }} />
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
                    {level.label}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    ~{level.ns.toLocaleString()}ns
                  </span>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      style={{
                        background: level.color, color: '#fff', padding: '4px 14px',
                        borderRadius: 20, fontWeight: 700, fontSize: 14,
                        boxShadow: `0 2px 10px ${level.color}44`,
                      }}
                    >
                      {level.human}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 8, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    marginTop: 10, borderRadius: 4, overflow: 'hidden',
                    background: 'var(--bg-primary)',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    style={{
                      height: '100%', borderRadius: 4,
                      background: `linear-gradient(90deg, ${level.color}, ${level.color}aa)`,
                    }}
                  />
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        )
      })}
      {Object.keys(revealed).length === LATENCY_LEVELS.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center', padding: 16, borderRadius: 12,
            background: 'linear-gradient(135deg, #10b98120, #ef444420)',
            border: '1px solid var(--border)', marginTop: 8,
            color: 'var(--text-primary)', fontWeight: 600, fontSize: 15,
          }}
        >
          A network call is 150 million times slower than L1 cache.
          That is the difference between 1 second and 5 years!
        </motion.div>
      )}
    </div>
  )
}

/* ---- Section 2: Memory Allocator Simulator ---- */
function MemoryAllocator() {
  const TOTAL_CELLS = 128
  const TOTAL_RAM_MB = 8192
  const [allocations, setAllocations] = useState([])
  const [usedMB, setUsedMB] = useState(200)
  const [oom, setOom] = useState(false)

  const allocationTypes = [
    { label: 'Create list (1000 items)', sizeMB: 50, cells: 4, color: '#3b82f6' },
    { label: 'Load image (5MB)', sizeMB: 160, cells: 8, color: '#8b5cf6' },
    { label: 'Open DB connection', sizeMB: 120, cells: 6, color: '#10b981' },
    { label: 'Load ML model (500MB)', sizeMB: 2048, cells: 32, color: '#f59e0b' },
  ]

  const allocatedCells = new Set()
  allocations.forEach(a => a.cellIndices.forEach(c => allocatedCells.add(c)))

  function allocate(type) {
    if (oom) return
    const newUsed = usedMB + type.sizeMB
    if (newUsed > TOTAL_RAM_MB) {
      setOom(true)
      return
    }
    const freeCells = []
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (!allocatedCells.has(i)) freeCells.push(i)
    }
    const cellsToUse = freeCells.slice(0, type.cells)
    setAllocations(prev => [...prev, { ...type, cellIndices: cellsToUse, id: Date.now() }])
    setUsedMB(newUsed)
  }

  function reset() {
    setAllocations([])
    setUsedMB(200)
    setOom(false)
  }

  const usagePct = (usedMB / TOTAL_RAM_MB) * 100

  return (
    <div>
      {/* RAM Usage Meter */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            RAM Usage
          </span>
          <span style={{
            fontWeight: 700, fontSize: 14,
            color: usagePct > 90 ? '#ef4444' : usagePct > 70 ? '#f59e0b' : 'var(--text-secondary)',
          }}>
            {(usedMB / 1024).toFixed(1)} GB / {(TOTAL_RAM_MB / 1024).toFixed(0)} GB
          </span>
        </div>
        <div style={{
          height: 24, borderRadius: 12, background: 'var(--bg-primary)',
          border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${Math.min(usagePct, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: 12,
              background: usagePct > 90
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : usagePct > 70
                  ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                  : 'linear-gradient(90deg, #10b981, #22c55e)',
            }}
          />
        </div>
      </div>

      {/* Memory Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: 3,
        marginBottom: 20, padding: 12, background: 'var(--bg-primary)',
        borderRadius: 12, border: '1px solid var(--border)',
      }}>
        {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
          const alloc = allocations.find(a => a.cellIndices.includes(i))
          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: alloc ? alloc.color : 'var(--bg-secondary)',
                scale: alloc ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                aspectRatio: '1', borderRadius: 4,
                border: `1px solid ${alloc ? alloc.color + '44' : 'var(--border)'}`,
              }}
              title={alloc ? alloc.label : 'Free'}
            />
          )
        })}
      </div>

      {/* OOM Banner */}
      <AnimatePresence>
        {oom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '16px 24px', borderRadius: 12, marginBottom: 16,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff', fontWeight: 700, fontSize: 16, textAlign: 'center',
              boxShadow: '0 4px 20px #ef444444',
            }}
          >
            Out of Memory! Your application has been killed by the OS.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {allocationTypes.map(type => (
          <motion.button
            key={type.label}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => allocate(type)}
            disabled={oom}
            style={{
              padding: '10px 18px', borderRadius: 10, cursor: oom ? 'not-allowed' : 'pointer',
              background: oom ? 'var(--bg-secondary)' : `${type.color}18`,
              border: `1.5px solid ${type.color}55`,
              color: oom ? 'var(--text-muted)' : type.color,
              fontWeight: 700, fontSize: 13, opacity: oom ? 0.5 : 1,
            }}
          >
            + {type.label}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={reset}
          style={{
            padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
            background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
            color: 'var(--text-secondary)', fontWeight: 700, fontSize: 13,
          }}
        >
          Reset
        </motion.button>
      </div>

      {/* Legend */}
      {allocations.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16,
          padding: 12, borderRadius: 10, background: 'var(--bg-secondary)',
        }}>
          {[...new Map(allocations.map(a => [a.label, a])).values()].map(a => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: a.color }} />
              <span style={{ color: 'var(--text-muted)' }}>{a.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- Section 3: I/O Timeline Visualizer ---- */
function IOTimeline() {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const totalDuration = 254
  const segments = [
    { lane: 'cpu', label: 'Parse request', start: 0, end: 2, color: '#3b82f6' },
    { lane: 'io', label: 'DB Query', start: 2, end: 52, color: '#f59e0b' },
    { lane: 'cpu', label: 'Process result', start: 52, end: 53, color: '#3b82f6' },
    { lane: 'io', label: 'API Call', start: 53, end: 253, color: '#ef4444' },
    { lane: 'cpu', label: 'Format response', start: 253, end: 254, color: '#3b82f6' },
  ]

  function startAnimation() {
    setProgress(0)
    setPlaying(true)
    let frame = 0
    const interval = setInterval(() => {
      frame += 1
      const p = Math.min(frame / 80, 1)
      setProgress(p)
      if (p >= 1) {
        clearInterval(interval)
        setPlaying(false)
      }
    }, 30)
  }

  const currentMs = progress * totalDuration
  const cpuActiveMs = 4
  const cpuUtilization = ((cpuActiveMs / totalDuration) * 100).toFixed(1)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startAnimation}
          disabled={playing}
          style={{
            padding: '10px 24px', borderRadius: 10, cursor: playing ? 'not-allowed' : 'pointer',
            background: playing ? 'var(--bg-secondary)' : 'var(--accent)',
            color: playing ? 'var(--text-muted)' : '#fff',
            border: 'none', fontWeight: 700, fontSize: 14,
          }}
        >
          {playing ? 'Playing...' : progress >= 1 ? 'Replay' : 'Play Timeline'}
        </motion.button>
        {progress > 0 && (
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
            {currentMs.toFixed(0)}ms / {totalDuration}ms
          </span>
        )}
      </div>

      {/* Timeline Lanes */}
      {['cpu', 'io'].map(lane => (
        <div key={lane} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, marginBottom: 6,
            color: lane === 'cpu' ? '#3b82f6' : '#f59e0b',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {lane === 'cpu' ? 'CPU' : 'I/O (Disk / Network)'}
          </div>
          <div style={{
            position: 'relative', height: 44, borderRadius: 10,
            background: 'var(--bg-primary)', border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            {/* Playhead */}
            {progress > 0 && (
              <motion.div
                style={{
                  position: 'absolute', top: 0, bottom: 0, width: 2,
                  background: 'var(--text-primary)', zIndex: 10, opacity: 0.5,
                  left: `${(currentMs / totalDuration) * 100}%`,
                }}
              />
            )}
            {segments.filter(s => s.lane === lane).map((seg, i) => {
              const left = (seg.start / totalDuration) * 100
              const width = ((seg.end - seg.start) / totalDuration) * 100
              const isVisible = currentMs >= seg.start
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{
                    opacity: isVisible ? 1 : 0,
                    scaleX: isVisible ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute', top: 4, bottom: 4,
                    left: `${left}%`, width: `${width}%`,
                    background: seg.color, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transformOrigin: 'left',
                  }}
                >
                  {width > 8 && (
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {seg.label} ({seg.end - seg.start}ms)
                    </span>
                  )}
                </motion.div>
              )
            })}
            {/* Idle regions for CPU */}
            {lane === 'cpu' && progress > 0 && (
              <>
                <div style={{
                  position: 'absolute', top: 4, bottom: 4,
                  left: `${(2 / totalDuration) * 100}%`,
                  width: `${(50 / totalDuration) * 100}%`,
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, #ef444412 4px, #ef444412 8px)',
                  borderRadius: 6, opacity: currentMs > 2 ? 0.8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} >
                  <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, opacity: 0.7 }}>IDLE</span>
                </div>
                <div style={{
                  position: 'absolute', top: 4, bottom: 4,
                  left: `${(53 / totalDuration) * 100}%`,
                  width: `${(200 / totalDuration) * 100}%`,
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, #ef444412 4px, #ef444412 8px)',
                  borderRadius: 6, opacity: currentMs > 53 ? 0.8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, opacity: 0.7 }}>IDLE</span>
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Insight */}
      {progress >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f620, #ef444420)',
            border: '1px solid var(--border)', marginTop: 8,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>
            CPU utilization: only {cpuUtilization}%
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
            Your CPU was active for just {cpuActiveMs}ms out of {totalDuration}ms.
            In most web applications, the CPU is bored most of the time -- it is all waiting on I/O!
          </p>
        </motion.div>
      )}
    </div>
  )
}

/* ---- Section 4: Pipe Visualizer ---- */
function PipeVisualizer() {
  const [sentA, setSentA] = useState(false)
  const [sentB, setSentB] = useState(false)
  const [doneA, setDoneA] = useState(false)
  const [doneB, setDoneB] = useState(false)

  function sendPacket(pipe) {
    if (pipe === 'A') {
      setSentA(true)
      setDoneA(false)
      setTimeout(() => setDoneA(true), 800)
    } else {
      setSentB(true)
      setDoneB(false)
      setTimeout(() => setDoneB(true), 2400)
    }
  }

  function reset() {
    setSentA(false)
    setSentB(false)
    setDoneA(false)
    setDoneB(false)
  }

  const pipes = [
    {
      label: 'Low Bandwidth, Low Latency',
      desc: 'Thin pipe, short distance (e.g., local API call)',
      height: 18, width: '45%', color: '#3b82f6',
      sent: sentA, done: doneA, key: 'A', duration: 0.8,
      best: 'Small requests (API calls)',
    },
    {
      label: 'High Bandwidth, High Latency',
      desc: 'Fat pipe, long distance (e.g., cross-continent download)',
      height: 48, width: '90%', color: '#8b5cf6',
      sent: sentB, done: doneB, key: 'B', duration: 2.4,
      best: 'Bulk transfers (file downloads)',
    },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {pipes.map(pipe => (
          <div key={pipe.key} style={{
            background: 'var(--bg-primary)', borderRadius: 14,
            border: '1px solid var(--border)', padding: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: pipe.color, marginBottom: 4 }}>
              {pipe.label}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
              {pipe.desc}
            </p>

            {/* Pipe visual */}
            <div style={{
              position: 'relative', width: pipe.width, height: pipe.height,
              background: `${pipe.color}15`, border: `2px solid ${pipe.color}44`,
              borderRadius: pipe.height / 2, margin: '0 auto 16px',
              overflow: 'hidden',
            }}>
              {pipe.sent && (
                <motion.div
                  initial={{ left: 0 }}
                  animate={{ left: pipe.done ? '100%' : '50%' }}
                  transition={{ duration: pipe.duration, ease: 'linear' }}
                  style={{
                    position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                    width: 12, height: 12, borderRadius: '50%',
                    background: pipe.color, boxShadow: `0 0 12px ${pipe.color}88`,
                  }}
                />
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendPacket(pipe.key)}
              disabled={pipe.sent && !pipe.done}
              style={{
                width: '100%', padding: '8px 16px', borderRadius: 8,
                background: pipe.sent && !pipe.done ? 'var(--bg-secondary)' : `${pipe.color}18`,
                border: `1.5px solid ${pipe.color}44`, cursor: pipe.sent && !pipe.done ? 'wait' : 'pointer',
                color: pipe.color, fontWeight: 700, fontSize: 13,
              }}
            >
              {pipe.sent && !pipe.done ? 'Sending...' : 'Send Packet'}
            </motion.button>

            <AnimatePresence>
              {pipe.done && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 10, padding: '6px 12px', borderRadius: 8,
                    background: `${pipe.color}12`, fontSize: 12, color: pipe.color,
                    fontWeight: 600, textAlign: 'center',
                  }}
                >
                  Delivered! Best for: {pipe.best}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={reset}
          style={{
            padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
          }}
        >
          Reset Both
        </motion.button>
      </div>

      {doneA && doneB && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 16, padding: '14px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f615, #8b5cf615)',
            border: '1px solid var(--border)', fontSize: 14,
            color: 'var(--text-secondary)', textAlign: 'center',
          }}
        >
          <strong>Key insight:</strong> Latency matters more for small, frequent requests (API calls).
          Bandwidth matters more for large, bulk transfers (file downloads, backups).
        </motion.div>
      )}
    </div>
  )
}

/* ---- Section 5: Memory Leak Detector ---- */
function MemoryLeakDetector() {
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('leaky')
  const [dataPoints, setDataPoints] = useState([])
  const [crashed, setCrashed] = useState(false)

  function startSimulation() {
    setDataPoints([])
    setCrashed(false)
    setRunning(true)
    let points = []
    let step = 0
    const interval = setInterval(() => {
      step++
      let memMB
      if (mode === 'leaky') {
        memMB = 200 + step * 45 + Math.random() * 20
        if (memMB >= 4000) {
          points.push(Math.min(memMB, 4096))
          setDataPoints([...points])
          setCrashed(true)
          setRunning(false)
          clearInterval(interval)
          return
        }
      } else {
        memMB = 200 + Math.sin(step * 0.3) * 60 + Math.random() * 15
      }
      points.push(memMB)
      setDataPoints([...points])
      if (step >= 80 && mode === 'fixed') {
        setRunning(false)
        clearInterval(interval)
      }
    }, 60)
  }

  const maxMem = 4096
  const chartHeight = 200
  const chartWidth = 600

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { setMode('leaky'); setDataPoints([]); setCrashed(false) }}
          style={{
            padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
            background: mode === 'leaky' ? '#ef4444' : 'var(--bg-secondary)',
            color: mode === 'leaky' ? '#fff' : 'var(--text-secondary)',
            border: mode === 'leaky' ? 'none' : '1px solid var(--border)',
            fontWeight: 700, fontSize: 13,
          }}
        >
          Leaky Server
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { setMode('fixed'); setDataPoints([]); setCrashed(false) }}
          style={{
            padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
            background: mode === 'fixed' ? '#10b981' : 'var(--bg-secondary)',
            color: mode === 'fixed' ? '#fff' : 'var(--text-secondary)',
            border: mode === 'fixed' ? 'none' : '1px solid var(--border)',
            fontWeight: 700, fontSize: 13,
          }}
        >
          Fixed Server
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startSimulation}
          disabled={running}
          style={{
            padding: '8px 24px', borderRadius: 8, cursor: running ? 'not-allowed' : 'pointer',
            background: running ? 'var(--bg-secondary)' : 'var(--accent)',
            color: running ? 'var(--text-muted)' : '#fff',
            border: 'none', fontWeight: 700, fontSize: 13,
          }}
        >
          {running ? 'Running...' : 'Start Simulation'}
        </motion.button>
      </div>

      {/* Chart */}
      <div style={{
        position: 'relative', background: 'var(--bg-primary)',
        border: '1px solid var(--border)', borderRadius: 14,
        padding: '20px 20px 12px 50px', overflow: 'hidden',
      }}>
        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map(gb => (
          <div key={gb} style={{
            position: 'absolute', left: 8,
            top: `${20 + (1 - gb / 4) * chartHeight}px`,
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
            transform: 'translateY(-50%)',
          }}>
            {gb}GB
          </div>
        ))}

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(gb => (
          <div key={`grid-${gb}`} style={{
            position: 'absolute', left: 50, right: 20,
            top: `${20 + (1 - gb / 4) * chartHeight}px`,
            height: 1, background: 'var(--border)', opacity: 0.5,
          }} />
        ))}

        {/* OOM line */}
        <div style={{
          position: 'absolute', left: 50, right: 20,
          top: 20, height: 2,
          background: '#ef4444', opacity: 0.4,
          borderTop: '2px dashed #ef4444',
        }}>
          <span style={{
            position: 'absolute', right: 0, top: -16,
            fontSize: 11, color: '#ef4444', fontWeight: 700,
          }}>
            OOM Limit
          </span>
        </div>

        {/* Chart area */}
        <svg width={chartWidth} height={chartHeight} style={{ display: 'block', maxWidth: '100%' }}>
          {dataPoints.length > 1 && (
            <>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={mode === 'leaky' ? '#ef4444' : '#10b981'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={mode === 'leaky' ? '#ef4444' : '#10b981'} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <motion.path
                d={
                  `M ${0} ${chartHeight} ` +
                  dataPoints.map((p, i) => {
                    const x = (i / Math.max(dataPoints.length - 1, 1)) * chartWidth
                    const y = chartHeight - (p / maxMem) * chartHeight
                    return `L ${x} ${y}`
                  }).join(' ') +
                  ` L ${((dataPoints.length - 1) / Math.max(dataPoints.length - 1, 1)) * chartWidth} ${chartHeight} Z`
                }
                fill="url(#lineGrad)"
              />
              {/* Line */}
              <motion.path
                d={dataPoints.map((p, i) => {
                  const x = (i / Math.max(dataPoints.length - 1, 1)) * chartWidth
                  const y = chartHeight - (p / maxMem) * chartHeight
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                }).join(' ')}
                fill="none"
                stroke={mode === 'leaky' ? '#ef4444' : '#10b981'}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        {/* Time labels */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 4, paddingRight: 0,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0h</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Time</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {mode === 'leaky' ? '~24h' : '~48h'}
          </span>
        </div>
      </div>

      {/* Crash / Stable banner */}
      <AnimatePresence>
        {crashed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 16, padding: '16px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff', fontWeight: 700, fontSize: 16, textAlign: 'center',
              boxShadow: '0 4px 24px #ef444444',
            }}
          >
            Process Killed by OS (OOM) -- Memory reached 4GB limit!
          </motion.div>
        )}
        {!running && !crashed && dataPoints.length > 0 && mode === 'fixed' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: '14px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #10b98120, #22c55e20)',
              border: '1px solid #10b98144',
              color: '#10b981', fontWeight: 700, fontSize: 15, textAlign: 'center',
            }}
          >
            Memory stable! Proper cleanup keeps memory usage flat over time.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   Main Component
================================================================ */
export default function Topic2_MemoryIO() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ---- Section 1: Memory Hierarchy ---- */}
      <SectionBlock title="Memory Hierarchy -- The Speed Ladder" icon="🪜" color="#10b981">
        <Neuron
          mood="thinking"
          message="Not all memory is created equal. Your CPU has a tiny but blazing-fast cache right next to it, then RAM which is bigger but slower, and finally disk and network which are MASSIVELY slower. Let me show you just how big the difference is..."
          typed
        />

        <InteractiveDemo title="Latency Comparison Tower">
          <LatencyTower />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 2: RAM ---- */}
      <SectionBlock title="RAM -- Your Application's Workspace" icon="🧠" color="#3b82f6">
        <Neuron
          mood="explaining"
          message="Think of RAM as your desk. Every variable, every object, every data structure your app creates lives in RAM. The bigger your desk, the more things you can work with at once. But desks have limits..."
          typed
        />

        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
            When your app starts, the OS gives it a slice of RAM. Every <code style={{
              background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4,
              fontSize: 13, color: 'var(--accent)',
            }}>let x = [...]</code>, every database connection, every loaded image occupies memory.
            When RAM fills up, the OS has no choice but to kill your process.
          </p>
        </div>

        <InteractiveDemo title="Memory Allocator Simulator">
          <MemoryAllocator />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 3: I/O Operations ---- */}
      <SectionBlock title="I/O Operations -- The Waiting Game" icon="hourglass" color="#f59e0b">
        <Neuron
          mood="happy"
          message="Here is the dirty secret of most web apps: your CPU is barely doing anything! Most of the time it is sitting idle, waiting for a database query to come back, or an API call to finish. This is called I/O-bound work."
          typed
        />

        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
            I/O stands for Input/Output -- reading from disk, sending data over the network, querying a database.
            During I/O, the CPU has nothing to do. It just waits. Understanding this is key to building fast systems.
          </p>
        </div>

        <InteractiveDemo title="I/O Timeline Visualizer">
          <IOTimeline />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 4: Bandwidth vs Latency ---- */}
      <SectionBlock title="Bandwidth vs Latency" icon="📡" color="#8b5cf6">
        <Neuron
          mood="excited"
          message="People confuse these two all the time! Bandwidth is how wide the pipe is -- how much data you can push through per second. Latency is how long it takes for the first bit to arrive. A firehose has high bandwidth. A satellite link has high latency. Let's see the difference!"
          typed
        />

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
        }}>
          <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: '#3b82f610', border: '1px solid #3b82f630',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#3b82f6', marginBottom: 4 }}>
              Bandwidth
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              How wide the pipe is. Measured in Mbps or Gbps. More bandwidth = more data per second.
            </p>
          </div>
          <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: '#8b5cf610', border: '1px solid #8b5cf630',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#8b5cf6', marginBottom: 4 }}>
              Latency
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              How long one piece takes to travel. Measured in ms. Lower latency = faster response.
            </p>
          </div>
        </div>

        <InteractiveDemo title="Pipe Visualizer">
          <PipeVisualizer />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 5: Memory Leaks ---- */}
      <SectionBlock title="Memory Leaks -- The Silent Killer" icon="💀" color="#ef4444">
        <Neuron
          mood="thinking"
          message="A memory leak is when your app keeps allocating memory but never frees it. It is like a slow water leak -- you do not notice it at first, but come back in 24 hours and the whole floor is flooded. Let's watch one happen in real time..."
          typed
        />

        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 20,
          background: '#ef444410', border: '1px solid #ef444430',
        }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
            Common causes: event listeners not removed, growing caches without eviction, closures holding
            references to large objects, circular references preventing garbage collection.
          </p>
        </div>

        <InteractiveDemo title="Memory Leak Detector">
          <MemoryLeakDetector />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 6: Hindi Explainer ---- */}
      <SectionBlock title="Hindi Explainer" icon="🇮🇳" color="#ff9933">
        <HindiExplainer
          concept="मेमोरी और I/O"
          english="Memory & I/O Bottlenecks"
          explanation="RAM एक बड़ी डेस्क की तरह है — जितनी बड़ी डेस्क, उतने ज़्यादा कागज़ात एक साथ रख सकते हो। I/O मतलब बाहर से डेटा लाना, जैसे गोदाम से सामान मंगवाना — इसमें समय लगता है और CPU बैठा इंतज़ार करता है।"
          example="सोचो तुम्हारा app एक chef है। RAM है kitchen counter — सब ingredients वहां रखो तो fast cooking। लेकिन हर बार गोदाम (disk) या बाज़ार (network) से सामान लाना पड़े तो बहुत slow हो जाएगा!"
          terms={[
            { hindi: 'रैम', english: 'RAM', meaning: 'तेज़ लेकिन temporary memory — बिजली जाए तो डेटा उड़ जाए' },
            { hindi: 'कैश', english: 'Cache', meaning: 'CPU के पास की ultra-fast memory — सबसे ज़रूरी डेटा यहां रहता है' },
            { hindi: 'लेटेंसी', english: 'Latency', meaning: 'एक request को respond होने में लगा समय' },
            { hindi: 'बैंडविड्थ', english: 'Bandwidth', meaning: 'एक second में कितना डेटा भेज सकते हैं' },
            { hindi: 'मेमोरी लीक', english: 'Memory Leak', meaning: 'App memory लेता जाए पर वापस न करे — eventually crash' },
          ]}
        />
      </SectionBlock>
    </div>
  )
}
