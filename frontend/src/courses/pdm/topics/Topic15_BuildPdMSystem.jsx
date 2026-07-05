import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 15 — CAPSTONE: Build Your Own PdM System
   A 7-stage interactive pipeline wizard where users construct a
   complete Predictive Maintenance system from scratch.
================================================================ */

/* ─── Stage metadata ──────────────────────────────────────────── */
const STAGES = [
  { id: 1, label: 'Choose Plant',    icon: '🏭' },
  { id: 2, label: 'Data Sources',   icon: '📊' },
  { id: 3, label: 'ETL Pipeline',   icon: '🔄' },
  { id: 4, label: 'Data Cleaning',  icon: '🧹' },
  { id: 5, label: 'Features',       icon: '🔬' },
  { id: 6, label: 'Train Model',    icon: '🤖' },
  { id: 7, label: 'Predictions',    icon: '🎯' },
]

/* ─── Plant definitions ───────────────────────────────────────── */
const PLANTS = [
  {
    id: 'steel',
    icon: '🏭',
    title: 'SteelForge Manufacturing',
    desc: 'Heavy-duty steel rolling mill with high-speed industrial pumps and conveyor lines.',
    equipment: 50,
    sensors: 'Vibration, Temperature, Pressure, Motor Current',
    records: '54,000',
    dataSize: '2.1 GB',
    color: '#6366f1',
    savings: '4.2',
    equipment_list: ['Pump P-01','Pump P-02','Pump P-03','Pump P-04','Pump P-05','Pump P-06','Pump P-07','Pump P-08'],
  },
  {
    id: 'wind',
    icon: '💨',
    title: 'WindPower Energy',
    desc: 'Offshore wind farm cluster with SCADA-connected turbines generating 500 MW.',
    equipment: 25,
    sensors: 'Wind Speed, RPM, Power Output, Gearbox Temp',
    records: '180,000',
    dataSize: '8.7 GB',
    color: '#10b981',
    savings: '6.8',
    equipment_list: ['Turbine T-01','Turbine T-02','Turbine T-03','Turbine T-04','Turbine T-05','Turbine T-06','Turbine T-07','Turbine T-08'],
  },
  {
    id: 'metro',
    icon: '🚇',
    title: 'MetroRail Transit',
    desc: 'Urban metro network with 100 coaches, each monitored via onboard diagnostics.',
    equipment: 100,
    sensors: 'OBD Diagnostics, Axle Temp, Brake Pressure, Door Cycles',
    records: '320,000',
    dataSize: '15.3 GB',
    color: '#f59e0b',
    savings: '9.1',
    equipment_list: ['Coach C-001','Coach C-002','Coach C-003','Coach C-004','Coach C-005','Coach C-006','Coach C-007','Coach C-008'],
  },
  {
    id: 'medi',
    icon: '🏥',
    title: 'MediTech Hospital',
    desc: 'Critical imaging equipment fleet — MRI and CT scanners requiring zero downtime.',
    equipment: 30,
    sensors: 'Helium Level, Gradient Coil Temp, Tube Hours, Vacuum Pressure',
    records: '45,000',
    dataSize: '1.8 GB',
    color: '#ef4444',
    savings: '3.5',
    equipment_list: ['MRI-01','MRI-02','MRI-03','CT-01','CT-02','CT-03','MRI-04','MRI-05'],
  },
]

/* ─── Data source definitions per plant ──────────────────────── */
const DATA_SOURCES = {
  steel: [
    { id: 'vibration', icon: '📳', name: 'Vibration Sensors', records: '21,600', preview: [['equipment_id','timestamp','vib_rms'],['P-01','2024-01-01','2.41'],['P-02','2024-01-01','1.89']] },
    { id: 'temperature', icon: '🌡️', name: 'Temperature Logger', records: '21,600', preview: [['equipment_id','timestamp','temp_c'],['P-01','2024-01-01','78.2'],['P-02','2024-01-01','65.1']] },
    { id: 'pressure', icon: '🔵', name: 'Pressure Transducers', records: '18,000', preview: [['equipment_id','timestamp','pressure_bar'],['P-01','2024-01-01','12.4'],['P-02','2024-01-01','11.8']] },
    { id: 'current', icon: '⚡', name: 'Motor Current Logs', records: '18,000', preview: [['equipment_id','timestamp','current_amp'],['P-01','2024-01-01','42.3'],['P-02','2024-01-01','39.7']] },
    { id: 'maintenance', icon: '🔧', name: 'Maintenance Records', records: '1,240', preview: [['equipment_id','date','work_type'],['P-01','2024-01-15','Bearing replace'],['P-03','2024-01-22','Seal repair']] },
  ],
  wind: [
    { id: 'scada', icon: '🌬️', name: 'SCADA Wind Data', records: '72,000', preview: [['turbine_id','timestamp','wind_ms'],['T-01','2024-01-01','9.2'],['T-02','2024-01-01','8.8']] },
    { id: 'rpm', icon: '🔄', name: 'RPM / Rotation Logs', records: '72,000', preview: [['turbine_id','timestamp','rpm'],['T-01','2024-01-01','14.2'],['T-02','2024-01-01','13.9']] },
    { id: 'power', icon: '⚡', name: 'Power Output Meter', records: '36,000', preview: [['turbine_id','timestamp','power_kw'],['T-01','2024-01-01','2840'],['T-02','2024-01-01','2710']] },
    { id: 'gearbox', icon: '⚙️', name: 'Gearbox Temperature', records: '36,000', preview: [['turbine_id','timestamp','gb_temp_c'],['T-01','2024-01-01','52.1'],['T-02','2024-01-01','48.7']] },
    { id: 'maintenance', icon: '🔧', name: 'Service Logbook', records: '890', preview: [['turbine_id','date','work_type'],['T-01','2024-02-10','Blade inspect'],['T-03','2024-02-18','Gearbox oil']] },
  ],
  metro: [
    { id: 'obd', icon: '🚆', name: 'OBD Diagnostics', records: '128,000', preview: [['coach_id','timestamp','fault_code'],['C-001','2024-01-01','P0100'],['C-002','2024-01-01','None']] },
    { id: 'axle', icon: '🎡', name: 'Axle Temperature', records: '96,000', preview: [['coach_id','timestamp','axle_temp'],['C-001','2024-01-01','61.3'],['C-002','2024-01-01','58.9']] },
    { id: 'brake', icon: '🛑', name: 'Brake Pressure Logs', records: '96,000', preview: [['coach_id','timestamp','brake_bar'],['C-001','2024-01-01','4.8'],['C-002','2024-01-01','4.9']] },
    { id: 'door', icon: '🚪', name: 'Door Cycle Counter', records: '48,000', preview: [['coach_id','date','door_cycles'],['C-001','2024-01-01','1240'],['C-002','2024-01-01','1190']] },
    { id: 'maintenance', icon: '🔧', name: 'Workshop Records', records: '3,120', preview: [['coach_id','date','work_type'],['C-001','2024-01-08','Brake pad'],['C-005','2024-01-12','Wheel turn']] },
  ],
  medi: [
    { id: 'helium', icon: '🧊', name: 'Helium Level Monitor', records: '17,520', preview: [['machine_id','timestamp','he_level_pct'],['MRI-01','2024-01-01','98.2'],['MRI-02','2024-01-01','96.8']] },
    { id: 'gradient', icon: '🌡️', name: 'Gradient Coil Temp', records: '17,520', preview: [['machine_id','timestamp','gc_temp_c'],['MRI-01','2024-01-01','31.2'],['MRI-02','2024-01-01','33.4']] },
    { id: 'tube', icon: '💡', name: 'X-Ray Tube Hours', records: '8,760', preview: [['machine_id','date','tube_hours'],['CT-01','2024-01-01','14210'],['CT-02','2024-01-01','9870']] },
    { id: 'vacuum', icon: '🔬', name: 'Vacuum Pressure Log', records: '8,760', preview: [['machine_id','timestamp','vacuum_mbar'],['MRI-01','2024-01-01','0.0012'],['MRI-02','2024-01-01','0.0011']] },
    { id: 'maintenance', icon: '🔧', name: 'PM Service Records', records: '480', preview: [['machine_id','date','service_type'],['MRI-01','2024-01-15','Annual PM'],['CT-01','2024-02-01','Tube check']] },
  ],
}

