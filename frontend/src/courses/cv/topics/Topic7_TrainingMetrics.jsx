import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 7 — Training & Evaluation Metrics
   Training loop, loss curves, IoU, precision/recall, mAP,
   confusion matrix — all interactive & animated
================================================================ */

/* ---- 1. Training Loop Animation ---- */
function TrainingLoop() {
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)
  const [iteration, setIteration] = useState(0)
  const [lossValue, setLossValue] = useState(2.45)
  const timerRef = useRef(null)

  const steps = [
    { id: 'forward', label: 'Forward Pass', icon: '>', detail: 'Image through model', color: '#3b82f6', sub: 'Input image passes through CNN layers to produce a prediction' },
    { id: 'loss', label: 'Loss Calculation', icon: '?', detail: 'Compare prediction vs truth', color: '#f59e0b', sub: 'Cross-entropy or MSE measures how wrong the prediction is' },
    { id: 'backward', label: 'Backward Pass', icon: '<', detail: 'Gradients flow back', color: '#ef4444', sub: 'Backpropagation computes gradient of loss w.r.t. each weight' },
    { id: 'update', label: 'Weight Update', icon: 'W', detail: 'Optimizer adjusts weights', color: '#10b981', sub: 'SGD / Adam nudges weights to reduce loss' },
  ]

  const runIteration = useCallback(() => {
    if (running) return
    setRunning(true)
    setActiveStep(-1)

    steps.forEach((_, i) => {
      setTimeout(() => setActiveStep(i), i * 900)
    })

    setTimeout(() => {
      setIteration(prev => prev + 1)
      setLossValue(prev => Math.max(0.05, prev * 0.78 + (Math.random() * 0.1 - 0.05)))
      setActiveStep(-1)
      setRunning(false)
    }, steps.length * 900 + 400)
  }, [running])

  const runAll = () => {
    setIteration(0)
    setLossValue(2.45)
    let count = 0
    const doOne = () => {
      if (count >= 6) return
      count++
      setRunning(true)
      setActiveStep(-1)
      steps.forEach((_, i) => {
        setTimeout(() => setActiveStep(i), i * 600)
      })
      setTimeout(() => {
        setIteration(prev => prev + 1)
        setLossValue(prev => Math.max(0.05, prev * 0.75 + (Math.random() * 0.08 - 0.04)))
        setActiveStep(-1)
        setRunning(false)
        setTimeout(doOne, 300)
      }, steps.length * 600 + 200)
    }
    doOne()
  }

  return (
    <SectionBlock icon="@" title="One Training Iteration" color="#3b82f6">
      <Neuron mood="explaining" message="Every training step follows the same loop: forward, loss, backward, update. Watch it in action!" size="small" />

      <HindiExplainer
        concept="ट्रेनिंग लूप — AI कैसे सीखता है"
        english="Training Loop"
        explanation="AI सीखने में बार-बार एक ही प्रक्रिया दोहराता है: तस्वीर देखो → अंदाज़ा लगाओ → ग़लती मापो → सुधार करो। हर बार थोड़ा बेहतर होता जाता है, जैसे प्रैक्टिस से।"
        example="जैसे क्रिकेट में बल्लेबाज़ी सीखना: गेंद आई → शॉट खेला → आउट हो गए (ग़लती) → कोच ने बताया कैसे सुधारें → अगली बार बेहतर खेला। AI भी ऐसे ही हर 'epoch' में सुधरता है!"
        terms={[
          { hindi: 'एपॉक', english: 'Epoch', meaning: 'पूरे डेटा पर एक बार ट्रेनिंग — जैसे एक chapter पूरा पढ़ना' },
          { hindi: 'फ़ॉरवर्ड पास', english: 'Forward Pass', meaning: 'तस्वीर देखकर अंदाज़ा लगाना' },
          { hindi: 'बैकवर्ड पास', english: 'Backward Pass', meaning: 'ग़लती से सीखकर वज़न सुधारना' },
          { hindi: 'लर्निंग रेट', english: 'Learning Rate', meaning: 'हर बार कितना सुधार करना — बड़ा = तेज़ पर अस्थिर, छोटा = धीमा पर सटीक' },
        ]}
      />

      <div style={{ position: 'relative', padding: '40px 0', marginTop: 20 }}>
        {/* Connection arrows */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          {steps.map((_, i) => {
            if (i >= steps.length - 1) return null
            const x1 = (i + 0.5) / steps.length * 100
            const x2 = (i + 1.5) / steps.length * 100
            return (
              <motion.line
                key={i}
                x1={`${x1}%`} y1="50%"
                x2={`${x2}%`} y2="50%"
                stroke={activeStep > i ? steps[i].color : 'var(--border)'}
                strokeWidth={activeStep > i ? 3 : 2}
                strokeDasharray={activeStep > i ? '0' : '8,4'}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
            )
          })}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-around', position: 'relative', zIndex: 1 }}>
          {steps.map((step, i) => {
            const isActive = activeStep === i
            const isDone = activeStep > i
            return (
              <motion.div
                key={step.id}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -8 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 10, width: 140,
                }}
              >
                {/* Glow */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{
                      position: 'absolute', width: 100, height: 100, borderRadius: '50%',
                      background: `${step.color}30`, filter: 'blur(20px)', zIndex: -1,
                    }}
                  />
                )}

                <motion.div
                  animate={{
                    background: isActive || isDone
                      ? `linear-gradient(135deg, ${step.color}, ${step.color}bb)`
                      : 'var(--bg-secondary)',
                    borderColor: isActive || isDone ? step.color : 'var(--border)',
                    boxShadow: isActive ? `0 0 25px ${step.color}60` : '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  style={{
                    width: 72, height: 72, borderRadius: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 900, color: isActive || isDone ? 'white' : 'var(--text-muted)',
                    border: '3px solid', fontFamily: 'monospace',
                  }}
                >
                  {isDone ? '✓' : step.icon}
                </motion.div>

                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
                  color: isActive ? step.color : isDone ? step.color : 'var(--text-muted)',
                  textAlign: 'center',
                }}>
                  {step.label}
                </div>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      style={{
                        fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center',
                        background: `${step.color}12`, padding: '8px 12px', borderRadius: 10,
                        border: `1px solid ${step.color}30`, maxWidth: 160,
                      }}
                    >
                      {step.sub}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Loss indicator & controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginTop: 16 }}>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: '16px 28px',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>ITERATION</div>
          <motion.div
            key={iteration}
            initial={{ scale: 1.3, color: '#3b82f6' }}
            animate={{ scale: 1, color: 'var(--text-primary)' }}
            style={{ fontSize: 32, fontWeight: 900, fontFamily: 'monospace' }}
          >
            {iteration}
          </motion.div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: '16px 28px',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>LOSS</div>
          <motion.div
            key={lossValue.toFixed(3)}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1, color: lossValue < 0.3 ? '#10b981' : lossValue < 1.0 ? '#f59e0b' : '#ef4444' }}
            style={{ fontSize: 32, fontWeight: 900, fontFamily: 'monospace' }}
          >
            {lossValue.toFixed(3)}
          </motion.div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={runIteration}
            disabled={running}
            style={{
              padding: '12px 24px', borderRadius: 12, border: 'none', cursor: running ? 'not-allowed' : 'pointer',
              background: running ? 'var(--border)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white', fontWeight: 700, fontSize: 14,
            }}
          >
            Step Once
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={runAll}
            disabled={running}
            style={{
              padding: '12px 24px', borderRadius: 12, border: '2px solid var(--accent)',
              cursor: running ? 'not-allowed' : 'pointer', background: 'transparent',
              color: 'var(--accent)', fontWeight: 700, fontSize: 14,
            }}
          >
            Run 6 Iterations
          </motion.button>
        </div>
      </div>

      <NeuronTip type="tip">
        As the loop repeats, watch the loss value decrease — the model is <strong>learning</strong>. Each iteration nudges the weights closer to the right answer.
      </NeuronTip>
    </SectionBlock>
  )
}


