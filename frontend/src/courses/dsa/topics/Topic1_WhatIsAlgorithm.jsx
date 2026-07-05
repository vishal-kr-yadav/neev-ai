import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 1 — What is an Algorithm?
   "Think Like a Programmer" DSA Course
   Before code, before AI — every solution starts with a step-by-step plan.
================================================================ */

/* ---- Section 1: What Problem Are We Solving? ---- */
function PackageSortingDemo() {
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [result, setResult] = useState(null)

  const strategies = [
    {
      id: 'area',
      icon: '🗺️',
      label: 'By Area',
      color: '#6366f1',
      desc: 'Group all North, South, East, West deliveries first',
      steps: ['Split 1000 packages into 4 zones', 'Sort each zone by locality', 'Load trucks by zone', 'Deliver zone by zone'],
      outcome: { speed: 78, cost: 65, label: 'Good! Less backtracking between areas', emoji: '👍' },
    },
    {
      id: 'distance',
      icon: '📍',
      label: 'By Distance',
      color: '#10b981',
      desc: 'Start with nearest deliveries, work outward',
      steps: ['Calculate distance of each package', 'Sort all 1000 by distance (nearest first)', 'Load truck in sorted order', 'Deliver spiraling outward'],
      outcome: { speed: 92, cost: 85, label: 'Great! Efficient spiral delivery route', emoji: '🌟' },
    },
    {
      id: 'alpha',
      icon: '🔤',
      label: 'Alphabetically',
      color: '#f59e0b',
      desc: 'Sort all destinations A to Z',
      steps: ['Read destination name of each package', 'Sort 1000 names A to Z', 'Load truck in alphabetical order', 'Drive in random order across city'],
      outcome: { speed: 22, cost: 30, label: 'Terrible! Driver zigzags across the entire city', emoji: '😬' },
    },
  ]

  const handleSelect = (strategy) => {
    if (animating) return
    setSelectedStrategy(strategy.id)
    setAnimating(true)
    setResult(null)
    setTimeout(() => {
      setResult(strategy.outcome)
      setAnimating(false)
    }, 1800)
  }

  const selected = strategies.find(s => s.id === selectedStrategy)

  return (
    <div>
      {/* Problem statement */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        borderRadius: 18, padding: '24px 28px', marginBottom: 24,
        border: '1px solid #4338ca40',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 32 }}>📦</span>
          <div>
            <div style={{ color: '#c7d2fe', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading)' }}>
              The Problem: Flipkart's Delivery Nightmare
            </div>
            <div style={{ color: '#818cf8', fontSize: 14, marginTop: 2 }}>
              1000 packages. All different destinations. One truck. How do you plan the route?
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: '1,000', sub: 'Packages', icon: '📦' },
            { label: '12', sub: 'Hours to deliver', icon: '⏰' },
            { label: '1', sub: 'Truck', icon: '🚚' },
            { label: '?', sub: 'Your Strategy', icon: '🧠' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#ffffff10', borderRadius: 12, padding: '10px 18px',
              textAlign: 'center', flex: '1 1 80px',
            }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-heading)' }}>{s.label}</div>
              <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy picker */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: 0.5 }}>
        PICK A SORTING STRATEGY — YOUR ALGORITHM:
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {strategies.map((s) => (
          <motion.div
            key={s.id}
            whileHover={{ y: -4, boxShadow: `0 12px 32px ${s.color}30` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(s)}
            style={{
              background: selectedStrategy === s.id ? `${s.color}12` : 'var(--bg-card)',
              border: selectedStrategy === s.id ? `2px solid ${s.color}60` : '2px solid var(--border)',
              borderRadius: 18, padding: '20px 16px',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Animated steps + result */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ marginTop: 24 }}
          >
            {/* Steps unrolling */}
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 16, padding: '18px 20px', marginBottom: 16,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: selected.color, marginBottom: 12, letterSpacing: 0.5 }}>
                ALGORITHM STEPS — {selected.label.toUpperCase()} STRATEGY:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.25 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: selected.color, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {step}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Result bar */}
            <AnimatePresence>
              {result && !animating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: `${selected.color}10`,
                    border: `2px solid ${selected.color}40`,
                    borderRadius: 16, padding: '20px 24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 28 }}>{result.emoji}</span>
                    <div style={{ fontWeight: 700, fontSize: 16, color: selected.color }}>{result.label}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'Delivery Speed', value: result.speed },
                      { label: 'Cost Efficiency', value: result.cost },
                    ].map((m) => (
                      <div key={m.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{m.label}</span>
                          <span style={{ fontSize: 13, color: selected.color, fontWeight: 800 }}>{m.value}%</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.value}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ height: '100%', background: selected.color, borderRadius: 4 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 16, padding: '14px 18px', borderRadius: 12,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    fontSize: 14, color: 'var(--text-primary)', fontWeight: 600,
                  }}>
                    Key insight: An algorithm is just a <span style={{ color: selected.color }}>strategy</span> for solving a problem.
                    Different strategies = wildly different outcomes. Choosing the RIGHT strategy is the entire point of algorithmic thinking.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {animating && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  textAlign: 'center', padding: 24, color: selected.color,
                  fontWeight: 700, fontSize: 16,
                }}
              >
                Running algorithm... calculating outcome...
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 2: Recipe = Algorithm ---- */
function ChaiRecipeDemo() {
  const correctOrder = [
    { id: 'water', emoji: '💧', label: 'Boil Water', desc: '1 cup, medium flame' },
    { id: 'ginger', emoji: '🫚', label: 'Add Ginger', desc: 'Crush and add now' },
    { id: 'tea', emoji: '🍃', label: 'Add Tea Leaves', desc: '1 tsp, let it brew' },
    { id: 'milk', emoji: '🥛', label: 'Pour Milk', desc: 'Half cup, stir well' },
    { id: 'sugar', emoji: '🍬', label: 'Add Sugar', desc: '1 tsp to taste' },
    { id: 'filter', emoji: '🫗', label: 'Filter & Pour', desc: 'Into cup, serve hot' },
  ]

  const [playerOrder, setPlayerOrder] = useState(() =>
    [...correctOrder].sort(() => Math.random() - 0.5)
  )
  const [checking, setChecking] = useState(false)
  const [score, setScore] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const dragItem = useRef(null)

  const handleDragStart = (e, index) => {
    dragItem.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(index)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    const from = dragItem.current
    if (from === index) { setDragOver(null); return }
    const newOrder = [...playerOrder]
    const dragged = newOrder.splice(from, 1)[0]
    newOrder.splice(index, 0, dragged)
    setPlayerOrder(newOrder)
    setDragOver(null)
    setScore(null)
  }

  const handleDragEnd = () => {
    setDragOver(null)
    dragItem.current = null
  }

  const handleCheck = () => {
    setChecking(true)
    let correct = 0
    playerOrder.forEach((item, i) => {
      if (item.id === correctOrder[i].id) correct++
    })
    setTimeout(() => {
      setScore(correct)
      setChecking(false)
    }, 600)
  }

  const handleReset = () => {
    setPlayerOrder([...correctOrder].sort(() => Math.random() - 0.5))
    setScore(null)
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #78350f10, #92400e08)',
        border: '1px solid #a16207',
        borderRadius: 16, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 40 }}>🫖</span>
        <div>
          <div style={{ fontWeight: 800, color: '#92400e', fontSize: 16, fontFamily: 'var(--font-heading)' }}>
            The Perfect Chai Challenge
          </div>
          <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
            Drag the steps into the correct order. Make the algorithm right and you get perfect chai!
          </div>
        </div>
      </div>

      {/* Draggable steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {playerOrder.map((step, i) => {
          const isCorrect = score !== null && step.id === correctOrder[i].id
          const isWrong = score !== null && step.id !== correctOrder[i].id
          return (
            <motion.div
              key={step.id}
              layout
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              animate={{
                scale: dragOver === i ? 1.03 : 1,
                borderColor: dragOver === i ? '#f59e0b' :
                  isCorrect ? '#10b981' : isWrong ? '#ef4444' : 'var(--border)',
                background: dragOver === i ? '#fef3c710' :
                  isCorrect ? '#10b98110' : isWrong ? '#ef444410' : 'var(--bg-card)',
              }}
              style={{
                border: '2px solid var(--border)',
                borderRadius: 14, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'grab', userSelect: 'none',
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, width: 20, textAlign: 'center' }}>
                ⠿
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--bg-secondary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
              }}>
                {step.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{step.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{step.desc}</div>
              </div>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#00000010', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>
                {i + 1}
              </div>
              {score !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 20 }}
                >
                  {isCorrect ? '✅' : '❌'}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: score !== null ? 20 : 0 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCheck}
          disabled={checking}
          style={{
            flex: 1, padding: '14px 0', borderRadius: 12,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white', border: 'none', fontWeight: 800, fontSize: 15,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
          }}
        >
          {checking ? 'Checking...' : 'Brew the Chai! ☕'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          style={{
            padding: '14px 20px', borderRadius: 12,
            background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', fontWeight: 600, fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Shuffle
        </motion.button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              borderRadius: 16, padding: '20px 24px',
              background: score === 6
                ? 'linear-gradient(135deg, #10b98115, #059e6815)'
                : score >= 4
                  ? 'linear-gradient(135deg, #f59e0b15, #d9770615)'
                  : 'linear-gradient(135deg, #ef444415, #dc262615)',
              border: `2px solid ${score === 6 ? '#10b98140' : score >= 4 ? '#f59e0b40' : '#ef444440'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 36 }}>
                {score === 6 ? '☕' : score >= 4 ? '🫖' : '💩'}
              </span>
              <div>
                <div style={{
                  fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading)',
                  color: score === 6 ? '#059e68' : score >= 4 ? '#d97706' : '#dc2626',
                }}>
                  {score === 6 ? 'Perfect Chai!' : score >= 4 ? 'Drinkable... barely.' : 'Disaster! Wrong order = wrong result.'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {score}/6 steps in correct position
                </div>
              </div>
            </div>
            <div style={{
              padding: '14px 16px', borderRadius: 12, background: 'var(--bg-card)',
              border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6,
            }}>
              <span style={{ fontWeight: 700 }}>The insight:</span> A recipe is an algorithm.
              Change the ORDER of steps and you get a different (worse) result.
              Algorithms are precise — every step matters, the sequence matters.
              This is why algorithms exist: to describe the EXACT right sequence of steps.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 3: Making Change ---- */
function MakingChangeDemo() {
  const coins = [
    { value: 20, label: '₹20', emoji: '🟡', color: '#f59e0b' },
    { value: 10, label: '₹10', emoji: '🟠', color: '#f97316' },
    { value: 5, label: '₹5', emoji: '🔵', color: '#3b82f6' },
    { value: 2, label: '₹2', emoji: '🟢', color: '#10b981' },
    { value: 1, label: '₹1', emoji: '⚪', color: '#94a3b8' },
  ]

  const TARGET = 47
  const [selectedCoins, setSelectedCoins] = useState([])
  const [showAlgo, setShowAlgo] = useState(false)

  const total = selectedCoins.reduce((sum, c) => sum + c, 0)
  const remaining = TARGET - total
  const isOver = total > TARGET
  const isDone = total === TARGET

  const addCoin = (value) => {
    if (total + value > TARGET) return
    setSelectedCoins([...selectedCoins, value])
    setShowAlgo(false)
  }

  const removeLast = () => {
    if (selectedCoins.length === 0) return
    setSelectedCoins(selectedCoins.slice(0, -1))
    setShowAlgo(false)
  }

  const reset = () => {
    setSelectedCoins([])
    setShowAlgo(false)
  }

  const runGreedy = () => {
    let remaining2 = TARGET
    const result = []
    for (const coin of coins) {
      while (remaining2 >= coin.value) {
        result.push(coin.value)
        remaining2 -= coin.value
      }
    }
    setSelectedCoins(result)
    setShowAlgo(true)
  }

  const coinCounts = coins.map(c => ({
    ...c,
    count: selectedCoins.filter(v => v === c.value).length,
  }))

  const greedySteps = [
    { step: 'Start with ₹47 to give back', remaining: 47 },
    { step: '₹47 ÷ ₹20 = 2 coins → ₹47 − ₹40 = ₹7 left', remaining: 7 },
    { step: '₹7 ÷ ₹10 = 0 coins (₹10 > ₹7, skip)', remaining: 7 },
    { step: '₹7 ÷ ₹5 = 1 coin → ₹7 − ₹5 = ₹2 left', remaining: 2 },
    { step: '₹2 ÷ ₹2 = 1 coin → ₹2 − ₹2 = ₹0 left', remaining: 0 },
    { step: 'Done! 4 coins total: ₹20 + ₹20 + ₹5 + ₹2 = ₹47', remaining: 0 },
  ]

  return (
    <div>
      {/* Target */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-secondary)', borderRadius: 16, padding: '18px 24px', marginBottom: 20,
        border: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 0.5 }}>AMOUNT TO RETURN</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
            ₹{TARGET}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 0.5 }}>YOUR COINS</div>
          <motion.div
            animate={{ color: isDone ? '#10b981' : isOver ? '#ef4444' : 'var(--text-primary)' }}
            style={{ fontSize: 42, fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}
          >
            ₹{total}
          </motion.div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 0.5 }}>REMAINING</div>
          <motion.div
            animate={{ color: isDone ? '#10b981' : isOver ? '#ef4444' : '#f59e0b' }}
            style={{ fontSize: 42, fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}
          >
            {isOver ? '+₹' + (total - TARGET) : '₹' + remaining}
          </motion.div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, marginBottom: 20, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${Math.min((total / TARGET) * 100, 100)}%` }}
          style={{
            height: '100%', borderRadius: 5,
            background: isDone ? '#10b981' : isOver ? '#ef4444' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Coin buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {coins.map((coin) => (
          <motion.button
            key={coin.value}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => addCoin(coin.value)}
            disabled={total + coin.value > TARGET || isDone}
            style={{
              padding: '12px 18px', borderRadius: 14,
              background: total + coin.value > TARGET || isDone ? 'var(--bg-secondary)' : `${coin.color}15`,
              border: `2px solid ${total + coin.value > TARGET || isDone ? 'var(--border)' : coin.color + '50'}`,
              color: total + coin.value > TARGET || isDone ? 'var(--text-secondary)' : coin.color,
              fontWeight: 800, fontSize: 16, cursor: total + coin.value > TARGET || isDone ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-heading)', transition: 'all 0.2s', opacity: total + coin.value > TARGET || isDone ? 0.5 : 1,
            }}
          >
            {coin.emoji} {coin.label}
          </motion.button>
        ))}
      </div>

      {/* Selected coins display */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 14, padding: '14px 18px', marginBottom: 16,
        border: '1px solid var(--border)', minHeight: 60,
        display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
      }}>
        {selectedCoins.length === 0 ? (
          <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontStyle: 'italic' }}>
            Click coins above to add them...
          </span>
        ) : (
          selectedCoins.map((v, i) => {
            const coin = coins.find(c => c.value === v)
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `${coin.color}20`, border: `2px solid ${coin.color}60`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', fontSize: 11, fontWeight: 800, color: coin.color,
                }}
              >
                <span style={{ fontSize: 14 }}>{coin.emoji}</span>
                <span style={{ fontSize: 10 }}>₹{v}</span>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Coin tally */}
      {selectedCoins.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {coinCounts.filter(c => c.count > 0).map((c) => (
            <div key={c.value} style={{
              padding: '6px 14px', borderRadius: 10,
              background: `${c.color}15`, border: `1px solid ${c.color}40`,
              color: c.color, fontWeight: 700, fontSize: 13,
            }}>
              {c.count}× {c.label}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 10,
            background: 'var(--bg-secondary)', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)',
          }}>
            {selectedCoins.length} coins total
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={removeLast}
          disabled={selectedCoins.length === 0}
          style={{
            padding: '10px 18px', borderRadius: 10, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', color: 'var(--text-secondary)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: selectedCoins.length === 0 ? 0.4 : 1,
          }}
        >
          ← Remove Last
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          style={{
            padding: '10px 18px', borderRadius: 10, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', color: 'var(--text-secondary)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          Reset
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runGreedy}
          style={{
            flex: 1, padding: '10px 18px', borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--font-heading)',
          }}
        >
          Show Greedy Algorithm
        </motion.button>
      </div>

      {/* Success state */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '18px 22px', borderRadius: 16,
              background: 'linear-gradient(135deg, #10b98115, #059e6815)',
              border: '2px solid #10b98140', marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18, color: '#059e68', marginBottom: 6 }}>
              ✅ Exact change! {selectedCoins.length} coins used.
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              The greedy algorithm achieves this in just 4 coins. Did you find fewer? Try it!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greedy algorithm explanation */}
      <AnimatePresence>
        {showAlgo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #6366f110, #8b5cf608)',
              border: '2px solid #6366f130',
              borderRadius: 16, padding: '20px 24px',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16, color: '#6366f1', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              The Greedy Algorithm in Plain English:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {greedySteps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '10px 14px', borderRadius: 10,
                    background: i === greedySteps.length - 1 ? '#10b98110' : 'var(--bg-card)',
                    border: `1px solid ${i === greedySteps.length - 1 ? '#10b98130' : 'var(--border)'}`,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: '#6366f120', color: '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{s.step}</div>
                </motion.div>
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: '14px 16px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6,
            }}>
              <span style={{ fontWeight: 700, color: '#6366f1' }}>Rule of thumb:</span> Always pick the largest coin that fits.
              This is the <span style={{ fontWeight: 700 }}>Greedy Algorithm</span> — at each step, make the locally best choice.
              For making change, greedy is OPTIMAL. You'll learn when greedy works (and when it fails!) in Topic 21.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 4: Flowchart Builder ---- */
function FlowchartBuilder() {
  const blocks = [
    { id: 'start', label: 'START', shape: 'oval', color: '#10b981', desc: 'Every algorithm has a start' },
    { id: 'input', label: 'INPUT number n', shape: 'parallelogram', color: '#3b82f6', desc: 'Get the number from user' },
    { id: 'decision', label: 'Is n % 2 == 0?', shape: 'diamond', color: '#f59e0b', desc: 'The KEY decision step' },
    { id: 'yes', label: 'PRINT "Even"', shape: 'rectangle', color: '#6366f1', desc: 'Output if condition is TRUE' },
    { id: 'no', label: 'PRINT "Odd"', shape: 'rectangle', color: '#ec4899', desc: 'Output if condition is FALSE' },
    { id: 'end', label: 'END', shape: 'oval', color: '#10b981', desc: 'Algorithm terminates' },
  ]

  const correctFlow = ['start', 'input', 'decision', 'yes', 'no', 'end']
  // User places blocks from a palette
  const [placed, setPlaced] = useState([])
  const [available, setAvailable] = useState(() => [...blocks].sort(() => Math.random() - 0.5))
  const [result, setResult] = useState(null)

  const placeBlock = (block) => {
    setPlaced([...placed, block])
    setAvailable(available.filter(b => b.id !== block.id))
    setResult(null)
  }

  const removeBlock = (block) => {
    setAvailable([...available, block])
    setPlaced(placed.filter(b => b.id !== block.id))
    setResult(null)
  }

  const checkFlow = () => {
    const placedIds = placed.map(b => b.id)
    let score = 0
    placedIds.forEach((id, i) => {
      if (id === correctFlow[i]) score++
    })
    setResult({ score, total: correctFlow.length, perfect: score === correctFlow.length })
  }

  const resetAll = () => {
    setPlaced([])
    setAvailable([...blocks].sort(() => Math.random() - 0.5))
    setResult(null)
  }

  const ShapeBlock = ({ block, onClick, showRemove, position }) => {
    const isCorrect = result && position !== undefined && block.id === correctFlow[position]
    const isWrong = result && position !== undefined && block.id !== correctFlow[position]

    const shapes = {
      oval: { borderRadius: 50, padding: '10px 20px' },
      rectangle: { borderRadius: 8, padding: '10px 20px' },
      parallelogram: { borderRadius: 8, padding: '10px 20px', transform: 'skewX(-10deg)' },
      diamond: { borderRadius: 8, padding: '10px 20px', transform: 'rotate(0deg)' },
    }

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
          ...shapes[block.shape],
          background: `${block.color}15`,
          border: `2px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : block.color + '50'}`,
          color: block.color, fontWeight: 700, fontSize: 13,
          cursor: 'pointer', textAlign: 'center', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all 0.2s', minWidth: 160,
          boxShadow: isCorrect ? '0 0 14px #10b98140' : isWrong ? '0 0 14px #ef444440' : 'none',
        }}
      >
        <span>{block.label}</span>
        {showRemove && <span style={{ fontSize: 11, opacity: 0.7 }}>✕</span>}
        {result && position !== undefined && (
          <span>{isCorrect ? ' ✅' : ' ❌'}</span>
        )}
      </motion.div>
    )
  }

  return (
    <div>
      {/* Instructions */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 14, padding: '14px 18px',
        marginBottom: 20, border: '1px solid var(--border)', fontSize: 14,
        color: 'var(--text-secondary)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-primary)' }}>Problem:</strong> "Is this number even or odd?"
        Build the flowchart by clicking blocks from the palette in the correct order.
        Click a placed block to remove it.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Palette */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: 0.5 }}>
            AVAILABLE BLOCKS:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {available.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontStyle: 'italic', padding: 12 }}>
                All blocks placed! Now check or rearrange.
              </div>
            ) : (
              available.map((block) => (
                <div key={block.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShapeBlock block={block} onClick={() => placeBlock(block)} />
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{block.desc}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flowchart canvas */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: 0.5 }}>
            YOUR FLOWCHART:
          </div>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14, padding: 16,
            border: '2px dashed var(--border)', minHeight: 320,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          }}>
            {placed.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontStyle: 'italic', marginTop: 40 }}>
                Click blocks from the palette to build your flowchart
              </div>
            ) : (
              placed.map((block, i) => (
                <div key={block.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ShapeBlock
                    block={block}
                    onClick={() => removeBlock(block)}
                    showRemove
                    position={i}
                  />
                  {i < placed.length - 1 && (
                    <div style={{
                      width: 2, height: 20, background: 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', bottom: -4,
                        width: 0, height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '8px solid var(--border)',
                      }} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={checkFlow}
          disabled={placed.length < 2}
          style={{
            flex: 1, padding: '12px 0', borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', border: 'none', fontWeight: 700, fontSize: 14,
            cursor: placed.length < 2 ? 'not-allowed' : 'pointer', opacity: placed.length < 2 ? 0.5 : 1,
            fontFamily: 'var(--font-heading)',
          }}
        >
          Check Flowchart
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetAll}
          style={{
            padding: '12px 20px', borderRadius: 12, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', color: 'var(--text-secondary)',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          Reset
        </motion.button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: '18px 22px', borderRadius: 14,
              background: result.perfect ? '#10b98115' : '#f59e0b10',
              border: `2px solid ${result.perfect ? '#10b98140' : '#f59e0b40'}`,
            }}
          >
            <div style={{ fontWeight: 800, color: result.perfect ? '#059e68' : '#d97706', fontSize: 17, marginBottom: 6 }}>
              {result.perfect
                ? '✅ Perfect Flowchart! Every block in the right place.'
                : `${result.score}/${result.total} blocks correctly placed. Check the highlighted ones!`}
            </div>
            {result.perfect && (
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This flowchart IS the algorithm. Every diamond is a decision point. Every rectangle is an action.
                Algorithms are just flowcharts expressed in code.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 5: Algorithms Are Everywhere ---- */
function AlgorithmsEverywhere() {
  const [activeCard, setActiveCard] = useState(null)

  const apps = [
    {
      id: 'maps',
      title: 'Google Maps',
      icon: '🗺️',
      color: '#3b82f6',
      tagline: 'Shortest Path',
      problem: 'You\'re at Connaught Place. Want to reach IGI Airport fastest.',
      algorithm: 'Dijkstra\'s Algorithm',
      steps: [
        'Represent Delhi roads as a GRAPH (nodes=intersections, edges=roads)',
        'Each road has a weight (distance OR current travel time)',
        'Dijkstra\'s explores cheapest paths first, always',
        'Result: THE optimal path updated every 30 seconds with live traffic',
      ],
      visual: [
        { x: 10, y: 50, label: 'CP', active: true },
        { x: 35, y: 20, label: 'NH8' },
        { x: 60, y: 40, label: 'Mahipalpur' },
        { x: 85, y: 55, label: 'IGI' },
      ],
    },
    {
      id: 'spotify',
      title: 'Spotify Shuffle',
      icon: '🎵',
      color: '#10b981',
      tagline: 'Randomization',
      problem: '500 songs in your library. How to play them in "random" order?',
      algorithm: 'Fisher-Yates Shuffle',
      steps: [
        'Start with ordered list of 500 songs',
        'For each position i (from end to start)...',
        '...pick a random index j between 0 and i',
        'Swap songs at position i and j. Done! Every order is equally likely.',
      ],
      visual: [
        { emoji: '🎸', from: 0, to: 3 },
        { emoji: '🎺', from: 1, to: 0 },
        { emoji: '🥁', from: 2, to: 4 },
        { emoji: '🎹', from: 3, to: 2 },
        { emoji: '🎷', from: 4, to: 1 },
      ],
    },
    {
      id: 'insta',
      title: 'Instagram Feed',
      icon: '📱',
      color: '#ec4899',
      tagline: 'Ranking Algorithm',
      problem: '200 posts available. Which 20 to show first?',
      algorithm: 'Weighted Scoring + ML Ranking',
      steps: [
        'For each post, compute: score = (likes × 0.3) + (comments × 0.5) + (recency × 0.2)',
        'Apply personalization: multiply by "affinity" with that creator',
        'Sort all 200 posts by final score (descending)',
        'Show top 20. Refresh every time you open the app.',
      ],
      visual: [
        { label: 'Post A', score: 94 },
        { label: 'Post B', score: 87 },
        { label: 'Post C', score: 72 },
        { label: 'Post D', score: 61 },
        { label: 'Post E', score: 45 },
      ],
    },
    {
      id: 'upi',
      title: 'UPI Payment',
      icon: '💳',
      color: '#f59e0b',
      tagline: 'Verification Steps',
      problem: 'You send ₹500 via UPI. How does it reach the right person instantly?',
      algorithm: 'Multi-Step Verification Protocol',
      steps: [
        'Verify: Is your UPI PIN correct? (authentication)',
        'Check: Does your account have ₹500? (balance validation)',
        'Lookup: Resolve "name@upi" to actual bank account (DNS-like lookup)',
        'Transfer: Send debit + credit instructions to both banks simultaneously. Done in < 2 sec!',
      ],
      visual: [
        { step: 'PIN ✓', done: true },
        { step: 'Balance ✓', done: true },
        { step: 'Resolve', done: false },
        { step: 'Transfer', done: false },
      ],
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar Matching',
      icon: '🪪',
      color: '#8b5cf6',
      tagline: 'Biometric Search',
      problem: '1.4 billion people\'s fingerprints. Find a match in under 1 second.',
      algorithm: 'Fingerprint Indexing + Binary Search Tree',
      steps: [
        'A fingerprint is converted to a mathematical "minutiae" vector',
        'The UIDAI database is organized as a search tree (not a flat list)',
        'Query fingerprint is compared hierarchically, narrowing matches fast',
        'Result: exact 1-in-1.4B match found in milliseconds',
      ],
      visual: [{ match: 'Finding match in 1.4B records...' }],
    },
    {
      id: 'swiggy',
      title: 'Swiggy Delivery',
      icon: '🛵',
      color: '#f97316',
      tagline: 'Route Optimization',
      problem: '1 delivery partner, 3 orders, all different restaurants and customers.',
      algorithm: 'Travelling Salesman (Greedy Approximation)',
      steps: [
        'Build a graph: restaurants → customer locations',
        'Calculate distance matrix between ALL points',
        'Greedy approach: always go to nearest unvisited point',
        'Assign delivery partner + estimate arrival times for all 3 customers',
      ],
      visual: [
        { emoji: '🍕', label: 'R1', x: 20, y: 30 },
        { emoji: '🍔', label: 'R2', x: 60, y: 20 },
        { emoji: '🍜', label: 'R3', x: 40, y: 60 },
        { emoji: '🏠', label: 'C1', x: 80, y: 50 },
        { emoji: '🏠', label: 'C2', x: 15, y: 75 },
      ],
    },
  ]

  return (
    <div>
      <div style={{
        fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6,
      }}>
        Every app you use runs algorithms invisibly. Click any card to see what's happening under the hood.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {apps.map((app, idx) => {
          const isActive = activeCard === app.id
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              onClick={() => setActiveCard(isActive ? null : app.id)}
              style={{
                background: 'var(--bg-card)',
                border: isActive ? `2px solid ${app.color}50` : '1px solid var(--border)',
                borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <motion.div
                whileHover={{ background: `${app.color}10` }}
                style={{ padding: '18px 16px', transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `${app.color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>
                    {app.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{app.title}</div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: app.color,
                      background: `${app.color}15`, padding: '2px 8px', borderRadius: 6, display: 'inline-block',
                    }}>
                      {app.tagline}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {app.problem}
                </div>
              </motion.div>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '14px 16px',
                      background: `${app.color}08`,
                      borderTop: `1px solid ${app.color}20`,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: app.color, letterSpacing: 0.5, marginBottom: 8 }}>
                        ALGORITHM: {app.algorithm.toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {app.steps.map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                              background: `${app.color}20`, color: app.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 800, marginTop: 1,
                            }}>
                              {i + 1}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{step}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- Section 6: Algorithm vs Code ---- */
