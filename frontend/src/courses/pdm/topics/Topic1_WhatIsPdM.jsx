import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 1 — What is Predictive Maintenance?
================================================================ */

/* ---- Animated Number Counter ---- */
function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1.2 }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    const startTime = performance.now()
    const tick = (now) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * ease))
      if (progress < 1) requestAnimationFrame(tick)
      else prevRef.current = end
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  return <span>{prefix}{display.toLocaleString('en-IN')}{suffix}</span>
}

/* ================================================================
   SECTION 1 — The Four Types of Maintenance
================================================================ */
const maintenanceTypes = [
  {
    id: 'reactive',
    emoji: '🔥',
    label: 'Reactive',
    tagline: 'Fix it when it breaks',
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    cost: 5300000,
    costLabel: '₹53 lakhs',
    description: 'Wait for equipment to fail, then repair. Zero upfront planning.',
    pros: ['No upfront investment', 'Simple to understand'],
    cons: ['Unplanned production stops', 'Emergency repair premiums', 'Lost revenue'],
    animation: 'reactive',
  },
  {
    id: 'preventive',
    emoji: '🔵',
    label: 'Preventive',
    tagline: 'Replace on schedule',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#93c5fd',
    cost: 2800000,
    costLabel: '₹28 lakhs',
    description: 'Replace parts on a fixed schedule regardless of actual condition.',
    pros: ['Predictable schedule', 'Avoids catastrophic failure'],
    cons: ['30% replacements unnecessary', 'Over-maintenance waste'],
    animation: 'preventive',
  },
  {
    id: 'predictive',
    emoji: '🟢',
    label: 'Predictive',
    tagline: 'Fix it before it breaks',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    cost: 1500000,
    costLabel: '₹15 lakhs',
    description: 'Sensors monitor health in real time; replace only when degradation detected.',
    pros: ['Minimal downtime', 'Parts used near full life', 'Data-driven decisions'],
    cons: ['Requires sensor infrastructure', 'Initial setup cost'],
    animation: 'predictive',
  },
  {
    id: 'prescriptive',
    emoji: '🟣',
    label: 'Prescriptive',
    tagline: 'Optimize the fix',
    color: '#a855f7',
    bgColor: '#faf5ff',
    borderColor: '#c4b5fd',
    cost: 1200000,
    costLabel: '₹12 lakhs',
    description: 'AI recommends the exact action, timing, parts and technician needed.',
    pros: ['Highest efficiency', 'AI-driven optimization', 'Self-improving'],
    cons: ['Complex AI models needed', 'Large data requirements'],
    animation: 'prescriptive',
  },
]

function ReactiveAnimation() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % 4), 2000)
    return () => clearInterval(interval)
  }, [])
  const phases = [
    { label: 'Machine Running', emoji: '⚙️', color: '#22c55e', sub: 'Production: Normal' },
    { label: '💥 BREAKDOWN!', emoji: '💥', color: '#ef4444', sub: 'Production: STOPPED' },
    { label: '3 Days Repair', emoji: '🔧', color: '#f59e0b', sub: 'Emergency crew called' },
    { label: 'Cost: ₹53L', emoji: '💸', color: '#ef4444', sub: 'Lost revenue + repair' },
  ]
  const p = phases[phase]
  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <motion.div key={phase} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <div style={{ fontSize: 36 }}>{p.emoji}</div>
        <div style={{ fontWeight: 700, color: p.color, fontSize: 15, marginTop: 4 }}>{p.label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{p.sub}</div>
      </motion.div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
        {phases.map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === phase ? '#ef4444' : '#fca5a5', transition: 'background 0.3s' }} />
        ))}
      </div>
    </div>
  )
}

function PreventiveAnimation() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const replacements = [true, false, false, true, false, false]
  const needed = [false, false, false, true, false, false]
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textAlign: 'center' }}>Scheduled every 3 months</div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {months.map((m, i) => (
          <div key={m} style={{ textAlign: 'center' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8,
              background: replacements[i] ? (needed[i] ? '#d1fae5' : '#fee2e2') : 'var(--bg-secondary)',
              border: `2px solid ${replacements[i] ? (needed[i] ? '#22c55e' : '#ef4444') : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>
              {replacements[i] ? (needed[i] ? '✅' : '🔴') : '⬜'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>{m}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 11, color: '#ef4444' }}>🔴 Unnecessary</span>
        <span style={{ fontSize: 11, color: '#22c55e' }}>✅ Needed</span>
      </div>
    </div>
  )
}

function PredictiveAnimation() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 400)
    return () => clearInterval(id)
  }, [])
  const health = Math.min(95, 60 + tick * 3)
  const alert = health > 82
  return (
    <div style={{ padding: '8px 0', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8 }}
          style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Vibration Sensor Active</span>
      </div>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Bearing Health Score</div>
        <div style={{ height: 12, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${100 - (health - 60) * 4}%` }} transition={{ duration: 0.3 }}
            style={{ height: '100%', background: alert ? '#ef4444' : '#22c55e', borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 12, marginTop: 4, color: alert ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
          {alert ? '⚠️ Schedule maintenance soon' : '✓ Healthy'}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Cost: ₹15 lakhs ↓</div>
    </div>
  )
}

function PrescriptiveAnimation() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 4), 1800)
    return () => clearInterval(id)
  }, [])
  const steps = [
    { icon: '🤖', text: 'AI analysing 47 sensors…' },
    { icon: '📋', text: 'Recommendation: Replace Bearing #3' },
    { icon: '🗓️', text: 'Best time: Thursday 2AM shift' },
    { icon: '💰', text: 'Predicted saving: ₹3.2 lakhs' },
  ]
  return (
    <div style={{ padding: '8px 0' }}>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          style={{ background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>{steps[step].icon}</div>
          <div style={{ fontSize: 13, color: '#6d28d9', fontWeight: 600, marginTop: 6 }}>{steps[step].text}</div>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === step ? '#a855f7' : '#e9d5ff', transition: 'background 0.3s' }} />
        ))}
      </div>
    </div>
  )
}

const animationComponents = {
  reactive: <ReactiveAnimation />,
  preventive: <PreventiveAnimation />,
  predictive: <PredictiveAnimation />,
  prescriptive: <PrescriptiveAnimation />,
}

