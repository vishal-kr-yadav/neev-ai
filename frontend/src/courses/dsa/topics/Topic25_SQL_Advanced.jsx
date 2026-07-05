import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 25 — SQL Window Functions & Subqueries
   RANK, ROW_NUMBER, running totals — the advanced SQL that impresses.
================================================================ */

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
  cyan:    '#0e7490',
}

/* ---- Employee dataset ---- */
const EMPLOYEES = [
  { id: 1, name: 'Arjun',   dept: 'Engineering', salary: 95000, joined: '2022-01-10' },
  { id: 2, name: 'Priya',   dept: 'Engineering', salary: 88000, joined: '2022-03-15' },
  { id: 3, name: 'Rahul',   dept: 'Engineering', salary: 88000, joined: '2021-07-20' },
  { id: 4, name: 'Sneha',   dept: 'Marketing',   salary: 72000, joined: '2023-02-01' },
  { id: 5, name: 'Vikram',  dept: 'Marketing',   salary: 78000, joined: '2022-11-05' },
  { id: 6, name: 'Kavya',   dept: 'Marketing',   salary: 65000, joined: '2023-06-12' },
  { id: 7, name: 'Amit',    dept: 'Finance',     salary: 110000, joined: '2020-09-08' },
  { id: 8, name: 'Divya',   dept: 'Finance',     salary: 105000, joined: '2021-04-22' },
  { id: 9, name: 'Suresh',  dept: 'Finance',     salary: 98000, joined: '2022-08-30' },
  { id: 10, name: 'Meera',  dept: 'Engineering', salary: 92000, joined: '2021-12-01' },
]

/* ---- Sales dataset ---- */
const SALES = [
  { date: 'Jan 1', revenue: 12000 },
  { date: 'Jan 2', revenue: 8500  },
  { date: 'Jan 3', revenue: 15000 },
  { date: 'Jan 4', revenue: 9200  },
  { date: 'Jan 5', revenue: 18500 },
  { date: 'Jan 6', revenue: 7800  },
  { date: 'Jan 7', revenue: 22000 },
  { date: 'Jan 8', revenue: 14300 },
]

/* ---- Dept colors ---- */
const DEPT_COLOR = {
  Engineering: C.blue,
  Marketing: C.green,
  Finance: C.orange,
}

/* ---- Monospace code snippet ---- */
function CodeSnippet({ code, highlight }) {
  return (
    <pre style={{
      background: '#0f172a',
      color: '#e2e8f0',
      borderRadius: 14,
      padding: '20px 24px',
      fontSize: 14,
      lineHeight: 1.8,
      margin: '16px 0',
      overflowX: 'auto',
      border: '1px solid #1e293b',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    }}>
      {code.split('\n').map((line, i) => (
        <div key={i} style={{
          background: highlight === i ? '#1e3a5f' : 'transparent',
          borderRadius: 4,
          padding: '0 4px',
        }}>
          <span style={{ color: '#64748b', userSelect: 'none', marginRight: 16, fontSize: 12 }}>
            {String(i + 1).padStart(2, ' ')}
          </span>
          <span dangerouslySetInnerHTML={{ __html: colorizeSQL(line) }} />
        </div>
      ))}
    </pre>
  )
}

function colorizeSQL(line) {
  const keywords = ['SELECT','FROM','WHERE','GROUP BY','ORDER BY','OVER','PARTITION BY','WITH','AS','JOIN','ON','SUM','AVG','COUNT','MAX','MIN','RANK','ROW_NUMBER','DENSE_RANK','LAG','LEAD','ROWS','BETWEEN','PRECEDING','CURRENT ROW','FOLLOWING','DESC','ASC','BY','AND','OR','NOT','IN','HAVING','LIMIT','DISTINCT','CREATE','TABLE','INSERT','UPDATE','DELETE']
  let result = line
  keywords.forEach(kw => {
    const re = new RegExp(`\\b(${kw})\\b`, 'gi')
    result = result.replace(re, `<span style="color:#60a5fa;font-weight:700">$1</span>`)
  })
  result = result.replace(/('.*?')/g, `<span style="color:#86efac">$1</span>`)
  result = result.replace(/(\d+)/g, `<span style="color:#fca5a5">$1</span>`)
  result = result.replace(/(--.*)/g, `<span style="color:#94a3b8;font-style:italic">$1</span>`)
  return result
}

