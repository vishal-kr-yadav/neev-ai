import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 23 — SQL Foundations
   Ask questions to your database: SELECT, WHERE, ORDER BY
================================================================ */

/* ---- SAMPLE DATA ---- */
const EMPLOYEES = [
  { id: 1,  name: 'Rahul Sharma',   city: 'Mumbai',    salary: 72000, department: 'Engineering' },
  { id: 2,  name: 'Priya Verma',    city: 'Delhi',     salary: 58000, department: 'Marketing'   },
  { id: 3,  name: 'Amit Patel',     city: 'Ahmedabad', salary: 43000, department: 'Sales'       },
  { id: 4,  name: 'Sneha Rao',      city: 'Bangalore', salary: 85000, department: 'Engineering' },
  { id: 5,  name: 'Vikram Singh',   city: 'Mumbai',    salary: 61000, department: 'HR'          },
  { id: 6,  name: 'Ananya Gupta',   city: 'Delhi',     salary: 49000, department: 'Sales'       },
  { id: 7,  name: 'Rohan Mehta',    city: 'Pune',      salary: 77000, department: 'Engineering' },
  { id: 8,  name: 'Kavita Nair',    city: 'Chennai',   salary: 38000, department: 'HR'          },
  { id: 9,  name: 'Deepak Joshi',   city: 'Mumbai',    salary: 55000, department: 'Marketing'   },
  { id: 10, name: 'Pooja Agarwal',  city: 'Bangalore', salary: 91000, department: 'Engineering' },
]

const ALL_COLS = ['id', 'name', 'city', 'salary', 'department']

const COL_COLORS = {
  id:         '#6366f1',
  name:       '#0ea5e9',
  city:       '#10b981',
  salary:     '#f59e0b',
  department: '#ec4899',
}

