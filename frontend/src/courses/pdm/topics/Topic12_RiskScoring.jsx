import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

// ─── helpers ────────────────────────────────────────────────────────────────

function getRiskTier(prob, thresholds) {
  if (prob >= thresholds.critical) return 'CRITICAL'
  if (prob >= thresholds.high)     return 'HIGH'
  if (prob >= thresholds.medium)   return 'MEDIUM'
  return 'LOW'
}

const TIER_META = {
  CRITICAL: { color: '#ef4444', bg: '#fef2f2', label: 'CRITICAL', action: 'Immediate intervention — within 24 h' },
  HIGH:     { color: '#f97316', bg: '#fff7ed', label: 'HIGH',     action: 'Schedule within 7 days' },
  MEDIUM:   { color: '#eab308', bg: '#fefce8', label: 'MEDIUM',   action: 'Monitor — next maintenance window' },
  LOW:      { color: '#22c55e', bg: '#f0fdf4', label: 'LOW',      action: 'Routine maintenance schedule' },
}

// ─── Section 1 ──────────────────────────────────────────────────────────────

const S1_EQUIPMENT = [
  { id: 'A', name: 'Pump A',       prob: 87, correct: 'immediate' },
  { id: 'B', name: 'Motor B',      prob: 62, correct: 'schedule'  },
  { id: 'C', name: 'Compressor C', prob: 38, correct: 'monitor'   },
  { id: 'D', name: 'Fan D',        prob: 12, correct: 'routine'   },
]

const S1_OPTIONS = [
  { value: 'immediate', label: '🚨 Immediate shutdown & fix' },
  { value: 'schedule',  label: '📅 Schedule within a week'   },
  { value: 'monitor',   label: '👁️ Monitor closely'           },
  { value: 'routine',   label: '🔧 Routine maintenance'       },
]

const S1_CORRECT_META = {
  immediate: { tier: 'CRITICAL', color: '#ef4444' },
  schedule:  { tier: 'HIGH',     color: '#f97316' },
  monitor:   { tier: 'MEDIUM',   color: '#eab308' },
  routine:   { tier: 'LOW',      color: '#22c55e' },
}