function MaintenanceTypesSection() {
  const [selected, setSelected] = useState('predictive')
  const maxCost = 5300000

  return (
    <div>
      <Neuron mood="explaining" size="medium"
        message="There are 4 levels of maintenance maturity. Most Indian factories are still at Reactive — we want to get you to Predictive! Let's compare them." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 24, marginBottom: 28 }}>
        {maintenanceTypes.map(type => (
          <motion.div key={type.id} onClick={() => setSelected(type.id)}
            whileHover={{ y: -4, boxShadow: `0 12px 32px ${type.color}22` }}
            whileTap={{ scale: 0.97 }}
            style={{
              borderRadius: 16, padding: '18px 16px', cursor: 'pointer',
              background: selected === type.id ? type.bgColor : 'var(--bg-card)',
              border: `2px solid ${selected === type.id ? type.color : 'var(--border)'}`,
              transition: 'all 0.25s',
              boxShadow: selected === type.id ? `0 8px 24px ${type.color}20` : 'none',
            }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{type.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: type.color }}>{type.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{type.tagline}</div>
            <div style={{ marginTop: 10, fontWeight: 700, fontSize: 15, color: type.color }}>{type.costLabel}</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {maintenanceTypes.filter(t => t.id === selected).map(type => (
          <motion.div key={type.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            style={{
              borderRadius: 20, padding: 24, marginBottom: 28,
              background: type.bgColor,
              border: `2px solid ${type.borderColor}`,
            }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: type.color, marginBottom: 8 }}>
                  {type.emoji} {type.label} Maintenance
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 14 }}>{type.description}</p>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>Advantages</div>
                  {type.pros.map(p => <div key={p} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>✓ {p}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Challenges</div>
                  {type.cons.map(c => <div key={c} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>✗ {c}</div>)}
                </div>
              </div>
              <div style={{ borderLeft: `1px solid ${type.borderColor}`, paddingLeft: 20 }}>
                {animationComponents[type.animation]}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ROI Bar Chart */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 20 }}>
          Annual Maintenance Cost Comparison
        </div>
        {maintenanceTypes.map(type => (
          <div key={type.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{type.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{type.label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: type.color }}>{type.costLabel}</span>
            </div>
            <div style={{ height: 14, background: 'var(--bg-secondary)', borderRadius: 7, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(type.cost / maxCost) * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${type.color}cc, ${type.color})`, borderRadius: 7 }}
              />
            </div>
          </div>
        ))}
        <NeuronTip type="fun">
          Switching from Reactive to Predictive typically saves <strong>72% of maintenance costs</strong>. For a mid-size Indian factory that's ₹38+ lakhs per year!
        </NeuronTip>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 2 — ROI Calculator
================================================================ */
function ROICalculator() {
  const [equipmentValue, setEquipmentValue] = useState(5000000)
  const [lossPerHour, setLossPerHour] = useState(500000)
  const [downtimeHours, setDowntimeHours] = useState(120)
  const [units, setUnits] = useState(10)

  const annualDowntimeCost = lossPerHour * downtimeHours * units
  const pdmSavings = Math.round(annualDowntimeCost * 0.70)
  const pdmImplementationCost = Math.round(equipmentValue * units * 0.02)
  const yearOneROI = pdmSavings - pdmImplementationCost
  const threeYearROI = pdmSavings * 3 - pdmImplementationCost
  const roiPercent = Math.round((threeYearROI / pdmImplementationCost) * 100)

  const sliders = [
    { label: 'Equipment Value (per unit)', key: 'equip', value: equipmentValue, min: 1000000, max: 50000000, step: 500000, setter: setEquipmentValue, format: v => `₹${(v / 100000).toFixed(0)}L` },
    { label: 'Production Loss per Hour', key: 'loss', value: lossPerHour, min: 10000, max: 5000000, step: 10000, setter: setLossPerHour, format: v => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K` },
    { label: 'Unplanned Downtime (hours/year)', key: 'down', value: downtimeHours, min: 10, max: 500, step: 5, setter: setDowntimeHours, format: v => `${v} hrs` },
    { label: 'Number of Equipment Units', key: 'units', value: units, min: 1, max: 100, step: 1, setter: setUnits, format: v => `${v} units` },
  ]

  return (
    <div>
      <Neuron mood="thinking" size="medium"
        message="Drag the sliders to match your factory's numbers. Watch the ROI calculate in real time — this is exactly how I'd pitch PdM to a CFO!" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 24 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 18 }}>Your Factory Parameters</div>
          {sliders.map(s => (
            <div key={s.key} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{s.format(s.value)}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                onChange={e => s.setter(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.format(s.min)}</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.format(s.max)}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 18 }}>Live ROI Results</div>
          {[
            { label: 'Annual Downtime Cost', value: annualDowntimeCost, color: '#ef4444', prefix: '₹', suffix: '', note: 'Current losses' },
            { label: 'Savings with PdM (70%)', value: pdmSavings, color: '#22c55e', prefix: '₹', suffix: '', note: 'First year benefit' },
            { label: 'PdM Setup Cost', value: pdmImplementationCost, color: '#f59e0b', prefix: '₹', suffix: '', note: 'One-time investment' },
            { label: '3-Year Net ROI', value: threeYearROI, color: '#6366f1', prefix: '₹', suffix: '', note: `${roiPercent}% return` },
          ].map(item => (
            <motion.div key={item.label} layout
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                  <AnimatedNumber value={item.value} prefix={item.prefix} suffix={item.suffix} />
                </div>
                <div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.note}</div>
              </div>
            </motion.div>
          ))}

          {threeYearROI > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)', border: '2px solid #22c55e', borderRadius: 14, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#15803d', fontWeight: 700 }}>
                PdM pays for itself in {Math.ceil(pdmImplementationCost / (pdmSavings / 12))} months!
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <NeuronTip type="example">
        Indian Railways estimated ₹2,400 Cr in annual savings after deploying PdM across their locomotive fleet — using exactly this kind of analysis.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 3 — PdM Pipeline
================================================================ */
const pipelineStages = [
  {
    id: 1, icon: '📡', label: 'Sensor Data', color: '#06b6d4',
    desc: 'Vibration, temperature, pressure, and current sensors installed on equipment collect readings every millisecond.',
    detail: 'IoT sensors generate 1–10 GB of data per machine per day. Modern plants use wireless MEMS sensors that cost as little as ₹3,000 each.',
    animation: 'sensor',
  },
  {
    id: 2, icon: '🔄', label: 'ETL Pipeline', color: '#8b5cf6',
    desc: 'Raw data is extracted, transformed into standard formats, and loaded into a time-series database.',
    detail: 'Tools: Apache Kafka for real-time streaming, Apache Spark for batch processing. Data is timestamped and tagged with machine ID.',
    animation: 'etl',
  },
  {
    id: 3, icon: '🧹', label: 'Data Cleaning', color: '#f59e0b',
    desc: 'Noise is removed, missing values are imputed, outliers are filtered, and signals are smoothed.',
    detail: '15–30% of sensor readings are typically noisy or missing. Z-score normalization and rolling averages clean the signal.',
    animation: 'clean',
  },
  {
    id: 4, icon: '⚙️', label: 'Feature Engineering', color: '#ec4899',
    desc: 'Raw signals are converted into meaningful features: RMS, FFT spectrum, kurtosis, crest factor.',
    detail: 'A bearing failure shows up as a specific frequency spike in FFT. Engineers craft 50–200 features from raw vibration data.',
    animation: 'feature',
  },
  {
    id: 5, icon: '🧠', label: 'ML Model', color: '#6366f1',
    desc: 'Trained on historical failure data, the model predicts Remaining Useful Life (RUL) or failure probability.',
    detail: 'Common models: Random Forest, XGBoost, LSTM neural networks. Trained on data from hundreds of past failures.',
    animation: 'ml',
  },
  {
    id: 6, icon: '📊', label: 'Dashboard & Alerts', color: '#22c55e',
    desc: 'Maintenance teams see real-time health scores, predicted failure dates, and recommended actions.',
    detail: 'Alerts sent via SMS, email, or SCADA integration. Maintenance work orders automatically created in SAP/CMMS.',
    animation: 'dashboard',
  },
]

function SensorAnim() {
  const [pulse, setPulse] = useState(0)
  useEffect(() => { const id = setInterval(() => setPulse(p => p + 1), 600); return () => clearInterval(id) }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0e7490', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, position: 'relative', zIndex: 2 }}>📡</div>
        {[1, 2, 3].map(i => (
          <motion.div key={i} animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, width: 48, height: 48, borderRadius: '50%', border: '2px solid #06b6d4', zIndex: 1 }} />
        ))}
      </div>
      <div>
        {['Vibration', 'Temperature', 'Pressure'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <motion.div animate={{ opacity: pulse % 3 === i ? 1 : 0.3 }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4' }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s}: <strong style={{ color: '#06b6d4' }}>{pulse % 3 === i ? '●' : '○'}</strong></span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataFlowAnim() {
  const [dots, setDots] = useState([])
  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => [...d.slice(-8), { id: Date.now(), x: Math.random() * 80 }])
    }, 300)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ height: 60, position: 'relative', overflow: 'hidden', background: 'var(--bg-secondary)', borderRadius: 10, margin: '0 16px' }}>
      {dots.map(dot => (
        <motion.div key={dot.id} initial={{ x: `${dot.x}%`, y: -8 }} animate={{ y: 68 }} transition={{ duration: 1.2, ease: 'linear' }}
          style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', top: 0 }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
        Data Streaming ↓
      </div>
    </div>
  )
}

function CleanAnim() {
  const noisy = [42, 85, 41, 200, 43, 40, 42, 95, 41, 43]
  const clean = [42, 42, 41, 42, 43, 40, 42, 42, 41, 43]
  const [showClean, setShowClean] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setShowClean(s => !s), 2000)
    return () => clearInterval(id)
  }, [])
  const data = showClean ? clean : noisy
  const max = 200
  return (
    <div style={{ padding: '8px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 6 }}>
        {showClean ? '✅ After cleaning' : '⚠️ Raw noisy signal'}
      </div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 40, justifyContent: 'center' }}>
        {data.map((v, i) => (
          <motion.div key={i} animate={{ height: `${(v / max) * 40}px` }} transition={{ duration: 0.4 }}
            style={{ width: 10, background: v > 80 ? '#ef4444' : '#f59e0b', borderRadius: 2, minHeight: 3 }} />
        ))}
      </div>
    </div>
  )
}

function FeatureAnim() {
  const features = [
    { name: 'RMS', value: '0.82', normal: false },
    { name: 'FFT Peak', value: '124Hz', normal: false },
    { name: 'Kurtosis', value: '4.2', normal: true },
    { name: 'Crest', value: '3.8', normal: false },
  ]
  const [highlight, setHighlight] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setHighlight(h => (h + 1) % features.length), 800)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
      {features.map((f, i) => (
        <motion.div key={f.name} animate={{ scale: highlight === i ? 1.12 : 1 }}
          style={{
            padding: '6px 10px', borderRadius: 8, background: highlight === i ? '#fce7f3' : 'var(--bg-secondary)',
            border: `1.5px solid ${highlight === i ? '#ec4899' : 'var(--border)'}`, textAlign: 'center',
          }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{f.name}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: highlight === i ? '#ec4899' : 'var(--text-primary)' }}>{f.value}</div>
        </motion.div>
      ))}
    </div>
  )
}

