import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 4 — Time Series for Machines
   Trends, seasonality, stationarity, windowing
================================================================ */

const C = {
  blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981',
  orange: '#f59e0b', pink: '#ec4899', red: '#ef4444',
  cyan: '#06b6d4', indigo: '#6366f1', gray: '#6b7280',
}

/* ---- Seeded pseudo-random to keep data consistent ---- */
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/* ---- Generate 30 temperature readings (smooth curve) ---- */
function generateTempSeries() {
  const rng = seededRandom(42)
  return Array.from({ length: 30 }, (_, i) => {
    const base = 60 + 15 * Math.sin((i / 30) * Math.PI * 2)
    return Math.round(base + (rng() - 0.5) * 6)
  })
}

/* ---- Generate pump vibration (12 months, 365 points aggregated to 52 weeks) ---- */
function generateVibrationSeries(n = 52) {
  const rng = seededRandom(99)
  return Array.from({ length: n }, (_, i) => {
    const trend = 1.8 + (i / n) * 3.2
    const seasonality = 0.6 * Math.sin((i / 52) * Math.PI * 2 * 4)
    const weekly = 0.3 * Math.sin((i / 7) * Math.PI * 2)
    const noise = (rng() - 0.5) * 0.5
    return parseFloat((trend + seasonality + weekly + noise).toFixed(3))
  })
}

/* ---- Generate 90-day vibration for rolling stats ---- */
function generateVib90() {
  const rng = seededRandom(777)
  return Array.from({ length: 90 }, (_, i) => {
    const base = 2.0 + (i / 90) * 2.5
    const osc = 0.4 * Math.sin((i / 14) * Math.PI * 2)
    const noise = (rng() - 0.5) * (1 + (i / 90) * 2)
    return parseFloat((base + osc + noise).toFixed(3))
  })
}

/* ---- Generate 180-day series for windowing ---- */
function generateVib180() {
  const rng = seededRandom(1234)
  return Array.from({ length: 180 }, (_, i) => {
    const base = 1.5 + (i / 180) * 3.5
    const osc = 0.5 * Math.sin((i / 21) * Math.PI * 2)
    const noise = (rng() - 0.5) * (0.6 + (i / 180) * 1.8)
    // Spike before failure zone (day 140-180)
    const failureZone = i > 140 ? (i - 140) * 0.04 : 0
    return parseFloat((base + osc + noise + failureZone).toFixed(3))
  })
}

const TEMP_DATA = generateTempSeries()
const VIB_52 = generateVibrationSeries()
const VIB_90 = generateVib90()
const VIB_180 = generateVib180()

/* ================================================================
   SECTION 1 — What Makes Time Series Special?
================================================================ */
function TimeSeriesVsTabular() {
  const [shuffled, setShuffled] = useState(false)
  const [displayData, setDisplayData] = useState([...TEMP_DATA])
  const [shuffledData] = useState(() => {
    const rng = seededRandom(555)
    const arr = [...TEMP_DATA]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })

  const handleShuffle = () => {
    setShuffled(true)
    setDisplayData(shuffledData)
  }
  const handleUnshuffle = () => {
    setShuffled(false)
    setDisplayData([...TEMP_DATA])
  }

  const svgW = 340, svgH = 140
  const minV = Math.min(...displayData)
  const maxV = Math.max(...displayData)
  const pad = { top: 12, right: 16, bottom: 20, left: 28 }
  const innerW = svgW - pad.left - pad.right
  const innerH = svgH - pad.top - pad.bottom

  const pts = displayData.map((v, i) => {
    const x = pad.left + (i / (displayData.length - 1)) * innerW
    const y = pad.top + ((maxV - v) / (maxV - minV)) * innerH
    return `${x},${y}`
  })
  const polyline = pts.join(' ')

  return (
    <div>
      {/* Comparison cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Regular tabular */}
        <motion.div
          style={{
            background: 'var(--bg-secondary)', borderRadius: 16,
            border: '2px solid var(--border)', padding: 20,
          }}
        >
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
            color: C.gray, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              background: '#6b728018', borderRadius: 8, padding: '4px 10px',
              fontSize: 13, border: '1px solid #6b728030',
            }}>
              Regular Data
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}>— rows independent</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
            {[
              ['Customer A', 'Age: 34', 'Plan: Basic'],
              ['Customer B', 'Age: 28', 'Plan: Pro'],
              ['Customer C', 'Age: 45', 'Plan: Basic'],
              ['Customer D', 'Age: 31', 'Plan: Enterprise'],
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', gap: 8, padding: '3px 8px', borderRadius: 6,
                  background: i % 2 === 0 ? 'var(--bg-card)' : 'transparent',
                  color: 'var(--text-secondary)', fontSize: 11,
                }}
              >
                {row.map((cell, j) => (
                  <span key={j} style={{ flex: j === 0 ? 0.7 : 1 }}>{cell}</span>
                ))}
              </motion.div>
            ))}
          </div>
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 10,
            background: '#10b98112', border: '1px solid #10b98130',
            fontSize: 12, color: C.green, fontWeight: 600,
          }}>
            Shuffle these rows? No problem — same information.
          </div>
        </motion.div>

        {/* Time series */}
        <motion.div
          style={{
            background: 'var(--bg-secondary)', borderRadius: 16,
            border: `2px solid ${shuffled ? C.red : C.blue}40`, padding: 20,
          }}
          animate={{ borderColor: shuffled ? `${C.red}60` : `${C.blue}40` }}
        >
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
            color: shuffled ? C.red : C.blue, marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              background: shuffled ? '#ef444418' : '#3b82f618',
              borderRadius: 8, padding: '4px 10px', fontSize: 13,
              border: `1px solid ${shuffled ? '#ef444430' : '#3b82f630'}`,
            }}>
              Time Series
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}>— order matters!</span>
          </div>
          <svg width={svgW} height={svgH} style={{ display: 'block', width: '100%', maxWidth: svgW }}>
            {/* Y-axis label */}
            <text x={6} y={pad.top + innerH / 2} textAnchor="middle" fill="var(--text-muted)"
              fontSize={9} transform={`rotate(-90, 6, ${pad.top + innerH / 2})`}>°C</text>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <line key={t}
                x1={pad.left} y1={pad.top + t * innerH}
                x2={pad.left + innerW} y2={pad.top + t * innerH}
                stroke="var(--border)" strokeWidth={0.5} opacity={0.5}
              />
            ))}
            {/* Data line */}
            <motion.polyline
              key={shuffled ? 'shuffled' : 'ordered'}
              points={polyline}
              fill="none"
              stroke={shuffled ? C.red : C.blue}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* X-axis */}
            <line x1={pad.left} y1={svgH - pad.bottom}
              x2={pad.left + innerW} y2={svgH - pad.bottom}
              stroke="var(--border)" strokeWidth={1} />
            <text x={pad.left} y={svgH - 4} fill="var(--text-muted)" fontSize={9}>Day 1</text>
            <text x={pad.left + innerW} y={svgH - 4} textAnchor="end" fill="var(--text-muted)" fontSize={9}>Day 30</text>
          </svg>
          <AnimatePresence mode="wait">
            {shuffled ? (
              <motion.div
                key="shuffled-msg"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 10, padding: '10px 14px', borderRadius: 10,
                  background: '#ef444412', border: '1px solid #ef444430',
                  fontSize: 12, color: C.red, fontWeight: 600,
                }}
              >
                Pattern destroyed — zigzag noise. The machine's "story" is gone.
              </motion.div>
            ) : (
              <motion.div
                key="ordered-msg"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 10, padding: '10px 14px', borderRadius: 10,
                  background: '#3b82f612', border: '1px solid #3b82f630',
                  fontSize: 12, color: C.blue, fontWeight: 600,
                }}
              >
                Smooth wave — you can see the day/night temperature cycle.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Shuffle controls */}
      <InteractiveDemo title="Order Matters Demo" instruction="Shuffle the temperature readings and watch the time pattern disappear.">
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            onClick={handleShuffle}
            disabled={shuffled}
            whileHover={{ scale: shuffled ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 28px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, cursor: shuffled ? 'default' : 'pointer',
              background: shuffled ? 'var(--bg-secondary)' : `${C.red}18`,
              border: `2px solid ${shuffled ? 'var(--border)' : C.red}`,
              color: shuffled ? 'var(--text-muted)' : C.red,
              fontFamily: 'var(--font-heading)',
            }}
          >
            Shuffle Data
          </motion.button>
          <motion.button
            onClick={handleUnshuffle}
            disabled={!shuffled}
            whileHover={{ scale: !shuffled ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 28px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, cursor: !shuffled ? 'default' : 'pointer',
              background: !shuffled ? 'var(--bg-secondary)' : `${C.green}18`,
              border: `2px solid ${!shuffled ? 'var(--border)' : C.green}`,
              color: !shuffled ? 'var(--text-muted)' : C.green,
              fontFamily: 'var(--font-heading)',
            }}
          >
            Restore Order
          </motion.button>
        </div>
        <div style={{
          marginTop: 20, padding: 16, borderRadius: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
            30 Temperature Readings (°C):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {displayData.map((v, i) => (
              <motion.span
                key={i}
                layout
                style={{
                  padding: '4px 10px', borderRadius: 8,
                  fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                  background: shuffled
                    ? `${C.red}10`
                    : `hsl(${220 + (v - 55) * 2}, 80%, ${shuffled ? 60 : 55}%, 0.15)`,
                  border: `1px solid ${shuffled ? C.red + '30' : C.blue + '30'}`,
                  color: shuffled ? C.red : C.blue,
                }}
              >
                {v}°
              </motion.span>
            ))}
          </div>
        </div>
      </InteractiveDemo>
    </div>
  )
}