/* ---- 2. Loss Curve Playground ---- */
function LossCurvePlayground() {
  const [scenario, setScenario] = useState('good')
  const [progress, setProgress] = useState(0)
  const animRef = useRef(null)

  const scenarios = {
    good: {
      label: 'Good Training', color: '#10b981', icon: '✓',
      desc: 'Both train and validation loss decrease smoothly — model generalizes well.',
      train: (x) => 2.5 * Math.exp(-3 * x) + 0.15,
      val: (x) => 2.5 * Math.exp(-2.5 * x) + 0.25,
    },
    overfit: {
      label: 'Overfitting', color: '#ef4444', icon: '!',
      desc: 'Train loss keeps dropping but validation loss rises — model memorizes training data.',
      train: (x) => 2.5 * Math.exp(-4 * x) + 0.05,
      val: (x) => 2.5 * Math.exp(-2 * x) + 0.3 + (x > 0.35 ? (x - 0.35) * 3 : 0),
    },
    underfit: {
      label: 'Underfitting', color: '#f59e0b', icon: '~',
      desc: 'Both losses stay high — model is too simple or learning rate too low.',
      train: (x) => 2.0 * Math.exp(-0.5 * x) + 1.2,
      val: (x) => 2.2 * Math.exp(-0.4 * x) + 1.4,
    },
    lrHigh: {
      label: 'LR Too High', color: '#8b5cf6', icon: '^',
      desc: 'Loss oscillates wildly — the learning rate is so high the optimizer overshoots every step.',
      train: (x) => 1.5 + 1.2 * Math.sin(x * 18) * Math.exp(-0.5 * x),
      val: (x) => 1.8 + 1.4 * Math.sin(x * 18 + 0.5) * Math.exp(-0.3 * x),
    },
  }

  useEffect(() => {
    setProgress(0)
    let start = null
    const duration = 2000
    const animate = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      if (p < 1) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [scenario])

  const sc = scenarios[scenario]
  const W = 600
  const H = 300
  const pad = { top: 30, right: 30, bottom: 50, left: 60 }
  const gW = W - pad.left - pad.right
  const gH = H - pad.top - pad.bottom

  const buildPath = (fn, prog) => {
    const pts = []
    const steps = Math.floor(prog * 100)
    for (let i = 0; i <= steps; i++) {
      const x = i / 100
      const y = fn(x)
      const px = pad.left + x * gW
      const py = pad.top + gH - ((y - 0) / 3.5) * gH
      pts.push(`${i === 0 ? 'M' : 'L'}${px},${Math.max(pad.top, Math.min(pad.top + gH, py))}`)
    }
    return pts.join(' ')
  }

  return (
    <SectionBlock icon="~" title="Loss Curve Playground" color="#10b981">
      <Neuron mood="thinking" message="Loss curves tell the story of your training. Pick a scenario to see what different curves mean." size="small" />

      <HindiExplainer
        concept="लॉस फ़ंक्शन — ग़लती का पैमाना"
        english="Loss Function"
        explanation="लॉस एक संख्या है जो बताती है कि AI का अंदाज़ा कितना ग़लत था। ट्रेनिंग का लक्ष्य है इस लॉस को कम से कम करना। लॉस कम = AI बेहतर।"
        example="जैसे परीक्षा में ग़लत जवाबों की गिनती — जितने कम ग़लत, उतने अच्छे marks। लॉस curve देखकर पता चलता है कि AI सीख रहा है या नहीं।"
        terms={[
          { hindi: 'ओवरफ़िटिंग', english: 'Overfitting', meaning: 'AI ने ट्रेनिंग डेटा रट लिया — नई तस्वीर पर काम नहीं करता' },
          { hindi: 'अंडरफ़िटिंग', english: 'Underfitting', meaning: 'AI ने कुछ सीखा ही नहीं — ट्रेनिंग पर भी ख़राब' },
          { hindi: 'वैलिडेशन लॉस', english: 'Validation Loss', meaning: 'नई तस्वीरों पर ग़लती — असली परीक्षा' },
        ]}
      />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '20px 0' }}>
        {Object.entries(scenarios).map(([key, s]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setScenario(key)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: `2px solid ${scenario === key ? s.color : 'var(--border)'}`,
              background: scenario === key ? `${s.color}15` : 'var(--bg-secondary)',
              cursor: 'pointer', fontWeight: 700, fontSize: 13,
              color: scenario === key ? s.color : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {s.icon} {s.label}
          </motion.button>
        ))}
      </div>

      <motion.div
        key={scenario}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 16, padding: '12px 16px', background: `${sc.color}10`, borderRadius: 12, border: `1px solid ${sc.color}30` }}
      >
        {sc.desc}
      </motion.div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', overflow: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}>
          {/* Grid lines */}
          {[0, 0.5, 1, 1.5, 2, 2.5, 3].map(v => {
            const py = pad.top + gH - (v / 3.5) * gH
            return (
              <g key={v}>
                <line x1={pad.left} y1={py} x2={pad.left + gW} y2={py} stroke="var(--border)" strokeWidth={1} strokeDasharray="4,4" />
                <text x={pad.left - 10} y={py + 4} textAnchor="end" fill="var(--text-muted)" fontSize={11}>{v.toFixed(1)}</text>
              </g>
            )
          })}
          {/* X axis labels */}
          {[0, 25, 50, 75, 100].map(ep => {
            const px = pad.left + (ep / 100) * gW
            return <text key={ep} x={px} y={H - 10} textAnchor="middle" fill="var(--text-muted)" fontSize={11}>{ep}</text>
          })}
          <text x={W / 2} y={H - 0} textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontWeight={600}>Epochs</text>
          <text x={12} y={H / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontWeight={600} transform={`rotate(-90, 12, ${H / 2})`}>Loss</text>

          {/* Axes */}
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + gH} stroke="var(--text-muted)" strokeWidth={2} />
          <line x1={pad.left} y1={pad.top + gH} x2={pad.left + gW} y2={pad.top + gH} stroke="var(--text-muted)" strokeWidth={2} />

          {/* Training loss curve */}
          <path d={buildPath(sc.train, progress)} fill="none" stroke="#3b82f6" strokeWidth={3} strokeLinecap="round" />
          {/* Validation loss curve */}
          <path d={buildPath(sc.val, progress)} fill="none" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" strokeDasharray="8,4" />
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 3, background: '#3b82f6', borderRadius: 2 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>Train Loss</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 3, background: '#ef4444', borderRadius: 2, borderTop: '2px dashed #ef4444' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>Validation Loss</span>
          </div>
        </div>
      </div>
    </SectionBlock>
  )
}


