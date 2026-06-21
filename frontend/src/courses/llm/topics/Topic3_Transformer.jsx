import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import TransformerScene from '../../../components/three/TransformerScene'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 3 — Transformer Architecture (Deep Dive)
   Covers: Full encoder-decoder, encoder-only, decoder-only,
   every sub-component with examples and diagrams.
================================================================ */

/* ---- Visual: Animated Block Component ---- */
function Block({ label, color, emoji, children, small = false }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      style={{ padding: small ? '10px 14px' : '16px 20px', background: `${color}10`, border: `2px solid ${color}33`, borderRadius: 14, textAlign: 'center' }}>
      {emoji && <div style={{ fontSize: small ? 20 : 28, marginBottom: 4 }}>{emoji}</div>}
      <div style={{ fontSize: small ? 12 : 14, fontWeight: 700, color }}>{label}</div>
      {children}
    </motion.div>
  )
}

function Arrow({ color = 'var(--accent)', vertical = true, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 2, padding: vertical ? '4px 0' : '0 4px' }}>
      <div style={{ width: vertical ? 2 : 20, height: vertical ? 20 : 2, background: color }} />
      {label && <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</div>}
      <div style={{ width: 0, height: 0, borderLeft: vertical ? '5px solid transparent' : `6px solid ${color}`, borderRight: vertical ? '5px solid transparent' : 'none', borderTop: vertical ? `6px solid ${color}` : '5px solid transparent', borderBottom: vertical ? 'none' : '5px solid transparent' }} />
    </div>
  )
}

