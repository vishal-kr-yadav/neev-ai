import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

const models = [
  {
    id: 'gpt4', name: 'GPT-4 / GPT-4o', org: 'OpenAI', icon: '🟢', color: '#10b981',
    released: '2023-2024', params: '~1.8T (rumored MoE)',
    context: '128K tokens', type: 'Closed-source',
    arch: 'Decoder-only Transformer (likely MoE)',
    strengths: ['Best-in-class reasoning', 'Multimodal (vision + text)', 'Strong coding ability', 'Broad world knowledge'],
    weaknesses: ['Expensive API pricing', 'Closed weights — no customization', 'Can be verbose'],
    useCases: ['Complex reasoning tasks', 'Code generation & review', 'Multimodal applications', 'Enterprise assistants'],
    desc: 'The flagship model that popularized LLMs. GPT-4o adds native multimodal capabilities with text, vision, and audio in a single model. Known for strong reasoning and broad capabilities.',
  },
  {
    id: 'claude', name: 'Claude 3.5 / 4', org: 'Anthropic', icon: '🟣', color: '#8b5cf6',
    released: '2024-2025', params: 'Undisclosed',
    context: '200K tokens', type: 'Closed-source',
    arch: 'Decoder-only Transformer',
    strengths: ['Longest context window (200K)', 'Safety-focused via Constitutional AI', 'Excellent at analysis & writing', 'Strong coding and tool use'],
    weaknesses: ['API-only access', 'Can be over-cautious on some topics', 'Smaller ecosystem than OpenAI'],
    useCases: ['Long document analysis', 'Safe enterprise deployments', 'Research & writing', 'Agentic coding tasks'],
    desc: 'Built by Anthropic with a focus on safety and helpfulness. Uses Constitutional AI instead of pure RLHF. Known for handling extremely long contexts reliably and strong analytical capabilities.',
  },
  {
    id: 'gemini', name: 'Gemini 2.0', org: 'Google DeepMind', icon: '🔵', color: '#0ea5e9',
    released: '2024-2025', params: 'Undisclosed',
    context: '2M tokens', type: 'Closed-source',
    arch: 'Multimodal-native Transformer (MoE)',
    strengths: ['Natively multimodal (text, image, video, audio, code)', 'Massive 2M context window', 'Google Search integration', 'Strong at math & science'],
    weaknesses: ['Availability varies by region', 'API still maturing', 'Sometimes inconsistent quality'],
    useCases: ['Multimodal understanding', 'Scientific research', 'Google Workspace integration', 'Video & image analysis'],
    desc: 'Google\'s multimodal-native model trained on text, images, video, and audio from the ground up. Gemini 2.0 introduced agentic capabilities and a massive 2M token context window.',
  },
  {
    id: 'llama', name: 'Llama 3.1', org: 'Meta', icon: '🦙', color: '#f97316',
    released: '2024', params: '8B / 70B / 405B',
    context: '128K tokens', type: 'Open weights',
    arch: 'Decoder-only Transformer (Dense)',
    strengths: ['Fully open weights — run locally', 'Strong community & ecosystem', 'Multiple sizes available', 'Competitive with closed models'],
    weaknesses: ['Needs significant compute for 405B', 'No official multimodal version', 'Requires fine-tuning for best results'],
    useCases: ['Self-hosted enterprise AI', 'Research & experimentation', 'Privacy-sensitive applications', 'Fine-tuning base for custom models'],
    desc: 'Meta\'s open-weights model that democratized access to frontier AI. The 405B version competes with GPT-4 while being freely available for commercial use. The 8B version runs on a single GPU.',
  },
  {
    id: 'mistral', name: 'Mistral / Mixtral', org: 'Mistral AI', icon: '🌀', color: '#4f46e5',
    released: '2023-2024', params: '7B / 8x7B / 8x22B',
    context: '32-128K tokens', type: 'Open weights',
    arch: 'Decoder-only Transformer (MoE for Mixtral)',
    strengths: ['Extremely efficient MoE architecture', 'Punches above weight class', 'Open source with commercial license', 'Fast inference'],
    weaknesses: ['Smaller context than competitors', 'Less multi-modal support', 'Smaller community than Llama'],
    useCases: ['Cost-efficient deployment', 'Edge computing', 'Multilingual tasks (strong in EU languages)', 'Research into MoE architectures'],
    desc: 'French AI lab that proved small, efficient models can compete with giants. Mixtral\'s MoE architecture activates only 2 of 8 expert networks per token, giving GPT-3.5 level quality at a fraction of the compute.',
  },
  {
    id: 'deepseek', name: 'DeepSeek-V3', org: 'DeepSeek', icon: '🔍', color: '#ec4899',
    released: '2024-2025', params: '671B (MoE, 37B active)',
    context: '128K tokens', type: 'Open weights',
    arch: 'Decoder-only Transformer (MoE)',
    strengths: ['Extremely cost-efficient training', 'Competitive with GPT-4 on benchmarks', 'Open weights', 'Innovative MoE routing'],
    weaknesses: ['Limited multimodal support', 'Newer — less battle-tested', 'Large download size'],
    useCases: ['Budget-conscious deployments', 'Research', 'Coding tasks (strong on HumanEval)', 'Self-hosted alternatives to GPT-4'],
    desc: 'Trained for reportedly ~$5.5M — a fraction of typical frontier model costs. Achieved GPT-4 level performance through innovative training techniques and efficient MoE architecture with 671B total but only 37B active parameters per token.',
  },
  {
    id: 'cohere', name: 'Command R+', org: 'Cohere', icon: '📖', color: '#10b981',
    released: '2024', params: '104B',
    context: '128K tokens', type: 'API + open weights',
    arch: 'Decoder-only Transformer',
    strengths: ['Built-in RAG capabilities', 'Excellent citation/grounding', 'Enterprise-focused', 'Multi-language support (10+ languages)'],
    weaknesses: ['Less general-purpose than GPT-4', 'Smaller ecosystem', 'Not as strong at creative tasks'],
    useCases: ['Enterprise RAG systems', 'Search & retrieval', 'Multilingual business applications', 'Document Q&A with citations'],
    desc: 'Purpose-built for enterprise search and RAG (Retrieval-Augmented Generation). Excels at grounding responses in provided documents with proper citations. Strong focus on production reliability.',
  },
]

