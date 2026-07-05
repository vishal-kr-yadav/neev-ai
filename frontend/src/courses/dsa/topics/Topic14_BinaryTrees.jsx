import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 14 — Binary Trees
   Visual-first, interactive, no text walls
================================================================ */

// ─────────────────────────────────────────
// SECTION 1: Trees Are Everywhere
// ─────────────────────────────────────────
const REAL_WORLD_TREES = [
  {
    id: 'family',
    icon: '👨‍👩‍👧‍👦',
    label: 'Family Tree',
    color: '#8b5cf6',
    nodes: [
      { id: 'gp1', label: 'Grandpa', x: 50, y: 8, parent: null },
      { id: 'p1', label: 'Dad', x: 25, y: 34, parent: 'gp1' },
      { id: 'p2', label: 'Uncle', x: 75, y: 34, parent: 'gp1' },
      { id: 'c1', label: 'You', x: 15, y: 62, parent: 'p1' },
      { id: 'c2', label: 'Sibling', x: 35, y: 62, parent: 'p1' },
      { id: 'c3', label: 'Cousin', x: 65, y: 62, parent: 'p2' },
      { id: 'c4', label: 'Cousin 2', x: 85, y: 62, parent: 'p2' },
    ],
  },
  {
    id: 'company',
    icon: '🏢',
    label: 'Org Chart',
    color: '#0ea5e9',
    nodes: [
      { id: 'ceo', label: 'CEO', x: 50, y: 8, parent: null },
      { id: 'vp1', label: 'VP Eng', x: 25, y: 34, parent: 'ceo' },
      { id: 'vp2', label: 'VP Sales', x: 75, y: 34, parent: 'ceo' },
      { id: 'm1', label: 'Mgr A', x: 12, y: 62, parent: 'vp1' },
      { id: 'm2', label: 'Mgr B', x: 38, y: 62, parent: 'vp1' },
      { id: 'm3', label: 'Mgr C', x: 62, y: 62, parent: 'vp2' },
      { id: 'm4', label: 'Mgr D', x: 88, y: 62, parent: 'vp2' },
    ],
  },
  {
    id: 'filesystem',
    icon: '💾',
    label: 'File System',
    color: '#10b981',
    nodes: [
      { id: 'c', label: 'C:\\', x: 50, y: 8, parent: null },
      { id: 'users', label: 'Users', x: 25, y: 34, parent: 'c' },
      { id: 'win', label: 'Windows', x: 75, y: 34, parent: 'c' },
      { id: 'docs', label: 'Documents', x: 12, y: 62, parent: 'users' },
      { id: 'desk', label: 'Desktop', x: 38, y: 62, parent: 'users' },
      { id: 'sys32', label: 'System32', x: 62, y: 62, parent: 'win' },
      { id: 'temp', label: 'Temp', x: 88, y: 62, parent: 'win' },
    ],
  },
  {
    id: 'html',
    icon: '🌐',
    label: 'HTML DOM',
    color: '#f97316',
    nodes: [
      { id: 'html', label: '<html>', x: 50, y: 8, parent: null },
      { id: 'head', label: '<head>', x: 25, y: 34, parent: 'html' },
      { id: 'body', label: '<body>', x: 75, y: 34, parent: 'html' },
      { id: 'title', label: '<title>', x: 12, y: 62, parent: 'head' },
      { id: 'meta', label: '<meta>', x: 38, y: 62, parent: 'head' },
      { id: 'div', label: '<div>', x: 62, y: 62, parent: 'body' },
      { id: 'p', label: '<p>', x: 88, y: 62, parent: 'body' },
    ],
  },
]

function RealWorldTreeViz({ tree }) {
  const nodeMap = {}
  tree.nodes.forEach(n => { nodeMap[n.id] = n })
  const edges = tree.nodes.filter(n => n.parent).map(n => ({
    from: nodeMap[n.parent],
    to: n,
  }))

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '80%' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        {edges.map((e, i) => (
          <motion.line
            key={i}
            x1={`${e.from.x}%`} y1={`${e.from.y + 4}%`}
            x2={`${e.to.x}%`} y2={`${e.to.y - 4}%`}
            stroke={tree.color}
            strokeWidth={2}
            strokeOpacity={0.45}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          />
        ))}
      </svg>
      {tree.nodes.map((node, i) => (
        <motion.div
          key={node.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.07, type: 'spring', stiffness: 280 }}
          style={{
            position: 'absolute',
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
            background: node.parent === null ? tree.color : `${tree.color}22`,
            border: `2px solid ${tree.color}`,
            borderRadius: 10,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: node.parent === null ? '#fff' : tree.color,
            whiteSpace: 'nowrap',
            boxShadow: node.parent === null ? `0 4px 14px ${tree.color}55` : 'none',
          }}
        >
          {node.label}
        </motion.div>
      ))}
    </div>
  )
}

function TreesEverywhereSection() {
  const [active, setActive] = useState(REAL_WORLD_TREES[0].id)
  const current = REAL_WORLD_TREES.find(t => t.id === active)

  return (
    <SectionBlock icon="🌳" title="Trees Are Everywhere">
      <Neuron mood="excited" message="Before we code a single line — look around! Hierarchical data is everywhere. Whenever things have a parent-child relationship, a tree structure appears naturally." />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '24px 0 16px' }}>
        {REAL_WORLD_TREES.map(t => (
          <motion.button
            key={t.id}
            onClick={() => setActive(t.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 30,
              background: active === t.id ? t.color : `${t.color}18`,
              border: `2px solid ${t.color}`,
              color: active === t.id ? '#fff' : t.color,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.25s',
            }}
          >
            <span>{t.icon}</span> {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `${current.color}08`,
            border: `2px solid ${current.color}33`,
            borderRadius: 18,
            padding: '24px 20px',
          }}
        >
          <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: current.color, marginBottom: 8 }}>
            {current.icon} {current.label}
          </div>
          <RealWorldTreeViz tree={current} />
        </motion.div>
      </AnimatePresence>

      <NeuronTip type="fun">
        A <strong>tree</strong> is a connected graph with no cycles. Every node (except the root) has exactly one parent. The root has no parent.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─────────────────────────────────────────
