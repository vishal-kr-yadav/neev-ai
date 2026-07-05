import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  bfs:       '#3b82f6',
  dfs:       '#8b5cf6',
  visited:   '#6b7280',
  current:   '#f59e0b',
  path:      '#22c55e',
  unvisited: '#e2e8f0',
  edge:      '#94a3b8',
  edgeActive:'#f59e0b',
  queue:     '#3b82f6',
  stack:     '#8b5cf6',
  start:     '#22c55e',
  end:       '#ef4444',
  wall:      '#1e293b',
  open:      '#f8fafc',
  bg:        'var(--bg-card)',
  border:    'var(--border)',
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Section 1 — Maze Problem ─────────────────────────────────────────────────
const MAZE_ROWS = 9
const MAZE_COLS = 13

function buildMaze() {
  // 0 = open, 1 = wall
  const grid = [
    [0,0,0,1,0,0,0,1,0,0,0,0,0],
    [0,1,0,1,0,1,0,1,0,1,1,1,0],
    [0,1,0,0,0,1,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,0,1,1,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,1,0,0,0],
    [1,1,0,1,1,1,1,1,0,1,1,1,0],
    [0,0,0,0,0,1,0,0,0,0,0,1,0],
    [0,1,1,1,0,1,0,1,1,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
  ]
  return grid
}

const START = { r: 0, c: 0 }
const END   = { r: 8, c: 12 }

function getNeighbors(r, c, grid) {
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]]
  return dirs
    .map(([dr,dc]) => ({ r: r+dr, c: c+dc }))
    .filter(({ r, c }) =>
      r >= 0 && r < MAZE_ROWS && c >= 0 && c < MAZE_COLS && grid[r][c] === 0
    )
}

function bfsMaze(grid) {
  const queue = [START]
  const visited = Array.from({ length: MAZE_ROWS }, () => Array(MAZE_COLS).fill(false))
  const prev    = Array.from({ length: MAZE_ROWS }, () => Array(MAZE_COLS).fill(null))
  visited[START.r][START.c] = true
  const steps = []
  while (queue.length) {
    const cell = queue.shift()
    steps.push({ type: 'visit', ...cell })
    if (cell.r === END.r && cell.c === END.c) break
    for (const nb of getNeighbors(cell.r, cell.c, grid)) {
      if (!visited[nb.r][nb.c]) {
        visited[nb.r][nb.c] = true
        prev[nb.r][nb.c] = cell
        queue.push(nb)
      }
    }
  }
  // trace path
  let cur = END
  const path = []
  while (cur) {
    path.unshift(cur)
    cur = prev[cur.r]?.[cur.c] ?? null
  }
  return { steps, path }
}

function dfsMaze(grid) {
  const stack   = [START]
  const visited = Array.from({ length: MAZE_ROWS }, () => Array(MAZE_COLS).fill(false))
  const prev    = Array.from({ length: MAZE_ROWS }, () => Array(MAZE_COLS).fill(null))
  visited[START.r][START.c] = true
  const steps = []
  while (stack.length) {
    const cell = stack.pop()
    steps.push({ type: 'visit', ...cell })
    if (cell.r === END.r && cell.c === END.c) break
    for (const nb of getNeighbors(cell.r, cell.c, grid)) {
      if (!visited[nb.r][nb.c]) {
        visited[nb.r][nb.c] = true
        prev[nb.r][nb.c] = cell
        stack.push(nb)
      }
    }
  }
  let cur = END
  const path = []
  while (cur) {
    path.unshift(cur)
    cur = prev[cur.r]?.[cur.c] ?? null
  }
  return { steps, path }
}