const benchmarkData = [
  { name: 'MMLU', desc: 'General knowledge', scores: { gpt4: 87, claude: 89, gemini: 90, llama: 85, mistral: 78, deepseek: 88 } },
  { name: 'HumanEval', desc: 'Code generation', scores: { gpt4: 91, claude: 93, gemini: 85, llama: 80, mistral: 72, deepseek: 89 } },
  { name: 'MATH', desc: 'Mathematics', scores: { gpt4: 76, claude: 78, gemini: 83, llama: 68, mistral: 60, deepseek: 79 } },
  { name: 'ARC-C', desc: 'Science reasoning', scores: { gpt4: 95, claude: 94, gemini: 96, llama: 91, mistral: 85, deepseek: 93 } },
]

const matchItems = [
  { task: 'Analyze a 500-page legal contract', answer: 'claude', hint: 'Which model has the longest reliable context window?' },
  { task: 'Run AI locally on your own server for privacy', answer: 'llama', hint: 'Which model is fully open-weights and free to run locally?' },
  { task: 'Build a search engine with cited answers', answer: 'cohere', hint: 'Which model was purpose-built for RAG and citations?' },
  { task: 'Analyze a YouTube video to summarize it', answer: 'gemini', hint: 'Which model is natively multimodal with video understanding?' },
  { task: 'Deploy AI cheaply at massive scale', answer: 'deepseek', hint: 'Which model is known for cost-efficient training and deployment?' },
  { task: 'Build an AI coding assistant', answer: 'gpt4', hint: 'Which model is widely used for strong general reasoning and coding?' },
]

