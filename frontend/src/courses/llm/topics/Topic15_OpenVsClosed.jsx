import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

const openModels = [
  { name: 'Llama 3.1', org: 'Meta', params: '405B', license: 'Llama License', color: '#4f46e5' },
  { name: 'Mistral Large', org: 'Mistral AI', params: '123B', license: 'Apache 2.0', color: '#0ea5e9' },
  { name: 'Falcon 180B', org: 'TII', params: '180B', license: 'Apache 2.0', color: '#10b981' },
  { name: 'Phi-3', org: 'Microsoft', params: '14B', license: 'MIT', color: '#f97316' },
  { name: 'Qwen 2.5', org: 'Alibaba', params: '72B', license: 'Apache 2.0', color: '#ec4899' },
  { name: 'DeepSeek-V3', org: 'DeepSeek', params: '671B MoE', license: 'MIT', color: '#8b5cf6' },
]

const closedModels = [
  { name: 'GPT-4o', org: 'OpenAI', color: '#10b981' },
  { name: 'Claude 3.5', org: 'Anthropic', color: '#f97316' },
  { name: 'Gemini Ultra', org: 'Google', color: '#4f46e5' },
]

const comparisonRows = [
  { aspect: 'Cost', open: 'Free to run (hardware cost only)', closed: 'Per-token API pricing', openScore: 5, closedScore: 3 },
  { aspect: 'Customization', open: 'Full fine-tuning, modify weights', closed: 'Limited to prompt engineering / API params', openScore: 5, closedScore: 2 },
  { aspect: 'Privacy', open: 'Data stays local, full control', closed: 'Data sent to provider servers', openScore: 5, closedScore: 2 },
  { aspect: 'Performance', open: 'Competitive, catching up fast', closed: 'Generally leading benchmarks', openScore: 4, closedScore: 5 },
  { aspect: 'Ease of Use', open: 'Requires setup, GPU knowledge', closed: 'Simple API call, instant start', openScore: 2, closedScore: 5 },
  { aspect: 'Support', open: 'Community-driven, forums', closed: 'Enterprise SLAs, dedicated teams', openScore: 3, closedScore: 5 },
]

const timelineEvents = [
  { year: '2023', month: 'Feb', event: 'LLaMA 1 leaked online', color: '#ef4444', icon: '🔓' },
  { year: '2023', month: 'Jul', event: 'Llama 2 officially open-sourced', color: '#4f46e5', icon: '🦙' },
  { year: '2023', month: 'Sep', event: 'Mistral 7B released', color: '#0ea5e9', icon: '🌬️' },
  { year: '2024', month: 'Jan', event: 'Mixtral 8x22B (MoE breakthrough)', color: '#8b5cf6', icon: '🔀' },
  { year: '2024', month: 'Apr', event: 'Llama 3 released (8B, 70B)', color: '#4f46e5', icon: '🦙' },
  { year: '2024', month: 'Apr', event: 'Phi-3 mini (3.8B, phone-capable)', color: '#f97316', icon: '📱' },
  { year: '2024', month: 'Jul', event: 'Llama 3.1 405B (open GPT-4 class)', color: '#4f46e5', icon: '🏆' },
  { year: '2024', month: 'Dec', event: 'DeepSeek-V3 rivals closed models', color: '#ec4899', icon: '🚀' },
  { year: '2025', month: 'Apr', event: 'Llama 4 Maverick & Scout released', color: '#4f46e5', icon: '🦙' },
  { year: '2025', month: 'Jun', event: 'Open models fully competitive', color: '#10b981', icon: '✅' },
]

const spectrumItems = [
  { label: 'Fully Open', desc: 'Weights + data + code + paper', examples: 'OLMo, Pythia', color: '#10b981', pct: 0 },
  { label: 'Open Weights', desc: 'Weights released, data private', examples: 'Llama 3, Mistral', color: '#0ea5e9', pct: 30 },
  { label: 'API + Weights', desc: 'API access + downloadable', examples: 'Some Qwen models', color: '#f97316', pct: 55 },
  { label: 'API Only', desc: 'No weights, only API access', examples: 'GPT-4, Claude', color: '#ec4899', pct: 75 },
  { label: 'Fully Closed', desc: 'No public access at all', examples: 'Internal corp models', color: '#ef4444', pct: 100 },
]

