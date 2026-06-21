import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── DATA ─── */
const DEFECTS = [
  { id: 'orange_peel', name: 'Orange Peel', desc: 'Textured surface resembling orange skin' },
  { id: 'paint_run', name: 'Paint Run/Drip', desc: 'Visible drip marks from excess paint' },
  { id: 'fish_eye', name: 'Fish Eye', desc: 'Small circular craters in the paint surface' },
  { id: 'color_mismatch', name: 'Color Mismatch', desc: 'Slight color difference between panels' },
  { id: 'dust_inclusion', name: 'Dust Inclusion', desc: 'Tiny particles trapped under clear coat' },
  { id: 'scratch', name: 'Scratch', desc: 'Linear marks on the painted surface' },
  { id: 'solvent_pop', name: 'Solvent Pop', desc: 'Tiny bubbles/pinholes in the paint film' },
  { id: 'edge_chipping', name: 'Edge Chipping', desc: 'Paint missing at edges of panels' },
]
const CAMERAS = [
  { id: 'line_scan', label: 'Line Scan Camera', desc: 'Captures one pixel row at a time as the car moves. Ideal for continuous surfaces.' },
  { id: 'area_scan', label: 'Area Scan Camera', desc: 'Captures full 2D frames like a normal camera. Good for stationary inspection.' },
  { id: 'multi_cam', label: 'Multi-Camera Array', desc: 'Multiple cameras at different angles simultaneously. Higher cost, better coverage.' },
  { id: 'rotating', label: '360° Rotating Camera', desc: 'Single camera on a rotating arm. Full coverage but slower throughput.' },
]
const LIGHTS = [
  { id: 'dome', label: 'Diffuse Dome Lighting', desc: 'Even, shadow-free illumination from all angles. Minimizes specular reflections.' },
  { id: 'structured', label: 'Structured Light Patterns', desc: 'Projects known patterns to detect surface geometry and deformations.' },
  { id: 'led', label: 'Multi-Angle LED Arrays', desc: 'LEDs at various angles highlight different defect types. Configurable per defect.' },
  { id: 'natural', label: 'Natural + Supplemental', desc: 'Uses ambient light with fill LEDs. Lower cost but less consistent.' },
]
const RESOLUTIONS = [
  { v: 2, l: '2 MP', n: 'Fast processing, lower detail' },
  { v: 5, l: '5 MP', n: 'Balanced speed and detail' },
  { v: 12, l: '12 MP', n: 'High detail, moderate speed' },
  { v: 20, l: '20 MP', n: 'Maximum detail, slowest processing' },
]
const ANN_TYPES = [
  { id: 'bbox', label: 'Bounding Boxes', pros: 'Fast to annotate, simple, widely supported', cons: 'Includes background pixels, imprecise shape' },
  { id: 'polygon', label: 'Polygon Masks', pros: 'Follows defect shape, good precision', cons: 'Slower to annotate, requires skilled annotators' },
  { id: 'pixel', label: 'Pixel-Level Segmentation', pros: 'Most precise, exact defect area', cons: 'Very expensive and slow to annotate' },
  { id: 'classify', label: 'Classification Only', pros: 'Fastest annotation, simple pipeline', cons: 'No localization, cannot show where defect is' },
]
const APPROACHES = [
  { id: 'classify', label: 'Classification Only', what: 'Assigns a single label to the entire image.', when: 'When you only need to know IF a defect exists, not WHERE.', cx: 'Low' },
  { id: 'detection', label: 'Object Detection (YOLO)', what: 'Draws bounding boxes around each defect and classifies them.', when: 'When you need to locate and identify multiple defects per image.', cx: 'Medium' },
  { id: 'instance', label: 'Instance Segmentation', what: 'Provides pixel-precise masks for each individual defect.', when: 'When exact defect shape and area measurement matter.', cx: 'High' },
  { id: 'two_stage', label: 'Two-Stage (Detect + Classify)', what: 'First detects anomalous regions, then classifies each separately.', when: 'When defect types are subtle and require focused classification.', cx: 'High' },
]
const SIZES = [
  { id: 'nano', label: 'YOLOv8-nano', params: '3.2M', speed: '~1.5ms', map: '37.3 mAP' },
  { id: 'small', label: 'YOLOv8-small', params: '11.2M', speed: '~3ms', map: '44.9 mAP' },
  { id: 'medium', label: 'YOLOv8-medium', params: '25.9M', speed: '~6ms', map: '50.2 mAP' },
  { id: 'large', label: 'YOLOv8-large', params: '43.7M', speed: '~10ms', map: '52.9 mAP' },
]
const DEPLOYS = [
  { id: 'edge', label: 'Edge (GPU at line)', lat: '<10ms', cost: 'High upfront, low ongoing', rel: 'No network dependency, works offline' },
  { id: 'cloud', label: 'Cloud (remote server)', lat: '50-200ms', cost: 'Low upfront, pay-per-use', rel: 'Network dependent, single point of failure' },
  { id: 'hybrid', label: 'Hybrid (edge + cloud)', lat: '<10ms inference, async analytics', cost: 'Medium both', rel: 'Best of both, graceful degradation' },
]
const SPEEDS = ['<50ms', '<100ms', '<200ms', '<500ms']
const AUGS = ['Horizontal Flip', 'Rotation (±15°)', 'Color Jitter', 'Gaussian Blur', 'Mosaic', 'Mixup', 'Random Crop']
const CM = {
  labels: ['Good', 'Scratch', 'Run', 'FishEye'],
  data: [[180, 5, 3, 2], [8, 85, 2, 0], [12, 1, 62, 3], [15, 0, 4, 48]],
}
const SECTIONS = [
  { id: 'problem', num: 1, title: 'Understanding the Problem', icon: '📝' },
  { id: 'severity', num: 2, title: 'Defect Severity Classification', icon: '⚠️' },
  { id: 'data', num: 3, title: 'Data Collection Strategy', icon: '📷' },
  { id: 'annotation', num: 4, title: 'Annotation Strategy', icon: '🏷️' },
  { id: 'model', num: 5, title: 'Model Architecture', icon: '🧠' },
  { id: 'training', num: 6, title: 'Training Configuration', icon: '⚙️' },
  { id: 'results', num: 7, title: 'Results Interpretation', icon: '📊' },
  { id: 'deployment', num: 8, title: 'Deployment & Monitoring', icon: '🚀' },
]

