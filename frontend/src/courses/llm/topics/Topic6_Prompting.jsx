import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSequence from '../../../components/AnimatedSequence'

const promptFrames = [
  {
    title: 'Step 1: You Write a Prompt',
    color: '#4f46e5',
    visual: (
      <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 16 }}>
        <div style={{ padding: 16, background: 'rgba(79,70,229,0.15)', borderRadius: 12, display: 'inline-block' }}>
          "Write a poem about space"
        </div>
      </div>
    ),
    caption: 'Your prompt is the instruction that tells the LLM what you want.',
  },
  {
    title: 'Step 2: LLM Processes It',
    color: '#0ea5e9',
    visual: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
        <div style={{ fontSize: 32 }}>📝</div>
        <div style={{ fontSize: 24, color: '#0ea5e9' }}>→</div>
        <div style={{ fontSize: 32 }}>🧠</div>
        <div style={{ fontSize: 24, color: '#0ea5e9' }}>→</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['token', 'by', 'token', '...'].map((t, i) => (
            <span key={i} style={{ padding: '4px 8px', background: 'rgba(14,165,233,0.2)', borderRadius: 6, fontSize: 13, color: '#10b981' }}>{t}</span>
          ))}
        </div>
      </div>
    ),
    caption: 'The model tokenizes your input, runs it through attention layers, and generates one token at a time.',
  },
  {
    title: 'Step 3: Better Prompts = Better Results',
    color: '#10b981',
    visual: (
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 6, fontWeight: 600 }}>VAGUE</div>
          <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 10, fontSize: 13, maxWidth: 150 }}>
            "Write something"
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#a0a0b8' }}>→ Generic output</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#10b981', marginBottom: 6, fontWeight: 600 }}>SPECIFIC</div>
          <div style={{ padding: 12, background: 'rgba(16,185,129,0.1)', borderRadius: 10, fontSize: 13, maxWidth: 150 }}>
            "Write a haiku about Mars for kids"
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#a0a0b8' }}>→ Focused, great output</div>
        </div>
      </div>
    ),
    caption: 'The more specific your prompt, the better the LLM can serve you.',
  },
]

const techniques = [
  { id: 'zero', title: 'Zero-Shot', color: '#4f46e5', quality: 70,
    prompt: 'Classify this review as positive or negative:\n"This movie was amazing!"',
    response: 'Positive', desc: 'Just ask directly — no examples needed.' },
  { id: 'few', title: 'Few-Shot', color: '#0ea5e9', quality: 88,
    prompt: '"Great film!" → Positive\n"Terrible acting" → Negative\n"This movie was amazing!" →',
    response: 'Positive', desc: 'Show a few examples first, then ask.' },
  { id: 'cot', title: 'Chain of Thought', color: '#f59e0b', quality: 95,
    prompt: 'Classify this review. Think step by step:\n"This movie was amazing!"',
    response: '"Amazing" is strongly positive. No negatives → Positive', desc: 'Ask the model to reason through it.' },
  { id: 'role', title: 'Role Prompting', color: '#ec4899', quality: 92,
    prompt: 'You are an expert film critic.\nClassify: "This movie was amazing!"',
    response: 'The superlative "amazing" clearly indicates a Positive review.', desc: 'Give the model a persona.' },
]

const goodBad = [
  { bad: 'Tell me about dogs', good: 'List 5 behavioral traits of Golden Retrievers with one example each', tip: 'Specific > vague' },
  { bad: 'Write code', good: 'Write a Python function that returns the top 3 largest numbers from a list', tip: 'Include language, input, output' },
  { bad: 'Summarize this', good: 'Summarize in 3 bullet points for a non-technical audience', tip: 'Specify format, length, audience' },
]

export default function Topic6_Prompting() {
  const [active, setActive] = useState('zero')
  const t = techniques.find((x) => x.id === active)

  return (
    <div>
      {/* Animated explainer */}
      <div style={{ marginBottom: 32 }}>
        <AnimatedSequence frames={promptFrames} interval={4500} />
      </div>

      {/* Technique comparison */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
          Prompting Techniques — Compare
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {techniques.map((tc) => (
            <motion.button key={tc.id} onClick={() => setActive(tc.id)} whileHover={{ scale: 1.03 }}
              style={{
                padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                border: active === tc.id ? `2px solid ${tc.color}` : '2px solid var(--border)',
                background: active === tc.id ? `${tc.color}20` : 'var(--bg-secondary)',
                color: active === tc.id ? tc.color : 'var(--text-secondary)', transition: 'all 0.2s',
              }}>
              {tc.title}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{t.desc}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Prompt</div>
                <div style={{
                  padding: 16, background: 'var(--bg-secondary)', borderRadius: 12,
                  fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap',
                  borderLeft: `3px solid ${t.color}`,
                }}>{t.prompt}</div>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Response</div>
                <div style={{
                  padding: 16, background: `${t.color}10`, borderRadius: 12, fontSize: 14, lineHeight: 1.7,
                  borderLeft: `3px solid ${t.color}44`,
                }}>{t.response}</div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quality:</span>
              <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${t.quality}%` }} transition={{ duration: 0.5 }}
                  style={{ height: '100%', background: t.color, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.color }}>{t.quality}%</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Good vs Bad */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
          Good vs Bad Prompts
        </div>

        {goodBad.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginBottom: 6 }}>❌ BAD</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)', padding: 10, background: 'rgba(239,68,68,0.06)', borderRadius: 8 }}>
                  {item.bad}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginBottom: 6 }}>✅ GOOD</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', padding: 10, background: 'rgba(16,185,129,0.06)', borderRadius: 8 }}>
                  {item.good}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--accent-light)', paddingLeft: 8, borderLeft: '2px solid var(--accent)' }}>
              💡 {item.tip}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