const decisionNodes = [
  { question: 'Do you need maximum data privacy?', yes: 'open', no: 1 },
  { question: 'Do you need the absolute best performance?', yes: 'closed', no: 2 },
  { question: 'Do you need deep customization / fine-tuning?', yes: 'open', no: 3 },
  { question: 'Are you budget constrained?', yes: 'open', no: 'closed' },
]

const quizQuestions = [
  {
    q: 'What is your primary concern?',
    options: [
      { label: 'Data privacy & security', value: 'open' },
      { label: 'Best possible accuracy', value: 'closed' },
      { label: 'Low cost', value: 'open' },
      { label: 'Easy setup & maintenance', value: 'closed' },
    ],
  },
  {
    q: 'What is your team size?',
    options: [
      { label: 'Solo developer / small team', value: 'open' },
      { label: 'Large enterprise', value: 'closed' },
      { label: 'Research lab', value: 'open' },
      { label: 'Startup, move fast', value: 'closed' },
    ],
  },
  {
    q: 'How important is customization?',
    options: [
      { label: 'Need to fine-tune on my data', value: 'open' },
      { label: 'Prompt engineering is enough', value: 'closed' },
      { label: 'Want full control over model behavior', value: 'open' },
      { label: 'Just need general capabilities', value: 'closed' },
    ],
  },
  {
    q: 'What is your infrastructure?',
    options: [
      { label: 'Have GPUs / cloud GPU budget', value: 'open' },
      { label: 'No GPU, just want an API', value: 'closed' },
      { label: 'Can run on laptop (smaller models)', value: 'open' },
      { label: 'Prefer managed services', value: 'closed' },
    ],
  },
]

const quantLevels = [
  { bits: '32-bit (FP32)', size: '100%', quality: 100, speed: 40, color: '#4f46e5', desc: 'Full precision, research use' },
  { bits: '16-bit (FP16/BF16)', size: '50%', quality: 99, speed: 65, color: '#0ea5e9', desc: 'Standard training & inference' },
  { bits: '8-bit (INT8)', size: '25%', quality: 96, speed: 82, color: '#10b981', desc: 'Great balance of quality & speed' },
  { bits: '4-bit (GPTQ/GGUF)', size: '12.5%', quality: 90, speed: 95, color: '#f97316', desc: 'Run large models on consumer GPUs' },
]

const hfEcosystem = [
  { name: 'Models Hub', icon: '🧠', desc: '500K+ models to download', color: '#4f46e5' },
  { name: 'Datasets', icon: '📊', desc: '100K+ datasets for training', color: '#0ea5e9' },
  { name: 'Spaces', icon: '🚀', desc: 'Host demos & apps for free', color: '#10b981' },
  { name: 'Transformers', icon: '📦', desc: 'Python library to run any model', color: '#f97316' },
]

