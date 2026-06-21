import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   ASSIGNMENT 2 — PCB Defect Detection System
   ================================================================
   Scenario-based case study: Students act as ML engineers building
   an AI-powered PCB quality inspection system to replace a legacy
   AOI system with 15% false positive rate.
   7 sections with sidebar navigation, multi-input form.
================================================================ */

const SECTIONS = [
  { id: 'failure', num: 1, title: 'Failure Mode Analysis', icon: '🔬' },
  { id: 'strategy', num: 2, title: 'Detection Strategy', icon: '🎯' },
  { id: 'imbalance', num: 3, title: 'Handling Class Imbalance', icon: '⚖️' },
  { id: 'augmentation', num: 4, title: 'Augmentation Design', icon: '🔄' },
  { id: 'training', num: 5, title: 'Training Analysis', icon: '📈' },
  { id: 'errors', num: 6, title: 'Error Analysis', icon: '🔍' },
  { id: 'production', num: 7, title: 'Production Integration', icon: '🏭' },
]

const DEFECT_TYPES = [
  { name: 'Missing Component', icon: '⬜', desc: 'Empty pad where component should be soldered', color: '#ef4444' },
  { name: 'Solder Bridge', icon: '🔗', desc: 'Unwanted solder connection between adjacent pins', color: '#f97316' },
  { name: 'Tombstoning', icon: '🪦', desc: 'Component stands up on one end instead of lying flat', color: '#eab308' },
  { name: 'Cold Solder Joint', icon: '❄️', desc: 'Dull, grainy solder that didn\'t properly melt', color: '#3b82f6' },
  { name: 'Wrong Polarity', icon: '🔄', desc: 'Component placed in correct position but rotated 180°', color: '#8b5cf6' },
  { name: 'Cracked Component', icon: '💔', desc: 'Visible fracture line across a chip or resistor', color: '#ec4899' },
]

const DETECTION_APPROACHES = [
  { id: 'single', title: 'Single Model', subtitle: 'One detection model for all defects', detail: 'Simpler, single inference pass, might struggle with diverse defect types' },
  { id: 'component', title: 'Component-Level Crops', subtitle: 'Crop each component, classify individually', detail: 'More precise, needs component location map, multiple inferences' },
  { id: 'twostage', title: 'Two-Stage Pipeline', subtitle: 'First detect components, then check each for defects', detail: 'Most accurate, slower, more complex training' },
  { id: 'hybrid', title: 'Hybrid', subtitle: 'Detection model + rules-based post-processing', detail: 'Combines ML flexibility with domain rules, needs engineering' },
]

const RESOLUTION_STRATEGIES = [
  { id: 'full', title: 'Full board image (4000×3000)', detail: 'Keeps global context but small defects may be invisible' },
  { id: 'tiled', title: 'Tiled regions (1024×1024 overlapping)', detail: 'Good balance of context and detail, needs overlap handling' },
  { id: 'crops', title: 'Component-level crops (256×256)', detail: 'Maximum detail per component, loses spatial context' },
  { id: 'pyramid', title: 'Multi-scale pyramid', detail: 'Best coverage, highest compute cost, complex assembly' },
]

const IMBALANCE_TECHNIQUES = [
  'Oversampling minority classes',
  'Undersampling majority class',
  'Weighted loss function',
  'Focal loss',
  'Data augmentation for minority classes',
  'Synthetic defect generation',
  'SMOTE / feature-space augmentation',
  'Collect more real defect samples',
]

const AUGMENTATION_TYPES = [
  'Horizontal Flip', 'Vertical Flip', '90° Rotation', 'Random Rotation (±45°)',
  'Color Jitter (±20%)', 'Gaussian Blur', 'Random Erase/Cutout', 'Perspective Warp',
  'Elastic Deformation', 'Brightness Shift', 'Mosaic (4-image combine)', 'Component Color Swap',
]

const TRAINING_FIX_OPTIONS = [
  'Early stopping at epoch 30',
  'Add dropout (0.3)',
  'Reduce model size',
  'Add more augmentation',
  'Use learning rate scheduler',
  'Increase training data',
]

