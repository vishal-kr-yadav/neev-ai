import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 13 — Embeddings & Vector Search
================================================================ */

/* ---- Visual: 2D Word Cluster Scatter Plot ---- */
function WordClusterPlot() {
  const clusters = [
    { label: 'Animals / Pets', color: '#4f46e5', bg: '#ede9fe', words: [
      { word: 'cat', x: 12, y: 68 },
      { word: 'dog', x: 18, y: 58 },
      { word: 'pet', x: 8, y: 62 },
    ]},
    { label: 'Vehicles', color: '#0ea5e9', bg: '#e0f2fe', words: [
      { word: 'car', x: 72, y: 22 },
      { word: 'truck', x: 80, y: 16 },
      { word: 'bus', x: 76, y: 28 },
    ]},
    { label: 'Emotions', color: '#10b981', bg: '#d1fae5', words: [
      { word: 'happy', x: 42, y: 78 },
      { word: 'joyful', x: 48, y: 84 },
      { word: 'glad', x: 38, y: 86 },
    ]},
    { label: 'Food', color: '#f97316', bg: '#fff7ed', words: [
      { word: 'pizza', x: 70, y: 72 },
      { word: 'burger', x: 78, y: 68 },
      { word: 'pasta', x: 74, y: 78 },
    ]},
  ]

  const [hoveredCluster, setHoveredCluster] = useState(null)

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', height: 380, background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Axes */}
        <div style={{ position: 'absolute', left: 30, top: 10, bottom: 30, width: 2, background: 'var(--border)' }} />
        <div style={{ position: 'absolute', left: 30, bottom: 30, right: 10, height: 2, background: 'var(--border)' }} />
        <div style={{ position: 'absolute', left: 4, top: '45%', fontSize: 11, color: 'var(--text-muted)', transform: 'rotate(-90deg)', transformOrigin: 'center' }}>Dimension 2</div>
        <div style={{ position: 'absolute', bottom: 8, left: '50%', fontSize: 11, color: 'var(--text-muted)' }}>Dimension 1</div>

        {/* Cluster regions */}
        {clusters.map((cluster, ci) => {
          const minX = Math.min(...cluster.words.map(w => w.x)) - 6
          const minY = Math.min(...cluster.words.map(w => w.y)) - 6
          const maxX = Math.max(...cluster.words.map(w => w.x)) + 6
          const maxY = Math.max(...cluster.words.map(w => w.y)) + 6
          const isHovered = hoveredCluster === ci
          return (
            <motion.div key={cluster.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 0.35 : 0.18, scale: 1 }}
              style={{
                position: 'absolute',
                left: `${minX}%`, bottom: `${minY}%`,
                width: `${maxX - minX}%`, height: `${maxY - minY}%`,
                background: cluster.color,
                borderRadius: 20,
                transition: 'opacity 0.3s',
              }}
            />
          )
        })}

        {/* Word dots */}
        {clusters.map((cluster, ci) =>
          cluster.words.map((w, wi) => (
            <motion.div key={w.word}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.15 + wi * 0.08, type: 'spring', stiffness: 200 }}
              onMouseEnter={() => setHoveredCluster(ci)}
              onMouseLeave={() => setHoveredCluster(null)}
              style={{
                position: 'absolute',
                left: `${w.x}%`, bottom: `${w.y}%`,
                transform: 'translate(-50%, 50%)',
                cursor: 'default',
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: cluster.color,
                boxShadow: `0 2px 8px ${cluster.color}55`,
                marginBottom: 4,
                marginLeft: 'auto', marginRight: 'auto',
              }} />
              <div style={{
                fontSize: 13, fontWeight: 700, color: cluster.color,
                textAlign: 'center', whiteSpace: 'nowrap',
                textShadow: '0 0 6px var(--bg-card), 0 0 12px var(--bg-card)',
              }}>
                {w.word}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, justifyContent: 'center' }}>
        {clusters.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Diagram: How Embeddings Are Created ---- */
function EmbeddingPipeline() {
  const steps = [
    { label: 'Word', icon: '📝', content: '"queen"', color: '#4f46e5' },
    { label: 'Neural Network', icon: '🧠', content: 'Encoder', color: '#8b5cf6' },
    { label: 'Vector', icon: '📊', content: '[0.23, -0.45, 0.78, 0.12, ...]', color: '#0ea5e9' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '24px 0' }}>
      {steps.map((step, i) => (
        <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            style={{
              padding: '18px 24px', background: `${step.color}12`, border: `2px solid ${step.color}33`,
              borderRadius: 16, textAlign: 'center', minWidth: 120,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{step.icon}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{step.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: step.color, fontFamily: 'monospace' }}>{step.content}</div>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.span animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ fontSize: 22, color: '#8b5cf6', fontWeight: 700 }}>
              →
            </motion.span>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---- Interactive: Word2Vec Arithmetic ---- */
function Word2VecArithmetic() {
  const [step, setStep] = useState(0)
  const maxStep = 4

  const stages = [
    { label: 'King', vector: '👑 King', color: '#4f46e5', op: '', desc: 'Start with the vector for "King"' },
    { label: '- Man', vector: '👨 Man', color: '#ef4444', op: '−', desc: 'Subtract the "Man" direction' },
    { label: '+ Woman', vector: '👩 Woman', color: '#10b981', op: '+', desc: 'Add the "Woman" direction' },
    { label: '= ???', vector: '❓', color: '#f97316', op: '=', desc: 'What do we get?' },
    { label: '= Queen!', vector: '👸 Queen!', color: '#ec4899', op: '=', desc: 'The nearest vector is "Queen"!' },
  ]

  return (
    <div>
      {/* Vector equation display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
        {stages.slice(0, step + 1).map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {s.op && (
              <span style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.op}</span>
            )}
            <div style={{
              padding: '14px 22px', borderRadius: 14,
              background: `${s.color}15`, border: `2px solid ${s.color}44`,
              fontSize: 20, fontWeight: 700, color: s.color,
            }}>
              {s.vector}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Description */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', fontWeight: 600 }}>
          {stages[step].desc}
        </p>
      </div>

      {/* Arrow space visual */}
      <div style={{
        position: 'relative', width: '100%', height: 180,
        background: 'var(--bg-secondary)', borderRadius: 16, marginBottom: 24,
        border: '1px solid var(--border)', overflow: 'hidden',
      }}>
        {/* King vector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 0 ? 1 : 0 }}
          style={{ position: 'absolute', left: '15%', top: '25%' }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#4f46e5' }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', marginTop: 4 }}>King</div>
        </motion.div>

        {/* Man direction arrow */}
        {step >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: 'absolute', left: '15%', top: '25%', width: '25%', height: 2, background: '#ef4444', transformOrigin: 'left center', transform: 'rotate(30deg)' }}>
            <div style={{ position: 'absolute', right: -6, top: -4, fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Man</div>
          </motion.div>
        )}

        {/* Woman direction arrow */}
        {step >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: 'absolute', left: '15%', top: '25%', width: '28%', height: 2, background: '#10b981', transformOrigin: 'left center', transform: 'rotate(-15deg)' }}>
            <div style={{ position: 'absolute', right: -6, top: -4, fontSize: 11, color: '#10b981', fontWeight: 600 }}>Woman</div>
          </motion.div>
        )}

        {/* Result point */}
        {step >= 3 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            style={{ position: 'absolute', left: '68%', top: '55%' }}
          >
            <motion.div
              animate={step >= 4 ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: step >= 4 ? Infinity : 0, duration: 1.5 }}
              style={{ width: 16, height: 16, borderRadius: '50%', background: step >= 4 ? '#ec4899' : '#f97316', boxShadow: `0 0 12px ${step >= 4 ? '#ec4899' : '#f97316'}55` }}
            />
            <div style={{ fontSize: 13, fontWeight: 700, color: step >= 4 ? '#ec4899' : '#f97316', marginTop: 4 }}>
              {step >= 4 ? 'Queen!' : '???'}
            </div>
          </motion.div>
        )}

        {/* Dashed result arrow */}
        {step >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
            style={{ position: 'absolute', left: '15%', top: '25%', width: '53%', height: 2, borderTop: '2px dashed #f97316', transformOrigin: 'left center', transform: 'rotate(15deg)' }}
          />
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            padding: '10px 24px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--bg-card)', fontSize: 15, fontWeight: 600,
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            opacity: step === 0 ? 0.4 : 1, color: 'var(--text-primary)',
          }}>
          Back
        </button>
        <button onClick={() => setStep(Math.min(maxStep, step + 1))}
          disabled={step === maxStep}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: step === maxStep ? 'var(--border)' : '#4f46e5',
            color: 'white', fontSize: 15, fontWeight: 600,
            cursor: step === maxStep ? 'not-allowed' : 'pointer',
            opacity: step === maxStep ? 0.5 : 1,
          }}>
          {step < maxStep ? 'Next Step →' : 'Complete!'}
        </button>
      </div>
    </div>
  )
}

