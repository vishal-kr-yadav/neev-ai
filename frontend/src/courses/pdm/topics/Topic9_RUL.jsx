import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 9 — Remaining Useful Life (RUL)
   Classification vs RUL, degradation curves, regression demo,
   evaluation metrics, confidence intervals, combined decision matrix,
   Hindi summary — all interactive & animated
================================================================ */


/* ---- 1. Classification vs RUL ---- */
function ClassificationVsRUL() {
  const equipment = [
    { id: 1, name: 'Pump A', icon: 'P', failProb: 87, rul: 7, color: '#ef4444', location: 'Line 3' },
    { id: 2, name: 'Pump B', icon: 'P', failProb: 72, rul: 45, color: '#f59e0b', location: 'Line 1' },
    { id: 3, name: 'Motor C', icon: 'M', failProb: 91, rul: 3, color: '#ef4444', location: 'Line 5' },
    { id: 4, name: 'Compressor D', icon: 'C', failProb: 55, rul: 22, color: '#f59e0b', location: 'Plant B' },
    { id: 5, name: 'Fan E', icon: 'F', failProb: 38, rul: 60, color: '#10b981', location: 'Line 2' },
  ]

  const [userOrder, setUserOrder] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [dragging, setDragging] = useState(null)

  const correctOrder = [...equipment].sort((a, b) => {
    const scoreA = a.failProb * 0.4 + (1 / (a.rul + 1)) * 100 * 0.6
    const scoreB = b.failProb * 0.4 + (1 / (b.rul + 1)) * 100 * 0.6
    return scoreB - scoreA
  }).map(e => e.id)

  const addToOrder = (id) => {
    if (userOrder.includes(id)) return
    setUserOrder(prev => [...prev, id])
  }

  const removeFromOrder = (id) => {
    setUserOrder(prev => prev.filter(x => x !== id))
  }

  const getScore = () => {
    if (userOrder.length < equipment.length) return null
    let correct = 0
    userOrder.forEach((id, idx) => {
      if (id === correctOrder[idx]) correct++
    })
    return Math.round((correct / equipment.length) * 100)
  }

  const score = submitted ? getScore() : null

  const getRULColor = (rul) => {
    if (rul <= 7) return '#ef4444'
    if (rul <= 30) return '#f59e0b'
    return '#10b981'
  }

  return (
    <>
    <SectionBlock icon="!" title="Classification vs RUL — WHY We Need Both" color="#6366f1">
      <Neuron
        mood="explaining"
        message="Classification says IF a machine will fail. But maintenance teams need to know WHEN — should I fix it today or next month? Remaining Useful Life answers that."
        size="small"
      />

      <HindiExplainer
        concept="Classification बनाम RUL"
        english="Classification vs Remaining Useful Life"
        explanation="Classification model बताता है 'हाँ fail होगा' या 'नहीं होगा' — बस YES/NO। लेकिन maintenance team को चाहिए: 'कितने दिन बाद fail होगा?' यही RUL (Remaining Useful Life) है — एक regression problem जो दिन में जवाब देती है।"
        example="मान लो 2 pumps हैं: Pump A 87% chance से fail होगा, Pump B 72% से। अगर सिर्फ classification देखो — Pump A fix करो पहले। लेकिन RUL देखो: Pump A के पास 7 दिन बचे हैं, Pump B के पास 45 दिन! Pump A को आज fix करो, Pump B को अगले महीने schedule करो।"
        terms={[
          { hindi: 'शेष उपयोगी जीवन', english: 'Remaining Useful Life (RUL)', meaning: 'Machine अभी से कितने दिन और काम करेगी बिना fail हुए' },
          { hindi: 'वर्गीकरण', english: 'Classification', meaning: 'Fail होगा या नहीं — YES/NO answer' },
          { hindi: 'प्राथमिकता', english: 'Priority', meaning: 'कौन सी machine पहले ठीक करनी है' },
        ]}
      />

      {/* Two pump comparison cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
        {[equipment[0], equipment[1]].map(pump => (
          <motion.div
            key={pump.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'var(--bg-secondary)', borderRadius: 20, padding: 24,
              border: `2px solid ${pump.color}40`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: `${pump.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900, color: pump.color, border: `2px solid ${pump.color}40`,
              }}>
                {pump.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>{pump.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pump.location}</div>
              </div>
            </div>

            {/* Classification answer */}
            <div style={{
              background: `${pump.color}15`, borderRadius: 12, padding: '10px 14px', marginBottom: 12,
              border: `1px solid ${pump.color}30`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                CLASSIFICATION MODEL
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: pump.color }}>
                Will fail? YES ({pump.failProb}%)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                ...but WHEN? Tomorrow? Next month?
              </div>
            </div>

            {/* RUL answer */}
            <div style={{
              background: 'var(--bg-card)', borderRadius: 12, padding: '10px 14px',
              border: '2px solid var(--accent)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                RUL MODEL
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: getRULColor(pump.rul), fontFamily: 'monospace' }}>
                {pump.rul} days
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>remaining useful life</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Priority insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{
          marginTop: 16, background: 'linear-gradient(135deg, #6366f115, #8b5cf615)',
          borderRadius: 16, padding: 20, border: '1px solid #6366f130',
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        <div style={{ fontSize: 32 }}>!</div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Priority Matrix: Fix Pump A First!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Even though Pump B has higher probability in absolute terms (72%), Pump A has only 7 days left.
            Pump B can wait — schedule it 30 days out. This is why RUL is critical for maintenance planning.
          </div>
        </div>
      </motion.div>

      {/* Interactive prioritization game */}
      <InteractiveDemo
        title="Prioritization Challenge"
        instruction="Click equipment in the order you'd schedule maintenance (most urgent first). RUL + probability both matter!"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          {equipment.map(eq => {
            const orderIdx = userOrder.indexOf(eq.id)
            const isSelected = orderIdx !== -1
            return (
              <motion.div
                key={eq.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => isSelected ? removeFromOrder(eq.id) : addToOrder(eq.id)}
                style={{
                  background: isSelected ? `${getRULColor(eq.rul)}15` : 'var(--bg-secondary)',
                  borderRadius: 16, padding: 16, cursor: 'pointer',
                  border: `2px solid ${isSelected ? getRULColor(eq.rul) : 'var(--border)'}`,
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8, width: 24, height: 24,
                    borderRadius: '50%', background: getRULColor(eq.rul),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, fontWeight: 900,
                  }}>
                    {orderIdx + 1}
                  </div>
                )}
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{eq.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{eq.location}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: eq.color }}>Fail: {eq.failProb}%</span>
                  <span style={{ color: getRULColor(eq.rul), fontWeight: 700 }}>RUL: {eq.rul}d</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Order: {userOrder.map(id => equipment.find(e => e.id === id)?.name).join(' → ') || 'Click equipment above'}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {userOrder.length === equipment.length && !submitted && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSubmitted(true)}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                  fontWeight: 700, fontSize: 13,
                }}
              >
                Check My Order
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setUserOrder([]); setSubmitted(false) }}
              style={{
                padding: '10px 20px', borderRadius: 10, border: '2px solid var(--border)',
                cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)',
                fontWeight: 700, fontSize: 13,
              }}
            >
              Reset
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {submitted && score !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 16, padding: 16, borderRadius: 14,
                background: score >= 80 ? '#10b98115' : score >= 60 ? '#f59e0b15' : '#ef444415',
                border: `1px solid ${score >= 80 ? '#10b98140' : score >= 60 ? '#f59e0b40' : '#ef444440'}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6,
                color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444' }}>
                Score: {score}% {score >= 80 ? '— Excellent!' : score >= 60 ? '— Good try!' : '— Keep practicing!'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Optimal order: <strong>{correctOrder.map(id => equipment.find(e => e.id === id)?.name).join(' → ')}</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                Motor C (91% / 3 days) is most critical. Pump A (87% / 7 days) next. Compressor D (55% / 22 days) third.
                Pump B (72% / 45 days) fourth — high probability but lots of time. Fan E is low risk.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveDemo>
    </SectionBlock>
    <HindiExplainer
      concept="Classification vs RUL — 'fail होगा?' बनाम 'कब fail होगा?'"
      english="Classification vs Remaining Useful Life"
      explanation="Classification बताता है YES/NO — machine fail होगी? RUL (Remaining Useful Life) बताता है कितने दिन बचे हैं। दोनों साथ use करने पर सबसे powerful PdM system बनता है। सिर्फ Classification से: 'Pump A fail होगा।' Classification + RUL से: 'Pump A 7 दिन में fail होगा, तुरंत maintenance करो।'"
      example="Motor की maintenance: सिर्फ Classification → 'खतरा है' (कब schedule करें?). Classification+RUL → '87% fail probability, 7 दिन बचे' → कल manufacturer को parts order करो, परसों maintenance करो। Factory में यह difference = ₹11 lakh bachana।"
      terms={[
        { hindi: 'वर्गीकरण', english: 'Classification', meaning: 'binary answer — fail होगा (1) या नहीं (0)' },
        { hindi: 'शेष उपयोगी जीवन', english: 'Remaining Useful Life (RUL)', meaning: 'failure से पहले कितने दिन/घंटे बचे हैं' },
        { hindi: 'रखरखाव खिड़की', english: 'Maintenance Window', meaning: 'वह time period जब maintenance schedule करना optimal है' },
      ]}
    />
    </>
  )
}


/* ---- 2. Degradation Curve ---- */
function DegradationCurve() {
  const [pattern, setPattern] = useState('linear')
  const [currentTime, setCurrentTime] = useState(50)

  const failureThreshold = 20

  const patterns = {
    linear: {
      label: 'Linear',
      icon: '/',
      color: '#3b82f6',
      example: 'Brake pads, cutting tools, tire treads',
      description: 'Steady, predictable decline. Easy to model and forecast.',
      health: (t) => Math.max(0, 100 - t),
    },
    exponential: {
      label: 'Exponential',
      icon: 'e',
      color: '#f59e0b',
      example: 'Bearings, gears, rolling element fatigue',
      description: 'Slow degradation then sudden acceleration. Dangerous — little warning before failure.',
      health: (t) => Math.max(0, 100 * Math.exp(-0.045 * t)),
    },
    stepwise: {
      label: 'Step-wise',
      icon: 's',
      color: '#8b5cf6',
      example: 'Electronic components, seals, gaskets',
      description: 'Sudden drops at failure events. Hard to predict — requires event-driven monitoring.',
      health: (t) => {
        if (t < 25) return 100
        if (t < 40) return 75
        if (t < 65) return 55
        if (t < 80) return 30
        return 10
      },
    },
  }

  const activePattern = patterns[pattern]
  const currentHealth = activePattern.health(currentTime)

  // Find when health crosses threshold
  const getRUL = () => {
    if (currentHealth <= failureThreshold) return 0
    for (let t = currentTime; t <= 100; t++) {
      if (activePattern.health(t) <= failureThreshold) return t - currentTime
    }
    return 100 - currentTime
  }

  const rul = getRUL()

  const W = 400
  const H = 200
  const padL = 40
  const padB = 30
  const padT = 15
  const chartW = W - padL - 10
  const chartH = H - padB - padT

  const timeToX = (t) => padL + (t / 100) * chartW
  const healthToY = (h) => padT + (1 - h / 100) * chartH
  const thresholdY = healthToY(failureThreshold)

  // Build SVG path for health curve
  const points = []
  for (let t = 0; t <= 100; t += 1) {
    points.push({ x: timeToX(t), y: healthToY(activePattern.health(t)) })
  }
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const curX = timeToX(currentTime)
  const curY = healthToY(currentHealth)

  return (
    <>
    <SectionBlock icon="~" title="The Degradation Curve — How Machines Die" color="#3b82f6">
      <Neuron
        mood="explaining"
        message="Every machine degrades over time, but the SHAPE of degradation varies. Understanding the pattern is key to accurate RUL prediction!"
        size="small"
      />

      {/* Pattern selector tabs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 20 }}>
        {Object.entries(patterns).map(([key, p]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setPattern(key)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12, border: `2px solid ${pattern === key ? p.color : 'var(--border)'}`,
              cursor: 'pointer', background: pattern === key ? `${p.color}15` : 'var(--bg-secondary)',
              color: pattern === key ? p.color : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 13,
            }}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
        Example: <strong style={{ color: activePattern.color }}>{activePattern.example}</strong>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        {activePattern.description}
      </div>

      {/* SVG Chart */}
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}>
          {/* Background */}
          <rect x={padL} y={padT} width={chartW} height={chartH} fill="var(--bg-secondary)" rx={4} />

          {/* Failure zone */}
          <rect
            x={padL} y={thresholdY}
            width={chartW} height={chartH - (thresholdY - padT)}
            fill="#ef444415"
          />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(h => (
            <g key={h}>
              <line
                x1={padL} y1={healthToY(h)} x2={padL + chartW} y2={healthToY(h)}
                stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4,4"
              />
              <text x={padL - 4} y={healthToY(h) + 4} fill="var(--text-secondary)" fontSize={9} textAnchor="end">
                {h}%
              </text>
            </g>
          ))}

          {/* Time axis labels */}
          {[0, 25, 50, 75, 100].map(t => (
            <text key={t} x={timeToX(t)} y={H - 8} fill="var(--text-secondary)" fontSize={9} textAnchor="middle">
              {t}
            </text>
          ))}

          {/* Axis labels */}
          <text x={padL - 30} y={padT + chartH / 2} fill="var(--text-secondary)" fontSize={9}
            transform={`rotate(-90,${padL - 30},${padT + chartH / 2})`} textAnchor="middle">
            Health %
          </text>
          <text x={padL + chartW / 2} y={H - 1} fill="var(--text-secondary)" fontSize={9} textAnchor="middle">
            Time (days)
          </text>

          {/* Failure threshold line */}
          <line x1={padL} y1={thresholdY} x2={padL + chartW} y2={thresholdY}
            stroke="#ef4444" strokeWidth={2} strokeDasharray="6,3" />
          <text x={padL + chartW - 2} y={thresholdY - 4} fill="#ef4444" fontSize={9} textAnchor="end">
            Failure threshold
          </text>

          {/* Health curve */}
          <motion.path
            key={pattern}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            d={pathD}
            fill="none" stroke={activePattern.color} strokeWidth={2.5} strokeLinecap="round"
          />

          {/* RUL span shading (current position to threshold) */}
          {rul > 0 && currentHealth > failureThreshold && (
            <rect
              x={curX} y={padT} width={timeToX(currentTime + rul) - curX} height={chartH}
              fill={`${activePattern.color}12`}
            />
          )}

          {/* Current time vertical line */}
          <line x1={curX} y1={padT} x2={curX} y2={padT + chartH}
            stroke="var(--text-primary)" strokeWidth={1.5} strokeDasharray="4,3" />

          {/* Current point */}
          <motion.circle
            key={`${pattern}-${currentTime}`}
            initial={{ r: 0 }}
            animate={{ r: 7 }}
            cx={curX} cy={curY}
            fill={activePattern.color} stroke="white" strokeWidth={2}
          />

          {/* RUL label */}
          {rul > 0 && (
            <text
              x={(curX + timeToX(currentTime + rul)) / 2} y={padT + 14}
              fill={activePattern.color} fontSize={10} fontWeight={700} textAnchor="middle"
            >
              RUL = {rul}d
            </text>
          )}
        </svg>
      </div>

      {/* Slider */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Current time: Day {currentTime}</span>
          <span style={{ fontSize: 13, color: currentHealth <= failureThreshold ? '#ef4444' : 'var(--text-secondary)' }}>
            Health: {Math.round(currentHealth)}%
            {currentHealth <= failureThreshold && ' — FAILED'}
          </span>
        </div>
        <input
          type="range" min={0} max={100} value={currentTime}
          onChange={e => setCurrentTime(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: activePattern.color }}
        />
      </div>

      {/* RUL display */}
      <motion.div
        key={`${pattern}-${currentTime}`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        style={{
          marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Current Health', value: `${Math.round(currentHealth)}%`, color: currentHealth > 60 ? '#10b981' : currentHealth > failureThreshold ? '#f59e0b' : '#ef4444' },
          { label: 'RUL Estimate', value: currentHealth <= failureThreshold ? 'FAILED' : `${rul} days`, color: rul > 20 ? '#10b981' : rul > 7 ? '#f59e0b' : '#ef4444' },
          { label: 'Failure in', value: currentHealth <= failureThreshold ? 'NOW' : `Day ${currentTime + rul}`, color: 'var(--text-secondary)' },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1, minWidth: 100, background: 'var(--bg-secondary)', borderRadius: 14, padding: '12px 16px',
            border: '1px solid var(--border)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>
              {item.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: item.color, fontFamily: 'monospace' }}>
              {item.value}
            </div>
          </div>
        ))}
      </motion.div>

      <NeuronTip type="tip">
        Move the slider to see how RUL changes over time. For exponential degradation — the machine looks fine at day 50, but by day 70 it's almost gone. <strong>Early warning is critical.</strong>
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="क्षरण वक्र — machine धीरे-धीरे कैसे मरती है"
      english="Degradation Curve"
      explanation="हर machine धीरे-धीरे degrade होती है — जैसे मोमबत्ती जलते-जलते खत्म होती है। Linear degradation में हर दिन equal amount खराब होती है। Exponential में शुरू में ठीक लगती है, अंत में suddenly crash करती है — यह PdM के लिए सबसे dangerous है। Degradation curve देखकर हम predict करते हैं कि failure कब होगी।"
      example="Car tyre analogy: नई tyre → 8mm tread। Linear degradation: हर 5000 km पर 1mm घटे। Exponential: 30000 km तक ठीक, फिर 1000 km में 2mm घटे! RUL model यही curve fit करता है sensor data से।"
      terms={[
        { hindi: 'क्षरण', english: 'Degradation', meaning: 'machine की health धीरे-धीरे कम होना — time के साथ' },
        { hindi: 'रेखीय क्षरण', english: 'Linear Degradation', meaning: 'हर दिन equal amount खराब — predictable' },
        { hindi: 'घातांकीय क्षरण', english: 'Exponential Degradation', meaning: 'शुरू में slow, अंत में अचानक तेज़ — most dangerous pattern' },
      ]}
    />
    </>
  )
}


/* ---- 3. Regression for RUL ---- */
function RegressionDemo() {
  const [features, setFeatures] = useState({
    vibration_dev: 35,
    temp_dev: 22,
    lifecycle_ratio: 82,
    mtbf: 60,
    days_since_repair: 45,
  })

  const featureConfig = [
    { key: 'vibration_dev', label: 'Vibration Deviation', unit: '%', min: 0, max: 100, color: '#ef4444', impact: 'high',
      description: 'How much vibration deviates from baseline. Higher = more wear.' },
    { key: 'temp_dev', label: 'Temperature Deviation', unit: '%', min: 0, max: 100, color: '#f59e0b', impact: 'high',
      description: 'Temperature above baseline operating point. Heat = degradation.' },
    { key: 'lifecycle_ratio', label: 'Lifecycle Ratio', unit: '%', min: 0, max: 100, color: '#8b5cf6', impact: 'medium',
      description: 'Age vs expected useful life. 82% = 82% of life used up.' },
    { key: 'mtbf', label: 'MTBF (days)', unit: 'd', min: 5, max: 120, color: '#3b82f6', impact: 'medium',
      description: 'Mean Time Between Failures. Higher = healthier historical pattern.' },
    { key: 'days_since_repair', label: 'Days Since Repair', unit: 'd', min: 0, max: 180, color: '#10b981', impact: 'low',
      description: 'Time since last maintenance. Longer = more accumulated wear.' },
  ]

  // Simulated gradient boosting model
  const predictRUL = (f) => {
    const base = 200
    const vibFactor = -1.8 * f.vibration_dev
    const tempFactor = -1.2 * f.temp_dev
    const lifeFactor = -1.5 * f.lifecycle_ratio
    const mtbfFactor = 0.8 * f.mtbf
    const repairFactor = -0.3 * f.days_since_repair
    const raw = base + vibFactor + tempFactor + lifeFactor + mtbfFactor + repairFactor
    return Math.max(1, Math.min(365, Math.round(raw)))
  }

  const rul = predictRUL(features)

  const getRULColor = (r) => r <= 7 ? '#ef4444' : r <= 30 ? '#f59e0b' : r <= 90 ? '#3b82f6' : '#10b981'
  const rulColor = getRULColor(rul)

  const getUrgency = (r) => {
    if (r <= 7) return { label: 'CRITICAL', color: '#ef4444', bg: '#ef444415' }
    if (r <= 30) return { label: 'HIGH', color: '#f59e0b', bg: '#f59e0b15' }
    if (r <= 90) return { label: 'MEDIUM', color: '#3b82f6', bg: '#3b82f615' }
    return { label: 'LOW', color: '#10b981', bg: '#10b98115' }
  }
  const urgency = getUrgency(rul)

  return (
    <>
    <SectionBlock icon="#" title="Regression Model for RUL — Features to Days" color="#f59e0b">
      <Neuron
        mood="thinking"
        message="A Gradient Boosting model takes sensor features and outputs a number — the days until failure. Watch how each feature affects the prediction!"
        size="small"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, marginTop: 20, alignItems: 'start' }}>
        {/* Feature sliders */}
        <div>
          {featureConfig.map(feat => (
            <div key={feat.key} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{feat.label}</span>
                  <span style={{
                    marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                    background: feat.impact === 'high' ? '#ef444415' : feat.impact === 'medium' ? '#f59e0b15' : '#10b98115',
                    color: feat.impact === 'high' ? '#ef4444' : feat.impact === 'medium' ? '#f59e0b' : '#10b981',
                  }}>
                    {feat.impact.toUpperCase()} IMPACT
                  </span>
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 900, color: feat.color, fontSize: 15 }}>
                  {features[feat.key]}{feat.unit}
                </span>
              </div>
              <input
                type="range" min={feat.min} max={feat.max} value={features[feat.key]}
                onChange={e => setFeatures(prev => ({ ...prev, [feat.key]: Number(e.target.value) }))}
                style={{ width: '100%', cursor: 'pointer', accentColor: feat.color }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{feat.description}</div>
            </div>
          ))}
        </div>

        {/* Prediction output */}
        <div style={{ minWidth: 160 }}>
          <motion.div
            key={rul}
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: urgency.bg, borderRadius: 20, padding: '24px 20px', textAlign: 'center',
              border: `2px solid ${urgency.color}40`,
              boxShadow: `0 8px 30px ${urgency.color}20`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              PREDICTED RUL
            </div>
            <div style={{ fontSize: 48, fontWeight: 900, color: rulColor, fontFamily: 'monospace', lineHeight: 1 }}>
              {rul}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>days</div>
            <div style={{
              marginTop: 14, padding: '6px 12px', borderRadius: 10,
              background: urgency.color, color: 'white', fontWeight: 800, fontSize: 13,
            }}>
              {urgency.label}
            </div>
          </motion.div>

          {/* Model info */}
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 14, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Model</div>
            <div>Gradient Boosting</div>
            <div>Output: 1–365 days</div>
            <div>Features: 5</div>
            <div style={{ marginTop: 8, fontWeight: 700, color: 'var(--text-primary)' }}>Key Rules</div>
            <div>Vib up → RUL down</div>
            <div>MTBF up → RUL up</div>
            <div>Lifecycle up → RUL down</div>
          </div>
        </div>
      </div>

      <NeuronTip type="warning">
        Try setting Vibration Deviation to 90% and Lifecycle Ratio to 95% — watch the RUL drop to critical. Now set MTBF to 120 days — it improves slightly. <strong>Vibration and lifecycle are the dominant features.</strong>
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="RUL Regression — features को days में convert करना"
      english="Regression Model for RUL"
      explanation="Regression model features (vibration, temperature, lifecycle) लेकर एक number output करता है — कितने दिन बचे हैं। Classification से अलग: वहां YES/NO था, यहां exact number आता है। जैसे petrol gauge: 'petrol है' vs 'exactly 15 km चल सकते हो' — दूसरा ज़्यादा useful है।"
      example="Pump का input: vibration_dev=35%, temp_dev=22%, lifecycle=82%, mtbf=45 days → Gradient Boosting model output: RUL = 18 days। Maintenance department को 18 दिन पहले alert जाता है — parts order, engineer schedule, सब होता है।"
      terms={[
        { hindi: 'प्रतीपगमन', english: 'Regression', meaning: 'continuous number predict करना — दिनों में RUL' },
        { hindi: 'ग्रेडिएंट बूस्टिंग', english: 'Gradient Boosting', meaning: 'RUL के लिए सबसे accurate ML model' },
        { hindi: 'सुविधाओं से दिन', english: 'Features to Days', meaning: 'sensor readings को remaining life (number) में बदलना' },
      ]}
    />
    </>
  )
}


/* ---- 4. Evaluation Metrics ---- */
function EvaluationMetrics() {
  const [modelQuality, setModelQuality] = useState('decent')

  const qualities = {
    poor: {
      label: 'Poor Model', color: '#ef4444', icon: '!',
      noise: 80, bias: 40,
      mae: 52, rmse: 71, r2: 0.18,
      description: 'Model is barely better than random. Large bias — predictions are systematically off.',
    },
    decent: {
      label: 'Decent Model', color: '#f59e0b', icon: '~',
      noise: 30, bias: 10,
      mae: 18, rmse: 25, r2: 0.71,
      description: 'Reasonable predictions. Some large misses on extreme values.',
    },
    good: {
      label: 'Good Model', color: '#10b981', icon: '+',
      noise: 10, bias: 3,
      mae: 6, rmse: 9, r2: 0.93,
      description: 'Tight predictions. Most points near the ideal 45° line.',
    },
  }

  const activeQ = qualities[modelQuality]

  // Generate 20 test equipment scatter points
  const generatePoints = (noise, bias) => {
    const seed = modelQuality
    return Array.from({ length: 20 }, (_, i) => {
      const actual = 15 + i * 14 + (i % 3 === 0 ? 20 : 0)
      const error = (Math.sin(i * 2.3 + seed.length) * noise) + bias * (Math.random() > 0.5 ? 1 : -1) * 0.4
      const predicted = Math.max(1, Math.min(365, actual + error))
      return { id: i + 1, actual: Math.round(actual), predicted: Math.round(predicted) }
    })
  }

  const points = generatePoints(activeQ.noise, activeQ.bias)

  const W = 280
  const H = 280
  const PAD = 40
  const chartW = W - PAD * 2
  const maxVal = 280

  const toSVG = (val) => PAD + (val / maxVal) * chartW

  return (
    <>
    <SectionBlock icon="%" title="Evaluation Metrics — Measuring RUL Accuracy" color="#10b981">
      <Neuron
        mood="explaining"
        message="For regression, we don't use accuracy. Instead: MAE tells you average error in days, RMSE penalizes big misses more, and R² tells you how much variance your model explains."
        size="small"
      />

      {/* Quality toggle */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 20 }}>
        {Object.entries(qualities).map(([key, q]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setModelQuality(key)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12,
              border: `2px solid ${modelQuality === key ? q.color : 'var(--border)'}`,
              cursor: 'pointer', background: modelQuality === key ? `${q.color}15` : 'var(--bg-secondary)',
              color: modelQuality === key ? q.color : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 13,
            }}
          >
            {q.label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
        {/* Scatter plot */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
            Scatter Plot: Actual vs Predicted RUL (days)
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
            <rect x={PAD} y={PAD} width={chartW} height={chartW} fill="var(--bg-secondary)" rx={4} />

            {/* Ideal 45° line */}
            <line x1={PAD} y1={PAD + chartW} x2={PAD + chartW} y2={PAD}
              stroke="#6b728060" strokeWidth={1.5} strokeDasharray="6,4" />
            <text x={PAD + chartW - 4} y={PAD + 12} fill="#6b7280" fontSize={9} textAnchor="end">ideal</text>

            {/* Axis labels */}
            <text x={PAD + chartW / 2} y={H - 4} fill="var(--text-secondary)" fontSize={9} textAnchor="middle">
              Actual RUL (days)
            </text>
            <text x={12} y={PAD + chartW / 2} fill="var(--text-secondary)" fontSize={9}
              transform={`rotate(-90,12,${PAD + chartW / 2})`} textAnchor="middle">
              Predicted RUL
            </text>

            {/* Grid */}
            {[70, 140, 210, 280].map(v => (
              <g key={v}>
                <line x1={toSVG(v)} y1={PAD} x2={toSVG(v)} y2={PAD + chartW}
                  stroke="var(--border)" strokeWidth={0.5} />
                <line x1={PAD} y1={PAD + chartW - (v / maxVal) * chartW} x2={PAD + chartW} y2={PAD + chartW - (v / maxVal) * chartW}
                  stroke="var(--border)" strokeWidth={0.5} />
                <text x={toSVG(v)} y={PAD + chartW + 12} fill="var(--text-secondary)" fontSize={8} textAnchor="middle">{v}</text>
                <text x={PAD - 4} y={PAD + chartW - (v / maxVal) * chartW + 3} fill="var(--text-secondary)" fontSize={8} textAnchor="end">{v}</text>
              </g>
            ))}

            {/* Data points */}
            {points.map(pt => {
              const cx = toSVG(pt.actual)
              const cy = PAD + chartW - (pt.predicted / maxVal) * chartW
              const error = Math.abs(pt.actual - pt.predicted)
              const ptColor = error > 50 ? '#ef4444' : error > 20 ? '#f59e0b' : '#10b981'
              return (
                <motion.circle
                  key={`${modelQuality}-${pt.id}`}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: 5, opacity: 0.8 }}
                  transition={{ delay: pt.id * 0.05 }}
                  cx={cx} cy={cy}
                  fill={ptColor} stroke="white" strokeWidth={1.5}
                />
              )
            })}
          </svg>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {[['#10b981', '< 20 days error'], ['#f59e0b', '20–50 days off'], ['#ef4444', '> 50 days miss']].map(([c, l]) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics panel */}
        <div style={{ minWidth: 160 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={modelQuality}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {[
                { label: 'MAE', value: activeQ.mae, unit: ' days', desc: 'Average absolute error', icon: 'A' },
                { label: 'RMSE', value: activeQ.rmse, unit: ' days', desc: 'Punishes big misses', icon: 'S' },
                { label: 'R²', value: activeQ.r2, unit: '', desc: 'Variance explained', icon: 'R' },
              ].map(metric => (
                <div key={metric.label} style={{
                  marginBottom: 14, padding: '14px 16px', borderRadius: 14,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8, background: `${activeQ.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 900, color: activeQ.color,
                    }}>
                      {metric.icon}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: activeQ.color }}>{metric.label}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {metric.value}{metric.unit}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{metric.desc}</div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div style={{
            padding: 14, borderRadius: 14, background: `${activeQ.color}10`,
            border: `1px solid ${activeQ.color}30`, fontSize: 12, color: 'var(--text-secondary)',
          }}>
            {activeQ.description}
          </div>
        </div>
      </div>

      <NeuronTip type="warning">
        In PdM, being off by 5 days is acceptable. Being off by 50 days is <strong>dangerous</strong> — you might let a machine fail before maintenance arrives. RMSE matters more than MAE here because it punishes large errors severely.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="मूल्यांकन मेट्रिक्स — RUL model कितना accurate है?"
      english="Evaluation Metrics for RUL"
      explanation="RUL model के लिए अलग metrics use होती हैं। MAE (Mean Absolute Error) = average में कितने दिन गलत predict किया। RMSE = large errors को ज़्यादा penalty देता है। R² = model कितना variance explain करता है। PdM में RMSE important है क्योंकि 50 दिन का error = machine blast = crores का नुकसान।"
      example="Model ने 5 pumps की RUL predict की: actual [20, 35, 10, 45, 15], predicted [18, 38, 14, 41, 12]। Errors: [2, 3, 4, 4, 3] → MAE = 3.2 दिन। RMSE = 3.3 दिन। R² = 0.97 → excellent! ±5 days error PdM में acceptable है।"
      terms={[
        { hindi: 'औसत निरपेक्ष त्रुटि', english: 'MAE (Mean Absolute Error)', meaning: 'average में कितने दिन गलत predict किया' },
        { hindi: 'RMSE', english: 'Root Mean Square Error', meaning: 'large errors को ज़्यादा punish करता है — PdM में critical' },
        { hindi: 'R-squared', english: 'R² Score', meaning: '0 = worthless, 1 = perfect — model कितनी variation explain करता है' },
      ]}
    />
    </>
  )
}


