import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 10 — The Optimization Playbook
   Caching, Connection Pooling, Async I/O, Batching, CDN
================================================================ */

/* ---- Cache Hit Simulator ---- */
function CacheHitSimulator() {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [requestLog, setRequestLog] = useState([])
  const [currentReq, setCurrentReq] = useState(-1)

  const queries = [
    'What is React?', 'How does HTTP work?', 'What is REST?', 'Explain DNS', 'What is TCP?',
    'What is React?', 'How does HTTP work?', 'What is React?', 'Explain DNS', 'What is REST?',
    'What is React?', 'How does HTTP work?', 'What is TCP?', 'What is REST?', 'Explain DNS',
    'What is React?', 'How does HTTP work?', 'What is TCP?', 'What is REST?', 'Explain DNS',
  ]

  const runSimulation = () => {
    setRunning(true)
    setRequestLog([])
    setResults(null)
    setCurrentReq(-1)
    const cache = new Set()
    const log = []
    let missCount = 0
    let hitCount = 0

    queries.forEach((q, i) => {
      setTimeout(() => {
        const isHit = cache.has(q)
        if (!isHit) { cache.add(q); missCount++ } else { hitCount++ }
        log.push({ query: q, hit: isHit, index: i })
        setRequestLog([...log])
        setCurrentReq(i)

        if (i === queries.length - 1) {
          setTimeout(() => {
            const noCacheTime = 20 * 50
            const withCacheTime = missCount * 50 + hitCount * 1
            setResults({
              noCacheTime,
              withCacheTime,
              noCacheQueries: 20,
              withCacheQueries: missCount,
              hitRate: ((hitCount / 20) * 100).toFixed(0),
            })
            setRunning(false)
          }, 300)
        }
      }, i * 150)
    })
  }

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={runSimulation}
        disabled={running}
        style={{
          padding: '12px 28px', borderRadius: 12, border: 'none',
          background: running ? '#94a3b8' : 'var(--accent)',
          color: '#fff', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
          fontSize: 14, fontFamily: 'var(--font-sans)', marginBottom: 20,
        }}
      >
        {running ? 'Sending 20 requests...' : 'Send 20 Requests'}
      </motion.button>

      {/* Request flow visualization */}
      <div style={{
        display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20, minHeight: 40,
      }}>
        {requestLog.map((r, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: r.hit ? '#10b981' : '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: '#fff', fontWeight: 700,
              boxShadow: r.hit
                ? '0 0 12px rgba(16,185,129,0.5)'
                : '0 0 12px rgba(245,158,11,0.4)',
            }}
          >
            {r.hit ? 'H' : 'M'}
          </motion.div>
        ))}
      </div>

      {requestLog.length > 0 && (
        <div style={{
          display: 'flex', gap: 12, marginBottom: 16, fontSize: 13,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: 4, background: '#10b981', display: 'inline-block',
            }} />
            Cache Hit (1ms)
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: 4, background: '#f59e0b', display: 'inline-block',
            }} />
            Cache Miss (50ms)
          </span>
        </div>
      )}

      {/* Results comparison */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            }}
          >
            <div style={{
              background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 16,
              padding: 20, textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: '#991b1b', fontWeight: 700, marginBottom: 8 }}>
                Without Cache
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>
                {results.noCacheTime}ms
              </div>
              <div style={{ fontSize: 12, color: '#991b1b', marginTop: 4 }}>
                {results.noCacheQueries} DB queries
              </div>
            </div>
            <div style={{
              background: '#ecfdf5', border: '2px solid #6ee7b7', borderRadius: 16,
              padding: 20, textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: '#065f46', fontWeight: 700, marginBottom: 8 }}>
                With Cache
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
                {results.withCacheTime}ms
              </div>
              <div style={{ fontSize: 12, color: '#065f46', marginTop: 4 }}>
                {results.withCacheQueries} DB queries
              </div>
            </div>
            <div style={{
              gridColumn: '1 / -1', textAlign: 'center',
              background: 'var(--bg-secondary)', borderRadius: 12, padding: 14,
              border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Cache Hit Rate: </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
                {results.hitRate}%
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 16 }}>Speedup: </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-heading)' }}>
                {(results.noCacheTime / results.withCacheTime).toFixed(1)}x
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Caching Strategies Visual ---- */
function CachingStrategies() {
  const [active, setActive] = useState(0)
  const strategies = [
    {
      name: 'Response Cache',
      icon: '📦',
      color: '#3b82f6',
      desc: 'Cache entire API responses for identical queries.',
      example: 'Query: "What is React?" -> Cache full response. Next identical query returns cached response instantly.',
      hitCondition: 'Exact string match',
      bestFor: 'FAQ-style queries, repeated lookups',
    },
    {
      name: 'Semantic Cache',
      icon: '🧠',
      color: '#8b5cf6',
      desc: 'Cache LLM responses for SIMILAR questions using embedding similarity.',
      example: '"What is React?" and "Tell me about React" -> Same cached answer! Embeddings match with 0.95 similarity.',
      hitCondition: 'Embedding similarity > 0.9',
      bestFor: 'LLM/AI apps with varied natural language queries',
    },
    {
      name: 'Computed Cache',
      icon: '🔢',
      color: '#ec4899',
      desc: 'Cache expensive computations like embeddings, aggregations, or transforms.',
      example: 'Embedding for "React tutorial" computed once (50ms) -> reused 100x from cache (0.1ms each).',
      hitCondition: 'Input hash match',
      bestFor: 'Embedding generation, data aggregation, heavy transforms',
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {strategies.map((s, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActive(i)}
            style={{
              padding: '10px 18px', borderRadius: 12, border: '2px solid',
              borderColor: active === i ? s.color : 'var(--border)',
              background: active === i ? `${s.color}15` : 'var(--bg-secondary)',
              color: active === i ? s.color : 'var(--text-muted)',
              fontWeight: 700, cursor: 'pointer', fontSize: 13,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {s.icon} {s.name}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{
            background: `${strategies[active].color}08`,
            border: `1px solid ${strategies[active].color}30`,
            borderRadius: 16, padding: 24,
          }}
        >
          <div style={{
            fontSize: 18, fontWeight: 800, color: strategies[active].color,
            fontFamily: 'var(--font-heading)', marginBottom: 8,
          }}>
            {strategies[active].icon} {strategies[active].name}
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
            {strategies[active].desc}
          </p>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: 14,
            border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)',
            fontFamily: 'monospace', lineHeight: 1.8, marginBottom: 12,
          }}>
            {strategies[active].example}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Hit condition: </span>
              <strong style={{ color: strategies[active].color }}>{strategies[active].hitCondition}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Best for: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{strategies[active].bestFor}</strong>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Connection Pool Simulator ---- */
function ConnectionPoolSimulator() {
  const [running, setRunning] = useState(false)
  const [noPoolConns, setNoPoolConns] = useState([])
  const [poolConns, setPoolConns] = useState(
    Array.from({ length: 20 }, (_, i) => ({ id: i, status: 'idle' }))
  )
  const [noPoolStats, setNoPoolStats] = useState({ created: 0, errors: 0, time: 0 })
  const [poolStats, setPoolStats] = useState({ reused: 0, queued: 0, time: 0 })

  const simulate = () => {
    setRunning(true)
    setNoPoolConns([])
    setNoPoolStats({ created: 0, errors: 0, time: 0 })
    setPoolStats({ reused: 0, queued: 0, time: 0 })
    setPoolConns(Array.from({ length: 20 }, (_, i) => ({ id: i, status: 'idle' })))

    const totalRequests = 100
    let npCreated = 0
    let npErrors = 0
    let pReused = 0
    let pQueued = 0

    // Simulate no-pool side
    for (let i = 0; i < totalRequests; i++) {
      setTimeout(() => {
        if (npCreated >= 200) {
          npErrors++
          setNoPoolConns(prev => [...prev.slice(-40), { id: i, status: 'error' }])
        } else {
          npCreated++
          setNoPoolConns(prev => [...prev.slice(-40), { id: i, status: 'active' }])
          // Connection dies after a while
          setTimeout(() => {
            setNoPoolConns(prev =>
              prev.map(c => c.id === i ? { ...c, status: 'closed' } : c)
            )
          }, 800)
        }
        setNoPoolStats({ created: npCreated, errors: npErrors, time: (i + 1) * 30 })

        if (i === totalRequests - 1) {
          setTimeout(() => setRunning(false), 500)
        }
      }, i * 40)
    }

    // Simulate pool side
    for (let i = 0; i < totalRequests; i++) {
      setTimeout(() => {
        const connIdx = i % 20
        pReused++
        if (i >= 20) pQueued++
        setPoolConns(prev =>
          prev.map((c, idx) => idx === connIdx ? { ...c, status: 'active' } : c)
        )
        setTimeout(() => {
          setPoolConns(prev =>
            prev.map((c, idx) => idx === connIdx ? { ...c, status: 'idle' } : c)
          )
        }, 300)
        setPoolStats({ reused: pReused, queued: pQueued, time: (i + 1) * 5 })
      }, i * 40)
    }
  }

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={simulate}
        disabled={running}
        style={{
          padding: '12px 28px', borderRadius: 12, border: 'none',
          background: running ? '#94a3b8' : 'var(--accent)',
          color: '#fff', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
          fontSize: 14, fontFamily: 'var(--font-sans)', marginBottom: 20,
        }}
      >
        {running ? 'Simulating 100 requests...' : 'Simulate 100 Concurrent Requests'}
      </motion.button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* No Pool */}
        <div style={{
          background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 16, padding: 20,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: '#991b1b', marginBottom: 12,
            fontFamily: 'var(--font-heading)',
          }}>
            No Pool
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 12, minHeight: 60,
          }}>
            {noPoolConns.slice(-40).map((c, i) => (
              <motion.div
                key={`np-${c.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: 8, height: 20, borderRadius: 3,
                  background: c.status === 'active' ? '#f59e0b'
                    : c.status === 'error' ? '#ef4444' : '#d1d5db',
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#991b1b', lineHeight: 2 }}>
            <div>Connections created: <strong>{noPoolStats.created}</strong></div>
            <div>Errors (limit hit): <strong style={{ color: '#dc2626' }}>{noPoolStats.errors}</strong></div>
            <div>Overhead: <strong>{noPoolStats.created * 30}ms</strong> (TCP+auth)</div>
          </div>
        </div>

        {/* With Pool */}
        <div style={{
          background: '#ecfdf5', border: '2px solid #6ee7b7', borderRadius: 16, padding: 20,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: '#065f46', marginBottom: 12,
            fontFamily: 'var(--font-heading)',
          }}>
            With Pool (20 connections)
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12, minHeight: 60,
          }}>
            {poolConns.map((c) => (
              <motion.div
                key={`p-${c.id}`}
                animate={{
                  background: c.status === 'active' ? '#10b981' : '#a7f3d0',
                  scale: c.status === 'active' ? 1.2 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  width: 16, height: 24, borderRadius: 4,
                  border: '1px solid #059669',
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#065f46', lineHeight: 2 }}>
            <div>Pool size: <strong>20</strong> (pre-created)</div>
            <div>Times reused: <strong style={{ color: '#059669' }}>{poolStats.reused}</strong></div>
            <div>Overhead: <strong>0ms</strong> (pre-warmed)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Async I/O Visualizer ---- */
function AsyncVisualizer() {
  const [mode, setMode] = useState('sync')

  const tasks = [
    { name: 'A', cpu1: 2, io: 100, cpu2: 2, color: '#3b82f6' },
    { name: 'B', cpu1: 3, io: 200, cpu2: 1, color: '#8b5cf6' },
    { name: 'C', cpu1: 1, io: 150, cpu2: 3, color: '#ec4899' },
    { name: 'D', cpu1: 4, io: 80, cpu2: 2, color: '#f59e0b' },
    { name: 'E', cpu1: 2, io: 120, cpu2: 1, color: '#10b981' },
  ]

  const syncTotal = tasks.reduce((sum, t) => sum + t.cpu1 + t.io + t.cpu2, 0)
  const asyncTotal = Math.max(...tasks.map(t => t.cpu1 + t.io + t.cpu2))

  const syncWidth = 400
  const scale = syncWidth / syncTotal

  // Calculate sync positions: tasks run sequentially
  let syncOffset = 0
  const syncBars = tasks.map(t => {
    const bar = { ...t, start: syncOffset, width: (t.cpu1 + t.io + t.cpu2) * scale }
    syncOffset += t.cpu1 + t.io + t.cpu2
    return bar
  })

  // Calculate async positions: I/O overlaps
  const asyncScale = syncWidth / asyncTotal
  const asyncBars = tasks.map((t, i) => ({
    ...t,
    start: 0,
    cpuWidth1: t.cpu1 * asyncScale,
    ioWidth: t.io * asyncScale,
    cpuWidth2: t.cpu2 * asyncScale,
    totalWidth: (t.cpu1 + t.io + t.cpu2) * asyncScale,
    ioStart: t.cpu1 * asyncScale,
  }))

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['sync', 'async'].map(m => (
          <motion.button
            key={m}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode(m)}
            style={{
              padding: '10px 24px', borderRadius: 12, border: '2px solid',
              borderColor: mode === m ? 'var(--accent)' : 'var(--border)',
              background: mode === m ? 'var(--accent)' : 'var(--bg-secondary)',
              color: mode === m ? '#fff' : 'var(--text-muted)',
              fontWeight: 700, cursor: 'pointer', fontSize: 13,
              fontFamily: 'var(--font-sans)', textTransform: 'uppercase',
            }}
          >
            {m === 'sync' ? 'Synchronous' : 'Asynchronous'}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'sync' ? (
          <motion.div
            key="sync"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Each task must finish before the next one starts:
            </div>
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 12, padding: 20,
              border: '1px solid var(--border)', overflowX: 'auto',
            }}>
              {syncBars.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    width: 30, fontSize: 13, fontWeight: 700, color: t.color,
                  }}>
                    {t.name}
                  </span>
                  <div style={{ position: 'relative', height: 24, flex: 1 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: t.width }}
                      transition={{ delay: i * 0.2, duration: 0.5 }}
                      style={{
                        position: 'absolute', left: t.start * (100 / syncWidth) + '%',
                        height: '100%', borderRadius: 6, background: t.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#fff', fontWeight: 700,
                      }}
                    >
                      {t.cpu1 + t.io + t.cpu2}ms
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              textAlign: 'center', marginTop: 16, fontSize: 20, fontWeight: 800,
              color: '#dc2626', fontFamily: 'var(--font-heading)',
            }}>
              Total: {syncTotal}ms
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              I/O wait time overlaps -- CPU works on other tasks while waiting:
            </div>
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 12, padding: 20,
              border: '1px solid var(--border)', overflowX: 'auto',
            }}>
              {asyncBars.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    width: 30, fontSize: 13, fontWeight: 700, color: t.color,
                  }}>
                    {t.name}
                  </span>
                  <div style={{ position: 'relative', height: 24, flex: 1 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: t.totalWidth }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      style={{
                        height: '100%', borderRadius: 6,
                        display: 'flex', overflow: 'hidden',
                      }}
                    >
                      {/* CPU1 */}
                      <div style={{
                        width: t.cpuWidth1, background: t.color, height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: '#fff', fontWeight: 700,
                      }}>
                        {t.cpu1 > 2 ? 'CPU' : ''}
                      </div>
                      {/* I/O wait */}
                      <div style={{
                        width: t.ioWidth, background: `${t.color}35`, height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: t.color, fontWeight: 700,
                        borderTop: `2px dashed ${t.color}`,
                        borderBottom: `2px dashed ${t.color}`,
                      }}>
                        I/O wait
                      </div>
                      {/* CPU2 */}
                      <div style={{
                        width: t.cpuWidth2, background: t.color, height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: '#fff', fontWeight: 700,
                      }}>
                        {t.cpu2 > 2 ? 'CPU' : ''}
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              textAlign: 'center', marginTop: 16, fontSize: 20, fontWeight: 800,
              color: '#059669', fontFamily: 'var(--font-heading)',
            }}>
              Total: ~{asyncTotal}ms
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginLeft: 12 }}>
                ({(syncTotal / asyncTotal).toFixed(1)}x faster!)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Batch Size Optimizer ---- */
function BatchOptimizer() {
  const [batchSize, setBatchSize] = useState(10)
  const totalItems = 100
  const overheadPerCall = 200

  const numCalls = Math.ceil(totalItems / batchSize)
  const totalOverhead = numCalls * overheadPerCall
  const avgLatency = batchSize * 15 // larger batch = more per-request wait
  const maxOverhead = totalItems * overheadPerCall // batch size 1

  const efficiencyColor = totalOverhead < 2000 ? '#059669'
    : totalOverhead < 6000 ? '#f59e0b' : '#dc2626'

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          fontSize: 14, color: 'var(--text-muted)', marginBottom: 8,
        }}>
          Batch Size: <strong style={{ color: 'var(--accent)', fontSize: 22 }}>{batchSize}</strong> items per API call
        </div>
        <input
          type="range"
          min={1} max={50} step={1}
          value={batchSize}
          onChange={e => setBatchSize(Number(e.target.value))}
          style={{ width: '80%', cursor: 'pointer' }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between', width: '80%', margin: '4px auto 0',
          fontSize: 11, color: 'var(--text-muted)',
        }}>
          <span>1</span><span>10</span><span>25</span><span>50</span>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20,
      }}>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 14, padding: 18,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>API Calls</div>
          <motion.div
            key={numCalls}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            style={{
              fontSize: 28, fontWeight: 800, color: efficiencyColor,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {numCalls}
          </motion.div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 14, padding: 18,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Total Overhead</div>
          <motion.div
            key={totalOverhead}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            style={{
              fontSize: 28, fontWeight: 800, color: efficiencyColor,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {(totalOverhead / 1000).toFixed(1)}s
          </motion.div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 14, padding: 18,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Avg Latency</div>
          <div style={{
            fontSize: 28, fontWeight: 800,
            color: avgLatency > 500 ? '#dc2626' : avgLatency > 200 ? '#f59e0b' : '#059669',
            fontFamily: 'var(--font-heading)',
          }}>
            {avgLatency}ms
          </div>
        </div>
      </div>

      {/* Overhead bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: 12,
          color: 'var(--text-muted)', marginBottom: 4,
        }}>
          <span>Overhead saved</span>
          <span>{((1 - totalOverhead / maxOverhead) * 100).toFixed(0)}%</span>
        </div>
        <div style={{
          height: 12, borderRadius: 6, background: 'var(--border)', overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${((1 - totalOverhead / maxOverhead) * 100)}%` }}
            style={{
              height: '100%', borderRadius: 6,
              background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            }}
          />
        </div>
      </div>

      {/* Sweet spot indicator */}
      {batchSize >= 8 && batchSize <= 15 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12,
            padding: '12px 18px', fontSize: 13, color: '#065f46', textAlign: 'center',
          }}
        >
          Sweet spot! Good balance between overhead reduction and per-request latency.
        </motion.div>
      )}
      {batchSize >= 40 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12,
            padding: '12px 18px', fontSize: 13, color: '#92400e', textAlign: 'center',
          }}
        >
          Warning: Very large batches mean high per-request latency. Users wait longer for each response.
        </motion.div>
      )}
    </div>
  )
}

