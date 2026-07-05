import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 12 — Hash Maps
   The magic of O(1) lookup — how dictionaries, caches, and
   indexes actually work.
================================================================ */

/* ---- Colour palette ---- */
const C = {
  purple:  '#7c3aed',
  blue:    '#2563eb',
  teal:    '#0891b2',
  green:   '#16a34a',
  orange:  '#ea580c',
  pink:    '#db2777',
  yellow:  '#ca8a04',
  red:     '#dc2626',
  indigo:  '#4f46e5',
}

const BUCKET_COLORS = [
  '#7c3aed','#2563eb','#0891b2','#16a34a',
  '#ea580c','#db2777','#ca8a04','#dc2626',
  '#4f46e5','#059669',
]

/* ----------------------------------------------------------------
   Helper: simple hash function mirroring the visualiser
---------------------------------------------------------------- */
function simpleHash(key, size = 10) {
  let sum = 0
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i)
  return sum % size
}

/* ================================================================
   SECTION 1 — The Phone Book Problem
================================================================ */
function PhoneBookProblem() {
  const [mode, setMode] = useState(null) // 'linear' | 'hash'
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  const TOTAL_PAGES = 40   // visual pages
  const TARGET_PAGE = 32   // "page 4237" scaled to 32
  const HASH_PAGE   = 32

  const reset = () => {
    clearInterval(intervalRef.current)
    setStep(0)
    setDone(false)
    setMode(null)
  }

  const runLinear = () => {
    reset()
    setMode('linear')
    let s = 0
    intervalRef.current = setInterval(() => {
      s++
      setStep(s)
      if (s >= TARGET_PAGE) {
        clearInterval(intervalRef.current)
        setDone(true)
      }
    }, 60)
  }

  const runHash = () => {
    reset()
    setMode('hash')
    setTimeout(() => { setStep(HASH_PAGE); setDone(true) }, 500)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => i)

  return (
    <div style={{ padding: 28 }}>
      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={runLinear}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff',
            fontWeight: 700, fontSize: 14,
          }}>
          Flip pages one by one (Linear Search)
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={runHash}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff',
            fontWeight: 700, fontSize: 14,
          }}>
          Use Hash Function (O(1))
        </motion.button>
        {(mode !== null) && (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={reset}
            style={{
              padding: '10px 22px', borderRadius: 12, border: '2px solid #e5e7eb',
              cursor: 'pointer', background: '#fff', fontWeight: 700, fontSize: 14, color: '#374151',
            }}>
            Reset
          </motion.button>
        )}
      </div>

      {/* Phone book pages grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gap: 4,
        marginBottom: 20,
      }}>
        {pages.map(i => {
          const isTarget = i === TARGET_PAGE - 1
          const isScanned = mode === 'linear' ? i < step : false
          const isJump   = mode === 'hash' && done && isTarget
          const isCurrent = mode === 'linear' && i === step - 1

          return (
            <motion.div key={i}
              animate={isJump ? { scale: [1, 1.35, 1], y: [0, -8, 0] } : {}}
              transition={{ duration: 0.5 }}
              style={{
                height: 26,
                borderRadius: 6,
                fontSize: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#fff',
                background: isJump
                  ? '#7c3aed'
                  : isCurrent
                  ? '#ef4444'
                  : isScanned
                  ? '#fca5a5'
                  : '#e5e7eb',
                transition: 'background 0.15s',
                border: isTarget && mode === 'hash' ? '2px solid #7c3aed' : 'none',
              }}>
              {isTarget ? 'R' : ''}
            </motion.div>
          )
        })}
      </div>

      {/* Stats */}
      <AnimatePresence>
        {mode === 'linear' && (
          <motion.div key="linear-stats"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, padding: '12px 20px',
            }}>
              <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Pages checked</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>
                {step * 250}
              </div>
            </div>
            {done && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  borderRadius: 12, padding: '12px 20px',
                }}>
                <div style={{ fontSize: 11, color: '#ea580c', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Complexity</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ea580c', fontFamily: 'var(--font-heading)' }}>O(n)</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {mode === 'hash' && done && (
          <motion.div key="hash-stats"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>
            <div style={{
              background: '#f5f3ff', border: '1px solid #ddd6fe',
              borderRadius: 12, padding: '12px 20px',
            }}>
              <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Computation</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed' }}>hash("Rahul") = 4237</div>
            </div>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 12, padding: '12px 20px',
            }}>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Checks needed</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', fontFamily: 'var(--font-heading)' }}>1</div>
            </div>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 12, padding: '12px 20px',
            }}>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Complexity</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', fontFamily: 'var(--font-heading)' }}>O(1)</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   SECTION 2 — Hash Function Visualiser
