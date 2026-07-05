import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 8 — Binary Search
   Why search one-by-one when you can cut the problem in HALF every step?
   Visual-first, interactive, NO text walls.
================================================================ */

/* ---- Helper: generate a sorted array of unique numbers ---- */
function makeSortedArray(size, min = 1, max = 200) {
  const set = new Set()
  while (set.size < size) set.add(Math.floor(Math.random() * (max - min + 1)) + min)
  return [...set].sort((a, b) => a - b)
}

/* ================================================================
   SECTION 1 — Linear vs Binary Search Race
================================================================ */
function SearchRace() {
  const ARRAY_SIZE = 32
  const [arr] = useState(() => makeSortedArray(ARRAY_SIZE, 1, 99))
  const [target] = useState(42)
  const [running, setRunning] = useState(false)
  const [linearStep, setLinearStep] = useState(-1)
  const [binarySteps, setBinarySteps] = useState([])
  const [linearDone, setLinearDone] = useState(false)
  const [binaryDone, setBinaryDone] = useState(false)
  const [linearCount, setLinearCount] = useState(0)
  const [binaryCount, setBinaryCount] = useState(0)
  const timerRef = useRef([])

  const clearTimers = () => { timerRef.current.forEach(clearTimeout); timerRef.current = [] }

  const reset = () => {
    clearTimers()
    setRunning(false)
    setLinearStep(-1)
    setBinarySteps([])
    setLinearDone(false)
    setBinaryDone(false)
    setLinearCount(0)
    setBinaryCount(0)
  }

  const race = () => {
    reset()
    setRunning(true)

    /* Linear search animation — one by one */
    const targetIdx = arr.indexOf(target) !== -1 ? arr.indexOf(target) : arr.findIndex(v => v >= target)
    const linearSteps = targetIdx === -1 ? arr.length : targetIdx + 1
    for (let i = 0; i < linearSteps; i++) {
      const t = setTimeout(() => {
        setLinearStep(i)
        setLinearCount(i + 1)
        if (i === linearSteps - 1) setLinearDone(true)
      }, i * 60)
      timerRef.current.push(t)
    }

    /* Binary search animation */
    const binaryPath = []
    let lo = 0, hi = arr.length - 1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      binaryPath.push({ lo, mid, hi })
      if (arr[mid] === target) break
      else if (arr[mid] < target) lo = mid + 1
      else hi = mid - 1
    }
    binaryPath.forEach((step, i) => {
      const t = setTimeout(() => {
        setBinarySteps(prev => [...prev, step])
        setBinaryCount(i + 1)
        if (i === binaryPath.length - 1) setBinaryDone(true)
      }, i * 320)
      timerRef.current.push(t)
    })
  }

  const lastBinary = binarySteps[binarySteps.length - 1]
  const eliminatedLeft = lastBinary ? lastBinary.lo : 0
  const eliminatedRight = lastBinary ? lastBinary.hi : arr.length - 1

  return (
    <InteractiveDemo title="Linear vs Binary Search Race" instruction="Click Race! to see both algorithms search simultaneously for the number 42">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 17 }}>
            Sorted Array of 32 numbers — Target: <span style={{ color: '#6366f1', fontFamily: 'monospace' }}>42</span>
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          onClick={running ? reset : race}
          style={{
            padding: '12px 36px', borderRadius: 30, border: 'none',
            background: running ? '#ef4444' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 20px #6366f166',
          }}
        >
          {running ? 'Reset' : 'Race!'}
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Linear Search panel */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fff7ed)',
          border: '2px solid #fbbf24',
          borderRadius: 18, padding: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#92400e' }}>Linear Search</span>
            <span style={{
              background: linearDone ? '#10b981' : '#fbbf24',
              color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 700,
              transition: 'background 0.3s',
            }}>
              {linearDone ? `Done! ${linearCount} steps` : `Step ${linearCount}`}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {arr.map((val, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i === linearStep ? 1.2 : 1,
                  background: i === linearStep && linearDone ? '#10b981'
                    : i < linearStep ? '#fde68a'
                    : i === linearStep ? '#f59e0b'
                    : '#fff',
                }}
                transition={{ duration: 0.15 }}
                style={{
                  width: 30, height: 30, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600,
                  border: i === linearStep ? '2px solid #f59e0b' : '1.5px solid #fde68a',
                  color: i <= linearStep ? '#92400e' : '#d97706',
                }}
              >
                {val}
              </motion.div>
            ))}
          </div>
          {linearDone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 12, textAlign: 'center', fontWeight: 700, color: '#92400e', fontSize: 15 }}>
              Checked {linearCount} out of {arr.length} elements
            </motion.div>
          )}
        </div>

        {/* Binary Search panel */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
          border: '2px solid #6366f1',
          borderRadius: 18, padding: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#3730a3' }}>Binary Search</span>
            <span style={{
              background: binaryDone ? '#10b981' : '#6366f1',
              color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 700,
              transition: 'background 0.3s',
            }}>
              {binaryDone ? `Done! ${binaryCount} steps` : `Step ${binaryCount}`}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {arr.map((val, i) => {
              const isElimLeft = lastBinary && i < eliminatedLeft
              const isElimRight = lastBinary && i > eliminatedRight
              const isMid = lastBinary && i === lastBinary.mid
              const isFound = binaryDone && isMid
              return (
                <motion.div
                  key={i}
                  animate={{
                    scale: isMid ? 1.2 : 1,
                    opacity: (isElimLeft || isElimRight) ? 0.25 : 1,
                    background: isFound ? '#10b981' : isMid ? '#6366f1' : '#fff',
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    width: 30, height: 30, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600,
                    border: isMid ? '2px solid #6366f1' : '1.5px solid #c7d2fe',
                    color: isFound ? '#fff' : isMid ? '#fff' : '#3730a3',
                  }}
                >
                  {val}
                </motion.div>
              )
            })}
          </div>
          {binaryDone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 12, textAlign: 'center', fontWeight: 700, color: '#3730a3', fontSize: 15 }}>
              Only {binaryCount} steps needed!
            </motion.div>
          )}
        </div>
      </div>

      {linearDone && binaryDone && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          style={{
            marginTop: 20, textAlign: 'center',
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            border: '2px solid #34d399',
            borderRadius: 18, padding: 20,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>Binary Search wins!</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#065f46' }}>
            Linear: <span style={{ color: '#dc2626' }}>{linearCount} steps</span> vs Binary: <span style={{ color: '#059669' }}>{binaryCount} steps</span>
          </div>
          <div style={{ fontSize: 14, color: '#047857', marginTop: 6 }}>
            Binary Search was <strong>{Math.round(linearCount / binaryCount)}x faster</strong>
          </div>
        </motion.div>
      )}
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 2 — Binary Search Visualizer (Main Demo)
================================================================ */
const SORTED_16 = [3, 7, 12, 18, 23, 29, 35, 41, 47, 53, 61, 68, 74, 82, 89, 95]

function BinarySearchVisualizer() {
  const [target, setTarget] = useState('')
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [status, setStatus] = useState('idle') // idle | running | found | notfound
  const [autoPlay, setAutoPlay] = useState(false)
  const [speed, setSpeed] = useState(800)
  const intervalRef = useRef(null)

  const computeSteps = useCallback((tgt) => {
    const result = []
    let lo = 0, hi = SORTED_16.length - 1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      result.push({ lo, mid, hi, val: SORTED_16[mid], found: SORTED_16[mid] === tgt })
      if (SORTED_16[mid] === tgt) break
      else if (SORTED_16[mid] < tgt) lo = mid + 1
      else hi = mid - 1
    }
    return result
  }, [])

  const startSearch = () => {
    const tgt = parseInt(target)
    if (isNaN(tgt)) return
    const s = computeSteps(tgt)
    setSteps(s)
    setCurrentStep(0)
    setStatus('running')
    setAutoPlay(false)
    clearInterval(intervalRef.current)
  }

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      if (steps[next]?.found) setStatus('found')
      else if (next === steps.length - 1) setStatus('notfound')
    } else {
      if (steps[currentStep]?.found) setStatus('found')
      else setStatus('notfound')
    }
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setSteps([])
    setCurrentStep(-1)
    setStatus('idle')
    setAutoPlay(false)
    setTarget('')
  }

  useEffect(() => {
    if (autoPlay && status === 'running') {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1
          if (next >= steps.length) {
            clearInterval(intervalRef.current)
            setAutoPlay(false)
            const last = steps[steps.length - 1]
            setStatus(last?.found ? 'found' : 'notfound')
            return prev
          }
          if (steps[next]?.found) {
            setStatus('found')
            clearInterval(intervalRef.current)
            setAutoPlay(false)
          } else if (next === steps.length - 1) {
            setStatus('notfound')
          }
          return next
        })
      }, speed)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoPlay, speed, steps, status])

  const cur = steps[currentStep]
  const eliminatedLeft = cur ? Array.from({ length: cur.lo }, (_, i) => i) : []
  const eliminatedRight = cur ? Array.from({ length: SORTED_16.length - 1 - cur.hi }, (_, i) => cur.hi + 1 + i) : []

  return (
    <InteractiveDemo title="Binary Search Visualizer" instruction="Enter a target number from the array, then step through or auto-play the search">
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Array:</span>
        {SORTED_16.map((v, i) => (
          <span key={i} style={{
            display: 'inline-block', width: 28, height: 28,
            background: '#e0e7ff', borderRadius: 6,
            textAlign: 'center', lineHeight: '28px',
            fontSize: 12, fontWeight: 700, color: '#3730a3',
          }}>{v}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input
          type="number"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="Enter target..."
          style={{
            padding: '10px 16px', borderRadius: 12, border: '2px solid #6366f1',
            fontSize: 16, fontFamily: 'monospace', width: 160,
            outline: 'none', background: '#f8f7ff',
          }}
        />
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={startSearch}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
          Search
        </motion.button>
        {status === 'running' && (
          <>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={stepForward}
              style={{
                padding: '10px 22px', borderRadius: 12, border: '2px solid #6366f1',
                background: '#fff', color: '#6366f1', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
              Next Step
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setAutoPlay(v => !v)}
              style={{
                padding: '10px 22px', borderRadius: 12, border: 'none',
                background: autoPlay ? '#f59e0b' : '#10b981',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
              {autoPlay ? 'Pause' : 'Auto Play'}
            </motion.button>
          </>
        )}
        {status !== 'idle' && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={reset}
            style={{
              padding: '10px 18px', borderRadius: 12, border: '2px solid #e5e7eb',
              background: '#fff', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
            Reset
          </motion.button>
        )}
      </div>

      {/* Speed slider */}
      {status === 'running' && (
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Speed:</span>
          <input type="range" min={200} max={1500} step={100} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ width: 140, accentColor: '#6366f1' }} />
          <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>
            {speed < 400 ? 'Fast' : speed < 900 ? 'Medium' : 'Slow'}
          </span>
        </div>
      )}

      {/* Main visualization */}
      <div style={{
        background: '#f8f7ff', borderRadius: 18, padding: 20,
        border: '1.5px solid #c7d2fe', marginBottom: 16,
      }}>
        {/* Array boxes */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          {SORTED_16.map((val, i) => {
            const isElimL = eliminatedLeft.includes(i)
            const isElimR = eliminatedRight.includes(i)
            const isMid = cur && i === cur.mid
            const isLow = cur && i === cur.lo
            const isHigh = cur && i === cur.hi
            const isFound = status === 'found' && isMid
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Pointer labels */}
                <div style={{ height: 18, display: 'flex', justifyContent: 'center', width: '100%' }}>
                  {isLow && !isMid && <span style={{ fontSize: 9, fontWeight: 800, color: '#10b981' }}>LOW</span>}
                  {isHigh && !isMid && <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444' }}>HIGH</span>}
                  {isMid && (
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ fontSize: 9, fontWeight: 800, color: '#6366f1' }}
                    >MID</motion.span>
                  )}
                </div>
                <motion.div
                  animate={{
                    scale: isMid ? 1.25 : 1,
                    opacity: (isElimL || isElimR) ? 0.2 : 1,
                    background: isFound ? '#10b981' : isMid ? '#6366f1' : isLow || isHigh ? '#e0e7ff' : '#fff',
                    boxShadow: isMid ? '0 0 0 3px #6366f166' : 'none',
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    border: isMid ? '2px solid #6366f1'
                      : isLow ? '2px solid #10b981'
                      : isHigh ? '2px solid #ef4444'
                      : '1.5px solid #c7d2fe',
                    color: isFound ? '#fff' : isMid ? '#fff' : '#3730a3',
                  }}
                >
                  {val}
                </motion.div>
                {/* Index */}
                <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{i}</span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          {[
            { color: '#6366f1', label: 'MID (checking)' },
            { color: '#10b981', label: 'LOW pointer' },
            { color: '#ef4444', label: 'HIGH pointer' },
            { color: '#94a3b8', label: 'Eliminated' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step log */}
      {steps.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Steps taken: {Math.min(currentStep + 1, steps.length)}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {steps.slice(0, currentStep + 1).map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: s.found ? '#d1fae5' : '#eff6ff',
                  border: `1.5px solid ${s.found ? '#34d399' : '#93c5fd'}`,
                  borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                  color: s.found ? '#065f46' : '#1e40af',
                }}>
                Step {i + 1}: mid={s.val} {s.found ? '✓ FOUND!' : SORTED_16[s.mid] < parseInt(target) ? '→ go right' : '← go left'}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {(status === 'found' || status === 'notfound') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: 'center', padding: 20, borderRadius: 18,
              background: status === 'found' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
              border: `2px solid ${status === 'found' ? '#34d399' : '#f87171'}`,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 6 }}>
              {status === 'found' ? 'Found! ' : 'Not in array!'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: status === 'found' ? '#065f46' : '#991b1b' }}>
              {status === 'found'
                ? `Found ${target} in just ${steps.length} step${steps.length > 1 ? 's' : ''}!`
                : `${target} is not in this array. Search concluded in ${steps.length} steps.`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 3 — The Dictionary Game
================================================================ */
function DictionaryGame() {
  const [secret] = useState(() => Math.floor(Math.random() * 1000) + 1)
  const [guess, setGuess] = useState('')
  const [history, setHistory] = useState([])
  const [won, setWon] = useState(false)
  const [round, setRound] = useState(1)
  const [showBotSolution, setShowBotSolution] = useState(false)
  const [botSteps, setBotSteps] = useState([])

  const maxGuesses = 10

  const makeGuess = () => {
    const g = parseInt(guess)
    if (isNaN(g) || g < 1 || g > 1000) return
    const feedback = g === secret ? 'correct' : g < secret ? 'too_low' : 'too_high'
    const entry = { guess: g, feedback }
    setHistory(prev => [...prev, entry])
    setGuess('')
    if (feedback === 'correct') setWon(true)
  }

  const nextRound = () => {
    setHistory([])
    setGuess('')
    setWon(false)
    setRound(r => r + 1)
    setShowBotSolution(false)
    setBotSteps([])
  }

  const showBot = () => {
    const steps = []
    let lo = 1, hi = 1000
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (mid === secret) { steps.push({ guess: mid, result: 'Correct!' }); break }
      else if (mid < secret) { steps.push({ guess: mid, result: 'Too Low' }); lo = mid + 1 }
      else { steps.push({ guess: mid, result: 'Too High' }); hi = mid - 1 }
    }
    setBotSteps(steps)
    setShowBotSolution(true)
  }

  const remaining = maxGuesses - history.length
  const lastEntry = history[history.length - 1]

  return (
    <InteractiveDemo title="The Dictionary Game" instruction="I'm thinking of a number between 1 and 1000. Binary Search finds it in MAX 10 guesses. Can you?">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Player side */}
        <div>
          <div style={{
            background: '#f8f7ff', borderRadius: 16, padding: 20, marginBottom: 16,
            border: '1.5px solid #c7d2fe',
          }}>
            <div style={{ fontWeight: 700, color: '#3730a3', marginBottom: 4, fontSize: 15 }}>
              Round {round} — Your turn
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {won ? 'You found it!' : remaining > 0
                ? `${remaining} guesses remaining (max ${maxGuesses})`
                : `Out of guesses! The number was ${secret}`}
            </div>

            {!won && remaining > 0 && (
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="number" value={guess} onChange={e => setGuess(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && makeGuess()}
                  placeholder="1–1000" min={1} max={1000}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: '2px solid #6366f1',
                    fontSize: 15, fontFamily: 'monospace', width: 110,
                    outline: 'none', background: '#fff',
                  }}
                />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={makeGuess}
                  style={{
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                  }}>
                  Guess
                </motion.button>
              </div>
            )}

            {/* Feedback */}
            {lastEntry && !won && (
              <motion.div key={lastEntry.guess}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{
                  marginTop: 12, padding: '8px 14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: lastEntry.feedback === 'too_low' ? '#fef3c7' : '#fee2e2',
                  color: lastEntry.feedback === 'too_low' ? '#92400e' : '#991b1b',
                  border: `1.5px solid ${lastEntry.feedback === 'too_low' ? '#fbbf24' : '#f87171'}`,
                }}>
                {lastEntry.feedback === 'too_low' ? 'Too Low — go higher!' : 'Too High — go lower!'}
              </motion.div>
            )}

            {won && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  marginTop: 12, padding: '12px 16px', borderRadius: 12,
                  background: '#d1fae5', border: '2px solid #34d399',
                  fontWeight: 700, color: '#065f46', fontSize: 15, textAlign: 'center',
                }}>
                Found it in {history.length} guesses!
                {history.length <= 10 && ' (Binary Search limit!)'}
              </motion.div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: h.feedback === 'correct' ? '#d1fae5' : h.feedback === 'too_low' ? '#fef3c7' : '#fee2e2',
                    border: `1px solid ${h.feedback === 'correct' ? '#34d399' : h.feedback === 'too_low' ? '#fbbf24' : '#f87171'}`,
                  }}>
                  <span>Guess {i + 1}: <strong>{h.guess}</strong></span>
                  <span>{h.feedback === 'correct' ? 'Correct!' : h.feedback === 'too_low' ? '↑ Too Low' : '↓ Too High'}</span>
                </motion.div>
              ))}
            </div>
          )}

          {(won || remaining === 0) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {round < 3 && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={nextRound}
                  style={{
                    padding: '10px 22px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                  }}>
                  Next Round
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={showBot}
                style={{
                  padding: '10px 22px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                }}>
                Show Binary Search solution
              </motion.button>
            </div>
          )}
        </div>

        {/* Bot (Binary Search) side */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
          borderRadius: 16, padding: 20, border: '1.5px solid #93c5fd',
        }}>
          <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 4, fontSize: 15 }}>
            Binary Search Bot
          </div>
          <div style={{ fontSize: 13, color: '#3b82f6', marginBottom: 12 }}>
            Finds any number 1–1000 in MAX 10 guesses
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            padding: '10px 16px', background: '#fff', borderRadius: 12,
            border: '1.5px solid #bfdbfe',
          }}>
            <span style={{ fontSize: 22 }}>log₂(1000) ≈ 10</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>guesses guaranteed</span>
          </div>

          {showBotSolution ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {botSteps.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: s.result === 'Correct!' ? '#d1fae5' : '#eff6ff',
                    border: `1px solid ${s.result === 'Correct!' ? '#34d399' : '#bfdbfe'}`,
                    color: s.result === 'Correct!' ? '#065f46' : '#1e40af',
                  }}>
                  <span>Step {i + 1}: try <strong>{s.guess}</strong></span>
                  <span>{s.result}</span>
                </motion.div>
              ))}
              <div style={{
                marginTop: 10, padding: '10px 14px', borderRadius: 12,
                background: '#d1fae5', border: '2px solid #34d399',
                fontWeight: 800, color: '#065f46', fontSize: 15, textAlign: 'center',
              }}>
                Bot found it in {botSteps.length} steps!
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', paddingTop: 24 }}>
              Play until you find/miss the number, then click "Show Binary Search solution"
            </div>
          )}
        </div>
      </div>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 4 — Why It MUST Be Sorted