function MazeProblem() {
  const [mode, setMode] = useState('bfs') // 'bfs' | 'dfs'
  const [visited, setVisited] = useState(new Set())
  const [path, setPath] = useState([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const cancelRef = useRef(false)
  const grid = buildMaze()

  function cellKey(r, c) { return `${r},${c}` }

  async function runAlgo() {
    cancelRef.current = false
    setRunning(true)
    setDone(false)
    setVisited(new Set())
    setPath([])
    const { steps, path: p } = mode === 'bfs' ? bfsMaze(grid) : dfsMaze(grid)
    for (const s of steps) {
      if (cancelRef.current) break
      setVisited(prev => new Set([...prev, cellKey(s.r, s.c)]))
      await sleep(mode === 'bfs' ? 28 : 22)
    }
    if (!cancelRef.current) {
      setPath(p)
      setDone(true)
    }
    setRunning(false)
  }

  function reset() {
    cancelRef.current = true
    setVisited(new Set())
    setPath([])
    setDone(false)
    setRunning(false)
  }

  const pathSet = new Set(path.map(({ r, c }) => cellKey(r, c)))
  const cellSize = 34

  function cellColor(r, c) {
    const k = cellKey(r, c)
    if (r === START.r && c === START.c) return C.start
    if (r === END.r && c === END.c) return C.end
    if (pathSet.has(k)) return C.path
    if (visited.has(k)) return mode === 'bfs' ? '#bfdbfe' : '#ddd6fe'
    return C.open
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 10 }}>
        {['bfs', 'dfs'].map(m => (
          <motion.button key={m} onClick={() => { reset(); setMode(m) }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 28px', borderRadius: 24,
              background: mode === m ? (m === 'bfs' ? C.bfs : C.dfs) : 'transparent',
              border: `2px solid ${m === 'bfs' ? C.bfs : C.dfs}`,
              color: mode === m ? '#fff' : (m === 'bfs' ? C.bfs : C.dfs),
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            {m === 'bfs' ? 'BFS — Ripple' : 'DFS — Deep Dive'}
          </motion.button>
        ))}
      </div>

      {/* Maze grid */}
      <div style={{ position: 'relative', lineHeight: 0 }}>
        {grid.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => {
              const isWall = cell === 1
              const bg = isWall ? C.wall : cellColor(r, c)
              return (
                <motion.div key={c}
                  animate={{ background: bg, scale: pathSet.has(cellKey(r,c)) ? 1.08 : 1 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    width: cellSize, height: cellSize,
                    border: '1px solid #e2e8f0',
                    borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}>
                  {r === START.r && c === START.c ? 'S' : r === END.r && c === END.c ? 'E' : ''}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13 }}>
        {[
          { color: C.start, label: 'Start' },
          { color: C.end, label: 'End' },
          { color: mode === 'bfs' ? '#bfdbfe' : '#ddd6fe', label: 'Explored' },
          { color: C.path, label: 'Path Found' },
          { color: C.wall, label: 'Wall' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        <motion.button onClick={runAlgo} disabled={running}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          style={{
            padding: '10px 28px', borderRadius: 24,
            background: running ? '#94a3b8' : (mode === 'bfs' ? C.bfs : C.dfs),
            border: 'none', color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: running ? 'default' : 'pointer',
          }}>
          {running ? 'Exploring...' : 'Run ' + mode.toUpperCase()}
        </motion.button>
        <motion.button onClick={reset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          style={{
            padding: '10px 22px', borderRadius: 24,
            background: 'transparent', border: '2px solid #94a3b8',
            color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
          Reset
        </motion.button>
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14,
            padding: '12px 24px', color: '#166534', fontWeight: 600, fontSize: 15, textAlign: 'center',
          }}>
          {mode === 'bfs'
            ? `BFS found the SHORTEST path — ${path.length - 1} steps (guaranteed!)`
            : `DFS found a path — ${path.length - 1} steps (may not be shortest)`}
        </motion.div>
      )}
    </div>
  )
}

// ─── Graph definition for sections 2, 3, 4 ───────────────────────────────────
const GRAPH_NODES = [
  { id: 0, x: 200, y: 60,  label: 'A' },
  { id: 1, x: 80,  y: 170, label: 'B' },
  { id: 2, x: 320, y: 170, label: 'C' },
  { id: 3, x: 30,  y: 290, label: 'D' },
  { id: 4, x: 160, y: 290, label: 'E' },
  { id: 5, x: 280, y: 290, label: 'F' },
  { id: 6, x: 400, y: 290, label: 'G' },
  { id: 7, x: 200, y: 400, label: 'H' },
]
const GRAPH_EDGES = [
  [0,1],[0,2],
  [1,3],[1,4],
  [2,5],[2,6],
  [3,7],[4,7],
  [5,7],[6,7],
]
const ADJ = Array.from({ length: 8 }, () => [])
GRAPH_EDGES.forEach(([a,b]) => { ADJ[a].push(b); ADJ[b].push(a) })

function buildBFSSteps(start = 0) {
  const visited = new Array(8).fill(false)
  const queue   = [start]
  const steps   = []
  const tree    = []
  visited[start] = true
  steps.push({ type: 'enqueue', node: start, queue: [start], visited: [...visited] })
  while (queue.length) {
    const cur = queue.shift()
    steps.push({ type: 'dequeue', node: cur, queue: [...queue], visited: [...visited] })
    for (const nb of ADJ[cur]) {
      if (!visited[nb]) {
        visited[nb] = true
        queue.push(nb)
        tree.push([cur, nb])
        steps.push({ type: 'enqueue', node: nb, queue: [...queue], visited: [...visited], from: cur })
      }
    }
  }
  return { steps, tree }
}

function buildDFSSteps(start = 0) {
  const visited = new Array(8).fill(false)
  const stack   = [start]
  const steps   = []
  const tree    = []
  steps.push({ type: 'push', node: start, stack: [start], visited: [...visited] })
  while (stack.length) {
    const cur = stack.pop()
    if (visited[cur]) {
      steps.push({ type: 'skip', node: cur, stack: [...stack], visited: [...visited] })
      continue
    }
    visited[cur] = true
    steps.push({ type: 'pop', node: cur, stack: [...stack], visited: [...visited] })
    for (const nb of [...ADJ[cur]].reverse()) {
      if (!visited[nb]) {
        stack.push(nb)
        tree.push([cur, nb])
        steps.push({ type: 'push', node: nb, stack: [...stack], visited: [...visited], from: cur })
      }
    }
  }
  return { steps, tree }
}

// ─── Reusable graph SVG ───────────────────────────────────────────────────────
function GraphSVG({ nodeColors, activeEdges, treeEdges, width = 440, height = 440 }) {
  const activeSet = new Set(activeEdges?.map(([a,b]) => `${Math.min(a,b)}-${Math.max(a,b)}`))
  const treeSet   = new Set(treeEdges?.map(([a,b]) => `${Math.min(a,b)}-${Math.max(a,b)}`))
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {GRAPH_EDGES.map(([a,b]) => {
        const key = `${Math.min(a,b)}-${Math.max(a,b)}`
        const isActive = activeSet.has(key)
        const isTree   = treeSet.has(key)
        const na = GRAPH_NODES[a], nb = GRAPH_NODES[b]
        return (
          <motion.line key={key}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={isActive ? C.edgeActive : isTree ? C.bfs : C.edge}
            strokeWidth={isActive ? 3 : isTree ? 2.5 : 1.5}
            strokeDasharray={isTree ? '0' : isActive ? '0' : '4 4'}
            animate={{ stroke: isActive ? C.edgeActive : isTree ? C.bfs : C.edge }}
            transition={{ duration: 0.3 }}
          />
        )
      })}
      {GRAPH_NODES.map(n => (
        <g key={n.id}>
          <motion.circle
            cx={n.x} cy={n.y} r={22}
            fill={nodeColors?.[n.id] ?? C.unvisited}
            stroke={nodeColors?.[n.id] === C.current ? C.edgeActive : '#cbd5e1'}
            strokeWidth={nodeColors?.[n.id] === C.current ? 3 : 1.5}
            animate={{ fill: nodeColors?.[n.id] ?? C.unvisited }}
            transition={{ duration: 0.3 }}
          />
          <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
            fontSize={14} fontWeight={700}
            fill={nodeColors?.[n.id] && nodeColors[n.id] !== C.unvisited ? '#fff' : '#475569'}>
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ─── Section 2 — BFS Visualizer ───────────────────────────────────────────────
function BFSVisualizer() {
  const { steps, tree } = buildBFSSteps(0)
  const [stepIdx, setStepIdx] = useState(-1)
  const [autoPlay, setAutoPlay] = useState(false)
  const intervalRef = useRef(null)

  const cur = stepIdx >= 0 ? steps[stepIdx] : null
  const orderSoFar = steps.slice(0, stepIdx + 1)
    .filter(s => s.type === 'dequeue')
    .map(s => GRAPH_NODES[s.node].label)
  const treeEdgesSoFar = steps.slice(0, stepIdx + 1)
    .filter(s => s.type === 'enqueue' && s.from !== undefined)
    .map(s => [s.from, s.node])

  const nodeColors = {}
  if (cur) {
    cur.visited.forEach((v, i) => {
      if (v) nodeColors[i] = C.bfs
    })
    if (cur.node !== undefined) nodeColors[cur.node] = C.current
    nodeColors[0] = nodeColors[0] || C.start
  }

  function step() { setStepIdx(p => Math.min(p + 1, steps.length - 1)) }
  function prevStep() { setStepIdx(p => Math.max(p - 1, -1)) }

  function toggleAuto() {
    if (autoPlay) {
      clearInterval(intervalRef.current)
      setAutoPlay(false)
    } else {
      setAutoPlay(true)
      intervalRef.current = setInterval(() => {
        setStepIdx(p => {
          if (p >= steps.length - 1) {
            clearInterval(intervalRef.current)
            setAutoPlay(false)
            return p
          }
          return p + 1
        })
      }, 600)
    }
  }

  function reset() {
    clearInterval(intervalRef.current)
    setAutoPlay(false)
    setStepIdx(-1)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const queueContents = cur ? cur.queue : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Graph */}
        <div>
          <GraphSVG nodeColors={nodeColors} treeEdges={treeEdgesSoFar} />
        </div>

        {/* Queue + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200 }}>
          {/* Queue */}
          <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.bfs, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>QUEUE</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>(front → back)</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 36 }}>
              {queueContents.length === 0
                ? <span style={{ color: '#94a3b8', fontSize: 13 }}>empty</span>
                : queueContents.map((n, i) => (
                  <motion.div key={i}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: i === 0 ? C.bfs : '#bfdbfe',
                      color: i === 0 ? '#fff' : '#1e40af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,
                    }}>
                    {GRAPH_NODES[n].label}
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Traversal order */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 10 }}>BFS Order</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {orderSoFar.map((lbl, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{
                    background: C.bfs, color: '#fff',
                    borderRadius: 20, padding: '4px 12px',
                    fontSize: 13, fontWeight: 700,
                  }}>
                  {i + 1}. {lbl}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Step description */}
          {cur && (
            <motion.div key={stepIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fefce8', border: '1.5px solid #fde68a', borderRadius: 14, padding: 14,
                fontSize: 14, color: '#713f12',
              }}>
              {cur.type === 'enqueue' && cur.from === undefined && `Enqueue start node ${GRAPH_NODES[cur.node].label}`}
              {cur.type === 'dequeue' && `Dequeue ${GRAPH_NODES[cur.node].label} — visit & check neighbors`}
              {cur.type === 'enqueue' && cur.from !== undefined && `Enqueue ${GRAPH_NODES[cur.node].label} (neighbor of ${GRAPH_NODES[cur.from].label})`}
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn onClick={prevStep} disabled={stepIdx < 0}>← Prev</Btn>
        <Btn onClick={step} disabled={stepIdx >= steps.length - 1} color={C.bfs}>Next Step →</Btn>
        <Btn onClick={toggleAuto} color={autoPlay ? '#ef4444' : '#22c55e'}>
          {autoPlay ? 'Pause' : 'Auto Play'}
        </Btn>
        <Btn onClick={reset}>Reset</Btn>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
        Step {Math.max(0, stepIdx + 1)} / {steps.length}
      </div>
    </div>
  )
}

// ─── Section 3 — DFS Visualizer ───────────────────────────────────────────────
function DFSVisualizer() {
  const { steps, tree } = buildDFSSteps(0)
  const [stepIdx, setStepIdx] = useState(-1)
  const [autoPlay, setAutoPlay] = useState(false)
  const intervalRef = useRef(null)

  const cur = stepIdx >= 0 ? steps[stepIdx] : null
  const orderSoFar = steps.slice(0, stepIdx + 1)
    .filter(s => s.type === 'pop')
    .map(s => GRAPH_NODES[s.node].label)
  const treeEdgesSoFar = steps.slice(0, stepIdx + 1)
    .filter(s => s.type === 'push' && s.from !== undefined)
    .map(s => [s.from, s.node])

  const nodeColors = {}
  if (cur) {
    cur.visited.forEach((v, i) => { if (v) nodeColors[i] = C.dfs })
    if (cur.node !== undefined && !cur.visited[cur.node]) nodeColors[cur.node] = C.current
    if (nodeColors[0] === undefined) nodeColors[0] = C.start
  }

  function step() { setStepIdx(p => Math.min(p + 1, steps.length - 1)) }
  function prevStep() { setStepIdx(p => Math.max(p - 1, -1)) }

  function toggleAuto() {
    if (autoPlay) {
      clearInterval(intervalRef.current)
      setAutoPlay(false)
    } else {
      setAutoPlay(true)
      intervalRef.current = setInterval(() => {
        setStepIdx(p => {
          if (p >= steps.length - 1) {
            clearInterval(intervalRef.current)
            setAutoPlay(false)
            return p
          }
          return p + 1
        })
      }, 600)
    }
  }

  function reset() {
    clearInterval(intervalRef.current)
    setAutoPlay(false)
    setStepIdx(-1)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const stackContents = cur ? [...cur.stack].reverse() : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Graph */}
        <div>
          <GraphSVG nodeColors={nodeColors} treeEdges={treeEdgesSoFar}
            activeEdges={[]} />
        </div>

        {/* Stack + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200 }}>
          {/* Stack */}
          <div style={{ background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.dfs, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>STACK</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>(top → bottom)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 36 }}>
              {stackContents.length === 0
                ? <span style={{ color: '#94a3b8', fontSize: 13 }}>empty</span>
                : stackContents.map((n, i) => (
                  <motion.div key={i}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{
                      height: 36, borderRadius: 8,
                      background: i === 0 ? C.dfs : '#e9d5ff',
                      color: i === 0 ? '#fff' : '#6b21a8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,
                    }}>
                    {GRAPH_NODES[n].label} {i === 0 ? '← TOP' : ''}
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Traversal order */}
          <div style={{ background: '#fdf4ff', border: '1.5px solid #e9d5ff', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.dfs, marginBottom: 10 }}>DFS Order</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {orderSoFar.map((lbl, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{
                    background: C.dfs, color: '#fff',
                    borderRadius: 20, padding: '4px 12px',
                    fontSize: 13, fontWeight: 700,
                  }}>
                  {i + 1}. {lbl}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Step description */}
          {cur && (
            <motion.div key={stepIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: 14, padding: 14,
                fontSize: 14, color: '#6b21a8',
              }}>
              {cur.type === 'push' && cur.from === undefined && `Push start node ${GRAPH_NODES[cur.node].label} onto stack`}
              {cur.type === 'pop' && `Pop ${GRAPH_NODES[cur.node].label} — visit & push neighbors`}
              {cur.type === 'push' && cur.from !== undefined && `Push ${GRAPH_NODES[cur.node].label} (neighbor of ${GRAPH_NODES[cur.from].label})`}
              {cur.type === 'skip' && `Skip ${GRAPH_NODES[cur.node].label} — already visited`}
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn onClick={prevStep} disabled={stepIdx < 0}>← Prev</Btn>
        <Btn onClick={step} disabled={stepIdx >= steps.length - 1} color={C.dfs}>Next Step →</Btn>
        <Btn onClick={toggleAuto} color={autoPlay ? '#ef4444' : '#22c55e'}>
          {autoPlay ? 'Pause' : 'Auto Play'}
        </Btn>
        <Btn onClick={reset}>Reset</Btn>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
        Step {Math.max(0, stepIdx + 1)} / {steps.length}
      </div>
    </div>
  )
}

// ─── Section 4 — BFS vs DFS Race ──────────────────────────────────────────────
function buildBFSRaceSteps() {
  const visited = new Array(8).fill(false)
  const queue = [0]
  visited[0] = true
  const states = [{ visited: [...visited], current: 0 }]
  while (queue.length) {
    const cur = queue.shift()
    for (const nb of ADJ[cur]) {
      if (!visited[nb]) {
        visited[nb] = true
        queue.push(nb)
        states.push({ visited: [...visited], current: nb })
      }
    }
  }
  return states
}

function buildDFSRaceSteps() {
  const visited = new Array(8).fill(false)
  const stack = [0]
  const states = [{ visited: [...visited], current: 0 }]
  while (stack.length) {
    const cur = stack.pop()
    if (visited[cur]) continue
    visited[cur] = true
    states.push({ visited: [...visited], current: cur })
    for (const nb of [...ADJ[cur]].reverse()) {
      if (!visited[nb]) stack.push(nb)
    }
  }
  return states
}

function RaceDemo() {
  const bfsStates = buildBFSRaceSteps()
  const dfsStates = buildDFSRaceSteps()
  const [tick, setTick] = useState(-1)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  const maxTick = Math.max(bfsStates.length, dfsStates.length) - 1

  function go() {
    setTick(0)
    setRunning(true)
    let t = 0
    intervalRef.current = setInterval(() => {
      t++
      if (t >= maxTick) {
        setTick(maxTick)
        setRunning(false)
        clearInterval(intervalRef.current)
      } else {
        setTick(t)
      }
    }, 500)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTick(-1)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  function getColors(states, color) {
    if (tick < 0) return {}
    const st = states[Math.min(tick, states.length - 1)]
    const colors = {}
    st.visited.forEach((v, i) => { if (v) colors[i] = color })
    if (!st.visited[st.current]) colors[st.current] = C.current
    return colors
  }

  const bfsColors = getColors(bfsStates, C.bfs)
  const dfsColors = getColors(dfsStates, C.dfs)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* BFS side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: `${C.bfs}18`, border: `2px solid ${C.bfs}`, borderRadius: 14,
            padding: '8px 28px', fontWeight: 700, color: C.bfs, fontSize: 15,
          }}>BFS — Level by Level</div>
          <GraphSVG nodeColors={bfsColors} width={380} height={380} />
          <div style={{ fontSize: 13, color: C.bfs, fontWeight: 600, textAlign: 'center' }}>
            Explores all neighbors before going deeper
          </div>
        </div>

        {/* VS badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 900, color: '#94a3b8',
          padding: '0 8px',
        }}>VS</div>

        {/* DFS side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: `${C.dfs}18`, border: `2px solid ${C.dfs}`, borderRadius: 14,
            padding: '8px 28px', fontWeight: 700, color: C.dfs, fontSize: 15,
          }}>DFS — Dive Deep</div>
          <GraphSVG nodeColors={dfsColors} width={380} height={380} />
          <div style={{ fontSize: 13, color: C.dfs, fontWeight: 600, textAlign: 'center' }}>
            Dives as deep as possible before backtracking
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <motion.button onClick={go} disabled={running}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          style={{
            padding: '12px 36px', borderRadius: 28,
            background: running ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none', color: '#fff', fontWeight: 700, fontSize: 16,
            cursor: running ? 'default' : 'pointer',
          }}>
          {running ? 'Racing...' : 'Go!'}
        </motion.button>
        <Btn onClick={reset}>Reset</Btn>
      </div>
    </div>
  )
}

// ─── Section 5 — Shortest Path with BFS (Indian Cities) ──────────────────────
const CITIES = [
  { id: 0, name: 'Delhi',     x: 200, y: 60  },
  { id: 1, name: 'Mumbai',    x: 60,  y: 230 },
  { id: 2, name: 'Kolkata',   x: 360, y: 130 },
  { id: 3, name: 'Bangalore', x: 120, y: 380 },
  { id: 4, name: 'Chennai',   x: 260, y: 380 },
  { id: 5, name: 'Hyderabad', x: 200, y: 280 },
  { id: 6, name: 'Pune',      x: 80,  y: 320 },
]
const FLIGHTS = [
  [0,1],[0,2],[0,5],
  [1,3],[1,6],[1,5],
  [2,4],[2,5],
  [3,4],[3,6],
  [4,5],
  [5,6],
]
const CITY_ADJ = Array.from({ length: 7 }, () => [])
FLIGHTS.forEach(([a,b]) => { CITY_ADJ[a].push(b); CITY_ADJ[b].push(a) })

function bfsCity(src, dst) {
  const visited = new Array(7).fill(false)
  const prev    = new Array(7).fill(-1)
  const queue   = [src]
  const levels  = [new Set([src])]
  visited[src] = true
  const levelMap = new Array(7).fill(-1)
  levelMap[src] = 0
  let lvl = 0
  while (queue.length) {
    const nextQueue = []
    let foundInLevel = false
    for (const cur of queue) {
      if (cur === dst) { foundInLevel = true; break }
      for (const nb of CITY_ADJ[cur]) {
        if (!visited[nb]) {
          visited[nb] = true
          prev[nb] = cur
          levelMap[nb] = lvl + 1
          nextQueue.push(nb)
        }
      }
    }
    if (foundInLevel) break
    if (nextQueue.length === 0) break
    lvl++
    levels.push(new Set(nextQueue))
    queue.splice(0, queue.length, ...nextQueue)
  }
  // trace path
  const path = []
  let cur = dst
  while (cur !== -1) {
    path.unshift(cur)
    cur = prev[cur]
  }
  return { path, levelMap, levels }
}

function CityGraph({ nodeColors, pathEdges, width = 450, height = 450 }) {
  const pathSet = new Set(pathEdges?.map(([a,b]) => `${Math.min(a,b)}-${Math.max(a,b)}`))
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {FLIGHTS.map(([a,b]) => {
        const key = `${Math.min(a,b)}-${Math.max(a,b)}`
        const isPath = pathSet.has(key)
        const ca = CITIES[a], cb = CITIES[b]
        return (
          <motion.line key={key}
            x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
            stroke={isPath ? C.path : '#cbd5e1'}
            strokeWidth={isPath ? 3.5 : 1.5}
            animate={{ stroke: isPath ? C.path : '#cbd5e1', strokeWidth: isPath ? 3.5 : 1.5 }}
            transition={{ duration: 0.4 }}
          />
        )
      })}
      {CITIES.map(n => {
        const color = nodeColors?.[n.id] ?? C.unvisited
        return (
          <g key={n.id}>
            <motion.circle cx={n.x} cy={n.y} r={28}
              fill={color}
              stroke={color === C.path ? '#16a34a' : '#94a3b8'}
              strokeWidth={color === C.path ? 3 : 1.5}
              animate={{ fill: color }}
              transition={{ duration: 0.35 }}
            />
            <text x={n.x} y={n.y - 2} textAnchor="middle" dominantBaseline="central"
              fontSize={10} fontWeight={700}
              fill={color !== C.unvisited ? '#fff' : '#475569'}>
              {n.name.length > 7 ? n.name.slice(0, 7) : n.name}
            </text>
            <text x={n.x} y={n.y + 12} textAnchor="middle"
              fontSize={9} fill={color !== C.unvisited ? '#ffffffaa' : '#94a3b8'}>
              {n.name.length > 7 ? n.name.slice(7) : ''}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function ShortestPathDemo() {
  const [src, setSrc] = useState(0)
  const [dst, setDst] = useState(4)
  const [result, setResult] = useState(null)
  const [animLevel, setAnimLevel] = useState(-1)
  const [running, setRunning] = useState(false)
  const cancelRef = useRef(false)

  async function findPath() {
    if (src === dst) return
    cancelRef.current = false
    setRunning(true)
    setResult(null)
    setAnimLevel(-1)

    const { path, levelMap, levels } = bfsCity(src, dst)

    for (let i = 0; i < levels.length; i++) {
      if (cancelRef.current) break
      setAnimLevel(i)
      await sleep(600)
    }
    if (!cancelRef.current) {
      setResult({ path, levelMap })
    }
    setRunning(false)
  }

  function reset() {
    cancelRef.current = true
    setResult(null)
    setAnimLevel(-1)
    setRunning(false)
  }

  const nodeColors = {}
  if (animLevel >= 0) {
    const { levels } = bfsCity(src, dst)
    levels.forEach((set, lvl) => {
      if (lvl <= animLevel) {
        set.forEach(n => {
          nodeColors[n] = lvl === 0 ? C.start : `hsl(${210 + lvl * 20}, 75%, ${55 - lvl * 5}%)`
        })
      }
    })
  }
  if (result) {
    result.path.forEach(n => { nodeColors[n] = C.path })
  }

  const pathEdges = result ? result.path.slice(0, -1).map((n, i) => [n, result.path[i + 1]]) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
      {/* City picker */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.start }}>Source City</label>
          <select value={src} onChange={e => { reset(); setSrc(+e.target.value) }}
            style={{
              padding: '8px 14px', borderRadius: 10, border: '2px solid #86efac',
              background: '#f0fdf4', color: '#166534', fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
            }}>
            {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.end }}>Destination City</label>
          <select value={dst} onChange={e => { reset(); setDst(+e.target.value) }}
            style={{
              padding: '8px 14px', borderRadius: 10, border: '2px solid #fca5a5',
              background: '#fef2f2', color: '#991b1b', fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
            }}>
            {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <CityGraph nodeColors={nodeColors} pathEdges={pathEdges} />

      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button onClick={findPath} disabled={running || src === dst}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          style={{
            padding: '10px 28px', borderRadius: 24,
            background: running || src === dst ? '#94a3b8' : C.bfs,
            border: 'none', color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: running || src === dst ? 'default' : 'pointer',
          }}>
          Find Shortest Path
        </motion.button>
        <Btn onClick={reset}>Reset</Btn>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 14,
            padding: '14px 24px', textAlign: 'center',
          }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#166534', marginBottom: 6 }}>
            Shortest Path — {result.path.length - 1} hop{result.path.length - 1 !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {result.path.map((n, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: C.path, color: '#fff', borderRadius: 20,
                  padding: '4px 12px', fontSize: 13, fontWeight: 700,
                }}>{CITIES[n].name}</span>
                {i < result.path.length - 1 && <span style={{ color: '#94a3b8' }}>→</span>}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Section 6 — When to Use Which ───────────────────────────────────────────
const USE_CASES = [
  {
    algo: 'BFS', color: C.bfs, bg: '#eff6ff', border: '#bfdbfe',
    icon: '🌊',
    cases: [
      { title: 'Shortest Path', desc: 'Fewest edges between two nodes (unweighted graphs)', icon: '📍' },
      { title: 'Level-Order Traversal', desc: 'Visit nodes level by level in a tree', icon: '🌳' },
      { title: 'Nearest Neighbor', desc: 'Find closest entity (nearest store, nearest friend)', icon: '📡' },
      { title: '6 Degrees of Separation', desc: 'Social network distance between people', icon: '🤝' },
    ],
    complexity: { time: 'O(V + E)', space: 'O(V)', structure: 'Queue' },
  },
  {
    algo: 'DFS', color: C.dfs, bg: '#faf5ff', border: '#e9d5ff',
    icon: '🕳️',
    cases: [
      { title: 'Cycle Detection', desc: 'Check if a graph has a cycle', icon: '🔄' },
      { title: 'Topological Sort', desc: 'Ordering tasks with dependencies', icon: '📋' },
      { title: 'Maze Solving', desc: 'Find any path through a maze', icon: '🧩' },
      { title: 'Connected Components', desc: 'Find all groups of connected nodes', icon: '🔗' },
    ],
    complexity: { time: 'O(V + E)', space: 'O(V)', structure: 'Stack' },
  },
]

function WhenToUse() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Cards */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {USE_CASES.map(alg => (
          <div key={alg.algo} style={{
            flex: '1 1 280px', maxWidth: 400,
            background: alg.bg, border: `2px solid ${alg.border}`,
            borderRadius: 20, overflow: 'hidden',
          }}>
            <div style={{
              background: alg.color, padding: '14px 22px',
              display: 'flex', alignItems: 'center', gap: 10,
              color: '#fff', fontWeight: 700, fontSize: 18,
            }}>
              <span style={{ fontSize: 22 }}>{alg.icon}</span>
              {alg.algo} Use Cases
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alg.cases.map((c, i) => (
                <motion.div key={i}
                  whileHover={{ scale: 1.02, x: 4 }}
                  style={{
                    background: '#fff', borderRadius: 12,
                    padding: '12px 16px',
                    border: `1px solid ${alg.border}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelected(selected?.title === c.title ? null : c)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: alg.color, fontSize: 14 }}>
                    <span>{c.icon}</span> {c.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{c.desc}</div>
                </motion.div>
              ))}
            </div>
            {/* Complexity badge */}
            <div style={{ padding: '0 18px 18px' }}>
              <div style={{
                background: `${alg.color}15`, border: `1px solid ${alg.border}`,
                borderRadius: 12, padding: '10px 16px',
                display: 'flex', gap: 16, justifyContent: 'space-around',
              }}>
                {[
                  ['Time', alg.complexity.time],
                  ['Space', alg.complexity.space],
                  ['Structure', alg.complexity.structure],
                ].map(([k, v]) => (
                  <div key={k} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: alg.color }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          padding: '12px 24px', color: '#fff', fontWeight: 700, fontSize: 15,
        }}>BFS vs DFS — Quick Comparison</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Property', 'BFS', 'DFS'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    borderBottom: '1px solid var(--border)',
                    color: h === 'BFS' ? C.bfs : h === 'DFS' ? C.dfs : '#1e293b',
                    fontWeight: 700,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Data Structure', 'Queue (FIFO)', 'Stack (LIFO)'],
                ['Traversal Order', 'Level by Level', 'Deep First'],
                ['Finds Shortest Path?', 'Yes (unweighted)', 'No (not guaranteed)'],
                ['Memory Usage', 'O(V) — can be large', 'O(V) — usually smaller'],
                ['Time Complexity', 'O(V + E)', 'O(V + E)'],
                ['Best For', 'Shortest path, nearest', 'Cycle detection, topo sort'],
                ['Completeness', 'Always finds if exists', 'May miss in infinite graphs'],
              ].map(([prop, b, d], i) => (
                <tr key={prop} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '10px 20px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #f1f5f9' }}>{prop}</td>
                  <td style={{ padding: '10px 20px', color: C.bfs, borderBottom: '1px solid #f1f5f9' }}>{b}</td>
                  <td style={{ padding: '10px 20px', color: C.dfs, borderBottom: '1px solid #f1f5f9' }}>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Reusable button ──────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, color = '#64748b' }) {
  return (
    <motion.button onClick={onClick} disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      style={{
        padding: '9px 20px', borderRadius: 22,
        background: disabled ? '#e2e8f0' : `${color}18`,
        border: `2px solid ${disabled ? '#e2e8f0' : color}`,
        color: disabled ? '#94a3b8' : color,
        fontWeight: 700, fontSize: 13,
        cursor: disabled ? 'default' : 'pointer',
      }}>
      {children}
    </motion.button>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Topic18Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)',
          border: '1px solid var(--border)',
          borderRadius: 22,
          padding: '36px 40px',
          marginBottom: 32,
          textAlign: 'center',
        }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌊</div>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800,
          color: 'var(--text-primary)', marginBottom: 12,
        }}>
          BFS &amp; DFS
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          Two ways to explore a graph — level-by-level like ripples in a pond,
          or deep-dive-first like going all-in on one path.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { color: C.bfs, label: 'BFS', sub: 'Breadth-First Search' },
            { color: C.dfs, label: 'DFS', sub: 'Depth-First Search' },
          ].map(({ color, label, sub }) => (
            <div key={label} style={{
              background: `${color}15`, border: `2px solid ${color}`,
              borderRadius: 14, padding: '10px 22px',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color }}>{label}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Section 1: The Maze Problem ── */}
      <SectionBlock icon="🗺️" title="The Maze Problem" color={C.bfs}>
        <Neuron mood="thinking" message="Imagine you're lost in a maze. You need to find the exit. Two strategies: explore everything nearby first (BFS), or keep going down one path until you're stuck (DFS). Same maze, totally different journeys!" />
        <div style={{ height: 20 }} />
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{
            flex: '1 1 240px', background: '#eff6ff', border: `2px solid ${C.bfs}`,
            borderRadius: 16, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🌊</div>
            <div style={{ fontWeight: 700, color: C.bfs, fontSize: 16, marginBottom: 6 }}>BFS — Ripple Strategy</div>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.65 }}>
              Check all cells at distance 1 first, then distance 2, then 3... Like ripples in a pond.
              Always finds the <strong>SHORTEST</strong> path.
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} style={{
            flex: '1 1 240px', background: '#faf5ff', border: `2px solid ${C.dfs}`,
            borderRadius: 16, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🕳️</div>
            <div style={{ fontWeight: 700, color: C.dfs, fontSize: 16, marginBottom: 6 }}>DFS — Deep Dive Strategy</div>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.65 }}>
              Pick one direction, keep going until you hit a wall, then backtrack.
              Goes deep before going wide. Finds <strong>a path</strong>, not necessarily shortest.
            </div>
          </motion.div>
        </div>
        <InteractiveDemo title="Maze Explorer" instruction="Choose BFS or DFS, then click Run to watch the exploration patterns">
          <MazeProblem />
        </InteractiveDemo>
        <NeuronTip type="tip">
          Notice how BFS fills the maze in concentric waves, while DFS shoots down one corridor before exploring others. BFS always guarantees the shortest path!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 2: BFS Visualizer ── */}
      <SectionBlock icon="🔵" title="BFS Visualizer — Queue-Powered" color={C.bfs}>
        <Neuron mood="explaining" message="BFS uses a QUEUE — First In, First Out. Think of it like a ticket queue at a concert. Node A enters first, gets processed first. That's why BFS visits nodes level by level — near nodes are always processed before far ones." />
        <div style={{ height: 16 }} />

        {/* BFS algorithm steps */}
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24,
          justifyContent: 'center',
        }}>
          {[
            ['1', 'Enqueue source'],
            ['2', 'Dequeue front'],
            ['3', 'Visit + mark'],
            ['4', 'Enqueue unvisited neighbors'],
            ['5', 'Repeat until empty'],
          ].map(([n, t]) => (
            <div key={n} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#eff6ff', border: `1px solid ${C.bfs}44`,
              borderRadius: 30, padding: '8px 16px',
              fontSize: 13, fontWeight: 600, color: C.bfs,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: C.bfs,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{n}</div>
              {t}
            </div>
          ))}
        </div>

        <InteractiveDemo title="BFS Step-by-Step" instruction="Click 'Next Step' to advance or 'Auto Play' to watch the queue work">
          <BFSVisualizer />
        </InteractiveDemo>

        <NeuronTip type="simple">
          The QUEUE is the secret sauce of BFS. By always processing the oldest-enqueued node first, BFS guarantees it visits closer nodes before farther ones — that's the shortest path guarantee!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 3: DFS Visualizer ── */}
      <SectionBlock icon="🟣" title="DFS Visualizer — Stack-Powered" color={C.dfs}>
        <Neuron mood="excited" message="DFS uses a STACK — Last In, First Out. The most recently discovered node gets explored next. This makes DFS keep going deeper and deeper until it can't go further, then it backtracks to try other paths." />
        <div style={{ height: 16 }} />

        {/* DFS algorithm steps */}
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24,
          justifyContent: 'center',
        }}>
          {[
            ['1', 'Push source'],
            ['2', 'Pop top'],
            ['3', 'Visit + mark'],
            ['4', 'Push unvisited neighbors'],
            ['5', 'Repeat until empty'],
          ].map(([n, t]) => (
            <div key={n} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#faf5ff', border: `1px solid ${C.dfs}44`,
              borderRadius: 30, padding: '8px 16px',
              fontSize: 13, fontWeight: 600, color: C.dfs,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: C.dfs,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
              }}>{n}</div>
              {t}
            </div>
          ))}
        </div>

        <InteractiveDemo title="DFS Step-by-Step" instruction="Watch how DFS dives deep — notice the call stack growing and shrinking">
          <DFSVisualizer />
        </InteractiveDemo>

        <NeuronTip type="deep">
          DFS and recursion are twins. When you write a recursive DFS, the function call stack IS the stack. That's why recursive DFS is so natural — the computer's own call stack handles the backtracking automatically!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 4: Race ── */}
      <SectionBlock icon="🏁" title="BFS vs DFS Race — Side by Side" color="#f59e0b">
        <Neuron mood="excited" message="Same graph, same starting node — but watch how differently they explore! BFS fans out like a shockwave, DFS shoots down like an arrow. Hit 'Go!' and watch the race!" />
        <div style={{ height: 16 }} />
        <InteractiveDemo title="The Race" instruction="Click Go! and observe the exploration patterns side by side">
          <RaceDemo />
        </InteractiveDemo>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <motion.div whileHover={{ scale: 1.02 }} style={{
            flex: '1 1 200px', background: '#eff6ff', borderRadius: 14, padding: '14px 18px',
            border: `1.5px solid ${C.bfs}44`,
          }}>
            <div style={{ fontWeight: 700, color: C.bfs, marginBottom: 6, fontSize: 14 }}>BFS Key Insight</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
              Nodes at level 1 are fully explored before any level-2 node is touched.
              Forms concentric rings from the source.
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} style={{
            flex: '1 1 200px', background: '#faf5ff', borderRadius: 14, padding: '14px 18px',
            border: `1.5px solid ${C.dfs}44`,
          }}>
            <div style={{ fontWeight: 700, color: C.dfs, marginBottom: 6, fontSize: 14 }}>DFS Key Insight</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
              DFS can reach a distant leaf before even visiting a close neighbor!
              It commits deeply to one branch before exploring alternatives.
            </div>
          </motion.div>
        </div>
      </SectionBlock>

      {/* ── Section 5: Shortest Path ── */}
      <SectionBlock icon="✈️" title="Shortest Path with BFS — Indian Cities" color={C.path}>
        <Neuron mood="waving" message="Let's use BFS on a real-world graph — Indian cities connected by flights. Each edge = one flight. BFS will find the route with the FEWEST flights (hops). Pick source and destination!" />
        <div style={{ height: 16 }} />
        <InteractiveDemo title="Flight Route Finder" instruction="Select source and destination cities, then find the shortest path by hops">
          <ShortestPathDemo />
        </InteractiveDemo>
        <NeuronTip type="warning">
          BFS finds shortest path in terms of number of edges (hops), NOT total distance or travel time. For weighted graphs (where each edge has a cost), you'd need Dijkstra's algorithm instead!
        </NeuronTip>
        <NeuronTip type="example">
          This is exactly how WhatsApp's "degrees of separation" works — BFS from your profile to find how many mutual connections exist between you and a stranger. Facebook used this to show "2 mutual friends."
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 6: When to Use ── */}
      <SectionBlock icon="🧭" title="When to Use Which?" color="#f59e0b">
        <Neuron mood="thinking" message="The hardest part of interviews isn't coding BFS or DFS — it's knowing WHICH one to use! Here's your decision guide. When you see 'shortest path' or 'minimum hops', think BFS. When you see 'cycle', 'any path', or 'topological', think DFS." />
        <div style={{ height: 20 }} />
        <WhenToUse />
        <div style={{ height: 16 }} />
        <NeuronTip type="try">
          Decision rule: "Shortest path or nearest?" → BFS with Queue. "Cycle detection or any path?" → DFS with Stack. Both have the same O(V+E) time complexity, so the choice is purely about what you need!
        </NeuronTip>
      </SectionBlock>

      {/* ── Section 7: Hindi Summary ── */}
      <SectionBlock icon="🇮🇳" title="Hindi Mein Samjho" color="#ff9933">
        <Neuron mood="happy" message="BFS aur DFS — dono graph explore karne ke tarike hain. Fark sirf yeh hai ki kaun pehle kaahan jaata hai!" />
        <div style={{ height: 16 }} />
        <HindiExplainer
          concept="BFS aur DFS"
          english="Breadth-First Search & Depth-First Search"
          explanation="BFS paani ki leher jaisi hoti hai — ek pathar daalo, leherein charo taraf failti jaati hain, pehle paas ke, phir door ke. DFS ek raste mein gahre jaata hai — jab tak ruk na jaao, tab tak andar jaao, aur phir wapas aao (backtrack). BFS shortest path dhundhta hai kyunki woh pehle close waale nodes visit karta hai. DFS maze solve karta hai ya cycle dhundhta hai kyunki woh ek raste ko poora follow karta hai."
          example="BFS: Socho tum ek school mein naye ho. Pehle apni class ke logon ko jaano (level 1), phir unke doston ko (level 2), phir unke doston ke doston ko (level 3). DFS: Socho tum ek library mein ek kitaab dhundh rahe ho — shelf A se shuru karo, A1 section mein jaao, uske andar tak jaao, waapas aao, A2 section mein jaao... isi tarah."
          terms={[
            { hindi: 'BFS — चौड़ाई-पहले खोज', english: 'Breadth-First Search', meaning: 'Level-by-level exploration, paas se door' },
            { hindi: 'DFS — गहराई-पहले खोज', english: 'Depth-First Search', meaning: 'Ek raste mein gehre jaao, phir wapas' },
            { hindi: 'Queue — कतार', english: 'Queue (FIFO)', meaning: 'BFS ka data structure — pehle aao pehle jaao' },
            { hindi: 'Stack — ढेर', english: 'Stack (LIFO)', meaning: 'DFS ka data structure — aakhir mein aao, pehle jaao' },
            { hindi: 'Backtrack — वापस लौटो', english: 'Backtrack', meaning: 'Jab raasta band ho, pichhe jaao aur doosra try karo' },
            { hindi: 'Shortest Path — सबसे छोटा रास्ता', english: 'Shortest Path', meaning: 'Kam se kam hops mein source se destination' },
          ]}
        />
        <div style={{ height: 24 }} />

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            {
              title: 'BFS याद रखो',
              color: C.bfs,
              points: [
                'Queue (FIFO) use karta hai',
                'Level by level jaata hai',
                'Shortest path guarantee',
                'Jab "minimum hops" puchen',
              ],
            },
            {
              title: 'DFS याद रखो',
              color: C.dfs,
              points: [
                'Stack (LIFO) use karta hai',
                'Deep first jaata hai',
                'Backtrack karta hai',
                'Jab cycle ya koi bhi path puchen',
              ],
            },
          ].map(({ title, color, points }) => (
            <motion.div key={title} whileHover={{ scale: 1.02 }} style={{
              flex: '1 1 220px',
              background: `${color}10`, border: `2px solid ${color}44`,
              borderRadius: 16, padding: '18px 22px',
            }}>
              <div style={{ fontWeight: 800, color, fontSize: 16, marginBottom: 12 }}>{title}</div>
              {points.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color, fontWeight: 700, fontSize: 14, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </SectionBlock>

    </div>
  )
}