/* ─── SHARED STYLES ─── */
const crd = {
  background: 'var(--bg-card)', borderRadius: 20,
  border: '1px solid var(--border)', padding: 28,
}
const ta = {
  width: '100%', background: 'var(--bg-secondary)',
  border: '1px solid var(--border)', borderRadius: 12,
  padding: '14px 16px', color: 'var(--text-primary)',
  fontFamily: 'inherit', fontSize: 15, lineHeight: 1.6,
  resize: 'none', outline: 'none', boxSizing: 'border-box',
}
const lb = {
  display: 'block', fontWeight: 600, color: 'var(--text-primary)',
  marginBottom: 10, fontSize: 15, lineHeight: 1.5,
}
const fadeSlide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: 'easeInOut' },
}

/* ─── HELPERS ─── */
function heatColor(v, mx) {
  const r = v / mx
  if (r > 0.7) return 'rgba(34,197,94,0.35)'
  if (r > 0.3) return 'rgba(250,204,21,0.25)'
  if (r > 0.05) return 'rgba(249,115,22,0.25)'
  return 'rgba(100,116,139,0.1)'
}

function hasFill(resp, sid) {
  const s = resp[sid]
  if (!s) return false
  return Object.values(s).some(v => {
    if (typeof v === 'string') return v.trim().length > 0
    if (typeof v === 'number') return true
    if (Array.isArray(v)) return v.length > 0
    if (v && typeof v === 'object') return Object.keys(v).length > 0
    return v != null && v !== ''
  })
}

/* ─── REUSABLE WIDGETS ─── */
function SeverityChip({ active, color, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
      border: `1px solid ${active ? color : 'var(--border)'}`,
      background: active ? `${color}22` : 'transparent',
      color: active ? color : 'var(--text-secondary)',
      fontWeight: active ? 600 : 400, transition: 'all 0.15s',
    }}>
      {children}
    </button>
  )
}

