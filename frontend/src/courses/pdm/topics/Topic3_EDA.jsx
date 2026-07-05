import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 3 — Exploratory Data Analysis for Predictive Maintenance
   SteelForge Manufacturing — 50 pumps, 6 months, 54,000 records
================================================================ */

const C = {
  blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981',
  orange: '#f59e0b', pink: '#ec4899', red: '#ef4444',
  cyan: '#06b6d4', indigo: '#6366f1', yellow: '#eab308',
  teal: '#14b8a6', lime: '#84cc16', rose: '#f43f5e',
}

/* ─── Seeded pseudo-random for stable visuals ─── */
function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

/* ════════════════════════════════════════════════════════════════
   SECTION 1 — Dataset Overview Dashboard
════════════════════════════════════════════════════════════════ */
const COLUMNS = [
  { name: 'pump_id',       type: 'Categorical', unique: 50,      missing: '0%',   example: 'PUMP_007',      desc: 'Unique pump identifier — links all sensor readings to a specific machine in the factory.' },
  { name: 'timestamp',     type: 'DateTime',    unique: 54000,   missing: '0%',   example: '2024-01-15 08:05:00', desc: 'UTC timestamp of the sensor reading. Recorded every 4 minutes, 24/7.' },
  { name: 'vibration_rms', type: 'Float',       unique: 41200,   missing: '1.2%', example: '2.47 mm/s',     desc: 'Root mean square vibration velocity. Rising values signal bearing wear or imbalance.' },
  { name: 'temperature',   type: 'Float',       unique: 38700,   missing: '0.8%', example: '73.2°C',        desc: 'Pump casing temperature. Spikes before seal failure. Bimodal: day/night shift operating conditions.' },
  { name: 'pressure_in',   type: 'Float',       unique: 29300,   missing: '0.4%', example: '104.8 PSI',     desc: 'Inlet pressure. Sudden drops indicate cavitation or blockage upstream.' },
  { name: 'pressure_out',  type: 'Float',       unique: 28900,   missing: '0.6%', example: '198.3 PSI',     desc: 'Outlet pressure. Together with inlet pressure gives differential — the work the pump is doing.' },
  { name: 'current_draw',  type: 'Float',       unique: 31500,   missing: '0.9%', example: '12.4 A',        desc: 'Motor current in amperes. Gradual increases signal winding degradation or mechanical overload.' },
  { name: 'flow_rate',     type: 'Float',       unique: 27800,   missing: '1.5%', example: '85.3 L/min',    desc: 'Volumetric flow rate through the pump. Drops indicate clogging or impeller wear.' },
  { name: 'oil_viscosity', type: 'Float',       unique: 4200,    missing: '3.2%', example: '46.1 cSt',      desc: 'Lubrication oil viscosity. High values after long intervals indicate oil degradation.' },
  { name: 'rpm',           type: 'Float',       unique: 8100,    missing: '0.2%', example: '1487 RPM',      desc: 'Shaft rotational speed. Unexpected drops signal motor issues or load changes.' },
  { name: 'equipment_age', type: 'Integer',     unique: 115,     missing: '0%',   example: '42 months',     desc: 'Pump age in months since installation. Strong predictor — older pumps fail more often.' },
  { name: 'last_service',  type: 'Integer',     unique: 180,     missing: '0%',   example: '67 days',       desc: 'Days since last scheduled maintenance. Used to compute time-since-service feature.' },
  { name: 'shift',         type: 'Categorical', unique: 3,       missing: '0%',   example: 'Night',         desc: 'Operating shift (Day/Evening/Night). Different thermal profiles affect temperature readings.' },
  { name: 'failure_flag',  type: 'Binary',      unique: 2,       missing: '0%',   example: '0',             desc: 'TARGET: 1 = failure occurred within 24 hours. 0 = normal operation. ~5% of all records.' },
  { name: 'failure_mode',  type: 'Categorical', unique: 6,       missing: '95%',  example: 'Bearing Wear',  desc: 'Type of failure (only filled when failure_flag=1). Modes: Bearing, Seal, Cavitation, Overload, Blockage, Imbalance.' },
]

const MISSING_GRID = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,95],
  [0,0,1,1,0,1,1,2,3,0,0,0,0,0,95],
  [0,0,1,0,0,0,1,1,3,0,0,0,0,0,95],
  [0,0,2,1,1,1,1,2,3,0,0,0,0,0,95],
  [0,0,1,0,0,0,1,1,3,0,0,0,0,0,95],
  [0,0,0,0,0,1,1,2,4,0,0,0,0,0,95],
]

