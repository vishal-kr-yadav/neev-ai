import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 4 — Bubble Sort
   Think Like a Programmer — Visual-First DSA Course
================================================================ */

const C = {
  blue:   '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  pink:   '#ec4899',
  orange: '#f59e0b',
  green:  '#10b981',
  cyan:   '#06b6d4',
  red:    '#ef4444',
  yellow: '#eab308',
  teal:   '#14b8a6',
}

/* Bar colors (vibrant palette, one per bar index) */
const BAR_PALETTE = [
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
  '#14b8a6', '#84cc16',
]

/* ---- Utility: generate random array ---- */
function randomArray(size = 10, max = 90, min = 10) {
  const arr = []
  while (arr.length < size) {
    const v = Math.floor(Math.random() * (max - min + 1)) + min
    if (!arr.includes(v)) arr.push(v)
  }
  return arr
}

/* ---- Pre-compute all bubble sort steps ---- */
function computeBubbleSortSteps(arr) {
  const steps = []
  const a = [...arr]
  const n = a.length
  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false
    for (let j = 0; j < n - 1 - pass; j++) {
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapping: false,
        sortedFrom: n - pass,
        pass,
        comparisons: steps.filter(s => !s.swapping).length + 1,
        swaps: steps.filter(s => s.swapping).length,
      })
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        swapped = true
        steps.push({
          array: [...a],
          comparing: [j, j + 1],
          swapping: true,
          sortedFrom: n - pass,
          pass,
          comparisons: steps.filter(s => !s.swapping).length,
          swaps: steps.filter(s => s.swapping).length + 1,
        })
      }
    }
    if (!swapped) break
  }
  steps.push({
    array: [...a],
    comparing: [],
    swapping: false,
    sortedFrom: 0,
    pass: n,
    comparisons: steps.filter(s => !s.swapping).length,
    swaps: steps.filter(s => s.swapping).length,
    done: true,
  })
  return steps
}

/* ---- Pre-compute optimized bubble sort steps ---- */
function computeOptimizedSteps(arr) {
  const steps = []
  const a = [...arr]
  const n = a.length
  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false
    for (let j = 0; j < n - 1 - pass; j++) {
      steps.push({ array: [...a], comparing: [j, j + 1], swapping: false, pass, earlyExit: false })
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        swapped = true
        steps.push({ array: [...a], comparing: [j, j + 1], swapping: true, pass, earlyExit: false })
      }
    }
    if (!swapped) {
      steps.push({ array: [...a], comparing: [], swapping: false, pass, earlyExit: true, done: true })
      return steps
    }
  }
  steps.push({ array: [...a], comparing: [], swapping: false, pass: n, earlyExit: false, done: true })
  return steps
}