/* ================================================================
   SECTION 1 — The Problem GROUP BY Can't Solve
================================================================ */
function GroupByProblem() {
  const [view, setView] = useState('both') // 'groupby' | 'window' | 'both'

  const deptAvg = {}
  EMPLOYEES.forEach(e => {
    if (!deptAvg[e.dept]) deptAvg[e.dept] = { sum: 0, count: 0 }
    deptAvg[e.dept].sum += e.salary
    deptAvg[e.dept].count++
  })
  Object.keys(deptAvg).forEach(d => {
    deptAvg[d].avg = Math.round(deptAvg[d].sum / deptAvg[d].count)
  })

  const groupByRows = Object.entries(deptAvg).map(([dept, v]) => ({ dept, avg: v.avg }))

  return (
    <SectionBlock icon="🚧" title="The Problem GROUP BY Can't Solve" color={C.red}>
      <Neuron mood="thinking" message="I want each employee's salary AND their department's average salary — in the SAME row. But GROUP BY collapses rows. Watch what happens..." />

      <div style={{
        background: '#fef2f2',
        border: '1.5px solid #fecaca',
        borderRadius: 14,
        padding: '16px 24px',
        marginTop: 20,
        marginBottom: 24,
      }}>
        <div style={{ fontWeight: 700, color: C.red, fontSize: 15, marginBottom: 8 }}>
          What we want:
        </div>
        <code style={{ fontSize: 13, color: '#374151' }}>
          SELECT name, salary, dept, <strong>AVG(salary) OVER (PARTITION BY dept)</strong> AS dept_avg FROM employees
        </code>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {['both', 'groupby', 'window'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '8px 20px', borderRadius: 30, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
            background: view === v ? C.blue : '#e2e8f0',
            color: view === v ? '#fff' : '#374151',
          }}>
            {v === 'both' ? 'Compare Both' : v === 'groupby' ? 'GROUP BY Result' : 'Window Function Result'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* GROUP BY result */}
        <AnimatePresence>
          {(view === 'both' || view === 'groupby') && (
            <motion.div key="gb" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ flex: 1, minWidth: 260 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>❌</span> GROUP BY — 3 rows only
              </div>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1.5px solid #fecaca' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  background: '#dc2626', color: '#fff', padding: '10px 16px',
                  fontWeight: 700, fontSize: 13, gap: 8,
                }}>
                  <span>dept</span><span>avg_salary</span>
                </div>
                {groupByRows.map((row, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      padding: '10px 16px', fontSize: 14, gap: 8,
                      background: i % 2 === 0 ? '#fff' : '#fff5f5',
                      borderBottom: '1px solid #fecaca',
                    }}
                  >
                    <span style={{ color: DEPT_COLOR[row.dept], fontWeight: 700 }}>{row.dept}</span>
                    <span style={{ color: '#374151' }}>₹{row.avg.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
              <div style={{
                marginTop: 10, padding: '10px 14px',
                background: '#fef2f2', borderRadius: 10, fontSize: 13, color: C.red, fontWeight: 600,
              }}>
                Individual employees are GONE. 10 rows → 3 rows.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Window Function result */}
        <AnimatePresence>
          {(view === 'both' || view === 'window') && (
            <motion.div key="wf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ flex: 2, minWidth: 340 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>✅</span> Window Function — all 10 rows with dept avg
              </div>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1.5px solid #bbf7d0' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr 1.2fr',
                  background: '#16a34a', color: '#fff', padding: '10px 16px',
                  fontWeight: 700, fontSize: 12, gap: 8,
                }}>
                  <span>name</span><span>dept</span><span>salary</span>
                  <span style={{ background: '#15803d', borderRadius: 6, padding: '2px 6px' }}>dept_avg ✨</span>
                </div>
                {EMPLOYEES.map((emp, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr 1.2fr',
                      padding: '8px 16px', fontSize: 13, gap: 8,
                      background: i % 2 === 0 ? '#fff' : '#f0fdf4',
                      borderBottom: '1px solid #bbf7d0',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{emp.name}</span>
                    <span style={{ color: DEPT_COLOR[emp.dept], fontWeight: 600, fontSize: 12 }}>{emp.dept}</span>
                    <span style={{ color: '#374151' }}>₹{emp.salary.toLocaleString()}</span>
                    <span style={{
                      background: '#dcfce7', color: '#166534', fontWeight: 700,
                      borderRadius: 6, padding: '1px 8px', fontSize: 12, textAlign: 'center',
                    }}>
                      ₹{deptAvg[emp.dept].avg.toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div style={{
                marginTop: 10, padding: '10px 14px',
                background: '#f0fdf4', borderRadius: 10, fontSize: 13, color: C.green, fontWeight: 600,
              }}>
                All 10 employees kept! The new column is computed per window (per dept).
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NeuronTip type="tip">
        <strong>The Window Function Trick:</strong> It computes over a "window" of rows without collapsing them. Think of it as adding a new column where each cell is computed by looking at a group — but keeping every row intact.
      </NeuronTip>

      <HindiExplainer
        concept="Window Functions क्यों ज़रूरी?"
        english="Why Window Functions?"
        explanation="GROUP BY ने rows को मिला दिया — जैसे class की average निकालने पर सभी students का record हट जाए और सिर्फ average बचे। Window Function कहता है: 'Average निकालो, लेकिन हर student को उसकी row में रखो।'"
        example="10 employees हैं, 3 departments हैं। GROUP BY → 3 rows। Window Function → 10 rows, plus हर row में उसके department की average।"
        terms={[
          { hindi: 'OVER()', english: 'Window clause', meaning: 'यह बताता है कि window कहाँ तक है' },
          { hindi: 'PARTITION BY', english: 'Partition clause', meaning: 'किस column से group करना है' },
          { hindi: 'Window', english: 'विंडो', meaning: 'rows का एक समूह जिस पर calculation होती है' },
        ]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 2 — Window Functions Visualizer
================================================================ */
function WindowFunctionsVisualizer() {
  const [activeFunc, setActiveFunc] = useState('row_number')
  const [partition, setPartition] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [showCol, setShowCol] = useState(true)

  const funcs = [
    { id: 'row_number', label: 'ROW_NUMBER()', color: C.blue },
    { id: 'rank',       label: 'RANK()',       color: C.purple },
    { id: 'dense_rank', label: 'DENSE_RANK()', color: C.teal },
    { id: 'sum',        label: 'SUM() running',color: C.orange },
  ]

  // Sort by salary desc
  const sorted = [...EMPLOYEES].sort((a, b) => b.salary - a.salary)

  const computeValues = () => {
    if (partition) {
      // Per-dept ranking by salary desc
      const byDept = {}
      EMPLOYEES.forEach(e => {
        if (!byDept[e.dept]) byDept[e.dept] = []
        byDept[e.dept].push(e)
      })
      Object.keys(byDept).forEach(d => byDept[d].sort((a, b) => b.salary - a.salary))

      const rankInDept = {}
      Object.entries(byDept).forEach(([dept, emps]) => {
        let rn = 1, rank = 1, denseRank = 1
        emps.forEach((e, i) => {
          if (i > 0 && emps[i].salary === emps[i-1].salary) {
            rankInDept[e.id] = { row_number: rn, rank, dense_rank: denseRank }
          } else {
            if (i > 0) { rank = rn; denseRank++ }
            rankInDept[e.id] = { row_number: rn, rank, dense_rank: denseRank }
          }
          rn++
        })
      })

      return EMPLOYEES.map(e => ({
        ...e,
        value: rankInDept[e.id]?.[activeFunc === 'sum' ? 'row_number' : activeFunc] ?? '—',
      }))
    }

    // Global, sorted by salary desc
    let rn = 1, rank = 1, denseRank = 1
    const vals = {}
    let running = 0
    sorted.forEach((e, i) => {
      running += e.salary
      if (i > 0 && e.salary === sorted[i-1].salary) {
        vals[e.id] = { row_number: rn, rank, dense_rank: denseRank, sum: running }
      } else {
        if (i > 0) { rank = rn; denseRank++ }
        vals[e.id] = { row_number: rn, rank, dense_rank: denseRank, sum: running }
      }
      rn++
    })

    return sorted.map(e => ({ ...e, value: vals[e.id]?.[activeFunc] ?? '—' }))
  }

  const rows = computeValues()

  const switchFunc = (id) => {
    setShowCol(false)
    setActiveFunc(id)
    setTimeout(() => setShowCol(true), 200)
  }

  const colLabel = {
    row_number: 'ROW_NUMBER',
    rank: 'RANK',
    dense_rank: 'DENSE_RANK',
    sum: 'RUNNING_SUM',
  }[activeFunc]

  const colColor = funcs.find(f => f.id === activeFunc)?.color

  const query = partition
    ? `SELECT name, dept, salary,\n  ${activeFunc === 'sum' ? 'SUM(salary)' : activeFunc.toUpperCase() + '()'} OVER (\n    PARTITION BY dept\n    ORDER BY salary DESC\n  ) AS ${colLabel}\nFROM employees;`
    : `SELECT name, dept, salary,\n  ${activeFunc === 'sum' ? 'SUM(salary)' : activeFunc.toUpperCase() + '()'} OVER (\n    ORDER BY salary DESC\n  ) AS ${colLabel}\nFROM employees;`

  return (
    <SectionBlock icon="🔢" title="Window Functions Visualizer" color={C.purple}>
      <Neuron mood="excited" message="Click different window functions and watch the result column animate. Then toggle PARTITION BY to rank within each department!" />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, marginBottom: 16 }}>
        {funcs.map(f => (
          <button key={f.id} onClick={() => switchFunc(f.id)} style={{
            padding: '9px 18px', borderRadius: 30, border: `2px solid ${f.color}`,
            cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
            background: activeFunc === f.id ? f.color : 'transparent',
            color: activeFunc === f.id ? '#fff' : f.color,
          }}>
            {f.label}
          </button>
        ))}
        <button onClick={() => { setPartition(!partition); setShowCol(false); setTimeout(() => setShowCol(true), 200) }} style={{
          padding: '9px 18px', borderRadius: 30, border: `2px solid ${C.pink}`,
          cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
          background: partition ? C.pink : 'transparent',
          color: partition ? '#fff' : C.pink,
          marginLeft: 8,
        }}>
          {partition ? '✓ PARTITION BY dept' : '+ PARTITION BY dept'}
        </button>
      </div>

      <CodeSnippet code={query} />

      <div style={{ borderRadius: 16, overflow: 'hidden', border: `1.5px solid ${colColor}44`, marginTop: 20 }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '28px 1.2fr 1.5fr 1fr 1.2fr',
          background: '#0f172a', color: '#94a3b8', padding: '10px 16px',
          fontWeight: 700, fontSize: 12, gap: 8,
        }}>
          <span>#</span><span>name</span><span>dept</span><span>salary</span>
          <motion.span key={colLabel} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{
            color: colColor, background: `${colColor}22`, borderRadius: 6, padding: '2px 8px',
          }}>
            {colLabel} ✨
          </motion.span>
        </div>

        {rows.map((emp, i) => (
          <motion.div key={emp.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            style={{
              display: 'grid', gridTemplateColumns: '28px 1.2fr 1.5fr 1fr 1.2fr',
              padding: '9px 16px', fontSize: 13, gap: 8,
              background: i % 2 === 0 ? '#fff' : '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>{i + 1}</span>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>{emp.name}</span>
            <span style={{
              color: DEPT_COLOR[emp.dept], fontWeight: 600, fontSize: 12,
              background: `${DEPT_COLOR[emp.dept]}15`, borderRadius: 6, padding: '1px 8px', width: 'fit-content',
            }}>{emp.dept}</span>
            <span style={{ color: '#374151' }}>₹{emp.salary.toLocaleString()}</span>
            <AnimatePresence mode="wait">
              {showCol && (
                <motion.span key={`${activeFunc}-${partition}-${emp.id}`}
                  initial={{ opacity: 0, scale: 0.7, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  style={{
                    background: `${colColor}20`, color: colColor, fontWeight: 800,
                    borderRadius: 8, padding: '2px 10px', textAlign: 'center', fontSize: 14,
                  }}
                >
                  {activeFunc === 'sum' ? `₹${Number(emp.value).toLocaleString()}` : emp.value}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Explainer box for rank vs dense_rank */}
      <AnimatePresence>
        {(activeFunc === 'rank' || activeFunc === 'dense_rank') && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginTop: 18, display: 'flex', gap: 16, flexWrap: 'wrap',
            }}
          >
            <div style={{
              flex: 1, minWidth: 220, padding: '14px 18px', borderRadius: 14,
              background: '#f0f4ff', border: '1.5px solid #bfdbfe',
            }}>
              <div style={{ fontWeight: 800, color: C.blue, fontSize: 14, marginBottom: 6 }}>RANK()</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                Tied rows get the SAME rank. Next rank has a gap.<br />
                <span style={{ color: C.blue, fontWeight: 700 }}>e.g.: 1, 2, 2, 4, 5</span> (no rank 3)
              </div>
            </div>
            <div style={{
              flex: 1, minWidth: 220, padding: '14px 18px', borderRadius: 14,
              background: '#f0fdf4', border: '1.5px solid #bbf7d0',
            }}>
              <div style={{ fontWeight: 800, color: C.teal, fontSize: 14, marginBottom: 6 }}>DENSE_RANK()</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                Tied rows get the SAME rank. Next rank has NO gap.<br />
                <span style={{ color: C.teal, fontWeight: 700 }}>e.g.: 1, 2, 2, 3, 4</span> (consecutive always)
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NeuronTip type="warning">
        <strong>ROW_NUMBER vs RANK vs DENSE_RANK:</strong> All three rank rows. The difference is how they handle TIEs. In interviews, "find the 2nd highest salary" usually wants DENSE_RANK so ties don't cause gaps.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 3 — Running Totals & Moving Averages
================================================================ */
function RunningTotals() {
  const [mode, setMode] = useState('bar') // 'bar' | 'running' | 'moving' | 'pct'
  const MAX_REV = Math.max(...SALES.map(s => s.revenue))
  const totalRev = SALES.reduce((s, r) => s + r.revenue, 0)

  // Running total
  let cumSum = 0
  const withRunning = SALES.map(s => {
    cumSum += s.revenue
    return { ...s, running: cumSum }
  })

  // 3-day moving average
  const withMoving = SALES.map((s, i) => {
    const start = Math.max(0, i - 2)
    const window = SALES.slice(start, i + 1)
    return { ...s, moving: Math.round(window.reduce((a, b) => a + b.revenue, 0) / window.length) }
  })

  const maxRunning = withRunning[withRunning.length - 1].running
  const BAR_HEIGHT = 180

  const modeConfig = {
    bar:     { label: 'Daily Revenue',       color: C.blue,   desc: 'Raw daily revenue — peaks and valleys visible' },
    running: { label: 'Running Total',       color: C.green,  desc: 'SUM(revenue) OVER (ORDER BY date) — cumulative, always grows' },
    moving:  { label: '3-Day Moving Avg',    color: C.orange, desc: 'AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — smoothed trend' },
    pct:     { label: '% of Total',          color: C.purple, desc: 'revenue / SUM(revenue) OVER () * 100 — share of grand total per day' },
  }

  const queries = {
    bar:     `SELECT date, revenue FROM sales;`,
    running: `SELECT date, revenue,\n  SUM(revenue) OVER (\n    ORDER BY date\n  ) AS running_total\nFROM sales;`,
    moving:  `SELECT date, revenue,\n  AVG(revenue) OVER (\n    ORDER BY date\n    ROWS BETWEEN 2 PRECEDING\n    AND CURRENT ROW\n  ) AS moving_avg_3d\nFROM sales;`,
    pct:     `SELECT date, revenue,\n  ROUND(revenue * 100.0 /\n    SUM(revenue) OVER (), 1\n  ) AS pct_of_total\nFROM sales;`,
  }

  const getValue = (s, i) => {
    if (mode === 'running') return withRunning[i].running
    if (mode === 'moving')  return withMoving[i].moving
    if (mode === 'pct')     return Math.round(s.revenue * 100 / totalRev * 10) / 10
    return s.revenue
  }

  const getMax = () => {
    if (mode === 'running') return maxRunning
    if (mode === 'moving')  return MAX_REV
    if (mode === 'pct')     return 30
    return MAX_REV
  }

  const formatVal = (v) => {
    if (mode === 'pct') return `${v}%`
    return `₹${v.toLocaleString()}`
  }

  return (
    <SectionBlock icon="📈" title="Running Totals & Moving Averages" color={C.green}>
      <Neuron mood="explaining" message="Imagine tracking your company's daily sales. A running total shows how much you've earned so far this month. A moving average smooths out noisy spikes. SQL window functions do both in ONE line." />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, marginBottom: 16 }}>
        {Object.entries(modeConfig).map(([k, v]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            padding: '8px 18px', borderRadius: 30, border: `2px solid ${v.color}`,
            cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
            background: mode === k ? v.color : 'transparent',
            color: mode === k ? '#fff' : v.color,
          }}>
            {v.label}
          </button>
        ))}
      </div>

      <div style={{
        background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 14 }}>
          {modeConfig[mode].desc}
        </div>

        {/* Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: BAR_HEIGHT + 40, paddingBottom: 28, position: 'relative' }}>
          {SALES.map((s, i) => {
            const val = getValue(s, i)
            const maxVal = getMax()
            const barH = Math.round((s.revenue / maxVal) * BAR_HEIGHT)
            const lineH = Math.round((val / maxVal) * BAR_HEIGHT)

            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                {/* Bar */}
                <motion.div
                  layout
                  style={{
                    width: '80%', borderRadius: '6px 6px 0 0',
                    background: `${C.blue}33`, border: `1.5px solid ${C.blue}66`,
                    position: 'absolute', bottom: 28,
                  }}
                  animate={{ height: barH }}
                  transition={{ duration: 0.5 }}
                />
                {/* Line dot for computed value */}
                {mode !== 'bar' && (
                  <motion.div
                    animate={{ bottom: lineH + 28 - 6 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: modeConfig[mode].color,
                      border: '2px solid #fff',
                      boxShadow: `0 0 8px ${modeConfig[mode].color}`,
                      position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                      zIndex: 2,
                    }}
                  />
                )}
                <div style={{
                  position: 'absolute', bottom: 0, fontSize: 11, color: '#64748b', fontWeight: 600,
                  textAlign: 'center', width: '100%',
                }}>
                  {s.date.split(' ')[1]}
                </div>
              </div>
            )
          })}
          {/* Connect line dots */}
          {mode !== 'bar' && (
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {SALES.slice(1).map((s, i) => {
                const maxVal = getMax()
                const y1 = BAR_HEIGHT - Math.round((getValue(SALES[i], i) / maxVal) * BAR_HEIGHT) + 8
                const y2 = BAR_HEIGHT - Math.round((getValue(s, i + 1) / maxVal) * BAR_HEIGHT) + 8
                const step = 100 / SALES.length
                const x1 = (i + 0.5) * step + '%'
                const x2 = (i + 1.5) * step + '%'
                return (
                  <motion.line key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={modeConfig[mode].color} strokeWidth={2.5} strokeDasharray="4,2"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  />
                )
              })}
            </svg>
          )}
        </div>

        {/* Values row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {SALES.map((s, i) => {
            const val = getValue(s, i)
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  flex: 1, textAlign: 'center', fontSize: 11,
                  fontWeight: 700, color: modeConfig[mode].color,
                  background: `${modeConfig[mode].color}10`,
                  borderRadius: 6, padding: '3px 2px',
                }}
              >
                {formatVal(val)}
              </motion.div>
            )
          })}
        </div>
      </div>

      <CodeSnippet code={queries[mode]} />

      <NeuronTip type="example">
        <strong>Real-world use:</strong> Running totals power the "MTD revenue" widget on every dashboard. Moving averages smooth out stock prices. Percent-of-total shows which day drove the most business — all three are 1-line window functions in SQL.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 4 — Subqueries
================================================================ */
function SubqueriesSection() {
  const [example, setExample] = useState(0)
  const [step, setStep] = useState(0) // 0=idle, 1=inner, 2=outer

  const examples = [
    {
      title: 'Employees earning more than average',
      inner: `SELECT AVG(salary) FROM employees`,
      innerResult: '₹90,100',
      outer: `SELECT name, salary FROM employees\nWHERE salary > (SELECT AVG(salary)\n               FROM employees)`,
      outerDesc: 'Filters employees where salary > 90,100',
      result: EMPLOYEES.filter(e => e.salary > 90100).map(e => ({ name: e.name, salary: `₹${e.salary.toLocaleString()}` })),
      innerDesc: 'Computes average salary across ALL employees',
    },
    {
      title: 'Highest-paid department',
      inner: `SELECT dept, SUM(salary) AS total\nFROM employees\nGROUP BY dept\nORDER BY total DESC\nLIMIT 1`,
      innerResult: 'Finance (₹313,000)',
      outer: `SELECT * FROM employees\nWHERE dept = (\n  SELECT dept FROM employees\n  GROUP BY dept\n  ORDER BY SUM(salary) DESC\n  LIMIT 1\n)`,
      outerDesc: 'Shows all employees in the richest department',
      result: EMPLOYEES.filter(e => e.dept === 'Finance').map(e => ({ name: e.name, dept: e.dept, salary: `₹${e.salary.toLocaleString()}` })),
      innerDesc: 'Finds which dept has the highest salary total',
    },
  ]

  const ex = examples[example]

  const runAnimation = async () => {
    setStep(0)
    await new Promise(r => setTimeout(r, 100))
    setStep(1)
    await new Promise(r => setTimeout(r, 1500))
    setStep(2)
  }

  return (
    <SectionBlock icon="🔮" title="Subqueries — Questions Inside Questions" color={C.indigo}>
      <Neuron mood="thinking" message="A subquery is like asking: 'Who earns more than average?' — but first you need to ask 'What IS the average?' SQL lets you nest one question inside another." />

      {/* Nested box visual */}
      <div style={{
        marginTop: 20, marginBottom: 24,
        background: '#f0f4ff', border: '2px dashed #818cf8', borderRadius: 20, padding: 20,
        position: 'relative',
      }}>
        <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          OUTER QUERY
        </div>
        <div style={{
          background: '#fdf4ff', border: '2px dashed #c084fc', borderRadius: 14, padding: 16, margin: '8px 16px',
        }}>
          <div style={{ fontSize: 12, color: '#c084fc', fontWeight: 700, marginBottom: 6 }}>
            INNER QUERY (runs first!)
          </div>
          <code style={{ fontSize: 13, color: '#374151' }}>SELECT AVG(salary) FROM employees</code>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            Returns: <strong>90100</strong>
          </div>
        </div>
        <code style={{ fontSize: 13, color: '#374151', display: 'block', marginTop: 8 }}>
          SELECT name, salary FROM employees WHERE salary &gt; <strong style={{ color: '#6d28d9' }}>(inner result)</strong>
        </code>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {examples.map((ex, i) => (
          <button key={i} onClick={() => { setExample(i); setStep(0) }} style={{
            padding: '8px 18px', borderRadius: 30, border: `2px solid ${C.indigo}`,
            cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
            background: example === i ? C.indigo : 'transparent',
            color: example === i ? '#fff' : C.indigo,
          }}>
            {ex.title}
          </button>
        ))}
      </div>

      <InteractiveDemo title="Step-by-Step Subquery Execution" instruction="Click 'Run Query' to watch the inner query execute first, then the outer query use its result.">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <button onClick={runAnimation} style={{
            padding: '10px 28px', borderRadius: 30, border: 'none', cursor: 'pointer',
            background: C.indigo, color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            Run Query ▶
          </button>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Inner query */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <motion.div
              animate={{
                boxShadow: step === 1 ? `0 0 0 3px ${C.purple}, 0 8px 32px ${C.purple}44` : '0 0 0 0px transparent',
                background: step === 1 ? '#f5f0ff' : '#f8fafc',
              }}
              transition={{ duration: 0.4 }}
              style={{ borderRadius: 14, padding: 16, border: '1.5px solid #ddd6fe' }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: C.purple, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {step === 1 ? '⚡ Running first...' : 'Step 1: Inner Query'}
              </div>
              <CodeSnippet code={ex.inner} />
              <AnimatePresence>
                {step >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 10, padding: '10px 14px', borderRadius: 10,
                      background: '#f5f0ff', border: '1.5px solid #c4b5fd',
                      fontSize: 14, fontWeight: 800, color: C.purple,
                      textAlign: 'center',
                    }}
                  >
                    Result: {ex.innerResult}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 28 }}>
            <motion.div
              animate={{ opacity: step >= 1 ? 1 : 0.2, scale: step >= 2 ? 1.3 : 1 }}
              style={{ color: C.green }}
            >
              →
            </motion.div>
          </div>

          {/* Outer query */}
          <div style={{ flex: 1.2, minWidth: 280 }}>
            <motion.div
              animate={{
                boxShadow: step === 2 ? `0 0 0 3px ${C.blue}, 0 8px 32px ${C.blue}44` : '0 0 0 0px transparent',
                background: step === 2 ? '#eff6ff' : '#f8fafc',
              }}
              transition={{ duration: 0.4 }}
              style={{ borderRadius: 14, padding: 16, border: '1.5px solid #bfdbfe' }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blue, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {step === 2 ? '⚡ Running now...' : 'Step 2: Outer Query'}
              </div>
              <CodeSnippet code={ex.outer} />
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>{ex.outerDesc}</div>
            </motion.div>
          </div>
        </div>

        {/* Result table */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ marginTop: 24 }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 10 }}>
                Result ({ex.result.length} rows):
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid #bbf7d0' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: `repeat(${Object.keys(ex.result[0]).length}, 1fr)`,
                  background: C.green, color: '#fff', padding: '8px 16px', fontWeight: 700, fontSize: 13, gap: 8,
                }}>
                  {Object.keys(ex.result[0]).map(k => <span key={k}>{k}</span>)}
                </div>
                {ex.result.map((row, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    style={{
                      display: 'grid', gridTemplateColumns: `repeat(${Object.keys(row).length}, 1fr)`,
                      padding: '8px 16px', fontSize: 13, gap: 8,
                      background: i % 2 === 0 ? '#fff' : '#f0fdf4',
                      borderBottom: '1px solid #dcfce7',
                    }}
                  >
                    {Object.values(row).map((v, j) => (
                      <span key={j} style={{ fontWeight: j === 0 ? 700 : 400, color: '#374151' }}>{v}</span>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveDemo>

      <NeuronTip type="deep">
        <strong>Subquery locations:</strong> Subqueries can go in WHERE (scalar), FROM (derived table), SELECT (correlated), or HAVING. The most common interview pattern is WHERE salary &gt; (SELECT AVG(salary) ...).
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 5 — CTEs
================================================================ */
function CTESection() {
  const [showCTE, setShowCTE] = useState(true)
  const [step, setStep] = useState(0)

  const messyQuery = `SELECT * FROM (
  SELECT dept, SUM(salary) AS total
  FROM (
    SELECT * FROM employees
    WHERE dept IN (
      SELECT DISTINCT dept FROM employees
      WHERE salary > 70000
    )
  ) AS filtered
  GROUP BY dept
) AS dept_totals
WHERE total > 100000;`

  const cteQuery = `WITH qualified_emps AS (
  -- Step 1: Employees with salary > 70000
  SELECT * FROM employees
  WHERE salary > 70000
),
dept_totals AS (
  -- Step 2: Sum salaries per dept
  SELECT dept, SUM(salary) AS total
  FROM qualified_emps
  GROUP BY dept
)
-- Step 3: Filter depts with total > 100000
SELECT dept, total
FROM dept_totals
WHERE total > 100000;`

  const cteParts = [
    { name: 'qualified_emps', color: C.blue, desc: 'Employees earning > ₹70k', rows: EMPLOYEES.filter(e => e.salary > 70000) },
    { name: 'dept_totals', color: C.purple, desc: 'Sum salaries per department' },
    { name: 'Final SELECT', color: C.green, desc: 'Departments with total > ₹100k' },
  ]

  const deptTotals = {}
  EMPLOYEES.filter(e => e.salary > 70000).forEach(e => {
    deptTotals[e.dept] = (deptTotals[e.dept] || 0) + e.salary
  })
  const finalRows = Object.entries(deptTotals).filter(([, v]) => v > 100000).map(([dept, total]) => ({ dept, total: `₹${total.toLocaleString()}` }))

  return (
    <SectionBlock icon="🧱" title="CTEs — Making Subqueries Readable" color={C.teal}>
      <Neuron mood="happy" message="CTEs (Common Table Expressions) are like giving your subquery a name. Instead of nesting queries inside each other like Russian dolls, you write them in steps. Same result, 10x more readable." />

      <div style={{ display: 'flex', gap: 12, marginTop: 20, marginBottom: 20 }}>
        <button onClick={() => setShowCTE(false)} style={{
          padding: '8px 20px', borderRadius: 30, border: `2px solid ${C.red}`,
          cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
          background: !showCTE ? C.red : 'transparent', color: !showCTE ? '#fff' : C.red,
        }}>
          Messy Nested Subqueries
        </button>
        <button onClick={() => setShowCTE(true)} style={{
          padding: '8px 20px', borderRadius: 30, border: `2px solid ${C.teal}`,
          cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
          background: showCTE ? C.teal : 'transparent', color: showCTE ? '#fff' : C.teal,
        }}>
          Clean CTEs with WITH
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showCTE ? (
          <motion.div key="messy" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ❌ Hard to read — which closing bracket belongs to which SELECT?
            </div>
            <CodeSnippet code={messyQuery} />
          </motion.div>
        ) : (
          <motion.div key="clean" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ✅ Same logic, written as named steps — perfectly readable
            </div>
            <CodeSnippet code={cteQuery} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step-by-step CTE builder */}
      <InteractiveDemo title="CTE Step-by-Step Builder" instruction="Click each CTE step to see what it produces. Data flows from top to bottom.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cteParts.map((part, i) => (
            <motion.div key={i}
              onClick={() => setStep(step === i + 1 ? 0 : i + 1)}
              whileHover={{ scale: 1.01 }}
              style={{
                borderRadius: 14, border: `2px solid ${step >= i + 1 ? part.color : '#e2e8f0'}`,
                overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.3s',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 18px',
                background: step >= i + 1 ? `${part.color}18` : '#f8fafc',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: step >= i + 1 ? part.color : '#e2e8f0',
                    color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: 13,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: step >= i + 1 ? part.color : '#64748b', fontSize: 15 }}>
                      {part.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{part.desc}</div>
                  </div>
                </div>
                <div style={{ fontSize: 18, color: part.color }}>
                  {step >= i + 1 ? '▼' : '▶'}
                </div>
              </div>

              <AnimatePresence>
                {step >= i + 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', background: '#fff', borderTop: `1px solid ${part.color}33` }}
                  >
                    <div style={{ padding: 16 }}>
                      {i === 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {part.rows.map((emp, j) => (
                            <motion.div key={j} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: j * 0.05 }}
                              style={{
                                padding: '6px 12px', borderRadius: 8,
                                background: `${DEPT_COLOR[emp.dept]}15`,
                                border: `1px solid ${DEPT_COLOR[emp.dept]}44`,
                                fontSize: 13, fontWeight: 600,
                              }}
                            >
                              {emp.name} — ₹{emp.salary.toLocaleString()}
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {i === 1 && (
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {Object.entries(deptTotals).map(([dept, total], j) => (
                            <motion.div key={j} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: j * 0.1 }}
                              style={{
                                padding: '10px 16px', borderRadius: 10,
                                background: `${DEPT_COLOR[dept]}15`,
                                border: `1px solid ${DEPT_COLOR[dept]}44`, textAlign: 'center',
                              }}
                            >
                              <div style={{ fontWeight: 800, color: DEPT_COLOR[dept] }}>{dept}</div>
                              <div style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>₹{total.toLocaleString()}</div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {i === 2 && (
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {finalRows.map((row, j) => (
                            <motion.div key={j} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: j * 0.1 }}
                              style={{
                                padding: '10px 16px', borderRadius: 10,
                                background: '#f0fdf4', border: '1.5px solid #86efac', textAlign: 'center',
                              }}
                            >
                              <div style={{ fontWeight: 800, color: C.green }}>{row.dept}</div>
                              <div style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>{row.total}</div>
                              <div style={{ fontSize: 11, color: '#4ade80', marginTop: 2 }}>✓ &gt; ₹1,00,000</div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </InteractiveDemo>

      <NeuronTip type="tip">
        <strong>CTE Rule of Thumb:</strong> If you find yourself nesting more than one subquery, convert to CTEs. Each CTE is a named temporary result that only exists for the duration of the query. Interviews love CTEs — they show you write maintainable SQL.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 6 — Interview Challenge
================================================================ */
function InterviewChallenge() {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState({})
  const [showResult, setShowResult] = useState({})

  const problems = [
    {
      id: 0,
      question: 'Rank employees by salary within each department',
      hint: 'You need ranking WITHIN groups — what keyword splits rows into groups?',
      options: [
        { label: 'GROUP BY + ORDER BY', correct: false, reason: 'GROUP BY collapses rows — you lose individual employees.' },
        { label: 'RANK() OVER (PARTITION BY dept ORDER BY salary DESC)', correct: true, reason: 'Exactly right! PARTITION BY splits into dept windows, then RANK() orders within each.' },
        { label: 'ROW_NUMBER() OVER (ORDER BY salary DESC)', correct: false, reason: 'This ranks globally, not per department.' },
      ],
      query: `SELECT name, dept, salary,\n  RANK() OVER (\n    PARTITION BY dept\n    ORDER BY salary DESC\n  ) AS dept_rank\nFROM employees;`,
      resultRows: [
        { name: 'Amit', dept: 'Finance', salary: '₹1,10,000', dept_rank: 1 },
        { name: 'Divya', dept: 'Finance', salary: '₹1,05,000', dept_rank: 2 },
        { name: 'Arjun', dept: 'Engineering', salary: '₹95,000', dept_rank: 1 },
        { name: 'Vikram', dept: 'Marketing', salary: '₹78,000', dept_rank: 1 },
      ],
      color: C.blue,
    },
    {
      id: 1,
      question: 'Find the 2nd highest salary',
      hint: 'Careful with ties! If two people share the highest salary, what is the "2nd highest"?',
      options: [
        { label: 'SELECT MAX(salary) WHERE salary < (SELECT MAX(salary)...)', correct: true, reason: 'Classic approach! Gets the maximum salary that is less than the maximum.' },
        { label: 'DENSE_RANK() OVER ... WHERE rank = 2', correct: true, reason: 'Also correct! DENSE_RANK handles ties properly — rank 2 = 2nd distinct salary.' },
        { label: 'SELECT salary ORDER BY salary DESC LIMIT 1 OFFSET 1', correct: false, reason: 'Dangerous! If two rows share the top salary, OFFSET 1 gives the same salary, not the 2nd highest distinct value.' },
      ],
      query: `-- Option A: Subquery approach\nSELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);\n\n-- Option B: DENSE_RANK approach\nSELECT DISTINCT salary\nFROM (\n  SELECT salary,\n    DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) t\nWHERE rnk = 2;`,
      resultRows: [{ second_highest: '₹1,05,000 (Finance - Divya)' }],
      color: C.purple,
    },
    {
      id: 2,
      question: 'Month-over-month revenue growth %',
      hint: 'You need each month\'s revenue AND the previous month\'s revenue in the same row.',
      options: [
        { label: 'Self JOIN on month-1', correct: false, reason: 'Works but verbose. You need to JOIN a table to itself shifted by one month.' },
        { label: 'LAG(revenue, 1) OVER (ORDER BY month)', correct: true, reason: 'LAG() is designed exactly for this — get the previous row\'s value in a window.' },
        { label: 'Subquery: WHERE month = current_month - 1', correct: false, reason: 'This gets a fixed month, not row-by-row previous — doesn\'t scale to all months at once.' },
      ],
      query: `SELECT month, revenue,\n  LAG(revenue, 1) OVER (\n    ORDER BY month\n  ) AS prev_revenue,\n  ROUND(\n    (revenue - LAG(revenue,1) OVER (ORDER BY month))\n    * 100.0 / LAG(revenue,1) OVER (ORDER BY month),\n    1\n  ) AS growth_pct\nFROM monthly_sales;`,
      resultRows: [
        { month: 'Jan', revenue: '₹1,00,000', prev: '—', growth: '—' },
        { month: 'Feb', revenue: '₹1,20,000', prev: '₹1,00,000', growth: '+20.0%' },
        { month: 'Mar', revenue: '₹1,08,000', prev: '₹1,20,000', growth: '-10.0%' },
      ],
      color: C.orange,
    },
    {
      id: 3,
      question: 'Employees who earn more than their manager',
      hint: 'Each employee row has a manager_id. How do you compare an employee to their manager who is ALSO in the same table?',
      options: [
        { label: 'Subquery: WHERE salary > (SELECT salary WHERE id = manager_id)', correct: true, reason: 'A correlated subquery — for each employee row, fetches that employee\'s manager\'s salary.' },
        { label: 'Self JOIN: e1 JOIN employees e2 ON e1.manager_id = e2.id', correct: true, reason: 'Best approach! Self-join joins the employees table to itself, e1 = employee, e2 = their manager.' },
        { label: 'GROUP BY manager_id HAVING salary > AVG(salary)', correct: false, reason: 'AVG is not the manager\'s salary — this gives employees above average within their manager\'s group.' },
      ],
      query: `-- Self JOIN approach (cleanest)\nSELECT e.name AS employee,\n       e.salary AS emp_salary,\n       m.name AS manager,\n       m.salary AS mgr_salary\nFROM employees e\nJOIN employees m\n  ON e.manager_id = m.id\nWHERE e.salary > m.salary;`,
      resultRows: [
        { employee: 'Priya', emp_salary: '₹88,000', manager: 'Arjun', mgr_salary: '₹85,000' },
      ],
      color: C.pink,
    },
  ]

  const handleAnswer = (problemId, optionIdx) => {
    setAnswered(prev => ({ ...prev, [problemId]: optionIdx }))
    setTimeout(() => setShowResult(prev => ({ ...prev, [problemId]: true })), 300)
  }

  return (
    <SectionBlock icon="🎯" title="SQL Interview Challenge" color={C.indigo}>
      <Neuron mood="excited" message="4 real interview questions. Pick the right approach. These exact patterns appear in FAANG, fintech, and startup SQL rounds. Let's go!" />

      <div style={{ display: 'grid', gap: 24, marginTop: 24 }}>
        {problems.map((prob) => (
          <motion.div key={prob.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              borderRadius: 18, border: `2px solid ${prob.color}33`,
              overflow: 'hidden',
            }}
          >
            {/* Problem header */}
            <div style={{
              padding: '16px 24px',
              background: `${prob.color}10`,
              borderBottom: `1px solid ${prob.color}22`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: prob.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 16, flexShrink: 0,
              }}>
                {prob.id + 1}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>{prob.question}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{prob.hint}</div>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {prob.options.map((opt, oi) => {
                  const isAnswered = answered[prob.id] !== undefined
                  const isSelected = answered[prob.id] === oi
                  const correct = opt.correct

                  return (
                    <motion.button key={oi}
                      onClick={() => !isAnswered && handleAnswer(prob.id, oi)}
                      whileHover={!isAnswered ? { scale: 1.01 } : {}}
                      style={{
                        padding: '12px 18px', borderRadius: 12, border: '2px solid',
                        cursor: isAnswered ? 'default' : 'pointer', textAlign: 'left',
                        fontWeight: 600, fontSize: 14, lineHeight: 1.5,
                        fontFamily: 'inherit',
                        transition: 'all 0.3s',
                        borderColor: isAnswered
                          ? (correct ? '#16a34a' : (isSelected ? '#dc2626' : '#e2e8f0'))
                          : '#e2e8f0',
                        background: isAnswered
                          ? (correct ? '#f0fdf4' : (isSelected ? '#fef2f2' : '#f8fafc'))
                          : '#fff',
                        color: isAnswered
                          ? (correct ? '#166534' : (isSelected ? '#991b1b' : '#94a3b8'))
                          : '#374151',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{
                          fontSize: 16, flexShrink: 0,
                          opacity: isAnswered ? 1 : 0.5,
                        }}>
                          {isAnswered ? (correct ? '✅' : (isSelected ? '❌' : '○')) : `${String.fromCharCode(65 + oi)}.`}
                        </span>
                        <div>
                          <div>{opt.label}</div>
                          {isAnswered && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              style={{ fontSize: 12, marginTop: 4, fontWeight: 500, color: correct ? '#16a34a' : (isSelected ? '#dc2626' : '#94a3b8') }}
                            >
                              {opt.reason}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Show query and result after answering */}
              <AnimatePresence>
                {showResult[prob.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: prob.color, marginBottom: 6, marginTop: 8,
                      textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                      Correct Query:
                    </div>
                    <CodeSnippet code={prob.query} />

                    <div style={{
                      fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8,
                      textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                      Sample Output:
                    </div>
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid #bbf7d0' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Object.keys(prob.resultRows[0]).length}, 1fr)`,
                        background: C.green, color: '#fff', padding: '8px 14px', fontWeight: 700, fontSize: 12, gap: 8,
                      }}>
                        {Object.keys(prob.resultRows[0]).map(k => <span key={k}>{k}</span>)}
                      </div>
                      {prob.resultRows.map((row, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${Object.keys(row).length}, 1fr)`,
                            padding: '7px 14px', fontSize: 12, gap: 8,
                            background: i % 2 === 0 ? '#fff' : '#f0fdf4',
                            borderBottom: '1px solid #dcfce7',
                          }}
                        >
                          {Object.values(row).map((v, j) => (
                            <span key={j} style={{ color: '#374151' }}>{v}</span>
                          ))}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!answered[prob.id] !== undefined && answered[prob.id] === undefined && (
                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
                  Select your approach above
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <NeuronTip type="try">
        <strong>Interview Pattern Summary:</strong>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['Rank within group', 'RANK() OVER (PARTITION BY ... ORDER BY ...)'],
            ['N-th highest value', 'DENSE_RANK() WHERE rank = N, or nested MAX subquery'],
            ['Row-over-row change', 'LAG() or LEAD() window functions'],
            ['Compare to related row', 'Self JOIN (same table joined to itself)'],
          ].map(([q, a], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 13 }}>
              <span style={{ color: C.indigo, fontWeight: 700, minWidth: 180 }}>{q}:</span>
              <code style={{ color: '#374151', background: '#f1f5f9', padding: '1px 8px', borderRadius: 6 }}>{a}</code>
            </div>
          ))}
        </div>
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */
function HindiSummary() {
  return (
    <SectionBlock icon="🇮🇳" title="Wrap-up: SQL के Superpowers" color={C.orange}>
      <Neuron mood="waving" message="Yeh topic cover karte hi tum advanced SQL seekh chuke ho! Window Functions, Subqueries, CTEs — yeh teeno mila ke aap KISI bhi SQL interview mein impressive queries likh sakte ho." />

      <HindiExplainer
        concept="Advanced SQL — Window Functions, Subqueries, CTEs"
        english="Advanced SQL — Interview-Level Concepts"
        explanation={
          "Window Functions = rows ko collapse kiye bina calculation karna. GROUP BY ke jaise lagta hai, lekin har row apni jagah rehti hai. " +
          "Subquery = sawaal ke andar sawaal. Pehle inner query chalti hai, phir outer query uska jawab use karti hai. " +
          "CTE (WITH clause) = subquery ko ek readable naam dena — jaise ek bade kaam ko chhote named steps mein todna. " +
          "Yeh teeno concepts SQL interviews mein ZAROORI hain — FAANG se lekar startup tak, har jagah puchha jaata hai."
        }
        example={
          "Sochiye ek cricket team ka database hai. GROUP BY se aap sirf team average nikal sakte ho. " +
          "Window Function se aap har player ka score AUR team average ek saath dekh sakte ho. " +
          "Subquery se aap keh sakte ho 'woh players dikhao jinka score team average se zyada hai.' " +
          "CTE se aap yeh complex logic ko teen simple named steps mein likh sakte ho."
        }
        terms={[
          { hindi: 'विंडो फ़ंक्शन', english: 'Window Function', meaning: 'OVER() ke saath kaam karne wala function — rows collapse nahi hote' },
          { hindi: 'उप-प्रश्न', english: 'Subquery', meaning: 'Ek query ke andar doosri query — pehle inner chalti hai' },
          { hindi: 'सामान्य तालिका अभिव्यक्ति', english: 'CTE (Common Table Expression)', meaning: 'WITH clause se banaye gaye named temporary result' },
          { hindi: 'रैंक / क्रम', english: 'RANK / DENSE_RANK', meaning: 'Rows ko order ke hisaab se number dena' },
          { hindi: 'चालू कुल', english: 'Running Total', meaning: 'Cumulative sum — badhta jaata hai har row ke saath' },
          { hindi: 'विभाजन', english: 'PARTITION BY', meaning: 'Window ko groups mein todna' },
          { hindi: 'पूर्व पंक्ति', english: 'LAG()', meaning: 'Pichli row ka value lana — month-over-month ke liye' },
        ]}
      />

      {/* Quick reference card */}
      <div style={{
        marginTop: 28, padding: 24,
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 18, border: '1px solid #334155',
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' }}>
          Quick Reference — Advanced SQL
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { fn: 'ROW_NUMBER() OVER (...)', use: 'Unique sequential number, no ties', color: C.blue },
            { fn: 'RANK() OVER (...)', use: 'Same rank for ties, skips next rank', color: C.purple },
            { fn: 'DENSE_RANK() OVER (...)', use: 'Same rank for ties, no skips', color: C.teal },
            { fn: 'SUM(x) OVER (ORDER BY ...)', use: 'Running/cumulative total', color: C.green },
            { fn: 'AVG(x) OVER (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)', use: '3-row moving average', color: C.orange },
            { fn: 'LAG(x, 1) OVER (...)', use: 'Previous row\'s value', color: C.pink },
            { fn: 'PARTITION BY col', use: 'Reset window per group (dept, user, etc.)', color: C.yellow },
            { fn: 'WITH cte AS (...)', use: 'Named temporary result — readable subquery', color: C.indigo },
          ].map(({ fn, use, color }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}
            >
              <code style={{
                background: `${color}22`, color,
                padding: '3px 10px', borderRadius: 7,
                fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}>
                {fn}
              </code>
              <span style={{ color: '#cbd5e1', fontSize: 13 }}>{use}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic25Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px' }}>
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderRadius: 24,
          padding: '40px 40px 32px',
          marginBottom: 36,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #334155',
        }}
      >
        {/* Decorative circles */}
        {[C.blue, C.purple, C.teal].map((c, i) => (
          <motion.div key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: 200 + i * 60,
              height: 200 + i * 60,
              borderRadius: '50%',
              border: `1px solid ${c}22`,
              top: -60 - i * 20,
              right: -60 - i * 20,
            }}
          />
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#1e40af22', border: '1px solid #3b82f633',
            borderRadius: 30, padding: '4px 14px', marginBottom: 16,
          }}>
            <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 13 }}>Topic 25 · SQL</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 36,
            fontWeight: 900,
            color: '#f1f5f9',
            margin: '0 0 12px 0',
            lineHeight: 1.2,
          }}>
            SQL Window Functions<br />
            <span style={{ color: '#60a5fa' }}>& Subqueries</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 16, margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
            RANK, ROW_NUMBER, running totals, CTEs — the advanced SQL that separates good developers from great ones in every interview.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Window Functions', icon: '🔢', color: C.blue },
              { label: 'Subqueries',       icon: '🔮', color: C.purple },
              { label: 'CTEs',             icon: '🧱', color: C.teal },
              { label: 'Interview Ready',  icon: '🎯', color: C.green },
            ].map(({ label, icon, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: `${color}18`, border: `1px solid ${color}44`,
                borderRadius: 20, padding: '5px 14px',
                fontSize: 13, fontWeight: 700, color,
              }}>
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <GroupByProblem />
      <WindowFunctionsVisualizer />
      <RunningTotals />
      <SubqueriesSection />
      <CTESection />
      <InterviewChallenge />
      <HindiSummary />
    </div>
  )
}