function MLAnim() {
  const [prob, setProb] = useState(23)
  useEffect(() => {
    const id = setInterval(() => setProb(p => p < 87 ? p + 2 : 23), 150)
    return () => clearInterval(id)
  }, [])
  const color = prob > 70 ? '#ef4444' : prob > 40 ? '#f59e0b' : '#22c55e'
  return (
    <div style={{ padding: '8px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>Failure Probability</div>
      <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto' }}>
        <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg-secondary)" strokeWidth="6" />
          <motion.circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={163} strokeDashoffset={163 * (1 - prob / 100)} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color }}>
          {prob}%
        </div>
      </div>
      <div style={{ fontSize: 11, marginTop: 6, color, fontWeight: 600 }}>
        {prob > 70 ? '⚠️ Alert!' : prob > 40 ? 'Watch' : 'Normal'}
      </div>
    </div>
  )
}

function DashboardAnim() {
  const alerts = [
    { machine: 'Pump A3', status: '🔴 Critical', rul: '2 days' },
    { machine: 'Motor B1', status: '🟡 Warning', rul: '12 days' },
    { machine: 'Fan C2', status: '🟢 Healthy', rul: '89 days' },
  ]
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setVisible(v => Math.min(v + 1, 2)), 700)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ padding: '4px 12px' }}>
      {alerts.slice(0, visible + 1).map((a, i) => (
        <motion.div key={a.machine} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', background: 'var(--bg-secondary)', borderRadius: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>{a.machine}</span>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{a.status}</span>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>RUL: {a.rul}</span>
        </motion.div>
      ))}
    </div>
  )
}

const stageAnims = {
  sensor: <SensorAnim />,
  etl: <DataFlowAnim />,
  clean: <CleanAnim />,
  feature: <FeatureAnim />,
  ml: <MLAnim />,
  dashboard: <DashboardAnim />,
}