export default function Topic15_OpenVsClosed() {
  const [compHover, setCompHover] = useState(null)
  const [timelineIdx, setTimelineIdx] = useState(0)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizDone, setQuizDone] = useState(false)
  const [activeDecision, setActiveDecision] = useState(0)
  const [decisionResult, setDecisionResult] = useState(null)

  const handleQuizAnswer = (value) => {
    const newAnswers = [...quizAnswers, value]
    setQuizAnswers(newAnswers)
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1)
    } else {
      setQuizDone(true)
    }
  }

  const resetQuiz = () => {
    setQuizStep(0)
    setQuizAnswers([])
    setQuizDone(false)
  }

  const quizResult = () => {
    const openCount = quizAnswers.filter(a => a === 'open').length
    return openCount >= 3 ? 'open' : openCount <= 1 ? 'closed' : 'hybrid'
  }

  const handleDecision = (answer) => {
    const node = decisionNodes[activeDecision]
    const next = answer === 'yes' ? node.yes : node.no
    if (typeof next === 'string') {
      setDecisionResult(next)
    } else {
      setActiveDecision(next)
    }
  }

  const resetDecision = () => {
    setActiveDecision(0)
    setDecisionResult(null)
  }

  return (
    <div>
      {/* Neuron Intro */}
      <div style={{ marginBottom: 32 }}>
        <Neuron mood="thinking" size="large" message="Should AI be open or closed? This debate is shaping the future of technology. Open-source models let anyone download and modify them, while closed models are only available through APIs. Let's explore what this means for you!" />
      </div>

      {/* Section 1: What does Open vs Closed mean? */}
      <SectionBlock icon="🔓" title="What Does Open vs Closed Mean?" color="#4f46e5">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
          {/* Open Source Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              padding: 28, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
              border: '2px solid rgba(16,185,129,0.3)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔓</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>Open Source</div>
            {['Weights publicly available', 'Can download & run locally', 'Can modify & fine-tune', 'Community-driven development', 'Transparent architecture'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>+</span>
                <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
          </motion.div>

          {/* Closed Source Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              padding: 28, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
              border: '2px solid rgba(239,68,68,0.3)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>Closed Source</div>
            {['API access only', 'No downloadable weights', 'Company controlled updates', 'Proprietary architecture', 'Enterprise support & SLAs'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>-</span>
                <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Openness Spectrum */}
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>The Openness Spectrum</div>
        <div style={{ position: 'relative', padding: '30px 0 20px' }}>
          {/* Gradient bar */}
          <div style={{
            height: 8, borderRadius: 4,
            background: 'linear-gradient(to right, #10b981, #0ea5e9, #f97316, #ec4899, #ef4444)',
            marginBottom: 20,
          }} />
          {/* Spectrum items */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            {spectrumItems.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05 }}
                style={{
                  textAlign: 'center', flex: '1 1 120px', minWidth: 100,
                  padding: 12, borderRadius: 12,
                  background: `${item.color}10`,
                  border: `1px solid ${item.color}30`,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.desc}</div>
                <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-muted)' }}>{item.examples}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Section 2: Comparison Table */}
      <SectionBlock icon="📊" title="Head-to-Head Comparison" color="#0ea5e9">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* Open Models */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Open Source Models</div>
            {openModels.map(m => (
              <motion.div key={m.name} whileHover={{ x: 4 }} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: 6,
                borderLeft: `3px solid ${m.color}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.org}</div>
                </div>
                <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.params}</div>
                <div style={{ fontSize: 11, padding: '2px 8px', background: `${m.color}15`, borderRadius: 6, color: m.color }}>{m.license}</div>
              </motion.div>
            ))}
          </div>

          {/* Closed Models */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Closed Source Models</div>
            {closedModels.map(m => (
              <motion.div key={m.name} whileHover={{ x: 4 }} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: 6,
                borderLeft: `3px solid ${m.color}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.org}</div>
                </div>
                <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Proprietary</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed comparison */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Feature Comparison</div>
          {comparisonRows.map((row, i) => (
            <motion.div
              key={row.aspect}
              onMouseEnter={() => setCompHover(i)}
              onMouseLeave={() => setCompHover(null)}
              style={{
                display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12,
                padding: '14px 16px', borderRadius: 12, marginBottom: 6,
                background: compHover === i ? 'var(--bg-secondary)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{row.aspect}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: 4 }}>{row.open}</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} style={{
                      width: 18, height: 6, borderRadius: 3,
                      background: j < row.openScore ? '#10b981' : 'var(--bg-secondary)',
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: 4 }}>{row.closed}</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} style={{
                      width: 18, height: 6, borderRadius: 3,
                      background: j < row.closedScore ? '#ef4444' : 'var(--bg-secondary)',
                    }} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Section 3: Timeline */}
      <SectionBlock icon="📅" title="The Open Source AI Timeline" color="#8b5cf6">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
          Open-source AI exploded starting in 2023. Here is how the revolution unfolded:
        </p>
        <div style={{ position: 'relative', paddingLeft: 40 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 15, top: 0, bottom: 0, width: 3,
            background: 'linear-gradient(to bottom, #4f46e5, #ec4899, #10b981)',
            borderRadius: 2,
          }} />
          {timelineEvents.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onMouseEnter={() => setTimelineIdx(i)}
              style={{
                position: 'relative', marginBottom: 16, padding: '14px 20px',
                borderRadius: 14, cursor: 'pointer',
                background: timelineIdx === i ? `${ev.color}12` : 'transparent',
                border: timelineIdx === i ? `1px solid ${ev.color}30` : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {/* Dot */}
              <div style={{
                position: 'absolute', left: -33, top: 18,
                width: 14, height: 14, borderRadius: '50%',
                background: ev.color, border: '3px solid var(--bg-card)',
                boxShadow: `0 0 0 2px ${ev.color}40`,
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{ev.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ev.color }}>{ev.year} {ev.month}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.event}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Section 4: Decision Tree */}
      <SectionBlock icon="🌳" title="When to Use Which?" color="#f97316">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
          Walk through this decision tree to find the right approach for your use case.
        </p>

        {!decisionResult ? (
          <motion.div
            key={activeDecision}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center', padding: 32, borderRadius: 18,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Question {activeDecision + 1} of {decisionNodes.length}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
              {decisionNodes[activeDecision].question}
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDecision('yes')}
                style={{
                  padding: '14px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700,
                  background: '#10b981', color: 'white', border: 'none', cursor: 'pointer',
                }}
              >
                Yes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDecision('no')}
                style={{
                  padding: '14px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700,
                  background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer',
                }}
              >
                No
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center', padding: 32, borderRadius: 18,
              background: decisionResult === 'open' ? 'rgba(16,185,129,0.08)' : 'rgba(79,70,229,0.08)',
              border: `2px solid ${decisionResult === 'open' ? '#10b981' : '#4f46e5'}`,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>{decisionResult === 'open' ? '🔓' : '🔒'}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: decisionResult === 'open' ? '#10b981' : '#4f46e5', marginBottom: 8 }}>
              {decisionResult === 'open' ? 'Open Source' : 'Closed Source'} is your best bet!
            </div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {decisionResult === 'open'
                ? 'Models like Llama 3.1, Mistral, or DeepSeek-V3 would work great for your use case.'
                : 'Models like GPT-4, Claude, or Gemini offer the managed experience you need.'}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={resetDecision}
              style={{
                padding: '10px 24px', borderRadius: 10, fontSize: 14,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'var(--text-primary)',
              }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* Quick reference cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 24 }}>
          {[
            { need: 'Data Privacy', rec: 'Open Source', reason: 'Run locally, data never leaves', icon: '🔐', color: '#10b981' },
            { need: 'Best Performance', rec: 'Closed', reason: 'GPT-4, Claude lead benchmarks', icon: '🏆', color: '#4f46e5' },
            { need: 'Customization', rec: 'Open Source', reason: 'Fine-tune on your data', icon: '🔧', color: '#f97316' },
            { need: 'Budget', rec: 'Open Source', reason: 'No per-token costs', icon: '💰', color: '#10b981' },
            { need: 'Enterprise', rec: 'Closed', reason: 'SLAs, support, compliance', icon: '🏢', color: '#8b5cf6' },
          ].map(card => (
            <motion.div
              key={card.need}
              whileHover={{ y: -4 }}
              style={{
                padding: 18, borderRadius: 14,
                background: `${card.color}08`,
                border: `1px solid ${card.color}25`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Need: {card.need}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: card.color, marginBottom: 4 }}>{card.rec}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{card.reason}</div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Section 5: Interactive Quiz - Choose Your Model */}
      <InteractiveDemo title="Choose Your Model" instruction="Answer 4 questions about your use case and get a personalized model recommendation.">
        {!quizDone ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={quizStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Question {quizStep + 1} / {quizQuestions.length}
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, marginBottom: 20 }}>
                <motion.div
                  animate={{ width: `${((quizStep) / quizQuestions.length) * 100}%` }}
                  style={{ height: '100%', background: '#4f46e5', borderRadius: 2 }}
                />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
                {quizQuestions[quizStep].q}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {quizQuestions[quizStep].options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03, background: '#eef2ff' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleQuizAnswer(opt.value)}
                    style={{
                      padding: '16px 20px', borderRadius: 12, fontSize: 15,
                      background: 'white', border: '2px solid #e5e7eb',
                      cursor: 'pointer', textAlign: 'left', color: '#1e293b',
                      transition: 'border 0.2s',
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {quizResult() === 'open' ? '🔓' : quizResult() === 'closed' ? '🔒' : '🔀'}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, marginBottom: 12,
              color: quizResult() === 'open' ? '#10b981' : quizResult() === 'closed' ? '#4f46e5' : '#f97316',
            }}>
              {quizResult() === 'open' ? 'Open Source Models' : quizResult() === 'closed' ? 'Closed Source Models' : 'Hybrid Approach'}
            </div>
            <div style={{ fontSize: 15, color: '#475569', marginBottom: 8, maxWidth: 500, margin: '0 auto 16px' }}>
              {quizResult() === 'open'
                ? 'Based on your needs, open-source models like Llama 3.1 405B, DeepSeek-V3, or Mistral Large are your best fit. You get full control, privacy, and customization.'
                : quizResult() === 'closed'
                ? 'Based on your needs, closed models like GPT-4, Claude 3.5, or Gemini Ultra will serve you best. They offer top performance with minimal setup.'
                : 'You would benefit from using both! Use closed models for complex tasks and open models for privacy-sensitive or high-volume workloads.'}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Your answers: {quizAnswers.filter(a => a === 'open').length} open, {quizAnswers.filter(a => a === 'closed').length} closed
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={resetQuiz}
              style={{
                padding: '10px 24px', borderRadius: 10, fontSize: 14,
                background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              Retake Quiz
            </motion.button>
          </motion.div>
        )}
      </InteractiveDemo>

      {/* Section 6: How to Run Open Models */}
      <SectionBlock icon="💻" title="How to Run Open Models" color="#10b981">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
          Running AI on your own machine is easier than you think. Here are the main tools:
        </p>

        {/* Tools visual */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { name: 'Ollama', desc: 'One-command local LLM. Just type "ollama run llama3"', difficulty: 'Easy', color: '#10b981', icon: '🦙' },
            { name: 'LM Studio', desc: 'Desktop app with GUI. Download models with one click.', difficulty: 'Easy', color: '#0ea5e9', icon: '🖥️' },
            { name: 'vLLM', desc: 'High-performance inference server. Production-grade.', difficulty: 'Medium', color: '#f97316', icon: '🚀' },
            { name: 'Hugging Face', desc: 'Python library. pip install transformers, load any model.', difficulty: 'Medium', color: '#ec4899', icon: '🤗' },
          ].map(tool => (
            <motion.div
              key={tool.name}
              whileHover={{ y: -6, boxShadow: `0 8px 24px ${tool.color}20` }}
              style={{
                padding: 24, borderRadius: 16,
                background: 'var(--bg-secondary)',
                border: `1px solid ${tool.color}30`,
                transition: 'box-shadow 0.3s',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{tool.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{tool.name}</div>
              <div style={{
                display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 6,
                background: `${tool.color}15`, color: tool.color, fontWeight: 600, marginBottom: 8,
              }}>
                {tool.difficulty}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tool.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Local model visual */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
          padding: 28, borderRadius: 16, background: 'var(--bg-secondary)',
          flexWrap: 'wrap', marginBottom: 24,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>💻</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>Your Laptop</div>
          </div>
          <motion.div animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ fontSize: 24, color: '#10b981' }}>
            +
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🧠</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>Local Model</div>
          </div>
          <motion.div animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ fontSize: 24, color: '#10b981' }}>
            =
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🔐</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginTop: 4 }}>100% Private AI</div>
          </div>
        </div>

        {/* Quantization */}
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Quantization: Shrink Models to Fit</div>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          Quantization reduces the precision of model weights, making them smaller and faster with minimal quality loss.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {quantLevels.map(q => (
            <motion.div
              key={q.bits}
              whileHover={{ x: 4 }}
              style={{
                display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gap: 16, alignItems: 'center',
                padding: '14px 20px', borderRadius: 12,
                background: 'var(--bg-secondary)',
                borderLeft: `4px solid ${q.color}`,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: q.color }}>{q.bits}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Size: {q.size}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Quality</div>
                <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 4 }}>
                  <div style={{ width: `${q.quality}%`, height: '100%', background: q.color, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 11, color: q.color, marginTop: 2 }}>{q.quality}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Speed</div>
                <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 4 }}>
                  <div style={{ width: `${q.speed}%`, height: '100%', background: q.color, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 11, color: q.color, marginTop: 2 }}>{q.speed}%</div>
              </div>
            </motion.div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
          A 70B model at 4-bit quantization can run on a single consumer GPU (24GB VRAM)!
        </div>
      </SectionBlock>

      {/* Section 7: Hugging Face Ecosystem */}
      <SectionBlock icon="🤗" title="The Hugging Face Ecosystem" color="#ec4899">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
          Hugging Face is the "GitHub of AI" - the central hub where the open-source AI community shares models, datasets, and applications.
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16,
          position: 'relative',
        }}>
          {hfEcosystem.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              style={{
                padding: 24, borderRadius: 16, textAlign: 'center',
                background: `${item.color}08`,
                border: `2px solid ${item.color}25`,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.name}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
        {/* Connection lines visual */}
        <div style={{
          textAlign: 'center', marginTop: 20, padding: 20, borderRadius: 14,
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>How it all connects:</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', fontSize: 14, color: 'var(--text-secondary)' }}>
            <span style={{ padding: '4px 12px', background: '#4f46e515', borderRadius: 8, color: '#4f46e5', fontWeight: 600 }}>Find a model</span>
            <span>-&gt;</span>
            <span style={{ padding: '4px 12px', background: '#0ea5e915', borderRadius: 8, color: '#0ea5e9', fontWeight: 600 }}>Load dataset</span>
            <span>-&gt;</span>
            <span style={{ padding: '4px 12px', background: '#f9731615', borderRadius: 8, color: '#f97316', fontWeight: 600 }}>Fine-tune with Transformers</span>
            <span>-&gt;</span>
            <span style={{ padding: '4px 12px', background: '#10b98115', borderRadius: 8, color: '#10b981', fontWeight: 600 }}>Deploy on Spaces</span>
          </div>
        </div>
      </SectionBlock>

      {/* NeuronTips */}
      <NeuronTip type="deep">
        <strong>License Types Matter!</strong> Not all "open" models are the same:
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div><strong>Apache 2.0</strong> — Fully permissive. Use for anything, including commercial. (Mistral, Falcon)</div>
          <div><strong>MIT</strong> — Very permissive. Similar to Apache. (Phi-3, DeepSeek)</div>
          <div><strong>Llama License</strong> — Free for most uses, but Meta restricts if you have 700M+ monthly users. (Llama 3)</div>
          <div><strong>CC-BY-NC</strong> — Non-commercial only. Cannot use in products. (Some research models)</div>
        </div>
      </NeuronTip>

      <NeuronTip type="fun">
        <strong>The "We Have No Moat" memo:</strong> In May 2023, a leaked Google memo argued that open-source AI would catch up to both Google and OpenAI. By 2025, that prediction largely came true. DeepSeek-V3, trained for a fraction of the cost, rivaled GPT-4 on many benchmarks.
      </NeuronTip>

      <NeuronTip type="example">
        <strong>Real-world example:</strong> A hospital needs to analyze patient records with AI. They cannot send sensitive medical data to an external API due to HIPAA regulations. Solution: run Llama 3.1 70B locally on their own servers. Full AI capability, zero data leaves the building.
      </NeuronTip>

      <NeuronTip type="tip">
        <strong>The Chinchilla insight:</strong> DeepMind's research showed that most LLMs were undertrained — you get better results by training smaller models on more data rather than just making models bigger. This insight helped open-source models like Mistral 7B punch far above their weight class.
      </NeuronTip>

      <NeuronTip type="simple">
        <strong>Think of it like cooking:</strong> Closed-source AI is like ordering from a restaurant — convenient, tastes great, but you cannot change the recipe. Open-source AI is like getting the recipe — you can cook it yourself, modify ingredients, and make it exactly how you want. But you need a kitchen (GPU) and cooking skills (ML knowledge).
      </NeuronTip>
    </div>
  )
}
