import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 14 — AI Agents & Tool Use
================================================================ */

/* ---- Diagram: What is an AI Agent ---- */
function AgentDiagram() {
  const parts = [
    { icon: '🧠', label: 'LLM Brain', desc: 'Reasons about tasks', color: '#4f46e5', x: 50, y: 15 },
    { icon: '🔧', label: 'Tools', desc: 'APIs, search, code', color: '#0ea5e9', x: 18, y: 55 },
    { icon: '💾', label: 'Memory', desc: 'Context & history', color: '#10b981', x: 82, y: 55 },
    { icon: '📋', label: 'Planning', desc: 'Break down & sequence', color: '#f97316', x: 50, y: 80 },
  ]

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 500, height: 340, margin: '0 auto' }}>
      {/* Center agent circle */}
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: 90, height: 90, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(79,70,229,0.3)',
        }}
      >
        <span style={{ fontSize: 32, color: 'white', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>AI</span>
      </motion.div>

      {/* Component nodes */}
      {parts.map((p, i) => (
        <motion.div key={p.label}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15, type: 'spring' }}
          style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 2,
          }}
        >
          <div style={{
            width: 70, height: 70, borderRadius: 18, background: `${p.color}15`,
            border: `2px solid ${p.color}44`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 30, margin: '0 auto 6px',
          }}>
            {p.icon}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.desc}</div>
        </motion.div>
      ))}

      {/* Connecting lines (SVG) */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <line x1="50%" y1="27%" x2="26%" y2="48%" stroke="#4f46e544" strokeWidth="2" strokeDasharray="6,4" />
        <line x1="50%" y1="27%" x2="74%" y2="48%" stroke="#4f46e544" strokeWidth="2" strokeDasharray="6,4" />
        <line x1="26%" y1="62%" x2="50%" y2="75%" stroke="#4f46e544" strokeWidth="2" strokeDasharray="6,4" />
        <line x1="74%" y1="62%" x2="50%" y2="75%" stroke="#4f46e544" strokeWidth="2" strokeDasharray="6,4" />
      </svg>
    </div>
  )
}

/* ---- Agent Loop Animation ---- */
function AgentLoop() {
  const [step, setStep] = useState(0)
  const steps = [
    { label: 'Think', icon: '🤔', desc: 'Agent reasons about the task and decides what to do next.', color: '#4f46e5' },
    { label: 'Act', icon: '⚡', desc: 'Agent calls a tool (search, API, code runner) to gather info or perform action.', color: '#0ea5e9' },
    { label: 'Observe', icon: '👀', desc: 'Agent reads the result from the tool and evaluates the outcome.', color: '#10b981' },
    { label: 'Reflect', icon: '💭', desc: 'Agent decides: is the task done, or should I loop back and try again?', color: '#f97316' },
  ]

  const advance = () => setStep((step + 1) % steps.length)
  const current = steps[step]

  return (
    <div>
      {/* Loop visualization */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ scale: step === i ? 1.15 : 1, opacity: step === i ? 1 : 0.45 }}
              style={{
                padding: '12px 20px', borderRadius: 14,
                background: step === i ? `${s.color}20` : 'var(--bg-secondary)',
                border: `2px solid ${step === i ? s.color : 'var(--border)'}`,
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
              }}
              onClick={() => setStep(i)}
            >
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: step === i ? s.color : 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ fontSize: 18, color: 'var(--text-muted)', fontWeight: 700 }}>→</motion.span>
            )}
            {i === steps.length - 1 && (
              <motion.span animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: 18, color: '#f97316', fontWeight: 700 }}>↻</motion.span>
            )}
          </div>
        ))}
      </div>

      {/* Current step detail */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          style={{ padding: 24, background: `${current.color}10`, borderRadius: 16, border: `1px solid ${current.color}33`, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{current.icon}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: current.color, marginBottom: 8 }}>{current.label}</div>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>{current.desc}</p>
        </motion.div>
      </AnimatePresence>

      <div style={{ textAlign: 'center' }}>
        <motion.button onClick={advance} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 32px', borderRadius: 12, border: 'none',
            background: current.color, color: 'white', fontSize: 16,
            fontWeight: 600, cursor: 'pointer',
          }}>
          Next Step →
        </motion.button>
      </div>
    </div>
  )
}