/* ─── ETL transforms ──────────────────────────────────────────── */
const ETL_TRANSFORMS = [
  { id: 'date', icon: '📅', label: 'Date Standardization', desc: 'Convert all timestamps to ISO 8601 format', color: '#6366f1' },
  { id: 'colmap', icon: '🗺️', label: 'Column Mapping', desc: 'Unify column names across all sources', color: '#0ea5e9' },
  { id: 'merge', icon: '🔗', label: 'Table Merge', desc: 'JOIN all tables on equipment_id + timestamp', color: '#10b981' },
  { id: 'agg', icon: '📊', label: 'Aggregation', desc: 'Compute daily averages from raw readings', color: '#f59e0b' },
  { id: 'dedup', icon: '🧹', label: 'Deduplication', desc: 'Remove exact duplicate rows', color: '#f97316' },
  { id: 'typeconv', icon: '🔢', label: 'Type Conversion', desc: 'Cast string columns to numeric types', color: '#ec4899' },
]

/* ─── Feature definitions ─────────────────────────────────────── */
const FEATURES = [
  { id: 'vib_dev',    label: 'Vibration Deviation (%)',    bars: [2,4,8,18,42], importance: 0.92, desc: 'How far vibration is from healthy baseline' },
  { id: 'temp_dev',   label: 'Temperature Deviation (%)',  bars: [3,5,9,21,38], importance: 0.88, desc: 'How far temp is from healthy baseline' },
  { id: 'roll_mean',  label: 'Rolling Mean (7-day)',        bars: [12,14,16,15,17], importance: 0.75, desc: 'Smoothed trend over past week' },
  { id: 'roll_std',   label: 'Rolling Std Dev (7-day)',     bars: [3,4,7,12,19], importance: 0.82, desc: 'Variability / instability over past week' },
  { id: 'mtbf',       label: 'MTBF (days between failures)',bars: [30,28,25,20,14], importance: 0.79, desc: 'Mean time between failure events' },
  { id: 'repair_acc', label: 'Repair Acceleration',         bars: [1,2,4,7,13], importance: 0.71, desc: 'Is the repair frequency increasing?' },
  { id: 'lifecycle',  label: 'Lifecycle Ratio (age/EUL)',   bars: [5,8,14,22,35], importance: 0.68, desc: 'How close to end of useful life' },
  { id: 'days_repair',label: 'Days Since Last Repair',      bars: [18,22,28,35,44], importance: 0.65, desc: 'Time elapsed since last maintenance' },
  { id: 'emerg_ratio',label: 'Emergency Repair Ratio',      bars: [2,3,5,10,20], importance: 0.84, desc: 'Fraction of repairs that were emergency' },
  { id: 'trend_slope',label: 'Sensor Trend Slope',          bars: [1,3,6,11,21], importance: 0.77, desc: 'Rate of change in key sensor values' },
]

/* ─── Model definitions ───────────────────────────────────────── */
const ALGORITHMS = [
  {
    id: 'rf',
    label: 'Random Forest',
    icon: '🌲',
    color: '#10b981',
    params: [
      { id: 'n_estimators', label: 'Number of Trees', min: 50, max: 500, step: 50, default: 100, unit: '' },
      { id: 'max_depth', label: 'Max Tree Depth', min: 3, max: 20, step: 1, default: 8, unit: '' },
      { id: 'min_samples', label: 'Min Samples Split', min: 2, max: 20, step: 1, default: 5, unit: '' },
    ],
    classMetrics: { auc: 0.94, f1: 0.91, precision: 0.89, recall: 0.93, tp: 142, tn: 311, fp: 18, fn: 11 },
    regMetrics:   { mae: 8.2, rmse: 12.4, r2: 0.87 },
    badge: 'Excellent',
  },
  {
    id: 'xgb',
    label: 'XGBoost',
    icon: '⚡',
    color: '#f59e0b',
    params: [
      { id: 'n_estimators', label: 'Boosting Rounds', min: 50, max: 500, step: 50, default: 200, unit: '' },
      { id: 'lr', label: 'Learning Rate', min: 1, max: 30, step: 1, default: 10, unit: '×0.01' },
      { id: 'max_depth', label: 'Max Tree Depth', min: 3, max: 12, step: 1, default: 6, unit: '' },
      { id: 'subsample', label: 'Subsample (%)', min: 50, max: 100, step: 5, default: 80, unit: '%' },
    ],
    classMetrics: { auc: 0.96, f1: 0.93, precision: 0.92, recall: 0.94, tp: 148, tn: 316, fp: 13, fn: 6 },
    regMetrics:   { mae: 6.9, rmse: 10.1, r2: 0.91 },
    badge: 'Excellent',
  },
  {
    id: 'lgbm',
    label: 'LightGBM',
    icon: '🔦',
    color: '#6366f1',
    params: [
      { id: 'n_leaves', label: 'Num Leaves', min: 20, max: 200, step: 10, default: 63, unit: '' },
      { id: 'lr', label: 'Learning Rate', min: 1, max: 30, step: 1, default: 5, unit: '×0.01' },
      { id: 'min_child', label: 'Min Child Samples', min: 5, max: 50, step: 5, default: 20, unit: '' },
    ],
    classMetrics: { auc: 0.97, f1: 0.94, precision: 0.93, recall: 0.95, tp: 151, tn: 318, fp: 11, fn: 4 },
    regMetrics:   { mae: 6.1, rmse: 9.3, r2: 0.93 },
    badge: 'Excellent',
  },
]

/* ─── Risk tier helper ────────────────────────────────────────── */
function riskTier(prob) {
  if (prob >= 75) return { label: 'Critical', color: '#ef4444', bg: '#fef2f2' }
  if (prob >= 50) return { label: 'High',     color: '#f97316', bg: '#fff7ed' }
  if (prob >= 25) return { label: 'Medium',   color: '#f59e0b', bg: '#fffbeb' }
  return             { label: 'Low',      color: '#10b981', bg: '#f0fdf4' }
}

/* ─── Confetti particle component ─────────────────────────────── */
function ConfettiParticle({ delay, x }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 1, x }}
      animate={{ y: 420, opacity: 0, x: x + (Math.random() - 0.5) * 120, rotate: Math.random() * 720 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
      style={{
        position: 'absolute',
        top: 0,
        left: `${x}%`,
        width: 10,
        height: 10,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        background: ['#6366f1','#10b981','#f59e0b','#ef4444','#0ea5e9','#ec4899'][Math.floor(Math.random()*6)],
        pointerEvents: 'none',
      }}
    />
  )
}