/* ---- 3. IoU Calculator ---- */
function IoUCalculator() {
  const [predX, setPredX] = useState(120)
  const [predY, setPredY] = useState(80)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  const gt = { x: 80, y: 60, w: 160, h: 120 }
  const pred = { x: predX, y: predY, w: 150, h: 110 }

  const overlapX = Math.max(0, Math.min(gt.x + gt.w, pred.x + pred.w) - Math.max(gt.x, pred.x))
  const overlapY = Math.max(0, Math.min(gt.y + gt.h, pred.y + pred.h) - Math.max(gt.y, pred.y))
  const intersection = overlapX * overlapY
  const union = gt.w * gt.h + pred.w * pred.h - intersection
  const iou = union > 0 ? intersection / union : 0

  const iouColor = iou < 0.3 ? '#ef4444' : iou < 0.5 ? '#f59e0b' : '#10b981'
  const iouLabel = iou < 0.3 ? 'Poor' : iou < 0.5 ? 'Moderate' : 'Good'

  const handlePointerDown = (e) => {
    setDragging(true)
    e.target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scaleX = 400 / rect.width
    const scaleY = 280 / rect.height
    const nx = (e.clientX - rect.left) * scaleX - pred.w / 2
    const ny = (e.clientY - rect.top) * scaleY - pred.h / 2
    setPredX(Math.max(0, Math.min(400 - pred.w, nx)))
    setPredY(Math.max(0, Math.min(280 - pred.h, ny)))
  }

  const handlePointerUp = () => setDragging(false)

  return (
    <InteractiveDemo title="IoU Calculator" instruction="Drag the blue predicted box to overlap with the green ground truth box. Watch IoU update in real time!">
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Canvas */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            position: 'relative', width: 400, height: 280,
            background: 'var(--bg-card)', borderRadius: 16, border: '2px solid var(--border)',
            overflow: 'hidden', cursor: dragging ? 'grabbing' : 'default',
            touchAction: 'none', flexShrink: 0,
          }}
        >
          {/* Background grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {Array.from({ length: 20 }, (_, i) => (
              <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={280} stroke="var(--border)" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 20} x2={400} y2={i * 20} stroke="var(--border)" strokeWidth={0.5} />
            ))}
          </svg>

          {/* Ground truth box */}
          <div style={{
            position: 'absolute', left: gt.x, top: gt.y, width: gt.w, height: gt.h,
            border: '3px solid #10b981', background: '#10b98120', borderRadius: 4,
          }}>
            <span style={{ position: 'absolute', top: -22, left: 0, fontSize: 11, fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
              Ground Truth
            </span>
          </div>

          {/* Intersection highlight */}
          {intersection > 0 && (
            <div style={{
              position: 'absolute',
              left: Math.max(gt.x, pred.x), top: Math.max(gt.y, pred.y),
              width: overlapX, height: overlapY,
              background: '#f59e0b40', border: '2px dashed #f59e0b', borderRadius: 2,
              zIndex: 2,
            }} />
          )}

          {/* Predicted box (draggable) */}
          <motion.div
            onPointerDown={handlePointerDown}
            animate={{ left: pred.x, top: pred.y }}
            transition={{ type: 'tween', duration: 0.05 }}
            style={{
              position: 'absolute', width: pred.w, height: pred.h,
              border: '3px solid #3b82f6', background: '#3b82f620', borderRadius: 4,
              cursor: 'grab', zIndex: 3,
            }}
          >
            <span style={{ position: 'absolute', bottom: -22, left: 0, fontSize: 11, fontWeight: 700, color: '#3b82f6', whiteSpace: 'nowrap' }}>
              Prediction (drag me)
            </span>
          </motion.div>
        </div>

        {/* Stats panel */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {/* IoU gauge */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <motion.div
              animate={{ color: iouColor }}
              style={{ fontSize: 56, fontWeight: 900, fontFamily: 'monospace' }}
            >
              {iou.toFixed(3)}
            </motion.div>
            <motion.div
              animate={{ color: iouColor }}
              style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-heading)' }}
            >
              IoU: {iouLabel}
            </motion.div>

            {/* IoU bar */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, height: 16, marginTop: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <motion.div
                animate={{ width: `${iou * 100}%`, background: iouColor }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{ height: '100%', borderRadius: 10 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-muted)' }}>
              <span>0</span><span>0.3</span><span>0.5</span><span>1.0</span>
            </div>
          </div>

          {/* Formula */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 12, padding: 16,
            border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 13,
          }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
              IoU = Intersection / Union
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ textAlign: 'center', padding: 8, background: '#f59e0b15', borderRadius: 8, flex: 1 }}>
                <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>Intersection</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>{intersection.toFixed(0)}</div>
              </div>
              <div style={{ textAlign: 'center', padding: 8, background: '#8b5cf615', borderRadius: 8, flex: 1 }}>
                <div style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600 }}>Union</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#8b5cf6' }}>{union.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Color code legend */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[{ c: '#ef4444', l: '< 0.3 Poor' }, { c: '#f59e0b', l: '0.3-0.5 OK' }, { c: '#10b981', l: '> 0.5 Good' }].map(item => (
              <div key={item.c} style={{
                flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center',
                background: `${item.c}12`, border: `1px solid ${item.c}40`, fontSize: 11, fontWeight: 600, color: item.c,
              }}>
                {item.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </InteractiveDemo>
  )
}