================================================================ */
function HashFunctionVisualiser() {
  const TABLE_SIZE = 10
  const [inputKey, setInputKey] = useState('')
  const [history, setHistory] = useState([])
  const [animating, setAnimating] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(null) // 'chars' | 'sum' | 'mod' | 'done'
  const [currentKey, setCurrentKey] = useState('')

  const buckets = Array.from({ length: TABLE_SIZE }, (_, i) => ({
    idx: i,
    items: history.filter(h => h.bucket === i),
  }))

  const visualise = () => {
    if (!inputKey.trim() || animating) return
    const key = inputKey.trim().slice(0, 12)
    setCurrentKey(key)
    setAnimating(true)
    setCurrentPhase('chars')

    setTimeout(() => setCurrentPhase('sum'), 900)
    setTimeout(() => setCurrentPhase('mod'), 1800)
    setTimeout(() => {
      setCurrentPhase('done')
      const bucket = simpleHash(key, TABLE_SIZE)
      setHistory(prev => [...prev.slice(-14), { key, bucket }])
      setAnimating(false)
      setInputKey('')
    }, 2700)
  }

  const chars = currentKey.split('')
  const asciiVals = chars.map(c => c.charCodeAt(0))
  const total = asciiVals.reduce((a, b) => a + b, 0)
  const bucket = total % TABLE_SIZE

  return (
    <div style={{ padding: 28 }}>
      {/* Input */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <input
          value={inputKey}
          onChange={e => setInputKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && visualise()}
          placeholder="Type a key (name, word, number)..."
          style={{
            flex: 1, minWidth: 200, padding: '10px 16px',
            borderRadius: 10, border: '2px solid #ddd6fe',
            fontSize: 15, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={visualise}
          disabled={animating}
          style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: animating ? '#a5b4fc' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: animating ? 'default' : 'pointer',
          }}>
          Hash It!
        </motion.button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {['Rahul', 'Priya', 'Amit', 'hello', '42'].map(w => (
            <motion.button key={w} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setInputKey(w) }}
              style={{
                padding: '6px 14px', borderRadius: 8,
                background: '#ede9fe', border: '1px solid #c4b5fd',
                color: '#7c3aed', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>
              {w}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <AnimatePresence>
        {currentPhase && (
          <motion.div key="pipeline"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: '#fafafa', border: '2px solid #e5e7eb',
              borderRadius: 18, padding: 24, marginBottom: 24,
            }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Hash Computation Pipeline
            </div>

            {/* Step 1: Characters */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 8 }}>
                Step 1 — Characters → ASCII
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {chars.map((ch, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                      color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 17, fontWeight: 700,
                    }}>{ch}</div>
                    <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 700, marginTop: 3 }}>
                      {currentPhase !== 'chars' ? asciiVals[i] : '?'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Step 2: Sum */}
            {(currentPhase === 'sum' || currentPhase === 'mod' || currentPhase === 'done') && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#ea580c', marginBottom: 8 }}>
                  Step 2 — Sum all ASCII values
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  borderRadius: 10, padding: '8px 14px',
                }}>
                  {asciiVals.map((v, i) => (
                    <span key={i} style={{ color: '#ea580c', fontWeight: 700, fontSize: 14 }}>
                      {v}{i < asciiVals.length - 1 ? ' +' : ''}
                    </span>
                  ))}
                  <span style={{ color: '#9a3412', fontWeight: 800, fontSize: 16, marginLeft: 8 }}>
                    = {total}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Step 3: Modulo */}
            {(currentPhase === 'mod' || currentPhase === 'done') && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', marginBottom: 8 }}>
                  Step 3 — Modulo (% {TABLE_SIZE}) = Bucket Index
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: 10, padding: '8px 18px',
                }}>
                  <span style={{ color: '#374151', fontWeight: 700, fontSize: 16 }}>{total}</span>
                  <span style={{ color: '#6b7280', fontWeight: 700 }}>%</span>
                  <span style={{ color: '#374151', fontWeight: 700, fontSize: 16 }}>{TABLE_SIZE}</span>
                  <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 22 }}>= {bucket}</span>
                </div>
              </motion.div>
            )}

            {/* Result */}
            {currentPhase === 'done' && (
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: `linear-gradient(135deg,${BUCKET_COLORS[bucket]}22,${BUCKET_COLORS[bucket]}11)`,
                  border: `2px solid ${BUCKET_COLORS[bucket]}55`,
                  borderRadius: 12, padding: '12px 20px',
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: BUCKET_COLORS[bucket],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 20,
                }}>
                  {bucket}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Lands in Bucket</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1f2937' }}>"{currentKey}" → bucket {bucket}</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bucket visualisation */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Bucket Array (size {TABLE_SIZE})
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {buckets.map(b => (
            <div key={b.idx} style={{ textAlign: 'center', minWidth: 70 }}>
              <div style={{
                width: 70, minHeight: 52,
                borderRadius: 12,
                background: b.items.length > 0 ? `${BUCKET_COLORS[b.idx]}22` : '#f3f4f6',
                border: `2px solid ${b.items.length > 0 ? BUCKET_COLORS[b.idx] + '66' : '#e5e7eb'}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 6, gap: 3,
              }}>
                {b.items.map((item, ii) => (
                  <motion.div key={ii}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: BUCKET_COLORS[b.idx],
                      color: '#fff', borderRadius: 6,
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 6px', maxWidth: '100%',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                    {item.key}
                  </motion.div>
                ))}
                {b.items.length === 0 && (
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>empty</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, marginTop: 4 }}>
                [{b.idx}]
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 3 — Hash Map Operations
================================================================ */
const INITIAL_MAP_STATE = Array.from({ length: 10 }, () => [])

function HashMapOperations() {
  const [buckets, setBuckets] = useState(INITIAL_MAP_STATE.map(b => [...b]))
  const [keyInput, setKeyInput]   = useState('')
  const [valInput, setValInput]   = useState('')
  const [getKey,   setGetKey]     = useState('')
  const [delKey,   setDelKey]     = useState('')
  const [lastOp,   setLastOp]     = useState(null)
  const [highlight, setHighlight] = useState(null) // { bucket, key, type }
  const [message,   setMessage]   = useState(null)
  const [animKey,   setAnimKey]   = useState(null)

  const totalEntries = buckets.reduce((s, b) => s + b.length, 0)

  const flash = (bucket, key, type, msg) => {
    setHighlight({ bucket, key, type })
    setMessage(msg)
    setTimeout(() => { setHighlight(null); setMessage(null) }, 2000)
  }

  const handlePut = () => {
    const k = keyInput.trim(); const v = valInput.trim()
    if (!k || !v) return
    const idx = simpleHash(k)
    setAnimKey(k)
    setLastOp({ type: 'put', key: k, value: v, bucket: idx })
    setTimeout(() => {
      setBuckets(prev => {
        const next = prev.map(b => [...b])
        const existing = next[idx].findIndex(e => e.key === k)
        if (existing >= 0) next[idx][existing] = { key: k, value: v }
        else next[idx] = [...next[idx], { key: k, value: v }]
        return next
      })
      flash(idx, k, 'put', `"${k}" stored at bucket ${idx}`)
      setAnimKey(null)
      setKeyInput(''); setValInput('')
    }, 600)
  }

  const handleGet = () => {
    const k = getKey.trim()
    if (!k) return
    const idx = simpleHash(k)
    const found = buckets[idx].find(e => e.key === k)
    setLastOp({ type: 'get', key: k, bucket: idx, result: found?.value })
    if (found) flash(idx, k, 'get', `Found! "${k}" = "${found.value}" (bucket ${idx}, O(1))`)
    else flash(idx, k, 'miss', `"${k}" not found in bucket ${idx}`)
  }

  const handleDelete = () => {
    const k = delKey.trim()
    if (!k) return
    const idx = simpleHash(k)
    const exists = buckets[idx].some(e => e.key === k)
    if (exists) {
      flash(idx, k, 'delete', `"${k}" removed from bucket ${idx}`)
      setTimeout(() => {
        setBuckets(prev => {
          const next = prev.map(b => [...b])
          next[idx] = next[idx].filter(e => e.key !== k)
          return next
        })
        setDelKey('')
      }, 600)
    } else {
      flash(idx, k, 'miss', `"${k}" not found`)
    }
    setLastOp({ type: 'delete', key: k, bucket: idx })
  }

  const typeColor = { put: C.green, get: C.blue, delete: C.red, miss: C.orange }

  return (
    <div style={{ padding: 28 }}>
      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginBottom: 28 }}>
        {/* Put */}
        <div style={{
          background: '#f0fdf4', border: '2px solid #bbf7d0',
          borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.green, marginBottom: 10 }}>PUT (key, value)</div>
          <input value={keyInput} onChange={e => setKeyInput(e.target.value)}
            placeholder="Key (e.g. name)" style={inputStyle('#bbf7d0')} />
          <input value={valInput} onChange={e => setValInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePut()}
            placeholder="Value (e.g. phone)" style={{ ...inputStyle('#bbf7d0'), marginTop: 8 }} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handlePut}
            style={{
              marginTop: 10, width: '100%', padding: '9px 0', borderRadius: 10,
              border: 'none', background: C.green, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            Insert
          </motion.button>
        </div>

        {/* Get */}
        <div style={{
          background: '#eff6ff', border: '2px solid #bfdbfe',
          borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.blue, marginBottom: 10 }}>GET (key) → value</div>
          <input value={getKey} onChange={e => setGetKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGet()}
            placeholder="Key to look up" style={inputStyle('#bfdbfe')} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleGet}
            style={{
              marginTop: 10, width: '100%', padding: '9px 0', borderRadius: 10,
              border: 'none', background: C.blue, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            Look Up
          </motion.button>
        </div>

        {/* Delete */}
        <div style={{
          background: '#fef2f2', border: '2px solid #fecaca',
          borderRadius: 14, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.red, marginBottom: 10 }}>DELETE (key)</div>
          <input value={delKey} onChange={e => setDelKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDelete()}
            placeholder="Key to remove" style={inputStyle('#fecaca')} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleDelete}
            style={{
              marginTop: 10, width: '100%', padding: '9px 0', borderRadius: 10,
              border: 'none', background: C.red, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            Remove
          </motion.button>
        </div>
      </div>

      {/* Message bar */}
      <AnimatePresence>
        {message && (
          <motion.div key="msg"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{
              background: highlight?.type === 'get' ? '#eff6ff' : highlight?.type === 'put' ? '#f0fdf4' : highlight?.type === 'delete' ? '#fef2f2' : '#fff7ed',
              border: `2px solid ${typeColor[highlight?.type] ?? C.orange}44`,
              borderRadius: 12, padding: '10px 18px',
              fontSize: 15, fontWeight: 600, color: typeColor[highlight?.type] ?? C.orange,
              marginBottom: 16,
            }}>
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          background: '#f5f3ff', border: '1px solid #ddd6fe',
          borderRadius: 10, padding: '8px 16px',
          fontSize: 14, fontWeight: 700, color: C.purple,
        }}>
          Total Entries: {totalEntries}
        </div>
        {lastOp && (
          <div style={{
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 10, padding: '8px 16px',
            fontSize: 13, fontWeight: 600, color: '#374151',
          }}>
            Last: {lastOp.type.toUpperCase()}("{lastOp.key}") → bucket {lastOp.bucket}
          </div>
        )}
      </div>

      {/* Bucket array */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {buckets.map((chain, idx) => {
          const isHighlighted = highlight?.bucket === idx
          const bc = BUCKET_COLORS[idx]
          return (
            <motion.div key={idx}
              animate={isHighlighted ? { x: [0, 4, -4, 0] } : {}}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: isHighlighted ? `${bc}18` : '#fafafa',
                border: `2px solid ${isHighlighted ? bc : '#e5e7eb'}`,
                borderRadius: 12, padding: '8px 14px',
                transition: 'all 0.2s',
              }}>
              {/* Index badge */}
              <div style={{
                minWidth: 34, height: 34, borderRadius: 9,
                background: bc, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>
                {idx}
              </div>

              {/* Chain */}
              {chain.length === 0 ? (
                <span style={{ fontSize: 13, color: '#9ca3af' }}>— empty —</span>
              ) : (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {chain.map((entry, ei) => {
                    const isThis = isHighlighted && highlight?.key === entry.key
                    return (
                      <AnimatePresence key={entry.key}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7, y: -10 }}
                          animate={{ opacity: 1, scale: isThis && highlight?.type !== 'delete' ? 1.1 : 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 0,
                            borderRadius: 9,
                            border: `2px solid ${isThis ? bc : bc + '44'}`,
                            overflow: 'hidden',
                            boxShadow: isThis ? `0 2px 12px ${bc}44` : 'none',
                          }}>
                          <div style={{
                            background: bc + 'dd',
                            color: '#fff',
                            fontWeight: 700, fontSize: 13,
                            padding: '5px 10px',
                          }}>
                            {entry.key}
                          </div>
                          <div style={{
                            background: '#fff',
                            color: '#374151',
                            fontWeight: 600, fontSize: 13,
                            padding: '5px 10px',
                          }}>
                            {entry.value}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <NeuronTip type="tip">
        All three operations — put, get, delete — jump directly to the bucket using the hash function. No scanning needed. That's why they're all O(1) on average.
      </NeuronTip>
    </div>
  )
}

const inputStyle = borderColor => ({
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: `1.5px solid ${borderColor}`,
  fontSize: 14, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box',
})

/* ================================================================
   SECTION 4 — Collision Handling
================================================================ */
function CollisionHandling() {
  const [strategy, setStrategy] = useState('chaining') // 'chaining' | 'probing'
  const [entries, setEntries] = useState([])
  const [input, setInput]     = useState('')
  const [probeAnim, setProbeAnim] = useState([]) // indices probed

  const TABLE_SIZE = 8

  const addEntry = () => {
    const k = input.trim()
    if (!k || entries.find(e => e.key === k)) return
    const h = simpleHash(k, TABLE_SIZE)

    if (strategy === 'probing') {
      // Find slot via linear probing
      const probes = []
      let slot = h
      const usedSlots = new Set(entries.filter(e => e.strategy === 'probing').map(e => e.slot))
      for (let attempt = 0; attempt < TABLE_SIZE; attempt++) {
        probes.push(slot)
        if (!usedSlots.has(slot)) break
        slot = (slot + 1) % TABLE_SIZE
      }
      // animate probing
      setProbeAnim([])
      probes.forEach((s, i) => {
        setTimeout(() => setProbeAnim(prev => [...prev, s]), i * 350)
      })
      setTimeout(() => {
        setEntries(prev => [...prev, { key: k, hash: h, slot, strategy: 'probing' }])
        setProbeAnim([])
        setInput('')
      }, probes.length * 350 + 200)
    } else {
      setEntries(prev => [...prev, { key: k, hash: h, slot: h, strategy: 'chaining' }])
      setInput('')
    }
  }

  const reset = () => { setEntries([]); setInput(''); setProbeAnim([]) }

  // Build bucket display for chaining
  const chainingBuckets = Array.from({ length: TABLE_SIZE }, (_, i) => ({
    idx: i,
    chain: entries.filter(e => e.strategy === 'chaining' && e.hash === i),
  }))

  // Build slot array for probing
  const probingSlots = Array.from({ length: TABLE_SIZE }, (_, i) => ({
    idx: i,
    entry: entries.find(e => e.strategy === 'probing' && e.slot === i) || null,
    isProbing: probeAnim.includes(i),
  }))

  const sampleKeys = ['Amit', 'Ankit', 'Aarav', 'Ajay', 'Ravi', 'Ram', 'Raj']

  return (
    <div style={{ padding: 28 }}>
      {/* Strategy toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'chaining', label: 'Chaining', desc: 'bucket = linked list', color: C.purple },
          { id: 'probing',  label: 'Open Addressing', desc: 'find next empty slot', color: C.teal },
        ].map(s => (
          <motion.button key={s.id}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setStrategy(s.id); reset() }}
            style={{
              padding: '10px 22px', borderRadius: 12,
              border: `2px solid ${strategy === s.id ? s.color : '#e5e7eb'}`,
              background: strategy === s.id ? s.color + '18' : '#fff',
              color: strategy === s.id ? s.color : '#6b7280',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            {s.label}
            <div style={{ fontSize: 11, fontWeight: 500, marginTop: 2, opacity: 0.7 }}>{s.desc}</div>
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEntry()}
          placeholder="Add a name..."
          style={{ ...inputStyle('#ddd6fe'), minWidth: 180, flex: 1 }} />
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={addEntry}
          style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
          Add
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={reset}
          style={{
            padding: '8px 16px', borderRadius: 10, border: '2px solid #e5e7eb',
            background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
          Clear
        </motion.button>
      </div>

      {/* Quick add buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        <span style={{ fontSize: 12, color: '#9ca3af', alignSelf: 'center' }}>Try:</span>
        {sampleKeys.map(k => (
          <motion.button key={k} whileHover={{ scale: 1.05 }}
            onClick={() => setInput(k)}
            style={{
              padding: '4px 12px', borderRadius: 20,
              background: '#f3f4f6', border: '1px solid #e5e7eb',
              color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
            {k}
          </motion.button>
        ))}
      </div>

      {/* Chaining view */}
      {strategy === 'chaining' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Bucket array — chains grow downward
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {chainingBuckets.map(b => {
              const hasCollision = b.chain.length > 1
              const bc = BUCKET_COLORS[b.idx]
              return (
                <div key={b.idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Index */}
                  <div style={{
                    minWidth: 34, height: 34, borderRadius: 8, background: bc,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>
                    {b.idx}
                  </div>
                  {/* Chain */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    {b.chain.length === 0 ? (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>null</span>
                    ) : (
                      b.chain.map((entry, ci) => (
                        <React.Fragment key={entry.key}>
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            style={{
                              background: hasCollision && ci > 0 ? '#fef3c7' : bc + '22',
                              border: `2px solid ${hasCollision && ci > 0 ? '#fbbf24' : bc + '66'}`,
                              borderRadius: 8, padding: '4px 12px',
                              fontSize: 13, fontWeight: 700,
                              color: hasCollision && ci > 0 ? '#92400e' : '#374151',
                            }}>
                            {entry.key}
                            {hasCollision && ci > 0 && <span style={{ fontSize: 10, marginLeft: 4, color: '#d97706' }}>collision!</span>}
                          </motion.div>
                          {ci < b.chain.length - 1 && (
                            <span style={{ color: '#9ca3af', fontWeight: 700, fontSize: 14 }}>→</span>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {entries.some(e => {
            const sameHash = entries.filter(x => x.hash === e.hash)
            return sameHash.length > 1
          }) && (
            <NeuronTip type="warning">
              Collision detected! Multiple keys share the same bucket. With chaining, they form a linked list. Search time = O(chain length), not O(1).
            </NeuronTip>
          )}
        </div>
      )}

      {/* Open Addressing view */}
      {strategy === 'probing' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Slot array — probe to next empty slot on collision
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {probingSlots.map(s => {
              const bc = BUCKET_COLORS[s.idx]
              const occupied = s.entry !== null
              const isOriginal = s.entry && s.entry.hash === s.idx
              const isDisplaced = s.entry && s.entry.hash !== s.idx
              const isActive = s.isProbing
              return (
                <motion.div key={s.idx}
                  animate={isActive ? { scale: [1, 1.2, 1], backgroundColor: ['#fef9c3','#fde047','#fef9c3'] } : {}}
                  transition={{ duration: 0.35 }}
                  style={{
                    width: 80, minHeight: 70,
                    borderRadius: 14,
                    border: `2px solid ${isActive ? '#fbbf24' : isDisplaced ? '#f59e0b44' : occupied ? bc + '66' : '#e5e7eb'}`,
                    background: isActive ? '#fef3c7' : isDisplaced ? '#fffbeb' : occupied ? bc + '15' : '#fafafa',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: 8, gap: 4, transition: 'all 0.2s',
                  }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>[{s.idx}]</div>
                  {occupied && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: isDisplaced ? '#92400e' : '#1f2937' }}>
                        {s.entry.key}
                      </div>
                      {isDisplaced && (
                        <div style={{ fontSize: 9, color: '#f59e0b', fontWeight: 700 }}>
                          displaced from [{s.entry.hash}]
                        </div>
                      )}
                    </div>
                  )}
                  {isActive && !occupied && (
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                      style={{ width: 20, height: 20, borderRadius: '50%', background: '#fbbf24' }} />
                  )}
                  {!occupied && !isActive && (
                    <span style={{ fontSize: 11, color: '#d1d5db' }}>free</span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}



/* ================================================================
   SECTION 5 — Load Factor & Resizing
================================================================ */
function LoadFactorResizing() {
  const [entries, setEntries] = useState(0)
  const [tableSize, setTableSize] = useState(8)
  const [resizing, setResizing] = useState(false)
  const [resized, setResized] = useState(false)
  const [history, setHistory] = useState([])

  const loadFactor = entries / tableSize
  const MAX_BEFORE_RESIZE = 0.75

  const addEntry = () => {
    if (resizing) return
    const newEntries = entries + 1
    setEntries(newEntries)
    const lf = newEntries / tableSize

    if (lf > MAX_BEFORE_RESIZE) {
      // Trigger resize!
      setResizing(true)
      setTimeout(() => {
        const newSize = tableSize * 2
        setTableSize(newSize)
        setResized(true)
        setHistory(prev => [...prev, { entries: newEntries, oldSize: tableSize, newSize }])
        setResizing(false)
      }, 1200)
    }
  }

  const reset = () => {
    setEntries(0); setTableSize(8); setResizing(false); setResized(false); setHistory([])
  }

  const lfColor = loadFactor < 0.5 ? C.green : loadFactor < 0.75 ? C.yellow : C.red
  const buckets = Array.from({ length: tableSize }, (_, i) => i < entries)

  return (
    <div style={{ padding: 28 }}>
      {/* Load factor gauge */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>
            Load Factor: {entries}/{tableSize} = {loadFactor.toFixed(2)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: lfColor }}>
            {loadFactor < 0.5 ? 'Healthy' : loadFactor < 0.75 ? 'Getting full...' : 'Resize triggered!'}
          </span>
        </div>
        <div style={{ height: 20, borderRadius: 10, background: '#e5e7eb', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${Math.min(loadFactor * 100, 100)}%` }}
            transition={{ duration: 0.4 }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${C.green}, ${lfColor})`,
              borderRadius: 10,
            }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <div style={{ width: 3, height: 10, background: '#ef4444', marginLeft: `${MAX_BEFORE_RESIZE * 100}%` }} />
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
          Resize threshold: 0.75
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={addEntry} disabled={resizing}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none',
            background: resizing ? '#a5b4fc' : 'linear-gradient(135deg,#16a34a,#15803d)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: resizing ? 'default' : 'pointer',
          }}>
          + Add Entry
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={reset}
          style={{
            padding: '10px 22px', borderRadius: 12, border: '2px solid #e5e7eb',
            background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
          Reset
        </motion.button>
      </div>

      {/* Bucket grid */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>
          Table ({tableSize} buckets)
        </div>
        <motion.div
          layout
          style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {buckets.map((filled, i) => (
            <motion.div key={`${tableSize}-${i}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              style={{
                width: 38, height: 38, borderRadius: 9,
                background: filled ? BUCKET_COLORS[i % 10] : '#f3f4f6',
                border: `2px solid ${filled ? BUCKET_COLORS[i % 10] + '88' : '#e5e7eb'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#fff', fontWeight: 700,
              }}>
              {filled ? '●' : ''}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Resize animation indicator */}
      <AnimatePresence>
        {resizing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
              border: '2px solid #fbbf24',
              borderRadius: 14, padding: '16px 22px',
              fontSize: 15, fontWeight: 700, color: '#92400e',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
            <motion.span animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ fontSize: 22 }}>
              ⚙️
            </motion.span>
            Resizing! Doubling table to {tableSize * 2} buckets and rehashing all entries...
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>Resize History</div>
          {history.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              style={{
                background: '#f5f3ff', border: '1px solid #ddd6fe',
                borderRadius: 10, padding: '8px 16px', marginBottom: 6,
                fontSize: 13, color: C.purple, fontWeight: 600,
              }}>
              At {h.entries} entries: {h.oldSize} buckets → {h.newSize} buckets (rehashed everything)
            </motion.div>
          ))}
        </div>
      )}

      <NeuronTip type="deep">
        Without resizing, load factor exceeds 1.0, causing long chains. Lookup degrades from O(1) to O(n). Java's HashMap resizes at 0.75; Python's dict resizes at 0.66.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   SECTION 6 — Two Sum: The Classic Interview Problem
================================================================ */
function TwoSumDemo() {
  const [arr]     = useState([2, 7, 11, 15])
  const [target]  = useState(9)
  const [mode,    setMode]    = useState(null) // 'brute' | 'hashmap'
  const [step,    setStep]    = useState(-1)
  const [pairs,   setPairs]   = useState([])
  const [found,   setFound]   = useState(null)
  const [map,     setMap]     = useState({})
  const [running, setRunning] = useState(false)
  const timerRef = useRef([])

  const clearTimers = () => { timerRef.current.forEach(clearTimeout); timerRef.current = [] }

  const reset = () => {
    clearTimers()
    setMode(null); setStep(-1); setPairs([]); setFound(null); setMap({}); setRunning(false)
  }

  const runBrute = () => {
    reset()
    setMode('brute')
    setRunning(true)
    const allPairs = []
    let delay = 0

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const pair = { i, j, sum: arr[i] + arr[j] }
        allPairs.push(pair)
        const idx = allPairs.length - 1
        delay += 600
        const t = setTimeout(() => {
          setStep(idx)
          setPairs(prev => [...prev, pair])
          if (arr[i] + arr[j] === target) {
            setFound({ i, j })
            setRunning(false)
          }
        }, delay)
        timerRef.current.push(t)
        if (arr[i] + arr[j] === target) break
      }
      if (arr.some((_, i2) => arr.some((_, j2) => i2 < j2 && arr[i2] + arr[j2] === target && i >= i2))) break
    }
    const endTimer = setTimeout(() => setRunning(false), delay + 200)
    timerRef.current.push(endTimer)
  }

  const runHashMap = () => {
    reset()
    setMode('hashmap')
    setRunning(true)
    let delay = 0
    const mapState = {}

    for (let i = 0; i < arr.length; i++) {
      const complement = target - arr[i]
      delay += 700
      const idx = i
      const comp = complement
      const t = setTimeout(() => {
        setStep(idx)
        if (mapState[comp] !== undefined) {
          setFound({ i: mapState[comp], j: idx })
          setRunning(false)
        }
        mapState[arr[idx]] = idx
        setMap({ ...mapState })
      }, delay)
      timerRef.current.push(t)
    }
    const end = setTimeout(() => setRunning(false), delay + 200)
    timerRef.current.push(end)
  }

  useEffect(() => () => clearTimers(), [])

  const totalBrutePairs = (arr.length * (arr.length - 1)) / 2

  return (
    <div style={{ padding: 28 }}>
      {/* Problem statement */}
      <div style={{
        background: '#f5f3ff', border: '2px solid #ddd6fe',
        borderRadius: 16, padding: '18px 24px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.purple, marginBottom: 8 }}>Problem</div>
        <div style={{ fontSize: 16, color: '#1f2937', fontWeight: 600, marginBottom: 8 }}>
          Given{' '}
          <span style={{ background: '#ede9fe', borderRadius: 6, padding: '2px 8px', fontFamily: 'monospace' }}>
            [{arr.join(', ')}]
          </span>
          {' '}find two numbers that sum to{' '}
          <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 6, padding: '2px 10px', fontWeight: 800 }}>
            {target}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Answer: {arr[0]} + {arr[1]} = {target}</div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={runBrute} disabled={running}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none',
            background: running && mode === 'brute' ? '#fca5a5' : 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: running ? 'default' : 'pointer',
          }}>
          Brute Force O(n²)
        </motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={runHashMap} disabled={running}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none',
            background: running && mode === 'hashmap' ? '#a5b4fc' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: running ? 'default' : 'pointer',
          }}>
          Hash Map O(n)
        </motion.button>
        {mode && (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={reset}
            style={{
              padding: '10px 22px', borderRadius: 12, border: '2px solid #e5e7eb',
              background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
            Reset
          </motion.button>
        )}
      </div>

      {/* Array visualisation */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 10 }}>Array</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {arr.map((val, i) => {
            const isActive = mode === 'hashmap' && step === i
            const isFound  = found && (found.i === i || found.j === i)
            return (
              <motion.div key={i}
                animate={isFound ? { scale: [1, 1.2, 1], y: [0, -8, 0] } : isActive ? { y: [0, -4, 0] } : {}}
                transition={{ duration: 0.4 }}
                style={{
                  width: 60, height: 60, borderRadius: 14,
                  background: isFound ? 'linear-gradient(135deg,#16a34a,#15803d)'
                    : isActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                    : '#f3f4f6',
                  border: `2px solid ${isFound ? '#16a34a' : isActive ? '#7c3aed' : '#e5e7eb'}`,
                  color: (isFound || isActive) ? '#fff' : '#1f2937',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 20,
                  transition: 'background 0.3s, color 0.3s',
                }}>
                {val}
                <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, marginTop: 2 }}>[{i}]</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Brute force pair log */}
      {mode === 'brute' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>
            Pairs checked: {pairs.length} / {totalBrutePairs}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {pairs.map((p, pi) => (
              <motion.div key={pi}
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '5px 12px', borderRadius: 8,
                  background: p.sum === target ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${p.sum === target ? '#86efac' : '#fecaca'}`,
                  fontSize: 13, fontWeight: 700,
                  color: p.sum === target ? '#16a34a' : '#ef4444',
                }}>
                ({arr[p.i]},{arr[p.j]}) = {p.sum} {p.sum === target ? '✓' : '✗'}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hash map state */}
      {mode === 'hashmap' && Object.keys(map).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>
            Hash Map state (value → index)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(map).map(([k, v]) => (
              <motion.div key={k}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', borderRadius: 9, overflow: 'hidden',
                  border: '2px solid #7c3aed44',
                }}>
                <div style={{ background: '#7c3aed', color: '#fff', padding: '5px 10px', fontWeight: 700, fontSize: 13 }}>{k}</div>
                <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '5px 10px', fontWeight: 600, fontSize: 13 }}>idx {v}</div>
              </motion.div>
            ))}
            {step >= 0 && !found && (
              <div style={{
                padding: '5px 12px', borderRadius: 9,
                background: '#fffbeb', border: '2px solid #fde68a',
                fontSize: 13, fontWeight: 600, color: '#92400e',
              }}>
                Looking for complement: {target} - {arr[Math.min(step, arr.length - 1)]} = {target - arr[Math.min(step, arr.length - 1)]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {found && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
              border: '2px solid #86efac', borderRadius: 14,
              padding: '18px 24px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
            <span style={{ fontSize: 28 }}>✅</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>
                Found: arr[{found.i}] + arr[{found.j}] = {arr[found.i]} + {arr[found.j]} = {target}
              </div>
              {mode === 'brute' && (
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  Brute force checked {pairs.length} pair(s) — O(n²) in worst case
                </div>
              )}
              {mode === 'hashmap' && (
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  Hash map scanned {arr.length} elements — O(n). Complement lookup = O(1) each time.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronTip type="example">
        Two Sum is the #1 most-asked LeetCode interview question. The hash map trick — "store what you've seen, check if complement exists" — appears in dozens of variations.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic12Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 80px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
          borderRadius: 24,
          padding: '48px 44px',
          marginBottom: 40,
          position: 'relative',
          overflow: 'hidden',
        }}>
        {/* Decorative circles */}
        {[120, 200, 80].map((size, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: size, height: size, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            top: i === 0 ? -30 : i === 1 ? '60%' : '20%',
            right: i === 0 ? -20 : i === 1 ? -50 : '15%',
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
            Topic 12 · DSA
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 42, fontWeight: 800,
            color: '#fff', margin: '0 0 12px', lineHeight: 1.15,
          }}>
            Hash Maps
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', margin: 0, maxWidth: 560, lineHeight: 1.6 }}>
            The magic of O(1) lookup — how dictionaries, caches, and indexes actually work.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            {['O(1) Lookup', 'Hash Function', 'Collision Handling', 'Load Factor', 'Two Sum'].map(tag => (
              <span key={tag} style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: 20, padding: '5px 14px',
                color: '#fff', fontSize: 13, fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section 1 — Phone Book Problem */}
      <SectionBlock icon="📖" title="The Phone Book Problem" color={C.red}>
        <Neuron mood="thinking" message="Imagine finding 'Rahul' in a 10,000-entry phone book by flipping every page. That's O(n). What if a magic formula told you — jump directly to page 4237? That's a hash map." />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Phone Book Search" instruction="Try both methods and see the difference!">
            <PhoneBookProblem />
          </InteractiveDemo>
        </div>
        <NeuronTip type="simple">
          A hash map is like a magic phone book. Instead of flipping pages, you COMPUTE the page number. hash("Rahul") = 4237. Jump there instantly!
        </NeuronTip>
        <HindiExplainer
          concept="फ़ोन बुक की समस्या"
          english="The Phone Book Problem"
          explanation="सोचो तुम्हें 10,000 नामों में 'Rahul' ढूंढना है। एक-एक पन्ना पलटोगे तो 10,000 बार देखना पड़ेगा — यह O(n) है। लेकिन अगर एक जादुई formula हो जो सीधे page number बता दे? hash('Rahul') = 4237 — बस एक jump!"
          example="जैसे dictionary में word ढूंढते वक्त हम सीधे 'R' section खोलते हैं, हर शब्द नहीं पढ़ते।"
          terms={[
            { hindi: 'हैश मैप', english: 'Hash Map', meaning: 'जादुई phone book जो सीधे page बताए' },
            { hindi: 'O(1)', english: 'Constant Time', meaning: 'हर बार एक ही step' },
          ]}
        />
      </SectionBlock>

      {/* Section 2 — Hash Function Visualiser */}
      <SectionBlock icon="🔢" title="Hash Function Visualiser" color={C.purple}>
        <Neuron mood="explaining" message="A hash function converts any key into a number — the bucket index. Three steps: characters → ASCII values → sum → modulo by table size. Try it yourself!" />
        <InteractiveDemo title="Hash Function in Action" instruction="Type any key and watch it transform into a bucket index. Try keys that start with the same letter!">
          <HashFunctionVisualiser />
        </InteractiveDemo>
        <NeuronTip type="fun">
          Python's built-in dict, JavaScript's Object, and Java's HashMap all use hash functions under the hood. When you write <code>{"{"}"name": "Rahul"{"}"}</code>, Python hashes "name" to find the right bucket!
        </NeuronTip>
        <HindiExplainer
          concept="हैश फ़ंक्शन"
          english="Hash Function"
          explanation="हैश फ़ंक्शन key को एक number में बदलता है। कैसे? हर character का ASCII number लो, सब जोड़ो, फिर table size से modulo करो। Result = bucket index — वही जगह जहाँ value रखी जाएगी।"
          example="'Rahul' → R=82, a=97, h=104, u=117, l=108 → sum=508 → 508%10 = 8 → Bucket 8"
          terms={[
            { hindi: 'हैश फ़ंक्शन', english: 'Hash Function', meaning: 'key को number में बदलने वाला formula' },
            { hindi: 'ASCII', english: 'ASCII Code', meaning: 'हर character का number code' },
            { hindi: 'मॉड्यूलो', english: 'Modulo (%)', meaning: 'भाग का remainder — bucket range में रखता है' },
          ]}
        />
      </SectionBlock>

      {/* Section 3 — Hash Map Operations */}
      <SectionBlock icon="⚡" title="Hash Map Operations" color={C.green}>
        <Neuron mood="excited" message="Three operations, all O(1)! Put stores a key-value pair by hashing the key. Get retrieves it by hashing again — same hash, same bucket, instant find. Delete removes it the same way." />
        <InteractiveDemo title="Live Hash Map" instruction="Put, Get, and Delete key-value pairs. Watch values drop into their computed buckets!">
          <HashMapOperations />
        </InteractiveDemo>
        <NeuronTip type="warning">
          If you put() the same key twice, the second value overwrites the first. Hash maps don't allow duplicate keys — that's a feature, not a bug!
        </NeuronTip>
        <HindiExplainer
          concept="हैश मैप के Operations"
          english="Hash Map Operations"
          explanation="तीन main operations: Put (key-value store करो), Get (value ढूंढो), Delete (entry हटाओ)। तीनों में hash function key को bucket index देता है — सीधे वहाँ जाओ! कोई scanning नहीं।"
          example="phone book में: Put('Rahul', '9876543210') → bucket 8 में रखो। Get('Rahul') → bucket 8 में देखो → तुरंत मिला!"
          terms={[
            { hindi: 'कुंजी', english: 'Key', meaning: 'search करने का नाम (जैसे name)' },
            { hindi: 'मान', english: 'Value', meaning: 'stored data (जैसे phone number)' },
          ]}
        />
      </SectionBlock>

      {/* Section 4 — Collision Handling */}
      <SectionBlock icon="💥" title="Collision Handling" color={C.orange}>
        <Neuron mood="thinking" message="What if two different keys hash to the same bucket? That's a collision! Two strategies: Chaining — keep a linked list in the bucket. Open Addressing — probe the next empty slot." />
        <InteractiveDemo title="Collision Strategies" instruction="Switch strategies and add names that start with 'A' — they often collide! Watch chains grow or probing happen.">
          <CollisionHandling />
        </InteractiveDemo>
        <NeuronTip type="deep">
          Java's HashMap uses chaining with red-black trees (when chain length &gt; 8). Python's dict uses open addressing with a more sophisticated probe sequence. Both ensure worst-case performance stays manageable.
        </NeuronTip>
        <HindiExplainer
          concept="टकराव (Collision)"
          english="Collision"
          explanation="जब दो keys का hash same bucket दे, तो टकराव होता है। दो solutions: 1) Chaining — bucket में linked list बनाओ, दोनों entries रखो। 2) Open Addressing — अगला खाली bucket ढूंढो।"
          example="'Amit' और 'Ankit' दोनों bucket 3 में जाते हैं। Chaining में bucket 3 की list में दोनों होंगे।"
          terms={[
            { hindi: 'टकराव', english: 'Collision', meaning: 'दो keys का same bucket में जाना' },
            { hindi: 'चेनिंग', english: 'Chaining', meaning: 'bucket में linked list बनाना' },
            { hindi: 'खुला पता', english: 'Open Addressing', meaning: 'अगला खाली slot ढूंढना' },
          ]}
        />
      </SectionBlock>

      {/* Section 5 — Load Factor & Resizing */}
      <SectionBlock icon="📊" title="Load Factor & Resizing" color={C.teal}>
        <Neuron mood="explaining" message="Load factor = entries / buckets. When it exceeds 0.75, the map DOUBLES its size and rehashes everything. This keeps average chain length short, preserving O(1) performance." />
        <InteractiveDemo title="Dynamic Resizing" instruction="Keep adding entries and watch the table grow. The gauge shows load factor — when it hits 0.75, automatic resize happens!">
          <LoadFactorResizing />
        </InteractiveDemo>
        <NeuronTip type="tip">
          Resizing is O(n) — every existing entry must be rehashed. But it happens so rarely (size doubles each time) that amortised cost per insertion is still O(1).
        </NeuronTip>
        <HindiExplainer
          concept="लोड फ़ैक्टर"
          english="Load Factor"
          explanation="Load factor = entries / total buckets. जब यह 0.75 से ज़्यादा हो जाए, hash map size DOUBLE करके सब entries को नए buckets में rehash करता है। इसी से O(1) performance बनी रहती है।"
          example="8 buckets में 6 entries → load factor = 0.75 → resize! अब 16 buckets। Python और Java दोनों यही करते हैं।"
          terms={[
            { hindi: 'लोड फ़ैक्टर', english: 'Load Factor', meaning: 'कितनी जगह भरी है' },
            { hindi: 'रीसाइज़िंग', english: 'Resizing', meaning: 'size double करना' },
            { hindi: 'रीहैशिंग', english: 'Rehashing', meaning: 'नए size में सब entries डालना' },
          ]}
        />
      </SectionBlock>

      {/* Section 6 — Two Sum */}
      <SectionBlock icon="🎯" title="Two Sum — Classic Interview Problem" color={C.indigo}>
        <Neuron mood="excited" message="LeetCode's most famous problem, solved optimally with a hash map! Brute force checks every pair — O(n²). Hash map: store what you've seen, check if the complement exists — O(n)." />
        <InteractiveDemo title="Two Sum Visualiser" instruction="Run brute force vs hash map and see the dramatic speedup. Watch the hash map's complement lookup happen in O(1).">
          <TwoSumDemo />
        </InteractiveDemo>
        <NeuronTip type="try">
          The Two Sum pattern generalises: "Three Sum", "Subarray with target sum", "Group anagrams" — all use the same idea of storing seen elements in a hash map for O(1) lookup.
        </NeuronTip>
        <HindiExplainer
          concept="Two Sum समस्या"
          english="Two Sum Problem"
          explanation="दिए गए array में दो numbers ढूंढो जिनका sum target हो। Brute force: हर pair check करो — O(n²)। Hash map trick: हर number देखते वक्त map में check करो कि complement (target - current) पहले से है? अगर हाँ — मिल गया! O(n)."
          example="Array [2,7,11,15], target 9. 2 देखा → map में 7 नहीं है → 2 डालो। 7 देखा → map में 2 है! → answer: index 0 और 1."
          terms={[
            { hindi: 'पूरक', english: 'Complement', meaning: 'target - current number' },
            { hindi: 'क्रूर बल', english: 'Brute Force', meaning: 'हर combination try करना' },
          ]}
        />
      </SectionBlock>

      {/* Section 7 — Hindi Summary */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी में समझें" color={C.orange}>
        <Neuron mood="waving" message="Hash maps are everywhere — Python dicts, JavaScript objects, database indexes, caches. Master this pattern and you'll unlock solutions to hundreds of interview problems!" />

        <div style={{
          background: 'linear-gradient(135deg,#fff8f0,#fff5eb)',
          border: '2px solid #ff993340',
          borderTop: '4px solid #ff9933',
          borderRadius: 18,
          padding: 28,
          marginTop: 20,
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2d2d2d', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
            Hash Map = जादुई phone book 📱
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.9, color: '#333', margin: '0 0 20px' }}>
            Hash Map में number डालते ही तुरंत page मिल जाता है! key को hash function एक number में बदलता है — वह number सीधे bucket का address है। कोई searching नहीं, कोई flipping नहीं — बस एक jump!
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12, marginBottom: 20,
          }}>
            {[
              { term: 'Hash Map', hindi: 'हैश मैप', desc: 'जादुई dictionary' },
              { term: 'Hash Function', hindi: 'हैश फ़ंक्शन', desc: 'key → number formula' },
              { term: 'Bucket', hindi: 'बाल्टी / खाना', desc: 'data रखने की जगह' },
              { term: 'Collision', hindi: 'टकराव', desc: 'same bucket में दो keys' },
              { term: 'Key', hindi: 'कुंजी', desc: 'search करने का label' },
              { term: 'Value', hindi: 'मान', desc: 'stored information' },
            ].map(item => (
              <div key={item.term} style={{
                background: '#fff', border: '1px solid #ff993325',
                borderRadius: 12, padding: '12px 16px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#e67e22', marginBottom: 4 }}>{item.term}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#2d2d2d', marginBottom: 2 }}>{item.hindi}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#fff', borderRadius: 12,
            border: '1px solid #ff993325', padding: '14px 18px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e67e22', marginBottom: 8 }}>Key Complexities याद करो</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { op: 'Get / Put / Delete', complexity: 'O(1)', note: 'average case' },
                { op: 'Search (worst case)', complexity: 'O(n)', note: 'all keys collide' },
                { op: 'Space', complexity: 'O(n)', note: 'n entries store करना' },
              ].map(row => (
                <div key={row.op} style={{
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  borderRadius: 9, padding: '8px 14px',
                  fontSize: 13,
                }}>
                  <span style={{ fontWeight: 700, color: '#92400e' }}>{row.op}</span>
                  <span style={{ color: '#ea580c', fontWeight: 800, marginLeft: 8 }}>{row.complexity}</span>
                  <span style={{ color: '#9ca3af', marginLeft: 6 }}>({row.note})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <HindiExplainer
          concept="Hash Map — पूरा सारांश"
          english="Hash Map Complete Summary"
          explanation="Hash Map वह data structure है जो हर operation O(1) में करता है — average case में। Hash function key को bucket address में बदलता है। Collision होने पर chaining या open addressing काम आती है। Load factor 0.75 से ज़्यादा हो तो table double होकर rehash होती है। Python dict, JavaScript Object, Java HashMap — सब इसी पर based हैं।"
          example="Real life: browser cache, database index, Python dictionary, word count program — सब जगह hash map है!"
          terms={[
            { hindi: 'हैश मैप', english: 'Hash Map', meaning: 'O(1) lookup वाली dictionary' },
            { hindi: 'हैश फ़ंक्शन', english: 'Hash Function', meaning: 'key को number में बदलने वाला formula' },
            { hindi: 'बाल्टी', english: 'Bucket', meaning: 'data रखने का container' },
            { hindi: 'टकराव', english: 'Collision', meaning: 'same bucket में दो keys जाना' },
            { hindi: 'कुंजी', english: 'Key', meaning: 'lookup करने का identifier' },
            { hindi: 'मान', english: 'Value', meaning: 'key से जुड़ा data' },
          ]}
        />
      </SectionBlock>

    </div>
  )
}