/* ================================================================
   SUB-COMPONENT: Bar Chart Renderer
================================================================ */
function BarChart({ array, comparing = [], swapping = false, sortedFrom, maxVal = 100, height = 180, showValues = true, colorOverride = null }) {
  const barWidth = Math.min(48, Math.floor(560 / array.length))
  const gap = Math.max(4, Math.floor(barWidth * 0.18))

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap, justifyContent: 'center', height }}>
      {array.map((val, i) => {
        const isSorted = sortedFrom !== undefined && i >= sortedFrom
        const isComparing = comparing.includes(i)
        const barH = Math.max(20, Math.floor((val / maxVal) * (height - 28)))
        let bg = colorOverride ? colorOverride(i) : BAR_PALETTE[i % BAR_PALETTE.length]
        let glow = 'none'
        let border = 'none'
        let scale = 1

        if (isSorted) {
          bg = C.blue
          glow = `0 0 12px ${C.blue}88`
        }
        if (isComparing && !swapping) {
          bg = C.yellow
          glow = `0 0 18px ${C.yellow}bb`
          border = `2px solid ${C.yellow}`
          scale = 1.06
        }
        if (isComparing && swapping) {
          bg = C.green
          glow = `0 0 20px ${C.green}bb`
          border = `2px solid ${C.green}`
          scale = 1.08
        }

        return (
          <motion.div
            key={i}
            layout
            animate={{ scaleY: 1, scaleX: scale }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              width: barWidth,
              height: barH,
              background: bg,
              borderRadius: '6px 6px 3px 3px',
              boxShadow: glow,
              border,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 4,
              cursor: 'default',
              transition: 'background 0.2s, box-shadow 0.2s',
              position: 'relative',
            }}
          >
            {showValues && (
              <span style={{
                fontSize: Math.min(13, barWidth * 0.3),
                fontWeight: 700,
                color: 'white',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                lineHeight: 1,
              }}>
                {val}
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ================================================================
   SECTION 1 — The Problem
================================================================ */
function Section1TheProblem() {
  const [chosen, setChosen] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const marks = [73, 45, 88, 31, 62, 54, 79, 20, 95, 41]

  const strategies = [
    { id: 'find-min', label: 'Find the smallest mark each time and pull it to front', icon: '🔍' },
    { id: 'compare-neighbors', label: 'Compare two neighboring marks and swap if out of order', icon: '↔️' },
    { id: 'random', label: 'Shuffle randomly until it accidentally sorts itself', icon: '🎲' },
  ]

  return (
    <SectionBlock icon="📊" title="The Problem" color={C.indigo}>
      <Neuron
        mood="thinking"
        message="Here are 10 students' marks. They need to be ranked from lowest to highest for a prize ceremony. How would YOU sort them?"
        size="medium"
        style={{ marginBottom: 28 }}
      />

      {/* Unsorted bar chart */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        borderRadius: 18,
        padding: '28px 24px 16px',
        marginBottom: 28,
      }}>
        <div style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600, marginBottom: 16, textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }}>
          Student Marks (Unsorted)
        </div>
        <BarChart array={marks} maxVal={100} height={180} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {marks.map((m, i) => (
            <span key={i} style={{
              background: BAR_PALETTE[i % BAR_PALETTE.length] + '33',
              border: `1px solid ${BAR_PALETTE[i % BAR_PALETTE.length]}66`,
              color: BAR_PALETTE[i % BAR_PALETTE.length],
              fontWeight: 700, fontSize: 14, padding: '3px 10px', borderRadius: 8,
            }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Strategy selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 14 }}>
          Pick your sorting strategy:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {strategies.map(s => (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setChosen(s.id); setRevealed(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px', borderRadius: 14,
                background: chosen === s.id
                  ? (s.id === 'compare-neighbors' ? 'linear-gradient(135deg, #10b98120, #06b6d420)' : 'linear-gradient(135deg, #ef444420, #f9731620)')
                  : 'var(--bg-main)',
                border: chosen === s.id
                  ? `2px solid ${s.id === 'compare-neighbors' ? C.green : C.red}`
                  : '2px solid var(--border)',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{s.label}</span>
              {chosen === s.id && (
                <span style={{ marginLeft: 'auto', fontSize: 20 }}>
                  {s.id === 'compare-neighbors' ? '✅' : '❌'}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {chosen && !revealed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {chosen === 'compare-neighbors' ? (
              <NeuronTip type="fun">
                Yes! That's exactly Bubble Sort. You compare two neighbors, swap if needed, and repeat until everything is in order.
              </NeuronTip>
            ) : (
              <NeuronTip type="warning">
                That approach either works but needs more memory (find-min = Selection Sort), or is hilariously slow (random shuffle = Bogosort). Let's try the neighbor comparison approach instead!
              </NeuronTip>
            )}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setChosen('compare-neighbors'); setRevealed(true) }}
              style={{
                marginTop: 12, padding: '12px 28px', borderRadius: 30,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Show me Bubble Sort →
            </motion.button>
          </motion.div>
        )}
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '2px solid #10b981',
              borderRadius: 16, padding: '20px 24px',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 17, color: '#065f46', marginBottom: 8 }}>
              The simplest strategy: Compare Neighbors!
            </div>
            <div style={{ color: '#047857', fontSize: 15, lineHeight: 1.7 }}>
              Go through the array, compare each pair of neighbors. If left &gt; right — SWAP them.
              After one full pass, the <strong>largest element reaches the end</strong>. Repeat for the rest.
              This is <strong>Bubble Sort</strong>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 24 }}>
        <HindiExplainer
          concept="समस्या — Unsorted Array"
          english="The Problem"
          explanation="मान लो 10 छात्रों के नंबर हैं जो बेतरतीब (random) हैं। हमें उन्हें छोटे से बड़े की तरफ लगाना है। सबसे आसान तरीका है — दो पड़ोसियों को compare करो, अगर गलत order में हैं तो swap करो।"
          example="जैसे लाइन में लगे बच्चों को height के हिसाब से arrange करना हो — आप बस पास-पास खड़े दो बच्चों को देखते हो और अगर लंबा पहले है तो उन्हें swap कर देते हो।"
          terms={[]}
        />
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 2 — Main Bubble Sort Visualizer
================================================================ */
function Section2Visualizer() {
  const INITIAL = [64, 34, 25, 12, 22, 11, 90, 55, 43, 77]
  const [array, setArray] = useState(INITIAL)
  const [steps, setSteps] = useState(() => computeBubbleSortSteps(INITIAL))
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(300)
  const [mode, setMode] = useState('step') // 'step' | 'auto'
  const timerRef = useRef(null)

  const current = steps[stepIdx] || steps[0]

  const resetWithArray = useCallback((arr) => {
    setArray(arr)
    setSteps(computeBubbleSortSteps(arr))
    setStepIdx(0)
    setPlaying(false)
  }, [])

  const handleShuffle = () => {
    resetWithArray(randomArray(10, 95, 10))
  }

  const handleReset = () => {
    setStepIdx(0)
    setPlaying(false)
  }

  const handleNext = () => {
    if (stepIdx < steps.length - 1) setStepIdx(s => s + 1)
  }

  const handlePrev = () => {
    if (stepIdx > 0) setStepIdx(s => s - 1)
    setPlaying(false)
  }

  // Auto-play
  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return }
    if (current.done) { setPlaying(false); return }
    timerRef.current = setInterval(() => {
      setStepIdx(s => {
        if (s >= steps.length - 1) { setPlaying(false); return s }
        return s + 1
      })
    }, speed)
    return () => clearInterval(timerRef.current)
  }, [playing, speed, steps])

  useEffect(() => {
    if (current?.done) setPlaying(false)
  }, [current])

  const totalComparisons = steps.filter(s => !s.swapping).length - 1
  const totalSwaps = steps.filter(s => s.swapping).length

  const currentComparisons = steps.slice(0, stepIdx + 1).filter(s => !s.swapping && s.comparing?.length > 0).length
  const currentSwaps = steps.slice(0, stepIdx + 1).filter(s => s.swapping).length

  return (
    <SectionBlock icon="🔄" title="Bubble Sort Visualizer" color={C.blue}>
      <Neuron
        mood="explaining"
        message="Watch the bars! Yellow = currently comparing. Green = swapping! Blue = already sorted. Use Step mode to go one move at a time."
        size="medium"
        style={{ marginBottom: 24 }}
      />

      {/* Mode + Speed Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        {['step', 'auto'].map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setPlaying(false) }}
            style={{
              padding: '8px 20px', borderRadius: 20,
              background: mode === m ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-secondary)',
              border: `2px solid ${mode === m ? 'transparent' : 'var(--border)'}`,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {m === 'step' ? '👆 Step-by-Step' : '▶ Auto Play'}
          </button>
        ))}

        {/* Speed slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>🐢</span>
          <input
            type="range" min={50} max={700} step={50}
            value={700 - speed + 50}
            onChange={e => setSpeed(700 - Number(e.target.value) + 50)}
            style={{ width: 100, accentColor: C.indigo }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>🐇</span>
        </div>
      </div>

      {/* Main visualization */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        borderRadius: 20, padding: '28px 24px 20px',
        marginBottom: 20,
      }}>
        {/* Pass indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            background: '#6366f122', border: '1px solid #6366f166',
            borderRadius: 10, padding: '6px 16px',
            fontSize: 13, color: '#a5b4fc', fontWeight: 700,
          }}>
            Pass #{current.pass + 1} of {array.length - 1}
          </div>
          <div style={{
            fontSize: 13, color: current.done ? '#10b981' : '#94a3b8', fontWeight: 700,
          }}>
            {current.done ? '✅ Sorted!' : current.swapping ? '💚 Swapping...' : '🟡 Comparing...'}
          </div>
        </div>

        <BarChart
          array={current.array}
          comparing={current.comparing}
          swapping={current.swapping}
          sortedFrom={current.sortedFrom}
          maxVal={100}
          height={200}
        />

        {/* Step progress bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{
            height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${(stepIdx / (steps.length - 1)) * 100}%` }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: 2 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#475569' }}>
            <span>Step {stepIdx + 1}</span>
            <span>{steps.length} total steps</span>
          </div>
        </div>
      </div>

      {/* Live counters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Comparisons', val: currentComparisons, total: totalComparisons, color: C.yellow, icon: '🔍' },
          { label: 'Swaps', val: currentSwaps, total: totalSwaps, color: C.green, icon: '🔀' },
          { label: 'Current Pass', val: current.pass + 1, total: array.length - 1, color: C.purple, icon: '🔄' },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1, minWidth: 120,
            background: `${stat.color}10`,
            border: `1.5px solid ${stat.color}33`,
            borderRadius: 14, padding: '14px 18px',
          }}>
            <div style={{ fontSize: 11, color: stat.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              {stat.icon} {stat.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>
              {stat.val}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>of {stat.total} total</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {mode === 'step' ? (
          <>
            <button
              onClick={handlePrev}
              disabled={stepIdx === 0}
              style={{
                padding: '10px 22px', borderRadius: 24,
                background: stepIdx === 0 ? '#1e293b' : '#1e293b',
                border: `1.5px solid ${stepIdx === 0 ? '#334155' : '#475569'}`,
                color: stepIdx === 0 ? '#475569' : '#94a3b8',
                fontWeight: 700, fontSize: 15, cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ◀ Prev
            </button>
            <button
              onClick={handleNext}
              disabled={current.done}
              style={{
                padding: '10px 28px', borderRadius: 24,
                background: current.done ? '#1e293b' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none',
                color: current.done ? '#475569' : '#fff',
                fontWeight: 700, fontSize: 15, cursor: current.done ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Next Step →
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              if (current.done) handleReset()
              setPlaying(p => !p)
            }}
            style={{
              padding: '10px 28px', borderRadius: 24,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', color: '#fff',
              fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {playing ? '⏸ Pause' : current.done ? '↺ Replay' : '▶ Play'}
          </button>
        )}
        <button
          onClick={handleReset}
          style={{
            padding: '10px 20px', borderRadius: 24,
            background: 'transparent',
            border: '1.5px solid var(--border)',
            color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ↺ Reset
        </button>
        <button
          onClick={handleShuffle}
          style={{
            padding: '10px 20px', borderRadius: 24,
            background: 'transparent',
            border: '1.5px solid var(--border)',
            color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          🔀 New Array
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
        {[
          { color: C.yellow, label: 'Comparing' },
          { color: C.green, label: 'Swapping' },
          { color: C.blue, label: 'Sorted' },
          { color: BAR_PALETTE[0], label: 'Unsorted' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>

      <NeuronTip type="tip">
        Notice how after each full pass, the right side (blue) grows by 1. The sorted portion expands like a wave from right to left!
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 3 — Why It's Called 'Bubble'
================================================================ */
function Section3BubbleMetaphor() {
  const [animating, setAnimating] = useState(false)
  const [passNum, setPassNum] = useState(0)
  const arr = [42, 71, 15, 88, 33, 60]
  const [display, setDisplay] = useState([...arr])
  const [bubblePos, setBubblePos] = useState(null)
  const [maxIdx, setMaxIdx] = useState(null)
  const timerRef = useRef(null)

  const runPass = useCallback(() => {
    if (animating) return
    setAnimating(true)
    const a = [...display]
    let j = 0
    const n = a.length - passNum

    const step = () => {
      if (j >= n - 1) {
        setBubblePos(null)
        setMaxIdx(n - 1 - passNum)
        setPassNum(p => p + 1)
        setDisplay([...a])
        setAnimating(false)
        return
      }
      setBubblePos(j)
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        setDisplay([...a])
      }
      j++
      timerRef.current = setTimeout(step, 500)
    }
    timerRef.current = setTimeout(step, 300)
  }, [animating, display, passNum])

  const resetAll = () => {
    clearTimeout(timerRef.current)
    setDisplay([...arr])
    setPassNum(0)
    setBubblePos(null)
    setMaxIdx(null)
    setAnimating(false)
  }

  const maxVal = Math.max(...display)
  const maxCurrentIdx = display.indexOf(Math.max(...display.slice(0, display.length - passNum)))

  return (
    <SectionBlock icon="🫧" title='Why Is It Called "Bubble" Sort?' color={C.cyan}>
      <Neuron
        mood="excited"
        message='In each pass, the LARGEST unsorted element "bubbles up" to its correct position — just like a bubble rises to the top of water!'
        size="medium"
        style={{ marginBottom: 24 }}
      />

      {/* Water tank metaphor */}
      <div style={{
        background: 'linear-gradient(180deg, #0ea5e920 0%, #0ea5e940 100%)',
        border: '2px solid #06b6d466',
        borderRadius: 20, padding: '24px',
        marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        {/* Water ripple background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          background: 'repeating-linear-gradient(0deg, #06b6d4 0px, transparent 2px, transparent 20px)',
        }} />

        <div style={{ fontSize: 14, color: C.cyan, fontWeight: 700, marginBottom: 20, textAlign: 'center', position: 'relative' }}>
          Pass #{passNum + 1} — Watch the largest bubble rise!
        </div>

        {/* Bar chart with water bubble animation */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, height: 200, position: 'relative' }}>
          {display.map((val, i) => {
            const isSorted = i >= display.length - passNum
            const isActive = i === bubblePos || i === bubblePos + 1
            const isMax = i === maxCurrentIdx && !isSorted
            const barH = Math.max(24, Math.floor((val / 95) * 170))

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Bubble indicator above max element */}
                <AnimatePresence>
                  {isMax && animating && (
                    <motion.div
                      key={`bubble-${i}`}
                      initial={{ y: 0, opacity: 0 }}
                      animate={{ y: [-5, -15, -5], opacity: [0, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, #ffffff99, #06b6d488)',
                        border: '1.5px solid #06b6d4',
                        boxShadow: '0 0 12px #06b6d466',
                        marginBottom: 4,
                      }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                  style={{
                    width: 56,
                    height: barH,
                    background: isSorted
                      ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)'
                      : isActive
                      ? 'linear-gradient(180deg, #fbbf24, #f59e0b)'
                      : isMax
                      ? 'linear-gradient(180deg, #06b6d4, #0284c7)'
                      : 'linear-gradient(180deg, #8b5cf6, #7c3aed)',
                    borderRadius: '6px 6px 3px 3px',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                    paddingTop: 6,
                    boxShadow: isMax && animating ? `0 0 20px ${C.cyan}88` : 'none',
                    transition: 'background 0.3s',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {val}
                  </span>
                </motion.div>

                {/* Position label */}
                <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                  [{i}]
                </span>
              </div>
            )
          })}
        </div>

        {/* Explanation below bars */}
        <AnimatePresence>
          {bubblePos !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 16, textAlign: 'center',
                fontSize: 14, color: C.yellow, fontWeight: 700,
              }}
            >
              Comparing index {bubblePos} ({display[bubblePos]}) and {bubblePos + 1} ({display[bubblePos + 1]})
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: '#fef3c720', border: '1.5px solid #fbbf2444',
          borderRadius: 14, padding: '16px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 8 }}>Each Pass Does:</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Moves the <strong>largest unsorted element</strong> to its correct position at the end — like the heaviest bubble rising fastest.
          </div>
        </div>
        <div style={{
          background: '#eff6ff20', border: '1.5px solid #3b82f644',
          borderRadius: 14, padding: '16px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 8 }}>After n-1 Passes:</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            All elements have bubbled to their correct spots. The array is fully sorted!
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={runPass}
          disabled={animating || passNum >= display.length - 1}
          style={{
            padding: '11px 28px', borderRadius: 24,
            background: animating || passNum >= display.length - 1
              ? '#1e293b'
              : 'linear-gradient(135deg, #06b6d4, #0284c7)',
            color: animating || passNum >= display.length - 1 ? '#475569' : '#fff',
            border: 'none', fontWeight: 700, fontSize: 15,
            cursor: animating || passNum >= display.length - 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {animating ? '🫧 Bubbling...' : passNum >= display.length - 1 ? '✅ Done!' : `▶ Run Pass #${passNum + 1}`}
        </button>
        <button
          onClick={resetAll}
          style={{
            padding: '11px 22px', borderRadius: 24,
            background: 'transparent', border: '1.5px solid var(--border)',
            color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ↺ Reset
        </button>
      </div>

      <NeuronTip type="fun">
        The name "Bubble Sort" comes from the way large values bubble up toward the end, like air bubbles in water rise to the surface!
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 4 — Try It Yourself (Be the Algorithm)
================================================================ */
function Section4TryYourself() {
  const [baseArr] = useState(() => randomArray(6, 60, 10))
  const [arr, setArr] = useState([...baseArr])
  const [selected, setSelected] = useState([])
  const [pass, setPass] = useState(0)
  const [j, setJ] = useState(0)
  const [swapsThisPass, setSwapsThisPass] = useState(0)
  const [passComplete, setPassComplete] = useState(false)
  const [completedPasses, setCompletedPasses] = useState(0)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [highlightCorrect, setHighlightCorrect] = useState(null)

  const correctPair = [j, j + 1]

  const handleBarClick = (idx) => {
    if (done || passComplete) return
    if (selected.length === 0) {
      setSelected([idx])
      return
    }
    if (selected.length === 1) {
      const pair = [Math.min(selected[0], idx), Math.max(selected[0], idx)].sort((a, b) => a - b)
      setSelected([])

      if (pair[0] === correctPair[0] && pair[1] === correctPair[1]) {
        // Correct pair
        setFeedback({ type: 'correct', msg: arr[pair[0]] > arr[pair[1]] ? `Correct! ${arr[pair[0]]} > ${arr[pair[1]]} → SWAP!` : `Correct! ${arr[pair[0]]} ≤ ${arr[pair[1]]} → No swap needed.` })
        const newArr = [...arr]
        let swapped = false
        if (newArr[pair[0]] > newArr[pair[1]]) {
          ;[newArr[pair[0]], newArr[pair[1]]] = [newArr[pair[1]], newArr[pair[0]]]
          swapped = true
          setSwapsThisPass(s => s + 1)
        }
        setArr(newArr)

        setTimeout(() => {
          setFeedback(null)
          const nextJ = j + 1
          if (nextJ >= arr.length - 1 - pass) {
            setPassComplete(true)
          } else {
            setJ(nextJ)
          }
        }, 1200)
      } else {
        // Wrong pair
        setHighlightCorrect(correctPair)
        setFeedback({ type: 'wrong', msg: `Not quite! For pass ${pass + 1}, you should compare index ${correctPair[0]} (${arr[correctPair[0]]}) and ${correctPair[1]} (${arr[correctPair[1]]}).` })
        setTimeout(() => {
          setFeedback(null)
          setHighlightCorrect(null)
        }, 2000)
      }
    }
  }

  const handleNextPass = () => {
    const newPass = pass + 1
    if (newPass >= arr.length - 1) {
      setDone(true)
    } else {
      setPass(newPass)
      setJ(0)
      setSwapsThisPass(0)
      setPassComplete(false)
      setCompletedPasses(p => p + 1)
    }
  }

  const handleRestart = () => {
    const newArr = randomArray(6, 60, 10)
    setArr(newArr)
    setSelected([])
    setPass(0)
    setJ(0)
    setSwapsThisPass(0)
    setPassComplete(false)
    setCompletedPasses(0)
    setDone(false)
    setFeedback(null)
    setHighlightCorrect(null)
  }

  return (
    <SectionBlock icon="🎮" title="Try It Yourself — Be the Algorithm!" color={C.green}>
      <Neuron
        mood="waving"
        message="Now YOU are the sorting algorithm! Click the two bars you want to compare. If they're in the wrong order, they'll swap. Follow bubble sort's rule: always compare the current pair!"
        size="medium"
        style={{ marginBottom: 24 }}
      />

      <InteractiveDemo
        title="Be the Bubble Sort Algorithm"
        instruction={done
          ? "Congratulations! You sorted the array!"
          : passComplete
          ? `Pass ${pass + 1} complete! Click "Next Pass" to continue.`
          : `Pass ${pass + 1}: Click bars at index ${j} and ${j + 1} to compare them.`
        }
      >
        {/* Completed passes indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Array.from({ length: arr.length - 1 }, (_, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: 8,
              background: i < completedPasses
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : i === pass && passComplete
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : i === pass
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : '#1e293b',
              border: i === pass ? '2px solid #fbbf24' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: 'white',
            }}>
              {i < completedPasses || (i === pass && passComplete) ? '✓' : i + 1}
            </div>
          ))}
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center', marginLeft: 4 }}>
            passes
          </div>
        </div>

        {/* Interactive bar chart */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          borderRadius: 16, padding: '24px 20px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
            {arr.map((val, i) => {
              const isSorted = i >= arr.length - pass - (passComplete ? 1 : 0)
              const isSelected = selected.includes(i)
              const isCorrectHint = highlightCorrect?.includes(i)
              const isCurrentTarget = !done && !passComplete && (i === j || i === j + 1)
              const barH = Math.max(30, Math.floor((val / 70) * 160))

              let bg = BAR_PALETTE[i % BAR_PALETTE.length]
              let shadow = 'none'
              let borderC = 'transparent'
              let cursor = 'pointer'

              if (isSorted) { bg = C.blue; cursor = 'default' }
              if (isCurrentTarget) { shadow = `0 0 16px ${C.yellow}88` }
              if (isSelected) { bg = C.yellow; shadow = `0 0 20px ${C.yellow}bb`; borderC = C.yellow }
              if (isCorrectHint) { bg = C.orange; shadow = `0 0 20px ${C.orange}bb`; borderC = C.orange }
              if (done) cursor = 'default'

              return (
                <div
                  key={i}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  {/* Target arrow */}
                  {isCurrentTarget && !done && !passComplete && (
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ fontSize: 14, color: C.yellow }}
                    >
                      ▼
                    </motion.div>
                  )}
                  {!isCurrentTarget && <div style={{ height: 22 }} />}

                  <motion.div
                    whileHover={!isSorted && !done ? { scale: 1.06 } : {}}
                    whileTap={!isSorted && !done ? { scale: 0.95 } : {}}
                    onClick={() => handleBarClick(i)}
                    layout
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    style={{
                      width: 52, height: barH,
                      background: bg,
                      borderRadius: '8px 8px 4px 4px',
                      border: `2.5px solid ${borderC}`,
                      boxShadow: shadow,
                      display: 'flex', alignItems: 'flex-start',
                      justifyContent: 'center', paddingTop: 6,
                      cursor,
                      transition: 'background 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                      {val}
                    </span>
                  </motion.div>
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>[{i}]</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback area */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '14px 20px', borderRadius: 12, marginBottom: 16,
                background: feedback.type === 'correct'
                  ? 'linear-gradient(135deg, #d1fae5, #ecfdf5)'
                  : 'linear-gradient(135deg, #fee2e2, #fef2f2)',
                border: `2px solid ${feedback.type === 'correct' ? C.green : C.red}`,
                color: feedback.type === 'correct' ? '#065f46' : '#991b1b',
                fontWeight: 700, fontSize: 15,
              }}
            >
              {feedback.type === 'correct' ? '✅ ' : '❌ '}{feedback.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {passComplete && !done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{
              padding: '14px 20px', borderRadius: 12, marginBottom: 16,
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: `2px solid ${C.blue}`,
              color: '#1d4ed8', fontWeight: 700, fontSize: 15,
            }}>
              ✅ Pass {pass + 1} complete! Made {swapsThisPass} swap{swapsThisPass !== 1 ? 's' : ''}.
              {swapsThisPass === 0 ? ' No swaps — the array was already sorted for this pass!' : ''}
            </div>
            <button
              onClick={handleNextPass}
              style={{
                padding: '11px 28px', borderRadius: 24,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff', border: 'none', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', fontFamily: 'inherit', marginRight: 10,
              }}
            >
              Next Pass →
            </button>
          </motion.div>
        )}

        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '20px', borderRadius: 16,
              background: 'linear-gradient(135deg, #d1fae5, #ecfdf5)',
              border: `2px solid ${C.green}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
              You sorted the array!
            </div>
            <div style={{ fontSize: 14, color: '#047857', marginBottom: 16 }}>
              You just manually ran Bubble Sort. That's exactly what the algorithm does!
            </div>
            <button
              onClick={handleRestart}
              style={{
                padding: '10px 24px', borderRadius: 24,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Try Another Array
            </button>
          </motion.div>
        )}

        {!passComplete && !done && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            Hint: Click the bar at index <strong style={{ color: C.yellow }}>{j}</strong> and index <strong style={{ color: C.yellow }}>{j + 1}</strong>
          </div>
        )}
      </InteractiveDemo>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 5 — O(n²) Problem
================================================================ */
function Section5Complexity() {
  const sizes = [5, 10, 20, 50]
  const [results, setResults] = useState({})
  const [running, setRunning] = useState(null)
  const [showGraph, setShowGraph] = useState(false)

  function bubbleSortCount(n) {
    let ops = 0
    const arr = Array.from({ length: n }, (_, i) => n - i) // worst case
    for (let pass = 0; pass < n - 1; pass++) {
      for (let j = 0; j < n - 1 - pass; j++) {
        ops++
        if (arr[j] > arr[j + 1]) {
          ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        }
      }
    }
    return ops
  }

  const runForSize = (size) => {
    setRunning(size)
    const start = performance.now()
    const ops = bubbleSortCount(size)
    const time = performance.now() - start
    setTimeout(() => {
      setResults(r => ({ ...r, [size]: { ops, time: time.toFixed(3) } }))
      setRunning(null)
      if (Object.keys(results).length >= sizes.length - 1) setShowGraph(true)
    }, 300)
  }

  const maxOps = Math.max(...Object.values(results).map(r => r.ops), 1)

  const extrapolated = [
    { n: 100, ops: 4950 },
    { n: 500, ops: 124750 },
    { n: 1000, ops: 499500 },
  ]

  return (
    <SectionBlock icon="📈" title="The O(n²) Problem" color={C.red}>
      <Neuron
        mood="thinking"
        message="Bubble Sort works... but does it scale? Let's run it on different array sizes and see what happens. The results might shock you!"
        size="medium"
        style={{ marginBottom: 24 }}
      />

      {/* Size runner cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
        {sizes.map(size => {
          const res = results[size]
          const isRunning = running === size
          return (
            <motion.div
              key={size}
              whileHover={{ scale: 1.02 }}
              style={{
                background: res
                  ? 'linear-gradient(135deg, #fef3c7, #fff7ed)'
                  : 'var(--bg-main)',
                border: `2px solid ${res ? C.orange + '88' : 'var(--border)'}`,
                borderRadius: 16, padding: '20px',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: C.orange, fontFamily: 'var(--font-heading)' }}>
                n = {size}
              </div>
              {res ? (
                <>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.red, marginTop: 6 }}>
                    {res.ops.toLocaleString()} ops
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    ~{res.time}ms
                  </div>
                  {/* Mini bar */}
                  <div style={{
                    marginTop: 10, height: 6, background: '#fde68a',
                    borderRadius: 3, overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(res.ops / (50 * 50)) * 100}%` }}
                      style={{ height: '100%', background: C.red, borderRadius: 3 }}
                    />
                  </div>
                </>
              ) : (
                <button
                  onClick={() => runForSize(size)}
                  disabled={!!running}
                  style={{
                    marginTop: 10, padding: '8px 20px', borderRadius: 20,
                    background: isRunning ? '#1e293b' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    color: isRunning ? '#475569' : '#fff',
                    border: 'none', fontWeight: 700, fontSize: 14,
                    cursor: isRunning ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isRunning ? '⏳ Running...' : '▶ Sort It!'}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Graph */}
      <AnimatePresence>
        {Object.keys(results).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              borderRadius: 18, padding: '24px',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 700, marginBottom: 16 }}>
              Operations vs Array Size
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 140 }}>
              {sizes.map(s => {
                const res = results[s]
                if (!res) return (
                  <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ height: 120, width: '100%', background: '#1e293b', borderRadius: 6 }} />
                    <span style={{ fontSize: 12, color: '#475569' }}>n={s}</span>
                  </div>
                )
                const h = Math.max(10, Math.floor((res.ops / maxOps) * 120))
                return (
                  <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 11, color: C.orange, fontWeight: 700 }}>{res.ops}</div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      style={{
                        width: '100%',
                        background: `linear-gradient(180deg, ${C.red}, ${C.orange})`,
                        borderRadius: '4px 4px 2px 2px',
                        minHeight: 4,
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#475569' }}>n={s}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: '#f87171', fontWeight: 600, textAlign: 'center' }}>
              The curve is QUADRATIC — doubling n makes it 4x worse!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extrapolation table */}
      <div style={{
        background: '#fef2f2', border: '2px solid #fecaca',
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
      }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#991b1b', marginBottom: 14 }}>
          What happens at larger sizes? (theoretical worst case)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {extrapolated.map(({ n, ops }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 80, fontWeight: 800, fontSize: 16, color: '#dc2626',
              }}>n = {n}</div>
              <div style={{ flex: 1, height: 8, background: '#fecaca', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, (ops / 500000) * 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ height: '100%', background: '#ef4444', borderRadius: 4 }}
                />
              </div>
              <div style={{ width: 100, fontWeight: 700, fontSize: 14, color: '#b91c1c', textAlign: 'right' }}>
                {ops.toLocaleString()} ops
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#fee2e2', borderRadius: 10, fontSize: 14, color: '#7f1d1d', fontWeight: 600 }}>
          At n=1,000: ~500,000 operations. At n=10,000: ~50 MILLION operations!
          Bubble Sort is O(n²) — not suitable for large datasets.
        </div>
      </div>

      <NeuronTip type="deep">
        O(n²) means: if you double the input size, the work quadruples. For n=10 it takes ~45 steps. For n=100, it takes ~4,950. For n=1,000... ~500,000. This is why we need faster algorithms like Merge Sort O(n log n).
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 6 — Optimized Bubble Sort
================================================================ */
function Section6Optimized() {
  const SORTED_ARR = [11, 22, 33, 44, 55, 66, 77, 88]
  const UNSORTED_ARR = [55, 22, 88, 11, 66, 33, 77, 44]

  const [mode, setMode] = useState(null) // 'optimized' | 'unoptimized'
  const [optSteps, setOptSteps] = useState([])
  const [unoptSteps, setUnoptSteps] = useState([])
  const [optIdx, setOptIdx] = useState(0)
  const [unoptIdx, setUnoptIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef = useRef(null)

  function computeUnoptimizedSteps(arr) {
    const steps = []
    const a = [...arr]
    const n = a.length
    for (let pass = 0; pass < n - 1; pass++) {
      for (let j = 0; j < n - 1 - pass; j++) {
        steps.push({ array: [...a], comparing: [j, j + 1], pass, earlyExit: false })
        if (a[j] > a[j + 1]) {
          ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
          steps.push({ array: [...a], comparing: [j, j + 1], pass, swapping: true, earlyExit: false })
        }
      }
    }
    steps.push({ array: [...a], done: true, totalPasses: n - 1, earlyExit: false, comparing: [] })
    return steps
  }

  const handleRunComparison = (inputArr) => {
    const opt = computeOptimizedSteps(inputArr)
    const unopt = computeUnoptimizedSteps(inputArr)
    setOptSteps(opt)
    setUnoptSteps(unopt)
    setOptIdx(0)
    setUnoptIdx(0)
    setRunning(true)

    let oi = 0, ui = 0
    const tick = () => {
      const optDone = oi >= opt.length - 1
      const unoptDone = ui >= unopt.length - 1
      if (optDone && unoptDone) { setRunning(false); return }

      if (!optDone) { oi++; setOptIdx(oi) }
      if (!unoptDone) { ui++; setUnoptIdx(ui) }

      timerRef.current = setTimeout(tick, 180)
    }
    timerRef.current = setTimeout(tick, 200)
  }

  const optCurrent = optSteps[optIdx]
  const unoptCurrent = unoptSteps[unoptIdx]

  const optTotalPasses = optCurrent?.earlyExit ? optCurrent.pass + 1 : (optSteps.find(s => s.done)?.pass ?? '?')
  const unoptTotalPasses = unoptSteps.find(s => s.done)?.totalPasses ?? '?'

  return (
    <SectionBlock icon="⚡" title="Optimized Bubble Sort — Early Exit" color={C.green}>
      <Neuron
        mood="excited"
        message="Here's the key insight: if you complete a full pass WITHOUT any swaps, the array is already sorted! No need to continue. This 'early exit' makes Bubble Sort much faster on nearly-sorted data!"
        size="medium"
        style={{ marginBottom: 24 }}
      />

      {/* The early exit flag concept */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf520, #d1fae520)',
        border: '2px solid #10b98133',
        borderRadius: 18, padding: '24px',
        marginBottom: 24,
      }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.green, marginBottom: 16 }}>
          The "Swapped" Flag Trick:
        </div>
        <div style={{
          background: '#0f172a', borderRadius: 12, padding: '16px 20px',
          fontFamily: 'monospace', fontSize: 14, color: '#e2e8f0',
          lineHeight: 1.8, marginBottom: 16,
        }}>
          <div><span style={{ color: '#94a3b8' }}>// Standard bubble sort</span></div>
          <div><span style={{ color: '#60a5fa' }}>for</span> (pass = 0; pass &lt; n; pass++) &#123;</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: '#a78bfa' }}>let</span> <span style={{ color: '#34d399' }}>swapped = false</span>;</div>
          <div style={{ paddingLeft: 20 }}>// ... compare and swap ...</div>
          <div style={{ paddingLeft: 20 }}>if (swapped) swapped = true;</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: '#f87171' }}>if (!swapped) <strong>break</strong>;</span> <span style={{ color: '#94a3b8' }}>// ← EARLY EXIT!</span></div>
          <div>&#125;</div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 180,
            background: '#ecfdf5', border: '1.5px solid #10b981',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontWeight: 700, color: '#065f46', fontSize: 13, marginBottom: 6 }}>✅ Optimized</div>
            <div style={{ fontSize: 14, color: '#047857', lineHeight: 1.7 }}>
              On an already-sorted array: only 1 pass needed (n-1 comparisons). Detects it's done immediately!
            </div>
          </div>
          <div style={{
            flex: 1, minWidth: 180,
            background: '#fef2f2', border: '1.5px solid #ef4444',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 13, marginBottom: 6 }}>❌ Unoptimized</div>
            <div style={{ fontSize: 14, color: '#b91c1c', lineHeight: 1.7 }}>
              On an already-sorted array: still runs n-1 full passes! Wastes time doing unnecessary work.
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <InteractiveDemo title="Optimized vs Unoptimized — Head to Head" instruction="Pick an array to sort and watch both algorithms race!">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setMode('sorted'); handleRunComparison(SORTED_ARR) }}
            disabled={running}
            style={{
              padding: '10px 22px', borderRadius: 24,
              background: running ? '#1e293b' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: running ? '#475569' : '#fff',
              border: 'none', fontWeight: 700, fontSize: 14,
              cursor: running ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            Run on Sorted Array
          </button>
          <button
            onClick={() => { setMode('unsorted'); handleRunComparison(UNSORTED_ARR) }}
            disabled={running}
            style={{
              padding: '10px 22px', borderRadius: 24,
              background: running ? '#1e293b' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: running ? '#475569' : '#fff',
              border: 'none', fontWeight: 700, fontSize: 14,
              cursor: running ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            Run on Unsorted Array
          </button>
        </div>

        {optSteps.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Optimized */}
            <div style={{
              background: '#0f172a', borderRadius: 14, padding: '16px',
              border: '2px solid #10b98133',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ⚡ Optimized (Early Exit)
              </div>
              {optCurrent && (
                <BarChart
                  array={optCurrent.array || SORTED_ARR}
                  comparing={optCurrent.comparing || []}
                  swapping={optCurrent.swapping}
                  maxVal={100}
                  height={130}
                  showValues={true}
                />
              )}
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>
                  Step {optIdx + 1}/{optSteps.length}
                </div>
                {optCurrent?.earlyExit && (
                  <div style={{
                    background: '#10b98120', border: '1px solid #10b981',
                    borderRadius: 6, padding: '2px 8px',
                    fontSize: 11, color: C.green, fontWeight: 700,
                  }}>
                    🚀 EARLY EXIT after pass {(optCurrent.pass || 0) + 1}!
                  </div>
                )}
                {optCurrent?.done && !optCurrent.earlyExit && (
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>✅ Done in {optTotalPasses} pass(es)</div>
                )}
              </div>
            </div>

            {/* Unoptimized */}
            <div style={{
              background: '#0f172a', borderRadius: 14, padding: '16px',
              border: '2px solid #ef444433',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ❌ Unoptimized (No Early Exit)
              </div>
              {unoptCurrent && (
                <BarChart
                  array={unoptCurrent.array || SORTED_ARR}
                  comparing={unoptCurrent.comparing || []}
                  swapping={unoptCurrent.swapping}
                  maxVal={100}
                  height={130}
                  showValues={true}
                />
              )}
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>
                  Step {unoptIdx + 1}/{unoptSteps.length}
                </div>
                {unoptCurrent?.done && (
                  <div style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>✅ Done in {unoptTotalPasses} pass(es)</div>
                )}
              </div>
            </div>
          </div>
        )}

        {optSteps.length > 0 && optCurrent?.done && unoptCurrent?.done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: '16px 20px', borderRadius: 14,
              background: mode === 'sorted'
                ? 'linear-gradient(135deg, #d1fae5, #ecfdf5)'
                : 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
              border: `2px solid ${mode === 'sorted' ? C.green : C.blue}`,
            }}
          >
            {mode === 'sorted' ? (
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: 15 }}>
                On a sorted array: Optimized used {optSteps.length} steps vs {unoptSteps.length} steps for Unoptimized.
                That's <strong>{Math.round(unoptSteps.length / optSteps.length)}x faster</strong>!
              </div>
            ) : (
              <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 15 }}>
                On an unsorted array, both are similar. The optimization mainly helps when the array is already (nearly) sorted.
              </div>
            )}
          </motion.div>
        )}
      </InteractiveDemo>

      <NeuronTip type="tip">
        Optimized Bubble Sort has best-case complexity O(n) — it can detect a sorted array in just one pass! The worst case remains O(n²).
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */
function Section7Hindi() {
  return (
    <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी सारांश" color="#ff9933">
      <Neuron
        mood="waving"
        message="Let's recap Bubble Sort in Hindi! Understanding in your native language makes concepts stick better."
        size="medium"
        style={{ marginBottom: 24 }}
      />

      <HindiExplainer
        concept="बबल सॉर्ट (Bubble Sort)"
        english="Bubble Sort Algorithm"
        explanation={`
          बबल सॉर्ट सबसे सरल sorting algorithm है। इसमें हम array के दो पड़ोसी elements को compare करते हैं और अगर वे गलत क्रम (order) में हों तो उनकी अदला-बदली (swap) कर देते हैं।

          एक पूरे "चरण" (pass) में सबसे बड़ा element अंत में पहुँच जाता है — ठीक जैसे पानी में बुलबुला (bubble) ऊपर उठता है। इसीलिए इसे "Bubble Sort" कहते हैं।

          इसे n-1 बार दोहराना पड़ता है जब तक पूरा array sort न हो जाए।
        `}
        example={`
          मान लो कक्षा में बच्चे height के हिसाब से line में लगने हैं।
          आप पास-पास खड़े दो बच्चों को देखते हो — अगर लंबा बच्चा छोटे से पहले खड़ा है, तो उन्हें swap करो।
          यही Bubble Sort है!

          हर round (pass) में सबसे लंबा बच्चा automatically line के अंत में पहुँच जाता है।
        `}
        terms={[
          { hindi: 'बबल सॉर्ट', english: 'Bubble Sort', meaning: 'elements को बुलबुले की तरह ऊपर उठाकर sort करने की विधि' },
          { hindi: 'अदला-बदली', english: 'Swap', meaning: 'दो elements की positions को बदलना' },
          { hindi: 'तुलना', english: 'Comparison', meaning: 'दो elements को देखना कि कौन बड़ा है' },
          { hindi: 'चरण', english: 'Pass', meaning: 'array पर एक बार पूरी तरह से जाना' },
          { hindi: 'समय जटिलता', english: 'Time Complexity', meaning: 'algorithm को कितना समय लगता है — O(n²)' },
          { hindi: 'जल्दी बाहर', english: 'Early Exit', meaning: 'अगर एक pass में कोई swap न हो, तो रुक जाओ' },
        ]}
      />

      {/* Key takeaways */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '✅', text: 'Simple to understand and implement — great first sorting algorithm', color: C.green },
          { icon: '⚡', text: 'Best case O(n) with early exit optimization on sorted arrays', color: C.cyan },
          { icon: '❌', text: 'Worst and average case O(n²) — too slow for large datasets', color: C.red },
          { icon: '💡', text: 'Good for: small arrays, nearly-sorted data, teaching purposes', color: C.blue },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 18px', borderRadius: 12,
              background: `${item.color}10`,
              border: `1.5px solid ${item.color}30`,
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.5 }}>
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic4Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 4px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)',
          borderRadius: 24, padding: '40px 40px 32px',
          marginBottom: 36, position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background bubbles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -(60 + i * 20), 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + i * 0.7,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              bottom: -20,
              left: `${10 + i * 15}%`,
              width: 12 + i * 4,
              height: 12 + i * 4,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3), rgba(99,102,241,0.2))',
              border: '1.5px solid rgba(165,180,252,0.3)',
              pointerEvents: 'none',
            }}
          />
        ))}

        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#6366f120', border: '1px solid #6366f166',
            borderRadius: 20, padding: '4px 14px', marginBottom: 16,
            fontSize: 12, color: '#a5b4fc', fontWeight: 700, letterSpacing: 1,
          }}>
            TOPIC 4 — SORTING ALGORITHMS
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 900,
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: '0 0 12px 0', lineHeight: 1.1,
          }}>
            Bubble Sort
          </h1>

          <p style={{ fontSize: 17, color: '#94a3b8', margin: 0, lineHeight: 1.6, maxWidth: 540 }}>
            The simplest sort — watch elements bubble up to their correct position.
            Visualize every comparison, every swap, every pass.
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Best Case', val: 'O(n)', color: C.green },
              { label: 'Avg / Worst', val: 'O(n²)', color: C.red },
              { label: 'Space', val: 'O(1)', color: C.cyan },
              { label: 'Stable?', val: 'Yes ✓', color: C.purple },
            ].map(stat => (
              <div key={stat.label} style={{
                background: `${stat.color}18`, border: `1.5px solid ${stat.color}44`,
                borderRadius: 12, padding: '8px 16px',
              }}>
                <div style={{ fontSize: 11, color: `${stat.color}cc`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-heading)' }}>
                  {stat.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <Section1TheProblem />
      <Section2Visualizer />
      <Section3BubbleMetaphor />
      <Section4TryYourself />
      <Section5Complexity />
      <Section6Optimized />
      <Section7Hindi />
    </div>
  )
}
