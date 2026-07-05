import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

// ─── colour palette ──────────────────────────────────────────────────────────
const C = {
  gold:    '#f59e0b',
  silver:  '#94a3b8',
  bronze:  '#b45309',
  green:   '#10b981',
  blue:    '#3b82f6',
  indigo:  '#6366f1',
  pink:    '#ec4899',
  red:     '#ef4444',
  purple:  '#8b5cf6',
  teal:    '#14b8a6',
  neutral: '#64748b',
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Coin Change Problem
// ════════════════════════════════════════════════════════════════════════════
const COINS_INR = [
  { value: 50, label: '₹50', color: C.gold,   emoji: '🟡' },
  { value: 20, label: '₹20', color: C.silver, emoji: '⚪' },
  { value: 10, label: '₹10', color: C.teal,   emoji: '🔵' },
  { value:  5, label: '₹5',  color: C.green,  emoji: '🟢' },
  { value:  2, label: '₹2',  color: C.blue,   emoji: '💙' },
  { value:  1, label: '₹1',  color: C.neutral,emoji: '⚫' },
]

const GREEDY_TARGET = 93
const FAIL_COINS = [
  { value: 4, label: '₹4', color: C.pink   },
  { value: 3, label: '₹3', color: C.purple },
  { value: 1, label: '₹1', color: C.neutral },
]
const FAIL_TARGET = 6

function CoinChangeDemo() {
  const [remaining, setRemaining] = useState(GREEDY_TARGET)
  const [picked, setPicked] = useState([])
  const [done, setDone] = useState(false)
  const [mode, setMode] = useState('greedy') // 'greedy' | 'fail'

  const target = mode === 'greedy' ? GREEDY_TARGET : FAIL_TARGET
  const coins  = mode === 'greedy' ? COINS_INR     : FAIL_COINS

  function reset(newMode) {
    const t = newMode === 'greedy' ? GREEDY_TARGET : FAIL_TARGET
    setMode(newMode)
    setRemaining(t)
    setPicked([])
    setDone(false)
  }

  function pickCoin(coin) {
    if (done || coin.value > remaining) return
    const newRemaining = remaining - coin.value
    const newPicked = [...picked, coin]
    setPicked(newPicked)
    setRemaining(newRemaining)
    if (newRemaining === 0) setDone(true)
  }

  function undoCoin() {
    if (picked.length === 0) return
    const last = picked[picked.length - 1]
    setPicked(p => p.slice(0, -1))
    setRemaining(r => r + last.value)
    setDone(false)
  }

  const optimalGreedy = [50, 20, 20, 2, 1]
  const optimalFail   = [3, 3]
  const greedyFail    = [4, 1, 1]

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'greedy', label: '₹93 — Greedy works ✅', color: C.green },
          { key: 'fail',   label: '₹6  — Greedy FAILS ❌', color: C.red  },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => reset(m.key)}
            style={{
              padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14,
              background: mode === m.key ? m.color : 'var(--bg-secondary)',
              color: mode === m.key ? '#fff' : 'var(--text-secondary)',
              transition: 'all .25s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Target display */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
        background: 'var(--bg-secondary)', borderRadius: 16, padding: '18px 24px',
      }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
          Target: ₹{target}
        </span>
        <span style={{ fontSize: 14, color: C.neutral }}>→</span>
        <span style={{
          fontSize: 28, fontWeight: 700,
          color: remaining === 0 ? C.green : remaining < 0 ? C.red : C.blue,
        }}>
          Remaining: ₹{remaining}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 20, fontWeight: 700, color: C.purple }}>
          Coins used: {picked.length}
        </span>
      </div>

      {/* Coin buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {coins.map(coin => (
          <motion.button
            key={coin.value}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => pickCoin(coin)}
            disabled={coin.value > remaining || done}
            style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none',
              background: coin.value > remaining ? '#e2e8f0' : coin.color,
              color: coin.value > remaining ? C.neutral : '#fff',
              fontWeight: 800, fontSize: 15, cursor: coin.value > remaining ? 'not-allowed' : 'pointer',
              boxShadow: coin.value <= remaining ? `0 4px 16px ${coin.color}55` : 'none',
              transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {coin.label}
          </motion.button>
        ))}
        <button
          onClick={undoCoin}
          disabled={picked.length === 0}
          style={{
            padding: '0 20px', height: 72, borderRadius: 16, border: '2px solid var(--border)',
            background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            color: 'var(--text-secondary)',
          }}
        >
          ↩ Undo
        </button>
        <button
          onClick={() => reset(mode)}
          style={{
            padding: '0 20px', height: 72, borderRadius: 16, border: '2px solid var(--border)',
            background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            color: 'var(--text-secondary)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Picked coins tray */}
      <AnimatePresence>
        {picked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'var(--bg-secondary)', borderRadius: 14, padding: '14px 18px',
              marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: C.neutral, marginRight: 4 }}>
              Bag:
            </span>
            {picked.map((c, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  background: c.color, color: '#fff',
                  borderRadius: 50, padding: '4px 12px',
                  fontWeight: 700, fontSize: 13,
                }}
              >
                {c.label}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success / info */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              borderRadius: 14, padding: '18px 24px',
              background: mode === 'greedy' ? '#f0fdf4' : '#fff1f2',
              border: `2px solid ${mode === 'greedy' ? C.green : C.red}`,
              color: mode === 'greedy' ? '#166534' : '#991b1b',
              fontWeight: 700, fontSize: 16,
            }}
          >
            {mode === 'greedy' ? (
              <>
                ✅ Done in {picked.length} coins! Greedy optimal: {optimalGreedy.map(v=>`₹${v}`).join(' + ')} = {optimalGreedy.length} coins.
              </>
            ) : (
              <>
                ❌ Greedy used {picked.length} coins ({greedyFail.map(v=>`₹${v}`).join('+')}),
                but optimal is only 2 coins: {optimalFail.map(v=>`₹${v}`).join('+')}!
                <br/>
                <span style={{ fontWeight: 400, fontSize: 14 }}>
                  Greedy picked ₹4 first, leaving ₹2 — forced to use ₹1+₹1. But ₹3+₹3 is better!
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Activity Selection
// ════════════════════════════════════════════════════════════════════════════
const ACTIVITIES = [
  { id: 0, name: 'Morning Yoga',    start: 0,  end: 3,  color: C.green  },
  { id: 1, name: 'Team Meeting',    start: 2,  end: 5,  color: C.blue   },
  { id: 2, name: 'Client Call',     start: 4,  end: 6,  color: C.pink   },
  { id: 3, name: 'Code Review',     start: 5,  end: 8,  color: C.purple },
  { id: 4, name: 'Lunch Break',     start: 6,  end: 8,  color: C.gold   },
  { id: 5, name: 'Workshop',        start: 7,  end: 10, color: C.indigo },
  { id: 6, name: 'Design Sprint',   start: 9,  end: 11, color: C.teal   },
  { id: 7, name: 'Evening Standup', start: 11, end: 13, color: C.red    },
]
const MAX_TIME = 13

// Greedy optimal: sort by end time → pick non-overlapping
const GREEDY_SOLUTION_IDS = (() => {
  const sorted = [...ACTIVITIES].sort((a, b) => a.end - b.end)
  const chosen = []
  let lastEnd = -1
  for (const act of sorted) {
    if (act.start >= lastEnd) { chosen.push(act.id); lastEnd = act.end }
  }
  return chosen
})()

function ActivityDemo() {
  const [selected, setSelected] = useState([])
  const [showGreedy, setShowGreedy] = useState(false)

  function toggleActivity(act) {
    if (showGreedy) return
    const isSelected = selected.includes(act.id)
    if (isSelected) {
      setSelected(s => s.filter(id => id !== act.id))
      return
    }
    // check overlap
    const hasConflict = selected.some(id => {
      const other = ACTIVITIES.find(a => a.id === id)
      return !(act.end <= other.start || act.start >= other.end)
    })
    if (!hasConflict) setSelected(s => [...s, act.id])
  }

  function isConflict(act) {
    if (selected.includes(act.id)) return false
    return selected.some(id => {
      const other = ACTIVITIES.find(a => a.id === id)
      return !(act.end <= other.start || act.start >= other.end)
    })
  }

  const displayIds = showGreedy ? GREEDY_SOLUTION_IDS : selected
  const SCALE = 100 / MAX_TIME // % per hour unit

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setShowGreedy(false); setSelected([]) }}
          style={{
            padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
            background: !showGreedy ? C.blue : 'var(--bg-secondary)',
            color: !showGreedy ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Try it yourself
        </button>
        <button
          onClick={() => setShowGreedy(true)}
          style={{
            padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
            background: showGreedy ? C.green : 'var(--bg-secondary)',
            color: showGreedy ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Show Greedy Solution ✅
        </button>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {/* Time ruler */}
        <div style={{
          display: 'flex', borderBottom: '2px solid var(--border)',
          marginBottom: 12, paddingBottom: 6,
        }}>
          {Array.from({ length: MAX_TIME + 1 }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1, textAlign: 'left', fontSize: 11,
                color: C.neutral, fontWeight: 600,
              }}
            >
              {i}h
            </div>
          ))}
        </div>

        {/* Activity bars */}
        {ACTIVITIES.map(act => {
          const isChosen = displayIds.includes(act.id)
          const conflict = !showGreedy && isConflict(act)
          return (
            <motion.div
              key={act.id}
              layout
              style={{ position: 'relative', height: 44, marginBottom: 8 }}
            >
              {/* Background track */}
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '50%',
                transform: 'translateY(-50%)',
                height: 2, background: 'var(--border)',
              }} />
              {/* Bar */}
              <motion.div
                whileHover={!showGreedy ? { scale: 1.02 } : {}}
                onClick={() => toggleActivity(act)}
                style={{
                  position: 'absolute',
                  left: `${act.start * SCALE}%`,
                  width: `${(act.end - act.start) * SCALE}%`,
                  top: 4, bottom: 4,
                  background: conflict
                    ? '#fee2e2'
                    : isChosen
                    ? act.color
                    : `${act.color}33`,
                  border: `2px solid ${conflict ? C.red : act.color}`,
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: showGreedy ? 'default' : conflict ? 'not-allowed' : 'pointer',
                  transition: 'all .25s',
                  overflow: 'hidden',
                }}
              >
                <span style={{
                  fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                  color: isChosen ? '#fff' : conflict ? C.red : act.color,
                  padding: '0 6px',
                }}>
                  {act.name}
                </span>
                {conflict && (
                  <span style={{ fontSize: 10, color: C.red, marginLeft: 2 }}>🚫</span>
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      <div style={{
        display: 'flex', gap: 16, alignItems: 'center',
        background: 'var(--bg-secondary)', borderRadius: 14, padding: '14px 20px',
      }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: C.indigo }}>
          {displayIds.length} / {ACTIVITIES.length}
        </span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
            Activities selected
          </div>
          {showGreedy && (
            <div style={{ fontSize: 13, color: C.green, marginTop: 2 }}>
              Greedy (earliest end first) = {GREEDY_SOLUTION_IDS.length} activities — maximum possible!
            </div>
          )}
          {!showGreedy && (
            <div style={{ fontSize: 13, color: C.neutral, marginTop: 2 }}>
              Click non-conflicting bars to select. Red = conflict!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Fractional Knapsack
// ════════════════════════════════════════════════════════════════════════════
const KNAPSACK_ITEMS = [
  { id: 'gold',   name: 'Gold',   weight: 10, value: 6000, color: C.gold,   emoji: '🥇', ratioLabel: '₹600/kg' },
  { id: 'silver', name: 'Silver', weight:  5, value: 3000, color: C.silver, emoji: '🥈', ratioLabel: '₹600/kg' },
  { id: 'bronze', name: 'Bronze', weight:  8, value: 2400, color: C.bronze, emoji: '🥉', ratioLabel: '₹300/kg' },
]
const BAG_LIMIT = 15

function KnapsackDemo() {
  // fraction taken for each item (0..1)
  const [fractions, setFractions] = useState({ gold: 0, silver: 0, bronze: 0 })
  const [showGreedy, setShowGreedy] = useState(false)

  const totalWeight = KNAPSACK_ITEMS.reduce((s, it) => s + it.weight * fractions[it.id], 0)
  const totalValue  = KNAPSACK_ITEMS.reduce((s, it) => s + it.value  * fractions[it.id], 0)

  function setFrac(id, val) {
    const clamped = Math.max(0, Math.min(1, val))
    const item = KNAPSACK_ITEMS.find(i => i.id === id)
    const otherWeight = KNAPSACK_ITEMS
      .filter(i => i.id !== id)
      .reduce((s, i) => s + i.weight * fractions[i.id], 0)
    const maxAllowed = (BAG_LIMIT - otherWeight) / item.weight
    setFractions(f => ({ ...f, [id]: Math.min(clamped, maxAllowed) }))
  }

  function applyGreedy() {
    // Gold: 600/kg, Silver: 600/kg, Bronze: 300/kg
    // Take all gold (10kg) + all silver (5kg) = 15kg exactly
    setFractions({ gold: 1, silver: 1, bronze: 0 })
    setShowGreedy(true)
  }

  function reset() {
    setFractions({ gold: 0, silver: 0, bronze: 0 })
    setShowGreedy(false)
  }

  const weightPct = (totalWeight / BAG_LIMIT) * 100

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={applyGreedy}
          style={{
            padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14, background: C.green, color: '#fff',
          }}
        >
          Apply Greedy Strategy ✅
        </button>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px', borderRadius: 50, border: '2px solid var(--border)',
            cursor: 'pointer', fontWeight: 700, fontSize: 14,
            background: 'var(--bg-card)', color: 'var(--text-secondary)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Items table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {KNAPSACK_ITEMS.map(item => (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-secondary)', borderRadius: 14,
              padding: '16px 20px', border: `2px solid ${fractions[item.id] > 0 ? item.color : 'var(--border)'}`,
              transition: 'border-color .3s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{item.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, color: C.neutral }}>
                  {item.weight}kg · ₹{item.value.toLocaleString()} · ratio: {item.ratioLabel}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: item.color }}>
                  {Math.round(fractions[item.id] * 100)}%
                </div>
                <div style={{ fontSize: 12, color: C.neutral }}>
                  +₹{Math.round(item.value * fractions[item.id]).toLocaleString()}
                </div>
              </div>
            </div>
            <input
              type="range" min={0} max={100}
              value={Math.round(fractions[item.id] * 100)}
              onChange={e => setFrac(item.id, e.target.value / 100)}
              style={{ width: '100%', accentColor: item.color, cursor: 'pointer' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: C.neutral, marginTop: 4,
            }}>
              <span>0 kg</span>
              <span>{item.weight} kg</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bag meter */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Backpack Weight</span>
          <span style={{ fontWeight: 700, color: weightPct > 100 ? C.red : C.green }}>
            {totalWeight.toFixed(1)} / {BAG_LIMIT} kg
          </span>
        </div>
        <div style={{
          height: 20, borderRadius: 99, background: 'var(--border)', overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${Math.min(weightPct, 100)}%` }}
            style={{
              height: '100%', borderRadius: 99,
              background: weightPct > 90 ? C.red : weightPct > 70 ? C.gold : C.green,
              transition: 'background .3s',
            }}
          />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 16,
          borderTop: '1px solid var(--border)', paddingTop: 14,
        }}>
          <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Total Value</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.indigo }}>
            ₹{Math.round(totalValue).toLocaleString()}
          </span>
        </div>
        {showGreedy && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 12, padding: '12px 16px', borderRadius: 10,
              background: '#f0fdf4', border: `1px solid ${C.green}`,
              color: '#166534', fontSize: 14, fontWeight: 600,
            }}
          >
            ✅ Greedy: Take ALL Gold (highest ratio ₹600/kg) + ALL Silver (₹600/kg) = 15kg, ₹9000 — maximum possible!
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Huffman Coding
// ════════════════════════════════════════════════════════════════════════════
// We'll walk through merging step-by-step
// Initial: A=2, B=3, C=4, D=4
// Step 1: merge A(2)+B(3) → AB(5)
// Step 2: merge C(4)+D(4) → CD(8)
// Step 3: merge AB(5)+CD(8) → root(13)
// Codes: A=000 actually depends on tree shape...
// Let's use: left=0, right=1
// root→left=AB(5)→left=A(2)=00, right=B(3)=01
// root→right=CD(8)→left=C(4)=10, right=D(4)=11
// So: A=00(2bits), B=01(2bits), C=10(2bits), D=11(2bits) — all same length is fine for 4 chars

// Let's make it more illustrative:
// Text: "AABBBCCCCDDDD" → 2A, 3B, 4C, 4D = 13 chars
// After building Huffman: 13 * 2 = 26 bits vs naive 4 chars * 2 bits * 13 = 26 same? Let's use different freqs.
// Better: A=2, B=3, C=4, D=6 → total 15
// Step1: merge A(2)+B(3) → AB(5)
// Step2: merge AB(5)+C(4) → ABC(9) — wait: always pick smallest two
// Step2: merge C(4)+AB(5) → CAB(9)
// Step3: merge D(6)+CAB(9) → root(15)
// D=0(1bit), C=10(2bits), A=110(3bits), B=111(3bits)
// D=6: 6*1=6, C=4: 4*2=8, A=2: 2*3=6, B=3: 3*3=9 → total 29 bits
// Naive: 4 symbols = 2 bits each → 15*2 = 30 bits. Huffman: 29 bits — small gain but shows concept.

const HUFF_INITIAL = [
  { id: 'A', label: 'A', freq: 2, color: C.pink   },
  { id: 'B', label: 'B', freq: 3, color: C.purple },
  { id: 'C', label: 'C', freq: 4, color: C.teal   },
  { id: 'D', label: 'D', freq: 6, color: C.gold   },
]

const HUFF_STEPS = [
  {
    description: 'Pick two smallest: A(2) and B(3) → merge into AB(5)',
    action: 'Merge A+B',
    nodes: [
      { id: 'AB', label: 'AB', freq: 5, color: '#6366f1', children: ['A','B'] },
      { id: 'C',  label: 'C',  freq: 4, color: C.teal  },
      { id: 'D',  label: 'D',  freq: 6, color: C.gold  },
    ],
    merged: ['A','B'],
  },
  {
    description: 'Pick two smallest: C(4) and AB(5) → merge into CAB(9)',
    action: 'Merge C+AB',
    nodes: [
      { id: 'CAB', label: 'CAB', freq: 9, color: '#ec4899', children: ['C','AB'] },
      { id: 'D',   label: 'D',   freq: 6, color: C.gold },
    ],
    merged: ['C','AB'],
  },
  {
    description: 'Last two: D(6) and CAB(9) → ROOT(15)',
    action: 'Merge D+CAB',
    nodes: [
      { id: 'ROOT', label: 'ROOT', freq: 15, color: '#10b981', children: ['D','CAB'] },
    ],
    merged: ['D','CAB'],
  },
]

const HUFF_CODES = [
  { char: 'D', code: '0',   bits: 1, freq: 6, color: C.gold   },
  { char: 'C', code: '10',  bits: 2, freq: 4, color: C.teal   },
  { char: 'B', code: '111', bits: 3, freq: 3, color: C.purple },
  { char: 'A', code: '110', bits: 3, freq: 2, color: C.pink   },
]

function HuffmanDemo() {
  const [step, setStep] = useState(0) // 0 = initial, 1,2,3 = after merge steps

  const currentNodes = step === 0
    ? HUFF_INITIAL
    : HUFF_STEPS[step - 1].nodes

  const naiveBits = 15 * 2 // 2 bits per symbol, 15 total symbols
  const huffBits = HUFF_CODES.reduce((s, h) => s + h.bits * h.freq, 0)

  return (
    <div>
      {/* Frequency table */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 20px',
        marginBottom: 20,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.neutral, marginBottom: 10 }}>
          Text: "AABBBCCCCDDDDDD" → Character frequencies
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {HUFF_INITIAL.map(n => (
            <div
              key={n.id}
              style={{
                background: n.color, color: '#fff',
                borderRadius: 10, padding: '8px 18px',
                fontWeight: 800, fontSize: 18,
                boxShadow: `0 3px 10px ${n.color}44`,
              }}
            >
              {n.label}: {n.freq}
            </div>
          ))}
        </div>
      </div>

      {/* Step display */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20,
        background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 20px',
        minHeight: 80, alignItems: 'center',
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.neutral, minWidth: 80 }}>
          Step {step}/3:
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}
          >
            {currentNodes.map(n => (
              <div
                key={n.id}
                style={{
                  background: n.color, color: '#fff',
                  borderRadius: 10, padding: '10px 20px',
                  fontWeight: 800, fontSize: 17,
                  boxShadow: `0 3px 12px ${n.color}44`,
                  transition: 'all .3s',
                }}
              >
                {n.label}({n.freq})
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 0 && step <= HUFF_STEPS.length && (
        <motion.div
          key={`desc-${step}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            padding: '12px 18px', borderRadius: 10, marginBottom: 16,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            color: '#1e40af', fontSize: 14, fontWeight: 600,
          }}
        >
          ✂️ {HUFF_STEPS[step - 1].description}
        </motion.div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setStep(0)}
          style={{
            padding: '10px 18px', borderRadius: 50, border: '2px solid var(--border)',
            background: 'var(--bg-card)', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            color: 'var(--text-secondary)',
          }}
        >
          ↩ Reset
        </button>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: '10px 18px', borderRadius: 50, border: 'none',
            background: step === 0 ? 'var(--bg-secondary)' : C.neutral,
            color: step === 0 ? C.neutral : '#fff',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: 14,
          }}
        >
          ← Previous
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(s => Math.min(3, s + 1))}
            style={{
              padding: '10px 18px', borderRadius: 50, border: 'none',
              background: C.blue, color: '#fff', cursor: 'pointer',
              fontWeight: 700, fontSize: 14,
            }}
          >
            {step === 0 ? 'Start Merging →' : 'Next Merge →'}
          </button>
        ) : (
          <div style={{
            padding: '10px 18px', borderRadius: 50, background: C.green,
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            Tree built! ✅
          </div>
        )}
      </div>

      {/* Final codes */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: 'var(--text-primary)' }}>
            Resulting Huffman Codes:
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {HUFF_CODES.map(h => (
              <div
                key={h.char}
                style={{
                  background: h.color, color: '#fff', borderRadius: 12,
                  padding: '12px 20px', textAlign: 'center',
                  boxShadow: `0 4px 14px ${h.color}44`,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800 }}>{h.char}</div>
                <div style={{ fontSize: 16, fontFamily: 'monospace', marginTop: 2 }}>{h.code}</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{h.bits} bit{h.bits > 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', gap: 20, flexWrap: 'wrap',
            background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 20px',
          }}>
            <div>
              <div style={{ fontSize: 13, color: C.neutral }}>Naive (2 bits/char)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.red }}>{naiveBits} bits</div>
            </div>
            <div style={{ fontSize: 24, alignSelf: 'center', color: C.neutral }}>vs</div>
            <div>
              <div style={{ fontSize: 13, color: C.neutral }}>Huffman Greedy</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{huffBits} bits</div>
            </div>
            <div style={{
              marginLeft: 'auto', alignSelf: 'center',
              fontSize: 16, fontWeight: 700, color: C.green,
            }}>
              Saved {naiveBits - huffBits} bits ({Math.round((1 - huffBits / naiveBits) * 100)}%)
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Greedy vs DP
// ════════════════════════════════════════════════════════════════════════════
const COMPARISON_CASES = [
  {
    problem: 'Coin Change',
    emoji: '🪙',
    worksTitle: 'Standard denominations (₹1, ₹2, ₹5, ₹10, ₹20, ₹50)',
    worksExample: 'Target ₹93: ₹50+₹20+₹20+₹2+₹1 = 5 coins ✅',
    failsTitle: 'Arbitrary denominations (₹1, ₹3, ₹4)',
    failsExample: 'Target ₹6: Greedy picks ₹4+₹1+₹1=3, but ₹3+₹3=2 is better ❌',
    color: C.gold,
  },
  {
    problem: 'Knapsack',
    emoji: '🎒',
    worksTitle: 'Fractional Knapsack (can take fractions)',
    worksExample: 'Fill bag optimally by picking highest value/weight ratio first ✅',
    failsTitle: '0/1 Knapsack (take whole item or skip)',
    failsExample: 'Greedy might grab a heavy low-value item, missing a better combo ❌',
    color: C.teal,
  },
  {
    problem: 'Shortest Path',
    emoji: '🗺️',
    worksTitle: 'Non-negative edge weights (Dijkstra)',
    worksExample: 'Always expand nearest node → guaranteed optimal path ✅',
    failsTitle: 'Negative edge weights (Bellman-Ford needed)',
    failsExample: 'Greedy skips a far node, misses a shortcut through negative edge ❌',
    color: C.indigo,
  },
]

function GreedyVsDPDemo() {
  const [activeCase, setActiveCase] = useState(0)
  const [showFails, setShowFails] = useState(false)

  const c = COMPARISON_CASES[activeCase]

  return (
    <div>
      {/* Case selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {COMPARISON_CASES.map((cas, i) => (
          <button
            key={i}
            onClick={() => { setActiveCase(i); setShowFails(false) }}
            style={{
              padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14,
              background: activeCase === i ? cas.color : 'var(--bg-secondary)',
              color: activeCase === i ? '#fff' : 'var(--text-secondary)',
              transition: 'all .25s',
            }}
          >
            {cas.emoji} {cas.problem}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCase}-${showFails}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            marginBottom: 20,
          }}>
            {/* Works card */}
            <div style={{
              background: '#f0fdf4', border: `2px solid ${C.green}`,
              borderRadius: 16, padding: '20px 24px',
              opacity: showFails ? 0.5 : 1, transition: 'opacity .3s',
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.green, marginBottom: 8 }}>
                ✅ Greedy WORKS
              </div>
              <div style={{ fontWeight: 700, color: '#166534', marginBottom: 8, fontSize: 15 }}>
                {c.worksTitle}
              </div>
              <div style={{ fontSize: 14, color: '#166534', lineHeight: 1.6 }}>
                {c.worksExample}
              </div>
            </div>

            {/* Fails card */}
            <div style={{
              background: '#fff1f2', border: `2px solid ${C.red}`,
              borderRadius: 16, padding: '20px 24px',
              opacity: !showFails ? 0.5 : 1, transition: 'opacity .3s',
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.red, marginBottom: 8 }}>
                ❌ Greedy FAILS
              </div>
              <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: 8, fontSize: 15 }}>
                {c.failsTitle}
              </div>
              <div style={{ fontSize: 14, color: '#991b1b', lineHeight: 1.6 }}>
                {c.failsExample}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setShowFails(false)}
          style={{
            padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
            background: !showFails ? C.green : 'var(--bg-secondary)',
            color: !showFails ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Highlight: Greedy Works
        </button>
        <button
          onClick={() => setShowFails(true)}
          style={{
            padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
            background: showFails ? C.red : 'var(--bg-secondary)',
            color: showFails ? '#fff' : 'var(--text-secondary)',
          }}
        >
          Highlight: Greedy Fails
        </button>
      </div>

      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 14, padding: '16px 20px',
        color: '#1e40af', fontSize: 15, lineHeight: 1.7,
      }}>
        <strong>Key Principle:</strong> Greedy works when <strong>locally optimal choices = globally optimal result</strong>.
        This is called the <em>Greedy Choice Property</em>. When future decisions depend on earlier choices in complex ways, use Dynamic Programming instead.
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — Greedy Pattern Recognition Challenge
// ════════════════════════════════════════════════════════════════════════════
const CHALLENGES = [
  {
    id: 0,
    problem: 'Minimum platforms needed at a train station',
    answer: 'greedy',
    hint: 'Sort arrivals and departures, scan with two pointers — locally optimal is globally optimal.',
    explanation: 'Greedy ✅ — Sort by arrival time, track active trains. At each arrival, either reuse a freed platform or add one. Local decisions are always correct.',
    color: C.green,
  },
  {
    id: 1,
    problem: 'Longest Increasing Subsequence (LIS)',
    answer: 'dp',
    hint: 'Consider: [3, 1, 2]. Greedy picks 3 first. But 1,2 is already a longer start!',
    explanation: 'DP ❌ — Greedy fails because picking the current largest element often blocks longer subsequences. You need to track all possible states.',
    color: C.red,
  },
  {
    id: 2,
    problem: 'Job scheduling with deadlines (maximize profit)',
    answer: 'greedy',
    hint: 'Sort jobs by profit (descending). Schedule each job as LATE as possible before its deadline.',
    explanation: 'Greedy ✅ — Always pick the most profitable job first and slot it as late as possible. Local greedy choice = global optimum here.',
    color: C.green,
  },
  {
    id: 3,
    problem: 'Matrix Chain Multiplication',
    answer: 'dp',
    hint: 'Splitting (AB)C vs A(BC) can have wildly different costs — greedy can\'t look ahead.',
    explanation: 'DP ❌ — The optimal split depends on the sizes of ALL matrices in the chain. No local rule can tell you the best split point without trying all options.',
    color: C.red,
  },
]

