import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 4 — Threading & Python's GIL
   Threads, GIL limitation, async, and why Python threads
   can't do true CPU parallelism
================================================================ */

const C = {
  blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981',
  orange: '#f59e0b', pink: '#ec4899', red: '#ef4444',
  cyan: '#06b6d4', indigo: '#6366f1', gold: '#eab308',
  emerald: '#059669', slate: '#64748b',
}

/* ---- 1. Thread vs Process Diagram ---- */
function ThreadProcessDemo() {
  const [threads, setThreads] = useState([])
  const [nextId, setNextId] = useState(1)

  const spawnThread = () => {
    if (threads.length >= 6) return
    setThreads(prev => [...prev, { id: nextId, color: [C.blue, C.purple, C.green, C.orange, C.pink, C.cyan][prev.length % 6] }])
    setNextId(prev => prev + 1)
  }

  const removeThread = (id) => {
    setThreads(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
      {/* Process box */}
      <div style={{
        flex: '1 1 280px', maxWidth: 350, background: `${C.red}08`,
        border: `2px solid ${C.red}40`, borderRadius: 16, padding: 24,
        position: 'relative',
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
          color: C.red, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Process (Heavy)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {['Own Memory Space', 'Own File Handles', 'Own CPU Allocation', 'Isolated from others'].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: 'var(--text-secondary)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: C.red,
                flexShrink: 0,
              }} />
              {item}
            </div>
          ))}
        </div>
        <div style={{
          background: `${C.red}12`, borderRadius: 10, padding: 14,
          fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
          border: `1px dashed ${C.red}30`,
        }}>
          ~10-30 MB overhead per process
        </div>
      </div>

      {/* Threads inside a process box */}
      <div style={{
        flex: '1 1 350px', maxWidth: 450, background: `${C.blue}08`,
        border: `2px solid ${C.blue}40`, borderRadius: 16, padding: 24,
        position: 'relative',
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
          color: C.blue, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Process with Threads (Light)
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          All threads share the same memory
        </div>

        {/* Shared memory indicator */}
        <div style={{
          background: `${C.green}15`, border: `1px solid ${C.green}40`,
          borderRadius: 10, padding: '8px 14px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: C.green, fontWeight: 600,
        }}>
          <span style={{ fontSize: 16 }}>📦</span> Shared Memory Space
        </div>

        {/* Thread grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, minHeight: 60 }}>
          <AnimatePresence>
            {threads.map(t => (
              <motion.div
                key={t.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => removeThread(t.id)}
                style={{
                  width: 60, height: 60, borderRadius: 12,
                  background: `${t.color}20`, border: `2px solid ${t.color}60`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 11, color: t.color, fontWeight: 700,
                }}
              >
                <span style={{ fontSize: 18 }}>🧵</span>
                T{t.id}
              </motion.div>
            ))}
          </AnimatePresence>
          {threads.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', padding: 10 }}>
              Click "Spawn" to add threads...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={spawnThread}
            disabled={threads.length >= 6}
            style={{
              padding: '8px 20px', borderRadius: 10,
              background: threads.length >= 6 ? 'var(--border)' : C.blue,
              color: threads.length >= 6 ? 'var(--text-muted)' : '#fff',
              border: 'none', fontWeight: 700, cursor: threads.length >= 6 ? 'not-allowed' : 'pointer',
              fontSize: 13, fontFamily: 'var(--font-sans)',
            }}
          >
            + Spawn Thread
          </motion.button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            ~1-2 MB each (click thread to remove)
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---- 2. GIL Lock Simulator — THE HERO ---- */
function GILSimulator() {
  const [mode, setMode] = useState('cpu') // 'cpu' | 'io'
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [complete, setComplete] = useState(false)

  const THREAD_COUNT = 4
  const CPU_SLICE = 5 // ms per GIL slice
  const TOTAL_WORK = 80 // total ms of work per thread
  const IO_WAIT = 40 // ms of I/O wait per thread in io mode
  const CPU_IN_IO = 10 // ms of CPU work in io mode

  const totalTicksCpu = THREAD_COUNT * (TOTAL_WORK / CPU_SLICE) // each thread takes turns
  const totalTicksIo = Math.ceil((CPU_IN_IO / CPU_SLICE) * THREAD_COUNT + 2) // overlapping I/O

  const startSimulation = () => {
    setRunning(true)
    setTick(0)
    setElapsed(0)
    setComplete(false)
  }

  const reset = () => {
    setRunning(false)
    setTick(0)
    setElapsed(0)
    setComplete(false)
  }

  // Advance simulation
  const advance = () => {
    if (complete) return
    const maxTicks = mode === 'cpu' ? totalTicksCpu : totalTicksIo
    setTick(prev => {
      const next = prev + 1
      if (next >= maxTicks) {
        setComplete(true)
        setRunning(false)
      }
      return Math.min(next, maxTicks)
    })
    setElapsed(prev => prev + CPU_SLICE)
  }

  // Auto-advance when running
  useState(() => {
    // We use an effect-like pattern with useState initializer — safe for this demo
  })

  // Manual step or auto
  const [autoRun, setAutoRun] = useState(false)

  // Simple auto-advance using setTimeout chain
  if (running && autoRun && !complete) {
    setTimeout(() => {
      advance()
    }, 200)
  }

  // Determine which thread holds the GIL at current tick
  const getThreadState = (threadIdx) => {
    if (!running && tick === 0) return 'idle'
    if (complete) return 'done'

    if (mode === 'cpu') {
      // Round-robin: each thread gets CPU_SLICE, then passes GIL
      const currentHolder = tick % THREAD_COUNT
      const threadTicks = Math.floor(tick / THREAD_COUNT) + (threadIdx <= (tick % THREAD_COUNT) ? 1 : 0)
      const threadDone = threadTicks >= (TOTAL_WORK / CPU_SLICE)
      if (threadDone) return 'done'
      if (threadIdx === currentHolder) return 'executing'
      return 'waiting'
    } else {
      // I/O mode: threads do brief CPU then release GIL for I/O
      // Phase 0-1: Thread does CPU (holds GIL)
      // Phase 2+: Thread does I/O (releases GIL), others can run
      const phase = Math.floor(tick / THREAD_COUNT)
      const slot = tick % THREAD_COUNT
      if (phase === 0) {
        // First round: each thread grabs GIL briefly for CPU work
        if (threadIdx === slot) return 'executing'
        if (threadIdx < slot) return 'io-waiting' // released GIL, doing I/O
        return 'waiting'
      } else if (phase === 1) {
        // Second round: threads finishing I/O, processing results
        if (threadIdx === slot) return 'executing'
        return threadIdx < slot ? 'done' : 'io-waiting'
      } else {
        return 'done'
      }
    }
  }

  const stateColors = {
    idle: 'var(--border)',
    waiting: `${C.red}30`,
    executing: C.green,
    'io-waiting': `${C.cyan}50`,
    done: `${C.emerald}40`,
  }

  const stateLabels = {
    idle: 'Idle',
    waiting: 'Waiting for GIL',
    executing: 'Has GIL - Executing',
    'io-waiting': 'I/O (GIL Released)',
    done: 'Complete',
  }

  const finalTimeCpu = TOTAL_WORK * THREAD_COUNT // sequential because of GIL
  const finalTimeIo = IO_WAIT + CPU_IN_IO * 2 // overlapping I/O

  return (
    <div>
      {/* Mode Toggle */}
      <div style={{
        display: 'flex', gap: 0, borderRadius: 14, overflow: 'hidden',
        border: '2px solid var(--border)', marginBottom: 24, maxWidth: 400,
      }}>
        {['cpu', 'io'].map(m => (
          <motion.button
            key={m}
            onClick={() => { setMode(m); reset() }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '12px 20px', border: 'none',
              background: mode === m
                ? (m === 'cpu' ? C.red : C.green)
                : 'var(--bg-secondary)',
              color: mode === m ? '#fff' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.3s',
            }}
          >
            {m === 'cpu' ? '🔢 CPU-Bound Task' : '🌐 I/O-Bound Task'}
          </motion.button>
        ))}
      </div>

      {/* GIL Key visualization */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, marginBottom: 24, padding: '14px 20px',
        background: `${C.gold}12`, borderRadius: 14,
        border: `2px solid ${C.gold}40`,
      }}>
        <motion.div
          animate={{
            rotate: running && !complete ? [0, 10, -10, 0] : 0,
            scale: running && !complete ? [1, 1.15, 1] : 1,
          }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{ fontSize: 32 }}
        >
          🔑
        </motion.div>
        <div>
          <div style={{
            fontWeight: 700, fontSize: 16, color: C.gold,
            fontFamily: 'var(--font-heading)',
          }}>
            Global Interpreter Lock (GIL)
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Only ONE thread can execute Python code at a time
          </div>
        </div>
      </div>

      {/* Thread visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {Array.from({ length: THREAD_COUNT }).map((_, i) => {
          const state = getThreadState(i)
          const isExecuting = state === 'executing'
          return (
            <motion.div
              key={i}
              animate={isExecuting ? { boxShadow: `0 0 20px ${C.green}50` } : { boxShadow: '0 0 0px transparent' }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 18px', borderRadius: 14,
                background: 'var(--bg-secondary)',
                border: `2px solid ${isExecuting ? C.green : 'var(--border)'}`,
                transition: 'border-color 0.3s',
              }}
            >
              {/* Thread label */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${[C.blue, C.purple, C.orange, C.pink][i]}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                color: [C.blue, C.purple, C.orange, C.pink][i],
                flexShrink: 0,
              }}>
                T{i + 1}
              </div>

              {/* Progress bar */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, marginBottom: 6, color: 'var(--text-muted)',
                }}>
                  <span style={{ fontWeight: 700 }}>Thread {i + 1}</span>
                  <span style={{
                    fontWeight: 600, fontSize: 11, padding: '2px 8px',
                    borderRadius: 6,
                    background: stateColors[state],
                    color: isExecuting ? '#fff' : 'var(--text-secondary)',
                  }}>
                    {stateLabels[state]}
                  </span>
                </div>
                <div style={{
                  height: 8, borderRadius: 4, background: 'var(--border)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    animate={{
                      width: state === 'done' ? '100%'
                        : state === 'executing' ? '60%'
                        : state === 'io-waiting' ? '45%'
                        : '0%',
                    }}
                    style={{
                      height: '100%', borderRadius: 4,
                      background: state === 'done' ? C.emerald
                        : state === 'executing' ? C.green
                        : state === 'io-waiting' ? C.cyan
                        : 'var(--border)',
                    }}
                  />
                </div>
              </div>

              {/* GIL indicator */}
              <div style={{ fontSize: 20, minWidth: 28, textAlign: 'center' }}>
                {isExecuting ? '🔑' : state === 'io-waiting' ? '🌐' : ''}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Timer and Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { if (!running) startSimulation(); setAutoRun(true) }}
            disabled={running && autoRun}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: running ? 'var(--border)' : C.green,
              color: running ? 'var(--text-muted)' : '#fff',
              border: 'none', fontWeight: 700, fontSize: 13,
              cursor: running ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {complete ? '✅ Done' : running ? '⏳ Running...' : '▶ Run Simulation'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { if (!running) { startSimulation(); setAutoRun(false) } advance() }}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            Step ➡
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'var(--bg-secondary)', color: 'var(--text-muted)',
              border: '1px solid var(--border)', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            🔄 Reset
          </motion.button>
        </div>

        {/* Elapsed timer */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 12, padding: '8px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 14 }}>⏱</span>
          <span style={{
            fontFamily: 'monospace', fontWeight: 700, fontSize: 18,
            color: 'var(--text-primary)',
          }}>
            {elapsed} ms
          </span>
        </div>
      </div>

      {/* Dramatic Result */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 24, padding: 24, borderRadius: 16,
              background: mode === 'cpu'
                ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: `2px solid ${mode === 'cpu' ? C.red : C.green}40`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>
              {mode === 'cpu' ? '😱' : '🚀'}
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22,
              color: mode === 'cpu' ? C.red : C.emerald, marginBottom: 8,
            }}>
              {mode === 'cpu'
                ? `4 threads doing math = 1x speed!`
                : `4 threads doing API calls = ~4x speed!`
              }
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {mode === 'cpu'
                ? `With GIL, CPU-bound threads take turns. Total time: ${finalTimeCpu}ms (same as 1 thread doing ${TOTAL_WORK}ms x ${THREAD_COUNT} tasks sequentially).`
                : `During I/O, threads release the GIL. Other threads run while waiting. Total time: ~${finalTimeIo}ms instead of ${(IO_WAIT + CPU_IN_IO) * THREAD_COUNT}ms!`
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 20,
        padding: '12px 18px', background: 'var(--bg-secondary)',
        borderRadius: 12, fontSize: 12, color: 'var(--text-muted)',
      }}>
        {[
          { color: C.green, label: 'Executing (has GIL)' },
          { color: `${C.red}40`, label: 'Waiting for GIL' },
          { color: `${C.cyan}60`, label: 'I/O (GIL released)' },
          { color: `${C.emerald}50`, label: 'Complete' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              background: item.color,
            }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- 3. Web Server Thread Pool ---- */
function ThreadPoolDemo() {
  const [requests, setRequests] = useState([])
  const [nextReqId, setNextReqId] = useState(1)
  const [threadStates, setThreadStates] = useState([
    { id: 1, status: 'idle', request: null },
    { id: 2, status: 'idle', request: null },
    { id: 3, status: 'idle', request: null },
    { id: 4, status: 'idle', request: null },
  ])
  const [log, setLog] = useState([])
  const [totalHandled, setTotalHandled] = useState(0)

  const sendRequest = () => {
    const reqId = nextReqId
    setNextReqId(prev => prev + 1)

    // Find an idle thread
    const idleIdx = threadStates.findIndex(t => t.status === 'idle')
    if (idleIdx !== -1) {
      // Assign to thread
      const newStates = [...threadStates]
      newStates[idleIdx] = { ...newStates[idleIdx], status: 'parsing', request: reqId }
      setThreadStates(newStates)
      setLog(prev => [`[T${idleIdx + 1}] Handling request #${reqId} - parsing...`, ...prev].slice(0, 10))

      // Simulate phases: parse(2ms) -> DB(50ms) -> process(1ms) -> respond
      setTimeout(() => {
        setThreadStates(prev => {
          const s = [...prev]
          if (s[idleIdx].request === reqId) s[idleIdx] = { ...s[idleIdx], status: 'db-wait' }
          return s
        })
        setLog(prev => [`[T${idleIdx + 1}] DB query... (GIL released)`, ...prev].slice(0, 10))

        setTimeout(() => {
          setThreadStates(prev => {
            const s = [...prev]
            if (s[idleIdx].request === reqId) s[idleIdx] = { ...s[idleIdx], status: 'processing' }
            return s
          })
          setLog(prev => [`[T${idleIdx + 1}] Processing response...`, ...prev].slice(0, 10))

          setTimeout(() => {
            setThreadStates(prev => {
              const s = [...prev]
              s[idleIdx] = { id: idleIdx + 1, status: 'idle', request: null }
              return s
            })
            setTotalHandled(prev => prev + 1)
            setLog(prev => [`[T${idleIdx + 1}] Request #${reqId} done! ✅`, ...prev].slice(0, 10))
          }, 500)
        }, 1500)
      }, 400)
    } else {
      setRequests(prev => [...prev, { id: reqId }])
      setLog(prev => [`Request #${reqId} queued (all threads busy)`, ...prev].slice(0, 10))
    }
  }

  const sendBurst = () => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => sendRequest(), i * 150)
    }
  }

  const threadStatusConfig = {
    idle: { color: 'var(--border)', label: 'Idle', emoji: '💤' },
    parsing: { color: C.blue, label: 'Parsing', emoji: '📝' },
    'db-wait': { color: C.cyan, label: 'DB Wait (GIL free)', emoji: '🗄️' },
    processing: { color: C.orange, label: 'Processing', emoji: '⚙️' },
  }

  return (
    <div>
      {/* Thread Pool */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        {threadStates.map(t => {
          const cfg = threadStatusConfig[t.status]
          return (
            <motion.div
              key={t.id}
              animate={{
                borderColor: t.status === 'idle' ? 'var(--border)' : cfg.color,
                boxShadow: t.status === 'db-wait' ? `0 0 15px ${C.cyan}30` : '0 0 0 transparent',
              }}
              style={{
                padding: 16, borderRadius: 14,
                background: 'var(--bg-secondary)',
                border: '2px solid var(--border)',
                textAlign: 'center',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{cfg.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
                Thread {t.id}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: cfg.color,
                padding: '2px 8px', borderRadius: 6,
                background: `${typeof cfg.color === 'string' && cfg.color.startsWith('#') ? cfg.color : ''}15`,
              }}>
                {cfg.label}
              </div>
              {t.request && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Req #{t.request}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendRequest}
          style={{
            padding: '10px 22px', borderRadius: 10,
            background: C.blue, color: '#fff',
            border: 'none', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          📨 Send Request
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendBurst}
          style={{
            padding: '10px 22px', borderRadius: 10,
            background: C.purple, color: '#fff',
            border: 'none', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          🌊 Send 6-Request Burst
        </motion.button>
        <div style={{
          padding: '10px 18px', borderRadius: 10,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
        }}>
          Handled: {totalHandled}
        </div>
      </div>

      {/* Queue indicator */}
      {requests.length > 0 && (
        <div style={{
          padding: '8px 16px', borderRadius: 10,
          background: `${C.orange}15`, border: `1px solid ${C.orange}30`,
          fontSize: 13, color: C.orange, fontWeight: 600, marginBottom: 16,
        }}>
          ⏳ {requests.length} request(s) queued
        </div>
      )}

      {/* Log */}
      <div style={{
        background: '#1a1a2e', borderRadius: 12, padding: 16,
        fontFamily: 'monospace', fontSize: 12, color: '#a0e0a0',
        maxHeight: 180, overflowY: 'auto',
      }}>
        <div style={{ color: '#666', marginBottom: 6, fontSize: 11 }}>// Server Log</div>
        {log.length === 0 && <div style={{ color: '#444' }}>Waiting for requests...</div>}
        {log.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ marginBottom: 3, opacity: 1 - i * 0.08 }}
          >
            {entry}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ---- 4. Async Event Loop Carousel ---- */
function AsyncCarousel() {
  const [activeCoroutine, setActiveCoroutine] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const coroutines = [
    { id: 1, name: 'fetch_user()', color: C.blue, status: 'ready' },
    { id: 2, name: 'query_db()', color: C.purple, status: 'io-wait' },
    { id: 3, name: 'call_api()', color: C.orange, status: 'io-wait' },
    { id: 4, name: 'read_file()', color: C.green, status: 'ready' },
    { id: 5, name: 'send_email()', color: C.pink, status: 'io-wait' },
  ]

  const startLoop = () => {
    setIsRunning(true)
    let i = 0
    const interval = setInterval(() => {
      setActiveCoroutine(i % coroutines.length)
      i++
      if (i >= coroutines.length * 3) {
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 600)
  }

  return (
    <div>
      {/* Comparison header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
      }}>
        <div style={{
          padding: 18, borderRadius: 14,
          background: `${C.red}08`, border: `1px solid ${C.red}30`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🧵</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.red, marginBottom: 4 }}>
            Threading
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            4 threads x context switches = works but heavy
          </div>
          <div style={{
            marginTop: 8, fontSize: 20, fontWeight: 800,
            fontFamily: 'monospace', color: C.red,
          }}>
            ~4 threads
          </div>
        </div>
        <div style={{
          padding: 18, borderRadius: 14,
          background: `${C.green}08`, border: `1px solid ${C.green}30`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>⚡</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.green, marginBottom: 4 }}>
            Async/Await
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            1 thread, cooperative = lightweight and fast
          </div>
          <div style={{
            marginTop: 8, fontSize: 20, fontWeight: 800,
            fontFamily: 'monospace', color: C.green,
          }}>
            1,000+ coroutines
          </div>
        </div>
      </div>

      {/* Event Loop Carousel */}
      <div style={{
        position: 'relative', padding: '30px 20px',
        background: `${C.indigo}08`, borderRadius: 18,
        border: `1px solid ${C.indigo}20`,
      }}>
        <div style={{
          textAlign: 'center', marginBottom: 20,
          fontFamily: 'var(--font-heading)', fontWeight: 700,
          fontSize: 16, color: C.indigo,
        }}>
          🔄 Async Event Loop
        </div>

        {/* Circular arrangement of coroutines */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', gap: 12, marginBottom: 20,
        }}>
          {coroutines.map((co, i) => (
            <motion.div
              key={co.id}
              animate={{
                scale: i === activeCoroutine && isRunning ? 1.15 : 1,
                borderColor: i === activeCoroutine && isRunning ? co.color : 'var(--border)',
                boxShadow: i === activeCoroutine && isRunning
                  ? `0 0 20px ${co.color}40`
                  : '0 0 0 transparent',
              }}
              style={{
                padding: '12px 18px', borderRadius: 14,
                background: 'var(--bg-card)',
                border: '2px solid var(--border)',
                textAlign: 'center', minWidth: 100,
                transition: 'all 0.3s',
              }}
            >
              <div style={{ fontSize: 11, color: co.color, fontWeight: 700, marginBottom: 4 }}>
                {i === activeCoroutine && isRunning ? '▶ Running' : 'await...'}
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: 12, fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {co.name}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startLoop}
            disabled={isRunning}
            style={{
              padding: '10px 28px', borderRadius: 10,
              background: isRunning ? 'var(--border)' : C.indigo,
              color: isRunning ? 'var(--text-muted)' : '#fff',
              border: 'none', fontWeight: 700, fontSize: 13,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {isRunning ? '🔄 Loop running...' : '▶ Start Event Loop'}
          </motion.button>
        </div>

        <div style={{
          marginTop: 16, fontSize: 13, color: 'var(--text-muted)',
          textAlign: 'center', lineHeight: 1.7,
        }}>
          One thread handles all coroutines. When one hits <code style={{
            background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4,
          }}>await</code>, it yields and another runs. No context switch overhead!
        </div>
      </div>
    </div>
  )
}

/* ---- 5. Decision Flowchart ---- */
function DecisionFlowchart() {
  const [answer, setAnswer] = useState(null) // null, 'cpu', 'io-shared', 'io-isolated', 'io-best'

  const resetFlow = () => setAnswer(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Question 1 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '16px 28px', borderRadius: 16,
          background: `${C.indigo}12`, border: `2px solid ${C.indigo}40`,
          fontWeight: 700, fontSize: 15, color: C.indigo,
          fontFamily: 'var(--font-heading)', textAlign: 'center',
        }}
      >
        Is your work CPU-bound or I/O-bound?
      </motion.div>

      {/* Branches */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAnswer('cpu')}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: answer === 'cpu' ? C.red : `${C.red}12`,
            color: answer === 'cpu' ? '#fff' : C.red,
            border: `2px solid ${C.red}50`,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          🔢 CPU-Bound (math, ML training)
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAnswer('io-best')}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: answer && answer.startsWith('io') ? C.green : `${C.green}12`,
            color: answer && answer.startsWith('io') ? '#fff' : C.green,
            border: `2px solid ${C.green}50`,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          🌐 I/O-Bound (API, DB, files)
        </motion.button>
      </div>

      {/* Arrows and results */}
      <AnimatePresence>
        {answer === 'cpu' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: 24, borderRadius: 16,
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: `2px solid ${C.red}30`,
              textAlign: 'center', maxWidth: 400,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
            <div style={{
              fontWeight: 800, fontSize: 18, color: C.red,
              fontFamily: 'var(--font-heading)', marginBottom: 8,
            }}>
              Use Multiprocessing
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Each process has its own GIL. True parallelism on multiple cores.
              We cover this in Topic 5!
            </div>
          </motion.div>
        )}

        {answer === 'io-best' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
            }}
          >
            <div style={{
              padding: 20, borderRadius: 16,
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: `2px solid ${C.green}30`,
              textAlign: 'center', flex: '1 1 160px', maxWidth: 220,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
              <div style={{
                fontWeight: 800, fontSize: 15, color: C.emerald,
                fontFamily: 'var(--font-heading)', marginBottom: 6,
              }}>
                Async/Await (Best)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                1 thread, 1000s of coroutines. Lowest overhead. Best for web servers.
              </div>
            </div>
            <div style={{
              padding: 20, borderRadius: 16,
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: `2px solid ${C.blue}30`,
              textAlign: 'center', flex: '1 1 160px', maxWidth: 220,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>👍</div>
              <div style={{
                fontWeight: 800, fontSize: 15, color: C.blue,
                fontFamily: 'var(--font-heading)', marginBottom: 6,
              }}>
                Threading (Good)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Multiple threads. GIL released during I/O. Good when you need shared memory.
              </div>
            </div>
            <div style={{
              padding: 20, borderRadius: 16,
              background: `${C.purple}08`,
              border: `2px solid ${C.purple}30`,
              textAlign: 'center', flex: '1 1 160px', maxWidth: 220,
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
              <div style={{
                fontWeight: 800, fontSize: 15, color: C.purple,
                fontFamily: 'var(--font-heading)', marginBottom: 6,
              }}>
                Multiprocessing (Isolation)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Full isolation between tasks. Higher overhead but safer for critical work.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {answer && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetFlow}
          style={{
            padding: '8px 20px', borderRadius: 8,
            background: 'var(--bg-secondary)', color: 'var(--text-muted)',
            border: '1px solid var(--border)', fontWeight: 600, fontSize: 12,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          🔄 Try Again
        </motion.button>
      )}
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic4_Threading() {
  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '20px 16px 60px',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: 40,
          padding: '40px 24px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #059669, #10b981)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }} />
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: 56, marginBottom: 12, position: 'relative' }}
        >
          🧵
        </motion.div>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800,
          margin: '0 0 8px 0', position: 'relative',
        }}>
          Threading & Python's GIL
        </h1>
        <p style={{
          fontSize: 17, opacity: 0.9, maxWidth: 550, margin: '0 auto',
          lineHeight: 1.6, position: 'relative',
        }}>
          Why Python threads lie to you — and when they actually help
        </p>
      </motion.div>

      {/* Opening: Story Bridge */}
      <Neuron
        mood="thinking"
        message="In Topic 1, you learned a CPU core executes one instruction at a time. In Topic 2, you saw that web apps are mostly I/O-bound — the CPU is idle 95% of the time waiting for database queries and API calls. So... what if we could use that idle time? What if, while one task waits for a response, another task runs? Enter: Threading."
        typed={true}
        style={{ marginBottom: 40 }}
      />

      {/* ---- Section 1: What is a Thread? ---- */}
      <SectionBlock title="What is a Thread?" icon="🧵" color={C.blue}>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 8,
        }}>
          A <strong>thread</strong> is a lightweight unit of execution <em>within</em> a process.
          Think of a process as a full program running on your computer — it has its own memory, its own
          file handles, its own slice of CPU time. A thread is a worker <em>inside</em> that process.
        </p>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20,
        }}>
          The key insight: <strong>multiple threads share the same memory space</strong>. This makes them
          much lighter than spinning up entire new processes. But sharing memory also means threads can
          step on each other's toes — a problem we'll explore.
        </p>

        <InteractiveDemo title="Thread vs Process — Spawn & Compare">
          <ThreadProcessDemo />
        </InteractiveDemo>

        <Neuron
          mood="explaining"
          message="Notice how threads live INSIDE a process and share its memory. Spawning a thread costs ~1-2MB. Spawning a whole new process costs ~10-30MB. That's 10x heavier! But threads share memory — so if Thread 1 writes to a variable, Thread 2 can see it instantly. Powerful, but dangerous."
          style={{ marginTop: 16 }}
        />
      </SectionBlock>

      {/* ---- Section 2: Python's GIL ---- */}
      <SectionBlock title="Python's GIL — The Shocking Truth" icon="🔒" color={C.gold}>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 8,
        }}>
          Here's where Python gets weird. Most languages let threads truly run in parallel — if you have
          4 cores and 4 threads, all 4 run simultaneously. Python? <strong>Not so fast.</strong>
        </p>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 8,
        }}>
          Python (CPython) has a <strong>Global Interpreter Lock (GIL)</strong> — a mutex that protects
          access to Python objects. It ensures that <em>only one thread executes Python bytecode at any
          given time</em>, even on a machine with 16 cores.
        </p>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24,
        }}>
          The GIL exists because CPython's memory management (reference counting) is not thread-safe.
          Removing it would require making every object access thread-safe, which would slow down
          single-threaded code.
        </p>

        <InteractiveDemo title="GIL Lock Simulator — Watch the Golden Key">
          <GILSimulator />
        </InteractiveDemo>

        <Neuron
          mood="excited"
          message="Did you catch that? Toggle between CPU-bound and I/O-bound tasks. With CPU-bound work, 4 threads give you NO speedup — they just take turns holding the GIL! But with I/O-bound work, threads RELEASE the GIL while waiting, so other threads can run. 4 threads doing API calls = roughly 4x speed. This is the most important thing to understand about Python concurrency."
          style={{ marginTop: 16 }}
        />

        {/* Code comparison */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24,
        }}>
          <div style={{
            background: '#1a1a2e', borderRadius: 14, padding: 18,
            fontFamily: 'monospace', fontSize: 12, color: '#e0e0e0',
            border: `2px solid ${C.red}40`,
          }}>
            <div style={{ color: C.red, fontWeight: 700, fontSize: 11, marginBottom: 10, textTransform: 'uppercase' }}>
              CPU-Bound (No Speedup)
            </div>
            <div style={{ color: '#888' }}># 4 threads, each calculates primes</div>
            <div><span style={{ color: '#c792ea' }}>def</span> <span style={{ color: '#82aaff' }}>find_primes</span>(n):</div>
            <div>    <span style={{ color: '#888' }}># Pure CPU work</span></div>
            <div>    <span style={{ color: '#c792ea' }}>for</span> i <span style={{ color: '#c792ea' }}>in</span> range(n):</div>
            <div>        is_prime(i) <span style={{ color: '#888' }}># GIL held!</span></div>
            <div style={{ marginTop: 8, color: C.red, fontWeight: 700 }}>
              # Time: ~same as 1 thread
            </div>
          </div>
          <div style={{
            background: '#1a1a2e', borderRadius: 14, padding: 18,
            fontFamily: 'monospace', fontSize: 12, color: '#e0e0e0',
            border: `2px solid ${C.green}40`,
          }}>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 11, marginBottom: 10, textTransform: 'uppercase' }}>
              I/O-Bound (Real Speedup!)
            </div>
            <div style={{ color: '#888' }}># 4 threads, each calls an API</div>
            <div><span style={{ color: '#c792ea' }}>def</span> <span style={{ color: '#82aaff' }}>fetch_data</span>(url):</div>
            <div>    resp = requests.get(url)</div>
            <div>    <span style={{ color: '#888' }}># GIL released during I/O!</span></div>
            <div>    <span style={{ color: '#c792ea' }}>return</span> resp.json()</div>
            <div style={{ marginTop: 8, color: C.green, fontWeight: 700 }}>
              # Time: ~4x faster!
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* ---- Section 3: Threading for Web Apps ---- */}
      <SectionBlock title="Threading for Web Apps — Where It Shines" icon="🌐" color={C.cyan}>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 8,
        }}>
          Remember from Topic 2: a typical web request is ~95% I/O. The request flow looks like:
        </p>

        {/* Request timeline */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20,
          flexWrap: 'wrap', padding: '16px 20px',
          background: 'var(--bg-secondary)', borderRadius: 14,
        }}>
          {[
            { label: 'Parse', time: '2ms', color: C.blue, type: 'CPU' },
            { label: 'DB Query', time: '50ms', color: C.cyan, type: 'I/O' },
            { label: 'Process', time: '1ms', color: C.blue, type: 'CPU' },
            { label: 'API Call', time: '100ms', color: C.cyan, type: 'I/O' },
            { label: 'Format', time: '1ms', color: C.blue, type: 'CPU' },
            { label: 'Respond', time: '1ms', color: C.blue, type: 'CPU' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                padding: '6px 12px', borderRadius: 8,
                background: `${step.color}18`, border: `1px solid ${step.color}40`,
                fontSize: 11, fontWeight: 700, color: step.color,
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>
                <div>{step.label}</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>{step.time} ({step.type})</div>
              </div>
              {i < 5 && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>}
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 8,
        }}>
          Total CPU time: ~5ms. Total I/O time: ~150ms. The thread is <strong>idle 97%</strong> of the time!
          During that idle time, the GIL is released, and other threads can handle new requests.
        </p>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20,
        }}>
          This is exactly how <strong>FastAPI with multiple workers</strong> handles concurrent requests.
          Think of it as a <strong>thread pool</strong> — a fixed set of threads that pick up incoming requests.
        </p>

        <InteractiveDemo title="Web Server Thread Pool — Watch Requests Flow">
          <ThreadPoolDemo />
        </InteractiveDemo>

        <Neuron
          mood="happy"
          message="See how Thread 1 handles parsing (CPU), then waits for the database (I/O, releases GIL). While it waits, Thread 2 picks up the next request! By the time the DB responds to Thread 1, Thread 2 is already waiting on its own DB call. This is why threading works beautifully for web servers."
          style={{ marginTop: 16 }}
        />
      </SectionBlock>

      {/* ---- Section 4: Async/Await ---- */}
      <SectionBlock title="Async/Await — The Modern Alternative" icon="⚡" color={C.indigo}>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 8,
        }}>
          Threading works, but it has overhead. Each thread consumes memory, and switching between threads
          (context switching) costs CPU cycles. What if we could handle thousands of concurrent I/O operations
          with just <strong>one thread</strong>?
        </p>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 8,
        }}>
          Enter <strong>async/await</strong> — cooperative multitasking. Instead of the OS scheduling threads,
          your code explicitly says "I'm about to wait for I/O, let someone else run." These lightweight
          tasks are called <strong>coroutines</strong>.
        </p>

        <div style={{
          background: '#1a1a2e', borderRadius: 14, padding: 20, marginBottom: 24,
          fontFamily: 'monospace', fontSize: 13, color: '#e0e0e0',
          border: `2px solid ${C.indigo}40`,
        }}>
          <div style={{ color: C.indigo, fontWeight: 700, fontSize: 11, marginBottom: 10, textTransform: 'uppercase' }}>
            Async FastAPI Example
          </div>
          <div><span style={{ color: '#c792ea' }}>async def</span> <span style={{ color: '#82aaff' }}>handle_request</span>(user_id):</div>
          <div>    user = <span style={{ color: '#c792ea' }}>await</span> db.fetch_user(user_id)  <span style={{ color: '#888' }}># yields here</span></div>
          <div>    data = <span style={{ color: '#c792ea' }}>await</span> api.get_data(user)      <span style={{ color: '#888' }}># yields here</span></div>
          <div>    <span style={{ color: '#c792ea' }}>return</span> process(data)                  <span style={{ color: '#888' }}># runs when ready</span></div>
          <div style={{ marginTop: 8, color: '#888' }}># 1 thread can handle 1000s of these concurrently!</div>
        </div>

        <InteractiveDemo title="Async Event Loop — One Thread, Many Coroutines">
          <AsyncCarousel />
        </InteractiveDemo>

        <Neuron
          mood="explaining"
          message="Think of async like a single chef who starts boiling water, then chops vegetables while waiting, then checks the oven — all without hiring extra chefs (threads). Each 'await' is the chef saying 'this will take time, let me do something else.' One thread, zero context-switch overhead, thousands of concurrent tasks."
          style={{ marginTop: 16 }}
        />
      </SectionBlock>

      {/* ---- Section 5: When to Use What ---- */}
      <SectionBlock title="The Big Picture — When to Use What" icon="🗺️" color={C.purple}>
        <p style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24,
        }}>
          Now you know three concurrency tools. But which one should you reach for? Click through
          this decision flowchart to find the right tool for your workload.
        </p>

        <InteractiveDemo title="Concurrency Decision Flowchart">
          <DecisionFlowchart />
        </InteractiveDemo>

        {/* Summary table */}
        <div style={{
          overflowX: 'auto', marginTop: 24,
          borderRadius: 14, border: '1px solid var(--border)',
        }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: 13, color: 'var(--text-secondary)',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Approach', 'Best For', 'GIL Impact', 'Overhead', 'Concurrency'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontWeight: 700, fontSize: 12, color: 'var(--text-primary)',
                    borderBottom: '2px solid var(--border)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { approach: 'Threading', best: 'I/O-bound + shared memory', gil: 'Blocked for CPU', overhead: 'Medium', concurrency: '~10-100 threads' },
                { approach: 'Async/Await', best: 'I/O-bound (web servers)', gil: 'Not affected', overhead: 'Low', concurrency: '1,000+ coroutines' },
                { approach: 'Multiprocessing', best: 'CPU-bound', gil: 'Bypassed (own GIL)', overhead: 'High', concurrency: '= CPU cores' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.approach}</td>
                  <td style={{ padding: '12px 16px' }}>{row.best}</td>
                  <td style={{ padding: '12px 16px' }}>{row.gil}</td>
                  <td style={{ padding: '12px 16px' }}>{row.overhead}</td>
                  <td style={{ padding: '12px 16px' }}>{row.concurrency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Neuron
          mood="happy"
          message="Here's the cheat sheet: Building a web API? Use async/await (FastAPI does this by default). Need to download 100 files? Threading works great. Training an ML model? Multiprocessing or a C extension that releases the GIL. The GIL isn't a curse — it's a constraint you design around."
          style={{ marginTop: 24 }}
        />
      </SectionBlock>

      {/* ---- Section 6: Hindi Explainer ---- */}
      <SectionBlock title="Key Takeaways" icon="🎯" color={C.emerald}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24,
        }}>
          {[
            { emoji: '🧵', text: 'A thread is a lightweight worker inside a process — threads share memory, processes don\'t.' },
            { emoji: '🔑', text: 'Python\'s GIL allows only ONE thread to execute Python code at a time, regardless of CPU cores.' },
            { emoji: '🚫', text: 'CPU-bound work gets NO speedup from Python threads — the GIL serializes execution.' },
            { emoji: '✅', text: 'I/O-bound work (HTTP, DB, files) benefits from threading because the GIL is released during I/O waits.' },
            { emoji: '⚡', text: 'Async/await is the modern alternative: one thread, thousands of coroutines, zero context-switch overhead.' },
            { emoji: '🔧', text: 'For true CPU parallelism in Python, use multiprocessing (each process has its own GIL) — Topic 5.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '12px 16px', borderRadius: 12,
                background: 'var(--bg-secondary)',
                fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>

        <HindiExplainer
          concept="थ्रेडिंग और GIL"
          english="Threading & GIL"
          explanation="Thread एक process के अंदर का छोटा worker है। Python में GIL (Global Interpreter Lock) एक ऐसा नियम है कि एक समय में सिर्फ एक thread Python code चला सकता है — चाहे 100 threads हों! ये सिर्फ CPU वाले काम में problem है। I/O वाले काम (API call, database) में GIL release हो जाता है, तो threading काम करती है।"
          example="सोचो एक kitchen (process) में 4 chefs (threads) हैं, लेकिन सिर्फ एक चाकू (GIL) है। एक समय में सिर्फ एक chef काट सकता है। लेकिन जब एक chef oven में रखकर wait कर रहा है (I/O), तो चाकू दूसरे chef को दे देता है!"
          terms={[
            { hindi: 'थ्रेड', english: 'Thread', meaning: 'Process के अंदर का हल्का worker — memory share करता है' },
            { hindi: 'जी.आई.एल.', english: 'GIL', meaning: 'Python का lock — एक समय एक thread ही code चलाए' },
            { hindi: 'एसिंक', english: 'Async', meaning: 'एक thread में बारी-बारी से काम — I/O wait में दूसरा काम करो' },
            { hindi: 'कॉन्टेक्स्ट स्विच', english: 'Context Switch', meaning: 'एक thread से दूसरे पर जाने का overhead' },
          ]}
        />
      </SectionBlock>
    </div>
  )
}