function OptBtn({ active, children, onClick, style: sx }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
      border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
      background: active ? 'rgba(6,182,212,0.1)' : 'var(--bg-secondary)',
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      fontWeight: active ? 600 : 400, ...sx,
    }}>
      {children}
    </button>
  )
}

function SelectCard({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...crd, padding: 16, cursor: 'pointer', textAlign: 'left', width: '100%',
      border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
      background: active ? 'rgba(6,182,212,0.06)' : 'var(--bg-secondary)',
    }}>
      {children}
    </button>
  )
}

function SectionHdr({ icon, title, desc }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <h2 style={{
          fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
          fontSize: 24, margin: 0,
        }}>{title}</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function Assignment1_PaintLine() {
  const [sec, setSec] = useState('problem')
  const [resp, setResp] = useState({})
  const [done, setDone] = useState(false)

  const put = (s, f, v) => setResp(p => ({ ...p, [s]: { ...p[s], [f]: v } }))
  const get = (s, f, d = '') => resp[s]?.[f] ?? d
  const filled = SECTIONS.filter(s => hasFill(resp, s.id)).length

  /* ── SUBMITTED STATE ── */
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}
        >
          <div style={{ fontSize: 72, marginBottom: 20 }}>&#10003;</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 32, marginBottom: 16 }}>
            Assignment Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Your responses will be reviewed by an AI instructor who will provide personalized feedback and guidance.
          </p>
          <div style={{ ...crd, textAlign: 'left', marginBottom: 24 }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              Submission Summary
            </h3>
            {SECTIONS.map(s => {
              const ok = hasFill(resp, s.id)
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: ok ? '#22c55e' : 'var(--text-secondary)', fontSize: 16 }}>{ok ? '✓' : '○'}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 24 }}>S{s.num}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{s.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: ok ? '#22c55e' : 'var(--text-secondary)' }}>
                    {ok ? 'Completed' : 'Skipped'}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ ...crd, background: 'var(--bg-secondary)', textAlign: 'left' }}>
            <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              Scoring: Coming Soon
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              An LLM judge will evaluate your responses and provide detailed feedback on your reasoning.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── SECTION MAP ── */
  const views = {
    problem: <S1 key="s1" g={get} s={put} />,
    severity: <S2 key="s2" g={get} s={put} />,
    data: <S3 key="s3" g={get} s={put} />,
    annotation: <S4 key="s4" g={get} s={put} />,
    model: <S5 key="s5" g={get} s={put} />,
    training: <S6 key="s6" g={get} s={put} />,
    results: <S7 key="s7" g={get} s={put} />,
    deployment: <S8 key="s8" g={get} s={put} />,
    submit: <SubmitView key="sub" resp={resp} onSubmit={() => setDone(true)} />,
  }

  /* ── MAIN LAYOUT ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 280, minWidth: 280, background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)', padding: '28px 0',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <div style={{ padding: '0 20px 20px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 18, margin: '0 0 4px' }}>
            Paint Line Inspector
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Assignment 1 &mdash; Case Study</p>
        </div>
        {/* Progress */}
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Progress</span>
            <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>{filled}/8 sections</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2 }}>
            <motion.div
              animate={{ width: `${(filled / 8) * 100}%` }}
              style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        {/* Nav items */}
        <nav style={{ flex: 1 }}>
          {SECTIONS.map(s => {
            const act = sec === s.id, ok = hasFill(resp, s.id)
            return (
              <button key={s.id} onClick={() => setSec(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '12px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: act ? 'var(--bg-secondary)' : 'transparent',
                borderLeft: act ? '3px solid var(--accent)' : '3px solid transparent',
              }}>
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: ok ? '#22c55e' : act ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: ok || act ? '#fff' : 'var(--text-secondary)',
                }}>
                  {ok ? '✓' : s.num}
                </span>
                <span style={{ fontSize: 14, color: act ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: act ? 600 : 400 }}>
                  {s.title}
                </span>
              </button>
            )
          })}
          {/* Submit button */}
          <button onClick={() => setSec('submit')} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '12px 20px', marginTop: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
            background: sec === 'submit' ? 'var(--bg-secondary)' : 'transparent',
            borderLeft: sec === 'submit' ? '3px solid var(--accent)' : '3px solid transparent',
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 14,
              background: sec === 'submit' ? 'var(--accent)' : 'var(--bg-secondary)',
              color: sec === 'submit' ? '#fff' : 'var(--text-secondary)',
            }}>&#10148;</span>
            <span style={{
              fontSize: 14, fontWeight: sec === 'submit' ? 600 : 400,
              color: sec === 'submit' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>Review &amp; Submit</span>
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 860, overflowY: 'auto' }}>
        <AnimatePresence mode="wait">{views[sec]}</AnimatePresence>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 1 — Understanding the Problem
   ═══════════════════════════════════════════════════════════════════ */