const timelineEvents = [
  { year: '2018', name: 'GPT-1', org: 'OpenAI', params: '117M', color: '#10b981', desc: 'First GPT model. Showed that pre-training + fine-tuning works.' },
  { year: '2019', name: 'GPT-2', org: 'OpenAI', params: '1.5B', color: '#10b981', desc: 'Deemed "too dangerous to release." Generated surprisingly coherent text.' },
  { year: '2020', name: 'GPT-3', org: 'OpenAI', params: '175B', color: '#10b981', desc: 'Scaling breakthrough. In-context learning emerged. API released.' },
  { year: '2022', name: 'ChatGPT', org: 'OpenAI', params: '175B + RLHF', color: '#10b981', desc: 'RLHF-tuned GPT-3.5. Fastest-growing app ever — 100M users in 2 months.' },
  { year: '2023', name: 'GPT-4', org: 'OpenAI', params: '~1.8T', color: '#10b981', desc: 'Multimodal, vastly improved reasoning. Set new benchmarks across the board.' },
  { year: '2023', name: 'Claude 2', org: 'Anthropic', params: 'N/A', color: '#8b5cf6', desc: 'Constitutional AI approach. 100K context. Safety-focused design.' },
  { year: '2023', name: 'Llama 2', org: 'Meta', params: '7-70B', color: '#f97316', desc: 'Open-source game changer. Sparked the open-weights movement.' },
  { year: '2023', name: 'Mixtral', org: 'Mistral', params: '8x7B', color: '#4f46e5', desc: 'MoE architecture proves small models can match bigger ones.' },
  { year: '2024', name: 'Claude 3.5', org: 'Anthropic', params: 'N/A', color: '#8b5cf6', desc: 'Sonnet topped benchmarks. 200K context. Strong coding abilities.' },
  { year: '2024', name: 'Gemini 2.0', org: 'Google', params: 'N/A', color: '#0ea5e9', desc: 'Natively multimodal. 2M context. Agentic capabilities.' },
  { year: '2024', name: 'Llama 3.1', org: 'Meta', params: '8-405B', color: '#f97316', desc: '405B rivaled GPT-4. Open weights for commercial use.' },
  { year: '2025', name: 'DeepSeek-V3', org: 'DeepSeek', params: '671B MoE', color: '#ec4899', desc: 'Trained for ~$5.5M. Shocked the industry with cost efficiency.' },
  { year: '2025', name: 'Claude 4', org: 'Anthropic', params: 'N/A', color: '#8b5cf6', desc: 'Next-gen reasoning and safety. Extended thinking capabilities.' },
  { year: '2025', name: 'Open Source\nExplosion', org: 'Community', params: 'Various', color: '#f97316', desc: 'Qwen, Yi, Phi, Gemma, and dozens more. AI becomes accessible to all.' },
]