// SECTION 2: Tree Terminology
// ─────────────────────────────────────────

// Fixed 7-node tree layout for terminology
const TERM_TREE = [
  { id: 0, label: 'A', x: 50, y: 8, parent: null, level: 0 },
  { id: 1, label: 'B', x: 25, y: 30, parent: 0, level: 1 },
  { id: 2, label: 'C', x: 75, y: 30, parent: 0, level: 1 },
  { id: 3, label: 'D', x: 12, y: 55, parent: 1, level: 2 },
  { id: 4, label: 'E', x: 38, y: 55, parent: 1, level: 2 },
  { id: 5, label: 'F', x: 62, y: 55, parent: 2, level: 2 },
  { id: 6, label: 'G', x: 88, y: 55, parent: 2, level: 2 },
]

const TERMS = [
  { key: 'root', label: 'Root', color: '#f59e0b', definition: 'Top node with no parent. Tree starts here.', highlight: [0] },
  { key: 'leaf', label: 'Leaf', color: '#10b981', definition: 'Nodes with no children — endpoints of the tree.', highlight: [3, 4, 5, 6] },
  { key: 'parent', label: 'Parent', color: '#6366f1', definition: 'A node that has children below it.', highlight: [0, 1, 2] },
  { key: 'child', label: 'Child', color: '#ec4899', definition: 'A node connected below its parent.', highlight: [1, 2, 3, 4, 5, 6] },
  { key: 'depth', label: 'Depth / Level', color: '#0ea5e9', definition: 'How many edges from root to this node. Root = level 0.', highlight: [0, 1, 2, 3, 4, 5, 6] },
  { key: 'height', label: 'Height', color: '#8b5cf6', definition: 'Longest path from root to any leaf. This tree has height 2.', highlight: [0, 1, 3] },
  { key: 'subtree', label: 'Subtree', color: '#f97316', definition: "Click node B — its subtree is B + D + E. Every node is the root of its own subtree.", highlight: [1, 3, 4] },
]