/* ---- 4. Precision / Recall Visual ---- */
function PrecisionRecallVisual() {
  const [threshold, setThreshold] = useState(0.5)

  // Generate 20 detections with confidence and whether they are actual defects
  const detections = useRef([
    { id: 1, conf: 0.98, isDefect: true }, { id: 2, conf: 0.95, isDefect: true },
    { id: 3, conf: 0.92, isDefect: false }, { id: 4, conf: 0.88, isDefect: true },
    { id: 5, conf: 0.85, isDefect: true }, { id: 6, conf: 0.82, isDefect: false },
    { id: 7, conf: 0.78, isDefect: true }, { id: 8, conf: 0.75, isDefect: true },
    { id: 9, conf: 0.70, isDefect: false }, { id: 10, conf: 0.65, isDefect: true },
    { id: 11, conf: 0.60, isDefect: true }, { id: 12, conf: 0.55, isDefect: false },
    { id: 13, conf: 0.50, isDefect: true }, { id: 14, conf: 0.45, isDefect: true },
    { id: 15, conf: 0.40, isDefect: false }, { id: 16, conf: 0.35, isDefect: true },
    { id: 17, conf: 0.30, isDefect: true }, { id: 18, conf: 0.25, isDefect: false },
    { id: 19, conf: 0.20, isDefect: false }, { id: 20, conf: 0.15, isDefect: true },
  ]).current

  const totalDefects = detections.filter(d => d.isDefect).length // 12

  const predicted = detections.filter(d => d.conf >= threshold)
  const tp = predicted.filter(d => d.isDefect).length
  const fp = predicted.filter(d => !d.isDefect).length
  const fn = totalDefects - tp

  const precision = tp + fp > 0 ? tp / (tp + fp) : 1
  const recall = totalDefects > 0 ? tp / totalDefects : 0

  // Build PR curve points for various thresholds
  const prPoints = []
  for (let t = 0.05; t <= 1.0; t += 0.05) {
    const pred2 = detections.filter(d => d.conf >= t)
    const tp2 = pred2.filter(d => d.isDefect).length
    const fp2 = pred2.filter(d => !d.isDefect).length
    const p2 = tp2 + fp2 > 0 ? tp2 / (tp2 + fp2) : 1
    const r2 = totalDefects > 0 ? tp2 / totalDefects : 0
    prPoints.push({ t, p: p2, r: r2 })
  }

  const getLabel = (det) => {
    const aboveThresh = det.conf >= threshold
    if (aboveThresh && det.isDefect) return { label: 'TP', color: '#10b981', bg: '#10b98120' }
    if (aboveThresh && !det.isDefect) return { label: 'FP', color: '#ef4444', bg: '#ef444420' }
    if (!aboveThresh && det.isDefect) return { label: 'FN', color: '#f59e0b', bg: '#f59e0b20' }
    return { label: 'TN', color: '#6b7280', bg: '#6b728015' }
  }

  return (
    <SectionBlock icon="%" title="Precision & Recall" color="#8b5cf6">
      <Neuron mood="explaining" message="Precision asks: 'Of everything the model flagged, how many were real defects?' Recall asks: 'Of all real defects, how many did the model catch?'" size="small" />

      <HindiExplainer
        concept="प्रिसिज़न और रिकॉल"
        english="Precision & Recall"
        explanation="Precision = जो defect बताया उसमें से कितने सच में defect थे। Recall = जितने defect थे उनमें से कितने पकड़ पाए। दोनों ज़रूरी हैं!"
        example="सोचिए एक सुरक्षा गार्ड: Precision = जिन लोगों को रोका, उनमें से कितने सच में संदिग्ध थे (ग़लत लोगों को न रोके)। Recall = जितने चोर आए उनमें से कितने पकड़े (कोई चोर छूटे नहीं)।"
        terms={[
          { hindi: 'प्रिसिज़न', english: 'Precision', meaning: 'सटीकता — झूठे अलार्म कम' },
          { hindi: 'रिकॉल', english: 'Recall', meaning: 'पूर्णता — कोई defect छूटे नहीं' },
          { hindi: 'F1 स्कोर', english: 'F1 Score', meaning: 'Precision और Recall का balanced औसत' },
        ]}
      />

      {/* Threshold slider */}
      <div style={{
        margin: '24px 0', padding: '16px 24px', background: 'var(--bg-secondary)',
        borderRadius: 16, border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Confidence Threshold</span>
          <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent)' }}>{threshold.toFixed(2)}</span>
        </div>
        <input
          type="range" min={0.05} max={0.99} step={0.05}
          value={threshold} onChange={e => setThreshold(+e.target.value)}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
          <span>Low (more detections)</span><span>High (fewer detections)</span>
        </div>
      </div>

      {/* Detection grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8, marginBottom: 24 }}>
        {detections.map(det => {
          const info = getLabel(det)
          return (
            <motion.div
              key={det.id}
              layout
              animate={{
                scale: det.conf >= threshold ? 1 : 0.85,
                opacity: det.conf >= threshold ? 1 : 0.5,
              }}
              style={{
                background: info.bg, border: `2px solid ${info.color}`,
                borderRadius: 10, padding: '8px 4px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: info.color }}>{info.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{det.conf.toFixed(2)}</div>
              <div style={{ fontSize: 10, marginTop: 2, color: info.color }}>
                {det.isDefect ? 'Defect' : 'Clean'}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'True Pos', val: tp, color: '#10b981' },
          { label: 'False Pos', val: fp, color: '#ef4444' },
          { label: 'False Neg', val: fn, color: '#f59e0b' },
          { label: 'Precision', val: precision.toFixed(2), color: '#8b5cf6' },
        ].map(m => (
          <motion.div
            key={m.label}
            animate={{ borderColor: m.color }}
            style={{
              textAlign: 'center', padding: '12px 8px', borderRadius: 12,
              background: `${m.color}10`, border: `2px solid`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: m.color, textTransform: 'uppercase' }}>{m.label}</div>
            <motion.div
              key={m.val}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: m.color }}
            >
              {m.val}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Precision & Recall bars */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Precision', val: precision, color: '#8b5cf6', formula: `TP / (TP + FP) = ${tp} / ${tp + fp}` },
          { label: 'Recall', val: recall, color: '#3b82f6', formula: `TP / (TP + FN) = ${tp} / ${tp + fn}` },
        ].map(m => (
          <div key={m.label} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: m.color }}>{m.label}</span>
              <span style={{ fontWeight: 900, fontFamily: 'monospace', color: m.color }}>{(m.val * 100).toFixed(0)}%</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, height: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <motion.div
                animate={{ width: `${m.val * 100}%` }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ height: '100%', borderRadius: 8, background: m.color }}
              />
            </div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: 4 }}>{m.formula}</div>
          </div>
        ))}
      </div>

      {/* Mini PR curve */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Precision-Recall Curve</div>
        <svg viewBox="0 0 260 200" style={{ width: '100%', maxWidth: 400, display: 'block' }}>
          <line x1={40} y1={10} x2={40} y2={170} stroke="var(--text-muted)" strokeWidth={1.5} />
          <line x1={40} y1={170} x2={250} y2={170} stroke="var(--text-muted)" strokeWidth={1.5} />
          <text x={4} y={95} fill="var(--text-muted)" fontSize={10} transform="rotate(-90,10,95)">Precision</text>
          <text x={140} y={192} fill="var(--text-muted)" fontSize={10} textAnchor="middle">Recall</text>
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map(v => (
            <g key={v}>
              <line x1={40} y1={170 - v * 160} x2={250} y2={170 - v * 160} stroke="var(--border)" strokeDasharray="3,3" />
              <text x={36} y={174 - v * 160} textAnchor="end" fill="var(--text-muted)" fontSize={9}>{v.toFixed(1)}</text>
              <line x1={40 + v * 210} y1={170} x2={40 + v * 210} y2={10} stroke="var(--border)" strokeDasharray="3,3" />
              <text x={40 + v * 210} y={182} textAnchor="middle" fill="var(--text-muted)" fontSize={9}>{v.toFixed(1)}</text>
            </g>
          ))}
          {/* PR curve */}
          <path
            d={prPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'}${40 + pt.r * 210},${170 - pt.p * 160}`).join(' ')}
            fill="none" stroke="#8b5cf6" strokeWidth={2.5} strokeLinecap="round"
          />
          {/* Current point */}
          <motion.circle
            animate={{ cx: 40 + recall * 210, cy: 170 - precision * 160 }}
            r={6} fill="#ef4444" stroke="white" strokeWidth={2}
          />
        </svg>
      </div>
    </SectionBlock>
  )
}


