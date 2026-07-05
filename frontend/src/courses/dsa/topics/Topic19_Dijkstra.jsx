import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 19 — Dijkstra's Shortest Path
   How Google Maps finds the fastest route — the algorithm that powers GPS.
   Visual-first, interactive, NO text walls.
================================================================ */

/* ---- Graph data: Indian cities ---- */
const CITIES = {
  DEL: { id: 'DEL', name: 'Delhi',     x: 340, y: 80  },
  JAI: { id: 'JAI', name: 'Jaipur',    x: 180, y: 220 },
  AGR: { id: 'AGR', name: 'Agra',      x: 420, y: 220 },
  LKO: { id: 'LKO', name: 'Lucknow',   x: 560, y: 160 },
  KAN: { id: 'KAN', name: 'Kanpur',    x: 520, y: 280 },
  VAR: { id: 'VAR', name: 'Varanasi',  x: 660, y: 300 },
  MUM: { id: 'MUM', name: 'Mumbai',    x: 120, y: 440 },
  HYD: { id: 'HYD', name: 'Hyderabad', x: 300, y: 460 },
}

const EDGES = [
  { from: 'DEL', to: 'JAI', weight: 280 },
  { from: 'DEL', to: 'AGR', weight: 200 },
  { from: 'DEL', to: 'LKO', weight: 500 },
  { from: 'JAI', to: 'AGR', weight: 240 },
  { from: 'JAI', to: 'MUM', weight: 1150 },
  { from: 'AGR', to: 'KAN', weight: 300 },
  { from: 'AGR', to: 'LKO', weight: 340 },
  { from: 'LKO', to: 'KAN', weight: 80  },
  { from: 'LKO', to: 'VAR', weight: 320 },
  { from: 'KAN', to: 'VAR', weight: 320 },
  { from: 'MUM', to: 'HYD', weight: 710 },
  { from: 'HYD', to: 'VAR', weight: 830 },
  { from: 'JAI', to: 'HYD', weight: 1300},
]

/* Build adjacency list */
function buildAdj(edges) {
  const adj = {}
  Object.keys(CITIES).forEach(id => { adj[id] = [] })
  edges.forEach(({ from, to, weight }) => {
    adj[from].push({ to, weight })
    adj[to].push({ from: to, to: from, weight })
  })
  return adj
}

/* ----------------------------------------------------------------
   Run full Dijkstra and return all snapshots (for step replay)
---------------------------------------------------------------- */
function runDijkstra(src, dst, edges) {
  const adj = buildAdj(edges)
  const dist = {}
  const prev = {}
  const visited = new Set()
  Object.keys(CITIES).forEach(id => { dist[id] = Infinity; prev[id] = null })
  dist[src] = 0

  const snapshots = []
  const pq = [{ id: src, d: 0 }]   // simple array min-heap simulation

  const snap = (current, relaxed) => {
    snapshots.push({
      dist: { ...dist },
      visited: new Set(visited),
      current,
      relaxed,
      pq: pq.slice().sort((a, b) => a.d - b.d),
    })
  }

  snap(null, null)

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d)
    const { id: u } = pq.shift()
    if (visited.has(u)) continue
    visited.add(u)
    snap(u, null)
    if (u === dst) break

    for (const { to: v, weight } of adj[u]) {
      if (!visited.has(v)) {
        const nd = dist[u] + weight
        if (nd < dist[v]) {
          dist[v] = nd
          prev[v] = u
          pq.push({ id: v, d: nd })
          snap(u, v)
        }
      }
    }
  }

  /* Reconstruct path */
  const path = []
  let cur = dst
  while (cur) { path.unshift(cur); cur = prev[cur] }
  if (path[0] !== src) return { snapshots, path: [], dist }
  return { snapshots, path, dist }
}

