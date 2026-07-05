import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ================================================================
   ASSIGNMENT 3 — Steel Mill Continuous Improvement
   ================================================================
   Scenario-based case study: students act as ML engineers diagnosing
   and fixing a steel surface defect detection system at Tata Steel.
   7 sections covering root cause analysis, data drift, retraining,
   cross-line deployment, edge architecture, monitoring, and business case.
================================================================ */

const SECTIONS = [
  { id: 'root-cause', num: 1, title: 'Root Cause Analysis', icon: '\u{1F50D}' },
  { id: 'data-drift', num: 2, title: 'Data Drift Investigation', icon: '\u{1F4CA}' },
  { id: 'retraining', num: 3, title: 'Retraining Strategy', icon: '\u{1F504}' },
  { id: 'cross-line', num: 4, title: 'Cross-Line Deployment', icon: '\u{1F3ED}' },
  { id: 'edge-deploy', num: 5, title: 'Edge Deployment Architecture', icon: '\u{1F5A5}' },
  { id: 'monitoring', num: 6, title: 'Monitoring & Maintenance', icon: '\u{1F4DF}' },
  { id: 'business', num: 7, title: 'Business Case & Go-Live', icon: '\u{1F4B0}' },
]

const DRIFT_TABLE = [
  { metric: 'Steel grades', old: 'HR440, HR550, HR780', current: 'HR440, HR550, HR780, DP780', changed: true },
  { metric: 'Surface roughness (Ra)', old: '1.2–2.8 μm', current: '1.2–4.1 μm', changed: true },
  { metric: 'Avg pixel intensity', old: '142 ± 18', current: '128 ± 31', changed: true },
  { metric: 'Defect distribution', old: 'Scratch 35%, Crack 25%, Pit 20%, Stain 15%, Inclusion 5%', current: 'Scratch 28%, Crack 20%, Pit 18%, Stain 12%, Inclusion 5%, Unknown 17%', changed: true },
  { metric: 'Images/day', old: '~4,800', current: '~5,200', changed: false },
  { metric: 'Lighting conditions', old: 'Consistent (new bulbs)', current: 'Variable (bulbs aging)', changed: true },
]

const MONITORING_OPTIONS = [
  'Input data distribution monitoring',
  'Prediction confidence distribution',
  'Per-class accuracy tracking',
  'Feature distribution comparison',
  'A/B testing with ground truth sampling',
  'Automated retraining triggers',
  'Human spot-check sampling',
]

const RETRAINING_STRATEGIES = [
  { id: 'finetune', label: 'Fine-tune existing model', desc: 'Start from current weights, train on new data', pros: 'Fast, preserves existing knowledge', cons: 'Risk of catastrophic forgetting' },
  { id: 'scratch', label: 'Retrain from scratch', desc: 'Full training on combined old + new data', pros: 'Thorough, clean training', cons: 'Slow, needs all original data' },
  { id: 'incremental', label: 'Incremental learning', desc: 'Continual learning approach, add new knowledge without forgetting', pros: 'Efficient, no forgetting', cons: 'Advanced, less proven in production' },
  { id: 'ensemble', label: 'Ensemble approach', desc: 'Keep old model + train new model for DP780, combine predictions', pros: 'Robust, modular', cons: 'Complex inference pipeline' },
]

const DEPLOY_APPROACHES = [
  { id: 'universal', label: 'One universal model for all lines', pros: 'Simple deployment, one model to maintain', cons: 'May not optimize for each line\'s unique characteristics' },
  { id: 'separate', label: 'Separate model per line', pros: 'Optimized for each setup', cons: '3x training/maintenance overhead' },
  { id: 'shared-backbone', label: 'Shared backbone + line-specific heads', pros: 'Balanced: shared features, line-specific tuning', cons: 'More complex architecture' },
  { id: 'domain-adapt', label: 'Domain adaptation from Line A to B & C', pros: 'Leverages existing model, minimal new data needed', cons: 'Adaptation quality depends on domain gap' },
]

const COMPUTE_PLATFORMS = [
  { id: 'jetson', label: 'NVIDIA Jetson AGX Orin', specs: 'GPU, 275 TOPS', cost: '~$2,000/unit', latency: '15–30ms', throughput: '30–60 FPS', reliability: 'High (edge, no network dependency)' },
  { id: 't4-server', label: 'NVIDIA T4 Server', specs: 'Data center GPU', cost: '~$8,000–12,000/server', latency: '5–15ms', throughput: '60–120 FPS', reliability: 'High (local server)' },
  { id: 'openvino', label: 'Intel OpenVINO on CPU', specs: 'CPU inference', cost: '~$1,500/unit', latency: '50–150ms', throughput: '10–20 FPS', reliability: 'High (no GPU dependencies)' },
  { id: 'cloud', label: 'Cloud API (AWS/Azure)', specs: 'Cloud GPU', cost: '~$0.50–1.50/hr', latency: '100–500ms', throughput: 'Scalable', reliability: 'Depends on internet' },
]

