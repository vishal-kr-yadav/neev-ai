import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 9 — Stacks
   Last In, First Out — the undo button, the back button, the call stack.
================================================================ */

/* ---- PLATE COLORS ---- */
const PLATE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#6366f1',
]

/* ================================================================
   SECTION 1 — The Plate Stack
================================================================ */
function PlateStack() {
  const [plates, setPlates] = useState([
    { id: 1, value: 'Red', color: PLATE_COLORS[0] },
    { id: 2, value: 'Blue', color: PLATE_COLORS[4] },
    { id: 3, value: 'Green', color: PLATE_COLORS[3] },
  ])
  const [inputVal, setInputVal] = useState('')
  const [shakenIdx, setShakenIdx] = useState(null)
  const [poppedPlate, setPoppedPlate] = useState(null)
  const [msg, setMsg] = useState(null)
  const idRef = useRef(10)

  const push = () => {
    const val = inputVal.trim() || `Plate ${plates.length + 1}`
    if (plates.length >= 8) {
      setMsg({ text: 'Stack is full! Pop one first.', color: '#ef4444' })
      setTimeout(() => setMsg(null), 2000)
      return
    }
    const color = PLATE_COLORS[(plates.length) % PLATE_COLORS.length]
    setPlates(prev => [...prev, { id: idRef.current++, value: val, color }])
    setInputVal('')
    setMsg({ text: `Pushed "${val}" onto the stack!`, color: '#22c55e' })
    setTimeout(() => setMsg(null), 1800)
  }

  const pop = () => {
    if (plates.length === 0) {
      setMsg({ text: 'Stack is empty! Nothing to pop.', color: '#ef4444' })
      setTimeout(() => setMsg(null), 2000)
      return
    }
    const top = plates[plates.length - 1]
    setPoppedPlate(top)
    setPlates(prev => prev.slice(0, -1))
    setMsg({ text: `Popped "${top.value}" off the stack!`, color: '#f97316' })
    setTimeout(() => {
      setPoppedPlate(null)
      setMsg(null)
    }, 2000)
  }

  const handleMiddleClick = (idx) => {
    if (idx === plates.length - 1) return
    setShakenIdx(idx)
    setMsg({ text: "Can't reach me! I'm blocked by plates above!", color: '#8b5cf6' })
    setTimeout(() => {
      setShakenIdx(null)
      setMsg(null)
    }, 1500)
  }

  return (
    <div>
      {/* Input row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && push()}
          placeholder="Plate label (optional)"
          style={{
            padding: '10px 16px', borderRadius: 10, border: '2px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14,
            outline: 'none', minWidth: 180,
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={push}
          style={{
            padding: '10px 22px', borderRadius: 10, background: '#22c55e',
            color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
          }}
        >
          PUSH (add plate)
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={pop}
          style={{
            padding: '10px 22px', borderRadius: 10, background: '#ef4444',
            color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
          }}
        >
          POP (remove top)
        </motion.button>
      </div>

      {/* Message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: 'center', marginBottom: 14, padding: '10px 20px',
              borderRadius: 10, background: `${msg.color}15`,
              border: `1.5px solid ${msg.color}50`, color: msg.color,
              fontWeight: 700, fontSize: 14,
            }}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plate visual */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, alignItems: 'flex-end' }}>
        {/* Stack container */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 260 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 1,
          }}>
            CLICK MIDDLE PLATES TO TRY
          </div>
          <div style={{
            position: 'relative', display: 'flex', flexDirection: 'column-reverse',
            alignItems: 'center', minHeight: 240, justifyContent: 'flex-start',
          }}>
            <AnimatePresence>
              {plates.map((plate, idx) => {
                const isTop = idx === plates.length - 1
                return (
                  <motion.div
                    key={plate.id}
                    layout
                    initial={{ y: -80, opacity: 0, scale: 0.7 }}
                    animate={{
                      y: 0, opacity: 1, scale: 1,
                      x: shakenIdx === idx ? [0, -8, 8, -5, 5, 0] : 0,
                    }}
                    exit={{ y: -100, opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => handleMiddleClick(idx)}
                    style={{
                      width: 220 - (plates.length - 1 - idx) * 8,
                      height: 38,
                      borderRadius: 8,
                      background: plate.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 14,
                      boxShadow: isTop
                        ? `0 -4px 14px ${plate.color}80`
                        : `0 2px 6px rgba(0,0,0,0.18)`,
                      cursor: isTop ? 'default' : 'pointer',
                      border: isTop ? '2px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.2)',
                      position: 'relative',
                      marginTop: -2,
                      userSelect: 'none',
                    }}
                  >
                    {plate.value}
                    {isTop && (
                      <div style={{
                        position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                        fontSize: 11, color: plate.color, fontWeight: 800, whiteSpace: 'nowrap',
                        background: `${plate.color}18`, padding: '2px 8px', borderRadius: 6,
                        border: `1px solid ${plate.color}40`,
                      }}>
                        TOP (only accessible)
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {plates.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  width: 220, height: 38, borderRadius: 8,
                  border: '2px dashed var(--border)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
                }}
              >
                Empty Stack
              </motion.div>
            )}
          </div>
          {/* Table/base */}
          <div style={{
            width: 260, height: 14, borderRadius: '0 0 8px 8px',
            background: '#64748b', marginTop: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }} />
        </div>

        {/* Popped plate animation */}
        <AnimatePresence>
          {poppedPlate && (
            <motion.div
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: 80, y: -60, opacity: 0, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute',
                width: 180, height: 38, borderRadius: 8,
                background: poppedPlate.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 14,
                pointerEvents: 'none',
              }}
            >
              {poppedPlate.value}
            </motion.div>
          )}
        </AnimatePresence>

        {/* LIFO label */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 160,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ef444420, #f9731620)',
            border: '1.5px solid #ef444440',
            borderRadius: 12, padding: '12px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-heading)' }}>LIFO</div>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: 2 }}>
              Last In, First Out
            </div>
          </div>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13,
            color: 'var(--text-secondary)', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Stack size:</strong> {plates.length}
            <br />
            <strong style={{ color: 'var(--text-primary)' }}>Top:</strong> {plates.length > 0 ? plates[plates.length - 1].value : 'None'}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 20, padding: '12px 18px', borderRadius: 10,
        background: 'var(--bg-secondary)', textAlign: 'center',
        fontSize: 13, color: 'var(--text-muted)',
      }}>
        Plates in the middle are blocked — just like real stacks! You can ONLY interact with the top.
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 2 — Stack Operations Visualizer
================================================================ */
function StackOperationsViz() {
  const [stack, setStack] = useState([15, 7, 23])
  const [inputVal, setInputVal] = useState('')
  const [peekIdx, setPeekIdx] = useState(null)
  const [isEmptyFlash, setIsEmptyFlash] = useState(null)
  const [log, setLog] = useState([
    { op: 'INIT', result: 'Stack created with [15, 7, 23]', color: '#94a3b8' },
  ])
  const [poppingIdx, setPoppingIdx] = useState(null)
  const idRef = useRef(100)

  const addLog = (op, result, color) => {
    setLog(prev => [{ op, result, color, id: idRef.current++ }, ...prev.slice(0, 7)])
  }

  const doPush = () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 99) + 1
    if (stack.length >= 8) {
      addLog('PUSH ERROR', 'Stack overflow!', '#ef4444')
      return
    }
    setStack(prev => [...prev, val])
    addLog('PUSH', `push(${val}) → size now ${stack.length + 1}`, '#22c55e')
    setInputVal('')
  }

  const doPop = () => {
    if (stack.length === 0) {
      addLog('POP ERROR', 'Stack underflow!', '#ef4444')
      return
    }
    const top = stack[stack.length - 1]
    setPoppingIdx(stack.length - 1)
    setTimeout(() => {
      setStack(prev => prev.slice(0, -1))
      setPoppingIdx(null)
      addLog('POP', `pop() → returned ${top}, size now ${stack.length - 1}`, '#f97316')
    }, 400)
  }

  const doPeek = () => {
    if (stack.length === 0) {
      addLog('PEEK ERROR', 'Stack is empty!', '#ef4444')
      return
    }
    const top = stack[stack.length - 1]
    setPeekIdx(stack.length - 1)
    addLog('PEEK', `peek() → ${top} (not removed)`, '#3b82f6')
    setTimeout(() => setPeekIdx(null), 1500)
  }

  const doIsEmpty = () => {
    const empty = stack.length === 0
    setIsEmptyFlash(empty ? 'green' : 'red')
    addLog('IS_EMPTY', `isEmpty() → ${empty} (size: ${stack.length})`, empty ? '#22c55e' : '#ef4444')
    setTimeout(() => setIsEmptyFlash(null), 1200)
  }

  const operations = [
    { label: 'Push(value)', action: doPush, color: '#22c55e', desc: 'Add to top' },
    { label: 'Pop()', action: doPop, color: '#ef4444', desc: 'Remove top' },
    { label: 'Peek()', action: doPeek, color: '#3b82f6', desc: 'Look at top' },
    { label: 'isEmpty()', action: doIsEmpty, color: '#8b5cf6', desc: 'Check size' },
  ]

  const BOX_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#3b82f6', '#eab308', '#ef4444']

  return (
    <div>
      {/* Input + buttons */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doPush()}
          placeholder="Value to push (or random)"
          style={{
            padding: '10px 16px', borderRadius: 10, border: '2px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14,
            outline: 'none', width: 200,
          }}
        />
        {operations.map(op => (
          <motion.button
            key={op.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={op.action}
            style={{
              padding: '10px 18px', borderRadius: 10, background: op.color,
              color: 'white', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}
          >
            <span>{op.label}</span>
            <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 500 }}>{op.desc}</span>
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Stack visual */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 20,
          border: `2px solid ${isEmptyFlash === 'green' ? '#22c55e' : isEmptyFlash === 'red' ? '#ef4444' : 'var(--border)'}`,
          transition: 'border-color 0.3s',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Stack</div>
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 8, padding: '4px 12px',
              fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
            }}>
              size: {stack.length}
            </div>
          </div>

          <div style={{
            minHeight: 260, display: 'flex', flexDirection: 'column-reverse',
            justifyContent: 'flex-start', gap: 4,
          }}>
            <AnimatePresence>
              {stack.map((val, idx) => {
                const isTop = idx === stack.length - 1
                const isPopping = poppingIdx === idx
                const isPeeking = peekIdx === idx
                const color = BOX_COLORS[idx % BOX_COLORS.length]
                return (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    initial={{ y: -50, opacity: 0, scaleY: 0.3 }}
                    animate={{
                      y: 0, opacity: isPopping ? 0 : 1, scaleY: 1,
                      x: isPopping ? 60 : 0,
                      boxShadow: isPeeking ? `0 0 0 3px #3b82f6, 0 0 20px #3b82f640` : 'none',
                    }}
                    exit={{ y: -60, opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    style={{
                      height: 46, borderRadius: 10,
                      background: isPeeking ? `${color}dd` : color,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0 16px',
                      border: `1px solid ${color}60`,
                    }}
                  >
                    <span style={{ color: 'white', fontWeight: 800, fontSize: 18, fontFamily: 'monospace' }}>
                      {val}
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {isTop && (
                        <span style={{
                          background: 'rgba(255,255,255,0.25)', borderRadius: 6,
                          padding: '2px 8px', fontSize: 11, fontWeight: 700, color: 'white',
                        }}>
                          TOP
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                        [{idx}]
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {stack.length === 0 && (
              <div style={{
                height: 60, borderRadius: 10, border: '2px dashed var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: 14, fontWeight: 600,
              }}>
                Stack is empty
              </div>
            )}
          </div>

          {/* O(1) badge */}
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 10,
            background: '#22c55e12', border: '1px solid #22c55e30',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <div>
              <div style={{ fontWeight: 800, color: '#22c55e', fontSize: 14 }}>All operations: O(1)</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Push, Pop, Peek — all instant, no matter the size!</div>
            </div>
          </div>
        </div>

        {/* Operation log */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: 20,
          border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 14 }}>
            Operation Log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <AnimatePresence>
              {log.map((entry, i) => (
                <motion.div
                  key={entry.id ?? i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1 - i * 0.08, x: 0 }}
                  style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: i === 0 ? `${entry.color}18` : 'var(--bg-secondary)',
                    border: i === 0 ? `1.5px solid ${entry.color}40` : '1px solid transparent',
                    fontSize: 13,
                  }}
                >
                  <span style={{
                    fontFamily: 'monospace', fontWeight: 700,
                    color: entry.color, marginRight: 8,
                    fontSize: 12, letterSpacing: 0.5,
                  }}>
                    {entry.op}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.result}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 3 — Undo/Redo with Two Stacks
================================================================ */
function UndoRedo() {
  const [text, setText] = useState('Hello')
  const [undoStack, setUndoStack] = useState(['', 'H', 'He', 'Hel', 'Hell'])
  const [redoStack, setRedoStack] = useState([])
  const [lastAction, setLastAction] = useState(null)

  const handleType = (ch) => {
    if (text.length >= 20) return
    const newText = text + ch
    setUndoStack(prev => [...prev, text])
    setRedoStack([])
    setText(newText)
    setLastAction({ type: 'TYPE', char: ch, color: '#22c55e' })
    setTimeout(() => setLastAction(null), 800)
  }

  const handleUndo = () => {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack(r => [...r, text])
    setUndoStack(u => u.slice(0, -1))
    setText(prev)
    setLastAction({ type: 'UNDO', color: '#f97316' })
    setTimeout(() => setLastAction(null), 800)
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    setUndoStack(u => [...u, text])
    setRedoStack(r => r.slice(0, -1))
    setText(next)
    setLastAction({ type: 'REDO', color: '#3b82f6' })
    setTimeout(() => setLastAction(null), 800)
  }

  const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const StackColumn = ({ label, items, color, icon }) => (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 14, padding: 16, flex: 1,
      border: `1.5px solid ${color}30`, minWidth: 120,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
        fontWeight: 700, fontSize: 13, color,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        {label}
        <span style={{
          marginLeft: 'auto', background: `${color}20`,
          borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800,
        }}>
          {items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, minHeight: 140 }}>
        <AnimatePresence>
          {items.slice(-6).map((item, i) => {
            const isTop = i === Math.min(items.length, 6) - 1
            return (
              <motion.div
                key={`${label}-${i}-${item}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isTop ? 1 : 0.5 + i * 0.08, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  background: isTop ? color : `${color}25`,
                  borderRadius: 6, padding: '6px 10px',
                  fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
                  color: isTop ? 'white' : color,
                  border: isTop ? `1px solid ${color}` : '1px solid transparent',
                  textAlign: 'center',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span>"{item || '(empty)'}"</span>
                {isTop && <span style={{ fontSize: 10, opacity: 0.8 }}>TOP</span>}
              </motion.div>
            )
          })}
        </AnimatePresence>
        {items.length === 0 && (
          <div style={{
            textAlign: 'center', color: 'var(--text-muted)', fontSize: 12,
            padding: '20px 0', borderRadius: 8, border: '1.5px dashed var(--border)',
          }}>
            Empty
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      {/* Keyboard */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>
          Click letters to type, then try Undo/Redo!
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 10 }}>
          {KEYS.map(k => (
            <motion.button
              key={k}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleType(k)}
              style={{
                width: 34, height: 34, borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-primary)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              {k}
            </motion.button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: undoStack.length === 0 ? 'var(--bg-secondary)' : '#f97316',
              color: undoStack.length === 0 ? 'var(--text-muted)' : 'white',
              fontWeight: 700, fontSize: 14, border: 'none', cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Ctrl+Z Undo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: redoStack.length === 0 ? 'var(--bg-secondary)' : '#3b82f6',
              color: redoStack.length === 0 ? 'var(--text-muted)' : 'white',
              fontWeight: 700, fontSize: 14, border: 'none', cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Ctrl+Y Redo
          </motion.button>
        </div>
      </div>

      {/* Text + two stacks */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <StackColumn label="Undo Stack" items={undoStack} color="#f97316" icon="↩" />

        <div style={{ flex: 2, minWidth: 160 }}>
          {/* Current text */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: 20,
            border: '2px solid var(--accent)', textAlign: 'center', marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>
              CURRENT TEXT
            </div>
            <motion.div
              key={text}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: 26, fontWeight: 800, fontFamily: 'monospace',
                color: 'var(--text-primary)', letterSpacing: 2, minHeight: 40,
                borderBottom: '3px solid var(--accent)',
              }}
            >
              {text || ' '}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ borderRight: '3px solid var(--accent)', marginLeft: 2 }}
              />
            </motion.div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{text.length} characters</div>
          </div>

          {/* Action flash */}
          <AnimatePresence>
            {lastAction && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: `${lastAction.color}18`, border: `1.5px solid ${lastAction.color}50`,
                  borderRadius: 10, padding: '8px 14px', textAlign: 'center',
                  color: lastAction.color, fontWeight: 700, fontSize: 13,
                }}
              >
                {lastAction.type === 'TYPE' && `Typed "${lastAction.char}" → pushed to Undo stack`}
                {lastAction.type === 'UNDO' && 'Undo! Popped from Undo → pushed to Redo'}
                {lastAction.type === 'REDO' && 'Redo! Popped from Redo → pushed to Undo'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works */}
          <div style={{
            marginTop: 12, background: 'var(--bg-secondary)', borderRadius: 10,
            padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong> Every keystroke pushes the current text onto the Undo Stack. Ctrl+Z pops from Undo (saves to Redo). Ctrl+Y pops from Redo. This is <em>exactly</em> how Word, VSCode, Figma work!
          </div>
        </div>

        <StackColumn label="Redo Stack" items={redoStack} color="#3b82f6" icon="↪" />
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 4 — Bracket Matching Challenge
================================================================ */
function BracketChallenge() {
  const CHALLENGES = [
    { expr: '{[()]}', balanced: true },
    { expr: '{[(])}', balanced: false },
    { expr: '((()))', balanced: true },
    { expr: '({[}])', balanced: false },
    { expr: '[{()}[]]', balanced: true },
    { expr: '(()', balanced: false },
  ]

  const PAIRS = { ')': '(', ']': '[', '}': '{' }
  const OPENERS = new Set(['(', '[', '{'])
  const BRACKET_COLORS = {
    '(': '#3b82f6', ')': '#3b82f6',
    '[': '#8b5cf6', ']': '#8b5cf6',
    '{': '#f97316', '}': '#f97316',
  }

  const [challengeIdx, setChallengeIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [bStack, setBStack] = useState([])
  const [status, setStatus] = useState('playing') // playing | matched | mismatch | done
  const [mismatchChar, setMismatchChar] = useState(null)

  const challenge = CHALLENGES[challengeIdx]
  const chars = challenge.expr.split('')

  const reset = (idx) => {
    setChallengeIdx(idx)
    setCharIdx(0)
    setBStack([])
    setStatus('playing')
    setMismatchChar(null)
  }

  const step = () => {
    if (status !== 'playing') return
    const ch = chars[charIdx]
    const newIdx = charIdx + 1

    if (OPENERS.has(ch)) {
      setBStack(prev => [...prev, ch])
      setCharIdx(newIdx)
      if (newIdx === chars.length) {
        // end of string
        if (bStack.length + 1 === 0) setStatus('done')
        else setCharIdx(newIdx)
      }
    } else {
      // closing bracket
      if (bStack.length === 0 || bStack[bStack.length - 1] !== PAIRS[ch]) {
        setStatus('mismatch')
        setMismatchChar(ch)
        return
      }
      const newStack = bStack.slice(0, -1)
      setBStack(newStack)
      setCharIdx(newIdx)
      if (newIdx === chars.length) {
        setStatus(newStack.length === 0 ? 'done' : 'mismatch')
      }
    }
  }

  const statusConfig = {
    playing: { text: 'Step through the expression...', color: '#94a3b8', bg: 'var(--bg-secondary)' },
    mismatch: { text: 'MISMATCH! Brackets do not balance!', color: '#ef4444', bg: '#fef2f2' },
    done: { text: challenge.balanced ? 'BALANCED! Stack is empty at the end.' : 'NOT BALANCED! Stack still has items.', color: challenge.balanced ? '#22c55e' : '#ef4444', bg: challenge.balanced ? '#f0fdf4' : '#fef2f2' },
  }

  const current = statusConfig[status]

  return (
    <div>
      {/* Challenge selector */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        {CHALLENGES.map((c, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => reset(i)}
            style={{
              padding: '8px 16px', borderRadius: 10, fontFamily: 'monospace', fontWeight: 700,
              fontSize: 15, border: '2px solid',
              borderColor: challengeIdx === i ? 'var(--accent)' : 'var(--border)',
              background: challengeIdx === i ? 'var(--accent)' : 'var(--bg-card)',
              color: challengeIdx === i ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {c.expr}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Expression stepper */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)', fontSize: 15 }}>
            Expression
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
            {chars.map((ch, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i === charIdx && status === 'playing' ? 1.3 : 1,
                  background:
                    i < charIdx ? (status === 'mismatch' && i === charIdx - 1 ? '#ef444430' : '#22c55e25')
                      : i === charIdx && status === 'playing' ? `${BRACKET_COLORS[ch]}30` : 'var(--bg-secondary)',
                }}
                style={{
                  width: 40, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, fontFamily: 'monospace', fontWeight: 800,
                  color: i < charIdx
                    ? (status === 'mismatch' && i === charIdx - 1 ? '#ef4444' : '#22c55e')
                    : i === charIdx ? BRACKET_COLORS[ch] : 'var(--text-muted)',
                  border: i === charIdx && status === 'playing' ? `2px solid ${BRACKET_COLORS[ch]}` : '2px solid transparent',
                }}
              >
                {ch}
              </motion.div>
            ))}
          </div>

          {/* Step button */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: status === 'playing' && charIdx < chars.length ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={step}
              disabled={status !== 'playing' || charIdx >= chars.length}
              style={{
                padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                background: (status === 'playing' && charIdx < chars.length) ? 'var(--accent)' : 'var(--bg-secondary)',
                color: (status === 'playing' && charIdx < chars.length) ? 'white' : 'var(--text-muted)',
                border: 'none', cursor: (status === 'playing' && charIdx < chars.length) ? 'pointer' : 'not-allowed',
              }}
            >
              Step →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => reset(challengeIdx)}
              style={{
                padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >
              Reset
            </motion.button>
          </div>

          {/* Status */}
          <motion.div
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 10,
              background: current.bg, border: `1.5px solid ${current.color}40`,
              textAlign: 'center', color: current.color,
              fontWeight: 700, fontSize: 13,
            }}
          >
            {current.text}
          </motion.div>
        </div>

        {/* Bracket stack */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)', fontSize: 15 }}>
            Stack (push opening brackets)
          </div>
          <div style={{
            minHeight: 180, display: 'flex', flexDirection: 'column-reverse',
            gap: 4, justifyContent: 'flex-start',
          }}>
            <AnimatePresence>
              {bStack.map((ch, i) => (
                <motion.div
                  key={`${i}-${ch}`}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.8 }}
                  style={{
                    height: 42, borderRadius: 8, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, fontFamily: 'monospace', fontWeight: 800,
                    background: `${BRACKET_COLORS[ch]}25`,
                    color: BRACKET_COLORS[ch],
                    border: `2px solid ${BRACKET_COLORS[ch]}50`,
                  }}
                >
                  {ch}
                  {i === bStack.length - 1 && (
                    <span style={{ fontSize: 10, marginLeft: 8, fontFamily: 'sans-serif', opacity: 0.7 }}>TOP</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {bStack.length === 0 && (
              <div style={{
                height: 60, borderRadius: 10, border: '2px dashed var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: 13,
              }}>
                {status === 'done' && challenge.balanced ? 'Empty — Balanced!' : 'Push opening brackets here'}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['()', '#3b82f6'], ['[]', '#8b5cf6'], ['{}', '#f97316']].map(([pair, color]) => (
              <div key={pair} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`,
              }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color, fontSize: 14 }}>{pair}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>pair</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 16, padding: '12px 18px', borderRadius: 10,
        background: 'var(--bg-secondary)', fontSize: 13, color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-primary)' }}>The algorithm:</strong> Push opening brackets onto the stack. When you see a closing bracket, pop the stack and check if it matches. If it does not match, or the stack is empty when it should not be — the expression is NOT balanced.
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 5 — The Call Stack
================================================================ */
function CallStackViz() {
  const normalCalls = [
    { name: 'main()', color: '#6366f1', code: 'calls A()' },
    { name: 'A()', color: '#8b5cf6', code: 'calls B()' },
    { name: 'B()', color: '#ec4899', code: 'calls C()' },
    { name: 'C()', color: '#f97316', code: 'calls D()' },
    { name: 'D()', color: '#22c55e', code: 'returns 42' },
  ]

  const [callIdx, setCallIdx] = useState(0)
  const [mode, setMode] = useState('build') // build | unwind
  const [recursiveStack, setRecursiveStack] = useState([])
  const [crashed, setCrashed] = useState(false)
  const recRef = useRef(null)

  const visibleFrames = mode === 'build'
    ? normalCalls.slice(0, callIdx)
    : normalCalls.slice(0, Math.max(0, 5 - callIdx))

  const handleCallStep = () => {
    if (mode === 'build') {
      if (callIdx < normalCalls.length) {
        setCallIdx(c => c + 1)
      } else {
        setMode('unwind')
        setCallIdx(1)
      }
    } else {
      if (callIdx <= normalCalls.length) {
        setCallIdx(c => c + 1)
      }
    }
  }

  const resetCalls = () => {
    setMode('build')
    setCallIdx(0)
  }

  // Recursive stack overflow demo
  const startRecursion = () => {
    if (crashed) {
      setRecursiveStack([])
      setCrashed(false)
      return
    }
    let i = 0
    const interval = setInterval(() => {
      i++
      setRecursiveStack(prev => {
        if (prev.length >= 12) {
          clearInterval(interval)
          setCrashed(true)
          return prev
        }
        return [...prev, { id: i, name: `factorial(${20 - i})`, depth: i }]
      })
    }, 200)
    recRef.current = interval
  }

  useEffect(() => {
    return () => { if (recRef.current) clearInterval(recRef.current) }
  }, [])

  const stepLabel = () => {
    if (mode === 'build' && callIdx < normalCalls.length) return `Call ${normalCalls[callIdx].name}`
    if (mode === 'build' && callIdx === normalCalls.length) return 'Start Unwinding (return)'
    if (mode === 'unwind') return callIdx <= normalCalls.length ? 'Return from function' : 'Done!'
    return 'Done!'
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Normal call stack */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
            Function Call Stack
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            {mode === 'build' ? 'Functions pushing frames...' : 'Functions returning, frames popping...'}
          </div>

          <div style={{ minHeight: 220, display: 'flex', flexDirection: 'column-reverse', gap: 4 }}>
            <AnimatePresence>
              {visibleFrames.map((frame, i) => {
                const isTop = i === visibleFrames.length - 1
                return (
                  <motion.div
                    key={frame.name}
                    initial={{ opacity: 0, y: -30, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.7, transition: { duration: 0.3 } }}
                    style={{
                      height: 44, borderRadius: 8,
                      background: frame.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0 14px',
                    }}
                  >
                    <span style={{ color: 'white', fontWeight: 800, fontFamily: 'monospace', fontSize: 14 }}>
                      {frame.name}
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                        {frame.code}
                      </span>
                      {isTop && (
                        <span style={{
                          background: 'rgba(255,255,255,0.25)', borderRadius: 5,
                          padding: '2px 7px', fontSize: 10, fontWeight: 700, color: 'white',
                        }}>ACTIVE</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {visibleFrames.length === 0 && (
              <div style={{
                height: 60, borderRadius: 8, border: '2px dashed var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: 13,
              }}>
                {mode === 'unwind' && callIdx > normalCalls.length ? 'All functions returned!' : 'Call stack empty'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCallStep}
              disabled={mode === 'unwind' && callIdx > normalCalls.length}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              {stepLabel()}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetCalls}
              style={{
                padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >
              Reset
            </motion.button>
          </div>
        </div>

        {/* Stack overflow demo */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 14, padding: 20,
          border: `2px solid ${crashed ? '#ef4444' : 'var(--border)'}`,
          transition: 'border-color 0.3s',
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
            Stack Overflow Demo
          </div>
          <div style={{
            fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5,
          }}>
            A recursive function that never returns — the stack grows until it CRASHES
          </div>

          <div style={{
            fontFamily: 'monospace', fontSize: 12, background: '#1e293b',
            borderRadius: 8, padding: 12, marginBottom: 14, color: '#e2e8f0', lineHeight: 1.8,
          }}>
            <span style={{ color: '#7c3aed' }}>function</span>{' '}
            <span style={{ color: '#38bdf8' }}>factorial</span>
            <span style={{ color: '#f1f5f9' }}>(n) {'{'}</span>
            <br />
            {'  '}<span style={{ color: '#f97316' }}>{'// Missing base case!'}</span>
            <br />
            {'  '}<span style={{ color: '#7c3aed' }}>return</span>{' '}n *{' '}
            <span style={{ color: '#38bdf8' }}>factorial</span>(n - 1)
            <br />
            {'}'}
          </div>

          <div style={{ minHeight: 160, display: 'flex', flexDirection: 'column-reverse', gap: 2, marginBottom: 12, overflow: 'hidden' }}>
            <AnimatePresence>
              {recursiveStack.map((frame) => (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    height: crashed ? 8 : 24, borderRadius: 4,
                    background: `hsl(${330 - frame.depth * 10}, 80%, 55%)`,
                    display: 'flex', alignItems: 'center',
                    padding: '0 8px', fontSize: 11, fontFamily: 'monospace',
                    color: 'white', fontWeight: 700,
                    transition: 'height 0.3s',
                  }}
                >
                  {!crashed && frame.name}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {crashed && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: '#fef2f2', border: '2px solid #ef4444',
                borderRadius: 10, padding: '12px 16px', textAlign: 'center',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 24 }}>💥</div>
              <div style={{ fontWeight: 800, color: '#ef4444', fontSize: 15, marginTop: 4 }}>
                STACK OVERFLOW!
              </div>
              <div style={{ fontSize: 12, color: '#9f1239', marginTop: 4 }}>
                This is EXACTLY why it is called a stack overflow! The call stack ran out of memory.
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecursion}
            style={{
              width: '100%', padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              background: crashed ? '#22c55e' : '#ef4444', color: 'white', border: 'none', cursor: 'pointer',
            }}
          >
            {crashed ? 'Reset Demo' : recursiveStack.length === 0 ? 'Start Infinite Recursion' : 'Keep Going...'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 6 — Stack Applications Gallery
================================================================ */
function StackApplications() {
  const [activeApp, setActiveApp] = useState(0)

  const apps = [
    {
      title: 'Browser Back Button',
      icon: '🌐',
      color: '#3b82f6',
      description: 'Every URL you visit gets pushed. Back button pops the stack.',
      demo: <BrowserBackDemo />,
    },
    {
      title: 'Expression Evaluation',
      icon: '🧮',
      color: '#8b5cf6',
      description: 'Operators and operands are managed with two stacks for precedence.',
      demo: <ExpressionDemo />,
    },
    {
      title: 'Syntax Parsing (HTML)',
      icon: '📝',
      color: '#f97316',
      description: 'HTML tags must open and close in matching order — just like bracket matching!',
      demo: <HtmlParserDemo />,
    },
    {
      title: 'Maze Solving (DFS)',
      icon: '🧩',
      color: '#22c55e',
      description: 'Depth-First Search uses a stack to explore and backtrack through a maze.',
      demo: <MazeDemo />,
    },
  ]

  return (
    <div>
      {/* App tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {apps.map((app, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveApp(i)}
            style={{
              padding: '10px 18px', borderRadius: 12, border: '2px solid',
              borderColor: activeApp === i ? app.color : 'var(--border)',
              background: activeApp === i ? app.color : 'var(--bg-card)',
              color: activeApp === i ? 'white' : 'var(--text-primary)',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            <span style={{ fontSize: 16 }}>{app.icon}</span>
            {app.title}
          </motion.button>
        ))}
      </div>

      {/* Active demo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeApp}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: 24,
            border: `2px solid ${apps[activeApp].color}30`,
          }}
        >
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${apps[activeApp].color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              {apps[activeApp].icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {apps[activeApp].title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {apps[activeApp].description}
              </div>
            </div>
          </div>
          {apps[activeApp].demo}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* Sub-demos for the gallery */
function BrowserBackDemo() {
  const PAGES = ['google.com', 'github.com', 'youtube.com', 'stackoverflow.com', 'reddit.com']
  const [history, setHistory] = useState(['google.com', 'github.com'])
  const [current, setCurrent] = useState('youtube.com')
  const [future, setFuture] = useState([])

  const visit = (page) => {
    setHistory(h => [...h, current])
    setCurrent(page)
    setFuture([])
  }

  const goBack = () => {
    if (history.length === 0) return
    setFuture(f => [...f, current])
    setCurrent(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
  }

  const goForward = () => {
    if (future.length === 0) return
    setHistory(h => [...h, current])
    setCurrent(future[future.length - 1])
    setFuture(f => f.slice(0, -1))
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {PAGES.map(p => (
          <motion.button key={p} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => visit(p)}
            style={{
              padding: '6px 14px', borderRadius: 8, background: current === p ? '#3b82f6' : 'var(--bg-secondary)',
              color: current === p ? 'white' : 'var(--text-primary)', fontWeight: 600, fontSize: 12,
              border: '1px solid var(--border)', cursor: 'pointer',
            }}>
            {p}
          </motion.button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={goBack}
          disabled={history.length === 0}
          style={{
            padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13,
            background: history.length === 0 ? 'var(--bg-secondary)' : '#3b82f6',
            color: history.length === 0 ? 'var(--text-muted)' : 'white',
            border: 'none', cursor: history.length === 0 ? 'not-allowed' : 'pointer',
          }}>
          ← Back
        </motion.button>
        <div style={{
          flex: 1, background: '#3b82f620', borderRadius: 8, padding: '8px 14px',
          fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#3b82f6', textAlign: 'center',
        }}>
          {current}
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={goForward}
          disabled={future.length === 0}
          style={{
            padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13,
            background: future.length === 0 ? 'var(--bg-secondary)' : '#3b82f6',
            color: future.length === 0 ? 'var(--text-muted)' : 'white',
            border: 'none', cursor: future.length === 0 ? 'not-allowed' : 'pointer',
          }}>
          Forward →
        </motion.button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', marginBottom: 6 }}>BACK STACK</div>
          {history.slice(-4).map((p, i) => (
            <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', padding: '2px 0' }}>{p}</div>
          ))}
          {history.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>empty</div>}
        </div>
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', marginBottom: 6 }}>FORWARD STACK</div>
          {future.slice(-4).map((p, i) => (
            <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', padding: '2px 0' }}>{p}</div>
          ))}
          {future.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>empty</div>}
        </div>
      </div>
    </div>
  )
}

function ExpressionDemo() {
  const expressions = ['2 + 3', '2 + 3 * 4', '(2 + 3) * 4', '10 - 2 * 3 + 1']
  const results = [5, 14, 20, 5]
  const [sel, setSel] = useState(0)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {expressions.map((e, i) => (
          <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSel(i)}
            style={{
              padding: '8px 14px', borderRadius: 8, fontFamily: 'monospace', fontWeight: 700, fontSize: 14,
              background: sel === i ? '#8b5cf6' : 'var(--bg-secondary)',
              color: sel === i ? 'white' : 'var(--text-primary)',
              border: sel === i ? 'none' : '1px solid var(--border)', cursor: 'pointer',
            }}>
            {e}
          </motion.button>
        ))}
      </div>
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 12, padding: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: '#8b5cf6' }}>
            {expressions[sel]}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Two stacks: one for numbers, one for operators. Respects precedence (* before +)
          </div>
        </div>
        <div style={{
          background: '#8b5cf620', borderRadius: 10, padding: '12px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700 }}>RESULT</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: '#8b5cf6' }}>
            {results[sel]}
          </div>
        </div>
      </div>
    </div>
  )
}

function HtmlParserDemo() {
  const examples = [
    { html: '<div><p>Hello</p></div>', valid: true },
    { html: '<div><p>Oops</div></p>', valid: false },
    { html: '<section><h1>Title</h1></section>', valid: true },
    { html: '<div><span>', valid: false },
  ]
  const [sel, setSel] = useState(0)
  const ex = examples[sel]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {examples.map((e, i) => (
          <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSel(i)}
            style={{
              padding: '6px 12px', borderRadius: 8, fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
              background: sel === i ? '#f97316' : 'var(--bg-secondary)',
              color: sel === i ? 'white' : 'var(--text-primary)',
              border: sel === i ? 'none' : '1px solid var(--border)', cursor: 'pointer',
            }}>
            {e.html.slice(0, 20)}...
          </motion.button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{
          flex: 1, background: '#1e293b', borderRadius: 10, padding: '14px 16px',
          fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0', lineHeight: 1.8,
        }}>
          {ex.html}
        </div>
        <motion.div
          key={sel}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          style={{
            padding: '14px 20px', borderRadius: 12, textAlign: 'center',
            background: ex.valid ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${ex.valid ? '#22c55e' : '#ef4444'}`,
          }}
        >
          <div style={{ fontSize: 28 }}>{ex.valid ? '✓' : '✗'}</div>
          <div style={{ fontWeight: 800, color: ex.valid ? '#22c55e' : '#ef4444', fontSize: 14 }}>
            {ex.valid ? 'VALID' : 'INVALID'}
          </div>
        </motion.div>
      </div>
      <div style={{
        marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-secondary)',
        fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        Opening tags are pushed onto the stack. Closing tags must match the top — exactly like bracket matching!
      </div>
    </div>
  )
}

function MazeDemo() {
  const MAZE = [
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 0, 1, 2],
  ]
  const [visited, setVisited] = useState(new Set(['0,0']))
  const [stackPath, setStackPath] = useState([[0, 0]])
  const [found, setFound] = useState(false)

  const step = () => {
    if (found || stackPath.length === 0) return
    const curr = stackPath[stackPath.length - 1]
    const [r, c] = curr
    if (MAZE[r][c] === 2) { setFound(true); return }

    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
    let pushed = false
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      const key = `${nr},${nc}`
      if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && MAZE[nr][nc] !== 1 && !visited.has(key)) {
        setVisited(v => new Set([...v, key]))
        setStackPath(p => [...p, [nr, nc]])
        pushed = true
        break
      }
    }
    if (!pushed) {
      setStackPath(p => p.slice(0, -1))
    }
  }

  const reset = () => {
    setVisited(new Set(['0,0']))
    setStackPath([[0, 0]])
    setFound(false)
  }

  const isInPath = (r, c) => stackPath.some(([pr, pc]) => pr === r && pc === c)
  const isCurrent = (r, c) => {
    const top = stackPath[stackPath.length - 1]
    return top && top[0] === r && top[1] === c
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Maze grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 44px)',
          gap: 4, background: 'var(--bg-card)', padding: 12, borderRadius: 12,
          border: '1px solid var(--border)',
        }}>
          {MAZE.flat().map((cell, i) => {
            const r = Math.floor(i / 5), c = i % 5
            const curr = isCurrent(r, c)
            const inPath = isInPath(r, c)
            const vis = visited.has(`${r},${c}`)
            return (
              <motion.div key={i}
                animate={{ scale: curr ? 1.1 : 1 }}
                style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: cell === 1 ? '#374151' : cell === 2 ? '#fbbf24' : curr ? '#22c55e' : inPath ? '#22c55e40' : vis ? '#3b82f620' : 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: curr ? 16 : 12, fontWeight: 700,
                  border: cell === 2 ? '2px solid #fbbf24' : curr ? '2px solid #22c55e' : '1px solid var(--border)',
                }}>
                {cell === 1 ? '▓' : cell === 2 ? '🏁' : curr ? '●' : r === 0 && c === 0 ? '▶' : ''}
              </motion.div>
            )
          })}
        </div>

        {/* Stack */}
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 8 }}>DFS STACK</div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 3, minHeight: 120, marginBottom: 12 }}>
            {stackPath.slice(-6).map(([r, c], i) => (
              <div key={i} style={{
                background: i === Math.min(stackPath.length, 6) - 1 ? '#22c55e' : '#22c55e20',
                borderRadius: 6, padding: '5px 10px', fontSize: 12, fontFamily: 'monospace',
                fontWeight: 700, color: i === Math.min(stackPath.length, 6) - 1 ? 'white' : '#22c55e',
                textAlign: 'center',
              }}>
                ({r},{c})
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={step}
              disabled={found}
              style={{
                flex: 1, padding: '8px', borderRadius: 8, fontWeight: 700, fontSize: 12,
                background: found ? '#22c55e' : 'var(--accent)', color: 'white', border: 'none', cursor: found ? 'default' : 'pointer',
              }}>
              {found ? 'Found!' : 'Step'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={reset}
              style={{
                padding: '8px 12px', borderRadius: 8, fontWeight: 700, fontSize: 12,
                background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}>
              Reset
            </motion.button>
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 12, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
        padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8,
      }}>
        DFS pushes the current cell onto the stack, explores a neighbor, and backtracks (pops) when stuck. Stack = the current path through the maze.
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic9Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Intro Neuron */}
      <Neuron
        mood="excited"
        size="medium"
        message="Stacks are one of the most satisfying data structures — everything clicks into place once you feel that LIFO rhythm. Push. Pop. Push. Pop. You already use stacks dozens of times a day without knowing it!"
        style={{ marginBottom: 16 }}
      />

      {/* ---- Section 1: The Plate Stack ---- */}
      <SectionBlock icon="🍽️" title="The Plate Stack" color="#ef4444">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.7 }}>
          Imagine a stack of plates in a cafeteria. You always add to the top. You always take from the top.
          You can NEVER grab a plate from the middle — the plates above it are in the way.
          This is exactly how a <strong style={{ color: 'var(--text-primary)' }}>Stack</strong> works:
          <strong style={{ color: '#ef4444' }}> Last In, First Out (LIFO)</strong>.
        </p>

        <HindiExplainer
          concept="Stack = थाली का ढेर"
          english="Stack — Last In, First Out"
          explanation="Stack को समझने का सबसे आसान तरीका है थालियों का ढेर! जो थाली सबसे आखिरी में रखी, वही सबसे पहले उठानी पड़ेगी। बीच वाली थाली तक पहुंचना impossible है — ऊपर की थालियाँ रोकती हैं।"
          example="भारतीय घरों में रोटी का डब्बा सोचो — गर्म रोटियाँ ऊपर रखी जाती हैं और खाते वक्त ऊपर से ही उठाते हैं। यही LIFO है! जो last में आया (गर्म रोटी), वो first निकला।"
          terms={[
            { hindi: 'स्टैक', english: 'Stack', meaning: 'एक के ऊपर एक रखी चीज़ों का ढेर — सिर्फ ऊपर से access' },
            { hindi: 'LIFO', english: 'Last In, First Out', meaning: 'जो सबसे बाद में आया, वो सबसे पहले निकलेगा' },
            { hindi: 'पुश', english: 'Push', meaning: 'Stack के ऊपर नई चीज़ डालना' },
            { hindi: 'पॉप', english: 'Pop', meaning: 'Stack के ऊपर से चीज़ निकालना' },
          ]}
        />

        <InteractiveDemo
          title="Plate Stack Playground"
          instruction="Push plates onto the stack, pop from the top. Try clicking a middle plate — it will shake and refuse!"
        >
          <PlateStack />
        </InteractiveDemo>

        <NeuronTip type="simple">
          <strong>Remember LIFO with this:</strong> The last person to enter an elevator usually stands closest to the door and exits first. That is LIFO in real life!
        </NeuronTip>
      </SectionBlock>

      {/* ---- Section 2: Stack Operations Visualizer ---- */}
      <SectionBlock icon="⚙️" title="Stack Operations Visualizer" color="#6366f1">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.7 }}>
          A stack supports exactly <strong style={{ color: 'var(--text-primary)' }}>4 operations</strong>, and every single one is <strong style={{ color: '#22c55e' }}>O(1)</strong> — instant, no matter how many items are in the stack.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { op: 'push(x)', desc: 'Add x to the top', color: '#22c55e', complexity: 'O(1)' },
            { op: 'pop()', desc: 'Remove and return top', color: '#ef4444', complexity: 'O(1)' },
            { op: 'peek()', desc: 'View top without removing', color: '#3b82f6', complexity: 'O(1)' },
            { op: 'isEmpty()', desc: 'Returns true if empty', color: '#8b5cf6', complexity: 'O(1)' },
          ].map(item => (
            <div key={item.op} style={{
              background: `${item.color}10`, border: `1.5px solid ${item.color}30`,
              borderRadius: 12, padding: '14px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: item.color, marginBottom: 6 }}>
                {item.op}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                {item.desc}
              </div>
              <div style={{
                background: item.color, color: 'white', borderRadius: 6,
                padding: '3px 10px', fontSize: 12, fontWeight: 800, fontFamily: 'monospace',
                display: 'inline-block',
              }}>
                {item.complexity}
              </div>
            </div>
          ))}
        </div>

        <InteractiveDemo
          title="Live Stack Operations"
          instruction="Try all four operations. Watch the stack grow and shrink. Every operation is O(1)!"
        >
          <StackOperationsViz />
        </InteractiveDemo>

        <NeuronTip type="tip">
          Why is stack O(1)? Because you only ever touch the TOP. No searching, no shifting — just peek at the one element on top. This is why stacks are blazing fast.
        </NeuronTip>
      </SectionBlock>

      {/* ---- Section 3: Undo/Redo ---- */}
      <SectionBlock icon="↩️" title="Undo/Redo — Stacks in Action" color="#f97316">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.7 }}>
          Press <strong>Ctrl+Z</strong> in Word, VSCode, Figma, Photoshop — they all use the same trick: two stacks!
          Every action pushes to the <strong style={{ color: '#f97316' }}>Undo Stack</strong>. Ctrl+Z pops from it
          (and pushes to the <strong style={{ color: '#3b82f6' }}>Redo Stack</strong>). Ctrl+Y reverses this.
          Elegant, fast, and built on one of the simplest data structures.
        </p>

        <HindiExplainer
          concept="Ctrl+Z = Stack का जादू"
          english="Undo/Redo using Two Stacks"
          explanation="जब तुम Word में टाइप करते हो, हर character एक undo stack पर push होता है। Ctrl+Z दबाओ तो वो character pop हो जाता है और redo stack पर चला जाता है। Ctrl+Y दबाओ तो redo stack से वापस आ जाता है।"
          example="सोचो किसी ने 5 रोटियाँ बनाकर रखी हैं (Undo Stack)। एक-एक वापस उठाकर Redo Plate पर रखते जाओ — यही Ctrl+Z है!"
          terms={[
            { hindi: 'अनडू स्टैक', english: 'Undo Stack', meaning: 'पिछले सभी actions का इतिहास' },
            { hindi: 'रीडू स्टैक', english: 'Redo Stack', meaning: 'Undo किए गए actions का स्टैक' },
          ]}
        />

        <InteractiveDemo
          title="Text Editor Undo/Redo"
          instruction="Click letters to type. Use Ctrl+Z and Ctrl+Y buttons to undo and redo. Watch both stacks change!"
        >
          <UndoRedo />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 4: Bracket Matching ---- */}
      <SectionBlock icon="🔧" title="Bracket Matching Challenge" color="#3b82f6">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.7 }}>
          One of the most famous stack problems in coding interviews: <strong style={{ color: 'var(--text-primary)' }}>Is this expression balanced?</strong>
          {' '}<code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, fontSize: 14 }}>{'{[()]}'}</code> is balanced.
          {' '}<code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, fontSize: 14 }}>{'{[(])'}</code> is not.
          The stack makes this trivially easy to detect.
        </p>

        <HindiExplainer
          concept="Bracket Matching = Stack की परीक्षा"
          english="Balanced Brackets using Stack"
          explanation="Opening brackets को stack पर push करो। जब closing bracket मिले, stack से pop करो और check करो — क्या ये match करते हैं? अगर end में stack empty है तो balanced, वरना नहीं।"
          example="जैसे जूते का जोड़ा — बाएं जूते के बाद दायां जूता आना चाहिए। अगर बाएं जूते के बाद बाईं चप्पल आए, तो mismatch है!"
          terms={[
            { hindi: 'संतुलित', english: 'Balanced', meaning: 'सभी opening brackets को matching closing brackets मिले' },
            { hindi: 'मेल नहीं', english: 'Mismatch', meaning: 'गलत bracket type या क्रम में आया' },
          ]}
        />

        <InteractiveDemo
          title="Bracket Matcher"
          instruction="Select an expression, then click Step to walk through it character by character. Watch the stack build up and validate!"
        >
          <BracketChallenge />
        </InteractiveDemo>

        <NeuronTip type="example">
          This exact algorithm is used in every code editor (VSCode, IntelliJ) to show red squiggles when you forget to close a bracket. Compilers use it too — syntax errors are detected by a bracket-matching stack!
        </NeuronTip>
      </SectionBlock>

      {/* ---- Section 5: The Call Stack ---- */}
      <SectionBlock icon="📞" title="The Call Stack" color="#ec4899">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.7 }}>
          Every time your program calls a function, the computer creates a <strong style={{ color: 'var(--text-primary)' }}>stack frame</strong> — a chunk of memory
          holding local variables, parameters, and where to return when the function finishes. These frames stack up.
          When a function returns, its frame is popped. This is the <strong style={{ color: '#ec4899' }}>call stack</strong> — and it literally runs on a hardware stack!
          Stack Overflow? That is when too many function calls pile up and the stack runs out of memory.
        </p>

        <HindiExplainer
          concept="Call Stack = Function Calls का ढेर"
          english="Call Stack — How Functions Work"
          explanation="जब function A, function B को call करता है, और B, function C को — तो computer एक stack बनाता है जिसमें A नीचे है, B बीच में है, C ऊपर है। जब C complete हो जाए, तो pop होता है और B वापस चलने लगता है।"
          example="Inception movie जैसे — dream के अंदर dream के अंदर dream। सबसे अंदर वाला dream पहले खत्म होता है, फिर उसके ऊपर वाला। यही call stack है!"
          terms={[
            { hindi: 'स्टैक फ्रेम', english: 'Stack Frame', meaning: 'एक function call का memory block' },
            { hindi: 'स्टैक ओवरफ्लो', english: 'Stack Overflow', meaning: 'बहुत ज़्यादा functions call होने से memory भर गई' },
            { hindi: 'रिकर्शन', english: 'Recursion', meaning: 'Function खुद को ही call करे' },
          ]}
        />

        <InteractiveDemo
          title="Call Stack Visualizer"
          instruction="Step through function calls to see frames push onto the stack. Then watch them pop as functions return. Try the Stack Overflow demo on the right!"
        >
          <CallStackViz />
        </InteractiveDemo>

        <NeuronTip type="fun">
          The website StackOverflow.com is named after this exact phenomenon — when programmers get stuck, their questions are about programs whose call stacks overflowed! The name is a nod to recursion bugs.
        </NeuronTip>
      </SectionBlock>

      {/* ---- Section 6: Applications Gallery ---- */}
      <SectionBlock icon="🌟" title="Stack Applications Gallery" color="#22c55e">
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '0 0 20px 0', lineHeight: 1.7 }}>
          Stacks show up everywhere. Browser history, expression evaluators, syntax parsers, maze solvers — all powered by the same simple LIFO idea.
          Explore each application below.
        </p>

        <InteractiveDemo
          title="Real-World Stacks"
          instruction="Click each application to see an interactive demo of how stacks power it."
        >
          <StackApplications />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 7: Hindi Summary ---- */}
      <SectionBlock icon="📚" title="Summary — What Did We Learn?" color="#8b5cf6">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { title: 'LIFO', desc: 'Last In, First Out — the defining property of a stack', icon: '🔄', color: '#ef4444' },
            { title: 'O(1) Everything', desc: 'Push, Pop, Peek, isEmpty — all instant operations', icon: '⚡', color: '#22c55e' },
            { title: 'Undo/Redo', desc: 'Two stacks power every text editor\'s undo history', icon: '↩️', color: '#f97316' },
            { title: 'Brackets & Tags', desc: 'Stack validates balanced brackets and HTML tags', icon: '🔧', color: '#3b82f6' },
            { title: 'Call Stack', desc: 'Every function call is a stack frame — recursion too!', icon: '📞', color: '#ec4899' },
            { title: 'DFS & More', desc: 'Maze solving, expression evaluation, browser history', icon: '🧩', color: '#8b5cf6' },
          ].map(item => (
            <div key={item.title} style={{
              background: `${item.color}10`, border: `1.5px solid ${item.color}25`,
              borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: item.color, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <HindiExplainer
          concept="Stack का पूरा सार"
          english="Stack — Complete Summary in Hindi"
          explanation="Stack = plate का pile. जो last में रखोगे, वो pehle nikaloge — यही LIFO है। Stack में सिर्फ 4 काम होते हैं: Push (डालो), Pop (निकालो), Peek (झांको), isEmpty (खाली है?)। सब O(1) हैं यानी बिजली की तरह fast! Ctrl+Z (undo) bhi stack use karta hai — har keystroke push hoti hai, undo karo to pop hoti hai। Browser ka back button bhi stack hai — har website push hoti hai, back karo to pop। Function calls bhi stack pe stack hoti hain — isliye zyada recursion hogi to 'Stack Overflow' crash hoga।"
          example="Maggi banate waqt sochte ho — pehle paani dala, phir masala, phir noodles. Agar kuch galat hua to undo karo: pehle noodles nikalo, phir masala, phir paani. LIFO!"
          terms={[
            { hindi: 'स्टैक', english: 'Stack', meaning: 'ढेर/थाली का pile — LIFO structure' },
            { hindi: 'पुश', english: 'Push', meaning: 'ऊपर से डालो — O(1)' },
            { hindi: 'पॉप', english: 'Pop', meaning: 'ऊपर से निकालो — O(1)' },
            { hindi: 'LIFO', english: 'Last In, First Out', meaning: 'अंतिम अंदर, पहले बाहर' },
            { hindi: 'स्टैक ओवरफ्लो', english: 'Stack Overflow', meaning: 'Stack की memory भर गई — recursion crash' },
            { hindi: 'कॉल स्टैक', english: 'Call Stack', meaning: 'Function calls का hardware stack' },
          ]}
        />

        <Neuron
          mood="waving"
          size="small"
          message="You have now mastered Stacks! Next up: Queues — the fair version of a stack where the FIRST person in line gets served first. Same idea, opposite order!"
          style={{ marginTop: 20 }}
        />
      </SectionBlock>

    </div>
  )
}
