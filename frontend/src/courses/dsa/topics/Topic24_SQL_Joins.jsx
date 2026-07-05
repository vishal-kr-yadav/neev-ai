import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 24 — SQL JOINs & Aggregations
   Think Like a Programmer — Visual-First DSA Course
================================================================ */

// ─── colour palette ───────────────────────────────────────────────
const C = {
  emp:  '#6366f1',   // employees table — indigo
  dept: '#0ea5e9',   // departments table — sky
  join: '#10b981',   // joined rows — emerald
  null: '#94a3b8',   // NULL / unmatched — slate
  agg:  '#f59e0b',   // aggregate — amber
  have: '#ec4899',   // HAVING — pink
  wher: '#8b5cf6',   // WHERE — violet
  sql:  '#1e293b',   // SQL background
}

// ── shared helpers ─────────────────────────────────────────────────
function SqlBlock({ code }) {
  return (
    <pre style={{
      background: C.sql,
      color: '#e2e8f0',
      borderRadius: 12,
      padding: '16px 20px',
      fontSize: 14,
      lineHeight: 1.7,
      overflowX: 'auto',
      margin: '12px 0',
      fontFamily: '"Fira Code", "Cascadia Code", monospace',
      border: '1px solid #334155',
    }}>
      {code}
    </pre>
  )
}

function TableViz({ headers, rows, color = C.emp, highlightRows = [], dimRows = [], label }) {
  return (
    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13 }}>
      {label && (
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 1,
          color: color, textTransform: 'uppercase', marginBottom: 6,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
          {label}
        </div>
      )}
      <div style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${color}44` }}>
        {/* header */}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
          background: `${color}22`, borderBottom: `1px solid ${color}33`,
        }}>
          {headers.map((h, i) => (
            <div key={i} style={{ padding: '6px 10px', fontWeight: 700, color, fontSize: 12 }}>{h}</div>
          ))}
        </div>
        {/* rows */}
        {rows.map((row, ri) => {
          const isHl = highlightRows.includes(ri)
          const isDim = dimRows.includes(ri)
          return (
            <motion.div
              key={ri}
              initial={false}
              animate={{ opacity: isDim ? 0.3 : 1, scale: isHl ? 1.01 : 1 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'grid', gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
                background: isHl ? `${color}18` : ri % 2 === 0 ? 'transparent' : `${color}08`,
                borderBottom: `1px solid ${color}18`,
                borderLeft: isHl ? `3px solid ${color}` : '3px solid transparent',
              }}
            >
              {row.map((cell, ci) => (
                <div key={ci} style={{
                  padding: '6px 10px', color: cell === 'NULL' ? C.null : 'var(--text-primary)',
                  fontStyle: cell === 'NULL' ? 'italic' : 'normal',
                  fontSize: 13,
                }}>{cell}</div>
              ))}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SECTION 1: Why One Table Isn't Enough
// ══════════════════════════════════════════════════════════════════
function Section1_Normalization() {
  const [split, setSplit] = useState(false)

  const messyHeaders = ['id', 'name', 'dept_name', 'dept_location', 'salary']
  const messyRows = [
    ['1', 'Priya',  'Engineering', 'Bengaluru', '95000'],
    ['2', 'Rahul',  'Engineering', 'Bengaluru', '88000'],
    ['3', 'Anjali', 'Engineering', 'Bengaluru', '91000'],
    ['4', 'Vikram', 'Marketing',   'Mumbai',    '72000'],
    ['5', 'Neha',   'Engineering', 'Bengaluru', '87000'],
  ]

  const empHeaders   = ['id', 'name', 'dept_id', 'salary']
  const empRows      = [
    ['1', 'Priya',  '10', '95000'],
    ['2', 'Rahul',  '10', '88000'],
    ['3', 'Anjali', '10', '91000'],
    ['4', 'Vikram', '20', '72000'],
    ['5', 'Neha',   '10', '87000'],
  ]
  const deptHeaders  = ['id', 'name', 'location']
  const deptRows     = [
    ['10', 'Engineering', 'Bengaluru'],
    ['20', 'Marketing',   'Mumbai'],
    ['30', 'HR',          'Delhi'],
  ]

  return (
    <SectionBlock icon="🔀" title="Why One Table Isn't Enough" color={C.emp}>
      <Neuron
        mood="explaining"
        message="Imagine a spreadsheet where you write 'Engineering, Bengaluru' for every single engineer. Now the company moves to Hyderabad — you must edit FIVE rows just to change one fact. That's the problem we fix with multiple tables."
        style={{ marginBottom: 28 }}
      />

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          onClick={() => setSplit(!split)}
          style={{
            padding: '10px 28px', borderRadius: 30, border: 'none', cursor: 'pointer',
            background: split
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          {split ? '← Merge (see the mess)' : 'Split into 2 Tables →'}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {!split ? (
          <motion.div key="messy"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            {/* Problem callout */}
            <div style={{
              background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12,
              padding: '12px 18px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <strong style={{ color: '#b91c1c' }}>Data Duplication Problem!</strong>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  "Engineering" + "Bengaluru" repeated 4 times. Rename the dept → update 4 rows. Add a new engineer → copy those strings again. One typo → inconsistent data.
                </div>
              </div>
            </div>
            <TableViz headers={messyHeaders} rows={messyRows} color="#ef4444"
              label="employees_bad (everything in one table — messy!)"
              highlightRows={[0, 1, 2, 4]}
            />
            {/* annotation arrows */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              {[0,1,2,4].map(i => (
                <motion.div key={i}
                  animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  style={{
                    margin: '0 8px', fontSize: 11, color: '#ef4444', fontWeight: 700,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}
                >
                  <span>↑</span>
                  <span>dupe</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="split"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            <div style={{
              background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12,
              padding: '12px 18px', marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div>
                <strong style={{ color: '#166534' }}>Normalized!</strong>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  Department info lives in ONE place. Rename the city? Update 1 row. The <code style={{ background: '#dcfce7', padding: '1px 6px', borderRadius: 4 }}>dept_id</code> is a <strong>Foreign Key</strong> — it links the two tables.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <TableViz headers={empHeaders} rows={empRows} color={C.emp} label="employees" />
              </div>
              {/* connector arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 60 }}>
                <motion.div
                  animate={{ x: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.8 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontSize: 24 }}>🔗</div>
                  <div style={{ fontSize: 10, color: C.dept, fontWeight: 700, marginTop: 2 }}>dept_id</div>
                  <div style={{ fontSize: 10, color: C.dept }}>= id</div>
                </motion.div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <TableViz headers={deptHeaders} rows={deptRows} color={C.dept} label="departments" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronTip type="tip">
        <strong>Foreign Key</strong> = a column in one table that references the <strong>Primary Key</strong> of another table. <code>employees.dept_id</code> → <code>departments.id</code>. This is how relational databases "connect" data without copying it.
      </NeuronTip>

      <HindiExplainer
        concept="Normalization — डेटा को व्यवस्थित करना"
        english="Database Normalization"
        explanation="Normalization का मतलब है डेटा को अलग-अलग tables में बांटना ताकि repetition न हो। जैसे एक school में हर student के साथ teacher का पूरा address लिखने की बजाय, teacher की एक अलग list बनाओ और बस teacher_id store करो।"
        example="Phone book में हर friend का नाम और address एक बार लिखते हैं, बार-बार नहीं। वैसे ही database में department का नाम एक ही जगह रखो — employees table में सिर्फ dept_id (reference) रखो।"
        terms={[
          { hindi: 'Foreign Key', english: 'विदेशी कुंजी', meaning: 'दूसरी table को जोड़ने वाला column' },
          { hindi: 'Primary Key', english: 'मुख्य कुंजी', meaning: 'हर row की unique पहचान' },
          { hindi: 'Normalization', english: 'सामान्यीकरण', meaning: 'डेटा को duplicate होने से बचाना' },
        ]}
      />
    </SectionBlock>
  )
}

// ══════════════════════════════════════════════════════════════════
// SECTION 2: INNER JOIN Visualizer
// ══════════════════════════════════════════════════════════════════
const EMP_DATA = [
  { id: 1, name: 'Priya',  dept_id: 10, salary: 95000 },
  { id: 2, name: 'Rahul',  dept_id: 10, salary: 88000 },
  { id: 3, name: 'Anjali', dept_id: 20, salary: 91000 },
  { id: 4, name: 'Vikram', dept_id: 30, salary: 72000 },
  { id: 5, name: 'Neha',   dept_id: null, salary: 67000 }, // no dept!
]
const DEPT_DATA = [
  { id: 10, name: 'Engineering', location: 'Bengaluru' },
  { id: 20, name: 'Marketing',   location: 'Mumbai' },
  { id: 30, name: 'HR',          location: 'Delhi' },
  { id: 40, name: 'Finance',     location: 'Hyderabad' }, // no employees!
]

function Section2_InnerJoin() {
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const timerRef = useRef(null)

  const INNER = EMP_DATA.flatMap(e =>
    DEPT_DATA.filter(d => d.id === e.dept_id).map(d => ({ ...e, dept_name: d.name, location: d.location }))
  )
  // which emp & dept rows are matched at each step
  const stepMatches = EMP_DATA.map(e => DEPT_DATA.findIndex(d => d.id === e.dept_id))

  const matchedEmpIds  = step >= 0 ? EMP_DATA.slice(0, step + 1).filter((_, i) => stepMatches[i] >= 0).map(e => e.id) : []
  const dimEmpIds      = step >= 0 ? [5] : [] // Neha — no dept
  const visibleResult  = step >= 0 ? INNER.slice(0, matchedEmpIds.length) : []

  const handleRun = () => {
    if (running) return
    setStep(-1)
    setRunning(true)
    let s = 0
    const tick = () => {
      setStep(s)
      s++
      if (s < EMP_DATA.length) {
        timerRef.current = setTimeout(tick, 900)
      } else {
        setRunning(false)
      }
    }
    timerRef.current = setTimeout(tick, 400)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <SectionBlock icon="🔗" title="INNER JOIN Visualizer" color={C.join}>
      <Neuron
        mood="excited"
        message="INNER JOIN is the most common JOIN. It works like a matchmaker — it finds rows where the foreign key matches. If an employee has NO department (or a department has NO employees), they're LEFT OUT."
        style={{ marginBottom: 28 }}
      />

      <SqlBlock code={`SELECT e.name, e.salary, d.name AS dept, d.location
