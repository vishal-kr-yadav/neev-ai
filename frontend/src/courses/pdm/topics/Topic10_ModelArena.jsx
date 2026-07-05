import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 10 — Model Arena
   Random Forest vs XGBoost vs LightGBM for Predictive Maintenance
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
  rf: '#10b981',
  xgb: '#f59e0b',
  lgbm: '#6366f1',
}

/* ================================================================
   SECTION 1 — Decision Tree Walker
================================================================ */
const TREE_NODES = {
  root: {
    id: 'root',
    question: 'vibration_dev > 30%?',
    yes: 'vibHigh',
    no: 'vibLow',
    depth: 0,
  },
  vibHigh: {
    id: 'vibHigh',
    question: 'lifecycle_ratio > 0.8?',
    yes: 'leaf_fail85',
    no: 'leaf_fail45',
    depth: 1,
  },
  vibLow: {
    id: 'vibLow',
    question: 'temperature_dev > 25%?',
    yes: 'leaf_fail35',
    no: 'leaf_ok95',
    depth: 1,
  },
  leaf_fail85: { id: 'leaf_fail85', label: 'FAIL', prob: 85, depth: 2, failColor: C.red },
  leaf_fail45: { id: 'leaf_fail45', label: 'FAIL', prob: 45, depth: 2, failColor: C.orange },
  leaf_fail35: { id: 'leaf_fail35', label: 'FAIL', prob: 35, depth: 2, failColor: C.orange },
  leaf_ok95: { id: 'leaf_ok95', label: 'OK', prob: 95, depth: 2, failColor: C.green },
}

const PUMP_SAMPLES = [
  { name: 'Pump A', vibration_dev: 45, lifecycle_ratio: 0.9, temperature_dev: 10, desc: 'High vibration, old pump' },
  { name: 'Pump B', vibration_dev: 12, lifecycle_ratio: 0.5, temperature_dev: 30, desc: 'Low vibration, overheating' },
  { name: 'Pump C', vibration_dev: 8, lifecycle_ratio: 0.3, temperature_dev: 5, desc: 'All normal, healthy pump' },
]

function walkTree(pump) {
  const path = ['root']
  let node = TREE_NODES['root']
  while (!node.label) {
    if (node.id === 'root') {
      const goYes = pump.vibration_dev > 30
      path.push(goYes ? node.yes : node.no)
      node = TREE_NODES[goYes ? node.yes : node.no]
    } else if (node.id === 'vibHigh') {
      const goYes = pump.lifecycle_ratio > 0.8
      path.push(goYes ? node.yes : node.no)
      node = TREE_NODES[goYes ? node.yes : node.no]
    } else if (node.id === 'vibLow') {
      const goYes = pump.temperature_dev > 25
      path.push(goYes ? node.yes : node.no)
      node = TREE_NODES[goYes ? node.yes : node.no]
    }
  }
  return { path, leaf: node }
}

function DecisionTreeSection() {
  const [selectedPump, setSelectedPump] = useState(0)
  const [animStep, setAnimStep] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef = useRef(null)

  const pump = PUMP_SAMPLES[selectedPump]
  const { path, leaf } = walkTree(pump)

  const runAnimation = () => {
    setAnimStep(0)
    setRunning(true)
    let step = 0
    timerRef.current = setInterval(() => {
      step += 1
      setAnimStep(step)
      if (step >= path.length - 1) {
        clearInterval(timerRef.current)
        setRunning(false)
      }
    }, 700)
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    setAnimStep(0)
    setRunning(false)
    clearInterval(timerRef.current)
  }, [selectedPump])

  const isActive = (nodeId) => path.slice(0, animStep + 1).includes(nodeId)
  const isCurrent = (nodeId) => path[animStep] === nodeId

  const NodeBox = ({ nodeId }) => {
    const node = TREE_NODES[nodeId]
    if (!node) return null
    const active = isActive(nodeId)
    const current = isCurrent(nodeId)
    const isLeaf = !!node.label

    return (
      <motion.div
        animate={{
          scale: current ? 1.08 : 1,
          boxShadow: current
            ? `0 0 0 3px ${isLeaf ? (node.label === 'FAIL' ? C.red : C.green) : C.blue}`
            : 'none',
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: active
            ? isLeaf
              ? node.label === 'FAIL'
                ? '#fef2f2'
                : '#f0fdf4'
              : '#eff6ff'
            : 'var(--bg-secondary)',
          border: `2px solid ${
            active
              ? isLeaf
                ? node.failColor || C.green
                : C.blue
              : 'var(--border)'
          }`,
          borderRadius: 12,
          padding: isLeaf ? '10px 18px' : '12px 20px',
          textAlign: 'center',
          minWidth: isLeaf ? 90 : 160,
          cursor: 'default',
        }}
      >
        {isLeaf ? (
          <>
            <div style={{
              fontSize: 18, fontWeight: 800,
              color: node.label === 'FAIL' ? C.red : C.green,
            }}>
              {node.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {node.prob}% confidence
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 600, color: active ? C.blue : 'var(--text-secondary)' }}>
            {node.question}
          </div>
        )}
      </motion.div>
    )
  }

  const Arrow = ({ label, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ width: 2, height: 20, background: color, borderRadius: 1 }} />
    </div>
  )

  return (
    <>
    <SectionBlock icon="🌳" title="Section 1 — How Decision Trees Work" color={C.blue}>
      <Neuron
        mood="explaining"
        size="small"
        message="A Decision Tree is like a flowchart of questions. Each question splits data into two groups. Keep splitting until you reach a leaf — your prediction! Let's trace a pump through the tree."
      />

      <HindiExplainer
        concept="निर्णय वृक्ष (Decision Tree)"
        english="Decision Tree"
        explanation="Decision Tree एक सवाल-जवाब की chain है। पहले सवाल: 'vibration ज़्यादा है?' अगर हाँ, तो अगला सवाल: 'pump पुरानी है?' इस तरह tree नीचे जाते-जाते एक prediction पर पहुँचता है।"
        example="Pump की vibration 45% बढ़ी। पहला सवाल: 45 > 30? हाँ! दूसरा सवाल: lifecycle_ratio > 0.8? अगर हाँ → 85% chance fail। सीधा और समझने में आसान!"
        terms={[
          { hindi: 'निर्णय वृक्ष', english: 'Decision Tree', meaning: 'सवाल-जवाब का क्रमबद्ध ढाँचा' },
          { hindi: 'जड़ (Root)', english: 'Root Node', meaning: 'पेड़ का पहला सवाल' },
          { hindi: 'पत्ती (Leaf)', english: 'Leaf Node', meaning: 'अंतिम prediction — FAIL या OK' },
          { hindi: 'विभाजन', english: 'Split', meaning: 'डेटा को दो हिस्सों में बाँटना' },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Pick a pump to trace through the tree:
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {PUMP_SAMPLES.map((p, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedPump(i)}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: `2px solid ${selectedPump === i ? C.blue : 'var(--border)'}`,
                background: selectedPump === i ? '#eff6ff' : 'var(--bg-secondary)',
                color: selectedPump === i ? C.blue : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              {p.name}
              <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>{p.desc}</div>
            </motion.button>
          ))}
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 20,
          fontSize: 13,
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          <span><strong>vibration_dev:</strong> {pump.vibration_dev}%</span>
          <span><strong>lifecycle_ratio:</strong> {pump.lifecycle_ratio}</span>
          <span><strong>temperature_dev:</strong> {pump.temperature_dev}%</span>
        </div>

        {/* Tree visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Root */}
          <NodeBox nodeId="root" />
          {/* Branch arrows row 1 */}
          <div style={{ display: 'flex', gap: 100, marginTop: 4 }}>
            <Arrow label="YES" color={isActive('vibHigh') ? C.blue : '#ccc'} />
            <Arrow label="NO" color={isActive('vibLow') ? C.blue : '#ccc'} />
          </div>
          {/* Level 1 */}
          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            <NodeBox nodeId="vibHigh" />
            <NodeBox nodeId="vibLow" />
          </div>
          {/* Branch arrows row 2 */}
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 60 }}>
              <Arrow label="YES" color={isActive('leaf_fail85') ? C.red : '#ccc'} />
              <Arrow label="NO" color={isActive('leaf_fail45') ? C.orange : '#ccc'} />
            </div>
            <div style={{ width: 40 }} />
            <div style={{ display: 'flex', gap: 60 }}>
              <Arrow label="YES" color={isActive('leaf_fail35') ? C.orange : '#ccc'} />
              <Arrow label="NO" color={isActive('leaf_ok95') ? C.green : '#ccc'} />
            </div>
          </div>
          {/* Leaves */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            <NodeBox nodeId="leaf_fail85" />
            <NodeBox nodeId="leaf_fail45" />
            <NodeBox nodeId="leaf_fail35" />
            <NodeBox nodeId="leaf_ok95" />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runAnimation}
            disabled={running}
            style={{
              padding: '12px 28px',
              borderRadius: 10,
              border: 'none',
              background: running ? '#94a3b8' : `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: running ? 'not-allowed' : 'pointer',
            }}
          >
            {running ? 'Tracing...' : `Trace ${pump.name} Through Tree`}
          </motion.button>
        </div>

        <AnimatePresence>
          {animStep >= path.length - 1 && path.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 16,
                padding: '16px 24px',
                borderRadius: 12,
                background: leaf.label === 'FAIL' ? '#fef2f2' : '#f0fdf4',
                border: `2px solid ${leaf.label === 'FAIL' ? C.red : C.green}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: leaf.label === 'FAIL' ? C.red : C.green }}>
                {pump.name} → {leaf.label} ({leaf.prob}% confidence)
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Path: {path.join(' → ')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NeuronTip type="tip">
        A single decision tree is easy to understand — you can literally follow the path. But one tree can be brittle: small changes in data can completely change the path. The fix? Use MANY trees together.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="निर्णय वृक्ष — सवाल पूछकर decision लेना"
      english="Decision Tree"
      explanation="Decision Tree बिल्कुल जैसे doctor diagnose करता है: 'vibration > 5 mm/s? हां → temperature > 80°C? हां → FAIL।' हर node पर एक सवाल, हर branch एक answer, leaf पर final decision। Simple और explainable — factory manager को समझाना आसान। लेकिन एक अकेला tree brittle होता है।"
      example="Pump diagnosis tree: Root → 'vibration_dev > 40%?' → हां → 'lifecycle > 85%?' → हां → FAIL (92% confidence)। नहीं → 'mtbf < 30 days?' → हां → FAIL (78%)। नहीं → OK। पूरा path follow करके समझ सकते हैं।"
      terms={[
        { hindi: 'निर्णय वृक्ष', english: 'Decision Tree', meaning: 'if-else questions की tree structure — explainable AI' },
        { hindi: 'विभाजन', english: 'Split / Node', meaning: 'एक feature पर threshold-based question — data को divide करता है' },
        { hindi: 'पत्ती', english: 'Leaf Node', meaning: 'tree का अंत — final prediction यहां होती है' },
      ]}
    />
    </>
  )
}

