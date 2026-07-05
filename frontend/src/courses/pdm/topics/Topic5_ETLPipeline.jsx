import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 5 — ETL Pipeline Design
   Extract, Transform, Load for Predictive Maintenance data.
================================================================ */

/* ---- Section 1: The Data Chaos Problem ---- */
function DataChaos() {
  const [selectedSource, setSelectedSource] = useState(null)

  const sources = [
    {
      id: 'csv',
      icon: '📄',
      label: 'Sensor CSV',
      meta: '10,000 rows',
      color: '#ef4444',
      problem: 'Date format: DD/MM/YYYY',
      sample: [
        { col: 'equipment_id', val: 'PMP-001' },
        { col: 'date', val: '15/03/2024' },
        { col: 'temp_c', val: '87.3' },
        { col: 'vib_mm', val: '2.14' },
      ],
      issues: ['DD/MM/YYYY date format', 'Encoding: UTF-8 with BOM', 'Missing headers on row 3', '~200 null values in vib_mm'],
    },
    {
      id: 'excel',
      icon: '📊',
      label: 'Work Orders Excel',
      meta: '500 rows',
      color: '#f59e0b',
      problem: 'Date format: "March 15, 2024"',
      sample: [
        { col: 'WO_Number', val: 'WO-4821' },
        { col: 'Date', val: 'March 15, 2024' },
        { col: 'Asset', val: 'Pump A' },
        { col: 'Description', val: 'bearing replaced - loud noise' },
      ],
      issues: ['"March 15, 2024" date format', 'Free-text descriptions', 'Asset names inconsistent (Pump A / PUMP-A / pump_a)', 'Mixed currencies in cost column'],
    },
    {
      id: 'db',
      icon: '🗄️',
      label: 'Asset Registry DB',
      meta: '200 records',
      color: '#3b82f6',
      problem: 'Date format: YYYY-MM-DD',
      sample: [
        { col: 'asset_id', val: 'ASSET-001' },
        { col: 'install_date', val: '2019-08-22' },
        { col: 'rated_power_kw', val: '75' },
        { col: 'location', val: 'Block-C / Floor-2' },
      ],
      issues: ['asset_id ≠ equipment_id (different naming)', 'Location format inconsistent', 'rated_power_kw stored as VARCHAR', 'NULL expected_life_years for 18 assets'],
    },
    {
      id: 'pdf',
      icon: '📋',
      label: 'Maintenance Logs PDF',
      meta: 'Unstructured',
      color: '#8b5cf6',
      problem: 'No standard structure',
      sample: [
        { col: 'raw_text', val: 'Pump PMP-001 serviced on 15-Mar-24.' },
        { col: 'raw_text', val: 'Oil changed. Bearing: OK.' },
        { col: 'raw_text', val: 'Next service: June 2024.' },
        { col: 'raw_text', val: 'Signed: R. Sharma, Tech.' },
      ],
      issues: ['No columns — pure paragraphs', 'Dates in 15-Mar-24 format', 'Asset names are abbreviations', 'Must parse with regex or NLP'],
    },
    {
      id: 'api',
      icon: '🌐',
      label: 'Production Schedule API',
      meta: 'JSON format',
      color: '#10b981',
      problem: 'Date format: ISO 8601 (UTC)',
      sample: [
        { col: 'schedule_id', val: 'SCH-20240315' },
        { col: 'timestamp', val: '2024-03-15T06:30:00Z' },
        { col: 'machine_ref', val: 'M_PMP_001' },
        { col: 'load_pct', val: '92' },
      ],
      issues: ['Timestamps in UTC (IST is +5:30)', 'machine_ref ≠ equipment_id again', 'load_pct missing for weekends', 'API rate-limit: 100 req/min'],
    },
  ]

  const src = sources.find(s => s.id === selectedSource)

  return (
    <div>
      <Neuron
        mood="thinking"
        message="Before building any ML model, look at WHERE your data lives. Five different systems, five different formats, five different headaches. Click each source to see the mess."
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '24px 0' }}>
        {sources.map(s => (
          <motion.div
            key={s.id}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedSource(selectedSource === s.id ? null : s.id)}
            style={{
              flex: '1 1 140px',
              background: selectedSource === s.id ? `${s.color}18` : 'var(--bg-card)',
              border: `2px solid ${selectedSource === s.id ? s.color : 'var(--border)'}`,
              borderRadius: 14,
              padding: '16px 14px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'border-color 0.2s',
              position: 'relative',
            }}
          >
            {/* messy scatter decoration */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 + Math.random() * 2 }}
              style={{ fontSize: 32, marginBottom: 8 }}
            >
              {s.icon}
            </motion.div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.meta}</div>
            <div style={{
              marginTop: 8,
              fontSize: 10, fontWeight: 600,
              color: s.color,
              background: `${s.color}15`,
              borderRadius: 6,
              padding: '3px 6px',
            }}>
              {s.problem}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {src && (
          <motion.div
            key={src.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--bg-card)',
              border: `2px solid ${src.color}`,
              borderRadius: 16,
              padding: 24,
              marginTop: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>{src.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: src.color, fontSize: 16 }}>{src.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Sample data (first 4 rows/fields)</div>
                </div>
              </div>

              {/* Sample table */}
              <div style={{
                fontFamily: 'monospace', fontSize: 13,
                background: '#1a1a2e', borderRadius: 10,
                padding: 16, marginBottom: 16, overflowX: 'auto',
              }}>
                <div style={{ color: '#64748b', marginBottom: 8, fontSize: 11 }}>
                  {src.id === 'pdf' ? '--- raw extracted text ---' : '--- raw data sample ---'}
                </div>
                {src.sample.map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                    <span style={{ color: '#94a3b8', minWidth: 160 }}>{row.col}</span>
                    <span style={{ color: '#fbbf24' }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Issues */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>
                Problems in this source:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {src.issues.map((issue, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      fontSize: 13, color: 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ color: '#ef4444', marginTop: 1 }}>✗</span>
                    {issue}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedSource && (
        <NeuronTip type="info">
          Notice how every source has a different date format: DD/MM/YYYY, "March 15, 2024", YYYY-MM-DD, 15-Mar-24, and ISO 8601. Before joining these tables, every date must be converted to one standard format — otherwise your time-series analysis will break completely.
        </NeuronTip>
      )}
    </div>
  )
}

/* ---- Section 2: Extract — Drag Sources into Pipeline ---- */
function ExtractPipeline() {
  const [connected, setConnected] = useState([])
  const [ran, setRan] = useState(false)
  const [flowing, setFlowing] = useState(false)

  const sources = [
    {
      id: 'csv',
      icon: '📄',
      label: 'Sensor CSV',
      color: '#ef4444',
      code: `import pandas as pd

df_sensors = pd.read_csv(
    'sensor_data.csv',
    encoding='utf-8-sig',   # handles BOM
    parse_dates=['date'],
    dayfirst=True           # DD/MM/YYYY
)
print(df_sensors.shape)
# (10000, 8)`,
    },
    {
      id: 'excel',
      icon: '📊',
      label: 'Work Orders',
      color: '#f59e0b',
      code: `import pandas as pd

df_wo = pd.read_excel(
    'work_orders.xlsx',
    sheet_name='WO_Data',
    parse_dates=['Date'],
    date_format='%B %d, %Y'
)
print(df_wo.shape)
# (500, 12)`,
    },
    {
      id: 'db',
      icon: '🗄️',
      label: 'Asset Registry',
      color: '#3b82f6',
      code: `import sqlalchemy as sa

engine = sa.create_engine(
    'postgresql://user:pw@host/db'
)
query = """
  SELECT asset_id, install_date,
         rated_power_kw, location
  FROM asset_registry
  WHERE status = 'active'
"""
df_assets = pd.read_sql(query, engine)
print(df_assets.shape)
# (200, 6)`,
    },
    {
      id: 'api',
      icon: '🌐',
      label: 'Production API',
      color: '#10b981',
      code: `import requests, pandas as pd

resp = requests.get(
    'https://prod-api.factory.in/schedule',
    headers={'X-API-Key': API_KEY},
    params={'from': '2024-01-01',
            'to': '2024-03-31'}
)
data = resp.json()['schedules']
df_prod = pd.json_normalize(data)
print(df_prod.shape)
# (4320, 7)`,
    },
    {
      id: 'pdf',
      icon: '📋',
      label: 'Maintenance PDFs',
      color: '#8b5cf6',
      code: `from pdfplumber import open as pdf_open
import re, pandas as pd

records = []
for path in pdf_paths:
    with pdf_open(path) as pdf:
        text = '\\n'.join(
            p.extract_text() or ''
            for p in pdf.pages
        )
    # regex to pull dates & asset refs
    records += parse_log(text)
df_logs = pd.DataFrame(records)
print(df_logs.shape)
# (320, 5)`,
    },
  ]

  const handleConnect = (id) => {
    if (!connected.includes(id)) {
      setConnected(prev => [...prev, id])
      setRan(false)
    }
  }

  const handleRunExtract = () => {
    setFlowing(true)
    setTimeout(() => {
      setFlowing(false)
      setRan(true)
    }, 2000)
  }

  const allConnected = connected.length === sources.length
  const [activeCode, setActiveCode] = useState(null)

  return (
    <div>
      <Neuron mood="explaining" message="Drag each data source into the Extract Pipeline. Click a connected source to see the actual Python code used to extract it." />

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 24 }}>
        {/* Sources */}
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Data Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sources.map(s => {
              const isConnected = connected.includes(s.id)
              return (
                <motion.div
                  key={s.id}
                  whileHover={!isConnected ? { scale: 1.03 } : {}}
                  whileTap={!isConnected ? { scale: 0.97 } : {}}
                  onClick={() => {
                    if (!isConnected) handleConnect(s.id)
                    else setActiveCode(activeCode === s.id ? null : s.id)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: isConnected ? `${s.color}18` : 'var(--bg-card)',
                    border: `2px solid ${isConnected ? s.color : 'var(--border)'}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    opacity: isConnected ? 0.85 : 1,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{s.label}</span>
                  {isConnected
                    ? <span style={{ fontSize: 13, color: s.color, fontWeight: 700 }}>✓ Connected</span>
                    : <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Click to connect →</span>
                  }
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Pipeline */}
        <div style={{ flex: '2 1 320px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Extract Pipeline
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '2px dashed var(--border)',
            borderRadius: 14,
            padding: 20,
            minHeight: 220,
          }}>
            {connected.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, padding: 40 }}>
                Click data sources on the left to connect them
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {connected.map((id, idx) => {
                  const s = sources.find(x => x.id === id)
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: `${s.color}12`,
                        border: `1.5px solid ${s.color}50`,
                        borderRadius: 8,
                        padding: '8px 12px',
                      }}
                    >
                      <span>{s.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: s.color, flex: 1 }}>{s.label}</span>
                      {flowing && (
                        <motion.div
                          animate={{ x: [0, 30, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6 }}
                          style={{ fontSize: 16 }}
                        >
                          →
                        </motion.div>
                      )}
                      {ran && <span style={{ fontSize: 13, color: '#10b981' }}>✓ DataFrame ready</span>}
                    </motion.div>
                  )
                })}
              </div>
            )}

            {allConnected && !ran && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleRunExtract}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: '12px 0',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {flowing ? 'Extracting data...' : 'Run Extract'}
              </motion.button>
            )}

            {ran && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 16,
                  background: '#10b98115',
                  border: '1.5px solid #10b981',
                  borderRadius: 10,
                  padding: '14px 16px',
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 10 }}>Raw DataFrames extracted:</div>
                {[
                  { name: 'df_sensors', shape: '(10000, 8)', color: '#ef4444' },
                  { name: 'df_wo', shape: '(500, 12)', color: '#f59e0b' },
                  { name: 'df_assets', shape: '(200, 6)', color: '#3b82f6' },
                  { name: 'df_prod', shape: '(4320, 7)', color: '#10b981' },
                  { name: 'df_logs', shape: '(320, 5)', color: '#8b5cf6' },
                ].map(df => (
                  <div key={df.name} style={{ display: 'flex', gap: 12, marginBottom: 4, fontFamily: 'monospace', fontSize: 12 }}>
                    <span style={{ color: df.color, minWidth: 100 }}>{df.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{df.shape}</span>
                    <span style={{ color: '#64748b' }}>— raw, unclean</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Code panel */}
      <AnimatePresence>
        {activeCode && (
          <motion.div
            key={activeCode}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: 16 }}
          >
            {(() => {
              const s = sources.find(x => x.id === activeCode)
              return (
                <div style={{
                  background: '#1a1a2e',
                  border: `2px solid ${s.color}`,
                  borderRadius: 14,
                  padding: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span>{s.icon}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.label} — Extraction Code</span>
                  </div>
                  <pre style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>{s.code}</pre>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 3: Transform — Toggle Transform Blocks ---- */
function TransformPipeline() {
  const [active, setActive] = useState({})
  const [view, setView] = useState(null)

  const transforms = [
    {
      id: 'dates',
      icon: '📅',
      label: 'Date Standardization',
      color: '#ef4444',
      before: [
        { col: 'date (sensors)', val: '15/03/2024' },
        { col: 'Date (work orders)', val: 'March 15, 2024' },
        { col: 'install_date (assets)', val: '2019-08-22' },
        { col: 'timestamp (API)', val: '2024-03-15T06:30:00Z' },
      ],
      after: [
        { col: 'date (sensors)', val: '2024-03-15' },
        { col: 'date (work orders)', val: '2024-03-15' },
        { col: 'install_date (assets)', val: '2019-08-22' },
        { col: 'timestamp (API)', val: '2024-03-15' },
      ],
      code: `# Standardize all dates to ISO YYYY-MM-DD
df_sensors['date'] = pd.to_datetime(
    df_sensors['date'], dayfirst=True
).dt.date

df_wo['Date'] = pd.to_datetime(
    df_wo['Date'], format='%B %d, %Y'
).dt.date

# API timestamps: convert UTC → IST, then extract date
df_prod['timestamp'] = (
    pd.to_datetime(df_prod['timestamp'], utc=True)
    .dt.tz_convert('Asia/Kolkata')
    .dt.date
)`,
    },
    {
      id: 'rename',
      icon: '🏷️',
      label: 'Column Renaming',
      color: '#f59e0b',
      before: [
        { col: 'sensors: equipment_id', val: 'PMP-001' },
        { col: 'assets: asset_id', val: 'ASSET-001' },
        { col: 'work_orders: Asset', val: 'Pump A' },
        { col: 'api: machine_ref', val: 'M_PMP_001' },
      ],
      after: [
        { col: 'sensors: equip_id', val: 'PMP-001' },
        { col: 'assets: equip_id', val: 'PMP-001' },
        { col: 'work_orders: equip_id', val: 'PMP-001' },
        { col: 'api: equip_id', val: 'PMP-001' },
      ],
      code: `# Standardize column names across all DataFrames
COLUMN_MAP = {
    'equipment_id': 'equip_id',
    'asset_id': 'equip_id',
    'Asset': 'equip_id',
    'machine_ref': 'equip_id',
    'WO_Number': 'wo_id',
    'Date': 'date',
    'Description': 'wo_description',
}

for df in [df_sensors, df_assets, df_wo, df_prod]:
    df.rename(columns=COLUMN_MAP, inplace=True)

# Also normalize asset ID values themselves
ID_MAPPING = {'Pump A': 'PMP-001', 'M_PMP_001': 'PMP-001'}
df_wo['equip_id'].replace(ID_MAPPING, inplace=True)
df_prod['equip_id'].replace(ID_MAPPING, inplace=True)`,
    },
    {
      id: 'types',
      icon: '🔢',
      label: 'Data Type Conversion',
      color: '#3b82f6',
      before: [
        { col: 'temp_c', val: '"87.3"  (object)' },
        { col: 'vib_mm', val: '"2.14"  (object)' },
        { col: 'rated_power_kw', val: '"75"   (object)' },
        { col: 'date', val: '"2024-03-15" (object)' },
      ],
      after: [
        { col: 'temp_c', val: '87.3   (float64)' },
        { col: 'vib_mm', val: '2.14   (float64)' },
        { col: 'rated_power_kw', val: '75.0   (float64)' },
        { col: 'date', val: 'datetime64[ns]' },
      ],
      code: `# Convert numeric columns stored as strings
numeric_cols = ['temp_c', 'vib_mm', 'pressure_bar',
                'current_a', 'rated_power_kw']
for col in numeric_cols:
    df_sensors[col] = pd.to_numeric(
        df_sensors[col], errors='coerce'
    )

# Convert date columns to proper datetime
date_cols = ['date', 'install_date']
for col in date_cols:
    df_sensors[col] = pd.to_datetime(df_sensors[col])

# Verify dtypes
print(df_sensors.dtypes)`,
    },
    {
      id: 'merge',
      icon: '🔗',
      label: 'Merging Tables',
      color: '#8b5cf6',
      before: [
        { col: 'df_sensors', val: '10,000 rows — readings only' },
        { col: 'df_assets', val: '200 rows — equipment profile' },
        { col: 'JOIN KEY', val: 'equip_id' },
        { col: 'Result', val: '???' },
      ],
      after: [
        { col: 'equip_id', val: 'PMP-001' },
        { col: 'date + temp_c + vib_mm', val: 'from sensors' },
        { col: 'install_date + rated_power_kw', val: 'from assets' },
        { col: 'Result', val: '9,800 rows (inner join)' },
      ],
      code: `# Join sensor readings with asset profiles
# Inner join: only keep readings for known assets
df_merged = df_sensors.merge(
    df_assets[['equip_id', 'install_date',
               'rated_power_kw', 'location']],
    on='equip_id',
    how='inner'   # drops sensors with no asset record
)

# Also bring in work order counts per asset per day
wo_daily = df_wo.groupby(['equip_id', 'date']).size()
            .reset_index(name='wo_count')
df_merged = df_merged.merge(
    wo_daily, on=['equip_id', 'date'], how='left'
)
df_merged['wo_count'].fillna(0, inplace=True)

print(df_merged.shape)  # (9800, 14)`,
    },
    {
      id: 'agg',
      icon: '📊',
      label: 'Aggregation',
      color: '#10b981',
      before: [
        { col: '2024-03-15 06:00', val: 'temp=85.1, vib=2.10' },
        { col: '2024-03-15 06:15', val: 'temp=85.4, vib=2.12' },
        { col: '2024-03-15 06:30', val: 'temp=86.0, vib=2.14' },
        { col: '2024-03-15 06:45', val: 'temp=85.7, vib=2.11' },
      ],
      after: [
        { col: 'date', val: '2024-03-15' },
        { col: 'temp_mean', val: '85.55' },
        { col: 'temp_max', val: '86.0' },
        { col: 'vib_mean', val: '2.12' },
      ],
      code: `# Aggregate 15-min readings → daily summaries
agg_funcs = {
    'temp_c':    ['mean', 'max', 'std'],
    'vib_mm':    ['mean', 'max', 'std'],
    'pressure_bar': ['mean', 'min'],
    'current_a': ['mean', 'max'],
}

df_daily = (
    df_merged
    .groupby(['equip_id', 'date'])
    .agg(agg_funcs)
)

# Flatten multi-level column names
df_daily.columns = [
    '_'.join(c) for c in df_daily.columns
]
df_daily.reset_index(inplace=True)

print(df_daily.shape)  # (2400, 14)`,
    },
    {
      id: 'derived',
      icon: '🧮',
      label: 'Derived Columns',
      color: '#f43f5e',
      before: [
        { col: 'date', val: '2024-03-15' },
        { col: 'install_date', val: '2019-08-22' },
        { col: 'last_repair_date', val: '2024-01-10' },
        { col: 'wo_count (lifetime)', val: '12' },
      ],
      after: [
        { col: 'equipment_age_days', val: '1666' },
        { col: 'days_since_last_repair', val: '65' },
        { col: 'age_pct_useful_life', val: '45.6%' },
        { col: 'avg_days_between_repairs', val: '50.3' },
      ],
      code: `# Derived feature: equipment age in days
df_daily['equipment_age_days'] = (
    pd.to_datetime(df_daily['date']) -
    pd.to_datetime(df_daily['install_date'])
).dt.days

# Days since last repair
df_daily['days_since_last_repair'] = (
    pd.to_datetime(df_daily['date']) -
    pd.to_datetime(df_daily['last_repair_date'])
).dt.days

# Age as % of expected useful life (e.g. 10 years)
df_daily['age_pct_useful_life'] = (
    df_daily['equipment_age_days'] / (10 * 365) * 100
).round(1)

# Average days between repairs
df_daily['avg_days_between_repairs'] = (
    df_daily['equipment_age_days'] /
    (df_daily['wo_count'] + 1)
).round(1)`,
    },
  ]

  const toggle = (id) => {
    setActive(prev => ({ ...prev, [id]: !prev[id] }))
    setView(id)
  }

  const activeTransform = transforms.find(t => t.id === view)

  return (
    <div>
      <Neuron mood="explaining" message="Transform is where the real work happens. Toggle each transform block to see what it does to the raw data. Watch the before → after change in the table below." />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '24px 0' }}>
        {transforms.map(t => (
          <motion.div
            key={t.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px',
              background: active[t.id] ? `${t.color}20` : 'var(--bg-card)',
              border: `2px solid ${active[t.id] ? t.color : 'var(--border)'}`,
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: active[t.id] ? t.color : 'var(--text-primary)' }}>
              {t.label}
            </span>
            <motion.div
              animate={{ background: active[t.id] ? t.color : 'var(--border)' }}
              style={{
                width: 28, height: 16, borderRadius: 8,
                position: 'relative', marginLeft: 4,
                display: 'flex', alignItems: 'center',
                padding: '0 2px',
                flexShrink: 0,
              }}
            >
              <motion.div
                animate={{ x: active[t.id] ? 12 : 0 }}
                style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#fff',
                }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTransform && (
          <motion.div
            key={activeTransform.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16, marginBottom: 16,
            }}
          >
            {/* Before */}
            <div style={{
              background: '#ef444415',
              border: '1.5px solid #ef4444',
              borderRadius: 14,
              padding: 18,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>BEFORE</div>
              {activeTransform.before.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontFamily: 'monospace', fontSize: 12 }}>
                  <span style={{ color: '#94a3b8', minWidth: 160, flexShrink: 0 }}>{row.col}</span>
                  <span style={{ color: '#fbbf24' }}>{row.val}</span>
                </div>
              ))}
            </div>

            {/* After */}
            <div style={{
              background: '#10b98115',
              border: '1.5px solid #10b981',
              borderRadius: 14,
              padding: 18,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>AFTER</div>
              {activeTransform.after.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontFamily: 'monospace', fontSize: 12 }}>
                  <span style={{ color: '#94a3b8', minWidth: 160, flexShrink: 0 }}>{row.col}</span>
                  <span style={{ color: '#6ee7b7' }}>{row.val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code view */}
      <AnimatePresence>
        {activeTransform && (
          <motion.div
            key={activeTransform.id + '_code'}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: '#1a1a2e',
              border: `2px solid ${activeTransform.color}`,
              borderRadius: 14,
              padding: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: activeTransform.color, marginBottom: 12 }}>
                {activeTransform.icon} Python code — {activeTransform.label}
              </div>
              <pre style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#e2e8f0',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>{activeTransform.code}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 4: Load — Storage Options ---- */
function LoadDestination() {
  const [selected, setSelected] = useState(null)

  const options = [
    {
      id: 'files',
      icon: '📁',
      label: 'CSV / Parquet Files',
      tagline: 'Simple, portable, no server required',
      color: '#f59e0b',
      pros: ['Zero infrastructure cost', 'Easy to share and version', 'Works offline', 'Parquet is columnar — very fast reads'],
      cons: ['No SQL queries', 'Not ideal for concurrent writes', 'Manual versioning needed', 'Slow for ad-hoc analytics'],
      useCases: ['Batch ML training pipelines', 'Archiving historical data', 'Data science notebooks'],
      fileSize: { csv: '500 MB', parquet: '120 MB', reason: 'Parquet 4× smaller due to columnar compression' },
      code: `import pandas as pd

# Save as CSV
df_daily.to_csv(
    'data/processed/daily_readings.csv',
    index=False
)

# Save as Parquet (much smaller!)
df_daily.to_parquet(
    'data/processed/daily_readings.parquet',
    engine='pyarrow',
    compression='snappy',
    index=False
)

# Load back
df = pd.read_parquet(
    'data/processed/daily_readings.parquet'
)
print(df.shape)`,
    },
    {
      id: 'postgres',
      icon: '🐘',
      label: 'PostgreSQL Database',
      tagline: 'Queryable, scalable, production-ready',
      color: '#3b82f6',
      pros: ['Full SQL query support', 'ACID transactions', 'Multi-user concurrent access', 'Great for dashboards'],
      cons: ['Requires server setup', 'Operational overhead', 'Schema migrations needed', 'Higher cost at scale'],
      useCases: ['Real-time PdM dashboards', 'Production ML inference', 'Multi-team data access'],
      fileSize: null,
      code: `import sqlalchemy as sa
import pandas as pd

engine = sa.create_engine(
    'postgresql://user:pw@localhost:5432/pdm_db'
)

# Create schema once
CREATE_SQL = """
CREATE TABLE IF NOT EXISTS daily_readings (
    id           SERIAL PRIMARY KEY,
    equip_id     VARCHAR(50) NOT NULL,
    date         DATE NOT NULL,
    temp_mean    FLOAT,
    temp_max     FLOAT,
    vib_mean     FLOAT,
    vib_max      FLOAT,
    age_days     INTEGER,
    days_since_repair INTEGER,
    UNIQUE(equip_id, date)
);
"""
with engine.connect() as conn:
    conn.execute(sa.text(CREATE_SQL))
    conn.commit()

# Load DataFrame → table
df_daily.to_sql(
    'daily_readings', engine,
    if_exists='append', index=False
)`,
    },
    {
      id: 'lake',
      icon: '☁️',
      label: 'Data Lake (S3 / GCS)',
      tagline: 'Massive scale, years of history, unlimited storage',
      color: '#10b981',
      pros: ['Near-infinite storage', 'Extremely cheap per GB', '10+ years of history', 'Works with Spark, Athena, BigQuery'],
      cons: ['Query latency is higher', 'Requires cloud account', 'Data governance complexity', 'Egress costs can surprise you'],
      useCases: ['Long-term sensor archives', 'ML training with 5+ years of data', 'Enterprise data platform'],
      fileSize: null,
      code: `import boto3, pandas as pd
from io import BytesIO

s3 = boto3.client('s3')
BUCKET = 'factory-pdm-data'

def upload_partition(df, date_str):
    """Save by year/month/day partition."""
    y, m, d = date_str.split('-')
    key = f'processed/year={y}/month={m}/day={d}/data.parquet'

    buf = BytesIO()
    df.to_parquet(buf, engine='pyarrow')
    buf.seek(0)

    s3.put_object(
        Bucket=BUCKET,
        Key=key,
        Body=buf.getvalue()
    )
    print(f'Uploaded: s3://{BUCKET}/{key}')

# Bucket structure:
# s3://factory-pdm-data/
# ├── raw/
# │   ├── sensors/YYYY/MM/DD/
# │   └── work_orders/YYYY/
# └── processed/
#     └── year=2024/month=03/day=15/data.parquet`,
    },
  ]

  const opt = options.find(o => o.id === selected)

  return (
    <div>
      <Neuron mood="thinking" message="Clean data needs a home. Choose your storage layer based on your team size, budget, and query needs. Click each option to compare." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, margin: '24px 0' }}>
        {options.map(o => (
          <motion.div
            key={o.id}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(selected === o.id ? null : o.id)}
            style={{
              background: selected === o.id ? `${o.color}15` : 'var(--bg-card)',
              border: `2px solid ${selected === o.id ? o.color : 'var(--border)'}`,
              borderRadius: 16,
              padding: 22,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{o.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{o.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{o.tagline}</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {opt && (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div style={{
              background: 'var(--bg-card)',
              border: `2px solid ${opt.color}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 28 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: opt.color, fontSize: 17 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.tagline}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>Pros</div>
                  {opt.pros.map((p, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', gap: 6 }}>
                      <span style={{ color: '#10b981' }}>+</span>{p}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Cons</div>
                  {opt.cons.map((c, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', gap: 6 }}>
                      <span style={{ color: '#ef4444' }}>−</span>{c}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: opt.color, marginBottom: 8 }}>Best for:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {opt.useCases.map((u, i) => (
                    <span key={i} style={{
                      fontSize: 12, padding: '4px 12px',
                      background: `${opt.color}15`,
                      border: `1px solid ${opt.color}40`,
                      borderRadius: 20,
                      color: opt.color,
                    }}>{u}</span>
                  ))}
                </div>
              </div>

              {opt.fileSize && (
                <div style={{
                  background: '#f59e0b10',
                  border: '1px solid #f59e0b40',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 16,
                  fontSize: 13,
                }}>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>File size comparison: </span>
                  <span style={{ color: '#ef4444' }}>CSV: {opt.fileSize.csv}</span>
                  <span style={{ color: 'var(--text-secondary)' }}> vs </span>
                  <span style={{ color: '#10b981' }}>Parquet: {opt.fileSize.parquet}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>({opt.fileSize.reason})</span>
                </div>
              )}
            </div>

            {/* Code */}
            <div style={{
              background: '#1a1a2e',
              border: `2px solid ${opt.color}`,
              borderRadius: 14,
              padding: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: opt.color, marginBottom: 12 }}>
                {opt.icon} Code — Load to {opt.label}
              </div>
              <pre style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#e2e8f0',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>{opt.code}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 5: Build Your Own Pipeline ---- */
function PipelineBuilder() {
  const [selectedSources, setSelectedSources] = useState([])
  const [selectedTransforms, setSelectedTransforms] = useState([])
  const [destination, setDestination] = useState(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const sourceOptions = [
    { id: 'sensor_csv', label: 'Sensor CSV (15-min)', icon: '📄', records: 10000 },
    { id: 'work_orders', label: 'Work Orders Excel', icon: '📊', records: 500 },
    { id: 'asset_db', label: 'Asset Registry DB', icon: '🗄️', records: 200 },
    { id: 'prod_api', label: 'Production API', icon: '🌐', records: 4320 },
    { id: 'maint_pdf', label: 'Maintenance PDFs', icon: '📋', records: 320 },
  ]

  const transformOptions = [
    { id: 'date_std', label: 'Date Standardization', icon: '📅' },
    { id: 'col_rename', label: 'Column Renaming', icon: '🏷️' },
    { id: 'type_conv', label: 'Type Conversion', icon: '🔢' },
    { id: 'merge', label: 'Table Merge', icon: '🔗' },
    { id: 'dedup', label: 'Deduplication', icon: '🗑️' },
    { id: 'agg', label: 'Daily Aggregation', icon: '📊' },
    { id: 'derived', label: 'Derived Columns', icon: '🧮' },
  ]

  const destOptions = [
    { id: 'parquet', label: 'Parquet Files', icon: '📁' },
    { id: 'postgres', label: 'PostgreSQL', icon: '🐘' },
    { id: 's3', label: 'S3 Data Lake', icon: '☁️' },
  ]

  const toggleSource = (id) => {
    setSelectedSources(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setResult(null)
  }

  const toggleTransform = (id) => {
    setSelectedTransforms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setResult(null)
  }

  const handleRun = () => {
    if (selectedSources.length === 0 || selectedTransforms.length === 0 || !destination) return
    setRunning(true)
    setResult(null)
    setTimeout(() => {
      const startRecords = selectedSources.reduce((sum, id) => {
        const s = sourceOptions.find(x => x.id === id)
        return sum + (s ? s.records : 0)
      }, 0)
      const afterMerge = selectedTransforms.includes('merge')
        ? Math.round(startRecords * 0.82)
        : startRecords
      const afterDedup = selectedTransforms.includes('dedup')
        ? Math.round(afterMerge * 0.96)
        : afterMerge
      const afterAgg = selectedTransforms.includes('agg')
        ? Math.round(afterDedup * 0.24)
        : afterDedup
      const finalCount = afterAgg

      setResult({ startRecords, afterMerge, afterDedup, afterAgg, finalCount })
      setRunning(false)
    }, 2500)
  }

  const canRun = selectedSources.length > 0 && selectedTransforms.length > 0 && destination

  return (
    <div>
      <Neuron mood="excited" message="Now build YOUR own ETL pipeline! Select data sources, pick your transform steps, choose a destination, and run it. Watch the record counts change at each stage." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginTop: 24 }}>
        {/* Step 1: Sources */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Step 1: Select Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sourceOptions.map(s => {
              const on = selectedSources.includes(s.id)
              return (
                <motion.div
                  key={s.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleSource(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px',
                    background: on ? '#6366f115' : 'var(--bg-card)',
                    border: `1.5px solid ${on ? '#6366f1' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: on ? '#6366f1' : 'transparent',
                    border: `2px solid ${on ? '#6366f1' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {on && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.records.toLocaleString()}</span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Step 2: Transforms */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Step 2: Pick Transforms
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transformOptions.map(t => {
              const on = selectedTransforms.includes(t.id)
              return (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleTransform(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px',
                    background: on ? '#8b5cf615' : 'var(--bg-card)',
                    border: `1.5px solid ${on ? '#8b5cf6' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: on ? '#8b5cf6' : 'transparent',
                    border: `2px solid ${on ? '#8b5cf6' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {on && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{t.label}</span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Step 3: Destination */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Step 3: Choose Destination
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {destOptions.map(d => {
              const on = destination === d.id
              return (
                <motion.div
                  key={d.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setDestination(d.id); setResult(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px',
                    background: on ? '#10b98115' : 'var(--bg-card)',
                    border: `1.5px solid ${on ? '#10b981' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: on ? '#10b981' : 'transparent',
                    border: `2px solid ${on ? '#10b981' : 'var(--border)'}`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 20 }}>{d.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{d.label}</span>
                </motion.div>
              )
            })}
          </div>

          <motion.button
            whileHover={canRun ? { scale: 1.04 } : {}}
            whileTap={canRun ? { scale: 0.97 } : {}}
            onClick={handleRun}
            disabled={!canRun || running}
            style={{
              width: '100%',
              padding: '13px 0',
              background: canRun ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-secondary)',
              color: canRun ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: canRun ? 'pointer' : 'not-allowed',
            }}
          >
            {running ? 'Running Pipeline...' : 'Run Pipeline'}
          </motion.button>
        </div>
      </div>

      {/* Running animation */}
      {running && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: 24, textAlign: 'center' }}
        >
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Pipeline executing...</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            {['Extract', 'Transform', 'Load'].map((stage, i) => (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ delay: i * 0.6, repeat: Infinity, duration: 1.8 }}
                  style={{
                    padding: '8px 16px',
                    background: ['#6366f115', '#8b5cf615', '#10b98115'][i],
                    border: `1.5px solid ${['#6366f1', '#8b5cf6', '#10b981'][i]}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: ['#6366f1', '#8b5cf6', '#10b981'][i],
                  }}
                >
                  {stage}
                </motion.div>
                {i < 2 && <motion.span
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ delay: i * 0.6 + 0.3, repeat: Infinity, duration: 1.8 }}
                  style={{ fontSize: 18, color: 'var(--text-secondary)' }}
                >→</motion.span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 24 }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>Pipeline complete! Record counts at each stage:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              {[
                { label: 'Extracted', count: result.startRecords, color: '#6366f1' },
                { label: 'After Merge', count: result.afterMerge, color: '#8b5cf6' },
                { label: 'After Dedup', count: result.afterDedup, color: '#f59e0b' },
                { label: 'After Agg', count: result.afterAgg, color: '#3b82f6' },
                { label: 'Final Load', count: result.finalCount, color: '#10b981' },
              ].map((step, i) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    style={{
                      padding: '10px 16px',
                      background: `${step.color}15`,
                      border: `1.5px solid ${step.color}`,
                      borderRadius: 10,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: step.color }}>
                      {step.count.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{step.label}</div>
                  </motion.div>
                  {i < 4 && <span style={{ color: 'var(--text-secondary)', fontSize: 18 }}>→</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 6: ETL Pitfall Flip Cards ---- */
function PitfallCards() {
  const [flipped, setFlipped] = useState({})
  const [current, setCurrent] = useState(0)

  const pitfalls = [
    {
      icon: '💥',
      title: 'Schema Mismatch',
      problem: 'The vibration sensor firmware updated overnight. It added a new column "vib_rms_hz" and renamed "vib_mm" to "vib_amp_mm". Your pipeline breaks at 3 AM. Alarm emails flood in. Nobody knows why until morning.',
      solution: 'Add schema validation before ingestion:\n\nEXPECTED = {\'equip_id\', \'date\', \'temp_c\', \'vib_mm\'}\nnew_cols = set(df.columns)\nif not EXPECTED.issubset(new_cols):\n    raise SchemaError(f"Missing: {EXPECTED - new_cols}")\n\nAlso: version your schema and alert on changes.',
      problemColor: '#ef4444',
      solutionColor: '#10b981',
    },
    {
      icon: '🕐',
      title: 'Timezone Confusion',
      problem: 'Sensors log in IST. The production schedule API returns UTC. When you join them on timestamp, readings appear 5 hours 30 minutes off. A failure that happened at 11 PM IST looks like 5:30 PM UTC — completely wrong shift.',
      solution: 'Always store in UTC internally, convert only for display:\n\n# Convert sensor timestamps to UTC\ndf[\'ts_utc\'] = pd.to_datetime(\n    df[\'local_ts\']\n).dt.tz_localize(\'Asia/Kolkata\').dt.tz_convert(\'UTC\')\n\n# Rule: one timezone in, one timezone out.',
      problemColor: '#f59e0b',
      solutionColor: '#10b981',
    },
    {
      icon: '⏳',
      title: 'Late-Arriving Data',
      problem: 'Sensor #42 uploads in batches every 24 hours due to poor connectivity. Your pipeline runs at midnight and marks the sensor as "offline all day" — but the data arrives at 2 AM. Now your model sees a false gap.',
      solution: 'Use a watermark-based approach:\n\n# Wait for late data up to 48 hours\nWATERMARK_HOURS = 48\ncutoff = datetime.utcnow() - timedelta(\n    hours=WATERMARK_HOURS\n)\n\n# Only process records older than cutoff\ndf_safe = df[df[\'ts_utc\'] < cutoff]\n\n# Re-run pipeline for new late arrivals daily.',
      problemColor: '#8b5cf6',
      solutionColor: '#10b981',
    },
    {
      icon: '🔁',
      title: 'Duplicate Records',
      problem: 'The sensor gateway retries on network failure. A power blip caused 847 readings to be inserted twice. Your vibration average for that day is exactly correct — but your record count is off, causing downstream aggregations to double-count.',
      solution: 'Deduplicate on natural key before loading:\n\n# Define uniqueness: one reading per sensor per timestamp\ndf_clean = df.drop_duplicates(\n    subset=[\'equip_id\', \'timestamp\'],\n    keep=\'last\'   # keep the latest retry\n)\n\nprint(f"Removed {len(df) - len(df_clean)} duplicates")',
      problemColor: '#3b82f6',
      solutionColor: '#10b981',
    },
    {
      icon: '🏷️',
      title: 'Column Naming Conflicts',
      problem: 'You have "temp" in sensor data (bearing temperature, Celsius) and "temp" in weather data (ambient temperature, Celsius). After joining, pandas renames them "temp_x" and "temp_y". Your model trains on "temp" expecting bearing temperature but gets ambient sometimes.',
      solution: 'Use prefixed, descriptive column names from day 1:\n\n# Before merging, rename explicitly\ndf_sensors.rename(columns={\'temp\': \'bearing_temp_c\'}, inplace=True)\ndf_weather.rename(columns={\'temp\': \'ambient_temp_c\'}, inplace=True)\n\n# Now merge is safe — no ambiguity\ndf_merged = df_sensors.merge(df_weather, on=[\'date\', \'location\'])',
      problemColor: '#f43f5e',
      solutionColor: '#10b981',
    },
    {
      icon: '💾',
      title: 'Memory Overflow',
      problem: 'You have 3 years of sensor data: 10GB CSV. You call pd.read_csv() on a machine with 8GB RAM. Python starts reading, memory fills up, the OS kills the process. The pipeline crashes silently. No data loaded.',
      solution: 'Use chunked reading or Dask for large files:\n\n# Option 1: Process in chunks\nCHUNK = 100_000\nfor chunk in pd.read_csv(\'big_file.csv\', chunksize=CHUNK):\n    process(chunk)\n    chunk.to_parquet(..., append=True)\n\n# Option 2: Use Dask for lazy evaluation\nimport dask.dataframe as dd\ndf = dd.read_csv(\'big_file.csv\')  # no memory used yet!\nresult = df.groupby(\'equip_id\').agg({...}).compute()',
      problemColor: '#64748b',
      solutionColor: '#10b981',
    },
  ]

  const toggleFlip = (i) => {
    setFlipped(prev => ({ ...prev, [i]: !prev[i] }))
  }

  return (
    <div>
      <Neuron mood="thinking" message="Real ETL pipelines break in subtle ways. These 6 pitfalls have caused production outages at major companies. Study each one — click to flip and see the solution." />

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: 16, cursor: current === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: current === 0 ? 0.4 : 1,
          }}
        >←</motion.button>
        <div style={{ flex: 1, display: 'flex', gap: 6, justifyContent: 'center' }}>
          {pitfalls.map((_, i) => (
            <motion.div
              key={i}
              onClick={() => setCurrent(i)}
              whileHover={{ scale: 1.2 }}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? '#6366f1' : 'var(--border)',
                cursor: 'pointer',
                transition: 'width 0.3s, background 0.3s',
              }}
            />
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrent(Math.min(pitfalls.length - 1, current + 1))}
          disabled={current === pitfalls.length - 1}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: 16, cursor: current === pitfalls.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: current === pitfalls.length - 1 ? 0.4 : 1,
          }}
        >→</motion.button>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          style={{ perspective: 1000 }}
        >
          <motion.div
            onClick={() => toggleFlip(current)}
            animate={{ rotateY: flipped[current] ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'relative',
              minHeight: 260,
              cursor: 'pointer',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Problem side */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: `${pitfalls[current].problemColor}10`,
              border: `2px solid ${pitfalls[current].problemColor}`,
              borderRadius: 18,
              padding: 28,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{pitfalls[current].icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: pitfalls[current].problemColor }}>
                    Pitfall: {pitfalls[current].title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Click to flip for solution</div>
                </div>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 12, padding: '4px 10px',
                  background: `${pitfalls[current].problemColor}20`,
                  border: `1px solid ${pitfalls[current].problemColor}50`,
                  borderRadius: 20, color: pitfalls[current].problemColor,
                  fontWeight: 600,
                }}>Problem</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {pitfalls[current].problem}
              </p>
            </div>

            {/* Solution side */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `${pitfalls[current].solutionColor}10`,
              border: `2px solid ${pitfalls[current].solutionColor}`,
              borderRadius: 18,
              padding: 28,
              overflow: 'auto',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: pitfalls[current].solutionColor }}>
                    Solution: {pitfalls[current].title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Click to flip back</div>
                </div>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 12, padding: '4px 10px',
                  background: `${pitfalls[current].solutionColor}20`,
                  border: `1px solid ${pitfalls[current].solutionColor}50`,
                  borderRadius: 20, color: pitfalls[current].solutionColor,
                  fontWeight: 600,
                }}>Solution</span>
              </div>
              <pre style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                background: '#1a1a2e',
                padding: 14,
                borderRadius: 10,
              }}>{pitfalls[current].solution}</pre>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Pitfall {current + 1} of {pitfalls.length} — click card to flip
        </span>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic5Content() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* Intro */}
      <Neuron
        mood="waving"
        size="large"
        message="Welcome to ETL Pipeline Design! In the real world, your data never arrives clean and ready in one place. Sensors, spreadsheets, databases, PDFs, APIs — all talking different languages. ETL is the backbone that pulls it all together."
      />

      {/* Section 1: The Data Chaos Problem */}
      <SectionBlock icon="💥" title="The Data Chaos Problem — Before ETL" color="#ef4444">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          A typical PdM system pulls data from 5+ sources — each with different formats, naming conventions, and date styles. Without ETL, these sources are islands of incompatible data. Click each source to see the mess up close.
        </p>
        <InteractiveDemo
          title="Data Source Explorer"
          instruction="Click each data source card to inspect its format, sample data, and specific problems."
        >
          <DataChaos />
        </InteractiveDemo>
        <NeuronTip type="info">
          The single most common ETL failure point is date format inconsistency. DD/MM/YYYY, MM/DD/YYYY, "March 15", ISO 8601, Unix timestamps — mixing these without explicit conversion silently corrupts your time-series joins.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="डेटा अराजकता — ETL से पहले की गड़बड़ी"
        english="Data Chaos — The Mess Before ETL"
        explanation="एक typical factory में data हर department अलग तरीके से रखता है। Maintenance team Excel में काम करती है — columns के नाम अलग हैं, date format DD/MM/YYYY है। Production team SAP system use करती है — data SQL database में है, timestamps UTC में हैं। Sensor team CSV files export करती है — column names sensor IDs हैं जैसे 'PT_0043'. Quality team PDF reports बनाती है। यह चारों 'islands' हैं — आपस में बात नहीं करते। ML model इन चारों को एक साथ देखना चाहता है, लेकिन पहले इन्हें एक common language में लाना होगा — यही ETL करता है।"
        example="Reliance Jamnagar refinery में एक engineer ML model बनाना चाहता था जो compressor failure predict करे। Sensor data था CSV में — 50 sensors, हर minute एक reading। Work order data था SAP में — maintenance history, part numbers। Weather data था external API से — temperature, humidity। तीनों को join करना था — dates match नहीं करते थे! ETL pipeline बनाने में 3 हफ्ते लगे, ML model बनाने में 2 दिन।"
        terms={[
          { hindi: 'डेटा द्वीप', english: 'Data Island / Data Silo', meaning: 'अलग-अलग departments के isolated databases जो आपस में connected नहीं — ETL इन्हें जोड़ता है' },
          { hindi: 'प्रारूप असंगति', english: 'Format Inconsistency', meaning: 'एक ही चीज़ को अलग तरह से store करना — DD/MM/YYYY vs MM/DD/YYYY, यह silent data corruption है' },
          { hindi: 'डेटा स्रोत', english: 'Data Source', meaning: 'वो जगह जहाँ raw data रहता है — CSV, SQL database, REST API, Excel, PDF' },
        ]}
      />

      {/* Section 2: Extract */}
      <SectionBlock icon="📥" title="Extract — Pulling Data from Every Source" color="#6366f1">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Extract is the "E" in ETL — connecting to each source and pulling raw data into memory. Pandas, SQLAlchemy, requests, and pdfplumber each handle a different source type. Connect all five sources below, then click "Run Extract" to see your raw DataFrames.
        </p>
        <InteractiveDemo
          title="Extract Pipeline Builder"
          instruction="Click each data source to connect it to the pipeline. After all are connected, run the extraction."
        >
          <ExtractPipeline />
        </InteractiveDemo>
        <NeuronTip type="deep">
          In production, extraction is usually scheduled (cron job or Airflow DAG) rather than run manually. The output — raw DataFrames — is never used directly for ML. They always go through Transform first.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="निकालना — हर जगह से डेटा खींचना"
        english="Extract — Pulling Raw Data from Every Source"
        explanation="Extract का मतलब है अलग-अलग जगहों से raw data को Python में memory (DataFrame) में लाना — बिना कुछ बदले। CSV file? pandas.read_csv(). SQL database? SQLAlchemy से query करो। REST API? requests library से JSON fetch करो। PDF report? pdfplumber से text extract करो। यह stage 'just get the data' stage है — इस stage में कोई cleaning नहीं, कोई transformation नहीं। Raw data वैसा ही आता है जैसा source में है — गड़बड़ी सहित। यह सब गड़बड़ी अगले stage में ठीक होगी।"
        example="BHEL Trichy boiler factory में ETL की Extract stage इस तरह काम करती थी: pandas ने sensor CSV folder से 47 files पढ़ीं (42,000 rows), SQLAlchemy ने SAP maintenance database से 1,847 work orders खींचे, requests ने weather API से 365 दिन का JSON data लाया, pdfplumber ने 23 quality inspection PDFs से tables extract कीं। कुल extraction time: 4 minutes 23 seconds। सब raw, uncleaned।"
        terms={[
          { hindi: 'कच्चा डेटा', english: 'Raw Data', meaning: 'Source से directly आया data — बिना cleaning के, जैसा है वैसा — गलतियाँ, inconsistencies सहित' },
          { hindi: 'डेटा फ्रेम', english: 'DataFrame', meaning: 'Python में table का object — pandas का main data structure, rows और columns वाला' },
          { hindi: 'कनेक्टर', english: 'Connector', meaning: 'Data source से connect करने का code — SQLAlchemy, requests, pandas — हर source के लिए अलग' },
        ]}
      />

      {/* Section 3: Transform */}
      <SectionBlock icon="⚙️" title="Transform — The Heavy Lifting" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Transform is where 80% of the ETL work happens. Raw data is standardized, typed, joined, aggregated, and enriched. Toggle each transform block to see exactly what it does — and the before/after effect on the data.
        </p>
        <HindiExplainer
          concept="Transform — डेटा को एक जैसा बनाना"
          english="Transform — Making data uniform"
          explanation="Transform का मतलब है कच्चे डेटा को useful format में बदलना। जैसे: अलग-अलग date formats को एक standard format (YYYY-MM-DD) में बदलना, column names को standardize करना, strings को numbers में convert करना, और tables को join करके एक बड़ी table बनाना।"
          example="मान लो 5 अलग-अलग दुकानों से sales data आया — हर दुकान का अपना format है। Transform वो process है जो सबको एक जैसा बना देता है, ताकि हम उन्हें जोड़ सकें और analysis कर सकें।"
          terms={[
            { hindi: 'मानकीकरण', english: 'Standardization', meaning: 'सभी डेटा को एक ही format में लाना' },
            { hindi: 'जोड़ना', english: 'Merge / Join', meaning: 'दो tables को एक common column पर जोड़ना' },
            { hindi: 'समूहीकरण', english: 'Aggregation', meaning: 'डेटा को group करके summary बनाना (जैसे daily average)' },
          ]}
        />
        <InteractiveDemo
          title="Transform Block Explorer"
          instruction="Toggle each transform block ON to see the before/after table view and the Python code."
        >
          <TransformPipeline />
        </InteractiveDemo>
      </SectionBlock>

      <HindiExplainer
        concept="बदलना — डेटा को ML के लिए तैयार करना"
        english="Transform — Heavy Lifting to Make Data ML-Ready"
        explanation="Transform सबसे मेहनत का stage है — raw data को clean, standard, और joined format में लाना। पाँच main steps: (1) Date standardization — सभी dates को ISO format (YYYY-MM-DD HH:MM:SS) में बदलो। (2) Column renaming — 'PT_0043' को 'pressure_bar' बनाओ। (3) Type casting — string '45.2' को float 45.2 बनाओ। (4) Join — sensor table + work order table + weather table को timestamp पर merge करो। (5) Aggregation — हर 15 minutes की readings को एक row में summarize करो (mean, max, std). एक अच्छी Transform stage के बाद data 'ML-ready' होता है।"
        example="Sona BLW Precision के gearbox sensor data में Transform stage: 'date_recorded' column में 3 अलग formats थे — normalize किए। 'sensor_id' column में spaces थे — strip किए। Integer था जहाँ float होना चाहिए था — cast किया। Sensor table (50K rows) + maintenance table (2K rows) = inner join से 48,750 matched rows। फिर 5-minute aggregation से 9,750 feature rows बनीं। यह data ML model को feed हुआ।"
        terms={[
          { hindi: 'तिथि मानकीकरण', english: 'Date Standardization', meaning: 'सभी date formats को एक ISO format में लाना — time-series join के लिए absolutely ज़रूरी' },
          { hindi: 'प्रकार रूपांतरण', english: 'Type Casting', meaning: 'String को float/int में बदलना — ML models numbers के साथ काम करते हैं, strings के साथ नहीं' },
          { hindi: 'आंतरिक जोड़', english: 'Inner Join', meaning: 'केवल वो rows रखना जो दोनों tables में match करें — unmatched rows drop हो जाते हैं' },
        ]}
      />

      {/* Section 4: Load */}
      <SectionBlock icon="📦" title="Load — Where Clean Data Lives" color="#3b82f6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          After transformation, cleaned data needs a home. The choice of storage layer depends on your team size, query needs, and budget. Each option has real tradeoffs — click to compare.
        </p>
        <InteractiveDemo
          title="Storage Layer Comparison"
          instruction="Click each storage option to see pros, cons, use cases, and the exact code to load your DataFrame."
        >
          <LoadDestination />
        </InteractiveDemo>
        <NeuronTip type="warning">
          For PdM in production, a common pattern is "double load": write Parquet files (cheap, always-available backup) AND load into PostgreSQL (fast dashboard queries). Never rely on a single storage layer.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="लोड करना — साफ डेटा को घर देना"
        english="Load — Storing Clean Data Where ML Can Use It"
        explanation="Transform के बाद clean data को store करना है — लेकिन कहाँ? यह depend करता है use case पर। Parquet files: सबसे fast, सबसे compressed — local analysis के लिए perfect, लेकिन SQL queries नहीं चल सकती। PostgreSQL: relational database — SQL queries, joins, indexes सब possible, team के साथ share करना आसान, dashboards के लिए best। AWS S3 या Google Cloud Storage: unlimited storage, cheap, पूरी team access कर सकती है — cloud ML workflows के लिए ideal। InfluxDB: time-series के लिए specialized database — बहुत fast write/read, PdM production dashboards के लिए best choice।"
        example="NTPC Dadri power plant की ETL pipeline में double load strategy थी: cleaned sensor data Parquet format में local SSD पर save होता था (fast ML training के लिए) और साथ-साथ PostgreSQL में भी load होता था (Grafana dashboard queries के लिए). एक बार PostgreSQL server crash हुआ — Parquet backup से 48 घंटे का data recover हुआ। Single storage होती तो data permanently गया होता।"
        terms={[
          { hindi: 'पार्केट', english: 'Parquet', meaning: 'Column-based compressed file format — ML training के लिए 5-10x faster than CSV, smaller size' },
          { hindi: 'संबंधपरक डेटाबेस', english: 'Relational Database (PostgreSQL)', meaning: 'SQL queries वाला database — dashboards, reports, team sharing के लिए best' },
          { hindi: 'दोहरा लोड', english: 'Double Load', meaning: 'Data को एक साथ दो जगह save करना — एक ML के लिए, एक backup/dashboard के लिए' },
        ]}
      />

      {/* Section 5: Build Your Own Pipeline */}
      <SectionBlock icon="🏗️" title="Build Your Own ETL Pipeline" color="#10b981">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Now you drive. Select the data sources you want to include, pick your transform steps, choose a load destination, and run the pipeline. Watch how the record count changes at each stage as data gets merged, deduplicated, and aggregated.
        </p>
        <InteractiveDemo
          title="Pipeline Builder"
          instruction="Step 1: Check sources. Step 2: Pick transforms. Step 3: Choose destination. Then hit Run Pipeline."
        >
          <PipelineBuilder />
        </InteractiveDemo>
        <NeuronTip type="info">
          Notice how record counts DROP at merge (inner join drops unmatched records) and at aggregation (many rows become one summary row per day). This is expected and correct — you trade row count for data quality.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="पूरी पाइपलाइन — एक नज़र में"
        english="The Full ETL Pipeline — End to End"
        explanation="पूरी ETL pipeline एक assembly line की तरह है। Tata Steel Jamshedpur की imaginary ETL pipeline: Step 1 — Extract: 200 sensors (CSV), SAP work orders (SQL), weather API, lab test results (Excel) — सब Python में load होते हैं। Step 2 — Transform: dates standardize, columns rename, type cast, 4 tables merge, 10-minute aggregation। Step 3 — Load: Parquet file save (ML training), PostgreSQL insert (dashboard), S3 upload (backup)। यह pipeline Airflow DAG में है — हर रात 2 बजे automatically चलती है। अगर fail हो — email alert आता है। यही production ETL है।"
        example="Maruti Suzuki Manesar में अपना ETL pipeline manually build करके देखा। 3 sources connect किए: vibration CSV (8,640 rows/day), maintenance SQL (230 records), shift schedule Excel (30 rows)। Transform में: date mismatch fix की, 'asset_id' format standardize किया, 15-minute rolling aggregate बनाई। Load: Parquet में save। Input: 3 messy files. Output: 1 clean ML-ready DataFrame (576 rows, 24 features). Pipeline runtime: 47 seconds।"
        terms={[
          { hindi: 'DAG', english: 'Directed Acyclic Graph', meaning: 'Pipeline के steps का sequence diagram — Apache Airflow में इसी से pipeline schedule होती है' },
          { hindi: 'रनटाइम', english: 'Pipeline Runtime', meaning: 'ETL pipeline को complete होने में लगने वाला समय — optimize करना ज़रूरी है production में' },
          { hindi: 'ऑर्केस्ट्रेशन', english: 'Orchestration', meaning: 'Pipeline को automatically schedule, monitor, और retry करना — Airflow, Prefect, Dagster tools' },
        ]}
      />

      {/* Section 6: ETL Pitfalls */}
      <SectionBlock icon="⚠️" title="ETL Best Practices and Pitfalls" color="#f59e0b">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Every production ETL pipeline has been burned by at least one of these six pitfalls. Study them before you deploy yours — forewarned is forearmed. Click each card to flip and reveal the solution.
        </p>
        <InteractiveDemo
          title="Pitfall Flip Cards"
          instruction="Use the arrows to navigate between pitfalls. Click the card to flip from Problem (red) to Solution (green)."
        >
          <PitfallCards />
        </InteractiveDemo>
      </SectionBlock>

      <HindiExplainer
        concept="ETL की सबसे बड़ी गलतियाँ"
        english="ETL Best Practices and Common Pitfalls"
        explanation="Production ETL pipeline में ये 6 गलतियाँ सबसे ज़्यादा होती हैं। Timezone confusion: sensor data IST में, weather data UTC में — join करो तो 5.5 घंटे का offset, data corrupt। Silent duplicates: same work order दो sources से आया — aggregation में double count, model के features गलत। Schema drift: database का एक column rename हो गया — pipeline crash, कोई alert नहीं। Memory leak: 10 लाख rows एक बार में load — RAM खत्म, pipeline down। Missing idempotency: pipeline दो बार चली — data double हो गया database में। No logging: कहाँ fail हुआ पता नहीं — debugging nightmare। इन छहों के solutions पहले से plan करो।"
        example="ONGC Mehsana में एक data engineer ने ETL pipeline बनाई। Deploy किया — 2 हफ्ते perfect चली। फिर एक रात pipeline fail हुई। Error message: 'Column 'asset_id' not found'. पता चला: database admin ने column rename करके 'equipment_id' कर दिया था। Schema drift का यह classic case था। Solution: pipeline शुरू होने पर schema validation check — mismatch तो immediate alert। अगले 6 महीने में एक भी silent failure नहीं।"
        terms={[
          { hindi: 'टाइमज़ोन भ्रम', english: 'Timezone Confusion', meaning: 'अलग sources में अलग timezone — join करने पर time offset की वजह से data corrupt हो जाता है' },
          { hindi: 'स्कीमा बदलाव', english: 'Schema Drift', meaning: 'Source database का structure change होना (column rename/delete) — pipeline silently fail या data corrupt' },
          { hindi: 'पुनरावर्तनीयता', english: 'Idempotency', meaning: 'Pipeline को N बार चलाओ — result same रहे, data duplicate न हो — production की ज़रूरत' },
        ]}
      />

      {/* Section 7: Hindi Summary */}
      <SectionBlock icon="हिं" title="ETL — Hindi Mein Samjho" color="#ff9933">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          ETL pipeline har data science project ki neenv hai — bina iske ML models sirf theory hain. Is topic ke key concepts Hindi mein samjho:
        </p>
        <HindiExplainer
          concept="ETL — निकालना, बदलना, लोड करना"
          english="ETL — Extract, Transform, Load"
          explanation="ETL ek pipeline है जो अलग-अलग जगहों से डेटा लेती है (Extract), उसे एक standard format में बदलती है (Transform), और फिर ML system में store करती है (Load). बिना ETL के, sensor data, Excel sheets, और databases सब अलग-अलग 'बोलियों' में बात करते हैं — ML model इन्हें समझ नहीं सकता।"
          example="एक factory में: Sensor CSV में dates DD/MM/YYYY format में हैं, Work Orders में 'March 15, 2024' format में, और API में UTC timestamps हैं। ETL इन तीनों को extract करता है, सभी dates को 2024-03-15 format में बदलता है, फिर एक joined table में load करता है जो ML model use कर सके।"
          terms={[
            { hindi: 'निकालना', english: 'Extract', meaning: 'CSV, Excel, Database, API से raw data लेना — pandas, SQL, requests' },
            { hindi: 'बदलना', english: 'Transform', meaning: 'Date standardize करना, columns rename करना, tables join करना, aggregation' },
            { hindi: 'लोड करना', english: 'Load', meaning: 'Clean data को Parquet, PostgreSQL, या S3 में save करना' },
            { hindi: 'पाइपलाइन', english: 'Pipeline', meaning: 'Extract → Transform → Load का automated sequence जो scheduled चलता है' },
            { hindi: 'संरचना', english: 'Schema', meaning: 'Table की structure — column names, data types, constraints' },
            { hindi: 'समूहीकरण', english: 'Aggregation', meaning: '15-minute readings को daily summary में compress करना (mean, max, std)' },
          ]}
        />
        <NeuronTip type="deep">
          Real ETL pipelines use orchestration tools like Apache Airflow, Prefect, or AWS Step Functions. These schedule your pipeline, retry on failure, send alerts, and maintain run history. In this course, you've built the core logic — orchestration wraps it in production reliability.
        </NeuronTip>
      </SectionBlock>

      {/* Closing Neuron */}
      <Neuron
        mood="happy"
        size="large"
        message="You've built a complete ETL pipeline — from five messy data sources to a clean, merged, aggregated DataFrame ready for ML. Next up: Data Cleaning, where we handle missing sensors, outlier spikes, and noisy readings that slipped through the ETL."
      />
    </div>
  )
}
