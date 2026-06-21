import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 4 — Convolutional Neural Networks
   Filters, feature maps, pooling, and full architecture
================================================================ */

const C = {
  blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981',
  orange: '#f59e0b', pink: '#ec4899', red: '#ef4444',
  cyan: '#06b6d4', indigo: '#6366f1',
}

/* ---- Preset filter kernels ---- */
const FILTERS = {
  'Edge (Horizontal)': { kernel: [[-1,-1,-1],[0,0,0],[1,1,1]], color: C.blue },
  'Edge (Vertical)': { kernel: [[-1,0,1],[-1,0,1],[-1,0,1]], color: C.purple },
  'Sharpen': { kernel: [[0,-1,0],[-1,5,-1],[0,-1,0]], color: C.orange },
  'Blur': { kernel: [[1,1,1],[1,1,1],[1,1,1]], color: C.cyan, divisor: 9 },
  'Emboss': { kernel: [[-2,-1,0],[-1,1,1],[0,1,2]], color: C.pink },
  'Sobel': { kernel: [[-1,0,1],[-2,0,2],[-1,0,1]], color: C.green },
}

/* ---- Simulated steel surface 7x7 with a scratch ---- */
const STEEL_7x7 = [
  [140, 138, 142, 145, 140, 137, 141],
  [135, 142, 139, 143, 141, 138, 140],
  [138, 60,  55,  50,  58,  62,  139],
  [141, 55,  48,  45,  52,  57,  142],
  [139, 140, 137, 142, 140, 135, 138],
  [142, 138, 141, 139, 143, 140, 136],
  [137, 141, 140, 138, 142, 139, 141],
]

/* Apply convolution at a specific position */
function convolveAt(grid, kernel, row, col, divisor = 1) {
  let sum = 0
  for (let kr = 0; kr < 3; kr++) {
    for (let kc = 0; kc < 3; kc++) {
      sum += grid[row + kr][col + kc] * kernel[kr][kc]
    }
  }
  return Math.round(sum / divisor)
}

/* Full convolution output */
function fullConvolve(grid, kernel, divisor = 1) {
  const outRows = grid.length - 2
  const outCols = grid[0].length - 2
  const output = []
  for (let r = 0; r < outRows; r++) {
    const row = []
    for (let c = 0; c < outCols; c++) {
      row.push(convolveAt(grid, kernel, r, c, divisor))
    }
    output.push(row)
  }
  return output
}

