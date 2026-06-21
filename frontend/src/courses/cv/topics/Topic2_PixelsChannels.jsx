import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 2 — Pixels & Color Channels
   Zoom into the atoms of an image — interactive pixel exploration
================================================================ */

/* ---- Section 1: Pixel Zoom ---- */
function PixelZoom() {
  const [zoomed, setZoomed] = useState(false)
  const [hoverCell, setHoverCell] = useState(null)

  /* Generate a 16x12 "steel surface" with a diagonal scratch */
  const cols = 16
  const rows = 12
  const pixels = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const base = 140 + Math.sin(c * 0.4) * 15 + Math.cos(r * 0.5) * 10
      const isScratch = Math.abs(r - (c * rows / cols) - 1) < 1.0
      const noise = (Math.random() - 0.5) * 20
      return Math.max(0, Math.min(255, Math.round(isScratch ? 35 + noise * 0.5 : base + noise)))
    })
  )

  const cellSize = zoomed ? 40 : 16

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setZoomed(false)}
          style={{
            padding: '10px 24px', borderRadius: 10,
            background: !zoomed ? 'var(--accent)' : 'var(--bg-card)',
            color: !zoomed ? 'white' : 'var(--text-primary)',
            border: !zoomed ? 'none' : '1px solid var(--border)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          Normal View
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setZoomed(true)}
          style={{
            padding: '10px 24px', borderRadius: 10,
            background: zoomed ? 'var(--accent)' : 'var(--bg-card)',
            color: zoomed ? 'white' : 'var(--text-primary)',
            border: zoomed ? 'none' : '1px solid var(--border)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          Zoom to Pixels
        </motion.button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.div
          layout
          style={{
            display: 'inline-block',
            background: 'var(--bg-card)', borderRadius: 16, padding: zoomed ? 20 : 12,
            border: '1px solid var(--border)', overflow: 'auto', maxWidth: '100%',
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gap: zoomed ? 2 : 0,
          }}>
            {pixels.flat().map((v, i) => {
              const r = Math.floor(i / cols)
              const c = i % cols
              const isHovered = hoverCell && hoverCell.r === r && hoverCell.c === c
              return (
                <motion.div
                  key={i}
                  layout
                  onMouseEnter={() => setHoverCell({ r, c, v })}
                  onMouseLeave={() => setHoverCell(null)}
                  animate={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: zoomed ? 4 : 0,
                  }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  style={{
                    background: `rgb(${v},${v},${v})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', cursor: 'crosshair',
                    outline: isHovered ? '2px solid var(--accent)' : 'none',
                    outlineOffset: -1,
                    zIndex: isHovered ? 10 : 1,
                  }}
                >
                  {zoomed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
                        color: v < 100 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
                      }}
                    >
                      {v}
                    </motion.span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Hover info */}
      <AnimatePresence>
        {hoverCell && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 16, padding: '12px 20px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--accent)',
              display: 'flex', justifyContent: 'center', gap: 24,
              fontFamily: 'monospace', fontSize: 14,
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              Position: <strong style={{ color: 'var(--text-primary)' }}>({hoverCell.r}, {hoverCell.c})</strong>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Value: <strong style={{ color: 'var(--text-primary)' }}>{hoverCell.v}</strong>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Intensity: <strong style={{ color: hoverCell.v < 80 ? '#ef4444' : '#10b981' }}>
                {hoverCell.v < 80 ? 'Dark (defect?)' : 'Normal surface'}
              </strong>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        marginTop: 16, padding: '12px 18px', borderRadius: 10,
        background: 'var(--bg-secondary)', textAlign: 'center',
        fontSize: 13, color: 'var(--text-muted)',
      }}>
        {zoomed
          ? 'Each cell is one pixel with a grayscale value (0=black, 255=white). Notice the dark diagonal — that\'s a scratch!'
          : 'Click "Zoom to Pixels" to reveal the numeric values hidden inside each pixel.'
        }
      </div>
    </div>
  )
}

/* ---- Section 2: RGB Channel Split ---- */
function RGBChannelSplit() {
  const [activeChannel, setActiveChannel] = useState('rgb')

  const channels = [
    { id: 'rgb', label: 'Full Color', color: 'var(--accent)' },
    { id: 'r', label: 'Red', color: '#ef4444' },
    { id: 'g', label: 'Green', color: '#22c55e' },
    { id: 'b', label: 'Blue', color: '#3b82f6' },
    { id: 'gray', label: 'Grayscale', color: '#94a3b8' },
  ]

  /* 10x8 "colored steel" — mostly gray/silver with slight tint variations */
  const imgCols = 10
  const imgRows = 8
  const imageData = Array.from({ length: imgRows }, (_, r) =>
    Array.from({ length: imgCols }, (_, c) => {
      const base = 130 + Math.sin(c * 0.5) * 20 + Math.cos(r * 0.4) * 15
      const isScratch = Math.abs(r - c * (imgRows / imgCols)) < 0.8
      if (isScratch) {
        return { r: 50 + Math.random() * 15, g: 45 + Math.random() * 12, b: 55 + Math.random() * 10 }
      }
      return {
        r: base + 8 + (Math.random() - 0.5) * 12,
        g: base + 2 + (Math.random() - 0.5) * 10,
        b: base - 5 + (Math.random() - 0.5) * 14,
      }
    })
  )

  const getPixelColor = (px) => {
    const rv = Math.round(Math.max(0, Math.min(255, px.r)))
    const gv = Math.round(Math.max(0, Math.min(255, px.g)))
    const bv = Math.round(Math.max(0, Math.min(255, px.b)))
    switch (activeChannel) {
      case 'r': return `rgb(${rv},${rv},${rv})`
      case 'g': return `rgb(${gv},${gv},${gv})`
      case 'b': return `rgb(${bv},${bv},${bv})`
      case 'gray': {
        const gray = Math.round(0.299 * rv + 0.587 * gv + 0.114 * bv)
        return `rgb(${gray},${gray},${gray})`
      }
      default: return `rgb(${rv},${gv},${bv})`
    }
  }

  const getPixelValue = (px) => {
    const rv = Math.round(Math.max(0, Math.min(255, px.r)))
    const gv = Math.round(Math.max(0, Math.min(255, px.g)))
    const bv = Math.round(Math.max(0, Math.min(255, px.b)))
    switch (activeChannel) {
      case 'r': return rv
      case 'g': return gv
      case 'b': return bv
      case 'gray': return Math.round(0.299 * rv + 0.587 * gv + 0.114 * bv)
      default: return null
    }
  }

  return (
    <div>
      {/* Channel buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {channels.map(ch => (
          <motion.button
            key={ch.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveChannel(ch.id)}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: activeChannel === ch.id ? ch.color : 'var(--bg-card)',
              color: activeChannel === ch.id ? 'white' : 'var(--text-primary)',
              border: activeChannel === ch.id ? 'none' : '1px solid var(--border)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            {ch.label}
          </motion.button>
        ))}
      </div>

      {/* Image display */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 20,
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${imgCols}, 36px)`, gap: 2 }}>
            {imageData.flat().map((px, i) => {
              const val = getPixelValue(px)
              return (
                <motion.div
                  key={`${activeChannel}-${i}`}
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, background: getPixelColor(px) }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 36, height: 36, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {val !== null && (
                    <span style={{
                      fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
                      color: val < 100 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                    }}>
                      {val}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Channel explanation */}
      <motion.div
        key={activeChannel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginTop: 20, padding: '16px 22px', borderRadius: 14,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        {activeChannel === 'rgb' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Full Color (RGB)</strong> — Each pixel stores 3 values: Red, Green, Blue. For steel (mostly gray), all channels carry similar intensity. Click a channel to isolate it.
          </div>
        )}
        {activeChannel === 'r' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            <strong style={{ color: '#ef4444' }}>Red Channel</strong> — Shows only the red intensity of each pixel. For gray steel, this is very similar to the other channels because R, G, B are nearly equal in gray objects.
          </div>
        )}
        {activeChannel === 'g' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            <strong style={{ color: '#22c55e' }}>Green Channel</strong> — The green intensity map. Notice how similar it looks to the red channel? That is because steel is essentially colorless — equal parts R, G, B.
          </div>
        )}
        {activeChannel === 'b' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            <strong style={{ color: '#3b82f6' }}>Blue Channel</strong> — Blue intensity. All three channels are nearly identical for gray steel. This is exactly why <strong>grayscale is preferred</strong> for industrial inspection — one channel captures all the information.
          </div>
        )}
        {activeChannel === 'gray' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            <strong style={{ color: '#94a3b8' }}>Grayscale</strong> — Computed as <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>0.299R + 0.587G + 0.114B</code>. For industrial inspection, grayscale reduces data 3x while preserving defect visibility.
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* ---- Section 3: Interactive Pixel Grid ---- */
function PixelGrid() {
  const gridSize = 10

  /* Initialize with a diagonal scratch pattern */
  const createInitialGrid = () => {
    return Array.from({ length: gridSize }, (_, r) =>
      Array.from({ length: gridSize }, (_, c) => {
        const isDiag = Math.abs(r - c) <= 0
        return isDiag ? 40 : 200
      })
    )
  }

  const [grid, setGrid] = useState(createInitialGrid)
  const [paintValue, setPaintValue] = useState(0)
  const [isPainting, setIsPainting] = useState(false)

  const presets = [
    {
      name: 'Scratch',
      fn: () => Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => Math.abs(r - c) <= 0 ? 40 : 200)
      ),
    },
    {
      name: 'Edge',
      fn: () => Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => c < 5 ? 60 : 210)
      ),
    },
    {
      name: 'Gradient',
      fn: () => Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => Math.round((c / (gridSize - 1)) * 255))
      ),
    },
    {
      name: 'Spot',
      fn: () => Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (_, c) => {
          const dist = Math.sqrt((r - 4.5) ** 2 + (c - 4.5) ** 2)
          return dist < 2.5 ? 30 : 200
        })
      ),
    },
    {
      name: 'Clear',
      fn: () => Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => 200)),
    },
  ]

  const handleCellClick = useCallback((r, c) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      newGrid[r][c] = paintValue
      return newGrid
    })
  }, [paintValue])

  const handleCellEnter = useCallback((r, c) => {
    if (!isPainting) return
    handleCellClick(r, c)
  }, [isPainting, handleCellClick])

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {presets.map(p => (
          <motion.button
            key={p.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGrid(p.fn())}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            {p.name}
          </motion.button>
        ))}
      </div>

      {/* Paint value selector */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 20,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Paint Value:</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 64, 128, 192, 255].map(v => (
            <motion.button
              key={v}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPaintValue(v)}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: `rgb(${v},${v},${v})`,
                border: paintValue === v ? '3px solid var(--accent)' : '2px solid var(--border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
                color: v < 128 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
              }}
            >
              {v}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'inline-block', background: 'var(--bg-card)', borderRadius: 16, padding: 16,
            border: '1px solid var(--border)', userSelect: 'none',
          }}
          onMouseDown={() => setIsPainting(true)}
          onMouseUp={() => setIsPainting(false)}
          onMouseLeave={() => setIsPainting(false)}
        >
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 42px)`, gap: 2 }}>
            {grid.flat().map((v, i) => {
              const r = Math.floor(i / gridSize)
              const c = i % gridSize
              return (
                <motion.div
                  key={i}
                  animate={{ background: `rgb(${v},${v},${v})` }}
                  transition={{ duration: 0.15 }}
                  onMouseDown={() => handleCellClick(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                  style={{
                    width: 42, height: 42, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'crosshair',
                  }}
                >
                  <span style={{
                    fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                    color: v < 128 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
                  }}>
                    {v}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 16, padding: '12px 18px', borderRadius: 10,
        background: 'var(--bg-secondary)', textAlign: 'center',
        fontSize: 13, color: 'var(--text-muted)',
      }}>
        Click or drag on cells to paint. Each cell is a pixel — 0 is pure black, 255 is pure white. Try creating defect patterns!
      </div>
    </div>
  )
}

/* ---- Section 4: Color Spaces ---- */
function ColorSpaces() {
  const [activeSpace, setActiveSpace] = useState('rgb')
  const [animating, setAnimating] = useState(false)

  const spaces = [
    { id: 'rgb', label: 'RGB', color: '#6366f1', desc: 'Red, Green, Blue — how monitors display color' },
    { id: 'gray', label: 'Grayscale', color: '#94a3b8', desc: 'Single intensity channel — preferred for industrial inspection' },
    { id: 'hsv', label: 'HSV', color: '#f59e0b', desc: 'Hue, Saturation, Value — separates color from brightness' },
  ]

  /* Generate a small image for each space */
  const imgSize = 8
  const baseImage = Array.from({ length: imgSize }, (_, r) =>
    Array.from({ length: imgSize }, (_, c) => {
      const base = 140 + Math.sin(c * 0.6) * 20 + Math.cos(r * 0.5) * 15
      return {
        r: Math.round(Math.max(0, Math.min(255, base + 10 + (Math.random() - 0.5) * 10))),
        g: Math.round(Math.max(0, Math.min(255, base + 3 + (Math.random() - 0.5) * 8))),
        b: Math.round(Math.max(0, Math.min(255, base - 6 + (Math.random() - 0.5) * 12))),
      }
    })
  )

  const getColor = (px) => {
    switch (activeSpace) {
      case 'gray': {
        const g = Math.round(0.299 * px.r + 0.587 * px.g + 0.114 * px.b)
        return `rgb(${g},${g},${g})`
      }
      case 'hsv': {
        const rn = px.r / 255, gn = px.g / 255, bn = px.b / 255
        const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
        const v = max
        const s = max === 0 ? 0 : (max - min) / max
        /* Use V channel as grayscale-like visualization */
        const vByte = Math.round(v * 255)
        const sByte = Math.round(s * 255)
        return `rgb(${sByte},${vByte},${Math.round((sByte + vByte) / 2)})`
      }
      default: return `rgb(${px.r},${px.g},${px.b})`
    }
  }

  const handleSwitch = (id) => {
    setAnimating(true)
    setTimeout(() => {
      setActiveSpace(id)
      setAnimating(false)
    }, 300)
  }

  const infoCards = {
    rgb: [
      { label: 'Channels', value: '3 (R, G, B)', icon: '🎨' },
      { label: 'Range', value: '0–255 each', icon: '📏' },
      { label: 'Use Case', value: 'Display, web', icon: '🖥️' },
    ],
    gray: [
      { label: 'Channels', value: '1', icon: '⬛' },
      { label: 'Formula', value: '0.3R+0.6G+0.1B', icon: '📐' },
      { label: 'Use Case', value: 'Industrial QC', icon: '🏭' },
    ],
    hsv: [
      { label: 'Channels', value: '3 (H, S, V)', icon: '🌈' },
      { label: 'Hue', value: '0°–360°', icon: '🔄' },
      { label: 'Use Case', value: 'Color filtering', icon: '🎯' },
    ],
  }

  return (
    <div>
      {/* Space selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
        {spaces.map(sp => (
          <motion.button
            key={sp.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSwitch(sp.id)}
            style={{
              padding: '12px 24px', borderRadius: 12,
              background: activeSpace === sp.id ? sp.color : 'var(--bg-card)',
              color: activeSpace === sp.id ? 'white' : 'var(--text-primary)',
              border: activeSpace === sp.id ? 'none' : '1px solid var(--border)',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {sp.label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Image */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 20,
          border: '1px solid var(--border)', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 1 }}>
            {spaces.find(s => s.id === activeSpace)?.label.toUpperCase()} VIEW
          </div>
          <motion.div
            animate={{ opacity: animating ? 0.3 : 1, scale: animating ? 0.95 : 1 }}
            style={{
              display: 'grid', gridTemplateColumns: `repeat(${imgSize}, 32px)`, gap: 2,
            }}
          >
            {baseImage.flat().map((px, i) => (
              <motion.div
                key={i}
                animate={{ background: getColor(px) }}
                transition={{ duration: 0.4 }}
                style={{ width: 32, height: 32, borderRadius: 3 }}
              />
            ))}
          </motion.div>
        </div>

        {/* Info */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 20,
          border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <motion.div
            key={activeSpace}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div style={{
              fontSize: 18, fontWeight: 800, color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)', marginBottom: 6,
            }}>
              {spaces.find(s => s.id === activeSpace)?.label}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
              {spaces.find(s => s.id === activeSpace)?.desc}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(infoCards[activeSpace] || []).map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 10,
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <div style={{ fontSize: 22 }}>{card.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{card.label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'monospace' }}>{card.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Conversion arrow visualization */}
            {activeSpace !== 'rgb' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 10,
                  background: `${spaces.find(s => s.id === activeSpace)?.color}10`,
                  border: `1px solid ${spaces.find(s => s.id === activeSpace)?.color}30`,
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 13, color: '#6366f1' }}>RGB</span>
                <motion.span
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ fontSize: 18, color: 'var(--text-muted)' }}
                >
                  →
                </motion.span>
                <span style={{ fontWeight: 700, fontSize: 13, color: spaces.find(s => s.id === activeSpace)?.color }}>
                  {spaces.find(s => s.id === activeSpace)?.label}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ---- Section 5: Image As Tensor ---- */
function ImageAsTensor() {
  const [rotation, setRotation] = useState(0)
  const [showChannels, setShowChannels] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  useEffect(() => {
    if (!autoRotate) return
    const timer = setInterval(() => {
      setRotation(r => (r + 0.8) % 360)
    }, 50)
    return () => clearInterval(timer)
  }, [autoRotate])

  const h = 6, w = 8, c = 3
  const channelColors = ['#ef4444', '#22c55e', '#3b82f6']
  const channelLabels = ['Red', 'Green', 'Blue']

  /* Perspective offsets for the 3D block */
  const xSkew = Math.cos(rotation * Math.PI / 180) * 0.5
  const layerGap = showChannels ? 50 : 8

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowChannels(!showChannels)}
          style={{
            padding: '10px 24px', borderRadius: 10,
            background: showChannels ? 'var(--accent)' : 'var(--bg-card)',
            color: showChannels ? 'white' : 'var(--text-primary)',
            border: showChannels ? 'none' : '1px solid var(--border)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          {showChannels ? 'Collapse Channels' : 'Explode Channels'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            padding: '10px 24px', borderRadius: 10,
            background: autoRotate ? '#10b981' : 'var(--bg-card)',
            color: autoRotate ? 'white' : 'var(--text-primary)',
            border: autoRotate ? 'none' : '1px solid var(--border)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
        </motion.button>
      </div>

      {/* 3D tensor visualization */}
      <div style={{
        display: 'flex', justifyContent: 'center', perspective: 800,
        padding: '30px 0',
      }}>
        <motion.div
          animate={{ rotateY: rotation, rotateX: 15 }}
          transition={{ duration: 0 }}
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: w * 28, height: h * 28 + (c - 1) * layerGap,
          }}
        >
          {/* Three channel layers */}
          {Array.from({ length: c }, (_, ci) => (
            <motion.div
              key={ci}
              animate={{
                z: showChannels ? (ci - 1) * 80 : (ci - 1) * 12,
                opacity: showChannels ? 0.85 : ci === 0 ? 1 : 0.5,
              }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{
                position: 'absolute',
                top: ci * (showChannels ? 6 : 2),
                left: 0,
                transform: `translateZ(${showChannels ? (ci - 1) * 80 : (ci - 1) * 12}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Channel label */}
              {showChannels && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 11, fontWeight: 800, color: channelColors[ci],
                    whiteSpace: 'nowrap', letterSpacing: 1,
                  }}
                >
                  {channelLabels[ci]}
                </motion.div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${w}, 26px)`,
                gap: 2,
              }}>
                {Array.from({ length: h * w }, (_, pi) => {
                  const intensity = 80 + Math.random() * 120
                  return (
                    <div
                      key={pi}
                      style={{
                        width: 26, height: 26, borderRadius: 3,
                        background: showChannels
                          ? `rgba(${ci === 0 ? intensity : 0}, ${ci === 1 ? intensity : 0}, ${ci === 2 ? intensity : 0}, 0.8)`
                          : `rgba(${intensity}, ${intensity}, ${intensity}, ${1 - ci * 0.15})`,
                        border: `1px solid ${channelColors[ci]}20`,
                      }}
                    />
                  )
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dimension labels */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
        {[
          { label: 'Height', value: `${h} px`, color: '#ef4444', icon: '↕' },
          { label: 'Width', value: `${w} px`, color: '#22c55e', icon: '↔' },
          { label: 'Channels', value: `${c} (RGB)`, color: '#3b82f6', icon: '📚' },
        ].map((dim, i) => (
          <motion.div
            key={dim.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10,
              background: `${dim.color}10`, border: `1px solid ${dim.color}25`,
            }}
          >
            <span style={{ fontSize: 18 }}>{dim.icon}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: dim.color, letterSpacing: 1 }}>{dim.label.toUpperCase()}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{dim.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tensor notation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: 20, padding: '16px 24px', borderRadius: 14,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>
          Tensor Shape: [{h}, {w}, {c}]
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          A color image is a <strong>3D tensor</strong> — Height x Width x Channels. Grayscale images are [{h}, {w}, 1].
          Neural networks process these tensors as multi-dimensional arrays of numbers.
        </div>
      </motion.div>

      {/* Total pixels calc */}
      <div style={{
        marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10,
        alignItems: 'center', fontSize: 14, color: 'var(--text-muted)',
      }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{h}</span>
        <span>x</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{w}</span>
        <span>x</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{c}</span>
        <span>=</span>
        <motion.span
          animate={{ color: ['var(--accent)', '#10b981', 'var(--accent)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 18 }}
        >
          {h * w * c} values
        </motion.span>
        <span>— that is all a computer sees!</span>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic2() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* --- Section 1: Pixel Zoom --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              🔍
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Pixel Zoom
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Every digital image is a grid of numbers. Zoom in to see the pixels that make up a steel surface — and spot the scratch hiding in the data.
          </p>
        </div>
        <HindiExplainer
          concept="पिक्सेल"
          english="Pixel"
          explanation="पिक्सेल तस्वीर का सबसे छोटा बिंदु है। हर डिजिटल फ़ोटो लाखों छोटे-छोटे रंगीन बिंदुओं (pixels) से बनी होती है। ज़ूम करेंगे तो ये बिंदु दिखने लगेंगे!"
          example="मोज़ेक (mosaic) टाइल्स की तरह सोचिए — दूर से देखो तो एक पूरी तस्वीर दिखती है, लेकिन पास जाओ तो छोटे-छोटे रंगीन टुकड़े दिखते हैं। पिक्सेल ठीक ऐसे ही हैं!"
          terms={[
            { hindi: 'पिक्सेल', english: 'Pixel', meaning: 'Picture + Element = तस्वीर का सबसे छोटा बिंदु' },
            { hindi: 'रेज़ोल्यूशन', english: 'Resolution', meaning: 'तस्वीर में कितने पिक्सेल हैं — जैसे 1920x1080' },
          ]}
        />
        <PixelZoom />
      </section>

      {/* --- Section 2: RGB Channel Split --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #ef4444, #22c55e, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              🎨
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              RGB Channel Split
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Color images are built from three channels. Isolate each one to understand why industrial inspection prefers grayscale.
          </p>
        </div>
        <HindiExplainer
          concept="RGB रंग चैनल"
          english="RGB Color Channels"
          explanation="हर पिक्सेल का रंग तीन रंगों को मिलाकर बनता है: लाल (Red), हरा (Green), और नीला (Blue)। इन तीनों को अलग-अलग मात्रा में मिलाकर कोई भी रंग बनाया जा सकता है।"
          example="जैसे पेंट में लाल + नीला = बैंगनी बनता है, वैसे ही स्क्रीन पर Red + Green = पीला दिखता है। हर पिक्सेल में ये तीन रंग 0 से 255 तक की ताकत में मिले होते हैं।"
          terms={[
            { hindi: 'चैनल', english: 'Channel', meaning: 'एक रंग की परत — R, G, या B' },
            { hindi: 'रंग मान', english: 'Color Value', meaning: '0 (बिल्कुल नहीं) से 255 (पूरा) तक की संख्या' },
            { hindi: 'ग्रेस्केल', english: 'Grayscale', meaning: 'सिर्फ़ काला-सफ़ेद — एक ही चैनल' },
          ]}
        />
        <RGBChannelSplit />
      </section>

      {/* --- Section 3: Interactive Pixel Grid --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              ✏️
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Pixel Playground
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Paint your own 10x10 image! Click cells to set grayscale values and see how patterns emerge from numbers.
          </p>
        </div>
        <PixelGrid />
      </section>

      {/* --- Section 4: Color Spaces --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              🌈
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Color Spaces
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            The same image can be represented in different color spaces. Each reveals different information — see the transformations live.
          </p>
        </div>
        <ColorSpaces />
      </section>

      {/* --- Section 5: Image as Tensor --- */}
      <section>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              📦
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Image as a Tensor
            </h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            To a neural network, an image is just a 3D block of numbers. Rotate and explode this tensor to see all three dimensions.
          </p>
        </div>
        <HindiExplainer
          concept="इमेज एक नंबर मैट्रिक्स है"
          english="Image as a Number Matrix"
          explanation="कंप्यूटर के लिए हर तस्वीर बस नंबरों की एक बड़ी तालिका (matrix) है। हर पिक्सेल एक नंबर है। AI इन्हीं नंबरों को पढ़कर 'देखता' है।"
          example="जैसे Excel शीट में हर cell में एक नंबर होता है — तस्वीर भी ऐसी ही एक शीट है! 1920x1080 की फ़ोटो में 20 लाख+ नंबर होते हैं।"
          terms={[
            { hindi: 'मैट्रिक्स', english: 'Matrix', meaning: 'नंबरों की पंक्ति और स्तंभ वाली तालिका' },
            { hindi: 'टेंसर', english: 'Tensor', meaning: '3D मैट्रिक्स — ऊँचाई × चौड़ाई × चैनल' },
            { hindi: 'आयाम', english: 'Dimensions', meaning: 'तस्वीर का आकार — जैसे 640×480×3' },
          ]}
        />
        <ImageAsTensor />
      </section>

    </div>
  )
}