export default function Topic10_Models() {
  const [activeModel, setActiveModel] = useState('gpt4')
  const [activeTab, setActiveTab] = useState('overview')
  const [matchState, setMatchState] = useState({})
  const [matchRevealed, setMatchRevealed] = useState({})
  const [selectedTask, setSelectedTask] = useState(null)
  const [showMoE, setShowMoE] = useState(false)
  const [activeBenchmark, setActiveBenchmark] = useState('MMLU')

  const currentModel = models.find(m => m.id === activeModel)
  const currentBenchmark = benchmarkData.find(b => b.name === activeBenchmark)

  const handleMatch = (taskIdx, modelId) => {
    const item = matchItems[taskIdx]
    const correct = item.answer === modelId
    setMatchState(prev => ({ ...prev, [taskIdx]: { modelId, correct } }))
    setMatchRevealed(prev => ({ ...prev, [taskIdx]: true }))
  }

  return (
    <div>
      {/* Neuron Introduction */}
      <Neuron mood="waving" size="large" typed message="Welcome to the AI Model Zoo! There are dozens of LLMs out there, each with different strengths. Let me introduce you to the big players — from OpenAI's GPT-4 to open-source heroes like Llama. By the end, you'll know exactly which model to use for which task!" />

      <div style={{ height: 40 }} />

      {/* Section 1: Model Cards */}
      <SectionBlock icon="🏆" title="Major LLM Models" color="#4f46e5">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          Click on any model to explore its architecture, strengths, weaknesses, and ideal use cases:
        </p>

        {/* Model selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {models.map(m => (
            <motion.button
              key={m.id}
              onClick={() => { setActiveModel(m.id); setActiveTab('overview') }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: activeModel === m.id ? m.color : 'var(--bg-secondary)',
                color: activeModel === m.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13, transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{m.icon}</span> {m.name}
            </motion.button>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {['overview', 'strengths', 'use cases'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px', border: 'none', cursor: 'pointer',
                background: 'none', fontSize: 14, fontWeight: 600,
                color: activeTab === tab ? currentModel.color : 'var(--text-muted)',
                borderBottom: activeTab === tab ? `3px solid ${currentModel.color}` : '3px solid transparent',
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Model detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeModel}-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            style={{
              background: `${currentModel.color}06`, borderRadius: 16,
              padding: 28, border: `2px solid ${currentModel.color}18`,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `${currentModel.color}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 32,
              }}>
                {currentModel.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 22, color: currentModel.color }}>{currentModel.name}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {currentModel.org} | {currentModel.released} | {currentModel.type}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Parameters', value: currentModel.params },
                { label: 'Context', value: currentModel.context },
                { label: 'Architecture', value: currentModel.arch },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--bg-card)', borderRadius: 10, padding: '8px 16px',
                  border: '1px solid var(--border)', flex: '1 1 140px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: currentModel.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {currentModel.desc}
              </div>
            )}

            {activeTab === 'strengths' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: '#10b98110', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#10b981', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Strengths
                  </div>
                  {currentModel.strengths.map(s => (
                    <div key={s} style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#10b981', flexShrink: 0 }}>+</span> {s}
                    </div>
                  ))}
                </div>
                <div style={{ background: '#ef444410', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#ef4444', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Weaknesses
                  </div>
                  {currentModel.weaknesses.map(w => (
                    <div key={w} style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>-</span> {w}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'use cases' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {currentModel.useCases.map(uc => (
                  <div key={uc} style={{
                    padding: '10px 18px', borderRadius: 10,
                    background: `${currentModel.color}15`, color: currentModel.color,
                    fontSize: 14, fontWeight: 600,
                  }}>
                    {uc}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <NeuronTip type="simple">
          <strong>Kid-simple version:</strong> Think of LLMs like superheroes — each one has different powers! GPT-4 is like the all-rounder (Superman). Claude is the wise, careful one (Batman). Llama is the one anyone can train and use (Spider-Man, from the neighborhood). Gemini can see and hear everything (like having X-ray vision plus super hearing).
        </NeuronTip>
      </SectionBlock>

      {/* Section 2: Architecture Differences */}
      <SectionBlock icon="🏗️" title="Architecture Differences" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          Not all LLMs are built the same way. Two major architectural choices define how models work:
        </p>

        {/* Dense vs MoE */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          }}>
            <span style={{ fontSize: 24 }}>🧠</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Dense vs Mixture of Experts (MoE)</span>
            <motion.button
              onClick={() => setShowMoE(!showMoE)}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '4px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#8b5cf6', color: '#fff', fontSize: 12, fontWeight: 600,
                marginLeft: 'auto',
              }}
            >
              {showMoE ? 'Hide' : 'Show'} Diagram
            </motion.button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Dense */}
            <div style={{
              background: '#4f46e508', borderRadius: 16, padding: 24,
              border: '2px solid #4f46e522',
            }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#4f46e5', marginBottom: 12 }}>
                Dense Model
              </div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                Every token goes through <strong>every single parameter</strong>. All weights are active for every input. Simple but compute-hungry.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['GPT-4 (maybe)', 'Llama 3.1', 'Claude', 'Command R+'].map(m => (
                  <span key={m} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: '#4f46e515', color: '#4f46e5',
                  }}>{m}</span>
                ))}
              </div>
            </div>

            {/* MoE */}
            <div style={{
              background: '#ec489908', borderRadius: 16, padding: 24,
              border: '2px solid #ec489922',
            }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#ec4899', marginBottom: 12 }}>
                Mixture of Experts (MoE)
              </div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                A <strong>router</strong> sends each token to only 2-4 "expert" sub-networks out of many. Total params are huge, but active params per token are small.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Mixtral', 'DeepSeek-V3', 'Gemini (likely)', 'GPT-4 (rumored)'].map(m => (
                  <span key={m} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: '#ec489915', color: '#ec4899',
                  }}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* MoE visual diagram */}
          <AnimatePresence>
            {showMoE && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  background: 'var(--bg-secondary)', borderRadius: 16, padding: 28,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 24 }}>
                    How MoE Routes Tokens to Expert Networks
                  </div>

                  {/* Input token */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{
                        padding: '10px 24px', borderRadius: 10, fontWeight: 700,
                        background: '#4f46e5', color: '#fff', fontSize: 14,
                      }}
                    >
                      Input Token: "the"
                    </motion.div>

                    <div style={{ width: 2, height: 24, background: 'var(--text-muted)' }} />

                    {/* Router */}
                    <div style={{
                      padding: '12px 28px', borderRadius: 12,
                      background: 'linear-gradient(135deg, #f97316, #fb923c)',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                    }}>
                      Router Network
                    </div>

                    {/* Fan out to experts */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {Array.from({ length: 8 }, (_, i) => {
                        const isActive = i === 1 || i === 5
                        return (
                          <motion.div
                            key={i}
                            animate={isActive ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0px #10b98100', '0 0 16px #10b98144', '0 0 0px #10b98100'] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                              width: 80, padding: '12px 8px', borderRadius: 12, textAlign: 'center',
                              background: isActive ? '#10b98118' : 'var(--bg-card)',
                              border: `2px solid ${isActive ? '#10b981' : '#64748b33'}`,
                              opacity: isActive ? 1 : 0.4,
                            }}
                          >
                            <div style={{ fontSize: 20, marginBottom: 4 }}>
                              {isActive ? '🟢' : '⚪'}
                            </div>
                            <div style={{
                              fontSize: 11, fontWeight: 700,
                              color: isActive ? '#10b981' : 'var(--text-muted)',
                            }}>
                              Expert {i + 1}
                            </div>
                            {isActive && (
                              <div style={{ fontSize: 10, color: '#10b981', marginTop: 2 }}>ACTIVE</div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
                      Only <span style={{ color: '#10b981', fontWeight: 700 }}>2 of 8</span> experts are activated per token.
                      <br />Total params: 8x Expert size. Active params: 2x Expert size + Router.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decoder-only vs Encoder-Decoder */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>🔄</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Decoder-Only vs Encoder-Decoder</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{
              background: '#0ea5e908', borderRadius: 16, padding: 24,
              border: '2px solid #0ea5e922',
            }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#0ea5e9', marginBottom: 12 }}>
                Decoder-Only
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginBottom: 16, padding: 16,
                background: 'var(--bg-card)', borderRadius: 10,
              }}>
                <div style={{ padding: '8px 16px', borderRadius: 8, background: '#0ea5e920', color: '#0ea5e9', fontWeight: 700, fontSize: 13 }}>
                  Input
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 16px', borderRadius: 8, background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                  Decoder
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 16px', borderRadius: 8, background: '#10b98120', color: '#10b981', fontWeight: 700, fontSize: 13 }}>
                  Output
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                Generates tokens left-to-right. Each token can only attend to previous tokens (causal attention). Simpler and dominant today.
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Used by: GPT-4, Claude, Llama, Mistral, DeepSeek
              </div>
            </div>

            <div style={{
              background: '#f9731608', borderRadius: 16, padding: 24,
              border: '2px solid #f9731622',
            }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#f97316', marginBottom: 12 }}>
                Encoder-Decoder
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginBottom: 16, padding: 16,
                background: 'var(--bg-card)', borderRadius: 10, flexWrap: 'wrap',
              }}>
                <div style={{ padding: '8px 16px', borderRadius: 8, background: '#f9731620', color: '#f97316', fontWeight: 700, fontSize: 13 }}>
                  Input
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 16px', borderRadius: 8, background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                  Encoder
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 16px', borderRadius: 8, background: '#ec4899', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                  Decoder
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <div style={{ padding: '8px 16px', borderRadius: 8, background: '#10b98120', color: '#10b981', fontWeight: 700, fontSize: 13 }}>
                  Output
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                Encoder processes the full input with bidirectional attention. Decoder generates output attending to both the encoded input and previous tokens.
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Used by: T5, BART, original Transformer. Less common in modern LLMs.
              </div>
            </div>
          </div>
        </div>

        <NeuronTip type="deep">
          <strong>Why decoder-only won:</strong> Decoder-only models are simpler (one stack, not two) and scale better. The key insight: with enough scale, a decoder-only model can learn to "encode" the input implicitly during generation. Google's PaLM and Meta's Llama proved you do not need a separate encoder for most generation tasks. Encoder-decoder is still better for specific tasks like translation where you need full bidirectional understanding of the source.
        </NeuronTip>
      </SectionBlock>

      {/* Section 3: Benchmark Comparison */}
      <SectionBlock icon="📊" title="Benchmark Showdown" color="#0ea5e9">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          How do these models stack up on standardized tests? Select a benchmark to compare:
        </p>

        {/* Benchmark selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {benchmarkData.map(b => (
            <motion.button
              key={b.name}
              onClick={() => setActiveBenchmark(b.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: activeBenchmark === b.name ? '#0ea5e9' : 'var(--bg-secondary)',
                color: activeBenchmark === b.name ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13, transition: 'all 0.3s',
              }}
            >
              {b.name}
              <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 6 }}>({b.desc})</span>
            </motion.button>
          ))}
        </div>

        {/* Bar chart */}
        {currentBenchmark && (
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 16, padding: 24,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 20, textAlign: 'center' }}>
              {currentBenchmark.name}: {currentBenchmark.desc}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(currentBenchmark.scores)
                .sort(([, a], [, b]) => b - a)
                .map(([modelId, score]) => {
                  const model = models.find(m => m.id === modelId)
                  if (!model) return null
                  return (
                    <div key={modelId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ minWidth: 100, fontSize: 13, fontWeight: 600, color: model.color, textAlign: 'right' }}>
                        {model.icon} {model.name.split('/')[0].split(' ')[0]}
                      </div>
                      <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: 8, height: 28, overflow: 'hidden', position: 'relative' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
                          style={{
                            height: '100%', borderRadius: 8,
                            background: `linear-gradient(90deg, ${model.color}88, ${model.color})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            paddingRight: 10,
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{score}%</span>
                        </motion.div>
                      </div>
                    </div>
                  )
                })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
              Note: Scores are approximate and may vary by evaluation methodology. Based on publicly reported results as of early 2025.
            </div>
          </div>
        )}

        <NeuronTip type="warning">
          <strong>Benchmarks can be misleading!</strong> Models can be trained specifically to perform well on benchmarks (contamination). Real-world performance often differs from benchmark scores. Always test models on YOUR specific use case. The best model on paper is not always the best model for your task.
        </NeuronTip>
      </SectionBlock>

      {/* Section 4: Interactive - Match the Model */}
      <InteractiveDemo
        title="Match the Model to the Task!"
        instruction="For each task, pick the model that would be the best fit. Think about each model's unique strengths!"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {matchItems.map((item, idx) => {
            const result = matchState[idx]
            const revealed = matchRevealed[idx]
            const correctModel = models.find(m => m.id === item.answer)

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: 'var(--bg-card)', borderRadius: 14, padding: 20,
                  border: `2px solid ${revealed ? (result?.correct ? '#10b981' : '#ef4444') : 'var(--border)'}`,
                  transition: 'border-color 0.3s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 12 }}>
                  {idx + 1}. {item.task}
                </div>

                {!revealed && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {models.map(m => (
                        <motion.button
                          key={m.id}
                          onClick={() => handleMatch(idx, m.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: `${m.color}15`, color: m.color,
                            fontSize: 12, fontWeight: 600,
                          }}
                        >
                          {m.icon} {m.name.split('/')[0].split(' ')[0]}
                        </motion.button>
                      ))}
                    </div>
                    {selectedTask === idx && (
                      <div style={{ fontSize: 13, color: '#f97316', marginTop: 8, fontStyle: 'italic' }}>
                        Hint: {item.hint}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedTask(selectedTask === idx ? null : idx)}
                      style={{
                        marginTop: 8, padding: '4px 12px', borderRadius: 6,
                        border: 'none', cursor: 'pointer', background: '#f9731615',
                        color: '#f97316', fontSize: 12, fontWeight: 600,
                      }}
                    >
                      {selectedTask === idx ? 'Hide hint' : 'Need a hint?'}
                    </button>
                  </div>
                )}

                {revealed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', borderRadius: 10,
                      background: result?.correct ? '#10b98110' : '#ef444410',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{result?.correct ? '✅' : '❌'}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      {result?.correct
                        ? `Correct! ${correctModel.name} is the best fit.`
                        : `The best fit was ${correctModel.icon} ${correctModel.name}. ${item.hint}`}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Score: {Object.values(matchState).filter(s => s.correct).length} / {Object.keys(matchState).length} correct
        </div>
      </InteractiveDemo>

      {/* Section 5: Decision Tree */}
      <SectionBlock icon="🌳" title="Which Model for Which Task?" color="#10b981">
        <Neuron mood="explaining" message="Here is a practical decision tree to help you pick the right model. The best model depends on your priorities: cost, privacy, quality, or context length." />
        <div style={{ height: 20 }} />

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {[
            {
              question: 'Need maximum quality and budget is not a concern?',
              answer: 'GPT-4o or Claude 3.5 Sonnet', color: '#4f46e5', icon: '🏆',
            },
            {
              question: 'Need to analyze very long documents (100K+ tokens)?',
              answer: 'Claude (200K) or Gemini (2M context)', color: '#8b5cf6', icon: '📄',
            },
            {
              question: 'Need to process images, video, or audio?',
              answer: 'Gemini 2.0 (native multimodal) or GPT-4o', color: '#0ea5e9', icon: '🖼️',
            },
            {
              question: 'Need to run AI locally / keep data private?',
              answer: 'Llama 3.1 (8B for laptops, 70B for servers)', color: '#f97316', icon: '🔒',
            },
            {
              question: 'Need cost-efficient deployment at scale?',
              answer: 'DeepSeek-V3 or Mixtral (MoE efficiency)', color: '#ec4899', icon: '💰',
            },
            {
              question: 'Building a search / RAG system with citations?',
              answer: 'Command R+ (purpose-built for RAG)', color: '#10b981', icon: '🔍',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex', gap: 16, padding: 18, borderRadius: 14,
                background: 'var(--bg-secondary)', border: `1px solid ${item.color}22`,
                alignItems: 'center',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${item.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {item.question}
                </div>
                <div style={{ fontSize: 14, color: item.color, fontWeight: 700 }}>
                  → {item.answer}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Section 6: Timeline */}
      <SectionBlock icon="📅" title="The LLM Timeline" color="#f97316">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          From GPT-1's humble 117M parameters to today's trillion-parameter models, the pace of progress has been breathtaking:
        </p>

        <div style={{ position: 'relative', paddingLeft: 40 }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 16, top: 0, bottom: 0,
            width: 3, background: 'linear-gradient(to bottom, #4f46e5, #ec4899, #f97316, #10b981)',
            borderRadius: 4,
          }} />

          {timelineEvents.map((event, i) => (
            <motion.div
              key={`${event.name}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              style={{
                position: 'relative', marginBottom: 16, paddingLeft: 24,
              }}
            >
              {/* Dot */}
              <div style={{
                position: 'absolute', left: -32, top: 8,
                width: 14, height: 14, borderRadius: '50%',
                background: event.color, border: '3px solid var(--bg-secondary)',
                zIndex: 1,
              }} />

              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 12, padding: 16,
                border: `1px solid ${event.color}22`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    background: `${event.color}20`, color: event.color,
                  }}>
                    {event.year}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{event.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{event.org}</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                  }}>
                    {event.params}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {event.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <NeuronTip type="fun">
          <strong>Fun fact:</strong> ChatGPT reached 100 million users in just 2 months after launch (November 2022). For comparison, it took Instagram 2.5 years and TikTok 9 months to reach the same milestone. The AI revolution happened faster than anyone predicted!
        </NeuronTip>
      </SectionBlock>

      {/* Section 7: Pricing & Practical Info */}
      <SectionBlock icon="💰" title="Pricing & Context Windows" color="#ec4899">
        <Neuron mood="thinking" message="Let's talk money and practical limits. These change frequently, but here's a snapshot to help you plan your projects." />
        <div style={{ height: 20 }} />

        <div style={{
          overflowX: 'auto', borderRadius: 16, border: '1px solid var(--border)',
          marginBottom: 24,
        }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: 14, color: 'var(--text-secondary)',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Model', 'Input (per 1M tokens)', 'Output (per 1M tokens)', 'Context Window', 'Open Weights?'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontWeight: 700,
                    fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: 0.5, borderBottom: '2px solid var(--border)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'GPT-4o', input: '$2.50', output: '$10.00', ctx: '128K', open: 'No', color: '#10b981' },
                { name: 'Claude 3.5 Sonnet', input: '$3.00', output: '$15.00', ctx: '200K', open: 'No', color: '#8b5cf6' },
                { name: 'Gemini 2.0 Flash', input: '$0.10', output: '$0.40', ctx: '1M', open: 'No', color: '#0ea5e9' },
                { name: 'Llama 3.1 70B', input: 'Free*', output: 'Free*', ctx: '128K', open: 'Yes', color: '#f97316' },
                { name: 'Mixtral 8x22B', input: 'Free*', output: 'Free*', ctx: '65K', open: 'Yes', color: '#4f46e5' },
                { name: 'DeepSeek-V3', input: '$0.27', output: '$1.10', ctx: '128K', open: 'Yes', color: '#ec4899' },
                { name: 'Command R+', input: '$2.50', output: '$10.00', ctx: '128K', open: 'Partial', color: '#10b981' },
              ].map((row, i) => (
                <tr key={row.name} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: row.color }}>{row.name}</td>
                  <td style={{ padding: '10px 16px' }}>{row.input}</td>
                  <td style={{ padding: '10px 16px' }}>{row.output}</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace' }}>{row.ctx}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: row.open === 'Yes' ? '#10b98115' : row.open === 'Partial' ? '#f9731615' : '#ef444415',
                      color: row.open === 'Yes' ? '#10b981' : row.open === 'Partial' ? '#f97316' : '#ef4444',
                    }}>
                      {row.open}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          *Free = open weights, but you pay for compute (GPU hosting). Prices as of early 2025 and change frequently.
        </div>

        <NeuronTip type="tip">
          <strong>Cost optimization tips:</strong><br />
          - Use smaller models (GPT-4o-mini, Claude Haiku, Gemini Flash) for simple tasks — 10-50x cheaper.<br />
          - Cache common prompts to avoid paying for the same tokens repeatedly.<br />
          - Use open-source models for high-volume, latency-insensitive workloads.<br />
          - Batch requests where possible — many APIs offer batch pricing discounts.<br />
          - Set max_tokens to avoid paying for unnecessarily long responses.
        </NeuronTip>

        <NeuronTip type="example">
          <strong>Real cost example:</strong> Processing 1,000 customer support emails (~500 tokens each input, ~200 tokens each output) with GPT-4o costs about $1.25 input + $2.00 output = <strong>$3.25 total</strong>. With Gemini Flash, the same task costs about <strong>$0.13 total</strong> — 25x cheaper. If quality is similar for your use case, the savings add up fast.
        </NeuronTip>
      </SectionBlock>

      {/* Summary */}
      <div style={{ marginTop: 16 }}>
        <Neuron mood="happy" size="large" message="And that's the LLM landscape! Remember: there is no single 'best' model — it depends on your task, budget, and requirements. The field moves incredibly fast, so stay curious and keep experimenting. The best model for you might not even exist yet!" />
      </div>
    </div>
  )
}