function Section1() {
  const [selections, setSelections] = useState({ A: '', B: '', C: '', D: '' })
  const [submitted, setSubmitted]   = useState(false)

  const allFilled = Object.values(selections).every(Boolean)

  const score = submitted
    ? S1_EQUIPMENT.filter(e => selections[e.id] === e.correct).length
    : null

  return (
    <SectionBlock icon="🎯" title="Section 1 — From Probability to Action" color="var(--accent)">
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        A probability is useless to a maintenance worker — they need <strong>ACTIONS</strong>.
        Decide what to do for each piece of equipment, then see how risk-tier mapping
        translates numbers into decisions.
      </p>

      <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        {S1_EQUIPMENT.map(eq => {
          const sel  = selections[eq.id]
          const isRight = submitted && sel === eq.correct
          const isWrong = submitted && sel !== eq.correct
          const meta = submitted ? S1_CORRECT_META[eq.correct] : null

          return (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--bg-card)',
                border: `2px solid ${submitted ? (isRight ? '#22c55e' : '#ef4444') : 'var(--border)'}`,
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              {/* probability gauge */}
              <div style={{ minWidth: 80, textAlign: 'center' }}>
                <div style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: eq.prob >= 80 ? '#ef4444' : eq.prob >= 60 ? '#f97316' : eq.prob >= 35 ? '#eab308' : '#22c55e',
                }}>
                  {eq.prob}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>failure prob.</div>
              </div>

              {/* name */}
              <div style={{ flex: 1, fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                {eq.name}
              </div>

              {/* dropdown */}
              <select
                disabled={submitted}
                value={sel}
                onChange={e => setSelections(p => ({ ...p, [eq.id]: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  cursor: submitted ? 'default' : 'pointer',
                }}
              >
                <option value="">Select action…</option>
                {S1_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* result badge */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: meta.color + '22',
                      color: meta.color,
                      fontSize: 12,
                      fontWeight: 700,
                      border: `1px solid ${meta.color}`,
                    }}
                  >
                    {isRight ? '✓ ' : '✗ '}{meta.tier}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {!submitted ? (
        <button
          disabled={!allFilled}
          onClick={() => setSubmitted(true)}
          style={{
            padding: '10px 28px',
            borderRadius: 10,
            border: 'none',
            background: allFilled ? 'var(--accent)' : 'var(--border)',
            color: allFilled ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: 14,
            cursor: allFilled ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
        >
          Check My Decisions
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px',
            background: score === 4 ? '#f0fdf4' : score >= 2 ? '#fff7ed' : '#fef2f2',
            border: `1.5px solid ${score === 4 ? '#22c55e' : score >= 2 ? '#f97316' : '#ef4444'}`,
            borderRadius: 12,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: score === 4 ? '#22c55e' : score >= 2 ? '#f97316' : '#ef4444' }}>
            {score}/4
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            {score === 4 ? 'Perfect! You understand risk-tier mapping.' :
             score >= 2 ? 'Good try! Review the threshold rules below.' :
             'Keep studying — the tier boundaries are defined in Section 2.'}
          </div>
          <button
            onClick={() => { setSelections({ A:'', B:'', C:'', D:'' }); setSubmitted(false) }}
            style={{
              marginTop: 12,
              padding: '7px 20px',
              borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </motion.div>
      )}

      <NeuronTip type="insight">
        Risk tiers translate raw ML probabilities into language that operations teams actually act on.
        The mapping rules are business decisions, not just statistical ones.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─── Section 2 ──────────────────────────────────────────────────────────────

const S2_EQUIPMENT_LIST = [
  { name: 'Pump A',        prob: 87 },
  { name: 'Motor B',       prob: 62 },
  { name: 'Compressor C',  prob: 38 },
  { name: 'Fan D',         prob: 12 },
  { name: 'Gearbox E',     prob: 91 },
  { name: 'Valve F',       prob: 54 },
  { name: 'Bearing G',     prob: 73 },
  { name: 'Turbine H',     prob: 29 },
  { name: 'Conveyor I',    prob: 45 },
  { name: 'Boiler J',      prob: 83 },
]

function TierBar({ label, color, count, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 90, fontSize: 12, fontWeight: 700, color }}>{label}</div>
      <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 6, height: 20, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${(count / total) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{ height: '100%', background: color, borderRadius: 6 }}
        />
      </div>
      <div style={{ width: 30, textAlign: 'right', fontWeight: 700, fontSize: 14, color }}>
        {count}
      </div>
    </div>
  )
}

function Section2() {
  const [thresholds, setThresholds] = useState({ critical: 80, high: 60, medium: 35 })

  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  S2_EQUIPMENT_LIST.forEach(eq => counts[getRiskTier(eq.prob, thresholds)]++)

  const tierOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

  return (
    <SectionBlock icon="📊" title="Section 2 — Four-Tier Risk System" color="#f97316">
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        Drag the sliders to adjust tier boundaries and watch equipment redistribute in real time.
      </p>

      {/* Pyramid tiers */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        {[
          { tier: 'CRITICAL', width: '40%', label: `CRITICAL  ≥ ${thresholds.critical}%`,  sub: 'Immediate — 24 h' },
          { tier: 'HIGH',     width: '60%', label: `HIGH  ${thresholds.high}–${thresholds.critical}%`,    sub: 'Within 7 days'   },
          { tier: 'MEDIUM',   width: '80%', label: `MEDIUM  ${thresholds.medium}–${thresholds.high}%`,  sub: 'Next window'     },
          { tier: 'LOW',      width: '100%',label: `LOW  < ${thresholds.medium}%`,           sub: 'Routine'         },
        ].map(({ tier, width, label, sub }) => {
          const meta = TIER_META[tier]
          return (
            <motion.div
              key={tier}
              animate={{ width }}
              style={{
                background: meta.color + '22',
                border: `2px solid ${meta.color}`,
                borderRadius: 10,
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width,
                transition: 'width 0.3s',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13, color: meta.color }}>{label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</span>
              <motion.span
                key={counts[tier]}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                style={{
                  background: meta.color,
                  color: '#fff',
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {counts[tier]}
              </motion.span>
            </motion.div>
          )
        })}
      </div>

      {/* Distribution bars */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Equipment Distribution ({S2_EQUIPMENT_LIST.length} total)
        </div>
        {tierOrder.map(t => (
          <TierBar key={t} label={t} color={TIER_META[t].color} count={counts[t]} total={S2_EQUIPMENT_LIST.length} />
        ))}
      </div>

      {/* Threshold sliders */}
      <InteractiveDemo title="Adjust Tier Boundaries" instruction="Move the sliders to redefine when each tier starts.">
        <div style={{ display: 'grid', gap: 16 }}>
          {[
            { key: 'critical', label: 'Critical threshold', color: '#ef4444', min: 60, max: 95 },
            { key: 'high',     label: 'High threshold',     color: '#f97316', min: 30, max: 75 },
            { key: 'medium',   label: 'Medium threshold',   color: '#eab308', min: 10, max: 55 },
          ].map(({ key, label, color, min, max }) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color }}>{thresholds[key]}%</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={thresholds[key]}
                onChange={e => {
                  const val = Number(e.target.value)
                  setThresholds(prev => {
                    const next = { ...prev, [key]: val }
                    // enforce ordering
                    if (key === 'critical' && val <= prev.high)    next.high = val - 5
                    if (key === 'high'     && val >= prev.critical) next.critical = val + 5
                    if (key === 'high'     && val <= prev.medium)   next.medium = val - 5
                    if (key === 'medium'   && val >= prev.high)     next.high = val + 5
                    return next
                  })
                }}
                style={{ width: '100%', accentColor: color }}
              />
            </div>
          ))}
        </div>
      </InteractiveDemo>

      <NeuronTip type="warning">
        Threshold choices are business decisions. A hospital might set Critical at 70%; a power plant at 90%.
        Context determines the right boundary.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─── Section 3 ──────────────────────────────────────────────────────────────

const COST_FALSE_ALARM  = 25000   // ₹
const COST_MISSED_FAIL  = 500000  // ₹
const S3_TRUE_FAILURE_RATE = 0.15 // 15% of equipment actually fails

function calcExpectedCost(threshold) {
  // threshold: 0–100
  // false_alarm_rate = P(alarm | no failure) ≈ (1 - threshold/100)
  const falseAlarmRate = 1 - threshold / 100
  // miss_rate = P(no alarm | failure) ≈ threshold/100
  const missRate = threshold / 100
  const pNoFail = 1 - S3_TRUE_FAILURE_RATE
  const pFail   = S3_TRUE_FAILURE_RATE

  const costFA   = falseAlarmRate * pNoFail * COST_FALSE_ALARM
  const costMiss = missRate       * pFail   * COST_MISSED_FAIL
  return { costFA, costMiss, total: costFA + costMiss }
}

function Section3() {
  const [threshold, setThreshold] = useState(50)

  const points = Array.from({ length: 101 }, (_, i) => calcExpectedCost(i))
  const minIdx = points.reduce((best, p, i) => p.total < points[best].total ? i : best, 0)
  const current = points[threshold]
  const maxTotal = Math.max(...points.map(p => p.total))

  const svgW = 340, svgH = 140, padX = 30, padY = 12

  const toX = (i) => padX + (i / 100) * (svgW - padX * 2)
  const toY = (v) => padY + (1 - v / maxTotal) * (svgH - padY * 2)

  const totalPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.total).toFixed(1)}`).join(' ')
  const faPath    = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.costFA).toFixed(1)}`).join(' ')
  const missPath  = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.costMiss).toFixed(1)}`).join(' ')

  const fmt = (n) => '₹' + (n >= 100000 ? (n / 100000).toFixed(1) + 'L' : (n / 1000).toFixed(1) + 'k')

  return (
    <SectionBlock icon="💰" title="Section 3 — Cost-Based Threshold Calibration" color="#eab308">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: 'False Alarm Cost',  value: '₹25,000',   desc: 'Unnecessary visit',     color: '#f97316' },
          { label: 'Missed Failure',    value: '₹5,00,000', desc: 'Unplanned downtime',     color: '#ef4444' },
          { label: 'Risk Ratio',        value: '1 : 20',    desc: 'Missing failure is 20×', color: '#a855f7' },
        ].map(c => (
          <div key={c.label} style={{
            background: 'var(--bg-card)',
            border: `2px solid ${c.color}33`,
            borderRadius: 12,
            padding: '14px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      <InteractiveDemo title="Expected Cost vs Threshold" instruction="Move the threshold slider to find the optimal point on the U-shaped cost curve.">
        <div>
          {/* SVG chart */}
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', marginBottom: 8 }}>
            {/* axes */}
            <line x1={padX} y1={padY} x2={padX} y2={svgH - padY} stroke="var(--border)" strokeWidth="1" />
            <line x1={padX} y1={svgH - padY} x2={svgW - padX} y2={svgH - padY} stroke="var(--border)" strokeWidth="1" />

            {/* cost lines */}
            <path d={faPath}    fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" />
            <path d={missPath}  fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
            <path d={totalPath} fill="none" stroke="#6366f1" strokeWidth="2.5" />

            {/* optimal marker */}
            <line
              x1={toX(minIdx)} y1={padY}
              x2={toX(minIdx)} y2={svgH - padY}
              stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3"
            />
            <circle cx={toX(minIdx)} cy={toY(points[minIdx].total)} r="4" fill="#22c55e" />
            <text x={toX(minIdx) + 5} y={padY + 10} fontSize="9" fill="#22c55e">Optimal {minIdx}%</text>

            {/* current marker */}
            <circle cx={toX(threshold)} cy={toY(current.total)} r="5" fill="#6366f1" />

            {/* axis labels */}
            <text x={padX}        y={svgH - 2} fontSize="8" fill="var(--text-secondary)">0%</text>
            <text x={svgW - padX - 8} y={svgH - 2} fontSize="8" fill="var(--text-secondary)">100%</text>
            <text x={2} y={padY + 4}  fontSize="8" fill="var(--text-secondary)">Cost</text>

            {/* legend */}
            <line x1={svgW - 110} y1={8}  x2={svgW - 95} y2={8}  stroke="#6366f1" strokeWidth="2.5" />
            <text x={svgW - 92} y={11} fontSize="8" fill="#6366f1">Total</text>
            <line x1={svgW - 110} y1={20} x2={svgW - 95} y2={20} stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={svgW - 92} y={23} fontSize="8" fill="#f97316">False Alarms</text>
            <line x1={svgW - 110} y1={32} x2={svgW - 95} y2={32} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={svgW - 92} y={35} fontSize="8" fill="#ef4444">Missed Failures</text>
          </svg>

          {/* slider */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Alert Threshold</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#6366f1' }}>{threshold}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
          </div>

          {/* cost breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'False Alarm Cost', value: fmt(current.costFA),   color: '#f97316' },
              { label: 'Missed Fail Cost', value: fmt(current.costMiss), color: '#ef4444' },
              { label: 'Total Expected',   value: fmt(current.total),    color: '#6366f1' },
            ].map(c => (
              <div key={c.label} style={{
                background: c.color + '11',
                border: `1px solid ${c.color}44`,
                borderRadius: 8,
                padding: '8px 10px',
                textAlign: 'center',
              }}>
                <motion.div
                  key={threshold}
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ fontSize: 16, fontWeight: 800, color: c.color }}
                >
                  {c.value}
                </motion.div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {threshold === minIdx && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 12,
                padding: '10px 14px',
                background: '#f0fdf4',
                border: '1.5px solid #22c55e',
                borderRadius: 8,
                fontSize: 13,
                color: '#15803d',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              You found the optimal threshold! Total cost is minimized here.
            </motion.div>
          )}
        </div>
      </InteractiveDemo>

      <NeuronTip type="insight">
        The optimal threshold isn&apos;t 50% — it depends on the cost ratio.
        When missed failures cost 20× more than false alarms, you should set the alarm threshold
        lower (more sensitive) to catch more failures.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─── Section 4 ──────────────────────────────────────────────────────────────

const S4_TIERS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

const S4_ACTION_BLOCKS = [
  { id: 'sms',       icon: '📱', label: 'SMS',        color: '#ef4444' },
  { id: 'email',     icon: '📧', label: 'Email',      color: '#f97316' },
  { id: 'workorder', icon: '📋', label: 'Work Order', color: '#a855f7' },
  { id: 'dashboard', icon: '🖥️', label: 'Dashboard',  color: '#3b82f6' },
  { id: 'page',      icon: '📟', label: 'Page',       color: '#ec4899' },
  { id: 'log',       icon: '📝', label: 'Log',        color: '#6b7280' },
]

const S4_DEFAULTS = {
  CRITICAL: ['sms', 'workorder', 'page'],
  HIGH:     ['email'],
  MEDIUM:   ['dashboard'],
  LOW:      ['log'],
}

const S4_TEST_ALERTS = [
  { tier: 'CRITICAL', equipment: 'Boiler J',   prob: '91%' },
  { tier: 'HIGH',     equipment: 'Bearing G',  prob: '73%' },
  { tier: 'MEDIUM',   equipment: 'Valve F',    prob: '54%' },
  { tier: 'LOW',      equipment: 'Turbine H',  prob: '29%' },
]

function Section4() {
  const [workflow, setWorkflow] = useState({ ...S4_DEFAULTS })
  const [testing, setTesting]   = useState(false)
  const [testStep, setTestStep] = useState(-1)

  function toggleAction(tier, actionId) {
    setWorkflow(prev => {
      const list = prev[tier]
      return {
        ...prev,
        [tier]: list.includes(actionId) ? list.filter(a => a !== actionId) : [...list, actionId],
      }
    })
  }

  function runTest() {
    setTesting(true)
    setTestStep(0)
    let step = 0
    const interval = setInterval(() => {
      step++
      setTestStep(step)
      if (step >= S4_TEST_ALERTS.length) {
        clearInterval(interval)
        setTimeout(() => { setTesting(false); setTestStep(-1) }, 2000)
      }
    }, 900)
  }

  return (
    <SectionBlock icon="⚡" title="Section 4 — Alert Workflow Builder" color="#a855f7">
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Click action blocks to toggle them on/off for each risk tier, then &ldquo;Test&rdquo; the workflow.
      </p>

      <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
        {S4_TIERS.map(tier => {
          const meta = TIER_META[tier]
          return (
            <div key={tier} style={{
              background: 'var(--bg-card)',
              border: `2px solid ${meta.color}44`,
              borderRadius: 12,
              padding: '12px 16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}>
                <span style={{
                  background: meta.color,
                  color: '#fff',
                  borderRadius: 6,
                  padding: '2px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                }}>
                  {tier}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{meta.action}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {S4_ACTION_BLOCKS.map(ab => {
                  const active = workflow[tier].includes(ab.id)
                  return (
                    <motion.button
                      key={ab.id}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => toggleAction(tier, ab.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: `1.5px solid ${active ? ab.color : 'var(--border)'}`,
                        background: active ? ab.color + '22' : 'var(--bg-secondary)',
                        color: active ? ab.color : 'var(--text-secondary)',
                        fontSize: 12,
                        fontWeight: active ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {ab.icon} {ab.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={runTest}
        disabled={testing}
        style={{
          padding: '10px 28px',
          borderRadius: 10,
          border: 'none',
          background: testing ? 'var(--border)' : '#a855f7',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: 16,
        }}
      >
        {testing ? 'Running Test…' : '▶ Test Workflow'}
      </button>

      <AnimatePresence>
        {testing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gap: 8 }}
          >
            {S4_TEST_ALERTS.map((alert, idx) => {
              if (idx > testStep) return null
              const meta = TIER_META[alert.tier]
              const actions = workflow[alert.tier]
              return (
                <motion.div
                  key={alert.tier}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    background: meta.color + '11',
                    border: `1px solid ${meta.color}44`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontWeight: 700, color: meta.color, fontSize: 13 }}>
                    [{alert.tier}] {alert.equipment} — {alert.prob}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>→</span>
                  {actions.length === 0 ? (
                    <span style={{ fontSize: 12, color: '#ef4444' }}>No actions configured!</span>
                  ) : (
                    actions.map(a => {
                      const ab = S4_ACTION_BLOCKS.find(x => x.id === a)
                      return (
                        <span key={a} style={{
                          fontSize: 11,
                          background: ab.color + '22',
                          color: ab.color,
                          border: `1px solid ${ab.color}55`,
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontWeight: 600,
                        }}>
                          {ab.icon} {ab.label} sent
                        </span>
                      )
                    })
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronTip type="code">
        In production, each action block maps to an API call: PagerDuty for pages, ServiceNow for work orders,
        Twilio for SMS. The risk scoring pipeline triggers these automatically.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─── Section 5 ──────────────────────────────────────────────────────────────

const S5_EQUIPMENT = [
  { id: 1,  name: 'Boiler J',      prob: 83, impact: 900000  },
  { id: 2,  name: 'Pump A',        prob: 87, impact: 300000  },
  { id: 3,  name: 'Turbine H',     prob: 29, impact: 1200000 },
  { id: 4,  name: 'Motor B',       prob: 62, impact: 450000  },
  { id: 5,  name: 'Gearbox E',     prob: 91, impact: 600000  },
  { id: 6,  name: 'Compressor C',  prob: 38, impact: 250000  },
  { id: 7,  name: 'Fan D',         prob: 12, impact: 80000   },
  { id: 8,  name: 'Valve F',       prob: 54, impact: 150000  },
  { id: 9,  name: 'Bearing G',     prob: 73, impact: 350000  },
  { id: 10, name: 'Conveyor I',    prob: 45, impact: 200000  },
  { id: 11, name: 'Pump K',        prob: 20, impact: 500000  },
  { id: 12, name: 'Sensor L',      prob: 68, impact: 50000   },
]

function getMatrixTier(prob, impact) {
  const highProb   = prob   >= 60
  const highImpact = impact >= 400000
  if (highProb && highImpact)   return { label: 'CRITICAL',    color: '#ef4444', rec: 'Immediate action' }
  if (highProb && !highImpact)  return { label: 'HIGH',        color: '#f97316', rec: 'Schedule soon'    }
  if (!highProb && highImpact)  return { label: 'CONTINGENCY', color: '#a855f7', rec: 'Plan backup'      }
  return                               { label: 'ROUTINE',     color: '#22c55e', rec: 'Standard schedule' }
}

function Section5() {
  const [selected, setSelected] = useState(null)

  const W = 320, H = 260, padL = 42, padB = 36, padT = 16, padR = 16
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const toX = (prob)   => padL + (prob   / 100)       * innerW
  const toY = (impact) => H - padB - (impact / 1500000) * innerH

  return (
    <SectionBlock icon="📍" title="Section 5 — Equipment Priority Matrix" color="#6366f1">
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Click any dot to see equipment details and recommended action.
      </p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* SVG Matrix */}
        <svg width={W} height={H} style={{ flexShrink: 0, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
          {/* quadrant fills */}
          <rect x={padL} y={padT} width={innerW / 2} height={innerH / 2} fill="#a855f711" />
          <rect x={padL + innerW / 2} y={padT} width={innerW / 2} height={innerH / 2} fill="#ef444411" />
          <rect x={padL} y={padT + innerH / 2} width={innerW / 2} height={innerH / 2} fill="#22c55e11" />
          <rect x={padL + innerW / 2} y={padT + innerH / 2} width={innerW / 2} height={innerH / 2} fill="#f9731611" />

          {/* quadrant labels */}
          {[
            { x: padL + 8,                    y: padT + 12, text: 'Contingency', color: '#a855f7' },
            { x: padL + innerW / 2 + 8,       y: padT + 12, text: 'CRITICAL',    color: '#ef4444' },
            { x: padL + 8,                    y: H - padB - 8, text: 'Routine', color: '#22c55e' },
            { x: padL + innerW / 2 + 8,       y: H - padB - 8, text: 'High',    color: '#f97316' },
          ].map(q => (
            <text key={q.text} x={q.x} y={q.y} fontSize="9" fontWeight="700" fill={q.color} opacity="0.8">
              {q.text}
            </text>
          ))}

          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--border)" />
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--border)" />
          {/* divider lines */}
          <line x1={padL + innerW / 2} y1={padT} x2={padL + innerW / 2} y2={H - padB} stroke="var(--border)" strokeDasharray="3 3" />
          <line x1={padL} y1={padT + innerH / 2} x2={W - padR} y2={padT + innerH / 2} stroke="var(--border)" strokeDasharray="3 3" />

          {/* axis labels */}
          <text x={W / 2} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--text-secondary)">Failure Probability →</text>
          <text x={8} y={H / 2} fontSize="9" textAnchor="middle" fill="var(--text-secondary)" transform={`rotate(-90, 8, ${H / 2})`}>Business Impact →</text>
          <text x={padL}     y={H - padB + 12} fontSize="8" textAnchor="middle" fill="var(--text-secondary)">0%</text>
          <text x={W - padR} y={H - padB + 12} fontSize="8" textAnchor="middle" fill="var(--text-secondary)">100%</text>

          {/* dots */}
          {S5_EQUIPMENT.map(eq => {
            const tier = getMatrixTier(eq.prob, eq.impact)
            const cx = toX(eq.prob)
            const cy = toY(eq.impact)
            const isSel = selected?.id === eq.id
            const isCrit = tier.label === 'CRITICAL'

            return (
              <g key={eq.id} onClick={() => setSelected(isSel ? null : eq)} style={{ cursor: 'pointer' }}>
                {isCrit && (
                  <motion.circle
                    cx={cx} cy={cy} r="12"
                    fill={tier.color + '33'}
                    animate={{ r: [10, 14, 10] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
                <circle
                  cx={cx} cy={cy} r={isSel ? 8 : 6}
                  fill={tier.color}
                  stroke={isSel ? '#fff' : 'transparent'}
                  strokeWidth="2"
                />
                {isSel && (
                  <text x={cx + 9} y={cy + 4} fontSize="8" fill="var(--text-primary)">{eq.name}</text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Detail panel */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{
                  background: 'var(--bg-card)',
                  border: `2px solid ${getMatrixTier(selected.prob, selected.impact).color}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                {(() => {
                  const tier = getMatrixTier(selected.prob, selected.impact)
                  return (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>
                        {selected.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        Failure Prob: <strong style={{ color: tier.color }}>{selected.prob}%</strong>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        Impact: <strong>₹{(selected.impact / 100000).toFixed(1)}L</strong>
                      </div>
                      <div style={{
                        marginTop: 10,
                        padding: '6px 10px',
                        background: tier.color + '22',
                        border: `1px solid ${tier.color}`,
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: tier.color,
                      }}>
                        {tier.label}: {tier.rec}
                      </div>
                    </>
                  )
                })()}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1.5px dashed var(--border)',
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                }}
              >
                Click a dot on the matrix to see equipment details
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div style={{ marginTop: 12 }}>
            {[
              { color: '#ef4444', label: 'CRITICAL' },
              { color: '#f97316', label: 'HIGH' },
              { color: '#a855f7', label: 'CONTINGENCY' },
              { color: '#22c55e', label: 'ROUTINE' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NeuronTip type="insight">
        A 30% failure probability on a ₹12L machine may need more attention than an 80% probability
        on a ₹50k sensor. Risk = Probability × Impact.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─── Section 6 ──────────────────────────────────────────────────────────────

const S6_ALERTS = [
  { id: 1,  time: '09:41',  tier: 'CRITICAL', equipment: 'Gearbox E',    prob: '91%', rul: '2 days',  action: 'Shutdown scheduled' },
  { id: 2,  time: '09:38',  tier: 'CRITICAL', equipment: 'Boiler J',     prob: '83%', rul: '4 days',  action: 'Engineer notified'  },
  { id: 3,  time: '09:22',  tier: 'HIGH',     equipment: 'Pump A',       prob: '87%', rul: '6 days',  action: 'Work order created' },
  { id: 4,  time: '09:15',  tier: 'HIGH',     equipment: 'Bearing G',    prob: '73%', rul: '9 days',  action: 'Scheduled Fri'      },
  { id: 5,  time: '08:57',  tier: 'HIGH',     equipment: 'Motor B',      prob: '62%', rul: '12 days', action: 'Monitoring'         },
  { id: 6,  time: '08:40',  tier: 'MEDIUM',   equipment: 'Valve F',      prob: '54%', rul: '18 days', action: 'Next window'        },
  { id: 7,  time: '08:33',  tier: 'MEDIUM',   equipment: 'Conveyor I',   prob: '45%', rul: '22 days', action: 'Weekly review'      },
  { id: 8,  time: '08:10',  tier: 'LOW',      equipment: 'Compressor C', prob: '38%', rul: '35 days', action: 'Routine'            },
]

const S6_TABLE = [
  { name: 'Gearbox E',    prob: 91, rul: 2,  tier: 'CRITICAL', action: 'Shutdown now'   },
  { name: 'Pump A',       prob: 87, rul: 6,  tier: 'CRITICAL', action: 'Work order'     },
  { name: 'Boiler J',     prob: 83, rul: 4,  tier: 'CRITICAL', action: 'Engineer alert' },
  { name: 'Bearing G',    prob: 73, rul: 9,  tier: 'HIGH',     action: 'Schedule Fri'   },
  { name: 'Motor B',      prob: 62, rul: 12, tier: 'HIGH',     action: 'Schedule next'  },
  { name: 'Sensor L',     prob: 68, rul: 11, tier: 'HIGH',     action: 'Monitor'        },
  { name: 'Valve F',      prob: 54, rul: 18, tier: 'MEDIUM',   action: 'Next window'    },
  { name: 'Conveyor I',   prob: 45, rul: 22, tier: 'MEDIUM',   action: 'Weekly review'  },
  { name: 'Compressor C', prob: 38, rul: 35, tier: 'MEDIUM',   action: 'Routine'        },
  { name: 'Fan D',        prob: 12, rul: 80, tier: 'LOW',      action: 'Standard'       },
]

function AnimatedCounter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{val}</>
}

function Section6() {
  const [expandedAlert, setExpandedAlert] = useState(null)
  const [sortCol, setSortCol]             = useState('prob')
  const [sortAsc, setSortAsc]             = useState(false)

  const sorted = [...S6_TABLE].sort((a, b) =>
    sortAsc ? a[sortCol] - b[sortCol] : b[sortCol] - a[sortCol]
  )

  function handleSort(col) {
    if (sortCol === col) setSortAsc(p => !p)
    else { setSortCol(col); setSortAsc(false) }
  }

  const kpis = [
    { label: 'Critical', count: 3,  color: '#ef4444' },
    { label: 'High',     count: 8,  color: '#f97316' },
    { label: 'Medium',   count: 15, color: '#eab308' },
    { label: 'Low',      count: 74, color: '#22c55e' },
  ]

  // sparkline mock — 30-day trend (CRITICAL count)
  const trendData = [2,3,2,4,3,3,5,4,4,6,5,4,3,4,3,4,5,4,4,3,5,4,3,4,3,4,3,4,3,3]
  const tW = 280, tH = 60, tPad = 8
  const tMaxV = Math.max(...trendData)
  const tPoints = trendData.map((v, i) =>
    `${tPad + i * ((tW - tPad * 2) / (trendData.length - 1))},${tH - tPad - (v / tMaxV) * (tH - tPad * 2)}`
  ).join(' ')

  return (
    <SectionBlock icon="🖥️" title="Section 6 — Alert Dashboard Mockup" color="#3b82f6">
      <div style={{
        background: '#0f172a',
        borderRadius: 16,
        padding: 20,
        color: '#f1f5f9',
        fontFamily: 'monospace',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#60a5fa' }}>
            Neev PDM — Operations Dashboard
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Live · Refreshed 09:42
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {kpis.map(k => (
            <div key={k.label} style={{
              background: '#1e293b',
              borderRadius: 10,
              padding: '12px 10px',
              textAlign: 'center',
              border: `1px solid ${k.color}44`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: k.color }}>
                <AnimatedCounter target={k.count} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Alert Feed */}
        <div style={{
          background: '#1e293b',
          borderRadius: 10,
          padding: 12,
          marginBottom: 14,
          maxHeight: 220,
          overflowY: 'auto',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 8 }}>
            Recent Alerts
          </div>
          {S6_ALERTS.map(a => {
            const meta = TIER_META[a.tier]
            const isExp = expandedAlert === a.id
            return (
              <div key={a.id}>
                <motion.div
                  onClick={() => setExpandedAlert(isExp ? null : a.id)}
                  whileHover={{ background: '#334155' }}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    borderLeft: `3px solid ${meta.color}`,
                    marginBottom: 3,
                    background: isExp ? '#334155' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 10, color: '#64748b', minWidth: 36 }}>{a.time}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: meta.color,
                    minWidth: 60,
                    background: meta.color + '22',
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}>
                    {a.tier}
                  </span>
                  <span style={{ fontSize: 11, color: '#e2e8f0', flex: 1 }}>{a.equipment}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>{a.prob}</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>›</span>
                </motion.div>
                <AnimatePresence>
                  {isExp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        overflow: 'hidden',
                        background: '#0f172a',
                        borderRadius: 6,
                        padding: '8px 12px',
                        marginBottom: 4,
                        fontSize: 11,
                        color: '#94a3b8',
                      }}
                    >
                      <div>Equipment: <strong style={{ color: '#e2e8f0' }}>{a.equipment}</strong></div>
                      <div>Failure Prob: <strong style={{ color: meta.color }}>{a.prob}</strong></div>
                      <div>RUL: <strong style={{ color: '#e2e8f0' }}>{a.rul}</strong></div>
                      <div>Action: <strong style={{ color: '#60a5fa' }}>{a.action}</strong></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Top 10 Table */}
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 8 }}>
            Top At-Risk Equipment
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {[
                  { col: null,     label: 'Equipment' },
                  { col: 'prob',   label: 'Prob %'    },
                  { col: 'rul',    label: 'RUL (days)' },
                  { col: null,     label: 'Tier'      },
                  { col: null,     label: 'Action'    },
                ].map(({ col, label }) => (
                  <th
                    key={label}
                    onClick={() => col && handleSort(col)}
                    style={{
                      textAlign: 'left',
                      padding: '4px 6px',
                      color: '#64748b',
                      borderBottom: '1px solid #334155',
                      cursor: col ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    {label}
                    {col === sortCol ? (sortAsc ? ' ↑' : ' ↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((eq, idx) => {
                const meta = TIER_META[eq.tier]
                return (
                  <tr key={eq.name} style={{ background: idx % 2 === 0 ? '#0f172a' : 'transparent' }}>
                    <td style={{ padding: '4px 6px', color: '#e2e8f0' }}>{eq.name}</td>
                    <td style={{ padding: '4px 6px', fontWeight: 700, color: meta.color }}>{eq.prob}%</td>
                    <td style={{ padding: '4px 6px', color: '#94a3b8' }}>{eq.rul}</td>
                    <td style={{ padding: '4px 6px' }}>
                      <span style={{
                        background: meta.color + '33',
                        color: meta.color,
                        borderRadius: 4,
                        padding: '1px 6px',
                        fontSize: 10,
                        fontWeight: 700,
                      }}>
                        {eq.tier}
                      </span>
                    </td>
                    <td style={{ padding: '4px 6px', color: '#60a5fa', fontSize: 10 }}>{eq.action}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Trend Sparkline */}
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 8 }}>
            Critical Alerts — Last 30 Days
          </div>
          <svg width="100%" viewBox={`0 0 ${tW} ${tH}`}>
            <polyline
              points={tPoints}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polyline
              points={`${tPad},${tH - tPad} ${tPoints} ${tW - tPad},${tH - tPad}`}
              fill="#ef444422"
              stroke="none"
            />
            {trendData.map((v, i) => {
              const cx = tPad + i * ((tW - tPad * 2) / (trendData.length - 1))
              const cy = tH - tPad - (v / tMaxV) * (tH - tPad * 2)
              return i === trendData.length - 1 ? (
                <circle key={i} cx={cx} cy={cy} r="3" fill="#ef4444" />
              ) : null
            })}
          </svg>
          <div style={{ fontSize: 10, color: '#64748b', textAlign: 'right' }}>Today →</div>
        </div>
      </div>

      <NeuronTip type="insight">
        A real dashboard like this lets a maintenance manager see the entire plant&apos;s health in seconds
        instead of reading through hundreds of sensor logs manually.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─── Section 7 ──────────────────────────────────────────────────────────────

function Section7() {
  return (
    <SectionBlock icon="🇮🇳" title="Section 7 — Hindi Summary" color="#22c55e">
      <HindiExplainer
        concept="Risk Scoring & Alert System"
        english="Converting ML failure probabilities into prioritized maintenance actions through cost-optimized threshold calibration."
        explanation="Machine Learning model ek number deta hai — failure probability. Lekin maintenance worker ko number nahi chahiye, use chahiye ACTION. Risk Scoring isi probability ko ek tier mein convert karta hai (CRITICAL, HIGH, MEDIUM, LOW). Phir har tier ke liye alag alert workflow chal ta hai — SMS, email, work order, ya sirf log. Threshold calibration ensure karti hai ki false alarms aur missed failures ka balance optimal ho."
        example="Pump ka failure probability 87% hai → CRITICAL tier → SMS maintenance lead ko, work order create karo, on-call engineer ko page karo. Yahi hai risk scoring ka practical use."
        terms={[
          { hindi: 'जोखिम स्कोरिंग',  english: 'Risk Scoring',  meaning: 'Failure probability ko actionable tier mein convert karna' },
          { hindi: 'सीमा',             english: 'Threshold',     meaning: 'Woh probability value jahan tier badal ti hai' },
          { hindi: 'चेतावनी',          english: 'Alert',         meaning: 'Notification jab equipment risky zone mein ho' },
          { hindi: 'गंभीर',            english: 'Critical',      meaning: 'Sabse high-risk tier — immediate action needed' },
          { hindi: 'प्राथमिकता',       english: 'Priority',      meaning: 'Konsa equipment pehle fix karna hai' },
          { hindi: 'वृद्धि',           english: 'Escalation',    meaning: 'Alert ko higher authority tak forward karna' },
        ]}
      />
    </SectionBlock>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function Topic12Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: '8px 0 48px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #ef444422 0%, #f9731622 50%, #6366f122 100%)',
          border: '2px solid var(--border)',
          borderRadius: 20,
          padding: '28px 28px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚨</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
          Risk Scoring &amp; Alert System
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 10, fontSize: 15, maxWidth: 560, margin: '10px auto 0' }}>
          ML probabilities are meaningless without action plans. Learn how hospitals triage patients
          by severity — and how maintenance teams do the same with machines.
        </p>
      </motion.div>

      {/* Neuron intro */}
      <Neuron
        mood="excited"
        size="large"
        message="Think of this like an Emergency Room. Doctors don't treat all patients in the order they arrive — they triage by severity. A probability of 91% is like a patient with a cardiac arrest: CRITICAL, immediate action. 12% is like a sprained ankle: routine, wait your turn. Risk scoring is ER triage for machines!"
      />

      <Section1 />
      <HindiExplainer
        concept="संभावना से कार्रवाई तक"
        english="From Probability to Action"
        explanation="ML model एक number देता है — जैसे 87% failure probability। लेकिन maintenance worker को number नहीं, action चाहिए। 87% का मतलब है 'अभी fix करो', 38% का मतलब 'नज़र रखो', 12% का मतलब 'routine check'। यही probability को action में convert करना है।"
        example="Pump A की failure probability 87% है। Manager को सीधे बताओ: 'Pump A को आज बंद करो और bearings replace करो' — '87%' बताने की जगह। यही risk scoring का असली काम है।"
        terms={[
          { hindi: 'विफलता संभावना', english: 'Failure Probability', meaning: 'ML model का output — 0% से 100% तक, machine के खराब होने की chance' },
          { hindi: 'क्रिया', english: 'Action', meaning: 'Probability के आधार पर actual काम — inspect, schedule, monitor, या ignore' },
          { hindi: 'जोखिम स्तर', english: 'Risk Tier', meaning: 'Probability ranges को simple categories में map करना — CRITICAL, HIGH, MEDIUM, LOW' },
        ]}
      />

      <Section2 />
      <HindiExplainer
        concept="चार-स्तरीय जोखिम प्रणाली"
        english="Four-Tier Risk System"
        explanation="Traffic signal की तरह — RED मतलब रुको (CRITICAL, तुरंत fix), ORANGE मतलब सावधान (HIGH, 7 दिन में), YELLOW मतलब slow down (MEDIUM, अगली maintenance window), GREEN मतलब go (LOW, routine schedule). Threshold values business decision हैं — hospital में CRITICAL 70% पर, power plant में 90% पर हो सकता है।"
        example="SteelForge factory में 10 machines: Gearbox E (91%) = CRITICAL — आज shutdown। Bearing G (73%) = HIGH — इस हफ्ते schedule करो। Compressor C (38%) = MEDIUM — अगले PM में देखो। Fan D (12%) = LOW — कोई action नहीं।"
        terms={[
          { hindi: 'सीमा', english: 'Threshold', meaning: 'जहाँ एक tier से दूसरे में jump होता है — जैसे 80% से ऊपर CRITICAL' },
          { hindi: 'पिरामिड', english: 'Pyramid Structure', meaning: 'सबसे कम machines CRITICAL में, सबसे ज़्यादा LOW में — natural distribution' },
          { hindi: 'व्यावसायिक निर्णय', english: 'Business Decision', meaning: 'Thresholds data से नहीं, business risk appetite से तय होती हैं' },
        ]}
      />

      <Section3 />
      <HindiExplainer
        concept="लागत-आधारित थ्रेशोल्ड"
        english="Cost-Based Threshold Calibration"
        explanation="False alarm (गलती से alarm बजाना) और missed failure (real failure miss करना) दोनों costly हैं। False alarm = ₹50K (बेकार engineer visit), Missed failure = ₹50L (machine completely broken)। इसलिए threshold को lower रखो — ज़्यादा false alarms सस्ते हैं बजाय एक missed failure के। Optimal threshold वहाँ है जहाँ total expected cost minimum हो।"
        example="एक factory में 15% machines actually fail करती हैं। 50% threshold पर: false alarm cost ₹4.25L, missed failure cost ₹11.25L — total ₹15.5L। 30% threshold पर: total ₹10.2L। इसीलिए sensitive threshold better है जब failures बहुत expensive हों।"
        terms={[
          { hindi: 'झूठा अलार्म', english: 'False Alarm', meaning: 'Machine healthy है पर system ने alert किया — unnecessary maintenance cost' },
          { hindi: 'छूटी विफलता', english: 'Missed Failure', meaning: 'Machine fail होने वाली थी पर system ने miss किया — unplanned downtime cost' },
          { hindi: 'इष्टतम सीमा', english: 'Optimal Threshold', meaning: 'वो probability cutoff जहाँ total expected cost (FA + missed) minimum हो' },
        ]}
      />

      <Section4 />
      <HindiExplainer
        concept="अलर्ट वर्कफ्लो"
        english="Alert Workflow"
        explanation="Risk tier पता चलने के बाद automated workflow trigger होता है। CRITICAL tier → SMS + page + work order सब एक साथ। HIGH tier → email + work order। MEDIUM tier → dashboard update। LOW tier → log entry only। हर tier के लिए अलग action chain — जैसे hospital में Code Red (cardiac arrest) पर पूरी team दौड़ती है पर minor complaint पर सिर्फ nurse आती है।"
        example="Gearbox E (91% probability) → CRITICAL tier → SMS maintenance lead को, PagerDuty alert on-call engineer को, ServiceNow work order create, dashboard red highlight। सब कुछ automatic — human को सिर्फ physically repair करने जाना है।"
        terms={[
          { hindi: 'कार्य आदेश', english: 'Work Order', meaning: 'Official maintenance task — assigned engineer, estimated time, spare parts list' },
          { hindi: 'स्वचालित', english: 'Automated', meaning: 'Human intervention के बिना automatically होना — ML से alert तक without manual steps' },
          { hindi: 'वृद्धि', english: 'Escalation', meaning: 'Alert को higher authority तक forward करना जब initial response नहीं मिला' },
        ]}
      />

      <Section5 />
      <HindiExplainer
        concept="प्राथमिकता मैट्रिक्स"
        english="Equipment Priority Matrix"
        explanation="Probability alone काफी नहीं — business impact भी देखो। High probability + high impact = CRITICAL (तुरंत fix करो)। High probability + low impact = HIGH (schedule करो)। Low probability + high impact = CONTINGENCY (backup plan बनाओ)। Low probability + low impact = ROUTINE। एक ₹12L की machine का 30% failure chance एक ₹50K sensor के 80% failure chance से ज़्यादा important हो सकता है।"
        example="Turbine H की failure probability सिर्फ 29% है पर business impact ₹1.2 Cr है। Sensor L की probability 68% है पर impact ₹50K है। Priority matrix में Turbine H को CONTINGENCY में रखो — low probability पर high stakes backup plan बनाओ। Sensor L को HIGH में — fix करो पर Turbine से पहले नहीं।"
        terms={[
          { hindi: 'व्यावसायिक प्रभाव', english: 'Business Impact', meaning: 'Machine fail होने पर कितना नुकसान — repair cost + production loss + safety risk' },
          { hindi: 'आकस्मिकता', english: 'Contingency', meaning: 'Low probability but high impact equipment के लिए backup plan — जब fail हो तो ready रहो' },
          { hindi: 'जोखिम = संभावना × प्रभाव', english: 'Risk = Probability × Impact', meaning: 'True priority calculate करने का formula — दोनों को combine करो' },
        ]}
      />

      <Section6 />
      <HindiExplainer
        concept="ऑपरेशन डैशबोर्ड"
        english="Operations Dashboard Design"
        explanation="Dashboard एक plant manager का command center है — जैसे aircraft cockpit। KPI cards बताते हैं कितनी CRITICAL/HIGH/MEDIUM/LOW machines हैं। Alert feed real-time में नई alerts दिखाता है। Equipment table sortable है by probability या RUL। Trend sparkline दिखाता है कि last 30 days में critical alerts बढ़ रहे हैं या घट रहे हैं। सही information, सही format में, सही person को।"
        example="Factory manager subah 9 AM पर dashboard खोलता है। KPI: 3 CRITICAL, 8 HIGH। Alert feed: 'Gearbox E — 91% — Shutdown scheduled'। Table: top 10 at-risk equipment by probability। 30 seconds में पूरे plant की health समझ आ जाती है — बिना किसी sensor log पढ़े।"
        terms={[
          { hindi: 'KPI कार्ड', english: 'KPI Card', meaning: 'Key Performance Indicator — एक number जो overall status बताए, जैसे CRITICAL count' },
          { hindi: 'अलर्ट फीड', english: 'Alert Feed', meaning: 'Real-time scrollable list of new alerts — latest पहले दिखता है' },
          { hindi: 'स्पार्कलाइन', english: 'Sparkline', meaning: 'Compact trend chart — क्या condition improving है या worsening?' },
        ]}
      />

      <Section7 />

      {/* Footer recap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border)',
          borderRadius: 16,
          padding: '20px 24px',
        }}
      >
        <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: 16 }}>
          Topic 12 — Key Takeaways
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
          {[
            'Probabilities need thresholds to become actionable tiers (CRITICAL / HIGH / MEDIUM / LOW).',
            'Optimal thresholds are determined by the false-alarm vs missed-failure cost ratio.',
            'Each tier maps to a different alert workflow — SMS, email, work order, or log.',
            'The priority matrix combines probability AND business impact, not probability alone.',
            'A live dashboard gives operations managers whole-plant visibility in seconds.',
          ].map(point => (
            <li key={point} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{point}</li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
