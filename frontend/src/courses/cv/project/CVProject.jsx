import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   STEEL DEFECT INSPECTOR — Industrial CV Pipeline Builder
   ================================================================
   Users build a defect detection pipeline:
   1. Explore dataset of steel surface images
   2. Define defect classes
   3. Annotate with bounding boxes (real annotation tool)
   4. Select model architecture (YOLO variants)
   5. Configure hyperparameters
   6. Train model (realistic simulation)
   7. Evaluate (metrics dashboard)
   8. Predict (real-time inference on test set)
================================================================ */

// ─── STEEL SURFACE IMAGE GENERATOR ───
// Each "image" is a canvas-rendered steel surface with programmatic defects
const DEFECT_TYPES = {
  scratch: { color: '#1a1a2e', label: 'Scratch', desc: 'Linear surface damage' },
  crack: { color: '#2d1b1b', label: 'Crack', desc: 'Branching fracture' },
  pit: { color: '#0d0d0d', label: 'Pit', desc: 'Surface cavity' },
  stain: { color: '#3d2e1e', label: 'Stain', desc: 'Discoloration patch' },
  inclusion: { color: '#2e2e3d', label: 'Inclusion', desc: 'Foreign material' },
  good: { color: '#4ade80', label: 'Good', desc: 'No defect' },
}

// Controlled dataset — each image has known defects with ground truth boxes
const STEEL_DATASET = [
  {
    id: 'steel_001', split: 'train',
    surface: { base: '#8a8a8a', grain: 'horizontal', brightness: 0.95 },
    defects: [
      { type: 'scratch', x: 0.15, y: 0.3, w: 0.55, h: 0.06, angle: -5, severity: 'medium' },
    ],
  },
  {
    id: 'steel_002', split: 'train',
    surface: { base: '#929292', grain: 'vertical', brightness: 0.9 },
    defects: [
      { type: 'crack', x: 0.4, y: 0.2, w: 0.25, h: 0.5, angle: 0, severity: 'severe' },
    ],
  },
  {
    id: 'steel_003', split: 'train',
    surface: { base: '#7e7e7e', grain: 'diagonal', brightness: 0.88 },
    defects: [
      { type: 'pit', x: 0.3, y: 0.35, w: 0.12, h: 0.12, angle: 0, severity: 'mild' },
      { type: 'pit', x: 0.6, y: 0.55, w: 0.1, h: 0.1, angle: 0, severity: 'mild' },
    ],
  },
  {
    id: 'steel_004', split: 'train',
    surface: { base: '#888888', grain: 'horizontal', brightness: 0.92 },
    defects: [
      { type: 'stain', x: 0.25, y: 0.2, w: 0.35, h: 0.3, angle: 0, severity: 'medium' },
    ],
  },
  {
    id: 'steel_005', split: 'train',
    surface: { base: '#969696', grain: 'vertical', brightness: 0.97 },
    defects: [
      { type: 'inclusion', x: 0.45, y: 0.4, w: 0.15, h: 0.18, angle: 0, severity: 'severe' },
    ],
  },
  {
    id: 'steel_006', split: 'train',
    surface: { base: '#8c8c8c', grain: 'horizontal', brightness: 0.94 },
    defects: [],
  },
  {
    id: 'steel_007', split: 'train',
    surface: { base: '#858585', grain: 'diagonal', brightness: 0.91 },
    defects: [
      { type: 'scratch', x: 0.1, y: 0.5, w: 0.7, h: 0.05, angle: 3, severity: 'severe' },
      { type: 'pit', x: 0.5, y: 0.25, w: 0.08, h: 0.08, angle: 0, severity: 'mild' },
    ],
  },
  {
    id: 'steel_008', split: 'train',
    surface: { base: '#909090', grain: 'vertical', brightness: 0.93 },
    defects: [
      { type: 'crack', x: 0.55, y: 0.1, w: 0.2, h: 0.65, angle: 8, severity: 'medium' },
    ],
  },
  // ─── TEST SET ───
  {
    id: 'steel_009', split: 'test',
    surface: { base: '#878787', grain: 'horizontal', brightness: 0.96 },
    defects: [
      { type: 'scratch', x: 0.2, y: 0.45, w: 0.6, h: 0.05, angle: -2, severity: 'medium' },
    ],
  },
  {
    id: 'steel_010', split: 'test',
    surface: { base: '#8e8e8e', grain: 'diagonal', brightness: 0.89 },
    defects: [
      { type: 'pit', x: 0.35, y: 0.3, w: 0.14, h: 0.14, angle: 0, severity: 'severe' },
    ],
  },
  {
    id: 'steel_011', split: 'test',
    surface: { base: '#939393', grain: 'vertical', brightness: 0.95 },
    defects: [],
  },
  {
    id: 'steel_012', split: 'test',
    surface: { base: '#818181', grain: 'horizontal', brightness: 0.87 },
    defects: [
      { type: 'stain', x: 0.15, y: 0.15, w: 0.4, h: 0.35, angle: 0, severity: 'severe' },
      { type: 'crack', x: 0.6, y: 0.5, w: 0.18, h: 0.35, angle: -5, severity: 'medium' },
    ],
  },
]

const PIPELINE_STAGES = [
  { id: 'dataset', label: 'Dataset', icon: '📁', desc: 'Explore steel samples' },
  { id: 'classes', label: 'Classes', icon: '🏷️', desc: 'Define defect types' },
  { id: 'annotate', label: 'Annotate', icon: '✏️', desc: 'Draw bounding boxes' },
  { id: 'model', label: 'Model', icon: '🧠', desc: 'Select architecture' },
  { id: 'config', label: 'Config', icon: '⚙️', desc: 'Set hyperparameters' },
  { id: 'train', label: 'Train', icon: '🏋️', desc: 'Train the model' },
  { id: 'evaluate', label: 'Evaluate', icon: '📊', desc: 'View metrics' },
  { id: 'predict', label: 'Predict', icon: '🔍', desc: 'Run inference' },
]

