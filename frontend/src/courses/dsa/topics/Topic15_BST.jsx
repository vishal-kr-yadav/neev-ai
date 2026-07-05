import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

// ─────────────────────────────────────────────
// BST NODE LAYOUT HELPERS
// ─────────────────────────────────────────────

class BSTNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
    this.id = Math.random().toString(36).slice(2)
  }
}

function insertBST(root, val) {
  if (!root) return new BSTNode(val)
  if (val < root.val) root.left = insertBST(root.left, val)
  else if (val > root.val) root.right = insertBST(root.right, val)
  return root
}

function buildBST(values) {
  let root = null
  for (const v of values) root = insertBST(root, v)
  return root
}

// Assign x/y positions to each node via in-order traversal
function assignPositions(node, depth, counterRef, result = {}) {
  if (!node) return
  assignPositions(node.left, depth + 1, counterRef, result)
  result[node.id] = { x: counterRef.current * 70, y: depth * 90, depth }
  counterRef.current++
  assignPositions(node.right, depth + 1, counterRef, result)
  return result
}

function getPositions(root) {
  const counterRef = { current: 0 }
  const pos = {}
  assignPositions(root, 0, counterRef, pos)
  return pos
}

function collectEdges(node, positions) {
  if (!node) return []
  const edges = []
  if (node.left && positions[node.id] && positions[node.left.id]) {
    edges.push({ from: positions[node.id], to: positions[node.left.id], id: node.id + '-L' })
    edges.push(...collectEdges(node.left, positions))
  }
  if (node.right && positions[node.id] && positions[node.right.id]) {
    edges.push({ from: positions[node.id], to: positions[node.right.id], id: node.id + '-R' })
    edges.push(...collectEdges(node.right, positions))
  }
  return edges
}

function collectNodes(node, result = []) {
  if (!node) return result
  result.push(node)
  collectNodes(node.left, result)
  collectNodes(node.right, result)
  return result
}

function treeWidth(positions) {
  if (!positions || Object.keys(positions).length === 0) return 0
  const xs = Object.values(positions).map(p => p.x)
  return Math.max(...xs) + 70
}

function treeHeight(positions) {
  if (!positions || Object.keys(positions).length === 0) return 0
  const ys = Object.values(positions).map(p => p.y)
  return Math.max(...ys) + 60
}

// Find in-order successor id
function findMin(node) {
  while (node.left) node = node.left
  return node
}

function deleteBSTNode(root, val) {
  if (!root) return null
  if (val < root.val) { root.left = deleteBSTNode(root.left, val); return root }
  if (val > root.val) { root.right = deleteBSTNode(root.right, val); return root }
  // found
  if (!root.left && !root.right) return null
  if (!root.left) return root.right
  if (!root.right) return root.left
  const successor = findMin(root.right)
  root.val = successor.val
  root.id = root.id // keep same id so positions stay
  root.right = deleteBSTNode(root.right, successor.val)
  return root
}

function cloneTree(node) {
  if (!node) return null
  const n = new BSTNode(node.val)
  n.id = node.id
  n.left = cloneTree(node.left)
  n.right = cloneTree(node.right)
  return n
}

// ─────────────────────────────────────────────
// TREE CANVAS COMPONENT
// ─────────────────────────────────────────────

