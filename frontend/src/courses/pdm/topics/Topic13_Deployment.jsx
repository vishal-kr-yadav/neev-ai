import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 13 — Dashboards & Deployment
   From Jupyter notebook to production PdM system
================================================================ */

/* ─── Section 1: The Deployment Gap ─────────────────────────── */
function DeploymentGap() {
  const [crossedPlanks, setCrossedPlanks] = useState([])

  const planks = [
    { id: 1, label: 'Serialize Model', icon: '💾', code: 'joblib.dump(model, "model.pkl")', color: '#6366f1' },
    { id: 2, label: 'Build API Endpoint', icon: '🔌', code: 'FastAPI + /api/predict', color: '#0ea5e9' },
    { id: 3, label: 'Create Dashboard', icon: '📊', code: 'React + Chart.js', color: '#10b981' },
    { id: 4, label: 'Schedule Retraining', icon: '⏰', code: 'cron 0 2 * * 1 python retrain.py', color: '#f59e0b' },
    { id: 5, label: 'Monitor Performance', icon: '📡', code: 'drift_score = ks_2samp(ref, curr)', color: '#ef4444' },
  ]

  const togglePlank = (id) => {
    setCrossedPlanks(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const pct = (crossedPlanks.length / planks.length) * 100

  return (
    <div>
      {/* Gap visual */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, alignItems: 'stretch', minHeight: 160 }}>
          {/* Left: Jupyter */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1e2e, #2d2b55)',
            borderRadius: '16px 0 0 16px',
            padding: 20,
            border: '1.5px solid #6366f133',
          }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: '#6366f1', fontWeight: 700, marginBottom: 10 }}>JUPYTER NOTEBOOK</div>
            {['import pandas as pd', 'model.fit(X_train)', 'accuracy: 0.91', '# runs locally only'].map((line, i) => (
              <div key={i} style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: i === 3 ? '#ef4444aa' : '#a5b4fc',
                marginBottom: 4,
                opacity: i === 3 ? 0.7 : 1,
              }}>{line}</div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Isolated', 'Manual', 'No API', 'No alerts'].map(tag => (
                <span key={tag} style={{
                  background: '#ef444420',
                  color: '#ef4444',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Chasm */}
          <div style={{ width: 80, position: 'relative', overflow: 'hidden' }}>
            <svg width="80" height="160" viewBox="0 0 80 160" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="chasmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e0a0a" />
                </linearGradient>
              </defs>
              <rect width="80" height="160" fill="url(#chasmGrad)" />
              {/* Jagged edges */}
              <path d="M0,0 L8,20 L0,40 L8,60 L0,80 L8,100 L0,120 L8,140 L0,160" fill="#1e1e2e" />
              <path d="M80,0 L72,20 L80,40 L72,60 L80,80 L72,100 L80,120 L72,140 L80,160" fill="#0a1628" />
              {/* Bridge fill */}
              <motion.rect
                x="0" y="70" height="20" rx="2"
                fill="#10b981"
                animate={{ width: `${pct * 0.8}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ opacity: 0.8 }}
              />
              <text x="40" y="88" textAnchor="middle" fill="#ffffff55" fontSize="9" fontWeight="700">GAP</text>
            </svg>
          </div>

          {/* Right: Production */}
          <div style={{
            background: 'linear-gradient(135deg, #0a1628, #0d2137)',
            borderRadius: '0 16px 16px 0',
            padding: 20,
            border: `1.5px solid ${pct === 100 ? '#10b981' : '#0ea5e933'}`,
            transition: 'border-color 0.4s',
          }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: '#10b981', fontWeight: 700, marginBottom: 10 }}>PRODUCTION SYSTEM</div>
            {['POST /api/predict → 52ms', 'Dashboard: 247 assets live', 'Alert fired: Pump #7 critical', 'Retrain scheduled: Mon 2am'].map((line, i) => (
              <div key={i} style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: i === 2 ? '#f59e0b' : '#6ee7b7',
                marginBottom: 4,
              }}>{line}</div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Always-On', 'Automated', 'API', 'Alerts'].map((tag, i) => (
                <span key={tag} style={{
                  background: pct === 100 ? '#10b98120' : '#10b98108',
                  color: pct === 100 ? '#10b981' : '#10b98155',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  transition: 'all 0.4s',
                }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bridge progress */}
        {crossedPlanks.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
              Bridge {Math.round(pct)}% complete
            </span>
          </div>
        )}
      </div>

      {/* Planks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 4, letterSpacing: 1 }}>
          CLICK EACH STEP TO CROSS THE GAP
        </div>
        {planks.map((p, i) => {
          const done = crossedPlanks.includes(p.id)
          return (
            <motion.button
              key={p.id}
              onClick={() => togglePlank(p.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 18px',
                borderRadius: 12,
                background: done ? `${p.color}18` : 'var(--bg-secondary)',
                border: `1.5px solid ${done ? p.color : 'var(--border)'}`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s',
              }}
            >
              <motion.div
                animate={{ scale: done ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: done ? p.color : `${p.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {done ? '✓' : p.icon}
              </motion.div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  Step {p.id}: {p.label}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: done ? p.color : 'var(--text-secondary)', marginTop: 2 }}>
                  {p.code}
                </div>
              </div>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: done ? p.color : 'var(--text-secondary)',
              }}>
                {done ? 'DONE' : 'TODO'}
              </div>
            </motion.button>
          )
        })}
      </div>

      {crossedPlanks.length === planks.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 20,
            padding: '16px 20px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #10b98120, #059669 08)',
            border: '1.5px solid #10b981',
            textAlign: 'center',
            color: '#10b981',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Bridge complete! Your model is now in production.
        </motion.div>
      )}
    </div>
  )
}

