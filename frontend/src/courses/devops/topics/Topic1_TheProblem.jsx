import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 1 — The Problem: "Works On My Machine"
   Visual storytelling: A cinematic journey through deployment chaos
================================================================ */

/* ---- Scene 1: The Developer's Nightmare ---- */
function ChaosSimulator() {
  const [step, setStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const scenes = [
    {
      title: 'Dev writes code',
      emoji: '👨‍💻',
      env: 'LAPTOP',
      envColor: '#10b981',
      status: 'PASSING',
      statusColor: '#10b981',
      packages: ['Node 18.2', 'Python 3.11', 'Redis 7.0', 'Ubuntu 22'],
      message: '"All tests pass! Ship it!"',
    },
    {
      title: 'QA gets the code',
      emoji: '🧪',
      env: 'QA SERVER',
      envColor: '#f59e0b',
      status: 'FAILING',
      statusColor: '#ef4444',
      packages: ['Node 16.4', 'Python 3.9', 'Redis 6.2', 'CentOS 7'],
      message: '"Module not found... what?!"',
    },
    {
      title: 'Production deploy',
      emoji: '🔥',
      env: 'PRODUCTION',
      envColor: '#ef4444',
      status: 'CRASHED',
      statusColor: '#ef4444',
      packages: ['Node 14.0', 'Python 3.8', 'No Redis', 'Amazon Linux'],
      message: '"EVERYTHING IS ON FIRE"',
    },
    {
      title: 'The classic response',
      emoji: '🤷',
      env: 'SLACK',
      envColor: '#8b5cf6',
      status: '???',
      statusColor: '#8b5cf6',
      packages: [],
      message: '"But it works on MY machine..."',
    },
  ]

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setStep(s => (s + 1) % scenes.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [autoPlay])

  const scene = scenes[step]

  return (
    <div style={{ position: 'relative' }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {scenes.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => { setStep(i); setAutoPlay(false) }}
            animate={{
              width: i === step ? 32 : 10,
              background: i === step ? 'var(--accent)' : 'var(--border)',
            }}
            style={{
              height: 10, borderRadius: 5, border: 'none', cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -80, scale: 0.95 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 20,
            border: `2px solid ${scene.envColor}30`,
            overflow: 'hidden',
          }}
        >
          {/* Header bar */}
          <div style={{
            background: `linear-gradient(135deg, ${scene.envColor}15, ${scene.envColor}08)`,
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${scene.envColor}20`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 42 }}
              >
                {scene.emoji}
              </motion.div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
                  {scene.title}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                  borderRadius: 100, background: `${scene.envColor}18`, color: scene.envColor,
                  fontSize: 12, fontWeight: 700, letterSpacing: 1, marginTop: 4,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: scene.envColor }} />
                  {scene.env}
                </div>
              </div>
            </div>
            <motion.div
              animate={scene.status === 'CRASHED' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{
                padding: '8px 20px', borderRadius: 10,
                background: `${scene.statusColor}15`,
                color: scene.statusColor,
                fontWeight: 700, fontSize: 15,
                fontFamily: 'monospace',
                border: `1px solid ${scene.statusColor}30`,
              }}
            >
              {scene.status}
            </motion.div>
          </div>

          {/* Body */}
          <div style={{ padding: 28 }}>
            {/* Packages comparison */}
            {scene.packages.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                {scene.packages.map((pkg, i) => (
                  <motion.div
                    key={pkg}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      padding: '12px 14px', borderRadius: 10,
                      background: step === 0 ? '#d1fae510' : '#fee2e210',
                      border: `1px solid ${step === 0 ? '#10b98130' : '#ef444430'}`,
                      fontFamily: 'monospace', fontSize: 13, fontWeight: 600,
                      color: step === 0 ? '#10b981' : '#ef4444',
                      textAlign: 'center',
                    }}
                  >
                    {pkg}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Message bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                padding: '18px 24px', borderRadius: 16,
                background: `linear-gradient(135deg, ${scene.envColor}08, ${scene.envColor}04)`,
                border: `1px dashed ${scene.envColor}30`,
                fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600,
                color: 'var(--text-primary)', textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              {scene.message}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Scene 2: Environment Drift Visual ---- */
function EnvironmentDrift() {
  const [showDrift, setShowDrift] = useState(false)

  const machines = [
    { name: 'Dev Laptop', os: 'macOS 14', node: '20.1', python: '3.12', ram: '32GB', icon: '💻' },
    { name: 'CI Server', os: 'Ubuntu 22', node: '18.5', python: '3.10', ram: '8GB', icon: '🖥️' },
    { name: 'Staging', os: 'Debian 11', node: '16.9', python: '3.9', ram: '4GB', icon: '🧪' },
    { name: 'Production', os: 'Amazon Linux', node: '14.0', python: '3.8', ram: '2GB', icon: '🌐' },
  ]

  const fields = ['os', 'node', 'python', 'ram']

  return (
    <div>
      <motion.button
        onClick={() => setShowDrift(!showDrift)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'block', margin: '0 auto 28px', padding: '14px 32px',
          background: showDrift ? '#ef4444' : 'var(--accent)', color: 'white',
          border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16,
          cursor: 'pointer', fontFamily: 'var(--font-heading)',
        }}
      >
        {showDrift ? '😱 See the Drift!' : '🔍 Compare Environments'}
      </motion.button>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
      }}>
        {machines.map((m, mi) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mi * 0.1 }}
            style={{
              background: 'var(--bg-card)', borderRadius: 16,
              border: `1px solid ${showDrift && mi > 0 ? '#ef444440' : 'var(--border)'}`,
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '16px 18px', textAlign: 'center',
              background: showDrift && mi > 0 ? '#fef2f210' : `var(--accent)08`,
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{m.name}</div>
            </div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map(f => (
                <div key={f} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{f}</span>
                  <motion.span
                    animate={showDrift && mi > 0 ? {
                      color: ['var(--text-primary)', '#ef4444', 'var(--text-primary)'],
                    } : {}}
                    transition={{ duration: 1.5, repeat: showDrift ? Infinity : 0 }}
                    style={{
                      fontFamily: 'monospace', fontSize: 12, fontWeight: 600,
                      color: showDrift && m[f] !== machines[0][f] ? '#ef4444' : 'var(--text-primary)',
                    }}
                  >
                    {m[f]}
                  </motion.span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showDrift && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 20, padding: '18px 24px', borderRadius: 14,
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '1px solid #fca5a5',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
              Every machine is different!
            </div>
            <div style={{ fontSize: 14, color: '#b91c1c' }}>
              Different OS, different versions, different configs — this is why things break in production.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Scene 3: Cost of Failure Animation ---- */
function FailureCost() {
  const [fired, setFired] = useState(false)

  const costs = [
    { label: 'Downtime', value: '$5,600/min', icon: '⏱️', delay: 0 },
    { label: 'Lost Revenue', value: '$300K/hr', icon: '💸', delay: 0.2 },
    { label: 'Customer Trust', value: 'Priceless', icon: '💔', delay: 0.4 },
    { label: 'Dev Time Wasted', value: '40%', icon: '🔄', delay: 0.6 },
    { label: 'Incident Response', value: '$12K avg', icon: '🚨', delay: 0.8 },
    { label: 'Team Morale', value: '📉', icon: '😤', delay: 1.0 },
  ]

  return (
    <div>
      <motion.button
        onClick={() => setFired(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'block', margin: '0 auto 28px', padding: '16px 36px',
          background: fired ? '#dc2626' : 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white', border: 'none', borderRadius: 14, fontWeight: 700,
          fontSize: 17, cursor: 'pointer', fontFamily: 'var(--font-heading)',
          boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
        }}
      >
        {fired ? '💥 DEPLOYED TO PRODUCTION' : '🚀 Deploy to Production'}
      </motion.button>

      <AnimatePresence>
        {fired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
            }}
          >
            {costs.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: c.delay, type: 'spring', stiffness: 200 }}
                style={{
                  padding: '20px 18px', background: 'var(--bg-card)',
                  border: '1px solid #fca5a5', borderRadius: 14,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>{c.value}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {fired && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          style={{
            marginTop: 24, padding: '20px 28px', borderRadius: 14,
            background: 'linear-gradient(135deg, #ede9fe, #e0f2fe)',
            border: '1px solid var(--accent-light)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
            What if we could guarantee identical environments everywhere?
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            That's exactly what containers solve. Keep watching...
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic1_TheProblem() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Opening Scene */}
      <Neuron mood="thinking" typed message="Picture this: you've been coding for weeks. Every test passes. You're confident. You hit deploy. And then... chaos. Sound familiar? Let me show you the BIGGEST problem in software deployment." />

      <SectionBlock title="The Deployment Disaster" icon="🎬">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Watch how the same code behaves on different machines:
        </p>
        <InteractiveDemo title="The Journey of Your Code">
          <ChaosSimulator />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="explaining">
        The same code. Different results. Why? Because every machine has different operating systems, different library versions, different configurations. This is called <strong>environment drift</strong> — and it's the #1 cause of production failures.
      </NeuronTip>

      <SectionBlock title="Environment Drift" icon="🌊">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          See how environments silently diverge over time:
        </p>
        <InteractiveDemo title="Compare Your Environments">
          <EnvironmentDrift />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="The Real Cost" icon="💰">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          What happens when things go wrong in production:
        </p>
        <InteractiveDemo title="Production Failure Simulator">
          <FailureCost />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="excited" typed message="Now you see the problem clearly. In the next topic, we'll discover the elegant solution: CONTAINERS. They're like magic boxes that make the 'works on my machine' problem disappear forever." />
    </div>
  )
}
