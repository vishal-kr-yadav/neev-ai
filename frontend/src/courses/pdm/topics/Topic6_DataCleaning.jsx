import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 6 — Data Cleaning Masterclass
   Handling missing values, outliers, normalization, encoding for PdM
================================================================ */

const C = {
  blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981',
  orange: '#f59e0b', pink: '#ec4899', red: '#ef4444',
  cyan: '#06b6d4', indigo: '#6366f1', teal: '#14b8a6',
}

/* ─────────────────────────────────────────────
   SECTION 1: 80/20 Rule + Dirty Dataset
───────────────────────────────────────────── */
const dirtyRows = [
  { id: 1, timestamp: '2024-01-01 08:00', vibration: 2.1, temperature: 72, pressure: 105, equipment: 'Centrifugal Pump', issues: [] },
  { id: 2, timestamp: '2024-01-01 08:15', vibration: 2.3, temperature: 73, pressure: 106, equipment: 'Centrifugal Pump', issues: [] },
  { id: 3, timestamp: '2024-01-01 08:30', vibration: null, temperature: 74, pressure: 107, equipment: 'Centrifugal Pump', issues: ['missing'] },
  { id: 4, timestamp: '2024-01-01 08:45', vibration: 2.2, temperature: 75, pressure: 108, equipment: 'Centrifugal Pump', issues: [] },
  { id: 5, timestamp: '2024-01-01 09:00', vibration: 2.4, temperature: 9999, pressure: 109, equipment: 'Centrifugal Pump', issues: ['outlier'] },
  { id: 6, timestamp: '2024-01-01 09:15', vibration: 2.5, temperature: 76, pressure: 110, equipment: 'Centrifugal Pump', issues: [] },
  { id: 7, timestamp: '2024-01-01 09:30', vibration: 2.3, temperature: 77, pressure: -15, equipment: 'Centrifugal Pump', issues: ['impossible'] },
  { id: 8, timestamp: '2024-01-01 09:30', vibration: 2.3, temperature: 77, pressure: -15, equipment: 'Centrifugal Pump', issues: ['duplicate'] },
  { id: 9, timestamp: '2024-01-01 10:00', vibration: 2.6, temperature: 78, pressure: 111, equipment: 'Centrifugal Pump', issues: [] },
  { id: 10, timestamp: '2024-01-01 10:15', vibration: 2.7, temperature: 79, pressure: 112, equipment: 'PUMP', issues: ['inconsistent'] },
]

const issueInfo = {
  missing: { label: 'Missing Value', color: C.red, desc: 'vibration is NULL — many ML algorithms crash on null values! Cannot compute statistics or train models.' },
  outlier: { label: 'Sensor Error', color: C.orange, desc: 'temperature = 9999°C is physically impossible. This is a sensor malfunction. Including it will corrupt the mean and skew all statistics.' },
  impossible: { label: 'Impossible Value', color: C.purple, desc: 'pressure = -15 PSI is physically impossible for this pump. Negative gauge pressure here indicates sensor disconnection.' },
  duplicate: { label: 'Duplicate Row', color: C.pink, desc: 'Exact duplicate of row 7. Duplicates inflate data volume, bias training, and give the model false confidence in repeated patterns.' },
  inconsistent: { label: 'Inconsistent Category', color: C.cyan, desc: '"PUMP" and "Centrifugal Pump" represent the same thing. Inconsistent labels create fake categories and confuse the model.' },
}

