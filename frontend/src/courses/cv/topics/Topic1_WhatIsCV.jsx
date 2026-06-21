import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 1 — What is Computer Vision?
   A cinematic journey from human sight to machine perception
================================================================ */

/* ---- Section 1: Human vs Machine Vision ---- */
function HumanVsMachine() {
  const [step, setStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const totalSteps = 6

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setStep(s => {
        if (s >= totalSteps - 1) { setAutoPlay(false); return s }
        return s + 1
      })
    }, 1800)
    return () => clearInterval(timer)
  }, [autoPlay])

  const humanStages = [
    { label: 'Eye Sees', icon: '👁️', desc: 'Light enters the eye' },
    { label: 'Retina Processes', icon: '🧬', desc: 'Photoreceptors fire' },
    { label: 'Brain Interprets', icon: '🧠', desc: 'Visual cortex analyzes' },
    { label: '"It\'s a scratch"', icon: '💡', desc: 'Recognition complete' },
  ]

  const machineStages = [
    { label: 'Camera Captures', icon: '📷', desc: 'Sensor records photons' },
    { label: 'Pixel Grid', icon: '🔢', desc: '1920x1080 numbers' },
    { label: 'Feature Maps', icon: '🗺️', desc: 'CNN extracts patterns' },
    { label: '"Defect Found!"', icon: '🎯', desc: 'Classification output' },
  ]

  const steelCellSize = 18
  const gridCols = 12
  const gridRows = 8

  const steelPixels = Array.from({ length: gridRows }, (_, r) =>
    Array.from({ length: gridCols }, (_, c) => {
      const isScratch = Math.abs(r - c * (gridRows / gridCols)) < 1.2
      return isScratch ? 40 + Math.random() * 30 : 160 + Math.random() * 60
    })
  )

  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 36 : 12,
              background: i <= step ? 'var(--accent)' : 'var(--border)',
              opacity: i <= step ? 1 : 0.4,
            }}
            style={{ height: 6, borderRadius: 3 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Human Side */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', textAlign: 'center',
            background: 'linear-gradient(135deg, #f59e0b15, #f59e0b08)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 28 }}>👁️</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Human Vision
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {humanStages.map((s, i) => (
              <motion.div
                key={s.label}
                animate={{
                  opacity: step >= i ? 1 : 0.2,
                  scale: step === i ? 1.04 : 1,
                  x: step >= i ? 0 : -20,
                }}
                transition={{ duration: 0.5, type: 'spring' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 12,
                  background: step === i ? '#f59e0b12' : 'transparent',
                  border: step === i ? '1px solid #f59e0b30' : '1px solid transparent',
                }}
              >
                <div style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
                {step >= i && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: 16 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* VS Divider */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, color: 'white',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}
          >
            VS
          </motion.div>
        </div>

        {/* Machine Side */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', textAlign: 'center',
            background: 'linear-gradient(135deg, #0ea5e915, #0ea5e908)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 28 }}>🤖</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Machine Vision
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {machineStages.map((s, i) => (
              <motion.div
                key={s.label}
                animate={{
                  opacity: step >= i + 1 ? 1 : 0.2,
                  scale: step === i + 1 ? 1.04 : 1,
                  x: step >= i + 1 ? 0 : 20,
                }}
                transition={{ duration: 0.5, type: 'spring' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 12,
                  background: step === i + 1 ? '#0ea5e912' : 'transparent',
                  border: step === i + 1 ? '1px solid #0ea5e930' : '1px solid transparent',
                }}
              >
                <div style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
                {step >= i + 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ marginLeft: 'auto', color: '#0ea5e9', fontSize: 16 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pixel grid reveal at step 2 */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}
          >
            <div style={{
              background: 'var(--bg-card)', borderRadius: 16, padding: 20,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 12, letterSpacing: 1 }}>
                WHAT THE MACHINE SEES
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, ${steelCellSize}px)`, gap: 1 }}>
                {steelPixels.flat().map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.008 }}
                    style={{
                      width: steelCellSize, height: steelCellSize,
                      background: `rgb(${Math.round(v)},${Math.round(v)},${Math.round(v)})`,
                      borderRadius: 2,
                      fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: v < 100 ? '#fff8' : '#0008', fontFamily: 'monospace',
                    }}
                  >
                    {Math.round(v)}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result at final step */}
      <AnimatePresence>
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 20, padding: '20px 28px', borderRadius: 16,
              background: 'linear-gradient(135deg, #10b98115, #0ea5e915)',
              border: '1px solid #10b98140', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
              Both arrive at the same conclusion — but machines do it in milliseconds, 24/7
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setStep(0); setAutoPlay(true) }}
          style={{
            padding: '10px 24px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          Replay
        </motion.button>
      </div>
    </div>
  )
}

/* ---- Section 2: CV Applications Gallery ---- */
function CVApplicationsGallery() {
  const [active, setActive] = useState(null)

  const apps = [
    {
      id: 'manufacturing',
      title: 'Manufacturing QC',
      icon: '🏭',
      color: '#f59e0b',
      desc: 'Detect surface defects on steel, PCBs, and textiles at production speed.',
      aiSees: 'bounding-boxes',
      details: ['Scratch detection', 'Crack analysis', 'Surface pitting', 'Weld inspection'],
    },
    {
      id: 'autonomous',
      title: 'Autonomous Vehicles',
      icon: '🚗',
      color: '#3b82f6',
      desc: 'Real-time detection of pedestrians, lanes, signs, and obstacles.',
      aiSees: 'segmentation',
      details: ['Lane detection', 'Pedestrian tracking', 'Sign recognition', 'Depth estimation'],
    },
    {
      id: 'medical',
      title: 'Medical Imaging',
      icon: '🏥',
      color: '#10b981',
      desc: 'Identify tumors, fractures, and anomalies in X-rays, MRIs, and CT scans.',
      aiSees: 'heatmap',
      details: ['Tumor detection', 'Fracture analysis', 'Retinal scans', 'Cell counting'],
    },
    {
      id: 'facial',
      title: 'Facial Recognition',
      icon: '🔐',
      color: '#8b5cf6',
      desc: 'Identify and verify individuals from facial features and landmarks.',
      aiSees: 'landmarks',
      details: ['68 face landmarks', 'Expression analysis', 'Identity matching', 'Liveness check'],
    },
    {
      id: 'agriculture',
      title: 'Agriculture',
      icon: '🌾',
      color: '#22c55e',
      desc: 'Monitor crop health, detect diseases, and estimate yields from aerial imagery.',
      aiSees: 'segmentation',
      details: ['Disease spotting', 'Weed detection', 'Yield estimation', 'Drone surveys'],
    },
    {
      id: 'retail',
      title: 'Retail Analytics',
      icon: '🛒',
      color: '#ec4899',
      desc: 'Track foot traffic, shelf inventory, and customer behavior automatically.',
      aiSees: 'tracking',
      details: ['People counting', 'Shelf monitoring', 'Queue analysis', 'Theft detection'],
    },
  ]

  /* Mini AI visualization for each card */
  const AIVisualization = ({ type, color }) => {
    if (type === 'bounding-boxes') {
      return (
        <div style={{ position: 'relative', width: '100%', height: 80, background: `${color}08`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}10, transparent)` }} />
          {[
            { x: '10%', y: '15%', w: 40, h: 30 },
            { x: '55%', y: '35%', w: 35, h: 25 },
            { x: '30%', y: '55%', w: 45, h: 20 },
          ].map((box, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.2, duration: 0.4 }}
              style={{
                position: 'absolute', left: box.x, top: box.y,
                width: box.w, height: box.h,
                border: `2px solid ${color}`, borderRadius: 4,
                boxShadow: `0 0 8px ${color}40`,
              }}
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: 'absolute', top: -8, left: 0,
                  fontSize: 7, fontWeight: 700, color: 'white',
                  background: color, padding: '1px 4px', borderRadius: 2,
                }}
              >
                defect
              </motion.div>
            </motion.div>
          ))}
        </div>
      )
    }
    if (type === 'segmentation') {
      return (
        <div style={{ position: 'relative', width: '100%', height: 80, background: `${color}08`, borderRadius: 10, overflow: 'hidden' }}>
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              style={{
                position: 'absolute',
                left: `${10 + i * 22}%`, top: `${15 + (i % 2) * 25}%`,
                width: `${25 + Math.random() * 15}%`, height: `${30 + Math.random() * 20}%`,
                background: `${color}`,
                borderRadius: '40%',
                filter: 'blur(4px)',
              }}
            />
          ))}
        </div>
      )
    }
    if (type === 'heatmap') {
      return (
        <div style={{ position: 'relative', width: '100%', height: 80, background: `${color}08`, borderRadius: 10, overflow: 'hidden' }}>
          {[0, 1].map(i => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              style={{
                position: 'absolute',
                left: `${20 + i * 35}%`, top: '25%',
                width: 35, height: 35, borderRadius: '50%',
                background: `radial-gradient(circle, #ef4444, ${color}60, transparent)`,
              }}
            />
          ))}
        </div>
      )
    }
    if (type === 'landmarks') {
      const points = [
        [35, 25], [55, 25], [45, 38], [35, 52], [45, 55], [55, 52],
        [30, 30], [60, 30], [38, 45], [52, 45], [45, 48], [40, 58], [50, 58],
      ]
      return (
        <div style={{ position: 'relative', width: '100%', height: 80, background: `${color}08`, borderRadius: 10, overflow: 'hidden' }}>
          {/* Face oval */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            style={{
              position: 'absolute', left: '25%', top: '10%',
              width: '50%', height: '80%',
              border: `2px solid ${color}`,
              borderRadius: '50%',
            }}
          />
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              style={{
                position: 'absolute', left: `${p[0]}%`, top: `${p[1]}%`,
                width: 5, height: 5, borderRadius: '50%',
                background: color, boxShadow: `0 0 6px ${color}`,
              }}
            />
          ))}
        </div>
      )
    }
    if (type === 'tracking') {
      return (
        <div style={{ position: 'relative', width: '100%', height: 80, background: `${color}08`, borderRadius: 10, overflow: 'hidden' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ x: [0, 30 + i * 10, 60 + i * 5, 90] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
              style={{
                position: 'absolute', left: `${10 + i * 25}%`, top: `${25 + i * 15}%`,
                width: 10, height: 10, borderRadius: '50%',
                background: color, boxShadow: `0 0 8px ${color}`,
              }}
            />
          ))}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`trail-${i}`}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              style={{
                position: 'absolute', left: `${10 + i * 25}%`, top: `${29 + i * 15}%`,
                width: 50, height: 2, background: `${color}50`, borderRadius: 1,
              }}
            />
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {apps.map((app, idx) => {
          const isActive = active === app.id
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -4, boxShadow: `0 12px 32px ${app.color}20` }}
              onClick={() => setActive(isActive ? null : app.id)}
              style={{
                background: 'var(--bg-card)', borderRadius: 18,
                border: isActive ? `2px solid ${app.color}60` : '1px solid var(--border)',
                cursor: 'pointer', overflow: 'hidden',
                transition: 'border 0.2s',
              }}
            >
              {/* Card header */}
              <div style={{
                padding: '18px 18px 14px',
                background: isActive ? `${app.color}08` : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${app.color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {app.icon}
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                    {app.title}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {app.desc}
                </div>
              </div>

              {/* AI Viz */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ padding: '0 14px 14px', overflow: 'hidden' }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700, color: app.color, marginBottom: 8, letterSpacing: 1 }}>
                      WHAT AI SEES
                    </div>
                    <AIVisualization type={app.aiSees} color={app.color} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {app.details.map((d, i) => (
                        <motion.span
                          key={d}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          style={{
                            padding: '4px 10px', borderRadius: 8,
                            background: `${app.color}12`, color: app.color,
                            fontSize: 11, fontWeight: 600,
                          }}
                        >
                          {d}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <div style={{
        marginTop: 20, padding: '14px 20px', borderRadius: 12,
        background: 'var(--bg-secondary)', textAlign: 'center',
        fontSize: 14, color: 'var(--text-muted)',
      }}>
        Click any card to see what the AI "sees" in that domain
      </div>
    </div>
  )
}

/* ---- Section 3: How CV Works Pipeline ---- */
function HowCVWorks() {
  const [activeNode, setActiveNode] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  const pipeline = [
    {
      label: 'Camera',
      icon: '📷',
      color: '#6366f1',
      visual: 'lens',
      desc: 'Captures raw photon data from the scene',
    },
    {
      label: 'Raw Image',
      icon: '🖼️',
      color: '#8b5cf6',
      visual: 'image',
      desc: 'Digital representation: H x W x C matrix',
    },
    {
      label: 'Preprocessing',
      icon: '🔧',
      color: '#0ea5e9',
      visual: 'preprocess',
      desc: 'Resize, normalize, augment for the model',
    },
    {
      label: 'CNN',
      icon: '🧠',
      color: '#10b981',
      visual: 'cnn',
      desc: 'Convolutional layers extract features',
    },
    {
      label: 'Detection',
      icon: '🎯',
      color: '#f59e0b',
      visual: 'detect',
      desc: 'Localize and classify objects/defects',
    },
    {
      label: 'Decision',
      icon: '✅',
      color: '#ef4444',
      visual: 'decision',
      desc: 'PASS/FAIL verdict + confidence score',
    },
  ]

  useEffect(() => {
    if (!isPlaying) return
    setActiveNode(0)
    const timer = setInterval(() => {
      setActiveNode(n => {
        if (n >= pipeline.length - 1) { setIsPlaying(false); return n }
        return n + 1
      })
    }, 1200)
    return () => clearInterval(timer)
  }, [isPlaying])

  const NodeVisual = ({ type, color, isActive }) => {
    if (!isActive) return null
    const visuals = {
      lens: (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              style={{
                width: 20 + i * 12, height: 20 + i * 12, borderRadius: '50%',
                border: `2px solid ${color}`, position: 'absolute',
              }}
            />
          ))}
        </div>
      ),
      image: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {Array.from({ length: 16 }, (_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, background: `hsl(0, 0%, ${30 + Math.random() * 50}%)` }}
              transition={{ delay: i * 0.03 }}
              style={{ width: 10, height: 10, borderRadius: 1 }}
            />
          ))}
        </div>
      ),
      preprocess: (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ width: 30, height: 30, border: `3px solid ${color}`, borderTopColor: 'transparent', borderRadius: '50%' }}
        />
      ),
      cnn: (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[3, 5, 4, 3].map((n, li) => (
            <div key={li} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Array.from({ length: n }, (_, ni) => (
                <motion.div
                  key={ni}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: (li * n + ni) * 0.1 }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: color }}
                />
              ))}
            </div>
          ))}
        </div>
      ),
      detect: (
        <div style={{ position: 'relative', width: 40, height: 30 }}>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ position: 'absolute', left: 2, top: 2, width: 18, height: 14, border: `2px solid ${color}`, borderRadius: 2 }}
          />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            style={{ position: 'absolute', right: 2, bottom: 2, width: 16, height: 12, border: `2px solid ${color}`, borderRadius: 2 }}
          />
        </div>
      ),
      decision: (
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ fontSize: 24 }}
        >
          ✓
        </motion.div>
      ),
    }
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 48, position: 'relative' }}
      >
        {visuals[type]}
      </motion.div>
    )
  }

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsPlaying(true); setActiveNode(-1) }}
        style={{
          display: 'block', margin: '0 auto 28px', padding: '12px 32px',
          background: isPlaying ? 'var(--border)' : 'var(--gradient-primary)',
          color: isPlaying ? 'var(--text-muted)' : 'white',
          border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
          cursor: isPlaying ? 'default' : 'pointer', fontFamily: 'var(--font-heading)',
        }}
        disabled={isPlaying}
      >
        {isPlaying ? 'Processing...' : 'Run the Pipeline'}
      </motion.button>

      {/* Pipeline nodes */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, justifyContent: 'center' }}>
        {pipeline.map((node, i) => (
          <div key={node.label} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <motion.div
              animate={{
                borderColor: activeNode >= i ? node.color : 'var(--border)',
                boxShadow: activeNode === i ? `0 0 24px ${node.color}40` : '0 0 0 transparent',
              }}
              style={{
                width: 120, background: 'var(--bg-card)', borderRadius: 16,
                border: '2px solid var(--border)', overflow: 'hidden',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <motion.div
                animate={{
                  background: activeNode >= i ? `${node.color}20` : 'var(--bg-secondary)',
                }}
                style={{ padding: '14px 10px 8px' }}
              >
                <motion.div
                  animate={activeNode === i ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.6 }}
                  style={{ fontSize: 28, marginBottom: 6 }}
                >
                  {node.icon}
                </motion.div>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{node.label}</div>
              </motion.div>

              {/* Visual area */}
              <div style={{ padding: '6px 10px 12px', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NodeVisual type={node.visual} color={node.color} isActive={activeNode >= i} />
                {activeNode < i && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>waiting...</div>
                )}
              </div>

              {/* Description */}
              <AnimatePresence>
                {activeNode >= i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      padding: '8px 10px 12px', fontSize: 10,
                      color: 'var(--text-muted)', lineHeight: 1.4,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    {node.desc}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Arrow connector */}
            {i < pipeline.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: 38, height: 80 }}>
                <motion.div
                  animate={{ opacity: activeNode > i ? 1 : 0.2, scale: activeNode === i ? [1, 1.3, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ color: activeNode > i ? pipeline[i + 1].color : 'var(--text-muted)', fontSize: 16, padding: '0 2px' }}
                >
                  ›
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Section 4: Manufacturing Spotlight ---- */
function ManufacturingSpotlight() {
  const [phase, setPhase] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const defects = [
    { type: 'Scratch', x: 15, y: 20, w: 55, h: 8, color: '#ef4444', conf: 0.97 },
    { type: 'Crack', x: 65, y: 45, w: 12, h: 35, color: '#f59e0b', conf: 0.94 },
    { type: 'Pit', x: 30, y: 60, w: 16, h: 16, color: '#8b5cf6', conf: 0.89 },
  ]

  const stats = [
    { label: 'Accuracy', value: '99.2%', icon: '🎯', color: '#10b981' },
    { label: 'Speed', value: '50ms', icon: '⚡', color: '#f59e0b' },
    { label: 'Operation', value: '24/7', icon: '🔄', color: '#3b82f6' },
    { label: 'Cost Saving', value: '73%', icon: '💰', color: '#8b5cf6' },
  ]

  useEffect(() => {
    if (!isRunning) return
    setPhase(0)
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => { setPhase(4); setIsRunning(false) }, 3800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isRunning])

  /* Generate a steel surface pattern */
  const surfaceRows = 10
  const surfaceCols = 20

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsRunning(true)}
        style={{
          display: 'block', margin: '0 auto 24px', padding: '14px 36px',
          background: isRunning ? 'var(--border)' : 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
          color: isRunning ? 'var(--text-muted)' : 'white',
          border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16,
          cursor: isRunning ? 'default' : 'pointer', fontFamily: 'var(--font-heading)',
        }}
        disabled={isRunning}
      >
        {isRunning ? 'Scanning...' : 'Start Inspection'}
      </motion.button>

      {/* Steel surface */}
      <div style={{
        position: 'relative', background: 'linear-gradient(135deg, #94a3b8, #cbd5e1, #94a3b8)',
        borderRadius: 16, height: 280, overflow: 'hidden',
        border: '2px solid var(--border)',
      }}>
        {/* Surface texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.3,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.05) 8px, rgba(0,0,0,0.05) 9px),
            repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.03) 12px, rgba(0,0,0,0.03) 13px)`,
        }} />

        {/* Animated defects appearing */}
        {/* Scratch — diagonal dark line */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute', left: '15%', top: '20%',
                width: '55%', height: 4,
                background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.6), rgba(0,0,0,0.4), transparent)',
                transform: 'rotate(-3deg)', borderRadius: 2,
              }}
            />
          )}
        </AnimatePresence>

        {/* Crack — vertical jagged line */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                position: 'absolute', left: '70%', top: '40%', height: '35%', width: 3,
                background: 'rgba(0,0,0,0.5)', borderRadius: 1,
              }}
            />
          )}
        </AnimatePresence>

        {/* Pit — small dark circle */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                position: 'absolute', left: '32%', top: '62%',
                width: 18, height: 18, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.6), rgba(0,0,0,0.2))',
              }}
            />
          )}
        </AnimatePresence>

        {/* Scanning line */}
        {phase >= 1 && phase < 3 && (
          <motion.div
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: 'absolute', left: 0, width: '100%', height: 3,
              background: 'linear-gradient(90deg, transparent, #0ea5e9, transparent)',
              boxShadow: '0 0 20px #0ea5e980',
            }}
          />
        )}

        {/* Bounding boxes */}
        <AnimatePresence>
          {phase >= 3 && defects.map((d, i) => (
            <motion.div
              key={d.type}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.3, type: 'spring' }}
              style={{
                position: 'absolute',
                left: `${d.x}%`, top: `${d.y}%`,
                width: `${d.w}%`, height: `${d.h}%`,
                border: `2px solid ${d.color}`,
                borderRadius: 4,
                boxShadow: `0 0 12px ${d.color}50`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.3 + 0.2 }}
                style={{
                  position: 'absolute', top: -22, left: 0,
                  background: d.color, color: 'white',
                  padding: '2px 8px', borderRadius: 4,
                  fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.type} ({(d.conf * 100).toFixed(0)}%)
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Phase label */}
        <div style={{
          position: 'absolute', bottom: 12, right: 14,
          background: 'rgba(0,0,0,0.7)', color: 'white',
          padding: '6px 14px', borderRadius: 8, fontSize: 12,
          fontWeight: 700, fontFamily: 'monospace',
        }}>
          {phase === 0 && 'IDLE'}
          {phase === 1 && 'CAPTURING...'}
          {phase === 2 && 'ANALYZING...'}
          {phase === 3 && 'DEFECTS FOUND: 3'}
          {phase === 4 && 'VERDICT: REJECT'}
        </div>
      </div>

      {/* Stats */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 20 }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '18px 14px', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {phase >= 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: 16, padding: '16px 24px', borderRadius: 14,
            background: 'linear-gradient(135deg, #ef444410, #f59e0b10)',
            border: '1px solid #ef444430', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444' }}>
            3 defects detected in 50ms — this sheet is automatically rejected from the production line
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic1() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* --- Section 1: Human vs Machine --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              👁️
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Human vs Machine Vision
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Humans and machines both "see" — but in fundamentally different ways. Watch the comparison unfold.
          </p>
        </div>
        <HindiExplainer
          concept="कंप्यूटर विज़न"
          english="Computer Vision"
          explanation="कंप्यूटर विज़न का मतलब है मशीनों को 'देखना' सिखाना। जैसे हम आँखों से देखकर चीज़ें पहचानते हैं, वैसे ही कैमरा और AI मिलकर तस्वीरों को समझते हैं।"
          example="जब आप फ़ोन में Face Unlock करते हैं, तो कैमरा आपका चेहरा 'देखता' है और पहचानता है — यही Computer Vision है! Google Photos भी इसी तरह तस्वीरों में चेहरे पहचानकर sort करता है।"
          terms={[
            { hindi: 'मशीन लर्निंग', english: 'Machine Learning', meaning: 'मशीन को डेटा से सीखना सिखाना' },
            { hindi: 'इमेज', english: 'Image', meaning: 'तस्वीर — कैमरे से ली गई फ़ोटो' },
            { hindi: 'पहचान', english: 'Recognition', meaning: 'किसी चीज़ को देखकर बताना कि ये क्या है' },
          ]}
        />
        <HumanVsMachine />
      </section>

      {/* --- Section 2: Applications Gallery --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              🌐
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              CV Applications Gallery
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Computer vision is everywhere. Explore six real-world domains where machines see, analyze, and decide.
          </p>
        </div>
        <HindiExplainer
          concept="CV के असली उपयोग"
          english="Real-World CV Applications"
          explanation="Computer Vision सिर्फ़ रिसर्च में नहीं, बल्कि हमारी रोज़मर्रा की ज़िंदगी में हर जगह काम कर रहा है — अस्पतालों में, सड़कों पर, खेतों में, और फ़ैक्टरियों में।"
          example="Tesla की गाड़ियाँ सड़क पर दूसरी गाड़ियों और लोगों को 'देख' सकती हैं। Amazon Go स्टोर में कैमरे देखते हैं कि आपने कौन सा सामान उठाया — बिना billing काउंटर के!"
          terms={[
            { hindi: 'गुणवत्ता जाँच', english: 'Quality Inspection', meaning: 'प्रोडक्ट में खराबी ढूँढना' },
            { hindi: 'स्वचालित गाड़ी', english: 'Self-Driving Car', meaning: 'बिना ड्राइवर के चलने वाली गाड़ी' },
            { hindi: 'चिकित्सा इमेजिंग', english: 'Medical Imaging', meaning: 'X-Ray, MRI जैसी तस्वीरों से बीमारी पहचानना' },
          ]}
        />
        <CVApplicationsGallery />
      </section>

      {/* --- Section 3: How CV Works --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              ⚙️
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              The CV Pipeline
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            From camera to decision — watch each stage of the computer vision pipeline light up as data flows through.
          </p>
        </div>
        <HindiExplainer
          concept="CV कैसे काम करता है"
          english="How Computer Vision Works"
          explanation="Computer Vision में तीन मुख्य चरण हैं: पहले कैमरा तस्वीर लेता है, फिर AI उसमें patterns ढूँढता है (जैसे किनारे, रंग, आकार), और आख़िर में बताता है कि तस्वीर में क्या है।"
          example="सोचिए एक फ़ैक्टरी में एक अनुभवी कर्मचारी हर स्टील शीट को देखकर बताता है कि उसमें खरोंच है या नहीं। Computer Vision वही काम करता है — बस बिना थके, 24 घंटे, हर सेकंड!"
          terms={[
            { hindi: 'फ़ीचर', english: 'Feature', meaning: 'तस्वीर में कोई खास पैटर्न — जैसे किनारा, कोना, रंग' },
            { hindi: 'वर्गीकरण', english: 'Classification', meaning: 'बताना कि तस्वीर किस कैटेगरी की है' },
            { hindi: 'पाइपलाइन', english: 'Pipeline', meaning: 'कई चरणों की श्रृंखला — एक के बाद एक' },
          ]}
        />
        <HowCVWorks />
      </section>

      {/* --- Section 4: Manufacturing Spotlight --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              🏭
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Manufacturing Spotlight: Steel Defect Detection
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            See a real-world inspection in action — AI scans a steel sheet and finds every defect in milliseconds.
          </p>
        </div>
        <ManufacturingSpotlight />
      </section>

    </div>
  )
}