function TerminologySection() {
  const [activeTerm, setActiveTerm] = useState(null)
  const [subtreeNode, setSubtreeNode] = useState(null)
  const term = activeTerm ? TERMS.find(t => t.key === activeTerm) : null

  function getHighlighted() {
    if (!term) return []
    if (term.key === 'subtree' && subtreeNode !== null) {
      // return subtree of clicked node
      const result = []
      const queue = [subtreeNode]
      while (queue.length) {
        const nid = queue.shift()
        result.push(nid)
        TERM_TREE.filter(n => n.parent === nid).forEach(c => queue.push(c.id))
      }
      return result
    }
    return term.highlight
  }

  const highlighted = getHighlighted()

  function nodeColor(node) {
    if (!term) return '#6366f1'
    if (highlighted.includes(node.id)) {
      if (term.key === 'depth') {
        const colors = ['#f59e0b', '#0ea5e9', '#6366f1']
        return colors[node.level] || '#6366f1'
      }
      return term.color
    }
    return '#94a3b8'
  }

  return (
    <SectionBlock icon="📖" title="Tree Terminology — Hover to Learn">
      <Neuron mood="explaining" message="Hover or click a term below. Watch the tree highlight the concept. No reading required — see it to learn it." />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '20px 0 16px' }}>
        {TERMS.map(t => (
          <motion.button
            key={t.key}
            onClick={() => {
              setActiveTerm(t.key)
              setSubtreeNode(null)
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '7px 16px', borderRadius: 20,
              background: activeTerm === t.key ? t.color : `${t.color}18`,
              border: `2px solid ${t.color}`,
              color: activeTerm === t.key ? '#fff' : t.color,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {term && (
          <motion.div
            key={term.key}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: `${term.color}14`,
              border: `2px solid ${term.color}55`,
              borderRadius: 14,
              padding: '12px 20px',
              marginBottom: 16,
              fontSize: 15,
              color: term.color,
              fontWeight: 600,
            }}
          >
            <strong>{term.label}:</strong> {term.definition}
            {term.key === 'subtree' && <span style={{ marginLeft: 8, fontSize: 13, opacity: 0.8 }}>(Click any node in the tree below)</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Depth level bands */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '75%', borderRadius: 18, overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        {/* Level bands */}
        {activeTerm === 'depth' && [0, 1, 2].map(lvl => (
          <motion.div
            key={lvl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              left: 0, right: 0,
              top: `${lvl === 0 ? 0 : lvl === 1 ? 20 : 43}%`,
              height: lvl === 0 ? '20%' : lvl === 1 ? '23%' : '34%',
              background: ['#f59e0b', '#0ea5e9', '#6366f1'][lvl] + '18',
              borderTop: `1px dashed ${['#f59e0b', '#0ea5e9', '#6366f1'][lvl]}44`,
            }}
          >
            <span style={{ position: 'absolute', right: 10, top: 4, fontSize: 11, fontWeight: 700, color: ['#f59e0b', '#0ea5e9', '#6366f1'][lvl] }}>
              Level {lvl}
            </span>
          </motion.div>
        ))}

        {/* Height arrow */}
        {activeTerm === 'height' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              left: '3%', top: '8%', bottom: '12%',
              width: 3, background: '#8b5cf6',
              borderRadius: 2,
            }}
          >
            <div style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#8b5cf6', whiteSpace: 'nowrap' }}>
              Height = 2
            </div>
          </motion.div>
        )}

        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {TERM_TREE.filter(n => n.parent !== null).map(n => {
            const par = TERM_TREE.find(p => p.id === n.parent)
            const isHighlightedEdge = highlighted.includes(n.id) && highlighted.includes(par.id)
            return (
              <line
                key={n.id}
                x1={`${par.x}%`} y1={`${par.y + 5}%`}
                x2={`${n.x}%`} y2={`${n.y - 5}%`}
                stroke={isHighlightedEdge && term ? term.color : '#cbd5e1'}
                strokeWidth={isHighlightedEdge ? 2.5 : 1.5}
                strokeOpacity={isHighlightedEdge ? 0.9 : 0.5}
              />
            )
          })}
        </svg>

        {TERM_TREE.map(node => {
          const color = nodeColor(node)
          const isHighlighted = highlighted.includes(node.id)
          return (
            <motion.div
              key={node.id}
              onClick={() => {
                if (term?.key === 'subtree') setSubtreeNode(node.id)
              }}
              animate={{
                scale: isHighlighted ? 1.15 : 1,
                boxShadow: isHighlighted ? `0 0 0 3px ${term?.color || '#6366f1'}55, 0 4px 16px ${term?.color || '#6366f1'}44` : '0 2px 8px #0001',
              }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                position: 'absolute',
                left: `${node.x}%`, top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 44, height: 44, borderRadius: '50%',
                background: isHighlighted ? color : '#e2e8f0',
                border: `3px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 16,
                color: isHighlighted ? '#fff' : '#64748b',
                cursor: term?.key === 'subtree' ? 'pointer' : 'default',
                transition: 'background 0.25s, color 0.25s',
              }}
            >
              {node.label}
            </motion.div>
          )
        })}
      </div>

      <NeuronTip type="tip">
        Memorize these terms — they come up in every interview question about trees. Root, Leaf, Height, Depth, Parent, Child, Subtree.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─────────────────────────────────────────
// SECTION 3: Binary Tree Builder
// ─────────────────────────────────────────

let nodeIdCounter = 1
function makeNode(val, parentId) {
  return { id: nodeIdCounter++, val, left: null, right: null, parentId }
}

function computeLayout(node, nodes, depth = 0, counter = { val: 0 }) {
  if (!node) return
  computeLayout(nodes[node.left], nodes, depth + 1, counter)
  node.x = counter.val
  node.y = depth
  counter.val++
  computeLayout(nodes[node.right], nodes, depth + 1, counter)
}

function getTreeNodes(rootId, nodes) {
  if (rootId === null) return []
  const result = []
  const queue = [rootId]
  while (queue.length) {
    const id = queue.shift()
    const n = nodes[id]
    if (!n) continue
    result.push(n)
    if (n.left !== null) queue.push(n.left)
    if (n.right !== null) queue.push(n.right)
  }
  return result
}

function getTreeEdges(rootId, nodes) {
  const edges = []
  getTreeNodes(rootId, nodes).forEach(n => {
    if (n.left !== null && nodes[n.left]) edges.push({ from: n.id, to: n.left })
    if (n.right !== null && nodes[n.right]) edges.push({ from: n.id, to: n.right })
  })
  return edges
}

function TreeBuilderSection() {
  const [nodes, setNodes] = useState(() => {
    const root = makeNode('A', null)
    return { [root.id]: root }
  })
  const [rootId] = useState(() => 1)
  const [selected, setSelected] = useState(null)
  const [addMode, setAddMode] = useState(null) // 'left' | 'right'
  const [nextVal, setNextVal] = useState('B')
  const [error, setError] = useState('')

  const allNodes = getTreeNodes(rootId, nodes)

  // Compute positions
  const positioned = {}
  allNodes.forEach(n => { positioned[n.id] = { ...n } })
  const rootNode = positioned[rootId]
  if (rootNode) computeLayout(rootNode, positioned)

  const maxX = Math.max(...allNodes.map(n => positioned[n.id]?.x ?? 0), 0)
  const maxY = Math.max(...allNodes.map(n => positioned[n.id]?.y ?? 0), 0)
  const W = Math.max(maxX + 1, 1)
  const H = Math.max(maxY + 1, 1)

  const px = (x) => `${((x + 0.5) / W) * 100}%`
  const py = (y) => `${((y + 0.5) / (H + 0.5)) * 88 + 4}%`

  const selectedNode = selected ? nodes[selected] : null

  function handleAddChild(side) {
    if (!selected) return
    const sn = nodes[selected]
    if (side === 'left' && sn.left !== null) { setError('Left child already exists!'); return }
    if (side === 'right' && sn.right !== null) { setError('Right child already exists!'); return }
    setError('')
    const newNode = makeNode(nextVal, selected)
    setNodes(prev => {
      const updated = { ...prev, [newNode.id]: newNode }
      updated[selected] = { ...updated[selected], [side]: newNode.id }
      return updated
    })
    setNextVal(String.fromCharCode(nextVal.charCodeAt(0) + 1))
    setAddMode(null)
  }

  function handleDelete(nodeId) {
    if (nodeId === rootId) { setError("Can't delete root!"); return }
    setError('')
    setNodes(prev => {
      const updated = { ...prev }
      // Remove from parent
      const pid = updated[nodeId].parentId
      if (pid !== null && updated[pid]) {
        if (updated[pid].left === nodeId) updated[pid] = { ...updated[pid], left: null }
        if (updated[pid].right === nodeId) updated[pid] = { ...updated[pid], right: null }
      }
      // Remove subtree
      const toRemove = []
      const q = [nodeId]
      while (q.length) {
        const id = q.shift()
        toRemove.push(id)
        const n = updated[id]
        if (n?.left !== null) q.push(n.left)
        if (n?.right !== null) q.push(n.right)
      }
      toRemove.forEach(id => delete updated[id])
      return updated
    })
    setSelected(null)
  }

  return (
    <SectionBlock icon="🏗️" title="Binary Tree Builder — Build Your Own">
      <Neuron mood="happy" message="Click a node to select it, then add a LEFT or RIGHT child. Max 2 children per node — that's why it's called a BINARY tree (binary = 2)." />

      <InteractiveDemo title="Binary Tree Builder" instruction="Click a node → then add Left or Right child. Click a node again to delete it.">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          {selectedNode ? (
            <>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Selected: <span style={{ color: '#6366f1', fontWeight: 800 }}>{selectedNode.val}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleAddChild('left')}
                disabled={selectedNode.left !== null}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: '2px solid #10b981',
                  background: selectedNode.left !== null ? '#e2e8f0' : '#10b98118',
                  color: selectedNode.left !== null ? '#94a3b8' : '#10b981',
                  fontWeight: 700, fontSize: 13, cursor: selectedNode.left !== null ? 'not-allowed' : 'pointer',
                }}
              >
                + Left ({nextVal})
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleAddChild('right')}
                disabled={selectedNode.right !== null}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: '2px solid #0ea5e9',
                  background: selectedNode.right !== null ? '#e2e8f0' : '#0ea5e918',
                  color: selectedNode.right !== null ? '#94a3b8' : '#0ea5e9',
                  fontWeight: 700, fontSize: 13, cursor: selectedNode.right !== null ? 'not-allowed' : 'pointer',
                }}
              >
                + Right ({nextVal})
              </motion.button>
              {selected !== rootId && (
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(selected)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, border: '2px solid #ef4444',
                    background: '#ef444418', color: '#ef4444',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Delete Subtree
                </motion.button>
              )}
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
              Click any node to select it
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 14px', marginBottom: 12, color: '#ef4444', fontSize: 13, fontWeight: 600 }}
          >
            {error}
          </motion.div>
        )}

        <div style={{ position: 'relative', width: '100%', paddingTop: '55%', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', minHeight: 200 }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {getTreeEdges(rootId, nodes).map(edge => {
              const fn = positioned[edge.from]
              const tn = positioned[edge.to]
              if (!fn || !tn) return null
              return (
                <motion.line
                  key={`${edge.from}-${edge.to}`}
                  x1={px(fn.x)} y1={py(fn.y)}
                  x2={px(tn.x)} y2={py(tn.y)}
                  stroke="#94a3b8" strokeWidth={2}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.35 }}
                />
              )
            })}
          </svg>
          {allNodes.map(n => {
            const p = positioned[n.id]
            if (!p) return null
            const isSelected = selected === n.id
            return (
              <motion.div
                key={n.id}
                layout
                onClick={() => setSelected(isSelected ? null : n.id)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  position: 'absolute',
                  left: px(p.x), top: py(p.y),
                  transform: 'translate(-50%, -50%)',
                  width: 46, height: 46, borderRadius: '50%',
                  background: isSelected ? '#6366f1' : 'var(--bg-card)',
                  border: `3px solid ${isSelected ? '#6366f1' : '#94a3b8'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16,
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 18px #6366f155' : '0 2px 8px #0001',
                  zIndex: 1,
                }}
              >
                {n.val}
              </motion.div>
            )
          })}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Nodes: <strong style={{ color: 'var(--text-primary)' }}>{allNodes.length}</strong></span>
          <span>Height: <strong style={{ color: 'var(--text-primary)' }}>{maxY}</strong></span>
          <span>Max per node: <strong style={{ color: '#6366f1' }}>2 children (binary!)</strong></span>
        </div>
      </InteractiveDemo>
    </SectionBlock>
  )
}