/* ---- Interactive: Full Encoder-Decoder Architecture ---- */
function FullArchitectureDiagram() {
  const [activeBlock, setActiveBlock] = useState(null)

  const details = {
    'input-embed': { title: 'Input Embedding', desc: 'Converts each input token (word piece) into a dense vector. For example, "Hello" becomes [0.23, -0.14, 0.87, ...] — a 512 to 12,288 dimensional vector that captures semantic meaning. These embeddings are learned during training.', analogy: 'Like translating each word into GPS coordinates in "meaning space".', tech: 'Embedding matrix: V×d where V=vocabulary size (~100k), d=model dimension (512-12,288). Lookup table, not computation.' },
    'pos-encode': { title: 'Positional Encoding', desc: 'Without position info, "dog bites man" and "man bites dog" would look identical to the model. Positional encoding adds a unique signal for each position so the model knows word ORDER matters.', analogy: 'Like numbering pages in a shuffled book so you can put them back in order.', tech: 'Original paper uses sine/cosine functions: PE(pos,2i) = sin(pos/10000^(2i/d)). Modern models use learned positional embeddings or RoPE (Rotary Position Embeddings).' },
    'self-attn-enc': { title: 'Self-Attention (Encoder)', desc: 'Every input word looks at EVERY other input word and decides how much to pay attention to each. The word "it" in "The cat sat because it was tired" attends strongly to "cat" to understand what "it" refers to.', analogy: 'Like a group discussion where everyone listens to everyone — each person takes notes on who said what matters most to them.', tech: 'Q, K, V projections: Q=XWq, K=XWk, V=XWv. Attention = softmax(QK^T/√dk)V. Multi-head: h parallel attention heads concatenated. O(n²d) complexity.' },
    'cross-attn': { title: 'Cross-Attention', desc: 'The decoder looks at the encoder\'s output to find relevant information. When translating "Le chat" to English, the decoder generating "The" attends to "Le", and when generating "cat" it attends to "chat".', analogy: 'Like a student (decoder) looking at their reference textbook (encoder output) while writing an essay.', tech: 'Keys and Values come from encoder output, Queries come from decoder. This bridges the two halves: Attn(Q_dec, K_enc, V_enc).' },
    'masked-attn': { title: 'Masked Self-Attention (Decoder)', desc: 'Same as self-attention, but each position can ONLY look at positions before it (left context). When generating word 5, it can see words 1-4 but NOT words 6+. This prevents "cheating" during training.', analogy: 'Like writing a story where you can only re-read what you\'ve already written — no peeking at future pages.', tech: 'Causal mask: upper triangle of attention matrix set to -∞ before softmax. Ensures autoregressive property: P(word_t | word_1...word_{t-1}).' },
    'ffn': { title: 'Feed-Forward Network', desc: 'A two-layer neural network applied to each position independently. It transforms the attention-enriched representations — adding "thinking" capacity. This is where most of the model\'s knowledge is actually stored.', analogy: 'Like each word going through its own personal "thinking room" to refine its understanding after the group discussion.', tech: 'FFN(x) = max(0, xW₁+b₁)W₂+b₂. Inner dimension typically 4× model dim. Some models use SwiGLU: SwiGLU(x) = Swish(xW₁) ⊙ xV. This is where ~⅔ of parameters live.' },
    'layer-norm': { title: 'Layer Norm + Residual', desc: 'Two critical tricks: (1) Layer Normalization keeps values in a stable range so training doesn\'t explode. (2) Residual connections add a "shortcut" that carries the original signal through, preventing information from being lost in deep networks.', analogy: 'Layer Norm = keeping the volume at a consistent level. Residual = having a backup copy of every conversation, so nothing gets lost in translation.', tech: 'Pre-norm (modern): x + Sublayer(LayerNorm(x)). LayerNorm: normalize across feature dim to μ=0, σ=1, then scale+shift. Residual connections enable training 100+ layers without gradient vanishing.' },
    'output-head': { title: 'Output Head (Linear + Softmax)', desc: 'The final layer projects the last hidden state back to vocabulary size and applies softmax to get a probability distribution over ALL possible next tokens. The highest probability token is selected (or sampled with temperature).', analogy: 'Like the final voting round — every word in the dictionary gets a score, and the winner becomes the next word.', tech: 'Linear: Rd → RV (unembedding matrix, often tied with input embeddings). Softmax: P(token_i) = exp(z_i)/Σexp(z_j). Temperature T scales logits: z/T before softmax.' },
  }

  const active = details[activeBlock]

  return (
    <div>
      {/* The architecture diagram */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 20, marginBottom: 24 }}>
        {/* ENCODER */}
        <div style={{ background: '#4f46e510', border: '2px solid #4f46e533', borderRadius: 20, padding: 24 }}>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#4f46e5', marginBottom: 20 }}>
            🏗️ ENCODER
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('input-embed')} style={{ cursor: 'pointer', width: '100%' }}>
              <Block label="Input Embedding" color="#4f46e5" emoji="📥" small />
            </motion.div>
            <Arrow color="#4f46e5" />
            <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('pos-encode')} style={{ cursor: 'pointer', width: '100%' }}>
              <Block label="+ Positional Encoding" color="#818cf8" emoji="📍" small />
            </motion.div>
            <Arrow color="#818cf8" />

            {/* Encoder block (repeated Nx) */}
            <div style={{ width: '100%', border: '2px dashed #4f46e544', borderRadius: 14, padding: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, right: 12, background: 'var(--bg-primary)', padding: '0 8px', fontSize: 11, fontWeight: 700, color: '#4f46e5' }}>×N layers</div>
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('self-attn-enc')} style={{ cursor: 'pointer' }}>
                <Block label="Multi-Head Self-Attention" color="#0ea5e9" emoji="🎯" small />
              </motion.div>
              <Arrow color="#0ea5e9" />
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('layer-norm')} style={{ cursor: 'pointer' }}>
                <Block label="Add & Layer Norm" color="#ec4899" emoji="🔄" small />
              </motion.div>
              <Arrow color="#ec4899" />
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('ffn')} style={{ cursor: 'pointer' }}>
                <Block label="Feed-Forward Network" color="#f59e0b" emoji="⚡" small />
              </motion.div>
              <Arrow color="#f59e0b" />
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('layer-norm')} style={{ cursor: 'pointer' }}>
                <Block label="Add & Layer Norm" color="#ec4899" emoji="🔄" small />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Arrow connecting encoder to decoder */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ fontSize: 28, color: 'var(--accent)' }}>→</motion.div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>K, V to cross-attention</div>
        </div>

        {/* DECODER */}
        <div style={{ background: '#10b98110', border: '2px solid #10b98133', borderRadius: 20, padding: 24 }}>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#10b981', marginBottom: 20 }}>
            📝 DECODER
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('input-embed')} style={{ cursor: 'pointer', width: '100%' }}>
              <Block label="Output Embedding" color="#10b981" emoji="📥" small />
            </motion.div>
            <Arrow color="#10b981" />
            <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('pos-encode')} style={{ cursor: 'pointer', width: '100%' }}>
              <Block label="+ Positional Encoding" color="#34d399" emoji="📍" small />
            </motion.div>
            <Arrow color="#34d399" />

            {/* Decoder block (repeated Nx) */}
            <div style={{ width: '100%', border: '2px dashed #10b98144', borderRadius: 14, padding: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, right: 12, background: 'var(--bg-primary)', padding: '0 8px', fontSize: 11, fontWeight: 700, color: '#10b981' }}>×N layers</div>
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('masked-attn')} style={{ cursor: 'pointer' }}>
                <Block label="Masked Self-Attention" color="#8b5cf6" emoji="🎭" small />
              </motion.div>
              <Arrow color="#8b5cf6" />
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('layer-norm')} style={{ cursor: 'pointer' }}>
                <Block label="Add & Layer Norm" color="#ec4899" emoji="🔄" small />
              </motion.div>
              <Arrow color="#ec4899" />
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('cross-attn')} style={{ cursor: 'pointer' }}>
                <Block label="Cross-Attention" color="#f97316" emoji="🔗" small />
              </motion.div>
              <Arrow color="#f97316" />
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('layer-norm')} style={{ cursor: 'pointer' }}>
                <Block label="Add & Layer Norm" color="#ec4899" emoji="🔄" small />
              </motion.div>
              <Arrow color="#ec4899" />
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('ffn')} style={{ cursor: 'pointer' }}>
                <Block label="Feed-Forward Network" color="#f59e0b" emoji="⚡" small />
              </motion.div>
              <Arrow color="#f59e0b" />
              <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('layer-norm')} style={{ cursor: 'pointer' }}>
                <Block label="Add & Layer Norm" color="#ec4899" emoji="🔄" small />
              </motion.div>
            </div>

            <Arrow color="#10b981" />
            <motion.div whileHover={{ scale: 1.03 }} onClick={() => setActiveBlock('output-head')} style={{ cursor: 'pointer', width: '100%' }}>
              <Block label="Linear + Softmax" color="#10b981" emoji="📤" small />
            </motion.div>
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
        👆 Click any block above to see a detailed explanation
      </p>

      {/* Detail panel */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ background: 'var(--bg-card)', border: '2px solid var(--accent-light)', borderRadius: 18, padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                {active.title}
              </h3>
              <button onClick={() => setActiveBlock(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 16 }}>{active.desc}</p>
            <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 12, fontSize: 15, color: '#166534', lineHeight: 1.6, marginBottom: 12 }}>
              🧒 <strong>Simple:</strong> {active.analogy}
            </div>
            <div style={{ padding: 16, background: '#faf5ff', borderRadius: 12, fontSize: 14, color: '#6b21a8', lineHeight: 1.6, fontFamily: 'monospace' }}>
              🔬 <strong>Technical:</strong> {active.tech}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Interactive: Q/K/V Attention Calculator ---- */