/* ================================================================
   SVG Graph Component
================================================================ */
function CityGraph({
  width = 720, height = 520,
  dist, visited, current, relaxed,
  path = [], highlightEdges = [],
  onCityClick,
  source, destination,
  negativeEdge = null,
}) {
  const adj = buildAdj(EDGES)

  const edgeColor = (from, to) => {
    const inPath = path.length > 1 && path.some((n, i) =>
      i < path.length - 1 &&
      ((path[i] === from && path[i + 1] === to) || (path[i] === to && path[i + 1] === from))
    )
    if (inPath) return '#22c55e'
    const isHighlight = highlightEdges.some(e =>
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    )
    if (isHighlight) return '#f59e0b'
    return '#cbd5e1'
  }

  const edgeWidth = (from, to) => {
    const inPath = path.length > 1 && path.some((n, i) =>
      i < path.length - 1 &&
      ((path[i] === from && path[i + 1] === to) || (path[i] === to && path[i + 1] === from))
    )
    return inPath ? 4 : 2
  }

  const nodeColor = (id) => {
    if (id === current) return '#fbbf24'
    if (id === source) return '#6366f1'
    if (id === destination) return '#ec4899'
    if (visited && visited.has(id)) return '#22c55e'
    if (relaxed === id) return '#f97316'
    return '#3b82f6'
  }

  const displayDist = (id) => {
    if (!dist) return ''
    const d = dist[id]
    if (d === undefined || d === Infinity) return '∞'
    return d
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Edges */}
      {EDGES.map((e, i) => {
        const a = CITIES[e.from]
        const b = CITIES[e.to]
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const col = (negativeEdge && e === negativeEdge) ? '#ef4444' : edgeColor(e.from, e.to)
        const w = (negativeEdge && e === negativeEdge) ? 3 : edgeWidth(e.from, e.to)
        return (
          <g key={i}>
            <motion.line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={col} strokeWidth={w}
              strokeLinecap="round"
              animate={{ stroke: col }}
              transition={{ duration: 0.4 }}
            />
            <rect
              x={mx - 18} y={my - 11} width={36} height={20}
              rx={6} fill="white" opacity={0.88}
            />
            <text
              x={mx} y={my + 4}
              textAnchor="middle"
              fontSize={11} fontWeight={700}
              fill={(negativeEdge && e === negativeEdge) ? '#ef4444' : '#475569'}
            >
              {(negativeEdge && e === negativeEdge) ? e.weight : e.weight}
            </text>
          </g>
        )
      })}

      {/* Nodes */}
      {Object.values(CITIES).map(city => {
        const col = nodeColor(city.id)
        const d = displayDist(city.id)
        const isSource = city.id === source
        const isDest = city.id === destination
        const isCurrent = city.id === current
        return (
          <g
            key={city.id}
            onClick={() => onCityClick && onCityClick(city.id)}
            style={{ cursor: onCityClick ? 'pointer' : 'default' }}
          >
            {isCurrent && (
              <motion.circle
                cx={city.x} cy={city.y} r={28}
                fill="none" stroke="#fbbf24" strokeWidth={3} opacity={0.6}
                animate={{ r: [28, 34, 28], opacity: [0.6, 0.2, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            )}
            <motion.circle
              cx={city.x} cy={city.y} r={22}
              fill={col}
              animate={{ fill: col }}
              transition={{ duration: 0.4 }}
              stroke={isDest ? '#be185d' : isSource ? '#3730a3' : '#fff'}
              strokeWidth={isDest || isSource ? 3 : 1.5}
            />
            <text x={city.x} y={city.y + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">
              {city.id}
            </text>
            {/* City name label */}
            <text x={city.x} y={city.y + 38} textAnchor="middle" fontSize={11} fontWeight={600} fill="#334155">
              {city.name}
            </text>
            {/* Distance badge */}
            {dist && (
              <motion.g
                key={`dist-${city.id}-${d}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <rect x={city.x - 16} y={city.y - 42} width={32} height={18} rx={6}
                  fill={d === '∞' ? '#e2e8f0' : '#1e293b'} />
                <text x={city.x} y={city.y - 29} textAnchor="middle" fontSize={10} fontWeight={800}
                  fill={d === '∞' ? '#94a3b8' : '#fff'}>
                  {d}
                </text>
              </motion.g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ================================================================
   SECTION 1 — Why BFS Isn't Enough
================================================================ */
function BFSVsDijkstra() {
  const [mode, setMode] = useState(null) // 'bfs' | 'dijkstra'

  /* Simple 4-city subgraph: DEL, JAI, AGR, BFS-demo */
  const demoEdges = [
    { from: 'DEL', to: 'JAI', weight: 280, label: '280 km' },
    { from: 'DEL', to: 'AGR', weight: 200, label: '200 km' },
    { from: 'AGR', to: 'JAI', weight: 240, label: '240 km' },
  ]
  // BFS path DEL→JAI: direct (1 hop, 280 km)
  // Dijkstra path DEL→JAI: DEL→AGR→JAI (2 hops, 440 km) — wait, let's verify:
  // DEL→JAI = 280, DEL→AGR→JAI = 200+240=440. So BFS and Dijkstra agree here.
  // Let's use a different example: DEL→AGR direct=200, DEL→JAI→AGR=280+240=520
  // For BFS vs Dijkstra mismatch, we need unequal weights.
  // Classic: Path A: 1 hop, weight 500.  Path B: 2 hops, weights 1+1 = 2.
  // BFS picks A (fewer hops). Dijkstra picks B (lower weight).

  const nodes = {
    S: { x: 100, y: 180, name: 'Start' },
    M: { x: 400, y: 80,  name: 'Middle' },
    D: { x: 700, y: 180, name: 'Dest'  },
  }
  const demoE = [
    { from: 'S', to: 'D', weight: 500 },  // 1 hop
    { from: 'S', to: 'M', weight: 1  },   // 2 hops total
    { from: 'M', to: 'D', weight: 1  },
  ]

  const bfsPath = ['S', 'D']        // 1 hop
  const dijkPath = ['S', 'M', 'D']  // 2 hops, weight 2

  const activePath = mode === 'bfs' ? bfsPath : mode === 'dijkstra' ? dijkPath : []

  const getNodeColor = (id) => {
    if (activePath.includes(id)) {
      if (mode === 'bfs') return '#3b82f6'
      return '#22c55e'
    }
    return '#94a3b8'
  }

  const getEdgeColor = (from, to) => {
    for (let i = 0; i < activePath.length - 1; i++) {
      if ((activePath[i] === from && activePath[i+1] === to) ||
          (activePath[i] === to && activePath[i+1] === from)) {
        return mode === 'bfs' ? '#3b82f6' : '#22c55e'
      }
    }
    return '#e2e8f0'
  }

  return (
    <SectionBlock icon="🗺️" title="Why BFS Isn't Enough">
      <Neuron mood="thinking" message="BFS finds the path with fewest edges — but what if roads have different distances? Fewest roads ≠ shortest distance!" />

      <div style={{ margin: '28px 0 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>Pick an algorithm:</span>
        <button
          onClick={() => setMode('bfs')}
          style={{
            padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14,
            background: mode === 'bfs' ? '#3b82f6' : '#eff6ff',
            color: mode === 'bfs' ? '#fff' : '#3b82f6',
            border: '2px solid #3b82f6', cursor: 'pointer',
          }}
        >
          BFS (Fewest Hops)
        </button>
        <button
          onClick={() => setMode('dijkstra')}
          style={{
            padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14,
            background: mode === 'dijkstra' ? '#22c55e' : '#f0fdf4',
            color: mode === 'dijkstra' ? '#fff' : '#16a34a',
            border: '2px solid #22c55e', cursor: 'pointer',
          }}
        >
          Dijkstra (Lowest Weight)
        </button>
        <button
          onClick={() => setMode(null)}
          style={{
            padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 13,
            background: '#f1f5f9', color: '#64748b',
            border: '2px solid #e2e8f0', cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {/* Custom SVG */}
      <div style={{ background: '#f8fafc', borderRadius: 16, padding: '20px 10px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <svg viewBox="0 0 800 280" style={{ width: '100%', maxWidth: 800, display: 'block', margin: '0 auto' }}>
          {demoE.map((e, i) => {
            const a = nodes[e.from]
            const b = nodes[e.to]
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            const col = getEdgeColor(e.from, e.to)
            const isActive = col !== '#e2e8f0'
            return (
              <g key={i}>
                <motion.line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={col} strokeWidth={isActive ? 5 : 2}
                  animate={{ stroke: col }} transition={{ duration: 0.4 }}
                  strokeLinecap="round"
                />
                <rect x={mx - 24} y={my - 14} width={48} height={22} rx={8} fill="white" opacity={0.92} />
                <text x={mx} y={my + 3} textAnchor="middle" fontSize={13} fontWeight={700} fill="#475569">
                  {e.weight} km
                </text>
              </g>
            )
          })}
          {Object.entries(nodes).map(([id, node]) => (
            <g key={id}>
              <motion.circle
                cx={node.x} cy={node.y} r={26}
                fill={getNodeColor(id)}
                animate={{ fill: getNodeColor(id) }}
                transition={{ duration: 0.4 }}
                stroke="#fff" strokeWidth={3}
              />
              <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">
                {id}
              </text>
              <text x={node.x} y={node.y + 46} textAnchor="middle" fontSize={13} fontWeight={600} fill="#334155">
                {node.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {mode && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              marginTop: 20,
              background: mode === 'bfs' ? '#eff6ff' : '#f0fdf4',
              border: `2px solid ${mode === 'bfs' ? '#93c5fd' : '#86efac'}`,
              borderRadius: 14, padding: '18px 22px',
              display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: 28 }}>{mode === 'bfs' ? '🔵' : '🟢'}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: mode === 'bfs' ? '#1d4ed8' : '#15803d', marginBottom: 6 }}>
                {mode === 'bfs' ? 'BFS picks: Start → Dest (1 hop, 500 km)' : 'Dijkstra picks: Start → Middle → Dest (2 hops, 2 km)'}
              </div>
              <div style={{ fontSize: 14, color: '#475569' }}>
                {mode === 'bfs'
                  ? 'BFS counts HOPS, not distances. It found the direct road (1 hop) — but at 500 km!'
                  : 'Dijkstra sees the total weight: 1+1 = 2 km via Middle, far cheaper than 500 km direct!'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronTip type="tip">
        BFS treats every edge as equal weight. When edges have different weights (like road distances), we need a smarter algorithm that considers those weights.
      </NeuronTip>

      <HindiExplainer
        concept="BFS क्यों काफी नहीं?"
        english="Why BFS is not enough?"
        explanation="BFS सबसे कम edges वाला रास्ता ढूंढता है — लेकिन real life में हर road की अलग दूरी होती है। 1 road पर 500 km vs 2 roads पर 2 km — BFS गलत रास्ता चुनेगा! इसीलिए Dijkstra चाहिए।"
        example="Delhi से Jaipur: एक सीधी road है 500 km की, और एक रास्ता है Agra होते हुए 200+240=440 km का। BFS सीधा रास्ता चुनेगा (1 hop), लेकिन वो लंबा है!"
        terms={[]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 2 — Dijkstra's Algorithm Visualizer
================================================================ */
function DijkstraVisualizer() {
  const [source] = useState('DEL')
  const [destination] = useState('VAR')
  const [snapshots, setSnapshots] = useState([])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(900)
  const [finalPath, setFinalPath] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    const { snapshots: snaps, path } = runDijkstra(source, destination, EDGES)
    setSnapshots(snaps)
    setFinalPath(path)
    setStep(0)
    setPlaying(false)
  }, [source, destination])

  const cur = snapshots[step] || { dist: null, visited: new Set(), current: null, relaxed: null, pq: [] }
  const isDone = step === snapshots.length - 1

  useEffect(() => {
    if (playing && !isDone) {
      timerRef.current = setTimeout(() => setStep(s => s + 1), speed)
    } else if (isDone) {
      setPlaying(false)
    }
    return () => clearTimeout(timerRef.current)
  }, [playing, step, isDone, speed])

  const reset = () => { setStep(0); setPlaying(false) }

  const pqItems = (cur.pq || []).slice(0, 6)

  return (
    <SectionBlock icon="🧭" title="Dijkstra's Algorithm — Live Visualizer">
      <Neuron mood="excited" message={`Watching Dijkstra find the shortest path from Delhi to Varanasi! Source starts at distance 0. Everyone else is ∞ (infinity). Let's go step by step!`} />

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '20px 0 10px', fontSize: 13 }}>
        {[
          { color: '#6366f1', label: 'Source' },
          { color: '#ec4899', label: 'Destination' },
          { color: '#fbbf24', label: 'Current' },
          { color: '#22c55e', label: 'Visited' },
          { color: '#f97316', label: 'Relaxed' },
          { color: '#3b82f6', label: 'Unvisited' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
            <span style={{ color: '#475569', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Main graph */}
      <div style={{ background: '#f8fafc', borderRadius: 18, padding: '12px 8px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <CityGraph
          dist={cur.dist}
          visited={cur.visited}
          current={cur.current}
          relaxed={cur.relaxed}
          path={isDone ? finalPath : []}
          source={source}
          destination={destination}
        />
      </div>

      {/* Step info + PQ side by side */}
      <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
        {/* Step info */}
        <div style={{
          flex: 1, minWidth: 220,
          background: '#1e293b', borderRadius: 14, padding: '18px 20px', color: '#e2e8f0',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 12, letterSpacing: 1 }}>
            STEP {step} / {snapshots.length - 1}
          </div>
          {cur.current ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>
                Processing: {CITIES[cur.current]?.name} ({cur.current})
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                Current distance: {cur.dist?.[cur.current] === Infinity ? '∞' : cur.dist?.[cur.current]} km
              </div>
              {cur.relaxed && (
                <div style={{ fontSize: 13, color: '#f97316', marginTop: 8 }}>
                  Updated: {CITIES[cur.relaxed]?.name} → {cur.dist?.[cur.relaxed]} km
                </div>
              )}
              {isDone && (
                <div style={{ fontSize: 13, color: '#22c55e', marginTop: 10, fontWeight: 700 }}>
                  Shortest path: {finalPath.join(' → ')}<br />
                  Total: {cur.dist?.[destination]} km
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 14, color: '#94a3b8' }}>
              Initializing... Source ({source}) = 0, all others = ∞
            </div>
          )}
        </div>

        {/* Priority Queue */}
        <div style={{
          flex: 1, minWidth: 200,
          background: '#fef3c7', borderRadius: 14, padding: '18px 20px',
          border: '1px solid #fde68a',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 12, letterSpacing: 1 }}>
            PRIORITY QUEUE (min-heap)
          </div>
          {pqItems.length === 0 ? (
            <div style={{ fontSize: 13, color: '#a16207' }}>Empty</div>
          ) : (
            pqItems.map((item, i) => (
              <motion.div
                key={`${item.id}-${item.d}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  padding: '6px 0', borderBottom: i < pqItems.length - 1 ? '1px solid #fde68a' : 'none',
                }}
              >
                <div style={{
                  background: i === 0 ? '#f59e0b' : '#fde68a',
                  color: i === 0 ? '#fff' : '#92400e',
                  fontWeight: 700, fontSize: 12,
                  borderRadius: 6, padding: '2px 8px', minWidth: 36, textAlign: 'center',
                }}>
                  {item.d === Infinity ? '∞' : item.d}
                </div>
                <span style={{ fontSize: 13, color: '#78350f', fontWeight: 600 }}>
                  {CITIES[item.id]?.name}
                </span>
                {i === 0 && <span style={{ fontSize: 11, color: '#d97706' }}>← next</span>}
              </motion.div>
            ))
          )}
        </div>

        {/* Visited set */}
        <div style={{
          flex: 1, minWidth: 200,
          background: '#f0fdf4', borderRadius: 14, padding: '18px 20px',
          border: '1px solid #86efac',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 12, letterSpacing: 1 }}>
            VISITED SET
          </div>
          {cur.visited?.size === 0 ? (
            <div style={{ fontSize: 13, color: '#4ade80' }}>None yet</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[...cur.visited].map(id => (
                <motion.div
                  key={id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    background: '#22c55e', color: '#fff',
                    fontWeight: 700, fontSize: 12,
                    borderRadius: 8, padding: '4px 10px',
                  }}
                >
                  {id}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={reset}
          style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: '#f1f5f9', color: '#475569', border: '2px solid #e2e8f0', cursor: 'pointer' }}
        >
          Reset
        </button>
        <button
          disabled={step === 0}
          onClick={() => setStep(s => Math.max(0, s - 1))}
          style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: '#eff6ff', color: '#3b82f6', border: '2px solid #93c5fd', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.5 : 1 }}
        >
          ← Prev
        </button>
        <button
          disabled={isDone}
          onClick={() => setStep(s => Math.min(snapshots.length - 1, s + 1))}
          style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: '#eff6ff', color: '#3b82f6', border: '2px solid #93c5fd', cursor: isDone ? 'not-allowed' : 'pointer', opacity: isDone ? 0.5 : 1 }}
        >
          Next →
        </button>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{
            padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14,
            background: playing ? '#ef4444' : '#6366f1', color: '#fff',
            border: 'none', cursor: 'pointer',
          }}
        >
          {playing ? 'Pause' : isDone ? 'Restart' : 'Auto Play'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Speed:</span>
          <input
            type="range" min={200} max={1500} step={100} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ width: 100, accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: 12, color: '#64748b' }}>{speed}ms</span>
        </div>
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 3 — The Relaxation Step
================================================================ */
function RelaxationDemo() {
  const examples = [
    { nodeA: 'A', nodeB: 'B', distA: 5, edgeW: 3, oldDistB: Infinity, newDistB: 8, better: true },
    { nodeA: 'A', nodeB: 'B', distA: 5, edgeW: 3, oldDistB: 15, newDistB: 8, better: true },
    { nodeA: 'A', nodeB: 'B', distA: 5, edgeW: 3, oldDistB: 6, newDistB: 8, better: false },
    { nodeA: 'C', nodeB: 'D', distA: 12, edgeW: 4, oldDistB: 20, newDistB: 16, better: true },
  ]
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const ex = examples[idx]

  const next = () => { setIdx((idx + 1) % examples.length); setRevealed(false) }
  const prev = () => { setIdx((idx - 1 + examples.length) % examples.length); setRevealed(false) }

  return (
    <SectionBlock icon="⚡" title="The Relaxation Step — Heart of Dijkstra">
      <Neuron mood="explaining" message="Relaxation = 'Can I reach this neighbor CHEAPER through the current node?' If yes → UPDATE the distance! This is done for every neighbor, every time we visit a node." />

      {/* Formula visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          borderRadius: 18, padding: '28px 32px', margin: '24px 0',
          textAlign: 'center', color: '#e2e8f0',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, letterSpacing: 1 }}>THE RELAXATION FORMULA</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24', marginBottom: 10 }}>
          new_dist = dist[current] + edge_weight
        </div>
        <div style={{ fontSize: 18, color: '#86efac', fontWeight: 600 }}>
          if new_dist &lt; dist[neighbor]:
        </div>
        <div style={{ fontSize: 18, color: '#60a5fa', fontWeight: 600, paddingLeft: 32 }}>
          dist[neighbor] = new_dist  ✓ UPDATE!
        </div>
      </motion.div>

      {/* Interactive examples */}
      <InteractiveDemo title="Relaxation Explorer" instruction="See the relaxation step in action — step through examples">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'stretch' }}>
          {/* Graph visual */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <svg viewBox="0 0 340 200" style={{ width: '100%' }}>
              {/* Edge A→B */}
              <line x1={80} y1={100} x2={260} y2={100}
                stroke={revealed ? (ex.better ? '#22c55e' : '#ef4444') : '#94a3b8'}
                strokeWidth={3} strokeLinecap="round"
              />
              {/* Edge weight */}
              <rect x={152} y={78} width={36} height={20} rx={6} fill="white" opacity={0.9} />
              <text x={170} y={92} textAnchor="middle" fontSize={12} fontWeight={700} fill="#475569">
                {ex.edgeW}
              </text>

              {/* Node A */}
              <circle cx={80} cy={100} r={26} fill="#6366f1" stroke="#fff" strokeWidth={2} />
              <text x={80} y={95} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">{ex.nodeA}</text>
              <text x={80} y={110} textAnchor="middle" fontSize={11} fontWeight={600} fill="#c7d2fe">dist={ex.distA}</text>

              {/* Node B */}
              <motion.circle
                cx={260} cy={100} r={26}
                fill={revealed ? (ex.better ? '#22c55e' : '#64748b') : '#3b82f6'}
                animate={{ fill: revealed ? (ex.better ? '#22c55e' : '#64748b') : '#3b82f6' }}
                transition={{ duration: 0.4 }}
                stroke="#fff" strokeWidth={2}
              />
              <text x={260} y={95} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">{ex.nodeB}</text>

              {/* B's distance: before */}
              {!revealed && (
                <text x={260} y={110} textAnchor="middle" fontSize={11} fontWeight={600} fill="#bfdbfe">
                  dist={ex.oldDistB === Infinity ? '∞' : ex.oldDistB}
                </text>
              )}
              {revealed && (
                <motion.text
                  x={260} y={110} textAnchor="middle" fontSize={11} fontWeight={700}
                  fill={ex.better ? '#fff' : '#94a3b8'}
                  initial={{ opacity: 0, y: 105 }}
                  animate={{ opacity: 1, y: 110 }}
                >
                  dist={ex.newDistB}
                </motion.text>
              )}

              {/* Calculation */}
              <text x={170} y={155} textAnchor="middle" fontSize={13} fontWeight={700} fill="#475569">
                {ex.distA} + {ex.edgeW} = {ex.newDistB}
              </text>
              <text x={170} y={175} textAnchor="middle" fontSize={12} fill="#94a3b8">
                vs current: {ex.oldDistB === Infinity ? '∞' : ex.oldDistB}
              </text>
            </svg>
          </div>

          {/* Result panel */}
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: '16px 18px',
              border: '1px solid #e2e8f0', fontSize: 14, color: '#475569', lineHeight: 1.7,
            }}>
              <strong style={{ color: '#1e293b' }}>Node {ex.nodeA}</strong> has distance <strong style={{ color: '#6366f1' }}>{ex.distA}</strong>.<br />
              Edge {ex.nodeA}→{ex.nodeB} has weight <strong style={{ color: '#f59e0b' }}>{ex.edgeW}</strong>.<br />
              New dist = {ex.distA} + {ex.edgeW} = <strong style={{ color: '#22c55e' }}>{ex.newDistB}</strong>.<br />
              Current dist[{ex.nodeB}] = <strong style={{ color: '#3b82f6' }}>{ex.oldDistB === Infinity ? '∞' : ex.oldDistB}</strong>.
            </div>

            <button
              onClick={() => setRevealed(true)}
              disabled={revealed}
              style={{
                padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                background: revealed ? '#f1f5f9' : '#6366f1', color: revealed ? '#94a3b8' : '#fff',
                border: 'none', cursor: revealed ? 'default' : 'pointer',
              }}
            >
              {revealed ? 'Result shown below' : 'Relax the Edge!'}
            </button>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: ex.better ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${ex.better ? '#86efac' : '#fca5a5'}`,
                    borderRadius: 12, padding: '16px 18px',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{ex.better ? '✅' : '❌'}</div>
                  <div style={{ fontWeight: 700, color: ex.better ? '#15803d' : '#dc2626', fontSize: 15 }}>
                    {ex.better
                      ? `UPDATE! ${ex.nodeB} gets new distance: ${ex.newDistB}`
                      : `NO UPDATE. ${ex.newDistB} is NOT less than ${ex.oldDistB}.`
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={prev} style={{ flex: 1, padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: '#f1f5f9', color: '#475569', border: '2px solid #e2e8f0', cursor: 'pointer' }}>
                ← Prev
              </button>
              <button onClick={next} style={{ flex: 1, padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: 13, background: '#eff6ff', color: '#3b82f6', border: '2px solid #93c5fd', cursor: 'pointer' }}>
                Next →
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
              Example {idx + 1} of {examples.length}
            </div>
          </div>
        </div>
      </InteractiveDemo>

      <NeuronTip type="deep">
        "Relaxation" comes from physics — like loosening a tightly coiled spring. We relax (reduce) the distance estimate until it reaches the true shortest distance. Each relaxation can only make distances smaller, never larger.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 4 — Build Your Own Route
================================================================ */
function BuildYourRoute() {
  const cityIds = Object.keys(CITIES)
  const [src, setSrc] = useState('DEL')
  const [dst, setDst] = useState('MUM')
  const [result, setResult] = useState(null)
  const [snapshots, setSnapshots] = useState([])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(700)
  const timerRef = useRef(null)

  const run = useCallback(() => {
    if (src === dst) return
    const { snapshots: snaps, path, dist } = runDijkstra(src, dst, EDGES)
    setSnapshots(snaps)
    setResult({ path, dist })
    setStep(0)
    setPlaying(false)
  }, [src, dst])

  useEffect(() => { run() }, [run])

  const cur = snapshots[step] || { dist: null, visited: new Set(), current: null, relaxed: null, pq: [] }
  const isDone = step === snapshots.length - 1

  useEffect(() => {
    if (playing && !isDone) {
      timerRef.current = setTimeout(() => setStep(s => s + 1), speed)
    } else if (isDone) setPlaying(false)
    return () => clearTimeout(timerRef.current)
  }, [playing, step, isDone, speed])

  const totalDist = result?.dist?.[dst]

  return (
    <SectionBlock icon="📍" title="Build Your Own Route">
      <Neuron mood="waving" message="Pick any two Indian cities and watch Dijkstra plan the shortest route! Change source and destination to explore." />

      {/* City selectors */}
      <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: 6 }}>
            Source (START)
          </label>
          <select
            value={src}
            onChange={e => { setSrc(e.target.value); setStep(0); setPlaying(false) }}
            style={{ padding: '10px 16px', borderRadius: 10, border: '2px solid #6366f1', fontSize: 15, fontWeight: 600, color: '#1e293b', background: '#eff6ff', cursor: 'pointer' }}
          >
            {cityIds.map(id => <option key={id} value={id}>{CITIES[id].name} ({id})</option>)}
          </select>
        </div>
        <div style={{ fontSize: 22, color: '#94a3b8', marginTop: 20 }}>→</div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#ec4899', display: 'block', marginBottom: 6 }}>
            Destination (END)
          </label>
          <select
            value={dst}
            onChange={e => { setDst(e.target.value); setStep(0); setPlaying(false) }}
            style={{ padding: '10px 16px', borderRadius: 10, border: '2px solid #ec4899', fontSize: 15, fontWeight: 600, color: '#1e293b', background: '#fff0f6', cursor: 'pointer' }}
          >
            {cityIds.map(id => <option key={id} value={id}>{CITIES[id].name} ({id})</option>)}
          </select>
        </div>
        {src === dst && (
          <div style={{ fontSize: 14, color: '#ef4444', fontWeight: 600, marginTop: 20 }}>
            Source and destination can't be the same!
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ background: '#f8fafc', borderRadius: 18, padding: '12px 8px', border: '1px solid #e2e8f0', margin: '20px 0', overflowX: 'auto' }}>
        <CityGraph
          dist={cur.dist}
          visited={cur.visited}
          current={cur.current}
          relaxed={cur.relaxed}
          path={isDone && result ? result.path : []}
          source={src}
          destination={dst}
        />
      </div>

      {/* Distance Table */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10, letterSpacing: 0.5 }}>DISTANCE TABLE</div>
          <div style={{ background: '#1e293b', borderRadius: 14, overflow: 'hidden' }}>
            {cityIds.map((id, i) => (
              <motion.div
                key={id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 16px',
                  background: id === cur.current ? '#2d3f56' : i % 2 === 0 ? '#1e293b' : '#243045',
                  borderLeft: `4px solid ${
                    id === src ? '#6366f1' :
                    id === dst ? '#ec4899' :
                    cur.visited?.has(id) ? '#22c55e' :
                    id === cur.current ? '#fbbf24' : 'transparent'
                  }`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                  {CITIES[id].name}
                </span>
                <motion.span
                  key={cur.dist?.[id]}
                  initial={{ scale: 1.2, color: '#fbbf24' }}
                  animate={{ scale: 1, color: cur.dist?.[id] === Infinity ? '#475569' : '#86efac' }}
                  style={{ fontSize: 13, fontWeight: 700 }}
                >
                  {cur.dist?.[id] === undefined || cur.dist?.[id] === Infinity ? '∞' : `${cur.dist[id]} km`}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          {/* Result box */}
          {isDone && result && totalDist !== undefined && totalDist !== Infinity && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '2px solid #22c55e', borderRadius: 16, padding: '20px 22px',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 10 }}>
                Shortest Route Found!
              </div>
              <div style={{ fontSize: 13, color: '#15803d', lineHeight: 2 }}>
                {result.path.map((id, i) => (
                  <span key={id}>
                    <span style={{ background: '#22c55e', color: '#fff', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                      {CITIES[id].name}
                    </span>
                    {i < result.path.length - 1 && <span style={{ color: '#4ade80', margin: '0 6px' }}>→</span>}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d', marginTop: 12 }}>
                Total: {totalDist} km
              </div>
            </motion.div>
          )}
          {isDone && result && (totalDist === undefined || totalDist === Infinity) && (
            <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 16, padding: '20px', color: '#dc2626', fontWeight: 600 }}>
              No path found between these cities!
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => { setStep(0); setPlaying(false) }} style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, background: '#f1f5f9', color: '#475569', border: '2px solid #e2e8f0', cursor: 'pointer' }}>Reset</button>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, background: '#eff6ff', color: '#3b82f6', border: '2px solid #93c5fd', cursor: 'pointer', opacity: step === 0 ? 0.5 : 1 }}>← Prev</button>
        <button onClick={() => setStep(s => Math.min(snapshots.length - 1, s + 1))} disabled={isDone} style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, background: '#eff6ff', color: '#3b82f6', border: '2px solid #93c5fd', cursor: 'pointer', opacity: isDone ? 0.5 : 1 }}>Next →</button>
        <button onClick={() => setPlaying(p => !p)} style={{ padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: 13, background: playing ? '#ef4444' : '#22c55e', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {playing ? 'Pause' : isDone ? 'Auto Replay' : 'Auto Play'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Speed</span>
          <input type="range" min={200} max={1500} step={100} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width: 90, accentColor: '#22c55e' }} />
        </div>
      </div>

      <NeuronTip type="example">
        Try Delhi → Hyderabad! Notice how the algorithm explores cities that seem like detours — but finds the optimal weighted path, not just the most direct one.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 5 — Dijkstra vs BFS Side by Side
================================================================ */
function DijkstraVsBFS() {
  const [shown, setShown] = useState(false)

  /* Same graph, two interpretations */
  const compNodes = {
    A: { x: 80,  y: 150, name: 'Delhi'    },
    B: { x: 240, y: 60,  name: 'Jaipur'   },
    C: { x: 240, y: 240, name: 'Agra'     },
    D: { x: 400, y: 150, name: 'Kanpur'   },
    E: { x: 560, y: 150, name: 'Varanasi' },
  }
  const compEdges = [
    { from: 'A', to: 'B', w: 280 },
    { from: 'A', to: 'C', w: 200 },
    { from: 'B', to: 'D', w: 400 },
    { from: 'C', to: 'D', w: 300 },
    { from: 'D', to: 'E', w: 320 },
    { from: 'A', to: 'E', w: 1200 }, // direct but long
  ]
  // BFS: A→E direct (1 hop, 1200 km) OR A→B→D→E (3 hops) — BFS picks fewest hops = A→E
  // Dijkstra: A→C→D→E = 200+300+320 = 820 km

  const bfsPath = ['A', 'E']  // direct 1 hop
  const dijkPath = ['A', 'C', 'D', 'E']  // 3 hops, cheapest

  const getEdge = (from, to, pathArr, color) => {
    for (let i = 0; i < pathArr.length - 1; i++) {
      if ((pathArr[i] === from && pathArr[i+1] === to) || (pathArr[i] === to && pathArr[i+1] === from)) return color
    }
    return '#e2e8f0'
  }

  return (
    <SectionBlock icon="⚖️" title="Dijkstra vs BFS — Side by Side">
      <Neuron mood="thinking" message="Same graph, same question: 'Shortest path from Delhi to Varanasi?' BFS and Dijkstra give DIFFERENT answers because they optimize for different things!" />

      <div style={{ display: 'flex', gap: 12, margin: '24px 0', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShown(true)}
          style={{ padding: '12px 26px', borderRadius: 12, fontWeight: 700, fontSize: 15, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Compare Both Paths
        </button>
        <button
          onClick={() => setShown(false)}
          style={{ padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, background: '#f1f5f9', color: '#475569', border: '2px solid #e2e8f0', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* BFS */}
        <div style={{
          flex: 1, minWidth: 280,
          background: '#eff6ff', borderRadius: 18, padding: '20px',
          border: '2px solid #93c5fd',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 22 }}>🔵</span> BFS Result
          </div>
          <svg viewBox="0 0 640 310" style={{ width: '100%', overflow: 'visible' }}>
            {compEdges.map((e, i) => {
              const a = compNodes[e.from], b = compNodes[e.to]
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
              const col = shown ? getEdge(e.from, e.to, bfsPath, '#3b82f6') : '#e2e8f0'
              const inPath = col !== '#e2e8f0'
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={inPath ? 5 : 2} strokeLinecap="round" />
                  <rect x={mx - 20} y={my - 11} width={40} height={20} rx={6} fill="white" opacity={0.9} />
                  <text x={mx} y={my + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">{e.w}</text>
                </g>
              )
            })}
            {Object.entries(compNodes).map(([id, n]) => {
              const inPath = shown && bfsPath.includes(id)
              return (
                <g key={id}>
                  <circle cx={n.x} cy={n.y} r={22} fill={inPath ? '#3b82f6' : '#94a3b8'} stroke="#fff" strokeWidth={2} />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{id}</text>
                  <text x={n.x} y={n.y + 38} textAnchor="middle" fontSize={11} fontWeight={600} fill="#475569">{n.name}</text>
                </g>
              )
            })}
          </svg>
          <div style={{ marginTop: 12, fontSize: 14, color: '#1d4ed8', fontWeight: 700 }}>
            Path: A → E (direct)
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>1 hop, <strong>1,200 km</strong></div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontStyle: 'italic' }}>
            Fewest edges — but NOT the cheapest!
          </div>
        </div>

        {/* Dijkstra */}
        <div style={{
          flex: 1, minWidth: 280,
          background: '#f0fdf4', borderRadius: 18, padding: '20px',
          border: '2px solid #86efac',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 22 }}>🟢</span> Dijkstra Result
          </div>
          <svg viewBox="0 0 640 310" style={{ width: '100%', overflow: 'visible' }}>
            {compEdges.map((e, i) => {
              const a = compNodes[e.from], b = compNodes[e.to]
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
              const col = shown ? getEdge(e.from, e.to, dijkPath, '#22c55e') : '#e2e8f0'
              const inPath = col !== '#e2e8f0'
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={inPath ? 5 : 2} strokeLinecap="round" />
                  <rect x={mx - 20} y={my - 11} width={40} height={20} rx={6} fill="white" opacity={0.9} />
                  <text x={mx} y={my + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">{e.w}</text>
                </g>
              )
            })}
            {Object.entries(compNodes).map(([id, n]) => {
              const inPath = shown && dijkPath.includes(id)
              return (
                <g key={id}>
                  <circle cx={n.x} cy={n.y} r={22} fill={inPath ? '#22c55e' : '#94a3b8'} stroke="#fff" strokeWidth={2} />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{id}</text>
                  <text x={n.x} y={n.y + 38} textAnchor="middle" fontSize={11} fontWeight={600} fill="#475569">{n.name}</text>
                </g>
              )
            })}
          </svg>
          <div style={{ marginTop: 12, fontSize: 14, color: '#15803d', fontWeight: 700 }}>
            Path: A → C → D → E
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>3 hops, <strong>820 km</strong></div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontStyle: 'italic' }}>
            More hops — but 380 km cheaper!
          </div>
        </div>
      </div>

      {shown && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 20, background: '#fef9c3',
            border: '2px solid #fde047', borderRadius: 16, padding: '20px 24px',
            fontSize: 15, color: '#713f12',
          }}
        >
          <strong>Verdict:</strong> BFS found a 1-hop path but it's 1,200 km! Dijkstra found a 3-hop path at only 820 km — saving 380 km. When weights matter (real maps, network routing, costs), always use Dijkstra!
        </motion.div>
      )}

      <HindiExplainer
        concept="Dijkstra vs BFS"
        english="Dijkstra vs Breadth-First Search"
        explanation="BFS सबसे कम roads वाला रास्ता ढूंढता है। Dijkstra सबसे कम distance वाला रास्ता ढूंढता है। जब सभी roads का weight same हो तो दोनों same answer देते हैं — लेकिन जब weights अलग-अलग हों, तो Dijkstra जीतता है!"
        example="Delhi से Varanasi: सीधी road 1200 km, लेकिन Agra-Kanpur होते हुए 820 km। BFS सीधा रास्ता (1 road) चुनेगा। Dijkstra 820 km वाला (3 roads) चुनेगा।"
        terms={[]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 6 — The Negative Edge Problem
================================================================ */
function NegativeEdgeProblem() {
  const [revealed, setRevealed] = useState(false)

  /* Small demo: A→B(4), A→C(2), C→B(-5). Dijkstra would give B=4, correct=2+(-5)=-3 */
  const negNodes = {
    A: { x: 80,  y: 160, name: 'A' },
    C: { x: 300, y: 80,  name: 'C' },
    B: { x: 520, y: 160, name: 'B' },
  }
  const negEdges = [
    { from: 'A', to: 'B', w: 4,  label: '4'  },
    { from: 'A', to: 'C', w: 2,  label: '2'  },
    { from: 'C', to: 'B', w: -5, label: '-5', negative: true },
  ]
  // Dijkstra: marks A(0), picks B(4) or C(2) → picks C(2). Relaxes B via C: 2+(-5)=-3 < 4 → B=-3.
  // Actually Dijkstra DOES handle this correctly IF C is processed before B.
  // The real problem: if B was already visited (marked) before we process C,
  // then C→B relaxation is ignored! Let's use a clearer example:
  // A→B(1), A→C(100), B→C(-200), want: A→C shortest.
  // Dijkstra: dist[B]=1, dist[C]=100. Visits A, sets B=1, C=100. Visits B (smallest), C becomes 1+(-200)=-199.
  // Actually Dijkstra handles that fine too (C gets updated when we visit B).
  // The TRUE failure: A→B(2), B→C(-3), A→C(0).
  // Want shortest to C: A→C=0, A→B→C = 2-3 = -1. True shortest = -1.
  // Dijkstra: visits A first. Sets B=2, C=0. Visits C (dist=0) → marks C as visited.
  // Then visits B (dist=2). B→C would give 2+(-3)=-1, but C is already VISITED → SKIP!
  // So Dijkstra reports dist[C]=0, but true is -1. BUG!

  const nodes2 = {
    A: { x: 80,  y: 160, name: 'A', dijkDist: 0,  trueDist: 0  },
    B: { x: 320, y: 60,  name: 'B', dijkDist: 2,  trueDist: 2  },
    C: { x: 560, y: 160, name: 'C', dijkDist: 0,  trueDist: -1 },  // BUG HERE
  }
  const edges2 = [
    { from: 'A', to: 'B', w: 2,  negative: false },
    { from: 'A', to: 'C', w: 0,  negative: false },
    { from: 'B', to: 'C', w: -3, negative: true  },
  ]

  return (
    <SectionBlock icon="⚠️" title="The Negative Edge Problem">
      <Neuron mood="thinking" message="Dijkstra has one weakness: negative weight edges. If a road has 'negative distance' (like a bonus or toll refund), Dijkstra breaks! Here's why..." />

      <div style={{ margin: '24px 0' }}>
        <div style={{
          background: '#1e293b', borderRadius: 16, padding: '20px 24px',
          marginBottom: 20, fontSize: 14, color: '#e2e8f0', lineHeight: 2,
        }}>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>The Rule:</span> Once Dijkstra marks a node as <span style={{ color: '#22c55e' }}>visited</span>, it NEVER goes back to update it.<br />
          This is safe with non-negative weights — a visited node <em>already has</em> its shortest path.<br />
          But with negative weights, a path found <em>later</em> could be even shorter!
        </div>

        {/* Graph */}
        <div style={{ background: '#f8fafc', borderRadius: 16, padding: '16px', border: '1px solid #e2e8f0', overflowX: 'auto', marginBottom: 20 }}>
          <svg viewBox="0 0 640 260" style={{ width: '100%', maxWidth: 640 }}>
            {edges2.map((e, i) => {
              const a = nodes2[e.from], b = nodes2[e.to]
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
              return (
                <g key={i}>
                  <line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={e.negative ? '#ef4444' : '#94a3b8'}
                    strokeWidth={e.negative ? 4 : 2}
                    strokeLinecap="round"
                    strokeDasharray={e.negative ? '8 4' : 'none'}
                  />
                  <rect x={mx - 20} y={my - 13} width={40} height={22} rx={7}
                    fill={e.negative ? '#fef2f2' : 'white'} opacity={0.95}
                  />
                  <text x={mx} y={my + 4} textAnchor="middle" fontSize={13} fontWeight={800}
                    fill={e.negative ? '#ef4444' : '#475569'}>
                    {e.w}
                  </text>
                </g>
              )
            })}
            {Object.entries(nodes2).map(([id, n]) => (
              <g key={id}>
                <circle cx={n.x} cy={n.y} r={28} fill="#3b82f6" stroke="#fff" strokeWidth={3} />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff">{n.name}</text>
                {/* Labels */}
                {revealed && (
                  <>
                    <rect x={n.x - 28} y={n.y - 58} width={56} height={22} rx={7} fill="#ef444420" />
                    <text x={n.x} y={n.y - 42} textAnchor="middle" fontSize={12} fontWeight={800} fill="#ef4444">
                      Dijkstra: {n.dijkDist}
                    </text>
                    <rect x={n.x - 28} y={n.y + 38} width={56} height={22} rx={7} fill="#22c55e20" />
                    <text x={n.x} y={n.y + 54} textAnchor="middle" fontSize={12} fontWeight={800} fill="#22c55e">
                      Truth: {n.trueDist}
                    </text>
                  </>
                )}
              </g>
            ))}
            {/* Negative edge label */}
            <text x={440} y={40} textAnchor="middle" fontSize={12} fontWeight={700} fill="#ef4444">
              NEGATIVE EDGE!
            </text>
          </svg>
        </div>

        <button
          onClick={() => setRevealed(true)}
          disabled={revealed}
          style={{
            padding: '12px 26px', borderRadius: 12, fontWeight: 700, fontSize: 15,
            background: revealed ? '#f1f5f9' : '#ef4444', color: revealed ? '#94a3b8' : '#fff',
            border: 'none', cursor: revealed ? 'default' : 'pointer', marginBottom: 20,
          }}
        >
          {revealed ? 'Bug revealed!' : 'Show Dijkstra\'s Bug'}
        </button>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
            >
              <div style={{
                flex: 1, minWidth: 240,
                background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 16, padding: '20px',
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#dc2626', marginBottom: 10 }}>
                  Dijkstra says C = 0
                </div>
                <div style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.7 }}>
                  Steps: Visit A → set C=0, B=2. Visit C (smallest unvisited!). Mark C DONE.<br />
                  Visit B → try to update C via B+(-3)= -1. But C is VISITED → SKIP!<br />
                  Final dist[C] = 0. <strong>WRONG!</strong>
                </div>
              </div>
              <div style={{
                flex: 1, minWidth: 240,
                background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 16, padding: '20px',
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d', marginBottom: 10 }}>
                  True shortest = -1
                </div>
                <div style={{ fontSize: 13, color: '#14532d', lineHeight: 1.7 }}>
                  Real path: A→B→C = 2 + (-3) = -1<br />
                  This is cheaper than A→C = 0!<br />
                  Dijkstra missed it because C was already "done" when B was processed.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NeuronTip type="warning">
        For graphs with negative edges, use Bellman-Ford algorithm (not covered here). Bellman-Ford doesn't mark nodes as "permanently done" — it relaxes ALL edges N-1 times. Slower (O(VE)) but correct with negative weights!
      </NeuronTip>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
          <thead>
            <tr>
              {['Feature', 'Dijkstra', 'Bellman-Ford'].map(h => (
                <th key={h} style={{ background: '#1e293b', color: '#e2e8f0', padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Non-negative weights', '✅ Works', '✅ Works'],
              ['Negative weights', '❌ May fail', '✅ Works'],
              ['Negative cycles', '❌ Fails', '✅ Detects'],
              ['Time complexity', 'O((V+E) log V)', 'O(V × E)'],
              ['Real-world use', 'GPS, maps', 'Finance, networks'],
            ].map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                <td style={{ padding: '10px 16px', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{row[0]}</td>
                <td style={{ padding: '10px 16px', color: row[1].startsWith('✅') ? '#15803d' : '#dc2626', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{row[1]}</td>
                <td style={{ padding: '10px 16px', color: row[2].startsWith('✅') ? '#15803d' : '#dc2626', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */
function HindiSummary() {
  return (
    <SectionBlock icon="🇮🇳" title="Hindi Summary — Dijkstra एक नज़र में">
      <div style={{
        background: 'linear-gradient(135deg, #fff8f0, #fff3e0)',
        border: '2px solid #ff993340', borderRadius: 20,
        padding: '28px 32px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#92400e', marginBottom: 20, fontFamily: 'var(--font-heading)' }}>
          Dijkstra Algorithm — 5 Steps में:
        </div>
        {[
          { step: '1', hindi: 'Source city का distance = 0, बाकी सब = ∞', icon: '🏁' },
          { step: '2', hindi: 'Unvisited cities में से सबसे कम distance वाली city उठाओ (Priority Queue)', icon: '📋' },
          { step: '3', hindi: 'उस city के सभी neighbors check करो', icon: '🔍' },
          { step: '4', hindi: 'अगर current_dist + edge_weight < neighbor_dist → UPDATE करो (Relaxation!)', icon: '⚡' },
          { step: '5', hindi: 'City को Visited mark करो। Destination तक पहुंचो या सभी cities visit करो।', icon: '✅' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex', gap: 16, alignItems: 'flex-start',
              padding: '12px 0', borderBottom: i < 4 ? '1px solid #ff993318' : 'none',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #ff9933, #e67e22)',
              color: '#fff', fontWeight: 800, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {item.step}
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.6, color: '#2d2d2d' }}>
              <span style={{ fontSize: 18, marginRight: 8 }}>{item.icon}</span>
              {item.hindi}
            </div>
          </motion.div>
        ))}
      </div>

      <HindiExplainer
        concept="Dijkstra = Google Maps"
        english="Dijkstra's Shortest Path Algorithm"
        explanation="Dijkstra एक greedy algorithm है। हर step पर सबसे छोटी distance वाली city को process करता है। Relaxation step में distances update होते हैं। जब destination visit हो जाए — shortest path मिल गया!"
        example="जैसे Google Maps हर possible road का time calculate करता है और सबसे fast route suggest करता है — बिल्कुल वैसे ही Dijkstra हर city का shortest distance track करता है!"
        terms={[
          { hindi: 'सबसे छोटा रास्ता',  english: 'Shortest Path',     meaning: 'Source से destination तक का minimum weight वाला path' },
          { hindi: 'दूरी',               english: 'Distance',          meaning: 'Node तक का current calculated weight' },
          { hindi: 'भार',                english: 'Weight',            meaning: 'Edge पर लिखा हुआ number (km, time, cost)' },
          { hindi: 'शिथिलन',             english: 'Relaxation',        meaning: 'Neighbor की distance को update करना अगर बेहतर path मिले' },
          { hindi: 'प्राथमिकता कतार',    english: 'Priority Queue',    meaning: 'Sorted queue जो minimum distance वाला node पहले देती है' },
          { hindi: 'भ्रमण किया गया',     english: 'Visited',          meaning: 'जिस node की shortest distance confirm हो गई' },
        ]}
      />

      {/* Quick-reference card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: '#1e293b', borderRadius: 20, padding: '28px 32px',
          marginTop: 24, display: 'flex', gap: 24, flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Time Complexity', value: 'O((V + E) log V)', sub: 'with min-heap', color: '#60a5fa' },
          { label: 'Space',           value: 'O(V)',             sub: 'distance array', color: '#a78bfa' },
          { label: 'Works for',       value: 'Non-negative',     sub: 'edge weights',   color: '#34d399' },
          { label: 'Real use',        value: 'GPS / Maps',       sub: 'network routing', color: '#f59e0b' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color, fontFamily: 'monospace', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{sub}</div>
          </div>
        ))}
      </motion.div>
    </SectionBlock>
  )
}

/* ================================================================
   ROOT EXPORT
================================================================ */
export default function Topic19Content() {
  return (
    <div style={{ padding: '8px 0' }}>
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderRadius: 24, padding: '36px 40px', marginBottom: 36,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Animated map dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 8, height: 8, borderRadius: '50%',
              background: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#60a5fa', '#34d399'][i],
              left: `${10 + i * 16}%`,
              top: `${20 + (i % 2) * 50}%`,
              opacity: 0.6,
            }}
            animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.4, delay: i * 0.3 }}
          />
        ))}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, color: '#60a5fa', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Topic 19 · Graph Algorithms
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', margin: '0 0 12px', fontFamily: 'var(--font-heading)' }}>
            Dijkstra's Shortest Path
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', margin: '0 0 20px', maxWidth: 540, lineHeight: 1.6 }}>
            How does Google Maps find the fastest route in milliseconds? This algorithm powers GPS navigation, network routing, and more.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Weighted Graphs', 'Priority Queue', 'Relaxation', 'Greedy Algorithm'].map(tag => (
              <span key={tag} style={{
                background: '#ffffff15', color: '#e2e8f0',
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: '1px solid #ffffff20',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <BFSVsDijkstra />
      <DijkstraVisualizer />
      <RelaxationDemo />
      <BuildYourRoute />
      <DijkstraVsBFS />
      <NegativeEdgeProblem />
      <HindiSummary />
    </div>
  )
}
