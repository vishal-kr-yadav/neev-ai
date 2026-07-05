import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── DATA ─── */
const REGULATORY_REQUIREMENTS = [
  { id: 'takedown', label: 'Takedown within 36 hours', desc: 'IT Rules 2021 require removal of flagged content within 36 hours of receiving complaint from government or court order.' },
  { id: 'grievance', label: 'Grievance Officer appointment', desc: 'Significant social media intermediaries must appoint a Grievance Officer, a Chief Compliance Officer, and a Nodal Contact Person.' },
  { id: 'traceability', label: 'First originator traceability', desc: 'Platforms must identify the first originator of information that threatens sovereignty, security, or public order when ordered by court.' },
  { id: 'monthly_report', label: 'Monthly compliance reports', desc: 'Publish monthly reports detailing complaints received, actions taken, and content removed — categorized by type.' },
  { id: 'automated_tools', label: 'Proactive content monitoring', desc: 'Deploy technology-based measures including AI/ML to proactively identify and remove unlawful content.' },
  { id: 'user_verification', label: 'Voluntary user verification', desc: 'Provide users with a voluntary mechanism to verify their identity for account credibility.' },
  { id: 'data_localization', label: 'Data localization requirements', desc: 'Certain user data and moderation records must be stored on servers located within India.' },
]

const CONTENT_CATEGORIES = [
  { id: 'hate_speech', label: 'Hate Speech', desc: 'Content promoting hatred or violence against individuals or groups based on religion, caste, gender, or ethnicity.', severity: 'critical' },
  { id: 'misinformation', label: 'Misinformation / Fake News', desc: 'False or misleading information that could cause public harm, health risks, or communal tension.', severity: 'high' },
  { id: 'adult_content', label: 'Adult / CSAM Content', desc: 'Sexually explicit material, especially any content involving minors — zero tolerance under POCSO Act.', severity: 'critical' },
  { id: 'political', label: 'Political Sensitivity', desc: 'Content related to elections, political figures, government criticism — must balance free speech with IT Act provisions.', severity: 'medium' },
  { id: 'religious', label: 'Religious Sensitivity', desc: 'Content that could hurt religious sentiments or incite communal tensions — governed by IPC Sec 295A and IT Act.', severity: 'high' },
  { id: 'caste', label: 'Caste-based Discrimination', desc: 'Content promoting untouchability, caste supremacy, or derogatory references to specific communities.', severity: 'critical' },
  { id: 'terrorism', label: 'Terrorism / Extremism', desc: 'Content glorifying terrorist acts, recruiting for extremist groups, or threatening national security.', severity: 'critical' },
  { id: 'defamation', label: 'Defamation', desc: 'Content that damages reputation of individuals — India has both civil and criminal defamation laws.', severity: 'medium' },
  { id: 'spam', label: 'Spam / Scam', desc: 'Fraudulent content, phishing links, fake giveaways, cryptocurrency scams targeting Indian users.', severity: 'low' },
  { id: 'self_harm', label: 'Self-Harm / Suicide', desc: 'Content promoting or glorifying self-harm or suicide — must comply with Mental Healthcare Act 2017.', severity: 'critical' },
]

const SAMPLE_POSTS = [
  {
    id: 'post1',
    text: '"Ye log kabhi nahi sudhrenge. Inko desh se bahar nikalo. #GoBack"',
    lang: 'Hinglish',
    context: 'Posted during a protest against migrant workers in a metro city.',
    difficulty: 'Hard',
  },
  {
    id: 'post2',
    text: '"BREAKING: Government to ban all private banks by next month. Withdraw your money NOW! Share with everyone!!"',
    lang: 'English',
    context: 'Viral post with 50K shares. No credible source cited.',
    difficulty: 'Medium',
  },
  {
    id: 'post3',
    text: '"Bhai vaccine lagne ke baad 5G signal aata hai phone mein, maine khud try kiya. Dont take vaccine. #NoVaccine"',
    lang: 'Hinglish',
    context: 'Posted during a vaccination drive. 10K likes.',
    difficulty: 'Medium',
  },
  {
    id: 'post4',
    text: '"This new policy by the CM is the worst decision in 50 years. Complete incompetence. The entire cabinet should resign."',
    lang: 'English',
    context: 'Posted by a verified journalist account with 100K followers.',
    difficulty: 'Hard',
  },
  {
    id: 'post5',
    text: '"Arre yaar, is community ke log sirf ek hi kaam karte hain... sabko pata hai kya. Not being casteist, just facts."',
    lang: 'Hinglish',
    context: 'Casual comment on a discussion thread about unemployment.',
    difficulty: 'Hard',
  },
]

