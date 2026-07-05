import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 7 — Feature Engineering
   MTBF, degradation curves, lifecycle ratios, rolling statistics
================================================================ */

/* ---- Helper: deviation color ---- */
function deviationColor(pct) {
  const abs = Math.abs(pct)
  if (abs < 10) return '#10b981'
  if (abs < 30) return '#f59e0b'
  if (abs < 50) return '#f97316'
  return '#ef4444'
}

function deviationLabel(pct) {
  const abs = Math.abs(pct)
  if (abs < 10) return 'Normal'
  if (abs < 30) return 'Elevated'
  if (abs < 50) return 'Warning'
  return 'Critical'
}

/* ============================
   SECTION 1: Why Raw Data Isn't Enough
============================ */
function RawDataInsight() {
  const [temp, setTemp] = useState(85)

  const pumpA = { baseline: 80 }
  const pumpB = { baseline: 60 }

  const devA = ((temp - pumpA.baseline) / pumpA.baseline * 100).toFixed(2)
  const devB = ((temp - pumpB.baseline) / pumpB.baseline * 100).toFixed(2)

  return (
    <SectionBlock icon="🌡️" title="Why Raw Data Isn't Enough" color="#3b82f6">
      <Neuron
        mood="thinking"
        message="Both pumps read exactly 85°C right now. Should you be worried? It TOTALLY depends on their normal baseline. Let me show you why raw values alone are meaningless!"
        size="small"
      />

      <HindiExplainer
        concept="कच्चे डेटा की सीमाएं"
        english="Raw Data Limitations"
        explanation="सोचो — दो pumps दोनों 85°C पर चल रहे हैं। क्या दोनों ठीक हैं? नहीं! Pump A का normal temperature 80°C है, तो 85°C थोड़ा ही ज़्यादा है। लेकिन Pump B का normal temperature 60°C है — उसके लिए 85°C बहुत ख़तरनाक है! Raw value नहीं, baseline से deviation ही असली feature है।"
        example="जैसे इंसान का बुखार: 99°F किसी को normal हो सकता है, किसी को बुखार। Doctor पूछता है 'आपका normal temperature क्या है?' — वही baseline है!"
        terms={[
          { hindi: 'कच्चा डेटा', english: 'Raw Data', meaning: 'सेंसर से सीधा आया नंबर — बिना संदर्भ के' },
          { hindi: 'आधार रेखा', english: 'Baseline', meaning: 'किसी machine का normal / healthy operating value' },
          { hindi: 'विचलन', english: 'Deviation', meaning: 'baseline से कितना अलग है — यही असली signal है' },
        ]}
      />

      <InteractiveDemo
        title="Same Reading, Different Meaning"
        instruction="Slide the temperature to see how the SAME reading means very different things for two pumps."
      >
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Current Temperature (both pumps)</span>
            <span style={{ color: 'var(--accent)', fontSize: 22, fontWeight: 800 }}>{temp}°C</span>
          </label>
          <input
            type="range" min={55} max={120} value={temp}
            onChange={e => setTemp(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)', height: 6, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            <span>55°C</span><span>120°C</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { label: 'Pump A', baseline: 80, emoji: '🅰️', accent: '#3b82f6' },
            { label: 'Pump B', baseline: 60, emoji: '🅱️', accent: '#8b5cf6' },
          ].map(pump => {
            const dev = ((temp - pump.baseline) / pump.baseline * 100)
            const col = deviationColor(dev)
            return (
              <motion.div
                key={pump.label}
                animate={{ borderColor: col }}
                style={{
                  background: 'var(--bg-card)',
                  border: `2px solid ${col}`,
                  borderRadius: 18,
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 6 }}>{pump.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>{pump.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Baseline: <strong>{pump.baseline}°C</strong>
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 900, color: col,
                  fontFamily: 'var(--font-heading)',
                }}>
                  {dev >= 0 ? '+' : ''}{dev.toFixed(1)}%
                </div>
                <div style={{
                  marginTop: 8, fontSize: 13, fontWeight: 700,
                  color: col,
                  background: `${col}18`,
                  borderRadius: 20, padding: '4px 14px', display: 'inline-block',
                }}>
                  {deviationLabel(dev)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
                  Reading: {temp}°C / Baseline: {pump.baseline}°C
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          key={temp}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 20, padding: '14px 20px',
            background: 'linear-gradient(135deg, #1e1b4b10, #312e8110)',
            border: '1px solid var(--border)',
            borderRadius: 14, fontSize: 15,
            color: 'var(--text-primary)', fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Key Insight: Both pumps show {temp}°C but Pump B deviation ({((temp - 60) / 60 * 100).toFixed(1)}%) is{' '}
          <strong style={{ color: '#ef4444' }}>
            {Math.abs(((temp - 60) / 60 - (temp - 80) / 80) / ((temp - 80) / 80) * 100).toFixed(0)}%
          </strong>{' '}
          higher than Pump A ({((temp - 80) / 80 * 100).toFixed(1)}%). Deviation from baseline is the feature!
        </motion.div>
      </InteractiveDemo>

      <NeuronTip type="tip">
        <strong>Rule #1 of Feature Engineering:</strong> Never feed raw sensor values directly to your ML model. Always compute
        <em> deviation_pct = (current − baseline) / baseline × 100</em>. A pump running 6% above baseline is very different from one running 42% above baseline!
      </NeuronTip>
    </SectionBlock>
  )
}

/* ============================
   SECTION 2: Baseline Deviation Calculator
============================ */
function BaselineDeviationCalc() {
  const sensors = [
    { key: 'vibration', label: 'Vibration', baseline: 2.5, min: 1, max: 15, unit: 'mm/s', emoji: '〰️' },
    { key: 'temperature', label: 'Temperature', baseline: 65, min: 40, max: 120, unit: '°C', emoji: '🌡️' },
    { key: 'pressure', label: 'Pressure', baseline: 105, min: 50, max: 150, unit: 'PSI', emoji: '🔵' },
    { key: 'current', label: 'Current Draw', baseline: 12, min: 5, max: 25, unit: 'A', emoji: '⚡' },
  ]

  const [values, setValues] = useState({
    vibration: 2.5,
    temperature: 65,
    pressure: 105,
    current: 12,
  })

  const updateValue = (key, val) => setValues(prev => ({ ...prev, [key]: val }))

  const deviations = sensors.map(s => ({
    ...s,
    current: values[s.key],
    dev: ((values[s.key] - s.baseline) / s.baseline * 100),
  }))

  const avgRisk = deviations.reduce((acc, d) => acc + Math.abs(d.dev), 0) / deviations.length

  const riskGaugeColor = deviationColor(avgRisk)
  const riskLabel = deviationLabel(avgRisk)

  return (
    <>
    <SectionBlock icon="📐" title="Baseline Deviation Feature Calculator" color="#8b5cf6">
      <Neuron
        mood="explaining"
        message="Move the sliders to simulate current sensor readings. Watch how each deviation is calculated — and how the risk gauge aggregates them all!"
        size="small"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {sensors.map(s => {
          const dev = ((values[s.key] - s.baseline) / s.baseline * 100)
          const col = deviationColor(dev)
          return (
            <motion.div
              key={s.key}
              layout
              style={{
                background: 'var(--bg-card)',
                border: `2px solid ${col}44`,
                borderRadius: 18,
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Baseline: {s.baseline} {s.unit}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: 20, color: col }}>
                    {dev >= 0 ? '+' : ''}{dev.toFixed(1)}%
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: col,
                    background: `${col}18`, borderRadius: 10, padding: '2px 8px',
                  }}>
                    {deviationLabel(dev)}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <span>Current: <strong style={{ color: 'var(--text-primary)' }}>{values[s.key]} {s.unit}</strong></span>
                  <span>{s.min} – {s.max}</span>
                </div>
                <input
                  type="range" min={s.min} max={s.max} step={s.key === 'vibration' ? 0.1 : 1}
                  value={values[s.key]}
                  onChange={e => updateValue(s.key, Number(e.target.value))}
                  style={{ width: '100%', accentColor: col, cursor: 'pointer', height: 5 }}
                />
              </div>

              {/* deviation bar */}
              <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${Math.min(100, Math.abs(dev) * 2)}%`, background: col }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', borderRadius: 3 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Risk Gauge */}
      <motion.div
        animate={{ borderColor: riskGaugeColor }}
        style={{
          background: 'var(--bg-card)',
          border: `2px solid ${riskGaugeColor}`,
          borderRadius: 20,
          padding: '28px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
          Aggregate Risk Gauge
        </div>
        <div style={{ fontWeight: 900, fontSize: 48, color: riskGaugeColor, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
          {avgRisk.toFixed(1)}%
        </div>
        <div style={{
          margin: '10px auto 0', display: 'inline-block', padding: '6px 20px',
          background: `${riskGaugeColor}18`, borderRadius: 20,
          fontSize: 16, fontWeight: 800, color: riskGaugeColor,
        }}>
          {riskLabel} Risk
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: '<10%', desc: 'Normal', color: '#10b981' },
            { label: '10-30%', desc: 'Elevated', color: '#f59e0b' },
            { label: '30-50%', desc: 'Warning', color: '#f97316' },
            { label: '>50%', desc: 'Critical', color: '#ef4444' },
          ].map(z => (
            <div key={z.label} style={{
              padding: '4px 12px', borderRadius: 12,
              background: `${z.color}15`, border: `1px solid ${z.color}44`,
              fontSize: 12, fontWeight: 600, color: z.color,
            }}>
              {z.label} = {z.desc}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          Formula: deviation_pct = (current − baseline) / baseline × 100
        </div>
      </motion.div>

      <NeuronTip type="example">
        <strong>Real-world application:</strong> In a pump monitoring system, the risk gauge aggregates all sensor deviations into a single score fed to the ML model. Even if vibration alone is 8% (normal), combined with temperature at 45% and current at 35%, the aggregate score of ~29% flags this pump for inspection.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="आधार रेखा विचलन — normal से कितना दूर?"
      english="Baseline Deviation Feature"
      explanation="Baseline deviation formula: (current - baseline) / baseline × 100। यह percentage बताता है कि machine अपने normal से कितना दूर है। Vibration 2.5 mm/s baseline से 8.2 mm/s तक गई — यह +228% deviation है! यही वो feature है जो ML model को failure predict करने में मदद करता है।"
      example="Pump की 4 sensors: vibration +38%, temperature +22%, pressure -8%, current +15%। Average risk = 20.75%। ML model यह देखकर बोलेगा — Elevated Risk. सभी sensors थोड़े-थोड़े stressed हैं।"
      terms={[
        { hindi: 'आधार रेखा', english: 'Baseline', meaning: 'machine का healthy/normal operating value' },
        { hindi: 'विचलन', english: 'Deviation', meaning: 'baseline से कितना percent अलग है — यही feature है' },
        { hindi: 'समग्र जोखिम', english: 'Aggregate Risk', meaning: 'सभी sensors के deviations का combined score' },
      ]}
    />
    </>
  )
}

/* ============================
   SECTION 3: MTBF Interactive Timeline
============================ */
function MTBFTimeline() {
  const defaultFailures = [4, 11, 16, 19]
  const [failures, setFailures] = useState(defaultFailures)
  const [newMonth, setNewMonth] = useState('')
  const totalMonths = 36

  const gaps = failures.slice(1).map((f, i) => f - failures[i])
  const mtbf = gaps.length ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : 'N/A'
  const acceleration = gaps.length >= 2
    ? (gaps[gaps.length - 1] < gaps[0] ? 'Accelerating (DANGER!)' : 'Stable / Improving')
    : 'Need more failures'
  const accColor = gaps.length >= 2 && gaps[gaps.length - 1] < gaps[0] ? '#ef4444' : '#10b981'

  const addFailure = () => {
    const m = parseInt(newMonth)
    if (!isNaN(m) && m >= 1 && m <= totalMonths && !failures.includes(m)) {
      setFailures(prev => [...prev, m].sort((a, b) => a - b))
      setNewMonth('')
    }
  }

  const removeFailure = (f) => {
    if (failures.length > 2) setFailures(prev => prev.filter(x => x !== f))
  }

  return (
    <SectionBlock icon="📅" title="Mean Time Between Failures (MTBF)" color="#f59e0b">
      <Neuron
        mood="explaining"
        message="MTBF tells you the AVERAGE time between repairs. But more importantly — IS that average shrinking? Repair acceleration means the machine is degrading fast!"
        size="small"
      />

      <HindiExplainer
        concept="विफलताओं के बीच औसत समय (MTBF)"
        english="Mean Time Between Failures"
        explanation="MTBF बताता है कि machine औसतन कितने time में fail होती है। लेकिन सिर्फ average नहीं देखना — TREND देखो! अगर पहले 7 महीने में fail हुई, फिर 5 में, फिर 3 में — यह 'repair acceleration' है। Machine तेज़ी से टूट रही है!"
        example="जैसे एक पुरानी car: पहले साल में एक बार workshop, दूसरे साल में दो बार, तीसरे साल में चार बार। Gaps कम हो रहे हैं — car अब ज़्यादा बीमार है!"
        terms={[
          { hindi: 'MTBF', english: 'Mean Time Between Failures', meaning: 'failures के बीच का औसत समय' },
          { hindi: 'मरम्मत त्वरण', english: 'Repair Acceleration', meaning: 'जब failures की frequency बढ़ती जाए' },
        ]}
      />

      {/* Timeline */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border)', padding: '28px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Pump Failure History — 3 Year Timeline
        </div>
        <div style={{ position: 'relative', height: 80, marginBottom: 12 }}>
          {/* Timeline bar */}
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0,
            height: 4, background: 'var(--bg-secondary)', borderRadius: 2,
            transform: 'translateY(-50%)',
          }} />
          {/* Gap bars */}
          {gaps.map((gap, i) => {
            const startPct = failures[i] / totalMonths * 100
            const widthPct = gap / totalMonths * 100
            const gapColor = i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : '#ef4444'
            return (
              <div key={i} style={{
                position: 'absolute',
                top: '50%', transform: 'translateY(-50%)',
                left: `${startPct}%`, width: `${widthPct}%`,
                height: 4, background: gapColor, borderRadius: 2, zIndex: 1,
              }}>
                <div style={{
                  position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 11, fontWeight: 700, color: gapColor, whiteSpace: 'nowrap',
                }}>
                  {gap} mo
                </div>
              </div>
            )
          })}
          {/* Failure dots */}
          {failures.map((f, i) => (
            <motion.div
              key={f}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute', top: '50%',
                left: `${f / totalMonths * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 18, height: 18, borderRadius: '50%',
                background: '#ef4444',
                border: '3px solid white',
                boxShadow: '0 0 0 2px #ef4444',
                zIndex: 3, cursor: failures.length > 2 ? 'pointer' : 'default',
              }}
              onClick={() => removeFailure(f)}
              title={failures.length > 2 ? 'Click to remove' : undefined}
            >
              <div style={{
                position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                fontSize: 10, fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap',
              }}>
                M{f}
              </div>
            </motion.div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 28 }}>
          <span>Month 0</span><span>Month 36</span>
        </div>
      </div>

      {/* MTBF Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Failures</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#ef4444' }}>{failures.length}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>MTBF (months)</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>{mtbf}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: `1px solid ${accColor}44`, borderRadius: 16, padding: '18px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Trend</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: accColor, lineHeight: 1.3 }}>{acceleration}</div>
        </div>
      </div>

      {/* Gap sequence */}
      {gaps.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Gap Sequence (months between failures):</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {gaps.map((g, i) => {
              const col = i === 0 ? '#10b981' : i < gaps.length - 1 ? '#f59e0b' : '#ef4444'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${col}18`, border: `2px solid ${col}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14, color: col,
                  }}>{g}</div>
                  {i < gaps.length - 1 && <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>→</span>}
                </div>
              )
            })}
            {gaps.length >= 2 && (
              <span style={{ fontSize: 13, color: accColor, fontWeight: 700, marginLeft: 8 }}>
                {gaps[gaps.length - 1] < gaps[0] ? '↓ MTBF shrinking!' : '↑ MTBF stable'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Add failure */}
      <InteractiveDemo title="Add/Remove Failure Points" instruction="Click a red dot to remove it. Add new failure months (1-36) below.">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="number" min={1} max={36}
            value={newMonth}
            onChange={e => setNewMonth(e.target.value)}
            placeholder="Month (1-36)"
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 12,
              border: '1.5px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', fontSize: 15,
              outline: 'none',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={addFailure}
            style={{
              padding: '10px 22px', borderRadius: 12,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14,
            }}
          >
            Add Failure
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setFailures(defaultFailures)}
            style={{
              padding: '10px 18px', borderRadius: 12,
              background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
              fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14,
            }}
          >
            Reset
          </motion.button>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
          Current failures at months: {failures.join(', ')}
        </div>
      </InteractiveDemo>

      <NeuronTip type="deep">
        <strong>repair_acceleration feature:</strong> Rather than just MTBF, the real ML feature is the SLOPE of gap lengths. If gaps are 7 → 5 → 3 months, the slope is −2 months/failure — a powerful predictor. Machines showing negative acceleration get flagged weeks before they actually fail.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ============================
   SECTION 4: Lifecycle Ratio Gauge
============================ */
function LifecycleRatioGauge() {
  const [age, setAge] = useState(7)
  const [equipment, setEquipment] = useState('pump')

  const EUL_MAP = {
    pump: { label: 'Pump', eul: 10 },
    motor: { label: 'Motor', eul: 8 },
    hvac: { label: 'HVAC Unit', eul: 12 },
    compressor: { label: 'Compressor', eul: 15 },
  }

  const eul = EUL_MAP[equipment].eul
  const ratio = age / eul
  const ratioDisplay = ratio.toFixed(2)

  const zone = ratio <= 0.5
    ? { label: 'New', color: '#10b981', desc: 'Machine is in early life. Failure probability is low.', emoji: '🟢' }
    : ratio <= 0.8
    ? { label: 'Mid-life', color: '#3b82f6', desc: 'Machine in productive mid-life. Monitor trending.', emoji: '🔵' }
    : ratio <= 1.0
    ? { label: 'Mature', color: '#f97316', desc: 'Machine approaching end of useful life. Inspect soon.', emoji: '🟠' }
    : { label: 'Beyond EUL', color: '#ef4444', desc: 'Machine exceeded expected useful life. HIGH RISK.', emoji: '🔴' }

  // Arc gauge calculations
  const gaugeAngle = Math.min(ratio * 180, 200)
  const needleRotate = -90 + Math.min(ratio * 180, 180)

  return (
    <SectionBlock icon="⏳" title="Lifecycle Ratio — How Old Is Your Machine?" color="#f97316">
      <Neuron
        mood="thinking"
        message="A pump at 95% of its expected useful life behaving normally is fine. The same pump with rising vibration AND lifecycle_ratio of 0.95? That's a critical combination. Context matters!"
        size="small"
      />

      <HindiExplainer
        concept="जीवन चक्र अनुपात"
        english="Lifecycle Ratio"
        explanation="lifecycle_ratio = machine की उम्र / expected useful life (EUL). 0 से 0.5 = नई machine, 0.5 से 0.8 = middle age, 0.8 से 1.0 = बुढ़ापा, 1.0 से ऊपर = उम्र पूरी हो गई! लेकिन यह अकेला feature नहीं, इसे vibration और temperature deviation के साथ मिलाकर देखो।"
        example="जैसे इंसान की उम्र: 30 साल में दौड़ना आसान है, 70 साल में मुश्किल। 70 साल के इंसान को chest pain हो — तुरंत serious लो! Machine भी ऐसे ही: old machine में कोई भी warning sign serious है।"
        terms={[
          { hindi: 'जीवन चक्र', english: 'Lifecycle', meaning: 'machine की पैदाइश से मृत्यु तक की यात्रा' },
          { hindi: 'अपेक्षित उपयोगी जीवन', english: 'Expected Useful Life (EUL)', meaning: 'machine कितने साल तक ठीक से काम करे' },
          { hindi: 'जीवन अनुपात', english: 'Lifecycle Ratio', meaning: 'age / EUL — 1.0 मतलब उम्र पूरी' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Controls */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border)', padding: 24 }}>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, display: 'block', marginBottom: 12 }}>
              Equipment Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.entries(EUL_MAP).map(([k, v]) => (
                <motion.button
                  key={k}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setEquipment(k)}
                  style={{
                    padding: '8px 10px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    border: `2px solid ${equipment === k ? 'var(--accent)' : 'var(--border)'}`,
                    background: equipment === k ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: equipment === k ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {v.label} ({v.eul}yr)
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Equipment Age</span>
              <span style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 900 }}>{age} yr</span>
            </label>
            <input
              type="range" min={0} max={15} step={0.5}
              value={age}
              onChange={e => setAge(Number(e.target.value))}
              style={{ width: '100%', accentColor: zone.color, cursor: 'pointer', height: 5 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              <span>0 yr</span><span>15 yr</span>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: '12px 16px', background: `${zone.color}12`, borderRadius: 12, border: `1px solid ${zone.color}33` }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              EUL for {EUL_MAP[equipment].label}: <strong>{eul} years</strong>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, color: zone.color, fontWeight: 700 }}>
              lifecycle_ratio = {age} / {eul} = {ratioDisplay}
            </div>
          </div>
        </div>

        {/* Gauge Visual */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: `2px solid ${zone.color}44`, padding: 24, textAlign: 'center' }}>
          {/* SVG Arc Gauge */}
          <svg width="200" height="120" viewBox="0 0 200 120" style={{ overflow: 'visible', margin: '0 auto', display: 'block' }}>
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none" stroke="var(--border)" strokeWidth="14" strokeLinecap="round"
            />
            {/* Zone arcs */}
            {[
              { start: 0, end: 0.5, color: '#10b981' },
              { start: 0.5, end: 0.8, color: '#3b82f6' },
              { start: 0.8, end: 1.0, color: '#f97316' },
              { start: 1.0, end: 1.25, color: '#ef4444' },
            ].map((z, i) => {
              const totalArc = Math.PI
              const x1 = 100 - 80 * Math.cos(z.start * totalArc)
              const y1 = 100 - 80 * Math.sin(z.start * totalArc)
              const x2 = 100 - 80 * Math.cos(z.end * totalArc)
              const y2 = 100 - 80 * Math.sin(z.end * totalArc)
              const largeArc = (z.end - z.start) > 0.5 ? 1 : 0
              return (
                <path key={i}
                  d={`M ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none" stroke={z.color} strokeWidth="14" strokeLinecap="round" opacity="0.8"
                />
              )
            })}
            {/* Needle */}
            <motion.line
              animate={{ rotate: needleRotate }}
              style={{ transformOrigin: '100px 100px' }}
              x1="100" y1="100" x2="100" y2="30"
              stroke={zone.color} strokeWidth="3" strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill={zone.color} />
            {/* Zone labels */}
            <text x="18" y="120" fontSize="8" fill="#10b981" fontWeight="700">0</text>
            <text x="90" y="16" fontSize="8" fill="#3b82f6" fontWeight="700">0.5</text>
            <text x="160" y="68" fontSize="8" fill="#f97316" fontWeight="700">1.0</text>
            <text x="172" y="110" fontSize="8" fill="#ef4444" fontWeight="700">&gt;1</text>
          </svg>

          <motion.div
            key={zone.label}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ marginTop: 8 }}
          >
            <div style={{ fontSize: 36, fontWeight: 900, color: zone.color, fontFamily: 'var(--font-heading)' }}>
              {ratioDisplay}
            </div>
            <div style={{
              fontSize: 18, fontWeight: 800, color: zone.color,
              background: `${zone.color}18`, borderRadius: 20, padding: '6px 20px', display: 'inline-block', marginTop: 6,
            }}>
              {zone.emoji} {zone.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
              {zone.desc}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Zone legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { range: '0 – 0.5', label: 'New', color: '#10b981', desc: 'Low failure risk' },
          { range: '0.5 – 0.8', label: 'Mid-life', color: '#3b82f6', desc: 'Monitor trends' },
          { range: '0.8 – 1.0', label: 'Mature', color: '#f97316', desc: 'Inspect soon' },
          { range: '> 1.0', label: 'Beyond EUL', color: '#ef4444', desc: 'HIGH RISK' },
        ].map(z => (
          <div key={z.range} style={{
            background: `${z.color}10`, border: `1px solid ${z.color}33`,
            borderRadius: 14, padding: '12px 14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: z.color, marginBottom: 4 }}>{z.range}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{z.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{z.desc}</div>
          </div>
        ))}
      </div>

      <NeuronTip type="warning">
        <strong>Critical combo:</strong> lifecycle_ratio &gt; 0.9 AND vibration_deviation &gt; 30% AND days_since_last_repair &lt; 45 = almost certain failure within 30 days. Individual features are weak; combinations are powerful.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ============================
   SECTION 5: Rolling Statistics & Degradation
============================ */
function RollingStatistics() {
  const [activeOverlays, setActiveOverlays] = useState({ raw: true, mean: true, std: false, max: false, slope: false })
  const canvasRef = useRef(null)

  // Generate synthetic vibration data (180 days)
  const generateData = () => {
    const data = []
    for (let i = 0; i < 180; i++) {
      let base = 2.5
      if (i > 120) base += (i - 120) * 0.04  // degradation starts ~day 120
      if (i > 155) base += (i - 155) * 0.12  // accelerates near failure
      const noise = (Math.random() - 0.5) * 0.6
      const spike = i > 140 && Math.random() > 0.85 ? Math.random() * 2 : 0
      data.push(Math.max(0.5, base + noise + spike))
    }
    return data
  }

  const rawData = useRef(generateData())

  // Rolling mean
  const rollingMean = (data, w) => data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - w + 1), i + 1)
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })

  // Rolling std
  const rollingStd = (data, w) => data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - w + 1), i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length
    return Math.sqrt(variance)
  })

  // Rolling max
  const rollingMax = (data, w) => data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - w + 1), i + 1)
    return Math.max(...slice)
  })

  // Slope of rolling mean (5-day window on mean)
  const rollingSlope = (data, w) => {
    const mean = rollingMean(data, w)
    return mean.map((_, i) => {
      if (i < 5) return 0
      return (mean[i] - mean[i - 5]) / 5
    })
  }

  const W = 7
  const d = rawData.current
  const means = rollingMean(d, W)
  const stds = rollingStd(d, W)
  const maxs = rollingMax(d, W)
  const slopes = rollingSlope(d, W)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    const padL = 50, padR = 20, padT = 20, padB = 30
    const plotW = w - padL - padR
    const plotH = h - padT - padB

    const maxV = Math.max(...d, ...maxs) * 1.1
    const minV = 0

    const toX = i => padL + (i / (d.length - 1)) * plotW
    const toY = v => padT + plotH - ((v - minV) / (maxV - minV)) * plotH

    ctx.clearRect(0, 0, w, h)

    // Background zones
    ctx.fillStyle = 'rgba(239,68,68,0.05)'
    ctx.fillRect(toX(120), padT, toX(179) - toX(120), plotH)

    // Grid
    ctx.strokeStyle = 'rgba(128,128,128,0.15)'
    ctx.lineWidth = 1
    for (let v = 0; v <= maxV; v += 1) {
      ctx.beginPath()
      ctx.moveTo(padL, toY(v))
      ctx.lineTo(padL + plotW, toY(v))
      ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = 'rgba(128,128,128,0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(padL, padT)
    ctx.lineTo(padL, padT + plotH)
    ctx.lineTo(padL + plotW, padT + plotH)
    ctx.stroke()

    // Labels
    ctx.fillStyle = 'rgba(128,128,128,0.8)'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'right'
    for (let v = 0; v <= 8; v += 2) {
      if (v <= maxV) ctx.fillText(v, padL - 4, toY(v) + 3)
    }
    ctx.textAlign = 'center'
    for (let i = 0; i <= 180; i += 30) {
      ctx.fillText(`D${i}`, toX(Math.min(i, 179)), padT + plotH + 16)
    }

    const drawLine = (data, color, width = 2, dash = []) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.setLineDash(dash)
      ctx.beginPath()
      data.forEach((v, i) => {
        if (i === 0) ctx.moveTo(toX(i), toY(v))
        else ctx.lineTo(toX(i), toY(v))
      })
      ctx.stroke()
      ctx.setLineDash([])
    }

    if (activeOverlays.raw) drawLine(d, 'rgba(100,116,139,0.45)', 1, [])
    if (activeOverlays.max) drawLine(maxs, '#f59e0b', 1.5, [6, 3])
    if (activeOverlays.std) {
      // Draw std as a shaded band around mean
      ctx.fillStyle = 'rgba(139,92,246,0.15)'
      ctx.beginPath()
      means.forEach((m, i) => ctx.lineTo(toX(i), toY(m + stds[i])))
      means.slice().reverse().forEach((m, ri) => ctx.lineTo(toX(d.length - 1 - ri), toY(m - stds[d.length - 1 - ri])))
      ctx.closePath()
      ctx.fill()
      drawLine(stds.map((s, i) => means[i] + s), 'rgba(139,92,246,0.6)', 1, [3, 3])
    }
    if (activeOverlays.mean) drawLine(means, '#3b82f6', 2.5, [])
    if (activeOverlays.slope) {
      // Normalize slope to be visible on same scale
      const scaledSlopes = slopes.map(s => 2.5 + s * 20)
      drawLine(scaledSlopes, '#ef4444', 1.5, [4, 2])
    }

    // Failure marker
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 3])
    ctx.beginPath()
    ctx.moveTo(toX(175), padT)
    ctx.lineTo(toX(175), padT + plotH)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 10px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('FAILURE', toX(175), padT + 12)

  }, [activeOverlays])

  const overlayConfig = [
    { key: 'raw', label: 'Raw Data', color: 'rgba(100,116,139,0.7)', desc: 'Noisy sensor signal' },
    { key: 'mean', label: 'Rolling Mean (7d)', color: '#3b82f6', desc: 'Smooth trend — rises before failure' },
    { key: 'std', label: 'Rolling Std Dev', color: '#8b5cf6', desc: 'Volatility — spikes near failure' },
    { key: 'max', label: 'Rolling Max (7d)', color: '#f59e0b', desc: 'Captures spike frequency' },
    { key: 'slope', label: 'Trend Slope', color: '#ef4444', desc: 'Positive = degrading' },
  ]

  const toggleOverlay = key => setActiveOverlays(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <SectionBlock icon="📈" title="Rolling Statistics — Degradation Signals" color="#3b82f6">
      <Neuron
        mood="excited"
        message="Raw vibration data is just noisy. But rolling mean, std deviation, and slope? These tell you a story: the machine is getting worse. Toggle the overlays to see!"
        size="small"
      />

      <HindiExplainer
        concept="चलती सांख्यिकी और गिरावट के संकेत"
        english="Rolling Statistics & Degradation Signals"
        explanation="Rolling statistics हर दिन के लिए calculate होती हैं — उस दिन के आसपास के 7 दिनों का average (rolling mean), variation (rolling std), maximum (rolling max)। Failure के पास: rolling mean बढ़ती है, std dev spike करती है, slope positive हो जाती है। ये सब ML model के लिए powerful features हैं।"
        example="जैसे 7 दिन का मौसम average: आज कितनी धूप थी? नहीं, इस हफ्ते का average देखो — वो ज़्यादा reliable है। Machine की vibration भी ऐसे ही: daily average trends show करता है।"
        terms={[
          { hindi: 'चलती औसत', english: 'Rolling Mean', meaning: 'पिछले N दिनों का average — smooth trend' },
          { hindi: 'चलता मानक विचलन', english: 'Rolling Std Dev', meaning: 'variation कितनी है — failure से पहले बढ़ती है' },
          { hindi: 'प्रवृत्ति ढलान', english: 'Trend Slope', meaning: 'trend कितनी तेज़ी से बढ़ रही है' },
        ]}
      />

      {/* Toggle buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {overlayConfig.map(o => (
          <motion.button
            key={o.key}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => toggleOverlay(o.key)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              border: `2px solid ${activeOverlays[o.key] ? o.color : 'var(--border)'}`,
              background: activeOverlays[o.key] ? `${o.color}20` : 'var(--bg-secondary)',
              color: activeOverlays[o.key] ? o.color : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {activeOverlays[o.key] ? '✓ ' : ''}{o.label}
          </motion.button>
        ))}
      </div>

      {/* Canvas chart */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border)', padding: 16, marginBottom: 18 }}>
        <canvas
          ref={canvasRef}
          width={680}
          height={280}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12, paddingLeft: 4 }}>
          {overlayConfig.filter(o => activeOverlays[o.key]).map(o => (
            <div key={o.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 20, height: 3, background: o.color, borderRadius: 2 }} />
              <span>{o.label}: {o.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature generation summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Day 60 (Healthy)', vib: '2.5', mean: '2.5', std: '0.2', slope: '0.001', risk: 'Normal', color: '#10b981' },
          { label: 'Day 140 (Warning)', vib: '3.8', mean: '3.6', std: '0.6', slope: '0.018', risk: 'Elevated', color: '#f59e0b' },
          { label: 'Day 170 (Critical)', vib: '5.9', mean: '5.4', std: '1.4', slope: '0.041', risk: 'Critical', color: '#ef4444' },
        ].map(row => (
          <div key={row.label} style={{
            background: 'var(--bg-card)', borderRadius: 16,
            border: `2px solid ${row.color}44`, padding: '16px 14px',
          }}>
            <div style={{ fontWeight: 800, color: row.color, fontSize: 13, marginBottom: 10 }}>{row.label}</div>
            {[
              { k: 'Raw vibration', v: row.vib + ' mm/s' },
              { k: 'Rolling mean', v: row.mean + ' mm/s' },
              { k: 'Rolling std', v: row.std },
              { k: 'Slope', v: row.slope },
            ].map(item => (
              <div key={item.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: 'var(--text-secondary)' }}>
                <span>{item.k}:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{item.v}</strong>
              </div>
            ))}
            <div style={{
              marginTop: 8, textAlign: 'center', fontWeight: 700, fontSize: 13,
              color: row.color, background: `${row.color}15`, borderRadius: 8, padding: '4px 0',
            }}>
              {row.risk}
            </div>
          </div>
        ))}
      </div>

      <NeuronTip type="try">
        <strong>Features to create from rolling stats:</strong> vibration_mean_7d, vibration_std_7d, vibration_max_7d, vibration_slope_7d, temp_mean_7d, vibration_mean_30d (longer trend). The 30-day slope captures slow degradation while the 7-day slope catches fast deterioration.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ============================
   SECTION 6: Feature Importance Preview
============================ */
const ALL_FEATURES = [
  { name: 'vibration_deviation_pct', importance: 0.18, why: 'Vibration is the most sensitive indicator of bearing wear, misalignment, and cavitation. Deviation from baseline is more robust than raw value.', type: 'deviation' },
  { name: 'mtbf_days', importance: 0.14, why: 'Historical MTBF directly encodes how reliable this machine has been. Low MTBF = historically problematic = higher future risk.', type: 'mtbf' },
  { name: 'repair_acceleration', importance: 0.12, why: 'The TREND in MTBF (is it shrinking?) is a leading indicator. Accelerating repairs signal approaching catastrophic failure.', type: 'mtbf' },
  { name: 'lifecycle_ratio', importance: 0.11, why: 'Older machines fail more. lifecycle_ratio > 0.9 combined with any deviation creates a critical risk combination.', type: 'lifecycle' },
  { name: 'temp_rolling_mean_7d', importance: 0.09, why: 'Slow temperature rise over 7 days (not just a spike) indicates real thermal stress — bearing friction, lubrication breakdown, or blockage.', type: 'rolling' },
  { name: 'days_since_last_repair', importance: 0.08, why: 'Machines are most vulnerable just after extended operation periods. Combined with lifecycle_ratio, it captures maintenance gap risk.', type: 'maintenance' },
  { name: 'current_deviation_pct', importance: 0.06, why: 'Rising current draw means the motor is working harder — often due to mechanical binding, bearing wear, or process changes.', type: 'deviation' },
  { name: 'pressure_deviation_pct', importance: 0.05, why: 'Pressure deviations indicate blockages, leaks, or impeller wear. Less sensitive than vibration but complements it.', type: 'deviation' },
  { name: 'vibration_slope_7d', importance: 0.045, why: 'The slope of vibration trend catches accelerating degradation early — before absolute value exceeds threshold.', type: 'rolling' },
  { name: 'vibration_std_7d', importance: 0.04, why: 'Increasing variability in vibration (even if mean is OK) signals intermittent faults — early warning of impending failure.', type: 'rolling' },
  { name: 'work_order_count_90d', importance: 0.035, why: 'Number of work orders in the last 90 days captures maintenance burden. Repeated small fixes often precede major failures.', type: 'maintenance' },
  { name: 'temp_slope_7d', importance: 0.03, why: 'Rate of temperature change. Sudden positive slope = active fault developing (overload, cooling failure).', type: 'rolling' },
  { name: 'equipment_age_years', importance: 0.025, why: 'Raw age is weaker than lifecycle_ratio (no EUL context) but still correlates with failure probability.', type: 'lifecycle' },
  { name: 'vibration_max_7d', importance: 0.02, why: 'Maximum vibration spike in last 7 days captures intermittent impact events (loose components, impeller strikes).', type: 'rolling' },
  { name: 'season_heat_flag', importance: 0.015, why: 'Summer months increase thermal stress on motors and bearings. Simple binary flag captures seasonal risk.', type: 'context' },
]

const TYPE_COLORS = {
  deviation: '#3b82f6',
  mtbf: '#ef4444',
  lifecycle: '#f97316',
  rolling: '#8b5cf6',
  maintenance: '#f59e0b',
  context: '#10b981',
}

function FeatureImportance() {
  const [selected, setSelected] = useState(null)
  const [active, setActive] = useState(ALL_FEATURES.map(f => f.name))

  const toggleFeature = (name) => {
    setActive(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name])
  }

  const activeFeatures = ALL_FEATURES.filter(f => active.includes(f.name))
  const totalImportance = activeFeatures.reduce((a, b) => a + b.importance, 0)
  const mockAUC = Math.min(0.98, 0.62 + totalImportance * 0.6).toFixed(3)

  return (
    <>
    <SectionBlock icon="🏆" title="Feature Importance — What Actually Predicts Failure?" color="#ef4444">
      <Neuron
        mood="excited"
        message="After training a Random Forest on real pump data, these features ranked highest. Vibration deviation and MTBF together account for 32% of the model's predictive power!"
        size="small"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Feature bars */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Click bars to select · Toggle checkboxes to see AUC impact
          </div>
          {ALL_FEATURES.map((f, i) => (
            <motion.div
              key={f.name}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: active.includes(f.name) ? 1 : 0.35, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}
              onClick={() => setSelected(selected === f.name ? null : f.name)}
            >
              <input
                type="checkbox"
                checked={active.includes(f.name)}
                onChange={() => toggleFeature(f.name)}
                onClick={e => e.stopPropagation()}
                style={{ accentColor: TYPE_COLORS[f.type], cursor: 'pointer', width: 14, height: 14 }}
              />
              <div style={{ width: 170, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.name}
              </div>
              <div style={{ flex: 1, height: 22, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                <motion.div
                  animate={{ width: `${(f.importance / 0.18) * 100}%` }}
                  style={{
                    height: '100%', borderRadius: 4,
                    background: selected === f.name
                      ? `linear-gradient(90deg, ${TYPE_COLORS[f.type]}, ${TYPE_COLORS[f.type]}cc)`
                      : `${TYPE_COLORS[f.type]}88`,
                  }}
                />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TYPE_COLORS[f.type], width: 38, textAlign: 'right' }}>
                {(f.importance * 100).toFixed(1)}%
              </div>
            </motion.div>
          ))}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                {type}
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ position: 'sticky', top: 20 }}>
          {/* AUC meter */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border)', padding: 24, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
              Model AUC-ROC
            </div>
            <motion.div
              key={mockAUC}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: 44, fontWeight: 900,
                color: parseFloat(mockAUC) > 0.9 ? '#10b981' : parseFloat(mockAUC) > 0.8 ? '#f59e0b' : '#ef4444',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {mockAUC}
            </motion.div>
            <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${parseFloat(mockAUC) * 100}%` }}
                style={{
                  height: '100%', borderRadius: 4,
                  background: parseFloat(mockAUC) > 0.9 ? '#10b981' : '#f59e0b',
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
              {active.length} of {ALL_FEATURES.length} features active
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              Toggle features to see AUC change
            </div>
          </div>

          {/* Feature detail */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  background: 'var(--bg-card)', borderRadius: 18,
                  border: `2px solid ${TYPE_COLORS[ALL_FEATURES.find(f => f.name === selected)?.type]}44`,
                  padding: 20,
                }}
              >
                {(() => {
                  const feat = ALL_FEATURES.find(f => f.name === selected)
                  return feat ? (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 13, color: TYPE_COLORS[feat.type], marginBottom: 6, fontFamily: 'monospace' }}>
                        {feat.name}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 10 }}>
                        {(feat.importance * 100).toFixed(1)}% importance
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        {feat.why}
                      </div>
                      <div style={{
                        marginTop: 12, padding: '6px 12px',
                        background: `${TYPE_COLORS[feat.type]}15`, borderRadius: 10,
                        fontSize: 12, fontWeight: 700, color: TYPE_COLORS[feat.type], display: 'inline-block',
                      }}>
                        Type: {feat.type}
                      </div>
                    </>
                  ) : null
                })()}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'var(--bg-secondary)', borderRadius: 18,
                  border: '1px dashed var(--border)', padding: 24,
                  textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13,
                }}
              >
                Click any feature bar to see why it's predictive
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <NeuronTip type="deep">
        <strong>Feature selection strategy:</strong> Don't just use top features from one model. Run feature importance on Random Forest, XGBoost, AND use correlation analysis. Features that rank high across ALL methods are the most reliable. Vibration deviation and MTBF consistently dominate because they encode both real-time state AND historical pattern.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="विशेषता महत्व — doctor को BP important है, height नहीं"
      english="Feature Importance"
      explanation="Feature importance बताता है कि ML model को कौनसे features सबसे useful लगे। जैसे doctor heart patient के लिए BP और cholesterol देखता है, height नहीं — उसी तरह PdM model vibration_deviation और MTBF को सबसे important मानता है। Unimportant features को हटाने से model faster और more accurate बनता है।"
      example="15 features में से: vibration_deviation_pct = 18% importance, mtbf_days = 14%, lifecycle_ratio = 11%। इन तीन features का combined importance = 43%! बाकी 12 features सिर्फ 57% contribute करती हैं। Top 5 features से ही बहुत अच्छा model बन सकता है।"
      terms={[
        { hindi: 'विशेषता महत्व', english: 'Feature Importance', meaning: 'हर feature कितना prediction में contribute करता है' },
        { hindi: 'AUC-ROC', english: 'AUC-ROC Score', meaning: 'model की overall quality — 0.5 random, 1.0 perfect' },
        { hindi: 'विशेषता चयन', english: 'Feature Selection', meaning: 'सबसे useful features को रखना, बाकी हटाना' },
      ]}
    />
    </>
  )
}

/* ============================
   SECTION 7: Hindi Summary
============================ */
function HindiSummary() {
  return (
    <SectionBlock icon="🇮🇳" title="Feature Engineering — Hindi Summary" color="#ff9933">
      <Neuron
        mood="waving"
        message="Feature Engineering सीख लिया? यह पूरे PdM pipeline का सबसे creative हिस्सा है — raw numbers को meaningful signals में बदलना। अब ML model के पास actually काम करने के लिए powerful features हैं!"
        size="small"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {[
          {
            title: 'Feature Engineering क्या है?',
            content: 'Raw sensor data (जैसे temperature, vibration) को ML model के लिए meaningful signals में बदलना। Raw value नहीं — deviation, trends, और patterns निकालना।',
            icon: '🛠️', color: '#8b5cf6',
          },
          {
            title: 'MTBF और Repair Acceleration',
            content: 'MTBF = failures के बीच average time। अगर यह कम हो रहा है तो repair acceleration है — machine तेज़ी से टूट रही है। यह trend सबसे powerful feature है।',
            icon: '📅', color: '#ef4444',
          },
          {
            title: 'Baseline Deviation',
            content: 'Raw value नहीं, baseline से कितना अलग है — यही feature है। 85°C pump A के लिए normal है, pump B के लिए dangerous। हमेशा context देखो।',
            icon: '📐', color: '#3b82f6',
          },
          {
            title: 'Rolling Statistics',
            content: 'Rolling mean = smooth trend। Rolling std = variability। Rolling slope = rate of change। Failure के पहले mean बढ़ती है, std spike करती है, slope positive होती है।',
            icon: '📈', color: '#10b981',
          },
        ].map(card => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'var(--bg-card)', borderRadius: 18,
              border: `2px solid ${card.color}33`, padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${card.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{card.icon}</div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>{card.title}</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{card.content}</div>
          </motion.div>
        ))}
      </div>

      <HindiExplainer
        concept="Feature Engineering — विशेषता निर्माण"
        english="Feature Engineering for Predictive Maintenance"
        explanation="Feature Engineering का मतलब है — raw sensor readings को ML model के लिए useful signals में convert करना। Raw temperature 85°C बेकार है, लेकिन vibration_deviation_pct = 42% बहुत meaningful है। हम कई types के features बनाते हैं: (1) Deviation features — baseline से अंतर, (2) MTBF features — failure history, (3) Lifecycle features — machine की उम्र, (4) Rolling statistics — trends और patterns।"
        example="एक pump सोचो: raw data में सिर्फ temperature=88°C दिखता है। Feature engineering के बाद: vibration_deviation=38%, mtbf_days=45 (घटकर 30 हो गई), lifecycle_ratio=0.92, vibration_slope_7d=0.035। ML model अब confidently कह सकता है: '89% chance of failure in 10 days — schedule maintenance NOW!'"
        terms={[
          { hindi: 'विशेषता निर्माण', english: 'Feature Engineering', meaning: 'raw data से meaningful signals बनाना' },
          { hindi: 'MTBF', english: 'Mean Time Between Failures', meaning: 'विफलताओं के बीच औसत समय' },
          { hindi: 'आधार रेखा', english: 'Baseline', meaning: 'machine का normal/healthy operating value' },
          { hindi: 'विचलन', english: 'Deviation', meaning: 'baseline से कितना अलग है — percentage में' },
          { hindi: 'जीवन चक्र', english: 'Lifecycle', meaning: 'machine की पैदाइश से useful life तक की यात्रा' },
          { hindi: 'गिरावट', english: 'Degradation', meaning: 'धीरे-धीरे खराब होना — failure से पहले का process' },
          { hindi: 'चलती सांख्यिकी', english: 'Rolling Statistics', meaning: 'moving window में calculate होने वाले mean, std, slope' },
        ]}
      />

      <div style={{
        marginTop: 24, padding: '20px 24px',
        background: 'linear-gradient(135deg, #6366f108, #8b5cf608)',
        border: '1px solid var(--border)', borderRadius: 18,
      }}>
        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 16, marginBottom: 12 }}>
          Feature Engineering Pipeline — Summary
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { step: '1', label: 'Baseline Deviation', formula: 'deviation_pct = (current - baseline) / baseline × 100', color: '#3b82f6' },
            { step: '2', label: 'MTBF & Acceleration', formula: 'mtbf = avg(gaps_between_failures), slope = Δgap/failure', color: '#ef4444' },
            { step: '3', label: 'Lifecycle Ratio', formula: 'lifecycle_ratio = equipment_age / expected_useful_life', color: '#f97316' },
            { step: '4', label: 'Rolling Statistics', formula: 'rolling_mean_7d, rolling_std_7d, rolling_max_7d, slope_7d', color: '#8b5cf6' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${item.color}20`, border: `2px solid ${item.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, color: item.color, flexShrink: 0,
              }}>{item.step}</div>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{item.label}: </span>
                <code style={{ fontSize: 12, color: item.color, background: `${item.color}10`, padding: '2px 6px', borderRadius: 4 }}>{item.formula}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionBlock>
  )
}

/* ============================
   MAIN EXPORT
============================ */
export default function Topic7Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 64px 0' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #6366f115, #8b5cf615)',
          border: '1px solid var(--border)',
          borderRadius: 24, padding: '40px 44px', marginBottom: 36,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>🛠️</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              Topic 7 — PdM Course
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Feature Engineering
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
          Your data is clean. But raw sensor readings alone are weak predictors. A temperature of 85°C means nothing without
          context — is the baseline 80°C (slightly elevated) or 60°C (dangerously hot)? Feature engineering creates
          <strong style={{ color: 'var(--text-primary)' }}> meaningful signals</strong> from raw data:
          deviation from baseline, MTBF, repair acceleration, lifecycle ratio, and rolling statistics.
          These engineered features are what make ML models actually work.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          {[
            { label: 'Baseline Deviation', color: '#3b82f6' },
            { label: 'MTBF & Acceleration', color: '#ef4444' },
            { label: 'Lifecycle Ratio', color: '#f97316' },
            { label: 'Rolling Statistics', color: '#8b5cf6' },
            { label: 'Feature Importance', color: '#10b981' },
          ].map(tag => (
            <span key={tag.label} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}33`,
            }}>
              {tag.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Story link */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderLeft: '4px solid #8b5cf6', borderRadius: 16, padding: '18px 22px', marginBottom: 36,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📖</span> Continuing the story...
        </div>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.75 }}>
          In Topic 6 you cleaned your data — gaps filled, outliers handled, formats standardized. Now the data is ready, but
          it's still just raw numbers from sensors. The ML model sees "85°C" and doesn't know if that's a crisis or completely
          normal. Feature engineering is where you transform raw data into <em>knowledge</em> — signals that carry context,
          history, and meaning. After this topic, your data will actually speak the language of failure prediction.
        </p>
      </motion.div>

      {/* Neuron intro */}
      <div style={{ marginBottom: 32 }}>
        <Neuron
          mood="excited"
          message="Welcome to Feature Engineering — the most creative part of PdM! Think of it like this: a doctor doesn't just look at your temperature number. They compare it to YOUR normal, look at how fast it rose, how old you are, and your recent medical history. That's exactly what we're doing with machines. Let's build features that PREDICT!"
          size="medium"
          typed
        />
      </div>

      {/* Sections */}
      <RawDataInsight />
      <BaselineDeviationCalc />
      <MTBFTimeline />
      <LifecycleRatioGauge />
      <RollingStatistics />
      <FeatureImportance />
      <HindiSummary />

      {/* Closing Neuron */}
      <div style={{ marginTop: 12 }}>
        <Neuron
          mood="happy"
          message="You now know how to engineer features that actually predict failure! Baseline deviation, MTBF, repair acceleration, lifecycle ratio, rolling statistics — these are the REAL signals. In the next topic, we'll feed these features into classification models to answer: 'Will this machine fail in the next 30 days?' Get ready!"
          size="medium"
        />
      </div>
    </div>
  )
}
