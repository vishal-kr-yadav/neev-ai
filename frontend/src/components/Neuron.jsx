import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'

const moods = {
  happy: { leftEye: '◕', rightEye: '◕', mouth: '◡', color: '#4f46e5', bodyBounce: true },
  thinking: { leftEye: '◕', rightEye: '◑', mouth: '〜', color: '#8b5cf6', bodyBounce: false },
  excited: { leftEye: '★', rightEye: '★', mouth: '▽', color: '#ec4899', bodyBounce: true },
  explaining: { leftEye: '◕', rightEye: '◕', mouth: '○', color: '#0ea5e9', bodyBounce: false },
  waving: { leftEye: '◕', rightEye: '◕', mouth: '◡', color: '#10b981', bodyBounce: true },
}

const sizes = {
  small: { avatar: 52, fontSize: 16, maxWidth: '100%' },
  medium: { avatar: 68, fontSize: 17, maxWidth: '100%' },
  large: { avatar: 84, fontSize: 18, maxWidth: '100%' },
}

export default function Neuron({ mood = 'happy', message, typed = false, size = 'medium', style = {}, children }) {
  const m = moods[mood] || moods.happy
  const s = sizes[size] || sizes.medium

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        ...style,
      }}
    >
      {/* Avatar */}
      <motion.div
        animate={m.bodyBounce ? { y: [0, -5, 0] } : {}}
        transition={m.bodyBounce ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
        style={{
          minWidth: s.avatar,
          width: s.avatar,
          height: s.avatar,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: `0 6px 24px ${m.color}33`,
          flexShrink: 0,
        }}
      >
        <div style={{
          display: 'flex',
          gap: s.avatar * 0.15,
          marginBottom: 2,
          fontSize: s.avatar * 0.24,
          color: 'white',
          lineHeight: 1,
        }}>
          <span>{m.leftEye}</span>
          <span>{m.rightEye}</span>
        </div>
        <div style={{ fontSize: s.avatar * 0.22, color: 'white', lineHeight: 1 }}>
          {m.mouth}
        </div>
        <div style={{
          position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
          width: 2, height: 12, background: m.color, borderRadius: 2,
        }}>
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
              width: 9, height: 9, borderRadius: '50%', background: m.color,
            }}
          />
        </div>
        <div style={{
          position: 'absolute', bottom: -20, fontSize: 11, fontWeight: 700,
          color: m.color, fontFamily: 'var(--font-heading)', letterSpacing: 0.5,
        }}>
          Neuron
        </div>
      </motion.div>

      {/* Speech bubble */}
      <div style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: `2px solid ${m.color}22`,
        borderRadius: 18,
        borderTopLeftRadius: 4,
        padding: '20px 24px',
        maxWidth: s.maxWidth,
        flex: 1,
        boxShadow: `0 3px 16px ${m.color}11`,
        fontSize: s.fontSize,
        color: 'var(--text-secondary)',
        lineHeight: 1.75,
      }}>
        {typed && message ? (
          <TypeAnimation
            sequence={[message]}
            speed={70}
            cursor={false}
            style={{ display: 'inline' }}
          />
        ) : (
          message
        )}
        {children}
      </div>
    </motion.div>
  )
}

export function NeuronTip({ type = 'tip', children }) {
  const config = {
    tip: { emoji: '💡', bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', label: 'Pro Tip' },
    fun: { emoji: '🎉', bg: '#fef3c7', border: '#fde68a', color: '#92400e', label: 'Fun Fact' },
    simple: { emoji: '🧒', bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', label: 'Simple Explanation' },
    deep: { emoji: '🔬', bg: '#faf5ff', border: '#e9d5ff', color: '#6b21a8', label: 'Deep Dive' },
    example: { emoji: '📌', bg: '#fff7ed', border: '#fed7aa', color: '#9a3412', label: 'Real Example' },
    warning: { emoji: '⚠️', bg: '#fef2f2', border: '#fecaca', color: '#991b1b', label: 'Watch Out' },
    try: { emoji: '🎮', bg: '#ecfdf5', border: '#a7f3d0', color: '#065f46', label: 'Try It Yourself' },
  }

  const c = config[type] || config.tip

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        padding: '20px 24px',
        margin: '24px 0',
        fontSize: 16,
        lineHeight: 1.75,
        color: c.color,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontWeight: 700, fontSize: 14, marginBottom: 8,
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        <span>{c.emoji}</span>
        {c.label}
      </div>
      {children}
    </motion.div>
  )
}

export function SectionBlock({ icon, title, children, color = 'var(--accent)' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 22,
        padding: '36px 40px',
        marginBottom: 32,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
        }}>
          {icon && (
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              {icon}
            </div>
          )}
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {title}
          </h2>
        </div>
      )}
      {children}
    </motion.section>
  )
}

export function InteractiveDemo({ title, instruction, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: 'linear-gradient(135deg, #eef4ff, #e8f0ff)',
        border: '2px solid #93b4f8',
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 32,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: 22 }}
          >🎮</motion.span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 16 }}>
            {title || 'Try It Yourself'}
          </span>
        </div>
        <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>Interactive</span>
      </div>
      {instruction && (
        <div style={{
          padding: '14px 28px',
          background: 'rgba(255,255,255,0.6)',
          fontSize: 16,
          color: 'var(--text-secondary)',
          borderBottom: '1px solid #93b4f8',
        }}>
          {instruction}
        </div>
      )}
      <div style={{ padding: 28 }}>
        {children}
      </div>
    </motion.div>
  )
}
