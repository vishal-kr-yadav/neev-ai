import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 2 — Arrays & How Memory Works
   Think Like a Programmer — Visual-First DSA Course
================================================================ */

/* ---- Section 1: Memory as a Hotel ---- */
function MemoryHotel() {
  const BASE_ADDR = 100
  const TOTAL_ROOMS = 16
  const [rooms, setRooms] = useState(() =>
    Array.from({ length: TOTAL_ROOMS }, (_, i) => ({ addr: BASE_ADDR + i, value: null }))
  )
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [lastStored, setLastStored] = useState(null)
  const [highlight, setHighlight] = useState(null)

  const presets = [
    { label: 'Store 42 at 105', addr: 105, val: 42 },
    { label: 'Store "Hi" at 108', addr: 108, val: '"Hi"' },
    { label: 'Store 3.14 at 112', addr: 112, val: 3.14 },
    { label: 'Store 99 at 100', addr: 100, val: 99 },
  ]

  const storeValue = (addr, value) => {
    const idx = addr - BASE_ADDR
    if (idx < 0 || idx >= TOTAL_ROOMS) return
    setRooms(prev => prev.map((r, i) => i === idx ? { ...r, value } : r))
    setLastStored({ addr, value })
    setHighlight(addr)
    setTimeout(() => setHighlight(null), 1500)
  }

  const clearRoom = (addr) => {
    const idx = addr - BASE_ADDR
    setRooms(prev => prev.map((r, i) => i === idx ? { ...r, value: null } : r))
  }

  return (
    <div>
      <Neuron
        mood="explaining"
        size="medium"
        message="Think of RAM (computer memory) as a hotel. Each room has a unique ADDRESS (room number). You store exactly ONE value per room. The address is HOW the CPU finds your data — like a hotel key!"
        style={{ marginBottom: 28 }}
      />

      {/* Hotel building visual */}
      <div style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 20,
        padding: '24px 20px',
        border: '2px solid #334155',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Hotel sign */}
        <motion.div
          animate={{ boxShadow: ['0 0 10px #6366f1', '0 0 30px #6366f1', '0 0 10px #6366f1'] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            textAlign: 'center',
            marginBottom: 20,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: 12,
            padding: '10px 24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            margin: '0 auto 20px',
            display: 'block',
          }}
        >
          <span style={{ color: 'white', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-heading)', letterSpacing: 1 }}>
            🏨  RAM HOTEL  — 16 Rooms
          </span>
        </motion.div>

        {/* Room grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 8,
        }}>
          {rooms.map((room) => (
            <motion.div
              key={room.addr}
              onClick={() => setSelectedRoom(room.addr === selectedRoom ? null : room.addr)}
              animate={highlight === room.addr ? {
                scale: [1, 1.15, 1],
                boxShadow: ['0 0 0px #fbbf24', '0 0 24px #fbbf24', '0 0 0px #fbbf24'],
              } : {}}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.07, y: -2 }}
              style={{
                background: room.value !== null
                  ? 'linear-gradient(135deg, #fbbf2420, #f59e0b15)'
                  : 'linear-gradient(135deg, #1e293b, #1a2035)',
                border: selectedRoom === room.addr
                  ? '2px solid #fbbf24'
                  : room.value !== null
                    ? '2px solid #fbbf2466'
                    : '2px solid #334155',
                borderRadius: 10,
                padding: '8px 4px',
                cursor: 'pointer',
                textAlign: 'center',
                minHeight: 72,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transition: 'border 0.2s',
              }}
            >
              {/* Room number (address) */}
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#94a3b8',
                fontFamily: 'monospace',
                background: '#0f172a',
                padding: '2px 6px',
                borderRadius: 4,
              }}>
                {room.addr}
              </div>
              {/* Stored value */}
              <AnimatePresence>
                {room.value !== null && (
                  <motion.div
                    key={String(room.value)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#fbbf24',
                      fontFamily: 'monospace',
                    }}
                  >
                    {String(room.value)}
                  </motion.div>
                )}
              </AnimatePresence>
              {room.value === null && (
                <div style={{ fontSize: 10, color: '#475569' }}>empty</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Selected room detail */}
        <AnimatePresence>
          {selectedRoom !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                marginTop: 16,
                background: '#1e293b',
                border: '1.5px solid #fbbf2440',
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Selected Room</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
                  Address: {selectedRoom}
                </div>
                <div style={{ fontSize: 14, color: '#cbd5e1', marginTop: 2 }}>
                  Contains: <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    {rooms[selectedRoom - BASE_ADDR]?.value !== null ? String(rooms[selectedRoom - BASE_ADDR].value) : '(empty)'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Enter value..."
                  style={{
                    padding: '8px 14px', borderRadius: 8,
                    border: '1.5px solid #475569',
                    background: '#0f172a', color: '#f8fafc',
                    fontSize: 14, fontFamily: 'monospace', outline: 'none',
                    width: 130,
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { if (inputValue.trim()) { storeValue(selectedRoom, inputValue.trim()); setInputValue('') } }}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: 'white', fontWeight: 700, fontSize: 13,
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  Store
                </motion.button>
                {rooms[selectedRoom - BASE_ADDR]?.value !== null && (
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => clearRoom(selectedRoom)}
                    style={{
                      padding: '8px 14px', borderRadius: 8,
                      background: '#7f1d1d', color: '#fca5a5',
                      fontWeight: 700, fontSize: 13,
                      border: '1px solid #ef444440', cursor: 'pointer',
                    }}
                  >
                    Clear
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick-store presets */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Quick demos:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {presets.map((p, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => storeValue(p.addr, p.val)}
              style={{
                padding: '8px 16px', borderRadius: 20,
                background: 'linear-gradient(135deg, #1e293b, #1a2035)',
                border: '1.5px solid #4f46e5',
                color: '#a5b4fc', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', fontFamily: 'monospace',
              }}
            >
              {p.label}
            </motion.button>
          ))}
        </div>
      </div>

      {lastStored && (
        <motion.div
          key={JSON.stringify(lastStored)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            marginTop: 14,
            background: '#052e16',
            border: '1px solid #166534',
            borderRadius: 10,
            padding: '10px 16px',
            fontSize: 14,
            color: '#86efac',
            fontFamily: 'monospace',
          }}
        >
          ✓ Stored <strong>{String(lastStored.value)}</strong> at address <strong>{lastStored.addr}</strong>
        </motion.div>
      )}

      <NeuronTip type="tip">
        The CPU finds data by address — like asking hotel reception "Give me room 105." No searching needed — direct jump to the address. This is why memory access is <strong>O(1)</strong>!
      </NeuronTip>
    </div>
  )
}

/* ---- Section 2: What is an Array? ---- */
function ArrayVisualizer() {
  const FRUITS = ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🍒']
  const BASE = 200
  const [elements, setElements] = useState(['🍎', '🍌', '🍊'])
  const [justAdded, setJustAdded] = useState(null)
  const [showAddresses, setShowAddresses] = useState(true)
  const [showIndices, setShowIndices] = useState(true)

  const addElement = () => {
    if (elements.length >= 7) return
    const remaining = FRUITS.filter(f => !elements.includes(f))
    if (remaining.length === 0) return
    const next = remaining[0]
    setElements(prev => [...prev, next])
    setJustAdded(elements.length)
    setTimeout(() => setJustAdded(null), 1000)
  }

  const removeElement = () => {
    if (elements.length === 0) return
    setElements(prev => prev.slice(0, -1))
  }

  return (
    <div>
      <Neuron
        mood="excited"
        size="medium"
        message="An array is a row of connected hotel rooms — all in a LINE, TOUCHING each other (contiguous memory). Position 0, 1, 2... is the INDEX. The first element always lives at the base address — each next element is exactly 1 slot away!"
        style={{ marginBottom: 28 }}
      />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={addElement}
          disabled={elements.length >= 7}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: elements.length >= 7
              ? '#1e293b'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: elements.length >= 7 ? '#64748b' : 'white',
            fontWeight: 700, fontSize: 14, border: 'none',
            cursor: elements.length >= 7 ? 'not-allowed' : 'pointer',
          }}
        >
          + Add Fruit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={removeElement}
          disabled={elements.length === 0}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: elements.length === 0 ? '#1e293b' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: elements.length === 0 ? '#64748b' : 'white',
            fontWeight: 700, fontSize: 14, border: 'none',
            cursor: elements.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          − Remove Last
        </motion.button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox" checked={showAddresses} onChange={e => setShowAddresses(e.target.checked)}
            style={{ accentColor: '#6366f1' }}
          />
          Show Addresses
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox" checked={showIndices} onChange={e => setShowIndices(e.target.checked)}
            style={{ accentColor: '#6366f1' }}
          />
          Show Indices
        </label>
      </div>

      {/* Array visualization */}
      <div style={{
        background: '#0f172a',
        borderRadius: 16,
        padding: '24px 20px',
        border: '1.5px solid #1e3a5f',
        overflowX: 'auto',
      }}>
        {/* Memory address row */}
        {showAddresses && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, paddingLeft: 8 }}>
            {elements.map((_, i) => (
              <div key={i} style={{
                width: 80, flexShrink: 0,
                textAlign: 'center', fontSize: 10,
                color: '#64748b', fontFamily: 'monospace',
              }}>
                addr {BASE + i}
              </div>
            ))}
            {elements.length === 0 && (
              <div style={{ color: '#475569', fontSize: 14, fontStyle: 'italic' }}>
                Array is empty — add some fruits!
              </div>
            )}
          </div>
        )}

        {/* Element boxes */}
        <div style={{ display: 'flex', gap: 0 }}>
          <AnimatePresence>
            {elements.map((el, i) => (
              <motion.div
                key={el + i}
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{
                  opacity: 1, scale: 1, x: 0,
                  boxShadow: justAdded === i ? ['0 0 0px #10b981', '0 0 20px #10b981', '0 0 0px #10b981'] : '0 0 0px transparent',
                }}
                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                transition={{ duration: 0.35 }}
                style={{
                  width: 80, height: 80, flexShrink: 0,
                  background: justAdded === i
                    ? 'linear-gradient(135deg, #065f46, #047857)'
                    : 'linear-gradient(135deg, #1e293b, #1a2540)',
                  border: justAdded === i ? '2px solid #10b981' : '2px solid #334155',
                  borderRight: '2px solid #475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  position: 'relative',
                  transition: 'background 0.3s, border 0.3s',
                }}
              >
                {el}
                {/* Connector line */}
                {i < elements.length - 1 && (
                  <div style={{
                    position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%)',
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#4f46e5',
                    zIndex: 2,
                  }} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Index row */}
        {showIndices && elements.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 8 }}>
            {elements.map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: 80, flexShrink: 0,
                  textAlign: 'center',
                  background: '#1e293b',
                  borderRadius: 6,
                  padding: '3px 0',
                }}
              >
                <span style={{
                  fontSize: 12, fontWeight: 800,
                  color: '#6366f1', fontFamily: 'monospace',
                }}>
                  [{i}]
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Formula */}
        {elements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 16, padding: '10px 16px',
              background: '#0a0f1e',
              borderRadius: 10, border: '1px solid #1e3a5f',
              fontFamily: 'monospace', fontSize: 13, color: '#94a3b8',
            }}
          >
            address({'{'}index{'}'}) = base_address + index = {BASE} + index
            &nbsp;&nbsp;|&nbsp;&nbsp; array[{elements.length - 1}] → address {BASE + elements.length - 1}
          </motion.div>
        )}
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Length', value: elements.length, color: '#6366f1', icon: '📏' },
          { label: 'First Address', value: elements.length > 0 ? BASE : '—', color: '#10b981', icon: '🏠' },
          { label: 'Last Address', value: elements.length > 0 ? BASE + elements.length - 1 : '—', color: '#f59e0b', icon: '📍' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            padding: '14px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Section 3: Array Operations Visualizer ---- */
function ArrayOperations() {
  const INIT = ['Delhi', 'Mumbai', 'Pune']
  const [arr, setArr] = useState([...INIT])
  const [animating, setAnimating] = useState(false)
  const [shifting, setShifting] = useState([]) // indices that are shifting
  const [highlight, setHighlight] = useState(null)
  const [accessIdx, setAccessIdx] = useState('')
  const [accessResult, setAccessResult] = useState(null)
  const [log, setLog] = useState([])
  const [newVal, setNewVal] = useState('')

  const addLog = (msg, complexity) => {
    setLog(prev => [{ msg, complexity, id: Date.now() }, ...prev].slice(0, 4))
  }

  const accessElement = () => {
    const idx = parseInt(accessIdx)
    if (isNaN(idx) || idx < 0 || idx >= arr.length) {
      setAccessResult({ error: true, msg: `Index ${idx} out of bounds! Array has ${arr.length} elements (0 to ${arr.length - 1})` })
      return
    }
    setHighlight(idx)
    setAccessResult({ error: false, value: arr[idx], idx })
    addLog(`arr[${idx}] = "${arr[idx]}" — direct jump to address`, 'O(1)')
    setTimeout(() => setHighlight(null), 1500)
  }

  const insertEnd = () => {
    if (!newVal.trim() || animating) return
    const val = newVal.trim()
    setNewVal('')
    setArr(prev => [...prev, val])
    setHighlight(arr.length)
    addLog(`Insert "${val}" at end — no shifting needed`, 'O(1)')
    setTimeout(() => setHighlight(null), 1200)
  }

  const insertStart = async () => {
    if (!newVal.trim() || animating) return
    const val = newVal.trim()
    setNewVal('')
    setAnimating(true)

    // Animate shifts right-to-left
    for (let i = arr.length - 1; i >= 0; i--) {
      setShifting([i])
      await new Promise(r => setTimeout(r, 200))
    }
    setShifting([])
    setArr(prev => [val, ...prev])
    setHighlight(0)
    addLog(`Insert "${val}" at start — shifted ${arr.length} elements right`, `O(${arr.length}) → O(n)`)
    setTimeout(() => { setHighlight(null); setAnimating(false) }, 1000)
  }

  const deleteMiddle = async () => {
    if (arr.length < 3 || animating) return
    const midIdx = Math.floor(arr.length / 2)
    const deleted = arr[midIdx]
    setAnimating(true)
    setHighlight(midIdx)
    await new Promise(r => setTimeout(r, 600))

    // Animate shifts left
    for (let i = midIdx; i < arr.length - 1; i++) {
      setShifting([i + 1])
      await new Promise(r => setTimeout(r, 180))
    }
    setShifting([])
    setArr(prev => prev.filter((_, i) => i !== midIdx))
    setHighlight(null)
    addLog(`Delete "${deleted}" at index ${midIdx} — shifted ${arr.length - midIdx - 1} elements left`, `O(n)`)
    setAnimating(false)
  }

  const COMPLEXITY_COLOR = {
    'O(1)': '#10b981',
    [`O(${arr.length}) → O(n)`]: '#ef4444',
    'O(n)': '#ef4444',
  }

  return (
    <div>
      <Neuron
        mood="thinking"
        size="medium"
        message="Let's explore WHY array operations have different speeds. Watch the elements shift when you insert at the start — that's WHY it's slow. Access is instant because we jump straight to the address!"
        style={{ marginBottom: 24 }}
      />

      {/* Live array */}
      <div style={{
        background: '#0f172a',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        border: '1.5px solid #1e3a5f',
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontFamily: 'monospace' }}>
          Current Array (length: {arr.length})
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <AnimatePresence>
            {arr.map((el, i) => (
              <motion.div
                key={el + i}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  scale: shifting.includes(i) ? 1.1 : 1,
                  x: shifting.includes(i) ? 12 : 0,
                  background: highlight === i
                    ? 'linear-gradient(135deg, #065f46, #047857)'
                    : shifting.includes(i)
                      ? 'linear-gradient(135deg, #7c2d12, #92400e)'
                      : 'linear-gradient(135deg, #1e293b, #1a2540)',
                  borderColor: highlight === i ? '#10b981' : shifting.includes(i) ? '#f97316' : '#475569',
                }}
                exit={{ opacity: 0, scale: 0.4, y: -20 }}
                transition={{ duration: 0.25 }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '2px solid #475569',
                  textAlign: 'center',
                  minWidth: 80,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>{el}</div>
                <div style={{ fontSize: 10, color: '#6366f1', fontFamily: 'monospace', marginTop: 2 }}>[{i}]</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Input + operation buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          placeholder="New value..."
          onKeyDown={e => e.key === 'Enter' && insertEnd()}
          style={{
            padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontSize: 14, outline: 'none', width: 140,
          }}
        />
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={insertEnd}
          disabled={animating}
          style={{
            padding: '10px 16px', borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', fontWeight: 700, fontSize: 13,
            border: 'none', cursor: animating ? 'not-allowed' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}
        >
          <span>Insert at End</span>
          <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.85 }}>O(1) — fast</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={insertStart}
          disabled={animating}
          style={{
            padding: '10px 16px', borderRadius: 10,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white', fontWeight: 700, fontSize: 13,
            border: 'none', cursor: animating ? 'not-allowed' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}
        >
          <span>Insert at Start</span>
          <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.85 }}>O(n) — watch shift!</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={deleteMiddle}
          disabled={animating || arr.length < 3}
          style={{
            padding: '10px 16px', borderRadius: 10,
            background: arr.length < 3 ? '#1e293b' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: arr.length < 3 ? '#64748b' : 'white',
            fontWeight: 700, fontSize: 13,
            border: 'none', cursor: (animating || arr.length < 3) ? 'not-allowed' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}
        >
          <span>Delete from Middle</span>
          <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.85 }}>O(n) — shifts left</span>
        </motion.button>
      </div>

      {/* Access by index */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Access Element by Index — O(1)
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            value={accessIdx}
            onChange={e => setAccessIdx(e.target.value)}
            placeholder="Index..."
            min="0"
            max={arr.length - 1}
            style={{
              padding: '8px 12px', borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: 14, outline: 'none', width: 100,
              fontFamily: 'monospace',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={accessElement}
            style={{
              padding: '8px 18px', borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white', fontWeight: 700, fontSize: 13,
              border: 'none', cursor: 'pointer',
            }}
          >
            Access arr[{accessIdx || '?'}]
          </motion.button>
          <AnimatePresence>
            {accessResult && (
              <motion.div
                key={JSON.stringify(accessResult)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  background: accessResult.error ? '#7f1d1d' : '#052e16',
                  border: `1px solid ${accessResult.error ? '#ef4444' : '#10b981'}`,
                  color: accessResult.error ? '#fca5a5' : '#86efac',
                  fontSize: 13, fontFamily: 'monospace',
                }}
              >
                {accessResult.error ? accessResult.msg : `"${accessResult.value}" — instant! Direct address jump`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Operation log */}
      {log.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5 }}>
            OPERATION LOG
          </div>
          {log.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 14px',
                fontSize: 13,
              }}
            >
              <span style={{
                padding: '2px 10px', borderRadius: 20,
                background: entry.complexity.includes('n)') ? '#7f1d1d' : '#052e16',
                color: entry.complexity.includes('n)') ? '#fca5a5' : '#86efac',
                fontWeight: 800, fontSize: 11, fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}>
                {entry.complexity}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{entry.msg}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- Section 4: The Index Game ---- */
function IndexGame() {
  const CITIES = ['Agra', 'Mumbai', 'Kolkata', 'Delhi', 'Chennai', 'Pune', 'Jaipur', 'Hyderabad', 'Surat', 'Lucknow']
  const [gamePhase, setGamePhase] = useState(0) // 0=idle, 1=find-at-index, 2=find-index-of, 3=insert-shift
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [shiftDemo, setShiftDemo] = useState(null)
  const [insertedArr, setInsertedArr] = useState(null)

  const startGame = () => {
    const q = Math.random()
    if (q < 0.4) {
      // Find at index
      const idx = Math.floor(Math.random() * CITIES.length)
      setQuestion({ type: 'find-at', text: `What city is at index ${idx}?`, answer: CITIES[idx], idx })
      setGamePhase(1)
    } else if (q < 0.75) {
      // Find index of city
      const city = CITIES[Math.floor(Math.random() * CITIES.length)]
      const ans = CITIES.indexOf(city)
      setQuestion({ type: 'find-idx', text: `What is the INDEX of "${city}"?`, answer: ans, city })
      setGamePhase(2)
    } else {
      // Predict shift
      const insertAt = Math.floor(Math.random() * 4) + 1
      const city = 'Varanasi'
      setQuestion({ type: 'insert-shift', text: `If we insert "${city}" at index ${insertAt}, what will index ${insertAt + 2} contain?`, answer: CITIES[insertAt + 1], insertAt, city })
      setGamePhase(3)
    }
    setSelected(null)
    setResult(null)
    setShiftDemo(null)
    setInsertedArr(null)
  }

  const handleAnswer = (answer) => {
    if (selected !== null) return
    setSelected(answer)
    setTotal(t => t + 1)
    const correct = String(answer) === String(question.answer)
    if (correct) setScore(s => s + 1)
    setResult(correct)

    if (question.type === 'insert-shift') {
      const newArr = [...CITIES.slice(0, question.insertAt), question.city, ...CITIES.slice(question.insertAt)]
      setInsertedArr(newArr)
    }
  }

  const getChoices = () => {
    if (!question) return []
    if (question.type === 'find-at') {
      const correct = question.answer
      const wrong = CITIES.filter(c => c !== correct).sort(() => Math.random() - 0.5).slice(0, 3)
      return [...wrong, correct].sort(() => Math.random() - 0.5)
    }
    if (question.type === 'find-idx') {
      const correct = question.answer
      const wrong = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== correct).sort(() => Math.random() - 0.5).slice(0, 3)
      return [...wrong, correct].sort(() => Math.random() - 0.5)
    }
    if (question.type === 'insert-shift') {
      const correct = question.answer
      const wrong = CITIES.filter(c => c !== correct && c !== question.city).sort(() => Math.random() - 0.5).slice(0, 3)
      return [...wrong, correct].sort(() => Math.random() - 0.5)
    }
    return []
  }

  return (
    <div>
      <Neuron
        mood="excited"
        size="medium"
        message="Test your array instincts! I'll ask you questions about this array of Indian cities. Answer fast — indexes start at 0!"
        style={{ marginBottom: 20 }}
      />

      {/* City array display */}
      <div style={{
        background: '#0f172a',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 20,
        border: '1.5px solid #1e3a5f',
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontFamily: 'monospace' }}>
          cities[] = [
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CITIES.map((city, i) => (
            <motion.div
              key={city}
              animate={{
                background: question?.type === 'find-at' && question.idx === i && selected !== null
                  ? 'linear-gradient(135deg, #065f46, #047857)'
                  : question?.type === 'find-idx' && question.city === city && selected !== null
                    ? 'linear-gradient(135deg, #1e3a5f, #1e40af)'
                    : 'linear-gradient(135deg, #1e293b, #1a2540)',
              }}
              style={{
                padding: '8px 12px', borderRadius: 8,
                border: '1.5px solid #334155',
                textAlign: 'center', minWidth: 70,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{city}</div>
              <div style={{ fontSize: 10, color: '#6366f1', fontFamily: 'monospace' }}>[{i}]</div>
            </motion.div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 8, fontFamily: 'monospace' }}>
          ]  // length: {CITIES.length}
        </div>
      </div>

      {/* Score */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
        <div style={{
          background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
          borderRadius: 10, padding: '10px 20px',
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fbbf24', fontFamily: 'monospace' }}>
            {score}/{total}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {total > 0 ? `(${Math.round(score / total * 100)}%)` : ''}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={startGame}
          style={{
            padding: '12px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', fontWeight: 700, fontSize: 15,
            border: 'none', cursor: 'pointer',
          }}
        >
          {gamePhase === 0 ? '🎮 Start Game' : '➜ Next Question'}
        </motion.button>
      </div>

      {/* Question */}
      <AnimatePresence>
        {question && (
          <motion.div
            key={question.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              border: '2px solid #6366f1',
              borderRadius: 14, padding: '20px 24px',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 8, letterSpacing: 0.5 }}>
                {question.type === 'find-at' ? 'FIND BY INDEX' : question.type === 'find-idx' ? 'FIND THE INDEX' : 'PREDICT THE SHIFT'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>
                {question.text}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {getChoices().map((choice, i) => (
                <motion.button
                  key={i}
                  whileHover={selected === null ? { scale: 1.04 } : {}}
                  whileTap={selected === null ? { scale: 0.96 } : {}}
                  onClick={() => handleAnswer(choice)}
                  style={{
                    padding: '12px 22px', borderRadius: 12,
                    background: selected === null
                      ? 'var(--bg-secondary)'
                      : String(choice) === String(question.answer)
                        ? 'linear-gradient(135deg, #065f46, #047857)'
                        : selected === choice
                          ? 'linear-gradient(135deg, #7f1d1d, #991b1b)'
                          : 'var(--bg-secondary)',
                    border: selected === null
                      ? '1.5px solid var(--border)'
                      : String(choice) === String(question.answer)
                        ? '2px solid #10b981'
                        : selected === choice
                          ? '2px solid #ef4444'
                          : '1.5px solid var(--border)',
                    color: selected !== null && String(choice) === String(question.answer)
                      ? '#86efac'
                      : selected === choice
                        ? '#fca5a5'
                        : 'var(--text-primary)',
                    fontWeight: 700, fontSize: 15,
                    cursor: selected !== null ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    minWidth: 100,
                  }}
                >
                  {String(choice)}
                </motion.button>
              ))}
            </div>

            {result !== null && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 14,
                  padding: '14px 20px',
                  background: result ? '#052e16' : '#7f1d1d',
                  border: `1.5px solid ${result ? '#10b981' : '#ef4444'}`,
                  borderRadius: 12,
                  color: result ? '#86efac' : '#fca5a5',
                  fontSize: 15, fontWeight: 600,
                }}
              >
                {result
                  ? `Correct! ${question.type === 'find-at' ? `cities[${question.idx}] = "${question.answer}"` : question.type === 'find-idx' ? `"${question.city}" is at index ${question.answer}` : `After inserting, the element at index ${question.insertAt + 2} is "${question.answer}"`}`
                  : `Not quite! The answer is "${question.answer}". ${question.type === 'find-at' ? 'Count from index 0.' : question.type === 'find-idx' ? 'Count from the left, starting at 0.' : 'Inserting shifts everything right by one!'}`
                }
              </motion.div>
            )}

            {insertedArr && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 14 }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>
                  After inserting "{question.city}" at index {question.insertAt}:
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {insertedArr.slice(0, 8).map((city, i) => (
                    <div key={i} style={{
                      padding: '6px 10px', borderRadius: 8,
                      background: i === question.insertAt
                        ? 'linear-gradient(135deg, #065f46, #047857)'
                        : i === question.insertAt + 2
                          ? 'linear-gradient(135deg, #1e3a5f, #1e40af)'
                          : 'var(--bg-secondary)',
                      border: `1.5px solid ${i === question.insertAt ? '#10b981' : i === question.insertAt + 2 ? '#6366f1' : 'var(--border)'}`,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{city}</div>
                      <div style={{ fontSize: 10, color: '#6366f1', fontFamily: 'monospace' }}>[{i}]</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 5: Static vs Dynamic Arrays ---- */
function StaticVsDynamic() {
  const [phase, setPhase] = useState('idle') // idle, full-error, resizing, resized
  const [staticArr, setStaticArr] = useState(['A', 'B', 'C'])
  const STATIC_CAP = 4
  const [dynamicArr, setDynamicArr] = useState(['A', 'B', 'C'])
  const [dynCapacity, setDynCapacity] = useState(4)
  const [errorMsg, setErrorMsg] = useState(null)
  const [copyPhase, setCopyPhase] = useState(false)

  const addToStatic = () => {
    if (staticArr.length >= STATIC_CAP) {
      setErrorMsg('Stack Overflow! Cannot add more — fixed capacity reached.')
      setPhase('full-error')
      setTimeout(() => { setErrorMsg(null); setPhase('idle') }, 2000)
      return
    }
    const next = String.fromCharCode(65 + staticArr.length)
    setStaticArr(prev => [...prev, next])
  }

  const addToDynamic = async () => {
    const next = String.fromCharCode(65 + dynamicArr.length)
    if (dynamicArr.length >= dynCapacity) {
      // Resize: double capacity
      setPhase('resizing')
      setCopyPhase(true)
      await new Promise(r => setTimeout(r, 1200))
      setDynCapacity(c => c * 2)
      setCopyPhase(false)
      setPhase('resized')
      setTimeout(() => setPhase('idle'), 1500)
    }
    setDynamicArr(prev => [...prev, next])
  }

  const reset = () => {
    setStaticArr(['A', 'B', 'C'])
    setDynamicArr(['A', 'B', 'C'])
    setDynCapacity(4)
    setPhase('idle')
    setErrorMsg(null)
    setCopyPhase(false)
  }

  return (
    <div>
      <Neuron
        mood="thinking"
        size="medium"
        message="Static arrays have a FIXED size — like reserving exactly 4 rooms. If you need a 5th room, SORRY, NO VACANCY! Dynamic arrays (like ArrayList in Java / vector in C++) solve this by doubling capacity when full — but copying costs O(n)."
        style={{ marginBottom: 24 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Static Array */}
        <div style={{
          background: '#1a0a0a',
          border: `2px solid ${phase === 'full-error' ? '#ef4444' : '#7f1d1d'}`,
          borderRadius: 16, padding: 20,
          transition: 'border-color 0.3s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fca5a5' }}>Static Array</div>
              <div style={{ fontSize: 12, color: '#f87171', marginTop: 2 }}>Fixed capacity: {STATIC_CAP}</div>
            </div>
            <span style={{ fontSize: 22 }}>🔒</span>
          </div>

          {/* Slots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {Array.from({ length: STATIC_CAP }, (_, i) => (
              <motion.div
                key={i}
                animate={phase === 'full-error' && i >= staticArr.length ? {
                  x: [0, -4, 4, -4, 0],
                  borderColor: '#ef4444',
                } : {}}
                transition={{ duration: 0.4 }}
                style={{
                  width: 50, height: 50,
                  background: i < staticArr.length ? 'linear-gradient(135deg, #7f1d1d, #991b1b)' : '#1e293b',
                  border: `2px solid ${i < staticArr.length ? '#ef444466' : '#334155'}`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: '#fca5a5',
                  fontFamily: 'monospace',
                }}
              >
                {i < staticArr.length ? staticArr[i] : <span style={{ color: '#475569', fontSize: 12 }}>—</span>}
              </motion.div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontFamily: 'monospace' }}>
            {staticArr.length}/{STATIC_CAP} slots used
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: '#7f1d1d', border: '1px solid #ef4444',
                  borderRadius: 8, padding: '8px 12px',
                  fontSize: 12, color: '#fca5a5', marginBottom: 10, fontWeight: 600,
                }}
              >
                ❌ {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={addToStatic}
            style={{
              width: '100%', padding: '10px', borderRadius: 10,
              background: staticArr.length >= STATIC_CAP
                ? '#450a0a'
                : 'linear-gradient(135deg, #b91c1c, #991b1b)',
              color: '#fca5a5', fontWeight: 700, fontSize: 13,
              border: 'none', cursor: 'pointer',
            }}
          >
            + Add Element
          </motion.button>
        </div>

        {/* Dynamic Array */}
        <div style={{
          background: '#0a1a0a',
          border: `2px solid ${phase === 'resizing' ? '#fbbf24' : phase === 'resized' ? '#10b981' : '#166534'}`,
          borderRadius: 16, padding: 20,
          transition: 'border-color 0.3s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#86efac' }}>Dynamic Array</div>
              <div style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>
                Capacity: {dynCapacity} {phase === 'resized' && <span style={{ color: '#fbbf24' }}>(just doubled!)</span>}
              </div>
            </div>
            <span style={{ fontSize: 22 }}>{phase === 'resizing' ? '⚡' : '🔓'}</span>
          </div>

          {/* Current slots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            {Array.from({ length: dynCapacity }, (_, i) => (
              <motion.div
                key={i}
                animate={copyPhase && i < dynamicArr.length ? {
                  y: [0, -12, 0],
                  opacity: [1, 0.4, 1],
                } : {}}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{
                  width: 44, height: 44,
                  background: i < dynamicArr.length
                    ? 'linear-gradient(135deg, #14532d, #166534)'
                    : '#1e293b',
                  border: `2px solid ${i < dynamicArr.length ? '#22c55e66' : '#334155'}`,
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: '#86efac',
                  fontFamily: 'monospace',
                }}
              >
                {i < dynamicArr.length ? dynamicArr[i] : <span style={{ color: '#475569', fontSize: 10 }}>—</span>}
              </motion.div>
            ))}
          </div>

          {copyPhase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 12, color: '#fbbf24',
                marginBottom: 8, fontWeight: 600,
              }}
            >
              ⚡ Copying to new double-sized block...
            </motion.div>
          )}

          {phase === 'resized' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: 12, color: '#86efac',
                marginBottom: 8, fontWeight: 600,
              }}
            >
              Resized to {dynCapacity} — cost was O({dynamicArr.length - 1}) to copy
            </motion.div>
          )}

          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontFamily: 'monospace' }}>
            {dynamicArr.length}/{dynCapacity} slots used
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={addToDynamic}
            disabled={phase === 'resizing'}
            style={{
              width: '100%', padding: '10px', borderRadius: 10,
              background: phase === 'resizing'
                ? '#1e293b'
                : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: phase === 'resizing' ? '#64748b' : '#f0fdf4',
              fontWeight: 700, fontSize: 13,
              border: 'none', cursor: phase === 'resizing' ? 'not-allowed' : 'pointer',
            }}
          >
            + Add Element {dynamicArr.length >= dynCapacity ? '(will resize!)' : ''}
          </motion.button>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={reset}
        style={{
          padding: '8px 20px', borderRadius: 10,
          background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
          color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Reset Demo
      </motion.button>

      <NeuronTip type="deep">
        Dynamic arrays have <strong>amortized O(1)</strong> append — most appends are instant, occasional doubles cost O(n), but spread across all inserts the average stays O(1). Python's <code>list</code>, Java's <code>ArrayList</code>, C++'s <code>vector</code> all work this way!
      </NeuronTip>
    </div>
  )
}

/* ---- Section 6: 2D Arrays — The Grid ---- */
function TwoDArray() {
  const [mode, setMode] = useState('grid') // 'grid', 'tictactoe', 'theater'
  const [gridRows, setGridRows] = useState(4)
  const [gridCols, setGridCols] = useState(5)
  const [hoveredCell, setHoveredCell] = useState(null)
  const [clickedCell, setClickedCell] = useState(null)
  const [tttBoard, setTttBoard] = useState(Array(9).fill(null))
  const [tttTurn, setTttTurn] = useState('X')
  const [tttWinner, setTttWinner] = useState(null)
  const [theaterSeats, setTheaterSeats] = useState(() =>
    Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => ({
        taken: Math.random() < 0.35,
        row: r, col: c,
      }))
    )
  )
  const [yourSeat, setYourSeat] = useState(null)

  const checkWinner = (board) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for (const [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
    }
    return null
  }

  const handleTTT = (i) => {
    if (tttBoard[i] || tttWinner) return
    const newBoard = [...tttBoard]
    newBoard[i] = tttTurn
    const winner = checkWinner(newBoard)
    setTttBoard(newBoard)
    setTttWinner(winner)
    setTttTurn(t => t === 'X' ? 'O' : 'X')
  }

  const resetTTT = () => { setTttBoard(Array(9).fill(null)); setTttTurn('X'); setTttWinner(null) }

  const bookSeat = (r, c) => {
    if (theaterSeats[r][c].taken) return
    setYourSeat({ r, c })
    setTheaterSeats(prev => prev.map((row, ri) =>
      row.map((seat, ci) => ri === r && ci === c ? { ...seat, taken: true } : seat)
    ))
  }

  const ROW_LABELS = ['A', 'B', 'C', 'D', 'E']

  return (
    <div>
      <Neuron
        mood="happy"
        size="medium"
        message="2D arrays are arrays of arrays — like a grid! You access any cell with TWO indices: [row][col]. They model the real world perfectly: chess boards, cinema seats, spreadsheets, images (pixels!)"
        style={{ marginBottom: 24 }}
      />

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'grid', label: '🔢 Custom Grid', desc: 'Explore [row][col]' },
          { id: 'tictactoe', label: '❌ Tic-Tac-Toe', desc: '3×3 array' },
          { id: 'theater', label: '🎬 Cinema Seats', desc: '5×8 booking' },
        ].map(m => (
          <motion.button
            key={m.id}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setMode(m.id)}
            style={{
              padding: '10px 18px', borderRadius: 12,
              background: mode === m.id
                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                : 'var(--bg-secondary)',
              border: mode === m.id ? '2px solid #6366f1' : '1.5px solid var(--border)',
              color: mode === m.id ? 'white' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div>{m.label}</div>
            <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 400, marginTop: 2 }}>{m.desc}</div>
          </motion.button>
        ))}
      </div>

      {/* Custom Grid */}
      {mode === 'grid' && (
        <div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
              Rows:
              <input type="range" min="2" max="6" value={gridRows}
                onChange={e => setGridRows(Number(e.target.value))}
                style={{ accentColor: '#6366f1' }}
              />
              <span style={{ fontWeight: 700, color: '#6366f1', width: 16 }}>{gridRows}</span>
            </label>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
              Cols:
              <input type="range" min="2" max="8" value={gridCols}
                onChange={e => setGridCols(Number(e.target.value))}
                style={{ accentColor: '#6366f1' }}
              />
              <span style={{ fontWeight: 700, color: '#6366f1', width: 16 }}>{gridCols}</span>
            </label>
          </div>
          <div style={{
            background: '#0f172a', borderRadius: 14, padding: 20,
            border: '1.5px solid #1e3a5f', display: 'inline-block',
            maxWidth: '100%', overflowX: 'auto',
          }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, fontFamily: 'monospace' }}>
              grid[{gridRows}][{gridCols}]
            </div>
            {Array.from({ length: gridRows }, (_, r) => (
              <div key={r} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <div style={{
                  width: 24, display: 'flex', alignItems: 'center',
                  fontSize: 11, color: '#475569', fontFamily: 'monospace', justifyContent: 'flex-end',
                }}>
                  {r}
                </div>
                {Array.from({ length: gridCols }, (_, c) => (
                  <motion.div
                    key={c}
                    onHoverStart={() => setHoveredCell({ r, c })}
                    onHoverEnd={() => setHoveredCell(null)}
                    onClick={() => setClickedCell({ r, c })}
                    whileHover={{ scale: 1.12 }}
                    animate={{
                      background: clickedCell?.r === r && clickedCell?.c === c
                        ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                        : hoveredCell?.r === r || hoveredCell?.c === c
                          ? hoveredCell?.r === r && hoveredCell?.c === c
                            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                            : 'linear-gradient(135deg, #1e3a5f, #1a2f5f)'
                          : 'linear-gradient(135deg, #1e293b, #1a2540)',
                    }}
                    style={{
                      width: 52, height: 52, borderRadius: 8, cursor: 'pointer',
                      border: `2px solid ${clickedCell?.r === r && clickedCell?.c === c ? '#6366f1' : '#334155'}`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
                      [{r}][{c}]
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginBottom: 2, paddingLeft: 30 }}>
              {Array.from({ length: gridCols }, (_, c) => (
                <div key={c} style={{ width: 52, textAlign: 'center', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
          {clickedCell && (
            <motion.div
              key={JSON.stringify(clickedCell)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 14, display: 'inline-block',
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                border: '2px solid #6366f1', borderRadius: 12, padding: '12px 20px',
                fontFamily: 'monospace', fontSize: 15, color: '#a5b4fc',
              }}
            >
              Selected: grid[<span style={{ color: '#fbbf24' }}>{clickedCell.r}</span>][<span style={{ color: '#f9a8d4' }}>{clickedCell.c}</span>]
            </motion.div>
          )}
        </div>
      )}

      {/* Tic-Tac-Toe */}
      {mode === 'tictactoe' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Each cell is addressed as <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>board[row][col]</span> (or by index 0–8 in a 1D array).
            {tttWinner ? ` 🎉 ${tttWinner} wins!` : ` Turn: ${tttTurn}`}
          </div>
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {tttBoard.map((cell, i) => {
              const r = Math.floor(i / 3), c = i % 3
              return (
                <motion.div
                  key={i}
                  whileHover={!cell && !tttWinner ? { scale: 1.07 } : {}}
                  whileTap={!cell && !tttWinner ? { scale: 0.93 } : {}}
                  onClick={() => handleTTT(i)}
                  style={{
                    width: 88, height: 88, borderRadius: 12,
                    background: cell === 'X'
                      ? 'linear-gradient(135deg, #1e3a5f, #1e40af)'
                      : cell === 'O'
                        ? 'linear-gradient(135deg, #14532d, #166534)'
                        : 'var(--bg-secondary)',
                    border: `2px solid ${cell === 'X' ? '#3b82f6' : cell === 'O' ? '#22c55e' : 'var(--border)'}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: !cell && !tttWinner ? 'pointer' : 'default',
                  }}
                >
                  {cell && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ fontSize: 32, fontWeight: 900, color: cell === 'X' ? '#60a5fa' : '#4ade80' }}
                    >
                      {cell}
                    </motion.div>
                  )}
                  <div style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', marginTop: cell ? 0 : 0 }}>
                    [{r}][{c}]
                  </div>
                </motion.div>
              )
            })}
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={resetTTT}
            style={{
              padding: '8px 20px', borderRadius: 10, display: 'block',
              background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            Reset Board
          </motion.button>
        </div>
      )}

      {/* Cinema seats */}
      {mode === 'theater' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Click an empty seat to book it. Seat address: <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>seats[row][col]</span>
            {yourSeat && <span style={{ color: '#fbbf24', fontWeight: 700 }}> — Your seat: {ROW_LABELS[yourSeat.r]}{yourSeat.c + 1} ({`[${yourSeat.r}][${yourSeat.c}]`})</span>}
          </div>
          <div style={{ background: '#0f172a', borderRadius: 14, padding: '20px 16px', border: '1.5px solid #1e3a5f', display: 'inline-block' }}>
            <div style={{
              background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
              borderRadius: 8, textAlign: 'center', padding: '6px 0',
              marginBottom: 16, color: 'white', fontWeight: 700, fontSize: 13,
              width: '100%',
            }}>
              🎬 SCREEN
            </div>
            {theaterSeats.map((row, r) => (
              <div key={r} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <div style={{ width: 20, fontSize: 11, color: '#6366f1', fontFamily: 'monospace', textAlign: 'right', fontWeight: 700 }}>
                  {ROW_LABELS[r]}
                </div>
                {row.map((seat, c) => (
                  <motion.div
                    key={c}
                    whileHover={!seat.taken ? { scale: 1.12, y: -2 } : {}}
                    whileTap={!seat.taken ? { scale: 0.9 } : {}}
                    onClick={() => bookSeat(r, c)}
                    style={{
                      width: 36, height: 32, borderRadius: 6,
                      background: yourSeat?.r === r && yourSeat?.c === c
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : seat.taken
                          ? '#374151'
                          : 'linear-gradient(135deg, #166534, #15803d)',
                      border: `1.5px solid ${yourSeat?.r === r && yourSeat?.c === c ? '#fbbf24' : seat.taken ? '#4b5563' : '#22c55e'}`,
                      cursor: seat.taken ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: seat.taken ? '#6b7280' : '#fff', fontFamily: 'monospace',
                    }}
                  >
                    {yourSeat?.r === r && yourSeat?.c === c ? '★' : `${c + 1}`}
                  </motion.div>
                ))}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { bg: 'linear-gradient(135deg, #166534, #15803d)', border: '#22c55e', label: 'Available' },
                { bg: '#374151', border: '#4b5563', label: 'Taken' },
                { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: '#fbbf24', label: 'Your Seat' },
              ].map(leg => (
                <div key={leg.label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 16, borderRadius: 4, background: leg.bg, border: `1.5px solid ${leg.border}` }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{leg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <NeuronTip type="example">
        Images are 2D arrays too! A 1920×1080 image = 2D array with 1920 columns and 1080 rows. Each cell holds a pixel value (0–255 for grayscale, or RGB triplet for color). That's how computer vision works!
      </NeuronTip>
    </div>
  )
}

/* ---- Section 7: Operations Big-O Summary ---- */
function BigOSummary() {
  const ops = [
    { op: 'Access arr[i]', bigO: 'O(1)', why: 'Direct address calculation: base + i', color: '#10b981', bar: 5 },
    { op: 'Search (unsorted)', bigO: 'O(n)', why: 'May need to check every element', color: '#f59e0b', bar: 50 },
    { op: 'Insert at End', bigO: 'O(1)*', why: 'Append to next slot (amortized)', color: '#10b981', bar: 5 },
    { op: 'Insert at Start', bigO: 'O(n)', why: 'Must shift ALL elements right', color: '#ef4444', bar: 80 },
    { op: 'Insert at Middle', bigO: 'O(n)', why: 'Must shift half the elements', color: '#f97316', bar: 55 },
    { op: 'Delete from End', bigO: 'O(1)', why: 'Just decrement length pointer', color: '#10b981', bar: 5 },
    { op: 'Delete from Middle', bigO: 'O(n)', why: 'Must shift remaining elements left', color: '#ef4444', bar: 70 },
  ]

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ops.map((op, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border)',
              borderRadius: 12, padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {op.op}
                </span>
              </div>
              <span style={{
                fontWeight: 800, fontSize: 14, fontFamily: 'monospace',
                color: op.color,
                background: op.color + '18',
                padding: '3px 12px', borderRadius: 20,
              }}>
                {op.bigO}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{op.why}</div>
            <div style={{ height: 6, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${op.bar}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.06 }}
                style={{ height: '100%', background: op.color, borderRadius: 6 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, fontStyle: 'italic' }}>
        * O(1) amortized for dynamic arrays
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */

export default function Topic2Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          border: '1.5px solid #312e81',
          borderRadius: 24,
          padding: '40px 40px 32px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
          style={{
            position: 'absolute', right: -60, top: -60,
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, #4f46e530, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#312e81', borderRadius: 20, padding: '4px 14px',
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 700, letterSpacing: 0.5 }}>TOPIC 2</span>
          <span style={{ color: '#475569', fontSize: 12 }}>•</span>
          <span style={{ fontSize: 12, color: '#7c7caa', fontWeight: 600 }}>Arrays & Memory</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 36, fontWeight: 900,
          color: '#f8fafc', margin: '0 0 12px',
          lineHeight: 1.15,
        }}>
          Where Your Data<br />
          <span style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Actually Lives
          </span>
        </h1>
        <p style={{ fontSize: 16, color: '#94a3b8', margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
          Slots, addresses, and why position matters — explore the data structure that powers every program.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { icon: '🏨', label: 'Memory Model' },
            { icon: '📦', label: 'Array Anatomy' },
            { icon: '⚡', label: 'O(1) Access' },
            { icon: '🔄', label: 'Shift Animations' },
            { icon: '🎮', label: 'Index Game' },
            { icon: '📐', label: '2D Grids' },
          ].map(tag => (
            <div key={tag.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#1e293b', borderRadius: 20,
              padding: '5px 14px', fontSize: 13, color: '#94a3b8',
            }}>
              <span>{tag.icon}</span>
              <span>{tag.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 1: Memory as a Hotel */}
      <SectionBlock icon="🏨" title="Memory as a Hotel" color="#6366f1">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, margin: '0 0 20px' }}>
          Your computer's RAM is like a massive hotel. Each room has a unique <strong>address</strong>.
          The CPU stores and retrieves data by jumping straight to an address — no searching required.
        </p>
        <InteractiveDemo
          title="RAM Hotel Explorer"
          instruction="Click any room to select it, then type a value and hit 'Store'. Use the quick-demo buttons to populate rooms instantly."
        >
          <MemoryHotel />
        </InteractiveDemo>
        <HindiExplainer
          concept="कंप्यूटर मेमोरी"
          english="Computer Memory (RAM)"
          explanation="कंप्यूटर की RAM एक होटल की तरह है जहाँ हर कमरे का एक अलग नंबर (address) होता है। CPU को जब भी कोई data चाहिए, वो सीधे उस address पर जाता है — बिना खोजे! यही कारण है कि मेमोरी access बहुत तेज़ होती है।"
          example="जैसे होटल reception से कहें 'Room 105 में जाओ' — receptionist को बाकी कमरे check नहीं करने पड़ते। वो सीधे 105 पर जाती है।"
          terms={[
            { hindi: 'मेमोरी/RAM', english: 'Memory', meaning: 'वो जगह जहाँ data temporarily store होता है' },
            { hindi: 'पता/Address', english: 'Address', meaning: 'memory में data की exact location' },
          ]}
        />
      </SectionBlock>

      {/* Section 2: What is an Array? */}
      <SectionBlock icon="📦" title="What is an Array?" color="#10b981">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, margin: '0 0 20px' }}>
          An array is a <strong>contiguous block</strong> of memory — connected rooms side by side in a line.
          You access elements by <strong>index</strong> (0-based), and the computer computes the address instantly.
        </p>
        <InteractiveDemo
          title="Array Builder"
          instruction="Add and remove fruits to see how the array grows. Toggle address and index labels to understand the layout."
        >
          <ArrayVisualizer />
        </InteractiveDemo>
        <NeuronTip type="fun">
          Why does indexing start at 0? Because the formula is <code>address = base + index × size</code>.
          The FIRST element is 0 steps from the start. Starting at 1 would waste a slot or require a subtraction every access!
        </NeuronTip>
        <HindiExplainer
          concept="ऐरे क्या है?"
          english="What is an Array?"
          explanation="Array एक पंक्ति में रखे हुए connected rooms की तरह है। सभी elements memory में एक के बाद एक रहते हैं (contiguous)। Index नंबर से कोई भी element instant मिल जाता है।"
          example="जैसे train के डिब्बे — S1, S2, S3... सब एक लाइन में जुड़े हैं। आप कह सकते हैं 'डिब्बा नंबर 3 में जाओ' — सीधे वहाँ पहुँच जाओगे।"
          terms={[
            { hindi: 'ऐरे/सरणी', english: 'Array', meaning: 'एक लाइन में store किए गए समान प्रकार के values' },
            { hindi: 'इंडेक्स', english: 'Index', meaning: 'element की position (0 से शुरू)' },
          ]}
        />
      </SectionBlock>

      {/* Section 3: Array Operations */}
      <SectionBlock icon="⚡" title="Array Operations Visualizer" color="#f59e0b">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, margin: '0 0 20px' }}>
          Not all operations on arrays are equal. Accessing is instant. But inserting at the start means
          <strong> every element shifts right</strong> — watch it happen live!
        </p>
        <InteractiveDemo
          title="Operations Lab"
          instruction="Type a value, then try each operation. Watch the orange elements SHIFT when you insert at the start. Notice how Big O changes!"
        >
          <ArrayOperations />
        </InteractiveDemo>
        <HindiExplainer
          concept="Array Operations"
          english="Array Operations"
          explanation="Array में कुछ काम बहुत fast हैं (जैसे access — O(1)), और कुछ slow (जैसे शुरुआत में insert — O(n))। जब शुरू में कोई element add होता है, तो बाकी सभी elements को एक जगह आगे खिसकना पड़ता है।"
          example="सोचो एक queue में आप सबसे आगे घुसने की कोशिश करते हो — बाकी सब को पीछे हटना पड़ता है!"
          terms={[
            { hindi: 'O(1)', english: 'Constant time', meaning: 'हमेशा एक ही step — बहुत fast' },
            { hindi: 'O(n)', english: 'Linear time', meaning: 'n elements पर n steps — array बड़ा = ज़्यादा काम' },
          ]}
        />
      </SectionBlock>

      {/* Section 4: The Index Game */}
      <SectionBlock icon="🎮" title="The Index Game" color="#ec4899">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, margin: '0 0 20px' }}>
          Put your index intuition to the test! Find elements by index, locate indices by value,
          and predict what happens when you insert into the middle of an array.
        </p>
        <InteractiveDemo
          title="Index Challenge"
          instruction="Answer the question by clicking the correct choice. Points for speed and accuracy!"
        >
          <IndexGame />
        </InteractiveDemo>
      </SectionBlock>

      {/* Section 5: Static vs Dynamic */}
      <SectionBlock icon="🔄" title="Static vs Dynamic Arrays" color="#8b5cf6">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, margin: '0 0 20px' }}>
          Static arrays have a <strong>fixed capacity</strong> — try to exceed it and you get an error.
          Dynamic arrays (<code>ArrayList</code>, <code>vector</code>) automatically <strong>double in size</strong>
          when full — watch the copy animation!
        </p>
        <InteractiveDemo
          title="Resize Simulator"
          instruction="Add elements to both arrays. The static array will crash when full. The dynamic array will resize — watch it copy to a new block!"
        >
          <StaticVsDynamic />
        </InteractiveDemo>
        <HindiExplainer
          concept="Static vs Dynamic Array"
          english="Fixed vs Resizable Array"
          explanation="Static array की capacity fix होती है — जैसे 4 लोगों का कमरा। अगर 5वाँ आए तो 'No Entry'! Dynamic array (Java का ArrayList, C++ का vector) जब भर जाए तो अपने आप double हो जाता है — लेकिन इस resizing में O(n) time लगता है।"
          example="Static = fixed size water bottle. Dynamic = ऐसा glass जो आपके डालने पर automatically बड़ा हो जाए!"
          terms={[
            { hindi: 'ArrayList', english: 'Dynamic Array in Java', meaning: 'automatically resize होने वाला array' },
            { hindi: 'Amortized O(1)', english: 'Average constant time', meaning: 'ज़्यादातर O(1), कभी-कभी O(n) resizing — average निकालें तो O(1)' },
          ]}
        />
      </SectionBlock>

      {/* Section 6: 2D Arrays */}
      <SectionBlock icon="📐" title="2D Arrays — The Grid" color="#0ea5e9">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, margin: '0 0 20px' }}>
          A 2D array is an <strong>array of arrays</strong> — a grid. You need TWO indices to access any element:
          <code> grid[row][col]</code>. Real-world grids are everywhere: chess boards, movie seats, pixel images.
        </p>
        <InteractiveDemo
          title="2D Grid Explorer"
          instruction="Try all three modes: explore the custom grid, play tic-tac-toe (notice the [row][col] labels), or book cinema seats!"
        >
          <TwoDArray />
        </InteractiveDemo>
        <HindiExplainer
          concept="2D Array / Grid"
          english="Two-Dimensional Array"
          explanation="2D array एक table की तरह है जिसमें rows और columns होते हैं। किसी भी cell को access करने के लिए दो index चाहिए: grid[row][col]. जैसे spreadsheet में cell B3 = row 1, column 2 (0-indexed)."
          example="Cinema hall में seat A5 का मतलब है Row A, Seat 5 — exactly वैसे ही जैसे seats[0][4] काम करता है!"
          terms={[
            { hindi: 'Row/पंक्ति', english: 'Row', meaning: 'horizontal line — पहला index' },
            { hindi: 'Column/स्तंभ', english: 'Column', meaning: 'vertical line — दूसरा index' },
            { hindi: 'Grid/जाल', english: 'Grid', meaning: '2D array का visual form' },
          ]}
        />
      </SectionBlock>

      {/* Section 7: Big-O Summary */}
      <SectionBlock icon="📊" title="Operations Speed Summary" color="#f43f5e">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, margin: '0 0 24px' }}>
          Here's every array operation and its time complexity — the performance bar shows relative cost.
          Green = fast. Red = potentially slow on large arrays.
        </p>
        <BigOSummary />
        <NeuronTip type="warning">
          Arrays are NOT good for frequent insertions/deletions in the middle. That's where <strong>Linked Lists</strong> shine — coming up in Topic 3!
        </NeuronTip>
      </SectionBlock>

      {/* Final Neuron */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ marginBottom: 40 }}
      >
        <Neuron
          mood="waving"
          size="large"
          message="You now understand how arrays store data in memory — contiguous slots, direct-access by address, O(1) reads, O(n) shifts. Next up: Linked Lists — where elements can live ANYWHERE in memory and link to each other with pointers. Same data, completely different trade-offs!"
        />
      </motion.div>

      {/* Hindi Summary */}
      <SectionBlock icon="हिं" title="हिंदी में Summary" color="#ff9933">
        <HindiExplainer
          concept="Arrays & Memory — Complete Summary"
          english="Arrays and Memory — Full Topic Recap"
          explanation="Computer की RAM एक hotel है। हर कमरे (address) में एक value रहती है। Array इन rooms को एक line में जोड़ता है। Index से element instant मिलता है (O(1))। शुरू में insert करने पर सब elements shift होते हैं (O(n))। Static array full होने पर error देता है, Dynamic array double हो जाता है। 2D array rows और columns का grid है — जैसे spreadsheet या cinema hall।"
          example="Array = hotel का एक floor जहाँ rooms 0, 1, 2, 3... नंबर से हैं। आप सीधे 'Room 3 में जाओ' कह सकते हो — search की ज़रूरत नहीं!"
          terms={[
            { hindi: 'ऐरे / सरणी', english: 'Array', meaning: 'एक लाइन में connected memory slots' },
            { hindi: 'इंडेक्स / क्रमांक', english: 'Index', meaning: 'element की position (0 से शुरू)' },
            { hindi: 'मेमोरी / स्मृति', english: 'Memory (RAM)', meaning: 'data temporarily store करने की जगह' },
            { hindi: 'पता / Address', english: 'Address', meaning: 'memory में exact location' },
            { hindi: 'O(1) — Constant', english: 'Direct access', meaning: 'हमेशा एक ही step, size matter नहीं' },
            { hindi: 'O(n) — Linear', english: 'Shifts/Search', meaning: 'n elements = n steps worst case' },
            { hindi: 'Dynamic Array', english: 'Auto-resize', meaning: 'full होने पर automatically double होता है' },
            { hindi: 'Grid / जाल', english: '2D Array', meaning: 'rows × columns का table structure' },
          ]}
        />
      </SectionBlock>

    </div>
  )
}