// ─────────────────────────────────────────
// SECTION 4: Tree Traversals
// ─────────────────────────────────────────

// Fixed 7-node tree for traversals
const TRAV_TREE = {
  nodes: [
    { id: 0, val: 4, x: 50, y: 10 },
    { id: 1, val: 2, x: 25, y: 33 },
    { id: 2, val: 6, x: 75, y: 33 },
    { id: 3, val: 1, x: 12, y: 58 },
    { id: 4, val: 3, x: 38, y: 58 },
    { id: 5, val: 5, x: 62, y: 58 },
    { id: 6, val: 7, x: 88, y: 58 },
  ],
  edges: [
    { from: 0, to: 1 }, { from: 0, to: 2 },
    { from: 1, to: 3 }, { from: 1, to: 4 },
    { from: 2, to: 5 }, { from: 2, to: 6 },
  ],
  structure: {
    0: { left: 1, right: 2 },
    1: { left: 3, right: 4 },
    2: { left: 5, right: 6 },
    3: { left: null, right: null },
    4: { left: null, right: null },
    5: { left: null, right: null },
    6: { left: null, right: null },
  },
}

function inOrder(id, struct) {
  if (id === null || id === undefined) return []
  const n = struct[id]
  return [...inOrder(n.left, struct), id, ...inOrder(n.right, struct)]
}
function preOrder(id, struct) {
  if (id === null || id === undefined) return []
  const n = struct[id]
  return [id, ...preOrder(n.left, struct), ...preOrder(n.right, struct)]
}
function postOrder(id, struct) {
  if (id === null || id === undefined) return []
  const n = struct[id]
  return [...postOrder(n.left, struct), ...postOrder(n.right, struct), id]
}
function levelOrder(rootId, struct) {
  const result = []
  const queue = [rootId]
  while (queue.length) {
    const id = queue.shift()
    result.push(id)
    const n = struct[id]
    if (n.left !== null) queue.push(n.left)
    if (n.right !== null) queue.push(n.right)
  }
  return result
}