/* ================================================================
   SECTION 2 — Random Forest Voting
================================================================ */
const RF_TREES_DATA = [
  [
    { trees: 5, votes: ['FAIL','OK','FAIL','FAIL','OK'], confidences: [72,45,81,67,38] },
    { trees: 10, votes: ['FAIL','OK','FAIL','FAIL','OK','FAIL','OK','FAIL','FAIL','OK'], confidences: [72,45,81,67,38,76,42,69,74,51] },
    { trees: 50, failCount: 32, okCount: 18, conf: 64 },
    { trees: 100, failCount: 61, okCount: 39, conf: 61 },
  ]
]

const TREE_SIZES = [5, 10, 50, 100]
const STABILITY_DATA = [
  { n: 5, confidence: 60, variance: 22 },
  { n: 10, confidence: 62, variance: 15 },
  { n: 20, confidence: 63, variance: 10 },
  { n: 50, confidence: 64, variance: 5 },
  { n: 100, confidence: 64, variance: 2 },
]

function RandomForestSection() {
  const [nTrees, setNTrees] = useState(5)
  const [animPhase, setAnimPhase] = useState('idle') // idle | growing | voting | done
  const [grownCount, setGrownCount] = useState(0)
  const timerRef = useRef(null)

  const sizeIdx = TREE_SIZES.indexOf(nTrees)
  const displayTrees = nTrees <= 10 ? nTrees : 5

  const getVotes = () => {
    if (nTrees === 5) return { fail: 3, ok: 2 }
    if (nTrees === 10) return { fail: 6, ok: 4 }
    if (nTrees === 50) return { fail: 32, ok: 18 }
    return { fail: 61, ok: 39 }
  }

  const { fail, ok } = getVotes()
  const conf = Math.round((fail / nTrees) * 100)

  const runForest = () => {
    setAnimPhase('growing')
    setGrownCount(0)
    let count = 0
    timerRef.current = setInterval(() => {
      count += 1
      setGrownCount(count)
      if (count >= displayTrees) {
        clearInterval(timerRef.current)
        setTimeout(() => setAnimPhase('voting'), 400)
        setTimeout(() => setAnimPhase('done'), 1200)
      }
    }, 200)
  }

  useEffect(() => {
    setAnimPhase('idle')
    setGrownCount(0)
    clearInterval(timerRef.current)
  }, [nTrees])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const treeVotes = nTrees <= 10
    ? Array.from({ length: nTrees }, (_, i) => (i < fail ? 'FAIL' : 'OK'))
    : Array.from({ length: 5 }, (_, i) => (i < Math.round(fail / nTrees * 5) ? 'FAIL' : 'OK'))

  return (
    <>
    <SectionBlock icon="🌲" title="Section 2 — Random Forest: The Wise Committee" color={C.rf}>
      <Neuron
        mood="happy"
        size="small"
        message="Random Forest is like a committee of wise experts. Each tree is trained on a random subset of data with random features — they disagree sometimes! But when you take a majority vote, you get stable, reliable predictions."
      />

      <HindiExplainer
        concept="रैंडम फॉरेस्ट (Random Forest)"
        english="Random Forest"
        explanation="Random Forest में बहुत सारे Decision Trees होते हैं, जैसे एक committee। हर tree अलग-अलग data देखता है। सब मिलकर vote करते हैं — जो ज़्यादा बोले, वही prediction! अकेला एक tree गलत हो सकता है, लेकिन 100 trees का committee? बहुत reliable!"
        example="5 trees vote: FAIL, OK, FAIL, FAIL, OK → 3 FAIL, 2 OK → Prediction: FAIL (60% confidence). जैसे 5 doctors में से 3 बोलें 'operation ज़रूरी है' — majority wins!"
        terms={[
          { hindi: 'यादृच्छिक वन', english: 'Random Forest', meaning: 'अनेक decision trees का समूह' },
          { hindi: 'मतदान', english: 'Voting', meaning: 'हर tree का prediction' },
          { hindi: 'बहुमत', english: 'Majority Vote', meaning: 'जो prediction ज़्यादा हो, वो फ़ाइनल' },
          { hindi: 'स्थिरता', english: 'Stability', meaning: 'ज़्यादा trees = ज़्यादा reliable prediction' },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Number of Trees:
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {TREE_SIZES.map(n => (
            <motion.button
              key={n}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNTrees(n)}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: `2px solid ${nTrees === n ? C.rf : 'var(--border)'}`,
                background: nTrees === n ? '#f0fdf4' : 'var(--bg-secondary)',
                color: nTrees === n ? C.rf : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              {n} trees
            </motion.button>
          ))}
        </div>

        {/* Tree grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
          {treeVotes.map((vote, i) => (
            <motion.div
              key={`${nTrees}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: grownCount > i || animPhase === 'idle' ? 1 : 0,
                opacity: grownCount > i || animPhase === 'idle' ? 1 : 0,
              }}
              transition={{ duration: 0.25, delay: animPhase === 'idle' ? i * 0.05 : 0 }}
              style={{
                width: 80, height: 90,
                borderRadius: 12,
                border: `2px solid ${vote === 'FAIL' ? C.red : C.green}`,
                background: vote === 'FAIL' ? '#fef2f2' : '#f0fdf4',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4,
              }}
            >
              <div style={{ fontSize: 24 }}>🌲</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Tree {i + 1}{nTrees > 10 ? '+' : ''}
              </div>
              <AnimatePresence>
                {(animPhase === 'voting' || animPhase === 'done') && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      fontSize: 11, fontWeight: 800,
                      color: vote === 'FAIL' ? C.red : C.green,
                      background: vote === 'FAIL' ? '#fee2e2' : '#dcfce7',
                      padding: '2px 8px', borderRadius: 6,
                    }}
                  >
                    {vote}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {nTrees > 10 && (
            <div style={{
              width: 80, height: 90, borderRadius: 12,
              border: '2px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
            }}>
              +{nTrees - 5} more
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runForest}
            disabled={animPhase === 'growing'}
            style={{
              padding: '12px 28px',
              borderRadius: 10, border: 'none',
              background: animPhase === 'growing' ? '#94a3b8' : `linear-gradient(135deg, ${C.rf}, #059669)`,
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: animPhase === 'growing' ? 'not-allowed' : 'pointer',
            }}
          >
            {animPhase === 'growing' ? 'Growing Trees...' : 'Run Forest Vote'}
          </motion.button>
        </div>

        <AnimatePresence>
          {animPhase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#f0fdf4',
                border: `2px solid ${C.rf}`,
                borderRadius: 14,
                padding: '20px 28px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Vote Breakdown</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontWeight: 800, color: C.red, fontSize: 16 }}>FAIL: {fail}/{nTrees}</span>
                    <span style={{ fontWeight: 800, color: C.green, fontSize: 16 }}>OK: {ok}/{nTrees}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Final Prediction</div>
                  <div style={{ fontWeight: 800, color: fail > ok ? C.red : C.green, fontSize: 20 }}>
                    {fail > ok ? 'FAIL' : 'OK'} ({conf}% confidence)
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stability bar chart */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            More Trees = More Stable (Lower Variance):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STABILITY_DATA.map(d => (
              <div key={d.n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>
                  n={d.n}
                </div>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 6, height: 18, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${d.confidence}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    style={{ height: '100%', background: C.rf, borderRadius: 6 }}
                  />
                </div>
                <div style={{ width: 50, fontSize: 12, color: C.rf, fontWeight: 700 }}>{d.confidence}%</div>
                <div style={{ width: 70, fontSize: 11, color: 'var(--text-secondary)' }}>±{d.variance}% var</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NeuronTip type="fun">
        Random Forest got its name because each tree is trained on a RANDOM bootstrap sample of the data, and at each split, only a RANDOM subset of features is considered. This randomness is what prevents all trees from making the same mistake!
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="रैंडम फॉरेस्ट — 100 experts की committee"
      english="Random Forest: The Wise Committee"
      explanation="Random Forest = 100 decision trees की committee। हर tree अलग-अलग data subset पर train होता है। Pump की reading आने पर सभी 100 trees vote करते हैं — majority wins। जैसे 100 engineers को pump देखने भेजो: 64 कहते हैं 'fail होगा' → final verdict FAIL। एक teacher से 100 teachers की opinion ज़्यादा reliable है।"
      example="5 trees: [FAIL, OK, FAIL, FAIL, OK] → 3 FAIL, 2 OK → FAIL (60% confidence)। 100 trees: 64 FAIL, 36 OK → FAIL (64% confidence)। 100 trees का variance बहुत कम — stable और reliable prediction।"
      terms={[
        { hindi: 'रैंडम फॉरेस्ट', english: 'Random Forest', meaning: 'multiple decision trees की ensemble — majority voting से prediction' },
        { hindi: 'बूटस्ट्रैप नमूना', english: 'Bootstrap Sampling', meaning: 'हर tree के लिए random data subset — diversity ensure करता है' },
        { hindi: 'मतदान', english: 'Voting', meaning: 'सभी trees का final answer — majority जीतती है' },
      ]}
    />
    </>
  )
}

/* ================================================================
   SECTION 3 — XGBoost Boosting
================================================================ */
const BOOST_ROUNDS = [
  {
    round: 1,
    predictions: [
      { pump: 'P1', actual: 'FAIL', pred: 'OK', correct: false },
      { pump: 'P2', actual: 'OK', pred: 'OK', correct: true },
      { pump: 'P3', actual: 'FAIL', pred: 'FAIL', correct: true },
      { pump: 'P4', actual: 'FAIL', pred: 'OK', correct: false },
      { pump: 'P5', actual: 'OK', pred: 'OK', correct: true },
      { pump: 'P6', actual: 'FAIL', pred: 'OK', correct: false },
    ],
    accuracy: 50,
    loss: 0.69,
  },
  {
    round: 2,
    predictions: [
      { pump: 'P1', actual: 'FAIL', pred: 'FAIL', correct: true },
      { pump: 'P2', actual: 'OK', pred: 'OK', correct: true },
      { pump: 'P3', actual: 'FAIL', pred: 'FAIL', correct: true },
      { pump: 'P4', actual: 'FAIL', pred: 'FAIL', correct: true },
      { pump: 'P5', actual: 'OK', pred: 'OK', correct: true },
      { pump: 'P6', actual: 'FAIL', pred: 'OK', correct: false },
    ],
    accuracy: 83,
    loss: 0.38,
  },
  {
    round: 3,
    predictions: [
      { pump: 'P1', actual: 'FAIL', pred: 'FAIL', correct: true },
      { pump: 'P2', actual: 'OK', pred: 'OK', correct: true },
      { pump: 'P3', actual: 'FAIL', pred: 'FAIL', correct: true },
      { pump: 'P4', actual: 'FAIL', pred: 'FAIL', correct: true },
      { pump: 'P5', actual: 'OK', pred: 'OK', correct: true },
      { pump: 'P6', actual: 'FAIL', pred: 'FAIL', correct: true },
    ],
    accuracy: 100,
    loss: 0.12,
  },
]

const LR_CONFIGS = [
  { lr: 0.5, label: 'Too High (0.5)', desc: 'Overfitting — oscillates, unstable', color: C.red, losses: [0.69, 0.31, 0.42, 0.28, 0.35, 0.22] },
  { lr: 0.1, label: 'Sweet Spot (0.1)', desc: 'Steady convergence — just right!', color: C.green, losses: [0.69, 0.50, 0.36, 0.26, 0.19, 0.14] },
  { lr: 0.001, label: 'Too Low (0.001)', desc: 'Slow convergence — needs 1000s of rounds', color: C.orange, losses: [0.69, 0.68, 0.67, 0.66, 0.65, 0.64] },
]

function XGBoostSection() {
  const [currentRound, setCurrentRound] = useState(0)
  const [selectedLR, setSelectedLR] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef(null)

  const nextRound = () => {
    if (currentRound < BOOST_ROUNDS.length - 1) {
      setIsAnimating(true)
      timerRef.current = setTimeout(() => {
        setCurrentRound(r => r + 1)
        setIsAnimating(false)
      }, 400)
    }
  }

  const resetRounds = () => {
    clearTimeout(timerRef.current)
    setCurrentRound(0)
    setIsAnimating(false)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const roundData = BOOST_ROUNDS[currentRound]
  const lrConfig = LR_CONFIGS[selectedLR]

  return (
    <>
    <SectionBlock icon="⚡" title="Section 3 — XGBoost: The Perfectionist Corrector" color={C.xgb}>
      <Neuron
        mood="thinking"
        size="small"
        message="XGBoost is a perfectionist student. Round 1: make a rough guess. Look at your mistakes. Round 2: build a new tree that FOCUSES on the errors. Keep correcting round after round. Each round, predictions improve!"
      />

      <HindiExplainer
        concept="बूस्टिंग (Boosting)"
        english="Boosting / XGBoost"
        explanation="Boosting का मतलब है — गलतियों से सीखना। पहला tree बनाओ, देखो क्या गलत हुआ। दूसरा tree उन्हीं गलतियों पर focus करता है। तीसरा और सुधारता है। एक के बाद एक, हर round में prediction बेहतर होती है!"
        example="Round 1: 6 में से 3 pumps गलत (50% accuracy)। Round 2: उन 3 गलत pumps पर focus → 5 सही (83%)। Round 3: आखिरी गलती सुधारो → 6/6 सही (100%)!"
        terms={[
          { hindi: 'बूस्टिंग', english: 'Boosting', meaning: 'गलतियों को ठीक करते जाना' },
          { hindi: 'अवशेष', english: 'Residuals', meaning: 'पिछले round की गलतियाँ' },
          { hindi: 'सीखने की दर', english: 'Learning Rate', meaning: 'हर round में कितना सुधार हो' },
          { hindi: 'हानि', english: 'Loss', meaning: 'Model कितना गलत है — कम = बेहतर' },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            Round {currentRound + 1} / {BOOST_ROUNDS.length}
          </div>
          <div style={{
            padding: '4px 14px', borderRadius: 20,
            background: '#fff7ed', border: `1px solid ${C.xgb}`,
            color: C.xgb, fontWeight: 700, fontSize: 13,
          }}>
            Accuracy: {roundData.accuracy}%
          </div>
          <div style={{
            padding: '4px 14px', borderRadius: 20,
            background: '#fef2f2', border: `1px solid ${C.red}`,
            color: C.red, fontWeight: 700, fontSize: 13,
          }}>
            Loss: {roundData.loss}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {roundData.predictions.map((p, i) => (
            <motion.div
              key={`${currentRound}-${i}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: `2px solid ${p.correct ? C.green : C.red}`,
                background: p.correct ? '#f0fdf4' : '#fef2f2',
                minWidth: 90,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{p.pump}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                Actual: <strong>{p.actual}</strong>
              </div>
              <div style={{ fontSize: 11, marginTop: 2, color: p.correct ? C.green : C.red, fontWeight: 700 }}>
                Pred: {p.pred} {p.correct ? '✓' : '✗'}
              </div>
              {!p.correct && (
                <div style={{
                  fontSize: 10, marginTop: 4, padding: '2px 6px',
                  background: '#fee2e2', borderRadius: 4, color: C.red, fontWeight: 700,
                }}>
                  {currentRound < BOOST_ROUNDS.length - 1 ? 'Next round focuses here →' : 'Fixed!'}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Loss curve */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
            Loss curve (lower = better):
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60, background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 10 }}>
            {BOOST_ROUNDS.map((r, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{r.loss}</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: (r.loss / 0.69) * 44 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{
                    width: '100%',
                    background: i <= currentRound ? C.xgb : '#e2e8f0',
                    borderRadius: '4px 4px 0 0',
                  }}
                />
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>R{i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={nextRound}
            disabled={currentRound >= BOOST_ROUNDS.length - 1 || isAnimating}
            style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: currentRound >= BOOST_ROUNDS.length - 1 ? '#94a3b8' : `linear-gradient(135deg, ${C.xgb}, #d97706)`,
              color: '#fff', fontWeight: 700, cursor: currentRound >= BOOST_ROUNDS.length - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Next Round →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={resetRounds}
            style={{
              padding: '10px 22px', borderRadius: 10,
              border: '2px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Reset
          </motion.button>
        </div>

        {/* Learning rate slider */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 14,
          padding: '20px 24px',
          marginTop: 8,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Learning Rate Effect:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {LR_CONFIGS.map((c, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedLR(i)}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: `2px solid ${selectedLR === i ? c.color : 'var(--border)'}`,
                  background: selectedLR === i ? `${c.color}15` : 'var(--bg-card)',
                  color: selectedLR === i ? c.color : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}
              >
                {c.label}
              </motion.button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: lrConfig.color, fontWeight: 600, marginBottom: 12 }}>
            {lrConfig.desc}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 70, background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 10 }}>
            {lrConfig.losses.map((loss, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{loss.toFixed(2)}</div>
                <motion.div
                  key={`${selectedLR}-${i}`}
                  initial={{ height: 0 }}
                  animate={{ height: (loss / 0.69) * 50 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{
                    width: '100%',
                    background: lrConfig.color,
                    borderRadius: '4px 4px 0 0',
                  }}
                />
                <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NeuronTip type="warning">
        XGBoost's learning_rate is crucial. Too high (0.5) and it "overshoots" corrections, causing oscillation — like a student who overreacts to every test score. Too low (0.001) and training takes forever. The sweet spot is usually 0.05–0.1.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="XGBoost — perfectionist corrector, गलतियों से सीखना"
      english="XGBoost: Extreme Gradient Boosting"
      explanation="XGBoost में trees series में बनते हैं — हर नया tree पिछले की गलतियों को correct करता है। जैसे exam में पहले attempt में 50% — गलत questions note करो, next attempt में उन पर focus करो → 83% → next → 100%। यही boosting है। XGBoost = best accuracy, लेकिन RF से slow।"
      example="Round 1: 50% accuracy (3/6 correct)। Round 2: गलत 3 pumps पर focus → 83% accuracy। Round 3: बची एक गलती fix → 100%! Real PdM में ~100-500 rounds में AUC 0.91+ achieve होता है।"
      terms={[
        { hindi: 'बूस्टिंग', english: 'Boosting', meaning: 'हर नया model पिछले की mistakes पर focus करता है — iterative improvement' },
        { hindi: 'सीखने की दर', english: 'Learning Rate', meaning: 'हर round में correction कितनी तेज़ हो — balance ज़रूरी (0.05-0.1)' },
        { hindi: 'अति-अनुकूलन', english: 'Overfitting', meaning: 'training data पर बहुत अच्छा, new data पर खराब — XGBoost में careful रहना होता है' },
      ]}
    />
    </>
  )
}

/* ================================================================
   SECTION 4 — LightGBM Tree Growing
================================================================ */
function LightGBMSection() {
  const [step, setStep] = useState(0)
  const maxSteps = 5

  const xgbSteps = [
    { label: 'Level 0: Root split', nodes: ['root'] },
    { label: 'Level 1: Split all nodes at depth 1', nodes: ['root', 'L1a', 'L1b'] },
    { label: 'Level 2: Split all nodes at depth 2', nodes: ['root', 'L1a', 'L1b', 'L2a', 'L2b', 'L2c', 'L2d'] },
    { label: 'Level 3: Split all nodes at depth 3', nodes: ['root', 'L1a', 'L1b', 'L2a', 'L2b', 'L2c', 'L2d', 'L3a', 'L3b', 'L3c', 'L3d', 'L3e', 'L3f', 'L3g', 'L3h'] },
  ]

  const lgbmSteps = [
    { label: 'Root split (same as XGBoost)', nodes: ['root'], bestGain: 0.45 },
    { label: 'Pick leaf with MOST GAIN → go left deep', nodes: ['root', 'L1a'], bestGain: 0.38 },
    { label: 'Best gain still on left branch → deeper', nodes: ['root', 'L1a', 'L2a'], bestGain: 0.31 },
    { label: 'Now right branch has more gain → switch', nodes: ['root', 'L1a', 'L2a', 'L1b'], bestGain: 0.22 },
    { label: 'Continue best-first → same accuracy, fewer splits!', nodes: ['root', 'L1a', 'L2a', 'L1b', 'L2b'], bestGain: 0.14 },
  ]

  const xgbNodeCount = step < 4 ? xgbSteps[Math.min(step, 3)].nodes.length : xgbSteps[3].nodes.length
  const lgbmNodeCount = lgbmSteps[Math.min(step, 4)].nodes.length

  return (
    <>
    <SectionBlock icon="🚀" title="Section 4 — LightGBM: The Speed Demon" color={C.lgbm}>
      <Neuron
        mood="excited"
        size="small"
        message="LightGBM doesn't grow trees the normal way. Instead of growing level by level like XGBoost, it picks the SINGLE leaf with the most to gain and goes deep there first. Same accuracy — much less work!"
      />

      <HindiExplainer
        concept="LightGBM — Leaf-Wise Growth"
        english="LightGBM"
        explanation="XGBoost हर level पर सभी leaves को split करता है — सब बराबर। LightGBM smart है: वो देखता है 'कौनसी leaf को split करने से सबसे ज़्यादा फ़ायदा होगा?' और सिर्फ़ उसे split करता है। Result: same accuracy, but much faster training!"
        example="100,000 pumps की data। XGBoost: 120 seconds। LightGBM: 35 seconds। 3.4x faster! Large datasets पर यह फ़र्क़ बहुत important होता है।"
        terms={[
          { hindi: 'पत्ती-पहले', english: 'Leaf-Wise Growth', meaning: 'सबसे फ़ायदेमंद leaf पर पहले जाना' },
          { hindi: 'स्तर-पहले', english: 'Level-Wise Growth', meaning: 'हर level पर सभी nodes split करना' },
          { hindi: 'लाभ', english: 'Gain', meaning: 'एक split से prediction में कितना सुधार' },
          { hindi: 'हिस्टोग्राम', english: 'Histogram Binning', meaning: 'LightGBM का secret — features को bins में बाँटना' },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {Array.from({ length: maxSteps }, (_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              onClick={() => setStep(i)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `2px solid ${step === i ? C.lgbm : 'var(--border)'}`,
                background: step === i ? '#eef2ff' : 'var(--bg-secondary)',
                color: step === i ? C.lgbm : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >
              {i + 1}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => setStep(s => Math.min(s + 1, maxSteps - 1))}
            disabled={step >= maxSteps - 1}
            style={{
              padding: '0 16px', borderRadius: 8, border: 'none',
              background: step >= maxSteps - 1 ? '#94a3b8' : `linear-gradient(135deg, ${C.lgbm}, #4f46e5)`,
              color: '#fff', fontWeight: 700, cursor: step >= maxSteps - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Next Step →
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* XGBoost panel */}
          <div style={{
            border: `2px solid ${C.xgb}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.xgb}, #d97706)`,
              color: '#fff', padding: '10px 16px', fontWeight: 700, fontSize: 14,
            }}>
              XGBoost — Level-Wise (Breadth-First)
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                {step < 4 ? xgbSteps[Math.min(step, 3)].label : xgbSteps[3].label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                {/* Visual tree representation */}
                {[0, 1, 2, 3].slice(0, Math.min(step + 1, 4)).map(level => (
                  <div key={level} style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: Math.pow(2, level) }, (_, j) => (
                      <motion.div
                        key={j}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          width: level === 0 ? 40 : level === 1 ? 32 : level === 2 ? 22 : 14,
                          height: level === 0 ? 30 : level === 1 ? 24 : level === 2 ? 18 : 12,
                          borderRadius: 4,
                          background: `${C.xgb}${level === 0 ? 'ff' : level === 1 ? 'cc' : level === 2 ? '99' : '66'}`,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: C.xgb }}>
                Nodes grown: {xgbNodeCount}
              </div>
              {step >= 3 && (
                <div style={{ marginTop: 8, fontSize: 12, padding: '6px 10px', background: '#fff7ed', borderRadius: 8, color: C.xgb }}>
                  Training time: ~120s
                </div>
              )}
            </div>
          </div>

          {/* LightGBM panel */}
          <div style={{
            border: `2px solid ${C.lgbm}`,
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.lgbm}, #4f46e5)`,
              color: '#fff', padding: '10px 16px', fontWeight: 700, fontSize: 14,
            }}>
              LightGBM — Leaf-Wise (Best-First)
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                {lgbmSteps[Math.min(step, 4)].label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', paddingLeft: 8 }}>
                {/* Leaf-wise tree - grows asymmetrically */}
                <motion.div
                  style={{ width: 40, height: 30, borderRadius: 4, background: C.lgbm }}
                />
                {step >= 1 && (
                  <div style={{ display: 'flex', gap: 6, paddingLeft: 0 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ width: 32, height: 24, borderRadius: 4, background: `${C.lgbm}cc` }}
                    />
                  </div>
                )}
                {step >= 2 && (
                  <div style={{ paddingLeft: 4 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ width: 28, height: 20, borderRadius: 4, background: `${C.lgbm}99` }}
                    />
                  </div>
                )}
                {step >= 3 && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ width: 32, height: 24, borderRadius: 4, background: `${C.lgbm}bb`, marginLeft: 36 }}
                    />
                  </div>
                )}
                {step >= 4 && (
                  <div style={{ paddingLeft: 40 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ width: 28, height: 20, borderRadius: 4, background: `${C.lgbm}88` }}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: C.lgbm }}>
                Nodes grown: {lgbmNodeCount}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Best gain: {lgbmSteps[Math.min(step, 4)].bestGain}
              </div>
              {step >= 4 && (
                <div style={{ marginTop: 8, fontSize: 12, padding: '6px 10px', background: '#eef2ff', borderRadius: 8, color: C.lgbm }}>
                  Training time: ~35s ✓
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time comparison */}
        <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Training Time Comparison (same 50K-row dataset):</div>
          {[
            { name: 'XGBoost', time: 120, color: C.xgb },
            { name: 'LightGBM', time: 35, color: C.lgbm },
          ].map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 80, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
              <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 6, height: 22, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(m.time / 120) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', background: m.color, borderRadius: 6 }}
                />
              </div>
              <div style={{ width: 50, fontSize: 13, fontWeight: 700, color: m.color }}>{m.time}s</div>
            </div>
          ))}
        </div>
      </div>

      <NeuronTip type="deep">
        LightGBM has two more tricks: <strong>Histogram Binning</strong> (it doesn't consider every possible split value — it bins continuous features into 255 bins), and <strong>GOSS</strong> (Gradient-based One-Side Sampling — it trains on gradients that matter most, ignoring easy examples). These make it 3-10x faster than XGBoost on large datasets.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="LightGBM — Speed Racer, XGBoost का तेज़ भाई"
      english="LightGBM: Light Gradient Boosting Machine"
      explanation="LightGBM = XGBoost जैसी accuracy लेकिन 3x faster। Secret: XGBoost हर level पर सब nodes को split करता है (level-wise), LightGBM सिर्फ सबसे ज़्यादा gain वाली leaf को पहले split करता है (leaf-wise)। इससे वही result जल्दी मिलता है। Production systems में जहां रोज़ retraining होती है, LightGBM बेहतर है।"
      example="50,000 pumps का daily retraining: XGBoost = 120 seconds, LightGBM = 35 seconds। हफ्ते में: XGBoost = 14 minutes, LightGBM = 4 minutes। महीने में यह difference = engineer का पूरा दिन बचता है। AUC difference: XGBoost 0.91 vs LightGBM 0.90 — barely कोई फ़र्क़।"
      terms={[
        { hindi: 'LightGBM', english: 'Light Gradient Boosting Machine', meaning: 'Microsoft का fast boosting algorithm — production के लिए perfect' },
        { hindi: 'पत्ती-पहले', english: 'Leaf-Wise Growth', meaning: 'सबसे gain वाली leaf पहले split — speed का secret' },
        { hindi: 'हिस्टोग्राम बिनिंग', english: 'Histogram Binning', meaning: 'features को 255 bins में group — computation बहुत कम' },
      ]}
    />
    </>
  )
}

/* ================================================================
   SECTION 5 — The Arena
================================================================ */
const ARENA_MODELS = [
  {
    id: 'rf',
    name: 'Random Forest',
    emoji: '🌲',
    color: C.rf,
    personality: 'The Wise Committee',
    desc: 'Stable, interpretable, never overfits badly',
    metrics: { auc: 0.87, f1: 0.79, trainTime: 45, memory: 68 },
    radar: { accuracy: 78, speed: 60, interpretability: 90, missingData: 65, imbalance: 60, memory: 45 },
    features: [
      { name: 'vibration_dev', importance: 0.28 },
      { name: 'lifecycle_ratio', importance: 0.22 },
      { name: 'temperature_dev', importance: 0.18 },
      { name: 'mtbf_ratio', importance: 0.12 },
      { name: 'pressure_dev', importance: 0.09 },
    ],
  },
  {
    id: 'xgb',
    name: 'XGBoost',
    emoji: '⚡',
    color: C.xgb,
    personality: 'The Perfectionist Student',
    desc: 'Highest accuracy, most tunable, Kaggle champion',
    metrics: { auc: 0.91, f1: 0.84, trainTime: 120, memory: 72 },
    radar: { accuracy: 92, speed: 40, interpretability: 65, missingData: 85, imbalance: 80, memory: 55 },
    features: [
      { name: 'lifecycle_ratio', importance: 0.31 },
      { name: 'vibration_dev', importance: 0.25 },
      { name: 'temp_trend_7d', importance: 0.16 },
      { name: 'repair_accel', importance: 0.13 },
      { name: 'temperature_dev', importance: 0.08 },
    ],
  },
  {
    id: 'lgbm',
    name: 'LightGBM',
    emoji: '🚀',
    color: C.lgbm,
    personality: 'The Speed Racer',
    desc: 'Near-XGBoost accuracy, 3x faster, scales to millions',
    metrics: { auc: 0.90, f1: 0.83, trainTime: 35, memory: 48 },
    radar: { accuracy: 90, speed: 95, interpretability: 60, missingData: 90, imbalance: 85, memory: 85 },
    features: [
      { name: 'vibration_dev', importance: 0.30 },
      { name: 'lifecycle_ratio', importance: 0.26 },
      { name: 'temp_trend_7d', importance: 0.18 },
      { name: 'mtbf_ratio', importance: 0.11 },
      { name: 'current_dev', importance: 0.09 },
    ],
  },
]

const RADAR_DIMS = ['accuracy', 'speed', 'interpretability', 'missingData', 'imbalance', 'memory']
const RADAR_LABELS = ['Accuracy', 'Speed', 'Interpretability', 'Missing Data', 'Imbalance', 'Memory']

function RadarChart({ models, selected }) {
  const cx = 120, cy = 120, r = 90
  const angleStep = (2 * Math.PI) / RADAR_DIMS.length

  const getPoint = (val, idx) => {
    const angle = idx * angleStep - Math.PI / 2
    const dist = (val / 100) * r
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    }
  }

  const axisPoints = RADAR_DIMS.map((_, i) => getPoint(100, i))

  const modelColors = { rf: C.rf, xgb: C.xgb, lgbm: C.lgbm }

  return (
    <svg width={240} height={260} style={{ overflow: 'visible' }}>
      {/* Grid circles */}
      {[25, 50, 75, 100].map(pct => (
        <circle key={pct} cx={cx} cy={cy} r={(pct / 100) * r} fill="none" stroke="var(--border)" strokeWidth={0.5} />
      ))}
      {/* Axis lines */}
      {axisPoints.map((pt, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="var(--border)" strokeWidth={0.8} />
      ))}
      {/* Model polygons */}
      {models.map(m => {
        if (selected && selected !== m.id) return null
        const pts = RADAR_DIMS.map((dim, i) => getPoint(m.radar[dim], i))
        const poly = pts.map(p => `${p.x},${p.y}`).join(' ')
        return (
          <polygon
            key={m.id}
            points={poly}
            fill={`${modelColors[m.id]}33`}
            stroke={modelColors[m.id]}
            strokeWidth={2}
          />
        )
      })}
      {/* Labels */}
      {RADAR_DIMS.map((dim, i) => {
        const pt = getPoint(115, i)
        return (
          <text
            key={dim}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fill="var(--text-secondary)"
            fontWeight="600"
          >
            {RADAR_LABELS[i]}
          </text>
        )
      })}
    </svg>
  )
}

function ArenaSection() {
  const [selectedModel, setSelectedModel] = useState(null)
  const [showFeatures, setShowFeatures] = useState(null)

  const model = showFeatures ? ARENA_MODELS.find(m => m.id === showFeatures) : null

  return (
    <>
    <SectionBlock icon="🏟️" title="Section 5 — The Arena: Head-to-Head Battle" color={C.blue}>
      <Neuron
        mood="excited"
        size="small"
        message="Same dataset: 50 pumps, 6 months of data, 47,000 rows. All three models trained and evaluated. Let's see who wins — and in what category!"
      />

      {/* Scorecards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 20, marginBottom: 24 }}>
        {ARENA_MODELS.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setSelectedModel(selectedModel === m.id ? null : m.id)
              setShowFeatures(showFeatures === m.id ? null : m.id)
            }}
            style={{
              border: `2px solid ${selectedModel === m.id ? m.color : 'var(--border)'}`,
              borderRadius: 14,
              padding: '18px 16px',
              cursor: 'pointer',
              background: selectedModel === m.id ? `${m.color}08` : 'var(--bg-card)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{m.emoji}</div>
            <div style={{ fontWeight: 800, color: m.color, fontSize: 15, marginBottom: 2 }}>{m.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>{m.personality}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'AUC', val: m.metrics.auc, max: 1, suffix: '' },
                { label: 'F1', val: m.metrics.f1, max: 1, suffix: '' },
                { label: 'Train Time', val: m.metrics.trainTime, max: 120, suffix: 's', invert: true },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</span>
                    <span style={{ fontWeight: 700, color: m.color }}>{stat.val}{stat.suffix}</span>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.invert ? (1 - stat.val / stat.max) * 100 : (stat.val / stat.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: idx * 0.1 }}
                      style={{ height: '100%', background: m.color, borderRadius: 4 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' }}>
              Click to see feature importance
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature importance panel */}
      <AnimatePresence>
        {model && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 24 }}
          >
            <div style={{
              border: `2px solid ${model.color}`,
              borderRadius: 14,
              padding: '20px 24px',
            }}>
              <div style={{ fontWeight: 700, color: model.color, fontSize: 16, marginBottom: 16 }}>
                {model.emoji} {model.name} — Top Feature Importances
              </div>
              {model.features.map((f, i) => (
                <div key={f.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {i + 1}. {f.name}
                    </span>
                    <span style={{ color: model.color, fontWeight: 700 }}>{Math.round(f.importance * 100)}%</span>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.importance * 100 / 0.31 * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                      style={{ height: '100%', background: model.color, borderRadius: 6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Radar chart */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 14,
        padding: '20px 24px',
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Radar Comparison (click a model card above to isolate it):
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          6 dimensions — each 0-100 (higher = better)
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <RadarChart models={ARENA_MODELS} selected={selectedModel} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            {ARENA_MODELS.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 4, borderRadius: 2, background: m.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NeuronTip type="example">
        On our PdM dataset: XGBoost has the highest AUC (0.91) but takes 3.4x longer than LightGBM. LightGBM gets 0.90 AUC — barely worse — in just 35 seconds. For production systems that retrain daily on fresh sensor data, LightGBM's speed advantage compounds dramatically.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="Arena — RF vs XGBoost vs LightGBM: कौन जीतेगा?"
      english="Model Arena: Head-to-Head Comparison"
      explanation="तीनों models की head-to-head comparison: Random Forest = Wise Committee (interpretable, stable, slow), XGBoost = Perfectionist (highest AUC 0.91, most tunable), LightGBM = Speed Racer (AUC 0.90, 3x faster)। PdM में कोई एक winner नहीं — situation देखकर choose करते हैं। Small explainable project → RF। Max accuracy → XGBoost। Production speed → LightGBM।"
      example="Pump factory comparison: RF → AUC 0.87, 45s train, feature importance easy। XGBoost → AUC 0.91, 120s train, most hyperparameters। LightGBM → AUC 0.90, 35s train, daily retraining के लिए best। Engineer को explain करना है → RF choose करो।"
      terms={[
        { hindi: 'AUC स्कोर', english: 'AUC Score', meaning: 'model की overall quality — RF 0.87, XGB 0.91, LGBM 0.90' },
        { hindi: 'प्रशिक्षण समय', english: 'Training Time', meaning: 'model कितनी देर में train होता है — LightGBM fastest' },
        { hindi: 'व्याख्या', english: 'Interpretability', meaning: 'model की prediction को explain करना — RF सबसे आसान' },
      ]}
    />
    </>
  )
}

/* ================================================================
   SECTION 6 — Decision Flowchart
================================================================ */
const DECISION_NODES_DATA = {
  start: { id: 'start', question: 'Dataset size?', leftLabel: '< 10K rows', rightLabel: '≥ 10K rows', left: 'small', right: 'large' },
  small: { id: 'small', question: 'Need interpretability?', leftLabel: 'Yes', rightLabel: 'No', left: 'leaf_rf_interp', right: 'leaf_rf_robust' },
  large: { id: 'large', question: 'Training speed critical?', leftLabel: 'Yes', rightLabel: 'No', left: 'leaf_lgbm', right: 'leaf_acc' },
  leaf_rf_interp: {
    id: 'leaf_rf_interp', isLeaf: true,
    model: 'Random Forest', color: C.rf, emoji: '🌲',
    why: 'Small dataset → RF won\'t overfit. Need interpretability → RF has clean feature importance and SHAP values.',
    pdmExample: 'Explaining to maintenance team WHY pump #7 is flagged: "vibration_dev was the top factor".',
  },
  leaf_rf_robust: {
    id: 'leaf_rf_robust', isLeaf: true,
    model: 'Random Forest', color: C.rf, emoji: '🌲',
    why: 'Small dataset. RF\'s bootstrap sampling makes it robust against overfitting even with few samples.',
    pdmExample: 'New equipment type with only 500 historical records — RF handles this gracefully.',
  },
  leaf_lgbm: {
    id: 'leaf_lgbm', isLeaf: true,
    model: 'LightGBM', color: C.lgbm, emoji: '🚀',
    why: 'Large dataset + speed needed → LightGBM. 3-10x faster than XGBoost. Also has is_unbalance for class imbalance.',
    pdmExample: 'Fleet of 5000 pumps, daily retraining pipeline. LightGBM trains in 35s vs XGBoost\'s 120s — saves hours per week.',
  },
  leaf_acc: {
    id: 'leaf_acc', isLeaf: true,
    question: 'Maximize accuracy?', leftLabel: 'Competition / max accuracy', rightLabel: 'Balanced',
    left: 'leaf_xgb', right: 'leaf_lgbm2', notLeaf: true,
  },
  leaf_xgb: {
    id: 'leaf_xgb', isLeaf: true,
    model: 'XGBoost', color: C.xgb, emoji: '⚡',
    why: 'Best accuracy. scale_pos_weight handles class imbalance. Most tunable — Optuna works extremely well with XGBoost.',
    pdmExample: 'Critical equipment (blast furnace, aircraft engine) where every missed failure is catastrophic. Squeeze every % of AUC.',
  },
  leaf_lgbm2: {
    id: 'leaf_lgbm2', isLeaf: true,
    model: 'LightGBM', color: C.lgbm, emoji: '🚀',
    why: 'Near-XGBoost accuracy with much faster training. is_unbalance flag handles skewed failure ratios automatically.',
    pdmExample: 'Production ML system that retrains weekly. Good accuracy + manageable training time = best overall ROI.',
  },
}

function DecisionFlowSection() {
  const [path, setPath] = useState(['start'])
  const [selectedLeaf, setSelectedLeaf] = useState(null)

  const currentNode = DECISION_NODES_DATA[path[path.length - 1]]

  const choose = (direction) => {
    const next = currentNode[direction]
    if (next) {
      setPath(p => [...p, next])
      if (DECISION_NODES_DATA[next]?.isLeaf) {
        setSelectedLeaf(DECISION_NODES_DATA[next])
      }
    }
  }

  const reset = () => {
    setPath(['start'])
    setSelectedLeaf(null)
  }

  const ModelCard = ({ leaf }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        padding: '20px 24px',
        borderRadius: 14,
        border: `2px solid ${leaf.color}`,
        background: `${leaf.color}08`,
        marginTop: 16,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{leaf.emoji}</div>
      <div style={{ fontWeight: 800, color: leaf.color, fontSize: 18, marginBottom: 8 }}>
        Use: {leaf.model}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
        <strong>Why:</strong> {leaf.why}
      </div>
      <div style={{
        padding: '10px 14px',
        background: 'var(--bg-secondary)',
        borderRadius: 10,
        fontSize: 13, color: 'var(--text-primary)',
        lineHeight: 1.6,
      }}>
        <strong>PdM Example:</strong> {leaf.pdmExample}
      </div>
    </motion.div>
  )

  return (
    <>
    <SectionBlock icon="🗺️" title="Section 6 — When to Use Which Model" color={C.blue}>
      <Neuron
        mood="thinking"
        size="small"
        message="No model wins every situation. Walk through this flowchart with your actual PdM scenario — dataset size, speed requirements, interpretability needs — and I'll tell you which algorithm to use."
      />

      <InteractiveDemo title="Model Selection Flowchart" instruction="Answer each question to find your ideal model for PdM">
        <div style={{ padding: '20px 24px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
            {path.map((nodeId, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>→</span>}
                <span style={{
                  fontSize: 12,
                  color: i === path.length - 1 ? C.blue : 'var(--text-secondary)',
                  fontWeight: i === path.length - 1 ? 700 : 400,
                }}>
                  {DECISION_NODES_DATA[nodeId]?.model || DECISION_NODES_DATA[nodeId]?.question?.slice(0, 20) || nodeId}
                </span>
              </span>
            ))}
          </div>

          {/* Current question */}
          {!currentNode?.isLeaf && (
            <div>
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                padding: '20px 24px',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                  {currentNode?.question}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {currentNode?.left && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => choose('left')}
                      style={{
                        padding: '10px 20px', borderRadius: 10,
                        border: `2px solid ${C.blue}`,
                        background: '#eff6ff', color: C.blue,
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      {currentNode.leftLabel}
                    </motion.button>
                  )}
                  {currentNode?.right && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => choose('right')}
                      style={{
                        padding: '10px 20px', borderRadius: 10,
                        border: `2px solid ${C.indigo}`,
                        background: '#eef2ff', color: C.indigo,
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      {currentNode.rightLabel}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Leaf result */}
          {selectedLeaf && <ModelCard leaf={selectedLeaf} />}

          {/* Reset */}
          {path.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={reset}
              style={{
                marginTop: 16, padding: '8px 20px',
                borderRadius: 8, border: '2px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)', fontWeight: 700,
                cursor: 'pointer', fontSize: 13,
              }}
            >
              ← Start Over
            </motion.button>
          )}
        </div>
      </InteractiveDemo>

      {/* Quick reference table */}
      <div style={{ marginTop: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)', borderRadius: '8px 0 0 0' }}>Situation</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', color: C.rf, fontWeight: 700 }}>🌲 RF</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', color: C.xgb, fontWeight: 700 }}>⚡ XGB</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', color: C.lgbm, fontWeight: 700, borderRadius: '0 8px 0 0' }}>🚀 LGB</th>
            </tr>
          </thead>
          <tbody>
            {[
              { situation: 'Small dataset (<10K rows)', rf: '✅ Best', xgb: '⚠️ OK', lgbm: '⚠️ OK' },
              { situation: 'Large dataset (>100K rows)', rf: '🐌 Slow', xgb: '✅ Good', lgbm: '✅ Best' },
              { situation: 'Need interpretability', rf: '✅ Best', xgb: '⚠️ SHAP needed', lgbm: '⚠️ SHAP needed' },
              { situation: 'Class imbalance', rf: '⚠️ OK', xgb: '✅ scale_pos_weight', lgbm: '✅ is_unbalance' },
              { situation: 'Missing data handling', rf: '❌ Needs imputation', xgb: '✅ Built-in', lgbm: '✅ Built-in' },
              { situation: 'Competition / max AUC', rf: '⚠️ OK', xgb: '✅ Best', lgbm: '✅ Close 2nd' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>{row.situation}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>{row.rf}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>{row.xgb}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>{row.lgbm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NeuronTip type="try">
        In PdM competitions (like the NASA CMAPSS turbofan dataset on Kaggle), XGBoost and LightGBM dominate the leaderboards. But in production systems where models retrain on weekly fresh data and engineers need to explain predictions to non-technical stakeholders, Random Forest often wins the practical debate.
      </NeuronTip>
    </SectionBlock>
    <HindiExplainer
      concept="कौनसा model use करें — situation देखकर decide करो"
      english="When to Use Which Model"
      explanation="Model selection एक decision tree की तरह है: Dataset छोटा (<10K rows)? → Random Forest। बड़ा और speed चाहिए? → LightGBM। Maximum accuracy चाहिए? → XGBoost। Factory manager को explain करना है? → Random Forest। Competition/Kaggle → XGBoost या LightGBM। कोई एक 'best' model नहीं है — context matters!"
      example="3 scenarios: 1) नई factory, 500 pump records, engineer को explain करना है → RF। 2) 50K pumps, daily retraining, speed priority → LightGBM। 3) Critical blast furnace, हर failure = crores → XGBoost (max AUC, hypertune करो)।"
      terms={[
        { hindi: 'मॉडल चयन', english: 'Model Selection', meaning: 'problem, data size, और requirements के आधार पर सही algorithm चुनना' },
        { hindi: 'उत्पादन प्रणाली', english: 'Production System', meaning: 'real factory में deploy किया हुआ model — speed और reliability ज़रूरी' },
        { hindi: 'व्याख्यापकता', english: 'Interpretability', meaning: 'non-technical लोगों को explain कर सको — RF best है इसके लिए' },
      ]}
    />
    </>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */
function HindiSummarySection() {
  return (
    <SectionBlock icon="🇮🇳" title="Section 7 — Hindi Summary" color={C.orange}>
      <Neuron
        mood="waving"
        size="small"
        message="तीनों models एक साथ: RF = Wise Committee, XGBoost = Perfectionist Student, LightGBM = Speed Racer. आइए सब कुछ हिंदी में समझते हैं!"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        <HindiExplainer
          concept="यादृच्छिक वन (Random Forest)"
          english="Random Forest"
          explanation="Random Forest = बहुत सारे Decision Trees जो मिलकर vote करते हैं। हर tree अलग-अलग random data पर train होता है — इसीलिए 'यादृच्छिक' (random)। जैसे एक wise committee: अकेला एक expert गलत हो सकता है, लेकिन 100 experts का majority? Reliable!"
          example="Steel plant: 100 trees में से 61 कहते हैं 'Pump fail होगी' → Final prediction: FAIL (61% confidence). छोटे datasets पर best; interpretable; never seriously overfits."
          terms={[
            { hindi: 'यादृच्छिक वन', english: 'Random Forest', meaning: 'अनेक निर्णय वृक्षों का समूह' },
            { hindi: 'बूटस्ट्रैप', english: 'Bootstrap Sampling', meaning: 'Training data का random sample लेना' },
            { hindi: 'बहुमत मत', english: 'Majority Vote', meaning: 'सबसे ज़्यादा trees जो कहें, वही prediction' },
          ]}
        />

        <HindiExplainer
          concept="बूस्टिंग / XGBoost"
          english="Boosting / XGBoost"
          explanation="XGBoost = एक perfectionist student जो हर exam के बाद सिर्फ़ उन्हीं topics को पढ़ता है जिनमें गलती हुई। Round 1 में जो pumps गलत predict हुईं, Round 2 में वो extra focus पाती हैं। धीरे-धीरे हर round में accuracy बढ़ती है। यही 'boosting' है!"
          example="Round 1: 50% accuracy। Round 2: उन्हीं गलत pumps पर focus → 83%। Round 3: और सुधार → 91% AUC। Kaggle competitions में champion algorithm!"
          terms={[
            { hindi: 'बूस्टिंग', english: 'Boosting', meaning: 'पिछली गलतियों पर focus करके सुधार करना' },
            { hindi: 'अवशेष त्रुटि', english: 'Residual Error', meaning: 'पिछले round में कितना गलत हुआ' },
            { hindi: 'अति-अनुकूलन', english: 'Overfitting', meaning: 'Training data पर बहुत अच्छा, new data पर बुरा' },
          ]}
        />

        <HindiExplainer
          concept="LightGBM — गति का राक्षस"
          english="LightGBM"
          explanation="LightGBM = Speed Racer। XGBoost हर level पर सभी nodes को split करता है (breadth-first)। LightGBM smart है — वो सबसे ज़्यादा gain वाली leaf को पहले split करता है (leaf-wise)। Result? Same accuracy, but 3x faster! 100K+ rows वाले बड़े datasets के लिए perfect।"
          example="50,000 pumps का data: XGBoost = 120 seconds। LightGBM = 35 seconds। Daily retraining system में यह फ़र्क़ huge है! Plus — built-in missing data handling!"
          terms={[
            { hindi: 'पत्ती-पहले वृद्धि', english: 'Leaf-Wise Growth', meaning: 'सबसे अधिक लाभ वाली पत्ती को पहले बढ़ाना' },
            { hindi: 'हिस्टोग्राम बिनिंग', english: 'Histogram Binning', meaning: 'Features को bins में बाँटकर computation घटाना' },
            { hindi: 'विशेषता महत्व', english: 'Feature Importance', meaning: 'कौनसा feature prediction में कितना उपयोगी है' },
          ]}
        />

        <HindiExplainer
          concept="समूह (Ensemble) और अति-अनुकूलन (Overfitting)"
          english="Ensemble Methods & Overfitting"
          explanation="Ensemble = अलग-अलग models का समूह जो मिलकर better predict करते हैं। RF और XGBoost दोनों ensemble methods हैं। Overfitting तब होता है जब model training data को 'रट' लेता है — new data पर fail। RF इससे naturally बचता है (many trees)। XGBoost में learning_rate कम रखने से control होता है।"
          example="Learning rate = 0.5: model बहुत fast सीखता है, oscillate करता है → overfit। Learning rate = 0.1: steady, stable learning → no overfit। यही 'अति-अनुकूलन से बचाव' है।"
          terms={[
            { hindi: 'समूह', english: 'Ensemble', meaning: 'अनेक models का मिलकर prediction करना' },
            { hindi: 'अति-अनुकूलन', english: 'Overfitting', meaning: 'Training पर बहुत अच्छा, नए data पर ख़राब' },
            { hindi: 'सीखने की दर', english: 'Learning Rate', meaning: 'हर training step में कितना बदलाव' },
          ]}
        />
      </div>

      {/* Final comparison */}
      <div style={{
        marginTop: 24,
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #fff8f0, #fff5eb)',
        border: '2px solid #ff993340',
        borderRadius: 14,
      }}>
        <div style={{ fontWeight: 800, color: '#e67e22', fontSize: 16, marginBottom: 12 }}>
          एक नज़र में तीनों models की पहचान:
        </div>
        {[
          { emoji: '🌲', name: 'Random Forest', hindi: 'यादृच्छिक वन', role: 'बुद्धिमान committee — stable, interpretable', when: 'छोटा dataset, team को explain करना हो' },
          { emoji: '⚡', name: 'XGBoost', hindi: 'क्रमिक सुधारक', role: 'Perfectionist student — सबसे accurate', when: 'Maximum accuracy चाहिए, competition हो' },
          { emoji: '🚀', name: 'LightGBM', hindi: 'गति का राक्षस', role: 'Speed racer — fast + accurate', when: 'बड़ा dataset, daily retraining चाहिए' },
        ].map(m => (
          <div key={m.name} style={{
            display: 'flex', gap: 14, padding: '12px 0',
            borderBottom: '1px solid #ff993320',
            alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: 24, minWidth: 32 }}>{m.emoji}</div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {m.name} — <span style={{ color: '#e67e22' }}>{m.hindi}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{m.role}</div>
              <div style={{ fontSize: 12, color: '#e67e22', marginTop: 3, fontWeight: 600 }}>
                कब use करें: {m.when}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic10Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 4px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
          borderRadius: 22,
          padding: '36px 40px',
          marginBottom: 32,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', right: -30, top: -30,
            width: 180, height: 180,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '50%',
          }}
        />
        <div style={{ fontSize: 42, marginBottom: 10 }}>🏟️</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, margin: 0, marginBottom: 8 }}>
          Topic 10: Model Arena
        </h1>
        <div style={{ fontSize: 18, opacity: 0.85, marginBottom: 16 }}>
          Random Forest vs XGBoost vs LightGBM — who wins for predictive maintenance?
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '🌲 RF', sub: 'Wise Committee' },
            { label: '⚡ XGBoost', sub: 'Perfectionist' },
            { label: '🚀 LightGBM', sub: 'Speed Racer' },
          ].map(tag => (
            <div key={tag.label} style={{
              padding: '6px 16px', borderRadius: 20,
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              fontSize: 14, fontWeight: 700,
            }}>
              {tag.label} <span style={{ opacity: 0.7, fontWeight: 400 }}>— {tag.sub}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Story link from Topic 9 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderLeft: `4px solid ${C.lgbm}`,
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 28,
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>Previously:</strong> You learned to predict WHEN a pump will fail using RUL regression. Now the question is: <em>which algorithm</em> should you use? Random Forest is robust and interpretable. XGBoost dominates Kaggle competitions. LightGBM is blazing fast on large datasets. This topic puts all three in the arena — same PdM data, head-to-head.
      </motion.div>

      <DecisionTreeSection />
      <RandomForestSection />
      <XGBoostSection />
      <LightGBMSection />
      <ArenaSection />
      <DecisionFlowSection />
      <HindiSummarySection />

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          textAlign: 'center',
          padding: '32px 20px',
          color: 'var(--text-secondary)',
          fontSize: 15,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 18, marginBottom: 6 }}>
          You've survived the Model Arena!
        </div>
        <div>
          Next up: <strong>Hyperparameter Tuning</strong> — Optuna, grid search, and cross-validation to squeeze the last drops of performance from your chosen algorithm.
        </div>
      </motion.div>
    </div>
  )
}
