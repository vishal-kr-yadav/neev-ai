import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 5 — Object Detection & YOLO
   Visual storytelling: From brute-force sliding windows to real-time
   single-shot detection on steel surfaces
================================================================ */

/* ---- Section 1: DetectionEvolution ---- */
function DetectionEvolution() {
  const [activeEra, setActiveEra] = useState(0)

  const eras = [
    {
      name: 'Sliding Window',
      year: '2001',
      speed: 'Very Slow',
      color: '#ef4444',
      description: 'Brute force: slide a window across every position and scale, classify each patch.',
      icon: '🔍',
    },
    {
      name: 'R-CNN',
      year: '2014',
      speed: 'Slow',
      color: '#f59e0b',
      description: 'Selective Search proposes ~2000 regions, then a CNN classifies each one separately.',
      icon: '🧩',
    },
    {
      name: 'Fast R-CNN',
      year: '2015',
      speed: 'Medium',
      color: '#3b82f6',
      description: 'Run CNN once on full image, then classify each region from shared feature maps.',
      icon: '🚀',
    },
    {
      name: 'Faster R-CNN',
      year: '2016',
      speed: 'Fast',
      color: '#8b5cf6',
      description: 'Replace Selective Search with a learned Region Proposal Network (RPN) inside the CNN.',
      icon: '🧠',
    },
    {
      name: 'YOLO',
      year: '2016+',
      speed: 'Real-Time',
      color: '#10b981',
      description: 'One shot: divide image into grid, predict all boxes and classes in a single forward pass.',
      icon: '🎯',
    },
  ]

  const era = eras[activeEra]

  // Steel surface grid for visualization
  const steelW = 320
  const steelH = 200

  return (
    <div>
      {/* Timeline bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: 24, right: 24,
          height: 4, background: 'var(--border)', borderRadius: 2, transform: 'translateY(-50%)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: 24,
          height: 4, borderRadius: 2, transform: 'translateY(-50%)',
          background: 'var(--gradient-primary)',
          width: `${(activeEra / (eras.length - 1)) * (100 - 15)}%`,
          transition: 'width 0.5s ease',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 1 }}>
          {eras.map((e, i) => (
            <motion.button
              key={e.name}
              onClick={() => setActiveEra(i)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <motion.div
                animate={{
                  background: i <= activeEra ? e.color : 'var(--bg-secondary)',
                  scale: i === activeEra ? 1.2 : 1,
                  boxShadow: i === activeEra ? `0 0 20px ${e.color}55` : '0 0 0 transparent',
                }}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, border: `2px solid ${i <= activeEra ? e.color : 'var(--border)'}`,
                }}
              >
                {e.icon}
              </motion.div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: i === activeEra ? e.color : 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
              }}>
                {e.name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{e.year}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Visualization area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeEra}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap',
          }}
        >
          {/* Steel surface visualization */}
          <div style={{
            flex: '1 1 320px', background: '#1a1a2e', borderRadius: 16,
            overflow: 'hidden', border: '2px solid var(--border)',
          }}>
            <div style={{
              padding: '10px 16px', background: `${era.color}15`,
              borderBottom: `1px solid ${era.color}30`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: era.color }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: era.color }}>{era.name} Detection</span>
            </div>
            <svg width={steelW} height={steelH} viewBox={`0 0 ${steelW} ${steelH}`}
              style={{ display: 'block', width: '100%', height: 'auto' }}>
              {/* Steel background texture */}
              <defs>
                <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4a5568" />
                  <stop offset="50%" stopColor="#718096" />
                  <stop offset="100%" stopColor="#4a5568" />
                </linearGradient>
              </defs>
              <rect width={steelW} height={steelH} fill="url(#steel)" />
              {/* Simulated defects */}
              <ellipse cx={90} cy={70} rx={35} ry={8} fill="#2d3748" opacity={0.7} />
              <circle cx={220} cy={120} r={14} fill="#2d3748" opacity={0.6} />
              <rect x={160} y={40} width={4} height={40} fill="#2d3748" opacity={0.5} rx={2} />

              {/* Sliding Window animation */}
              {activeEra === 0 && Array.from({ length: 6 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => (
                  <motion.rect
                    key={`sw-${row}-${col}`}
                    x={col * 40}
                    y={row * 34}
                    width={40}
                    height={34}
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      delay: (row * 8 + col) * 0.15,
                      duration: 0.4,
                      repeat: Infinity,
                      repeatDelay: (6 * 8) * 0.15,
                    }}
                  />
                ))
              )}

              {/* R-CNN: region proposals */}
              {activeEra === 1 && [
                { x: 52, y: 56, w: 80, h: 30 },
                { x: 200, y: 100, w: 44, h: 44 },
                { x: 155, y: 32, w: 18, h: 56 },
                { x: 20, y: 20, w: 60, h: 50 },
                { x: 130, y: 90, w: 70, h: 40 },
                { x: 240, y: 30, w: 50, h: 50 },
                { x: 70, y: 120, w: 90, h: 35 },
              ].map((r, i) => (
                <motion.rect
                  key={`rcnn-${i}`}
                  x={r.x} y={r.y} width={r.w} height={r.h}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
                  transition={{ delay: i * 0.4, duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
              ))}

              {/* Fast R-CNN: shared features then classify */}
              {activeEra === 2 && (
                <>
                  <motion.rect
                    width={steelW} height={steelH}
                    fill="transparent" stroke="#3b82f6" strokeWidth={3}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {[
                    { x: 52, y: 56, w: 80, h: 30 },
                    { x: 200, y: 100, w: 44, h: 44 },
                    { x: 155, y: 32, w: 18, h: 56 },
                  ].map((r, i) => (
                    <motion.rect
                      key={`frcnn-${i}`}
                      x={r.x} y={r.y} width={r.w} height={r.h}
                      fill={`#3b82f620`}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 + i * 0.3 }}
                    />
                  ))}
                </>
              )}

              {/* Faster R-CNN: RPN proposals */}
              {activeEra === 3 && (
                <>
                  {/* Anchor grid points */}
                  {Array.from({ length: 4 }).map((_, row) =>
                    Array.from({ length: 5 }).map((_, col) => (
                      <motion.circle
                        key={`anchor-${row}-${col}`}
                        cx={32 + col * 68}
                        cy={25 + row * 50}
                        r={3}
                        fill="#8b5cf6"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        transition={{ delay: (row * 5 + col) * 0.06, duration: 0.5 }}
                      />
                    ))
                  )}
                  {[
                    { x: 52, y: 56, w: 80, h: 30 },
                    { x: 200, y: 100, w: 44, h: 44 },
                    { x: 155, y: 32, w: 18, h: 56 },
                  ].map((r, i) => (
                    <motion.rect
                      key={`frrcnn-${i}`}
                      x={r.x} y={r.y} width={r.w} height={r.h}
                      fill={`#8b5cf620`}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.2 + i * 0.3, type: 'spring' }}
                    />
                  ))}
                </>
              )}

              {/* YOLO: grid-based detection */}
              {activeEra === 4 && (
                <>
                  {Array.from({ length: 7 }).map((_, row) =>
                    Array.from({ length: 7 }).map((_, col) => (
                      <motion.rect
                        key={`yolo-${row}-${col}`}
                        x={col * (steelW / 7)}
                        y={row * (steelH / 7)}
                        width={steelW / 7}
                        height={steelH / 7}
                        fill="transparent"
                        stroke="#10b98140"
                        strokeWidth={0.5}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.02 * (row * 7 + col) }}
                      />
                    ))
                  )}
                  {[
                    { x: 52, y: 56, w: 80, h: 30, conf: 0.94 },
                    { x: 200, y: 100, w: 44, h: 44, conf: 0.87 },
                    { x: 155, y: 32, w: 18, h: 56, conf: 0.91 },
                  ].map((r, i) => (
                    <motion.g key={`yolob-${i}`}>
                      <motion.rect
                        x={r.x} y={r.y} width={r.w} height={r.h}
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth={2}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.3, type: 'spring' }}
                      />
                      <motion.text
                        x={r.x + 2} y={r.y - 4}
                        fill="#10b981" fontSize={10} fontWeight={700} fontFamily="monospace"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        {r.conf}
                      </motion.text>
                    </motion.g>
                  ))}
                </>
              )}
            </svg>
          </div>

          {/* Info card */}
          <div style={{ flex: '1 1 240px', minWidth: 200 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'var(--bg-card)', borderRadius: 16,
                border: `2px solid ${era.color}30`, padding: 24,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
              }}>
                <span style={{ fontSize: 28 }}>{era.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
                    {era.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{era.year}</div>
                </div>
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                {era.description}
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 10,
                background: `${era.color}12`, border: `1px solid ${era.color}30`,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: era.color }}>Speed:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: era.color }}>{era.speed}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 2: YOLO Grid Demo ---- */
