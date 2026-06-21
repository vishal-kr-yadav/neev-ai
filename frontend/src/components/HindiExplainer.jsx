import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HindiExplainer({ concept, english, explanation, example, terms }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: 14, marginBottom: 8 }}>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 30,
          background: open ? 'linear-gradient(135deg, #ff9933, #e67e22)' : 'linear-gradient(135deg, #ff993320, #e67e2218)',
          border: '1.5px solid #ff993366',
          color: open ? '#fff' : '#ff9933',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.3s',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 17 }}>हिं</span>
        <span>{open ? 'बंद करें ✕' : 'हिंदी में समझें'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 14 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #fff8f0, #fff5eb)',
              border: '1.5px solid #ff993340',
              borderTop: '4px solid #ff9933',
              borderRadius: 16,
              padding: 24,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 12, right: 16,
                fontSize: 11, color: '#ff993399', fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase',
              }}>
                हिंदी व्याख्या
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #ff9933, #e67e22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: '#fff', fontWeight: 800,
                }}>
                  हिं
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2d2d2d', fontFamily: 'var(--font-heading)' }}>
                    {concept}
                  </div>
                  <div style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
                    {english}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333', margin: '0 0 16px 0' }}>
                {explanation}
              </p>

              {example && (
                <div style={{
                  background: '#fff',
                  border: '1px solid #ff993325',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: terms?.length ? 16 : 0,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e67e22', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>💡</span> रोज़मर्रा का उदाहरण
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#444', margin: 0 }}>
                    {example}
                  </p>
                </div>
              )}

              {terms?.length > 0 && (
                <div style={{
                  background: '#fff',
                  border: '1px solid #ff993325',
                  borderRadius: 12,
                  padding: 16,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e67e22', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🔑</span> मुख्य शब्द
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {terms.map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={{
                          background: '#ff993318',
                          color: '#e67e22',
                          fontWeight: 700,
                          fontSize: 13,
                          padding: '3px 10px',
                          borderRadius: 6,
                          whiteSpace: 'nowrap',
                        }}>
                          {t.hindi}
                        </span>
                        <span style={{ fontSize: 13, color: '#666' }}>
                          ({t.english}) — {t.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
