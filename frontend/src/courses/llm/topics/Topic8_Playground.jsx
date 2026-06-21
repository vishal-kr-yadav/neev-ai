import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PlaygroundScene from '../../../components/three/PlaygroundScene'
import HindiExplainer from '../../../components/HindiExplainer'

const wordChains = {
  the: ['cat', 'dog', 'model', 'transformer', 'AI', 'data'],
  cat: ['sat', 'slept', 'jumped', 'played'], dog: ['ran', 'barked', 'fetched'],
  model: ['learned', 'predicted', 'generated'], ai: ['is', 'can', 'will'],
  is: ['amazing', 'powerful', 'learning', 'the'], i: ['love', 'think', 'want', 'am'],
  love: ['learning', 'AI', 'coding'], learning: ['is', 'about', 'from', 'new'],
  hello: ['world', 'there', 'everyone'], how: ['does', 'do', 'can', 'is'],
  transformer: ['architecture', 'model', 'is'],
}
const fallback = ['the', 'is', 'a', 'and', 'to', 'of', 'in']

function predict(word) {
  const k = word.toLowerCase().replace(/[^a-z]/g, '')
  const opts = wordChains[k] || fallback
  return opts.map((w, i) => ({ word: w, prob: Math.max(0.05, (1 - i * 0.15) * 0.6 + Math.random() * 0.15) }))
    .sort((a, b) => b.prob - a.prob).slice(0, 5)
}

const tempExamples = {
  0.1: { label: 'Very Focused', out: 'The cat sat on the mat. The cat sat on the mat.', color: '#4f46e5' },
  0.5: { label: 'Balanced', out: 'The cat sat on the warm rug near the fireplace.', color: '#0ea5e9' },
  0.7: { label: 'Creative', out: 'The cat danced on the moonlit rooftop, singing.', color: '#f59e0b' },
  1.0: { label: 'Wild', out: 'The cat quantum-leaped through a saxophone dream!', color: '#ec4899' },
}

export default function Topic8_Playground() {
  const [input, setInput] = useState('The cat')
  const [preds, setPreds] = useState([])
  const [gen, setGen] = useState('')
  const [isGen, setIsGen] = useState(false)
  const [temp, setTemp] = useState(0.7)

  useEffect(() => {
    const words = input.trim().split(/\s+/)
    setPreds(predict(words[words.length - 1] || ''))
  }, [input])

  const addWord = (w) => setInput((p) => p + ' ' + w)

  const autoGen = async () => {
    setIsGen(true); setGen('')
    let text = input
    for (let i = 0; i < 10; i++) {
      const ws = text.trim().split(/\s+/)
      const ps = predict(ws[ws.length - 1])
      const idx = Math.min(Math.floor(Math.random() * (1 + temp * 4)), ps.length - 1)
      text += ' ' + ps[idx].word
      setGen(text.slice(input.length))
      await new Promise((r) => setTimeout(r, 300))
    }
    setIsGen(false)
  }

  return (
    <div>
      {/* 3D Token Universe */}
      <div style={{ marginBottom: 32 }}>
        <PlaygroundScene />
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          🖱️ Orbit the token universe. The core processes tokens orbiting around it — this is what happens when an LLM generates text.
        </p>
      </div>

      {/* Next word predictor */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32,
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
          Next Word Predictor
        </div>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          style={{
            width: '100%', padding: 16, background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)',
            fontSize: 16, fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: 20,
          }}
          placeholder="Start typing..."
        />
        {gen && <div style={{ fontFamily: 'monospace', color: 'var(--accent-light)', opacity: 0.7, marginBottom: 16, fontSize: 14 }}>...{gen}</div>}

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          Click to add:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {preds.map((p) => (
            <motion.button key={p.word} onClick={() => addWord(p.word)}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: `rgba(79,70,229,${p.prob * 0.5})`, color: 'var(--text-primary)',
                fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
              }}>
              {p.word}
              <span style={{ fontSize: 11, opacity: 0.7, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                {Math.round(p.prob * 100)}%
              </span>
            </motion.button>
          ))}
        </div>

        <motion.button whileHover={{ scale: 1.05 }} onClick={autoGen} disabled={isGen}
          style={{
            padding: '12px 24px', background: 'var(--gradient-primary)', border: 'none',
            borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            opacity: isGen ? 0.7 : 1,
          }}>
          {isGen ? '⏳ Generating...' : '⚡ Auto-Generate'}
        </motion.button>
      </div>

      <HindiExplainer
        concept="टेम्परेचर — AI की creativity"
        english="Temperature & Randomness"
        explanation="Temperature एक setting है जो AI को creative या strict बनाती है। Low temperature (0.1) = हमेशा safe, same जवाब। High temperature (1.0) = creative, अलग-अलग जवाब — लेकिन कभी-कभी अजीब भी।"
        example="जैसे cooking में masala: कम masala = simple, safe taste (low temp)। ज़्यादा masala = exciting, different taste — पर कभी-कभी बिगड़ भी सकता है (high temp)। Code लिखवाना हो तो low temp रखो, कहानी लिखवानी हो तो high temp!"
        terms={[
          { hindi: 'टेम्परेचर', english: 'Temperature', meaning: '0 से 1 — कम = strict, ज़्यादा = creative' },
          { hindi: 'टॉप-P', english: 'Top-P', meaning: 'कितने options में से चुनना है — 0.1 = safe choices only' },
          { hindi: 'मैक्स टोकन', english: 'Max Tokens', meaning: 'AI कितना लंबा जवाब दे सकता है' },
        ]}
      />

      {/* Temperature */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
          Temperature Control
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Low = predictable &amp; safe. High = creative &amp; surprising.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🧊</span>
          <input type="range" min="0.1" max="1.0" step="0.1" value={temp}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#4f46e5' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🔥</span>
          <span style={{
            padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: 8,
            fontSize: 14, fontWeight: 600, color: 'var(--accent-light)',
          }}>{temp.toFixed(1)}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {Object.entries(tempExamples).map(([t, d]) => {
            const isA = Math.abs(parseFloat(t) - temp) < 0.05
            return (
              <motion.div key={t} animate={{ borderColor: isA ? d.color : 'var(--border)', scale: isA ? 1.03 : 1 }}
                style={{
                  padding: 16, background: isA ? `${d.color}15` : 'var(--bg-secondary)',
                  border: '1px solid var(--border)', borderRadius: 12, transition: 'background 0.2s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>T={t}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{d.out}"</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