function AlgorithmVsCode() {
  const [activeTab, setActiveTab] = useState('english')
  const [highlightedLine, setHighlightedLine] = useState(null)

  const tabs = [
    { id: 'english', label: 'Plain English', icon: '💬', color: '#10b981' },
    { id: 'pseudo', label: 'Pseudocode', icon: '📋', color: '#6366f1' },
    { id: 'python', label: 'Python Code', icon: '🐍', color: '#f59e0b' },
  ]

  const content = {
    english: {
      title: 'Find the Largest Number in a List',
      lines: [
        { text: '1. Start with the first number. Assume it is the largest.', key: 'init' },
        { text: '2. Look at the next number in the list.', key: 'loop' },
        { text: '3. Is it bigger than your current "largest"?', key: 'compare' },
        { text: '4. If YES → update your "largest" to this new number.', key: 'update' },
        { text: '5. If NO → keep the current "largest" as is.', key: 'keep' },
        { text: '6. Repeat steps 2-5 for every number in the list.', key: 'repeat' },
        { text: '7. When done, your "largest" variable holds the answer.', key: 'done' },
      ],
    },
    pseudo: {
      title: 'Find Largest — Pseudocode',
      lines: [
        { text: 'FUNCTION findLargest(numbers):', key: 'init' },
        { text: '    largest ← numbers[0]', key: 'init' },
        { text: '    FOR each num IN numbers:', key: 'loop' },
        { text: '        IF num > largest:', key: 'compare' },
        { text: '            largest ← num', key: 'update' },
        { text: '        END IF', key: 'keep' },
        { text: '    END FOR', key: 'repeat' },
        { text: '    RETURN largest', key: 'done' },
      ],
    },
    python: {
      title: 'Find Largest — Python',
      lines: [
        { text: 'def find_largest(numbers):', key: 'init', note: '# Define the function' },
        { text: '    largest = numbers[0]', key: 'init', note: '# Assume first is largest' },
        { text: '    for num in numbers:', key: 'loop', note: '# Loop through every number' },
        { text: '        if num > largest:', key: 'compare', note: '# Is this one bigger?' },
        { text: '            largest = num', key: 'update', note: '# Update if so' },
        { text: '    return largest', key: 'done', note: '# Return the answer' },
        { text: '', key: null },
        { text: '# Example:', key: null },
        { text: 'nums = [3, 7, 1, 9, 4, 6]', key: null, note: '# Test input' },
        { text: 'print(find_largest(nums))  # → 9', key: 'done', note: '# Output: 9' },
      ],
    },
  }

  const lineColors = {
    init: '#10b981',
    loop: '#3b82f6',
    compare: '#f59e0b',
    update: '#ec4899',
    keep: '#6366f1',
    repeat: '#3b82f6',
    done: '#10b981',
  }

  const current = content[activeTab]

  return (
    <div>
      {/* Insight header */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        border: '1px solid #bae6fd', borderRadius: 16, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>💡</span>
        <div>
          <div style={{ fontWeight: 800, color: '#0369a1', fontSize: 16, marginBottom: 4 }}>
            The Key Insight
          </div>
          <div style={{ fontSize: 14, color: '#0369a1', lineHeight: 1.6 }}>
            The ALGORITHM is the same in all three versions below. Only the language changes.
            You must think of the algorithm FIRST, then translate it to code.
            Code without a clear algorithm in your head = spaghetti.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 12,
              background: activeTab === tab.id ? `${tab.color}15` : 'var(--bg-secondary)',
              border: activeTab === tab.id ? `2px solid ${tab.color}50` : '2px solid var(--border)',
              color: activeTab === tab.id ? tab.color : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Code block */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            background: '#0f172a', borderRadius: 18,
            border: '1px solid #1e293b', overflow: 'hidden',
          }}
        >
          {/* Header bar */}
          <div style={{
            background: '#1e293b', padding: '12px 20px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8, fontFamily: 'monospace' }}>
              {current.title}
            </span>
          </div>

          {/* Lines */}
          <div style={{ padding: '20px 0' }}>
            {current.lines.map((line, i) => (
              <motion.div
                key={i}
                onMouseEnter={() => setHighlightedLine(i)}
                onMouseLeave={() => setHighlightedLine(null)}
                animate={{
                  background: highlightedLine === i ? '#ffffff08' : 'transparent',
                }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 0,
                  padding: '4px 0', cursor: 'default',
                }}
              >
                {/* Line number */}
                <div style={{
                  width: 50, textAlign: 'right', paddingRight: 16, flexShrink: 0,
                  fontSize: 13, color: '#475569', fontFamily: 'monospace', lineHeight: 1.8,
                }}>
                  {line.text ? i + 1 : ''}
                </div>
                {/* Code */}
                <div style={{ flex: 1, paddingRight: 20 }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 14, lineHeight: 1.8,
                    color: line.key ? (lineColors[line.key] || '#e2e8f0') : '#e2e8f0',
                  }}>
                    {line.text}
                  </span>
                  {line.note && (
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#475569', marginLeft: 8 }}>
                      {line.note}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        {Object.entries(lineColors).filter((_, i) => i < 5).map(([key, color]) => (
          <div key={key} style={{
            padding: '4px 12px', borderRadius: 8,
            background: `${color}12`, color: color,
            fontSize: 12, fontWeight: 700, border: `1px solid ${color}30`,
          }}>
            {key}
          </div>
        ))}
        <div style={{
          marginLeft: 'auto', padding: '4px 12px', borderRadius: 8,
          background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
          fontSize: 12, fontWeight: 600, border: '1px solid var(--border)',
        }}>
          Same logic, different syntax
        </div>
      </div>

      <NeuronTip type="deep">
        Notice how the STRUCTURE is identical across all 3 versions. "Initialization → Loop → Comparison → Update → Return"
        is the algorithm. Python, JavaScript, Java, C++ — these are just different dialects that express the same algorithm.
        That's why learning algorithms makes you language-independent. Learn the thinking, not the syntax.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic1Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Opening Neuron message */}
      <Neuron
        mood="excited"
        size="medium"
        message="Welcome to 'Think Like a Programmer'! Before we learn any data structure or code, we need to answer one question: what IS an algorithm? Hint: you already use dozens of them every single day. Let's discover them together."
        typed
        style={{ marginBottom: 16 }}
      />

      {/* ─── Section 1: What Problem Are We Solving? ─── */}
      <SectionBlock title="What Problem Are We Solving?" icon="📦" color="#6366f1">
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Before learning what an algorithm IS, let's feel WHY we need one.
          Imagine you run a delivery company. You have 1000 packages and one truck.
          Without a strategy — an algorithm — you'll be driving all day getting nowhere.
          Pick a sorting strategy below and see what happens.
        </div>
        <InteractiveDemo
          title="Delivery Strategy Simulator"
          instruction="You have 1000 packages. Pick a sorting strategy for your delivery driver. See which algorithm wins."
        >
          <PackageSortingDemo />
        </InteractiveDemo>

        <NeuronTip type="tip">
          An algorithm is just a <strong>strategy for solving a problem</strong>.
          The "By Distance" strategy is essentially Dijkstra's shortest-path algorithm — the same one
          Google Maps runs millions of times per second. You'll build this from scratch in Topic 19.
        </NeuronTip>

        <HindiExplainer
          concept="Algorithm क्या है?"
          english="What is an Algorithm?"
          explanation="Algorithm एक step-by-step plan है — किसी भी problem को solve करने का तरीका। जैसे courier company को decide करना पड़ता है: packages कैसे sort करें, किस route से जाएं। यह decision-making process ही algorithm है।"
          example="सोचो तुम Zomato delivery boy हो। तुम्हारे पास 5 orders हैं। तुम naturally nearest delivery पहले करते हो, फिर next nearest। यह 'Nearest Neighbor Algorithm' है — बिना जाने, तुम already algorithmic thinking कर रहे हो!"
          terms={[
            { hindi: 'कलन विधि', english: 'Algorithm', meaning: 'किसी problem को solve करने की step-by-step plan' },
            { hindi: 'रणनीति', english: 'Strategy', meaning: 'एक specific approach या तरीका' },
            { hindi: 'दक्षता', english: 'Efficiency', meaning: 'कम time और effort में ज़्यादा काम' },
          ]}
        />
      </SectionBlock>

      {/* ─── Section 2: Algorithm = Recipe ─── */}
      <SectionBlock title="Algorithm = Recipe" icon="🫖" color="#f59e0b">
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Here's the best analogy in all of computer science: <strong>an algorithm is a recipe.</strong>
          Every recipe is a set of precise, ordered steps. Get the order wrong and the result changes.
          Same with algorithms — ORDER matters. Let's prove it.
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
        }}>
          {[
            { label: 'Both have...', items: ['A precise sequence of steps', 'Specific inputs (ingredients/data)', 'A clear output (dish/result)', 'Steps that must be in ORDER'] },
            { label: 'Both fail when...', items: ['Steps are out of order', 'An ingredient is missing (bad input)', 'A step is skipped', 'The "recipe" is ambiguous'] },
          ].map((col, i) => (
            <div key={i} style={{
              background: i === 0 ? '#10b98110' : '#ef444410',
              border: `1px solid ${i === 0 ? '#10b98130' : '#ef444430'}`,
              borderRadius: 14, padding: '16px 18px',
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: i === 0 ? '#059e68' : '#dc2626', marginBottom: 10 }}>
                {col.label}
              </div>
              {col.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ color: i === 0 ? '#10b981' : '#ef4444', fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                    {i === 0 ? '✓' : '✗'}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <InteractiveDemo
          title="Chai Recipe — Order the Steps"
          instruction="Drag the chai preparation steps into the correct order. Wrong order = terrible chai!"
        >
          <ChaiRecipeDemo />
        </InteractiveDemo>

        <Neuron
          mood="thinking"
          size="small"
          message="Notice how every step in the recipe has exactly ONE thing to do? That's a property of good algorithms — each step is atomic and unambiguous. 'Add tea' is clear. 'Make it taste good' is NOT an algorithm step — it's too vague."
          style={{ marginTop: 16 }}
        />

        <HindiExplainer
          concept="Algorithm = Recipe"
          english="Algorithm is like a Recipe"
          explanation="Chai बनाने का तरीका एक algorithm है! पहले पानी उबालो, फिर tea डालो, फिर दूध — sequence गलत हुई तो chai खराब। Computer science में भी exactly यही होता है: steps का order matter करता है।"
          example="अगर तुम पहले दूध डालो, फिर उबालो, फिर tea — यह terrible chai बनेगी। Algorithm गलत = result गलत। इसीलिए programmers पहले algorithm सोचते हैं, फिर code लिखते हैं।"
          terms={[
            { hindi: 'कदम', english: 'Step', meaning: 'एक individual action — sequence में एक काम' },
            { hindi: 'इनपुट', english: 'Input', meaning: 'Algorithm को दी जाने वाली सामग्री/data' },
            { hindi: 'आउटपुट', english: 'Output', meaning: 'Algorithm का result — जो हमें चाहिए' },
          ]}
        />
      </SectionBlock>

      {/* ─── Section 3: Your First Algorithm: Making Change ─── */}
      <SectionBlock title="Your First Algorithm: Making Change" icon="💰" color="#10b981">
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Enough theory. Let's write your first algorithm together.
          A shopkeeper needs to give ₹47 change using the fewest coins possible.
          Try it yourself first — then we'll reveal the algorithm the computer uses.
        </div>

        <InteractiveDemo
          title="Make Change for ₹47"
          instruction="Click coins to add them. Goal: reach exactly ₹47 using as few coins as possible. Then compare with the Greedy Algorithm!"
        >
          <MakingChangeDemo />
        </InteractiveDemo>

        <NeuronTip type="example">
          The "Greedy" strategy — always pick the largest coin that fits — is a real algorithm called
          the <strong>Greedy Algorithm</strong>. For Indian currency denominations, it always gives the OPTIMAL answer
          (fewest coins). But for weird coin sets (like ₹1, ₹3, ₹4) greedy can FAIL.
          You'll study this fascinating exception in Topic 21: Greedy Algorithms.
        </NeuronTip>

        <HindiExplainer
          concept="Greedy Algorithm"
          english="Greedy Algorithm (लालची विधि)"
          explanation="Greedy Algorithm मतलब — हर step पर सबसे बड़ा possible option choose करो। Change देते समय सबसे बड़ा coin लो जो fit हो। Simple, fast, और अक्सर optimal!"
          example="₹47 change: सबसे पहले ₹20 लो (2 बार = ₹40), फिर ₹5 (₹45), फिर ₹2 (₹47). 4 coins में done! यही Greedy Algorithm है — locally best choice करते रहो।"
          terms={[
            { hindi: 'लालची', english: 'Greedy', meaning: 'हर step पर तुरंत best option choose करना' },
            { hindi: 'न्यूनतम', english: 'Minimum', meaning: 'सबसे कम — least number of coins' },
            { hindi: 'इष्टतम', english: 'Optimal', meaning: 'Best possible answer — कोई better solution नहीं' },
          ]}
        />
      </SectionBlock>

      {/* ─── Section 4: Flowchart Builder ─── */}
      <SectionBlock title="Flowchart Builder" icon="📊" color="#8b5cf6">
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Before computers existed, engineers drew <strong>flowcharts</strong> — visual diagrams of algorithms.
          Every decision becomes a diamond. Every action becomes a rectangle. Every algorithm has a start and end.
          Build the flowchart for a simple problem: "Is a number even or odd?"
        </div>

        <div style={{
          display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
        }}>
          {[
            { shape: '⬭', label: 'Oval', desc: 'Start / End' },
            { shape: '▱', label: 'Parallelogram', desc: 'Input / Output' },
            { shape: '▭', label: 'Rectangle', desc: 'Process / Action' },
            { shape: '◇', label: 'Diamond', desc: 'Decision (Yes/No)' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '10px 14px', borderRadius: 12,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 120px',
            }}>
              <span style={{ fontSize: 22 }}>{s.shape}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <InteractiveDemo
          title="Build the Flowchart"
          instruction="Click blocks from the palette (left) in the right order to build the flowchart (right). This IS the algorithm, just visualized."
        >
          <FlowchartBuilder />
        </InteractiveDemo>

        <NeuronTip type="fun">
          Fun fact: Ada Lovelace drew the world's first algorithm as a flowchart-like diagram in 1843 —
          a program for Charles Babbage's Analytical Engine to compute Bernoulli numbers.
          She never had a computer to run it on. Algorithms existed before computers!
        </NeuronTip>
      </SectionBlock>

      {/* ─── Section 5: Algorithms Are Everywhere ─── */}
      <SectionBlock title="Algorithms Are Everywhere" icon="🌐" color="#ec4899">
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>
          You've been using algorithms all day without knowing it.
          Every time you open Google Maps, Spotify, Instagram, or pay via UPI — there are hundreds of algorithms
          running in milliseconds behind the scenes. Let's peek inside 6 of them.
        </div>
        <AlgorithmsEverywhere />
        <Neuron
          mood="explaining"
          size="small"
          message="All the algorithms you see here — Dijkstra's, Fisher-Yates, ranking scores, BFS/DFS — you will BUILD and UNDERSTAND every single one of them in this course. By Topic 19, you'll code Google Maps from scratch."
          style={{ marginTop: 20 }}
        />
      </SectionBlock>

      {/* ─── Section 6: Algorithm vs Code ─── */}
      <SectionBlock title="Algorithm vs Code" icon="⌨️" color="#f59e0b">
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Here's the most important thing to understand before writing your first line of code:
          <strong style={{ color: 'var(--text-primary)' }}> Code is NOT the algorithm. Code is just the translation of an algorithm into a language computers understand.</strong>
          The same algorithm looks completely different in Python vs Java vs pseudocode —
          but the THINKING behind it is identical.
        </div>

        <AlgorithmVsCode />

        <div style={{
          marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        }}>
          {[
            {
              icon: '🧠',
              title: 'The Algorithm Thinker',
              desc: '"I need to find the largest element. I\'ll use a linear scan, tracking the current maximum. That\'s O(n) time, O(1) space." → Then picks any language to implement it.',
              color: '#10b981',
              label: 'Good Engineer',
            },
            {
              icon: '💻',
              title: 'The Code Monkey',
              desc: '"I\'ll Google \'find max python\' and paste the code." → Doesn\'t understand WHY it works, can\'t adapt it, breaks under pressure in interviews.',
              color: '#ef4444',
              label: 'Fragile Engineer',
            },
          ].map((c, i) => (
            <div key={i} style={{
              padding: '20px 20px', borderRadius: 16,
              background: `${c.color}10`, border: `1px solid ${c.color}30`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {c.title}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: c.color,
                    background: `${c.color}15`, padding: '2px 8px', borderRadius: 6, display: 'inline-block',
                  }}>
                    {c.label}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                {c.desc}
              </div>
            </div>
          ))}
        </div>

        <HindiExplainer
          concept="Algorithm और Code"
          english="Algorithm vs Code"
          explanation="Algorithm सोचने का तरीका है। Code उस सोच को computer language में लिखना है। पहले algorithm, फिर code। Algorithm बिना code लिखना — blindly driving without a map।"
          example="अगर तुम्हें chai बनानी है, पहले recipe (algorithm) सोचो: क्या-क्या चाहिए, किस order में करना है। फिर actually बनाओ (code)। बिना recipe के सोचे directly kitchen में जाना = disaster।"
          terms={[
            { hindi: 'स्यूडोकोड', english: 'Pseudocode', meaning: 'Algorithm को English-जैसी भाषा में लिखना — actual code नहीं' },
            { hindi: 'जटिलता', english: 'Complexity', meaning: 'Algorithm कितना fast या slow है' },
            { hindi: 'अनुवाद', english: 'Translation', meaning: 'Algorithm को Python/Java में convert करना' },
          ]}
        />
      </SectionBlock>

      {/* ─── Section 7: Hindi Summary ─── */}
      <SectionBlock title="पूरी बात हिंदी में" icon="🇮🇳" color="#ff9933">
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>
          आज हमने जो सीखा, उसे हिंदी में एक बार और समझते हैं।
          नीचे बटन दबाओ और पूरी summary हिंदी में पढ़ो।
        </div>

        <HindiExplainer
          concept="Algorithm — पूरी समझ"
          english="What is an Algorithm — Complete Summary"
          explanation="Algorithm एक step-by-step plan है किसी problem को solve करने का। यह recipe की तरह है — precise steps, sahi order में, specific input लेकर specific output देता है।

हम आज 4 examples देखे:
1. Delivery sorting — कौन सी strategy best है?
2. Chai recipe — order गलत = chai खराब
3. Change देना — Greedy Algorithm
4. Even/Odd check — Flowchart as algorithm

और important बात: Code ≠ Algorithm। Algorithm वो THINKING है। Code उसका translation है।"
          example="WhatsApp message send करते समय: (1) Message encrypt होता है [algorithm], (2) Server पर upload होता है [protocol], (3) Receiver का phone check करता है new message के लिए [polling algorithm], (4) Decrypt होकर screen पर show होता है [algorithm]। एक simple message भेजने में 10+ algorithms काम करते हैं!"
          terms={[
            { hindi: 'कलन विधि', english: 'Algorithm', meaning: 'Step-by-step problem-solving plan' },
            { hindi: 'कदम', english: 'Step', meaning: 'Sequence में एक specific action' },
            { hindi: 'इनपुट', english: 'Input', meaning: 'Algorithm को दिया जाने वाला data' },
            { hindi: 'आउटपुट', english: 'Output', meaning: 'Algorithm का final result' },
            { hindi: 'लालची विधि', english: 'Greedy Algorithm', meaning: 'हर step पर locally best choice' },
            { hindi: 'प्रवाह चित्र', english: 'Flowchart', meaning: 'Algorithm का visual diagram' },
            { hindi: 'कोड', english: 'Code', meaning: 'Algorithm का computer language में translation' },
          ]}
        />

        {/* Final summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 24,
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            borderRadius: 20, padding: '28px 32px',
            border: '1px solid #4338ca40',
          }}
        >
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: '#c7d2fe', marginBottom: 20 }}>
            What You Learned Today
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { icon: '🧩', text: 'An algorithm is a step-by-step strategy for solving a problem' },
              { icon: '🫖', text: 'Algorithms are like recipes — order matters, precision matters' },
              { icon: '💰', text: 'Your first algorithm: Greedy change-making (₹20 → ₹10 → ₹5 → ...)' },
              { icon: '📊', text: 'Flowcharts visualize algorithms — diamonds = decisions' },
              { icon: '🌐', text: 'Google Maps, Spotify, UPI — all algorithms you already use daily' },
              { icon: '⌨️', text: 'Code ≠ Algorithm. Think the algorithm first, then translate to code' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: '#a5b4fc', lineHeight: 1.6 }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What's next */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #f59e0b12, #ef444408)',
            borderRadius: 16, padding: '20px 24px',
            border: '1px solid #f59e0b30',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}
        >
          <span style={{ fontSize: 32, flexShrink: 0 }}>📦</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#d97706', fontFamily: 'var(--font-heading)', marginBottom: 6 }}>
              Coming Next: Arrays & How Memory Works
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              You now know what an algorithm is — a step-by-step recipe to solve a problem.
              But every recipe needs ingredients. In programming, your ingredients are <strong>data</strong>.
              The most fundamental way to store data is an <strong>Array</strong>.
              Understanding arrays is understanding the foundation everything else is built on.
            </div>
          </div>
        </motion.div>

        <Neuron
          mood="waving"
          size="medium"
          message="You just completed Topic 1! You now think differently — when you see Google Maps routing you, you'll think 'Dijkstra's algorithm!' When Spotify shuffles, you'll think 'Fisher-Yates!' That's the goal of this entire course: see algorithms everywhere. See you in Topic 2!"
          style={{ marginTop: 24 }}
        />
      </SectionBlock>

    </div>
  )
}