function DatasetDashboard() {
  const [count, setCount] = useState(0)
  const [selectedCol, setSelectedCol] = useState(null)
  const targetCount = 54000

  useEffect(() => {
    if (count >= targetCount) return
    const step = Math.ceil((targetCount - count) / 40)
    const t = setTimeout(() => setCount(c => Math.min(c + step, targetCount)), 30)
    return () => clearTimeout(t)
  }, [count])

  const colMissingPct = (col) => parseFloat(col.missing) || 0
  const maxMissing = 95

  const cellColor = (pct) => {
    if (pct === 0) return `${C.green}20`
    if (pct < 2) return `${C.yellow}40`
    if (pct < 5) return `${C.orange}50`
    return `${C.red}60`
  }

  const colTextColor = (pct) => {
    if (pct === 0) return C.green
    if (pct < 2) return C.yellow
    if (pct < 5) return C.orange
    return C.red
  }

  return (
    <div>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Records', value: count.toLocaleString(), icon: '🗄️', color: C.indigo },
          { label: 'Features', value: '15', icon: '📊', color: C.cyan },
          { label: 'Pumps Monitored', value: '50', icon: '⚙️', color: C.teal },
          { label: 'Data Duration', value: '6 Months', icon: '📅', color: C.purple },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12 }}
            style={{
              background: `${kpi.color}10`,
              border: `1.5px solid ${kpi.color}30`,
              borderRadius: 16, padding: '18px 16px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>{kpi.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, fontFamily: 'var(--font-heading)' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Column explorer */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Feature Columns — click any column to inspect
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {COLUMNS.map((col) => {
            const pct = colMissingPct(col)
            const isSelected = selectedCol?.name === col.name
            return (
              <motion.button
                key={col.name}
                onClick={() => setSelectedCol(isSelected ? null : col)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  background: isSelected ? cellColor(pct) : 'var(--bg-secondary)',
                  border: isSelected ? `2px solid ${colTextColor(pct)}` : '1px solid var(--border)',
                  color: isSelected ? colTextColor(pct) : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'monospace',
                }}
              >
                {col.name}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Column detail panel */}
      <AnimatePresence>
        {selectedCol && (
          <motion.div
            key={selectedCol.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '20px 24px', marginBottom: 24,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
              {[
                { label: 'Column', val: selectedCol.name, mono: true },
                { label: 'Data Type', val: selectedCol.type, mono: false },
                { label: 'Unique Values', val: selectedCol.unique.toLocaleString(), mono: false },
                { label: 'Missing', val: selectedCol.missing, mono: false, color: colTextColor(colMissingPct(selectedCol)) },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: item.color || 'var(--text-primary)', fontFamily: item.mono ? 'monospace' : 'inherit' }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{selectedCol.desc}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: C.cyan, background: `${C.cyan}10`, padding: '4px 12px', borderRadius: 8, display: 'inline-block' }}>
              e.g. {selectedCol.example}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missing data heatmap */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Missing Data Heatmap
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
            (darker = more missing, per sample of 6 pumps × 15 features)
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(15, 44px)`, gap: 3, minWidth: 750 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>Pump</div>
            {COLUMNS.map(col => (
              <div key={col.name} style={{ fontSize: 9, color: 'var(--text-secondary)', textAlign: 'center', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {col.name}
              </div>
            ))}
            {MISSING_GRID.map((row, ri) => (
              <>
                <div key={`label-${ri}`} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                  PUMP_{String(ri + 1).padStart(2, '0')}
                </div>
                {row.map((pct, ci) => (
                  <motion.div
                    key={`${ri}-${ci}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (ri * 15 + ci) * 0.005 }}
                    title={`${COLUMNS[ci].name}: ${pct}% missing`}
                    style={{
                      height: 28, borderRadius: 4,
                      background: pct === 0
                        ? `${C.green}22`
                        : pct < 2 ? `${C.yellow}50`
                        : pct < 5 ? `${C.orange}60`
                        : `${C.red}80`,
                      border: `1px solid ${pct === 0 ? C.green + '20' : C.orange + '30'}`,
                    }}
                  />
                ))}
              </>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          {[{ label: '0% missing', color: `${C.green}22`, border: C.green }, { label: '<2%', color: `${C.yellow}50`, border: C.yellow }, { label: '2-5%', color: `${C.orange}60`, border: C.orange }, { label: '>5%', color: `${C.red}80`, border: C.red }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: l.color, border: `1px solid ${l.border}30` }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Class distribution */}
      <div style={{ background: `${C.red}08`, border: `1.5px solid ${C.red}25`, borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 14 }}>
          Class Distribution — Critical Imbalance Alert!
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
          {[
            { label: 'Normal Operation', pct: 95, count: '51,300', color: C.green },
            { label: 'Pre-Failure', pct: 5, count: '2,700', color: C.red },
          ].map(bar => (
            <div key={bar.label} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{bar.label}</span>
                <span style={{ fontWeight: 700, color: bar.color }}>{bar.pct}% ({bar.count})</span>
              </div>
              <div style={{ height: 28, background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${bar.color}80, ${bar.color})`, borderRadius: 8 }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.red, fontWeight: 600 }}>
          ⚠️ 95:5 imbalance — a naive model that always predicts "Normal" gets 95% accuracy but zero utility! You'll need SMOTE oversampling or class-weighted loss functions.
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   SECTION 2 — Distribution Explorer
════════════════════════════════════════════════════════════════ */
const DISTRIBUTIONS = {
  vibration: {
    label: 'Vibration (mm/s)',
    color: C.blue,
    unit: 'mm/s',
    bins: Array.from({ length: 20 }, (_, i) => {
      const x = 0.5 + i * 0.5
      const normal = Math.exp(-0.5 * ((x - 2.5) / 0.6) ** 2) * 0.96 + 0.04 * Math.exp(-0.5 * ((x - 6.5) / 1.2) ** 2)
      const failure = Math.exp(-0.5 * ((x - 5.8) / 1.0) ** 2)
      return { x: x.toFixed(1), normal: Math.max(0, normal), failure: Math.max(0, failure), count: Math.round(normal * 4200), fCount: Math.round(failure * 180) }
    }),
    insight: 'Normal pumps cluster around 2.5 mm/s. Failing pumps show elevated vibration (4–8 mm/s). The tail overlap makes thresholding tricky — ML beats simple rules here.',
  },
  temperature: {
    label: 'Temperature (°C)',
    color: C.orange,
    unit: '°C',
    bins: Array.from({ length: 20 }, (_, i) => {
      const x = 50 + i * 4
      const normal = 0.5 * Math.exp(-0.5 * ((x - 65) / 5) ** 2) + 0.5 * Math.exp(-0.5 * ((x - 82) / 5) ** 2)
      const failure = Math.exp(-0.5 * ((x - 94) / 6) ** 2)
      return { x: `${x}°`, normal: Math.max(0, normal), failure: Math.max(0, failure), count: Math.round(normal * 3800), fCount: Math.round(failure * 160) }
    }),
    insight: 'Bimodal distribution: two peaks at 65°C (night shift, lower load) and 82°C (day shift). Failing pumps spike to 90–105°C. Shift-specific z-scores needed!',
  },
  pressure: {
    label: 'Pressure (PSI)',
    color: C.purple,
    unit: 'PSI',
    bins: Array.from({ length: 20 }, (_, i) => {
      const x = 90 + i * 5
      const normal = Math.exp(-0.5 * ((x - 105) / 4) ** 2) + (x > 130 ? 0.08 * Math.exp(-0.5 * ((x - 140) / 3) ** 2) : 0)
      const failure = 0.4 * Math.exp(-0.5 * ((x - 92) / 3) ** 2) + 0.6 * Math.exp(-0.5 * ((x - 145) / 4) ** 2)
      return { x: `${x}`, normal: Math.max(0, normal), failure: Math.max(0, failure), count: Math.round(normal * 3500), fCount: Math.round(failure * 120) }
    }),
    insight: 'Tight cluster around 105 PSI — good sign. Outlier spikes above 135 PSI indicate cavitation bursts. Failure distribution splits: either pressure drop (blockage) or spike (overpressure).',
  },
  age: {
    label: 'Equipment Age (months)',
    color: C.teal,
    unit: 'months',
    bins: Array.from({ length: 20 }, (_, i) => {
      const x = 6 + i * 6
      const normal = 1 / 20 + 0.01 * Math.sin(i * 0.5)
      const failure = 0.02 + 0.08 * (i / 19) ** 2
      return { x: `${x}`, normal: Math.max(0.02, normal), failure: Math.max(0, failure), count: Math.round(normal * 2800), fCount: Math.round(failure * 200) }
    }),
    insight: 'Nearly uniform distribution — pumps installed at different times. But failure rate rises steeply after 84 months (7 years). Equipment age is a strong feature for tree-based models.',
  },
}

function DistributionExplorer() {
  const [selected, setSelected] = useState('vibration')
  const [mode, setMode] = useState('all')
  const [hoveredBar, setHoveredBar] = useState(null)

  const dist = DISTRIBUTIONS[selected]
  const maxVal = Math.max(...dist.bins.map(b => mode === 'all' ? b.normal : b.failure))

  return (
    <div>
      {/* Feature tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(DISTRIBUTIONS).map(([key, d]) => (
          <motion.button
            key={key}
            onClick={() => { setSelected(key); setHoveredBar(null) }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '8px 18px', borderRadius: 24, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: selected === key ? `linear-gradient(135deg, ${d.color}cc, ${d.color})` : 'var(--bg-secondary)',
              color: selected === key ? 'white' : 'var(--text-secondary)',
              border: selected === key ? 'none' : '1px solid var(--border)',
            }}
          >
            {d.label}
          </motion.button>
        ))}
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {[{ key: 'all', label: 'All Data', color: dist.color }, { key: 'failure', label: 'Failure Only', color: C.red }].map(m => (
          <motion.button
            key={m.key}
            onClick={() => setMode(m.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: mode === m.key ? `${m.color}20` : 'transparent',
              color: mode === m.key ? m.color : 'var(--text-secondary)',
              border: `1.5px solid ${mode === m.key ? m.color : 'var(--border)'}`,
            }}
          >
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Histogram */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 180, padding: '0 4px', marginBottom: 8 }}>
        {dist.bins.map((bin, i) => {
          const val = mode === 'all' ? bin.normal : bin.failure
          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0
          const barColor = mode === 'all' ? dist.color : C.red
          const isHovered = hoveredBar === i
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
              title={`${bin.x} ${dist.unit}: ${mode === 'all' ? bin.count.toLocaleString() : bin.fCount.toLocaleString()} records`}
              style={{
                flex: 1, borderRadius: '4px 4px 0 0', cursor: 'pointer',
                background: isHovered
                  ? `linear-gradient(to top, ${barColor}, ${barColor}dd)`
                  : `linear-gradient(to top, ${barColor}60, ${barColor}aa)`,
                border: isHovered ? `1px solid ${barColor}` : 'none',
                transition: 'background 0.15s',
              }}
            />
          )
        })}
      </div>

      {/* X-axis labels (every 4th) */}
      <div style={{ display: 'flex', gap: 4, padding: '0 4px', marginBottom: 16 }}>
        {dist.bins.map((bin, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-secondary)' }}>
            {i % 4 === 0 ? bin.x : ''}
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredBar !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{
              background: 'var(--bg-card)', border: `1px solid ${dist.color}40`,
              borderRadius: 10, padding: '10px 16px', fontSize: 13, marginBottom: 12,
              color: 'var(--text-primary)',
            }}
          >
            <strong style={{ color: dist.color }}>{dist.bins[hoveredBar].x} {dist.unit}</strong>
            {' — '}
            {mode === 'all'
              ? <>{dist.bins[hoveredBar].count.toLocaleString()} records (all data)</>
              : <span style={{ color: C.red }}>{dist.bins[hoveredBar].fCount.toLocaleString()} failure records</span>
            }
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, padding: '12px 16px', background: `${dist.color}08`, borderRadius: 12, border: `1px solid ${dist.color}20` }}>
        <strong style={{ color: dist.color }}>Insight:</strong> {dist.insight}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   SECTION 3 — Correlation Matrix
════════════════════════════════════════════════════════════════ */
const FEATURES = ['vibration', 'temperature', 'pressure', 'current', 'flow', 'rpm', 'age', 'failure']
const CORR_MATRIX = [
//  vib    temp   press  curr   flow   rpm    age    fail
  [ 1.00,  0.72,  0.18,  0.41,  -0.31, -0.22,  0.29,  0.63],
  [ 0.72,  1.00,  0.12,  0.35,  -0.28, -0.18,  0.24,  0.58],
  [ 0.18,  0.12,  1.00,  0.38,   0.15, -0.09,  0.07,  0.21],
  [ 0.41,  0.35,  0.38,  1.00,  -0.19, -0.12,  0.18,  0.49],
  [-0.31, -0.28,  0.15, -0.19,   1.00,  0.44, -0.12, -0.27],
  [-0.22, -0.18, -0.09, -0.12,   0.44,  1.00, -0.08, -0.19],
  [ 0.29,  0.24,  0.07,  0.18,  -0.12, -0.08,  1.00,  0.45],
  [ 0.63,  0.58,  0.21,  0.49,  -0.27, -0.19,  0.45,  1.00],
]

const SCATTER_PRESETS = {
  '0-1': { x: 'vibration', y: 'temperature', r: 0.72, color: C.red, note: 'Strong positive: both rise together as pump degrades. Pre-failure cluster clearly separated.' },
  '0-7': { x: 'vibration', y: 'failure', r: 0.63, color: C.rose, note: 'Moderate positive: high vibration strongly predicts failure. Best single predictor.' },
  '6-7': { x: 'age', y: 'failure', r: 0.45, color: C.orange, note: 'Moderate: older pumps fail more. Non-linear in practice — accelerates after 84 months.' },
  '2-3': { x: 'pressure', y: 'current', r: 0.38, color: C.purple, note: 'Mechanical coupling: higher load (pressure) draws more current from the motor.' },
  '4-5': { x: 'flow', y: 'rpm', r: 0.44, color: C.blue, note: 'Expected: faster shaft speed moves more fluid (within normal operating range).' },
}

function corrColor(r) {
  if (r >= 0.7) return C.red
  if (r >= 0.4) return C.orange
  if (r >= 0.2) return C.yellow
  if (r > -0.2) return '#94a3b8'
  if (r > -0.4) return C.cyan
  return C.blue
}
function corrBg(r) {
  const abs = Math.abs(r)
  const alpha = Math.round(abs * 200).toString(16).padStart(2, '0')
  return r > 0 ? `${C.red}${alpha}` : `${C.blue}${alpha}`
}

function CorrelationMatrix() {
  const [selectedCell, setSelectedCell] = useState('0-1')

  const preset = SCATTER_PRESETS[selectedCell]
  const corrVal = selectedCell ? CORR_MATRIX[parseInt(selectedCell)][parseInt(selectedCell.split('-')[1])] : null

  /* Generate stable scatter points */
  const scatterPoints = preset ? (() => {
    const rng = seededRand(42)
    const r = preset.r
    return Array.from({ length: 120 }, () => {
      const x = rng() * 0.9 + 0.05
      const y = r * x + Math.sqrt(1 - r * r) * (rng() * 0.3) + (1 - r) * 0.35
      const isFailure = x > 0.72 && y > 0.68 && rng() > 0.5
      return { x, y: Math.max(0, Math.min(1, y)), fail: isFailure }
    })
  })() : []

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Matrix */}
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Click any cell to see scatter plot</div>
          <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(8, 52px)`, gap: 3 }}>
            <div />
            {FEATURES.map(f => (
              <div key={f} style={{ fontSize: 9, color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', paddingBottom: 4 }}>
                {f.slice(0, 4)}
              </div>
            ))}
            {CORR_MATRIX.map((row, ri) => (
              <>
                <div key={`label-${ri}`} style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', fontWeight: 600, textTransform: 'uppercase' }}>
                  {FEATURES[ri].slice(0, 4)}
                </div>
                {row.map((r, ci) => {
                  const cellKey = `${ri}-${ci}`
                  const isSelected = selectedCell === cellKey
                  const isDiag = ri === ci
                  return (
                    <motion.div
                      key={cellKey}
                      onClick={() => !isDiag && setSelectedCell(isSelected ? null : cellKey)}
                      whileHover={!isDiag ? { scale: 1.12 } : {}}
                      title={`${FEATURES[ri]} ↔ ${FEATURES[ci]}: ${r.toFixed(2)}`}
                      style={{
                        width: 52, height: 40, borderRadius: 6,
                        background: isDiag ? '#64748b30' : corrBg(r),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        color: isDiag ? '#64748b' : corrColor(r),
                        cursor: isDiag ? 'default' : 'pointer',
                        border: isSelected ? `2px solid ${corrColor(r)}` : '1px solid transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isDiag ? '—' : r.toFixed(2)}
                    </motion.div>
                  )
                })}
              </>
            ))}
          </div>
          {/* Color scale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
            <span style={{ color: C.blue, fontWeight: 700 }}>-1.0</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${C.blue}, #94a3b8, ${C.red})` }} />
            <span style={{ color: C.red, fontWeight: 700 }}>+1.0</span>
          </div>
        </div>

        {/* Scatter plot */}
        {preset && (
          <motion.div
            key={selectedCell}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ flex: 1, minWidth: 220 }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {preset.x} vs {preset.y}
              <span style={{ fontSize: 15, marginLeft: 8, color: corrColor(preset.r) }}>r = {preset.r}</span>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingTop: '75%', background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 200 150">
                {/* Grid */}
                {[0.25, 0.5, 0.75].map(t => (
                  <g key={t}>
                    <line x1={t * 180 + 10} y1={10} x2={t * 180 + 10} y2={140} stroke="#ffffff10" />
                    <line x1={10} y1={t * 130 + 10} x2={190} y2={t * 130 + 10} stroke="#ffffff10" />
                  </g>
                ))}
                {/* Trend line */}
                <line x1={10} y1={140 - preset.r * 100} x2={190} y2={140 - preset.r * 40 - 30} stroke={preset.color} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
                {/* Points */}
                {scatterPoints.map((p, i) => (
                  <motion.circle
                    key={i}
                    cx={p.x * 180 + 10}
                    cy={140 - p.y * 130}
                    r={p.fail ? 3.5 : 2.5}
                    fill={p.fail ? C.red : preset.color}
                    fillOpacity={p.fail ? 0.9 : 0.55}
                    initial={{ r: 0 }}
                    animate={{ r: p.fail ? 3.5 : 2.5 }}
                    transition={{ delay: i * 0.004 }}
                  />
                ))}
              </svg>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {preset.note}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   SECTION 4 — Time Series Patterns
════════════════════════════════════════════════════════════════ */
function generateTimeSeries() {
  const rng = seededRand(77)
  const days = 180
  const failureDay = 162

  return Array.from({ length: days }, (_, d) => {
    const isLate = d > 120
    const isPreFail = d > 145
    const isFail = d >= failureDay

    const vibBase = isPreFail ? 2.5 + (d - 145) * 0.18 : 2.5
    const vib = isFail ? 9.2 + rng() * 1.5 : vibBase + rng() * 0.4 - 0.2

    const tempBase = isLate ? 74 + (d - 120) * 0.08 : 73
    const temp = isFail ? 97 + rng() * 4 : tempBase + rng() * 2 - 1 + (d % 3 === 0 ? 5 : 0)

    const currBase = isPreFail ? 12.1 + (d - 145) * 0.04 : 12.1
    const curr = isFail ? 15.8 + rng() * 0.8 : currBase + rng() * 0.3 - 0.15

    return { day: d + 1, vib: Math.max(1, vib), temp: Math.max(60, temp), curr: Math.max(11, curr), fail: isFail }
  })
}

const TS_DATA = generateTimeSeries()

const TS_METRICS = [
  { key: 'vib', label: 'Vibration (mm/s)', color: C.blue, min: 1, max: 11, desc: 'Stable for 4 months → gradual rise in month 5 → spike at failure' },
  { key: 'temp', label: 'Temperature (°C)', color: C.orange, min: 60, max: 105, desc: 'Follows vibration with ~2-day lag. Thermal stress indicator.' },
  { key: 'curr', label: 'Current Draw (A)', color: C.purple, min: 11, max: 17, desc: 'Subtle increase signals motor strain. Easy to miss without time series.' },
]

function TimeSeriesViewer() {
  const [windowStart, setWindowStart] = useState(0)
  const [windowSize] = useState(60)
  const [revealed, setRevealed] = useState(false)
  const svgRef = useRef(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWin = useRef(0)

  const slice = TS_DATA.slice(windowStart, windowStart + windowSize)
  const maxStart = TS_DATA.length - windowSize
  const failureInView = slice.some(d => d.fail)
  const failureDayInView = slice.findIndex(d => d.fail)

  const handleMouseDown = (e) => {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartWin.current = windowStart
  }
  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStartX.current
    const dDays = Math.round(dx / 5)
    setWindowStart(Math.max(0, Math.min(maxStart, dragStartWin.current - dDays)))
  }
  const handleMouseUp = () => { isDragging.current = false }

  return (
    <div>
      {/* Challenge */}
      <div style={{ background: `${C.indigo}10`, border: `1.5px solid ${C.indigo}30`, borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontWeight: 700, color: C.indigo }}>Challenge: </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Can you spot when degradation begins? Drag the timeline to explore. Click "Reveal" when ready.</span>
        </div>
        <motion.button
          onClick={() => setRevealed(r => !r)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            padding: '8px 18px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', fontSize: 13,
            background: revealed ? `${C.green}20` : `${C.indigo}20`,
            color: revealed ? C.green : C.indigo,
            border: `1.5px solid ${revealed ? C.green : C.indigo}`,
          }}
        >
          {revealed ? 'Hide Answer' : 'Reveal Answer'}
        </motion.button>
      </div>

      {/* Timeline scrubber */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="range" min={0} max={maxStart} value={windowStart}
          onChange={e => setWindowStart(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
          <span>Day {windowStart + 1}</span>
          <span style={{ fontWeight: 600 }}>Showing {windowSize}-day window</span>
          <span>Day {windowStart + windowSize}</span>
        </div>
      </div>

      {/* Stacked charts */}
      {TS_METRICS.map((metric, mi) => {
        const vals = slice.map(d => d[metric.key])
        const lo = metric.min, hi = metric.max
        const normalize = v => ((v - lo) / (hi - lo)) * 100

        const pathPoints = vals.map((v, i) => `${(i / (windowSize - 1)) * 280 + 10},${90 - normalize(v) * 0.88}`).join(' ')

        return (
          <div key={metric.key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: metric.color, marginBottom: 4 }}>
              {metric.label}
            </div>
            <div
              ref={mi === 0 ? svgRef : null}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: 'ew-resize', borderRadius: 10, overflow: 'hidden', border: `1px solid ${metric.color}25` }}
            >
              <svg viewBox="0 0 300 100" style={{ width: '100%', display: 'block', background: `${metric.color}06` }}>
                {/* Grid lines */}
                {[25, 50, 75].map(y => (
                  <line key={y} x1={10} y1={y * 0.88 + 2} x2={290} y2={y * 0.88 + 2} stroke={`${metric.color}15`} />
                ))}
                {/* Area fill */}
                <polygon
                  points={`10,92 ${pathPoints} ${(windowSize - 1) / (windowSize - 1) * 280 + 10},92`}
                  fill={`${metric.color}18`}
                />
                {/* Line */}
                <polyline points={pathPoints} fill="none" stroke={metric.color} strokeWidth={1.8} strokeLinejoin="round" />
                {/* Failure marker */}
                {failureInView && failureDayInView >= 0 && (
                  <g>
                    <line
                      x1={(failureDayInView / (windowSize - 1)) * 280 + 10}
                      y1={2}
                      x2={(failureDayInView / (windowSize - 1)) * 280 + 10}
                      y2={92}
                      stroke={C.red} strokeWidth={2} strokeDasharray="3,2"
                    />
                    {mi === 0 && (
                      <text x={(failureDayInView / (windowSize - 1)) * 280 + 14} y={14} fill={C.red} fontSize={8} fontWeight="bold">FAILURE</text>
                    )}
                  </g>
                )}
                {/* Degradation onset marker (revealed) */}
                {revealed && (() => {
                  const onsetDay = 145 - windowStart
                  if (onsetDay >= 0 && onsetDay < windowSize) {
                    return (
                      <g>
                        <line x1={(onsetDay / (windowSize - 1)) * 280 + 10} y1={2} x2={(onsetDay / (windowSize - 1)) * 280 + 10} y2={92} stroke={C.yellow} strokeWidth={1.5} strokeDasharray="2,2" />
                        {mi === 0 && <text x={(onsetDay / (windowSize - 1)) * 280 + 14} y={22} fill={C.yellow} fontSize={7}>Degradation Start</text>}
                      </g>
                    )
                  }
                  return null
                })()}
              </svg>
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <div style={{ width: 20, height: 2, background: C.red, borderRadius: 2 }} />
          <span style={{ color: C.red }}>Failure Event (Day 162)</span>
        </div>
        {revealed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 20, height: 2, background: C.yellow, borderRadius: 2 }} />
            <span style={{ color: C.yellow }}>Degradation Start (Day 145)</span>
          </div>
        )}
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 16, padding: '14px 18px', background: `${C.yellow}10`, border: `1.5px solid ${C.yellow}40`, borderRadius: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}
        >
          <strong style={{ color: C.yellow }}>Answer:</strong> Degradation begins around Day 145 (Month 5). Vibration rises from 2.5 to 4+ mm/s over 17 days, temperature follows with a 2-day lag, and current draw inches up subtly. A model trained on this pattern would predict failure 17 days early — that's your maintenance scheduling window!
        </motion.div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   SECTION 5 — Outlier Detection
════════════════════════════════════════════════════════════════ */
function generateScatterData() {
  const rng = seededRand(55)
  const points = []
  // Normal cluster
  for (let i = 0; i < 360; i++) {
    const vib = 2.5 + rng() * 0.8 - 0.4
    const temp = 72 + vib * 5 + rng() * 4 - 2
    const score = 0.1 + rng() * 0.15
    points.push({ vib, temp, type: 'normal', score, id: i })
  }
  // Borderline
  for (let i = 0; i < 80; i++) {
    const vib = 4.5 + rng() * 1.5
    const temp = 84 + rng() * 6
    const score = 0.45 + rng() * 0.25
    points.push({ vib, temp, type: 'borderline', score, id: 360 + i })
  }
  // Outliers
  for (let i = 0; i < 35; i++) {
    const rnd = rng()
    if (rnd < 0.5) {
      points.push({ vib: 7.5 + rng() * 2, temp: 93 + rng() * 8, type: 'outlier', score: 0.85 + rng() * 0.15, id: 440 + i })
    } else {
      points.push({ vib: 1.0 + rng() * 0.4, temp: 55 + rng() * 3, type: 'outlier', score: 0.82 + rng() * 0.15, id: 440 + i, sensorError: true })
    }
  }
  return points
}

const SCATTER_DATA = generateScatterData()

const OUTLIER_METHODS = {
  zscore: { label: 'Z-Score (>3σ)', color: C.blue, desc: 'Marks points more than 3 standard deviations from the mean. Simple, fast, but assumes normal distribution.' },
  iqr: { label: 'IQR Method', color: C.purple, desc: 'Q1 - 1.5×IQR and Q3 + 1.5×IQR define the fence. Non-parametric — works on skewed distributions.' },
  isolation: { label: 'Isolation Forest', color: C.teal, desc: 'Tree-based anomaly scoring. Assigns each point an anomaly score (shown as dot size). No distribution assumption needed.' },
}

function OutlierDetection() {
  const [method, setMethod] = useState('zscore')
  const [hovered, setHovered] = useState(null)

  // Viewport: vib 0.5–10.5, temp 50–108
  const vibRange = [0.5, 10.5]
  const tempRange = [50, 108]
  const W = 300, H = 220
  const toX = v => ((v - vibRange[0]) / (vibRange[1] - vibRange[0])) * (W - 20) + 10
  const toY = t => H - ((t - tempRange[0]) / (tempRange[1] - tempRange[0])) * (H - 20) - 10

  const dotColor = (p) => {
    if (p.type === 'normal') return C.green
    if (p.type === 'borderline') return C.yellow
    return C.red
  }
  const dotSize = (p) => {
    if (method === 'isolation') return 2.5 + p.score * 6
    return p.type === 'normal' ? 2.8 : p.type === 'borderline' ? 3.5 : 5
  }
  const dotOpacity = (p) => {
    if (method === 'zscore' && p.type !== 'outlier') return 0.4
    if (method === 'iqr' && p.type === 'normal') return 0.35
    return 0.75
  }

  const hov = hovered !== null ? SCATTER_DATA[hovered] : null

  return (
    <div>
      {/* Method toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(OUTLIER_METHODS).map(([key, m]) => (
          <motion.button
            key={key}
            onClick={() => setMethod(key)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '8px 18px', borderRadius: 24, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: method === key ? `${m.color}20` : 'var(--bg-secondary)',
              color: method === key ? m.color : 'var(--text-secondary)',
              border: `1.5px solid ${method === key ? m.color : 'var(--border)'}`,
            }}
          >
            {m.label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Scatter SVG */}
        <div style={{ flex: '0 0 auto' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: Math.min(360, W + 20), display: 'block', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            {/* Axes */}
            <line x1={10} y1={10} x2={10} y2={H - 10} stroke="#ffffff20" />
            <line x1={10} y1={H - 10} x2={W - 10} y2={H - 10} stroke="#ffffff20" />
            <text x={W / 2} y={H + 5} fill="#64748b" fontSize={9} textAnchor="middle">Vibration (mm/s)</text>
            <text x={-H / 2} y={6} fill="#64748b" fontSize={9} textAnchor="middle" transform="rotate(-90)">Temperature (°C)</text>

            {/* Z-score threshold circles */}
            {method === 'zscore' && (
              <ellipse cx={toX(2.5)} cy={toY(73)} rx={toX(2.5 + 2.4) - toX(2.5)} ry={(toY(73 - 12) - toY(73)) * -1} fill="none" stroke={C.blue} strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
            )}
            {/* IQR box */}
            {method === 'iqr' && (
              <rect x={toX(1.8)} y={toY(84)} width={toX(4.2) - toX(1.8)} height={toY(64) - toY(84)} fill="none" stroke={C.purple} strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
            )}

            {/* Points */}
            {SCATTER_DATA.map((p, i) => (
              <motion.circle
                key={p.id}
                cx={toX(p.vib)}
                cy={toY(p.temp)}
                r={dotSize(p)}
                fill={dotColor(p)}
                fillOpacity={i === hovered ? 1 : dotOpacity(p)}
                stroke={i === hovered ? 'white' : 'none'}
                strokeWidth={i === hovered ? 1.5 : 0}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                initial={{ r: 0 }}
                animate={{ r: dotSize(p) }}
                transition={{ delay: i * 0.001 }}
              />
            ))}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {[{ c: C.green, l: 'Normal' }, { c: C.yellow, l: 'Borderline' }, { c: C.red, l: 'Outlier' }].map(item => (
              <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.c }} />
                {item.l}
              </div>
            ))}
          </div>
        </div>

        {/* Method description + hover details */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ padding: '14px 18px', background: `${OUTLIER_METHODS[method].color}10`, border: `1px solid ${OUTLIER_METHODS[method].color}30`, borderRadius: 12, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: OUTLIER_METHODS[method].color, marginBottom: 6, fontSize: 14 }}>
              {OUTLIER_METHODS[method].label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {OUTLIER_METHODS[method].desc}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {hov ? (
              <motion.div
                key={hov.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                  padding: '14px 18px', background: `${dotColor(hov)}10`, border: `1px solid ${dotColor(hov)}40`,
                  borderRadius: 12, fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 700, color: dotColor(hov), marginBottom: 6 }}>
                  {hov.type === 'outlier' ? (hov.sensorError ? 'Sensor Error' : 'Pre-Failure State') : hov.type === 'borderline' ? 'Borderline Point' : 'Normal Operation'}
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Vibration: <strong>{hov.vib.toFixed(2)} mm/s</strong><br />
                  Temperature: <strong>{hov.temp.toFixed(1)}°C</strong><br />
                  Anomaly Score: <strong style={{ color: dotColor(hov) }}>{hov.score.toFixed(3)}</strong><br />
                  {hov.sensorError && <span style={{ color: C.orange }}>Low temp + low vibration = likely sensor dropout, not actual failure.</span>}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}
              >
                Hover over any data point to inspect its values and anomaly score.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   SECTION 6 — Missing Data Investigation
════════════════════════════════════════════════════════════════ */
const SENSORS = ['vibration', 'temperature', 'pressure', 'current', 'flow']

function generateMissingGrid() {
  const rng = seededRand(99)
  const days = 30
  const grid = Array.from({ length: SENSORS.length }, () => Array(days).fill(null))

  // Random gaps
  for (let s = 0; s < SENSORS.length; s++) {
    for (let d = 0; d < days; d++) {
      if (rng() < 0.025) {
        grid[s][d] = { cause: 'Random Gap', color: C.yellow, impact: 'Minor — interpolate or forward-fill. 1 in 40 readings. Caused by transient network issues on the sensor bus.' }
      }
    }
  }
  // Consecutive gap: vibration sensor offline days 8-11
  for (let d = 7; d <= 10; d++) {
    grid[0][d] = { cause: 'Sensor Offline (Maintenance)', color: C.orange, impact: 'Moderate — vibration missing for 4 days. Scheduled calibration. Use NaN interpolation with flag feature.' }
  }
  // Correlated gap: all sensors missing days 18-19 (power outage)
  for (let s = 0; s < SENSORS.length; s++) {
    for (let d = 17; d <= 18; d++) {
      grid[s][d] = { cause: 'Power Outage (All Sensors)', color: C.red, impact: 'High — 2 full days missing. Correlated gaps are real events! Mark with outage_flag=1 rather than imputing.' }
    }
  }
  // Pressure sensor dead days 25-29
  for (let d = 24; d < 30; d++) {
    grid[2][d] = { cause: 'Sensor Hardware Failure', color: C.red, impact: 'High — consecutive 6-day gap in pressure. Hardware replaced on day 30. Must use temporal model, not simple imputation.' }
  }
  return grid
}

const MISSING_DATA_GRID = generateMissingGrid()

function MissingDataInvestigator() {
  const [selectedCell, setSelectedCell] = useState(null)

  const days = 30
  const getCellInfo = (s, d) => MISSING_DATA_GRID[s][d]

  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.65 }}>
        30-day sensor timeline for Pump #12 (Jan 2024). Gray = data present. Colored = missing with pattern type. Click any missing cell to investigate.
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(30, 26px)`, gap: 3, minWidth: 880 }}>
          {/* Header row */}
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>Sensor</div>
          {Array.from({ length: days }, (_, d) => (
            <div key={d} style={{ fontSize: 9, color: 'var(--text-secondary)', textAlign: 'center', paddingBottom: 4 }}>
              {d + 1}
            </div>
          ))}

          {SENSORS.map((sensor, s) => (
            <>
              <div key={`label-${s}`} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                {sensor}
              </div>
              {Array.from({ length: days }, (_, d) => {
                const info = getCellInfo(s, d)
                const isSelected = selectedCell?.s === s && selectedCell?.d === d
                return (
                  <motion.div
                    key={`${s}-${d}`}
                    onClick={() => info && setSelectedCell(isSelected ? null : { s, d, info })}
                    whileHover={info ? { scale: 1.15 } : {}}
                    title={info ? `${sensor} Day ${d + 1}: MISSING` : `${sensor} Day ${d + 1}: Present`}
                    style={{
                      height: 24, borderRadius: 4, cursor: info ? 'pointer' : 'default',
                      background: info ? info.color + '80' : 'var(--bg-secondary)',
                      border: isSelected
                        ? `2px solid ${info?.color || 'var(--border)'}`
                        : info ? `1px solid ${info.color}50` : '1px solid var(--border)',
                      transition: 'all 0.15s',
                    }}
                  />
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
        {[
          { color: 'var(--bg-secondary)', label: 'Data Present', border: 'var(--border)' },
          { color: `${C.yellow}80`, label: 'Random Gap', border: C.yellow },
          { color: `${C.orange}80`, label: 'Sensor Offline', border: C.orange },
          { color: `${C.red}80`, label: 'Critical / Correlated', border: C.red },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, background: l.color, border: `1px solid ${l.border}` }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Cell detail panel */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            key={`${selectedCell.s}-${selectedCell.d}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              marginTop: 16, padding: '16px 20px',
              background: `${selectedCell.info.color}10`,
              border: `1.5px solid ${selectedCell.info.color}40`,
              borderRadius: 14, fontSize: 14,
            }}
          >
            <div style={{ fontWeight: 700, color: selectedCell.info.color, marginBottom: 6 }}>
              {SENSORS[selectedCell.s]} — Day {selectedCell.d + 1}: {selectedCell.info.cause}
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {selectedCell.info.impact}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronTip type="warning">
        <strong>Pattern matters more than count.</strong> 10 random missing values ≠ 10 consecutive missing values. Consecutive gaps mean something happened (maintenance, failure, power cut). Always visualize missingness over time before deciding on imputation strategy.
      </NeuronTip>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function Topic3Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 4px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #6366f110, #8b5cf610)',
          border: '1.5px solid #6366f130',
          borderRadius: 24, padding: '36px 40px', marginBottom: 32, textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Exploratory Data Analysis
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 580, margin: '0 auto 20px' }}>
          Before training any model, you must <em>understand</em> your data. EDA is the detective work — finding patterns, anomalies, distributions, and correlations that will guide every decision downstream.
        </p>
        <div style={{ display: 'inline-flex', gap: 8, background: '#6366f115', borderRadius: 30, padding: '8px 20px', fontSize: 13, color: '#8b5cf6', fontWeight: 600 }}>
          SteelForge Manufacturing · 50 Pumps · 6 Months · 54,000 Records
        </div>
      </motion.div>

      {/* Opening Neuron */}
      <Neuron
        mood="explaining"
        size="medium"
        message="Think of EDA as a doctor's checkup before surgery. You wouldn't operate without understanding the patient's vitals first. Similarly, we don't train models without understanding our data — its shape, gaps, correlations, and hidden patterns. Let's explore the SteelForge dataset together."
        style={{ marginBottom: 32 }}
      />

      {/* Section 1 */}
      <SectionBlock icon="🗄️" title="Dataset Overview Dashboard" color={C.indigo}>
        <Neuron
          mood="happy"
          size="small"
          message="SteelForge Manufacturing gave us sensor data from 50 industrial pumps monitored 24/7 for 6 months. Let's take stock of what we're working with — total records, features, and where data went missing."
          style={{ marginBottom: 24 }}
        />
        <InteractiveDemo title="Dataset Dashboard" instruction="Click any feature column to inspect its type, statistics, and description.">
          <DatasetDashboard />
        </InteractiveDemo>
        <NeuronTip type="warning">
          The 95:5 class imbalance is the single biggest challenge in this dataset. Standard accuracy becomes meaningless. You'll need precision, recall, F1 score, and AUROC as your real metrics.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="EDA — जासूसी का काम"
        english="Exploratory Data Analysis — Detective Work on Data"
        explanation="EDA वो है जो data scientist ML model बनाने से पहले करता है — जैसे एक जासूस case solve करने से पहले सबूत इकट्ठे करता है। SteelForge dataset में 50 pumps से 6 महीने का data है — 54,000 records, 15 features। EDA में हम देखते हैं: कितने records हैं, कौन से columns हैं, कहाँ data missing है, और class distribution क्या है। यहाँ सबसे बड़ी problem है 95:5 imbalance — 95% records normal हैं, सिर्फ 5% failures। एक lazy model जो हमेशा 'Normal' predict करे उसे 95% accuracy मिलेगी, लेकिन वो completely useless होगा!"
        example="एक bank fraud detection team को 99.9% normal transactions और 0.1% fraud था। अगर model सब 'normal' predict करे — 99.9% accurate! लेकिन सभी fraud miss। SteelForge में भी यही problem है — इसीलिए AUROC, precision, recall देखते हैं, accuracy नहीं।"
        terms={[
          { hindi: 'वर्ग असंतुलन', english: 'Class Imbalance', meaning: '95% Normal, 5% Failure — model को यह सिखाना मुश्किल बनाता है' },
          { hindi: 'लक्ष्य चर', english: 'Target Variable', meaning: 'वो column जो हम predict करना चाहते हैं — यहाँ failure_flag (0 या 1)' },
          { hindi: 'लापता डेटा हीटमैप', english: 'Missing Data Heatmap', meaning: 'Color grid जो दिखाता है कहाँ-कहाँ data नहीं है' },
        ]}
      />

      {/* Section 2 */}
      <SectionBlock icon="📊" title="Distribution Explorer" color={C.blue}>
        <Neuron
          mood="thinking"
          size="small"
          message="Distributions tell you how values are spread. Are they symmetric? Skewed? Bimodal? Understanding this before modeling prevents huge mistakes — like applying a z-score threshold to a bimodal temperature distribution."
          style={{ marginBottom: 24 }}
        />
        <InteractiveDemo title="Distribution Histograms" instruction="Select a feature, then toggle between All Data and Failure Only to see how distributions shift.">
          <DistributionExplorer />
        </InteractiveDemo>
        <NeuronTip type="tip">
          The shift between "All Data" and "Failure Only" distributions reveals the discriminative power of each feature. Vibration and Temperature show the biggest shifts — these will dominate your model's feature importance.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="वितरण — नंबर कहाँ-कहाँ पड़े हैं"
        english="Distributions — How Values Are Spread"
        explanation="Distribution histogram देखना ऐसा है जैसे class में marks का chart बनाना। अगर ज़्यादातर students 70-80 marks में हैं और कुछ ही 95+ में, तो distribution right-skewed है। SteelForge pump data में: Normal pumps की vibration 2.5 mm/s के आस-पास cluster होती है। Failing pumps की vibration 4-8 mm/s range में होती है। Temperature bimodal है — day shift में 82°C, night shift में 65°C, इसलिए दो peaks हैं। यह समझने के बाद ही हम सही model features choose कर सकते हैं।"
        example="अगर हम temperature पर simple threshold rule लगाएं: '>80°C = failure' — तो night shift की normal readings भी 65°C हैं। लेकिन day shift normal भी 82°C है। Simple rule fail करेगा। ML model shift context को consider करेगा — इसीलिए model simple rules से better है।"
        terms={[
          { hindi: 'आवृत्ति वितरण', english: 'Distribution', meaning: 'Values कैसे spread हैं — कहाँ cluster है, कहाँ outliers हैं' },
          { hindi: 'द्विमोडल', english: 'Bimodal', meaning: 'दो peaks वाला distribution — temperature में day/night shift दोनों peaks' },
          { hindi: 'दाईं ओर झुका', english: 'Right-Skewed', meaning: 'ज़्यादातर values left में, कुछ extreme values right में — vibration ऐसी है' },
        ]}
      />

      {/* Section 3 */}
      <SectionBlock icon="🔗" title="Correlation Matrix" color={C.red}>
        <Neuron
          mood="excited"
          size="small"
          message="Correlation reveals hidden relationships. When vibration goes up, does temperature also go up? Strong correlations can indicate multicollinearity (might need to drop one) or genuine physical relationships (that's a great feature pair!)."
          style={{ marginBottom: 24 }}
        />
        <InteractiveDemo title="Feature Correlation Heatmap" instruction="Click any non-diagonal cell in the heatmap to see a scatter plot of those two features.">
          <CorrelationMatrix />
        </InteractiveDemo>
        <NeuronTip type="deep">
          <strong>Vibration ↔ Temperature (r=0.72)</strong> is the golden pair. Both rise together as a pump degrades. This physical coupling (friction → heat → vibration) means they're not just statistically correlated — there's a causal mechanism you can exploit.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="सहसंबंध — जब एक बढ़ता है, दूसरा भी"
        english="Correlation — When One Rises, Does the Other?"
        explanation="Correlation matrix बताता है कि दो features एक साथ कैसे बदलते हैं। r = +1 मतलब perfect positive correlation — एक बढ़ा तो दूसरा भी बढ़ा। r = -1 मतलब perfect negative — एक बढ़ा तो दूसरा घटा। r = 0 मतलब कोई relation नहीं। SteelForge में vibration और temperature का r = 0.72 है — जब bearing घिसती है, friction बढ़ती है, heat बढ़ती है, vibration बढ़ती है — तीनों एक साथ। यह physical relationship है, statistical coincidence नहीं। ML model इस जोड़े को powerful feature के रूप में use करता है।"
        example="Sona Koyo Steering Systems (Pune) में engineers ने EDA में देखा: current draw और temperature का r = 0.71। जब motor ज़्यादा current खींचती है तो gear box hot होता है। इस pair को feature बनाकर model accuracy 12% improve हुई — सिर्फ EDA insight से!"
        terms={[
          { hindi: 'सहसंबंध गुणांक', english: 'Correlation Coefficient (r)', meaning: '-1 से +1 तक का number — दो variables का relationship strength बताता है' },
          { hindi: 'बहुरैखिकता', english: 'Multicollinearity', meaning: 'जब दो features बहुत correlated हों — एक को drop कर सकते हैं, redundant है' },
          { hindi: 'भौतिक युगलन', english: 'Physical Coupling', meaning: 'जब features का correlation physics से समझाया जा सके — friction → heat → vibration' },
        ]}
      />

      {/* Section 4 */}
      <SectionBlock icon="📈" title="Time Series Patterns" color={C.orange}>
        <Neuron
          mood="thinking"
          size="small"
          message="Static statistics miss the temporal story. A pump with average vibration of 3.2 mm/s might be fine — or it might have been at 2.0 last week and is rapidly climbing. The trend is the signal."
          style={{ marginBottom: 24 }}
        />
        <InteractiveDemo title="6-Month Pump Sensor Timeline" instruction="Drag the slider to explore different time windows. Toggle 'Reveal Answer' after spotting when degradation begins.">
          <TimeSeriesViewer />
        </InteractiveDemo>
        <NeuronTip type="example">
          This 17-day degradation window (Day 145–162) is your maintenance opportunity. A well-trained model would flag this pump at Day 145, giving operations 17 days to schedule a repair — during a planned downtime, not an emergency shutdown.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="समय श्रृंखला पैटर्न — मशीन की दैनिक दिनचर्या"
        english="Time Series Patterns — The Machine's Daily Routine"
        explanation="एक healthy machine की daily routine होती है — जैसे healthy इंसान की होती है। सुबह temperature low, दोपहर में थोड़ा high, रात को cool down। यह regular pattern है। Static average देखने से यह pattern miss हो जाता है। Time series में हम 180 दिन देखते हैं। Day 1-144 तक pump normal है — vibration 2.5 mm/s around stable। Day 145 से vibration धीरे-धीरे बढ़ने लगती है। Day 162 पर failure। यह 17 दिन का window आपका golden opportunity है — planned maintenance schedule करने का। ML model इसी pattern को सीखकर अगले time predict करता है।"
        example="BHEL (Bhopal) की turbine में degradation pattern EDA में पकड़ा गया: हर बार failure से 18-22 दिन पहले vibration में 0.15 mm/s per day की rate से increase होती थी। यह 'signature' सीखकर model अब 20 दिन पहले alert देता है।"
        terms={[
          { hindi: 'अवनति प्रारंभ', english: 'Degradation Start', meaning: 'वो दिन जब machine slowly खराब होने लगती है — failure से पहले का window' },
          { hindi: 'रखरखाव विंडो', english: 'Maintenance Window', meaning: 'Degradation detect से actual failure तक का time — यहीं maintenance schedule करो' },
          { hindi: 'स्थिर आधार रेखा', english: 'Stable Baseline', meaning: 'Normal operation की values — इससे compare करके anomaly detect होती है' },
        ]}
      />

      {/* Section 5 */}
      <SectionBlock icon="🎯" title="Outlier Detection" color={C.teal}>
        <Neuron
          mood="explaining"
          size="small"
          message="Not all extreme values are failures. A sudden low-vibration reading might be a sensor dropout, not a healthy pump. Outlier detection separates real anomalies from data quality issues — and those are very different problems."
          style={{ marginBottom: 24 }}
        />
        <InteractiveDemo title="Vibration vs Temperature Scatter Plot" instruction="Toggle between three outlier detection methods. Hover over any data point to see its values and anomaly score.">
          <OutlierDetection />
        </InteractiveDemo>
        <NeuronTip type="tip">
          Isolation Forest usually wins for PdM because it makes no distribution assumptions. Z-score fails on bimodal data; IQR misses cluster-based anomalies. Use Isolation Forest for initial screening, then validate with domain expert review.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="आउटलायर — अचानक बुखार जैसी readings"
        english="Outlier Detection — Abnormal Readings"
        explanation="Outlier वो reading है जो बाकी सबसे बहुत अलग हो। जैसे अचानक 104°F बुखार — clearly abnormal। लेकिन सब outliers failure नहीं होते! दो types होते हैं: (1) Genuine anomaly — pump actually fail होने वाली है, high vibration real है। (2) Sensor error — sensor disconnect हुआ या glitch था, reading fake है। Scatterplot में देखो: अगर vibration high है और temperature भी high है — likely genuine failure। अगर vibration बहुत low है और temperature भी बहुत low है — probably sensor dropout। Domain knowledge से differentiate करो।"
        example="Hindalco aluminum plant में एक day sensor ने 0.1 mm/s vibration दिखाई — बहुत low। Engineer ने देखा: उसी time temperature भी 35°C था जबकि baseline 67°C है। दोनों abnormally low — sensor cable disconnect हुई थी, machine failure नहीं था। Isolation Forest ने flag किया लेकिन expert ने सही classify किया।"
        terms={[
          { hindi: 'बाहरी मान', english: 'Outlier', meaning: 'Normal range से बहुत दूर की reading — real anomaly या sensor error हो सकता है' },
          { hindi: 'आइसोलेशन फॉरेस्ट', english: 'Isolation Forest', meaning: 'Tree-based ML algorithm जो anomalies को score देता है — no distribution assumption' },
          { hindi: 'विसंगति स्कोर', english: 'Anomaly Score', meaning: '0 से 1 तक — 1 के पास = confirmed anomaly, 0 के पास = normal' },
        ]}
      />

      {/* Section 6 */}
      <SectionBlock icon="🕳️" title="Missing Data Investigation" color={C.purple}>
        <Neuron
          mood="thinking"
          size="small"
          message="Missing data in industrial sensors is never random — it means something. A correlated gap across all sensors is a power outage. A single sensor gap is a hardware issue. Understanding why data is missing is as important as filling it in."
          style={{ marginBottom: 24 }}
        />
        <InteractiveDemo title="30-Day Sensor Missingness Grid (Pump #12)" instruction="Click any colored cell to see when the gap occurred, its likely cause, and how it impacts your analysis.">
          <MissingDataInvestigator />
        </InteractiveDemo>
        <NeuronTip type="deep">
          <strong>MCAR, MAR, MNAR:</strong> Data is Missing Completely At Random (MCAR), Missing At Random (MAR), or Missing Not At Random (MNAR). PdM sensor gaps are usually MNAR — the sensor fails more during extreme conditions (high temp, high vibration) — exactly when you need the data most! Never use simple mean imputation for this.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="लापता डेटा — गायब readings का रहस्य"
        english="Missing Data — Why Readings Go Missing and How to Handle"
        explanation="Industrial sensors में data missing होना normal है — लेकिन pattern important है। Random single gap: network glitch था, अकेली reading miss हुई — forward fill से ठीक करो। Consecutive gap (4 दिन): sensor calibration के लिए offline था — interpolate करो और 'was_offline' flag लगाओ। Power outage gap: सभी sensors एक साथ 2 दिन के लिए off — यह एक real event है! इसे impute मत करो, 'power_outage' feature बनाओ। Sensor hardware failure: pressure sensor 6 दिन से dead है — simple mean imputation बेकार है, temporal model use करो। Pattern देखना count से ज़्यादा important है।"
        example="ONGC की Rajasthan field में एक well के sensors हर monsoon में 3-5 दिन का gap दिखाते थे। Engineer ने initially mean imputation की। Model accuracy खराब थी। EDA में पता चला: monsoon में exactly जब sand storm होता है sensor gap होता है — यह MNAR था। 'sandstorm_day' feature बनाया — model accuracy 8% improve हुई!"
        terms={[
          { hindi: 'आगे भरना', english: 'Forward Fill', meaning: 'Missing value को पिछली valid value से fill करना — short random gaps के लिए' },
          { hindi: 'प्रक्षेप', english: 'Interpolation', meaning: 'दो known values के बीच missing values estimate करना — smooth gap के लिए' },
          { hindi: 'MNAR', english: 'Missing Not At Random', meaning: 'Data exactly तब missing होता है जब machine की condition extreme हो — सबसे मुश्किल case' },
        ]}
      />

      {/* Section 7 — Hindi Summary */}
      <SectionBlock icon="हिं" title="Hindi Summary — EDA in Plain Language" color={C.orange}>
        <HindiExplainer
          concept="Exploratory Data Analysis (EDA)"
          english="EDA is the detective work you do before building any ML model — understanding distributions, correlations, outliers, missing data, and time series patterns."
          explanation="EDA एक doctor की checkup जैसी है surgery से पहले। जैसे doctor पहले pulse, BP, temperature check करता है — वैसे ही data scientist पहले data को समझता है। SteelForge के 50 pumps का 54,000 records का data है। हम पहले देखते हैं: क्या data complete है? Missing values कहाँ हैं? Values कैसे distribute हैं? Features आपस में कितने correlated हैं? Time के साथ क्या pattern है? और कौन से values outlier हैं? यह सब समझे बिना model बनाना ऐसा है जैसे बिना map देखे jungle में जाना।"
          example="मान लो pump की vibration normally 2.5 mm/s रहती है। EDA में हमें पता चलता है: (1) जब failure होता है, vibration 6+ mm/s होती है — distribution shift! (2) Vibration और temperature में r=0.72 correlation है — दोनों साथ बढ़ते हैं। (3) कुछ readings में temperature अचानक 45°C है — outlier! Sensor error लगता है। (4) Day 145 से Day 162 तक vibration slowly बढ़ रही है — यही degradation pattern है। यह सब EDA से पता चलता है, model से नहीं।"
          terms={[
            { hindi: 'वितरण', english: 'Distribution', meaning: 'Data के values कैसे spread हैं — कहाँ cluster हैं, कहाँ outliers हैं' },
            { hindi: 'सहसंबंध', english: 'Correlation', meaning: 'दो features कितना साथ बदलते हैं। -1 से +1 तक। 0 = कोई relation नहीं' },
            { hindi: 'बाहरी मान', english: 'Outlier', meaning: 'वो value जो बाकी सबसे बहुत अलग हो। Real anomaly हो सकती है या sensor error' },
            { hindi: 'लापता डेटा', english: 'Missing Data', meaning: 'जहाँ sensor ने value record नहीं की। Pattern important है — random gap vs. consecutive gap' },
            { hindi: 'आवृत्ति चार्ट', english: 'Histogram', meaning: 'Chart जो दिखाता है कि कितनी बार कोई value range में आई' },
            { hindi: 'समय श्रृंखला', english: 'Time Series', meaning: 'Time के साथ values का pattern। Static stats से ज़्यादा जरूरी — trend देखना है' },
            { hindi: 'द्विआधारी वर्ग', english: 'Class Imbalance', meaning: '95% Normal, 5% Failure — model को यह सिखाना मुश्किल बनाता है' },
            { hindi: 'ऊष्मा मानचित्र', english: 'Heatmap', meaning: 'Color-coded grid जो patterns दिखाता है — correlation matrix या missing data grid' },
          ]}
        />
        <Neuron
          mood="waving"
          size="small"
          message="EDA complete! You now know your data inside out — its shape, gaps, correlations, temporal patterns, and outliers. This knowledge directly drives every decision in the next stages: which features to engineer, which imputation strategy to use, how to handle class imbalance, and what model family to choose."
          style={{ marginTop: 24 }}
        />
      </SectionBlock>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: 'linear-gradient(135deg, #6366f108, #8b5cf608)',
          border: '1.5px solid #6366f125',
          borderRadius: 22, padding: '32px 36px', marginBottom: 32,
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
          EDA Findings — What We Discovered
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
          {[
            { icon: '📊', color: C.blue, title: 'Distributions', body: 'Vibration is right-skewed. Temperature is bimodal (shifts). Pressure has outlier spikes. All shift noticeably in failure cases.' },
            { icon: '🔗', color: C.red, title: 'Key Correlations', body: 'Vibration↔Temp (0.72), Vib↔Failure (0.63), Age↔Failure (0.45). Physical relationships are real and exploitable.' },
            { icon: '📈', color: C.orange, title: 'Temporal Patterns', body: 'Degradation starts ~17 days before failure. Gradual vibration rise, then temperature lag, then current increase. Predictable sequence.' },
            { icon: '🎯', color: C.teal, title: 'Outliers', body: '~7% of records are anomalous. Mix of pre-failure states and sensor errors. Isolation Forest best for discrimination.' },
            { icon: '🕳️', color: C.purple, title: 'Missing Data', body: 'Three patterns: random gaps (impute), offline gaps (flag+interpolate), power outages (outage_flag feature).' },
            { icon: '⚠️', color: C.rose, title: 'Class Imbalance', body: '95:5 split. Must use SMOTE, class weights, or threshold tuning. Accuracy alone is a lie with this distribution.' },
          ].map(item => (
            <div key={item.title} style={{
              background: `${item.color}08`, border: `1px solid ${item.color}20`,
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: item.color, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