const TRAVERSALS = [
  {
    key: 'inorder', label: 'In-Order', color: '#10b981',
    badge: 'L → Root → R',
    description: 'Visit left subtree → current node → right subtree. Gives sorted order for a BST!',
    get order() { return inOrder(0, TRAV_TREE.structure) },
  },
  {
    key: 'preorder', label: 'Pre-Order', color: '#6366f1',
    badge: 'Root → L → R',
    description: 'Visit current node first, then left, then right. Good for copying/serializing a tree.',
    get order() { return preOrder(0, TRAV_TREE.structure) },
  },
  {
    key: 'postorder', label: 'Post-Order', color: '#f59e0b',
    badge: 'L → R → Root',
    description: 'Visit children first, root last. Good for deleting a tree or evaluating expressions.',
    get order() { return postOrder(0, TRAV_TREE.structure) },
  },
  {
    key: 'levelorder', label: 'Level-Order (BFS)', color: '#0ea5e9',
    badge: 'Level by Level',
    description: 'Visit all nodes level by level, left to right. Uses a queue — this is BFS on a tree!',
    get order() { return levelOrder(0, TRAV_TREE.structure) },
  },
]

function TraversalSection() {
  const [activeTrav, setActiveTrav] = useState('inorder')
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef(null)

  const trav = TRAVERSALS.find(t => t.key === activeTrav)
  const order = trav.order

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= order.length - 1) {
            setPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 700)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, order.length])

  function startPlay() {
    setStep(-1)
    setPlaying(true)
  }

  function reset() {
    setPlaying(false)
    setStep(-1)
  }

  function handleTravChange(key) {
    setActiveTrav(key)
    setPlaying(false)
    setStep(-1)
  }

  const visitedSet = new Set(order.slice(0, step + 1))

  return (
    <SectionBlock icon="🚶" title="Tree Traversals — Watch Them Play">
      <Neuron mood="thinking" message="Four ways to visit every node in a tree. The ORDER matters! Watch each traversal play out and see the difference." />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '20px 0 12px' }}>
        {TRAVERSALS.map(t => (
          <motion.button
            key={t.key}
            onClick={() => handleTravChange(t.key)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              padding: '9px 16px', borderRadius: 24,
              background: activeTrav === t.key ? t.color : `${t.color}18`,
              border: `2px solid ${t.color}`,
              color: activeTrav === t.key ? '#fff' : t.color,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
            <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.85, fontWeight: 600 }}>{t.badge}</span>
          </motion.button>
        ))}
      </div>

      <motion.div
        key={activeTrav}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: `${trav.color}12`,
          border: `1.5px solid ${trav.color}44`,
          borderRadius: 12, padding: '10px 18px',
          fontSize: 14, color: trav.color, fontWeight: 600, marginBottom: 16,
        }}
      >
        {trav.description}
      </motion.div>

      {/* Tree visualization */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '72%', background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {TRAV_TREE.edges.map(e => {
            const fn = TRAV_TREE.nodes[e.from]
            const tn = TRAV_TREE.nodes[e.to]
            const edgeActive = visitedSet.has(e.from) && visitedSet.has(e.to)
            return (
              <line key={`${e.from}-${e.to}`}
                x1={`${fn.x}%`} y1={`${fn.y + 5}%`}
                x2={`${tn.x}%`} y2={`${tn.y - 5}%`}
                stroke={edgeActive ? trav.color : '#cbd5e1'}
                strokeWidth={edgeActive ? 2.5 : 1.5}
                strokeOpacity={edgeActive ? 0.8 : 0.45}
                style={{ transition: 'stroke 0.3s' }}
              />
            )
          })}
        </svg>
        {TRAV_TREE.nodes.map(node => {
          const visitIdx = order.indexOf(node.id)
          const isVisited = visitedSet.has(node.id)
          const isCurrent = order[step] === node.id
          return (
            <motion.div
              key={node.id}
              animate={{
                scale: isCurrent ? 1.25 : isVisited ? 1.05 : 1,
                boxShadow: isCurrent
                  ? `0 0 0 4px ${trav.color}66, 0 6px 20px ${trav.color}55`
                  : isVisited
                    ? `0 0 0 2px ${trav.color}33`
                    : '0 2px 8px #0001',
              }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                position: 'absolute',
                left: `${node.x}%`, top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 52, height: 52, borderRadius: '50%',
                background: isVisited ? trav.color : 'var(--bg-card)',
                border: `3px solid ${isVisited ? trav.color : '#cbd5e1'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                fontWeight: 800, fontSize: 18,
                color: isVisited ? '#fff' : 'var(--text-muted)',
                transition: 'background 0.25s, color 0.25s, border 0.25s',
                zIndex: 1,
              }}
            >
              {node.val}
              {isVisited && (
                <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.85, lineHeight: 1 }}>
                  #{visitIdx + 1}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={playing ? () => setPlaying(false) : startPlay}
          style={{
            padding: '10px 24px', borderRadius: 24,
            background: playing ? '#ef4444' : trav.color,
            border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          {playing ? '⏸ Pause' : step >= 0 ? '▶ Continue' : '▶ Play'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={reset}
          style={{
            padding: '10px 18px', borderRadius: 24,
            background: 'var(--bg-card)', border: '2px solid var(--border)',
            color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          Reset
        </motion.button>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          Step {Math.max(step, 0)}/{order.length}
        </div>
      </div>

      {/* Result sequence */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Visit order:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {order.map((nodeId, i) => {
            const node = TRAV_TREE.nodes[nodeId]
            const done = i <= step
            return (
              <motion.div
                key={i}
                animate={{ scale: i === step ? 1.2 : 1 }}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: done ? trav.color : 'var(--bg-secondary)',
                  border: `2px solid ${done ? trav.color : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16,
                  color: done ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.25s',
                }}
              >
                {node.val}
              </motion.div>
            )
          })}
        </div>
      </div>
    </SectionBlock>
  )
}