function TreeCanvas({
  root,
  highlightIds = [],
  grayIds = [],
  greenIds = [],
  redIds = [],
  blueIds = [],
  pathEdgeIds = [],
  activeId = null,
  onNodeClick = null,
  nodeSize = 32,
  label = null,
}) {
  const positions = getPositions(root)
  const edges = collectEdges(root, positions)
  const nodes = collectNodes(root)
  const w = treeWidth(positions)
  const h = treeHeight(positions)

  if (!root) return <div style={{ color: 'var(--text-secondary)', padding: 20, textAlign: 'center' }}>Empty tree</div>

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
      {label && (
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, color: 'var(--text-secondary)', marginBottom: 8 }}>
          {label}
        </div>
      )}
      <svg
        width={Math.max(w, 120)}
        height={Math.max(h, 100)}
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
      >
        {/* Edges */}
        {edges.map(e => {
          const isPath = pathEdgeIds.includes(e.id)
          return (
            <line
              key={e.id}
              x1={e.from.x + nodeSize / 2}
              y1={e.from.y + nodeSize / 2}
              x2={e.to.x + nodeSize / 2}
              y2={e.to.y + nodeSize / 2}
              stroke={isPath ? '#6366f1' : '#cbd5e1'}
              strokeWidth={isPath ? 3 : 2}
              strokeDasharray={isPath ? '6 3' : undefined}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const pos = positions[node.id]
          if (!pos) return null

          const isGreen = greenIds.includes(node.id)
          const isRed = redIds.includes(node.id)
          const isBlue = blueIds.includes(node.id)
          const isActive = activeId === node.id
          const isGray = grayIds.includes(node.id)
          const isHighlight = highlightIds.includes(node.id)

          let fill = '#fff'
          let stroke = '#cbd5e1'
          let textColor = '#1e293b'
          let glow = 'none'

          if (isGray) { fill = '#f1f5f9'; textColor = '#94a3b8'; stroke = '#e2e8f0' }
          if (isHighlight) { fill = '#ede9fe'; stroke = '#7c3aed'; textColor = '#5b21b6' }
          if (isBlue) { fill = '#dbeafe'; stroke = '#3b82f6'; textColor = '#1d4ed8' }
          if (isRed) { fill = '#fee2e2'; stroke = '#ef4444'; textColor = '#991b1b' }
          if (isGreen) { fill = '#d1fae5'; stroke = '#10b981'; textColor = '#065f46'; glow = '0 0 12px #10b98166' }
          if (isActive) { fill = '#fef3c7'; stroke = '#f59e0b'; textColor = '#92400e' }

          return (
            <g
              key={node.id}
              onClick={() => onNodeClick && onNodeClick(node)}
              style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            >
              <motion.circle
                cx={pos.x + nodeSize / 2}
                cy={pos.y + nodeSize / 2}
                r={nodeSize / 2}
                fill={fill}
                stroke={stroke}
                strokeWidth={isActive || isGreen ? 3 : 2}
                style={{ filter: glow !== 'none' ? `drop-shadow(${glow})` : undefined }}
                initial={false}
                animate={{
                  r: isActive || isGreen ? nodeSize / 2 + 3 : nodeSize / 2,
                  fill,
                  stroke,
                }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={pos.x + nodeSize / 2}
                y={pos.y + nodeSize / 2 + 5}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill={textColor}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.val}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
// SECTION 1: THE BST RULE
// ─────────────────────────────────────────────

const RULE_TREE_VALUES = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 90]
const INVALID_TREE = buildBST([50, 30, 70, 20, 40, 60, 80])

// Manually patch invalid tree: put 80 in left subtree of 30
function buildInvalidBST() {
  // Build: 50 root, left=30(left=20,right=80!), right=70(left=60,right=90)
  const root = new BSTNode(50)
  root.left = new BSTNode(30)
  root.left.left = new BSTNode(20)
  root.left.right = new BSTNode(80) // INVALID: 80 > 50, shouldn't be in left subtree
  root.right = new BSTNode(70)
  root.right.left = new BSTNode(60)
  root.right.right = new BSTNode(90)
  return root
}

function getSubtreeIds(node) {
  if (!node) return []
  return [node.id, ...getSubtreeIds(node.left), ...getSubtreeIds(node.right)]
}

function BSTRuleSection() {
  const [clickedNode, setClickedNode] = useState(null)
  const [showInvalid, setShowInvalid] = useState(false)

  const validRoot = buildBST(RULE_TREE_VALUES)
  const validPositions = getPositions(validRoot)
  const validNodes = collectNodes(validRoot)
  const invalidRoot = buildInvalidBST()

  let leftIds = [], rightIds = [], activeId = null
  if (clickedNode) {
    const found = validNodes.find(n => n.val === clickedNode.val)
    if (found) {
      activeId = found.id
      leftIds = getSubtreeIds(found.left)
      rightIds = getSubtreeIds(found.right)
    }
  }

  return (
    <SectionBlock icon="🌳" title="The BST Rule" color="#7c3aed">
      <Neuron mood="explaining" message="Every node in a BST follows ONE rule: all values to the LEFT are SMALLER, all values to the RIGHT are LARGER. This rule applies to EVERY single node — not just the root!" />

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '24px 0',
        background: '#faf5ff', borderRadius: 16, padding: 24, border: '1px solid #e9d5ff'
      }}>
        <div style={{ textAlign: 'center', padding: '16px 12px', borderRadius: 12, background: '#dbeafe', border: '2px solid #3b82f6' }}>
          <div style={{ fontSize: 28 }}>◀</div>
          <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: 18 }}>LEFT subtree</div>
          <div style={{ fontSize: 14, color: '#3b82f6', marginTop: 4 }}>All values SMALLER than node</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 12px', borderRadius: 12, background: '#fee2e2', border: '2px solid #ef4444' }}>
          <div style={{ fontSize: 28 }}>▶</div>
          <div style={{ fontWeight: 800, color: '#991b1b', fontSize: 18 }}>RIGHT subtree</div>
          <div style={{ fontSize: 14, color: '#ef4444', marginTop: 4 }}>All values LARGER than node</div>
        </div>
      </div>

      <InteractiveDemo
        title="Click Any Node — See the Rule!"
        instruction="Click a node to highlight its left subtree (blue = smaller) and right subtree (red = larger)."
      >
        <TreeCanvas
          root={validRoot}
          blueIds={leftIds}
          redIds={rightIds}
          activeId={activeId}
          onNodeClick={setClickedNode}
        />
        {clickedNode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: '12px 20px', borderRadius: 12,
              background: '#fff', border: '1.5px solid #e9d5ff', fontSize: 15
            }}
          >
            <strong style={{ color: '#7c3aed' }}>Node {clickedNode.val}:</strong>
            <span style={{ color: '#1d4ed8', marginLeft: 8 }}>Blue = values &lt; {clickedNode.val}</span>
            <span style={{ color: '#991b1b', marginLeft: 8 }}>Red = values &gt; {clickedNode.val}</span>
          </motion.div>
        )}
        <button
          onClick={() => setClickedNode(null)}
          style={{
            marginTop: 12, padding: '8px 18px', borderRadius: 20, border: '1px solid #e9d5ff',
            background: '#faf5ff', color: '#7c3aed', fontWeight: 600, cursor: 'pointer', fontSize: 14
          }}
        >
          Clear Selection
        </button>
      </InteractiveDemo>

      <NeuronTip type="warning">
        <strong>Invalid BST Example:</strong> The rule must hold for ALL nodes — not just immediate children!
      </NeuronTip>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0' }}>
        <button
          onClick={() => setShowInvalid(!showInvalid)}
          style={{
            padding: '10px 22px', borderRadius: 20, border: '2px solid #ef4444',
            background: showInvalid ? '#ef4444' : '#fff', color: showInvalid ? '#fff' : '#ef4444',
            fontWeight: 700, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s'
          }}
        >
          {showInvalid ? 'Hide' : 'Show'} Invalid BST
        </button>
      </div>

      <AnimatePresence>
        {showInvalid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div style={{
              background: '#fef2f2', border: '2px solid #ef4444', borderRadius: 16,
              padding: 20, marginBottom: 16
            }}>
              <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: 8, fontSize: 15 }}>
                ❌ INVALID BST — node 80 is in the LEFT subtree of 50, but 80 &gt; 50!
              </div>
              <TreeCanvas root={invalidRoot} redIds={[invalidRoot.left.right.id]} />
              <div style={{ marginTop: 12, fontSize: 14, color: '#7f1d1d' }}>
                The node <strong>80</strong> is in the left branch of <strong>50</strong> — that violates the BST rule because 80 &gt; 50.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HindiExplainer
        concept="BST का नियम"
        english="BST Rule"
        explanation="हर node के लिए एक simple नियम: बाईं तरफ (LEFT) हमेशा छोटे numbers, दाईं तरफ (RIGHT) हमेशा बड़े numbers। यह नियम हर एक node पर लागू होता है, सिर्फ root पर नहीं।"
        example="जैसे dictionary में words alphabetical order में होते हैं — A से पहले B नहीं आ सकता। BST में भी हर node अपना 'order' maintain करता है।"
        terms={[
          { hindi: 'बाईं शाखा', english: 'Left subtree', meaning: 'सभी values node से छोटी' },
          { hindi: 'दाईं शाखा', english: 'Right subtree', meaning: 'सभी values node से बड़ी' },
          { hindi: 'अमान्य BST', english: 'Invalid BST', meaning: 'जहाँ यह नियम टूटता हो' },
        ]}
      />
    </SectionBlock>
  )
}

