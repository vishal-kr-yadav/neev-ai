import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 5 — Multi-processing & True Parallelism
   Breaking free from Python's GIL with multiple processes
================================================================ */

/* ---- Helpers ---- */
const codeBlockStyle = {
  background: '#1e1e2e',
  color: '#cdd6f4',
  fontFamily: '"Fira Code", "Cascadia Code", monospace',
  fontSize: 14,
  lineHeight: 1.7,
  padding: '20px 24px',
  borderRadius: 14,
  overflowX: 'auto',
  margin: '16px 0',
  border: '1px solid #313244',
}

const keyword = { color: '#cba6f7' }
const func = { color: '#89b4fa' }
const string = { color: '#a6e3a1' }
const comment = { color: '#6c7086', fontStyle: 'italic' }
const param = { color: '#fab387' }

const buttonBase = {
  padding: '10px 22px',
  borderRadius: 12,
  border: 'none',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s',
}

/* ---- Section 1: Processes vs Threads ---- */
function ProcessVsThreadDemo() {
  const [running, setRunning] = useState(false)
  const [threadTime, setThreadTime] = useState(null)
  const [processTime, setProcessTime] = useState(null)
  const [threadProgress, setThreadProgress] = useState([0, 0, 0, 0])
  const [processProgress, setProcessProgress] = useState([0, 0, 0, 0])
  const [activeThread, setActiveThread] = useState(-1)

  const runDemo = () => {
    setRunning(true)
    setThreadTime(null)
    setProcessTime(null)
    setThreadProgress([0, 0, 0, 0])
    setProcessProgress([0, 0, 0, 0])
    setActiveThread(0)

    // Simulate threading: sequential due to GIL
    let threadStep = 0
    const threadInterval = setInterval(() => {
      threadStep++
      const currentTask = Math.floor(threadStep / 20)
      const taskProgress = ((threadStep % 20) + 1) * 5
      if (currentTask < 4) {
        setActiveThread(currentTask)
        setThreadProgress(prev => {
          const next = [...prev]
          next[currentTask] = Math.min(taskProgress, 100)
          return next
        })
      }
      if (threadStep >= 80) {
        clearInterval(threadInterval)
        setThreadTime(4.0)
        setActiveThread(-1)
      }
    }, 50)

    // Simulate multiprocessing: truly parallel
    let processStep = 0
    const processInterval = setInterval(() => {
      processStep++
      const progress = processStep * 5
      setProcessProgress([
        Math.min(progress, 100),
        Math.min(progress, 100),
        Math.min(progress, 100),
        Math.min(progress, 100),
      ])
      if (processStep >= 20) {
        clearInterval(processInterval)
        setProcessTime(1.0)
        setRunning(false)
      }
    }, 50)
  }

  const taskLabels = ['Image Resize', 'Edge Detect', 'Blur Filter', 'Color Shift']

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Threading Panel */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f10, #2563eb08)',
          border: '2px solid #3b82f620',
          borderRadius: 18,
          padding: 24,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#fff',
            }}>
              🧵
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Threading
              </div>
              <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>1 Process, 4 Threads, 1 GIL</div>
            </div>
          </div>

          {/* Process box with threads inside */}
          <div style={{
            background: '#3b82f608',
            border: '2px dashed #3b82f630',
            borderRadius: 14,
            padding: 16,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -10, left: 16,
              background: '#3b82f6', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '2px 10px',
              borderRadius: 6, textTransform: 'uppercase', letterSpacing: 1,
            }}>
              Single Process
            </div>

            {/* GIL Lock indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, marginBottom: 14, marginTop: 8,
            }}>
              <motion.div
                animate={running ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
                style={{ fontSize: 18 }}
              >
                🔒
              </motion.div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>GIL Lock</span>
            </div>

            {/* Shared memory label */}
            <div style={{
              textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
              marginBottom: 10, fontWeight: 600,
            }}>
              Shared Memory Space
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {taskLabels.map((label, i) => {
                const isActive = activeThread === i
                return (
                  <motion.div
                    key={i}
                    animate={isActive ? { boxShadow: '0 0 16px #3b82f644' } : { boxShadow: '0 0 0px transparent' }}
                    style={{
                      background: isActive ? '#3b82f618' : '#f1f5f910',
                      border: `1.5px solid ${isActive ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#3b82f6' : 'var(--text-muted)', marginBottom: 6 }}>
                      {label}
                    </div>
                    <div style={{
                      height: 6, borderRadius: 3,
                      background: '#e2e8f0',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        animate={{ width: `${threadProgress[i]}%` }}
                        style={{
                          height: '100%', borderRadius: 3,
                          background: isActive ? '#3b82f6' : (threadProgress[i] === 100 ? '#10b981' : '#94a3b8'),
                        }}
                      />
                    </div>
                    <div style={{
                      fontSize: 10, marginTop: 4, fontWeight: 700,
                      color: isActive ? '#3b82f6' : (threadProgress[i] === 100 ? '#10b981' : 'var(--text-muted)'),
                    }}>
                      {isActive ? 'RUNNING' : (threadProgress[i] === 100 ? 'DONE' : 'WAITING')}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Timer */}
          <div style={{
            textAlign: 'center', marginTop: 16, fontSize: 28, fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: threadTime != null ? '#ef4444' : 'var(--text-muted)',
          }}>
            {threadTime != null ? `${threadTime.toFixed(1)}s` : (running ? 'Running...' : '--')}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            Tasks run one-by-one (GIL blocks)
          </div>
        </div>

        {/* Multiprocessing Panel */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b08, #d9740010)',
          border: '2px solid #f59e0b20',
          borderRadius: 18,
          padding: 24,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#fff',
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Multiprocessing
              </div>
              <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>4 Processes, each with own GIL</div>
            </div>
          </div>

          {/* 4 separate process boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {taskLabels.map((label, i) => (
              <div key={i} style={{
                background: '#f59e0b08',
                border: '2px dashed #f59e0b30',
                borderRadius: 12,
                padding: 12,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: -8, left: 10,
                  background: '#d97706', color: '#fff',
                  fontSize: 9, fontWeight: 700, padding: '1px 8px',
                  borderRadius: 5, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  Process {i + 1}
                </div>
                <div style={{
                  fontSize: 10, color: 'var(--text-muted)', marginTop: 4, marginBottom: 4,
                  textAlign: 'center', fontWeight: 600,
                }}>
                  Own Memory + GIL
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#d97706', marginBottom: 6, textAlign: 'center' }}>
                  {label}
                </div>
                <div style={{
                  height: 6, borderRadius: 3,
                  background: '#fde68a40',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    animate={{ width: `${processProgress[i]}%` }}
                    style={{
                      height: '100%', borderRadius: 3,
                      background: processProgress[i] === 100 ? '#10b981' : '#f59e0b',
                    }}
                  />
                </div>
                <div style={{
                  fontSize: 10, marginTop: 4, fontWeight: 700, textAlign: 'center',
                  color: processProgress[i] === 100 ? '#10b981' : (processProgress[i] > 0 ? '#d97706' : 'var(--text-muted)'),
                }}>
                  {processProgress[i] === 100 ? 'DONE' : (processProgress[i] > 0 ? 'RUNNING' : 'READY')}
                </div>
              </div>
            ))}
          </div>

          {/* Timer */}
          <div style={{
            textAlign: 'center', marginTop: 16, fontSize: 28, fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: processTime != null ? '#10b981' : 'var(--text-muted)',
          }}>
            {processTime != null ? `${processTime.toFixed(1)}s` : (running ? 'Running...' : '--')}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            All tasks run simultaneously!
          </div>
        </div>
      </div>

      {/* Run button */}
      <div style={{ textAlign: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runDemo}
          disabled={running}
          style={{
            ...buttonBase,
            padding: '14px 36px',
            fontSize: 16,
            background: running
              ? 'linear-gradient(135deg, #94a3b8, #64748b)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff',
            boxShadow: running ? 'none' : '0 4px 20px #f59e0b44',
          }}
        >
          {running ? 'Running CPU Tasks...' : 'Run CPU Task (4 images)'}
        </motion.button>
      </div>

      {/* Speedup callout */}
      <AnimatePresence>
        {threadTime != null && processTime != null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{
              marginTop: 20,
              background: 'linear-gradient(135deg, #10b98115, #05966910)',
              border: '2px solid #10b98130',
              borderRadius: 16,
              padding: '16px 24px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 24 }}>🚀</span>
            <span style={{
              fontWeight: 800, fontSize: 18, color: '#10b981',
              fontFamily: 'var(--font-heading)', marginLeft: 10,
            }}>
              {(threadTime / processTime).toFixed(0)}x Speedup!
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginLeft: 8 }}>
              Multiprocessing completed in {processTime.toFixed(1)}s vs {threadTime.toFixed(1)}s with threading
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 3: Resource Usage Calculator ---- */
function ResourceCalculator() {
  const [numProcesses, setNumProcesses] = useState(4)

  const baseMemoryMB = 30
  const appMemoryMB = 45
  const startupMs = 100
  const cpuCores = 4

  const perProcessMemory = baseMemoryMB + appMemoryMB
  const totalMemory = numProcesses * perProcessMemory
  const totalStartup = numProcesses * startupMs
  const isOptimal = numProcesses <= cpuCores
  const efficiency = numProcesses <= cpuCores
    ? 100
    : Math.max(40, Math.round(100 - (numProcesses - cpuCores) * 12))

  const processOptions = [1, 2, 4, 8, 16]

  return (
    <div>
      {/* Process selector */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        {processOptions.map(n => (
          <motion.button
            key={n}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNumProcesses(n)}
            style={{
              ...buttonBase,
              padding: '10px 20px',
              background: numProcesses === n
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'var(--bg-secondary)',
              color: numProcesses === n ? '#fff' : 'var(--text-secondary)',
              border: numProcesses === n ? 'none' : '1px solid var(--border)',
            }}
          >
            {n} Process{n > 1 ? 'es' : ''}
          </motion.button>
        ))}
      </div>

      {/* Memory visualization */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
          Memory Usage
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120, marginBottom: 12 }}>
          {Array.from({ length: numProcesses }, (_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.min((perProcessMemory / 120) * 100, 100)}%` }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 120 }}
              style={{
                flex: 1,
                maxWidth: 60,
                background: i < cpuCores
                  ? 'linear-gradient(to top, #f59e0b, #fbbf24)'
                  : 'linear-gradient(to top, #ef4444, #f87171)',
                borderRadius: '8px 8px 0 0',
                position: 'relative',
                minWidth: 20,
              }}
            >
              <div style={{
                position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                fontSize: 10, fontWeight: 700,
                color: i < cpuCores ? '#d97706' : '#ef4444',
                whiteSpace: 'nowrap',
              }}>
                {perProcessMemory}MB
              </div>
              <div style={{
                position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                fontSize: 9, fontWeight: 700, color: '#fff',
                whiteSpace: 'nowrap',
              }}>
                P{i + 1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 14, textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: totalMemory > 500 ? '#ef4444' : '#f59e0b', fontFamily: 'var(--font-heading)' }}>
              {totalMemory} MB
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>Total Memory</div>
          </div>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 14, textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: totalStartup > 500 ? '#ef4444' : '#3b82f6', fontFamily: 'var(--font-heading)' }}>
              {totalStartup} ms
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>Startup Time</div>
          </div>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 14, textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)',
              color: isOptimal ? '#10b981' : '#ef4444',
            }}>
              {efficiency}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>Efficiency</div>
          </div>
        </div>

        {/* Sweet spot indicator */}
        <motion.div
          animate={{ opacity: 1 }}
          style={{
            marginTop: 14,
            padding: '10px 16px',
            borderRadius: 10,
            background: isOptimal ? '#10b98112' : '#ef444412',
            border: `1px solid ${isOptimal ? '#10b98130' : '#ef444430'}`,
            fontSize: 13,
            color: isOptimal ? '#059669' : '#dc2626',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {isOptimal
            ? `Sweet spot! ${numProcesses} process${numProcesses > 1 ? 'es' : ''} on ${cpuCores} cores = efficient utilization`
            : `${numProcesses} processes on ${cpuCores} cores = context switching overhead, wasted memory`}
        </motion.div>
      </div>

      {/* Comparison table */}
      <div style={{
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              {['Metric', 'Thread', 'Process'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontFamily: 'var(--font-heading)', fontWeight: 700,
                  color: 'var(--text-primary)', fontSize: 13,
                  borderBottom: '2px solid var(--border)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Memory', 'Shared (light)', 'Isolated (heavy)', '#3b82f6', '#f59e0b'],
              ['Startup', '~1ms', '~100ms', '#3b82f6', '#f59e0b'],
              ['GIL', 'Shared', 'Each has own', '#ef4444', '#10b981'],
              ['CPU Parallelism', 'No', 'Yes', '#ef4444', '#10b981'],
              ['Best for', 'I/O-bound', 'CPU-bound', '#3b82f6', '#f59e0b'],
            ].map(([metric, thread, process, threadColor, processColor], i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                  {metric}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{
                    background: `${threadColor}15`, color: threadColor,
                    padding: '3px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12,
                  }}>
                    {thread}
                  </span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{
                    background: `${processColor}15`, color: processColor,
                    padding: '3px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12,
                  }}>
                    {process}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---- Section 4: Worker-Core Mapping ---- */
function WorkerCoreMapping() {
  const [workers, setWorkers] = useState(2)
  const cores = 2

  const configs = {
    1: {
      coreUsage: [80, 0],
      throughput: 50,
      switching: 'None',
      switchColor: '#10b981',
      verdict: 'Under-utilized. One core sits idle.',
    },
    2: {
      coreUsage: [95, 95],
      throughput: 100,
      switching: 'Minimal',
      switchColor: '#10b981',
      verdict: 'Optimal! Both cores fully utilized.',
    },
    3: {
      coreUsage: [100, 100],
      throughput: 115,
      switching: 'Moderate',
      switchColor: '#f59e0b',
      verdict: '3 workers share 2 cores. Some context switching.',
    },
    4: {
      coreUsage: [100, 100],
      throughput: 105,
      switching: 'Heavy',
      switchColor: '#ef4444',
      verdict: 'Diminishing returns! Context switching eats into gains.',
    },
  }

  const config = configs[workers]

  return (
    <div>
      {/* Worker selector */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {[1, 2, 3, 4].map(n => (
          <motion.button
            key={n}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWorkers(n)}
            style={{
              ...buttonBase,
              background: workers === n
                ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                : 'var(--bg-secondary)',
              color: workers === n ? '#fff' : 'var(--text-secondary)',
              border: workers === n ? 'none' : '1px solid var(--border)',
            }}
          >
            {n} Worker{n > 1 ? 's' : ''}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Server visualization */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
            Server (2 vCPUs)
          </div>

          {/* CPU Cores */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {config.coreUsage.map((usage, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textAlign: 'center' }}>
                  Core {i + 1}
                </div>
                <div style={{
                  height: 80, borderRadius: 12,
                  background: '#e2e8f0',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <motion.div
                    animate={{ height: `${usage}%` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      borderRadius: 12,
                      background: usage === 0
                        ? 'transparent'
                        : usage >= 100
                          ? (workers > cores ? 'linear-gradient(to top, #ef4444, #f87171)' : 'linear-gradient(to top, #10b981, #34d399)')
                          : 'linear-gradient(to top, #3b82f6, #60a5fa)',
                    }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 14, fontWeight: 800, color: usage > 50 ? '#fff' : 'var(--text-muted)',
                  }}>
                    {usage}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Workers */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: workers }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: i < cores
                    ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  boxShadow: `0 4px 12px ${i < cores ? '#8b5cf633' : '#f59e0b33'}`,
                }}
              >
                <span style={{ fontSize: 16 }}>⚙️</span>
                <span>W{i + 1}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Metrics panel */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
            Performance Metrics
          </div>

          {/* Throughput */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Throughput (req/sec)
            </div>
            <div style={{ height: 24, borderRadius: 8, background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
              <motion.div
                animate={{ width: `${config.throughput}%` }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{
                  height: '100%', borderRadius: 8,
                  background: config.throughput >= 95
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : config.throughput >= 80
                      ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                      : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                }}
              />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: 12, fontWeight: 800, color: config.throughput > 50 ? '#fff' : 'var(--text-primary)',
              }}>
                {config.throughput} req/sec
              </div>
            </div>
          </div>

          {/* Context Switching */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Context Switching
            </div>
            <div style={{
              padding: '8px 14px', borderRadius: 10,
              background: `${config.switchColor}12`,
              border: `1.5px solid ${config.switchColor}30`,
              fontSize: 14, fontWeight: 700,
              color: config.switchColor,
            }}>
              {config.switching}
            </div>
          </div>

          {/* Verdict */}
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: workers === 2 ? '#10b98112' : (workers < 2 ? '#3b82f612' : '#f59e0b12'),
            border: `1.5px solid ${workers === 2 ? '#10b98130' : (workers < 2 ? '#3b82f630' : '#f59e0b30')}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {workers === 2 && <span style={{ marginRight: 6 }}>&#x2705;</span>}
              {workers > 2 && <span style={{ marginRight: 6 }}>&#x26A0;&#xFE0F;</span>}
              {workers < 2 && <span style={{ marginRight: 6 }}>&#x1F4A4;</span>}
              {config.verdict}
            </div>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div style={{
        textAlign: 'center', padding: '14px 20px',
        background: 'var(--bg-secondary)', borderRadius: 12,
        fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
      }}>
        Rule of thumb: <strong style={{ color: '#8b5cf6' }}>workers = CPU cores</strong> (or 2 x cores for I/O-bound apps)
      </div>
    </div>
  )
}

/* ---- Section 5: Amdahl's Law Calculator ---- */
function AmdahlCalculator() {
  const [parallelPct, setParallelPct] = useState(80)
  const [numCores, setNumCores] = useState(4)

  const serialFraction = (100 - parallelPct) / 100
  const parallelFraction = parallelPct / 100
  const speedup = 1 / (serialFraction + parallelFraction / numCores)
  const maxSpeedup = 1 / serialFraction
  const efficiency = (speedup / numCores) * 100

  // Generate curve data points
  const curvePoints = []
  for (let cores = 1; cores <= 64; cores++) {
    const s = 1 / (serialFraction + parallelFraction / cores)
    curvePoints.push({ cores, speedup: s })
  }

  // SVG chart dimensions
  const chartW = 400
  const chartH = 200
  const padL = 45
  const padR = 15
  const padT = 15
  const padB = 30
  const plotW = chartW - padL - padR
  const plotH = chartH - padT - padB

  const maxY = Math.ceil(maxSpeedup) + 1
  const toX = (cores) => padL + (Math.log2(cores) / Math.log2(64)) * plotW
  const toY = (s) => padT + plotH - (s / maxY) * plotH

  const pathD = curvePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.cores).toFixed(1)},${toY(p.speedup).toFixed(1)}`)
    .join(' ')

  // Max speedup horizontal line
  const maxLineY = toY(maxSpeedup)

  return (
    <div>
      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
            Parallelizable: <span style={{ color: '#8b5cf6' }}>{parallelPct}%</span>
          </label>
          <input
            type="range" min="10" max="99" value={parallelPct}
            onChange={e => setParallelPct(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#8b5cf6' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>10%</span><span>99%</span>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
            Cores: <span style={{ color: '#f59e0b' }}>{numCores}</span>
          </label>
          <input
            type="range" min="1" max="64" value={numCores}
            onChange={e => setNumCores(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>1</span><span>64</span>
          </div>
        </div>
      </div>

      {/* Result cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf615, #7c3aed10)',
          borderRadius: 14, padding: 16, textAlign: 'center',
          border: '1.5px solid #8b5cf625',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#8b5cf6', fontFamily: 'var(--font-heading)' }}>
            {speedup.toFixed(2)}x
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
            Actual Speedup
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b15, #d9770610)',
          borderRadius: 14, padding: 16, textAlign: 'center',
          border: '1.5px solid #f59e0b25',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
            {maxSpeedup.toFixed(1)}x
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
            Max Speedup (Infinite Cores)
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #10b98115, #05966910)',
          borderRadius: 14, padding: 16, textAlign: 'center',
          border: '1.5px solid #10b98125',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: efficiency > 50 ? '#10b981' : '#ef4444', fontFamily: 'var(--font-heading)' }}>
            {efficiency.toFixed(0)}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
            Parallel Efficiency
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        padding: 20,
        border: '1px solid var(--border)',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
          Speedup vs Number of Cores (Amdahl's Law)
        </div>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const y = padT + frac * plotH
            return (
              <g key={frac}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y}
                  stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
                <text x={padL - 6} y={y + 4} textAnchor="end"
                  fill="var(--text-muted)" fontSize="9" fontWeight="600">
                  {(maxY * (1 - frac)).toFixed(1)}x
                </text>
              </g>
            )
          })}

          {/* X axis labels */}
          {[1, 2, 4, 8, 16, 32, 64].map(c => (
            <text key={c} x={toX(c)} y={chartH - 5} textAnchor="middle"
              fill="var(--text-muted)" fontSize="9" fontWeight="600">
              {c}
            </text>
          ))}
          <text x={chartW / 2} y={chartH} textAnchor="middle"
            fill="var(--text-muted)" fontSize="8" fontWeight="600">
            cores
          </text>

          {/* Max speedup line */}
          <line x1={padL} y1={maxLineY} x2={chartW - padR} y2={maxLineY}
            stroke="#ef4444" strokeWidth="1" strokeDasharray="6,3" />
          <text x={chartW - padR + 2} y={maxLineY + 3}
            fill="#ef4444" fontSize="8" fontWeight="700" textAnchor="start">
            max {maxSpeedup.toFixed(1)}x
          </text>

          {/* Curve */}
          <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />

          {/* Fill area under curve */}
          <path
            d={`${pathD} L${toX(64)},${padT + plotH} L${toX(1)},${padT + plotH} Z`}
            fill="#8b5cf6" opacity="0.08"
          />

          {/* Current point marker */}
          <circle cx={toX(numCores)} cy={toY(speedup)} r="5"
            fill="#8b5cf6" stroke="#fff" strokeWidth="2" />
          <text x={toX(numCores)} y={toY(speedup) - 10}
            textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="800">
            {speedup.toFixed(2)}x
          </text>
        </svg>
      </div>

      {/* Serial bottleneck visualization */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 14,
        padding: 16,
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          Your Code Breakdown
        </div>
        <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
          <motion.div
            animate={{ width: `${100 - parallelPct}%` }}
            style={{
              background: 'linear-gradient(90deg, #ef4444, #f87171)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
              minWidth: parallelPct < 95 ? 40 : 0,
            }}
          >
            {parallelPct < 95 ? `${100 - parallelPct}% serial` : ''}
          </motion.div>
          <motion.div
            animate={{ width: `${parallelPct}%` }}
            style={{
              background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}
          >
            {parallelPct}% parallel
          </motion.div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
          The <span style={{ color: '#ef4444', fontWeight: 800 }}>{100 - parallelPct}% serial portion</span> limits
          your max speedup to <span style={{ color: '#8b5cf6', fontWeight: 800 }}>{maxSpeedup.toFixed(1)}x</span> regardless
          of how many cores you add
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic5_MultiProcessing() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px 60px' }}>
      {/* ---- Hero ---- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: 56, marginBottom: 12 }}
        >
          ⚡
        </motion.div>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800,
          color: 'var(--text-primary)', margin: 0, lineHeight: 1.2,
        }}>
          Multi-processing & True Parallelism
        </h1>
        <p style={{
          fontSize: 17, color: 'var(--text-muted)', marginTop: 10,
          maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6,
        }}>
          Break free from the GIL — real parallel execution with multiple processes
        </p>
      </motion.div>

      {/* ---- Opening: Bridge from Topic 4 ---- */}
      <Neuron
        mood="thinking"
        message="In Topic 4, you discovered Python's GIL — the lock that prevents true parallelism for CPU-bound work. But what if your task IS CPU-bound? Image processing, ML training, encryption — you NEED all cores working at once. The answer: Multiprocessing."
        typed
        style={{ marginBottom: 36 }}
      />

      {/* ---- Section 1: Processes vs Threads ---- */}
      <SectionBlock title="Processes vs Threads — The Key Difference" icon="🔀" color="#f59e0b">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 20px 0' }}>
          With threading, all threads share one process and one GIL — only one thread runs Python code at a time.
          With multiprocessing, each process is a <strong>completely separate Python interpreter</strong> with its own GIL and its own memory space.
          They all run <em>truly simultaneously</em> on different CPU cores.
        </p>

        <InteractiveDemo title="Thread vs Process: CPU Task Race">
          <ProcessVsThreadDemo />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 2: How Multiprocessing Works ---- */}
      <SectionBlock title="How Multiprocessing Works in Python" icon="🐍" color="#3b82f6">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0' }}>
          Python's <code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>multiprocessing</code> module
          spawns entirely new OS processes. Each one gets its own Python interpreter, its own GIL, and its own memory space.
          This means true OS-level parallelism — no GIL contention.
        </p>

        <div style={codeBlockStyle}>
          <div><span style={keyword}>from</span> <span style={func}>multiprocessing</span> <span style={keyword}>import</span> Pool</div>
          <div style={{ height: 10 }} />
          <div><span style={keyword}>def</span> <span style={func}>process_image</span>(<span style={param}>image_path</span>):</div>
          <div style={{ paddingLeft: 24 }}><span style={comment}># CPU-heavy work: resize, filter, enhance</span></div>
          <div style={{ paddingLeft: 24 }}><span style={keyword}>return</span> enhanced_image</div>
          <div style={{ height: 10 }} />
          <div><span style={comment}># Create a pool of 4 worker processes</span></div>
          <div><span style={keyword}>with</span> <span style={func}>Pool</span>(processes=<span style={param}>4</span>) <span style={keyword}>as</span> pool:</div>
          <div style={{ paddingLeft: 24 }}>results = pool.<span style={func}>map</span>(process_image, image_list)</div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 20,
        }}>
          {[
            { icon: '🧠', title: 'Own Interpreter', desc: 'Each process runs a fresh Python interpreter' },
            { icon: '🔒', title: 'Own GIL', desc: 'No GIL contention between processes' },
            { icon: '💾', title: 'Own Memory', desc: 'Separate memory space, no shared state issues' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 14,
                padding: 18,
                textAlign: 'center',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </motion.div>
          ))}
        </div>

        <Neuron
          mood="explaining"
          message="Think of threading as 4 chefs sharing one kitchen knife — only one can chop at a time. Multiprocessing gives each chef their own complete kitchen. More expensive, but they all cook simultaneously!"
          style={{ marginTop: 24 }}
        />
      </SectionBlock>

      {/* ---- Section 3: The Cost of Processes ---- */}
      <SectionBlock title="The Cost of Processes" icon="💰" color="#ef4444">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0' }}>
          Processes give you true parallelism, but they are <strong>expensive</strong>. Each process copies the
          entire Python interpreter (~30MB), plus your application code and data. Startup is ~100ms per process.
          The sweet spot? Usually <strong>number of processes = number of CPU cores</strong>.
        </p>

        <InteractiveDemo title="Resource Usage Calculator">
          <ResourceCalculator />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 4: Workers in Web Servers ---- */}
      <SectionBlock title="Workers in Web Servers" icon="🌐" color="#8b5cf6">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0' }}>
          In production FastAPI / Gunicorn deployments, <strong>"workers" are separate processes</strong>. Each worker
          has its own Python interpreter, handles requests independently, and uses its own CPU core. This is
          exactly multiprocessing applied to web serving.
        </p>

        <div style={{
          display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
        }}>
          {[
            { label: 'Own interpreter', color: '#8b5cf6' },
            { label: 'Independent requests', color: '#3b82f6' },
            { label: 'Separate CPU core', color: '#10b981' },
          ].map((tag, i) => (
            <span key={i} style={{
              background: `${tag.color}12`,
              color: tag.color,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              border: `1px solid ${tag.color}25`,
            }}>
              {tag.label}
            </span>
          ))}
        </div>

        <InteractiveDemo title="Worker-Core Mapping Simulator">
          <WorkerCoreMapping />
        </InteractiveDemo>

        <Neuron
          mood="excited"
          message="This is exactly what you'll deep-dive into in Topic 6 — FastAPI Under the Hood. You'll see how 2 workers on 2 vCPUs handle real HTTP requests!"
          style={{ marginTop: 20 }}
        />
      </SectionBlock>

      {/* ---- Section 5: True Parallelism — Amdahl's Law ---- */}
      <SectionBlock title="True Parallelism — Limitations & Reality" icon="📐" color="#d97706">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 8px 0' }}>
          Even with infinite cores, your speedup is limited by the <strong>serial portion</strong> of your code.
          This is <strong>Amdahl's Law</strong> — the fundamental limit of parallelism.
        </p>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 14,
          padding: 20,
          margin: '16px 0 20px 0',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
            Amdahl's Law — Quick Examples
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { pct: 90, max: '10x', desc: '90% parallelizable code', color: '#10b981' },
              { pct: 50, max: '2x', desc: '50% parallelizable code', color: '#f59e0b' },
              { pct: 75, max: '4x', desc: '75% parallelizable code', color: '#3b82f6' },
              { pct: 25, max: '1.3x', desc: '25% parallelizable code', color: '#ef4444' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-card)',
                borderRadius: 10,
                padding: '10px 14px',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16, color: item.color,
                  fontFamily: 'var(--font-heading)',
                  flexShrink: 0,
                }}>
                  {item.max}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.desc}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max speedup with infinite cores</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <InteractiveDemo title="Amdahl's Law Calculator">
          <AmdahlCalculator />
        </InteractiveDemo>

        <Neuron
          mood="thinking"
          message="The lesson: before throwing more cores at a problem, profile your code. Find the serial bottleneck. Sometimes optimizing 5% of serial code helps more than doubling your server count."
          style={{ marginTop: 20 }}
        />
      </SectionBlock>

      {/* ---- Section 6: Hindi Explainer ---- */}
      <SectionBlock title="Recap" icon="📝" color="var(--accent)">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0' }}>
          You have learned the key distinction between threading and multiprocessing, when to use each,
          the cost trade-offs, how web server workers map to CPU cores, and the theoretical limits of
          parallelism via Amdahl's Law. Next up in Topic 6: FastAPI Under the Hood.
        </p>

        <HindiExplainer
          concept="मल्टी-प्रोसेसिंग"
          english="Multi-processing & True Parallelism"
          explanation="Multiprocessing मतलब कई अलग-अलग processes चलाना — हर process का अपना GIL, अपनी memory। ये सच में parallel चलते हैं! जैसे Threading में एक kitchen में 4 chefs एक चाकू share करते थे, Multiprocessing में हर chef की अपनी पूरी kitchen है।"
          example="सोचो 1000 photos resize करनी हैं। 1 process = 1000 seconds। 4 processes = 250 seconds (4 गुना तेज़)। लेकिन 100 processes बनाने से तेज़ नहीं होगा — 4 core CPU है तो 4 से ज़्यादा processes बनाने का फ़ायदा कम है।"
          terms={[
            { hindi: 'प्रोसेस', english: 'Process', meaning: 'अपनी memory वाला independent program — heavy लेकिन truly parallel' },
            { hindi: 'वर्कर', english: 'Worker', meaning: 'Web server में एक process जो requests handle करे' },
            { hindi: 'अमदाह्ल का नियम', english: "Amdahl's Law", meaning: 'Serial code जितना ज़्यादा, parallel speedup उतना कम' },
            { hindi: 'कॉन्टेक्स्ट स्विचिंग', english: 'Context Switching', meaning: 'CPU का एक process से दूसरे पर जाना — इसमें भी समय लगता है' },
          ]}
        />
      </SectionBlock>
    </div>
  )
}