function S1({ g, s }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'📝'} title="Understanding the Problem"
        desc="Read the scenario carefully and demonstrate your understanding of the paint inspection challenge." />

      {/* Scenario Brief */}
      <div style={{
        ...crd, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.02))',
        border: '1px solid rgba(6,182,212,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>{'🏭'}</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-heading)' }}>
            Mission Brief
          </span>
        </div>
        <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
          You are an ML engineer at a <strong>luxury car manufacturer</strong>. The paint shop produces{' '}
          <strong>400 cars/day</strong> and currently relies on <strong>6 human inspectors</strong> working in
          shifts. They miss approximately <strong>8% of defects</strong>, costing <strong>$2.3M annually</strong>{' '}
          in warranty claims. You have been tasked with building a computer vision-based automated inspection system.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {[{ l: 'Throughput', v: '400 cars/day' }, { l: 'Current Staff', v: '6 inspectors' },
            { l: 'Miss Rate', v: '~8%' }, { l: 'Annual Cost', v: '$2.3M' }].map(m => (
            <div key={m.l} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 16px', flex: '1 1 120px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{m.l}</div>
              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 18, marginTop: 2 }}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>
          Before building anything, list all possible paint defect types you can think of that could occur
          in a car paint shop. For each defect type, describe how it would look visually and what might cause it.
        </label>
        <textarea rows={6} style={ta}
          placeholder="e.g., Orange peel - a bumpy texture that looks like the surface of an orange, caused by..."
          value={g('problem', 'defect_types')} onChange={e => s('problem', 'defect_types', e.target.value)} />
      </div>
      <div style={crd}>
        <label style={lb}>
          What are the biggest challenges in automating paint inspection compared to human inspectors?
        </label>
        <textarea rows={4} style={ta}
          placeholder="Think about lighting variability, subtle defects, different car colors..."
          value={g('problem', 'challenges')} onChange={e => s('problem', 'challenges', e.target.value)} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — Defect Severity Classification
   ═══════════════════════════════════════════════════════════════════ */
function S2({ g, s }) {
  const ratings = g('severity', 'ratings', {})
  const setR = (id, lv) => s('severity', 'ratings', { ...ratings, [id]: lv })
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'⚠️'} title="Defect Severity Classification"
        desc="Classify each defect type by severity. Think about customer impact, repair cost, and safety." />

      <div style={{ ...crd, marginBottom: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Defect Type', 'Description', 'Severity'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 2 ? 'center' : 'left', padding: '10px 12px',
                  color: 'var(--text-secondary)', fontSize: 13, borderBottom: '1px solid var(--border)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEFECTS.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 12, color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{d.name}</td>
                <td style={{ padding: 12, color: 'var(--text-secondary)', fontSize: 14 }}>{d.desc}</td>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {[['Critical', '#ef4444'], ['Major', '#f59e0b'], ['Minor', '#22c55e']].map(([lv, c]) => (
                      <SeverityChip key={lv} active={ratings[d.id] === lv} color={c} onClick={() => setR(d.id, lv)}>{lv}</SeverityChip>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={crd}>
        <label style={lb}>
          Explain your severity classification. What criteria did you use to decide what is critical vs minor?
          How does defect severity affect the inspection system's priorities?
        </label>
        <textarea rows={4} style={ta}
          placeholder="Consider customer visibility, repair cost, safety implications, frequency..."
          value={g('severity', 'explanation')} onChange={e => s('severity', 'explanation', e.target.value)} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — Data Collection Strategy
   ═══════════════════════════════════════════════════════════════════ */
function S3({ g, s }) {
  const cam = g('data', 'camera'), lit = g('data', 'lighting')
  const res = g('data', 'resolution'), ipc = g('data', 'images_per_class', 1000)

  const OptionGrid = ({ items, selected, field }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {items.map(c => (
        <SelectCard key={c.id} active={selected === c.id} onClick={() => s('data', field, c.id)}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c.label}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{c.desc}</div>
        </SelectCard>
      ))}
    </div>
  )

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'📷'} title="Data Collection Strategy"
        desc="Design the hardware setup and data acquisition plan for capturing paint surface images." />

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Camera Type</label>
        <OptionGrid items={CAMERAS} selected={cam} field="camera" />
      </div>
      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Lighting Setup</label>
        <OptionGrid items={LIGHTS} selected={lit} field="lighting" />
      </div>
      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Resolution</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {RESOLUTIONS.map(r => (
            <button key={r.v} onClick={() => s('data', 'resolution', r.v)} style={{
              padding: '10px 20px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', minWidth: 100,
              border: res === r.v ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: res === r.v ? 'rgba(6,182,212,0.1)' : 'var(--bg-secondary)',
              color: res === r.v ? 'var(--accent)' : 'var(--text-secondary)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{r.l}</div>
              <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>{r.n}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>Images per defect class: <span style={{ color: 'var(--accent)' }}>{ipc.toLocaleString()}</span></label>
        <input type="range" min={100} max={5000} step={100} value={ipc}
          onChange={e => s('data', 'images_per_class', Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
          <span>100</span><span>5,000</span>
        </div>
      </div>
      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>Justify your data collection choices. Why did you select this camera type and lighting setup?</label>
        <textarea rows={4} style={ta} placeholder="Consider throughput, cost, image quality, practical constraints..."
          value={g('data', 'justification')} onChange={e => s('data', 'justification', e.target.value)} />
      </div>
      <div style={crd}>
        <label style={lb}>How would you handle capturing rare defect types that only occur once every 500 cars?</label>
        <textarea rows={4} style={ta} placeholder="Think about data augmentation, synthetic data, transfer learning..."
          value={g('data', 'rare_defects')} onChange={e => s('data', 'rare_defects', e.target.value)} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — Annotation Strategy
   ═══════════════════════════════════════════════════════════════════ */
function S4({ g, s }) {
  const typ = g('annotation', 'type'), ac = g('annotation', 'annotator_count'), qc = g('annotation', 'quality_control')
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'🏷️'} title="Annotation Strategy"
        desc="Design the labeling workflow: annotation type, team size, and quality control processes." />

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Annotation Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {ANN_TYPES.map(a => (
            <SelectCard key={a.id} active={typ === a.id} onClick={() => s('annotation', 'type', a.id)}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{a.label}</div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#22c55e' }}>+</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 4 }}>{a.pros}</span>
              </div>
              <div style={{ fontSize: 12 }}>
                <span style={{ color: '#ef4444' }}>-</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 4 }}>{a.cons}</span>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>
      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Number of Annotators</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['1', '2-3', '4-6', '7+'].map(o => <OptBtn key={o} active={ac === o} onClick={() => s('annotation', 'annotator_count', o)}>{o}</OptBtn>)}
        </div>
      </div>
      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Quality Control</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['None', 'Single Review', 'Double Review', 'Consensus Voting'].map(o => (
            <OptBtn key={o} active={qc === o} onClick={() => s('annotation', 'quality_control', o)}>{o}</OptBtn>
          ))}
        </div>
      </div>
      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>How would you handle ambiguous defects where annotators disagree? Describe your quality control workflow.</label>
        <textarea rows={4} style={ta} placeholder="Think about inter-annotator agreement, escalation paths, consensus mechanisms..."
          value={g('annotation', 'ambiguity')} onChange={e => s('annotation', 'ambiguity', e.target.value)} />
      </div>
      <div style={crd}>
        <label style={lb}>You have a budget for 10,000 annotations. How would you distribute them across your defect classes? Why?</label>
        <textarea rows={4} style={ta} placeholder="Consider class imbalance, defect frequency, model performance requirements..."
          value={g('annotation', 'budget')} onChange={e => s('annotation', 'budget', e.target.value)} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — Model Architecture
   ═══════════════════════════════════════════════════════════════════ */
function S5({ g, s }) {
  const ap = g('model', 'approach'), sz = g('model', 'model_size')
  const showSize = ap === 'detection' || ap === 'instance'
  const cxColors = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' }

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'🧠'} title="Model Architecture"
        desc="Select your modeling approach and architecture. Consider the tradeoffs between accuracy, speed, and complexity." />

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Approach</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {APPROACHES.map(m => (
            <SelectCard key={m.id} active={ap === m.id} onClick={() => s('model', 'approach', m.id)}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{m.label}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5, margin: '0 0 6px' }}>{m.what}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5, margin: '0 0 6px', fontStyle: 'italic' }}>{m.when}</p>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: `${cxColors[m.cx]}22`, color: cxColors[m.cx],
              }}>{m.cx} complexity</span>
            </SelectCard>
          ))}
        </div>
      </div>

      {showSize && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ ...crd, marginBottom: 20 }}>
          <label style={{ ...lb, marginBottom: 14 }}>Model Size</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {SIZES.map(m => (
              <button key={m.id} onClick={() => s('model', 'model_size', m.id)} style={{
                padding: 14, borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                border: sz === m.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: sz === m.id ? 'rgba(6,182,212,0.08)' : 'var(--bg-secondary)',
              }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{m.label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{m.params} params</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{m.speed}</div>
                <div style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600, marginTop: 4 }}>{m.map}</div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>Defend your architecture choice. Why is this the best approach for paint defect inspection? What alternatives did you consider?</label>
        <textarea rows={6} style={ta} placeholder="Consider accuracy needs, speed requirements, defect localization, production constraints..."
          value={g('model', 'defense')} onChange={e => s('model', 'defense', e.target.value)} />
      </div>
      <div style={crd}>
        <label style={lb}>What preprocessing pipeline would you apply to paint surface images before feeding them to the model?</label>
        <textarea rows={4} style={ta} placeholder="Think about normalization, resizing, color space conversion, noise reduction..."
          value={g('model', 'preprocessing')} onChange={e => s('model', 'preprocessing', e.target.value)} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 6 — Training Configuration
   ═══════════════════════════════════════════════════════════════════ */
function S6({ g, s }) {
  const lr = g('training', 'learning_rate', 0.001)
  const bs = g('training', 'batch_size'), ep = g('training', 'epochs', 100)
  const imgSz = g('training', 'image_size'), opt = g('training', 'optimizer')
  const augs = g('training', 'augmentations', [])
  const toggleAug = a => s('training', 'augmentations', augs.includes(a) ? augs.filter(x => x !== a) : [...augs, a])

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'⚙️'} title="Training Configuration"
        desc="Configure the hyperparameters and training strategy for your model." />

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>Learning Rate: <span style={{ color: 'var(--accent)' }}>{Number(lr).toExponential(1)}</span></label>
        <input type="range" min={-4} max={-1} step={0.1} value={Math.log10(lr)}
          onChange={e => s('training', 'learning_rate', Math.pow(10, Number(e.target.value)))}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
          <span>0.0001</span><span>0.1</span>
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Batch Size</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[4, 8, 16, 32, 64].map(b => <OptBtn key={b} active={bs === b} onClick={() => s('training', 'batch_size', b)}>{b}</OptBtn>)}
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>Epochs: <span style={{ color: 'var(--accent)' }}>{ep}</span></label>
        <input type="range" min={10} max={300} step={5} value={ep}
          onChange={e => s('training', 'epochs', Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
          <span>10</span><span>300</span>
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Image Size</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[320, 416, 512, 640, 1024].map(z => <OptBtn key={z} active={imgSz === z} onClick={() => s('training', 'image_size', z)}>{z}</OptBtn>)}
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Optimizer</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['SGD', 'Adam', 'AdamW'].map(o => <OptBtn key={o} active={opt === o} onClick={() => s('training', 'optimizer', o)}>{o}</OptBtn>)}
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Augmentations</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AUGS.map(a => {
            const on = augs.includes(a)
            return (
              <button key={a} onClick={() => toggleAug(a)} style={{
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s',
                border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                background: on ? 'rgba(6,182,212,0.12)' : 'var(--bg-secondary)',
                color: on ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: on ? 600 : 400,
              }}>
                {on ? '✓ ' : ''}{a}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>Which augmentations did you enable and why? Are there any augmentations that would be HARMFUL for paint defect detection?</label>
        <textarea rows={4} style={ta} placeholder="Think about which augmentations preserve defect characteristics vs destroy them..."
          value={g('training', 'aug_explanation')} onChange={e => s('training', 'aug_explanation', e.target.value)} />
      </div>
      <div style={crd}>
        <label style={lb}>If training loss stops decreasing after epoch 50 but validation loss starts increasing, what would you do?</label>
        <textarea rows={4} style={ta} placeholder="Consider overfitting, learning rate scheduling, data quality, regularization..."
          value={g('training', 'debugging')} onChange={e => s('training', 'debugging', e.target.value)} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 7 — Results Interpretation
   ═══════════════════════════════════════════════════════════════════ */
function S7({ g, s }) {
  const mx = Math.max(...CM.data.flat())
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'📊'} title="Results Interpretation"
        desc="Analyze the model's performance using a confusion matrix and derived metrics from a test run." />

      {/* Confusion Matrix */}
      <div style={{ ...crd, marginBottom: 20, overflowX: 'auto' }}>
        <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: 16, marginBottom: 16 }}>
          Confusion Matrix (Test Set)
        </h3>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 520, margin: '0 auto' }}>
          <thead>
            <tr>
              <th style={{ padding: 8 }} />
              {CM.labels.map(l => (
                <th key={l} style={{ padding: '8px 6px', fontSize: 12, color: 'var(--accent)', fontWeight: 600, textAlign: 'center' }}>
                  Pred: {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CM.data.map((row, ri) => (
              <tr key={ri}>
                <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  True: {CM.labels[ri]}
                </td>
                {row.map((v, ci) => (
                  <td key={ci} style={{
                    padding: '14px 8px', textAlign: 'center', borderRadius: 6, fontSize: 16,
                    background: heatColor(v, mx), color: 'var(--text-primary)',
                    fontWeight: ri === ci ? 700 : 400, border: '2px solid var(--bg-card)',
                  }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Metrics */}
      <div style={{ ...crd, marginBottom: 20 }}>
        <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: 16, marginBottom: 14 }}>Derived Metrics</h3>
        <div style={{ display: 'inline-block', background: 'var(--bg-secondary)', borderRadius: 10, padding: '8px 18px', marginBottom: 16 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Overall Accuracy: </span>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 18 }}>86.7%</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[{ n: 'Scratch', p: '93.4%', r: '89.5%' }, { n: 'Run', p: '87.3%', r: '79.5%' }, { n: 'Fish Eye', p: '90.6%', r: '71.6%' }].map(m => (
            <div key={m.n} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{m.n}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
                Precision: <span style={{ color: '#22c55e', fontWeight: 600 }}>{m.p}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Recall: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{m.r}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>Analyze these results. Which defect class is the model struggling with most? What patterns do you see?</label>
        <textarea rows={6} style={ta} placeholder="Look at false negatives, false positives, confusion between specific classes..."
          value={g('results', 'analysis')} onChange={e => s('results', 'analysis', e.target.value)} />
      </div>
      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>
          The model confuses 15 "Fish Eye" defects as "Good". In a production setting, what is the business impact?
          Calculate the potential cost if 400 cars/day are inspected.
        </label>
        <textarea rows={4} style={ta} placeholder="Think about missed defect rate, warranty claims, customer satisfaction..."
          value={g('results', 'business_impact')} onChange={e => s('results', 'business_impact', e.target.value)} />
      </div>
      <div style={crd}>
        <label style={lb}>Propose 3 specific, actionable improvements to address the weaknesses you identified.</label>
        <textarea rows={6} style={ta} placeholder="Be specific: what data to collect, what architecture changes, what training tricks..."
          value={g('results', 'improvements')} onChange={e => s('results', 'improvements', e.target.value)} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 8 — Deployment & Monitoring
   ═══════════════════════════════════════════════════════════════════ */
function S8({ g, s }) {
  const dep = g('deployment', 'strategy'), spd = g('deployment', 'speed')
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'🚀'} title="Deployment & Monitoring"
        desc="Plan how the model will be deployed to the production paint line and monitored over time." />

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Deployment Strategy</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DEPLOYS.map(d => (
            <SelectCard key={d.id} active={dep === d.id} onClick={() => s('deployment', 'strategy', d.id)}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{d.label}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Latency: <strong style={{ color: 'var(--text-primary)' }}>{d.lat}</strong>
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Cost: <strong style={{ color: 'var(--text-primary)' }}>{d.cost}</strong>
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Reliability: <strong style={{ color: 'var(--text-primary)' }}>{d.rel}</strong>
                </span>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={{ ...lb, marginBottom: 14 }}>Inference Speed Requirement</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {SPEEDS.map(o => <OptBtn key={o} active={spd === o} onClick={() => s('deployment', 'speed', o)}>{o}</OptBtn>)}
        </div>
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>
          What happens when the model encounters a defect type it has never seen before?
          Design a fallback strategy.
        </label>
        <textarea rows={6} style={ta} placeholder="Think about anomaly detection, confidence thresholds, human-in-the-loop..."
          value={g('deployment', 'fallback')} onChange={e => s('deployment', 'fallback', e.target.value)} />
      </div>

      <div style={{ ...crd, marginBottom: 20 }}>
        <label style={lb}>
          Design a monitoring system for the deployed model. What metrics would you track?
          What thresholds would trigger alerts? How often should the model be retrained?
        </label>
        <textarea rows={6} style={ta} placeholder="Consider data drift, prediction distribution, latency, false negative rate..."
          value={g('deployment', 'monitoring')} onChange={e => s('deployment', 'monitoring', e.target.value)} />
      </div>

      <div style={crd}>
        <label style={lb}>
          Write a brief go-live checklist: what conditions must be met before you turn off human inspectors
          and run the CV system alone?
        </label>
        <textarea rows={4} style={ta} placeholder="Think about accuracy benchmarks, edge case coverage, safety requirements, rollback plans..."
          value={g('deployment', 'checklist')} onChange={e => s('deployment', 'checklist', e.target.value)} />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SUBMIT VIEW
   ═══════════════════════════════════════════════════════════════════ */
function SubmitView({ resp, onSubmit }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'✅'} title="Review & Submit"
        desc="Review your progress across all sections before submitting your assignment." />

      <div style={{ ...crd, marginBottom: 24 }}>
        {SECTIONS.map(sc => {
          const ok = hasFill(resp, sc.id)
          return (
            <div key={sc.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
                background: ok ? '#22c55e22' : 'var(--bg-secondary)',
                color: ok ? '#22c55e' : 'var(--text-secondary)',
              }}>
                {ok ? '✓' : sc.num}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 500 }}>{sc.icon} {sc.title}</div>
              </div>
              <span style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 500,
                background: ok ? '#22c55e15' : 'var(--bg-secondary)',
                color: ok ? '#22c55e' : 'var(--text-secondary)',
              }}>
                {ok ? 'Started' : 'Empty'}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          style={{
            padding: '16px 48px', borderRadius: 14, border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: 17, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-heading)', letterSpacing: 0.5,
          }}
        >
          Submit Assignment
        </motion.button>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
          You can submit even if some sections are incomplete. Empty sections will be marked as skipped.
        </p>
      </div>
    </motion.div>
  )
}
