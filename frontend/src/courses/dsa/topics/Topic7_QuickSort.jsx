import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

// ─── colour palette ──────────────────────────────────────────────────────────
const C = {
  pivot:   '#f59e0b',
  left:    '#10b981',
  right:   '#6366f1',
  sorted:  '#22c55e',
  compare: '#ec4899',
  ptr_i:   '#3b82f6',
  ptr_j:   '#f97316',
  neutral: '#64748b',
  bg:      'var(--bg-card)',
  border:  'var(--border)',
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Section 1 : Partition Idea (teacher-student drag) ───────────────────────
const STUDENTS = [
  { id: 0, height: 140, name: 'Ananya', emoji: '👧' },
  { id: 1, height: 175, name: 'Rahul',  emoji: '👦' },
  { id: 2, height: 158, name: 'Priya',  emoji: '👩' },
  { id: 3, height: 190, name: 'Dev',    emoji: '🧑' },
  { id: 4, height: 130, name: 'Meera',  emoji: '👧' },
  { id: 5, height: 165, name: 'Arjun',  emoji: '👦' },
  { id: 6, height: 148, name: 'Sneha',  emoji: '👩' },
  { id: 7, height: 182, name: 'Karan',  emoji: '🧑' },
  { id: 8, height: 135, name: 'Divya',  emoji: '👧' },
  { id: 9, height: 172, name: 'Rohan',  emoji: '👦' },
]
const PIVOT_HEIGHT = 160

function PartitionDemo() {
  const [left, setLeft]     = useState([])
  const [right, setRight]   = useState([])
  const [queue, setQueue]   = useState([...STUDENTS])
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState(null)

  function place(student, side) {
    const correct = side === (student.height < PIVOT_HEIGHT ? 'left' : 'right')
    if (!correct) {
      setError(`${student.name} is ${student.height} cm — ${student.height < PIVOT_HEIGHT ? 'shorter' : 'taller'} than the pivot (${PIVOT_HEIGHT} cm)! Try the other side.`)
      return
    }
    setError(null)
    if (side === 'left') setLeft(p => [...p, student])
    else                 setRight(p => [...p, student])
    setQueue(q => {
      const next = q.filter(s => s.id !== student.id)
      if (next.length === 0) setDone(true)
      return next
    })
  }

  function reset() {
    setLeft([]); setRight([]); setQueue([...STUDENTS]); setDone(false); setError(null)
  }

  const card = (s, clickable = false) => (
    <motion.div
      key={s.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        background: 'white',
        border: `2px solid ${C.neutral}33`,
        borderRadius: 14,
        padding: '10px 14px',
        textAlign: 'center',
        cursor: clickable ? 'default' : 'pointer',
        minWidth: 76,
        boxShadow: '0 2px 8px #0001',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: 28 }}>{s.emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{s.name}</div>
      <div style={{ fontSize: 12, color: C.neutral, fontWeight: 600 }}>{s.height} cm</div>
      {clickable && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => place(s, 'left')}
            style={{ padding: '4px 10px', background: C.left, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            ← Left
          </motion.button>
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => place(s, 'right')}
            style={{ padding: '4px 10px', background: C.right, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Right →
          </motion.button>
        </div>
      )}
    </motion.div>
  )

  return (
    <div>
      {/* Arena */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'start', marginBottom: 20 }}>
        {/* Left zone */}
        <div style={{ background: `${C.left}12`, border: `2px dashed ${C.left}66`, borderRadius: 18, padding: 16, minHeight: 140 }}>
          <div style={{ fontWeight: 700, color: C.left, marginBottom: 10, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Shorter than {PIVOT_HEIGHT} cm
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <AnimatePresence>{left.map(s => card(s, false))}</AnimatePresence>
          </div>
        </div>

        {/* Pivot teacher */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          style={{
            background: `linear-gradient(135deg, ${C.pivot}, #d97706)`,
            borderRadius: 20, padding: '16px 20px', textAlign: 'center',
            boxShadow: `0 6px 24px ${C.pivot}55`, minWidth: 100, color: 'white',
          }}
        >
          <div style={{ fontSize: 36 }}>👨‍🏫</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Teacher</div>
          <div style={{ fontWeight: 700, fontSize: 14, opacity: 0.85 }}>Pivot</div>
          <div style={{
            marginTop: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 10,
            padding: '4px 8px', fontWeight: 800, fontSize: 16,
          }}>{PIVOT_HEIGHT} cm</div>
          {done && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{ marginTop: 10, fontSize: 22 }}>⭐</motion.div>
          )}
        </motion.div>

        {/* Right zone */}
        <div style={{ background: `${C.right}12`, border: `2px dashed ${C.right}66`, borderRadius: 18, padding: 16, minHeight: 140 }}>
          <div style={{ fontWeight: 700, color: C.right, marginBottom: 10, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Taller than {PIVOT_HEIGHT} cm
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <AnimatePresence>{right.map(s => card(s, false))}</AnimatePresence>
          </div>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: C.neutral, fontSize: 13, marginBottom: 8 }}>
            Students waiting ({queue.length} left) — choose LEFT or RIGHT:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <AnimatePresence>{queue.map(s => card(s, true))}</AnimatePresence>
          </div>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px', color: '#b91c1c', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done state */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', border: '2px solid #34d399', borderRadius: 16, padding: '18px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#065f46' }}>
              The teacher (pivot) is now in their FINAL correct position!
            </div>
            <div style={{ color: '#047857', marginTop: 6, fontSize: 14 }}>
              All {left.length} shorter students are on the left, all {right.length} taller students are on the right.
              That is exactly what partitioning does in Quick Sort!
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
              style={{ marginTop: 14, padding: '10px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section 2 : Full Quick Sort Visualiser ──────────────────────────────────
const INIT_BARS = [
  { val: 7, color: '#6366f1' }, { val: 3, color: '#ec4899' },
  { val: 9, color: '#f59e0b' }, { val: 1, color: '#10b981' },
  { val: 6, color: '#3b82f6' }, { val: 8, color: '#f97316' },
  { val: 2, color: '#8b5cf6' }, { val: 5, color: '#06b6d4' },
  { val: 4, color: '#84cc16' },
]

function QuickSortVisualiser() {
  const [bars, setBars]               = useState(INIT_BARS.map((b, i) => ({ ...b, id: i, state: 'idle' })))
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps]             = useState(0)
  const [speed, setSpeed]             = useState(500)
  const [running, setRunning]         = useState(false)
  const [done, setDone]               = useState(false)
  const [pivotIdx, setPivotIdx]       = useState(null)
  const [iPtr, setIPtr]               = useState(null)
  const [jPtr, setJPtr]               = useState(null)
  const [partitionLine, setPartitionLine] = useState(null)
  const stopRef = useRef(false)
  const barsRef = useRef(bars)

  function syncBars(newBars) {
    barsRef.current = newBars
    setBars([...newBars])
  }

  function resetAll() {
    stopRef.current = true
    setBars(INIT_BARS.map((b, i) => ({ ...b, id: i, state: 'idle' })))
    barsRef.current = INIT_BARS.map((b, i) => ({ ...b, id: i, state: 'idle' }))
    setComparisons(0); setSwaps(0); setRunning(false); setDone(false)
    setPivotIdx(null); setIPtr(null); setJPtr(null); setPartitionLine(null)
  }

  async function partition(arr, low, high, cmpRef, swpRef) {
    if (stopRef.current) return low
    const pivot = arr[high].val
    setPivotIdx(high)
    let i = low - 1
    for (let j = low; j < high; j++) {
      if (stopRef.current) return i + 1
      setJPtr(j); setIPtr(i)
      cmpRef.current++; setComparisons(cmpRef.current)
      // mark comparing
      arr[j].state = 'compare'; arr[high].state = 'pivot'
      syncBars(arr)
      await sleep(speed)
      if (arr[j].val <= pivot) {
        i++
        swpRef.current++; setSwaps(swpRef.current);
        [arr[i], arr[j]] = [arr[j], arr[i]]
        arr[i].state = 'left'; arr[j].state = 'idle'
        syncBars(arr)
        await sleep(speed * 0.6)
      } else {
        arr[j].state = 'idle'
        syncBars(arr)
      }
    }
    // place pivot
    if (stopRef.current) return i + 1
    swpRef.current++; setSwaps(swpRef.current);
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    arr[i + 1].state = 'sorted'
    syncBars(arr)
    setPartitionLine(i + 1)
    setPivotIdx(null); setIPtr(null); setJPtr(null)
    await sleep(speed)
    return i + 1
  }

  async function quickSortAnim(arr, low, high, cmpRef, swpRef) {
    if (low < high && !stopRef.current) {
      const pi = await partition(arr, low, high, cmpRef, swpRef)
      await quickSortAnim(arr, low, pi - 1, cmpRef, swpRef)
      await quickSortAnim(arr, pi + 1, high, cmpRef, swpRef)
    } else if (low === high && !stopRef.current) {
      arr[low].state = 'sorted'
      syncBars(arr)
    }
  }

  async function startSort() {
    if (running) return
    stopRef.current = false
    setRunning(true); setDone(false)
    setComparisons(0); setSwaps(0)
    const arr = barsRef.current.map(b => ({ ...b, state: 'idle' }))
    syncBars(arr)
    const cmpRef = { current: 0 }, swpRef = { current: 0 }
    await quickSortAnim(arr, 0, arr.length - 1, cmpRef, swpRef)
    if (!stopRef.current) {
      const final = barsRef.current.map(b => ({ ...b, state: 'sorted' }))
      syncBars(final); setDone(true)
    }
    setRunning(false)
  }

  const maxVal = Math.max(...bars.map(b => b.val))
  const barColor = (b) => {
    if (b.state === 'sorted') return C.sorted
    if (b.state === 'pivot')  return C.pivot
    if (b.state === 'compare') return C.compare
    if (b.state === 'left') return C.left
    return b.color
  }

  return (
    <div>
      {/* Bar chart */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6, height: 200, marginBottom: 24, padding: '0 8px' }}>
        {bars.map((b, idx) => (
          <div key={b.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Pointer labels */}
            {idx === iPtr && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ position: 'absolute', top: -28, fontSize: 11, fontWeight: 800, color: C.ptr_i, letterSpacing: 0.5 }}>i</motion.div>
            )}
            {idx === jPtr && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ position: 'absolute', top: -40, fontSize: 11, fontWeight: 800, color: C.ptr_j, letterSpacing: 0.5 }}>j</motion.div>
            )}
            {idx === pivotIdx && (
              <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ position: 'absolute', top: -52, fontSize: 16 }}>⭐</motion.div>
            )}
            <motion.div
              layout
              animate={{ height: `${(b.val / maxVal) * 170}px` }}
              transition={{ duration: 0.35 }}
              style={{
                width: '100%', borderRadius: '6px 6px 0 0',
                background: barColor(b),
                boxShadow: b.state === 'pivot' ? `0 0 16px ${C.pivot}` : b.state === 'compare' ? `0 0 10px ${C.compare}` : 'none',
                transition: 'background 0.3s',
                position: 'relative',
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{b.val}</div>
          </div>
        ))}
        {/* Partition line */}
        {partitionLine !== null && (
          <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            style={{
              position: 'absolute', left: `${(partitionLine / bars.length) * 100 + 1}%`,
              top: 0, bottom: 30, width: 3, background: '#ef4444',
              borderRadius: 2, transformOrigin: 'top',
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
        {[['⭐ Pivot', C.pivot], ['Compare', C.compare], ['Left Partition', C.left], ['Sorted', C.sorted]].map(([lbl, col]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: col }} />
            <span style={{ color: '#475569' }}>{lbl}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: '#ef4444' }} />
          <span style={{ color: '#475569' }}>Partition Line</span>
        </div>
      </div>

      {/* Counters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {[['Comparisons', comparisons, '#3b82f6'], ['Swaps', swaps, '#f59e0b']].map(([lbl, val, col]) => (
          <div key={lbl} style={{ flex: 1, background: `${col}12`, border: `2px solid ${col}33`, borderRadius: 14, padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: col }}>{val}</div>
            <div style={{ fontSize: 12, color: C.neutral, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={startSort} disabled={running}
          style={{ padding: '12px 28px', background: running ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: running ? 'not-allowed' : 'pointer' }}>
          {running ? 'Sorting...' : done ? 'Sorted!' : 'Auto Play'}
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={resetAll}
          style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: '2px solid #e2e8f0', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Reset
        </motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 13, color: C.neutral, fontWeight: 600 }}>Speed:</span>
          <input type="range" min={100} max={1000} step={50} value={1100 - speed}
            onChange={e => setSpeed(1100 - Number(e.target.value))}
            style={{ flex: 1 }} disabled={running} />
          <span style={{ fontSize: 13, color: C.neutral, fontWeight: 600 }}>{speed <= 300 ? 'Fast' : speed <= 700 ? 'Medium' : 'Slow'}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Section 3 : Step-by-Step Partition ──────────────────────────────────────
const STEP_ARR = [7, 2, 1, 8, 6, 3, 5, 4]
const PIVOT_VAL = 4

function buildSteps() {
  const arr = [...STEP_ARR]
  const steps = [{ arr: [...arr], i: -1, j: 0, phase: 'start', desc: `Array: [${arr.join(', ')}]. Pivot = ${PIVOT_VAL} (last element, marked ⭐).` }]
  let i = -1
  const pivot = arr[arr.length - 1]
  for (let j = 0; j < arr.length - 1; j++) {
    steps.push({ arr: [...arr], i, j, phase: 'compare', desc: `Compare arr[${j}] = ${arr[j]} with pivot = ${pivot}. ${arr[j] <= pivot ? `${arr[j]} ≤ ${pivot} → move i to ${i+1} and swap.` : `${arr[j]} > ${pivot} → skip.`}` })
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]]
      steps.push({ arr: [...arr], i, j, phase: 'swap', desc: `Swapped arr[${i}] (${arr[i]}) and arr[${j}] (${arr[j]}). Partition boundary is now at index ${i}.` })
    }
  }
  // place pivot
  [arr[i + 1], arr[arr.length - 1]] = [arr[arr.length - 1], arr[i + 1]]
  steps.push({ arr: [...arr], i: i + 1, j: arr.length - 1, phase: 'done', desc: `Pivot ${pivot} placed at index ${i+1}. It is in its FINAL correct position! Left side ≤ ${pivot}, right side > ${pivot}.` })
  return steps
}

const PARTITION_STEPS = buildSteps()

function PartitionStepByStep() {
  const [step, setStep] = useState(0)
  const cur = PARTITION_STEPS[step]

  const cellColor = (idx) => {
    if (cur.phase === 'done' && idx === cur.i) return C.sorted
    if (idx === STEP_ARR.length - 1 && cur.phase !== 'done') return C.pivot
    if (cur.phase === 'compare' && idx === cur.j) return C.compare
    if (cur.phase === 'swap' && (idx === cur.i || idx === cur.j)) return C.left
    if (cur.phase !== 'start' && idx <= cur.i) return `${C.left}88`
    return '#f1f5f9'
  }

  return (
    <div>
      {/* Array display */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        {cur.arr.map((val, idx) => (
          <motion.div key={idx} layout
            animate={{ scale: (cur.phase === 'done' && idx === cur.i) ? [1, 1.25, 1] : 1 }}
            style={{
              width: 56, height: 56, borderRadius: 14,
              background: cellColor(idx),
              border: `3px solid ${idx === cur.i && cur.phase !== 'done' ? C.ptr_i : idx === cur.j && cur.phase !== 'done' ? C.ptr_j : cur.phase === 'done' && idx === cur.i ? C.sorted : 'transparent'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 20, color: '#1e293b',
              boxShadow: cur.phase === 'done' && idx === cur.i ? `0 0 20px ${C.sorted}` : 'none',
              position: 'relative',
            }}>
            {val}
            {idx === STEP_ARR.length - 1 && cur.phase !== 'done' && (
              <div style={{ position: 'absolute', top: -18, fontSize: 14 }}>⭐</div>
            )}
            {cur.phase === 'done' && idx === cur.i && (
              <div style={{ position: 'absolute', top: -20, fontSize: 14 }}>🔒</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pointer legend */}
      {cur.phase !== 'start' && cur.phase !== 'done' && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 18, fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: C.ptr_i }}>● i = {cur.i} (partition boundary)</span>
          <span style={{ color: C.ptr_j }}>● j = {cur.j} (scanner)</span>
        </div>
      )}

      {/* Description card */}
      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: cur.phase === 'done' ? '#d1fae5' : '#eff6ff', border: `2px solid ${cur.phase === 'done' ? '#34d399' : '#bfdbfe'}`, borderRadius: 14, padding: '16px 20px', fontSize: 15, color: cur.phase === 'done' ? '#065f46' : '#1e40af', fontWeight: 500, lineHeight: 1.65, marginBottom: 20 }}>
        <strong>Step {step + 1} / {PARTITION_STEPS.length}:</strong> {cur.desc}
      </motion.div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          style={{ padding: '10px 24px', background: step === 0 ? '#f1f5f9' : '#e0e7ff', color: step === 0 ? '#94a3b8' : '#4338ca', border: 'none', borderRadius: 10, fontWeight: 700, cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: 15 }}>
          ← Previous
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStep(s => Math.min(PARTITION_STEPS.length - 1, s + 1))} disabled={step === PARTITION_STEPS.length - 1}
          style={{ padding: '10px 24px', background: step === PARTITION_STEPS.length - 1 ? '#f1f5f9' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: step === PARTITION_STEPS.length - 1 ? '#94a3b8' : 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: step === PARTITION_STEPS.length - 1 ? 'not-allowed' : 'pointer', fontSize: 15 }}>
          Next →
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStep(0)}
          style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: '2px solid #e2e8f0', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
          Restart
        </motion.button>
      </div>
    </div>
  )
}

// ─── Section 4 : Pivot Selection Matters ─────────────────────────────────────
const SORTED_ARR = [1, 2, 3, 4, 5, 6, 7, 8]

function pivotDepth(arr, strategy) {
  // Returns recursion steps count for a visual
  function countSteps(a, low, high, depth = 0) {
    if (low >= high) return depth
    let pivIdx
    if (strategy === 'last')   pivIdx = high
    else if (strategy === 'first') pivIdx = low
    else if (strategy === 'random') pivIdx = low + Math.floor(Math.random() * (high - low + 1))
    else { // median-of-three
      const mid = Math.floor((low + high) / 2)
      const vals = [[a[low], low], [a[mid], mid], [a[high], high]].sort((x, y) => x[0] - y[0])
      pivIdx = vals[1][1]
    }
    // simulate partition
    const b = [...a]
    const pivotVal = b[pivIdx];
    [b[pivIdx], b[high]] = [b[high], b[pivIdx]]
    let i = low - 1
    for (let j = low; j < high; j++) {
      if (b[j] <= b[high]) { i++; [b[i], b[j]] = [b[j], b[i]] }
    }
    [b[i + 1], b[high]] = [b[high], b[i + 1]]
    const pi = i + 1
    const leftD  = pi > low  ? countSteps(b, low,    pi - 1, depth + 1) : depth
    const rightD = pi < high ? countSteps(b, pi + 1, high,   depth + 1) : depth
    return Math.max(leftD, rightD)
  }
  return countSteps(arr, 0, arr.length - 1)
}

const STRATEGIES = [
  { key: 'last',    label: 'Last Element', emoji: '🔴', desc: 'Always picks last. O(n²) on sorted arrays!' },
  { key: 'first',   label: 'First Element', emoji: '🟠', desc: 'Always picks first. Also O(n²) on sorted arrays.' },
  { key: 'random',  label: 'Random Pivot', emoji: '🟢', desc: 'Picks random. Almost always O(n log n). Best practice!' },
  { key: 'median3', label: 'Median-of-Three', emoji: '🔵', desc: 'Median of first, mid, last. Very balanced splits!' },
]

function PivotSelectionDemo() {
  const [selected, setSelected] = useState('last')
  const depths = STRATEGIES.reduce((acc, s) => {
    acc[s.key] = pivotDepth([...SORTED_ARR], s.key)
    return acc
  }, {})
  const maxDepth = Math.max(...Object.values(depths))

  const strat = STRATEGIES.find(s => s.key === selected)

  // Build a simple recursion tree visualization
  function buildTreeNodes(arr, low, high, depth, strategy, nodes, parentId, side) {
    if (low > high || depth > 5) return
    const id = `${low}-${high}-${depth}`
    const pivotIdx = strategy === 'last' ? high : strategy === 'first' ? low :
                     Math.floor((low + high) / 2)
    const val = arr[pivotIdx]
    nodes.push({ id, low, high, depth, val, parentId, side })
    if (low < high) {
      buildTreeNodes(arr, low, pivotIdx - 1, depth + 1, strategy, nodes, id, 'left')
      buildTreeNodes(arr, pivotIdx + 1, high, depth + 1, strategy, nodes, id, 'right')
    }
  }

  const treeNodes = []
  buildTreeNodes([...SORTED_ARR], 0, SORTED_ARR.length - 1, 0, selected, treeNodes, null, null)
  const byDepth = {}
  treeNodes.forEach(n => { if (!byDepth[n.depth]) byDepth[n.depth] = []; byDepth[n.depth].push(n) })

  const isWorst = selected === 'last' || selected === 'first'
  const depth = depths[selected]

  return (
    <div>
      {/* Strategy buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        {STRATEGIES.map(s => (
          <motion.button key={s.key} whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(s.key)}
            style={{
              padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              background: selected === s.key ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#f1f5f9',
              color: selected === s.key ? 'white' : '#475569',
              border: selected === s.key ? 'none' : '2px solid #e2e8f0',
            }}>
            {s.emoji} {s.label}
          </motion.button>
        ))}
      </div>

      {/* Info card */}
      <motion.div key={selected} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        style={{
          background: isWorst ? '#fff1f2' : '#f0fdf4',
          border: `2px solid ${isWorst ? '#fda4af' : '#86efac'}`,
          borderRadius: 16, padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
        <div style={{ fontSize: 36 }}>{strat.emoji}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: isWorst ? '#b91c1c' : '#166534' }}>
            {strat.label} — {isWorst ? 'WORST CASE on sorted array!' : 'Good choice!'}
          </div>
          <div style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>{strat.desc}</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: isWorst ? '#ef4444' : '#22c55e' }}>
            Recursion depth on [1,2,3,4,5,6,7,8]: {depth} levels
            {isWorst ? ' ← O(n²)!' : depth <= 3 ? ' ← Nearly O(log n)!' : ''}
          </div>
        </div>
      </motion.div>

      {/* Recursion tree */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.neutral, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Recursion Tree (input: [1,2,3,4,5,6,7,8])
        </div>
        {Object.entries(byDepth).slice(0, 5).map(([dep, nodes]) => (
          <div key={dep} style={{ display: 'flex', justifyContent: isWorst ? 'flex-start' : 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {nodes.map(n => (
              <motion.div key={n.id} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                  color: 'white', fontWeight: 800, fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px #6366f122',
                }}>
                {n.val}
              </motion.div>
            ))}
          </div>
        ))}
        {isWorst && (
          <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14, marginTop: 8 }}>
            Straight line tree = O(n²) comparisons!
          </div>
        )}
        {!isWorst && (
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 14, marginTop: 8 }}>
            Balanced tree = O(n log n) comparisons!
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section 5 : Race — Quick Sort vs Merge Sort ─────────────────────────────
function RaceDemo() {
  const [racing, setRacing]         = useState(false)
  const [qsDone, setQsDone]         = useState(false)
  const [msDone, setMsDone]         = useState(false)
  const [qsTime, setQsTime]         = useState(null)
  const [msTime, setMsTime]         = useState(null)
  const [qsComps, setQsComps]       = useState(0)
  const [msComps, setMsComps]       = useState(0)
  const stopRef = useRef(false)
  const SIZE = 12
  const [qsBars, setQsBars] = useState(() => shuffleArray(Array.from({ length: SIZE }, (_, i) => i + 1)))
  const [msBars, setMsBars] = useState([])

  function reset() {
    stopRef.current = true
    const arr = shuffleArray(Array.from({ length: SIZE }, (_, i) => i + 1))
    setQsBars(arr); setMsBars([...arr])
    setQsDone(false); setMsDone(false)
    setQsTime(null); setMsTime(null)
    setQsComps(0); setMsComps(0)
    setRacing(false)
  }

  async function runRace() {
    if (racing) return
    stopRef.current = false
    const arr = shuffleArray(Array.from({ length: SIZE }, (_, i) => i + 1))
    setQsBars([...arr]); setMsBars([...arr])
    setQsDone(false); setMsDone(false)
    setQsTime(null); setMsTime(null)
    setQsComps(0); setMsComps(0)
    setRacing(true)

    const SPD = 180
    let qsC = 0, msC = 0

    // Quick Sort (last element pivot, in-place style visualised)
    async function qs(a, lo, hi) {
      if (lo >= hi || stopRef.current) return
      const piv = a[hi]
      let i = lo - 1
      for (let j = lo; j < hi; j++) {
        if (stopRef.current) return
        qsC++; setQsComps(qsC)
        if (a[j] <= piv) { i++; [a[i], a[j]] = [a[j], a[i]] }
        setQsBars([...a])
        await sleep(SPD)
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]]
      setQsBars([...a])
      await sleep(SPD)
      await qs(a, lo, i)
      await qs(a, i + 2, hi)
    }

    // Merge Sort
    async function ms(a, lo, hi) {
      if (lo >= hi || stopRef.current) return
      const mid = Math.floor((lo + hi) / 2)
      await ms(a, lo, mid)
      await ms(a, mid + 1, hi)
      // merge
      const L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1)
      let i = 0, j = 0, k = lo
      while (i < L.length && j < R.length) {
        if (stopRef.current) return
        msC++; setMsComps(msC)
        if (L[i] <= R[j]) { a[k++] = L[i++] }
        else               { a[k++] = R[j++] }
        setMsBars([...a])
        await sleep(SPD)
      }
      while (i < L.length) { a[k++] = L[i++]; setMsBars([...a]); await sleep(SPD * 0.5) }
      while (j < R.length) { a[k++] = R[j++]; setMsBars([...a]); await sleep(SPD * 0.5) }
    }

    const qsArr = [...arr], msArr = [...arr]
    const qsStart = Date.now()
    const msStart = Date.now()

    await Promise.all([
      qs(qsArr, 0, qsArr.length - 1).then(() => {
        if (!stopRef.current) { setQsDone(true); setQsTime(Date.now() - qsStart) }
      }),
      ms(msArr, 0, msArr.length - 1).then(() => {
        if (!stopRef.current) { setMsDone(true); setMsTime(Date.now() - msStart) }
      }),
    ])
    setRacing(false)
  }

  const maxVal = SIZE

  function Bars({ bars, done, label, color, comps }) {
    return (
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12, color, textAlign: 'center' }}>
          {label} {done ? '✅' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, background: '#f8fafc', borderRadius: 14, padding: '8px 12px', border: `2px solid ${color}44` }}>
          {bars.map((v, i) => (
            <motion.div key={i} animate={{ height: `${(v / maxVal) * 120}px` }} transition={{ duration: 0.2 }}
              style={{ flex: 1, borderRadius: '4px 4px 0 0', background: done ? C.sorted : color }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: '#475569', fontWeight: 600 }}>
          <span>Comparisons: <strong style={{ color }}>{comps}</strong></span>
          {done && <span style={{ color: '#22c55e', fontWeight: 800 }}>Done!</span>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <Bars bars={qsBars} done={qsDone} label="Quick Sort" color="#6366f1" comps={qsComps} />
        <Bars bars={msBars} done={msDone} label="Merge Sort"  color="#ec4899" comps={msComps} />
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              {['Property', 'Quick Sort', 'Merge Sort'].map(h => (
                <th key={h} style={{ padding: '12px 16px', background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', fontWeight: 700, color: '#1e293b', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Best Case',    'O(n log n)', 'O(n log n)'],
              ['Average Case', 'O(n log n)', 'O(n log n)'],
              ['Worst Case',   'O(n²) ⚠️',  'O(n log n) ✅'],
              ['Space',        'O(log n) ✅', 'O(n) ⚠️'],
              ['Stable?',      'No',         'Yes ✅'],
              ['In-place?',    'Yes ✅',     'No'],
              ['Cache-friendly?', 'Yes ✅',  'Less so'],
            ].map(([prop, qs, ms], i) => (
              <tr key={prop} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={{ padding: '10px 16px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #f1f5f9' }}>{prop}</td>
                <td style={{ padding: '10px 16px', color: '#6366f1', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{qs}</td>
                <td style={{ padding: '10px 16px', color: '#ec4899', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{ms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={runRace} disabled={racing}
          style={{ padding: '12px 28px', background: racing ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #ec4899)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: racing ? 'not-allowed' : 'pointer' }}>
          {racing ? 'Racing...' : 'Start Race!'}
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
          style={{ padding: '12px 22px', background: '#f1f5f9', color: '#475569', border: '2px solid #e2e8f0', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Reset
        </motion.button>
      </div>
    </div>
  )
}

// ─── Section 6 : Why Quick Sort Wins in Practice ─────────────────────────────
function WhyQuickSortWins() {
  const [view, setView] = useState('quick')

  const qsCards = [
    { icon: '🎯', title: 'Cache-Friendly', desc: 'Accesses contiguous memory → CPU cache loves it. Elements near each other are loaded together.' },
    { icon: '🏠', title: 'In-Place Sorting', desc: 'No extra arrays needed. Sorts within the original array using only O(log n) stack space.' },
    { icon: '⚡', title: 'Small Constant Factor', desc: 'Each comparison is cheap. The inner loop is extremely tight — very low overhead per operation.' },
    { icon: '🔀', title: 'Random Pivot = Safe', desc: 'With random pivot selection, worst case probability is astronomically low in practice.' },
  ]

  const msCards = [
    { icon: '🔗', title: 'Linked Lists', desc: 'Merge Sort handles linked lists perfectly — no random access needed for merging.' },
    { icon: '⚖️', title: 'Stability Matters', desc: 'When equal elements must keep their original order (e.g., sorting by last name keeping first-name order).' },
    { icon: '🛡️', title: 'Guaranteed O(n log n)', desc: 'No worst-case surprises. Perfect when you cannot tolerate O(n²) performance.' },
    { icon: '💽', title: 'External Sorting', desc: 'Sorting data too large for RAM — Merge Sort shines when data lives on disk.' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[['quick', 'Use Quick Sort When...', '#6366f1'], ['merge', 'Use Merge Sort When...', '#ec4899']].map(([key, label, color]) => (
          <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => setView(key)}
            style={{ flex: 1, padding: '12px 20px', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none',
              background: view === key ? color : '#f1f5f9', color: view === key ? 'white' : '#475569' }}>
            {label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, x: view === 'quick' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {(view === 'quick' ? qsCards : msCards).map(c => (
              <motion.div key={c.title} whileHover={{ y: -4 }}
                style={{ background: view === 'quick' ? '#eef4ff' : '#fdf2f8', border: `2px solid ${view === 'quick' ? '#c7d7fd' : '#f9a8d4'}`, borderRadius: 18, padding: '20px 22px' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.65 }}>{c.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Decision tree */}
      <div style={{ marginTop: 28, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b', marginBottom: 16 }}>Quick Decision Guide</div>
        {[
          { q: 'Sorting a linked list?',               ans: 'Merge Sort',  why: 'No random access needed for merging' },
          { q: 'Sorting in-memory data, random input?', ans: 'Quick Sort',  why: 'Fastest in practice' },
          { q: 'Must guarantee O(n log n) worst case?', ans: 'Merge Sort',  why: 'Always balanced splits' },
          { q: 'Memory is super limited?',              ans: 'Quick Sort',  why: 'O(log n) space vs O(n)' },
          { q: 'Stability required (equal items order)?',ans: 'Merge Sort', why: 'Quick Sort is not stable' },
          { q: 'General purpose, production code?',     ans: 'Introsort',  why: 'Quick+Heap+Insertion hybrid (used by C++, Java)' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, fontSize: 14, color: '#374151', fontWeight: 600 }}>{row.q}</div>
            <div style={{ padding: '4px 14px', borderRadius: 20, background: row.ans === 'Quick Sort' ? '#eef4ff' : row.ans === 'Introsort' ? '#fef3c7' : '#fdf2f8', color: row.ans === 'Quick Sort' ? '#4338ca' : row.ans === 'Introsort' ? '#92400e' : '#be185d', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>
              {row.ans}
            </div>
            <div style={{ flex: 2, fontSize: 13, color: '#64748b' }}>{row.why}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Topic7Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 60px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: 24, padding: '44px 48px', marginBottom: 36,
          color: 'white', position: 'relative', overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.15)' }}
        />
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8, marginBottom: 12 }}>
          Topic 7 · Think Like a Programmer
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 42, fontWeight: 800, margin: 0, lineHeight: 1.15 }}>
          Quick Sort
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, marginTop: 12, lineHeight: 1.6, maxWidth: 560 }}>
          Pick a pivot, partition around it — the fastest sort in practice.
          One big idea: put the pivot in its FINAL place, then recurse.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          {[['Average', 'O(n log n)'], ['Worst', 'O(n²)'], ['Space', 'O(log n)'], ['Stable?', 'No']].map(([lbl, val]) => (
            <div key={lbl} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 12, padding: '8px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, letterSpacing: 0.5 }}>{lbl}</div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{val}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Neuron intro */}
      <div style={{ marginBottom: 36 }}>
        <Neuron mood="excited" size="medium"
          message="Quick Sort is the MVP of sorting — it is used in C++, Python, Java under the hood! The secret: pick one element (the pivot), put it in its EXACT final position, then sort everything on its left and right. That one step — the partition — is pure magic!" />
      </div>

      {/* ── Section 1 ── */}
      <SectionBlock icon="👨‍🏫" title="The Partition Idea" color={C.pivot}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 0, marginBottom: 20 }}>
          Imagine a teacher stands at the front. They are the <strong>pivot</strong>. Every student
          shorter than the teacher stands on the <strong style={{ color: C.left }}>LEFT</strong>,
          every student taller stands on the <strong style={{ color: C.right }}>RIGHT</strong>.
          After everyone moves, the teacher is in their <strong>final correct position</strong> —
          that is partitioning!
        </p>

        <InteractiveDemo
          title="Teacher-Student Partition"
          instruction="Click LEFT or RIGHT to place each student relative to the teacher (pivot = 160 cm). Place them correctly to complete the partition!"
        >
          <PartitionDemo />
        </InteractiveDemo>

        <NeuronTip type="tip">
          After partitioning, the pivot is in its <strong>FINAL sorted position forever</strong>.
          We never move it again. That is why Quick Sort is efficient — each pivot placement
          permanently solves one element's position.
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 2 ── */}
      <SectionBlock icon="🎬" title="Quick Sort Visualiser" color={C.right}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 0, marginBottom: 20 }}>
          Watch Quick Sort partition the array step by step. The <strong style={{ color: C.pivot }}>star (⭐) marks the pivot</strong>
          (always the last element here). The <strong style={{ color: '#ef4444' }}>red line</strong> shows
          where the partition boundary was placed. Elements to its left are smaller; elements to its right are larger.
        </p>

        <InteractiveDemo title="Quick Sort in Action" instruction="Hit Auto Play to watch the full sort. Adjust speed to see every swap clearly.">
          <QuickSortVisualiser />
        </InteractiveDemo>

        <NeuronTip type="fun">
          Quick Sort is <strong>recursive</strong> — after each partition, it calls itself on the left
          half and the right half. Each call is working on a smaller and smaller sub-problem.
          That is divide and conquer!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 3 ── */}
      <SectionBlock icon="🔬" title="The Partition Step-by-Step" color={C.ptr_i}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 0, marginBottom: 20 }}>
          Let us zoom into one single partition operation on
          <strong> [7, 2, 1, 8, 6, 3, 5, 4]</strong>.
          Pivot = <strong style={{ color: C.pivot }}>4</strong> (last element, marked ⭐).
          Pointer <strong style={{ color: C.ptr_i }}>i</strong> tracks the partition boundary;
          pointer <strong style={{ color: C.ptr_j }}>j</strong> scans the array.
          Click Next to advance each comparison.
        </p>

        <InteractiveDemo title="One Partition Operation" instruction="Click 'Next' to see each comparison and swap. Watch 4 land in its FINAL position (🔒)!">
          <PartitionStepByStep />
        </InteractiveDemo>

        <NeuronTip type="deep">
          The Lomuto partition scheme used here has <strong>pointer i</strong> tracking "last element
          confirmed ≤ pivot" and <strong>pointer j</strong> scanning ahead. When j finds something
          ≤ pivot, i advances and we swap. Clean and simple — though Hoare's original scheme is
          even faster in practice (fewer swaps).
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 4 ── */}
      <SectionBlock icon="🎲" title="Pivot Selection Matters" color="#ef4444">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 0, marginBottom: 20 }}>
          The same algorithm, different pivot choices = wildly different performance!
          Try each strategy on an already-sorted array <strong>[1,2,3,4,5,6,7,8]</strong>.
          Spoiler: always picking the last element on a sorted array is
          <strong style={{ color: '#ef4444' }}> catastrophically bad</strong>.
        </p>

        <InteractiveDemo title="Pivot Strategy Showdown" instruction="Select a pivot strategy to see how the recursion tree changes on a sorted array.">
          <PivotSelectionDemo />
        </InteractiveDemo>

        <NeuronTip type="warning">
          Always picking the first or last element as pivot can degrade Quick Sort to
          <strong> O(n²)</strong> on already-sorted or reverse-sorted input. Real-world
          implementations use <strong>random pivot</strong> or <strong>median-of-three</strong>
          to avoid this. Python's Timsort and Java's Arrays.sort() use hybrid approaches for this reason.
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 5 ── */}
      <SectionBlock icon="🏁" title="Quick Sort vs Merge Sort Race" color="#ec4899">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 0, marginBottom: 20 }}>
          Both algorithms are O(n log n) on average — but Quick Sort is often faster in practice
          because it is <strong>in-place</strong> and <strong>cache-friendly</strong>.
          Watch them race side by side on the same shuffled data!
        </p>

        <InteractiveDemo title="The Great Sort Race" instruction="Click 'Start Race!' to see both algorithms sort the same array simultaneously.">
          <RaceDemo />
        </InteractiveDemo>

        <NeuronTip type="example">
          Even though the comparison counts may be similar, Quick Sort often feels faster because
          it reads memory in a sequential pattern that CPUs love (cache locality). Merge Sort
          constantly creates temporary arrays, causing more memory allocations — the silent speed killer.
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 6 ── */}
      <SectionBlock icon="🏆" title="Why Quick Sort Wins in Practice" color={C.left}>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 0, marginBottom: 20 }}>
          Most standard libraries — C++ STL, Python&apos;s sort, Java&apos;s primitive sort — are based on
          Quick Sort or a Quick Sort hybrid. Here is why. But Merge Sort has its own winning scenarios too.
        </p>

        <InteractiveDemo title="When to Use Which?" instruction="Toggle between Quick Sort and Merge Sort strengths. Use the decision guide below to pick the right one.">
          <WhyQuickSortWins />
        </InteractiveDemo>

        <NeuronTip type="tip">
          Modern languages use <strong>Introsort</strong> — a hybrid of Quick Sort, Heap Sort, and
          Insertion Sort. It starts with Quick Sort, switches to Heap Sort if recursion depth gets
          too large (avoiding worst case), and uses Insertion Sort for tiny sub-arrays (fastest for n &lt; 16).
          Best of all worlds!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 7 : Hindi Explainer ── */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी सारांश" color="#ff9933">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginTop: 0, marginBottom: 20 }}>
          Quick Sort को हिंदी में समझते हैं — teacher-student analogy के साथ!
        </p>

        <HindiExplainer
          concept="Quick Sort"
          english="Pick a pivot, partition elements around it, recursively sort sub-arrays."
          explanation="Quick Sort एक बहुत तेज़ sorting algorithm है। इसमें एक element को pivot (धुरी) चुनते हैं — जैसे एक teacher। फिर सभी students (elements) जो teacher से छोटे हैं, वो LEFT side जाते हैं। जो बड़े हैं, वो RIGHT side। Teacher अब अपनी FINAL सही position पर है — उसे दोबारा नहीं हिलाना। फिर left और right groups में नया teacher चुनो और यही process दोहराओ। यही Divide and Conquer है!"
          example="Array: [7, 2, 1, 8, 6, 3, 5, 4] — Pivot = 4. 4 से छोटे: [2, 1, 3] LEFT में। 4 से बड़े: [6, 7, 5, 8] RIGHT में। 4 अपनी final position पर आ गया! अब [2,1,3] और [6,7,5,8] को separately sort करो।"
          terms={[
            { word: 'Pivot', hindi: 'धुरी / केंद्र बिंदु', desc: 'वो element जिसके around partition होती है' },
            { word: 'Partition', hindi: 'विभाजन', desc: 'Array को pivot के basis पर दो हिस्सों में बाँटना' },
            { word: 'In-place', hindi: 'स्थान पर ही', desc: 'Extra array बनाए बिना original array में ही sort करना' },
            { word: 'Recursive', hindi: 'पुनरावर्ती', desc: 'Function खुद को छोटे problem पर call करता है' },
            { word: 'Divide & Conquer', hindi: 'बाँटो और जीतो', desc: 'बड़ी problem को छोटी problems में तोड़ना' },
          ]}
        />

        <div style={{ marginTop: 24, background: 'linear-gradient(135deg, #fff8f0, #fff5eb)', border: '2px solid #ff993333', borderRadius: 18, padding: '24px 28px' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#d97706', marginBottom: 14 }}>
            Quick याद करने की Trick
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              ['1️⃣', 'Pivot चुनो (teacher)', '#f59e0b'],
              ['2️⃣', 'Partition करो (sort left/right)', '#10b981'],
              ['3️⃣', 'Pivot = FINAL position', '#6366f1'],
              ['4️⃣', 'Repeat on sub-arrays', '#ec4899'],
            ].map(([num, text, color]) => (
              <div key={num} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', border: `2px solid ${color}33`, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{num}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Final Neuron */}
      <div style={{ marginTop: 8 }}>
        <Neuron mood="waving" size="medium"
          message="You have conquered Quick Sort! Remember: the partition step is the HEART of the algorithm. One pivot, placed permanently, and two sub-problems to solve. That elegant recursion is why Quick Sort runs in your phone, your browser, everywhere. Next up: we explore even more sorting strategies — see you there!" />
      </div>

    </div>
  )
}
