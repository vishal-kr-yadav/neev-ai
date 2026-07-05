import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 5 — Selection Sort & Insertion Sort
   Visual-first, interactive, NO text walls.
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
  lime: '#84cc16',
}

const BAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#06b6d4', '#ef4444', '#14b8a6', '#84cc16',
]

function randomArray(n = 10, min = 15, max = 95) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

/* ================================================================
   SECTION 1 — Selection Sort Visualizer
================================================================ */
function SelectionSortVisualizer() {
  const [arr, setArr] = useState(() => randomArray(10))
  const [phase, setPhase] = useState('idle') // idle | scanning | found | swapping | done
  const [roundIdx, setRoundIdx] = useState(0)
  const [scanIdx, setScanIdx] = useState(-1)
  const [minIdx, setMinIdx] = useState(-1)
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [speed, setSpeed] = useState(600)
  const [isPlaying, setIsPlaying] = useState(false)
  const stateRef = useRef({})

  stateRef.current = { arr, roundIdx, scanIdx, minIdx, comparisons, swaps, phase }

  const reset = useCallback(() => {
    setArr(randomArray(10))
    setPhase('idle')
    setRoundIdx(0)
    setScanIdx(-1)
    setMinIdx(-1)
    setComparisons(0)
    setSwaps(0)
    setIsPlaying(false)
  }, [])

  const doStep = useCallback(() => {
    const s = stateRef.current
    if (s.phase === 'done') return false

    const n = s.arr.length
    if (s.roundIdx >= n - 1) {
      setPhase('done')
      return false
    }

    // Start of round: initialize scan
    if (s.phase === 'idle' || s.phase === 'swapping') {
      const nextRound = s.phase === 'swapping' ? s.roundIdx + 1 : s.roundIdx
      if (nextRound >= n - 1) { setPhase('done'); return false }
      setRoundIdx(nextRound)
      setScanIdx(nextRound + 1)
      setMinIdx(nextRound)
      setPhase('scanning')
      setComparisons(c => c + 1)
      return true
    }

    // Scanning phase: advance scan pointer
    if (s.phase === 'scanning') {
      const nextScan = s.scanIdx + 1
      const newMin = s.arr[nextScan - 1] < s.arr[s.minIdx] ? nextScan - 1 : s.minIdx
      setMinIdx(newMin)
      if (nextScan >= n) {
        // End of scan — perform swap
        setPhase('swapping')
        if (newMin !== s.roundIdx) {
          setArr(prev => {
            const a = [...prev]
            ;[a[s.roundIdx], a[newMin]] = [a[newMin], a[s.roundIdx]]
            return a
          })
          setSwaps(sw => sw + 1)
        }
        setScanIdx(-1)
        return true
      }
      setScanIdx(nextScan)
      setComparisons(c => c + 1)
      return true
    }

    return false
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const cont = doStep()
      if (!cont) setIsPlaying(false)
    }, speed)
    return () => clearInterval(id)
  }, [isPlaying, speed, doStep])

  const getBarStyle = (idx) => {
    const sorted = idx < roundIdx || phase === 'done'
    const isCurrent = idx === roundIdx && phase !== 'done'
    const isMin = idx === minIdx && phase === 'scanning'
    const isScanning = idx === scanIdx && phase === 'scanning'

    let bg = BAR_COLORS[idx % BAR_COLORS.length]
    let border = 'none'
    let shadow = 'none'
    let scale = 1
    let zIndex = 1

    if (sorted) { bg = C.green; border = `2px solid #059669`; }
    if (isCurrent) { border = `3px solid ${C.orange}`; }
    if (isMin) { bg = C.red; shadow = `0 0 18px ${C.red}88`; scale = 1.08; zIndex = 5 }
    if (isScanning) { bg = C.cyan; shadow = `0 0 12px ${C.cyan}66`; scale = 1.04 }

    return { bg, border, shadow, scale, zIndex }
  }

  const maxVal = Math.max(...arr)

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Round', val: Math.min(roundIdx + 1, arr.length - 1), color: C.indigo },
          { label: 'Comparisons', val: comparisons, color: C.orange },
          { label: 'Swaps', val: swaps, color: C.red },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 90, background: `${s.color}12`,
            border: `1.5px solid ${s.color}30`, borderRadius: 14, padding: '12px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { color: C.green, label: 'Sorted' },
          { color: C.orange, label: 'Current Start' },
          { color: C.red, label: 'Minimum Found' },
          { color: C.cyan, label: 'Scanning' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 6,
        height: 180, padding: '0 8px', marginBottom: 12,
        background: 'var(--bg-secondary)', borderRadius: 16,
      }}>
        {arr.map((val, idx) => {
          const bs = getBarStyle(idx)
          return (
            <motion.div
              key={idx}
              animate={{ scaleY: 1, scale: bs.scale }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                flex: 1,
                height: `${(val / maxVal) * 140 + 20}px`,
                background: bs.bg,
                borderRadius: '6px 6px 0 0',
                border: bs.border,
                boxShadow: bs.shadow,
                position: 'relative',
                cursor: 'default',
                zIndex: bs.zIndex,
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            >
              <div style={{
                position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap',
              }}>{val}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Status message */}
      <div style={{
        textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)',
        fontWeight: 600, minHeight: 24, marginBottom: 18,
      }}>
        {phase === 'idle' && 'Press Step or Auto Play to begin'}
        {phase === 'scanning' && scanIdx >= 0 && `Round ${roundIdx + 1}: Scanning index ${scanIdx}, current min at index ${minIdx} (value ${arr[minIdx]})`}
        {phase === 'swapping' && `Swapping minimum (${arr[roundIdx]}) to position ${roundIdx}`}
        {phase === 'done' && '✓ Array fully sorted! Selection Sort complete.'}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setIsPlaying(!isPlaying) }}
          disabled={phase === 'done'}
          style={{
            padding: '10px 22px', borderRadius: 30, border: 'none', cursor: phase === 'done' ? 'not-allowed' : 'pointer',
            background: isPlaying ? C.red : C.indigo, color: '#fff',
            fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
          }}>
          {isPlaying ? '⏸ Pause' : '▶ Auto Play'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={doStep} disabled={isPlaying || phase === 'done'}
          style={{
            padding: '10px 22px', borderRadius: 30, border: `2px solid ${C.blue}`,
            background: 'transparent', color: C.blue, fontWeight: 700, fontSize: 14,
            cursor: isPlaying || phase === 'done' ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
          Step →
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={reset}
          style={{
            padding: '10px 22px', borderRadius: 30, border: `2px solid var(--border)`,
            background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
          Reset
        </motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Speed</span>
          <input type="range" min={100} max={1200} step={100} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ flex: 1, accentColor: C.indigo }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 50 }}>{speed}ms</span>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 2 — Insertion Sort Visualizer (Card Player)
================================================================ */
function InsertionSortVisualizer() {
  const [arr, setArr] = useState(() => randomArray(8))
  const [keyIdx, setKeyIdx] = useState(1)
  const [insertPos, setInsertPos] = useState(-1)
  const [phase, setPhase] = useState('idle') // idle | lifted | inserting | done
  const [comparisons, setComparisons] = useState(0)
  const [shifts, setShifts] = useState(0)
  const [speed, setSpeed] = useState(700)
  const [isPlaying, setIsPlaying] = useState(false)
  const stateRef = useRef({})
  stateRef.current = { arr, keyIdx, insertPos, phase, comparisons, shifts }

  const reset = useCallback(() => {
    setArr(randomArray(8))
    setKeyIdx(1)
    setInsertPos(-1)
    setPhase('idle')
    setComparisons(0)
    setShifts(0)
    setIsPlaying(false)
  }, [])

  const doStep = useCallback(() => {
    const s = stateRef.current
    if (s.phase === 'done') return false
    const n = s.arr.length

    if (s.keyIdx >= n) { setPhase('done'); return false }

    // Lift the key element
    if (s.phase === 'idle') {
      setPhase('lifted')
      setInsertPos(s.keyIdx - 1)
      setComparisons(c => c + 1)
      return true
    }

    // Compare and shift
    if (s.phase === 'lifted' || s.phase === 'inserting') {
      const curPos = s.insertPos
      const keyVal = s.arr[s.keyIdx]

      if (curPos >= 0 && s.arr[curPos] > keyVal) {
        // Shift element right
        setArr(prev => {
          const a = [...prev]
          a[curPos + 1] = a[curPos]
          return a
        })
        setShifts(sh => sh + 1)
        setInsertPos(curPos - 1)
        setPhase('inserting')
        setComparisons(c => c + 1)
        return true
      } else {
        // Insert key at curPos + 1
        setArr(prev => {
          const a = [...prev]
          a[curPos + 1] = keyVal
          return a
        })
        const nextKey = s.keyIdx + 1
        if (nextKey >= n) {
          setPhase('done')
        } else {
          setKeyIdx(nextKey)
          setPhase('idle')
        }
        setInsertPos(-1)
        return nextKey < n
      }
    }

    return false
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const cont = doStep()
      if (!cont) setIsPlaying(false)
    }, speed)
    return () => clearInterval(id)
  }, [isPlaying, speed, doStep])

  const maxVal = Math.max(...arr)

  const getBarStyle = (idx) => {
    const isSorted = idx < keyIdx || phase === 'done'
    const isKey = idx === keyIdx && (phase === 'lifted' || phase === 'inserting')
    const isCompare = idx === insertPos && phase !== 'idle'

    let bg = BAR_COLORS[idx % BAR_COLORS.length]
    let lift = 0
    let border = 'none'
    let shadow = 'none'

    if (isSorted && !isKey) { bg = C.green; border = `2px solid #059669` }
    if (isKey) {
      bg = C.orange; lift = -24
      border = `3px solid ${C.orange}`
      shadow = `0 8px 24px ${C.orange}66`
    }
    if (isCompare && !isKey) { bg = C.purple; shadow = `0 0 14px ${C.purple}55`; border = `2px solid ${C.purple}` }

    return { bg, lift, border, shadow }
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Card #', val: Math.min(keyIdx, arr.length), color: C.orange },
          { label: 'Comparisons', val: comparisons, color: C.purple },
          { label: 'Shifts', val: shifts, color: C.pink },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 90, background: `${s.color}12`,
            border: `1.5px solid ${s.color}30`, borderRadius: 14, padding: '12px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { color: C.green, label: 'Sorted Hand' },
          { color: C.orange, label: 'Card Picked Up' },
          { color: C.purple, label: 'Being Compared' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        height: 210, padding: '30px 8px 0', marginBottom: 12,
        background: 'var(--bg-secondary)', borderRadius: 16,
      }}>
        {arr.map((val, idx) => {
          const bs = getBarStyle(idx)
          return (
            <motion.div
              key={idx}
              animate={{ y: bs.lift }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                flex: 1,
                height: `${(val / maxVal) * 140 + 20}px`,
                background: bs.bg,
                borderRadius: '6px 6px 0 0',
                border: bs.border,
                boxShadow: bs.shadow,
                position: 'relative',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            >
              <div style={{
                position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
              }}>{val}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Status */}
      <div style={{
        textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)',
        fontWeight: 600, minHeight: 24, marginBottom: 18,
      }}>
        {phase === 'idle' && keyIdx < arr.length && `Ready to pick up card at position ${keyIdx + 1} (value ${arr[keyIdx]})`}
        {phase === 'lifted' && `Picked up ${arr[keyIdx]} — comparing with left neighbors`}
        {phase === 'inserting' && insertPos >= 0 && `${arr[keyIdx]} < ${arr[insertPos + 1]}? Shifting right...`}
        {phase === 'inserting' && insertPos < 0 && `Inserting at position 0`}
        {phase === 'done' && '✓ All cards sorted! Insertion Sort complete.'}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={phase === 'done'}
          style={{
            padding: '10px 22px', borderRadius: 30, border: 'none',
            background: isPlaying ? C.red : C.orange, color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: phase === 'done' ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}>
          {isPlaying ? '⏸ Pause' : '▶ Auto Play'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={doStep} disabled={isPlaying || phase === 'done'}
          style={{
            padding: '10px 22px', borderRadius: 30, border: `2px solid ${C.blue}`,
            background: 'transparent', color: C.blue, fontWeight: 700, fontSize: 14,
            cursor: isPlaying || phase === 'done' ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
          Step →
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={reset}
          style={{
            padding: '10px 22px', borderRadius: 30, border: `2px solid var(--border)`,
            background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
          New Hand
        </motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Speed</span>
          <input type="range" min={100} max={1200} step={100} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ flex: 1, accentColor: C.orange }} />
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 3 — Battle Arena: Bubble vs Selection vs Insertion
================================================================ */

// Simple sync sort generators for the race
function* bubbleSortGen(arr) {
  const a = [...arr]
  const n = a.length
  let comps = 0, swapsCount = 0
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comps++
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        swapsCount++
      }
      yield { arr: [...a], comps, swapsCount }
    }
  }
  yield { arr: [...a], comps, swapsCount, done: true }
}

function* selectionSortGen(arr) {
  const a = [...arr]
  const n = a.length
  let comps = 0, swapsCount = 0
  for (let i = 0; i < n - 1; i++) {
    let minI = i
    for (let j = i + 1; j < n; j++) {
      comps++
      if (a[j] < a[minI]) minI = j
    }
    if (minI !== i) {
      ;[a[i], a[minI]] = [a[minI], a[i]]
      swapsCount++
    }
    yield { arr: [...a], comps, swapsCount }
  }
  yield { arr: [...a], comps, swapsCount, done: true }
}

function* insertionSortGen(arr) {
  const a = [...arr]
  const n = a.length
  let comps = 0, swapsCount = 0
  for (let i = 1; i < n; i++) {
    const key = a[i]
    let j = i - 1
    while (j >= 0 && a[j] > key) {
      comps++
      a[j + 1] = a[j]
      swapsCount++
      j--
    }
    comps++
    a[j + 1] = key
    yield { arr: [...a], comps, swapsCount }
  }
  yield { arr: [...a], comps, swapsCount, done: true }
}

function BattleArena() {
  const BASE = useRef(randomArray(10))
  const [states, setStates] = useState({
    bubble: { arr: BASE.current, comps: 0, swaps: 0, done: false },
    selection: { arr: BASE.current, comps: 0, swaps: 0, done: false },
    insertion: { arr: BASE.current, comps: 0, swaps: 0, done: false },
  })
  const [racing, setRacing] = useState(false)
  const [finished, setFinished] = useState(false)
  const gensRef = useRef(null)

  const startRace = () => {
    const base = randomArray(10)
    BASE.current = base
    gensRef.current = {
      bubble: bubbleSortGen(base),
      selection: selectionSortGen(base),
      insertion: insertionSortGen(base),
    }
    setStates({
      bubble: { arr: base, comps: 0, swaps: 0, done: false },
      selection: { arr: base, comps: 0, swaps: 0, done: false },
      insertion: { arr: base, comps: 0, swaps: 0, done: false },
    })
    setFinished(false)
    setRacing(true)
  }

  useEffect(() => {
    if (!racing || !gensRef.current) return
    const id = setInterval(() => {
      const gens = gensRef.current
      let anyRunning = false
      const updates = {}

      for (const [name, gen] of Object.entries(gens)) {
        const { value, done } = gen.next()
        if (!done) {
          anyRunning = true
          updates[name] = { arr: value.arr, comps: value.comps, swaps: value.swapsCount, done: !!value.done }
        }
      }

      setStates(prev => ({ ...prev, ...updates }))

      const allDone = Object.values({ ...states, ...updates }).every(s => s.done)
      if (!anyRunning || allDone) {
        setRacing(false)
        setFinished(true)
      }
    }, 120)
    return () => clearInterval(id)
  }, [racing])

  const ALGOS = [
    { key: 'bubble', label: 'Bubble Sort', color: C.blue, icon: '🫧' },
    { key: 'selection', label: 'Selection Sort', color: C.red, icon: '🔍' },
    { key: 'insertion', label: 'Insertion Sort', color: C.green, icon: '🃏' },
  ]

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={startRace}
        disabled={racing}
        style={{
          display: 'block', margin: '0 auto 28px',
          padding: '14px 40px', borderRadius: 40, border: 'none',
          background: racing ? '#888' : 'linear-gradient(135deg, #6366f1, #ec4899)',
          color: '#fff', fontWeight: 800, fontSize: 18, cursor: racing ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-heading)',
          boxShadow: racing ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
        }}>
        {racing ? '⏳ Racing...' : finished ? '🔁 Race Again!' : '🏁 RACE!'}
      </motion.button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {ALGOS.map(({ key, label, color, icon }) => {
          const s = states[key]
          const maxV = Math.max(...s.arr)
          return (
            <div key={key} style={{
              background: `${color}08`,
              border: `2px solid ${color}${s.done ? 'ff' : '33'}`,
              borderRadius: 18, padding: '16px 14px',
              transition: 'border-color 0.4s',
            }}>
              <div style={{ fontWeight: 800, fontSize: 15, color, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{icon}</span> {label}
                {s.done && <span style={{ marginLeft: 'auto', fontSize: 13, background: color, color: '#fff', padding: '2px 8px', borderRadius: 20 }}>DONE</span>}
              </div>
              {/* Mini bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, marginBottom: 12 }}>
                {s.arr.map((v, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${(v / maxV) * 72 + 8}px`,
                    background: color,
                    borderRadius: '3px 3px 0 0',
                    opacity: s.done ? 1 : 0.75,
                    transition: 'height 0.15s ease-out',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, textAlign: 'center', background: `${color}15`, borderRadius: 10, padding: '6px 4px' }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color }}>{s.comps}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Compares</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: `${color}15`, borderRadius: 10, padding: '6px 4px' }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color }}>{s.swaps}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Swaps</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Result table */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginTop: 28 }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b08, #1e1b4b14)',
              border: '1.5px solid var(--border)',
              borderRadius: 18, overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: 700, fontSize: 15,
              }}>
                Race Results — Key Insight
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: 0, fontSize: 13,
                }}>
                  {['Algorithm', 'Comparisons', 'Swaps', 'Best Use'].map(h => (
                    <div key={h} style={{
                      padding: '8px 12px', fontWeight: 700, color: 'var(--text-secondary)',
                      borderBottom: '2px solid var(--border)', fontSize: 12,
                    }}>{h}</div>
                  ))}
                  {[
                    ['🫧 Bubble', states.bubble.comps, states.bubble.swaps, 'Educational only'],
                    ['🔍 Selection', states.selection.comps, states.selection.swaps, 'Few swaps needed'],
                    ['🃏 Insertion', states.insertion.comps, states.insertion.swaps, 'Nearly sorted data'],
                  ].map(([alg, c, s, use]) => (
                    [alg, c, s, use].map((cell, ci) => (
                      <div key={`${alg}-${ci}`} style={{
                        padding: '8px 12px', color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border)',
                        fontWeight: ci === 0 ? 700 : 400,
                      }}>{cell}</div>
                    ))
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: 14, background: `${C.green}10`, borderRadius: 12, border: `1px solid ${C.green}30`, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: C.green }}>Key Insight:</strong> Selection Sort always does exactly n-1 swaps (minimum possible!). Insertion Sort does the fewest comparisons on nearly-sorted data. Bubble Sort loses on both counts.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   SECTION 4 — Best vs Worst Case
================================================================ */

function BestWorstCase() {
  const [scenario, setScenario] = useState('random')
  const [racing, setRacing] = useState(false)
  const [results, setResults] = useState(null)

  const SCENARIOS = {
    random: { label: 'Random', icon: '🎲', desc: 'All three are O(n²) — roughly equal' },
    sorted: { label: 'Already Sorted', icon: '✅', desc: 'Insertion Sort wins with O(n)! Others still O(n²)' },
    reverse: { label: 'Reverse Sorted', icon: '🔄', desc: 'Worst case for all — Insertion does most shifts' },
    nearly: { label: 'Nearly Sorted', icon: '✨', desc: 'Insertion Sort dominates with very few operations' },
  }

  const buildInput = (type, n = 12) => {
    if (type === 'random') return randomArray(n)
    if (type === 'sorted') return Array.from({ length: n }, (_, i) => 10 + i * 7)
    if (type === 'reverse') return Array.from({ length: n }, (_, i) => 10 + (n - 1 - i) * 7)
    if (type === 'nearly') {
      const a = Array.from({ length: n }, (_, i) => 10 + i * 7)
      // swap 2 random pairs
      for (let k = 0; k < 2; k++) {
        const i = Math.floor(Math.random() * n), j = Math.floor(Math.random() * n)
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
    return randomArray(n)
  }

  const runScenario = () => {
    const input = buildInput(scenario)
    // Run all 3 fully
    const runBubble = (arr) => {
      const a = [...arr]; let c = 0, s = 0
      for (let i = 0; i < a.length - 1; i++)
        for (let j = 0; j < a.length - 1 - i; j++) {
          c++; if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; s++ }
        }
      return { comps: c, swaps: s }
    }
    const runSelection = (arr) => {
      const a = [...arr]; let c = 0, s = 0
      for (let i = 0; i < a.length - 1; i++) {
        let minI = i
        for (let j = i + 1; j < a.length; j++) { c++; if (a[j] < a[minI]) minI = j }
        if (minI !== i) { [a[i], a[minI]] = [a[minI], a[i]]; s++ }
      }
      return { comps: c, swaps: s }
    }
    const runInsertion = (arr) => {
      const a = [...arr]; let c = 0, s = 0
      for (let i = 1; i < a.length; i++) {
        const key = a[i]; let j = i - 1
        while (j >= 0 && a[j] > key) { c++; a[j + 1] = a[j]; s++; j-- }
        c++; a[j + 1] = key
      }
      return { comps: c, swaps: s }
    }
    setResults({ bubble: runBubble(input), selection: runSelection(input), insertion: runInsertion(input), input })
  }

  return (
    <div>
      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries(SCENARIOS).map(([key, { label, icon }]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setScenario(key); setResults(null) }}
            style={{
              padding: '10px 18px', borderRadius: 30, border: `2px solid ${scenario === key ? C.indigo : 'var(--border)'}`,
              background: scenario === key ? `${C.indigo}18` : 'transparent',
              color: scenario === key ? C.indigo : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}>
            {icon} {label}
          </motion.button>
        ))}
      </div>

      <div style={{
        padding: 16, borderRadius: 14,
        background: `${C.orange}10`, border: `1px solid ${C.orange}30`,
        fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20, fontWeight: 500,
      }}>
        <strong style={{ color: C.orange }}>Scenario: </strong>
        {SCENARIOS[scenario].desc}
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={runScenario}
        style={{
          padding: '12px 32px', borderRadius: 30, border: 'none',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer',
          fontFamily: 'var(--font-heading)', marginBottom: 24,
          boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
        }}>
        Run Scenario
      </motion.button>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Input visualization */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Input Array:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {results.input.map((v, i) => (
                  <div key={i} style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 14,
                  }}>{v}</div>
                ))}
              </div>
            </div>

            {/* Comparison bars */}
            {[
              { label: 'Bubble Sort', comps: results.bubble.comps, swaps: results.bubble.swaps, color: C.blue },
              { label: 'Selection Sort', comps: results.selection.comps, swaps: results.selection.swaps, color: C.red },
              { label: 'Insertion Sort', comps: results.insertion.comps, swaps: results.insertion.swaps, color: C.green },
            ].map(({ label, comps, swaps, color }) => {
              const maxComps = Math.max(results.bubble.comps, results.selection.comps, results.insertion.comps) || 1
              return (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color, fontSize: 15 }}>{label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {comps} comps · {swaps} swaps
                    </span>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, height: 16, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(comps / maxComps) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', background: color, borderRadius: 8 }}
                    />
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   SECTION 5 — Be The Algorithm Challenge
================================================================ */
function BeTheAlgorithm() {
  const [mode, setMode] = useState('selection') // selection | insertion
  const [arr] = useState(() => randomArray(8, 10, 80))
  const [userArr, setUserArr] = useState(() => randomArray(8, 10, 80))
  const [round, setRound] = useState(0)
  const [sortedCount, setSortedCount] = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [insertKey, setInsertKey] = useState(null)

  const TOTAL_ROUNDS = 4

  const resetGame = (m) => {
    const newArr = randomArray(8, 10, 80)
    setUserArr(newArr)
    setMode(m)
    setRound(0)
    setSortedCount(0)
    setSelected(null)
    setFeedback(null)
    setScore(0)
    setGameOver(false)
    setInsertKey(null)
  }

  // Selection Sort challenge: click the minimum, then the target position
  const handleSelectionClick = (idx) => {
    if (gameOver || round >= TOTAL_ROUNDS) return
    const unsortedStart = sortedCount

    if (selected === null) {
      setSelected(idx)
      // Check if they picked the actual minimum
      const minIdx = userArr.slice(unsortedStart).reduce((mi, v, i) =>
        v < userArr[unsortedStart + mi] ? i : mi, 0) + unsortedStart
      if (idx === minIdx) {
        setFeedback({ type: 'good', msg: `Correct! ${userArr[idx]} is the minimum.` })
      } else {
        setFeedback({ type: 'bad', msg: `Hmm — ${userArr[idx]} is not the minimum. The minimum is ${userArr[minIdx]}.` })
      }
    } else {
      // They're picking the swap target — should be sortedCount position
      if (idx === sortedCount) {
        const newArr = [...userArr]
        ;[newArr[sortedCount], newArr[selected]] = [newArr[selected], newArr[sortedCount]]
        setUserArr(newArr)
        setSortedCount(sc => sc + 1)
        setScore(s => s + (feedback?.type === 'good' ? 2 : 1))
        setFeedback({ type: 'great', msg: `Swapped! Position ${sortedCount} is now sorted.` })
        setRound(r => r + 1)
        if (round + 1 >= TOTAL_ROUNDS) setGameOver(true)
      } else {
        setFeedback({ type: 'bad', msg: `Swap it to position ${sortedCount} (the first unsorted spot)!` })
      }
      setSelected(null)
    }
  }

  // Insertion Sort challenge: click element to pick up, then click insertion position
  const handleInsertionClick = (idx) => {
    if (gameOver || round >= TOTAL_ROUNDS) return
    const keyPos = sortedCount + 1

    if (insertKey === null) {
      if (idx !== keyPos) {
        setFeedback({ type: 'bad', msg: `Pick up the next unsorted element at position ${keyPos + 1}!` })
        return
      }
      setInsertKey(idx)
      setFeedback({ type: 'good', msg: `Picked up ${userArr[idx]}. Now click where it should be inserted!` })
    } else {
      // Find correct insertion position
      const key = userArr[insertKey]
      let correctPos = 0
      for (let i = 0; i <= sortedCount; i++) {
        if (key <= userArr[i]) { correctPos = i; break }
        correctPos = i + 1
      }

      const newArr = [...userArr]
      const keyVal = newArr[insertKey]
      newArr.splice(insertKey, 1)
      newArr.splice(idx <= insertKey ? idx : idx - 1, 0, keyVal)
      setUserArr(newArr)
      setSortedCount(sc => sc + 1)
      setScore(s => s + (idx === correctPos ? 2 : 1))
      setFeedback({ type: 'great', msg: `Inserted ${keyVal} — sorted section grew to ${sortedCount + 2} elements!` })
      setInsertKey(null)
      setRound(r => r + 1)
      if (round + 1 >= TOTAL_ROUNDS) setGameOver(true)
    }
  }

  const handleClick = mode === 'selection' ? handleSelectionClick : handleInsertionClick

  const getBarColor = (idx) => {
    if (idx < sortedCount) return C.green
    if (mode === 'selection' && idx === selected) return C.red
    if (mode === 'insertion' && idx === insertKey) return C.orange
    if (mode === 'selection' && idx === sortedCount && selected !== null) return `${C.orange}aa`
    return BAR_COLORS[idx % BAR_COLORS.length]
  }

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { key: 'selection', label: 'Selection Sort', icon: '🔍' },
          { key: 'insertion', label: 'Insertion Sort', icon: '🃏' },
        ].map(({ key, label, icon }) => (
          <motion.button key={key} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => resetGame(key)}
            style={{
              flex: 1, padding: '12px', borderRadius: 16,
              border: `2px solid ${mode === key ? C.indigo : 'var(--border)'}`,
              background: mode === key ? `${C.indigo}12` : 'transparent',
              color: mode === key ? C.indigo : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {icon} {label}
          </motion.button>
        ))}
      </div>

      {/* Instructions */}
      <div style={{
        padding: 14, borderRadius: 14,
        background: `${C.cyan}10`, border: `1px solid ${C.cyan}30`,
        fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20,
      }}>
        {mode === 'selection'
          ? selected === null
            ? `Round ${round + 1}/${TOTAL_ROUNDS}: Click the MINIMUM value in the unsorted section (positions ${sortedCount + 1}–8)`
            : `Now click position ${sortedCount + 1} to place the minimum there`
          : insertKey === null
            ? `Round ${round + 1}/${TOTAL_ROUNDS}: Click element at position ${sortedCount + 2} to pick it up`
            : `Click where ${userArr[insertKey]} should be inserted in the sorted section`
        }
      </div>

      {/* Array */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {userArr.map((val, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: gameOver ? 1 : 1.08 }}
            whileTap={{ scale: gameOver ? 1 : 0.95 }}
            onClick={() => !gameOver && handleClick(idx)}
            style={{
              width: 52, height: 52, borderRadius: 14,
              background: getBarColor(idx),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 16,
              cursor: gameOver ? 'default' : 'pointer',
              border: idx === sortedCount && selected !== null
                ? `3px dashed ${C.orange}` : '3px solid transparent',
              boxShadow: idx < sortedCount ? `0 2px 8px ${C.green}40` : 'none',
              transition: 'background 0.2s',
            }}
          >
            {val}
          </motion.div>
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '12px 18px', borderRadius: 12, marginBottom: 16,
              background: feedback.type === 'bad' ? `${C.red}12` : feedback.type === 'great' ? `${C.green}12` : `${C.blue}12`,
              border: `1.5px solid ${feedback.type === 'bad' ? C.red : feedback.type === 'great' ? C.green : C.blue}30`,
              color: feedback.type === 'bad' ? C.red : feedback.type === 'great' ? C.green : C.blue,
              fontWeight: 600, fontSize: 14,
            }}>
            {feedback.type === 'bad' ? '✗ ' : feedback.type === 'great' ? '✓✓ ' : '✓ '}
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          padding: '8px 20px', borderRadius: 30,
          background: `${C.indigo}12`, border: `1.5px solid ${C.indigo}30`,
          fontWeight: 800, color: C.indigo, fontSize: 16,
        }}>
          Score: {score} / {TOTAL_ROUNDS * 2}
        </div>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '8px 20px', borderRadius: 30,
              background: score >= TOTAL_ROUNDS * 1.5 ? `${C.green}15` : `${C.orange}15`,
              border: `1.5px solid ${score >= TOTAL_ROUNDS * 1.5 ? C.green : C.orange}40`,
              color: score >= TOTAL_ROUNDS * 1.5 ? C.green : C.orange,
              fontWeight: 700, fontSize: 15,
            }}>
            {score >= TOTAL_ROUNDS * 1.5 ? '🎉 Excellent!' : '💪 Good effort!'}
          </motion.div>
        )}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => resetGame(mode)}
          style={{
            padding: '8px 20px', borderRadius: 30,
            border: `2px solid var(--border)`, background: 'transparent',
            color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
          Restart
        </motion.button>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 6 — When to Use Which
================================================================ */
const USE_CASES = [
  {
    icon: '🔢',
    title: 'Small Arrays (n < 20)',
    winner: 'Insertion Sort',
    winnerColor: C.green,
    reason: 'Low overhead, simple operations. For tiny arrays, complexity matters less than constant factors.',
    example: 'Sorting a hand of 5–10 playing cards',
  },
  {
    icon: '✅',
    title: 'Nearly Sorted Data',
    winner: 'Insertion Sort',
    winnerColor: C.green,
    reason: 'O(n) in the best case! If data only has a few elements out of place, Insertion Sort barely does any work.',
    example: 'Real-time leaderboard with a new score inserted',
  },
  {
    icon: '💾',
    title: 'Minimize Memory Writes',
    winner: 'Selection Sort',
    winnerColor: C.red,
    reason: 'Always exactly n-1 swaps, regardless of input. Best when writing to memory is expensive (e.g., flash storage).',
    example: 'Writing to EEPROM where each write degrades the chip',
  },
  {
    icon: '📚',
    title: 'Online Sorting (data arrives one by one)',
    winner: 'Insertion Sort',
    winnerColor: C.green,
    reason: 'Can insert each new element into its correct position without re-sorting everything.',
    example: 'A live sports scoreboard updating in real-time',
  },
  {
    icon: '🚀',
    title: 'Large Arrays (n > 1000)',
    winner: 'None of these!',
    winnerColor: C.indigo,
    reason: 'O(n²) becomes a disaster. Use Merge Sort O(n log n) or Quick Sort O(n log n).',
    example: 'Sorting 1 million products by price on Amazon',
  },
  {
    icon: '🎓',
    title: 'Learning & Interviews',
    winner: 'Know all three',
    winnerColor: C.purple,
    reason: 'These simple sorts build intuition for sorting mechanics, Big O tradeoffs, and in-place vs. stable sorting.',
    example: 'FAANG interview: "Explain how you would sort a nearly-sorted array in O(n)"',
  },
]

function WhenToUse() {
  const [active, setActive] = useState(null)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {USE_CASES.map((uc, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            onClick={() => setActive(active === i ? null : i)}
            style={{
              background: active === i ? `${uc.winnerColor}10` : 'var(--bg-secondary)',
              border: `2px solid ${active === i ? uc.winnerColor : 'var(--border)'}`,
              borderRadius: 18, padding: '20px 20px', cursor: 'pointer',
              transition: 'all 0.25s',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{uc.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>
              {uc.title}
            </div>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: 20,
              background: `${uc.winnerColor}18`, color: uc.winnerColor,
              fontWeight: 800, fontSize: 13,
            }}>
              Use: {uc.winner}
            </div>

            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden', marginTop: 12 }}
                >
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                    {uc.reason}
                  </div>
                  <div style={{
                    fontSize: 12, color: uc.winnerColor, fontWeight: 600,
                    background: `${uc.winnerColor}10`, padding: '6px 10px',
                    borderRadius: 8,
                  }}>
                    Example: {uc.example}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <div style={{
        marginTop: 24, padding: '14px 18px', borderRadius: 14,
        background: `${C.indigo}08`, border: `1.5px solid ${C.indigo}20`,
        fontSize: 14, color: 'var(--text-secondary)',
      }}>
        Click any card to expand the explanation.
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic5Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 60px' }}>

      {/* Hero intro */}
      <Neuron mood="excited" size="large"
        message="Two more sorting strategies today — and this time we race them! Selection Sort hunts for the minimum each round. Insertion Sort plays cards. Same O(n²), but very different personalities. Let's visualize both!"
        style={{ marginBottom: 40 }}
      />

      {/* ── Section 1: Selection Sort ── */}
      <SectionBlock icon="🔍" title="Selection Sort — Find the Minimum" color={C.red}>
        <Neuron mood="explaining" size="small"
          message="Selection Sort strategy: scan the entire unsorted section, find the minimum, and swap it to the front. Simple! Watch the red bar (minimum) get swapped into the growing green section."
          style={{ marginBottom: 24 }}
        />

        <InteractiveDemo
          title="Selection Sort Visualizer"
          instruction="Watch the scan sweep right, the minimum glow red, then get swapped to the sorted (green) section. Use Step to go one action at a time."
        >
          <SelectionSortVisualizer />
        </InteractiveDemo>

        <NeuronTip type="tip">
          <strong>Why O(n²)?</strong> For n=10, round 1 scans 9 elements, round 2 scans 8, round 3 scans 7... Total = 9+8+7+...+1 = n(n-1)/2 comparisons. That's always exactly the same — whether the array is sorted or not!
        </NeuronTip>

        <NeuronTip type="fun">
          <strong>Selection Sort's superpower:</strong> It always does EXACTLY n-1 swaps — the minimum possible! Bubble Sort can do O(n²) swaps. This makes Selection Sort great when write operations are expensive (like flash memory).
        </NeuronTip>

        <HindiExplainer
          concept="Selection Sort — चयन सॉर्ट"
          english="Selection Sort"
          explanation="हर round में: unsorted हिस्से में सबसे छोटा (न्यूनतम) element ढूंढो, फिर उसे sorted हिस्से के आखिर में swap करो। जैसे — बच्चों को height के हिसाब से line में लगाना: सबसे छोटे को पहले, फिर उसमें से छोटे को, और ऐसे आगे।"
          example="10 बच्चों को line में खड़ा करना है। पहले: सबसे छोटा ढूंढो (पूरी line scan करो), उसे पहले position पर रखो। फिर: बाकी 9 में से सबसे छोटा ढूंढो, दूसरे position पर रखो। 9 rounds में सब sorted!"
          terms={[
            { hindi: 'चयन', english: 'Selection', meaning: 'हर round में minimum का चयन करना' },
            { hindi: 'न्यूनतम', english: 'Minimum', meaning: 'सबसे छोटा element' },
            { hindi: 'अदला-बदली', english: 'Swap', meaning: 'दो elements की जगह बदलना' },
          ]}
        />
      </SectionBlock>

      {/* ── Section 2: Insertion Sort ── */}
      <SectionBlock icon="🃏" title="Insertion Sort — The Card Player" color={C.orange}>
        <Neuron mood="happy" size="small"
          message="Imagine you're picking up playing cards one by one. Each new card gets inserted into its correct position in your hand. The orange bar is the card you just picked up — watch it slide left past bigger elements until it finds its spot!"
          style={{ marginBottom: 24 }}
        />

        <InteractiveDemo
          title="Insertion Sort — Card Player"
          instruction="The orange bar is 'picked up'. It slides left past any larger elements (which shift right), then drops into place. The green section is your perfectly sorted hand."
        >
          <InsertionSortVisualizer />
        </InteractiveDemo>

        <NeuronTip type="tip">
          <strong>Insertion Sort's Best Case is O(n)!</strong> If the array is already sorted, the picked-up card never needs to move — just one comparison per round. n-1 rounds × 1 comparison = O(n). That's AMAZING compared to O(n²) for the others.
        </NeuronTip>

        <NeuronTip type="example">
          <strong>Real use:</strong> Most sorting libraries use Insertion Sort for arrays smaller than ~10–20 elements. Even Python's TimSort switches to Insertion Sort for small subarrays within Merge Sort!
        </NeuronTip>

        <HindiExplainer
          concept="Insertion Sort — प्रवेशन सॉर्ट"
          english="Insertion Sort"
          explanation="तास के पत्ते (playing cards) sort करने जैसा! एक-एक card उठाओ, और अपने हाथ में सही जगह डालो। बड़े cards खिसकते रहते हैं दाईं तरफ, जब तक छोटे card को सही जगह न मिले। Sorted हिस्सा हमेशा बाईं तरफ perfectly sorted रहता है।"
          example="7 cards हाथ में हैं: [3,1,4,1,5,9,2]. Card '1' उठाओ → '3' से compare करो → '3' बड़ा है, खिसकाओ → '1' को position 0 पर रखो। हर बार नया card उठाओ और सही जगह घुसाओ।"
          terms={[
            { hindi: 'प्रवेशन', english: 'Insertion', meaning: 'element को सही जगह घुसाना (insert करना)' },
            { hindi: 'खिसकाना', english: 'Shift', meaning: 'element को एक position दाईं तरफ move करना' },
            { hindi: 'sorted हिस्सा', english: 'Sorted Portion', meaning: 'left side जो हमेशा sorted रहती है' },
          ]}
        />
      </SectionBlock>

      {/* ── Section 3: Battle Arena ── */}
      <SectionBlock icon="⚔️" title="Battle Arena: Bubble vs Selection vs Insertion" color={C.indigo}>
        <Neuron mood="excited" size="small"
          message="Same array, three algorithms, GO! Watch all three sort simultaneously. The live counters reveal the key differences: Selection Sort wins on swaps, Insertion Sort wins on nearly-sorted data. Bubble Sort... just loses."
          style={{ marginBottom: 24 }}
        />

        <InteractiveDemo
          title="Three-Way Sort Race"
          instruction="Click RACE! to start all three sorts on the same random array simultaneously. Compare the live counters!"
        >
          <BattleArena />
        </InteractiveDemo>

        <NeuronTip type="deep">
          <strong>The key tradeoff:</strong><br />
          <strong>Bubble Sort:</strong> O(n²) comparisons AND O(n²) swaps. Both are bad.<br />
          <strong>Selection Sort:</strong> O(n²) comparisons BUT only O(n) swaps. Great for write-heavy operations.<br />
          <strong>Insertion Sort:</strong> O(n²) worst case BUT O(n) best case (sorted input). Also stable!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 4: Best vs Worst Case ── */}
      <SectionBlock icon="📊" title="Best vs Worst Case" color={C.green}>
        <Neuron mood="thinking" size="small"
          message="Not all inputs are equal! The same algorithm can behave very differently depending on the data. Pick a scenario and run it — you'll see Insertion Sort completely dominate on nearly-sorted data!"
          style={{ marginBottom: 24 }}
        />

        <InteractiveDemo
          title="Input Scenario Tester"
          instruction="Pick an input type, click Run Scenario, and compare the bar charts for comparisons and swaps across all three algorithms."
        >
          <BestWorstCase />
        </InteractiveDemo>

        <NeuronTip type="warning">
          <strong>Common interview trick:</strong> "Which sorting algorithm is best for an already-sorted array?" — Insertion Sort! It detects sortedness and runs in O(n). Both Selection Sort and Bubble Sort still run O(n²) even on sorted input.
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 5: Be the Algorithm ── */}
      <SectionBlock icon="🎮" title="Be the Algorithm — Challenge Mode" color={C.pink}>
        <Neuron mood="waving" size="small"
          message="Now YOU are the algorithm! For Selection Sort: click the minimum in the unsorted section, then click where to place it. For Insertion Sort: click the element to pick up, then click where to insert it. Think before you click!"
          style={{ marginBottom: 24 }}
        />

        <InteractiveDemo
          title="Be the Algorithm"
          instruction="Click elements to perform the sort yourself. Selection: find minimum → place it. Insertion: pick up element → insert at correct position."
        >
          <BeTheAlgorithm />
        </InteractiveDemo>

        <NeuronTip type="try">
          Switch between Selection and Insertion modes to feel how differently they "think" about the same sorting problem!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 6: When to Use Which ── */}
      <SectionBlock icon="🗺️" title="When to Use Which?" color={C.cyan}>
        <Neuron mood="explaining" size="small"
          message="Knowing an algorithm is half the battle — knowing WHEN to use it is the other half. Click each card to see the reasoning and a real-world example."
          style={{ marginBottom: 24 }}
        />

        <WhenToUse />

        <NeuronTip type="deep">
          <strong>The hierarchy:</strong> Insertion Sort is almost always better than Selection Sort and Bubble Sort in practice. The only exception is when you need to minimize swaps (write-cost scenarios). For anything over ~20 elements, switch to Merge Sort or Quick Sort!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 7: Hindi Summary ── */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary" color={C.orange}>
        <Neuron mood="happy" size="small"
          message="Aaj humne do nayi sorting strategies seekhi! Dono simple hain, dono O(n²) hain, lekin inka use alag-alag jagah hota hai."
          style={{ marginBottom: 24 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            {
              title: 'Selection Sort',
              hindi: 'चयन सॉर्ट',
              tagline: '"Sabse chhota dhundho, aage rakho"',
              taglineEn: '"Find the smallest, put it first"',
              color: C.red,
              icon: '🔍',
              points: [
                'Har round: minimum element ढूंढो',
                'Minimum को sorted section में swap करो',
                'Always exactly n-1 swaps (कम से कम)',
                'Best/Worst case: hamesha O(n²)',
              ],
            },
            {
              title: 'Insertion Sort',
              hindi: 'प्रवेशन सॉर्ट',
              tagline: '"Tash ke patte lagana"',
              taglineEn: '"Arranging playing cards"',
              color: C.green,
              icon: '🃏',
              points: [
                'Har round: next element "उठाओ"',
                'Left में सही जगह "घुसाओ"',
                'Nearly sorted पर: O(n) — बहुत fast!',
                'Worst case: O(n²) (reverse sorted)',
              ],
            },
          ].map(({ title, hindi, tagline, taglineEn, color, icon, points }) => (
            <div key={title} style={{
              background: `${color}08`,
              border: `1.5px solid ${color}30`,
              borderRadius: 18, padding: 20,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>{hindi}</div>
              <div style={{ fontStyle: 'italic', fontSize: 13, color, marginBottom: 12 }}>
                {tagline}<br /><span style={{ color: 'var(--text-secondary)' }}>{taglineEn}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <HindiExplainer
          concept="Selection Sort vs Insertion Sort — तुलना"
          english="Comparison of Both Sorting Algorithms"
          explanation="दोनों algorithms O(n²) हैं — लेकिन अलग-अलग situations में अलग behavior करते हैं। Selection Sort हमेशा exact same काम करता है (best case = worst case)। Insertion Sort smart है — अगर data almost sorted है तो बहुत कम काम करता है।"
          example="Library में 100 books को alphabetically रखना है। अगर books पहले से लगभग sorted हैं → Insertion Sort (बस 2-3 books अदला-बदली होगी). अगर memory-write costly है → Selection Sort (सबसे कम swaps). अगर 10,000 books हैं → दोनों slow! Merge Sort चाहिए।"
          terms={[
            { hindi: 'चयन सॉर्ट', english: 'Selection Sort', meaning: 'हर round में minimum ढूंढ के swap करना' },
            { hindi: 'प्रवेशन सॉर्ट', english: 'Insertion Sort', meaning: 'एक-एक element को सही जगह insert करना' },
            { hindi: 'न्यूनतम', english: 'Minimum', meaning: 'सबसे छोटी value' },
            { hindi: 'खिसकाना', english: 'Shift', meaning: 'element को एक position आगे करना' },
            { hindi: 'स्थिर सॉर्ट', english: 'Stable Sort', meaning: 'equal elements का relative order नहीं बदलता — Insertion Sort stable है, Selection Sort नहीं!' },
          ]}
        />

        {/* Key takeaway */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 28, padding: '20px 24px', borderRadius: 20,
            background: 'linear-gradient(135deg, #fef3c710, #fde68a15)',
            border: '2px solid #f59e0b40',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18, color: C.orange, marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
            The Big Picture
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Bubble Sort', comp: 'O(n²)', swp: 'O(n²)', best: 'O(n)*', use: 'Learning only', color: C.blue },
              { label: 'Selection Sort', comp: 'O(n²)', swp: 'O(n)', best: 'O(n²)', use: 'Min writes', color: C.red },
              { label: 'Insertion Sort', comp: 'O(n²)', swp: 'O(n²)', best: 'O(n)', use: '≤20 or nearly sorted', color: C.green },
            ].map(({ label, comp, swp, best, use, color }) => (
              <div key={label} style={{
                background: `${color}10`, border: `1px solid ${color}25`,
                borderRadius: 14, padding: '14px', fontSize: 13,
              }}>
                <div style={{ fontWeight: 800, color, marginBottom: 8 }}>{label}</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  Comparisons: <strong>{comp}</strong><br />
                  Swaps: <strong>{swp}</strong><br />
                  Best Case: <strong style={{ color }}>{best}</strong><br />
                  Use when: <strong>{use}</strong>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
            * Bubble Sort O(n) best case only with early-exit optimization
          </div>
        </motion.div>
      </SectionBlock>

      {/* Final Neuron sign-off */}
      <Neuron mood="waving" size="medium"
        message="Excellent! You now know TWO more sorting strategies. Next up: Merge Sort — where we break the O(n²) barrier using divide and conquer. Get ready to see sorting get dramatically faster!"
        style={{ marginTop: 16 }}
      />
    </div>
  )
}
