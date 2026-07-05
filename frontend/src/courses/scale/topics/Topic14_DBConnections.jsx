import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 14 — Database Connections & Connection Pooling
   How database connections work under the hood, connection pooling
   strategies, code-level patterns, and production pitfalls.
================================================================ */

/* ---- Connection Lifecycle Visualizer ---- */
function ConnectionLifecycle() {
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)

  const steps = [
    { label: 'DNS Resolve', latency: 2, color: '#3b82f6' },
    { label: 'TCP 3-Way Handshake', latency: 15, color: '#8b5cf6' },
    { label: 'TLS Negotiation', latency: 30, color: '#ec4899' },
    { label: 'DB Authentication', latency: 10, color: '#f59e0b' },
    { label: 'Query Execution', latency: 5, color: '#10b981' },
    { label: 'Response Transfer', latency: 3, color: '#06b6d4' },
    { label: 'Connection Close', latency: 2, color: '#6b7280' },
  ]

  const totalOverhead = steps.reduce((s, x) => s + x.latency, 0) - steps[4].latency
  const totalAll = steps.reduce((s, x) => s + x.latency, 0)

  const handlePlay = () => {
    if (playing) return
    setPlaying(true)
    setStep(-1)
    steps.forEach((_, i) => {
      setTimeout(() => {
        setStep(i)
        if (i === steps.length - 1) {
          setTimeout(() => setPlaying(false), 400)
        }
      }, (i + 1) * 300)
    })
  }

  const handleReset = () => {
    setPlaying(false)
    setStep(-1)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          disabled={playing}
          style={{
            padding: '10px 24px', borderRadius: 12, border: 'none',
            background: playing ? '#6b7280' : '#3b82f6', color: '#fff',
            fontWeight: 600, cursor: playing ? 'default' : 'pointer',
            fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          {playing ? 'Playing...' : 'Play Connection Lifecycle'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          style={{
            padding: '10px 24px', borderRadius: 12,
            border: '2px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)', fontWeight: 600,
            cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          Reset
        </motion.button>
      </div>

      {/* Pipeline blocks */}
      <div style={{
        display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20,
      }}>
        {steps.map((s, i) => {
          const active = i <= step
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <motion.div
                animate={{
                  background: active ? s.color : 'var(--bg-secondary)',
                  borderColor: active ? s.color : 'var(--border)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '10px 12px', borderRadius: 10,
                  border: '2px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  minWidth: 90, textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: active ? '#fff' : 'var(--text-muted)',
                  lineHeight: 1.3, marginBottom: 4,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 800,
                  color: active ? '#fff' : 'var(--text-muted)',
                  fontFamily: 'monospace',
                }}>
                  {s.latency}ms
                </div>
              </motion.div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 12, height: 2,
                  background: i < step ? steps[i].color : 'var(--border)',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {step >= steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ef444415', border: '1.5px solid #ef444440',
            borderRadius: 12, padding: '14px 20px',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
            Total overhead: {totalOverhead}ms for a {steps[4].latency}ms query = {Math.round((totalOverhead / totalAll) * 100)}% wasted on connection setup
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Every single request pays this cost without connection pooling.
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ---- Connection Battle: Dedicated vs Pooled ---- */
function ConnectionBattle() {
  const [mode, setMode] = useState('dedicated')
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState({ connections: 0, errors: 0, avgTime: 0, throughput: 0 })
  const [requests, setRequests] = useState([])

  const TOTAL_REQUESTS = 50
  const POOL_SIZE = 10
  const MAX_CONNECTIONS = 50

  const runSimulation = () => {
    if (running) return
    setRunning(true)
    setRequests([])
    setStats({ connections: 0, errors: 0, avgTime: 0, throughput: 0 })

    const newRequests = []
    let connCount = 0
    let errCount = 0
    let totalTime = 0

    if (mode === 'dedicated') {
      const startTime = Date.now()
      for (let i = 0; i < TOTAL_REQUESTS; i++) {
        setTimeout(() => {
          connCount++
          const hasError = connCount > MAX_CONNECTIONS - 5
          if (hasError) errCount++
          const reqTime = hasError ? 0 : 60 + Math.random() * 20
          totalTime += reqTime
          newRequests.push({
            id: i,
            status: hasError ? 'error' : 'done',
            time: hasError ? 'ERR' : `${Math.round(reqTime)}ms`,
          })
          setRequests([...newRequests])
          setStats({
            connections: connCount,
            errors: errCount,
            avgTime: errCount < connCount ? Math.round(totalTime / (connCount - errCount)) : 0,
            throughput: Math.round(((connCount - errCount) / ((Date.now() - startTime) || 1)) * 1000),
          })
          if (i === TOTAL_REQUESTS - 1) {
            setTimeout(() => {
              setStats(prev => ({ ...prev, totalTime: '~3100ms' }))
              setRunning(false)
            }, 200)
          }
        }, i * 60)
      }
    } else {
      const startTime = Date.now()
      const activeConns = new Array(POOL_SIZE).fill(false)
      let completed = 0
      const queue = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i)

      const processNext = () => {
        if (queue.length === 0) return
        const freeSlot = activeConns.indexOf(false)
        if (freeSlot === -1) {
          setTimeout(processNext, 10)
          return
        }
        const reqId = queue.shift()
        activeConns[freeSlot] = true
        const reqTime = 5 + Math.random() * 10
        totalTime += reqTime

        setTimeout(() => {
          completed++
          activeConns[freeSlot] = false
          newRequests.push({
            id: reqId,
            status: 'done',
            time: `${Math.round(reqTime)}ms`,
          })
          setRequests([...newRequests])
          setStats({
            connections: POOL_SIZE,
            errors: 0,
            avgTime: Math.round(totalTime / completed),
            throughput: Math.round((completed / ((Date.now() - startTime) || 1)) * 1000),
          })
          if (completed === TOTAL_REQUESTS) {
            setStats(prev => ({ ...prev, totalTime: '~500ms' }))
            setRunning(false)
          } else {
            processNext()
          }
        }, reqTime * 3)

        if (queue.length > 0) {
          setTimeout(processNext, 5)
        }
      }

      for (let i = 0; i < Math.min(POOL_SIZE, TOTAL_REQUESTS); i++) {
        setTimeout(processNext, i * 5)
      }
    }
  }

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'dedicated', label: 'Dedicated Connections', color: '#ef4444' },
          { key: 'pooled', label: 'Pooled Connections', color: '#10b981' },
        ].map(m => (
          <motion.button
            key={m.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { if (!running) setMode(m.key) }}
            style={{
              padding: '10px 20px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, fontFamily: 'var(--font-sans)',
              cursor: running ? 'default' : 'pointer',
              border: `2px solid ${mode === m.key ? m.color : 'var(--border)'}`,
              background: mode === m.key ? `${m.color}15` : 'var(--bg-secondary)',
              color: mode === m.key ? m.color : 'var(--text-muted)',
            }}
          >
            {m.label}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runSimulation}
          disabled={running}
          style={{
            padding: '10px 24px', borderRadius: 12, border: 'none',
            background: running ? '#6b7280' : '#3b82f6', color: '#fff',
            fontWeight: 600, cursor: running ? 'default' : 'pointer',
            fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          {running ? 'Running...' : 'Send 50 Requests'}
        </motion.button>
      </div>

      {/* Visual */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Request grid */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 14,
          border: '1px solid var(--border)', padding: 16,
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
            marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            Requests ({requests.length}/{TOTAL_REQUESTS})
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4,
          }}>
            {Array.from({ length: TOTAL_REQUESTS }, (_, i) => {
              const req = requests.find(r => r.id === i)
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: req ? 1 : 0.5 }}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 4,
                    background: req
                      ? req.status === 'error' ? '#ef4444' : '#10b981'
                      : 'var(--border)',
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 14,
          border: '1px solid var(--border)', padding: 16,
        }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
            marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            Stats
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Connections', value: stats.connections, color: '#3b82f6' },
              { label: 'Errors', value: stats.errors, color: stats.errors > 0 ? '#ef4444' : '#10b981' },
              { label: 'Avg Response', value: stats.avgTime ? `${stats.avgTime}ms` : '--', color: '#8b5cf6' },
              { label: 'Total Time', value: stats.totalTime || '--', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{
                background: `${s.color}10`, borderRadius: 10, padding: 12, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Pool visualization for pooled mode */}
          {mode === 'pooled' && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Pool ({POOL_SIZE} connections)
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: POOL_SIZE }, (_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: running ? [1, 0.8, 1] : 1 }}
                    transition={{ repeat: running ? Infinity : 0, duration: 0.5, delay: i * 0.05 }}
                    style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#3b82f6', border: '2px solid #2563eb',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- Pool Config Tuner ---- */
function PoolConfigTuner() {
  const [poolSize, setPoolSize] = useState(10)
  const [maxOverflow, setMaxOverflow] = useState(5)
  const [timeout, setTimeout_] = useState(30)
  const [recycle, setRecycle] = useState(3600)
  const [concurrentLoad, setConcurrentLoad] = useState(20)

  const totalCapacity = poolSize + maxOverflow
  const active = Math.min(concurrentLoad, totalCapacity)
  const idle = Math.max(0, poolSize - active)
  const overflow = Math.max(0, active - poolSize)
  const queueDepth = Math.max(0, concurrentLoad - totalCapacity)
  const avgWait = queueDepth > 0 ? Math.round((queueDepth / totalCapacity) * 45) : 0
  const memoryMB = Math.round(poolSize * 10 + overflow * 10)

  const status = concurrentLoad > totalCapacity
    ? { icon: '🔴', label: 'Pool exhausted!', color: '#ef4444' }
    : poolSize > 30
    ? { icon: '🟡', label: 'High memory usage', color: '#f59e0b' }
    : { icon: '🟢', label: 'Healthy', color: '#10b981' }

  const sliders = [
    { label: 'pool_size', value: poolSize, min: 5, max: 50, set: setPoolSize, tip: 'Number of permanent connections kept open' },
    { label: 'max_overflow', value: maxOverflow, min: 0, max: 20, set: setMaxOverflow, tip: 'Extra connections allowed beyond pool_size under load' },
    { label: 'pool_timeout (s)', value: timeout, min: 5, max: 60, set: setTimeout_, tip: 'Seconds to wait for a connection before raising an error' },
    { label: 'pool_recycle (s)', value: recycle, min: 300, max: 7200, set: setRecycle, tip: 'Seconds before a connection is recycled (replaced)' },
    { label: 'concurrent_load', value: concurrentLoad, min: 10, max: 200, set: setConcurrentLoad, tip: 'Number of simultaneous requests hitting the pool' },
  ]

  return (
    <div>
      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {sliders.map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{
                fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              }}>
                {s.label}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 800, color: '#3b82f6',
                fontFamily: 'monospace',
              }}>
                {s.value}
              </span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              value={s.value}
              onChange={e => s.set(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {s.tip}
            </div>
          </div>
        ))}
      </div>

      {/* Pool visualization */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 14,
        border: '1px solid var(--border)', padding: 20, marginBottom: 16,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)', marginBottom: 12,
        }}>
          Connection Pool State
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {/* Active connections */}
          {Array.from({ length: Math.min(active, poolSize) }, (_, i) => (
            <motion.div key={`active-${i}`} animate={{ scale: [1, 0.9, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
              style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981' }}
              title="Active"
            />
          ))}
          {/* Idle connections */}
          {Array.from({ length: idle }, (_, i) => (
            <div key={`idle-${i}`} style={{
              width: 18, height: 18, borderRadius: '50%', background: '#3b82f6',
            }} title="Idle" />
          ))}
          {/* Overflow connections */}
          {Array.from({ length: overflow }, (_, i) => (
            <div key={`overflow-${i}`} style={{
              width: 18, height: 18, borderRadius: '50%', background: '#f59e0b',
            }} title="Overflow" />
          ))}
          {/* Available slots */}
          {Array.from({ length: Math.max(0, totalCapacity - active - idle) }, (_, i) => (
            <div key={`avail-${i}`} style={{
              width: 18, height: 18, borderRadius: '50%', background: 'var(--border)',
            }} title="Available" />
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { color: '#10b981', label: 'Active' },
            { color: '#3b82f6', label: 'Idle' },
            { color: '#f59e0b', label: 'Overflow' },
            { color: 'var(--border)', label: 'Available' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Active', value: `${active}/${totalCapacity}`, color: '#10b981' },
          { label: 'Queue depth', value: queueDepth, color: queueDepth > 0 ? '#ef4444' : '#10b981' },
          { label: 'Avg wait', value: `${avgWait}ms`, color: avgWait > 30 ? '#ef4444' : '#10b981' },
          { label: 'Memory', value: `~${memoryMB}MB`, color: memoryMB > 300 ? '#f59e0b' : '#10b981' },
        ].map((m, i) => (
          <div key={i} style={{
            background: `${m.color}10`, border: `1.5px solid ${m.color}30`,
            borderRadius: 10, padding: 12, textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: 'monospace' }}>
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Status indicator */}
      <div style={{
        background: `${status.color}10`, border: `1.5px solid ${status.color}40`,
        borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>{status.icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: status.color }}>{status.label}</span>
      </div>
    </div>
  )
}

/* ---- Python Connection Patterns ---- */
function PythonPatterns() {
  const [activePattern, setActivePattern] = useState(0)

  const patterns = [
    {
      tab: '❌ Naive',
      borderColor: '#ef4444',
      code: `import psycopg2

def get_user(user_id):
    # New connection for EVERY request
    conn = psycopg2.connect(
        host="localhost",
        database="myapp",
        user="admin",
        password="secret"
    )
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE id = %s",
        (user_id,)
    )
    result = cursor.fetchone()
    cursor.close()
    conn.close()  # What if an error happens above?
    return result`,
      annotations: [
        { icon: '🛑', text: 'Creates a new TCP connection for every single request (~60ms overhead)' },
        { icon: '⚠️', text: 'If an exception occurs before close(), the connection leaks' },
        { icon: '💣', text: 'No limit on total connections -- can overwhelm the database' },
        { icon: '🐢', text: 'Under load, connection creation becomes the bottleneck' },
      ],
    },
    {
      tab: '⚠️ Basic Pool',
      borderColor: '#f59e0b',
      code: `from psycopg2 import pool

# Create pool once at startup
conn_pool = pool.SimpleConnectionPool(
    minconn=5,
    maxconn=20,
    host="localhost",
    database="myapp",
    user="admin",
    password="secret"
)

def get_user(user_id):
    conn = conn_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE id = %s",
            (user_id,)
        )
        result = cursor.fetchone()
        return result
    finally:
        conn_pool.putconn(conn)  # Always return`,
      annotations: [
        { icon: '✅', text: 'Connections are reused -- no per-request overhead' },
        { icon: '✅', text: 'try/finally ensures connection is returned even on error' },
        { icon: '⚠️', text: 'SimpleConnectionPool is NOT thread-safe -- use ThreadedConnectionPool for web apps' },
        { icon: '⚠️', text: 'No automatic health checks or recycling of stale connections' },
      ],
    },
    {
      tab: '✅ SQLAlchemy',
      borderColor: '#10b981',
      code: `from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    "postgresql://admin:secret@localhost/myapp",
    pool_size=10,       # Permanent connections
    max_overflow=5,     # Extra under load
    pool_timeout=30,    # Wait time for conn
    pool_recycle=3600,  # Replace after 1hr
    pool_pre_ping=True, # Health check
)
Session = sessionmaker(bind=engine)

def get_user(user_id):
    session = Session()
    try:
        user = session.query(User).get(user_id)
        return user
    finally:
        session.close()`,
      annotations: [
        { icon: '✅', text: 'Production-grade pool with size, overflow, timeout, and recycle' },
        { icon: '✅', text: 'pool_pre_ping detects dead connections before using them' },
        { icon: '✅', text: 'Thread-safe by default, handles concurrent requests properly' },
        { icon: '💡', text: 'pool_recycle=3600 prevents firewall idle timeout issues' },
      ],
    },
    {
      tab: '✅ Asyncpg',
      borderColor: '#10b981',
      code: `import asyncpg
import asyncio

async def setup():
    pool = await asyncpg.create_pool(
        host="localhost",
        database="myapp",
        user="admin",
        password="secret",
        min_size=5,
        max_size=20,
        max_inactive_connection_lifetime=300,
    )
    return pool

async def get_user(pool, user_id):
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM users WHERE id = $1",
            user_id
        )
        return row
    # Connection auto-returned to pool`,
      annotations: [
        { icon: '⚡', text: 'Async/await -- non-blocking, handles thousands of concurrent requests' },
        { icon: '✅', text: 'async with auto-returns connection to pool on exit' },
        { icon: '✅', text: 'min_size keeps connections warm, max_size prevents overload' },
        { icon: '🚀', text: '2-5x faster than psycopg2 for high-concurrency workloads' },
      ],
    },
    {
      tab: '🚀 FastAPI',
      borderColor: '#10b981',
      code: `from fastapi import FastAPI, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

engine = create_engine(
    "postgresql://admin:secret@localhost/myapp",
    pool_size=10, max_overflow=5,
    pool_recycle=3600, pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine)
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db          # Dependency injection
    finally:
        db.close()        # Auto-cleanup

@app.get("/users/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(User).get(user_id)`,
      annotations: [
        { icon: '🚀', text: 'Dependency injection via Depends() -- cleanest pattern' },
        { icon: '✅', text: 'yield + finally ensures connection is ALWAYS returned to pool' },
        { icon: '✅', text: 'Each request gets its own session, no cross-request pollution' },
        { icon: '🎯', text: 'This is the standard production pattern for FastAPI + SQLAlchemy' },
      ],
    },
  ]

  const p = patterns[activePattern]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {patterns.map((pat, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActivePattern(i)}
            style={{
              padding: '8px 16px', borderRadius: 10, fontWeight: 700,
              fontSize: 13, fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              border: `2px solid ${i === activePattern ? pat.borderColor : 'var(--border)'}`,
              background: i === activePattern ? `${pat.borderColor}15` : 'var(--bg-secondary)',
              color: i === activePattern ? pat.borderColor : 'var(--text-muted)',
            }}
          >
            {pat.tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activePattern}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16,
          }}>
            {/* Code block */}
            <div style={{
              borderRadius: 12, overflow: 'hidden',
              border: `2px solid ${p.borderColor}`,
            }}>
              <div style={{
                padding: '8px 16px', background: p.borderColor,
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                Python
              </div>
              <pre style={{
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                fontSize: 13, background: '#1e293b', color: '#e2e8f0',
                padding: 20, margin: 0, overflowX: 'auto', lineHeight: 1.6,
              }}>
                {p.code}
              </pre>
            </div>

            {/* Annotations */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 16,
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
                marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                What Happens
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {p.annotations.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      display: 'flex', gap: 8, alignItems: 'flex-start',
                      fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{a.icon}</span>
                    <span>{a.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Database Connection Model Comparison ---- */
function DBModelComparison() {
  const [activeDB, setActiveDB] = useState(0)

  const databases = [
    {
      tab: '🐘 PostgreSQL',
      color: '#3b82f6',
      model: 'Process-per-connection',
      memPerConn: '~10MB',
      defaultMax: '100',
      poolLib: 'psycopg2.pool',
      archDiagram: [
        { label: 'Client App', color: '#3b82f6' },
        { label: 'postmaster', color: '#8b5cf6' },
        { label: 'Fork Process', color: '#ec4899' },
        { label: 'Shared Buffers', color: '#10b981' },
      ],
      connString: {
        parts: [
          { text: 'postgresql://', color: '#8b5cf6', label: 'protocol' },
          { text: 'admin:secret', color: '#ef4444', label: 'user:pass' },
          { text: '@', color: '#6b7280', label: '' },
          { text: 'db.example.com', color: '#3b82f6', label: 'host' },
          { text: ':5432', color: '#f59e0b', label: 'port' },
          { text: '/myapp', color: '#10b981', label: 'database' },
          { text: '?sslmode=require', color: '#ec4899', label: 'params' },
        ],
      },
      poolCode: `from psycopg2 import pool

db_pool = pool.ThreadedConnectionPool(
    minconn=5,
    maxconn=20,
    host="db.example.com",
    port=5432,
    database="myapp",
    user="admin",
    password="secret",
    sslmode="require"
)`,
    },
    {
      tab: '🐬 MySQL',
      color: '#f59e0b',
      model: 'Thread-per-connection',
      memPerConn: '~1MB',
      defaultMax: '151',
      poolLib: 'mysql.connector.pooling',
      archDiagram: [
        { label: 'Client App', color: '#3b82f6' },
        { label: 'Connection Manager', color: '#f59e0b' },
        { label: 'Thread', color: '#ec4899' },
        { label: 'Buffer Pool (InnoDB)', color: '#10b981' },
      ],
      connString: {
        parts: [
          { text: 'mysql://', color: '#f59e0b', label: 'protocol' },
          { text: 'admin:secret', color: '#ef4444', label: 'user:pass' },
          { text: '@', color: '#6b7280', label: '' },
          { text: 'db.example.com', color: '#3b82f6', label: 'host' },
          { text: ':3306', color: '#f59e0b', label: 'port' },
          { text: '/myapp', color: '#10b981', label: 'database' },
          { text: '?charset=utf8mb4', color: '#ec4899', label: 'params' },
        ],
      },
      poolCode: `import mysql.connector.pooling

db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=10,
    host="db.example.com",
    port=3306,
    database="myapp",
    user="admin",
    password="secret",
    charset="utf8mb4"
)`,
    },
    {
      tab: '🍃 MongoDB',
      color: '#10b981',
      model: 'Shared thread pool',
      memPerConn: '~1MB',
      defaultMax: '65536',
      poolLib: 'pymongo MongoClient',
      archDiagram: [
        { label: 'Client App', color: '#3b82f6' },
        { label: 'MongoClient (driver pool)', color: '#10b981' },
        { label: 'Thread Pool (mongod)', color: '#ec4899' },
        { label: 'WiredTiger Cache', color: '#f59e0b' },
      ],
      connString: {
        parts: [
          { text: 'mongodb://', color: '#10b981', label: 'protocol' },
          { text: 'admin:secret', color: '#ef4444', label: 'user:pass' },
          { text: '@', color: '#6b7280', label: '' },
          { text: 'cluster0.abc.mongodb.net', color: '#3b82f6', label: 'host' },
          { text: ':27017', color: '#f59e0b', label: 'port' },
          { text: '/myapp', color: '#10b981', label: 'database' },
          { text: '?retryWrites=true', color: '#ec4899', label: 'params' },
        ],
      },
      poolCode: `from pymongo import MongoClient

client = MongoClient(
    host="cluster0.abc.mongodb.net",
    port=27017,
    username="admin",
    password="secret",
    authSource="myapp",
    maxPoolSize=50,
    minPoolSize=5,
    maxIdleTimeMS=30000,
)
db = client["myapp"]`,
    },
  ]

  const db = databases[activeDB]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {databases.map((d, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveDB(i)}
            style={{
              padding: '10px 20px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, fontFamily: 'var(--font-sans)', cursor: 'pointer',
              border: `2px solid ${i === activeDB ? d.color : 'var(--border)'}`,
              background: i === activeDB ? `${d.color}15` : 'var(--bg-secondary)',
              color: i === activeDB ? d.color : 'var(--text-muted)',
            }}
          >
            {d.tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDB}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {/* Architecture diagram */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14,
            border: '1px solid var(--border)', padding: 20, marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
              Architecture
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {db.archDiagram.map((block, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      padding: '10px 16px', borderRadius: 10,
                      background: `${block.color}15`, border: `2px solid ${block.color}`,
                      fontSize: 13, fontWeight: 700, color: block.color,
                      textAlign: 'center',
                    }}
                  >
                    {block.label}
                  </motion.div>
                  {i < db.archDiagram.length - 1 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 18, fontWeight: 700 }}>&rarr;</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Connection string */}
          <div style={{
            background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>
              Connection String
            </div>
            <div style={{ fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: 14 }}>
              {db.connString.parts.map((part, i) => (
                <span key={i} style={{ color: part.color }} title={part.label}>{part.text}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {db.connString.parts.filter(p => p.label).map((part, i) => (
                <span key={i} style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: `${part.color}20`, color: part.color, fontWeight: 600,
                }}>
                  {part.label}
                </span>
              ))}
            </div>
          </div>

          {/* Key stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16,
          }}>
            {[
              { label: 'Model', value: db.model, color: db.color },
              { label: 'Memory/conn', value: db.memPerConn, color: '#8b5cf6' },
              { label: 'Default max', value: db.defaultMax, color: '#f59e0b' },
              { label: 'Pool library', value: db.poolLib, color: '#ec4899' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: `${stat.color}10`, border: `1.5px solid ${stat.color}30`,
                borderRadius: 10, padding: 12, textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: stat.color, marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Pool code */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${db.color}` }}>
            <div style={{
              padding: '8px 16px', background: db.color,
              fontSize: 12, fontWeight: 700, color: '#fff',
            }}>
              Python Pool Setup
            </div>
            <pre style={{
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              fontSize: 13, background: '#1e293b', color: '#e2e8f0',
              padding: 20, margin: 0, overflowX: 'auto', lineHeight: 1.6,
            }}>
              {db.poolCode}
            </pre>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Comparison table -- always visible */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)', marginBottom: 12,
        }}>
          Side-by-Side Comparison
        </div>
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontSize: 13,
            fontFamily: 'var(--font-sans)',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Feature</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#3b82f6', borderBottom: '1px solid var(--border)' }}>PostgreSQL</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#f59e0b', borderBottom: '1px solid var(--border)' }}>MySQL</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#10b981', borderBottom: '1px solid var(--border)' }}>MongoDB</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Worker Model', pg: 'OS Process', my: 'OS Thread', mo: 'Thread Pool' },
                { feature: 'Memory/Connection', pg: '~10MB', my: '~1MB', mo: '~1MB' },
                { feature: 'Default Max Connections', pg: '100', my: '151', mo: '65,536' },
                { feature: 'Pool Library', pg: 'psycopg2.pool', my: 'mysql.connector', mo: 'pymongo' },
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>{row.feature}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.pg}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.my}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.mo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ---- Connection Bug Detector ---- */
function ConnectionBugDetector() {
  const [activeBug, setActiveBug] = useState(null)

  const bugs = [
    {
      title: 'Connection Leak',
      icon: '💧',
      color: '#ef4444',
      bugCode: `def get_user(user_id):
    conn = pool.getconn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    return result
    # putconn() never called! Connection leaked.`,
      whatHappens: 'Pool drains from 10 available connections down to 0. New requests block, then timeout. App grinds to a halt.',
      poolDrain: true,
      fixCode: `def get_user(user_id):
    conn = pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        return cursor.fetchone()
    finally:
        pool.putconn(conn)  # ALWAYS return connection`,
    },
    {
      title: 'Thundering Herd',
      icon: '🐂',
      color: '#f59e0b',
      bugCode: `engine = create_engine(
    "postgresql://...",
    pool_size=100,
    pool_recycle=3600  # All recycle at same time!
)`,
      whatHappens: 'All 100 connections were created at startup. After exactly 3600s, ALL expire simultaneously. 100 new TCP+TLS handshakes hit the database at once. CPU spikes to 100%.',
      poolDrain: false,
      fixCode: `engine = create_engine(
    "postgresql://...",
    pool_size=100,
    pool_recycle=3600,
    pool_pre_ping=True,     # Stagger reconnections
    pool_reset_on_return="rollback"
)
# Or use PgBouncer for external pooling`,
    },
    {
      title: 'Firewall Idle Timeout',
      icon: '🔥',
      color: '#8b5cf6',
      bugCode: `# AWS NLB idle timeout = 350s (default)
engine = create_engine(
    "postgresql://rds-instance...",
    pool_size=10,
    pool_recycle=7200  # Recycle every 2 hours
)
# Connections sit idle for >350s between requests`,
      whatHappens: 'The load balancer silently kills idle connections after 350s. The pool thinks they are alive. Next query gets "connection reset by peer" or hangs.',
      poolDrain: false,
      fixCode: `engine = create_engine(
    "postgresql://rds-instance...",
    pool_size=10,
    pool_recycle=300,       # < firewall timeout!
    pool_pre_ping=True,     # Verify before use
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 60,
    }
)`,
    },
    {
      title: 'Zombie Transactions',
      icon: '🧟',
      color: '#dc2626',
      bugCode: `def transfer(from_id, to_id, amount):
    conn = pool.getconn()
    cursor = conn.cursor()
    cursor.execute("BEGIN")
    cursor.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (amount, from_id))
    # Exception here! BEGIN without COMMIT/ROLLBACK
    cursor.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (amount, to_id))
    cursor.execute("COMMIT")
    pool.putconn(conn)`,
      whatHappens: 'An open transaction holds row-level locks forever. Other queries trying to access those rows are blocked. Eventually the entire table becomes inaccessible.',
      poolDrain: false,
      fixCode: `def transfer(from_id, to_id, amount):
    conn = pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute("BEGIN")
        cursor.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (amount, from_id))
        cursor.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (amount, to_id))
        cursor.execute("COMMIT")
    except Exception:
        conn.rollback()   # ALWAYS rollback on error
        raise
    finally:
        pool.putconn(conn)`,
    },
  ]

  return (
    <div>
      {/* Bug cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {bugs.map((bug, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveBug(activeBug === i ? null : i)}
            style={{
              background: activeBug === i ? `${bug.color}15` : 'var(--bg-card)',
              border: `2px solid ${activeBug === i ? bug.color : 'var(--border)'}`,
              borderRadius: 14, padding: 16, textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{bug.icon}</div>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: activeBug === i ? bug.color : 'var(--text-primary)',
            }}>
              {bug.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded bug detail */}
      <AnimatePresence mode="wait">
        {activeBug !== null && (
          <motion.div
            key={activeBug}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--bg-card)', border: `2px solid ${bugs[activeBug].color}40`,
              borderRadius: 16, padding: 24,
            }}>
              <div style={{
                fontSize: 18, fontWeight: 800, color: bugs[activeBug].color,
                fontFamily: 'var(--font-heading)', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>{bugs[activeBug].icon}</span> {bugs[activeBug].title}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Bug code */}
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: '#ef4444',
                    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    The Bug
                  </div>
                  <pre style={{
                    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                    fontSize: 12, background: '#1e293b', color: '#e2e8f0',
                    padding: 16, borderRadius: 10, overflowX: 'auto',
                    lineHeight: 1.6, margin: 0,
                    border: '2px solid #ef4444',
                  }}>
                    {bugs[activeBug].bugCode}
                  </pre>
                </div>

                {/* Fix code */}
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: '#10b981',
                    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    The Fix
                  </div>
                  <pre style={{
                    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                    fontSize: 12, background: '#1e293b', color: '#e2e8f0',
                    padding: 16, borderRadius: 10, overflowX: 'auto',
                    lineHeight: 1.6, margin: 0,
                    border: '2px solid #10b981',
                  }}>
                    {bugs[activeBug].fixCode}
                  </pre>
                </div>
              </div>

              {/* What happens visual */}
              <div style={{
                marginTop: 16, padding: '14px 18px', borderRadius: 12,
                background: `${bugs[activeBug].color}10`,
                border: `1.5px solid ${bugs[activeBug].color}30`,
              }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: bugs[activeBug].color,
                  marginBottom: 6, textTransform: 'uppercase',
                }}>
                  What Happens
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {bugs[activeBug].whatHappens}
                </div>

                {/* Pool drain animation for connection leak */}
                {bugs[activeBug].poolDrain && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Pool Status Over Time:
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {Array.from({ length: 10 }, (_, i) => (
                        <motion.div
                          key={i}
                          initial={{ background: '#10b981' }}
                          animate={{ background: '#ef4444' }}
                          transition={{ delay: i * 0.3 }}
                          style={{
                            width: 24, height: 24, borderRadius: '50%',
                          }}
                        />
                      ))}
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                        Available &rarr; Leaked
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic14_DBConnections() {
  return (
    <div style={{
      maxWidth: 860,
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* ---- Title ---- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 38,
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Database Connections & Connection Pooling
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto',
        }}>
          How database connections work under the hood, why pooling is essential, and the production patterns that keep your app alive at scale.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* ---- Section 1: How a Database Connection Actually Works ---- */}
        <SectionBlock title="How a Database Connection Actually Works" icon="🔗" color="#3b82f6">
          <Neuron
            mood="explaining"
            message="Every database request starts with a handshake -- like getting through airport security just to ask one question. Let me show you..."
          />

          <div style={{ marginTop: 20 }}>
            <InteractiveDemo title="Connection Lifecycle Visualizer">
              <ConnectionLifecycle />
            </InteractiveDemo>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginTop: 16,
            }}
          >
            Without connection pooling, every API request pays the full 60ms+ connection setup cost. For a 5ms query, that means 92% of the time is wasted just establishing and tearing down the connection. At 1000 requests per second, that is 60 seconds of pure overhead every second.
          </motion.div>
        </SectionBlock>

        {/* ---- Section 2: Dedicated vs Pooled Connections ---- */}
        <SectionBlock title="Dedicated vs Pooled Connections" icon="🏊" color="#8b5cf6">
          <Neuron
            mood="thinking"
            message="Imagine hiring a private taxi for every single errand vs having a fleet of shared taxis waiting at a stand. That's dedicated vs pooled connections."
          />

          <div style={{ marginTop: 20 }}>
            <InteractiveDemo title="Connection Battle -- Dedicated vs Pooled">
              <ConnectionBattle />
            </InteractiveDemo>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginTop: 16,
            }}
          >
            Dedicated connections create and destroy a connection per request. Under load, you hit the database max_connections limit and new requests start failing. Pooled connections reuse a fixed set of connections, so even under heavy load, requests queue and complete rather than crashing. The difference: ~3100ms with errors vs ~500ms with zero errors.
          </motion.div>
        </SectionBlock>

        {/* ---- Section 3: Pool Configuration Deep Dive ---- */}
        <SectionBlock title="Pool Configuration Deep Dive" icon="⚙️" color="#10b981">
          <Neuron
            mood="explaining"
            message="Four knobs control everything: pool_size, max_overflow, pool_timeout, and pool_recycle. Get these wrong and your app either crashes or wastes resources."
          />

          <div style={{ marginTop: 20 }}>
            <InteractiveDemo title="Pool Config Tuner">
              <PoolConfigTuner />
            </InteractiveDemo>
          </div>
        </SectionBlock>

        {/* ---- Section 4: Code-Level Connection Management ---- */}
        <SectionBlock title="Code-Level Connection Management" icon="🐍" color="#f59e0b">
          <Neuron
            mood="happy"
            message="Let me show you 5 Python patterns -- from the 'please never do this' to the production-grade way."
          />

          <div style={{ marginTop: 20 }}>
            <InteractiveDemo title="Python Connection Patterns">
              <PythonPatterns />
            </InteractiveDemo>
          </div>

          <HindiExplainer
            concept="कोड-लेवल कनेक्शन मैनेजमेंट"
            english="Code-Level Connection Management"
            explanation="Python में database connection manage करना ज़रूरी है। Naive approach में हर request पर नया connection बनता है — जैसे हर बार नई taxi बुलाना। Pool approach में पहले से taxi ready रहती हैं — बस बैठो और चलो। SQLAlchemy और FastAPI में pool automatically manage होता है — आपको बस configure करना है। Production में हमेशा pool use करो, और try/finally या context manager से connection return करो।"
          />
        </SectionBlock>

        {/* ---- Section 5: SQL vs NoSQL Connection Models ---- */}
        <SectionBlock title="SQL vs NoSQL Connection Models" icon="🔀" color="#ec4899">
          <Neuron
            mood="thinking"
            message="PostgreSQL spawns a full OS process per connection. MySQL creates a thread. MongoDB uses a shared thread pool. Each model has very different resource costs."
          />

          <div style={{ marginTop: 20 }}>
            <InteractiveDemo title="Database Connection Model Comparison">
              <DBModelComparison />
            </InteractiveDemo>
          </div>
        </SectionBlock>

        {/* ---- Section 6: Production Connection Pitfalls ---- */}
        <SectionBlock title="Production Connection Pitfalls" icon="💀" color="#dc2626">
          <Neuron
            mood="excited"
            message="These are the bugs that page you at 3 AM. Let me show you the four horsemen of connection disasters."
          />

          <div style={{ marginTop: 20 }}>
            <InteractiveDemo title="Connection Bug Detector">
              <ConnectionBugDetector />
            </InteractiveDemo>
          </div>
        </SectionBlock>

        {/* ---- Section 7: Hindi Summary ---- */}
        <SectionBlock title="Hindi Summary" icon="🇮🇳" color="#ff9933">
          <HindiExplainer
            concept="कनेक्शन पूलिंग"
            english="Connection Pooling"
            explanation="Database connection pooling एक technique है जिसमें हम पहले से कुछ connections बनाकर रख लेते हैं — जैसे Ola/Uber में drivers पहले से ready रहते हैं। बिना pool के, हर request पर नया connection बनाना पड़ता है (TCP handshake, TLS, authentication) — जिसमें 60ms+ लगते हैं। Pool में पहले से बने connections reuse होते हैं — सिर्फ 1-2ms लगते हैं। pool_size बताता है कितने connections ready रखने हैं, max_overflow बताता है emergency में कितने extra बन सकते हैं, pool_timeout बताता है कितनी देर queue में wait करें, और pool_recycle बताता है कितनी देर बाद पुराने connections replace करें। PostgreSQL में हर connection एक पूरा process लेता है (~10MB), MySQL में thread (~1MB), MongoDB में shared thread pool। Production में हमेशा connection pool use करो!"
          />
        </SectionBlock>

      </div>
    </div>
  )
}