/* ---- 5. mAP Explained ---- */
function MAPExplained() {
  const [step, setStep] = useState(0)

  const classes = [
    { name: 'Scratch', ap50: 0.82, ap95: 0.61, color: '#3b82f6' },
    { name: 'Crack', ap50: 0.75, ap95: 0.52, color: '#ef4444' },
    { name: 'Pit', ap50: 0.68, ap95: 0.44, color: '#f59e0b' },
  ]

  const map50 = classes.reduce((s, c) => s + c.ap50, 0) / classes.length
  const map95 = classes.reduce((s, c) => s + c.ap95, 0) / classes.length

  const stepTitles = [
    'Step 1: AP for one class',
    'Step 2: AP for all classes',
    'Step 3: mAP = Mean of all APs',
    'Step 4: mAP@0.5 vs mAP@0.5:0.95',
  ]

  return (
    <SectionBlock icon="M" title="mAP (Mean Average Precision)" color="#6366f1">
      <Neuron mood="explaining" message="mAP is the gold standard metric for object detection. Let me build it up step by step so it makes sense." size="small" />

      {/* Step navigation */}
      <div style={{ display: 'flex', gap: 8, margin: '20px 0', flexWrap: 'wrap' }}>
        {stepTitles.map((t, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setStep(i)}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: `2px solid ${step === i ? '#6366f1' : 'var(--border)'}`,
              background: step === i ? '#6366f115' : 'var(--bg-secondary)',
              color: step === i ? '#6366f1' : 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            {i + 1}. {t.split(': ')[1]}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{
              padding: 24, background: '#3b82f610', borderRadius: 16, border: '1px solid #3b82f630',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
                Average Precision for "Scratch" class
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                AP = Area under the Precision-Recall curve for a single class. The higher the area, the better the detector.
              </div>
              <svg viewBox="0 0 300 180" style={{ width: '100%', maxWidth: 400, display: 'block', margin: '0 auto' }}>
                <rect x={40} y={10} width={220} height={140} fill="var(--bg-secondary)" rx={4} />
                <line x1={40} y1={150} x2={260} y2={150} stroke="var(--text-muted)" strokeWidth={1.5} />
                <line x1={40} y1={10} x2={40} y2={150} stroke="var(--text-muted)" strokeWidth={1.5} />
                <text x={8} y={85} fill="var(--text-muted)" fontSize={10} transform="rotate(-90,8,85)">Precision</text>
                <text x={150} y={174} fill="var(--text-muted)" fontSize={10} textAnchor="middle">Recall</text>
                {/* Filled area */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 0.5 }}
                  d="M40,20 L100,22 L160,30 L200,50 L230,90 L260,150 L40,150 Z"
                  fill="#3b82f6"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5 }}
                  d="M40,20 L100,22 L160,30 L200,50 L230,90 L260,150"
                  fill="none" stroke="#3b82f6" strokeWidth={3} strokeLinecap="round"
                />
                <text x={130} y={100} fill="#3b82f6" fontSize={16} fontWeight={800} textAnchor="middle">AP = 0.82</text>
              </svg>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {classes.map((cls, i) => (
                <motion.div
                  key={cls.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.3 }}
                  style={{
                    flex: 1, minWidth: 160, padding: 20, borderRadius: 16,
                    background: `${cls.color}10`, border: `2px solid ${cls.color}40`, textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: cls.color, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                    {cls.name}
                  </div>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${cls.color}20`, border: `4px solid ${cls.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: cls.color, fontFamily: 'monospace' }}>{cls.ap50}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>AP@0.5</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ padding: 24, background: '#6366f110', borderRadius: 16, border: '1px solid #6366f130' }}>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20, textAlign: 'center' }}>
                mAP = Mean of AP across all classes
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                {classes.map((cls, i) => (
                  <motion.div
                    key={cls.name}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.4 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div style={{
                      padding: '8px 14px', borderRadius: 10, background: `${cls.color}15`,
                      border: `2px solid ${cls.color}40`, fontWeight: 700, color: cls.color, fontFamily: 'monospace',
                    }}>
                      {cls.ap50}
                    </div>
                    {i < classes.length - 1 && <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-muted)' }}>+</span>}
                  </motion.div>
                ))}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-muted)' }}
                >
                  / {classes.length}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-muted)' }}
                >
                  =
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6, type: 'spring' }}
                  style={{
                    padding: '12px 24px', borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white', fontSize: 24, fontWeight: 900, fontFamily: 'monospace',
                    boxShadow: '0 4px 20px #6366f140',
                  }}
                >
                  {map50.toFixed(2)}
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                style={{ textAlign: 'center', marginTop: 16, fontSize: 18, fontWeight: 700, color: '#6366f1' }}
              >
                mAP@0.5 = {map50.toFixed(2)}
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {/* mAP@0.5 */}
              <div style={{ flex: 1, minWidth: 260, padding: 24, borderRadius: 16, background: '#10b98110', border: '2px solid #10b98140' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
                  mAP@0.5
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  IoU threshold = 0.5 (lenient). A detection counts as correct if IoU with ground truth is at least 50%.
                </div>
                {classes.map(cls => (
                  <div key={cls.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 80, fontSize: 13, fontWeight: 600, color: cls.color }}>{cls.name}</div>
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 6, height: 14, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${cls.ap50 * 100}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: cls.color, borderRadius: 6 }} />
                    </div>
                    <div style={{ width: 40, fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: cls.color }}>{cls.ap50}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: '#10b981', textAlign: 'center' }}>
                  mAP@0.5 = {map50.toFixed(2)}
                </div>
              </div>

              {/* mAP@0.5:0.95 */}
              <div style={{ flex: 1, minWidth: 260, padding: 24, borderRadius: 16, background: '#f59e0b10', border: '2px solid #f59e0b40' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
                  mAP@0.5:0.95
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Averaged over IoU from 0.5 to 0.95 in steps of 0.05 (strict). Requires precise bounding boxes.
                </div>
                {classes.map(cls => (
                  <div key={cls.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 80, fontSize: 13, fontWeight: 600, color: cls.color }}>{cls.name}</div>
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 6, height: 14, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${cls.ap95 * 100}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: cls.color, borderRadius: 6 }} />
                    </div>
                    <div style={{ width: 40, fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: cls.color }}>{cls.ap95}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: '#f59e0b', textAlign: 'center' }}>
                  mAP@0.5:0.95 = {map95.toFixed(2)}
                </div>
              </div>
            </div>
            <NeuronTip type="warning">
              mAP@0.5:0.95 is always lower than mAP@0.5 because it demands <strong>much more precise</strong> bounding boxes. COCO benchmark uses this stricter metric.
            </NeuronTip>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionBlock>
  )
}


