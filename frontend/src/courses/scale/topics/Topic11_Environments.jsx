import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 11 — Deployment Environments & Strategy
   DEV → STAGING → UAT → PROD pipeline, UAT importance, deploy strategies
================================================================ */

const ENVS = [
  { id: 'dev', name: 'DEV', full: 'Development', emoji: '🟢', color: '#10b981', bg: '#ecfdf5', icon: '💻',
    who: 'Individual developers', data: 'Fake / mock data', purpose: 'Write and test your code',
    deploy: 'Every git push or manual', desc: 'Your laptop or dev server. Wild west. Break things freely.' },
  { id: 'staging', name: 'STAGING', full: 'Staging', emoji: '🟡', color: '#f59e0b', bg: '#fffbeb', icon: '🔬',
    who: 'Development team', data: 'Anonymized production-like data', purpose: 'Integration testing — does everything work together?',
    deploy: 'Automated from develop branch', desc: 'Mirror of production. Same infrastructure, different data. The dress rehearsal.' },
  { id: 'uat', name: 'UAT', full: 'User Acceptance Testing', emoji: '🟠', color: '#f97316', bg: '#fff7ed', icon: '👥',
    who: 'Product managers, QA team, beta users', data: 'Production-like data',
    purpose: 'Does the feature work as the BUSINESS intended?',
    deploy: 'Manual promotion from staging after QA sign-off', desc: 'Business stakeholders test here. Not "does code work" but "does it solve the right problem?"' },
  { id: 'prod', name: 'PROD', full: 'Production', emoji: '🔴', color: '#ef4444', bg: '#fef2f2', icon: '🌍',
    who: 'Everyone (end users)', data: 'Real production data', purpose: 'Serve real users',
    deploy: 'Manual approval, blue-green or canary strategy', desc: 'The real deal. Real users, real data, real consequences.' },
]

const UAT_SCENARIOS = [
  { id: 1, title: 'The Broken Email', sub: 'Checkout button works, but confirmation email has wrong formatting',
    dev: 'Button clicks → order created in DB', uat: 'Email looks broken on mobile — caught before production!',
    impact: 'Without UAT: 50,000 customers get unreadable confirmation emails. Support tickets explode.' },
  { id: 2, title: 'Hindi Search Disaster', sub: 'Search works but returns irrelevant results for Hindi queries',
    dev: 'Search API returns results for English queries', uat: 'Business says Hindi results are completely wrong — fix before launch',
    impact: 'Without UAT: 40% of users searching in Hindi get garbage results. Engagement drops 60%.' },
  { id: 3, title: 'Compliance Violation', sub: 'Feature works perfectly but violates regulatory compliance',
    dev: 'All 247 automated tests pass with flying colors', uat: 'Legal team says data display violates privacy rules (GDPR/DPDPA)',
    impact: 'Without UAT: Company faces regulatory fines up to 4% of global revenue.' },
]

const STRATEGIES = [
  { id: 'bigbang', name: 'Big Bang (Recreate)', risk: 'High', rc: '#ef4444', re: '⚠️',
    desc: 'Take down old version completely. Deploy new. Simple but causes downtime.',
    pros: ['Simple to implement', 'Clean cutover'], cons: ['Downtime during deployment', 'If broken, ALL users affected'], vis: 'shutdown' },
  { id: 'rolling', name: 'Rolling Update', risk: 'Medium', rc: '#f59e0b', re: '🟡',
    desc: 'Update servers one by one. Some run old, some new. Gradual transition.',
    pros: ['Zero downtime', 'Gradual rollout'], cons: ['Mixed versions briefly', 'Harder to debug'], vis: 'rolling' },
  { id: 'bluegreen', name: 'Blue-Green', risk: 'Low', rc: '#10b981', re: '🟢',
    desc: 'Two identical environments. Switch traffic from blue (old) to green (new) instantly.',
    pros: ['Instant switch', 'Instant rollback', 'Zero downtime'], cons: ['Double infrastructure cost', 'DB migrations need care'], vis: 'bluegreen' },
  { id: 'canary', name: 'Canary', risk: 'Very Low', rc: '#059669', re: '🟢',
    desc: 'Send 5% of traffic to new version. Monitor. If good, increase to 100%.',
    pros: ['Minimal blast radius', 'Real user validation'], cons: ['Complex traffic routing', 'Need good monitoring'], vis: 'canary' },
]

