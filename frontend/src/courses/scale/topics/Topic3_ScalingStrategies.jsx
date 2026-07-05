import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 3 — Scaling Strategies
   Vertical vs Horizontal, Dedicated vs Autoscale, Load Balancing
================================================================ */

/* ---- Server Overload Visual ---- */
function ServerOverloadVisual() {
  const [users, setUsers] = useState(100)
  const maxUsers = 10000
  const responseTime = Math.min(users * 0.5, 5000)
  const errorRate = users > 3000 ? Math.min(((users - 3000) / 7000) * 80, 80) : 0
  const cpuLoad = Math.min((users / maxUsers) * 150, 150)

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Server box */}
      <motion.div
        animate={{
          borderColor: cpuLoad > 100 ? '#ef4444' : cpuLoad > 70 ? '#f59e0b' : '#10b981',
          boxShadow: cpuLoad > 100
            ? '0 0 30px rgba(239,68,68,0.4)'
            : '0 4px 12px rgba(0,0,0,0.08)',
        }}
        style={{
          width: 180, margin: '0 auto 20px', padding: 20,
          borderRadius: 16, border: '2px solid',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>
          {cpuLoad > 100 ? '🔥' : '🖥️'}
        </div>
        <div style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700,
          fontSize: 14, color: 'var(--text-primary)', marginBottom: 12,
        }}>
          Single Server
        </div>

        {/* CPU Bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: 'var(--text-muted)', marginBottom: 4,
          }}>
            <span>CPU</span>
            <span>{Math.min(cpuLoad, 100).toFixed(0)}%</span>
          </div>
          <div style={{
            height: 8, borderRadius: 4, background: 'var(--border)',
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${Math.min(cpuLoad, 100)}%` }}
              style={{
                height: '100%', borderRadius: 4,
                background: cpuLoad > 90 ? '#ef4444' : cpuLoad > 60 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
        </div>

        {/* Response Time */}
        <div style={{
          fontSize: 12, color: responseTime > 2000 ? '#ef4444' : 'var(--text-muted)',
          fontWeight: 600, marginTop: 8,
        }}>
          Response: {responseTime.toFixed(0)}ms
          {responseTime > 2000 && ' (SLOW!)'}
        </div>

        {/* Error Rate */}
        {errorRate > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: 12, color: '#ef4444', fontWeight: 700, marginTop: 4,
            }}
          >
            Errors: {errorRate.toFixed(0)}%
          </motion.div>
        )}
      </motion.div>

      {/* User icons */}
      <div style={{
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        gap: 2, maxWidth: 300, margin: '0 auto 16px',
      }}>
        {Array.from({ length: Math.min(Math.floor(users / 200), 50) }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            style={{ fontSize: 14 }}
          >
            👤
          </motion.span>
        ))}
      </div>

      <div style={{
        fontSize: 22, fontWeight: 800, color: 'var(--text-primary)',
        fontFamily: 'var(--font-heading)', marginBottom: 12,
      }}>
        {users.toLocaleString()} users
      </div>

      <input
        type="range" min={100} max={maxUsers} step={100} value={users}
        onChange={e => setUsers(Number(e.target.value))}
        style={{ width: '80%', cursor: 'pointer' }}
      />
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
        Drag to simulate traffic growth
      </div>
    </div>
  )
}

