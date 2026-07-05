import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 6 — FastAPI Under the Hood
   Uvicorn workers, async, and the math of concurrency
================================================================ */

/* ---- Stack Explorer ---- */
function StackExplorer() {
  const [activeLayer, setActiveLayer] = useState(null)

  const layers = [
    {
      name: 'Your Code',
      sub: 'FastAPI route handlers',
      color: '#8b5cf6',
      detail: 'This is where you write @app.get("/users") and define your endpoint logic. FastAPI parses type hints, validates input, and serializes output for you.',
    },
    {
      name: 'FastAPI',
      sub: 'Request parsing, validation, routing',
      color: '#6366f1',
      detail: 'FastAPI uses Pydantic for data validation and generates OpenAPI docs automatically. It receives parsed HTTP requests and matches them to your route handlers.',
    },
    {
      name: 'Starlette',
      sub: 'ASGI framework',
      color: '#3b82f6',
      detail: 'Starlette is the async web framework that FastAPI is built on. It handles middleware, routing internals, WebSocket support, and ASGI lifecycle events.',
    },
    {
      name: 'Uvicorn',
      sub: 'ASGI server — runs the event loop',
      color: '#0ea5e9',
      detail: 'Uvicorn is the actual server process. It opens TCP sockets, accepts connections, and runs Python\'s asyncio event loop. It can spawn multiple worker processes for parallelism.',
    },
    {
      name: 'Operating System',
      sub: 'TCP sockets, file descriptors',
      color: '#0d9488',
      detail: 'The OS kernel manages network connections via sockets, schedules CPU time for each process, and handles file I/O. Everything above depends on these primitives.',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
      {layers.map((layer, i) => (
        <div key={layer.name}>
          <motion.button
            onClick={() => setActiveLayer(activeLayer === i ? null : i)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            style={{
              width: '100%',
              padding: '18px 24px',
              background: activeLayer === i
                ? `linear-gradient(135deg, ${layer.color}20, ${layer.color}10)`
                : 'var(--bg-card)',
              border: `2px solid ${activeLayer === i ? layer.color : 'var(--border)'}`,
              borderRadius: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-heading)',
              transition: 'border-color 0.3s, background 0.3s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${layer.color}, ${layer.color}cc)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 16,
              }}>
                {i + 1}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
                  {layer.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {layer.sub}
                </div>
              </div>
            </div>
            <motion.span
              animate={{ rotate: activeLayer === i ? 180 : 0 }}
              style={{ fontSize: 18, color: layer.color }}
            >
              ▼
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {activeLayer === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  padding: '16px 24px',
                  margin: '4px 0',
                  background: `${layer.color}08`,
                  borderLeft: `4px solid ${layer.color}`,
                  borderRadius: '0 12px 12px 0',
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                }}>
                  {layer.detail}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {i < layers.length - 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', padding: '4px 0',
            }}>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: 20, color: 'var(--text-muted)' }}
              >
                ↓
              </motion.div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---- Server Configuration Calculator ---- */
function ServerCalculator() {
  const [vCPUs, setVCPUs] = useState(2)
  const [workers, setWorkers] = useState(2)
  const [threads, setThreads] = useState(1)
  const [ioBound, setIoBound] = useState(true)

  const avgResponseTime = 1556
  const avgCpuTime = 6

  const maxParallelCPU = Math.min(workers, vCPUs)
  const maxConcurrentIO = workers * threads * Math.floor(avgResponseTime / avgCpuTime)
  const estimatedRPS = ioBound
    ? Math.floor(maxConcurrentIO / (avgResponseTime / 1000))
    : Math.floor(maxParallelCPU / (avgResponseTime / 1000))
  const memoryUsage = workers * 50

  const cpuOptions = [1, 2, 4, 8]

  return (
    <div>
      {/* Controls */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28,
      }}>
        {/* vCPUs */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            vCPUs: {vCPUs}
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {cpuOptions.map(n => (
              <motion.button
                key={n}
                onClick={() => setVCPUs(n)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  background: vCPUs === n ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: vCPUs === n ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${vCPUs === n ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >
                {n}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Workers */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Workers: {workers}
          </label>
          <input
            type="range" min={1} max={16} value={workers}
            onChange={e => setWorkers(Number(e.target.value))}
            style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent)' }}
          />
        </div>

        {/* Threads */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Threads per Worker: {threads}
          </label>
          <input
            type="range" min={1} max={4} value={threads}
            onChange={e => setThreads(Number(e.target.value))}
            style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent)' }}
          />
        </div>

        {/* I/O vs CPU toggle */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            App Type
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <motion.button
              onClick={() => setIoBound(true)}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: ioBound ? '#10b981' : 'var(--bg-secondary)',
                color: ioBound ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${ioBound ? '#10b981' : 'var(--border)'}`,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              I/O-bound
            </motion.button>
            <motion.button
              onClick={() => setIoBound(false)}
              whileTap={{ scale: 0.95 }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: !ioBound ? '#ef4444' : 'var(--bg-secondary)',
                color: !ioBound ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${!ioBound ? '#ef4444' : 'var(--border)'}`,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              CPU-bound
            </motion.button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14,
      }}>
        <ResultCard
          label={ioBound ? 'Max Concurrent Requests' : 'Max Parallel Requests'}
          value={ioBound ? maxConcurrentIO.toLocaleString() : maxParallelCPU}
          color={ioBound ? '#10b981' : '#ef4444'}
          icon={ioBound ? '🚀' : '⚙️'}
        />
        <ResultCard
          label="Estimated Requests/sec"
          value={estimatedRPS.toLocaleString()}
          color="#6366f1"
          icon="📊"
        />
        <ResultCard
          label="Memory Usage"
          value={`~${memoryUsage} MB`}
          color="#f59e0b"
          icon="💾"
        />
        <ResultCard
          label="Worker Efficiency"
          value={workers > vCPUs ? 'Over-provisioned!' : 'Good'}
          color={workers > vCPUs * 2 ? '#ef4444' : '#10b981'}
          icon={workers > vCPUs * 2 ? '⚠️' : '✅'}
        />
      </div>

      {workers > vCPUs * 2 + 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: 14, padding: '12px 18px', borderRadius: 12,
            background: '#fef2f2', border: '1px solid #fca5a5',
            fontSize: 14, color: '#991b1b', fontWeight: 600,
          }}
        >
          Warning: Having {workers} workers on {vCPUs} vCPUs means workers compete for CPU time. Recommended: {2 * vCPUs + 1} workers max.
        </motion.div>
      )}
    </div>
  )
}

function ResultCard({ label, value, color, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        padding: '18px 20px', borderRadius: 14,
        background: `${color}08`, border: `1.5px solid ${color}25`,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--font-heading)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </motion.div>
  )
}

/* ---- Request Pipeline Animation ---- */
function RequestPipeline() {
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0)

  const totalDuration = 1556
  const segments = [
    { label: 'Parse', duration: 2, type: 'cpu' },
    { label: 'DB Query', duration: 50, type: 'io' },
    { label: 'Process', duration: 3, type: 'cpu' },
    { label: 'OpenAI API', duration: 1500, type: 'io' },
    { label: 'Format', duration: 1, type: 'cpu' },
  ]

  // Scale factor: 1ms = 0.2px width for display
  const scale = 0.25
  const totalWidth = totalDuration * scale

  const startAnimation = () => {
    setRunning(true)
    setTick(0)
    let t = 0
    const interval = setInterval(() => {
      t += 20
      setTick(t)
      if (t >= 3500) {
        clearInterval(interval)
      }
    }, 20)
  }

  const getSegmentColor = (type) => type === 'cpu' ? '#ef4444' : '#10b981'
  const getSegmentBg = (type) => type === 'cpu' ? '#ef444420' : '#10b98120'

  // Worker 1 starts at t=0, Worker 2 starts at t=2 (after first CPU segment)
  const worker1Start = 0
  const worker2Start = 100 // staggered start in animation time

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          Each request: Parse (2ms CPU) → DB Query (50ms I/O) → Process (3ms CPU) → OpenAI API (1500ms I/O) → Format (1ms CPU)
        </p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#ef4444' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>CPU Active (blocked)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#10b981' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>I/O Wait (CPU free)</span>
          </div>
        </div>
      </div>

      <motion.button
        onClick={startAnimation}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          display: 'block', margin: '0 auto 24px', padding: '12px 32px',
          background: 'linear-gradient(135deg, var(--accent), #6366f1)',
          color: '#fff', border: 'none', borderRadius: 12,
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
          fontFamily: 'var(--font-heading)',
        }}
      >
        {running ? '🔄 Replay Animation' : '▶ Start Pipeline'}
      </motion.button>

      {/* Worker 1 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#6366f1', marginBottom: 8,
          fontFamily: 'var(--font-heading)',
        }}>
          Worker 1 — Request A
        </div>
        <div style={{
          display: 'flex', height: 40, borderRadius: 10, overflow: 'hidden',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          position: 'relative',
        }}>
          {running && segments.map((seg, i) => {
            const offset = segments.slice(0, i).reduce((s, x) => s + x.duration, 0)
            const segWidth = seg.duration * scale
            return (
              <motion.div
                key={i}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: segWidth, opacity: 1 }}
                transition={{ delay: 0.3 + offset * 0.003, duration: 0.3 }}
                style={{
                  height: '100%',
                  background: getSegmentColor(seg.type),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 0, overflow: 'hidden',
                  borderRight: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {segWidth > 30 && (
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {seg.label} {seg.duration}ms
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Worker 2 — handles multiple requests during Worker 1's I/O */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 8,
          fontFamily: 'var(--font-heading)',
        }}>
          Worker 2 — Requests B, C, D, E (during Worker 1 I/O waits)
        </div>
        <div style={{
          display: 'flex', gap: 4, height: 40, borderRadius: 10, overflow: 'hidden',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        }}>
          {running && ['B', 'C', 'D', 'E'].map((req, i) => (
            <motion.div
              key={req}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: totalWidth / 4 - 3, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.5, duration: 0.4 }}
              style={{
                height: '100%', borderRadius: 6,
                background: `linear-gradient(135deg, #10b981, #059669)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>Req {req}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Math breakdown */}
      {running && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          style={{
            background: 'var(--bg-card)', borderRadius: 16,
            border: '2px solid var(--accent)', padding: 24,
          }}
        >
          <div style={{
            fontSize: 18, fontWeight: 800, color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)', marginBottom: 16, textAlign: 'center',
          }}>
            The Math
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { label: 'CPU time per request', value: '6ms', color: '#ef4444' },
              { label: 'Total time per request', value: '1,556ms', color: '#6366f1' },
              { label: 'CPU utilization/request', value: '0.4%', color: '#f59e0b' },
              { label: 'Theoretical max/worker (async)', value: '~260', color: '#10b981' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.8 + i * 0.15 }}
                style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: `${item.color}08`, border: `1px solid ${item.color}20`,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: item.color, fontFamily: 'var(--font-heading)' }}>
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            style={{
              marginTop: 16, padding: '16px 20px', borderRadius: 14,
              background: 'linear-gradient(135deg, #10b98115, #10b98108)',
              border: '1.5px solid #10b98130',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
              With 2 workers
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
              ~520 concurrent requests!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              Limited by: memory, connection pool, network bandwidth
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

/* ---- Sync vs Async Race ---- */
function SyncAsyncRace() {
  const [racing, setRacing] = useState(false)
  const [syncDone, setSyncDone] = useState(0)
  const [asyncDone, setAsyncDone] = useState(0)
  const [syncTime, setSyncTime] = useState(0)
  const [asyncTime, setAsyncTime] = useState(0)
  const [finished, setFinished] = useState(false)

  const totalRequests = 10
  const requestTime = 1500 // ms per request (simulated I/O)

  const startRace = () => {
    setRacing(true)
    setSyncDone(0)
    setAsyncDone(0)
    setSyncTime(0)
    setAsyncTime(0)
    setFinished(false)

    // Sync: one at a time per worker (2 workers), each takes 750ms simulated
    // 10 requests / 2 workers = 5 batches * 750ms = 3750ms sim display
    let syncCount = 0
    const syncInterval = setInterval(() => {
      syncCount += 2
      if (syncCount > totalRequests) syncCount = totalRequests
      setSyncDone(syncCount)
      setSyncTime(Math.ceil(syncCount / 2) * 750)
      if (syncCount >= totalRequests) {
        clearInterval(syncInterval)
        setSyncTime(7500)
      }
    }, 750)

    // Async: all 10 finish almost simultaneously after ~1.6s (simulated)
    setTimeout(() => {
      setAsyncDone(totalRequests)
      setAsyncTime(1600)
    }, 1600)

    // Mark race as finished after sync completes
    setTimeout(() => {
      setFinished(true)
    }, 4000)
  }

  return (
    <div>
      {/* Code comparison */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24,
      }}>
        <div style={{
          background: '#1e1e1e', borderRadius: 14, overflow: 'hidden',
          border: '1px solid #ef444440',
        }}>
          <div style={{
            padding: '10px 16px', background: '#ef444415',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid #ef444430',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>SYNC — blocks worker</span>
          </div>
          <pre style={{
            padding: 16, margin: 0, fontSize: 12, lineHeight: 1.6,
            color: '#e0e0e0', fontFamily: 'monospace', overflow: 'auto',
          }}>
{`@app.get("/sync")
def get_data():
    result = db.query(...)
    # Worker thread blocked!
    return result`}
          </pre>
        </div>

        <div style={{
          background: '#1e1e1e', borderRadius: 14, overflow: 'hidden',
          border: '1px solid #10b98140',
        }}>
          <div style={{
            padding: '10px 16px', background: '#10b98115',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid #10b98130',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>ASYNC — releases during I/O</span>
          </div>
          <pre style={{
            padding: 16, margin: 0, fontSize: 12, lineHeight: 1.6,
            color: '#e0e0e0', fontFamily: 'monospace', overflow: 'auto',
          }}>
{`@app.get("/async")
async def get_data():
    result = await db.async_query(...)
    # Worker free during wait!
    return result`}
          </pre>
        </div>
      </div>

      <motion.button
        onClick={startRace}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={racing && !finished}
        style={{
          display: 'block', margin: '0 auto 24px', padding: '14px 36px',
          background: racing && !finished
            ? 'var(--text-muted)'
            : 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff', border: 'none', borderRadius: 12,
          fontWeight: 700, fontSize: 16, cursor: racing && !finished ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-heading)',
          boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
        }}
      >
        {racing ? (finished ? '🏁 Race Again!' : '🏎️ Racing...') : '🏁 Start the Race! (10 requests)'}
      </motion.button>

      {/* Race visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Sync server */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>
              Sync Server (2 workers)
            </span>
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              {syncDone}/{totalRequests} done — {(syncTime / 1000).toFixed(1)}s
            </span>
          </div>
          <div style={{
            height: 32, borderRadius: 10, background: '#ef444412',
            border: '1px solid #ef444425', overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${(syncDone / totalRequests) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%', borderRadius: 10,
                background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: 10,
              }}
            >
              {syncDone > 0 && (
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                  {syncDone}/{totalRequests}
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Async server */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>
              Async Server (2 workers)
            </span>
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              {asyncDone}/{totalRequests} done — {(asyncTime / 1000).toFixed(1)}s
            </span>
          </div>
          <div style={{
            height: 32, borderRadius: 10, background: '#10b98112',
            border: '1px solid #10b98125', overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${(asyncDone / totalRequests) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%', borderRadius: 10,
                background: 'linear-gradient(90deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: 10,
              }}
            >
              {asyncDone > 0 && (
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                  {asyncDone}/{totalRequests}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 20, padding: '20px 24px', borderRadius: 16,
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '2px solid #10b981',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: '#065f46', marginBottom: 6 }}>
              Async is ~4.7x faster!
            </div>
            <div style={{ fontSize: 15, color: '#047857' }}>
              Sync: 7.5s (processes 2 at a time) vs Async: 1.6s (all 10 concurrently during I/O waits)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Production Calculator ---- */
function ProductionCalculator() {
  const [serverType, setServerType] = useState(2)
  const [avgResponse, setAvgResponse] = useState(500)
  const [avgCPU, setAvgCPU] = useState(10)
  const [targetUsers, setTargetUsers] = useState(1000)

  const workers = 2 * serverType + 1
  const maxConcurrent = workers * Math.floor(avgResponse / Math.max(avgCPU, 1))
  const serversNeeded = Math.max(1, Math.ceil(targetUsers / maxConcurrent))
  const costPerServer = serverType === 2 ? 20 : serverType === 4 ? 40 : 80
  const totalCost = serversNeeded * costPerServer

  const serverOptions = [
    { vcpus: 2, label: '2 vCPU', monthly: '$20/mo' },
    { vcpus: 4, label: '4 vCPU', monthly: '$40/mo' },
    { vcpus: 8, label: '8 vCPU', monthly: '$80/mo' },
  ]

  return (
    <div>
      {/* Formula display */}
      <div style={{
        background: '#1e1e1e', borderRadius: 14, padding: 20, marginBottom: 24,
        fontFamily: 'monospace', fontSize: 13, lineHeight: 2, color: '#a5f3fc',
        border: '1px solid var(--border)',
      }}>
        <div><span style={{ color: '#94a3b8' }}>{'// Production formulas'}</span></div>
        <div>Workers = (2 x CPU_cores) + 1</div>
        <div>Max_concurrent = Workers x (response_time / cpu_time)</div>
        <div>Servers_needed = Target_users / Max_concurrent_per_server</div>
      </div>

      {/* Inputs */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24,
      }}>
        {/* Server type */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Server Type
          </label>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {serverOptions.map(opt => (
              <motion.button
                key={opt.vcpus}
                onClick={() => setServerType(opt.vcpus)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 10,
                  background: serverType === opt.vcpus ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: serverType === opt.vcpus ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${serverType === opt.vcpus ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}
              >
                <span>{opt.label}</span>
                <span style={{ fontSize: 10, opacity: 0.8 }}>{opt.monthly}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Avg response time */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Avg Response Time: {avgResponse}ms
          </label>
          <input
            type="range" min={50} max={3000} step={50} value={avgResponse}
            onChange={e => setAvgResponse(Number(e.target.value))}
            style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent)' }}
          />
        </div>

        {/* Avg CPU time */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Avg CPU Time/Request: {avgCPU}ms
          </label>
          <input
            type="range" min={1} max={200} value={avgCPU}
            onChange={e => setAvgCPU(Number(e.target.value))}
            style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent)' }}
          />
        </div>

        {/* Target users */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Target Concurrent Users: {targetUsers.toLocaleString()}
          </label>
          <input
            type="range" min={100} max={50000} step={100} value={targetUsers}
            onChange={e => setTargetUsers(Number(e.target.value))}
            style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Results */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
      }}>
        <ResultCard
          label="Workers/Server"
          value={workers}
          color="#6366f1"
          icon="👷"
        />
        <ResultCard
          label="Max Concurrent/Server"
          value={maxConcurrent.toLocaleString()}
          color="#10b981"
          icon="🚀"
        />
        <ResultCard
          label="Servers Needed"
          value={serversNeeded}
          color="#f59e0b"
          icon="🖥️"
        />
        <ResultCard
          label="Estimated Monthly Cost"
          value={`$${totalCost}`}
          color="#8b5cf6"
          icon="💰"
        />
      </div>

      {/* Config recommendation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          marginTop: 16, padding: '16px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, #ede9fe, #e0f2fe)',
          border: '1px solid #a78bfa40',
          fontSize: 14, color: '#5b21b6', lineHeight: 1.7,
        }}
      >
        <strong>Recommended Config:</strong> {serversNeeded}x {serverType} vCPU servers, {workers} Uvicorn workers each.
        {avgCPU / avgResponse < 0.05 && ' Your app is heavily I/O-bound — async will give massive gains!'}
        {avgCPU / avgResponse >= 0.3 && ' Your app is CPU-heavy — consider more vCPUs or offloading computation.'}
      </motion.div>
    </div>
  )
}

/* ---- Bottleneck Chain ---- */
function BottleneckChain() {
  const [activeLink, setActiveLink] = useState(null)

  const bottlenecks = [
    {
      name: 'DB Connection Pool',
      limit: '100 connections',
      detail: 'Even with 500 concurrent async requests, if your DB pool is 100 connections, only 100 can query at once. The rest queue up.',
      icon: '🗄️',
      color: '#6366f1',
    },
    {
      name: 'External API Limits',
      limit: '500 RPM (OpenAI)',
      detail: 'OpenAI rate-limits at 500 requests per minute on some tiers. Your beautiful async setup means nothing if the API says "slow down".',
      icon: '🔗',
      color: '#f59e0b',
    },
    {
      name: 'Memory',
      limit: '~50MB per worker',
      detail: 'Each concurrent request holds data in memory. With 500 concurrent requests each holding a 1MB payload, that is 500MB just for request data.',
      icon: '💾',
      color: '#ef4444',
    },
    {
      name: 'Network Bandwidth',
      limit: '1 Gbps typical',
      detail: 'If each response is 100KB, at 10,000 requests/sec you need 1GB/s of bandwidth. Your server NIC becomes the bottleneck.',
      icon: '🌐',
      color: '#0ea5e9',
    },
  ]

  // Find the weakest link (smallest conceptual limit)
  const weakestIdx = 0 // DB pool is usually the first bottleneck

  return (
    <div>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
        Your system is only as fast as its slowest bottleneck. Click each link in the chain:
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexWrap: 'wrap', gap: 0,
      }}>
        {bottlenecks.map((b, i) => (
          <div key={b.name} style={{ display: 'flex', alignItems: 'center' }}>
            <motion.button
              onClick={() => setActiveLink(activeLink === i ? null : i)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              animate={activeLink === i ? { boxShadow: `0 0 20px ${b.color}40` } : {}}
              style={{
                width: 100, height: 100, borderRadius: 16,
                background: activeLink === i ? `${b.color}18` : 'var(--bg-card)',
                border: `2.5px solid ${i === weakestIdx ? '#ef4444' : b.color}`,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 28 }}>{b.icon}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: b.color,
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {b.name}
              </span>
              {i === weakestIdx && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    position: 'absolute', top: -8, right: -8,
                    background: '#ef4444', color: '#fff',
                    fontSize: 9, fontWeight: 800, padding: '3px 7px',
                    borderRadius: 6,
                  }}
                >
                  WEAKEST
                </motion.div>
              )}
            </motion.button>
            {i < bottlenecks.length - 1 && (
              <div style={{
                width: 28, height: 4, background: 'var(--border)',
                borderRadius: 2,
              }} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeLink !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 20, padding: '18px 24px', borderRadius: 14,
              background: `${bottlenecks[activeLink].color}08`,
              border: `1.5px solid ${bottlenecks[activeLink].color}25`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
              }}>
                <span style={{ fontSize: 24 }}>{bottlenecks[activeLink].icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                    {bottlenecks[activeLink].name}
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: bottlenecks[activeLink].color,
                    fontFamily: 'monospace',
                  }}>
                    Limit: {bottlenecks[activeLink].limit}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                {bottlenecks[activeLink].detail}
              </p>
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
export default function Topic6_FastAPI() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Opening */}
      <Neuron
        mood="excited"
        typed
        message="You've learned about threads (Topic 4) and processes (Topic 5). Now let's see how a REAL web framework puts them together. FastAPI is the most popular Python web framework for AI apps. Let's peek under its hood."
      />

      {/* Section 1: Architecture Stack */}
      <SectionBlock title="FastAPI's Architecture Stack" icon="🏗️" color="#6366f1">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          FastAPI is not just one thing — it is a stack of layers, each with a specific job.
          Click each layer to understand what it does:
        </p>
        <InteractiveDemo title="Stack Explorer">
          <StackExplorer />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron
        mood="thinking"
        typed
        message="See how each layer builds on the one below? Your code sits on top, but Uvicorn at the bottom is doing the heavy lifting — managing the event loop and worker processes. This is where the concurrency magic happens."
      />

      {/* Section 2: Uvicorn Workers — The Concurrency Math */}
      <SectionBlock title="Uvicorn Workers — The Concurrency Math" icon="🔢" color="#10b981">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          How many requests can your server handle? It depends on your hardware, your workers, and whether your app is I/O-bound or CPU-bound. Play with the calculator:
        </p>
        <InteractiveDemo title="Server Configuration Calculator">
          <ServerCalculator />
        </InteractiveDemo>
      </SectionBlock>

      {/* The Detailed Example */}
      <SectionBlock title="The Detailed Example: 2 vCPUs, 2 Workers" icon="🎯" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.7 }}>
          Let us say you have a <strong>2 vCPU server</strong> running a FastAPI app with <strong>2 Uvicorn workers</strong>.
          Each request does this:
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
          marginBottom: 24,
        }}>
          {[
            { step: 'Parse request', time: '2ms', type: 'CPU', color: '#ef4444' },
            { step: 'Call database', time: '50ms', type: 'I/O', color: '#10b981' },
            { step: 'Process result', time: '3ms', type: 'CPU', color: '#ef4444' },
            { step: 'Call OpenAI API', time: '1500ms', type: 'I/O', color: '#10b981' },
            { step: 'Format response', time: '1ms', type: 'CPU', color: '#ef4444' },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '14px 10px', borderRadius: 12, textAlign: 'center',
                background: `${s.color}10`, border: `1.5px solid ${s.color}30`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 4 }}>
                {s.type}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {s.step}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>
                {s.time}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 24,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          fontSize: 15, color: '#166534', lineHeight: 1.7,
        }}>
          Total time: <strong>1,556ms</strong> — but CPU is active only <strong>6ms</strong> (2+3+1).
          That means <strong>99.6% of the time, the CPU is idle</strong>, waiting on I/O!
        </div>

        <InteractiveDemo title="Request Pipeline Animation">
          <RequestPipeline />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron
        mood="explaining"
        typed
        message="This is the KEY insight: for I/O-heavy apps (which most AI apps are), the CPU spends almost all its time waiting. Async lets us USE that waiting time to handle other requests. That is why a tiny 2-vCPU server can handle 500+ concurrent users!"
      />

      {/* Section 3: Sync vs Async */}
      <SectionBlock title="sync vs async Endpoints" icon="🏎️" color="#10b981">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          The difference between <code style={{ background: '#ef444415', color: '#ef4444', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>def</code> and <code style={{ background: '#10b98115', color: '#10b981', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>async def</code> is dramatic.
          Watch them race:
        </p>
        <InteractiveDemo title="Sync vs Async Race">
          <SyncAsyncRace />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 4: Production Formula */}
      <SectionBlock title="The Formula for Production" icon="📐" color="#f59e0b">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Ready to size your real deployment? Use the production calculator — plug in your app's numbers and see exactly what you need:
        </p>
        <InteractiveDemo title="Production Deployment Calculator">
          <ProductionCalculator />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 5: Bottlenecks */}
      <SectionBlock title="Common Bottlenecks" icon="⛓️" color="#ef4444">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Even with perfect async code and optimal worker counts, you will hit limits.
          A chain is only as strong as its <strong style={{ color: '#ef4444' }}>weakest link</strong>:
        </p>
        <InteractiveDemo title="Bottleneck Chain">
          <BottleneckChain />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron
        mood="happy"
        typed
        message="Now you understand how FastAPI really works under the hood — from the layered architecture to the math of concurrency. You can calculate exactly how many requests your server handles and where the bottlenecks are. That is production-level thinking!"
      />

      {/* Section 6: Hindi Explainer */}
      <SectionBlock title="समझें हिंदी में" icon="🇮🇳" color="#ff9933">
        <HindiExplainer
          concept="FastAPI कैसे काम करता है"
          english="FastAPI Under the Hood"
          explanation="FastAPI में Uvicorn server चलता है जो workers (processes) बनाता है। हर worker अपने CPU core पर चलता है। Async/await की वजह से एक worker भी सैकड़ों requests handle कर सकता है — जब एक request database का wait करती है, worker दूसरी request handle कर लेता है।"
          example="2 vCPU server, 2 workers, हर request 1.5 second लेती है लेकिन CPU सिर्फ 6ms busy रहता है। मतलब एक worker 250 requests एक साथ handle कर सकता है — 2 workers = 500 concurrent users एक छोटे server पर!"
          terms={[
            { hindi: 'वर्कर', english: 'Worker', meaning: 'एक process जो requests handle करता है' },
            { hindi: 'एसिंक/अवेट', english: 'Async/Await', meaning: 'I/O wait के दौरान दूसरा काम करने का तरीका' },
            { hindi: 'कनेक्शन पूल', english: 'Connection Pool', meaning: 'Database connections का ready-made pool — हर बार नया बनाने से बचाता है' },
            { hindi: 'थ्रूपुट', english: 'Throughput', meaning: 'प्रति second कितने requests handle हो सकते हैं' },
          ]}
        />
      </SectionBlock>
    </div>
  )
}
