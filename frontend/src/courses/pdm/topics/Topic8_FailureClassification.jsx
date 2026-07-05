import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 8 — Failure Classification
   Binary classification for predicting machine failures in PdM:
   scatter plot boundary, class imbalance, confusion matrix,
   precision/recall/F1, ROC curve, training simulation
================================================================ */

/* ----------------------------------------------------------------
   SECTION 1: The Binary Question — Scatter Plot Classifier
---------------------------------------------------------------- */
function BinaryQuestion() {
  const canvasRef = useRef(null)
  const [clicked, setClicked] = useState(false)
  const [result, setResult] = useState(null)

  // Pump's current readings
  const pump = { vib: 7.2, temp: 89 }

  // Synthetic dataset: [vibration, temperature, failed]
  const points = [
    [2.1,62,0],[2.5,65,0],[1.8,58,0],[3.0,70,0],[2.3,61,0],[3.5,72,0],[1.5,55,0],
    [4.0,68,0],[2.8,67,0],[3.2,71,0],[1.9,60,0],[4.1,69,0],[2.6,64,0],[3.8,73,0],
    [2.0,63,0],[3.4,70,0],[2.4,66,0],[4.5,74,0],[1.7,57,0],[3.1,69,0],[2.9,68,0],
    [4.3,72,0],[2.2,62,0],[3.7,71,0],[2.7,65,0],[4.0,67,0],[3.3,70,0],[1.6,56,0],
    [4.2,73,0],[2.5,64,0],[3.6,69,0],[1.4,54,0],[4.4,75,0],[2.1,61,0],[3.0,68,0],
    // failed points
    [6.5,86,1],[7.1,90,1],[8.0,92,1],[6.8,88,1],[7.5,91,1],[9.0,95,1],[6.2,85,1],
    [8.5,93,1],[7.3,89,1],[9.2,96,1],[6.9,87,1],[8.1,94,1],[7.8,92,1],[6.4,84,1],
    [9.5,97,1],[7.0,88,1],[8.7,95,1],[6.6,86,1],[9.1,96,1],[7.4,90,1],
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const pad = 50

    const toX = v => pad + ((v - 1) / (10 - 1)) * (W - pad * 2)
    const toY = t => H - pad - ((t - 50) / (100 - 50)) * (H - pad * 2)

    ctx.clearRect(0, 0, W, H)

    // Background gradient zones
    const gradFail = ctx.createLinearGradient(toX(5.5), 0, W, 0)
    gradFail.addColorStop(0, 'rgba(254,202,202,0)')
    gradFail.addColorStop(1, 'rgba(254,202,202,0.35)')
    ctx.fillStyle = gradFail
    ctx.fillRect(toX(5.5), 0, W - toX(5.5), H)

    const gradSafe = ctx.createLinearGradient(0, 0, toX(5.5), 0)
    gradSafe.addColorStop(0, 'rgba(220,252,231,0.35)')
    gradSafe.addColorStop(1, 'rgba(220,252,231,0)')
    ctx.fillStyle = gradSafe
    ctx.fillRect(0, 0, toX(5.5), H)

    // Grid
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let v = 2; v <= 9; v += 1) {
      ctx.beginPath(); ctx.moveTo(toX(v), pad); ctx.lineTo(toX(v), H - pad); ctx.stroke()
    }
    for (let t = 55; t <= 95; t += 5) {
      ctx.beginPath(); ctx.moveTo(pad, toY(t)); ctx.lineTo(W - pad, toY(t)); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke()

    // Axis labels
    ctx.fillStyle = '#64748b'
    ctx.font = '11px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Vibration (mm/s)', W / 2, H - 8)
    ctx.save(); ctx.translate(14, H / 2); ctx.rotate(-Math.PI / 2)
    ctx.fillText('Temperature (°C)', 0, 0); ctx.restore()

    for (let v = 2; v <= 9; v += 2) {
      ctx.fillText(v, toX(v), H - pad + 16)
    }
    ctx.textAlign = 'right'
    for (let t = 60; t <= 95; t += 10) {
      ctx.fillText(t, pad - 6, toY(t) + 4)
    }

    // Decision boundary line  (vib ≈ 5.5)
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.moveTo(toX(5.5), pad)
    ctx.lineTo(toX(5.5), H - pad)
    ctx.stroke()
    ctx.setLineDash([])

    // Boundary label
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 11px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Decision Boundary', toX(5.5), pad - 8)

    // Zone labels
    ctx.font = 'bold 12px system-ui'
    ctx.fillStyle = '#16a34a'
    ctx.fillText('SAFE ZONE', toX(3.5), pad + 18)
    ctx.fillStyle = '#dc2626'
    ctx.fillText('DANGER ZONE', toX(8), pad + 18)

    // Data points
    points.forEach(([v, t, f]) => {
      ctx.beginPath()
      ctx.arc(toX(v), toY(t), 5, 0, Math.PI * 2)
      ctx.fillStyle = f ? '#ef4444' : '#22c55e'
      ctx.globalAlpha = 0.75
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = f ? '#b91c1c' : '#15803d'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Pump current position
    const px = toX(pump.vib)
    const py = toY(pump.temp)

    // Pulse ring
    ctx.beginPath()
    ctx.arc(px, py, 14, 0, Math.PI * 2)
    ctx.strokeStyle = '#7c3aed'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // Pump dot
    ctx.beginPath()
    ctx.arc(px, py, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#7c3aed'
    ctx.fill()
    ctx.strokeStyle = '#4c1d95'
    ctx.lineWidth = 2
    ctx.stroke()

    // Pump label
    ctx.fillStyle = '#7c3aed'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('YOUR PUMP', px + 12, py - 8)
    ctx.font = '10px system-ui'
    ctx.fillStyle = '#6d28d9'
    ctx.fillText('(7.2 mm/s, 89°C)', px + 12, py + 6)
  }, [])

  const handleClick = () => {
    setClicked(true)
    const isInDanger = pump.vib > 5.5
    setResult(isInDanger ? 'FAILURE' : 'SAFE')
  }

  return (
    <>
    <SectionBlock icon="?" title="Section 1: The Binary Question" color="#7c3aed">
      <Neuron
        mood="thinking"
        size="small"
        message="Here is a pump right now. Vibration is 7.2 mm/s — elevated. Temperature is 89°C — running hot. Lifecycle ratio 0.85 — old. The entire question of failure classification is: will this pump fail in the next 30 days? YES or NO. That binary answer is worth lakhs of rupees."
      />

      <HindiExplainer
        concept="बाइनरी क्लासिफिकेशन — हां या ना"
        english="Binary Classification"
        explanation="Machine learning में सबसे सरल सवाल: क्या यह machine fail होगी? हां या ना। यही binary classification है — दो ही options। pump का vibration और temperature देखकर model decide करता है कि यह 'safe zone' में है या 'danger zone' में।"
        example="जैसे doctor blood test देखकर कहता है 'diabetes है या नहीं' — ठीक वैसे ही हमारा model sensor readings देखकर कहता है 'failure होगी या नहीं।'"
        terms={[
          { hindi: 'द्विआधारी वर्गीकरण', english: 'Binary Classification', meaning: 'दो categories में बांटना — हां/ना, fail/safe' },
          { hindi: 'निर्णय सीमा', english: 'Decision Boundary', meaning: 'वह रेखा जो safe और danger zone को अलग करती है' },
          { hindi: 'विशेषता स्थान', english: 'Feature Space', meaning: 'vibration और temperature का 2D graph' },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Vibration', value: '7.2 mm/s', status: 'elevated', color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Temperature', value: '89°C', status: 'high', color: '#ef4444', bg: '#fee2e2' },
            { label: 'Lifecycle', value: '0.85', status: 'aging', color: '#8b5cf6', bg: '#ede9fe' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg,
              border: `1.5px solid ${s.color}44`,
              borderRadius: 14,
              padding: '14px 18px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: '6px 0' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, opacity: 0.8 }}>({s.status})</div>
            </div>
          ))}
        </div>

        <canvas
          ref={canvasRef}
          width={680}
          height={380}
          style={{ width: '100%', maxWidth: 680, display: 'block', margin: '0 auto', borderRadius: 14, border: '1px solid var(--border)' }}
        />

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleClick}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 18px #7c3aed44',
            }}
          >
            Which side does the pump fall on?
          </motion.button>
        </div>

        <AnimatePresence>
          {clicked && result && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 18,
                padding: '20px 28px',
                background: result === 'FAILURE' ? '#fee2e2' : '#d1fae5',
                border: `2px solid ${result === 'FAILURE' ? '#ef4444' : '#10b981'}`,
                borderRadius: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: result === 'FAILURE' ? '#dc2626' : '#059669' }}>
                {result === 'FAILURE' ? 'PREDICTED: FAILURE' : 'PREDICTED: SAFE'}
              </div>
              <div style={{ fontSize: 15, color: '#374151', marginTop: 8 }}>
                {result === 'FAILURE'
                  ? 'Vibration 7.2 mm/s is ABOVE the 5.5 threshold. This pump is in the DANGER ZONE. The model predicts failure within 30 days. Schedule maintenance NOW.'
                  : 'Readings are within normal range. Model predicts no failure in 30 days.'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NeuronTip type="example">
        The yellow dashed line is the decision boundary — learned from hundreds of past failures. Points to the right = danger zone. Your pump at (7.2, 89) lands well into the danger zone. Green dots = machines that survived. Red dots = machines that failed.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="बाइनरी सवाल — fail होगा या नहीं?"
      english="Binary Classification Question"
      explanation="Classification का सबसे simple सवाल: हां या ना? Pump fail होगा = 1, नहीं होगा = 0। ML model scatter plot देखकर एक decision boundary line खींचता है — उस line के एक तरफ safe machines, दूसरी तरफ failing machines। जैसे doctor बोलता है 'sugar normal range में है या नहीं' — exactly वैसे ही।"
      example="Pump vibration 7.2 mm/s और temperature 89°C — ये दोनों readings decision boundary के 'danger side' पर हैं। Model confidently कहता है: यह pump 30 दिन में FAIL होगा।"
      terms={[
        { hindi: 'द्विआधारी वर्गीकरण', english: 'Binary Classification', meaning: 'सिर्फ दो answers — fail (1) या safe (0)' },
        { hindi: 'निर्णय सीमा', english: 'Decision Boundary', meaning: 'वह line जो safe zone और danger zone को अलग करती है' },
        { hindi: 'विशेषता स्थान', english: 'Feature Space', meaning: 'vibration और temperature का 2D graph जहां prediction होती है' },
      ]}
    />
    </>
  )
}

