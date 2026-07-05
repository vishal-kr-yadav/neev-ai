import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 13 — Recursion
   Think Like a Programmer — Visual-First DSA Course
================================================================ */

/* ─────────────────────────────────────────────
   SECTION 1: Russian Doll (Matryoshka)
───────────────────────────────────────────── */
function RussianDollVisualizer() {
  const [openLevel, setOpenLevel] = useState(0) // 0 = all closed, 5 = all open
  const [unwinding, setUnwinding] = useState(false)

  const dolls = [
    { size: 160, color: '#e74c3c', label: 'Problem(5)', emoji: '🪆', baseCase: false },
    { size: 130, color: '#e67e22', label: 'Problem(4)', emoji: '🪆', baseCase: false },
    { size: 102, color: '#f1c40f', label: 'Problem(3)', emoji: '🪆', baseCase: false },
    { size: 76,  color: '#2ecc71', label: 'Problem(2)', emoji: '🪆', baseCase: false },
    { size: 52,  color: '#3498db', label: 'Problem(1)', emoji: '⭐', baseCase: true },
  ]

  const handleClick = () => {
    if (unwinding) return
    if (openLevel < dolls.length) {
      setOpenLevel(l => l + 1)
    } else {
      // Start unwinding
      setUnwinding(true)
      let level = dolls.length - 1
      const interval = setInterval(() => {
        setOpenLevel(level)
        level--
        if (level < 0) {
          clearInterval(interval)
          setUnwinding(false)
          setOpenLevel(0)
        }
      }, 600)
    }
  }

  const phase = openLevel === 0
    ? 'start'
    : openLevel < dolls.length
    ? 'opening'
    : openLevel === dolls.length
    ? 'base'
    : 'unwinding'

  const phaseMessages = {
    start: 'Click the doll to open it — each doll hides a smaller version inside!',
    opening: `Opening doll ${openLevel} of ${dolls.length} — going deeper...`,
    base: 'BASE CASE reached! Problem(1) = trivially solved. Now we unwind!',
    unwinding: 'Unwinding... each level gets its answer from the level below.',
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Phase label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            borderRadius: 20,
            background: phase === 'base'
              ? 'linear-gradient(135deg, #2ecc71, #27ae60)'
              : phase === 'unwinding'
              ? 'linear-gradient(135deg, #9b59b6, #8e44ad)'
              : 'linear-gradient(135deg, #3498db, #2980b9)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          {phaseMessages[phase]}
        </motion.div>
      </AnimatePresence>

      {/* Doll Stack */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        {dolls.map((doll, i) => {
          const isRevealed = openLevel > i
          const isActive = openLevel === i + 1
          const isBaseCase = doll.baseCase && openLevel === dolls.length

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: isBaseCase ? [1, 1.15, 1] : isActive ? 1.08 : 1,
                opacity: isRevealed || i === 0 ? 1 : openLevel > 0 ? 0.6 : 1,
                y: isActive ? -12 : 0,
              }}
              transition={{ duration: 0.4, type: 'spring' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: i === openLevel ? 'pointer' : 'default',
              }}
              onClick={i === openLevel ? handleClick : undefined}
            >
              {/* Doll body */}
              <motion.div
                animate={{
                  boxShadow: isBaseCase
                    ? `0 0 0 4px ${doll.color}, 0 0 24px ${doll.color}88`
                    : isActive
                    ? `0 0 0 3px ${doll.color}88`
                    : 'none',
                }}
                style={{
                  width: doll.size,
                  height: doll.size * 1.25,
                  borderRadius: `${doll.size * 0.5}px ${doll.size * 0.5}px ${doll.size * 0.35}px ${doll.size * 0.35}px`,
                  background: isRevealed
                    ? `linear-gradient(160deg, ${doll.color}dd, ${doll.color})`
                    : `linear-gradient(160deg, ${doll.color}44, ${doll.color}22)`,
                  border: `3px solid ${doll.color}${isRevealed ? 'ff' : '66'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'all 0.4s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: doll.size * 0.28 }}>{isRevealed ? doll.emoji : '?'}</span>
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#fff',
                      textAlign: 'center',
                      padding: '2px 6px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 6,
                    }}
                  >
                    {doll.label}
                  </motion.div>
                )}
                {isBaseCase && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: -10, right: -10,
                      background: '#2ecc71',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    BASE!
                  </motion.div>
                )}
              </motion.div>
              {/* Label */}
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: isRevealed ? doll.color : 'var(--text-secondary)',
                opacity: isRevealed ? 1 : 0.5,
              }}>
                Doll {i + 1}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Click button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={unwinding}
        style={{
          padding: '12px 32px',
          borderRadius: 30,
          border: 'none',
          background: unwinding
            ? '#ccc'
            : openLevel < dolls.length
            ? 'linear-gradient(135deg, #e74c3c, #e67e22)'
            : 'linear-gradient(135deg, #9b59b6, #6c3483)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          cursor: unwinding ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {unwinding
          ? 'Unwinding...'
          : openLevel < dolls.length
          ? openLevel === 0 ? 'Open the doll!' : 'Go deeper...'
          : 'Unwind (return values)'}
      </motion.button>

      {/* Insight */}
      {openLevel === dolls.length && !unwinding && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 20,
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #2ecc7118, #27ae6010)',
            border: '1.5px solid #2ecc71',
            borderRadius: 14,
            fontSize: 14,
            color: '#27ae60',
            fontWeight: 600,
          }}
        >
          Base case = the innermost, trivially-solvable doll. Without it → infinite dolls → CRASH!
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION 2: Factorial Call Stack Visualizer
───────────────────────────────────────────── */
function FactorialVisualizer() {
  const N = 5
  const [step, setStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const intervalRef = useRef(null)

  // Steps: 0..N-1 = pushing frames, N = base case, N+1..2N-1 = unwinding, 2N = done
  const totalSteps = 2 * N + 1

  const factValues = [1, 1, 2, 6, 24, 120] // factorial(0..5)

  const getFrames = (s) => {
    if (s <= N) {
      // Pushing phase: show frames 1..s
      return Array.from({ length: s }, (_, i) => ({
        n: N - i,
        phase: i === s - 1 ? 'active' : 'waiting',
        result: null,
      }))
    } else {
      // Unwinding phase
      const resolved = s - N // how many have been resolved
      return Array.from({ length: N }, (_, i) => {
        const n = N - i
        if (i < N - resolved) return { n, phase: 'waiting', result: null }
        if (i === N - resolved) return { n, phase: 'resolving', result: factValues[n] }
        return { n, phase: 'resolved', result: factValues[n] }
      })
    }
  }

  const frames = getFrames(step)
  const isBaseCase = step === N
  const isDone = step === totalSteps - 1

  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s >= totalSteps - 1) {
            setAutoPlay(false)
            return s
          }
          return s + 1
        })
      }, 900)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoPlay])

  const phaseLabel = step === 0
    ? 'Ready — press Step or Auto-Play'
    : step <= N
    ? `Pushing frame: factorial(${N - step + 1}) calls factorial(${N - step})...`
    : step === N
    ? `BASE CASE: factorial(1) = 1`
    : `Unwinding: factorial(${N - (step - N) + 1}) = ${N - (step - N) + 1} × ${factValues[N - (step - N)]} = ${factValues[N - (step - N) + 1]}`

  return (
    <div>
      {/* Phase banner */}
      <motion.div
        key={Math.min(step > N ? 2 : step, 2)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '10px 18px',
          borderRadius: 12,
          background: isBaseCase
            ? 'linear-gradient(135deg, #2ecc71, #27ae60)'
            : step > N
            ? 'linear-gradient(135deg, #9b59b6, #8e44ad)'
            : 'linear-gradient(135deg, #3498db, #2980b9)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        {step > N && !isBaseCase ? '↑ UNWINDING PHASE' : step <= N && step > 0 ? '↓ CALL STACK GROWING' : ''}{' '}
        {phaseLabel}
      </motion.div>

      {/* Call stack visual */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Stack column */}
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 6, minWidth: 280 }}>
          <div style={{
            textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
            padding: '6px', background: 'var(--border)', borderRadius: 8, marginBottom: 4,
          }}>
            CALL STACK (top = current)
          </div>
          <AnimatePresence>
            {frames.map((frame, i) => (
              <motion.div
                key={frame.n}
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 60, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, type: 'spring' }}
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: `2px solid ${
                    frame.phase === 'active' ? '#3498db'
                    : frame.phase === 'resolving' ? '#9b59b6'
                    : frame.phase === 'resolved' ? '#2ecc71'
                    : '#e0e0e0'
                  }`,
                  background: frame.phase === 'active'
                    ? '#3498db12'
                    : frame.phase === 'resolving'
                    ? '#9b59b612'
                    : frame.phase === 'resolved'
                    ? '#2ecc7112'
                    : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                    factorial({frame.n})
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {frame.n === 1
                      ? 'BASE CASE → returns 1'
                      : frame.result
                      ? `returns ${frame.n} × ${factValues[frame.n - 1]} = ${frame.result}`
                      : `waiting for factorial(${frame.n - 1})...`}
                  </div>
                </div>
                {frame.result !== null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      background: frame.phase === 'resolved' ? '#2ecc71' : '#9b59b6',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 18,
                      borderRadius: 10,
                      padding: '4px 12px',
                    }}
                  >
                    {frame.result}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Result display */}
        <div style={{ textAlign: 'center', minWidth: 140 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>RESULT</div>
          <AnimatePresence mode="wait">
            {isDone ? (
              <motion.div
                key="done"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', margin: '0 auto',
                  boxShadow: '0 8px 32px #2ecc7144',
                }}
              >
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>120</div>
                <div style={{ color: '#fff', fontSize: 11, opacity: 0.85 }}>5!</div>
              </motion.div>
            ) : (
              <motion.div key="waiting" style={{ fontSize: 40 }}>⏳</motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { setStep(s => Math.min(s + 1, totalSteps - 1)); setAutoPlay(false) }}
          disabled={step >= totalSteps - 1}
          style={btnStyle('#3498db', step >= totalSteps - 1)}
        >
          Step →
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setAutoPlay(a => !a)}
          style={btnStyle(autoPlay ? '#e74c3c' : '#9b59b6', step >= totalSteps - 1)}
        >
          {autoPlay ? 'Pause' : 'Auto-Play'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { setStep(0); setAutoPlay(false) }}
          style={btnStyle('#95a5a6')}
        >
          Reset
        </motion.button>
      </div>

      {/* Insight */}
      <div style={{
        marginTop: 20, padding: '12px 18px',
        background: 'linear-gradient(135deg, #9b59b618, #8e44ad10)',
        borderRadius: 12, fontSize: 14, lineHeight: 1.6,
        color: 'var(--text-secondary)',
        border: '1px solid #9b59b630',
      }}>
        <strong style={{ color: '#9b59b6' }}>The Aha Moment:</strong> Recursion is TWO phases — GOING DOWN
        (pushing frames, solving smaller) and COMING BACK UP (collecting answers). The <em>return</em> is
        where the real work happens.
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION 3: Fibonacci Tree Explosion
───────────────────────────────────────────── */

function FibTree() {
  const [n, setN] = useState(5)
  const [showDuplicates, setShowDuplicates] = useState(false)

  // Build fibonacci call tree
  const buildTree = (k) => {
    if (k <= 1) return { n: k, children: [] }
    return { n: k, children: [buildTree(k - 1), buildTree(k - 2)] }
  }

  // Count calls per value
  const countCalls = (tree, counts = {}) => {
    counts[tree.n] = (counts[tree.n] || 0) + 1
    tree.children.forEach(c => countCalls(c, counts))
    return counts
  }

  const tree = buildTree(n)
  const callCounts = countCalls(tree)
  const totalCalls = Object.values(callCounts).reduce((a, b) => a + b, 0)
  const uniqueValues = n + 1

  // Render tree recursively
  const renderNode = (node, depth = 0) => {
    const isDuplicate = showDuplicates && callCounts[node.n] > 1 && node.n > 1
    const isWasted = isDuplicate

    return (
      <div
        key={Math.random()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: depth * 0.05 }}
          style={{
            width: Math.max(38, 52 - depth * 5),
            height: Math.max(38, 52 - depth * 5),
            borderRadius: '50%',
            background: isWasted
              ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
              : node.n <= 1
              ? 'linear-gradient(135deg, #2ecc71, #27ae60)'
              : 'linear-gradient(135deg, #3498db, #2980b9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: Math.max(11, 16 - depth * 2),
            boxShadow: isWasted ? '0 0 12px #e74c3c88' : '0 3px 10px rgba(0,0,0,0.15)',
            border: isWasted ? '2px solid #e74c3c' : '2px solid transparent',
            zIndex: 1,
            position: 'relative',
          }}
        >
          {node.n}
        </motion.div>

        {node.children.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: Math.max(4, 20 - depth * 4) }}>
            {node.children.map((child, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 2, height: 16, background: '#ccc' }} />
                {renderNode(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>fib(</span>
          <input
            type="range"
            min={2}
            max={7}
            value={n}
            onChange={e => setN(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{n})</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowDuplicates(d => !d)}
          style={{
            padding: '8px 18px', borderRadius: 20, border: 'none',
            background: showDuplicates
              ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
              : 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {showDuplicates ? 'Hide Waste' : 'Show Duplicate Calls'}
        </motion.button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatChip label="Total Calls" value={totalCalls} color="#e74c3c" />
        <StatChip label="Unique Values" value={uniqueValues} color="#2ecc71" />
        <StatChip
          label="Wasted Work"
          value={`${totalCalls - uniqueValues} extra calls!`}
          color="#f39c12"
        />
      </div>

      {/* Tree */}
      <div style={{
        overflowX: 'auto',
        padding: '20px 10px',
        background: 'var(--bg-card)',
        borderRadius: 16,
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: 300 }}>
          {renderNode(tree)}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
        <LegendDot color="#3498db" label="Unique call" />
        <LegendDot color="#2ecc71" label="Base case (fib(0), fib(1))" />
        {showDuplicates && <LegendDot color="#e74c3c" label="DUPLICATE — computed again!" />}
      </div>

      {n >= 6 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: 16, padding: '12px 18px',
            background: '#e74c3c10', border: '1.5px solid #e74c3c66',
            borderRadius: 12, fontSize: 14, color: '#c0392b', fontWeight: 600,
          }}
        >
          For fib(30) — over 2.7 million calls! For fib(50) — over a trillion!
          This is why we need Dynamic Programming (memoization). Coming next!
        </motion.div>
      )}
    </div>
  )
}

function StatChip({ label, value, color }) {
  return (
    <div style={{
      padding: '8px 16px', borderRadius: 10,
      background: `${color}12`, border: `1.5px solid ${color}44`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
      {label}
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION 4: Base Case vs Recursive Case Challenge
───────────────────────────────────────────── */
const CHALLENGES = [
  {
    name: 'factorial(n)',
    lines: [
      { code: 'if (n === 1) return 1', type: 'base', label: 'Base case' },
      { code: 'return n * factorial(n - 1)', type: 'recursive', label: 'Recursive call' },
      { code: 'function factorial(n) {', type: 'other', label: '' },
      { code: '}', type: 'other', label: '' },
    ],
  },
  {
    name: 'sumArray(arr, i)',
    lines: [
      { code: 'function sumArray(arr, i = 0) {', type: 'other', label: '' },
      { code: 'if (i === arr.length) return 0', type: 'base', label: 'Base case' },
      { code: 'return arr[i] + sumArray(arr, i + 1)', type: 'recursive', label: 'Recursive call' },
      { code: '}', type: 'other', label: '' },
    ],
  },
  {
    name: 'countDigits(n)',
    lines: [
      { code: 'function countDigits(n) {', type: 'other', label: '' },
      { code: 'if (n < 10) return 1', type: 'base', label: 'Base case' },
      { code: '}', type: 'other', label: '' },
      { code: 'return 1 + countDigits(Math.floor(n / 10))', type: 'recursive', label: 'Recursive call' },
    ],
  },
  {
    name: 'power(x, n)',
    lines: [
      { code: 'function power(x, n) {', type: 'other', label: '' },
      { code: 'return x * power(x, n - 1)', type: 'recursive', label: 'Recursive call' },
      { code: 'if (n === 0) return 1', type: 'base', label: 'Base case' },
      { code: '}', type: 'other', label: '' },
    ],
  },
]

function BaseCaseChallenge() {
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [selected, setSelected] = useState({}) // lineIdx -> type clicked
  const [showOverflow, setShowOverflow] = useState(false)

  const challenge = CHALLENGES[challengeIdx]

  const handleLineClick = (lineIdx, type) => {
    if (type === 'other') return
    setSelected(s => ({ ...s, [lineIdx]: type }))
  }

  const correctBase = challenge.lines.findIndex(l => l.type === 'base')
  const correctRecursive = challenge.lines.findIndex(l => l.type === 'recursive')
  const baseCorrect = selected[correctBase] === 'base'
  const recursiveCorrect = selected[correctRecursive] === 'recursive'
  const allCorrect = baseCorrect && recursiveCorrect

  const lineColor = (i, line) => {
    if (line.type === 'other') return { bg: 'transparent', border: 'transparent', color: 'var(--text-secondary)' }
    const s = selected[i]
    if (!s) return { bg: '#f8f9fa', border: '#ddd', color: 'var(--text-primary)' }
    if (s === line.type) return { bg: '#2ecc7115', border: '#2ecc71', color: '#27ae60' }
    return { bg: '#e74c3c15', border: '#e74c3c', color: '#c0392b' }
  }

  return (
    <div>
      {/* Challenge selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CHALLENGES.map((c, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setChallengeIdx(i); setSelected({}); setShowOverflow(false) }}
            style={{
              padding: '7px 15px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: i === challengeIdx ? '#3498db' : 'var(--bg-card)',
              color: i === challengeIdx ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
              border: `1.5px solid ${i === challengeIdx ? '#3498db' : 'var(--border)'}`,
            }}
          >
            {c.name}
          </motion.button>
        ))}
      </div>

      {/* Instruction */}
      <div style={{ marginBottom: 14, fontSize: 14, color: 'var(--text-secondary)' }}>
        Click to identify: <span style={{ color: '#2ecc71', fontWeight: 700 }}>Base Case</span> and{' '}
        <span style={{ color: '#3498db', fontWeight: 700 }}>Recursive Call</span>
      </div>

      {/* Code lines */}
      <div style={{ fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        {challenge.lines.map((line, i) => {
          const c = lineColor(i, line)
          return (
            <motion.div
              key={i}
              whileHover={line.type !== 'other' ? { scale: 1.01 } : {}}
              onClick={() => handleLineClick(i, line.type)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: `1.5px solid ${c.border}`,
                background: c.bg,
                color: c.color,
                cursor: line.type !== 'other' ? 'pointer' : 'default',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
              }}
            >
              <code>{line.code}</code>
              {selected[i] === line.type && line.type !== 'other' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 8,
                    background: selected[i] === 'base' ? '#2ecc71' : '#3498db',
                    color: '#fff',
                  }}
                >
                  {line.label}
                </motion.span>
              )}
              {selected[i] && selected[i] !== line.type && (
                <span style={{ color: '#e74c3c', fontSize: 13, fontWeight: 700 }}>Try again!</span>
              )}
            </motion.div>
          )
        })}
      </div>

      {allCorrect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '14px 20px', borderRadius: 14,
            background: 'linear-gradient(135deg, #2ecc7118, #27ae6010)',
            border: '1.5px solid #2ecc71',
            color: '#27ae60', fontWeight: 700, fontSize: 15,
          }}
        >
          Correct! Try the next function.
        </motion.div>
      )}

      {/* Stack overflow demo */}
      <div style={{ marginTop: 20 }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowOverflow(o => !o)}
          style={btnStyle('#e74c3c')}
        >
          What if there's NO base case? Show me!
        </motion.button>

        <AnimatePresence>
          {showOverflow && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginTop: 14 }}
            >
              <div style={{
                background: '#1a0a0a', borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ color: '#ff4444', fontFamily: 'monospace', fontSize: 13, marginBottom: 10, fontWeight: 700 }}>
                  No base case — infinite recursion!
                </div>
                {Array.from({ length: 12 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 - i * 0.06 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      fontFamily: 'monospace', fontSize: 12,
                      color: `hsl(${0 + i * 5}, 80%, ${60 - i * 3}%)`,
                      padding: '2px 8px',
                    }}
                  >
                    {`→ factorial(${1000 + i}) calls factorial(${1001 + i})...`}
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  style={{
                    marginTop: 12, padding: '10px 16px',
                    background: '#ff0000', borderRadius: 10,
                    color: '#fff', fontWeight: 800, fontSize: 16, textAlign: 'center',
                  }}
                >
                  MAXIMUM CALL STACK SIZE EXCEEDED
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  style={{ color: '#ff9966', fontSize: 12, marginTop: 8, fontFamily: 'monospace' }}
                >
                  RangeError: Maximum call stack size exceeded
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION 5: Recursion vs Iteration
───────────────────────────────────────────── */
function RecursionVsIteration() {
  const [running, setRunning] = useState(false)
  const [recStep, setRecStep] = useState(0)
  const [iterStep, setIterStep] = useState(0)
  const N = 5

  const start = () => {
    setRunning(true)
    setRecStep(0)
    setIterStep(0)
    // Iteration is faster (simpler) — advances every 400ms
    // Recursion builds stack first, then unwinds — 800ms per step
    let it = 0
    let rc = 0

    const iterTimer = setInterval(() => {
      it++
      setIterStep(it)
      if (it >= N) clearInterval(iterTimer)
    }, 400)

    const recTimer = setInterval(() => {
      rc++
      setRecStep(rc)
      if (rc >= N * 2) { clearInterval(recTimer); setRunning(false) }
    }, 600)
  }

  const recFrames = recStep <= N
    ? Array.from({ length: recStep }, (_, i) => N - i)
    : Array.from({ length: N * 2 - recStep }, (_, i) => i + 1).reverse()

  const iterVal = Array.from({ length: Math.min(iterStep, N) }, (_, i) => i + 1)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Recursion side */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 20,
          border: '2px solid #9b59b6',
        }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#9b59b6', marginBottom: 12 }}>
            Recursive sum(n)
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e', borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <div style={{ color: '#cba6f7' }}>function sum(n) {'{'}</div>
            <div style={{ color: '#a6e3a1', paddingLeft: 16 }}>if (n === 0) return 0</div>
            <div style={{ color: '#89dceb', paddingLeft: 16 }}>return n + sum(n - 1)</div>
            <div style={{ color: '#cba6f7' }}>{'}'}</div>
          </div>

          {/* Call stack */}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
            CALL STACK (uses O(n) memory)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AnimatePresence>
              {recFrames.map((v, i) => (
                <motion.div
                  key={`rec-${v}-${i}`}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 30, opacity: 0, height: 0 }}
                  style={{
                    padding: '5px 10px', borderRadius: 8,
                    background: '#9b59b618', border: '1px solid #9b59b644',
                    fontFamily: 'monospace', fontSize: 12, color: '#9b59b6',
                  }}
                >
                  sum({v})
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Iteration side */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 20,
          border: '2px solid #2ecc71',
        }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#2ecc71', marginBottom: 12 }}>
            Iterative sum(n)
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e', borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <div style={{ color: '#cba6f7' }}>function sum(n) {'{'}</div>
            <div style={{ color: '#89dceb', paddingLeft: 16 }}>let total = 0</div>
            <div style={{ color: '#89dceb', paddingLeft: 16 }}>for (let i = 1; i {'<='} n; i++)</div>
            <div style={{ color: '#a6e3a1', paddingLeft: 32 }}>total += i</div>
            <div style={{ color: '#a6e3a1', paddingLeft: 16 }}>return total</div>
            <div style={{ color: '#cba6f7' }}>{'}'}</div>
          </div>

          {/* Single variable */}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
            SINGLE VARIABLE (O(1) memory)
          </div>
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: '#2ecc7118', border: '1px solid #2ecc7144',
            fontFamily: 'monospace', fontSize: 14, color: '#27ae60',
            textAlign: 'center',
          }}>
            total = {iterVal.reduce((a, b) => a + b, 0)}
            {iterStep > 0 && iterStep <= N && (
              <span style={{ color: '#2ecc71', marginLeft: 8 }}>
                (+{iterStep})
              </span>
            )}
          </div>
          {iterStep >= N && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                marginTop: 10, textAlign: 'center',
                fontWeight: 800, color: '#2ecc71', fontSize: 18,
              }}
            >
              Done! Result: {N * (N + 1) / 2}
            </motion.div>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={start}
        disabled={running}
        style={btnStyle('#3498db', running)}
      >
        {running ? 'Running...' : 'Run Both Simultaneously'}
      </motion.button>

      <div style={{
        marginTop: 20, padding: '14px 18px',
        background: 'linear-gradient(135deg, #3498db10, #2980b908)',
        border: '1.5px solid #3498db30', borderRadius: 12,
        fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
      }}>
        <strong style={{ color: '#3498db' }}>So when IS recursion better?</strong> When the problem
        is <em>naturally recursive</em> — trees, graphs, divide-and-conquer, backtracking. For simple
        loops like this, iteration wins on memory.
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION 6: Tower of Hanoi
───────────────────────────────────────────── */
function TowerOfHanoi() {
  const NDISKS = 3
  const [pegs, setPegs] = useState([
    [3, 2, 1], // A: bottom = 3, top = 1
    [],
    [],
  ])
  const [selected, setSelected] = useState(null) // peg index
  const [moveCount, setMoveCount] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [solutionStep, setSolutionStep] = useState(0)
  const [solutionMoves, setSolutionMoves] = useState([])
  const [autoSolving, setAutoSolving] = useState(false)
  const [won, setWon] = useState(false)
  const solvIntervalRef = useRef(null)

  const DISK_COLORS = ['#e74c3c', '#e67e22', '#3498db']

  const reset = () => {
    setPegs([[3, 2, 1], [], []])
    setSelected(null)
    setMoveCount(0)
    setShowSolution(false)
    setSolutionStep(0)
    setSolutionMoves([])
    setAutoSolving(false)
    setWon(false)
    clearInterval(solvIntervalRef.current)
  }

  const handlePegClick = (pegIdx) => {
    if (autoSolving) return
    const topDisk = pegs[pegIdx][pegs[pegIdx].length - 1]

    if (selected === null) {
      // Select peg if it has disks
      if (pegs[pegIdx].length > 0) setSelected(pegIdx)
    } else {
      if (pegIdx === selected) { setSelected(null); return }
      // Try to move
      const fromTop = pegs[selected][pegs[selected].length - 1]
      const toTop = topDisk
      if (toTop !== undefined && toTop < fromTop) {
        setSelected(null)
        return // invalid
      }
      const newPegs = pegs.map(p => [...p])
      const disk = newPegs[selected].pop()
      newPegs[pegIdx].push(disk)
      setPegs(newPegs)
      setMoveCount(m => m + 1)
      setSelected(null)
      if (newPegs[2].length === NDISKS) setWon(true)
    }
  }

  // Generate hanoi moves
  const generateMoves = (n, from, to, via, moves = []) => {
    if (n === 0) return moves
    generateMoves(n - 1, from, via, to, moves)
    moves.push([from, to])
    generateMoves(n - 1, via, to, from, moves)
    return moves
  }

  const autoSolve = () => {
    const moves = generateMoves(NDISKS, 0, 2, 1)
    setSolutionMoves(moves)
    setSolutionStep(0)
    setShowSolution(true)
    setAutoSolving(true)
    setPegs([[3, 2, 1], [], []])
    setMoveCount(0)
    setWon(false)

    let state = [[3, 2, 1], [], []]
    let idx = 0
    solvIntervalRef.current = setInterval(() => {
      if (idx >= moves.length) {
        clearInterval(solvIntervalRef.current)
        setAutoSolving(false)
        setWon(true)
        return
      }
      const [from, to] = moves[idx]
      const newState = state.map(p => [...p])
      const disk = newState[from].pop()
      newState[to].push(disk)
      state = newState
      setPegs(newState)
      setMoveCount(idx + 1)
      setSolutionStep(idx + 1)
      idx++
    }, 800)
  }

  const pegNames = ['A', 'B', 'C']
  const pegColors = ['#e74c3c', '#3498db', '#2ecc71']

  return (
    <div>
      {/* Pegs */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        {pegs.map((peg, pegIdx) => (
          <motion.div
            key={pegIdx}
            whileHover={{ scale: autoSolving ? 1 : 1.02 }}
            onClick={() => handlePegClick(pegIdx)}
            style={{
              cursor: autoSolving ? 'default' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
              padding: '10px 16px',
              borderRadius: 16,
              border: `2px solid ${selected === pegIdx ? pegColors[pegIdx] : 'transparent'}`,
              background: selected === pegIdx ? `${pegColors[pegIdx]}10` : 'transparent',
              transition: 'all 0.2s',
              minWidth: 100,
            }}
          >
            {/* Peg label */}
            <div style={{ fontWeight: 800, color: pegColors[pegIdx], marginBottom: 8, fontSize: 16 }}>
              Peg {pegNames[pegIdx]}
            </div>
            {/* Disks area (min height to show empty peg) */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, minHeight: 100, justifyContent: 'flex-start', alignItems: 'center' }}>
              {peg.map((disk, di) => (
                <motion.div
                  key={disk}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    height: 22,
                    width: 20 + disk * 28,
                    borderRadius: 8,
                    background: DISK_COLORS[disk - 1],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    opacity: selected === pegIdx && di === peg.length - 1 ? 0.6 : 1,
                  }}
                >
                  {disk}
                </motion.div>
              ))}
            </div>
            {/* Rod */}
            <div style={{ width: 6, height: 8, background: '#aaa', borderRadius: 3 }} />
            <div style={{ width: 120, height: 6, background: '#aaa', borderRadius: 3 }} />
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <StatChip label="Moves" value={moveCount} color="#3498db" />
        <StatChip label="Optimal" value={Math.pow(2, NDISKS) - 1} color="#2ecc71" />
      </div>

      {won && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            textAlign: 'center', padding: '14px 20px', marginBottom: 16,
            background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
            borderRadius: 14, color: '#fff', fontWeight: 800, fontSize: 18,
          }}
        >
          Solved in {moveCount} moves! (Optimal = {Math.pow(2, NDISKS) - 1})
        </motion.div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        {!autoSolving && (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={autoSolve} style={btnStyle('#9b59b6')}>
            Show Recursive Solution
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={reset} style={btnStyle('#95a5a6')}>
          Reset
        </motion.button>
      </div>

      {/* Recursive idea */}
      <div style={{
        padding: '14px 18px', borderRadius: 12, fontSize: 14, lineHeight: 1.7,
        background: '#9b59b610', border: '1.5px solid #9b59b630',
        color: 'var(--text-secondary)',
      }}>
        <strong style={{ color: '#9b59b6' }}>The Recursive Insight:</strong>{' '}
        hanoi(n, from, to, via) = {' '}
        move n-1 disks to <em>via</em> → move disk n to <em>to</em> → move n-1 from <em>via</em> to <em>to</em>.
        Just 3 lines of code solves ANY number of disks!
      </div>

      {showSolution && solutionMoves.length > 0 && (
        <div style={{ marginTop: 14, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Move sequence:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {solutionMoves.map(([f, t], i) => (
              <span
                key={i}
                style={{
                  padding: '3px 8px', borderRadius: 6,
                  background: i < solutionStep ? '#2ecc7118' : 'var(--bg-card)',
                  border: `1px solid ${i < solutionStep ? '#2ecc71' : 'var(--border)'}`,
                  color: i < solutionStep ? '#27ae60' : 'var(--text-secondary)',
                  fontSize: 11,
                }}
              >
                {pegNames[f]}→{pegNames[t]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Shared Helpers
───────────────────────────────────────────── */
function btnStyle(color, disabled = false) {
  return {
    padding: '10px 24px',
    borderRadius: 24,
    border: 'none',
    background: disabled ? '#ccc' : `linear-gradient(135deg, ${color}, ${color}cc)`,
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1,
  }
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function Topic13Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 8px 60px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48, marginTop: 8 }}
      >
        <div style={{ fontSize: 72, marginBottom: 12 }}>🪆</div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.1,
        }}>
          Recursion
        </h1>
        <p style={{
          fontSize: 18, color: 'var(--text-secondary)', margin: '14px 0 0',
          maxWidth: 540, marginLeft: 'auto', marginRight: 'auto',
        }}>
          When a function calls itself — the mind-bending trick behind trees, graphs, and DP.
        </p>
      </motion.div>

      {/* Neuron intro */}
      <div style={{ marginBottom: 36 }}>
        <Neuron
          mood="excited"
          size="medium"
          message="Recursion is the art of solving a BIG problem by solving a SMALLER version of the SAME problem, until the problem becomes so tiny it's trivial. It's everywhere — file systems, compilers, search engines, the internet itself!"
        />
      </div>

      {/* SECTION 1: Russian Doll */}
      <SectionBlock icon="🪆" title="The Russian Doll" color="#e74c3c">
        <Neuron
          mood="explaining"
          size="small"
          style={{ marginBottom: 24 }}
          message="Matryoshka dolls ARE recursion. Each doll contains a smaller copy of itself. The tiniest doll (base case) contains nothing — that's where the recursion stops and the unwind begins."
        />
        <InteractiveDemo
          title="Matryoshka Recursion"
          instruction="Open each doll to go deeper. The innermost doll is the BASE CASE. Then watch the dolls close back up — that's the RETURN."
        >
          <RussianDollVisualizer />
        </InteractiveDemo>

        <NeuronTip type="simple">
          <strong>In one line:</strong> Recursion = solving a problem by solving a smaller version of the same problem,
          until you hit the base case (trivially solved). Then each level returns its answer to the level above.
        </NeuronTip>

        <HindiExplainer
          concept="Recursion की शुरुआत"
          english="Understanding Recursion"
          explanation="Recursion matlab function apne aap ko call karta hai, lekin thoda chhota problem lekar. Jaise Russian doll — bahar ki doll andar ki chhoti doll ko open karti hai, woh phir aur chhoti, jab tak sabse chhoti doll na mile (base case). Phir wapas close hote hain."
          example="Socho tum mirror ke saamne khade ho aur peeche bhi mirror hai — infinite reflections dikhte hain. Base case na ho toh yahi hoga function ke saath — infinite calls!"
          terms={[
            { hindi: 'पुनरावृत्ति', english: 'Recursion', meaning: 'Function ka apne aap ko call karna' },
            { hindi: 'आधार स्थिति', english: 'Base Case', meaning: 'Woh condition jahan recursion rukti hai' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 2: Factorial Visualizer */}
      <SectionBlock icon="📚" title="Factorial — The Call Stack" color="#9b59b6">
        <Neuron
          mood="thinking"
          size="small"
          style={{ marginBottom: 24 }}
          message="factorial(5) = 5 × factorial(4). factorial(4) = 4 × factorial(3). This chain keeps going DOWN until we hit factorial(1) = 1. Then we UNWIND: each frame gets its answer and returns. Watch the call stack grow and shrink."
        />
        <InteractiveDemo
          title="Call Stack Visualizer"
          instruction="Use Step or Auto-Play to watch factorial(5) unfold. Notice the two phases: PUSH (going down) and UNWIND (coming back up with answers)."
        >
          <FactorialVisualizer />
        </InteractiveDemo>

        <NeuronTip type="warning">
          <strong>Stack Overflow:</strong> Every recursive call adds a frame to the call stack. If recursion goes too deep
          (no base case, or n = 100,000), you exceed the stack limit → crash!
          Always know your recursion depth.
        </NeuronTip>

        <HindiExplainer
          concept="Call Stack"
          english="Call Stack in Recursion"
          explanation="Jab function apne aap ko call karta hai, ek nayi 'frame' stack pe add hoti hai. Jaise thali ek ke upar ek rakhte hain. Base case pe pahunchke wapas aate hain, ek ek thali uthate jaate hain — yahi 'unwinding' hai."
          example="Stack overflow tab hota hai jab bahut zyada thaliyaan rakh do — stack gir jaata hai! Isliye base case bahut zaroori hai."
          terms={[
            { hindi: 'कॉल स्टैक', english: 'Call Stack', meaning: 'Function calls ki thali jaisi structure' },
            { hindi: 'स्टैक ओवरफ्लो', english: 'Stack Overflow', meaning: 'Jab stack bhar jaye — crash!' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 3: Fibonacci Tree */}
      <SectionBlock icon="🌳" title="Fibonacci — The Tree Explosion" color="#e67e22">
        <Neuron
          mood="thinking"
          size="small"
          style={{ marginBottom: 24 }}
          message="fib(6) calls fib(5) AND fib(4). Each of those calls two more. The call tree explodes exponentially! Worse: fib(3) is computed 3 times, fib(2) computed 5 times. Pure waste. This is WHY we need Dynamic Programming."
        />
        <InteractiveDemo
          title="Fibonacci Call Tree"
          instruction="Drag the slider to see how the tree explodes. Toggle 'Show Duplicate Calls' to see the wasted work in red."
        >
          <FibTree />
        </InteractiveDemo>

        <NeuronTip type="deep">
          <strong>Exponential Time O(2^n):</strong> Naive recursive Fibonacci has 2^n calls. fib(50) = over 1 trillion calls.
          But only 51 unique values exist! Dynamic Programming (memoization) brings this down to O(n).
          We will cover that in the DP topic!
        </NeuronTip>

        <HindiExplainer
          concept="Fibonacci Tree aur Waste"
          english="Exponential Recursion"
          explanation="fib(6) ka tree exponentially bada hota hai. Red nodes woh calculations hain jo baar baar dobara ho rahe hain. fib(2) ko 5 baar compute kiya gaya — yeh sab waste hai! Dynamic Programming mein hum yeh results yaad rakhte hain."
          example="Socho tum same sum 5 baar calculator pe karo — time waste! Ek baar karke answer yaad rakh lo. Yahi memoization hai."
          terms={[
            { hindi: 'द्विघातीय समय', english: 'Exponential Time O(2^n)', meaning: 'Har level pe calls double ho jaate hain' },
            { hindi: 'मेमोइज़ेशन', english: 'Memoization', meaning: 'Results yaad rakhna, dobara compute na karna' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 4: Base Case Challenge */}
      <SectionBlock icon="🎯" title="Base Case vs Recursive Case" color="#2ecc71">
        <Neuron
          mood="explaining"
          size="small"
          style={{ marginBottom: 24 }}
          message="Every recursive function has exactly two jobs: (1) handle the base case directly, and (2) make a recursive call on a SMALLER input. Can you spot which is which? And what happens if the base case is missing?"
        />
        <InteractiveDemo
          title="Identify Base & Recursive Cases"
          instruction="Click on the line that is the Base Case (green) and the Recursive Call (blue). Switch between 4 different functions!"
        >
          <BaseCaseChallenge />
        </InteractiveDemo>

        <NeuronTip type="tip">
          <strong>The Two Rules:</strong> (1) Base case MUST exist and MUST be reachable.
          (2) Each recursive call MUST move CLOSER to the base case (smaller input, simpler problem).
          Break either rule → infinite recursion → stack overflow.
        </NeuronTip>

        <HindiExplainer
          concept="Base Case aur Recursive Case"
          english="Two Parts of Every Recursive Function"
          explanation="Har recursive function ke do hisse hote hain. Pehla: base case — yahan directly answer dete hain. Doosra: recursive case — problem chhhota karke apne aap ko call karte hain. Dono zaroori hain!"
          example="Seedhi: jab ghar se niklo (base case = ghar ke bahar ho gaye). Nahi toh: pehle ek kadam andar jaao, phir dobara nikalne ki koshish karo."
          terms={[
            { hindi: 'आधार स्थिति', english: 'Base Case', meaning: 'Jahan seedha answer milta hai' },
            { hindi: 'पुनरावर्ती स्थिति', english: 'Recursive Case', meaning: 'Problem chhota karke call karna' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 5: Recursion vs Iteration */}
      <SectionBlock icon="⚖️" title="Recursion vs Iteration" color="#3498db">
        <Neuron
          mood="thinking"
          size="small"
          style={{ marginBottom: 24 }}
          message="Both recursion and iteration can solve the same problems. But recursion uses O(n) stack memory while iteration uses O(1). For simple loops, iteration wins. But for tree traversal, backtracking, divide-and-conquer? Recursion is ELEGANT."
        />
        <InteractiveDemo
          title="Race: Recursion vs Iteration"
          instruction="Watch both solve sum(1..5) simultaneously. See how recursion builds a stack while iteration uses a single variable."
        >
          <RecursionVsIteration />
        </InteractiveDemo>

        <NeuronTip type="example">
          <strong>When to use Recursion:</strong> File system traversal (folders inside folders), tree/graph search,
          merge sort, quick sort, Tower of Hanoi, JSON parsing, expression evaluation.
          When the data structure IS recursive, the algorithm naturally is too!
        </NeuronTip>

        <HindiExplainer
          concept="Recursion vs Iteration"
          english="When to Use Each"
          explanation="Iteration (loop) zyada efficient hai memory ke liye — O(1) memory. Recursion stack use karta hai — O(n) memory. Lekin jab problem naturally recursive ho (tree, graph, divide-and-conquer), tab recursion code ko bahut simple bana deta hai."
          example="Jaise folder ke andar folder ke andar file dhundna — recursion ke bina bohot mushkil code likhna padega. Recursion ke saath? Sirf 5 lines!"
          terms={[
            { hindi: 'पुनरावृत्ति (loop)', english: 'Iteration', meaning: 'Loop se problem solve karna — O(1) memory' },
            { hindi: 'पुनरावृत्ति (recursion)', english: 'Recursion', meaning: 'Function se call karna — O(n) memory' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 6: Tower of Hanoi */}
      <SectionBlock icon="🗼" title="Tower of Hanoi" color="#e74c3c">
        <Neuron
          mood="excited"
          size="small"
          style={{ marginBottom: 24 }}
          message="Tower of Hanoi is THE classic recursion puzzle. 3 pegs, n disks. Move all disks from peg A to peg C. Rule: never place a larger disk on a smaller one. Try to solve it yourself — then see how recursion makes it EFFORTLESS!"
        />
        <InteractiveDemo
          title="Tower of Hanoi — Try It!"
          instruction="Click a peg to pick up its top disk, then click another peg to place it. Try to move all disks to peg C! Then watch the recursive solution."
        >
          <TowerOfHanoi />
        </InteractiveDemo>

        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, #e74c3c10, #c0392b08)',
          border: '1.5px solid #e74c3c30',
          marginBottom: 16,
          fontFamily: 'monospace', fontSize: 14, lineHeight: 2,
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontWeight: 800, color: '#e74c3c', marginBottom: 8, fontFamily: 'inherit' }}>
            The Recursive Solution (just 5 lines!):
          </div>
          <div><span style={{ color: '#9b59b6' }}>function</span> <span style={{ color: '#3498db' }}>hanoi</span>(n, from, to, via) {'{'}</div>
          <div style={{ paddingLeft: 24 }}><span style={{ color: '#e67e22' }}>if</span> (n === <span style={{ color: '#2ecc71' }}>0</span>) <span style={{ color: '#e67e22' }}>return</span><span style={{ color: '#95a5a6' }}>; // base case</span></div>
          <div style={{ paddingLeft: 24 }}>hanoi(n - <span style={{ color: '#2ecc71' }}>1</span>, from, via, to)<span style={{ color: '#95a5a6' }}>; // move n-1 to helper</span></div>
          <div style={{ paddingLeft: 24 }}>move(from, to)<span style={{ color: '#95a5a6' }}>; // move largest disk</span></div>
          <div style={{ paddingLeft: 24 }}>hanoi(n - <span style={{ color: '#2ecc71' }}>1</span>, via, to, from)<span style={{ color: '#95a5a6' }}>; // move n-1 to target</span></div>
          <div>{'}'}</div>
        </div>

        <NeuronTip type="fun">
          <strong>Mind-blowing fact:</strong> For 64 disks (the legend of Hanoi), you need 2^64 - 1 moves.
          At 1 move per second, that's 585 billion years! The algorithm is correct — but exponential time
          makes some correct solutions practically impossible.
        </NeuronTip>

        <HindiExplainer
          concept="Tower of Hanoi"
          english="Classic Recursion Problem"
          explanation="Hanoi puzzle mein recursion ka jadoo hai. N disks move karne ke liye: N-1 disks pehle helper peg pe, phir sabse bada disk target pe, phir N-1 disks wapas helper se target pe. Yahi 3 steps recursive hain!"
          example="Socho tumhe 5 log ek kamre se doosre mein shift karne hain lekin door itna chhota hai ki ek baar mein sirf 1 jaaye, aur bade ke upar chhota nahin ho sakta — recursion solution: pehle upar wale 4 ko beech mein rakho!"
          terms={[
            { hindi: 'टॉवर ऑफ हनोई', english: 'Tower of Hanoi', meaning: 'Classic recursion puzzle — n disks, 3 pegs' },
            { hindi: '2^n - 1', english: 'Minimum Moves', meaning: 'N disks ke liye minimum moves' },
          ]}
        />
      </SectionBlock>

      {/* SECTION 7: Hindi Summary */}
      <SectionBlock icon="हिं" title="Hindi Summary — पूरा Recursion एक नज़र में" color="#ff9933">
        <Neuron
          mood="waving"
          size="medium"
          style={{ marginBottom: 28 }}
          message="You've mastered recursion! Russian dolls, growing call stacks, exploding Fibonacci trees, Tower of Hanoi — you've seen it all. The key insight: EVERY recursive solution has (1) a base case and (2) a recursive call that shrinks the problem."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { icon: '🪆', title: 'Russian Doll', desc: 'Problem contains a smaller copy of itself', color: '#e74c3c' },
            { icon: '📚', title: 'Call Stack', desc: 'Each call adds a frame; base case unwinds', color: '#9b59b6' },
            { icon: '🌳', title: 'Fibonacci Tree', desc: 'Exponential calls — motivates DP', color: '#e67e22' },
            { icon: '🎯', title: 'Base + Recursive', desc: 'Two parts: stop condition + smaller call', color: '#2ecc71' },
            { icon: '⚖️', title: 'Recursion vs Loop', desc: 'Loops are O(1) memory; recursion O(n)', color: '#3498db' },
            { icon: '🗼', title: 'Tower of Hanoi', desc: '5 lines of recursion = elegant solution', color: '#e74c3c' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              style={{
                padding: '16px',
                borderRadius: 14,
                background: `${item.color}0d`,
                border: `1.5px solid ${item.color}33`,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 800, color: item.color, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <HindiExplainer
          concept="Recursion — पूरा सार"
          english="Complete Summary"
          explanation="Recursion matlab: apne aap ko bulana, jab tak chhota chhota problem na mil jaye (base case). Jaise Russian doll — bahar se andar jaao (call stack badhta hai), base case milne par wapas aao (unwinding), har level apna answer neeche se lekar upar bhejta hai. Fibonacci mein tree explosion hota hai isliye Dynamic Programming zaroori hai. Iteration memory-efficient hai lekin tree/graph ke liye recursion elegant hai. Tower of Hanoi mein 5 lines ka recursion hazaaron moves solve karta hai!"
          example="File system: folder ke andar folder ke andar file dhundna — recursion ke bina sochna bhi mushkil! Recursion ke saath: 'iss folder mein dhundho, agar folder mile toh wahi function dubara chalao.'"
          terms={[
            { hindi: 'पुनरावृत्ति', english: 'Recursion', meaning: 'Function ka apne aap ko call karna' },
            { hindi: 'आधार स्थिति', english: 'Base Case', meaning: 'Jahan recursion rukti hai' },
            { hindi: 'कॉल स्टैक', english: 'Call Stack', meaning: 'Recursive calls ki memory' },
            { hindi: 'स्टैक ओवरफ्लो', english: 'Stack Overflow', meaning: 'Stack bhar jane par crash' },
            { hindi: 'अनावरण', english: 'Unwinding', meaning: 'Base case ke baad wapas aana' },
          ]}
        />

        {/* What's next */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            marginTop: 24,
            padding: '20px 24px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #667eea15, #764ba215)',
            border: '1.5px solid #667eea44',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>
            Up Next: Dynamic Programming
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Remember how Fibonacci re-computed fib(3) five times? DP fixes that.
            Memoization + Tabulation = Recursion made FAST.
          </div>
        </motion.div>
      </SectionBlock>

    </div>
  )
}