/* ---- Interactive: Similarity Calculator ---- */
function SimilarityCalculator() {
  const words = [
    { word: 'cat', vec: [0.7, 0.3, -0.2, 0.5] },
    { word: 'dog', vec: [0.65, 0.35, -0.15, 0.55] },
    { word: 'car', vec: [-0.3, 0.8, 0.6, -0.1] },
    { word: 'king', vec: [0.4, -0.5, 0.7, 0.3] },
    { word: 'queen', vec: [0.42, -0.48, 0.72, 0.35] },
    { word: 'happy', vec: [0.1, 0.2, -0.6, 0.8] },
    { word: 'sad', vec: [-0.15, 0.18, -0.55, -0.7] },
    { word: 'truck', vec: [-0.28, 0.78, 0.58, -0.12] },
  ]
  const [wordA, setWordA] = useState(0)
  const [wordB, setWordB] = useState(1)

  const cosineSim = (a, b) => {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0)
    const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
    const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0))
    return dot / (magA * magB)
  }

  const sim = cosineSim(words[wordA].vec, words[wordB].vec)
  const simPct = ((sim + 1) / 2 * 100).toFixed(0)
  const simColor = sim > 0.8 ? '#10b981' : sim > 0.4 ? '#f97316' : '#ef4444'
  const simLabel = sim > 0.8 ? 'Very Similar' : sim > 0.4 ? 'Somewhat Related' : sim < 0 ? 'Opposite Meanings' : 'Not Very Related'

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 28, justifyContent: 'center' }}>
        {/* Word A */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Word A</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {words.map((w, i) => (
              <motion.button key={w.word} onClick={() => setWordA(i)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                  border: wordA === i ? '2px solid #4f46e5' : '1px solid var(--border)',
                  background: wordA === i ? '#4f46e515' : 'var(--bg-card)',
                  color: wordA === i ? '#4f46e5' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}>
                {w.word}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Word B */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Word B</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {words.map((w, i) => (
              <motion.button key={w.word} onClick={() => setWordB(i)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                  border: wordB === i ? '2px solid #0ea5e9' : '1px solid var(--border)',
                  background: wordB === i ? '#0ea5e915' : 'var(--bg-card)',
                  color: wordB === i ? '#0ea5e9' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}>
                {w.word}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <motion.div key={`${wordA}-${wordB}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: 28, background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16, fontSize: 22, fontWeight: 700 }}>
          <span style={{ color: '#4f46e5' }}>{words[wordA].word}</span>
          <span style={{ color: 'var(--text-muted)' }}>vs</span>
          <span style={{ color: '#0ea5e9' }}>{words[wordB].word}</span>
        </div>

        {/* Similarity bar */}
        <div style={{ maxWidth: 400, margin: '0 auto', marginBottom: 16 }}>
          <div style={{ height: 14, background: 'var(--bg-card)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, parseFloat(simPct))}%` }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{ height: '100%', background: simColor, borderRadius: 8 }}
            />
          </div>
        </div>

        <div style={{ fontSize: 32, fontWeight: 800, color: simColor, fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
          {sim.toFixed(3)}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: simColor }}>
          {simLabel}
        </div>

        {/* Vector comparison */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#4f46e5', padding: '8px 14px', background: '#4f46e510', borderRadius: 8 }}>
            {words[wordA].word}: [{words[wordA].vec.join(', ')}]
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#0ea5e9', padding: '8px 14px', background: '#0ea5e910', borderRadius: 8 }}>
            {words[wordB].word}: [{words[wordB].vec.join(', ')}]
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ---- Visual: Vector Database Nearest Neighbor ---- */
function VectorDatabaseVisual() {
  const [querying, setQuerying] = useState(false)
  const dots = [
    { x: 20, y: 30, label: 'doc1' }, { x: 25, y: 38, label: 'doc2' },
    { x: 60, y: 70, label: 'doc3' }, { x: 65, y: 65, label: 'doc4' },
    { x: 62, y: 75, label: 'doc5' }, { x: 80, y: 20, label: 'doc6' },
    { x: 85, y: 25, label: 'doc7' }, { x: 40, y: 50, label: 'doc8' },
    { x: 15, y: 75, label: 'doc9' }, { x: 50, y: 40, label: 'doc10' },
    { x: 35, y: 18, label: 'doc11' }, { x: 70, y: 45, label: 'doc12' },
  ]
  const queryPoint = { x: 58, y: 68 }
  const nearestIndices = [2, 3, 4]

  const products = [
    { name: 'Pinecone', color: '#4f46e5', desc: 'Managed cloud vector DB' },
    { name: 'ChromaDB', color: '#10b981', desc: 'Open-source, developer-friendly' },
    { name: 'Weaviate', color: '#0ea5e9', desc: 'Open-source with ML modules' },
    { name: 'Qdrant', color: '#ec4899', desc: 'Rust-powered, high performance' },
  ]

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', height: 320, background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 20 }}>
        {/* All stored docs as dots */}
        {dots.map((dot, i) => (
          <motion.div key={dot.label}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            style={{
              position: 'absolute', left: `${dot.x}%`, bottom: `${dot.y}%`,
              transform: 'translate(-50%, 50%)',
            }}
          >
            <div style={{
              width: querying && nearestIndices.includes(i) ? 16 : 10,
              height: querying && nearestIndices.includes(i) ? 16 : 10,
              borderRadius: '50%',
              background: querying && nearestIndices.includes(i) ? '#10b981' : '#94a3b8',
              boxShadow: querying && nearestIndices.includes(i) ? '0 0 12px #10b98166' : 'none',
              transition: 'all 0.5s',
            }} />
            {querying && nearestIndices.includes(i) && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textAlign: 'center', marginTop: 2 }}>
                Match!
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Query point */}
        {querying && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            style={{
              position: 'absolute', left: `${queryPoint.x}%`, bottom: `${queryPoint.y}%`,
              transform: 'translate(-50%, 50%)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ width: 18, height: 18, borderRadius: '50%', background: '#f97316', boxShadow: '0 0 16px #f9731666' }}
            />
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', textAlign: 'center', whiteSpace: 'nowrap', marginTop: 4 }}>Query</div>
          </motion.div>
        )}

        {/* Connecting lines to nearest */}
        {querying && nearestIndices.map(idx => (
          <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
            style={{
              position: 'absolute',
              left: `${queryPoint.x}%`, bottom: `${queryPoint.y}%`,
              width: `${Math.sqrt(Math.pow(dots[idx].x - queryPoint.x, 2) + Math.pow(dots[idx].y - queryPoint.y, 2))}%`,
              height: 2, background: '#10b981',
              transformOrigin: 'left center',
              transform: `rotate(${-Math.atan2(dots[idx].y - queryPoint.y, dots[idx].x - queryPoint.x) * 180 / Math.PI}deg)`,
            }}
          />
        ))}

        {/* Instructions overlay */}
        {!querying && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
              Each dot is a document embedding stored in the vector database
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <motion.button
          onClick={() => setQuerying(!querying)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 32px', borderRadius: 12, border: 'none',
            background: querying ? '#ef4444' : '#4f46e5', color: 'white',
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {querying ? 'Reset' : 'Run Query: Find Nearest Neighbors'}
        </motion.button>
      </div>

      {/* Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {products.map(p => (
          <motion.div key={p.name} whileHover={{ y: -4 }}
            style={{ padding: 18, background: `${p.color}10`, borderRadius: 14, border: `1px solid ${p.color}22`, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: p.color, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ---- Interactive: Keyword vs Semantic Search ---- */
function KeywordVsSemanticSearch() {
  const [query, setQuery] = useState(null)
  const queries = [
    {
      text: 'How to fix a broken heart',
      keyword: [
        { title: 'Heart Surgery Recovery Guide', icon: '🏥', relevant: false },
        { title: 'Fixing Broken Pottery with Gold', icon: '🏺', relevant: false },
        { title: 'Heart Disease Prevention Tips', icon: '💊', relevant: false },
      ],
      semantic: [
        { title: 'Coping with a Breakup: A Guide', icon: '💔', relevant: true },
        { title: 'Moving On After Heartbreak', icon: '🌅', relevant: true },
        { title: 'Healing Emotional Pain', icon: '🧠', relevant: true },
      ],
    },
    {
      text: 'Best way to get to the top',
      keyword: [
        { title: 'Rooftop Access Installation Guide', icon: '🏗️', relevant: false },
        { title: 'Best Ladders for Home Use', icon: '🪜', relevant: false },
        { title: 'Top Floor Elevator Buttons', icon: '🛗', relevant: false },
      ],
      semantic: [
        { title: 'Career Advancement Strategies', icon: '📈', relevant: true },
        { title: 'Leadership Skills for Success', icon: '🎯', relevant: true },
        { title: 'How Successful CEOs Got There', icon: '👔', relevant: true },
      ],
    },
    {
      text: 'Python biting issues',
      keyword: [
        { title: 'Snake Bite First Aid', icon: '🐍', relevant: false },
        { title: 'Dealing with Pet Python Aggression', icon: '🦎', relevant: false },
        { title: 'Venomous Python Species', icon: '☠️', relevant: false },
      ],
      semantic: [
        { title: 'Common Python Programming Errors', icon: '🐛', relevant: true },
        { title: 'Debugging Tricky Python Bugs', icon: '🔍', relevant: true },
        { title: 'Python Performance Gotchas', icon: '⚡', relevant: true },
      ],
    },
  ]

  return (
    <div>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20, textAlign: 'center' }}>
        Pick a query and see how keyword search and semantic search return very different results:
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, justifyContent: 'center' }}>
        {queries.map((q, i) => (
          <motion.button key={i} onClick={() => setQuery(i)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600,
              border: query === i ? '2px solid #4f46e5' : '1px solid var(--border)',
              background: query === i ? '#4f46e515' : 'var(--bg-card)',
              color: query === i ? '#4f46e5' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}>
            "{q.text}"
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {query !== null && (
          <motion.div key={query} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Keyword results */}
            <div style={{ padding: 24, background: '#fef2f2', borderRadius: 18, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                Keyword Search
              </div>
              {queries[query].keyword.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.7)', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#ef4444', fontWeight: 600 }}>miss</span>
                </motion.div>
              ))}
              <div style={{ marginTop: 12, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
                Matches exact words, misses the meaning entirely.
              </div>
            </div>

            {/* Semantic results */}
            <div style={{ padding: 24, background: '#f0fdf4', borderRadius: 18, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                Semantic Search (Embeddings)
              </div>
              {queries[query].semantic.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.7)', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#10b981', fontWeight: 600 }}>hit</span>
                </motion.div>
              ))}
              <div style={{ marginTop: 12, fontSize: 13, color: '#166534', fontWeight: 600 }}>
                Understands meaning, finds what you actually want.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Real-Life Uses Flow Diagrams ---- */
function RealLifeUseCases() {
  const [active, setActive] = useState(0)
  const cases = [
    {
      icon: '🔍', title: 'Semantic Search', color: '#4f46e5', bg: '#ede9fe',
      desc: 'Search by meaning, not just keywords. "Feeling under the weather" finds results about being sick.',
      flow: ['User query', 'Embed query', 'Find nearest vectors', 'Return relevant docs'],
    },
    {
      icon: '🎯', title: 'Recommendations', color: '#0ea5e9', bg: '#e0f2fe',
      desc: 'Netflix, Spotify, Amazon: embed user preferences and item descriptions, find closest matches.',
      flow: ['Embed user taste', 'Embed all items', 'Find closest items', 'Recommend top matches'],
    },
    {
      icon: '🔁', title: 'Duplicate Detection', color: '#10b981', bg: '#d1fae5',
      desc: 'Find near-duplicate support tickets, articles, or products even when wording differs completely.',
      flow: ['Embed new content', 'Compare to existing', 'Flag high similarity', 'Merge duplicates'],
    },
    {
      icon: '🤖', title: 'RAG Systems', color: '#f97316', bg: '#fff7ed',
      desc: 'Retrieval-Augmented Generation: give LLMs access to your private data by searching embeddings first.',
      flow: ['User asks question', 'Embed & search docs', 'Feed context to LLM', 'Generate grounded answer'],
    },
  ]
  const c = cases[active]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {cases.map((item, i) => (
          <motion.button key={i} onClick={() => setActive(i)} whileHover={{ y: -3 }}
            style={{
              padding: 16, borderRadius: 16, border: `2px solid ${active === i ? item.color : 'var(--border)'}`,
              background: active === i ? item.bg : 'var(--bg-card)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
            }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: active === i ? item.color : 'var(--text-secondary)' }}>{item.title}</div>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          style={{ background: c.bg, borderRadius: 18, padding: 28, border: `1px solid ${c.color}33` }}>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>{c.desc}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {c.flow.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.75)', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  {step}
                </div>
                {i < c.flow.length - 1 && (
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ color: c.color, fontWeight: 700, fontSize: 18 }}>→</motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic13_Embeddings() {
  return (
    <div>
      {/* Neuron Welcome */}
      <div style={{ marginBottom: 40 }}>
        <Neuron mood="excited" size="large" typed
          message="How does AI know that 'king' and 'queen' are related? Or that 'happy' and 'joyful' mean the same thing? The answer is Embeddings -- the secret language of AI. Instead of reading words like we do, AI converts everything into numbers that capture meaning. Let me show you!"
        />
      </div>

      {/* What Are Embeddings */}
      <SectionBlock icon="📍" title="What Are Embeddings?" color="#4f46e5">
        <Neuron mood="explaining" size="small"
          message="Think of embeddings as GPS coordinates -- but for meaning. Every word gets a location in 'meaning-space'. Words with similar meanings end up close together, like houses in the same neighborhood."
        />

        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 28 }}>
            {[
              { emoji: '🗺️', title: 'Real GPS', desc: 'Paris: (48.85, 2.35)\nLondon: (51.51, -0.13)\nClose on map = close in location', color: '#4f46e5' },
              { emoji: '🧠', title: 'Meaning GPS', desc: '"happy": [0.8, 0.3, ...]\n"joyful": [0.79, 0.31, ...]\nClose in vector space = close in meaning', color: '#0ea5e9' },
            ].map(card => (
              <motion.div key={card.title} whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
                style={{ padding: 24, background: `${card.color}08`, borderRadius: 16, border: `1px solid ${card.color}22` }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{card.emoji}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: card.color, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{card.desc}</div>
              </motion.div>
            ))}
          </div>

          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20, textAlign: 'center' }}>
            Below is a 2D map of word embeddings. Notice how words with similar meanings form <strong>clusters</strong>:
          </p>

          <WordClusterPlot />
        </div>

        <NeuronTip type="simple">
          <strong>Imagine a huge library.</strong> Instead of organizing books alphabetically, you organize them by topic. "Dog Training" sits next to "Puppy Care", not next to "Dogwood Trees". That's what embeddings do -- organize by meaning, not spelling.
        </NeuronTip>
      </SectionBlock>

      {/* How Embeddings Are Created */}
      <SectionBlock icon="🔧" title="How Embeddings Are Created" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 16 }}>
          A neural network learns to convert words into vectors (lists of numbers). Each number represents a different aspect of meaning -- gender, formality, topic, and hundreds more dimensions.
        </p>

        <EmbeddingPipeline />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 24 }}>
          {[
            { dim: 'Dimension 1', meaning: 'Royalty', example: 'king: 0.9, peasant: 0.1', color: '#4f46e5' },
            { dim: 'Dimension 2', meaning: 'Gender', example: 'queen: 0.9, king: 0.1', color: '#ec4899' },
            { dim: 'Dimension 3', meaning: 'Size', example: 'elephant: 0.95, ant: 0.05', color: '#10b981' },
            { dim: 'Dim 4...768', meaning: 'Abstract features', example: 'Hundreds more subtle patterns', color: '#f97316' },
          ].map(d => (
            <motion.div key={d.dim} whileHover={{ y: -3 }}
              style={{ padding: 18, background: `${d.color}08`, borderRadius: 14, border: `1px solid ${d.color}20` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: d.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.dim}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{d.meaning}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.example}</div>
            </motion.div>
          ))}
        </div>

        <NeuronTip type="deep">
          Modern embedding models like OpenAI's text-embedding-3-large use <strong>3,072 dimensions</strong>. That's 3,072 numbers per word or sentence! Older models like Word2Vec used 300 dimensions. More dimensions = more nuance captured, but more storage and compute needed.
        </NeuronTip>
      </SectionBlock>

      {/* Word2Vec Arithmetic */}
      <InteractiveDemo title="Word2Vec: The Famous Vector Arithmetic" instruction="Step through the most famous example in NLP: King - Man + Woman = Queen. Watch vectors add and subtract!">
        <Word2VecArithmetic />
      </InteractiveDemo>

      {/* Similarity Calculator */}
      <InteractiveDemo title="Similarity Calculator" instruction="Pick two words and see how similar their embeddings are using cosine similarity.">
        <SimilarityCalculator />
      </InteractiveDemo>

      {/* Sentence vs Word Embeddings */}
      <SectionBlock icon="📝" title="Sentence Embeddings vs Word Embeddings" color="#0ea5e9">
        <Neuron mood="thinking" size="small"
          message="Word embeddings are great, but they miss context. The word 'bank' means different things in 'river bank' vs 'bank account'. Sentence embeddings solve this by encoding the whole sentence at once."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 24 }}>
          <motion.div whileHover={{ y: -4 }}
            style={{ padding: 24, background: '#f97316' + '08', borderRadius: 16, border: '1px solid #f9731622' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f97316', marginBottom: 12 }}>Word Embeddings (Word2Vec, GloVe)</div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Each word gets ONE fixed vector regardless of context.
            </div>
            <div style={{ marginTop: 14, padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>
              "bank" → always [0.3, -0.5, ...] whether river or money
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Fast', 'Simple', 'No context'].map(tag => (
                <span key={tag} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: '#f9731615', color: '#f97316', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}
            style={{ padding: 24, background: '#10b981' + '08', borderRadius: 16, border: '1px solid #10b98122' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>Sentence Embeddings (BERT, OpenAI)</div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              The whole sentence is embedded together, capturing context and relationships.
            </div>
            <div style={{ marginTop: 14, padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>
              "I sat by the river bank" → [0.1, 0.8, ...] (nature)<br />
              "I went to the bank" → [-0.3, 0.2, ...] (finance)
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Context-aware', 'More accurate', 'Industry standard'].map(tag => (
                <span key={tag} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: '#10b98115', color: '#10b981', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </motion.div>
        </div>

        <NeuronTip type="example">
          <strong>Why sentence embeddings win for search:</strong> If you search for "How to fix a leaky faucet", word embeddings might match "faucet repair manual" but miss "plumbing drip solution guide". Sentence embeddings understand the full meaning and find both.
        </NeuronTip>
      </SectionBlock>

      {/* Vector Databases */}
      <SectionBlock icon="🗄️" title="Vector Databases: Search at Scale" color="#10b981">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
          Once you have millions of embeddings, you need a <strong>vector database</strong> to store them and find the nearest neighbors blazingly fast. Click the button below to simulate a query:
        </p>
        <VectorDatabaseVisual />

        <NeuronTip type="tip">
          Vector databases use special algorithms like <strong>HNSW</strong> (Hierarchical Navigable Small World) and <strong>IVF</strong> (Inverted File Index) to search billions of vectors in milliseconds. A brute-force search would take minutes.
        </NeuronTip>
      </SectionBlock>

      {/* Real-Life Uses */}
      <SectionBlock icon="🌍" title="Real-Life Uses of Embeddings" color="#f97316">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
          Embeddings power some of the most impactful AI applications. Tap each use case:
        </p>
        <RealLifeUseCases />
      </SectionBlock>

      {/* Keyword vs Semantic Search */}
      <InteractiveDemo title="Keyword Search vs Semantic Search" instruction="See the dramatic difference: keyword search matches exact words, semantic search understands meaning.">
        <KeywordVsSemanticSearch />
      </InteractiveDemo>

      {/* Technical Tips */}
      <SectionBlock icon="🔬" title="Technical Deep Dive" color="#8b5cf6">
        <NeuronTip type="deep">
          <strong>Cosine Similarity Formula:</strong> The angle between two vectors determines similarity. cos(A,B) = (A . B) / (||A|| x ||B||). A score of 1.0 means identical direction (same meaning), 0 means unrelated, and -1 means opposite.
        </NeuronTip>

        <NeuronTip type="tip">
          <strong>Choosing embedding dimensions:</strong> 256d is fast but loses nuance. 768d (BERT) is the sweet spot for most tasks. 3072d (OpenAI large) captures the finest distinctions. More dimensions = better quality but higher cost and latency.
        </NeuronTip>

        <NeuronTip type="fun">
          <strong>Embedding models are surprisingly small.</strong> While GPT-4 has ~1.7 trillion parameters, a good embedding model like all-MiniLM-L6-v2 has only 22 million parameters and runs on a laptop. Small model, huge impact!
        </NeuronTip>
      </SectionBlock>

      {/* Key Takeaways */}
      <SectionBlock icon="🎯" title="Key Takeaways" color="#10b981">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {[
            { num: '01', text: 'Embeddings convert words and sentences into vectors (lists of numbers) that capture meaning.', color: '#4f46e5' },
            { num: '02', text: 'Similar meanings = close vectors. This enables semantic search, recommendations, and more.', color: '#0ea5e9' },
            { num: '03', text: 'Vector databases store millions of embeddings and find nearest neighbors in milliseconds.', color: '#10b981' },
            { num: '04', text: 'Embeddings are the backbone of RAG systems, enabling LLMs to access your private data.', color: '#f97316' },
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
          message="Awesome work! You now understand embeddings -- the hidden language AI uses to understand meaning. From search engines to recommendation systems, embeddings are everywhere. Next up: AI Agents that can actually DO things in the real world!"
        />
      </div>
    </div>
  )
}