/* ---- 1. ConvolutionDemo — THE KEY VISUAL ---- */
function ConvolutionDemo() {
  const [filterName, setFilterName] = useState('Edge (Horizontal)')
  const [filterPos, setFilterPos] = useState({ r: 0, c: 0 })
  const [autoPlay, setAutoPlay] = useState(false)

  const filter = FILTERS[filterName]
  const kernel = filter.kernel
  const divisor = filter.divisor || 1
  const maxR = STEEL_7x7.length - 3
  const maxC = STEEL_7x7[0].length - 3

  /* Compute output for revealed positions */
  const output = fullConvolve(STEEL_7x7, kernel, divisor)
  const revealedIdx = filterPos.r * (maxC + 1) + filterPos.c

  /* Current convolution computation */
  const currentVal = convolveAt(STEEL_7x7, kernel, filterPos.r, filterPos.c, divisor)

  /* Step forward */
  const step = () => {
    setFilterPos(prev => {
      const nextC = prev.c + 1
      if (nextC > maxC) {
        const nextR = prev.r + 1
        if (nextR > maxR) return { r: 0, c: 0 }
        return { r: nextR, c: 0 }
      }
      return { ...prev, c: nextC }
    })
  }

  /* Auto-play */
  const [tick, setTick] = useState(0)
  if (autoPlay) {
    setTimeout(() => {
      step()
      setTick(t => t + 1)
      const nextC = filterPos.c + 1
      if (nextC > maxC && filterPos.r >= maxR) {
        setAutoPlay(false)
      }
    }, 400)
  }

  /* Color scale for output values */
  const mapOutputColor = (val) => {
    const absVal = Math.abs(val)
    const maxAbs = 400
    const intensity = Math.min(1, absVal / maxAbs)
    if (val >= 0) {
      return `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`
    }
    return `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`
  }

  return (
    <div>
      {/* Filter presets */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: 24,
      }}>
        {Object.keys(FILTERS).map(name => (
          <motion.button
            key={name}
            onClick={() => { setFilterName(name); setFilterPos({ r: 0, c: 0 }); setAutoPlay(false) }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 16px', borderRadius: 10,
              background: filterName === name ? `${FILTERS[name].color}20` : 'var(--bg-secondary)',
              border: `2px solid ${filterName === name ? FILTERS[name].color : 'var(--border)'}`,
              color: filterName === name ? FILTERS[name].color : 'var(--text-muted)',
              fontWeight: 700, fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {name}
          </motion.button>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 20, alignItems: 'start',
      }}>
        {/* Input grid 7x7 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10,
          }}>
            Input (7x7 steel surface)
          </div>
          <div style={{
            display: 'inline-grid', gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2, padding: 8, borderRadius: 14,
            background: 'var(--bg-secondary)', border: '2px solid var(--border)',
          }}>
            {STEEL_7x7.map((row, r) =>
              row.map((val, c) => {
                const inFilter = r >= filterPos.r && r < filterPos.r + 3
                  && c >= filterPos.c && c < filterPos.c + 3
                const kR = r - filterPos.r
                const kC = c - filterPos.c
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    animate={{
                      scale: inFilter ? 1.1 : 1,
                      borderColor: inFilter ? filter.color : 'transparent',
                      boxShadow: inFilter ? `0 0 8px ${filter.color}50` : 'none',
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: 40, height: 40, borderRadius: 6,
                      background: `rgb(${val}, ${val}, ${val})`,
                      border: '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                      color: val > 100 ? '#000000aa' : '#ffffffcc',
                      position: 'relative',
                    }}
                  >
                    {val}
                    {/* Kernel multiplier overlay */}
                    {inFilter && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          background: filter.color, color: 'white',
                          fontSize: 8, fontWeight: 800,
                          padding: '1px 4px', borderRadius: 4,
                          lineHeight: 1.2,
                        }}
                      >
                        x{kernel[kR][kC]}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Center: kernel + computation */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, paddingTop: 30,
        }}>
          {/* 3x3 Kernel */}
          <div style={{
            fontSize: 12, fontWeight: 700, color: filter.color,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            3x3 Kernel
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2, padding: 6, borderRadius: 10,
            background: `${filter.color}15`, border: `2px solid ${filter.color}40`,
          }}>
            {kernel.flat().map((v, i) => (
              <motion.div
                key={i}
                animate={{ background: v === 0 ? 'var(--bg-secondary)' : `${filter.color}25` }}
                style={{
                  width: 36, height: 36, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace', fontWeight: 800, fontSize: 13,
                  color: v === 0 ? 'var(--text-muted)' : filter.color,
                }}
              >
                {v}
              </motion.div>
            ))}
          </div>

          {/* Current sum */}
          <motion.div
            key={`${filterPos.r}-${filterPos.c}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              padding: '10px 16px', borderRadius: 10,
              background: `${filter.color}10`, border: `1.5px solid ${filter.color}30`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
              Output value
            </div>
            <div style={{
              fontFamily: 'monospace', fontWeight: 900, fontSize: 22,
              color: filter.color,
            }}>
              {currentVal}
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontSize: 24, color: filter.color }}
          >
            {'↓'}
          </motion.div>
        </div>

        {/* Output feature map 5x5 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10,
          }}>
            Output Feature Map (5x5)
          </div>
          <div style={{
            display: 'inline-grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 2, padding: 8, borderRadius: 14,
            background: 'var(--bg-secondary)', border: `2px solid ${filter.color}30`,
          }}>
            {output.map((row, r) =>
              row.map((val, c) => {
                const idx = r * (maxC + 1) + c
                const isRevealed = idx <= revealedIdx
                const isCurrent = r === filterPos.r && c === filterPos.c
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    animate={{
                      opacity: isRevealed ? 1 : 0.15,
                      scale: isCurrent ? 1.15 : 1,
                      background: isRevealed ? mapOutputColor(val) : 'var(--bg-card)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: 48, height: 48, borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
                      color: isRevealed ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: isCurrent ? `2px solid ${filter.color}` : '2px solid transparent',
                    }}
                  >
                    {isRevealed ? val : '?'}
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
        <motion.button
          onClick={step}
          disabled={autoPlay}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: autoPlay ? 'var(--bg-secondary)' : `linear-gradient(135deg, ${filter.color}, ${filter.color}cc)`,
            color: autoPlay ? 'var(--text-muted)' : 'white',
            border: 'none', fontWeight: 700, fontSize: 14,
            cursor: autoPlay ? 'default' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Step Forward
        </motion.button>
        <motion.button
          onClick={() => setAutoPlay(!autoPlay)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: autoPlay
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
          }}
        >
          {autoPlay ? 'Pause' : 'Auto Slide'}
        </motion.button>
        <motion.button
          onClick={() => { setFilterPos({ r: 0, c: 0 }); setAutoPlay(false) }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 20px', borderRadius: 12,
            background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', fontWeight: 600,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          Reset
        </motion.button>
      </div>
    </div>
  )
}

/* ---- 2. FilterGallery — 6 filters applied to steel image ---- */
function FilterGallery() {
  const [activeFilter, setActiveFilter] = useState(null)

  const filterList = Object.entries(FILTERS).map(([name, f]) => ({
    name,
    kernel: f.kernel,
    color: f.color,
    divisor: f.divisor || 1,
    output: fullConvolve(STEEL_7x7, f.kernel, f.divisor || 1),
  }))

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 16,
    }}>
      {filterList.map((f, i) => {
        const isActive = activeFilter === i
        return (
          <motion.button
            key={f.name}
            onClick={() => setActiveFilter(isActive ? null : i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: 18, borderRadius: 18, cursor: 'pointer',
              background: isActive ? `${f.color}10` : 'var(--bg-secondary)',
              border: `2px solid ${isActive ? f.color : 'var(--border)'}`,
              textAlign: 'center',
              boxShadow: isActive ? `0 0 24px ${f.color}20` : 'none',
            }}
          >
            {/* Filter name */}
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15,
              color: isActive ? f.color : 'var(--text-primary)', marginBottom: 12,
            }}>
              {f.name}
            </div>

            {/* 3x3 kernel display */}
            <div style={{
              display: 'inline-grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2, padding: 4, borderRadius: 8,
              background: `${f.color}10`, marginBottom: 12,
            }}>
              {f.kernel.flat().map((v, ki) => (
                <div key={ki} style={{
                  width: 28, height: 28, borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
                  color: v === 0 ? 'var(--text-muted)' : f.color,
                  background: v !== 0 ? `${f.color}15` : 'transparent',
                }}>
                  {v}
                </div>
              ))}
            </div>

            {/* Output feature map mini */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    Output Feature Map
                  </div>
                  <div style={{
                    display: 'inline-grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 2, padding: 4, borderRadius: 8,
                    background: 'var(--bg-card)',
                  }}>
                    {f.output.flat().map((val, oi) => {
                      const absVal = Math.abs(val)
                      const maxAbs = 400
                      const intensity = Math.min(1, absVal / maxAbs)
                      return (
                        <motion.div
                          key={oi}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: oi * 0.02 }}
                          style={{
                            width: 30, height: 30, borderRadius: 3,
                            background: val >= 0
                              ? `rgba(16,185,129, ${0.15 + intensity * 0.85})`
                              : `rgba(239,68,68, ${0.15 + intensity * 0.85})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'monospace', fontSize: 8, fontWeight: 700,
                            color: intensity > 0.5 ? 'white' : 'var(--text-muted)',
                          }}
                        >
                          {val}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ---- 3. FeatureMapStack — layers detecting increasingly complex patterns ---- */
