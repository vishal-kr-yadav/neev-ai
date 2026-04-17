import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LossLandscapeScene from '../../../components/three/LossLandscapeScene'

const stages = [
  {
    id: 'pretrain', num: 1, title: 'Pre-training', icon: '📖', color: '#4f46e5',
    desc: 'Learn language from massive text data',
    detail: 'The model reads the entire internet — books, websites, code — and learns to predict the next word.',
    data: ['Wikipedia', 'Books', 'Websites', 'Code', 'Papers'],
    cost: '$2M - $100M+', time: 'Weeks to months',
  },
  {
    id: 'sft', num: 2, title: 'Supervised Fine-Tuning', icon: '🎯', color: '#0ea5e9',
    desc: 'Learn to follow instructions',
    detail: 'Human trainers write example conversations. The model learns the format of good, helpful responses.',
    data: ['Q&A pairs', 'Instructions', 'Conversations'],
    cost: '$10K - $1M', time: 'Days',
  },
  {
    id: 'rlhf', num: 3, title: 'RLHF', icon: '👍', color: '#ec4899',
    desc: 'Learn from human preferences',
    detail: 'Humans rank outputs best to worst. A reward model learns preferences, then the LLM optimizes for higher scores.',
    data: ['Human rankings', 'Preference data'],
    cost: '$50K - $500K', time: 'Days to weeks',
  },
]

export default function Topic5_Training() {
  const [activeStage, setActiveStage] = useState('pretrain')
  const [loss, setLoss] = useState(4.0)
  const [isTraining, setIsTraining] = useState(false)
  const stage = stages.find((s) => s.id === activeStage)

  useEffect(() => {
    if (!isTraining) return
    const iv = setInterval(() => {
      setLoss((p) => {
        const n = p - (Math.random() * 0.15 + 0.05)
        if (n <= 0.3) { setIsTraining(false); return 0.3 }
        return n
      })
    }, 200)
    return () => clearInterval(iv)
  }, [isTraining])

  return (
    <div>
      {/* 3D Loss Landscape */}
      <div style={{ marginBottom: 32 }}>
        <LossLandscapeScene />
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          🖱️ Orbit the 3D loss landscape. The red ball (gradient descent) rolls downhill to find the green minimum — this is how models learn!
        </p>
      </div>

      {/* Analogy */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Training = <span style={{ color: '#818cf8' }}>Going to School</span>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          {[
            { label: 'Pre-training', analogy: 'Reading all textbooks', emoji: '📚' },
            { label: 'Fine-tuning', analogy: 'Practice problems', emoji: '✏️' },
            { label: 'RLHF', analogy: 'Teacher feedback', emoji: '👩‍🏫' },
          ].map((a, i) => (
            <div key={a.label} style={{
              padding: 20, background: 'var(--bg-secondary)', borderRadius: 14,
              flex: '1 1 150px', maxWidth: 200,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{a.emoji}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: stages[i].color }}>{a.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{a.analogy}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {stages.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              whileHover={{ scale: 1.03 }}
              style={{
                flex: 1, minWidth: 160, padding: '16px 20px', borderRadius: 14, textAlign: 'left',
                border: activeStage === s.id ? `2px solid ${s.color}` : '2px solid var(--border)',
                background: activeStage === s.id ? `${s.color}15` : 'var(--bg-secondary)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>Stage {s.num}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: 24, background: 'var(--bg-secondary)', borderRadius: 14,
              borderLeft: `3px solid ${stage.color}`,
            }}
          >
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
              {stage.detail}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Data</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {stage.data.map((d) => (
                    <span key={d} style={{ padding: '4px 10px', background: `${stage.color}22`, borderRadius: 6, fontSize: 12, color: stage.color }}>{d}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Cost</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: stage.color }}>{stage.cost}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Duration</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: stage.color }}>{stage.time}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loss simulator */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Training Loss Simulator</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Watch the model improve as loss decreases</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => { setLoss(4.0); setIsTraining(true) }}
            style={{
              padding: '10px 22px', background: 'var(--gradient-primary)', border: 'none',
              borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {isTraining ? '⏳ Training...' : '▶ Train'}
          </motion.button>
        </div>

        <div style={{ position: 'relative', height: 180, background: 'var(--bg-secondary)', borderRadius: 14, padding: 20, overflow: 'hidden' }}>
          {[0, 1, 2, 3, 4].map((v) => (
            <div key={v} style={{ position: 'absolute', left: 36, right: 16, bottom: `${(v / 4) * 100}%`, borderBottom: '1px dashed var(--border)' }}>
              <span style={{ position: 'absolute', left: -30, top: -8, fontSize: 10, color: 'var(--text-muted)' }}>{v}</span>
            </div>
          ))}
          <motion.div
            animate={{ bottom: `${(loss / 4) * 100}%` }}
            style={{ position: 'absolute', left: 36, right: 16 }}
          >
            <div style={{
              position: 'absolute', right: 0, top: -14, width: 28, height: 28, borderRadius: '50%',
              background: loss > 2.5 ? '#ef4444' : loss > 1 ? '#f59e0b' : '#10b981',
              boxShadow: `0 0 16px ${loss > 2.5 ? '#ef4444' : loss > 1 ? '#f59e0b' : '#10b981'}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#000',
            }}>
              {loss.toFixed(1)}
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
          {[{ c: '#ef4444', l: 'High (bad)' }, { c: '#f59e0b', l: 'Improving' }, { c: '#10b981', l: 'Low (good)' }].map((i) => (
            <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: i.c }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{i.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
