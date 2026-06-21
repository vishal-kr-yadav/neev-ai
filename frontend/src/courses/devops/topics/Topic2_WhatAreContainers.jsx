import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 2 — What Are Containers?
   Cinematic visual: Shipping container metaphor → tech reality
================================================================ */

/* ---- Shipping Container Metaphor ---- */
function ShippingMetaphor() {
  const [era, setEra] = useState(0)

  const eras = [
    {
      title: 'Before: Cargo Chaos',
      year: '1950s',
      visual: '📦🍎🛢️🪵📦🍷🥛📦🐟',
      desc: 'Every item packed differently. Different sizes, shapes, handling. Loading a ship took WEEKS. Goods damaged. Costs enormous.',
      color: '#ef4444',
      bg: '#fef2f2',
    },
    {
      title: 'The Invention: Standardized Container',
      year: '1956',
      visual: '📦',
      desc: 'Malcolm McLean invented the standard shipping container. ONE size. Fits on ships, trucks, trains. Changed the world.',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      title: 'After: Perfect Efficiency',
      year: 'Today',
      visual: '🚢',
      desc: 'Load a ship in HOURS. Stack perfectly. Any port in the world. Same container, same handling. This is what Docker does for software.',
      color: '#10b981',
      bg: '#ecfdf5',
    },
  ]

  const current = eras[era]

  return (
    <div>
      {/* Timeline */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, marginBottom: 32, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '15%', right: '15%',
          height: 3, background: 'var(--border)', transform: 'translateY(-50%)',
        }} />
        {eras.map((e, i) => (
          <motion.button
            key={i}
            onClick={() => setEra(i)}
            animate={{
              scale: i === era ? 1.15 : 1,
              boxShadow: i === era ? `0 0 20px ${e.color}40` : 'none',
            }}
            style={{
              position: 'relative', zIndex: 2,
              width: 80, height: 80, borderRadius: '50%',
              background: i <= era ? `linear-gradient(135deg, ${e.color}, ${e.color}cc)` : 'var(--bg-secondary)',
              color: i <= era ? 'white' : 'var(--text-muted)',
              border: `3px solid ${i <= era ? e.color : 'var(--border)'}`,
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              fontWeight: 700, fontSize: 12,
              margin: '0 60px',
            }}
          >
            <span style={{ fontSize: 20 }}>{['📦', '🔧', '🚀'][i]}</span>
            <span>{e.year}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={era}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            background: current.bg, borderRadius: 20, padding: 32,
            border: `2px solid ${current.color}25`,
            textAlign: 'center',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800,
            color: current.color, marginBottom: 12,
          }}>
            {current.title}
          </div>

          {/* Visual */}
          <motion.div
            animate={era === 0 ? { x: [0, 5, -5, 3, -3, 0] } : era === 1 ? { scale: [1, 1.1, 1] } : { rotate: [0, 2, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: era === 2 ? 72 : era === 1 ? 80 : 42, marginBottom: 20, letterSpacing: era === 0 ? 8 : 0 }}
          >
            {era === 2 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {['🟦', '🟦', '🟦'].map((c, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    style={{ fontSize: 42, display: 'inline-block' }}
                  >{c}</motion.span>
                ))}
                <span>🚢</span>
                {['🟦', '🟦', '🟦'].map((c, i) => (
                  <motion.span
                    key={i + 3}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: (i + 3) * 0.2 }}
                    style={{ fontSize: 42, display: 'inline-block' }}
                  >{c}</motion.span>
                ))}
              </div>
            ) : current.visual}
          </motion.div>

          <div style={{
            fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: 600, margin: '0 auto',
          }}>
            {current.desc}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- VM vs Container Visual ---- */