const CONFIGS = [
  { env: 'DEV', c: '#10b981', db: 'localhost:5432', key: 'test_key_abc123', debug: 'true', log: 'verbose', cache: 'disabled' },
  { env: 'STAGING', c: '#f59e0b', db: 'staging-db.internal:5432', key: 'stg_key_def456', debug: 'false', log: 'info', cache: 'enabled' },
  { env: 'UAT', c: '#f97316', db: 'uat-db.internal:5432', key: 'uat_key_ghi789', debug: 'false', log: 'info', cache: 'enabled' },
  { env: 'PROD', c: '#ef4444', db: 'prod-db.internal:5432', key: 'prod_key_REAL_xyz', debug: 'false', log: 'error', cache: 'enabled' },
]

const MISTAKES = [
  { id: 'dev-db', icon: '💣', title: 'DEV database in PROD', sev: 'CRITICAL',
    desc: 'PROD pointed to localhost. Production reads empty dev data.', result: 'All users see blank pages. Orders disappear.' },
  { id: 'prod-key', icon: '💸', title: 'PROD API key in DEV', sev: 'HIGH',
    desc: 'Test script runs 10,000 API calls with production key.', result: '$2,400 in API charges overnight.' },
  { id: 'debug', icon: '🔓', title: 'DEBUG=true in PROD', sev: 'CRITICAL',
    desc: 'Stack traces with DB passwords shown to users on errors.', result: 'Security breach. Hackers see your credentials.' },
]

/* ---------- Sub: Horror Story ---------- */
function HorrorStory() {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: '💻', label: 'Developer writes code', bg: '#10b981' },
    { icon: '🚀', label: 'Pushes directly to PROD', bg: '#f59e0b' },
    { icon: '💥', label: 'Page breaks for 10,000 users', bg: '#ef4444' },
    { icon: '😡', label: 'Angry users flood Twitter', bg: '#dc2626' },
    { icon: '📱', label: 'Boss calls at 2am', bg: '#991b1b' },
    { icon: '💸', label: '$50,000 lost revenue', bg: '#7f1d1d' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <motion.div
              initial={{ scale: 0 }} animate={i <= step ? { scale: 1 } : { scale: 0.6, opacity: 0.3 }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200 }}
              onClick={() => setStep(i)}
              style={{ width: 56, height: 56, borderRadius: 14, background: i <= step ? s.bg : 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, cursor: 'pointer',
                boxShadow: i <= step ? `0 4px 16px ${s.bg}44` : 'none' }}
            >{s.icon}</motion.div>
            {i < steps.length - 1 && <motion.span animate={{ opacity: i < step ? 1 : 0.2 }}
              style={{ fontSize: 18, color: i < step ? '#ef4444' : 'var(--text-muted)' }}>→</motion.span>}
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          style={{ padding: '12px 20px', borderRadius: 12, background: steps[step].bg + '15',
            border: `1px solid ${steps[step].bg}33`, color: steps[step].bg, fontWeight: 600, fontSize: 15 }}>
          Step {step + 1}: {steps[step].label}
        </motion.div>
      </AnimatePresence>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setStep(p => (p + 1) % steps.length)}
        style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, border: 'none',
          background: 'var(--gradient-primary)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
        {step < steps.length - 1 ? 'Next Disaster →' : 'Restart Horror Story'}
      </motion.button>
    </div>
  )
}

