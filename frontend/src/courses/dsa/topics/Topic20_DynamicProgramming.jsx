import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 20 — Dynamic Programming
   The hardest interview topic — broken down into visual, intuitive steps.
   Visual-first, interactive, NO text walls.
================================================================ */

/* ── helpers ─────────────────────────────────────────────── */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

/* ================================================================
   SECTION 1 — The Fibonacci Disaster
================================================================ */

// Build the recursive call tree for fib(n)
function buildFibTree(n, depth = 0, id = '0') {
  if (n <= 1) return { n, id, depth, children: [], calls: 1 }
  const left = buildFibTree(n - 1, depth + 1, id + 'L')
  const right = buildFibTree(n - 2, depth + 1, id + 'R')
  const calls = 1 + left.calls + right.calls
  return { n, id, depth, children: [left, right], calls }
}

function countDuplicates(tree, counts = {}) {
  counts[tree.n] = (counts[tree.n] || 0) + 1
  tree.children.forEach(c => countDuplicates(c, counts))
  return counts
}

function FibNode({ node, dupCounts, highlight }) {
  const isDup = dupCounts[node.n] > 1
  const isHighlighted = highlight === node.n
  const isLeaf = node.children.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: node.depth * 0.08, type: 'spring', stiffness: 260 }}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: isHighlighted
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : isDup
              ? 'linear-gradient(135deg, #f97316, #ea580c)'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 13,
          boxShadow: isHighlighted
            ? '0 0 16px #ef444488'
            : isDup ? '0 0 10px #f9731655' : '0 4px 12px #6366f133',
          border: isHighlighted ? '2px solid #ef4444' : isDup ? '2px solid #f97316' : '2px solid transparent',
          position: 'relative', zIndex: 2, cursor: 'default',
          flexShrink: 0,
        }}
        title={`fib(${node.n}), called ${dupCounts[node.n]} time(s)`}
      >
        {node.n}
        {isDup && !isLeaf && (
          <motion.div
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{
              position: 'absolute', top: -6, right: -6,
              width: 16, height: 16, borderRadius: '50%',
              background: '#ef4444', fontSize: 9, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, lineHeight: 1,
            }}
          >
            {dupCounts[node.n]}x
          </motion.div>
        )}
      </motion.div>

      {node.children.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 4, position: 'relative' }}>
          {/* vertical line down */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', width: 1,
            height: 16, background: '#6366f144', transform: 'translateX(-50%)',
          }} />
          {/* horizontal connector */}
          {node.children.length === 2 && (
            <div style={{
              position: 'absolute', top: 16, left: 22, right: 22,
              height: 1, background: '#6366f144',
            }} />
          )}
          {node.children.map(child => (
            <div key={child.id} style={{ marginTop: 16 }}>
              <FibNode node={child} dupCounts={dupCounts} highlight={highlight} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FibDisaster() {
  const [n, setN] = useState(6)
  const [highlight, setHighlight] = useState(null)
  const [showMemo, setShowMemo] = useState(false)
  const tree = buildFibTree(n)
  const dupCounts = countDuplicates(tree)

  const totalCalls = tree.calls
  const dupNums = Object.entries(dupCounts).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1])

  // Approximate calls for fib(40)
  const bigN = 40
  const approxCalls = Math.round(1.618 ** bigN / Math.sqrt(5))

  return (
    <div>
      <Neuron mood="thinking" message={
        `Without DP, computing fib(${n}) makes ${totalCalls} function calls. ` +
        `fib(2) is computed ${dupCounts[2] || 1} times. This is WASTEFUL!`
      } style={{ marginBottom: 28 }} />

      {/* n slider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        marginBottom: 24, padding: '14px 20px',
        background: 'var(--bg-secondary)', borderRadius: 14,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: 90 }}>
          fib({n}) tree
        </span>
        <input
          type="range" min={3} max={7} value={n}
          onChange={e => { setN(+e.target.value); setShowMemo(false) }}
          style={{ flex: 1, accentColor: '#6366f1' }}
        />
        <div style={{
          padding: '6px 14px', borderRadius: 10,
          background: '#ef444420', color: '#ef4444', fontWeight: 700, fontSize: 14,
        }}>
          {totalCalls} calls!
        </div>
      </div>

      {/* Duplicate highlight legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {dupNums.slice(0, 5).map(([num, count]) => (
          <motion.button
            key={num}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setHighlight(highlight === +num ? null : +num)}
            style={{
              padding: '6px 14px', borderRadius: 20,
              background: highlight === +num ? '#ef444420' : '#f9731615',
              border: `1.5px solid ${highlight === +num ? '#ef4444' : '#f97316'}`,
              color: highlight === +num ? '#ef4444' : '#f97316',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            fib({num}) called {count}x
          </motion.button>
        ))}
        {dupNums.length === 0 && (
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Try n &gt; 3 to see duplicates!
          </span>
        )}
      </div>

      {/* Tree visual */}
      <div style={{
        overflowX: 'auto', padding: '24px 16px',
        background: 'linear-gradient(135deg, #1e1b4b08, #312e8108)',
        borderRadius: 18, border: '1px solid #6366f115',
        display: 'flex', justifyContent: 'center',
      }}>
        <FibNode node={tree} dupCounts={dupCounts} highlight={highlight} />
      </div>

      {/* Big N warning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          margin: '20px 0', padding: '18px 24px',
          background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
          borderRadius: 16, border: '1.5px solid #fecaca',
        }}
      >
        <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 16, marginBottom: 6 }}>
          For fib(40): ~{approxCalls.toLocaleString()} calls!
        </div>
        <div style={{ color: '#b91c1c', fontSize: 14 }}>
          That's over 300 MILLION function calls — your laptop will choke!
        </div>
      </motion.div>

      {/* Memoization fix */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowMemo(m => !m)}
          style={{
            padding: '12px 28px', borderRadius: 24,
            background: showMemo
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', fontWeight: 700, fontSize: 15,
            border: 'none', cursor: 'pointer',
            boxShadow: showMemo ? '0 4px 20px #10b98144' : '0 4px 20px #6366f144',
          }}
        >
          {showMemo ? 'Hide Fix' : 'See the FIX: Memoization'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showMemo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '24px', borderRadius: 18,
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '2px solid #6ee7b7',
            }}>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: 17, marginBottom: 16 }}>
                With Memoization — only {n + 1} unique calls!
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                {Array.from({ length: n + 1 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08, type: 'spring' }}
                    style={{
                      padding: '8px 16px', borderRadius: 12,
                      background: 'white', border: '2px solid #6ee7b7',
                      color: '#065f46', fontWeight: 700, fontSize: 14,
                      boxShadow: '0 0 12px #10b98133',
                    }}
                  >
                    fib({i}) = {i <= 1 ? i : Array.from({ length: i + 1 }, (_, j) => j <= 1 ? j : null).reduce((acc, _, idx) => {
                      const memo = []
                      for (let k = 0; k <= i; k++) memo[k] = k <= 1 ? k : memo[k - 1] + memo[k - 2]
                      return memo[i]
                    }, 0) || (() => { const m = [0, 1]; for (let k = 2; k <= i; k++) m[k] = m[k-1] + m[k-2]; return m[i] })()}
                  </motion.div>
                ))}
              </div>
              <div style={{ color: '#047857', fontSize: 14, fontWeight: 600 }}>
                Each unique fib(k) computed exactly once. Duplicate branches = instant table lookup!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   SECTION 2 — The Staircase Problem