function VMvsContainer() {
  const [view, setView] = useState('vm')

  const vmLayers = [
    { label: 'App A', h: 40, color: '#3b82f6' },
    { label: 'Bins/Libs', h: 30, color: '#60a5fa' },
    { label: 'Guest OS', h: 50, color: '#93c5fd', heavy: true },
    { label: 'App B', h: 40, color: '#8b5cf6', offset: true },
    { label: 'Bins/Libs', h: 30, color: '#a78bfa', offset: true },
    { label: 'Guest OS', h: 50, color: '#c4b5fd', heavy: true, offset: true },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
        {['vm', 'container'].map(v => (
          <motion.button
            key={v}
            onClick={() => setView(v)}
            animate={{
              background: view === v ? (v === 'vm' ? '#ef4444' : '#10b981') : 'var(--bg-secondary)',
              color: view === v ? 'white' : 'var(--text-secondary)',
            }}
            style={{
              padding: '12px 28px', borderRadius: 10, border: 'none',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {v === 'vm' ? '🖥️ Virtual Machines' : '🐳 Containers'}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'vm' ? (
          <motion.div
            key="vm"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}
          >
            {/* VM Stack */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              width: '100%', maxWidth: 500, marginBottom: 12,
            }}>
              {[0, 1].map(col => (
                <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[`App ${col === 0 ? 'A' : 'B'}`, 'Bins/Libs', 'Guest OS'].map((label, i) => (
                    <motion.div
                      key={label}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: (col * 3 + i) * 0.1 }}
                      style={{
                        padding: label === 'Guest OS' ? '18px 16px' : '10px 16px',
                        background: label === 'Guest OS'
                          ? 'linear-gradient(135deg, #fca5a5, #f87171)'
                          : col === 0 ? '#3b82f620' : '#8b5cf620',
                        borderRadius: i === 0 ? '10px 10px 0 0' : i === 2 ? '0 0 10px 10px' : 0,
                        textAlign: 'center', fontWeight: 600, fontSize: 13,
                        color: label === 'Guest OS' ? '#991b1b' : 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderTop: i > 0 ? 'none' : undefined,
                      }}
                    >
                      {label}
                      {label === 'Guest OS' && (
                        <div style={{ fontSize: 10, fontWeight: 400, color: '#b91c1c', marginTop: 2 }}>
                          ~1-2 GB each!
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
            {['Hypervisor', 'Host OS', 'Hardware'].map((label, i) => (
              <motion.div
                key={label}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                style={{
                  width: '100%', maxWidth: 500, padding: '12px 20px',
                  background: i === 0 ? '#fef3c7' : i === 1 ? '#e0f2fe' : '#f3e8ff',
                  textAlign: 'center', fontWeight: 700, fontSize: 14,
                  color: 'var(--text-primary)',
                  borderRadius: i === 2 ? '0 0 12px 12px' : 0,
                  border: '1px solid var(--border)',
                  borderTop: 'none',
                }}
              >
                {label}
              </motion.div>
            ))}

            <div style={{
              marginTop: 16, padding: '12px 20px', borderRadius: 10,
              background: '#fee2e2', color: '#991b1b', fontWeight: 600,
              fontSize: 14, textAlign: 'center',
            }}>
              Heavy! Each VM carries its own OS. Slow to start. Uses lots of RAM.
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="container"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}
          >
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
              width: '100%', maxWidth: 500, marginBottom: 12,
            }}>
              {['App A', 'App B', 'App C'].map((app, col) => (
                <div key={app} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[app, 'Bins/Libs'].map((label, i) => (
                    <motion.div
                      key={label + col}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: col * 0.15 + i * 0.1, type: 'spring' }}
                      style={{
                        padding: '12px 14px',
                        background: ['#3b82f620', '#8b5cf620', '#10b98120'][col],
                        borderRadius: i === 0 ? '10px 10px 0 0' : '0 0 10px 10px',
                        textAlign: 'center', fontWeight: 600, fontSize: 13,
                        border: '1px solid var(--border)',
                        borderTop: i > 0 ? 'none' : undefined,
                      }}
                    >
                      {label}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
            {['Docker Engine', 'Host OS', 'Hardware'].map((label, i) => (
              <motion.div
                key={label}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                style={{
                  width: '100%', maxWidth: 500, padding: '12px 20px',
                  background: i === 0 ? '#d1fae5' : i === 1 ? '#e0f2fe' : '#f3e8ff',
                  textAlign: 'center', fontWeight: 700, fontSize: 14,
                  color: i === 0 ? '#065f46' : 'var(--text-primary)',
                  borderRadius: i === 2 ? '0 0 12px 12px' : 0,
                  border: `1px solid ${i === 0 ? '#6ee7b7' : 'var(--border)'}`,
                  borderTop: 'none',
                }}
              >
                {label}
                {i === 0 && <span style={{ fontSize: 11, marginLeft: 8, fontWeight: 500 }}>Shared kernel!</span>}
              </motion.div>
            ))}

            <div style={{
              marginTop: 16, padding: '12px 20px', borderRadius: 10,
              background: '#d1fae5', color: '#065f46', fontWeight: 600,
              fontSize: 14, textAlign: 'center',
            }}>
              Lightweight! No guest OS. Starts in seconds. Uses minimal RAM. Can run 10x more apps!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Interactive: Container Builder ---- */
function ContainerBuilder() {
  const [items, setItems] = useState([])
  const [packed, setPacked] = useState(false)

  const available = [
    { id: 'code', label: 'Your Code', icon: '📝', color: '#4f46e5' },
    { id: 'runtime', label: 'Runtime (Node/Python)', icon: '⚙️', color: '#0ea5e9' },
    { id: 'libs', label: 'Libraries & Deps', icon: '📚', color: '#8b5cf6' },
    { id: 'config', label: 'Config Files', icon: '🔧', color: '#f59e0b' },
    { id: 'env', label: 'Env Variables', icon: '🔐', color: '#10b981' },
  ]

  const addItem = (item) => {
    if (items.find(i => i.id === item.id)) return
    setItems([...items, item])
  }

  const allPacked = items.length === available.length

  return (
    <div>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20, textAlign: 'center' }}>
        Click each item to pack it into your container:
      </p>

      {/* Available items */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        {available.map(item => {
          const added = items.find(i => i.id === item.id)
          return (
            <motion.button
              key={item.id}
              onClick={() => addItem(item)}
              whileHover={!added ? { scale: 1.05, y: -4 } : {}}
              whileTap={!added ? { scale: 0.95 } : {}}
              animate={{ opacity: added ? 0.3 : 1 }}
              style={{
                padding: '14px 20px', borderRadius: 12,
                background: added ? 'var(--bg-secondary)' : `${item.color}10`,
                border: `2px solid ${added ? 'var(--border)' : item.color + '40'}`,
                cursor: added ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                fontWeight: 600, fontSize: 14, color: item.color,
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
              {added && ' ✓'}
            </motion.button>
          )
        })}
      </div>

      {/* Container box */}
      <motion.div
        animate={{
          borderColor: allPacked ? '#10b981' : 'var(--border)',
          boxShadow: allPacked ? '0 0 30px #10b98120' : 'none',
        }}
        style={{
          minHeight: 140, padding: 20, borderRadius: 16,
          border: '2px dashed var(--border)',
          background: 'var(--bg-card)',
          display: 'flex', flexWrap: 'wrap', gap: 10,
          alignItems: 'center', justifyContent: items.length ? 'flex-start' : 'center',
        }}
      >
        {items.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>
            📦 Your container is empty — add items above
          </span>
        ) : (
          items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                padding: '10px 16px', borderRadius: 10,
                background: `${item.color}15`, border: `1px solid ${item.color}30`,
                color: item.color, fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {item.icon} {item.label}
            </motion.div>
          ))
        )}
      </motion.div>

      {allPacked && !packed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: 20 }}>
          <motion.button
            onClick={() => setPacked(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '16px 36px', borderRadius: 14,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', fontWeight: 700, fontSize: 17,
              cursor: 'pointer', fontFamily: 'var(--font-heading)',
              boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            }}
          >
            📦 Seal the Container!
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {packed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: 20, padding: '24px 28px', borderRadius: 16,
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '1px solid #6ee7b7',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐳</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
              Container Ready!
            </div>
            <div style={{ fontSize: 15, color: '#047857', lineHeight: 1.7 }}>
              This container runs <strong>identically</strong> everywhere — your laptop, your colleague's machine, the cloud. That's the magic of containers!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic2_WhatAreContainers() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Neuron mood="excited" typed message="Now let me tell you one of the greatest stories in modern technology. It starts with a shipping port in 1956, and it changed EVERYTHING about how software runs today." />

      <SectionBlock title="The Shipping Container Revolution" icon="🚢">
        <InteractiveDemo title="From Cargo Chaos to Perfect Order">
          <ShippingMetaphor />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip mood="explaining">
        Just like shipping containers standardized global trade, Docker containers standardize how software is packaged and shipped. One format. Runs anywhere. No surprises.
      </NeuronTip>

      <SectionBlock title="VMs vs Containers" icon="⚡">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          Before containers, we used Virtual Machines. See the difference:
        </p>
        <InteractiveDemo title="The Architecture Comparison">
          <VMvsContainer />
        </InteractiveDemo>
      </SectionBlock>

      <SectionBlock title="Build Your First Container" icon="📦">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
          A container packs EVERYTHING your app needs. Try building one:
        </p>
        <InteractiveDemo title="Container Builder">
          <ContainerBuilder />
        </InteractiveDemo>
      </SectionBlock>

      <Neuron mood="happy" typed message="Now you know what containers are and why they exist. Next, let's dive into Docker itself — the tool that made containers mainstream and changed DevOps forever." />
    </div>
  )
}