// ─────────────────────────────────────────────
// SECTION 2: BST SEARCH VISUALIZER
// ─────────────────────────────────────────────

const SEARCH_TREE_VALUES = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 90]

function BSTSearchSection() {
  const root = buildBST(SEARCH_TREE_VALUES)
  const allNodes = collectNodes(root)
  const [target, setTarget] = useState('')
  const [searchState, setSearchState] = useState(null) // { steps, currentStep, path, grayIds, found }
  const [stepIndex, setStepIndex] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const animRef = useRef(null)

  function doSearch(val) {
    const steps = []
    let cur = root
    while (cur) {
      steps.push({ nodeId: cur.id, nodeVal: cur.val, comparison: val === cur.val ? 'equal' : val < cur.val ? 'left' : 'right' })
      if (val === cur.val) break
      cur = val < cur.val ? cur.left : cur.right
    }
    return steps
  }

  function computeGrayIds(steps, upToIndex) {
    const gray = []
    for (let i = 0; i <= upToIndex; i++) {
      const step = steps[i]
      if (!step) continue
      const node = allNodes.find(n => n.id === step.nodeId)
      if (!node) continue
      if (step.comparison === 'left') gray.push(...getSubtreeIds(node.right))
      if (step.comparison === 'right') gray.push(...getSubtreeIds(node.left))
    }
    return [...new Set(gray)]
  }

  async function handleSearch() {
    const val = parseInt(target)
    if (isNaN(val)) return
    setIsAnimating(true)
    const steps = doSearch(val)
    setSearchState({ steps, found: steps[steps.length - 1]?.comparison === 'equal' })
    setStepIndex(0)
    for (let i = 1; i <= steps.length; i++) {
      await new Promise(res => { animRef.current = setTimeout(res, 700) })
      setStepIndex(i - 1)
    }
    setIsAnimating(false)
  }

  function handleReset() {
    clearTimeout(animRef.current)
    setSearchState(null)
    setStepIndex(-1)
    setTarget('')
    setIsAnimating(false)
  }

  const currentStep = searchState?.steps?.[stepIndex]
  const pathIds = searchState?.steps?.slice(0, stepIndex + 1).map(s => s.nodeId) || []
  const grayIds = searchState ? computeGrayIds(searchState.steps, stepIndex) : []
  const greenIds = (currentStep?.comparison === 'equal') ? [currentStep.nodeId] : []
  const activeId = currentStep && currentStep.comparison !== 'equal' ? currentStep.nodeId : null

  const linearSteps = allNodes.length

  return (
    <SectionBlock icon="🔍" title="BST Search Visualizer" color="#0ea5e9">
      <Neuron mood="thinking" message="Watch how BST search ELIMINATES half the tree at every step — just like Binary Search, but on a tree structure!" />

      <InteractiveDemo
        title="Search the BST"
        instruction={`Type a value (try: ${SEARCH_TREE_VALUES.slice(0, 5).join(', ')}...) and watch the search path animate.`}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number"
            value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAnimating && handleSearch()}
            placeholder="Enter a value..."
            style={{
              padding: '10px 16px', borderRadius: 12, border: '2px solid #e2e8f0',
              fontSize: 16, width: 180, fontFamily: 'inherit',
              outline: 'none', transition: 'border-color 0.2s',
            }}
            disabled={isAnimating}
          />
          <button
            onClick={handleSearch}
            disabled={isAnimating || !target}
            style={{
              padding: '10px 24px', borderRadius: 20, border: 'none',
              background: '#0ea5e9', color: '#fff', fontWeight: 700,
              cursor: isAnimating || !target ? 'not-allowed' : 'pointer',
              fontSize: 15, opacity: isAnimating || !target ? 0.6 : 1,
            }}
          >
            {isAnimating ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px', borderRadius: 20, border: '1.5px solid #e2e8f0',
              background: '#fff', color: '#64748b', fontWeight: 600,
              cursor: 'pointer', fontSize: 14,
            }}
          >
            Reset
          </button>
        </div>

        <TreeCanvas
          root={root}
          grayIds={grayIds}
          greenIds={greenIds}
          activeId={activeId}
          highlightIds={pathIds.filter(id => !greenIds.includes(id) && id !== activeId)}
        />

        {searchState && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 16 }}
          >
            {/* Step log */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12
            }}>
              {searchState.steps.map((step, i) => (
                <motion.div
                  key={step.nodeId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: i <= stepIndex ? 1 : 0.8, opacity: i <= stepIndex ? 1 : 0.3 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                    background: step.comparison === 'equal' ? '#d1fae5' : step.comparison === 'left' ? '#dbeafe' : '#fee2e2',
                    color: step.comparison === 'equal' ? '#065f46' : step.comparison === 'left' ? '#1d4ed8' : '#991b1b',
                    border: `1.5px solid ${step.comparison === 'equal' ? '#10b981' : step.comparison === 'left' ? '#3b82f6' : '#ef4444'}`,
                  }}
                >
                  {step.nodeVal} → {step.comparison === 'equal' ? '✓ FOUND!' : step.comparison === 'left' ? '◀ go left' : '▶ go right'}
                </motion.div>
              ))}
            </div>

            {/* Comparison panel */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
              background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#0ea5e9', fontSize: 14, marginBottom: 4 }}>BST Search</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{pathIds.length}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>steps to find {target}</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 14, marginBottom: 4 }}>Linear Search</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{linearSteps}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>nodes checked (worst case)</div>
              </div>
            </div>

            {searchState.found && stepIndex >= searchState.steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  marginTop: 12, padding: '12px 20px', borderRadius: 12,
                  background: '#d1fae5', border: '2px solid #10b981', color: '#065f46',
                  fontWeight: 700, fontSize: 15, textAlign: 'center'
                }}
              >
                Found {target} in {pathIds.length} step{pathIds.length !== 1 ? 's' : ''} vs {linearSteps} in linear search!
              </motion.div>
            )}

            {!searchState.found && !isAnimating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  marginTop: 12, padding: '12px 20px', borderRadius: 12,
                  background: '#fef2f2', border: '2px solid #ef4444', color: '#991b1b',
                  fontWeight: 700, fontSize: 15, textAlign: 'center'
                }}
              >
                {target} not found in the tree.
              </motion.div>
            )}
          </motion.div>
        )}
      </InteractiveDemo>

      <NeuronTip type="tip">
        Each step eliminates roughly HALF the remaining nodes. With 15 nodes, you only need ~4 steps max — that's O(log n) in action!
      </NeuronTip>

      <HindiExplainer
        concept="BST Search कैसे काम करता है"
        english="BST Search"
        explanation="जैसे dictionary में 'M' ढूंढने के लिए बीच में खोलते हैं — अगर आगे है तो आगे, पीछे है तो पीछे। BST में भी हर node पर decision होता है: छोटा है तो left जाओ, बड़ा है तो right जाओ। हर step में आधा tree eliminate हो जाता है!"
        example="15 nodes वाले BST में कोई भी value ढूंढने में maximum 4 steps लगते हैं। Linear search में 15 steps लगते। यही है O(log n) की power!"
        terms={[
          { hindi: 'खोज पथ', english: 'Search path', meaning: 'जो nodes visit हुए' },
          { hindi: 'समाप्त', english: 'Eliminate', meaning: 'एक पूरा subtree ignore करना' },
          { hindi: 'O(log n)', english: 'Logarithmic', meaning: 'हर step में problem आधी हो जाती है' },
        ]}
      />
    </SectionBlock>
  )
}

