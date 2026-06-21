import { useState } from 'react'
import { motion } from 'framer-motion'
import AttentionBeamsScene from '../../../components/three/AttentionBeamsScene'
import HindiExplainer from '../../../components/HindiExplainer'

const sentence = ['The', 'cat', 'sat', 'on', 'the', 'mat']
const attentionMap = {
  The: [0.3, 0.5, 0.05, 0.05, 0.05, 0.05],
  cat: [0.15, 0.3, 0.3, 0.05, 0.05, 0.15],
  sat: [0.05, 0.35, 0.2, 0.15, 0.05, 0.2],
  on: [0.05, 0.1, 0.3, 0.2, 0.2, 0.15],
  the: [0.05, 0.05, 0.05, 0.15, 0.3, 0.4],
  mat: [0.05, 0.2, 0.2, 0.1, 0.25, 0.2],
}

export default function Topic4_Attention() {
  const [selectedWord, setSelectedWord] = useState('cat')
  const weights = attentionMap[selectedWord]

  return (
    <div>
      {/* 3D Attention Beams */}
      <div style={{ marginBottom: 32 }}>
        <AttentionBeamsScene />
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          🖱️ Orbit to see attention beams. Thicker/brighter beams = more attention. "cat" focuses most on "sat" and itself.
        </p>
      </div>

      <HindiExplainer
        concept="अटेंशन मैकेनिज़्म"
        english="Attention Mechanism"
        explanation="Attention AI को बताता है कि किस शब्द पर ज़्यादा ध्यान देना है। 'The cat sat on the mat because it was tired' — यहाँ 'it' किसकी बात कर रहा है? Attention समझता है कि 'it' = 'cat'।"
        example="जैसे class में teacher बोल रहे हैं और आप important points पर ज़्यादा ध्यान देते हैं, बाकी background noise ignore करते हैं — Attention भी ऐसे ही काम करता है। हर शब्द को decide करता है कि किन शब्दों पर focus करना है।"
        terms={[
          { hindi: 'सेल्फ़-अटेंशन', english: 'Self-Attention', meaning: 'हर शब्द बाकी सबसे compare करता है' },
          { hindi: 'क्वेरी-की-वैल्यू', english: 'Query-Key-Value', meaning: 'search जैसा — Query पूछता है, Key match करता है, Value जवाब देता है' },
          { hindi: 'मल्टी-हेड', english: 'Multi-Head', meaning: 'कई angles से एक साथ ध्यान देना' },
        ]}
      />

      {/* Spotlight analogy */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔦</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Attention = <span style={{ color: '#818cf8' }}>Spotlight</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 520, margin: '0 auto 24px' }}>
          When you read "The <b>bank</b> by the <b>river</b>", the word "bank" shines its spotlight on "river" to understand it means riverbank, not a financial bank.
        </p>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: 24,
          display: 'inline-flex', gap: 12, alignItems: 'center',
        }}>
          {['The', 'bank', 'by', 'the', 'river'].map((w, i) => (
            <span key={i} style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 18,
              background: w === 'bank' ? 'rgba(79,70,229,0.3)' : w === 'river' ? 'rgba(16,185,129,0.3)' : 'transparent',
              color: w === 'bank' ? '#818cf8' : w === 'river' ? '#10b981' : 'var(--text-secondary)',
              fontWeight: (w === 'bank' || w === 'river') ? 700 : 400,
              position: 'relative',
            }}>
              {w}
              {w === 'bank' && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 16,
                  }}
                >
                  🔦
                </motion.div>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive attention bars */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2 }}>
          Interactive: Click a word
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
          See what each word pays attention to. Taller bar = more attention.
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
          {sentence.map((word) => (
            <motion.button
              key={word}
              onClick={() => setSelectedWord(word)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 24px', borderRadius: 12, fontSize: 18, fontWeight: 600,
                fontFamily: 'var(--font-heading)', cursor: 'pointer', transition: 'all 0.2s',
                border: selectedWord === word ? '2px solid #4f46e5' : '2px solid var(--border)',
                background: selectedWord === word ? 'rgba(79,70,229,0.2)' : 'var(--bg-secondary)',
                color: selectedWord === word ? '#818cf8' : 'var(--text-primary)',
              }}
            >
              {word}
            </motion.button>
          ))}
        </div>

        {/* Bars */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: 32,
          display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
        }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            "<span style={{ color: '#818cf8', fontWeight: 600 }}>{selectedWord}</span>" attends to:
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', justifyContent: 'center', height: 200 }}>
            {sentence.map((word, i) => {
              const w = weights[i]
              return (
                <div key={word} style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{ height: Math.max(w * 180, 16) }}
                    transition={{ type: 'spring', damping: 12 }}
                    style={{
                      width: 56, background: `rgba(79,70,229,${w + 0.1})`,
                      borderRadius: '8px 8px 0 0', display: 'flex',
                      alignItems: 'flex-start', justifyContent: 'center', paddingTop: 6,
                      boxShadow: w > 0.2 ? `0 0 ${w * 30}px rgba(79,70,229,${w * 0.4})` : 'none',
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>
                      {Math.round(w * 100)}%
                    </span>
                  </motion.div>
                  <div style={{
                    marginTop: 8, fontSize: 14,
                    fontWeight: word === selectedWord ? 700 : 400,
                    color: word === selectedWord ? '#818cf8' : 'var(--text-secondary)',
                  }}>
                    {word}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
          Full Attention Heatmap
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', margin: '0 auto' }}>
            <thead>
              <tr>
                <td style={{ padding: 8 }} />
                {sentence.map((w) => (
                  <td key={w} style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent-light)' }}>{w}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {sentence.map((rowW) => (
                <tr key={rowW}>
                  <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: 'var(--accent-light)', textAlign: 'right' }}>{rowW}</td>
                  {attentionMap[rowW].map((w, j) => (
                    <td key={j} style={{ padding: 3 }}>
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: `rgba(79,70,229,${w})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: 10,
                          color: w > 0.2 ? 'white' : 'var(--text-muted)', fontWeight: 500,
                        }}
                      >
                        {Math.round(w * 100)}
                      </motion.div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Q K V */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { emoji: '❓', title: 'Query', sub: '"What am I looking for?"', color: '#4f46e5' },
          { emoji: '🔑', title: 'Key', sub: '"What do I contain?"', color: '#0ea5e9' },
          { emoji: '📦', title: 'Value', sub: '"Here\'s my information"', color: '#f59e0b' },
        ].map((c) => (
          <motion.div key={c.title} whileHover={{ y: -6 }} style={{
            flex: '1 1 160px', padding: 24, background: 'var(--bg-card)',
            borderRadius: 16, textAlign: 'center', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{c.emoji}</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: c.color, marginBottom: 4 }}>{c.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
