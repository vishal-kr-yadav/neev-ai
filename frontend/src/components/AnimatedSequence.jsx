import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  A "video-like" animated sequence component (light theme).
  Auto-plays through frames like a mini educational video.
  Users can also click to advance manually.
*/

export default function AnimatedSequence({ frames, autoPlay = true, interval = 3000 }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(autoPlay)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!playing) return
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % frames.length)
    }, interval)
    return () => clearInterval(timerRef.current)
  }, [playing, frames.length, interval])

  const goTo = (idx) => {
    setCurrent(idx)
    setPlaying(false)
    clearInterval(timerRef.current)
  }

  const frame = frames[current]

  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: 0,
      border: '1px solid var(--border)', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Player header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {current + 1} / {frames.length}
        </span>
        <button
          onClick={() => setPlaying(!playing)}
          style={{
            background: 'var(--accent-lighter)', border: 'none', color: 'var(--accent)',
            cursor: 'pointer', fontSize: 13, padding: '4px 12px', borderRadius: 6,
            fontWeight: 600,
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      {/* Frame content */}
      <div style={{ minHeight: 280, padding: 32, position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {frame.title && (
              <div style={{
                fontSize: 16, fontWeight: 700, color: frame.color || 'var(--accent)',
                marginBottom: 16, fontFamily: 'var(--font-heading)',
              }}>
                {frame.title}
              </div>
            )}

            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 14, padding: 28,
              minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, border: '1px solid var(--border)',
            }}>
              {frame.visual}
            </div>

            {frame.caption && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7 }}>
                {frame.caption}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Timeline */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 16px 12px',
        background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
      }}>
        {frames.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              flex: 1, height: 5, borderRadius: 3, border: 'none', cursor: 'pointer',
              background: i === current ? (frames[i].color || 'var(--accent)') : 'var(--border)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