const GRAY_AREA_SCENARIOS = [
  {
    id: 'satire',
    title: 'Political Satire or Hate Speech?',
    content: 'A popular meme page posts a cartoon showing a politician as a donkey with the caption: "Election season — when even donkeys become leaders. Every caste, every party, same circus." Uses caricatures of real politicians from different communities.',
    factors: ['Satire is protected speech under Article 19', 'Could be seen as disrespectful to political figures', 'References caste indirectly', 'Meme page has history of balanced political satire'],
  },
  {
    id: 'news_misinfo',
    title: 'Citizen Journalism or Misinformation?',
    content: 'A user posts a video claiming a bridge in their village collapsed due to corruption, with text: "100 crore spent, bridge broke in 6 months. Contractor is XYZ from ABC party." The video shows a damaged bridge but claims are unverified.',
    factors: ['Could be genuine citizen reporting', 'Names a specific individual without evidence', 'Defamation risk if claims are false', 'Public interest in infrastructure failures'],
  },
  {
    id: 'religious_expr',
    title: 'Religious Expression or Communal Incitement?',
    content: 'During a festival, a user posts: "Our festival is the most beautiful in the world. Other communities should learn from us how to celebrate without making noise and mess. We are a cultured people." Gets 5K shares.',
    factors: ['Celebrating own culture is protected', 'Implicit comparison degrades other communities', 'Could escalate communal tension in mixed neighborhoods', 'Festival season sees spike in communal posts'],
  },
  {
    id: 'health_trad',
    title: 'Traditional Medicine Advocacy or Health Misinformation?',
    content: '"Why take allopathic medicine when Ayurveda has cure for everything? My grandmother cured diabetes with haldi and neem. Stop going to doctors, they just want your money. #AyurvedaIsBest"',
    factors: ['Ayurveda is a recognized medical system in India', 'Claims specific cure for chronic disease without evidence', 'Could discourage people from seeking medical treatment', 'Anti-doctor sentiment could harm public health'],
  },
]

const LANGUAGE_STRATEGIES = [
  { id: 'single_model', label: 'Single Multilingual Model', desc: 'Use one large model that handles all languages. Simpler architecture but may be weaker on low-resource languages like Bhojpuri or Manipuri.' },
  { id: 'per_lang', label: 'Language-specific Models', desc: 'Deploy separate fine-tuned models per language family. Better accuracy but higher infrastructure cost and complexity.' },
  { id: 'translate_first', label: 'Translate-then-Classify', desc: 'Translate all content to English/Hindi first, then classify. Loses nuance and code-switching patterns.' },
  { id: 'hybrid_lang', label: 'Hybrid Approach', desc: 'Multilingual base model with language-specific adapters for high-risk content categories. Balance of accuracy and cost.' },
  { id: 'ensemble', label: 'Ensemble with Language Detection', desc: 'Detect language first, route to specialized pipeline. Best accuracy, highest complexity.' },
]

const INDIAN_LANGUAGES = [
  'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi',
  'Assamese', 'Urdu', 'Hinglish', 'Tanglish', 'Banglish',
]

const WORKFLOW_COMPONENTS = [
  { id: 'queue', label: 'Priority Queue System', desc: 'Route flagged content to review queues based on severity, language, and content type.' },
  { id: 'confidence', label: 'Confidence Thresholds', desc: 'Auto-action on high confidence (>95%), auto-approve on very low flag probability (<5%), queue middle range for human review.' },
  { id: 'expertise_routing', label: 'Expertise-based Routing', desc: 'Route content to reviewers with relevant language skills, cultural knowledge, or legal expertise.' },
  { id: 'appeals_panel', label: 'Multi-reviewer Appeals Panel', desc: 'Appealed decisions reviewed by panel of 3+ reviewers with majority vote.' },
  { id: 'time_sla', label: 'SLA-based Escalation', desc: 'Auto-escalate if content is not reviewed within SLA (e.g., 4 hours for high severity).' },
  { id: 'audit_trail', label: 'Decision Audit Trail', desc: 'Log every decision with reasoning, reviewer ID, timestamp, and AI confidence score.' },
  { id: 'feedback_loop', label: 'Reviewer Feedback Loop', desc: 'Human decisions fed back to retrain and improve AI model accuracy over time.' },
  { id: 'creator_notify', label: 'Creator Notification System', desc: 'Notify content creators of actions taken with clear reasoning and appeal instructions.' },
]

const KPIS = [
  { id: 'precision', label: 'Moderation Precision', desc: 'Percentage of flagged content that was truly violating. Low precision means over-censorship.' },
  { id: 'recall', label: 'Moderation Recall', desc: 'Percentage of violating content that was caught. Low recall means harmful content slips through.' },
  { id: 'latency', label: 'Detection Latency (p50/p95)', desc: 'Time from content posting to moderation decision. Critical for viral harmful content.' },
  { id: 'appeal_overturn', label: 'Appeal Overturn Rate', desc: 'Percentage of moderation decisions reversed on appeal. High rate indicates AI/process issues.' },
  { id: 'false_positive', label: 'False Positive Rate by Category', desc: 'Breakdown of incorrect flags per content category. Helps identify model weaknesses.' },
  { id: 'language_accuracy', label: 'Per-language Accuracy', desc: 'Moderation accuracy across different languages. Ensures equitable content moderation.' },
  { id: 'human_review_vol', label: 'Human Review Volume', desc: 'Number of items requiring human review. Tracks AI confidence and operational load.' },
  { id: 'compliance_takedown', label: 'MEITY Compliance Takedown Time', desc: 'Average time to action government/court-ordered takedowns. Must be under 36 hours.' },
  { id: 'user_report_response', label: 'User Report Response Time', desc: 'Time from user complaint to acknowledgment and action. Impacts user trust.' },
  { id: 'reviewer_agreement', label: 'Inter-reviewer Agreement', desc: 'How often human reviewers agree with each other. Measures guideline clarity.' },
]