// ─── STEEL SURFACE RENDERER ───
function SteelSurface({ sample, width = 320, height = 240, showDefects = true, annotations = null, showGT = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = width
    const h = height

    // Draw steel base
    const baseColor = sample.surface.base
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)

    // Metallic gradient
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, `rgb(${r - 15},${g - 15},${b - 15})`)
    grad.addColorStop(0.3, `rgb(${r + 10},${g + 10},${b + 10})`)
    grad.addColorStop(0.6, `rgb(${r - 5},${g - 5},${b - 5})`)
    grad.addColorStop(1, `rgb(${r + 5},${g + 5},${b + 5})`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Grain texture
    ctx.globalAlpha = 0.08
    for (let i = 0; i < 200; i++) {
      const gx = Math.random() * w
      const gy = Math.random() * h
      const gl = Math.random() * 20 + 5
      ctx.strokeStyle = Math.random() > 0.5 ? '#fff' : '#000'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      if (sample.surface.grain === 'horizontal') {
        ctx.moveTo(gx, gy); ctx.lineTo(gx + gl, gy)
      } else if (sample.surface.grain === 'vertical') {
        ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gl)
      } else {
        ctx.moveTo(gx, gy); ctx.lineTo(gx + gl * 0.7, gy + gl * 0.7)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1.0

    // Draw defects
    if (showDefects) {
      sample.defects.forEach(d => {
        const dx = d.x * w, dy = d.y * h, dw = d.w * w, dh = d.h * h

        ctx.save()
        ctx.translate(dx + dw / 2, dy + dh / 2)
        ctx.rotate((d.angle || 0) * Math.PI / 180)

        if (d.type === 'scratch') {
          ctx.strokeStyle = `rgba(30,30,30,${d.severity === 'severe' ? 0.9 : 0.6})`
          ctx.lineWidth = d.severity === 'severe' ? 3 : 2
          ctx.beginPath()
          ctx.moveTo(-dw / 2, 0)
          for (let i = 0; i < 10; i++) {
            ctx.lineTo(-dw / 2 + (dw * i / 10), (Math.random() - 0.5) * 4)
          }
          ctx.lineTo(dw / 2, 0)
          ctx.stroke()
          // Secondary scratch lines
          ctx.globalAlpha = 0.3
          ctx.beginPath()
          ctx.moveTo(-dw / 2, 3); ctx.lineTo(dw / 2, 2)
          ctx.stroke()
          ctx.globalAlpha = 1
        } else if (d.type === 'crack') {
          ctx.strokeStyle = `rgba(20,10,10,${d.severity === 'severe' ? 0.95 : 0.7})`
          ctx.lineWidth = d.severity === 'severe' ? 2.5 : 1.5
          // Main crack line
          ctx.beginPath()
          ctx.moveTo(0, -dh / 2)
          const segments = 8
          for (let i = 1; i <= segments; i++) {
            ctx.lineTo((Math.random() - 0.5) * dw * 0.6, -dh / 2 + (dh * i / segments))
          }
          ctx.stroke()
          // Branch cracks
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.5
          for (let i = 0; i < 3; i++) {
            const by = -dh / 2 + Math.random() * dh
            ctx.beginPath()
            ctx.moveTo((Math.random() - 0.5) * dw * 0.3, by)
            ctx.lineTo((Math.random() - 0.5) * dw * 0.8, by + (Math.random() - 0.5) * dh * 0.3)
            ctx.stroke()
          }
          ctx.globalAlpha = 1
        } else if (d.type === 'pit') {
          const radius = Math.min(dw, dh) / 2
          const pitGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
          pitGrad.addColorStop(0, `rgba(10,10,10,${d.severity === 'severe' ? 0.9 : 0.6})`)
          pitGrad.addColorStop(0.7, `rgba(40,40,40,0.3)`)
          pitGrad.addColorStop(1, 'rgba(80,80,80,0)')
          ctx.fillStyle = pitGrad
          ctx.beginPath()
          ctx.arc(0, 0, radius, 0, Math.PI * 2)
          ctx.fill()
          // Highlight ring
          ctx.strokeStyle = 'rgba(180,180,180,0.2)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(-2, -2, radius * 0.8, -0.5, 1)
          ctx.stroke()
        } else if (d.type === 'stain') {
          ctx.fillStyle = `rgba(60,45,30,${d.severity === 'severe' ? 0.6 : 0.35})`
          ctx.beginPath()
          // Irregular blob
          const points = 12
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2
            const rx = (dw / 2) * (0.6 + Math.random() * 0.4)
            const ry = (dh / 2) * (0.6 + Math.random() * 0.4)
            const px = Math.cos(angle) * rx
            const py = Math.sin(angle) * ry
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.fill()
        } else if (d.type === 'inclusion') {
          // Bright/dark irregular spots
          for (let i = 0; i < 5; i++) {
            const sx = (Math.random() - 0.5) * dw
            const sy = (Math.random() - 0.5) * dh
            const sr = Math.random() * 4 + 2
            ctx.fillStyle = Math.random() > 0.5
              ? `rgba(200,200,210,${d.severity === 'severe' ? 0.8 : 0.5})`
              : `rgba(20,20,30,${d.severity === 'severe' ? 0.8 : 0.5})`
            ctx.beginPath()
            ctx.arc(sx, sy, sr, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx.restore()
      })
    }

    // Draw ground truth boxes
    if (showGT && showDefects) {
      sample.defects.forEach(d => {
        const dx = d.x * w, dy = d.y * h, dw2 = d.w * w, dh2 = d.h * h
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.strokeRect(dx, dy, dw2, dh2)
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(34,197,94,0.8)'
        ctx.font = 'bold 10px monospace'
        ctx.fillText(d.type, dx + 2, dy - 4)
      })
    }

    // Draw user annotations
    if (annotations) {
      annotations.forEach(a => {
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2
        ctx.strokeRect(a.x, a.y, a.w, a.h)
        ctx.fillStyle = 'rgba(245,158,11,0.8)'
        ctx.font = 'bold 10px monospace'
        ctx.fillText(a.label || '?', a.x + 2, a.y - 4)
      })
    }
  }, [sample, width, height, showDefects, annotations, showGT])

  return <canvas ref={canvasRef} width={width} height={height} style={{ borderRadius: 8, display: 'block' }} />
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function CVProject() {
  const [activeStage, setActiveStage] = useState(0)
  const [stageStatus, setStageStatus] = useState({})
  const [userClasses, setUserClasses] = useState([])
  const [annotations, setAnnotations] = useState({})
  const [modelConfig, setModelConfig] = useState(null)
  const [hyperparams, setHyperparams] = useState(null)
  const [trainingResults, setTrainingResults] = useState(null)
  const [evalResults, setEvalResults] = useState(null)

  const isComplete = (idx) => stageStatus[PIPELINE_STAGES[idx]?.id] === 'success'
  const canAccess = (idx) => idx === 0 || isComplete(idx - 1)

  const completeStage = (stageId) => {
    setStageStatus(s => ({ ...s, [stageId]: 'success' }))
    const idx = PIPELINE_STAGES.findIndex(s => s.id === stageId)
    if (idx < PIPELINE_STAGES.length - 1) setActiveStage(idx + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* ─── PIPELINE CANVAS ─── */}
      <div style={{
        padding: '28px 20px',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 20, marginBottom: 32,
        border: '1px solid #334155', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
          fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: 1,
        }}>
          <span style={{ color: '#f59e0b' }}>◆</span> STEEL DEFECT DETECTION PIPELINE
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>
            {Object.values(stageStatus).filter(s => s === 'success').length}/{PIPELINE_STAGES.length} complete
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          overflowX: 'auto', padding: '10px 0',
        }}>
          {PIPELINE_STAGES.map((stage, i) => {
            const status = stageStatus[stage.id]
            const active = activeStage === i
            const accessible = canAccess(i)

            let borderColor = '#334155', bgColor = '#1e293b', textColor = '#64748b', glow = 'none'
            if (status === 'success') {
              borderColor = '#22c55e'; bgColor = '#052e16'; textColor = '#4ade80'
              glow = '0 0 12px #22c55e30'
            } else if (active) {
              borderColor = '#f59e0b'; bgColor = '#422006'; textColor = '#fbbf24'
              glow = '0 0 16px #f59e0b30'
            }

            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <motion.button
                  onClick={() => accessible && setActiveStage(i)}
                  animate={active ? { scale: [1, 1.03, 1] } : {}}
                  transition={active ? { repeat: Infinity, duration: 2 } : {}}
                  whileHover={accessible ? { y: -3 } : {}}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '14px 14px', minWidth: 82,
                    background: bgColor, border: `2px solid ${borderColor}`,
                    borderRadius: 14, cursor: accessible ? 'pointer' : 'default',
                    boxShadow: glow, opacity: accessible ? 1 : 0.4,
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{stage.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: textColor, whiteSpace: 'nowrap' }}>
                    {stage.label}
                  </span>
                  {status === 'success' && <span style={{ fontSize: 9, color: '#22c55e' }}>Done</span>}
                </motion.button>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 20, height: 2, background: status === 'success' ? '#22c55e' : '#334155' }} />
                    <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `5px solid ${status === 'success' ? '#22c55e' : '#334155'}` }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── STAGE CONTENT ─── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeStage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          {activeStage === 0 && <DatasetExplorer onComplete={() => completeStage('dataset')} done={isComplete(0)} />}
          {activeStage === 1 && <ClassDefiner classes={userClasses} setClasses={setUserClasses} onComplete={() => completeStage('classes')} done={isComplete(1)} />}
          {activeStage === 2 && <AnnotationTool classes={userClasses} annotations={annotations} setAnnotations={setAnnotations} onComplete={() => completeStage('annotate')} done={isComplete(2)} />}
          {activeStage === 3 && <ModelSelector onSelect={(m) => { setModelConfig(m); completeStage('model') }} done={isComplete(3)} selection={modelConfig} />}
          {activeStage === 4 && <HyperparamConfig onConfirm={(h) => { setHyperparams(h); completeStage('config') }} done={isComplete(4)} config={hyperparams} />}
          {activeStage === 5 && <TrainingDashboard hyperparams={hyperparams} model={modelConfig} annotations={annotations} onComplete={(r) => { setTrainingResults(r); completeStage('train') }} done={isComplete(5)} results={trainingResults} />}
          {activeStage === 6 && <EvaluationPanel results={trainingResults} classes={userClasses} onComplete={(r) => { setEvalResults(r); completeStage('evaluate') }} done={isComplete(6)} />}
          {activeStage === 7 && <PredictionInterface results={trainingResults} classes={userClasses} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─── STAGE 1: DATASET EXPLORER ─── */
function DatasetExplorer({ onComplete, done }) {
  const [selectedSample, setSelectedSample] = useState(null)
  const trainSamples = STEEL_DATASET.filter(s => s.split === 'train')
  const testSamples = STEEL_DATASET.filter(s => s.split === 'test')

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>📁</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Steel Surface Dataset
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Explore {STEEL_DATASET.length} steel sheet samples from a manufacturing line
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{ padding: '4px 12px', borderRadius: 8, background: '#dbeafe', color: '#1e40af', fontSize: 12, fontWeight: 700 }}>
            {trainSamples.length} Train
          </div>
          <div style={{ padding: '4px 12px', borderRadius: 8, background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700 }}>
            {testSamples.length} Test
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
        {Object.entries(DEFECT_TYPES).filter(([k]) => k !== 'good').map(([key, val]) => {
          const count = STEEL_DATASET.reduce((a, s) => a + s.defects.filter(d => d.type === key).length, 0)
          return (
            <div key={key} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{val.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{count}</div>
            </div>
          )
        })}
        <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #86efac' }}>
          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Good</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#166534' }}>{STEEL_DATASET.filter(s => s.defects.length === 0).length}</div>
        </div>
      </div>

      {/* Image grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {STEEL_DATASET.map((sample, i) => (
          <motion.div
            key={sample.id}
            onClick={() => setSelectedSample(sample)}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
              border: `2px solid ${selectedSample?.id === sample.id ? '#f59e0b' : 'var(--border)'}`,
              background: 'var(--bg-secondary)',
            }}
          >
            <SteelSurface sample={sample} width={180} height={135} />
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{sample.id}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: sample.split === 'train' ? '#dbeafe' : '#fef3c7', color: sample.split === 'train' ? '#1e40af' : '#92400e' }}>
                  {sample.split}
                </span>
                {sample.defects.length === 0 ? (
                  <span style={{ padding: '1px 6px', borderRadius: 4, background: '#d1fae5', color: '#065f46' }}>good</span>
                ) : sample.defects.map((d, j) => (
                  <span key={j} style={{ padding: '1px 6px', borderRadius: 4, background: '#fee2e2', color: '#991b1b' }}>{d.type}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedSample && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 20, padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <SteelSurface sample={selectedSample} width={320} height={240} showGT />
              <div style={{ flex: 1, minWidth: 200 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{selectedSample.id}</h4>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <div>Split: <strong>{selectedSample.split}</strong></div>
                  <div>Surface brightness: <strong>{selectedSample.surface.brightness}</strong></div>
                  <div>Grain direction: <strong>{selectedSample.surface.grain}</strong></div>
                  <div>Defects: <strong>{selectedSample.defects.length || 'None (good sample)'}</strong></div>
                  {selectedSample.defects.map((d, i) => (
                    <div key={i} style={{ padding: '4px 10px', background: '#fee2e2', borderRadius: 6, marginTop: 4, fontSize: 12 }}>
                      {d.type} — severity: {d.severity} — bbox: ({(d.x * 100).toFixed(0)}%, {(d.y * 100).toFixed(0)}%, {(d.w * 100).toFixed(0)}%, {(d.h * 100).toFixed(0)}%)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <motion.button onClick={onComplete} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            Dataset Reviewed — Continue →
          </motion.button>
        </div>
      )}
    </div>
  )
}

/* ─── STAGE 2: CLASS DEFINER ─── */
function ClassDefiner({ classes, setClasses, onComplete, done }) {
  const [newClass, setNewClass] = useState('')
  const SUGGESTED = ['scratch', 'crack', 'pit', 'stain', 'inclusion']
  const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

  const addClass = (name) => {
    const n = name.trim().toLowerCase()
    if (!n || classes.find(c => c.name === n)) return
    setClasses(prev => [...prev, { name: n, color: COLORS[prev.length % COLORS.length] }])
    setNewClass('')
  }

  const removeClass = (name) => setClasses(prev => prev.filter(c => c.name !== name))

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>🏷️</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Define Defect Classes</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Create the categories your model will learn to detect (min 3)</p>
        </div>
      </div>

      {/* Suggested classes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested Classes</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUGGESTED.map(s => {
            const added = classes.find(c => c.name === s)
            return (
              <motion.button key={s} onClick={() => !added && addClass(s)} whileHover={!added ? { scale: 1.05 } : {}}
                style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: added ? 'default' : 'pointer',
                  background: added ? '#d1fae5' : 'var(--bg-secondary)',
                  color: added ? '#065f46' : 'var(--text-secondary)',
                  border: `1px solid ${added ? '#86efac' : 'var(--border)'}`,
                }}>
                {added ? '✓ ' : '+ '}{s}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Custom class input */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input value={newClass} onChange={e => setNewClass(e.target.value)} onKeyDown={e => e.key === 'Enter' && addClass(newClass)}
          placeholder="Custom class name..."
          style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: '2px solid var(--border)', fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
        <motion.button onClick={() => addClass(newClass)} whileHover={{ scale: 1.05 }}
          style={{ padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
          Add
        </motion.button>
      </div>

      {/* Current classes */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {classes.map((c, i) => (
          <motion.div key={c.name} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: c.color + '20', border: `2px solid ${c.color}` }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.color }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
            {!done && <button onClick={() => removeClass(c.name)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>×</button>}
          </motion.div>
        ))}
      </div>

      {classes.length >= 3 && !done && (
        <div style={{ textAlign: 'center' }}>
          <motion.button onClick={onComplete} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            {classes.length} Classes Defined — Continue →
          </motion.button>
        </div>
      )}
    </div>
  )
}

/* ─── STAGE 3: ANNOTATION TOOL ─── */
function AnnotationTool({ classes, annotations, setAnnotations, onComplete, done }) {
  const trainSamples = STEEL_DATASET.filter(s => s.split === 'train')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [drawing, setDrawing] = useState(false)
  const [startPos, setStartPos] = useState(null)
  const [currentBox, setCurrentBox] = useState(null)
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name || '')
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const CANVAS_W = 480, CANVAS_H = 360

  const sample = trainSamples[currentIdx]
  const sampleAnns = annotations[sample?.id] || []

  const getCanvasPos = (e) => {
    const rect = overlayRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e) => {
    if (done) return
    const pos = getCanvasPos(e)
    setDrawing(true)
    setStartPos(pos)
    setCurrentBox(null)
  }

  const handleMouseMove = (e) => {
    if (!drawing || !startPos) return
    const pos = getCanvasPos(e)
    setCurrentBox({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
      label: selectedClass,
    })
  }

  const handleMouseUp = () => {
    if (!drawing || !currentBox || currentBox.w < 10 || currentBox.h < 10) {
      setDrawing(false)
      setCurrentBox(null)
      return
    }
    const newAnns = [...sampleAnns, { ...currentBox, label: selectedClass, color: classes.find(c => c.name === selectedClass)?.color || '#f59e0b' }]
    setAnnotations(prev => ({ ...prev, [sample.id]: newAnns }))
    setDrawing(false)
    setCurrentBox(null)
  }

  const removeAnnotation = (idx) => {
    const newAnns = sampleAnns.filter((_, i) => i !== idx)
    setAnnotations(prev => ({ ...prev, [sample.id]: newAnns }))
  }

  const totalAnnotations = Object.values(annotations).reduce((a, b) => a + b.length, 0)
  const annotatedImages = Object.keys(annotations).filter(k => annotations[k].length > 0).length

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>✏️</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Annotate Steel Surfaces</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Draw bounding boxes around defects — select a class first, then click and drag</p>
        </div>
        <div style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 100, background: totalAnnotations >= 8 ? '#d1fae5' : '#fef3c7', color: totalAnnotations >= 8 ? '#065f46' : '#92400e', fontSize: 13, fontWeight: 700 }}>
          {totalAnnotations} annotations
        </div>
      </div>

      {/* Class selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {classes.map(c => (
          <motion.button key={c.name} onClick={() => setSelectedClass(c.name)} whileHover={{ scale: 1.05 }}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: selectedClass === c.name ? c.color : 'var(--bg-secondary)',
              color: selectedClass === c.name ? 'white' : 'var(--text-secondary)',
              border: `2px solid ${c.color}`,
            }}>
            {c.name}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Canvas area */}
        <div style={{ position: 'relative' }}>
          <SteelSurface sample={sample} width={CANVAS_W} height={CANVAS_H} annotations={sampleAnns} />
          <div
            ref={overlayRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { setDrawing(false); setCurrentBox(null) }}
            style={{
              position: 'absolute', top: 0, left: 0, width: CANVAS_W, height: CANVAS_H,
              cursor: done ? 'default' : 'crosshair', borderRadius: 8,
            }}
          >
            {/* Current drawing box */}
            {currentBox && (
              <div style={{
                position: 'absolute', left: currentBox.x, top: currentBox.y,
                width: currentBox.w, height: currentBox.h,
                border: `2px dashed ${classes.find(c => c.name === selectedClass)?.color || '#f59e0b'}`,
                background: 'rgba(245,158,11,0.1)',
                pointerEvents: 'none',
              }} />
            )}
            {/* Rendered annotation boxes */}
            {sampleAnns.map((a, i) => (
              <div key={i} style={{
                position: 'absolute', left: a.x, top: a.y, width: a.w, height: a.h,
                border: `2px solid ${a.color}`, borderRadius: 2, pointerEvents: 'none',
              }}>
                <span style={{ position: 'absolute', top: -18, left: 0, fontSize: 10, fontWeight: 700, color: a.color, background: 'rgba(0,0,0,0.7)', padding: '1px 4px', borderRadius: 3 }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>

          {/* Image navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
              style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: currentIdx === 0 ? 'default' : 'pointer', opacity: currentIdx === 0 ? 0.4 : 1, color: 'var(--text-primary)', fontWeight: 600 }}>
              ← Prev
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentIdx + 1} / {trainSamples.length}
            </span>
            <button onClick={() => setCurrentIdx(Math.min(trainSamples.length - 1, currentIdx + 1))} disabled={currentIdx === trainSamples.length - 1}
              style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: currentIdx === trainSamples.length - 1 ? 'default' : 'pointer', opacity: currentIdx === trainSamples.length - 1 ? 0.4 : 1, color: 'var(--text-primary)', fontWeight: 600 }}>
              Next →
            </button>
          </div>
        </div>

        {/* Annotations list */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            Annotations for {sample.id}
          </div>
          {sampleAnns.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-secondary)', borderRadius: 10 }}>
              No annotations yet. Draw a box!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sampleAnns.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: `4px solid ${a.color}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ({Math.round(a.x)},{Math.round(a.y)},{Math.round(a.w)},{Math.round(a.h)})
                  </span>
                  {!done && <button onClick={() => removeAnnotation(i)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>×</button>}
                </div>
              ))}
            </div>
          )}

          {/* Progress summary */}
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>PROGRESS</div>
            {trainSamples.map(s => {
              const count = (annotations[s.id] || []).length
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: count > 0 ? '#22c55e' : 'var(--text-muted)' }}>{count > 0 ? '✓' : '○'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.id}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>{count} boxes</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {totalAnnotations >= 8 && !done && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <motion.button onClick={onComplete} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            {totalAnnotations} Annotations Complete — Continue →
          </motion.button>
        </div>
      )}
    </div>
  )
}

/* ─── STAGE 4: MODEL SELECTOR ─── */
function ModelSelector({ onSelect, done, selection }) {
  const MODELS = [
    {
      id: 'yolov8n', name: 'YOLOv8-Nano', params: '3.2M', speed: '~2ms', mAP: '37.3', size: '6.3 MB', icon: '⚡',
      desc: 'Fastest. Perfect for edge devices and real-time inspection on embedded hardware.',
      explanation: 'YOLOv8-Nano is the smallest variant with only 3.2M parameters. It uses depthwise separable convolutions to minimize computation. Ideal for Jetson Nano, Raspberry Pi, or any resource-constrained deployment.',
      whyGood: 'For steel defect detection on a production line, speed matters. Nano processes frames in ~2ms, enabling real-time inspection at 500+ FPS. The accuracy trade-off is acceptable for well-defined defect types.',
    },
    {
      id: 'yolov8s', name: 'YOLOv8-Small', params: '11.2M', speed: '~5ms', mAP: '44.9', size: '22.5 MB', icon: '🏃',
      desc: 'Balanced. Good accuracy with reasonable speed for most production environments.',
      explanation: 'YOLOv8-Small adds more convolutional layers and wider feature maps compared to Nano. It captures finer details like hairline cracks that Nano might miss.',
      whyGood: 'The sweet spot for most manufacturing QC: fast enough for real-time (200 FPS) with significantly better accuracy than Nano. Runs comfortably on a mid-range GPU.',
      best: true,
    },
    {
      id: 'yolov8m', name: 'YOLOv8-Medium', params: '25.9M', speed: '~12ms', mAP: '50.2', size: '52 MB', icon: '🧠',
      desc: 'High accuracy. For complex defects that require detailed feature extraction.',
      explanation: 'YOLOv8-Medium significantly increases network depth and width. The larger receptive field helps detect subtle defects like faint stains or micro-cracks.',
      whyGood: 'When accuracy is critical (e.g., aerospace or medical device manufacturing), Medium provides the best accuracy-to-speed ratio. Still processes at ~80 FPS on modern GPUs.',
    },
    {
      id: 'yolov8x', name: 'YOLOv8-XLarge', params: '68.2M', speed: '~30ms', mAP: '53.9', size: '136 MB', icon: '🏋️',
      desc: 'Maximum accuracy. For research or offline batch processing of inspection images.',
      explanation: 'The largest YOLOv8 variant with 68.2M parameters. Uses the deepest backbone and widest neck. Captures the most subtle defect patterns but requires significant compute.',
      whyGood: 'Best for offline analysis, second-opinion verification, or when you need maximum detection accuracy regardless of speed. Not recommended for real-time production use.',
    },
  ]

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>🧠</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Select Model Architecture</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Choose the right YOLO variant for your inspection pipeline</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {MODELS.map(m => {
          const selected = selection?.id === m.id
          return (
            <motion.button key={m.id} onClick={() => !done && onSelect(m)} whileHover={!done ? { y: -4 } : {}}
              style={{
                padding: 20, borderRadius: 16, textAlign: 'left', cursor: done ? 'default' : 'pointer',
                background: selected ? '#fffbeb' : 'var(--bg-secondary)',
                border: `2px solid ${selected ? '#f59e0b' : 'transparent'}`,
                position: 'relative', opacity: done && !selected ? 0.5 : 1,
              }}>
              {m.best && !done && (
                <div style={{ position: 'absolute', top: -8, right: 12, padding: '2px 8px', background: '#f59e0b', color: '#78350f', fontSize: 10, fontWeight: 700, borderRadius: 4 }}>BEST</div>
              )}
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{m.desc}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11 }}>
                <div style={{ padding: '4px 8px', background: 'var(--bg-card)', borderRadius: 6 }}>
                  <div style={{ color: 'var(--text-muted)' }}>Params</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.params}</div>
                </div>
                <div style={{ padding: '4px 8px', background: 'var(--bg-card)', borderRadius: 6 }}>
                  <div style={{ color: 'var(--text-muted)' }}>Speed</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.speed}</div>
                </div>
                <div style={{ padding: '4px 8px', background: 'var(--bg-card)', borderRadius: 6 }}>
                  <div style={{ color: 'var(--text-muted)' }}>mAP</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.mAP}</div>
                </div>
                <div style={{ padding: '4px 8px', background: 'var(--bg-card)', borderRadius: 6 }}>
                  <div style={{ color: 'var(--text-muted)' }}>Size</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.size}</div>
                </div>
              </div>
              {selected && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.7, padding: '10px 12px', background: '#fef3c7', borderRadius: 8 }}>
                    <strong>Architecture:</strong> {m.explanation}
                  </div>
                  <div style={{ fontSize: 12, color: '#065f46', lineHeight: 1.7, padding: '10px 12px', background: '#d1fae5', borderRadius: 8, marginTop: 6, borderLeft: '4px solid #22c55e' }}>
                    <strong>Why this works:</strong> {m.whyGood}
                  </div>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── STAGE 5: HYPERPARAMETER CONFIG ─── */
function HyperparamConfig({ onConfirm, done, config }) {
  const [params, setParams] = useState(config || {
    lr: 0.01, batchSize: 16, epochs: 50, imgSize: 640,
    augRotate: true, augFlip: true, augBrightness: true, augMosaic: true,
    optimizer: 'Adam', warmup: 3,
  })

  const updateParam = (key, value) => setParams(p => ({ ...p, [key]: value }))

  const PARAM_INFO = {
    lr: { label: 'Learning Rate', min: 0.0001, max: 0.1, step: 0.0001, desc: 'How fast the model learns. Too high = unstable, too low = slow convergence.', good: [0.001, 0.01], unit: '' },
    batchSize: { label: 'Batch Size', options: [4, 8, 16, 32], desc: 'Images processed together. Larger = faster training, more memory.', good: [8, 16] },
    epochs: { label: 'Epochs', min: 10, max: 200, step: 10, desc: 'Full passes through the dataset. More epochs = more learning time.', good: [30, 100] },
    imgSize: { label: 'Image Size', options: [320, 416, 640, 1280], desc: 'Input resolution. Higher = better detection, slower training.', good: [640] },
  }

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>⚙️</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Configure Hyperparameters</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Tune the training settings — these control how your model learns</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Learning Rate */}
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Learning Rate</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{PARAM_INFO.lr.desc}</div>
          <input type="range" min={0.0001} max={0.1} step={0.0001} value={params.lr} onChange={e => updateParam('lr', parseFloat(e.target.value))}
            disabled={done} style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>0.0001</span>
            <span style={{ fontWeight: 700, color: params.lr >= 0.001 && params.lr <= 0.01 ? '#22c55e' : params.lr > 0.05 ? '#ef4444' : '#f59e0b' }}>{params.lr.toFixed(4)}</span>
            <span style={{ color: 'var(--text-muted)' }}>0.1</span>
          </div>
        </div>

        {/* Batch Size */}
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Batch Size</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{PARAM_INFO.batchSize.desc}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {PARAM_INFO.batchSize.options.map(v => (
              <button key={v} onClick={() => !done && updateParam('batchSize', v)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${params.batchSize === v ? '#f59e0b' : 'var(--border)'}`, background: params.batchSize === v ? '#fffbeb' : 'var(--bg-card)', cursor: done ? 'default' : 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Epochs */}
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Epochs</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{PARAM_INFO.epochs.desc}</div>
          <input type="range" min={10} max={200} step={10} value={params.epochs} onChange={e => updateParam('epochs', parseInt(e.target.value))}
            disabled={done} style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>10</span>
            <span style={{ fontWeight: 700, color: params.epochs >= 30 && params.epochs <= 100 ? '#22c55e' : '#f59e0b' }}>{params.epochs}</span>
            <span style={{ color: 'var(--text-muted)' }}>200</span>
          </div>
        </div>

        {/* Image Size */}
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Image Size</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{PARAM_INFO.imgSize.desc}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {PARAM_INFO.imgSize.options.map(v => (
              <button key={v} onClick={() => !done && updateParam('imgSize', v)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${params.imgSize === v ? '#f59e0b' : 'var(--border)'}`, background: params.imgSize === v ? '#fffbeb' : 'var(--bg-card)', cursor: done ? 'default' : 'pointer', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Augmentation toggles */}
      <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Data Augmentation</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { key: 'augRotate', label: 'Rotation', icon: '🔄' },
            { key: 'augFlip', label: 'Flip', icon: '↔️' },
            { key: 'augBrightness', label: 'Brightness', icon: '☀️' },
            { key: 'augMosaic', label: 'Mosaic', icon: '🧩' },
          ].map(a => (
            <button key={a.key} onClick={() => !done && updateParam(a.key, !params[a.key])}
              style={{
                padding: '8px 14px', borderRadius: 8, cursor: done ? 'default' : 'pointer',
                background: params[a.key] ? '#d1fae5' : 'var(--bg-card)',
                border: `2px solid ${params[a.key] ? '#22c55e' : 'var(--border)'}`,
                fontSize: 12, fontWeight: 600, color: params[a.key] ? '#065f46' : 'var(--text-muted)',
              }}>
              {a.icon} {a.label} {params[a.key] ? '✓' : '○'}
            </button>
          ))}
        </div>
      </div>

      {!done && (
        <div style={{ textAlign: 'center' }}>
          <motion.button onClick={() => onConfirm(params)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            Start Training →
          </motion.button>
        </div>
      )}
    </div>
  )
}

/* ─── STAGE 6: TRAINING DASHBOARD ─── */
function TrainingDashboard({ hyperparams, model, annotations, onComplete, done, results }) {
  const [training, setTraining] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [metrics, setMetrics] = useState([])
  const [finished, setFinished] = useState(!!results)

  const simulateTraining = useCallback(() => {
    if (!hyperparams) return
    setTraining(true)
    setMetrics([])
    setEpoch(0)
    setFinished(false)

    const totalEpochs = Math.min(hyperparams.epochs, 50)
    const lr = hyperparams.lr
    const annCount = Object.values(annotations || {}).reduce((a, b) => a + b.length, 0)
    const qualityFactor = Math.min(annCount / 15, 1)

    // Simulate realistic training curves based on hyperparameters
    const lrFactor = lr > 0.05 ? 0.5 : lr > 0.02 ? 0.75 : lr < 0.0005 ? 0.6 : 1
    const targetMAP = (0.45 + qualityFactor * 0.35) * lrFactor
    const diverges = lr > 0.08

    let i = 0
    const interval = setInterval(() => {
      if (i >= totalEpochs) {
        clearInterval(interval)
        setTraining(false)
        setFinished(true)
        return
      }

      const progress = i / totalEpochs
      const noise = () => (Math.random() - 0.5) * 0.04

      let boxLoss, clsLoss, mAP, precision, recall

      if (diverges) {
        boxLoss = 2.5 + Math.sin(i * 0.5) * 1.5 + Math.random() * 0.5
        clsLoss = 1.8 + Math.sin(i * 0.3) * 1.0 + Math.random() * 0.3
        mAP = Math.max(0.05, 0.15 - progress * 0.1 + noise())
        precision = Math.max(0.1, 0.2 + noise())
        recall = Math.max(0.1, 0.15 + noise())
      } else {
        boxLoss = Math.max(0.3, 2.5 * Math.exp(-3 * progress) + noise() * 0.2)
        clsLoss = Math.max(0.15, 1.8 * Math.exp(-3.5 * progress) + noise() * 0.15)
        mAP = Math.min(targetMAP, targetMAP * (1 - Math.exp(-4 * progress)) + noise())
        precision = Math.min(0.95, (targetMAP + 0.1) * (1 - Math.exp(-3 * progress)) + noise())
        recall = Math.min(0.9, (targetMAP + 0.05) * (1 - Math.exp(-3.5 * progress)) + noise())
      }

      setMetrics(prev => [...prev, { epoch: i + 1, boxLoss, clsLoss, mAP, precision, recall }])
      setEpoch(i + 1)
      i++
    }, 120)

    return () => clearInterval(interval)
  }, [hyperparams, annotations])

  const finalMetrics = results || (metrics.length > 0 ? metrics[metrics.length - 1] : null)

  const completeTraining = () => {
    if (finalMetrics) onComplete(finalMetrics)
  }

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>🏋️</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Training Dashboard</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{training ? `Epoch ${epoch}/${Math.min(hyperparams?.epochs || 50, 50)}` : finished ? 'Training complete!' : 'Ready to train'}</p>
        </div>
        {training && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ marginLeft: 'auto', fontSize: 24 }}>⏳</motion.div>
        )}
      </div>

      {!training && !finished && !done && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <motion.button onClick={simulateTraining} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 18, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}>
            Start Training
          </motion.button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>Model: {model?.name} | LR: {hyperparams?.lr} | Epochs: {Math.min(hyperparams?.epochs || 50, 50)} | Batch: {hyperparams?.batchSize}</p>
        </div>
      )}

      {/* Metrics display */}
      {(training || finished || done) && (
        <>
          {/* Live stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Box Loss', value: finalMetrics?.boxLoss?.toFixed(3), color: '#ef4444' },
              { label: 'Cls Loss', value: finalMetrics?.clsLoss?.toFixed(3), color: '#f59e0b' },
              { label: 'mAP@50', value: (finalMetrics?.mAP * 100)?.toFixed(1) + '%', color: '#22c55e' },
              { label: 'Precision', value: (finalMetrics?.precision * 100)?.toFixed(1) + '%', color: '#3b82f6' },
              { label: 'Recall', value: (finalMetrics?.recall * 100)?.toFixed(1) + '%', color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{s.value || '-'}</div>
              </div>
            ))}
          </div>

          {/* Loss chart (simple bar-based) */}
          <div style={{ padding: 16, background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 14, border: '1px solid #334155', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>TRAINING LOSS</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120 }}>
              {metrics.slice(-40).map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                  <div style={{ width: '100%', maxWidth: 8, height: Math.min(100, m.boxLoss * 40), background: '#ef4444', borderRadius: '2px 2px 0 0', opacity: 0.7 }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginTop: 16, marginBottom: 12 }}>mAP@50</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120 }}>
              {metrics.slice(-40).map((m, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ width: '100%', maxWidth: 8, height: Math.max(2, m.mAP * 120), background: '#22c55e', borderRadius: '2px 2px 0 0', opacity: 0.8 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {training && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${(epoch / Math.min(hyperparams?.epochs || 50, 50)) * 100}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #22c55e)', borderRadius: 4 }} />
              </div>
            </div>
          )}
        </>
      )}

      {finished && !done && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button onClick={simulateTraining} whileHover={{ scale: 1.03 }}
              style={{ padding: '12px 24px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--border)', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
              Retrain with New Config
            </motion.button>
            <motion.button onClick={completeTraining} whileHover={{ scale: 1.04 }}
              style={{ padding: '12px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
              Accept Results — Evaluate →
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── STAGE 7: EVALUATION PANEL ─── */
function EvaluationPanel({ results, classes, onComplete, done }) {
  const classNames = classes.map(c => c.name)

  // Generate realistic per-class metrics
  const baseMAP = results?.mAP || 0.65
  const classMetrics = classNames.map((name, i) => ({
    name,
    ap: Math.max(0.3, baseMAP + (Math.random() - 0.5) * 0.2),
    precision: Math.max(0.4, (results?.precision || 0.7) + (Math.random() - 0.5) * 0.15),
    recall: Math.max(0.35, (results?.recall || 0.65) + (Math.random() - 0.5) * 0.15),
    tp: Math.floor(8 + Math.random() * 12),
    fp: Math.floor(1 + Math.random() * 5),
    fn: Math.floor(1 + Math.random() * 4),
  }))

  // Confusion matrix
  const n = classNames.length
  const confMatrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return Math.floor(10 + baseMAP * 15 + Math.random() * 5)
      return Math.floor(Math.random() * 3)
    })
  )

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>📊</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Evaluation Results</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>How well does your model detect defects?</p>
        </div>
      </div>

      {/* Overall metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'mAP@50', value: (baseMAP * 100).toFixed(1) + '%', color: '#22c55e', bg: '#f0fdf4' },
          { label: 'Precision', value: ((results?.precision || 0.7) * 100).toFixed(1) + '%', color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Recall', value: ((results?.recall || 0.65) * 100).toFixed(1) + '%', color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'F1 Score', value: (2 * (results?.precision || 0.7) * (results?.recall || 0.65) / ((results?.precision || 0.7) + (results?.recall || 0.65)) * 100).toFixed(1) + '%', color: '#f59e0b', bg: '#fffbeb' },
        ].map(m => (
          <div key={m.label} style={{ padding: 16, background: m.bg, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: m.color, fontFamily: 'var(--font-heading)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Per-class table */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Per-Class Performance</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Class', 'AP', 'Precision', 'Recall', 'TP', 'FP', 'FN'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classMetrics.map((cm, i) => (
                <tr key={cm.name} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: classes[i]?.color || 'var(--text-primary)' }}>{cm.name}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{(cm.ap * 100).toFixed(1)}%</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{(cm.precision * 100).toFixed(1)}%</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{(cm.recall * 100).toFixed(1)}%</td>
                  <td style={{ padding: '8px 12px', color: '#22c55e', fontWeight: 700 }}>{cm.tp}</td>
                  <td style={{ padding: '8px 12px', color: '#ef4444', fontWeight: 700 }}>{cm.fp}</td>
                  <td style={{ padding: '8px 12px', color: '#f59e0b', fontWeight: 700 }}>{cm.fn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Confusion Matrix</div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'inline-grid', gridTemplateColumns: `80px repeat(${n}, 60px)`, gap: 2, fontSize: 11 }}>
            <div />
            {classNames.map(c => <div key={c} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', padding: 4, fontSize: 10 }}>{c}</div>)}
            {confMatrix.map((row, i) => (
              <>
                <div key={'label-' + i} style={{ display: 'flex', alignItems: 'center', fontWeight: 700, color: classes[i]?.color || 'var(--text-primary)', fontSize: 10, paddingRight: 6, justifyContent: 'flex-end' }}>{classNames[i]}</div>
                {row.map((val, j) => {
                  const maxVal = Math.max(...confMatrix.flat())
                  const intensity = val / maxVal
                  const isDiag = i === j
                  return (
                    <div key={j} style={{
                      width: 60, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDiag ? `rgba(34,197,94,${intensity * 0.6 + 0.1})` : `rgba(239,68,68,${intensity * 0.5})`,
                      borderRadius: 4, fontWeight: 700, color: intensity > 0.5 ? 'white' : 'var(--text-primary)',
                    }}>
                      {val}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>Rows = Actual, Columns = Predicted. Green diagonal = correct predictions.</div>
        </div>
      </div>

      {!done && (
        <div style={{ textAlign: 'center' }}>
          <motion.button onClick={() => onComplete(classMetrics)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            Run Predictions →
          </motion.button>
        </div>
      )}
    </div>
  )
}

/* ─── STAGE 8: PREDICTION INTERFACE ─── */
function PredictionInterface({ results, classes }) {
  const testSamples = STEEL_DATASET.filter(s => s.split === 'test')
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [predictions, setPredictions] = useState({})
  const [running, setRunning] = useState(false)

  const runPrediction = (sample) => {
    setRunning(true)
    setSelectedIdx(testSamples.indexOf(sample))

    setTimeout(() => {
      const mAP = results?.mAP || 0.65
      const preds = sample.defects.map(d => {
        const detected = Math.random() < (mAP + 0.15)
        if (!detected) return null
        const jitter = () => (Math.random() - 0.5) * 0.04
        return {
          type: d.type,
          confidence: (0.5 + mAP * 0.45 + Math.random() * 0.1).toFixed(2),
          x: d.x + jitter(), y: d.y + jitter(),
          w: d.w + jitter() * 0.5, h: d.h + jitter() * 0.5,
        }
      }).filter(Boolean)

      // Possible false positive
      if (Math.random() > mAP + 0.1 && classes.length > 0) {
        preds.push({
          type: classes[Math.floor(Math.random() * classes.length)].name,
          confidence: (0.3 + Math.random() * 0.15).toFixed(2),
          x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.6 + 0.2,
          w: 0.08 + Math.random() * 0.05, h: 0.08 + Math.random() * 0.05,
          falsePositive: true,
        })
      }

      setPredictions(prev => ({ ...prev, [sample.id]: preds }))
      setRunning(false)
    }, 800 + Math.random() * 400)
  }

  const runAll = () => {
    testSamples.forEach((s, i) => {
      setTimeout(() => runPrediction(s), i * 600)
    })
  }

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>🔍</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Real-Time Prediction</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Run your trained model on unseen test images</p>
        </div>
        <motion.button onClick={runAll} whileHover={{ scale: 1.04 }} disabled={running}
          style={{ marginLeft: 'auto', padding: '10px 20px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: running ? 'wait' : 'pointer', opacity: running ? 0.6 : 1 }}>
          Run All Predictions
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {testSamples.map((sample, i) => {
          const preds = predictions[sample.id]
          const isSelected = selectedIdx === i
          return (
            <motion.div key={sample.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{
                borderRadius: 14, overflow: 'hidden',
                border: `2px solid ${isSelected ? '#f59e0b' : preds ? '#22c55e' : 'var(--border)'}`,
                background: 'var(--bg-secondary)',
              }}>
              <div style={{ position: 'relative' }}>
                <SteelSurface sample={sample} width={280} height={210} />
                {/* Prediction overlay */}
                {preds && (
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: 280, height: 210, pointerEvents: 'none' }}>
                    {preds.map((p, j) => {
                      const classColor = classes.find(c => c.name === p.type)?.color || '#f59e0b'
                      return (
                        <g key={j}>
                          <rect x={p.x * 280} y={p.y * 210} width={p.w * 280} height={p.h * 210}
                            fill="none" stroke={p.falsePositive ? '#ef4444' : classColor} strokeWidth={2}
                            strokeDasharray={p.falsePositive ? '4,4' : 'none'} />
                          <rect x={p.x * 280} y={p.y * 210 - 16} width={p.type.length * 7 + 40} height={16}
                            fill={p.falsePositive ? '#ef4444' : classColor} rx={3} />
                          <text x={p.x * 280 + 4} y={p.y * 210 - 4} fill="white" fontSize={10} fontWeight="bold">
                            {p.type} {p.confidence}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                )}
              </div>
              <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{sample.id}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {preds ? `${preds.filter(p => !p.falsePositive).length} detections` : 'Not tested'}
                  </div>
                </div>
                {!preds && (
                  <motion.button onClick={() => runPrediction(sample)} whileHover={{ scale: 1.05 }} disabled={running}
                    style={{ padding: '6px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                    Detect
                  </motion.button>
                )}
                {preds && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {preds.map((p, j) => (
                      <span key={j} style={{
                        padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                        background: p.falsePositive ? '#fee2e2' : '#d1fae5',
                        color: p.falsePositive ? '#991b1b' : '#065f46',
                      }}>
                        {p.type}
                      </span>
                    ))}
                    {preds.length === 0 && <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>PASS</span>}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      {Object.keys(predictions).length === testSamples.length && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 24, padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #22c55e', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: '#065f46', marginBottom: 8 }}>
            Pipeline Complete!
          </h3>
          <p style={{ fontSize: 14, color: '#16a34a', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            You built a complete steel defect detection system: annotated data, configured YOLO, trained the model, evaluated performance, and ran real-time predictions. This is how industrial quality inspection works in production.
          </p>
        </motion.div>
      )}
    </div>
  )
}