/* ---- Vertical Scaling Simulator ---- */
function VerticalScalingSimulator() {
  const [cpu, setCpu] = useState(0)
  const [ram, setRam] = useState(0)
  const [ssd, setSsd] = useState(0)

  const cpuLevels = [
    { cores: 2, perf: 1, cost: 20 },
    { cores: 4, perf: 1.95, cost: 50 },
    { cores: 8, perf: 3.5, cost: 120 },
    { cores: 16, perf: 5.5, cost: 300 },
    { cores: 32, perf: 6.6, cost: 800 },
  ]
  const ramLevels = [
    { gb: 4, perf: 1, cost: 0 },
    { gb: 8, perf: 1.6, cost: 15 },
    { gb: 16, perf: 2.2, cost: 40 },
    { gb: 32, perf: 2.8, cost: 90 },
    { gb: 64, perf: 3.2, cost: 200 },
    { gb: 128, perf: 3.4, cost: 450 },
  ]
  const ssdLevels = [
    { size: '100GB', perf: 1, cost: 0 },
    { size: '500GB', perf: 1.3, cost: 20 },
    { size: '1TB', perf: 1.5, cost: 60 },
  ]

  const currentCpu = cpuLevels[cpu]
  const currentRam = ramLevels[ram]
  const currentSsd = ssdLevels[ssd]
  const totalCost = currentCpu.cost + currentRam.cost + currentSsd.cost
  const totalPerf = ((currentCpu.perf + currentRam.perf + currentSsd.perf) / 3).toFixed(1)
  const atMax = cpu === cpuLevels.length - 1 && ram === ramLevels.length - 1 && ssd === ssdLevels.length - 1

  const upgradeCpu = () => { if (cpu < cpuLevels.length - 1) setCpu(cpu + 1) }
  const upgradeRam = () => { if (ram < ramLevels.length - 1) setRam(ram + 1) }
  const upgradeSsd = () => { if (ssd < ssdLevels.length - 1) setSsd(ssd + 1) }

  return (
    <div>
      {/* Server Box */}
      <motion.div
        layout
        style={{
          background: 'var(--bg-secondary)', borderRadius: 16,
          border: '2px solid var(--border)', padding: 24,
          maxWidth: 400, margin: '0 auto 20px', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>🖥️</div>
        <div style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700,
          fontSize: 16, color: 'var(--text-primary)', marginBottom: 16,
        }}>
          Your Server
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: '10px 16px',
            border: '1px solid var(--border)', minWidth: 80,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>CPU</div>
            <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 18 }}>
              {currentCpu.cores} cores
            </div>
          </div>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: '10px 16px',
            border: '1px solid var(--border)', minWidth: 80,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>RAM</div>
            <div style={{ fontWeight: 800, color: '#8b5cf6', fontSize: 18 }}>
              {currentRam.gb}GB
            </div>
          </div>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: '10px 16px',
            border: '1px solid var(--border)', minWidth: 80,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>SSD</div>
            <div style={{ fontWeight: 800, color: '#10b981', fontSize: 18 }}>
              {currentSsd.size}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Buttons */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20,
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={upgradeCpu}
          disabled={cpu >= cpuLevels.length - 1}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: cpu >= cpuLevels.length - 1 ? '#ccc' : 'var(--accent)',
            color: '#fff', fontWeight: 700, cursor: cpu >= cpuLevels.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Upgrade CPU ⚡
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={upgradeRam}
          disabled={ram >= ramLevels.length - 1}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: ram >= ramLevels.length - 1 ? '#ccc' : '#8b5cf6',
            color: '#fff', fontWeight: 700, cursor: ram >= ramLevels.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Upgrade RAM 🧠
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={upgradeSsd}
          disabled={ssd >= ssdLevels.length - 1}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: ssd >= ssdLevels.length - 1 ? '#ccc' : '#10b981',
            color: '#fff', fontWeight: 700, cursor: ssd >= ssdLevels.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Upgrade SSD 💾
        </motion.button>
      </div>

      {/* Cost & Performance Meters */}
      <div style={{
        display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16,
      }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 14, padding: '14px 24px',
          border: '1px solid var(--border)', textAlign: 'center', minWidth: 140,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly Cost</div>
          <motion.div
            key={totalCost}
            initial={{ scale: 1.3, color: '#ef4444' }}
            animate={{ scale: 1, color: 'var(--text-primary)' }}
            style={{ fontWeight: 800, fontSize: 24, fontFamily: 'var(--font-heading)' }}
          >
            ${totalCost}/mo
          </motion.div>
        </div>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 14, padding: '14px 24px',
          border: '1px solid var(--border)', textAlign: 'center', minWidth: 140,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Performance</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
            {totalPerf}x
          </div>
        </div>
      </div>

      {/* Diminishing Returns Warning */}
      {cpu >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12,
            padding: '12px 18px', fontSize: 13, color: '#92400e', textAlign: 'center',
            maxWidth: 420, margin: '0 auto 12px',
          }}
        >
          <strong>Diminishing returns!</strong> Going from {cpuLevels[cpu - 1].cores} to {currentCpu.cores} cores
          only added ~{((currentCpu.perf - cpuLevels[cpu - 1].perf) / cpuLevels[cpu - 1].perf * 100).toFixed(0)}% performance
          because of memory, I/O, and network bottlenecks.
        </motion.div>
      )}

      {atMax && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 14,
            padding: '16px 20px', fontSize: 15, color: '#991b1b', textAlign: 'center',
            fontWeight: 700, maxWidth: 420, margin: '0 auto',
          }}
        >
          Maximum hardware reached! Can&apos;t upgrade further. Time for horizontal scaling!
        </motion.div>
      )}
    </div>
  )
}

