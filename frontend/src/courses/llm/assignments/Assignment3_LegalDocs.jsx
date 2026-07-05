import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ================================================================
   ASSIGNMENT 3 — Legal Document Intelligence
   ================================================================
   Scenario-based case study: Students act as AI consultants for a
   mid-size Indian law firm building a legal document intelligence
   system. The system must analyze contracts, extract clauses,
   summarize judgments, and assist with legal research across Indian
   law (IPC, CPC, Companies Act, etc.).
   7 sections with sidebar navigation, multi-input form.
================================================================ */

const SECTIONS = [
  { id: 'briefing',       num: 1, title: 'Scenario Briefing',              icon: '⚖️' },
  { id: 'preprocessing',  num: 2, title: 'Document Preprocessing Pipeline', icon: '📄' },
  { id: 'extraction',     num: 3, title: 'Clause Extraction & Analysis',    icon: '🔍' },
  { id: 'summarization',  num: 4, title: 'Legal Summarization',             icon: '📝' },
  { id: 'rag',            num: 5, title: 'RAG Architecture for Case Law',   icon: '📚' },
  { id: 'hallucination',  num: 6, title: 'Hallucination Prevention',        icon: '🛡️' },
  { id: 'ethics',         num: 7, title: 'Compliance & Ethics',             icon: '🔒' },
]

/* ─── DATA ─── */

const PRIORITY_USE_CASES = [
  { id: 'contract_review',   label: 'Contract Review & Risk Analysis' },
  { id: 'clause_extraction',  label: 'Clause Extraction & Classification' },
  { id: 'judgment_summary',   label: 'Court Judgment Summarization' },
  { id: 'case_law_research',  label: 'Case Law Research & Retrieval' },
  { id: 'compliance_check',   label: 'Compliance Checking (Companies Act, SEBI)' },
  { id: 'due_diligence',      label: 'Due Diligence Document Review' },
  { id: 'legal_drafting',     label: 'Legal Document Drafting Assistance' },
  { id: 'precedent_analysis', label: 'Precedent Analysis & Comparison' },
]

const OCR_STRATEGIES = [
  { id: 'tesseract',   label: 'Tesseract OCR',                desc: 'Open-source, good for printed text, struggles with Hindi scripts' },
  { id: 'azure_docai',  label: 'Azure Document Intelligence',  desc: 'Strong multilingual OCR, handles tables and stamps well' },
  { id: 'google_docai', label: 'Google Document AI',           desc: 'Excellent for structured documents, good Devanagari support' },
  { id: 'aws_textract', label: 'AWS Textract',                 desc: 'Good form extraction, table detection, limited Indic scripts' },
]

const CHUNKING_APPROACHES = [
  { id: 'section_based',  label: 'Section-Based',   desc: 'Split by legal sections (Part I, Schedule A, Annexure)' },
  { id: 'clause_based',   label: 'Clause-Based',    desc: 'Each numbered clause becomes a chunk' },
  { id: 'semantic',        label: 'Semantic',        desc: 'Use embeddings to find natural topic boundaries' },
  { id: 'fixed_overlap',   label: 'Fixed + Overlap', desc: 'Fixed token windows with overlap for context' },
  { id: 'hierarchical',    label: 'Hierarchical',    desc: 'Nested chunks: document > part > section > clause' },
]

const SAMPLE_CONTRACT = `CLAUSE 14 — INDEMNIFICATION
14.1 The Service Provider shall indemnify and hold harmless the Client against all losses, damages, costs, and expenses arising from any breach of this Agreement, including but not limited to claims by third parties.
14.2 The aggregate liability under this clause shall not exceed the total fees paid by the Client in the preceding twelve (12) months.

CLAUSE 15 — TERMINATION
15.1 Either party may terminate this Agreement by providing ninety (90) days prior written notice.
15.2 Notwithstanding Clause 15.1, the Client may terminate immediately upon occurrence of a Force Majeure event lasting more than sixty (60) continuous days.

CLAUSE 16 — FORCE MAJEURE
16.1 Neither party shall be liable for failure to perform obligations due to causes beyond reasonable control, including but not limited to acts of God, war, pandemic, government action, or natural disaster.

CLAUSE 17 — GOVERNING LAW
17.1 This Agreement shall be governed by and construed in accordance with the laws of India.
17.2 Any dispute arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts at Mumbai.`

const RISK_LEVELS = [
  { id: 'low',      label: 'Low Risk',      color: '#22c55e' },
  { id: 'medium',   label: 'Medium Risk',   color: '#f59e0b' },
  { id: 'high',     label: 'High Risk',     color: '#ef4444' },
  { id: 'critical', label: 'Critical Risk', color: '#dc2626' },
]

const SAMPLE_JUDGMENT = `IN THE SUPREME COURT OF INDIA
CIVIL APPELLATE JURISDICTION
CIVIL APPEAL NO. 1234 OF 2023

M/s Reliance Industries Ltd. ... Appellant
vs.
M/s Tata Consultancy Services ... Respondent

JUDGMENT

Hon'ble Justice A.K. Sharma, J.

1. This appeal arises from the judgment dated 15.03.2023 of the High Court of Bombay in Commercial Appeal No. 567 of 2022.

2. The appellant entered into a Master Services Agreement (MSA) dated 01.04.2020 with the respondent for IT infrastructure services valued at Rs. 150 crores over a period of 5 years.

3. The core dispute relates to the interpretation of Clause 8.3 of the MSA which provides for liquidated damages at the rate of 1% per week of delay, subject to a maximum of 10% of the total contract value.

4. The respondent failed to deliver Phase 2 of the project within the stipulated timeline, resulting in a delay of 14 weeks. The appellant invoked Clause 8.3 and claimed liquidated damages of Rs. 15 crores (10% cap).

5. The High Court held that the liquidated damages clause was enforceable as it represented a genuine pre-estimate of loss, relying on the principles laid down in ONGC v. Saw Pipes Ltd. (2003) 5 SCC 705.

6. We find no reason to interfere with the well-reasoned judgment of the High Court. The liquidated damages clause satisfies the requirements of Section 74 of the Indian Contract Act, 1872.

ORDER: The appeal is dismissed with costs of Rs. 5 lakhs. The judgment of the High Court is affirmed.`