function AttentionCalculator() {
  const [step, setStep] = useState(0)
  const words = ['The', 'cat', 'sat', 'on', 'the', 'mat']
  const focusWord = 'cat' // word 1
  // Simulated attention weights for "cat"
  const weights = [0.05, 0.15, 0.35, 0.05, 0.05, 0.35]

  const steps = [
    { label: 'Input', desc: 'Each word has an embedding vector — a list of numbers representing its meaning.' },
    { label: 'Create Q, K, V', desc: '"cat" creates a Query ("what am I looking for?"). ALL words create Keys ("what do I contain?") and Values ("here\'s my information").'},
    { label: 'Score', desc: 'Multiply cat\'s Query with every word\'s Key. High score = high relevance. "sat" and "mat" score highest because they relate to "cat".'},
    { label: 'Softmax', desc: 'Convert raw scores into probabilities (0-1, summing to 1). Now we have attention weights.'},
    { label: 'Weighted Sum', desc: 'Multiply each word\'s Value by its attention weight and sum. "cat" now has a new representation enriched with context from relevant words.'},
  ]

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
        {steps.map((s, i) => (
          <motion.button key={i} onClick={() => setStep(i)} whileHover={{ y: -2 }}
            style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `2px solid ${step === i ? '#4f46e5' : 'var(--border)'}`, background: step === i ? '#4f46e5' : 'var(--bg-card)', color: step === i ? 'white' : 'var(--text-secondary)' }}>
            {i + 1}. {s.label}
          </motion.button>
        ))}
      </div>

      {/* Word display */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        {words.map((w, i) => {
          const isFocus = i === 1 // "cat"
          const barHeight = step >= 3 ? weights[i] * 100 : 0
          return (
            <motion.div key={i}
              animate={step >= 3 ? { borderColor: `rgba(79,70,229,${weights[i]})` } : {}}
              style={{ padding: '12px 20px', borderRadius: 14, border: `3px solid ${isFocus ? '#4f46e5' : 'var(--border)'}`, background: isFocus ? '#ede9fe' : 'var(--bg-card)', textAlign: 'center', minWidth: 70, position: 'relative' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: isFocus ? '#4f46e5' : 'var(--text-primary)' }}>{w}</div>
              {step >= 1 && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  {isFocus ? 'Q →' : 'K, V'}
                </div>
              )}
              {step >= 3 && (
                <motion.div initial={{ height: 0 }} animate={{ height: barHeight }}
                  style={{ position: 'absolute', bottom: -barHeight - 8, left: '50%', transform: 'translateX(-50%)', width: 30, background: `rgba(79,70,229,${0.2 + weights[i] * 0.8})`, borderRadius: '0 0 6px 6px' }}>
                  <div style={{ position: 'absolute', bottom: -16, width: '100%', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#4f46e5' }}>
                    {(weights[i] * 100).toFixed(0)}%
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {step >= 3 && <div style={{ height: 60 }} />}

      {/* Step description */}
      <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>Step {step + 1}: {steps[step].label}</div>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{steps[step].desc}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.3 : 1, fontSize: 14 }}>
          ← Back
        </button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', cursor: step === steps.length - 1 ? 'default' : 'pointer', opacity: step === steps.length - 1 ? 0.5 : 1, fontSize: 14, fontWeight: 600 }}>
          Next →
        </button>
      </div>
    </div>
  )
}

/* ---- Interactive: Which Architecture for Which Task? ---- */
function ArchitectureMatch() {
  const tasks = [
    { task: 'Translate English → French', answer: 'enc-dec', why: 'Need to understand full input (encoder) then generate output in different language (decoder).' },
    { task: 'Classify email as spam or not', answer: 'encoder', why: 'Need to understand the full email — no generation needed, just classification.' },
    { task: 'Write a story from a prompt', answer: 'decoder', why: 'Pure text generation — predict the next word given all previous words.' },
    { task: 'Summarize a long article', answer: 'enc-dec', why: 'Encode the full article, then decode (generate) a shorter version.' },
    { task: 'Fill in a blank: "The ___ is blue"', answer: 'encoder', why: 'BERT-style masked prediction — needs bidirectional context (both left and right).' },
    { task: 'Chatbot conversation', answer: 'decoder', why: 'Autoregressive generation — GPT-style models generate one token at a time.' },
  ]
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)

  const handleSelect = (arch) => {
    if (selected) return
    setSelected(arch)
    if (arch === tasks[current].answer) setScore(s => s + 1)
  }

  const next = () => {
    if (current < tasks.length - 1) { setCurrent(c => c + 1); setSelected(null) }
  }

  const t = tasks[current]
  const done = current === tasks.length - 1 && selected

  return (
    <div>
      {!done ? (
        <>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Task {current + 1}/{tasks.length} — Score: {score}</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 20 }}>
            "{t.task}"
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { id: 'encoder', label: 'Encoder-Only', icon: '🏗️', model: 'BERT, RoBERTa', color: '#4f46e5' },
              { id: 'decoder', label: 'Decoder-Only', icon: '📝', model: 'GPT-4, Claude, Llama', color: '#10b981' },
              { id: 'enc-dec', label: 'Encoder-Decoder', icon: '🔄', model: 'T5, BART, mBART', color: '#f97316' },
            ].map(arch => {
              let bg = 'var(--bg-card)', border = 'var(--border)'
              if (selected && arch.id === t.answer) { bg = '#d1fae5'; border = '#10b981' }
              else if (selected === arch.id && arch.id !== t.answer) { bg = '#fee2e2'; border = '#ef4444' }
              return (
                <motion.button key={arch.id} onClick={() => handleSelect(arch.id)} whileHover={!selected ? { y: -4 } : {}}
                  style={{ padding: 20, borderRadius: 16, border: `2px solid ${border}`, background: bg, cursor: selected ? 'default' : 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{arch.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: arch.color, marginBottom: 4 }}>{arch.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{arch.model}</div>
                </motion.button>
              )
            })}
          </div>
          {selected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ padding: 16, background: selected === t.answer ? '#f0fdf4' : '#fef2f2', borderRadius: 12, fontSize: 15, color: selected === t.answer ? '#065f46' : '#991b1b', lineHeight: 1.6, marginBottom: 12 }}>
                {selected === t.answer ? '✓ Correct!' : '✗ Not quite.'} {t.why}
              </div>
              <button onClick={next} style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                Next Task →
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{score >= 5 ? '🏆' : score >= 3 ? '🌟' : '📚'}</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{score}/{tasks.length} correct!</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 8 }}>
            {t.why}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic3_Transformer() {
  const [archTab, setArchTab] = useState('full')

  return (
    <div>
      {/* Neuron Welcome */}
      <div style={{ marginBottom: 36 }}>
        <Neuron mood="waving" size="large" typed
          message="Welcome to the Transformer — the most important architecture in modern AI! Every model you've heard of (GPT-4, Claude, Gemini, Llama) is built on this. I'll break down every single component with diagrams and real examples. Let's go deep! 🏗️"
        />
      </div>

      <HindiExplainer
        concept="ट्रांसफ़ॉर्मर"
        english="Transformer Architecture"
        explanation="Transformer वो engine है जो हर modern AI (GPT, Claude, Gemini) को चलाता है। ये एक special design है जो एक साथ पूरे sentence को देख सकता है — पुराने AI एक-एक शब्द पढ़ते थे।"
        example="सोचिए पुराना AI एक अंधे आदमी जैसा था — एक-एक शब्द छूकर समझता था। Transformer एक ऐसा आदमी है जो पूरा page एक नज़र में पढ़ लेता है — इसलिए बहुत तेज़ और smart है!"
        terms={[
          { hindi: 'लेयर', english: 'Layer', meaning: 'processing का एक चरण — GPT-4 में 120+ layers हैं' },
          { hindi: 'एन्कोडर', english: 'Encoder', meaning: 'input को समझने वाला हिस्सा' },
          { hindi: 'डिकोडर', english: 'Decoder', meaning: 'output generate करने वाला हिस्सा' },
        ]}
      />

      {/* 3D Scene */}
      <SectionBlock icon="🌐" title="3D Transformer Visualization" color="#4f46e5">
        <TransformerScene />
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 10 }}>
          🖱️ Drag to orbit. Watch data particles flow through layers. Pink arc = skip/residual connection.
        </div>
      </SectionBlock>

      {/* The Big Picture */}
      <SectionBlock icon="🗺️" title="The Big Picture: What IS a Transformer?" color="#4f46e5">
        <Neuron mood="explaining" size="small"
          message="Imagine a factory with two halves: the Encoder reads and understands input, the Decoder generates output. Some models use both, some use only one half. Let me show you the three architectures and when each is used."
        />

        {/* Three architecture types */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: '28px 0' }}>
          {[
            { id: 'encoder', icon: '🏗️', title: 'Encoder-Only', color: '#4f46e5', models: 'BERT, RoBERTa, DeBERTa', use: 'Understanding text — classification, NER, sentiment analysis', how: 'Reads ALL words simultaneously (bidirectional). Great for understanding, not generation.', example: '"Is this review positive?" → Encoder reads full review → outputs: Positive (98%)' },
            { id: 'decoder', icon: '📝', title: 'Decoder-Only', color: '#10b981', models: 'GPT-4, Claude, Llama, Gemini', use: 'Generating text — chatbots, writing, coding', how: 'Reads left-to-right only (causal). Predicts next word. This is what powers ChatGPT.', example: '"Write a haiku about..." → generates one word at a time → "Autumn leaves falling / Whispers of the cooling wind / Nature\'s gentle song"' },
            { id: 'enc-dec', icon: '🔄', title: 'Encoder-Decoder', color: '#f97316', models: 'T5, BART, mBART, Whisper', use: 'Transforming text — translation, summarization', how: 'Encoder understands full input, decoder generates output. Best when input and output are different.', example: '"Translate: The cat is black" → Encoder reads English → Decoder outputs: "Le chat est noir"' },
          ].map((a) => (
            <motion.div key={a.id} whileHover={{ y: -4 }}
              onClick={() => setArchTab(a.id === archTab ? 'full' : a.id)}
              style={{ padding: 24, background: archTab === a.id ? `${a.color}10` : 'var(--bg-secondary)', border: `2px solid ${archTab === a.id ? a.color : 'var(--border)'}`, borderRadius: 18, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 36, marginBottom: 10, textAlign: 'center' }}>{a.icon}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: a.color, marginBottom: 6, textAlign: 'center' }}>{a.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>{a.models}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Used for:</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{a.use}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>How it works:</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{a.how}</div>
              <div style={{ padding: 12, background: `${a.color}08`, borderRadius: 10, fontSize: 13, color: a.color, lineHeight: 1.5, fontStyle: 'italic' }}>
                {a.example}
              </div>
            </motion.div>
          ))}
        </div>

        <NeuronTip type="fun">
          <strong>The "Attention Is All You Need" paper (2017)</strong> by Vaswani et al. at Google introduced the Transformer with an encoder-decoder design.
          Then GPT (2018) said "we only need the decoder" and BERT (2018) said "we only need the encoder". The decoder-only approach won for generation tasks and now dominates the field.
        </NeuronTip>
      </SectionBlock>

      {/* Full Architecture Diagram */}
      <SectionBlock icon="🔬" title="Full Architecture: Every Component Explained" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          Below is the complete Transformer architecture from the original paper. <strong>Click any block</strong> to see a detailed explanation with both a simple analogy and technical details.
        </p>
        <FullArchitectureDiagram />

        <NeuronTip type="deep">
          <strong>The original Transformer (2017):</strong> d_model=512, h=8 attention heads, N=6 encoder layers, N=6 decoder layers, d_ff=2048, ~65M parameters.
          <br /><strong>GPT-4 (2023 estimate):</strong> d_model≈12,288, h=96 heads, N≈120 decoder layers, d_ff≈49,152, ~1.7T parameters across 8 experts (MoE).
          The fundamental architecture is the same — just scaled ~26,000× bigger.
        </NeuronTip>
      </SectionBlock>

      {/* Self-Attention Deep Dive */}
      <InteractiveDemo
        title="Self-Attention: Step by Step"
        instruction="Watch how the word 'cat' attends to every other word in the sentence. Step through the Q/K/V process."
      >
        <AttentionCalculator />
      </InteractiveDemo>

      {/* Encoder vs Decoder walkthrough */}
      <SectionBlock icon="⚖️" title="Encoder vs Decoder: The Key Differences" color="#0ea5e9">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ padding: 24, background: '#4f46e508', borderRadius: 16, border: '2px solid #4f46e533' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: '#4f46e5', marginBottom: 16 }}>🏗️ Encoder</h3>
            {[
              { label: 'Direction', value: 'Bidirectional — sees ALL words at once' },
              { label: 'Attention', value: 'Full self-attention (no masking)' },
              { label: 'Purpose', value: 'Build rich UNDERSTANDING of input' },
              { label: 'Output', value: 'Contextual embeddings for each token' },
              { label: 'Analogy', value: 'Reading comprehension — understand the whole text' },
              { label: 'Example task', value: '"Is this email spam?" → Yes/No' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>{r.label}</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 24, background: '#10b98108', borderRadius: 16, border: '2px solid #10b98133' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: '#10b981', marginBottom: 16 }}>📝 Decoder</h3>
            {[
              { label: 'Direction', value: 'Left-to-right only (causal/autoregressive)' },
              { label: 'Attention', value: 'Masked self-attention (can\'t see future)' },
              { label: 'Purpose', value: 'GENERATE new text one token at a time' },
              { label: 'Output', value: 'Probability distribution over next token' },
              { label: 'Analogy', value: 'Writing an essay — you write forward, can\'t peek ahead' },
              { label: 'Example task', value: '"Write a poem about..." → generates it word by word' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>{r.label}</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Masking visual */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            🎭 The Causal Mask — Why Decoders Can't See the Future
          </h4>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
            During training, the decoder sees the full sentence but uses a <strong>mask</strong> to prevent each position from attending to future tokens. Here's what the attention mask looks like:
          </p>
          <div style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-secondary)', padding: 20, borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 50px)', gap: 2 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 8 }}></div>
              {['The', 'cat', 'sat', 'on', 'the'].map(w => (
                <div key={w} style={{ fontWeight: 700, color: 'var(--accent)', textAlign: 'center', paddingBottom: 8 }}>{w}</div>
              ))}
              {['The', 'cat', 'sat', 'on', 'the'].map((row, ri) => (
                [row, ...['The', 'cat', 'sat', 'on', 'the'].map((_, ci) => {
                  const canSee = ci <= ri
                  return canSee ? '✓' : '✗'
                })].map((cell, ci) => (
                  <div key={`${ri}-${ci}`} style={{
                    textAlign: 'center', padding: '8px 4px', borderRadius: 6,
                    background: ci === 0 ? 'transparent' : cell === '✓' ? '#d1fae5' : '#fee2e2',
                    color: ci === 0 ? 'var(--accent)' : cell === '✓' ? '#065f46' : '#991b1b',
                    fontWeight: ci === 0 ? 700 : 500, fontSize: ci === 0 ? 13 : 14,
                  }}>
                    {cell}
                  </div>
                ))
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              ✓ = can attend | ✗ = masked (set to -∞ before softmax)
            </div>
          </div>
        </div>

        <NeuronTip type="simple">
          <strong>Why the mask?</strong> During training, we show the model a full sentence like "The cat sat on the mat" and ask it to predict each next word.
          Without the mask, the model could "cheat" by looking ahead. The mask forces it to only use what came before — exactly like at inference time when future words don't exist yet.
        </NeuronTip>
      </SectionBlock>

      {/* Multi-Head Attention */}
      <SectionBlock icon="👥" title="Multi-Head Attention: Multiple Perspectives" color="#ec4899">
        <Neuron mood="thinking" size="small"
          message="Instead of one attention calculation, we run MULTIPLE in parallel — each 'head' learns to focus on different types of relationships."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, margin: '24px 0' }}>
          {[
            { head: 'Head 1', focus: 'Syntax', example: '"cat" → "sat" (subject-verb)', color: '#4f46e5' },
            { head: 'Head 2', focus: 'Coreference', example: '"it" → "cat" (pronoun resolution)', color: '#0ea5e9' },
            { head: 'Head 3', focus: 'Proximity', example: '"on" → "the" (nearby words)', color: '#10b981' },
            { head: 'Head 4', focus: 'Semantics', example: '"cat" → "mat" (common pairing)', color: '#f97316' },
          ].map(h => (
            <motion.div key={h.head} whileHover={{ y: -4 }}
              style={{ padding: 18, background: `${h.color}08`, borderRadius: 14, border: `1px solid ${h.color}22`, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: h.color, marginBottom: 6 }}>{h.head}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{h.focus}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{h.example}</div>
            </motion.div>
          ))}
        </div>

        <NeuronTip type="deep">
          <strong>Multi-head math:</strong> Split d_model into h heads (e.g., 768/12 = 64 dims per head). Each head has its own W_q, W_k, W_v matrices (d_model → d_head).
          Run attention in parallel, concatenate outputs, and project: MultiHead(Q,K,V) = Concat(head_1,...,head_h)W_O.
          GPT-4 uses 96 heads with GQA (Grouped Query Attention) where multiple query heads share the same key/value heads to save memory.
        </NeuronTip>
      </SectionBlock>

      {/* Real Translation Example */}
      <SectionBlock icon="🌍" title="Real Example: Encoder-Decoder Translation" color="#f97316">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
          Let's walk through translating "The cat is black" → "Le chat est noir" using a full encoder-decoder Transformer:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { step: 1, label: 'Tokenize Input', visual: '"The cat is black" → [The] [cat] [is] [black]', color: '#4f46e5', detail: 'Split English input into tokens.' },
            { step: 2, label: 'Encoder Processes', visual: '[The] [cat] [is] [black] → Encoder → [rich understanding of each word in context]', color: '#818cf8', detail: 'All 6 encoder layers process bidirectionally. "cat" now knows it\'s the subject, "black" is its attribute.' },
            { step: 3, label: 'Decoder Starts', visual: '[<START>] → Decoder → "Le" (most likely first French word)', color: '#10b981', detail: 'Decoder receives start token. Cross-attention looks at encoder output to decide first French word.' },
            { step: 4, label: 'Decoder Step 2', visual: '[<START>] [Le] → Decoder → "chat"', color: '#34d399', detail: 'Now "Le" is in context. Cross-attention focuses on encoder\'s representation of "cat" → outputs "chat".' },
            { step: 5, label: 'Decoder Step 3-4', visual: '[Le] [chat] → "est" → "noir"', color: '#059669', detail: 'Continues until end-of-sequence token. Each step attends to relevant encoder positions.' },
            { step: 6, label: 'Complete!', visual: '"Le chat est noir" ✓', color: '#047857', detail: 'Full translation generated word-by-word using encoder understanding + decoder generation.' },
          ].map(s => (
            <motion.div key={s.step} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: s.step * 0.08 }}
              style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 18, background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-heading)', flexShrink: 0 }}>
                {s.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: s.color, marginBottom: 4 }}>{s.visual}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{s.detail}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Match the Architecture Quiz */}
      <InteractiveDemo
        title="Which Architecture for Which Task?"
        instruction="You'll see a task — pick whether it needs an Encoder-Only, Decoder-Only, or Encoder-Decoder model."
      >
        <ArchitectureMatch />
      </InteractiveDemo>

      {/* Key Takeaways */}
      <SectionBlock icon="🎯" title="Key Takeaways" color="#10b981">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {[
            { num: '01', text: 'The Transformer has two halves: Encoder (understands) and Decoder (generates). Modern LLMs like GPT-4 use decoder-only.', color: '#4f46e5' },
            { num: '02', text: 'Self-Attention lets each word look at every other word — the key innovation. Multi-head attention provides multiple "perspectives".', color: '#0ea5e9' },
            { num: '03', text: 'The causal mask in decoders prevents looking at future tokens — forcing left-to-right generation.', color: '#10b981' },
            { num: '04', text: 'Residual connections + Layer Norm enable training 100+ layer networks. FFN layers store most of the model\'s "knowledge".', color: '#f97316' },
            { num: '05', text: 'Encoder-only (BERT) for understanding, Decoder-only (GPT) for generation, Encoder-Decoder (T5) for transformation tasks.', color: '#8b5cf6' },
          ].map(item => (
            <motion.div key={item.num} whileHover={{ y: -4 }}
              style={{ padding: 24, background: `${item.color}08`, borderRadius: 18, border: `1px solid ${item.color}22` }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 900, color: `${item.color}25`, marginBottom: 8 }}>{item.num}</div>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Closing */}
      <div style={{ marginTop: 24 }}>
        <Neuron mood="happy" size="large"
          message="You just went DEEP into the Transformer! 🏗️ You now understand encoder, decoder, self-attention, cross-attention, masking, multi-head attention, residual connections, and when to use each architecture. That's more than most CS graduates know. Ready for the quiz?"
        />
      </div>
    </div>
  )
}
