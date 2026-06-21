import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 3 — Image Preprocessing
   Resize, normalize, augment — prepare images for AI
================================================================ */

/* ---- color palette ---- */
const C = {
  blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981',
  orange: '#f59e0b', pink: '#ec4899', red: '#ef4444',
  cyan: '#06b6d4', indigo: '#6366f1',
}

/* ---- 1. ResizeDemo — original → YOLO 640×640 with letterbox vs stretch ---- */
function ResizeDemo() {
  const [method, setMethod] = useState('letterbox')
  const [animating, setAnimating] = useState(false)
  const [resized, setResized] = useState(false)

  const originalW = 4000
  const originalH = 3000
  const targetSize = 640

  const startResize = () => {
    setAnimating(true)
    setResized(false)
    setTimeout(() => {
      setResized(true)
      setAnimating(false)
    }, 1200)
  }

  const resetDemo = () => {
    setResized(false)
    setAnimating(false)
  }

  /* Generate a simulated "steel surface" as a pixel grid */
  const gridCols = 12
  const gridRows = 9
  const steelPixels = []
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const base = 140 + Math.sin(r * 0.7 + c * 0.3) * 30 + Math.cos(c * 0.5) * 20
      const isScratch = (r === 3 && c >= 2 && c <= 9) || (r === 4 && c >= 3 && c <= 8)
      steelPixels.push({
        r, c,
        color: isScratch
          ? `rgb(${60 + Math.random() * 20}, ${60 + Math.random() * 20}, ${70 + Math.random() * 20})`
          : `rgb(${base|0}, ${(base + 5)|0}, ${(base + 10)|0})`,
      })
    }
  }

  const letterboxAspect = { width: 1, height: originalH / originalW }
  const scaleToFit = Math.min(1, 1 / letterboxAspect.height)

  return (
    <div>
      {/* Method toggle */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
        {['letterbox', 'stretch'].map(m => (
          <motion.button
            key={m}
            onClick={() => { setMethod(m); resetDemo() }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '10px 24px', borderRadius: 12,
              background: method === m ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'var(--bg-secondary)',
              color: method === m ? 'white' : 'var(--text-secondary)',
              border: method === m ? 'none' : '1px solid var(--border)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {m === 'letterbox' ? 'Letterbox (Preserve Ratio)' : 'Stretch (Distort)'}
          </motion.button>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 24, alignItems: 'center',
      }}>
        {/* Original image */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={resized ? { opacity: 0.5, scale: 0.9 } : { opacity: 1, scale: 1 }}
            style={{
              display: 'inline-grid',
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: 1, padding: 8, borderRadius: 14,
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border)',
              aspectRatio: `${originalW}/${originalH}`,
              width: '100%', maxWidth: 240,
            }}
          >
            {steelPixels.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.003 }}
                style={{
                  aspectRatio: '1', borderRadius: 2,
                  background: p.color,
                }}
              />
            ))}
          </motion.div>
          <div style={{
            marginTop: 10, fontSize: 13, fontWeight: 700,
            color: 'var(--text-muted)', fontFamily: 'monospace',
          }}>
            Original: {originalW} x {originalH}
          </div>
        </div>

        {/* Arrow + button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <motion.button
            onClick={startResize}
            disabled={animating}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            style={{
              padding: '12px 22px', borderRadius: 14,
              background: animating
                ? 'var(--bg-secondary)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: animating ? 'var(--text-muted)' : 'white',
              border: 'none', fontWeight: 700, fontSize: 14,
              cursor: animating ? 'default' : 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {animating ? 'Resizing...' : resized ? 'Resize Again' : 'Resize'}
          </motion.button>
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontSize: 28, color: C.green }}
          >
            {'→'}
          </motion.div>
          <div style={{
            fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
            textAlign: 'center', maxWidth: 100,
          }}>
            {method === 'letterbox' ? 'Pad to square' : 'Stretch to square'}
          </div>
        </div>

        {/* Resized result */}
        <div style={{ textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {resized ? (
              <motion.div
                key={method}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', maxWidth: 200, aspectRatio: '1/1',
                  borderRadius: 14, overflow: 'hidden',
                  background: method === 'letterbox' ? '#1a1a2e' : 'var(--bg-secondary)',
                  border: `2px solid ${method === 'letterbox' ? C.blue : C.orange}`,
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gap: 1,
                  width: method === 'letterbox' ? '100%' : '100%',
                  height: method === 'letterbox' ? '75%' : '100%',
                  padding: 4,
                }}>
                  {steelPixels.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.002 }}
                      style={{
                        aspectRatio: method === 'stretch' ? undefined : '1',
                        borderRadius: 1.5,
                        background: p.color,
                        flex: method === 'stretch' ? 1 : undefined,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', maxWidth: 200, aspectRatio: '1/1',
                  borderRadius: 14, border: '2px dashed var(--border)',
                  background: 'var(--bg-secondary)',
                }}
              >
                <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Target: {targetSize}x{targetSize}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{
            marginTop: 10, fontSize: 13, fontWeight: 700,
            color: resized ? (method === 'letterbox' ? C.blue : C.orange) : 'var(--text-muted)',
            fontFamily: 'monospace',
          }}>
            YOLO Input: {targetSize} x {targetSize}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {resized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 20, padding: '18px 24px', borderRadius: 14,
              background: method === 'letterbox' ? `${C.blue}10` : `${C.orange}10`,
              border: `1.5px solid ${method === 'letterbox' ? `${C.blue}30` : `${C.orange}30`}`,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16,
              color: method === 'letterbox' ? C.blue : C.orange, marginBottom: 6,
            }}>
              {method === 'letterbox' ? 'Letterboxing' : 'Stretching'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {method === 'letterbox'
                ? 'The image is scaled to fit inside the 640x640 square while preserving its original aspect ratio. Black padding fills the remaining space. This is what YOLO uses by default — no distortion.'
                : 'The image is forced into a 640x640 square by stretching both axes independently. This distorts the image — circles become ovals, squares become rectangles. Generally avoided for detection tasks.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- 2. NormalizationVisual — pixel values [0-255] → [0.0-1.0] ---- */
function NormalizationVisual() {
  const [normalized, setNormalized] = useState(false)
  const rawValues = [28, 142, 200, 65, 255, 0, 178, 90, 220, 48]

  /* Mini histogram data */
  const histBins = 10
  const histogram = Array(histBins).fill(0)
  rawValues.forEach(v => {
    const bin = Math.min(Math.floor(v / (256 / histBins)), histBins - 1)
    histogram[bin]++
  })
  const maxHist = Math.max(...histogram)

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <motion.button
          onClick={() => setNormalized(!normalized)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 28px', borderRadius: 14,
            background: normalized
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
          }}
        >
          {normalized ? 'Show Raw [0-255]' : 'Normalize to [0.0-1.0]'}
        </motion.button>
      </div>

      {/* Pixel value row */}
      <div style={{
        display: 'flex', gap: 6, justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: 32,
      }}>
        {rawValues.map((v, i) => {
          const normVal = (v / 255).toFixed(3)
          const gray = v
          return (
            <motion.div
              key={i}
              layout
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 6, minWidth: 60,
              }}
            >
              {/* Color swatch */}
              <motion.div
                animate={{
                  background: `rgb(${gray}, ${gray}, ${gray})`,
                  boxShadow: normalized ? `0 0 12px ${C.green}40` : `0 0 12px ${C.purple}30`,
                }}
                transition={{ duration: 0.6 }}
                style={{
                  width: 48, height: 48, borderRadius: 10,
                  border: '2px solid var(--border)',
                }}
              />
              {/* Value */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={normalized ? 'norm' : 'raw'}
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
                    color: normalized ? C.green : C.purple,
                    background: normalized ? `${C.green}15` : `${C.purple}15`,
                    padding: '4px 8px', borderRadius: 6,
                  }}
                >
                  {normalized ? normVal : v}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Range indicator */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 28,
      }}>
        <motion.div
          animate={{ opacity: normalized ? 0.4 : 1 }}
          style={{
            padding: '10px 20px', borderRadius: 12,
            background: `${C.purple}12`, border: `2px solid ${C.purple}30`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Range</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 18, color: C.purple }}>0 - 255</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>integer</div>
        </motion.div>

        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ alignSelf: 'center', fontSize: 24, color: 'var(--text-muted)' }}
        >
          {'÷ 255 →'}
        </motion.div>

        <motion.div
          animate={{ opacity: normalized ? 1 : 0.4 }}
          style={{
            padding: '10px 20px', borderRadius: 12,
            background: `${C.green}12`, border: `2px solid ${C.green}30`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Range</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 18, color: C.green }}>0.0 - 1.0</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>float</div>
        </motion.div>
      </div>

      {/* Histogram visualization */}
      <div style={{
        padding: '20px 24px', borderRadius: 16,
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: 16, textAlign: 'center', fontFamily: 'var(--font-heading)',
        }}>
          Pixel Intensity Histogram
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, justifyContent: 'center', height: 80 }}>
          {histogram.map((count, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: (count / maxHist) * 60 + 4 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                style={{
                  width: 28, borderRadius: 4,
                  background: normalized
                    ? `linear-gradient(to top, ${C.green}60, ${C.green})`
                    : `linear-gradient(to top, ${C.purple}60, ${C.purple})`,
                }}
              />
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {normalized ? (i / histBins).toFixed(1) : i * Math.ceil(256 / histBins)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Why normalize */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          marginTop: 20, padding: '16px 22px', borderRadius: 14,
          background: `${C.cyan}08`, border: `1.5px solid ${C.cyan}25`,
        }}
      >
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: C.cyan }}>Why normalize?</strong> Neural networks learn fastest when inputs are small, centered numbers. Raw pixel values (0-255) create huge gradients that make training unstable. Dividing by 255 maps everything to [0, 1] — smooth, stable learning.
        </div>
      </motion.div>
    </div>
  )
}

