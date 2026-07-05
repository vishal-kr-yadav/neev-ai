import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 16 — Heaps & Priority Queues
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
  lime:   '#84cc16',
}

/* ---- Heap helpers ---- */
function parentIdx(i)    { return Math.floor((i - 1) / 2) }
function leftChild(i)    { return 2 * i + 1 }
function rightChild(i)   { return 2 * i + 2 }

function insertMinHeap(heap, val) {
  const h = [...heap, val]
  let i = h.length - 1
  const steps = [{ heap: [...h], highlight: [i], action: `Added ${val} at index ${i}` }]
  while (i > 0 && h[parentIdx(i)] > h[i]) {
    const p = parentIdx(i)
    ;[h[i], h[p]] = [h[p], h[i]]
    steps.push({ heap: [...h], highlight: [i, p], action: `Bubble up: swapped ${h[p]} ↔ ${h[i]} (indices ${i}↔${p})` })
    i = p
  }
  steps.push({ heap: [...h], highlight: [], action: 'Heap property restored!' })
  return { heap: h, steps }
}

function extractMinHeap(heap) {
  if (heap.length === 0) return { heap: [], steps: [] }
  const h = [...heap]
  const min = h[0]
  const last = h.pop()
  const steps = [{ heap: [...h], highlight: [0], action: `Removed min (${min}), moving last element ${last} to root` }]
  if (h.length === 0) {
    steps.push({ heap: [], highlight: [], action: 'Heap is empty' })
    return { heap: [], steps }
  }
  h[0] = last
  steps.push({ heap: [...h], highlight: [0], action: `${last} placed at root, sinking down...` })
  let i = 0
  while (true) {
    const l = leftChild(i), r = rightChild(i)
    let smallest = i
    if (l < h.length && h[l] < h[smallest]) smallest = l
    if (r < h.length && h[r] < h[smallest]) smallest = r
    if (smallest === i) break
    ;[h[i], h[smallest]] = [h[smallest], h[i]]
    steps.push({ heap: [...h], highlight: [i, smallest], action: `Sink down: swapped ${h[smallest]} ↔ ${h[i]}` })
    i = smallest
  }
  steps.push({ heap: [...h], highlight: [], action: 'Heap property restored!' })
  return { heap: h, steps }
}

function insertMaxHeap(heap, val) {
  const h = [...heap, val]
  let i = h.length - 1
  while (i > 0 && h[parentIdx(i)] < h[i]) {
    const p = parentIdx(i)
    ;[h[i], h[p]] = [h[p], h[i]]
    i = p
  }
  return h
}

/* ---- Tree layout helpers ---- */
function getTreePositions(size) {
  const positions = []
  for (let i = 0; i < size; i++) {
    const level = Math.floor(Math.log2(i + 1))
    const levelStart = Math.pow(2, level) - 1
    const levelEnd   = Math.pow(2, level + 1) - 2
    const levelCount = levelEnd - levelStart + 1
    const posInLevel = i - levelStart
    const x = ((posInLevel + 0.5) / levelCount) * 100
    const y = level * 22 + 10
    positions.push({ x, y, level })
  }
  return positions
}

/* ---- Tree Node component ---- */
function TreeNode({ x, y, value, highlight, isRoot, color = C.indigo, size = 36 }) {
  const bg = highlight === 'swap'
    ? C.orange
    : highlight === 'new'
    ? C.green
    : highlight === 'violation'
    ? C.red
    : highlight === 'selected'
    ? C.cyan
    : isRoot
    ? color
    : 'var(--bg-card)'

  const textColor = (highlight || isRoot) ? '#fff' : 'var(--text-primary)'
  const borderColor = highlight ? bg : `${color}55`

  return (
    <motion.g>
      <motion.circle
        cx={`${x}%`} cy={y} r={size / 2}
        fill={bg}
        stroke={borderColor}
        strokeWidth={2}
        animate={{ scale: highlight ? [1, 1.25, 1] : 1 }}
        transition={{ duration: 0.4 }}
      />
      <text
        x={`${x}%`} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={13}
        fontWeight={700}
        fontFamily="monospace"
      >
        {value}
      </text>
    </motion.g>
  )
}

/* ================================================================
   SECTION 1 — Hospital ER Problem
================================================================ */
const SEVERITY_COLORS = ['', C.green, C.lime, C.yellow, C.orange, C.red]
const SEVERITY_LABELS = ['', 'Minor', 'Mild', 'Moderate', 'Serious', 'Critical']