const SECTIONS = [
  { id: 'briefing', num: 1, title: 'Scenario Briefing', icon: '\u{1F4CB}' },
  { id: 'taxonomy', num: 2, title: 'Content Classification Taxonomy', icon: '\u{1F5C2}' },
  { id: 'prompts', num: 3, title: 'Prompt Engineering for Moderation', icon: '\u{1F4DD}' },
  { id: 'grayareas', num: 4, title: 'Handling Gray Areas', icon: '\u{2696}' },
  { id: 'multilang', num: 5, title: 'Multi-language Support', icon: '\u{1F310}' },
  { id: 'appeal', num: 6, title: 'Appeal & Review System', icon: '\u{1F465}' },
  { id: 'metrics', num: 7, title: 'Metrics & Monitoring', icon: '\u{1F4CA}' },
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
function hasFill(resp, sid) {
  const s = resp[sid]
  if (!s) return false
  return Object.values(s).some(v => {
    if (typeof v === 'string') return v.trim().length > 0
    if (typeof v === 'number') return true
    if (typeof v === 'boolean') return true
    if (Array.isArray(v)) return v.length > 0
    if (v && typeof v === 'object') return Object.keys(v).length > 0
    return v != null && v !== ''
  })
}

/* ─── REUSABLE WIDGETS ─── */
function SelectCard({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...crd, padding: 16, cursor: 'pointer', textAlign: 'left', width: '100%',
      border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
      background: active ? 'rgba(6,182,212,0.06)' : 'var(--bg-secondary)',
      transition: 'all 0.15s',
    }}>
      {children}
    </button>
  )
}

function ToggleSwitch({ active, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: active ? 'var(--accent)' : 'var(--bg-secondary)',
      position: 'relative', flexShrink: 0, transition: 'background 0.2s',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: active ? 22 : 4, transition: 'left 0.2s',
      }} />
    </button>
  )
}

function PillSelect({ options, selected, onToggle, multi = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const isActive = multi
          ? (selected || []).includes(opt)
          : selected === opt
        return (
          <button key={opt} onClick={() => onToggle(opt)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
            border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
            background: isActive ? 'rgba(6,182,212,0.12)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: isActive ? 600 : 400, transition: 'all 0.15s',
          }}>
            {opt}
          </button>
        )
      })}
    </div>
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

function SeverityBadge({ severity }) {
  const colors = {
    critical: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    high: { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
    medium: { bg: 'rgba(250,204,21,0.15)', color: '#eab308' },
    low: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  }
  const c = colors[severity] || colors.medium
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
      background: c.bg, color: c.color, textTransform: 'uppercase',
    }}>
      {severity}
    </span>
  )
}

/* =====================================================================
   ROOT COMPONENT
   ===================================================================== */
export default function Assignment2_ContentMod() {
  const [sec, setSec] = useState('briefing')
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
            Your content moderation system design will be reviewed by an AI instructor who will provide personalized feedback on your regulatory compliance, classification approach, and operational strategy.
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
              AI Instructor Review
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              An LLM judge will evaluate your responses across regulatory understanding, content taxonomy design, prompt quality, gray area handling, multilingual strategy, human review workflows, and monitoring readiness. Detailed feedback coming soon.
            </p>
          </div>
          <AIEvaluationPanel courseId="llm" assignmentId={2} />
        </motion.div>
      </div>
    )
  }

  /* ── SECTION MAP ── */
  const views = {
    briefing: <S1 key="s1" g={get} s={put} />,
    taxonomy: <S2 key="s2" g={get} s={put} />,
    prompts: <S3 key="s3" g={get} s={put} />,
    grayareas: <S4 key="s4" g={get} s={put} />,
    multilang: <S5 key="s5" g={get} s={put} />,
    appeal: <S6 key="s6" g={get} s={put} />,
    metrics: <S7 key="s7" g={get} s={put} />,
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
            Content Moderation System
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Assignment 2 &mdash; Case Study</p>
        </div>
        {/* Progress */}
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Progress</span>
            <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>{filled}/{SECTIONS.length} sections</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2 }}>
            <motion.div
              animate={{ width: `${(filled / SECTIONS.length) * 100}%` }}
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
          {/* Submit nav */}
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

/* =====================================================================
   SECTION 1 — Scenario Briefing
   ===================================================================== */
