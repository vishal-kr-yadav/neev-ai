import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import NeuralNetworkScene from '../../../components/three/NeuralNetworkScene'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 1 — What is an LLM?
================================================================ */

/* ---- Interactive: Next-Word Predictor ---- */
function NextWordPredictor() {
  const sentences = [
    { text: 'The cat sat on the', options: ['mat', 'car', 'cloud', 'piano'], answer: 'mat', probs: [72, 15, 8, 5] },
    { text: 'I went to the store to buy', options: ['groceries', 'a dragon', 'silence', 'the moon'], answer: 'groceries', probs: [65, 2, 1, 0] },
    { text: 'Good morning! How are', options: ['you', 'purple', 'tables', 'flying'], answer: 'you', probs: [88, 0, 0, 1] },
    { text: 'She opened her laptop to check', options: ['her email', 'the volcano', 'a rhino', 'the ocean'], answer: 'her email', probs: [74, 1, 0, 2] },
  ]
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const s = sentences[idx]

  const handleSelect = (word) => { setSelected(word); setShowResult(true) }
  const handleNext = () => { setIdx((idx + 1) % sentences.length); setSelected(null); setShowResult(false) }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, textAlign: 'center' }}>
        "{s.text} <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: 'var(--accent)' }}>___</motion.span>"
      </div>
      <p style={{ textAlign: 'center', fontSize: 16, color: 'var(--text-muted)', marginBottom: 24 }}>
        Which word would an LLM most likely predict next?
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
        {s.options.map((word, i) => {
          const isCorrect = word === s.answer
          const isSelected = word === selected
          let bg = 'var(--bg-card)', border = 'var(--border)', color = 'var(--text-primary)'
          if (showResult && isCorrect) { bg = '#d1fae5'; border = '#10b981'; color = '#065f46' }
          else if (showResult && isSelected && !isCorrect) { bg = '#fee2e2'; border = '#ef4444'; color = '#991b1b' }
          return (
            <motion.button key={word} onClick={() => !showResult && handleSelect(word)}
              whileHover={!showResult ? { scale: 1.05, y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
              style={{ padding: '16px 20px', borderRadius: 16, border: `2px solid ${border}`, background: bg, color, fontSize: 18, fontWeight: 600, cursor: showResult ? 'default' : 'pointer', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>
              {word}
              {showResult && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{s.probs[i]}% likely</div>}
            </motion.button>
          )
        })}
      </div>
      {showResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 17, color: selected === s.answer ? '#065f46' : '#991b1b', fontWeight: 600, marginBottom: 10 }}>
            {selected === s.answer ? '✓ Correct! The LLM picks the statistically most likely word.' : `✗ The LLM would pick "${s.answer}" — learned from billions of texts.`}
          </p>
          <button onClick={handleNext} style={{ padding: '12px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>
            Try Another →
          </button>
        </motion.div>
      )}
    </div>
  )
}

/* ---- Interactive: Sentence Builder ---- */
function SentenceBuilder() {
  const [words, setWords] = useState([])
  const wordOptions = {
    0: { label: 'Start', options: ['The', 'A', 'My', 'Our'] },
    1: { label: 'Subject', options: ['robot', 'teacher', 'cat', 'AI'] },
    2: { label: 'Action', options: ['learned', 'discovered', 'built', 'wrote'] },
    3: { label: 'Object', options: ['a poem', 'new patterns', 'a song', 'the answer'] },
    4: { label: 'Context', options: ['from data', 'from books', 'by trying', 'overnight'] },
  }
  const step = words.length
  const addWord = (word) => setWords([...words, word])
  const reset = () => setWords([])

  return (
    <div>
      <div style={{ minHeight: 64, padding: '18px 24px', background: 'var(--bg-card)', borderRadius: 16, border: '2px dashed var(--border)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {words.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontSize: 17 }}>Your sentence will appear here...</span>
        ) : (
          words.map((w, i) => (
            <motion.span key={i} initial={{ opacity: 0, scale: 0.7, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300 }}
              style={{ padding: '8px 16px', background: 'var(--accent-lighter)', borderRadius: 10, fontSize: 18, fontWeight: 700, color: 'var(--accent-dark)' }}>
              {w}
            </motion.span>
          ))
        )}
        {step < 5 && <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: 'var(--accent)', fontSize: 20 }}>▌</motion.span>}
      </div>
      {step < 5 ? (
        <div>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
            Step {step + 1}/5 — Choose the {wordOptions[step].label.toLowerCase()}:
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {wordOptions[step].options.map(opt => (
              <motion.button key={opt} onClick={() => addWord(opt)}
                whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.94 }}
                style={{ padding: '12px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 16, fontWeight: 500, cursor: 'pointer', color: 'var(--text-primary)' }}>
                {opt}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: '#065f46', fontWeight: 700, marginBottom: 8 }}>
            🎉 You just did what an LLM does!
          </p>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20 }}>
            The difference? An LLM considers <strong>billions</strong> of possible words for each step, weighted by probability.
          </p>
          <button onClick={reset} style={{ padding: '12px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>
            Build Another ↻
          </button>
        </motion.div>
      )}
    </div>
  )
}