FROM   employees e
INNER JOIN departments d ON e.dept_id = d.id;`} />

      <InteractiveDemo title="INNER JOIN — Step by Step" instruction="Press 'Run JOIN' to watch the rows match one by one.">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          {/* Employees table */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.emp, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              employees
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.emp}44` }}>
              {/* header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', background: `${C.emp}22`, borderBottom: `1px solid ${C.emp}33` }}>
                {['id','name','dept_id'].map(h => (
                  <div key={h} style={{ padding: '6px 10px', fontWeight: 700, color: C.emp, fontSize: 12 }}>{h}</div>
                ))}
              </div>
              {EMP_DATA.map((e, i) => {
                const isActive = step === i
                const isMatched = matchedEmpIds.includes(e.id)
                const isDim = e.dept_id === null && step >= i
                return (
                  <motion.div key={e.id}
                    animate={{
                      backgroundColor: isActive ? `${C.emp}33` : isMatched ? `${C.emp}15` : isDim ? '#f1f5f9' : 'transparent',
                      opacity: isDim ? 0.35 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', borderBottom: `1px solid ${C.emp}15` }}
                  >
                    {[e.id, e.name, e.dept_id ?? 'NULL'].map((v, ci) => (
                      <div key={ci} style={{ padding: '7px 10px', fontSize: 13, color: v === 'NULL' ? C.null : 'var(--text-primary)', fontStyle: v === 'NULL' ? 'italic' : 'normal' }}>{v}</div>
                    ))}
                  </motion.div>
                )
              })}
            </div>
            <div style={{ fontSize: 11, color: C.null, marginTop: 6, textAlign: 'center' }}>
              ↑ Neha has no dept → excluded
            </div>
          </div>

          {/* Center arrows */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, minWidth: 60 }}>
            <AnimatePresence>
              {step >= 0 && Array.from({ length: Math.min(step + 1, EMP_DATA.length) }).map((_, i) => {
                const hasMatch = stepMatches[i] >= 0
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
                    style={{
                      fontSize: 18,
                      color: hasMatch ? C.join : C.null,
                      fontWeight: 700,
                      filter: hasMatch ? `drop-shadow(0 0 4px ${C.join})` : 'none',
                    }}
                  >
                    {hasMatch ? '→' : '✗'}
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {step < 0 && (
              <div style={{ fontSize: 22, color: '#cbd5e1' }}>→</div>
            )}
          </div>

          {/* Departments table */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.dept, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              departments
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.dept}44` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1.5fr 1.5fr', background: `${C.dept}22`, borderBottom: `1px solid ${C.dept}33` }}>
                {['id','name','location'].map(h => (
                  <div key={h} style={{ padding: '6px 10px', fontWeight: 700, color: C.dept, fontSize: 12 }}>{h}</div>
                ))}
              </div>
              {DEPT_DATA.map((d, i) => {
                const isActive = step >= 0 && stepMatches[step] === i
                const wasMatched = step >= 0 && stepMatches.slice(0, step + 1).includes(i)
                const isDim = d.id === 40 && step >= EMP_DATA.length - 1 // Finance never matched
                return (
                  <motion.div key={d.id}
                    animate={{
                      backgroundColor: isActive ? `${C.dept}33` : wasMatched ? `${C.dept}15` : 'transparent',
                      opacity: isDim ? 0.35 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'grid', gridTemplateColumns: '0.5fr 1.5fr 1.5fr', borderBottom: `1px solid ${C.dept}15` }}
                  >
                    {[d.id, d.name, d.location].map((v, ci) => (
                      <div key={ci} style={{ padding: '7px 10px', fontSize: 13, color: 'var(--text-primary)' }}>{v}</div>
                    ))}
                  </motion.div>
                )
              })}
            </div>
            <div style={{ fontSize: 11, color: C.null, marginTop: 6, textAlign: 'center' }}>
              ↑ Finance has no employees → excluded
            </div>
          </div>
        </div>

        {/* Run button */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={handleRun} disabled={running}
            style={{
              padding: '10px 32px', borderRadius: 30, border: 'none', cursor: running ? 'not-allowed' : 'pointer',
              background: running ? '#e2e8f0' : `linear-gradient(135deg, ${C.join}, #059669)`,
              color: running ? '#94a3b8' : '#fff', fontWeight: 700, fontSize: 15,
            }}
          >
            {running ? '⏳ Matching...' : step >= 0 ? '↺ Run Again' : '▶ Run JOIN'}
          </motion.button>
        </div>

        {/* Result table */}
        <AnimatePresence>
          {visibleResult.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.join, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Result Table ({visibleResult.length} / {INNER.length} rows)
              </div>
              <TableViz
                headers={['id', 'name', 'salary', 'dept', 'location']}
                rows={visibleResult.map(r => [r.id, r.name, r.salary, r.dept_name, r.location])}
                color={C.join}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveDemo>

      <NeuronTip type="warning">
        INNER JOIN = <strong>intersection only</strong>. If <em>either side</em> has no match, that row vanishes from the result. Use LEFT JOIN when you need to keep all rows from one side.
      </NeuronTip>
    </SectionBlock>
  )
}

// ══════════════════════════════════════════════════════════════════
// SECTION 3: JOIN Types — Venn Diagrams
// ══════════════════════════════════════════════════════════════════
const JOIN_TYPES = [
  {
    key: 'INNER',
    label: 'INNER JOIN',
    desc: 'Give me employees WHO HAVE a department.',
    leftFill: false, intersect: true, rightFill: false,
    color: C.join,
    sql: `SELECT e.name, d.name AS dept
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;`,
    rows: [
      ['Priya',  'Engineering'],
      ['Rahul',  'Engineering'],
      ['Anjali', 'Marketing'],
      ['Vikram', 'HR'],
    ],
    note: 'Neha (no dept) & Finance (no employees) excluded',
  },
  {
    key: 'LEFT',
    label: 'LEFT JOIN',
    desc: 'Give me ALL employees, even those without departments.',
    leftFill: true, intersect: true, rightFill: false,
    color: C.emp,
    sql: `SELECT e.name, d.name AS dept
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;`,
    rows: [
      ['Priya',  'Engineering'],
      ['Rahul',  'Engineering'],
      ['Anjali', 'Marketing'],
      ['Vikram', 'HR'],
      ['Neha',   'NULL'],
    ],
    note: 'Neha appears with NULL dept — Finance still excluded',
  },
  {
    key: 'RIGHT',
    label: 'RIGHT JOIN',
    desc: 'Give me ALL departments, even empty ones.',
    leftFill: false, intersect: true, rightFill: true,
    color: C.dept,
    sql: `SELECT e.name, d.name AS dept
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;`,
    rows: [
      ['Priya',  'Engineering'],
      ['Rahul',  'Engineering'],
      ['Anjali', 'Marketing'],
      ['Vikram', 'HR'],
      ['NULL',   'Finance'],
    ],
    note: 'Finance appears with NULL employee — Neha excluded',
  },
  {
    key: 'FULL',
    label: 'FULL OUTER JOIN',
    desc: 'Give me everything — match or not.',
    leftFill: true, intersect: true, rightFill: true,
    color: C.agg,
    sql: `SELECT e.name, d.name AS dept
FROM employees e
FULL OUTER JOIN departments d ON e.dept_id = d.id;`,
    rows: [
      ['Priya',  'Engineering'],
      ['Rahul',  'Engineering'],
      ['Anjali', 'Marketing'],
      ['Vikram', 'HR'],
      ['Neha',   'NULL'],
      ['NULL',   'Finance'],
    ],
    note: 'Both Neha and Finance appear with NULLs',
  },
]

function VennDiagram({ leftFill, intersect, rightFill, color }) {
  const leftColor  = leftFill  ? color      : 'transparent'
  const rightColor = rightFill ? color      : 'transparent'
  const midColor   = intersect ? color      : 'transparent'

  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      {/* left circle */}
      <motion.circle cx="68" cy="50" r="38"
        animate={{ fill: leftColor, fillOpacity: leftFill ? 0.35 : 0.06 }}
        transition={{ duration: 0.4 }}
        stroke={C.emp} strokeWidth="2" />
      {/* right circle */}
      <motion.circle cx="112" cy="50" r="38"
        animate={{ fill: rightColor, fillOpacity: rightFill ? 0.35 : 0.06 }}
        transition={{ duration: 0.4 }}
        stroke={C.dept} strokeWidth="2" />
      {/* intersection clip path (approximated via opacity overlay) */}
      <motion.ellipse cx="90" cy="50" rx="18" ry="30"
        animate={{ fill: midColor, fillOpacity: intersect ? 0.55 : 0.06 }}
        transition={{ duration: 0.4 }}
      />
      {/* labels */}
      <text x="44" y="54" fontSize="11" fill={C.emp} fontWeight="700" textAnchor="middle">A</text>
      <text x="136" y="54" fontSize="11" fill={C.dept} fontWeight="700" textAnchor="middle">B</text>
      <text x="90" y="54" fontSize="9" fill="#fff" fontWeight="700" textAnchor="middle">∩</text>
    </svg>
  )
}