/* ---- Horizontal Scaling Simulator ---- */
function HorizontalScalingSimulator() {
  const [serverCount, setServerCount] = useState(1)
  const [animatingRequest, setAnimatingRequest] = useState(-1)
  const [requestCounter, setRequestCounter] = useState(0)
  const maxServers = 8
  const totalCapacity = serverCount * 1000
  const incomingLoad = 4000
  const perServerLoad = Math.min((incomingLoad / serverCount / 1000) * 100, 100)

  const addServer = () => {
    if (serverCount < maxServers) setServerCount(serverCount + 1)
  }
  const removeServer = () => {
    if (serverCount > 1) setServerCount(serverCount - 1)
  }

  const sendRequest = () => {
    const target = requestCounter % serverCount
    setAnimatingRequest(target)
    setRequestCounter(requestCounter + 1)
    setTimeout(() => setAnimatingRequest(-1), 800)
  }

  return (
    <div>
      {/* Load Balancer */}
      <motion.div
        style={{
          width: 160, margin: '0 auto 8px', padding: '12px 16px',
          borderRadius: 14, textAlign: 'center',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', fontWeight: 700, fontSize: 13,
          fontFamily: 'var(--font-heading)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 4 }}>🔀</div>
        Load Balancer
      </motion.div>

      {/* Animated connection lines */}
      <div style={{
        display: 'flex', justifyContent: 'center', margin: '4px 0',
        gap: 0, height: 30, position: 'relative',
      }}>
        {Array.from({ length: serverCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              width: 2, height: 30,
              background: animatingRequest === i
                ? 'var(--accent)'
                : 'var(--border)',
              margin: '0 16px',
              position: 'relative',
            }}
          >
            {animatingRequest === i && (
              <motion.div
                initial={{ top: 0 }}
                animate={{ top: 24 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute', left: -4, width: 10, height: 10,
                  borderRadius: '50%', background: 'var(--accent)',
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Server Grid */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12,
        flexWrap: 'wrap', marginBottom: 20,
      }}>
        <AnimatePresence>
          {Array.from({ length: serverCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                width: 100, padding: 14, borderRadius: 14, textAlign: 'center',
                background: animatingRequest === i
                  ? 'linear-gradient(135deg, var(--accent), #6366f1)'
                  : 'var(--bg-secondary)',
                border: `2px solid ${animatingRequest === i ? 'var(--accent)' : 'var(--border)'}`,
                color: animatingRequest === i ? '#fff' : 'var(--text-primary)',
                transition: 'background 0.3s, border-color 0.3s, color 0.3s',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>🖥️</div>
              <div style={{
                fontSize: 11, fontWeight: 700, marginBottom: 6,
                fontFamily: 'var(--font-heading)',
              }}>
                Server {String.fromCharCode(65 + i)}
              </div>
              <div style={{ marginBottom: 4 }}>
                <div style={{
                  fontSize: 10, marginBottom: 2,
                  color: animatingRequest === i ? '#ffffffcc' : 'var(--text-muted)',
                }}>
                  CPU {perServerLoad.toFixed(0)}%
                </div>
                <div style={{
                  height: 5, borderRadius: 3,
                  background: animatingRequest === i ? '#ffffff33' : 'var(--border)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    animate={{ width: `${perServerLoad}%` }}
                    style={{
                      height: '100%', borderRadius: 3,
                      background: perServerLoad > 80 ? '#ef4444'
                        : perServerLoad > 50 ? '#f59e0b' : '#10b981',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12,
        flexWrap: 'wrap', marginBottom: 16,
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={removeServer} disabled={serverCount <= 1}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: serverCount <= 1 ? '#ccc' : '#ef4444',
            color: '#fff', fontWeight: 700, cursor: serverCount <= 1 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          - Remove Server
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={addServer} disabled={serverCount >= maxServers}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: serverCount >= maxServers ? '#ccc' : '#10b981',
            color: '#fff', fontWeight: 700, cursor: serverCount >= maxServers ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          + Add Server
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={sendRequest}
          style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: 'var(--accent)', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Send Request (Round Robin)
        </motion.button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12, padding: '10px 18px',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Servers</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--accent)' }}>{serverCount}</div>
        </div>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12, padding: '10px 18px',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Capacity</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#10b981' }}>
            {totalCapacity.toLocaleString()} req/s
          </div>
        </div>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12, padding: '10px 18px',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Per-Server Load</div>
          <div style={{
            fontWeight: 800, fontSize: 20,
            color: perServerLoad > 80 ? '#ef4444' : perServerLoad > 50 ? '#f59e0b' : '#10b981',
          }}>
            {perServerLoad.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Comparison Card ---- */
function ComparisonCard() {
  const items = [
    {
      label: 'Simplicity',
      vertical: { text: 'Simple (no code changes)', good: true },
      horizontal: { text: 'Complex (stateless design needed)', good: false },
    },
    {
      label: 'Scale Ceiling',
      vertical: { text: 'Limited by hardware max', good: false },
      horizontal: { text: 'Virtually infinite', good: true },
    },
    {
      label: 'Failure Risk',
      vertical: { text: 'Single point of failure', good: false },
      horizontal: { text: 'Resilient (servers are redundant)', good: true },
    },
    {
      label: 'Cost at Scale',
      vertical: { text: 'Very expensive at the top', good: false },
      horizontal: { text: 'Cost-efficient (commodity servers)', good: true },
    },
  ]

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)',
      marginTop: 24,
    }}>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{
          padding: '12px 16px', fontWeight: 700, fontSize: 13,
          color: 'var(--text-muted)', fontFamily: 'var(--font-heading)',
        }}>
          Factor
        </div>
        <div style={{
          padding: '12px 16px', fontWeight: 700, fontSize: 13,
          color: 'var(--accent)', fontFamily: 'var(--font-heading)',
          textAlign: 'center',
        }}>
          Vertical
        </div>
        <div style={{
          padding: '12px 16px', fontWeight: 700, fontSize: 13,
          color: '#10b981', fontFamily: 'var(--font-heading)',
          textAlign: 'center',
        }}>
          Horizontal
        </div>
      </div>
      {/* Rows */}
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{
            padding: '12px 16px', fontWeight: 600, fontSize: 13,
            color: 'var(--text-primary)',
          }}>
            {item.label}
          </div>
          <div style={{
            padding: '12px 16px', fontSize: 13, textAlign: 'center',
            color: item.vertical.good ? '#10b981' : '#ef4444',
          }}>
            {item.vertical.good ? '✅' : '❌'} {item.vertical.text}
          </div>
          <div style={{
            padding: '12px 16px', fontSize: 13, textAlign: 'center',
            color: item.horizontal.good ? '#10b981' : '#ef4444',
          }}>
            {item.horizontal.good ? '✅' : '❌'} {item.horizontal.text}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ---- Dedicated vs Autoscale Timeline ---- */
function DedicatedVsAutoscale() {
  const [mode, setMode] = useState('dedicated')

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const trafficCurve = [
    5, 3, 2, 2, 3, 5, 15, 35, 55, 65, 70, 75,
    80, 90, 85, 70, 60, 55, 65, 50, 35, 25, 15, 8,
  ]
  // spike at hour 13 (1 PM sale)
  trafficCurve[13] = 100

  const dedicatedServers = 5
  const dedicatedCapacity = 60
  const dedicatedCostPerHour = 4.2

  const getAutoscaleServers = (traffic) => {
    if (traffic <= 10) return 1
    if (traffic <= 25) return 2
    if (traffic <= 50) return 3
    if (traffic <= 70) return 5
    if (traffic <= 85) return 6
    return 8
  }

  const dedicatedDailyCost = (dedicatedCostPerHour * 24).toFixed(0)
  const autoscaleDailyCost = hours.reduce((sum, h) => {
    return sum + getAutoscaleServers(trafficCurve[h]) * 0.85
  }, 0).toFixed(0)

  return (
    <div>
      {/* Mode Toggle */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24,
      }}>
        {['dedicated', 'autoscale'].map(m => (
          <motion.button
            key={m}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setMode(m)}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none',
              background: mode === m
                ? (m === 'dedicated' ? '#ef4444' : '#10b981')
                : 'var(--bg-secondary)',
              color: mode === m ? '#fff' : 'var(--text-primary)',
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
              fontFamily: 'var(--font-sans)',
              border: `1px solid ${mode === m ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {m === 'dedicated' ? '🏢 Dedicated' : '📈 Autoscale'}
          </motion.button>
        ))}
      </div>

      {/* Timeline Chart */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 2, height: 180,
        padding: '0 8px', marginBottom: 8,
      }}>
        {hours.map(h => {
          const traffic = trafficCurve[h]
          const barHeight = (traffic / 100) * 150
          const capacity = mode === 'dedicated'
            ? dedicatedCapacity
            : getAutoscaleServers(traffic) * 12.5
          const capacityHeight = (capacity / 100) * 150
          const overloaded = mode === 'dedicated' && traffic > dedicatedCapacity
          const wasted = mode === 'dedicated' && traffic < dedicatedCapacity * 0.4

          return (
            <div key={h} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', position: 'relative',
            }}>
              {/* Capacity line */}
              <motion.div
                animate={{ height: capacityHeight }}
                style={{
                  position: 'absolute', bottom: 0, width: '100%',
                  borderRadius: '4px 4px 0 0',
                  background: mode === 'dedicated'
                    ? 'rgba(239,68,68,0.12)'
                    : 'rgba(16,185,129,0.12)',
                  border: `1px dashed ${mode === 'dedicated' ? '#ef444444' : '#10b98144'}`,
                  borderBottom: 'none',
                }}
              />
              {/* Traffic bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{ delay: h * 0.03, duration: 0.4 }}
                style={{
                  width: '70%', borderRadius: '3px 3px 0 0',
                  background: overloaded
                    ? 'linear-gradient(to top, #ef4444, #f87171)'
                    : wasted
                      ? 'linear-gradient(to top, #f59e0b, #fbbf24)'
                      : 'linear-gradient(to top, var(--accent), #6366f1)',
                  position: 'relative', zIndex: 1,
                }}
              />
              {/* Hour label */}
              {h % 4 === 0 && (
                <div style={{
                  fontSize: 9, color: 'var(--text-muted)', marginTop: 4,
                  position: 'absolute', bottom: -16,
                }}>
                  {h}:00
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 20,
        marginTop: 24, marginBottom: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Traffic</span>
        </div>
        {mode === 'dedicated' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b' }} />
              <span style={{ color: 'var(--text-muted)' }}>Wasted capacity</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ef4444' }} />
              <span style={{ color: 'var(--text-muted)' }}>Overloaded!</span>
            </div>
          </>
        )}
        {mode === 'autoscale' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              background: 'rgba(16,185,129,0.2)', border: '1px dashed #10b981',
            }} />
            <span style={{ color: 'var(--text-muted)' }}>Auto-scaled capacity</span>
          </div>
        )}
      </div>

      {/* Cost Comparison */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{
          background: mode === 'dedicated' ? '#fef2f2' : 'var(--bg-card)',
          borderRadius: 14, padding: '14px 24px',
          border: `2px solid ${mode === 'dedicated' ? '#fca5a5' : 'var(--border)'}`,
          textAlign: 'center', minWidth: 150,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
            Dedicated Cost
          </div>
          <div style={{
            fontWeight: 800, fontSize: 22, color: '#ef4444',
            fontFamily: 'var(--font-heading)',
          }}>
            ${dedicatedDailyCost}/day
          </div>
          <div style={{ fontSize: 11, color: '#ef4444' }}>
            {dedicatedServers} servers 24/7
          </div>
        </div>
        <div style={{
          background: mode === 'autoscale' ? '#ecfdf5' : 'var(--bg-card)',
          borderRadius: 14, padding: '14px 24px',
          border: `2px solid ${mode === 'autoscale' ? '#6ee7b7' : 'var(--border)'}`,
          textAlign: 'center', minWidth: 150,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
            Autoscale Cost
          </div>
          <div style={{
            fontWeight: 800, fontSize: 22, color: '#10b981',
            fontFamily: 'var(--font-heading)',
          }}>
            ${autoscaleDailyCost}/day
          </div>
          <div style={{ fontSize: 11, color: '#10b981' }}>
            1-8 servers as needed
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Load Balancer Strategy Picker ---- */
function LoadBalancerDemo() {
  const [algorithm, setAlgorithm] = useState('round-robin')
  const [requests, setRequests] = useState([])
  const [serverLoads, setServerLoads] = useState([0, 0, 0, 0])
  const [requestId, setRequestId] = useState(0)

  const servers = ['Server A', 'Server B', 'Server C', 'Server D']
  const weights = [50, 30, 10, 10]

  const algorithms = [
    { id: 'round-robin', label: 'Round Robin', icon: '🔄', desc: 'Requests go 1, 2, 3, 4, 1, 2, 3, 4...' },
    { id: 'least-conn', label: 'Least Connections', icon: '📊', desc: 'Goes to server with fewest active connections' },
    { id: 'weighted', label: 'Weighted', icon: '⚖️', desc: 'A=50%, B=30%, C=10%, D=10%' },
    { id: 'ip-hash', label: 'IP Hash', icon: '#️⃣', desc: 'Same user always goes to same server' },
  ]

  const getTarget = () => {
    const id = requestId
    switch (algorithm) {
      case 'round-robin':
        return id % 4
      case 'least-conn':
        return serverLoads.indexOf(Math.min(...serverLoads))
      case 'weighted': {
        const rand = Math.random() * 100
        if (rand < 50) return 0
        if (rand < 80) return 1
        if (rand < 90) return 2
        return 3
      }
      case 'ip-hash': {
        // simulate sticky sessions with 3 "users"
        const user = id % 3
        return user === 0 ? 0 : user === 1 ? 2 : 3
      }
      default:
        return 0
    }
  }

  const sendRequest = () => {
    const target = getTarget()
    const newId = requestId + 1
    setRequestId(newId)

    const newRequest = { id: newId, target, time: Date.now() }
    setRequests(prev => [...prev.slice(-11), newRequest])
    setServerLoads(prev => {
      const updated = [...prev]
      updated[target] += 1
      return updated
    })
  }

  const resetDemo = () => {
    setRequests([])
    setServerLoads([0, 0, 0, 0])
    setRequestId(0)
  }

  const totalRequests = serverLoads.reduce((a, b) => a + b, 0)
  const lastTarget = requests.length > 0 ? requests[requests.length - 1].target : -1

  return (
    <div>
      {/* Algorithm Selector */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 8, marginBottom: 20,
      }}>
        {algorithms.map(alg => (
          <motion.button
            key={alg.id}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setAlgorithm(alg.id); resetDemo() }}
            style={{
              padding: '12px 14px', borderRadius: 12, border: 'none',
              background: algorithm === alg.id
                ? 'linear-gradient(135deg, var(--accent), #6366f1)'
                : 'var(--bg-secondary)',
              color: algorithm === alg.id ? '#fff' : 'var(--text-primary)',
              fontWeight: 600, cursor: 'pointer', textAlign: 'left',
              fontSize: 12, fontFamily: 'var(--font-sans)',
              border: `1px solid ${algorithm === alg.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{alg.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{alg.label}</div>
            <div style={{
              fontSize: 10, opacity: 0.8, lineHeight: 1.3,
            }}>
              {alg.desc}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Load Balancer Visual */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <motion.div
          style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontWeight: 700, fontSize: 14,
            fontFamily: 'var(--font-heading)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          }}
        >
          🔀 Load Balancer ({algorithms.find(a => a.id === algorithm)?.label})
        </motion.div>
      </div>

      {/* Servers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10, marginBottom: 20,
      }}>
        {servers.map((name, i) => {
          const pct = totalRequests > 0 ? ((serverLoads[i] / totalRequests) * 100).toFixed(0) : 0
          const isTarget = lastTarget === i

          return (
            <motion.div
              key={i}
              animate={{
                borderColor: isTarget ? 'var(--accent)' : 'var(--border)',
                boxShadow: isTarget
                  ? '0 0 20px rgba(79,70,229,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.04)',
              }}
              style={{
                padding: 14, borderRadius: 14, textAlign: 'center',
                background: 'var(--bg-secondary)', border: '2px solid',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>🖥️</div>
              <div style={{
                fontSize: 11, fontWeight: 700, marginBottom: 6,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
              }}>
                {name}
              </div>
              {algorithm === 'weighted' && (
                <div style={{
                  fontSize: 10, color: '#8b5cf6', fontWeight: 600, marginBottom: 4,
                }}>
                  Weight: {weights[i]}%
                </div>
              )}
              <div style={{
                fontSize: 20, fontWeight: 800, color: 'var(--accent)',
                fontFamily: 'var(--font-heading)',
              }}>
                {serverLoads[i]}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                requests ({pct}%)
              </div>
              {/* Load bar */}
              <div style={{
                height: 5, borderRadius: 3, background: 'var(--border)',
                marginTop: 6, overflow: 'hidden',
              }}>
                <motion.div
                  animate={{ width: `${Math.min(Number(pct), 100)}%` }}
                  style={{
                    height: '100%', borderRadius: 3,
                    background: Number(pct) > 40 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={sendRequest}
          style={{
            padding: '10px 24px', borderRadius: 12, border: 'none',
            background: 'var(--accent)', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          Send Request
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { for (let i = 0; i < 10; i++) setTimeout(sendRequest, i * 150) }}
          style={{
            padding: '10px 24px', borderRadius: 12, border: 'none',
            background: '#8b5cf6', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          Burst 10 Requests
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={resetDemo}
          style={{
            padding: '10px 24px', borderRadius: 12, border: 'none',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
            fontFamily: 'var(--font-sans)', border: '1px solid var(--border)',
          }}
        >
          Reset
        </motion.button>
      </div>
    </div>
  )
}

/* ---- Stateless vs Stateful Visual ---- */
function StatelessVisual() {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'User adds item to cart on Server A',
      serverA: { emoji: '🖥️', label: 'Server A', session: '🛒 Cart: [Shoes]', highlight: true },
      serverB: { emoji: '🖥️', label: 'Server B', session: '(empty)', highlight: false },
      user: 'Happy',
      problem: false,
    },
    {
      title: 'Load balancer sends next request to Server B',
      serverA: { emoji: '🖥️', label: 'Server A', session: '🛒 Cart: [Shoes]', highlight: false },
      serverB: { emoji: '🖥️', label: 'Server B', session: '🛒 Cart: ???', highlight: true },
      user: 'Confused',
      problem: true,
    },
    {
      title: 'Solution: External session store (Redis)',
      serverA: { emoji: '🖥️', label: 'Server A', session: 'Stateless', highlight: false },
      serverB: { emoji: '🖥️', label: 'Server B', session: 'Stateless', highlight: false },
      user: 'Happy',
      problem: false,
      redis: true,
    },
  ]

  const current = steps[step]

  return (
    <div>
      {/* Step indicator */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20,
      }}>
        {steps.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => setStep(i)}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none',
              background: step === i ? 'var(--accent)' : 'var(--bg-secondary)',
              color: step === i ? '#fff' : 'var(--text-muted)',
              fontWeight: 600, cursor: 'pointer', fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Step {i + 1}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {/* Title */}
          <div style={{
            textAlign: 'center', fontWeight: 700, fontSize: 15,
            color: current.problem ? '#ef4444' : 'var(--text-primary)',
            marginBottom: 20, fontFamily: 'var(--font-heading)',
          }}>
            {current.problem && '❌ '}{current.title}
          </div>

          {/* User */}
          <div style={{
            textAlign: 'center', marginBottom: 12,
          }}>
            <div style={{ fontSize: 32 }}>
              {current.user === 'Happy' ? '😊' : '😤'}
            </div>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
            }}>
              User ({current.user})
            </div>
          </div>

          {/* Servers */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 24,
            alignItems: 'flex-start', flexWrap: 'wrap',
          }}>
            {[current.serverA, current.serverB].map((srv, i) => (
              <motion.div
                key={i}
                animate={{
                  borderColor: srv.highlight ? 'var(--accent)' : 'var(--border)',
                  scale: srv.highlight ? 1.05 : 1,
                }}
                style={{
                  width: 140, padding: 16, borderRadius: 14, textAlign: 'center',
                  background: 'var(--bg-secondary)', border: '2px solid',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{srv.emoji}</div>
                <div style={{
                  fontSize: 12, fontWeight: 700, marginBottom: 8,
                  fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
                }}>
                  {srv.label}
                </div>
                <div style={{
                  fontSize: 11, padding: '6px 10px', borderRadius: 8,
                  background: current.problem && srv.highlight ? '#fef2f2' : 'var(--bg-card)',
                  border: `1px solid ${current.problem && srv.highlight ? '#fca5a5' : 'var(--border)'}`,
                  color: current.problem && srv.highlight ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}>
                  {srv.session}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Redis box for step 3 */}
          {current.redis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                maxWidth: 200, margin: '16px auto 0', padding: '14px 20px',
                borderRadius: 14, textAlign: 'center',
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(220,38,38,0.3)',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>🗄️</div>
              <div style={{
                fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-heading)',
              }}>
                Redis (Session Store)
              </div>
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>
                Cart: [Shoes] — shared!
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic3_ScalingStrategies() {
  return (
    <div style={{
      maxWidth: 860,
      margin: '0 auto',
      padding: '20px 16px 60px',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* ---- Hero ---- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{ fontSize: 56, marginBottom: 12 }}
        >
          📈
        </motion.div>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800,
          color: 'var(--text-primary)', marginBottom: 8,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Scaling Strategies
        </h1>
        <p style={{
          fontSize: 17, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Vertical vs Horizontal, Dedicated vs Autoscale, and the art of Load Balancing
        </p>
      </motion.div>

      {/* ---- Section 1: The Scaling Problem ---- */}
      <SectionBlock title="The Scaling Problem" icon="🔥" color="#ef4444">
        <Neuron
          mood="thinking"
          message="You built an amazing AI app. 100 users love it. Then it hits ProductHunt. 10,000 users in a day. Your server is on fire. What do you do?"
          typed
        />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Server Overload Simulator">
            <ServerOverloadVisual />
          </InteractiveDemo>
        </div>
        <p style={{
          fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8,
          marginTop: 8,
        }}>
          When traffic grows beyond what a single server can handle, you have two fundamental choices:
          make your server <strong>bigger</strong> (vertical scaling) or add <strong>more servers</strong> (horizontal scaling).
          Let&apos;s explore both.
        </p>
      </SectionBlock>

      {/* ---- Section 2: Vertical Scaling ---- */}
      <SectionBlock title="Vertical Scaling — Make the Server Bigger" icon="⬆️" color="var(--accent)">
        <Neuron
          mood="explaining"
          message="Vertical scaling is like replacing your hatchback with a truck. Same vehicle, just bigger and more powerful. Upgrade CPU, RAM, SSD — throw hardware at the problem!"
          typed
        />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Vertical Scaling Simulator">
            <VerticalScalingSimulator />
          </InteractiveDemo>
        </div>
        <p style={{
          fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8,
          marginTop: 8,
        }}>
          Vertical scaling is the simplest approach — no code changes needed. But notice the
          <strong> diminishing returns</strong>: doubling CPU cores does not double performance because
          memory bandwidth, network I/O, and disk become bottlenecks. And eventually, you hit a hard
          ceiling — there is only so much hardware you can fit in one machine.
        </p>
      </SectionBlock>

      {/* ---- Section 3: Horizontal Scaling ---- */}
      <SectionBlock title="Horizontal Scaling — Add More Servers" icon="➡️" color="#10b981">
        <Neuron
          mood="excited"
          message="Horizontal scaling is like opening more branches of your restaurant instead of making the kitchen bigger. Each server is a clone handling its share of traffic!"
          typed
        />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Horizontal Scaling Simulator">
            <HorizontalScalingSimulator />
          </InteractiveDemo>
        </div>
        <ComparisonCard />
      </SectionBlock>

      {/* ---- Section 4: Dedicated vs Autoscale ---- */}
      <SectionBlock title="Dedicated vs Autoscale" icon="💰" color="#f59e0b">
        <Neuron
          mood="thinking"
          message="Should you run 5 servers 24/7 (dedicated) or let the cloud add/remove servers based on traffic (autoscale)? Toggle between the two modes and see the cost difference!"
          typed
        />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Cost vs Load Timeline (24 Hours)">
            <DedicatedVsAutoscale />
          </InteractiveDemo>
        </div>
        <p style={{
          fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8,
          marginTop: 8,
        }}>
          With <strong>dedicated servers</strong>, you pay a flat rate but waste money during low-traffic hours
          and risk overload during spikes. With <strong>autoscale</strong>, servers spin up and down automatically —
          you only pay for what you use, and you are never overwhelmed. Most production systems use autoscaling.
        </p>
      </SectionBlock>

      {/* ---- Section 5: Load Balancers ---- */}
      <SectionBlock title="Load Balancers — Traffic Cops" icon="🚦" color="#6366f1">
        <Neuron
          mood="happy"
          message="A load balancer sits in front of your servers and decides where each request goes. But HOW it decides matters a lot! Try each algorithm and watch how the load distributes."
          typed
        />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Load Balancer Strategy Picker">
            <LoadBalancerDemo />
          </InteractiveDemo>
        </div>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 14, padding: 20,
          border: '1px solid var(--border)', marginTop: 16,
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700,
            fontSize: 15, color: 'var(--text-primary)', marginBottom: 12,
          }}>
            When to use which?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { alg: 'Round Robin', use: 'General purpose, all servers are equal' },
              { alg: 'Least Connections', use: 'When requests have variable processing times' },
              { alg: 'Weighted', use: 'When some servers are more powerful than others' },
              { alg: 'IP Hash', use: 'When you need sticky sessions (same user, same server)' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 14,
              }}>
                <span style={{
                  background: 'var(--accent)', color: '#fff', padding: '2px 10px',
                  borderRadius: 6, fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
                }}>
                  {item.alg}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.use}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* ---- Section 6: Stateless vs Stateful ---- */}
      <SectionBlock title="Stateless vs Stateful — The Scaling Prerequisite" icon="🔑" color="#dc2626">
        <Neuron
          mood="explaining"
          message="Here's the catch with horizontal scaling: if Server A stores the user's shopping cart in memory, what happens when the load balancer sends the next request to Server B? The cart vanishes! That's why services must be STATELESS."
          typed
        />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="The Stateful Problem (and its Solution)">
            <StatelessVisual />
          </InteractiveDemo>
        </div>
        <p style={{
          fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8,
          marginTop: 8,
        }}>
          <strong>Stateless services</strong> do not store any user data in memory. Instead, all shared state
          (sessions, carts, user data) lives in an external store like <strong>Redis</strong> or a database.
          This way, any server can handle any request — the foundation of horizontal scaling.
        </p>
      </SectionBlock>

      {/* ---- Section 7: Hindi Explainer ---- */}
      <SectionBlock title="Summary" icon="📝" color="var(--accent)">
        <Neuron
          mood="happy"
          message="You now understand the core scaling strategies! Vertical (bigger server), Horizontal (more servers), Autoscale (smart scaling), and Load Balancing (traffic distribution). Let's recap in Hindi too!"
          typed
        />
        <div style={{ marginTop: 20 }}>
          <HindiExplainer
            concept="स्केलिंग रणनीतियाँ"
            english="Scaling Strategies"
            explanation="Vertical scaling = बड़ा server लो (एक दुकान में ज़्यादा staff रखो)। Horizontal scaling = ज़्यादा servers लगाओ (ज़्यादा दुकानें खोलो)। Autoscale = भीड़ के हिसाब से staff बुलाओ — Diwali sale पर ज़्यादा, सोमवार सुबह कम।"
            example="Zomato Diwali पर 10x traffic handle करता है autoscale से। 100 servers रात को, 1000 servers dinner time पर — बिना manually कुछ किए!"
            terms={[
              { hindi: 'वर्टिकल स्केलिंग', english: 'Vertical Scaling', meaning: 'एक ही server को powerful बनाना (upgrade)' },
              { hindi: 'हॉरिज़ॉन्टल स्केलिंग', english: 'Horizontal Scaling', meaning: 'ज़्यादा servers जोड़ना (copies)' },
              { hindi: 'लोड बैलेंसर', english: 'Load Balancer', meaning: 'Traffic को servers में बाँटने वाला — traffic police जैसा' },
              { hindi: 'ऑटोस्केल', english: 'Autoscale', meaning: 'Load के हिसाब से servers अपने आप बढ़ें-घटें' },
              { hindi: 'स्टेटलेस', english: 'Stateless', meaning: 'Server कोई user data याद न रखे — हर request independent' },
            ]}
          />
        </div>
      </SectionBlock>
    </div>
  )
}
