import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 6 — Docker Volumes & Networking
   Cinematic visual: Data persistence + Container communication
================================================================ */

/* ---- 1. Data Persistence Demo ---- */
function DataPersistenceDemo() {
  const [mode, setMode] = useState('none') // 'none' | 'volume'
  const [phase, setPhase] = useState('running') // 'running' | 'destroyed' | 'rebuilt'

  useEffect(() => {
    setPhase('running')
  }, [mode])

  const runScenario = () => {
    setPhase('destroyed')
    setTimeout(() => setPhase('rebuilt'), 1800)
  }

  const dataItems = [
    { icon: '📄', label: 'users.db' },
    { icon: '🖼️', label: 'uploads/' },
    { icon: '⚙️', label: 'config' },
  ]

  const containerColor = phase === 'destroyed' ? '#ef4444' : '#3b82f6'

  return (
    <div>
      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
        {[
          { key: 'none', label: 'No Volume', icon: '💀', color: '#ef4444' },
          { key: 'volume', label: 'With Volume', icon: '✅', color: '#10b981' },
        ].map(m => (
          <motion.button
            key={m.key}
            onClick={() => setMode(m.key)}
            animate={{
              background: mode === m.key ? m.color : 'var(--bg-secondary)',
              color: mode === m.key ? 'white' : 'var(--text-secondary)',
              scale: mode === m.key ? 1.05 : 1,
            }}
            whileHover={{ scale: 1.08 }}
            style={{
              padding: '14px 28px', borderRadius: 12, border: 'none',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {m.icon} {m.label}
          </motion.button>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 40, minHeight: 280, position: 'relative',
      }}>
        {/* Container Box */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <AnimatePresence mode="wait">
            {phase !== 'destroyed' ? (
              <motion.div
                key={`container-${phase}`}
                initial={phase === 'rebuilt' ? { scale: 0, rotate: -10 } : { scale: 1 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{
                  scale: 0, rotate: 15, opacity: 0,
                  filter: 'blur(8px)',
                }}
                transition={{ type: 'spring', duration: 0.6 }}
                style={{
                  width: 200, minHeight: 180, borderRadius: 16,
                  background: `linear-gradient(135deg, ${containerColor}15, ${containerColor}08)`,
                  border: `2px solid ${containerColor}40`,
                  padding: 20, position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 800,
                  fontSize: 14, color: containerColor, marginBottom: 8,
                }}>
                  🐳 Container
                </div>

                {/* Data inside container (only when no volume) */}
                {mode === 'none' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                    {dataItems.map((d, i) => (
                      <motion.div
                        key={d.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        style={{
                          padding: '8px 12px', borderRadius: 8,
                          background: phase === 'rebuilt' ? '#ef444420' : '#3b82f615',
                          border: `1px solid ${phase === 'rebuilt' ? '#ef444430' : '#3b82f630'}`,
                          fontSize: 13, fontWeight: 600,
                          color: phase === 'rebuilt' ? '#ef4444' : 'var(--text-primary)',
                          textDecoration: phase === 'rebuilt' ? 'line-through' : 'none',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <span>{d.icon}</span> {d.label}
                        {phase === 'rebuilt' && (
                          <span style={{ marginLeft: 'auto', fontSize: 11 }}>GONE</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* App only (when volume is used) */}
                {mode === 'volume' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      padding: '12px 16px', borderRadius: 8,
                      background: '#10b98115', border: '1px solid #10b98130',
                      fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                      width: '100%', textAlign: 'center',
                    }}
                  >
                    🚀 App Code
                  </motion.div>
                )}

                {phase === 'rebuilt' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      position: 'absolute', top: -12, right: -12,
                      background: phase === 'rebuilt' && mode === 'volume' ? '#10b981' : '#ef4444',
                      color: 'white', borderRadius: '50%', width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 14,
                      boxShadow: `0 4px 15px ${mode === 'volume' ? '#10b981' : '#ef4444'}50`,
                    }}
                  >
                    {mode === 'volume' ? '✓' : '!'}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="explosion"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.5, 0], rotate: [0, 20, -10] }}
                transition={{ duration: 0.8 }}
                style={{
                  width: 200, height: 180, borderRadius: 16,
                  background: 'linear-gradient(135deg, #ef444430, #f9731620)',
                  border: '2px solid #ef444460',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 48,
                }}
              >
                💥
              </motion.div>
            )}
          </AnimatePresence>

          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {phase === 'running' ? 'Running' : phase === 'destroyed' ? 'Destroyed!' : 'Rebuilt'}
          </span>
        </div>

        {/* Arrow to volume (only in volume mode) */}
        {mode === 'volume' && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
          >
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ fontSize: 28, color: '#10b981' }}
            >
              ⟷
            </motion.div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>mount</span>
          </motion.div>
        )}

        {/* Volume Storage (only in volume mode) */}
        {mode === 'volume' && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px #10b98120',
                  '0 0 40px #10b98140',
                  '0 0 20px #10b98120',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                width: 180, minHeight: 160, borderRadius: 16,
                background: 'linear-gradient(135deg, #10b98112, #10b98108)',
                border: '2px solid #10b98140',
                padding: 20,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <div style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: 14, color: '#10b981', marginBottom: 8,
              }}>
                🗄️ Volume
              </div>
              {dataItems.map((d, i) => (
                <motion.div
                  key={d.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  style={{
                    padding: '8px 12px', borderRadius: 8, width: '100%',
                    background: '#10b98115', border: '1px solid #10b98125',
                    fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span>{d.icon}</span> {d.label}
                  {phase === 'rebuilt' && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981', fontWeight: 800 }}
                    >
                      SAFE
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </motion.div>
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
              Persists on host
            </span>
          </motion.div>
        )}
      </div>

      {/* Destroy Button */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <motion.button
          onClick={runScenario}
          disabled={phase !== 'running'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '14px 32px', borderRadius: 12,
            background: phase === 'running'
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'var(--bg-secondary)',
            color: phase === 'running' ? 'white' : 'var(--text-muted)',
            border: 'none', fontWeight: 700, fontSize: 15,
            cursor: phase === 'running' ? 'pointer' : 'default',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {phase === 'running' ? '💣 Destroy & Rebuild Container' : phase === 'destroyed' ? 'Destroying...' : mode === 'volume' ? '🎉 Data survived!' : '😱 Data is GONE!'}
        </motion.button>
        {phase === 'rebuilt' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setPhase('running')}
            style={{
              display: 'block', margin: '12px auto 0', padding: '8px 20px',
              borderRadius: 8, background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            }}
          >
            Reset Demo
          </motion.button>
        )}
      </div>
    </div>
  )
}


/* ---- 2. Volume Types Visual ---- */
function VolumeTypesVisual() {
  const [selected, setSelected] = useState(0)

  const types = [
    {
      name: 'Named Volume',
      icon: '📦',
      color: '#3b82f6',
      command: 'docker run -v mydata:/app/data myapp',
      useCases: ['Database storage', 'Shared data between containers', 'Managed by Docker (easy!)'],
      desc: 'Docker creates & manages the storage. You just give it a name.',
    },
    {
      name: 'Bind Mount',
      icon: '📁',
      color: '#f59e0b',
      command: 'docker run -v /host/path:/container/path myapp',
      useCases: ['Development (live code reload)', 'Config files from host', 'Full control over location'],
      desc: 'Maps a specific host directory into the container.',
    },
    {
      name: 'tmpfs Mount',
      icon: '💨',
      color: '#8b5cf6',
      command: 'docker run --tmpfs /app/temp myapp',
      useCases: ['Sensitive data (never hits disk)', 'Temporary caches', 'Performance-critical temp files'],
      desc: 'Stored in memory only. Disappears when container stops.',
    },
  ]

  const current = types[selected]

  return (
    <div>
      {/* Type Selector */}
      <div style={{
        display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32,
        flexWrap: 'wrap',
      }}>
        {types.map((t, i) => (
          <motion.button
            key={t.name}
            onClick={() => setSelected(i)}
            animate={{
              background: selected === i ? t.color : 'var(--bg-secondary)',
              color: selected === i ? 'white' : 'var(--text-secondary)',
              scale: selected === i ? 1.05 : 1,
              boxShadow: selected === i ? `0 8px 25px ${t.color}35` : 'none',
            }}
            whileHover={{ scale: 1.08 }}
            style={{
              padding: '14px 24px', borderRadius: 12, border: 'none',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t.icon} {t.name}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
        >
          {/* Visual Diagram */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 24, marginBottom: 28, minHeight: 200, flexWrap: 'wrap',
          }}>
            {/* Host side */}
            <motion.div
              style={{
                width: 180, padding: 20, borderRadius: 16,
                background: selected === 0
                  ? `linear-gradient(135deg, ${current.color}08, ${current.color}04)`
                  : selected === 1
                    ? `linear-gradient(135deg, #f59e0b12, #f59e0b06)`
                    : 'transparent',
                border: selected === 2 ? '2px dashed var(--border)' : `2px solid ${current.color}30`,
                textAlign: 'center',
                opacity: selected === 2 ? 0.4 : 1,
              }}
            >
              <div style={{
                fontWeight: 800, fontSize: 13, color: current.color,
                marginBottom: 12, fontFamily: 'var(--font-heading)',
              }}>
                {selected === 0 ? '🐳 Docker Area' : selected === 1 ? '💻 Host Filesystem' : '💻 Host Disk'}
              </div>

              {selected === 0 && (
                <motion.div
                  animate={{ boxShadow: [`0 0 15px ${current.color}20`, `0 0 30px ${current.color}40`, `0 0 15px ${current.color}20`] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    padding: '14px 12px', borderRadius: 10,
                    background: `${current.color}12`, border: `2px solid ${current.color}30`,
                    fontWeight: 700, fontSize: 13, color: current.color,
                  }}
                >
                  📦 mydata
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    /var/lib/docker/volumes/
                  </div>
                </motion.div>
              )}

              {selected === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['/home/user/app', '/src', '/config'].map((p, i) => (
                    <motion.div
                      key={p}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        padding: '8px 10px', borderRadius: 8,
                        background: '#f59e0b10', border: '1px solid #f59e0b25',
                        fontSize: 12, fontWeight: 600, color: '#f59e0b',
                        fontFamily: 'monospace',
                      }}
                    >
                      {p}
                    </motion.div>
                  ))}
                </div>
              )}

              {selected === 2 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Nothing stored here
                </div>
              )}
            </motion.div>

            {/* Arrow */}
            <motion.div
              animate={selected === 2
                ? { opacity: [0.3, 0.6, 0.3] }
                : { x: [0, 6, 0] }
              }
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                fontSize: 24, color: current.color, fontWeight: 800,
              }}
            >
              {selected === 1 ? '⟷' : selected === 0 ? '⟶' : '~ ~'}
            </motion.div>

            {/* Container side */}
            <motion.div
              style={{
                width: 180, padding: 20, borderRadius: 16,
                background: `linear-gradient(135deg, ${current.color}10, ${current.color}05)`,
                border: `2px solid ${current.color}30`,
                textAlign: 'center',
              }}
            >
              <div style={{
                fontWeight: 800, fontSize: 13, color: current.color,
                marginBottom: 12, fontFamily: 'var(--font-heading)',
              }}>
                🐳 Container
              </div>

              <div style={{
                padding: '14px 12px', borderRadius: 10,
                background: `${current.color}10`, border: `1px solid ${current.color}20`,
                fontWeight: 600, fontSize: 13, color: 'var(--text-primary)',
              }}>
                /app/data
              </div>

              {selected === 2 && (
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  style={{
                    marginTop: 10, padding: '8px 10px', borderRadius: 8,
                    background: '#8b5cf610', border: '1px dashed #8b5cf630',
                    fontSize: 11, color: '#8b5cf6', fontWeight: 600,
                  }}
                >
                  RAM only - ephemeral
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Command */}
          <div style={{
            padding: '14px 20px', borderRadius: 10, marginBottom: 20,
            background: '#0f172a', fontFamily: 'monospace', fontSize: 13,
            color: '#10b981', overflow: 'auto',
          }}>
            <span style={{ color: '#64748b' }}>$ </span>{current.command}
          </div>

          {/* Description + Use Cases */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            <div style={{
              padding: 20, borderRadius: 14,
              background: `${current.color}08`, border: `1px solid ${current.color}20`,
            }}>
              <div style={{
                fontWeight: 700, fontSize: 14, color: current.color,
                marginBottom: 8, fontFamily: 'var(--font-heading)',
              }}>
                What is it?
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {current.desc}
              </div>
            </div>
            <div style={{
              padding: 20, borderRadius: 14,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            }}>
              <div style={{
                fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
                marginBottom: 8, fontFamily: 'var(--font-heading)',
              }}>
                Best for:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {current.useCases.map((u, i) => (
                  <motion.div
                    key={u}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    style={{
                      fontSize: 13, color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: current.color, flexShrink: 0,
                    }} />
                    {u}
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


/* ---- 3. Networking Visual ---- */
function NetworkingVisual() {
  const [tab, setTab] = useState('bridge')
  const [sending, setSending] = useState(false)
  const [packets, setPackets] = useState([])

  const sendRequest = () => {
    if (sending) return
    setSending(true)
    setPackets([])
    const newPackets = []
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        newPackets.push(i)
        setPackets([...newPackets])
      }, i * 350)
    }
    setTimeout(() => setSending(false), 2000)
  }

  const tabs = [
    { key: 'bridge', label: 'Bridge Network', icon: '🌉' },
    { key: 'ports', label: 'Port Mapping', icon: '🚇' },
    { key: 'dns', label: 'DNS Resolution', icon: '🔍' },
  ]

  return (
    <div>
      {/* Tab selector */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28,
        flexWrap: 'wrap',
      }}>
        {tabs.map(t => (
          <motion.button
            key={t.key}
            onClick={() => { setTab(t.key); setSending(false); setPackets([]) }}
            animate={{
              background: tab === t.key ? 'var(--accent)' : 'var(--bg-secondary)',
              color: tab === t.key ? 'white' : 'var(--text-secondary)',
            }}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t.icon} {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Bridge Network */}
        {tab === 'bridge' && (
          <motion.div
            key="bridge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            {/* Network Box */}
            <div style={{
              position: 'relative', padding: 32, borderRadius: 20,
              background: 'linear-gradient(135deg, #3b82f608, #3b82f603)',
              border: '2px solid #3b82f625', minHeight: 220,
            }}>
              <div style={{
                position: 'absolute', top: 12, left: 20,
                fontSize: 12, fontWeight: 800, color: '#3b82f6',
                fontFamily: 'var(--font-heading)',
                background: '#3b82f610', padding: '4px 12px', borderRadius: 6,
              }}>
                🌉 bridge network (172.17.0.0/16)
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 32, marginTop: 24, flexWrap: 'wrap', position: 'relative',
              }}>
                {/* Container A */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  style={{
                    width: 140, padding: 18, borderRadius: 14,
                    background: 'linear-gradient(135deg, #3b82f615, #3b82f608)',
                    border: '2px solid #3b82f635', textAlign: 'center',
                    position: 'relative', zIndex: 2,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🌐</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>
                    web-app
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                    172.17.0.2
                  </div>
                </motion.div>

                {/* Animated packets between */}
                <div style={{
                  position: 'relative', width: 100, height: 4,
                  background: '#3b82f620', borderRadius: 2,
                }}>
                  {packets.map((p, i) => (
                    <motion.div
                      key={`${p}-${i}`}
                      initial={{ left: 0, opacity: 1 }}
                      animate={{ left: '100%', opacity: [1, 1, 0.5] }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute', top: -6, width: 14, height: 14,
                        borderRadius: '50%', background: '#10b981',
                        boxShadow: '0 0 10px #10b98160',
                      }}
                    />
                  ))}
                </div>

                {/* Container B */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                  style={{
                    width: 140, padding: 18, borderRadius: 14,
                    background: 'linear-gradient(135deg, #8b5cf615, #8b5cf608)',
                    border: '2px solid #8b5cf635', textAlign: 'center',
                    position: 'relative', zIndex: 2,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🗄️</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#8b5cf6', fontFamily: 'var(--font-heading)' }}>
                    database
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                    172.17.0.3
                  </div>
                </motion.div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <motion.button
                onClick={sendRequest}
                disabled={sending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 28px', borderRadius: 10,
                  background: sending ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: sending ? 'var(--text-muted)' : 'white',
                  border: 'none', fontWeight: 700, fontSize: 14,
                  cursor: sending ? 'default' : 'pointer',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {sending ? '📡 Sending...' : '📡 Send Request'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Port Mapping */}
        {tab === 'ports' && (
          <motion.div
            key="ports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 0, minHeight: 200, flexWrap: 'wrap',
            }}>
              {/* Outside World */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{
                  width: 130, padding: 18, borderRadius: 14,
                  background: 'linear-gradient(135deg, #f59e0b12, #f59e0b06)',
                  border: '2px solid #f59e0b30', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>🌍</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#f59e0b', fontFamily: 'var(--font-heading)' }}>
                  Browser
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                  localhost:8080
                </div>
              </motion.div>

              {/* Tunnel Visual */}
              <div style={{ position: 'relative', width: 140, height: 60, margin: '0 4px' }}>
                <svg width="140" height="60" viewBox="0 0 140 60" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="tunnelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 15 Q 70 -10 140 15" stroke="url(#tunnelGrad)" strokeWidth="3" fill="none" />
                  <path d="M 0 45 Q 70 70 140 45" stroke="url(#tunnelGrad)" strokeWidth="3" fill="none" />
                  <motion.circle
                    animate={{ cx: [10, 130] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    cy="30" r="5" fill="#10b981"
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
                  background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 4,
                  whiteSpace: 'nowrap',
                }}>
                  -p 8080:80
                </div>
              </div>

              {/* Host boundary */}
              <div style={{
                padding: 20, borderRadius: 16,
                border: '2px dashed #3b82f630',
                background: '#3b82f605',
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, color: '#3b82f6',
                  marginBottom: 10, fontFamily: 'var(--font-heading)',
                  textAlign: 'center',
                }}>
                  DOCKER HOST
                </div>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
                  style={{
                    width: 120, padding: 16, borderRadius: 12,
                    background: 'linear-gradient(135deg, #3b82f612, #3b82f606)',
                    border: '2px solid #3b82f635', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🐳</div>
                  <div style={{ fontWeight: 800, fontSize: 12, color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>
                    nginx
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                    :80
                  </div>
                </motion.div>
              </div>
            </div>

            <div style={{
              marginTop: 20, padding: '12px 20px', borderRadius: 10,
              background: '#0f172a', fontFamily: 'monospace', fontSize: 13,
              color: '#10b981', textAlign: 'center',
            }}>
              <span style={{ color: '#64748b' }}>$ </span>docker run -p 8080:80 nginx
            </div>
          </motion.div>
        )}

        {/* DNS Resolution */}
        {tab === 'dns' && (
          <motion.div
            key="dns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <DNSAnimation />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* Sub-component for DNS animation */
function DNSAnimation() {
  const [step, setStep] = useState(0)

  const steps = [
    { label: 'App wants to reach "db"', highlight: 'app' },
    { label: 'Docker DNS resolves "db" → 172.17.0.3', highlight: 'dns' },
    { label: 'Connection established!', highlight: 'db' },
  ]

  useEffect(() => {
    if (step === 0) return
    if (step < steps.length) {
      const timer = setTimeout(() => setStep(s => s + 1), 1200)
      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <div>
      <div style={{
        position: 'relative', padding: '40px 20px 24px',
        borderRadius: 20, background: 'linear-gradient(135deg, #10b98108, #10b98103)',
        border: '2px solid #10b98120', minHeight: 200,
      }}>
        <div style={{
          position: 'absolute', top: 12, left: 20,
          fontSize: 12, fontWeight: 800, color: '#10b981',
          fontFamily: 'var(--font-heading)',
          background: '#10b98110', padding: '4px 12px', borderRadius: 6,
        }}>
          🔍 Docker DNS (built-in)
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 20, marginTop: 16, flexWrap: 'wrap',
        }}>
          {/* App container */}
          <motion.div
            animate={{
              borderColor: step >= 1 && steps[step - 1]?.highlight === 'app' ? '#3b82f6' : '#3b82f630',
              boxShadow: step >= 1 && steps[step - 1]?.highlight === 'app' ? '0 0 25px #3b82f630' : 'none',
            }}
            style={{
              width: 120, padding: 16, borderRadius: 14,
              background: '#3b82f610', border: '2px solid #3b82f630',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>🌐</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>
              app
            </div>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  marginTop: 8, padding: '4px 8px', borderRadius: 6,
                  background: '#3b82f620', fontSize: 10, fontFamily: 'monospace',
                  color: '#3b82f6', fontWeight: 600,
                }}
              >
                ping db
              </motion.div>
            )}
          </motion.div>

          {/* DNS lookup animation */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 10, fontWeight: 700, color: '#10b981',
                  background: '#10b98115', padding: '4px 10px', borderRadius: 6,
                  fontFamily: 'monospace', whiteSpace: 'nowrap',
                }}
              >
                "db" → 172.17.0.3
              </motion.div>
            )}
            <motion.div
              animate={step >= 1 ? { x: [0, 6, 0], opacity: 1 } : { opacity: 0.3 }}
              transition={{ repeat: step >= 1 ? Infinity : 0, duration: 1 }}
              style={{ fontSize: 22, color: '#10b981' }}
            >
              ⟶
            </motion.div>
          </div>

          {/* DB container */}
          <motion.div
            animate={{
              borderColor: step >= 3 ? '#8b5cf6' : '#8b5cf630',
              boxShadow: step >= 3 ? '0 0 25px #8b5cf630' : 'none',
            }}
            style={{
              width: 120, padding: 16, borderRadius: 14,
              background: '#8b5cf610', border: '2px solid #8b5cf630',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>🗄️</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#8b5cf6', fontFamily: 'var(--font-heading)' }}>
              db
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
              172.17.0.3
            </div>
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  marginTop: 6, fontSize: 11, color: '#10b981', fontWeight: 700,
                }}
              >
                Connected!
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Step progress */}
        {step > 0 && step <= steps.length && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 20, textAlign: 'center',
              fontSize: 14, fontWeight: 700,
              color: step === steps.length ? '#10b981' : 'var(--text-primary)',
            }}
          >
            Step {Math.min(step, steps.length)}: {steps[Math.min(step, steps.length) - 1].label}
          </motion.div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <motion.button
          onClick={() => setStep(1)}
          disabled={step > 0 && step < steps.length}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 28px', borderRadius: 10,
            background: step === 0 || step >= steps.length
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'var(--bg-secondary)',
            color: step === 0 || step >= steps.length ? 'white' : 'var(--text-muted)',
            border: 'none', fontWeight: 700, fontSize: 14,
            cursor: step === 0 || step >= steps.length ? 'pointer' : 'default',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {step === 0 ? '🔍 Resolve "db"' : step >= steps.length ? '🔄 Try Again' : 'Resolving...'}
        </motion.button>
      </div>
    </div>
  )
}


/* ---- 4. Compose Network Demo ---- */
function ComposeNetworkDemo() {
  const [flowing, setFlowing] = useState(false)
  const [activeEdge, setActiveEdge] = useState(-1)

  const services = [
    { name: 'frontend', icon: '🖥️', color: '#3b82f6', x: 0, desc: 'React App' },
    { name: 'backend', icon: '⚙️', color: '#f59e0b', x: 1, desc: 'Node API' },
    { name: 'database', icon: '🗄️', color: '#8b5cf6', x: 2, desc: 'PostgreSQL' },
  ]

  const startFlow = () => {
    if (flowing) return
    setFlowing(true)
    setActiveEdge(0)
    setTimeout(() => setActiveEdge(1), 1000)
    setTimeout(() => setActiveEdge(2), 2000)
    setTimeout(() => {
      setActiveEdge(-1)
      setFlowing(false)
    }, 3200)
  }

  return (
    <div>
      {/* Compose file hint */}
      <div style={{
        padding: '12px 18px', borderRadius: 10, marginBottom: 24,
        background: '#0f172a', fontFamily: 'monospace', fontSize: 12,
        color: '#94a3b8', lineHeight: 1.8,
      }}>
        <div style={{ color: '#64748b', marginBottom: 4 }}># docker-compose.yml</div>
        <div><span style={{ color: '#f59e0b' }}>services:</span></div>
        {services.map(s => (
          <div key={s.name}>
            <span style={{ color: '#3b82f6' }}>  {s.name}:</span>
            <span style={{ color: '#64748b' }}> # {s.desc}</span>
          </div>
        ))}
        <div style={{ color: '#10b981', marginTop: 4 }}>
          # Docker Compose auto-creates a shared network!
        </div>
      </div>

      {/* Network visual */}
      <div style={{
        position: 'relative', padding: '44px 24px 28px',
        borderRadius: 20,
        background: 'linear-gradient(135deg, #10b98108, #3b82f605)',
        border: '2px solid #10b98125',
      }}>
        <div style={{
          position: 'absolute', top: 12, left: 20,
          fontSize: 12, fontWeight: 800, color: '#10b981',
          fontFamily: 'var(--font-heading)',
          background: '#10b98110', padding: '4px 12px', borderRadius: 6,
        }}>
          myapp_default network (auto-created)
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16, flexWrap: 'wrap', marginTop: 8,
        }}>
          {services.map((s, i) => (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              {/* Service box */}
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  boxShadow: activeEdge === i || activeEdge === i + 1
                    ? `0 0 25px ${s.color}40`
                    : `0 4px 15px ${s.color}15`,
                }}
                transition={{ y: { repeat: Infinity, duration: 2.5, delay: i * 0.3 } }}
                style={{
                  width: 130, padding: 18, borderRadius: 14,
                  background: `linear-gradient(135deg, ${s.color}12, ${s.color}06)`,
                  border: `2px solid ${s.color}35`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                <div style={{
                  fontWeight: 800, fontSize: 13, color: s.color,
                  fontFamily: 'var(--font-heading)',
                }}>
                  {s.name}
                </div>
                <div style={{
                  fontSize: 10, color: 'var(--text-muted)', marginTop: 4,
                }}>
                  {s.desc}
                </div>
              </motion.div>

              {/* Arrow between services */}
              {i < services.length - 1 && (
                <div style={{ position: 'relative', width: 50, height: 20 }}>
                  <motion.div
                    animate={{
                      opacity: activeEdge === i + 1 ? 1 : 0.3,
                      scale: activeEdge === i + 1 ? 1.2 : 1,
                    }}
                    style={{
                      textAlign: 'center', fontSize: 18,
                      color: activeEdge === i + 1 ? '#10b981' : 'var(--text-muted)',
                      fontWeight: 800,
                    }}
                  >
                    ⟶
                  </motion.div>
                  {activeEdge === i + 1 && (
                    <motion.div
                      initial={{ left: 0, opacity: 0 }}
                      animate={{ left: '80%', opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 0.6 }}
                      style={{
                        position: 'absolute', top: -4, width: 10, height: 10,
                        borderRadius: '50%', background: '#10b981',
                        boxShadow: '0 0 12px #10b98180',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Flow result */}
        <AnimatePresence>
          {activeEdge === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 20, textAlign: 'center',
                fontSize: 13, fontWeight: 700, color: '#10b981',
              }}
            >
              Request: frontend → backend → database  (all connected automatically!)
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <motion.button
          onClick={startFlow}
          disabled={flowing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 28px', borderRadius: 10,
            background: flowing ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #10b981, #059669)',
            color: flowing ? 'var(--text-muted)' : 'white',
            border: 'none', fontWeight: 700, fontSize: 14,
            cursor: flowing ? 'default' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {flowing ? '📡 Data flowing...' : '🚀 Send Request Through Stack'}
        </motion.button>
      </div>
    </div>
  )
}


/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic6_VolumesNetworking() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Neuron mood="excited" typed message="Time for two superpowers every Docker user needs: Volumes keep your data alive, and Networking lets containers talk to each other. Let me show you visually how they work." />

      <SectionBlock title="The Data Problem" icon="💾">
        <InteractiveDemo title="What Happens When a Container Dies?">
          <DataPersistenceDemo />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="explaining">
        Containers are ephemeral by design — they can be destroyed and recreated at any time. Volumes solve this by storing data OUTSIDE the container lifecycle. Think of it as an external hard drive that survives container crashes.
      </NeuronTip>

      <SectionBlock title="Volume Types" icon="📦">
        <InteractiveDemo title="Three Ways to Persist Data">
          <VolumeTypesVisual />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="thinking">
        Rule of thumb: Use Named Volumes for production databases, Bind Mounts for development (live reload!), and tmpfs for sensitive secrets that should never touch disk.
      </NeuronTip>

      <SectionBlock title="Container Networking" icon="🌐">
        <InteractiveDemo title="How Containers Communicate">
          <NetworkingVisual />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="explaining">
        Docker gives each container its own IP address within a virtual network. Containers on the same network can reach each other by name — no need to hardcode IPs. This is DNS magic built right into Docker.
      </NeuronTip>

      <SectionBlock title="Docker Compose Networking" icon="🔗">
        <InteractiveDemo title="Auto-Wired Multi-Container Apps">
          <ComposeNetworkDemo />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="happy" typed message="Now you understand how to keep data safe with volumes and connect containers with networking. These two concepts are the backbone of any real-world Docker deployment. Next, we'll put it all together!" />
    </div>
  )
}