// ─────────────────────────────────────────
// SECTION 5: Traversal Challenge
// ─────────────────────────────────────────

const CHALLENGE_ROUNDS = [
  {
    type: 'inorder',
    label: 'In-Order (L → Root → R)',
    color: '#10b981',
    answer: inOrder(0, TRAV_TREE.structure).map(id => TRAV_TREE.nodes[id].val),
    ids: inOrder(0, TRAV_TREE.structure),
  },
  {
    type: 'preorder',
    label: 'Pre-Order (Root → L → R)',
    color: '#6366f1',
    answer: preOrder(0, TRAV_TREE.structure).map(id => TRAV_TREE.nodes[id].val),
    ids: preOrder(0, TRAV_TREE.structure),
  },
  {
    type: 'postorder',
    label: 'Post-Order (L → R → Root)',
    color: '#f59e0b',
    answer: postOrder(0, TRAV_TREE.structure).map(id => TRAV_TREE.nodes[id].val),
    ids: postOrder(0, TRAV_TREE.structure),
  },
]

function TraversalChallengeSection() {
  const [round, setRound] = useState(0)
  const [userClicks, setUserClicks] = useState([])
  const [score, setScore] = useState(0)
  const [roundDone, setRoundDone] = useState(false)
  const [finished, setFinished] = useState(false)
  const [clickedNodes, setClickedNodes] = useState([]) // tracks node IDs clicked

  const current = CHALLENGE_ROUNDS[round]

  function handleNodeClick(nodeId) {
    if (roundDone) return
    const val = TRAV_TREE.nodes[nodeId].val
    if (clickedNodes.includes(nodeId)) return

    const nextClicks = [...userClicks, val]
    const nextClickedNodes = [...clickedNodes, nodeId]
    setUserClicks(nextClicks)
    setClickedNodes(nextClickedNodes)

    if (nextClicks.length === current.answer.length) {
      const correct = nextClicks.every((v, i) => v === current.answer[i])
      if (correct) setScore(s => s + 1)
      setRoundDone(true)
    }
  }

  function nextRound() {
    if (round + 1 >= CHALLENGE_ROUNDS.length) {
      setFinished(true)
    } else {
      setRound(r => r + 1)
      setUserClicks([])
      setClickedNodes([])
      setRoundDone(false)
    }
  }

  function restart() {
    setRound(0)
    setUserClicks([])
    setClickedNodes([])
    setRoundDone(false)
    setFinished(false)
    setScore(0)
  }

  if (finished) {
    return (
      <SectionBlock icon="🏆" title="Traversal Challenge">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', padding: '40px 20px' }}
        >
          <div style={{ fontSize: 64 }}>{score === 3 ? '🏆' : score >= 2 ? '🥈' : '📚'}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: '16px 0 8px' }}>
            {score} / 3
          </div>
          <div style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 24 }}>
            {score === 3 ? 'Perfect! You know your traversals!' : score >= 2 ? 'Almost there — review once more!' : 'Keep practicing — traversals take time!'}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={restart}
            style={{ padding: '12px 32px', borderRadius: 30, background: '#6366f1', border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </SectionBlock>
    )
  }

  return (
    <SectionBlock icon="🎯" title="Traversal Challenge — Click the Right Order">
      <Neuron mood="thinking" message={`Round ${round + 1}/3: Click nodes in the correct ${current.label} order. Think before you click!`} />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0 8px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: current.color, background: `${current.color}18`, border: `2px solid ${current.color}`, padding: '6px 16px', borderRadius: 20 }}>
          {current.label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          Score: {score}/{round + (roundDone ? 1 : 0)}
        </div>
      </div>

      {/* Tree */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '68%', background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)', marginBottom: 16 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {TRAV_TREE.edges.map(e => {
            const fn = TRAV_TREE.nodes[e.from]
            const tn = TRAV_TREE.nodes[e.to]
            return (
              <line key={`${e.from}-${e.to}`}
                x1={`${fn.x}%`} y1={`${fn.y + 5}%`}
                x2={`${tn.x}%`} y2={`${tn.y - 5}%`}
                stroke="#cbd5e1" strokeWidth={1.5} strokeOpacity={0.5}
              />
            )
          })}
        </svg>
        {TRAV_TREE.nodes.map((node, idx) => {
          const clickIdx = clickedNodes.indexOf(node.id)
          const isClicked = clickIdx !== -1
          const isCorrect = roundDone && isClicked && userClicks[clickIdx] === current.answer[clickIdx]
          const isWrong = roundDone && isClicked && userClicks[clickIdx] !== current.answer[clickIdx]
          const isMissed = roundDone && !isClicked && current.ids.includes(node.id)

          let bg = 'var(--bg-card)'
          let borderColor = '#cbd5e1'
          let textColor = 'var(--text-primary)'
          if (isCorrect) { bg = '#10b981'; borderColor = '#10b981'; textColor = '#fff' }
          else if (isWrong) { bg = '#ef4444'; borderColor = '#ef4444'; textColor = '#fff' }
          else if (isMissed) { bg = '#f59e0b'; borderColor = '#f59e0b'; textColor = '#fff' }
          else if (isClicked) { bg = current.color; borderColor = current.color; textColor = '#fff' }

          return (
            <motion.div
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              whileHover={!roundDone ? { scale: 1.12 } : {}}
              whileTap={!roundDone ? { scale: 0.95 } : {}}
              animate={{ scale: isClicked ? 1.08 : 1 }}
              style={{
                position: 'absolute',
                left: `${node.x}%`, top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 52, height: 52, borderRadius: '50%',
                background: bg, border: `3px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                fontWeight: 800, fontSize: 18,
                color: textColor,
                cursor: roundDone ? 'default' : 'pointer',
                zIndex: 1,
                transition: 'background 0.25s, color 0.25s',
              }}
            >
              {node.val}
              {isClicked && <span style={{ fontSize: 9, lineHeight: 1 }}>#{clickIdx + 1}</span>}
            </motion.div>
          )
        })}
      </div>

      {/* User sequence */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Your order:</span>
        {userClicks.map((v, i) => {
          const correct = roundDone ? v === current.answer[i] : true
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: roundDone ? (correct ? '#10b98122' : '#ef444422') : `${current.color}22`,
                border: `2px solid ${roundDone ? (correct ? '#10b981' : '#ef4444') : current.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15,
                color: roundDone ? (correct ? '#10b981' : '#ef4444') : current.color,
              }}
            >
              {v}
            </motion.div>
          )
        })}
        {Array.from({ length: current.answer.length - userClicks.length }).map((_, i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px dashed var(--border)', opacity: 0.4 }} />
        ))}
      </div>

      {roundDone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 16 }}
        >
          <div style={{
            padding: '12px 20px', borderRadius: 14,
            background: userClicks.every((v, i) => v === current.answer[i]) ? '#f0fdf4' : '#fef2f2',
            border: `1.5px solid ${userClicks.every((v, i) => v === current.answer[i]) ? '#86efac' : '#fca5a5'}`,
            fontSize: 14, fontWeight: 700,
            color: userClicks.every((v, i) => v === current.answer[i]) ? '#166534' : '#991b1b',
            marginBottom: 10,
          }}>
            {userClicks.every((v, i) => v === current.answer[i]) ? '✅ Correct!' : `❌ Correct order was: ${current.answer.join(' → ')}`}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={nextRound}
            style={{ padding: '10px 28px', borderRadius: 24, background: current.color, border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            {round + 1 < CHALLENGE_ROUNDS.length ? 'Next Round →' : 'See Results'}
          </motion.button>
        </motion.div>
      )}
    </SectionBlock>
  )
}

