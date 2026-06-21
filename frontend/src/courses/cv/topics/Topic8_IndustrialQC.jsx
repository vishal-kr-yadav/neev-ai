import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 8 — Industrial Quality Inspection
   Conveyor belts, edge vs cloud, model optimization, dashboards,
   ROI, and real-world case studies — all animated
================================================================ */

/* ---- 1. Production Line Animation ---- */
function ProductionLine() {
  const [sheets, setSheets] = useState([])
  const [stats, setStats] = useState({ inspected: 0, defects: 0, yield: 100 })
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const idRef = useRef(0)

  const defectTypes = [
    { name: 'Scratch', color: '#ef4444', prob: 0.15 },
    { name: 'Crack', color: '#f59e0b', prob: 0.08 },
    { name: 'Pit', color: '#8b5cf6', prob: 0.05 },
  ]

  const spawnSheet = useCallback(() => {
    const hasDefect = Math.random() < 0.28
    const defect = hasDefect
      ? defectTypes[Math.floor(Math.random() * defectTypes.length)]
      : null
    const boxX = 30 + Math.random() * 40
    const boxY = 15 + Math.random() * 30

    idRef.current += 1
    const newSheet = {
      id: idRef.current,
      defect,
      boxX, boxY,
      spawned: Date.now(),
    }

    setSheets(prev => [...prev.slice(-8), newSheet])
    setStats(prev => {
      const newInspected = prev.inspected + 1
      const newDefects = prev.defects + (hasDefect ? 1 : 0)
      return {
        inspected: newInspected,
        defects: newDefects,
        yield: ((newInspected - newDefects) / newInspected * 100).toFixed(1),
      }
    })
  }, [])

  const toggleLine = () => {
    if (running) {
      clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      setRunning(true)
      spawnSheet()
      intervalRef.current = setInterval(spawnSheet, 1800)
    }
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <SectionBlock icon="@" title="Production Line Inspector" color="#3b82f6">
      <Neuron mood="excited" message="Welcome to the smart factory! Watch steel sheets move across the conveyor belt as our CNN inspects each one in real time." size="small" />

      <HindiExplainer
        concept="इंडस्ट्रियल क्वालिटी इंस्पेक्शन"
        english="Industrial Quality Inspection"
        explanation="फ़ैक्टरी में बनने वाले हर प्रोडक्ट की जाँच ज़रूरी है — कहीं कोई खराबी तो नहीं। पहले ये काम इंसान करते थे, अब AI कैमरों से automatically कर सकता है।"
        example="Tata Steel की फ़ैक्टरी में हर मिनट स्टील शीट निकलती हैं। इंसान थक जाता है, लेकिन AI कैमरा 24 घंटे हर शीट चेक करता रहता है — एक भी खरोंच नहीं छूटती!"
        terms={[
          { hindi: 'दोष पहचान', english: 'Defect Detection', meaning: 'प्रोडक्ट में खराबी ढूँढना' },
          { hindi: 'उत्पादन लाइन', english: 'Production Line', meaning: 'फ़ैक्टरी में प्रोडक्ट बनने की कतार' },
          { hindi: 'यील्ड रेट', english: 'Yield Rate', meaning: 'कितने प्रतिशत प्रोडक्ट अच्छे निकले' },
        ]}
      />

      {/* Factory dashboard look */}
      <div style={{
        background: '#0f172a', borderRadius: 20, overflow: 'hidden',
        border: '2px solid #1e293b', marginTop: 20,
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 24px', background: '#1e293b', borderBottom: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div
              animate={{ background: running ? '#10b981' : '#ef4444' }}
              style={{ width: 10, height: 10, borderRadius: '50%' }}
            />
            <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              LINE A — Surface Defect Detection
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8' }}>
            <span>Model: YOLOv8-s</span>
            <span>FPS: 45</span>
            <span>Camera: 4K</span>
          </div>
        </div>

        {/* Conveyor belt area */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#0f172a' }}>
          {/* Belt pattern */}
          <motion.div
            animate={running ? { backgroundPositionX: ['0px', '-60px'] } : {}}
            transition={running ? { repeat: Infinity, duration: 1.2, ease: 'linear' } : {}}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 30,
              background: 'repeating-linear-gradient(90deg, #334155 0px, #334155 28px, #475569 28px, #475569 30px)',
              backgroundSize: '60px 30px',
            }}
          />

          {/* Camera icon */}
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <motion.div
              animate={running ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ fontSize: 28 }}
            >
              {'▽'}
            </motion.div>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>CAMERA</span>
            {running && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: [0, 0.3, 0], height: 80 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: 120, background: 'linear-gradient(180deg, #3b82f640, transparent)',
                  borderRadius: '0 0 60px 60px', position: 'absolute', top: 38,
                }}
              />
            )}
          </div>

          {/* Steel sheets */}
          <AnimatePresence>
            {sheets.map((sheet, i) => (
              <motion.div
                key={sheet.id}
                initial={{ x: -120, y: 70 }}
                animate={{ x: 600 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                style={{ position: 'absolute', top: 60, zIndex: 2 }}
              >
                {/* Sheet */}
                <div style={{
                  width: 100, height: 70, borderRadius: 6,
                  background: sheet.defect ? '#1e293b' : '#334155',
                  border: `2px solid ${sheet.defect ? sheet.defect.color : '#475569'}`,
                  position: 'relative',
                  boxShadow: sheet.defect ? `0 0 15px ${sheet.defect.color}40` : 'none',
                }}>
                  {/* Metal texture lines */}
                  {[0, 1, 2].map(n => (
                    <div key={n} style={{
                      position: 'absolute', top: 15 + n * 18, left: 8, right: 8,
                      height: 1, background: '#47556930',
                    }} />
                  ))}

                  {/* Defect bounding box */}
                  {sheet.defect && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        position: 'absolute',
                        left: `${sheet.boxX}%`, top: `${sheet.boxY}%`,
                        width: 30, height: 22,
                        border: `2px solid ${sheet.defect.color}`,
                        borderRadius: 3, background: `${sheet.defect.color}20`,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: -16, left: 0, fontSize: 8,
                        fontWeight: 700, color: sheet.defect.color, whiteSpace: 'nowrap',
                        background: '#0f172a', padding: '1px 4px', borderRadius: 3,
                      }}>
                        {sheet.defect.name}
                      </span>
                    </motion.div>
                  )}

                  {/* Pass/Fail badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)',
                      fontSize: 9, fontWeight: 800, letterSpacing: 1,
                      color: sheet.defect ? '#ef4444' : '#10b981',
                      textTransform: 'uppercase',
                    }}
                  >
                    {sheet.defect ? 'REJECT' : 'PASS'}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '16px 24px', gap: 16, borderTop: '1px solid #334155',
        }}>
          {[
            { label: 'Inspected', value: stats.inspected, color: '#3b82f6', icon: '#' },
            { label: 'Defects Found', value: stats.defects, color: '#ef4444', icon: '!' },
            { label: 'Yield Rate', value: `${stats.yield}%`, color: '#10b981', icon: '%' },
            { label: 'Status', value: running ? 'RUNNING' : 'STOPPED', color: running ? '#10b981' : '#f59e0b', icon: running ? '>' : '||' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                {s.label}
              </div>
              <motion.div
                key={s.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}
              >
                {s.value}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Start/Stop button */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={toggleLine}
          style={{
            padding: '14px 36px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: running
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', fontWeight: 700, fontSize: 15,
            boxShadow: running ? '0 4px 20px #ef444440' : '0 4px 20px #10b98140',
          }}
        >
          {running ? 'Stop Line' : 'Start Production Line'}
        </motion.button>
      </div>
    </SectionBlock>
  )
}


/* ---- 2. Edge vs Cloud ---- */
function EdgeVsCloud() {
  const [mode, setMode] = useState('edge')

  const configs = {
    edge: {
      title: 'Edge Deployment', icon: '~', color: '#10b981',
      visual: 'Camera + Jetson Nano on factory floor',
      items: [
        { label: 'Latency', value: '< 20ms', good: true },
        { label: 'Internet', value: 'Not Required', good: true },
        { label: 'Privacy', value: 'Data stays on-site', good: true },
        { label: 'Accuracy', value: 'Good (optimized model)', good: false },
        { label: 'Cost/Unit', value: '$200-500 per node', good: false },
        { label: 'Updates', value: 'Manual firmware push', good: false },
      ],
      hw: [
        { name: 'Camera', desc: '4K Industrial Camera', size: 60 },
        { name: 'Jetson', desc: 'NVIDIA Jetson Nano', size: 50 },
        { name: 'GPIO', desc: 'Reject Actuator', size: 40 },
      ]
    },
    cloud: {
      title: 'Cloud Deployment', icon: '#', color: '#3b82f6',
      visual: 'Images sent to cloud GPU cluster',
      items: [
        { label: 'Latency', value: '200-500ms', good: false },
        { label: 'Internet', value: 'Required (high bandwidth)', good: false },
        { label: 'Privacy', value: 'Data leaves factory', good: false },
        { label: 'Accuracy', value: 'Best (full-size model)', good: true },
        { label: 'Cost/Unit', value: 'Pay per inference', good: true },
        { label: 'Updates', value: 'Instant model swap', good: true },
      ],
      hw: [
        { name: 'Camera', desc: 'Industrial Camera', size: 60 },
        { name: 'Router', desc: '5G / Fiber Link', size: 50 },
        { name: 'Cloud', desc: 'GPU Cluster (A100)', size: 70 },
      ]
    },
  }

  const cfg = configs[mode]

  return (
    <SectionBlock icon="<>" title="Edge vs Cloud Deployment" color="#6366f1">
      <Neuron mood="thinking" message="Where should the model run? On the factory floor (edge) or in the cloud? Each has tradeoffs. Let's compare." size="small" />

      <HindiExplainer
        concept="एज बनाम क्लाउड"
        english="Edge vs Cloud Deployment"
        explanation="AI मॉडल दो जगह चल सकता है: Edge (फ़ैक्टरी में ही छोटे कंप्यूटर पर) या Cloud (इंटरनेट के ज़रिए बड़े सर्वर पर)। Edge तेज़ है पर कम ताकतवर, Cloud ताकतवर है पर इंटरनेट चाहिए।"
        example="जैसे calculator फ़ोन में हो तो तुरंत काम करता है (Edge), लेकिन Google पर search करना हो तो internet चाहिए (Cloud)। फ़ैक्टरी में जहाँ हर मिलीसेकंड मायने रखता है, वहाँ Edge बेहतर है।"
        terms={[
          { hindi: 'एज डिवाइस', english: 'Edge Device', meaning: 'कैमरे के पास लगा छोटा कंप्यूटर — जैसे NVIDIA Jetson' },
          { hindi: 'लेटेंसी', english: 'Latency', meaning: 'देरी — तस्वीर लेने से जवाब मिलने तक का समय' },
          { hindi: 'थ्रूपुट', english: 'Throughput', meaning: 'प्रति सेकंड कितनी तस्वीरें process हो सकती हैं' },
        ]}
      />

      {/* Toggle */}
      <div style={{
        display: 'flex', borderRadius: 14, overflow: 'hidden', border: '2px solid var(--border)',
        width: 'fit-content', margin: '20px auto',
      }}>
        {Object.entries(configs).map(([key, c]) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode(key)}
            style={{
              padding: '12px 32px', border: 'none', cursor: 'pointer',
              background: mode === key ? c.color : 'var(--bg-secondary)',
              color: mode === key ? 'white' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-heading)',
            }}
          >
            {c.title}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'edge' ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'edge' ? 30 : -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Architecture diagram */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
            padding: 24, background: `${cfg.color}08`, borderRadius: 16,
            border: `1px solid ${cfg.color}30`, marginBottom: 20,
          }}>
            {cfg.hw.map((hw, i) => (
              <div key={hw.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.2, type: 'spring' }}
                  style={{
                    width: hw.size + 20, height: hw.size + 20, borderRadius: 16,
                    background: `${cfg.color}15`, border: `2px solid ${cfg.color}40`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 900, color: cfg.color }}>{hw.name.charAt(0)}</div>
                  <div style={{ fontSize: 10, color: cfg.color, fontWeight: 600, textAlign: 'center', marginTop: 4 }}>{hw.name}</div>
                </motion.div>
                {i < cfg.hw.length - 1 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    transition={{ delay: i * 0.2 + 0.3 }}
                    style={{
                      height: 3, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}60)`,
                      borderRadius: 2,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Pros/Cons list */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {cfg.items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: '12px 16px', borderRadius: 12,
                  background: item.good ? '#10b98108' : '#f59e0b08',
                  border: `1px solid ${item.good ? '#10b98130' : '#f59e0b30'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: item.good ? '#10b981' : '#f59e0b',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 16 }}>{item.good ? '+' : '-'}</span>
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <NeuronTip type="tip">
        Most production systems use a <strong>hybrid approach</strong>: edge for real-time reject/pass decisions, cloud for model retraining and analytics.
      </NeuronTip>
    </SectionBlock>
  )
}


/* ---- 3. Model Optimization Pipeline ---- */
function ModelOptimization() {
  const [activeStage, setActiveStage] = useState(0)
  const [animating, setAnimating] = useState(false)

  const stages = [
    { name: 'Full Model', detail: 'YOLOv8-Large', size: 100, speed: 1, accuracy: 95.2, color: '#6366f1', icon: 'F' },
    { name: 'Quantized', detail: 'FP32 -> INT8', size: 25, speed: 2, accuracy: 94.1, color: '#3b82f6', icon: 'Q' },
    { name: 'Pruned', detail: '40% weights removed', size: 15, speed: 2.5, accuracy: 93.5, color: '#f59e0b', icon: 'P' },
    { name: 'TensorRT', detail: 'GPU-optimized runtime', size: 8, speed: 3.2, accuracy: 93.2, color: '#10b981', icon: 'T' },
    { name: 'Final', detail: 'Production-ready', size: 5, speed: 3.8, accuracy: 92.8, color: '#ec4899', icon: '!' },
  ]

  const runOptimization = () => {
    if (animating) return
    setAnimating(true)
    setActiveStage(0)
    stages.forEach((_, i) => {
      setTimeout(() => setActiveStage(i), i * 1200)
    })
    setTimeout(() => setAnimating(false), stages.length * 1200)
  }

  const s = stages[activeStage]

  return (
    <SectionBlock icon=">" title="Model Optimization Pipeline" color="#f59e0b">
      <Neuron mood="explaining" message="A 100MB model is too big for a factory edge device. Let's shrink it step by step while keeping accuracy high." size="small" />

      {/* Pipeline stages */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 8, padding: '30px 10px 10px', marginTop: 20,
      }}>
        {stages.map((stage, i) => {
          const isActive = i === activeStage
          const isPast = i < activeStage
          const barHeight = 40 + stage.size * 1.6

          return (
            <motion.div
              key={stage.name}
              onClick={() => { if (!animating) setActiveStage(i) }}
              animate={{
                scale: isActive ? 1.05 : 1,
                opacity: isPast || isActive ? 1 : 0.4,
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, cursor: animating ? 'default' : 'pointer',
              }}
            >
              {/* Size bar */}
              <motion.div
                animate={{
                  height: barHeight,
                  background: isActive ? stage.color : isPast ? `${stage.color}80` : 'var(--border)',
                }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  width: '80%', maxWidth: 80, borderRadius: '10px 10px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  boxShadow: isActive ? `0 -4px 20px ${stage.color}40` : 'none',
                }}
              >
                <span style={{
                  fontSize: 12, fontWeight: 800, color: 'white', fontFamily: 'monospace',
                  position: 'absolute', top: 8,
                }}>
                  {stage.size}MB
                </span>
              </motion.div>

              <div style={{
                fontSize: 11, fontWeight: 700, color: isActive ? stage.color : 'var(--text-muted)',
                textAlign: 'center', fontFamily: 'var(--font-heading)',
              }}>
                {stage.name}
              </div>

              {/* Arrow to next */}
              {i < stages.length - 1 && (
                <motion.div
                  animate={{ opacity: i < activeStage ? 1 : 0.2 }}
                  style={{
                    position: 'absolute', bottom: -20, right: -8,
                    fontSize: 16, color: stages[i + 1].color,
                  }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Current stage details */}
      <motion.div
        key={activeStage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginTop: 24, padding: 24, borderRadius: 16,
          background: `${s.color}08`, border: `2px solid ${s.color}30`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.detail}</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Size', value: `${s.size}MB`, bar: s.size / 100 },
              { label: 'Speed', value: `${s.speed}x`, bar: s.speed / 4 },
              { label: 'Accuracy', value: `${s.accuracy}%`, bar: s.accuracy / 100 },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{m.value}</div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 4, height: 6, overflow: 'hidden', marginTop: 4 }}>
                  <motion.div animate={{ width: `${m.bar * 100}%` }} style={{ height: '100%', background: s.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tradeoff visualization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Larger / Slower</span>
          <div style={{ width: 200, height: 8, background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)', borderRadius: 4, position: 'relative' }}>
            <motion.div
              animate={{ left: `${(1 - s.size / 100) * 100}%` }}
              transition={{ type: 'spring' }}
              style={{
                position: 'absolute', top: -6, width: 20, height: 20, borderRadius: '50%',
                background: s.color, border: '3px solid white', boxShadow: `0 2px 8px ${s.color}60`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Smaller / Faster</span>
        </div>
      </motion.div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={runOptimization}
          disabled={animating}
          style={{
            padding: '12px 32px', borderRadius: 12, border: 'none', cursor: animating ? 'not-allowed' : 'pointer',
            background: animating ? 'var(--border)' : 'linear-gradient(135deg, #f59e0b, #ec4899)',
            color: 'white', fontWeight: 700, fontSize: 14,
          }}
        >
          {animating ? 'Optimizing...' : 'Run Optimization Pipeline'}
        </motion.button>
      </div>
    </SectionBlock>
  )
}


/* ---- 4. Quality Dashboard ---- */
function QualityDashboard() {
  const [data, setData] = useState({
    defectRate: [2.1, 1.8, 2.3, 1.5, 2.8, 1.2, 0.9, 1.1, 0.8, 1.4, 0.7, 0.6],
    defectTypes: [
      { name: 'Scratch', count: 45, color: '#3b82f6' },
      { name: 'Crack', count: 28, color: '#ef4444' },
      { name: 'Pit', count: 15, color: '#f59e0b' },
      { name: 'Dent', count: 8, color: '#8b5cf6' },
      { name: 'Other', count: 4, color: '#6b7280' },
    ],
    shifts: [
      { name: 'Morning', defects: 32, total: 1200 },
      { name: 'Afternoon', defects: 41, total: 1150 },
      { name: 'Night', defects: 27, total: 980 },
    ],
  })
  const [alertActive, setAlertActive] = useState(false)
  const [time, setTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(t => t + 1)
      // Occasionally trigger alert
      if (Math.random() < 0.08) {
        setAlertActive(true)
        setTimeout(() => setAlertActive(false), 3000)
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const totalDefects = data.defectTypes.reduce((s, d) => s + d.count, 0)
  const lineH = 140
  const lineW = 300
  const maxRate = Math.max(...data.defectRate)

  // Pie chart angles
  let cumAngle = 0
  const pieSlices = data.defectTypes.map(d => {
    const angle = (d.count / totalDefects) * 360
    const start = cumAngle
    cumAngle += angle
    return { ...d, start, angle }
  })

  const polarToCart = (cx, cy, r, deg) => {
    const rad = (deg - 90) * Math.PI / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const arcPath = (cx, cy, r, startAngle, endAngle) => {
    const s = polarToCart(cx, cy, r, startAngle)
    const e = polarToCart(cx, cy, r, endAngle)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M${cx},${cy} L${s.x},${s.y} A${r},${r},0,${large},1,${e.x},${e.y} Z`
  }

  return (
    <SectionBlock icon="D" title="Quality Control Dashboard" color="#0ea5e9">
      <Neuron mood="happy" message="This is what a factory QC engineer sees every day. Real-time metrics, alerts, and trends all in one dashboard." size="small" />

      <div style={{
        background: '#0f172a', borderRadius: 20, padding: 24,
        border: '2px solid #1e293b', marginTop: 20,
      }}>
        {/* Dashboard header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
        }}>
          <div style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Quality Control Dashboard
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Alert indicator */}
            <AnimatePresence>
              {alertActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [1, 0.5, 1], scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ opacity: { repeat: Infinity, duration: 0.5 } }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, background: '#ef4444',
                    color: 'white', fontSize: 12, fontWeight: 700,
                  }}
                >
                  ALERT: Defect rate spike detected
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ color: '#64748b', fontSize: 12 }}>
              Live
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginLeft: 6, verticalAlign: 'middle' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Defect rate line chart */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Defect Rate Over Time (%)</div>
            <svg viewBox={`0 0 ${lineW} ${lineH}`} style={{ width: '100%' }}>
              {/* Grid */}
              {[0, 1, 2, 3].map(v => (
                <g key={v}>
                  <line x1={30} y1={lineH - 10 - (v / maxRate) * (lineH - 30)} x2={lineW - 10} y2={lineH - 10 - (v / maxRate) * (lineH - 30)} stroke="#334155" strokeWidth={1} strokeDasharray="3,3" />
                  <text x={25} y={lineH - 6 - (v / maxRate) * (lineH - 30)} textAnchor="end" fill="#64748b" fontSize={9}>{v}%</text>
                </g>
              ))}
              {/* Threshold line */}
              <line x1={30} y1={lineH - 10 - (2 / maxRate) * (lineH - 30)} x2={lineW - 10} y2={lineH - 10 - (2 / maxRate) * (lineH - 30)} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6,3" />
              <text x={lineW - 8} y={lineH - 14 - (2 / maxRate) * (lineH - 30)} fill="#ef4444" fontSize={8} textAnchor="end">Threshold</text>

              {/* Line path */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2 }}
                d={data.defectRate.map((v, i) => {
                  const x = 30 + (i / (data.defectRate.length - 1)) * (lineW - 40)
                  const y = lineH - 10 - (v / maxRate) * (lineH - 30)
                  return `${i === 0 ? 'M' : 'L'}${x},${y}`
                }).join(' ')}
                fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round"
              />
              {/* Dots */}
              {data.defectRate.map((v, i) => {
                const x = 30 + (i / (data.defectRate.length - 1)) * (lineW - 40)
                const y = lineH - 10 - (v / maxRate) * (lineH - 30)
                return (
                  <motion.circle
                    key={i}
                    initial={{ r: 0 }}
                    animate={{ r: 3 }}
                    transition={{ delay: i * 0.15 }}
                    cx={x} cy={y} fill={v > 2 ? '#ef4444' : '#3b82f6'}
                  />
                )
              })}
            </svg>
          </div>

          {/* Pie chart — defect type distribution */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Defect Type Distribution</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, flexShrink: 0 }}>
                {pieSlices.map((slice, i) => (
                  <motion.path
                    key={slice.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    d={arcPath(60, 60, 50, slice.start, slice.start + slice.angle - 0.5)}
                    fill={slice.color}
                    stroke="#1e293b"
                    strokeWidth={2}
                  />
                ))}
                <circle cx={60} cy={60} r={22} fill="#1e293b" />
                <text x={60} y={57} textAnchor="middle" fill="white" fontSize={14} fontWeight={800}>{totalDefects}</text>
                <text x={60} y={70} textAnchor="middle" fill="#64748b" fontSize={8}>total</text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.defectTypes.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                    <span style={{ color: '#94a3b8', minWidth: 60 }}>{d.name}</span>
                    <span style={{ color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>{d.count}</span>
                    <span style={{ color: '#64748b', fontSize: 10 }}>({(d.count / totalDefects * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shift comparison bar chart */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Shift Comparison</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 100, paddingTop: 10 }}>
              {data.shifts.map((shift, i) => {
                const rate = (shift.defects / shift.total * 100)
                const barH = rate * 20
                const colors = ['#3b82f6', '#f59e0b', '#8b5cf6']
                return (
                  <div key={shift.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: colors[i], fontFamily: 'monospace' }}>{rate.toFixed(1)}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: barH }}
                      transition={{ delay: i * 0.2, type: 'spring' }}
                      style={{
                        width: '70%', borderRadius: '6px 6px 0 0',
                        background: `linear-gradient(180deg, ${colors[i]}, ${colors[i]}80)`,
                      }}
                    />
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{shift.name}</span>
                    <span style={{ fontSize: 9, color: '#64748b' }}>{shift.total} pcs</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary KPIs */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Total Output', value: '3,330', sub: 'sheets today', color: '#3b82f6' },
              { label: 'Defect Rate', value: '1.2%', sub: 'below target', color: '#10b981' },
              { label: 'Avg Response', value: '18ms', sub: 'inference time', color: '#f59e0b' },
              { label: 'Uptime', value: '99.7%', sub: 'this month', color: '#8b5cf6' },
            ].map(kpi => (
              <div key={kpi.label} style={{ textAlign: 'center', padding: 8, borderRadius: 10, background: `${kpi.color}10`, border: `1px solid ${kpi.color}20` }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{kpi.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: kpi.color, fontFamily: 'monospace' }}>{kpi.value}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionBlock>
  )
}


/* ---- 5. ROI Calculator ---- */
function ROICalculator() {
  const [inspectors, setInspectors] = useState(4)
  const [salary, setSalary] = useState(40000)
  const [missRate, setMissRate] = useState(5)
  const [volume, setVolume] = useState(500000)
  const [showResults, setShowResults] = useState(false)

  const manualCost = inspectors * salary
  const aiCost = 50000 + 12000 // hardware + annual cloud/maintenance
  const costSaving = manualCost - aiCost
  const manualMisses = Math.round(volume * (missRate / 100))
  const aiMisses = Math.round(volume * 0.002) // 0.2% miss rate
  const defectReduction = manualMisses - aiMisses
  const costPerDefect = 50 // avg cost of missed defect
  const qualitySaving = defectReduction * costPerDefect
  const totalSaving = costSaving + qualitySaving
  const roi = aiCost > 0 ? ((totalSaving / aiCost) * 100).toFixed(0) : 0

  const calculate = () => setShowResults(true)

  return (
    <InteractiveDemo title="ROI Calculator" instruction="Enter your factory numbers to see the business case for AI-powered inspection.">
      <HindiExplainer
        concept="ROI — निवेश पर लाभ"
        english="Return on Investment"
        explanation="AI सिस्टम लगाने में पैसा लगता है — कैमरे, कंप्यूटर, सॉफ़्टवेयर। ROI बताता है कि कितने समय में ये ख़र्चा वापस आ जाएगा और फ़ायदा शुरू होगा।"
        example="अगर AI सिस्टम में ₹20 लाख लगे और हर महीने ₹3 लाख की बचत हो (कम inspectors + कम defects), तो ~7 महीने में पैसा वापस और उसके बाद सब फ़ायदा!"
        terms={[
          { hindi: 'पेबैक पीरियड', english: 'Payback Period', meaning: 'कितने महीनों में निवेश वापस आएगा' },
          { hindi: 'बचत', english: 'Savings', meaning: 'AI से होने वाली सालाना बचत' },
          { hindi: 'गुणवत्ता सुधार', english: 'Quality Improvement', meaning: 'कम defects = कम warranty claims = ज़्यादा ग्राहक संतुष्टि' },
        ]}
      />

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {/* Input panel */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
            Your Factory
          </div>

          {[
            { label: 'Manual Inspectors', value: inspectors, set: setInspectors, min: 1, max: 20, step: 1, unit: 'people' },
            { label: 'Avg Inspector Salary', value: salary, set: setSalary, min: 20000, max: 80000, step: 5000, unit: '$/year' },
            { label: 'Manual Miss Rate', value: missRate, set: setMissRate, min: 1, max: 15, step: 0.5, unit: '%' },
            { label: 'Annual Production', value: volume, set: setVolume, min: 100000, max: 2000000, step: 50000, unit: 'units' },
          ].map(input => (
            <div key={input.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{input.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
                  {input.unit === '$/year' ? `$${input.value.toLocaleString()}` : input.unit === '%' ? `${input.value}%` : input.value.toLocaleString()} {input.unit !== '$/year' && input.unit !== '%' ? input.unit : ''}
                </span>
              </div>
              <input
                type="range" min={input.min} max={input.max} step={input.step}
                value={input.value} onChange={e => { input.set(+e.target.value); setShowResults(false) }}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={calculate}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
              fontWeight: 700, fontSize: 16, cursor: 'pointer',
              boxShadow: '0 4px 20px #10b98140',
            }}
          >
            Calculate ROI
          </motion.button>
        </div>

        {/* Results panel */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Before / After comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ padding: 16, borderRadius: 14, background: '#ef444410', border: '1px solid #ef444430', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase' }}>Before (Manual)</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }}>${manualCost.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inspectors} inspectors/year</div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>~{manualMisses.toLocaleString()} missed defects</div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 14, background: '#10b98110', border: '1px solid #10b98130', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981', textTransform: 'uppercase' }}>After (AI)</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>${aiCost.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>hardware + maintenance</div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#10b981' }}>~{aiMisses.toLocaleString()} missed defects</div>
                  </div>
                </div>

                {/* Savings breakdown */}
                {[
                  { label: 'Labor Cost Savings', value: costSaving, color: '#3b82f6' },
                  { label: 'Quality Improvement', value: qualitySaving, color: '#f59e0b' },
                  { label: 'Total Annual Savings', value: totalSaving, color: '#10b981' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', marginBottom: 8, borderRadius: 10,
                      background: `${item.color}08`, border: `1px solid ${item.color}25`,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: item.color, fontFamily: 'monospace' }}>
                      ${item.value.toLocaleString()}
                    </span>
                  </motion.div>
                ))}

                {/* ROI badge */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  style={{
                    marginTop: 16, padding: 20, borderRadius: 16, textAlign: 'center',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 8px 30px #10b98140',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>
                    Return on Investment
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: 'white', fontFamily: 'monospace' }}>
                    {roi}%
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                    Payback in ~{Math.max(1, Math.round(12 / (totalSaving / aiCost)))} months
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showResults && (
            <div style={{
              height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12, color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: 40, opacity: 0.3 }}>$</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Adjust inputs and click Calculate</div>
            </div>
          )}
        </div>
      </div>
    </InteractiveDemo>
  )
}


/* ---- 6. Case Studies ---- */
function CaseStudies() {
  const [expanded, setExpanded] = useState(null)

  const cases = [
    {
      title: 'Steel Mill', subtitle: 'Surface Defect Detection',
      color: '#3b82f6', icon: 'S',
      problem: 'Manual inspection of hot-rolled steel coils missed 4-6% of surface defects, leading to customer complaints and costly recalls.',
      solution: 'Deployed YOLOv8-based system with line-scan cameras at 15m/s belt speed. Edge inference on NVIDIA Jetson AGX with TensorRT optimization.',
      results: [
        { metric: 'Detection Rate', before: '94%', after: '99.5%', color: '#10b981' },
        { metric: 'Inspection Speed', before: '2 sec/sheet', after: '22ms/sheet', color: '#3b82f6' },
        { metric: 'Annual Savings', before: '-', after: '$2.1M', color: '#f59e0b' },
        { metric: 'Defect Classes', before: '3', after: '7', color: '#8b5cf6' },
      ],
    },
    {
      title: 'PCB Manufacturing', subtitle: 'Solder Joint Inspection',
      color: '#10b981', icon: 'P',
      problem: 'AOI (Automated Optical Inspection) machines had a 15% false positive rate, causing unnecessary rework and production slowdowns.',
      solution: 'Added a CNN-based second-stage classifier that re-examines AOI flagged defects. Reduced false alarms by 85% while maintaining true defect capture.',
      results: [
        { metric: 'False Positive Rate', before: '15%', after: '2.2%', color: '#10b981' },
        { metric: 'Throughput', before: '800 boards/hr', after: '1,100 boards/hr', color: '#3b82f6' },
        { metric: 'Rework Reduction', before: '-', after: '72%', color: '#f59e0b' },
        { metric: 'ROI Payback', before: '-', after: '4 months', color: '#8b5cf6' },
      ],
    },
    {
      title: 'Automotive Paint Shop', subtitle: 'Paint Defect Detection',
      color: '#f59e0b', icon: 'A',
      problem: 'Paint defects (orange peel, runs, craters) detected only at final inspection. 60% of defects were caught too late for efficient rework.',
      solution: 'Installed 12 high-resolution cameras in paint booth exit tunnel. Real-time defect detection enables immediate rework in wet paint zone.',
      results: [
        { metric: 'Early Detection', before: '40%', after: '95%', color: '#10b981' },
        { metric: 'Rework Cost', before: '$850/car', after: '$120/car', color: '#3b82f6' },
        { metric: 'Cycle Time Impact', before: '+45 min', after: '+5 min', color: '#f59e0b' },
        { metric: 'Customer Complaints', before: '100%', after: '-88%', color: '#8b5cf6' },
      ],
    },
  ]

  return (
    <SectionBlock icon="*" title="Real-World Case Studies" color="#ec4899">
      <Neuron mood="happy" message="AI vision inspection is already transforming factories worldwide. Here are three real industry success stories." size="small" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
        {cases.map((cs, idx) => {
          const isOpen = expanded === idx
          return (
            <motion.div
              key={cs.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              style={{
                borderRadius: 18, overflow: 'hidden',
                border: `2px solid ${isOpen ? cs.color : 'var(--border)'}`,
                background: 'var(--bg-card)',
                cursor: 'pointer',
                boxShadow: isOpen ? `0 8px 30px ${cs.color}20` : 'none',
              }}
            >
              {/* Card header */}
              <motion.div
                onClick={() => setExpanded(isOpen ? null : idx)}
                whileHover={{ background: `${cs.color}08` }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px',
                }}
              >
                <motion.div
                  animate={{
                    background: isOpen ? cs.color : `${cs.color}20`,
                    color: isOpen ? 'white' : cs.color,
                  }}
                  style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, fontWeight: 900,
                  }}
                >
                  {cs.icon}
                </motion.div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {cs.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cs.subtitle}</div>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  style={{ fontSize: 20, color: cs.color, fontWeight: 700 }}
                >
                  V
                </motion.div>
              </motion.div>

              {/* Expanded content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 24px 24px' }}>
                      {/* Problem / Solution */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div style={{ padding: 16, borderRadius: 12, background: '#ef444408', border: '1px solid #ef444425' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8 }}>
                            The Problem
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{cs.problem}</div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 12, background: '#10b98108', border: '1px solid #10b98125' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 8 }}>
                            The Solution
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{cs.solution}</div>
                        </div>
                      </div>

                      {/* Results metrics */}
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
                        Results
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                        {cs.results.map((r, ri) => (
                          <motion.div
                            key={r.metric}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ri * 0.15 }}
                            style={{
                              textAlign: 'center', padding: 12, borderRadius: 12,
                              background: `${r.color}08`, border: `1px solid ${r.color}25`,
                            }}
                          >
                            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                              {r.metric}
                            </div>
                            {r.before !== '-' && (
                              <div style={{ fontSize: 12, color: '#ef4444', textDecoration: 'line-through', marginBottom: 2, fontFamily: 'monospace' }}>
                                {r.before}
                              </div>
                            )}
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: ri * 0.15 + 0.3, type: 'spring' }}
                              style={{ fontSize: 18, fontWeight: 900, color: r.color, fontFamily: 'monospace' }}
                            >
                              {r.after}
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </SectionBlock>
  )
}


/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic8() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <ProductionLine />
      <EdgeVsCloud />
      <ModelOptimization />
      <QualityDashboard />
      <ROICalculator />
      <CaseStudies />
    </div>
  )
}