function FeatureMapStack() {
  const [activeLayer, setActiveLayer] = useState(null)

  const layers = [
    {
      id: 0, name: 'Conv Layer 1', detects: 'Edges',
      desc: 'The first layer learns to detect simple edges — horizontal, vertical, diagonal lines. These are the most basic building blocks of vision.',
      channels: 16, size: '224x224', color: C.blue,
      features: ['Horizontal edges', 'Vertical edges', 'Diagonal edges', 'Gradient changes'],
    },
    {
      id: 1, name: 'Conv Layer 2', detects: 'Textures',
      desc: 'Layer 2 combines edges into textures — repeated patterns like the brushed finish on steel or the granular surface of metal.',
      channels: 32, size: '112x112', color: C.purple,
      features: ['Stripes', 'Dots', 'Cross-hatching', 'Smooth gradients'],
    },
    {
      id: 2, name: 'Conv Layer 3', detects: 'Patterns',
      desc: 'Layer 3 recognizes higher-level patterns — scratch patterns, corrosion textures, surface irregularities that could indicate defects.',
      channels: 64, size: '56x56', color: C.orange,
      features: ['Scratch lines', 'Pitting marks', 'Rust patches', 'Weld seams'],
    },
    {
      id: 3, name: 'Conv Layer 4', detects: 'Objects',
      desc: 'The deepest layers see the full picture — they can recognize complete defect types and distinguish normal from defective regions.',
      channels: 128, size: '28x28', color: C.green,
      features: ['Crack defects', 'Inclusion defects', 'Surface defects', 'Normal surface'],
    },
  ]

  return (
    <div>
      {/* Animated stack */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, marginBottom: 28, flexWrap: 'wrap',
      }}>
        {layers.map((layer, i) => (
          <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.button
              onClick={() => setActiveLayer(activeLayer === i ? null : i)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              style={{
                cursor: 'pointer', padding: 16, borderRadius: 16,
                background: activeLayer === i ? `${layer.color}15` : 'var(--bg-secondary)',
                border: `2px solid ${activeLayer === i ? layer.color : 'var(--border)'}`,
                textAlign: 'center', minWidth: 110,
                boxShadow: activeLayer === i ? `0 0 20px ${layer.color}25` : 'none',
              }}
            >
              {/* Stack of feature map squares */}
              <div style={{
                position: 'relative', height: 60 + i * 10, width: 50 + i * 5,
                margin: '0 auto 8px',
              }}>
                {Array(Math.min(4, Math.ceil(layer.channels / 8))).fill(0).map((_, s) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1 - s * 0.15, y: 0 }}
                    transition={{ delay: i * 0.15 + s * 0.05 }}
                    style={{
                      position: 'absolute',
                      top: s * 6, left: s * 4,
                      width: 44 - i * 3, height: 44 - i * 3,
                      borderRadius: 6,
                      background: `${layer.color}${30 - s * 5}`,
                      border: `1.5px solid ${layer.color}40`,
                    }}
                  />
                ))}
              </div>
              <div style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 11,
                color: activeLayer === i ? layer.color : 'var(--text-primary)',
              }}>
                {layer.detects}
              </div>
              <div style={{
                fontSize: 10, color: 'var(--text-muted)', marginTop: 2,
                fontFamily: 'monospace',
              }}>
                {layer.size} x {layer.channels}
              </div>
            </motion.button>

            {i < layers.length - 1 && (
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                style={{ fontSize: 20, color: 'var(--text-muted)' }}
              >
                {'→'}
              </motion.span>
            )}
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {activeLayer !== null && (
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            style={{
              padding: '24px 28px', borderRadius: 18,
              background: `${layers[activeLayer].color}08`,
              border: `2px solid ${layers[activeLayer].color}25`,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${layers[activeLayer].color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontWeight: 900,
                fontSize: 18, color: layers[activeLayer].color,
              }}>
                L{activeLayer + 1}
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20,
                  color: layers[activeLayer].color,
                }}>
                  {layers[activeLayer].name} — {layers[activeLayer].detects}
                </div>
                <div style={{
                  fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace',
                }}>
                  {layers[activeLayer].size} resolution, {layers[activeLayer].channels} channels
                </div>
              </div>
            </div>

            <div style={{
              fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16,
            }}>
              {layers[activeLayer].desc}
            </div>

            {/* Feature examples */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {layers[activeLayer].features.map((feat, fi) => (
                <motion.span
                  key={feat}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: fi * 0.08 }}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: `${layers[activeLayer].color}15`,
                    border: `1px solid ${layers[activeLayer].color}30`,
                    fontSize: 13, fontWeight: 600,
                    color: layers[activeLayer].color,
                  }}
                >
                  {feat}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeLayer === null && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', fontWeight: 500,
          }}
        >
          Click a layer to explore what it detects
        </motion.p>
      )}
    </div>
  )
}

