import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 11 — Linked Lists
   "A chain of connected nodes — when arrays aren't flexible enough"
================================================================ */

// ─── SECTION 1: The Problem with Arrays ──────────────────────────

function ArrayShiftDemo() {
  const [insertStep, setInsertStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('array') // 'array' | 'linked'
  const timerRef = useRef(null)

  const items = ['A', 'B', 'C', 'D', 'E']
  const insertAt = 2
  const newItem = 'X'

  const startAnimation = () => {
    if (running) return
    setInsertStep(0)
    setRunning(true)
  }

  useEffect(() => {
    if (!running || insertStep < 0) return
    if (mode === 'array') {
      if (insertStep < items.length - insertAt + 1) {
        timerRef.current = setTimeout(() => setInsertStep(s => s + 1), 600)
      } else {
        setRunning(false)
      }
    } else {
      if (insertStep < 3) {
        timerRef.current = setTimeout(() => setInsertStep(s => s + 1), 700)
      } else {
        setRunning(false)
      }
    }
    return () => clearTimeout(timerRef.current)
  }, [running, insertStep, mode])

  const resetDemo = () => {
    clearTimeout(timerRef.current)
    setInsertStep(-1)
    setRunning(false)
  }

  const shiftCount = insertStep > 0 ? Math.min(insertStep, items.length - insertAt) : 0

  return (
    <div>
      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, justifyContent: 'center' }}>
        {['array', 'linked'].map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); resetDemo() }}
            style={{
              padding: '10px 28px',
              borderRadius: 30,
              border: '2px solid',
              borderColor: mode === m ? 'var(--accent)' : 'var(--border)',
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              transition: 'all 0.25s',
            }}
          >
            {m === 'array' ? '📦 Array' : '🔗 Linked List'}
          </button>
        ))}
      </div>

      {mode === 'array' ? (
        <div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 20, fontSize: 15 }}>
            Inserting <strong style={{ color: 'var(--accent)' }}>X</strong> at position 2 — watch everything shift!
          </p>

          {/* Array visualization */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 24, flexWrap: 'wrap' }}>
            {items.map((item, i) => {
              const isShifting = insertStep > 0 && i >= insertAt
              const shiftAmount = isShifting ? Math.min(insertStep - (i - insertAt), 1) * 64 : 0
              return (
                <motion.div
                  key={i}
                  animate={{ x: shiftAmount > 0 ? 64 : 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut', delay: isShifting ? (i - insertAt) * 0.12 : 0 }}
                  style={{
                    width: 56, height: 56,
                    border: '2px solid',
                    borderColor: i === insertAt - 1 ? '#f59e0b' : 'var(--border)',
                    background: isShifting ? '#fef3c7' : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18,
                    color: isShifting ? '#92400e' : 'var(--text-primary)',
                    position: 'relative',
                    borderRadius: 10,
                    margin: '0 2px',
                  }}
                >
                  {item}
                  {isShifting && insertStep > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        position: 'absolute', top: -22, fontSize: 12,
                        color: '#f59e0b', fontWeight: 700,
                      }}
                    >
                      →
                    </motion.div>
                  )}
                </motion.div>
              )
            })}

            {/* New element slides in */}
            <AnimatePresence>
              {insertStep >= items.length - insertAt + 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: -100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  style={{
                    position: 'absolute',
                    width: 56, height: 56,
                    background: 'var(--accent)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18, color: '#fff',
                  }}
                >
                  X
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Operation count */}
          <motion.div
            animate={{ opacity: insertStep > 0 ? 1 : 0 }}
            style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 14, padding: '14px 20px', textAlign: 'center',
              color: '#991b1b', fontWeight: 700, fontSize: 15,
            }}
          >
            Shifted {shiftCount} element{shiftCount !== 1 ? 's' : ''} — O(n) shifts needed!
          </motion.div>
        </div>
      ) : (
        <div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 20, fontSize: 15 }}>
            Inserting <strong style={{ color: 'var(--accent)' }}>X</strong> at position 2 — only redirect 2 arrows!
          </p>

          {/* Linked list visualization */}
          <LinkedListInsertDemo step={insertStep} />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={startAnimation}
          disabled={running}
          style={{
            padding: '12px 32px', borderRadius: 30,
            background: running ? 'var(--bg-secondary)' : 'var(--accent)',
            color: running ? 'var(--text-secondary)' : '#fff',
            border: 'none', fontWeight: 700, fontSize: 15, cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running ? '▶ Running…' : insertStep >= 0 ? '▶ Replay' : `▶ Insert X at Position 2`}
        </motion.button>
        {insertStep >= 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={resetDemo}
            style={{
              padding: '12px 24px', borderRadius: 30,
              background: 'transparent', color: 'var(--text-secondary)',
              border: '2px solid var(--border)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Reset
          </motion.button>
        )}
      </div>

      {/* Comparison table */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 16, marginTop: 28,
      }}>
        {[
          { label: 'Array Insert', count: 'O(n) shifts', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '😰' },
          { label: 'Linked List Insert', count: 'O(1) pointer changes', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', icon: '😎' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg, border: `1px solid ${stat.border}`,
            borderRadius: 16, padding: '16px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: 13, color: stat.color, fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LinkedListInsertDemo({ step }) {
  const nodes = ['A', 'B', 'C', 'D']
  const colors = {
    normal: { bg: 'var(--bg-card)', border: 'var(--border)', text: 'var(--text-primary)' },
    active: { bg: '#ede9fe', border: '#7c3aed', text: '#4c1d95' },
    new: { bg: '#d1fae5', border: '#059669', text: '#065f46' },
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, minWidth: 400 }}>
        {/* HEAD label */}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginRight: 8, whiteSpace: 'nowrap' }}>
          HEAD
        </div>
        <div style={{ fontSize: 18, marginRight: 4 }}>→</div>

        {nodes.map((node, i) => {
          const isB = i === 1
          const isC = i === 2
          const c = step > 0 && (isB || isC) ? colors.active : colors.normal
          const showNewNode = step >= 2 && i === 1

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Node box */}
              <motion.div
                animate={{ borderColor: c.border, background: c.bg }}
                style={{
                  border: `2px solid ${c.border}`, background: c.bg,
                  borderRadius: 12, overflow: 'hidden',
                  display: 'flex', alignItems: 'stretch',
                  boxShadow: step > 0 && (isB || isC) ? '0 4px 16px #7c3aed22' : 'none',
                }}
              >
                <div style={{
                  padding: '10px 14px', fontWeight: 800, fontSize: 18,
                  color: c.text, borderRight: `1px solid ${c.border}`,
                }}>
                  {node}
                </div>
                <div style={{
                  padding: '10px 10px', fontSize: 11,
                  color: c.text, display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  next<span style={{ fontSize: 14 }}>→</span>
                </div>
              </motion.div>

              {/* Arrow between nodes */}
              {i < nodes.length - 1 && (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {/* Original arrow — hidden when new node inserted after B */}
                  <motion.div
                    animate={{
                      opacity: step >= 2 && isB ? 0 : 1,
                      scaleX: step >= 2 && isB ? 0 : 1,
                    }}
                    style={{ fontSize: 20, color: 'var(--text-secondary)', padding: '0 4px' }}
                  >
                    →
                  </motion.div>

                  {/* New node appears between B and C */}
                  <AnimatePresence>
                    {step >= 2 && isB && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 0,
                          position: 'absolute', top: 0, left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 10,
                        }}
                      >
                        <div style={{ fontSize: 16, color: '#059669', padding: '0 2px' }}>→</div>
                        <div style={{
                          border: '2px solid #059669', background: '#d1fae5',
                          borderRadius: 12, overflow: 'hidden',
                          display: 'flex', alignItems: 'stretch',
                        }}>
                          <div style={{
                            padding: '10px 14px', fontWeight: 800, fontSize: 18,
                            color: '#065f46', borderRight: '1px solid #059669',
                          }}>
                            X
                          </div>
                          <div style={{
                            padding: '10px 10px', fontSize: 11,
                            color: '#065f46', display: 'flex', alignItems: 'center', gap: 2,
                          }}>
                            next→
                          </div>
                        </div>
                        <div style={{ fontSize: 16, color: '#059669', padding: '0 2px' }}>→</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )
        })}

        {/* NULL terminator */}
        <div style={{
          marginLeft: 4, padding: '8px 12px',
          background: 'var(--bg-secondary)', borderRadius: 8,
          fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
        }}>
          NULL
        </div>
      </div>

      {/* Step labels */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {step === 0 && <div style={{ color: '#7c3aed', fontWeight: 600, fontSize: 14 }}>Finding the insert position...</div>}
        {step === 1 && <div style={{ color: '#7c3aed', fontWeight: 600, fontSize: 14 }}>Found node B — preparing to insert after it</div>}
        {step >= 2 && (
          <div style={{ color: '#059669', fontWeight: 600, fontSize: 14 }}>
            Done! Just changed 2 pointers. No shifting. O(1)!
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SECTION 2: Linked List Visualizer ───────────────────────────

function LinkedListVisualizer() {
  const [nodes, setNodes] = useState(['42', '17', '8', '95'])
  const [inputVal, setInputVal] = useState('')
  const [inputPos, setInputPos] = useState('')
  const [traversalIdx, setTraversalIdx] = useState(-1)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [message, setMessage] = useState('')
  const [animating, setAnimating] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState(-1)
  const [recentlyRemoved, setRecentlyRemoved] = useState(-1)
  const [searchVal, setSearchVal] = useState('')

  const delay = (ms) => new Promise(r => setTimeout(r, ms))

  const showMsg = (msg, duration = 2500) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }

  const addToHead = async () => {
    if (!inputVal || animating) return
    setAnimating(true)
    setNodes(prev => [inputVal, ...prev])
    setRecentlyAdded(0)
    setTimeout(() => setRecentlyAdded(-1), 900)
    showMsg(`Added "${inputVal}" to head — O(1) ⚡`)
    setInputVal('')
    setAnimating(false)
  }

  const addToTail = async () => {
    if (!inputVal || animating) return
    setAnimating(true)
    // Traverse animation
    for (let i = 0; i < nodes.length; i++) {
      setTraversalIdx(i)
      await delay(350)
    }
    setTraversalIdx(-1)
    setNodes(prev => [...prev, inputVal])
    setRecentlyAdded(nodes.length)
    setTimeout(() => setRecentlyAdded(-1), 900)
    showMsg(`Traversed ${nodes.length} nodes to reach tail — O(n)`)
    setInputVal('')
    setAnimating(false)
  }

  const insertAtPos = async () => {
    const pos = parseInt(inputPos)
    if (!inputVal || isNaN(pos) || pos < 0 || pos > nodes.length || animating) {
      showMsg('Enter valid value and position (0 to ' + nodes.length + ')')
      return
    }
    setAnimating(true)
    for (let i = 0; i < pos; i++) {
      setTraversalIdx(i)
      await delay(350)
    }
    setTraversalIdx(-1)
    setNodes(prev => {
      const copy = [...prev]
      copy.splice(pos, 0, inputVal)
      return copy
    })
    setRecentlyAdded(pos)
    setTimeout(() => setRecentlyAdded(-1), 900)
    showMsg(`Inserted "${inputVal}" at position ${pos}`)
    setInputVal('')
    setInputPos('')
    setAnimating(false)
  }

  const deleteAtPos = async () => {
    const pos = parseInt(inputPos)
    if (isNaN(pos) || pos < 0 || pos >= nodes.length || animating) {
      showMsg('Enter valid position (0 to ' + (nodes.length - 1) + ')')
      return
    }
    setAnimating(true)
    for (let i = 0; i <= pos; i++) {
      setTraversalIdx(i)
      await delay(350)
    }
    setTraversalIdx(-1)
    setRecentlyRemoved(pos)
    await delay(500)
    setRecentlyRemoved(-1)
    setNodes(prev => prev.filter((_, i) => i !== pos))
    showMsg(`Deleted node at position ${pos} — arrows reconnected`)
    setInputPos('')
    setAnimating(false)
  }

  const searchNode = async () => {
    if (!searchVal || animating) return
    setAnimating(true)
    let found = false
    for (let i = 0; i < nodes.length; i++) {
      setTraversalIdx(i)
      await delay(400)
      if (nodes[i] === searchVal) {
        setHighlightIdx(i)
        showMsg(`Found "${searchVal}" at index ${i}! ✅`, 3000)
        found = true
        break
      }
    }
    if (!found) showMsg(`"${searchVal}" not found in list ❌`, 3000)
    setTraversalIdx(-1)
    setTimeout(() => setHighlightIdx(-1), 3000)
    setAnimating(false)
  }

  const btnStyle = (color = 'var(--accent)') => ({
    padding: '9px 18px', borderRadius: 20,
    background: color, color: '#fff',
    border: 'none', fontWeight: 700, fontSize: 13,
    cursor: animating ? 'not-allowed' : 'pointer',
    opacity: animating ? 0.6 : 1,
    transition: 'all 0.2s',
  })

  return (
    <div>
      {/* The List */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 18,
        padding: '24px 16px', marginBottom: 20,
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>
          {/* HEAD pointer */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 12,
          }}>
            <div style={{
              background: 'var(--accent)', color: '#fff',
              fontSize: 11, fontWeight: 800, padding: '4px 10px',
              borderRadius: 6, marginBottom: 6,
            }}>
              HEAD
            </div>
            <div style={{ fontSize: 20, color: 'var(--accent)' }}>↓</div>
          </div>

          {nodes.length === 0 ? (
            <div style={{
              padding: '20px 32px', borderRadius: 14,
              border: '2px dashed var(--border)',
              color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600,
            }}>
              Empty list — add a node!
            </div>
          ) : (
            nodes.map((node, i) => (
              <div key={i + node} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Node */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: recentlyRemoved === i ? 0 : 1,
                    opacity: recentlyRemoved === i ? 0 : 1,
                    y: 0,
                  }}
                  style={{
                    display: 'flex', alignItems: 'stretch',
                    borderRadius: 14, overflow: 'hidden',
                    border: '2px solid',
                    borderColor: highlightIdx === i ? '#10b981' :
                      traversalIdx === i ? 'var(--accent)' :
                      recentlyAdded === i ? '#f59e0b' : 'var(--border)',
                    background: highlightIdx === i ? '#d1fae5' :
                      traversalIdx === i ? '#ede9fe' :
                      recentlyAdded === i ? '#fef3c7' : 'var(--bg-card)',
                    boxShadow: traversalIdx === i ? '0 0 20px #7c3aed44' : 'none',
                    transition: 'all 0.3s',
                    minWidth: 80,
                  }}
                >
                  {/* Data section */}
                  <div style={{
                    padding: '12px 16px',
                    fontWeight: 800, fontSize: 17,
                    color: 'var(--text-primary)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2,
                  }}>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 2 }}>data</div>
                    {node}
                  </div>
                  {/* Next pointer section */}
                  <div style={{
                    padding: '12px 10px',
                    fontSize: 11, color: 'var(--text-secondary)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 2 }}>next</div>
                    <div style={{ fontSize: 16, color: i < nodes.length - 1 ? 'var(--accent)' : '#ef4444' }}>
                      {i < nodes.length - 1 ? '→' : '∅'}
                    </div>
                  </div>
                </motion.div>

                {/* Arrow between nodes */}
                {i < nodes.length - 1 && (
                  <motion.div
                    animate={{ color: traversalIdx === i ? 'var(--accent)' : 'var(--text-secondary)' }}
                    style={{ fontSize: 22, padding: '0 6px', display: 'flex', alignItems: 'center' }}
                  >
                    →
                  </motion.div>
                )}
              </div>
            ))
          )}

          {/* NULL */}
          {nodes.length > 0 && (
            <div style={{
              marginLeft: 6, padding: '10px 14px',
              background: '#fef2f2', borderRadius: 10,
              fontSize: 12, fontWeight: 700, color: '#ef4444',
              border: '1px solid #fecaca',
            }}>
              NULL
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 20, marginTop: 16, paddingTop: 14,
          borderTop: '1px solid var(--border)', flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Size:</strong> {nodes.length}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Head:</strong> {nodes[0] || 'null'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Tail:</strong> {nodes[nodes.length - 1] || 'null'}
          </div>
          {traversalIdx >= 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ fontSize: 13, color: '#7c3aed', fontWeight: 700 }}
            >
              Visiting node {traversalIdx}...
            </motion.div>
          )}
        </div>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: '#ede9fe', border: '1px solid #7c3aed33',
              borderRadius: 12, padding: '12px 20px', marginBottom: 16,
              color: '#4c1d95', fontWeight: 600, fontSize: 15, textAlign: 'center',
            }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {/* Add to Head/Tail */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>Add Node</div>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addToHead()}
            placeholder="Node value..."
            style={{
              width: '100%', padding: '9px 14px',
              borderRadius: 10, border: '1.5px solid var(--border)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              fontSize: 14, marginBottom: 10, boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={addToHead} style={btnStyle('#7c3aed')}>
              + Head O(1)
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={addToTail} style={btnStyle('#f59e0b')}>
              + Tail O(n)
            </motion.button>
          </div>
        </div>

        {/* Insert/Delete at position */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>Insert / Delete at Position</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Value"
              style={{
                flex: 1, padding: '9px 14px',
                borderRadius: 10, border: '1.5px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontSize: 14,
              }}
            />
            <input
              value={inputPos}
              onChange={e => setInputPos(e.target.value)}
              placeholder="Pos"
              style={{
                width: 60, padding: '9px 10px',
                borderRadius: 10, border: '1.5px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontSize: 14,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={insertAtPos} style={btnStyle('#10b981')}>
              Insert
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={deleteAtPos} style={btnStyle('#ef4444')}>
              Delete
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>Search O(n)</div>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchNode()}
            placeholder="Search value..."
            style={{
              width: '100%', padding: '9px 14px',
              borderRadius: 10, border: '1.5px solid var(--border)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              fontSize: 14, marginBottom: 10, boxSizing: 'border-box',
            }}
          />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={searchNode} style={{ ...btnStyle('#0ea5e9'), width: '100%' }}>
            Search (watch traversal!)
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// ─── SECTION 3: Singly vs Doubly ─────────────────────────────────

function SinglyVsDoubly() {
  const [activeTab, setActiveTab] = useState('singly')
  const [traverseDir, setTraverseDir] = useState(null)
  const [blocked, setBlocked] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(2)

  const nodes = ['A', 'B', 'C', 'D', 'E']
  const animRef = useRef(null)

  const go = async (dir) => {
    if (animRef.current) return
    if (activeTab === 'singly' && dir === 'back') {
      setBlocked(true)
      setTimeout(() => setBlocked(false), 2000)
      return
    }
    setTraverseDir(dir)
    let idx = currentIdx
    for (let step = 0; step < 2; step++) {
      const next = dir === 'forward' ? idx + 1 : idx - 1
      if (next < 0 || next >= nodes.length) break
      idx = next
      setCurrentIdx(idx)
      await new Promise(r => setTimeout(r, 500))
    }
    setTraverseDir(null)
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {[
          { id: 'singly', label: 'Singly Linked', icon: '→', desc: 'One direction only' },
          { id: 'doubly', label: 'Doubly Linked', icon: '↔', desc: 'Both directions' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCurrentIdx(2); setBlocked(false) }}
            style={{
              flex: 1, padding: '14px 20px',
              background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15,
              transition: 'all 0.25s',
            }}
          >
            <span style={{ fontSize: 18, marginRight: 8 }}>{tab.icon}</span>
            {tab.label}
            <div style={{
              fontSize: 12, fontWeight: 400, marginTop: 2,
              opacity: activeTab === tab.id ? 0.85 : 0.6,
            }}>
              {tab.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Node chain */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 18,
        padding: 24, marginBottom: 20, overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, minWidth: 'max-content' }}>
          {nodes.map((node, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <motion.div
                animate={{
                  background: i === currentIdx ? 'var(--accent)' : 'var(--bg-card)',
                  borderColor: i === currentIdx ? 'var(--accent)' : 'var(--border)',
                  scale: i === currentIdx ? 1.1 : 1,
                }}
                style={{
                  border: '2px solid var(--border)',
                  borderRadius: 50, width: 64, height: 64,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexDirection: 'column',
                  fontWeight: 800, fontSize: 20,
                  color: i === currentIdx ? '#fff' : 'var(--text-primary)',
                  position: 'relative', transition: 'all 0.3s',
                }}
              >
                {node}
                {i === currentIdx && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: 'absolute', bottom: -22, fontSize: 10,
                      fontWeight: 800, color: 'var(--accent)',
                      background: 'var(--bg-card)', padding: '2px 6px',
                      borderRadius: 6, border: '1px solid var(--accent)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    HERE
                  </motion.div>
                )}
              </motion.div>

              {i < nodes.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 6px' }}>
                  {/* Forward arrow */}
                  <motion.div
                    animate={{ color: i === currentIdx && traverseDir === 'forward' ? '#10b981' : 'var(--text-secondary)' }}
                    style={{ fontSize: 20, lineHeight: 1.2 }}
                  >
                    →
                  </motion.div>
                  {/* Back arrow — only for doubly */}
                  {activeTab === 'doubly' && (
                    <motion.div
                      animate={{ color: i + 1 === currentIdx && traverseDir === 'back' ? '#f59e0b' : 'var(--text-secondary)' }}
                      style={{ fontSize: 20, lineHeight: 1.2 }}
                    >
                      ←
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => go('back')}
          disabled={currentIdx === 0}
          style={{
            padding: '12px 28px', borderRadius: 30,
            background: activeTab === 'doubly' ? '#f59e0b' : '#e5e7eb',
            color: activeTab === 'doubly' ? '#fff' : '#9ca3af',
            border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          ← Go Backward
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => go('forward')}
          disabled={currentIdx === nodes.length - 1}
          style={{
            padding: '12px 28px', borderRadius: 30,
            background: '#10b981', color: '#fff',
            border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          Go Forward →
        </motion.button>
      </div>

      {/* Blocked message */}
      <AnimatePresence>
        {blocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              background: '#fef2f2', border: '2px solid #ef4444',
              borderRadius: 16, padding: '16px 24px',
              textAlign: 'center', color: '#991b1b',
              fontWeight: 700, fontSize: 16, marginBottom: 16,
            }}
          >
            Can't go back! Singly linked list only has forward pointers.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory comparison */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
        marginTop: 8,
      }}>
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#1e40af', marginBottom: 8 }}>Singly</div>
          <div style={{ fontSize: 14, color: '#1e40af' }}>Each node: data + 1 pointer</div>
          <div style={{ fontSize: 13, color: '#3b82f6', marginTop: 6 }}>Memory per node: ~8 + 8 = 16 bytes</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#1e40af' }}>Traversal: forward only</div>
        </div>
        <div style={{
          background: '#fef3c7', border: '1px solid #fde68a',
          borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#92400e', marginBottom: 8 }}>Doubly</div>
          <div style={{ fontSize: 14, color: '#92400e' }}>Each node: data + 2 pointers</div>
          <div style={{ fontSize: 13, color: '#d97706', marginTop: 6 }}>Memory per node: ~8 + 16 = 24 bytes (1.5×)</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#92400e' }}>Traversal: forward & backward</div>
        </div>
      </div>
    </div>
  )
}

// ─── SECTION 4: Array vs Linked List Showdown ────────────────────

const comparisonRows = [
  {
    op: 'Access by Index',
    array: { complexity: 'O(1)', good: true, desc: 'Direct memory offset calculation' },
    linked: { complexity: 'O(n)', good: false, desc: 'Must traverse from head each time' },
    animation: 'access',
  },
  {
    op: 'Insert at Beginning',
    array: { complexity: 'O(n)', good: false, desc: 'Shift all elements right' },
    linked: { complexity: 'O(1)', good: true, desc: 'Just update head pointer' },
    animation: 'insert-head',
  },
  {
    op: 'Insert at End',
    array: { complexity: 'O(1) amortized', good: true, desc: 'Append to last slot' },
    linked: { complexity: 'O(n) / O(1)*', good: null, desc: '*O(1) with tail pointer' },
    animation: 'insert-tail',
  },
  {
    op: 'Delete from Middle',
    array: { complexity: 'O(n)', good: false, desc: 'Shift elements to fill gap' },
    linked: { complexity: 'O(1) if node known', good: true, desc: 'Just bypass the node' },
    animation: 'delete',
  },
  {
    op: 'Memory Layout',
    array: { complexity: 'Contiguous', good: true, desc: 'Cache-friendly, no overhead' },
    linked: { complexity: 'Scattered', good: false, desc: 'Pointer overhead per node' },
    animation: 'memory',
  },
]

function ShowdownRow({ row, active, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: 12, padding: '14px 18px',
        borderRadius: 14, cursor: 'pointer',
        background: active ? '#f5f3ff' : 'var(--bg-card)',
        border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        marginBottom: 10, transition: 'all 0.2s',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
        {row.op}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', padding: '6px 14px', borderRadius: 20,
          background: row.array.good === true ? '#d1fae5' : row.array.good === false ? '#fee2e2' : '#fef3c7',
          color: row.array.good === true ? '#065f46' : row.array.good === false ? '#991b1b' : '#92400e',
          fontWeight: 800, fontSize: 14,
        }}>
          {row.array.good === true ? '✅ ' : row.array.good === false ? '❌ ' : '⚠️ '}{row.array.complexity}
        </div>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            {row.array.desc}
          </motion.div>
        )}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', padding: '6px 14px', borderRadius: 20,
          background: row.linked.good === true ? '#d1fae5' : row.linked.good === false ? '#fee2e2' : '#fef3c7',
          color: row.linked.good === true ? '#065f46' : row.linked.good === false ? '#991b1b' : '#92400e',
          fontWeight: 800, fontSize: 14,
        }}>
          {row.linked.good === true ? '✅ ' : row.linked.good === false ? '❌ ' : '⚠️ '}{row.linked.complexity}
        </div>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            {row.linked.desc}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function Showdown() {
  const [activeRow, setActiveRow] = useState(null)

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: 12, padding: '0 18px 12px',
        borderBottom: '2px solid var(--border)', marginBottom: 12,
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Operation</div>
        <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>📦 Array</div>
        <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>🔗 Linked List</div>
      </div>

      {comparisonRows.map((row, i) => (
        <ShowdownRow
          key={i} row={row}
          active={activeRow === i}
          onClick={() => setActiveRow(activeRow === i ? null : i)}
        />
      ))}

      <div style={{
        background: '#eff6ff', borderRadius: 14, padding: 16, marginTop: 8,
        fontSize: 14, color: '#1e40af', textAlign: 'center', fontWeight: 600,
      }}>
        Click any row to see why!  The best choice depends on your use case.
      </div>
    </div>
  )
}

// ─── SECTION 5: Build a Linked List Challenge ────────────────────

const CHALLENGE_STEPS = [
  { instruction: 'Create the head node with value "10"', action: 'create-head', hint: 'Click "Create Head" to start!' },
  { instruction: 'Add node "20" to the tail', action: 'add-tail-20', hint: 'Use "Add to Tail" button with value 20' },
  { instruction: 'Add node "30" to the tail', action: 'add-tail-30', hint: 'Add value 30 to tail' },
  { instruction: 'Insert "15" at position 1', action: 'insert-1-15', hint: 'Insert 15 between 10 and 20' },
  { instruction: 'Delete the node at position 3', action: 'delete-3', hint: 'Delete position 3 (the 30)' },
]

function BuildChallenge() {
  const [step, setStep] = useState(0)
  const [nodes, setNodes] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [inputPos, setInputPos] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('') // 'success' | 'error'
  const [done, setDone] = useState(false)

  const success = (msg) => {
    setFeedback(msg)
    setFeedbackType('success')
    setTimeout(() => setFeedback(''), 2000)
  }
  const error = (msg) => {
    setFeedback(msg)
    setFeedbackType('error')
    setTimeout(() => setFeedback(''), 2000)
  }

  const tryAction = (action) => {
    const current = CHALLENGE_STEPS[step]

    if (action === 'create-head') {
      if (current.action !== 'create-head') { error('Wrong step! ' + current.instruction); return }
      if (inputVal !== '10') { error('Use value "10" for the head!'); return }
      setNodes(['10'])
      success('Head node "10" created!')
      advance()
    } else if (action === 'add-tail') {
      if (current.action === 'add-tail-20') {
        if (inputVal !== '20') { error('Add "20" to tail next!'); return }
        setNodes(prev => [...prev, '20'])
        success('Node "20" added to tail!')
        advance()
      } else if (current.action === 'add-tail-30') {
        if (inputVal !== '30') { error('Add "30" to tail now!'); return }
        setNodes(prev => [...prev, '30'])
        success('Node "30" added to tail!')
        advance()
      } else {
        error('That\'s not the right step! ' + current.instruction)
      }
    } else if (action === 'insert') {
      if (current.action !== 'insert-1-15') { error('Wrong step! ' + current.instruction); return }
      if (inputVal !== '15' || inputPos !== '1') { error('Insert "15" at position 1!'); return }
      setNodes(prev => {
        const copy = [...prev]
        copy.splice(1, 0, '15')
        return copy
      })
      success('Inserted "15" at position 1!')
      advance()
    } else if (action === 'delete') {
      if (current.action !== 'delete-3') { error('Wrong step! ' + current.instruction); return }
      if (inputPos !== '3') { error('Delete position 3!'); return }
      setNodes(prev => prev.filter((_, i) => i !== 3))
      success('Deleted position 3!')
      advance()
    }
  }

  const advance = () => {
    if (step + 1 >= CHALLENGE_STEPS.length) {
      setTimeout(() => setDone(true), 600)
    } else {
      setStep(s => s + 1)
    }
    setInputVal('')
    setInputPos('')
  }

  const reset = () => {
    setStep(0)
    setNodes([])
    setInputVal('')
    setInputPos('')
    setFeedback('')
    setDone(false)
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {CHALLENGE_STEPS.map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <motion.div
              animate={{
                background: i < step ? '#10b981' : i === step ? 'var(--accent)' : 'var(--border)',
              }}
              style={{ height: 6, borderRadius: 3, marginBottom: 4 }}
            />
            <div style={{
              fontSize: 10, textAlign: 'center',
              color: i <= step ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: i === step ? 700 : 400,
            }}>
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {!done ? (
        <>
          {/* Current step */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: '#ede9fe', border: '2px solid #7c3aed',
              borderRadius: 16, padding: '16px 20px', marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Step {step + 1} of {CHALLENGE_STEPS.length}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#4c1d95' }}>
              {CHALLENGE_STEPS[step].instruction}
            </div>
            <div style={{ fontSize: 13, color: '#6d28d9', marginTop: 6 }}>
              Hint: {CHALLENGE_STEPS[step].hint}
            </div>
          </motion.div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: feedbackType === 'success' ? '#d1fae5' : '#fef2f2',
                  border: `1px solid ${feedbackType === 'success' ? '#6ee7b7' : '#fecaca'}`,
                  borderRadius: 12, padding: '12px 18px', marginBottom: 16,
                  color: feedbackType === 'success' ? '#065f46' : '#991b1b',
                  fontWeight: 700, fontSize: 15, textAlign: 'center',
                }}
              >
                {feedbackType === 'success' ? '✅ ' : '❌ '}{feedback}
              </motion.div>
            )}
          </AnimatePresence>

          {/* List visualization */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14,
            padding: 16, marginBottom: 20, minHeight: 60,
            display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto',
          }}>
            {nodes.length === 0 ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>List is empty — start building!</span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginRight: 8 }}>HEAD→</div>
                {nodes.map((n, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        border: '2px solid var(--accent)',
                        borderRadius: 10, padding: '10px 16px',
                        fontWeight: 800, fontSize: 17,
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {n}
                    </motion.div>
                    {i < nodes.length - 1 && <div style={{ fontSize: 20, padding: '0 6px', color: 'var(--text-secondary)' }}>→</div>}
                  </div>
                ))}
                <div style={{ marginLeft: 8, fontSize: 13, fontWeight: 700, color: '#ef4444' }}>→NULL</div>
              </div>
            )}
          </div>

          {/* Inputs + action buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Value"
              style={{
                flex: 1, minWidth: 80, padding: '10px 14px',
                borderRadius: 10, border: '1.5px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontSize: 14,
              }}
            />
            <input
              value={inputPos}
              onChange={e => setInputPos(e.target.value)}
              placeholder="Position"
              style={{
                width: 80, padding: '10px 14px',
                borderRadius: 10, border: '1.5px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontSize: 14,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Create Head', action: 'create-head', color: '#7c3aed' },
              { label: '+ Add to Tail', action: 'add-tail', color: '#f59e0b' },
              { label: 'Insert at Pos', action: 'insert', color: '#10b981' },
              { label: 'Delete at Pos', action: 'delete', color: '#ef4444' },
            ].map(btn => (
              <motion.button
                key={btn.action}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => tryAction(btn.action)}
                style={{
                  padding: '10px 18px', borderRadius: 20,
                  background: btn.color, color: '#fff',
                  border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                {btn.label}
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            border: '2px solid #10b981', borderRadius: 20,
            padding: '32px 28px', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: '#065f46', marginBottom: 8 }}>
            Challenge Complete!
          </div>
          <div style={{ fontSize: 16, color: '#047857', marginBottom: 24, lineHeight: 1.7 }}>
            You built a linked list from scratch!<br />
            Final list: 10 → 15 → 20 → NULL
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, background: 'white', borderRadius: 14,
            padding: '12px 20px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>HEAD→</div>
            {['10', '15', '20'].map((n, i, arr) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  border: '2px solid #10b981', borderRadius: 10,
                  padding: '8px 14px', fontWeight: 800, fontSize: 17, color: '#065f46',
                }}>
                  {n}
                </div>
                {i < arr.length - 1 && <div style={{ fontSize: 18, padding: '0 4px', color: '#10b981' }}>→</div>}
              </div>
            ))}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>→NULL</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={reset}
            style={{
              padding: '12px 32px', borderRadius: 30,
              background: '#10b981', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}
          >
            Try Again
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

// ─── SECTION 6: Real Life Examples ───────────────────────────────

const realLifeExamples = [
  {
    title: 'Music Playlist',
    icon: '🎵',
    type: 'Doubly Linked',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    desc: 'Each song knows the next and previous song. Skip forward or back instantly!',
    demo: ['Song 1', 'Song 2', 'Song 3', 'Song 4'],
    arrows: '↔',
  },
  {
    title: 'Undo History',
    icon: '↩️',
    type: 'Singly Linked',
    color: '#0ea5e9',
    bg: '#eff6ff',
    border: '#bae6fd',
    desc: 'Each action stores previous state. Ctrl+Z walks backward through history.',
    demo: ['State A', 'State B', 'State C', 'Current'],
    arrows: '→',
  },
  {
    title: 'Image Viewer',
    icon: '🖼️',
    type: 'Doubly Linked',
    color: '#f59e0b',
    bg: '#fef3c7',
    border: '#fde68a',
    desc: 'Swipe left/right through images. Each image points to neighbors.',
    demo: ['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4'],
    arrows: '↔',
  },
  {
    title: 'Train Compartments',
    icon: '🚂',
    type: 'Singly Linked',
    color: '#10b981',
    bg: '#f0fdf4',
    border: '#a7f3d0',
    desc: 'Each compartment is coupled to the next. Detach one — reattach easily!',
    demo: ['Engine', 'Car 1', 'Car 2', 'Car 3'],
    arrows: '→',
  },
  {
    title: 'Browser Tabs',
    icon: '🌐',
    type: 'Doubly Linked',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    desc: 'Navigate tab history with back/forward. Each tab links to prev and next.',
    demo: ['Home', 'Search', 'Article', 'Settings'],
    arrows: '↔',
  },
]

function RealLifeCards() {
  const [active, setActive] = useState(0)
  const [currentItem, setCurrentItem] = useState(1)

  const ex = realLifeExamples[active]

  return (
    <div>
      {/* Card selector */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {realLifeExamples.map((e, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setActive(i); setCurrentItem(1) }}
            style={{
              padding: '10px 18px', borderRadius: 30,
              background: active === i ? ex.color : 'var(--bg-card)',
              color: active === i ? '#fff' : 'var(--text-secondary)',
              border: `2px solid ${active === i ? ex.color : 'var(--border)'}`,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.25s',
            }}
          >
            {e.icon} {e.title}
          </motion.button>
        ))}
      </div>

      {/* Active example */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          style={{
            background: ex.bg, border: `2px solid ${ex.border}`,
            borderRadius: 20, padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 36 }}>{ex.icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: ex.color }}>{ex.title}</div>
              <div style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                background: ex.color + '22', color: ex.color,
                fontSize: 12, fontWeight: 700, marginTop: 4,
              }}>
                {ex.type}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>
            {ex.desc}
          </p>

          {/* Mini chain visualization */}
          <div style={{
            background: 'white', borderRadius: 14,
            padding: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 4, overflowX: 'auto',
          }}>
            {ex.demo.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  animate={{
                    scale: i === currentItem ? 1.12 : 1,
                    background: i === currentItem ? ex.color : '#f9fafb',
                    color: i === currentItem ? '#fff' : '#374151',
                    borderColor: ex.color,
                  }}
                  style={{
                    border: `2px solid ${ex.color}66`,
                    borderRadius: 10, padding: '8px 14px',
                    fontWeight: 700, fontSize: 14,
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item}
                </motion.div>
                {i < ex.demo.length - 1 && (
                  <div style={{ fontSize: 16, color: ex.color, padding: '0 4px', fontWeight: 800 }}>
                    {ex.arrows}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigate buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            {ex.arrows === '↔' && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentItem(p => Math.max(0, p - 1))}
                disabled={currentItem === 0}
                style={{
                  padding: '9px 20px', borderRadius: 20,
                  background: currentItem > 0 ? ex.color : '#e5e7eb',
                  color: currentItem > 0 ? '#fff' : '#9ca3af',
                  border: 'none', fontWeight: 700, cursor: 'pointer',
                }}
              >
                ← Previous
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentItem(p => Math.min(ex.demo.length - 1, p + 1))}
              disabled={currentItem === ex.demo.length - 1}
              style={{
                padding: '9px 20px', borderRadius: 20,
                background: currentItem < ex.demo.length - 1 ? ex.color : '#e5e7eb',
                color: currentItem < ex.demo.length - 1 ? '#fff' : '#9ca3af',
                border: 'none', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Next →
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────

export default function Topic11Content() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 60px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          borderRadius: 24, padding: '40px 36px', marginBottom: 36,
          border: '1px solid #c4b5fd', textAlign: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ fontSize: 56, marginBottom: 16 }}
        >
          🔗
        </motion.div>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 900,
          color: '#4c1d95', marginBottom: 10,
        }}>
          Linked Lists
        </h1>
        <p style={{ fontSize: 18, color: '#6d28d9', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
          A chain of connected nodes — when arrays aren't flexible enough.
          Insert anywhere. Delete anywhere. No shifting.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'O(1) insert at head', color: '#7c3aed' },
            { label: 'Dynamic size', color: '#0ea5e9' },
            { label: 'No pre-allocation', color: '#10b981' },
          ].map(tag => (
            <div key={tag.label} style={{
              padding: '6px 16px', borderRadius: 20,
              background: tag.color + '18', color: tag.color,
              fontWeight: 700, fontSize: 14,
              border: `1px solid ${tag.color}33`,
            }}>
              {tag.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Neuron intro */}
      <Neuron
        mood="excited"
        size="medium"
        message="Imagine a treasure hunt where each clue tells you where the next clue is hidden. That's a linked list! Every node holds data AND the address of the next node. No fixed location — total freedom!"
        style={{ marginBottom: 32 }}
      />

      {/* Section 1 */}
      <SectionBlock icon="📦" title="The Problem with Arrays" color="#f59e0b">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Arrays are great for random access — but inserting or deleting in the middle means
          shifting every element after it. With a linked list, just redirect two pointers!
        </p>
        <InteractiveDemo
          title="Array Shift vs Linked List Insert"
          instruction="Pick a mode and click Insert to see the difference"
        >
          <ArrayShiftDemo />
        </InteractiveDemo>
        <NeuronTip type="deep">
          Arrays store elements in <strong>contiguous memory</strong> — like reserved seats in a row.
          Linked list nodes can live <strong>anywhere in memory</strong>, connected only by pointers.
          Insertion in an array at index i costs O(n−i) shifts. Linked list? Just 2 pointer updates.
        </NeuronTip>
      </SectionBlock>

      {/* Section 2 */}
      <SectionBlock icon="⚙️" title="Linked List Visualizer" color="#7c3aed">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Watch traversal happen step-by-step. Nodes light up as the pointer walks the chain.
          See how O(1) head insertion vs O(n) tail insertion really looks.
        </p>
        <InteractiveDemo
          title="Live Linked List"
          instruction="Add, insert, delete, and search nodes — watch the traversal animations!"
        >
          <LinkedListVisualizer />
        </InteractiveDemo>
        <NeuronTip type="tip">
          The <strong>head pointer</strong> is your entry point — lose it and you lose the whole list!
          Always keep track of the head. Bonus: keeping a <strong>tail pointer</strong> makes tail insertions O(1) too.
        </NeuronTip>
      </SectionBlock>

      {/* Section 3 */}
      <SectionBlock icon="↔️" title="Singly vs Doubly Linked List" color="#0ea5e9">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Singly linked lists can only go forward. Doubly linked lists store pointers in both
          directions — more powerful, but uses extra memory per node.
        </p>
        <InteractiveDemo
          title="Direction Demo"
          instruction="Try going backward in Singly vs Doubly — see what happens!"
        >
          <SinglyVsDoubly />
        </InteractiveDemo>
        <NeuronTip type="example">
          <strong>Use Singly</strong> when you only need to traverse forward (e.g., a simple stack or queue).
          <strong> Use Doubly</strong> when you need both directions — browser history, music players, LRU cache.
        </NeuronTip>
      </SectionBlock>

      {/* Section 4 */}
      <SectionBlock icon="⚔️" title="Array vs Linked List — The Showdown" color="#ef4444">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Neither is universally better. Click each row to understand <em>why</em> and when to choose which.
        </p>
        <InteractiveDemo
          title="Operation Comparison"
          instruction="Click any row to expand the explanation"
        >
          <Showdown />
        </InteractiveDemo>
        <NeuronTip type="warning">
          Linked lists have <strong>pointer overhead</strong> — each node stores an extra 8 bytes (64-bit pointer).
          For small data (e.g., storing bytes), the pointer can be <em>larger than the data itself</em>!
          Also, arrays are cache-friendly because of contiguous memory — CPUs prefetch sequential data.
        </NeuronTip>
      </SectionBlock>

      {/* Section 5 */}
      <SectionBlock icon="🏗️" title="Build a Linked List — Challenge" color="#10b981">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Follow the steps exactly. Build a linked list operation by operation.
          Complete all 5 steps to earn your checkmark!
        </p>
        <InteractiveDemo
          title="5-Step Challenge"
          instruction="Follow each step — wrong moves show an error hint"
        >
          <BuildChallenge />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 6 */}
      <SectionBlock icon="🌍" title="Linked Lists in Real Life" color="#f59e0b">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Linked lists show up everywhere — from your music app to the undo button.
          Click each example to explore the connection!
        </p>
        <InteractiveDemo
          title="Real-World Examples"
          instruction="Click an example to see the mini visualization"
        >
          <RealLifeCards />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 7: Hindi Summary */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी सारांश" color="#ff9933">
        <Neuron
          mood="explaining"
          message="Train ke dabbe yaad karo! Har dabbe mein samaan (data) hai, aur ek hook (pointer) jo agle dabbe se joda hai. Beech mein ek naaya dabba jodna chahte ho? Sirf do hooks change karo — koi shifting nahi!"
          style={{ marginBottom: 24 }}
        />
        <HindiExplainer
          concept="लिंक्ड लिस्ट (Linked List)"
          english="A chain of connected memory nodes"
          explanation="Linked List ek chain ki tarah hoti hai jisme har node (gaanth) mein do cheezein hoti hain: pehli apna data, aur doosri agale node ka address (pointer). Array mein saare elements ek saath rakhe hote hain — linked list mein kahin bhi ho sakta hai, bas address pata hona chahiye. Beech mein kuch add karna ho — sirf do pointers badlo, koi khiskaao nahi!"
          example="Socho tumhara WhatsApp group list — har contact ke paas ek 'next contact' ka link hai. Naya contact add karo — bas do links update karo. Array hota toh sab ko khiskaana padta!"
          terms={[
            { hindi: 'लिंक्ड लिस्ट / श्रृंखला', english: 'Linked List', meaning: 'judi hui nodes ki chain' },
            { hindi: 'नोड / गांठ', english: 'Node', meaning: 'ek data unit jo pointer bhi rakhti hai' },
            { hindi: 'पॉइंटर / सूचक', english: 'Pointer', meaning: 'agale node ka memory address' },
            { hindi: 'शीर्ष / Head', english: 'Head', meaning: 'list ka pehla node — entry point' },
            { hindi: 'पुच्छ / Tail', english: 'Tail', meaning: 'list ka aakhri node — NULL tak pahunche' },
            { hindi: 'एकल / द्विगुण', english: 'Singly / Doubly', meaning: 'ek ya dono direction mein pointer' },
          ]}
        />

        <NeuronTip type="fun">
          The world's first linked list implementation was in LISP in 1958 — over 65 years ago!
          Today, your browser's back/forward history, Python's <code>collections.deque</code>,
          and Java's <code>LinkedList</code> all use this same idea.
        </NeuronTip>
      </SectionBlock>

      {/* Final Neuron */}
      <Neuron
        mood="waving"
        size="large"
        message="You now understand the CORE of linked lists — nodes, pointers, traversal, singly vs doubly, and when to use them. Next up: Stacks and Queues — they're built ON TOP of linked lists!"
        style={{ marginTop: 8 }}
      />
    </div>
  )
}
