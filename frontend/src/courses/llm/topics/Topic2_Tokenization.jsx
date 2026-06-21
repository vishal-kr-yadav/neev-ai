import { useState } from 'react'
import { motion } from 'framer-motion'
import TokenBlocksScene from '../../../components/three/TokenBlocksScene'
import HindiExplainer from '../../../components/HindiExplainer'

const tokenColors = [
  '#4f46e5', '#0ea5e9', '#ec4899', '#f59e0b', '#10b981',
  '#818cf8', '#e17055', '#74b9ff', '#ff7675', '#81ecec',
]

function tokenize(text) {
  const words = text.split(/(\s+)/)
  const tokens = []
  for (const word of words) {
    if (/^\s+$/.test(word)) continue
    if (word.length > 6) {
      const mid = Math.ceil(word.length * 0.6)
      tokens.push(word.slice(0, mid))
      tokens.push(word.slice(mid))
    } else {
      tokens.push(word)
    }
  }
  return tokens
}

export default function Topic2_Tokenization() {
  const [input, setInput] = useState('Hello, how are you doing today?')
  const tokens = tokenize(input)

  return (
    <div>
      {/* 3D Token Blocks */}
      <div style={{ marginBottom: 32 }}>
        <TokenBlocksScene />
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          🖱️ Drag to orbit. Each 3D block is a token — the building blocks an LLM reads.
        </p>
      </div>

      <HindiExplainer
        concept="टोकनाइज़ेशन"
        english="Tokenization"
        explanation="AI को सीधे शब्द नहीं समझ आते — पहले हर शब्द को छोटे टुकड़ों (tokens) में तोड़ना पड़ता है। 'understanding' = 'under' + 'stand' + 'ing' जैसे। हर token का एक number होता है।"
        example="जैसे Lego blocks से कोई भी shape बना सकते हैं — tokens भी भाषा के Lego blocks हैं! 'खुशी' = 'खु' + 'शी' — AI इन्हीं blocks को जोड़-तोड़कर भाषा समझता है।"
        terms={[
          { hindi: 'टोकन', english: 'Token', meaning: 'शब्द का छोटा टुकड़ा — AI की भाषा की इकाई' },
          { hindi: 'शब्दकोश', english: 'Vocabulary', meaning: 'AI को जितने tokens पता हैं — usually 50,000+' },
          { hindi: 'एन्कोडिंग', english: 'Encoding', meaning: 'text को numbers में बदलना' },
        ]}
      />

      {/* Analogy: language as lego */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧱</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Language is made of building blocks
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 500, margin: '0 auto 24px' }}>
          Just like LEGO bricks build structures, tokens build sentences. An LLM can't read letters — it reads tokens.
        </p>

        {/* Visual: sentence breaking apart */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: 32,
          display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2 }}>
            You see
          </div>
          <div style={{ fontSize: 20, color: 'var(--text-primary)', fontWeight: 500 }}>
            "Transformers are amazing"
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            style={{ width: 60, height: 2, background: 'var(--accent)', borderRadius: 2 }}
          />

          <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2 }}>
            LLM sees
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Trans', 'formers', 'are', 'amaz', 'ing'].map((tok, i) => (
              <motion.div
                key={tok}
                initial={{ opacity: 0, y: 20, rotate: -5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{
                  padding: '10px 16px',
                  background: `${tokenColors[i]}22`,
                  border: `2px solid ${tokenColors[i]}44`,
                  borderRadius: 10,
                  fontSize: 16,
                  fontFamily: 'monospace',
                  color: tokenColors[i],
                  fontWeight: 600,
                }}
              >
                {tok}
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  token #{i}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How BPE works - step by step */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
          How Tokenization Works (BPE)
        </div>

        {[
          { step: 1, title: 'Start with characters', vis: 'H · e · l · l · o · , ·   · w · o · r · l · d', color: '#ec4899' },
          { step: 2, title: 'Find common pairs', vis: '"l" + "l" → "ll"  |  "o" + "r" → "or"', color: '#f59e0b' },
          { step: 3, title: 'Merge repeatedly', vis: '"He" + "llo" → "Hello"  |  "wor" + "ld" → "world"', color: '#0ea5e9' },
          { step: 4, title: 'Final tokens', vis: '[ Hello ] [ , ] [   ] [ world ]', color: '#10b981' },
        ].map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            style={{
              display: 'flex', gap: 16, alignItems: 'center', padding: 20,
              background: 'var(--bg-secondary)', borderRadius: 14,
              borderLeft: `3px solid ${s.color}`, marginBottom: 10,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `${s.color}22`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: s.color, fontWeight: 700, fontSize: 14,
            }}>
              {s.step}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: s.color }}>{s.vis}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live tokenizer */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
          Try It Yourself
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { l: 'Simple', t: 'The cat sat on the mat' },
            { l: 'Technical', t: 'Transformers use self-attention mechanisms' },
            { l: 'Code', t: 'function hello() { return "world" }' },
          ].map((ex) => (
            <button
              key={ex.l}
              onClick={() => setInput(ex.t)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                border: input === ex.t ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: input === ex.t ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                color: input === ex.t ? 'var(--accent-light)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {ex.l}
            </button>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          style={{
            width: '100%', padding: 16, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)',
            fontSize: 16, resize: 'none', fontFamily: 'var(--font-sans)', outline: 'none',
          }}
          placeholder="Type something..."
        />

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Result:</span>
          <span style={{
            padding: '3px 10px', background: 'rgba(79,70,229,0.15)',
            borderRadius: 12, fontSize: 12, color: '#818cf8', fontWeight: 600,
          }}>
            {tokens.length} tokens
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tokens.map((tok, i) => (
            <motion.div
              key={`${tok}-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring' }}
              style={{
                padding: '8px 14px', background: `${tokenColors[i % tokenColors.length]}22`,
                border: `1px solid ${tokenColors[i % tokenColors.length]}44`,
                borderRadius: 8, fontSize: 14, fontFamily: 'monospace',
                color: tokenColors[i % tokenColors.length], position: 'relative',
              }}
            >
              {tok}
              <span style={{
                position: 'absolute', top: -7, right: -4, fontSize: 9,
                background: 'var(--bg-card)', padding: '1px 5px', borderRadius: 4,
                color: 'var(--text-muted)',
              }}>
                {i}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
