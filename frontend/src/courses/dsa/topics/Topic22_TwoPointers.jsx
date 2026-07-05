import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 22 — Two Pointers & Sliding Window
   The #1 interview pattern — solve array problems in O(n) not O(n²)
   Visual-first, interactive, NO text walls.
================================================================ */

/* ─── shared palette ──────────────────────────────────────────── */
const C = {
  left:    '#6366f1',
  right:   '#ec4899',
  window:  '#0ea5e9',
  hit:     '#10b981',
  miss:    '#f43f5e',
  muted:   'var(--text-secondary)',
  border:  'var(--border)',
  bg:      'var(--card-bg)',
  accent:  'var(--accent)',
}

/* ─── tiny helpers ────────────────────────────────────────────── */
const pill = (bg, color, text, extra = {}) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '4px 14px', borderRadius: 20, background: bg, color,
  fontSize: 13, fontWeight: 700, ...extra,
})

const btn = (active, color = C.accent) => ({
  padding: '10px 24px', borderRadius: 30, border: '2px solid',
  borderColor: active ? color : C.border,
  background: active ? color : 'transparent',
  color: active ? '#fff' : C.muted,
  fontWeight: 700, fontSize: 14, cursor: 'pointer',
  transition: 'all 0.22s', fontFamily: 'inherit',
})

function Btn({ active, color, onClick, children, disabled, style = {} }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      style={{ ...btn(active, color), opacity: disabled ? 0.45 : 1, ...style }}
    >
      {children}
    </motion.button>
  )
}

/* ================================================================
   SECTION 1 — Two Sum (Sorted Array): Brute Force vs Two Pointers
================================================================ */
const TS_ARR = [1, 3, 5, 7, 9, 11, 13, 15]
const TS_TARGET = 16

function buildBrutePairs(arr) {
  const pairs = []
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      pairs.push({ i, j, sum: arr[i] + arr[j], hit: arr[i] + arr[j] === TS_TARGET })
  return pairs
}

function buildTwoPtrSteps(arr, target) {
  const steps = []
  let l = 0, r = arr.length - 1
  while (l < r) {
    const s = arr[l] + arr[r]
    steps.push({ l, r, sum: s, hit: s === target, action: s < target ? 'Move left →' : s > target ? '← Move right' : 'Found!' })
    if (s === target) break
    else if (s < target) l++
    else r--
  }
  return steps
}

