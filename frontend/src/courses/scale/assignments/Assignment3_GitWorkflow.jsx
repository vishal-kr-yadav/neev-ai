import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'scale'
const ASSIGNMENT_ID = 3
const TOTAL_QUESTIONS = 11

const SECTIONS = [
  { id: 'chaos', num: 1, title: 'Current Chaos Analysis', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { id: 'branching', num: 2, title: 'Branching Strategy Design', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'conflicts', num: 3, title: 'Merge Conflict Resolution', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { id: 'pr', num: 4, title: 'Pull Request Process', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { id: 'cicd', num: 5, title: 'CI/CD for FinPay', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'hotfix', num: 6, title: 'Hotfix Scenario', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { id: 'hindi', num: 7, title: 'Hindi Summary', gradient: 'linear-gradient(135deg, #ff9933, #e67e22)' },
]

const MCQ_Q2 = {
  question: 'What is the FIRST step to fixing a broken Git workflow?',
  options: [
    { key: 'a', text: 'Buy better servers' },
    { key: 'b', text: 'Establish branch protection rules and require pull requests' },
    { key: 'c', text: 'Fire the developers' },
    { key: 'd', text: 'Switch from Git to SVN' },
  ],
  answer: 'b',
}

const MCQ_Q6 = {
  question: 'When you encounter a merge conflict, what should you NEVER do?',
  options: [
    { key: 'a', text: 'Discuss with the other developer' },
    { key: 'b', text: 'Accept only your changes without reading theirs' },
    { key: 'c', text: 'Use a merge tool to visualize differences' },
    { key: 'd', text: 'Test the resolved code before committing' },
  ],
  answer: 'b',
}

const MCQ_Q10 = {
  question: 'For a payment processing app, which CI/CD check is MOST critical?',
  options: [
    { key: 'a', text: 'CSS linting' },
    { key: 'b', text: 'Security vulnerability scanning and payment compliance tests' },
    { key: 'c', text: 'Code formatting (prettier)' },
    { key: 'd', text: 'Bundle size check' },
  ],
  answer: 'b',
}

/* ─── SHARED STYLES ─── */
const crd = {
  background: 'var(--bg-card)', borderRadius: 20,
  border: '1px solid var(--border)', padding: 28, marginBottom: 20,
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
  if (resp.q1 && resp.q1.trim()) count++
  if (resp.q2) count++
  if (resp.q3 && resp.q3.trim()) count++
  if (resp.q4 && resp.q4.trim()) count++
  if (resp.q5 && resp.q5.trim()) count++
  if (resp.q6) count++
  if (resp.q7 && resp.q7.trim()) count++
  if (resp.q8 && resp.q8.trim()) count++
  if (resp.q9 && resp.q9.trim()) count++
  if (resp.q10) count++
  if (resp.q11 && resp.q11.trim()) count++
  return count
}

/* ─── MCQ WIDGET ─── */
function McqQuestion({ qNum, mcq, value, onChange, submitted }) {
  const isCorrect = value === mcq.answer
  return (
    <div style={crd}>
      <label style={lb}>Q{qNum}: {mcq.question}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mcq.options.map(opt => {
          const selected = value === opt.key
          const showFeedback = submitted && selected
          let borderColor = 'var(--border)'
          let bg = 'var(--bg-secondary)'
          if (selected && !submitted) {
            borderColor = 'var(--accent)'
            bg = 'rgba(6,182,212,0.08)'
          }
          if (showFeedback && isCorrect) {
            borderColor = '#22c55e'
            bg = 'rgba(34,197,94,0.08)'
          }
          if (showFeedback && !isCorrect) {
            borderColor = '#ef4444'
            bg = 'rgba(239,68,68,0.08)'
          }
          if (submitted && opt.key === mcq.answer && !selected) {
            borderColor = '#22c55e'
            bg = 'rgba(34,197,94,0.06)'
          }
          return (
            <button
              key={opt.key}
              onClick={() => !submitted && onChange(opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12, cursor: submitted ? 'default' : 'pointer',
                border: `2px solid ${borderColor}`, background: bg,
                textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                border: selected ? 'none' : '2px solid var(--border)',
                background: selected ? (submitted ? (isCorrect ? '#22c55e' : '#ef4444') : 'var(--accent)') : 'transparent',
                color: selected ? '#fff' : 'var(--text-secondary)',
              }}>
                {opt.key.toUpperCase()}
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{opt.text}</span>
            </button>
          )
        })}
      </div>
      {submitted && value && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 14, padding: '10px 16px', borderRadius: 10,
            background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
            color: isCorrect ? '#22c55e' : '#ef4444',
            fontSize: 14, fontWeight: 600,
          }}
        >
          {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${mcq.answer.toUpperCase()}.`}
        </motion.div>
      )}
    </div>
  )
}

/* ─── TEXTAREA WITH CHAR COUNT ─── */
function TextArea({ qNum, label, placeholder, rows, value, onChange }) {
  const len = (value || '').length
  return (
    <div style={crd}>
      <label style={lb}>Q{qNum}: {label}</label>
      <textarea
        rows={rows || 6}
        style={ta}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
      <div style={{
        display: 'flex', justifyContent: 'flex-end', marginTop: 6,
        fontSize: 12, color: 'var(--text-secondary)',
      }}>
        {len} characters
      </div>
    </div>
  )
}

/* ─── SECTION CARD ─── */
function SectionCard({ section, expanded, onToggle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: section.num * 0.05 }}
      style={{
        background: 'var(--bg-card)', borderRadius: 20,
        border: '1px solid var(--border)', marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '20px 28px', border: 'none', cursor: 'pointer',
          background: expanded ? section.gradient : 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
            background: expanded ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
            color: expanded ? '#fff' : 'var(--text-secondary)',
          }}>
            {section.num}
          </span>
          <span style={{
            fontSize: 17, fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: expanded ? '#fff' : 'var(--text-primary)',
          }}>
            {section.title}
          </span>
        </div>
        <span style={{
          fontSize: 20, color: expanded ? '#fff' : 'var(--text-secondary)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
        }}>
          &#9660;
        </span>
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ padding: 28 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

/* =====================================================================
   ROOT COMPONENT
   ===================================================================== */
export default function Assignment3_GitWorkflow() {
  const { saveAssignment, getAssignment } = useAuth()
  const [resp, setResp] = useState({})
  const [expanded, setExpanded] = useState({ chaos: true })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState({})
  const [loaded, setLoaded] = useState(false)

  /* Load saved responses on mount */
  useEffect(() => {
    async function load() {
      try {
        const data = await getAssignment(COURSE_ID, ASSIGNMENT_ID)
        if (data && data.responses) {
          setResp(data.responses)
          if (data.submitted) setSubmitted(true)
        }
      } catch (_) {
        /* ignore load errors */
      }
      setLoaded(true)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const put = (field, val) => setResp(prev => ({ ...prev, [field]: val }))
  const get = (field) => resp[field] || ''

  const toggleSection = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const answered = countAnswered(resp)

  /* Save progress for a section */
  const handleSave = async (sectionId) => {
    setSaving(prev => ({ ...prev, [sectionId]: true }))
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, resp, false)
    } catch (_) {
      /* ignore save errors */
    }
    setTimeout(() => setSaving(prev => ({ ...prev, [sectionId]: false })), 1200)
  }

  /* Final submit */
  const handleSubmit = async () => {
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, resp, true)
      setSubmitted(true)
    } catch (_) {
      /* ignore submit errors */
    }
  }

  /* Save button per section */
  const SaveBtn = ({ sectionId }) => (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => handleSave(sectionId)}
      style={{
        marginTop: 16, padding: '10px 28px', borderRadius: 10,
        border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        background: saving[sectionId] ? '#22c55e' : 'var(--accent)',
        color: '#fff', transition: 'background 0.3s',
      }}
    >
      {saving[sectionId] ? 'Saved!' : 'Save Progress'}
    </motion.button>
  )

  /* ── SUBMITTED STATE ── */
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
          <h1 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 32, marginBottom: 16,
          }}>
            Assignment Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Your Git workflow design for FinPay will be reviewed. You answered {answered} out of {TOTAL_QUESTIONS} questions.
          </p>
          <div style={{ ...crd, textAlign: 'left' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              Submission Summary
            </h3>
            {SECTIONS.map(sec => {
              const sectionQuestions = {
                chaos: ['q1', 'q2'], branching: ['q3', 'q4'], conflicts: ['q5', 'q6'],
                pr: ['q7', 'q8'], cicd: ['q9', 'q10'], hotfix: ['q11'], hindi: [],
              }
              const qs = sectionQuestions[sec.id] || []
              const filled = qs.filter(q => resp[q] && (typeof resp[q] === 'string' ? resp[q].trim() : resp[q])).length
              const ok = qs.length === 0 || filled > 0
              return (
                <div key={sec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: ok ? '#22c55e' : 'var(--text-secondary)', fontSize: 16 }}>
                    {ok ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 24 }}>S{sec.num}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{sec.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: ok ? '#22c55e' : 'var(--text-secondary)' }}>
                    {qs.length === 0 ? 'Reference' : ok ? `${filled}/${qs.length}` : 'Skipped'}
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

  if (!loaded) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Loading...</p>
      </div>
    )
  }

  /* ── MAIN LAYOUT ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 30, margin: '0 0 10px',
          }}>
            Git Workflow Challenge — FinPay Team
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, margin: '0 0 20px' }}>
            You're the tech lead at FinPay, a fintech startup building a UPI payment app.
            Your team of 5 developers is growing fast. Currently everyone pushes to main
            directly — chaos! Features break production weekly. You need to design a proper
            Git workflow, resolve real conflicts, and set up CI/CD.
          </p>

          {/* Progress bar */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: '16px 20px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Progress</span>
              <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>
                {answered}/{TOTAL_QUESTIONS} answered
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(answered / TOTAL_QUESTIONS) * 100}%` }}
                style={{
                  height: '100%', borderRadius: 3,
                  background: answered === TOTAL_QUESTIONS
                    ? 'linear-gradient(90deg, #22c55e, #10b981)'
                    : 'linear-gradient(90deg, var(--accent), #3b82f6)',
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 1: Current Chaos Analysis ── */}
        <SectionCard section={SECTIONS[0]} expanded={expanded.chaos} onToggle={() => toggleSection('chaos')}>
          <TextArea
            qNum={1}
            label="List 5 specific problems that happen when all developers push directly to main branch without any workflow."
            placeholder="Think about: broken builds, untested code in production, overwritten changes, no accountability, deployment nightmares..."
            rows={7}
            value={get('q1')}
            onChange={v => put('q1', v)}
          />
          <McqQuestion
            qNum={2}
            mcq={MCQ_Q2}
            value={get('q2')}
            onChange={v => put('q2', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="chaos" />
        </SectionCard>

        {/* ── SECTION 2: Branching Strategy Design ── */}
        <SectionCard section={SECTIONS[1]} expanded={expanded.branching} onToggle={() => toggleSection('branching')}>
          <TextArea
            qNum={3}
            label="Choose a branching strategy for FinPay (Gitflow, GitHub Flow, or Trunk-Based). Justify your choice considering: team size (5 devs), release cycle (weekly releases), and the fact that it's a payment app (high compliance requirements)."
            placeholder="Compare the strategies. Gitflow has develop + release branches, GitHub Flow is simpler with feature branches off main, Trunk-Based uses short-lived branches. Which fits a fintech team with strict compliance?"
            rows={10}
            value={get('q3')}
            onChange={v => put('q3', v)}
          />
          <TextArea
            qNum={4}
            label="Draw the branch structure in text form. Example: main ← develop ← feature/* List all branch types, what they're for, and naming conventions."
            placeholder={"Example:\nmain (production-ready, protected)\n  ← develop (integration branch)\n    ← feature/UPI-123-qr-scanner\n    ← feature/UPI-456-payment-history\n  ← release/v1.2.0\n  ← hotfix/fix-zero-txn\n\nNaming convention: feature/TICKET-short-desc, hotfix/brief-desc, release/vX.Y.Z"}
            rows={8}
            value={get('q4')}
            onChange={v => put('q4', v)}
          />
          <SaveBtn sectionId="branching" />
        </SectionCard>

        {/* ── SECTION 3: Merge Conflict Resolution ── */}
        <SectionCard section={SECTIONS[2]} expanded={expanded.conflicts} onToggle={() => toggleSection('conflicts')}>
          <TextArea
            qNum={5}
            label={"Two developers edited the same payment validation function. Developer A changed the max transaction limit from ₹1,00,000 to ₹2,00,000. Developer B added UPI ID format validation to the same function. Write out what the conflict would look like (with <<<<<<< markers) and how you'd resolve it to keep BOTH changes."}
            placeholder={"Show the conflict markers:\n<<<<<<< feature/increase-limit\nfunction validatePayment(amount, upiId) {\n  if (amount > 200000) throw new Error('Exceeds limit');\n=======\nfunction validatePayment(amount, upiId) {\n  if (amount > 100000) throw new Error('Exceeds limit');\n  if (!/^[\\w.-]+@[\\w]+$/.test(upiId)) throw new Error('Invalid UPI ID');\n>>>>>>> feature/upi-validation\n\nThen show the resolved version keeping BOTH changes..."}
            rows={12}
            value={get('q5')}
            onChange={v => put('q5', v)}
          />
          <McqQuestion
            qNum={6}
            mcq={MCQ_Q6}
            value={get('q6')}
            onChange={v => put('q6', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="conflicts" />
        </SectionCard>

        {/* ── SECTION 4: Pull Request Process ── */}
        <SectionCard section={SECTIONS[3]} expanded={expanded.pr} onToggle={() => toggleSection('pr')}>
          <TextArea
            qNum={7}
            label="Design a PR template for FinPay. What sections should every PR include? (Think about: description, testing, compliance, screenshots, etc.) Write a sample PR description for a feature that adds UPI QR code scanning."
            placeholder={"## PR Template for FinPay\n\n### Description\nWhat does this PR do and why?\n\n### Type of Change\n[ ] Feature  [ ] Bugfix  [ ] Hotfix  [ ] Config\n\n### Testing Done\n- Unit tests added/updated\n- Manual testing steps\n\n### Compliance Checklist\n- [ ] No PII exposed in logs\n- [ ] Payment flow tested with edge amounts\n\n### Screenshots / Demo\n\n### Reviewer Notes\n\n---\nNow write a sample filled-out PR for UPI QR code scanning feature..."}
            rows={14}
            value={get('q7')}
            onChange={v => put('q7', v)}
          />
          <TextArea
            qNum={8}
            label="How many reviewers should approve a PR before merging? Should the rules be different for different types of changes (feature vs hotfix vs config)? Explain your policy."
            placeholder="Consider: feature PRs may need 2 reviewers including a senior, hotfixes might need 1 reviewer for speed, config changes might need DevOps approval. What about auto-merge for certain types? CODEOWNERS file?"
            rows={7}
            value={get('q8')}
            onChange={v => put('q8', v)}
          />
          <SaveBtn sectionId="pr" />
        </SectionCard>

        {/* ── SECTION 5: CI/CD for FinPay ── */}
        <SectionCard section={SECTIONS[4]} expanded={expanded.cicd} onToggle={() => toggleSection('cicd')}>
          <TextArea
            qNum={9}
            label="Design a CI/CD pipeline for FinPay. Since it handles real money, what extra checks are needed compared to a regular web app? Include: security scanning, compliance checks, and what happens if any step fails."
            placeholder={"Pipeline stages:\n1. Lint & Format Check\n2. Unit Tests\n3. Integration Tests\n4. Security Scan (SAST/DAST)\n5. Dependency Vulnerability Check\n6. Payment Compliance Tests (PCI DSS checks)\n7. Build & Container Scan\n8. Staging Deploy + Smoke Tests\n9. Manual Approval Gate\n10. Production Deploy (canary/blue-green)\n\nFor each stage: what happens on failure? Who gets notified? Is it a hard blocker or soft warning?"}
            rows={14}
            value={get('q9')}
            onChange={v => put('q9', v)}
          />
          <McqQuestion
            qNum={10}
            mcq={MCQ_Q10}
            value={get('q10')}
            onChange={v => put('q10', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="cicd" />
        </SectionCard>

        {/* ── SECTION 6: Hotfix Scenario ── */}
        <SectionCard section={SECTIONS[5]} expanded={expanded.hotfix} onToggle={() => toggleSection('hotfix')}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 14, padding: '18px 22px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>&#x1F6A8;</span>
              <h3 style={{ color: '#ef4444', margin: 0, fontFamily: 'var(--font-heading)', fontSize: 16 }}>
                PRODUCTION INCIDENT
              </h3>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              It's Saturday night. A critical bug in production — <strong>{'₹'}0 transactions are going through!</strong> Users
              are sending payments of {'₹'}0 and merchants are shipping products. The losses are mounting every minute.
            </p>
          </div>
          <TextArea
            qNum={11}
            label="Describe step-by-step: How do you create a hotfix branch? What tests do you run? How do you deploy it? How do you merge it back? Be specific with git commands."
            placeholder={"Step-by-step with actual git commands:\n\n1. Acknowledge & communicate:\n   - Notify the team on Slack/PagerDuty\n\n2. Create hotfix branch:\n   git checkout main\n   git pull origin main\n   git checkout -b hotfix/fix-zero-amount-txn\n\n3. Fix the bug:\n   - Add validation: if (amount <= 0) throw Error\n   - Write test for zero amount\n\n4. Test:\n   npm test -- --grep 'payment validation'\n   npm run test:integration\n\n5. Fast-track PR & deploy:\n   git push origin hotfix/fix-zero-amount-txn\n   - Create PR, get 1 emergency reviewer\n   - Deploy to staging, smoke test\n   - Deploy to production\n\n6. Merge back:\n   git checkout develop\n   git merge hotfix/fix-zero-amount-txn\n   git push origin develop"}
            rows={16}
            value={get('q11')}
            onChange={v => put('q11', v)}
          />
          <SaveBtn sectionId="hotfix" />
        </SectionCard>

        {/* ── SECTION 7: Hindi Summary ── */}
        <SectionCard section={SECTIONS[6]} expanded={expanded.hindi} onToggle={() => toggleSection('hindi')}>
          <HindiExplainer
            concept="Git वर्कव्लो और CI/CD"
            english="Git Workflow for Teams"
            explanation="Team में Git workflow होना ज़रूरी है — बिना workflow सब एक दूसरे का code तोड़ देंगे। Branch protection लगाओ, PR mandatory करो, CI/CD से automatically test करो। Payment app है तो security scanning extra ज़रूरी। Hotfix के लिए अलग process रखो ताकि emergency में fast fix हो।"
            example="PhonePe जैसी company में हर code change पर 100+ automated tests चलते हैं, 2 reviewers approve करते हैं, security scan होता है — तब जाकर production में जाता है। Saturday night bug? Hotfix branch बनाओ, fix करो, fast-track review करो, deploy करो — 30 min में fix live!"
            terms={[
              { hindi: 'ब्रांच प्रोटेक्शन', english: 'Branch Protection', meaning: 'main branch पर direct push बंद — सिर्फ PR से merge' },
              { hindi: 'हॉटफ़िक्स', english: 'Hotfix', meaning: 'Production में urgent bug fix — special fast-track process' },
              { hindi: 'कोड रिव्यू', english: 'Code Review', meaning: 'Team member code check करे merge से पहले' },
            ]}
          />
        </SectionCard>

        {/* ── SUBMIT FINAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            ...crd, textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(6,182,212,0.06))',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 20, margin: '0 0 8px',
          }}>
            Ready to Submit?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
            You have answered <strong>{answered}</strong> out of <strong>{TOTAL_QUESTIONS}</strong> questions.
            You can submit even with incomplete answers and revisit later.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            style={{
              padding: '14px 48px', fontSize: 17, fontWeight: 700,
              fontFamily: 'var(--font-heading)', borderRadius: 14, cursor: 'pointer',
              border: 'none', color: '#fff',
              background: 'linear-gradient(135deg, #3b82f6, var(--accent))',
              boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
            }}
          >
            Submit Final
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