// ─────────────────────────────────────────────
// SECTION 3: BST INSERT VISUALIZER
// ─────────────────────────────────────────────

const BALANCED_PRESET = [5, 3, 7, 1, 4, 6, 8]
const DEGENERATE_PRESET = [1, 2, 3, 4, 5, 6, 7]

function BSTInsertSection() {
  const [insertedVals, setInsertedVals] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [fallingPath, setFallingPath] = useState([]) // node ids visited during last insert
  const [newNodeId, setNewNodeId] = useState(null)
  const [preset, setPreset] = useState(null)

  const root = insertedVals.reduce((r, v) => insertBST(r, v), null)

  function getInsertPath(rt, val) {
    const path = []
    let cur = rt
    while (cur) {
      path.push(cur.id)
      if (val < cur.val) cur = cur.left
      else if (val > cur.val) cur = cur.right
      else break
    }
    return path
  }

  async function handleInsert(valToInsert) {
    const val = parseInt(valToInsert ?? inputVal)
    if (isNaN(val)) return
    if (insertedVals.includes(val)) { setInputVal(''); return }

    // compute path before inserting
    const pathIds = getInsertPath(root, val)
    setFallingPath(pathIds)

    // slight delay then add
    await new Promise(res => setTimeout(res, 400))
    setInsertedVals(prev => {
      const newRoot = prev.reduce((r, v) => insertBST(r, v), null)
      const newNode = insertBST(newRoot ? cloneTree(newRoot) : null, val)
      // find the new node id
      return [...prev, val]
    })
    setInputVal('')

    // after insert, highlight new node
    setTimeout(() => {
      const newR = [...insertedVals, val].reduce((r, v) => insertBST(r, v), null)
      const all = collectNodes(newR)
      const found = all.find(n => n.val === val)
      if (found) setNewNodeId(found.id)
      setFallingPath([])
      setTimeout(() => setNewNodeId(null), 1200)
    }, 100)
  }

  function handlePreset(vals) {
    setInsertedVals([])
    setFallingPath([])
    setNewNodeId(null)
    setPreset(vals)
    let i = 0
    const interval = setInterval(async () => {
      if (i < vals.length) {
        const v = vals[i]
        setInsertedVals(prev => [...prev, v])
        i++
      } else {
        clearInterval(interval)
        setPreset(null)
      }
    }, 500)
  }

  function handleReset() {
    setInsertedVals([])
    setInputVal('')
    setFallingPath([])
    setNewNodeId(null)
    setPreset(null)
  }

  const allIds = root ? collectNodes(root).map(n => n.id) : []

  return (
    <SectionBlock icon="➕" title="BST Insert Visualizer" color="#10b981">
      <Neuron mood="excited" message="Every value finds its exact home by following the BST rule. Watch values 'fall' down the tree until they find an empty spot!" />

      <InteractiveDemo
        title="Build a BST Step by Step"
        instruction="Insert values one by one, or try the presets to see balanced vs degenerate trees!"
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
          <input
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInsert()}
            placeholder="Enter value..."
            style={{
              padding: '10px 16px', borderRadius: 12, border: '2px solid #e2e8f0',
              fontSize: 16, width: 160, fontFamily: 'inherit',
            }}
            disabled={!!preset}
          />
          <button
            onClick={() => handleInsert()}
            disabled={!inputVal || !!preset}
            style={{
              padding: '10px 22px', borderRadius: 20, border: 'none',
              background: '#10b981', color: '#fff', fontWeight: 700,
              cursor: !inputVal || !!preset ? 'not-allowed' : 'pointer',
              fontSize: 15, opacity: !inputVal || !!preset ? 0.5 : 1,
            }}
          >
            Insert
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 18px', borderRadius: 20, border: '1.5px solid #e2e8f0',
              background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14
            }}
          >
            Reset
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => { handleReset(); setTimeout(() => handlePreset(BALANCED_PRESET), 100) }}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '2px solid #10b981',
              background: '#d1fae5', color: '#065f46', fontWeight: 700,
              cursor: 'pointer', fontSize: 13,
            }}
          >
            Try Balanced: [5,3,7,1,4,6,8]
          </button>
          <button
            onClick={() => { handleReset(); setTimeout(() => handlePreset(DEGENERATE_PRESET), 100) }}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '2px solid #ef4444',
              background: '#fee2e2', color: '#991b1b', fontWeight: 700,
              cursor: 'pointer', fontSize: 13,
            }}
          >
            Try Sorted: [1,2,3,4,5,6,7] 💀
          </button>
        </div>

        {/* Inserted values trail */}
        {insertedVals.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {insertedVals.map((v, i) => (
              <motion.span
                key={v}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: '#f0fdf4', border: '1.5px solid #86efac',
                  color: '#166534', fontWeight: 700, fontSize: 13
                }}
              >
                {v}
              </motion.span>
            ))}
          </div>
        )}

        {root ? (
          <TreeCanvas
            root={root}
            highlightIds={fallingPath}
            greenIds={newNodeId ? [newNodeId] : []}
          />
        ) : (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: '#94a3b8', fontSize: 15, border: '2px dashed #e2e8f0', borderRadius: 16
          }}>
            Insert a value to start building the tree!
          </div>
        )}

        {insertedVals.length === 7 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: '14px 20px', borderRadius: 12,
              background: '#fff', border: '1px solid #e2e8f0', fontSize: 14, lineHeight: 1.7
            }}
          >
            {JSON.stringify(insertedVals) === JSON.stringify(DEGENERATE_PRESET) ? (
              <span style={{ color: '#991b1b' }}>
                <strong>Degenerate BST!</strong> Sorted input creates a straight line — this is worst-case O(n) for all operations!
              </span>
            ) : (
              <span style={{ color: '#065f46' }}>
                <strong>Balanced BST!</strong> Height = {Math.ceil(Math.log2(insertedVals.length + 1))} — search is O(log n)!
              </span>
            )}
          </motion.div>
        )}
      </InteractiveDemo>

      <NeuronTip type="fun">
        Insert order matters HUGELY! The same 7 numbers can produce a perfect tree (height 3) or a straight line (height 7) — just depending on which value comes first!
      </NeuronTip>
    </SectionBlock>
  )
}