/* ---- 3. AugmentationGallery — 8 augmentation techniques ---- */
function AugmentationGallery() {
  const [selected, setSelected] = useState(null)

  /* Each augmentation with a simulated visual transform */
  const augmentations = [
    {
      name: 'Rotation', icon: '🔄', color: C.blue,
      desc: 'Rotate image by random angle (e.g. -15° to +15°). Helps model learn orientation-invariant features.',
      transform: 'rotate(12deg)', transformLabel: '+12°',
    },
    {
      name: 'Horizontal Flip', icon: '↔', color: C.purple,
      desc: 'Mirror the image horizontally. A scratch on the left side looks the same on the right.',
      transform: 'scaleX(-1)', transformLabel: 'Flipped',
    },
    {
      name: 'Brightness', icon: '☀', color: C.orange,
      desc: 'Randomly increase or decrease brightness. Simulates different lighting conditions on the factory floor.',
      transform: 'brightness(1.4)', transformLabel: '+40%',
    },
    {
      name: 'Contrast', icon: '◐', color: C.indigo,
      desc: 'Adjust contrast to make features more or less pronounced. Helps with varying surface textures.',
      transform: 'contrast(1.5)', transformLabel: '+50%',
    },
    {
      name: 'Gaussian Blur', icon: '💨', color: C.cyan,
      desc: 'Slightly blur the image. Simulates camera defocus or motion blur in production environments.',
      transform: 'blur(2px)', transformLabel: 'sigma=2',
    },
    {
      name: 'Noise', icon: '📡', color: C.red,
      desc: 'Add random pixel noise (salt & pepper or Gaussian). Makes the model robust to sensor noise.',
      transform: 'none', transformLabel: 'Noisy', noise: true,
    },
    {
      name: 'Random Crop', icon: '✂', color: C.green,
      desc: 'Crop a random region and resize back. Forces model to detect defects even when partially visible.',
      transform: 'scale(1.3)', transformLabel: 'Cropped',
    },
    {
      name: 'Mosaic', icon: '🧩', color: C.pink,
      desc: 'Combine 4 images into one mosaic. A YOLO specialty — exposes the model to multiple objects at varying scales.',
      transform: 'none', transformLabel: '4-in-1', mosaic: true,
    },
  ]

  /* Render a simulated steel surface mini-image */
  const SteelMini = ({ style: extraStyle = {}, filter, showNoise, showMosaic }) => {
    const rows = 6
    const cols = 8
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 1, padding: 4, borderRadius: 8, overflow: 'hidden',
        background: '#2a2a3e',
        filter: filter || 'none',
        ...extraStyle,
      }}>
        {showMosaic ? (
          /* 2x2 mosaic of mini grids */
          [0, 1, 2, 3].map(q => (
            <div key={q} style={{
              gridColumn: q % 2 === 0 ? '1 / 5' : '5 / 9',
              gridRow: q < 2 ? '1 / 4' : '4 / 7',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0.5, padding: 1,
              border: `1px solid ${C.pink}50`,
            }}>
              {Array(12).fill(0).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: 1,
                  background: `rgb(${130 + q * 25 + Math.sin(i) * 20}, ${135 + q * 20}, ${140 + q * 15})`,
                }} />
              ))}
            </div>
          ))
        ) : (
          Array(rows * cols).fill(0).map((_, i) => {
            const r = Math.floor(i / cols)
            const c = i % cols
            const base = 140 + Math.sin(r * 0.6 + c * 0.4) * 25
            const isScratch = r === 2 && c >= 1 && c <= 6
            const noise = showNoise ? (Math.random() - 0.5) * 80 : 0
            const val = Math.max(0, Math.min(255, (isScratch ? 70 : base) + noise))
            return (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 1,
                background: `rgb(${val|0}, ${(val + 5)|0}, ${(val + 8)|0})`,
              }} />
            )
          })
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 14,
      }}>
        {augmentations.map((aug, i) => {
          const isActive = selected === i
          return (
            <motion.button
              key={aug.name}
              onClick={() => setSelected(isActive ? null : i)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: 14, borderRadius: 16, cursor: 'pointer',
                background: isActive ? `${aug.color}15` : 'var(--bg-secondary)',
                border: `2px solid ${isActive ? aug.color : 'var(--border)'}`,
                textAlign: 'center',
                boxShadow: isActive ? `0 0 20px ${aug.color}25` : 'none',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{aug.icon}</div>
              <div style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
                color: isActive ? aug.color : 'var(--text-primary)',
              }}>
                {aug.name}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selected !== null && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            style={{
              marginTop: 20, padding: '24px 28px', borderRadius: 18,
              background: `${augmentations[selected].color}08`,
              border: `2px solid ${augmentations[selected].color}25`,
            }}
          >
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr',
              gap: 20, alignItems: 'center', marginBottom: 16,
            }}>
              {/* Before */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
                }}>
                  Before
                </div>
                <SteelMini style={{ maxWidth: 160, margin: '0 auto' }} />
              </div>

              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ fontSize: 28, color: augmentations[selected].color }}
              >
                {'→'}
              </motion.div>

              {/* After */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: augmentations[selected].color,
                  textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
                }}>
                  After
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ maxWidth: 160, margin: '0 auto' }}
                >
                  <SteelMini
                    filter={augmentations[selected].transform !== 'none'
                      ? (augmentations[selected].name === 'Gaussian Blur' ? `blur(2px)` : undefined)
                      : undefined}
                    style={{
                      maxWidth: 160,
                      transform: !['Brightness', 'Contrast', 'Gaussian Blur', 'Noise', 'Mosaic'].includes(augmentations[selected].name)
                        ? augmentations[selected].transform : undefined,
                      filter: ['Brightness', 'Contrast', 'Gaussian Blur'].includes(augmentations[selected].name)
                        ? augmentations[selected].transform : undefined,
                      overflow: augmentations[selected].name === 'Random Crop' ? 'hidden' : undefined,
                    }}
                    showNoise={augmentations[selected].noise}
                    showMosaic={augmentations[selected].mosaic}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: 6, padding: '3px 10px', borderRadius: 8,
                    background: `${augmentations[selected].color}18`,
                    display: 'inline-block', fontSize: 12, fontWeight: 700,
                    color: augmentations[selected].color, fontFamily: 'monospace',
                  }}
                >
                  {augmentations[selected].transformLabel}
                </motion.div>
              </div>
            </div>

            <div style={{
              fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7,
              textAlign: 'center',
            }}>
              {augmentations[selected].desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- 4. AugmentationPipeline — toggle augmentations, see dataset multiply ---- */
function AugmentationPipeline() {
  const [pipeline, setPipeline] = useState({
    rotation: false, flip: false, brightness: false, contrast: false,
    blur: false, noise: false, crop: false, mosaic: false,
  })

  const augList = [
    { key: 'rotation', label: 'Rotation', icon: '🔄', color: C.blue, mult: 3 },
    { key: 'flip', label: 'Flip', icon: '↔', color: C.purple, mult: 2 },
    { key: 'brightness', label: 'Brightness', icon: '☀', color: C.orange, mult: 2 },
    { key: 'contrast', label: 'Contrast', icon: '◐', color: C.indigo, mult: 2 },
    { key: 'blur', label: 'Blur', icon: '💨', color: C.cyan, mult: 2 },
    { key: 'noise', label: 'Noise', icon: '📡', color: C.red, mult: 2 },
    { key: 'crop', label: 'Crop', icon: '✂', color: C.green, mult: 3 },
    { key: 'mosaic', label: 'Mosaic', icon: '🧩', color: C.pink, mult: 2 },
  ]

  const baseImages = 6
  const activeAugs = augList.filter(a => pipeline[a.key])
  const totalMult = activeAugs.reduce((acc, a) => acc * a.mult, 1)
  const totalImages = baseImages * totalMult

  const toggle = (key) => {
    setPipeline(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div>
      {/* Toggle grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 10, marginBottom: 28,
      }}>
        {augList.map((aug) => {
          const on = pipeline[aug.key]
          return (
            <motion.button
              key={aug.key}
              onClick={() => toggle(aug.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                background: on ? `${aug.color}20` : 'var(--bg-secondary)',
                borderColor: on ? aug.color : 'var(--border)',
              }}
              style={{
                padding: '12px 8px', borderRadius: 14, cursor: 'pointer',
                border: '2px solid', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{aug.icon}</div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: on ? aug.color : 'var(--text-muted)',
                fontFamily: 'var(--font-heading)',
              }}>
                {aug.label}
              </div>
              <div style={{
                marginTop: 4, fontSize: 10, fontWeight: 700,
                color: on ? aug.color : 'transparent',
              }}>
                x{aug.mult}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Pipeline visualization */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, flexWrap: 'wrap', marginBottom: 24,
      }}>
        <motion.div
          style={{
            padding: '10px 18px', borderRadius: 12,
            background: 'var(--bg-secondary)', border: '2px solid var(--border)',
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14,
            color: 'var(--text-primary)',
          }}
        >
          {baseImages} images
        </motion.div>
        {activeAugs.map((aug, i) => (
          <motion.div
            key={aug.key}
            initial={{ opacity: 0, scale: 0, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 'auto' }}
            exit={{ opacity: 0, scale: 0, width: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>{'→'}</span>
            <div style={{
              padding: '8px 14px', borderRadius: 10,
              background: `${aug.color}15`, border: `1.5px solid ${aug.color}40`,
              fontSize: 12, fontWeight: 700, color: aug.color,
              whiteSpace: 'nowrap',
            }}>
              {aug.icon} x{aug.mult}
            </div>
          </motion.div>
        ))}
        <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>=</span>
      </div>

      {/* Result counter */}
      <motion.div
        layout
        style={{
          textAlign: 'center', padding: '24px 32px', borderRadius: 20,
          background: totalMult > 1
            ? 'linear-gradient(135deg, #10b98115, #06b6d415)'
            : 'var(--bg-secondary)',
          border: `2px solid ${totalMult > 1 ? C.green + '40' : 'var(--border)'}`,
        }}
      >
        <motion.div
          key={totalImages}
          initial={{ scale: 1.3, color: C.green }}
          animate={{ scale: 1, color: totalMult > 1 ? C.green : 'var(--text-primary)' }}
          style={{
            fontFamily: 'var(--font-heading)', fontWeight: 900,
            fontSize: 48, lineHeight: 1,
          }}
        >
          {totalImages}
        </motion.div>
        <div style={{
          fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8,
        }}>
          augmented training images
        </div>
        {totalMult > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 8, fontSize: 14, fontWeight: 700, color: C.green,
            }}
          >
            {totalMult}x more data from only {baseImages} original images
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

/* ---- 5. WhyPreprocess — training curves with vs without preprocessing ---- */
function WhyPreprocess() {
  const [running, setRunning] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const maxEpochs = 20

  /* Simulated training curves */
  const withoutPreprocess = Array(maxEpochs).fill(0).map((_, i) => {
    const noise = Math.sin(i * 2.1) * 15 + Math.cos(i * 3.7) * 10
    return Math.max(20, Math.min(70, 40 + noise + i * 0.5))
  })

  const withPreprocess = Array(maxEpochs).fill(0).map((_, i) => {
    const base = 30 + (65 / (1 + Math.exp(-0.35 * (i - 8))))
    return Math.min(95, base + Math.sin(i * 0.5) * 2)
  })

  const startTraining = () => {
    setRunning(true)
    setEpoch(0)
  }

  /* Animate epoch by epoch */
  useState(() => {
    // placeholder - we use effect
  })

  // Simple epoch ticker using setTimeout chain
  const [tick, setTick] = useState(0)
  if (running && epoch < maxEpochs) {
    setTimeout(() => {
      setEpoch(e => e + 1)
      setTick(t => t + 1)
    }, 200)
  }
  if (epoch >= maxEpochs && running) {
    setTimeout(() => setRunning(false), 300)
  }

  const barHeight = 160

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <motion.button
          onClick={startTraining}
          disabled={running}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '14px 32px', borderRadius: 14,
            background: running
              ? 'var(--bg-secondary)'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: running ? 'var(--text-muted)' : 'white',
            border: 'none', fontWeight: 700, fontSize: 15,
            cursor: running ? 'default' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {running ? `Training... Epoch ${epoch}/${maxEpochs}` : epoch > 0 ? 'Re-Train' : 'Start Training'}
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* WITHOUT preprocessing */}
        <div style={{
          padding: '20px 16px', borderRadius: 18,
          background: `${C.red}08`, border: `2px solid ${C.red}25`,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
            color: C.red, marginBottom: 4,
          }}>
            WITHOUT Preprocessing
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Raw images, no augmentation
          </div>

          {/* Bar chart */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 3,
            justifyContent: 'center', height: barHeight, padding: '0 8px',
          }}>
            {withoutPreprocess.slice(0, epoch).map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: (v / 100) * barHeight }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  flex: 1, maxWidth: 16, borderRadius: 3,
                  background: `linear-gradient(to top, ${C.red}60, ${C.red})`,
                }}
              />
            ))}
          </div>

          <div style={{
            marginTop: 12, fontSize: 11, color: 'var(--text-muted)',
            fontFamily: 'monospace',
          }}>
            Accuracy: {epoch > 0 ? `~${withoutPreprocess[Math.min(epoch - 1, maxEpochs - 1)].toFixed(0)}%` : '—'}
          </div>
          {epoch >= maxEpochs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 8, padding: '6px 14px', borderRadius: 8,
                background: `${C.red}15`, fontSize: 12, fontWeight: 700, color: C.red,
              }}
            >
              Unstable, low accuracy
            </motion.div>
          )}
        </div>

        {/* WITH preprocessing */}
        <div style={{
          padding: '20px 16px', borderRadius: 18,
          background: `${C.green}08`, border: `2px solid ${C.green}25`,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16,
            color: C.green, marginBottom: 4,
          }}>
            WITH Preprocessing
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Normalized + augmented
          </div>

          {/* Bar chart */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 3,
            justifyContent: 'center', height: barHeight, padding: '0 8px',
          }}>
            {withPreprocess.slice(0, epoch).map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: (v / 100) * barHeight }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  flex: 1, maxWidth: 16, borderRadius: 3,
                  background: `linear-gradient(to top, ${C.green}60, ${C.green})`,
                }}
              />
            ))}
          </div>

          <div style={{
            marginTop: 12, fontSize: 11, color: 'var(--text-muted)',
            fontFamily: 'monospace',
          }}>
            Accuracy: {epoch > 0 ? `~${withPreprocess[Math.min(epoch - 1, maxEpochs - 1)].toFixed(0)}%` : '—'}
          </div>
          {epoch >= maxEpochs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 8, padding: '6px 14px', borderRadius: 8,
                background: `${C.green}15`, fontSize: 12, fontWeight: 700, color: C.green,
              }}
            >
              Smooth convergence, high accuracy
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic3() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Neuron mood="excited" typed message="Before feeding images to a neural network, we need to prepare them. Raw camera images are huge, noisy, and inconsistent. Preprocessing transforms them into clean, uniform inputs that AI can learn from effectively." />

      <SectionBlock title="Resize for the Model" icon="📐">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Camera images come in all shapes and sizes. YOLO needs a fixed 640x640 input. See how the image transforms:
        </p>
        <HindiExplainer
          concept="इमेज रीसाइज़िंग"
          english="Image Resizing"
          explanation="AI मॉडल को एक तय साइज़ की तस्वीर चाहिए — जैसे 640×640। इसलिए हर तस्वीर को पहले उस साइज़ में बदलना पड़ता है, चाहे वो बड़ी हो या छोटी।"
          example="जैसे पासपोर्ट फ़ोटो के लिए तस्वीर को एक खास साइज़ में काटना पड़ता है — AI के लिए भी ऐसे ही हर तस्वीर को एक 'स्टैंडर्ड साइज़' में लाना पड़ता है।"
          terms={[
            { hindi: 'लेटरबॉक्स', english: 'Letterbox', meaning: 'साइज़ बदलते वक़्त अनुपात बचाना — खाली जगह काली रहती है' },
            { hindi: 'स्ट्रेच', english: 'Stretch', meaning: 'तस्वीर को खींचकर फ़िट करना — अनुपात बिगड़ सकता है' },
          ]}
        />
        <InteractiveDemo title="Resize: Letterbox vs Stretch">
          <ResizeDemo />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="tip">
        Always use letterboxing for object detection. Stretching distorts the aspect ratio, which changes the shape of defects and confuses the model. YOLO v5/v8 use letterboxing by default.
      </NeuronTip>

      <SectionBlock title="Pixel Normalization" icon="🔢">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Transform raw pixel intensities (0-255) into neural-network-friendly values (0.0-1.0):
        </p>
        <HindiExplainer
          concept="नॉर्मलाइज़ेशन"
          english="Normalization"
          explanation="पिक्सेल की वैल्यू 0 से 255 होती है, लेकिन AI को 0 से 1 के बीच की संख्या ज़्यादा आसानी से समझ आती है। नॉर्मलाइज़ेशन में हम हर नंबर को 255 से भाग देते हैं।"
          example="जैसे तापमान को Celsius से Fahrenheit में बदलते हैं ताकि दूसरे देश के लोग समझ सकें — वैसे ही पिक्सेल वैल्यू को AI की 'भाषा' में बदलना पड़ता है।"
          terms={[
            { hindi: 'स्केलिंग', english: 'Scaling', meaning: 'बड़ी संख्या को छोटी रेंज में लाना' },
            { hindi: 'रेंज', english: 'Range', meaning: 'संख्याओं का दायरा — 0 से 1' },
          ]}
        />
        <InteractiveDemo title="Normalize Pixel Values">
          <NormalizationVisual />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="explaining" message="Think of normalization like converting currencies before doing math. You wouldn't add dollars, euros, and yen directly — you convert them to one unit first. Same idea with pixel values." />

      <SectionBlock title="Data Augmentation Gallery" icon="🎨">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Augmentation creates variations of your training images. More variety = more robust model. Click each technique to see it in action:
        </p>
        <HindiExplainer
          concept="डेटा ऑगमेंटेशन"
          english="Data Augmentation"
          explanation="AI को सीखने के लिए बहुत सारी तस्वीरें चाहिए। ऑगमेंटेशन में हम एक ही तस्वीर को घुमाकर, पलटकर, या रंग बदलकर कई नई तस्वीरें बनाते हैं — जैसे एक से दस!"
          example="जैसे एक ही ड्रेस को अलग-अलग lighting में, अलग angle से फ़ोटो खींचें — AI को भी ऐसे ही हर condition में पहचानना सिखाना होता है। एक ही स्टील शीट को rotate, flip करके AI को ज़्यादा examples दे सकते हैं।"
          terms={[
            { hindi: 'रोटेशन', english: 'Rotation', meaning: 'तस्वीर को घुमाना' },
            { hindi: 'फ़्लिप', english: 'Flip', meaning: 'तस्वीर को आईने जैसा उल्टा करना' },
            { hindi: 'ब्राइटनेस', english: 'Brightness', meaning: 'तस्वीर की रोशनी कम-ज़्यादा करना' },
          ]}
        />
        <InteractiveDemo title="8 Augmentation Techniques">
          <AugmentationGallery />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="fun">
        The Mosaic augmentation was introduced by the creator of YOLOv4. By stitching 4 images together, the model sees objects at different scales and contexts in a single training step. Brilliant and simple.
      </NeuronTip>

      <SectionBlock title="Build Your Augmentation Pipeline" icon="🔧">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Toggle augmentations on and off to see how your effective dataset size multiplies:
        </p>
        <InteractiveDemo title="Pipeline Builder">
          <AugmentationPipeline />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Why Preprocessing Matters" icon="📊">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Watch two models train side by side — one with preprocessing, one without. The difference is dramatic:
        </p>
        <InteractiveDemo title="Training Comparison">
          <WhyPreprocess />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="warning">
        Not all augmentations are appropriate for every task. For steel defect detection, be careful with extreme blur (it might hide fine cracks) or heavy rotation (if defects have directional patterns). Always validate your augmentation choices.
      </NeuronTip>

      <Neuron mood="happy" typed message="Your images are now clean, normalized, and augmented — ready for the neural network! Next, we'll explore the engine that actually processes these images: Convolutional Neural Networks." />
    </div>
  )
}