/* ----------------------------------------------------------------
   SECTION 2: Class Imbalance Problem
---------------------------------------------------------------- */
function ClassImbalance() {
  const [modelType, setModelType] = useState('dumb') // 'dumb' | 'balanced'
  const total = 1000
  const failures = 50
  const safe = total - failures

  const metrics = {
    dumb: {
      accuracy: 95.0,
      caughtFailures: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      tp: 0, fp: 0, fn: failures, tn: safe,
    },
    balanced: {
      accuracy: 88.0,
      caughtFailures: 40,
      precision: 62.5,
      recall: 80.0,
      f1: 70.1,
      tp: 40, fp: 24, fn: 10, tn: safe - 24,
    },
  }
  const m = metrics[modelType]

  const squares = Array.from({ length: 100 }, (_, i) => i < 95 ? 0 : 1) // 95 safe, 5 failures per 100

  return (
    <>
    <SectionBlock icon="!" title="Section 2: The Class Imbalance Problem" color="#ef4444">
      <Neuron
        mood="explaining"
        size="small"
        message="Out of 1000 machines, only 50 will fail — that is 5%. A lazy model that ALWAYS says 'no failure' gets 95% accuracy. Impressive? No. It catches ZERO actual failures. This is the class imbalance trap. In PdM, the rare events — failures — are exactly what we care about."
      />

      <HindiExplainer
        concept="वर्ग असंतुलन — जब rare events matter करते हैं"
        english="Class Imbalance"
        explanation="1000 machines में से 950 ठीक हैं, सिर्फ 50 fail होंगी। अगर model हमेशा 'no failure' बोले, तो 95% accurate होगा — लेकिन एक भी failure नहीं पकड़ेगा! यही trap है। Solution: class weights या oversampling — failures को 'ज़्यादा महत्वपूर्ण' बताना model को।"
        example="जैसे 100 emails में से 95 normal हैं, 5 spam। अगर spam filter हर email को 'safe' बोले — 95% accurate होगा लेकिन कोई काम का नहीं!"
        terms={[
          { hindi: 'वर्ग असंतुलन', english: 'Class Imbalance', meaning: 'एक class बहुत कम, दूसरी बहुत ज़्यादा' },
          { hindi: 'वर्ग भार', english: 'Class Weight', meaning: 'failures को ज़्यादा penalty देना model को' },
          { hindi: 'अति-नमूनाकरण', english: 'Oversampling (SMOTE)', meaning: 'failure examples को artificially बढ़ाना' },
        ]}
      />

      <div style={{ marginTop: 20 }}>
        {/* Dataset visualization */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Dataset: 1000 Machine Records
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {squares.map((f, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.005 }}
                style={{
                  width: 14, height: 14,
                  borderRadius: 3,
                  background: f ? '#ef4444' : '#22c55e',
                  opacity: f ? 1 : 0.7,
                }}
                title={f ? 'Failure' : 'Safe'}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} />
              <span style={{ color: '#15803d', fontWeight: 600 }}>950 No Failure (95%)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />
              <span style={{ color: '#dc2626', fontWeight: 600 }}>50 Failure (5%)</span>
            </span>
          </div>
        </div>

        {/* Model toggle */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { key: 'dumb', label: 'Dumb Model (always "no failure")', color: '#94a3b8' },
            { key: 'balanced', label: 'Balanced Model (class weights)', color: '#10b981' },
          ].map(opt => (
            <motion.button
              key={opt.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModelType(opt.key)}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: 12,
                border: `2px solid ${modelType === opt.key ? opt.color : '#e2e8f0'}`,
                background: modelType === opt.key ? `${opt.color}18` : 'var(--bg-card)',
                color: modelType === opt.key ? opt.color : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <motion.div
            key={`acc-${modelType}`}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: modelType === 'dumb' ? '#fee2e2' : '#d1fae5',
              borderRadius: 14,
              padding: '18px 22px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Accuracy</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: modelType === 'dumb' ? '#dc2626' : '#059669', margin: '6px 0' }}>
              {m.accuracy}%
            </div>
            {modelType === 'dumb' && (
              <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Looks great... but useless!</div>
            )}
          </motion.div>

          <motion.div
            key={`caught-${modelType}`}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: m.caughtFailures === 0 ? '#fef2f2' : '#f0fdf4',
              borderRadius: 14,
              padding: '18px 22px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Failures Caught</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: m.caughtFailures === 0 ? '#dc2626' : '#059669', margin: '6px 0' }}>
              {m.caughtFailures} / 50
            </div>
            {m.caughtFailures === 0 && (
              <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>ZERO failures caught!</div>
            )}
          </motion.div>
        </div>

        {/* Confusion Matrix Summary */}
        <div style={{ marginTop: 16, background: 'var(--bg-secondary)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Confusion Matrix</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'True Positive', val: m.tp, color: '#059669', bg: '#d1fae5', desc: 'Correctly predicted failure' },
              { label: 'False Positive', val: m.fp, color: '#d97706', bg: '#fef3c7', desc: 'Predicted failure, was fine' },
              { label: 'False Negative', val: m.fn, color: '#dc2626', bg: '#fee2e2', desc: 'Missed real failure!' },
              { label: 'True Negative', val: m.tn, color: '#2563eb', bg: '#dbeafe', desc: 'Correctly predicted safe' },
            ].map(cell => (
              <motion.div
                key={`${cell.label}-${modelType}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ background: cell.bg, borderRadius: 10, padding: '12px 14px' }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: cell.color, textTransform: 'uppercase' }}>{cell.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: cell.color }}>{cell.val}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{cell.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <NeuronTip type="warning">
        A 95% accurate model that catches ZERO failures is WORSE than random in PdM. Always check recall for the failure class — not just overall accuracy!
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="वर्ग असंतुलन — 5% failures vs 95% normal, model confuse हो जाता है"
      english="Class Imbalance Problem"
      explanation="1000 pumps में से सिर्फ 50 fail होते हैं — 95% data normal है। अगर model हर बार 'safe' बोले तो 95% accurate होगा लेकिन एक भी failure नहीं पकड़ेगा! यही class imbalance problem है। इसे fix करने के लिए SMOTE (synthetic data बनाना) या class weights use करते हैं।"
      example="Factory: 1000 pumps में 950 ठीक, 50 खराब। Dumb model कहता है 'सब ठीक' → 95% accuracy, 0 failures caught! Smart balanced model: 85% accuracy, 42/50 failures caught → यही असली accuracy है।"
      terms={[
        { hindi: 'वर्ग असंतुलन', english: 'Class Imbalance', meaning: 'एक class दूसरे से बहुत ज़्यादा है (950 safe vs 50 fail)' },
        { hindi: 'SMOTE', english: 'SMOTE (Synthetic Oversampling)', meaning: 'minority class के artificial examples बनाना' },
        { hindi: 'वर्ग भार', english: 'Class Weights', meaning: 'failure examples को ज़्यादा weight देना ताकि model ध्यान दे' },
      ]}
    />
    </>
  )
}

/* ----------------------------------------------------------------
   SECTION 3: Confusion Matrix Interactive
---------------------------------------------------------------- */
function ConfusionMatrixSection() {
  const [threshold, setThreshold] = useState(0.5)

  // Simulated model: as threshold decreases, TP goes up, FP goes up
  // as threshold increases, TP goes down, FN goes up
  const computeMatrix = (t) => {
    // total positives = 50, total negatives = 950
    const totalPos = 50
    const totalNeg = 950
    // recall decreases as threshold increases
    const recall = Math.min(0.96, Math.max(0.1, 1 - (t - 0.1) * 1.07))
    const fpr = Math.min(0.35, Math.max(0.005, 0.38 - t * 0.68))
    const tp = Math.round(recall * totalPos)
    const fn = totalPos - tp
    const fp = Math.round(fpr * totalNeg)
    const tn = totalNeg - fp
    return { tp, fn, fp, tn }
  }

  const { tp, fn, fp, tn } = computeMatrix(threshold)
  const precision = tp + fp > 0 ? ((tp / (tp + fp)) * 100).toFixed(1) : '0.0'
  const recall = tp + fn > 0 ? ((tp / (tp + fn)) * 100).toFixed(1) : '0.0'
  const f1Raw = parseFloat(precision) + parseFloat(recall) > 0
    ? (2 * parseFloat(precision) * parseFloat(recall)) / (parseFloat(precision) + parseFloat(recall))
    : 0
  const f1 = f1Raw.toFixed(1)

  const cells = [
    {
      label: 'True Positive',
      sub: 'Predicted FAIL, actually FAIL',
      value: tp,
      icon: 'check',
      color: '#059669',
      bg: '#d1fae5',
      border: '#6ee7b7',
      meaning: 'Pump saved! Maintenance scheduled, breakdown prevented.',
    },
    {
      label: 'False Positive',
      sub: 'Predicted FAIL, actually FINE',
      value: fp,
      icon: 'warn',
      color: '#d97706',
      bg: '#fef3c7',
      border: '#fde68a',
      meaning: 'Wasted maintenance trip. Annoying, but not catastrophic.',
    },
    {
      label: 'False Negative',
      sub: 'Predicted FINE, actually FAIL',
      value: fn,
      icon: 'x',
      color: '#dc2626',
      bg: '#fee2e2',
      border: '#fca5a5',
      meaning: 'PUMP EXPLODED! No warning given. Production halted.',
    },
    {
      label: 'True Negative',
      sub: 'Predicted FINE, actually FINE',
      value: tn,
      icon: 'check',
      color: '#2563eb',
      bg: '#dbeafe',
      border: '#93c5fd',
      meaning: 'Correct — no unnecessary maintenance needed.',
    },
  ]

  return (
    <>
    <SectionBlock icon="grid" title="Section 3: Confusion Matrix Interactive" color="#2563eb">
      <Neuron
        mood="explaining"
        size="small"
        message="The confusion matrix is the truth table of your classifier. Four cells: TP, TN, FP, FN. In PdM, a False Negative — predicting 'fine' when the pump is about to explode — is catastrophic. A False Positive just wastes a maintenance trip. Move the threshold slider and watch the trade-off."
      />

      <HindiExplainer
        concept="कन्फ्यूज़न मैट्रिक्स — model की सच्चाई"
        english="Confusion Matrix"
        explanation="Model हमेशा perfect नहीं होता। 4 cases होते हैं: (1) सही failure पकड़ी (TP), (2) झूठी alarm (FP), (3) failure miss की — DANGEROUS (FN), (4) सही ठीक बोला (TN)। PdM में FN सबसे ख़तरनाक है — machine fail होगी और हमें पता नहीं!"
        example="जैसे COVID test: positive है और test positive आया (TP) ✓, negative है पर test positive आया (FP) — quarantine waste, negative है और test negative आया (TN) ✓, positive है पर test negative आया (FN) — खतरनाक! बाहर घूमेगा।"
        terms={[
          { hindi: 'सच्चा सकारात्मक', english: 'True Positive', meaning: 'failure थी, सही पकड़ी' },
          { hindi: 'गलत सकारात्मक', english: 'False Positive', meaning: 'failure नहीं थी, पर model ने कहा failure' },
          { hindi: 'गलत नकारात्मक', english: 'False Negative', meaning: 'failure थी, model ने कहा ठीक है — सबसे बुरा!' },
          { hindi: 'सीमा', english: 'Threshold', meaning: 'वह probability level जिससे ऊपर model failure बोलता है' },
        ]}
      />

      <div style={{ marginTop: 20 }}>
        {/* Threshold slider */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '18px 22px', marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Decision Threshold</span>
            <span style={{
              fontSize: 22, fontWeight: 800,
              color: threshold < 0.4 ? '#059669' : threshold > 0.7 ? '#dc2626' : '#d97706',
            }}>{threshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.01}
            value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#6366f1' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            <span>0.1 — Aggressive (catch everything)</span>
            <span>0.9 — Conservative (very selective)</span>
          </div>
        </div>

        {/* Confusion matrix grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {cells.map(cell => (
            <motion.div
              key={cell.label}
              animate={{ backgroundColor: cell.bg }}
              transition={{ duration: 0.3 }}
              style={{
                border: `2px solid ${cell.border}`,
                borderRadius: 16,
                padding: '20px 22px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: cell.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {cell.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{cell.sub}</div>
                </div>
                <span style={{ fontSize: 20 }}>
                  {cell.icon === 'check' ? '✓' : cell.icon === 'warn' ? '⚠' : '✗'}
                </span>
              </div>
              <motion.div
                key={cell.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                style={{ fontSize: 40, fontWeight: 800, color: cell.color, lineHeight: 1 }}
              >
                {cell.value}
              </motion.div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 8, fontStyle: 'italic' }}>
                {cell.meaning}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Derived metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Precision', value: `${precision}%`, color: '#6366f1' },
            { label: 'Recall', value: `${recall}%`, color: '#059669' },
            { label: 'F1 Score', value: `${f1}%`, color: '#0ea5e9' },
          ].map(metric => (
            <motion.div
              key={`${metric.label}-${threshold}`}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              style={{
                background: `${metric.color}12`,
                border: `1.5px solid ${metric.color}33`,
                borderRadius: 12,
                padding: '14px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: metric.color, textTransform: 'uppercase' }}>{metric.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: metric.color, margin: '4px 0' }}>{metric.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <NeuronTip type="warning">
        In PdM, a False Negative is far worse than a False Positive. An FP wastes one maintenance trip (maybe ₹5,000). An FN means the pump explodes — ₹45 lakhs in downtime. Always tune your threshold to minimize FN, even at the cost of more FP.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="कन्फ्यूज़न मैट्रिक्स — model ने क्या सही किया, क्या गलत?"
      english="Confusion Matrix"
      explanation="Confusion matrix एक 2×2 table है जो बताता है कि model ने कहां सही और कहां गलत predict किया। चार possibilities: True Positive (failure था, पकड़ा), True Negative (safe था, safe बोला), False Positive (safe था, alarm बजाया), False Negative (failure था, miss किया)। PdM में FN सबसे dangerous है — failure miss हुई!"
      example="100 failures में: TP=82 (पकड़े), FN=18 (miss)। 900 normal में: TN=870 (सही), FP=30 (false alarm)। FN cost = ₹45L × 18 = ₹8.1 crore! FP cost = ₹5K × 30 = ₹1.5L। इसलिए FN minimize करना priority #1 है।"
      terms={[
        { hindi: 'सच्चा सकारात्मक', english: 'True Positive (TP)', meaning: 'failure था, model ने failure बोला — सही!' },
        { hindi: 'झूठा नकारात्मक', english: 'False Negative (FN)', meaning: 'failure था लेकिन model ने safe बोला — सबसे खतरनाक गलती' },
        { hindi: 'झूठा सकारात्मक', english: 'False Positive (FP)', meaning: 'safe था लेकिन model ने alarm बजाया — costly लेकिन safe' },
      ]}
    />
    </>
  )
}

/* ----------------------------------------------------------------
   SECTION 4: Precision, Recall, F1 Score
---------------------------------------------------------------- */
function MetricsSection() {
  const [threshold, setThreshold] = useState(0.5)

  const computeMetrics = (t) => {
    const totalPos = 50
    const totalNeg = 950
    const recall = Math.min(0.96, Math.max(0.06, 1 - (t - 0.1) * 1.07))
    const fpr = Math.min(0.35, Math.max(0.003, 0.38 - t * 0.68))
    const tp = Math.round(recall * totalPos)
    const fn = totalPos - tp
    const fp = Math.round(fpr * totalNeg)
    const prec = tp + fp > 0 ? tp / (tp + fp) : 0
    const rec = tp / (tp + fn)
    const f1 = prec + rec > 0 ? 2 * prec * rec / (prec + rec) : 0
    return { prec, rec, f1, tp, fn, fp }
  }

  const { prec, rec, f1, tp, fn, fp } = computeMetrics(threshold)

  const bars = [
    { label: 'Precision', formula: 'TP / (TP + FP)', value: prec, color: '#6366f1', desc: 'Of all predicted failures, how many were real?' },
    { label: 'Recall', formula: 'TP / (TP + FN)', value: rec, color: '#059669', desc: 'Of all real failures, how many did we catch?' },
    { label: 'F1 Score', formula: '2 × P × R / (P + R)', value: f1, color: '#0ea5e9', desc: 'Harmonic mean of Precision and Recall' },
  ]

  return (
    <>
    <SectionBlock icon="%" title="Section 4: Precision, Recall & F1 Score" color="#059669">
      <Neuron
        mood="explaining"
        size="small"
        message="Accuracy lies. In PdM, you need Precision and Recall. Precision: of all the alarms I raised, how many were real? Recall: of all real failures, how many did I catch? They trade off: push one up and the other goes down. F1 is the harmonic mean that balances them. In PdM, Recall wins — missing a real failure is catastrophic."
      />

      <HindiExplainer
        concept="Precision, Recall, F1 — तीन ज़रूरी numbers"
        english="Precision, Recall, F1"
        explanation="Precision = alarm की quality (कितने सच्चे थे alarms?). Recall = failure की coverage (कितनी failures पकड़ी?). F1 = दोनों का balance। PdM में Recall > Precision क्योंकि failure miss करना = machine blast!"
        example="Fire alarm analogy: High Recall = हर छोटी आग पर alarm बजता है (कोई fire miss नहीं), लेकिन कभी-कभी झूठा alarm। High Precision = alarm बजे तो पक्की fire है, लेकिन कुछ fires miss हो सकती हैं। Factory में चाहिए High Recall!"
        terms={[
          { hindi: 'परिशुद्धता', english: 'Precision', meaning: 'predicted failures में से कितनी real थीं' },
          { hindi: 'स्मरण', english: 'Recall (Sensitivity)', meaning: 'real failures में से कितनी पकड़ी' },
          { hindi: 'F1 स्कोर', english: 'F1 Score', meaning: 'Precision और Recall का harmonic mean' },
        ]}
      />

      <div style={{ marginTop: 20 }}>
        {/* Threshold slider */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Threshold: {threshold.toFixed(2)}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>TP={tp}  FN={fn}  FP={fp}</span>
          </div>
          <input
            type="range" min={0.1} max={0.9} step={0.01} value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#059669' }}
          />
        </div>

        {/* Animated bar chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {bars.map(bar => (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: bar.color }}>{bar.label}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>= {bar.formula}</span>
                </div>
                <motion.span
                  key={bar.value.toFixed(3)}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 20, fontWeight: 800, color: bar.color }}
                >
                  {(bar.value * 100).toFixed(1)}%
                </motion.span>
              </div>
              <div style={{ background: '#e2e8f0', borderRadius: 8, height: 22, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${(bar.value * 100).toFixed(1)}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${bar.color}, ${bar.color}bb)`,
                    borderRadius: 8,
                    minWidth: 4,
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{bar.desc}</div>
            </div>
          ))}
        </div>

        {/* PdM insight callout */}
        <motion.div
          style={{
            marginTop: 22,
            padding: '16px 20px',
            background: threshold < 0.4
              ? '#d1fae5'
              : threshold > 0.7 ? '#fee2e2' : '#fef3c7',
            borderRadius: 14,
            border: `1.5px solid ${threshold < 0.4 ? '#6ee7b7' : threshold > 0.7 ? '#fca5a5' : '#fde68a'}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
            {threshold < 0.4
              ? `Threshold ${threshold.toFixed(2)}: Aggressive — High Recall (${(rec*100).toFixed(0)}%), catches most failures but many false alarms.`
              : threshold > 0.7
              ? `Threshold ${threshold.toFixed(2)}: Conservative — High Precision (${(prec*100).toFixed(0)}%) but LOW Recall (${(rec*100).toFixed(0)}%) — too many failures missed!`
              : `Threshold ${threshold.toFixed(2)}: Balanced — F1 = ${(f1*100).toFixed(1)}%. Decent trade-off for PdM.`}
          </div>
        </motion.div>
      </div>

      <NeuronTip type="tip">
        For predictive maintenance, target Recall above 80% on the failure class. Precision matters too — too many false alarms and the maintenance team starts ignoring alerts ("cry wolf" effect). Aim for F1 above 70%.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="Precision, Recall, F1 — तीन अलग-अलग report cards"
      english="Precision, Recall & F1 Score"
      explanation="Precision = जितनी बार alarm बजाया उसमें कितने सच्चे थे। Recall = जितनी failures थीं उनमें से कितनी पकड़ीं। F1 = दोनों का balanced average। PdM में Recall ज़्यादा important है — एक missed failure = crores का नुकसान। 'सब alarm' बोलने से 100% Recall मिलेगा लेकिन 0% Precision — इसलिए balance ज़रूरी है।"
      example="Doctor analogy: Precision = 10 patients को cancer बताया, 8 को actually था → 80% precision। Recall = 12 cancer patients में से 8 पकड़े → 67% recall। F1 = 72.7%। PdM में हम Recall 85%+ target करते हैं।"
      terms={[
        { hindi: 'परिशुद्धता', english: 'Precision', meaning: 'alarm में से कितने सच्चे failures थे' },
        { hindi: 'स्मरण', english: 'Recall (Sensitivity)', meaning: 'actual failures में से कितने पकड़े — PdM में यह priority #1 है' },
        { hindi: 'F1 स्कोर', english: 'F1 Score', meaning: 'Precision और Recall का harmonic mean — balanced metric' },
      ]}
    />
    </>
  )
}

/* ----------------------------------------------------------------
   SECTION 5: ROC Curve Builder
---------------------------------------------------------------- */
function ROCCurve() {
  const canvasRef = useRef(null)
  const [quality, setQuality] = useState(3) // 1=random, 2=poor, 3=decent, 4=good, 5=excellent
  const [selectedPoint, setSelectedPoint] = useState(null)

  const qualityLabels = ['Random', 'Poor', 'Decent', 'Good', 'Excellent']
  const aucValues = [0.5, 0.65, 0.78, 0.88, 0.95]

  const models = [
    { name: 'Random Forest', color: '#3b82f6', aucBase: 0.88 },
    { name: 'Logistic Regression', color: '#94a3b8', aucBase: 0.74 },
    { name: 'XGBoost', color: '#10b981', aucBase: 0.94 },
  ]

  const generateROCPoints = (auc) => {
    const pts = [{ fpr: 0, tpr: 0 }]
    const n = 40
    for (let i = 1; i <= n; i++) {
      const fpr = i / n
      const tpr = Math.min(1, Math.pow(fpr, Math.pow(1 - auc + 0.01, 1.4)))
      pts.push({ fpr, tpr })
    }
    pts.push({ fpr: 1, tpr: 1 })
    return pts
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const pad = 60

    ctx.clearRect(0, 0, W, H)

    const toX = fpr => pad + fpr * (W - pad * 2)
    const toY = tpr => H - pad - tpr * (H - pad * 2)

    // Grid
    ctx.strokeStyle = 'rgba(148,163,184,0.2)'
    ctx.lineWidth = 1
    for (let v = 0; v <= 1; v += 0.2) {
      ctx.beginPath(); ctx.moveTo(toX(v), pad); ctx.lineTo(toX(v), H - pad); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(pad, toY(v)); ctx.lineTo(W - pad, toY(v)); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.lineTo(W - pad, H - pad); ctx.stroke()

    // Labels
    ctx.fillStyle = '#64748b'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('False Positive Rate (FPR)', W / 2, H - 10)
    ctx.save(); ctx.translate(16, H / 2); ctx.rotate(-Math.PI / 2)
    ctx.fillText('True Positive Rate (TPR / Recall)', 0, 0); ctx.restore()

    for (let v = 0; v <= 1; v += 0.2) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(v.toFixed(1), toX(v), H - pad + 16)
      ctx.textAlign = 'right'
      ctx.fillText(v.toFixed(1), pad - 6, toY(v) + 4)
    }

    // Random baseline
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.beginPath(); ctx.moveTo(toX(0), toY(0)); ctx.lineTo(toX(1), toY(1)); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('Random (AUC=0.5)', toX(0.52), toY(0.44))

    // Draw model curves
    const currentAUC = aucValues[quality - 1]
    models.forEach((model, mi) => {
      const adjustedAUC = Math.min(0.99, model.aucBase * (currentAUC / 0.88))
      const pts = generateROCPoints(adjustedAUC)

      ctx.beginPath()
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(toX(p.fpr), toY(p.tpr))
        else ctx.lineTo(toX(p.fpr), toY(p.tpr))
      })
      ctx.strokeStyle = model.color
      ctx.lineWidth = 2.5
      ctx.globalAlpha = 0.85
      ctx.stroke()
      ctx.globalAlpha = 1

      // AUC label
      ctx.fillStyle = model.color
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText(`${model.name} (AUC=${adjustedAUC.toFixed(2)})`, pad + 10, pad + 22 + mi * 18)
    })

    // Selected point indicator
    if (selectedPoint) {
      ctx.beginPath()
      ctx.arc(toX(selectedPoint.fpr), toY(selectedPoint.tpr), 7, 0, Math.PI * 2)
      ctx.fillStyle = '#f59e0b'
      ctx.fill()
    }

    // Current quality label
    ctx.fillStyle = '#475569'
    ctx.font = 'bold 13px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Model Quality: ${qualityLabels[quality - 1]}  |  Overall AUC: ${currentAUC}`, W / 2, H - pad + 32)
  }, [quality, selectedPoint])

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    const pad = 60
    const W = canvas.width
    const H = canvas.height
    const fpr = (cx - pad) / (W - pad * 2)
    const tpr = 1 - (cy - pad) / (H - pad * 2)
    if (fpr >= 0 && fpr <= 1 && tpr >= 0 && tpr <= 1) {
      const threshold = (1 - tpr + fpr) / 2
      setSelectedPoint({ fpr: parseFloat(fpr.toFixed(2)), tpr: parseFloat(tpr.toFixed(2)), threshold: Math.max(0, Math.min(1, threshold)).toFixed(2) })
    }
  }

  return (
    <>
    <SectionBlock icon="~" title="Section 5: ROC Curve Builder" color="#3b82f6">
      <Neuron
        mood="excited"
        size="small"
        message="The ROC curve shows model performance across ALL thresholds at once. The area under it — AUC — summarizes quality in one number. AUC 0.5 = random guessing. AUC 0.95 = excellent. Watch how XGBoost (green) beats Logistic Regression (gray) every time. Click the curve to see threshold values!"
      />

      <HindiExplainer
        concept="ROC Curve और AUC — model की quality एक number में"
        english="ROC Curve & AUC"
        explanation="ROC curve दिखाता है: अलग-अलग thresholds पर कितनी failures पकड़ी (TPR) vs कितनी false alarms आईं (FPR)। AUC = curve के नीचे का area। 0.5 = random (बेकार), 1.0 = perfect। XGBoost आमतौर पर सबसे ऊपर होता है PdM में।"
        example="जैसे security scanner airport पर: sensitivity बढ़ाओ (सब को scan करो) — ज़्यादा threats पकड़ोगे लेकिन queue बड़ी होगी। यही TPR vs FPR trade-off है।"
        terms={[
          { hindi: 'ROC वक्र', english: 'ROC Curve', meaning: 'सभी thresholds पर TPR vs FPR का graph' },
          { hindi: 'AUC', english: 'Area Under Curve', meaning: 'model quality का single number — 0.5 to 1.0' },
          { hindi: 'TPR', english: 'True Positive Rate', meaning: 'Recall — real failures में से पकड़ी गईं' },
          { hindi: 'FPR', english: 'False Positive Rate', meaning: 'safe machines में से false alarm rate' },
        ]}
      />

      <div style={{ marginTop: 20 }}>
        {/* Quality slider */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 20px', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Model Quality</span>
            <span style={{
              fontSize: 16, fontWeight: 800,
              color: quality < 3 ? '#ef4444' : quality === 3 ? '#d97706' : '#059669',
            }}>{qualityLabels[quality - 1]}</span>
          </div>
          <input
            type="range" min={1} max={5} step={1} value={quality}
            onChange={e => { setQuality(parseInt(e.target.value)); setSelectedPoint(null) }}
            style={{ width: '100%', accentColor: '#3b82f6' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
            {qualityLabels.map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          onClick={handleCanvasClick}
          style={{ width: '100%', maxWidth: 640, display: 'block', margin: '0 auto', borderRadius: 14, border: '1px solid var(--border)', cursor: 'crosshair' }}
        />

        <AnimatePresence>
          {selectedPoint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 14,
                padding: '14px 20px',
                background: '#fef3c7',
                border: '1.5px solid #fde68a',
                borderRadius: 14,
                fontSize: 14,
                color: '#92400e',
              }}
            >
              <strong>Selected point</strong> — FPR: {selectedPoint.fpr} | TPR (Recall): {selectedPoint.tpr} | Approx. Threshold: {selectedPoint.threshold}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUC comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
          {models.map((m, mi) => {
            const auc = Math.min(0.99, m.aucBase * (aucValues[quality - 1] / 0.88))
            return (
              <div key={m.name} style={{
                background: `${m.color}12`,
                border: `1.5px solid ${m.color}33`,
                borderRadius: 12,
                padding: '12px 14px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: m.color, textTransform: 'uppercase' }}>{m.name}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: m.color, margin: '4px 0' }}>{auc.toFixed(2)}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>AUC</div>
              </div>
            )
          })}
        </div>
      </div>

      <NeuronTip type="tip">
        XGBoost consistently achieves AUC 0.92+ on PdM datasets because it handles imbalanced classes and non-linear feature interactions natively. For interpretability, Random Forest at AUC 0.88+ is often preferred since you can explain feature importance to factory managers.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="ROC Curve और AUC — model की quality एक number में"
      english="ROC Curve & AUC Score"
      explanation="ROC curve दिखाता है कि अलग-अलग thresholds पर model का True Positive Rate vs False Positive Rate कैसा है। AUC (Area Under Curve) एक single number है जो बताता है model कितना अच्छा है। AUC = 0.5 means random guess, AUC = 1.0 means perfect। PdM में AUC 0.85+ acceptable है।"
      example="जैसे government exam का cut-off घटाने पर ज़्यादा लोग pass होते हैं लेकिन कुछ undeserving भी — वैसे ही threshold घटाने पर ज़्यादा failures पकड़ेंगे लेकिन false alarms भी बढ़ेंगे। ROC curve यही tradeoff दिखाता है।"
      terms={[
        { hindi: 'ROC वक्र', english: 'ROC Curve', meaning: 'threshold बदलने पर TP rate vs FP rate का graph' },
        { hindi: 'AUC', english: 'Area Under Curve', meaning: 'model quality का single number — 0.5 (random) से 1.0 (perfect)' },
        { hindi: 'सीमा', english: 'Threshold', meaning: 'इस probability से ऊपर model failure बोलेगा — tune करके balance बनाते हैं' },
      ]}
    />
    </>
  )
}

/* ----------------------------------------------------------------
   SECTION 6: Training Simulation
---------------------------------------------------------------- */
function TrainingSimulation() {
  const [step, setStep] = useState(0) // 0=dataset, 1=split, 2=training, 3=predictions, 4=metrics, 5=features
  const [progress, setProgress] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef(null)

  const features = ['Vibration RMS', 'Temperature', 'Lifecycle Ratio', 'MTBF Delta', 'Pressure', 'Current Draw', 'Bearing Freq', 'Temp Deviation']

  const predictions = [
    { id: 1, actual: 'FAIL', predicted: 'FAIL', conf: 94, correct: true },
    { id: 2, actual: 'SAFE', predicted: 'SAFE', conf: 89, correct: true },
    { id: 3, actual: 'FAIL', predicted: 'SAFE', conf: 51, correct: false },
    { id: 4, actual: 'SAFE', predicted: 'SAFE', conf: 96, correct: true },
    { id: 5, actual: 'FAIL', predicted: 'FAIL', conf: 87, correct: true },
    { id: 6, actual: 'SAFE', predicted: 'FAIL', conf: 63, correct: false },
    { id: 7, actual: 'FAIL', predicted: 'FAIL', conf: 91, correct: true },
    { id: 8, actual: 'SAFE', predicted: 'SAFE', conf: 98, correct: true },
  ]

  const finalMetrics = { precision: 83.3, recall: 80.0, f1: 81.6, auc: 0.91 }

  const featureImportance = [
    { name: 'Vibration RMS', imp: 0.31, color: '#6366f1' },
    { name: 'MTBF Delta', imp: 0.22, color: '#8b5cf6' },
    { name: 'Lifecycle Ratio', imp: 0.18, color: '#ec4899' },
    { name: 'Temp Deviation', imp: 0.12, color: '#f59e0b' },
    { name: 'Temperature', imp: 0.09, color: '#10b981' },
    { name: 'Current Draw', imp: 0.04, color: '#0ea5e9' },
    { name: 'Bearing Freq', imp: 0.02, color: '#6b7280' },
    { name: 'Pressure', imp: 0.02, color: '#6b7280' },
  ]

  const startTraining = () => {
    if (animating) return
    setAnimating(true)
    setProgress(0)
    let p = 0
    timerRef.current = setInterval(() => {
      p += Math.random() * 4 + 1
      if (p >= 100) {
        p = 100
        clearInterval(timerRef.current)
        setAnimating(false)
        setStep(3)
      }
      setProgress(Math.min(100, p))
    }, 80)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const stepLabels = ['Dataset', 'Split', 'Train', 'Predict', 'Metrics', 'Features']

  return (
    <>
    <SectionBlock icon="play" title="Section 6: Training a Failure Classifier" color="#10b981">
      <Neuron
        mood="excited"
        size="small"
        message="Let us walk through training a Random Forest classifier step by step. Dataset — split — train — predict — evaluate — feature importance. Click each step. This is the exact workflow used in production PdM systems."
      />

      <HindiExplainer
        concept="Model Training — step by step"
        english="Model Training Pipeline"
        explanation="1. Data load करो। 2. Train/test split करो (80/20)। 3. Model train करो — 100 decision trees बनाओ। 4. Test data पर predictions करो। 5. Metrics calculate करो। 6. Feature importance देखो — कौन सा sensor सबसे important है?"
        example="जैसे UPSC exam: study material collect करो (data), mock tests अलग रखो (test split), actual study करो (training), mock test दो (prediction), marks देखो (evaluation)।"
        terms={[
          { hindi: 'प्रशिक्षण-परीक्षण विभाजन', english: 'Train-Test Split', meaning: '80% training, 20% testing — model को test data नहीं देखना चाहिए' },
          { hindi: 'रैंडम फ़ॉरेस्ट', english: 'Random Forest', meaning: '100+ decision trees का ensemble — majority vote से decision' },
          { hindi: 'विशेषता महत्व', english: 'Feature Importance', meaning: 'कौन सा sensor failure predict करने में सबसे useful है' },
        ]}
      />

      <div style={{ marginTop: 20 }}>
        {/* Step navigation */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
          {stepLabels.map((label, i) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (i === 2) { setStep(2); startTraining() }
                else setStep(i)
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `2px solid ${step >= i ? '#10b981' : '#e2e8f0'}`,
                background: step === i ? '#10b981' : step > i ? '#d1fae5' : 'var(--bg-card)',
                color: step === i ? '#fff' : step > i ? '#059669' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {step > i ? '✓ ' : `${i + 1}. `}{label}
            </motion.button>
          ))}
        </div>

        {/* Step 0: Dataset */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b' }}>#</th>
                    {features.map(f => (
                      <th key={f} style={{ padding: '8px 12px', textAlign: 'right', color: '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}>{f}</th>
                    ))}
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }, (_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                      <td style={{ padding: '7px 12px', color: '#94a3b8' }}>{i + 1}</td>
                      {[3.2, 72, 0.45, 0.12, 4.1, 8.3, 120, 2.1].map((base, j) => (
                        <td key={j} style={{ padding: '7px 12px', textAlign: 'right', color: '#374151', fontFamily: 'monospace' }}>
                          {(base + Math.sin(i * (j + 1)) * base * 0.3).toFixed(2)}
                        </td>
                      ))}
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 20,
                          background: i === 2 || i === 5 ? '#fee2e2' : '#d1fae5',
                          color: i === 2 || i === 5 ? '#dc2626' : '#059669',
                          fontWeight: 700, fontSize: 11,
                        }}>{i === 2 || i === 5 ? 'FAIL' : 'SAFE'}</span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={10} style={{ padding: '10px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                      ... 192 more rows (200 total, ~10% failures)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 14, textAlign: 'right' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => setStep(1)}
                style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                Next: Train/Test Split →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Split */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
              <div style={{ flex: 4, background: '#d1fae5', border: '2px solid #6ee7b7', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', marginBottom: 8 }}>Training Set (80%)</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#059669' }}>160 rows</div>
                <div style={{ fontSize: 12, color: '#064e3b', marginTop: 6 }}>Model learns patterns from this data. Never sees test rows.</div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {Array.from({ length: 40 }, (_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: i < 4 ? '#ef4444' : '#22c55e', opacity: 0.8 }} />
                  ))}
                  <span style={{ fontSize: 10, color: '#94a3b8', alignSelf: 'center' }}>...4× more</span>
                </div>
              </div>
              <div style={{ flex: 1, background: '#dbeafe', border: '2px solid #93c5fd', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>Test Set (20%)</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#2563eb' }}>40 rows</div>
                <div style={{ fontSize: 12, color: '#1e3a5f', marginTop: 6 }}>Held out. Evaluation only.</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => setStep(0)}
                style={{ padding: '10px 22px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                ← Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => { setStep(2); startTraining() }}
                style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                Next: Train Model →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Training */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '22px 24px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Random Forest — Growing 100 Trees...
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                Each tree votes: failure or safe. Majority wins.
              </div>
              <div style={{ background: '#e2e8f0', borderRadius: 8, height: 28, overflow: 'hidden', marginBottom: 12 }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    borderRadius: 8,
                    transition: 'width 0.1s',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                <span>Trees grown: {Math.round(progress)}/100</span>
                <span>{progress.toFixed(0)}%{progress === 100 ? ' — Complete!' : ''}</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {Array.from({ length: 100 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.1 }}
                    animate={{ opacity: i < progress ? 1 : 0.15 }}
                    style={{
                      width: 18, height: 22,
                      background: i < progress ? '#10b981' : '#e2e8f0',
                      borderRadius: 3,
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {i < progress ? 'T' : ''}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Predictions */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Predictions on test set (showing 8 of 40):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {predictions.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: p.correct ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${p.correct ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: 10,
                    padding: '10px 16px',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#94a3b8', minWidth: 20 }}>#{p.id}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Actual: </span>
                    <span style={{
                      fontWeight: 700, fontSize: 13,
                      color: p.actual === 'FAIL' ? '#dc2626' : '#059669',
                    }}>{p.actual}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Predicted: </span>
                    <span style={{
                      fontWeight: 700, fontSize: 13,
                      color: p.predicted === 'FAIL' ? '#dc2626' : '#059669',
                    }}>{p.predicted}</span>
                  </div>
                  <div style={{
                    background: `${p.correct ? '#059669' : '#dc2626'}18`,
                    borderRadius: 8, padding: '4px 10px',
                    fontSize: 12, fontWeight: 700,
                    color: p.correct ? '#059669' : '#dc2626',
                  }}>
                    {p.conf}% conf
                  </div>
                  <span style={{ fontSize: 16 }}>{p.correct ? '✓' : '✗'}</span>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 14, textAlign: 'right' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => setStep(4)}
                style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                Next: View Metrics →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Metrics Dashboard */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {[
                { label: 'Precision', value: `${finalMetrics.precision}%`, color: '#6366f1', desc: '5 of 6 failure predictions were real' },
                { label: 'Recall', value: `${finalMetrics.recall}%`, color: '#059669', desc: 'Caught 4 of 5 actual failures' },
                { label: 'F1 Score', value: `${finalMetrics.f1}%`, color: '#0ea5e9', desc: 'Balanced metric — good for PdM' },
                { label: 'AUC-ROC', value: finalMetrics.auc, color: '#8b5cf6', desc: 'Excellent discrimination ability' },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    background: `${m.color}10`,
                    border: `2px solid ${m.color}33`,
                    borderRadius: 16,
                    padding: '20px 22px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: m.color, textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: m.color, margin: '6px 0' }}>{m.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{m.desc}</div>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 14, textAlign: 'right' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => setStep(5)}
                style={{ padding: '10px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                Next: Feature Importance →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Feature Importance */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Top Features by Importance (Random Forest)
            </div>
            {featureImportance.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ marginBottom: 12 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: f.color }}>{(f.imp * 100).toFixed(0)}%</span>
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: 6, height: 16, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.imp * 100}%` }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${f.color}, ${f.color}bb)`, borderRadius: 6 }}
                  />
                </div>
              </motion.div>
            ))}
            <div style={{ marginTop: 16, padding: '14px 18px', background: '#ede9fe', borderRadius: 12, fontSize: 13, color: '#5b21b6' }}>
              <strong>Insight:</strong> Vibration RMS and MTBF Delta account for 53% of predictive power. This tells the engineering team exactly which sensors are most critical to maintain and monitor.
            </div>
          </motion.div>
        )}
      </div>

      <NeuronTip type="try">
        In real PdM projects, feature importance from Random Forest guides sensor investment decisions. If "bearing frequency" has 2% importance, maybe that expensive sensor can be replaced with a cheaper vibration sensor that captures 31% of the signal.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="Model Training — data से सीखना, step by step"
      english="Model Training Pipeline"
      explanation="Training pipeline के steps: 1) Data collect करो, 2) Train/Test split करो (80/20), 3) Model को training data पर fit करो, 4) Test data पर predictions करो, 5) Metrics calculate करो। जैसे school में पढ़ाई → exam देना → marks आना। Model ने पढ़ा (train), exam दिया (predict), marks आए (evaluate)।"
      example="1000 pump records → 800 training, 200 testing। Random Forest trains on 800 examples in 2 seconds। Test करने पर: Accuracy 87%, Recall 84%, F1 81%। Feature importance: vibration_deviation 31%, mtbf_delta 22%, lifecycle_ratio 15%।"
      terms={[
        { hindi: 'प्रशिक्षण विभाजन', english: 'Train/Test Split', meaning: 'data को 80% training और 20% testing में बांटना' },
        { hindi: 'अनुकूलन', english: 'Model Fitting', meaning: 'model training data से patterns सीखता है' },
        { hindi: 'मूल्यांकन', english: 'Evaluation', meaning: 'test data पर performance check करना — unseen data पर कितना अच्छा?' },
      ]}
    />
    </>
  )
}

/* ----------------------------------------------------------------
   SECTION 7: Hindi Summary
---------------------------------------------------------------- */
function HindiSummary() {
  return (
    <SectionBlock icon="hi" title="Section 7: Hindi Summary — विफलता वर्गीकरण" color="#ff9933">
      <Neuron
        mood="waving"
        size="medium"
        message="तुमने आज binary classification सीखा — एक pump को देखकर बताना कि वो fail होगा या नहीं! जैसे एक experienced engineer हर पुरानी machine को देखकर समझ जाता है — वैसे ही ML model sensor data देखकर predict करता है। Factory में यह ML = crores bachane wala tool है!"
      />

      <div style={{ marginTop: 24 }}>
        <HindiExplainer
          concept="विफलता वर्गीकरण — पूरा सारांश"
          english="Failure Classification — Complete Summary"
          explanation="Binary classification एक machine के बारे में हां या ना का जवाब देता है। लेकिन PdM में 3 बड़ी challenges हैं: (1) Class Imbalance — failures बहुत कम होती हैं, (2) Metric Choice — accuracy नहीं, Recall देखो, (3) Threshold Tuning — कितनी sensitivity चाहिए? इन तीनों को master करो — production-ready PdM model बनेगा।"
          example="एक factory में 1000 machines हैं। हर महीने 50 fail होती हैं (5%)। Dumb model = 95% accurate लेकिन 0 failures caught। Balanced model = 88% accurate लेकिन 40/50 failures पकड़ी = ₹3.2 crore बचाए!"
          terms={[
            { hindi: 'वर्गीकरण', english: 'Classification', meaning: 'किसी चीज़ को एक category में डालना — fail / safe' },
            { hindi: 'विफलता', english: 'Failure', meaning: 'machine का काम करना बंद कर देना' },
            { hindi: 'परिशुद्धता', english: 'Precision', meaning: 'predicted failures में से कितनी real थीं — quality of alarms' },
            { hindi: 'स्मरण', english: 'Recall', meaning: 'real failures में से कितनी पकड़ी — coverage of actual failures' },
            { hindi: 'गलत सकारात्मक', english: 'False Positive', meaning: 'झूठा alarm — machine ठीक थी, हमने कहा fail होगी' },
            { hindi: 'गलत नकारात्मक', english: 'False Negative', meaning: 'missed failure — machine fail हुई, हमें पता नहीं था — सबसे dangerous!' },
            { hindi: 'सीमा', english: 'Threshold', meaning: 'वह probability level — इससे ऊपर = failure alert, नीचे = safe' },
            { hindi: 'वर्ग असंतुलन', english: 'Class Imbalance', meaning: 'failures बहुत कम (5%), safe बहुत ज़्यादा (95%) — model को special training चाहिए' },
          ]}
        />

        {/* Factory analogy cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 24 }}>
          {[
            {
              concept: 'Class Imbalance',
              hindi: 'वर्ग असंतुलन',
              analogy: 'जैसे 100 patients में से सिर्फ 5 को cancer है — doctor को rare disease पहचाननी है, common को नहीं',
              color: '#ef4444',
              bg: '#fee2e2',
            },
            {
              concept: 'Precision vs Recall',
              hindi: 'परिशुद्धता vs स्मरण',
              analogy: 'Security guard: सबको रोको (High Recall, Low Precision) vs सिर्फ confirmed threats रोको (High Precision, Low Recall)',
              color: '#6366f1',
              bg: '#ede9fe',
            },
            {
              concept: 'False Negative',
              hindi: 'गलत नकारात्मक',
              analogy: 'जैसे doctor ने कहा "सब ठीक है" लेकिन patient को cancer था — सबसे बड़ी गलती!',
              color: '#dc2626',
              bg: '#fef2f2',
            },
            {
              concept: 'Threshold',
              hindi: 'सीमा',
              analogy: 'AC का thermostat: 25°C से ऊपर AC चलाओ, नीचे बंद करो — यही threshold है ML में',
              color: '#0ea5e9',
              bg: '#e0f2fe',
            },
          ].map(card => (
            <motion.div
              key={card.concept}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                background: card.bg,
                border: `1.5px solid ${card.color}33`,
                borderRadius: 14,
                padding: '16px 18px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: card.color }}>{card.concept}</div>
              <div style={{ fontSize: 12, color: card.color, opacity: 0.8, marginBottom: 8 }}>{card.hindi}</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{card.analogy}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <NeuronTip type="simple">
        बड़ी बात एक sentence में: Failure Classification = sensor data देखकर बताना "fail होगी या नहीं" — लेकिन accuracy नहीं देखनी, Recall देखनी है क्योंकि failure miss करना = factory blast!
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic8Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 4px' }}>
      {/* Topic header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #7c3aed)',
          borderRadius: 22,
          padding: '36px 40px',
          marginBottom: 36,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -20,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              T
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1 }}>
                Topic 8 — Module 4: Machine Learning
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, margin: 0 }}>
                Failure Classification
              </h1>
            </div>
          </div>
          <p style={{ fontSize: 16, opacity: 0.88, lineHeight: 1.65, maxWidth: 620, margin: 0 }}>
            Will this machine fail in the next 30 days? YES or NO. Binary classification for PdM — with class imbalance handling, confusion matrices, precision/recall trade-offs, ROC curves, and a full training simulation.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            {['Binary Classification', 'Class Imbalance', 'Confusion Matrix', 'Precision/Recall', 'ROC Curve', 'Random Forest'].map(tag => (
              <span key={tag} style={{
                padding: '4px 12px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                backdropFilter: 'blur(6px)',
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Opening context */}
      <Neuron
        mood="thinking"
        size="medium"
        message="Your feature engineering is done. Lifecycle ratio, MTBF delta, vibration baseline deviation — all computed. Now the big question: can a machine learning model look at these numbers and predict a failure BEFORE it happens? The answer is yes — but only if you handle the class imbalance problem, choose the right metrics, and tune your threshold correctly. Let us build this together."
      />

      <div style={{ marginTop: 8 }} />

      <BinaryQuestion />
      <ClassImbalance />
      <ConfusionMatrixSection />
      <MetricsSection />
      <ROCCurve />
      <TrainingSimulation />
      <HindiSummary />

      {/* Closing neuron */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ marginBottom: 40 }}
      >
        <Neuron
          mood="excited"
          size="medium"
          message="You now have a complete binary classifier for machine failures! You understand class imbalance, confusion matrices, precision vs recall, ROC curves, and feature importance. Next up: Topic 9 — Remaining Useful Life. Classification told us IF a machine will fail. RUL tells us WHEN — in days, weeks, or months. That is where we move from YES/NO to actual maintenance scheduling."
        />
      </motion.div>
    </div>
  )
}