const PREDICTION_EXAMPLES = [
  { id: 1, desc: 'Chip resistor, slightly tilted', pred: 'Tombstoning', conf: 72, actual: 'Good', correct: false, type: 'False Positive' },
  { id: 2, desc: 'QFP IC, bridge between pins 14-15', pred: 'Solder Bridge', conf: 95, actual: 'Solder Bridge', correct: true, type: 'Correct' },
  { id: 3, desc: '0402 capacitor, one pad empty', pred: 'Good', conf: 61, actual: 'Missing Component', correct: false, type: 'False Negative' },
  { id: 4, desc: 'Through-hole connector, grainy solder', pred: 'Cold Joint', conf: 88, actual: 'Cold Joint', correct: true, type: 'Correct' },
  { id: 5, desc: 'BGA chip, slight shadow on edge', pred: 'Cracked', conf: 67, actual: 'Good', correct: false, type: 'False Positive' },
  { id: 6, desc: 'SOIC chip, rotated 180°', pred: 'Wrong Polarity', conf: 91, actual: 'Wrong Polarity', correct: true, type: 'Correct' },
  { id: 7, desc: 'Electrolytic cap, hairline crack', pred: 'Good', conf: 54, actual: 'Cracked', correct: false, type: 'False Negative', dangerous: true },
  { id: 8, desc: 'LED, standing on one pad', pred: 'Tombstoning', conf: 97, actual: 'Tombstoning', correct: true, type: 'Correct' },
]

const INTEGRATION_STRATEGIES = [
  { id: 'replace', title: 'Replace existing AOI completely', pros: 'Clean cutover, no dual maintenance', cons: 'High risk if AI underperforms' },
  { id: 'parallel', title: 'Run parallel with AOI for 30 days', pros: 'Direct comparison data, safe', cons: 'Double compute cost, 30-day delay' },
  { id: 'secondpass', title: 'Use AI as second pass after AOI', pros: 'Catches AOI misses, low risk', cons: 'Doesn\'t reduce AOI false positives' },
  { id: 'aiprimary', title: 'AI primary + human review for low-confidence', pros: 'Best of both worlds, builds trust', cons: 'Needs confidence threshold tuning' },
]

const DISTRIBUTION_DATA = [
  { label: 'Good boards', pct: 85, count: '8,500/day', color: '#4ade80' },
  { label: 'Missing component', pct: 5, count: '500/day', color: '#ef4444' },
  { label: 'Solder bridge', pct: 4, count: '400/day', color: '#f97316' },
  { label: 'Tombstoning', pct: 3, count: '300/day', color: '#eab308' },
  { label: 'Wrong polarity', pct: 2, count: '200/day', color: '#8b5cf6' },
  { label: 'Cracked component', pct: 1, count: '100/day', color: '#ec4899' },
]