// ─────────────────────────────────────────────
// SECTION 4: BST DELETE
// ─────────────────────────────────────────────

const DELETE_TREE_VALUES = [50, 30, 70, 20, 40, 60, 80, 10, 35, 55, 75, 90]

function getDeleteCase(node) {
  const hasLeft = !!node.left
  const hasRight = !!node.right
  if (!hasLeft && !hasRight) return 'leaf'
  if (hasLeft && !hasRight) return 'one-child-left'
  if (!hasLeft && hasRight) return 'one-child-right'
  return 'two-children'
}

function BSTDeleteSection() {
  const [treeVals, setTreeVals] = useState(DELETE_TREE_VALUES)
  const [selectedVal, setSelectedVal] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | highlighting | done
  const [successorId, setSuccessorId] = useState(null)
  const [deletedCase, setDeletedCase] = useState(null)
  const [message, setMessage] = useState('')

  const root = buildBST(treeVals)
  const allNodes = collectNodes(root)

  function findNodeByVal(val) {
    return allNodes.find(n => n.val === val)
  }

  async function handleNodeClick(node) {
    if (phase !== 'idle') return
    setSelectedVal(node.val)
    setPhase('highlighting')

    const deleteCase = getDeleteCase(node)
    setDeletedCase(deleteCase)

    let msg = ''
    if (deleteCase === 'leaf') {
      msg = `Case 1: LEAF NODE — just remove it! No children, no problem.`
    } else if (deleteCase === 'one-child-left' || deleteCase === 'one-child-right') {
      msg = `Case 2: ONE CHILD — the child steps up to take its parent's place.`
    } else {
      // find in-order successor
      let successorNode = node.right
      while (successorNode.left) successorNode = successorNode.left
      setSuccessorId(successorNode.id)
      msg = `Case 3: TWO CHILDREN — find in-order successor (${successorNode.val}), copy its value here, then delete the successor.`
    }
    setMessage(msg)

    await new Promise(res => setTimeout(res, 1200))

    setTreeVals(prev => {
      const newRoot = buildBST(prev)
      const afterDelete = deleteBSTNode(newRoot, node.val)
      const result = collectNodes(afterDelete).map(n => n.val)
      return result
    })

    setPhase('done')
    setSuccessorId(null)
    setTimeout(() => {
      setPhase('idle')
      setSelectedVal(null)
      setDeletedCase(null)
      setMessage('')
    }, 1500)
  }

  function handleReset() {
    setTreeVals(DELETE_TREE_VALUES)
    setSelectedVal(null)
    setPhase('idle')
    setSuccessorId(null)
    setDeletedCase(null)
    setMessage('')
  }

  const selectedNode = selectedVal !== null ? findNodeByVal(selectedVal) : null
  const activeId = selectedNode?.id

  return (
    <SectionBlock icon="✂️" title="BST Delete — The Tricky Operation" color="#f59e0b">
      <Neuron mood="thinking" message="Deletion has THREE different cases. Leaf nodes are easy. Two-children nodes require finding the in-order successor — the smallest node in the right subtree!" />

      {/* Three cases explanation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, margin: '20px 0' }}>
        {[
          { case: 'Case 1: Leaf', desc: 'No children. Just remove it.', color: '#10b981', bg: '#d1fae5', icon: '🍂' },
          { case: 'Case 2: One Child', desc: 'Child takes parent\'s spot.', color: '#0ea5e9', bg: '#dbeafe', icon: '👆' },
          { case: 'Case 3: Two Children', desc: 'Swap with in-order successor, then delete successor.', color: '#f59e0b', bg: '#fef3c7', icon: '🔄' },
        ].map((c, i) => (
          <div key={i} style={{
            padding: '16px 14px', borderRadius: 14, background: c.bg,
            border: `2px solid ${c.color}`, textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontWeight: 800, color: c.color, fontSize: 13, marginBottom: 4 }}>{c.case}</div>
            <div style={{ fontSize: 13, color: '#475569' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      <InteractiveDemo
        title="Click a Node to Delete It!"
        instruction="Click any node in the tree. The system will detect which case applies and animate the deletion."
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '1.5px solid #e2e8f0',
              background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14
            }}
          >
            Reset Tree
          </button>
          {treeVals.length < 4 && (
            <button
              onClick={handleReset}
              style={{
                padding: '8px 18px', borderRadius: 20, border: '2px solid #f59e0b',
                background: '#fef3c7', color: '#92400e', fontWeight: 700, cursor: 'pointer', fontSize: 14
              }}
            >
              Rebuild Tree
            </button>
          )}
        </div>

        {root ? (
          <TreeCanvas
            root={root}
            activeId={activeId}
            greenIds={successorId ? [successorId] : []}
            onNodeClick={phase === 'idle' ? handleNodeClick : undefined}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>Tree is empty! Reset to rebuild.</div>
        )}

        <AnimatePresence>
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 16, padding: '14px 20px', borderRadius: 12,
                background: deletedCase === 'leaf' ? '#d1fae5' : deletedCase === 'two-children' ? '#fef3c7' : '#dbeafe',
                border: `2px solid ${deletedCase === 'leaf' ? '#10b981' : deletedCase === 'two-children' ? '#f59e0b' : '#3b82f6'}`,
                fontWeight: 600, fontSize: 15, color: '#1e293b'
              }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: 16, fontSize: 13, color: '#94a3b8' }}>
          Nodes remaining: {treeVals.length} | Click any node to delete
        </div>
      </InteractiveDemo>

      <NeuronTip type="deep">
        <strong>In-Order Successor:</strong> The smallest value in the right subtree. It's the next value in sorted order after the node being deleted. Using it to replace the deleted node keeps the BST property intact!
      </NeuronTip>

      <HindiExplainer
        concept="BST Delete के तीन cases"
        english="BST Deletion"
        explanation="Delete करना तीन situations में होता है: (1) Leaf node — बस हटा दो; (2) एक बच्चा — बच्चा parent की जगह ले लेता है; (3) दो बच्चे — In-order successor (right subtree का सबसे छोटा node) की value copy करो, फिर उस successor को delete करो।"
        example="जैसे office में manager resign करे जिसके दो subordinates हों — सबसे सीनियर subordinate manager बन जाता है।"
        terms={[
          { hindi: 'उत्तराधिकारी', english: 'In-order successor', meaning: 'sorted order में अगला element' },
          { hindi: 'पत्ता', english: 'Leaf node', meaning: 'जिसके कोई बच्चे न हों' },
          { hindi: 'पुनर्संरचना', english: 'Restructure', meaning: 'tree को delete के बाद fix करना' },
        ]}
      />
    </SectionBlock>
  )
}

// ─────────────────────────────────────────────
// SECTION 5: UNBALANCED BST PROBLEM
// ─────────────────────────────────────────────

function BSTUnbalancedSection() {
  const [step, setStep] = useState(0)
  const balancedVals = [4, 2, 6, 1, 3, 5, 7]
  const degenerateVals = [1, 2, 3, 4, 5, 6, 7]

  const balancedRoot = buildBST(balancedVals.slice(0, step + 1))
  const degRoot = buildBST(degenerateVals.slice(0, step + 1))

  const balPos = getPositions(balancedRoot)
  const degPos = getPositions(degRoot)
  const balH = treeHeight(balPos)
  const degH = treeHeight(degPos)

  return (
    <SectionBlock icon="⚠️" title="The Unbalanced BST Problem" color="#ef4444">
      <Neuron mood="explaining" message="Insert numbers 1, 2, 3, 4, 5... in order and watch the BST become a LINKED LIST. No branching — just a straight line going right. Search becomes O(n)!" />

      <InteractiveDemo
        title="Balanced vs Degenerate BST"
        instruction={`Slide to add ${step + 1} value${step !== 0 ? 's' : ''}. Left = smart order, Right = sorted order (disaster!)`}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Values added: {step + 1} / 7</span>
            <span style={{ fontSize: 14, color: '#64748b' }}>
              Left height: {Math.ceil(Math.log2(step + 2))} | Right height: {step + 1}
            </span>
          </div>
          <input
            type="range" min={0} max={6} value={step}
            onChange={e => setStep(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            <span>1 node</span>
            <span>7 nodes</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Balanced */}
          <div style={{
            background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 14, padding: 16
          }}>
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: 8, fontSize: 14, textAlign: 'center' }}>
              Smart Order: [4,2,6,1,3,5,7]
            </div>
            <TreeCanvas root={balancedRoot} label="" />
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#166534' }}>Height: ~{Math.ceil(Math.log2(step + 2))}</div>
              <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>O(log n) search</div>
            </div>
          </div>

          {/* Degenerate */}
          <div style={{
            background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 14, padding: 16
          }}>
            <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: 8, fontSize: 14, textAlign: 'center' }}>
              Sorted Order: [1,2,3,4,5,6,7]
            </div>
            <TreeCanvas root={degRoot} label="" />
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#991b1b' }}>Height: {step + 1}</div>
              <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>O(n) search! 💀</div>
            </div>
          </div>
        </div>

        {step === 6 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: '16px 20px', borderRadius: 14,
              background: '#fff7ed', border: '2px solid #fed7aa', fontSize: 14, lineHeight: 1.7
            }}
          >
            <strong style={{ color: '#c2410c' }}>Same 7 numbers, completely different shapes!</strong>
            <br />
            Left tree: height 3, search = max 3 comparisons.
            Right tree: height 7, search = max 7 comparisons (no better than an array!).
            <br /><br />
            <strong>Solution:</strong> Self-balancing trees (AVL, Red-Black) automatically rebalance after insert/delete. That's the advanced next step!
          </motion.div>
        )}
      </InteractiveDemo>

      <NeuronTip type="warning">
        Always inserting sorted data is the worst case for a BST — it destroys the O(log n) guarantee. Real-world BSTs often use randomized insertion or self-balancing variants.
      </NeuronTip>

      <HindiExplainer
        concept="असंतुलित BST की समस्या"
        english="Unbalanced BST Problem"
        explanation="अगर sorted data (1,2,3,4,5...) BST में insert करो, तो tree एक सीधी line बन जाती है — linked list जैसी। इसमें search O(n) हो जाता है, O(log n) नहीं। यही problem solve करने के लिए AVL Tree और Red-Black Tree बने हैं जो automatically balance करते हैं।"
        example="Dictionary को अगर alphabetical order में बनाओ, तो 'A' के बाद 'B', उसके बाद 'C'... यह chain बन जाएगी जिसमें 'Z' ढूंढने में पूरी dictionary scan होगी।"
        terms={[
          { hindi: 'संतुलित', english: 'Balanced', meaning: 'left और right subtree की height similar हो' },
          { hindi: 'अधोगामी', english: 'Degenerate', meaning: 'linked list जैसा straight tree' },
          { hindi: 'स्वतः-संतुलन', english: 'Self-balancing', meaning: 'AVL, Red-Black trees जो auto-balance करते हैं' },
        ]}
      />
    </SectionBlock>
  )
}