================================================================ */
const UNSORTED_ARR = [47, 12, 83, 29, 61, 7, 95, 34, 18, 73, 41, 56, 23, 88, 5, 66]
const TARGET_UNSORTED = 41

function WhyMustBeSorted() {
  const [steps, setSteps] = useState([])
  const [stepIdx, setStepIdx] = useState(-1)
  const [failed, setFailed] = useState(false)
  const [started, setStarted] = useState(false)

  const computeWrongSearch = () => {
    const result = []
    let lo = 0, hi = UNSORTED_ARR.length - 1
    let found = false
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      result.push({ lo, mid, hi, val: UNSORTED_ARR[mid], found: UNSORTED_ARR[mid] === TARGET_UNSORTED })
      if (UNSORTED_ARR[mid] === TARGET_UNSORTED) { found = true; break }
      else if (UNSORTED_ARR[mid] < TARGET_UNSORTED) lo = mid + 1
      else hi = mid - 1
    }
    if (!found) result.push({ lo, mid: -1, hi: -1, val: -1, found: false, failed: true })
    return result
  }

  const start = () => {
    const s = computeWrongSearch()
    setSteps(s)
    setStepIdx(0)
    setFailed(false)
    setStarted(true)
  }

  const next = () => {
    const next = stepIdx + 1
    if (next < steps.length) {
      setStepIdx(next)
      if (steps[next]?.failed) setFailed(true)
    }
  }

  const reset = () => {
    setSteps([])
    setStepIdx(-1)
    setFailed(false)
    setStarted(false)
  }

  const cur = steps[stepIdx]
  const targetActualIdx = UNSORTED_ARR.indexOf(TARGET_UNSORTED)

  return (
    <InteractiveDemo title="Why Binary Search REQUIRES Sorted Data" instruction="Watch Binary Search FAIL on an unsorted array — it eliminates the wrong half!">
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 700 }}>
          Unsorted Array — searching for: <span style={{ fontFamily: 'monospace', fontSize: 16 }}>{TARGET_UNSORTED}</span>
        </span>
      </div>

      <div style={{
        background: '#fff5f5', borderRadius: 16, padding: 20,
        border: '2px solid #fca5a5', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }}>
          {UNSORTED_ARR.map((val, i) => {
            const isElimL = cur && !cur.failed && i < cur.lo
            const isElimR = cur && !cur.failed && i > cur.hi
            const isMid = cur && i === cur.mid
            const isTarget = i === targetActualIdx && (isElimL || isElimR)
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                  {isMid && (
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ fontSize: 9, fontWeight: 800, color: '#6366f1' }}
                    >MID</motion.span>
                  )}
                  {isTarget && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      style={{ fontSize: 9, fontWeight: 800, color: '#dc2626' }}
                    >HERE!</motion.span>
                  )}
                </div>
                <motion.div
                  animate={{
                    scale: isMid ? 1.2 : 1,
                    opacity: (isElimL || isElimR) ? 0.2 : 1,
                    background: isTarget ? '#fee2e2' : isMid ? '#6366f1' : '#fff',
                    outline: isTarget ? '3px solid #dc2626' : 'none',
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    border: isMid ? '2px solid #6366f1' : '1.5px solid #fca5a5',
                    color: isMid ? '#fff' : '#991b1b',
                  }}
                >
                  {val}
                </motion.div>
              </div>
            )
          })}
        </div>

        {cur && !cur.failed && (
          <motion.div key={stepIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#6b7280', marginTop: 8,
            }}>
            Checking index {cur.mid} (value={cur.val})
            {cur.val < TARGET_UNSORTED ? ` → ${cur.val} < ${TARGET_UNSORTED}, go RIGHT` : ` → ${cur.val} > ${TARGET_UNSORTED}, go LEFT`}
          </motion.div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {!started ? (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={start}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 15,
            }}>
            Try Binary Search (it will fail!)
          </motion.button>
        ) : (
          <>
            {!failed && stepIdx < steps.length - 1 && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={next}
                style={{
                  padding: '10px 22px', borderRadius: 12, border: '2px solid #6366f1',
                  background: '#fff', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                }}>
                Next Step
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={reset}
              style={{
                padding: '10px 18px', borderRadius: 12, border: '2px solid #e5e7eb',
                background: '#fff', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}>
              Reset
            </motion.button>
          </>
        )}
      </div>

      <AnimatePresence>
        {failed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 20, borderRadius: 18,
              background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
              border: '2px solid #f87171',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: '#991b1b', marginBottom: 8 }}>
              Binary Search FAILED!
            </div>
            <div style={{ fontSize: 15, color: '#7f1d1d', lineHeight: 1.7 }}>
              The number <strong>{TARGET_UNSORTED}</strong> IS in the array — but Binary Search eliminated the
              half that contained it! This happens because the array is UNSORTED.
              Binary Search assumes: "if mid is too small, the target must be to the right." That assumption
              only holds for SORTED data.
            </div>
            <div style={{ marginTop: 14, padding: '12px 16px', background: '#fff', borderRadius: 12,
              border: '1.5px solid #fca5a5', fontSize: 14, color: '#374151' }}>
              <strong>Pre-sort cost:</strong> O(n log n) — but then every future search is O(log n).
              Sort once, search forever!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 5 — The Power of Halving
