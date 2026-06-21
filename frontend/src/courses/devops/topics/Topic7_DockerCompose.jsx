import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 7 — Docker Compose
   Multi-container orchestration, YAML syntax, services, depends_on,
   environment variables, volumes
================================================================ */

/* ---- 1. Without vs With Compose ---- */
function WithoutVsWithCompose() {
  const [showCompose, setShowCompose] = useState(false)
  const [crossedOut, setCrossedOut] = useState(false)

  const dockerCommands = [
    'docker network create myapp-net',
    'docker volume create db-data',
    'docker run -d --name postgres \\\n  --network myapp-net \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=myapp \\\n  -v db-data:/var/lib/postgresql/data \\\n  -p 5432:5432 \\\n  postgres:15',
    'docker run -d --name backend \\\n  --network myapp-net \\\n  -e DATABASE_URL=postgres://... \\\n  -e JWT_SECRET=supersecret \\\n  -p 4000:4000 \\\n  myapp-backend:latest',
    'docker run -d --name frontend \\\n  --network myapp-net \\\n  -e REACT_APP_API=http://backend:4000 \\\n  -p 3000:3000 \\\n  myapp-frontend:latest',
  ]

  const composeYaml = `services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - db-data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: postgres://...
      JWT_SECRET: supersecret
    depends_on: [db]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]

volumes:
  db-data:`

  useEffect(() => {
    if (showCompose) {
      const t = setTimeout(() => setCrossedOut(true), 600)
      return () => clearTimeout(t)
    }
  }, [showCompose])

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
        alignItems: 'start',
      }}>
        {/* LEFT — Without Compose */}
        <motion.div
          animate={{ opacity: crossedOut ? 0.35 : 1, scale: crossedOut ? 0.96 : 1 }}
          style={{
            background: '#fef2f2', borderRadius: 16, padding: 24,
            border: '2px solid #fca5a5', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800,
            color: '#dc2626', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 24 }}>😱</span> Without Compose
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dockerCommands.map((cmd, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                style={{
                  background: '#1e1e1e', color: '#e5e5e5', padding: '10px 14px',
                  borderRadius: 8, fontSize: 11, fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap', lineHeight: 1.5, borderLeft: '3px solid #ef4444',
                }}
              >
                <span style={{ color: '#a78bfa' }}>$</span> {cmd}
              </motion.div>
            ))}
          </div>

          <div style={{
            marginTop: 14, fontSize: 13, color: '#dc2626', fontWeight: 600,
            textAlign: 'center', lineHeight: 1.6,
          }}>
            5 commands. Easy to mess up. Hard to reproduce.
          </div>

          {/* Red X overlay */}
          <AnimatePresence>
            {crossedOut && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(220,38,38,0.08)',
                }}
              >
                <motion.span
                  initial={{ rotate: -20 }}
                  animate={{ rotate: 0 }}
                  style={{ fontSize: 120, color: '#ef4444', fontWeight: 900, opacity: 0.6 }}
                >
                  X
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RIGHT — With Compose */}
        <motion.div
          animate={{
            boxShadow: showCompose ? '0 0 30px rgba(16,185,129,0.25)' : 'none',
            borderColor: showCompose ? '#34d399' : 'var(--border)',
          }}
          style={{
            background: showCompose ? '#ecfdf5' : 'var(--bg-card)',
            borderRadius: 16, padding: 24,
            border: '2px solid var(--border)', position: 'relative',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800,
            color: showCompose ? '#059669' : 'var(--text-muted)',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 24 }}>{showCompose ? '🎉' : '🐳'}</span> With Compose
          </div>

          {!showCompose ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCompose(true)}
                style={{
                  padding: '16px 36px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', border: 'none', fontWeight: 700, fontSize: 17,
                  cursor: 'pointer', fontFamily: 'var(--font-heading)',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                }}
              >
                Show Me The Better Way
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{
                background: '#1e1e1e', borderRadius: 12, padding: 18,
                fontSize: 12, fontFamily: 'monospace', color: '#e5e5e5',
                whiteSpace: 'pre-wrap', lineHeight: 1.6,
                borderLeft: '3px solid #10b981',
              }}>
                <div style={{ color: '#6b7280', marginBottom: 8, fontSize: 11 }}>
                  # docker-compose.yml
                </div>
                {composeYaml.split('\n').map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {colorizeYaml(line)}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{
                  marginTop: 16, textAlign: 'center', padding: '12px 18px',
                  background: '#d1fae5', borderRadius: 10,
                  fontWeight: 700, color: '#065f46', fontSize: 15,
                }}
              >
                1 file. 1 command: <code style={{
                  background: '#065f46', color: '#d1fae5', padding: '3px 10px',
                  borderRadius: 6, fontSize: 14, marginLeft: 6,
                }}>docker-compose up</code>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