function PipelineSection() {
  const [activeStage, setActiveStage] = useState(1)

  return (
    <div>
      <Neuron mood="excited" size="medium"
        message="This is the heart of every PdM system — 6 stages that turn raw sensor readings into actionable maintenance alerts. Click each stage to explore!" />

      {/* Pipeline Flow - Horizontal scrollable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 24, marginBottom: 24, overflowX: 'auto', padding: '4px 2px', paddingBottom: 8 }}>
        {pipelineStages.map((stage, idx) => (
          <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <motion.div onClick={() => setActiveStage(stage.id)}
              whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}
              style={{
                padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'center', minWidth: 90,
                background: activeStage === stage.id ? `${stage.color}15` : 'var(--bg-card)',
                border: `2px solid ${activeStage === stage.id ? stage.color : 'var(--border)'}`,
                boxShadow: activeStage === stage.id ? `0 6px 20px ${stage.color}30` : 'none',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: 24 }}>{stage.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: activeStage === stage.id ? stage.color : 'var(--text-secondary)', marginTop: 4, lineHeight: 1.2 }}>
                {stage.label}
              </div>
            </motion.div>
            {idx < pipelineStages.length - 1 && (
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ fontSize: 18, color: 'var(--text-secondary)', flexShrink: 0 }}>→</motion.div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {pipelineStages.filter(s => s.id === activeStage).map(stage => (
          <motion.div key={stage.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              borderRadius: 20, padding: 24, border: `2px solid ${stage.color}40`,
              background: `${stage.color}08`,
            }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stage.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {stage.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: stage.color }}>Stage {stage.id}: {stage.label}</div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 10 }}>{stage.desc}</p>
                <p style={{ color: 'var(--text-primary)', fontSize: 13, background: `${stage.color}10`, padding: '10px 14px', borderRadius: 10, borderLeft: `3px solid ${stage.color}` }}>
                  {stage.detail}
                </p>
              </div>
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', minHeight: 100 }}>
                {stageAnims[stage.animation]}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <NeuronTip type="tip">
        In most real projects, <strong>60–70% of the effort</strong> goes into stages 2–4 (ETL, cleaning, feature engineering). The ML model itself is often the easiest part!
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 4 — Real-World Success Stories
================================================================ */
const successStories = [
  {
    company: 'Tata Steel', industry: 'Steel Manufacturing', location: 'Jamshedpur, Jharkhand',
    logo: '🏭', color: '#dc2626',
    headline: '40% fewer breakdowns in blast furnace operations',
    equipment: 'Blast Furnace Blowers & Compressors',
    sensors: 'Vibration + Temperature + Current',
    model: 'Random Forest + Anomaly Detection',
    impact: ['40% reduction in unplanned breakdowns', '₹85 Cr annual savings', 'Blast furnace uptime: 94% → 97.8%', '200+ sensors deployed'],
    quote: 'PdM gave us 2–3 weeks advance warning before failures that previously cost us ₹10 Cr per incident.',
  },
  {
    company: 'Indian Railways', industry: 'Rail Transport', location: 'Pan-India',
    logo: '🚂', color: '#b45309',
    headline: 'Wheel bearing monitoring — 200 potential derailments prevented',
    equipment: 'Locomotive Wheel Bearings',
    sensors: 'Acoustic emission + Thermal imaging',
    model: 'SVM + LSTM Sequence Model',
    impact: ['200 derailments prevented (estimated)', '₹2,400 Cr annual savings', '99.1% bearing failure detection rate', 'Zero false positives in critical detections'],
    quote: 'One prevented derailment pays for the entire PdM system ten times over.',
  },
  {
    company: 'Reliance Jamnagar', industry: 'Petroleum Refining', location: 'Jamnagar, Gujarat',
    logo: '⚗️', color: '#0369a1',
    headline: '₹120 Cr saved through refinery pump monitoring',
    equipment: 'Process Pumps & Rotating Equipment',
    sensors: 'Vibration + Pressure + Flow + Temperature',
    model: 'Multivariate Statistical Process Control + Deep Learning',
    impact: ['₹120 Cr cumulative savings', '60% reduction in pump failures', 'MTBF improved from 18 to 31 months', '1,200+ monitoring points active'],
    quote: 'The ROI was 8:1 in year one alone. We are now expanding to all 5,000 rotating equipment pieces.',
  },
  {
    company: 'Maruti Suzuki', industry: 'Automotive Manufacturing', location: 'Manesar, Haryana',
    logo: '🚗', color: '#16a34a',
    headline: '99.2% uptime on robotic assembly arms',
    equipment: 'KUKA Welding & Assembly Robots',
    sensors: 'Motor current + Servo encoder + Vision',
    model: 'Gradient Boosting + Rule-Based Alerts',
    impact: ['99.2% robotic arm uptime', '₹35 Cr annual savings', '800 cars/day production protected', 'Maintenance time reduced 45%'],
    quote: 'We now fix robots during planned maintenance windows, not during production hours.',
  },
  {
    company: 'NTPC Power Plants', industry: 'Power Generation', location: 'Multiple States',
    logo: '⚡', color: '#7c3aed',
    headline: '30% maintenance cost reduction in turbine health monitoring',
    equipment: 'Steam Turbines & Gas Turbines',
    sensors: 'Vibration (axial/radial) + Temperature + Pressure differential',
    model: 'Physics-Informed Neural Networks + RUL Prediction',
    impact: ['30% reduction in maintenance costs', '2.4% improvement in plant availability', '₹180 Cr saved across 10 plants', 'Extended turbine overhaul intervals by 35%'],
    quote: 'PdM allowed us to extend major overhaul intervals from 4 years to 5.4 years with full safety confidence.',
  },
  {
    company: 'Apollo Hospitals', industry: 'Healthcare', location: 'Chennai & Hyderabad',
    logo: '🏥', color: '#0891b2',
    headline: 'Zero unplanned MRI machine downtime across 12 facilities',
    equipment: 'MRI Scanners & CT Machines',
    sensors: 'Cryogen level + RF power + Gradient coil temp',
    model: 'Threshold Monitoring + Time Series Forecasting',
    impact: ['Zero unplanned MRI downtime (18 months)', '₹8 Cr saved in emergency repair costs', '3,000+ additional scans completed', 'Patient scheduling reliability: 99.7%'],
    quote: 'When an MRI fails unplanned, we lose ₹50L in emergency repair plus patient cancellations. PdM eliminated that entirely.',
  },
]

function SuccessStoriesSection() {
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <Neuron mood="happy" size="medium"
        message="These are real Indian companies doing PdM right now. Every single one of them started exactly where you are — learning the fundamentals!" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
        {successStories.map((story, i) => (
          <motion.div key={story.company}
            onClick={() => setSelected(selected === i ? null : i)}
            whileHover={{ y: -4, boxShadow: `0 12px 32px ${story.color}20` }}
            whileTap={{ scale: 0.97 }}
            style={{
              borderRadius: 18, padding: '20px 20px', cursor: 'pointer',
              background: selected === i ? `${story.color}08` : 'var(--bg-card)',
              border: `2px solid ${selected === i ? story.color : 'var(--border)'}`,
              transition: 'all 0.25s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${story.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {story.logo}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{story.company}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{story.location}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: story.color, fontWeight: 600, marginBottom: 8 }}>{story.headline}</p>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{story.industry}</div>
            <div style={{ fontSize: 11, color: selected === i ? story.color : 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>
              {selected === i ? '▲ Collapse' : '▼ View details'}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: 20 }}>
            {(() => {
              const story = successStories[selected]
              return (
                <div style={{ borderRadius: 20, padding: 28, background: `${story.color}08`, border: `2px solid ${story.color}30` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: story.color, marginBottom: 16 }}>{story.logo} {story.company}</div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Equipment Monitored</div>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{story.equipment}</div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Sensors Used</div>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{story.sensors}</div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>ML Approach</div>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{story.model}</div>
                      </div>
                      <div style={{ background: 'white', borderRadius: 12, padding: 14, borderLeft: `3px solid ${story.color}` }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Executive Quote</div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontStyle: 'italic' }}>"{story.quote}"</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Key Outcomes</div>
                      {story.impact.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${story.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: story.color, flexShrink: 0, fontWeight: 700 }}>✓</div>
                          <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronTip type="deep">
        Notice a pattern? Every success story starts with a critical, expensive piece of equipment, a clear cost-of-failure, and a focused pilot deployment. Start small, prove ROI, then scale.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 5 — What Data Does PdM Need?
================================================================ */
const dataSources = [
  {
    id: 'sensor',
    icon: '📡',
    label: 'Sensor Data',
    color: '#06b6d4',
    desc: 'Real-time signals from physical sensors attached to equipment',
    types: ['Vibration (accelerometer)', 'Temperature (thermocouple)', 'Pressure (transducer)', 'Current/Voltage (CT clamp)', 'Acoustic emission', 'Oil analysis'],
    sample: {
      type: 'timeseries',
      headers: ['Timestamp', 'Vibration (m/s²)', 'Temp (°C)', 'Current (A)'],
      rows: [
        ['2024-01-15 08:00:01', '0.82', '67.3', '48.2'],
        ['2024-01-15 08:00:02', '0.85', '67.5', '48.1'],
        ['2024-01-15 08:00:03', '1.24', '67.8', '49.0'],
        ['2024-01-15 08:00:04', '0.89', '68.1', '48.5'],
        ['2024-01-15 08:00:05', '2.10', '68.9', '51.2'],
      ],
      highlight: [2, 4],
    },
    keyMetrics: ['Sampling rate: 1–10 kHz for vibration', 'Storage: 1–10 GB/machine/day', 'Latency: <100ms for alerts'],
  },
  {
    id: 'workorder',
    icon: '📋',
    label: 'Work Orders',
    color: '#f59e0b',
    desc: 'Historical maintenance records: what failed, when, and what it cost',
    types: ['Repair descriptions', 'Parts replaced', 'Technician hours', 'Failure mode codes', 'Root cause analysis', 'Repair costs'],
    sample: {
      type: 'table',
      headers: ['WO #', 'Date', 'Equipment', 'Failure Mode', 'Cost'],
      rows: [
        ['WO-4521', '2023-11-12', 'Pump P-203', 'Bearing wear', '₹45,000'],
        ['WO-4589', '2023-12-01', 'Motor M-07', 'Insulation fault', '₹82,000'],
        ['WO-4612', '2024-01-08', 'Fan F-12', 'Imbalance', '₹28,000'],
        ['WO-4634', '2024-01-20', 'Pump P-203', 'Bearing wear', '₹45,000'],
      ],
      highlight: [0, 3],
    },
    keyMetrics: ['Minimum 2–3 years of history needed', 'MTBF calculated from this data', 'Same failure mode → recurring issue'],
  },
  {
    id: 'asset',
    icon: '🏷️',
    label: 'Asset Profiles',
    color: '#8b5cf6',
    desc: 'Static information about each piece of equipment',
    types: ['Equipment type & model', 'Installation date', 'Design life (hours)', 'Operating conditions', 'Manufacturer specs', 'Criticality rating'],
    sample: {
      type: 'card',
      asset: {
        name: 'Centrifugal Pump P-203',
        model: 'Grundfos CR 20-4',
        installed: '2019-03-15',
        designLife: '25,000 hours',
        currentHours: '18,432 hours (74% life used)',
        criticality: 'HIGH — no backup',
        nextMajorService: '6,568 hours remaining',
      },
    },
    keyMetrics: ['Age = most important feature', 'Remaining Useful Life calculated from design life', 'Criticality drives alert thresholds'],
  },
  {
    id: 'operational',
    icon: '⚙️',
    label: 'Operational Data',
    color: '#22c55e',
    desc: 'Context data: how hard is the equipment being run?',
    types: ['Production volume', 'Load factor (%)', 'Start/stop cycles', 'Environmental temp/humidity', 'Process fluid properties', 'Shift patterns'],
    sample: {
      type: 'table',
      headers: ['Date', 'Load %', 'Starts', 'Prod. Vol.', 'Amb. Temp'],
      rows: [
        ['2024-01-15', '87%', '3', '2,450 units', '32°C'],
        ['2024-01-16', '92%', '2', '2,600 units', '35°C'],
        ['2024-01-17', '76%', '5', '2,100 units', '31°C'],
        ['2024-01-18', '98%', '1', '2,800 units', '38°C'],
      ],
      highlight: [3],
    },
    keyMetrics: ['High load → faster degradation', 'Frequent starts = additional wear cycles', 'Combine with sensor data for best models'],
  },
]

function DataSourcesSection() {
  const [active, setActive] = useState('sensor')
  const source = dataSources.find(d => d.id === active)

  return (
    <div>
      <Neuron mood="thinking" size="medium"
        message="PdM isn't just about sensors — you need 4 types of data working together. Each tells a different part of the failure story." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24, marginBottom: 24 }}>
        {dataSources.map(ds => (
          <motion.div key={ds.id} onClick={() => setActive(ds.id)}
            whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
            style={{
              borderRadius: 14, padding: '16px 14px', cursor: 'pointer', textAlign: 'center',
              background: active === ds.id ? `${ds.color}15` : 'var(--bg-card)',
              border: `2px solid ${active === ds.id ? ds.color : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{ds.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: active === ds.id ? ds.color : 'var(--text-primary)' }}>{ds.label}</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {source && (
          <motion.div key={source.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            style={{ borderRadius: 20, padding: 24, background: `${source.color}08`, border: `2px solid ${source.color}30` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{source.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 18, color: source.color }}>{source.label}</div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 14 }}>{source.desc}</p>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Data Types Included</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {source.types.map(t => (
                      <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${source.color}15`, color: source.color, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Key Metrics</div>
                  {source.keyMetrics.map(m => (
                    <div key={m} style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
                      <span style={{ color: source.color }}>→</span> {m}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Sample Data</div>
                {source.sample.type === 'card' ? (
                  <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
                    {Object.entries(source.sample.asset).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 90, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr>
                          {source.sample.headers.map(h => (
                            <th key={h} style={{ padding: '6px 8px', background: `${source.color}20`, color: source.color, fontWeight: 700, textAlign: 'left', borderRadius: 4 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {source.sample.rows.map((row, ri) => (
                          <motion.tr key={ri} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: ri * 0.08 }}
                            style={{ background: source.sample.highlight?.includes(ri) ? `${source.color}15` : 'transparent' }}>
                            {row.map((cell, ci) => (
                              <td key={ci} style={{ padding: '5px 8px', color: source.sample.highlight?.includes(ri) ? source.color : 'var(--text-primary)', fontWeight: source.sample.highlight?.includes(ri) && ci > 0 ? 700 : 400 }}>{cell}</td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {source.sample.highlight && (
                      <div style={{ marginTop: 8, fontSize: 11, color: source.color }}>
                        ⚠️ Highlighted rows show anomalous readings
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronTip type="warning">
        The biggest PdM project failure cause: <strong>starting without enough historical failure data.</strong> You need at least 5–10 actual failure events to train a reliable model. No shortcuts here!
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 6 — Bearing Example: PdM vs Preventive
================================================================ */
function BearingComparisonSection() {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef(null)

  const MAX_TIME = 24 // months

  const preventiveReplacements = [6, 12, 18, 24]
  const predictiveVibration = Array.from({ length: MAX_TIME + 1 }, (_, i) => {
    if (i < 14) return 0.5 + i * 0.02
    return 0.5 + 14 * 0.02 + Math.pow(i - 14, 1.8) * 0.04
  })
  const predictiveAlertAt = 19
  const predictiveReplacements = [predictiveAlertAt + 1]
  const secondBearingStart = predictiveAlertAt + 2
  const predictiveSecondAlert = secondBearingStart + predictiveAlertAt - 1
  const allPredictiveReplacements = time > secondBearingStart ? [predictiveAlertAt + 1, Math.min(time, predictiveSecondAlert + 1)] : [predictiveAlertAt + 1]

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setTime(t => {
          if (t >= MAX_TIME) { setPlaying(false); return t }
          return t + 1
        })
      }, 300)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing])

  const toggle = () => {
    if (time >= MAX_TIME) { setTime(0); setPlaying(true) }
    else setPlaying(!playing)
  }

  const preventiveCount = preventiveReplacements.filter(r => r <= time).length
  const predictiveCount = allPredictiveReplacements.filter(r => r <= time).length

  const currentVibration = predictiveVibration[Math.min(time, MAX_TIME)]
  const alertActive = time >= predictiveAlertAt && time < predictiveAlertAt + 2

  return (
    <div>
      <Neuron mood="explaining" size="medium"
        message="Let's watch a real bearing's life over 24 months. Same bearing, two strategies — the difference is dramatic!" />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24, marginBottom: 20 }}>
        <motion.button onClick={toggle} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          {playing ? '⏸ Pause' : time >= MAX_TIME ? '↩ Restart' : time === 0 ? '▶ Start Simulation' : '▶ Resume'}
        </motion.button>
        <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(time / MAX_TIME) * 100}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, minWidth: 60 }}>Month {time}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Preventive Side */}
        <div style={{ borderRadius: 18, padding: 20, background: '#eff6ff', border: '2px solid #93c5fd' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#3b82f6', marginBottom: 14 }}>🔵 Preventive Maintenance</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Replace every 6 months, regardless of condition</div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
            {Array.from({ length: MAX_TIME }, (_, i) => i + 1).map(m => {
              const isReplacement = preventiveReplacements.includes(m) && m <= time
              const isActive = m === time
              return (
                <div key={m} style={{
                  width: 22, height: 22, borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isReplacement ? '#3b82f6' : m <= time ? '#dbeafe' : 'var(--bg-secondary)',
                  color: isReplacement ? 'white' : 'var(--text-secondary)',
                  fontWeight: isReplacement ? 700 : 400,
                  outline: isActive ? '2px solid #1d4ed8' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {isReplacement ? '🔧' : m}
                </div>
              )
            })}
          </div>

          <div style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Bearings replaced so far</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{preventiveCount}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Some replaced at only 50–70% life used (waste!)
            </div>
          </div>

          {preventiveCount > 0 && (
            <div style={{ fontSize: 12, color: '#3b82f6', fontStyle: 'italic' }}>
              🔵 Month {preventiveReplacements.slice(0, preventiveCount).join(', ')}: Replaced on schedule
            </div>
          )}
        </div>

        {/* Predictive Side */}
        <div style={{ borderRadius: 18, padding: 20, background: '#f0fdf4', border: `2px solid ${alertActive ? '#ef4444' : '#86efac'}`, transition: 'border-color 0.3s' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#22c55e', marginBottom: 14 }}>🟢 Predictive Maintenance</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Replace only when sensor detects degradation</div>

          {/* Vibration Chart */}
          <div style={{ marginBottom: 14, background: 'white', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Vibration Level (RMS m/s²)</div>
            <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 40 }}>
              {predictiveVibration.slice(0, time + 1).map((v, i) => {
                const pct = Math.min((v / 3.5) * 100, 100)
                const isAlert = v > 1.8
                return (
                  <motion.div key={i} animate={{ height: `${pct}%` }}
                    style={{ flex: 1, background: isAlert ? '#ef4444' : '#22c55e', borderRadius: '1px 1px 0 0', minHeight: 2 }} />
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#9ca3af', marginTop: 2 }}>
              <span>Month 1</span>
              <span>— Alert threshold: 1.8 m/s² —</span>
              <span>Month 24</span>
            </div>
          </div>

          {alertActive && (
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: 10, padding: 10, marginBottom: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>⚠️ ALERT: Schedule maintenance!</div>
              <div style={{ fontSize: 12, color: '#991b1b' }}>Vibration threshold exceeded — bearing at ~90% life</div>
            </motion.div>
          )}

          <div style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Bearings replaced so far</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{predictiveCount}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Replaced at 90%+ life — zero waste</div>
          </div>
        </div>
      </div>

      {time >= MAX_TIME && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 20, borderRadius: 18, padding: 24, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #22c55e', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#15803d', marginBottom: 8 }}>24-Month Results</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Preventive replaced</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6' }}>4</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>bearings</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Predictive replaced</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#22c55e' }}>2</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>bearings</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Savings</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a' }}>50%</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>fewer replacements</div>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 14, color: '#15803d', fontWeight: 600 }}>
            Multiply across 500 bearings in a plant → save ₹1.2 Cr per year on bearings alone!
          </div>
        </motion.div>
      )}

      <NeuronTip type="simple">
        A bearing costs ₹8,000. Replacing it unnecessarily at 50% life wastes ₹4,000. Multiply by 500 bearings, 4 replacements per year = ₹40 lakh wasted annually. PdM stops this.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */
function HindiSummarySection() {
  const summaryPoints = [
    { icon: '🔥', text: 'Reactive: टूटने के बाद ठीक करना — सबसे महंगा!' },
    { icon: '🔵', text: 'Preventive: समय-सारणी पर बदलना — 30% बर्बादी' },
    { icon: '🟢', text: 'Predictive: टूटने से पहले ठीक करना — सबसे स्मार्ट' },
    { icon: '🤖', text: 'Prescriptive: AI बताता है क्या, कब, कैसे ठीक करें' },
    { icon: '📡', text: '6-स्टेप पाइपलाइन: Sensor → ETL → Clean → Features → ML → Dashboard' },
    { icon: '💰', text: 'PdM से 70% downtime cost बचती है' },
  ]

  return (
    <div>
      <Neuron mood="waving" size="large"
        message="Bahut badhiya! Ab aap jaante hain ki Predictive Maintenance kya hai aur ye kyu important hai. Chalo Hindi mein ek baar aur samjhein!" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 24, marginBottom: 28 }}>
        {summaryPoints.map((point, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{point.icon}</span>
            <span style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{point.text}</span>
          </motion.div>
        ))}
      </div>

      <HindiExplainer
        concept="Predictive Maintenance (PdM)"
        english="Predictive Maintenance — using sensor data and machine learning to predict equipment failure before it happens"
        explanation="सोचिए आपकी एक factory में एक बड़ी motor है। अगर वो अचानक बंद हो जाए, तो production रुक जाएगी और lakhs का नुकसान होगा। Predictive Maintenance यही करती है — वो हर second उस motor पर नज़र रखती है। जैसे एक doctor patient की pulse check करता है, वैसे ही sensor motor की 'pulse' check करते हैं। अगर कुछ गड़बड़ दिखे, तो system advance में alert दे देता है: 'इस हफ्ते maintenance करो, नहीं तो अगले महीने यह टूट जाएगा।' इससे आप planned time में, सही parts लेकर, काम ठीक कर सकते हो — बिना emergency के।"
        example="उदाहरण: Tata Steel के blast furnace में एक compressor था जो हर 8 महीने में अचानक बंद हो जाता था और ₹10 Cr का नुकसान करता था। PdM system ने vibration में बदलाव देखा और 3 हफ्ते पहले alert दिया। अगली planned shutdown में bearing बदली गई — कोई production loss नहीं, कोई emergency नहीं। पहले साल में ₹85 Cr बचे!"
        terms={[
          { hindi: 'भविष्यवाणी आधारित रखरखाव', english: 'Predictive Maintenance', meaning: 'Future failure predict karke pahle se maintenance karna' },
          { hindi: 'संवेदक', english: 'Sensor', meaning: 'Machine ki health measure karne wala device — jaise thermometer ya stethoscope' },
          { hindi: 'विफलता पूर्वानुमान', english: 'Failure Prediction', meaning: 'ML model ka yeh batana ki machine kab tootegi' },
          { hindi: 'बंद समय', english: 'Downtime', meaning: 'Woh time jab machine band hoti hai aur production ruk jata hai' },
          { hindi: 'निवेश पर प्रतिफल', english: 'ROI (Return on Investment)', meaning: 'Lagaye paison se kitna profit hua — jaise ₹1L lagaya, ₹8L mila = 800% ROI' },
          { hindi: 'मशीन लर्निंग', english: 'Machine Learning', meaning: 'Data se seekhkar prediction karne wala AI algorithm' },
        ]}
      />
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic1Content() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 4px' }}>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48, padding: '40px 24px 32px' }}>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: 64, marginBottom: 16 }}>⚙️</motion.div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.2 }}>
          What is Predictive Maintenance?
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 20px', lineHeight: 1.6 }}>
          From fixing things when they break to knowing <em>exactly</em> when they will — and intervening before the damage happens.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['4 Maintenance Types', 'Live ROI Calculator', '6-Stage Pipeline', '6 Indian Case Studies', 'Interactive Data Explorer', 'Bearing Simulation'].map(tag => (
            <span key={tag} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
      </motion.div>

      {/* Section 1 */}
      <SectionBlock icon="🔧" title="The Four Types of Maintenance" color="#ef4444">
        <MaintenanceTypesSection />
      </SectionBlock>

      <HindiExplainer
        concept="चार प्रकार के रखरखाव"
        english="The Four Types of Maintenance"
        explanation="सोचिए आपकी car है। Reactive maintenance मतलब — गाड़ी सड़क पर बंद हो जाए तब ठीक करो। Preventive maintenance मतलब — हर 6 महीने में service करो, चाहे ज़रूरत हो या न हो। Predictive maintenance मतलब — engine का temperature sensor देखो, अगर बढ़ रहा है तो service schedule करो। Prescriptive maintenance मतलब — AI खुद बता दे: 'इस शनिवार को यह part बदलो, यह mechanic बुलाओ, यह समय लगेगा।' Factory में यही logic pumps, motors और compressors पर apply होता है।"
        example="एक textile mill में motor था जो Reactive strategy से हर 8 महीने में अचानक बंद हो जाता था — ₹12 लाख का नुकसान। Predictive strategy से vibration sensor ने 3 हफ्ते पहले alert दिया। Planned shutdown में bearing बदली — कुल खर्च ₹45,000। फर्क देखो: ₹12 लाख vs ₹45,000!"
        terms={[
          { hindi: 'प्रतिक्रियाशील रखरखाव', english: 'Reactive Maintenance', meaning: 'टूटने के बाद ठीक करना — सबसे महंगा, सबसे बुरा approach' },
          { hindi: 'निवारक रखरखाव', english: 'Preventive Maintenance', meaning: 'Fix schedule पर — ज़रूरत हो या न हो, 30% time waste होता है' },
          { hindi: 'भविष्यसूचक रखरखाव', english: 'Predictive Maintenance', meaning: 'Sensor data देखकर predict करना — सही time पर सही action' },
        ]}
      />

      {/* Section 2 */}
      <SectionBlock icon="💰" title="Calculate Your Factory's ROI" color="#22c55e">
        <ROICalculator />
      </SectionBlock>

      <HindiExplainer
        concept="ROI — निवेश पर वापसी"
        english="Return on Investment — measuring PdM savings"
        explanation="ROI का मतलब है: जितना पैसा लगाया, उससे कितना ज़्यादा कमाया? PdM में ROI calculate करना simple है — पहले देखो कितना downtime cost होती है, फिर देखो PdM से कितनी बचत होगी, उसमें से setup cost घटाओ। अगर एक Indian factory में हर घंटे बंद रहने पर ₹5 लाख का नुकसान होता है और साल में 120 घंटे downtime है — तो सालाना नुकसान ₹6 करोड़ है। PdM से 70% बचाओ तो ₹4.2 करोड़ बचते हैं। Setup cost ₹50 लाख भी हो तो पहले साल ₹3.7 करोड़ profit।"
        example="Indian Railways ने PdM में ₹500 करोड़ invest किए locomotive bearings monitor करने के लिए। Result: साल में ₹2,400 करोड़ की बचत — यानी 480% ROI पहले साल में! Setup cost 5 महीने में recover हो गई।"
        terms={[
          { hindi: 'निवेश पर प्रतिफल', english: 'ROI (Return on Investment)', meaning: 'Profit ÷ Investment × 100 — PdM में आमतौर पर 300–800% ROI मिलता है' },
          { hindi: 'बंद समय लागत', english: 'Downtime Cost', meaning: 'हर घंटे production बंद रहने का नुकसान — इसी से PdM का case बनता है' },
          { hindi: 'वापसी अवधि', english: 'Payback Period', meaning: 'कितने महीनों में investment recover होगी — PdM में usually 6-18 months' },
        ]}
      />

      {/* Section 3 */}
      <SectionBlock icon="🔬" title="How PdM Actually Works: The 6-Stage Pipeline" color="#6366f1">
        <PipelineSection />
      </SectionBlock>

      <HindiExplainer
        concept="6-स्टेज PdM पाइपलाइन"
        english="The 6-Stage Predictive Maintenance Pipeline"
        explanation="PdM system एक assembly line की तरह काम करता है — हर stage पर raw data process होता है और finally एक actionable alert निकलता है। Stage 1 में sensors machine की readings लेते हैं (vibration, temperature, etc.)। Stage 2 में ETL pipeline data को standardize करती है। Stage 3 में noisy readings clean होती हैं। Stage 4 में Feature Engineering होती है — raw readings से meaningful patterns निकाले जाते हैं। Stage 5 में ML model failure probability predict करता है। Stage 6 में maintenance team को dashboard पर alert मिलता है।"
        example="Reliance Jamnagar refinery में एक pump का vibration sensor reading लेता है हर millisecond — Stage 1। यह data ETL pipeline से standardize होता है — Stage 2। Outlier readings हटाई जाती हैं — Stage 3। RMS, FFT features निकाले जाते हैं — Stage 4। ML model 78% failure probability देता है — Stage 5। Alert: 'Pump P-203 — अगले 5 दिन में maintenance करो' — Stage 6।"
        terms={[
          { hindi: 'सेंसर डेटा', english: 'Sensor Data', meaning: 'Machine से raw readings — हर second हज़ारों data points' },
          { hindi: 'फीचर इंजीनियरिंग', english: 'Feature Engineering', meaning: 'Raw data से meaningful patterns निकालना — जैसे vibration का RMS, FFT peak' },
          { hindi: 'शेष उपयोगी जीवन', english: 'RUL (Remaining Useful Life)', meaning: 'Machine कितने दिन और चलेगी — ML model का main output' },
        ]}
      />

      {/* Section 4 */}
      <SectionBlock icon="🏆" title="Real-World PdM Success Stories" color="#f59e0b">
        <SuccessStoriesSection />
      </SectionBlock>

      <HindiExplainer
        concept="भारतीय कंपनियों की सफलता"
        english="Indian PdM Success Stories"
        explanation="PdM सिर्फ theory नहीं है — भारत की सबसे बड़ी कंपनियां इसे आज use कर रही हैं और करोड़ों बचा रही हैं। Tata Steel (Jamshedpur) ने blast furnace में PdM लगाया और ₹85 करोड़ सालाना बचाए। Indian Railways ने locomotive bearings monitor करके 200 potential derailments रोके। Maruti Suzuki (Manesar) ने robotic arms पर PdM लगाया और 99.2% uptime achieve किया। ये सब उसी technology से — sensors, ML models, और alerts — जो आप इस course में सीख रहे हैं।"
        example="NTPC के power plant में steam turbines हर 4 साल में overhaul होती थीं। PdM लगाने के बाद data से पता चला कि turbines 5.4 साल तक safe चल सकती हैं। इससे ₹180 करोड़ बचे — सिर्फ overhaul schedule बदलकर, बिना कोई extra investment के!"
        terms={[
          { hindi: 'विफलता का कारण', english: 'Failure Mode', meaning: 'किस वजह से machine टूटी — bearing wear, cavitation, overload, misalignment' },
          { hindi: 'माध्य विफलता के बीच का समय', english: 'MTBF (Mean Time Between Failures)', meaning: 'Average कितने दिनों बाद machine fail होती है — PdM से यह बढ़ता है' },
          { hindi: 'उत्पादन उपलब्धता', english: 'Plant Availability', meaning: 'Factory कितने % time production में है — PdM से यह 94% से 97%+ हो जाता है' },
        ]}
      />

      {/* Section 5 */}
      <SectionBlock icon="📊" title="What Data Does PdM Need?" color="#06b6d4">
        <DataSourcesSection />
      </SectionBlock>

      <HindiExplainer
        concept="PdM के लिए कौन सा डेटा चाहिए?"
        english="What Data Does Predictive Maintenance Need?"
        explanation="PdM सिर्फ sensors से नहीं चलती — इसे 4 types के data की ज़रूरत होती है। पहला: Sensor Data — vibration, temperature, pressure, current जो machine से real-time आते हैं। दूसरा: Work Orders — पिछली बार machine कब टूटी थी, क्या बदला गया, कितना खर्चा हुआ। तीसरा: Asset Profile — machine कितनी पुरानी है, उसकी design life क्या है, किस manufacturer की है। चौथा: Operational Data — machine पर कितना load है, कितनी shifts चलती है, environment कैसा है। इन चारों को मिलाकर ML model सबसे accurate prediction देता है।"
        example="एक pump है — sensor बताता है vibration 3.2 mm/s है (थोड़ा high)। Work order बताता है 6 महीने पहले bearing बदली गई थी। Asset profile बताता है pump 7 साल पुरानी है और design life 10 साल है। Operational data बताता है कल 98% load पर चली। इन सबको ML model combine करके बताता है: '45% failure probability, अगले 10 दिन में maintenance करो।'"
        terms={[
          { hindi: 'कार्य आदेश', english: 'Work Order', meaning: 'Maintenance का official record — क्या टूटा, कब, क्या किया, कितना खर्चा' },
          { hindi: 'संपत्ति प्रोफ़ाइल', english: 'Asset Profile', meaning: 'Machine की पूरी history — age, model, design life, criticality rating' },
          { hindi: 'परिचालन डेटा', english: 'Operational Data', meaning: 'Machine का context — load %, starts/day, temperature, shift pattern' },
        ]}
      />

      {/* Section 6 */}
      <SectionBlock icon="⚙️" title="PdM vs Preventive: The Bearing Simulation" color="#8b5cf6">
        <InteractiveDemo title="24-Month Bearing Life Simulation" instruction="Press Start to watch the same bearing run under two different maintenance strategies side-by-side">
          <BearingComparisonSection />
        </InteractiveDemo>
      </SectionBlock>

      <HindiExplainer
        concept="Bearing की जीवन तुलना"
        english="Bearing Life: Preventive vs Predictive"
        explanation="Bearing एक छोटा लेकिन critical part है — यह rotating shaft को support करता है। Preventive strategy में bearing हर 6 महीने में बदली जाती है, चाहे उसमें अभी 50% life बाकी हो — यह waste है। Predictive strategy में vibration sensor bearing की condition monitor करता है। जब vibration 1.8 mm/s threshold cross करे — तभी bearing बदलो। 24 महीनों में Preventive ने 4 bearings बदलीं, Predictive ने सिर्फ 2 — 50% savings! एक plant में 500 bearings हों तो साल में ₹1.2 करोड़ बचते हैं सिर्फ bearings पर।"
        example="Maruti Suzuki की Manesar factory में robot arms के bearings पहले हर 3 महीने में बदले जाते थे (scheduled)। PdM लगाने के बाद पता चला — ज़्यादातर bearings 7-8 महीने आराम से चल सकती हैं। साल में ₹35 करोड़ की बचत हुई, और robot downtime 45% कम हुआ।"
        terms={[
          { hindi: 'असर', english: 'Bearing', meaning: 'Rotating shaft को support करने वाला part — सबसे common failure point' },
          { hindi: 'कंपन सीमा', english: 'Vibration Threshold', meaning: 'जिस level पर vibration पहुंचे तो maintenance ज़रूरी — PdM का alarm trigger' },
          { hindi: 'शेष जीवन', english: 'Remaining Life', meaning: 'Bearing अभी कितने % life use हो चुकी है — PdM से near 90% पर replace होती है' },
        ]}
      />

      {/* Section 7 */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी सारांश" color="#ff9933">
        <HindiSummarySection />
      </SectionBlock>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ textAlign: 'center', padding: '32px 24px', marginTop: 12 }}>
        <NeuronTip type="try">
          <strong>Ready for the next step?</strong> In Topic 2, we will look at real sensor data from NASA's bearing dataset, run a Python script to detect failure signatures, and build your first RUL prediction model!
        </NeuronTip>
      </motion.div>

    </div>
  )
}
