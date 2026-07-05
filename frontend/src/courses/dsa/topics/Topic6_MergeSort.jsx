import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 6 — Merge Sort
   Divide & Conquer • O(n log n) • Space O(n)
   Visual-first, interactive, NO text walls
================================================================ */

const C = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f59e0b',
  pink: '#ec4899',
  red: '#ef4444',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  teal: '#14b8a6',
  emerald: '#059669',
  slate: '#64748b',
}

/* ─────────────────────────────────────────────────────────────
   SECTION 1 — The Divide & Conquer Idea
   Animated paper pile split-and-merge interaction
───────────────────────────────────────────────────────────── */
const PILE_COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f97316']

function PaperPileDemo() {
  // stages: 0=full, 1=halved, 2=quartered, 3=individual, 4=merging, 5=done
  const [stage, setStage] = useState(0)
  const elements = [38, 27, 43, 3, 9, 82, 10, 64]

  const stageLabels = [
    '100 papers — impossible pile!',
    'Split into 2 halves',
    'Split into 4 groups',
    'Each paper alone — trivially sorted!',
    'Merge back in sorted order...',
    'Fully sorted! O(n log n) magic!',
  ]

  // Compute groups at each stage
  const getGroups = () => {
    if (stage === 0) return [elements]
    if (stage === 1) return [elements.slice(0, 4), elements.slice(4)]
    if (stage === 2) return [elements.slice(0, 2), elements.slice(2, 4), elements.slice(4, 6), elements.slice(6)]
    if (stage === 3) return elements.map(e => [e])
    if (stage === 4) return [[3, 27], [38, 43], [9, 82], [10, 64]]
    // sorted
    return [elements.slice().sort((a, b) => a - b)]
  }

  const groups = getGroups()

  return (
    <InteractiveDemo
      title="Paper Pile — Divide & Conquer"
      instruction="Click the button to split the pile, then merge it back sorted!"
    >
      <div style={{ textAlign: 'center' }}>
        {/* Stage label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 17, fontWeight: 700, color: stage >= 3 ? C.green : C.blue,
              marginBottom: 24, letterSpacing: 0.3,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {stageLabels[stage]}
          </motion.div>
        </AnimatePresence>

        {/* Paper groups */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', minHeight: 120, alignItems: 'flex-end', marginBottom: 28 }}>
          {groups.map((group, gi) => (
            <motion.div
              key={`${stage}-${gi}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: gi * 0.06 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {/* Stack of papers */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 160 }}>
                {group.map((val, vi) => (
                  <motion.div
                    key={val}
                    layout
                    style={{
                      width: stage <= 1 ? 38 : stage === 2 ? 42 : 46,
                      height: stage <= 1 ? 52 : stage === 2 ? 58 : 62,
                      borderRadius: 7,
                      background: `linear-gradient(135deg, ${PILE_COLORS[elements.indexOf(val)]}cc, ${PILE_COLORS[elements.indexOf(val)]})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: 15,
                      boxShadow: '0 3px 12px rgba(0,0,0,0.18)',
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
              {/* Group size label */}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 4 }}>
                {group.length === 1 ? '1 paper' : `${group.length} papers`}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {stage < 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage(s => Math.min(s + 1, 3))}
              style={{
                padding: '10px 28px', borderRadius: 30, border: 'none',
                background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                boxShadow: `0 4px 16px ${C.blue}44`,
              }}
            >
              Split! ✂️
            </motion.button>
          )}
          {stage === 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage(4)}
              style={{
                padding: '10px 28px', borderRadius: 30, border: 'none',
                background: `linear-gradient(135deg, ${C.green}, ${C.teal})`,
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                boxShadow: `0 4px 16px ${C.green}44`,
              }}
            >
              Merge! 🔀
            </motion.button>
          )}
          {stage === 4 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage(5)}
              style={{
                padding: '10px 28px', borderRadius: 30, border: 'none',
                background: `linear-gradient(135deg, ${C.green}, ${C.emerald})`,
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                boxShadow: `0 4px 16px ${C.green}44`,
              }}
            >
              Final Merge! ✅
            </motion.button>
          )}
          {stage > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage(0)}
              style={{
                padding: '10px 24px', borderRadius: 30, border: `2px solid ${C.slate}40`,
                background: 'transparent', color: 'var(--text-secondary)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              Reset
            </motion.button>
          )}
        </div>
      </div>
    </InteractiveDemo>
  )
}

/* ─────────────────────────────────────────────────────────────
   SECTION 2 — Merge Sort Visualizer (full bar chart + tree)
───────────────────────────────────────────────────────────── */

// Build all steps of merge sort for an 8-element array
function buildMergeSortSteps(arr) {
  const steps = []
  const a = arr.slice()

  function mergeSort(indices, depth) {
    if (indices.length <= 1) return indices.map(i => ({ ...a[i] === undefined ? {} : {}, idx: i, val: arr[i] }))

    const mid = Math.floor(indices.length / 2)
    const left = indices.slice(0, mid)
    const right = indices.slice(mid)

    steps.push({
      type: 'split',
      left: left.slice(),
      right: right.slice(),
      all: indices.slice(),
      depth,
      label: `Split [${indices.map(i => arr[i]).join(',')}]`,
    })

    const sortedLeft = mergeSort(left, depth + 1)
    const sortedRight = mergeSort(right, depth + 1)

    // Merge step
    const merged = []
    let li = 0, ri = 0
    while (li < sortedLeft.length && ri < sortedRight.length) {
      if (sortedLeft[li].val <= sortedRight[ri].val) {
        merged.push(sortedLeft[li++])
      } else {
        merged.push(sortedRight[ri++])
      }
    }
    while (li < sortedLeft.length) merged.push(sortedLeft[li++])
    while (ri < sortedRight.length) merged.push(sortedRight[ri++])

    steps.push({
      type: 'merge',
      result: merged.map(m => m.val),
      leftVals: sortedLeft.map(m => m.val),
      rightVals: sortedRight.map(m => m.val),
      indices: indices.slice(),
      depth,
      label: `Merge → [${merged.map(m => m.val).join(',')}]`,
    })

    return merged
  }

  mergeSort(Array.from({ length: arr.length }, (_, i) => i), 0)
  return steps
}