================================================================ */

function StaircaseDemo() {
  const [n, setN] = useState(4)
  const [filledCells, setFilledCells] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [selectedPath, setSelectedPath] = useState(null)

  // All paths for n=4
  const allPaths4 = [
    [1,1,1,1], [1,1,2], [1,2,1], [2,1,1], [2,2]
  ]

  // Build ways array
  const ways = [0, 1]
  for (let i = 2; i <= 8; i++) ways[i] = ways[i-1] + ways[i-2]

  const handleFill = async () => {
    setAnimating(true)
    setFilledCells(0)
    for (let i = 1; i <= n; i++) {
      await sleep(500)
      setFilledCells(i)
    }
    setAnimating(false)
  }

  const reset = () => {
    setFilledCells(0)
    setSelectedPath(null)
  }

  return (
    <div>
      <Neuron mood="explaining" message={
        `Stairs: ${n} steps. You can jump 1 or 2 steps at a time. ` +
        `How many different ways to reach the top? Answer: ${ways[n]} ways!`
      } style={{ marginBottom: 24 }} />

      {/* n slider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
        padding: '14px 20px', background: 'var(--bg-secondary)', borderRadius: 14,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: 60 }}>
          n = {n}
        </span>
        <input
          type="range" min={1} max={8} value={n}
          onChange={e => { setN(+e.target.value); reset() }}
          style={{ flex: 1, accentColor: '#6366f1' }}
        />
        <div style={{
          padding: '6px 14px', borderRadius: 10,
          background: '#6366f120', color: '#6366f1', fontWeight: 700, fontSize: 14,
        }}>
          {ways[n]} ways
        </div>
      </div>

      {/* Staircase visual */}
      <div style={{
        display: 'flex', flexDirection: 'column-reverse', gap: 3,
        alignItems: 'flex-start', marginBottom: 28,
        padding: '24px', background: 'var(--bg-secondary)', borderRadius: 18,
      }}>
        {Array.from({ length: n }, (_, i) => {
          const step = i + 1
          const isHighlighted = selectedPath && selectedPath.includes(step)
          return (
            <motion.div
              key={step}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.07 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              {/* Platform */}
              <motion.div
                animate={isHighlighted ? { scale: [1, 1.04, 1] } : {}}
                transition={{ repeat: isHighlighted ? Infinity : 0, duration: 0.8 }}
                style={{
                  width: 40 + step * 28, height: 36,
                  background: isHighlighted
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  borderRadius: '0 10px 10px 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 12, color: 'white', fontWeight: 700, fontSize: 15,
                  boxShadow: isHighlighted
                    ? '0 4px 16px #f59e0b66'
                    : '0 2px 8px #6366f133',
                }}
              >
                Step {step}
              </motion.div>
            </motion.div>
          )
        })}
        {/* Ground + person */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: '100%', height: 36,
          borderTop: '3px solid #6366f133',
          marginTop: 4, paddingTop: 6,
        }}>
          <span style={{ fontSize: 24 }}>🧍</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Start</span>
        </div>
      </div>

      {/* Path explorer for n=4 */}
      {n === 4 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            All {ways[4]} paths for n=4 — click to highlight:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allPaths4.map((path, pi) => {
              // Convert path to stair numbers
              const stairs = []
              let cur = 0
              for (const step of path) { cur += step; stairs.push(cur) }
              const isActive = selectedPath && JSON.stringify(selectedPath) === JSON.stringify(stairs)
              return (
                <motion.button
                  key={pi}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedPath(isActive ? null : stairs)}
                  style={{
                    padding: '8px 16px', borderRadius: 20,
                    background: isActive ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#f59e0b15',
                    border: `1.5px solid ${isActive ? '#f59e0b' : '#f59e0b55'}`,
                    color: isActive ? 'white' : '#92400e',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  {path.map(s => `+${s}`).join(' ')} = Step {n}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* DP Table */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            DP Table — fill step by step
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={reset}
              style={{
                padding: '8px 18px', borderRadius: 20,
                background: '#6b728015', border: '1.5px solid #6b728040',
                color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={handleFill} disabled={animating}
              style={{
                padding: '8px 18px', borderRadius: 20,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                border: 'none', opacity: animating ? 0.7 : 1,
              }}
            >
              {animating ? 'Filling...' : 'Auto Fill'}
            </motion.button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: n + 1 }, (_, i) => {
            const filled = filledCells >= i
            const isCurrent = filledCells === i && animating
            return (
              <motion.div
                key={i}
                onClick={() => !animating && setFilledCells(Math.max(filledCells, i))}
                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
                style={{
                  width: 68, padding: '14px 8px', borderRadius: 14,
                  background: filled
                    ? isCurrent
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'linear-gradient(135deg, #10b981, #059669)'
                    : 'var(--bg-secondary)',
                  border: `2px solid ${filled ? (isCurrent ? '#f59e0b' : '#10b981') : 'var(--border)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  cursor: 'pointer', transition: 'all 0.3s',
                  boxShadow: filled ? (isCurrent ? '0 0 18px #f59e0b88' : '0 0 12px #10b98155') : 'none',
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: filled ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)',
                }}>
                  ways[{i}]
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800,
                  color: filled ? 'white' : 'var(--text-secondary)',
                }}>
                  {filled ? (i === 0 ? 1 : ways[i]) : '?'}
                </div>
                {i >= 2 && filled && (
                  <div style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.7)',
                    textAlign: 'center', lineHeight: 1.3,
                  }}>
                    {ways[i-2]}+{ways[i-1]}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <NeuronTip type="tip">
        <strong>Pattern:</strong> ways[n] = ways[n-1] + ways[n-2]. To reach step n, you came from step n-1 (took 1 step) OR step n-2 (took 2 steps). This is Fibonacci in disguise!
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 3 — Top-Down vs Bottom-Up
================================================================ */

function TopDownVsBottomUp() {
  const [n, setN] = useState(5)
  const [memoStep, setMemoStep] = useState(-1)
  const [tabStep, setTabStep] = useState(-1)
  const [animating, setAnimating] = useState(false)

  const ways = [0, 1]
  for (let i = 2; i <= 10; i++) ways[i] = ways[i-1] + ways[i-2]

  // Top-down calls order: n, n-1, n-2, ... 1
  const topDownOrder = Array.from({ length: n }, (_, i) => n - i)
  // Bottom-up fills: 1, 2, ..., n
  const bottomUpOrder = Array.from({ length: n }, (_, i) => i + 1)

  const runBoth = async () => {
    setAnimating(true)
    setMemoStep(-1)
    setTabStep(-1)
    for (let i = 0; i < n; i++) {
      await sleep(400)
      setMemoStep(i)
      await sleep(200)
      setTabStep(i)
    }
    setAnimating(false)
  }

  const reset = () => { setMemoStep(-1); setTabStep(-1) }

  return (
    <div>
      <Neuron mood="explaining" message="Both approaches give the same answer. Top-Down recurses from n down, caching as it goes. Bottom-Up builds from 1 up, no recursion needed!" style={{ marginBottom: 24 }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
        padding: '14px 20px', background: 'var(--bg-secondary)', borderRadius: 14,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: 50 }}>n = {n}</span>
        <input type="range" min={3} max={8} value={n}
          onChange={e => { setN(+e.target.value); reset() }}
          style={{ flex: 1, accentColor: '#6366f1' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Top-Down */}
        <div style={{
          padding: '20px', borderRadius: 18,
          background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          border: '2px solid #c4b5fd',
        }}>
          <div style={{ fontWeight: 700, color: '#5b21b6', fontSize: 16, marginBottom: 4 }}>
            Top-Down (Memoization)
          </div>
          <div style={{ color: '#7c3aed', fontSize: 13, marginBottom: 16 }}>
            Start at n={n}, recurse DOWN, cache results
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {topDownOrder.map((val, idx) => {
              const isCached = idx > 0 && memoStep >= idx
              const isCurrent = memoStep === idx
              const isFuture = memoStep < idx
              return (
                <motion.div
                  key={val}
                  animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
                  style={{
                    padding: '8px 14px', borderRadius: 10,
                    background: isFuture ? 'rgba(255,255,255,0.4)' : isCurrent ? '#7c3aed' : '#10b981',
                    color: isFuture ? '#7c3aed88' : 'white',
                    fontWeight: 700, fontSize: 13,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.3s',
                  }}
                >
                  <span>call fib({val})</span>
                  {isCached && <span style={{ fontSize: 11 }}>cache</span>}
                  {isCurrent && <span style={{ fontSize: 11 }}>computing...</span>}
                </motion.div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, padding: '10px', borderRadius: 10, background: 'white', border: '1px solid #c4b5fd' }}>
            <div style={{ fontWeight: 700, color: '#5b21b6', fontSize: 12, marginBottom: 6 }}>Cache table:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {topDownOrder.map((val, idx) => (
                <div key={val} style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11,
                  background: memoStep >= idx ? '#7c3aed20' : '#f3f4f6',
                  border: `1px solid ${memoStep >= idx ? '#c4b5fd' : '#e5e7eb'}`,
                  color: memoStep >= idx ? '#5b21b6' : '#9ca3af',
                  fontWeight: 600,
                }}>
                  {val}:{memoStep >= idx ? ways[val] : '?'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom-Up */}
        <div style={{
          padding: '20px', borderRadius: 18,
          background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          border: '2px solid #6ee7b7',
        }}>
          <div style={{ fontWeight: 700, color: '#065f46', fontSize: 16, marginBottom: 4 }}>
            Bottom-Up (Tabulation)
          </div>
          <div style={{ color: '#047857', fontSize: 13, marginBottom: 16 }}>
            Start at 1, build UP to n={n}. No recursion!
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bottomUpOrder.map((val, idx) => {
              const isDone = tabStep >= idx
              const isCurrent = tabStep === idx
              const isFuture = tabStep < idx
              return (
                <motion.div
                  key={val}
                  animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
                  style={{
                    padding: '8px 14px', borderRadius: 10,
                    background: isFuture ? 'rgba(255,255,255,0.4)' : isCurrent ? '#059669' : '#10b981',
                    color: isFuture ? '#10b98188' : 'white',
                    fontWeight: 700, fontSize: 13,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.3s',
                  }}
                >
                  <span>table[{val}] = {isDone ? ways[val] : '?'}</span>
                  {isCurrent && <span style={{ fontSize: 11 }}>filling...</span>}
                  {isDone && !isCurrent && <span style={{ fontSize: 11 }}>done</span>}
                </motion.div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, padding: '10px', borderRadius: 10, background: 'white', border: '1px solid #6ee7b7' }}>
            <div style={{ fontWeight: 700, color: '#065f46', fontSize: 12, marginBottom: 6 }}>Table fills left to right:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {bottomUpOrder.map((val, idx) => (
                <div key={val} style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11,
                  background: tabStep >= idx ? '#10b98120' : '#f3f4f6',
                  border: `1px solid ${tabStep >= idx ? '#6ee7b7' : '#e5e7eb'}`,
                  color: tabStep >= idx ? '#065f46' : '#9ca3af',
                  fontWeight: 600,
                }}>
                  [{val}]={tabStep >= idx ? ways[val] : '?'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center' }}>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={reset}
          style={{
            padding: '10px 24px', borderRadius: 24,
            background: '#6b728015', border: '1.5px solid #6b728040',
            color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Reset
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={runBoth} disabled={animating}
          style={{
            padding: '10px 24px', borderRadius: 24,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', fontWeight: 700, cursor: 'pointer',
            border: 'none', opacity: animating ? 0.7 : 1,
          }}
        >
          {animating ? 'Running...' : 'Run Both Side by Side'}
        </motion.button>
      </div>

      <NeuronTip type="tip">
        <strong>Bottom-Up is usually faster</strong> — no recursion overhead, no stack frames, and better cache locality in memory. Both are O(n) time and O(n) space.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 4 — Knapsack Problem
================================================================ */

const ITEMS = [
  { name: 'Laptop', weight: 3, value: 4000, emoji: '💻' },
  { name: 'Camera', weight: 4, value: 3000, emoji: '📷' },
  { name: 'Phone',  weight: 2, value: 3000, emoji: '📱' },
  { name: 'Watch',  weight: 1, value: 2000, emoji: '⌚' },
]
const CAPACITY = 10

function buildKnapsackTable(items, cap) {
  const n = items.length
  const dp = Array.from({ length: n + 1 }, () => Array(cap + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1]
    for (let w = 0; w <= cap; w++) {
      dp[i][w] = dp[i-1][w]
      if (weight <= w) dp[i][w] = Math.max(dp[i][w], dp[i-1][w-weight] + value)
    }
  }
  return dp
}

function getKnapsackItems(items, dp, cap) {
  let w = cap
  const selected = []
  for (let i = items.length; i > 0; i--) {
    if (dp[i][w] !== dp[i-1][w]) {
      selected.push(i - 1)
      w -= items[i - 1].weight
    }
  }
  return selected
}

function KnapsackDemo() {
  const [inBag, setInBag] = useState([])
  const [revealTable, setRevealTable] = useState(false)
  const [tableRevealStep, setTableRevealStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  const dp = buildKnapsackTable(ITEMS, CAPACITY)
  const optimalIdxs = getKnapsackItems(ITEMS, dp, CAPACITY)
  const optimalValue = dp[ITEMS.length][CAPACITY]

  const bagWeight = inBag.reduce((s, i) => s + ITEMS[i].weight, 0)
  const bagValue  = inBag.reduce((s, i) => s + ITEMS[i].value,  0)
  const overWeight = bagWeight > CAPACITY

  const toggleItem = (idx) => {
    setInBag(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const fillTable = async () => {
    setAnimating(true)
    setTableRevealStep(0)
    for (let i = 0; i <= ITEMS.length; i++) {
      await sleep(350)
      setTableRevealStep(i)
    }
    setAnimating(false)
  }

  return (
    <div>
      <Neuron mood="excited" message={`A thief's backpack holds ${CAPACITY}kg. 4 items available. Which combination gives maximum value? Try selecting items, then let DP find the OPTIMAL answer!`} style={{ marginBottom: 24 }} />

      {/* Item picker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {ITEMS.map((item, idx) => {
          const selected = inBag.includes(idx)
          const isOptimal = optimalIdxs.includes(idx)
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleItem(idx)}
              style={{
                padding: '16px 12px', borderRadius: 16, textAlign: 'center',
                cursor: 'pointer',
                background: selected
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : 'var(--bg-secondary)',
                border: `2px solid ${selected ? '#6366f1' : 'var(--border)'}`,
                boxShadow: selected ? '0 4px 16px #6366f155' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
              <div style={{ fontWeight: 700, color: selected ? 'white' : 'var(--text-primary)', fontSize: 13 }}>
                {item.name}
              </div>
              <div style={{ fontSize: 12, color: selected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', marginTop: 4 }}>
                {item.weight}kg · ₹{item.value.toLocaleString()}
              </div>
              {revealTable && isOptimal && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    marginTop: 6, padding: '2px 6px', borderRadius: 8,
                    background: '#fef08a', color: '#854d0e',
                    fontSize: 10, fontWeight: 700,
                  }}
                >
                  Optimal!
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Bag status */}
      <motion.div
        animate={overWeight ? { x: [-4, 4, -4, 0] } : {}}
        style={{
          padding: '16px 20px', borderRadius: 16, marginBottom: 20,
          background: overWeight
            ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
            : 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          border: `2px solid ${overWeight ? '#fecaca' : '#6ee7b7'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 28 }}>🎒</span>
          <div>
            <div style={{ fontWeight: 700, color: overWeight ? '#991b1b' : '#065f46', fontSize: 15 }}>
              {overWeight ? 'TOO HEAVY!' : inBag.length === 0 ? 'Empty bag' : 'Looking good!'}
            </div>
            <div style={{ fontSize: 13, color: overWeight ? '#b91c1c' : '#047857' }}>
              Weight: {bagWeight}/{CAPACITY}kg · Value: ₹{bagValue.toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{
          padding: '8px 16px', borderRadius: 12,
          background: overWeight ? '#fecaca' : '#a7f3d0',
          fontWeight: 800, fontSize: 18,
          color: overWeight ? '#dc2626' : '#059669',
        }}>
          {overWeight ? 'Over!' : `${CAPACITY - bagWeight}kg free`}
        </div>
      </motion.div>

      {/* DP Table reveal */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            DP Table (items × capacity) — Optimal = ₹{optimalValue.toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setRevealTable(false); setTableRevealStep(0) }}
              style={{
                padding: '8px 16px', borderRadius: 20,
                background: '#6b728015', border: '1.5px solid #6b728040',
                color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              Hide
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setRevealTable(true); fillTable() }}
              disabled={animating}
              style={{
                padding: '8px 16px', borderRadius: 20,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                border: 'none', opacity: animating ? 0.7 : 1,
              }}
            >
              {animating ? 'Filling...' : 'Show DP Table'}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {revealTable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'auto' }}
            >
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>Item</th>
                    {Array.from({ length: CAPACITY + 1 }, (_, w) => (
                      <th key={w} style={{ padding: '6px 8px', background: '#f3f4f6', border: '1px solid #e5e7eb', minWidth: 28 }}>
                        {w}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: ITEMS.length + 1 }, (_, i) => (
                    <tr key={i}>
                      <td style={{
                        padding: '8px', border: '1px solid #e5e7eb',
                        fontWeight: 700, background: '#fafafa',
                        color: 'var(--text-primary)', fontSize: 12,
                      }}>
                        {i === 0 ? 'none' : `${ITEMS[i-1].emoji} ${ITEMS[i-1].name}`}
                      </td>
                      {Array.from({ length: CAPACITY + 1 }, (_, w) => {
                        const val = dp[i][w]
                        const isOpt = i === ITEMS.length && w === CAPACITY
                        const revealed = tableRevealStep >= i
                        return (
                          <td key={w} style={{
                            padding: '6px', border: '1px solid #e5e7eb',
                            textAlign: 'center', fontWeight: isOpt ? 800 : 400,
                            background: isOpt && revealed
                              ? '#fef08a'
                              : revealed
                                ? val > 0 ? '#ecfdf5' : '#fafafa'
                                : '#f3f4f6',
                            color: isOpt && revealed ? '#854d0e' : revealed ? (val > 0 ? '#065f46' : '#9ca3af') : '#d1d5db',
                            transition: 'all 0.3s',
                            minWidth: 28,
                          }}>
                            {revealed ? val : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {revealTable && tableRevealStep >= ITEMS.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px', borderRadius: 16,
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '2px solid #f59e0b',
          }}
        >
          <div style={{ fontWeight: 700, color: '#92400e', fontSize: 15, marginBottom: 6 }}>
            Optimal selection: {optimalIdxs.map(i => `${ITEMS[i].emoji} ${ITEMS[i].name}`).join(' + ')}
          </div>
          <div style={{ color: '#b45309', fontSize: 14 }}>
            Total weight: {optimalIdxs.reduce((s, i) => s + ITEMS[i].weight, 0)}kg ·
            Total value: ₹{optimalValue.toLocaleString()}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ================================================================
   SECTION 5 — Coin Change: Where Greedy Fails
================================================================ */

const COINS = [1, 5, 6]

function buildCoinDP(amount, coins) {
  const dp = Array(amount + 1).fill(Infinity)
  const from = Array(amount + 1).fill(-1)
  dp[0] = 0
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (c <= i && dp[i - c] + 1 < dp[i]) {
        dp[i] = dp[i - c] + 1
        from[i] = c
      }
    }
  }
  return { dp, from }
}

function getCoinsUsed(amount, from) {
  const used = []
  let cur = amount
  while (cur > 0 && from[cur] !== -1) {
    used.push(from[cur])
    cur -= from[cur]
  }
  return used
}

function greedyCoins(amount, coins) {
  const sorted = [...coins].sort((a, b) => b - a)
  const used = []
  let rem = amount
  for (const c of sorted) {
    while (rem >= c) { used.push(c); rem -= c }
  }
  return rem === 0 ? used : null
}

function CoinChangeDemo() {
  const [amount, setAmount] = useState(11)
  const [showDP, setShowDP] = useState(false)
  const [dpReveal, setDpReveal] = useState(0)
  const [animating, setAnimating] = useState(false)

  const { dp, from } = buildCoinDP(amount, COINS)
  const dpCoins = getCoinsUsed(amount, from)
  const greedyResult = greedyCoins(amount, COINS)
  const dpOptimal = dp[amount]
  const greedyOptimal = greedyResult ? greedyResult.length : Infinity
  const greedyFails = greedyOptimal > dpOptimal

  const fillDP = async () => {
    setAnimating(true)
    setDpReveal(0)
    for (let i = 0; i <= amount; i++) {
      await sleep(120)
      setDpReveal(i)
    }
    setAnimating(false)
  }

  return (
    <div>
      <Neuron mood="thinking" message={`Make ₹${amount} using coins [₹1, ₹5, ₹6]. Minimum coins? Greedy picks biggest coin first — but it's NOT always optimal!`} style={{ marginBottom: 24 }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
        padding: '14px 20px', background: 'var(--bg-secondary)', borderRadius: 14,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: 60 }}>₹{amount}</span>
        <input type="range" min={1} max={15} value={amount}
          onChange={e => { setAmount(+e.target.value); setShowDP(false); setDpReveal(0) }}
          style={{ flex: 1, accentColor: '#6366f1' }}
        />
      </div>

      {/* Side by side comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Greedy */}
        <div style={{
          padding: '20px', borderRadius: 18,
          background: greedyFails
            ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
            : 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          border: `2px solid ${greedyFails ? '#fecaca' : '#6ee7b7'}`,
        }}>
          <div style={{ fontWeight: 700, color: greedyFails ? '#991b1b' : '#065f46', fontSize: 16, marginBottom: 4 }}>
            Greedy (Largest First) {greedyFails ? 'FAILS' : 'Works!'}
          </div>
          <div style={{ color: greedyFails ? '#b91c1c' : '#047857', fontSize: 13, marginBottom: 16 }}>
            Pick biggest coin that fits, repeat
          </div>
          {greedyResult ? (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {greedyResult.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: greedyFails ? '#ef4444' : '#10b981',
                      color: 'white', fontWeight: 700, fontSize: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: greedyFails ? '0 2px 8px #ef444466' : '0 2px 8px #10b98166',
                    }}
                  >
                    ₹{c}
                  </motion.div>
                ))}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: greedyFails ? '#991b1b' : '#065f46' }}>
                {greedyResult.length} coins
                {greedyFails && <span style={{ fontSize: 12, display: 'block', fontWeight: 400 }}>Not optimal!</span>}
              </div>
            </div>
          ) : (
            <div style={{ color: '#991b1b' }}>Cannot make this amount with greedy!</div>
          )}
        </div>

        {/* DP */}
        <div style={{
          padding: '20px', borderRadius: 18,
          background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          border: '2px solid #c4b5fd',
        }}>
          <div style={{ fontWeight: 700, color: '#5b21b6', fontSize: 16, marginBottom: 4 }}>
            DP — Always Optimal!
          </div>
          <div style={{ color: '#7c3aed', fontSize: 13, marginBottom: 16 }}>
            dp[i] = min coins to make ₹i
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {dpCoins.map((c, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: 'white', fontWeight: 700, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px #7c3aed66',
                }}
              >
                ₹{c}
              </motion.div>
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#5b21b6' }}>
            {dpOptimal} coin{dpOptimal !== 1 ? 's' : ''} (optimal!)
          </div>
        </div>
      </div>

      {/* DP Table */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            DP Table: dp[i] = min coins for ₹i
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setShowDP(true); fillDP() }} disabled={animating}
            style={{
              padding: '8px 18px', borderRadius: 20,
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              border: 'none', opacity: animating ? 0.7 : 1,
            }}
          >
            {animating ? 'Filling...' : showDP ? 'Reset Table' : 'Fill DP Table'}
          </motion.button>
        </div>

        <AnimatePresence>
          {showDP && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ overflowX: 'auto' }}
            >
              <div style={{ display: 'flex', gap: 6, minWidth: 'max-content', padding: '4px 0' }}>
                {Array.from({ length: amount + 1 }, (_, i) => {
                  const val = dp[i]
                  const isTarget = i === amount
                  const revealed = dpReveal >= i
                  return (
                    <motion.div
                      key={i}
                      animate={isTarget && revealed ? { scale: [1, 1.15, 1] } : {}}
                      style={{
                        width: 52, padding: '10px 6px', borderRadius: 12,
                        background: isTarget && revealed
                          ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                          : revealed && val !== Infinity
                            ? 'linear-gradient(135deg, #a855f720, #818cf820)'
                            : 'var(--bg-secondary)',
                        border: `2px solid ${isTarget && revealed ? '#7c3aed' : revealed ? '#c4b5fd55' : 'var(--border)'}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'all 0.3s',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ fontSize: 10, color: isTarget && revealed ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)', fontWeight: 600 }}>
                        ₹{i}
                      </div>
                      <div style={{
                        fontSize: 18, fontWeight: 800,
                        color: isTarget && revealed ? 'white' : revealed ? '#7c3aed' : 'var(--text-secondary)',
                      }}>
                        {revealed ? (val === Infinity ? '∞' : val) : '-'}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {greedyFails && (
        <NeuronTip type="warning">
          <strong>Greedy fails here!</strong> For ₹{amount}, greedy uses {greedyOptimal} coins but DP uses only {dpOptimal}. This is why greedy is not always optimal — DP finds the TRUE best answer!
        </NeuronTip>
      )}
      {!greedyFails && (
        <NeuronTip type="tip">
          <strong>Try ₹12 or ₹11:</strong> Greedy gives ₹6+₹5=2 coins for ₹11. But for ₹12, greedy gives ₹6+₹5+₹1=3 coins while DP finds ₹6+₹6=2 coins!
        </NeuronTip>
      )}
    </div>
  )
}

/* ================================================================
   SECTION 6 — DP Pattern Recognition
================================================================ */

const DP_CHECKLIST_PROBLEMS = [
  {
    title: 'Minimum cost path in a grid',
    desc: 'Find path from top-left to bottom-right with minimum sum',
    isDP: true,
    optSub: true,
    overlapSub: true,
    reason: 'Optimal path uses optimal sub-paths. Cell (i,j) is computed many times in naive recursion.',
  },
  {
    title: 'Find maximum element in array',
    desc: 'Scan array, track running maximum',
    isDP: false,
    optSub: true,
    overlapSub: false,
    reason: 'Each element is visited once. No overlapping subproblems — just a single linear scan.',
  },
  {
    title: 'Longest Common Subsequence',
    desc: 'Find longest sequence common to two strings',
    isDP: true,
    optSub: true,
    overlapSub: true,
    reason: 'LCS(i,j) depends on LCS(i-1,j-1), LCS(i-1,j), LCS(i,j-1) — massive overlap in recursion tree.',
  },
  {
    title: 'Sort an array',
    desc: 'Rearrange elements in ascending order',
    isDP: false,
    optSub: false,
    overlapSub: false,
    reason: "Sorting is a structural transformation, not an optimization problem. No subproblem overlap.",
  },
]

function DPPatternDemo() {
  const [selected, setSelected] = useState(null)
  const [userGuess, setUserGuess] = useState({})

  const prob = selected !== null ? DP_CHECKLIST_PROBLEMS[selected] : null

  return (
    <div>
      <Neuron mood="explaining" message="Two conditions make a problem DP-ready: (1) Optimal Substructure — optimal solution uses optimal sub-solutions. (2) Overlapping Subproblems — same subproblems solved again and again." style={{ marginBottom: 24 }} />

      {/* Checklist legend */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
      }}>
        <div style={{
          padding: '16px', borderRadius: 16,
          background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          border: '2px solid #6ee7b7',
        }}>
          <div style={{ fontWeight: 700, color: '#065f46', fontSize: 14, marginBottom: 6 }}>
            Optimal Substructure
          </div>
          <div style={{ color: '#047857', fontSize: 13 }}>
            The optimal answer to the big problem is built from optimal answers to smaller sub-problems.
          </div>
        </div>
        <div style={{
          padding: '16px', borderRadius: 16,
          background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          border: '2px solid #c4b5fd',
        }}>
          <div style={{ fontWeight: 700, color: '#5b21b6', fontSize: 14, marginBottom: 6 }}>
            Overlapping Subproblems
          </div>
          <div style={{ color: '#7c3aed', fontSize: 13 }}>
            The same sub-problem is solved multiple times in a naive recursive approach. DP caches to avoid re-work.
          </div>
        </div>
      </div>

      {/* Problem cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {DP_CHECKLIST_PROBLEMS.map((prob, idx) => {
          const guess = userGuess[idx]
          const revealed = guess !== undefined
          const correct = guess === prob.isDP
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelected(idx)}
              style={{
                padding: '18px', borderRadius: 18,
                background: selected === idx ? '#f0f9ff' : 'var(--bg-secondary)',
                border: `2px solid ${selected === idx ? '#38bdf8' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, marginBottom: 6 }}>
                {prob.title}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                {prob.desc}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={e => { e.stopPropagation(); setUserGuess(g => ({ ...g, [idx]: true })) }}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 10,
                    background: guess === true
                      ? prob.isDP ? '#10b981' : '#ef4444'
                      : '#10b98115',
                    border: `1.5px solid ${guess === true ? (prob.isDP ? '#10b981' : '#ef4444') : '#10b98140'}`,
                    color: guess === true ? 'white' : '#10b981',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  DP
                </motion.button>
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={e => { e.stopPropagation(); setUserGuess(g => ({ ...g, [idx]: false })) }}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 10,
                    background: guess === false
                      ? !prob.isDP ? '#10b981' : '#ef4444'
                      : '#ef444415',
                    border: `1.5px solid ${guess === false ? (!prob.isDP ? '#10b981' : '#ef4444') : '#ef444440'}`,
                    color: guess === false ? 'white' : '#ef4444',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Not DP
                </motion.button>
              </div>

              {revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    marginTop: 10, padding: '8px 12px', borderRadius: 10,
                    background: correct ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${correct ? '#6ee7b7' : '#fecaca'}`,
                    color: correct ? '#065f46' : '#991b1b',
                    fontSize: 12,
                  }}
                >
                  {correct ? 'Correct! ' : 'Not quite. '}
                  {prob.reason}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Checklist for selected */}
      <AnimatePresence>
        {prob && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              padding: '20px', borderRadius: 18,
              background: 'linear-gradient(135deg, #fff7ed, #fff3e0)',
              border: '2px solid #fed7aa',
            }}
          >
            <div style={{ fontWeight: 700, color: '#9a3412', fontSize: 15, marginBottom: 14 }}>
              Analysis: "{prob.title}"
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{prob.optSub ? '' : ''}</span>
                <div>
                  <span style={{ fontWeight: 700, color: prob.optSub ? '#065f46' : '#991b1b' }}>
                    {prob.optSub ? 'Has' : 'No'} Optimal Substructure
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{prob.overlapSub ? '' : ''}</span>
                <div>
                  <span style={{ fontWeight: 700, color: prob.overlapSub ? '#065f46' : '#991b1b' }}>
                    {prob.overlapSub ? 'Has' : 'No'} Overlapping Subproblems
                  </span>
                </div>
              </div>
              <div style={{
                marginTop: 6, padding: '10px 14px', borderRadius: 12,
                background: prob.isDP ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${prob.isDP ? '#6ee7b7' : '#fecaca'}`,
                color: prob.isDP ? '#065f46' : '#991b1b', fontWeight: 600, fontSize: 13,
              }}>
                Verdict: {prob.isDP ? 'USE DP!' : 'DP NOT needed here.'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */

function HindiSummary() {
  return (
    <div>
      <Neuron mood="waving" message="DP ke baare mein Hindi mein samajhte hain — yeh concept bahut simple hai ek baar pattern samajh aa jaye!" style={{ marginBottom: 20 }} />
      <HindiExplainer
        concept="Dynamic Programming (DP)"
        english="Remember computed results to avoid redundant work"
        explanation="DP ka matlab hai: ek baar kuch calculate karo, usse yaad rakho, aur baar baar dobara mat karo! Jaise exam mein ek baar formula yaad karo — phir har sawaal mein wohi formula use karo, baar baar derive mat karo. Yahi DP ka jadoo hai!"
        example="Fibonacci(10) = Fibonacci(9) + Fibonacci(8). Agar hum Fibonacci(9) aur Fibonacci(8) ke answers yaad rakhe, toh Fibonacci(10) turant mil jata hai. Bina DP ke: 177 calls. DP ke saath: sirf 11 unique calls!"
        terms={[
          { hindi: 'गतिशील प्रोग्रामिंग', english: 'Dynamic Programming', desc: 'subproblems ko solve karke bade problem ka solution nikalna' },
          { hindi: 'याद रखना', english: 'Memoization', desc: 'computed results ko cache mein store karna' },
          { hindi: 'तालिका भरना', english: 'Tabulation', desc: 'bottom-up se table fill karna' },
          { hindi: 'सर्वश्रेष्ठ', english: 'Optimal', desc: 'sabse best / minimum / maximum solution' },
          { hindi: 'उप-समस्या', english: 'Subproblem', desc: 'bade problem ka chota hissa jo baar baar aata hai' },
        ]}
      />
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */

export default function Topic20Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 64px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '40px 40px 32px',
          background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)',
          borderRadius: 28, marginBottom: 36, color: 'white', position: 'relative', overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.65, letterSpacing: 2, marginBottom: 10 }}>
          TOPIC 20 · THINK LIKE A PROGRAMMER
        </div>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 38, fontWeight: 900,
          margin: '0 0 12px', lineHeight: 1.15,
        }}>
          Dynamic Programming
        </h1>
        <p style={{ fontSize: 17, opacity: 0.85, maxWidth: 540, lineHeight: 1.65, margin: 0 }}>
          The #1 hardest interview topic — finally demystified. Remember computed results, eliminate redundant work, solve the unsolvable.
        </p>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'fib(40) without DP', val: '300M+ calls', color: '#f87171' },
            { label: 'fib(40) with DP', val: '41 calls', color: '#4ade80' },
            { label: 'Time complexity', val: 'O(n) vs O(2ⁿ)', color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 1: Fibonacci Disaster */}
      <SectionBlock icon="💥" title="The Fibonacci Disaster" color="#ef4444">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, marginBottom: 24 }}>
          Naive recursion recomputes the same values over and over. Watch the tree explode — then see memoization fix it instantly.
        </p>
        <InteractiveDemo title="Fibonacci Call Tree" instruction="Drag the slider to grow the tree. Click duplicate badges to highlight them. Spot the wasteful repetition!">
          <FibDisaster />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 2: Staircase */}
      <SectionBlock icon="🪜" title="The Staircase Problem" color="#f59e0b">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, marginBottom: 24 }}>
          You can take 1 or 2 steps at a time. How many ways to climb n stairs? This classic DP problem shows how a recurrence relation fills a table.
        </p>
        <InteractiveDemo title="Staircase Explorer" instruction="Adjust n, explore all paths for n=4, then click 'Auto Fill' to watch the DP table fill step by step!">
          <StaircaseDemo />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 3: Top-Down vs Bottom-Up */}
      <SectionBlock icon="↕️" title="Top-Down vs Bottom-Up" color="#6366f1">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, marginBottom: 24 }}>
          Two ways to implement DP. Top-Down recurses from n and caches. Bottom-Up builds from 1. Same result — different journey.
        </p>
        <InteractiveDemo title="Side-by-Side Comparison" instruction="Click 'Run Both' to see them work simultaneously. Watch how Top-Down descends and Bottom-Up ascends!">
          <TopDownVsBottomUp />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 4: Knapsack */}
      <SectionBlock icon="🎒" title="The Knapsack Problem" color="#10b981">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, marginBottom: 24 }}>
          A thief has a {CAPACITY}kg backpack. 4 items. Which combination maximizes value? Try your intuition first — then let DP reveal the truth.
        </p>
        <NeuronTip type="example">
          <strong>Real-world applications:</strong> Portfolio optimization, resource allocation, cargo loading, budget planning — all are variants of the Knapsack problem!
        </NeuronTip>
        <InteractiveDemo title="Knapsack Optimizer" instruction="Click items to add them to the bag. Then reveal the DP table to see the truly optimal solution!">
          <KnapsackDemo />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 5: Coin Change */}
      <SectionBlock icon="🪙" title="Coin Change: Where Greedy Fails" color="#7c3aed">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, marginBottom: 24 }}>
          Coins: [₹1, ₹5, ₹6]. Greedy always picks the largest coin first — but it's not always optimal. DP finds the true minimum every time.
        </p>
        <InteractiveDemo title="Greedy vs DP Showdown" instruction="Try ₹12 to see greedy fail! Move the slider and watch the DP table fill to prove DP's superiority.">
          <CoinChangeDemo />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 6: Pattern Recognition */}
      <SectionBlock icon="🔍" title="DP Pattern Recognition" color="#f59e0b">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, marginBottom: 24 }}>
          Not every problem needs DP. Two criteria must hold. Can you identify which problems qualify? Test your instincts below!
        </p>
        <InteractiveDemo title="Does This Need DP?" instruction="For each problem, vote 'DP' or 'Not DP'. Then click the card to see the expert analysis!">
          <DPPatternDemo />
        </InteractiveDemo>
        <NeuronTip type="deep">
          <strong>The DP interview checklist:</strong> (1) Can I break this into smaller sub-problems? (2) Do sub-problems repeat? (3) Can I define a recurrence relation? (4) What's my base case? If yes to all — it's DP!
        </NeuronTip>
      </SectionBlock>

      {/* Section 7: Hindi Summary */}
      <SectionBlock icon="हिं" title="Hindi Mein Samjho" color="#ff9933">
        <HindiSummary />
      </SectionBlock>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          padding: '28px 32px', borderRadius: 22,
          background: 'linear-gradient(135deg, #1e1b4b08, #312e8108)',
          border: '1px solid #6366f115',
          textAlign: 'center', color: 'var(--text-secondary)',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 10 }}>🏆</div>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 18, marginBottom: 6 }}>
          You've cracked Dynamic Programming!
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
          Fibonacci, Staircase, Knapsack, Coin Change — all solved with the same insight: <em>remember what you've already computed</em>. That's the entire secret of DP.
        </div>
      </motion.div>

    </div>
  )
}
