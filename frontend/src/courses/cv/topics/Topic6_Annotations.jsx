import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 6 — Annotations & Data Labeling
   Visual storytelling: From raw pixels to structured training data —
   the human step that teaches machines to see
================================================================ */

/* ---- Section 1: Why Annotate ---- */
function WhyAnnotate() {
  const [revealed, setRevealed] = useState(false)

  const svgW = 400
  const svgH = 250

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Steel surface */}
        <div style={{ flex: '1 1 400px', position: 'relative' }}>
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ display: 'block', width: '100%', maxWidth: 500, borderRadius: 14, overflow: 'hidden' }}>
            <defs>
              <linearGradient id="steelAnno" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a5568" />
                <stop offset="40%" stopColor="#718096" />
                <stop offset="100%" stopColor="#4a5568" />
              </linearGradient>
            </defs>
            <rect width={svgW} height={svgH} fill="url(#steelAnno)" />

            {/* Surface texture noise */}
            {Array.from({ length: 30 }).map((_, i) => (
              <circle key={`noise-${i}`}
                cx={20 + (i * 37) % svgW} cy={15 + (i * 53) % svgH}
                r={1} fill="#2d3748" opacity={0.3}
              />
            ))}

            {/* Defects */}
            <ellipse cx={120} cy={80} rx={55} ry={8} fill="#2d3748" opacity={0.7} />
            <circle cx={300} cy={160} r={18} fill="#2d3748" opacity={0.6} />
            <rect x={210} y={50} width={5} height={60} fill="#2d3748" opacity={0.5} rx={2} />

            {/* Annotations overlay */}
            {revealed && (
              <>
                {/* Scratch bbox */}
                <motion.rect
                  x={60} y={66} width={120} height={30}
                  fill="transparent" stroke="#ef4444" strokeWidth={2.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <rect x={60} y={49} width={72} height={16} rx={4} fill="#ef4444" />
                  <text x={66} y={61} fill="white" fontSize={11} fontWeight={700} fontFamily="monospace">Scratch</text>
                </motion.g>

                {/* Pit bbox */}
                <motion.rect
                  x={278} y={138} width={44} height={44}
                  fill="transparent" stroke="#f59e0b" strokeWidth={2.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  <rect x={278} y={122} width={40} height={16} rx={4} fill="#f59e0b" />
                  <text x={287} y={134} fill="white" fontSize={11} fontWeight={700} fontFamily="monospace">Pit</text>
                </motion.g>

                {/* Crack bbox */}
                <motion.rect
                  x={204} y={44} width={18} height={72}
                  fill="transparent" stroke="#8b5cf6" strokeWidth={2.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                />
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                  <rect x={204} y={28} width={48} height={16} rx={4} fill="#8b5cf6" />
                  <text x={210} y={40} fill="white" fontSize={11} fontWeight={700} fontFamily="monospace">Crack</text>
                </motion.g>

                {/* Coordinate annotations */}
                <motion.text x={60} y={110} fill="#ef444499" fontSize={9} fontFamily="monospace"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                  (120, 80, 120, 30)
                </motion.text>
                <motion.text x={278} y={196} fill="#f59e0b99" fontSize={9} fontFamily="monospace"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                  (300, 160, 44, 44)
                </motion.text>
              </>
            )}
          </svg>
        </div>

        {/* Machine perspective */}
        <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.div
                key="raw"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'var(--bg-card)', borderRadius: 14,
                  border: '1px solid var(--border)', padding: 24,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  What the machine sees
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)',
                  background: '#1a1a2e', padding: 16, borderRadius: 10,
                  lineHeight: 1.8, overflowX: 'auto',
                }}>
                  <div style={{ color: '#10b981' }}>shape: (640, 640, 3)</div>
                  <div style={{ color: '#6366f1' }}>dtype: uint8</div>
                  <div style={{ color: '#f59e0b' }}>values: [114, 118, 112,</div>
                  <div style={{ color: '#f59e0b' }}>&nbsp;&nbsp;115, 119, 111, ...]</div>
                  <div style={{ color: '#ef4444', marginTop: 8 }}>Just numbers. No meaning.</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="annotated"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--bg-card)', borderRadius: 14,
                  border: '2px solid #10b98140', padding: 24,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Now the machine knows
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)',
                  background: '#1a1a2e', padding: 16, borderRadius: 10,
                  lineHeight: 2,
                }}>
                  <div><span style={{ color: '#ef4444' }}>scratch</span> 0.30 0.32 0.19 0.05</div>
                  <div><span style={{ color: '#f59e0b' }}>pit</span> &nbsp;&nbsp;&nbsp;&nbsp;0.75 0.64 0.07 0.07</div>
                  <div><span style={{ color: '#8b5cf6' }}>crack</span> &nbsp;&nbsp;0.53 0.31 0.03 0.11</div>
                  <div style={{ color: '#10b981', marginTop: 8 }}>Structured data. Ready to train.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setRevealed(!revealed)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '14px 24px', borderRadius: 12,
              background: revealed ? '#10b981' : 'var(--accent)',
              color: 'white', border: 'none', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
            }}
          >
            {revealed ? 'Show Raw Image' : 'Add Annotations'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ---- Section 2: Annotation Types ---- */
function AnnotationTypes() {
  const [activeType, setActiveType] = useState(0)

  const types = [
    {
      name: 'Bounding Box',
      icon: '🔲',
      speed: 'Fastest',
      useCase: 'Object Detection (YOLO)',
      color: '#ef4444',
      description: 'A simple rectangle around the defect. Fastest to draw but includes background pixels.',
    },
    {
      name: 'Polygon',
      icon: '🔷',
      speed: 'Medium',
      useCase: 'Instance Segmentation',
      color: '#3b82f6',
      description: 'A multi-point outline tracing the defect shape. More precise than bounding boxes.',
    },
    {
      name: 'Segmentation Mask',
      icon: '🎨',
      speed: 'Slowest',
      useCase: 'Semantic Segmentation',
      color: '#8b5cf6',
      description: 'Every pixel classified as defect or background. Maximum precision, maximum labeling time.',
    },
    {
      name: 'Keypoints',
      icon: '📍',
      speed: 'Medium',
      useCase: 'Pose Estimation / Endpoints',
      color: '#10b981',
      description: 'Specific points marking defect features (start, end, center). Used for length/angle measurement.',
    },
  ]

  const type = types[activeType]
  const svgW = 300
  const svgH = 200

  return (
    <div>
      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {types.map((t, i) => (
          <motion.button
            key={t.name}
            onClick={() => setActiveType(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              background: i === activeType ? t.color : 'var(--bg-card)',
              color: i === activeType ? 'white' : 'var(--text-primary)',
            }}
            style={{
              padding: '10px 18px', borderRadius: 10,
              border: `1px solid ${i === activeType ? t.color : 'var(--border)'}`,
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span>{t.icon}</span>
            {t.name}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Visualization */}
        <div style={{ flex: '1 1 300px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
                style={{ display: 'block', width: '100%', maxWidth: 400, background: '#1a1a2e', borderRadius: 12 }}>
                <defs>
                  <linearGradient id="steelTypes" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4a5568" />
                    <stop offset="50%" stopColor="#718096" />
                    <stop offset="100%" stopColor="#4a5568" />
                  </linearGradient>
                </defs>
                <rect width={svgW} height={svgH} fill="url(#steelTypes)" />

                {/* Scratch defect */}
                <ellipse cx={150} cy={100} rx={60} ry={10} fill="#2d3748" opacity={0.8} />

                {/* Bounding Box */}
                {activeType === 0 && (
                  <motion.rect
                    x={85} y={84} width={130} height={32}
                    fill={`${type.color}15`}
                    stroke={type.color}
                    strokeWidth={2.5}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                )}

                {/* Polygon */}
                {activeType === 1 && (
                  <>
                    <motion.polygon
                      points="92,96 100,88 130,85 170,84 200,86 210,92 212,100 208,108 190,112 160,114 120,113 96,108"
                      fill={`${type.color}20`}
                      stroke={type.color}
                      strokeWidth={2}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                    {/* Polygon vertices */}
                    {[[92,96],[100,88],[130,85],[170,84],[200,86],[210,92],[212,100],[208,108],[190,112],[160,114],[120,113],[96,108]].map(([x,y], i) => (
                      <motion.circle
                        key={`poly-${i}`}
                        cx={x} cy={y} r={3.5}
                        fill={type.color}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05, type: 'spring' }}
                      />
                    ))}
                  </>
                )}

                {/* Segmentation Mask */}
                {activeType === 2 && (
                  <>
                    {/* Pixel grid effect */}
                    {Array.from({ length: 20 }).map((_, row) =>
                      Array.from({ length: 30 }).map((_, col) => {
                        const px = 60 + col * 6
                        const py = 72 + row * 3
                        const dx = px - 150
                        const dy = (py - 100) * 5
                        const inDefect = (dx * dx) / (60 * 60) + (dy * dy) / (50 * 50) < 1
                        return inDefect ? (
                          <motion.rect
                            key={`mask-${row}-${col}`}
                            x={px} y={py} width={5} height={2.5}
                            fill={type.color}
                            opacity={0.6}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: (row * 30 + col) * 0.003 }}
                          />
                        ) : null
                      })
                    )}
                  </>
                )}

                {/* Keypoints */}
                {activeType === 3 && (
                  <>
                    {/* Connection line */}
                    <motion.line
                      x1={90} y1={100} x2={210} y2={100}
                      stroke={`${type.color}60`} strokeWidth={2} strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Keypoints */}
                    {[
                      { x: 90, y: 100, label: 'Start' },
                      { x: 150, y: 97, label: 'Center' },
                      { x: 210, y: 100, label: 'End' },
                    ].map((kp, i) => (
                      <motion.g key={`kp-${i}`}>
                        <motion.circle
                          cx={kp.x} cy={kp.y} r={7}
                          fill={type.color}
                          stroke="white"
                          strokeWidth={2}
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.3, 1] }}
                          transition={{ delay: 0.4 + i * 0.2, type: 'spring' }}
                        />
                        <motion.text
                          x={kp.x} y={kp.y + 20}
                          fill={type.color} fontSize={10} fontWeight={700}
                          textAnchor="middle" fontFamily="monospace"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.2 }}
                        >
                          {kp.label}
                        </motion.text>
                      </motion.g>
                    ))}
                  </>
                )}
              </svg>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Info panel */}
        <div style={{ flex: '1 1 220px' }}>
          <motion.div
            key={activeType}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'var(--bg-card)', borderRadius: 14,
              border: `2px solid ${type.color}30`, padding: 22,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 28 }}>{type.icon}</span>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                {type.name}
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
              {type.description}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: '8px 14px', borderRadius: 8,
                background: `${type.color}10`, border: `1px solid ${type.color}25`,
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Labeling Speed: </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: type.color }}>{type.speed}</span>
              </div>
              <div style={{
                padding: '8px 14px', borderRadius: 8,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Used For: </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{type.useCase}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ---- Section 3: BBox Anatomy ---- */
function BBoxAnatomy() {
  const [boxState, setBoxState] = useState({ x: 100, y: 70, w: 140, h: 50 })
  const [dragging, setDragging] = useState(null)
  const [format, setFormat] = useState('yolo')

  const svgW = 380
  const svgH = 250
  const imgW = 640
  const imgH = 400

  // Convert displayed coords to format coords
  const toYOLO = () => ({
    x_center: ((boxState.x + boxState.w / 2) / svgW).toFixed(4),
    y_center: ((boxState.y + boxState.h / 2) / svgH).toFixed(4),
    width: (boxState.w / svgW).toFixed(4),
    height: (boxState.h / svgH).toFixed(4),
  })

  const toVOC = () => ({
    x1: Math.round((boxState.x / svgW) * imgW),
    y1: Math.round((boxState.y / svgH) * imgH),
    x2: Math.round(((boxState.x + boxState.w) / svgW) * imgW),
    y2: Math.round(((boxState.y + boxState.h) / svgH) * imgH),
  })

  const toCOCO = () => ({
    x: Math.round((boxState.x / svgW) * imgW),
    y: Math.round((boxState.y / svgH) * imgH),
    width: Math.round((boxState.w / svgW) * imgW),
    height: Math.round((boxState.h / svgH) * imgH),
  })

  const yolo = toYOLO()
  const voc = toVOC()
  const coco = toCOCO()

  const handleCornerDrag = (corner, e) => {
    const svg = e.target.closest('svg')
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scaleX = svgW / rect.width
    const scaleY = svgH / rect.height

    const onMove = (moveEvt) => {
      const mx = (moveEvt.clientX - rect.left) * scaleX
      const my = (moveEvt.clientY - rect.top) * scaleY

      setBoxState(prev => {
        const newState = { ...prev }
        if (corner === 'tl') {
          newState.w = prev.x + prev.w - Math.max(10, mx)
          newState.h = prev.y + prev.h - Math.max(10, my)
          newState.x = Math.max(10, mx)
          newState.y = Math.max(10, my)
        } else if (corner === 'tr') {
          newState.w = Math.min(svgW - 10, mx) - prev.x
          newState.h = prev.y + prev.h - Math.max(10, my)
          newState.y = Math.max(10, my)
        } else if (corner === 'bl') {
          newState.w = prev.x + prev.w - Math.max(10, mx)
          newState.x = Math.max(10, mx)
          newState.h = Math.min(svgH - 10, my) - prev.y
        } else if (corner === 'br') {
          newState.w = Math.min(svgW - 10, mx) - prev.x
          newState.h = Math.min(svgH - 10, my) - prev.y
        }
        newState.w = Math.max(30, newState.w)
        newState.h = Math.max(20, newState.h)
        return newState
      })
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setDragging(null)
    }

    setDragging(corner)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const corners = [
    { id: 'tl', x: boxState.x, y: boxState.y },
    { id: 'tr', x: boxState.x + boxState.w, y: boxState.y },
    { id: 'bl', x: boxState.x, y: boxState.y + boxState.h },
    { id: 'br', x: boxState.x + boxState.w, y: boxState.y + boxState.h },
  ]

  const cx = boxState.x + boxState.w / 2
  const cy = boxState.y + boxState.h / 2

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Interactive SVG */}
        <div style={{ flex: '1 1 380px' }}>
          <svg
            width={svgW} height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{
              display: 'block', width: '100%', maxWidth: 480,
              background: '#1a1a2e', borderRadius: 12, cursor: dragging ? 'grabbing' : 'default',
              userSelect: 'none',
            }}
          >
            <defs>
              <linearGradient id="steelBbox" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a5568" />
                <stop offset="50%" stopColor="#718096" />
                <stop offset="100%" stopColor="#4a5568" />
              </linearGradient>
            </defs>
            <rect width={svgW} height={svgH} fill="url(#steelBbox)" />

            {/* Defect */}
            <ellipse cx={170} cy={95} rx={55} ry={14} fill="#2d3748" opacity={0.7} />

            {/* Bounding box */}
            <rect
              x={boxState.x} y={boxState.y}
              width={boxState.w} height={boxState.h}
              fill="#3b82f612" stroke="#3b82f6" strokeWidth={2}
            />

            {/* Center point (YOLO) */}
            {format === 'yolo' && (
              <>
                <line x1={cx} y1={boxState.y} x2={cx} y2={boxState.y + boxState.h}
                  stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                <line x1={boxState.x} y1={cy} x2={boxState.x + boxState.w} y2={cy}
                  stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                <circle cx={cx} cy={cy} r={5} fill="#f59e0b" />
                <text x={cx + 10} y={cy - 8} fill="#f59e0b" fontSize={10} fontFamily="monospace" fontWeight={700}>
                  center
                </text>
              </>
            )}

            {/* Corner points (VOC) */}
            {format === 'voc' && (
              <>
                <circle cx={boxState.x} cy={boxState.y} r={5} fill="#ef4444" />
                <text x={boxState.x + 8} y={boxState.y - 6} fill="#ef4444" fontSize={10} fontFamily="monospace" fontWeight={700}>
                  (x1,y1)
                </text>
                <circle cx={boxState.x + boxState.w} cy={boxState.y + boxState.h} r={5} fill="#10b981" />
                <text x={boxState.x + boxState.w + 8} y={boxState.y + boxState.h + 14} fill="#10b981" fontSize={10} fontFamily="monospace" fontWeight={700}>
                  (x2,y2)
                </text>
              </>
            )}

            {/* COCO origin + dimensions */}
            {format === 'coco' && (
              <>
                <circle cx={boxState.x} cy={boxState.y} r={5} fill="#8b5cf6" />
                <text x={boxState.x + 8} y={boxState.y - 6} fill="#8b5cf6" fontSize={10} fontFamily="monospace" fontWeight={700}>
                  (x,y)
                </text>
                {/* Width arrow */}
                <line x1={boxState.x} y1={boxState.y + boxState.h + 12}
                  x2={boxState.x + boxState.w} y2={boxState.y + boxState.h + 12}
                  stroke="#8b5cf6" strokeWidth={1.5} />
                <text x={cx - 8} y={boxState.y + boxState.h + 24} fill="#8b5cf6" fontSize={9} fontFamily="monospace" fontWeight={700}>
                  width
                </text>
                {/* Height arrow */}
                <line x1={boxState.x + boxState.w + 12} y1={boxState.y}
                  x2={boxState.x + boxState.w + 12} y2={boxState.y + boxState.h}
                  stroke="#8b5cf6" strokeWidth={1.5} />
                <text x={boxState.x + boxState.w + 16} y={cy + 4} fill="#8b5cf6" fontSize={9} fontFamily="monospace" fontWeight={700}>
                  height
                </text>
              </>
            )}

            {/* Draggable corners */}
            {corners.map(c => (
              <circle
                key={c.id}
                cx={c.x} cy={c.y} r={7}
                fill="white" stroke="#3b82f6" strokeWidth={2}
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleCornerDrag(c.id, e)}
              />
            ))}
          </svg>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
            Drag the corner handles to resize the bounding box
          </div>
        </div>

        {/* Coordinate formats */}
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Format selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {[
              { id: 'yolo', label: 'YOLO', color: '#f59e0b' },
              { id: 'voc', label: 'Pascal VOC', color: '#ef4444' },
              { id: 'coco', label: 'COCO', color: '#8b5cf6' },
            ].map(f => (
              <motion.button
                key={f.id}
                onClick={() => setFormat(f.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8,
                  background: format === f.id ? f.color : 'var(--bg-card)',
                  color: format === f.id ? 'white' : 'var(--text-primary)',
                  border: `1px solid ${format === f.id ? f.color : 'var(--border)'}`,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>

          {/* YOLO format */}
          <motion.div
            animate={{ borderColor: format === 'yolo' ? '#f59e0b' : 'var(--border)', opacity: format === 'yolo' ? 1 : 0.5 }}
            style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'var(--bg-card)', border: '2px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>
              YOLO Format (normalized)
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              class {yolo.x_center} {yolo.y_center} {yolo.width} {yolo.height}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              (x_center, y_center, width, height) in 0-1 range
            </div>
          </motion.div>

          {/* VOC format */}
          <motion.div
            animate={{ borderColor: format === 'voc' ? '#ef4444' : 'var(--border)', opacity: format === 'voc' ? 1 : 0.5 }}
            style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'var(--bg-card)', border: '2px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>
              Pascal VOC Format (pixels)
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              &lt;bndbox&gt; {voc.x1}, {voc.y1}, {voc.x2}, {voc.y2}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              (x_min, y_min, x_max, y_max) in absolute pixels
            </div>
          </motion.div>

          {/* COCO format */}
          <motion.div
            animate={{ borderColor: format === 'coco' ? '#8b5cf6' : 'var(--border)', opacity: format === 'coco' ? 1 : 0.5 }}
            style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'var(--bg-card)', border: '2px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>
              COCO Format (pixels)
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8 }}>
              &quot;bbox&quot;: [{coco.x}, {coco.y}, {coco.width}, {coco.height}]
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              (x, y, width, height) top-left origin in pixels
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ---- Section 4: Labeling Best Practices ---- */
function LabelingBestPractices() {
  const [activeExample, setActiveExample] = useState(0)

  const practices = [
    {
      bad: { label: 'Too Tight', color: '#ef4444', boxOffset: { x: 6, y: 4, w: -12, h: -8 } },
      good: { label: 'Proper Fit', color: '#10b981', boxOffset: { x: 0, y: 0, w: 0, h: 0 } },
      tip: 'Leave a small margin (2-5px) around the defect for the model to learn context.',
    },
    {
      bad: { label: 'Too Loose', color: '#ef4444', boxOffset: { x: -25, y: -20, w: 50, h: 40 } },
      good: { label: 'Proper Fit', color: '#10b981', boxOffset: { x: 0, y: 0, w: 0, h: 0 } },
      tip: 'Overly large boxes include too much background, confusing the model.',
    },
    {
      bad: { label: 'Missed Defect', color: '#ef4444', missed: true },
      good: { label: 'All Labeled', color: '#10b981', boxOffset: { x: 0, y: 0, w: 0, h: 0 }, showAll: true },
      tip: 'Missing annotations teach the model that unlabeled defects are background.',
    },
    {
      bad: { label: 'Wrong Class', color: '#ef4444', wrongClass: 'Pit', boxOffset: { x: 0, y: 0, w: 0, h: 0 } },
      good: { label: 'Correct Class', color: '#10b981', boxOffset: { x: 0, y: 0, w: 0, h: 0 } },
      tip: 'Mislabeled data teaches wrong patterns. Quality > Quantity.',
    },
  ]

  const practice = practices[activeExample]
  const svgW = 200
  const svgH = 150
  // Reference defect
  const defect = { cx: 100, cy: 75, rx: 40, ry: 10 }
  const baseBox = { x: 55, y: 60, w: 90, h: 30 }

  const renderScene = (config, isBad) => (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ display: 'block', width: '100%', background: '#1a1a2e', borderRadius: 10 }}>
      <defs>
        <linearGradient id={`steelPr${isBad ? 'B' : 'G'}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="50%" stopColor="#718096" />
          <stop offset="100%" stopColor="#4a5568" />
        </linearGradient>
      </defs>
      <rect width={svgW} height={svgH} fill={`url(#steelPr${isBad ? 'B' : 'G'})`} />

      {/* Main defect */}
      <ellipse cx={defect.cx} cy={defect.cy} rx={defect.rx} ry={defect.ry} fill="#2d3748" opacity={0.7} />

      {/* Second defect for "missed" scenario */}
      {(activeExample === 2) && (
        <circle cx={160} cy={120} r={12} fill="#2d3748" opacity={0.6} />
      )}

      {/* Bounding box */}
      {!config.missed && (
        <>
          <motion.rect
            x={baseBox.x + (config.boxOffset?.x || 0)}
            y={baseBox.y + (config.boxOffset?.y || 0)}
            width={baseBox.w + (config.boxOffset?.w || 0)}
            height={baseBox.h + (config.boxOffset?.h || 0)}
            fill="transparent"
            stroke={config.color}
            strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <rect
            x={baseBox.x + (config.boxOffset?.x || 0)}
            y={baseBox.y + (config.boxOffset?.y || 0) - 16}
            width={config.wrongClass ? 28 : 56}
            height={14} rx={3}
            fill={config.color}
          />
          <text
            x={baseBox.x + (config.boxOffset?.x || 0) + 4}
            y={baseBox.y + (config.boxOffset?.y || 0) - 5}
            fill="white" fontSize={9} fontWeight={700} fontFamily="monospace"
          >
            {config.wrongClass || 'Scratch'}
          </text>
        </>
      )}

      {/* Show second box for "All Labeled" */}
      {config.showAll && (
        <>
          <motion.rect
            x={144} y={104} width={32} height={32}
            fill="transparent" stroke={config.color} strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          <rect x={144} y={88} width={24} height={14} rx={3} fill={config.color} />
          <text x={148} y={99} fill="white" fontSize={9} fontWeight={700} fontFamily="monospace">Pit</text>
        </>
      )}
    </svg>
  )

  return (
    <div>
      {/* Practice selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {practices.map((p, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveExample(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: i === activeExample ? 'var(--accent)' : 'var(--bg-card)',
              color: i === activeExample ? 'white' : 'var(--text-primary)',
              border: `1px solid ${i === activeExample ? 'var(--accent)' : 'var(--border)'}`,
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            {p.bad.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeExample}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
        >
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Bad example */}
            <div style={{ flex: '1 1 200px', maxWidth: 280 }}>
              <div style={{
                textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#ef4444',
                marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 18 }}>X</span> {practice.bad.label}
              </div>
              <div style={{ border: '2px solid #ef444440', borderRadius: 12, overflow: 'hidden' }}>
                {renderScene(practice.bad, true)}
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: 'var(--text-muted)', alignSelf: 'center',
            }}>
              <motion.span
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                &#8594;
              </motion.span>
            </div>

            {/* Good example */}
            <div style={{ flex: '1 1 200px', maxWidth: 280 }}>
              <div style={{
                textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#10b981',
                marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 18 }}>&#10003;</span> {practice.good.label}
              </div>
              <div style={{ border: '2px solid #10b98140', borderRadius: 12, overflow: 'hidden' }}>
                {renderScene(practice.good, false)}
              </div>
            </div>
          </div>

          {/* Tip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: 20, padding: '14px 20px', borderRadius: 12,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              textAlign: 'center', fontSize: 14, color: '#1e40af', fontWeight: 600,
            }}
          >
            {practice.tip}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 5: Dataset Splitting ---- */
function DatasetSplitting() {
  const [splitting, setSplitting] = useState(false)
  const [splitDone, setSplitDone] = useState(false)
  const [showLeakage, setShowLeakage] = useState(false)

  const totalImages = 100
  const trainCount = 70
  const valCount = 15
  const testCount = 15

  const allImages = Array.from({ length: totalImages }, (_, i) => ({
    id: i,
    color: i < trainCount ? '#3b82f6' : i < trainCount + valCount ? '#f59e0b' : '#10b981',
    group: i < trainCount ? 'train' : i < trainCount + valCount ? 'val' : 'test',
  }))

  const handleSplit = () => {
    setSplitting(true)
    setSplitDone(false)
    setTimeout(() => {
      setSplitDone(true)
      setSplitting(false)
    }, 2500)
  }

  const splits = [
    { label: 'Train', count: trainCount, pct: '70%', color: '#3b82f6', icon: '📚', purpose: 'Model learns patterns from these images' },
    { label: 'Validation', count: valCount, pct: '15%', color: '#f59e0b', icon: '🔍', purpose: 'Tune hyperparameters, prevent overfitting' },
    { label: 'Test', count: testCount, pct: '15%', color: '#10b981', icon: '🏆', purpose: 'Final unbiased performance evaluation' },
  ]

  return (
    <div>
      {/* Image grid animation */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 14,
        border: '1px solid var(--border)', padding: 24, marginBottom: 20,
      }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center',
          marginBottom: 20,
        }}>
          {allImages.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ background: 'var(--bg-secondary)' }}
              animate={{
                background: splitDone || splitting ? img.color : 'var(--bg-secondary)',
                scale: splitting ? [1, 0.8, 1] : 1,
              }}
              transition={{
                delay: splitting ? i * 0.015 : 0,
                duration: splitting ? 0.3 : 0.5,
              }}
              style={{
                width: 22, height: 22, borderRadius: 4,
                border: '1px solid var(--border)',
              }}
            />
          ))}
        </div>

        <motion.button
          onClick={handleSplit}
          disabled={splitting}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'block', margin: '0 auto', padding: '12px 28px',
            borderRadius: 10,
            background: splitting ? 'var(--text-muted)' : 'var(--accent)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
            cursor: splitting ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {splitting ? 'Shuffling & Splitting...' : splitDone ? 'Split Again' : 'Split Dataset'}
        </motion.button>
      </div>

      {/* Split breakdown */}
      <AnimatePresence>
        {splitDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}
          >
            {splits.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                style={{
                  flex: '1 1 180px', padding: '20px 22px', borderRadius: 14,
                  background: 'var(--bg-card)', border: `2px solid ${s.color}40`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: s.color }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {s.count} images ({s.pct})
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-secondary)', overflow: 'hidden', marginBottom: 10 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: s.pct }}
                    transition={{ delay: i * 0.15 + 0.3, duration: 0.8, type: 'spring' }}
                    style={{ height: '100%', borderRadius: 4, background: s.color }}
                  />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {s.purpose}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data leakage warning */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 14,
        border: '1px solid var(--border)', padding: 24,
      }}>
        <motion.button
          onClick={() => setShowLeakage(!showLeakage)}
          whileHover={{ scale: 1.02 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <span style={{ fontSize: 22 }}>&#9888;&#65039;</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#dc2626' }}>
            What is Data Leakage?
          </span>
          <motion.span
            animate={{ rotate: showLeakage ? 180 : 0 }}
            style={{ fontSize: 18, color: 'var(--text-muted)', marginLeft: 'auto' }}
          >
            &#9660;
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {showLeakage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: 20 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {/* Bad split */}
                  <div style={{
                    flex: '1 1 200px', padding: '18px 20px', borderRadius: 12,
                    background: '#fef2f2', border: '1px solid #fecaca',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 10 }}>
                      Bad Split
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                      {/* Duplicate images crossing train/test */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            background: i < 5 ? '#3b82f6' : '#10b981',
                            outline: i === 2 || i === 6 ? '2px solid #ef4444' : 'none',
                          }}
                          style={{
                            width: 28, height: 28, borderRadius: 5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, color: 'white', fontWeight: 700,
                          }}
                        >
                          {(i === 2 || i === 6) ? 'A' : ''}
                        </motion.div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.6 }}>
                      Same image &quot;A&quot; appears in both train and test.
                      The model memorizes instead of learning.
                      Test accuracy is artificially inflated.
                    </div>
                  </div>

                  {/* Good split */}
                  <div style={{
                    flex: '1 1 200px', padding: '18px 20px', borderRadius: 12,
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 10 }}>
                      Proper Split
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          style={{
                            width: 28, height: 28, borderRadius: 5,
                            background: i < 5 ? '#3b82f6' : '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, color: 'white', fontWeight: 700,
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </motion.div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.6 }}>
                      Every image is unique to its split.
                      No data crosses boundaries.
                      Test results reflect true performance.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic6() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Neuron mood="explaining" typed message="Before a model can detect defects, a human must first teach it what defects look like. This is annotation — the process of drawing boxes, polygons, and labels on images to create training data. It is the most important step in any computer vision project." />

      <SectionBlock title="Why Annotate?" icon="🖼️">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Without annotations, images are just arrays of numbers. Watch what happens when we add labels:
        </p>
        <HindiExplainer
          concept="एनोटेशन — AI को सिखाना"
          english="Annotation — Teaching AI"
          explanation="AI को सिखाने के लिए हमें तस्वीरों में बताना पड़ता है कि 'ये खरोंच है', 'ये दरार है'। इसी काम को एनोटेशन कहते हैं — तस्वीर पर निशान लगाकर लेबल देना।"
          example="जैसे स्कूल में टीचर बच्चों को तस्वीर दिखाकर बताते हैं 'ये गाय है, ये घोड़ा है' — वैसे ही हम AI को तस्वीरों में बॉक्स बनाकर बताते हैं 'ये defect है, ये normal है'।"
          terms={[
            { hindi: 'लेबल', english: 'Label', meaning: 'तस्वीर को दिया गया नाम — जैसे scratch, crack' },
            { hindi: 'ग्राउंड ट्रुथ', english: 'Ground Truth', meaning: 'सही जवाब — जो इंसान ने बताया' },
            { hindi: 'ट्रेनिंग डेटा', english: 'Training Data', meaning: 'वो तस्वीरें जिनसे AI सीखता है' },
          ]}
        />
        <InteractiveDemo title="From Pixels to Knowledge" instruction="Click 'Add Annotations' to transform raw pixels into structured training data.">
          <WhyAnnotate />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip>
        The quality of your annotations directly determines the quality of your model. A model trained on sloppy labels will make sloppy predictions. <strong>Garbage in, garbage out.</strong>
      </NeuronTip>

      <SectionBlock title="Types of Annotations" icon="🎨">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Different tasks require different annotation types. Click each one to see how it works on the same defect:
        </p>
        <HindiExplainer
          concept="एनोटेशन के प्रकार"
          english="Types of Annotations"
          explanation="बॉक्स, बहुभुज (polygon), पिक्सेल मास्क — ये सब एनोटेशन के अलग-अलग तरीके हैं। सरल काम के लिए बॉक्स काफ़ी है, मुश्किल काम के लिए pixel-level marking चाहिए।"
          example="जैसे किसी को रास्ता बताने के तीन तरीके हैं: (1) 'वो बिल्डिंग वहाँ है' (बॉक्स), (2) 'इस आकार की बिल्डिंग' (polygon), (3) 'हर ईंट दिखाओ' (pixel mask)। जितना detail चाहिए, उतना मेहनत लगती है!"
          terms={[
            { hindi: 'बाउंडिंग बॉक्स', english: 'Bounding Box', meaning: 'चौकोर बॉक्स — सबसे आसान' },
            { hindi: 'पॉलीगॉन', english: 'Polygon', meaning: 'बहुभुज — चीज़ के आकार के हिसाब से' },
            { hindi: 'सेगमेंटेशन मास्क', english: 'Segmentation Mask', meaning: 'हर पिक्सेल को रंग देना' },
          ]}
        />
        <InteractiveDemo title="Annotation Type Explorer">
          <AnnotationTypes />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Bounding Box Anatomy" icon="📐">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          The same bounding box can be described in 3 different coordinate formats. Drag the corners and watch all formats update live:
        </p>
        <InteractiveDemo title="Interactive BBox Lab" instruction="Drag corners to resize. Switch between YOLO, Pascal VOC, and COCO formats.">
          <BBoxAnatomy />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="warning">
        When converting datasets between tools (Roboflow, LabelImg, CVAT), always double-check the coordinate format. YOLO uses normalized center-based coords (0-1), while VOC and COCO use pixel-based coords. A format mismatch will cause your model to learn from completely wrong box positions.
      </NeuronTip>

      <SectionBlock title="Labeling Best Practices" icon="🎯">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Good labels make good models. Click through common mistakes and their corrections:
        </p>
        <InteractiveDemo title="Do's and Don'ts of Labeling">
          <LabelingBestPractices />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Dataset Splitting" icon="📊">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          After labeling, split your data into train, validation, and test sets. This is critical for evaluating your model fairly:
        </p>
        <HindiExplainer
          concept="डेटासेट बाँटना"
          english="Dataset Splitting"
          explanation="AI को सिखाने के लिए डेटा को तीन हिस्सों में बाँटते हैं: Training (सीखने के लिए ~70%), Validation (प्रैक्टिस टेस्ट ~15%), और Test (फ़ाइनल परीक्षा ~15%)।"
          example="जैसे परीक्षा की तैयारी: किताब पढ़ना = Training, मॉक टेस्ट = Validation, फ़ाइनल एग्ज़ाम = Test। अगर फ़ाइनल एग्ज़ाम के सवाल पहले से बता दो तो नक़ल हो जाएगी — इसलिए Test डेटा अलग रखते हैं!"
          terms={[
            { hindi: 'प्रशिक्षण', english: 'Training', meaning: 'AI को सिखाने वाला डेटा — 70%' },
            { hindi: 'सत्यापन', english: 'Validation', meaning: 'बीच में जाँचने वाला — 15%' },
            { hindi: 'डेटा लीकेज', english: 'Data Leakage', meaning: 'जब टेस्ट का डेटा ट्रेनिंग में मिल जाए — बहुत ख़राब!' },
          ]}
        />
        <InteractiveDemo title="Dataset Split Simulator" instruction="Click 'Split Dataset' to see 100 images sorted into train/val/test groups.">
          <DatasetSplitting />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="happy" typed message="Excellent! You now understand how to prepare data for training — from raw images to properly annotated, correctly split datasets. Next, we will dive into training metrics: how to measure whether your model is actually learning." />
    </div>
  )
}