const VIZ_ARRAY = [38, 27, 43, 3, 9, 82, 10, 64]
const BAR_COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f97316']
const MAX_BAR_VAL = 90

function MergeSortVisualizer() {
  const steps = buildMergeSortSteps(VIZ_ARRAY)
  const [stepIdx, setStepIdx] = useState(-1) // -1 = idle
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(900)
  const [comparisons, setComparisons] = useState(0)
  const intervalRef = useRef(null)

  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null

  const tick = useCallback(() => {
    setStepIdx(prev => {
      const next = prev + 1
      if (next >= steps.length) {
        setIsPlaying(false)
        return steps.length - 1
      }
      if (steps[next]?.type === 'merge') {
        setComparisons(c => c + (steps[next].leftVals?.length || 0) + (steps[next].rightVals?.length || 0) - 1)
      }
      return next
    })
  }, [steps.length])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, speed)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed, tick])

  const reset = () => {
    setIsPlaying(false)
    setStepIdx(-1)
    setComparisons(0)
    clearInterval(intervalRef.current)
  }

  const stepForward = () => {
    if (stepIdx < steps.length - 1) {
      const next = stepIdx + 1
      if (steps[next]?.type === 'merge') {
        setComparisons(c => c + (steps[next].leftVals?.length || 0) + (steps[next].rightVals?.length || 0) - 1)
      }
      setStepIdx(next)
    }
  }

  // Compute current bar states
  const getBarState = (i) => {
    if (!currentStep) return 'idle'
    if (currentStep.type === 'split') {
      if (currentStep.left.includes(i)) return 'split-left'
      if (currentStep.right.includes(i)) return 'split-right'
      return 'idle'
    }
    if (currentStep.type === 'merge') {
      if (currentStep.indices.includes(i)) return 'merge'
      return 'idle'
    }
    return 'idle'
  }

  const getBarColor = (i, state) => {
    if (state === 'split-left') return C.blue
    if (state === 'split-right') return C.purple
    if (state === 'merge') return C.green
    return BAR_COLORS[i]
  }

  return (
    <InteractiveDemo
      title="Merge Sort Visualizer — Full Recursion"
      instruction="Watch the array split into halves and merge back sorted. Blue = splitting, Green = merging."
    >
      {/* Counters */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Step', val: stepIdx < 0 ? '—' : `${stepIdx + 1}/${steps.length}` },
          { label: 'Comparisons', val: comparisons },
          { label: 'Depth', val: currentStep ? currentStep.depth : '—' },
          { label: 'Phase', val: currentStep ? (currentStep.type === 'split' ? 'Splitting' : 'Merging') : 'Ready' },
        ].map(({ label, val }) => (
          <div key={label} style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 12, padding: '10px 20px',
            textAlign: 'center', minWidth: 90,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: 12, height: 120, marginBottom: 16,
      }}>
        {VIZ_ARRAY.map((val, i) => {
          const state = getBarState(i)
          const color = getBarColor(i, state)
          const height = (val / MAX_BAR_VAL) * 100
          return (
            <motion.div
              key={i}
              layout
              animate={{
                height: `${height}%`,
                background: color,
                scale: state !== 'idle' ? 1.08 : 1,
                y: state !== 'idle' ? -6 : 0,
              }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              style={{
                width: 44, borderRadius: '8px 8px 4px 4px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                paddingTop: 5, color: '#fff', fontSize: 12, fontWeight: 700,
                boxShadow: state !== 'idle' ? `0 6px 20px ${color}55` : '0 2px 8px rgba(0,0,0,0.12)',
                cursor: 'default',
              }}
            >
              {val}
            </motion.div>
          )
        })}
      </div>

      {/* Step label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            textAlign: 'center', fontSize: 14, fontWeight: 600,
            color: currentStep?.type === 'merge' ? C.green : C.blue,
            minHeight: 22, marginBottom: 20,
          }}
        >
          {currentStep ? currentStep.label : 'Press Play or Step to begin'}
        </motion.div>
      </AnimatePresence>

      {/* Speed slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Fast</span>
        <input
          type="range" min={300} max={1800} step={100} value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          style={{ width: 140, accentColor: C.blue }}
        />
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Slow</span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsPlaying(p => !p)}
          disabled={stepIdx >= steps.length - 1}
          style={{
            padding: '10px 28px', borderRadius: 30, border: 'none',
            background: isPlaying
              ? `linear-gradient(135deg, ${C.orange}, ${C.pink})`
              : `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
            color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            boxShadow: `0 4px 16px ${C.blue}44`,
            opacity: stepIdx >= steps.length - 1 ? 0.6 : 1,
          }}
        >
          {isPlaying ? 'Pause ⏸' : 'Auto Play ▶'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={stepForward}
          disabled={isPlaying || stepIdx >= steps.length - 1}
          style={{
            padding: '10px 24px', borderRadius: 30, border: `2px solid ${C.blue}`,
            background: 'transparent', color: C.blue,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            opacity: (isPlaying || stepIdx >= steps.length - 1) ? 0.5 : 1,
          }}
        >
          Step →
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={reset}
          style={{
            padding: '10px 20px', borderRadius: 30, border: `2px solid ${C.slate}40`,
            background: 'transparent', color: 'var(--text-secondary)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          Reset
        </motion.button>
      </div>
    </InteractiveDemo>
  )
}

/* ─────────────────────────────────────────────────────────────
   SECTION 3 — The Merge Operation
   Interactive: user picks which pointer is smaller
───────────────────────────────────────────────────────────── */
const MERGE_LEFT = [2, 5, 8]
const MERGE_RIGHT = [1, 4, 7]

function MergeOperationDemo() {
  const [li, setLi] = useState(0)
  const [ri, setRi] = useState(0)
  const [result, setResult] = useState([])
  const [lastPicked, setLastPicked] = useState(null) // 'left' | 'right' | null
  const [done, setDone] = useState(false)

  const pick = (side) => {
    if (done) return
    const leftVal = MERGE_LEFT[li]
    const rightVal = MERGE_RIGHT[ri]
    const correctSide = leftVal <= rightVal ? 'left' : 'right'
    if (side !== correctSide) {
      setLastPicked('wrong')
      return
    }
    setLastPicked(side)
    const picked = side === 'left' ? leftVal : rightVal
    const newResult = [...result, picked]
    setResult(newResult)

    const newLi = side === 'left' ? li + 1 : li
    const newRi = side === 'right' ? ri + 1 : ri

    if (newLi >= MERGE_LEFT.length && newRi >= MERGE_RIGHT.length) {
      setDone(true)
    } else if (newLi >= MERGE_LEFT.length) {
      // flush right
      setResult([...newResult, ...MERGE_RIGHT.slice(newRi)])
      setLi(newLi); setRi(MERGE_RIGHT.length); setDone(true)
    } else if (newRi >= MERGE_RIGHT.length) {
      // flush left
      setResult([...newResult, ...MERGE_LEFT.slice(newLi)])
      setLi(MERGE_LEFT.length); setRi(newRi); setDone(true)
    } else {
      setLi(newLi)
      setRi(newRi)
    }
  }

  const reset = () => { setLi(0); setRi(0); setResult([]); setLastPicked(null); setDone(false) }

  const leftDone = li >= MERGE_LEFT.length
  const rightDone = ri >= MERGE_RIGHT.length

  return (
    <InteractiveDemo
      title="Merge Operation — Pick the Smaller!"
      instruction="Two sorted arrays wait to be merged. Click whichever pointer is smaller — it goes into the result."
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Two input arrays */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'Left Array', arr: MERGE_LEFT, ptr: li, side: 'left', color: C.blue },
            { label: 'Right Array', arr: MERGE_RIGHT, ptr: ri, side: 'right', color: C.purple },
          ].map(({ label, arr, ptr, side, color }) => (
            <div key={side} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {arr.map((val, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: i < ptr ? 0.25 : 1,
                      scale: i === ptr && !done ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: 52, height: 52, borderRadius: 12,
                      background: i === ptr && !done
                        ? `linear-gradient(135deg, ${color}, ${color}cc)`
                        : i < ptr ? '#e5e7eb' : `${color}22`,
                      border: i === ptr && !done ? `2px solid ${color}` : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 18,
                      color: i === ptr && !done ? '#fff' : i < ptr ? '#9ca3af' : color,
                      boxShadow: i === ptr && !done ? `0 4px 16px ${color}44` : 'none',
                    }}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
              {/* Pointer arrow */}
              {!done && ptr < arr.length && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{ fontSize: 18, color, fontWeight: 700 }}
                >
                  ↑
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {lastPicked === 'wrong' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center', color: C.red, fontWeight: 700, fontSize: 14,
                marginBottom: 12,
              }}
              onAnimationComplete={() => setTimeout(() => setLastPicked(null), 600)}
            >
              Pick the SMALLER value!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pick buttons */}
        {!done && (
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 24 }}>
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => pick('left')}
              disabled={leftDone}
              style={{
                padding: '12px 32px', borderRadius: 30, border: 'none',
                background: leftDone ? '#e5e7eb' : `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
                color: leftDone ? '#9ca3af' : '#fff',
                fontWeight: 700, fontSize: 15, cursor: leftDone ? 'not-allowed' : 'pointer',
                boxShadow: leftDone ? 'none' : `0 4px 14px ${C.blue}44`,
              }}
            >
              Pick Left ({leftDone ? 'done' : MERGE_LEFT[li]})
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => pick('right')}
              disabled={rightDone}
              style={{
                padding: '12px 32px', borderRadius: 30, border: 'none',
                background: rightDone ? '#e5e7eb' : `linear-gradient(135deg, ${C.purple}, ${C.pink})`,
                color: rightDone ? '#9ca3af' : '#fff',
                fontWeight: 700, fontSize: 15, cursor: rightDone ? 'not-allowed' : 'pointer',
                boxShadow: rightDone ? 'none' : `0 4px 14px ${C.purple}44`,
              }}
            >
              Pick Right ({rightDone ? 'done' : MERGE_RIGHT[ri]})
            </motion.button>
          </div>
        )}

        {/* Result array */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Merged Result
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', minHeight: 56 }}>
            {result.map((val, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.green}, ${C.emerald})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 18, color: '#fff',
                  boxShadow: `0 3px 12px ${C.green}44`,
                }}
              >
                {val}
              </motion.div>
            ))}
            {Array.from({ length: MERGE_LEFT.length + MERGE_RIGHT.length - result.length }).map((_, i) => (
              <div key={`empty-${i}`} style={{
                width: 52, height: 52, borderRadius: 12,
                border: '2px dashed #d1d5db',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#d1d5db', fontSize: 22,
              }}>?</div>
            ))}
          </div>
        </div>

        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: C.green, marginBottom: 8 }}>
              Merged in {MERGE_LEFT.length + MERGE_RIGHT.length - 1} comparisons — O(n) work!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Two sorted arrays always merge in linear time.
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={reset}
              style={{
                padding: '9px 24px', borderRadius: 30, border: `2px solid ${C.green}`,
                background: 'transparent', color: C.green, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </div>
    </InteractiveDemo>
  )
}

/* ─────────────────────────────────────────────────────────────
   SECTION 4 — Recursion Tree
───────────────────────────────────────────────────────────── */

const TREE_LEVELS = [
  { level: 0, label: 'Level 0', nodes: [{ vals: [38,27,43,3,9,82,10], color: C.blue, note: '7 elements' }] },
  { level: 1, label: 'Level 1', nodes: [
    { vals: [38,27,43,3], color: C.purple, note: 'n/2 = 4' },
    { vals: [9,82,10], color: C.orange, note: 'n/2 = 3' },
  ]},
  { level: 2, label: 'Level 2', nodes: [
    { vals: [38,27], color: C.pink },
    { vals: [43,3], color: C.pink },
    { vals: [9,82], color: C.teal },
    { vals: [10], color: C.teal },
  ]},
  { level: 3, label: 'Level 3 — Base case!', nodes: [
    { vals: [38], color: C.green },
    { vals: [27], color: C.green },
    { vals: [43], color: C.green },
    { vals: [3], color: C.green },
    { vals: [9], color: C.green },
    { vals: [82], color: C.green },
    { vals: [10], color: C.green },
  ]},
  { level: 4, label: 'Merging back up...', nodes: [
    { vals: [27,38], color: C.emerald, note: 'merged' },
    { vals: [3,43], color: C.emerald, note: 'merged' },
    { vals: [9,82], color: C.emerald, note: 'merged' },
    { vals: [10], color: C.emerald, note: 'base' },
  ]},
  { level: 5, label: 'Final merge!', nodes: [
    { vals: [3,9,10,27,38,43,82], color: C.blue, note: 'SORTED!' },
  ]},
]

function RecursionTreeSection() {
  const [activeLevel, setActiveLevel] = useState(0)

  return (
    <InteractiveDemo
      title="Recursion Tree — Level by Level"
      instruction="Click through levels to see how the recursion tree expands. Each level does O(n) total work — log(n) levels = O(n log n)."
    >
      <div>
        {/* Level selector */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {TREE_LEVELS.map((lvl, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveLevel(i)}
              style={{
                padding: '8px 16px', borderRadius: 20, border: `2px solid ${i === activeLevel ? C.blue : '#e5e7eb'}`,
                background: i === activeLevel ? C.blue : 'transparent',
                color: i === activeLevel ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {i === activeLevel ? '→ ' : ''}{lvl.label}
            </motion.button>
          ))}
        </div>

        {/* Tree levels (all visible, current highlighted) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {TREE_LEVELS.slice(0, activeLevel + 1).map((lvl, li) => (
            <motion.div
              key={li}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Level label */}
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                color: li === activeLevel ? C.blue : 'var(--text-secondary)',
                marginBottom: 8, textAlign: 'center',
              }}>
                {lvl.label}
              </div>
              {/* Nodes */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {lvl.nodes.map((node, ni) => (
                  <motion.div
                    key={ni}
                    animate={{ scale: li === activeLevel ? 1.05 : 1 }}
                    style={{
                      background: li === activeLevel ? `${node.color}18` : `${node.color}09`,
                      border: `2px solid ${li === activeLevel ? node.color : node.color + '44'}`,
                      borderRadius: 12, padding: '8px 12px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      minWidth: 60,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {node.vals.map((v, vi) => (
                        <span key={vi} style={{
                          fontSize: 12, fontWeight: 800,
                          color: li === activeLevel ? node.color : node.color + '99',
                          fontFamily: 'var(--font-heading)',
                        }}>
                          {v}{vi < node.vals.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                    {node.note && (
                      <span style={{ fontSize: 10, color: node.color + 'aa', fontWeight: 600 }}>
                        {node.note}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Connector line to next level */}
              {li < activeLevel && (
                <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: 18, marginTop: 4 }}>↓</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Complexity callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: activeLevel >= 3 ? 1 : 0 }}
          style={{
            marginTop: 24, padding: '16px 24px',
            background: `linear-gradient(135deg, ${C.blue}10, ${C.indigo}08)`,
            border: `1.5px solid ${C.blue}30`,
            borderRadius: 14, textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: C.blue, marginBottom: 4 }}>
            log(7) ≈ 3 levels × O(n) work per level = O(n log n) total
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Each level: all elements touched once → n comparisons. Levels: log₂(n).
          </div>
        </motion.div>
      </div>
    </InteractiveDemo>
  )
}

/* ─────────────────────────────────────────────────────────────
   SECTION 5 — Race: Merge Sort vs Bubble Sort
───────────────────────────────────────────────────────────── */
function computeBubbleOps(n) { return (n * (n - 1)) / 2 }
function computeMergeOps(n) { return Math.round(n * Math.log2(n)) }

const RACE_SIZES = [10, 20, 50, 100]

function RaceSection() {
  const [size, setSize] = useState(20)
  const [racing, setRacing] = useState(false)
  const [bubbleProgress, setBubbleProgress] = useState(0)
  const [mergeProgress, setMergeProgress] = useState(0)
  const [done, setDone] = useState(false)

  const bubbleOps = computeBubbleOps(size)
  const mergeOps = computeMergeOps(size)

  const startRace = () => {
    setBubbleProgress(0)
    setMergeProgress(0)
    setDone(false)
    setRacing(true)
  }

  useEffect(() => {
    if (!racing) return
    let frame = 0
    const totalFrames = 60
    const raf = setInterval(() => {
      frame++
      const t = frame / totalFrames
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      setMergeProgress(Math.min(ease * 1.0, 1))
      // Bubble only reaches (mergeOps/bubbleOps) fraction in same time
      setBubbleProgress(Math.min(ease * (mergeOps / bubbleOps), 1))
      if (frame >= totalFrames) {
        clearInterval(raf)
        setRacing(false)
        setDone(true)
      }
    }, 30)
    return () => clearInterval(raf)
  }, [racing, mergeOps, bubbleOps])

  return (
    <InteractiveDemo
      title="Bubble Sort vs Merge Sort — RACE!"
      instruction={`Choose array size, then start the race. Watch Merge Sort leave Bubble Sort behind.`}
    >
      {/* Size selector */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        {RACE_SIZES.map(s => (
          <motion.button
            key={s}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSize(s); setDone(false); setBubbleProgress(0); setMergeProgress(0) }}
            style={{
              padding: '8px 20px', borderRadius: 20,
              border: `2px solid ${size === s ? C.blue : '#e5e7eb'}`,
              background: size === s ? C.blue : 'transparent',
              color: size === s ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            n = {s}
          </motion.button>
        ))}
      </div>

      {/* Race tracks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Bubble Sort', ops: bubbleOps, progress: bubbleProgress, color: C.red, emoji: '🐢' },
          { label: 'Merge Sort', ops: mergeOps, progress: mergeProgress, color: C.green, emoji: '🚀' },
        ].map(({ label, ops, progress, color, emoji }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color, display: 'flex', alignItems: 'center', gap: 6 }}>
                {emoji} {label}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {ops.toLocaleString()} ops
              </span>
            </div>
            <div style={{ height: 24, borderRadius: 12, background: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
              <motion.div
                style={{
                  height: '100%', borderRadius: 12,
                  background: `linear-gradient(90deg, ${color}cc, ${color})`,
                  boxShadow: `0 2px 8px ${color}44`,
                }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.05 }}
              />
              {progress > 0.1 && (
                <div style={{
                  position: 'absolute', left: `${Math.min(progress * 100, 88)}%`,
                  top: '50%', transform: 'translateY(-50%)',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  background: color, borderRadius: 6, padding: '1px 6px',
                }}>
                  {Math.round(progress * 100)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          background: `${C.green}10`, border: `1.5px solid ${C.green}30`,
          borderRadius: 12, padding: '12px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: C.green, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Merge Sort Ops</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.green, fontFamily: 'var(--font-heading)' }}>{mergeOps.toLocaleString()}</div>
        </div>
        <div style={{
          background: `${C.orange}10`, border: `1.5px solid ${C.orange}30`,
          borderRadius: 12, padding: '12px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: C.orange, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Speed-up</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.orange, fontFamily: 'var(--font-heading)' }}>
            {(bubbleOps / mergeOps).toFixed(1)}x
          </div>
        </div>
        <div style={{
          background: `${C.red}10`, border: `1.5px solid ${C.red}30`,
          borderRadius: 12, padding: '12px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: C.red, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bubble Sort Ops</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.red, fontFamily: 'var(--font-heading)' }}>{bubbleOps.toLocaleString()}</div>
        </div>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: C.green, marginBottom: 16 }}
        >
          Merge Sort wins by {(bubbleOps / mergeOps).toFixed(1)}x!
          {size >= 50 && ' The gap grows DRAMATICALLY with n!'}
        </motion.div>
      )}

      <div style={{ textAlign: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          onClick={startRace}
          disabled={racing}
          style={{
            padding: '12px 36px', borderRadius: 30, border: 'none',
            background: racing
              ? '#e5e7eb'
              : `linear-gradient(135deg, ${C.orange}, ${C.pink})`,
            color: racing ? '#9ca3af' : '#fff',
            fontWeight: 700, fontSize: 16, cursor: racing ? 'not-allowed' : 'pointer',
            boxShadow: racing ? 'none' : `0 4px 18px ${C.orange}44`,
          }}
        >
          {racing ? 'Racing...' : 'Start Race! 🏁'}
        </motion.button>
      </div>
    </InteractiveDemo>
  )
}

/* ─────────────────────────────────────────────────────────────
   SECTION 6 — Space Tradeoff
───────────────────────────────────────────────────────────── */
const SPACE_N = 8

function SpaceTradeoffSection() {
  const [showMergeMemory, setShowMergeMemory] = useState(false)

  const mergeLevels = [
    { label: 'Level 0 — Temp buffer (n)', blocks: SPACE_N, color: C.blue },
    { label: 'Level 1 — Temp buffers (n/2 each)', blocks: SPACE_N, color: C.purple },
    { label: 'Level 2 — Temp buffers (n/4 each)', blocks: SPACE_N, color: C.pink },
  ]

  return (
    <InteractiveDemo
      title="Space Tradeoff — The Cost of Speed"
      instruction="Toggle to reveal how much extra memory Merge Sort needs versus Bubble Sort."
    >
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Bubble Sort - O(1) */}
        <div style={{ flex: '1 1 240px', maxWidth: 300 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Bubble Sort
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>O(1) Extra Space</div>
          </div>
          {/* Original array only */}
          <div style={{
            background: `${C.green}10`, border: `2px solid ${C.green}30`,
            borderRadius: 14, padding: 16, textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 10, textTransform: 'uppercase' }}>
              Original Array (n = 8)
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: SPACE_N }).map((_, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#fff',
                }}>
                  {VIZ_ARRAY[i]}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff', borderRadius: 8, fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: C.green }}>1 extra variable</span> — just a swap temp!
            </div>
          </div>
          <div style={{
            marginTop: 12, textAlign: 'center', padding: '10px 16px',
            background: `${C.green}15`, borderRadius: 10,
            fontSize: 13, fontWeight: 700, color: C.green,
          }}>
            Total Extra: O(1)
          </div>
        </div>

        {/* Merge Sort - O(n) */}
        <div style={{ flex: '1 1 280px', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Merge Sort
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>O(n) Extra Space</div>
          </div>

          {/* Original */}
          <div style={{
            background: `${C.blue}10`, border: `2px solid ${C.blue}30`,
            borderRadius: 10, padding: 12, marginBottom: 8,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.blue, marginBottom: 6, textTransform: 'uppercase' }}>
              Original Array
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {Array.from({ length: SPACE_N }).map((_, i) => (
                <div key={i} style={{
                  width: 26, height: 26, borderRadius: 5,
                  background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#fff',
                }}>
                  {VIZ_ARRAY[i]}
                </div>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowMergeMemory(m => !m)}
            style={{
              width: '100%', padding: '8px', borderRadius: 8, border: `1.5px dashed ${C.orange}`,
              background: 'transparent', color: C.orange, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            {showMergeMemory ? 'Hide' : 'Reveal'} Temp Memory Buffers
          </motion.button>

          <AnimatePresence>
            {showMergeMemory && mergeLevels.map((lvl, li) => (
              <motion.div
                key={li}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: li * 0.1 }}
                style={{ overflow: 'hidden', marginBottom: 8 }}
              >
                <div style={{
                  background: `${lvl.color}10`, border: `2px solid ${lvl.color}30`,
                  borderRadius: 10, padding: 10,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: lvl.color, marginBottom: 6, textTransform: 'uppercase' }}>
                    {lvl.label}
                  </div>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {Array.from({ length: lvl.blocks }).map((_, i) => (
                      <div key={i} style={{
                        width: 26, height: 20, borderRadius: 4,
                        background: lvl.color + '55', border: `1px solid ${lvl.color}`,
                        fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: lvl.color, fontWeight: 700,
                      }}>
                        tmp
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {showMergeMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center', padding: '10px 16px',
                background: `${C.orange}15`, borderRadius: 10,
                fontSize: 13, fontWeight: 700, color: C.orange, marginTop: 4,
              }}
            >
              Total Extra: O(n) = {SPACE_N * 3} cells shown ({SPACE_N} per level)
            </motion.div>
          )}
        </div>
      </div>

      <NeuronTip type="warning">
        <strong>The classic speed-space tradeoff:</strong> Merge Sort is faster O(n log n) but uses O(n) extra memory. Bubble Sort is slower O(n²) but uses O(1) memory. You'll see this tradeoff everywhere in CS!
      </NeuronTip>
    </InteractiveDemo>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────── */
export default function Topic6Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 4px' }}>

      {/* Hero intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
          border: '2px solid #a5b4fc',
          borderRadius: 24,
          padding: '32px 36px',
          marginBottom: 36,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          style={{
            position: 'absolute', top: -30, right: -30, fontSize: 120,
            opacity: 0.06, pointerEvents: 'none', userSelect: 'none',
          }}
        >
          ⚡
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 6px 20px #6366f144',
          }}>
            🔀
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>
              Topic 6 — DSA
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 30, fontWeight: 800,
              color: '#1e1b4b', margin: 0, lineHeight: 1.2,
            }}>
              Merge Sort
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 16, color: '#3730a3', lineHeight: 1.7, margin: 0, maxWidth: 600 }}>
          Divide the problem in half. Solve each half. Merge them back. <strong>O(n log n)</strong> — the most elegant algorithm you'll ever see.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          {['Divide & Conquer', 'O(n log n)', 'Recursion Tree', 'O(n) Space'].map(tag => (
            <span key={tag} style={{
              background: '#6366f118', border: '1px solid #a5b4fc',
              color: '#4338ca', fontWeight: 700, fontSize: 12,
              padding: '4px 12px', borderRadius: 20,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* SECTION 1 — Divide & Conquer Idea */}
      <SectionBlock icon="📄" title="The Divide & Conquer Idea" color={C.blue}>
        <Neuron mood="explaining" size="medium" message="Sorting 100 papers is overwhelmingly hard. But sorting 2 papers? Trivially easy — just compare and swap! What if we keep splitting the pile in half until each pile has exactly 1 paper, then merge them back in order?" />
        <div style={{ height: 24 }} />
        <PaperPileDemo />
        <NeuronTip type="simple">
          A single paper is always sorted. Merging two sorted piles is easy. So: split all the way down, then merge all the way back up. That's Merge Sort!
        </NeuronTip>
        <HindiExplainer
          concept="विभाजन और जीत (Divide & Conquer)"
          english="Divide & Conquer Strategy"
          explanation="100 papers sort karna bahut mushkil lagta hai. Lekin agar hum pile ko aadha-aadha karte rahe jab tak ek-ek paper rah jaye, toh phir unhe sorted order mein wapas jod-te hain. Ye hi Merge Sort ka magic hai!"
          example="Socho ek library mein 100 kitaabein random order mein hain. Tum unhe do dher mein baanto, phir phir baanto, jab tak ek-ek rahe. Phir adjacent piles ko sorted order mein jodte jao."
          terms={[
            { hindi: 'विभाजित', english: 'Divide', meaning: 'Baant do — array ko do hisson mein' },
            { hindi: 'जीतो', english: 'Conquer', meaning: 'Chhote hisso ko solve karo (yahan: 1 element = already sorted)' },
            { hindi: 'मिलाओ', english: 'Merge', meaning: 'Do sorted arrays ko ek sorted array mein jodo' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 2 — Merge Sort Visualizer */}
      <SectionBlock icon="📊" title="Merge Sort Visualizer" color={C.indigo}>
        <Neuron mood="excited" size="medium" message="Watch each step live! Blue bars are SPLITTING (going down the recursion tree). Green bars are MERGING (coming back up, sorted). Use Step mode to go one operation at a time." />
        <div style={{ height: 24 }} />
        <MergeSortVisualizer />
        <NeuronTip type="tip">
          The split phase only reorganizes indices — no comparisons. All comparisons happen during the MERGE phase when we stitch sorted halves together.
        </NeuronTip>
      </SectionBlock>

      {/* SECTION 3 — The Merge Operation */}
      <SectionBlock icon="🔗" title="The Merge Operation" color={C.green}>
        <Neuron mood="thinking" size="medium" message="Merging is the KEY operation in Merge Sort. Given two sorted arrays, we just walk two pointers and always pick the smaller value. It costs O(n) — linear time — which is why Merge Sort is so fast overall." />
        <div style={{ height: 24 }} />
        <MergeOperationDemo />
        <NeuronTip type="deep">
          Why is merging two sorted arrays O(n)? Each element is picked exactly once. We never re-examine any element. Two pointers, one pass — that's it!
        </NeuronTip>
        <HindiExplainer
          concept="Merge Operation — O(n)"
          english="Merging two sorted arrays"
          explanation="Do sorted arrays ko merge karna simple hai. Do pointers lo — ek left array pe, ek right array pe. Jo chota ho, use result mein daalo aur us pointer ko aage badhao. Jab tak dono arrays khatam na ho jaye."
          example="Ek do queues hain: pehli mein 2,5,8 hain sorted, doosri mein 1,4,7 hain sorted. Tum compare karo: 2 vs 1 — 1 chhota, le lo. Phir 2 vs 4 — 2 chhota, le lo. Aisi tarah ek baar mein sab merge ho jata hai."
          terms={[
            { hindi: 'सूचक', english: 'Pointer', meaning: 'Current position in array' },
            { hindi: 'तुलना', english: 'Comparison', meaning: 'Do values ko compare karna — kaunsa chhota' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 4 — Recursion Tree */}
      <SectionBlock icon="🌳" title="Recursion Tree" color={C.purple}>
        <Neuron mood="explaining" size="medium" message="The recursion tree shows ALL the recursive calls at once. Level 0 is the full array. Each level splits everything in half. There are log₂(n) levels. Each level touches every element once — n work per level. So: n × log(n) total." />
        <div style={{ height: 24 }} />
        <RecursionTreeSection />
        <NeuronTip type="fun">
          log₂(1,000,000) = 20. So Merge Sort on a million elements does only 20 × 1,000,000 = 20 million operations. Bubble Sort does 500 billion. That's a 25,000x difference!
        </NeuronTip>
        <HindiExplainer
          concept="Recursion Tree — पुनरावृत्ति वृक्ष"
          english="Recursion Tree Visualization"
          explanation="Recursion tree ek diagram hai jo dikhata hai ki merge sort kitni baar apne aap ko call karta hai. Har level pe array aadha hota jata hai. Total levels = log(n). Har level pe sab elements ek baar touch hote hain = n work. Total = n × log(n)."
          example="Socho ek family tree. Dada ke neeche 2 bachche, phir 4 pote, phir 8... har level pe count 2x ho jata hai. Ulta karo — n elements se shuru karo, har level pe aadha ho jata hai. log(n) levels lagenge."
          terms={[
            { hindi: 'पुनरावृत्ति', english: 'Recursion', meaning: 'Function apne aap ko call karna' },
            { hindi: 'वृक्ष', english: 'Tree', meaning: 'Branching structure jisme har node ke 2 bacche hain' },
            { hindi: 'गहराई', english: 'Depth', meaning: 'Kitne levels deep gaye — log(n) hota hai' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 5 — Race */}
      <SectionBlock icon="🏁" title="Merge Sort vs Bubble Sort Race" color={C.orange}>
        <Neuron mood="excited" size="medium" message="Same array. Same starting gun. Merge Sort finishes in O(n log n) operations. Bubble Sort plods through O(n²). Pick a bigger n and watch the gap explode. At n=100 the difference is already dramatic!" />
        <div style={{ height: 24 }} />
        <RaceSection />
        <NeuronTip type="example">
          <strong>Real impact:</strong> Sorting 100,000 user records — Bubble Sort: 5 billion ops. Merge Sort: 1.7 million ops. If each op takes 1 nanosecond: Bubble Sort = 5 seconds. Merge Sort = 0.0017 seconds. You FEEL this difference.
        </NeuronTip>
      </SectionBlock>

      {/* SECTION 6 — Space Tradeoff */}
      <SectionBlock icon="💾" title="The Space Tradeoff" color={C.teal}>
        <Neuron mood="thinking" size="medium" message="Every algorithm has costs. Merge Sort is fast, but it needs a temporary buffer to merge into — you can't merge two halves in-place easily. That costs O(n) extra memory. Bubble Sort is slow but needs only O(1) extra space. Speed costs memory." />
        <div style={{ height: 24 }} />
        <SpaceTradeoffSection />
        <HindiExplainer
          concept="Space-Time Tradeoff — गति-स्थान का समझौता"
          english="Speed costs memory"
          explanation="Computer science mein aksar ek tradeoff hota hai: agar tum fast chahte ho, toh zyada memory lagti hai. Agar memory bachana chahte ho, toh algorithm slow hoga. Merge Sort tez hai — O(n log n) — lekin O(n) extra memory chahiye. Bubble Sort dhheema hai — O(n²) — lekin sirf O(1) extra chahiye."
          example="Ek chef ko socho. Ek chef ek hi cutting board pe sab kuch karta hai — slow but clean workspace. Doosra chef alag-alag bowls use karta hai har cheez ke liye — fast but messy kitchen. Merge Sort doosre chef jaisa hai!"
          terms={[
            { hindi: 'समय जटिलता', english: 'Time Complexity', meaning: 'Kitna time lagta hai — n ke hisab se' },
            { hindi: 'स्थान जटिलता', english: 'Space Complexity', meaning: 'Kitni extra memory chahiye' },
            { hindi: 'समझौता', english: 'Tradeoff', meaning: 'Ek cheez badhao toh doosri ghategi' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 7 — Hindi Summary */}
      <SectionBlock icon="हिं" title="Hindi Summary — हिंदी में सारांश" color={C.orange}>
        <Neuron
          mood="waving"
          size="large"
          message="Exam papers wali analogy — 100 papers sort karna mushkil, 2 papers easy. Baant-te jao jab tak 1-1 paper rahe, phir sorted order mein jod-te jao. Yahi Merge Sort hai — simple idea, powerful result!"
        />
        <div style={{ height: 20 }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14, marginTop: 8,
        }}>
          {[
            { term: 'Divide = विभाजित', meaning: 'Array ko baant do', color: C.blue, icon: '✂️' },
            { term: 'Conquer = जीतो', meaning: '1-element base case — already sorted!', color: C.purple, icon: '🏆' },
            { term: 'Merge = मिलाओ', meaning: 'Two sorted halves → one sorted', color: C.green, icon: '🔗' },
            { term: 'Recursion = पुनरावृत्ति', meaning: 'Function apne aap ko call karta hai', color: C.orange, icon: '🔄' },
            { term: 'O(n log n)', meaning: 'Optimal comparison sort!', color: C.indigo, icon: '⚡' },
            { term: 'O(n) space', meaning: 'Speed ka price — extra memory', color: C.teal, icon: '💾' },
          ].map(({ term, meaning, color, icon }) => (
            <motion.div
              key={term}
              whileHover={{ scale: 1.03, y: -2 }}
              style={{
                background: `${color}0e`,
                border: `1.5px solid ${color}35`,
                borderRadius: 14, padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'var(--font-heading)' }}>{term}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{meaning}</div>
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <HindiExplainer
            concept="Merge Sort — पूरा सारांश"
            english="Complete Summary"
            explanation="Merge Sort ek divide-and-conquer algorithm hai. Yeh array ko tab tak baant-ta rehta hai jab tak ek-ek element rahe (jo ki automatically sorted hai). Phir in chhote sorted pieces ko wapas jod-ta hai — har baar sorted order mein. Total complexity O(n log n) hai kyunki log(n) levels hain aur har level pe n kaam hota hai."
            example="Imagine karo tum ek bade pyaaz ko chhhote-chhote tukdon mein kaat rahe ho. Akela tukda cut nahi hota — already done. Phir tukdon ko kisi order mein wapas sajaate ho. Yahi merge sort karta hai numbers ke saath!"
            terms={[
              { hindi: 'विभाजित करो', english: 'Divide', meaning: 'Array ko recursively aadha-aadha baanto' },
              { hindi: 'जीतो', english: 'Conquer', meaning: 'Base case — 1 element is sorted' },
              { hindi: 'मिलाओ', english: 'Merge', meaning: 'Do sorted arrays ko ek mein jodo — O(n)' },
              { hindi: 'पुनरावृत्ति', english: 'Recursion', meaning: 'Function khud ko call karta hai' },
            ]}
          />
        </div>
      </SectionBlock>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: 'linear-gradient(135deg, #eef2ff, #ede9fe)',
          border: '2px solid #a5b4fc',
          borderRadius: 22,
          padding: '32px 36px',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800,
          color: '#1e1b4b', marginBottom: 10,
        }}>
          You understood Merge Sort!
        </h3>
        <p style={{ color: '#4338ca', fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          Divide, conquer, merge — this pattern repeats in Quick Sort, FFT, external sorting, and merge in Git. You've learned the most important algorithmic idea in computer science.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['O(n log n) runtime', 'O(n) space', 'Stable sort', 'Parallelizable'].map(feat => (
            <span key={feat} style={{
              background: '#6366f118', border: '1px solid #a5b4fc',
              color: '#4338ca', fontWeight: 700, fontSize: 12,
              padding: '5px 14px', borderRadius: 20,
            }}>
              {feat}
            </span>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