/* ---------- Sub: Environment Pipeline ---------- */
function EnvironmentPipeline() {
  const [active, setActive] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [flowStep, setFlowStep] = useState(-1)

  const runFlow = () => {
    setAnimating(true); setFlowStep(0)
    let i = 0
    const iv = setInterval(() => {
      i += 1
      if (i >= ENVS.length) { clearInterval(iv); setTimeout(() => { setAnimating(false); setFlowStep(-1) }, 1200) }
      else setFlowStep(i)
    }, 900)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28, flexWrap: 'wrap' }}>
        {ENVS.map((env, i) => (
          <div key={env.id} style={{ display: 'flex', alignItems: 'center' }}>
            <motion.div whileHover={{ scale: 1.08, y: -4 }} whileTap={{ scale: 0.95 }}
              animate={flowStep === i ? { scale: [1, 1.15, 1.05], boxShadow: `0 8px 40px ${env.color}55` } : {}}
              onClick={() => setActive(active === env.id ? null : env.id)}
              style={{ width: 120, minHeight: 120, borderRadius: 20,
                background: active === env.id ? env.color : env.bg, border: `2px solid ${env.color}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 12, cursor: 'pointer', boxShadow: `0 2px 12px ${env.color}22`, transition: 'background 0.3s' }}>
              <span style={{ fontSize: 28, marginBottom: 4 }}>{env.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-heading)',
                color: active === env.id ? 'white' : env.color }}>{env.name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: active === env.id ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', marginTop: 2 }}>{env.full}</span>
              <span style={{ fontSize: 18, marginTop: 4 }}>{env.emoji}</span>
            </motion.div>
            {i < ENVS.length - 1 && <motion.div
              animate={flowStep === i ? { scale: [1, 1.3, 1] } : {}}
              style={{ fontSize: 24, fontWeight: 700, margin: '0 6px',
                color: flowStep >= i && flowStep >= 0 ? env.color : 'var(--text-muted)' }}>→</motion.div>}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={runFlow} disabled={animating}
          style={{ padding: '10px 28px', borderRadius: 12, border: 'none',
            background: animating ? 'var(--text-muted)' : 'var(--gradient-primary)',
            color: 'white', fontWeight: 700, cursor: animating ? 'not-allowed' : 'pointer', fontSize: 14 }}>
          {animating ? 'Deploying...' : '▶ Watch Code Flow Through Pipeline'}
        </motion.button>
      </div>
      <AnimatePresence mode="wait">
        {active && ENVS.filter(e => e.id === active).map(env => (
          <motion.div key={env.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ background: env.bg, border: `2px solid ${env.color}33`, borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{env.icon}</span>
                <div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: env.color }}>{env.name} {env.emoji}</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)' }}>{env.full}</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 16, lineHeight: 1.6 }}>{env.desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {[{ l: 'Who uses it', v: env.who, i: '👤' }, { l: 'Data', v: env.data, i: '🗄️' },
                  { l: 'Purpose', v: env.purpose, i: '🎯' }, { l: 'Deploy trigger', v: env.deploy, i: '🚀' }].map(item => (
                  <div key={item.l} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', border: `1px solid ${env.color}22` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.i} {item.l}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Sub: UAT Simulator ---------- */
function UATSimulator() {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState({})
  const s = UAT_SCENARIOS[idx]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {UAT_SCENARIOS.map((sc, i) => (
          <motion.button key={sc.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setIdx(i)}
            style={{ padding: '8px 18px', borderRadius: 10, border: idx === i ? '2px solid #f97316' : '2px solid var(--border)',
              background: idx === i ? '#fff7ed' : 'var(--bg-secondary)', color: idx === i ? '#f97316' : 'var(--text-muted)',
              fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Scenario {sc.id}</motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div style={{ background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid #f97316aa' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: '#ea580c', marginBottom: 4 }}>{s.title}</h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{s.sub}</p>
          </div>
          {/* Dev test - always passes */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 12, marginBottom: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: 22, minWidth: 36, height: 36, borderRadius: 10, background: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14 }}>✅</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>Dev Automated Test</div>
              <div style={{ fontSize: 14, color: '#15803d', fontWeight: 600, marginTop: 2 }}>{s.dev}</div>
            </div>
          </div>
          {/* UAT test - click to reveal */}
          <div onClick={() => setRevealed(p => ({ ...p, [s.id]: true }))}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 12, marginBottom: 12,
              background: revealed[s.id] ? '#fef2f2' : 'var(--bg-secondary)',
              border: revealed[s.id] ? '1px solid #fecaca' : '1px solid var(--border)',
              cursor: revealed[s.id] ? 'default' : 'pointer' }}>
            {revealed[s.id] ? (<>
              <span style={{ fontSize: 22, minWidth: 36, height: 36, borderRadius: 10, background: '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14 }}>❌</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 0.5 }}>UAT Test - BUG CAUGHT!</div>
                <div style={{ fontSize: 14, color: '#b91c1c', fontWeight: 600, marginTop: 2 }}>{s.uat}</div>
              </div>
            </>) : (
              <div style={{ textAlign: 'center', width: '100%', padding: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>🔍 Click to run UAT test...</span>
              </div>
            )}
          </div>
          <AnimatePresence>
            {revealed[s.id] && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ background: '#fef2f2', borderRadius: 12, padding: 16, border: '1px solid #fca5a5' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>💥 Without UAT:</div>
                  <div style={{ fontSize: 14, color: '#b91c1c', fontWeight: 600 }}>{s.impact}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------- Sub: Deploy Strategy Visualizer ---------- */
function DeployVisualizer() {
  const [si, setSi] = useState(0)
  const [deploying, setDeploying] = useState(false)
  const [phase, setPhase] = useState(0)
  const st = STRATEGIES[si]
  const OLD = '#6366f1', NEW = '#10b981'

  const runDeploy = () => {
    setDeploying(true); setPhase(0); let p = 0
    const iv = setInterval(() => { p += 1; if (p > 4) { clearInterval(iv); setDeploying(false); setPhase(0) } else setPhase(p) }, 800)
  }

  const ServerBox = ({ color, label, dim }) => (
    <motion.div animate={{ background: color, scale: dim ? 0.8 : 1, opacity: dim ? 0.4 : 1 }} transition={{ duration: 0.4 }}
      style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: 'white', fontWeight: 700 }}>{label}</motion.div>
  )

  const StatusLine = ({ text, color }) => (
    <div style={{ width: '100%', textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: 700, color: color || 'var(--text-secondary)' }}>{text}</div>
  )

  const renderVis = () => {
    const srvs = [0, 1, 2, 3, 4, 5]
    if (st.vis === 'shutdown') {
      const down = phase === 1 || phase === 2
      return (<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {srvs.map(s => <ServerBox key={s} color={phase === 0 ? OLD : down ? '#374151' : NEW} label={down ? '💤' : '⚡'} dim={down} />)}
        <StatusLine text={phase === 0 ? 'All servers running v1 (old)' : down ? '⚠️ DOWNTIME — All servers offline!' : '✅ All servers running v2 (new)'}
          color={down ? '#ef4444' : '#10b981'} />
      </div>)
    }
    if (st.vis === 'rolling') {
      return (<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {srvs.map(s => <ServerBox key={s} color={phase > 0 && s < phase * 2 ? NEW : OLD} label={phase > 0 && s < phase * 2 ? 'v2' : 'v1'} />)}
        <StatusLine text={phase === 0 ? 'All servers on v1' : phase >= 4 ? '✅ Rolling update complete' : `${Math.min(phase * 2, 6)}/6 servers updated to v2`} />
      </div>)
    }
    if (st.vis === 'bluegreen') {
      const switched = phase >= 3
      return (<div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: OLD, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Blue (v1)</div>
            <div style={{ display: 'flex', gap: 6 }}>{[0, 1, 2].map(s => <ServerBox key={s} color={OLD} label="v1" dim={switched} />)}</div>
          </div>
          <motion.div animate={{ x: switched ? 20 : -20 }} style={{ display: 'flex', alignItems: 'center', fontSize: 28, color: 'var(--text-muted)' }}>{switched ? '→' : '←'}</motion.div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: NEW, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Green (v2)</div>
            <div style={{ display: 'flex', gap: 6 }}>{[0, 1, 2].map(s => <ServerBox key={s} color={NEW} label="v2" dim={!switched && phase < 2} />)}</div>
          </div>
        </div>
        <StatusLine text={phase === 0 ? 'Traffic → Blue (v1)' : phase < 3 ? 'Deploying v2 to Green...' : '✅ Traffic switched to Green (v2) instantly!'} />
      </div>)
    }
    if (st.vis === 'canary') {
      const pct = [0, 5, 25, 50, 100][phase] || 0
      return (<div>
        <div style={{ height: 40, borderRadius: 12, overflow: 'hidden', display: 'flex', border: '2px solid var(--border)' }}>
          <motion.div animate={{ width: `${100 - pct}%` }} transition={{ duration: 0.6 }}
            style={{ background: OLD, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 12 }}>{100 - pct > 10 ? `v1: ${100 - pct}%` : ''}</motion.div>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
            style={{ background: NEW, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 12 }}>{pct > 10 ? `v2: ${pct}%` : ''}</motion.div>
        </div>
        <StatusLine text={phase === 0 ? '100% on v1' : phase === 1 ? '🐦 Canary: 5% to v2 — monitoring...' :
          phase < 4 ? `📈 Looks good! Ramping to ${pct}%...` : '✅ 100% on v2. Canary complete!'} />
      </div>)
    }
    return null
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
        {STRATEGIES.map((s, i) => (
          <motion.button key={s.id} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setSi(i); setDeploying(false); setPhase(0) }}
            style={{ padding: '14px 10px', borderRadius: 14, border: si === i ? `2px solid ${s.rc}` : '2px solid var(--border)',
              background: si === i ? `${s.rc}12` : 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.re}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: si === i ? s.rc : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{s.name}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.rc, marginTop: 4 }}>Risk: {s.risk}</div>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={si} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{st.desc}</p>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid var(--border)', minHeight: 120 }}>
            {renderVis()}
          </div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={runDeploy} disabled={deploying}
              style={{ padding: '10px 28px', borderRadius: 12, border: 'none', background: deploying ? 'var(--text-muted)' : st.rc,
                color: 'white', fontWeight: 700, cursor: deploying ? 'not-allowed' : 'pointer', fontSize: 14 }}>
              {deploying ? 'Deploying...' : `▶ Simulate ${st.name} Deploy`}
            </motion.button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>✅ Pros</div>
              {st.pros.map((p, i) => <div key={i} style={{ fontSize: 13, color: '#15803d', marginBottom: 4, fontWeight: 600 }}>• {p}</div>)}
            </div>
            <div style={{ background: '#fef2f2', borderRadius: 12, padding: 16, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>❌ Cons</div>
              {st.cons.map((c, i) => <div key={i} style={{ fontSize: 13, color: '#b91c1c', marginBottom: 4, fontWeight: 600 }}>• {c}</div>)}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---------- Sub: Config Manager ---------- */
function ConfigManager() {
  const [sel, setSel] = useState(0)
  const [showMistake, setShowMistake] = useState(null)
  const cfg = CONFIGS[sel]

  const EnvLine = ({ name, val, warn }) => (
    <div><span style={{ color: '#cba6f7' }}>{name}</span><span style={{ color: '#6c7086' }}>=</span>
      <span style={{ color: warn ? '#f38ba8' : '#a6e3a1' }}>{val}</span></div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CONFIGS.map((c, i) => (
          <motion.button key={c.env} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setSel(i)}
            style={{ padding: '8px 20px', borderRadius: 10, border: sel === i ? `2px solid ${c.c}` : '2px solid var(--border)',
              background: sel === i ? `${c.c}15` : 'var(--bg-secondary)', color: sel === i ? c.c : 'var(--text-muted)',
              fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-heading)' }}>{c.env}</motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          style={{ background: '#1e1e2e', borderRadius: 14, padding: 20, marginBottom: 20,
            fontFamily: 'monospace', fontSize: 14, lineHeight: 2, overflow: 'auto' }}>
          <div style={{ color: '#6c7086', marginBottom: 8 }}># .env.{cfg.env.toLowerCase()}</div>
          <EnvLine name="DATABASE_URL" val={cfg.db} />
          <EnvLine name="API_KEY" val={cfg.key} />
          <EnvLine name="DEBUG" val={cfg.debug} warn={cfg.debug === 'true'} />
          <EnvLine name="LOG_LEVEL" val={cfg.log} />
          <EnvLine name="CACHE" val={cfg.cache} warn={cfg.cache === 'disabled'} />
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 24,
        borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {CONFIGS.map((c, i) => (
          <div key={c.env} style={{ padding: '10px 8px', background: sel === i ? `${c.c}15` : 'var(--bg-secondary)',
            textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: c.c, marginBottom: 4, fontFamily: 'var(--font-heading)' }}>{c.env}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>DEBUG={c.debug}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>LOG={c.log}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
        ⚠️ What happens when configs get mixed up?
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {MISTAKES.map(m => (
          <motion.button key={m.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowMistake(showMistake === m.id ? null : m.id)}
            style={{ padding: '10px 16px', borderRadius: 12, border: showMistake === m.id ? '2px solid #ef4444' : '2px solid var(--border)',
              background: showMistake === m.id ? '#fef2f2' : 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'left', flex: '1 1 200px' }}>
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: showMistake === m.id ? '#ef4444' : 'var(--text-primary)', marginTop: 4 }}>{m.title}</div>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {showMistake && MISTAKES.filter(m => m.id === showMistake).map(m => (
          <motion.div key={m.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ marginTop: 12, background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 6, background: '#ef4444',
                color: 'white', fontSize: 11, fontWeight: 800, marginBottom: 8 }}>{m.sev}</div>
              <p style={{ fontSize: 14, color: '#991b1b', lineHeight: 1.6, marginBottom: 8 }}>{m.desc}</p>
              <div style={{ background: '#991b1b', color: 'white', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}>
                💥 Consequence: {m.result}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic11_Environments() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px 60px' }}>
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40, padding: '40px 20px', background: 'var(--bg-card)',
          borderRadius: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }}
          style={{ fontSize: 56, marginBottom: 12 }}>🏭</motion.div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Deployment Environments & Strategy
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          DEV → STAGING → UAT → PROD: Why code must pass through safety gates before reaching real users
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          {ENVS.map(env => (
            <div key={env.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: env.color }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: env.color, fontFamily: 'var(--font-heading)' }}>{env.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 1: Why Multiple Environments? */}
      <SectionBlock title="Why Multiple Environments?" icon="😱" color="#ef4444">
        <Neuron mood="thinking" message="Imagine pushing untested code directly to production. 10,000 users see a broken page. Your boss is calling. The CEO is tweeting. All because you skipped testing." typed={true} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#ef4444', margin: '24px 0 12px' }}>
          💥 The Horror Story: Code → Production → Disaster
        </h3>
        <InteractiveDemo title="Horror Story Simulator"><HorrorStory /></InteractiveDemo>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ background: '#f0fdf4', borderRadius: 16, padding: 20, border: '1px solid #bbf7d0', marginTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>✅ The Right Way: Multiple Safety Gates</div>
          <p style={{ fontSize: 14, color: '#15803d', lineHeight: 1.7, margin: 0 }}>
            Instead of code going laptop → production, it passes through DEV → STAGING → UAT → PROD.
            Each environment catches different types of bugs. By the time code reaches real users,
            it has been tested by developers, QA teams, and business stakeholders.
            Bugs caught early are cheap. Bugs in production are expensive.
          </p>
        </motion.div>
      </SectionBlock>

      {/* Section 2: The Environment Pipeline */}
      <SectionBlock title="The Environment Pipeline" icon="🔄" color="#6366f1">
        <Neuron mood="explaining" message="Think of environments like exam preparation. DEV is your rough notebook. STAGING is your mock test. UAT is your teacher reviewing your answers. PROD is the actual exam." typed={true} />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Environment Pipeline Visualizer">
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              Click each environment to explore its details. Hit the button to watch code flow through the pipeline.
            </p>
            <EnvironmentPipeline />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* Section 3: UAT */}
      <SectionBlock title="What is UAT & Why It Matters" icon="👥" color="#f97316">
        <Neuron mood="excited" message="UAT is where business people test your code. Automated tests check if the code WORKS. UAT checks if the code is RIGHT. Big difference! A button can work perfectly but do the wrong thing." typed={true} />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="UAT Scenario Simulator">
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              See how UAT catches bugs that automated dev tests miss. Click each scenario, then click to reveal what UAT found.
            </p>
            <UATSimulator />
          </InteractiveDemo>
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ background: '#fff7ed', borderRadius: 16, padding: 20, border: '1px solid #fed7aa', marginTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#9a3412', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>🎯 Key Insight</div>
          <p style={{ fontSize: 14, color: '#c2410c', lineHeight: 1.7, margin: 0 }}>
            Automated tests verify that code works <strong>technically</strong>.
            UAT verifies that code works <strong>for the business</strong>.
            A feature can pass 1,000 automated tests and still be wrong if it does not match
            what the product team intended. That is why UAT exists.
          </p>
        </motion.div>
      </SectionBlock>

      {/* Section 4: Deployment Strategies */}
      <SectionBlock title="Deployment Strategies for Production" icon="🚀" color="#8b5cf6">
        <Neuron mood="happy" message="OK so your code passed DEV, STAGING, and UAT. Now how do you actually get it to production without breaking things? There are 4 main strategies, each with different risk levels." typed={true} />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Deployment Strategy Picker">
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              Select a strategy and click Simulate to see how each deployment approach works.
            </p>
            <DeployVisualizer />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* Section 5: Environment Configuration */}
      <SectionBlock title="Environment Configuration" icon="⚙️" color="#0ea5e9">
        <Neuron mood="thinking" message="Same code, different configs. Your app reads DATABASE_URL, API_KEY, DEBUG from environment variables. Each environment has its own .env file. Mix them up and very bad things happen." typed={true} />
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="Config Manager">
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              Switch between environments to see how the same app uses different configuration. Then explore what happens when configs get mixed up.
            </p>
            <ConfigManager />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* Section 6: Hindi Explainer */}
      <SectionBlock title="Hindi Explainer" icon="🇮🇳" color="#f59e0b">
        <HindiExplainer
          concept="डिप्लॉयमेंट एनवायरनमेंट"
          english="Deployment Environments"
          explanation="Production में code भेजने से पहले कई stages से गुज़ारते हैं — जैसे exam से पहले practice test देते हो। DEV = अपने laptop पर try करो। STAGING = office जैसे setup में test करो। UAT = business team check करे कि feature सही है। PROD = असली users को serve करो। हर stage पर bugs पकड़ना easy और cheap होता है!"
          example="सोचो Flipkart Big Billion Day sale लॉन्च कर रहा है। पहले developer अपने laptop पर बनाता है (DEV)। फिर staging पर 1000 fake orders डालकर test करता है। फिर UAT में Flipkart team check करती है — discount सही है? Payment हो रहा है? सब ठीक? तब PROD पर deploy — 10 करोड़ users के लिए!"
          terms={[
            { hindi: 'यू.ए.टी.', english: 'UAT', meaning: 'User Acceptance Testing — business team test करती है' },
            { hindi: 'स्टेजिंग', english: 'Staging', meaning: 'Production जैसा test environment' },
            { hindi: 'ब्लू-ग्रीन', english: 'Blue-Green Deploy', meaning: 'दो identical setup — एक से दूसरे पर switch करो' },
            { hindi: 'कैनरी', english: 'Canary Deploy', meaning: 'पहले 5% users को new version दो, ठीक हो तो 100%' },
            { hindi: 'रोलबैक', english: 'Rollback', meaning: 'कुछ गलत हो तो पुराने version पर वापस जाना' },
          ]}
        />
      </SectionBlock>
    </div>
  )
}