function PatternChallenge() {
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState({})

  function guess(id, choice) {
    setAnswers(a => ({ ...a, [id]: choice }))
    setRevealed(r => ({ ...r, [id]: true }))
  }

  const score = Object.keys(answers).filter(id => answers[id] === CHALLENGES[id].answer).length

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        background: 'var(--bg-secondary)', borderRadius: 14, padding: '14px 20px',
      }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: C.indigo }}>
          {score}/{CHALLENGES.length}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          correct — for each problem, choose: Greedy or DP?
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {CHALLENGES.map(ch => {
          const userAnswer = answers[ch.id]
          const isRevealed = revealed[ch.id]
          const isCorrect = userAnswer === ch.answer

          return (
            <motion.div
              key={ch.id}
              layout
              style={{
                borderRadius: 16, overflow: 'hidden',
                border: isRevealed
                  ? `2px solid ${isCorrect ? C.green : C.red}`
                  : '2px solid var(--border)',
                background: 'var(--bg-card)',
                transition: 'border-color .3s',
              }}
            >
              <div style={{ padding: '18px 22px' }}>
                <div style={{
                  fontWeight: 700, fontSize: 16, color: 'var(--text-primary)',
                  marginBottom: 14,
                }}>
                  #{ch.id + 1}. {ch.problem}
                </div>
                {!isRevealed ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => guess(ch.id, 'greedy')}
                      style={{
                        padding: '10px 24px', borderRadius: 50, border: 'none',
                        background: C.green, color: '#fff',
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      Greedy ✅
                    </button>
                    <button
                      onClick={() => guess(ch.id, 'dp')}
                      style={{
                        padding: '10px 24px', borderRadius: 50, border: 'none',
                        background: C.blue, color: '#fff',
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      DP (not greedy) 🧮
                    </button>
                    <div style={{
                      padding: '10px 18px', borderRadius: 50,
                      background: 'var(--bg-secondary)',
                      fontSize: 13, color: C.neutral, alignSelf: 'center',
                    }}>
                      💡 {ch.hint}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '12px 18px', borderRadius: 10,
                      background: isCorrect ? '#f0fdf4' : '#fff1f2',
                      color: isCorrect ? '#166534' : '#991b1b',
                      fontSize: 14, lineHeight: 1.6, fontWeight: 600,
                    }}
                  >
                    {isCorrect ? '🎉 Correct! ' : '😅 Not quite. '}
                    {ch.explanation}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {Object.keys(revealed).length === CHALLENGES.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: 24, padding: '24px', borderRadius: 16, textAlign: 'center',
            background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
            border: '2px solid #c7d2fe',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {score === 4 ? '🏆' : score >= 2 ? '🎯' : '📚'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3730a3' }}>
            {score}/4 — {score === 4 ? 'Perfect! You think like a greedy expert!' : score >= 2 ? 'Good instincts! Review the DP ones.' : 'Keep practicing — greedy recognition takes time!'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════
export default function Topic21Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px' }}>

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #fefce8, #fff7ed)',
          border: '2px solid #fde68a',
          borderRadius: 24,
          padding: '36px 40px',
          marginBottom: 32,
          textAlign: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ fontSize: 64, marginBottom: 16 }}
        >
          🤑
        </motion.div>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 40, fontWeight: 900,
          color: 'var(--text-primary)', margin: '0 0 12px',
        }}>
          Greedy Algorithms
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Make the <strong>best choice at each step</strong> — sometimes that's enough to win.
          Sometimes it's not.
        </p>
      </motion.div>

      {/* ── Neuron intro ── */}
      <div style={{ marginBottom: 32 }}>
        <Neuron
          mood="excited"
          size="medium"
          message="Imagine you're returning change at a shop. You always pick the LARGEST coin first. That's greedy! You don't think about the future — you just grab the best option RIGHT NOW. Let's see when this wins... and when it backfires!"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Coin Change */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionBlock icon="🪙" title="The Coin Change Problem" color={C.gold}>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
        }}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14, padding: '18px 22px',
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.gold, marginBottom: 8 }}>
              The Problem
            </div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Make ₹93 using the fewest coins possible.<br />
              Available: ₹50, ₹20, ₹10, ₹5, ₹2, ₹1
            </div>
          </div>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14, padding: '18px 22px',
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.green, marginBottom: 8 }}>
              Greedy Strategy
            </div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Always pick the <strong>largest coin that fits</strong> in the remaining amount.
              Simple. Fast. Often optimal!
            </div>
          </div>
        </div>

        <NeuronTip type="example">
          ₹93 = ₹50 + ₹20 + ₹20 + ₹2 + ₹1 = <strong>5 coins</strong>. Greedy does this perfectly!
          But watch what happens with "weird" coin values below...
        </NeuronTip>

        <InteractiveDemo
          title="Coin Change — Click to Build Your Change"
          instruction="Pick coins to reach the exact target. Try both modes to see when greedy wins and when it fails!"
        >
          <CoinChangeDemo />
        </InteractiveDemo>

        <NeuronTip type="warning">
          Greedy only guarantees optimal for specific coin systems (like Indian/US currency).
          For arbitrary denominations, you MUST use Dynamic Programming!
        </NeuronTip>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Activity Selection */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionBlock icon="📅" title="Activity Selection Problem" color={C.blue}>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 14, padding: '18px 22px',
          marginBottom: 20,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.blue, marginBottom: 8 }}>
            The Setup
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            You have 8 activities, each with a start and end time. You can only do <strong>one activity at a time</strong>.
            Goal: attend the <strong>maximum number of activities</strong>.
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 12, marginBottom: 24,
          background: '#fef3c7', border: '1px solid #fde68a',
          borderRadius: 14, padding: '16px 20px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 22 }}>💡</span>
          <div>
            <strong style={{ color: '#92400e' }}>Greedy Insight:</strong>
            <span style={{ color: '#92400e', fontSize: 14, marginLeft: 6 }}>
              Always pick the activity that <strong>ends earliest</strong>. This frees up the most
              future time slots. Sort by end time, never look back!
            </span>
          </div>
        </div>

        <InteractiveDemo
          title="Activity Timeline — Select Your Schedule"
          instruction="Click activities to add them (conflicts highlighted in red). Then compare with the greedy solution!"
        >
          <ActivityDemo />
        </InteractiveDemo>

        <NeuronTip type="tip">
          This is the classic greedy proof: selecting the earliest-finishing activity leaves the
          maximum time for future activities. You can prove it's optimal by exchange argument.
        </NeuronTip>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Fractional Knapsack */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionBlock icon="🎒" title="Fractional Knapsack" color={C.teal}>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24,
        }}>
          {[
            { name: 'Gold',   weight: '10 kg', value: '₹6,000', ratio: '₹600/kg', color: C.gold,   emoji: '🥇' },
            { name: 'Silver', weight: '5 kg',  value: '₹3,000', ratio: '₹600/kg', color: C.silver, emoji: '🥈' },
            { name: 'Bronze', weight: '8 kg',  value: '₹2,400', ratio: '₹300/kg', color: C.bronze, emoji: '🥉' },
          ].map(item => (
            <div
              key={item.name}
              style={{
                background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 18px',
                border: `2px solid ${item.color}33`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
              <div style={{ fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontSize: 13, color: C.neutral }}>{item.weight} · {item.value}</div>
              <div style={{
                marginTop: 6, fontWeight: 700, fontSize: 12,
                background: item.color, color: '#fff',
                borderRadius: 50, padding: '2px 10px', display: 'inline-block',
              }}>
                {item.ratio}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 14, padding: '16px 20px', marginBottom: 20,
          color: '#166534', fontSize: 14, lineHeight: 1.7,
        }}>
          <strong>Why fractions change everything:</strong> Unlike 0/1 knapsack where you must
          take or skip an item whole, here you can take <em>half</em> of an item. This means
          greedy (by value/kg ratio) ALWAYS works — you never "waste" capacity.
        </div>

        <InteractiveDemo
          title="Fill Your Backpack (15 kg limit)"
          instruction="Drag the sliders to take a fraction of each item, or click 'Apply Greedy' to see the optimal solution!"
        >
          <KnapsackDemo />
        </InteractiveDemo>

        <NeuronTip type="warning">
          Greedy FAILS for 0/1 Knapsack (must take full items). There, you need DP because
          picking the best ratio now might block a better combination later.
        </NeuronTip>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — Huffman Coding */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionBlock icon="🌳" title="Huffman Coding — Greedy Tree Building" color={C.purple}>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 14, padding: '18px 22px',
          marginBottom: 20,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.purple, marginBottom: 8 }}>
            The Idea
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Frequent characters get <strong>shorter codes</strong>, rare ones get longer.
            Greedy builds this optimal tree by always merging the <strong>two least frequent</strong> nodes first.
            Result: minimum total bits to encode your text.
          </div>
        </div>

        <InteractiveDemo
          title="Build the Huffman Tree Step by Step"
          instruction="Click 'Next Merge' to watch the greedy algorithm build the optimal prefix code tree!"
        >
          <HuffmanDemo />
        </InteractiveDemo>

        <NeuronTip type="deep">
          Huffman coding is used in ZIP, JPEG, MP3, and HTTP compression. Every time you
          download a file faster, there's a greedy algorithm quietly saving you bandwidth!
        </NeuronTip>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — Greedy vs DP */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionBlock icon="⚔️" title="Greedy vs DP — When Does Greedy Fail?" color={C.red}>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
        }}>
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 14, padding: '18px 22px',
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.green, marginBottom: 8 }}>
              Greedy Strategy
            </div>
            <div style={{ fontSize: 14, color: '#166534', lineHeight: 1.7 }}>
              Make the locally best decision at each step. Never reconsider.
              Fast: O(n log n) sorting usually all you need.
            </div>
          </div>
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 14, padding: '18px 22px',
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.blue, marginBottom: 8 }}>
              Dynamic Programming
            </div>
            <div style={{ fontSize: 14, color: '#1e40af', lineHeight: 1.7 }}>
              Try all subproblems, remember answers. Slower O(n²) or O(n*W),
              but handles cases where greedy gets stuck.
            </div>
          </div>
        </div>

        <InteractiveDemo
          title="Compare: Same Problem, Different Outcomes"
          instruction="Switch between problems to see side-by-side when greedy works and when it falls apart."
        >
          <GreedyVsDPDemo />
        </InteractiveDemo>

      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — Pattern Recognition */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionBlock icon="🎯" title="Pattern Recognition — Greedy or DP?" color={C.indigo}>

        <Neuron
          mood="thinking"
          size="small"
          message="This is the hardest skill: RECOGNIZING when greedy applies. Read each problem, think about whether a local choice can go wrong, then decide!"
          style={{ marginBottom: 24 }}
        />

        <InteractiveDemo
          title="Greedy or DP Challenge"
          instruction="4 classic problems — click your answer to see if your instinct is right!"
        >
          <PatternChallenge />
        </InteractiveDemo>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8,
        }}>
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 14, padding: '16px 18px',
          }}>
            <div style={{ fontWeight: 800, color: C.green, fontSize: 13, marginBottom: 6 }}>
              Greedy works when:
            </div>
            {[
              'Greedy choice property holds',
              'Optimal substructure + no dependency',
              'Sorting gives a natural order',
              'Exchange argument shows no better swap',
            ].map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: '#166534', marginBottom: 4 }}>
                ✅ {t}
              </div>
            ))}
          </div>
          <div style={{
            background: '#fff1f2', border: '1px solid #fecaca',
            borderRadius: 14, padding: '16px 18px',
          }}>
            <div style={{ fontWeight: 800, color: C.red, fontSize: 13, marginBottom: 6 }}>
              Use DP when:
            </div>
            {[
              'Current choice affects future options',
              'Need to track multiple states',
              'Greedy gives wrong answer on small example',
              'Problem has overlapping subproblems',
            ].map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: '#991b1b', marginBottom: 4 }}>
                🧮 {t}
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — Hindi Summary */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी में समझें" color={C.gold}>
        <HindiExplainer
          title="Greedy Algorithms — हिंदी में"
          explanation={`Greedy (लालची) algorithm का मतलब है — हर step पर सबसे अच्छा choice लो, बिना आगे सोचे।

जैसे दुकान पर पैसे वापस करते वक्त: पहले सबसे बड़ा सिक्का दो, फिर अगला बड़ा, और इसी तरह। यही Greedy है!

यह हमेशा काम नहीं करता। अगर coins ₹1, ₹3, ₹4 हों और target ₹6 हो — Greedy ₹4+₹1+₹1=3 coins देगा, लेकिन सही जवाब ₹3+₹3=2 coins है।

Greedy तब काम करता है जब local (स्थानीय) best choice = global (वैश्विक) best result।`}
          terms={[
            { hindi: 'लालची (Greedy)', english: 'Always picking the locally best option' },
            { hindi: 'सर्वश्रेष्ठ (Optimal)', english: 'The best possible solution overall' },
            { hindi: 'स्थानीय (Local)', english: 'Best at this single step' },
            { hindi: 'वैश्विक (Global)', english: 'Best for the entire problem' },
            { hindi: 'गतिविधि चयन (Activity Selection)', english: 'Choosing max non-overlapping activities' },
            { hindi: 'आंशिक (Fractional)', english: 'Taking part of an item, not whole' },
          ]}
        />

        <Neuron
          mood="waving"
          size="medium"
          message="Greedy is like a confident person who never second-guesses. Sometimes they win big. Sometimes they walk into a trap. Your job as a programmer: KNOW which situation you're in before coding!"
          style={{ marginTop: 24 }}
        />
      </SectionBlock>

      {/* ── Summary strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: 'linear-gradient(135deg, #fefce8, #fff7ed)',
          border: '2px solid #fde68a',
          borderRadius: 20,
          padding: '32px 36px',
          marginBottom: 32,
        }}
      >
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800,
          color: 'var(--text-primary)', marginBottom: 20,
        }}>
          Greedy Algorithms — Key Takeaways
        </h3>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14,
        }}>
          {[
            { emoji: '🪙', text: 'Coin Change: greedy works for standard denominations, fails for arbitrary ones' },
            { emoji: '📅', text: 'Activity Selection: always pick earliest-ending — provably optimal' },
            { emoji: '🎒', text: 'Fractional Knapsack: greedy by ratio is perfect — fractions save you' },
            { emoji: '🌳', text: 'Huffman Coding: merge smallest frequencies → minimum-bit encoding' },
            { emoji: '⚔️', text: 'Greedy Choice Property: local best = global best? Use greedy. Else, use DP.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <span style={{ fontSize: 22, display: 'block', marginBottom: 6 }}>{item.emoji}</span>
              {item.text}
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
