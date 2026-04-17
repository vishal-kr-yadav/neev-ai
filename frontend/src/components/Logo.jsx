import { motion } from 'framer-motion'

/*
  Neev (नींव) Logo — Foundation blocks rising with a spark on top.
  Represents building knowledge from the ground up.
*/
export default function Logo({ size = 'medium', onClick }) {
  const sizes = {
    small: { height: 28, english: 18, hindi: 13, gap: 6 },
    medium: { height: 36, english: 24, hindi: 16, gap: 8 },
    large: { height: 48, english: 34, hindi: 22, gap: 10 },
    hero: { height: 64, english: 48, hindi: 28, gap: 14 },
  }
  const s = sizes[size] || sizes.medium
  const blockW = s.height * 0.26
  const blockGap = blockW * 0.14

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.03 } : {}}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Foundation blocks icon */}
      <svg width={s.height * 1.2} height={s.height} viewBox="0 0 48 40" fill="none">
        {/* Rising blocks */}
        <motion.rect x="2" y="26" width="9" height="12" rx="2" fill="#4f46e5" opacity="0.25"
          initial={{ height: 0, y: 38 }} animate={{ height: 12, y: 26 }} transition={{ delay: 0.1, duration: 0.4 }} />
        <motion.rect x="13" y="20" width="9" height="18" rx="2" fill="#4f46e5" opacity="0.45"
          initial={{ height: 0, y: 38 }} animate={{ height: 18, y: 20 }} transition={{ delay: 0.2, duration: 0.4 }} />
        <motion.rect x="24" y="14" width="9" height="24" rx="2" fill="#4f46e5" opacity="0.7"
          initial={{ height: 0, y: 38 }} animate={{ height: 24, y: 14 }} transition={{ delay: 0.3, duration: 0.4 }} />
        <motion.rect x="35" y="8" width="9" height="30" rx="2" fill="#4f46e5"
          initial={{ height: 0, y: 38 }} animate={{ height: 30, y: 8 }} transition={{ delay: 0.4, duration: 0.4 }} />
        {/* Spark */}
        <motion.circle cx="39.5" cy="4" r="3" fill="#f59e0b"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} />
        <motion.line x1="39.5" y1="0" x2="39.5" y2="-2" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} />
        <motion.line x1="35" y1="2" x2="33.5" y2="0.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} />
        <motion.line x1="44" y1="2" x2="45.5" y2="0.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
      </svg>

      {/* Text */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: s.gap * 0.6 }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: s.english,
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: -0.5,
          lineHeight: 1,
        }}>
          Neev
        </span>
        <span style={{
          fontSize: s.hindi,
          fontWeight: 600,
          color: 'var(--accent)',
          lineHeight: 1,
        }}>
          नींव
        </span>
      </div>
    </motion.div>
  )
}

/* Compact version — just the icon, no text */
export function LogoIcon({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: 'var(--gradient-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 10px rgba(79,70,229,0.25)',
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <rect x="1" y="15" width="5" height="8" rx="1" fill="white" opacity="0.4" />
        <rect x="7" y="11" width="5" height="12" rx="1" fill="white" opacity="0.6" />
        <rect x="13" y="7" width="5" height="16" rx="1" fill="white" opacity="0.8" />
        <rect x="19" y="3" width="4" height="20" rx="1" fill="white" />
        <circle cx="21" cy="1.5" r="1.5" fill="#f59e0b" />
      </svg>
    </div>
  )
}