================================================================ */
const SIZES = [
  { n: 100, steps: 7, label: '100' },
  { n: 1_000, steps: 10, label: '1,000' },
  { n: 10_000, steps: 14, label: '10,000' },
  { n: 100_000, steps: 17, label: '100,000' },
  { n: 1_000_000, steps: 20, label: '1,000,000' },
  { n: 1_000_000_000, steps: 30, label: '1,000,000,000' },
]

function PowerOfHalving() {
  const [sliderIdx, setSliderIdx] = useState(4)
  const [running, setRunning] = useState(false)
  const [halvingStep, setHalvingStep] = useState(0)
  const intervalRef = useRef(null)

  const sel = SIZES[sliderIdx]
  const maxSteps = sel.steps

  const runHalving = () => {
    setHalvingStep(0)
    setRunning(true)
    let step = 0
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      step++
      setHalvingStep(step)
      if (step >= maxSteps) {
        clearInterval(intervalRef.current)
        setRunning(false)
      }
    }, 200)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const remaining = (n, steps) => Math.ceil(n / Math.pow(2, steps))

  return (
    <SectionBlock icon="📉" title="The Power of Halving" color="#8b5cf6">
      <Neuron mood="excited" size="medium"
        message={`For ${sel.label} elements — Binary Search finds the answer in ONLY ${sel.steps} steps. That's the magic of O(log n)!`}
      />

      <div style={{ marginTop: 28, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Select array size:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SIZES.map((s, i) => (
            <motion.button key={i}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setSliderIdx(i); setHalvingStep(0); setRunning(false) }}
              style={{
                padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: i === sliderIdx ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#f0f4ff',
                color: i === sliderIdx ? '#fff' : '#6366f1',
                fontSize: 13, fontWeight: 700,
                boxShadow: i === sliderIdx ? '0 4px 16px #8b5cf644' : 'none',
              }}>
              {s.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Halving animation */}
      <div style={{
        background: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
        borderRadius: 20, padding: 28, marginBottom: 24,
        border: '1.5px solid #c4b5fd',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, color: '#5b21b6', fontSize: 17 }}>Halving {sel.label} elements</div>
            <div style={{ fontSize: 13, color: '#7c3aed', marginTop: 4 }}>
              After {halvingStep} step{halvingStep !== 1 ? 's' : ''}: {halvingStep === 0 ? sel.label : remaining(sel.n, halvingStep).toLocaleString()} elements left
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={runHalving} disabled={running}
            style={{
              padding: '10px 22px', borderRadius: 14, border: 'none',
              background: running ? '#d8b4fe' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', fontSize: 14,
            }}>
            {running ? 'Running...' : 'Animate!'}
          </motion.button>
        </div>

        {/* Progress bar shrinking */}
        <div style={{ marginBottom: 16 }}>
          <motion.div
            animate={{ width: `${(remaining(sel.n, halvingStep) / sel.n) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              minWidth: halvingStep === maxSteps ? 8 : undefined,
              display: 'flex', alignItems: 'center', paddingLeft: 12,
              overflow: 'hidden',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap' }}>
              {halvingStep === 0 ? sel.label : remaining(sel.n, halvingStep).toLocaleString()}
            </span>
          </motion.div>
        </div>

        {/* Step list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
          {Array.from({ length: halvingStep }, (_, i) => {
            const r = remaining(sel.n, i + 1)
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: r === 1 ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : '#fff',
                  border: `1px solid ${r === 1 ? '#34d399' : '#c4b5fd'}`,
                  color: r === 1 ? '#065f46' : '#5b21b6',
                }}>
                <span>Step {i + 1}</span>
                <span>{r === 1 ? 'FOUND! (1 element)' : `${r.toLocaleString()} elements remain`}</span>
                <span style={{ opacity: 0.6 }}>÷2</span>
              </motion.div>
            )
          })}
        </div>

        {halvingStep === maxSteps && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: 16, padding: 20, borderRadius: 16,
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              border: '2px solid #34d399', textAlign: 'center',
            }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>Done in {maxSteps} steps!</div>
            {sel.n === 1_000_000_000 && (
              <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46' }}>
                India's entire population — searched in just 30 steps!
              </div>
            )}
            <div style={{ fontSize: 14, color: '#047857', marginTop: 6 }}>
              log₂({sel.label}) ≈ {maxSteps}
            </div>
          </motion.div>
        )}
      </div>

      {/* O(log n) comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderRadius: '12px 0 0 0' }}>Array Size (n)</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Linear O(n) steps</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', borderRadius: '0 12px 0 0' }}>Binary O(log n) steps</th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map((s, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#faf5ff' : '#fff' }}>
                <td style={{ padding: '10px 16px', fontWeight: 600, fontFamily: 'monospace', color: '#5b21b6' }}>{s.label}</td>
                <td style={{ padding: '10px 16px', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>{s.n.toLocaleString()}</td>
                <td style={{ padding: '10px 16px', textAlign: 'center', color: '#059669', fontWeight: 800, fontSize: 16 }}>{s.steps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NeuronTip type="fun">
        <strong>30 steps for 1,000,000,000 elements!</strong> That's the entire population of India.
        Binary Search could find any one person in a sorted list of every Indian — in just 30 comparisons.
        O(log n) is one of the most powerful ideas in all of computer science.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 6 — Binary Search in Real Life
================================================================ */
const REAL_WORLD_CARDS = [
  {
    icon: '📖',
    title: 'Dictionary / Phone Book',
    desc: 'Looking up "Zebra"? You open to the middle — if you land on "M", you jump to the right half. Open middle of that half, repeat.',
    visual: ['A–M', 'N–Z', 'S–Z', 'V–Z', 'Ze...'],
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    icon: '🔧',
    title: 'git bisect (Debugging)',
    desc: '"Which commit broke the build?" git bisect does binary search through your commit history — check mid commit, mark good/bad, repeat.',
    visual: ['100 commits', '50 commits', '25 commits', '12 commits', 'Found bug!'],
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    icon: '📚',
    title: 'Finding a Page',
    desc: '"Go to page 487 in a 600-page book." You open to ~300, flip to ~400, then ~450, then ~475... you zero in fast.',
    visual: ['pg 300', 'pg 450', 'pg 475', 'pg 487'],
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  {
    icon: '🗄️',
    title: 'Database B-Tree Index',
    desc: 'Every time you do SELECT * WHERE id=42, the database uses a B-Tree index — a sorted tree structure enabling binary search across millions of rows instantly.',
    visual: ['Root node', 'Child nodes', 'Leaf nodes', 'Row found!'],
    color: '#8b5cf6',
    bg: '#faf5ff',
    border: '#c4b5fd',
  },
  {
    icon: '🎮',
    title: 'High / Low Guessing Games',
    desc: 'Optimal strategy for any "higher/lower" game: always guess the middle of the remaining range. You minimize worst-case guesses.',
    visual: ['1–1000', '501–1000', '750–1000', '875–1000', 'Found!'],
    color: '#ec4899',
    bg: '#fdf2f8',
    border: '#f9a8d4',
  },
  {
    icon: '🧬',
    title: 'DNA Genome Mapping',
    desc: 'Bioinformatics tools search billions of DNA base pairs for specific sequences using binary search on sorted genome indexes.',
    visual: ['3B pairs', '1.5B', '750M', '375M', 'Match!'],
    color: '#06b6d4',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
]

function RealWorldCards() {
  const [expanded, setExpanded] = useState(null)

  return (
    <SectionBlock icon="🌍" title="Binary Search in Real Life" color="#10b981">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {REAL_WORLD_CARDS.map((card, i) => (
          <motion.div key={i}
            layout
            whileHover={{ y: -4 }}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              background: card.bg, border: `2px solid ${expanded === i ? card.color : card.border}`,
              borderRadius: 20, padding: 20, cursor: 'pointer',
              boxShadow: expanded === i ? `0 8px 32px ${card.color}33` : '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>{card.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: card.color }}>{card.title}</span>
              </div>
              <motion.span
                animate={{ rotate: expanded === i ? 180 : 0 }}
                style={{ fontSize: 16, color: card.color, fontWeight: 700 }}
              >▼</motion.span>
            </div>

            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, marginBottom: 14 }}>
                    {card.desc}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {card.visual.map((step, j) => (
                      <motion.div key={j}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: j * 0.08 }}
                        style={{
                          padding: '4px 12px', borderRadius: 20,
                          background: j === card.visual.length - 1 ? card.color : `${card.color}22`,
                          color: j === card.visual.length - 1 ? '#fff' : card.color,
                          fontSize: 12, fontWeight: 700, border: `1px solid ${card.color}44`,
                        }}>
                        {j + 1}. {step}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {expanded !== i && (
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                {card.desc.slice(0, 80)}...
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic8Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '8px 0 48px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)',
          borderRadius: 28, padding: '40px 44px', marginBottom: 36,
          boxShadow: '0 12px 48px #6366f133',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ repeat: Infinity, duration: 4 }}
          style={{
            position: 'absolute', top: -60, right: -60,
            width: 300, height: 300, borderRadius: '50%',
            background: '#818cf8',
          }}
        />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
            Topic 8 — Think Like a Programmer
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 38, fontWeight: 900,
            color: '#fff', marginBottom: 12, lineHeight: 1.15,
          }}>
            Binary Search
          </h1>
          <p style={{ fontSize: 18, color: '#c7d2fe', lineHeight: 1.65, maxWidth: 540, marginBottom: 20 }}>
            Why search one-by-one when you can cut the problem in <strong style={{ color: '#a5b4fc' }}>HALF</strong> every step?
            From 1,000,000,000 elements to an answer in just 30 comparisons.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['O(log n)', 'Sorted arrays', 'Divide & Conquer', '30 steps → 1B elements'].map((tag, i) => (
              <span key={i} style={{
                padding: '6px 16px', borderRadius: 20,
                background: 'rgba(165,180,252,0.18)', border: '1px solid #6366f155',
                color: '#c7d2fe', fontSize: 13, fontWeight: 600,
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section 1: Race */}
      <SectionBlock icon="🏁" title="Linear vs Binary Search Race" color="#6366f1">
        <Neuron mood="excited" size="medium"
          message="Linear Search checks every element — one by one. Binary Search cuts the problem in HALF each step. Watch them race!"
        />
        <div style={{ marginTop: 24 }}>
          <SearchRace />
        </div>
        <NeuronTip type="tip">
          For 32 elements: Linear Search may need up to 32 steps. Binary Search needs at most
          log₂(32) = <strong>5 steps</strong>. The gap grows MASSIVELY with bigger arrays.
        </NeuronTip>
      </SectionBlock>

      {/* Section 2: Main Visualizer */}
      <SectionBlock icon="🔍" title="Binary Search Visualizer" color="#3b82f6">
        <Neuron mood="explaining" size="medium"
          message="Here's how Binary Search actually works. LOW, MID, and HIGH pointers narrow the search space. Watch the gray-out — each step eliminates half the remaining elements!"
        />
        <div style={{ marginTop: 24 }}>
          <BinarySearchVisualizer />
        </div>
        <NeuronTip type="example">
          <strong>Try entering: 41, 89, or 99</strong> — see different search paths.
          Notice how elements outside the range get grayed out — that's the "eliminate half" magic.
        </NeuronTip>
      </SectionBlock>

      {/* Section 3: Dictionary Game */}
      <SectionBlock icon="🎯" title="The Dictionary Game" color="#ec4899">
        <Neuron mood="waving" size="medium"
          message="I'm thinking of a number between 1 and 1000. Binary Search GUARANTEES finding it in max 10 guesses. Try it yourself — then see how the bot does it!"
        />
        <div style={{ marginTop: 24 }}>
          <DictionaryGame />
        </div>
        <NeuronTip type="fun">
          log₂(1000) ≈ 9.97, so 10 guesses always suffice for any number 1–1000.
          This is why "Higher / Lower" games feel satisfying when played optimally — you're doing Binary Search!
        </NeuronTip>
      </SectionBlock>

      {/* Section 4: Why Sorted */}
      <SectionBlock icon="⚠️" title="Why Binary Search REQUIRES Sorted Data" color="#ef4444">
        <Neuron mood="thinking" size="medium"
          message="Binary Search makes a critical assumption: 'If the midpoint is smaller than my target, the target must be to the RIGHT.' This ONLY works for sorted arrays. Watch what happens on unsorted data..."
        />
        <div style={{ marginTop: 24 }}>
          <WhyMustBeSorted />
        </div>
        <NeuronTip type="warning">
          Never apply Binary Search to unsorted data — it WILL give wrong answers silently.
          Always sort first: O(n log n) sort cost, then O(log n) per query forever.
        </NeuronTip>
      </SectionBlock>

      {/* Section 5: Power of Halving */}
      <PowerOfHalving />

      {/* Section 6: Real World */}
      <RealWorldCards />

      {/* Section 7: Hindi Summary */}
      <SectionBlock icon="🇮🇳" title="हिंदी में Binary Search" color="#ff9933">
        <HindiExplainer
          concept="Binary Search — द्विआधारी खोज"
          english="Binary Search"
          explanation="Dictionary mein word dhundhna sochो — beech mein kholo, left ya right jao. Har baar aadha eliminate karo. Yahi Binary Search hai! Ek crore elements mein sirf 20 steps mein koi bhi element dhundh sakte hain."
          example="मान लो 1 से 1000 के beech koi number sochа hai. Binary Search: 500 try karo — zyada hai toh 250, kam hai toh 750... sirf 10 steps mein mil jaata hai!"
          terms={[
            { hindi: 'द्विआधारी खोज', english: 'Binary Search — beech se dhundhna' },
            { hindi: 'क्रमबद्ध', english: 'Sorted — order mein arranged' },
            { hindi: 'मध्य', english: 'Mid — beech wala element' },
            { hindi: 'हटाओ', english: 'Eliminate — aadha hissa chhod do' },
            { hindi: 'O(log n)', english: 'Steps = log₂(n) — bahut tez!' },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 28,
            background: 'linear-gradient(135deg, #fff8f0, #fff3e0)',
            border: '2px solid #ff9933',
            borderRadius: 20, padding: 28,
          }}
        >
          <div style={{ fontWeight: 800, color: '#c2410c', fontSize: 17, marginBottom: 16 }}>
            Quick Revision — Binary Search
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { q: 'Time Complexity', a: 'O(log n)' },
              { q: 'Space Complexity', a: 'O(1) iterative' },
              { q: 'Requirement', a: 'Sorted array' },
              { q: '1B elements?', a: 'Max 30 steps' },
              { q: 'Key idea', a: 'Eliminate half each step' },
              { q: 'Real use', a: 'DB indexes, git bisect' },
            ].map(({ q, a }, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                border: '1.5px solid #fed7aa',
              }}>
                <div style={{ fontSize: 12, color: '#9a3412', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{q}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#c2410c', fontFamily: 'monospace' }}>{a}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <Neuron mood="happy" size="medium" style={{ marginTop: 24 }}
          message="Binary Search is the reason computers feel instant — sorting data once then searching in O(log n) is behind databases, file systems, and nearly every fast lookup you've ever experienced. You now think like a programmer!"
        />
      </SectionBlock>

    </div>
  )
}