/* ---- 4. PoolingVisual — Max pooling vs Average pooling ---- */
function PoolingVisual() {
  const [poolType, setPoolType] = useState('max')
  const [step, setStep] = useState(-1)

  const grid4x4 = [
    [1, 3, 2, 8],
    [5, 6, 9, 4],
    [7, 2, 1, 3],
    [4, 8, 5, 6],
  ]

  /* Quadrants for 2x2 pooling */
  const quadrants = [
    { r: 0, c: 0, cells: [[0,0],[0,1],[1,0],[1,1]], label: 'Q1' },
    { r: 0, c: 1, cells: [[0,2],[0,3],[1,2],[1,3]], label: 'Q2' },
    { r: 1, c: 0, cells: [[2,0],[2,1],[3,0],[3,1]], label: 'Q3' },
    { r: 1, c: 1, cells: [[2,2],[2,3],[3,2],[3,3]], label: 'Q4' },
  ]

  const poolResults = quadrants.map(q => {
    const values = q.cells.map(([r, c]) => grid4x4[r][c])
    return {
      max: Math.max(...values),
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10,
      values,
      maxIdx: values.indexOf(Math.max(...values)),
    }
  })

  const activeQ = step >= 0 && step < 4 ? step : null

  return (
    <div>
      {/* Pool type toggle */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
        {['max', 'average'].map(t => (
          <motion.button
            key={t}
            onClick={() => { setPoolType(t); setStep(-1) }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 24px', borderRadius: 12,
              background: poolType === t ? `linear-gradient(135deg, ${t === 'max' ? C.orange : C.cyan}, ${t === 'max' ? '#ea580c' : '#0891b2'})` : 'var(--bg-secondary)',
              color: poolType === t ? 'white' : 'var(--text-secondary)',
              border: poolType === t ? 'none' : '1px solid var(--border)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t === 'max' ? 'Max Pooling' : 'Average Pooling'}
          </motion.button>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 32, alignItems: 'center',
      }}>
        {/* Input 4x4 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10,
          }}>
            Input 4x4
          </div>
          <div style={{
            display: 'inline-grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 3, padding: 8, borderRadius: 14,
            background: 'var(--bg-secondary)', border: '2px solid var(--border)',
          }}>
            {grid4x4.flat().map((val, i) => {
              const r = Math.floor(i / 4)
              const c = i % 4
              const qIdx = activeQ !== null ? activeQ : -1
              const isInActiveQ = qIdx >= 0 && quadrants[qIdx].cells.some(([qr, qc]) => qr === r && qc === c)
              const isMax = isInActiveQ && poolType === 'max'
                && val === poolResults[qIdx].max
              const poolColor = poolType === 'max' ? C.orange : C.cyan
              return (
                <motion.div
                  key={i}
                  animate={{
                    scale: isInActiveQ ? 1.08 : 1,
                    borderColor: isInActiveQ ? poolColor : 'transparent',
                    background: isMax ? `${poolColor}40` : `${poolColor}${isInActiveQ ? '15' : '00'}`,
                    boxShadow: isMax ? `0 0 12px ${poolColor}50` : 'none',
                  }}
                  style={{
                    width: 52, height: 52, borderRadius: 8,
                    border: '2.5px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace', fontWeight: 800, fontSize: 18,
                    color: isMax ? poolColor : 'var(--text-primary)',
                    background: 'var(--bg-card)',
                  }}
                >
                  {val}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: poolType === 'max' ? C.orange : C.cyan,
            textTransform: 'uppercase',
          }}>
            {poolType === 'max' ? 'Take Max' : 'Take Average'}
          </div>
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontSize: 32, color: poolType === 'max' ? C.orange : C.cyan }}
          >
            {'→'}
          </motion.div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
            2x2 stride 2
          </div>
        </div>

        {/* Output 2x2 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10,
          }}>
            Output 2x2
          </div>
          <div style={{
            display: 'inline-grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 3, padding: 8, borderRadius: 14,
            background: 'var(--bg-secondary)',
            border: `2px solid ${poolType === 'max' ? C.orange : C.cyan}30`,
          }}>
            {poolResults.map((res, i) => {
              const isActive = i === activeQ || step >= 4
              const val = poolType === 'max' ? res.max : res.avg
              const poolColor = poolType === 'max' ? C.orange : C.cyan
              return (
                <motion.div
                  key={`${poolType}-${i}`}
                  animate={{
                    opacity: isActive ? 1 : 0.25,
                    scale: i === activeQ ? 1.12 : 1,
                    background: isActive ? `${poolColor}20` : 'var(--bg-card)',
                    borderColor: i === activeQ ? poolColor : 'transparent',
                  }}
                  style={{
                    width: 64, height: 64, borderRadius: 10,
                    border: '2.5px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace', fontWeight: 900, fontSize: 22,
                    color: isActive ? poolColor : 'var(--text-muted)',
                  }}
                >
                  {isActive ? val : '?'}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
        <motion.button
          onClick={() => setStep(s => Math.min(s + 1, 4))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: `linear-gradient(135deg, ${poolType === 'max' ? C.orange : C.cyan}, ${poolType === 'max' ? '#ea580c' : '#0891b2'})`,
            color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
          }}
        >
          {step < 0 ? 'Start Pooling' : step < 3 ? 'Next Quadrant' : step === 3 ? 'Complete' : 'Done'}
        </motion.button>
        <motion.button
          onClick={() => setStep(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 20px', borderRadius: 12,
            background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', fontWeight: 600,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          Reset
        </motion.button>
      </div>

      {/* Size reduction note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          marginTop: 20, padding: '14px 20px', borderRadius: 12,
          background: `${C.indigo}08`, border: `1.5px solid ${C.indigo}25`,
          textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
        }}
      >
        <strong style={{ color: C.indigo }}>4x4 → 2x2</strong> — Pooling reduces spatial dimensions by half, keeping the most important information.
        This means <strong style={{ color: C.indigo }}>75% fewer parameters</strong> in the next layer, making the network faster and more robust.
      </motion.div>
    </div>
  )
}

/* ---- 5. CNNArchitecture — End-to-end animated diagram ---- */
function CNNArchitecture() {
  const [activeBlock, setActiveBlock] = useState(null)

  const blocks = [
    {
      id: 'input', name: 'Input', dims: '224x224x3',
      icon: '🖼', color: C.blue, w: 70, h: 70,
      desc: 'The raw image enters the network as a 3D tensor — width, height, and 3 color channels (RGB). Each pixel has 3 values.',
    },
    {
      id: 'conv1', name: 'Conv + ReLU', dims: '224x224x64',
      icon: '🔍', color: C.purple, w: 66, h: 66,
      desc: '64 different 3x3 filters scan across the image. Each filter detects a different low-level feature. ReLU zeroes out negative values (max(0, x)).',
    },
    {
      id: 'pool1', name: 'Max Pool', dims: '112x112x64',
      icon: '📉', color: C.orange, w: 56, h: 56,
      desc: '2x2 max pooling halves the spatial dimensions while keeping the 64 feature channels. Reduces computation by 4x.',
    },
    {
      id: 'conv2', name: 'Conv + ReLU', dims: '112x112x128',
      icon: '🔎', color: C.indigo, w: 50, h: 50,
      desc: '128 filters detect higher-level patterns by combining features from the previous layer. The network is building up a richer representation.',
    },
    {
      id: 'pool2', name: 'Max Pool', dims: '56x56x128',
      icon: '📉', color: C.orange, w: 42, h: 42,
      desc: 'Another round of pooling. The feature maps are now small but information-dense. Each value represents a large region of the original image.',
    },
    {
      id: 'flatten', name: 'Flatten', dims: '401408',
      icon: '📏', color: C.cyan, w: 36, h: 60,
      desc: 'The 3D feature maps are unrolled into a single long 1D vector. This bridge connects the spatial conv layers to the fully connected classifier.',
    },
    {
      id: 'dense', name: 'Dense', dims: '256',
      icon: '🧠', color: C.pink, w: 32, h: 48,
      desc: 'A fully connected layer with 256 neurons. Every neuron connects to every value from the flattened features. This is where high-level reasoning happens.',
    },
    {
      id: 'output', name: 'Output', dims: '4 classes',
      icon: '🎯', color: C.green, w: 28, h: 40,
      desc: 'The final layer outputs a probability for each class (e.g., normal, scratch, inclusion, pit). Softmax ensures they sum to 1.0.',
    },
  ]

  return (
    <div>
      {/* Architecture pipeline */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, flexWrap: 'wrap', marginBottom: 28,
        padding: '20px 12px',
      }}>
        {blocks.map((block, i) => (
          <div key={block.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.button
              onClick={() => setActiveBlock(activeBlock === i ? null : i)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 260 }}
              whileHover={{ scale: 1.1, y: -6 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: block.w, height: block.h, borderRadius: 12,
                background: activeBlock === i
                  ? `linear-gradient(135deg, ${block.color}, ${block.color}cc)`
                  : `${block.color}15`,
                border: `2.5px solid ${block.color}`,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                color: activeBlock === i ? 'white' : block.color,
                boxShadow: activeBlock === i ? `0 0 20px ${block.color}40` : 'none',
              }}
            >
              <span style={{ fontSize: block.w > 50 ? 20 : 16 }}>{block.icon}</span>
              <span style={{
                fontSize: 8, fontWeight: 800, fontFamily: 'var(--font-heading)',
                lineHeight: 1.1, textAlign: 'center',
              }}>
                {block.name}
              </span>
            </motion.button>
            {i < blocks.length - 1 && (
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 700 }}
              >
                {'→'}
              </motion.span>
            )}
          </div>
        ))}
      </div>

      {/* Dimensions bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        {blocks.map((block, i) => (
          <motion.div
            key={block.id}
            animate={{
              background: activeBlock === i ? `${block.color}25` : 'var(--bg-secondary)',
              borderColor: activeBlock === i ? block.color : 'var(--border)',
            }}
            style={{
              padding: '4px 10px', borderRadius: 6,
              border: '1.5px solid', fontSize: 10,
              fontFamily: 'monospace', fontWeight: 700,
              color: activeBlock === i ? block.color : 'var(--text-muted)',
            }}
          >
            {block.dims}
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {activeBlock !== null && (
          <motion.div
            key={activeBlock}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            style={{
              padding: '24px 28px', borderRadius: 18,
              background: `${blocks[activeBlock].color}08`,
              border: `2px solid ${blocks[activeBlock].color}25`,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${blocks[activeBlock].color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
              }}>
                {blocks[activeBlock].icon}
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22,
                  color: blocks[activeBlock].color,
                }}>
                  {blocks[activeBlock].name}
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 14, fontWeight: 600,
                  color: 'var(--text-muted)',
                }}>
                  Output: {blocks[activeBlock].dims}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75,
            }}>
              {blocks[activeBlock].desc}
            </div>

            {/* Dimension change visualization */}
            {activeBlock > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  marginTop: 14, display: 'flex', alignItems: 'center',
                  gap: 12, justifyContent: 'center',
                }}
              >
                <span style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: `${blocks[activeBlock - 1].color}15`,
                  fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                  color: blocks[activeBlock - 1].color,
                }}>
                  {blocks[activeBlock - 1].dims}
                </span>
                <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{'→'}</span>
                <span style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: `${blocks[activeBlock].color}15`,
                  fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                  color: blocks[activeBlock].color,
                }}>
                  {blocks[activeBlock].dims}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {activeBlock === null && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', fontWeight: 500,
          }}
        >
          Click any block to see what happens at that layer
        </motion.p>
      )}
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic4() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Neuron mood="excited" typed message="Welcome to the brain behind computer vision! Convolutional Neural Networks (CNNs) are the engine that turns raw pixels into understanding. Let me show you exactly how they work, one filter at a time." />

      <SectionBlock title="How Convolution Works" icon="🔍">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          A filter slides across the image, computing dot products at every position. Watch it happen step by step on a steel surface with a scratch:
        </p>
        <HindiExplainer
          concept="कन्वोल्यूशन"
          english="Convolution"
          explanation="कन्वोल्यूशन एक तरीका है जिसमें एक छोटा 'फ़िल्टर' पूरी तस्वीर पर फिसलता है और हर जगह पैटर्न ढूँढता है — जैसे किनारे, रेखाएँ, कोने।"
          example="सोचिए एक magnifying glass (आवर्धक लेंस) से आप तस्वीर के हर हिस्से को एक-एक करके देख रहे हैं। कन्वोल्यूशन भी ऐसे ही काम करता है — छोटे-छोटे हिस्सों को देखकर patterns पहचानता है।"
          terms={[
            { hindi: 'फ़िल्टर/कर्नेल', english: 'Filter/Kernel', meaning: 'छोटा नंबर का ग्रिड जो पैटर्न ढूँढता है — जैसे 3×3' },
            { hindi: 'स्ट्राइड', english: 'Stride', meaning: 'फ़िल्टर हर बार कितने पिक्सेल आगे सरकता है' },
            { hindi: 'फ़ीचर मैप', english: 'Feature Map', meaning: 'फ़िल्टर लगाने के बाद बनने वाली नई तस्वीर' },
          ]}
        />
        <InteractiveDemo title="Convolution: Filter Slides Across Image">
          <ConvolutionDemo />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="tip">
        Notice how the edge detection filters produce large values (positive or negative) where the pixel values change sharply — exactly where the scratch is. That is how CNNs "see" features: by detecting patterns of change.
      </NeuronTip>

      <SectionBlock title="Filter Gallery" icon="🎛">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Different filters detect different features. Click each to see its kernel values and the output it produces:
        </p>
        <InteractiveDemo title="6 Common Convolution Filters">
          <FilterGallery />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="explaining" message="A CNN doesn't use just one filter — it uses hundreds. The network LEARNS which filters are useful during training. Early layers learn edge detectors automatically. Deeper layers combine edges into textures, patterns, and eventually full objects." />

      <SectionBlock title="Feature Map Stack — What Each Layer Sees" icon="📚">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          CNNs stack multiple convolutional layers. Each layer builds on the previous one, detecting increasingly complex patterns:
        </p>
        <HindiExplainer
          concept="फ़ीचर मैप की परतें"
          english="Feature Map Layers"
          explanation="CNN में कई परतें (layers) होती हैं। पहली परत सरल चीज़ें ढूँढती है (जैसे किनारे), अगली परत उनसे बने पैटर्न (जैसे texture), और आख़िरी परत पूरी चीज़ (जैसे 'ये खरोंच है') पहचानती है।"
          example="जैसे चेहरा पहचानने में: पहले आँखें, नाक, मुँह अलग-अलग दिखते हैं → फिर ये मिलकर चेहरा बनाते हैं → फिर पहचान होती है कि 'ये कौन है'। CNN भी ऐसे ही layer-by-layer सीखता है।"
          terms={[
            { hindi: 'परत', english: 'Layer', meaning: 'CNN का एक चरण — हर परत कुछ नया सीखती है' },
            { hindi: 'गहरा नेटवर्क', english: 'Deep Network', meaning: 'बहुत सारी परतों वाला नेटवर्क' },
          ]}
        />
        <InteractiveDemo title="From Edges to Objects">
          <FeatureMapStack />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="deep">
        This hierarchical feature learning is what makes CNNs so powerful. No human needs to program "what is a scratch" — the network discovers it automatically by stacking simple filters. Layer 1 finds edges, Layer 2 finds scratch-like textures, Layer 3 recognizes a full scratch.
      </NeuronTip>

      <SectionBlock title="Pooling — Downsampling with Purpose" icon="📉">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Pooling reduces spatial dimensions while keeping the most important information. Compare max pooling vs average pooling:
        </p>
        <HindiExplainer
          concept="पूलिंग"
          english="Pooling"
          explanation="पूलिंग का मतलब है तस्वीर को छोटा करना लेकिन ज़रूरी जानकारी बचाकर रखना। जैसे Max Pooling में हर 2×2 ब्लॉक से सबसे बड़ा नंबर रखते हैं।"
          example="जैसे किसी किताब का सारांश (summary) बनाते हैं — पूरी बात नहीं, बस ज़रूरी बातें। पूलिंग भी तस्वीर का 'सारांश' बनाती है — साइज़ 75% कम हो जाता है लेकिन पैटर्न बचे रहते हैं।"
          terms={[
            { hindi: 'मैक्स पूलिंग', english: 'Max Pooling', meaning: 'हर ब्लॉक से सबसे बड़ा नंबर चुनना' },
            { hindi: 'डाउनसैंपलिंग', english: 'Downsampling', meaning: 'तस्वीर का साइज़ कम करना' },
          ]}
        />
        <InteractiveDemo title="Max Pooling vs Average Pooling">
          <PoolingVisual />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="example">
        Max pooling says "keep the strongest signal in each region" — great for detecting sharp features like scratches. Average pooling says "what is the general intensity here" — useful for smooth textures. Most modern architectures use max pooling.
      </NeuronTip>

      <SectionBlock title="Full CNN Architecture" icon="🏗">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Here is a complete CNN from input to output. Click each block to explore what happens at every stage:
        </p>
        <InteractiveDemo title="End-to-End CNN Architecture">
          <CNNArchitecture />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="happy" typed message="Now you understand the core of modern computer vision! Convolution extracts features, pooling compresses them, and dense layers classify them. Next, we'll see how this architecture powers real-time object detection with YOLO." />
    </div>
  )
}
