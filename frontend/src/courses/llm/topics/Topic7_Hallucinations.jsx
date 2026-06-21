import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedSequence from '../../../components/AnimatedSequence'
import HindiExplainer from '../../../components/HindiExplainer'

const halluFrames = [
  {
    title: 'What is a Hallucination?',
    color: '#ec4899',
    visual: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤖💭</div>
        <div style={{ fontFamily: 'monospace', fontSize: 15 }}>
          <span style={{ color: '#a0a0b8' }}>"The inventor of WiFi was </span>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>Dr. Sarah McWireless in 1987</span>
          <span style={{ color: '#a0a0b8' }}>"</span>
        </div>
        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>← Completely made up! But sounds convincing.</div>
      </div>
    ),
    caption: 'A hallucination is when an LLM generates false information with confidence.',
  },
  {
    title: 'Why Does This Happen?',
    color: '#f59e0b',
    visual: (
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: 16, background: 'rgba(245,158,11,0.1)', borderRadius: 14 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎲</div>
          <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Probabilistic</div>
          <div style={{ fontSize: 11, color: '#a0a0b8' }}>Picks likely tokens</div>
        </div>
        <div style={{ fontSize: 20, color: '#a0a0b8' }}>+</div>
        <div style={{ textAlign: 'center', padding: 16, background: 'rgba(245,158,11,0.1)', borderRadius: 14 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🕳️</div>
          <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Knowledge gaps</div>
          <div style={{ fontSize: 11, color: '#a0a0b8' }}>Fills in blanks</div>
        </div>
        <div style={{ fontSize: 20, color: '#a0a0b8' }}>=</div>
        <div style={{ textAlign: 'center', padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 14 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🤥</div>
          <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Hallucination</div>
          <div style={{ fontSize: 11, color: '#a0a0b8' }}>Confident nonsense</div>
        </div>
      </div>
    ),
    caption: 'LLMs predict statistically likely text. When they lack knowledge, they plausibly fill in gaps.',
  },
  {
    title: 'How to Protect Yourself',
    color: '#10b981',
    visual: (
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { icon: '🔍', label: 'Verify claims' },
          { icon: '📎', label: 'Ask for sources' },
          { icon: '🔄', label: 'Cross-reference' },
          { icon: '🧪', label: 'Test outputs' },
        ].map((i) => (
          <div key={i.label} style={{ textAlign: 'center', padding: 14, background: 'rgba(16,185,129,0.1)', borderRadius: 12, minWidth: 90 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{i.icon}</div>
            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>{i.label}</div>
          </div>
        ))}
      </div>
    ),
    caption: 'Always verify important facts. Use LLMs as a starting point, not the final answer.',
  },
]

const myths = [
  { myth: 'LLMs understand what they say', reality: 'They predict likely next tokens — no true understanding', icon: '🧠' },
  { myth: 'LLMs always tell the truth', reality: 'They can confidently generate false info (hallucinations)', icon: '🤥' },
  { myth: 'Bigger = always better', reality: 'Smaller models can outperform larger ones on specific tasks', icon: '📏' },
  { myth: 'LLMs have real-time knowledge', reality: 'They only know their training data (knowledge cutoff)', icon: '📅' },
]

export default function Topic7_Hallucinations() {
  const [revealed, setRevealed] = useState(new Set())

  const toggle = (i) => {
    setRevealed((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }

  return (
    <div>
      {/* Animated explainer */}
      <div style={{ marginBottom: 32 }}>
        <AnimatedSequence frames={halluFrames} interval={5000} />
      </div>

      <HindiExplainer
        concept="हैलुसिनेशन — AI का झूठ"
        english="Hallucinations"
        explanation="कभी-कभी AI बड़े confidence से ग़लत बात बोल देता है — ये hallucination है। AI को नहीं पता कि वो सच बोल रहा है या झूठ — वो बस 'अगला शब्द predict' कर रहा है जो सही लगता है।"
        example="AI से पूछो 'Dr. Sharma की किताब का नाम बताओ' — AI एक किताब का नाम बना देगा जो exist ही नहीं करती! जैसे कोई student exam में answer नहीं आता तो confident face के साथ कुछ भी लिख देता है — AI भी ऐसा ही करता है 😄"
        terms={[
          { hindi: 'हैलुसिनेशन', english: 'Hallucination', meaning: 'AI का confident तरीके से ग़लत बात बोलना' },
          { hindi: 'ग्राउंडिंग', english: 'Grounding', meaning: 'AI को real data से जोड़ना ताकि झूठ कम बोले' },
          { hindi: 'फ़ैक्ट-चेकिंग', english: 'Fact-checking', meaning: 'AI के जवाब की सच्चाई जाँचना — ज़रूरी है!' },
        ]}
      />

      {/* Visual: confidence vs accuracy */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Confident ≠ <span style={{ color: '#ef4444' }}>Correct</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 500, margin: '0 auto 24px' }}>
          An LLM can say "The capital of Molvania is Lutenblag" with 100% confidence — but Molvania is fictional.
        </p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ padding: 20, background: 'rgba(239,68,68,0.1)', borderRadius: 14, minWidth: 200 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>😊</div>
            <div style={{ fontWeight: 600, color: '#ef4444' }}>High Confidence</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sounds sure of itself</div>
          </div>
          <div style={{ fontSize: 24, color: 'var(--text-muted)', alignSelf: 'center' }}>≠</div>
          <div style={{ padding: 20, background: 'rgba(16,185,129,0.1)', borderRadius: 14, minWidth: 200 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 600, color: '#10b981' }}>Factual Accuracy</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Actually true</div>
          </div>
        </div>
      </div>

      {/* Myth buster flip cards */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
          Myth Busters — Click to Flip
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {myths.map((m, i) => {
            const isR = revealed.has(i)
            return (
              <motion.div key={i} onClick={() => toggle(i)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: 20, borderRadius: 14, cursor: 'pointer', minHeight: 140,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center',
                  background: isR ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)',
                  border: isR ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                  transition: 'all 0.3s',
                }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{isR ? '✅' : m.icon}</div>
                {!isR ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>"{m.myth}"</div>
                    <div style={{ fontSize: 12, color: 'var(--accent-light)', marginTop: 6 }}>Click to bust</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: '#ef4444', textDecoration: 'line-through', marginBottom: 6 }}>{m.myth}</div>
                    <div style={{ fontSize: 14, color: '#10b981', fontWeight: 500 }}>{m.reality}</div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Strategies */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { title: 'Verify Facts', icon: '🔍', desc: 'Cross-check important claims', color: '#4f46e5' },
          { title: 'Ask for Sources', icon: '📎', desc: 'Request citations', color: '#0ea5e9' },
          { title: 'Use RAG', icon: '📚', desc: 'Ground in real documents', color: '#f59e0b' },
        ].map((s) => (
          <motion.div key={s.title} whileHover={{ y: -6 }} style={{
            flex: '1 1 160px', padding: 24, background: 'var(--bg-card)',
            borderRadius: 16, textAlign: 'center', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: s.color, marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
