import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'scale'
const ASSIGNMENT_ID = 'deploy-prod-2'

const SECTIONS = [
  { id: 'env_design', num: 1, title: 'Environment Design', icon: '\u{1F3D7}', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { id: 'uat_planning', num: 2, title: 'UAT Planning', icon: '\u{1F9EA}', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { id: 'deploy_strategy', num: 3, title: 'Deployment Strategy Selection', icon: '\u{1F680}', gradient: 'linear-gradient(135deg, #059669, #047857)' },
  { id: 'cicd_pipeline', num: 4, title: 'CI/CD Pipeline Design', icon: '\u{2699}', gradient: 'linear-gradient(135deg, #d97706, #b45309)' },
  { id: 'config_mgmt', num: 5, title: 'Configuration Management', icon: '\u{1F512}', gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
  { id: 'monitoring', num: 6, title: 'Monitoring & Rollback', icon: '\u{1F4CA}', gradient: 'linear-gradient(135deg, #0891b2, #0e7490)' },
  { id: 'hindi_summary', num: 7, title: 'Hindi Summary', icon: '\u{1F1EE}\u{1F1F3}', gradient: 'linear-gradient(135deg, #ff9933, #e67e22)' },
]

const MCQ_Q4_OPTIONS = [
  { key: 'a', text: 'Immediately after developers finish coding' },
  { key: 'b', text: 'After QA and business stakeholders sign off' },
  { key: 'c', text: 'Only on Fridays' },
  { key: 'd', text: 'When the CEO says so' },
]
const MCQ_Q4_ANSWER = 'b'

const MCQ_Q8_OPTIONS = [
  { key: 'a', text: 'Running unit tests' },
  { key: 'b', text: 'Code compilation' },
  { key: 'c', text: 'Production deployment approval' },
  { key: 'd', text: 'Linting' },
]
const MCQ_Q8_ANSWER = 'c'

/* ─── QUESTION MAP (for progress tracking) ─── */
const QUESTION_KEYS = [
  { section: 'env_design', field: 'q1' },
  { section: 'env_design', field: 'q2' },
  { section: 'uat_planning', field: 'q3' },
  { section: 'uat_planning', field: 'q4' },
  { section: 'deploy_strategy', field: 'q5' },
  { section: 'deploy_strategy', field: 'q6' },
  { section: 'cicd_pipeline', field: 'q7' },
  { section: 'cicd_pipeline', field: 'q8' },
  { section: 'config_mgmt', field: 'q9' },
  { section: 'monitoring', field: 'q10' },
]

/* ─── SHARED STYLES ─── */
const crd = {
  background: 'var(--bg-card)', borderRadius: 20,
  border: '1px solid var(--border)', padding: 28, marginBottom: 24,
}
const ta = {
  width: '100%', background: 'var(--bg-secondary)',
  border: '1px solid var(--border)', borderRadius: 12,
  padding: '14px 16px', color: 'var(--text-primary)',
  fontFamily: 'inherit', fontSize: 15, lineHeight: 1.6,
  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
}
const lb = {
  display: 'block', fontWeight: 600, color: 'var(--text-primary)',
  marginBottom: 10, fontSize: 15, lineHeight: 1.5,
}

/* ─── HELPERS ─── */
function countAnswered(resp) {
  let count = 0
  for (const q of QUESTION_KEYS) {
    const val = resp[q.section]?.[q.field]
    if (typeof val === 'string' && val.trim().length > 0) count++
  }
  return count
}

/* =====================================================================
   ROOT COMPONENT
   ===================================================================== */
export default function Assignment2_DeployProd() {
  const { saveAssignment, getAssignment } = useAuth()
  const [resp, setResp] = useState({})
  const [expandedSections, setExpandedSections] = useState({ env_design: true })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [loaded, setLoaded] = useState(false)

  /* Load saved responses on mount */
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const saved = await getAssignment(COURSE_ID, ASSIGNMENT_ID)
        if (!cancelled && saved) {
          if (saved.responses) setResp(saved.responses)
          if (saved.submitted) setSubmitted(true)
        }
      } catch (_) { /* ignore */ }
      if (!cancelled) setLoaded(true)
    }
    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const put = (section, field, value) => {
    setResp(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }
  const get = (section, field) => resp[section]?.[field] ?? ''

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const answered = countAnswered(resp)
  const total = QUESTION_KEYS.length

  /* Save progress */
  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, resp, false)
      setSaveMsg('Progress saved!')
    } catch (_) {
      setSaveMsg('Failed to save. Try again.')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  /* Submit final */
  const handleSubmit = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, resp, true)
      setSubmitted(true)
    } catch (_) {
      setSaveMsg('Submission failed. Try again.')
    }
    setSaving(false)
  }

  /* ── Loading state ── */
  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Loading assignment...</p>
      </div>
    )
  }

  /* ── Submitted state ── */
  if (submitted) {
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
            Your production deployment strategy for ShopKart will be reviewed.
            You'll receive feedback on environment design, CI/CD pipeline, deployment strategy, and monitoring plans.
          </p>
          <div style={{ ...crd, textAlign: 'left' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              Submission Summary
            </h3>
            {SECTIONS.filter(s => s.id !== 'hindi_summary').map(sec => {
              const sectionQuestions = QUESTION_KEYS.filter(q => q.section === sec.id)
              const sectionAnswered = sectionQuestions.filter(q => {
                const val = resp[q.section]?.[q.field]
                return typeof val === 'string' && val.trim().length > 0
              }).length
              return (
                <div key={sec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: sectionAnswered > 0 ? '#22c55e' : 'var(--text-secondary)', fontSize: 16 }}>
                    {sectionAnswered > 0 ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 15, flex: 1 }}>{sec.title}</span>
                  <span style={{ fontSize: 13, color: sectionAnswered > 0 ? '#22c55e' : 'var(--text-secondary)' }}>
                    {sectionAnswered}/{sectionQuestions.length} answered
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
        <AIEvaluationPanel courseId={COURSE_ID} assignmentId={ASSIGNMENT_ID} />
      </div>
    )
  }

  /* ── Main assignment view ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 28, margin: '0 0 8px',
          }}>
            Deploy to Production — E-Commerce Platform
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, margin: '0 0 20px' }}>
            Assignment 2 — Case Study
          </p>
        </motion.div>

        {/* Scenario Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            ...crd,
            background: 'linear-gradient(135deg, rgba(5,150,105,0.08), rgba(16,185,129,0.03))',
            border: '1px solid rgba(5,150,105,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>{'\u{1F4CB}'}</span>
            <h2 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', fontSize: 20 }}>
              Scenario
            </h2>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, margin: '0 0 16px' }}>
            You're the lead engineer at <strong>ShopKart</strong>, an Indian e-commerce startup. You've built a full-stack
            app (<strong>React + FastAPI + PostgreSQL + Redis</strong>). Currently running on your laptop. The CEO wants it
            live in <strong>2 weeks</strong> with proper environments, CI/CD, and zero-downtime deployments.{' '}
            <strong>50,000 daily users</strong> expected.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Stack', value: 'React + FastAPI', color: '#3b82f6' },
              { label: 'Database', value: 'PostgreSQL + Redis', color: '#8b5cf6' },
              { label: 'Deadline', value: '2 Weeks', color: '#ef4444' },
              { label: 'Expected Users', value: '50K/day', color: '#059669' },
            ].map(st => (
              <div key={st.label} style={{
                background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 12px',
                textAlign: 'center', border: `1px solid ${st.color}33`,
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: st.color, marginBottom: 4 }}>{st.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{st.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ ...crd, padding: 20 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Progress</span>
            <span style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 700 }}>{answered}/{total} questions answered</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${(answered / total) * 100}%` }}
              style={{
                height: '100%', borderRadius: 4,
                background: answered === total
                  ? 'linear-gradient(90deg, #22c55e, #10b981)'
                  : 'linear-gradient(90deg, var(--accent), #3b82f6)',
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>

        {/* ── Section 1: Environment Design ── */}
        <SectionCard
          section={SECTIONS[0]}
          expanded={expandedSections.env_design}
          onToggle={() => toggleSection('env_design')}
          delay={0.3}
        >
          <div style={crd}>
            <label style={lb}>
              Q1: Design the environment pipeline for ShopKart. List each environment (minimum 3), who uses it,
              what data it has, and when code gets promoted. Think about why each environment exists.
            </label>
            <TextAreaWithCount
              rows={10}
              placeholder={'Example structure:\n\nDEV:\n- Who uses it: Developers\n- Data: Mock/seed data\n- Purpose: Daily development and debugging\n- Promotion: On PR merge to develop branch\n\nSTAGING:\n- Who uses it: ...\n- Data: ...\n\n(Add at least 3 environments)'}
              value={get('env_design', 'q1')}
              onChange={v => put('env_design', 'q1', v)}
            />
          </div>

          <div style={crd}>
            <label style={lb}>
              Q2: What happens if you skip staging and deploy directly from DEV to PRODUCTION?
              List 3 specific things that could go wrong.
            </label>
            <TextAreaWithCount
              rows={6}
              placeholder="Think about: untested integrations, database migration failures, configuration mismatches, performance issues that only appear at scale..."
              value={get('env_design', 'q2')}
              onChange={v => put('env_design', 'q2', v)}
            />
          </div>

          <SaveButton onClick={handleSave} saving={saving} saveMsg={saveMsg} />
        </SectionCard>

        {/* ── Section 2: UAT Planning ── */}
        <SectionCard
          section={SECTIONS[1]}
          expanded={expandedSections.uat_planning}
          onToggle={() => toggleSection('uat_planning')}
          delay={0.35}
        >
          <div style={crd}>
            <label style={lb}>
              Q3: The product team wants to test the new 'Flash Sale' feature before launch. Design a UAT
              checklist — what should they test that automated tests can't catch?
            </label>
            <TextAreaWithCount
              rows={8}
              placeholder="Think about: user experience flows, edge cases in payment processing, UI rendering across devices, load behavior during flash sale countdown, business logic validation by non-technical stakeholders..."
              value={get('uat_planning', 'q3')}
              onChange={v => put('uat_planning', 'q3', v)}
            />
          </div>

          <div style={crd}>
            <label style={lb}>
              Q4: When should code move from UAT to Production?
            </label>
            <MCQGroup
              options={MCQ_Q4_OPTIONS}
              selected={get('uat_planning', 'q4')}
              correctAnswer={MCQ_Q4_ANSWER}
              onChange={v => put('uat_planning', 'q4', v)}
            />
          </div>

          <SaveButton onClick={handleSave} saving={saving} saveMsg={saveMsg} />
        </SectionCard>

        {/* ── Section 3: Deployment Strategy Selection ── */}
        <SectionCard
          section={SECTIONS[2]}
          expanded={expandedSections.deploy_strategy}
          onToggle={() => toggleSection('deploy_strategy')}
          delay={0.4}
        >
          <div style={crd}>
            <label style={lb}>
              Q5: ShopKart expects 10x traffic during Diwali sale. Which deployment strategy would you use
              and why? (Blue-Green, Canary, Rolling, Big Bang)
            </label>
            <TextAreaWithCount
              rows={8}
              placeholder={'Consider each strategy:\n\n- Blue-Green: Two identical environments, instant switch\n- Canary: Gradual rollout to a small % of users first\n- Rolling: Update instances one by one\n- Big Bang: Replace everything at once\n\nWhich one handles 10x traffic surges best? What about rollback speed?'}
              value={get('deploy_strategy', 'q5')}
              onChange={v => put('deploy_strategy', 'q5', v)}
            />
          </div>

          <div style={crd}>
            <label style={lb}>
              Q6: If the Canary deployment shows 5% error rate on 10% of traffic, what do you do?
              Describe your rollback plan step by step.
            </label>
            <TextAreaWithCount
              rows={8}
              placeholder={'Step-by-step rollback plan:\n\n1. Detect: How do you know the error rate hit 5%?\n2. Decide: Who makes the rollback call?\n3. Execute: What exact commands/actions happen?\n4. Verify: How do you confirm the rollback worked?\n5. Post-mortem: What do you do next?'}
              value={get('deploy_strategy', 'q6')}
              onChange={v => put('deploy_strategy', 'q6', v)}
            />
          </div>

          <SaveButton onClick={handleSave} saving={saving} saveMsg={saveMsg} />
        </SectionCard>

        {/* ── Section 4: CI/CD Pipeline Design ── */}
        <SectionCard
          section={SECTIONS[3]}
          expanded={expandedSections.cicd_pipeline}
          onToggle={() => toggleSection('cicd_pipeline')}
          delay={0.45}
        >
          <div style={crd}>
            <label style={lb}>
              Q7: Design a CI/CD pipeline for ShopKart. List each stage from git push to production.
              Include: what tool runs each stage, what it checks, and what happens if it fails.
            </label>
            <TextAreaWithCount
              rows={12}
              placeholder={'Example pipeline stages:\n\n1. git push -> GitHub Actions triggers\n2. Lint & Format Check (ESLint, Black) -> Fail = block PR\n3. Unit Tests (pytest, vitest) -> Fail = block PR\n4. Build (Docker image) -> Fail = notify team\n5. Integration Tests -> ...\n6. Deploy to Staging -> ...\n7. Smoke Tests on Staging -> ...\n8. Manual Approval Gate -> ...\n9. Deploy to Production -> ...\n10. Post-deploy health check -> ...'}
              value={get('cicd_pipeline', 'q7')}
              onChange={v => put('cicd_pipeline', 'q7', v)}
            />
          </div>

          <div style={crd}>
            <label style={lb}>
              Q8: Which step should ALWAYS be a manual gate in a CI/CD pipeline?
            </label>
            <MCQGroup
              options={MCQ_Q8_OPTIONS}
              selected={get('cicd_pipeline', 'q8')}
              correctAnswer={MCQ_Q8_ANSWER}
              onChange={v => put('cicd_pipeline', 'q8', v)}
            />
          </div>

          <SaveButton onClick={handleSave} saving={saving} saveMsg={saveMsg} />
        </SectionCard>

        {/* ── Section 5: Configuration Management ── */}
        <SectionCard
          section={SECTIONS[4]}
          expanded={expandedSections.config_mgmt}
          onToggle={() => toggleSection('config_mgmt')}
          delay={0.5}
        >
          <div style={crd}>
            <label style={lb}>
              Q9: List the environment variables that would differ between DEV, STAGING, and PROD for ShopKart
              (database URL, API keys, etc.). Why is it dangerous to share these?
            </label>
            <TextAreaWithCount
              rows={10}
              placeholder={'Example format:\n\nVariable          | DEV                    | STAGING                | PROD\n---------------------------------------------------------------------------\nDATABASE_URL      | localhost:5432/shopkart | staging-db.internal    | prod-db.internal\nREDIS_URL         | localhost:6379         | ...                    | ...\nSTRIPE_KEY        | sk_test_xxx            | sk_test_xxx            | sk_live_xxx\nSENTRY_DSN        | (empty)                | ...                    | ...\nALLOWED_ORIGINS   | http://localhost:3000  | ...                    | ...\n\nWhy is sharing dangerous? Think about: accidental production data deletion, payment processing with live keys, security exposure...'}
              value={get('config_mgmt', 'q9')}
              onChange={v => put('config_mgmt', 'q9', v)}
            />
          </div>

          <SaveButton onClick={handleSave} saving={saving} saveMsg={saveMsg} />
        </SectionCard>

        {/* ── Section 6: Monitoring & Rollback ── */}
        <SectionCard
          section={SECTIONS[5]}
          expanded={expandedSections.monitoring}
          onToggle={() => toggleSection('monitoring')}
          delay={0.55}
        >
          <div style={crd}>
            <label style={lb}>
              Q10: After deploying to production, what 5 metrics would you monitor in the first 30 minutes?
              What threshold for each would trigger a rollback?
            </label>
            <TextAreaWithCount
              rows={10}
              placeholder={'Example format:\n\nMetric 1: Error Rate (5xx responses)\n- Monitor: Percentage of requests returning server errors\n- Threshold: > 2% error rate -> trigger rollback\n- Tool: Sentry / Datadog / CloudWatch\n\nMetric 2: Response Latency (P95)\n- Monitor: 95th percentile response time\n- Threshold: > 3 seconds -> investigate, > 5 seconds -> rollback\n- Tool: ...\n\nMetric 3: ...\nMetric 4: ...\nMetric 5: ...'}
              value={get('monitoring', 'q10')}
              onChange={v => put('monitoring', 'q10', v)}
            />
          </div>

          <SaveButton onClick={handleSave} saving={saving} saveMsg={saveMsg} />
        </SectionCard>

        {/* ── Section 7: Hindi Summary ── */}
        <SectionCard
          section={SECTIONS[6]}
          expanded={expandedSections.hindi_summary}
          onToggle={() => toggleSection('hindi_summary')}
          delay={0.6}
        >
          <div style={{ ...crd, background: 'var(--bg-secondary)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              This section provides key deployment concepts explained in Hindi for better understanding.
            </p>
          </div>
          <HindiExplainer
            concept={'प्रोडक्शन डिप्लॉयमेंट'}
            english="Production Deployment Strategy"
            explanation="Production में deploy करना सिर्फ code push करना नहीं है — पूरी planning चाहिए। Environments बनाओ (DEV/STAGING/UAT/PROD), CI/CD pipeline setup करो, deployment strategy चुनो (Blue-Green/Canary), और monitoring लगाओ। कुछ गलत हो तो rollback plan ready रखो!"
            example="Flipkart Big Billion Day से पहले महीनों की तैयारी करता है — staging पर load test, canary deployment, feature flags, real-time monitoring। एक bug दिखे तो seconds में rollback!"
            terms={[
              { hindi: 'एन्वायरनमेंट', english: 'Environment', meaning: 'अलग-अलग setup जहाँ code test/run होता है' },
              { hindi: 'पाइपलाइन', english: 'CI/CD Pipeline', meaning: 'Code push से production तक के automated steps' },
              { hindi: 'रोलबैक', english: 'Rollback', meaning: 'कुछ गलत हो तो पुराने version पर वापस जाना' },
            ]}
          />
        </SectionCard>

        {/* ── Submit Final ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          style={{ ...crd, textAlign: 'center', padding: 40 }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 20, margin: '0 0 8px' }}>
            Ready to Submit?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
            You have answered <strong style={{ color: 'var(--accent)' }}>{answered}</strong> out of{' '}
            <strong>{total}</strong> questions. You can submit even with incomplete answers.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 600,
                borderRadius: 12, cursor: saving ? 'not-allowed' : 'pointer',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </motion.button>

            <motion.button
              onClick={handleSubmit}
              disabled={saving}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-heading)', borderRadius: 12,
                cursor: saving ? 'not-allowed' : 'pointer',
                border: 'none', color: '#fff',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              Submit Final
            </motion.button>
          </div>

          {saveMsg && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                color: saveMsg.includes('Failed') ? '#ef4444' : '#22c55e',
                fontSize: 14, fontWeight: 600, marginTop: 16, marginBottom: 0,
              }}
            >
              {saveMsg}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

/* =====================================================================
   SECTION CARD — expandable/collapsible numbered card
   ===================================================================== */
function SectionCard({ section, expanded, onToggle, delay, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{ marginBottom: 24 }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 24px', borderRadius: expanded ? '16px 16px 0 0' : 16,
          background: section.gradient,
          border: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'border-radius 0.2s',
        }}
      >
        <span style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {section.num}
        </span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 20, marginRight: 8 }}>{section.icon}</span>
          <span style={{ color: '#fff', fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            {section.title}
          </span>
        </div>
        <span style={{
          color: '#fff', fontSize: 20, fontWeight: 300,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
        }}>
          {'▼'}
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: 24,
            overflow: 'hidden',
          }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

/* =====================================================================
   TEXTAREA WITH CHARACTER COUNT
   ===================================================================== */
function TextAreaWithCount({ rows, placeholder, value, onChange }) {
  const charCount = (value || '').length
  return (
    <div style={{ position: 'relative' }}>
      <textarea
        rows={rows}
        style={ta}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
      <span style={{
        position: 'absolute', bottom: 10, right: 14,
        fontSize: 12, color: 'var(--text-muted)',
        pointerEvents: 'none',
      }}>
        {charCount} chars
      </span>
    </div>
  )
}

/* =====================================================================
   MCQ GROUP — styled radio buttons with feedback
   ===================================================================== */
function MCQGroup({ options, selected, correctAnswer, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map(opt => {
        const isSelected = selected === opt.key
        const hasAnswered = selected !== ''
        const isCorrect = opt.key === correctAnswer
        const showCorrect = hasAnswered && isCorrect
        const showWrong = hasAnswered && isSelected && !isCorrect

        let borderColor = 'var(--border)'
        let bgColor = 'var(--bg-secondary)'
        let textColor = 'var(--text-primary)'

        if (showCorrect) {
          borderColor = '#22c55e'
          bgColor = 'rgba(34,197,94,0.08)'
        } else if (showWrong) {
          borderColor = '#ef4444'
          bgColor = 'rgba(239,68,68,0.08)'
        } else if (isSelected) {
          borderColor = 'var(--accent)'
          bgColor = 'rgba(6,182,212,0.06)'
        }

        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', borderRadius: 12,
              border: `2px solid ${borderColor}`,
              background: bgColor,
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <span style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              border: isSelected ? 'none' : '2px solid var(--border)',
              background: showCorrect
                ? '#22c55e'
                : showWrong
                  ? '#ef4444'
                  : isSelected
                    ? 'var(--accent)'
                    : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700,
            }}>
              {showCorrect ? '✓' : showWrong ? '✗' : isSelected ? '✓' : ''}
            </span>
            <div>
              <span style={{
                color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, marginRight: 8,
              }}>
                {opt.key.toUpperCase()})
              </span>
              <span style={{ color: textColor, fontSize: 15 }}>
                {opt.text}
              </span>
            </div>
          </button>
        )
      })}

      {selected && selected !== correctAnswer && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>
            Not quite!
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
            The correct answer is <strong>{correctAnswer.toUpperCase()}</strong>. Look at the highlighted option above.
          </p>
        </motion.div>
      )}

      {selected === correctAnswer && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.2)',
          }}
        >
          <p style={{ color: '#22c55e', fontSize: 13, fontWeight: 600, margin: 0 }}>
            Correct! That's the right answer.
          </p>
        </motion.div>
      )}
    </div>
  )
}

/* =====================================================================
   SAVE BUTTON (per-section)
   ===================================================================== */
function SaveButton({ onClick, saving, saveMsg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
      <motion.button
        onClick={onClick}
        disabled={saving}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          padding: '10px 24px', fontSize: 14, fontWeight: 600,
          borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          opacity: saving ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {saving ? 'Saving...' : 'Save Progress'}
      </motion.button>
      {saveMsg && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontSize: 13, fontWeight: 600,
            color: saveMsg.includes('Failed') ? '#ef4444' : '#22c55e',
          }}
        >
          {saveMsg}
        </motion.span>
      )}
    </div>
  )
}