const JUDGMENT_ELEMENTS = [
  { id: 'ratio',       label: 'Ratio Decidendi (Core Legal Reasoning)' },
  { id: 'obiter',      label: 'Obiter Dicta (Additional Observations)' },
  { id: 'parties',     label: 'Parties & Their Roles' },
  { id: 'facts',       label: 'Material Facts' },
  { id: 'issues',      label: 'Issues Framed' },
  { id: 'relief',      label: 'Relief Granted / Order' },
  { id: 'precedents',  label: 'Precedents Cited' },
  { id: 'statutes',    label: 'Statutes Interpreted' },
  { id: 'dissent',     label: 'Dissenting Opinions (if any)' },
]

const EMBEDDING_STRATEGIES = [
  { id: 'openai',       label: 'OpenAI text-embedding-3-large',  desc: 'Strong general-purpose embeddings, cloud-only' },
  { id: 'cohere',       label: 'Cohere embed-multilingual-v3',   desc: 'Good multilingual support, handles Hindi well' },
  { id: 'bge',          label: 'BGE-M3 (Self-hosted)',           desc: 'Open-source multilingual, can run on-premise' },
  { id: 'legal_bert',   label: 'Legal-BERT Fine-tuned',          desc: 'Trained on legal corpus, best domain accuracy' },
  { id: 'instructor',   label: 'Instructor Embeddings',          desc: 'Task-aware embeddings, tunable for legal queries' },
]

const CHUNK_SIZE_OPTIONS = [256, 512, 1024, 2048]

const RETRIEVAL_METHODS = [
  { id: 'dense',        label: 'Dense Retrieval (Vector Search)',  desc: 'Semantic similarity via embeddings' },
  { id: 'sparse',       label: 'Sparse Retrieval (BM25)',         desc: 'Keyword-based, good for exact legal terms' },
  { id: 'hybrid',       label: 'Hybrid (Dense + Sparse)',         desc: 'Combines semantic and keyword matching' },
  { id: 'reranker',     label: 'Hybrid + Cross-Encoder Reranker', desc: 'Two-stage retrieval with reranking for precision' },
]

const GUARDRAIL_OPTIONS = [
  { id: 'citation_req',     label: 'Mandatory Citation for Every Claim',    desc: 'Every legal statement must cite a specific source' },
  { id: 'confidence_score', label: 'Confidence Scoring on Outputs',         desc: 'Attach confidence levels to each extracted fact' },
  { id: 'source_verify',    label: 'Source Document Cross-Verification',    desc: 'Verify extracted facts against original document' },
  { id: 'multi_pass',       label: 'Multi-Pass Extraction with Consistency Check', desc: 'Run extraction multiple times, flag inconsistencies' },
  { id: 'human_loop',       label: 'Human-in-the-Loop for High-Stakes Output', desc: 'Route critical analyses to senior associates' },
  { id: 'template_match',   label: 'Template Matching for Standard Clauses', desc: 'Compare against known clause templates' },
  { id: 'refuse_uncertain', label: '"Cannot Determine" Default',            desc: 'System explicitly refuses rather than guessing' },
  { id: 'halluc_detector',  label: 'Hallucination Detection Model',        desc: 'Secondary model that checks for fabricated content' },
]

const ETHICAL_SAFEGUARDS = [
  { id: 'confidentiality',  label: 'Client Confidentiality Controls',        desc: 'Ensure no client data leaks across matters or to AI providers' },
  { id: 'upl_prevention',   label: 'Unauthorized Practice of Law Prevention', desc: 'System never provides legal advice, only analysis assistance' },
  { id: 'bias_audit',       label: 'Regular Bias Audits',                    desc: 'Check for bias against specific parties, castes, regions, genders' },
  { id: 'transparency',     label: 'AI Disclosure to Clients',               desc: 'Inform clients when AI tools are used in their matters' },
  { id: 'data_retention',   label: 'Data Retention & Deletion Policies',     desc: 'Clear policies on how long documents are stored in the system' },
  { id: 'access_control',   label: 'Role-Based Access Control',              desc: 'Only authorized personnel can access specific matters' },
  { id: 'audit_trail',      label: 'Complete Audit Trail',                   desc: 'Log every AI interaction for accountability and review' },
  { id: 'insurance',        label: 'Professional Indemnity Insurance Update', desc: 'Ensure insurance covers AI-assisted legal work' },
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

const legalGold = '#c9a84c'
const legalNavy = '#1a1a2e'

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

function SelectCard({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...crd, padding: 16, cursor: 'pointer', textAlign: 'left', width: '100%',
      border: active ? `2px solid ${legalGold}` : '1px solid var(--border)',
      background: active ? 'rgba(201,168,76,0.06)' : 'var(--bg-secondary)',
      transition: 'all 0.15s',
    }}>
      {children}
    </button>
  )
}

