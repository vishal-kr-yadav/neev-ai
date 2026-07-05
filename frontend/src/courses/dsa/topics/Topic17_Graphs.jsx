import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 17 — Graphs
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
  gray:   '#6b7280',
}

/* ================================================================
   SECTION 1 — Graphs Are Everywhere
================================================================ */

const GALLERY_EXAMPLES = [
  {
    id: 'social',
    label: 'Social Network',
    icon: '👥',
    color: C.blue,
    description: 'People connected by friendships. Undirected — if A knows B, B knows A.',
    nodes: [
      { id: 0, x: 160, y: 80,  label: 'Alice', icon: '👩' },
      { id: 1, x: 300, y: 60,  label: 'Bob',   icon: '👨' },
      { id: 2, x: 420, y: 130, label: 'Carol',  icon: '👩' },
      { id: 3, x: 80,  y: 190, label: 'Dave',  icon: '👨' },
      { id: 4, x: 270, y: 200, label: 'Eve',   icon: '👩' },
      { id: 5, x: 380, y: 250, label: 'Frank', icon: '👨' },
    ],
    edges: [
      { from: 0, to: 1 }, { from: 0, to: 3 }, { from: 1, to: 2 },
      { from: 1, to: 4 }, { from: 2, to: 5 }, { from: 3, to: 4 },
      { from: 4, to: 5 },
    ],
    directed: false,
    weighted: false,
  },
  {
    id: 'roads',
    label: 'City Road Map',
    icon: '🗺️',
    color: C.green,
    description: 'Cities connected by roads. Edge weights = distances in km.',
    nodes: [
      { id: 0, x: 120, y: 90,  label: 'Delhi',   icon: '🏙️' },
      { id: 1, x: 310, y: 60,  label: 'Jaipur',  icon: '🏯' },
      { id: 2, x: 440, y: 140, label: 'Agra',    icon: '🕌' },
      { id: 3, x: 90,  y: 210, label: 'Chandigarh', icon: '🌳' },
      { id: 4, x: 260, y: 210, label: 'Mathura', icon: '🛕' },
      { id: 5, x: 390, y: 260, label: 'Kanpur',  icon: '🏭' },
    ],
    edges: [
      { from: 0, to: 1, weight: 280 }, { from: 0, to: 3, weight: 250 },
      { from: 0, to: 4, weight: 145 }, { from: 1, to: 2, weight: 240 },
      { from: 2, to: 4, weight: 58  }, { from: 2, to: 5, weight: 300 },
      { from: 4, to: 5, weight: 260 },
    ],
    directed: false,
    weighted: true,
  },
  {
    id: 'instagram',
    label: 'Instagram Follow',
    icon: '📸',
    color: C.pink,
    description: 'Directed graph — A following B does NOT mean B follows A.',
    nodes: [
      { id: 0, x: 150, y: 80,  label: 'Priya', icon: '👩' },
      { id: 1, x: 320, y: 60,  label: 'Ravi',  icon: '👨' },
      { id: 2, x: 430, y: 160, label: 'Meera', icon: '👩' },
      { id: 3, x: 80,  y: 200, label: 'Arjun', icon: '👨' },
      { id: 4, x: 270, y: 210, label: 'Nisha', icon: '👩' },
      { id: 5, x: 380, y: 260, label: 'Kabir', icon: '👨' },
    ],
    edges: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 },
      { from: 3, to: 0 }, { from: 3, to: 4 }, { from: 4, to: 1 },
      { from: 5, to: 2 }, { from: 5, to: 4 },
    ],
    directed: true,
    weighted: false,
  },
  {
    id: 'prereqs',
    label: 'Course Prerequisites',
    icon: '📚',
    color: C.purple,
    description: 'Must complete Math before Physics. DAG — Directed Acyclic Graph.',
    nodes: [
      { id: 0, x: 100, y: 150, label: 'Algebra',  icon: '📐' },
      { id: 1, x: 100, y: 80,  label: 'Calculus', icon: '∫' },
      { id: 2, x: 260, y: 120, label: 'Physics',  icon: '⚡' },
      { id: 3, x: 260, y: 220, label: 'Stats',    icon: '📊' },
      { id: 4, x: 400, y: 80,  label: 'ML',       icon: '🤖' },
      { id: 5, x: 400, y: 200, label: 'Data Sci', icon: '🔬' },
    ],
    edges: [
      { from: 0, to: 2 }, { from: 1, to: 2 }, { from: 1, to: 3 },
      { from: 2, to: 4 }, { from: 3, to: 4 }, { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
    directed: true,
    weighted: false,
  },
]

function GraphDiagram({ data, width = 520, height = 310, highlightEdge = null, highlightNode = null, showWeights = false, showArrows = null }) {
  const directed = showArrows !== null ? showArrows : data.directed
  const weighted = showWeights || data.weighted

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        {data.nodes.map(n => (
          <marker
            key={`arrow-${n.id}`}
            id={`arrow-${data.id || 'g'}-${n.id}`}
            markerWidth="10" markerHeight="7"
            refX="20" refY="3.5" orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={data.color || C.blue} opacity="0.8" />
          </marker>
        ))}
        <marker id={`arrow-${data.id || 'g'}-default`} markerWidth="10" markerHeight="7" refX="20" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={data.color || C.blue} opacity="0.8" />
        </marker>
      </defs>

      {/* Edges */}
      {data.edges.map((e, i) => {
        const from = data.nodes[e.from]
        const to   = data.nodes[e.to]
        const isHighlighted = highlightEdge === i
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        return (
          <g key={i}>
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isHighlighted ? '#f59e0b' : `${data.color || C.blue}66`}
              strokeWidth={isHighlighted ? 3.5 : 2}
              markerEnd={directed ? `url(#arrow-${data.id || 'g'}-default)` : undefined}
              style={{ transition: 'all 0.2s' }}
            />
            {weighted && e.weight !== undefined && (
              <text x={mx} y={my - 6} textAnchor="middle" fontSize={11} fontWeight={700}
                fill={data.color || C.blue} style={{ fontFamily: 'monospace' }}>
                {e.weight}
              </text>
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {data.nodes.map(n => {
        const isHighlighted = highlightNode === n.id
        return (
          <g key={n.id}>
            <circle
              cx={n.x} cy={n.y} r={24}
              fill={isHighlighted ? data.color || C.blue : 'var(--bg-card)'}
              stroke={data.color || C.blue}
              strokeWidth={isHighlighted ? 3 : 2}
              style={{ transition: 'all 0.25s', filter: isHighlighted ? `drop-shadow(0 0 8px ${data.color || C.blue})` : 'none' }}
            />
            <text x={n.x} y={n.y - 1} textAnchor="middle" dominantBaseline="middle"
              fontSize={15} style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {n.icon}
            </text>
            <text x={n.x} y={n.y + 36} textAnchor="middle"
              fontSize={10} fontWeight={600} fill="var(--text-secondary)">
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function GraphsAreEverywhere() {
  const [active, setActive] = useState(0)
  const ex = GALLERY_EXAMPLES[active]

  return (
    <SectionBlock icon="🌐" title="Graphs Are Everywhere" color={C.blue}>
      <Neuron mood="excited" message="Trees have one parent per node. But what about systems where anything can connect to anything? Roads, friendships, the internet — those are GRAPHS." />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '24px 0 20px' }}>
        {GALLERY_EXAMPLES.map((g, i) => (
          <motion.button key={g.id} onClick={() => setActive(i)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 30,
              background: active === i ? g.color : `${g.color}15`,
              border: `2px solid ${g.color}`,
              color: active === i ? '#fff' : g.color,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            <span style={{ fontSize: 18 }}>{g.icon}</span>
            {g.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={ex.id}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          style={{
            background: `${ex.color}08`, border: `2px solid ${ex.color}33`,
            borderRadius: 20, padding: '24px 28px',
          }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 24 }}>{ex.icon}</span>
            <span style={{ fontWeight: 800, fontSize: 20, color: ex.color }}>{ex.label}</span>
            {ex.directed && (
              <span style={{ background: `${ex.color}20`, color: ex.color, fontSize: 11,
                fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginLeft: 6 }}>
                DIRECTED
              </span>
            )}
            {ex.weighted && (
              <span style={{ background: `${ex.color}20`, color: ex.color, fontSize: 11,
                fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                WEIGHTED
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
            {ex.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
            <GraphDiagram data={ex} />
          </div>
        </motion.div>
      </AnimatePresence>

      <NeuronTip type="example">
        Any system with <strong>things (nodes)</strong> and <strong>connections between them (edges)</strong> is a graph. Social networks, road maps, package dependencies, the internet — ALL graphs.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 2 — Graph Terminology
================================================================ */

const TERM_GRAPH = {
  id: 'term',
  color: C.indigo,
  nodes: [
    { id: 0, x: 120, y: 90  },
    { id: 1, x: 280, y: 60  },
    { id: 2, x: 420, y: 110 },
    { id: 3, x: 80,  y: 220 },
    { id: 4, x: 240, y: 210 },
    { id: 5, x: 380, y: 260 },
    { id: 6, x: 490, y: 200 },
  ],
  edges: [
    { from: 0, to: 1, weight: 4 }, { from: 1, to: 2, weight: 2 },
    { from: 0, to: 3, weight: 7 }, { from: 1, to: 4, weight: 3 },
    { from: 2, to: 6, weight: 1 }, { from: 3, to: 4, weight: 5 },
    { from: 4, to: 5, weight: 2 }, { from: 5, to: 6, weight: 6 },
    { from: 2, to: 4, weight: 8 }, { from: 3, to: 5, weight: 4 },
  ],
  directed: false,
  weighted: false,
}

const TERMS = [
  { id: 'vertex',    label: 'Vertex / Node',   color: C.blue,   desc: 'A "thing" in the graph — a person, city, webpage, etc.' },
  { id: 'edge',      label: 'Edge',             color: C.green,  desc: 'A connection between two vertices.' },
  { id: 'directed',  label: 'Directed Edge',    color: C.pink,   desc: 'Has a direction (arrow). A→B doesn\'t imply B→A.' },
  { id: 'weighted',  label: 'Weighted Edge',    color: C.orange, desc: 'Has a cost/distance/weight on the edge.' },
  { id: 'degree',    label: 'Degree',           color: C.purple, desc: 'Number of edges connected to a vertex. Click a node to see its degree.' },
  { id: 'path',      label: 'Path',             color: C.cyan,   desc: 'A sequence of vertices connected by edges.' },
  { id: 'cycle',     label: 'Cycle',            color: C.red,    desc: 'A path that starts and ends at the same vertex.' },
]

function findPath(nodes, edges, from, to) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach((e, i) => { adj[e.from].push({ node: e.to, edgeIdx: i }); adj[e.to].push({ node: e.from, edgeIdx: i }) })
  const visited = new Set()
  const queue = [[from, []]]
  while (queue.length > 0) {
    const [curr, path] = queue.shift()
    if (curr === to) return path
    if (visited.has(curr)) continue
    visited.add(curr)
    for (const { node, edgeIdx } of adj[curr]) {
      if (!visited.has(node)) queue.push([node, [...path, edgeIdx]])
    }
  }
  return []
}

function GraphTerminology() {
  const [activeTerm, setActiveTerm] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [showDirected, setShowDirected] = useState(false)
  const [showWeights, setShowWeights] = useState(false)

  const highlightEdges = new Set()
  const highlightNodes = new Set()
  let termColor = C.indigo

  if (activeTerm === 'degree' && hoveredNode !== null) {
    termColor = C.purple
    highlightNodes.add(hoveredNode)
    TERM_GRAPH.edges.forEach((e, i) => {
      if (e.from === hoveredNode || e.to === hoveredNode) { highlightEdges.add(i); highlightNodes.add(e.from); highlightNodes.add(e.to) }
    })
  }
  if (activeTerm === 'path' && selectedNodes.length === 2) {
    termColor = C.cyan
    const path = findPath(TERM_GRAPH.nodes, TERM_GRAPH.edges, selectedNodes[0], selectedNodes[1])
    path.forEach(i => { highlightEdges.add(i); highlightNodes.add(TERM_GRAPH.edges[i].from); highlightNodes.add(TERM_GRAPH.edges[i].to) })
  }
  const CYCLE_EDGES = [0, 3, 5, 1, 8]
  const CYCLE_NODES = [0, 1, 4, 3]
  if (activeTerm === 'cycle') {
    termColor = C.red
    CYCLE_EDGES.forEach(i => highlightEdges.add(i))
    CYCLE_NODES.forEach(n => highlightNodes.add(n))
  }
  if (activeTerm === 'edge') {
    termColor = C.green
    TERM_GRAPH.edges.forEach((_, i) => highlightEdges.add(i))
  }
  if (activeTerm === 'vertex') {
    termColor = C.blue
    TERM_GRAPH.nodes.forEach(n => highlightNodes.add(n.id))
  }

  const handleNodeClick = (nid) => {
    if (activeTerm === 'path') {
      setSelectedNodes(prev => {
        if (prev.length === 0) return [nid]
        if (prev.length === 1 && prev[0] !== nid) return [prev[0], nid]
        return [nid]
      })
    }
  }

  const activeDef = TERMS.find(t => t.id === activeTerm)
  const degreeCount = hoveredNode !== null
    ? TERM_GRAPH.edges.filter(e => e.from === hoveredNode || e.to === hoveredNode).length
    : null

  return (
    <SectionBlock icon="📖" title="Graph Terminology" color={C.indigo}>
      <Neuron mood="explaining" message="Let's learn the vocabulary. Click a term — then interact with the graph to see it in action!" />

      {/* Term pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '20px 0' }}>
        {TERMS.map(t => (
          <motion.button key={t.id} onClick={() => { setActiveTerm(activeTerm === t.id ? null : t.id); setSelectedNodes([]) }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '8px 16px', borderRadius: 25,
              background: activeTerm === t.id ? t.color : `${t.color}15`,
              border: `2px solid ${t.color}`,
              color: activeTerm === t.id ? '#fff' : t.color,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}>
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Show Arrows', val: showDirected, set: setShowDirected, color: C.pink },
          { label: 'Show Weights', val: showWeights, set: setShowWeights, color: C.orange },
        ].map(({ label, val, set, color }) => (
          <button key={label} onClick={() => set(!val)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 20,
            background: val ? color : `${color}18`,
            border: `1.5px solid ${color}`,
            color: val ? '#fff' : color,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <span>{val ? '✓' : '○'}</span> {label}
          </button>
        ))}
      </div>

      {/* Definition banner */}
      <AnimatePresence>
        {activeDef && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div style={{
              background: `${activeDef.color}15`, border: `2px solid ${activeDef.color}44`,
              borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%', background: activeDef.color, flexShrink: 0,
              }} />
              <span style={{ fontWeight: 700, color: activeDef.color, marginRight: 6 }}>{activeDef.label}:</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{activeDef.desc}</span>
              {activeTerm === 'degree' && degreeCount !== null && (
                <span style={{ marginLeft: 'auto', background: C.purple, color: '#fff',
                  padding: '4px 14px', borderRadius: 20, fontWeight: 800, fontSize: 15 }}>
                  degree = {degreeCount}
                </span>
              )}
              {activeTerm === 'path' && (
                <span style={{ marginLeft: 'auto', color: C.cyan, fontWeight: 600, fontSize: 13 }}>
                  {selectedNodes.length === 0 ? 'Click a start node' : selectedNodes.length === 1 ? 'Now click an end node' : 'Path highlighted!'}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive SVG graph */}
      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 16, padding: 16, border: '1px solid var(--border)' }}>
        <svg width={540} height={310} style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrow-term" markerWidth="10" markerHeight="7" refX="20" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={C.pink} opacity="0.8" />
            </marker>
          </defs>
          {TERM_GRAPH.edges.map((e, i) => {
            const from = TERM_GRAPH.nodes[e.from]
            const to   = TERM_GRAPH.nodes[e.to]
            const hl   = highlightEdges.has(i)
            const mx   = (from.x + to.x) / 2
            const my   = (from.y + to.y) / 2
            const cycleRed = activeTerm === 'cycle' && CYCLE_EDGES.includes(i)
            return (
              <g key={i}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={cycleRed ? C.red : hl ? termColor : `${C.indigo}44`}
                  strokeWidth={hl || cycleRed ? 3.5 : 2}
                  markerEnd={showDirected ? 'url(#arrow-term)' : undefined}
                  style={{ transition: 'all 0.2s' }} />
                {showWeights && (
                  <text x={mx} y={my - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.orange}>
                    {e.weight}
                  </text>
                )}
              </g>
            )
          })}
          {TERM_GRAPH.nodes.map(n => {
            const hl = highlightNodes.has(n.id)
            const selected = selectedNodes.includes(n.id)
            const cycleNode = activeTerm === 'cycle' && CYCLE_NODES.includes(n.id)
            const fillColor = cycleNode ? C.red : hl ? termColor : 'var(--bg-card)'
            return (
              <g key={n.id} style={{ cursor: activeTerm === 'degree' || activeTerm === 'path' ? 'pointer' : 'default' }}
                onClick={() => handleNodeClick(n.id)}
                onMouseEnter={() => { if (activeTerm === 'degree') setHoveredNode(n.id) }}
                onMouseLeave={() => { if (activeTerm === 'degree') setHoveredNode(null) }}>
                <circle cx={n.x} cy={n.y} r={22}
                  fill={fillColor}
                  stroke={cycleNode ? C.red : selected ? C.cyan : hl ? termColor : `${C.indigo}66`}
                  strokeWidth={hl || selected || cycleNode ? 3 : 2}
                  style={{ transition: 'all 0.2s', filter: (hl || cycleNode) ? `drop-shadow(0 0 8px ${cycleNode ? C.red : termColor})` : 'none' }} />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={13} fontWeight={700}
                  fill={hl || cycleNode ? '#fff' : 'var(--text-primary)'}>
                  {n.id}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 3 — Graph Representations
================================================================ */

const REP_GRAPH = {
  nodes: ['A', 'B', 'C', 'D', 'E'],
  edges: [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]],
}

function buildAdjMatrix(nodes, edges) {
  const n = nodes.length
  const m = Array.from({ length: n }, () => Array(n).fill(0))
  edges.forEach(([a, b]) => { m[a][b] = 1; m[b][a] = 1 })
  return m
}

function buildAdjList(nodes, edges) {
  const list = nodes.map(() => [])
  edges.forEach(([a, b]) => { list[a].push(b); list[b].push(a) })
  return list
}

function GraphRepresentations() {
  const [hoveredCell, setHoveredCell] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  const { nodes, edges } = REP_GRAPH
  const matrix = buildAdjMatrix(nodes, edges)
  const adjList = buildAdjList(nodes, edges)

  // Which edges to highlight
  const hlEdgeIndices = new Set()
  if (hoveredCell && matrix[hoveredCell[0]][hoveredCell[1]] === 1) {
    const a = hoveredCell[0], b = hoveredCell[1]
    edges.forEach((e, i) => { if ((e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)) hlEdgeIndices.add(i) })
  }
  if (selectedNode !== null) {
    edges.forEach((e, i) => { if (e[0]===selectedNode||e[1]===selectedNode) hlEdgeIndices.add(i) })
  }

  const hlNodes = new Set()
  if (hoveredCell && matrix[hoveredCell[0]][hoveredCell[1]] === 1) { hlNodes.add(hoveredCell[0]); hlNodes.add(hoveredCell[1]) }
  if (selectedNode !== null) { hlNodes.add(selectedNode); adjList[selectedNode].forEach(n => hlNodes.add(n)) }

  return (
    <SectionBlock icon="🗂️" title="Graph Representations" color={C.teal}>
      <Neuron mood="thinking" message="Same graph, 3 different ways to store it in memory. Which one you pick affects speed and space." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 24 }}>

        {/* Visual Diagram */}
        <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 18, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.teal, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>🔵</span> Visual Diagram
          </div>
          <svg width="100%" viewBox="0 0 240 200" style={{ overflow: 'visible' }}>
            {[
              { id: 0, x: 120, y: 30  },
              { id: 1, x: 40,  y: 90  },
              { id: 2, x: 200, y: 90  },
              { id: 3, x: 40,  y: 170 },
              { id: 4, x: 200, y: 170 },
            ].map((node, ni) => {
              const pos = [
                { id: 0, x: 120, y: 30  },
                { id: 1, x: 40,  y: 90  },
                { id: 2, x: 200, y: 90  },
                { id: 3, x: 40,  y: 170 },
                { id: 4, x: 200, y: 170 },
              ]
              return null
            })}
            {(() => {
              const pos = [
                { x: 120, y: 30  },
                { x: 40,  y: 90  },
                { x: 200, y: 90  },
                { x: 40,  y: 170 },
                { x: 200, y: 170 },
              ]
              return (
                <>
                  {edges.map((e, i) => {
                    const a = pos[e[0]], b = pos[e[1]]
                    const hl = hlEdgeIndices.has(i)
                    return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={hl ? C.orange : `${C.teal}55`} strokeWidth={hl ? 3 : 2}
                      style={{ transition: 'all 0.2s' }} />
                  })}
                  {pos.map((p, i) => {
                    const hl = hlNodes.has(i)
                    return (
                      <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedNode(selectedNode === i ? null : i)}>
                        <circle cx={p.x} cy={p.y} r={18}
                          fill={hl ? C.teal : 'var(--bg-card)'}
                          stroke={C.teal} strokeWidth={2.5}
                          style={{ transition: 'all 0.2s', filter: hl ? `drop-shadow(0 0 6px ${C.teal})` : 'none' }} />
                        <text x={p.x} y={p.y+1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={13} fontWeight={800} fill={hl ? '#fff' : C.teal}>
                          {nodes[i]}
                        </text>
                      </g>
                    )
                  })}
                </>
              )
            })()}
          </svg>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, textAlign: 'center' }}>
            Click a node to highlight its edges
          </p>
        </div>

        {/* Adjacency Matrix */}
        <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 18, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.purple, marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>🔢</span> Adjacency Matrix
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
            matrix[i][j] = 1 if edge exists. Hover a cell!
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <td style={{ width: 28, height: 28 }} />
                  {nodes.map(n => (
                    <td key={n} style={{ width: 32, height: 28, textAlign: 'center', fontWeight: 800, color: C.purple }}>
                      {n}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, ri) => (
                  <tr key={ri}>
                    <td style={{ fontWeight: 800, color: C.purple, paddingRight: 8 }}>{nodes[ri]}</td>
                    {row.map((val, ci) => {
                      const isHl = hoveredCell && hoveredCell[0]===ri && hoveredCell[1]===ci
                      const isEdge = val === 1
                      const isSelHl = selectedNode !== null && (selectedNode===ri || selectedNode===ci) && isEdge
                      return (
                        <td key={ci}
                          onMouseEnter={() => setHoveredCell([ri, ci])}
                          onMouseLeave={() => setHoveredCell(null)}
                          style={{
                            width: 32, height: 32, textAlign: 'center',
                            background: isHl && isEdge ? C.orange : isSelHl ? `${C.teal}44` : isEdge ? `${C.purple}22` : 'transparent',
                            border: isHl ? `2px solid ${C.orange}` : '1px solid var(--border)',
                            borderRadius: 6, fontWeight: isEdge ? 800 : 400,
                            color: isEdge ? C.purple : 'var(--text-secondary)',
                            cursor: 'default', fontSize: 13,
                            transition: 'all 0.15s',
                          }}>
                          {val}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: `${C.purple}10`, borderRadius: 10, fontSize: 12 }}>
            <strong style={{ color: C.purple }}>Space:</strong> O(V²) — always V×V cells<br />
            <strong style={{ color: C.purple }}>Edge lookup:</strong> O(1) — instant
          </div>
        </div>

        {/* Adjacency List */}
        <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 18, padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.green, marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>📋</span> Adjacency List
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Each node lists its neighbors. Click a row!
          </div>
          {adjList.map((neighbors, i) => {
            const isSelected = selectedNode === i
            return (
              <motion.div key={i}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedNode(isSelected ? null : i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                  padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                  background: isSelected ? `${C.green}20` : 'var(--bg-page)',
                  border: `1.5px solid ${isSelected ? C.green : 'var(--border)'}`,
                  transition: 'all 0.2s',
                }}>
                <span style={{
                  fontWeight: 800, color: C.green, fontSize: 14, width: 20,
                  background: `${C.green}22`, borderRadius: 6, textAlign: 'center', padding: '2px 4px',
                }}>
                  {nodes[i]}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {neighbors.map(nb => (
                    <span key={nb} style={{
                      background: `${C.green}30`, color: C.green,
                      fontWeight: 700, fontSize: 13,
                      padding: '2px 10px', borderRadius: 8,
                    }}>
                      {nodes[nb]}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
          <div style={{ marginTop: 8, padding: '10px 14px', background: `${C.green}10`, borderRadius: 10, fontSize: 12 }}>
            <strong style={{ color: C.green }}>Space:</strong> O(V+E) — only real edges<br />
            <strong style={{ color: C.green }}>Edge lookup:</strong> O(degree) — scan list
          </div>
        </div>
      </div>

      <NeuronTip type="tip">
        <strong>When to use which?</strong> Adjacency Matrix = dense graphs + frequent edge lookups. Adjacency List = sparse graphs + memory efficiency. Most real-world graphs are sparse!
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 4 — Build a Graph (Interactive Canvas)
================================================================ */

let nodeIdCounter = 0

function BuildAGraph() {
  const [nodes, setNodes] = useState([
    { id: nodeIdCounter++, x: 120, y: 130, label: 'A' },
    { id: nodeIdCounter++, x: 280, y: 80,  label: 'B' },
    { id: nodeIdCounter++, x: 380, y: 190, label: 'C' },
  ])
  const [edges, setEdges] = useState([
    { from: 0, to: 1, weight: 3 },
    { from: 1, to: 2, weight: 5 },
  ])
  const [directed, setDirected] = useState(false)
  const [showWeights, setShowWeights] = useState(false)
  const [mode, setMode] = useState('node') // 'node' | 'edge' | 'delete'
  const [edgeStart, setEdgeStart] = useState(null)
  const [pendingWeight, setPendingWeight] = useState(null)
  const svgRef = useRef(null)
  const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  const adjMatrix = buildAdjMatrix(nodes.map((_, i) => i), edges.map(e => {
    const fromIdx = nodes.findIndex(n => n.id === e.from)
    const toIdx   = nodes.findIndex(n => n.id === e.to)
    return [fromIdx, toIdx]
  }))
  const adjList = buildAdjList(nodes.map((_, i) => i), edges.map(e => {
    const fromIdx = nodes.findIndex(n => n.id === e.from)
    const toIdx   = nodes.findIndex(n => n.id === e.to)
    return [fromIdx, toIdx]
  }))

  const handleSvgClick = (e) => {
    if (mode !== 'node') return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const label = LABELS[nodes.length % 26]
    setNodes(prev => [...prev, { id: nodeIdCounter++, x, y, label }])
  }

  const handleNodeClick = (nid, e) => {
    e.stopPropagation()
    if (mode === 'delete') {
      setNodes(prev => prev.filter(n => n.id !== nid))
      setEdges(prev => prev.filter(ed => ed.from !== nid && ed.to !== nid))
      return
    }
    if (mode === 'edge') {
      if (edgeStart === null) {
        setEdgeStart(nid)
      } else if (edgeStart !== nid) {
        const exists = edges.some(ed => (ed.from===edgeStart&&ed.to===nid)||(ed.from===nid&&ed.to===edgeStart))
        if (!exists) {
          const w = showWeights ? (pendingWeight || 1) : 1
          setEdges(prev => [...prev, { from: edgeStart, to: nid, weight: w }])
        }
        setEdgeStart(null)
      } else {
        setEdgeStart(null)
      }
    }
  }

  const handleEdgeRightClick = (i, e) => {
    e.preventDefault()
    if (mode === 'delete') setEdges(prev => prev.filter((_, idx) => idx !== i))
  }

  const resetCanvas = () => {
    nodeIdCounter = 10
    setNodes([
      { id: nodeIdCounter++, x: 120, y: 130, label: 'A' },
      { id: nodeIdCounter++, x: 280, y: 80,  label: 'B' },
      { id: nodeIdCounter++, x: 380, y: 190, label: 'C' },
    ])
    setEdges([])
    setEdgeStart(null)
  }

  return (
    <SectionBlock icon="🏗️" title="Build a Graph" color={C.orange}>
      <Neuron mood="waving" message="Time to build! Click to place nodes, draw edges between them, and watch the adjacency matrix and list update in real-time." />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '20px 0' }}>
        {[
          { m: 'node',   label: 'Add Node',   icon: '⭕', color: C.blue   },
          { m: 'edge',   label: 'Add Edge',   icon: '↔️', color: C.green  },
          { m: 'delete', label: 'Delete',     icon: '🗑️', color: C.red    },
        ].map(({ m, label, icon, color }) => (
          <button key={m} onClick={() => { setMode(m); setEdgeStart(null) }} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 25,
            background: mode === m ? color : `${color}18`,
            border: `2px solid ${color}`,
            color: mode === m ? '#fff' : color,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <span>{icon}</span> {label}
          </button>
        ))}
        <button onClick={() => setDirected(!directed)} style={{
          padding: '9px 18px', borderRadius: 25,
          background: directed ? C.pink : `${C.pink}18`,
          border: `2px solid ${C.pink}`,
          color: directed ? '#fff' : C.pink,
          fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {directed ? 'Directed' : 'Undirected'}
        </button>
        <button onClick={() => setShowWeights(!showWeights)} style={{
          padding: '9px 18px', borderRadius: 25,
          background: showWeights ? C.orange : `${C.orange}18`,
          border: `2px solid ${C.orange}`,
          color: showWeights ? '#fff' : C.orange,
          fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {showWeights ? 'Weights ON' : 'Weights OFF'}
        </button>
        <button onClick={resetCanvas} style={{
          padding: '9px 18px', borderRadius: 25,
          background: `${C.gray}18`, border: `2px solid ${C.gray}`,
          color: C.gray, fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>
          Reset
        </button>
      </div>

      {mode === 'edge' && edgeStart !== null && (
        <div style={{ marginBottom: 12, padding: '10px 18px', background: `${C.green}15`, borderRadius: 12,
          border: `1.5px solid ${C.green}`, color: C.green, fontWeight: 600, fontSize: 14 }}>
          Started edge from <strong>{nodes.find(n => n.id === edgeStart)?.label}</strong> — now click the destination node
        </div>
      )}

      {/* Canvas */}
      <div style={{ background: 'var(--bg-page)', border: '2px dashed var(--border)', borderRadius: 16, overflow: 'hidden', cursor: mode === 'node' ? 'crosshair' : 'default' }}>
        <svg ref={svgRef} width="100%" height={280} onClick={handleSvgClick} style={{ display: 'block' }}>
          <defs>
            <marker id="arrow-build" markerWidth="10" markerHeight="7" refX="20" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={C.orange} opacity="0.9" />
            </marker>
          </defs>
          {edges.map((ed, i) => {
            const fn = nodes.find(n => n.id === ed.from)
            const tn = nodes.find(n => n.id === ed.to)
            if (!fn || !tn) return null
            const mx = (fn.x + tn.x) / 2
            const my = (fn.y + tn.y) / 2
            return (
              <g key={i} onContextMenu={e => handleEdgeRightClick(i, e)}>
                <line x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                  stroke={`${C.orange}88`} strokeWidth={2.5}
                  markerEnd={directed ? 'url(#arrow-build)' : undefined} />
                {showWeights && (
                  <text x={mx} y={my - 7} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.orange}>
                    {ed.weight}
                  </text>
                )}
              </g>
            )
          })}
          {nodes.map(n => {
            const isStart = edgeStart === n.id
            return (
              <g key={n.id} style={{ cursor: 'pointer' }} onClick={e => handleNodeClick(n.id, e)}>
                <circle cx={n.x} cy={n.y} r={22}
                  fill={isStart ? C.green : `${C.orange}22`}
                  stroke={isStart ? C.green : C.orange}
                  strokeWidth={isStart ? 3 : 2}
                  style={{ filter: isStart ? `drop-shadow(0 0 8px ${C.green})` : 'none', transition: 'all 0.2s' }} />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={14} fontWeight={800} fill={isStart ? '#fff' : C.orange}>
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0 20px', textAlign: 'center' }}>
        Right-click an edge (in Delete mode) to remove it. Right-click a node to delete node + its edges.
      </p>

      {/* Live representations */}
      {nodes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontWeight: 700, color: C.purple, marginBottom: 10, fontSize: 13 }}>Adjacency Matrix</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <td style={{ width: 24 }} />
                    {nodes.map(n => <td key={n.id} style={{ width: 28, textAlign: 'center', fontWeight: 700, color: C.purple }}>{n.label}</td>)}
                  </tr>
                </thead>
                <tbody>
                  {adjMatrix.map((row, ri) => (
                    <tr key={ri}>
                      <td style={{ fontWeight: 700, color: C.purple, paddingRight: 6, fontSize: 12 }}>{nodes[ri]?.label}</td>
                      {row.map((val, ci) => (
                        <td key={ci} style={{
                          width: 28, height: 26, textAlign: 'center',
                          background: val === 1 ? `${C.purple}22` : 'transparent',
                          border: '1px solid var(--border)',
                          fontWeight: val === 1 ? 800 : 400,
                          color: val === 1 ? C.purple : 'var(--text-secondary)',
                          fontSize: 12,
                        }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontWeight: 700, color: C.green, marginBottom: 10, fontSize: 13 }}>Adjacency List</div>
            {adjList.map((nbs, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7, alignItems: 'center', fontSize: 12 }}>
                <span style={{ fontWeight: 800, color: C.green, width: 20 }}>{nodes[i]?.label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                {nbs.length === 0
                  ? <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>∅</span>
                  : nbs.map(nb => (
                    <span key={nb} style={{
                      background: `${C.green}25`, color: C.green,
                      fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    }}>{nodes[nb]?.label}</span>
                  ))
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 5 — Directed vs Undirected
================================================================ */

const DIR_NODES = [
  { id: 0, x: 100, y: 100, label: 'Priya' },
  { id: 1, x: 260, y: 60,  label: 'Ravi'  },
  { id: 2, x: 400, y: 110, label: 'Meera' },
  { id: 3, x: 90,  y: 220, label: 'Arjun' },
  { id: 4, x: 270, y: 210, label: 'Nisha' },
]
const DIR_EDGES = [
  { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 4 },
  { from: 3, to: 0 }, { from: 3, to: 4 }, { from: 0, to: 4 },
]

function DirectedVsUndirected() {
  const [mode, setMode] = useState('undirected')
  const isDir = mode === 'directed'

  const matrixDir = (() => {
    const n = DIR_NODES.length
    const m = Array.from({ length: n }, () => Array(n).fill(0))
    DIR_EDGES.forEach(e => { m[e.from][e.to] = 1 })
    return m
  })()
  const matrixUndir = (() => {
    const n = DIR_NODES.length
    const m = Array.from({ length: n }, () => Array(n).fill(0))
    DIR_EDGES.forEach(e => { m[e.from][e.to] = 1; m[e.to][e.from] = 1 })
    return m
  })()
  const mat = isDir ? matrixDir : matrixUndir

  return (
    <SectionBlock icon="↔️" title="Directed vs Undirected" color={C.pink}>
      <Neuron mood="explaining" message="Undirected = friendship (mutual). Directed = following (one-way). The adjacency matrix tells the story: undirected is always symmetric!" />

      <div style={{ display: 'flex', gap: 16, margin: '20px 0' }}>
        {[
          { id: 'undirected', label: '⟷  Undirected (Facebook)', desc: 'If A is friends with B → B is friends with A' },
          { id: 'directed',   label: '→  Directed (Instagram)',  desc: 'A follows B does NOT mean B follows A' },
        ].map(opt => (
          <button key={opt.id} onClick={() => setMode(opt.id)} style={{
            flex: 1, padding: '14px 18px', borderRadius: 16, cursor: 'pointer', textAlign: 'left',
            background: mode === opt.id ? (isDir ? `${C.pink}20` : `${C.blue}20`) : 'var(--bg-card)',
            border: `2px solid ${mode === opt.id ? (isDir ? C.pink : C.blue) : 'var(--border)'}`,
            transition: 'all 0.2s',
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: mode === opt.id ? (isDir ? C.pink : C.blue) : 'var(--text-primary)', marginBottom: 4 }}>
              {opt.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* SVG diagram */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
          <svg width="100%" viewBox="0 0 480 290" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arrow-dir" markerWidth="10" markerHeight="7" refX="20" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={C.pink} opacity="0.9" />
              </marker>
            </defs>
            {DIR_EDGES.map((e, i) => {
              const fn = DIR_NODES[e.from], tn = DIR_NODES[e.to]
              return (
                <g key={i}>
                  <line x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                    stroke={isDir ? `${C.pink}77` : `${C.blue}77`}
                    strokeWidth={2.5}
                    markerEnd={isDir ? 'url(#arrow-dir)' : undefined}
                    style={{ transition: 'all 0.3s' }} />
                  {!isDir && (
                    <line x1={tn.x} y1={tn.y} x2={fn.x} y2={fn.y}
                      stroke={`${C.blue}00`} strokeWidth={0} />
                  )}
                </g>
              )
            })}
            {DIR_NODES.map(n => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={22}
                  fill={isDir ? `${C.pink}20` : `${C.blue}20`}
                  stroke={isDir ? C.pink : C.blue}
                  strokeWidth={2.5} />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={11} fontWeight={700} fill={isDir ? C.pink : C.blue}>
                  {n.label.slice(0, 5)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Adjacency matrix */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: isDir ? C.pink : C.blue, fontSize: 14 }}>
            {isDir ? 'Asymmetric Matrix' : 'Symmetric Matrix'}
          </div>
          <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <td style={{ width: 52 }} />
                {DIR_NODES.map(n => (
                  <td key={n.id} style={{ width: 40, textAlign: 'center', fontWeight: 700, color: isDir ? C.pink : C.blue, fontSize: 11 }}>
                    {n.label.slice(0, 5)}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {mat.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ fontWeight: 700, color: isDir ? C.pink : C.blue, fontSize: 11, paddingRight: 6 }}>
                    {DIR_NODES[ri].label.slice(0, 5)}
                  </td>
                  {row.map((val, ci) => (
                    <td key={ci} style={{
                      width: 36, height: 30, textAlign: 'center',
                      background: val === 1 ? (isDir ? `${C.pink}25` : `${C.blue}25`) : 'transparent',
                      border: '1px solid var(--border)', fontSize: 12, fontWeight: val ? 800 : 400,
                      color: val ? (isDir ? C.pink : C.blue) : 'var(--text-secondary)',
                    }}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {isDir
              ? 'Not symmetric! matrix[i][j] ≠ matrix[j][i] in general.'
              : 'Always symmetric. matrix[i][j] === matrix[j][i] always.'}
          </div>
        </div>
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 6 — Graph Properties
================================================================ */

const PROP_NODES_BASE = [
  { id: 0, x: 100, y: 90  },
  { id: 1, x: 260, y: 60  },
  { id: 2, x: 400, y: 100 },
  { id: 3, x: 80,  y: 210 },
  { id: 4, x: 250, y: 200 },
  { id: 5, x: 400, y: 230 },
]
const PROP_EDGES_BASE = [
  { from: 0, to: 1 }, { from: 1, to: 2 },
  { from: 0, to: 3 }, { from: 3, to: 4 },
  { from: 4, to: 1 }, { from: 4, to: 5 },
  { from: 2, to: 5 },
]

function bfsReachable(nodes, edges, start) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from) })
  const visited = new Set([start])
  const queue = [start]
  while (queue.length > 0) {
    const curr = queue.shift()
    for (const nb of adj[curr]) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb) }
    }
  }
  return visited
}

function detectCycle(nodes, edges) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach((e, i) => { adj[e.from].push({ to: e.to, idx: i }); adj[e.to].push({ to: e.from, idx: i }) })
  const visited = new Set()
  let cycleEdges = []
  let cycleNodes = []

  function dfs(curr, parent, path, pathEdges) {
    visited.add(curr)
    path.push(curr)
    for (const { to, idx } of adj[curr]) {
      if (to === parent) continue
      if (visited.has(to)) {
        const start = path.indexOf(to)
        cycleNodes = path.slice(start)
        cycleEdges = pathEdges.slice(start)
        cycleEdges.push(idx)
        return true
      }
      pathEdges.push(idx)
      if (dfs(to, curr, path, pathEdges)) return true
      pathEdges.pop()
    }
    path.pop()
    return false
  }
  for (const n of nodes) {
    if (!visited.has(n.id)) {
      if (dfs(n.id, -1, [], [])) return { cycleEdges, cycleNodes }
    }
  }
  return null
}

function isBipartite(nodes, edges) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from) })
  const color = {}
  for (const n of nodes) {
    if (color[n.id] !== undefined) continue
    color[n.id] = 0
    const queue = [n.id]
    while (queue.length > 0) {
      const curr = queue.shift()
      for (const nb of adj[curr]) {
        if (color[nb] === undefined) { color[nb] = 1 - color[curr]; queue.push(nb) }
        else if (color[nb] === color[curr]) return { ok: false, color }
      }
    }
  }
  return { ok: true, color }
}

function GraphProperties() {
  const [tab, setTab] = useState('connected')
  const [clickedNode, setClickedNode] = useState(null)
  const [userColors, setUserColors] = useState({})

  const reachable = clickedNode !== null ? bfsReachable(PROP_NODES_BASE, PROP_EDGES_BASE, clickedNode) : new Set()
  const cycleResult = detectCycle(PROP_NODES_BASE, PROP_EDGES_BASE)
  const bipartite   = isBipartite(PROP_NODES_BASE, PROP_EDGES_BASE)

  const COLORS_2 = [C.blue, C.pink]

  const allReachable = PROP_NODES_BASE.every(n => reachable.has(n.id))

  return (
    <SectionBlock icon="🔍" title="Graph Properties" color={C.purple}>
      <Neuron mood="thinking" message="Graphs have interesting properties: are all nodes connected? Does it have cycles? Can we 2-color it? Let's explore!" />

      <div style={{ display: 'flex', gap: 10, margin: '20px 0' }}>
        {[
          { id: 'connected', label: 'Connected?',       icon: '🔗', color: C.blue   },
          { id: 'cycle',     label: 'Has Cycle?',       icon: '🔄', color: C.red    },
          { id: 'bipartite', label: 'Bipartite Check',  icon: '🎨', color: C.purple },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setClickedNode(null); setUserColors({}) }} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 25,
            background: tab === t.id ? t.color : `${t.color}18`,
            border: `2px solid ${t.color}`,
            color: tab === t.id ? '#fff' : t.color,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            {/* Connected */}
            {tab === 'connected' && (
              <div>
                <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                  A graph is <strong>connected</strong> if you can reach every node from every other node. Click a node — reachable nodes light up!
                </p>
                {clickedNode !== null && (
                  <div style={{
                    marginBottom: 14, padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                    background: allReachable ? `${C.green}20` : `${C.orange}20`,
                    border: `2px solid ${allReachable ? C.green : C.orange}`,
                    color: allReachable ? C.green : C.orange,
                  }}>
                    {allReachable ? `Connected! All ${PROP_NODES_BASE.length} nodes reachable from node ${clickedNode}` : `Not fully connected from node ${clickedNode}`}
                  </div>
                )}
                <svg width="100%" viewBox="0 0 490 280" style={{ overflow: 'visible' }}>
                  {PROP_EDGES_BASE.map((e, i) => {
                    const fn = PROP_NODES_BASE[e.from], tn = PROP_NODES_BASE[e.to]
                    const hl = clickedNode !== null && reachable.has(e.from) && reachable.has(e.to)
                    return <line key={i} x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                      stroke={hl ? C.green : `${C.blue}44`} strokeWidth={hl ? 3 : 2} style={{ transition: 'all 0.3s' }} />
                  })}
                  {PROP_NODES_BASE.map(n => {
                    const hl = reachable.has(n.id)
                    return (
                      <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => setClickedNode(n.id)}>
                        <circle cx={n.x} cy={n.y} r={22}
                          fill={hl && clickedNode !== null ? C.green : 'var(--bg-card)'}
                          stroke={n.id === clickedNode ? C.orange : C.blue} strokeWidth={n.id === clickedNode ? 3.5 : 2}
                          style={{ transition: 'all 0.3s', filter: hl && clickedNode !== null ? `drop-shadow(0 0 8px ${C.green})` : 'none' }} />
                        <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={14} fontWeight={700} fill={hl && clickedNode !== null ? '#fff' : 'var(--text-primary)'}>
                          {n.id}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            )}

            {/* Cycle */}
            {tab === 'cycle' && (
              <div>
                <p style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                  A <strong>cycle</strong> is a path that starts and ends at the same vertex. Highlighted in red below.
                </p>
                {cycleResult ? (
                  <div style={{ marginBottom: 14, padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                    background: `${C.red}15`, border: `2px solid ${C.red}`, color: C.red }}>
                    Cycle found! Nodes: {cycleResult.cycleNodes.join(' → ')} → {cycleResult.cycleNodes[0]}
                  </div>
                ) : (
                  <div style={{ marginBottom: 14, padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                    background: `${C.green}15`, border: `2px solid ${C.green}`, color: C.green }}>
                    No cycle — this is a tree/DAG!
                  </div>
                )}
                <svg width="100%" viewBox="0 0 490 280" style={{ overflow: 'visible' }}>
                  {PROP_EDGES_BASE.map((e, i) => {
                    const fn = PROP_NODES_BASE[e.from], tn = PROP_NODES_BASE[e.to]
                    const inCycle = cycleResult?.cycleEdges.includes(i)
                    return <line key={i} x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                      stroke={inCycle ? C.red : `${C.indigo}44`} strokeWidth={inCycle ? 4 : 2}
                      strokeDasharray={inCycle ? '0' : undefined}
                      style={{ transition: 'all 0.3s' }} />
                  })}
                  {PROP_NODES_BASE.map(n => {
                    const inCycle = cycleResult?.cycleNodes.includes(n.id)
                    return (
                      <g key={n.id}>
                        <circle cx={n.x} cy={n.y} r={22}
                          fill={inCycle ? C.red : 'var(--bg-card)'}
                          stroke={inCycle ? C.red : `${C.indigo}66`} strokeWidth={inCycle ? 3 : 2}
                          style={{ filter: inCycle ? `drop-shadow(0 0 10px ${C.red})` : 'none', transition: 'all 0.3s' }} />
                        <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={14} fontWeight={700} fill={inCycle ? '#fff' : 'var(--text-primary)'}>
                          {n.id}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            )}

            {/* Bipartite */}
            {tab === 'bipartite' && (
              <div>
                <p style={{ marginBottom: 10, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                  <strong>Bipartite:</strong> can you color all nodes with 2 colors so no adjacent nodes share a color? Click nodes to try — or let the algorithm do it!
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  {COLORS_2.map((col, ci) => (
                    <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: col }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: col }} />
                      Color {ci + 1}
                    </div>
                  ))}
                  <button onClick={() => setUserColors(Object.fromEntries(PROP_NODES_BASE.map(n => [n.id, bipartite.color[n.id]])))} style={{
                    marginLeft: 'auto', padding: '6px 14px', borderRadius: 20,
                    background: `${C.purple}20`, border: `1.5px solid ${C.purple}`,
                    color: C.purple, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                    Auto-color
                  </button>
                  <button onClick={() => setUserColors({})} style={{
                    padding: '6px 14px', borderRadius: 20,
                    background: `${C.gray}15`, border: `1.5px solid ${C.gray}`,
                    color: C.gray, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                    Reset
                  </button>
                </div>
                {Object.keys(userColors).length === PROP_NODES_BASE.length && (
                  <div style={{
                    marginBottom: 14, padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                    background: bipartite.ok ? `${C.green}15` : `${C.red}15`,
                    border: `2px solid ${bipartite.ok ? C.green : C.red}`,
                    color: bipartite.ok ? C.green : C.red,
                  }}>
                    {bipartite.ok ? 'Yes! This graph IS bipartite — valid 2-coloring found.' : 'This graph is NOT bipartite — contains an odd-length cycle.'}
                  </div>
                )}
                <svg width="100%" viewBox="0 0 490 280" style={{ overflow: 'visible' }}>
                  {PROP_EDGES_BASE.map((e, i) => {
                    const fn = PROP_NODES_BASE[e.from], tn = PROP_NODES_BASE[e.to]
                    const conflict = userColors[e.from] !== undefined && userColors[e.to] !== undefined && userColors[e.from] === userColors[e.to]
                    return <line key={i} x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                      stroke={conflict ? C.red : `${C.purple}44`} strokeWidth={conflict ? 4 : 2} />
                  })}
                  {PROP_NODES_BASE.map(n => {
                    const c = userColors[n.id]
                    const fill = c !== undefined ? COLORS_2[c] : 'var(--bg-card)'
                    return (
                      <g key={n.id} style={{ cursor: 'pointer' }}
                        onClick={() => setUserColors(prev => ({ ...prev, [n.id]: prev[n.id] === undefined ? 0 : prev[n.id] === 0 ? 1 : undefined }))}>
                        <circle cx={n.x} cy={n.y} r={22}
                          fill={fill}
                          stroke={C.purple} strokeWidth={2.5}
                          style={{ transition: 'all 0.2s' }} />
                        <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={14} fontWeight={700} fill={c !== undefined ? '#fff' : 'var(--text-primary)'}>
                          {n.id}
                        </text>
                      </g>
                    )
                  })}
                </svg>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                  Click nodes to toggle colors. Red edges = conflict (same color on both ends).
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <NeuronTip type="deep">
        These properties are fundamental for algorithms: BFS/DFS for connectivity, DFS for cycle detection, BFS for bipartite check. They all run in O(V + E) time.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function Topic17Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 0 60px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #3b82f615, #6366f115)',
          border: '1px solid #6366f133',
          borderRadius: 24,
          padding: '36px 40px',
          marginBottom: 32,
          textAlign: 'center',
        }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🕸️</div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 38,
          fontWeight: 900,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 12px',
        }}>
          Graphs
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', margin: '0 auto', maxWidth: 560, lineHeight: 1.7 }}>
          Networks, maps, social connections — when trees aren't enough, graphs take over.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          {['Nodes & Edges', 'Directed vs Undirected', 'Adjacency Matrix', 'Adjacency List', 'BFS Reachability', 'Cycle Detection'].map(tag => (
            <span key={tag} style={{
              background: '#6366f115', border: '1px solid #6366f133',
              color: '#6366f1', fontSize: 12, fontWeight: 700,
              padding: '5px 14px', borderRadius: 20,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      <GraphsAreEverywhere />
      <GraphTerminology />
      <GraphRepresentations />
      <BuildAGraph />
      <DirectedVsUndirected />
      <GraphProperties />

      {/* Hindi Summary */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary" color={C.orange}>
        <Neuron mood="waving" message="Aaj humne graphs seekhe — ek powerful data structure jo real-world connections represent karta hai!" />
        <HindiExplainer
          concept="Graph — ग्राफ / आलेख"
          english="Graph Data Structure"
          explanation="Graph ek aisa data structure hai jisme cheezein (nodes/vertices) hoti hain aur unke beech connections (edges) hote hain. Jab trees adequate nahi hote — jaise jab kisi node ke multiple parents ho sakte hain ya connections bidirectional nahi hain — tab graph use karte hain. Social media, road maps, internet routing, package dependencies — sab graphs hain."
          example="Socho ek sheher ka road map. Har sheher ek node hai, aur roads edges hain. Kisi bhi sheher se kisi bhi sheher pahunchne ka raasta dhundhna — ye graph problem hai!"
          terms={[
            { hindi: 'Graph = ग्राफ/आलेख',        english: 'Graph',       meaning: 'Nodes aur edges ka collection' },
            { hindi: 'Vertex = शीर्ष / Node = नोड', english: 'Vertex/Node', meaning: 'Ek individual item ya entity' },
            { hindi: 'Edge = किनारा/कोर',           english: 'Edge',        meaning: 'Do nodes ke beech connection' },
            { hindi: 'Directed = निर्देशित',         english: 'Directed',    meaning: 'Edge ki ek fixed direction hoti hai (→)' },
            { hindi: 'Undirected = अनिर्देशित',      english: 'Undirected',  meaning: 'Edge dono taraf kaam karti hai (↔)' },
            { hindi: 'Path = मार्ग',                 english: 'Path',        meaning: 'Nodes ka sequence connected edges ke through' },
            { hindi: 'Cycle = चक्र',                 english: 'Cycle',       meaning: 'Path jo wapas same node pe aata hai' },
            { hindi: 'Degree = कोटि',                english: 'Degree',      meaning: 'Ek node se jude edges ki sankhya' },
          ]}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 24 }}>
          {[
            { icon: '🗺️', label: 'Road Maps',      desc: 'Cities = nodes, Roads = edges with weights' },
            { icon: '👥', label: 'Social Networks', desc: 'People = nodes, Friendships = edges' },
            { icon: '📦', label: 'Dependencies',   desc: 'Packages = nodes, "requires" = directed edge' },
            { icon: '🌐', label: 'The Internet',    desc: 'Servers = nodes, Links = edges' },
          ].map(item => (
            <motion.div key={item.label} whileHover={{ y: -3 }} style={{
              background: `${C.orange}10`, border: `1px solid ${C.orange}33`,
              borderRadius: 14, padding: '16px 18px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 800, color: C.orange, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>
    </div>
  )
}