function YOLOGridDemo() {
  const [selectedCell, setSelectedCell] = useState(null)
  const [showBoxes, setShowBoxes] = useState(false)

  const gridSize = 7
  const svgW = 350
  const svgH = 350
  const cellW = svgW / gridSize
  const cellH = svgH / gridSize

  // Simulated defects on steel with their grid cell assignments
  const defects = [
    { cx: 120, cy: 85, w: 90, h: 22, label: 'Scratch', conf: 0.94, color: '#ef4444', gridR: 1, gridC: 2 },
    { cx: 250, cy: 210, w: 40, h: 40, label: 'Pit', conf: 0.88, color: '#f59e0b', gridR: 4, gridC: 5 },
    { cx: 170, cy: 280, w: 14, h: 70, label: 'Crack', conf: 0.91, color: '#8b5cf6', gridR: 5, gridC: 3 },
    { cx: 60, cy: 300, w: 50, h: 20, label: 'Scratch', conf: 0.79, color: '#ef4444', gridR: 6, gridC: 1 },
  ]

  const getCellInfo = (r, c) => {
    const match = defects.find(d => d.gridR === r && d.gridC === c)
    return match || null
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Grid visualization */}
        <div style={{ flex: '1 1 350px' }}>
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ display: 'block', width: '100%', maxWidth: 400, borderRadius: 12, overflow: 'hidden' }}>
            {/* Steel texture background */}
            <defs>
              <linearGradient id="steelBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4a5568" />
                <stop offset="40%" stopColor="#718096" />
                <stop offset="100%" stopColor="#4a5568" />
              </linearGradient>
            </defs>
            <rect width={svgW} height={svgH} fill="url(#steelBg)" />

            {/* Simulated defects on steel (as dark marks) */}
            <ellipse cx={120} cy={85} rx={45} ry={8} fill="#2d3748" opacity={0.7} />
            <circle cx={250} cy={210} r={16} fill="#2d3748" opacity={0.6} />
            <rect x={163} y={245} width={6} height={70} fill="#2d3748" opacity={0.5} rx={3} />
            <ellipse cx={60} cy={300} rx={25} ry={6} fill="#2d3748" opacity={0.6} />

            {/* Grid lines */}
            {Array.from({ length: gridSize }).map((_, r) =>
              Array.from({ length: gridSize }).map((_, c) => {
                const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c
                const hasDefect = getCellInfo(r, c)
                return (
                  <motion.rect
                    key={`cell-${r}-${c}`}
                    x={c * cellW} y={r * cellH}
                    width={cellW} height={cellH}
                    fill={isSelected ? '#3b82f630' : hasDefect ? `${hasDefect.color}15` : 'transparent'}
                    stroke={isSelected ? '#3b82f6' : '#ffffff30'}
                    strokeWidth={isSelected ? 2 : 0.5}
                    style={{ cursor: 'pointer' }}
                    whileHover={{ fill: '#3b82f618' }}
                    onClick={() => setSelectedCell({ r, c })}
                  />
                )
              })
            )}

            {/* Bounding boxes */}
            {showBoxes && defects.map((d, i) => (
              <motion.g key={`defect-${i}`}>
                <motion.rect
                  x={d.cx - d.w / 2} y={d.cy - d.h / 2}
                  width={d.w} height={d.h}
                  fill="transparent"
                  stroke={d.color}
                  strokeWidth={2.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.2, type: 'spring', stiffness: 200 }}
                />
                <motion.rect
                  x={d.cx - d.w / 2} y={d.cy - d.h / 2 - 18}
                  width={80} height={16} rx={3}
                  fill={d.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ delay: i * 0.2 + 0.2 }}
                />
                <motion.text
                  x={d.cx - d.w / 2 + 4} y={d.cy - d.h / 2 - 6}
                  fill="white" fontSize={10} fontWeight={700} fontFamily="monospace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 + 0.2 }}
                >
                  {d.label} {d.conf}
                </motion.text>
                {/* Center point */}
                <motion.circle
                  cx={d.cx} cy={d.cy} r={4}
                  fill={d.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ delay: i * 0.2 + 0.1 }}
                />
              </motion.g>
            ))}
          </svg>

          <motion.button
            onClick={() => setShowBoxes(!showBoxes)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'block', margin: '16px auto 0', padding: '12px 28px',
              background: showBoxes ? '#10b981' : 'var(--accent)',
              color: 'white', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {showBoxes ? 'Hide Predictions' : 'Run YOLO Detection'}
          </motion.button>
        </div>

        {/* Cell info panel */}
        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          <AnimatePresence mode="wait">
            {selectedCell ? (
              <motion.div
                key={`${selectedCell.r}-${selectedCell.c}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  background: 'var(--bg-card)', borderRadius: 16,
                  border: '1px solid var(--border)', padding: 24,
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18,
                  color: 'var(--text-primary)', marginBottom: 16,
                }}>
                  Grid Cell [{selectedCell.r}, {selectedCell.c}]
                </div>
                {(() => {
                  const info = getCellInfo(selectedCell.r, selectedCell.c)
                  if (info) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{
                          padding: '10px 16px', borderRadius: 10,
                          background: `${info.color}12`, border: `1px solid ${info.color}30`,
                        }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Class</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: info.color }}>{info.label}</div>
                        </div>
                        <div style={{
                          padding: '10px 16px', borderRadius: 10,
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Confidence</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              flex: 1, height: 8, borderRadius: 4, background: 'var(--border)',
                              overflow: 'hidden',
                            }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${info.conf * 100}%` }}
                                style={{ height: '100%', borderRadius: 4, background: info.color }}
                              />
                            </div>
                            <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: info.color }}>
                              {info.conf}
                            </span>
                          </div>
                        </div>
                        <div style={{
                          padding: '10px 16px', borderRadius: 10,
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>BBox (x, y, w, h)</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)' }}>
                            ({info.cx}, {info.cy}, {info.w}, {info.h})
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div style={{
                      padding: '20px 16px', borderRadius: 10,
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>-</div>
                      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                        No object center falls in this cell. This cell predicts: <strong>background</strong>.
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'var(--bg-card)', borderRadius: 16,
                  border: '2px dashed var(--border)', padding: 32,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>👆</div>
                <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Click any grid cell to see what YOLO predicts for that cell
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ---- Section 3: Anchor Boxes ---- */
function AnchorBoxes() {
  const [selectedAnchor, setSelectedAnchor] = useState(0)
  const [selectedDefect, setSelectedDefect] = useState(0)

  const anchors = [
    { label: 'Wide', w: 120, h: 30, color: '#ef4444', useCase: 'Best for scratches' },
    { label: 'Tall', w: 30, h: 120, color: '#3b82f6', useCase: 'Best for cracks' },
    { label: 'Square', w: 60, h: 60, color: '#10b981', useCase: 'Best for pits/dents' },
    { label: 'Medium Wide', w: 90, h: 50, color: '#f59e0b', useCase: 'Best for patches' },
    { label: 'Small Square', w: 35, h: 35, color: '#8b5cf6', useCase: 'Best for small pits' },
  ]

  const defects = [
    { label: 'Long Scratch', shape: 'wide', w: 110, h: 20, bestAnchor: 0 },
    { label: 'Vertical Crack', shape: 'tall', w: 18, h: 100, bestAnchor: 1 },
    { label: 'Round Pit', shape: 'square', w: 50, h: 50, bestAnchor: 2 },
    { label: 'Surface Patch', shape: 'medium', w: 80, h: 45, bestAnchor: 3 },
  ]

  const defect = defects[selectedDefect]
  const svgW = 300
  const svgH = 220
  const cx = svgW / 2
  const cy = svgH / 2

  // Calculate IoU for visual indication
  const calcIoU = (anchor) => {
    const interW = Math.min(anchor.w, defect.w)
    const interH = Math.min(anchor.h, defect.h)
    const inter = interW * interH
    const union = anchor.w * anchor.h + defect.w * defect.h - inter
    return (inter / union).toFixed(2)
  }

  return (
    <div>
      {/* Defect selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {defects.map((d, i) => (
          <motion.button
            key={d.label}
            onClick={() => { setSelectedDefect(i); setSelectedAnchor(d.bestAnchor) }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: i === selectedDefect ? 'var(--accent)' : 'var(--bg-card)',
              color: i === selectedDefect ? 'white' : 'var(--text-primary)',
              border: `1px solid ${i === selectedDefect ? 'var(--accent)' : 'var(--border)'}`,
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            {d.label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* SVG visualization */}
        <div style={{ flex: '1 1 300px' }}>
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ display: 'block', width: '100%', maxWidth: 400, background: '#1a1a2e', borderRadius: 12 }}>
            {/* Defect shape (dark) */}
            <rect
              x={cx - defect.w / 2} y={cy - defect.h / 2}
              width={defect.w} height={defect.h}
              fill="#2d374880" stroke="#ffffff40" strokeWidth={1} rx={3}
            />
            <text x={cx} y={cy + 4} fill="#ffffff80" fontSize={11} textAnchor="middle" fontWeight={600}>
              Defect
            </text>

            {/* Anchor boxes */}
            {anchors.map((a, i) => (
              <motion.rect
                key={a.label}
                x={cx - a.w / 2}
                y={cy - a.h / 2}
                width={a.w}
                height={a.h}
                fill="transparent"
                stroke={a.color}
                strokeWidth={i === selectedAnchor ? 3 : 1}
                strokeDasharray={i === selectedAnchor ? 'none' : '6 3'}
                opacity={i === selectedAnchor ? 1 : 0.3}
                rx={2}
                animate={{
                  opacity: i === selectedAnchor ? 1 : 0.25,
                  strokeWidth: i === selectedAnchor ? 3 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedAnchor(i)}
              />
            ))}

            {/* Center point */}
            <circle cx={cx} cy={cy} r={5} fill="white" opacity={0.8} />
          </svg>
        </div>

        {/* Anchor selector list */}
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {anchors.map((a, i) => {
            const iou = calcIoU(a)
            const isBest = i === defect.bestAnchor
            return (
              <motion.button
                key={a.label}
                onClick={() => setSelectedAnchor(i)}
                whileHover={{ scale: 1.02 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12,
                  background: i === selectedAnchor ? `${a.color}12` : 'var(--bg-card)',
                  border: `2px solid ${i === selectedAnchor ? a.color : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: `${a.color}20`, border: `2px solid ${a.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: a.color,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {a.label} ({a.w}x{a.h})
                    {isBest && <span style={{ marginLeft: 8, fontSize: 11, color: '#10b981' }}>BEST FIT</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    IoU: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: parseFloat(iou) > 0.5 ? '#10b981' : '#ef4444' }}>{iou}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---- Section 4: Non-Maximum Suppression ---- */
function NMS() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const initialBoxes = [
    { id: 1, x: 80, y: 60, w: 100, h: 35, conf: 0.95, color: '#10b981', kept: true },
    { id: 2, x: 75, y: 55, w: 110, h: 40, conf: 0.82, color: '#3b82f6', kept: false },
    { id: 3, x: 90, y: 65, w: 90, h: 30, conf: 0.78, color: '#8b5cf6', kept: false },
    { id: 4, x: 70, y: 50, w: 120, h: 45, conf: 0.65, color: '#f59e0b', kept: false },
    { id: 5, x: 85, y: 58, w: 105, h: 38, conf: 0.45, color: '#ef4444', kept: false },
  ]

  const nmsSteps = [
    { title: 'All Predictions', desc: 'Multiple overlapping boxes detected around one defect', removed: [], highlight: null },
    { title: 'Sort by Confidence', desc: 'Sort all boxes by confidence: 0.95 > 0.82 > 0.78 > 0.65 > 0.45', removed: [], highlight: 0 },
    { title: 'Keep Best (0.95)', desc: 'Keep the highest confidence box. Compare all others to it.', removed: [], highlight: 0 },
    { title: 'Remove IoU > 0.5', desc: 'Box #2 (0.82): IoU with #1 = 0.72 > 0.5 threshold. REMOVE.', removed: [1], highlight: 1 },
    { title: 'Remove IoU > 0.5', desc: 'Box #3 (0.78): IoU with #1 = 0.68 > 0.5 threshold. REMOVE.', removed: [1, 2], highlight: 2 },
    { title: 'Remove IoU > 0.5', desc: 'Box #4 (0.65): IoU with #1 = 0.55 > 0.5 threshold. REMOVE.', removed: [1, 2, 3], highlight: 3 },
    { title: 'Remove IoU > 0.5', desc: 'Box #5 (0.45): IoU with #1 = 0.63 > 0.5 threshold. REMOVE.', removed: [1, 2, 3, 4], highlight: 4 },
    { title: 'NMS Complete!', desc: 'Only the best box remains. One clean prediction per defect.', removed: [1, 2, 3, 4], highlight: null },
  ]

  const currentStep = nmsSteps[step]

  const playNMS = () => {
    setStep(0)
    setIsPlaying(true)
    let s = 0
    const interval = setInterval(() => {
      s++
      if (s >= nmsSteps.length) {
        clearInterval(interval)
        setIsPlaying(false)
        return
      }
      setStep(s)
    }, 1200)
  }

  const svgW = 360
  const svgH = 200

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <motion.button
          onClick={playNMS}
          disabled={isPlaying}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '12px 28px', borderRadius: 10,
            background: isPlaying ? 'var(--text-muted)' : 'var(--accent)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {isPlaying ? 'Running NMS...' : 'Play NMS Animation'}
        </motion.button>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 4 }}>
          {nmsSteps.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setStep(i); setIsPlaying(false) }}
              animate={{
                width: i === step ? 24 : 8,
                background: i === step ? 'var(--accent)' : i < step ? '#10b981' : 'var(--border)',
              }}
              style={{
                height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Step info */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 20,
          background: step === nmsSteps.length - 1 ? '#10b98115' : 'var(--bg-secondary)',
          border: `1px solid ${step === nmsSteps.length - 1 ? '#10b98140' : 'var(--border)'}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
          Step {step + 1}: {currentStep.title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{currentStep.desc}</div>
      </motion.div>

      {/* Visualization */}
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', width: '100%', maxWidth: 450, background: '#1a1a2e', borderRadius: 12, margin: '0 auto' }}>
        <defs>
          <linearGradient id="steelNms" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="50%" stopColor="#718096" />
            <stop offset="100%" stopColor="#4a5568" />
          </linearGradient>
        </defs>
        <rect width={svgW} height={svgH} fill="url(#steelNms)" />
        {/* Defect mark */}
        <ellipse cx={130} cy={80} rx={40} ry={12} fill="#2d3748" opacity={0.7} />

        {initialBoxes.map((box, i) => {
          const isRemoved = currentStep.removed.includes(i)
          const isHighlighted = currentStep.highlight === i

          return (
            <motion.g key={box.id}>
              <motion.rect
                x={box.x} y={box.y} width={box.w} height={box.h}
                fill="transparent"
                stroke={box.color}
                strokeWidth={isHighlighted ? 3 : 2}
                rx={2}
                animate={{
                  opacity: isRemoved ? 0.1 : 1,
                  strokeDasharray: isRemoved ? '4 4' : 'none',
                }}
                transition={{ duration: 0.5 }}
              />
              {/* Confidence label */}
              <motion.g
                animate={{ opacity: isRemoved ? 0.15 : 1 }}
                transition={{ duration: 0.5 }}
              >
                <rect
                  x={box.x} y={box.y - 16}
                  width={40} height={14} rx={3}
                  fill={box.color}
                  opacity={0.85}
                />
                <text
                  x={box.x + 4} y={box.y - 5}
                  fill="white" fontSize={10} fontWeight={700} fontFamily="monospace"
                >
                  {box.conf}
                </text>
              </motion.g>

              {/* Red X for removed */}
              {isRemoved && (
                <motion.text
                  x={box.x + box.w / 2}
                  y={box.y + box.h / 2 + 6}
                  textAnchor="middle"
                  fill="#ef4444"
                  fontSize={24}
                  fontWeight={900}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  X
                </motion.text>
              )}
            </motion.g>
          )
        })}
      </svg>

      {/* IoU explanation */}
      <div style={{
        marginTop: 20, padding: '16px 20px', borderRadius: 12,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          IoU (Intersection over Union) — How NMS decides
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <svg width={100} height={80} viewBox="0 0 100 80">
            <rect x={10} y={10} width={50} height={40} fill="#3b82f630" stroke="#3b82f6" strokeWidth={2} rx={3} />
            <rect x={35} y={25} width={50} height={40} fill="#10b98130" stroke="#10b981" strokeWidth={2} rx={3} />
            <rect x={35} y={25} width={25} height={25} fill="#f59e0b60" stroke="#f59e0b" strokeWidth={1} rx={2} />
          </svg>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            IoU = <span style={{ color: '#f59e0b', fontWeight: 700 }}>Intersection</span> / <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Union</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            If IoU &gt; threshold (0.5), boxes are &quot;too overlapping&quot; — remove the lower-confidence one.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Section 5: Speed vs Accuracy ---- */
function SpeedVsAccuracy() {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const variants = [
    { name: 'YOLOv8-nano', fps: 450, map: 37.3, color: '#10b981', useCase: 'Edge devices, Raspberry Pi, drones', icon: '📱', size: '3.2M params' },
    { name: 'YOLOv8-small', fps: 320, map: 44.9, color: '#06b6d4', useCase: 'Mobile apps, real-time inspection', icon: '📲', size: '11.2M params' },
    { name: 'YOLOv8-medium', fps: 180, map: 50.2, color: '#3b82f6', useCase: 'Server-side processing, factory PCs', icon: '🖥️', size: '25.9M params' },
    { name: 'YOLOv8-large', fps: 100, map: 52.9, color: '#8b5cf6', useCase: 'GPU servers, batch processing', icon: '🔬', size: '43.7M params' },
    { name: 'YOLOv8-xlarge', fps: 60, map: 53.9, color: '#ec4899', useCase: 'Research, maximum accuracy needed', icon: '🧪', size: '68.2M params' },
  ]

  const maxFps = 500
  const maxMap = 60

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {variants.map((v, i) => {
          const isHovered = hoveredIdx === i
          return (
            <motion.div
              key={v.name}
              onHoverStart={() => setHoveredIdx(i)}
              onHoverEnd={() => setHoveredIdx(null)}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: isHovered ? `${v.color}08` : 'var(--bg-card)',
                border: `2px solid ${isHovered ? v.color : 'var(--border)'}`,
                borderRadius: 16, padding: '18px 22px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>{v.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v.size}</div>
                </div>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '6px 14px', borderRadius: 8,
                      background: `${v.color}15`, border: `1px solid ${v.color}30`,
                      fontSize: 12, color: v.color, fontWeight: 600, maxWidth: 200,
                    }}
                  >
                    {v.useCase}
                  </motion.div>
                )}
              </div>

              {/* Speed bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, width: 50, textAlign: 'right' }}>FPS</span>
                <div style={{ flex: 1, height: 14, borderRadius: 7, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(v.fps / maxFps) * 100}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.8, type: 'spring' }}
                    style={{
                      height: '100%', borderRadius: 7,
                      background: `linear-gradient(90deg, ${v.color}80, ${v.color})`,
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: v.color, width: 40 }}>
                  {v.fps}
                </span>
              </div>

              {/* Accuracy bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, width: 50, textAlign: 'right' }}>mAP</span>
                <div style={{ flex: 1, height: 14, borderRadius: 7, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(v.map / maxMap) * 100}%` }}
                    transition={{ delay: i * 0.1 + 0.5, duration: 0.8, type: 'spring' }}
                    style={{
                      height: '100%', borderRadius: 7,
                      background: `linear-gradient(90deg, #f59e0b80, #f59e0b)`,
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', width: 40 }}>
                  {v.map}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Tradeoff summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          marginTop: 24, padding: '20px 24px', borderRadius: 14,
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
          border: '1px solid var(--border)', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          The Golden Rule of Detection
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Faster models = fewer parameters = lower accuracy. Pick the model that matches your deployment speed requirements.
        </div>
      </motion.div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic5() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Neuron mood="excited" typed message="Time to find defects! Object detection is the core of visual inspection — it answers 'WHAT is in this image and WHERE is it?' Let me show you how detection evolved from painfully slow to blazingly fast." />

      <SectionBlock title="Evolution of Object Detection" icon="🕰️">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Click through the timeline to see how each generation improved detection speed:
        </p>
        <HindiExplainer
          concept="ऑब्जेक्ट डिटेक्शन"
          english="Object Detection"
          explanation="ऑब्जेक्ट डिटेक्शन का मतलब है तस्वीर में चीज़ों को ढूँढना और उनके चारों ओर एक बॉक्स बनाना। ये सिर्फ़ बताता नहीं कि 'तस्वीर में खरोंच है', बल्कि ये भी बताता है कि 'खरोंच कहाँ है'।"
          example="जैसे आप 'Where's Waldo?' गेम में भीड़ में Waldo को ढूँढते हैं — Object Detection भी वैसे ही तस्वीर में हर चीज़ ढूँढता है और उस पर निशान लगाता है।"
          terms={[
            { hindi: 'बाउंडिंग बॉक्स', english: 'Bounding Box', meaning: 'किसी चीज़ के चारों ओर बनाया गया चौकोर बॉक्स' },
            { hindi: 'कॉन्फ़िडेंस', english: 'Confidence', meaning: 'मॉडल को कितना भरोसा है — जैसे 95% sure' },
            { hindi: 'क्लास', english: 'Class', meaning: 'वो चीज़ क्या है — जैसे खरोंच, दरार, धब्बा' },
          ]}
        />
        <InteractiveDemo title="Detection Through The Ages">
          <DetectionEvolution />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip>
        YOLO was revolutionary because it reframed detection as a single regression problem. Instead of scanning thousands of regions, it looks at the entire image once and predicts all boxes simultaneously. That is why it stands for <strong>You Only Look Once</strong>.
      </NeuronTip>

      <SectionBlock title="YOLO Grid System" icon="🎯">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          YOLO divides the image into a grid. Each cell is responsible for detecting objects whose center falls within it:
        </p>
        <HindiExplainer
          concept="YOLO — एक नज़र में पहचान"
          english="YOLO — You Only Look Once"
          explanation="YOLO एक बहुत तेज़ Object Detection मॉडल है। पुराने तरीकों में तस्वीर को बार-बार देखना पड़ता था, लेकिन YOLO सिर्फ़ एक बार देखता है और सब कुछ एक साथ पहचान लेता है!"
          example="सोचिए एक अनुभवी QC इंस्पेक्टर जो स्टील शीट पर एक नज़र डालते ही बता देता है — 'यहाँ खरोंच है, वहाँ दरार है, बाक़ी ठीक है।' YOLO भी ऐसे ही एक झलक में सब पहचान लेता है — और वो भी मिलीसेकंड में!"
          terms={[
            { hindi: 'ग्रिड', english: 'Grid', meaning: 'तस्वीर को छोटे-छोटे खानों में बाँटना' },
            { hindi: 'रियल-टाइम', english: 'Real-Time', meaning: 'तुरंत — बिना देरी के, हर सेकंड 30+ तस्वीरें' },
            { hindi: 'एंकर बॉक्स', english: 'Anchor Box', meaning: 'पहले से तय बॉक्स आकार जो YOLO शुरुआत में इस्तेमाल करता है' },
          ]}
        />
        <InteractiveDemo title="YOLO Grid Explorer" instruction="Click any grid cell to see its prediction. Hit 'Run YOLO' to see bounding boxes.">
          <YOLOGridDemo />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Anchor Boxes" icon="📐">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Different defects have different shapes. Anchor boxes are predefined templates that help YOLO predict the right bounding box shape:
        </p>
        <InteractiveDemo title="Anchor Box Matcher" instruction="Select a defect type, then click anchors to compare IoU scores.">
          <AnchorBoxes />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="deep">
        During training, YOLO learns to adjust anchor boxes to better fit real objects. The anchor is just a starting point — the network predicts offsets (dx, dy, dw, dh) to refine each anchor into the final bounding box.
      </NeuronTip>

      <SectionBlock title="Non-Maximum Suppression (NMS)" icon="🧹">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          YOLO often predicts multiple boxes for the same object. NMS cleans up by keeping only the best one:
        </p>
        <HindiExplainer
          concept="NMS — डुप्लीकेट बॉक्स हटाना"
          english="Non-Maximum Suppression"
          explanation="YOLO कभी-कभी एक ही चीज़ पर कई बॉक्स बना देता है। NMS सबसे अच्छे बॉक्स को रखता है और बाक़ी डुप्लीकेट बॉक्स हटा देता है।"
          example="जैसे 5 लोग एक ही सवाल का जवाब दें — सबसे confident जवाब रखो, बाक़ी हटाओ। NMS भी सबसे ज़्यादा confident बॉक्स रखता है।"
          terms={[
            { hindi: 'IoU', english: 'Intersection over Union', meaning: 'दो बॉक्स कितना ओवरलैप करते हैं — 0 से 1' },
            { hindi: 'थ्रेशोल्ड', english: 'Threshold', meaning: 'सीमा — इससे कम confident बॉक्स हटा दो' },
          ]}
        />
        <InteractiveDemo title="NMS Step-by-Step">
          <NMS />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Speed vs Accuracy Tradeoff" icon="🏎️">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          YOLO comes in multiple sizes. Hover over each variant to see its ideal use case:
        </p>
        <InteractiveDemo title="YOLO Model Comparison">
          <SpeedVsAccuracy />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="happy" typed message="Now you understand how YOLO detects defects in real-time! But to train it, we need labeled data. In the next topic, we will learn how to create annotations — the human step that teaches the machine what to look for." />
    </div>
  )
}