function TwoSumSection() {
  const pairs = buildBrutePairs(TS_ARR)
  const tpSteps = buildTwoPtrSteps(TS_ARR, TS_TARGET)

  const [mode, setMode] = useState('brute')        // 'brute' | 'twoptr'
  const [stepIdx, setStepIdx] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)

  const maxSteps = mode === 'brute' ? pairs.length : tpSteps.length

  const reset = useCallback(() => {
    clearTimeout(timerRef.current)
    setStepIdx(-1)
    setPlaying(false)
  }, [])

  useEffect(() => { reset() }, [mode, reset])

  useEffect(() => {
    if (!playing) return
    if (stepIdx >= maxSteps - 1) { setPlaying(false); return }
    const delay = mode === 'brute' ? 120 : 700
    timerRef.current = setTimeout(() => setStepIdx(s => s + 1), delay)
    return () => clearTimeout(timerRef.current)
  }, [playing, stepIdx, maxSteps, mode])

  const play = () => { setStepIdx(0); setPlaying(true) }
  const pause = () => setPlaying(false)
  const resume = () => setPlaying(true)

  /* highlight logic */
  const highlightI = mode === 'brute'
    ? (stepIdx >= 0 ? pairs[Math.min(stepIdx, pairs.length - 1)].i : -1)
    : (stepIdx >= 0 ? tpSteps[Math.min(stepIdx, tpSteps.length - 1)].l : -1)
  const highlightJ = mode === 'brute'
    ? (stepIdx >= 0 ? pairs[Math.min(stepIdx, pairs.length - 1)].j : -1)
    : (stepIdx >= 0 ? tpSteps[Math.min(stepIdx, tpSteps.length - 1)].r : -1)
  const currentHit = stepIdx >= 0 && (
    mode === 'brute' ? pairs[Math.min(stepIdx, pairs.length - 1)].hit
                     : tpSteps[Math.min(stepIdx, tpSteps.length - 1)].hit
  )

  return (
    <InteractiveDemo title="Two Sum — Sorted Array">
      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
        {[['brute', 'Brute Force O(n²)'], ['twoptr', 'Two Pointers O(n)']].map(([m, label]) => (
          <Btn key={m} active={mode === m} color={m === 'brute' ? C.miss : C.hit} onClick={() => setMode(m)}>
            {label}
          </Btn>
        ))}
      </div>

      {/* Target badge */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={pill('#6366f120', C.left, `Target = ${TS_TARGET}`, { fontSize: 15 })}>
          Target Sum = {TS_TARGET}
        </span>
      </div>

      {/* Array visualisation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {TS_ARR.map((v, i) => {
          const isLeft = i === highlightI
          const isRight = i === highlightJ
          const active = isLeft || isRight
          return (
            <motion.div
              key={i}
              animate={active ? { y: -8, scale: 1.12 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              style={{
                width: 52, height: 52, borderRadius: 12,
                background: active ? (currentHit ? C.hit : isLeft ? C.left : C.right) : 'var(--card-bg)',
                border: `2px solid ${active ? (currentHit ? C.hit : isLeft ? C.left : C.right) : C.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18,
                color: active ? '#fff' : 'var(--text-primary)',
                boxShadow: active ? `0 6px 20px ${currentHit ? C.hit : isLeft ? C.left : C.right}55` : 'none',
                position: 'relative',
              }}
            >
              {v}
              <span style={{ fontSize: 10, opacity: 0.65 }}>[{i}]</span>
              {isLeft && <span style={{ position: 'absolute', top: -22, fontSize: 12, color: C.left, fontWeight: 700 }}>L</span>}
              {isRight && <span style={{ position: 'absolute', top: -22, fontSize: 12, color: C.right, fontWeight: 700 }}>R</span>}
            </motion.div>
          )
        })}
      </div>

      {/* Pointer arrows legend */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginBottom: 24 }}>
        <span style={pill(`${C.left}22`, C.left, 'Left pointer (L)')} />
        <span style={pill(`${C.right}22`, C.right, 'Right pointer (R)')} />
        <span style={pill(`${C.hit}22`, C.hit, 'Match found!')} />
      </div>

      {/* Step info panel */}
      <AnimatePresence mode="wait">
        {stepIdx >= 0 && (
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'var(--card-bg)',
              border: `1.5px solid ${currentHit ? C.hit : C.border}`,
              borderRadius: 12, padding: '14px 20px', marginBottom: 20, textAlign: 'center',
            }}
          >
            {mode === 'brute' ? (
              <>
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  Check pair ({TS_ARR[pairs[Math.min(stepIdx, pairs.length-1)].i]}, {TS_ARR[pairs[Math.min(stepIdx, pairs.length-1)].j]})
                  {' '}= {pairs[Math.min(stepIdx, pairs.length-1)].sum}
                  {' '}{currentHit ? '✓ Found!' : '✗'}
                </span>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                  Pair {stepIdx + 1} / {pairs.length} checked
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  arr[L={tpSteps[Math.min(stepIdx, tpSteps.length-1)].l}] + arr[R={tpSteps[Math.min(stepIdx, tpSteps.length-1)].r}]
                  {' '}= {TS_ARR[tpSteps[Math.min(stepIdx, tpSteps.length-1)].l]} + {TS_ARR[tpSteps[Math.min(stepIdx, tpSteps.length-1)].r]}
                  {' '}= {tpSteps[Math.min(stepIdx, tpSteps.length-1)].sum}
                </span>
                <div style={{ fontSize: 14, color: currentHit ? C.hit : C.accent, marginTop: 4, fontWeight: 700 }}>
                  {tpSteps[Math.min(stepIdx, tpSteps.length-1)].action}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                  Step {stepIdx + 1} / {tpSteps.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complexity scoreboard */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
        <div style={{
          padding: '12px 20px', borderRadius: 12,
          background: `${C.miss}15`, border: `1.5px solid ${C.miss}44`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.miss }}>28</div>
          <div style={{ fontSize: 12, color: C.muted }}>Brute force pairs</div>
        </div>
        <div style={{ padding: '12px 20px', borderRadius: 12, background: `${C.hit}15`, border: `1.5px solid ${C.hit}44`, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.hit }}>{tpSteps.length}</div>
          <div style={{ fontSize: 12, color: C.muted }}>Two-pointer steps</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn active={false} color={C.accent} onClick={play} disabled={playing || stepIdx >= 0}>
          Auto Play
        </Btn>
        {playing
          ? <Btn active onClick={pause} color={C.miss}>Pause</Btn>
          : stepIdx >= 0 && stepIdx < maxSteps - 1
            ? <Btn active onClick={resume} color={C.hit}>Resume</Btn>
            : null
        }
        {!playing && stepIdx < maxSteps - 1 && stepIdx >= 0 && (
          <Btn active={false} color={C.accent} onClick={() => setStepIdx(s => Math.min(s + 1, maxSteps - 1))}>
            Step
          </Btn>
        )}
        <Btn active={false} color={C.muted} onClick={reset}>Reset</Btn>
      </div>

      <div style={{ marginTop: 24 }}>
        <NeuronTip type="tip">
          Because the array is sorted, if the sum is too small we KNOW we need a bigger left value — move L right.
          If too big, we need a smaller right value — move R left. We never miss the answer!
        </NeuronTip>
      </div>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 2 — Two Pointer Patterns Gallery
================================================================ */
const PATTERNS = [
  {
    id: 'opposite',
    label: 'Opposite Ends',
    color: '#6366f1',
    icon: '↔',
    desc: 'Start from both ends, converge inward',
    uses: ['Two Sum', 'Container With Most Water', 'Palindrome Check'],
    frames: [
      { arr: ['A','B','C','D','E'], l: 0, r: 4, note: 'L at start, R at end' },
      { arr: ['A','B','C','D','E'], l: 1, r: 3, note: 'Both move inward' },
      { arr: ['A','B','C','D','E'], l: 2, r: 2, note: 'Pointers meet — done!' },
    ],
  },
  {
    id: 'fastSlow',
    label: 'Slow / Fast',
    color: '#0ea5e9',
    icon: '→→',
    desc: 'Both start at beginning; fast moves ahead',
    uses: ['Remove Duplicates', 'Linked List Cycle', 'Find Middle'],
    frames: [
      { arr: [1,1,2,2,3], l: 0, r: 0, note: 'Slow (write) & Fast (read) both at 0' },
      { arr: [1,1,2,2,3], l: 0, r: 1, note: 'Fast advances, duplicate — skip' },
      { arr: [1,1,2,2,3], l: 0, r: 2, note: 'Fast finds new value 2' },
      { arr: [1,1,2,2,3], l: 1, r: 2, note: 'Slow writes 2, both advance' },
      { arr: [1,1,2,2,3], l: 1, r: 4, note: 'Fast finds 3 — new unique' },
      { arr: [1,1,2,2,3], l: 2, r: 4, note: 'Slow writes 3 — done!' },
    ],
  },
  {
    id: 'merge',
    label: 'Merge Two Arrays',
    color: '#10b981',
    icon: '⇒⇒',
    desc: 'One pointer per sorted array, compare & merge',
    uses: ['Merge Sorted Arrays', 'Merge Sort', 'Intersection'],
    frames: [
      { arr: [1,3,5], arr2: [2,4,6], l: 0, r: 0, note: 'Compare 1 vs 2 → pick 1' },
      { arr: [1,3,5], arr2: [2,4,6], l: 1, r: 0, note: 'Compare 3 vs 2 → pick 2' },
      { arr: [1,3,5], arr2: [2,4,6], l: 1, r: 1, note: 'Compare 3 vs 4 → pick 3' },
      { arr: [1,3,5], arr2: [2,4,6], l: 2, r: 1, note: 'Compare 5 vs 4 → pick 4' },
      { arr: [1,3,5], arr2: [2,4,6], l: 2, r: 2, note: 'Compare 5 vs 6 → pick 5, then 6' },
    ],
  },
  {
    id: 'partition',
    label: 'Partition',
    color: '#f59e0b',
    icon: '✎',
    desc: 'Read pointer scans, write pointer places non-zeros',
    uses: ['Move Zeros to End', 'QuickSort Partition', 'Filter In-Place'],
    frames: [
      { arr: [0,1,0,3,12], l: 0, r: 0, note: 'Write=0, Read=0: 0 is zero, skip' },
      { arr: [0,1,0,3,12], l: 0, r: 1, note: 'Read=1: non-zero! Write 1 at pos 0' },
      { arr: [1,1,0,3,12], l: 1, r: 2, note: 'Write advances. Read=2: zero, skip' },
      { arr: [1,1,0,3,12], l: 1, r: 3, note: 'Read=3: non-zero! Write 3 at pos 1' },
      { arr: [1,3,0,3,12], l: 2, r: 4, note: 'Write 12 at pos 2. Fill rest with 0s' },
    ],
  },
]

function PatternCard({ pattern, active, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      style={{
        padding: '16px 20px', borderRadius: 14, cursor: 'pointer',
        border: `2px solid ${active ? pattern.color : C.border}`,
        background: active ? `${pattern.color}14` : 'var(--card-bg)',
        transition: 'all 0.25s', minWidth: 140,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{pattern.icon}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: active ? pattern.color : 'var(--text-primary)' }}>
        {pattern.label}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{pattern.desc}</div>
    </motion.div>
  )
}

function PatternDemo({ pattern }) {
  const [frameIdx, setFrameIdx] = useState(0)
  const frames = pattern.frames
  const frame = frames[Math.min(frameIdx, frames.length - 1)]
  const isMerge = pattern.id === 'merge'

  useEffect(() => { setFrameIdx(0) }, [pattern.id])

  const renderArr = (arr, highlightIdx, pointerLabel, pointerColor) => (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {arr.map((v, i) => {
        const hl = i === highlightIdx
        return (
          <motion.div
            key={i}
            animate={hl ? { y: -6, scale: 1.12 } : { y: 0, scale: 1 }}
            style={{
              width: 44, height: 44, borderRadius: 10,
              background: hl ? pointerColor : 'var(--card-bg)',
              border: `2px solid ${hl ? pointerColor : C.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 16,
              color: hl ? '#fff' : 'var(--text-primary)',
              position: 'relative',
            }}
          >
            {v}
            {hl && (
              <span style={{ position: 'absolute', top: -18, fontSize: 11, color: pointerColor, fontWeight: 700 }}>
                {pointerLabel}
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )

  return (
    <div style={{ marginTop: 20 }}>
      {isMerge ? (
        <>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, textAlign: 'center' }}>Array 1</div>
          {renderArr(frame.arr, frame.l, 'P1', pattern.color)}
          <div style={{ fontSize: 12, color: C.muted, marginTop: 14, marginBottom: 6, textAlign: 'center' }}>Array 2</div>
          {renderArr(frame.arr2, frame.r, 'P2', '#ec4899')}
        </>
      ) : (
        renderArr(frame.arr, -1, '', '')
      )}

      {/* For non-merge, show both pointers in the same array */}
      {!isMerge && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          {frame.arr.map((v, i) => {
            const isL = i === frame.l
            const isR = i === frame.r
            const isBoth = isL && isR
            const bg = isBoth ? '#a855f7' : isL ? C.left : isR ? C.right : 'var(--card-bg)'
            return (
              <motion.div
                key={i}
                animate={(isL || isR) ? { y: -6, scale: 1.12 } : { y: 0, scale: 1 }}
                style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: bg, border: `2px solid ${(isL || isR) ? bg : C.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16,
                  color: (isL || isR) ? '#fff' : 'var(--text-primary)',
                  position: 'relative',
                }}
              >
                {v}
                {isL && !isBoth && <span style={{ position: 'absolute', top: -18, fontSize: 11, color: C.left, fontWeight: 700 }}>W</span>}
                {isR && !isBoth && <span style={{ position: 'absolute', top: -18, fontSize: 11, color: C.right, fontWeight: 700 }}>R</span>}
                {isBoth && <span style={{ position: 'absolute', top: -18, fontSize: 11, color: '#a855f7', fontWeight: 700 }}>L=R</span>}
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={frameIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            marginTop: 16, padding: '10px 16px', borderRadius: 10,
            background: `${pattern.color}14`, border: `1.5px solid ${pattern.color}44`,
            textAlign: 'center', fontSize: 14, color: 'var(--text-primary)',
          }}
        >
          {frame.note}
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
        <Btn active={false} color={C.muted} onClick={() => setFrameIdx(f => Math.max(0, f - 1))} disabled={frameIdx === 0}>
          Prev
        </Btn>
        <span style={{ padding: '10px 0', color: C.muted, fontSize: 13 }}>
          {frameIdx + 1} / {frames.length}
        </span>
        <Btn active color={pattern.color} onClick={() => setFrameIdx(f => Math.min(frames.length - 1, f + 1))} disabled={frameIdx === frames.length - 1}>
          Next
        </Btn>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 600 }}>Used in:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {pattern.uses.map(u => (
            <span key={u} style={pill(`${pattern.color}18`, pattern.color, u)}>{u}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function PatternGallery() {
  const [active, setActive] = useState(PATTERNS[0].id)
  const pattern = PATTERNS.find(p => p.id === active)

  return (
    <InteractiveDemo title="Two Pointer Patterns Gallery">
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        {PATTERNS.map(p => (
          <PatternCard key={p.id} pattern={p} active={active === p.id} onClick={() => setActive(p.id)} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.28 }}
        >
          <PatternDemo pattern={pattern} />
        </motion.div>
      </AnimatePresence>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 3 — Sliding Window Fixed Size
================================================================ */
const SW_ARR = [2, 1, 5, 1, 3, 2]
const SW_K = 3

function buildWindowSteps(arr, k) {
  const steps = []
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0)
  steps.push({ start: 0, sum: windowSum, maxSoFar: windowSum, leaving: null, entering: null })
  for (let i = k; i < arr.length; i++) {
    const leaving = arr[i - k]
    const entering = arr[i]
    windowSum = windowSum - leaving + entering
    steps.push({ start: i - k + 1, sum: windowSum, maxSoFar: Math.max(...steps.map(s => s.sum), windowSum), leaving: i - k, entering: i })
  }
  return steps
}

function FixedWindowSection() {
  const steps = buildWindowSteps(SW_ARR, SW_K)
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)
  const cur = steps[stepIdx]

  useEffect(() => {
    if (!playing) return
    if (stepIdx >= steps.length - 1) { setPlaying(false); return }
    timerRef.current = setTimeout(() => setStepIdx(s => s + 1), 900)
    return () => clearTimeout(timerRef.current)
  }, [playing, stepIdx, steps.length])

  const reset = () => { clearTimeout(timerRef.current); setStepIdx(0); setPlaying(false) }
  const maxSum = Math.max(...steps.map(s => s.sum))

  return (
    <InteractiveDemo title="Sliding Window — Fixed Size (k = 3)">
      <Neuron mood="explaining" size="small" style={{ marginBottom: 20 }}>
        Instead of recomputing the window sum from scratch each time, just subtract the element leaving and add the one entering. One pass = O(n)!
      </Neuron>

      {/* Array with window overlay */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          {SW_ARR.map((v, i) => {
            const inWindow = i >= cur.start && i < cur.start + SW_K
            const isLeaving = i === cur.leaving
            const isEntering = i === cur.entering
            return (
              <motion.div
                key={i}
                animate={inWindow ? { y: -6 } : { y: 0 }}
                style={{
                  width: 52, height: 52, borderRadius: 12, position: 'relative',
                  background: inWindow ? C.window : 'var(--card-bg)',
                  border: `2px solid ${inWindow ? C.window : C.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 20,
                  color: inWindow ? '#fff' : 'var(--text-primary)',
                  boxShadow: inWindow ? `0 6px 20px ${C.window}44` : 'none',
                  transition: 'all 0.3s',
                }}
              >
                {v}
                <span style={{ fontSize: 10, opacity: 0.7 }}>[{i}]</span>
                {isLeaving && (
                  <motion.span
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -20 }}
                    style={{ position: 'absolute', top: -32, fontSize: 12, color: C.miss, fontWeight: 700 }}>
                    -{v}
                  </motion.span>
                )}
                {isEntering && (
                  <motion.span
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -20 }}
                    style={{ position: 'absolute', top: -32, fontSize: 12, color: C.hit, fontWeight: 700 }}>
                    +{v}
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Window bracket label */}
      <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 13, color: C.window, fontWeight: 600 }}>
        Window [{cur.start} ... {cur.start + SW_K - 1}]
      </div>

      {/* Sum display */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ padding: '14px 24px', borderRadius: 12, background: `${C.window}15`, border: `1.5px solid ${C.window}44`, textAlign: 'center' }}>
          <motion.div
            key={cur.sum}
            initial={{ scale: 1.4, color: C.hit }}
            animate={{ scale: 1, color: 'var(--text-primary)' }}
            style={{ fontSize: 28, fontWeight: 800 }}
          >
            {cur.sum}
          </motion.div>
          <div style={{ fontSize: 12, color: C.muted }}>Current window sum</div>
        </div>
        <div style={{ padding: '14px 24px', borderRadius: 12, background: `${C.hit}15`, border: `1.5px solid ${C.hit}44`, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.hit }}>{maxSum}</div>
          <div style={{ fontSize: 12, color: C.muted }}>Max sum found</div>
        </div>
      </div>

      {/* Step info */}
      {cur.leaving !== null && (
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center', padding: '10px', borderRadius: 10,
              background: 'var(--card-bg)', border: `1px solid ${C.border}`,
              marginBottom: 20, fontSize: 14,
            }}
          >
            Slide: subtract <strong style={{ color: C.miss }}>{SW_ARR[cur.leaving]}</strong> (left out) + add <strong style={{ color: C.hit }}>{SW_ARR[cur.entering]}</strong> (entered) = <strong>{cur.sum}</strong>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Step progress dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {steps.map((s, i) => (
          <motion.div
            key={i}
            onClick={() => { setPlaying(false); setStepIdx(i) }}
            animate={{ scale: i === stepIdx ? 1.3 : 1 }}
            style={{
              width: 12, height: 12, borderRadius: '50%', cursor: 'pointer',
              background: i === stepIdx ? C.window : i < stepIdx ? `${C.window}66` : C.border,
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <Btn active={false} color={C.muted} onClick={() => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)) }} disabled={stepIdx === 0}>
          Prev
        </Btn>
        {playing
          ? <Btn active color={C.miss} onClick={() => setPlaying(false)}>Pause</Btn>
          : <Btn active color={C.window} onClick={() => setPlaying(true)} disabled={stepIdx === steps.length - 1}>
              {stepIdx === 0 ? 'Auto Slide' : 'Resume'}
            </Btn>
        }
        <Btn active={false} color={C.accent} onClick={() => { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)) }} disabled={stepIdx === steps.length - 1}>
          Next
        </Btn>
        <Btn active={false} color={C.muted} onClick={reset}>Reset</Btn>
      </div>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 4 — Sliding Window Variable Size
================================================================ */
const VAR_ARR = [2, 3, 1, 2, 4, 3, 5, 1]
const VAR_TARGET = 15

function VarWindowSection() {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(-1)
  const [currentSum, setCurrentSum] = useState(0)
  const [minLen, setMinLen] = useState(Infinity)
  const [minWindow, setMinWindow] = useState(null)
  const [history, setHistory] = useState([])
  const [done, setDone] = useState(false)

  const reset = () => {
    setLeft(0); setRight(-1); setCurrentSum(0)
    setMinLen(Infinity); setMinWindow(null); setHistory([]); setDone(false)
  }

  const expand = () => {
    if (done) return
    const newRight = right + 1
    if (newRight >= VAR_ARR.length) { setDone(true); return }
    const newSum = currentSum + VAR_ARR[newRight]
    setRight(newRight)
    setCurrentSum(newSum)
    setHistory(h => [...h, `Expand → add [${newRight}]=${VAR_ARR[newRight]} → sum=${newSum}`])
    if (newSum >= VAR_TARGET) {
      const len = newRight - left + 1
      if (len < minLen) { setMinLen(len); setMinWindow({ l: left, r: newRight }) }
    }
  }

  const shrink = () => {
    if (left > right || done) return
    const newSum = currentSum - VAR_ARR[left]
    const newLeft = left + 1
    setCurrentSum(newSum)
    setLeft(newLeft)
    setHistory(h => [...h, `Shrink ← remove [${left}]=${VAR_ARR[left]} → sum=${newSum}`])
    if (newSum >= VAR_TARGET) {
      const len = right - newLeft + 1
      if (len < minLen) { setMinLen(len); setMinWindow({ l: newLeft, r: right }) }
    }
  }

  const windowSize = right >= left ? right - left + 1 : 0
  const meetsTarget = currentSum >= VAR_TARGET

  return (
    <InteractiveDemo title="Sliding Window — Variable Size">
      <Neuron mood="thinking" size="small" style={{ marginBottom: 20 }}>
        Find the smallest subarray with sum ≥ {VAR_TARGET}. The window EXPANDS right to build up the sum, then SHRINKS left to minimize the size.
      </Neuron>

      {/* Array */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {VAR_ARR.map((v, i) => {
          const inWindow = i >= left && i <= right
          const isMinWin = minWindow && i >= minWindow.l && i <= minWindow.r
          const isLeft = i === left
          const isRight = i === right
          return (
            <motion.div
              key={i}
              animate={inWindow ? { y: -8, scale: 1.08 } : { y: 0, scale: 1 }}
              style={{
                width: 50, height: 50, borderRadius: 12, position: 'relative',
                background: done && isMinWin ? C.hit
                  : inWindow ? (meetsTarget ? `${C.hit}cc` : `${C.window}cc`)
                  : 'var(--card-bg)',
                border: `2px solid ${done && isMinWin ? C.hit : inWindow ? (meetsTarget ? C.hit : C.window) : C.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18,
                color: inWindow ? '#fff' : 'var(--text-primary)',
                transition: 'all 0.3s',
                boxShadow: inWindow ? `0 6px 18px ${meetsTarget ? C.hit : C.window}44` : 'none',
              }}
            >
              {v}
              <span style={{ fontSize: 10, opacity: 0.7 }}>[{i}]</span>
              {isLeft && right >= left && <span style={{ position: 'absolute', bottom: -20, fontSize: 11, color: C.left, fontWeight: 700 }}>L</span>}
              {isRight && <span style={{ position: 'absolute', bottom: -20, fontSize: 11, color: C.right, fontWeight: 700 }}>R</span>}
            </motion.div>
          )
        })}
      </div>

      {/* Spacer for pointer labels */}
      <div style={{ height: 24 }} />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
        <div style={{ padding: '12px 18px', borderRadius: 10, background: `${C.window}15`, border: `1.5px solid ${C.window}44`, textAlign: 'center', minWidth: 90 }}>
          <motion.div key={currentSum} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontSize: 24, fontWeight: 800, color: meetsTarget ? C.hit : C.window }}>
            {currentSum}
          </motion.div>
          <div style={{ fontSize: 11, color: C.muted }}>Current sum</div>
          <div style={{ fontSize: 11, color: C.muted }}>target: {VAR_TARGET}</div>
        </div>
        <div style={{ padding: '12px 18px', borderRadius: 10, background: 'var(--card-bg)', border: `1px solid ${C.border}`, textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{windowSize}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Window size</div>
        </div>
        <div style={{ padding: '12px 18px', borderRadius: 10, background: `${C.hit}15`, border: `1.5px solid ${C.hit}44`, textAlign: 'center', minWidth: 90 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.hit }}>
            {minLen === Infinity ? '—' : minLen}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>Min size found</div>
        </div>
      </div>

      {/* Hint */}
      <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 13, fontWeight: 600,
        color: meetsTarget ? C.hit : C.window }}>
        {right < 0 ? 'Press Expand to start' : meetsTarget ? `Sum ${currentSum} ≥ ${VAR_TARGET} — try Shrink to minimize!` : `Sum ${currentSum} < ${VAR_TARGET} — Expand the window`}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <Btn active color={C.window} onClick={expand} disabled={done || right >= VAR_ARR.length - 1}>
          Expand →
        </Btn>
        <Btn active color={C.miss} onClick={shrink} disabled={left > right || !meetsTarget}>
          Shrink ←
        </Btn>
        <Btn active={false} color={C.muted} onClick={reset}>Reset</Btn>
      </div>

      {/* History log */}
      {history.length > 0 && (
        <div style={{
          maxHeight: 130, overflowY: 'auto', padding: 12, borderRadius: 10,
          background: 'var(--card-bg)', border: `1px solid ${C.border}`,
          fontSize: 12, color: C.muted,
        }}>
          {history.slice(-6).map((h, i) => (
            <div key={i} style={{ padding: '2px 0', borderBottom: `1px solid ${C.border}44` }}>{h}</div>
          ))}
        </div>
      )}

      {done && minWindow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: 16, padding: '14px 20px', borderRadius: 12,
            background: `${C.hit}15`, border: `2px solid ${C.hit}`,
            textAlign: 'center', fontWeight: 700, fontSize: 15, color: C.hit,
          }}
        >
          Minimum subarray: indices [{minWindow.l}...{minWindow.r}] = [{VAR_ARR.slice(minWindow.l, minWindow.r + 1).join(', ')}], length = {minLen}
        </motion.div>
      )}
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 5 — Container With Most Water
================================================================ */
const WATER_HEIGHTS = [1, 8, 6, 2, 5, 4, 8, 3, 7]

function buildWaterSteps(heights) {
  const steps = []
  let l = 0, r = heights.length - 1, maxWater = 0
  while (l < r) {
    const h = Math.min(heights[l], heights[r])
    const w = r - l
    const water = h * w
    maxWater = Math.max(maxWater, water)
    steps.push({ l, r, h, w, water, maxWater, moveLeft: heights[l] <= heights[r] })
    if (heights[l] <= heights[r]) l++
    else r--
  }
  return steps
}

function ContainerSection() {
  const steps = buildWaterSteps(WATER_HEIGHTS)
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef(null)
  const cur = steps[Math.min(stepIdx, steps.length - 1)]
  const maxH = Math.max(...WATER_HEIGHTS)
  const BAR_W = 44

  useEffect(() => {
    if (!playing) return
    if (stepIdx >= steps.length - 1) { setPlaying(false); return }
    timerRef.current = setTimeout(() => setStepIdx(s => s + 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [playing, stepIdx, steps.length])

  const reset = () => { clearTimeout(timerRef.current); setStepIdx(0); setPlaying(false) }

  const CHART_H = 180

  return (
    <InteractiveDemo title="Container With Most Water">
      <Neuron mood="excited" size="small" style={{ marginBottom: 20 }}>
        We have vertical bars. Two pointers find the pair that holds the MOST water. Always move the SHORTER bar inward — moving the taller one can only decrease the water level!
      </Neuron>

      {/* Bar chart with water */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: 5, height: CHART_H + 30, marginBottom: 20, padding: '0 12px',
        position: 'relative',
      }}>
        {WATER_HEIGHTS.map((h, i) => {
          const barH = (h / maxH) * CHART_H
          const waterH = (cur.h / maxH) * CHART_H
          const inWater = i > cur.l && i < cur.r
          const isL = i === cur.l
          const isR = i === cur.r
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* pointer labels */}
              <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                {isL && <span style={{ color: C.left }}>L</span>}
                {isR && <span style={{ color: C.right }}>R</span>}
              </div>

              <div style={{ position: 'relative', width: BAR_W }}>
                {/* water fill */}
                {(inWater || isL || isR) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: Math.min(waterH, barH) }}
                    style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: inWater ? '#0ea5e988' : 'transparent',
                      borderRadius: '3px 3px 0 0', zIndex: 1,
                    }}
                  />
                )}
                {/* bar */}
                <motion.div
                  animate={{ height: barH }}
                  style={{
                    width: BAR_W, borderRadius: '5px 5px 0 0',
                    background: isL ? C.left : isR ? C.right : `${C.window}44`,
                    border: `2px solid ${isL ? C.left : isR ? C.right : `${C.window}66`}`,
                    boxShadow: (isL || isR) ? `0 4px 14px ${isL ? C.left : C.right}55` : 'none',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                    paddingTop: 5,
                    fontWeight: 700, fontSize: 13,
                    color: (isL || isR) ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.35s',
                  }}
                >
                  {h}
                </motion.div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>[{i}]</div>
            </div>
          )
        })}
      </div>

      {/* Water info */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ padding: '12px 18px', borderRadius: 10, background: `${C.window}15`, border: `1.5px solid ${C.window}44`, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.window }}>{cur.water}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Current water</div>
          <div style={{ fontSize: 11, color: C.muted }}>min({WATER_HEIGHTS[cur.l]},{WATER_HEIGHTS[cur.r]})×{cur.w}</div>
        </div>
        <div style={{ padding: '12px 18px', borderRadius: 10, background: `${C.hit}15`, border: `1.5px solid ${C.hit}44`, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.hit }}>{cur.maxWater}</div>
          <div style={{ fontSize: 11, color: C.muted }}>Max water</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center', padding: '10px 16px', borderRadius: 10,
            background: 'var(--card-bg)', border: `1px solid ${C.border}`,
            marginBottom: 20, fontSize: 14,
          }}
        >
          {cur.moveLeft
            ? `Left bar (${WATER_HEIGHTS[cur.l]}) is shorter — move L inward`
            : `Right bar (${WATER_HEIGHTS[cur.r]}) is shorter — move R inward`}
          {stepIdx === steps.length - 1 && <span style={{ color: C.hit, fontWeight: 700 }}> — Answer: {cur.maxWater}</span>}
        </motion.div>
      </AnimatePresence>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        {steps.map((_, i) => (
          <motion.div
            key={i}
            onClick={() => { setPlaying(false); setStepIdx(i) }}
            animate={{ scale: i === stepIdx ? 1.3 : 1 }}
            style={{
              width: 10, height: 10, borderRadius: '50%', cursor: 'pointer',
              background: i === stepIdx ? C.window : i < stepIdx ? `${C.window}66` : C.border,
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn active={false} color={C.muted} onClick={() => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)) }} disabled={stepIdx === 0}>Prev</Btn>
        {playing
          ? <Btn active color={C.miss} onClick={() => setPlaying(false)}>Pause</Btn>
          : <Btn active color={C.window} onClick={() => setPlaying(true)} disabled={stepIdx >= steps.length - 1}>
              {stepIdx === 0 ? 'Auto Play' : 'Resume'}
            </Btn>
        }
        <Btn active={false} color={C.accent} onClick={() => { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)) }} disabled={stepIdx === steps.length - 1}>Next</Btn>
        <Btn active={false} color={C.muted} onClick={reset}>Reset</Btn>
      </div>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 6 — Interview Challenge Arena
================================================================ */

/* ---- Challenge 1: Remove Duplicates ---- */
const RD_ARR = [1, 1, 2, 2, 3, 4, 4, 5]

function RemoveDupChallenge() {
  const [fast, setFast] = useState(1)
  const [slow, setSlow] = useState(0)
  const [written, setWritten] = useState([...RD_ARR])
  const [done, setDone] = useState(false)
  const [steps, setSteps] = useState([{ fast: 1, slow: 0, msg: 'slow=0 (write head), fast=1 (read head)' }])

  const reset = () => {
    setFast(1); setSlow(0); setWritten([...RD_ARR]); setDone(false)
    setSteps([{ fast: 1, slow: 0, msg: 'slow=0 (write head), fast=1 (read head)' }])
  }

  const advance = () => {
    if (done || fast >= RD_ARR.length) { setDone(true); return }
    if (RD_ARR[fast] !== RD_ARR[slow]) {
      const newSlow = slow + 1
      const newWritten = [...written]
      newWritten[newSlow] = RD_ARR[fast]
      setSlow(newSlow)
      setWritten(newWritten)
      setSteps(s => [...s, { fast, slow: newSlow, msg: `arr[${fast}]=${RD_ARR[fast]} ≠ arr[${slow}]=${RD_ARR[slow]} → write ${RD_ARR[fast]} at pos ${newSlow}` }])
    } else {
      setSteps(s => [...s, { fast, slow, msg: `arr[${fast}]=${RD_ARR[fast]} = arr[${slow}]=${RD_ARR[slow]} → duplicate, skip` }])
    }
    const newFast = fast + 1
    setFast(newFast)
    if (newFast >= RD_ARR.length) setDone(true)
  }

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
        Remove Duplicates from Sorted Array
      </div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {written.map((v, i) => {
          const isSlow = i === slow
          const isFast = i === fast
          const isResult = done && i <= slow
          return (
            <motion.div
              key={i}
              animate={(isSlow || isFast) ? { y: -5 } : { y: 0 }}
              style={{
                width: 42, height: 42, borderRadius: 10,
                background: isResult ? `${C.hit}cc` : isSlow ? C.left : isFast ? C.right : 'var(--card-bg)',
                border: `2px solid ${isResult ? C.hit : isSlow ? C.left : isFast ? C.right : C.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16,
                color: (isSlow || isFast || isResult) ? '#fff' : 'var(--text-primary)',
                position: 'relative',
              }}
            >
              {v}
              {isSlow && <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: C.left, fontWeight: 700 }}>W</span>}
              {isFast && <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: C.right, fontWeight: 700 }}>R</span>}
            </motion.div>
          )
        })}
      </div>
      <div style={{ marginBottom: 12 }}>
        {steps.slice(-2).map((s, i) => (
          <div key={i} style={{ fontSize: 12, color: C.muted, padding: '2px 0' }}>{s.msg}</div>
        ))}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 14, color: C.hit, fontWeight: 700, marginBottom: 10 }}>
          Result: [{written.slice(0, slow + 1).join(', ')}] — {slow + 1} unique elements
        </motion.div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Btn active color={C.accent} onClick={advance} disabled={done}>Advance Fast Pointer</Btn>
        <Btn active={false} color={C.muted} onClick={reset}>Reset</Btn>
      </div>
    </div>
  )
}

/* ---- Challenge 2: Longest Substring Without Repeating Characters ---- */
const LSW_STR = 'abcabcbb'.split('')

function LongestSubstringChallenge() {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)
  const [seen, setSeen] = useState(new Set(['a']))
  const [maxLen, setMaxLen] = useState(1)
  const [maxWindow, setMaxWindow] = useState({ l: 0, r: 0 })
  const [done, setDone] = useState(false)
  const [log, setLog] = useState([`Start: window "a" at [0,0]`])

  const reset = () => {
    setLeft(0); setRight(0); setSeen(new Set(['a'])); setMaxLen(1)
    setMaxWindow({ l: 0, r: 0 }); setDone(false)
    setLog([`Start: window "a" at [0,0]`])
  }

  const step = () => {
    if (done) return
    const nextRight = right + 1
    if (nextRight >= LSW_STR.length) { setDone(true); return }
    const ch = LSW_STR[nextRight]
    if (!seen.has(ch)) {
      const newSeen = new Set(seen)
      newSeen.add(ch)
      setSeen(newSeen)
      setRight(nextRight)
      const len = nextRight - left + 1
      if (len > maxLen) { setMaxLen(len); setMaxWindow({ l: left, r: nextRight }) }
      setLog(l => [...l, `Expand: add '${ch}' → "${LSW_STR.slice(left, nextRight + 1).join('')}" len=${len}`])
    } else {
      const newSeen = new Set(seen)
      newSeen.delete(LSW_STR[left])
      setSeen(newSeen)
      setLeft(l => l + 1)
      setLog(l => [...l, `Shrink: '${ch}' duplicate, remove '${LSW_STR[left]}' from left`])
    }
  }

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
        Longest Substring Without Repeating Characters
      </div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, justifyContent: 'center' }}>
        {LSW_STR.map((ch, i) => {
          const inWindow = i >= left && i <= right
          const isBest = !done && i >= maxWindow.l && i <= maxWindow.r
          const isBestDone = done && i >= maxWindow.l && i <= maxWindow.r
          return (
            <motion.div
              key={i}
              animate={inWindow ? { y: -5 } : { y: 0 }}
              style={{
                width: 44, height: 44, borderRadius: 10,
                background: isBestDone ? C.hit : inWindow ? C.window : 'var(--card-bg)',
                border: `2px solid ${isBestDone ? C.hit : inWindow ? C.window : C.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18,
                color: (inWindow || isBestDone) ? '#fff' : 'var(--text-primary)',
              }}
            >
              {ch}
              <span style={{ fontSize: 9, opacity: 0.7 }}>[{i}]</span>
            </motion.div>
          )
        })}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 13, color: C.window }}>
        Window: "{LSW_STR.slice(left, right + 1).join('')}" | Seen: {[...seen].sort().join('')} | Max: {maxLen}
      </div>
      <div style={{ marginBottom: 10 }}>
        {log.slice(-3).map((l, i) => (
          <div key={i} style={{ fontSize: 12, color: C.muted }}>{l}</div>
        ))}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 14, color: C.hit, fontWeight: 700, marginBottom: 10 }}>
          Longest substring: "{LSW_STR.slice(maxWindow.l, maxWindow.r + 1).join('')}" — length {maxLen}
        </motion.div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn active color={C.window} onClick={step} disabled={done}>Step</Btn>
        <Btn active={false} color={C.muted} onClick={reset}>Reset</Btn>
      </div>
    </div>
  )
}

/* ---- Challenge 3: 3Sum ---- */
const THREE_ARR = [-4, -1, -1, 0, 1, 2]

function ThreeSumChallenge() {
  const [fixed, setFixed] = useState(0)
  const [left, setLeft] = useState(1)
  const [right, setRight] = useState(THREE_ARR.length - 1)
  const [found, setFound] = useState([])
  const [done, setDone] = useState(false)
  const [log, setLog] = useState([])

  const reset = () => {
    setFixed(0); setLeft(1); setRight(THREE_ARR.length - 1)
    setFound([]); setDone(false); setLog([])
  }

  const step = () => {
    if (done) return
    if (fixed >= THREE_ARR.length - 2) { setDone(true); return }
    const sum = THREE_ARR[fixed] + THREE_ARR[left] + THREE_ARR[right]
    const tripletStr = `[${THREE_ARR[fixed]}, ${THREE_ARR[left]}, ${THREE_ARR[right]}]`

    if (sum === 0) {
      setFound(f => {
        const key = tripletStr
        if (!f.includes(key)) return [...f, key]
        return f
      })
      setLog(l => [...l, `${tripletStr} = 0 — Found!`])
      if (left + 1 < right) {
        setLeft(l => l + 1)
        setRight(r => r - 1)
      } else {
        // move fixed
        const newFixed = fixed + 1
        setFixed(newFixed)
        setLeft(newFixed + 1)
        setRight(THREE_ARR.length - 1)
      }
    } else if (sum < 0) {
      setLog(l => [...l, `${tripletStr} = ${sum} < 0 → move Left`])
      if (left + 1 < right) setLeft(lv => lv + 1)
      else { const nf = fixed + 1; setFixed(nf); setLeft(nf + 1); setRight(THREE_ARR.length - 1) }
    } else {
      setLog(l => [...l, `${tripletStr} = ${sum} > 0 → move Right`])
      if (left < right - 1) setRight(rv => rv - 1)
      else { const nf = fixed + 1; setFixed(nf); setLeft(nf + 1); setRight(THREE_ARR.length - 1) }
    }
    if (fixed >= THREE_ARR.length - 3 && left >= right - 1) setDone(true)
  }

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)' }}>
        3Sum = 0 (sorted array)
      </div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, justifyContent: 'center' }}>
        {THREE_ARR.map((v, i) => {
          const isFix = i === fixed
          const isL = i === left
          const isR = i === right
          const isActive = isFix || isL || isR
          const bg = isFix ? '#f59e0b' : isL ? C.left : isR ? C.right : 'var(--card-bg)'
          return (
            <motion.div
              key={i}
              animate={isActive ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
              style={{
                width: 44, height: 44, borderRadius: 10,
                background: isActive ? bg : 'var(--card-bg)',
                border: `2px solid ${isActive ? bg : C.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16,
                color: isActive ? '#fff' : 'var(--text-primary)',
                position: 'relative',
              }}
            >
              {v}
              {isFix && <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>FIX</span>}
              {isL && <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: C.left, fontWeight: 700 }}>L</span>}
              {isR && <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: C.right, fontWeight: 700 }}>R</span>}
            </motion.div>
          )
        })}
      </div>
      <div style={{ height: 20 }} />
      <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 14, fontWeight: 600 }}>
        Sum: {THREE_ARR[fixed]} + {THREE_ARR[left]} + {THREE_ARR[right]} = <span style={{ color: THREE_ARR[fixed]+THREE_ARR[left]+THREE_ARR[right] === 0 ? C.hit : C.accent }}>
          {THREE_ARR[fixed] + THREE_ARR[left] + THREE_ARR[right]}
        </span>
      </div>
      <div style={{ marginBottom: 10 }}>
        {log.slice(-3).map((l, i) => (
          <div key={i} style={{ fontSize: 12, color: C.muted }}>{l}</div>
        ))}
      </div>
      {found.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {found.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'inline-block', marginRight: 8, padding: '4px 12px', borderRadius: 20, background: `${C.hit}22`, color: C.hit, fontWeight: 700, fontSize: 13 }}>
              {f}
            </motion.div>
          ))}
        </div>
      )}
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 14, color: C.hit, fontWeight: 700, marginBottom: 10 }}>
          Done! Found {found.length} triplet{found.length !== 1 ? 's' : ''} that sum to 0.
        </motion.div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Btn active color='#f59e0b' onClick={step} disabled={done}>Step</Btn>
        <Btn active={false} color={C.muted} onClick={reset}>Reset</Btn>
      </div>
    </div>
  )
}

function ChallengeArena() {
  const [challenge, setChallenge] = useState(0)
  const challenges = [
    { label: 'Remove Duplicates', component: <RemoveDupChallenge /> },
    { label: 'Longest Substring', component: <LongestSubstringChallenge /> },
    { label: '3Sum = 0', component: <ThreeSumChallenge /> },
  ]

  return (
    <InteractiveDemo title="Interview Challenge Arena">
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        {challenges.map((c, i) => (
          <Btn key={i} active={challenge === i} color={C.accent} onClick={() => setChallenge(i)}>
            {i + 1}. {c.label}
          </Btn>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={challenge}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {challenges[challenge].component}
        </motion.div>
      </AnimatePresence>
    </InteractiveDemo>
  )
}

/* ================================================================
   ROOT EXPORT
================================================================ */
export default function Topic22Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Hero intro */}
      <SectionBlock title="Two Pointers & Sliding Window" icon="👆👆">
        <Neuron mood="excited" size="medium">
          Two pointers is the #1 interview pattern. Instead of checking every pair (O(n²)), place two pointers on the array and move them smartly — reducing to O(n). Sliding Window does the same for subarray problems. Master these and you'll crush 30+ Leetcode problems!
        </Neuron>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 24 }}>
          {[
            { label: 'Two Pointers', desc: 'O(n) pair checking', color: C.left },
            { label: 'Sliding Window', desc: 'O(n) subarray sums', color: C.window },
            { label: 'vs Brute Force', desc: 'O(n²) without tricks', color: C.miss },
          ].map(item => (
            <div key={item.label} style={{
              flex: '1 1 140px', padding: '16px 20px', borderRadius: 14,
              background: `${item.color}12`, border: `1.5px solid ${item.color}44`,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.label}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* Section 1 — Two Sum */}
      <SectionBlock title="The Two Sum Problem (Sorted Array)" icon="➕">
        <TwoSumSection />
        <div style={{ marginTop: 20 }}>
          <NeuronTip type="warning">
            Two pointers only works on SORTED arrays for Two Sum. If the array is unsorted, use a hash map for O(n) time.
          </NeuronTip>
        </div>
      </SectionBlock>

      {/* Section 2 — Patterns */}
      <SectionBlock title="Two Pointer Patterns" icon="🗺">
        <PatternGallery />
      </SectionBlock>

      {/* Section 3 — Fixed Window */}
      <SectionBlock title="Sliding Window — Fixed Size" icon="🪟">
        <FixedWindowSection />
      </SectionBlock>

      {/* Section 4 — Variable Window */}
      <SectionBlock title="Sliding Window — Variable Size" icon="↔️">
        <VarWindowSection />
        <div style={{ marginTop: 20 }}>
          <NeuronTip type="deep">
            The key insight: every element is added at most once (expand) and removed at most once (shrink) — so the total operations is O(n) even though we have two nested-looking loops!
          </NeuronTip>
        </div>
      </SectionBlock>

      {/* Section 5 — Container With Most Water */}
      <SectionBlock title="Container With Most Water" icon="💧">
        <ContainerSection />
        <div style={{ marginTop: 20 }}>
          <NeuronTip type="tip">
            Why move the shorter bar? Because the water is limited by the SHORTER bar. Moving the taller bar inward can only make things worse (shorter width, same height limit). Moving the shorter bar is the only hope for more water!
          </NeuronTip>
        </div>
      </SectionBlock>

      {/* Section 6 — Challenge Arena */}
      <SectionBlock title="Interview Challenge Arena" icon="🏟">
        <ChallengeArena />
      </SectionBlock>

      {/* Section 7 — Hindi Summary */}
      <SectionBlock title="Hindi Explainer" icon="हिं">
        <HindiExplainer
          concept="Two Pointers & Sliding Window"
          english="Two pointers: place one at each end (or both at start), move smartly to avoid nested loops."
          explanation="Do Pointers = do ungliyan ek array pe. Ek left se start hoti hai, ek right se — dono milkar O(n) mein wo problem solve kar dete hain jo brute force O(n²) mein karta. Sliding Window = ek frame jo array pe slide karta hai — andar jaane wala element jodta hai, bahar jaane wala ghatata hai. Baar-baar sum compute nahi karna padta!"
          example="[1,3,5,7,9] mein target=10 dhundhna hai: L=1 (index 0), R=9 (index 4). 1+9=10 — mil gaya! Sirf 1 step. Brute force: 10 steps."
          terms={[
            { hindi: 'दो सूचक', english: 'Two Pointers', meaning: 'Array ke do sirron pe do variables' },
            { hindi: 'खिसकती खिड़की', english: 'Sliding Window', meaning: 'Array pe ek frame jo slide karta hai' },
            { hindi: 'बायां', english: 'Left', meaning: 'Array ka chhota index' },
            { hindi: 'दायां', english: 'Right', meaning: 'Array ka bada index' },
            { hindi: 'सिकुड़ना', english: 'Shrink', meaning: 'Window ke left ko aage badhana' },
            { hindi: 'फैलना', english: 'Expand', meaning: 'Window ke right ko aage badhana' },
            { hindi: 'टकराना', english: 'Pointers collide', meaning: 'Jab L >= R — loop khatam' },
          ]}
        />
      </SectionBlock>

    </div>
  )
}
