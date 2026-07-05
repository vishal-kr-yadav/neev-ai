import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 15 — Database Indexing & Query Performance
   Full table scans vs indexes, B-Tree internals, index types,
   EXPLAIN plans, MongoDB indexing, and the write cost tradeoff.
================================================================ */

/* ---- Full Scan vs Index Lookup ---- */
function FullScanVsIndex() {
  const [method, setMethod] = useState(null)
  const [searching, setSearching] = useState(false)
  const [scannedRows, setScannedRows] = useState(0)
  const [found, setFound] = useState(false)
  const [timeMs, setTimeMs] = useState(null)
  const [litBlocks, setLitBlocks] = useState([])
  const [foundBlock, setFoundBlock] = useState(null)
  const [treePath, setTreePath] = useState([])

  const GRID_COLS = 25
  const GRID_ROWS = 20
  const TOTAL_BLOCKS = GRID_COLS * GRID_ROWS
  const TARGET_BLOCK = 372

  const reset = () => {
    setSearching(false)
    setScannedRows(0)
    setFound(false)
    setTimeMs(null)
    setLitBlocks([])
    setFoundBlock(null)
    setTreePath([])
  }

  const runScan = () => {
    reset()
    setMethod('scan')
    setSearching(true)
    const blocksToLight = []
    for (let i = 0; i <= 20; i++) {
      const idx = Math.floor((i / 20) * TARGET_BLOCK)
      blocksToLight.push(idx)
    }
    blocksToLight.forEach((blockIdx, step) => {
      setTimeout(() => {
        setLitBlocks(prev => [...prev, blockIdx])
        setScannedRows(Math.floor((step / 20) * 742891))
        if (step === 20) {
          setFound(true)
          setFoundBlock(TARGET_BLOCK)
          setScannedRows(742891)
          setTimeMs(320)
          setSearching(false)
        }
      }, step * 50)
    })
  }

  const runIndex = () => {
    reset()
    setMethod('index')
    setSearching(true)
    const pathBlocks = [12, 87, 248]
    pathBlocks.forEach((blockIdx, step) => {
      setTimeout(() => {
        setTreePath(prev => [...prev, blockIdx])
        if (step === pathBlocks.length - 1) {
          setTimeout(() => {
            setFound(true)
            setFoundBlock(TARGET_BLOCK)
            setScannedRows(3)
            setTimeMs(0.1)
            setSearching(false)
          }, 200)
        }
      }, step * 600)
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runScan}
          disabled={searching}
          style={{
            padding: '10px 24px', borderRadius: 12, border: '2px solid #ef4444',
            background: method === 'scan' ? '#ef444415' : 'var(--bg-secondary)',
            color: '#ef4444', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer',
            fontSize: 14, fontFamily: 'var(--font-sans)', opacity: searching ? 0.6 : 1,
          }}
        >
          Full Table Scan
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runIndex}
          disabled={searching}
          style={{
            padding: '10px 24px', borderRadius: 12, border: '2px solid #10b981',
            background: method === 'index' ? '#10b98115' : 'var(--bg-secondary)',
            color: '#10b981', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer',
            fontSize: 14, fontFamily: 'var(--font-sans)', opacity: searching ? 0.6 : 1,
          }}
        >
          Index Lookup
        </motion.button>
      </div>

      {/* Grid visualization */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gap: 3,
        marginBottom: 20, padding: 16, borderRadius: 14,
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      }}>
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
          const isLit = litBlocks.includes(i)
          const isTreeNode = treePath.includes(i)
          const isFound = foundBlock === i
          let bg = '#334155'
          if (isFound) bg = '#10b981'
          else if (isTreeNode) bg = '#8b5cf6'
          else if (isLit) bg = '#f59e0b'
          return (
            <motion.div
              key={i}
              animate={isFound ? { scale: [1, 1.4, 1] } : isLit || isTreeNode ? { opacity: [0.5, 1] } : {}}
              transition={{ duration: 0.3 }}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: 3,
                background: bg, transition: 'background 0.15s',
              }}
            />
          )
        })}
      </div>

      {/* Stats */}
      {method && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20,
          }}
        >
          <div style={{
            padding: '12px 20px', borderRadius: 12,
            background: method === 'scan' ? '#ef444410' : '#10b98110',
            border: `1.5px solid ${method === 'scan' ? '#ef444430' : '#10b98130'}`,
            flex: 1, minWidth: 200,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Rows examined</div>
            <div style={{
              fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)',
              color: method === 'scan' ? '#ef4444' : '#10b981',
            }}>
              {scannedRows.toLocaleString()}
            </div>
          </div>
          {timeMs !== null && (
            <div style={{
              padding: '12px 20px', borderRadius: 12,
              background: method === 'scan' ? '#ef444410' : '#10b98110',
              border: `1.5px solid ${method === 'scan' ? '#ef444430' : '#10b98130'}`,
              flex: 1, minWidth: 200,
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Time</div>
              <div style={{
                fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)',
                color: method === 'scan' ? '#ef4444' : '#10b981',
              }}>
                {timeMs}ms
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Comparison bar */}
      {found && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Time Comparison
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, width: 100 }}>Full Scan</span>
              <div style={{ flex: 1, height: 20, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', background: '#ef4444', borderRadius: 6 }}
                />
              </div>
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, width: 60 }}>320ms</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, width: 100 }}>Index</span>
              <div style={{ flex: 1, height: 20, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '0.03%' }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', background: '#10b981', borderRadius: 6, minWidth: 4 }}
                />
              </div>
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, width: 60 }}>0.1ms</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            Index lookup is <strong style={{ color: '#10b981' }}>3,200x faster</strong> than a full table scan
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ---- B-Tree Visualizer ---- */
function BTreeVisualizer() {
  const [searchValue, setSearchValue] = useState('')
  const [traversalPath, setTraversalPath] = useState([])
  const [currentLevel, setCurrentLevel] = useState(-1)
  const [animating, setAnimating] = useState(false)
  const [annotations, setAnnotations] = useState([])

  const tree = [
    [{ id: 'r', keys: ['250K', '500K', '750K'] }],
    [
      { id: 'l1a', keys: ['62K', '125K', '187K'] },
      { id: 'l1b', keys: ['312K', '375K', '437K'] },
      { id: 'l1c', keys: ['562K', '625K', '687K'] },
      { id: 'l1d', keys: ['812K', '875K', '937K'] },
    ],
    [
      { id: 'l2a', keys: ['15K', '31K'] },
      { id: 'l2b', keys: ['93K', '109K'] },
      { id: 'l2c', keys: ['156K', '171K'] },
      { id: 'l2d', keys: ['218K', '234K'] },
      { id: 'l2e', keys: ['281K', '296K'] },
      { id: 'l2f', keys: ['343K', '359K'] },
      { id: 'l2g', keys: ['531K', '546K'] },
      { id: 'l2h', keys: ['781K', '796K'] },
    ],
    [
      { id: 'leaf1', keys: ['Row 742,891'] },
      { id: 'leaf2', keys: ['Row 312,044'] },
      { id: 'leaf3', keys: ['Row 125,000'] },
      { id: 'leaf4', keys: ['Row 999,999'] },
    ],
  ]

  const getPath = (val) => {
    const v = parseInt(val)
    if (isNaN(v) || v < 1 || v > 1000000) return null
    const path = []
    const annots = []

    // Level 0: root
    if (v <= 250000) {
      path.push('r'); annots.push(`Is ${v.toLocaleString()} <= 250K? Yes -- Go left`)
      path.push('l1a'); annots.push(`Narrowing in range 0-250K`)
      path.push('l2a'); annots.push(`Narrowing further...`)
      path.push('leaf3'); annots.push(`Found at leaf level!`)
    } else if (v <= 500000) {
      path.push('r'); annots.push(`Is ${v.toLocaleString()} > 250K? Yes. > 500K? No -- Go second`)
      path.push('l1b'); annots.push(`Narrowing in range 250K-500K`)
      path.push('l2e'); annots.push(`Narrowing further...`)
      path.push('leaf2'); annots.push(`Found at leaf level!`)
    } else if (v <= 750000) {
      path.push('r'); annots.push(`Is ${v.toLocaleString()} > 500K? Yes. > 750K? No -- Go third`)
      path.push('l1c'); annots.push(`Narrowing in range 500K-750K`)
      path.push('l2g'); annots.push(`Narrowing further...`)
      path.push('leaf1'); annots.push(`Found at leaf level!`)
    } else {
      path.push('r'); annots.push(`Is ${v.toLocaleString()} > 750K? Yes -- Go right`)
      path.push('l1d'); annots.push(`Narrowing in range 750K-1M`)
      path.push('l2h'); annots.push(`Narrowing further...`)
      path.push('leaf4'); annots.push(`Found at leaf level!`)
    }
    return { path, annots }
  }

  const handleSearch = () => {
    const result = getPath(searchValue)
    if (!result || animating) return
    setAnimating(true)
    setTraversalPath([])
    setAnnotations([])
    setCurrentLevel(-1)

    result.path.forEach((nodeId, i) => {
      setTimeout(() => {
        setTraversalPath(prev => [...prev, nodeId])
        setCurrentLevel(i)
        setAnnotations(prev => [...prev, result.annots[i]])
        if (i === result.path.length - 1) {
          setAnimating(false)
        }
      }, i * 600)
    })
  }

  const levelColors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']

  return (
    <div>
      {/* Search input */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          Search for row ID:
        </label>
        <input
          type="number"
          min="1"
          max="1000000"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="e.g. 742891"
          style={{
            padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontSize: 14, fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            width: 160, outline: 'none',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={animating || !searchValue}
          style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: '#10b981', color: '#fff', fontWeight: 700,
            cursor: animating ? 'not-allowed' : 'pointer',
            fontSize: 14, fontFamily: 'var(--font-sans)',
            opacity: animating || !searchValue ? 0.6 : 1,
          }}
        >
          Search
        </motion.button>
      </div>

      {/* B-Tree visualization */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 14, padding: 24,
        border: '1px solid var(--border)', overflowX: 'auto',
      }}>
        {tree.map((level, li) => (
          <div key={li} style={{
            display: 'flex', justifyContent: 'center', gap: li === 0 ? 0 : li === 1 ? 24 : 12,
            marginBottom: li < tree.length - 1 ? 20 : 0, flexWrap: 'wrap',
          }}>
            {level.map(node => {
              const isActive = traversalPath.includes(node.id)
              const isCurrentStep = traversalPath[currentLevel] === node.id
              return (
                <motion.div
                  key={node.id}
                  animate={isCurrentStep ? { scale: [1, 1.08, 1], boxShadow: `0 0 20px ${levelColors[li]}40` } : {}}
                  transition={{ duration: 0.4 }}
                  style={{
                    display: 'flex', gap: 2, padding: '8px 14px', borderRadius: 10,
                    border: `2px solid ${isActive ? levelColors[li] : 'var(--border)'}`,
                    background: isActive ? `${levelColors[li]}15` : 'var(--bg-card)',
                    transition: 'all 0.3s',
                  }}
                >
                  {node.keys.map((k, ki) => (
                    <span key={ki} style={{
                      padding: '4px 10px', fontSize: 12, fontWeight: 700,
                      color: isActive ? levelColors[li] : 'var(--text-muted)',
                      fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                      borderRight: ki < node.keys.length - 1 ? `1px solid ${isActive ? levelColors[li] + '40' : 'var(--border)'}` : 'none',
                    }}>
                      {k}
                    </span>
                  ))}
                </motion.div>
              )
            })}
          </div>
        ))}
        {/* Level labels */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {['Root', 'Internal', 'Internal', 'Leaf'].map((label, i) => (
            <span key={i} style={{
              fontSize: 11, color: levelColors[i], fontWeight: 600,
              padding: '2px 8px', borderRadius: 6, background: `${levelColors[i]}10`,
            }}>
              Level {i}: {label}
            </span>
          ))}
        </div>
      </div>

      {/* Annotation */}
      <AnimatePresence mode="wait">
        {annotations.length > 0 && (
          <motion.div
            key={currentLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 16, padding: '12px 18px', borderRadius: 12,
              background: `${levelColors[currentLevel] || '#3b82f6'}10`,
              border: `1.5px solid ${levelColors[currentLevel] || '#3b82f6'}30`,
              fontSize: 14, fontWeight: 600,
              color: levelColors[currentLevel] || 'var(--text-secondary)',
            }}
          >
            Step {currentLevel + 1}: {annotations[currentLevel]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {traversalPath.length === 4 && !animating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 16, padding: '14px 20px', borderRadius: 12,
            background: '#10b98110', border: '1.5px solid #10b98130',
            display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
          }}
        >
          {[
            { label: 'Comparisons made', value: '4' },
            { label: 'Rows in table', value: '1,000,000' },
            { label: 'Formula', value: 'log₂(1,000,000) ≈ 20' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981', fontFamily: "'Fira Code', monospace" }}>
                {s.value}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

/* ---- Index Type Explorer ---- */
function IndexTypeExplorer() {
  const [activeType, setActiveType] = useState(0)

  const types = [
    {
      name: 'B-Tree',
      color: '#3b82f6',
      operators: ['=', '<', '>', '<=', '>=', 'BETWEEN', 'ORDER BY', "LIKE 'abc%'"],
      sql: `CREATE INDEX idx_email ON users(email);

-- Range query: uses B-Tree
SELECT * FROM users
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY created_at;`,
      visual: 'balanced-tree',
      performance: { read: 5, write: 2, storage: 3 },
      description: 'Default index type. Keeps data sorted in a balanced tree structure. Perfect for range queries, sorting, and equality checks.',
    },
    {
      name: 'Hash',
      color: '#f59e0b',
      operators: ['= (exact match only)'],
      sql: `CREATE INDEX idx_email_hash ON users USING HASH (email);

-- Only works for exact match:
SELECT * FROM users WHERE email = 'test@test.com';
-- Does NOT work for: <, >, BETWEEN, ORDER BY, LIKE`,
      visual: 'hash-buckets',
      performance: { read: 5, write: 1, storage: 2 },
      description: 'Hash function maps keys to buckets. Lightning-fast for exact lookups but cannot do range queries or sorting.',
    },
    {
      name: 'GIN/Full-Text',
      color: '#8b5cf6',
      operators: ['@@', 'to_tsvector', 'to_tsquery', 'CONTAINS', 'ARRAY operators'],
      sql: `-- PostgreSQL full-text search
CREATE INDEX idx_search ON articles
USING GIN (to_tsvector('english', title || ' ' || body));

SELECT * FROM articles
WHERE to_tsvector('english', title || ' ' || body)
  @@ to_tsquery('database & indexing');`,
      visual: 'inverted-index',
      performance: { read: 4, write: 3, storage: 4 },
      description: 'Generalized Inverted Index. Maps each word/token to the list of documents containing it. Essential for full-text search and array columns.',
    },
    {
      name: 'Compound',
      color: '#10b981',
      operators: ['Multi-column queries (left-to-right prefix rule)'],
      sql: `CREATE INDEX idx_location ON addresses(country, city, zipcode);

-- Uses the index (leftmost prefix):
WHERE country = 'IN'
WHERE country = 'IN' AND city = 'Delhi'
WHERE country = 'IN' AND city = 'Delhi' AND zipcode = '110001'

-- CANNOT use the index (skips leftmost):
WHERE city = 'Delhi'
WHERE zipcode = '110001'`,
      visual: 'compound',
      performance: { read: 5, write: 3, storage: 3 },
      description: 'Single index on multiple columns. Column ORDER matters! Queries must use the leftmost prefix to benefit from the index.',
    },
    {
      name: 'MongoDB Indexes',
      color: '#47a248',
      operators: ['Single field', 'Compound', 'Text', '2dsphere (geo)', 'TTL'],
      sql: `// Single field
db.collection.createIndex({ email: 1 })

// Compound (order matters!)
db.collection.createIndex({ userId: 1, status: 1, createdAt: -1 })

// Text search
db.collection.createIndex({ name: "text", description: "text" })

// Geospatial
db.collection.createIndex({ location: "2dsphere" })`,
      visual: 'mongodb',
      performance: { read: 5, write: 2, storage: 3 },
      description: 'MongoDB uses B-Tree indexes by default. 1 = ascending, -1 = descending. Special types for text search and geospatial queries.',
    },
  ]

  const t = types[activeType]

  const compoundRules = [
    { query: "WHERE country = 'IN'", works: true, reason: 'Uses leftmost prefix' },
    { query: "WHERE country = 'IN' AND city = 'Delhi'", works: true, reason: 'Uses first 2 columns' },
    { query: "WHERE city = 'Delhi'", works: false, reason: 'Skips leftmost column' },
    { query: "WHERE zipcode = '110001'", works: false, reason: 'Skips leftmost columns' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {types.map((tp, i) => (
          <motion.button
            key={tp.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveType(i)}
            style={{
              padding: '10px 18px', borderRadius: 12, border: '2px solid',
              borderColor: activeType === i ? tp.color : 'var(--border)',
              background: activeType === i ? `${tp.color}15` : 'var(--bg-secondary)',
              color: activeType === i ? tp.color : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {tp.name}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Description */}
          <div style={{
            background: `${t.color}10`, border: `1.5px solid ${t.color}30`,
            borderRadius: 14, padding: '16px 20px', marginBottom: 16,
          }}>
            <div style={{
              fontSize: 18, fontWeight: 800, color: t.color,
              fontFamily: 'var(--font-heading)', marginBottom: 6,
            }}>
              {t.name}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {t.description}
            </div>
          </div>

          {/* Supported operators */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              When to use:
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {t.operators.map(op => (
                <span key={op} style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: `${t.color}15`, color: t.color,
                  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                }}>
                  {op}
                </span>
              ))}
            </div>
          </div>

          {/* SQL syntax */}
          <div style={{
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontSize: 13, background: '#1e293b', color: '#e2e8f0',
            padding: 20, borderRadius: 12, overflowX: 'auto',
            marginBottom: 16, lineHeight: 1.8, whiteSpace: 'pre',
          }}>
            {t.sql}
          </div>

          {/* Performance characteristics */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16,
          }}>
            {[
              { label: 'Read Speed', value: t.performance.read, color: '#10b981' },
              { label: 'Write Cost', value: t.performance.write, color: '#ef4444' },
              { label: 'Storage', value: t.performance.storage, color: '#3b82f6' },
            ].map(p => (
              <div key={p.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 16, color: p.color }}>
                  {'★'.repeat(p.value)}{'☆'.repeat(5 - p.value)}
                </div>
              </div>
            ))}
          </div>

          {/* Compound index rules */}
          {activeType === 3 && (
            <div style={{
              background: 'var(--bg-card)', border: '1.5px solid #10b98130',
              borderRadius: 14, padding: 20, marginTop: 8,
            }}>
              <div style={{
                fontSize: 15, fontWeight: 700, color: '#10b981',
                fontFamily: 'var(--font-heading)', marginBottom: 14,
              }}>
                Index on (country, city, zipcode) -- Left-to-Right Rule
              </div>
              {/* Column arrows */}
              <div style={{
                display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16,
              }}>
                {['country', 'city', 'zipcode'].map((col, i) => (
                  <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      padding: '8px 16px', borderRadius: 8,
                      background: '#10b98120', border: '2px solid #10b981',
                      fontWeight: 700, fontSize: 13, color: '#10b981',
                      fontFamily: "'Fira Code', monospace",
                    }}>
                      {col}
                    </div>
                    {i < 2 && <span style={{ color: '#10b981', fontSize: 18 }}>&rarr;</span>}
                  </div>
                ))}
              </div>
              {compoundRules.map((rule, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '8px 14px', borderRadius: 8, marginBottom: 6,
                    background: rule.works ? '#10b98108' : '#ef444408',
                    border: `1px solid ${rule.works ? '#10b98120' : '#ef444420'}`,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{rule.works ? '✅' : '❌'}</span>
                  <code style={{
                    fontSize: 12, fontFamily: "'Fira Code', monospace",
                    color: rule.works ? '#10b981' : '#ef4444', fontWeight: 600, flex: 1,
                  }}>
                    {rule.query}
                  </code>
                  <span style={{
                    fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic',
                  }}>
                    {rule.reason}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- EXPLAIN Plan Interpreter ---- */
function ExplainPlanInterpreter() {
  const [activeQuery, setActiveQuery] = useState(0)

  const queries = [
    {
      title: 'No Index -- Sequential Scan',
      badge: { label: 'Seq Scan', color: '#ef4444', icon: '🔴' },
      sql: `SELECT * FROM users WHERE email = 'test@test.com';`,
      explain: `Seq Scan on users  (cost=0.00..35811.00 rows=1000000 width=64)
  Filter: (email = 'test@test.com'::text)
  Rows Removed by Filter: 999999
  Planning Time: 0.085 ms
  Execution Time: 320.456 ms`,
      metrics: { rows: '1,000,000', cost: '35,811', time: '320ms' },
      annotation: 'Seq Scan = database reads every single row. No index exists on email column, so it must check all 1M rows.',
    },
    {
      title: 'With Index -- Index Scan',
      badge: { label: 'Index Scan', color: '#10b981', icon: '🟢' },
      sql: `-- After: CREATE INDEX idx_email ON users(email);
SELECT * FROM users WHERE email = 'test@test.com';`,
      explain: `Index Scan using idx_email on users  (cost=0.42..8.44 rows=1 width=64)
  Index Cond: (email = 'test@test.com'::text)
  Planning Time: 0.092 ms
  Execution Time: 0.105 ms`,
      metrics: { rows: '1', cost: '8.44', time: '0.1ms' },
      annotation: 'Index Scan = B-Tree traversal to find exactly 1 row. 3200x faster! The index on email allows direct lookup.',
    },
    {
      title: 'Partial Index -- Bitmap Scan',
      badge: { label: 'Bitmap Scan', color: '#f59e0b', icon: '🟡' },
      sql: `SELECT * FROM orders
WHERE user_id = 5 AND status = 'pending';`,
      explain: `Bitmap Heap Scan on orders  (cost=12.45..524.82 rows=500 width=48)
  Recheck Cond: (user_id = 5)
  Filter: (status = 'pending'::text)
  Rows Removed by Filter: 300
  -> Bitmap Index Scan on idx_user_id  (cost=0.00..12.32 rows=800)
       Index Cond: (user_id = 5)
  Planning Time: 0.156 ms
  Execution Time: 2.340 ms`,
      metrics: { rows: '500', cost: '524', time: '2.3ms' },
      annotation: 'Bitmap Scan uses index on user_id to find 800 rows, then filters by status in memory. A compound index on (user_id, status) would be better.',
    },
    {
      title: 'Compound Index -- Index Scan Backward',
      badge: { label: 'Index Scan', color: '#10b981', icon: '🟢' },
      sql: `SELECT * FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC LIMIT 10;`,
      explain: `Limit  (cost=0.42..12.35 rows=10 width=48)
  -> Index Scan Backward using idx_status_created
     on orders  (cost=0.42..856.23 rows=7200)
       Index Cond: (status = 'pending'::text)
  Planning Time: 0.112 ms
  Execution Time: 0.523 ms`,
      metrics: { rows: '10', cost: '12.35', time: '0.5ms' },
      annotation: 'Index Scan Backward on compound index (status, created_at). The index is already sorted, so ORDER BY + LIMIT is nearly free!',
    },
  ]

  const q = queries[activeQuery]

  return (
    <div>
      {/* Query selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {queries.map((query, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveQuery(i)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: '2px solid',
              borderColor: activeQuery === i ? query.badge.color : 'var(--border)',
              background: activeQuery === i ? `${query.badge.color}15` : 'var(--bg-secondary)',
              color: activeQuery === i ? query.badge.color : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {query.badge.icon} {query.title}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeQuery}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            background: `${q.badge.color}20`, border: `1.5px solid ${q.badge.color}`,
            fontSize: 13, fontWeight: 700, color: q.badge.color, marginBottom: 14,
          }}>
            {q.badge.icon} {q.badge.label}
          </div>

          {/* SQL */}
          <div style={{
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontSize: 13, background: '#1e293b', color: '#e2e8f0',
            padding: 20, borderRadius: 12, overflowX: 'auto',
            marginBottom: 12, lineHeight: 1.8, whiteSpace: 'pre',
          }}>
            {q.sql}
          </div>

          {/* EXPLAIN output */}
          <div style={{
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontSize: 12, background: '#0f172a', color: '#94a3b8',
            padding: 20, borderRadius: 12, overflowX: 'auto',
            marginBottom: 14, lineHeight: 1.8, whiteSpace: 'pre',
            borderLeft: `4px solid ${q.badge.color}`,
          }}>
            {q.explain}
          </div>

          {/* Key metrics */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14,
          }}>
            {[
              { label: 'Rows Examined', value: q.metrics.rows },
              { label: 'Estimated Cost', value: q.metrics.cost },
              { label: 'Actual Time', value: q.metrics.time },
            ].map(m => (
              <div key={m.label} style={{
                flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: q.badge.color,
                  fontFamily: "'Fira Code', monospace",
                }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Annotation */}
          <div style={{
            padding: '12px 18px', borderRadius: 12,
            background: `${q.badge.color}08`, border: `1.5px solid ${q.badge.color}25`,
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <strong style={{ color: q.badge.color }}>What to look for:</strong> {q.annotation}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- MongoDB Index Playground ---- */
function MongoIndexPlayground() {
  const [activeScenario, setActiveScenario] = useState(0)

  const scenarios = [
    {
      title: 'No Index (COLLSCAN)',
      badge: { label: 'COLLSCAN', color: '#ef4444' },
      query: `db.users.find({ email: "test@test.com" })`,
      index: null,
      explain: `{
  "queryPlanner": {
    "winningPlan": {
      "stage": "COLLSCAN",
      "filter": { "email": { "$eq": "test@test.com" } },
      "direction": "forward"
    }
  },
  "executionStats": {
    "totalDocsExamined": 1000000,
    "totalKeysExamined": 0,
    "executionTimeMillis": 450
  }
}`,
      annotation: 'COLLSCAN = Collection Scan. MongoDB reads every single document. This is the equivalent of a full table scan in SQL.',
    },
    {
      title: 'Single Field (IXSCAN)',
      badge: { label: 'IXSCAN', color: '#10b981' },
      query: `db.users.find({ email: "test@test.com" })`,
      index: `db.users.createIndex({ email: 1 })`,
      explain: `{
  "queryPlanner": {
    "winningPlan": {
      "stage": "FETCH",
      "inputStage": {
        "stage": "IXSCAN",
        "indexName": "email_1",
        "direction": "forward"
      }
    }
  },
  "executionStats": {
    "totalDocsExamined": 1,
    "totalKeysExamined": 1,
    "executionTimeMillis": 1
  }
}`,
      annotation: 'IXSCAN = Index Scan. With an index on email, MongoDB jumps directly to the matching document. 450x faster!',
    },
    {
      title: 'Compound + ESR Rule',
      badge: { label: 'IXSCAN', color: '#3b82f6' },
      query: `db.orders.find({
  userId: ObjectId("..."),
  status: "pending"
}).sort({ createdAt: -1 })`,
      index: `db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 })`,
      explain: `{
  "queryPlanner": {
    "winningPlan": {
      "stage": "FETCH",
      "inputStage": {
        "stage": "IXSCAN",
        "indexName": "userId_1_status_1_createdAt_-1",
        "direction": "forward"
      }
    }
  },
  "executionStats": {
    "totalDocsExamined": 15,
    "totalKeysExamined": 15,
    "executionTimeMillis": 2
  }
}`,
      annotation: 'ESR Rule: Equality fields first (userId, status), then Sort fields (createdAt), then Range fields last. This order maximizes index efficiency.',
    },
    {
      title: 'Text Index',
      badge: { label: 'TEXT_MATCH', color: '#10b981' },
      query: `db.products.find({
  $text: { $search: "wireless headphones" }
})`,
      index: `db.products.createIndex({ name: "text", description: "text" })`,
      explain: `{
  "queryPlanner": {
    "winningPlan": {
      "stage": "FETCH",
      "inputStage": {
        "stage": "TEXT_MATCH",
        "indexName": "name_text_description_text",
        "parsedTextQuery": {
          "terms": ["wireless", "headphones"],
          "negatedTerms": []
        }
      }
    }
  },
  "executionStats": {
    "totalDocsExamined": 42,
    "totalKeysExamined": 42,
    "executionTimeMillis": 5
  }
}`,
      annotation: 'TEXT_MATCH uses MongoDB text index to find documents containing "wireless" or "headphones" in name/description fields.',
    },
  ]

  const s = scenarios[activeScenario]

  return (
    <div>
      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {scenarios.map((sc, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveScenario(i)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: '2px solid',
              borderColor: activeScenario === i ? sc.badge.color : 'var(--border)',
              background: activeScenario === i ? `${sc.badge.color}15` : 'var(--bg-secondary)',
              color: activeScenario === i ? sc.badge.color : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {sc.title}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeScenario}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            background: `${s.badge.color}20`, border: `1.5px solid ${s.badge.color}`,
            fontSize: 13, fontWeight: 700, color: s.badge.color, marginBottom: 14,
          }}>
            Stage: {s.badge.label}
          </div>

          {/* Index creation (if any) */}
          {s.index && (
            <div style={{
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              fontSize: 13, background: '#064e3b', color: '#6ee7b7',
              padding: 16, borderRadius: 12, overflowX: 'auto',
              marginBottom: 10, lineHeight: 1.6, whiteSpace: 'pre',
            }}>
              <span style={{ opacity: 0.6 }}>// Create index first:</span>{'\n'}{s.index}
            </div>
          )}

          {/* Query */}
          <div style={{
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontSize: 13, background: '#1e293b', color: '#e2e8f0',
            padding: 20, borderRadius: 12, overflowX: 'auto',
            marginBottom: 12, lineHeight: 1.8, whiteSpace: 'pre',
          }}>
            {s.query}
          </div>

          {/* explain() output */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 10, right: 14,
              fontSize: 11, color: '#64748b', fontWeight: 600,
            }}>
              .explain("executionStats")
            </div>
            <div style={{
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              fontSize: 12, background: '#0f172a', color: '#94a3b8',
              padding: 20, borderRadius: 12, overflowX: 'auto',
              marginBottom: 14, lineHeight: 1.7, whiteSpace: 'pre',
              borderLeft: `4px solid ${s.badge.color}`,
            }}>
              {s.explain}
            </div>
          </div>

          {/* ESR visual for compound scenario */}
          {activeScenario === 2 && (
            <div style={{
              background: '#3b82f610', border: '1.5px solid #3b82f630',
              borderRadius: 12, padding: 18, marginBottom: 14,
            }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: '#3b82f6',
                fontFamily: 'var(--font-heading)', marginBottom: 12,
              }}>
                ESR Rule: Equality -- Sort -- Range
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { letter: 'E', label: 'Equality', fields: 'userId, status', color: '#10b981' },
                  { letter: 'S', label: 'Sort', fields: 'createdAt', color: '#f59e0b' },
                  { letter: 'R', label: 'Range', fields: '(none here)', color: '#ef4444' },
                ].map((esr, i) => (
                  <div key={esr.letter} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${esr.color}20`, border: `2px solid ${esr.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 800, color: esr.color,
                    }}>
                      {esr.letter}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: esr.color }}>{esr.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{esr.fields}</div>
                    </div>
                    {i < 2 && <span style={{ color: '#3b82f6', fontSize: 18, margin: '0 4px' }}>&rarr;</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Annotation */}
          <div style={{
            padding: '12px 18px', borderRadius: 12,
            background: `${s.badge.color}08`, border: `1.5px solid ${s.badge.color}25`,
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <strong style={{ color: s.badge.color }}>Key insight:</strong> {s.annotation}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Index Cost Calculator ---- */
function IndexCostCalculator() {
  const [numIndexes, setNumIndexes] = useState(3)
  const [readWriteRatio, setReadWriteRatio] = useState(70)

  const readPerf = Math.min(95, 30 + numIndexes * 13)
  const writePerf = Math.max(20, 100 - (numIndexes - 1) * (80 / 14))
  const storageGB = 10 + numIndexes * 2
  const baseGB = 10

  // Net throughput: weighted by read/write ratio
  const readWeight = readWriteRatio / 100
  const writeWeight = 1 - readWeight
  const netThroughput = readPerf * readWeight + writePerf * writeWeight

  return (
    <div>
      {/* Sliders */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
          }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Number of Indexes
            </label>
            <span style={{
              fontSize: 20, fontWeight: 800, color: 'var(--accent)',
              fontFamily: "'Fira Code', monospace",
            }}>
              {numIndexes}
            </span>
          </div>
          <input
            type="range" min="1" max="15" value={numIndexes}
            onChange={e => setNumIndexes(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>1</span><span>5</span><span>10</span><span>15</span>
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
          }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Read/Write Ratio
            </label>
            <span style={{
              fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)',
              fontFamily: "'Fira Code', monospace",
            }}>
              {readWriteRatio}% reads / {100 - readWriteRatio}% writes
            </span>
          </div>
          <input
            type="range" min="0" max="100" value={readWriteRatio}
            onChange={e => setReadWriteRatio(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Write-heavy</span><span>Balanced</span><span>Read-heavy</span>
          </div>
        </div>
      </div>

      {/* Performance bars */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 20, marginBottom: 16,
      }}>
        {[
          { label: 'Read Performance', value: readPerf, color: '#10b981' },
          { label: 'Write Performance', value: writePerf, color: '#ef4444' },
          { label: 'Storage Overhead', value: Math.min(100, (storageGB / 40) * 100), color: '#3b82f6' },
          { label: 'Net Throughput', value: netThroughput, color: '#8b5cf6' },
        ].map(bar => (
          <div key={bar.label} style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: 6,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: bar.color }}>{bar.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: bar.color }}>
                {bar.label === 'Storage Overhead' ? `${storageGB}GB` : `${Math.round(bar.value)}%`}
              </span>
            </div>
            <div style={{
              height: 24, background: '#1e293b', borderRadius: 8, overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar.value}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%', background: bar.color, borderRadius: 8,
                  boxShadow: `0 0 8px ${bar.color}40`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic calculation */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16,
      }}>
        <div style={{
          flex: 1, minWidth: 200, padding: '14px 18px', borderRadius: 12,
          background: '#3b82f610', border: '1.5px solid #3b82f630', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Storage Calculation</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', fontFamily: "'Fira Code', monospace" }}>
            {numIndexes} indexes on {baseGB}GB table = ~{numIndexes * 2}GB extra = {storageGB}GB total
          </div>
        </div>
        <div style={{
          flex: 1, minWidth: 200, padding: '14px 18px', borderRadius: 12,
          background: '#8b5cf610', border: '1.5px solid #8b5cf630', textAlign: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Write Impact</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6', fontFamily: "'Fira Code', monospace" }}>
            Every INSERT updates {numIndexes + 1} structures ({numIndexes} indexes + 1 table)
          </div>
        </div>
      </div>

      {/* Sweet spot message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '14px 20px', borderRadius: 12, textAlign: 'center',
          background: numIndexes >= 3 && numIndexes <= 5 ? '#10b98110' : readWriteRatio < 30 ? '#ef444410' : '#f59e0b10',
          border: `1.5px solid ${numIndexes >= 3 && numIndexes <= 5 ? '#10b98130' : readWriteRatio < 30 ? '#ef444430' : '#f59e0b30'}`,
          fontSize: 14, fontWeight: 600, lineHeight: 1.7,
          color: numIndexes >= 3 && numIndexes <= 5 ? '#10b981' : readWriteRatio < 30 ? '#ef4444' : '#f59e0b',
        }}
      >
        {readWriteRatio < 30 && (
          <span>&#9888;&#65039; Write-heavy workload -- keep indexes minimal!</span>
        )}
        {readWriteRatio >= 30 && numIndexes >= 3 && numIndexes <= 5 && (
          <span>&#10024; Sweet spot: 3-5 indexes covers 90% of query patterns with minimal write penalty</span>
        )}
        {readWriteRatio >= 30 && numIndexes < 3 && (
          <span>&#128269; You might be under-indexed -- common queries may be doing full scans</span>
        )}
        {readWriteRatio >= 30 && numIndexes > 5 && numIndexes <= 10 && (
          <span>&#9888;&#65039; Getting heavy -- each additional index adds write latency. Do you really need all of them?</span>
        )}
        {readWriteRatio >= 30 && numIndexes > 10 && (
          <span>&#128680; Too many indexes! Writes will be severely impacted. Audit and consolidate.</span>
        )}
      </motion.div>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic15_Indexing() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* ---- Section 1: Full Table Scans ---- */}
      <SectionBlock title="The Problem -- Full Table Scans" icon="🐌" color="#dc2626">
        <Neuron
          mood="explaining"
          message="Imagine finding someone's phone number in a book with 10 million entries... but the book has no alphabetical order. You'd have to read every. single. page."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Full Scan vs Index Lookup">
            <FullScanVsIndex />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 2: B-Tree Indexes ---- */}
      <SectionBlock title="How B-Tree Indexes Work" icon="🌲" color="#10b981">
        <Neuron
          mood="thinking"
          message="A B-Tree is like a library card catalog -- each drawer narrows your search. 1 million rows? Only 20 comparisons to find anything!"
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="B-Tree Visualizer">
            <BTreeVisualizer />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 3: Types of Indexes ---- */}
      <SectionBlock title="Types of Indexes" icon="📋" color="#8b5cf6">
        <Neuron
          mood="explaining"
          message="Not all indexes are created equal. B-Tree for ranges, Hash for exact matches, GIN for full-text search, and compound indexes where column order matters!"
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Index Type Explorer">
            <IndexTypeExplorer />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 4: EXPLAIN Plans ---- */}
      <SectionBlock title="EXPLAIN -- Reading Query Plans" icon="🔍" color="#f59e0b">
        <Neuron
          mood="happy"
          message="EXPLAIN is your X-ray vision -- it shows exactly what the database plans to do before it does it. Red means sequential scan (bad), green means index scan (good)."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="EXPLAIN Plan Interpreter">
            <ExplainPlanInterpreter />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 5: MongoDB Indexing ---- */}
      <SectionBlock title="Indexing in MongoDB" icon="🍃" color="#47a248">
        <Neuron
          mood="explaining"
          message="MongoDB uses the same B-Tree concept but with document-aware features. The explain() method is your best friend -- COLLSCAN means no index, IXSCAN means indexed."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="MongoDB Index Playground">
            <MongoIndexPlayground />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 6: Cost of Indexes ---- */}
      <SectionBlock title="The Cost of Indexes -- Write Penalty" icon="⚖️" color="#ec4899">
        <Neuron
          mood="thinking"
          message="Indexes aren't free. Every INSERT and UPDATE must update every index. A table with 15 indexes turns every write into 16 write operations."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Index Cost Calculator">
            <IndexCostCalculator />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 7: Hindi Summary ---- */}
      <SectionBlock title="Hindi Summary" icon="🇮🇳" color="#ff9933">
        <HindiExplainer
          concept="डेटाबेस इंडेक्सिंग"
          english="Database Indexing"
          explanation="Database indexing एक technique है जो queries को fast बनाती है — जैसे किताब के पीछे index page होता है। बिना index के, database हर row check करता है (Full Table Scan) — 10 lakh rows में 320ms लगते हैं। Index (B-Tree) से सिर्फ 3-4 comparisons में answer मिल जाता है — 0.1ms! B-Tree एक balanced tree है जिसमें हर level पर data आधा हो जाता है। Compound index में column order matters — (country, city) index country+city query में help करता है, लेकिन सिर्फ city query में नहीं। EXPLAIN command से पता चलता है database query कैसे execute करेगा — Seq Scan (red flag!) vs Index Scan (green flag!). लेकिन ज़्यादा indexes भी problem है — हर INSERT/UPDATE को सभी indexes update करने होते हैं। Balance रखो — 3-5 indexes usually काफी हैं।"
          terms={[
            { hindi: 'इंडेक्स', english: 'Index', meaning: 'Data structure जो queries को fast बनाती है' },
            { hindi: 'बी-ट्री', english: 'B-Tree', meaning: 'Balanced tree structure जो sorted data रखती है' },
            { hindi: 'फुल टेबल स्कैन', english: 'Full Table Scan', meaning: 'हर row को check करना — बहुत slow' },
            { hindi: 'कंपाउंड इंडेक्स', english: 'Compound Index', meaning: 'एक से ज्यादा columns पर index' },
            { hindi: 'एक्सप्लेन', english: 'EXPLAIN', meaning: 'Query plan देखने का command' },
          ]}
        />
      </SectionBlock>
    </div>
  )
}