/* ---- Tool Use Flow Diagram ---- */
function ToolUseFlow() {
  const [showResult, setShowResult] = useState(false)
  const steps = [
    { label: 'User asks', content: '"What\'s the weather in Tokyo?"', icon: '💬', color: '#4f46e5' },
    { label: 'LLM thinks', content: 'I need real-time data. Let me call the weather API.', icon: '🤔', color: '#8b5cf6' },
    { label: 'Tool call', content: 'weather_api(city="Tokyo")', icon: '🔧', color: '#0ea5e9' },
    { label: 'Tool result', content: '{"temp": 22, "condition": "Sunny"}', icon: '📡', color: '#10b981' },
    { label: 'LLM responds', content: 'It\'s 22C and sunny in Tokyo right now!', icon: '✨', color: '#f97316' },
  ]

  return (
    <div>
      <div style={{ position: 'relative' }}>
        {steps.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: !showResult && i > 2 ? 0.3 : 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            style={{
              display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16,
              padding: 18, background: `${s.color}08`, borderRadius: 14,
              border: `1px solid ${s.color}22`, position: 'relative',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: `${s.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: i === 2 || i === 3 ? 'monospace' : 'inherit', lineHeight: 1.6 }}>{s.content}</div>
            </div>
            {/* Vertical connector */}
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute', bottom: -16, left: 38, width: 2, height: 16, background: 'var(--border)' }} />
            )}
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <motion.button onClick={() => setShowResult(!showResult)}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: '#4f46e5', color: 'white', fontSize: 15,
            fontWeight: 600, cursor: 'pointer',
          }}>
          {showResult ? 'Show thinking steps' : 'Show complete flow'}
        </motion.button>
      </div>
    </div>
  )
}

/* ---- Interactive: Be The Agent ---- */
function BeTheAgent() {
  const scenarios = [
    {
      question: 'What is 847 x 293?',
      tools: [
        { name: 'Calculator', icon: '🧮', correct: true },
        { name: 'Web Search', icon: '🔍', correct: false },
        { name: 'Code Runner', icon: '💻', correct: false },
        { name: 'Database', icon: '🗄️', correct: false },
      ],
      result: '847 x 293 = 248,171',
      explanation: 'For precise math, a calculator tool is the best choice. LLMs can make arithmetic errors!',
    },
    {
      question: 'What are the latest headlines about AI regulation?',
      tools: [
        { name: 'Calculator', icon: '🧮', correct: false },
        { name: 'Web Search', icon: '🔍', correct: true },
        { name: 'Code Runner', icon: '💻', correct: false },
        { name: 'Database', icon: '🗄️', correct: false },
      ],
      result: 'Found 5 recent articles about AI regulation from major news outlets...',
      explanation: 'Current events need web search -- the LLM\'s training data has a cutoff date.',
    },
    {
      question: 'Generate a chart of sales data from our quarterly report.',
      tools: [
        { name: 'Calculator', icon: '🧮', correct: false },
        { name: 'Web Search', icon: '🔍', correct: false },
        { name: 'Code Runner', icon: '💻', correct: true },
        { name: 'Database', icon: '🗄️', correct: false },
      ],
      result: 'Executed Python script: chart saved as sales_q4.png',
      explanation: 'Data visualization requires running actual code (matplotlib/plotly). The LLM writes the code, the tool executes it.',
    },
    {
      question: 'How many orders did customer #4521 place last month?',
      tools: [
        { name: 'Calculator', icon: '🧮', correct: false },
        { name: 'Web Search', icon: '🔍', correct: false },
        { name: 'Code Runner', icon: '💻', correct: false },
        { name: 'Database', icon: '🗄️', correct: true },
      ],
      result: 'SELECT COUNT(*) FROM orders WHERE customer_id=4521 AND date >= ... → 7 orders',
      explanation: 'Customer-specific data lives in a database. The agent writes a SQL query to fetch it.',
    },
  ]

  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const scenario = scenarios[scenarioIdx]

  const handleSelect = (toolIdx) => {
    setSelected(toolIdx)
    setShowResult(true)
  }

  const nextScenario = () => {
    setScenarioIdx((scenarioIdx + 1) % scenarios.length)
    setSelected(null)
    setShowResult(false)
  }

  return (
    <div>
      {/* Question */}
      <div style={{
        padding: '18px 24px', background: 'var(--bg-card)', borderRadius: 14,
        border: '2px dashed var(--border)', marginBottom: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>User asks:</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>"{scenario.question}"</div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 16, color: 'var(--text-muted)', marginBottom: 20 }}>
        You are the agent. Which tool should you use?
      </p>

      {/* Tool choices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {scenario.tools.map((tool, i) => {
          let bg = 'var(--bg-card)'
          let border = 'var(--border)'
          let textColor = 'var(--text-primary)'
          if (showResult && tool.correct) { bg = '#d1fae5'; border = '#10b981'; textColor = '#065f46' }
          else if (showResult && selected === i && !tool.correct) { bg = '#fee2e2'; border = '#ef4444'; textColor = '#991b1b' }

          return (
            <motion.button key={tool.name} onClick={() => !showResult && handleSelect(i)}
              whileHover={!showResult ? { scale: 1.06, y: -4 } : {}}
              whileTap={!showResult ? { scale: 0.94 } : {}}
              style={{
                padding: '20px 16px', borderRadius: 16, border: `2px solid ${border}`,
                background: bg, color: textColor, cursor: showResult ? 'default' : 'pointer',
                textAlign: 'center', fontSize: 16, fontWeight: 600,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{tool.icon}</div>
              {tool.name}
            </motion.button>
          )
        })}
      </div>

      {/* Result */}
      {showResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{
            padding: 20, borderRadius: 14, marginBottom: 16,
            background: scenario.tools[selected]?.correct ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${scenario.tools[selected]?.correct ? '#bbf7d0' : '#fecaca'}`,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: scenario.tools[selected]?.correct ? '#065f46' : '#991b1b', marginBottom: 8 }}>
              {scenario.tools[selected]?.correct ? 'Correct! Great agent instincts.' : `Not quite! The right tool was ${scenario.tools.find(t => t.correct).name}.`}
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{scenario.explanation}</p>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>
              Tool output: {scenario.result}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={nextScenario}
              style={{ padding: '12px 28px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>
              Next Scenario →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ---- Types of Agents Visual Cards ---- */
function AgentTypesCards() {
  const [active, setActive] = useState(0)
  const types = [
    {
      title: 'ReAct Agent', color: '#4f46e5', icon: '🔄',
      desc: 'Reasoning + Acting. The agent thinks step-by-step, then takes action, then observes. Inspired by how humans solve problems.',
      chain: ['Thought: I need to find the population of France.', 'Action: search("population of France 2024")', 'Observation: 68.17 million', 'Thought: Now I can answer.', 'Answer: France has ~68.17 million people.'],
    },
    {
      title: 'Function Calling', color: '#0ea5e9', icon: '📞',
      desc: 'The LLM outputs structured JSON to invoke specific functions. Clean, predictable, and used by OpenAI, Claude, and Gemini APIs.',
      chain: ['User: "Send an email to John about the meeting"', '→ call: send_email(to="john@co.com", subject="Meeting", body="...")', '← result: { "status": "sent", "id": "msg_123" }', 'Agent: "Done! Email sent to John."'],
    },
    {
      title: 'Multi-Agent', color: '#10b981', icon: '👥',
      desc: 'Multiple specialized agents collaborate. A manager agent delegates tasks to researcher, writer, and reviewer agents.',
      chain: ['Manager: "Research AI trends, write a report"', 'Researcher Agent: searches & gathers data', 'Writer Agent: drafts the report', 'Reviewer Agent: checks for accuracy', 'Manager: delivers final report'],
    },
    {
      title: 'Code Agent', color: '#f97316', icon: '💻',
      desc: 'Writes and executes code to solve problems. Can install packages, run scripts, and iterate on errors.',
      chain: ['Task: "Analyze this CSV and find outliers"', 'Writes: import pandas as pd; df = pd.read_csv(...)', 'Runs code → sees output', 'Writes: df[df["value"] > 3*std]...', 'Returns: "Found 12 outliers in column X"'],
    },
  ]
  const t = types[active]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {types.map((type, i) => (
          <motion.button key={type.title} onClick={() => setActive(i)} whileHover={{ scale: 1.03 }}
            style={{
              padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              border: active === i ? `2px solid ${type.color}` : '2px solid var(--border)',
              background: active === i ? `${type.color}15` : 'var(--bg-secondary)',
              color: active === i ? type.color : 'var(--text-secondary)', transition: 'all 0.2s',
            }}>
            {type.icon} {type.title}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ padding: 28, background: `${t.color}08`, borderRadius: 18, border: `1px solid ${t.color}22` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 28 }}>{t.icon}</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: t.color }}>{t.title}</h3>
          </div>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>{t.desc}</p>

          {/* Thought chain */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 18 }}>
            {t.chain.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{
                  padding: '10px 14px', borderLeft: `3px solid ${t.color}${i === t.chain.length - 1 ? '' : '55'}`,
                  marginBottom: i < t.chain.length - 1 ? 8 : 0,
                  fontSize: 14, fontFamily: 'monospace', color: i === t.chain.length - 1 ? t.color : 'var(--text-muted)',
                  fontWeight: i === t.chain.length - 1 ? 700 : 400, lineHeight: 1.6,
                }}>
                {step}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Agent Frameworks Cards ---- */
function AgentFrameworks() {
  const frameworks = [
    { name: 'LangChain', desc: 'Most popular framework for building LLM apps and agents', color: '#4f46e5', tag: 'Python / JS' },
    { name: 'LangGraph', desc: 'Stateful, multi-actor agent workflows with cycles', color: '#8b5cf6', tag: 'Graph-based' },
    { name: 'AutoGPT', desc: 'Autonomous agents that set their own goals', color: '#0ea5e9', tag: 'Autonomous' },
    { name: 'CrewAI', desc: 'Multi-agent collaboration with roles and delegation', color: '#10b981', tag: 'Multi-agent' },
    { name: 'Claude Computer Use', desc: 'Claude controls a computer: clicks, types, reads screen', color: '#f97316', tag: 'Anthropic' },
    { name: 'OpenAI Assistants', desc: 'Built-in tools: code interpreter, retrieval, function calling', color: '#ec4899', tag: 'OpenAI' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
      {frameworks.map((fw, i) => (
        <motion.div key={fw.name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
          style={{
            padding: 22, background: `${fw.color}08`, borderRadius: 16,
            border: `1px solid ${fw.color}22`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: fw.color }}>{fw.name}</div>
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: `${fw.color}18`, color: fw.color, fontWeight: 600 }}>{fw.tag}</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{fw.desc}</div>
        </motion.div>
      ))}
    </div>
  )
}

/* ---- Memory Systems Diagram ---- */
function MemorySystems() {
  const memories = [
    {
      type: 'Short-term Memory', icon: '💬', color: '#4f46e5', bg: '#ede9fe',
      desc: 'The current conversation. Limited by context window (e.g., 128K tokens).',
      examples: ['Last 10 messages', 'Current task details', 'User preferences this session'],
      capacity: '~128K tokens',
    },
    {
      type: 'Long-term Memory', icon: '🗄️', color: '#10b981', bg: '#d1fae5',
      desc: 'Persisted in a vector database. Survives across sessions.',
      examples: ['Past conversations', 'User profile data', 'Learned preferences'],
      capacity: 'Unlimited',
    },
    {
      type: 'Working Memory', icon: '📋', color: '#f97316', bg: '#fff7ed',
      desc: 'A scratchpad for the current task. Plans, intermediate results, notes.',
      examples: ['Current plan steps', 'Partial results', 'Thought chain'],
      capacity: 'Task-scoped',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
      {memories.map((mem, i) => (
        <motion.div key={mem.type}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12 }}
          whileHover={{ y: -4 }}
          style={{ padding: 24, background: mem.bg, borderRadius: 18, border: `1px solid ${mem.color}33` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>{mem.icon}</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: mem.color }}>{mem.type}</div>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{mem.desc}</p>
          <div style={{ marginBottom: 12 }}>
            {mem.examples.map(ex => (
              <div key={ex} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {ex}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: mem.color, padding: '4px 10px', background: `${mem.color}15`, borderRadius: 8, display: 'inline-block' }}>
            Capacity: {mem.capacity}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ---- Real-Life Agent Examples with Animated Flows ---- */
function RealAgentExamples() {
  const [active, setActive] = useState(0)
  const examples = [
    {
      title: 'Customer Support Agent', icon: '🎧', color: '#4f46e5', bg: '#ede9fe',
      flow: [
        { step: 'Reads ticket', detail: 'Customer: "My order #4521 hasn\'t arrived"', icon: '📩' },
        { step: 'Searches docs', detail: 'Queries order database and shipping API', icon: '🔍' },
        { step: 'Drafts response', detail: '"Your order is in transit, ETA tomorrow"', icon: '✍️' },
        { step: 'Escalates if needed', detail: 'Complex issues → routes to human agent', icon: '👤' },
      ],
    },
    {
      title: 'Coding Agent', icon: '💻', color: '#0ea5e9', bg: '#e0f2fe',
      flow: [
        { step: 'Reads task', detail: '"Add pagination to the user list endpoint"', icon: '📋' },
        { step: 'Writes code', detail: 'Generates pagination logic and SQL queries', icon: '⌨️' },
        { step: 'Runs tests', detail: 'Executes test suite, 2 failures detected', icon: '🧪' },
        { step: 'Fixes & submits', detail: 'Fixes edge case, all tests pass, creates PR', icon: '✅' },
      ],
    },
    {
      title: 'Research Agent', icon: '🔬', color: '#10b981', bg: '#d1fae5',
      flow: [
        { step: 'Gets question', detail: '"What are the latest advances in quantum computing?"', icon: '❓' },
        { step: 'Searches web', detail: 'Queries academic papers, news, and tech blogs', icon: '🌐' },
        { step: 'Reads papers', detail: 'Extracts key findings from 12 recent papers', icon: '📄' },
        { step: 'Synthesizes', detail: 'Produces a structured report with citations', icon: '📊' },
      ],
    },
  ]
  const ex = examples[active]

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {examples.map((e, i) => (
          <motion.button key={e.title} onClick={() => setActive(i)} whileHover={{ scale: 1.03 }}
            style={{
              padding: '10px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              border: active === i ? `2px solid ${e.color}` : '2px solid var(--border)',
              background: active === i ? `${e.color}15` : 'var(--bg-secondary)',
              color: active === i ? e.color : 'var(--text-secondary)', transition: 'all 0.2s',
            }}>
            {e.icon} {e.title}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ background: ex.bg, borderRadius: 18, padding: 28, border: `1px solid ${ex.color}33` }}>
          {ex.flow.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
              style={{
                display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: i < ex.flow.length - 1 ? 16 : 0,
                padding: 16, background: 'rgba(255,255,255,0.6)', borderRadius: 14,
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: `${ex.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: ex.color, marginBottom: 2 }}>
                  Step {i + 1}: {f.step}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.detail}</div>
              </div>
              {i < ex.flow.length - 1 && (
                <div style={{ position: 'absolute', right: 'auto' }} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Interactive: Agent Decision Tree ---- */
function AgentDecisionTree() {
  const [step, setStep] = useState(0)

  const tree = [
    {
      situation: 'User asks: "Book me a flight from NYC to London next Friday under $500"',
      thinking: 'This requires multiple steps: search flights, filter by price, and book.',
      options: [
        { label: 'Search for flights', correct: true },
        { label: 'Respond with generic flight info', correct: false },
      ],
      correctExplanation: 'The agent correctly decides to use a flight search tool first.',
    },
    {
      situation: 'Flight search returns 15 results. Prices range from $380 to $1,200.',
      thinking: 'I need to filter results under $500 as the user requested.',
      options: [
        { label: 'Filter: price < $500, sort by rating', correct: true },
        { label: 'Show all 15 results to the user', correct: false },
      ],
      correctExplanation: 'Good agents filter and prioritize, not dump raw data on users.',
    },
    {
      situation: '3 flights match: Delta $420, BA $480, United $395. All have available seats.',
      thinking: 'I should present the best options and ask which one to book.',
      options: [
        { label: 'Present top 3 options with pros/cons', correct: true },
        { label: 'Auto-book the cheapest without asking', correct: false },
      ],
      correctExplanation: 'The agent knows booking requires user confirmation -- human-in-the-loop for important decisions!',
    },
    {
      situation: 'User picks Delta $420. Agent calls booking API.',
      thinking: 'Booking confirmed! I should provide the confirmation details and next steps.',
      options: [
        { label: 'Share confirmation + offer to set a reminder', correct: true },
        { label: 'Just say "Done"', correct: false },
      ],
      correctExplanation: 'Great agents are proactive: confirmation details, reminders, and follow-up actions.',
    },
  ]

  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const current = tree[step]

  const handleSelect = (idx) => {
    setSelected(idx)
    setShowResult(true)
  }

  const nextStep = () => {
    if (step < tree.length - 1) {
      setStep(step + 1)
      setSelected(null)
      setShowResult(false)
    }
  }

  const reset = () => {
    setStep(0)
    setSelected(null)
    setShowResult(false)
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
        {tree.map((_, i) => (
          <div key={i} style={{
            width: 40, height: 6, borderRadius: 3,
            background: i <= step ? '#4f46e5' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Situation */}
      <div style={{ padding: 20, background: '#4f46e508', borderRadius: 14, border: '1px solid #4f46e522', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Step {step + 1} of {tree.length}
        </div>
        <div style={{ fontSize: 17, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6 }}>{current.situation}</div>
      </div>

      {/* Agent thinking */}
      <div style={{ padding: 16, background: '#8b5cf608', borderRadius: 12, border: '1px solid #8b5cf622', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>AGENT THINKING:</div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{current.thinking}"</div>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
        {current.options.map((opt, i) => {
          let bg = 'var(--bg-card)'
          let border = 'var(--border)'
          let color = 'var(--text-primary)'
          if (showResult && opt.correct) { bg = '#d1fae5'; border = '#10b981'; color = '#065f46' }
          else if (showResult && selected === i && !opt.correct) { bg = '#fee2e2'; border = '#ef4444'; color = '#991b1b' }

          return (
            <motion.button key={i} onClick={() => !showResult && handleSelect(i)}
              whileHover={!showResult ? { scale: 1.03, y: -3 } : {}}
              whileTap={!showResult ? { scale: 0.97 } : {}}
              style={{
                padding: '16px 20px', borderRadius: 14, border: `2px solid ${border}`,
                background: bg, color, fontSize: 16, fontWeight: 600, cursor: showResult ? 'default' : 'pointer',
                textAlign: 'center',
              }}
            >
              {opt.label}
            </motion.button>
          )
        })}
      </div>

      {/* Result */}
      {showResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{
            padding: 18, borderRadius: 12, marginBottom: 16,
            background: current.options[selected]?.correct ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${current.options[selected]?.correct ? '#bbf7d0' : '#fecaca'}`,
          }}>
            <div style={{
              fontSize: 15, fontWeight: 700, marginBottom: 6,
              color: current.options[selected]?.correct ? '#065f46' : '#991b1b',
            }}>
              {current.options[selected]?.correct ? 'Correct!' : 'Not the best choice.'}
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{current.correctExplanation}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            {step < tree.length - 1 ? (
              <button onClick={nextStep}
                style={{ padding: '12px 28px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>
                Continue →
              </button>
            ) : (
              <div>
                <p style={{ fontSize: 17, color: '#065f46', fontWeight: 700, marginBottom: 12 }}>
                  Mission complete! The agent successfully booked a flight through 4 reasoning steps.
                </p>
                <button onClick={reset}
                  style={{ padding: '12px 28px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic14_Agents() {
  return (
    <div>
      {/* Neuron Welcome */}
      <div style={{ marginBottom: 40 }}>
        <Neuron mood="excited" size="large" typed
          message="What if an LLM could not just talk, but actually DO things? Book flights, write code, search the web, send emails? That's AI Agents -- LLMs with superpowers. They can think, plan, use tools, and take action in the real world. Let me show you how!"
        />
      </div>

      {/* What is an Agent */}
      <SectionBlock icon="🤖" title="What is an AI Agent?" color="#4f46e5">
        <Neuron mood="explaining" size="small"
          message="A regular LLM is like a brain in a jar -- smart, but it can't DO anything. An AI Agent is that brain connected to hands, eyes, and tools. It can think, then act on its thoughts."
        />

        <div style={{ marginTop: 28 }}>
          <AgentDiagram />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 32 }}>
          {[
            { label: 'Regular LLM', items: ['Answers questions', 'Generates text', 'No real-world actions', 'No memory between chats'], color: '#94a3b8', icon: '🧠' },
            { label: 'AI Agent', items: ['Answers questions', 'Generates text', 'Calls APIs & tools', 'Remembers context', 'Plans multi-step tasks', 'Takes real actions'], color: '#4f46e5', icon: '🤖' },
          ].map(col => (
            <div key={col.label} style={{ padding: 22, background: `${col.color}08`, borderRadius: 16, border: `1px solid ${col.color}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>{col.icon}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: col.color }}>{col.label}</span>
              </div>
              {col.items.map(item => (
                <div key={item} style={{ padding: '6px 0', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: col.color }}>+</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>

        <NeuronTip type="simple">
          <strong>Think of it like a chef vs a recipe book.</strong> A regular LLM is the recipe book -- it knows how to cook everything, but it can't actually cook. An AI Agent is the chef who reads the recipe, grabs ingredients, chops vegetables, and serves the dish.
        </NeuronTip>
      </SectionBlock>

      {/* Agent Loop */}
      <SectionBlock icon="🔄" title="The Agent Loop: Think, Act, Observe, Repeat" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          Every AI agent follows the same core loop. It keeps going until the task is done. Click through each step:
        </p>
        <AgentLoop />
      </SectionBlock>

      {/* Tool Use */}
      <SectionBlock icon="🔧" title="How Tool Use Works" color="#0ea5e9">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
          When an LLM needs information it does not have (real-time data, calculations, private data), it can <strong>call a tool</strong>. Here is the complete flow:
        </p>
        <ToolUseFlow />

        <NeuronTip type="deep">
          Under the hood, tool use works via <strong>structured output</strong>. The LLM generates a JSON object like <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{"{"}"tool": "weather", "args": {"{"}"city": "Tokyo"{"}"}{"}"}  </code> instead of plain text. The system intercepts this, calls the real API, and feeds the result back.
        </NeuronTip>
      </SectionBlock>

      {/* Be the Agent Interactive */}
      <InteractiveDemo title="Be The Agent" instruction="You are an AI agent. A user asks a question -- pick the right tool to solve it!">
        <BeTheAgent />
      </InteractiveDemo>

      {/* Types of Agents */}
      <SectionBlock icon="📋" title="Types of AI Agents" color="#10b981">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
          Not all agents are the same. Different architectures suit different tasks. Explore each type:
        </p>
        <AgentTypesCards />
      </SectionBlock>

      {/* Agent Frameworks */}
      <SectionBlock icon="🏗️" title="Real Agent Frameworks" color="#f97316">
        <Neuron mood="explaining" size="small"
          message="You don't have to build agents from scratch. These frameworks handle the hard parts -- tool routing, memory management, error recovery -- so you can focus on what your agent should do."
        />
        <div style={{ marginTop: 24 }}>
          <AgentFrameworks />
        </div>
      </SectionBlock>

      {/* Memory Systems */}
      <SectionBlock icon="💾" title="Agent Memory Systems" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
          For an agent to be truly useful, it needs memory. Without memory, every conversation starts from zero. Here are the three types:
        </p>
        <MemorySystems />

        <NeuronTip type="example">
          <strong>Why memory matters:</strong> Imagine asking a customer support agent about your order, then saying "What about the other order?" Without memory, it would not know you are the same customer, let alone which "other order" you mean.
        </NeuronTip>
      </SectionBlock>

      {/* Real Agent Examples */}
      <SectionBlock icon="🌍" title="Real-World Agent Examples" color="#0ea5e9">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
          AI agents are already working in production. Here are three common patterns:
        </p>
        <RealAgentExamples />
      </SectionBlock>

      {/* Agent Decision Tree */}
      <InteractiveDemo title="Agent Decision Tree" instruction="Step through an agent's reasoning as it handles a complex multi-step task: booking a flight.">
        <AgentDecisionTree />
      </InteractiveDemo>

      {/* Warnings and Tips */}
      <SectionBlock icon="⚠️" title="Risks & Best Practices" color="#ef4444">
        <NeuronTip type="warning">
          <strong>Planning failures:</strong> Agents can get stuck in loops, take wrong paths, or waste resources on dead ends. Good agent design includes maximum iteration limits, fallback strategies, and clear goal definitions.
        </NeuronTip>

        <NeuronTip type="warning">
          <strong>Hallucination is amplified:</strong> When an LLM hallucinates text, it is wrong. When an agent hallucinates a tool call, it might send a real email, delete real data, or spend real money. Always validate critical actions.
        </NeuronTip>

        <NeuronTip type="tip">
          <strong>Human-in-the-loop:</strong> The best agent systems ask for human confirmation before irreversible actions (sending emails, making purchases, deploying code). This is not a limitation -- it is a feature.
        </NeuronTip>

        <NeuronTip type="fun">
          <strong>The "Paperclip Problem":</strong> In AI safety, there is a famous thought experiment about an AI tasked with making paperclips that converts all matter into paperclips. Modern agent guardrails exist to prevent agents from going "off the rails" in similar ways.
        </NeuronTip>
      </SectionBlock>

      {/* Key Takeaways */}
      <SectionBlock icon="🎯" title="Key Takeaways" color="#10b981">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {[
            { num: '01', text: 'AI Agents are LLMs enhanced with tools, memory, and planning -- they can take real actions, not just generate text.', color: '#4f46e5' },
            { num: '02', text: 'The agent loop (Think, Act, Observe, Repeat) is the core pattern behind every agent system.', color: '#0ea5e9' },
            { num: '03', text: 'Tool use lets agents call APIs, run code, search the web, and access databases for real-time information.', color: '#10b981' },
            { num: '04', text: 'Safety is critical: agents need guardrails, human oversight, and clear boundaries to operate reliably.', color: '#f97316' },
          ].map(item => (
            <motion.div key={item.num} whileHover={{ y: -4 }}
              style={{ padding: 28, background: `${item.color}08`, borderRadius: 18, border: `1px solid ${item.color}22` }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 900, color: `${item.color}25`, marginBottom: 10 }}>{item.num}</div>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Closing */}
      <div style={{ marginTop: 24 }}>
        <Neuron mood="happy" size="large"
          message="Amazing work! You now understand AI Agents -- the next frontier of AI. From customer support to coding to research, agents are transforming how we work with AI. The future is not just AI that talks, but AI that acts. Ready to test your knowledge?"
        />
      </div>
    </div>
  )
}