/* ─── Section 2: FastAPI Model Serving ───────────────────────── */
function FastAPIDemo() {
  const [activeEndpoint, setActiveEndpoint] = useState('predict')
  const [sensorValues, setSensorValues] = useState({ vibration: 2.4, temperature: 72, pressure: 4.2, current: 18.5 })
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [latency, setLatency] = useState(null)

  const endpoints = [
    { id: 'predict', method: 'POST', path: '/api/predict', color: '#6366f1', desc: 'Accepts sensor readings JSON, returns failure prediction' },
    { id: 'health', method: 'GET', path: '/api/health', color: '#10b981', desc: 'Service health check — returns uptime and model version' },
    { id: 'batch', method: 'GET', path: '/api/predictions', color: '#0ea5e9', desc: 'Batch predictions for all 247 monitored assets' },
  ]

  const sliders = [
    { key: 'vibration', label: 'Vibration (mm/s)', min: 0.5, max: 15, step: 0.1, color: '#6366f1' },
    { key: 'temperature', label: 'Temperature (°C)', min: 40, max: 110, step: 1, color: '#ef4444' },
    { key: 'pressure', label: 'Pressure (bar)', min: 1, max: 10, step: 0.1, color: '#0ea5e9' },
    { key: 'current', label: 'Current (A)', min: 5, max: 40, step: 0.5, color: '#f59e0b' },
  ]

  const getRisk = () => {
    const score = (sensorValues.vibration / 15) * 0.4 +
      ((sensorValues.temperature - 40) / 70) * 0.3 +
      ((sensorValues.current - 5) / 35) * 0.3
    if (score < 0.35) return { tier: 'LOW', color: '#10b981', confidence: Math.round(85 + score * 20) }
    if (score < 0.65) return { tier: 'MEDIUM', color: '#f59e0b', confidence: Math.round(72 + score * 15) }
    return { tier: 'HIGH', color: '#ef4444', confidence: Math.round(88 + (score - 0.65) * 20) }
  }

  const sendRequest = () => {
    setLoading(true)
    setResponse(null)
    const start = Date.now()
    const ms = 38 + Math.floor(Math.random() * 28)
    setTimeout(() => {
      const risk = getRisk()
      setLatency(ms)
      if (activeEndpoint === 'predict') {
        setResponse({
          asset_id: 'PUMP-042',
          prediction: risk.tier === 'HIGH' ? 1 : 0,
          probability_failure: parseFloat((risk.tier === 'HIGH' ? 0.7 + Math.random() * 0.25 : risk.tier === 'MEDIUM' ? 0.35 + Math.random() * 0.3 : Math.random() * 0.3).toFixed(3)),
          risk_tier: risk.tier,
          confidence: risk.confidence / 100,
          recommended_action: risk.tier === 'HIGH' ? 'Schedule immediate inspection' : risk.tier === 'MEDIUM' ? 'Monitor closely — inspect within 7 days' : 'No action required',
          model_version: '2.4.1',
          inference_ms: ms,
        })
      } else if (activeEndpoint === 'health') {
        setResponse({ status: 'healthy', uptime_hours: 2847, model_version: '2.4.1', predictions_served: 1284932, avg_latency_ms: 47 })
      } else {
        setResponse({ total_assets: 247, high_risk: 3, medium_risk: 18, low_risk: 226, generated_at: new Date().toISOString(), next_refresh: '5 min' })
      }
      setLoading(false)
    }, ms + 200)
  }

  const risk = getRisk()

  return (
    <div>
      {/* Endpoint tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {endpoints.map(ep => (
          <button
            key={ep.id}
            onClick={() => { setActiveEndpoint(ep.id); setResponse(null) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 10,
              background: activeEndpoint === ep.id ? `${ep.color}20` : 'var(--bg-secondary)',
              border: `1.5px solid ${activeEndpoint === ep.id ? ep.color : 'var(--border)'}`,
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 13,
              color: activeEndpoint === ep.id ? ep.color : 'var(--text-secondary)',
              fontWeight: 700,
            }}
          >
            <span style={{
              background: ep.color,
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 4,
            }}>{ep.method}</span>
            {ep.path}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Request panel */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: 1 }}>
            REQUEST BODY
          </div>
          {activeEndpoint === 'predict' ? (
            <div>
              {sliders.map(s => (
                <div key={s.key} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                      {sensorValues[s.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={sensorValues[s.key]}
                    onChange={e => setSensorValues(prev => ({ ...prev, [s.key]: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: s.color }}
                  />
                </div>
              ))}
              <div style={{
                background: '#0f172a',
                borderRadius: 10,
                padding: 12,
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#a5b4fc',
                lineHeight: 1.7,
                marginTop: 4,
              }}>
                {`{\n  "asset_id": "PUMP-042",\n  "vibration": ${sensorValues.vibration},\n  "temperature": ${sensorValues.temperature},\n  "pressure": ${sensorValues.pressure},\n  "current": ${sensorValues.current}\n}`}
              </div>
            </div>
          ) : (
            <div style={{
              background: '#0f172a',
              borderRadius: 10,
              padding: 16,
              fontFamily: 'monospace',
              fontSize: 13,
              color: '#6ee7b7',
              lineHeight: 1.7,
            }}>
              {activeEndpoint === 'health' ? 'GET /api/health\nNo body required.' : 'GET /api/predictions\nNo body required.'}
            </div>
          )}

          <motion.button
            onClick={sendRequest}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: 14,
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              background: loading ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                  style={{ width: 16, height: 16, border: '2px solid #ffffff44', borderTopColor: '#fff', borderRadius: '50%' }}
                />
                Sending...
              </>
            ) : 'Send Request'}
          </motion.button>
        </div>

        {/* Response panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>RESPONSE</div>
            {latency && (
              <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                {latency} ms
              </div>
            )}
          </div>
          <div style={{
            background: '#0f172a',
            borderRadius: 10,
            padding: 14,
            minHeight: 220,
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.8,
            position: 'relative',
          }}>
            {!response && !loading && (
              <div style={{ color: '#475569', textAlign: 'center', marginTop: 60 }}>
                Send a request to see the response
              </div>
            )}
            {loading && (
              <div style={{ color: '#6366f1', textAlign: 'center', marginTop: 60 }}>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  Waiting for API...
                </motion.div>
              </div>
            )}
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {Object.entries(response).map(([key, val]) => (
                    <div key={key}>
                      <span style={{ color: '#94a3b8' }}>{`  "${key}": `}</span>
                      <span style={{
                        color: key === 'risk_tier' ? risk.color :
                          key === 'status' ? '#10b981' :
                            typeof val === 'number' ? '#f59e0b' :
                              typeof val === 'string' ? '#6ee7b7' : '#e2e8f0',
                        fontWeight: key === 'risk_tier' || key === 'status' ? 800 : 400,
                      }}>
                        {typeof val === 'string' ? `"${val}"` : String(val)}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Section 3: Dashboard Design Wireframe Builder ─────────── */
const WIDGET_TYPES = [
  { id: 'kpi', label: 'KPI Card', icon: '📊', color: '#6366f1', w: 1, h: 1, preview: 'Number + trend arrow' },
  { id: 'risk', label: 'Risk Distribution', icon: '🍩', color: '#ef4444', w: 1, h: 1, preview: 'Donut chart' },
  { id: 'alerts', label: 'Alert Feed', icon: '🔔', color: '#f59e0b', w: 1, h: 2, preview: 'Scrollable alerts' },
  { id: 'table', label: 'Equipment Table', icon: '📋', color: '#0ea5e9', w: 2, h: 1, preview: 'Sortable table' },
  { id: 'trend', label: 'Trend Chart', icon: '📈', color: '#10b981', w: 2, h: 1, preview: 'Time series' },
  { id: 'detail', label: 'Asset Detail', icon: '🔍', color: '#8b5cf6', w: 1, h: 2, preview: 'Expandable card' },
]

const PRESET_LAYOUTS = {
  ops: {
    label: 'Operations Manager',
    icon: '👔',
    desc: 'KPIs + real-time alerts',
    slots: [
      { widgetId: 'kpi', col: 0, row: 0 },
      { widgetId: 'kpi', col: 1, row: 0 },
      { widgetId: 'risk', col: 2, row: 0 },
      { widgetId: 'alerts', col: 3, row: 0 },
      { widgetId: 'table', col: 0, row: 1 },
    ],
  },
  ds: {
    label: 'Data Scientist',
    icon: '🧪',
    desc: 'Metrics + trend analysis',
    slots: [
      { widgetId: 'kpi', col: 0, row: 0 },
      { widgetId: 'kpi', col: 1, row: 0 },
      { widgetId: 'trend', col: 0, row: 1 },
      { widgetId: 'risk', col: 2, row: 0 },
      { widgetId: 'detail', col: 3, row: 0 },
    ],
  },
  ml: {
    label: 'Maintenance Lead',
    icon: '🔧',
    desc: 'Equipment table + details',
    slots: [
      { widgetId: 'alerts', col: 0, row: 0 },
      { widgetId: 'table', col: 1, row: 0 },
      { widgetId: 'detail', col: 3, row: 0 },
      { widgetId: 'kpi', col: 0, row: 2 },
      { widgetId: 'risk', col: 1, row: 2 },
    ],
  },
}

function DashboardBuilder() {
  const [placed, setPlaced] = useState([])
  const [dragging, setDragging] = useState(null)
  const [activePreset, setActivePreset] = useState(null)
  const [tip, setTip] = useState(null)

  const COLS = 4
  const ROWS = 3

  const applyPreset = (presetKey) => {
    const p = PRESET_LAYOUTS[presetKey]
    setPlaced(p.slots.map((s, i) => ({ ...s, id: i })))
    setActivePreset(presetKey)
  }

  const addWidget = (widgetId) => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const occupied = placed.some(p => p.col === col && p.row === row)
        if (!occupied) {
          setPlaced(prev => [...prev, { widgetId, col, row, id: Date.now() }])
          return
        }
      }
    }
    setTip('Grid is full — remove a widget first')
    setTimeout(() => setTip(null), 2500)
  }

  const removeWidget = (id) => {
    setPlaced(prev => prev.filter(p => p.id !== id))
  }

  const score = () => {
    const ids = placed.map(p => p.widgetId)
    const has = (id) => ids.includes(id)
    let s = 0
    let tips = []
    if (has('kpi')) s += 20
    if (has('alerts')) s += 25
    if (has('table')) s += 20
    if (has('trend')) { s += 20; } else { tips.push('Add a trend chart for time-series context') }
    if (has('risk')) { s += 15; }
    if (placed.length > 5) { s -= 10; tips.push('Too many widgets — focus on essentials') }
    if (!has('alerts')) tips.push('An alert feed is critical for ops teams')
    return { score: Math.max(0, s), tips }
  }

  const { score: layoutScore, tips: layoutTips } = score()
  const scoreColor = layoutScore >= 75 ? '#10b981' : layoutScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div>
      {/* Presets */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(PRESET_LAYOUTS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              background: activePreset === key ? '#6366f120' : 'var(--bg-secondary)',
              border: `1.5px solid ${activePreset === key ? '#6366f1' : 'var(--border)'}`,
              color: activePreset === key ? '#6366f1' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Widget palette */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>
            WIDGET PALETTE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WIDGET_TYPES.map(w => (
              <motion.button
                key={w.id}
                onClick={() => addWidget(w.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: `${w.color}12`,
                  border: `1.5px solid ${w.color}44`,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{w.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{w.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{w.preview}</div>
                </div>
              </motion.button>
            ))}
          </div>
          {tip && (
            <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: '#ef444418', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
              {tip}
            </div>
          )}
        </div>

        {/* Grid canvas */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>
              DASHBOARD CANVAS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Layout Score:</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor }}>{layoutScore}/100</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 72px)`,
            gap: 8,
            background: 'var(--bg-secondary)',
            borderRadius: 14,
            padding: 12,
            minHeight: 280,
          }}>
            {Array.from({ length: COLS * ROWS }, (_, idx) => {
              const col = idx % COLS
              const row = Math.floor(idx / COLS)
              const widget = placed.find(p => p.col === col && p.row === row)
              const w = widget ? WIDGET_TYPES.find(wt => wt.id === widget.widgetId) : null
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 8,
                    border: `1.5px dashed ${widget ? w.color + '88' : 'var(--border)'}`,
                    background: widget ? `${w.color}14` : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: widget ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => widget && removeWidget(widget.id)}
                  title={widget ? 'Click to remove' : ''}
                >
                  {widget && w ? (
                    <>
                      <span style={{ fontSize: 20 }}>{w.icon}</span>
                      <div style={{ fontSize: 10, fontWeight: 700, color: w.color, marginTop: 2 }}>{w.label}</div>
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#ef444420',
                        color: '#ef4444',
                        fontSize: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}>×</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 11, color: '#ffffff15' }}>+</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Layout tips */}
          {layoutTips.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {layoutTips.map((t, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: '#f59e0b10',
                  border: '1px solid #f59e0b30',
                  fontSize: 12,
                  color: '#f59e0b',
                }}>
                  <span>💡</span> {t}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Section 4: Model Drift Demo ────────────────────────────── */
function DriftDemo() {
  const [threshold, setThreshold] = useState(0.80)
  const [activeReason, setActiveReason] = useState(null)

  const monthlyAUC = [
    { month: 'Jan', auc: 0.912, status: 'stable' },
    { month: 'Feb', auc: 0.908, status: 'stable' },
    { month: 'Mar', auc: 0.914, status: 'stable' },
    { month: 'Apr', auc: 0.909, status: 'stable' },
    { month: 'May', auc: 0.911, status: 'stable' },
    { month: 'Jun', auc: 0.906, status: 'stable' },
    { month: 'Jul', auc: 0.882, status: 'drifting' },
    { month: 'Aug', auc: 0.864, status: 'drifting' },
    { month: 'Sep', auc: 0.851, status: 'drifting' },
    { month: 'Oct', auc: 0.823, status: 'critical' },
    { month: 'Nov', auc: 0.784, status: 'critical' },
    { month: 'Dec', auc: 0.719, status: 'critical' },
  ]

  const reasons = [
    { id: 'equipment', icon: '🏭', label: 'New Equipment Types Added', color: '#6366f1', detail: 'New Siemens pump models added in July — model never saw their sensor signature during training.' },
    { id: 'seasonal', icon: '🌡️', label: 'Seasonal Changes', color: '#0ea5e9', detail: 'Summer heat elevates baseline temperatures 8–12°C, shifting the normal operating range the model learned.' },
    { id: 'calibration', icon: '⚙️', label: 'Sensor Calibration Drift', color: '#f59e0b', detail: 'Two vibration sensors recalibrated in September — now reporting 15% lower readings vs training data.' },
    { id: 'process', icon: '📋', label: 'Process Changes', color: '#ef4444', detail: 'Maintenance team changed lubrication schedule from monthly to bi-weekly — changes normal vibration patterns.' },
  ]

  const getColor = (auc) => {
    if (auc >= 0.88) return '#10b981'
    if (auc >= 0.80) return '#f59e0b'
    return '#ef4444'
  }

  const chartH = 160
  const minAUC = 0.68
  const maxAUC = 0.93
  const aucRange = maxAUC - minAUC

  const triggerMonths = monthlyAUC.filter(m => m.auc < threshold)

  return (
    <div>
      {/* AUC chart */}
      <div style={{
        background: '#0f172a',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 20,
        position: 'relative',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 12, letterSpacing: 1 }}>
          MODEL AUC OVER 12 MONTHS
        </div>
        <svg width="100%" viewBox={`0 0 ${monthlyAUC.length * 52} ${chartH + 30}`} style={{ display: 'block', overflow: 'visible' }}>
          {/* Threshold line */}
          <line
            x1="0"
            y1={chartH - ((threshold - minAUC) / aucRange) * chartH}
            x2={monthlyAUC.length * 52}
            y2={chartH - ((threshold - minAUC) / aucRange) * chartH}
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="6,4"
          />
          <text
            x={monthlyAUC.length * 52 - 2}
            y={chartH - ((threshold - minAUC) / aucRange) * chartH - 4}
            fill="#6366f1"
            fontSize="9"
            textAnchor="end"
            fontWeight="700"
          >
            Threshold {threshold.toFixed(2)}
          </text>

          {/* Area under line */}
          <path
            d={`M${monthlyAUC.map((m, i) => `${i * 52 + 26},${chartH - ((m.auc - minAUC) / aucRange) * chartH}`).join(' L')} L${(monthlyAUC.length - 1) * 52 + 26},${chartH} L26,${chartH} Z`}
            fill="#6366f108"
          />

          {/* Line */}
          <polyline
            points={monthlyAUC.map((m, i) => `${i * 52 + 26},${chartH - ((m.auc - minAUC) / aucRange) * chartH}`).join(' ')}
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Points */}
          {monthlyAUC.map((m, i) => {
            const cx = i * 52 + 26
            const cy = chartH - ((m.auc - minAUC) / aucRange) * chartH
            const col = getColor(m.auc)
            const triggered = m.auc < threshold
            return (
              <g key={m.month}>
                {triggered && (
                  <motion.circle
                    cx={cx} cy={cy} r={14}
                    fill={col}
                    opacity={0.15}
                    animate={{ r: [10, 18, 10] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  />
                )}
                <circle cx={cx} cy={cy} r={6} fill={col} stroke="#0f172a" strokeWidth="2" />
                <text x={cx} y={chartH + 16} textAnchor="middle" fill="#64748b" fontSize="10">{m.month}</text>
                <text x={cx} y={cy - 10} textAnchor="middle" fill={col} fontSize="9" fontWeight="700">
                  {m.auc.toFixed(2)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Threshold slider */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Drift Alert Threshold (AUC)
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#6366f1' }}>{threshold.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.70}
          max={0.92}
          step={0.01}
          value={threshold}
          onChange={e => setThreshold(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#6366f1' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
          <span>0.70 (lenient)</span>
          <span>0.92 (strict)</span>
        </div>
        {triggerMonths.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#ef444418',
              border: '1.5px solid #ef4444',
              color: '#ef4444',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Retrain triggered in: {triggerMonths.map(m => m.month).join(', ')} ({triggerMonths.length} month{triggerMonths.length > 1 ? 's' : ''})
          </motion.div>
        ) : (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: '#10b98110', border: '1.5px solid #10b98140', color: '#10b981', fontSize: 13, fontWeight: 600 }}>
            No drift detected at this threshold
          </div>
        )}
      </div>

      {/* Reasons */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, marginBottom: 10 }}>
        WHY DID THE MODEL DRIFT?
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {reasons.map(r => (
          <motion.button
            key={r.id}
            onClick={() => setActiveReason(activeReason === r.id ? null : r.id)}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: activeReason === r.id ? `${r.color}18` : 'var(--bg-secondary)',
              border: `1.5px solid ${activeReason === r.id ? r.color : 'var(--border)'}`,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: activeReason === r.id ? 8 : 0 }}>
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{r.label}</span>
            </div>
            <AnimatePresence>
              {activeReason === r.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {r.detail}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ─── Section 5: Retraining Pipeline ─────────────────────────── */
function RetrainingPipeline() {
  const [activeStage, setActiveStage] = useState(null)
  const [running, setRunning] = useState(false)
  const [completedStages, setCompletedStages] = useState([])
  const [modelVersions, setModelVersions] = useState([
    { v: 'v1.0', auc: 0.87, date: 'Jan 1', active: false },
    { v: 'v2.0', auc: 0.91, date: 'Apr 15', active: false },
    { v: 'v2.4', auc: 0.93, date: 'Aug 3', active: true },
  ])

  const stages = [
    { id: 'ingest', icon: '📥', label: 'New Data Arrives', desc: 'Sensor readings + work orders stream in daily. Stored in PostgreSQL + S3 data lake. New data tagged with timestamps.', color: '#6366f1', duration: 600 },
    { id: 'evaluate', icon: '📊', label: 'Evaluate Current Model', desc: 'Weekly job: compute AUC, precision, recall on last 4 weeks of labeled data. Compare to baseline metrics.', color: '#0ea5e9', duration: 900 },
    { id: 'detect', icon: '🔍', label: 'Drift Detection', desc: 'Kolmogorov-Smirnov test on feature distributions. PSI score computed for each input feature. Threshold: KS > 0.1.', color: '#f59e0b', duration: 600 },
    { id: 'retrain', icon: '🔄', label: 'Trigger Retraining', desc: 'Pulls last 6 months of labeled data. Runs hyperparameter search (Optuna). Trains XGBoost + Random Forest ensemble.', color: '#ef4444', duration: 1200 },
    { id: 'champion', icon: '🏆', label: 'Champion vs Challenger', desc: 'New model (challenger) tested against current model (champion) on held-out validation set. Shadow mode: both score live data for 48h.', color: '#8b5cf6', duration: 900 },
    { id: 'promote', icon: '🚀', label: 'Promote to Production', desc: 'If challenger wins: swap API endpoint, update model registry, send Slack notification. Old model archived in S3.', color: '#10b981', duration: 700 },
    { id: 'archive', icon: '📦', label: 'Archive & Log', desc: 'Old model version archived with full metadata: training data hash, hyperparameters, eval metrics. MLflow experiment logged.', color: '#64748b', duration: 500 },
  ]

  const runPipeline = async () => {
    setRunning(true)
    setCompletedStages([])
    for (let i = 0; i < stages.length; i++) {
      setActiveStage(stages[i].id)
      await new Promise(r => setTimeout(r, stages[i].duration))
      setCompletedStages(prev => [...prev, stages[i].id])
    }
    setActiveStage(null)
    setRunning(false)
    setModelVersions(prev => {
      const updated = prev.map(m => ({ ...m, active: false }))
      updated.push({ v: `v${(parseFloat(prev[prev.length - 1].v.slice(1)) + 0.1).toFixed(1)}`, auc: 0.94, date: 'Now', active: true })
      return updated
    })
  }

  return (
    <div>
      {/* Stage list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {stages.map((s, i) => {
          const done = completedStages.includes(s.id)
          const active = activeStage === s.id
          return (
            <motion.div
              key={s.id}
              onClick={() => !running && setActiveStage(activeStage === s.id ? null : s.id)}
              animate={{
                borderColor: active ? s.color : done ? `${s.color}88` : 'var(--border)',
                background: active ? `${s.color}20` : done ? `${s.color}0a` : 'var(--bg-secondary)',
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                cursor: running ? 'default' : 'pointer',
              }}
            >
              <motion.div
                animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                transition={{ repeat: active ? Infinity : 0, duration: 0.8 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: done ? s.color : active ? `${s.color}44` : `${s.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                  color: done ? '#fff' : 'inherit',
                }}
              >
                {done ? '✓' : s.icon}
              </motion.div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  {i + 1}. {s.label}
                </div>
                <AnimatePresence>
                  {(activeStage === s.id && !running) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>
                        {s.desc}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {active && running && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ width: 16, height: 16, border: `2px solid ${s.color}44`, borderTopColor: s.color, borderRadius: '50%' }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
        <motion.button
          onClick={runPipeline}
          disabled={running}
          whileHover={{ scale: running ? 1 : 1.03 }}
          whileTap={{ scale: running ? 1 : 0.97 }}
          style={{
            padding: '12px 28px',
            borderRadius: 12,
            background: running ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            color: running ? 'var(--text-secondary)' : '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running ? 'Pipeline running...' : 'Run Retraining Pipeline'}
        </motion.button>
        {completedStages.length === stages.length && (
          <span style={{ color: '#10b981', fontWeight: 700, fontSize: 13 }}>
            New model promoted to production!
          </span>
        )}
      </div>

      {/* Model version timeline */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: 1 }}>
          MODEL VERSION TIMELINE
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {modelVersions.map((m, i) => (
            <motion.div
              key={m.v}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: m.active ? '#10b98118' : 'var(--bg-card)',
                border: `1.5px solid ${m.active ? '#10b981' : 'var(--border)'}`,
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, color: m.active ? '#10b981' : 'var(--text-primary)' }}>{m.v}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>AUC {m.auc}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.date}</div>
              {m.active && (
                <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: '#10b981', background: '#10b98120', borderRadius: 4, padding: '2px 6px' }}>
                  LIVE
                </div>
              )}
            </motion.div>
          ))}
          {modelVersions.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: 20 }}>→</div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Section 6: Production Architecture ─────────────────────── */