// ─────────────────────────────────────────
// SECTION 6: Types of Binary Trees
// ─────────────────────────────────────────

const TREE_TYPES = [
  {
    key: 'full',
    label: 'Full Binary Tree',
    color: '#6366f1',
    tagline: 'Every node has 0 or 2 children — never 1.',
    formula: 'If height = h, nodes between h+1 and 2^(h+1)−1',
    nodes: [
      { id: 0, x: 50, y: 10, good: true },
      { id: 1, x: 25, y: 35, good: true },
      { id: 2, x: 75, y: 35, good: true },
      { id: 3, x: 12, y: 62, good: true },
      { id: 4, x: 38, y: 62, good: true },
      // node 2 has no children shown → demonstrates "0 children"
    ],
    edges: [[0,1],[0,2],[1,3],[1,4]],
    highlight: [], // nodes that violate (none in full)
  },
  {
    key: 'complete',
    label: 'Complete Binary Tree',
    color: '#0ea5e9',
    tagline: 'All levels full except last; last level filled left-to-right.',
    formula: 'Used in heaps! Left-aligned filling ensures O(log n) height.',
    nodes: [
      { id: 0, x: 50, y: 10 },
      { id: 1, x: 25, y: 35 },
      { id: 2, x: 75, y: 35 },
      { id: 3, x: 12, y: 62 },
      { id: 4, x: 38, y: 62 },
      { id: 5, x: 62, y: 62 },
      // node 6 intentionally missing (rightmost slot unfilled) — still complete
    ],
    edges: [[0,1],[0,2],[1,3],[1,4],[2,5]],
    highlight: [],
  },
  {
    key: 'perfect',
    label: 'Perfect Binary Tree',
    color: '#10b981',
    tagline: 'All leaves at same level. Every internal node has exactly 2 children.',
    formula: 'Height h → exactly 2^(h+1) − 1 nodes. Height 2 = 7 nodes.',
    nodes: [
      { id: 0, x: 50, y: 10 },
      { id: 1, x: 25, y: 35 },
      { id: 2, x: 75, y: 35 },
      { id: 3, x: 12, y: 62 },
      { id: 4, x: 38, y: 62 },
      { id: 5, x: 62, y: 62 },
      { id: 6, x: 88, y: 62 },
    ],
    edges: [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]],
    highlight: [],
  },
  {
    key: 'balanced',
    label: 'Balanced Binary Tree',
    color: '#f97316',
    tagline: 'Height difference between left & right subtrees ≤ 1 at every node.',
    formula: 'AVL trees, Red-Black trees are self-balancing. Keeps operations O(log n).',
    nodes: [
      { id: 0, x: 50, y: 10 },
      { id: 1, x: 25, y: 35 },
      { id: 2, x: 75, y: 35 },
      { id: 3, x: 12, y: 62 },
      { id: 4, x: 38, y: 62 },
    ],
    edges: [[0,1],[0,2],[1,3],[1,4]],
    highlight: [],
    balanceInfo: { left: 2, right: 1, diff: 1, ok: true },
  },
]