function Section1_8020Rule() {
  const [hoveredIssue, setHoveredIssue] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)

  // Animated pie chart segments
  const segments = [
    { label: 'Data Cleaning', pct: 80, color: C.red, emoji: '🧹' },
    { label: 'Modeling', pct: 10, color: C.green, emoji: '🧠' },
    { label: 'Other', pct: 10, color: C.blue, emoji: '📊' },
  ]

  const activeIssue = selectedIssue || hoveredIssue
  const issueData = activeIssue ? issueInfo[activeIssue] : null

  return (
    <>
    <SectionBlock icon="🧹" title="The 80/20 Rule of Data Science" color={C.red}>
      <Neuron
        mood="thinking"
        message="Data scientists spend 80% of their time cleaning data — only 20% on actual modeling! For PdM specifically, dirty sensor data is the #1 reason models fail in production."
        size="medium"
        style={{ marginBottom: 32 }}
      />

      {/* Pie chart visualization */}
      <div style={{ display: 'flex', gap: 40, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', width: 200, height: 200 }}>
            {(() => {
              let offset = 0
              const r = 80
              const circ = 2 * Math.PI * r
              return segments.map((seg, i) => {
                const dash = (seg.pct / 100) * circ
                const gap = circ - dash
                const el = (
                  <motion.circle
                    key={i}
                    cx="100" cy="100" r={r}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={i === 0 ? 36 : 28}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={-offset}
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={{ strokeDasharray: `${dash} ${gap}` }}
                    transition={{ duration: 1.2, delay: i * 0.3, ease: 'easeOut' }}
                    style={{ opacity: 0.9 }}
                  />
                )
                offset += dash
                return el
              })
            })()}
          </svg>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.red }}>80%</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Cleaning</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {segments.map((seg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 + 0.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 6, background: seg.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {seg.emoji} {seg.label} — {seg.pct}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dirty dataset table */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Dirty Sensor Dataset — Click on highlighted rows to understand problems
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          This table has 5 different types of data quality problems. Can you spot them all?
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              {['Row', 'Timestamp', 'Vibration (mm/s)', 'Temperature (°C)', 'Pressure (PSI)', 'Equipment Type'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dirtyRows.map((row) => {
              const hasIssue = row.issues.length > 0
              const issueType = row.issues[0]
              const info = issueType ? issueInfo[issueType] : null
              const isSelected = selectedIssue === issueType
              return (
                <motion.tr
                  key={row.id}
                  onClick={() => hasIssue ? setSelectedIssue(isSelected ? null : issueType) : null}
                  whileHover={hasIssue ? { scale: 1.01 } : {}}
                  style={{
                    background: hasIssue ? `${info.color}18` : 'transparent',
                    cursor: hasIssue ? 'pointer' : 'default',
                    border: isSelected ? `2px solid ${info?.color}` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <td style={{ padding: '9px 14px', border: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    #{row.id} {hasIssue && <span style={{ marginLeft: 4, fontSize: 12, color: info.color, fontWeight: 800 }}>!</span>}
                  </td>
                  <td style={{ padding: '9px 14px', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12 }}>{row.timestamp}</td>
                  <td style={{
                    padding: '9px 14px', border: '1px solid var(--border)',
                    color: row.issues.includes('missing') ? C.red : 'var(--text-primary)',
                    fontWeight: row.issues.includes('missing') ? 800 : 400,
                  }}>
                    {row.vibration === null ? <span style={{ color: C.red }}>NULL ⚠</span> : row.vibration}
                  </td>
                  <td style={{
                    padding: '9px 14px', border: '1px solid var(--border)',
                    color: row.issues.includes('outlier') ? C.orange : 'var(--text-primary)',
                    fontWeight: row.issues.includes('outlier') ? 800 : 400,
                  }}>
                    {row.issues.includes('outlier') ? <span style={{ color: C.orange }}>9999 ⚠</span> : row.temperature}
                  </td>
                  <td style={{
                    padding: '9px 14px', border: '1px solid var(--border)',
                    color: (row.issues.includes('impossible') || row.issues.includes('duplicate')) ? C.purple : 'var(--text-primary)',
                    fontWeight: (row.issues.includes('impossible') || row.issues.includes('duplicate')) ? 800 : 400,
                  }}>
                    {row.issues.includes('impossible') || row.issues.includes('duplicate') ? <span style={{ color: C.purple }}>-15 ⚠</span> : row.pressure}
                  </td>
                  <td style={{
                    padding: '9px 14px', border: '1px solid var(--border)',
                    color: row.issues.includes('inconsistent') ? C.cyan : 'var(--text-primary)',
                    fontWeight: row.issues.includes('inconsistent') ? 800 : 400,
                  }}>
                    {row.issues.includes('inconsistent') ? <span style={{ color: C.cyan }}>PUMP ⚠</span> : row.equipment}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Issue explanation panel */}
      <AnimatePresence>
        {selectedIssue && issueData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: `${issueData.color}15`,
              border: `2px solid ${issueData.color}55`,
              borderRadius: 16,
              padding: '20px 24px',
              marginTop: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: issueData.color }} />
              <span style={{ fontWeight: 800, color: issueData.color, fontSize: 16 }}>{issueData.label}</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15 }}>
              {issueData.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedIssue && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 8, fontStyle: 'italic' }}>
          Click any highlighted row (!) to see why that data problem is harmful
        </div>
      )}

      <NeuronTip type="warning">
        In PdM, dirty data does not just give wrong predictions — it can cause false alarms (machine flagged as failing when it is fine) or worse, missed failures (machine appears healthy when it is about to break down). Both cost real money.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="80/20 नियम — डेटा सफ़ाई क्यों इतना समय लेती है?"
      english="80/20 Rule of Data Science"
      explanation="Data science में 80% समय data clean करने में जाता है, सिर्फ 20% model बनाने में। जैसे party से पहले घर साफ करना ज़रूरी है — पहले सफाई, फिर मेहमान। गंदे data पर बना model गलत predictions देता है — factory में यह मतलब है करोड़ों की बर्बादी!"
      example="एक pump का temperature sensor 9999°C दिखाए — यह clearly sensor error है। इसे बिना हटाए train करो तो model सोचेगा 9999°C normal है। ऐसा model production में पूरी तरह fail होगा।"
      terms={[
        { hindi: '80/20 नियम', english: '80/20 Rule (Pareto)', meaning: '80% effort data cleaning, 20% modeling — data science की reality' },
        { hindi: 'गंदा डेटा', english: 'Dirty Data', meaning: 'Missing, wrong, या inconsistent values वाला dataset' },
        { hindi: 'डेटा गुणवत्ता', english: 'Data Quality', meaning: 'dataset कितना accurate, complete, और consistent है' },
      ]}
    />
    </>
  )
}

/* ─────────────────────────────────────────────
   SECTION 2: Handling Missing Values
───────────────────────────────────────────── */
const RAW_TEMPS = [72, 74, null, 75, 73, null, 76, 78, null, 77, 79, 80, null, 78, 76, 75, 77, 79, 81, 80]

function Section2_MissingValues() {
  const [strategy, setStrategy] = useState('drop')

  const strategies = [
    { id: 'drop', label: 'Drop Rows', color: C.red, icon: '🗑' },
    { id: 'mean', label: 'Fill with Mean', color: C.blue, icon: '📊' },
    { id: 'median', label: 'Fill with Median', color: C.purple, icon: '📏' },
    { id: 'ffill', label: 'Forward Fill', color: C.green, icon: '➡' },
    { id: 'interpolate', label: 'Interpolation', color: C.orange, icon: '〜' },
  ]

  const mean = +(RAW_TEMPS.filter(v => v !== null).reduce((a, b) => a + b, 0) / RAW_TEMPS.filter(v => v !== null).length).toFixed(1)
  const sorted = [...RAW_TEMPS.filter(v => v !== null)].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  const applyStrategy = () => {
    if (strategy === 'drop') return RAW_TEMPS.map((v, i) => ({ i, v, dropped: v === null }))
    if (strategy === 'mean') return RAW_TEMPS.map((v, i) => ({ i, v: v === null ? mean : v, filled: v === null }))
    if (strategy === 'median') return RAW_TEMPS.map((v, i) => ({ i, v: v === null ? median : v, filled: v === null }))
    if (strategy === 'ffill') {
      let last = null
      return RAW_TEMPS.map((v, i) => {
        if (v !== null) { last = v; return { i, v } }
        return { i, v: last, filled: true }
      })
    }
    if (strategy === 'interpolate') {
      const result = [...RAW_TEMPS]
      for (let i = 0; i < result.length; i++) {
        if (result[i] === null) {
          let prev = i - 1, next = i + 1
          while (prev >= 0 && result[prev] === null) prev--
          while (next < result.length && result[next] === null) next++
          if (prev >= 0 && next < result.length) {
            const span = next - prev
            result[i] = +(result[prev] + ((result[next] - result[prev]) * (i - prev) / span)).toFixed(1)
          }
        }
      }
      return result.map((v, i) => ({ i, v, filled: RAW_TEMPS[i] === null }))
    }
    return RAW_TEMPS.map((v, i) => ({ i, v }))
  }

  const data = applyStrategy()
  const keptCount = data.filter(d => !d.dropped).length
  const active = strategies.find(s => s.id === strategy)

  const strategyInfo = {
    drop: { pros: 'Simple, keeps data clean', cons: 'Lost 20% of data! Bad when missing data is common.', best: 'Use when missing rows are < 5% and missing is truly random' },
    mean: { pros: 'Easy, preserves row count', cons: 'Creates flat line — does not reflect real sensor trends', best: 'OK for non-time-series data. Poor for sensors.' },
    median: { pros: 'Robust to outliers, preserves count', cons: 'Same flat-line problem as mean', best: 'Better than mean when data has outliers' },
    ffill: { pros: 'Reflects sensor "stuck at last value" behavior', cons: 'Long gaps carry stale values for too long', best: 'Best for PdM sensors: if sensor drops out, last reading is best guess' },
    interpolate: { pros: 'Smooth, realistic values between known points', cons: 'Slightly more complex, assumes linear change', best: 'Best for PdM when sensor data is continuous and smooth' },
  }

  const info = strategyInfo[strategy]

  // Mini chart data
  const chartMax = 85, chartMin = 68
  const filteredData = data.filter(d => !d.dropped)

  return (
    <>
    <SectionBlock icon="🔍" title="Handling Missing Values" color={C.blue}>
      <Neuron
        mood="explaining"
        message="In our 20-row sensor dataset, 4 rows have missing temperature readings. Each strategy has trade-offs — and for PdM sensor data, some strategies are much better than others."
        size="medium"
        style={{ marginBottom: 32 }}
      />

      <InteractiveDemo title="Missing Value Strategy Explorer" instruction="Choose a strategy below to see how it fills the 4 missing temperature values">
        {/* Strategy tabs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {strategies.map(s => (
            <motion.button
              key={s.id}
              onClick={() => setStrategy(s.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '9px 18px', borderRadius: 12,
                background: strategy === s.id ? s.color : 'var(--bg-card)',
                color: strategy === s.id ? 'white' : 'var(--text-secondary)',
                border: `2px solid ${strategy === s.id ? s.color : 'var(--border)'}`,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <span>{s.icon}</span> {s.label}
            </motion.button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Original Rows', val: 20, color: C.blue },
            { label: 'After Cleaning', val: strategy === 'drop' ? keptCount : 20, color: strategy === 'drop' ? C.red : C.green },
            { label: 'Missing Rows', val: 4, color: C.orange },
            { label: 'Data Lost', val: strategy === 'drop' ? '20%' : '0%', color: strategy === 'drop' ? C.red : C.green },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1, minWidth: 110, padding: '14px 18px', borderRadius: 14,
              background: `${stat.color}12`, border: `1.5px solid ${stat.color}40`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mini chart */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Temperature Over Time (°C)
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 16,
            height: 120,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Y axis labels */}
            {[85, 76, 68].map(y => (
              <div key={y} style={{
                position: 'absolute', left: 0, top: `${((85 - y) / (85 - 68)) * 88}px`,
                fontSize: 10, color: 'var(--text-secondary)', width: 26, textAlign: 'right',
              }}>{y}</div>
            ))}
            {/* Chart area */}
            <svg style={{ position: 'absolute', left: 30, top: 6, right: 8, height: 100 }} viewBox={`0 0 ${20 * 24} 100`} preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 50, 100].map(y => (
                <line key={y} x1="0" y1={y} x2={20 * 24} y2={y} stroke="var(--border)" strokeWidth="0.5" />
              ))}
              {/* Line connecting kept points */}
              {filteredData.length > 1 && (
                <polyline
                  points={filteredData.map(d => {
                    const x = d.i * 24 + 12
                    const y = 100 - ((d.v - chartMin) / (chartMax - chartMin)) * 90
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke={active.color}
                  strokeWidth="2"
                  opacity="0.7"
                />
              )}
              {/* Data points */}
              {data.map((d, i) => {
                if (d.dropped) return null
                const x = i * 24 + 12
                const y = 100 - ((d.v - chartMin) / (chartMax - chartMin)) * 90
                return (
                  <motion.circle
                    key={i}
                    cx={x} cy={y} r={d.filled ? 5 : 3.5}
                    fill={d.filled ? active.color : 'var(--text-primary)'}
                    stroke={d.filled ? active.color : 'var(--bg-card)'}
                    strokeWidth="1.5"
                    initial={{ r: 0 }}
                    animate={{ r: d.filled ? 5 : 3.5 }}
                    transition={{ delay: i * 0.04 }}
                  />
                )
              })}
            </svg>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: active.color, marginRight: 6, verticalAlign: 'middle' }} />
            {active.icon} Filled values (strategy: {active.label})
            &nbsp;&nbsp;
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--text-primary)', marginRight: 6, verticalAlign: 'middle' }} />
            Original values
          </div>
        </div>

        {/* Data table (first 10 rows) */}
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Row', 'Temperature', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, border: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 12).map((d, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: d.dropped ? 0.25 : 1 }}
                  style={{ background: d.filled ? `${active.color}12` : 'transparent' }}
                >
                  <td style={{ padding: '7px 14px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>#{i + 1}</td>
                  <td style={{ padding: '7px 14px', border: '1px solid var(--border)', color: d.dropped ? C.red : d.filled ? active.color : 'var(--text-primary)', fontWeight: (d.dropped || d.filled) ? 700 : 400 }}>
                    {d.dropped ? <span style={{ textDecoration: 'line-through' }}>NULL</span> : `${d.v}°C`}
                  </td>
                  <td style={{ padding: '7px 14px', border: '1px solid var(--border)', fontSize: 12 }}>
                    {d.dropped ? <span style={{ color: C.red, fontWeight: 700 }}>Dropped</span>
                      : d.filled ? <span style={{ color: active.color, fontWeight: 700 }}>Filled ({active.label})</span>
                        : RAW_TEMPS[i] === null ? null : <span style={{ color: C.green }}>Original</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Strategy info */}
        <motion.div
          key={strategy}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `${active.color}10`,
            border: `2px solid ${active.color}40`,
            borderRadius: 14,
            padding: '18px 22px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 4 }}>PROS</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{info.pros}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 4 }}>CONS</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{info.cons}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: active.color, fontWeight: 700, borderTop: `1px solid ${active.color}30`, paddingTop: 10 }}>
            Best for PdM: {info.best}
          </div>
        </motion.div>
      </InteractiveDemo>

      <NeuronTip type="tip">
        For PdM sensor data, Forward Fill and Interpolation are almost always better than mean/median. Sensors do not randomly skip values — when they drop out, the last known state is your best guess until the sensor recovers.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="लापता मान — जब sensor बंद हो जाए"
      english="Missing Value Handling"
      explanation="जब sensor की reading NULL आए — मान लो vibration sensor 15 मिनट के लिए बंद हो गया। अब क्या करें? Drop करो — data कम हो जाता है। Mean भरो — flat line बनती है जो realistic नहीं। Forward Fill — पिछली reading copy करो (PdM के लिए सबसे अच्छा!). Interpolation — दोनों known values के बीच smooth value निकालो।"
      example="Temperature readings: 72, 74, NULL, 77. Forward Fill: 72, 74, 74, 77 (पिछली value copy). Interpolation: 72, 74, 75.5, 77 (smooth). दोनों mean (74.3) से ज़्यादा realistic हैं sensor के behavior के लिए।"
      terms={[
        { hindi: 'लापता मान', english: 'Missing Value (NULL/NaN)', meaning: 'वो cell जिसमें कोई reading नहीं आई' },
        { hindi: 'आगे भरना', english: 'Forward Fill', meaning: 'पिछली value को NULL cell में copy करना' },
        { hindi: 'अंतर्वेशन', english: 'Interpolation', meaning: 'दो known values के बीच smooth value निकालना' },
      ]}
    />
    </>
  )
}

/* ─────────────────────────────────────────────
   SECTION 3: Outlier Treatment
───────────────────────────────────────────── */
function generateScatterData() {
  const pts = []
  // Normal cluster
  for (let i = 0; i < 170; i++) {
    const vib = 2 + Math.random() * 5 + Math.sin(i * 0.3) * 0.5
    const temp = 65 + Math.random() * 30 + vib * 2
    pts.push({ id: i, vib: +vib.toFixed(2), temp: +temp.toFixed(1), type: 'normal' })
  }
  // Real pre-failure signals (high vibration, elevated temp)
  const realSignals = [
    { id: 200, vib: 8.2, temp: 108 }, { id: 201, vib: 9.1, temp: 112 },
    { id: 202, vib: 10.5, temp: 115 }, { id: 203, vib: 11.2, temp: 118 },
    { id: 204, vib: 8.8, temp: 110 }, { id: 205, vib: 9.6, temp: 113 },
  ]
  realSignals.forEach(s => pts.push({ ...s, type: 'real_signal' }))
  // Sensor errors (extreme / impossible values)
  const errors = [
    { id: 300, vib: 18.5, temp: 95 }, { id: 301, vib: 16.2, temp: 45 },
    { id: 302, vib: 0.1, temp: 145 }, { id: 303, vib: 19.1, temp: 40 },
    { id: 304, vib: 17.8, temp: 50 }, { id: 305, vib: 15.8, temp: 42 },
  ]
  errors.forEach(e => pts.push({ ...e, type: 'sensor_error' }))
  return pts
}

const SCATTER_DATA = generateScatterData()

function Section3_Outliers() {
  const [method, setMethod] = useState('none')
  const [userClassified, setUserClassified] = useState({}) // id -> 'error' | 'signal'
  const [score, setScore] = useState(null)

  const methods = [
    { id: 'none', label: 'Show All', color: C.blue },
    { id: 'zscore', label: 'Z-Score > 3', color: C.orange },
    { id: 'iqr', label: 'IQR (1.5×)', color: C.purple },
    { id: 'domain', label: 'Domain Knowledge', color: C.green },
  ]

  // Stats for z-score
  const vibs = SCATTER_DATA.map(d => d.vib)
  const meanV = vibs.reduce((a, b) => a + b, 0) / vibs.length
  const stdV = Math.sqrt(vibs.map(v => (v - meanV) ** 2).reduce((a, b) => a + b, 0) / vibs.length)
  const temps = SCATTER_DATA.map(d => d.temp)
  const meanT = temps.reduce((a, b) => a + b, 0) / temps.length
  const stdT = Math.sqrt(temps.map(v => (v - meanT) ** 2).reduce((a, b) => a + b, 0) / temps.length)

  // IQR
  const sortedV = [...vibs].sort((a, b) => a - b)
  const q1V = sortedV[Math.floor(sortedV.length * 0.25)]
  const q3V = sortedV[Math.floor(sortedV.length * 0.75)]
  const iqrV = q3V - q1V

  const isOutlier = (d) => {
    if (method === 'zscore') {
      const zv = Math.abs((d.vib - meanV) / stdV)
      const zt = Math.abs((d.temp - meanT) / stdT)
      return zv > 3 || zt > 3
    }
    if (method === 'iqr') {
      return d.vib < q1V - 1.5 * iqrV || d.vib > q3V + 1.5 * iqrV
    }
    if (method === 'domain') {
      return d.vib > 15 || d.temp < 50 || d.temp > 140
    }
    return false
  }

  const outlierIds = method !== 'none' ? SCATTER_DATA.filter(isOutlier).map(d => d.id) : []

  const handleClassify = (d, classification) => {
    setUserClassified(prev => ({ ...prev, [d.id]: classification }))
    setScore(null)
  }

  const checkScore = () => {
    const outlierPts = SCATTER_DATA.filter(d => d.type !== 'normal')
    let correct = 0
    outlierPts.forEach(d => {
      const guess = userClassified[d.id]
      const actual = d.type === 'sensor_error' ? 'error' : 'signal'
      if (guess === actual) correct++
    })
    setScore({ correct, total: outlierPts.length })
  }

  // Scale to SVG
  const svgW = 480, svgH = 300
  const padL = 40, padB = 30, padT = 10, padR = 10
  const xMin = 0, xMax = 20, yMin = 35, yMax = 155
  const sx = (v) => padL + ((v - xMin) / (xMax - xMin)) * (svgW - padL - padR)
  const sy = (v) => svgH - padB - ((v - yMin) / (yMax - yMin)) * (svgH - padT - padB)

  const outlierPoints = SCATTER_DATA.filter(d => d.type !== 'normal')

  return (
    <>
    <SectionBlock icon="📡" title="Outlier Treatment — Sensor Errors vs Real Signals" color={C.orange}>
      <Neuron
        mood="thinking"
        message="Here is the tricky part: not all outliers are bad! Some extreme values are sensor malfunctions (remove them), but others are genuine pre-failure signals that you must keep for PdM to work."
        size="medium"
        style={{ marginBottom: 32 }}
      />

      <InteractiveDemo title="Outlier Detection Methods" instruction="Toggle detection methods to highlight outliers, then classify each one manually">
        {/* Method toggles */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {methods.map(m => (
            <motion.button
              key={m.id}
              onClick={() => setMethod(m.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '9px 18px', borderRadius: 12,
                background: method === m.id ? m.color : 'var(--bg-card)',
                color: method === m.id ? 'white' : 'var(--text-secondary)',
                border: `2px solid ${method === m.id ? m.color : 'var(--border)'}`,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              {m.label}
            </motion.button>
          ))}
        </div>

        {/* Method info */}
        <AnimatePresence mode="wait">
          {method !== 'none' && (
            <motion.div
              key={method}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 20, overflow: 'hidden' }}
            >
              <div style={{
                background: `${methods.find(m => m.id === method)?.color}15`,
                border: `1.5px solid ${methods.find(m => m.id === method)?.color}40`,
                borderRadius: 12, padding: '14px 18px',
              }}>
                {method === 'zscore' && (
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: C.orange }}>Z-Score: </strong>
                    z = (value - mean) / std. If |z| {'>'} 3, it is flagged as outlier.
                    Vibration: mean={meanV.toFixed(1)}, std={stdV.toFixed(1)} &nbsp;|&nbsp;
                    Upper limit: {(meanV + 3 * stdV).toFixed(1)} mm/s &nbsp;|&nbsp;
                    Found <strong>{outlierIds.length} outliers</strong>
                  </div>
                )}
                {method === 'iqr' && (
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: C.purple }}>IQR: </strong>
                    Q1={q1V.toFixed(1)}, Q3={q3V.toFixed(1)}, IQR={iqrV.toFixed(1)}.
                    Fence: [{(q1V - 1.5 * iqrV).toFixed(1)}, {(q3V + 1.5 * iqrV).toFixed(1)}] mm/s &nbsp;|&nbsp;
                    Found <strong>{outlierIds.length} outliers</strong>
                  </div>
                )}
                {method === 'domain' && (
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: C.green }}>Domain Rules: </strong>
                    Vibration {'>'} 15 mm/s is physically impossible (sensor failure). Temperature outside [50°C, 140°C] indicates sensor disconnect.
                    Found <strong>{outlierIds.length} outliers</strong>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scatter plot */}
        <div style={{ overflowX: 'auto', marginBottom: 16 }}>
          <svg width={svgW} height={svgH} style={{ display: 'block', maxWidth: '100%' }}>
            {/* Grid */}
            {[40, 60, 80, 100, 120, 140].map(t => (
              <g key={t}>
                <line x1={padL} y1={sy(t)} x2={svgW - padR} y2={sy(t)} stroke="var(--border)" strokeWidth="0.5" />
                <text x={padL - 4} y={sy(t) + 4} textAnchor="end" fontSize="9" fill="var(--text-secondary)">{t}</text>
              </g>
            ))}
            {[0, 5, 10, 15, 20].map(v => (
              <g key={v}>
                <line x1={sx(v)} y1={padT} x2={sx(v)} y2={svgH - padB} stroke="var(--border)" strokeWidth="0.5" />
                <text x={sx(v)} y={svgH - padB + 14} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{v}</text>
              </g>
            ))}
            {/* Axis labels */}
            <text x={padL + (svgW - padL - padR) / 2} y={svgH - 2} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">Vibration (mm/s)</text>
            <text x={12} y={svgH / 2} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" transform={`rotate(-90, 12, ${svgH / 2})`}>Temp (°C)</text>

            {/* Domain knowledge boundary */}
            {method === 'domain' && (
              <line x1={sx(15)} y1={padT} x2={sx(15)} y2={svgH - padB} stroke={C.green} strokeWidth="2" strokeDasharray="6,4" />
            )}

            {/* Z-score boundaries */}
            {method === 'zscore' && (
              <>
                <line x1={sx(Math.max(0, meanV - 3 * stdV))} y1={padT} x2={sx(Math.max(0, meanV - 3 * stdV))} y2={svgH - padB} stroke={C.orange} strokeWidth="1.5" strokeDasharray="4,3" />
                <line x1={sx(Math.min(20, meanV + 3 * stdV))} y1={padT} x2={sx(Math.min(20, meanV + 3 * stdV))} y2={svgH - padB} stroke={C.orange} strokeWidth="1.5" strokeDasharray="4,3" />
              </>
            )}

            {/* IQR boundaries */}
            {method === 'iqr' && (
              <>
                <line x1={sx(Math.max(0, q1V - 1.5 * iqrV))} y1={padT} x2={sx(Math.max(0, q1V - 1.5 * iqrV))} y2={svgH - padB} stroke={C.purple} strokeWidth="1.5" strokeDasharray="4,3" />
                <line x1={sx(q3V + 1.5 * iqrV)} y1={padT} x2={sx(q3V + 1.5 * iqrV)} y2={svgH - padB} stroke={C.purple} strokeWidth="1.5" strokeDasharray="4,3" />
              </>
            )}

            {/* Normal points */}
            {SCATTER_DATA.filter(d => d.type === 'normal').map(d => (
              <circle key={d.id} cx={sx(d.vib)} cy={sy(d.temp)} r="3" fill={C.blue} opacity="0.45" />
            ))}

            {/* Outlier points */}
            {outlierPoints.map(d => {
              const highlighted = outlierIds.includes(d.id)
              const classified = userClassified[d.id]
              const pointColor = classified === 'error' ? C.red : classified === 'signal' ? C.orange : (highlighted ? (d.type === 'real_signal' ? C.orange : C.red) : C.blue)
              return (
                <motion.circle
                  key={d.id}
                  cx={sx(d.vib)} cy={sy(d.temp)} r={highlighted ? 7 : 4}
                  fill={pointColor}
                  opacity={highlighted ? 0.9 : 0.5}
                  stroke={highlighted ? 'white' : 'none'}
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleClassify(d, classified === 'error' ? 'signal' : classified === 'signal' ? null : 'error')}
                  whileHover={{ scale: 1.3 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )
            })}
          </svg>
        </div>

        {/* Classification legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.blue }} />
            <span style={{ color: 'var(--text-secondary)' }}>Normal readings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.red, border: '2px solid white' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Classified as Sensor Error (remove)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.orange, border: '2px solid white' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Classified as Real Signal (keep)</span>
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontStyle: 'italic' }}>
          Click each highlighted outlier point to classify it. Cycle: Sensor Error → Real Signal → unclassified
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <motion.button
            onClick={checkScore}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '10px 22px', borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Check My Classification Score
          </motion.button>
          <AnimatePresence>
            {score && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '10px 18px', borderRadius: 12,
                  background: score.correct >= 10 ? `${C.green}20` : `${C.orange}20`,
                  border: `2px solid ${score.correct >= 10 ? C.green : C.orange}`,
                  fontSize: 15, fontWeight: 700,
                  color: score.correct >= 10 ? C.green : C.orange,
                }}
              >
                {score.correct}/{score.total} correct {score.correct === score.total ? '— Perfect!' : score.correct >= 8 ? '— Great job!' : '— Keep trying!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </InteractiveDemo>

      <NeuronTip type="warning">
        Automated outlier removal (z-score, IQR) is dangerous for PdM. A machine at vibration 9 mm/s before bearing failure IS an outlier statistically — but it is exactly what you want your model to learn from. Always combine statistical methods with domain knowledge.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="बाहरी मान — जब data बहुत अलग हो"
      english="Outlier Treatment"
      explanation="Outlier वो value है जो बाकी सब से बहुत अलग हो। जैसे exam में 100 में से 1000 marks — clearly गलत है! लेकिन PdM में सावधानी ज़रूरी है: कुछ outliers sensor errors हैं (हटाओ), कुछ real failure signals हैं (रखो!). Vibration 18 mm/s — sensor failure या bearing failure?"
      example="Temperature = 9999°C → sensor error, हटाओ। Vibration = 9.5 mm/s जबकि normal 2-4 है → यह real pre-failure signal हो सकता है! इसे हटाने से model failure predict करना बंद कर देगा।"
      terms={[
        { hindi: 'बाहरी मान', english: 'Outlier', meaning: 'बाकी data से बहुत अलग value — हमेशा बुरा नहीं!' },
        { hindi: 'Z-Score', english: 'Z-Score Method', meaning: 'mean से कितने standard deviations दूर है — |z| > 3 = outlier' },
        { hindi: 'डोमेन ज्ञान', english: 'Domain Knowledge', meaning: 'machinery की physical limits जानना — impossible values पहचानना' },
      ]}
    />
    </>
  )
}

/* ─────────────────────────────────────────────
   SECTION 4: Normalization & Scaling
───────────────────────────────────────────── */
const RAW_FEATURES = {
  vibration: { raw: [0.5, 3.2, 6.7, 9.1, 12.0], unit: 'mm/s', min: 0.5, max: 12.0, mean: 6.3, std: 4.1, median: 6.7, iqr: 5.9 },
  temperature: { raw: [52, 68, 87, 103, 118], unit: '°C', min: 52, max: 118, mean: 85.6, std: 24.8, median: 87, iqr: 35 },
  pressure: { raw: [82, 98, 115, 132, 148], unit: 'PSI', min: 82, max: 148, mean: 115, std: 24.7, median: 115, iqr: 34 },
}

function Section4_Normalization() {
  const [scaling, setScaling] = useState('raw')

  const scalingMethods = [
    { id: 'raw', label: 'Raw Values', color: C.red, formula: null },
    { id: 'minmax', label: 'Min-Max (0-1)', color: C.blue, formula: 'x_scaled = (x - min) / (max - min)' },
    { id: 'standard', label: 'Standard (Z-score)', color: C.purple, formula: 'x_scaled = (x - mean) / std' },
    { id: 'robust', label: 'Robust (IQR)', color: C.green, formula: 'x_scaled = (x - median) / IQR' },
  ]

  const transform = (vals, feat, method) => {
    const f = RAW_FEATURES[feat]
    if (method === 'raw') return vals
    if (method === 'minmax') return vals.map(v => +((v - f.min) / (f.max - f.min)).toFixed(3))
    if (method === 'standard') return vals.map(v => +((v - f.mean) / f.std).toFixed(3))
    if (method === 'robust') return vals.map(v => +((v - f.median) / f.iqr).toFixed(3))
    return vals
  }

  const active = scalingMethods.find(s => s.id === scaling)

  const features = [
    { key: 'vibration', label: 'Vibration', color: C.blue, icon: '📳' },
    { key: 'temperature', label: 'Temperature', color: C.orange, icon: '🌡' },
    { key: 'pressure', label: 'Pressure', color: C.purple, icon: '⚡' },
  ]

  const scalingWhen = {
    raw: 'Never use raw! Different scales mean pressure (80-150) dominates over vibration (0-12) in distance-based ML models.',
    minmax: 'Use for: Neural networks, KNN, SVM. Sensitive to outliers — one extreme value compresses all others.',
    standard: 'Use for: Linear regression, PCA, SVM. Assumes roughly normal distribution. Most common choice.',
    robust: 'Use for: Data with outliers. Uses median/IQR instead of mean/std, so outliers do not distort the scaling.',
  }

  return (
    <>
    <SectionBlock icon="⚖" title="Normalization & Scaling" color={C.blue}>
      <Neuron
        mood="explaining"
        message="Vibration ranges from 0-12, but pressure ranges from 80-150. Without scaling, ML models think pressure is 10x more important just because its numbers are bigger! Scaling puts everyone on equal footing."
        size="medium"
        style={{ marginBottom: 32 }}
      />

      <InteractiveDemo title="Feature Scaling Comparison" instruction="Toggle between scaling methods to see how the same data looks differently">
        {/* Method buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {scalingMethods.map(m => (
            <motion.button
              key={m.id}
              onClick={() => setScaling(m.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '9px 18px', borderRadius: 12,
                background: scaling === m.id ? m.color : 'var(--bg-card)',
                color: scaling === m.id ? 'white' : 'var(--text-secondary)',
                border: `2px solid ${scaling === m.id ? m.color : 'var(--border)'}`,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              {m.label}
            </motion.button>
          ))}
        </div>

        {/* Formula */}
        <AnimatePresence mode="wait">
          {active.formula && (
            <motion.div
              key={scaling}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: `${active.color}12`,
                border: `1.5px solid ${active.color}40`,
                borderRadius: 12, padding: '12px 18px',
                marginBottom: 24, fontFamily: 'monospace',
                fontSize: 15, color: active.color, fontWeight: 700,
              }}
            >
              Formula: {active.formula}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bar chart visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
          {features.map(feat => {
            const rawVals = RAW_FEATURES[feat.key].raw
            const scaledVals = transform(rawVals, feat.key, scaling)
            const allVals = features.flatMap(f => transform(RAW_FEATURES[f.key].raw, f.key, scaling))
            const globalMax = Math.max(...allVals.map(Math.abs))
            const globalMin = Math.min(...allVals)

            return (
              <div key={feat.key}>
                <div style={{ fontSize: 14, fontWeight: 700, color: feat.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {feat.icon} {feat.label} ({RAW_FEATURES[feat.key].unit})
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  {scaledVals.map((v, i) => {
                    const barH = globalMax > 0 ? Math.abs(v) / globalMax * 80 : 10
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>{v}</div>
                        <motion.div
                          animate={{ height: Math.max(barH, 4) }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{
                            width: '100%', minHeight: 4,
                            background: `${feat.color}${v >= 0 ? 'cc' : '66'}`,
                            borderRadius: 4, transformOrigin: 'bottom',
                          }}
                        />
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>S{i + 1}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* When to use */}
        <motion.div
          key={scaling}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `${active.color}10`,
            border: `2px solid ${active.color}40`,
            borderRadius: 14,
            padding: '16px 20px',
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          <span style={{ fontWeight: 700, color: active.color }}>When to use: </span>
          {scalingWhen[scaling]}
        </motion.div>
      </InteractiveDemo>

      <NeuronTip type="tip">
        For PdM with vibration, temperature, and pressure sensors: use Standard Scaling for neural networks and PCA, Min-Max for deep learning, and Robust Scaling when your sensor data has frequent outlier spikes before maintenance.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="सामान्यीकरण — सभी features को एक scale पर लाना"
      english="Normalization / Scaling"
      explanation="Temperature 85°C और Vibration 0.3 mm/s — दोनों important हैं। लेकिन ML model देखता है 85 बनाम 0.3 और सोचता है temperature ज़्यादा important है! Scaling के बाद दोनों 0-1 या -1 to 1 range में आ जाते हैं। अब model fairly compare कर सकता है।"
      example="बिना scaling: Pressure (80-150) ML model को लगता है pressure सबसे important है। Scaling के बाद: Pressure 0.0-1.0, Vibration 0.0-1.0 — अब model सही features की importance देख सकता है।"
      terms={[
        { hindi: 'सामान्यीकरण', english: 'Normalization (Min-Max)', meaning: 'values को 0 से 1 के बीच लाना' },
        { hindi: 'मानकीकरण', english: 'Standardization (Z-score)', meaning: 'mean 0 और std 1 करना' },
        { hindi: 'मज़बूत स्केलिंग', english: 'Robust Scaling', meaning: 'median और IQR से scaling — outliers का कम असर' },
      ]}
    />
    </>
  )
}

/* ─────────────────────────────────────────────
   SECTION 5: Categorical Encoding
───────────────────────────────────────────── */
const EQUIPMENT_TYPES = ['Pump', 'Motor', 'Compressor', 'Fan', 'Valve']
const FAILURE_RATES = { Pump: 0.15, Motor: 0.08, Compressor: 0.22, Fan: 0.05, Valve: 0.11 }
const SAMPLE_EQUIPMENT = ['Pump', 'Motor', 'Pump', 'Compressor', 'Fan', 'Valve', 'Motor', 'Pump']

function Section5_Encoding() {
  const [encoding, setEncoding] = useState('raw')

  const encodingMethods = [
    { id: 'raw', label: 'Raw (Strings)', color: C.red, icon: '❌' },
    { id: 'label', label: 'Label Encoding', color: C.blue, icon: '1️⃣' },
    { id: 'onehot', label: 'One-Hot Encoding', color: C.purple, icon: '🔥' },
    { id: 'target', label: 'Target Encoding', color: C.green, icon: '🎯' },
  ]

  const labelMap = EQUIPMENT_TYPES.reduce((acc, t, i) => ({ ...acc, [t]: i }), {})

  const encodingInfo = {
    raw: { desc: 'ML models cannot use text — strings cause errors. You must encode before training.', warning: 'Cannot be used with any ML model directly.', when: '' },
    label: { desc: 'Assigns integer: Pump=0, Motor=1, Compressor=2, Fan=3, Valve=4. Simple, but implies Valve(4) > Pump(0), which is false!', warning: 'Dangerous for linear models — implies ordering. OK for tree models (RF, XGBoost).', when: 'Use for: Random Forest, XGBoost, LightGBM — they split on thresholds so ordering does not matter.' },
    onehot: { desc: 'Creates one binary column per category. 5 equipment types → 5 columns. Each row has exactly one "1". No false ordering!', warning: 'With hundreds of categories, this creates too many columns (high dimensionality).', when: 'Use for: Linear regression, logistic regression, neural networks, SVM. The safe default.' },
    target: { desc: 'Replaces category with its target-variable statistic (e.g., failure rate). Pump has 15% failure rate → encode as 0.15.', warning: 'Risk of data leakage if not done carefully — must use cross-validation encoding.', when: 'Use for: High-cardinality categoricals, gradient boosting. Very powerful for PdM.' },
  }

  const active = encodingMethods.find(m => m.id === encoding)
  const info = encodingInfo[encoding]

  return (
    <>
    <SectionBlock icon="🔢" title="Categorical Encoding" color={C.purple}>
      <Neuron
        mood="explaining"
        message='Machines speak numbers, not words. "Pump" and "Motor" mean nothing to an ML algorithm. We must convert category names into numbers — but the method matters a lot!'
        size="medium"
        style={{ marginBottom: 32 }}
      />

      <InteractiveDemo title="Encoding Method Explorer" instruction="Click each encoding method to see the transformation">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {encodingMethods.map(m => (
            <motion.button
              key={m.id}
              onClick={() => setEncoding(m.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '9px 18px', borderRadius: 12,
                background: encoding === m.id ? m.color : 'var(--bg-card)',
                color: encoding === m.id ? 'white' : 'var(--text-secondary)',
                border: `2px solid ${encoding === m.id ? m.color : 'var(--border)'}`,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {m.icon} {m.label}
            </motion.button>
          ))}
        </div>

        {/* Encoding table */}
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <AnimatePresence mode="wait">
            <motion.div key={encoding} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {encoding === 'onehot' ? (
                <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '8px 12px', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700 }}>Row</th>
                      <th style={{ padding: '8px 12px', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700 }}>Original</th>
                      {EQUIPMENT_TYPES.map(t => (
                        <th key={t} style={{ padding: '8px 12px', border: '1px solid var(--border)', color: C.purple, fontWeight: 700, whiteSpace: 'nowrap' }}>is_{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_EQUIPMENT.map((eq, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                        <td style={{ padding: '7px 12px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>#{i + 1}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600 }}>{eq}</td>
                        {EQUIPMENT_TYPES.map(t => (
                          <td key={t} style={{
                            padding: '7px 12px', border: '1px solid var(--border)',
                            background: eq === t ? `${C.purple}20` : 'transparent',
                            color: eq === t ? C.purple : 'var(--text-secondary)',
                            fontWeight: eq === t ? 800 : 400,
                            textAlign: 'center',
                          }}>
                            {eq === t ? 1 : 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table style={{ borderCollapse: 'collapse', fontSize: 13, minWidth: 320 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '8px 12px', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700 }}>Row</th>
                      <th style={{ padding: '8px 12px', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700 }}>Original</th>
                      <th style={{ padding: '8px 12px', border: '1px solid var(--border)', color: active.color, fontWeight: 700 }}>
                        {encoding === 'raw' ? 'Problem' : encoding === 'label' ? 'Label Code' : 'Failure Rate'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_EQUIPMENT.map((eq, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                        <td style={{ padding: '7px 12px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>#{i + 1}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600 }}>{eq}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid var(--border)', color: active.color, fontWeight: 700 }}>
                          {encoding === 'raw' && <span style={{ color: C.red }}>Cannot use! (text)</span>}
                          {encoding === 'label' && labelMap[eq]}
                          {encoding === 'target' && FAILURE_RATES[eq]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Info panel */}
        <motion.div
          key={encoding + '_info'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `${active.color}10`,
            border: `2px solid ${active.color}40`,
            borderRadius: 14, padding: '18px 22px',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{info.desc}</div>
          <div style={{ fontSize: 13, color: C.red, fontWeight: 600, marginBottom: info.when ? 8 : 0 }}>⚠ {info.warning}</div>
          {info.when && <div style={{ fontSize: 13, color: active.color, fontWeight: 700 }}>Best for: {info.when}</div>}
        </motion.div>
      </InteractiveDemo>

      <NeuronTip type="tip">
        In PdM: equipment_type is usually low-cardinality (5-20 types) — use one-hot encoding for linear models or label encoding for tree models. For high-cardinality features like equipment_id (hundreds of machines), target encoding with the machine-specific failure rate is powerful.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="कूटलेखन — machine को text नहीं, numbers चाहिए"
      english="Categorical Encoding"
      explanation="ML model text नहीं पढ़ सकता। 'Pump', 'Motor', 'Compressor' — model के लिए meaningless हैं। इन्हें numbers में बदलना पड़ता है। Label Encoding: Pump=0, Motor=1, Compressor=2 (simple लेकिन order implicitly आ जाता है). One-Hot: हर category का अपना column (सबसे safe)."
      example="Equipment Type column में 'Pump' और 'Motor' हैं। Label: Pump→0, Motor→1। One-Hot: is_Pump और is_Motor दो नए columns बनते हैं। Tree models label encoding handle करते हैं, linear models के लिए one-hot बेहतर है।"
      terms={[
        { hindi: 'कूटलेखन', english: 'Encoding', meaning: 'text categories को numbers में convert करना' },
        { hindi: 'लेबल कूटलेखन', english: 'Label Encoding', meaning: 'हर category को एक integer assign करना — tree models के लिए' },
        { hindi: 'वन-हॉट कूटलेखन', english: 'One-Hot Encoding', meaning: 'हर category का binary column बनाना — linear models के लिए' },
      ]}
    />
    </>
  )
}

/* ─────────────────────────────────────────────
   SECTION 6: Pipeline Builder
───────────────────────────────────────────── */
function Section6_Pipeline() {
  const [steps, setSteps] = useState({
    dedup: false,
    missing: 'none',
    outlier: 'none',
    normalize: 'none',
    encode: 'none',
  })

  const updateStep = (key, val) => setSteps(prev => ({ ...prev, [key]: val }))

  // Compute quality score and record count
  const baseRecords = 1000
  const baseScore = 35

  let records = baseRecords
  let score = baseScore
  const log = []

  if (steps.dedup) {
    records -= 47
    score += 8
    log.push({ label: 'Remove duplicates', gain: '+8 pts', records, color: C.blue })
  }
  if (steps.missing !== 'none') {
    const gains = { drop: { r: -80, s: 10 }, mean: { r: 0, s: 8 }, median: { r: 0, s: 9 }, ffill: { r: 0, s: 14 }, interpolate: { r: 0, s: 16 } }
    const g = gains[steps.missing]
    records += g.r
    score += g.s
    log.push({ label: `Handle missing: ${steps.missing}`, gain: `+${g.s} pts`, records, color: C.green })
  }
  if (steps.outlier !== 'none') {
    const gains = { zscore: { r: -23, s: 8 }, iqr: { r: -31, s: 9 }, domain: { r: -18, s: 13 } }
    const g = gains[steps.outlier]
    records += g.r
    score += g.s
    log.push({ label: `Remove outliers: ${steps.outlier}`, gain: `+${g.s} pts`, records, color: C.orange })
  }
  if (steps.normalize !== 'none') {
    score += 14
    log.push({ label: `Normalize: ${steps.normalize}`, gain: '+14 pts', records, color: C.purple })
  }
  if (steps.encode !== 'none') {
    score += 11
    log.push({ label: `Encode: ${steps.encode}`, gain: '+11 pts', records, color: C.pink })
  }

  score = Math.min(score, 100)

  const qualityColor = score >= 80 ? C.green : score >= 60 ? C.orange : C.red
  const qualityLabel = score >= 80 ? 'Production Ready' : score >= 60 ? 'Good — Keep improving' : score >= 40 ? 'Fair — Needs more work' : 'Poor — Start cleaning!'

  return (
    <>
    <SectionBlock icon="🏗" title="Data Cleaning Pipeline Builder" color={C.teal}>
      <Neuron
        mood="excited"
        message="Now let us build a complete data cleaning pipeline! Toggle each step and watch your data quality score improve. A score above 80 means your dataset is production-ready for PdM."
        size="medium"
        style={{ marginBottom: 32 }}
      />

      <InteractiveDemo title="Build Your Cleaning Pipeline" instruction="Configure each step below. Watch the quality score and record count change in real time.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 28 }}>
          {/* Left: Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Step 1: Dedup */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: 8, background: C.blue, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>1</span>
                Remove Duplicates
              </div>
              <motion.div
                onClick={() => updateStep('dedup', !steps.dedup)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                  background: steps.dedup ? `${C.blue}20` : 'var(--bg-secondary)',
                  border: `2px solid ${steps.dedup ? C.blue : 'var(--border)'}`,
                  color: steps.dedup ? C.blue : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: steps.dedup ? C.blue : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: 'white', flexShrink: 0,
                }}>
                  {steps.dedup ? '✓' : ''}
                </div>
                {steps.dedup ? 'Enabled — removes 47 duplicate rows' : 'Click to enable'}
              </motion.div>
            </div>

            {/* Step 2: Missing */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: 8, background: C.green, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>2</span>
                Handle Missing Values
              </div>
              <select
                value={steps.missing}
                onChange={e => updateStep('missing', e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  background: steps.missing !== 'none' ? `${C.green}15` : 'var(--bg-secondary)',
                  border: `2px solid ${steps.missing !== 'none' ? C.green : 'var(--border)'}`,
                  color: 'var(--text-primary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="none">— Select strategy —</option>
                <option value="drop">Drop rows with missing values</option>
                <option value="mean">Fill with mean</option>
                <option value="median">Fill with median</option>
                <option value="ffill">Forward fill (recommended for PdM)</option>
                <option value="interpolate">Interpolation (best for PdM)</option>
              </select>
            </div>

            {/* Step 3: Outlier */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: 8, background: C.orange, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>3</span>
                Remove Outliers
              </div>
              <select
                value={steps.outlier}
                onChange={e => updateStep('outlier', e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  background: steps.outlier !== 'none' ? `${C.orange}15` : 'var(--bg-secondary)',
                  border: `2px solid ${steps.outlier !== 'none' ? C.orange : 'var(--border)'}`,
                  color: 'var(--text-primary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="none">— Select method —</option>
                <option value="zscore">Z-Score (|z| &gt; 3)</option>
                <option value="iqr">IQR (1.5× fence)</option>
                <option value="domain">Domain knowledge rules</option>
              </select>
            </div>

            {/* Step 4: Normalize */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: 8, background: C.purple, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>4</span>
                Normalize Features
              </div>
              <select
                value={steps.normalize}
                onChange={e => updateStep('normalize', e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  background: steps.normalize !== 'none' ? `${C.purple}15` : 'var(--bg-secondary)',
                  border: `2px solid ${steps.normalize !== 'none' ? C.purple : 'var(--border)'}`,
                  color: 'var(--text-primary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="none">— Select scaling —</option>
                <option value="minmax">Min-Max (0 to 1)</option>
                <option value="standard">Standard (Z-score)</option>
                <option value="robust">Robust (IQR-based)</option>
              </select>
            </div>

            {/* Step 5: Encode */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: 8, background: C.pink, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>5</span>
                Encode Categoricals
              </div>
              <select
                value={steps.encode}
                onChange={e => updateStep('encode', e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  background: steps.encode !== 'none' ? `${C.pink}15` : 'var(--bg-secondary)',
                  border: `2px solid ${steps.encode !== 'none' ? C.pink : 'var(--border)'}`,
                  color: 'var(--text-primary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="none">— Select encoding —</option>
                <option value="label">Label Encoding</option>
                <option value="onehot">One-Hot Encoding</option>
                <option value="target">Target Encoding</option>
              </select>
            </div>
          </div>

          {/* Right: Score & Log */}
          <div>
            {/* Quality score gauge */}
            <div style={{
              background: 'var(--bg-card)',
              border: `2px solid ${qualityColor}40`,
              borderRadius: 18,
              padding: '24px 20px',
              textAlign: 'center',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>DATA QUALITY SCORE</div>
              <motion.div
                animate={{ color: qualityColor }}
                style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}
              >
                {score}
              </motion.div>
              <div style={{ fontSize: 13, fontWeight: 700, color: qualityColor, marginTop: 4 }}>{qualityLabel}</div>

              {/* Progress bar */}
              <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 10, overflow: 'hidden', marginTop: 16 }}>
                <motion.div
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${C.red}, ${C.orange}, ${C.green})`, borderRadius: 10 }}
                />
              </div>

              {/* Record count */}
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>RECORDS</div>
                  <motion.div animate={{ color: 'var(--text-primary)' }} style={{ fontSize: 22, fontWeight: 800 }}>{records.toLocaleString()}</motion.div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>REMOVED</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.red }}>{(baseRecords - records).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Pipeline log */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 18px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Pipeline Steps</div>
              {log.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>No steps configured yet...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {log.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', borderRadius: 8,
                        background: `${step.color}12`,
                        border: `1px solid ${step.color}30`,
                      }}
                    >
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Step {i + 1}: {step.label}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: step.color }}>{step.gain}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </InteractiveDemo>

      <NeuronTip type="example">
        Recommended pipeline for PdM: (1) Remove duplicates → (2) Forward fill or interpolate missing values → (3) Apply domain knowledge rules to flag sensor errors → (4) Robust scaling for numerical features → (5) One-hot or target encoding for equipment type. This combination typically yields quality scores above 85.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="सफाई pipeline — सही क्रम में सब कुछ"
      english="Data Cleaning Pipeline"
      explanation="Data cleaning एक assembly line की तरह है — हर step एक specific problem solve करता है। पहले duplicates हटाओ (वरना बाद में bias आएगा), फिर missing values भरो, फिर outliers handle करो, फिर scale करो, फिर encode करो। यह क्रम matter करता है — उलटा करने से गलत results आएंगे।"
      example="1000 rows का dataset: duplicates हटाए → 953 rows, missing values भरे → 953 rows बरकरार, outliers हटाए → 930 rows, scaling → सभी features 0-1, encoding → text columns numbers में। Data Quality Score: 35 से 92 तक!"
      terms={[
        { hindi: 'सफाई pipeline', english: 'Cleaning Pipeline', meaning: 'data clean करने के steps का क्रमबद्ध set' },
        { hindi: 'नकल हटाना', english: 'Deduplication', meaning: 'एक जैसी rows को हटाना — pipeline का पहला step' },
        { hindi: 'डेटा गुणवत्ता स्कोर', english: 'Data Quality Score', meaning: 'dataset की quality को 0-100 number में measure करना' },
      ]}
    />
    </>
  )
}

/* ─────────────────────────────────────────────
   SECTION 7: Hindi Summary
───────────────────────────────────────────── */
function Section7_Hindi() {
  return (
    <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी सारांश" color={C.orange}>
      <Neuron
        mood="waving"
        message="Let us review all the key Data Cleaning concepts in Hindi! These terms will appear in your assignments and quizzes."
        size="medium"
        style={{ marginBottom: 32 }}
      />

      <HindiExplainer
        concept="डेटा सफ़ाई (Data Cleaning)"
        english="Data Cleaning / Data Preprocessing"
        explanation="डेटा सफ़ाई का मतलब है अपने डेटासेट से गलत, अधूरे, और बेकार डेटा को हटाना या ठीक करना। जैसे कि अगर एक सेंसर का temperature 9999°C दिखा रहा है, तो वो clearly एक error है — उसे हटाना ज़रूरी है। Machine Learning models गंदे डेटा पर train होने पर गलत predictions देते हैं।"
        example="जैसे एक factory का कर्मचारी production report बनाने से पहले उसमें से टाइपिंग errors और blank rows हटाता है — वैसे ही data scientist ML से पहले data clean करता है।"
        terms={[
          { hindi: 'डेटा सफ़ाई', english: 'Data Cleaning', meaning: 'गलत और अधूरे डेटा को ठीक करना' },
          { hindi: 'लापता मान', english: 'Missing Value', meaning: 'वो cell जिसमें कोई value नहीं है (NULL/NaN)' },
          { hindi: 'बाहरी मान', english: 'Outlier', meaning: 'वो value जो बाकी सब से बहुत अलग हो' },
          { hindi: 'सामान्यीकरण', english: 'Normalization / Scaling', meaning: 'सभी features को एक जैसे scale पर लाना' },
          { hindi: 'कूटलेखन', english: 'Encoding', meaning: 'Text categories को numbers में बदलना' },
          { hindi: 'प्रतिस्थापन', english: 'Imputation', meaning: 'Missing values को किसी technique से भरना' },
          { hindi: 'नकल हटाना', english: 'Deduplication', meaning: 'एक जैसी rows को हटाना' },
          { hindi: 'आगे भरना', english: 'Forward Fill', meaning: 'Missing value को उससे पहले की value से भरना' },
          { hindi: 'अंतर्वेशन', english: 'Interpolation', meaning: 'दो known values के बीच smooth value निकालना' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
        {[
          { icon: '🧹', title: 'Data Cleaning = 80% काम', desc: 'Data scientist का 80% समय data clean करने में जाता है। Dirty data से wrong model बनता है।', color: C.red },
          { icon: '🔍', title: 'Missing Values के 5 तरीके', desc: 'Drop, Mean, Median, Forward Fill, Interpolation — PdM के लिए Forward Fill और Interpolation सबसे अच्छे हैं।', color: C.blue },
          { icon: '📡', title: 'Outlier = हमेशा बुरा नहीं', desc: 'कुछ outliers sensor errors हैं (remove करो), कुछ real failure signals हैं (keep करो)। Domain knowledge ज़रूरी है।', color: C.orange },
          { icon: '⚖', title: 'Scaling क्यों ज़रूरी है?', desc: 'Pressure (80-150) और Vibration (0-12) को बिना scaling ML model pressure को ज़्यादा important मानेगा।', color: C.purple },
          { icon: '🔢', title: 'Encoding के 3 तरीके', desc: 'Label (tree models), One-Hot (linear models), Target (high-cardinality). PdM में equipment type के लिए One-Hot safe choice है।', color: C.green },
          { icon: '🏗', title: 'Pipeline = सही क्रम', desc: 'पहले duplicates हटाओ, फिर missing values भरो, फिर outliers हटाओ, फिर scale करो, फिर encode करो।', color: C.teal },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: `${card.color}10`,
              border: `1.5px solid ${card.color}35`,
              borderRadius: 16,
              padding: '20px 22px',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: card.color, marginBottom: 8 }}>{card.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{card.desc}</div>
          </motion.div>
        ))}
      </div>
    </SectionBlock>
  )
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function Topic6Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #ef444415, #f59e0b15)',
          border: '1.5px solid #ef444430',
          borderRadius: 22,
          padding: '36px 40px',
          marginBottom: 36,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 160, opacity: 0.04, userSelect: 'none' }}>🧹</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>🧹</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', letterSpacing: 1, textTransform: 'uppercase' }}>Topic 6</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Data Cleaning Masterclass
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          Before any ML model can predict equipment failures, your sensor data must be clean. Learn to handle missing values, detect outliers, normalize features, and encode categories — the essential skills for production-grade PdM systems.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          {['80/20 Rule', 'Missing Values', 'Outlier Detection', 'Normalization', 'Encoding', 'Pipeline Building'].map(tag => (
            <span key={tag} style={{
              padding: '5px 14px', borderRadius: 20,
              background: '#ef444418', border: '1px solid #ef444430',
              fontSize: 12, fontWeight: 700, color: '#ef4444',
            }}>{tag}</span>
          ))}
        </div>
      </motion.div>

      {/* Sections */}
      <Section1_8020Rule />
      <Section2_MissingValues />
      <Section3_Outliers />
      <Section4_Normalization />
      <Section5_Encoding />
      <Section6_Pipeline />
      <Section7_Hindi />

      {/* Footer tip */}
      <NeuronTip type="deep">
        The best PdM data scientists combine automated cleaning pipelines with domain expertise. Write your cleaning logic as repeatable scikit-learn Pipeline objects so the exact same transformations apply to both training data and live sensor streams. Drift in cleaning logic between training and production is a silent killer of PdM model performance.
      </NeuronTip>
    </div>
  )
}