// ─────────────────────────────────────────────
// SECTION 6: COMPLEXITY + IN-ORDER TRAVERSAL
// ─────────────────────────────────────────────

function inOrderTraversal(node, result = []) {
  if (!node) return result
  inOrderTraversal(node.left, result)
  result.push({ val: node.val, id: node.id })
  inOrderTraversal(node.right, result)
  return result
}

const COMPLEXITY_TREE = buildBST([50, 30, 70, 20, 40, 60, 80, 10, 35, 55, 65, 75])

function BSTComplexitySection() {
  const [n, setN] = useState(15)
  const [showTraversal, setShowTraversal] = useState(false)
  const [traversalStep, setTraversalStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)

  const logN = Math.ceil(Math.log2(n + 1))
  const inorder = inOrderTraversal(COMPLEXITY_TREE)

  async function runTraversal() {
    setShowTraversal(true)
    setIsRunning(true)
    setTraversalStep(-1)
    for (let i = 0; i < inorder.length; i++) {
      await new Promise(res => setTimeout(res, 350))
      setTraversalStep(i)
    }
    setIsRunning(false)
  }

  const visitedIds = inorder.slice(0, traversalStep + 1).map(n => n.id)

  const ops = [
    { name: 'Search', balanced: `O(log n) = ${logN}`, worst: `O(n) = ${n}`, color: '#0ea5e9' },
    { name: 'Insert', balanced: `O(log n) = ${logN}`, worst: `O(n) = ${n}`, color: '#10b981' },
    { name: 'Delete', balanced: `O(log n) = ${logN}`, worst: `O(n) = ${n}`, color: '#f59e0b' },
    { name: 'In-Order Traversal', balanced: `O(n) = ${n}`, worst: `O(n) = ${n}`, special: '→ gives SORTED output!', color: '#7c3aed' },
  ]

  return (
    <SectionBlock icon="📊" title="BST Operations Complexity" color="#7c3aed">
      <Neuron mood="happy" message="The magic of BST: every operation is O(log n) on a balanced tree. And In-Order traversal gives you a FREE sorted array!" />

      <InteractiveDemo title="Complexity Explorer" instruction="Slide to change n and see how operation counts scale.">
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 16 }}>n = {n} nodes</span>
            <span style={{ fontSize: 14, color: '#7c3aed', fontWeight: 700 }}>log₂({n}) ≈ {logN}</span>
          </div>
          <input
            type="range" min={7} max={1000} value={n}
            onChange={e => setN(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {ops.map((op, i) => (
            <div key={i} style={{
              background: '#fff', border: `1.5px solid ${op.color}22`,
              borderLeft: `4px solid ${op.color}`,
              borderRadius: 12, padding: '14px 18px',
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'center'
            }}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>{op.name}</div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Balanced</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: op.color }}>{op.balanced}</div>
              </div>
              <div>
                {op.special ? (
                  <div style={{ fontSize: 13, color: op.color, fontWeight: 700 }}>{op.special}</div>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Worst Case</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>{op.worst}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 10, fontSize: 14 }}>Visual Comparison (n={n})</div>
          {[
            { label: 'BST balanced', val: logN, max: n, color: '#10b981' },
            { label: 'BST worst case', val: n, max: n, color: '#ef4444' },
          ].map((bar, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{bar.label}</span>
                <span style={{ fontWeight: 700, color: bar.color, fontSize: 13 }}>{bar.val} ops</span>
              </div>
              <div style={{ height: 10, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${(bar.val / bar.max) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 80 }}
                  style={{ height: '100%', background: bar.color, borderRadius: 10 }}
                />
              </div>
            </div>
          ))}
        </div>
      </InteractiveDemo>

      {/* In-Order Traversal Demo */}
      <InteractiveDemo title="In-Order Traversal = Free Sort!" instruction="Watch the BST visited in sorted order. In-order traversal always produces sorted output!">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={runTraversal}
            disabled={isRunning}
            style={{
              padding: '10px 24px', borderRadius: 20, border: 'none',
              background: '#7c3aed', color: '#fff', fontWeight: 700,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: 15, opacity: isRunning ? 0.6 : 1,
            }}
          >
            {isRunning ? 'Traversing...' : 'Run In-Order Traversal'}
          </button>
          <button
            onClick={() => { setShowTraversal(false); setTraversalStep(-1) }}
            style={{
              padding: '10px 18px', borderRadius: 20, border: '1.5px solid #e2e8f0',
              background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14
            }}
          >
            Reset
          </button>
        </div>

        <TreeCanvas
          root={COMPLEXITY_TREE}
          highlightIds={visitedIds.slice(0, -1)}
          greenIds={visitedIds.slice(-1)}
        />

        {showTraversal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>
              Visited order (sorted automatically!):
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {inorder.map((item, i) => (
                <motion.span
                  key={item.id}
                  animate={{
                    scale: i <= traversalStep ? 1 : 0.7,
                    opacity: i <= traversalStep ? 1 : 0.2
                  }}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 700,
                    background: i <= traversalStep ? '#ede9fe' : '#f8fafc',
                    color: i <= traversalStep ? '#5b21b6' : '#94a3b8',
                    border: `1.5px solid ${i <= traversalStep ? '#7c3aed' : '#e2e8f0'}`,
                    transition: 'all 0.3s',
                  }}
                >
                  {item.val}
                </motion.span>
              ))}
            </div>
            {traversalStep >= inorder.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 12, padding: '12px 18px', borderRadius: 12,
                  background: '#ede9fe', border: '2px solid #7c3aed',
                  fontWeight: 700, color: '#5b21b6', fontSize: 14
                }}
              >
                Perfectly sorted! In-Order traversal of any BST ALWAYS gives sorted output — O(n).
              </motion.div>
            )}
          </motion.div>
        )}
      </InteractiveDemo>

      <HindiExplainer
        concept="BST की Complexity और In-Order"
        english="BST Complexity"
        explanation="Balanced BST में सभी operations O(log n) हैं। Worst case (degenerate) में O(n) हो सकता है। सबसे cool बात: In-Order traversal (Left → Root → Right) हमेशा sorted output देता है — यानी BST एक free sort का काम भी करता है!"
        example="अगर BST में [50,30,70,20,40,60,80] डालो और In-Order traversal करो, तो output होगा: [20,30,40,50,60,70,80] — automatically sorted!"
        terms={[
          { hindi: 'क्रम-अनुसार', english: 'In-Order', meaning: 'Left → Root → Right traversal' },
          { hindi: 'लघुगणकीय', english: 'Logarithmic', meaning: 'O(log n) — बहुत efficient' },
          { hindi: 'मुक्त छँटाई', english: 'Free sort', meaning: 'traversal से automatically sorted output' },
        ]}
      />
    </SectionBlock>
  )
}

