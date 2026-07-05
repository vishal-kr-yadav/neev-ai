import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 2 — The Sensor Universe
   How IoT sensors monitor machines 24/7
================================================================ */

/* ─── Section 1: The Five Senses of a Machine ─────────────────── */
function MachineSenses() {
  const [activeSensor, setActiveSensor] = useState(null)
  const [waveOffset, setWaveOffset] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setWaveOffset(o => (o + 2) % 360), 50)
    return () => clearInterval(id)
  }, [])

  const sensors = [
    {
      id: 'vibration',
      label: 'Vibration',
      sublabel: 'Accelerometer',
      icon: '〰️',
      color: '#6366f1',
      pos: { top: '18%', left: '22%' },
      desc: 'Measures mechanical oscillation in mm/s or g. Bearing wear creates characteristic frequency spikes detectable weeks before failure.',
      detail: <VibrationViz waveOffset={waveOffset} />,
    },
    {
      id: 'temperature',
      label: 'Temperature',
      sublabel: 'Thermocouple',
      icon: '🌡️',
      color: '#ef4444',
      pos: { top: '12%', left: '55%' },
      desc: 'Tracks heat buildup in bearings, windings, and housings. Baseline 65 °C — warning at 85 °C — critical at 95 °C.',
      detail: <TemperatureGauge />,
    },
    {
      id: 'pressure',
      label: 'Pressure',
      sublabel: 'Transducer',
      icon: '🔵',
      color: '#0ea5e9',
      pos: { top: '55%', left: '68%' },
      desc: 'Measures fluid pressure in PSI/bar. Drops reveal leaks; spikes indicate blockages or cavitation.',
      detail: <PressureGauge />,
    },
    {
      id: 'current',
      label: 'Current Draw',
      sublabel: 'CT Sensor',
      icon: '⚡',
      color: '#f59e0b',
      pos: { top: '62%', left: '28%' },
      desc: 'Measures amperage drawn by the motor. Rising current = declining motor efficiency, often preceding failure.',
      detail: <CurrentMeter />,
    },
    {
      id: 'acoustic',
      label: 'Sound',
      sublabel: 'Acoustic Sensor',
      icon: '🔊',
      color: '#10b981',
      pos: { top: '38%', left: '10%' },
      desc: 'Ultrasonic microphone captures 20 kHz–100 kHz range. Unusual harmonics reveal cavitation, friction, and bearing defects invisible to the ear.',
      detail: <AcousticSpectrum waveOffset={waveOffset} />,
    },
  ]

  const active = sensors.find(s => s.id === activeSensor)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Pump diagram */}
        <div style={{ position: 'relative', minHeight: 320 }}>
          {/* Pump body */}
          <svg width="100%" viewBox="0 0 320 260" style={{ display: 'block' }}>
            {/* Pipe left */}
            <rect x="0" y="105" width="80" height="30" rx="4" fill="#475569" />
            {/* Pipe right */}
            <rect x="240" y="105" width="80" height="30" rx="4" fill="#475569" />
            {/* Pump casing */}
            <ellipse cx="160" cy="120" rx="82" ry="82" fill="#334155" />
            <ellipse cx="160" cy="120" rx="68" ry="68" fill="#1e293b" />
            {/* Impeller */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.rect
                key={i}
                x={155}
                y={60}
                width={10}
                height={38}
                rx={3}
                fill="#6366f1"
                style={{ originX: '50%', originY: '100%' }}
                animate={{ rotate: waveOffset * 2 }}
                transformOrigin="160px 120px"
                transform={`rotate(${angle} 160 120)`}
              />
            ))}
            <circle cx="160" cy="120" r="16" fill="#475569" />
            <circle cx="160" cy="120" r="8" fill="#94a3b8" />
            {/* Motor */}
            <rect x="170" y="158" width="80" height="44" rx="8" fill="#374151" />
            <text x="210" y="185" textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="600">MOTOR</text>
            {/* Base */}
            <rect x="60" y="205" width="200" height="14" rx="4" fill="#1e3a5f" />
          </svg>

          {/* Sensor pulse markers */}
          {sensors.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSensor(activeSensor === s.id ? null : s.id)}
              style={{
                position: 'absolute',
                top: s.pos.top,
                left: s.pos.left,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: sensors.indexOf(s) * 0.25 }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: activeSensor === s.id ? s.color : `${s.color}88`,
                  border: `2px solid ${s.color}`,
                  boxShadow: activeSensor === s.id ? `0 0 12px ${s.color}` : 'none',
                }}
              />
            </button>
          ))}
        </div>

        {/* Sensor list + detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sensors.map(s => (
            <motion.button
              key={s.id}
              onClick={() => setActiveSensor(activeSensor === s.id ? null : s.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 12,
                background: activeSensor === s.id ? `${s.color}18` : 'var(--bg-secondary)',
                border: `1.5px solid ${activeSensor === s.id ? s.color : 'var(--border)'}`,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.sublabel}</div>
              </div>
              <motion.div
                animate={{ rotate: activeSensor === s.id ? 90 : 0 }}
                style={{ color: 'var(--text-secondary)', fontSize: 16 }}
              >
                ›
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden', marginTop: 20 }}
          >
            <div style={{
              background: `${active.color}0c`,
              border: `1.5px solid ${active.color}44`,
              borderRadius: 18,
              padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{active.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
                    {active.label}
                    <span style={{ fontSize: 13, fontWeight: 500, color: active.color, marginLeft: 8 }}>
                      ({active.sublabel})
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{active.desc}</div>
                </div>
              </div>
              {active.detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function VibrationViz({ waveOffset }) {
  const points = Array.from({ length: 80 }, (_, i) => {
    const x = (i / 79) * 100
    const normal = Math.sin((i + waveOffset * 0.5) * 0.35) * 8 + Math.sin((i + waveOffset * 0.3) * 0.8) * 3
    const degraded = Math.sin((i + waveOffset * 0.5) * 0.35) * 12 + Math.sin((i + waveOffset * 0.3) * 0.8) * 6 + (i % 14 === 0 ? 25 : 0)
    return { x, normal, degraded }
  })

  const toPath = (pts, key, offsetY) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${offsetY + p[key]}`).join(' ')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {[
        { key: 'normal', label: 'Normal Bearing', color: '#10b981', offsetY: 30 },
        { key: 'degraded', label: 'Degraded Bearing', color: '#ef4444', offsetY: 30 },
      ].map(({ key, label, color, offsetY }) => (
        <div key={key}>
          <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>{label}</div>
          <svg viewBox="0 0 100 60" style={{ width: '100%', height: 80 }}>
            <line x1="0" y1="30" x2="100" y2="30" stroke="#475569" strokeWidth="0.5" />
            <path d={toPath(points, key, offsetY)} fill="none" stroke={color} strokeWidth="1.2" />
          </svg>
        </div>
      ))}
    </div>
  )
}

function TemperatureGauge() {
  const [temp, setTemp] = useState(65)
  useEffect(() => {
    const id = setInterval(() => setTemp(t => {
      const next = t + (Math.random() - 0.4) * 0.5
      return Math.max(60, Math.min(98, next))
    }), 600)
    return () => clearInterval(id)
  }, [])

  const pct = (temp - 50) / (100 - 50)
  const color = temp < 85 ? '#10b981' : temp < 95 ? '#f59e0b' : '#ef4444'
  const label = temp < 85 ? 'Normal' : temp < 95 ? 'Warning' : 'Critical'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: 90, height: 90 }}>
        <svg viewBox="0 0 90 90" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <circle cx="45" cy="45" r="36" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="45" cy="45" r="36"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${pct * 226} 226`}
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
            style={{ transition: 'all 0.6s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color }}>{temp.toFixed(0)}°</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>°C</div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {[{ v: 65, c: '#10b981', l: 'Baseline' }, { v: 85, c: '#f59e0b', l: 'Warning' }, { v: 95, c: '#ef4444', l: 'Critical' }].map(({ v, c, l }) => (
          <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l}: {v}°C</span>
          </div>
        ))}
        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color }}>Status: {label}</div>
      </div>
    </div>
  )
}

function PressureGauge() {
  const [psi, setPsi] = useState(105)
  useEffect(() => {
    const id = setInterval(() => setPsi(p => Math.max(70, Math.min(150, p + (Math.random() - 0.48) * 1.5))), 700)
    return () => clearInterval(id)
  }, [])

  const pct = (psi - 70) / (150 - 70)
  const color = psi > 130 ? '#ef4444' : psi < 85 ? '#f59e0b' : '#0ea5e9'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 90, height: 90 }}>
        <svg viewBox="0 0 90 90" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <circle cx="45" cy="45" r="36" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle cx="45" cy="45" r="36" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${pct * 226} 226`} strokeLinecap="round"
            transform="rotate(-90 45 45)" style={{ transition: 'all 0.6s' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color }}>{psi.toFixed(0)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>PSI</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <div>Normal: 90–130 PSI</div>
        <div style={{ color: '#f59e0b' }}>Low (&lt;85): Possible leak</div>
        <div style={{ color: '#ef4444' }}>High (&gt;130): Blockage</div>
        <div style={{ marginTop: 6, fontWeight: 700, color }}>
          {psi > 130 ? 'Blockage detected' : psi < 85 ? 'Leak suspected' : 'Normal flow'}
        </div>
      </div>
    </div>
  )
}

function CurrentMeter() {
  const [amps, setAmps] = useState(12)
  useEffect(() => {
    const id = setInterval(() => setAmps(a => Math.max(10, Math.min(18, a + (Math.random() - 0.45) * 0.3))), 500)
    return () => clearInterval(id)
  }, [])

  const efficiency = Math.max(0, Math.min(100, Math.round(100 - (amps - 12) * 10)))
  const color = amps < 13 ? '#10b981' : amps < 15 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ textAlign: 'center', minWidth: 90 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color }}>
          {amps.toFixed(1)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Amps</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Motor Efficiency</div>
        <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${efficiency}%` }}
            style={{ height: '100%', borderRadius: 6, background: color, transition: 'background 0.3s' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          <span>0%</span>
          <span style={{ fontWeight: 700, color }}>{efficiency}%</span>
          <span>100%</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
          Nominal: 12A · Rising current = degrading motor
        </div>
      </div>
    </div>
  )
}

function AcousticSpectrum({ waveOffset }) {
  const bars = Array.from({ length: 32 }, (_, i) => {
    const base = Math.exp(-((i - 6) ** 2) / 8) * 60 + Math.exp(-((i - 18) ** 2) / 12) * 35
    const noise = Math.random() * 10
    const anomaly = i === 24 ? 55 : i === 25 ? 40 : 0
    return Math.min(90, base + noise + anomaly)
  })

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
        Frequency Spectrum (0–100 kHz) — spike at ~75 kHz = bearing defect
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
        {bars.map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: `${h + Math.sin((waveOffset + i * 10) * 0.04) * 5}%` }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1,
              borderRadius: '2px 2px 0 0',
              background: i >= 23 && i <= 25 ? '#ef4444' : '#10b981',
              opacity: i >= 23 && i <= 25 ? 1 : 0.7,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
        <span>0 kHz</span>
        <span style={{ color: '#ef4444', fontWeight: 700 }}>Anomaly ↑</span>
        <span>100 kHz</span>
      </div>
    </div>
  )
}

/* ─── Section 2: Live Sensor Data Simulation ──────────────────── */
function LiveSensorDashboard() {
  const [mode, setMode] = useState('normal')
  const [tick, setTick] = useState(0)
  const historyLen = 40

  const histRef = useRef({
    vibration: Array(historyLen).fill(2.5),
    temperature: Array(historyLen).fill(65),
    pressure: Array(historyLen).fill(105),
    current: Array(historyLen).fill(12),
  })

  useEffect(() => {
    const id = setInterval(() => {
      const isFailure = mode === 'prefailure'
      const h = histRef.current
      h.vibration = [...h.vibration.slice(1), clamp(
        h.vibration[h.vibration.length - 1] + (Math.random() - 0.5) * (isFailure ? 2.5 : 0.6) + (isFailure && Math.random() > 0.85 ? 8 : 0),
        isFailure ? 1.5 : 1.5, isFailure ? 22 : 5
      )]
      h.temperature = [...h.temperature.slice(1), clamp(
        h.temperature[h.temperature.length - 1] + (isFailure ? 0.18 : 0.04) + (Math.random() - 0.5) * 0.3,
        62, isFailure ? 95 : 74
      )]
      h.pressure = [...h.pressure.slice(1), clamp(
        h.pressure[h.pressure.length - 1] + (Math.random() - 0.5) * (isFailure ? 4 : 1.5),
        isFailure ? 85 : 100, isFailure ? 130 : 112
      )]
      h.current = [...h.current.slice(1), clamp(
        h.current[h.current.length - 1] + (isFailure ? 0.05 : 0.01) + (Math.random() - 0.5) * 0.2,
        11, isFailure ? 17 : 13
      )]
      setTick(t => t + 1)
    }, 500)
    return () => clearInterval(id)
  }, [mode])

  const h = histRef.current
  const charts = [
    { label: 'Vibration', unit: 'mm/s', data: h.vibration, color: '#6366f1', min: 0, max: 25 },
    { label: 'Temperature', unit: '°C', data: h.temperature, color: '#ef4444', min: 55, max: 100 },
    { label: 'Pressure', unit: 'PSI', data: h.pressure, color: '#0ea5e9', min: 80, max: 140 },
    { label: 'Current', unit: 'A', data: h.current, color: '#f59e0b', min: 9, max: 20 },
  ]

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
        {[
          { id: 'normal', label: 'Normal Operation', icon: '✅' },
          { id: 'prefailure', label: 'Pre-Failure Mode', icon: '⚠️' },
        ].map(m => (
          <motion.button
            key={m.id}
            onClick={() => setMode(m.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '10px 22px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              background: mode === m.id
                ? (m.id === 'normal' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)')
                : 'var(--bg-secondary)',
              color: mode === m.id ? '#fff' : 'var(--text-secondary)',
              border: `1.5px solid ${mode === m.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {m.icon} {m.label}
          </motion.button>
        ))}
      </div>

      {mode === 'prefailure' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fef2f2', border: '1.5px solid #fecaca',
            borderRadius: 12, padding: '12px 18px', marginBottom: 20,
            fontSize: 14, color: '#991b1b', fontWeight: 600,
          }}
        >
          Simulating bearing degradation — vibration increasing, temperature climbing, current rising
        </motion.div>
      )}

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {charts.map(ch => (
          <MiniLineChart key={ch.label} {...ch} />
        ))}
      </div>
    </div>
  )
}

function MiniLineChart({ label, unit, data, color, min, max }) {
  const w = 300
  const h = 80
  const pad = 8
  const innerW = w - pad * 2
  const innerH = h - pad * 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * innerW
    const y = pad + innerH - ((v - min) / (max - min)) * innerH
    return `${x},${y}`
  }).join(' ')

  const current = data[data.length - 1]

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${color}33`,
      borderRadius: 14,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
          {current.toFixed(1)} {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 80 }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polyline
          points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`}
          fill={`url(#grad-${label})`}
          stroke="none"
        />
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {/* Current dot */}
        {data.length > 0 && (() => {
          const last = points.split(' ').pop().split(',')
          return <circle cx={last[0]} cy={last[1]} r="4" fill={color} />
        })()}
      </svg>
    </div>
  )
}

/* ─── Section 3: Sensor Placement ────────────────────────────── */
function SensorPlacement() {
  const [activeEquip, setActiveEquip] = useState(null)

  const equipment = [
    {
      id: 'cnc',
      label: 'CNC Machine',
      icon: '🔩',
      color: '#6366f1',
      pos: { top: '15%', left: '10%' },
      sensors: [
        { point: 'Spindle Bearing', type: 'Vibration', freq: '25.6 kHz', detects: 'Tool wear, chatter, imbalance' },
        { point: 'Feed Drive Motor', type: 'Current', freq: '1 kHz', detects: 'Axis load, mechanical binding' },
        { point: 'Coolant System', type: 'Temperature', freq: '1 Hz', detects: 'Thermal creep, overheating' },
      ],
    },
    {
      id: 'pump',
      label: 'Industrial Pump',
      icon: '💧',
      color: '#0ea5e9',
      pos: { top: '15%', left: '42%' },
      sensors: [
        { point: 'Drive-end Bearing', type: 'Vibration', freq: '51.2 kHz', detects: 'Bearing defects, imbalance' },
        { point: 'Non-drive Bearing', type: 'Vibration', freq: '25.6 kHz', detects: 'Misalignment, looseness' },
        { point: 'Pump Casing', type: 'Temperature', freq: '1 Hz', detects: 'Seal failure, cavitation heat' },
        { point: 'Discharge Line', type: 'Pressure', freq: '10 Hz', detects: 'Blockage, cavitation, leak' },
      ],
    },
    {
      id: 'hvac',
      label: 'HVAC Compressor',
      icon: '❄️',
      color: '#10b981',
      pos: { top: '15%', left: '74%' },
      sensors: [
        { point: 'Compressor Body', type: 'Vibration', freq: '12.8 kHz', detects: 'Valve defects, piston wear' },
        { point: 'Suction Line', type: 'Pressure', freq: '5 Hz', detects: 'Refrigerant shortage, filter clog' },
        { point: 'Motor Winding', type: 'Temperature', freq: '1 Hz', detects: 'Insulation degradation' },
        { point: 'Power Supply', type: 'Current', freq: '1 kHz', detects: 'Motor efficiency decline' },
      ],
    },
    {
      id: 'conveyor',
      label: 'Conveyor Motor',
      icon: '🏭',
      color: '#f59e0b',
      pos: { top: '58%', left: '22%' },
      sensors: [
        { point: 'Drive Pulley Bearing', type: 'Vibration', freq: '25.6 kHz', detects: 'Belt tension issues, bearing wear' },
        { point: 'Motor Housing', type: 'Temperature', freq: '1 Hz', detects: 'Overload, cooling failure' },
        { point: 'Drive Motor', type: 'Current', freq: '1 kHz', detects: 'Belt slip, jamming' },
        { point: 'Belt Tension', type: 'Acoustic', freq: '100 kHz', detects: 'Belt cracks, splice failure' },
      ],
    },
    {
      id: 'hydraulic',
      label: 'Hydraulic Press',
      icon: '🔧',
      color: '#ef4444',
      pos: { top: '58%', left: '60%' },
      sensors: [
        { point: 'Hydraulic Pump', type: 'Vibration', freq: '51.2 kHz', detects: 'Cavitation, piston damage' },
        { point: 'Hydraulic Lines', type: 'Pressure', freq: '100 Hz', detects: 'Seal leaks, valve sticking' },
        { point: 'Fluid Reservoir', type: 'Temperature', freq: '1 Hz', detects: 'Oil degradation, heat exchanger failure' },
        { point: 'Control Valve', type: 'Acoustic', freq: '100 kHz', detects: 'Internal leakage, cavitation' },
      ],
    },
  ]

  const ae = equipment.find(e => e.id === activeEquip)

  return (
    <div>
      {/* Factory floor */}
      <div style={{ position: 'relative', background: 'var(--bg-secondary)', borderRadius: 16, padding: 20, minHeight: 260, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600 }}>
          FACTORY FLOOR — Click equipment to see sensor placement
        </div>
        {/* Floor grid lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="none">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 14}%`} x2="100%" y2={`${i * 14}%`} stroke="#ffffff08" strokeWidth="1" />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`} x1={`${i * 9}%`} y1="0" x2={`${i * 9}%`} y2="100%" stroke="#ffffff08" strokeWidth="1" />
          ))}
        </svg>

        {equipment.map(eq => (
          <button
            key={eq.id}
            onClick={() => setActiveEquip(activeEquip === eq.id ? null : eq.id)}
            style={{
              position: 'absolute',
              top: eq.pos.top,
              left: eq.pos.left,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'center',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.12 }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                background: activeEquip === eq.id ? eq.color : `${eq.color}22`,
                border: `2px solid ${activeEquip === eq.id ? eq.color : `${eq.color}55`}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                boxShadow: activeEquip === eq.id ? `0 4px 20px ${eq.color}44` : 'none',
              }}
            >
              <span>{eq.icon}</span>
            </motion.div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 70, lineHeight: 1.2 }}>
              {eq.label}
            </div>
            {/* Pulse rings when active */}
            {activeEquip === eq.id && (
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: 60, height: 60,
                  borderRadius: 14,
                  border: `2px solid ${eq.color}`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Sensor detail */}
      <AnimatePresence>
        {ae && (
          <motion.div
            key={ae.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              background: `${ae.color}0c`,
              border: `1.5px solid ${ae.color}44`,
              borderRadius: 18,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 26 }}>{ae.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {ae.label} — Sensor Placement
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {ae.sensors.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: ae.color }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: ae.color }}>{s.type}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{s.point}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Sample rate: {s.freq}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Detects: {s.detects}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Section 4: Data Volume Calculator ──────────────────────── */
function DataVolumeCalculator() {
  const [sensors, setSensors] = useState(20)
  const [rpm, setRpm] = useState(10)
  const [dpp, setDpp] = useState(4)
  const [days, setDays] = useState(90)

  const pointsPerDay = sensors * rpm * 60 * 24 * dpp
  const pointsPerMonth = pointsPerDay * 30
  const bytesPerPoint = 8 // float64
  const totalBytes = pointsPerDay * days * bytesPerPoint
  const totalMB = totalBytes / 1e6
  const totalGB = totalBytes / 1e9

  const formatStorage = (gb) => {
    if (gb < 1) return `${(gb * 1000).toFixed(0)} MB`
    if (gb < 1000) return `${gb.toFixed(2)} GB`
    return `${(gb / 1000).toFixed(2)} TB`
  }

  const cabinetsPerGB = 0.15 // 1 filing cabinet ≈ 6.7 GB
  const cabinets = Math.max(1, Math.round(totalGB * cabinetsPerGB))

  const sliders = [
    { label: 'Number of Sensors', value: sensors, set: setSensors, min: 1, max: 100, unit: 'sensors', color: '#6366f1' },
    { label: 'Readings per Minute', value: rpm, set: setRpm, min: 1, max: 60, unit: '/min', color: '#0ea5e9' },
    { label: 'Data Points per Reading', value: dpp, set: setDpp, min: 1, max: 10, unit: 'pts', color: '#10b981' },
    { label: 'Days of Retention', value: days, set: setDays, min: 30, max: 365, unit: 'days', color: '#f59e0b' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sliders.map(s => (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value} {s.unit}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              value={s.value}
              onChange={e => s.set(Number(e.target.value))}
              style={{ width: '100%', accentColor: s.color }}
            />
          </div>
        ))}
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Data points / day', value: pointsPerDay.toLocaleString(), color: '#6366f1' },
          { label: 'Data points / month', value: pointsPerMonth.toLocaleString(), color: '#0ea5e9' },
          { label: 'Total storage needed', value: formatStorage(totalGB), color: '#10b981', big: true },
        ].map(r => (
          <div key={r.label} style={{
            background: `${r.color}0f`,
            border: `1px solid ${r.color}33`,
            borderRadius: 14,
            padding: '14px 18px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: r.big ? 28 : 22, fontWeight: 900, color: r.color, fontVariantNumeric: 'tabular-nums' }}>
              {r.value}
            </div>
          </div>
        ))}

        {/* Visual scale */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '14px 18px', marginTop: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Physical scale analogy
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from({ length: Math.min(cabinets, 20) }, (_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                style={{ fontSize: 22 }}
              >
                🗄️
              </motion.span>
            ))}
            {cabinets > 20 && (
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center' }}>
                +{(cabinets - 20).toLocaleString()} more filing cabinets
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
            Each 🗄️ ≈ ~6.7 GB · {cabinets.toLocaleString()} total cabinets
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Section 5: Normal vs Abnormal Patterns ─────────────────── */
function PatternLibrary() {
  const [selected, setSelected] = useState(0)

  const patterns = [
    {
      id: 'healthy',
      label: 'Healthy',
      icon: '✅',
      color: '#10b981',
      description: 'Steady, low-amplitude vibration. Bearing runs cool and smooth.',
      feature: 'Low, consistent amplitude — no dominant frequencies',
      waveformFn: (i, t) => Math.sin(i * 0.3 + t) * 5 + Math.random() * 2,
      spectrumFn: (i) => Math.exp(-i * 0.1) * 30 + Math.random() * 5,
    },
    {
      id: 'imbalance',
      label: 'Imbalance',
      icon: '🌀',
      color: '#6366f1',
      description: 'Mass distribution uneven — creates sinusoidal vibration at 1x rotation speed.',
      feature: 'Strong 1x peak in frequency spectrum',
      waveformFn: (i, t) => Math.sin(i * 0.28 + t) * 18 + Math.random() * 3,
      spectrumFn: (i) => (i === 4 ? 75 : i === 8 ? 12 : 0) + Math.exp(-i * 0.15) * 8 + Math.random() * 4,
    },
    {
      id: 'bearing',
      label: 'Bearing Defect',
      icon: '⚙️',
      color: '#ef4444',
      description: 'Periodic impacts at bearing defect frequency. Inner/outer race pitting.',
      feature: 'Periodic spike train (BPFI/BPFO) + sidebands',
      waveformFn: (i, t) => Math.sin(i * 0.3 + t) * 6 + (i % 10 === 0 ? 30 : 0) + Math.random() * 4,
      spectrumFn: (i) => ([3, 6, 9, 12].includes(i) ? 45 - i * 2 : 0) + Math.random() * 5,
    },
    {
      id: 'misalignment',
      label: 'Misalignment',
      icon: '↔️',
      color: '#f59e0b',
      description: 'Shaft/coupling misaligned — vibration at 2x rotation frequency dominates.',
      feature: '2x peak dominates, high axial vibration',
      waveformFn: (i, t) => Math.sin(i * 0.56 + t * 2) * 20 + Math.sin(i * 0.28 + t) * 8 + Math.random() * 3,
      spectrumFn: (i) => (i === 4 ? 30 : i === 8 ? 65 : 0) + Math.exp(-i * 0.12) * 6 + Math.random() * 4,
    },
    {
      id: 'looseness',
      label: 'Looseness',
      icon: '💥',
      color: '#ec4899',
      description: 'Mechanical looseness — bolt or mounting. Broadband, chaotic, high noise floor.',
      feature: 'Many harmonics visible, high noise floor throughout',
      waveformFn: (i, t) => (Math.sin(i * 0.3 + t) + Math.sin(i * 0.9 + t * 1.3) + Math.sin(i * 1.5 + t * 0.7)) * 9 + Math.random() * 8,
      spectrumFn: (i) => 20 + Math.random() * 35 + (i % 4 === 0 ? 25 : 0),
    },
    {
      id: 'cavitation',
      label: 'Cavitation',
      icon: '🫧',
      color: '#0ea5e9',
      description: 'Pumps only — vapour bubbles collapsing. High-frequency random broadband noise.',
      feature: 'Random broadband energy in high-frequency range',
      waveformFn: (i, t) => Math.sin(i * 0.3 + t) * 4 + Math.random() * 22 - 11,
      spectrumFn: (i) => (i > 18 ? 15 + Math.random() * 40 : Math.exp(-i * 0.08) * 20) + Math.random() * 6,
    },
  ]

  const pat = patterns[selected]
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 120)
    return () => clearInterval(id)
  }, [])

  const t = tick * 0.12
  const wavePoints = Array.from({ length: 100 }, (_, i) => ({
    x: (i / 99) * 100,
    y: 50 + pat.waveformFn(i, t),
  }))
  const specPoints = Array.from({ length: 32 }, (_, i) => pat.spectrumFn(i))

  const wavePathD = wavePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div>
      {/* Pattern selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {patterns.map((p, i) => (
          <motion.button
            key={p.id}
            onClick={() => setSelected(i)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              background: selected === i ? p.color : 'var(--bg-secondary)',
              color: selected === i ? '#fff' : 'var(--text-secondary)',
              border: `1.5px solid ${selected === i ? p.color : 'var(--border)'}`,
            }}
          >
            {p.icon} {p.label}
          </motion.button>
        ))}
      </div>

      <div style={{
        background: `${pat.color}0c`,
        border: `1.5px solid ${pat.color}44`,
        borderRadius: 18,
        padding: 24,
      }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            {pat.icon} {pat.label}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{pat.description}</div>
          <div style={{
            display: 'inline-block',
            background: `${pat.color}18`,
            border: `1px solid ${pat.color}44`,
            borderRadius: 8,
            padding: '4px 12px',
            fontSize: 13,
            color: pat.color,
            fontWeight: 600,
          }}>
            Diagnostic: {pat.feature}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Waveform */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              TIME DOMAIN (Waveform)
            </div>
            <div style={{ background: '#0f172a', borderRadius: 10, padding: 8 }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: 120 }}>
                <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" />
                <path d={wavePathD} fill="none" stroke={pat.color} strokeWidth="1.5" />
              </svg>
            </div>
          </div>
          {/* Spectrum */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              FREQUENCY DOMAIN (Spectrum)
            </div>
            <div style={{ background: '#0f172a', borderRadius: 10, padding: '8px 8px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 100 }}>
                {specPoints.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${Math.min(100, h)}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1, borderRadius: '2px 2px 0 0', background: pat.color, opacity: h > 40 ? 1 : 0.5 }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569', marginTop: 4 }}>
                <span>1x</span><span>2x</span><span>4x</span><span>8x</span><span>16x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Section 6: Analog to Digital Pipeline ──────────────────── */
function DataPipeline() {
  const [activeStep, setActiveStep] = useState(null)
  const [flowTick, setFlowTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setFlowTick(t => t + 1), 80)
    return () => clearInterval(id)
  }, [])

  const steps = [
    {
      id: 'phenomenon',
      label: 'Physical Event',
      icon: '⚙️',
      color: '#6366f1',
      latency: '0 ms',
      desc: 'Bearing vibrates at 12,500 RPM. Mechanical energy propagates through shaft and housing.',
      data: 'Continuous mechanical waves — infinite precision, no digital form yet.',
    },
    {
      id: 'sensor',
      label: 'Sensor Converts',
      icon: '📡',
      color: '#8b5cf6',
      latency: '< 1 ms',
      desc: 'Piezoelectric accelerometer converts mechanical vibration to analog voltage (±5V range).',
      data: 'Analog voltage: 0.00234V... a continuous electrical signal.',
    },
    {
      id: 'adc',
      label: 'ADC Digitizes',
      icon: '🔢',
      color: '#0ea5e9',
      latency: '~20 µs',
      desc: 'Analog-to-Digital Converter (16-bit ADC) samples at 51.2 kHz. Nyquist: captures up to 25.6 kHz.',
      data: '16-bit integer: [18234, 18301, 18198, 18412...] — 51,200 samples/sec.',
    },
    {
      id: 'edge',
      label: 'Edge Preprocesses',
      icon: '💻',
      color: '#10b981',
      latency: '5–50 ms',
      desc: 'Edge device (Raspberry Pi / PLC) computes RMS, peak, kurtosis, FFT features. Reduces 51,200 samples to ~20 feature values.',
      data: '{ rms: 2.34, peak: 8.12, kurtosis: 3.8, dominant_freq: 208 Hz }',
    },
    {
      id: 'network',
      label: 'Network Transmits',
      icon: '📶',
      color: '#f59e0b',
      latency: '10–200 ms',
      desc: 'MQTT over 4G/WiFi sends compressed JSON payload to cloud broker (e.g., AWS IoT Core).',
      data: 'MQTT message: 184 bytes payload → cloud ingestion endpoint.',
    },
    {
      id: 'cloud',
      label: 'Cloud Stores',
      icon: '☁️',
      color: '#ec4899',
      latency: '< 1 s',
      desc: 'Time-series database (InfluxDB / TimescaleDB) writes features with timestamp + equipment ID.',
      data: 'Row: { ts: 2024-03-15T14:22:00Z, equip_id: PUMP-007, rms: 2.34, ... }',
    },
    {
      id: 'ml',
      label: 'ML Consumes',
      icon: '🤖',
      color: '#6366f1',
      latency: '~50 ms',
      desc: 'Feature vector fed into trained model. Returns failure probability + maintenance recommendation.',
      data: '{ failure_prob: 0.23, rul_days: 42, alert_level: "LOW", action: "Routine check in 30 days" }',
    },
  ]

  const as = steps.find(s => s.id === activeStep)

  return (
    <div>
      {/* Pipeline flow */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 700 }}>
          {steps.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <motion.button
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '12px 8px',
                  borderRadius: 14,
                  background: activeStep === step.id ? `${step.color}18` : 'var(--bg-secondary)',
                  border: `1.5px solid ${activeStep === step.id ? step.color : 'var(--border)'}`,
                  cursor: 'pointer',
                  minWidth: 76,
                  flex: 1,
                }}
              >
                <span style={{ fontSize: 22 }}>{step.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: activeStep === step.id ? step.color : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>
                  {step.label}
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{step.latency}</span>
              </motion.button>

              {i < steps.length - 1 && (
                <div style={{ position: 'relative', height: 4, flex: '0 0 20px', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--border)', borderRadius: 2 }} />
                  <motion.div
                    animate={{ x: [-20, 20] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear', delay: i * 0.12 }}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: 12, height: 4,
                      borderRadius: 2,
                      background: steps[i].color,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {as && (
          <motion.div
            key={as.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              marginTop: 20,
              background: `${as.color}0c`,
              border: `1.5px solid ${as.color}44`,
              borderRadius: 18,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 26 }}>{as.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{as.label}</div>
                <div style={{ fontSize: 12, color: as.color, fontWeight: 600 }}>Latency: {as.latency}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{as.desc}</p>
            <div style={{
              background: '#0f172a',
              borderRadius: 10,
              padding: '12px 16px',
              fontFamily: 'monospace',
              fontSize: 12,
              color: as.color,
              lineHeight: 1.6,
            }}>
              {as.data}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Utility ──────────────────────────────────────────────────── */
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

/* ─── Main Export ─────────────────────────────────────────────── */
export default function Topic2Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px' }}>

      {/* Hero */}
      <Neuron
        mood="excited"
        size="large"
        message="Welcome to the Sensor Universe! A machine can't talk — but it can broadcast thousands of data signals every second. Vibration. Heat. Pressure. Current. Sound. These sensors are its voice. Your job is to listen."
        style={{ marginBottom: 40 }}
      />

      {/* ── Section 1 ── */}
      <SectionBlock
        icon="🎯"
        title="The Five Senses of a Machine"
        color="#6366f1"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          An industrial machine has no mouth to report pain — but it has measurable physical phenomena that change as it degrades.
          Click each sensor point on the pump below to see how it works.
        </p>
        <MachineSenses />
        <NeuronTip type="example">
          A bearing running hot and vibrating more than usual is like a human with a fever and a headache — both signs point to the same underlying problem. Sensors catch these "symptoms" 2–6 weeks before catastrophic failure.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="मशीन की पाँच इन्द्रियाँ"
        english="The Five Senses of a Machine"
        explanation="इंसान को बुखार होता है तो हम pulse, temperature, BP check करते हैं। Machine को 'बुखार' हो तो sensors check करते हैं। Vibration sensor machine का 'हाथ' है — हिलने-डुलने को महसूस करता है। Temperature sensor 'बुखार का thermometer' है। Pressure sensor blood pressure की तरह है — fluid का pressure measure करता है। Current sensor देखता है motor कितना effort लगा रही है — ज़्यादा current मतलब machine struggle कर रही है। Acoustic sensor कान की तरह है — ऐसी आवाज़ें पकड़ता है जो इंसान नहीं सुन सकता।"
        example="एक पुरानी pump में bearing घिसने लगी। इंसान को कुछ पता नहीं चला — आवाज़ भी normal लगी। लेकिन vibration sensor ने detect किया कि 74 kHz पर एक specific frequency spike आ रही है — bearing defect की पहचान! 3 हफ्ते बाद bearing बदली गई, ₹8 लाख का breakdown बचा।"
        terms={[
          { hindi: 'त्वरणमापी', english: 'Accelerometer', meaning: 'Vibration measure करने वाला sensor — bearing wear सबसे पहले यहाँ दिखती है' },
          { hindi: 'थर्मोकपल', english: 'Thermocouple', meaning: 'Temperature sensor — 85°C warning, 95°C critical' },
          { hindi: 'ध्वनिक उत्सर्जन', english: 'Acoustic Emission', meaning: 'Ultrasonic microphone — 20-100 kHz range में आवाज़ें detect करता है' },
        ]}
      />

      {/* ── Section 2 ── */}
      <SectionBlock
        icon="📊"
        title="How Sensors Generate Data — Live Simulation"
        color="#0ea5e9"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          Each sensor streams continuous readings. Toggle between normal operation and pre-failure mode to see how the signals change — 500ms refresh rate.
        </p>
        <LiveSensorDashboard />
        <NeuronTip type="tip">
          The key insight: no single reading matters. It's the TREND over time that reveals degradation. A single temperature spike might be ambient heat — but a steady 3-week climb tells a different story.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="लाइव सेंसर डेटा — ICU मॉनिटर की तरह"
        english="Live Sensor Dashboard — Real-Time Monitoring"
        explanation="Hospital ICU में patient का heart rate, BP, oxygen level हर second screen पर दिखता है — nurse 24/7 monitor करती है। Machine का sensor dashboard exactly ऐसा ही है। हर 500ms में vibration, temperature, pressure, current की reading आती है। Normal operation में सब lines smooth और stable रहती हैं। Pre-failure mode में देखो — vibration erratic हो जाती है, temperature climb करती है, current बढ़ता है। यह trend ही failure की warning है, single reading नहीं।"
        example="Tata Steel की blast furnace में 200+ sensors हैं — यह एक giant ICU है। जब compressor bearing घिसने लगी, vibration line ने 3 हफ्तों में धीरे-धीरे upward trend दिखाया। अगर सिर्फ daily averages देखते तो miss हो जाता — real-time monitoring ने पकड़ा।"
        terms={[
          { hindi: 'वास्तविक समय निगरानी', english: 'Real-Time Monitoring', meaning: 'हर second live readings देखना — failure से पहले alert मिलना' },
          { hindi: 'पूर्व-विफलता स्थिति', english: 'Pre-Failure Mode', meaning: 'वो state जब machine अभी चल रही है लेकिन टूटने वाली है' },
          { hindi: 'प्रवृत्ति', english: 'Trend', meaning: 'Single reading नहीं, बल्कि समय के साथ pattern — यही असली signal है' },
        ]}
      />

      {/* ── Section 3 ── */}
      <SectionBlock
        icon="🏭"
        title="Sensor Placement — Where to Listen"
        color="#10b981"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          Wrong placement = blind spots. Click each machine on the factory floor to see the optimal sensor locations, types, and sampling frequencies.
        </p>
        <SensorPlacement />
        <NeuronTip type="deep">
          Sampling frequency follows the Nyquist theorem: to detect a frequency of F Hz, you must sample at 2F Hz minimum. A 10 kHz bearing defect frequency requires at least 20 kHz sampling — which is why industrial accelerometers often sample at 25.6 kHz or 51.2 kHz.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="सेंसर कहाँ लगाएं — स्टेथोस्कोप की जगह"
        english="Sensor Placement — Where to Listen on the Machine"
        explanation="Doctor stethoscope सही जगह लगाता है — heart की आवाज़ सुनने के लिए chest पर, lungs के लिए back पर। अगर गलत जगह लगाया तो कुछ नहीं सुनेगा। Machine पर भी sensor सही जगह लगाना ज़रूरी है। Bearing wear detect करने के लिए vibration sensor bearing के पास लगाओ, motor तक नहीं। Pump leakage detect करने के लिए pressure sensor outlet पर लगाओ। CNC machine पर spindle bearing के पास sensor सबसे important है क्योंकि वहीं सबसे ज़्यादा wear होती है।"
        example="Conveyor belt पर sensor गलत जगह लगाया था — motor housing पर। Belt tension issue था लेकिन detect नहीं हुआ। Expert ने sensor drive pulley bearing के पास move किया — तुरंत anomaly detect हुई। Placement = everything!"
        terms={[
          { hindi: 'ड्राइव-एंड बेयरिंग', english: 'Drive-End Bearing', meaning: 'Pump की वो bearing जो motor से जुड़ी है — सबसे critical point' },
          { hindi: 'नमूना दर', english: 'Sampling Rate', meaning: 'हर second में कितनी readings — 51,200/sec = ज़्यादा detail, ज़्यादा data' },
          { hindi: 'अंधा स्थान', english: 'Blind Spot', meaning: 'वो area जहाँ sensor नहीं है — failure detect नहीं होगी' },
        ]}
      />

      {/* ── Section 4 ── */}
      <SectionBlock
        icon="💾"
        title="Sampling Rate & Data Volume"
        color="#f59e0b"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          More sensors + higher frequency = better detection, but also massive data volumes. Use the calculator to feel the scale.
        </p>
        <DataVolumeCalculator />
        <NeuronTip type="warning">
          A medium factory with 50 sensors sampling at 25 kHz each generates ~40 TB per year of raw waveform data. This is why edge preprocessing (computing features on-device before sending) is critical — it can reduce bandwidth by 99%.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="सेंसर डेटा की मात्रा"
        english="How Much Data Do Sensors Generate?"
        explanation="एक vibration sensor 51,200 readings per second लेता है। एक machine पर 20 sensors हों तो per second 10 लाख readings। दिन में 86 अरब readings! यह data store करना बहुत मुश्किल है। इसीलिए 'Edge Processing' होती है — sensor के पास ही एक small computer (Raspberry Pi) raw data से features निकालता है (RMS, peak, kurtosis) और सिर्फ वो 20 numbers cloud पर भेजता है। 51,200 readings → 20 features। 99% bandwidth बचती है, लेकिन important information retain होती है।"
        example="Apollo Hospitals में MRI machine के 12 sensors थे जो हर minute पढ़ते थे। Raw data 500 GB/day था — cloud पर भेजना possible नहीं था। Edge device ने process करके सिर्फ 50 MB/day features भेजे। Zero bandwidth waste, full diagnostic capability।"
        terms={[
          { hindi: 'किनारा प्रसंस्करण', english: 'Edge Processing', meaning: 'Sensor के पास ही compute करना — cloud पर सिर्फ processed features भेजना' },
          { hindi: 'डेटा संपीड़न', english: 'Data Compression', meaning: 'Same information को कम space में store करना — Parquet format 4x छोटा' },
          { hindi: 'बैंडविड्थ', english: 'Bandwidth', meaning: 'Network पर कितना data send हो सकता है — edge processing से 99% बचती है' },
        ]}
      />

      {/* ── Section 5 ── */}
      <SectionBlock
        icon="〰️"
        title="Normal vs Abnormal Patterns"
        color="#ec4899"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          Every fault has a characteristic vibration fingerprint. Select a pattern to see its waveform and frequency spectrum side by side — the diagnostic feature is highlighted.
        </p>
        <PatternLibrary />
        <NeuronTip type="tip">
          Frequency domain (FFT spectrum) is often more informative than time domain for diagnosis. While the waveform shows severity, the spectrum reveals the CAUSE — each fault creates energy at specific harmonic frequencies.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="सामान्य बनाम असामान्य पैटर्न"
        english="Normal vs Abnormal Vibration Patterns"
        explanation="हर fault का एक 'fingerprint' होता है — जैसे हर criminal का fingerprint unique है। Healthy bearing का vibration smooth है, कोई dramatic peaks नहीं। Imbalance में एक strong peak आती है 1x rotation speed पर — जैसे cycle का wheel थोड़ा bent हो। Bearing defect में periodic spikes आते हैं — खट-खट की तरह, regular intervals पर। Misalignment में 2x frequency dominant होती है। Looseness में chaotic, random pattern होता है। Engineer इन patterns देखकर exactly diagnose कर सकता है कि problem क्या है — बिना machine खोले।"
        example="एक pump की FFT spectrum में 24 kHz पर एक sharp spike था। Engineer ने देखा — यह BPFO (Ball Pass Frequency Outer race) है bearing की। Outer race में एक दरार है। Machine बंद की, bearing निकाली — exactly outer race पर crack था। Diagnosis 100% correct!"
        terms={[
          { hindi: 'आवृत्ति स्पेक्ट्रम', english: 'FFT Spectrum', meaning: 'Vibration को frequencies में break करना — हर fault की अपनी frequency होती है' },
          { hindi: 'असंतुलन', english: 'Imbalance', meaning: 'Rotating part का weight uneven होना — 1x speed पर peak' },
          { hindi: 'गुहिकायन', english: 'Cavitation', meaning: 'Pump में bubbles बनना-फटना — broadband high-frequency noise' },
        ]}
      />

      {/* ── Section 6 ── */}
      <SectionBlock
        icon="🔄"
        title="From Analog to Digital — The Data Pipeline"
        color="#8b5cf6"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          Physical vibration becomes an ML prediction through a 7-step pipeline. Click each stage to see what happens to the data and how long it takes.
        </p>
        <DataPipeline />
        <NeuronTip type="fun">
          The entire journey from physical bearing vibration to ML prediction alert on a phone typically takes under 1 second — even though it traverses analog electronics, a microcontroller, a 4G network, and a cloud ML inference endpoint.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="एनालॉग से डिजिटल — डेटा का सफर"
        english="From Analog to Digital — The Data Pipeline"
        explanation="Physical vibration digital alert बनने तक 7 steps से गुज़रती है। पहले bearing हिलती है (physical event)। Piezoelectric sensor उसे voltage में convert करता है। ADC (Analog-Digital Converter) voltage को numbers में बदलता है — 51,200 times per second। Edge device (small computer) raw numbers से features calculate करता है। MQTT protocol से 4G/WiFi पर cloud को data भेजा जाता है। Time-series database (InfluxDB) data store करती है। ML model failure probability calculate करके phone पर alert भेजता है। यह पूरा सफर 1 second से कम में होता है!"
        example="एक Hyundai car plant में robot arm की bearing vibrate होती है → sensor voltage generate करता है → ADC digitize करता है → Raspberry Pi features निकालता है → AWS IoT Core पर 184 bytes MQTT message जाता है → InfluxDB store करती है → ML model: 23% failure risk → Maintenance app: 'Robot Arm B7 — check in 30 days'। Total time: 0.8 seconds।"
        terms={[
          { hindi: 'एनालॉग-डिजिटल रूपांतरण', english: 'ADC (Analog to Digital Converter)', meaning: 'Continuous voltage signal को discrete numbers में convert करना — 16-bit precision' },
          { hindi: 'MQTT प्रोटोकॉल', english: 'MQTT Protocol', meaning: 'IoT devices के लिए lightweight messaging protocol — 184 bytes में data भेजता है' },
          { hindi: 'समय-श्रृंखला डेटाबेस', english: 'Time-Series Database', meaning: 'InfluxDB जैसा database जो time-stamped sensor data के लिए optimized है' },
        ]}
      />

      {/* ── Section 7: Hindi ── */}
      <SectionBlock
        icon="🇮🇳"
        title="Hindi Summary — हिंदी में समझें"
        color="#ff9933"
      >
        <Neuron
          mood="explaining"
          message="अब हम यही concept हिंदी में समझते हैं — sensors को एक factory worker की तरह सोचो जो हर second machine की pulse check करता है।"
          style={{ marginBottom: 20 }}
        />

        <HindiExplainer
          concept="सेंसर ब्रह्मांड"
          english="The Sensor Universe"
          explanation="जैसे एक doctor patient की जांच करता है — pulse, temperature, blood pressure — वैसे ही IoT sensors machine की जांच करते हैं। Vibration sensor हाथ की तरह machine को feel करता है, temperature sensor बुखार नापता है, pressure sensor blood pressure की तरह है, current sensor यह देखता है कि machine कितना effort कर रही है। ये sensors 24/7 काम करते हैं और हर 50ms में readings लेते हैं — एक doctor जो कभी नहीं सोता।"
          example="एक steel plant में Pump #7 है। उसमें 4 sensors लगे हैं। उनकी readings normal थीं। लेकिन 3 हफ्ते में धीरे-धीरे vibration बढ़ने लगी और temperature ऊपर जाने लगा। ML model ने detect किया और alert दिया: 'Pump #7 — bearing fail होने वाली है, अगले 14 दिन में maintenance करो।' Team ने bearing बदली — ₹45 लाख का production loss बचाया।"
          terms={[
            { hindi: 'कंपन', english: 'Vibration', meaning: 'Machine का हिलना-डुलना — bearing wear इससे detect होती है' },
            { hindi: 'तापमान', english: 'Temperature', meaning: 'गर्मी — 85°C से ऊपर warning, 95°C critical' },
            { hindi: 'दबाव', english: 'Pressure', meaning: 'Fluid का pressure — कम = leak, ज़्यादा = blockage' },
            { hindi: 'विद्युत धारा', english: 'Current', meaning: 'Electricity flow — ज़्यादा current = motor struggle कर रही है' },
            { hindi: 'नमूना दर', english: 'Sampling Rate', meaning: 'हर second में कितनी readings ली जाती हैं (जैसे 51,200/sec)' },
            { hindi: 'आधार रेखा', english: 'Baseline', meaning: 'Normal operation की reading — इससे compare करके anomaly detect होती है' },
            { hindi: 'विसंगति', english: 'Anomaly', meaning: 'Normal pattern से deviation — यही failure की पहली sign है' },
          ]}
        />
      </SectionBlock>

      {/* Closing mascot */}
      <Neuron
        mood="waving"
        message="You've just learned how machines speak through data! In the next topic — Exploratory Data Analysis — we'll take a real sensor dataset and find the hidden patterns that separate healthy machines from failing ones. The detective work begins!"
        style={{ marginTop: 8, marginBottom: 40 }}
      />

    </div>
  )
}