/* ---- Shared mini table renderer ---- */
function MiniTable({ rows, cols, highlightRow = null, highlightCol = null, sortCol = null, compact = false }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: compact ? 13 : 14 }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c} style={{
                padding: compact ? '8px 10px' : '11px 14px',
                background: highlightCol === c
                  ? `${COL_COLORS[c]}22`
                  : sortCol === c
                    ? '#fef3c7'
                    : 'linear-gradient(135deg,#f8faff,#eef2ff)',
                border: `1px solid ${highlightCol === c ? COL_COLORS[c] + '55' : '#e2e8f0'}`,
                color: highlightCol === c ? COL_COLORS[c] : '#374151',
                fontWeight: 700,
                textAlign: 'left',
                borderRadius: 0,
                whiteSpace: 'nowrap',
                transition: 'all 0.3s',
                boxShadow: sortCol === c ? 'inset 0 -3px 0 #f59e0b' : 'none',
              }}>
                {c.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {rows.map((row, i) => (
              <motion.tr
                key={row.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.28, delay: i * 0.03 }}
                style={{
                  background: highlightRow === row.id
                    ? 'linear-gradient(90deg,#dbeafe,#ede9fe)'
                    : i % 2 === 0 ? '#ffffff' : '#f9fafb',
                  outline: highlightRow === row.id ? '2px solid #6366f1' : 'none',
                  outlineOffset: -1,
                }}
              >
                {cols.map(c => (
                  <td key={c} style={{
                    padding: compact ? '7px 10px' : '10px 14px',
                    border: '1px solid #e2e8f0',
                    color: highlightCol === c ? COL_COLORS[c] : '#374151',
                    fontWeight: highlightCol === c ? 600 : 400,
                    background: highlightCol === c ? `${COL_COLORS[c]}09` : 'transparent',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                  }}>
                    {c === 'salary' ? `₹${row[c].toLocaleString('en-IN')}` : row[c]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}

/* ================================================================
   SECTION 1 — What is a Database Table?
================================================================ */
function DatabaseTableSection() {
  const [activeRow, setActiveRow] = useState(null)
  const [activeCol, setActiveCol] = useState(null)

  return (
    <SectionBlock icon="🗄️" title="What is a Database Table?" color="#6366f1">
      <Neuron mood="explaining" message="Imagine an Excel sheet — but for a computer to query instantly. A database TABLE has columns (what kind of data) and rows (each record). Click any row or column to explore!" />

      <div style={{ margin: '28px 0' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', borderRadius: 10, padding: '6px 16px',
            fontSize: 15, fontWeight: 700,
          }}>
            employees
          </div>
          <div style={{ fontSize: 14, color: '#64748b', display: 'flex', alignItems: 'center' }}>
            {activeRow ? `Row ${activeRow} selected — one employee record` :
             activeCol ? `Column "${activeCol}" — the ${activeCol} attribute of every employee` :
             'Click a row or column header to explore the structure'}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead>
              <tr>
                {ALL_COLS.map(c => (
                  <motion.th
                    key={c}
                    onClick={() => setActiveCol(activeCol === c ? null : c)}
                    whileHover={{ scale: 1.03 }}
                    style={{
                      padding: '12px 16px',
                      background: activeCol === c
                        ? `linear-gradient(135deg,${COL_COLORS[c]},${COL_COLORS[c]}cc)`
                        : 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
                      border: `2px solid ${activeCol === c ? COL_COLORS[c] : '#c7d2fe'}`,
                      color: activeCol === c ? '#fff' : '#4338ca',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                    }}
                  >
                    {c.toUpperCase()}
                    {activeCol === c && <span style={{ marginLeft: 6, fontSize: 11 }}>▼</span>}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EMPLOYEES.map((row, i) => (
                <motion.tr
                  key={row.id}
                  onClick={() => setActiveRow(activeRow === row.id ? null : row.id)}
                  whileHover={{ scale: 1.005, x: 2 }}
                  style={{
                    background: activeRow === row.id
                      ? 'linear-gradient(90deg,#dbeafe,#ede9fe)'
                      : i % 2 === 0 ? '#ffffff' : '#f8fafc',
                    outline: activeRow === row.id ? '2px solid #6366f1' : 'none',
                    outlineOffset: -1,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {ALL_COLS.map(c => (
                    <td key={c} style={{
                      padding: '10px 16px',
                      border: `1px solid ${activeCol === c ? COL_COLORS[c] + '44' : '#e2e8f0'}`,
                      color: activeCol === c ? COL_COLORS[c] : activeRow === row.id ? '#3730a3' : '#374151',
                      fontWeight: (activeCol === c || activeRow === row.id) ? 600 : 400,
                      background: activeCol === c ? `${COL_COLORS[c]}12` : 'transparent',
                      transition: 'all 0.25s',
                      whiteSpace: 'nowrap',
                    }}>
                      {c === 'salary' ? `₹${row[c].toLocaleString('en-IN')}` : row[c]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{
            background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 10,
            padding: '10px 16px', fontSize: 13, color: '#5b21b6',
          }}>
            <strong>10 rows</strong> = 10 employee records
          </div>
          <div style={{
            background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: 10,
            padding: '10px 16px', fontSize: 13, color: '#0369a1',
          }}>
            <strong>5 columns</strong> = 5 attributes per employee
          </div>
          {ALL_COLS.map(c => (
            <div key={c} style={{
              background: `${COL_COLORS[c]}15`,
              border: `1px solid ${COL_COLORS[c]}44`,
              borderRadius: 10, padding: '6px 12px',
              fontSize: 12, color: COL_COLORS[c], fontWeight: 700,
            }}>
              {c}
            </div>
          ))}
        </div>
      </div>

      <NeuronTip type="simple">
        A <strong>table</strong> is just organized data — like an Excel sheet with strict rules. Each <strong>column</strong> = one type of attribute. Each <strong>row</strong> = one complete record.
      </NeuronTip>

      <HindiExplainer
        concept="Database Table = तालिका"
        english="Database Table"
        explanation="एक database table एक Excel sheet की तरह होती है। इसमें columns होते हैं (जैसे नाम, शहर, salary) और rows होती हैं (हर row एक employee का पूरा record)। जैसे class की attendance sheet — हर student एक row है, और उसकी जानकारी columns में है।"
        example="School का result card: हर student एक row, और हर subject एक column। Database table भी ऐसी ही होती है!"
        terms={[
          { hindi: 'तालिका', english: 'Table', meaning: 'व्यवस्थित data का संग्रह' },
          { hindi: 'स्तंभ', english: 'Column', meaning: 'एक प्रकार की जानकारी (जैसे नाम)' },
          { hindi: 'पंक्ति', english: 'Row', meaning: 'एक पूरा record (जैसे एक employee)' },
        ]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 2 — SELECT
================================================================ */
function SelectSection() {
  const [selectedCols, setSelectedCols] = useState({ id: true, name: true, salary: true, city: false, department: false })
  const [selectAll, setSelectAll] = useState(false)

  const activeCols = selectAll ? ALL_COLS : ALL_COLS.filter(c => selectedCols[c])
  const sql = selectAll
    ? 'SELECT * FROM employees'
    : `SELECT ${activeCols.length > 0 ? activeCols.join(', ') : '...'} FROM employees`

  const toggleCol = (c) => {
    setSelectAll(false)
    setSelectedCols(prev => ({ ...prev, [c]: !prev[c] }))
  }

  return (
    <SectionBlock icon="📋" title="SELECT — Picking Columns" color="#0ea5e9">
      <Neuron mood="thinking" message="SELECT just means: which columns do you want to see? Think of it like choosing which columns of your Excel sheet to print." />

      <InteractiveDemo title="Column Picker" instruction="Check/uncheck columns to build your SELECT query. Watch the SQL and result update live.">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {ALL_COLS.map(c => (
            <motion.button
              key={c}
              onClick={() => toggleCol(c)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              style={{
                padding: '8px 18px',
                borderRadius: 24,
                border: `2px solid ${selectedCols[c] && !selectAll ? COL_COLORS[c] : '#e2e8f0'}`,
                background: selectedCols[c] && !selectAll
                  ? `linear-gradient(135deg,${COL_COLORS[c]}22,${COL_COLORS[c]}11)`
                  : '#f8fafc',
                color: selectedCols[c] && !selectAll ? COL_COLORS[c] : '#94a3b8',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
                opacity: selectAll ? 0.45 : 1,
              }}
            >
              <span style={{ fontSize: 15 }}>{selectedCols[c] && !selectAll ? '☑' : '☐'}</span>
              {c}
            </motion.button>
          ))}
          <motion.button
            onClick={() => { setSelectAll(v => !v) }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              padding: '8px 18px',
              borderRadius: 24,
              border: `2px solid ${selectAll ? '#6366f1' : '#e2e8f0'}`,
              background: selectAll ? 'linear-gradient(135deg,#6366f122,#6366f111)' : '#f8fafc',
              color: selectAll ? '#6366f1' : '#94a3b8',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 15 }}>{selectAll ? '★' : '☆'}</span>
            SELECT *
          </motion.button>
        </div>

        {/* SQL Preview */}
        <motion.div
          layout
          style={{
            background: '#0f172a', borderRadius: 12, padding: '14px 20px',
            fontFamily: 'monospace', fontSize: 15, marginBottom: 20,
            color: '#e2e8f0', lineHeight: 1.7,
          }}
        >
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>SELECT</span>{' '}
          <span style={{ color: '#34d399' }}>
            {selectAll ? '*' : activeCols.length > 0 ? activeCols.join(', ') : '...'}
          </span>{' '}
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>FROM</span>{' '}
          <span style={{ color: '#fbbf24' }}>employees</span>
          <span style={{ color: '#e2e8f0' }}>;</span>
        </motion.div>

        {/* Result */}
        {activeCols.length > 0 ? (
          <MiniTable rows={EMPLOYEES} cols={activeCols} />
        ) : (
          <div style={{
            textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 15,
            background: '#f8fafc', borderRadius: 12, border: '2px dashed #e2e8f0',
          }}>
            Select at least one column above to see results
          </div>
        )}
      </InteractiveDemo>

      <NeuronTip type="tip">
        <strong>SELECT *</strong> = "give me everything." Useful for exploring, but in production always name your columns — it's faster and clearer.
      </NeuronTip>

      <HindiExplainer
        concept="SELECT = चुनो"
        english="SELECT Statement"
        explanation="SELECT का मतलब है — 'मुझे कौन से columns चाहिए?' जैसे रसोई में जाकर कहें: 'मुझे सिर्फ नमक और चीनी दो' — बाकी सब ignore हो जाता है। SELECT * का मतलब है 'सब कुछ दो।'"
        example="SELECT name, salary FROM employees — यह बोलना है: 'employees table से सिर्फ नाम और salary दिखाओ।'"
        terms={[
          { hindi: 'चुनो', english: 'SELECT', meaning: 'कौन से columns चाहिए' },
          { hindi: 'सब कुछ', english: 'SELECT *', meaning: 'सभी columns दिखाओ' },
          { hindi: 'से', english: 'FROM', meaning: 'किस table से data लेना है' },
        ]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 3 — WHERE
================================================================ */
const WHERE_OPS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE']

function WhereSection() {
  const [col, setCol] = useState('salary')
  const [op, setOp] = useState('>')
  const [val, setVal] = useState('50000')
  const [andOr, setAndOr] = useState('AND')
  const [col2, setCol2] = useState('city')
  const [op2, setOp2] = useState('=')
  const [val2, setVal2] = useState('Mumbai')
  const [useSecond, setUseSecond] = useState(false)

  const testRow = (row) => {
    const testSingle = (r, c, o, v) => {
      const rv = c === 'salary' ? r[c] : String(r[c]).toLowerCase()
      const nv = c === 'salary' ? Number(v) : v.replace(/%/g, '').toLowerCase()
      if (o === 'LIKE') return rv.includes(nv)
      if (o === '=')  return c === 'salary' ? rv === Number(v) : rv === nv
      if (o === '!=') return c === 'salary' ? rv !== Number(v) : rv !== nv
      if (o === '>')  return rv > (c === 'salary' ? Number(v) : v)
      if (o === '<')  return rv < (c === 'salary' ? Number(v) : v)
      if (o === '>=') return rv >= (c === 'salary' ? Number(v) : v)
      if (o === '<=') return rv <= (c === 'salary' ? Number(v) : v)
      return true
    }
    const r1 = testSingle(row, col, op, val)
    if (!useSecond) return r1
    const r2 = testSingle(row, col2, op2, val2)
    return andOr === 'AND' ? r1 && r2 : r1 || r2
  }

  const where1 = `${col} ${op} ${op === 'LIKE' ? `'${val}'` : col === 'salary' ? val : `'${val}'`}`
  const where2 = `${col2} ${op2} ${op2 === 'LIKE' ? `'${val2}'` : col2 === 'salary' ? val2 : `'${val2}'`}`
  const sqlWhere = useSecond ? `${where1} ${andOr} ${where2}` : where1

  const selectStyle = {
    padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0',
    background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    color: '#374151', outline: 'none',
  }

  return (
    <SectionBlock icon="🔍" title="WHERE — Filtering Rows" color="#10b981">
      <Neuron mood="thinking" message="WHERE is your filter. It says: 'Only show me rows where THIS condition is true.' Rows that don't match fade away." />

      <InteractiveDemo title="WHERE Clause Builder" instruction="Build a WHERE condition. Watch matching rows glow green and non-matching rows fade.">
        {/* Condition 1 */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: '#6366f1', fontSize: 14 }}>WHERE</span>
          <select style={selectStyle} value={col} onChange={e => setCol(e.target.value)}>
            {ALL_COLS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={selectStyle} value={op} onChange={e => setOp(e.target.value)}>
            {WHERE_OPS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="value..."
            style={{
              ...selectStyle, width: 140,
              border: '1.5px solid #10b981',
            }}
          />
          <motion.button
            onClick={() => setUseSecond(v => !v)}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: `1.5px solid ${useSecond ? '#6366f1' : '#e2e8f0'}`,
              background: useSecond ? '#eef2ff' : '#f8fafc',
              color: useSecond ? '#6366f1' : '#94a3b8',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            + Add AND/OR
          </motion.button>
        </div>

        {/* Condition 2 */}
        <AnimatePresence>
          {useSecond && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 12 }}
            >
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <select style={{ ...selectStyle, background: '#eef2ff', color: '#6366f1', border: '1.5px solid #6366f1' }}
                  value={andOr} onChange={e => setAndOr(e.target.value)}>
                  <option>AND</option>
                  <option>OR</option>
                </select>
                <select style={selectStyle} value={col2} onChange={e => setCol2(e.target.value)}>
                  {ALL_COLS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select style={selectStyle} value={op2} onChange={e => setOp2(e.target.value)}>
                  {WHERE_OPS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input
                  value={val2}
                  onChange={e => setVal2(e.target.value)}
                  placeholder="value..."
                  style={{ ...selectStyle, width: 140, border: '1.5px solid #10b981' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SQL Preview */}
        <div style={{
          background: '#0f172a', borderRadius: 12, padding: '12px 18px',
          fontFamily: 'monospace', fontSize: 14, marginBottom: 20, color: '#e2e8f0',
        }}>
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>SELECT</span>{' '}
          <span style={{ color: '#34d399' }}>*</span>{' '}
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>FROM</span>{' '}
          <span style={{ color: '#fbbf24' }}>employees</span>{' '}
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>WHERE</span>{' '}
          <span style={{ color: '#f472b6' }}>{sqlWhere}</span>
          <span>;</span>
        </div>

        {/* Filtered Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead>
              <tr>
                {ALL_COLS.map(c => (
                  <th key={c} style={{
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                    border: '1px solid #bbf7d0',
                    color: '#166534', fontWeight: 700, textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}>{c.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EMPLOYEES.map((row, i) => {
                const match = testRow(row)
                return (
                  <motion.tr
                    key={row.id}
                    animate={{ opacity: match ? 1 : 0.22, scale: match ? 1 : 0.99 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: match
                        ? i % 2 === 0 ? '#f0fdf4' : '#dcfce7'
                        : i % 2 === 0 ? '#f8fafc' : '#f1f5f9',
                      outline: match ? '2px solid #22c55e' : 'none',
                      outlineOffset: -1,
                    }}
                  >
                    {ALL_COLS.map(c => (
                      <td key={c} style={{
                        padding: '9px 14px', border: '1px solid #e2e8f0',
                        color: match ? '#166534' : '#94a3b8',
                        whiteSpace: 'nowrap',
                      }}>
                        {c === 'salary' ? `₹${row[c].toLocaleString('en-IN')}` : row[c]}
                      </td>
                    ))}
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 16, fontSize: 13 }}>
          <div style={{ color: '#166534', fontWeight: 700 }}>
            ✓ {EMPLOYEES.filter(testRow).length} rows match
          </div>
          <div style={{ color: '#94a3b8' }}>
            ✗ {EMPLOYEES.filter(r => !testRow(r)).length} rows filtered out
          </div>
        </div>
      </InteractiveDemo>

      <NeuronTip type="tip">
        <strong>LIKE</strong> with <code>%</code> is a wildcard: <code>WHERE name LIKE '%Sharma%'</code> matches any name containing "Sharma". <code>%</code> means "any characters here."
      </NeuronTip>

      <HindiExplainer
        concept="WHERE = शर्त"
        english="WHERE Clause"
        explanation="WHERE एक filter की तरह है। जैसे market से कहें: 'मुझे सिर्फ वो आम दो जो पके हों।' SQL में WHERE से बताते हैं: 'सिर्फ वो rows दिखाओ जहां यह condition सच हो।' बाकी rows hide हो जाती हैं।"
        example="WHERE salary > 50000 — इसका मतलब: 'सिर्फ उन employees को दिखाओ जिनकी salary 50,000 रुपये से ज़्यादा है।'"
        terms={[
          { hindi: 'शर्त', english: 'WHERE', meaning: 'कौन सी rows चाहिए — condition लगाओ' },
          { hindi: 'और', english: 'AND', meaning: 'दोनों conditions एक साथ सच होनी चाहिए' },
          { hindi: 'या', english: 'OR', meaning: 'कोई एक condition सच हो तो भी चलेगा' },
        ]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 4 — ORDER BY
================================================================ */
function OrderBySection() {
  const [sortStates, setSortStates] = useState({})  // col -> 'asc' | 'desc' | null
  const [sortOrder, setSortOrder] = useState([])    // ordered list of cols being sorted

  const cycleSortCol = (c) => {
    setSortStates(prev => {
      const cur = prev[c]
      let next
      if (!cur) next = 'asc'
      else if (cur === 'asc') next = 'desc'
      else next = null
      const upd = { ...prev, [c]: next }
      if (!next) {
        setSortOrder(o => o.filter(x => x !== c))
      } else if (!cur) {
        setSortOrder(o => [...o.filter(x => x !== c), c])
      }
      return upd
    })
  }

  const sortedRows = useMemo(() => {
    let rows = [...EMPLOYEES]
    const activeSorts = sortOrder.filter(c => sortStates[c])
    if (activeSorts.length === 0) return rows
    rows.sort((a, b) => {
      for (const c of activeSorts) {
        const dir = sortStates[c] === 'asc' ? 1 : -1
        if (a[c] < b[c]) return -1 * dir
        if (a[c] > b[c]) return 1 * dir
      }
      return 0
    })
    return rows
  }, [sortStates, sortOrder])

  const activeSorts = sortOrder.filter(c => sortStates[c])
  const orderBySql = activeSorts.length > 0
    ? activeSorts.map(c => `${c} ${sortStates[c].toUpperCase()}`).join(', ')
    : null

  return (
    <SectionBlock icon="↕️" title="ORDER BY — Sorting Results" color="#f59e0b">
      <Neuron mood="happy" message="ORDER BY arranges your results in a specific order. Click any column header to sort! Click again to reverse. Click a third time to unsort." />

      <InteractiveDemo title="Column Sorter" instruction="Click column headers to sort. Multiple columns = multi-level sort. Rows animate to their new positions!">
        <div style={{
          background: '#0f172a', borderRadius: 12, padding: '12px 18px',
          fontFamily: 'monospace', fontSize: 14, marginBottom: 20, color: '#e2e8f0',
          minHeight: 44, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4,
        }}>
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>SELECT</span>{' '}
          <span style={{ color: '#34d399' }}>*</span>{' '}
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>FROM</span>{' '}
          <span style={{ color: '#fbbf24' }}>employees</span>
          {orderBySql && (
            <>
              {' '}<span style={{ color: '#60a5fa', fontWeight: 700 }}>ORDER BY</span>{' '}
              <span style={{ color: '#f472b6' }}>{orderBySql}</span>
            </>
          )}
          <span>;</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead>
              <tr>
                {ALL_COLS.map(c => {
                  const s = sortStates[c]
                  const rank = sortOrder.filter(x => sortStates[x]).indexOf(c)
                  return (
                    <motion.th
                      key={c}
                      onClick={() => cycleSortCol(c)}
                      whileHover={{ scale: 1.03 }}
                      style={{
                        padding: '11px 14px',
                        background: s
                          ? `linear-gradient(135deg,${COL_COLORS[c]},${COL_COLORS[c]}bb)`
                          : 'linear-gradient(135deg,#fef3c7,#fde68a)',
                        border: `2px solid ${s ? COL_COLORS[c] : '#fcd34d'}`,
                        color: s ? '#fff' : '#92400e',
                        fontWeight: 700, textAlign: 'left', cursor: 'pointer',
                        whiteSpace: 'nowrap', userSelect: 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {c.toUpperCase()}
                        {s && (
                          <span style={{ fontSize: 16, lineHeight: 1 }}>{s === 'asc' ? '↑' : '↓'}</span>
                        )}
                        {!s && <span style={{ opacity: 0.4, fontSize: 12 }}>↕</span>}
                        {rank >= 0 && activeSorts.length > 1 && (
                          <span style={{
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: 10, padding: '1px 7px',
                            fontSize: 11, fontWeight: 800,
                          }}>{rank + 1}</span>
                        )}
                      </div>
                    </motion.th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {sortedRows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3, delay: i * 0.025 }}
                    style={{ background: i % 2 === 0 ? '#fffbeb' : '#fef9c3' }}
                  >
                    {ALL_COLS.map(c => (
                      <td key={c} style={{
                        padding: '9px 14px', border: '1px solid #fde68a',
                        color: sortStates[c] ? COL_COLORS[c] : '#374151',
                        fontWeight: sortStates[c] ? 700 : 400,
                        whiteSpace: 'nowrap', transition: 'color 0.2s',
                      }}>
                        {c === 'salary' ? `₹${row[c].toLocaleString('en-IN')}` : row[c]}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: '#92400e', fontWeight: 600 }}>
          {activeSorts.length === 0 && 'Click any column header to sort'}
          {activeSorts.length === 1 && `Sorted by "${activeSorts[0]}" ${sortStates[activeSorts[0]]} — click again to reverse, third click to clear`}
          {activeSorts.length > 1 && `Multi-sort: primary=${activeSorts[0]}, secondary=${activeSorts[1]}`}
        </div>
      </InteractiveDemo>

      <NeuronTip type="example">
        <strong>ORDER BY salary DESC</strong> = highest salary first. <strong>ORDER BY department ASC, salary DESC</strong> = group by department (A→Z), then within each department show highest salary first.
      </NeuronTip>

      <HindiExplainer
        concept="ORDER BY = क्रम लगाओ"
        english="ORDER BY Clause"
        explanation="ORDER BY results को sort करता है। जैसे class में students को height के हिसाब से line में लगाना। ASC = छोटे से बड़े (A to Z, कम से ज़्यादा)। DESC = बड़े से छोटे (Z to A, ज़्यादा से कम)।"
        example="ORDER BY salary DESC — इसका मतलब: 'सबसे ज़्यादा salary वाले employee को पहले दिखाओ।'"
        terms={[
          { hindi: 'क्रम', english: 'ORDER BY', meaning: 'results को किस order में दिखाना है' },
          { hindi: 'आरोही', english: 'ASC', meaning: 'Ascending — छोटे से बड़े (default)' },
          { hindi: 'अवरोही', english: 'DESC', meaning: 'Descending — बड़े से छोटे' },
        ]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 5 — LIMIT & OFFSET
================================================================ */
function LimitOffsetSection() {
  const [page, setPage] = useState(1)
  const pageSize = 3
  const sorted = [...EMPLOYEES].sort((a, b) => b.salary - a.salary)
  const offset = (page - 1) * pageSize
  const visible = sorted.slice(offset, offset + pageSize)
  const totalPages = Math.ceil(EMPLOYEES.length / pageSize)

  const sql = `SELECT * FROM employees\nORDER BY salary DESC\nLIMIT ${pageSize} OFFSET ${offset};`

  return (
    <SectionBlock icon="📄" title="LIMIT & OFFSET — Pagination" color="#8b5cf6">
      <Neuron mood="excited" message="LIMIT says: 'Give me only N results.' OFFSET says: 'Skip the first N results.' Together they power pagination — like Google's page 1, page 2, page 3!" />

      <InteractiveDemo title="Pagination Demo" instruction="Click page buttons to see LIMIT + OFFSET in action. Full table = 10 employees sorted by salary.">
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <motion.button
              key={p}
              onClick={() => setPage(p)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              style={{
                padding: '10px 22px',
                borderRadius: 10,
                border: `2px solid ${page === p ? '#8b5cf6' : '#e9d5ff'}`,
                background: page === p
                  ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)'
                  : 'linear-gradient(135deg,#faf5ff,#f3e8ff)',
                color: page === p ? '#fff' : '#7c3aed',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Page {p}
            </motion.button>
          ))}
        </div>

        <div style={{
          background: '#0f172a', borderRadius: 12, padding: '14px 20px',
          fontFamily: 'monospace', fontSize: 14, marginBottom: 20, color: '#e2e8f0',
          whiteSpace: 'pre',
        }}>
          {sql.split('\n').map((line, i) => {
            const parts = line.split(/(SELECT|FROM|ORDER BY|LIMIT|OFFSET|\*)/g)
            return (
              <div key={i}>
                {parts.map((p, j) => (
                  <span key={j} style={{
                    color: ['SELECT', 'FROM', 'ORDER BY', 'LIMIT', 'OFFSET'].includes(p)
                      ? '#60a5fa'
                      : p === '*' ? '#34d399'
                      : p === 'employees' ? '#fbbf24'
                      : '#e2e8f0',
                    fontWeight: ['SELECT', 'FROM', 'ORDER BY', 'LIMIT', 'OFFSET'].includes(p) ? 700 : 400,
                  }}>{p}</span>
                ))}
              </div>
            )
          })}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ padding: '4px 14px', background: '#f3e8ff', border: '1px solid #d8b4fe', color: '#6b21a8', fontWeight: 700, textAlign: 'center', fontSize: 12 }}
                  colSpan={ALL_COLS.length}>
                  Showing employees {offset + 1}–{Math.min(offset + pageSize, EMPLOYEES.length)} of {EMPLOYEES.length} (sorted by salary desc)
                </th>
              </tr>
              <tr>
                {ALL_COLS.map(c => (
                  <th key={c} style={{
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg,#f3e8ff,#ede9fe)',
                    border: '1px solid #d8b4fe',
                    color: '#6b21a8', fontWeight: 700, textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}>{c.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const inPage = i >= offset && i < offset + pageSize
                return (
                  <motion.tr
                    key={row.id}
                    animate={{ opacity: inPage ? 1 : 0.18 }}
                    transition={{ duration: 0.3 }}
                    style={{ background: inPage ? (i % 2 === 0 ? '#faf5ff' : '#f3e8ff') : '#f8fafc' }}
                  >
                    {ALL_COLS.map(c => (
                      <td key={c} style={{
                        padding: '9px 14px', border: '1px solid #e9d5ff',
                        color: inPage ? '#6b21a8' : '#cbd5e1',
                        whiteSpace: 'nowrap',
                      }}>
                        {c === 'salary' ? `₹${row[c].toLocaleString('en-IN')}` : row[c]}
                      </td>
                    ))}
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: 14, padding: '10px 16px',
          background: '#f3e8ff', borderRadius: 10, fontSize: 13,
          color: '#7c3aed', fontWeight: 600,
          display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          <span>Page {page} of {totalPages}</span>
          <span>LIMIT {pageSize}</span>
          <span>OFFSET {offset}</span>
          <span>Showing records {offset + 1}–{Math.min(offset + pageSize, EMPLOYEES.length)}</span>
        </div>
      </InteractiveDemo>

      <NeuronTip type="example">
        <strong>LIMIT 10 OFFSET 20</strong> = skip the first 20 results, show the next 10. This is how every website builds "Page 3 of 12."
      </NeuronTip>

      <HindiExplainer
        concept="LIMIT & OFFSET = कितने और कहाँ से"
        english="LIMIT and OFFSET"
        explanation="LIMIT कहता है: 'बस इतने ही results दिखाओ।' OFFSET कहता है: 'पहले इतने skip करो, फिर दिखाओ।' जैसे किताब में page 2 देखना — page 1 के बाद वाले results।"
        example="LIMIT 5 OFFSET 5 — पहले 5 records skip करो, अगले 5 दिखाओ। यही है page 2!"
        terms={[
          { hindi: 'सीमा', english: 'LIMIT', meaning: 'ज़्यादा से ज़्यादा इतने results' },
          { hindi: 'छोड़ो', english: 'OFFSET', meaning: 'पहले इतने results को skip करो' },
        ]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 6 — SQL Query Builder Challenge
================================================================ */
const CHALLENGES = [
  {
    id: 1,
    question: 'Show names of employees in Mumbai',
    hint: 'SELECT name ... WHERE city = ?',
    check: (rows) => {
      const mumbai = EMPLOYEES.filter(e => e.city === 'Mumbai').map(e => e.name).sort().join('|')
      const res = rows.map(e => e.name).sort().join('|')
      return res === mumbai
    },
    buildFn: () => EMPLOYEES.filter(e => e.city === 'Mumbai').map(e => ({ name: e.name })),
    solution: "SELECT name FROM employees WHERE city = 'Mumbai'",
    cols: ['name'],
  },
  {
    id: 2,
    question: 'Show top 3 highest paid employees',
    hint: 'SELECT name, salary ... ORDER BY ... LIMIT ?',
    check: (rows) => {
      const top3 = [...EMPLOYEES].sort((a, b) => b.salary - a.salary).slice(0, 3).map(e => e.id).join('|')
      const res = rows.slice(0, 3).map(e => e.id).join('|')
      return res === top3
    },
    buildFn: () => [...EMPLOYEES].sort((a, b) => b.salary - a.salary).slice(0, 3).map(e => ({ name: e.name, salary: e.salary })),
    solution: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3',
    cols: ['name', 'salary'],
  },
  {
    id: 3,
    question: 'Find employees with salary between 40000 and 60000',
    hint: 'WHERE salary >= ? AND salary <= ?',
    check: (rows) => {
      const valid = EMPLOYEES.filter(e => e.salary >= 40000 && e.salary <= 60000).map(e => e.id).sort().join('|')
      const res = rows.map(e => e.id).sort().join('|')
      return res === valid
    },
    buildFn: () => EMPLOYEES.filter(e => e.salary >= 40000 && e.salary <= 60000).map(e => ({ name: e.name, salary: e.salary })),
    solution: 'SELECT * FROM employees WHERE salary >= 40000 AND salary <= 60000',
    cols: ['name', 'salary'],
  },
  {
    id: 4,
    question: 'List unique departments alphabetically',
    hint: 'SELECT DISTINCT department ORDER BY ?',
    check: (rows) => {
      const expected = [...new Set(EMPLOYEES.map(e => e.department))].sort().join('|')
      const res = rows.map(e => e.department).join('|')
      return res === expected
    },
    buildFn: () => [...new Set(EMPLOYEES.map(e => e.department))].sort().map(d => ({ department: d })),
    solution: 'SELECT DISTINCT department FROM employees ORDER BY department ASC',
    cols: ['department'],
  },
  {
    id: 5,
    question: 'Count total number of employees',
    hint: 'SELECT COUNT(*) ...',
    check: (rows) => rows.length === 1 && (rows[0].count === 10 || rows[0]['COUNT(*)'] === 10),
    buildFn: () => [{ 'COUNT(*)': 10 }],
    solution: 'SELECT COUNT(*) FROM employees',
    cols: ['COUNT(*)'],
  },
]

function ChallengeCard({ challenge, idx }) {
  const [revealed, setRevealed] = useState(false)
  const [solved, setSolved] = useState(false)

  const solve = () => {
    setSolved(true)
    setRevealed(true)
  }

  const result = challenge.buildFn()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      style={{
        background: solved ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'var(--bg-card)',
        border: `2px solid ${solved ? '#22c55e' : '#e2e8f0'}`,
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        transition: 'all 0.4s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{
            minWidth: 32, height: 32, borderRadius: 10,
            background: solved ? '#22c55e' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontWeight: 800, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {solved ? '✓' : idx + 1}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 4 }}>
              {challenge.question}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>
              Hint: {challenge.hint}
            </div>
          </div>
        </div>
        {!solved && (
          <motion.button
            onClick={solve}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 18px', borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', border: 'none', fontWeight: 700,
              fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Solve
          </motion.button>
        )}
        {solved && (
          <div style={{
            background: '#22c55e', color: '#fff',
            borderRadius: 10, padding: '8px 16px',
            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ✓ Correct!
          </div>
        )}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: '#0f172a', borderRadius: 10, padding: '12px 18px',
              fontFamily: 'monospace', fontSize: 13, color: '#34d399',
              marginBottom: 12, marginTop: 8,
            }}>
              {challenge.solution.split(/\b(SELECT|FROM|WHERE|ORDER BY|LIMIT|DISTINCT|COUNT|AND|OR|DESC|ASC)\b/g).map((part, i) => (
                <span key={i} style={{
                  color: ['SELECT','FROM','WHERE','ORDER BY','LIMIT','DISTINCT','COUNT','AND','OR','DESC','ASC'].includes(part)
                    ? '#60a5fa' : '#34d399',
                  fontWeight: ['SELECT','FROM','WHERE','ORDER BY','LIMIT','DISTINCT','COUNT','AND','OR','DESC','ASC'].includes(part) ? 700 : 400,
                }}>{part}</span>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
                <thead>
                  <tr>
                    {challenge.cols.map(c => (
                      <th key={c} style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
                        border: '1px solid #86efac', color: '#166534',
                        fontWeight: 700, textAlign: 'left',
                      }}>{c.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#f0fdf4' : '#dcfce7' }}>
                      {challenge.cols.map(c => (
                        <td key={c} style={{ padding: '7px 12px', border: '1px solid #bbf7d0', color: '#166534', whiteSpace: 'nowrap' }}>
                          {c === 'salary' ? `₹${Number(row[c]).toLocaleString('en-IN')}` : String(row[c] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ChallengeSection() {
  return (
    <SectionBlock icon="🏆" title="SQL Query Builder Challenge" color="#f59e0b">
      <Neuron mood="excited" message="5 challenges! Click 'Solve' to reveal the SQL and see the results. Each one builds a real skill you'll use on the job." />

      <div style={{ marginTop: 24 }}>
        {CHALLENGES.map((ch, i) => (
          <ChallengeCard key={ch.id} challenge={ch} idx={i} />
        ))}
      </div>

      <NeuronTip type="try">
        Try to guess the SQL <strong>before</strong> clicking Solve. Even if you're wrong, the act of guessing builds the mental model faster than just reading.
      </NeuronTip>
    </SectionBlock>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */
function HindiSummarySection() {
  return (
    <SectionBlock icon="🇮🇳" title="SQL — Hindi Summary" color="#ff9933">
      <Neuron mood="waving" message="Let's lock in everything you learned — in Hindi! SQL is just a language to ask questions to your database." />

      <div style={{
        background: 'linear-gradient(135deg,#fff8f0,#fff3e6)',
        border: '2px solid #ff993344',
        borderRadius: 16, padding: 24, marginTop: 20, marginBottom: 24,
      }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: '#e67e22', marginBottom: 16 }}>
          SQL = Database se sawaal poochna
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { kw: 'SELECT', hindi: 'कौन से columns चाहिए?', icon: '📋' },
            { kw: 'FROM', hindi: 'किस table से?', icon: '🗄️' },
            { kw: 'WHERE', hindi: 'कौन सी rows? (शर्त)', icon: '🔍' },
            { kw: 'ORDER BY', hindi: 'किस क्रम में?', icon: '↕️' },
            { kw: 'LIMIT', hindi: 'कितने results?', icon: '✂️' },
            { kw: 'OFFSET', hindi: 'कितने skip करें?', icon: '⏭️' },
          ].map(({ kw, hindi, icon }) => (
            <div key={kw} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 20, width: 28 }}>{icon}</span>
              <span style={{
                background: '#ff993322', color: '#e67e22', fontWeight: 800,
                fontFamily: 'monospace', fontSize: 14, padding: '4px 12px', borderRadius: 8,
                minWidth: 90, textAlign: 'center',
              }}>{kw}</span>
              <span style={{ fontSize: 15, color: '#333', fontWeight: 500 }}>{hindi}</span>
            </div>
          ))}
        </div>
      </div>

      <HindiExplainer
        concept="SQL पूरी तरह समझो"
        english="Complete SQL Summary"
        explanation="SQL (Structured Query Language) एक भाषा है जिससे हम database से data मांगते हैं। जैसे library में जाकर librarian से कहें: 'मुझे Hindi की वो किताबें दो जो 2020 के बाद लिखी गई हों, price के हिसाब से सजाकर, सिर्फ 5 किताबें।' — यही SQL करता है!"
        example="SELECT name, salary FROM employees WHERE city = 'Mumbai' ORDER BY salary DESC LIMIT 3 — Mumbai के top 3 highest-paid employees के नाम और salary दिखाओ।"
        terms={[
          { hindi: 'SELECT = चुनो', english: 'SELECT', meaning: 'कौन से columns चाहिए' },
          { hindi: 'WHERE = शर्त', english: 'WHERE', meaning: 'कौन सी rows — condition लगाओ' },
          { hindi: 'ORDER BY = क्रम', english: 'ORDER BY', meaning: 'किस order में sort करें' },
          { hindi: 'Table = तालिका', english: 'Table', meaning: 'rows और columns में data' },
          { hindi: 'Column = स्तंभ', english: 'Column', meaning: 'एक type की जानकारी' },
          { hindi: 'Row = पंक्ति', english: 'Row', meaning: 'एक पूरा record' },
        ]}
      />
    </SectionBlock>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic23Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg,#0f172a,#1e293b)',
          borderRadius: 24, padding: '40px 44px', marginBottom: 36,
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 240, height: 240,
          background: 'radial-gradient(circle,#6366f133,transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#6366f122', border: '1px solid #6366f144',
            borderRadius: 20, padding: '6px 16px',
            fontSize: 13, fontWeight: 700, color: '#a5b4fc',
            marginBottom: 18, letterSpacing: 0.5,
          }}>
            TOPIC 23
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 38,
            fontWeight: 900, color: '#f8fafc', margin: 0, lineHeight: 1.2,
            marginBottom: 14,
          }}>
            SQL Foundations
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
            Ask questions to your database. SELECT what you want, WHERE to filter, ORDER BY to sort. Build real queries — visually.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
            {[
              { label: 'SELECT', color: '#0ea5e9' },
              { label: 'WHERE', color: '#10b981' },
              { label: 'ORDER BY', color: '#f59e0b' },
              { label: 'LIMIT', color: '#8b5cf6' },
              { label: '10 Challenges', color: '#ec4899' },
            ].map(({ label, color }) => (
              <div key={label} style={{
                background: `${color}22`, border: `1px solid ${color}44`,
                borderRadius: 20, padding: '5px 14px',
                fontSize: 13, fontWeight: 700, color,
              }}>{label}</div>
            ))}
          </div>
        </div>
      </motion.div>

      <DatabaseTableSection />
      <SelectSection />
      <WhereSection />
      <OrderBySection />
      <LimitOffsetSection />
      <ChallengeSection />
      <HindiSummarySection />
    </div>
  )
}