function TreeTypeViz({ type, active }) {
  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '75%', background: 'var(--bg-secondary)', borderRadius: 16, border: `2px solid ${active ? type.color : 'var(--border)'}`, transition: 'border 0.3s', overflow: 'visible' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {type.edges.map(([a, b]) => {
          const na = type.nodes[a], nb = type.nodes[b]
          return (
            <line key={`${a}-${b}`}
              x1={`${na.x}%`} y1={`${na.y + 4}%`}
              x2={`${nb.x}%`} y2={`${nb.y - 4}%`}
              stroke={active ? type.color : '#cbd5e1'} strokeWidth={2} strokeOpacity={active ? 0.7 : 0.4}
              style={{ transition: 'stroke 0.3s' }}
            />
          )
        })}
      </svg>
      {type.nodes.map(node => (
        <motion.div
          key={node.id}
          animate={{ scale: active ? 1 : 0.95 }}
          style={{
            position: 'absolute',
            left: `${node.x}%`, top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 38, height: 38, borderRadius: '50%',
            background: active ? type.color : '#e2e8f0',
            border: `2.5px solid ${active ? type.color : '#cbd5e1'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 15,
            color: active ? '#fff' : '#64748b',
            boxShadow: active ? `0 4px 14px ${type.color}44` : 'none',
            transition: 'background 0.3s, color 0.3s',
          }}
        >
          {node.id + 1}
        </motion.div>
      ))}
    </div>
  )
}

function TreeTypesSection() {
  const [active, setActive] = useState('perfect')

  return (
    <SectionBlock icon="🌲" title="Types of Binary Trees">
      <Neuron mood="explaining" message="Not all binary trees are equal! Different shapes have different properties and use-cases. Click each type to explore." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginTop: 20 }}>
        {TREE_TYPES.map(type => (
          <motion.div
            key={type.key}
            onClick={() => setActive(type.key)}
            whileHover={{ y: -4 }}
            style={{
              background: 'var(--bg-card)',
              border: `2px solid ${active === type.key ? type.color : 'var(--border)'}`,
              borderRadius: 18, padding: 20, cursor: 'pointer',
              transition: 'border 0.3s',
              boxShadow: active === type.key ? `0 8px 24px ${type.color}22` : 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: type.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: active === type.key ? type.color : 'var(--text-primary)' }}>
                {type.label}
              </span>
            </div>
            <TreeTypeViz type={type} active={active === type.key} />
            <AnimatePresence>
              {active === type.key && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6, fontWeight: 600 }}>
                    {type.tagline}
                  </p>
                  <div style={{
                    background: `${type.color}10`,
                    border: `1px solid ${type.color}33`,
                    borderRadius: 10, padding: '8px 12px', marginTop: 8,
                    fontSize: 12, color: type.color, fontWeight: 600, lineHeight: 1.5,
                  }}>
                    {type.formula}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <NeuronTip type="deep">
        A <strong>perfect binary tree</strong> with height <em>h</em> has exactly <strong>2^(h+1) − 1</strong> nodes.
        Height 0 → 1 node. Height 1 → 3 nodes. Height 2 → 7 nodes. Height 3 → 15 nodes.
      </NeuronTip>
    </SectionBlock>
  )
}

// ─────────────────────────────────────────
// SECTION 7: Hindi Summary
// ─────────────────────────────────────────

function HindiSummarySection() {
  return (
    <SectionBlock icon="हिं" title="Hindi Summary — हिंदी में सारांश" color="#ff9933">
      <HindiExplainer
        concept="Binary Tree — बाइनरी ट्री"
        english="Binary Tree | Data Structure"
        explanation="Binary Tree एक family tree की तरह है जिसमें har parent (माता-पिता) के maximum 2 bacche (बच्चे) हो सकते हैं। Root sabse upar hota hai (जड़ = शुरुआत), aur Leaf nodes sabse neeche hote hain jinka koi bacha nahi. Depth batata hai ki hum root se kitne neeche hain, aur Height batata hai ki pura tree kitna lamba hai. Traversal matlab — tree ke har node ko ek specific order mein visit karna."
        example="Socho ek parivaar ka tree: Dada-Dadi (root) → Papa-Mama (level 1) → aap aur bhai-behen (level 2 = leaves). Yahi structure computers mein file systems, databases, aur AI mein use hota hai!"
        terms={[
          { hindi: 'वृक्ष / पेड़', english: 'Tree', meaning: 'hierarchical data structure with nodes and edges' },
          { hindi: 'जड़ / मूल', english: 'Root', meaning: 'sabse upar ka node, koi parent nahi' },
          { hindi: 'पत्ता', english: 'Leaf', meaning: 'sabse neeche ka node, koi bacha nahi' },
          { hindi: 'नोड / गांठ', english: 'Node', meaning: 'tree ka har ek element' },
          { hindi: 'गहराई', english: 'Depth', meaning: 'root se kitna neeche hai' },
          { hindi: 'ऊंचाई', english: 'Height', meaning: 'root se sabse door leaf ki distance' },
          { hindi: 'भ्रमण', english: 'Traversal', meaning: 'har node ko visit karna ek order mein' },
          { hindi: 'द्विआधारी', english: 'Binary', meaning: 'do (2) — har node ke max 2 bacche' },
        ]}
      />
    </SectionBlock>
  )
}

// ─────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────

export default function Topic14Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #065f4622, #10b98122)',
          border: '2px solid #10b98144',
          borderRadius: 24,
          padding: '40px 36px',
          marginBottom: 40,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative tree circles */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ repeat: Infinity, duration: 2.5 + i * 0.3, delay: i * 0.2 }}
            style={{
              position: 'absolute',
              width: 20 + i * 6, height: 20 + i * 6,
              borderRadius: '50%',
              border: `2px solid #10b98144`,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              pointerEvents: 'none',
            }}
          />
        ))}
        <div style={{ fontSize: 56, marginBottom: 12 }}>🌳</div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 36, fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 12px',
        }}>
          Topic 14: Binary Trees
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
          Data organized like a family tree — the foundation of databases, file systems, and AI.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          {['Family Trees', 'Traversals', 'BST', 'Heap', 'DOM'].map(tag => (
            <span key={tag} style={{
              background: '#10b98118', border: '1.5px solid #10b98155',
              color: '#10b981', fontSize: 12, fontWeight: 700,
              padding: '4px 14px', borderRadius: 20,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Sections */}
      <TreesEverywhereSection />
      <TerminologySection />
      <TreeBuilderSection />
      <TraversalSection />
      <TraversalChallengeSection />
      <TreeTypesSection />
      <HindiSummarySection />
    </div>
  )
}