/* ---- 5. Confidence Intervals ---- */
function ConfidenceIntervals() {
  const [day, setDay] = useState(0)

  // As time passes (approaching failure), confidence bands narrow
  const totalDays = 30
  const basePrediction = totalDays - day
  const uncertainty80 = Math.max(2, Math.round(8 * (1 - day / totalDays)))
  const uncertainty95 = Math.max(4, Math.round(15 * (1 - day / totalDays)))

  const lower80 = Math.max(0, basePrediction - uncertainty80)
  const upper80 = basePrediction + uncertainty80
  const lower95 = Math.max(0, basePrediction - uncertainty95)
  const upper95 = basePrediction + uncertainty95

  const scheduledDay = Math.max(0, lower80 - 3)

  const W = 400
  const H = 220
  const padL = 50
  const padR = 20
  const padT = 20
  const padB = 40
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const maxY = 50

  const tToX = (t) => padL + (t / totalDays) * chartW
  const dToY = (d) => padT + (1 - d / maxY) * chartH

  // Draw the prediction curve as if we're tracking it over time
  const predLine = []
  for (let t = 0; t <= day; t++) {
    predLine.push({ x: tToX(t), y: dToY(totalDays - t) })
  }
  const predPath = predLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // Future prediction from current day
  const futureLine = []
  for (let t = day; t <= totalDays; t++) {
    futureLine.push({ x: tToX(t), y: dToY(totalDays - t) })
  }
  const futurePath = futureLine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // Band paths
  const band95Top = Array.from({ length: totalDays - day + 1 }, (_, i) => {
    const t = day + i
    return { x: tToX(t), y: dToY(Math.min(maxY, (totalDays - t) + (15 * (1 - t / totalDays)))) }
  })
  const band95Bot = Array.from({ length: totalDays - day + 1 }, (_, i) => {
    const t = day + i
    return { x: tToX(t), y: dToY(Math.max(0, (totalDays - t) - (15 * (1 - t / totalDays)))) }
  })
  const band95Path = [
    ...band95Top.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    ...band95Bot.reverse().map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    'Z'
  ].join(' ')

  const band80Top = Array.from({ length: totalDays - day + 1 }, (_, i) => {
    const t = day + i
    return { x: tToX(t), y: dToY(Math.min(maxY, (totalDays - t) + (8 * (1 - t / totalDays)))) }
  })
  const band80Bot = Array.from({ length: totalDays - day + 1 }, (_, i) => {
    const t = day + i
    return { x: tToX(t), y: dToY(Math.max(0, (totalDays - t) - (8 * (1 - t / totalDays)))) }
  })
  const band80Path = [
    ...band80Top.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    ...band80Bot.reverse().map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    'Z'
  ].join(' ')

  return (
    <>
    <SectionBlock icon="~" title="RUL with Confidence Intervals — Knowing What We Don't Know" color="#8b5cf6">
      <Neuron
        mood="thinking"
        message="A single number isn't enough — you need to know how CONFIDENT the model is. Confidence intervals give you a range. Schedule maintenance on the lower bound to be safe!"
        size="small"
      />

      <HindiExplainer
        concept="विश्वास अंतराल"
        english="Confidence Interval"
        explanation="Model सिर्फ '23 दिन' नहीं बोलता — वो बोलता है '23 ± 8 दिन (80% confidence)'। मतलब: 80% chance है कि machine 15 से 31 दिन के बीच fail होगी। जैसे-जैसे failure करीब आती है, band narrow होती है — prediction sharper होती है।"
        example="Pump का RUL = 23 days, 80% CI: 15-31 days। Maintenance schedule करो Day 12 पर — lower bound (15) से 3 दिन पहले। अगर prediction थोड़ी गलत भी हुई, तो भी machine fail होने से पहले repair हो जाएगी।"
        terms={[
          { hindi: 'विश्वास अंतराल', english: 'Confidence Interval', meaning: 'वो range जिसमें असली value आने की X% probability है' },
          { hindi: 'निचली सीमा', english: 'Lower Bound', meaning: 'Confidence interval का सबसे pessimistic estimate' },
          { hindi: 'अनिश्चितता', english: 'Uncertainty', meaning: 'Model को कितना नहीं पता — failure के करीब, uncertainty कम होती है' },
        ]}
      />

      {/* SVG confidence interval chart */}
      <div style={{ overflowX: 'auto', marginTop: 20 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}>
          <rect x={padL} y={padT} width={chartW} height={chartH} fill="var(--bg-secondary)" rx={4} />

          {/* Axis labels */}
          <text x={padL + chartW / 2} y={H - 6} fill="var(--text-secondary)" fontSize={9} textAnchor="middle">Day</text>
          <text x={14} y={padT + chartH / 2} fill="var(--text-secondary)" fontSize={9}
            transform={`rotate(-90,14,${padT + chartH / 2})`} textAnchor="middle">Predicted RUL</text>

          {/* Grid */}
          {[0, 10, 20, 30].map(d => (
            <g key={d}>
              <line x1={tToX(d)} y1={padT} x2={tToX(d)} y2={padT + chartH}
                stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3,3" />
              <text x={tToX(d)} y={H - padB + 14} fill="var(--text-secondary)" fontSize={8} textAnchor="middle">{d}</text>
            </g>
          ))}
          {[0, 10, 20, 30, 40, 50].map(v => (
            <g key={v}>
              <line x1={padL} y1={dToY(v)} x2={padL + chartW} y2={dToY(v)}
                stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3,3" />
              <text x={padL - 4} y={dToY(v) + 3} fill="var(--text-secondary)" fontSize={8} textAnchor="end">{v}d</text>
            </g>
          ))}

          {/* 95% CI band */}
          <path d={band95Path} fill="#8b5cf620" />

          {/* 80% CI band */}
          <path d={band80Path} fill="#8b5cf640" />

          {/* Future prediction line (dashed) */}
          <path d={futurePath} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6,3" />

          {/* Past actuals line (solid) */}
          {predLine.length > 1 && (
            <path d={predPath} fill="none" stroke="#8b5cf6" strokeWidth={2.5} />
          )}

          {/* Scheduled maintenance line */}
          {scheduledDay > 0 && (
            <line
              x1={tToX(scheduledDay)} y1={padT} x2={tToX(scheduledDay)} y2={padT + chartH}
              stroke="#10b981" strokeWidth={2} strokeDasharray="4,3"
            />
          )}
          {scheduledDay > 0 && (
            <text x={tToX(scheduledDay)} y={padT + 10} fill="#10b981" fontSize={8} textAnchor="middle">Maint.</text>
          )}

          {/* Current day marker */}
          <line x1={tToX(day)} y1={padT} x2={tToX(day)} y2={padT + chartH}
            stroke="var(--text-primary)" strokeWidth={1.5} />
          <circle cx={tToX(day)} cy={dToY(basePrediction)} r={6}
            fill="#8b5cf6" stroke="white" strokeWidth={2} />

          {/* Legend */}
          <rect x={padL + 5} y={padT + 5} width={12} height={8} fill="#8b5cf640" />
          <text x={padL + 20} y={padT + 12} fill="var(--text-secondary)" fontSize={8}>80% CI</text>
          <rect x={padL + 60} y={padT + 5} width={12} height={8} fill="#8b5cf620" />
          <text x={padL + 75} y={padT + 12} fill="var(--text-secondary)" fontSize={8}>95% CI</text>
        </svg>
      </div>

      {/* Slider */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Current Day: {day}</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {30 - day} days to predicted failure
          </span>
        </div>
        <input
          type="range" min={0} max={28} value={day}
          onChange={e => setDay(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#8b5cf6' }}
        />
      </div>

      {/* Stats cards */}
      <motion.div
        key={day}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}
      >
        {[
          { label: 'Central Prediction', value: `${basePrediction} days`, color: '#8b5cf6' },
          { label: '80% CI', value: `${lower80}–${upper80}d`, color: '#6366f1' },
          { label: '95% CI', value: `${lower95}–${upper95}d`, color: '#8b5cf680' },
          { label: 'Schedule By', value: `Day ${scheduledDay}`, color: '#10b981' },
        ].map(item => (
          <div key={item.label} style={{
            padding: '12px 14px', borderRadius: 14, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>
              {item.label}
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, fontFamily: 'monospace', color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </motion.div>

      <NeuronTip type="insight">
        Slide to Day 25 — the bands narrow dramatically! With only 5 days left, the model is very confident. Key rule: <strong>schedule maintenance based on the lower bound of your 80% CI, not the central prediction.</strong>
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="विश्वास अंतराल — model को अपनी uncertainty पता है"
      english="Confidence Intervals for RUL"
      explanation="Model सिर्फ 'RUL = 18 days' नहीं बोलता — वह बोलता है '18 days, ± 4 days (80% confidence)'। यह confidence interval है। जैसे weather forecast: '35°C होगा, ± 2°C'। PdM में safety के लिए हम lower bound use करते हैं: 18-4 = 14 दिन में maintenance schedule करो, safe रहो।"
      example="Pump की RUL prediction timeline: 30 दिन पहले → 'RUL: 30 ± 8 days' (wide band, uncertain)। 10 दिन पहले → 'RUL: 10 ± 2 days' (narrow band, confident)। Maintenance = lower bound = 8 दिनों में schedule करो। यही safe PdM practice है।"
      terms={[
        { hindi: 'विश्वास अंतराल', english: 'Confidence Interval', meaning: 'prediction के आसपास का uncertainty range (±X days)' },
        { hindi: 'निचली सीमा', english: 'Lower Bound', meaning: 'worst case scenario — इस दिन तक ज़रूर maintenance करो' },
        { hindi: 'अनिश्चितता', english: 'Uncertainty', meaning: 'model कितना confident है — failure से दूर = uncertain, पास = certain' },
      ]}
    />
    </>
  )
}


/* ---- 6. Combined Decision Matrix ---- */
function DecisionMatrix() {
  const [selectedEquip, setSelectedEquip] = useState(null)

  const equipment = [
    { id: 1, name: 'Pump A', prob: 88, rul: 5, icon: 'P', savings: '₹8.2L', action: 'Emergency maintenance NOW — stop machine for inspection', schedule: 'Today' },
    { id: 2, name: 'Motor B', prob: 91, rul: 3, icon: 'M', savings: '₹11.5L', action: 'Halt production line. Critical failure imminent', schedule: 'Immediately' },
    { id: 3, name: 'Compressor C', prob: 76, rul: 18, icon: 'C', savings: '₹5.8L', action: 'Schedule maintenance this week. Order parts now', schedule: 'In 3 days' },
    { id: 4, name: 'Fan D', prob: 65, rul: 35, icon: 'F', savings: '₹2.1L', action: 'Book maintenance slot next week. Monitor daily', schedule: 'In 10 days' },
    { id: 5, name: 'Valve E', prob: 22, rul: 8, icon: 'V', savings: '₹1.4L', action: 'Low probability but tight RUL — inspect during next planned stop', schedule: 'In 8 days' },
    { id: 6, name: 'Turbine F', prob: 35, rul: 22, icon: 'T', savings: '₹0.9L', action: 'Routine monitoring. Trend upward — watch it', schedule: 'In 20 days' },
    { id: 7, name: 'Bearing G', prob: 18, rul: 60, icon: 'B', savings: '₹0.3L', action: 'No action needed. Schedule routine preventive check', schedule: 'Next month' },
    { id: 8, name: 'Pump H', prob: 12, rul: 90, icon: 'P', savings: '₹0.1L', action: 'All good. Maintain standard monitoring interval', schedule: 'Routine' },
    { id: 9, name: 'Motor I', prob: 82, rul: 12, icon: 'M', savings: '₹7.3L', action: 'Schedule within 3 days. High risk + moderate time', schedule: 'In 3 days' },
    { id: 10, name: 'Sensor J', prob: 45, rul: 40, icon: 'S', savings: '₹1.2L', action: 'Medium priority. Investigate root cause of probability spike', schedule: 'In 2 weeks' },
  ]

  const getQuadrant = (prob, rul) => {
    const highProb = prob >= 60
    const lowRUL = rul <= 30
    if (highProb && lowRUL) return { label: 'CRITICAL', color: '#ef4444', bg: '#ef444415', border: '#ef444440', priority: 1 }
    if (highProb && !lowRUL) return { label: 'HIGH', color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b40', priority: 2 }
    if (!highProb && lowRUL) return { label: 'MEDIUM', color: '#3b82f6', bg: '#3b82f615', border: '#3b82f640', priority: 3 }
    return { label: 'LOW', color: '#10b981', bg: '#10b98115', border: '#10b98140', priority: 4 }
  }

  const W = 400
  const H = 360
  const PAD = 50
  const mid = 60 // probability midpoint %
  const rulMid = 30 // RUL midpoint in days

  const probToY = (p) => PAD + ((100 - p) / 100) * (H - PAD * 2)
  const rulToX = (r) => PAD + (Math.min(r, 100) / 100) * (W - PAD * 2)

  const sel = selectedEquip ? equipment.find(e => e.id === selectedEquip) : null
  const selQ = sel ? getQuadrant(sel.prob, sel.rul) : null

  return (
    <>
    <SectionBlock icon="@" title="Classification + RUL Decision Matrix" color="#6366f1">
      <Neuron
        mood="excited"
        message="Combine failure probability with RUL to get a 2D risk map. Each quadrant tells you what to DO — not just what to monitor!"
        size="small"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start', marginTop: 20 }}>
        {/* 2D Grid SVG */}
        <div style={{ overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
            {/* Quadrant backgrounds */}
            {[
              { x: PAD, y: PAD, w: (W - PAD * 2) / 2, h: (H - PAD * 2) / 2, color: '#f59e0b', label: 'HIGH', sub: 'High prob + High RUL' },
              { x: PAD + (W - PAD * 2) / 2, y: PAD, w: (W - PAD * 2) / 2, h: (H - PAD * 2) / 2, color: '#ef4444', label: 'CRITICAL', sub: 'High prob + Low RUL' },
              { x: PAD, y: PAD + (H - PAD * 2) / 2, w: (W - PAD * 2) / 2, h: (H - PAD * 2) / 2, color: '#10b981', label: 'LOW', sub: 'Low prob + High RUL' },
              { x: PAD + (W - PAD * 2) / 2, y: PAD + (H - PAD * 2) / 2, w: (W - PAD * 2) / 2, h: (H - PAD * 2) / 2, color: '#3b82f6', label: 'MEDIUM', sub: 'Low prob + Low RUL' },
            ].map(q => (
              <g key={q.label}>
                <rect x={q.x} y={q.y} width={q.w} height={q.h} fill={`${q.color}12`} rx={2} />
                <text x={q.x + q.w / 2} y={q.y + q.h / 2 - 8} fill={q.color} fontSize={12} fontWeight={800} textAnchor="middle" opacity={0.7}>
                  {q.label}
                </text>
                <text x={q.x + q.w / 2} y={q.y + q.h / 2 + 8} fill={q.color} fontSize={8} textAnchor="middle" opacity={0.5}>
                  {q.sub}
                </text>
              </g>
            ))}

            {/* Axis lines */}
            <line x1={PAD} y1={PAD + (H - PAD * 2) / 2} x2={W - PAD} y2={PAD + (H - PAD * 2) / 2}
              stroke="var(--border)" strokeWidth={1.5} strokeDasharray="6,3" />
            <line x1={PAD + (W - PAD * 2) / 2} y1={PAD} x2={PAD + (W - PAD * 2) / 2} y2={H - PAD}
              stroke="var(--border)" strokeWidth={1.5} strokeDasharray="6,3" />

            {/* Axis labels */}
            <text x={(W - PAD * 2) / 2 + PAD} y={H - 8} fill="var(--text-secondary)" fontSize={9} textAnchor="middle">
              RUL (days) — Low ← → High
            </text>
            <text x={14} y={H / 2} fill="var(--text-secondary)" fontSize={9}
              transform={`rotate(-90,14,${H / 2})`} textAnchor="middle">
              Fail Probability — Low ↓ ↑ High
            </text>

            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <text x={PAD + (v / 100) * (W - PAD * 2)} y={H - PAD + 14} fill="var(--text-secondary)" fontSize={7} textAnchor="middle">{v}d</text>
                <text x={PAD - 4} y={probToY(v) + 3} fill="var(--text-secondary)" fontSize={7} textAnchor="end">{v}%</text>
              </g>
            ))}

            {/* Equipment points */}
            {equipment.map(eq => {
              const q = getQuadrant(eq.prob, eq.rul)
              const cx = rulToX(eq.rul)
              const cy = probToY(eq.prob)
              const isSelected = selectedEquip === eq.id
              return (
                <motion.g key={eq.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedEquip(isSelected ? null : eq.id)}>
                  {isSelected && (
                    <motion.circle
                      initial={{ r: 8, opacity: 0.8 }}
                      animate={{ r: 16, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      cx={cx} cy={cy} fill={q.color}
                    />
                  )}
                  <motion.circle
                    whileHover={{ r: 10 }}
                    initial={{ r: 0 }}
                    animate={{ r: isSelected ? 10 : 7 }}
                    cx={cx} cy={cy}
                    fill={q.color} stroke="white" strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <text x={cx} y={cy - 12} fill={q.color} fontSize={8} fontWeight={700} textAnchor="middle">
                    {eq.name}
                  </text>
                </motion.g>
              )
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div style={{ minWidth: 180 }}>
          <AnimatePresence mode="wait">
            {sel ? (
              <motion.div
                key={sel.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <div style={{
                  padding: 16, borderRadius: 16, background: selQ.bg,
                  border: `2px solid ${selQ.border}`, marginBottom: 12,
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: selQ.color, marginBottom: 4 }}>{sel.name}</div>
                  <div style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 8,
                    background: selQ.color, color: 'white', fontSize: 11, fontWeight: 800, marginBottom: 10,
                  }}>
                    {selQ.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div><strong>Fail Probability:</strong> {sel.prob}%</div>
                    <div><strong>RUL:</strong> {sel.rul} days</div>
                    <div><strong>Schedule:</strong> {sel.schedule}</div>
                    <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      {sel.action}
                    </div>
                    <div style={{ marginTop: 8, color: '#10b981', fontWeight: 700 }}>
                      Savings vs reactive: {sel.savings}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: 20, borderRadius: 16, background: 'var(--bg-secondary)',
                  border: '2px dashed var(--border)', textAlign: 'center',
                  color: 'var(--text-secondary)', fontSize: 13,
                }}
              >
                Click any equipment point on the chart to see recommended action
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quadrant legend */}
          <div style={{ fontSize: 12, marginTop: 8 }}>
            {[
              { label: 'CRITICAL', color: '#ef4444', sub: 'Act now' },
              { label: 'HIGH', color: '#f59e0b', sub: 'Schedule soon' },
              { label: 'MEDIUM', color: '#3b82f6', sub: 'Monitor' },
              { label: 'LOW', color: '#10b981', sub: 'Routine' },
            ].map(q => (
              <div key={q.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: q.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: q.color }}>{q.label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{q.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NeuronTip type="insight">
        Notice Motor B (91% / 3 days) and Pump A (88% / 5 days) are both CRITICAL — even though their probabilities differ slightly, both need immediate action. <strong>The combination of high probability AND low RUL creates the danger zone.</strong>
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="निर्णय मैट्रिक्स — classification और RUL मिलकर action बताते हैं"
      english="Combined Classification + RUL Decision Matrix"
      explanation="Classification (fail probability) और RUL (days remaining) को मिलाकर एक 2×2 decision matrix बनता है। High prob + Low RUL = CRITICAL (अभी action लो)। High prob + High RUL = URGENT (इस हफ्ते)। Low prob + Low RUL = WATCH (monitor करो)। Low prob + High RUL = ROUTINE। यह matrix factory manager को exact priority देता है।"
      example="5 machines का matrix: Motor B (91%, 3 days) = CRITICAL → आज halt करो। Pump A (88%, 5 days) = CRITICAL → कल maintenance। Compressor D (55%, 22 days) = WATCH → हफ्ते में check। Fan E (20%, 60 days) = ROUTINE → monthly inspection। Total savings: ₹45L।"
      terms={[
        { hindi: 'निर्णय मैट्रिक्स', english: 'Decision Matrix', meaning: 'probability और RUL को मिलाकर action priority decide करना' },
        { hindi: 'गंभीर', english: 'CRITICAL', meaning: 'high probability + low RUL = तुरंत action ज़रूरी' },
        { hindi: 'नियमित', english: 'ROUTINE', meaning: 'low probability + high RUL = normal scheduled maintenance' },
      ]}
    />
    </>
  )
}


/* ---- 7. Hindi Summary ---- */
function HindiSummary() {
  return (
    <SectionBlock icon="H" title="Summary — RUL in Hindi" color="#ec4899">
      <Neuron
        mood="happy"
        message="Great work! RUL is like your car's odometer — it tells you not just if you need maintenance, but WHEN. Think of tire wear: you don't wait until the tire bursts. You check the tread depth and schedule a change 500 km before the limit!"
        size="small"
      />

      <HindiExplainer
        concept="RUL — शेष उपयोगी जीवन"
        english="Remaining Useful Life"
        explanation="RUL एक regression problem है जो बताता है: 'यह machine अभी से कितने दिन और चलेगी?' Classification सिर्फ YES/NO बोलता है — RUL exact timing देता है। जैसे car में odometer बताता है कितने किलोमीटर चली — RUL बताता है कितने दिन बचे।"
        example="Tire wear analogy: आपकी car के tire में 5mm tread बचा है। आप जानते हो कि 1000 km में 1mm घिसता है। तो RUL = 5000 km और समय = 5000/50 = 100 days (अगर रोज़ 50km चलाते हो)। Maintenance schedule करो 80 दिन पर — buffer रखो safety के लिए!"
        terms={[
          { hindi: 'शेष उपयोगी जीवन', english: 'Remaining Useful Life (RUL)', meaning: 'Machine fail होने से पहले कितना समय/काम बाकी है' },
          { hindi: 'प्रतिगमन', english: 'Regression', meaning: 'एक number predict करने वाला ML model — days, hours, km' },
          { hindi: 'गिरावट', english: 'Degradation', meaning: 'समय के साथ machine की health का कम होना — linear, exponential, या stepwise' },
          { hindi: 'विश्वास अंतराल', english: 'Confidence Interval', meaning: 'वो range जिसमें असली RUL आने की X% probability है (e.g., 80% CI: 15–31 दिन)' },
          { hindi: 'औसत निरपेक्ष त्रुटि', english: 'MAE (Mean Absolute Error)', meaning: 'Model की average गलती days में — lower is better' },
          { hindi: 'पूर्वानुमान', english: 'Prediction', meaning: 'Model का अनुमान — future event को data से predict करना' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
        {[
          {
            title: 'Classification + RUL',
            icon: '!',
            color: '#6366f1',
            points: ['Classification: Will it fail? (YES/NO)', 'RUL: When will it fail? (X days)', 'Combined: Priority matrix for scheduling'],
          },
          {
            title: 'Degradation Patterns',
            icon: '~',
            color: '#3b82f6',
            points: ['Linear: steady decline (brakes, tools)', 'Exponential: slow then sudden crash (bearings)', 'Step-wise: sudden drops (electronics)'],
          },
          {
            title: 'Regression Metrics',
            icon: '%',
            color: '#10b981',
            points: ['MAE: average error in days', 'RMSE: penalizes large misses more', 'R²: how much variance explained'],
          },
          {
            title: 'Confidence Intervals',
            icon: ')',
            color: '#8b5cf6',
            points: ['80% CI gives a reliable range', 'Schedule on the LOWER bound', 'Bands narrow as failure approaches'],
          },
        ].map(card => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: 18, borderRadius: 16, background: 'var(--bg-secondary)',
              border: `1px solid ${card.color}30`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: `${card.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: card.color, fontSize: 16,
              }}>
                {card.icon}
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{card.title}</span>
            </div>
            {card.points.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                <div style={{ color: card.color, fontWeight: 900, marginTop: 1, flexShrink: 0 }}>+</div>
                <span>{p}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      <NeuronTip type="insight">
        The complete PdM prediction pipeline: <strong>Sensors → Features → Classification (WILL it fail?) + RUL (WHEN?) → Decision Matrix (WHAT to do?) → Scheduled Maintenance</strong>. Next topic: compare algorithms — which model wins for PdM data?
      </NeuronTip>
    </SectionBlock>
  )
}


/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic9Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <ClassificationVsRUL />
      <DegradationCurve />
      <RegressionDemo />
      <EvaluationMetrics />
      <ConfidenceIntervals />
      <DecisionMatrix />
      <HindiSummary />
    </div>
  )
}