/** Mini YAML syntax highlighter */
function colorizeYaml(line) {
  if (line.trim().startsWith('#')) return <span style={{ color: '#6b7280' }}>{line}</span>

  const keyMatch = line.match(/^(\s*)([\w-]+)(:)(.*)/)
  if (keyMatch) {
    const [, indent, key, colon, val] = keyMatch
    return (
      <span>
        {indent}
        <span style={{ color: '#7dd3fc' }}>{key}</span>
        <span style={{ color: '#94a3b8' }}>{colon}</span>
        <span style={{ color: '#fde68a' }}>{val}</span>
      </span>
    )
  }

  if (line.trim().startsWith('-')) {
    return <span style={{ color: '#c4b5fd' }}>{line}</span>
  }

  return <span>{line}</span>
}


/* ---- 2. Compose Builder ---- */
function ComposeBuilder() {
  const [services, setServices] = useState([])

  const serviceTemplates = {
    frontend: {
      name: 'frontend', emoji: '🌐', color: '#3b82f6',
      image: 'node:18-alpine', ports: ['3000:3000'],
      env: { REACT_APP_API: 'http://backend:4000' },
      volumes: ['./frontend:/app'], depends: ['backend'],
    },
    backend: {
      name: 'backend', emoji: '⚙️', color: '#8b5cf6',
      image: 'node:18-alpine', ports: ['4000:4000'],
      env: { DATABASE_URL: 'postgres://db:5432/app', JWT_SECRET: '***' },
      volumes: ['./backend:/app'], depends: ['db'],
    },
    db: {
      name: 'db', emoji: '🗄️', color: '#f59e0b',
      image: 'postgres:15', ports: ['5432:5432'],
      env: { POSTGRES_PASSWORD: 'secret', POSTGRES_DB: 'app' },
      volumes: ['db-data:/var/lib/postgresql/data'], depends: [],
    },
    redis: {
      name: 'redis', emoji: '🔴', color: '#ef4444',
      image: 'redis:7-alpine', ports: ['6379:6379'],
      env: {}, volumes: ['redis-data:/data'], depends: [],
    },
  }

  const available = Object.keys(serviceTemplates).filter(
    k => !services.find(s => s.name === k)
  )

  const addService = (key) => {
    setServices(prev => [...prev, serviceTemplates[key]])
  }

  const buildYaml = () => {
    if (services.length === 0) return ''
    let y = 'services:\n'
    services.forEach(s => {
      y += `  ${s.name}:\n`
      y += `    image: ${s.image}\n`
      if (s.ports.length) y += `    ports:\n${s.ports.map(p => `      - "${p}"`).join('\n')}\n`
      if (Object.keys(s.env).length) {
        y += `    environment:\n`
        Object.entries(s.env).forEach(([k, v]) => { y += `      ${k}: ${v}\n` })
      }
      if (s.depends.filter(d => services.find(ss => ss.name === d)).length) {
        y += `    depends_on:\n`
        s.depends.filter(d => services.find(ss => ss.name === d)).forEach(d => { y += `      - ${d}\n` })
      }
      if (s.volumes.length) y += `    volumes:\n${s.volumes.map(v => `      - ${v}`).join('\n')}\n`
    })
    const namedVols = services.flatMap(s => s.volumes).filter(v => !v.startsWith('.'))
    if (namedVols.length) {
      y += '\nvolumes:\n'
      namedVols.forEach(v => { y += `  ${v.split(':')[0]}:\n` })
    }
    return y
  }

  return (
    <div>
      {/* Add Service Buttons */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {available.map(key => {
          const t = serviceTemplates[key]
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addService(key)}
              style={{
                padding: '12px 24px', borderRadius: 12,
                background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
                color: 'white', border: 'none', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', fontFamily: 'var(--font-heading)',
                boxShadow: `0 4px 16px ${t.color}40`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>{t.emoji}</span> Add {t.name}
            </motion.button>
          )
        })}
        {available.length === 0 && (
          <div style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            All services added!
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Service Boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          <AnimatePresence>
            {services.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 18 }}
                style={{
                  background: 'var(--bg-card)', borderRadius: 16, padding: 20,
                  border: `2px solid ${s.color}40`,
                  boxShadow: `0 4px 20px ${s.color}15`,
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {s.emoji}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.image}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {s.ports.map(p => (
                    <div key={p} style={{
                      padding: '6px 10px', borderRadius: 8,
                      background: `${s.color}12`, fontSize: 11, fontFamily: 'monospace',
                      color: s.color, fontWeight: 600,
                    }}>
                      <span style={{ opacity: 0.6 }}>PORT</span> {p}
                    </div>
                  ))}
                  {Object.entries(s.env).map(([k, v]) => (
                    <div key={k} style={{
                      padding: '6px 10px', borderRadius: 8,
                      background: 'var(--bg-secondary)', fontSize: 11, fontFamily: 'monospace',
                      color: 'var(--text-secondary)',
                    }}>
                      <span style={{ opacity: 0.6 }}>ENV</span> {k}
                    </div>
                  ))}
                  {s.volumes.map(v => (
                    <div key={v} style={{
                      padding: '6px 10px', borderRadius: 8,
                      background: '#fef3c7', fontSize: 11, fontFamily: 'monospace',
                      color: '#92400e',
                    }}>
                      <span style={{ opacity: 0.6 }}>VOL</span> {v.split(':')[0]}
                    </div>
                  ))}
                </div>

                {/* Dependency arrows */}
                {s.depends.filter(d => services.find(ss => ss.name === d)).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      marginTop: 12, display: 'flex', gap: 6, alignItems: 'center',
                      fontSize: 12, color: 'var(--text-muted)',
                    }}
                  >
                    <span>depends_on:</span>
                    {s.depends.filter(d => services.find(ss => ss.name === d)).map(d => (
                      <motion.span
                        key={d}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          padding: '3px 10px', borderRadius: 6,
                          background: serviceTemplates[d].color + '20',
                          color: serviceTemplates[d].color,
                          fontWeight: 700, fontSize: 11,
                        }}
                      >
                        {serviceTemplates[d].emoji} {d}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {services.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)',
              fontSize: 15, borderRadius: 16, border: '2px dashed var(--border)',
            }}>
              Click the buttons above to add services
            </div>
          )}
        </div>

        {/* YAML Preview */}
        <motion.div
          animate={{ opacity: services.length > 0 ? 1 : 0.4 }}
          style={{
            background: '#1e1e1e', borderRadius: 16, padding: 20,
            minHeight: 200, position: 'sticky', top: 20,
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%', background: '#ef4444',
            }} />
            <div style={{
              width: 12, height: 12, borderRadius: '50%', background: '#f59e0b',
            }} />
            <div style={{
              width: 12, height: 12, borderRadius: '50%', background: '#10b981',
            }} />
            <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 8, fontFamily: 'monospace' }}>
              docker-compose.yml
            </span>
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7,
            whiteSpace: 'pre-wrap', color: '#e5e5e5',
          }}>
            {services.length > 0 ? (
              buildYaml().split('\n').map((line, i) => (
                <motion.div
                  key={`${services.length}-${i}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  {colorizeYaml(line)}
                </motion.div>
              ))
            ) : (
              <span style={{ color: '#4b5563', fontStyle: 'italic' }}>
                # Add services to generate YAML...
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}


/* ---- 3. Orchestration Animation ---- */
function OrchestrationAnimation() {
  const [phase, setPhase] = useState(-1)
  const [running, setRunning] = useState(false)

  const phases = [
    { label: 'Creating network...', emoji: '🌐', color: '#6366f1', detail: 'myapp_default' },
    { label: 'Starting database...', emoji: '🗄️', color: '#f59e0b', detail: 'postgres:15' },
    { label: 'Starting backend...', emoji: '⚙️', color: '#8b5cf6', detail: 'Waiting for DB...' },
    { label: 'Starting frontend...', emoji: '🌐', color: '#3b82f6', detail: 'Waiting for backend...' },
    { label: 'All services running!', emoji: '🚀', color: '#10b981', detail: 'Stack is healthy' },
  ]

  const startOrchestration = () => {
    if (running) return
    setRunning(true)
    setPhase(-1)
    let p = 0
    const tick = () => {
      setPhase(p)
      p++
      if (p <= phases.length - 1) {
        setTimeout(tick, 1200)
      } else {
        setRunning(false)
      }
    }
    setTimeout(tick, 400)
  }

  const containerStates = [
    { name: 'db', emoji: '🗄️', color: '#f59e0b', activeAt: 1, port: '5432' },
    { name: 'backend', emoji: '⚙️', color: '#8b5cf6', activeAt: 2, port: '4000', dep: 'db' },
    { name: 'frontend', emoji: '🌐', color: '#3b82f6', activeAt: 3, port: '3000', dep: 'backend' },
  ]

  return (
    <div>
      {/* Command Button */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startOrchestration}
          disabled={running}
          style={{
            padding: '18px 44px', borderRadius: 16,
            background: running
              ? 'linear-gradient(135deg, #6b7280, #4b5563)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', border: 'none', fontWeight: 800, fontSize: 19,
            cursor: running ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)',
            boxShadow: running ? 'none' : '0 8px 32px rgba(16,185,129,0.35)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}
        >
          <span style={{ fontSize: 24 }}>▶</span> docker-compose up
        </motion.button>
      </div>

      {/* Network Ring */}
      <div style={{
        position: 'relative', height: 340,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Network circle */}
        <AnimatePresence>
          {phase >= 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                border: `3px dashed ${phase >= 4 ? '#10b981' : '#6366f1'}40`,
                background: `${phase >= 4 ? '#10b981' : '#6366f1'}06`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Network label */}
        <AnimatePresence>
          {phase >= 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute', bottom: 10, fontSize: 12,
                color: 'var(--text-muted)', fontFamily: 'monospace',
                background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 8,
              }}
            >
              myapp_default network
            </motion.div>
          )}
        </AnimatePresence>

        {/* Containers */}
        {containerStates.map((c, i) => {
          const angle = (-90 + i * 120) * (Math.PI / 180)
          const radius = 110
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const isActive = phase >= c.activeAt
          const isLoading = phase === c.activeAt
          const allUp = phase >= 4

          return (
            <AnimatePresence key={c.name}>
              {phase >= c.activeAt && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1, opacity: 1,
                    boxShadow: allUp
                      ? `0 0 24px ${c.color}40`
                      : isLoading ? `0 0 16px ${c.color}30` : 'none',
                  }}
                  transition={{ type: 'spring', damping: 15 }}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px - 50px)`,
                    top: `calc(50% + ${y}px - 40px)`,
                    width: 100, height: 80, borderRadius: 14,
                    background: 'var(--bg-card)',
                    border: `2px solid ${allUp ? '#10b981' : c.color}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  <motion.div
                    animate={isLoading ? { rotate: [0, 360] } : {}}
                    transition={isLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                    style={{ fontSize: 26 }}
                  >
                    {c.emoji}
                  </motion.div>
                  <div style={{
                    fontWeight: 700, fontSize: 13, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {c.name}
                  </div>
                  <div style={{
                    fontSize: 10, color: allUp ? '#10b981' : 'var(--text-muted)',
                    fontFamily: 'monospace',
                  }}>
                    :{c.port} {allUp ? '  running' : isLoading ? '  starting' : ''}
                  </div>

                  {/* Green dot */}
                  {allUp && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        position: 'absolute', top: -5, right: -5,
                        width: 12, height: 12, borderRadius: '50%',
                        background: '#10b981', border: '2px solid var(--bg-card)',
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )
        })}

        {/* Data flow lines */}
        <AnimatePresence>
          {phase >= 4 && (
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              {containerStates.filter(c => c.dep).map(c => {
                const depIdx = containerStates.findIndex(cc => cc.name === c.dep)
                const cIdx = containerStates.findIndex(cc => cc.name === c.name)
                const a1 = (-90 + cIdx * 120) * (Math.PI / 180)
                const a2 = (-90 + depIdx * 120) * (Math.PI / 180)
                const cx0 = 50 + (Math.cos(a1) * 110 / 170) * 50
                const cy0 = 50 + (Math.sin(a1) * 110 / 170) * 50
                const cx1 = 50 + (Math.cos(a2) * 110 / 170) * 50
                const cy1 = 50 + (Math.sin(a2) * 110 / 170) * 50

                return (
                  <motion.line
                    key={`${c.name}-${c.dep}`}
                    x1={`${cx0}%`} y1={`${cy0}%`}
                    x2={`${cx1}%`} y2={`${cy1}%`}
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 0.6 }}
                  />
                )
              })}
            </svg>
          )}
        </AnimatePresence>
      </div>

      {/* Phase Log */}
      <div style={{
        marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <AnimatePresence>
          {phases.slice(0, phase + 1).map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', borderRadius: 10,
                background: i === phase ? `${p.color}12` : 'var(--bg-secondary)',
                border: `1px solid ${i === phase ? p.color + '30' : 'transparent'}`,
              }}
            >
              <span style={{ fontSize: 20 }}>{p.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: p.color }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.detail}</div>
              </div>
              {i < phase && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 800, fontSize: 18 }}
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}


/* ---- 4. Compose Commands Visual ---- */
function ComposeCommandsVisual() {
  const [active, setActive] = useState(null)

  const commands = [
    {
      cmd: 'up',
      desc: 'Start all services',
      icon: '▶',
      color: '#10b981',
      animation: 'launch',
      detail: 'Creates networks, volumes, and starts all containers defined in docker-compose.yml',
    },
    {
      cmd: 'down',
      desc: 'Stop & remove everything',
      icon: '⏹',
      color: '#ef4444',
      animation: 'shutdown',
      detail: 'Stops containers, removes networks. Add -v to remove volumes too.',
    },
    {
      cmd: 'build',
      desc: 'Build/rebuild images',
      icon: '🔨',
      color: '#f59e0b',
      animation: 'build',
      detail: 'Builds images from Dockerfiles. Use --no-cache to force fresh build.',
    },
    {
      cmd: 'logs',
      desc: 'View container logs',
      icon: '📋',
      color: '#6366f1',
      animation: 'logs',
      detail: 'Shows combined output from all services. Add -f to follow live.',
    },
    {
      cmd: 'ps',
      desc: 'List running services',
      icon: '📊',
      color: '#8b5cf6',
      animation: 'list',
      detail: 'Shows running containers, ports, and status for this compose stack.',
    },
    {
      cmd: 'exec',
      desc: 'Run command in container',
      icon: '💻',
      color: '#0ea5e9',
      animation: 'exec',
      detail: 'Execute a command inside a running container. E.g., exec db psql -U postgres',
    },
  ]

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
      }}>
        {commands.map((c) => {
          const isActive = active === c.cmd
          return (
            <motion.button
              key={c.cmd}
              onClick={() => setActive(isActive ? null : c.cmd)}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                borderColor: isActive ? c.color : 'var(--border)',
                boxShadow: isActive ? `0 8px 32px ${c.color}25` : '0 2px 8px rgba(0,0,0,0.06)',
              }}
              style={{
                background: 'var(--bg-card)', borderRadius: 16, padding: 24,
                border: '2px solid var(--border)', cursor: 'pointer',
                textAlign: 'center', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 10,
              }}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.6 }}
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: 'white',
                  boxShadow: `0 4px 16px ${c.color}30`,
                }}
              >
                {c.icon}
              </motion.div>
              <div style={{
                fontFamily: 'monospace', fontWeight: 800, fontSize: 15,
                color: 'var(--text-primary)',
              }}>
                docker-compose {c.cmd}
              </div>
              <div style={{
                fontSize: 13, color: 'var(--text-muted)', fontWeight: 500,
              }}>
                {c.desc}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Expanded Detail */}
      <AnimatePresence mode="wait">
        {active && (() => {
          const c = commands.find(cc => cc.cmd === active)
          return (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              style={{
                marginTop: 20, borderRadius: 16, overflow: 'hidden',
                background: `linear-gradient(135deg, ${c.color}08, ${c.color}15)`,
                border: `2px solid ${c.color}25`,
              }}
            >
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  {/* Mini animation area */}
                  <CommandAnimation type={c.animation} color={c.color} />
                  <div>
                    <div style={{
                      fontFamily: 'monospace', fontWeight: 800, fontSize: 16,
                      color: c.color, marginBottom: 4,
                    }}>
                      $ docker-compose {c.cmd}
                    </div>
                    <div style={{
                      fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6,
                    }}>
                      {c.detail}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

/** Small animated icon for each compose command */
function CommandAnimation({ type, color }) {
  const boxStyle = {
    width: 80, height: 80, borderRadius: 14,
    background: `${color}15`, border: `2px solid ${color}30`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 3, flexShrink: 0, overflow: 'hidden',
    position: 'relative',
  }

  const miniBox = (i, startColor = color) => (
    <motion.div
      key={i}
      style={{
        width: 16, height: 12, borderRadius: 3,
        background: startColor, opacity: 0.7,
      }}
    />
  )

  if (type === 'launch') {
    return (
      <div style={boxStyle}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1, 0.9] }}
            transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
            style={{
              width: 18, height: 10, borderRadius: 3,
              background: color,
            }}
          />
        ))}
      </div>
    )
  }

  if (type === 'shutdown') {
    return (
      <div style={boxStyle}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [1, 0.2], x: [0, 10] }}
            transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
            style={{
              width: 18, height: 10, borderRadius: 3,
              background: color,
            }}
          />
        ))}
      </div>
    )
  }

  if (type === 'build') {
    return (
      <div style={boxStyle}>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 32 }}
        >
          🔨
        </motion.div>
      </div>
    )
  }

  if (type === 'logs') {
    return (
      <div style={{ ...boxStyle, alignItems: 'flex-start', padding: 8, gap: 2 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: [0, 20 + Math.random() * 30] }}
            transition={{ duration: 0.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 2 }}
            style={{
              height: 4, borderRadius: 2,
              background: color, opacity: 0.6,
            }}
          />
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div style={{ ...boxStyle, gap: 4 }}>
        {['db', 'api', 'web'].map((s, i) => (
          <motion.div
            key={s}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#10b981',
            }} />
            <span style={{ fontSize: 9, fontFamily: 'monospace', color, fontWeight: 600 }}>{s}</span>
          </motion.div>
        ))}
      </div>
    )
  }

  // exec
  return (
    <div style={{ ...boxStyle, padding: 8 }}>
      <motion.div
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        style={{
          fontFamily: 'monospace', fontSize: 11, color,
          fontWeight: 700,
        }}
      >
        $ _
      </motion.div>
    </div>
  )
}


/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic7_DockerCompose() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Neuron
        mood="excited"
        typed
        message="So far you've mastered single containers. But real apps need MULTIPLE containers working together — a database, a backend, a frontend, maybe Redis. Managing them one by one? Nightmare. Enter Docker Compose: your orchestra conductor."
      />

      <SectionBlock title="The Problem: Managing Multiple Containers" icon="😱">
        <InteractiveDemo title="Without vs With Docker Compose">
          <WithoutVsWithCompose />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="explaining">
        Docker Compose replaces a wall of fragile commands with a single declarative YAML file. You describe WHAT you want, and Compose figures out HOW to make it happen.
      </NeuronTip>

      <SectionBlock title="Build Your Compose File" icon="🏗️">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Click to add services and watch the docker-compose.yml build itself in real-time:
        </p>
        <InteractiveDemo title="Interactive Compose Builder">
          <ComposeBuilder />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="thinking">
        Notice how <strong>depends_on</strong> creates a startup order. The database starts first, then the backend (which needs the DB), then the frontend (which needs the API). Compose handles this automatically!
      </NeuronTip>

      <SectionBlock title="Orchestration in Action" icon="🚀">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Watch what happens when you run docker-compose up. Every step animated:
        </p>
        <InteractiveDemo title="docker-compose up — Live">
          <OrchestrationAnimation />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Essential Compose Commands" icon="💻">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Click each command to see what it does:
        </p>
        <InteractiveDemo title="Command Reference">
          <ComposeCommandsVisual />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="happy">
        Pro tip: Use <code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>docker-compose up -d</code> to run in detached mode (background), and <code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>docker-compose logs -f</code> to follow logs live. That's the combo every developer uses daily!
      </NeuronTip>

      <Neuron
        mood="happy"
        typed
        message="You now know how to orchestrate multi-container applications with Docker Compose. One YAML file, one command, and your entire stack spins up with proper networking, volumes, and dependency ordering. This is how modern development teams work!"
      />
    </div>
  )
}