/* ================================================================
   SECTION 2 — Decomposition: Trend + Seasonality + Residual
================================================================ */
function DecompositionDemo() {
  const [showTrend, setShowTrend] = useState(true)
  const [showSeasonality, setShowSeasonality] = useState(true)
  const [showResidual, setShowResidual] = useState(false)
  const [trendSlope, setTrendSlope] = useState(3)
  const [seasonAmp, setSeasonAmp] = useState(1.2)

  const n = VIB_52.length
  const svgW = 640, svgH = 200
  const pad = { top: 16, right: 20, bottom: 28, left: 40 }
  const innerW = svgW - pad.left - pad.right
  const innerH = svgH - pad.top - pad.bottom

  const trendValues = Array.from({ length: n }, (_, i) =>
    1.5 + (i / n) * trendSlope
  )
  const seasonValues = Array.from({ length: n }, (_, i) =>
    seasonAmp * Math.sin((i / 52) * Math.PI * 2 * 4)
  )
  const weeklyValues = Array.from({ length: n }, (_, i) =>
    0.3 * Math.sin((i / 7) * Math.PI * 2)
  )
  const residualValues = VIB_52.map((v, i) => {
    const reconstructed = trendValues[i] + seasonValues[i] + weeklyValues[i]
    return parseFloat((v - reconstructed + 2).toFixed(3))
  })
  const rawValues = VIB_52

  const allV = [...rawValues, ...trendValues, ...seasonValues.map(v => v + 3), ...residualValues]
  const minV = Math.min(...allV) - 0.3
  const maxV = Math.max(...allV) + 0.3

  const toY = v => pad.top + ((maxV - v) / (maxV - minV)) * innerH
  const toX = i => pad.left + (i / (n - 1)) * innerW

  const makePath = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')

  const rawPath = makePath(rawValues)
  const trendPath = makePath(trendValues)
  const seasonPath = makePath(seasonValues.map(v => v + 3))
  const residualPath = makePath(residualValues)

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div>
      <Neuron mood="explaining" size="small"
        message="A pump's vibration over 12 months contains three hidden signals layered on top of each other. Toggle each layer to peel them apart like an onion."
      />

      {/* Layer toggles */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', margin: '20px 0',
      }}>
        {[
          { label: 'Raw Signal', color: C.purple, active: true, setter: null, forced: true },
          { label: 'Trend', color: C.blue, active: showTrend, setter: setShowTrend },
          { label: 'Seasonality', color: C.orange, active: showSeasonality, setter: setShowSeasonality },
          { label: 'Residual', color: C.gray, active: showResidual, setter: setShowResidual },
        ].map(({ label, color, active, setter, forced }) => (
          <motion.button
            key={label}
            onClick={() => setter && setter(a => !a)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 18px', borderRadius: 20, fontWeight: 700,
              fontSize: 13, cursor: setter ? 'pointer' : 'default',
              background: active ? `${color}18` : 'var(--bg-secondary)',
              border: `2px solid ${active ? color : 'var(--border)'}`,
              color: active ? color : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: active ? color : 'var(--border)',
              display: 'inline-block',
            }} />
            {label}
            {forced && <span style={{ fontSize: 10, opacity: 0.7 }}>(always on)</span>}
          </motion.button>
        ))}
      </div>

      {/* SVG chart */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: 16,
        border: '1px solid var(--border)', overflowX: 'auto',
      }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', width: '100%', maxWidth: svgW }}>
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t}
              x1={pad.left} y1={pad.top + t * innerH}
              x2={pad.left + innerW} y2={pad.top + t * innerH}
              stroke="var(--border)" strokeWidth={0.5} opacity={0.4}
            />
          ))}
          {/* Month labels */}
          {monthLabels.map((m, idx) => (
            <text key={m}
              x={pad.left + (idx / 11) * innerW}
              y={svgH - 8}
              textAnchor="middle" fill="var(--text-muted)" fontSize={9}
            >
              {m}
            </text>
          ))}
          {/* Y axis labels */}
          <text x={pad.left - 6} y={pad.top + 4} textAnchor="end" fill="var(--text-muted)" fontSize={9}>
            {maxV.toFixed(1)}
          </text>
          <text x={pad.left - 6} y={pad.top + innerH} textAnchor="end" fill="var(--text-muted)" fontSize={9}>
            {minV.toFixed(1)}
          </text>
          <text x={6} y={pad.top + innerH / 2} textAnchor="middle" fill="var(--text-muted)"
            fontSize={9} transform={`rotate(-90, 6, ${pad.top + innerH / 2})`}>mm/s</text>

          {/* Raw signal — always visible */}
          <motion.path
            d={rawPath}
            fill="none" stroke={C.purple} strokeWidth={1.5}
            strokeOpacity={0.6} strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Trend */}
          {showTrend && (
            <motion.path
              key="trend"
              d={trendPath}
              fill="none" stroke={C.blue} strokeWidth={2.5}
              strokeDasharray="8 4" strokeLinecap="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Seasonality */}
          {showSeasonality && (
            <motion.path
              key="season"
              d={seasonPath}
              fill="none" stroke={C.orange} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Residual dots */}
          {showResidual && residualValues.map((v, i) => (
            <motion.circle
              key={`r${i}`}
              cx={toX(i)} cy={toY(v)}
              r={2} fill={C.gray} fillOpacity={0.7}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.005 }}
            />
          ))}
        </svg>
      </div>

      {/* Sliders */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20,
      }}>
        <div style={{ padding: '16px 20px', borderRadius: 14, background: `${C.blue}08`, border: `1px solid ${C.blue}25` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Trend Slope (degradation rate)</span>
            <span style={{ fontFamily: 'monospace' }}>{trendSlope}x</span>
          </div>
          <input type="range" min={1} max={6} step={0.5} value={trendSlope}
            onChange={e => setTrendSlope(Number(e.target.value))}
            style={{ width: '100%', accentColor: C.blue }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Higher = pump degrading faster over time
          </div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: 14, background: `${C.orange}08`, border: `1px solid ${C.orange}25` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Seasonality Amplitude</span>
            <span style={{ fontFamily: 'monospace' }}>{seasonAmp}x</span>
          </div>
          <input type="range" min={0.2} max={2.5} step={0.1} value={seasonAmp}
            onChange={e => setSeasonAmp(Number(e.target.value))}
            style={{ width: '100%', accentColor: C.orange }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Day-shift vs. night-shift load variation
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center',
        marginTop: 16, padding: '14px 20px', borderRadius: 12,
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      }}>
        {[
          { color: C.purple, label: 'Raw signal', dash: false },
          { color: C.blue, label: 'Trend (degradation)', dash: true },
          { color: C.orange, label: 'Seasonality (day/week cycle)', dash: false },
          { color: C.gray, label: 'Residual (random noise)', dash: false, dot: true },
        ].map(({ color, label, dash, dot }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-secondary)' }}>
            {dot ? (
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
            ) : (
              <svg width={24} height={4}>
                {dash ? (
                  <line x1={0} y1={2} x2={24} y2={2} stroke={color} strokeWidth={2} strokeDasharray="5 3" />
                ) : (
                  <line x1={0} y1={2} x2={24} y2={2} stroke={color} strokeWidth={2} />
                )}
              </svg>
            )}
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 3 — Rolling Statistics
================================================================ */
function RollingStatsDemo() {
  const [showRaw, setShowRaw] = useState(true)
  const [showMean, setShowMean] = useState(false)
  const [showStd, setShowStd] = useState(false)
  const [showMax, setShowMax] = useState(false)
  const [window, setWindow] = useState(14)

  const data = VIB_90
  const n = data.length

  const rolling = (arr, w, fn) => {
    return arr.map((_, i) => {
      if (i < w - 1) return null
      const slice = arr.slice(i - w + 1, i + 1)
      return fn(slice)
    })
  }

  const rollingMean = rolling(data, window, s => parseFloat((s.reduce((a, b) => a + b, 0) / s.length).toFixed(3)))
  const rollingStd = rolling(data, window, s => {
    const mean = s.reduce((a, b) => a + b, 0) / s.length
    const variance = s.reduce((a, b) => a + (b - mean) ** 2, 0) / s.length
    return parseFloat(Math.sqrt(variance).toFixed(3))
  })
  const rollingMax = rolling(data, window, s => Math.max(...s))

  const svgW = 640, svgH = 200
  const pad = { top: 16, right: 20, bottom: 28, left: 38 }
  const innerW = svgW - pad.left - pad.right
  const innerH = svgH - pad.top - pad.bottom

  const allV = [
    ...(showRaw ? data : []),
    ...(showMean ? rollingMean.filter(v => v !== null) : []),
    ...(showStd ? rollingStd.filter(v => v !== null) : []),
    ...(showMax ? rollingMax.filter(v => v !== null) : []),
    0.5,
  ]
  const minV = Math.min(...allV) - 0.1
  const maxV = Math.max(...allV) + 0.3

  const toY = v => pad.top + ((maxV - v) / (maxV - minV)) * innerH
  const toX = i => pad.left + (i / (n - 1)) * innerW

  const makePoints = (arr) => arr
    .map((v, i) => v !== null ? `${toX(i)},${toY(v)}` : null)
    .filter(Boolean)
    .join(' ')

  // Detect the "alarm zone" where rolling std jumps
  const stdAlarmThreshold = 0.8
  const alarmStart = rollingStd.findIndex(v => v !== null && v > stdAlarmThreshold)

  return (
    <div>
      <Neuron mood="thinking" size="small"
        message="Raw vibration data is noisy. Rolling statistics smooth the noise and reveal what's really happening. Watch what happens to rolling std dev near day 70 — that's a degradation signal!"
      />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '18px 0 14px' }}>
        {[
          { label: 'Raw Data', color: C.purple, state: showRaw, setter: setShowRaw },
          { label: 'Rolling Mean', color: C.blue, state: showMean, setter: setShowMean },
          { label: 'Rolling Std Dev', color: C.red, state: showStd, setter: setShowStd },
          { label: 'Rolling Max', color: C.orange, state: showMax, setter: setShowMax },
        ].map(({ label, color, state, setter }) => (
          <motion.button
            key={label}
            onClick={() => setter(s => !s)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '7px 16px', borderRadius: 20, fontWeight: 700,
              fontSize: 12, cursor: 'pointer',
              background: state ? `${color}18` : 'var(--bg-secondary)',
              border: `2px solid ${state ? color : 'var(--border)'}`,
              color: state ? color : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: state ? color : 'var(--border)',
              display: 'inline-block',
            }} />
            {label}
          </motion.button>
        ))}
        {/* Window slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Window:</span>
          {[7, 14, 30].map(w => (
            <motion.button
              key={w}
              onClick={() => setWindow(w)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '5px 12px', borderRadius: 10, fontWeight: 700,
                fontSize: 12, cursor: 'pointer',
                background: window === w ? `${C.cyan}18` : 'var(--bg-secondary)',
                border: `2px solid ${window === w ? C.cyan : 'var(--border)'}`,
                color: window === w ? C.cyan : 'var(--text-muted)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {w}d
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: 16,
        border: '1px solid var(--border)', overflowX: 'auto', position: 'relative',
      }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', width: '100%', maxWidth: svgW }}>
          {/* Alarm zone highlight */}
          {showStd && alarmStart > 0 && (
            <motion.rect
              x={toX(alarmStart)} y={pad.top}
              width={innerW - (toX(alarmStart) - pad.left)}
              height={innerH}
              fill={`${C.red}08`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
          )}
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t}
              x1={pad.left} y1={pad.top + t * innerH}
              x2={pad.left + innerW} y2={pad.top + t * innerH}
              stroke="var(--border)" strokeWidth={0.5} opacity={0.4}
            />
          ))}
          {/* Day labels */}
          {[0, 30, 60, 89].map(d => (
            <text key={d} x={toX(d)} y={svgH - 6}
              textAnchor={d === 89 ? 'end' : d === 0 ? 'start' : 'middle'}
              fill="var(--text-muted)" fontSize={9}
            >
              Day {d + 1}
            </text>
          ))}
          <text x={6} y={pad.top + innerH / 2} textAnchor="middle" fill="var(--text-muted)"
            fontSize={9} transform={`rotate(-90, 6, ${pad.top + innerH / 2})`}>mm/s</text>

          {/* Raw data */}
          {showRaw && (
            <motion.polyline
              points={makePoints(data)}
              fill="none" stroke={C.purple} strokeWidth={1}
              strokeOpacity={0.45} strokeLinecap="round" strokeLinejoin="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Rolling mean */}
          {showMean && (
            <motion.polyline
              key={`mean-${window}`}
              points={makePoints(rollingMean)}
              fill="none" stroke={C.blue} strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Rolling std */}
          {showStd && (
            <motion.polyline
              key={`std-${window}`}
              points={makePoints(rollingStd)}
              fill="none" stroke={C.red} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Rolling max */}
          {showMax && (
            <motion.polyline
              key={`max-${window}`}
              points={makePoints(rollingMax)}
              fill="none" stroke={C.orange} strokeWidth={2}
              strokeDasharray="5 3" strokeLinecap="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Alarm annotation */}
          {showStd && alarmStart > 0 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <line
                x1={toX(alarmStart)} y1={pad.top}
                x2={toX(alarmStart)} y2={pad.top + innerH}
                stroke={C.red} strokeWidth={1.5} strokeDasharray="4 3"
              />
              <rect x={toX(alarmStart) - 50} y={pad.top + 4} width={80} height={18} rx={4}
                fill={`${C.red}18`} stroke={`${C.red}40`} strokeWidth={1} />
              <text x={toX(alarmStart) - 10} y={pad.top + 16}
                textAnchor="middle" fill={C.red} fontSize={9} fontWeight="bold"
              >
                Std Dev rising!
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {showStd && (
        <NeuronTip type="warning">
          When rolling std dev suddenly increases, variability in the machine's behavior is growing —
          something is changing inside. This is a classic early-warning degradation signal, often appearing
          14–21 days before a visible failure.
        </NeuronTip>
      )}
    </div>
  )
}

/* ================================================================
   SECTION 4 — Stationarity
================================================================ */
function StationarityDemo() {
  const [testTarget, setTestTarget] = useState(null)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState(null)

  const n = 60
  const svgW = 280, svgH = 160
  const pad = { top: 14, right: 14, bottom: 22, left: 32 }
  const innerW = svgW - pad.left - pad.right
  const innerH = svgH - pad.top - pad.bottom

  // Stationary: constant mean & variance
  const rng1 = seededRandom(100)
  const stationaryData = Array.from({ length: n }, () =>
    parseFloat((2.5 + (rng1() - 0.5) * 0.8).toFixed(3))
  )

  // Non-stationary: rising mean + increasing variance
  const rng2 = seededRandom(200)
  const nonStationaryData = Array.from({ length: n }, (_, i) =>
    parseFloat((1.5 + (i / n) * 3.5 + (rng2() - 0.5) * (0.5 + (i / n) * 2.5)).toFixed(3))
  )

  const seriesConfig = {
    stationary: {
      data: stationaryData,
      label: 'Healthy Pump',
      color: C.green,
      icon: '',
      badge: 'Stationary',
      badgeColor: C.green,
      result: {
        pValue: '0.0023',
        adfStat: '-5.82',
        verdict: 'Stationary',
        detail: 'p < 0.05 — We can reject the null hypothesis. The series is stationary.',
        ok: true,
      },
    },
    nonStationary: {
      data: nonStationaryData,
      label: 'Degrading Pump',
      color: C.red,
      icon: '',
      badge: 'Non-Stationary',
      badgeColor: C.red,
      result: {
        pValue: '0.2847',
        adfStat: '-1.24',
        verdict: 'Non-Stationary!',
        detail: 'p > 0.05 — Cannot reject null hypothesis. Differencing needed.',
        ok: false,
      },
    },
  }

  const runTest = (target) => {
    setTestTarget(target)
    setTesting(true)
    setResult(null)
    setTimeout(() => {
      setTesting(false)
      setResult(seriesConfig[target].result)
    }, 1400)
  }

  const renderChart = (dataArr, cfg) => {
    const minV = Math.min(...dataArr) - 0.2
    const maxV = Math.max(...dataArr) + 0.2
    const toY = v => pad.top + ((maxV - v) / (maxV - minV)) * innerH
    const toX = i => pad.left + (i / (n - 1)) * innerW

    const pts = dataArr.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
    const meanVal = dataArr.reduce((a, b) => a + b, 0) / dataArr.length
    const meanY = toY(meanVal)

    return (
      <div style={{
        flex: 1, background: 'var(--bg-card)', borderRadius: 16,
        border: `2px solid ${cfg.color}30`, padding: 16,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            {cfg.label}
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 8, fontWeight: 700, fontSize: 11,
            background: `${cfg.badgeColor}18`, border: `1px solid ${cfg.badgeColor}40`,
            color: cfg.badgeColor,
          }}>
            {cfg.badge}
          </span>
        </div>
        <svg width={svgW} height={svgH} style={{ display: 'block', width: '100%', maxWidth: svgW }}>
          {/* Grid */}
          {[0, 0.5, 1].map(t => (
            <line key={t}
              x1={pad.left} y1={pad.top + t * innerH}
              x2={pad.left + innerW} y2={pad.top + t * innerH}
              stroke="var(--border)" strokeWidth={0.5} opacity={0.5}
            />
          ))}
          {/* Mean line */}
          <line x1={pad.left} y1={meanY} x2={pad.left + innerW} y2={meanY}
            stroke={cfg.color} strokeWidth={1.5} strokeDasharray="6 3" opacity={0.6}
          />
          <text x={pad.left + innerW + 2} y={meanY + 3}
            fontSize={8} fill={cfg.color} fontWeight="bold">μ</text>
          {/* Data */}
          <motion.polyline
            points={pts} fill="none" stroke={cfg.color}
            strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0.9}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}
          />
          {/* Axis */}
          <text x={pad.left} y={svgH - 5} fontSize={8} fill="var(--text-muted)">Day 1</text>
          <text x={pad.left + innerW} y={svgH - 5} textAnchor="end" fontSize={8} fill="var(--text-muted)">Day 60</text>
        </svg>
        <motion.button
          onClick={() => runTest(cfg.label === 'Healthy Pump' ? 'stationary' : 'nonStationary')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '100%', padding: '10px', marginTop: 12, borderRadius: 10,
            background: `${cfg.color}12`, border: `2px solid ${cfg.color}40`,
            color: cfg.color, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Run ADF Test
        </motion.button>
      </div>
    )
  }

  const cfg_s = seriesConfig.stationary
  const cfg_n = seriesConfig.nonStationary

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        {renderChart(stationaryData, cfg_s)}
        {renderChart(nonStationaryData, cfg_n)}
      </div>

      {/* ADF Result */}
      <AnimatePresence>
        {testing && (
          <motion.div
            key="testing"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              padding: '20px', textAlign: 'center', borderRadius: 14,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `3px solid var(--border)`, borderTop: `3px solid ${C.blue}`,
                display: 'inline-block', marginBottom: 10,
              }}
            />
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Computing Augmented Dickey-Fuller statistic...
            </div>
          </motion.div>
        )}

        {result && !testing && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 24, borderRadius: 16,
              background: result.ok ? `${C.green}08` : `${C.red}08`,
              border: `2px solid ${result.ok ? C.green : C.red}30`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: result.ok ? `${C.green}20` : `${C.red}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {result.ok ? '' : ''}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: result.ok ? C.green : C.red }}>
                  {result.verdict}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {result.detail}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'ADF Statistic', val: result.adfStat },
                { label: 'p-value', val: result.pValue },
                { label: 'Critical (5%)', val: '-3.45' },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                  <div style={{
                    fontFamily: 'monospace', fontWeight: 800, fontSize: 18,
                    color: result.ok ? C.green : C.red, marginTop: 2,
                  }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>

            {!result.ok && (
              <div style={{
                marginTop: 16, padding: '14px 18px', borderRadius: 10,
                background: 'var(--bg-card)', border: `1px solid ${C.orange}30`,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.orange, marginBottom: 8 }}>
                  Fix: Apply First-Order Differencing
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {'diff_series[t] = series[t] — series[t-1]'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Removes the trend by computing day-over-day change. The differenced series becomes stationary.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <HindiExplainer
        concept="Stationarity — स्थिरता"
        english="Stationarity"
        explanation="एक time series 'stationary' है जब उसका mean और variance time के साथ change नहीं होता। जैसे एक healthy pump का vibration — हर दिन लगभग same रहता है। Non-stationary series में mean बढ़ता या घटता रहता है — जैसे degrading pump का। ML models stationary data पर ज़्यादा अच्छे काम करते हैं।"
        example="सोचो एक पुराना पंखा — जब वो healthy था, उसकी आवाज़ हर दिन same थी (stationary)। जब bearing घिसने लगती है, आवाज़ धीरे-धीरे बढ़ती है (non-stationary). ADF test यही detect करता है।"
        terms={[
          { hindi: 'स्थिरता', english: 'Stationarity', meaning: 'mean और variance time के साथ constant रहना' },
          { hindi: 'अंतर करना', english: 'Differencing', meaning: 'series[t] - series[t-1] — trend हटाने का तरीका' },
          { hindi: 'p-value', english: 'p-value', meaning: '0.05 से कम = stationary; ज़्यादा = non-stationary' },
        ]}
      />
    </div>
  )
}

/* ================================================================
   SECTION 5 — Lag Features & Autocorrelation
================================================================ */
function LagAutocorrelation() {
  const [selectedLag, setSelectedLag] = useState(1)
  const [hoveredLag, setHoveredLag] = useState(null)

  const n = 60
  const rng = seededRandom(333)
  const series = Array.from({ length: n }, (_, i) => {
    const base = 2.8 + Math.sin((i / 14) * Math.PI * 2) * 0.5
    const ar = i > 0 ? 0 : 0
    const noise = (rng() - 0.5) * 0.4
    return parseFloat((base + noise + ar).toFixed(3))
  })

  // Compute autocorrelation for lags 1-30
  const maxLag = 30
  const mean = series.reduce((a, b) => a + b, 0) / n
  const variance = series.reduce((a, b) => a + (b - mean) ** 2, 0) / n

  const acfValues = Array.from({ length: maxLag }, (_, lagIdx) => {
    const lag = lagIdx + 1
    let cov = 0
    for (let t = lag; t < n; t++) {
      cov += (series[t] - mean) * (series[t - lag] - mean)
    }
    cov /= (n - lag)
    return parseFloat((cov / variance).toFixed(4))
  })

  // Scatter plot for selected lag
  const svgScW = 200, svgScH = 200
  const scPad = 30
  const laggedPairs = series.slice(selectedLag).map((v, i) => [v, series[i]])
  const scMin = Math.min(...series) - 0.2
  const scMax = Math.max(...series) + 0.2
  const toScX = v => scPad + ((v - scMin) / (scMax - scMin)) * (svgScW - scPad * 2)
  const toScY = v => svgScH - scPad - ((v - scMin) / (scMax - scMin)) * (svgScH - scPad * 2)

  // ACF bar chart
  const barW = 600, barH = 140
  const barPad = { top: 14, right: 20, bottom: 30, left: 36 }
  const innerBW = barW - barPad.left - barPad.right
  const innerBH = barH - barPad.top - barPad.bottom
  const maxAcf = 1
  const toBarY = v => barPad.top + ((maxAcf - v) / (2 * maxAcf)) * innerBH
  const zeroY = toBarY(0)
  const barWidth = innerBW / maxLag - 2
  const confInterval = 1.96 / Math.sqrt(n)

  return (
    <div>
      <Neuron mood="explaining" size="small"
        message="Autocorrelation answers: 'How similar is today's value to yesterday's? To last week's?' Strong autocorrelation means the machine is predictable. Fading autocorrelation means it's becoming erratic — a degradation warning."
      />

      {/* ACF bar chart */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: 16,
        border: '1px solid var(--border)', marginTop: 18, overflowX: 'auto',
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14,
          color: 'var(--text-primary)', marginBottom: 10,
        }}>
          Autocorrelation Function (ACF) — Click any bar to inspect
        </div>
        <svg width={barW} height={barH} style={{ display: 'block', width: '100%', maxWidth: barW }}>
          {/* Confidence bands */}
          <rect
            x={barPad.left} y={toBarY(confInterval)}
            width={innerBW} height={toBarY(-confInterval) - toBarY(confInterval)}
            fill={`${C.blue}08`}
          />
          <line x1={barPad.left} y1={toBarY(confInterval)}
            x2={barPad.left + innerBW} y2={toBarY(confInterval)}
            stroke={C.blue} strokeWidth={1} strokeDasharray="4 3" opacity={0.6}
          />
          <line x1={barPad.left} y1={toBarY(-confInterval)}
            x2={barPad.left + innerBW} y2={toBarY(-confInterval)}
            stroke={C.blue} strokeWidth={1} strokeDasharray="4 3" opacity={0.6}
          />
          {/* Zero line */}
          <line x1={barPad.left} y1={zeroY}
            x2={barPad.left + innerBW} y2={zeroY}
            stroke="var(--border)" strokeWidth={1}
          />
          {/* Bars */}
          {acfValues.map((v, i) => {
            const lag = i + 1
            const barX = barPad.left + (i / maxLag) * innerBW + 1
            const barYTop = v >= 0 ? toBarY(v) : zeroY
            const barHeight = Math.abs(toBarY(v) - zeroY)
            const isSelected = lag === selectedLag
            const isHovered = lag === hoveredLag
            const isSignificant = Math.abs(v) > confInterval

            return (
              <motion.rect
                key={lag}
                x={barX} y={barYTop - (v >= 0 ? 0 : barHeight)}
                width={barWidth} height={Math.max(barHeight, 1)}
                fill={isSelected ? C.orange : isSignificant ? C.blue : C.gray}
                fillOpacity={isHovered ? 1 : isSelected ? 1 : 0.75}
                rx={2}
                onClick={() => setSelectedLag(lag)}
                onMouseEnter={() => setHoveredLag(lag)}
                onMouseLeave={() => setHoveredLag(null)}
                style={{ cursor: 'pointer' }}
                whileHover={{ scaleY: 1.1 }}
              />
            )
          })}
          {/* Lag labels */}
          {[1, 7, 14, 21, 28].map(lag => (
            <text key={lag}
              x={barPad.left + ((lag - 1) / maxLag) * innerBW + barWidth / 2}
              y={barH - 6} textAnchor="middle" fill="var(--text-muted)" fontSize={9}
            >
              {lag}
            </text>
          ))}
          <text x={barPad.left - 4} y={toBarY(1) + 4} textAnchor="end" fill="var(--text-muted)" fontSize={8}>1.0</text>
          <text x={barPad.left - 4} y={zeroY + 4} textAnchor="end" fill="var(--text-muted)" fontSize={8}>0</text>
          <text x={barPad.left - 4} y={toBarY(-1) + 4} textAnchor="end" fill="var(--text-muted)" fontSize={8}>-1</text>
          <text x={barPad.left + innerBW / 2} y={barH - 2} textAnchor="middle" fill="var(--text-muted)" fontSize={9}>Lag (days)</text>
          {/* Blue confidence band label */}
          <text x={barPad.left + innerBW + 4} y={toBarY(confInterval) + 4} fill={C.blue} fontSize={8}>+95%</text>
          <text x={barPad.left + innerBW + 4} y={toBarY(-confInterval) + 4} fill={C.blue} fontSize={8}>-95%</text>
        </svg>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          Blue bars = significant correlation (outside 95% confidence band). Orange = currently selected lag.
        </div>
      </div>

      {/* Scatter plot for selected lag */}
      <div style={{
        display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 18, flexWrap: 'wrap',
      }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 14, padding: 16,
          border: `2px solid ${C.orange}30`, flex: '0 0 auto',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
            color: C.orange, marginBottom: 10,
          }}>
            Lag-{selectedLag} Scatter Plot
          </div>
          <svg width={svgScW} height={svgScH}>
            {/* Grid */}
            {[scPad, svgScW / 2, svgScW - scPad].map(x => (
              <line key={x} x1={x} y1={scPad} x2={x} y2={svgScH - scPad}
                stroke="var(--border)" strokeWidth={0.5} opacity={0.5} />
            ))}
            {[scPad, svgScH / 2, svgScH - scPad].map(y => (
              <line key={y} x1={scPad} y1={y} x2={svgScW - scPad} y2={y}
                stroke="var(--border)" strokeWidth={0.5} opacity={0.5} />
            ))}
            {/* Trend line */}
            <line
              x1={toScX(scMin + 0.1)} y1={toScY(scMin + 0.1)}
              x2={toScX(scMax - 0.1)} y2={toScY(scMax - 0.1)}
              stroke={C.orange} strokeWidth={1.5} strokeDasharray="5 3" opacity={0.5}
            />
            {/* Points */}
            {laggedPairs.map(([y, x], i) => (
              <motion.circle
                key={i} cx={toScX(x)} cy={toScY(y)}
                r={3} fill={C.blue} fillOpacity={0.55}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: i * 0.01 }}
              />
            ))}
            <text x={svgScW / 2} y={svgScH - 4} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
              Value at t-{selectedLag}
            </text>
            <text x={8} y={svgScH / 2} textAnchor="middle" fontSize={9} fill="var(--text-muted)"
              transform={`rotate(-90, 8, ${svgScH / 2})`}>
              Value at t
            </text>
          </svg>
        </div>

        {/* Lag interpretation */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            padding: '18px 22px', borderRadius: 14,
            background: `${C.orange}08`, border: `2px solid ${C.orange}25`,
            marginBottom: 14,
          }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: C.orange, marginBottom: 8 }}>
              Lag-{selectedLag}: ACF = {acfValues[selectedLag - 1]?.toFixed(3)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {Math.abs(acfValues[selectedLag - 1] || 0) > confInterval
                ? `Strong correlation! Today's vibration is significantly related to vibration ${selectedLag} day(s) ago.`
                : `Weak correlation at lag ${selectedLag}. This day offset doesn't show a strong pattern.`
              }
            </div>
          </div>

          <div style={{
            padding: '16px 20px', borderRadius: 14,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
              Lag Feature Interpretations
            </div>
            {[
              { lag: 1, meaning: 'Yesterday vs today — strong in healthy machines (smooth progression)', color: C.green },
              { lag: 7, meaning: 'Weekly pattern — maintenance done every Sunday?', color: C.blue },
              { lag: 14, meaning: 'Bi-weekly cycle — shift rotation or inspection schedule', color: C.purple },
            ].map(({ lag, meaning, color }) => (
              <motion.div
                key={lag}
                onClick={() => setSelectedLag(lag)}
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  background: selectedLag === lag ? `${color}10` : 'transparent',
                  border: `1px solid ${selectedLag === lag ? color + '30' : 'transparent'}`,
                  marginBottom: 6,
                }}
              >
                <span style={{
                  minWidth: 40, height: 22, borderRadius: 6,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace', fontWeight: 800, fontSize: 12, color,
                }}>
                  Lag-{lag}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{meaning}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <NeuronTip type="tip">
        In PdM, we extract lag features like lag-1, lag-7, lag-14 as INPUT COLUMNS to our ML model.
        If lag-1 correlation is dropping over time, the machine is becoming less predictable — an early warning signal.
        Tools like <strong>pandas.DataFrame.shift()</strong> make this trivial.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 6 — Windowing for Feature Extraction
================================================================ */
function WindowingDemo() {
  const [windowSize, setWindowSize] = useState(14)
  const [windowPos, setWindowPos] = useState(0)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef(null)

  const data = VIB_180
  const n = data.length
  const maxPos = n - windowSize

  const startPlay = () => setPlaying(true)
  const stopPlay = () => { setPlaying(false); clearInterval(intervalRef.current) }

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setWindowPos(p => {
          if (p >= maxPos - 1) { setPlaying(false); return maxPos - 1 }
          return p + 1
        })
      }, 80)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, maxPos])

  useEffect(() => {
    setWindowPos(0)
    setPlaying(false)
  }, [windowSize])

  // Compute features for current window
  const windowSlice = data.slice(windowPos, windowPos + windowSize)
  const mean = parseFloat((windowSlice.reduce((a, b) => a + b, 0) / windowSlice.length).toFixed(3))
  const std = parseFloat(Math.sqrt(windowSlice.reduce((a, b) => a + (b - mean) ** 2, 0) / windowSlice.length).toFixed(3))
  const maxV = parseFloat(Math.max(...windowSlice).toFixed(3))
  const minV = parseFloat(Math.min(...windowSlice).toFixed(3))

  // Slope via linear regression
  const xBar = (windowSize - 1) / 2
  const slope = parseFloat((windowSlice.reduce((acc, v, i) => acc + (i - xBar) * (v - mean), 0) /
    windowSlice.reduce((acc, _, i) => acc + (i - xBar) ** 2, 0)).toFixed(4))

  const isFailureZone = windowPos > 140

  // Chart
  const svgW = 640, svgH = 180
  const pad = { top: 14, right: 18, bottom: 26, left: 36 }
  const innerW = svgW - pad.left - pad.right
  const innerH = svgH - pad.top - pad.bottom

  const dMin = Math.min(...data) - 0.3
  const dMax = Math.max(...data) + 0.5
  const toY = v => pad.top + ((dMax - v) / (dMax - dMin)) * innerH
  const toX = i => pad.left + (i / (n - 1)) * innerW

  const allPts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const winPts = windowSlice.map((v, i) => `${toX(i + windowPos)},${toY(v)}`).join(' ')

  const featureHistory = Array.from({ length: maxPos }, (_, p) => {
    const s = data.slice(p, p + windowSize)
    const m = s.reduce((a, b) => a + b, 0) / s.length
    const sd = Math.sqrt(s.reduce((a, b) => a + (b - m) ** 2, 0) / s.length)
    return { mean: m, std: sd }
  })

  return (
    <div>
      <Neuron mood="excited" size="small"
        message="Sliding window transforms your raw time series into feature vectors. Each window position gives you a row of features for your ML model. Watch how the features change as we slide into the failure zone!"
      />

      {/* Window controls */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', margin: '18px 0 14px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Window:</span>
          {[7, 14, 30].map(w => (
            <motion.button key={w} onClick={() => setWindowSize(w)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                padding: '6px 14px', borderRadius: 10, fontWeight: 700,
                fontSize: 12, cursor: 'pointer',
                background: windowSize === w ? `${C.indigo}18` : 'var(--bg-secondary)',
                border: `2px solid ${windowSize === w ? C.indigo : 'var(--border)'}`,
                color: windowSize === w ? C.indigo : 'var(--text-muted)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {w} days
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
          <input type="range" min={0} max={maxPos - 1} value={windowPos}
            onChange={e => { stopPlay(); setWindowPos(Number(e.target.value)) }}
            style={{ width: 180, accentColor: C.indigo }}
          />
          <motion.button
            onClick={playing ? stopPlay : startPlay}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              padding: '7px 16px', borderRadius: 10, fontWeight: 700,
              fontSize: 12, cursor: 'pointer',
              background: playing ? `${C.red}18` : `${C.green}18`,
              border: `2px solid ${playing ? C.red : C.green}`,
              color: playing ? C.red : C.green,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {playing ? 'Pause' : 'Play'}
          </motion.button>
          <motion.button
            onClick={() => { stopPlay(); setWindowPos(0) }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              padding: '7px 14px', borderRadius: 10, fontWeight: 700,
              fontSize: 12, cursor: 'pointer',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontFamily: 'var(--font-heading)',
            }}
          >
            Reset
          </motion.button>
        </div>
      </div>

      {/* Main chart */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: 16,
        border: '1px solid var(--border)', overflowX: 'auto', position: 'relative',
      }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', width: '100%', maxWidth: svgW }}>
          {/* Failure zone background */}
          <rect
            x={toX(140)} y={pad.top}
            width={toX(179) - toX(140)} height={innerH}
            fill={`${C.red}07`}
          />
          <text x={toX(158)} y={pad.top + 10} textAnchor="middle"
            fontSize={9} fill={C.red} fontWeight="bold">Pre-failure zone</text>

          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t}
              x1={pad.left} y1={pad.top + t * innerH}
              x2={pad.left + innerW} y2={pad.top + t * innerH}
              stroke="var(--border)" strokeWidth={0.5} opacity={0.4}
            />
          ))}

          {/* Day labels */}
          {[0, 30, 60, 90, 120, 150, 179].map(d => (
            <text key={d}
              x={toX(d)} y={svgH - 6}
              textAnchor={d === 0 ? 'start' : d === 179 ? 'end' : 'middle'}
              fontSize={9} fill="var(--text-muted)"
            >
              Day {d}
            </text>
          ))}
          <text x={6} y={pad.top + innerH / 2} textAnchor="middle" fill="var(--text-muted)"
            fontSize={9} transform={`rotate(-90, 6, ${pad.top + innerH / 2})`}>mm/s</text>

          {/* All data (dimmed) */}
          <polyline
            points={allPts} fill="none" stroke={C.gray}
            strokeWidth={1} strokeOpacity={0.3}
          />

          {/* Window highlight background */}
          <motion.rect
            animate={{
              x: toX(windowPos),
              width: toX(windowPos + windowSize - 1) - toX(windowPos),
            }}
            transition={{ duration: 0.05 }}
            y={pad.top} height={innerH}
            fill={`${isFailureZone ? C.red : C.indigo}15`}
            stroke={isFailureZone ? C.red : C.indigo}
            strokeWidth={1.5}
            rx={3}
          />

          {/* Window data line */}
          <motion.polyline
            key={`${windowPos}-${windowSize}`}
            points={winPts} fill="none"
            stroke={isFailureZone ? C.red : C.indigo}
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          />

          {/* Window position indicators */}
          <motion.line
            animate={{ x1: toX(windowPos), x2: toX(windowPos) }}
            y1={pad.top} y2={pad.top + innerH}
            stroke={isFailureZone ? C.red : C.indigo}
            strokeWidth={1.5} strokeDasharray="4 2"
          />
          <motion.line
            animate={{
              x1: toX(windowPos + windowSize - 1),
              x2: toX(windowPos + windowSize - 1),
            }}
            y1={pad.top} y2={pad.top + innerH}
            stroke={isFailureZone ? C.red : C.indigo}
            strokeWidth={1.5} strokeDasharray="4 2"
          />
        </svg>
      </div>

      {/* Current window position info */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap',
      }}>
        <span style={{
          padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: `${isFailureZone ? C.red : C.indigo}15`,
          border: `1px solid ${isFailureZone ? C.red : C.indigo}30`,
          color: isFailureZone ? C.red : C.indigo,
          fontFamily: 'monospace',
        }}>
          Window: Day {windowPos + 1} — {windowPos + windowSize}
        </span>
        {isFailureZone && (
          <motion.span
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: `${C.red}18`, border: `1px solid ${C.red}40`, color: C.red,
            }}
          >
            Pre-failure zone detected!
          </motion.span>
        )}
      </div>

      {/* Feature vector output */}
      <div style={{
        marginTop: 18, padding: '18px 22px', borderRadius: 16,
        background: isFailureZone ? `${C.red}08` : 'var(--bg-secondary)',
        border: `2px solid ${isFailureZone ? C.red : 'var(--border)'}`,
        transition: 'all 0.3s',
      }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>
          Extracted Feature Vector (this window becomes one ML model input row)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[
            { label: 'mean', value: mean, color: C.blue, unit: 'mm/s', icon: '' },
            { label: 'std', value: std, color: C.orange, unit: 'mm/s', icon: '' },
            { label: 'max', value: maxV, color: C.red, unit: 'mm/s', icon: '' },
            { label: 'min', value: minV, color: C.green, unit: 'mm/s', icon: '' },
            { label: 'slope', value: slope, color: C.purple, unit: '/day', icon: '' },
          ].map(({ label, value, color, unit, icon }) => (
            <motion.div
              key={label}
              layout
              style={{
                padding: '12px 18px', borderRadius: 12,
                background: 'var(--bg-card)', border: `2px solid ${color}30`,
                minWidth: 90, textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                {icon} {label}
              </div>
              <motion.div
                key={`${label}-${windowPos}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  fontFamily: 'monospace', fontWeight: 900, fontSize: 18,
                  color: color,
                }}
              >
                {value}
              </motion.div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{unit}</div>
            </motion.div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, fontFamily: 'monospace' }}>
          {'[' + [mean, std, maxV, minV, slope].join(', ') + '] → model.predict(X)'}
        </div>
      </div>

      {/* Feature history mini-chart */}
      <div style={{
        marginTop: 18, padding: 16, borderRadius: 14,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
          Feature History (how mean and std evolve as window slides across all 180 days)
        </div>
        <svg width={svgW} height={80} style={{ display: 'block', width: '100%', maxWidth: svgW }}>
          {(() => {
            const fw = 640, fh = 80
            const fp = { top: 8, right: 18, bottom: 18, left: 36 }
            const fiw = fw - fp.left - fp.right
            const fih = fh - fp.top - fp.bottom
            const allMeans = featureHistory.map(f => f.mean)
            const allStds = featureHistory.map(f => f.std)
            const allVals = [...allMeans, ...allStds]
            const fMin = Math.min(...allVals)
            const fMax = Math.max(...allVals)
            const fy = v => fp.top + ((fMax - v) / (fMax - fMin)) * fih
            const fx = i => fp.left + (i / (featureHistory.length - 1)) * fiw

            return (
              <>
                {/* Failure zone */}
                <rect x={fx(140)} y={fp.top} width={fx(179) - fx(140)} height={fih} fill={`${C.red}08`} />
                {/* Mean line */}
                <polyline
                  points={allMeans.map((v, i) => `${fx(i)},${fy(v)}`).join(' ')}
                  fill="none" stroke={C.blue} strokeWidth={1.5}
                />
                {/* Std line */}
                <polyline
                  points={allStds.map((v, i) => `${fx(i)},${fy(v)}`).join(' ')}
                  fill="none" stroke={C.orange} strokeWidth={1.5}
                />
                {/* Current position indicator */}
                <motion.line
                  animate={{ x1: fx(windowPos), x2: fx(windowPos) }}
                  transition={{ duration: 0.05 }}
                  y1={fp.top} y2={fp.top + fih}
                  stroke={C.indigo} strokeWidth={1.5} strokeDasharray="3 2"
                />
                {/* Labels */}
                <text x={fp.left} y={fh - 4} fontSize={8} fill="var(--text-muted)">Day 1</text>
                <text x={fp.left + fiw} y={fh - 4} textAnchor="end" fontSize={8} fill="var(--text-muted)">Day 180</text>
              </>
            )
          })()}
        </svg>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 16, height: 2, background: C.blue, display: 'inline-block' }} />
            Rolling mean
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 16, height: 2, background: C.orange, display: 'inline-block' }} />
            Rolling std
          </span>
        </div>
      </div>

      <NeuronTip type="example">
        In production PdM code: <br />
        <code style={{ fontFamily: 'monospace', fontSize: 13 }}>
          {'df["vib_mean_14d"] = df["vibration"].rolling(14).mean()'}
          <br />
          {'df["vib_std_14d"]  = df["vibration"].rolling(14).std()'}
          <br />
          {'df["vib_max_14d"]  = df["vibration"].rolling(14).max()'}
        </code>
        <br />
        These three lines create three powerful features. Repeat for each sensor. Your feature matrix is ready.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */
function HindiSummary() {
  const terms = [
    { hindi: 'समय श्रृंखला', english: 'Time Series', meaning: 'वो data जो time के साथ collect होता है — order बहुत important है' },
    { hindi: 'प्रवृत्ति', english: 'Trend', meaning: 'समय के साथ धीरे-धीरे बढ़ना या घटना — जैसे pump की wear बढ़ना' },
    { hindi: 'मौसमी', english: 'Seasonality', meaning: 'बार-बार दोहराने वाला pattern — जैसे हर हफ्ते या हर दिन का cycle' },
    { hindi: 'स्थिरता', english: 'Stationarity', meaning: 'mean और variance constant रहना — healthy machine की पहचान' },
    { hindi: 'चलती औसत', english: 'Rolling Mean', meaning: 'एक sliding window का average — noise हटाने का सबसे simple तरीका' },
    { hindi: 'विलंब', english: 'Lag', meaning: 'आज का value vs. N दिन पहले का value — autocorrelation की basis' },
    { hindi: 'खिड़की', english: 'Window', meaning: 'एक fixed time block जिससे features निकाले जाते हैं — ML input बनाने का तरीका' },
  ]

  return (
    <div>
      <Neuron mood="waving" size="medium"
        message="Time series के 7 key concepts सीख लिए! Trend बताता है machine कितनी तेज़ी से degrade हो रही है। Seasonality बताती है regular cycles क्या हैं। Stationarity check करता है data ML के लिए ready है या नहीं। Rolling stats और lag features — यही आपके ML model के inputs बनते हैं। अगले topic में हम ETL pipeline बनाएंगे जो यह सब automatically compute करती है।"
      />

      <div style={{ marginTop: 24 }}>
        <HindiExplainer
          concept="समय श्रृंखला — Time Series for Machines"
          english="Time Series Analysis in Predictive Maintenance"
          explanation="Machine data time-ordered होता है — जैसे pump की vibration readings हर minute आती हैं। यह regular tabular data से अलग है क्योंकि यहाँ order matter करता है — अगर readings shuffle करो तो pattern गायब हो जाता है। Time series में तीन hidden components होते हैं: Trend (धीरे-धीरे बढ़ना = degradation), Seasonality (repeating cycles = day/week pattern), और Residual (random noise)। Stationarity check करता है कि mean और variance stable हैं या नहीं — अगर नहीं हैं तो differencing करनी पड़ती है। Rolling statistics (mean, std, max) noise को smooth करते हैं और early warning signals देते हैं। Lag features बताते हैं कि आज का value पहले के values से कितना related है। Window-based features इन सब को combine करके ML model के लिए input rows बनाते हैं।"
          example="सोचो एक doctor patient की heartbeat monitor कर रहा है। Heartbeat का graph time series है। Normal heartbeat stationary है — हर minute same pace. अगर pace धीरे-धीरे बढ़ रही है (trend), या हर 30 seconds में एक spike आती है (seasonality), तो doctor को पता चल जाता है कुछ गड़बड़ है। Rolling mean देता है 'average pace last 5 minutes में' — sudden change = alarm. Yahi predictive maintenance में होता है machines के साथ।"
          terms={terms}
        />
      </div>

      {/* Key concepts recap */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14, marginTop: 24,
      }}>
        {[
          { icon: '', title: 'Order Matters', desc: 'Shuffling a time series destroys all information — unlike tabular data', color: C.blue },
          { icon: '', title: 'Decomposition', desc: 'Any time series = Trend + Seasonality + Residual', color: C.orange },
          { icon: '', title: 'Rolling Stats', desc: 'Smooth noise, reveal signals. Rising std dev = degradation.', color: C.red },
          { icon: '', title: 'Stationarity', desc: 'ADF test tells you if differencing is needed before modeling', color: C.green },
          { icon: '', title: 'Autocorrelation', desc: 'Fading ACF = machine becoming unpredictable = danger sign', color: C.purple },
          { icon: '', title: 'Windowing', desc: 'Sliding window extracts feature rows from the raw series', color: C.cyan },
        ].map(({ icon, title, desc, color }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, boxShadow: `0 8px 24px ${color}22` }}
            style={{
              padding: '18px 20px', borderRadius: 16,
              background: `${color}08`, border: `2px solid ${color}25`,
              cursor: 'default', transition: 'box-shadow 0.3s',
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color, marginBottom: 6 }}>
              {title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {desc}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic4Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 48px' }}>

      {/* Hero intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #6366f108, #8b5cf608)',
          border: '1.5px solid #6366f125',
          borderRadius: 20, padding: '28px 32px', marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 42 }}>⏰</div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28,
              color: 'var(--text-primary)', margin: '0 0 8px',
            }}>
              Time Series for Machines
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
              Machine data is not like customer data — it lives on a timeline, and that order is everything.
              A pump vibrating today was influenced by yesterday, last week, last month.
              Master trends, seasonality, stationarity, and windowing — the four pillars of machine time series.
            </p>
          </div>
        </div>
      </motion.div>

      {/* SECTION 1 */}
      <SectionBlock icon="" title="What Makes Time Series Special?" color={C.blue}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.75 }}>
          Most machine learning data is tabular — rows of independent observations. Shuffle the rows, and the
          dataset is just as valid. Time series is fundamentally different: each observation depends on its
          neighbors in time. For machines, this temporal dependency IS the signal.
        </p>
        <TimeSeriesVsTabular />
        <NeuronTip type="simple">
          Think of a time series like a sentence. "The pump is getting hot" makes sense in order.
          Scramble the words — "getting is The hot pump" — and the meaning is gone. Your ML model needs
          the words in the right order.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="समय क्रम क्यों मायने रखता है"
        english="Why Order Matters in Time Series"
        explanation="Time series data में order उतना ही ज़रूरी है जितना recipe में steps का order। अगर recipe की steps shuffle करो — पहले cake खाओ, फिर bake करो, फिर ingredients mix करो — result गड़बड़ होगा। Machine data भी ऐसा ही है। 'Day 1: vibration 2.5, Day 2: 2.6, Day 3: 2.7' — यह एक story है: machine धीरे-धीरे degrade हो रही है। इन्हें shuffle करो — '2.7, 2.5, 2.6, 2.6, 2.5' — pattern गायब! ML model को यह ordered sequence feed करना ज़रूरी है, वरना वो degradation trend नहीं सीखेगा।"
        example="Bihar की एक sugar mill में customer data था — किसने कितनी खरीदारी की। यह tabular था — rows shuffle करने से कोई फर्क नहीं। लेकिन उसी mill में crusher motor का vibration data था। उसे shuffle किया तो ML model की accuracy 85% से 52% हो गई — time order destroy हुआ!"
        terms={[
          { hindi: 'क्रमिक डेटा', english: 'Sequential Data', meaning: 'Data जहाँ row का order important हो — sensor readings, stock prices, weather' },
          { hindi: 'अस्थायी निर्भरता', english: 'Temporal Dependency', meaning: 'आज की value कल की value से related है — यही time series की खासियत है' },
          { hindi: 'फेरबदल', english: 'Shuffle', meaning: 'Rows को random order में रखना — time series में यह pattern destroy कर देता है' },
        ]}
      />

      {/* SECTION 2 */}
      <SectionBlock icon="" title="Decomposition — Trend + Seasonality + Residual" color={C.orange}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.75 }}>
          A pump's vibration over 12 months looks like a messy jumble of numbers. But hidden inside are
          three clean, separable components. Toggle each layer below to understand what your model is
          actually "seeing" when it analyzes machine data.
        </p>
        <DecompositionDemo />
        <NeuronTip type="tip">
          In PdM, the <strong>trend</strong> component is your degradation signal — the gradual upward drift
          in vibration tells you bearings are wearing. The <strong>residual</strong> growing larger is also
          important — increasing noise means the machine is becoming erratic.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="विघटन — Trend, Seasonality और Noise अलग करना"
        english="Decomposition — Separating Trend, Seasonality and Residual"
        explanation="मौसम की तरह सोचो। Delhi का temperature data देखो — overall trend: global warming से हर साल थोड़ा बढ़ रहा है। Seasonality: हर साल May-June में गर्मी, December में ठंड — यह pattern repeat होता है। Residual: कोई unexpected storm, या अचानक cloudy day — यह random noise है। Machine data में भी यही तीन layers होती हैं। Trend = bearing slowly wear हो रही है। Seasonality = summer में machine ज़्यादा गर्म चलती है। Residual = अचानक vibration spike — यही असली alert है!"
        example="NTPC Vindhyachal turbine का vibration data लो। 18 महीने का data: Trend clearly ऊपर जा रहा था — bearing wear। Seasonality: हर monsoon में humidity बढ़ने से vibration 0.3 mm/s बढ़ती थी। इन दोनों को हटाने के बाद residual देखा — वहाँ एक छोटा लेकिन growing spike था। 6 हफ्ते बाद blade imbalance confirm हुआ।"
        terms={[
          { hindi: 'प्रवृत्ति', english: 'Trend', meaning: 'Data का long-term direction — ऊपर जाना = degradation, नीचे जाना = improvement' },
          { hindi: 'मौसमीयता', english: 'Seasonality', meaning: 'Regular repeating pattern — हर shift change पर, हर season में होने वाले changes' },
          { hindi: 'अवशेष', english: 'Residual / Noise', meaning: 'Trend और Seasonality हटाने के बाद बचा हुआ — इसमें real anomalies छुपी होती हैं' },
        ]}
      />

      {/* SECTION 3 */}
      <SectionBlock icon="" title="Rolling Statistics — Smooth the Noise" color={C.red}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.75 }}>
          Raw sensor data is noisy — vibration readings jump up and down every minute. Rolling statistics
          compute metrics over a sliding window of recent data, smoothing the noise and revealing underlying
          trends. They also generate powerful features for your ML model.
        </p>
        <RollingStatsDemo />
      </SectionBlock>

      <HindiExplainer
        concept="चलती औसत — शोर को हटाना"
        english="Rolling Statistics — Smoothing Out the Noise"
        explanation="पिछले 7 दिनों का average temperature सोचो। आज 42°C था, कल 38°C, परसों 40°C — single day पर focus करना misleading है। लेकिन '7-day rolling average = 40°C' एक stable picture देता है। Machine sensors के साथ यही होता है। एक vibration reading 2.8 mm/s थी — spike थी या real problem? Rolling mean देखा: पिछले 24 घंटे का average 2.6 से 2.8 तक gradually बढ़ा — यह real trend है! Rolling standard deviation भी देखो: अगर scatter बढ़ रही है तो machine erratic हो रही है — खतरनाक sign।"
        example="Maruti Suzuki Gurugram plant के CNC machine spindle का vibration: हर 2 seconds में एक reading आती थी — 4 घंटे में 7,200 readings, सब noisy। Raw data देखकर कोई pattern नज़र नहीं आया। 5-minute rolling mean लगाया (150 readings का average) — साफ दिखा: पिछले 3 shifts में mean 1.8 से 2.4 mm/s तक बढ़ी। Maintenance engineer ने tool wear diagnose किया।"
        terms={[
          { hindi: 'चलती औसत', english: 'Rolling Mean', meaning: 'हर point पर पिछले N readings का average — noise smooth होता है, trend दिखता है' },
          { hindi: 'चलता विचलन', english: 'Rolling Standard Deviation', meaning: 'पिछले N readings का scatter — बढ़ना = machine erratic हो रही है' },
          { hindi: 'खिड़की आकार', english: 'Window Size', meaning: 'कितनी readings का average लें — बड़ी window = smoother लेकिन lag ज़्यादा' },
        ]}
      />

      {/* SECTION 4 */}
      <SectionBlock icon="" title="Stationarity — Does the Machine Behave Consistently?" color={C.green}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.75 }}>
          A time series is <strong>stationary</strong> if its statistical properties (mean, variance) don't
          change over time. Most ML models assume stationarity. A degrading machine violates this assumption —
          its mean vibration keeps rising and its variance keeps growing. You need to detect and fix this.
        </p>
        <StationarityDemo />
      </SectionBlock>

      <HindiExplainer
        concept="स्थिरता — क्या मशीन consistently काम करती है?"
        english="Stationarity — Stable Machine vs Degrading Machine"
        explanation="एक healthy machine stationary होती है — उसका average vibration, temperature, current हर हफ्ते लगभग same रहता है। एक degrading machine non-stationary होती है — उसका average धीरे-धीरे बढ़ता रहता है। ML models यह assume करते हैं कि 'जो pattern training में था, वही testing में होगा।' अगर machine degrade हो रही है तो यह assumption टूट जाता है — model confuse होता है। Solution: differencing करो (आज की value - कल की value) — इससे trend हट जाती है और data stationary बनता है।"
        example="BHEL Haridwar transformer factory में एक motor था जो 14 महीने से चल रहा था। Training data (महीने 1-10): mean vibration = 1.8 mm/s। Testing data (महीने 11-14): mean = 2.4 mm/s। Model ने 'normal' predict किया — क्योंकि उसे 1.8 mm/s normal लगता था! ADF test किया — data non-stationary निकला। Differencing apply की — model ने फिर सही anomaly detect की।"
        terms={[
          { hindi: 'स्थिर श्रृंखला', english: 'Stationary Series', meaning: 'Mean और variance समय के साथ नहीं बदलते — healthy machine की पहचान' },
          { hindi: 'अस्थिर श्रृंखला', english: 'Non-Stationary Series', meaning: 'Mean या variance बदलते रहते हैं — degrading machine या seasonal pattern' },
          { hindi: 'अंतरण', english: 'Differencing', meaning: 'हर value से पिछली value घटाना — trend remove करके series stationary बनाना' },
        ]}
      />

      {/* SECTION 5 */}
      <SectionBlock icon="" title="Lag Features & Autocorrelation" color={C.purple}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.75 }}>
          How related is today's vibration to yesterday's? To 7 days ago? Autocorrelation quantifies this.
          Strong autocorrelation at lag-1 means the machine is smooth and predictable — good. Sudden drop
          in autocorrelation means the machine is behaving erratically — dangerous.
        </p>
        <LagAutocorrelation />
      </SectionBlock>

      <HindiExplainer
        concept="पिछड़ी विशेषताएं — कल आज को affect करता है"
        english="Lag Features — Yesterday Affects Today"
        explanation="कल का temperature आज के temperature से related है — यह common sense है। Machine sensors में भी: कल का vibration आज के vibration को predict करने में help करता है। इसे lag feature कहते हैं। Lag-1 = कल की reading, Lag-7 = 7 दिन पहले की reading। Autocorrelation measure करता है कि यह relationship कितनी strong है। अगर vibration का Lag-1 correlation = 0.95 है — मतलब machine predictable है, smooth degradation हो रही है। अगर अचानक Lag-1 correlation = 0.3 हो जाए — मतलब machine erratic हो गई — danger!"
        example="Hindalco Renukoot smelter में pot current की daily readings थीं। Lag-1 autocorrelation normally 0.92 रहती थी। एक दिन अचानक 0.41 हो गई। Senior engineer ने कहा: 'यह pot instability का sign है।' 48 घंटे बाद pot failure confirm हुआ। ML model को lag-1, lag-2, lag-7 features feed करने से failure prediction accuracy 23% improve हुई।"
        terms={[
          { hindi: 'पिछड़ी विशेषता', english: 'Lag Feature', meaning: 'N steps पहले की value — ML model को past context देने का तरीका' },
          { hindi: 'स्व-सहसंबंध', english: 'Autocorrelation', meaning: 'Series और उसी series के shifted version का correlation — machine predictability measure करता है' },
          { hindi: 'ACF प्लॉट', english: 'ACF Plot', meaning: 'हर lag पर autocorrelation दिखाने वाला graph — कौन से lags important हैं यह बताता है' },
        ]}
      />

      {/* SECTION 6 */}
      <SectionBlock icon="" title="Windowing — Turning Raw Data Into ML Features" color={C.indigo}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 22, lineHeight: 1.75 }}>
          Your ML model doesn't eat raw time series — it eats feature vectors (rows of numbers).
          A sliding window extracts statistical features from a fixed-length block of recent data.
          Each window position becomes one row in your training dataset. Watch how the feature vector
          changes as the window enters the pre-failure zone.
        </p>
        <WindowingDemo />
      </SectionBlock>

      <HindiExplainer
        concept="खिड़की — कच्चे डेटा को ML features में बदलना"
        english="Windowing — Converting Raw Time Series into ML-Ready Features"
        explanation="ML model को एक point की value नहीं चाहिए — उसे context चाहिए। जैसे doctor एक reading नहीं देखता — वो पिछले 2 हफ्ते की readings देखता है। Sliding window exactly यही करता है। पिछली 24 hours की readings लो — उनसे features निकालो: mean, max, min, standard deviation, skewness। यह एक row बन गई। अब window एक step आगे खिसकाओ — फिर features निकालो — दूसरी row। ऐसे पूरे 6 महीने के sensor data से हज़ारों rows बनती हैं। हर row = एक moment का machine health snapshot।"
        example="Tata Motors Pune plant में hydraulic press के pressure sensor से हर minute एक reading। Raw data: 500,000 readings। Sliding window of 60 minutes (60 readings): हर window से 8 features — mean, std, max, min, range, skew, kurtosis, RMS। 500,000 readings से ~499,940 rows बनीं। इस tabular data पर Random Forest train किया — seal failure 4 घंटे पहले predict होने लगी।"
        terms={[
          { hindi: 'सरकती खिड़की', english: 'Sliding Window', meaning: 'Fixed size का block जो एक step एक step आगे बढ़ता है — हर position एक training row बनाता है' },
          { hindi: 'खिड़की विशेषताएं', english: 'Window Features', meaning: 'Window के अंदर के data से निकाले गए statistics — mean, std, max, RMS, kurtosis आदि' },
          { hindi: 'लेबलिंग रणनीति', english: 'Labeling Strategy', meaning: 'हर window को label देना — failure से N hours पहले की windows को 1 (failure imminent) label करना' },
        ]}
      />

      {/* SECTION 7 */}
      <SectionBlock icon="हिं" title="Summary — हिंदी में समझें" color={C.orange}>
        <HindiSummary />
      </SectionBlock>

    </div>
  )
}