function Section3_JoinTypes() {
  const [active, setActive] = useState(0)
  const jt = JOIN_TYPES[active]

  return (
    <SectionBlock icon="🔵" title="JOIN Types — Venn Diagrams" color={C.dept}>
      <Neuron
        mood="thinking"
        message="There are 4 main JOIN types. Think of two overlapping circles. Which parts do you want? Just the overlap (INNER)? The whole left circle (LEFT)? Both circles entirely (FULL OUTER)?"
        style={{ marginBottom: 24 }}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {JOIN_TYPES.map((jt2, i) => (
          <motion.button key={jt2.key}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActive(i)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: `2px solid ${active === i ? jt2.color : '#e2e8f0'}`,
              background: active === i ? jt2.color : 'transparent',
              color: active === i ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.25s',
            }}
          >
            {jt2.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={jt.key}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Venn + description */}
            <div style={{ minWidth: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <VennDiagram {...jt} />
              </div>
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: C.emp, fontWeight: 600 }}>A = employees</span>
                <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                <span style={{ fontSize: 11, color: C.dept, fontWeight: 600 }}>B = departments</span>
              </div>
              <div style={{
                background: `${jt.color}15`, border: `1.5px solid ${jt.color}44`,
                borderRadius: 12, padding: '10px 14px', marginTop: 10,
                fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, textAlign: 'center',
              }}>
                {jt.desc}
              </div>
            </div>

            {/* SQL + Result */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <SqlBlock code={jt.sql} />
              <TableViz
                headers={['name', 'dept']}
                rows={jt.rows.map(r => r.map(c => c === 'NULL' ? 'NULL' : c))}
                color={jt.color}
                dimRows={jt.rows.map((r, i) => r.includes('NULL') ? i : -1).filter(i => i >= 0)}
              />
              <div style={{ fontSize: 12, color: C.null, marginTop: 8, fontStyle: 'italic' }}>
                {jt.note}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <HindiExplainer
        concept="JOIN के प्रकार"
        english="Types of SQL JOINs"
        explanation="Venn diagram की तरह सोचो — दो गोले (circles) हैं: एक employees का, एक departments का। INNER JOIN = बस overlap वाला हिस्सा। LEFT JOIN = पूरा बायां गोला + overlap। RIGHT JOIN = पूरा दायां गोला + overlap। FULL OUTER JOIN = दोनों गोले पूरे।"
        example="Class में कुछ students ने exam दिया और कुछ नहीं। INNER JOIN = वो students जिन्होंने exam दिया AND present थे। LEFT JOIN = सभी students (चाहे exam दिया हो या न दिया हो)।"
        terms={[
          { hindi: 'INNER', english: 'आंतरिक', meaning: 'सिर्फ दोनों में match होने वाली rows' },
          { hindi: 'LEFT', english: 'बायां', meaning: 'बायीं table की सभी rows + matching rows' },
          { hindi: 'RIGHT', english: 'दायां', meaning: 'दायीं table की सभी rows + matching rows' },
          { hindi: 'NULL', english: 'खाली', meaning: 'कोई matching value नहीं मिली' },
        ]}
      />
    </SectionBlock>
  )
}

// ══════════════════════════════════════════════════════════════════
// SECTION 4: GROUP BY — Summarizing Data
// ══════════════════════════════════════════════════════════════════
const GROUPED_DATA = [
  { id:1,  name:'Priya',   dept:'Engineering', salary:95000 },
  { id:2,  name:'Rahul',   dept:'Engineering', salary:88000 },
  { id:3,  name:'Anjali',  dept:'Engineering', salary:91000 },
  { id:4,  name:'Vikram',  dept:'Marketing',   salary:72000 },
  { id:5,  name:'Neha',    dept:'Engineering', salary:87000 },
  { id:6,  name:'Sanjay',  dept:'Marketing',   salary:68000 },
  { id:7,  name:'Meera',   dept:'HR',          salary:61000 },
  { id:8,  name:'Arjun',   dept:'HR',          salary:59000 },
  { id:9,  name:'Kavya',   dept:'Finance',     salary:82000 },
  { id:10, name:'Rohan',   dept:'Finance',     salary:78000 },
]

const AGG_FUNCS = [
  { key: 'COUNT', label: 'COUNT(*)', fn: rows => rows.length,                            fmt: v => v },
  { key: 'SUM',   label: 'SUM(salary)', fn: rows => rows.reduce((a, r) => a + r.salary, 0), fmt: v => `₹${v.toLocaleString()}` },
  { key: 'AVG',   label: 'AVG(salary)', fn: rows => Math.round(rows.reduce((a, r) => a + r.salary, 0) / rows.length), fmt: v => `₹${v.toLocaleString()}` },
  { key: 'MIN',   label: 'MIN(salary)', fn: rows => Math.min(...rows.map(r => r.salary)), fmt: v => `₹${v.toLocaleString()}` },
  { key: 'MAX',   label: 'MAX(salary)', fn: rows => Math.max(...rows.map(r => r.salary)), fmt: v => `₹${v.toLocaleString()}` },
]

const DEPTS = ['Engineering', 'Marketing', 'HR', 'Finance']
const DEPT_COLORS = { Engineering: C.emp, Marketing: '#f59e0b', HR: '#10b981', Finance: '#ec4899' }

function Section4_GroupBy() {
  const [aggIdx, setAggIdx] = useState(0)
  const [grouped, setGrouped] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const agg = AGG_FUNCS[aggIdx]

  const groups = DEPTS.map(dept => ({
    dept,
    rows: GROUPED_DATA.filter(r => r.dept === dept),
    value: agg.fn(GROUPED_DATA.filter(r => r.dept === dept)),
  }))

  const handleGroup = () => { setGrouped(true); setCollapsed(false) }
  const handleCollapse = () => setCollapsed(true)
  const handleReset = () => { setGrouped(false); setCollapsed(false) }

  return (
    <SectionBlock icon="📊" title="GROUP BY — Summarizing Data" color={C.agg}>
      <Neuron
        mood="excited"
        message="GROUP BY is like sorting cards into piles. First you group all rows that share the same value, then you apply an aggregate function (COUNT, SUM, AVG) to each pile to get ONE summary row."
        style={{ marginBottom: 24 }}
      />

      {/* Aggregate function picker */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Choose aggregate function:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AGG_FUNCS.map((f, i) => (
            <motion.button key={f.key}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setAggIdx(i) }}
              style={{
                padding: '6px 16px', borderRadius: 20, border: `2px solid ${aggIdx === i ? C.agg : '#e2e8f0'}`,
                background: aggIdx === i ? C.agg : 'transparent',
                color: aggIdx === i ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      <SqlBlock code={`SELECT department, ${agg.label}
FROM   employees
GROUP BY department;`} />

      <InteractiveDemo title="GROUP BY Animation" instruction="Press 'Group Rows' → then 'Collapse' to see aggregation.">
        {/* control buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {!grouped ? (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleGroup}
              style={{ padding: '8px 22px', borderRadius: 24, border: 'none', background: `linear-gradient(135deg, ${C.agg}, #d97706)`, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Group Rows →
            </motion.button>
          ) : !collapsed ? (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleCollapse}
              style={{ padding: '8px 22px', borderRadius: 24, border: 'none', background: `linear-gradient(135deg, ${C.join}, #059669)`, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Collapse → {agg.label}
            </motion.button>
          ) : null}
          {grouped && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleReset}
              style={{ padding: '8px 22px', borderRadius: 24, border: '1.5px solid #e2e8f0', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              ↺ Reset
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!grouped ? (
            <motion.div key="flat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TableViz
                headers={['id','name','dept','salary']}
                rows={GROUPED_DATA.map(r => [r.id, r.name, r.dept, `₹${r.salary.toLocaleString()}`])}
                color={C.agg}
                label="employees (all 10 rows)"
              />
            </motion.div>
          ) : !collapsed ? (
            <motion.div key="grouped" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {groups.map((g, gi) => (
                  <motion.div key={g.dept}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.12 }}
                    style={{
                      flex: '1 1 180px',
                      background: `${DEPT_COLORS[g.dept]}10`,
                      border: `2px solid ${DEPT_COLORS[g.dept]}44`,
                      borderRadius: 12, padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: DEPT_COLORS[g.dept], marginBottom: 8, textTransform: 'uppercase' }}>
                      {g.dept} ({g.rows.length})
                    </div>
                    {g.rows.map(r => (
                      <div key={r.id} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0', borderBottom: `1px solid ${DEPT_COLORS[g.dept]}20` }}>
                        {r.name} — ₹{r.salary.toLocaleString()}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.join, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Result — {groups.length} rows (one per group)
              </div>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.join}44` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', background: `${C.join}22`, borderBottom: `1px solid ${C.join}33` }}>
                  {['department', agg.label].map(h => (
                    <div key={h} style={{ padding: '6px 12px', fontWeight: 700, color: C.join, fontSize: 12 }}>{h}</div>
                  ))}
                </div>
                {groups.map((g, gi) => (
                  <motion.div key={g.dept}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.1 }}
                    style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', borderBottom: `1px solid ${C.join}15`, background: gi % 2 === 0 ? 'transparent' : `${C.join}08` }}
                  >
                    <div style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: DEPT_COLORS[g.dept] }}>{g.dept}</div>
                    <div style={{ padding: '8px 12px', fontSize: 13, fontWeight: 700, color: C.agg }}>{agg.fmt(g.value)}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveDemo>

      <NeuronTip type="tip">
        Every column in SELECT must either be in GROUP BY or wrapped in an aggregate function. You can't select <code>name</code> without grouping by it — which name would you pick from the group?
      </NeuronTip>
    </SectionBlock>
  )
}

// ══════════════════════════════════════════════════════════════════
// SECTION 5: HAVING vs WHERE
// ══════════════════════════════════════════════════════════════════
function Section5_HavingVsWhere() {
  const [mode, setMode] = useState('none')  // 'none' | 'where' | 'having' | 'both'

  const SALARY_THRESHOLD = 75000
  const COUNT_THRESHOLD  = 2

  // Apply WHERE: filter individual rows before grouping
  const afterWhere = mode === 'none'
    ? GROUPED_DATA
    : GROUPED_DATA.filter(r => (mode === 'where' || mode === 'both') ? r.salary >= SALARY_THRESHOLD : true)

  // Group
  const grouped2 = DEPTS.map(dept => ({
    dept, rows: afterWhere.filter(r => r.dept === dept),
  })).filter(g => g.rows.length > 0)

  // Apply HAVING
  const finalGroups = grouped2.filter(g =>
    (mode === 'having' || mode === 'both') ? g.rows.length > COUNT_THRESHOLD : true
  )

  const dimmedEmpIds   = mode === 'where' || mode === 'both'
    ? GROUPED_DATA.filter(r => r.salary < SALARY_THRESHOLD).map(r => r.id)
    : []
  const dimmedDepts    = mode === 'having' || mode === 'both'
    ? grouped2.filter(g => g.rows.length <= COUNT_THRESHOLD).map(g => g.dept)
    : []

  const modeConfig = {
    none:   { label: 'No Filter',     color: '#94a3b8', bg: '#f8fafc' },
    where:  { label: 'WHERE Only',    color: C.wher,    bg: '#faf5ff' },
    having: { label: 'HAVING Only',   color: C.have,    bg: '#fff0f8' },
    both:   { label: 'WHERE + HAVING',color: C.join,    bg: '#f0fdf4' },
  }

  return (
    <SectionBlock icon="🔍" title="HAVING vs WHERE" color={C.have}>
      <Neuron
        mood="thinking"
        message="WHERE filters INDIVIDUAL ROWS before grouping. HAVING filters ENTIRE GROUPS after grouping. They run at different stages of the query. Very common interview question!"
        style={{ marginBottom: 24 }}
      />

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, background: `${C.wher}10`, border: `1.5px solid ${C.wher}44`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, color: C.wher, marginBottom: 6, fontSize: 15 }}>WHERE</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Filters rows <strong>BEFORE</strong> GROUP BY.<br/>
            Removes individual employees from the data.
          </div>
          <SqlBlock code={`WHERE salary >= 75000`} />
        </div>
        <div style={{ flex: 1, minWidth: 260, background: `${C.have}10`, border: `1.5px solid ${C.have}44`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, color: C.have, marginBottom: 6, fontSize: 15 }}>HAVING</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Filters groups <strong>AFTER</strong> GROUP BY.<br/>
            Removes entire departments from results.
          </div>
          <SqlBlock code={`HAVING COUNT(*) > 2`} />
        </div>
      </div>

      <InteractiveDemo title="WHERE vs HAVING" instruction="Toggle filters to see which rows/groups get removed at each stage.">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(modeConfig).map(([k, v]) => (
            <motion.button key={k} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setMode(k)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: `2px solid ${mode === k ? v.color : '#e2e8f0'}`,
                background: mode === k ? v.color : 'transparent',
                color: mode === k ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              {v.label}
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Individual rows (pre-group) */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.wher, marginBottom: 6, textTransform: 'uppercase' }}>
              1. Individual Rows {(mode === 'where' || mode === 'both') && `(WHERE salary ≥ ₹${SALARY_THRESHOLD.toLocaleString()})`}
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.wher}33` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr', background: `${C.wher}15`, borderBottom: `1px solid ${C.wher}22` }}>
                {['name','dept','salary'].map(h => <div key={h} style={{ padding: '5px 9px', fontWeight: 700, color: C.wher, fontSize: 11 }}>{h}</div>)}
              </div>
              {GROUPED_DATA.map(r => {
                const isDim = dimmedEmpIds.includes(r.id)
                return (
                  <motion.div key={r.id}
                    animate={{ opacity: isDim ? 0.25 : 1, backgroundColor: isDim ? '#fef2f2' : 'transparent' }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr', borderBottom: `1px solid ${C.wher}10` }}
                  >
                    <div style={{ padding: '5px 9px', fontSize: 12 }}>{r.name}</div>
                    <div style={{ padding: '5px 9px', fontSize: 12, color: DEPT_COLORS[r.dept] }}>{r.dept}</div>
                    <div style={{ padding: '5px 9px', fontSize: 12 }}>₹{(r.salary/1000).toFixed(0)}k</div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: 22, color: '#cbd5e1', paddingTop: 30 }}>→</div>

          {/* Grouped result */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.have, marginBottom: 6, textTransform: 'uppercase' }}>
              2. After GROUP BY {(mode === 'having' || mode === 'both') && `(HAVING COUNT(*) > ${COUNT_THRESHOLD})`}
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.have}33` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr', background: `${C.have}15`, borderBottom: `1px solid ${C.have}22` }}>
                {['dept','count'].map(h => <div key={h} style={{ padding: '5px 9px', fontWeight: 700, color: C.have, fontSize: 11 }}>{h}</div>)}
              </div>
              {grouped2.map((g, gi) => {
                const isDimGroup = dimmedDepts.includes(g.dept)
                return (
                  <motion.div key={g.dept}
                    animate={{ opacity: isDimGroup ? 0.25 : 1, backgroundColor: isDimGroup ? '#fef2f2' : gi % 2 === 0 ? 'transparent' : `${C.have}06` }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr', borderBottom: `1px solid ${C.have}10` }}
                  >
                    <div style={{ padding: '6px 9px', fontSize: 13, color: DEPT_COLORS[g.dept], fontWeight: 600 }}>{g.dept}</div>
                    <div style={{ padding: '6px 9px', fontSize: 13, fontWeight: 700, color: C.have }}>{g.rows.length}</div>
                  </motion.div>
                )
              })}
              {grouped2.length === 0 && (
                <div style={{ padding: '10px 12px', fontSize: 12, color: C.null, fontStyle: 'italic' }}>No groups remaining</div>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary, #94a3b8)', marginTop: 6, fontStyle: 'italic' }}>
              Final: {finalGroups.length} group{finalGroups.length !== 1 ? 's' : ''} shown
            </div>
          </div>
        </div>
      </InteractiveDemo>

      <NeuronTip type="example">
        <strong>Rule of thumb:</strong> If you can use WHERE, do — it filters <em>before</em> grouping, which is faster. HAVING is only for conditions on <em>aggregate values</em> (COUNT, SUM, AVG...) that don't exist until after grouping.
      </NeuronTip>

      <HindiExplainer
        concept="WHERE vs HAVING — कब क्या use करें"
        english="WHERE vs HAVING in SQL"
        explanation="WHERE = grouping से पहले filter करो (individual rows हटाओ)। HAVING = grouping के बाद filter करो (पूरे groups हटाओ)। जैसे exam में: WHERE = paper check करने से पहले absent students को हटाना। HAVING = result के बाद उन classes को हटाना जिनमें 2 से कम students pass हुए।"
        example="'वो employees दिखाओ जिनके departments में 3 से ज़्यादा लोग काम करते हैं और जिनकी salary 50,000 से ज़्यादा है' — यहाँ salary वाला condition WHERE में जाएगा और department count वाला HAVING में।"
        terms={[
          { hindi: 'WHERE', english: 'जहाँ', meaning: 'Grouping से पहले rows filter करना' },
          { hindi: 'HAVING', english: 'रखते हुए', meaning: 'Grouping के बाद groups filter करना' },
          { hindi: 'COUNT(*)', english: 'गिनती', meaning: 'Group में कितने rows हैं' },
        ]}
      />
    </SectionBlock>
  )
}

// ══════════════════════════════════════════════════════════════════
// SECTION 6: SQL Challenge — Multi-Table Queries
// ══════════════════════════════════════════════════════════════════
const CHALLENGE_DATA = {
  customers: [
    { id:1, name:'Aryan Shah',    city:'Mumbai' },
    { id:2, name:'Sneha Pillai',  city:'Bengaluru' },
    { id:3, name:'Tanmay Gupta',  city:'Delhi' },
    { id:4, name:'Nisha Mehta',   city:'Mumbai' },
    { id:5, name:'Dev Sinha',     city:'Hyderabad' },
  ],
  orders: [
    { id:101, customer_id:1, amount:4500,  date:'2024-01' },
    { id:102, customer_id:1, amount:6800,  date:'2024-02' },
    { id:103, customer_id:2, amount:11200, date:'2024-01' },
    { id:104, customer_id:3, amount:3200,  date:'2024-02' },
    { id:105, customer_id:3, amount:8900,  date:'2024-03' },
    { id:106, customer_id:3, amount:2100,  date:'2024-03' },
    { id:107, customer_id:1, amount:1500,  date:'2024-03' },
    // customer_id 4 & 5 have no orders
  ],
  products: [
    { id:'P1', name:'Laptop',  price:65000 },
    { id:'P2', name:'Phone',   price:28000 },
    { id:'P3', name:'Tablet',  price:22000 },
  ],
}

const CHALLENGES = [
  {
    title: 'Total spending per customer',
    hint: 'JOIN customers + orders → GROUP BY customer → SUM',
    sql: `SELECT c.name, SUM(o.amount) AS total_spent
FROM   customers c
JOIN   orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY total_spent DESC;`,
    result: () => {
      const { customers, orders } = CHALLENGE_DATA
      return customers.map(c => {
        const total = orders.filter(o => o.customer_id === c.id).reduce((s, o) => s + o.amount, 0)
        return total > 0 ? { name: c.name, total: `₹${total.toLocaleString()}` } : null
      }).filter(Boolean).sort((a, b) => parseInt(b.total.replace(/[^0-9]/g,'')) - parseInt(a.total.replace(/[^0-9]/g,'')))
    },
    headers: ['name','total_spent'],
    color: C.emp,
  },
  {
    title: 'Customers who spent more than ₹10,000',
    hint: 'Same as above + HAVING SUM(amount) > 10000',
    sql: `SELECT c.name, SUM(o.amount) AS total_spent
FROM   customers c
JOIN   orders o ON c.id = o.customer_id
GROUP BY c.name
HAVING SUM(o.amount) > 10000;`,
    result: () => {
      const { customers, orders } = CHALLENGE_DATA
      return customers.map(c => {
        const total = orders.filter(o => o.customer_id === c.id).reduce((s, o) => s + o.amount, 0)
        return total > 10000 ? { name: c.name, total: `₹${total.toLocaleString()}` } : null
      }).filter(Boolean)
    },
    headers: ['name','total_spent'],
    color: C.have,
  },
  {
    title: 'Cities with most orders',
    hint: 'JOIN → GROUP BY city → COUNT(*) → ORDER BY',
    sql: `SELECT c.city, COUNT(o.id) AS order_count
FROM   customers c
JOIN   orders o ON c.id = o.customer_id
GROUP BY c.city
ORDER BY order_count DESC;`,
    result: () => {
      const { customers, orders } = CHALLENGE_DATA
      const cities = {}
      orders.forEach(o => {
        const c = customers.find(c2 => c2.id === o.customer_id)
        if (c) cities[c.city] = (cities[c.city] || 0) + 1
      })
      return Object.entries(cities).sort((a, b) => b[1] - a[1]).map(([city, cnt]) => ({ city, count: cnt }))
    },
    headers: ['city','order_count'],
    color: C.dept,
  },
  {
    title: 'Customers with NO orders',
    hint: 'LEFT JOIN + WHERE orders.id IS NULL',
    sql: `SELECT c.name, c.city
FROM   customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE  o.id IS NULL;`,
    result: () => {
      const { customers, orders } = CHALLENGE_DATA
      const withOrders = new Set(orders.map(o => o.customer_id))
      return customers.filter(c => !withOrders.has(c.id)).map(c => ({ name: c.name, city: c.city }))
    },
    headers: ['name','city'],
    color: C.null,
  },
  {
    title: 'Top 3 customers by total revenue',
    hint: 'JOIN + GROUP BY + SUM + ORDER BY DESC + LIMIT 3',
    sql: `SELECT c.name, SUM(o.amount) AS revenue
FROM   customers c
JOIN   orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY revenue DESC
LIMIT  3;`,
    result: () => {
      const { customers, orders } = CHALLENGE_DATA
      return customers.map(c => {
        const total = orders.filter(o => o.customer_id === c.id).reduce((s, o) => s + o.amount, 0)
        return total > 0 ? { name: c.name, revenue: `₹${total.toLocaleString()}` } : null
      }).filter(Boolean)
        .sort((a, b) => parseInt(b.revenue.replace(/[^0-9]/g,'')) - parseInt(a.revenue.replace(/[^0-9]/g,'')))
        .slice(0, 3)
    },
    headers: ['name','revenue'],
    color: C.agg,
  },
]

function Section6_Challenge() {
  const [active, setActive] = useState(0)
  const [showSQL, setShowSQL] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const ch = CHALLENGES[active]
  const rows = ch.result()

  const handleNext = () => {
    setActive((active + 1) % CHALLENGES.length)
    setShowSQL(false)
    setShowResult(false)
  }

  return (
    <SectionBlock icon="🏆" title="SQL Challenge: Multi-Table Queries" color={C.agg}>
      <Neuron
        mood="happy"
        message="Let's put it all together! Real SQL combines JOIN + GROUP BY + HAVING + ORDER BY + LIMIT in one query. Try to guess the SQL before revealing it — that's how you build intuition."
        style={{ marginBottom: 24 }}
      />

      {/* Schema mini-cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'customers', cols: 'id, name, city', color: C.dept },
          { label: 'orders',    cols: 'id, customer_id, amount, date', color: C.emp },
          { label: 'products',  cols: 'id, name, price', color: C.have },
        ].map(t => (
          <div key={t.label} style={{
            flex: '1 1 140px', background: `${t.color}10`, border: `1.5px solid ${t.color}44`,
            borderRadius: 10, padding: '10px 14px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.color, marginBottom: 4, textTransform: 'uppercase' }}>{t.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{t.cols}</div>
          </div>
        ))}
      </div>

      {/* Challenge tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CHALLENGES.map((c, i) => (
          <motion.button key={i} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setActive(i); setShowSQL(false); setShowResult(false) }}
            style={{
              padding: '6px 14px', borderRadius: 18, border: `2px solid ${active === i ? c.color : '#e2e8f0'}`,
              background: active === i ? c.color : 'transparent',
              color: active === i ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            #{i + 1}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
        >
          <div style={{
            background: `${ch.color}10`, border: `1.5px solid ${ch.color}44`,
            borderRadius: 14, padding: '16px 20px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: ch.color, marginBottom: 6 }}>
              Challenge #{active + 1}: {ch.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong>Hint:</strong> {ch.hint}
            </div>
          </div>

          {/* reveal steps */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowSQL(!showSQL)}
              style={{
                padding: '8px 20px', borderRadius: 24, border: `2px solid ${showSQL ? ch.color : '#e2e8f0'}`,
                background: showSQL ? ch.color : 'transparent',
                color: showSQL ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              {showSQL ? '▼ SQL Query' : '▶ Reveal SQL'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowResult(!showResult)}
              style={{
                padding: '8px 20px', borderRadius: 24, border: `2px solid ${showResult ? C.join : '#e2e8f0'}`,
                background: showResult ? C.join : 'transparent',
                color: showResult ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              {showResult ? '▼ Result' : '▶ See Result'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showSQL && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <SqlBlock code={ch.sql} />
              </motion.div>
            )}
            {showResult && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <TableViz
                  headers={ch.headers}
                  rows={rows.map(r => Object.values(r).map(v => String(v)))}
                  color={ch.color}
                  dimRows={rows.map((r, i) => Object.values(r).some(v => v === 'NULL') ? i : -1).filter(i => i >= 0)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleNext}
              style={{
                padding: '8px 22px', borderRadius: 24, border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              Next Challenge →
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </SectionBlock>
  )
}

// ══════════════════════════════════════════════════════════════════
// SECTION 7: Hindi Summary
// ══════════════════════════════════════════════════════════════════
function Section7_HindiSummary() {
  return (
    <SectionBlock icon="🇮🇳" title="Hindi Summary — पूरा Chapter एक नज़र में" color="#ff9933">
      <Neuron
        mood="waving"
        message="Bahut acha kiya! Ab poora chapter ek baar Hindi mein yaad kar lo — yeh real interviews mein kaam aayega!"
        style={{ marginBottom: 24 }}
      />

      {/* Key concepts quick reference */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '🔗', term: 'JOIN',     hindi: 'जोड़ना',       desc: 'दो tables को एक साथ लाना — जैसे Aadhaar से bank account link करना' },
          { icon: '📊', term: 'GROUP BY', hindi: 'समूहित करना', desc: 'rows को groups में बांटकर summary बनाना — जैसे state-wise census' },
          { icon: '∑',  term: 'Aggregate',hindi: 'संकलन',       desc: 'COUNT, SUM, AVG, MIN, MAX — group की एक ही value निकालना' },
          { icon: '🔵', term: 'INNER',    hindi: 'आंतरिक',      desc: 'सिर्फ वो rows जो दोनों tables में match हों' },
          { icon: '←',  term: 'LEFT',     hindi: 'बायां',       desc: 'बायीं table की सभी rows, right में NULL हो तो भी' },
          { icon: '∅',  term: 'NULL',     hindi: 'खाली',        desc: 'कोई value नहीं / match नहीं मिला' },
        ].map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            style={{
              background: 'linear-gradient(135deg, #fff8f0, #fff5eb)',
              border: '1.5px solid #ff993330',
              borderRadius: 12, padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontWeight: 800, color: '#e67e22', fontSize: 15 }}>{item.term}</div>
            <div style={{ fontWeight: 600, color: '#ff9933', fontSize: 13, marginBottom: 6 }}>{item.hindi}</div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
          </motion.div>
        ))}
      </div>

      <HindiExplainer
        concept="SQL JOINs और Aggregations — पूरी Summary"
        english="SQL JOINs & GROUP BY / HAVING"
        explanation="Database में data कई tables में बंटा होता है (normalization)। JOIN उन्हें query के time पर जोड़ता है। INNER JOIN = दोनों में match। LEFT JOIN = सब employees (even without dept)। GROUP BY = rows को groups में तोड़ो फिर COUNT/SUM/AVG से summary बनाओ। WHERE = grouping से पहले filter (individual rows)। HAVING = grouping के बाद filter (entire groups)।"
        example="Swiggy का example: customers table + orders table। 'वो cities जहाँ 100 से ज़्यादा orders हैं और average order value ₹500 से ज़्यादा है' — इसके लिए JOIN (customers + orders), GROUP BY city, HAVING COUNT(*) > 100 AND AVG(amount) > 500 चाहिए।"
        terms={[
          { hindi: 'JOIN = जोड़ना',           english: 'Join',        meaning: 'do tables ko ek query mein milana' },
          { hindi: 'GROUP BY = समूहित करना',  english: 'Group By',    meaning: 'same value waali rows ko ek group mein rakhna' },
          { hindi: 'HAVING = शर्त (group pe)', english: 'Having',      meaning: 'group ke baad condition lagana' },
          { hindi: 'Aggregate = संकलन',       english: 'Aggregate',   meaning: 'COUNT/SUM/AVG — group ki ek value' },
          { hindi: 'INNER = आंतरिक',          english: 'Inner',       meaning: 'sirf matching rows' },
          { hindi: 'LEFT = बायां',            english: 'Left',        meaning: 'baayein table ki sab rows' },
          { hindi: 'NULL = खाली',             english: 'Null',        meaning: 'koi match nahi mila' },
        ]}
      />

      {/* Final cheat sheet */}
      <div style={{
        background: C.sql, borderRadius: 16, padding: '20px 24px', marginTop: 20,
        border: '1px solid #334155',
      }}>
        <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          SQL Query Execution Order — याद रखो!
        </div>
        {[
          ['1', 'FROM',     'कौन सी table?'],
          ['2', 'JOIN',     'tables जोड़ो'],
          ['3', 'WHERE',    'rows filter करो'],
          ['4', 'GROUP BY', 'groups बनाओ'],
          ['5', 'HAVING',   'groups filter करो'],
          ['6', 'SELECT',   'columns चुनो'],
          ['7', 'ORDER BY', 'sort करो'],
          ['8', 'LIMIT',    'top N लो'],
        ].map(([num, kw, hint], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: '#334155', color: '#94a3b8', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{num}</span>
            <span style={{ color: '#7dd3fc', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, minWidth: 80 }}>{kw}</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>{hint}</span>
          </div>
        ))}
      </div>
    </SectionBlock>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════
export default function Topic24Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 22,
          padding: '36px 40px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #334155',
        }}
      >
        {/* decorative orbs */}
        {[C.emp, C.dept, C.join].map((c, i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 1.3 }}
            style={{
              position: 'absolute',
              width: 160, height: 160,
              borderRadius: '50%',
              background: c,
              filter: 'blur(60px)',
              top: i === 0 ? -40 : i === 1 ? 20 : -20,
              right: i === 0 ? -40 : i === 1 ? 60 : 180,
              pointerEvents: 'none',
            }}
          />
        ))}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
              color: '#fff', fontWeight: 800, fontSize: 13, padding: '5px 14px',
              borderRadius: 20, letterSpacing: 0.5,
            }}>Topic 24</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>Think Like a Programmer</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 34, fontWeight: 900,
            color: '#f1f5f9', margin: '0 0 12px 0', lineHeight: 1.2,
          }}>
            SQL JOINs & Aggregations
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 17, lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
            Connect tables, summarize millions of rows — <strong style={{ color: '#7dd3fc' }}>GROUP BY</strong>, <strong style={{ color: '#f9a8d4' }}>HAVING</strong>, and the <strong style={{ color: '#6ee7b7' }}>JOIN mental model</strong>.
          </p>
        </div>
      </motion.div>

      {/* Sections */}
      <Section1_Normalization />
      <Section2_InnerJoin />
      <Section3_JoinTypes />
      <Section4_GroupBy />
      <Section5_HavingVsWhere />
      <Section6_Challenge />
      <Section7_HindiSummary />
    </div>
  )
}