// SVG path generation for training curves
function generateSVGPath(points, width, height, padX = 40, padY = 20) {
  if (!points.length) return ''
  const xScale = (width - padX * 2) / (points.length - 1)
  return points.map((y, i) => {
    const x = padX + i * xScale
    const yPos = padY + (1 - y) * (height - padY * 2)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yPos.toFixed(1)}`
  }).join(' ')
}

const TRAIN_LOSS = [2.5, 2.1, 1.7, 1.35, 1.05, 0.82, 0.65, 0.52, 0.42, 0.34, 0.28, 0.24, 0.21, 0.19, 0.17, 0.16, 0.155, 0.15, 0.15, 0.15].map(v => v / 3)
const VAL_LOSS = [2.8, 2.3, 1.85, 1.45, 1.1, 0.85, 0.65, 0.52, 0.43, 0.38, 0.35, 0.35, 0.37, 0.39, 0.42, 0.45, 0.48, 0.51, 0.53, 0.55].map(v => v / 3)
const TRAIN_MAP = [0.1, 0.2, 0.32, 0.44, 0.55, 0.63, 0.7, 0.76, 0.8, 0.83, 0.86, 0.88, 0.9, 0.91, 0.93, 0.94, 0.945, 0.95, 0.955, 0.96]
const VAL_MAP = [0.08, 0.18, 0.3, 0.42, 0.53, 0.62, 0.69, 0.74, 0.78, 0.8, 0.82, 0.82, 0.81, 0.8, 0.79, 0.78, 0.77, 0.76, 0.75, 0.74]

// ─── STYLES ───
const s = {
  container: {
    display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-heading), system-ui, sans-serif',
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
  },
  sidebar: {
    width: 280, minWidth: 280, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
    padding: '24px 0', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0,
    height: '100vh', overflowY: 'auto',
  },
  sidebarTitle: {
    fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5,
    color: 'var(--text-secondary)', padding: '0 20px', marginBottom: 8,
  },
  sidebarItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
    borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
  }),
  sidebarNum: (active, done) => ({
    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
    background: done ? '#10b981' : active ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
    color: done ? '#fff' : active ? '#10b981' : 'var(--text-secondary)',
  }),
  main: {
    flex: 1, padding: '32px 40px', maxWidth: 900, margin: '0 auto',
  },
  card: {
    background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', padding: 28,
    marginBottom: 24,
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 28,
  },
  sectionTitle: {
    fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-heading)',
  },
  sectionDesc: {
    fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6,
  },
  label: {
    display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
    marginBottom: 10, lineHeight: 1.5,
  },
  textarea: (rows = 4) => ({
    width: '100%', minHeight: rows * 28, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px 16px', color: 'var(--text-primary)', fontSize: 14,
    fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.6,
    boxSizing: 'border-box',
  }),
  choiceCard: (selected) => ({
    background: selected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
    border: selected ? '2px solid #10b981' : '2px solid var(--border)',
    borderRadius: 14, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
  }),
  pill: (active, color) => ({
    display: 'inline-flex', alignItems: 'center', padding: '8px 16px', borderRadius: 20,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', margin: '4px 6px 4px 0',
    background: active ? (color || 'rgba(16, 185, 129, 0.15)') : 'var(--bg-secondary)',
    border: active ? `1.5px solid ${color || '#10b981'}` : '1.5px solid var(--border)',
    color: active ? '#fff' : 'var(--text-secondary)',
  }),
  btnPrimary: {
    background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none',
    borderRadius: 14, padding: '14px 32px', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'var(--font-heading)',
  },
  progressBar: {
    height: 6, background: 'var(--bg-secondary)', borderRadius: 3, margin: '0 20px 20px',
    overflow: 'hidden',
  },
  progressFill: (pct) => ({
    height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #06d6a0)',
    borderRadius: 3, transition: 'width 0.4s ease',
  }),
  scenarioCard: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 214, 160, 0.04))',
    border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 16, padding: 24, marginBottom: 24,
  },
  defectGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14,
    marginBottom: 28,
  },
  defectCard: (color) => ({
    background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 18px',
    borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 6,
  }),
}

// ─── SUB-COMPONENTS ───

function ScenarioCard() {
  return (
    <div style={s.scenarioCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>🏭</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>Mission Brief</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>
        You're a computer vision engineer at an electronics manufacturer producing{' '}
        <strong>10,000 PCBs daily</strong>. The current AOI system has a{' '}
        <strong style={{ color: '#ef4444' }}>15% false positive rate</strong>, causing unnecessary manual
        review and production delays. Your targets:
      </p>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'False Positive Target', value: '< 3%', color: '#10b981' },
          { label: 'Defect Catch Rate', value: '> 99%', color: '#3b82f6' },
          { label: 'Production', value: '24/7, 3 shifts', color: '#f59e0b' },
        ].map(t => (
          <div key={t.label} style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: '10px 16px',
            border: `1px solid ${t.color}30`, flex: '1 1 140px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.color }}>{t.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DistributionChart() {
  return (
    <div style={{ ...s.card, padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Daily Production Distribution</div>
      {DISTRIBUTION_DATA.map(d => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 140, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
            {d.label}
          </div>
          <div style={{ flex: 1, height: 24, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${d.pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: d.color, borderRadius: 6 }}
            />
          </div>
          <div style={{ width: 90, fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>
            {d.pct}% ({d.count})
          </div>
        </div>
      ))}
    </div>
  )
}

function LossChart({ width = 400, height = 200 }) {
  const trainPath = generateSVGPath(TRAIN_LOSS, width, height)
  const valPath = generateSVGPath(VAL_LOSS, width, height)
  const divergeX = 40 + (9 / 19) * (width - 80)
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 16, flex: 1, minWidth: 300 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Loss Curves</div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <path d={trainPath} fill="none" stroke="#10b981" strokeWidth="2.5" />
        <path d={valPath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 3" />
        <line x1={divergeX} y1={20} x2={divergeX} y2={height - 20} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
        <text x={divergeX + 4} y={16} fill="#f59e0b" fontSize="10" fontWeight="600">Divergence</text>
        {/* Legend */}
        <circle cx={40} cy={height - 6} r={4} fill="#10b981" />
        <text x={48} y={height - 2} fill="var(--text-secondary)" fontSize="10">Train</text>
        <circle cx={90} cy={height - 6} r={4} fill="#ef4444" />
        <text x={98} y={height - 2} fill="var(--text-secondary)" fontSize="10">Validation</text>
        {/* Y axis labels */}
        <text x={4} y={24} fill="var(--text-secondary)" fontSize="9">High</text>
        <text x={4} y={height - 18} fill="var(--text-secondary)" fontSize="9">Low</text>
      </svg>
    </div>
  )
}

function MAPChart({ width = 400, height = 200 }) {
  const trainPath = generateSVGPath(TRAIN_MAP, width, height)
  const valPath = generateSVGPath(VAL_MAP, width, height)
  const peakX = 40 + (10 / 19) * (width - 80)
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 16, flex: 1, minWidth: 300 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>mAP Over Epochs</div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <path d={trainPath} fill="none" stroke="#10b981" strokeWidth="2.5" />
        <path d={valPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="6 3" />
        <line x1={peakX} y1={20} x2={peakX} y2={height - 20} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
        <text x={peakX + 4} y={16} fill="#f59e0b" fontSize="10" fontWeight="600">Val peak 82%</text>
        {/* Legend */}
        <circle cx={40} cy={height - 6} r={4} fill="#10b981" />
        <text x={48} y={height - 2} fill="var(--text-secondary)" fontSize="10">Train mAP</text>
        <circle cx={120} cy={height - 6} r={4} fill="#3b82f6" />
        <text x={128} y={height - 2} fill="var(--text-secondary)" fontSize="10">Val mAP</text>
        {/* Y axis labels */}
        <text x={4} y={24} fill="var(--text-secondary)" fontSize="9">96%</text>
        <text x={4} y={height - 18} fill="var(--text-secondary)" fontSize="9">0%</text>
      </svg>
    </div>
  )
}

// ─── MAIN COMPONENT ───

export default function Assignment2_PCBQuality() {
  const [activeSection, setActiveSection] = useState('failure')
  const [responses, setResponses] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const updateResponse = (sectionId, fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [fieldId]: value },
    }))
  }

  const getResponse = (sectionId, fieldId, fallback = '') => {
    return responses[sectionId]?.[fieldId] ?? fallback
  }

  const sectionHasContent = (sectionId) => {
    const sec = responses[sectionId]
    if (!sec) return false
    return Object.values(sec).some(v =>
      Array.isArray(v) ? v.length > 0 : typeof v === 'object' ? Object.keys(v).length > 0 : v && v.toString().trim() !== ''
    )
  }

  const startedCount = SECTIONS.filter(sec => sectionHasContent(sec.id)).length
  const filledSections = SECTIONS.map(sec => ({
    ...sec,
    filled: sectionHasContent(sec.id),
  }))

  // Toggle helpers for multi-choice
  const toggleMultiChoice = (sectionId, fieldId, value) => {
    const current = getResponse(sectionId, fieldId, [])
    const arr = Array.isArray(current) ? current : []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    updateResponse(sectionId, fieldId, next)
  }

  // ─── SECTION RENDERERS ───

  const renderSection1 = () => (
    <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>🔬</span>
        <span style={s.sectionTitle}>Failure Mode Analysis</span>
      </div>
      <p style={s.sectionDesc}>Understand the defect landscape before building a detection system. Analyze what can go wrong on a PCB assembly line.</p>

      <ScenarioCard />

      <div style={{ ...s.card, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>6 PCB Defect Types</div>
        <div style={s.defectGrid}>
          {DEFECT_TYPES.map(d => (
            <div key={d.name} style={s.defectCard(d.color)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{d.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>
          For each defect type above, explain: (a) What causes it in the manufacturing process? (b) What's the risk if it reaches the customer? (c) How difficult is it to detect visually?
        </label>
        <textarea
          style={s.textarea(8)}
          placeholder="Analyze each of the 6 defect types systematically..."
          value={getResponse('failure', 'defect_analysis')}
          onChange={e => updateResponse('failure', 'defect_analysis', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>
          The current AOI system has 15% false positives. What do you think causes false positives in PCB inspection? List at least 3 possible causes.
        </label>
        <textarea
          style={s.textarea(4)}
          placeholder="What makes a good board look defective to a machine?"
          value={getResponse('failure', 'false_positive_causes')}
          onChange={e => updateResponse('failure', 'false_positive_causes', e.target.value)}
        />
      </div>
    </motion.div>
  )

  const renderSection2 = () => (
    <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>🎯</span>
        <span style={s.sectionTitle}>Detection Strategy</span>
      </div>
      <p style={s.sectionDesc}>Choose your technical approach for building the PCB defect detection pipeline.</p>

      <div style={s.card}>
        <label style={s.label}>Select your detection approach:</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 8 }}>
          {DETECTION_APPROACHES.map(a => (
            <motion.div
              key={a.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={s.choiceCard(getResponse('strategy', 'approach') === a.id)}
              onClick={() => updateResponse('strategy', 'approach', a.id)}
            >
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 13, color: '#10b981', marginBottom: 6 }}>{a.subtitle}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Justify your detection approach. What specific advantages does it have for PCB inspection? What's the main risk?
        </label>
        <textarea
          style={s.textarea(4)}
          placeholder="Explain why your chosen approach is optimal for this factory's needs..."
          value={getResponse('strategy', 'approach_justification')}
          onChange={e => updateResponse('strategy', 'approach_justification', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>Input resolution strategy:</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 8 }}>
          {RESOLUTION_STRATEGIES.map(r => (
            <motion.div
              key={r.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={s.choiceCard(getResponse('strategy', 'resolution') === r.id)}
              onClick={() => updateResponse('strategy', 'resolution', r.id)}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>
          PCBs have components ranging from 0.2mm (tiny resistors) to 15mm (large ICs). How does your resolution strategy handle this 75x size difference?
        </label>
        <textarea
          style={s.textarea(4)}
          placeholder="Address the multi-scale challenge in PCB inspection..."
          value={getResponse('strategy', 'resolution_justification')}
          onChange={e => updateResponse('strategy', 'resolution_justification', e.target.value)}
        />
      </div>
    </motion.div>
  )

  const renderSection3 = () => (
    <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>&#x2696;&#xFE0F;</span>
        <span style={s.sectionTitle}>Handling Class Imbalance</span>
      </div>
      <p style={s.sectionDesc}>Real-world defect data is highly imbalanced. Design a strategy to train effectively despite skewed class distributions.</p>

      <DistributionChart />

      <div style={s.card}>
        <label style={s.label}>Which techniques would you apply to handle this imbalance? (select all that apply)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {IMBALANCE_TECHNIQUES.map(t => {
            const selected = (getResponse('imbalance', 'techniques', []) || []).includes(t)
            return (
              <motion.button
                key={t}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  ...s.pill(selected, '#10b981'),
                  background: selected ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
                  color: selected ? '#10b981' : 'var(--text-secondary)',
                  border: selected ? '1.5px solid #10b981' : '1.5px solid var(--border)',
                }}
                onClick={() => toggleMultiChoice('imbalance', 'techniques', t)}
              >
                {selected ? '✓ ' : ''}{t}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Explain your class imbalance strategy in detail. Why did you choose these specific techniques? In what order would you apply them?
        </label>
        <textarea
          style={s.textarea(8)}
          placeholder="Detail your multi-step strategy for handling the 85/5/4/3/2/1 split..."
          value={getResponse('imbalance', 'strategy_detail')}
          onChange={e => updateResponse('imbalance', 'strategy_detail', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Cracked components are only 1% of defects but are the most dangerous (they can cause fires). How do you ensure the model catches nearly 100% of cracks despite having so few training samples?
        </label>
        <textarea
          style={s.textarea(4)}
          placeholder="This is a safety-critical class with minimal training data..."
          value={getResponse('imbalance', 'crack_strategy')}
          onChange={e => updateResponse('imbalance', 'crack_strategy', e.target.value)}
        />
      </div>
    </motion.div>
  )

  const renderSection4 = () => {
    const augStates = getResponse('augmentation', 'classifications', {})
    const cycleState = (name) => {
      const current = augStates[name] || 'unset'
      const next = current === 'unset' ? 'appropriate' : current === 'appropriate' ? 'harmful' : current === 'harmful' ? 'unsure' : 'appropriate'
      updateResponse('augmentation', 'classifications', { ...augStates, [name]: next })
    }
    const stateStyles = {
      unset: { bg: 'var(--bg-secondary)', border: 'var(--border)', color: 'var(--text-secondary)', label: 'Click to classify' },
      appropriate: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', color: '#10b981', label: 'Appropriate' },
      harmful: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#ef4444', label: 'Harmful' },
      unsure: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', color: '#f59e0b', label: 'Not sure' },
    }

    return (
      <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
        <div style={s.sectionHeader}>
          <span style={s.sectionIcon}>🔄</span>
          <span style={s.sectionTitle}>Augmentation Design</span>
        </div>
        <p style={s.sectionDesc}>Not all augmentations are appropriate for every domain. Classify each augmentation for PCB inspection use.</p>

        <div style={s.card}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { key: 'appropriate', label: 'Appropriate', color: '#10b981' },
              { key: 'harmful', label: 'Harmful', color: '#ef4444' },
              { key: 'unsure', label: 'Not sure', color: '#f59e0b' },
            ].map(l => (
              <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
            Click each augmentation to cycle: <strong>Appropriate</strong> &rarr; <strong>Harmful</strong> &rarr; <strong>Not sure</strong> &rarr; ...
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {AUGMENTATION_TYPES.map((aug, i) => {
              const state = augStates[aug] || 'unset'
              const st = stateStyles[state]
              return (
                <motion.button
                  key={aug}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => cycleState(aug)}
                  style={{
                    background: st.bg, border: `1.5px solid ${st.border}`, borderRadius: 12,
                    padding: '12px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{i + 1}. {aug}</span>
                  <span style={{ fontSize: 11, color: st.color, fontWeight: 600 }}>{st.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        <div style={s.card}>
          <label style={s.label}>
            For each augmentation you marked as harmful, explain specifically why it would create unrealistic training samples for PCB inspection.
          </label>
          <textarea
            style={s.textarea(8)}
            placeholder="Why would certain augmentations break the domain assumptions of PCB images?"
            value={getResponse('augmentation', 'harmful_explanation')}
            onChange={e => updateResponse('augmentation', 'harmful_explanation', e.target.value)}
          />
        </div>

        <div style={s.card}>
          <label style={s.label}>
            Would you apply the same augmentations to all defect classes, or different augmentations for different defects? Explain your reasoning.
          </label>
          <textarea
            style={s.textarea(4)}
            placeholder="Consider whether solder bridges need different augmentations than cracks..."
            value={getResponse('augmentation', 'per_class_strategy')}
            onChange={e => updateResponse('augmentation', 'per_class_strategy', e.target.value)}
          />
        </div>
      </motion.div>
    )
  }

  const renderSection5 = () => (
    <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>📈</span>
        <span style={s.sectionTitle}>Training Analysis</span>
      </div>
      <p style={s.sectionDesc}>Analyze these training curves from a PCB defect detection model and diagnose the problems.</p>

      <div style={{ ...s.card, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Training Scenario (60 epochs)</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <LossChart />
          <MAPChart />
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Epoch range: 0&ndash;60 (sampled at 20 points). Train loss continues to decrease while validation loss diverges after epoch ~30.
          Validation mAP peaks at 82% around epoch 30, then drops to 74% by epoch 60.
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Diagnose what's happening in these training curves. At what epoch does the problem start? Name the specific issue.
        </label>
        <textarea
          style={s.textarea(4)}
          placeholder="Identify the training pathology and its onset point..."
          value={getResponse('training', 'diagnosis')}
          onChange={e => updateResponse('training', 'diagnosis', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Propose exactly 3 changes to fix this problem. For each change, predict how it will affect the training curves.
        </label>
        <textarea
          style={s.textarea(8)}
          placeholder="Change 1: ...\nExpected effect: ...\n\nChange 2: ...\nExpected effect: ...\n\nChange 3: ...\nExpected effect: ..."
          value={getResponse('training', 'fixes')}
          onChange={e => updateResponse('training', 'fixes', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>If you could only implement ONE fix first, which would it be?</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 8 }}>
          {TRAINING_FIX_OPTIONS.map(opt => (
            <motion.div
              key={opt}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={s.choiceCard(getResponse('training', 'first_fix') === opt)}
              onClick={() => updateResponse('training', 'first_fix', opt)}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>{opt}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Why did you choose this as your first fix? What evidence from the charts supports this decision?
        </label>
        <textarea
          style={s.textarea(4)}
          placeholder="Link your choice to specific patterns in the loss and mAP curves..."
          value={getResponse('training', 'fix_justification')}
          onChange={e => updateResponse('training', 'fix_justification', e.target.value)}
        />
      </div>
    </motion.div>
  )

  const renderSection6 = () => (
    <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>🔍</span>
        <span style={s.sectionTitle}>Error Analysis</span>
      </div>
      <p style={s.sectionDesc}>Examine real model predictions. Understand failure patterns and prioritize improvements.</p>

      <div style={{ ...s.card, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Model Predictions on Test Set</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {PREDICTION_EXAMPLES.map(p => (
            <div key={p.id} style={{
              background: 'var(--bg-secondary)', borderRadius: 14, padding: '16px 18px',
              borderLeft: `4px solid ${p.correct ? '#10b981' : p.dangerous ? '#dc2626' : '#ef4444'}`,
              position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>#{p.id}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                  background: p.correct ? 'rgba(16, 185, 129, 0.15)' : p.dangerous ? 'rgba(220, 38, 38, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                  color: p.correct ? '#10b981' : p.dangerous ? '#dc2626' : '#ef4444',
                }}>
                  {p.correct ? '✅ ' : '❌ '}{p.type}{p.dangerous ? ' (DANGEROUS)' : ''}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, lineHeight: 1.4 }}>{p.desc}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Pred: </span>
                  <span style={{ fontWeight: 600 }}>{p.pred} ({p.conf}%)</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Actual: </span>
                  <span style={{ fontWeight: 600 }}>{p.actual}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>
          For each INCORRECT prediction (#1, #3, #5, #7), explain why the model likely made this mistake. What features might have confused it?
        </label>
        <textarea
          style={s.textarea(8)}
          placeholder="#1 — Tilted resistor as tombstoning: ...\n#3 — Missed empty pad: ...\n#5 — Shadow as crack: ...\n#7 — Missed hairline crack: ..."
          value={getResponse('errors', 'mistake_analysis')}
          onChange={e => updateResponse('errors', 'mistake_analysis', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Prediction #7 is a missed crack on an electrolytic capacitor — this could cause a fire. If you could only fix ONE model weakness, would you prioritize reducing false positives (like #1, #5) or false negatives (like #3, #7)? Justify with real-world consequences.
        </label>
        <textarea
          style={s.textarea(8)}
          placeholder="Consider the human and financial cost of each error type..."
          value={getResponse('errors', 'priority_justification')}
          onChange={e => updateResponse('errors', 'priority_justification', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>
          How would you use these error patterns to improve the next training iteration? Be specific about what data, augmentation, or architecture changes you'd make.
        </label>
        <textarea
          style={s.textarea(4)}
          placeholder="Translate error patterns into concrete training improvements..."
          value={getResponse('errors', 'improvement_plan')}
          onChange={e => updateResponse('errors', 'improvement_plan', e.target.value)}
        />
      </div>
    </motion.div>
  )

  const renderSection7 = () => (
    <motion.div key="s7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>🏭</span>
        <span style={s.sectionTitle}>Production Integration</span>
      </div>
      <p style={s.sectionDesc}>Your model is trained and validated. Now plan the real-world deployment in a 24/7 manufacturing environment.</p>

      <div style={s.card}>
        <label style={s.label}>Select your integration strategy:</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 8 }}>
          {INTEGRATION_STRATEGIES.map(st => (
            <motion.div
              key={st.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={s.choiceCard(getResponse('production', 'integration') === st.id)}
              onClick={() => updateResponse('production', 'integration', st.id)}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{st.title}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                <span style={{ color: '#10b981' }}>+</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{st.pros}</span>
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                <span style={{ color: '#ef4444' }}>&ndash;</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{st.cons}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={s.card}>
        <label style={s.label}>
          The factory runs 24/7 with 3 shifts. Operators have varying levels of trust in AI. How would you roll out the system to gain operator buy-in? Describe your deployment timeline.
        </label>
        <textarea
          style={s.textarea(8)}
          placeholder="Plan a phased rollout that builds trust with skeptical operators..."
          value={getResponse('production', 'rollout_plan')}
          onChange={e => updateResponse('production', 'rollout_plan', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Design a monitoring dashboard for the production team. What 5 metrics would you display and what threshold for each would trigger an alert?
        </label>
        <textarea
          style={s.textarea(8)}
          placeholder="Metric 1: ... (Alert threshold: ...)\nMetric 2: ... (Alert threshold: ...)\n..."
          value={getResponse('production', 'dashboard')}
          onChange={e => updateResponse('production', 'dashboard', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>
          After 3 months in production, the defect rate on a specific component type increases by 40% due to a new supplier. The model hasn't seen this component variant before. What's your incident response plan?
        </label>
        <textarea
          style={s.textarea(8)}
          placeholder="Design an incident response for model drift caused by a supply chain change..."
          value={getResponse('production', 'incident_response')}
          onChange={e => updateResponse('production', 'incident_response', e.target.value)}
        />
      </div>

      <div style={s.card}>
        <label style={s.label}>
          Write the acceptance criteria that must ALL be met before the AI system can run without human backup. List at least 5 specific, measurable criteria.
        </label>
        <textarea
          style={s.textarea(4)}
          placeholder="1. ... \n2. ...\n3. ...\n4. ...\n5. ..."
          value={getResponse('production', 'acceptance_criteria')}
          onChange={e => updateResponse('production', 'acceptance_criteria', e.target.value)}
        />
      </div>
    </motion.div>
  )

  const renderSubmitView = () => (
    <motion.div key="submit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>📋</span>
        <span style={s.sectionTitle}>Review & Submit</span>
      </div>
      <p style={s.sectionDesc}>Review your progress across all sections before submitting.</p>

      <div style={s.card}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Section Completion</div>
        {filledSections.map(sec => (
          <div key={sec.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 700,
              background: sec.filled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
              color: sec.filled ? '#10b981' : 'var(--text-secondary)',
            }}>
              {sec.filled ? '✓' : sec.num}
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{sec.title}</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
              background: sec.filled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: sec.filled ? '#10b981' : '#ef4444',
            }}>
              {sec.filled ? 'Started' : 'Empty'}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
          {startedCount}/7 sections have responses. {startedCount < 7 ? 'Complete all sections for the best feedback.' : 'All sections have content!'}
        </div>
      </div>

      {!submitted ? (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ ...s.btnPrimary, width: '100%', marginTop: 8 }}
          onClick={() => setSubmitted(true)}
        >
          Submit Assignment
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            ...s.card,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 214, 160, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center', padding: 40,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ fontSize: 48, marginBottom: 16 }}
          >
            &#x2705;
          </motion.div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#10b981' }}>
            Assignment Submitted!
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 16px' }}>
            Your responses will be reviewed by an AI instructor who will provide personalized feedback and guidance.
          </p>
          <div style={{
            display: 'inline-block', padding: '10px 20px', borderRadius: 10,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text-secondary)',
          }}>
            Scoring: Coming Soon — An LLM judge will evaluate your responses and provide detailed feedback.
          </div>
        </motion.div>
      )}
    </motion.div>
  )

  const SECTION_RENDERERS = {
    failure: renderSection1,
    strategy: renderSection2,
    imbalance: renderSection3,
    augmentation: renderSection4,
    training: renderSection5,
    errors: renderSection6,
    production: renderSection7,
    submit: renderSubmitView,
  }

  return (
    <div style={s.container}>
      {/* ─── SIDEBAR ─── */}
      <nav style={s.sidebar}>
        <div style={s.sidebarTitle}>PCB Quality Assignment</div>
        <div style={s.progressBar}>
          <div style={s.progressFill((startedCount / 7) * 100)} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '0 20px', marginBottom: 16 }}>
          {startedCount}/7 sections started
        </div>

        {SECTIONS.map(sec => {
          const done = sectionHasContent(sec.id)
          const active = activeSection === sec.id
          return (
            <motion.div
              key={sec.id}
              whileHover={{ x: 2 }}
              style={s.sidebarItem(active)}
              onClick={() => setActiveSection(sec.id)}
            >
              <div style={s.sidebarNum(active, done)}>
                {done ? '✓' : sec.num}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {sec.title}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Submit nav item */}
        <div style={{ marginTop: 'auto', padding: '12px 0 0' }}>
          <motion.div
            whileHover={{ x: 2 }}
            style={{
              ...s.sidebarItem(activeSection === 'submit'),
              borderTop: '1px solid var(--border)',
              marginTop: 8,
            }}
            onClick={() => setActiveSection('submit')}
          >
            <div style={{
              ...s.sidebarNum(activeSection === 'submit', submitted),
              background: submitted ? '#10b981' : activeSection === 'submit' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
              color: submitted ? '#fff' : activeSection === 'submit' ? '#10b981' : 'var(--text-secondary)',
            }}>
              {submitted ? '✓' : '→'}
            </div>
            <div style={{ fontSize: 13, fontWeight: activeSection === 'submit' ? 700 : 500 }}>
              Review & Submit
            </div>
          </motion.div>
        </div>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <main style={s.main}>
        <AnimatePresence mode="wait">
          {SECTION_RENDERERS[activeSection]?.()}
        </AnimatePresence>

        {/* Navigation buttons */}
        {activeSection !== 'submit' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingBottom: 40 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                ...s.btnPrimary,
                background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                opacity: activeSection === 'failure' ? 0.4 : 1,
                cursor: activeSection === 'failure' ? 'default' : 'pointer',
              }}
              onClick={() => {
                const idx = SECTIONS.findIndex(sec => sec.id === activeSection)
                if (idx > 0) setActiveSection(SECTIONS[idx - 1].id)
              }}
              disabled={activeSection === 'failure'}
            >
              &larr; Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={s.btnPrimary}
              onClick={() => {
                const idx = SECTIONS.findIndex(sec => sec.id === activeSection)
                if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].id)
                else setActiveSection('submit')
              }}
            >
              {activeSection === 'production' ? 'Review & Submit →' : 'Next →'}
            </motion.button>
          </div>
        )}
      </main>
    </div>
  )
}