function PillSelect({ options, selected, onToggle, multi = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const val = typeof opt === 'string' ? opt : opt.id
        const label = typeof opt === 'string' ? opt : opt.label
        const isActive = multi
          ? (selected || []).includes(val)
          : selected === val
        return (
          <button key={val} onClick={() => onToggle(val)} style={{
            padding: '8px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
            border: isActive ? `2px solid ${legalGold}` : '1px solid var(--border)',
            background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
            color: isActive ? legalGold : 'var(--text-secondary)',
            fontWeight: isActive ? 600 : 400, transition: 'all 0.15s',
          }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

function ToggleSwitch({ active, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: active ? legalGold : 'var(--bg-secondary)',
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

/* =====================================================================
   ROOT COMPONENT
   ===================================================================== */
export default function Assignment3_LegalDocs() {
  const [sec, setSec] = useState('briefing')
  const [resp, setResp] = useState({})
  const [done, setDone] = useState(false)

  const put = (s, f, v) => setResp(p => ({ ...p, [s]: { ...p[s], [f]: v } }))
  const get = (s, f, d = '') => resp[s]?.[f] ?? d
  const toggleMulti = (s, f, val) => {
    const arr = get(s, f, [])
    put(s, f, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }
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
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `linear-gradient(135deg, ${legalGold}, #a8893a)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <span style={{ color: '#fff', fontSize: 36, fontWeight: 700 }}>&#10003;</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 32, marginBottom: 16 }}>
            Assignment Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Your legal document intelligence system design will be reviewed by an AI instructor who will provide personalized feedback on your architecture, extraction strategies, and ethical considerations.
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
            <p style={{ color: legalGold, fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              AI Instructor Review
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              An LLM judge will evaluate your responses across document preprocessing, clause extraction accuracy, RAG pipeline design, hallucination prevention strategy, and ethical compliance. Detailed feedback coming soon.
            </p>
          </div>
          <AIEvaluationPanel courseId="llm" assignmentId={3} />
        </motion.div>
      </div>
    )
  }

  /* ── SECTION MAP ── */
  const views = {
    briefing:       <S1 key="s1" g={get} s={put} toggleMulti={toggleMulti} />,
    preprocessing:  <S2 key="s2" g={get} s={put} toggleMulti={toggleMulti} />,
    extraction:     <S3 key="s3" g={get} s={put} toggleMulti={toggleMulti} />,
    summarization:  <S4 key="s4" g={get} s={put} toggleMulti={toggleMulti} />,
    rag:            <S5 key="s5" g={get} s={put} toggleMulti={toggleMulti} />,
    hallucination:  <S6 key="s6" g={get} s={put} toggleMulti={toggleMulti} />,
    ethics:         <S7 key="s7" g={get} s={put} toggleMulti={toggleMulti} />,
    submit:         <SubmitView key="sub" resp={resp} onSubmit={() => setDone(true)} />,
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
          <div style={{
            background: `linear-gradient(135deg, ${legalNavy}, #16213e)`,
            borderRadius: 14, padding: 18, marginBottom: 12,
            border: `1px solid ${legalGold}22`,
          }}>
            <div style={{ color: legalGold, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Assignment 3</div>
            <div style={{ color: '#ecf0f1', fontFamily: 'var(--font-heading)', fontSize: 16, lineHeight: 1.3 }}>Legal Document Intelligence</div>
          </div>
        </div>
        {/* Progress */}
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Progress</span>
            <span style={{ color: legalGold, fontSize: 12, fontWeight: 600 }}>{filled}/{SECTIONS.length} sections</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2 }}>
            <motion.div
              animate={{ width: `${(filled / SECTIONS.length) * 100}%` }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${legalGold}, #22c55e)`, borderRadius: 2 }}
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
                borderLeft: act ? `3px solid ${legalGold}` : '3px solid transparent',
              }}>
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: ok ? '#22c55e' : act ? legalGold : 'var(--bg-secondary)',
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
            borderLeft: sec === 'submit' ? `3px solid ${legalGold}` : '3px solid transparent',
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 14,
              background: sec === 'submit' ? legalGold : 'var(--bg-secondary)',
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
function S1({ g, s, toggleMulti }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'⚖️'} title="Scenario Briefing"
        desc="Read the scenario carefully. You are an AI consultant hired by a mid-size Indian law firm to design a legal document intelligence system." />

      {/* Scenario Brief */}
      <div style={{
        ...crd, marginBottom: 24,
        background: `linear-gradient(135deg, ${legalNavy} 0%, #16213e 100%)`,
        border: `1px solid ${legalGold}33`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{
            background: legalGold, color: legalNavy,
            padding: '4px 14px', borderRadius: 6, fontWeight: 700,
            fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase',
          }}>Briefing</span>
          <span style={{ color: `${legalGold}99`, fontSize: 13 }}>Client: Sharma & Associates, Advocates</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px', maxWidth: 700 }}>
          Sharma & Associates is a mid-size Indian law firm with 45 lawyers across offices in Delhi, Mumbai, and Bengaluru. They handle corporate law, commercial litigation, real estate, and regulatory compliance. The firm processes <strong style={{ color: legalGold }}>200+ contracts monthly</strong>, handles <strong style={{ color: legalGold }}>50+ active litigation matters</strong>, and needs to track compliance across IPC, CPC, Companies Act 2013, SEBI regulations, and RERA.
        </p>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px', maxWidth: 700 }}>
          Junior associates spend <strong style={{ color: '#ef4444' }}>70% of their time</strong> on manual contract review, case law research, and document summarization. The firm wants an AI system that can <strong style={{ color: legalGold }}>analyze contracts, extract clauses, summarize judgments, and assist with legal research</strong> -- but with the precision demanded by the legal profession.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { label: 'Monthly Contracts', value: '200+', color: legalGold },
            { label: 'Active Litigations', value: '50+', color: '#3b82f6' },
            { label: 'Junior Time on Review', value: '70%', color: '#ef4444' },
            { label: 'Jurisdictions', value: '3 Cities', color: '#8b5cf6' },
          ].map(st => (
            <div key={st.label} style={{
              background: '#0d1117', borderRadius: 12, padding: '14px 12px',
              textAlign: 'center', border: `1px solid ${st.color}33`,
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: st.color, marginBottom: 4, fontFamily: 'var(--font-heading)' }}>{st.value}</div>
              <div style={{ fontSize: 11, color: '#8892a4', fontWeight: 500 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Use Cases */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select Priority Use Cases
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          The firm cannot build everything at once. Select the top 3-4 use cases you would prioritize for Phase 1.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PRIORITY_USE_CASES.map(uc => {
            const selected = (g('briefing', 'priorities', []) || []).includes(uc.id)
            return (
              <button key={uc.id} onClick={() => toggleMulti('briefing', 'priorities', uc.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                background: selected ? 'rgba(201,168,76,0.08)' : 'var(--bg-secondary)',
                border: selected ? `2px solid ${legalGold}` : '1px solid var(--border)',
                textAlign: 'left', transition: 'all 0.15s',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selected ? legalGold : 'transparent',
                  border: selected ? 'none' : '2px solid var(--border)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}>
                  {selected ? '✓' : ''}
                </span>
                <span style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 14 }}>{uc.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Initial Assessment */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write your initial assessment of the firm's needs. What are the key challenges in building AI for Indian legal documents? Consider language complexity, document variety, accuracy requirements, and regulatory landscape.
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder="Consider: Indian legal language mixes English with Hindi terms, statutes reference section numbers across multiple acts, court judgments have unique formatting, accuracy requirements are near-absolute..."
          value={g('briefing', 'assessment', '')}
          onChange={e => s('briefing', 'assessment', e.target.value)}
        />
      </div>

      <HindiExplainer
        concept="कानूनी दस्तावेज़ बुद्धिमत्ता"
        english="Legal Document Intelligence"
        explanation="कानूनी दस्तावेज़ बुद्धिमत्ता का मतलब है AI का इस्तेमाल करके कानूनी कागज़ात (contracts, judgments, agreements) को पढ़ना, समझना, और उनमें से ज़रूरी जानकारी निकालना। जैसे एक वकील हर clause पढ़कर risk समझता है, AI भी यही काम कर सकता है -- लेकिन बहुत तेज़ी से।"
        example="सोचिए एक कंपनी का agreement 100 पन्नों का है। एक junior वकील को पढ़ने में 4 घंटे लगेंगे। AI इसे 30 सेकंड में पढ़कर सभी important clauses (जैसे termination, indemnity, penalty) निकाल सकता है।"
        terms={[
          { hindi: 'खंड', english: 'Clause', meaning: 'अनुबंध का एक विशेष हिस्सा जो किसी शर्त या नियम को बताता है' },
          { hindi: 'क्षतिपूर्ति', english: 'Indemnification', meaning: 'एक पक्ष द्वारा दूसरे को हुए नुकसान की भरपाई का वादा' },
          { hindi: 'अधिकार क्षेत्र', english: 'Jurisdiction', meaning: 'वह अदालत या जगह जहाँ कानूनी विवाद सुना जाएगा' },
        ]}
      />
    </motion.div>
  )
}

/* =====================================================================
   SECTION 2 — Document Preprocessing Pipeline
   ===================================================================== */
function S2({ g, s, toggleMulti }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'📄'} title="Document Preprocessing Pipeline"
        desc="Design how your system handles different document types -- PDFs, scanned documents, and complex legal formatting with sections, sub-sections, schedules, and annexures." />

      {/* Document Types */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Document Types the System Must Handle
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { type: 'Native PDFs', desc: 'Digitally generated contracts with selectable text', color: '#3b82f6' },
            { type: 'Scanned PDFs', desc: 'Photocopied or faxed legal documents', color: '#f59e0b' },
            { type: 'Court Orders', desc: 'Typed or handwritten court orders with stamps', color: '#ef4444' },
            { type: 'Government Gazettes', desc: 'Complex multi-column official notifications', color: '#8b5cf6' },
            { type: 'Notarized Documents', desc: 'Stamped documents with seals and signatures', color: '#10b981' },
            { type: 'Bilingual Contracts', desc: 'Contracts with English and Hindi sections', color: '#ec4899' },
          ].map(dt => (
            <div key={dt.type} style={{
              background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 16px',
              borderLeft: `4px solid ${dt.color}`, border: '1px solid var(--border)',
              borderLeftWidth: 4, borderLeftColor: dt.color,
            }}>
              <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{dt.type}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5 }}>{dt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OCR Strategy */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select OCR Strategy
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          How will you extract text from scanned documents and images?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OCR_STRATEGIES.map(ocr => {
            const active = g('preprocessing', 'ocrStrategy', '') === ocr.id
            return (
              <SelectCard key={ocr.id} active={active} onClick={() => s('preprocessing', 'ocrStrategy', ocr.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: active ? `6px solid ${legalGold}` : '2px solid var(--border)',
                    boxSizing: 'border-box',
                  }} />
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>{ocr.label}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{ocr.desc}</div>
                  </div>
                </div>
              </SelectCard>
            )
          })}
        </div>
      </div>

      {/* Chunking Approach */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select Chunking Approach
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          How will you split large legal documents into processable chunks for the LLM?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHUNKING_APPROACHES.map(ch => {
            const active = g('preprocessing', 'chunking', '') === ch.id
            return (
              <SelectCard key={ch.id} active={active} onClick={() => s('preprocessing', 'chunking', ch.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: active ? `6px solid ${legalGold}` : '2px solid var(--border)',
                    boxSizing: 'border-box',
                  }} />
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>{ch.label}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{ch.desc}</div>
                  </div>
                </div>
              </SelectCard>
            )
          })}
        </div>
      </div>

      {/* Structure Rules */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Indian legal documents have unique structural elements: Parts, Sections, Sub-sections, Schedules, Annexures, Recitals, and Definitions clauses. Write rules your system should follow when parsing this structure. How do you preserve hierarchy and cross-references?
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder="Example rules: 1) Always preserve section numbering (e.g., Section 3(2)(a)(i)). 2) Link Schedule references back to the main body. 3) Parse Definition clauses first and use them as context for the rest..."
          value={g('preprocessing', 'structureRules', '')}
          onChange={e => s('preprocessing', 'structureRules', e.target.value)}
        />
      </div>

      {/* Bilingual Handling */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Many Indian legal documents contain a mix of English and Hindi (or other regional languages). Government notifications often have parallel Hindi and English text. How does your preprocessing pipeline handle bilingual documents?
        </label>
        <textarea
          rows={6}
          style={ta}
          placeholder="Consider: language detection per section, parallel text alignment, Hindi legal terminology mapping, handling Devanagari numerals and section references..."
          value={g('preprocessing', 'bilingualHandling', '')}
          onChange={e => s('preprocessing', 'bilingualHandling', e.target.value)}
        />
      </div>

      <HindiExplainer
        concept="दस्तावेज़ पूर्व-प्रसंस्करण"
        english="Document Preprocessing"
        explanation="दस्तावेज़ पूर्व-प्रसंस्करण का मतलब है कि AI को कोई भी कागज़ देने से पहले उसे सही format में तैयार करना। जैसे आप खाना बनाने से पहले सब्ज़ी धोते और काटते हैं, वैसे ही documents को 'साफ़' करके AI के लिए ready करना होता है।"
        example="एक पुरानी court order की scan बहुत धुंधली है। OCR (Optical Character Recognition) पहले उस scan से text निकालता है, फिर AI उस text को समझता है। अगर OCR गलत पढ़ता है तो AI भी गलत समझेगा -- इसलिए preprocessing बहुत ज़रूरी है।"
        terms={[
          { hindi: 'ओ.सी.आर.', english: 'OCR', meaning: 'छवि (image) से अक्षर पहचानने की तकनीक' },
          { hindi: 'खण्डन', english: 'Chunking', meaning: 'बड़े दस्तावेज़ को छोटे हिस्सों में बाँटना ताकि AI आसानी से पढ़ सके' },
          { hindi: 'अनुसूची', english: 'Schedule/Annexure', meaning: 'मुख्य दस्तावेज़ से जुड़ा हुआ अतिरिक्त हिस्सा' },
        ]}
      />
    </motion.div>
  )
}

/* =====================================================================
   SECTION 3 — Clause Extraction & Analysis
   ===================================================================== */
function S3({ g, s }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'🔍'} title="Clause Extraction & Analysis"
        desc="Given sample contract excerpts, design prompts to extract key clauses and classify risk levels. This is the core capability of the legal AI system." />

      {/* Sample Contract */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{
            background: legalGold, color: legalNavy,
            padding: '3px 10px', borderRadius: 4, fontSize: 11,
            fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          }}>Sample Contract</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Service Agreement Excerpt</span>
        </div>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 12, padding: '18px 20px',
          border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 13,
          lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
          maxHeight: 300, overflowY: 'auto',
        }}>
          {SAMPLE_CONTRACT}
        </div>
      </div>

      {/* Extraction Prompt */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write a prompt that extracts the following from the contract above: (1) Indemnity clause details and caps, (2) Termination conditions and notice period, (3) Force Majeure triggers, (4) Governing law and jurisdiction. Your prompt should specify the output format (JSON preferred).
        </label>
        <textarea
          rows={10}
          style={ta}
          placeholder="Write your full extraction prompt here. Be specific about: role definition, output JSON schema, how to handle missing information, confidence scoring for each extracted field..."
          value={g('extraction', 'extractionPrompt', '')}
          onChange={e => s('extraction', 'extractionPrompt', e.target.value)}
        />
      </div>

      {/* Risk Classification */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Classify the Risk Level
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          The sample contract limits liability to fees paid in the preceding 12 months. For a service worth Rs. 5 crores annually, what risk level does this clause represent for the client?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {RISK_LEVELS.map(rl => {
            const active = g('extraction', 'riskLevel', '') === rl.id
            return (
              <button key={rl.id} onClick={() => s('extraction', 'riskLevel', rl.id)} style={{
                padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
                border: active ? `2px solid ${rl.color}` : '1px solid var(--border)',
                background: active ? `${rl.color}15` : 'var(--bg-secondary)',
                color: active ? rl.color : 'var(--text-secondary)',
                fontWeight: active ? 700 : 400, transition: 'all 0.15s',
              }}>
                {rl.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Risk Justification */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Justify your risk classification above. How would your AI explain this risk to a senior partner? Consider: liability cap adequacy, force majeure scope, termination asymmetry.
        </label>
        <textarea
          rows={6}
          style={ta}
          placeholder="Explain: Why this risk level? What makes the liability cap concerning or acceptable? Are there any contradictions between clauses? What would you recommend the firm negotiate?"
          value={g('extraction', 'riskJustification', '')}
          onChange={e => s('extraction', 'riskJustification', e.target.value)}
        />
      </div>

      {/* Contradiction Detection */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Clause 15.1 says either party can terminate with 90 days notice. Clause 15.2 says the Client can terminate immediately for extended Force Majeure. Design a prompt that detects potential contradictions or tensions between clauses and flags them for attorney review.
        </label>
        <textarea
          rows={7}
          style={ta}
          placeholder="Write a contradiction-detection prompt. Consider: how to define 'contradiction' vs. 'exception', how to present findings to the attorney, what severity levels to assign..."
          value={g('extraction', 'contradictionPrompt', '')}
          onChange={e => s('extraction', 'contradictionPrompt', e.target.value)}
        />
      </div>

      <HindiExplainer
        concept="खंड निष्कर्षण"
        english="Clause Extraction"
        explanation="खंड निष्कर्षण का मतलब है AI से अनुबंध (contract) के महत्वपूर्ण हिस्सों को अलग-अलग पहचानना और निकालना। जैसे एक experienced वकील contract पढ़कर तुरंत बता सकता है कि termination clause कहाँ है और indemnity कितनी है -- AI भी यही सीखता है।"
        example="एक 50 पन्नों के vendor agreement में 8 अलग-अलग जगह penalty के बारे में लिखा है। AI सब ढूंढकर एक जगह दिखा देता है: 'Clause 7.2 में 10% penalty, Clause 14.1 में liability cap Rs. 50 लाख, Schedule B में additional penalties'।"
        terms={[
          { hindi: 'अप्रत्याशित घटना', english: 'Force Majeure', meaning: 'ऐसी अनपेक्षित घटना (जैसे बाढ़, युद्ध) जो अनुबंध पूरा करने से रोके' },
          { hindi: 'शासी कानून', english: 'Governing Law', meaning: 'वह कानून जो अनुबंध पर लागू होगा (जैसे भारतीय कानून)' },
        ]}
      />
    </motion.div>
  )
}

/* =====================================================================
   SECTION 4 — Legal Summarization
   ===================================================================== */
function S4({ g, s, toggleMulti }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'📝'} title="Legal Summarization"
        desc="Design prompts for summarizing court judgments. Legal summarization requires extracting specific elements like ratio decidendi, obiter dicta, relief granted, and precedents cited." />

      {/* Sample Judgment */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{
            background: legalGold, color: legalNavy,
            padding: '3px 10px', borderRadius: 4, fontSize: 11,
            fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          }}>Sample Judgment</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Supreme Court Civil Appeal</span>
        </div>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 12, padding: '18px 20px',
          border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 13,
          lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
          maxHeight: 350, overflowY: 'auto',
        }}>
          {SAMPLE_JUDGMENT}
        </div>
      </div>

      {/* Key Elements to Extract */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select Key Elements to Extract
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Which elements should your summarization system extract from every judgment? Select all that apply.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {JUDGMENT_ELEMENTS.map(el => {
            const selected = (g('summarization', 'elements', []) || []).includes(el.id)
            return (
              <button key={el.id} onClick={() => toggleMulti('summarization', 'elements', el.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                background: selected ? 'rgba(201,168,76,0.08)' : 'var(--bg-secondary)',
                border: selected ? `2px solid ${legalGold}` : '1px solid var(--border)',
                textAlign: 'left', transition: 'all 0.15s',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selected ? legalGold : 'transparent',
                  border: selected ? 'none' : '2px solid var(--border)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                }}>
                  {selected ? '✓' : ''}
                </span>
                <span style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 14 }}>{el.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Summarization Prompt */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write a summarization prompt for the sample judgment above. Your prompt should instruct the AI to produce a structured summary covering the elements you selected. Include format specifications and handling for edge cases.
        </label>
        <textarea
          rows={10}
          style={ta}
          placeholder="Write your full summarization prompt. Consider: structured output format, how to identify ratio decidendi vs. obiter dicta, handling multi-judge decisions, cross-referencing cited precedents..."
          value={g('summarization', 'summaryPrompt', '')}
          onChange={e => s('summarization', 'summaryPrompt', e.target.value)}
        />
      </div>

      {/* Summarization Challenges */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Indian Supreme Court judgments can run 200+ pages with multiple concurring and dissenting opinions. The landmark Aadhaar judgment (K.S. Puttaswamy) was 1,448 pages with 5 separate opinions. How do you summarize such massive judgments accurately? What is your strategy for multi-opinion judgments?
        </label>
        <textarea
          rows={7}
          style={ta}
          placeholder="Consider: hierarchical summarization (section by section then combine), opinion-level summaries, identifying the majority view, handling partial concurrence, preserving dissenting views..."
          value={g('summarization', 'longJudgment', '')}
          onChange={e => s('summarization', 'longJudgment', e.target.value)}
        />
      </div>

      {/* Accuracy Thought Exercise */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          A lawyer uses your AI's summary to argue a case in court. The AI correctly identifies the ratio decidendi but misses a crucial obiter dictum that the opposing counsel uses to counter-argue. What went wrong, and how do you prevent this?
        </label>
        <textarea
          rows={6}
          style={ta}
          placeholder="Think about: completeness vs. brevity in legal summaries, importance of obiter dicta in Indian jurisprudence, how to flag potentially important secondary observations, confidence levels..."
          value={g('summarization', 'missedObiter', '')}
          onChange={e => s('summarization', 'missedObiter', e.target.value)}
        />
      </div>

      <HindiExplainer
        concept="न्यायिक सारांश"
        english="Legal Summarization"
        explanation="न्यायिक सारांश का मतलब है कि अदालत के फ़ैसले (judgment) को पढ़कर उसके मुख्य बिंदु निकालना। हर फ़ैसले में 'ratio decidendi' (मुख्य तर्क जिस पर फ़ैसला हुआ) और 'obiter dicta' (अतिरिक्त टिप्पणियाँ) होते हैं -- AI को दोनों में फ़र्क़ समझना होता है।"
        example="मान लीजिए Supreme Court ने एक 100 पन्नों का फ़ैसला दिया। AI इसे पढ़कर बता सकता है: 'मुख्य मुद्दा contract breach था, Court ने Section 74 Indian Contract Act के तहत liquidated damages मंज़ूर किए, Rs. 15 करोड़ का आदेश दिया।'"
        terms={[
          { hindi: 'विधि-सम्मत आधार', english: 'Ratio Decidendi', meaning: 'वह मुख्य कानूनी तर्क जिस पर फ़ैसला आधारित है' },
          { hindi: 'संलग्न टिप्पणी', english: 'Obiter Dicta', meaning: 'न्यायाधीश की अतिरिक्त टिप्पणियाँ जो फ़ैसले का हिस्सा नहीं पर भविष्य में काम आ सकती हैं' },
        ]}
      />
    </motion.div>
  )
}

/* =====================================================================
   SECTION 5 — RAG Architecture for Case Law
   ===================================================================== */
function S5({ g, s }) {
  const chunkSize = g('rag', 'chunkSize', 512)

  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'📚'} title="RAG Architecture for Case Law"
        desc="Design a retrieval-augmented generation setup for searching Indian case law. The system should help lawyers find relevant precedents across Supreme Court, High Court, and tribunal decisions." />

      {/* Embedding Strategy */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select Embedding Strategy
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          The embedding model determines how well your system understands the semantic meaning of legal queries and documents.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EMBEDDING_STRATEGIES.map(emb => {
            const active = g('rag', 'embedding', '') === emb.id
            return (
              <SelectCard key={emb.id} active={active} onClick={() => s('rag', 'embedding', emb.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: active ? `6px solid ${legalGold}` : '2px solid var(--border)',
                    boxSizing: 'border-box',
                  }} />
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>{emb.label}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{emb.desc}</div>
                  </div>
                </div>
              </SelectCard>
            )
          })}
        </div>
      </div>

      {/* Chunk Size */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 20px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          RAG Configuration
        </h3>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ ...lb, marginBottom: 0 }}>Chunk Size</label>
            <span style={{ color: legalGold, fontSize: 14, fontWeight: 700 }}>{chunkSize} tokens</span>
          </div>
          <input
            type="range" min={256} max={2048} step={128}
            value={chunkSize}
            onChange={e => s('rag', 'chunkSize', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: legalGold }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            <span>256 tokens (granular clauses)</span>
            <span>2048 tokens (full judgment sections)</span>
          </div>
        </div>

        {/* Top-K */}
        <div style={{ marginBottom: 24 }}>
          <label style={lb}>Top-K Results to Retrieve</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[3, 5, 8, 10, 15].map(k => {
              const active = g('rag', 'topK', '') === k
              return (
                <button key={k} onClick={() => s('rag', 'topK', k)} style={{
                  padding: '10px 22px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
                  border: active ? `2px solid ${legalGold}` : '1px solid var(--border)',
                  background: active ? 'rgba(201,168,76,0.1)' : 'var(--bg-secondary)',
                  color: active ? legalGold : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400, transition: 'all 0.15s',
                }}>
                  {k}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Retrieval Method */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select Retrieval Method
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Legal search needs to balance semantic understanding with exact term matching (section numbers, case citations, statutory references).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {RETRIEVAL_METHODS.map(rm => {
            const active = g('rag', 'retrieval', '') === rm.id
            return (
              <SelectCard key={rm.id} active={active} onClick={() => s('rag', 'retrieval', rm.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: active ? `6px solid ${legalGold}` : '2px solid var(--border)',
                    boxSizing: 'border-box',
                  }} />
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>{rm.label}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{rm.desc}</div>
                  </div>
                </div>
              </SelectCard>
            )
          })}
        </div>
      </div>

      {/* Sample Queries */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write 3 sample legal research queries that a lawyer might ask the system. For each query, describe what documents should be retrieved and how the system should rank results. Consider queries that mix statutory references with semantic concepts.
        </label>
        <textarea
          rows={10}
          style={ta}
          placeholder={'Example:\nQuery 1: "What is the current position on liquidated damages under Section 74 of the Indian Contract Act?"\nExpected retrieval: ONGC v. Saw Pipes, Kailash Nath v. DDA, relevant HC decisions\nRanking: Most recent SC decisions first, then HCs...\n\nQuery 2: ...\nQuery 3: ...'}
          value={g('rag', 'sampleQueries', '')}
          onChange={e => s('rag', 'sampleQueries', e.target.value)}
        />
      </div>

      {/* Metadata Design */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Legal documents need rich metadata for effective retrieval -- court name, bench strength, date, statutes interpreted, overruled/followed status. Design the metadata schema for your case law database.
        </label>
        <textarea
          rows={7}
          style={ta}
          placeholder="Define the fields: court_name, bench_size, judges[], date, citation, statutes_interpreted[], headnotes[], status (good_law/overruled/distinguished), subject_matter_tags[]..."
          value={g('rag', 'metadataSchema', '')}
          onChange={e => s('rag', 'metadataSchema', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SECTION 6 — Hallucination Prevention
   ===================================================================== */
function S6({ g, s, toggleMulti }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'🛡️'} title="Hallucination Prevention"
        desc="In the legal domain, hallucinations are not just inaccurate -- they can be catastrophic. A fabricated case citation or incorrect statutory reference could result in professional misconduct proceedings against the lawyer." />

      {/* Risk Scenarios */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Hallucination Risk in Legal AI
        </h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { level: 'Fabricated Citations', example: 'AI cites "Sharma v. State of UP (2019) 4 SCC 231" -- a case that does not exist', impact: 'Lawyer cited in court, Bar Council inquiry, contempt of court risk', color: '#dc2626' },
            { level: 'Incorrect Section References', example: 'AI says "Section 420 IPC" when the actual offence falls under "Section 406 IPC"', impact: 'Wrong charges framed, case dismissed on technicality, client suffers', color: '#ef4444' },
            { level: 'Misquoted Precedent Ratio', example: 'AI says "the Court held that damages are always recoverable" when the actual holding was conditional', impact: 'Misleading legal argument, loss of credibility, client loss', color: '#f59e0b' },
            { level: 'Outdated Legal Position', example: 'AI cites a provision that was amended by the 2020 Companies Act amendment', impact: 'Advice based on repealed law, regulatory non-compliance', color: '#f97316' },
          ].map(risk => (
            <div key={risk.level} style={{
              display: 'flex', alignItems: 'stretch', gap: 0, borderRadius: 12,
              overflow: 'hidden', border: '1px solid var(--border)',
            }}>
              <div style={{ width: 6, background: risk.color, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '14px 18px', background: 'var(--bg-secondary)' }}>
                <div style={{ color: risk.color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{risk.level}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontStyle: 'italic', marginBottom: 6 }}>{risk.example}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Impact: {risk.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guardrail Selection */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select Guardrails to Implement
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Choose the guardrails you would implement to prevent hallucinations. You can select multiple.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GUARDRAIL_OPTIONS.map(gr => {
            const selected = (g('hallucination', 'guardrails', []) || []).includes(gr.id)
            return (
              <div key={gr.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: selected ? 'rgba(201,168,76,0.06)' : 'var(--bg-secondary)',
                border: selected ? `1px solid ${legalGold}66` : '1px solid var(--border)',
                transition: 'all 0.2s',
              }}>
                <ToggleSwitch active={selected} onToggle={() => toggleMulti('hallucination', 'guardrails', gr.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{gr.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{gr.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Citation Verification Prompt */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write a prompt that instructs the AI to verify every citation it generates. The prompt should make the AI cross-check citations against a verified database and explicitly flag any citation it cannot verify. Include instructions for handling the common scenario where the AI "knows" a case exists but cannot find it in the database.
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder="Write your citation verification prompt. Consider: structured verification steps, confidence thresholds, fallback behavior when a citation cannot be verified, how to present unverified citations to the user..."
          value={g('hallucination', 'verificationPrompt', '')}
          onChange={e => s('hallucination', 'verificationPrompt', e.target.value)}
        />
      </div>

      {/* Prevention Strategy */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          The AI generates this response: "As held by the Supreme Court in Balram Prasad v. Kunal Green (2013) 7 SCC 410, liquidated damages clauses are always enforceable in India." You suspect this citation might be fabricated. Design a multi-step validation pipeline that catches fabricated citations before they reach the lawyer.
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder="Design your pipeline: Step 1 -- Verify citation format (SCC/AIR/SCR pattern). Step 2 -- Cross-check against database. Step 3 -- Verify the legal proposition matches the actual holding. Step 4 -- ..."
          value={g('hallucination', 'validationPipeline', '')}
          onChange={e => s('hallucination', 'validationPipeline', e.target.value)}
        />
      </div>

      {/* Uncertainty Communication */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          How should the system communicate uncertainty to the user? Write sample outputs showing: (1) a high-confidence response, (2) a medium-confidence response with caveats, and (3) a response where the system admits it cannot determine the answer.
        </label>
        <textarea
          rows={8}
          style={ta}
          placeholder="High confidence: 'Based on Section 74 of the Indian Contract Act and the SC decision in ONGC v. Saw Pipes (2003) 5 SCC 705 [VERIFIED], liquidated damages are...'\nMedium confidence: ...\nCannot determine: ..."
          value={g('hallucination', 'uncertaintyExamples', '')}
          onChange={e => s('hallucination', 'uncertaintyExamples', e.target.value)}
        />
      </div>
    </motion.div>
  )
}

/* =====================================================================
   SECTION 7 — Compliance & Ethics
   ===================================================================== */
function S7({ g, s, toggleMulti }) {
  return (
    <motion.div {...fadeSlide}>
      <SectionHdr icon={'🔒'} title="Compliance & Ethics"
        desc="Address the ethical considerations of using AI in legal practice: client confidentiality, unauthorized practice of law, bias in legal AI, and professional responsibility." />

      {/* Ethical Challenges */}
      <div style={{
        ...crd, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(220,38,38,0.05), rgba(220,38,38,0.01))',
        border: '1px solid rgba(220,38,38,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>{'⚠️'}</span>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', fontSize: 18 }}>
            Critical Ethical Challenges
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { issue: 'Client Confidentiality', desc: 'Attorney-client privilege is sacrosanct. If contract data is sent to OpenAI servers, is privilege waived?', color: '#ef4444' },
            { issue: 'Unauthorized Practice of Law', desc: 'If AI provides legal analysis to non-lawyers, is the firm facilitating UPL under the Advocates Act 1961?', color: '#f59e0b' },
            { issue: 'Bias in Legal AI', desc: 'Does the AI treat cases differently based on party names, religion, caste, or region mentioned in documents?', color: '#8b5cf6' },
            { issue: 'Accountability for Errors', desc: 'When AI misses a critical clause and the client suffers loss, who is liable -- the firm, the AI vendor, or the reviewing lawyer?', color: '#dc2626' },
          ].map(ch => (
            <div key={ch.issue} style={{
              background: 'var(--bg-card)', borderRadius: 12, padding: '16px 18px',
              border: `1px solid ${ch.color}25`,
            }}>
              <div style={{ color: ch.color, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{ch.issue}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{ch.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Safeguards Selection */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', fontSize: 17 }}>
          Select Appropriate Safeguards
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px' }}>
          Which safeguards would you implement to address the ethical challenges above?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ETHICAL_SAFEGUARDS.map(sg => {
            const selected = (g('ethics', 'safeguards', []) || []).includes(sg.id)
            return (
              <div key={sg.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: selected ? 'rgba(201,168,76,0.06)' : 'var(--bg-secondary)',
                border: selected ? `1px solid ${legalGold}66` : '1px solid var(--border)',
                transition: 'all 0.2s',
              }}>
                <ToggleSwitch active={selected} onToggle={() => toggleMulti('ethics', 'safeguards', sg.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{sg.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{sg.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confidentiality Deep Dive */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          A client's M&A deal worth Rs. 500 crores is highly confidential. The firm wants to use the AI to review the transaction documents. How do you ensure complete confidentiality? Would you use cloud APIs or on-premise deployment? What data protection agreements are needed?
        </label>
        <textarea
          rows={7}
          style={ta}
          placeholder="Consider: on-premise vs. cloud deployment trade-offs, data processing agreements with AI vendors, encryption requirements, access controls, audit logs, client consent requirements under Bar Council rules..."
          value={g('ethics', 'confidentiality', '')}
          onChange={e => s('ethics', 'confidentiality', e.target.value)}
        />
      </div>

      {/* Bias Analysis */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          How would you test your AI system for bias? For example, would the system flag different risk levels for the same contract clause if the party names were "Sharma Enterprises" vs. "Sheikh Enterprises"? Design a bias testing framework specific to Indian legal contexts.
        </label>
        <textarea
          rows={7}
          style={ta}
          placeholder="Design your bias testing approach: controlled experiments with name/religion/region variations, statistical analysis of risk scores across demographics, regular audits, fairness metrics..."
          value={g('ethics', 'biasTesting', '')}
          onChange={e => s('ethics', 'biasTesting', e.target.value)}
        />
      </div>

      {/* Ethical Guidelines Document */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <label style={lb}>
          Write an ethical guidelines document (5-7 key principles) that the firm should adopt for using AI in legal practice. These guidelines should address: when AI can and cannot be used, disclosure obligations, quality control standards, and accountability.
        </label>
        <textarea
          rows={10}
          style={ta}
          placeholder={'Write your ethical guidelines:\n\nPrinciple 1: AI as Assistive Tool -- AI outputs are advisory only. A qualified advocate must review and take responsibility for all AI-generated analysis before...\n\nPrinciple 2: Client Transparency -- ...\n\nPrinciple 3: Data Sovereignty -- ...'}
          value={g('ethics', 'guidelines', '')}
          onChange={e => s('ethics', 'guidelines', e.target.value)}
        />
      </div>

      <HindiExplainer
        concept="कानूनी AI में नैतिकता"
        english="Ethics in Legal AI"
        explanation="कानूनी क्षेत्र में AI का इस्तेमाल करते समय सबसे बड़ी चिंता यह है कि वकील-मुवक्किल का रिश्ता गोपनीय (confidential) होता है। अगर AI किसी client का contract पढ़ रहा है, तो वह data कहाँ जा रहा है? क्या AI company उसे देख सकती है? यह सवाल बहुत ज़रूरी हैं।"
        example="मान लीजिए एक कंपनी merger की बात कर रही है -- यह जानकारी share market को प्रभावित कर सकती है। अगर AI के ज़रिए यह data leak हो जाए, तो SEBI insider trading का केस बना सकता है। इसलिए on-premise (कंपनी के अपने server पर) AI चलाना ज़्यादा सुरक्षित माना जाता है।"
        terms={[
          { hindi: 'गोपनीयता', english: 'Confidentiality', meaning: 'वकील-मुवक्किल के बीच की जानकारी को गुप्त रखने का कर्तव्य' },
          { hindi: 'अनधिकृत विधि व्यवसाय', english: 'Unauthorized Practice of Law', meaning: 'बिना वकील की योग्यता के कानूनी सलाह देना -- भारत में अधिवक्ता अधिनियम 1961 के तहत अपराध' },
          { hindi: 'पूर्वाग्रह', english: 'Bias', meaning: 'AI द्वारा किसी समूह के प्रति अनुचित पक्षपात' },
        ]}
      />
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
        desc="Review your work across all sections before submitting. You can navigate back to any section to make changes." />

      {/* Completion Summary */}
      <div style={{ ...crd, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17 }}>
            Completion Summary
          </h3>
          <span style={{
            padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: pct === 100 ? 'rgba(34,197,94,0.15)' : 'rgba(201,168,76,0.15)',
            color: pct === 100 ? '#22c55e' : legalGold,
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
                : `linear-gradient(90deg, ${legalGold}, #3b82f6)`,
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
          background: `linear-gradient(135deg, ${legalGold}, #a8893a)`,
          boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
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