/* ---- Comparison: LLM vs Google vs Database ---- */
function ComparisonCards() {
  const [activeRow, setActiveRow] = useState(null)
  const rows = [
    {
      q: '"What is the capital of France?"',
      google: { icon: '🔍', answer: 'Shows links to Wikipedia pages about France', verdict: 'Finds existing info' },
      db: { icon: '🗄️', answer: 'Returns "Paris" from a stored facts table', verdict: 'Retrieves stored data' },
      llm: { icon: '🧠', answer: 'Generates: "The capital of France is Paris."', verdict: 'Creates a new sentence' },
      insight: 'LLMs generate new text — they don\'t just retrieve it.',
    },
    {
      q: '"Write me a poem about cats"',
      google: { icon: '🔍', answer: 'Shows existing cat poems from the internet', verdict: 'Finds existing content' },
      db: { icon: '🗄️', answer: 'Error — can\'t generate creative content', verdict: 'Can\'t create' },
      llm: { icon: '🧠', answer: 'Creates a brand new, unique poem', verdict: 'Original creation' },
      insight: 'LLMs are creative — they combine patterns into new content.',
    },
    {
      q: '"Explain quantum physics to a 5-year-old"',
      google: { icon: '🔍', answer: 'Shows articles that may or may not be simple', verdict: 'Hit or miss' },
      db: { icon: '🗄️', answer: 'Returns a pre-written definition if it exists', verdict: 'Fixed output' },
      llm: { icon: '🧠', answer: 'Adapts explanation: "Imagine tiny balls that can be in two places at once!"', verdict: 'Adapts to context' },
      insight: 'LLMs understand context and adjust their response.',
    },
  ]

  return (
    <div>
      {rows.map((row, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
          style={{ marginBottom: 18, borderRadius: 18, border: `2px solid ${activeRow === i ? 'var(--accent-light)' : 'var(--border)'}`, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onClick={() => setActiveRow(activeRow === i ? null : i)}>
          <div style={{ padding: '18px 24px', background: activeRow === i ? 'var(--accent-lighter)' : 'var(--bg-secondary)', fontWeight: 600, fontSize: 17, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💬 {row.q}</span>
            <motion.span animate={{ rotate: activeRow === i ? 180 : 0 }} style={{ fontSize: 14, color: 'var(--text-muted)' }}>▼</motion.span>
          </div>
          <AnimatePresence>
            {activeRow === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {[
                    { ...row.google, label: 'Google Search', bg: '#fff7ed', labelColor: '#9a3412' },
                    { ...row.db, label: 'Database', bg: '#fef2f2', labelColor: '#991b1b' },
                    { ...row.llm, label: 'LLM', bg: '#f0fdf4', labelColor: '#065f46' },
                  ].map(col => (
                    <motion.div key={col.label} initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                      style={{ padding: 18, background: col.bg, borderRadius: 14, fontSize: 15, lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 700, color: col.labelColor, marginBottom: 8, fontSize: 13, textTransform: 'uppercase' }}>
                        {col.icon} {col.label}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{col.answer}</div>
                      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: col.labelColor, opacity: 0.8 }}>{col.verdict}</div>
                    </motion.div>
                  ))}
                </div>
                <div style={{ padding: '14px 24px', background: '#eff6ff', fontSize: 15, color: '#1e40af', fontWeight: 600, borderTop: '1px solid #bfdbfe' }}>
                  💡 {row.insight}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

/* ---- Real-World Use Cases ---- */
function RealWorldUseCases() {
  const [active, setActive] = useState(0)
  const cases = [
    {
      icon: '💬', title: 'Chatbots', color: '#4f46e5', bg: '#ede9fe',
      story: 'When you ask ChatGPT "How do I cook pasta?", it doesn\'t search a recipe database. It generates a unique response by predicting the most helpful words based on patterns from millions of cooking conversations it learned during training.',
      flow: ['You type a question', 'LLM reads your words', 'Finds relevant patterns', 'Generates response word-by-word'],
    },
    {
      icon: '💻', title: 'Code Writing', color: '#0ea5e9', bg: '#e0f2fe',
      story: 'GitHub Copilot watches you type "// sort this list" and writes the actual sorting code. It learned coding patterns from millions of open-source repositories — understanding not just syntax, but intent.',
      flow: ['You describe what you want', 'LLM understands intent', 'Matches code patterns', 'Generates working code'],
    },
    {
      icon: '🌍', title: 'Translation', color: '#10b981', bg: '#d1fae5',
      story: 'Modern translators like DeepL don\'t swap words one-by-one. The LLM understands the full meaning of "It\'s raining cats and dogs" and translates the idiom correctly — because it learned meaning, not just vocabulary.',
      flow: ['Input text in language A', 'Understand full meaning', 'Map to language B patterns', 'Generate natural translation'],
    },
    {
      icon: '📝', title: 'Email & Content', color: '#f97316', bg: '#fff7ed',
      story: 'Gmail\'s "Help me write" takes your three bullet points and drafts a professional email. The LLM learned email etiquette, tone, and structure from billions of real emails.',
      flow: ['Give bullet points / topic', 'LLM picks appropriate tone', 'Drafts structured content', 'You review and send'],
    },
  ]
  const c = cases[active]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
        {cases.map((item, i) => (
          <motion.button key={i} onClick={() => setActive(i)} whileHover={{ y: -3 }}
            style={{ padding: '16px', borderRadius: 16, border: `2px solid ${active === i ? item.color : 'var(--border)'}`, background: active === i ? item.bg : 'var(--bg-card)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: active === i ? item.color : 'var(--text-secondary)' }}>{item.title}</div>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          style={{ background: c.bg, borderRadius: 20, padding: 32, border: `1px solid ${c.color}33` }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32 }}>{c.icon}</span> {c.title}
          </h3>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>{c.story}</p>
          {/* Animated flow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {c.flow.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  {step}
                </div>
                {i < c.flow.length - 1 && <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: c.color, fontWeight: 700, fontSize: 18 }}>→</motion.span>}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Scale Visualization ---- */
function ScaleVisualization() {
  const models = [
    { name: 'GPT-2', year: '2019', params: '1.5B', width: '5%', color: '#818cf8', desc: 'Short paragraphs' },
    { name: 'GPT-3', year: '2020', params: '175B', width: '25%', color: '#6366f1', desc: 'Essays & Q&A' },
    { name: 'PaLM', year: '2022', params: '540B', width: '45%', color: '#4f46e5', desc: 'Reasoning & explanation' },
    { name: 'GPT-4', year: '2023', params: '~1.7T', width: '72%', color: '#4338ca', desc: 'Passed the bar exam' },
    { name: 'Modern LLMs', year: '2024+', params: 'Trillions+', width: '100%', color: '#3730a3', desc: 'Near-human reasoning' },
  ]
  return (
    <div>
      {models.map((m, i) => (
        <motion.div key={m.name} initial={{ width: '0%', opacity: 0 }} whileInView={{ width: m.width, opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 1, delay: i * 0.15, type: 'spring' }}
          style={{ background: `${m.color}14`, borderLeft: `5px solid ${m.color}`, borderRadius: '0 16px 16px 0', padding: '16px 24px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 'fit-content' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              {m.name} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>({m.year})</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{m.desc}</div>
          </div>
          <div style={{ fontSize: 16, color: m.color, fontWeight: 800, fontFamily: 'var(--font-heading)', padding: '6px 14px', background: `${m.color}15`, borderRadius: 10 }}>
            {m.params}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic1_WhatIsLLM() {
  return (
    <div>
      {/* Neuron Welcome */}
      <div style={{ marginBottom: 40 }}>
        <Neuron mood="waving" size="large" typed
          message="Hey! 👋 I'm Neuron, your AI guide. Let me tell you a story: imagine you had a friend who read every book, website, and conversation ever written. You could ask them anything and they'd give you a smart answer. That's basically what an LLM is! Let me show you how..."
        />
      </div>

      <HindiExplainer
        concept="LLM क्या है?"
        english="What is a Large Language Model?"
        explanation="LLM एक बहुत बड़ा AI program है जो बहुत सारा text पढ़कर सीखता है कि भाषा कैसे काम करती है। ये अगला शब्द predict करता है — बस इतना ही! लेकिन इतने शब्द सीख लेता है कि लगता है ये 'सोच' रहा है।"
        example="जैसे आपके phone का keyboard अगला शब्द suggest करता है — 'Good' के बाद 'morning' suggest करता है। LLM भी बिल्कुल ऐसे ही काम करता है, बस लाखों गुना smart है!"
        terms={[
          { hindi: 'मॉडल', english: 'Model', meaning: 'AI का दिमाग — जिसमें सारी सीखी हुई knowledge है' },
          { hindi: 'पैरामीटर', english: 'Parameter', meaning: 'AI के दिमाग में छोटे-छोटे knobs — GPT-4 में 1.7 trillion हैं!' },
          { hindi: 'प्रेडिक्शन', english: 'Prediction', meaning: 'अगला शब्द क्या होगा — इसका अंदाज़ा लगाना' },
        ]}
      />

      {/* The Story: 3 Cards */}
      <SectionBlock icon="📖" title="The Story of an LLM in 3 Acts" color="#4f46e5">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
          {[
            { num: '1', emoji: '📚', title: 'It Reads Everything', desc: 'Billions of pages — books, Wikipedia, Reddit, code, emails, tweets. More text than any human could read in 10,000 lifetimes.', color: '#4f46e5' },
            { num: '2', emoji: '🧩', title: 'It Finds Patterns', desc: 'After each sentence, it plays a game: what word comes next? After trillions of guesses, it gets incredibly good at predicting language.', color: '#0ea5e9' },
            { num: '3', emoji: '✍️', title: 'It Generates Text', desc: 'When you ask a question, it predicts the best next word, then the next, then the next — building a full response piece by piece.', color: '#10b981' },
          ].map((card, i) => (
            <motion.div key={card.num} initial={{ opacity: 0, y: 20, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.15, type: 'spring' }}
              whileHover={{ y: -6, boxShadow: 'var(--shadow-md)' }}
              style={{ padding: 28, background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 48, fontWeight: 900, color: `${card.color}10`, fontFamily: 'var(--font-heading)' }}>{card.num}</div>
              <div style={{ fontSize: 40, marginBottom: 14 }}>{card.emoji}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, marginBottom: 10, color: card.color }}>{card.title}</div>
              <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{card.desc}</div>
            </motion.div>
          ))}
        </div>

        <NeuronTip type="simple">
          <strong>Phone autocomplete on steroids.</strong> When you type "I'm on my", your phone suggests "way". An LLM does the same thing, but for entire conversations, code, poems — because it learned from vastly more text.
        </NeuronTip>
      </SectionBlock>

      {/* 3D Neural Network */}
      <SectionBlock icon="🧠" title="Inside an LLM: The Neural Network" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          Under the hood, an LLM is a <strong>neural network</strong> — layers of mathematical "neurons" that pass signals to each other, just like your brain. Drag to rotate the 3D model below and watch data flow through the layers:
        </p>

        <NeuralNetworkScene />

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 14, padding: '12px 24px', background: 'var(--bg-secondary)', borderRadius: 12, fontSize: 15, color: 'var(--text-muted)' }}>
          🖱️ <strong>Drag to rotate</strong> — Watch data pulses flow from Input → Hidden → Output
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 24 }}>
          {[
            { color: '#818cf8', label: 'Input Layer', desc: 'Your text, converted to numbers' },
            { color: '#0ea5e9', label: 'Hidden Layers', desc: 'Finds patterns & meaning (hundreds of these!)' },
            { color: '#10b981', label: 'Output Layer', desc: 'Predicts the next most likely word' },
          ].map(layer => (
            <motion.div key={layer.label} whileHover={{ scale: 1.03 }}
              style={{ padding: 18, background: `${layer.color}10`, borderRadius: 14, borderLeft: `4px solid ${layer.color}`, fontSize: 15, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: layer.color, marginBottom: 4 }}>{layer.label}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{layer.desc}</div>
            </motion.div>
          ))}
        </div>

        <NeuronTip type="deep">
          GPT-4 has ~1.7 trillion parameters — each one a number fine-tuned during training. If each parameter were a grain of sand, they'd fill 6 Olympic swimming pools. These parameters encode everything the model "knows" about language.
        </NeuronTip>
      </SectionBlock>

      {/* Interactive: Predict the Next Word */}
      <InteractiveDemo title="Next-Word Prediction Game" instruction="This is the core of every LLM — predicting what comes next. Try it yourself!">
        <NextWordPredictor />
      </InteractiveDemo>

      {/* How it works: Step by step */}
      <SectionBlock icon="⚙️" title="How It Works: The 3-Stage Journey" color="#4f46e5">
        <Neuron mood="thinking" size="small"
          message="Every time you talk to ChatGPT or any LLM, three things happen behind the scenes. Let me walk you through each one."
        />
        <div style={{ marginTop: 28 }}>
          {[
            {
              num: 1, title: 'Training: Reading the Internet', icon: '📖', color: '#4f46e5',
              story: 'Before you ever talk to it, the LLM spends weeks reading the internet. For every sentence, it covers up a word and tries to guess it. Wrong? Adjust. Right? Reinforce. After trillions of guesses, it becomes eerily good at language.',
              kid: 'Imagine reading every book in every library, and after each page someone quizzes you. Eventually you can finish anyone\'s sentences!',
              tech: 'Uses backpropagation with gradient descent to minimize cross-entropy loss. GPT-3 training cost ~$4.6M in compute.',
            },
            {
              num: 2, title: 'Understanding Your Input', icon: '💬', color: '#0ea5e9',
              story: 'When you type a message, the LLM breaks your words into "tokens" (small pieces), converts them to numbers, and passes them through hundreds of neural network layers — each adding more understanding of what you mean.',
              kid: 'Like reading a sentence: first you see words, then you understand what the whole thing means.',
              tech: 'Tokenization (BPE) → embedding vectors (~12,288 dimensions) → transformer layers with multi-head self-attention.',
            },
            {
              num: 3, title: 'Generating the Response', icon: '✨', color: '#10b981',
              story: 'The LLM predicts one word at a time. After each word, it feeds it back in and predicts the next. Word by word, a full response emerges — like a writer who never looks back, only forward.',
              kid: 'Word dominoes — each word connects to the next, building a sentence piece by piece.',
              tech: 'Autoregressive generation with temperature/top-k sampling over ~100k vocabulary tokens.',
            },
          ].map(step => (
            <motion.div key={step.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: step.num * 0.1 }}
              style={{ display: 'flex', gap: 24, marginBottom: 28, padding: 28, background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${step.color}15`, color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)', flexShrink: 0 }}>
                {step.num}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{step.icon}</span> {step.title}
                </h3>
                <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 14 }}>{step.story}</p>
                <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 12, fontSize: 15, color: '#166534', lineHeight: 1.6, marginBottom: 10 }}>
                  🧒 <strong>Simple:</strong> {step.kid}
                </div>
                <div style={{ padding: 16, background: '#faf5ff', borderRadius: 12, fontSize: 15, color: '#6b21a8', lineHeight: 1.6 }}>
                  🔬 <strong>Technical:</strong> {step.tech}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Interactive: Build a Sentence */}
      <InteractiveDemo title="Build a Sentence Like an LLM" instruction="Pick each word to build a sentence — this is exactly how an LLM generates text, one word at a time!">
        <SentenceBuilder />
      </InteractiveDemo>

      {/* LLM vs Others */}
      <SectionBlock icon="⚖️" title="LLM vs Google vs Database" color="#f97316">
        <Neuron mood="explaining" size="small"
          message="People confuse these all the time. A Google search finds existing pages. A database returns stored data. An LLM writes you something new. Click each question below to see the difference!"
        />
        <div style={{ marginTop: 24 }}>
          <ComparisonCards />
        </div>
      </SectionBlock>

      {/* Real-World Use Cases */}
      <SectionBlock icon="🌍" title="Where You've Already Used an LLM" color="#0ea5e9">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          LLMs power tools you use every day — from autocomplete to translation. Tap each use case:
        </p>
        <RealWorldUseCases />
      </SectionBlock>

      <HindiExplainer
        concept="LLM इतना smart कैसे?"
        english="How LLMs Become Smart"
        explanation="LLM ने internet का लगभग सारा text पढ़ा है — Wikipedia, किताबें, websites, code सब कुछ। इतना पढ़ने के बाद उसे patterns समझ आ जाते हैं — grammar, facts, reasoning सब।"
        example="जैसे एक बच्चा जो 10,000 किताबें पढ़ ले — उसे भाषा, grammar, और दुनिया की बहुत सारी बातें automatically समझ आ जाएँगी। LLM ने करोड़ों pages पढ़े हैं!"
        terms={[
          { hindi: 'ट्रेनिंग डेटा', english: 'Training Data', meaning: 'वो text जिससे AI ने सीखा — internet जितना बड़ा' },
          { hindi: 'टोकन', english: 'Token', meaning: 'शब्द का टुकड़ा — AI इन्हीं में बात करता है' },
        ]}
      />

      {/* Scale */}
      <SectionBlock icon="📈" title="How Big Are Modern LLMs?" color="#8b5cf6">
        <Neuron mood="excited" size="small"
          message="LLMs have grown exponentially. In 5 years we went from 'writes okay paragraphs' to 'passes the bar exam'. Look at this growth:"
        />
        <div style={{ marginTop: 24 }}>
          <ScaleVisualization />
        </div>
        <NeuronTip type="example">
          <strong>How big is a trillion parameters?</strong> If each were a grain of sand, they'd fill 6 Olympic pools. The human brain has ~100 trillion synapses — so we're approaching brain-scale connections.
        </NeuronTip>
      </SectionBlock>

      {/* Key Takeaways */}
      <SectionBlock icon="🎯" title="Key Takeaways" color="#10b981">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {[
            { num: '01', text: 'An LLM is a neural network that predicts the next word — and this simple ability leads to remarkably intelligent behavior.', color: '#4f46e5' },
            { num: '02', text: 'It learns by reading billions of texts and discovering statistical patterns in language.', color: '#0ea5e9' },
            { num: '03', text: 'It generates text one word at a time, always picking the most likely next word.', color: '#10b981' },
            { num: '04', text: 'LLMs power chatbots, code assistants, translators, content creation — and they\'re getting better fast.', color: '#f97316' },
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
          message="Great job! 🎉 You now know what an LLM is, how it works, and where it's used. Ready to test your knowledge? Hit the quiz button below!"
        />
      </div>
    </div>
  )
}