/* ---- 6. Confusion Matrix ---- */
function ConfusionMatrixSection() {
  const [hoveredCell, setHoveredCell] = useState(null)

  const classes = ['Scratch', 'Crack', 'Pit', 'Good']
  const matrix = [
    [23, 3, 1, 2],   // Actual Scratch
    [2, 19, 4, 1],   // Actual Crack
    [1, 3, 21, 2],   // Actual Pit
    [0, 1, 2, 28],   // Actual Good
  ]

  const total = matrix.flat().reduce((s, v) => s + v, 0)
  const diagonal = matrix.reduce((s, row, i) => s + row[i], 0)
  const accuracy = (diagonal / total * 100).toFixed(1)

  const maxVal = Math.max(...matrix.flat())

  const getCellColor = (val) => {
    const intensity = val / maxVal
    return `rgba(99, 102, 241, ${intensity * 0.7 + 0.05})`
  }

  const getTooltip = (r, c) => {
    const val = matrix[r][c]
    if (r === c) return `${val} ${classes[r]} samples correctly identified`
    return `${val} ${classes[r]} samples misclassified as ${classes[c]}`
  }

  return (
    <SectionBlock icon="#" title="Confusion Matrix" color="#ec4899">
      <Neuron mood="thinking" message="A confusion matrix shows exactly where the model gets confused. Diagonal = correct predictions. Off-diagonal = mistakes." size="small" />

      <HindiExplainer
        concept="कन्फ़्यूज़न मैट्रिक्स"
        english="Confusion Matrix"
        explanation="ये एक तालिका है जो दिखाती है कि AI ने कहाँ सही पहचाना और कहाँ ग़लती की — कौन सा defect किससे confuse हो रहा है।"
        example="जैसे एक टीचर देखे कि बच्चे 'ब' और 'व' में, या '6' और '9' में confuse हो रहे हैं — confusion matrix भी बताता है कि AI 'scratch' और 'crack' में confuse तो नहीं हो रहा।"
        terms={[
          { hindi: 'ट्रू पॉज़िटिव', english: 'True Positive', meaning: 'सही पकड़ा — defect था और defect बताया' },
          { hindi: 'फ़ॉल्स पॉज़िटिव', english: 'False Positive', meaning: 'ग़लत अलार्म — normal था पर defect बोला' },
          { hindi: 'फ़ॉल्स नेगेटिव', english: 'False Negative', meaning: 'चूक गया — defect था पर normal बोला' },
        ]}
      />

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', marginTop: 20 }}>
        {/* Matrix */}
        <div style={{ flex: '1 1 400px', minWidth: 340 }}>
          {/* Header labels */}
          <div style={{ display: 'flex', marginLeft: 100, marginBottom: 8 }}>
            {classes.map(c => (
              <div key={c} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {c}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, textAlign: 'center', marginLeft: 100, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
            Predicted
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {/* Row labels */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: 8, width: 90 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', marginBottom: 8, transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                Actual
              </div>
              {classes.map(c => (
                <div key={c} style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {c}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {matrix.map((row, r) =>
                row.map((val, c) => {
                  const isDiagonal = r === c
                  const isHovered = hoveredCell?.r === r && hoveredCell?.c === c
                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      onMouseEnter={() => setHoveredCell({ r, c })}
                      onMouseLeave={() => setHoveredCell(null)}
                      animate={{
                        scale: isHovered ? 1.1 : 1,
                        zIndex: isHovered ? 10 : 1,
                      }}
                      style={{
                        height: 64, borderRadius: 10,
                        background: getCellColor(val),
                        border: isDiagonal ? '3px solid #10b981' : '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', cursor: 'pointer', position: 'relative',
                        boxShadow: isHovered ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                      }}
                    >
                      <span style={{
                        fontSize: 22, fontWeight: 900, fontFamily: 'monospace',
                        color: val / maxVal > 0.5 ? 'white' : 'var(--text-primary)',
                      }}>
                        {val}
                      </span>
                      {isDiagonal && (
                        <span style={{ fontSize: 8, fontWeight: 700, color: '#10b981', position: 'absolute', top: 3, right: 5 }}>
                          CORRECT
                        </span>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredCell && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  marginTop: 12, padding: '12px 18px', borderRadius: 12,
                  background: hoveredCell.r === hoveredCell.c ? '#10b98115' : '#ef444415',
                  border: `1px solid ${hoveredCell.r === hoveredCell.c ? '#10b98140' : '#ef444440'}`,
                  fontSize: 14, fontWeight: 600,
                  color: hoveredCell.r === hoveredCell.c ? '#10b981' : '#ef4444',
                }}
              >
                {getTooltip(hoveredCell.r, hoveredCell.c)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div style={{ flex: '0 0 220px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', textAlign: 'center', marginBottom: 16,
              boxShadow: '0 8px 30px #10b98140',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>Overall Accuracy</div>
            <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'monospace' }}>{accuracy}%</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{diagonal} / {total} correct</div>
          </motion.div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>How to read it:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, border: '2px solid #10b981', background: '#10b98130' }} />
              <span>Diagonal = correct predictions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(99,102,241,0.3)' }} />
              <span>Darker = higher count</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(99,102,241,0.05)', border: '1px solid var(--border)' }} />
              <span>Lighter = fewer mistakes</span>
            </div>
          </div>
        </div>
      </div>
    </SectionBlock>
  )
}


/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic7() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <TrainingLoop />
      <LossCurvePlayground />
      <IoUCalculator />
      <PrecisionRecallVisual />
      <MAPExplained />
      <ConfusionMatrixSection />
    </div>
  )
}
