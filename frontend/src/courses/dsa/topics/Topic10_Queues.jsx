import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 10 — Queues
   First In, First Out — the fair waiting line, the printer queue,
   the task scheduler.
================================================================ */

/* ---- SECTION 1: The Movie Ticket Line ---- */
const PEOPLE = ['🧑', '👩', '👦', '👧', '🧔', '👱', '🧓', '🧕']

function MovieTicketLine() {
  const [line, setLine] = useState([
    { id: 1, emoji: '🧑', name: 'Rahul' },
    { id: 2, emoji: '👩', name: 'Priya' },
    { id: 3, emoji: '👦', name: 'Amit' },
  ])
  const [served, setServed] = useState([])
  const [nextId, setNextId] = useState(4)
  const [flash, setFlash] = useState(null) // 'enqueue' | 'dequeue'

  const personNames = ['Sneha', 'Raj', 'Meena', 'Arjun', 'Kavya', 'Vikram', 'Pooja', 'Dev']

  const enqueue = () => {
    const name = personNames[(nextId - 1) % personNames.length]
    const emoji = PEOPLE[(nextId - 1) % PEOPLE.length]
    setLine(prev => [...prev, { id: nextId, emoji, name }])
    setNextId(n => n + 1)
    setFlash('enqueue')
    setTimeout(() => setFlash(null), 600)
  }

  const dequeue = () => {
    if (line.length === 0) return
    const person = line[0]
    setLine(prev => prev.slice(1))
    setServed(prev => [person, ...prev].slice(0, 4))
    setFlash('dequeue')
    setTimeout(() => setFlash(null), 600)
  }

  return (
    <div>
      {/* Theater entrance header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: 16, padding: '14px 24px',
          color: 'white', fontWeight: 700, fontSize: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 20px #312e8144',
        }}>
          <span style={{ fontSize: 26 }}>🎬</span>
          <span>PVR Cinemas — Ticket Counter</span>
        </div>
        <div style={{
          background: '#fef3c7', border: '2px solid #fde68a',
          borderRadius: 12, padding: '10px 20px',
          fontSize: 14, fontWeight: 700, color: '#92400e',
        }}>
          FIFO: First In, First Out
        </div>
      </div>

      {/* Queue visualization */}
      <div style={{
        background: 'linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)',
        border: '2px dashed #a5b4fc',
        borderRadius: 20,
        padding: '28px 24px',
        marginBottom: 20,
        minHeight: 140,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Labels */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: '#6366f1',
            background: '#e0e7ff', padding: '4px 12px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>🏠</span> NEW ARRIVALS JOIN HERE (REAR)
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: '#10b981',
            background: '#d1fae5', padding: '4px 12px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            SERVED FIRST (FRONT) <span>🎟️</span>
          </div>
        </div>

        {/* People in line */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', minHeight: 80, alignItems: 'center' }}>
          {line.length === 0 ? (
            <div style={{
              width: '100%', textAlign: 'center',
              color: '#94a3b8', fontSize: 15, fontStyle: 'italic',
            }}>
              Queue is empty — no one in line!
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {line.map((person, idx) => (
                  <motion.div
                    key={person.id}
                    layout
                    initial={{ opacity: 0, x: 60, scale: 0.7 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -80, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: idx === 0
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : flash === 'enqueue' && idx === line.length - 1
                          ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                          : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28,
                      boxShadow: idx === 0
                        ? '0 4px 16px #10b98144'
                        : '0 2px 8px #6366f122',
                      border: idx === 0 ? '2px solid #10b981' : '2px solid #a5b4fc',
                      transition: 'background 0.3s',
                    }}>
                      {person.emoji}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      color: idx === 0 ? '#059669' : '#6366f1',
                    }}>
                      {idx === 0 ? '← FRONT' : `#${idx + 1}`}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{person.name}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* Arrow showing direction */}
              <div style={{
                position: 'absolute', bottom: 12, right: 24,
                fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span>← direction of movement</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <motion.button
          onClick={enqueue}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{
            padding: '12px 24px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 16px #6366f144',
          }}
        >
          <span>🚶‍♂️</span> New Person Arrives (Enqueue)
        </motion.button>
        <motion.button
          onClick={dequeue}
          disabled={line.length === 0}
          whileHover={{ scale: line.length ? 1.04 : 1 }}
          whileTap={{ scale: line.length ? 0.96 : 1 }}
          style={{
            padding: '12px 24px', borderRadius: 12, border: 'none',
            background: line.length
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : '#e2e8f0',
            color: line.length ? 'white' : '#94a3b8',
            fontWeight: 700, fontSize: 15, cursor: line.length ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: line.length ? '0 4px 16px #10b98144' : 'none',
            transition: 'all 0.3s',
          }}
        >
          <span>🎟️</span> Serve Next (Dequeue)
        </motion.button>
      </div>

      {/* Served history */}
      {served.length > 0 && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: 14, padding: '14px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 10 }}>
            Recently Served (Tickets Given):
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {served.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'white', border: '1px solid #86efac',
                borderRadius: 10, padding: '6px 12px',
                fontSize: 13,
              }}>
                <span>{p.emoji}</span>
                <span style={{ fontWeight: 600, color: '#166534' }}>{p.name}</span>
                {i === 0 && <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 6 }}>just now</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FIFO vs LIFO comparison */}
      <div style={{
        marginTop: 20,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
      }}>
        <div style={{
          background: '#eff6ff', border: '2px solid #bfdbfe',
          borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 8, fontSize: 14 }}>
            Queue (FIFO) — This!
          </div>
          <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
            Add A → Add B → Add C<br/>
            Remove → gets <strong>A</strong> (first added)<br/>
            Remove → gets <strong>B</strong><br/>
            <span style={{ color: '#10b981', fontWeight: 700 }}>Fair! First come, first served.</span>
          </div>
        </div>
        <div style={{
          background: '#fef3c7', border: '2px solid #fde68a',
          borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 8, fontSize: 14 }}>
            Stack (LIFO) — Opposite!
          </div>
          <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
            Push A → Push B → Push C<br/>
            Pop → gets <strong>C</strong> (last added!)<br/>
            Pop → gets <strong>B</strong><br/>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>Not fair — last person wins!</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- SECTION 2: Queue Operations Visualizer ---- */
let colorIdx = 0
const BOX_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#14b8a6']

function QueueOpsVisualizer() {
  const [queue, setQueue] = useState([
    { id: 1, val: 'A', color: '#6366f1' },
    { id: 2, val: 'B', color: '#10b981' },
    { id: 3, val: 'C', color: '#f59e0b' },
  ])
  const [inputVal, setInputVal] = useState('')
  const [nextId, setNextId] = useState(4)
  const [log, setLog] = useState(['Queue initialized with [A, B, C]'])
  const [highlight, setHighlight] = useState(null) // 'front' | 'all'
  const [peeked, setPeeked] = useState(false)
  const [dequeued, setDequeued] = useState(null)

  const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 6))

  const enqueue = () => {
    const val = inputVal.trim().toUpperCase() || String.fromCharCode(65 + ((nextId - 1) % 26))
    const color = BOX_COLORS[colorIdx % BOX_COLORS.length]
    colorIdx++
    setQueue(prev => [...prev, { id: nextId, val, color }])
    setNextId(n => n + 1)
    setInputVal('')
    addLog(`Enqueue("${val}") → added to rear. O(1)`)
    setHighlight(null)
    setPeeked(false)
    setDequeued(null)
  }

  const dequeue = () => {
    if (queue.length === 0) { addLog('Dequeue() → ERROR: Queue is empty!'); return }
    const front = queue[0]
    setDequeued(front.val)
    setQueue(prev => prev.slice(1))
    addLog(`Dequeue() → removed "${front.val}" from front. Returns "${front.val}". O(1)`)
    setHighlight(null)
    setPeeked(false)
    setTimeout(() => setDequeued(null), 2000)
  }

  const peek = () => {
    if (queue.length === 0) { addLog('Front/Peek() → ERROR: Queue is empty!'); return }
    addLog(`Front/Peek() → "${queue[0].val}" (no removal). O(1)`)
    setHighlight('front')
    setPeeked(true)
    setTimeout(() => { setHighlight(null); setPeeked(false) }, 2000)
  }

  const isEmpty = () => {
    const empty = queue.length === 0
    addLog(`isEmpty() → ${empty ? 'true (empty!)' : `false (${queue.length} items)`}. O(1)`)
    setHighlight('all')
    setTimeout(() => setHighlight(null), 1500)
  }

  return (
    <div>
      {/* Input row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enqueue()}
          placeholder="Value (optional)"
          style={{
            padding: '10px 16px', borderRadius: 10, border: '2px solid #e2e8f0',
            fontSize: 15, outline: 'none', width: 160, fontFamily: 'inherit',
          }}
        />
        <motion.button onClick={enqueue} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          + Enqueue
        </motion.button>
        <motion.button onClick={dequeue} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          - Dequeue
        </motion.button>
        <motion.button onClick={peek} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          👁 Front/Peek
        </motion.button>
        <motion.button onClick={isEmpty} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          ? isEmpty
        </motion.button>
      </div>

      {/* Queue visualization — horizontal */}
      <div style={{
        background: '#f8fafc', border: '2px solid #e2e8f0',
        borderRadius: 18, padding: '24px 28px', marginBottom: 16,
        minHeight: 120,
      }}>
        {/* Pointer labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>
            FRONT (dequeue end) ←
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>
            → REAR (enqueue end)
          </div>
        </div>

        {/* Dequeued display */}
        <AnimatePresence>
          {dequeued && (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              style={{
                display: 'inline-block', marginBottom: 12,
                background: '#fef2f2', border: '2px solid #fca5a5',
                borderRadius: 10, padding: '6px 16px',
                fontSize: 14, fontWeight: 700, color: '#dc2626',
              }}
            >
              Removed: "{dequeued}"
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boxes */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 70, flexWrap: 'wrap' }}>
          {queue.length === 0 ? (
            <div style={{
              width: '100%', textAlign: 'center',
              color: '#94a3b8', fontStyle: 'italic', fontSize: 15,
            }}>
              [ Empty Queue ]
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {queue.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 50, scale: 0.8 }}
                  animate={{
                    opacity: 1, x: 0, scale: 1,
                    boxShadow: highlight === 'front' && idx === 0
                      ? `0 0 0 4px ${item.color}, 0 0 20px ${item.color}66`
                      : highlight === 'all'
                        ? `0 0 0 2px ${item.color}`
                        : `0 3px 10px ${item.color}33`,
                  }}
                  exit={{ opacity: 0, x: -60, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    width: 60, height: 60, borderRadius: 14,
                    background: item.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 800, color: 'white',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {item.val}
                  {idx === 0 && (
                    <div style={{
                      position: 'absolute', bottom: -20, fontSize: 10,
                      fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap',
                    }}>
                      FRONT {peeked ? '👁' : ''}
                    </div>
                  )}
                  {idx === queue.length - 1 && (
                    <div style={{
                      position: 'absolute', bottom: -20, fontSize: 10,
                      fontWeight: 700, color: '#6366f1', whiteSpace: 'nowrap',
                    }}>
                      REAR
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Size indicator */}
        <div style={{ marginTop: 28, fontSize: 13, color: '#94a3b8' }}>
          Size: {queue.length} element{queue.length !== 1 ? 's' : ''} | All operations: O(1)
        </div>
      </div>

      {/* Operation log */}
      <div style={{
        background: '#1e1e2e', borderRadius: 14, padding: '14px 20px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6c7086', marginBottom: 10, letterSpacing: 1 }}>
          OPERATION LOG
        </div>
        {log.map((entry, i) => (
          <motion.div
            key={entry + i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: 13, color: i === 0 ? '#a6e3a1' : '#6c7086',
              fontFamily: 'monospace', padding: '3px 0',
              borderBottom: i < log.length - 1 ? '1px solid #313244' : 'none',
            }}
          >
            {i === 0 ? '▶ ' : '  '}{entry}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ---- SECTION 3: Stack vs Queue — The Battle ---- */
function StackVsQueueBattle() {
  const [stackItems, setStackItems] = useState([])
  const [queueItems, setQueueItems] = useState([])
  const [history, setHistory] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [nextId, setNextId] = useState(1)
  const [stackRemoved, setStackRemoved] = useState(null)
  const [queueRemoved, setQueueRemoved] = useState(null)

  const addItem = () => {
    const val = inputVal.trim().toUpperCase() || String.fromCharCode(64 + nextId)
    const color = BOX_COLORS[(nextId - 1) % BOX_COLORS.length]
    const item = { id: nextId, val, color }
    setStackItems(prev => [...prev, item])
    setQueueItems(prev => [...prev, item])
    setHistory(prev => [`Add "${val}"`, ...prev].slice(0, 5))
    setNextId(n => n + 1)
    setInputVal('')
  }

  const removeStack = () => {
    if (stackItems.length === 0) return
    const top = stackItems[stackItems.length - 1]
    setStackRemoved(top.val)
    setStackItems(prev => prev.slice(0, -1))
    setTimeout(() => setStackRemoved(null), 2000)
  }

  const removeQueue = () => {
    if (queueItems.length === 0) return
    const front = queueItems[0]
    setQueueRemoved(front.val)
    setQueueItems(prev => prev.slice(1))
    setTimeout(() => setQueueRemoved(null), 2000)
  }

  const reset = () => {
    setStackItems([])
    setQueueItems([])
    setHistory([])
    setNextId(1)
    setInputVal('')
    setStackRemoved(null)
    setQueueRemoved(null)
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="Value"
          style={{
            padding: '10px 16px', borderRadius: 10, border: '2px solid #e2e8f0',
            fontSize: 15, width: 120, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <motion.button onClick={addItem} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Add to Both
        </motion.button>
        <motion.button onClick={reset} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Reset
        </motion.button>
      </div>

      {/* Side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* STACK (LIFO) */}
        <div style={{
          background: '#fff7ed', border: '2px solid #fed7aa',
          borderRadius: 18, padding: '20px 16px',
        }}>
          <div style={{
            fontWeight: 800, fontSize: 16, color: '#c2410c',
            marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            📚 Stack (LIFO)
          </div>
          <div style={{ fontSize: 12, color: '#9a3412', marginBottom: 14 }}>
            Last In, First Out — removes from TOP
          </div>

          <AnimatePresence>
            {stackRemoved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: '#fef2f2', border: '1px solid #fca5a5',
                  borderRadius: 8, padding: '6px 12px', marginBottom: 10,
                  fontSize: 13, fontWeight: 700, color: '#dc2626',
                }}
              >
                Popped: "{stackRemoved}"
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stack items — vertical, top is last element */}
          <div style={{
            minHeight: 160, display: 'flex', flexDirection: 'column-reverse',
            gap: 6, alignItems: 'stretch', marginBottom: 14,
          }}>
            {stackItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#d97706', fontSize: 13, fontStyle: 'italic', marginTop: 60 }}>
                Empty stack
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {stackItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                      height: 44, borderRadius: 10,
                      background: item.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0 14px', color: 'white', fontWeight: 700, fontSize: 16,
                    }}
                  >
                    <span>{item.val}</span>
                    {idx === stackItems.length - 1 && (
                      <span style={{ fontSize: 11, opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6 }}>
                        TOP ← removed next
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <motion.button
            onClick={removeStack}
            disabled={stackItems.length === 0}
            whileHover={{ scale: stackItems.length ? 1.04 : 1 }}
            whileTap={{ scale: stackItems.length ? 0.96 : 1 }}
            style={{
              width: '100%', padding: '10px', borderRadius: 10, border: 'none',
              background: stackItems.length ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#fde8d8',
              color: stackItems.length ? 'white' : '#fdba74',
              fontWeight: 700, fontSize: 14, cursor: stackItems.length ? 'pointer' : 'not-allowed',
            }}
          >
            Pop (remove from top)
          </motion.button>
        </div>

        {/* QUEUE (FIFO) */}
        <div style={{
          background: '#eff6ff', border: '2px solid #bfdbfe',
          borderRadius: 18, padding: '20px 16px',
        }}>
          <div style={{
            fontWeight: 800, fontSize: 16, color: '#1d4ed8',
            marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            🚶‍♂️ Queue (FIFO)
          </div>
          <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 14 }}>
            First In, First Out — removes from FRONT
          </div>

          <AnimatePresence>
            {queueRemoved && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: '#dbeafe', border: '1px solid #93c5fd',
                  borderRadius: 8, padding: '6px 12px', marginBottom: 10,
                  fontSize: 13, fontWeight: 700, color: '#1d4ed8',
                }}
              >
                Dequeued: "{queueRemoved}"
              </motion.div>
            )}
          </AnimatePresence>

          {/* Queue items — horizontal but stacked */}
          <div style={{
            minHeight: 160, display: 'flex', flexDirection: 'column',
            gap: 6, alignItems: 'stretch', marginBottom: 14,
          }}>
            {queueItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#2563eb', fontSize: 13, fontStyle: 'italic', marginTop: 60 }}>
                Empty queue
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {queueItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -60, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                      height: 44, borderRadius: 10,
                      background: item.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0 14px', color: 'white', fontWeight: 700, fontSize: 16,
                    }}
                  >
                    <span>{item.val}</span>
                    {idx === 0 && (
                      <span style={{ fontSize: 11, opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6 }}>
                        FRONT ← removed next
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <motion.button
            onClick={removeQueue}
            disabled={queueItems.length === 0}
            whileHover={{ scale: queueItems.length ? 1.04 : 1 }}
            whileTap={{ scale: queueItems.length ? 0.96 : 1 }}
            style={{
              width: '100%', padding: '10px', borderRadius: 10, border: 'none',
              background: queueItems.length ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#dbeafe',
              color: queueItems.length ? 'white' : '#93c5fd',
              fontWeight: 700, fontSize: 14, cursor: queueItems.length ? 'pointer' : 'not-allowed',
            }}
          >
            Dequeue (remove from front)
          </motion.button>
        </div>
      </div>

      {/* Results summary */}
      {history.length > 0 && (
        <div style={{
          marginTop: 16, background: '#f8fafc',
          border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
            Key Insight:
          </div>
          <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
            Same elements added to both. <strong style={{ color: '#c2410c' }}>Stack removes from the TOP (last added)</strong> — like undoing. <strong style={{ color: '#1d4ed8' }}>Queue removes from the FRONT (first added)</strong> — like a fair line. Add A, B, C then remove: Stack gives C, B, A. Queue gives A, B, C.
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- SECTION 4: Circular Queue ---- */
const CIRCLE_SIZE = 8

function CircularQueueVisualizer() {
  const [arr, setArr] = useState(Array(CIRCLE_SIZE).fill(null))
  const [front, setFront] = useState(0)
  const [rear, setRear] = useState(0)
  const [count, setCount] = useState(0)
  const [inputVal, setInputVal] = useState('')
  const [nextId, setNextId] = useState(1)
  const [log, setLog] = useState(['Circular queue initialized (size 8)'])
  const [animIdx, setAnimIdx] = useState(null)

  const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 5))

  const enqueue = () => {
    if (count === CIRCLE_SIZE) { addLog('ERROR: Queue is FULL!'); return }
    const val = inputVal.trim().toUpperCase() || String.fromCharCode(64 + nextId)
    const color = BOX_COLORS[(nextId - 1) % BOX_COLORS.length]
    const newArr = [...arr]
    newArr[rear] = { val, color, id: nextId }
    const newRear = (rear + 1) % CIRCLE_SIZE
    setArr(newArr)
    setRear(newRear)
    setCount(c => c + 1)
    setNextId(n => n + 1)
    setInputVal('')
    setAnimIdx(rear)
    addLog(`Enqueue("${val}") at index ${rear}. Rear → ${newRear} (wraps if needed)`)
    setTimeout(() => setAnimIdx(null), 800)
  }

  const dequeue = () => {
    if (count === 0) { addLog('ERROR: Queue is EMPTY!'); return }
    const item = arr[front]
    const newArr = [...arr]
    newArr[front] = null
    const newFront = (front + 1) % CIRCLE_SIZE
    setArr(newArr)
    setFront(newFront)
    setCount(c => c - 1)
    addLog(`Dequeue() → removed "${item.val}" from index ${front}. Front → ${newFront}`)
    setAnimIdx(null)
  }

  const reset = () => {
    setArr(Array(CIRCLE_SIZE).fill(null))
    setFront(0); setRear(0); setCount(0); setNextId(1)
    setLog(['Circular queue reset'])
  }

  // Compute positions around a circle
  const getPos = (idx, r = 120) => {
    const angle = (idx / CIRCLE_SIZE) * 2 * Math.PI - Math.PI / 2
    return { x: r * Math.cos(angle), y: r * Math.sin(angle) }
  }

  return (
    <div>
      <div style={{
        background: '#faf5ff', border: '2px dashed #d8b4fe',
        borderRadius: 16, padding: '14px 18px', marginBottom: 20,
        fontSize: 14, color: '#6b21a8', lineHeight: 1.6,
      }}>
        <strong>The Problem with Simple Queues:</strong> After dequeueing from the front, those slots are wasted — the front pointer just moves right forever. <strong>Circular Queue</strong> wraps the rear pointer back to the beginning when it reaches the end. No wasted space!
      </div>

      {/* Circle visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 300, height: 300 }}>
          {/* SVG for connections */}
          <svg width="300" height="300" style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx="150" cy="150" r="120" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 4" />
          </svg>

          {Array.from({ length: CIRCLE_SIZE }).map((_, idx) => {
            const { x, y } = getPos(idx)
            const item = arr[idx]
            const isFront = idx === front && count > 0
            const isRear = idx === (rear - 1 + CIRCLE_SIZE) % CIRCLE_SIZE && count > 0
            const isAnimating = animIdx === idx

            return (
              <motion.div
                key={idx}
                animate={isAnimating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute',
                  left: 150 + x - 28,
                  top: 150 + y - 28,
                  width: 56, height: 56,
                  borderRadius: '50%',
                  background: item
                    ? item.color
                    : '#f1f5f9',
                  border: isFront
                    ? '3px solid #10b981'
                    : isRear
                      ? '3px solid #6366f1'
                      : '2px solid #e2e8f0',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: isFront
                    ? '0 0 12px #10b98166'
                    : isRear
                      ? '0 0 12px #6366f166'
                      : item ? '0 2px 8px #00000022' : 'none',
                  transition: 'all 0.3s',
                  zIndex: 1,
                }}
              >
                <div style={{
                  fontSize: item ? 15 : 11, fontWeight: 700,
                  color: item ? 'white' : '#94a3b8',
                }}>
                  {item ? item.val : idx}
                </div>
                {isFront && !isRear && (
                  <div style={{ fontSize: 8, color: '#10b981', fontWeight: 800, lineHeight: 1 }}>F</div>
                )}
                {isRear && !isFront && (
                  <div style={{ fontSize: 8, color: '#6366f1', fontWeight: 800, lineHeight: 1 }}>R</div>
                )}
                {isFront && isRear && (
                  <div style={{ fontSize: 8, color: '#f59e0b', fontWeight: 800, lineHeight: 1 }}>F=R</div>
                )}
              </motion.div>
            )
          })}

          {/* Center info */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{count}/{CIRCLE_SIZE}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>items</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: '3px solid #10b981' }} />
          <span style={{ color: '#059669', fontWeight: 600 }}>Front (F)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: '3px solid #6366f1' }} />
          <span style={{ color: '#4f46e5', fontWeight: 600 }}>Rear (R)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#f1f5f9', border: '2px solid #e2e8f0' }} />
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Empty</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enqueue()}
          placeholder="Value"
          style={{
            padding: '10px 14px', borderRadius: 10, border: '2px solid #e2e8f0',
            fontSize: 14, width: 100, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <motion.button onClick={enqueue} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Enqueue
        </motion.button>
        <motion.button onClick={dequeue} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Dequeue
        </motion.button>
        <motion.button onClick={reset} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Reset
        </motion.button>
      </div>

      {/* Log */}
      <div style={{ background: '#1e1e2e', borderRadius: 12, padding: '12px 18px' }}>
        {log.map((entry, i) => (
          <div key={i} style={{
            fontSize: 13, color: i === 0 ? '#a6e3a1' : '#6c7086',
            fontFamily: 'monospace', padding: '3px 0',
          }}>
            {i === 0 ? '▶ ' : '  '}{entry}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- SECTION 5: Priority Queue — Hospital ER ---- */
const SEVERITY_COLORS = {
  5: '#ef4444',
  4: '#f97316',
  3: '#f59e0b',
  2: '#10b981',
  1: '#3b82f6',
}
const SEVERITY_LABELS = {
  5: 'Critical',
  4: 'Serious',
  3: 'Moderate',
  2: 'Minor',
  1: 'Routine',
}
const SEVERITY_EMOJIS = { 5: '🚨', 4: '⚠️', 3: '😰', 2: '🤕', 1: '😊' }
const PATIENT_NAMES = ['Rajesh', 'Sunita', 'Vikram', 'Meera', 'Arun', 'Kavita', 'Suresh', 'Anita', 'Deepak', 'Priya']

function PriorityQueueDemo() {
  const [pQueue, setPQueue] = useState([
    { id: 1, name: 'Meera', severity: 2 },
    { id: 2, name: 'Arun', severity: 4 },
    { id: 3, name: 'Suresh', severity: 1 },
  ])
  const [regularQueue, setRegularQueue] = useState([
    { id: 1, name: 'Meera', severity: 2 },
    { id: 2, name: 'Arun', severity: 4 },
    { id: 3, name: 'Suresh', severity: 1 },
  ])
  const [nextId, setNextId] = useState(4)
  const [selectedSeverity, setSelectedSeverity] = useState(3)
  const [served, setServed] = useState(null)
  const [insertAnim, setInsertAnim] = useState(null)

  const addPatient = () => {
    const name = PATIENT_NAMES[(nextId - 1) % PATIENT_NAMES.length]
    const patient = { id: nextId, name, severity: selectedSeverity }

    // Priority queue — insert in correct sorted position
    setPQueue(prev => {
      const newQ = [...prev, patient]
      newQ.sort((a, b) => b.severity - a.severity)
      return newQ
    })
    // Regular queue — just append
    setRegularQueue(prev => [...prev, patient])
    setNextId(n => n + 1)
    setInsertAnim(nextId)
    setTimeout(() => setInsertAnim(null), 1000)
  }

  const serveNext = () => {
    if (pQueue.length === 0) return
    const patient = pQueue[0]
    setServed(patient)
    setPQueue(prev => prev.slice(1))
    setRegularQueue(prev => prev.slice(1))
    setTimeout(() => setServed(null), 3000)
  }

  const PatientCard = ({ patient, isFirst, showPriorityBadge }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1, scale: 1,
        x: insertAnim === patient.id ? [30, 0] : 0,
      }}
      exit={{ opacity: 0, x: -40, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 280, damping: 25 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: 12,
        background: isFirst
          ? `${SEVERITY_COLORS[patient.severity]}22`
          : 'white',
        border: isFirst
          ? `2px solid ${SEVERITY_COLORS[patient.severity]}`
          : '1px solid #e2e8f0',
        boxShadow: isFirst ? `0 2px 12px ${SEVERITY_COLORS[patient.severity]}33` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{SEVERITY_EMOJIS[patient.severity]}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{patient.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Arrived #{patient.id}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          background: SEVERITY_COLORS[patient.severity],
          color: 'white', borderRadius: 20, padding: '3px 10px',
          fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {'★'.repeat(patient.severity)}{'☆'.repeat(5 - patient.severity)}
          <span style={{ marginLeft: 4 }}>{SEVERITY_LABELS[patient.severity]}</span>
        </div>
        {isFirst && <span style={{ fontSize: 11, fontWeight: 700, color: SEVERITY_COLORS[patient.severity] }}>NEXT →</span>}
      </div>
    </motion.div>
  )

  return (
    <div>
      {/* Served notification */}
      <AnimatePresence>
        {served && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: '#f0fdf4', border: '2px solid #86efac',
              borderRadius: 14, padding: '14px 20px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 12,
              fontSize: 15, fontWeight: 700, color: '#166534',
            }}
          >
            <span style={{ fontSize: 24 }}>✅</span>
            Dr. saw <strong>{served.name}</strong> (Severity {served.severity} — {SEVERITY_LABELS[served.severity]})
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add patient controls */}
      <div style={{
        background: '#fff7ed', border: '2px solid #fed7aa',
        borderRadius: 16, padding: '16px 20px', marginBottom: 20,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#c2410c', marginBottom: 12 }}>
          New patient arrives — select severity:
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {[5, 4, 3, 2, 1].map(sev => (
            <motion.button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              style={{
                padding: '8px 16px', borderRadius: 20, border: 'none',
                background: selectedSeverity === sev ? SEVERITY_COLORS[sev] : '#f8fafc',
                color: selectedSeverity === sev ? 'white' : SEVERITY_COLORS[sev],
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                border: `2px solid ${SEVERITY_COLORS[sev]}`,
                transition: 'all 0.2s',
              }}
            >
              {SEVERITY_EMOJIS[sev]} {sev}★ {SEVERITY_LABELS[sev]}
            </motion.button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button onClick={addPatient} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            Patient Arrives
          </motion.button>
          <motion.button onClick={serveNext} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            Doctor Serves Next
          </motion.button>
        </div>
      </div>

      {/* Side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Priority Queue */}
        <div style={{
          background: '#fefce8', border: '2px solid #fde047',
          borderRadius: 16, padding: 16,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#854d0e', marginBottom: 4 }}>
            🏥 Priority Queue
          </div>
          <div style={{ fontSize: 12, color: '#713f12', marginBottom: 14 }}>
            Highest severity served first — NOT FIFO!
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence mode="popLayout">
              {pQueue.map((p, i) => (
                <PatientCard key={p.id} patient={p} isFirst={i === 0} showPriorityBadge={true} />
              ))}
            </AnimatePresence>
            {pQueue.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 20 }}>No patients</div>
            )}
          </div>
        </div>

        {/* Regular Queue */}
        <div style={{
          background: '#eff6ff', border: '2px solid #bfdbfe',
          borderRadius: 16, padding: 16,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#1d4ed8', marginBottom: 4 }}>
            🚶 Regular Queue
          </div>
          <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 14 }}>
            First come, first served — FIFO regardless of severity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence mode="popLayout">
              {regularQueue.map((p, i) => (
                <PatientCard key={p.id} patient={p} isFirst={i === 0} showPriorityBadge={false} />
              ))}
            </AnimatePresence>
            {regularQueue.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 20 }}>No patients</div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 16, background: '#faf5ff', border: '1px solid #e9d5ff',
        borderRadius: 12, padding: '12px 18px', fontSize: 14, color: '#6b21a8', lineHeight: 1.6,
      }}>
        <strong>Key difference:</strong> In the Priority Queue, a Critical (5★) patient who just arrived goes to the front — bypassing everyone. In a Regular Queue, they'd wait behind all earlier arrivals. Implementation: Priority Queue is usually a <strong>Heap</strong> (O(log n) insert, O(log n) extract — you'll learn this in Topic 16!).
      </div>
    </div>
  )
}

/* ---- SECTION 6: Real-Life Queue Applications ---- */
const APPLICATIONS = [
  {
    icon: '🖨️',
    title: 'Printer Queue',
    subtitle: 'Documents printed in order',
    color: '#3b82f6',
    description: 'When multiple people send print jobs, they go into a queue. The printer processes them in FIFO order — the first document sent gets printed first.',
    detail: 'Doc1 → Doc2 → Doc3 → prints as Doc1, Doc2, Doc3',
    animation: 'print',
  },
  {
    icon: '⚙️',
    title: 'CPU Task Scheduler',
    subtitle: 'Processes wait their turn',
    color: '#8b5cf6',
    description: 'Your computer runs many processes. The OS puts them in a queue. Each process gets a time slice (Round Robin scheduling). Queue ensures fairness.',
    detail: 'Process A → B → C gets CPU time in round-robin order',
    animation: 'cpu',
  },
  {
    icon: '🌐',
    title: 'BFS Algorithm',
    subtitle: 'Level-by-level graph exploration',
    color: '#10b981',
    description: 'Breadth-First Search (BFS) uses a queue to explore a graph level by level. Start node → add neighbors to queue → process front → add ITS neighbors... and so on. Finds shortest path!',
    detail: 'Level 0: root → Level 1: neighbors → Level 2: their neighbors',
    animation: 'bfs',
  },
  {
    icon: '💬',
    title: 'Message Queue (WhatsApp)',
    subtitle: 'Messages delivered in order',
    color: '#ec4899',
    description: 'WhatsApp stores your messages in a queue when you\'re offline. When you reconnect, messages are delivered in FIFO order — exactly as they were sent.',
    detail: 'Msg1 sent → Msg2 sent → Msg3 sent → received as 1, 2, 3',
    animation: 'msg',
  },
  {
    icon: '⌨️',
    title: 'Keyboard Buffer',
    subtitle: 'Keys pressed stored in queue',
    color: '#f59e0b',
    description: 'When you type fast, the OS stores your keypresses in a keyboard buffer queue. They\'re processed in FIFO order — so your keystrokes appear in the right sequence.',
    detail: '"H" → "e" → "l" → "l" → "o" → processed as "Hello"',
    animation: 'keyboard',
  },
  {
    icon: '📡',
    title: 'Network Packet Queue',
    subtitle: 'Router queues for data packets',
    color: '#0ea5e9',
    description: 'Routers queue incoming data packets. When the network is busy, packets wait in a queue and are forwarded in order. This ensures no packet is lost.',
    detail: 'Packet1 → Packet2 → forwarded in sequence',
    animation: 'network',
  },
]

function PrinterAnimation() {
  const [docs, setDocs] = useState(['Report.pdf', 'Invoice.docx', 'Photo.png'])
  const [printing, setPrinting] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDocs(prev => {
        if (prev.length === 0) return ['Report.pdf', 'Invoice.docx', 'Photo.png']
        const first = prev[0]
        setPrinting(first)
        setTimeout(() => setPrinting(null), 800)
        return prev.slice(1)
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {docs.map((d, i) => (
          <motion.div key={d} layout style={{
            background: i === 0 ? '#dbeafe' : '#f1f5f9',
            border: `1px solid ${i === 0 ? '#93c5fd' : '#e2e8f0'}`,
            borderRadius: 8, padding: '4px 10px', fontSize: 11,
            fontWeight: 600, color: i === 0 ? '#1d4ed8' : '#64748b',
          }}>
            {i === 0 && '→ '}{d}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {printing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 6, fontSize: 12, color: '#059669', fontWeight: 600 }}
          >
            🖨️ Printing: {printing}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RealLifeApps() {
  const [activeCard, setActiveCard] = useState(null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {APPLICATIONS.map((app, idx) => (
        <motion.div
          key={app.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.07 }}
          whileHover={{ y: -4, boxShadow: `0 8px 32px ${app.color}33` }}
          onClick={() => setActiveCard(activeCard === idx ? null : idx)}
          style={{
            background: activeCard === idx ? `${app.color}10` : 'white',
            border: `2px solid ${activeCard === idx ? app.color : '#e2e8f0'}`,
            borderRadius: 18, padding: 20,
            cursor: 'pointer', transition: 'all 0.3s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${app.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>
              {app.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{app.title}</div>
              <div style={{ fontSize: 12, color: app.color, fontWeight: 600 }}>{app.subtitle}</div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            {app.description}
          </p>

          <AnimatePresence>
            {activeCard === idx && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  marginTop: 12, background: `${app.color}10`,
                  border: `1px solid ${app.color}33`,
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: 12, fontFamily: 'monospace',
                  color: app.color, fontWeight: 600,
                }}>
                  {app.detail}
                </div>
                {app.animation === 'print' && <PrinterAnimation />}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{
            marginTop: 12, fontSize: 12, color: activeCard === idx ? app.color : '#94a3b8',
            fontWeight: 600,
          }}>
            {activeCard === idx ? 'Click to collapse ▲' : 'Click to expand ▼'}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ================================================================
   MAIN TOPIC 10 COMPONENT
================================================================ */
export default function Topic10Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #6366f1 50%, #8b5cf6 100%)',
          borderRadius: 24, padding: '44px 40px',
          marginBottom: 36, color: 'white', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -20,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', borderRadius: 20,
            padding: '6px 16px', fontSize: 13, fontWeight: 700,
            marginBottom: 16, backdropFilter: 'blur(8px)',
          }}>
            🚶‍♂️ Topic 10 · Think Like a Programmer
          </div>
          <h1 style={{
            fontSize: 40, fontWeight: 900, margin: '0 0 12px 0',
            fontFamily: 'var(--font-heading)', lineHeight: 1.2,
          }}>
            Queues
          </h1>
          <p style={{ fontSize: 19, opacity: 0.9, margin: '0 0 20px 0', maxWidth: 560, lineHeight: 1.6 }}>
            First In, First Out — the fair waiting line, the printer queue, the task scheduler.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['FIFO', 'O(1) Operations', 'Circular Queue', 'Priority Queue', 'BFS Preview'].map(tag => (
              <div key={tag} style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 14px',
                fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)',
              }}>
                {tag}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Neuron intro */}
      <div style={{ marginBottom: 36 }}>
        <Neuron
          mood="excited"
          size="medium"
          message="You just learned Stacks — Last In, First Out, like a plate stack. Now flip it! Queues are the OPPOSITE: First In, First Out. Think of every waiting line you've ever stood in — movie tickets, bank, canteen. The first person to arrive is the FIRST to be served. That's a Queue!"
        />
      </div>

      {/* ===== SECTION 1: Movie Ticket Line ===== */}
      <SectionBlock icon="🎬" title="The Movie Ticket Line">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Imagine a PVR cinema ticket counter. People line up and the person who arrived <strong>first</strong> gets served first. New arrivals join at the <strong>back</strong>. This is exactly how a Queue works.
        </p>

        <InteractiveDemo
          title="Movie Ticket Line"
          instruction="Click 'New Person Arrives' to enqueue someone at the back. Click 'Serve Next' to dequeue from the front."
        >
          <MovieTicketLine />
        </InteractiveDemo>

        <NeuronTip type="simple">
          <strong>FIFO Rule:</strong> The first person to JOIN the line is the first to LEAVE it. This is the entire concept of a Queue — and it's everywhere in real life and computer science.
        </NeuronTip>

        <HindiExplainer
          concept="Queue — पंक्ति (Waiting Line)"
          english="Queue = FIFO Data Structure"
          explanation="Queue बिल्कुल movie ticket line जैसा है। जो पहले आया, वो पहले जाएगा। नया बंदा हमेशा पीछे (REAR) लगता है, और सेवा हमेशा आगे (FRONT) से होती है। यही FIFO है — First In, First Out।"
          example="सोचो: ATM queue, canteen queue, bank queue — सब में जो पहले आया, पहले काम हुआ। Stack उल्टा था — उसमें आखिरी वाला पहले निकलता था (LIFO)।"
          terms={[
            { hindi: 'Queue', english: 'Queue', meaning: 'पंक्ति — एक data structure जहाँ FIFO नियम चलता है' },
            { hindi: 'FIFO', english: 'First In First Out', meaning: 'पहले अंदर, पहले बाहर — Queue का fundamental rule' },
            { hindi: 'Enqueue', english: 'Enqueue', meaning: 'पंक्ति में पीछे से जोड़ना' },
            { hindi: 'Dequeue', english: 'Dequeue', meaning: 'पंक्ति से आगे से निकालना' },
          ]}
        />
      </SectionBlock>

      {/* ===== SECTION 2: Queue Operations ===== */}
      <SectionBlock icon="⚡" title="Queue Operations Visualizer">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          A queue has 4 core operations — all <strong>O(1)</strong> constant time. The FRONT pointer tracks where to remove; the REAR pointer tracks where to insert.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12, marginBottom: 24,
        }}>
          {[
            { op: 'Enqueue(val)', desc: 'Add to REAR', time: 'O(1)', color: '#6366f1' },
            { op: 'Dequeue()', desc: 'Remove from FRONT', time: 'O(1)', color: '#ef4444' },
            { op: 'Front/Peek()', desc: 'View front element', time: 'O(1)', color: '#f59e0b' },
            { op: 'isEmpty()', desc: 'Check if empty', time: 'O(1)', color: '#8b5cf6' },
          ].map(item => (
            <div key={item.op} style={{
              background: `${item.color}10`, border: `2px solid ${item.color}33`,
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: item.color, marginBottom: 4 }}>
                {item.op}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{item.desc}</div>
              <div style={{
                display: 'inline-block', background: '#dcfce7', color: '#166534',
                borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
              }}>
                {item.time}
              </div>
            </div>
          ))}
        </div>

        <InteractiveDemo
          title="Queue Operations Visualizer"
          instruction="Try all 4 operations. Watch the FRONT and REAR pointers move. Check the operation log!"
        >
          <QueueOpsVisualizer />
        </InteractiveDemo>

        <NeuronTip type="tip">
          <strong>Why O(1)?</strong> Because we always know exactly where to add (REAR) and where to remove (FRONT). No searching needed! Compare this to removing from the middle of an array which is O(n).
        </NeuronTip>
      </SectionBlock>

      {/* ===== SECTION 3: Stack vs Queue ===== */}
      <SectionBlock icon="⚔️" title="Stack vs Queue — The Battle">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Add the same elements to both a Stack and a Queue. Watch what happens when you remove from each. The order difference is dramatic — and understanding this gap is crucial for choosing the right data structure.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24,
        }}>
          <div style={{
            background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: 14, padding: 16,
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#c2410c', marginBottom: 8 }}>
              📚 Stack — LIFO
            </div>
            <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
              Like a pile of plates.<br/>Remove from the <strong>TOP</strong>.<br/>
              Use cases: Undo/Redo, Browser back button, Function call stack
            </div>
          </div>
          <div style={{
            background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: 14, padding: 16,
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1d4ed8', marginBottom: 8 }}>
              🚶‍♂️ Queue — FIFO
            </div>
            <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
              Like a waiting line.<br/>Remove from the <strong>FRONT</strong>.<br/>
              Use cases: Printer queue, Task scheduler, BFS traversal
            </div>
          </div>
        </div>

        <InteractiveDemo
          title="Stack vs Queue Battle"
          instruction="Add elements to both structures simultaneously. Then remove from each and see the order difference!"
        >
          <StackVsQueueBattle />
        </InteractiveDemo>

        <NeuronTip type="example">
          <strong>Classic example:</strong> Add A, B, C to both.<br/>
          Stack removes: C → B → A (reversed! LIFO)<br/>
          Queue removes: A → B → C (same order! FIFO)<br/>
          This difference is why BFS uses a queue (level-order) and DFS uses a stack (depth-first).
        </NeuronTip>
      </SectionBlock>

      {/* ===== SECTION 4: Circular Queue ===== */}
      <SectionBlock icon="🔄" title="Circular Queue">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          A simple array-based queue wastes space: after dequeuing, the front index moves right, but those empty slots are never reused. The <strong>Circular Queue</strong> wraps the rear pointer back to index 0 when it reaches the end — using space efficiently like a ring buffer.
        </p>

        <div style={{
          background: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
          border: '2px solid #c4b5fd', borderRadius: 16, padding: '16px 20px',
          marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#6d28d9', marginBottom: 10 }}>
            How Circular Queue works:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13, color: '#5b21b6' }}>
            <div>
              <strong>Normal Queue problem:</strong><br/>
              [_, _, _, A, B, C, _, _]<br/>
              front=3, rear=6<br/>
              Indices 0,1,2 are WASTED even if queue isn't full!
            </div>
            <div>
              <strong>Circular Queue solution:</strong><br/>
              rear = (rear + 1) % size<br/>
              When rear reaches end, it wraps to 0.<br/>
              No wasted space!
            </div>
          </div>
        </div>

        <InteractiveDemo
          title="Circular Queue Visualizer"
          instruction="Enqueue and dequeue elements. Watch the FRONT (green) and REAR (purple) pointers move around the circle!"
        >
          <CircularQueueVisualizer />
        </InteractiveDemo>

        <NeuronTip type="deep">
          <strong>Formula:</strong> rear = (rear + 1) % capacity<br/>
          This single modulo operation is what makes it "circular". It's used in operating system ring buffers, audio streaming, and anywhere you need fixed-size circular storage.
        </NeuronTip>

        <HindiExplainer
          concept="Circular Queue — गोल कतार"
          english="Circular Queue = Ring Buffer"
          explanation="Simple array queue में problem यह है कि dequeue करने के बाद front index आगे खिसकता जाता है और शुरू की जगह खाली रहती है — waste! Circular Queue में rear pointer जब end पर पहुंचता है, तो वापस शुरू में wrap हो जाता है। Formula है: rear = (rear + 1) % size। इसे Ring Buffer भी कहते हैं।"
          example="जैसे circular railway track पर train — जब track का अंत आता है, वो वापस शुरू में आ जाती है। कोई space waste नहीं।"
          terms={[
            { hindi: 'Circular Queue', english: 'Circular / Ring Buffer', meaning: 'गोल कतार — जहाँ rear pointer wrap करता है' },
            { hindi: 'Modulo (%)', english: 'Modulo operator', meaning: 'Wrap करने का formula: (rear + 1) % size' },
            { hindi: 'Ring Buffer', english: 'Ring Buffer', meaning: 'Fixed size circular memory — OS में खूब use होता है' },
          ]}
        />
      </SectionBlock>

      {/* ===== SECTION 5: Priority Queue ===== */}
      <SectionBlock icon="🏥" title="Priority Queue — Not All Queues Are Fair!">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          In a hospital ER, a heart attack patient shouldn't wait behind someone with a headache — even if they arrived later. A <strong>Priority Queue</strong> serves elements by priority, not arrival order. Critical patients always go first.
        </p>

        <InteractiveDemo
          title="Hospital ER Priority Queue"
          instruction="Patients arrive with different severity levels (1-5 stars). Watch how the priority queue automatically reorders them. Compare with a regular FIFO queue."
        >
          <PriorityQueueDemo />
        </InteractiveDemo>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12, marginTop: 20, marginBottom: 20,
        }}>
          {[
            { title: 'Regular Queue', desc: 'FIFO — first come, first served. Fair but ignores urgency.', icon: '🚶', color: '#3b82f6' },
            { title: 'Priority Queue', desc: 'Highest priority served first. Arrival order is secondary.', icon: '🚨', color: '#ef4444' },
            { title: 'Implementation', desc: 'Usually a Heap! O(log n) insert, O(log n) extract. (Topic 16)', icon: '⛰️', color: '#8b5cf6' },
          ].map(item => (
            <div key={item.title} style={{
              background: `${item.color}10`, border: `2px solid ${item.color}33`,
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: item.color, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <NeuronTip type="example">
          <strong>Real-world Priority Queues:</strong><br/>
          • Dijkstra's algorithm: always process the node with minimum distance next<br/>
          • OS task scheduling: real-time processes beat background processes<br/>
          • Event-driven simulation: events sorted by time of occurrence<br/>
          • A* pathfinding: always explore the most promising path first
        </NeuronTip>
      </SectionBlock>

      {/* ===== SECTION 6: Real-Life Applications ===== */}
      <SectionBlock icon="🌍" title="Queues in Real Life">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
          Queues are everywhere in computing. Every time something needs to process work in the order it arrives — that's a queue. Click each card to learn more!
        </p>

        <RealLifeApps />

        <NeuronTip type="fun">
          <strong>BFS Preview!</strong> Breadth-First Search — which you'll learn in Topic 18 — is essentially a queue in disguise. Start at node A, enqueue its neighbors, process each, enqueue THEIR neighbors... The queue ensures you explore level by level, which is exactly why BFS finds the <em>shortest path</em> in unweighted graphs!
        </NeuronTip>
      </SectionBlock>

      {/* ===== SECTION 7: Hindi Summary ===== */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary — पूरा सारांश">
        <div style={{ marginBottom: 20 }}>
          <Neuron
            mood="explaining"
            size="medium"
            message="Queue को याद रखना बहुत आसान है — बस movie ticket line सोचो! Jo pehle aaya, woh pehle jaayega. FIFO. Stack उल्टा था (LIFO), Queue सीधा है। Circular Queue space बचाता है। Priority Queue urgency देखता है।"
          />
        </div>

        <HindiExplainer
          concept="Queue — कतार / पंक्ति"
          english="Queue = FIFO Data Structure"
          explanation="Queue का मतलब है पंक्ति (line)। इसका नियम है FIFO — First In, First Out। जो पहले आया, वो पहले निकलेगा।

Queue में दो ends होते हैं:
• FRONT: जहाँ से निकालते हैं (Dequeue)
• REAR: जहाँ से जोड़ते हैं (Enqueue)

Circular Queue में REAR pointer end पर पहुँचकर शुरू में wrap हो जाता है — (rear + 1) % size — जिससे कोई space waste नहीं होता।

Priority Queue में fairness नहीं है — high priority वाले पहले जाते हैं, चाहे बाद में आए हों। Hospital ER, Dijkstra algorithm यही use करते हैं।"
          example="Movie ticket line = Queue (FIFO).
Hospital ER = Priority Queue (severity देखो, arrival order नहीं).
Circular railway track = Circular Queue (end से start पर wrap).
Printer jobs = Queue (document1 पहले print होगा, document5 बाद में)."
          terms={[
            { hindi: 'Queue (कतार)', english: 'Queue', meaning: 'FIFO data structure — पंक्ति की तरह' },
            { hindi: 'Enqueue (जोड़ना)', english: 'Enqueue / Push', meaning: 'पंक्ति में पीछे (REAR) से जोड़ना — O(1)' },
            { hindi: 'Dequeue (निकालना)', english: 'Dequeue / Pop', meaning: 'पंक्ति से आगे (FRONT) से निकालना — O(1)' },
            { hindi: 'FIFO', english: 'First In, First Out', meaning: 'पहले अंदर, पहले बाहर — Queue का मूल नियम' },
            { hindi: 'LIFO vs FIFO', english: 'Stack vs Queue', meaning: 'Stack उल्टा (LIFO), Queue सीधा (FIFO)' },
            { hindi: 'Circular Queue', english: 'Ring Buffer', meaning: 'Rear जब end पर पहुँचे, start पर wrap हो जाए' },
            { hindi: 'Priority Queue', english: 'Priority Queue', meaning: 'FIFO नहीं — priority के हिसाब से serve होता है' },
            { hindi: 'BFS', english: 'Breadth-First Search', meaning: 'Queue use करके graph को level-by-level explore करना' },
          ]}
        />

        {/* Final summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: 'linear-gradient(135deg, #1e40af, #6366f1)',
            borderRadius: 20, padding: '28px 32px',
            marginTop: 24, color: 'white',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>
            Topic 10 Complete! 🚶‍♂️
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { title: 'FIFO Principle', desc: 'First In, First Out — the core rule', icon: '📋' },
              { title: 'O(1) Operations', desc: 'Enqueue, Dequeue, Peek — all constant time', icon: '⚡' },
              { title: 'Circular Queue', desc: 'Wrap-around to eliminate wasted space', icon: '🔄' },
              { title: 'Priority Queue', desc: 'Serve by priority, not arrival order', icon: '🚨' },
              { title: 'Real-world use', desc: 'Printers, CPUs, BFS, messages, keyboards', icon: '🌍' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 20, background: 'rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '12px 16px', fontSize: 14, lineHeight: 1.6,
          }}>
            <strong>Coming up in Topic 11:</strong> Linked Lists — when arrays don't cut it, chains of connected nodes. Arrays need continuous memory; Linked Lists don't. But they sacrifice random access for flexible insertion.
          </div>
        </motion.div>
      </SectionBlock>

    </div>
  )
}