/* ─── Sparkline bars ──────────────────────────────────────────── */
function Sparkline({ bars, color = '#6366f1' }) {
  const max = Math.max(...bars)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28 }}>
      {bars.map((v, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: `${(v / max) * 100}%`,
            minHeight: 3,
            background: color,
            borderRadius: '2px 2px 0 0',
            opacity: 0.7 + (i / bars.length) * 0.3,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Progress bar header ─────────────────────────────────────── */
function WizardProgressBar({ currentStep, completedSteps }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Desktop: horizontal row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        overflowX: 'auto',
        paddingBottom: 4,
      }}>
        {STAGES.map((stage, idx) => {
          const isCompleted = completedSteps.includes(stage.id)
          const isCurrent   = currentStep === stage.id
          const isFuture    = !isCompleted && !isCurrent

          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              {/* Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 64 }}>
                <motion.div
                  animate={isCurrent ? { boxShadow: ['0 0 0 0 var(--accent)', '0 0 0 8px transparent'], scale: [1, 1.08, 1] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 1.8 } : {}}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 700,
                    background: isCompleted ? '#10b981' : isCurrent ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: isCompleted || isCurrent ? '#fff' : 'var(--text-secondary)',
                    border: isCurrent ? '3px solid var(--accent)' : isCompleted ? '3px solid #10b981' : '2px solid var(--border)',
                    transition: 'all 0.4s ease',
                    cursor: 'default',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? '✓' : stage.icon}
                </motion.div>
                <span style={{
                  fontSize: 10,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCompleted ? '#10b981' : isCurrent ? 'var(--accent)' : 'var(--text-secondary)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  {stage.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 3,
                  background: isCompleted ? '#10b981' : 'var(--border)',
                  marginBottom: 20,
                  transition: 'background 0.4s ease',
                  minWidth: 8,
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Stage label */}
      <div style={{
        textAlign: 'center',
        marginTop: 8,
        fontSize: 13,
        color: 'var(--text-secondary)',
        fontWeight: 500,
      }}>
        Stage {currentStep} of {STAGES.length} — {STAGES[currentStep-1].label}
      </div>
    </div>
  )
}

/* ─── Nav buttons ─────────────────────────────────────────────── */
function NavButtons({ step, onBack, onNext, canNext, nextLabel = 'Next →' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
      {step > 1 ? (
        <button
          onClick={onBack}
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            border: '2px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      ) : <div />}
      <motion.button
        whileHover={canNext ? { scale: 1.03 } : {}}
        whileTap={canNext ? { scale: 0.97 } : {}}
        onClick={canNext ? onNext : undefined}
        style={{
          padding: '12px 32px',
          borderRadius: 10,
          border: 'none',
          background: canNext ? 'var(--accent)' : 'var(--bg-secondary)',
          color: canNext ? '#fff' : 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: 15,
          cursor: canNext ? 'pointer' : 'not-allowed',
          opacity: canNext ? 1 : 0.6,
          transition: 'all 0.2s',
        }}
      >
        {nextLabel}
      </motion.button>
    </div>
  )
}

/* ================================================================
   STAGE 1 — Choose Your Plant
================================================================ */
function Stage1({ plant, setPlant }) {
  return (
    <div>
      <Neuron
        mood="excited"
        message="Welcome to the PdM Capstone! You're going to build a real Predictive Maintenance system step by step. First — choose your industry. Each plant has unique sensors, failure modes, and business stakes!"
        size="medium"
      />

      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, marginTop: 24 }}>
        🏭 Step 1: Choose Your Industrial Plant
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        Pick the industry you want to build a PdM system for. Each plant has different sensor types,
        failure patterns, and business impact.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {PLANTS.map(p => {
          const selected = plant?.id === p.id
          return (
            <motion.div
              key={p.id}
              whileHover={{ y: -4, boxShadow: `0 8px 32px ${p.color}33` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPlant(p)}
              style={{
                background: 'var(--bg-card)',
                border: selected ? `3px solid ${p.color}` : '2px solid var(--border)',
                borderRadius: 16,
                padding: '24px 20px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border 0.2s',
                boxShadow: selected ? `0 0 0 4px ${p.color}22` : undefined,
              }}
            >
              {selected && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: p.color,
                  color: '#fff',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 14,
                }}>✓</div>
              )}

              <div style={{ fontSize: 40, marginBottom: 12 }}>{p.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                {p.desc}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <span style={{ background: `${p.color}22`, color: p.color, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                  {p.equipment} machines
                </span>
                <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>
                  {p.records} records
                </span>
                <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>
                  {p.dataSize}
                </span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600 }}>Sensors: </span>{p.sensors}
              </div>
            </motion.div>
          )
        })}
      </div>

      <NeuronTip type="info">
        Each industry teaches different lessons. SteelForge is great for vibration + bearing analysis.
        WindPower shows environmental correlation. MetroRail has the richest dataset. MediTech has
        the highest consequence of failure.
      </NeuronTip>
    </div>
  )
}

/* ================================================================
   STAGE 2 — Data Source Selection
================================================================ */
function Stage2({ plant, dataSources, setDataSources }) {
  const sources = DATA_SOURCES[plant?.id] || []

  const toggle = (id) => {
    setDataSources(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const totalRecords = sources
    .filter(s => dataSources.includes(s.id))
    .reduce((sum, s) => sum + parseInt(s.records.replace(/,/g,''), 10), 0)

  return (
    <div>
      <Neuron
        mood="thinking"
        message={`Great choice! ${plant?.title} has ${sources.length} data sources available. You need at least 2 to build a meaningful dataset. The maintenance records are small but gold — they tell us WHEN failures actually happened!`}
        size="medium"
      />

      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, marginTop: 24 }}>
        📊 Step 2: Select Your Data Sources
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        Choose which data sources to include. Click to select/deselect. Select at least 2 sources
        to continue. The sensor data provides signals; the maintenance records provide ground truth labels.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {sources.map(src => {
          const selected = dataSources.includes(src.id)
          return (
            <motion.div
              key={src.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(src.id)}
              style={{
                background: 'var(--bg-card)',
                border: selected ? '2px solid #10b981' : '2px solid var(--border)',
                borderRadius: 14,
                padding: '20px 18px',
                cursor: 'pointer',
                boxShadow: selected ? '0 0 0 3px #10b98133' : undefined,
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {selected && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#10b981', color: '#fff', borderRadius: '50%',
                  width: 24, height: 24, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: 13,
                }}>✓</div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{src.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{src.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{src.records} rows</div>
                </div>
              </div>

              {/* Mini table preview */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                overflow: 'hidden',
                fontSize: 11,
                fontFamily: 'monospace',
              }}>
                {src.preview.map((row, ri) => (
                  <div
                    key={ri}
                    style={{
                      display: 'flex',
                      gap: 0,
                      background: ri === 0 ? (selected ? '#10b98122' : 'var(--bg-secondary)') : 'transparent',
                      borderBottom: ri < src.preview.length - 1 ? '1px solid var(--border)' : 'none',
                      padding: '4px 8px',
                    }}
                  >
                    {row.map((cell, ci) => (
                      <span
                        key={ci}
                        style={{
                          flex: 1,
                          color: ri === 0 ? (selected ? '#10b981' : 'var(--text-secondary)') : 'var(--text-primary)',
                          fontWeight: ri === 0 ? 700 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: 10,
                        }}
                      >
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Data Summary Panel */}
      {dataSources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 14,
            padding: '20px 24px',
            border: '2px solid var(--border)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
            📋 Data Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>
                {totalRecords.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Total Records</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
                {plant?.equipment}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Unique Equipment</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>
                2024
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Data Year</div>
            </div>
          </div>
        </motion.div>
      )}

      {dataSources.length < 2 && (
        <NeuronTip type="warning">
          Select at least 2 data sources to proceed. Sensor data alone is not enough — you need
          maintenance records to know when failures occurred!
        </NeuronTip>
      )}
    </div>
  )
}

/* ================================================================
   STAGE 3 — ETL Configuration
================================================================ */
function Stage3({ plant, dataSources, etlSteps, setEtlSteps }) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const sources = (DATA_SOURCES[plant?.id] || []).filter(s => dataSources.includes(s.id))

  const addStep = (id) => {
    if (!etlSteps.includes(id)) setEtlSteps(prev => [...prev, id])
  }
  const removeStep = (id) => {
    setEtlSteps(prev => prev.filter(x => x !== id))
    setDone(false)
  }

  const runETL = () => {
    if (etlSteps.length < 3) return
    setRunning(true)
    setProgress(0)
    setDone(false)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setRunning(false)
          setDone(true)
          return 100
        }
        return p + 4
      })
    }, 80)
  }

  return (
    <div>
      <Neuron
        mood="building"
        message={`You've selected ${dataSources.length} data sources. Now let's build the ETL pipeline — Extract, Transform, Load. Click the transform blocks on the right to add them to your pipeline. You need at least 3 transforms!`}
        size="medium"
      />

      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, marginTop: 24 }}>
        🔄 Step 3: Build Your ETL Pipeline
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        Click transform blocks to add them to your pipeline (minimum 3). Then click "Run ETL" to
        process your data. Each transform cleans and prepares the data for analysis.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Left: Input sources */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Input Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sources.map(s => (
              <div
                key={s.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                <span>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.records} rows</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Active pipeline */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Pipeline ({etlSteps.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 180 }}>
            <AnimatePresence>
              {etlSteps.length === 0 && (
                <div style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 10,
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  flex: 1,
                }}>
                  Click transforms →<br />to add them here
                </div>
              )}
              {etlSteps.map((id, idx) => {
                const t = ETL_TRANSFORMS.find(x => x.id === id)
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: 30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{
                      background: `${t.color}18`,
                      border: `2px solid ${t.color}`,
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        background: t.color,
                        color: '#fff',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>{idx + 1}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{t.label}</span>
                    </div>
                    <button
                      onClick={() => removeStep(id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1, padding: 0,
                      }}
                    >×</button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Run ETL button */}
          {etlSteps.length >= 3 && !done && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={runETL}
              disabled={running}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: running ? 'var(--bg-secondary)' : 'var(--accent)',
                color: running ? 'var(--text-secondary)' : '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: running ? 'wait' : 'pointer',
              }}
            >
              {running ? '⚙️ Running...' : '▶ Run ETL'}
            </motion.button>
          )}

          {running && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: 'var(--accent)', borderRadius: 4 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, textAlign: 'center' }}>
                Processing... {progress}%
              </div>
            </div>
          )}

          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: 16,
                background: '#10b98122',
                border: '2px solid #10b981',
                borderRadius: 10,
                padding: '14px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#10b981', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>✓ ETL Complete!</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                Merged: 42,500 rows × 28 columns
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                Processed in 2.4s • 0 errors
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Available transforms */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Available Transforms
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ETL_TRANSFORMS.map(t => {
              const added = etlSteps.includes(t.id)
              return (
                <motion.div
                  key={t.id}
                  whileHover={!added ? { x: -4 } : {}}
                  whileTap={!added ? { scale: 0.97 } : {}}
                  onClick={() => !added && addStep(t.id)}
                  style={{
                    background: added ? `${t.color}22` : 'var(--bg-secondary)',
                    border: added ? `2px solid ${t.color}88` : '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    cursor: added ? 'default' : 'pointer',
                    opacity: added ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.desc}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {etlSteps.length < 3 && (
        <NeuronTip type="warning">
          Add at least 3 transforms to your pipeline. At minimum: Date Standardization + Column Mapping + Table Merge are essential for any multi-source dataset.
        </NeuronTip>
      )}
      {done && (
        <NeuronTip type="success">
          ETL complete! Your data is now unified, typed, and deduplicated. 42,500 rows ready for cleaning.
        </NeuronTip>
      )}
    </div>
  )
}

/* ================================================================
   STAGE 4 — Data Cleaning
================================================================ */
function Stage4({ cleaningConfig, setCleaningConfig }) {
  const [effect, setEffect] = useState(null)

  const update = (key, val) => {
    setCleaningConfig(prev => ({ ...prev, [key]: val }))
    setEffect(key)
    setTimeout(() => setEffect(null), 1200)
  }

  const qualityScore = () => {
    let score = 40
    if (cleaningConfig.missing) score += 20
    if (cleaningConfig.outliers) score += 20
    if (cleaningConfig.categories) score += 20
    return score
  }

  const q = qualityScore()
  const qColor = q >= 80 ? '#10b981' : q >= 60 ? '#f59e0b' : '#ef4444'

  const missingOptions = [
    { id: 'drop', label: 'Drop Rows', icon: '🗑️', desc: 'Remove rows with any missing values' },
    { id: 'mean', label: 'Mean Fill', icon: '📐', desc: 'Fill with column mean' },
    { id: 'median', label: 'Median Fill', icon: '📊', desc: 'Fill with column median (robust)' },
    { id: 'ffill', label: 'Forward Fill', icon: '➡️', desc: 'Carry last known value forward (time series)' },
    { id: 'interp', label: 'Interpolation', icon: '〰️', desc: 'Linear interpolation between known points' },
  ]
  const outlierOptions = [
    { id: 'keep', label: 'Keep All', icon: '📌', desc: 'Use all readings (may add noise)' },
    { id: 'z3', label: 'Remove Z>3', icon: '📉', desc: 'Remove readings >3 standard deviations' },
    { id: 'cap99', label: 'Cap 99th Pct', icon: '🔒', desc: 'Cap extreme values at 99th percentile' },
    { id: 'domain', label: 'Domain Rules', icon: '🏭', desc: 'Use engineering limits (e.g. temp < 200°C)' },
  ]
  const catOptions = [
    { id: 'label', label: 'Label Encode', icon: '🏷️', desc: 'Map categories to 0,1,2,...' },
    { id: 'onehot', label: 'One-Hot Encode', icon: '🎯', desc: 'Create binary columns per category' },
    { id: 'target', label: 'Target Encode', icon: '📈', desc: 'Replace with mean target value' },
  ]

  const sections = [
    {
      key: 'missing',
      title: 'Missing Values (12.3%)',
      icon: '❓',
      color: '#6366f1',
      options: missingOptions,
      note: '5,231 cells have missing sensor readings',
    },
    {
      key: 'outliers',
      title: 'Outliers (3.1%)',
      icon: '⚠️',
      color: '#f59e0b',
      options: outlierOptions,
      note: '1,317 rows have extreme sensor spikes',
    },
    {
      key: 'categories',
      title: 'Categorical Variables (5 types)',
      icon: '🏷️',
      color: '#10b981',
      options: catOptions,
      note: 'Equipment type, shift code, maintenance category',
    },
  ]

  return (
    <div>
      <Neuron
        mood="thinking"
        message="Real data is messy! Our merged dataset has missing values, sensor spikes, and text categories that ML models can't read. Choose the best cleaning strategy for each problem. Your choices affect the final row count!"
        size="medium"
      />

      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, marginTop: 24 }}>
        🧹 Step 4: Clean Your Data
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        Three types of problems need different solutions. Choose one strategy per problem type.
      </p>

      {/* Quality gauge */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border)',
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>
            Data Quality Score
          </div>
          <div style={{ height: 18, background: 'var(--bg-secondary)', borderRadius: 9, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: qColor, borderRadius: 9 }}
              animate={{ width: `${q}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            {q}% — {q >= 80 ? 'Excellent' : q >= 60 ? 'Good' : 'Needs work'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: qColor }}>{q}%</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Quality</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
            {cleaningConfig.missing ? '39,800' : '42,500'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Rows</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>28</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Columns</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map(sec => (
          <div
            key={sec.key}
            style={{
              background: 'var(--bg-card)',
              border: `2px solid ${cleaningConfig[sec.key] ? sec.color : 'var(--border)'}`,
              borderRadius: 14,
              padding: '20px 24px',
              transition: 'border 0.3s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{sec.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{sec.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sec.note}</div>
              </div>
              {cleaningConfig[sec.key] && (
                <span style={{
                  marginLeft: 'auto',
                  background: sec.color,
                  color: '#fff',
                  borderRadius: 8,
                  padding: '3px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  ✓ {sec.options.find(o => o.id === cleaningConfig[sec.key])?.label}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {sec.options.map(opt => {
                const sel = cleaningConfig[sec.key] === opt.id
                return (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => update(sec.key, opt.id)}
                    title={opt.desc}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: sel ? `2px solid ${sec.color}` : '2px solid var(--border)',
                      background: sel ? `${sec.color}22` : 'var(--bg-secondary)',
                      color: sel ? sec.color : 'var(--text-secondary)',
                      fontWeight: sel ? 700 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {opt.icon} {opt.label}
                  </motion.button>
                )
              })}
            </div>

            {/* Effect animation */}
            <AnimatePresence>
              {effect === sec.key && cleaningConfig[sec.key] && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 12,
                    background: `${sec.color}18`,
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontSize: 12,
                    color: sec.color,
                    fontWeight: 600,
                  }}
                >
                  ✓ Applied: {sec.options.find(o => o.id === cleaningConfig[sec.key])?.desc}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {Object.keys(cleaningConfig).length === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 20,
            background: '#10b98122',
            border: '2px solid #10b981',
            borderRadius: 12,
            padding: '14px 20px',
            fontSize: 14,
            color: '#10b981',
            fontWeight: 600,
          }}
        >
          ✅ All cleaning steps configured! After cleaning: 39,800 rows × 28 columns
        </motion.div>
      )}
    </div>
  )
}

/* ================================================================
   STAGE 5 — Feature Engineering
================================================================ */
function Stage5({ features, setFeatures }) {
  const toggle = (id) => {
    setFeatures(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectedFeatures = FEATURES.filter(f => features.includes(f.id))
  const show5Plus = features.length >= 5

  return (
    <div>
      <Neuron
        mood="excited"
        message={`Feature engineering is where PdM magic happens! Raw sensor readings aren't enough — we need derived features like 'deviation from baseline' and 'MTBF trend'. Select at least 5 features. Currently: ${features.length} selected.`}
        size="medium"
      />

      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, marginTop: 24 }}>
        🔬 Step 5: Engineer Your Features
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
        Each feature below is derived from your raw sensor data. Check the mini histogram to see
        how the feature is distributed. Select at least 5 features for a robust model.
      </p>

      {/* Feature matrix counter */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 10,
        padding: '12px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
          Feature Matrix:
        </span>
        <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 16 }}>
          39,800 rows × {features.length + 6} columns
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          (6 base + {features.length} engineered)
        </span>
        <span style={{
          marginLeft: 'auto',
          background: features.length >= 5 ? '#10b98122' : '#f59e0b22',
          color: features.length >= 5 ? '#10b981' : '#f59e0b',
          borderRadius: 8,
          padding: '4px 12px',
          fontSize: 13,
          fontWeight: 700,
        }}>
          {features.length}/5 minimum selected
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {FEATURES.map(f => {
          const sel = features.includes(f.id)
          return (
            <motion.div
              key={f.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(f.id)}
              style={{
                background: 'var(--bg-card)',
                border: sel ? '2px solid var(--accent)' : '2px solid var(--border)',
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'all 0.2s',
                boxShadow: sel ? '0 0 0 3px var(--accent)22' : undefined,
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: sel ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: sel ? 'var(--accent)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                color: '#fff',
                fontSize: 13,
                fontWeight: 800,
              }}>
                {sel && '✓'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {f.desc}
                </div>
              </div>

              <Sparkline
                bars={f.bars}
                color={sel ? 'var(--accent)' : '#9ca3af'}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Feature importance preview */}
      <AnimatePresence>
        {show5Plus && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 28,
              background: 'var(--bg-card)',
              border: '2px solid var(--border)',
              borderRadius: 14,
              padding: '20px 24px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>
              📊 Estimated Feature Importance Preview
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedFeatures
                .sort((a, b) => b.importance - a.importance)
                .slice(0, 5)
                .map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: ['#6366f1','#10b981','#f59e0b','#f97316','#ec4899'][i],
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>{i+1}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', minWidth: 200 }}>
                      {f.label}
                    </span>
                    <div style={{ flex: 1, height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.importance * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        style={{
                          height: '100%',
                          background: ['#6366f1','#10b981','#f59e0b','#f97316','#ec4899'][i],
                          borderRadius: 5,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 36 }}>
                      {(f.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {features.length < 5 && (
        <NeuronTip type="warning">
          Select at least 5 features. Aim for a mix of deviation features, rolling stats, and lifecycle indicators for the best model performance.
        </NeuronTip>
      )}
    </div>
  )
}

/* ================================================================
   STAGE 6 — Model Training
================================================================ */
function Stage6({ modelConfig, setModelConfig, features }) {
  const [training, setTraining] = useState(false)
  const [trainProgress, setTrainProgress] = useState(0)
  const [results, setResults] = useState(null)

  const updateConfig = (key, val) => {
    setModelConfig(prev => ({ ...prev, [key]: val }))
    setResults(null)
  }

  const trainModel = () => {
    if (!modelConfig.algorithm || !modelConfig.target) return
    setTraining(true)
    setTrainProgress(0)
    setResults(null)
    const interval = setInterval(() => {
      setTrainProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTraining(false)
          const algo = ALGORITHMS.find(a => a.id === modelConfig.algorithm)
          setResults({
            algo,
            target: modelConfig.target,
            featureCount: features.length,
          })
          return 100
        }
        return p + 2
      })
    }, 60)
  }

  const selectedAlgo = ALGORITHMS.find(a => a.id === modelConfig.algorithm)
  const isClassification = modelConfig.target === 'failure30'

  const trainSteps = [
    'Splitting train/test (80/20)...',
    'Scaling features...',
    'Cross-validation (5-fold)...',
    'Fitting model...',
    'Evaluating on test set...',
    'Generating feature importance...',
  ]
  const trainStep = Math.floor((trainProgress / 100) * trainSteps.length)

  return (
    <div>
      <Neuron
        mood="building"
        message={`Time to train! You've built ${features.length} features from 39,800 rows. Now pick your algorithm, tune hyperparameters, and set the prediction target. Then click Train Model — I'll show you real performance metrics!`}
        size="medium"
      />

      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, marginTop: 24 }}>
        🤖 Step 6: Train Your Model
      </h2>

      {/* Algorithm cards */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Choose Algorithm
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {ALGORITHMS.map(algo => {
            const sel = modelConfig.algorithm === algo.id
            return (
              <motion.div
                key={algo.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { updateConfig('algorithm', algo.id); setResults(null) }}
                style={{
                  background: 'var(--bg-card)',
                  border: sel ? `3px solid ${algo.color}` : '2px solid var(--border)',
                  borderRadius: 14,
                  padding: '18px 16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: sel ? `0 0 0 4px ${algo.color}22` : undefined,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{algo.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{algo.label}</div>
                {sel && <div style={{ marginTop: 6, color: algo.color, fontWeight: 700, fontSize: 12 }}>✓ Selected</div>}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Hyperparameters */}
      {selectedAlgo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--border)',
            borderRadius: 14,
            padding: '20px 24px',
            marginBottom: 24,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>
            ⚙️ Hyperparameters — {selectedAlgo.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {selectedAlgo.params.map(param => {
              const val = (modelConfig.hyperparams || {})[param.id] ?? param.default
              return (
                <div key={param.id}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                    <span>{param.label}</span>
                    <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {val}{param.unit}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={val}
                    onChange={e => {
                      setModelConfig(prev => ({
                        ...prev,
                        hyperparams: { ...(prev.hyperparams || {}), [param.id]: Number(e.target.value) }
                      }))
                      setResults(null)
                    }}
                    style={{ width: '100%', accentColor: selectedAlgo.color, cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
                    <span>{param.min}{param.unit}</span>
                    <span>{param.max}{param.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Target selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Prediction Target
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { id: 'failure30', label: 'Failure in 30 days', icon: '🎯', type: 'Classification', desc: 'Binary: will this machine fail within 30 days?' },
            { id: 'rul', label: 'RUL in days', icon: '⏱️', type: 'Regression', desc: 'Continuous: how many days until failure?' },
          ].map(t => {
            const sel = modelConfig.target === t.id
            return (
              <motion.div
                key={t.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => updateConfig('target', t.id)}
                style={{
                  flex: 1,
                  background: 'var(--bg-card)',
                  border: sel ? '3px solid var(--accent)' : '2px solid var(--border)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  boxShadow: sel ? '0 0 0 4px var(--accent)22' : undefined,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{t.label}</div>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>{t.type}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Train button */}
      {selectedAlgo && modelConfig.target && !results && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={!training ? { scale: 1.03 } : {}}
          whileTap={!training ? { scale: 0.97 } : {}}
          onClick={trainModel}
          disabled={training}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            border: 'none',
            background: training ? 'var(--bg-secondary)' : 'var(--accent)',
            color: training ? 'var(--text-secondary)' : '#fff',
            fontWeight: 800,
            fontSize: 16,
            cursor: training ? 'wait' : 'pointer',
            marginBottom: 16,
          }}
        >
          {training ? `⚙️ Training... (${trainSteps[Math.min(trainStep, trainSteps.length-1)]})` : '🚀 Train Model'}
        </motion.button>
      )}

      {training && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'var(--accent)', borderRadius: 5 }}
              animate={{ width: `${trainProgress}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>{trainSteps[Math.min(trainStep, trainSteps.length-1)]}</span>
            <span>{trainProgress}%</span>
          </div>
        </div>
      )}

      {/* Results panel */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--bg-card)',
              border: `3px solid ${results.algo.color}`,
              borderRadius: 16,
              padding: '24px',
              marginTop: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
                📈 Training Results — {results.algo.label}
              </div>
              <span style={{
                background: '#10b98122',
                color: '#10b981',
                borderRadius: 10,
                padding: '6px 16px',
                fontWeight: 800,
                fontSize: 14,
              }}>
                🏆 {results.algo.badge}
              </span>
            </div>

            {isClassification ? (
              <div>
                {/* Metrics row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'AUC-ROC', value: results.algo.classMetrics.auc, fmt: v => v.toFixed(3) },
                    { label: 'F1 Score', value: results.algo.classMetrics.f1, fmt: v => v.toFixed(3) },
                    { label: 'Precision', value: results.algo.classMetrics.precision, fmt: v => v.toFixed(3) },
                    { label: 'Recall', value: results.algo.classMetrics.recall, fmt: v => v.toFixed(3) },
                  ].map(m => (
                    <div key={m.label} style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: 10,
                      padding: '14px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: results.algo.color }}>{m.fmt(m.value)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Confusion matrix */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>
                    Confusion Matrix
                  </div>
                  <div style={{ display: 'inline-block' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 6, alignItems: 'center' }}>
                      <div />
                      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', padding: '0 8px' }}>Predicted: No</div>
                      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', padding: '0 8px' }}>Predicted: Yes</div>

                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', writingMode: 'vertical-lr', transform: 'rotate(180deg)', textAlign: 'center' }}>Actual: No</div>
                      <div style={{ background: '#10b98133', border: '2px solid #10b981', borderRadius: 10, padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{results.algo.classMetrics.tn}</div>
                        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>TN</div>
                      </div>
                      <div style={{ background: '#ef444433', border: '2px solid #ef4444', borderRadius: 10, padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{results.algo.classMetrics.fp}</div>
                        <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>FP</div>
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', writingMode: 'vertical-lr', transform: 'rotate(180deg)', textAlign: 'center' }}>Actual: Yes</div>
                      <div style={{ background: '#f59e0b33', border: '2px solid #f59e0b', borderRadius: 10, padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{results.algo.classMetrics.fn}</div>
                        <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>FN</div>
                      </div>
                      <div style={{ background: '#10b98133', border: '2px solid #10b981', borderRadius: 10, padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{results.algo.classMetrics.tp}</div>
                        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>TP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Regression metrics */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'MAE (days)', value: results.algo.regMetrics.mae, color: '#6366f1' },
                  { label: 'RMSE (days)', value: results.algo.regMetrics.rmse, color: '#f59e0b' },
                  { label: 'R² Score', value: results.algo.regMetrics.r2, color: '#10b981' },
                ].map(m => (
                  <div key={m.label} style={{
                    background: `${m.color}18`,
                    border: `2px solid ${m.color}`,
                    borderRadius: 12,
                    padding: '20px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Feature importance */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}>
                Top Feature Importance
              </div>
              {FEATURES.filter(f => features.includes(f.id))
                .sort((a, b) => b.importance - a.importance)
                .slice(0, 5)
                .map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 16 }}>{i+1}.</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', minWidth: 200, fontWeight: 500 }}>{f.label}</span>
                    <div style={{ flex: 1, height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.importance * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        style={{ height: '100%', background: results.algo.color, borderRadius: 5 }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 36, fontWeight: 600 }}>
                      {(f.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!modelConfig.algorithm && (
        <NeuronTip type="info">
          LightGBM is often the fastest and most accurate for tabular sensor data. XGBoost gives
          excellent results but is slower. Random Forest is most interpretable.
        </NeuronTip>
      )}
    </div>
  )
}

/* ================================================================
   STAGE 7 — Predictions Dashboard
================================================================ */
function Stage7({ plant, modelConfig, features }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [sortBy, setSortBy] = useState('risk')

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(t)
  }, [])

  const isClassification = modelConfig.target === 'failure30'
  const selectedAlgo = ALGORITHMS.find(a => a.id === modelConfig.algorithm)

  // Generate equipment predictions based on plant
  const equipment = (plant?.equipment_list || []).map((name, i) => {
    const probs = [82, 65, 91, 23, 47, 78, 12, 55]
    const ruls  = [8, 14, 4, 45, 22, 9, 62, 17]
    return {
      name,
      failureProb: probs[i % probs.length],
      rul: ruls[i % ruls.length],
      tier: riskTier(probs[i % probs.length]),
    }
  })

  const sorted = [...equipment].sort((a, b) =>
    sortBy === 'risk' ? b.failureProb - a.failureProb : a.rul - b.rul
  )

  const recommendations = [
    {
      icon: '🚨',
      color: '#ef4444',
      title: `Immediate: Inspect ${sorted[0]?.name}`,
      desc: `Failure probability ${sorted[0]?.failureProb}% — estimated ${sorted[0]?.rul} days remaining. Schedule inspection within 48 hours.`,
    },
    {
      icon: '⚙️',
      color: '#f59e0b',
      title: `This Week: Service ${sorted[1]?.name} & ${sorted[2]?.name}`,
      desc: `Both show elevated vibration deviation (>25% above baseline). Preventive bearing check recommended.`,
    },
    {
      icon: '📅',
      color: '#6366f1',
      title: 'Next Month: Update Maintenance Schedule',
      desc: `5 machines enter elevated-risk window in 15-30 days. Pre-order spare parts now to avoid lead-time delays.`,
    },
  ]

  const savings = plant?.savings || '4.2'

  return (
    <div>
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.08} x={Math.random() * 100} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Celebration banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, #6366f122, #10b98122)',
          border: '3px solid var(--accent)',
          borderRadius: 20,
          padding: '28px 32px',
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
          You built a production PdM system!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 16 }}>
          {plant?.title} • {selectedAlgo?.label} • {features.length} features • 39,800 training rows
        </p>
        <div style={{
          display: 'inline-block',
          background: '#10b98122',
          border: '2px solid #10b981',
          borderRadius: 14,
          padding: '12px 28px',
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>
            Annual Savings Estimate: ₹{savings} crores
          </span>
        </div>
      </motion.div>

      {/* Equipment risk dashboard */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
            🎯 Equipment Risk Dashboard
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {['risk', 'rul'].map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: sortBy === s ? '2px solid var(--accent)' : '2px solid var(--border)',
                  background: sortBy === s ? 'var(--accent)22' : 'var(--bg-secondary)',
                  color: sortBy === s ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Sort by {s === 'risk' ? '🔴 Risk' : '⏱ RUL'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {sorted.map((eq, i) => {
            const isCritical = eq.tier.label === 'Critical'
            return (
              <motion.div
                key={eq.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: eq.tier.bg,
                  border: `2px solid ${eq.tier.color}`,
                  borderRadius: 14,
                  padding: '16px 18px',
                  position: 'relative',
                  boxShadow: isCritical ? `0 0 0 3px ${eq.tier.color}44` : undefined,
                }}
              >
                {isCritical && (
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: eq.tier.color,
                    }}
                  />
                )}

                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 10 }}>
                  {eq.name}
                </div>

                {isClassification ? (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      <span>Failure Probability</span>
                      <span style={{ fontWeight: 700, color: eq.tier.color }}>{eq.failureProb}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${eq.failureProb}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        style={{ height: '100%', background: eq.tier.color, borderRadius: 4 }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>RUL Estimate</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: eq.tier.color }}>{eq.rul} days</div>
                  </div>
                )}

                <span style={{
                  display: 'inline-block',
                  background: eq.tier.color,
                  color: '#fff',
                  borderRadius: 6,
                  padding: '2px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  {eq.tier.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
          💡 Top Recommended Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.12 }}
              style={{
                background: 'var(--bg-card)',
                border: `2px solid ${rec.color}`,
                borderRadius: 14,
                padding: '18px 22px',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>{rec.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {rec.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {rec.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Neuron
        mood="celebrating"
        message={`Congratulations! You've completed all 7 stages. Your PdM system for ${plant?.title} can predict failures with high accuracy and save ₹${savings} crores annually. This is exactly how real industrial AI systems are built!`}
        size="medium"
      />
    </div>
  )
}

/* ================================================================
   SUMMARY CARD
================================================================ */
function SummaryCard({ plant, dataSources, etlSteps, cleaningConfig, features, modelConfig }) {
  const selectedAlgo = ALGORITHMS.find(a => a.id === modelConfig.algorithm)
  const sourcesData = (DATA_SOURCES[plant?.id] || []).filter(s => dataSources.includes(s.id))

  const items = [
    { label: 'Plant Selected', value: plant?.title || '—', icon: plant?.icon || '🏭' },
    { label: 'Data Sources', value: `${dataSources.length} sources`, icon: '📊' },
    { label: 'ETL Steps', value: `${etlSteps.length} transforms`, icon: '🔄' },
    { label: 'Cleaning: Missing', value: cleaningConfig.missing || '—', icon: '❓' },
    { label: 'Cleaning: Outliers', value: cleaningConfig.outliers || '—', icon: '⚠️' },
    { label: 'Cleaning: Encoding', value: cleaningConfig.categories || '—', icon: '🏷️' },
    { label: 'Features Engineered', value: `${features.length} features`, icon: '🔬' },
    { label: 'Algorithm', value: selectedAlgo?.label || '—', icon: selectedAlgo?.icon || '🤖' },
    { label: 'Target', value: modelConfig.target === 'failure30' ? 'Failure in 30 days' : modelConfig.target === 'rul' ? 'RUL in days' : '—', icon: '🎯' },
    { label: 'Training Rows', value: '39,800', icon: '📦' },
  ]

  return (
    <SectionBlock icon="📋" title="Your PdM System — Full Summary" color="#6366f1">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20,
        background: 'linear-gradient(135deg, #6366f122, #10b98122)',
        borderRadius: 14,
        padding: '20px 24px',
        border: '2px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 16,
        textAlign: 'center',
      }}>
        {[
          { label: 'Model AUC', value: selectedAlgo ? (modelConfig.target === 'rul' ? selectedAlgo.regMetrics.r2.toFixed(2) : selectedAlgo.classMetrics.auc.toFixed(2)) : '—', suffix: '' },
          { label: 'Data Quality', value: '94', suffix: '%' },
          { label: 'Features', value: String(features.length), suffix: '' },
          { label: 'Est. Savings', value: `₹${plant?.savings || '—'}`, suffix: ' cr.' },
        ].map(m => (
          <div key={m.label}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>{m.value}{m.suffix}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic15Content() {
  const [step, setStep]               = useState(1)
  const [completedSteps, setCompleted]= useState([])

  // Stage state
  const [plant, setPlant]             = useState(null)
  const [dataSources, setDataSources] = useState([])
  const [etlSteps, setEtlSteps]       = useState([])
  const [cleaningConfig, setCleaningConfig] = useState({})
  const [features, setFeatures]       = useState([])
  const [modelConfig, setModelConfig] = useState({})
  const [predictions, setPredictions] = useState(null)

  const topRef = useRef(null)

  // Scroll to top of component on step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  /* ── Validation per stage ── */
  const canNext = () => {
    switch (step) {
      case 1: return !!plant
      case 2: return dataSources.length >= 2
      case 3: return etlSteps.length >= 3
      case 4: return Object.keys(cleaningConfig).length >= 3
      case 5: return features.length >= 5
      case 6: return !!modelConfig.algorithm && !!modelConfig.target
      case 7: return false
      default: return false
    }
  }

  const handleNext = () => {
    if (!canNext()) return
    setCompleted(prev => prev.includes(step) ? prev : [...prev, step])
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setStep(s => s - 1)
  }

  const allDone = step === 7

  return (
    <div ref={topRef} style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--accent)22',
          borderRadius: 10,
          padding: '6px 14px',
          marginBottom: 12,
          fontSize: 13,
          color: 'var(--accent)',
          fontWeight: 700,
        }}>
          🏆 CAPSTONE PROJECT
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 8 }}>
          Build Your Own PdM System
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, maxWidth: 680 }}>
          A complete 7-stage wizard. Choose an industry, connect data sources, build an ETL pipeline,
          clean and engineer features, train a model, and generate real predictions — just like a
          production ML engineer.
        </p>
      </div>

      {/* Progress bar */}
      <WizardProgressBar currentStep={step} completedSteps={completedSteps} />

      {/* Stage content */}
      <div style={{
        background: 'var(--bg-card)',
        border: '2px solid var(--border)',
        borderRadius: 20,
        padding: '32px',
        minHeight: 400,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <Stage1 plant={plant} setPlant={setPlant} />
            )}
            {step === 2 && (
              <Stage2 plant={plant} dataSources={dataSources} setDataSources={setDataSources} />
            )}
            {step === 3 && (
              <Stage3 plant={plant} dataSources={dataSources} etlSteps={etlSteps} setEtlSteps={setEtlSteps} />
            )}
            {step === 4 && (
              <Stage4 cleaningConfig={cleaningConfig} setCleaningConfig={setCleaningConfig} />
            )}
            {step === 5 && (
              <Stage5 features={features} setFeatures={setFeatures} />
            )}
            {step === 6 && (
              <Stage6 modelConfig={modelConfig} setModelConfig={setModelConfig} features={features} />
            )}
            {step === 7 && (
              <Stage7 plant={plant} modelConfig={modelConfig} features={features} predictions={predictions} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <NavButtons
          step={step}
          onBack={handleBack}
          onNext={handleNext}
          canNext={canNext()}
          nextLabel={step === 6 ? 'See Predictions →' : step === 7 ? '—' : 'Next →'}
        />

        {/* Requirement hint */}
        {!canNext() && step < 7 && (
          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>
            {step === 1 && 'Select a plant to continue'}
            {step === 2 && `Select ${Math.max(0, 2 - dataSources.length)} more data source(s) to continue`}
            {step === 3 && `Add ${Math.max(0, 3 - etlSteps.length)} more transform(s) and run ETL to continue`}
            {step === 4 && `Configure all 3 cleaning options to continue (${Object.keys(cleaningConfig).length}/3 done)`}
            {step === 5 && `Select ${Math.max(0, 5 - features.length)} more feature(s) to continue`}
            {step === 6 && 'Select an algorithm and prediction target, then train the model to continue'}
          </div>
        )}
      </div>

      {/* Summary card — shown once all stages complete */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 40 }}
          >
            <SummaryCard
              plant={plant}
              dataSources={dataSources}
              etlSteps={etlSteps}
              cleaningConfig={cleaningConfig}
              features={features}
              modelConfig={modelConfig}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hindi Summary — Capstone Pipeline HindiExplainer (always visible) */}
      <div style={{ marginTop: 40 }}>
        <HindiExplainer
          concept="पूरा PdM System कैसे बनाएं?"
          english="Building a Complete PdM System"
          explanation="एक complete Predictive Maintenance system बनाने में 7 steps होते हैं। पहले industry और plant choose करो — SteelForge हो, WindPower हो, या Hospital। फिर data sources connect करो — sensors, maintenance records, SCADA। ETL pipeline से data clean और merge करो। Data cleaning में missing values, outliers, और categories handle करो। Feature engineering में raw sensor data से meaningful signals निकालो — deviation, MTBF, rolling mean। ML model train करो — XGBoost, LightGBM, या Random Forest। Final predictions dashboard पर risk tiers दिखाओ और maintenance team को actionable alerts दो। यही है data science से engineering तक का सफर।"
          example="SteelForge factory: 8 pumps, 54,000 sensor records, 2.1 GB data। ETL के बाद: 42,500 rows × 28 columns। Features: vibration deviation, MTBF, rolling std। Model: LightGBM, AUC 0.97। Output: Pump P-03 CRITICAL (91%), immediate shutdown। Annual savings estimate: ₹4.2 Cr। यही है एक real production PdM system!"
          terms={[
            { hindi: 'ETL पाइपलाइन', english: 'ETL Pipeline', meaning: 'Extract-Transform-Load — multiple sources से data निकालो, clean करो, एक table में जोड़ो' },
            { hindi: 'फीचर इंजीनियरिंग', english: 'Feature Engineering', meaning: 'Raw sensor readings से ML-friendly signals बनाना — deviation, MTBF, trend slope' },
            { hindi: 'चैम्पियन मॉडल', english: 'Champion Model', meaning: 'Production में live चलने वाला best model — challenger से beat होने पर replace होता है' },
            { hindi: 'RUL', english: 'Remaining Useful Life', meaning: 'Machine के fail होने से पहले कितने दिन बचे हैं — regression से predict किया जाता है' },
            { hindi: 'जोखिम डैशबोर्ड', english: 'Risk Dashboard', meaning: 'Operations team का control room — CRITICAL/HIGH/MEDIUM/LOW machines एक नज़र में' },
          ]}
        />
      </div>

      {/* Hindi Summary */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: 32 }}
        >
          <HindiExplainer
            concept="पूरा PdM सिस्टम — एक नज़र में"
            english="Complete PdM Pipeline Summary"
            explanation={`तुमने अभी एक पूरा Predictive Maintenance system बनाया! सोचो जैसे एक factory में doctor रखा हो। पहले तुमने factory चुनी (${plant?.title || 'एक industry'})। फिर उसके sensors का data लिया — जैसे doctor blood test, X-ray, और pulse check करता है। ETL pipeline ने वो सारा data साफ किया और एक जगह जोड़ा। Data cleaning ने missing values भरे, outliers हटाए। Feature engineering में असली "symptoms" निकाले — जैसे vibration कितना बढ़ी, temperature baseline से कितना अलग है। फिर ML model ने इन symptoms से सीखा कि failure कब होगी। और अंत में — dashboard पर हर machine का "health report" दिखाई दिया, critical machines red में flashing!`}
            example="यह बिल्कुल वैसे ही है जैसे hospital में ICU monitor हर patient की heart rate, oxygen, और blood pressure track करता है — और अगर कोई sign बुरा हो तो alarm बज उठता है। बस यहाँ patient नहीं, machine है!"
            terms={[
              { hindi: 'ETL पाइपलाइन', english: 'ETL Pipeline', meaning: 'Extract (निकालो), Transform (बदलो), Load (जोड़ो) — raw data को model-ready बनाने की प्रक्रिया' },
              { hindi: 'फीचर इंजीनियरिंग', english: 'Feature Engineering', meaning: 'Raw sensor readings से meaningful signals निकालना — जैसे deviation, trend slope, MTBF' },
              { hindi: 'कन्फ्यूजन मैट्रिक्स', english: 'Confusion Matrix', meaning: 'Model की गलतियाँ दिखाने वाली table — कितने सही पकड़े, कितने miss किए' },
              { hindi: 'RUL', english: 'Remaining Useful Life', meaning: 'Machine के टूटने से पहले कितने दिन बचे हैं — regression से predict किया जाता है' },
              { hindi: 'जोखिम स्तर', english: 'Risk Tier', meaning: 'Critical/High/Medium/Low — failure probability के आधार पर machine का खतरे का level' },
            ]}
          />
        </motion.div>
      )}
    </div>
  )
}