function S1({ g, s }) {
  const selectedReqs = g('briefing', 'selectedReqs', [])

  const toggleReq = (id) => {
    const current = selectedReqs || []
    if (current.includes(id)) {
      s('briefing', 'selectedReqs', current.filter(r => r !== id))
    } else {
      s('briefing', 'selectedReqs', [...current, id])
    }
  }

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'\u{1F4CB}'} title="Scenario Briefing"
        desc="You are the AI lead at a fast-growing Indian social media startup. Your platform has 50 million monthly active users across India, and MEITY has flagged you as a 'Significant Social Media Intermediary' (SSMI). You must now build an AI-powered content moderation system compliant with the IT Act 2021 Rules." />

      {/* Context Card */}
      <div style={{
        ...crd, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02))',
        border: '1px solid rgba(249,115,22,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>{'\u{1F3DB}'}</span>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', fontSize: 18 }}>
            Regulatory Context
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
          Under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, your platform must proactively moderate content, respond to government takedown orders within 36 hours, appoint compliance officers, and publish monthly transparency reports. Non-compliance can result in loss of safe harbour protection under Section 79 of the IT Act.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Monthly Users', value: '50M+', color: '#f97316' },
            { label: 'Daily Posts', value: '2M+', color: '#8b5cf6' },
            { label: 'Languages', value: '12+', color: '#3b82f6' },
            { label: 'Compliance Deadline', value: '90 Days', color: '#ef4444' },
          ].map(st => (
            <div key={st.label} style={{
              background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 12px',
              textAlign: 'center', border: `1px solid ${st.color}33`,
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: st.color, marginBottom: 4 }}>{st.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      <HindiExplainer
        concept="Content Moderation"
        english="Content Moderation"
        explanation="कंटेंट मॉडरेशन का मतलब है सोशल मीडिया पर लोगों द्वारा डाली गई सामग्री (पोस्ट, फोटो, वीडियो) की जांच करना और हानिकारक सामग्री को हटाना। यह एक AI सिस्टम से किया जा सकता है जो ऑटोमैटिकली गलत कंटेंट पहचानता है।"
        example="जैसे WhatsApp पर कोई फेक न्यूज़ भेजता है, तो AI सिस्टम उसे पहचानकर ब्लॉक कर सकता है — यही कंटेंट मॉडरेशन है।"
        terms={[
          { hindi: 'मॉडरेशन', english: 'Moderation', meaning: 'सामग्री की जांच और नियंत्रण' },
          { hindi: 'सेफ हार्बर', english: 'Safe Harbour', meaning: 'कानूनी सुरक्षा जो प्लेटफॉर्म को यूजर कंटेंट की ज़िम्मेदारी से बचाती है' },
          { hindi: 'टेकडाउन', english: 'Takedown', meaning: 'हानिकारक सामग्री को प्लेटफॉर्म से हटाना' },
        ]}
      />

      {/* Regulatory Requirements Selection */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Key Regulatory Requirements
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Select the requirements you consider most critical for your AI moderation system to address first. Consider which ones have the strictest deadlines or highest legal risk.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REGULATORY_REQUIREMENTS.map(req => {
            const active = (selectedReqs || []).includes(req.id)
            return (
              <div key={req.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: active ? 'rgba(6,182,212,0.06)' : 'var(--bg-secondary)',
                border: active ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--border)',
                transition: 'all 0.2s',
              }}>
                <ToggleSwitch active={active} onToggle={() => toggleReq(req.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{req.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{req.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Initial Strategy */}
      <div style={{ ...crd }}>
        <label style={lb}>
          Write your initial content moderation strategy. How will you approach building this system? What are your top 3 priorities and why?
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder="Consider: the regulatory deadline (90 days), the scale (2M+ daily posts in 12+ languages), the diversity of content types, the balance between free speech and safety, and the consequences of getting it wrong (loss of safe harbour, legal liability)..."
          value={g('briefing', 'strategy', '')}
          onChange={e => s('briefing', 'strategy', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SECTION 2 — Content Classification Taxonomy
   ===================================================================== */
function S2({ g, s }) {
  const selectedCats = g('taxonomy', 'selectedCategories', [])

  const toggleCat = (id) => {
    const current = selectedCats || []
    if (current.includes(id)) {
      s('taxonomy', 'selectedCategories', current.filter(c => c !== id))
    } else {
      s('taxonomy', 'selectedCategories', [...current, id])
    }
  }

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'\u{1F5C2}'} title="Content Classification Taxonomy"
        desc="Design the content categories your AI moderation system will use. In the Indian context, you must consider caste dynamics, communal sensitivities, regional politics, and India-specific legal frameworks like IPC Section 295A (hurting religious sentiments) and the SC/ST Prevention of Atrocities Act." />

      {/* Category Selection */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select Content Categories
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Choose the categories your moderation system should classify content into. Consider which ones are legally required vs. platform policy choices.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CONTENT_CATEGORIES.map(cat => {
            const active = (selectedCats || []).includes(cat.id)
            return (
              <div key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: active ? 'rgba(6,182,212,0.06)' : 'var(--bg-secondary)',
                border: active ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--border)',
                transition: 'all 0.2s', cursor: 'pointer',
              }} onClick={() => toggleCat(cat.id)}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? '#22c55e' : 'transparent',
                  border: active ? 'none' : '2px solid var(--border)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}>
                  {active ? '✓' : ''}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>{cat.label}</span>
                    <SeverityBadge severity={cat.severity} />
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{cat.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <HindiExplainer
        concept="Content Taxonomy"
        english="Content Taxonomy"
        explanation="टैक्सोनॉमी का मतलब है सामग्री को अलग-अलग श्रेणियों (categories) में बांटना। भारत में कंटेंट मॉडरेशन के लिए जाति, धर्म, राजनीति और क्षेत्रीय संवेदनशीलता जैसी खास श्रेणियां ज़रूरी हैं जो पश्चिमी प्लेटफॉर्म पर नहीं होतीं।"
        example="अमेरिकी प्लेटफॉर्म पर 'caste-based discrimination' कोई कैटेगरी नहीं होती, लेकिन भारत में यह बहुत ज़रूरी है क्योंकि ऐसा कंटेंट SC/ST Act के तहत अपराध है।"
        terms={[
          { hindi: 'वर्गीकरण', english: 'Classification', meaning: 'कंटेंट को सही श्रेणी में डालना' },
          { hindi: 'गंभीरता स्तर', english: 'Severity Level', meaning: 'कितना खतरनाक है — critical, high, medium, low' },
        ]}
      />

      {/* Custom Categories */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Add custom content categories specific to the Indian context that are not listed above. Think about what content types are unique to Indian social media.
        </label>
        <textarea
          rows={6}
          style={ta}
          placeholder="Examples: Deepfake content of politicians, cow-related communal content, inter-state rivalry/regionalism, fake educational certificates/job scams, content violating court orders (sub judice matters), anti-national sloganeering..."
          value={g('taxonomy', 'customCategories', '')}
          onChange={e => s('taxonomy', 'customCategories', e.target.value)}
        />
      </div>

      {/* Severity Matrix */}
      <div style={{ ...crd }}>
        <label style={lb}>
          Design a severity-action matrix: For each severity level (Critical, High, Medium, Low), define the automated action the AI should take (e.g., instant removal, flag for review, reduce distribution, warn user).
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder={`Example format:
CRITICAL: Immediately remove + notify legal team + preserve evidence for law enforcement + ban user pending review
HIGH: Remove content + notify user + queue for human review within 4 hours
MEDIUM: Reduce distribution + add warning label + queue for human review within 24 hours
LOW: ...`}
          value={g('taxonomy', 'severityMatrix', '')}
          onChange={e => s('taxonomy', 'severityMatrix', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SECTION 3 — Prompt Engineering for Moderation
   ===================================================================== */
function S3({ g, s }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'\u{1F4DD}'} title="Prompt Engineering for Moderation"
        desc="Write classification prompts that can detect nuanced content violations. Your prompts must handle code-switching (Hinglish), cultural context, and the fine line between free expression and harmful content." />

      {/* System Prompt */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write a system prompt for the content moderation LLM. It should instruct the model to classify content, explain its reasoning, assign a confidence score, and recommend an action.
        </label>
        <textarea
          rows={10}
          style={ta}
          placeholder={`Your prompt should cover:
- The role of the moderation AI
- Content categories it should classify into
- How to handle ambiguous content
- Output format (category, confidence, action, reasoning)
- Instructions for handling Hinglish and code-switched content
- Cultural context awareness for India...`}
          value={g('prompts', 'systemPrompt', '')}
          onChange={e => s('prompts', 'systemPrompt', e.target.value)}
        />
      </div>

      {/* Sample Posts Classification */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Classify Sample Posts
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 20px' }}>
          For each post below, provide your classification, confidence level, recommended action, and reasoning. Consider the context provided.
        </p>

        {SAMPLE_POSTS.map((post, idx) => (
          <div key={post.id} style={{
            marginBottom: idx < SAMPLE_POSTS.length - 1 ? 24 : 0,
            padding: 20, borderRadius: 16,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                background: 'rgba(6,182,212,0.12)', color: 'var(--accent)',
              }}>
                Post {idx + 1}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
              }}>
                {post.lang}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                background: post.difficulty === 'Hard' ? 'rgba(239,68,68,0.12)' : 'rgba(250,204,21,0.12)',
                color: post.difficulty === 'Hard' ? '#ef4444' : '#eab308',
              }}>
                {post.difficulty}
              </span>
            </div>
            <div style={{
              padding: '14px 16px', borderRadius: 12, marginBottom: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              fontStyle: 'italic', color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.6,
            }}>
              {post.text}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Context: {post.context}
            </div>
            <textarea
              rows={4}
              style={ta}
              placeholder={`Category: [e.g., Hate Speech / Misinformation / Political / Safe]
Confidence: [High / Medium / Low]
Action: [Remove / Flag for Review / Reduce Reach / Allow]
Reasoning: [Why did you classify it this way? What nuances did you consider?]`}
              value={g('prompts', `post_${post.id}`, '')}
              onChange={e => s('prompts', `post_${post.id}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Few-shot Examples */}
      <div style={{ ...crd }}>
        <label style={lb}>
          Write 2-3 few-shot examples that you would include in the prompt to help the LLM understand nuanced Indian content. Each example should show the content, the correct classification, and the reasoning.
        </label>
        <textarea
          rows={10}
          style={ta}
          placeholder={`Example format:
Content: 'Arre bhai, ye log toh sirf reservation pe jeete hain, kuch kaam nahi karte'
Classification: Caste-based Discrimination (HIGH severity)
Action: Remove + warn user
Reasoning: While framed as opinion, this generalizes an entire community negatively based on caste, reinforces stereotypes about reservation beneficiaries, and violates SC/ST Act provisions. The casual Hinglish tone does not reduce its discriminatory nature...`}
          value={g('prompts', 'fewShot', '')}
          onChange={e => s('prompts', 'fewShot', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SECTION 4 — Handling Gray Areas
   ===================================================================== */
function S4({ g, s }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'\u{2696}'} title="Handling Gray Areas"
        desc="Content moderation's hardest challenge: the gray zone. Satire vs. hate, news vs. misinformation, cultural expression vs. offensive content. In India, these boundaries are especially complex due to diverse cultural contexts, multiple legal frameworks, and politically sensitive environments." />

      {/* Gray Area Scenarios */}
      {GRAY_AREA_SCENARIOS.map((scenario, idx) => (
        <div key={scenario.id} style={{ ...crd, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
              background: 'rgba(234,179,8,0.15)', color: '#eab308',
            }}>
              GRAY AREA {idx + 1}
            </span>
            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17 }}>
              {scenario.title}
            </h3>
          </div>

          <div style={{
            padding: '16px 18px', borderRadius: 12, marginBottom: 14,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.7,
          }}>
            {scenario.content}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Factors to Consider
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scenario.factors.map((factor, fi) => (
                <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: 'var(--accent)', fontSize: 14, marginTop: 1, flexShrink: 0 }}>{'•'}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <textarea
            rows={5}
            style={ta}
            placeholder="What is your moderation decision? Should this content be removed, labeled, restricted, or allowed? Explain your reasoning, the legal considerations, and what precedent your decision sets..."
            value={g('grayareas', `scenario_${scenario.id}`, '')}
            onChange={e => s('grayareas', `scenario_${scenario.id}`, e.target.value)}
          />
        </div>
      ))}

      <HindiExplainer
        concept="Gray Area"
        english="Gray Area in Content Moderation"
        explanation="ग्रे एरिया वह कंटेंट है जो न पूरी तरह से गलत है और न पूरी तरह से सही। जैसे कोई राजनीतिक व्यंग्य (satire) — क्या वह अभिव्यक्ति की स्वतंत्रता है या अपमान? भारत में यह और भी मुश्किल है क्योंकि अलग-अलग समुदायों की अलग-अलग संवेदनाएं हैं।"
        example="कोई मीम जो एक नेता का मज़ाक उड़ाता है — यह व्यंग्य है (Article 19 के तहत अनुमति है) या अपमान? जवाब संदर्भ पर निर्भर करता है।"
        terms={[
          { hindi: 'व्यंग्य', english: 'Satire', meaning: 'हास्य के माध्यम से आलोचना' },
          { hindi: 'अभिव्यक्ति की स्वतंत्रता', english: 'Freedom of Expression', meaning: 'Article 19(1)(a) के तहत बोलने का अधिकार' },
        ]}
      />

      {/* Escalation Criteria */}
      <div style={{ ...crd }}>
        <label style={lb}>
          Write your escalation criteria: When should the AI automatically escalate to human reviewers? Define at least 5 specific triggers with threshold values.
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder={`Example triggers:
1. AI confidence score below 70% for any classification
2. Content involves a public figure with 100K+ followers
3. Content references an ongoing court case (sub judice)
4. Content is in a language the model scores below 80% accuracy on
5. Content has gone viral (>10K shares) regardless of classification...`}
          value={g('grayareas', 'escalationCriteria', '')}
          onChange={e => s('grayareas', 'escalationCriteria', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SECTION 5 — Multi-language Support
   ===================================================================== */
function S5({ g, s }) {
  const selectedLangs = g('multilang', 'selectedLanguages', [])
  const selectedStrategy = g('multilang', 'strategy', '')

  const toggleLang = (lang) => {
    const current = selectedLangs || []
    if (current.includes(lang)) {
      s('multilang', 'selectedLanguages', current.filter(l => l !== lang))
    } else {
      s('multilang', 'selectedLanguages', [...current, lang])
    }
  }

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'\u{1F310}'} title="Multi-language Support"
        desc="India has 22 officially recognized languages and hundreds of dialects. Your platform sees content in Hindi, English, Hinglish (Hindi-English mix), and at least 10 regional languages. Code-switching, transliteration, and script mixing make this especially challenging for AI." />

      {/* Language Selection */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Priority Languages
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Select the languages your moderation system must support at launch. Consider user demographics and content volume.
        </p>
        <PillSelect
          options={INDIAN_LANGUAGES}
          selected={selectedLangs}
          onToggle={toggleLang}
          multi
        />
      </div>

      {/* Strategy Selection */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Multi-language Strategy
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LANGUAGE_STRATEGIES.map(ls => {
            const active = selectedStrategy === ls.id
            return (
              <SelectCard key={ls.id} active={active} onClick={() => s('multilang', 'strategy', ls.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: active ? '6px solid var(--accent)' : '2px solid var(--border)',
                    boxSizing: 'border-box',
                  }} />
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>{ls.label}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{ls.desc}</div>
                  </div>
                </div>
              </SelectCard>
            )
          })}
        </div>
      </div>

      <HindiExplainer
        concept="Code-Switching"
        english="Code-Switching / Hinglish"
        explanation="कोड-स्विचिंग का मतलब है एक ही वाक्य में दो भाषाओं का मिलाकर इस्तेमाल करना। जैसे Hinglish — हिंदी और English का मिश्रण। AI के लिए यह समझना बहुत मुश्किल होता है क्योंकि एक ही वाक्य में दो भाषाओं के शब्द होते हैं।"
        example="'Ye policy totally bakwas hai, government ko kuch nahi pata' — इसमें हिंदी और English दोनों हैं। AI को दोनों भाषाओं में harmful content पहचानना होगा।"
        terms={[
          { hindi: 'कोड-स्विचिंग', english: 'Code-Switching', meaning: 'एक वाक्य में दो भाषाओं का प्रयोग' },
          { hindi: 'लिप्यंतरण', english: 'Transliteration', meaning: 'हिंदी को रोमन लिपि में लिखना (जैसे: namaste)' },
        ]}
      />

      {/* Strategy Justification */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Justify your language strategy choice. How will you handle Hinglish (code-switching between Hindi and English) and transliterated content (Hindi written in Roman script)?
        </label>
        <textarea
          rows={6}
          style={ta}
          placeholder={`Consider: 'ye log sab chor hain' written in Roman script is Hindi hate speech but standard NLP tools may not detect it. How does your system handle:
- Code-switching mid-sentence ('This is totally bakwas policy')
- Transliteration ('bharat mata ki jai' vs 'भारत माता की जय')
- Regional slang and euphemisms used to bypass filters...`}
          value={g('multilang', 'justification', '')}
          onChange={e => s('multilang', 'justification', e.target.value)}
        />
      </div>

      {/* Cross-language Prompt */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write a moderation prompt that works across languages. Include instructions for handling code-switching, transliteration, and culturally specific slurs or dog-whistles.
        </label>
        <textarea
          rows={10}
          style={ta}
          placeholder={`Your prompt should:
- Instruct the model to identify the language(s) present
- Handle mixed-language content (e.g., English sentence with Hindi slurs)
- Recognize transliterated abuse (Roman script Hindi/regional language insults)
- Understand culturally specific references (caste surnames used as slurs, communal dog-whistles)
- Detect evasion tactics (spelling variations, symbol substitution like '@' for 'a')...`}
          value={g('multilang', 'crossLangPrompt', '')}
          onChange={e => s('multilang', 'crossLangPrompt', e.target.value)}
        />
      </div>

      {/* Low-resource Language Plan */}
      <div style={{ ...crd }}>
        <label style={lb}>
          How will you ensure fair moderation for low-resource languages (e.g., Assamese, Odia, Manipuri) where training data is scarce? What are the risks of unequal moderation quality across languages?
        </label>
        <textarea
          rows={6}
          style={ta}
          placeholder="Risks of unequal moderation: harmful content in minority languages goes unchecked while majority language speakers face over-moderation. Consider: community moderator programs, active learning, targeted data collection, and fairness metrics across languages..."
          value={g('multilang', 'lowResource', '')}
          onChange={e => s('multilang', 'lowResource', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SECTION 6 — Appeal & Review System
   ===================================================================== */
function S6({ g, s }) {
  const selectedComponents = g('appeal', 'selectedComponents', [])

  const toggleComponent = (id) => {
    const current = selectedComponents || []
    if (current.includes(id)) {
      s('appeal', 'selectedComponents', current.filter(c => c !== id))
    } else {
      s('appeal', 'selectedComponents', [...current, id])
    }
  }

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'\u{1F465}'} title="Appeal & Review System"
        desc="No AI system is perfect. Design the human-in-the-loop review process that handles appeals, low-confidence decisions, and edge cases. Under IT Rules 2021, users have the right to appeal content moderation decisions." />

      {/* Workflow Components */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Review Workflow Components
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Select the components you would include in your human review pipeline.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {WORKFLOW_COMPONENTS.map(comp => {
            const active = (selectedComponents || []).includes(comp.id)
            return (
              <div key={comp.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: active ? 'rgba(6,182,212,0.06)' : 'var(--bg-secondary)',
                border: active ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--border)',
                transition: 'all 0.2s', cursor: 'pointer',
              }} onClick={() => toggleComponent(comp.id)}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? '#22c55e' : 'transparent',
                  border: active ? 'none' : '2px solid var(--border)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}>
                  {active ? '✓' : ''}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{comp.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{comp.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confidence Thresholds */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Define confidence threshold rules: What happens when the AI is highly confident (95%+), moderately confident (70-95%), and uncertain (&lt;70%)? Write specific rules for each band.
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder={`Example structure:
HIGH CONFIDENCE (>95%):
- For critical categories (CSAM, terrorism): Auto-remove immediately, log for audit
- For high categories (hate speech): Auto-remove, notify user, allow appeal
- For medium categories (political): Flag but do not remove, queue for review within 24h

MODERATE CONFIDENCE (70-95%):
- ...

LOW CONFIDENCE (<70%):
- ...`}
          value={g('appeal', 'confidenceRules', '')}
          onChange={e => s('appeal', 'confidenceRules', e.target.value)}
        />
      </div>

      {/* Escalation Rules */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write the escalation rules for when AI confidence is low. How does a flagged piece of content move through your review pipeline? Include timelines and SLAs.
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder={`Design the flow:
1. AI flags content with low confidence -> enters review queue
2. Queue prioritization: severity + virality + user report count
3. Tier 1 reviewer (general): must act within __ hours
4. If reviewer disagrees with AI -> Tier 2 specialist review
5. If content involves legal issues -> Legal team escalation within __ hours
6. Government/court orders -> Priority queue, 36-hour SLA per IT Rules...`}
          value={g('appeal', 'escalationRules', '')}
          onChange={e => s('appeal', 'escalationRules', e.target.value)}
        />
      </div>

      {/* Reviewer Wellbeing */}
      <div style={{ ...crd }}>
        <label style={lb}>
          Content moderators are exposed to disturbing content daily. How will you protect reviewer mental health? What operational safeguards will you implement?
        </label>
        <textarea
          rows={6}
          style={ta}
          placeholder="Consider: exposure limits (max hours/day reviewing graphic content), mandatory counseling, content blurring for initial review, rotation between content types, wellness programs, PTSD screening, fair compensation for high-stress work..."
          value={g('appeal', 'reviewerWellbeing', '')}
          onChange={e => s('appeal', 'reviewerWellbeing', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SECTION 7 — Metrics & Monitoring
   ===================================================================== */
function S7({ g, s }) {
  const selectedKPIs = g('metrics', 'selectedKPIs', [])

  const toggleKPI = (id) => {
    const current = selectedKPIs || []
    if (current.includes(id)) {
      s('metrics', 'selectedKPIs', current.filter(k => k !== id))
    } else {
      s('metrics', 'selectedKPIs', [...current, id])
    }
  }

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'\u{1F4CA}'} title="Metrics & Monitoring"
        desc="Define how you will measure success, monitor the system in production, and continuously improve. Your monitoring must also generate the monthly compliance reports mandated by MEITY." />

      {/* KPI Selection */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Key Performance Indicators
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Select the KPIs you would track on your monitoring dashboard. Choose the ones most critical for both operational excellence and regulatory compliance.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {KPIS.map(kpi => {
            const active = (selectedKPIs || []).includes(kpi.id)
            return (
              <div key={kpi.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: active ? 'rgba(6,182,212,0.06)' : 'var(--bg-secondary)',
                border: active ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--border)',
                transition: 'all 0.2s', cursor: 'pointer',
              }} onClick={() => toggleKPI(kpi.id)}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? '#22c55e' : 'transparent',
                  border: active ? 'none' : '2px solid var(--border)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}>
                  {active ? '✓' : ''}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{kpi.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{kpi.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          For the KPIs you selected, define specific alert thresholds. When should your team be woken up at 2 AM vs. when is a Slack notification sufficient?
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder={`Example:
P0 (Page on-call immediately):
- Precision drops below 60% in 1-hour window (mass over-censorship)
- CSAM detection recall drops below 99%
- Government takedown order unactioned for 24+ hours

P1 (Alert in Slack, respond within 2 hours):
- Appeal overturn rate exceeds 30% in a day
- Any language accuracy drops below 70%

P2 (Review next business day):
- ...`}
          value={g('metrics', 'alertThresholds', '')}
          onChange={e => s('metrics', 'alertThresholds', e.target.value)}
        />
      </div>

      {/* Dashboard Design */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Describe the layout of your monitoring dashboard. What sections would it have? What charts/graphs? How would it help the Compliance Officer prepare the mandatory monthly report for MEITY?
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder={`Describe sections like:
- Real-time metrics panel (requests/sec, active flags, queue depth)
- Category breakdown chart (pie/bar showing content distribution)
- Language heatmap (moderation volume and accuracy per language)
- Compliance tracker (takedown SLA adherence, monthly report data)
- Trend graphs (weekly precision/recall, appeal rates over time)
- Reviewer workload balancer (assignments, throughput, burnout risk)...`}
          value={g('metrics', 'dashboardDesign', '')}
          onChange={e => s('metrics', 'dashboardDesign', e.target.value)}
        />
      </div>

      {/* Deployment Rollout Plan */}
      <div style={{ ...crd }}>
        <label style={lb}>
          Write a phased deployment and rollout plan. How will you go from development to production handling 2M+ daily posts? Include milestones, success criteria for each phase, and rollback triggers.
        </label>
        <textarea
          rows={10}
          style={ta}
          placeholder={`Example phases:
Phase 1 (Week 1-2): Shadow mode — AI runs alongside existing manual moderation, decisions logged but not actioned. Success: >85% agreement with human moderators.

Phase 2 (Week 3-4): Assisted mode — AI pre-flags content, humans make final call. Success: human review time reduced by 40%, no missed critical content.

Phase 3 (Week 5-8): Auto-action for high-confidence — AI acts on >95% confidence decisions, rest goes to human queue. Success: ...

Phase 4 (Week 9-12): Full deployment — ...

Rollback triggers: ...`}
          value={g('metrics', 'rolloutPlan', '')}
          onChange={e => s('metrics', 'rolloutPlan', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SUBMIT VIEW
   ===================================================================== */
function SubmitView({ resp, onSubmit }) {
  const filled = SECTIONS.filter(s => hasFill(resp, s.id)).length
  const pct = Math.round((filled / SECTIONS.length) * 100)

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'&#10148;'} title="Review & Submit"
        desc="Review your content moderation system design across all sections before submitting. You can navigate back to any section to make changes." />

      {/* Completion Summary */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17 }}>
            Completion Summary
          </h3>
          <span style={{
            padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: pct === 100 ? 'rgba(34,197,94,0.15)' : 'rgba(250,204,21,0.15)',
            color: pct === 100 ? '#22c55e' : '#f59e0b',
          }}>
            {pct}% Complete
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, marginBottom: 20, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            style={{
              height: '100%', borderRadius: 4,
              background: pct === 100
                ? 'linear-gradient(90deg, #22c55e, #10b981)'
                : 'linear-gradient(90deg, var(--accent), #3b82f6)',
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Section status list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SECTIONS.map(sec => {
            const ok = hasFill(resp, sec.id)
            return (
              <div key={sec.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: ok ? 'rgba(34,197,94,0.04)' : 'var(--bg-secondary)',
                border: '1px solid var(--border)',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                  background: ok ? '#22c55e' : 'var(--bg-secondary)',
                  color: ok ? '#fff' : 'var(--text-secondary)',
                  border: ok ? 'none' : '1px solid var(--border)',
                }}>
                  {ok ? '✓' : sec.num}
                </span>
                <span style={{ color: 'var(--text-primary)', fontSize: 14, flex: 1 }}>{sec.title}</span>
                <span style={{ fontSize: 12, color: ok ? '#22c55e' : 'var(--text-secondary)', fontWeight: 500 }}>
                  {ok ? 'Started' : 'Empty'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={onSubmit}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%', padding: '16px 32px', fontSize: 17, fontWeight: 700,
          fontFamily: 'var(--font-heading)', borderRadius: 14, cursor: 'pointer',
          border: 'none', color: '#fff',
          background: 'linear-gradient(135deg, #3b82f6, var(--accent))',
          boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
          transition: 'box-shadow 0.2s',
        }}
      >
        Submit Assignment
      </motion.button>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
        Your responses will be evaluated by an AI instructor. You can submit even with incomplete sections.
      </p>
    </motion.div>
  )
}