function ERDemo() {
  const [patients, setPatients] = useState([])
  const [served, setServed] = useState([])
  const [mode, setMode] = useState('priority') // 'fifo' | 'priority'
  const [nextId, setNextId] = useState(1)

  const NAMES = ['Alice', 'Bob', 'Carlos', 'Diana', 'Ethan', 'Farah', 'George', 'Hannah']

  const addPatient = useCallback(() => {
    const severity = Math.floor(Math.random() * 5) + 1
    const name = NAMES[(nextId - 1) % NAMES.length]
    const p = { id: nextId, name, severity, arrival: nextId }
    setNextId(n => n + 1)
    setPatients(prev => [...prev, p])
  }, [nextId])

  const serveNext = useCallback(() => {
    if (patients.length === 0) return
    let sorted
    if (mode === 'priority') {
      sorted = [...patients].sort((a, b) => b.severity - a.severity)
    } else {
      sorted = [...patients].sort((a, b) => a.arrival - b.arrival)
    }
    const next = sorted[0]
    setPatients(prev => prev.filter(p => p.id !== next.id))
    setServed(prev => [next, ...prev].slice(0, 5))
  }, [patients, mode])

  const reset = () => { setPatients([]); setServed([]); setNextId(1) }

  const displayQueue = mode === 'priority'
    ? [...patients].sort((a, b) => b.severity - a.severity)
    : [...patients]

  return (
    <InteractiveDemo title="Hospital ER Priority Queue" instruction="Add patients and see who gets served first!">
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => setMode('fifo')}
          style={{
            padding: '8px 18px', borderRadius: 20, border: `2px solid ${C.blue}`,
            background: mode === 'fifo' ? C.blue : 'transparent',
            color: mode === 'fifo' ? '#fff' : C.blue,
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}
        >
          Regular Queue (FIFO)
        </button>
        <button
          onClick={() => setMode('priority')}
          style={{
            padding: '8px 18px', borderRadius: 20, border: `2px solid ${C.green}`,
            background: mode === 'priority' ? C.green : 'transparent',
            color: mode === 'priority' ? '#fff' : C.green,
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}
        >
          Priority Queue
        </button>
      </div>

      {mode === 'fifo' && (
        <div style={{
          background: '#fef2f2', border: `1px solid ${C.red}33`, borderRadius: 12,
          padding: '10px 16px', marginBottom: 16, fontSize: 14, color: C.red, fontWeight: 600,
        }}>
          FIFO Problem: A heart attack patient (severity 5) waits behind a cold patient (severity 1)!
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={addPatient}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}
        >
          + Add Random Patient
        </button>
        <button
          onClick={serveNext}
          disabled={patients.length === 0}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: patients.length > 0 ? `linear-gradient(135deg, ${C.green}, ${C.teal})` : '#ccc',
            color: '#fff', fontWeight: 700, cursor: patients.length > 0 ? 'pointer' : 'not-allowed', fontSize: 14,
          }}
        >
          Serve Next
        </button>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px', borderRadius: 10, border: `1px solid var(--border)`,
            background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Queue */}
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontSize: 14 }}>
            Waiting Queue ({patients.length} patients)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
            <AnimatePresence>
              {displayQueue.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    background: i === 0 ? `${SEVERITY_COLORS[p.severity]}22` : 'var(--bg-secondary)',
                    border: `2px solid ${i === 0 ? SEVERITY_COLORS[p.severity] : 'var(--border)'}`,
                  }}
                >
                  {i === 0 && <span style={{ fontSize: 18 }}>→</span>}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: SEVERITY_COLORS[p.severity],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 13,
                  }}>{p.severity}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: SEVERITY_COLORS[p.severity], fontWeight: 600 }}>
                      {SEVERITY_LABELS[p.severity]}
                    </div>
                  </div>
                  {mode === 'fifo' && (
                    <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>
                      #{p.arrival}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {patients.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: 20 }}>
                ER is empty — add patients!
              </div>
            )}
          </div>
        </div>

        {/* Served */}
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontSize: 14 }}>
            Recently Served
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {served.map((p, i) => (
                <motion.div
                  key={`served-${p.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1 - i * 0.15, scale: 1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 14px', borderRadius: 10,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    opacity: 1 - i * 0.2,
                  }}
                >
                  <span style={{ fontSize: 16 }}>✓</span>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: SEVERITY_COLORS[p.severity],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 12,
                  }}>{p.severity}</div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>{p.name}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Complexity comparison */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          padding: 14, borderRadius: 12, background: '#fef2f2', border: `1px solid ${C.red}33`,
        }}>
          <div style={{ fontWeight: 700, color: C.red, fontSize: 13, marginBottom: 6 }}>Sorted Array (slow)</div>
          <div style={{ fontSize: 13, color: '#555' }}>Insert: <strong>O(n)</strong> — must shift elements</div>
          <div style={{ fontSize: 13, color: '#555' }}>Get Min: <strong>O(1)</strong> — just peek front</div>
        </div>
        <div style={{
          padding: 14, borderRadius: 12, background: '#f0fdf4', border: `1px solid ${C.green}33`,
        }}>
          <div style={{ fontWeight: 700, color: C.green, fontSize: 13, marginBottom: 6 }}>Heap (fast!)</div>
          <div style={{ fontSize: 13, color: '#555' }}>Insert: <strong>O(log n)</strong> — bubble up</div>
          <div style={{ fontSize: 13, color: '#555' }}>Get Min: <strong>O(1)</strong> — always at root</div>
        </div>
      </div>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 2 — Min-Heap Visualizer
================================================================ */
function HeapVisualizer() {
  const [heap, setHeap] = useState([3, 9, 7, 15, 12, 20, 8])
  const [inputVal, setInputVal] = useState('')
  const [steps, setSteps] = useState([])
  const [stepIdx, setStepIdx] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [message, setMessage] = useState('Min-Heap ready. Try inserting or extracting!')

  const currentHeap = stepIdx >= 0 && steps[stepIdx] ? steps[stepIdx].heap : heap
  const highlighted = stepIdx >= 0 && steps[stepIdx] ? steps[stepIdx].highlight : []

  const runSteps = useCallback((newSteps, finalHeap) => {
    setIsAnimating(true)
    setSteps(newSteps)
    setStepIdx(0)
    setMessage(newSteps[0]?.action || '')

    let i = 0
    const interval = setInterval(() => {
      i++
      if (i >= newSteps.length) {
        clearInterval(interval)
        setHeap(finalHeap)
        setSteps([])
        setStepIdx(-1)
        setIsAnimating(false)
        setMessage('Done! Heap property maintained.')
      } else {
        setStepIdx(i)
        setMessage(newSteps[i]?.action || '')
      }
    }, 700)
  }, [])

  const handleInsert = useCallback(() => {
    const val = parseInt(inputVal)
    if (isNaN(val) || isAnimating) return
    if (heap.length >= 15) { setMessage('Heap full (max 15 nodes for visualization)'); return }
    setInputVal('')
    const result = insertMinHeap(heap, val)
    runSteps(result.steps, result.heap)
  }, [inputVal, heap, isAnimating, runSteps])

  const handleExtract = useCallback(() => {
    if (heap.length === 0 || isAnimating) return
    const result = extractMinHeap(heap)
    runSteps(result.steps, result.heap)
  }, [heap, isAnimating, runSteps])

  const positions = getTreePositions(currentHeap.length)
  const svgHeight = currentHeap.length === 0 ? 60 : Math.max(...positions.map(p => p.y)) + 40

  return (
    <InteractiveDemo title="Min-Heap Tree + Array Visualizer" instruction="Insert values or extract min to watch the heap in action.">
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="number"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleInsert()}
          placeholder="Enter value..."
          disabled={isAnimating}
          style={{
            padding: '10px 14px', borderRadius: 10, border: '2px solid var(--border)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 15, width: 140,
          }}
        />
        <button
          onClick={handleInsert}
          disabled={isAnimating || !inputVal}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: isAnimating || !inputVal ? '#ccc' : `linear-gradient(135deg, ${C.green}, ${C.teal})`,
            color: '#fff', fontWeight: 700, cursor: isAnimating || !inputVal ? 'not-allowed' : 'pointer', fontSize: 14,
          }}
        >
          Insert
        </button>
        <button
          onClick={handleExtract}
          disabled={isAnimating || heap.length === 0}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: isAnimating || heap.length === 0 ? '#ccc' : `linear-gradient(135deg, ${C.orange}, ${C.pink})`,
            color: '#fff', fontWeight: 700, cursor: isAnimating || heap.length === 0 ? 'not-allowed' : 'pointer', fontSize: 14,
          }}
        >
          Extract Min
        </button>
        <div style={{
          padding: '10px 18px', borderRadius: 10,
          background: `${C.cyan}18`, border: `2px solid ${C.cyan}44`,
          color: C.cyan, fontWeight: 700, fontSize: 14,
        }}>
          Peek: {currentHeap[0] ?? 'empty'} — O(1)!
        </div>
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            background: `${C.indigo}12`, border: `1px solid ${C.indigo}33`,
            borderRadius: 10, padding: '10px 16px', marginBottom: 20,
            fontSize: 14, color: C.indigo, fontWeight: 600,
          }}
        >
          {message}
        </motion.div>
      </AnimatePresence>

      {/* Tree visualization */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Tree View
        </div>
        {currentHeap.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 30, fontSize: 14 }}>
            Heap is empty
          </div>
        ) : (
          <svg width="100%" height={svgHeight} style={{ overflow: 'visible' }}>
            {/* Draw edges first */}
            {currentHeap.map((_, i) => {
              const lc = leftChild(i), rc = rightChild(i)
              return (
                <g key={`edges-${i}`}>
                  {lc < currentHeap.length && (
                    <line
                      x1={`${positions[i].x}%`} y1={positions[i].y}
                      x2={`${positions[lc].x}%`} y2={positions[lc].y}
                      stroke="var(--border)" strokeWidth={2}
                    />
                  )}
                  {rc < currentHeap.length && (
                    <line
                      x1={`${positions[i].x}%`} y1={positions[i].y}
                      x2={`${positions[rc].x}%`} y2={positions[rc].y}
                      stroke="var(--border)" strokeWidth={2}
                    />
                  )}
                </g>
              )
            })}
            {/* Draw nodes */}
            {currentHeap.map((val, i) => (
              <TreeNode
                key={i}
                x={positions[i].x}
                y={positions[i].y}
                value={val}
                isRoot={i === 0}
                highlight={
                  highlighted.includes(i) && i === 0 && highlighted.length === 1 ? 'new'
                  : highlighted.includes(i) && highlighted.length === 2 ? 'swap'
                  : highlighted.includes(i) ? 'new'
                  : null
                }
                color={C.indigo}
              />
            ))}
          </svg>
        )}
      </div>

      {/* Array representation */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Array View (same data!)
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {currentHeap.map((val, i) => (
            <motion.div
              key={i}
              animate={{ scale: highlighted.includes(i) ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.4 }}
              style={{
                minWidth: 44, padding: '8px 4px', borderRadius: 8, textAlign: 'center',
                background: highlighted.includes(i) ? C.orange : i === 0 ? C.indigo : 'var(--bg-card)',
                color: highlighted.includes(i) || i === 0 ? '#fff' : 'var(--text-primary)',
                border: `2px solid ${highlighted.includes(i) ? C.orange : i === 0 ? C.indigo : 'var(--border)'}`,
                fontWeight: 700,
              }}
            >
              <div style={{ fontSize: 15 }}>{val}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>[{i}]</div>
            </motion.div>
          ))}
          {currentHeap.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, padding: 10 }}>[]</div>
          )}
        </div>
      </div>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 3 — Heap as Array + Formula Explorer
================================================================ */
function HeapArrayFormula() {
  const [selectedIdx, setSelectedIdx] = useState(null)
  const sampleHeap = [2, 6, 4, 11, 8, 12, 7, 15, 20, 10]
  const positions = getTreePositions(sampleHeap.length)
  const svgHeight = Math.max(...positions.map(p => p.y)) + 40

  const info = selectedIdx !== null ? {
    parent: selectedIdx > 0 ? parentIdx(selectedIdx) : null,
    left:   leftChild(selectedIdx) < sampleHeap.length ? leftChild(selectedIdx) : null,
    right:  rightChild(selectedIdx) < sampleHeap.length ? rightChild(selectedIdx) : null,
  } : null

  return (
    <InteractiveDemo title="Heap = Flat Array" instruction="Click any node or array slot to see its parent/children indices.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Tree side */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            CLICK A NODE
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 12 }}>
            <svg width="100%" height={svgHeight} style={{ overflow: 'visible' }}>
              {sampleHeap.map((_, i) => {
                const lc = leftChild(i), rc = rightChild(i)
                return (
                  <g key={`e-${i}`}>
                    {lc < sampleHeap.length && (
                      <line
                        x1={`${positions[i].x}%`} y1={positions[i].y}
                        x2={`${positions[lc].x}%`} y2={positions[lc].y}
                        stroke="var(--border)" strokeWidth={2}
                      />
                    )}
                    {rc < sampleHeap.length && (
                      <line
                        x1={`${positions[i].x}%`} y1={positions[i].y}
                        x2={`${positions[rc].x}%`} y2={positions[rc].y}
                        stroke="var(--border)" strokeWidth={2}
                      />
                    )}
                  </g>
                )
              })}
              {sampleHeap.map((val, i) => {
                const isSelected = i === selectedIdx
                const isParent   = info && info.parent === i
                const isLeft     = info && info.left === i
                const isRight    = info && info.right === i
                const color      = isSelected ? C.indigo : isParent ? C.orange : isLeft || isRight ? C.green : 'var(--bg-card)'
                const textColor  = (isSelected || isParent || isLeft || isRight) ? '#fff' : 'var(--text-primary)'
                return (
                  <g
                    key={i}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
                  >
                    <circle
                      cx={`${positions[i].x}%`} cy={positions[i].y} r={18}
                      fill={color}
                      stroke={isSelected ? C.indigo : isParent ? C.orange : isLeft || isRight ? C.green : 'var(--border)'}
                      strokeWidth={2}
                    />
                    <text x={`${positions[i].x}%`} y={positions[i].y - 1} textAnchor="middle" dominantBaseline="central" fill={textColor} fontSize={12} fontWeight={700}>{val}</text>
                    <text x={`${positions[i].x}%`} y={positions[i].y + 14} textAnchor="middle" fill="#aaa" fontSize={9}>i={i}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Array side + formula */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            CLICK AN INDEX
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
            {sampleHeap.map((val, i) => {
              const isSelected = i === selectedIdx
              const isParent   = info && info.parent === i
              const isLeft     = info && info.left === i
              const isRight    = info && info.right === i
              return (
                <div
                  key={i}
                  onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
                  style={{
                    minWidth: 40, padding: '8px 4px', borderRadius: 8, textAlign: 'center',
                    background: isSelected ? C.indigo : isParent ? C.orange : isLeft || isRight ? C.green : 'var(--bg-secondary)',
                    color: (isSelected || isParent || isLeft || isRight) ? '#fff' : 'var(--text-primary)',
                    border: `2px solid ${isSelected ? C.indigo : isParent ? C.orange : isLeft || isRight ? C.green : 'var(--border)'}`,
                    cursor: 'pointer', fontWeight: 700,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 14 }}>{val}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>[{i}]</div>
                </div>
              )
            })}
          </div>

          {/* Formulas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Parent of i', formula: 'Math.floor((i-1)/2)', color: C.orange },
              { label: 'Left child of i', formula: '2*i + 1', color: C.green },
              { label: 'Right child of i', formula: '2*i + 2', color: C.cyan },
            ].map(({ label, formula, color }) => (
              <div key={label} style={{
                padding: '10px 14px', borderRadius: 10,
                background: `${color}12`, border: `1px solid ${color}33`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <code style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'monospace' }}>{formula}</code>
              </div>
            ))}
          </div>

          {/* Live result */}
          {selectedIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 14, borderRadius: 12,
                background: `${C.indigo}12`, border: `1px solid ${C.indigo}33`,
              }}
            >
              <div style={{ fontWeight: 700, color: C.indigo, marginBottom: 8 }}>
                Selected: index {selectedIdx} (value = {sampleHeap[selectedIdx]})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <span style={{ color: C.orange }}>
                  Parent: index {info.parent !== null ? info.parent : 'none (this is root)'}
                  {info.parent !== null ? ` (value = ${sampleHeap[info.parent]})` : ''}
                </span>
                <span style={{ color: C.green }}>
                  Left child: index {info.left !== null ? info.left : 'none'}
                  {info.left !== null ? ` (value = ${sampleHeap[info.left]})` : ''}
                </span>
                <span style={{ color: C.cyan }}>
                  Right child: index {info.right !== null ? info.right : 'none'}
                  {info.right !== null ? ` (value = ${sampleHeap[info.right]})` : ''}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 4 — Min-Heap vs Max-Heap
================================================================ */
function MinMaxComparison() {
  const [minH, setMinH] = useState([1, 4, 2, 9, 7, 8, 5])
  const [maxH, setMaxH] = useState([9, 7, 8, 4, 1, 2, 5])
  const [inputVal, setInputVal] = useState('')
  const [activeTab, setActiveTab] = useState('both')

  const handleInsertBoth = () => {
    const val = parseInt(inputVal)
    if (isNaN(val) || minH.length >= 15) return
    setInputVal('')
    const result = insertMinHeap(minH, val)
    setMinH(result.heap)
    setMaxH(insertMaxHeap(maxH, val))
  }

  const reset = () => {
    setMinH([1, 4, 2, 9, 7, 8, 5])
    setMaxH([9, 7, 8, 4, 1, 2, 5])
    setInputVal('')
  }

  const renderHeap = (heap, isMin) => {
    if (heap.length === 0) return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>Empty</div>
    const pos = getTreePositions(heap.length)
    const svgH = Math.max(...pos.map(p => p.y)) + 40
    const color = isMin ? C.indigo : C.orange

    return (
      <svg width="100%" height={svgH} style={{ overflow: 'visible' }}>
        {heap.map((_, i) => {
          const lc = leftChild(i), rc = rightChild(i)
          return (
            <g key={`e-${i}`}>
              {lc < heap.length && <line x1={`${pos[i].x}%`} y1={pos[i].y} x2={`${pos[lc].x}%`} y2={pos[lc].y} stroke="var(--border)" strokeWidth={2} />}
              {rc < heap.length && <line x1={`${pos[i].x}%`} y1={pos[i].y} x2={`${pos[rc].x}%`} y2={pos[rc].y} stroke="var(--border)" strokeWidth={2} />}
            </g>
          )
        })}
        {heap.map((val, i) => (
          <g key={i}>
            <circle cx={`${pos[i].x}%`} cy={pos[i].y} r={18} fill={i === 0 ? color : 'var(--bg-card)'} stroke={i === 0 ? color : `${color}55`} strokeWidth={2} />
            <text x={`${pos[i].x}%`} y={pos[i].y} textAnchor="middle" dominantBaseline="central" fill={i === 0 ? '#fff' : 'var(--text-primary)'} fontSize={12} fontWeight={700}>{val}</text>
          </g>
        ))}
      </svg>
    )
  }

  return (
    <InteractiveDemo title="Min-Heap vs Max-Heap" instruction="Insert the same value into both heaps — see how they differ!">
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="number"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleInsertBoth()}
          placeholder="Value..."
          style={{ padding: '10px 14px', borderRadius: 10, border: '2px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 15, width: 120 }}
        />
        <button onClick={handleInsertBoth} disabled={!inputVal} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          Insert into Both
        </button>
        <button onClick={reset} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Min-Heap */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>MIN</div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>Min-Heap</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Parent ≤ Children</div>
            </div>
            <div style={{ marginLeft: 'auto', background: `${C.indigo}18`, border: `1px solid ${C.indigo}33`, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: C.indigo }}>
              Root: {minH[0]}
            </div>
          </div>
          {renderHeap(minH, true)}
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', padding: '8px 12px', background: `${C.indigo}10`, borderRadius: 8 }}>
            Use for: Find cheapest, shortest path, min priority
          </div>
        </div>

        {/* Max-Heap */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>MAX</div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>Max-Heap</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Parent ≥ Children</div>
            </div>
            <div style={{ marginLeft: 'auto', background: `${C.orange}18`, border: `1px solid ${C.orange}33`, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: C.orange }}>
              Root: {maxH[0]}
            </div>
          </div>
          {renderHeap(maxH, false)}
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', padding: '8px 12px', background: `${C.orange}10`, borderRadius: 8 }}>
            Use for: Find highest score, max priority tasks
          </div>
        </div>
      </div>
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 5 — Build a Heap Challenge
================================================================ */
function HeapifyChallenge() {
  const INITIAL_NUMBERS = [42, 11, 78, 5, 29, 63, 17, 36]
  const [numbers] = useState(INITIAL_NUMBERS)
  const [userHeap, setUserHeap] = useState([])
  const [violations, setViolations] = useState([])
  const [phase, setPhase] = useState('manual') // 'manual' | 'heapify'
  const [heapifySteps, setHeapifySteps] = useState([])
  const [heapifyIdx, setHeapifyIdx] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [message, setMessage] = useState('Place numbers into the heap one by one.')
  const [completed, setCompleted] = useState(false)

  const checkViolations = (heap) => {
    const v = []
    for (let i = 1; i < heap.length; i++) {
      if (heap[parentIdx(i)] > heap[i]) v.push(i)
    }
    return v
  }

  const handlePlace = (num) => {
    if (userHeap.includes(num)) return
    const newHeap = [...userHeap, num]
    setUserHeap(newHeap)
    const v = checkViolations(newHeap)
    setViolations(v)
    if (v.length > 0) {
      setMessage(`Heap violation! Index ${v[0]}: ${newHeap[v[0]]} > parent ${newHeap[parentIdx(v[0])]}. Red nodes need fixing!`)
    } else if (newHeap.length === numbers.length) {
      setMessage('Perfect! All numbers placed — heap property maintained!')
      setCompleted(true)
    } else {
      setMessage(`Good! ${numbers.length - newHeap.length} numbers left. Heap property OK so far.`)
    }
  }

  const runHeapify = () => {
    const arr = [...numbers]
    const steps = [{ heap: [...arr], highlight: [], action: 'Start: all numbers as array' }]
    // Bottom-up heapify
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      let j = i
      const label = `Heapify from index ${i} (value ${arr[i]})...`
      steps.push({ heap: [...arr], highlight: [j], action: label })
      while (true) {
        const l = leftChild(j), r = rightChild(j)
        let smallest = j
        if (l < arr.length && arr[l] < arr[smallest]) smallest = l
        if (r < arr.length && arr[r] < arr[smallest]) smallest = r
        if (smallest === j) break
        ;[arr[j], arr[smallest]] = [arr[smallest], arr[j]]
        steps.push({ heap: [...arr], highlight: [j, smallest], action: `Swap ${arr[smallest]} ↔ ${arr[j]}` })
        j = smallest
      }
    }
    steps.push({ heap: [...arr], highlight: [], action: 'Heapify complete! O(n) time!' })
    setPhase('heapify')
    setHeapifySteps(steps)
    setIsAnimating(true)
    let i = 0
    setHeapifyIdx(0)
    setMessage(steps[0].action)
    const interval = setInterval(() => {
      i++
      if (i >= steps.length) {
        clearInterval(interval)
        setIsAnimating(false)
        setMessage('Done! Built in O(n) — faster than inserting one-by-one O(n log n)!')
        setUserHeap(arr)
        setViolations([])
        setCompleted(true)
      } else {
        setHeapifyIdx(i)
        setMessage(steps[i].action)
      }
    }, 500)
  }

  const reset = () => {
    setUserHeap([]); setViolations([]); setPhase('manual')
    setHeapifySteps([]); setHeapifyIdx(-1); setIsAnimating(false)
    setMessage('Place numbers into the heap one by one.')
    setCompleted(false)
  }

  const displayHeap = phase === 'heapify' && heapifyIdx >= 0 && heapifySteps[heapifyIdx]
    ? heapifySteps[heapifyIdx].heap
    : userHeap

  const displayHighlight = phase === 'heapify' && heapifyIdx >= 0 && heapifySteps[heapifyIdx]
    ? heapifySteps[heapifyIdx].highlight
    : violations

  const positions = getTreePositions(displayHeap.length)
  const svgH = displayHeap.length > 0 ? Math.max(...positions.map(p => p.y)) + 40 : 60

  return (
    <InteractiveDemo title="Build-a-Heap Challenge" instruction="Manual: click numbers to place them. Or watch heapify (O(n)) do it instantly!">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          Reset
        </button>
        <button onClick={runHeapify} disabled={isAnimating} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: isAnimating ? '#ccc' : `linear-gradient(135deg, ${C.teal}, ${C.cyan})`, color: '#fff', fontWeight: 700, cursor: isAnimating ? 'not-allowed' : 'pointer', fontSize: 13 }}>
          Watch Heapify O(n)
        </button>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
          Manual: O(n log n) | Heapify: O(n)
        </div>
      </div>

      {/* Available numbers */}
      {phase === 'manual' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Click to place:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {numbers.map(num => {
              const placed = userHeap.includes(num)
              return (
                <motion.button
                  key={num}
                  onClick={() => !placed && handlePlace(num)}
                  whileHover={!placed ? { scale: 1.1 } : {}}
                  whileTap={!placed ? { scale: 0.9 } : {}}
                  style={{
                    width: 44, height: 44, borderRadius: 10, border: 'none',
                    background: placed ? '#ccc' : `linear-gradient(135deg, ${C.purple}, ${C.indigo})`,
                    color: placed ? '#888' : '#fff',
                    fontWeight: 700, fontSize: 14,
                    cursor: placed ? 'not-allowed' : 'pointer',
                    textDecoration: placed ? 'line-through' : 'none',
                  }}
                >
                  {num}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: violations.length > 0 ? '#fef2f2' : `${C.green}12`,
            border: `1px solid ${violations.length > 0 ? C.red + '44' : C.green + '33'}`,
            fontSize: 14, fontWeight: 600,
            color: violations.length > 0 ? C.red : C.green,
          }}
        >
          {message}
        </motion.div>
      </AnimatePresence>

      {/* Tree */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 16 }}>
        {displayHeap.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 30, fontSize: 14 }}>
            No nodes yet — click numbers above
          </div>
        ) : (
          <svg width="100%" height={svgH} style={{ overflow: 'visible' }}>
            {displayHeap.map((_, i) => {
              const lc = leftChild(i), rc = rightChild(i)
              return (
                <g key={`e-${i}`}>
                  {lc < displayHeap.length && <line x1={`${positions[i].x}%`} y1={positions[i].y} x2={`${positions[lc].x}%`} y2={positions[lc].y} stroke="var(--border)" strokeWidth={2} />}
                  {rc < displayHeap.length && <line x1={`${positions[i].x}%`} y1={positions[i].y} x2={`${positions[rc].x}%`} y2={positions[rc].y} stroke="var(--border)" strokeWidth={2} />}
                </g>
              )
            })}
            {displayHeap.map((val, i) => {
              const isViolation = displayHighlight.includes(i) && phase === 'manual'
              const isSwap      = displayHighlight.includes(i) && phase === 'heapify'
              const bg = isViolation ? C.red : isSwap ? C.orange : i === 0 ? C.indigo : 'var(--bg-card)'
              const tc = (isViolation || isSwap || i === 0) ? '#fff' : 'var(--text-primary)'
              return (
                <g key={i}>
                  <circle cx={`${positions[i].x}%`} cy={positions[i].y} r={18} fill={bg} stroke={isViolation ? C.red : i === 0 ? C.indigo : 'var(--border)'} strokeWidth={2} />
                  <text x={`${positions[i].x}%`} y={positions[i].y} textAnchor="middle" dominantBaseline="central" fill={tc} fontSize={12} fontWeight={700}>{val}</text>
                </g>
              )
            })}
          </svg>
        )}
      </div>

      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ marginTop: 16, padding: 16, borderRadius: 12, background: `${C.green}15`, border: `2px solid ${C.green}44`, textAlign: 'center' }}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>🎉</div>
          <div style={{ fontWeight: 700, color: C.green, fontSize: 15 }}>Valid Min-Heap Built!</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Min element at root: {displayHeap[0]}</div>
        </motion.div>
      )}
    </InteractiveDemo>
  )
}

/* ================================================================
   SECTION 6 — Heap Applications
================================================================ */
function HeapApplications() {
  const [activeApp, setActiveApp] = useState(0)
  const [topKRunning, setTopKRunning] = useState(false)
  const [topKState, setTopKState] = useState({ stream: [], heap: [], done: false, step: 0 })
  const [sortRunning, setSortRunning] = useState(false)
  const [sortState, setSortState] = useState({ heap: [], sorted: [], step: '' })

  const STREAM = [34, 8, 92, 17, 55, 71, 3, 88, 46, 62, 25, 79]
  const K = 3

  const runTopK = () => {
    setTopKRunning(true)
    setTopKState({ stream: [], heap: [], done: false, step: 0 })
    let heap = []
    let i = 0
    const interval = setInterval(() => {
      if (i >= STREAM.length) {
        clearInterval(interval)
        setTopKRunning(false)
        setTopKState(prev => ({ ...prev, done: true }))
        return
      }
      const val = STREAM[i]
      if (heap.length < K) {
        const result = insertMinHeap(heap, val)
        heap = result.heap
      } else if (val > heap[0]) {
        heap[0] = val
        // sift down
        let j = 0
        while (true) {
          const l = leftChild(j), r = rightChild(j)
          let s = j
          if (l < heap.length && heap[l] < heap[s]) s = l
          if (r < heap.length && heap[r] < heap[s]) s = r
          if (s === j) break
          ;[heap[j], heap[s]] = [heap[s], heap[j]]
          j = s
        }
      }
      setTopKState({ stream: STREAM.slice(0, i + 1), heap: [...heap], done: false, step: i })
      i++
    }, 400)
  }

  const SORT_INITIAL = [41, 9, 72, 5, 58, 33, 17, 86]
  const runHeapSort = () => {
    setSortRunning(true)
    let heap = []
    SORT_INITIAL.forEach(v => { heap = insertMinHeap(heap, v).heap })
    const sorted = []
    setSortState({ heap: [...heap], sorted: [], step: 'Built heap...' })
    const extractAll = (h, s) => {
      if (h.length === 0) {
        setSortState({ heap: [], sorted: s, step: 'Sorted! O(n log n)' })
        setSortRunning(false)
        return
      }
      const result = extractMinHeap(h)
      const newSorted = [...s, h[0]]
      setTimeout(() => {
        setSortState({ heap: result.heap, sorted: newSorted, step: `Extracted ${h[0]}` })
        extractAll(result.heap, newSorted)
      }, 500)
    }
    setTimeout(() => extractAll(heap, []), 600)
  }

  const resetApps = () => {
    setTopKState({ stream: [], heap: [], done: false, step: 0 })
    setSortState({ heap: [], sorted: [], step: '' })
  }

  const apps = [
    {
      title: 'Top K Elements',
      icon: '🏆',
      color: C.orange,
      desc: 'Find 3 highest scores from 12 numbers using a min-heap of size 3.',
      content: (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Stream: [{STREAM.join(', ')}]  |  K = {K}
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              onClick={runTopK}
              disabled={topKRunning}
              style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: topKRunning ? '#ccc' : `linear-gradient(135deg, ${C.orange}, ${C.pink})`, color: '#fff', fontWeight: 700, cursor: topKRunning ? 'not-allowed' : 'pointer', fontSize: 13 }}
            >
              Run
            </button>
            <button onClick={resetApps} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Reset</button>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {topKState.stream.map((v, i) => (
              <div key={i} style={{ padding: '6px 10px', borderRadius: 8, background: topKState.heap.includes(v) ? `${C.orange}22` : 'var(--bg-secondary)', border: `1px solid ${topKState.heap.includes(v) ? C.orange : 'var(--border)'}`, fontSize: 13, fontWeight: 700, color: topKState.heap.includes(v) ? C.orange : 'var(--text-primary)' }}>
                {v}
              </div>
            ))}
          </div>
          {topKState.heap.length > 0 && (
            <div style={{ padding: 12, borderRadius: 10, background: `${C.orange}10`, border: `1px solid ${C.orange}33` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 6 }}>Min-Heap of Top-{K}:</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {topKState.heap.map((v, i) => (
                  <div key={i} style={{ padding: '8px 14px', borderRadius: 8, background: i === 0 ? C.orange : `${C.orange}22`, color: i === 0 ? '#fff' : C.orange, fontWeight: 800, fontSize: 15 }}>{v}</div>
                ))}
              </div>
              {topKState.done && <div style={{ marginTop: 8, fontWeight: 700, color: C.green, fontSize: 13 }}>Top {K}: [{[...topKState.heap].sort((a,b)=>b-a).join(', ')}]</div>}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Heap Sort',
      icon: '📊',
      color: C.cyan,
      desc: 'Extract min repeatedly from a heap → sorted array. O(n log n), elegant!',
      content: (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Input: [{SORT_INITIAL.join(', ')}]
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              onClick={runHeapSort}
              disabled={sortRunning}
              style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: sortRunning ? '#ccc' : `linear-gradient(135deg, ${C.cyan}, ${C.teal})`, color: '#fff', fontWeight: 700, cursor: sortRunning ? 'not-allowed' : 'pointer', fontSize: 13 }}
            >
              Run Heap Sort
            </button>
            <button onClick={resetApps} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Reset</button>
          </div>
          {sortState.step && (
            <div style={{ marginBottom: 12, fontSize: 13, color: C.cyan, fontWeight: 600 }}>{sortState.step}</div>
          )}
          {sortState.heap.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Remaining heap:</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {sortState.heap.map((v, i) => (
                  <div key={i} style={{ padding: '6px 10px', borderRadius: 7, background: i === 0 ? C.cyan : `${C.cyan}18`, color: i === 0 ? '#fff' : C.cyan, fontWeight: 700, fontSize: 14 }}>{v}</div>
                ))}
              </div>
            </div>
          )}
          {sortState.sorted.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Sorted output:</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {sortState.sorted.map((v, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '6px 10px', borderRadius: 7, background: `${C.green}22`, color: C.green, fontWeight: 700, fontSize: 14, border: `1px solid ${C.green}44` }}>{v}</motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Dijkstra's Algorithm",
      icon: '🗺️',
      color: C.purple,
      desc: "Min-heap picks the cheapest unvisited node. O((V + E) log V) — the backbone of GPS!",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: 14, borderRadius: 12, background: `${C.purple}10`, border: `1px solid ${C.purple}33` }}>
            <div style={{ fontWeight: 700, color: C.purple, marginBottom: 8 }}>How it uses a min-heap:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              <div>1. Insert starting node with distance 0</div>
              <div>2. Extract min (closest unvisited node) — O(log n)</div>
              <div>3. For each neighbor: insert with new distance — O(log n)</div>
              <div>4. Repeat until destination reached</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['Google Maps', 'Network Routing', 'Game Pathfinding', 'Social Graph'].map((app, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: `${C.purple}08`, border: `1px solid ${C.purple}22`, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 700, color: C.purple }}>→</span> {app}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Merge K Sorted Lists',
      icon: '🔀',
      color: C.pink,
      desc: 'Put first element of each list into a min-heap. Extract min → push next from same list.',
      content: (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[[1, 4, 9], [2, 5, 11], [3, 7, 13]].map((list, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 40 }}>List {i+1}:</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {list.map((v, j) => (
                    <div key={j} style={{ padding: '6px 12px', borderRadius: 7, background: j === 0 ? `${C.pink}22` : 'var(--bg-secondary)', border: `1px solid ${j === 0 ? C.pink : 'var(--border)'}`, fontSize: 13, fontWeight: 700, color: j === 0 ? C.pink : 'var(--text-primary)' }}>{v}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: `${C.pink}10`, border: `1px solid ${C.pink}33`, fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: C.pink, marginBottom: 6 }}>Min-heap (heads):</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map(v => (
                <div key={v} style={{ padding: '6px 14px', borderRadius: 7, background: v === 1 ? C.pink : `${C.pink}22`, color: v === 1 ? '#fff' : C.pink, fontWeight: 800, fontSize: 15 }}>{v}</div>
              ))}
            </div>
            <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Extract 1 → push 4. Repeat for sorted merge!</div>
            <div style={{ marginTop: 6, fontWeight: 700, color: C.green }}>Result: [1, 2, 3, 4, 5, 7, 9, 11, 13]</div>
          </div>
        </div>
      )
    },
  ]

  return (
    <SectionBlock icon="🚀" title="Heap Applications" color={C.teal}>
      <Neuron mood="excited" message="The heap is everywhere! Once you know it, you'll spot it in GPS, databases, OS schedulers, and streaming algorithms. Let me show you the big 4." />
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {apps.map((app, i) => (
            <button
              key={i}
              onClick={() => { setActiveApp(i); resetApps() }}
              style={{
                padding: '10px 16px', borderRadius: 12, border: `2px solid ${activeApp === i ? app.color : 'var(--border)'}`,
                background: activeApp === i ? `${app.color}18` : 'transparent',
                color: activeApp === i ? app.color : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <span>{app.icon}</span>
              <span>{app.title}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeApp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{
              padding: 20, borderRadius: 16,
              background: `${apps[activeApp].color}08`,
              border: `2px solid ${apps[activeApp].color}33`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 26 }}>{apps[activeApp].icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>{apps[activeApp].title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{apps[activeApp].desc}</div>
                </div>
              </div>
              {apps[activeApp].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   COMPLEXITY TABLE
================================================================ */
function ComplexityTable() {
  const rows = [
    { op: 'Peek (find min/max)',  heap: 'O(1)',      sortedArr: 'O(1)',      unsortedArr: 'O(n)',      bst: 'O(log n)' },
    { op: 'Insert',              heap: 'O(log n)',   sortedArr: 'O(n)',      unsortedArr: 'O(1)',      bst: 'O(log n)' },
    { op: 'Extract min/max',     heap: 'O(log n)',   sortedArr: 'O(1)',      unsortedArr: 'O(n)',      bst: 'O(log n)' },
    { op: 'Build from array',    heap: 'O(n)',       sortedArr: 'O(n log n)', unsortedArr: 'O(1)',     bst: 'O(n log n)' },
    { op: 'Search arbitrary',    heap: 'O(n)',       sortedArr: 'O(log n)',  unsortedArr: 'O(n)',      bst: 'O(log n)' },
  ]

  const getColor = (v) => {
    if (v === 'O(1)') return C.green
    if (v === 'O(log n)') return C.blue
    if (v === 'O(n)') return C.orange
    return C.red
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {['Operation', 'Heap', 'Sorted Array', 'Unsorted Array', 'BST'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.op}</td>
              {[row.heap, row.sortedArr, row.unsortedArr, row.bst].map((v, j) => (
                <td key={j} style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                    background: `${getColor(v)}18`, color: getColor(v),
                    border: `1px solid ${getColor(v)}33`,
                  }}>
                    {v}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic16Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 60px 0' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #312e81, #1e1b4b)',
          borderRadius: 24,
          padding: '40px 40px 32px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', top: -40, right: -40, width: 200, height: 200,
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>
              🏥
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
                Topic 16
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>
                Heaps & Priority Queues
              </h1>
            </div>
          </div>
          <p style={{ fontSize: 17, color: '#c7d2fe', lineHeight: 1.7, margin: 0, maxWidth: 600 }}>
            The VIP line — always know the minimum (or maximum) in O(1).
            Insert in O(log n). The secret weapon behind Dijkstra, heap sort, and every "top K" problem.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {['O(1) peek', 'O(log n) insert', 'O(n) build', 'Priority Queue'].map(badge => (
              <span key={badge} style={{
                padding: '5px 14px', borderRadius: 20,
                background: 'rgba(255,255,255,0.12)', color: '#e0e7ff',
                fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)',
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section 1: Hospital ER Problem */}
      <SectionBlock icon="🏥" title="The Hospital ER Problem" color={C.red}>
        <Neuron
          mood="explaining"
          message="Imagine a hospital ER. With a regular FIFO queue, whoever arrives first gets seen first. But what if a heart attack patient arrives just after someone with a cold? We need a smarter structure!"
        />
        <div style={{ marginTop: 24 }}>
          <ERDemo />
        </div>
        <NeuronTip type="tip">
          A Priority Queue always serves the highest-priority element next, regardless of arrival order.
          The Heap data structure implements this in O(log n) insert and O(1) peek — far better than maintaining a sorted array (O(n) insert).
        </NeuronTip>
      </SectionBlock>

      {/* Section 2: Min-Heap Visualizer */}
      <SectionBlock icon="🌳" title="Min-Heap Visualizer" color={C.indigo}>
        <Neuron
          mood="thinking"
          message="A min-heap is a binary tree where every parent is smaller than its children. The smallest element is ALWAYS at the root. Insert at the bottom, bubble up. Extract the root, sink the replacement down."
        />
        <div style={{ marginTop: 24 }}>
          <HeapVisualizer />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 4 }}>
          <div style={{ padding: 16, borderRadius: 14, background: `${C.green}10`, border: `1px solid ${C.green}33` }}>
            <div style={{ fontWeight: 700, color: C.green, marginBottom: 8, fontSize: 14 }}>Bubble Up (Insert)</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              New element added at the end.
              Swap with parent if smaller.
              Repeat until parent ≤ child.
              Max swaps = tree height = O(log n).
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: `${C.orange}10`, border: `1px solid ${C.orange}33` }}>
            <div style={{ fontWeight: 700, color: C.orange, marginBottom: 8, fontSize: 14 }}>Sink Down (Extract)</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Remove root (the min).
              Move last element to root.
              Swap with smaller child if needed.
              Repeat until parent ≤ both children.
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Section 3: Heap as Array */}
      <SectionBlock icon="📦" title="Heap as an Array" color={C.cyan}>
        <Neuron
          mood="excited"
          message="Here's the magic trick — you never actually need pointers or a tree structure in memory! A heap is stored as a flat array. The parent/child relationships are computed with simple math!"
          typed
        />
        <div style={{ marginTop: 24 }}>
          <HeapArrayFormula />
        </div>
        <NeuronTip type="deep">
          Why is the array representation so efficient? No pointer overhead (saves ~2× memory).
          Cache-friendly — elements are stored contiguously. Level-order traversal is just iterating the array!
          This is why heaps are preferred over BSTs for priority queues.
        </NeuronTip>
      </SectionBlock>

      {/* Section 4: Min vs Max */}
      <SectionBlock icon="⚖️" title="Min-Heap vs Max-Heap" color={C.orange}>
        <Neuron
          mood="explaining"
          message="Same data, different heap property. Min-Heap: parent ≤ children — smallest always at root. Max-Heap: parent ≥ children — largest always at root. JavaScript's built-in doesn't have either, so you'll implement your own!"
        />
        <div style={{ marginTop: 24 }}>
          <MinMaxComparison />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ padding: 16, borderRadius: 14, background: `${C.indigo}10`, border: `1px solid ${C.indigo}33` }}>
            <div style={{ fontWeight: 700, color: C.indigo, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📉</span> Min-Heap Use Cases
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Dijkstra's shortest path<br />
              Merge K sorted lists<br />
              Find K smallest elements<br />
              Task scheduling (shortest first)
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: `${C.orange}10`, border: `1px solid ${C.orange}33` }}>
            <div style={{ fontWeight: 700, color: C.orange, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📈</span> Max-Heap Use Cases
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Find K largest elements<br />
              Median of data stream<br />
              OS process scheduling<br />
              Maximum sliding window
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Section 5: Build a Heap Challenge */}
      <SectionBlock icon="🏗️" title="Build a Heap Challenge" color={C.teal}>
        <Neuron
          mood="waving"
          message="Time to build! Place the numbers manually (one-by-one insertion = O(n log n)) OR watch heapify do it from the bottom up in O(n). That's a real asymptotic difference on large data!"
        />
        <div style={{ marginTop: 24 }}>
          <HeapifyChallenge />
        </div>
        <NeuronTip type="warning">
          Many confuse O(n log n) with O(n) heapify. The bottom-up approach works because most nodes are near the leaves — they need very few swaps. The math shows the total work is O(n), not O(n log n)!
        </NeuronTip>
      </SectionBlock>

      {/* Section 6: Applications */}
      <HeapApplications />

      {/* Complexity Table */}
      <SectionBlock icon="📊" title="Complexity Comparison" color={C.blue}>
        <Neuron
          mood="thinking"
          message="When should you choose a heap over other structures? Here's the complete picture. Heap wins when you need fast min/max access with fast inserts."
        />
        <div style={{ marginTop: 20 }}>
          <ComplexityTable />
        </div>
        <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: `${C.blue}10`, border: `1px solid ${C.blue}33` }}>
          <div style={{ fontWeight: 700, color: C.blue, marginBottom: 8 }}>When to use a Heap:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div>You need the min/max frequently</div>
            <div>You insert and extract interleaved</div>
            <div>You don't need to search by value</div>
            <div>You want O(n) build time</div>
          </div>
        </div>
      </SectionBlock>

      {/* Section 7: Hindi Summary */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary" color={C.orange}>
        <Neuron
          mood="happy"
          message="Heaps ko samajhna bahut important hai! Ye almost every competitive programming problem mein dikhte hain. Let's consolidate in Hindi."
        />
        <div style={{ marginTop: 16 }}>
          <HindiExplainer
            concept="हीप और प्राथमिकता कतार"
            english="Heap & Priority Queue"
            explanation="Heap = VIP line jismein sabse important (sabse chhota ya sabse bada) hamesha sabse aage rehta hai. Ye ek binary tree hai jise ek flat array mein store kiya jaata hai. Min-Heap mein root hamesha sabse chhota hota hai. Max-Heap mein root hamesha sabse bada hota hai. Insert karo → naya element neeche aata hai, phir upar bubble hota hai. Nikaalo → root niklo, last element root pe aata hai, phir neeche sink hota hai."
            example="Hospital ER imagine karo — priority queue mein heart attack patient (severity 5) hamesha cold patient (severity 1) se pehle jaata hai, chahe baad mein aaya ho. Waise hi, heap hamesha sabse important element pehle deta hai. Dijkstra ke algorithm mein bhi yahi hota hai — hamesha sabse sasta unvisited node pehle choose hota hai."
            terms={[
              { hindi: 'हीप / ढेर', english: 'Heap', meaning: 'ek special binary tree jahan parent hamesha child se chhota (ya bada) hota hai' },
              { hindi: 'न्यूनतम हीप', english: 'Min-Heap', meaning: 'parent ≤ children — sabse chhota element root pe' },
              { hindi: 'अधिकतम हीप', english: 'Max-Heap', meaning: 'parent ≥ children — sabse bada element root pe' },
              { hindi: 'प्राथमिकता कतार', english: 'Priority Queue', meaning: 'data structure jo highest priority element pehle serve karta hai' },
              { hindi: 'ऊपर उठना', english: 'Bubble Up', meaning: 'insert ke baad naya element parents ke saath swap karke upar jaata hai' },
              { hindi: 'नीचे डूबना', english: 'Sink Down', meaning: 'extract ke baad root element children ke saath swap karke neeche jaata hai' },
              { hindi: 'हीपिफाई', english: 'Heapify', meaning: 'array ko heap mein convert karna — O(n) mein bottom-up approach se' },
            ]}
          />
        </div>

        {/* Quick reference card */}
        <div style={{
          marginTop: 24, padding: 20, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontSize: 16 }}>
            Quick Reference — Heap Cheat Sheet
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { op: 'Peek min/max', complexity: 'O(1)', color: C.green },
              { op: 'Insert', complexity: 'O(log n)', color: C.blue },
              { op: 'Extract min/max', complexity: 'O(log n)', color: C.blue },
              { op: 'Build heap', complexity: 'O(n)', color: C.green },
              { op: 'Heap sort', complexity: 'O(n log n)', color: C.orange },
              { op: 'Search', complexity: 'O(n)', color: C.orange },
            ].map(({ op, complexity, color }) => (
              <div key={op} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{op}</span>
                <span style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: `${color}18`, color, border: `1px solid ${color}33`,
                }}>
                  {complexity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>
    </div>
  )
}