function ProductionArchitecture() {
  const [activeComponent, setActiveComponent] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 120)
    return () => clearInterval(id)
  }, [])

  const layers = [
    {
      id: 'iot',
      label: 'IoT Layer',
      color: '#6366f1',
      components: [
        { id: 'sensors', icon: '📡', label: 'Sensors', purpose: 'Vibration, temperature, pressure, current', tech: 'MEMS accelerometers, PT100, 4-20mA', flow: 'Raw analog signals at 25kHz' },
        { id: 'edge', icon: '💻', label: 'Edge Devices', purpose: 'On-device feature extraction, filtering', tech: 'Raspberry Pi 4 / PLC / Jetson Nano', flow: 'Feature vectors at 1Hz' },
        { id: 'mqtt', icon: '📶', label: 'MQTT Broker', purpose: 'Lightweight pub/sub messaging', tech: 'Eclipse Mosquitto / AWS IoT Core', flow: 'JSON messages to Kafka' },
      ],
    },
    {
      id: 'data',
      label: 'Data Layer',
      color: '#0ea5e9',
      components: [
        { id: 'kafka', icon: '🌊', label: 'Kafka', purpose: 'High-throughput event streaming', tech: 'Apache Kafka 3.x — 5 partitions', flow: '50k msg/sec ingestion' },
        { id: 'etl', icon: '🔄', label: 'ETL Service', purpose: 'Clean, validate, enrich sensor data', tech: 'Apache Spark Structured Streaming', flow: 'Writes to PostgreSQL + S3' },
        { id: 'db', icon: '🗄️', label: 'PostgreSQL + Data Lake', purpose: 'Operational DB + historical data lake', tech: 'PostgreSQL 15 + S3 (Parquet format)', flow: 'Serves training + API queries' },
      ],
    },
    {
      id: 'ml',
      label: 'ML Layer',
      color: '#10b981',
      components: [
        { id: 'training', icon: '🧠', label: 'Training Service', purpose: 'Scheduled + triggered model retraining', tech: 'Python + XGBoost + scikit-learn + Optuna', flow: 'Pushes new model to registry' },
        { id: 'registry', icon: '📦', label: 'Model Registry', purpose: 'Version control for ML models', tech: 'MLflow Model Registry', flow: 'Loads champion model to API' },
        { id: 'api', icon: '🔌', label: 'Prediction API', purpose: 'Real-time inference endpoint', tech: 'FastAPI + uvicorn — 4 replicas', flow: 'Returns predictions in <60ms' },
      ],
    },
    {
      id: 'app',
      label: 'Application Layer',
      color: '#f59e0b',
      components: [
        { id: 'dashboard', icon: '📊', label: 'React Dashboard', purpose: 'Operations and analyst UI', tech: 'React + Recharts + WebSocket', flow: 'Polls API every 30s' },
        { id: 'mobile', icon: '📱', label: 'Mobile Alerts', purpose: 'Push notifications for high-risk assets', tech: 'Firebase FCM + React Native', flow: 'Alert within 5s of prediction' },
        { id: 'erp', icon: '🏢', label: 'ERP Integration', purpose: 'Auto-generate work orders in SAP', tech: 'REST API to SAP PM module', flow: 'Work order created on HIGH risk' },
      ],
    },
  ]

  const ac = activeComponent
    ? layers.flatMap(l => l.components).find(c => c.id === activeComponent)
    : null
  const acLayer = activeComponent
    ? layers.find(l => l.components.some(c => c.id === activeComponent))
    : null

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
        {layers.map((layer) => (
          <div
            key={layer.id}
            style={{
              borderRadius: 14,
              border: `1.5px solid ${layer.color}33`,
              overflow: 'hidden',
            }}
          >
            <div style={{
              background: `${layer.color}18`,
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 800,
              color: layer.color,
              letterSpacing: 1,
              borderBottom: `1px solid ${layer.color}22`,
            }}>
              {layer.label.toUpperCase()}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0,
            }}>
              {layer.components.map((comp, i) => (
                <motion.button
                  key={comp.id}
                  onClick={() => setActiveComponent(activeComponent === comp.id ? null : comp.id)}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '16px 12px',
                    background: activeComponent === comp.id ? `${layer.color}20` : 'transparent',
                    border: 'none',
                    borderRight: i < 2 ? `1px solid ${layer.color}18` : 'none',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <motion.span
                    animate={activeComponent === comp.id ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: activeComponent === comp.id ? Infinity : 0, duration: 1.5 }}
                    style={{ fontSize: 24 }}
                  >
                    {comp.icon}
                  </motion.span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{comp.label}</div>
                  {/* Data flow dots */}
                  {i < 2 && (
                    <motion.div
                      animate={{ right: [12, -4, 12] }}
                      transition={{ repeat: Infinity, duration: 1.4, delay: (i + layers.indexOf(layer)) * 0.3 }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: 12,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: layer.color,
                        opacity: 0.7,
                        transform: 'translateY(-50%)',
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {ac && acLayer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              padding: '16px 20px',
              borderRadius: 14,
              background: `${acLayer.color}10`,
              border: `1.5px solid ${acLayer.color}55`,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{ac.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{ac.label}</div>
                <div style={{ fontSize: 12, color: acLayer.color, fontWeight: 600 }}>{acLayer.label}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Purpose', value: ac.purpose },
                { label: 'Technology', value: ac.tech },
                { label: 'Data Flow', value: ac.flow },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'var(--bg-card)',
                  borderRadius: 10,
                  padding: '10px 12px',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: acLayer.color, letterSpacing: 1, marginBottom: 4 }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main Export ─────────────────────────────────────────────── */
export default function Topic13Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px' }}>

      {/* Hero */}
      <Neuron
        mood="excited"
        size="large"
        message="You've trained a great model — but a model sitting in a Jupyter notebook is worth nothing. In this final topic, we cross the deployment gap: wrapping your model in an API, building a real dashboard, detecting drift, and keeping it healthy in production. This is where data science becomes engineering."
        style={{ marginBottom: 40 }}
      />

      {/* ── Section 1 ── */}
      <SectionBlock
        icon="🌉"
        title="The Deployment Gap"
        color="#6366f1"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          The gap between a Jupyter notebook and a production system is vast — but it's crossable in 5 concrete steps.
          Click each bridge plank to see what it takes.
        </p>
        <DeploymentGap />
        <NeuronTip type="tip">
          Many excellent ML models never make it to production. The bottleneck isn't model quality — it's the engineering work to make models reliable, observable, and maintainable at scale. This is why ML Engineers exist.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="डिप्लॉयमेंट गैप — Jupyter से Production तक"
        english="The Deployment Gap"
        explanation="Jupyter notebook में model बनाना अलग है, उसे real factory में use करना अलग। Notebook में data manually load होता है, model manually run होता है। Production में sensors automatically data भेजते हैं, model automatically predict करता है, alert automatically fire होता है — 24/7 बिना किसी के manually run किए। यही gap है जो bridge करना पड़ता है।"
        example="एक data scientist ने घर पर pump failure predict करने वाला model बनाया — laptop पर बढ़िया काम करता था। पर factory में? Sensors different format में data भेजते थे, real-time processing नहीं थी, alerts कोई नहीं देख रहा था। Bridge = API + Dashboard + Monitoring + Retraining pipeline।"
        terms={[
          { hindi: 'उत्पादन', english: 'Production', meaning: 'Real environment जहाँ actual users का data process होता है — test नहीं, असली काम' },
          { hindi: 'श्रृंखला', english: 'Pipeline', meaning: 'Automated steps जो automatically एक के बाद एक run होते हैं बिना human intervention' },
          { hindi: 'क्रमबद्धता', english: 'Serialization', meaning: 'Trained model को file में save करना ताकि बाद में load करके use हो सके — joblib.dump()' },
        ]}
      />

      {/* ── Section 2 ── */}
      <SectionBlock
        icon="🔌"
        title="Model Serving — FastAPI"
        color="#0ea5e9"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          FastAPI turns your model into a live web service. Select an endpoint, fill in sensor values, and watch the API respond
          with a prediction — complete with risk tier and confidence score.
        </p>
        <FastAPIDemo />
        <NeuronTip type="deep">
          FastAPI is ideal for ML serving: it auto-generates OpenAPI docs, validates request types via Pydantic, and handles async requests efficiently. For higher throughput (10k+ req/s), switch to Triton Inference Server or TorchServe.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="FastAPI — Model को Online Service बनाना"
        english="FastAPI Model Serving"
        explanation="FastAPI तुम्हारे ML model को एक online service बनाता है जिसे कोई भी program call कर सकता है। जैसे Zomato app restaurant से directly communicate नहीं करती — एक API (middleman) होता है जो order forward करता है। वैसे ही sensor data → FastAPI → model prediction → dashboard। POST /api/predict को sensor values भेजो, prediction मिलती है milliseconds में।"
        example="Factory का SCADA system हर minute Pump P-01 का data FastAPI को भेजता है: vibration=4.2, temperature=85, pressure=11.2. FastAPI model को call करता है, model respond करता है: probability=0.78, risk_tier=HIGH, recommended_action='Schedule inspection within 7 days'. SCADA dashboard automatically update हो जाता है।"
        terms={[
          { hindi: 'एपीआई', english: 'API', meaning: 'Application Programming Interface — programs के बीच communicate करने का तरीका' },
          { hindi: 'एंडपॉइंट', english: 'Endpoint', meaning: 'API का एक specific URL जो एक specific काम करता है — जैसे /api/predict' },
          { hindi: 'विलंबता', english: 'Latency', meaning: 'Request भेजने से response मिलने तक का time — PdM में 60ms से कम होना चाहिए' },
        ]}
      />

      {/* ── Section 3 ── */}
      <SectionBlock
        icon="📊"
        title="Dashboard Design Principles"
        color="#10b981"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          A great dashboard puts the right information in front of the right person. Choose a preset layout or build your own
          by clicking widgets from the palette — then see your layout scored and improved.
        </p>
        <DashboardBuilder />
        <NeuronTip type="example">
          The golden rule: operations teams need alerts + KPIs at a glance. Data scientists need trend lines + distribution plots. Maintenance leads need asset-level details + work order integration. One dashboard can't serve all three — design for the primary user.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="डैशबोर्ड डिज़ाइन — Operations Team का Control Room"
        english="Dashboard Design Principles"
        explanation="Operations dashboard एक aircraft cockpit की तरह होता है — pilot को एक नज़र में सब दिखना चाहिए। KPI cards: कितनी machines CRITICAL हैं? Alert feed: latest alerts कौन-से हैं? Equipment table: worst machines कौन-सी? हर widget एक specific need पूरी करता है। बहुत ज़्यादा information = confusion। सिर्फ जो ज़रूरी है वही दिखाओ।"
        example="Operations Manager Rahul की morning routine: Dashboard खोलो → 3 CRITICAL machines दिखे → Alert feed में Boiler J और Gearbox E → Work orders already created → अपने engineers को assign करो। 2 minutes में plant status clear — बिना किसी spreadsheet या email check किए।"
        terms={[
          { hindi: 'KPI कार्ड', english: 'KPI Card', meaning: 'Key Performance Indicator — एक ही number में overall status जैसे CRITICAL count' },
          { hindi: 'विजेट', english: 'Widget', meaning: 'Dashboard का एक building block — chart, table, या number जो specific info दिखाता है' },
          { hindi: 'लेआउट स्कोर', english: 'Layout Score', meaning: 'Dashboard में right widgets होने का measure — alerts + KPIs + table = high score' },
        ]}
      />

      {/* ── Section 4 ── */}
      <SectionBlock
        icon="📉"
        title="Model Drift — When Models Go Bad"
        color="#ef4444"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          A model trained in January may fail silently by October. Watch how AUC declines over 12 months, set your own
          drift alert threshold, and explore the four root causes of degradation.
        </p>
        <DriftDemo />
        <NeuronTip type="warning">
          Silent model degradation is one of the most dangerous failure modes in production ML. The model keeps running and returning predictions — but those predictions are increasingly wrong. Always monitor AUC, PSI, and feature distribution shifts in production.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="मॉडल ड्रिफ्ट — पुरानी recipe नई सब्ज़ियों से नहीं बनती"
        english="Model Drift"
        explanation="January में train किया model October तक काम नहीं करता। क्यों? New machines आती हैं जिन्हें model ने देखा नहीं। Seasons बदलते हैं — गर्मियों में baseline temperature ज़्यादा होती है। Sensors recalibrate होते हैं। Production process change होती है। Model यह सब नहीं जानता — वो January के data पर trained है। AUC January में 0.91 था, December में 0.72 हो जाता है — silently।"
        example="SteelForge factory ने July में नई Siemens pump models लगाईं। Model ने Siemens pump की sensor signature कभी नहीं देखी थी। Result: July से model की accuracy गिरना शुरू हुई — August में AUC 0.86, October में 0.82, December में 0.72। Machine fail हुई पर model ने predict नहीं किया — ₹25L का नुकसान।"
        terms={[
          { hindi: 'मॉडल बहाव', english: 'Model Drift', meaning: 'समय के साथ model की accuracy गिरना क्योंकि real-world data बदल गया' },
          { hindi: 'वितरण बदलाव', english: 'Distribution Shift', meaning: 'Production data का distribution training data से अलग होना — जैसे नई machines' },
          { hindi: 'बहाव डिटेक्शन', english: 'Drift Detection', meaning: 'Statistical tests (KS test, PSI) जो detect करते हैं कि data distribution बदली है' },
        ]}
      />

      {/* ── Section 5 ── */}
      <SectionBlock
        icon="🔄"
        title="Automated Retraining Pipeline"
        color="#8b5cf6"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          When drift is detected, a 7-stage retraining pipeline kicks in automatically. Click each stage to read the details,
          then run the full pipeline and watch a new champion model get promoted to production.
        </p>
        <RetrainingPipeline />
        <NeuronTip type="tip">
          The champion-vs-challenger pattern is critical: never push a new model directly to production without first comparing it on real, recent data. Shadow mode (both models score live data simultaneously for 48h) catches edge cases that offline evaluation misses.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="पुनः प्रशिक्षण पाइपलाइन — नया data, नया model"
        english="Automated Retraining Pipeline"
        explanation="Drift detect होने पर automatically 7-stage pipeline चलती है: नया data आता है → current model evaluate होता है → drift check होता है → अगर drift है तो retrain होता है → नया model (challenger) पुराने (champion) से compare होता है → अगर challenger जीते तो production में जाता है → पुरानी version archive होती है। यह सब scheduled हो जाता है — कोई manual step नहीं।"
        example="SteelForge में हर Monday 2 AM पर pipeline run होती है। October में AUC 0.823 था (threshold 0.85 से नीचे) → retrain triggered। नया model v2.5 train हुआ → 48 hours shadow mode में दोनों models live data score करते रहे → v2.5 ने v2.4 को beat किया → v2.5 production में। v2.4 archive। सुबह manager को Slack notification: 'New model v2.5 deployed, AUC: 0.94'।"
        terms={[
          { hindi: 'चैम्पियन vs चैलेंजर', english: 'Champion vs Challenger', meaning: 'पुराना (champion) और नया (challenger) model live data पर compare करना पहले swap करने से' },
          { hindi: 'शैडो मोड', english: 'Shadow Mode', meaning: 'दोनों models parallel में run करना — challenger की predictions log होती हैं पर use नहीं होतीं' },
          { hindi: 'मॉडल रजिस्ट्री', english: 'Model Registry', meaning: 'सभी model versions का storage — MLflow जैसे tool से version tracking होती है' },
        ]}
      />

      {/* ── Section 6 ── */}
      <SectionBlock
        icon="🏗️"
        title="Production Architecture"
        color="#f59e0b"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          A complete industrial PdM system spans four layers — from IoT sensors to ERP integration. Click any component
          to see its purpose, technology choice, and the data it passes onward.
        </p>
        <ProductionArchitecture />
        <NeuronTip type="deep">
          This architecture handles ~50,000 sensor messages per second across 500+ machines. The key design decision: process raw waveforms at the edge (reducing bandwidth 99%) and only send feature vectors to the cloud. Without this, the data costs alone would kill the project.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="पूरी Production Architecture — सब कुछ एक साथ"
        english="Full Production Architecture"
        explanation="एक complete industrial PdM system चार layers में काम करता है। IoT Layer: factory में sensors लगे हैं जो vibration, temperature, pressure measure करते हैं — edge devices real-time features extract करते हैं। Data Layer: Kafka high-speed messages receive करता है, ETL service data clean करता है, PostgreSQL store करता है। ML Layer: training service model retrain करता है, registry versions manage करता है, FastAPI predictions देता है। Application Layer: React dashboard दिखाता है, mobile alerts भेजता है, SAP में work orders create होते हैं।"
        example="Factory sensor (vibration spike detect) → Edge device (feature निकालो) → MQTT → Kafka (50K msg/sec) → ETL (clean करो) → PostgreSQL → FastAPI (predict करो) → React Dashboard (alert दिखाओ) → Maintenance lead का mobile (SMS/notification) → SAP (work order create) → Engineer factory जाता है। सारा process 5 seconds से कम में!"
        terms={[
          { hindi: 'IoT परत', english: 'IoT Layer', meaning: 'Physical sensors और edge devices — raw data collect करते हैं factory में' },
          { hindi: 'संदेश दलाल', english: 'Message Broker', meaning: 'MQTT/Kafka जो sensors से data receive करके आगे pass करता है — post office की तरह' },
          { hindi: 'ERP एकीकरण', english: 'ERP Integration', meaning: 'ML system का SAP/maintenance software से connection — automatic work order creation' },
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
          message="Deployment को एक रेस्टोरेंट से समझो। Recipe (model) बनाना अलग काम है, restaurant चलाना अलग। अगर ingredients (data) बदल जाएं — नए vegetables आएं, seasons बदलें — तो recipe भी update करनी होगी। यही model retraining है।"
          style={{ marginBottom: 20 }}
        />

        <HindiExplainer
          concept="तैनाती (Deployment)"
          english="Deployment"
          explanation="जब हम अपना trained model एक ऐसे system में डालते हैं जो automatically काम करे — बिना हमारे manually चलाए — उसे deployment कहते हैं। जैसे एक machine को factory में लगाना।"
          example="आपने घर पर रोटी बनाना सीखा (training)। अब उसी skill को restaurant में काम पर लगाया (deployment) — अब हर रोज़ automatically हज़ारों रोटियां बनती हैं।"
          terms={[
            { hindi: 'तैनाती', english: 'Deployment', meaning: 'Model को production में डालना ताकि वो automatically काम करे' },
            { hindi: 'एपीआई', english: 'API', meaning: 'एक दरवाज़ा जिसके ज़रिए दूसरे programs model से बात करते हैं' },
            { hindi: 'डैशबोर्ड', english: 'Dashboard', meaning: 'एक screen जिस पर सभी ज़रूरी जानकारी एक साथ दिखती है, जैसे car का instrument panel' },
            { hindi: 'मॉडल बहाव', english: 'Model Drift', meaning: 'समय के साथ model की accuracy कम होना क्योंकि real-world data बदल जाता है' },
            { hindi: 'पुनः प्रशिक्षण', english: 'Retraining', meaning: 'Drift detect होने पर नए data से model को दोबारा train करना' },
            { hindi: 'उत्पादन', english: 'Production', meaning: 'वो live environment जहाँ real users का data process होता है — test नहीं, असली काम' },
          ]}
        />
      </SectionBlock>

      {/* Closing Neuron */}
      <Neuron
        mood="waving"
        message="Congratulations — you've completed the full Predictive Maintenance course! You now understand the entire journey: sensors to signals, EDA to features, models to predictions, and Jupyter to production. The factory never sleeps — and now, neither does your model. Go build something that saves real machines."
        style={{ marginTop: 8, marginBottom: 40 }}
      />

    </div>
  )
}