// ─────────────────────────────────────────────
// SECTION 7: HINDI SUMMARY
// ─────────────────────────────────────────────

function BSTHindiSummarySection() {
  return (
    <SectionBlock icon="🇮🇳" title="BST — पूरा सार हिंदी में" color="#ff9933">
      <Neuron mood="waving" message="BST सीख लिया! अब Hindi में एक बार पूरा concept refresh करते हैं 🎉" />

      <div style={{
        background: 'linear-gradient(135deg, #fff8f0, #fff5eb)',
        border: '2px solid #ff993340',
        borderTop: '4px solid #ff9933',
        borderRadius: 18, padding: 28, margin: '20px 0',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e67e22', marginBottom: 16 }}>
          BST = Sorted Family Tree (क्रमबद्ध परिवार-वृक्ष)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '🌳', text: 'हर parent के LEFT में उससे CHHOTE values, RIGHT में BADE values होते हैं।' },
            { icon: '🔍', text: 'Search में हर step पर आधा tree eliminate होता है → O(log n)।' },
            { icon: '➕', text: 'Insert में value सही jagah "गिरती" है BST rule follow करते हुए।' },
            { icon: '✂️', text: 'Delete में 3 cases: leaf हटाओ, एक-बच्चा swap करो, दो-बच्चे → in-order successor लाओ।' },
            { icon: '📏', text: 'Sorted data डालने पर BST degenerate होकर linked list बन जाता है।' },
            { icon: '🎵', text: 'In-Order traversal हमेशा sorted output देता है — free sort!' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 14px', borderRadius: 10,
                background: '#fff', border: '1px solid #ff993320',
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <HindiExplainer
        concept="BST का सम्पूर्ण परिचय"
        english="Binary Search Tree — Complete Summary"
        explanation="BST एक sorted family tree है। Har parent के left mein chhote, right mein bade. Search = har step mein aadha tree eliminate. Insert = sahi jagah dhundho aur baith jao. Delete = teen cases handle karo. In-Order = free sorted output milta hai. Balanced BST mein sab kuch O(log n) hai!"
        example="Phone directory ki tarah socho jisme surnames A-M left side mein, N-Z right side mein hain. Koi bhi naam dhundna is bahut fast kyunki har step pe aadhi directory eliminate ho jaati hai."
        terms={[
          { hindi: 'द्विआधारी खोज वृक्ष', english: 'Binary Search Tree', meaning: 'sorted tree data structure' },
          { hindi: 'क्रम में', english: 'In-Order', meaning: 'Left, Root, Right sequence' },
          { hindi: 'उत्तराधिकारी', english: 'Successor', meaning: 'sorted order में अगला node' },
          { hindi: 'संतुलित', english: 'Balanced', meaning: 'height minimum, operations O(log n)' },
          { hindi: 'पत्ता', english: 'Leaf', meaning: 'बिना बच्चों का node' },
          { hindi: 'निम्नगामी', english: 'Degenerate', meaning: 'linked list बन गया tree' },
        ]}
      />

      <div style={{
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {[
          { op: 'Search', time: 'O(log n)', worst: 'O(n)', icon: '🔍', color: '#0ea5e9' },
          { op: 'Insert', time: 'O(log n)', worst: 'O(n)', icon: '➕', color: '#10b981' },
          { op: 'Delete', time: 'O(log n)', worst: 'O(n)', icon: '✂️', color: '#f59e0b' },
          { op: 'In-Order', time: 'O(n)', worst: 'O(n)', icon: '📋', color: '#7c3aed' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '16px 14px',
              borderRadius: 14,
              background: '#fff',
              border: `2px solid ${item.color}22`,
              borderTop: `4px solid ${item.color}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 15, marginBottom: 4 }}>{item.op}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.time}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>worst: {item.worst}</div>
          </motion.div>
        ))}
      </div>
    </SectionBlock>
  )
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export default function Topic15Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 60px 0' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          padding: '48px 24px 40px',
          background: 'linear-gradient(135deg, #faf5ff, #ede9fe, #dbeafe)',
          borderRadius: 24,
          marginBottom: 36,
          border: '1px solid #e9d5ff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{ fontSize: 56, marginBottom: 12 }}
        >
          🌳
        </motion.div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          marginBottom: 12,
          lineHeight: 1.1,
        }}>
          Binary Search Trees
        </h1>
        <p style={{
          fontSize: 18, color: 'var(--text-secondary)',
          maxWidth: 560, margin: '0 auto 20px',
          lineHeight: 1.6,
        }}>
          A sorted tree where search, insert, and delete all run in <strong>O(log n)</strong>.
          Every node knows exactly which half to search.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Search', color: '#0ea5e9' },
            { label: 'Insert', color: '#10b981' },
            { label: 'Delete', color: '#f59e0b' },
            { label: 'O(log n)', color: '#7c3aed' },
            { label: 'In-Order = Sorted', color: '#ef4444' },
          ].map((tag, i) => (
            <span key={i} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              background: `${tag.color}18`, color: tag.color, border: `1.5px solid ${tag.color}40`,
            }}>
              {tag.label}
            </span>
          ))}
        </div>
      </motion.div>

      <BSTRuleSection />
      <BSTSearchSection />
      <BSTInsertSection />
      <BSTDeleteSection />
      <BSTUnbalancedSection />
      <BSTComplexitySection />
      <BSTHindiSummarySection />
    </div>
  )
}