const RETRAIN_FREQ_OPTIONS = [
  { id: 'weekly', label: 'Weekly automatic' },
  { id: 'monthly', label: 'Monthly with review' },
  { id: 'drift', label: 'Triggered by drift detection' },
  { id: 'quarterly', label: 'Quarterly with full validation' },
]

const GO_LIVE_CHECKLIST = [
  'Model mAP exceeds 85% on all steel grades',
  'Validated on 1000+ production sheets with ground truth',
  'Inference latency under target on all lines',
  'Fallback to human inspection tested and working',
  'Night shift operators trained on the system',
  'Monitoring dashboard deployed and alerting works',
  'Rollback procedure documented and tested',
  'Legal/compliance review completed',
  '30-day parallel run with human inspection completed',
  'Maintenance runbook distributed to all shifts',
]

// ─── Shared styles ───
const textareaBase = {
  width: '100%', boxSizing: 'border-box', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px',
  fontFamily: 'inherit', fontSize: 15, lineHeight: 1.6, resize: 'none', outline: 'none',
}
const labelStyle = { fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'block', fontSize: 15, lineHeight: 1.5 }
const cardBase = { background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', padding: 28 }
const sectionAnim = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 }, transition: { duration: 0.35 } }

export default function Assignment3_SteelMill() {
  const [active, setActive] = useState(0)
  const [responses, setResponses] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const set = (section, field, value) => {
    setResponses(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }
  const get = (section, field, fallback = '') => responses[section]?.[field] ?? fallback

  const sectionHasContent = (idx) => {
    const sid = SECTIONS[idx].id
    const data = responses[sid]
    if (!data) return false
    return Object.values(data).some(v => (Array.isArray(v) ? v.length > 0 : typeof v === 'number' ? true : v && String(v).trim()))
  }
  const filledCount = SECTIONS.filter((_, i) => sectionHasContent(i)).length

  const toggleMulti = (section, field, val) => {
    const arr = get(section, field, [])
    set(section, field, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  // ─── Section renderers ───
  const renderSection1 = () => {
    const sid = 'root-cause'
    return (
      <motion.div key={sid} {...sectionAnim}>
        {/* Incident Briefing */}
        <div style={{ ...cardBase, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid #e74c3c44', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ background: '#e74c3c', color: '#fff', padding: '4px 14px', borderRadius: 6, fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>Performance Alert</span>
            <span style={{ color: '#e74c3c99', fontSize: 13 }}>Monthly Review</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'mAP Dropped', value: '82% → 71%', sub: '↓ 11 points', color: '#e74c3c' },
              { label: 'New Steel Grade', value: 'DP780', sub: 'Never in training data', color: '#f39c12' },
              { label: 'Timeline', value: '~6 weeks', sub: 'Degradation onset', color: '#3498db' },
              { label: 'Volume', value: '200 sheets/hr', sub: '3 shifts, 24/7', color: '#95a5a6' },
            ].map(m => (
              <div key={m.label} style={{ background: '#0d1117', borderRadius: 12, padding: 16, border: `1px solid ${m.color}33` }}>
                <div style={{ color: '#8892a4', fontSize: 12, marginBottom: 4 }}>{m.label}</div>
                <div style={{ color: m.color, fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{m.value}</div>
                <div style={{ color: '#5a6577', fontSize: 12, marginTop: 2 }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Clues */}
        <div style={{ ...cardBase, marginBottom: 24 }}>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: 18, margin: '0 0 16px' }}>Investigation Clues</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              'DP780 production started 7 weeks ago (15% of total output)',
              'Scratch detection precision dropped from 91% to 74%',
              'False positive rate on \'Good\' sheets doubled (from 3% to 6%)',
              'Night shift accuracy is 5% lower than day shift',
            ].map((clue, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', color: '#fff', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5 }}>{clue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>List ALL possible causes for the accuracy drop, ranked from most likely to least likely. Don't just list surface-level causes -- think about what specifically changed and why each could cause the observed symptoms.</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Rank your hypotheses from most to least likely..." value={get(sid, 'causes')} onChange={e => set(sid, 'causes', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>The night shift has 5% lower accuracy. This is NOT a model issue -- it's the same model. What environmental or operational factors could explain this?</label>
            <textarea style={{ ...textareaBase, minHeight: 120 }} rows={5} placeholder="Think about what changes between day and night shifts..." value={get(sid, 'nightShift')} onChange={e => set(sid, 'nightShift', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>If you could only investigate ONE cause first, which would it be and what data would you look at to confirm or rule it out?</label>
            <textarea style={{ ...textareaBase, minHeight: 120 }} rows={5} placeholder="Your priority investigation and evidence needed..." value={get(sid, 'priority')} onChange={e => set(sid, 'priority', e.target.value)} />
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSection2 = () => {
    const sid = 'data-drift'
    const monitorSelected = get(sid, 'monitoring', [])
    return (
      <motion.div key={sid} {...sectionAnim}>
        {/* Drift context */}
        <div style={{ ...cardBase, marginBottom: 20, borderLeft: '4px solid #f39c12', padding: '18px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            You pulled the training data distribution from 3 months ago and compared it against the current production data pipeline. The table below shows what changed. Your job: identify the most impactful shifts and explain how they caused the accuracy degradation.
          </p>
        </div>

        {/* Data comparison table */}
        <div style={{ ...cardBase, marginBottom: 24, overflowX: 'auto' }}>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: 18, margin: '0 0 16px' }}>Data Distribution Comparison</h3>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}>
            <thead>
              <tr>
                {['Metric', 'Original (3 months ago)', 'Current'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#8892a4', fontWeight: 600, borderBottom: '2px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 13, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DRIFT_TABLE.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{row.metric}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.old}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', color: row.changed ? '#e74c3c' : 'var(--text-secondary)', fontWeight: row.changed ? 600 : 400, background: row.changed ? '#e74c3c0a' : 'transparent' }}>{row.current}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>Analyze the data comparison above. What are the 3 most significant changes and how would each affect model performance? Be specific about which defect classes would be impacted.</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Identify the most impactful changes..." value={get(sid, 'analysis')} onChange={e => set(sid, 'analysis', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>17% of current defects are classified as 'Unknown'. What is this likely? How should the model handle defects it can't classify?</label>
            <textarea style={{ ...textareaBase, minHeight: 120 }} rows={5} placeholder="Consider what 'Unknown' means and how to handle it..." value={get(sid, 'unknown')} onChange={e => set(sid, 'unknown', e.target.value)} />
          </div>

          {/* Multi-choice pills */}
          <div>
            <label style={labelStyle}>Which monitoring metrics would have caught this drift BEFORE accuracy dropped?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {MONITORING_OPTIONS.map(opt => {
                const sel = monitorSelected.includes(opt)
                return (
                  <motion.button key={opt} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => toggleMulti(sid, 'monitoring', opt)}
                    style={{ padding: '10px 18px', borderRadius: 30, border: sel ? '2px solid var(--accent)' : '1px solid var(--border)', background: sel ? 'var(--accent)' : 'var(--bg-secondary)', color: sel ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: sel ? 600 : 400, transition: 'all 0.2s' }}>
                    {opt}
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Design an automated drift detection system. How would it work? What thresholds would trigger alerts?</label>
            <textarea style={{ ...textareaBase, minHeight: 120 }} rows={5} placeholder="Describe your drift detection architecture..." value={get(sid, 'driftSystem')} onChange={e => set(sid, 'driftSystem', e.target.value)} />
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSection3 = () => {
    const sid = 'retraining'
    const chosen = get(sid, 'strategy', '')
    return (
      <motion.div key={sid} {...sectionAnim}>
        {/* Retraining context */}
        <div style={{ ...cardBase, marginBottom: 20, borderLeft: '4px solid #2ecc71', padding: '18px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            You've identified the root causes and characterized the data drift. Now you need to decide <strong style={{ color: 'var(--text-primary)' }}>how to fix the model</strong>. There's no single right answer -- each strategy has trade-offs in speed, risk, and resource requirements. Think carefully about your production constraints: 24/7 operation, 200 sheets/hour, zero-tolerance for extended downtime.
          </p>
        </div>

        {/* Strategy cards */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ ...labelStyle, marginBottom: 16 }}>Choose your retraining strategy</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {RETRAINING_STRATEGIES.map(s => {
              const sel = chosen === s.id
              return (
                <motion.div key={s.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => set(sid, 'strategy', s.id)}
                  style={{ ...cardBase, padding: 20, cursor: 'pointer', border: sel ? '2px solid var(--accent)' : '1px solid var(--border)', background: sel ? 'var(--accent)11' : 'var(--bg-card)', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: 15 }}>{s.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>{s.desc}</div>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: '#2ecc71' }}>+ {s.pros}</span><br />
                    <span style={{ color: '#e74c3c' }}>- {s.cons}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>Justify your retraining strategy. Specifically address: How do you prevent the model from forgetting how to detect defects on the original steel grades?</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Explain your choice and forgetting mitigation..." value={get(sid, 'justification')} onChange={e => set(sid, 'justification', e.target.value)} />
          </div>

          {/* Data mix sliders */}
          <div style={{ ...cardBase }}>
            <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: 16, margin: '0 0 20px' }}>Design Your Retraining Data Mix</h3>
            {[
              { id: 'mixOriginal', label: 'Original training data', def: 60 },
              { id: 'mixDP780', label: 'New DP780 data', def: 25 },
              { id: 'mixHard', label: 'Hard examples from production', def: 10 },
              { id: 'mixSynthetic', label: 'Synthetic / augmented data', def: 5 },
            ].map(s => {
              const val = get(sid, s.id, s.def)
              return (
                <div key={s.id} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{s.label}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>{val}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={val} onChange={e => set(sid, s.id, Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }} />
                </div>
              )
            })}
          </div>

          <div>
            <label style={labelStyle}>How many new DP780 images do you need before retraining is viable? Show your reasoning -- consider the number of defect classes, images per class, and statistical significance.</label>
            <textarea style={{ ...textareaBase, minHeight: 120 }} rows={5} placeholder="Calculate minimum viable training data..." value={get(sid, 'dataCount')} onChange={e => set(sid, 'dataCount', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>After retraining, how would you validate the new model BEFORE deploying it to production? Describe your validation protocol step by step.</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Step-by-step validation protocol..." value={get(sid, 'validation')} onChange={e => set(sid, 'validation', e.target.value)} />
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSection4 = () => {
    const sid = 'cross-line'
    const chosenApproach = get(sid, 'approach', '')
    const lines = [
      { name: 'Line A (Current)', status: 'ACTIVE', camera: '4K area scan, top-mounted', lighting: 'LED bar array, 5000K', speed: '200 sheets/hour', distance: '50cm from surface', color: '#3498db' },
      { name: 'Line B (New)', status: 'PENDING', camera: '8K line scan, side-angle', lighting: 'Halogen flood, 3200K', speed: '350 sheets/hour', distance: '80cm from surface', color: '#f39c12' },
      { name: 'Line C (New)', status: 'PENDING', camera: '2x 4K stereo pair, overhead', lighting: 'Structured light projector, 6500K', speed: '150 sheets/hour', distance: '40cm from surface', color: '#2ecc71' },
    ]
    return (
      <motion.div key={sid} {...sectionAnim}>
        {/* Cross-line context */}
        <div style={{ ...cardBase, marginBottom: 20, borderLeft: '4px solid #3498db', padding: '18px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Management approved the model fix -- now they want to <strong style={{ color: 'var(--text-primary)' }}>scale to 2 additional production lines</strong>. But these lines have completely different camera setups, lighting, and speeds. A model trained for one line won't automatically work on another. Review the specifications below and design your cross-line deployment strategy.
          </p>
        </div>

        {/* Production line comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {lines.map(l => (
            <div key={l.name} style={{ ...cardBase, padding: 22, borderTop: `4px solid ${l.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h4 style={{ color: l.color, fontFamily: 'var(--font-heading)', margin: 0, fontSize: 16 }}>{l.name}</h4>
                <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: l.status === 'ACTIVE' ? '#2ecc7122' : '#f39c1222', color: l.status === 'ACTIVE' ? '#2ecc71' : '#f39c12' }}>{l.status}</span>
              </div>
              {[
                { k: 'Camera', v: l.camera },
                { k: 'Lighting', v: l.lighting },
                { k: 'Speed', v: l.speed },
                { k: 'Distance', v: l.distance },
              ].map(spec => (
                <div key={spec.k} style={{ marginBottom: 10 }}>
                  <div style={{ color: '#8892a4', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{spec.k}</div>
                  <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>{spec.v}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Deployment approach */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ ...labelStyle, marginBottom: 14 }}>Deployment approach</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {DEPLOY_APPROACHES.map(a => {
              const sel = chosenApproach === a.id
              return (
                <motion.div key={a.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => set(sid, 'approach', a.id)}
                  style={{ ...cardBase, padding: 18, cursor: 'pointer', border: sel ? '2px solid var(--accent)' : '1px solid var(--border)', background: sel ? 'var(--accent)11' : 'var(--bg-card)', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: 14 }}>{a.label}</div>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: '#2ecc71' }}>+ {a.pros}</span><br />
                    <span style={{ color: '#e74c3c' }}>- {a.cons}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>The cameras on Line B are side-angle instead of top-down. How does this affect defect appearance? What preprocessing would you need?</label>
            <textarea style={{ ...textareaBase, minHeight: 120 }} rows={5} placeholder="Consider perspective distortion, shadow patterns..." value={get(sid, 'sideAngle')} onChange={e => set(sid, 'sideAngle', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Line B runs at 350 sheets/hour -- 75% faster than Line A. What are the implications for inference speed? Calculate the maximum inference time per sheet.</label>
            <textarea style={{ ...textareaBase, minHeight: 120 }} rows={5} placeholder="Show your timing calculations..." value={get(sid, 'inferenceSpeed')} onChange={e => set(sid, 'inferenceSpeed', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Would you deploy all 3 lines simultaneously or roll out one at a time? Describe your phased deployment plan.</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Detail your rollout plan with timeline..." value={get(sid, 'rollout')} onChange={e => set(sid, 'rollout', e.target.value)} />
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSection5 = () => {
    const sid = 'edge-deploy'
    const chosenPlatform = get(sid, 'platform', '')
    return (
      <motion.div key={sid} {...sectionAnim}>
        {/* Edge deployment context */}
        <div style={{ ...cardBase, marginBottom: 20, borderLeft: '4px solid #9b59b6', padding: '18px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Your model works -- now you need to <strong style={{ color: 'var(--text-primary)' }}>deploy it in a real factory environment</strong>. This isn't a cloud demo. The factory floor is hot, dusty, and the internet connection is unreliable. Every second of downtime means uninspected steel leaving the facility. Choose your hardware, design your architecture, and plan for failure.
          </p>
        </div>

        {/* Compute platform selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ ...labelStyle, marginBottom: 14 }}>Select compute platform for each production line</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {COMPUTE_PLATFORMS.map(p => {
              const sel = chosenPlatform === p.id
              return (
                <motion.div key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => set(sid, 'platform', p.id)}
                  style={{ ...cardBase, padding: 20, cursor: 'pointer', border: sel ? '2px solid var(--accent)' : '1px solid var(--border)', background: sel ? 'var(--accent)11' : 'var(--bg-card)', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontSize: 15 }}>{p.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 12 }}>{p.specs}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                    <div><span style={{ color: '#8892a4' }}>Cost:</span> <span style={{ color: 'var(--text-primary)' }}>{p.cost}</span></div>
                    <div><span style={{ color: '#8892a4' }}>Latency:</span> <span style={{ color: 'var(--text-primary)' }}>{p.latency}</span></div>
                    <div><span style={{ color: '#8892a4' }}>Throughput:</span> <span style={{ color: 'var(--text-primary)' }}>{p.throughput}</span></div>
                    <div><span style={{ color: '#8892a4' }}>Reliability:</span> <span style={{ color: 'var(--text-primary)' }}>{p.reliability}</span></div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Architecture config */}
        <div style={{ ...cardBase, marginBottom: 24 }}>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: 16, margin: '0 0 20px' }}>System Architecture Design</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { id: 'inferLoc', label: 'Inference location', opts: ['Edge (at camera)', 'Local server (on premises)', 'Cloud'] },
              { id: 'redundancy', label: 'Redundancy', opts: ['None', 'Hot standby', 'Load balanced pair'] },
              { id: 'fallback', label: 'Fallback strategy', opts: ['Stop line', 'Human inspection', 'Pass all', 'Buffer and retry'] },
              { id: 'modelFmt', label: 'Model format', opts: ['PyTorch', 'ONNX', 'TensorRT', 'OpenVINO IR'] },
            ].map(cfg => (
              <div key={cfg.id}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8, fontWeight: 600 }}>{cfg.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {cfg.opts.map(opt => {
                    const sel = get(sid, cfg.id) === opt
                    return (
                      <motion.button key={opt} whileTap={{ scale: 0.97 }}
                        onClick={() => set(sid, cfg.id, opt)}
                        style={{ padding: '8px 14px', borderRadius: 8, border: sel ? '1px solid var(--accent)' : '1px solid var(--border)', background: sel ? 'var(--accent)22' : 'transparent', color: sel ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontWeight: sel ? 600 : 400, transition: 'all 0.2s' }}>
                        {opt}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>The factory is in a remote location with unreliable internet (drops 2-3 times per week for 10-30 minutes). How does this affect your architecture choice? What's your offline strategy?</label>
            <textarea style={{ ...textareaBase, minHeight: 120 }} rows={5} placeholder="Address connectivity challenges..." value={get(sid, 'offline')} onChange={e => set(sid, 'offline', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Calculate the total hardware cost for all 3 lines with your chosen setup. Factor in: compute hardware, cameras (if new ones needed), networking, installation. Is this within a reasonable ROI?</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Itemized cost estimate with ROI analysis..." value={get(sid, 'costCalc')} onChange={e => set(sid, 'costCalc', e.target.value)} />
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSection6 = () => {
    const sid = 'monitoring'
    const chosenFreq = get(sid, 'retrainFreq', '')
    return (
      <motion.div key={sid} {...sectionAnim}>
        {/* Monitoring context */}
        <div style={{ ...cardBase, marginBottom: 20, borderLeft: '4px solid #e67e22', padding: '18px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Deployment is just the beginning. The original system degraded from 82% to 71% because <strong style={{ color: 'var(--text-primary)' }}>nobody was watching</strong>. This time, you need a monitoring strategy that catches problems before they become incidents. Design dashboards, alerting thresholds, automated retraining, and operator runbooks.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          {/* Monitoring dashboard design */}
          <div>
            <label style={labelStyle}>Design a production monitoring dashboard. For each metric, specify: warning threshold, critical threshold, and recommended action.</label>
            <div style={{ ...cardBase, padding: 20, marginBottom: 12, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Metric', 'Warning Level', 'Critical Level', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#8892a4', fontWeight: 600, borderBottom: '2px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 12, letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Overall mAP', 'Per-class precision', 'Per-class recall', 'Inference latency', 'False positive rate', 'Input data distribution', 'Model confidence distribution'].map(m => (
                    <tr key={m}>
                      <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontSize: 13 }}>{m}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', color: '#f39c12', fontSize: 12 }}>Define in response below</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', color: '#e74c3c', fontSize: 12 }}>Define in response below</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12 }}>Define in response below</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="For each metric, specify thresholds and actions. Example:&#10;Overall mAP | Warning: < 80% | Critical: < 75% | Action: Trigger drift investigation..." value={get(sid, 'dashboard')} onChange={e => set(sid, 'dashboard', e.target.value)} />
          </div>

          {/* Retraining frequency */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 12 }}>Retraining frequency</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {RETRAIN_FREQ_OPTIONS.map(opt => {
                const sel = chosenFreq === opt.id
                return (
                  <motion.button key={opt.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => set(sid, 'retrainFreq', opt.id)}
                    style={{ padding: '12px 22px', borderRadius: 12, border: sel ? '2px solid var(--accent)' : '1px solid var(--border)', background: sel ? 'var(--accent)' : 'var(--bg-secondary)', color: sel ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: sel ? 600 : 400, transition: 'all 0.2s' }}>
                    {opt.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>You want to implement active learning -- the model flags uncertain predictions for human review, and those labels are used for retraining. Design this feedback loop: How do you select samples? How many per day? How do you prevent bias in the selection?</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Design your active learning feedback loop..." value={get(sid, 'activeLearning')} onChange={e => set(sid, 'activeLearning', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Write a maintenance runbook for the night shift operator. They need to know: When to restart the system, how to verify it's working correctly, when to escalate to the ML team, and what to do if accuracy drops suddenly.</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Step-by-step runbook for operators..." value={get(sid, 'runbook')} onChange={e => set(sid, 'runbook', e.target.value)} />
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSection7 = () => {
    const sid = 'business'
    const inspectors = get(sid, 'inspectors', 8)
    const salary = get(sid, 'salary', 45000)
    const warrantyCost = get(sid, 'warrantyCost', 2000000)
    const currentMiss = get(sid, 'currentMiss', 8)
    const aiMiss = get(sid, 'aiMiss', 1)
    const hwCost = get(sid, 'hwCost', 200000)
    const maintCost = get(sid, 'maintCost', 40000)

    // Live calculations
    const reductionPct = 0.6 // assume 60% reduction in inspectors needed
    const inspectorSavings = Math.round(inspectors * salary * reductionPct)
    const qualityImprovementCalc = currentMiss > 0 ? Math.round(warrantyCost * ((currentMiss - aiMiss) / currentMiss)) : 0
    const totalAnnualSavings = inspectorSavings + qualityImprovementCalc
    const totalCosts = hwCost + maintCost
    const roi = totalCosts > 0 ? ((totalAnnualSavings - totalCosts) / totalCosts * 100).toFixed(0) : 0
    const monthlySavings = totalAnnualSavings / 12
    const paybackMonths = monthlySavings > 0 ? (hwCost / monthlySavings).toFixed(1) : 'N/A'

    const goLiveSelected = get(sid, 'goLive', [])

    return (
      <motion.div key={sid} {...sectionAnim}>
        {/* Business context */}
        <div style={{ ...cardBase, marginBottom: 20, borderLeft: '4px solid #f1c40f', padding: '18px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            The plant manager needs numbers before approving go-live. Use the interactive calculator below to build your business case. Adjust the inputs to match your assumptions, review the ROI, and then write the executive summary that will get this project approved.
          </p>
        </div>

        {/* Cost-Benefit Calculator */}
        <div style={{ ...cardBase, marginBottom: 24, background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))' }}>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: 18, margin: '0 0 24px' }}>Cost-Benefit Calculator</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>
            {/* Sliders */}
            <div>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Inputs</h4>
              {[
                { id: 'inspectors', label: 'Current manual inspectors', min: 4, max: 20, val: inspectors, fmt: v => v },
                { id: 'salary', label: 'Inspector annual salary', min: 30000, max: 80000, step: 5000, val: salary, fmt: v => `$${(v / 1000).toFixed(0)}K` },
                { id: 'warrantyCost', label: 'Annual defect-related warranty cost', min: 500000, max: 5000000, step: 100000, val: warrantyCost, fmt: v => `$${(v / 1000000).toFixed(1)}M` },
                { id: 'currentMiss', label: 'Current defect miss rate', min: 1, max: 15, val: currentMiss, fmt: v => `${v}%` },
                { id: 'aiMiss', label: 'Expected AI miss rate', min: 0.1, max: 5, step: 0.1, val: aiMiss, fmt: v => `${v}%` },
                { id: 'hwCost', label: 'Hardware + deployment cost', min: 50000, max: 500000, step: 10000, val: hwCost, fmt: v => `$${(v / 1000).toFixed(0)}K` },
                { id: 'maintCost', label: 'Annual maintenance cost', min: 20000, max: 100000, step: 5000, val: maintCost, fmt: v => `$${(v / 1000).toFixed(0)}K` },
              ].map(s => (
                <div key={s.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.label}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>{s.fmt(s.val)}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step || 1} value={s.val}
                    onChange={e => set(sid, s.id, Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }} />
                </div>
              ))}
            </div>

            {/* Results */}
            <div>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Calculated Results</h4>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { label: 'Annual inspector savings', value: `$${inspectorSavings.toLocaleString()}`, sub: `${inspectors} inspectors × $${salary.toLocaleString()} × ${(reductionPct * 100).toFixed(0)}% reduction`, color: '#2ecc71' },
                  { label: 'Annual quality improvement', value: `$${qualityImprovementCalc.toLocaleString()}`, sub: `$${(warrantyCost/1e6).toFixed(1)}M × (${currentMiss}% - ${aiMiss}%) / ${currentMiss}%`, color: '#2ecc71' },
                  { label: 'Total annual savings', value: `$${totalAnnualSavings.toLocaleString()}`, sub: 'Inspector savings + quality improvement', color: '#f39c12' },
                  { label: 'ROI (first year)', value: `${roi}%`, sub: `(Savings - Costs) / Costs`, color: Number(roi) > 0 ? '#2ecc71' : '#e74c3c' },
                  { label: 'Payback period', value: `${paybackMonths} months`, sub: `Hardware cost / monthly savings`, color: '#3498db' },
                ].map(r => (
                  <div key={r.label} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
                    <div style={{ color: '#8892a4', fontSize: 12, marginBottom: 4 }}>{r.label}</div>
                    <div style={{ color: r.color, fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{r.value}</div>
                    <div style={{ color: '#5a6577', fontSize: 11, marginTop: 2 }}>{r.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>Beyond the numbers, what intangible benefits does the CV system bring? What intangible risks? Consider employee morale, regulatory compliance, scalability, and competitive advantage.</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Discuss qualitative factors..." value={get(sid, 'intangibles')} onChange={e => set(sid, 'intangibles', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Write the executive summary (5-7 sentences) you would present to the plant manager recommending go-live. Include key numbers, risk mitigation, and your confidence level.</label>
            <textarea style={{ ...textareaBase, minHeight: 180 }} rows={8} placeholder="Your executive summary for the plant manager..." value={get(sid, 'execSummary')} onChange={e => set(sid, 'execSummary', e.target.value)} />
          </div>

          {/* Go-Live Checklist */}
          <div>
            <label style={labelStyle}>Go-Live Checklist -- Select ALL items that must be completed</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {GO_LIVE_CHECKLIST.map(item => {
                const sel = goLiveSelected.includes(item)
                return (
                  <motion.div key={item} whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMulti(sid, 'goLive', item)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: sel ? '1px solid var(--accent)' : '1px solid var(--border)', background: sel ? 'var(--accent)11' : 'var(--bg-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: sel ? '2px solid var(--accent)' : '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: sel ? 'var(--accent)' : 'transparent', transition: 'all 0.2s' }}>
                      {sel && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{'✓'}</span>}
                    </div>
                    <span style={{ color: sel ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 14 }}>{item}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderers = [renderSection1, renderSection2, renderSection3, renderSection4, renderSection5, renderSection6, renderSection7]

  // ─── Submit view ───
  const renderSubmitView = () => {
    const filled = SECTIONS.map((s, i) => ({ ...s, done: sectionHasContent(i) }))
    return (
      <motion.div key="submit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ ...cardBase, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          {submitted ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #2ecc71, #27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span style={{ color: '#fff', fontSize: 36, fontWeight: 700 }}>{'✓'}</span>
              </div>
              <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', margin: '0 0 12px', fontSize: 24 }}>Assignment Submitted!</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15, margin: '0 0 8px' }}>
                Your responses will be reviewed by an AI instructor who will provide personalized feedback and guidance.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14, margin: '0 0 24px' }}>
                You completed {filledCount} of {SECTIONS.length} sections across root cause analysis, data drift investigation, retraining strategy, cross-line deployment, edge architecture, monitoring, and business case.
              </p>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, border: '1px solid #f39c1233' }}>
                <p style={{ color: '#f39c12', fontSize: 14, fontWeight: 600, margin: 0 }}>
                  Scoring: Coming Soon -- An LLM judge will evaluate your responses and provide detailed feedback.
                </p>
              </div>
              <AIEvaluationPanel courseId="cv" assignmentId={3} />
            </motion.div>
          ) : (
            <>
              <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', margin: '0 0 8px', fontSize: 22 }}>Review & Submit</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px' }}>Verify your progress across all sections before submitting.</p>
              <div style={{ display: 'grid', gap: 8, marginBottom: 24, textAlign: 'left' }}>
                {filled.map(s => (
                  <motion.div key={s.id} whileHover={{ x: 4 }}
                    onClick={() => { if (!s.done) setActive(SECTIONS.findIndex(sec => sec.id === s.id)) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'var(--bg-secondary)', cursor: s.done ? 'default' : 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: s.done ? '#2ecc71' : 'var(--border)' }}>
                      {s.done && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{'✓'}</span>}
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: 14 }}>Section {s.num}: {s.title}</span>
                    <span style={{ marginLeft: 'auto', color: s.done ? '#2ecc71' : '#e74c3c88', fontSize: 12, fontWeight: 600 }}>{s.done ? 'Complete' : 'Empty -- click to fill'}</span>
                  </motion.div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, flex: 1, maxWidth: 200, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: filledCount === SECTIONS.length ? '#2ecc71' : 'var(--accent)', borderRadius: 6, width: `${(filledCount / SECTIONS.length) * 100}%`, transition: 'width 0.3s' }} />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{filledCount} / {SECTIONS.length} sections</span>
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSubmitted(true)}
                style={{ padding: '14px 48px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--accent), #2980b9)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-heading)', letterSpacing: 0.5 }}>
                Submit Assignment
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    )
  }

  const showSubmit = active >= SECTIONS.length

  return (
    <div style={{ display: 'flex', gap: 0, minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* ─── Sidebar ─── */}
      <div style={{ width: 280, flexShrink: 0, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', padding: '28px 0', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ background: 'linear-gradient(135deg, #2c3e50, #34495e)', borderRadius: 14, padding: 18, marginBottom: 12 }}>
            <div style={{ color: '#f39c12', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Assignment 3</div>
            <div style={{ color: '#ecf0f1', fontFamily: 'var(--font-heading)', fontSize: 16, lineHeight: 1.3 }}>Steel Mill Continuous Improvement</div>
          </div>
          {/* Progress bar */}
          <div style={{ background: 'var(--border)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${(filledCount / SECTIONS.length) * 100}%` }} transition={{ duration: 0.4 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #2ecc71)', borderRadius: 6 }} />
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 6 }}>{filledCount} / {SECTIONS.length} sections</div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {SECTIONS.map((s, i) => {
            const isCurrent = active === i && !showSubmit
            const done = sectionHasContent(i)
            return (
              <motion.button key={s.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                onClick={() => setActive(i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: isCurrent ? 'var(--accent)18' : 'transparent', cursor: 'pointer', marginBottom: 2, transition: 'background 0.2s' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, background: isCurrent ? 'var(--accent)' : done ? '#2ecc7133' : 'var(--border)', color: isCurrent ? '#fff' : done ? '#2ecc71' : 'var(--text-secondary)' }}>
                  {done ? '✓' : s.num}
                </span>
                <span style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, fontWeight: isCurrent ? 600 : 400, textAlign: 'left', lineHeight: 1.3 }}>{s.title}</span>
              </motion.button>
            )
          })}
          {/* Submit nav */}
          <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActive(SECTIONS.length)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: showSubmit ? 'var(--accent)18' : 'transparent', cursor: 'pointer', marginTop: 8, transition: 'background 0.2s' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, background: showSubmit ? 'var(--accent)' : 'var(--border)', color: showSubmit ? '#fff' : 'var(--text-secondary)' }}>{'→'}</span>
            <span style={{ color: showSubmit ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 13, fontWeight: showSubmit ? 600 : 400 }}>Review & Submit</span>
          </motion.button>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', maxWidth: 900 }}>
        {/* Scenario briefing banner — shown at top of first section only */}
        {active === 0 && !showSubmit && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #16213e 100%)', borderRadius: 16, padding: 24, marginBottom: 28, border: '1px solid #3498db33', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: '100%', background: 'linear-gradient(135deg, transparent 40%, #f39c1208 60%, #f39c1215 100%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ background: '#f39c12', color: '#1a1a2e', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Case Study</span>
              <span style={{ color: '#f39c1299', fontSize: 12, fontWeight: 500 }}>Tata Steel -- Hot-Rolled Coil Inspection</span>
            </div>
            <h3 style={{ color: '#ecf0f1', fontFamily: 'var(--font-heading)', margin: '0 0 6px', fontSize: 20 }}>Steel Mill Continuous Improvement</h3>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 10 }}>Your role: <span style={{ color: '#3498db', fontWeight: 600 }}>Senior ML Engineer, Computer Vision Team</span></div>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '0 0 14px', maxWidth: 700 }}>
              Three months ago, you deployed a steel surface defect detection model at Tata Steel's hot-rolled coil inspection line. Initial results were promising: mAP 82%, processing 200 sheets/hour.
            </p>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: 0, maxWidth: 700 }}>
              But now the plant manager reports three issues: <strong style={{ color: '#e74c3c' }}>(1)</strong> A new steel grade (DP780) with a different surface texture -- the model has never seen it. <strong style={{ color: '#f39c12' }}>(2)</strong> Overall accuracy dropped from 82% to 71%. <strong style={{ color: '#3498db' }}>(3)</strong> Management wants to scale to 2 additional production lines with different cameras and lighting. <em style={{ color: '#ecf0f1' }}>Your task: diagnose, fix, and scale.</em>
            </p>
          </motion.div>
        )}

        {/* Section header */}
        {!showSubmit && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Section {SECTIONS[active].num} of {SECTIONS.length}</div>
            <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', margin: 0, fontSize: 26 }}>{SECTIONS[active].title}</h2>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showSubmit ? renderSubmitView() : renderers[active]()}
        </AnimatePresence>

        {/* Navigation buttons */}
        {!showSubmit && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: active === 0 ? 'var(--border)' : 'var(--text-secondary)', cursor: active === 0 ? 'default' : 'pointer', fontSize: 14, fontWeight: 500 }}>
              {'←'} Previous
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActive(Math.min(SECTIONS.length, active + 1))}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--accent), #2980b9)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              {active === SECTIONS.length - 1 ? 'Review & Submit' : 'Next'} {'→'}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