/* ---- CDN Visual ---- */
function CDNVisual() {
  const [cdnEnabled, setCdnEnabled] = useState(false)

  const regions = [
    { name: 'Mumbai', emoji: '🇮🇳', latencyNoCDN: 200, latencyCDN: 20, x: 68, y: 42 },
    { name: 'Tokyo', emoji: '🇯🇵', latencyNoCDN: 180, latencyCDN: 15, x: 82, y: 32 },
    { name: 'London', emoji: '🇬🇧', latencyNoCDN: 120, latencyCDN: 12, x: 47, y: 24 },
    { name: 'Sao Paulo', emoji: '🇧🇷', latencyNoCDN: 250, latencyCDN: 25, x: 32, y: 65 },
  ]

  const origin = { name: 'US-East (Origin)', x: 25, y: 35 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCdnEnabled(!cdnEnabled)}
          style={{
            padding: '12px 28px', borderRadius: 12, border: 'none',
            background: cdnEnabled ? '#10b981' : '#6366f1',
            color: '#fff', fontWeight: 700, cursor: 'pointer',
            fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          {cdnEnabled ? 'CDN Enabled' : 'CDN Disabled'} -- Click to toggle
        </motion.button>
      </div>

      {/* World map (simplified) */}
      <div style={{
        position: 'relative', width: '100%', height: 280,
        background: 'linear-gradient(180deg, #0f172a, #1e3a5f)',
        borderRadius: 16, overflow: 'hidden', marginBottom: 20,
      }}>
        {/* Origin server */}
        <motion.div
          style={{
            position: 'absolute', left: `${origin.x}%`, top: `${origin.y}%`,
            transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 2,
          }}
        >
          <div style={{ fontSize: 24 }}>🖥️</div>
          <div style={{
            fontSize: 10, color: '#93c5fd', fontWeight: 700, marginTop: 2,
            background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4,
          }}>
            Origin
          </div>
        </motion.div>

        {/* Regions */}
        {regions.map((r, i) => (
          <motion.div
            key={r.name}
            style={{
              position: 'absolute', left: `${r.x}%`, top: `${r.y}%`,
              transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 2,
            }}
          >
            <div style={{ fontSize: 18 }}>{r.emoji}</div>
            <div style={{
              fontSize: 9, color: '#e2e8f0', fontWeight: 600, marginTop: 2,
              background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4,
            }}>
              {r.name}
            </div>
            <motion.div
              key={cdnEnabled ? 'cdn' : 'no-cdn'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: 11, fontWeight: 800, marginTop: 2,
                color: cdnEnabled ? '#4ade80' : '#fca5a5',
                background: cdnEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                padding: '2px 8px', borderRadius: 8,
              }}
            >
              {cdnEnabled ? `${r.latencyCDN}ms` : `${r.latencyNoCDN}ms`}
            </motion.div>
            {/* Connection line to origin */}
            {!cdnEnabled && (
              <svg style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%', pointerEvents: 'none',
              }}>
              </svg>
            )}
            {cdnEnabled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', top: -8, right: -8,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#10b981', border: '2px solid #4ade80',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: '#fff', fontWeight: 800,
                }}
              >
                E
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* What to CDN / not CDN */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46', marginBottom: 8 }}>
            CDN-friendly
          </div>
          {['Static files (JS, CSS)', 'Images, videos', 'Public API responses', 'Fonts, icons'].map(item => (
            <div key={item} style={{ fontSize: 12, color: '#047857', padding: '3px 0' }}>
              {item}
            </div>
          ))}
        </div>
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>
            Do NOT CDN
          </div>
          {['Personalized data', 'Real-time data', 'Auth tokens', 'User-specific APIs'].map(item => (
            <div key={item} style={{ fontSize: 12, color: '#b91c1c', padding: '3px 0' }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---- Optimization Decision Tree ---- */
function OptimizationAdvisor() {
  const [path, setPath] = useState([])

  const tree = {
    question: 'What is your main bottleneck?',
    options: [
      {
        label: 'Response time is high',
        question: 'Where is the slowdown?',
        options: [
          {
            label: 'Database queries',
            recommendation: 'Add caching (Redis) for repeated queries. Add database indexes for slow queries. Consider read replicas for read-heavy workloads.',
            tools: ['Response Cache', 'DB Indexing', 'Read Replicas'],
            color: '#3b82f6',
          },
          {
            label: 'External API calls',
            recommendation: 'Use async I/O so API calls do not block. Batch multiple calls together. Cache API responses when possible.',
            tools: ['Async I/O', 'Batching', 'Response Cache'],
            color: '#8b5cf6',
          },
          {
            label: 'Heavy computation',
            recommendation: 'Cache computed results. Offload heavy work to background workers. Consider pre-computing during off-peak hours.',
            tools: ['Computed Cache', 'Worker Queues', 'Pre-computation'],
            color: '#ec4899',
          },
        ],
      },
      {
        label: 'Memory usage is high',
        question: 'What is consuming memory?',
        options: [
          {
            label: 'Too many connections',
            recommendation: 'Implement connection pooling with strict limits. Close idle connections aggressively. Monitor pool usage.',
            tools: ['Connection Pooling', 'Pool Limits', 'Monitoring'],
            color: '#f59e0b',
          },
          {
            label: 'Large payloads',
            recommendation: 'Implement pagination for large datasets. Stream responses instead of loading all data. Compress payloads with gzip.',
            tools: ['Pagination', 'Streaming', 'Compression'],
            color: '#10b981',
          },
          {
            label: 'Memory leaks',
            recommendation: 'Profile with memory profiler tools. Check for unclosed connections and event listeners. Implement proper cleanup.',
            tools: ['Memory Profiling', 'Leak Detection', 'Cleanup Hooks'],
            color: '#dc2626',
          },
        ],
      },
      {
        label: 'Error rate is high',
        question: 'What type of errors?',
        options: [
          {
            label: 'Rate limits (429)',
            recommendation: 'Add caching to reduce API calls. Implement request batching. Add exponential backoff with jitter.',
            tools: ['Caching', 'Batching', 'Backoff + Jitter'],
            color: '#6366f1',
          },
          {
            label: 'Timeouts (504)',
            recommendation: 'Add retry logic with exponential backoff. Increase timeout limits. Break large operations into smaller chunks.',
            tools: ['Retry Logic', 'Timeout Config', 'Chunking'],
            color: '#0ea5e9',
          },
          {
            label: 'Connection refused',
            recommendation: 'Implement connection pooling. Add circuit breakers to prevent cascading failures. Scale backend resources.',
            tools: ['Connection Pooling', 'Circuit Breaker', 'Autoscaling'],
            color: '#14b8a6',
          },
        ],
      },
    ],
  }

  const currentNode = path.reduce((node, idx) => node.options[idx], tree)
  const isLeaf = !!currentNode.recommendation

  return (
    <div>
      {/* Breadcrumb */}
      {path.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPath([])}
            style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--bg-secondary)', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-sans)',
            }}
          >
            Start Over
          </motion.button>
          {path.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPath(path.slice(0, -1))}
              style={{
                padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-sans)',
              }}
            >
              Back
            </motion.button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLeaf ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: `${currentNode.color}10`,
              border: `2px solid ${currentNode.color}40`,
              borderRadius: 16, padding: 24,
            }}
          >
            <div style={{
              fontSize: 16, fontWeight: 800, color: currentNode.color,
              fontFamily: 'var(--font-heading)', marginBottom: 12,
            }}>
              Recommendation
            </div>
            <p style={{
              fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16,
            }}>
              {currentNode.recommendation}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {currentNode.tools.map(tool => (
                <span
                  key={tool}
                  style={{
                    padding: '6px 14px', borderRadius: 20,
                    background: `${currentNode.color}20`,
                    color: currentNode.color,
                    fontSize: 12, fontWeight: 700,
                    border: `1px solid ${currentNode.color}40`,
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={path.join('-')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)', marginBottom: 16,
            }}>
              {currentNode.question}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentNode.options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPath([...path, i])}
                  style={{
                    padding: '16px 24px', borderRadius: 14,
                    border: '2px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer', fontSize: 15, fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Before & After Table ---- */
function BeforeAfterTable() {
  const [revealed, setRevealed] = useState(false)

  const metrics = [
    { metric: 'Servers for 10K users', before: '20', after: '8', improvement: '60% fewer', color: '#3b82f6' },
    { metric: 'P99 Latency', before: '8s', after: '1.2s', improvement: '85% faster', color: '#8b5cf6' },
    { metric: 'Monthly Cost', before: '$1,600', after: '$640', improvement: '60% savings', color: '#10b981' },
    { metric: 'Error Rate', before: '15%', after: '0.5%', improvement: '97% reduction', color: '#ec4899' },
    { metric: 'LLM API Calls', before: '10K/min', after: '4K/min', improvement: '60% fewer', color: '#f59e0b' },
  ]

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setRevealed(!revealed)}
          style={{
            padding: '12px 32px', borderRadius: 12, border: 'none',
            background: revealed ? '#10b981' : 'var(--accent)',
            color: '#fff', fontWeight: 700, cursor: 'pointer',
            fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          {revealed ? 'Hide Optimizations' : 'Apply ALL Optimizations'}
        </motion.button>
      </div>

      <div style={{
        borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
          background: 'var(--bg-secondary)', padding: '12px 20px',
          fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <div>Metric</div>
          <div style={{ textAlign: 'center' }}>Before</div>
          <div style={{ textAlign: 'center' }}>After</div>
          <div style={{ textAlign: 'center' }}>Improvement</div>
        </div>

        {/* Rows */}
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              background: revealed ? `${m.color}08` : 'transparent',
            }}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
              padding: '14px 20px', alignItems: 'center',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div style={{
              fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
            }}>
              {m.metric}
            </div>
            <div style={{
              textAlign: 'center', fontSize: 15, fontWeight: 700,
              color: '#dc2626', fontFamily: 'var(--font-heading)',
              textDecoration: revealed ? 'line-through' : 'none',
              opacity: revealed ? 0.5 : 1,
            }}>
              {m.before}
            </div>
            <AnimatePresence>
              {revealed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    textAlign: 'center', fontSize: 15, fontWeight: 800,
                    color: '#059669', fontFamily: 'var(--font-heading)',
                  }}
                >
                  {m.after}
                </motion.div>
              ) : (
                <div style={{
                  textAlign: 'center', fontSize: 14, color: 'var(--text-muted)',
                }}>
                  ???
                </div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {revealed ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    textAlign: 'center', fontSize: 13, fontWeight: 800,
                    color: m.color,
                    background: `${m.color}15`,
                    padding: '4px 12px', borderRadius: 20,
                  }}
                >
                  {m.improvement}
                </motion.div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
                  --
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic10_Optimization() {
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
          The Optimization Playbook
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto',
        }}>
          Caching, Connection Pooling, Async I/O, Batching, CDN -- the toolkit that makes scale possible.
        </p>
      </motion.div>

      {/* ---- Opening ---- */}
      <Neuron
        mood="explaining"
        message="In Topic 9, you saw a RAG app struggling at scale -- rate limits, connection pool exhaustion, skyrocketing costs. This topic is your optimization toolkit. Each technique is a weapon against specific bottlenecks."
        typed
      />

      <div style={{ height: 32 }} />

      {/* ---- Section 1: Caching ---- */}
      <SectionBlock title="Caching -- The #1 Performance Tool" icon="🗄️" color="#3b82f6">
        <Neuron
          mood="excited"
          message="Caching is the single most impactful optimization. Instead of computing the same result again and again, store it and reuse it. The best request is the one you never make!"
          typed
        />

        <div style={{ marginTop: 12, marginBottom: 20 }}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 12, padding: 16,
            border: '1px solid var(--border)', fontSize: 13,
            fontFamily: 'monospace', lineHeight: 2, color: 'var(--text-secondary)',
          }}>
            <div><strong style={{ color: '#dc2626' }}>Without cache:</strong> Client &rarr; Server &rarr; Database (50ms) &rarr; Process &rarr; Respond</div>
            <div><strong style={{ color: '#059669' }}>With cache (hit):</strong> Client &rarr; Server &rarr; Redis Cache (1ms!) &rarr; Respond</div>
            <div><strong style={{ color: '#f59e0b' }}>With cache (miss):</strong> Client &rarr; Server &rarr; DB (50ms) &rarr; Store in Redis &rarr; Respond</div>
          </div>
        </div>

        <InteractiveDemo title="Cache Hit Simulator">
          <CacheHitSimulator />
        </InteractiveDemo>

        <div style={{ marginTop: 24 }}>
          <h3 style={{
            fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)', marginBottom: 16,
          }}>
            Three Caching Strategies
          </h3>
          <CachingStrategies />
        </div>
      </SectionBlock>

      {/* ---- Section 2: Connection Pooling ---- */}
      <SectionBlock title="Connection Pooling -- Stop Creating, Start Reusing" icon="🔌" color="#10b981">
        <Neuron
          mood="thinking"
          message="Every database connection has a cost: TCP handshake (~20ms), authentication (~10ms), memory allocation. Creating a new connection for every request is like buying a new car for every trip instead of reusing one!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Pool vs No-Pool: 100 Concurrent Requests">
            <ConnectionPoolSimulator />
          </InteractiveDemo>
        </div>

        <p style={{
          fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: 8,
        }}>
          With a pool of <strong>20 pre-created connections</strong>, 100 concurrent requests queue up
          and reuse them. No connection overhead, no limit errors, and predictable performance.
        </p>
      </SectionBlock>

      {/* ---- Section 3: Async I/O ---- */}
      <SectionBlock title="Async I/O -- Don't Block, Don't Wait" icon="⚡" color="#8b5cf6">
        <Neuron
          mood="explaining"
          message="In synchronous code, when you wait for a database query or API call, the CPU just sits idle. Async I/O lets the CPU work on other tasks during that wait time. It's like a chef starting the oven and chopping vegetables while it preheats, instead of staring at the oven!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Sync vs Async Task Scheduler">
            <AsyncVisualizer />
          </InteractiveDemo>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 12, padding: 16,
          border: '1px solid var(--border)', fontSize: 13, marginTop: 8,
          color: 'var(--text-secondary)', lineHeight: 1.8,
        }}>
          <strong>Key insight:</strong> Async does NOT make individual tasks faster.
          It makes the <em>system</em> faster by overlapping I/O wait times.
          CPU-bound work still runs sequentially -- async shines when there is lots of waiting (network, disk, API calls).
        </div>
      </SectionBlock>

      {/* ---- Section 4: Batching ---- */}
      <SectionBlock title="Batching -- Fewer Calls, More Data" icon="📦" color="#f59e0b">
        <Neuron
          mood="happy"
          message="Instead of making 100 individual LLM API calls (each with 200ms overhead), batch them into groups. Fewer round trips = less overhead. But batch too large and individual requests wait longer. Finding the sweet spot is key!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Batch Size Optimizer">
            <BatchOptimizer />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 5: CDN & Edge Computing ---- */}
      <SectionBlock title="CDN & Edge Computing" icon="🌐" color="#0ea5e9">
        <Neuron
          mood="excited"
          message="A CDN (Content Delivery Network) places copies of your static content on servers around the world. Instead of every user hitting your origin server in US-East, they get content from the nearest edge server. Mumbai users get Mumbai speed!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="CDN Latency Comparison">
            <CDNVisual />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 6: Decision Tree ---- */}
      <SectionBlock title="The Optimization Decision Tree" icon="🌳" color="#6366f1">
        <Neuron
          mood="thinking"
          message="Not sure which optimization to apply? Describe your bottleneck and I will guide you to the right tools. Think of this as a diagnostic flowchart -- like a doctor diagnosing symptoms!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Optimization Advisor">
            <OptimizationAdvisor />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 7: Before & After ---- */}
      <SectionBlock title="Before & After -- The Full Picture" icon="📊" color="#ec4899">
        <Neuron
          mood="happy"
          message="Remember the RAG app from Topics 7-9? Here is what happens when we apply ALL the optimizations from this topic. The results are dramatic!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="RAG App: All Optimizations Applied">
            <BeforeAfterTable />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 8: Hindi Explainer ---- */}
      <SectionBlock title="Summary" icon="📝" color="var(--accent)">
        <Neuron
          mood="happy"
          message="You now have the complete optimization playbook! Caching, Connection Pooling, Async I/O, Batching, and CDN -- five weapons against five different bottlenecks. Let's recap in Hindi!"
          typed
        />
        <div style={{ marginTop: 20 }}>
          <HindiExplainer
            concept="ऑप्टिमाइज़ेशन प्लेबुक"
            english="The Optimization Playbook"
            explanation="Scale करने के लिए सिर्फ servers बढ़ाना काफ़ी नहीं — smart optimization ज़रूरी है। Caching से बार-बार same काम avoid करो। Connection Pooling से DB connections reuse करो। Async I/O से wait time में दूसरा काम करो। Batching से API calls कम करो। CDN से static content user के पास से serve करो।"
            example="Zomato को सोचो: हर user restaurant list देखता है — same data! Cache करो तो DB पर load 90% कम। Payment API slow है? Async करो ताकि order confirm तुरंत दिखे, payment background में process हो। Image ज़्यादा बार load होती हैं? CDN से serve करो — Mumbai user को Mumbai server से, Delhi user को Delhi server से!"
            terms={[
              { hindi: 'कैशिंग', english: 'Caching', meaning: 'पुराने results save करना — दोबारा calculate न करना पड़े' },
              { hindi: 'कनेक्शन पूलिंग', english: 'Connection Pooling', meaning: 'DB connections बनाकर reuse करना — हर बार नया न बनाना' },
              { hindi: 'बैचिंग', english: 'Batching', meaning: 'कई छोटे requests को एक बड़े request में combine करना' },
              { hindi: 'सी.डी.एन.', english: 'CDN', meaning: 'Content Delivery Network — दुनिया भर में copies रखना user के पास' },
              { hindi: 'एसिंक I/O', english: 'Async I/O', meaning: 'Wait करते समय दूसरा काम करो — CPU खाली न बैठे' },
            ]}
          />
        </div>
      </SectionBlock>
    </div>
  )
}
