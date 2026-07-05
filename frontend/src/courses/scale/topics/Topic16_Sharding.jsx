import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 16 — Sharding, Replication & Database Scaling Limits
   Vertical vs horizontal scaling, read replicas, sharding strategies,
   practical sharding, hard limits, and a scaling decision framework.
================================================================ */

/* ---- Database Scaling Ceiling ---- */
function ScalingCeiling() {
  const [users, setUsers] = useState(10000)
  const [scalingMode, setScalingMode] = useState('vertical')

  const tiers = [
    { threshold: 5000, cpu: 2, ram: '4GB', cost: 50, label: '2 vCPU / 4GB' },
    { threshold: 50000, cpu: 4, ram: '16GB', cost: 200, label: '4 vCPU / 16GB' },
    { threshold: 200000, cpu: 16, ram: '64GB', cost: 800, label: '16 vCPU / 64GB' },
    { threshold: 1000000, cpu: 32, ram: '128GB', cost: 1600, label: '32 vCPU / 128GB' },
    { threshold: 3000000, cpu: 64, ram: '256GB', cost: 3200, label: '64 vCPU / 256GB' },
    { threshold: 10000001, cpu: null, ram: null, cost: null, label: null },
  ]

  const getCurrentTier = () => {
    for (let i = 0; i < tiers.length; i++) {
      if (users <= tiers[i].threshold) return tiers[i]
    }
    return tiers[tiers.length - 1]
  }

  const tier = getCurrentTier()
  const hitCeiling = tier.cpu === null

  const getHorizontalServers = () => {
    if (users <= 10000) return 1
    if (users <= 100000) return 2
    if (users <= 500000) return 4
    if (users <= 2000000) return 8
    return 20
  }

  const hServers = getHorizontalServers()
  const hCostPerServer = 200
  const hTotalCost = hServers * hCostPerServer
  const hResponseTime = 12

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'vertical', label: 'Vertical Scaling', color: '#8b5cf6' },
          { key: 'horizontal', label: 'Horizontal Scaling', color: '#10b981' },
        ].map(m => (
          <motion.button
            key={m.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScalingMode(m.key)}
            style={{
              padding: '10px 20px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, fontFamily: 'var(--font-sans)', cursor: 'pointer',
              border: `2px solid ${scalingMode === m.key ? m.color : 'var(--border)'}`,
              background: scalingMode === m.key ? `${m.color}15` : 'var(--bg-secondary)',
              color: scalingMode === m.key ? m.color : 'var(--text-muted)',
            }}
          >
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Users slider */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
        }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Concurrent Users
          </label>
          <span style={{
            fontSize: 20, fontWeight: 800, color: '#3b82f6',
            fontFamily: "'Fira Code', monospace",
          }}>
            {users >= 1000000 ? `${(users / 1000000).toFixed(1)}M` : users >= 1000 ? `${(users / 1000).toFixed(0)}K` : users}
          </span>
        </div>
        <input
          type="range" min="1000" max="10000000" step="1000" value={users}
          onChange={e => setUsers(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
          <span>1K</span><span>100K</span><span>1M</span><span>10M</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {scalingMode === 'vertical' ? (
          <motion.div
            key="vertical"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Single server box */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: 20,
            }}>
              <motion.div
                animate={{ scale: hitCeiling ? [1, 1.05, 1] : 1 }}
                transition={{ repeat: hitCeiling ? Infinity : 0, duration: 0.8 }}
                style={{
                  padding: '24px 40px', borderRadius: 16, textAlign: 'center',
                  border: `3px solid ${hitCeiling ? '#ef4444' : '#8b5cf6'}`,
                  background: hitCeiling ? '#ef444415' : '#8b5cf615',
                  minWidth: 260,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>
                  {hitCeiling ? '💥' : '🖥️'}
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 800,
                  color: hitCeiling ? '#ef4444' : '#8b5cf6',
                  fontFamily: 'var(--font-heading)',
                }}>
                  {hitCeiling ? 'No bigger server exists!' : tier.label}
                </div>
                {!hitCeiling && (
                  <div style={{
                    fontSize: 24, fontWeight: 800, color: '#8b5cf6',
                    fontFamily: "'Fira Code', monospace", marginTop: 8,
                  }}>
                    ${tier.cost}/mo
                  </div>
                )}
              </motion.div>
            </div>

            {hitCeiling && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '14px 20px', borderRadius: 12, textAlign: 'center',
                  background: '#ef444415', border: '1.5px solid #ef444440',
                  fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 16,
                }}
              >
                You have hit the vertical scaling ceiling. No single machine can handle {(users / 1000000).toFixed(1)}M users. Time to go horizontal.
              </motion.div>
            )}

            {/* Cost escalation */}
            {!hitCeiling && (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Vertical Cost Escalation
                </div>
                {tiers.filter(t => t.cpu !== null).map((t, i) => {
                  const active = t === tier
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
                    }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, width: 140, color: active ? '#8b5cf6' : 'var(--text-muted)',
                        fontFamily: "'Fira Code', monospace",
                      }}>
                        {t.label}
                      </span>
                      <div style={{ flex: 1, height: 16, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(t.cost / 3200) * 100}%` }}
                          transition={{ duration: 0.6 }}
                          style={{
                            height: '100%', borderRadius: 6,
                            background: active ? '#8b5cf6' : '#4b5563',
                          }}
                        />
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, width: 70, textAlign: 'right',
                        color: active ? '#8b5cf6' : 'var(--text-muted)',
                      }}>
                        ${t.cost}/mo
                      </span>
                    </div>
                  )
                })}
                <div style={{
                  fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10,
                  fontStyle: 'italic',
                }}>
                  Cost grows exponentially -- 2x CPU costs 4x the price
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="horizontal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Server grid */}
            <div style={{
              display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20,
            }}>
              {Array.from({ length: hServers }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: '16px 20px', borderRadius: 12, textAlign: 'center',
                    border: '2px solid #10b981', background: '#10b98115',
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontSize: 24 }}>🖥️</div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#10b981', marginTop: 4,
                  }}>
                    Shard {i + 1}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Metrics */}
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16,
            }}>
              {[
                { label: 'Servers', value: hServers, color: '#10b981' },
                { label: 'Cost', value: `$${hTotalCost}/mo`, color: '#3b82f6' },
                { label: 'Response Time', value: `${hResponseTime}ms`, color: '#8b5cf6' },
              ].map(m => (
                <div key={m.label} style={{
                  flex: 1, minWidth: 120, padding: '12px 16px', borderRadius: 12,
                  background: `${m.color}10`, border: `1.5px solid ${m.color}30`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                  <div style={{
                    fontSize: 22, fontWeight: 800, color: m.color,
                    fontFamily: "'Fira Code', monospace",
                  }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '12px 18px', borderRadius: 12, textAlign: 'center',
              background: '#10b98110', border: '1.5px solid #10b98130',
              fontSize: 13, color: '#10b981', fontWeight: 600,
            }}>
              Cost grows linearly -- 2x users = 2x servers = 2x cost. Response time stays flat.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Read Replica Traffic Splitter ---- */
function ReadReplicaSplitter() {
  const [numReplicas, setNumReplicas] = useState(0)

  const primaryLoad = numReplicas === 0 ? 100 : Math.round(100 / (numReplicas + 1)) + 10
  const readThroughput = numReplicas === 0 ? 1 : numReplicas + 1
  const replicationLag = numReplicas === 0 ? 0 : Math.min(numReplicas * 2 + 1, 15)

  return (
    <div>
      {/* Slider */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
        }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Number of Read Replicas
          </label>
          <span style={{
            fontSize: 20, fontWeight: 800, color: '#10b981',
            fontFamily: "'Fira Code', monospace",
          }}>
            {numReplicas}
          </span>
        </div>
        <input
          type="range" min="0" max="5" value={numReplicas}
          onChange={e => setNumReplicas(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
          <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>
      </div>

      {/* Primary */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <motion.div
          animate={{ boxShadow: primaryLoad > 80 ? '0 0 20px #ef444440' : '0 0 10px #3b82f620' }}
          style={{
            padding: '18px 36px', borderRadius: 14, textAlign: 'center',
            border: `3px solid #3b82f6`, background: '#3b82f615',
            minWidth: 220,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>PRIMARY</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reads + Writes</div>
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8,
          }}>
            <span style={{
              padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: '#f59e0b20', color: '#f59e0b',
            }}>
              WRITES
            </span>
            {numReplicas === 0 && (
              <span style={{
                padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: '#10b98120', color: '#10b981',
              }}>
                READS
              </span>
            )}
          </div>
        </motion.div>

        {/* Replication arrows */}
        {numReplicas > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ fontSize: 14, color: '#10b981', fontWeight: 700 }}
            >
              Replication Stream
            </motion.div>
            <div style={{ width: 2, height: 16, background: '#10b98140' }} />
          </div>
        )}

        {/* Replicas */}
        {numReplicas > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: numReplicas }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: '14px 20px', borderRadius: 12, textAlign: 'center',
                  border: '2px solid #10b981', background: '#10b98115',
                  minWidth: 100,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>
                  Replica {i + 1}
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: '#10b98120', color: '#10b981', marginTop: 4, display: 'inline-block',
                }}>
                  READS
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16,
      }}>
        {[
          { label: 'Primary Load', value: `${Math.min(primaryLoad, 100)}%`, color: primaryLoad > 80 ? '#ef4444' : '#10b981' },
          { label: 'Read Throughput', value: `${readThroughput}x`, color: '#3b82f6' },
          { label: 'Replication Lag', value: `~${replicationLag}ms`, color: replicationLag > 10 ? '#f59e0b' : '#10b981' },
        ].map(m => (
          <div key={m.label} style={{
            flex: 1, minWidth: 120, padding: '12px 16px', borderRadius: 12,
            background: `${m.color}10`, border: `1.5px solid ${m.color}30`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: m.color,
              fontFamily: "'Fira Code', monospace",
            }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div style={{
        padding: '14px 18px', borderRadius: 12,
        background: '#f59e0b10', border: '1.5px solid #f59e0b30',
        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
      }}>
        <strong style={{ color: '#f59e0b' }}>Read-After-Write Consistency Problem:</strong> User writes data to
        primary, then immediately reads from replica that has not replicated yet. They see stale data.
        Solution: route the writer to primary for reads within a short window, or use synchronous replication (slower).
      </div>
    </div>
  )
}

/* ---- Sharding Strategy Visualizer ---- */
function ShardingStrategyVisualizer() {
  const [strategy, setStrategy] = useState('range')
  const [numShards, setNumShards] = useState(4)
  const [hotspot, setHotspot] = useState(false)

  const strategies = [
    { key: 'range', label: 'Range-Based', color: '#3b82f6' },
    { key: 'hash', label: 'Hash-Based', color: '#10b981' },
    { key: 'directory', label: 'Directory-Based', color: '#8b5cf6' },
  ]

  const getShardRanges = () => {
    const chunkSize = Math.ceil(1000000 / numShards)
    return Array.from({ length: numShards }, (_, i) => ({
      id: i,
      start: i * chunkSize + 1,
      end: Math.min((i + 1) * chunkSize, 1000000),
      load: hotspot ? (i === numShards - 1 ? 95 : Math.round(20 / (numShards - 1)) + 5) : Math.round(100 / numShards),
    }))
  }

  const shardRanges = getShardRanges()

  const handleAddUsers = () => {
    setHotspot(true)
    setTimeout(() => setHotspot(false), 4000)
  }

  const pros = {
    range: ['Simple to implement', 'Range queries stay on one shard', 'Easy to understand'],
    hash: ['Even distribution guaranteed', 'No hotspot risk', 'Predictable routing'],
    directory: ['Flexible shard assignment', 'Can move data without rehashing', 'Custom routing logic'],
  }

  const cons = {
    range: ['Hotspot risk on popular ranges', 'Uneven distribution over time', 'Rebalancing is hard'],
    hash: ['Range queries hit ALL shards', 'Adding shards requires rehashing', 'No locality'],
    directory: ['Lookup table is a SPOF', 'Extra lookup latency', 'Must keep directory in sync'],
  }

  return (
    <div>
      {/* Strategy tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {strategies.map(s => (
          <motion.button
            key={s.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setStrategy(s.key); setHotspot(false) }}
            style={{
              padding: '10px 18px', borderRadius: 12, border: '2px solid',
              borderColor: strategy === s.key ? s.color : 'var(--border)',
              background: strategy === s.key ? `${s.color}15` : 'var(--bg-secondary)',
              color: strategy === s.key ? s.color : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {s.label}
          </motion.button>
        ))}
      </div>

      {/* Shard count slider */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
        }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Number of Shards
          </label>
          <span style={{
            fontSize: 20, fontWeight: 800, color: strategies.find(s => s.key === strategy).color,
            fontFamily: "'Fira Code', monospace",
          }}>
            {numShards}
          </span>
        </div>
        <input
          type="range" min="2" max="8" value={numShards}
          onChange={e => { setNumShards(Number(e.target.value)); setHotspot(false) }}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Range-Based */}
        {strategy === 'range' && (
          <motion.div
            key="range"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shard boxes */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {shardRanges.map(shard => {
                const isHot = hotspot && shard.id === numShards - 1
                return (
                  <motion.div
                    key={shard.id}
                    animate={{ borderColor: isHot ? '#ef4444' : '#3b82f6' }}
                    style={{
                      flex: 1, minWidth: 100, padding: '14px 12px', borderRadius: 12,
                      border: `2px solid #3b82f6`, textAlign: 'center',
                      background: isHot ? '#ef444415' : '#3b82f610',
                    }}
                  >
                    <div style={{
                      fontSize: 12, fontWeight: 700,
                      color: isHot ? '#ef4444' : '#3b82f6',
                    }}>
                      Shard {shard.id + 1}
                    </div>
                    <div style={{
                      fontSize: 11, color: 'var(--text-muted)',
                      fontFamily: "'Fira Code', monospace", marginTop: 4,
                    }}>
                      {shard.start.toLocaleString()}-{shard.end.toLocaleString()}
                    </div>
                    {/* Load bar */}
                    <div style={{
                      height: 8, background: '#1e293b', borderRadius: 4,
                      overflow: 'hidden', marginTop: 8,
                    }}>
                      <motion.div
                        animate={{ width: `${shard.load}%` }}
                        transition={{ duration: 0.5 }}
                        style={{
                          height: '100%', borderRadius: 4,
                          background: isHot ? '#ef4444' : '#3b82f6',
                        }}
                      />
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, marginTop: 4,
                      color: isHot ? '#ef4444' : 'var(--text-muted)',
                    }}>
                      {shard.load}% load
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddUsers}
              style={{
                padding: '10px 20px', borderRadius: 12, border: '2px solid #f59e0b',
                background: '#f59e0b15', color: '#f59e0b', fontWeight: 700,
                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
                marginBottom: 16,
              }}
            >
              Add 100K New Users (IDs: 900K-1M)
            </motion.button>

            {hotspot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '12px 18px', borderRadius: 12,
                  background: '#ef444410', border: '1.5px solid #ef444430',
                  fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 16,
                }}
              >
                Hotspot detected! All new users land on the last shard because IDs are sequential. This shard is overloaded while others are idle.
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Hash-Based */}
        {strategy === 'hash' && (
          <motion.div
            key="hash"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Formula */}
            <div style={{
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              fontSize: 14, background: '#1e293b', color: '#e2e8f0',
              padding: 20, borderRadius: 12, marginBottom: 16,
              textAlign: 'center', lineHeight: 2,
            }}>
              <span style={{ color: '#f59e0b' }}>shard_id</span> = <span style={{ color: '#10b981' }}>hash</span>(user_id) % <span style={{ color: '#8b5cf6' }}>{numShards}</span>
            </div>

            {/* Evenly distributed shards */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {Array.from({ length: numShards }, (_, i) => {
                const load = Math.round(100 / numShards) + (i === 0 ? 100 % numShards : 0)
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      flex: 1, minWidth: 100, padding: '14px 12px', borderRadius: 12,
                      border: '2px solid #10b981', textAlign: 'center',
                      background: '#10b98110',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>
                      Shard {i + 1}
                    </div>
                    <div style={{
                      height: 8, background: '#1e293b', borderRadius: 4,
                      overflow: 'hidden', marginTop: 8,
                    }}>
                      <motion.div
                        animate={{ width: `${load}%` }}
                        style={{ height: '100%', borderRadius: 4, background: '#10b981' }}
                      />
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, marginTop: 4, color: '#10b981',
                    }}>
                      ~{load}% load
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div style={{
              padding: '12px 18px', borderRadius: 12,
              background: '#f59e0b10', border: '1.5px solid #f59e0b30',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              <strong style={{ color: '#f59e0b' }}>Trade-off:</strong> Even distribution is guaranteed, but range
              queries like <code style={{ fontFamily: "'Fira Code', monospace", color: '#10b981' }}>WHERE id BETWEEN 1000 AND 2000</code> must
              hit ALL {numShards} shards because hashing destroys order.
            </div>
          </motion.div>
        )}

        {/* Directory-Based */}
        {strategy === 'directory' && (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Central lookup table */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 16,
            }}>
              <motion.div
                style={{
                  padding: '16px 32px', borderRadius: 14, textAlign: 'center',
                  border: '3px solid #8b5cf6', background: '#8b5cf615',
                  minWidth: 220,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: '#8b5cf6' }}>
                  Directory Service
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Central Lookup Table
                </div>
              </motion.div>

              <div style={{ width: 2, height: 16, background: '#8b5cf640' }} />

              {/* Lookup table */}
              <div style={{
                borderRadius: 12, overflow: 'hidden',
                border: '1px solid var(--border)', minWidth: 300,
              }}>
                <table style={{
                  width: '100%', borderCollapse: 'collapse', fontSize: 12,
                  fontFamily: "'Fira Code', monospace",
                }}>
                  <thead>
                    <tr style={{ background: '#8b5cf615' }}>
                      <th style={{ padding: '8px 14px', textAlign: 'left', color: '#8b5cf6', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Key</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center', color: '#8b5cf6', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Shard</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'user_1001', shard: 1 },
                      { key: 'user_2045', shard: 3 },
                      { key: 'user_5000', shard: 2 },
                      { key: 'user_9999', shard: numShards },
                    ].map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)' }}>
                        <td style={{ padding: '6px 14px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.key}</td>
                        <td style={{ padding: '6px 14px', textAlign: 'center', color: '#8b5cf6', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Shard {row.shard}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ width: 2, height: 16, background: '#8b5cf640' }} />

              {/* Shard boxes */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {Array.from({ length: numShards }, (_, i) => (
                  <div key={i} style={{
                    padding: '10px 18px', borderRadius: 10,
                    border: '2px solid #8b5cf6', background: '#8b5cf610',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>
                      Shard {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '12px 18px', borderRadius: 12,
              background: '#ef444410', border: '1.5px solid #ef444430',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              <strong style={{ color: '#ef4444' }}>Warning:</strong> The directory service is a Single Point of Failure.
              If it goes down, no request can be routed to any shard. Must be highly available and cached.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pros/Cons */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20,
      }}>
        <div style={{
          background: '#10b98108', border: '1.5px solid #10b98120',
          borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 10 }}>
            Pros
          </div>
          {pros[strategy].map((p, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'center',
              fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6,
            }}>
              <span style={{ color: '#10b981' }}>+</span> {p}
            </div>
          ))}
        </div>
        <div style={{
          background: '#ef444408', border: '1.5px solid #ef444420',
          borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>
            Cons
          </div>
          {cons[strategy].map((c, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'center',
              fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6,
            }}>
              <span style={{ color: '#ef4444' }}>-</span> {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---- SQL vs NoSQL Sharding ---- */
function SQLvsNoSQLSharding() {
  const [activeDB, setActiveDB] = useState(0)

  const databases = [
    {
      tab: '🍃 MongoDB',
      color: '#10b981',
      architecture: [
        { label: 'App / Driver', color: '#3b82f6' },
        { label: 'mongos (Router)', color: '#10b981' },
        { label: 'Config Servers', color: '#f59e0b' },
        { label: 'Shard 1...N', color: '#8b5cf6' },
      ],
      setup: `// Enable sharding on database
sh.enableSharding("mydb")

// Shard a collection by userId (hashed)
sh.shardCollection("mydb.orders", { userId: "hashed" })

// MongoDB handles chunk splitting, balancing,
// and routing automatically via mongos`,
      complexity: 2,
      bestFor: 'Applications already on MongoDB. Native support makes it easiest. Auto-balancing and chunk migration built in.',
    },
    {
      tab: '🐘 PostgreSQL (Citus)',
      color: '#3b82f6',
      architecture: [
        { label: 'App', color: '#3b82f6' },
        { label: 'Citus Coordinator', color: '#8b5cf6' },
        { label: 'Worker Node 1', color: '#10b981' },
        { label: 'Worker Node N', color: '#10b981' },
      ],
      setup: `-- Install Citus extension
CREATE EXTENSION citus;

-- Add worker nodes
SELECT citus_add_node('worker1', 5432);
SELECT citus_add_node('worker2', 5432);

-- Distribute table by tenant_id
SELECT create_distributed_table('orders', 'tenant_id');

-- Queries look like normal SQL!
SELECT * FROM orders WHERE tenant_id = 42;`,
      complexity: 3,
      bestFor: 'Multi-tenant SaaS apps. Keeps full PostgreSQL compatibility. Queries that filter by tenant_id stay on one shard.',
    },
    {
      tab: '🐬 MySQL (Vitess)',
      color: '#f59e0b',
      architecture: [
        { label: 'App', color: '#3b82f6' },
        { label: 'VTGate (Proxy)', color: '#f59e0b' },
        { label: 'VTTablet', color: '#ec4899' },
        { label: 'MySQL Shard', color: '#10b981' },
      ],
      setup: `# Vitess uses VSchema to define sharding
# vschema.json:
{
  "sharded": true,
  "vindexes": {
    "hash": { "type": "hash" }
  },
  "tables": {
    "orders": {
      "column_vindexes": [
        { "column": "user_id", "name": "hash" }
      ]
    }
  }
}

# vtctlclient ApplyVSchema ...`,
      complexity: 4,
      bestFor: 'Large-scale MySQL deployments (YouTube, Slack). Most complex but battle-tested at massive scale.',
    },
  ]

  const db = databases[activeDB]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {databases.map((d, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveDB(i)}
            style={{
              padding: '10px 20px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, fontFamily: 'var(--font-sans)', cursor: 'pointer',
              border: `2px solid ${i === activeDB ? d.color : 'var(--border)'}`,
              background: i === activeDB ? `${d.color}15` : 'var(--bg-secondary)',
              color: i === activeDB ? d.color : 'var(--text-muted)',
            }}
          >
            {d.tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDB}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {/* Architecture */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14,
            border: '1px solid var(--border)', padding: 20, marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
              Architecture
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {db.architecture.map((block, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      padding: '10px 16px', borderRadius: 10,
                      background: `${block.color}15`, border: `2px solid ${block.color}`,
                      fontSize: 13, fontWeight: 700, color: block.color,
                      textAlign: 'center',
                    }}
                  >
                    {block.label}
                  </motion.div>
                  {i < db.architecture.length - 1 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 18, fontWeight: 700 }}>&rarr;</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Setup commands */}
          <pre style={{
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            fontSize: 13, background: '#1e293b', color: '#e2e8f0',
            padding: 20, borderRadius: 12, overflowX: 'auto',
            marginBottom: 16, lineHeight: 1.7, whiteSpace: 'pre',
          }}>
            {db.setup}
          </pre>

          {/* Complexity + Best for */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{
              flex: 1, minWidth: 180, padding: '12px 18px', borderRadius: 12,
              background: `${db.color}10`, border: `1.5px solid ${db.color}30`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Complexity</div>
              <div style={{ fontSize: 20, color: db.color }}>
                {'★'.repeat(db.complexity)}{'☆'.repeat(5 - db.complexity)}
              </div>
            </div>
            <div style={{
              flex: 2, minWidth: 250, padding: '12px 18px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Best For</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {db.bestFor}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Comparison table -- always visible */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)', marginBottom: 12,
        }}>
          Side-by-Side Comparison
        </div>
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontSize: 13,
            fontFamily: 'var(--font-sans)',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Feature</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#10b981', borderBottom: '1px solid var(--border)' }}>MongoDB</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#3b82f6', borderBottom: '1px solid var(--border)' }}>Citus (PG)</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#f59e0b', borderBottom: '1px solid var(--border)' }}>Vitess (MySQL)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Native Sharding', mongo: 'Yes', citus: 'Extension', vitess: 'External Proxy' },
                { feature: 'Setup Effort', mongo: 'Low', citus: 'Medium', vitess: 'High' },
                { feature: 'Auto-Balancing', mongo: 'Yes', citus: 'Manual', vitess: 'Manual' },
                { feature: 'Cross-Shard Joins', mongo: 'No', citus: 'Yes', vitess: 'Limited' },
                { feature: 'Used By', mongo: 'Forbes, EA', citus: 'Algolia, Heap', vitess: 'YouTube, Slack' },
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>{row.feature}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.mongo}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.citus}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{row.vitess}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ---- Database Limitation Explorer ---- */
function LimitationExplorer() {
  const [activeLimit, setActiveLimit] = useState(null)

  const limits = [
    {
      title: 'PostgreSQL Limits',
      icon: '🐘',
      color: '#3b82f6',
      details: [
        { label: 'MVCC Bloat', desc: 'Every UPDATE creates a new row version. Dead rows accumulate and slow queries until VACUUM runs.' },
        { label: 'VACUUM Overhead', desc: 'Autovacuum can consume 20-30% CPU on write-heavy tables. Tune autovacuum_vacuum_scale_factor.' },
        { label: 'max_connections', desc: 'Default is 100. Each connection is a full OS process (~10MB RAM). At 500 connections = 5GB just for connections.' },
      ],
    },
    {
      title: 'MySQL Limits',
      icon: '🐬',
      color: '#f59e0b',
      details: [
        { label: '8KB Row Limit', desc: 'InnoDB rows cannot exceed ~8KB. Large TEXT/BLOB columns are stored off-page, adding I/O overhead.' },
        { label: 'ALTER TABLE Locks', desc: 'Many DDL operations lock the entire table. On a 500M row table, ALTER can take hours and block all writes.' },
        { label: 'Replication Lag', desc: 'Single-threaded replication applier. Under write-heavy load, replicas can fall minutes behind primary.' },
      ],
    },
    {
      title: 'MongoDB Limits',
      icon: '🍃',
      color: '#10b981',
      details: [
        { label: '16MB Document Limit', desc: 'A single document cannot exceed 16MB. Embedded arrays that grow unbounded will hit this wall.' },
        { label: 'No JOINs', desc: '$lookup is limited and slow. If your data model requires many relationships, MongoDB forces denormalization.' },
        { label: 'WiredTiger Cache', desc: 'Default cache = 50% of RAM minus 1GB. If your working set exceeds cache, performance drops dramatically.' },
      ],
    },
    {
      title: 'CAP Theorem',
      icon: '🔺',
      color: '#8b5cf6',
      details: [
        { label: 'Consistency', desc: 'Every read receives the most recent write. Strong consistency means all nodes agree.' },
        { label: 'Availability', desc: 'Every request receives a response (no timeouts). Even if some nodes are down.' },
        { label: 'Partition Tolerance', desc: 'System continues operating when network splits nodes. In distributed systems, P is mandatory.' },
      ],
      capClassifications: [
        { db: 'PostgreSQL', choice: 'CP', color: '#3b82f6' },
        { db: 'MongoDB', choice: 'CP', color: '#10b981' },
        { db: 'Cassandra', choice: 'AP', color: '#f59e0b' },
        { db: 'DynamoDB', choice: 'AP', color: '#ec4899' },
      ],
    },
    {
      title: 'Connection Math',
      icon: '🔢',
      color: '#ec4899',
      details: [
        { label: 'PostgreSQL', desc: '500 connections x 10MB/conn = 5GB RAM just for connections. Leaves less for shared_buffers and work_mem.' },
        { label: 'MySQL', desc: '500 connections x 1MB/conn = 500MB. More efficient but each connection still holds thread stack + buffers.' },
        { label: 'Solution', desc: 'Use PgBouncer or ProxySQL. 10,000 app connections multiplex into 50-100 database connections.' },
      ],
    },
    {
      title: 'Write Amplification',
      icon: '📝',
      color: '#dc2626',
      details: [
        { label: 'The Problem', desc: '1 INSERT into a table with 5 indexes = 6 write operations (1 table + 5 index updates).' },
        { label: 'WAL Writes', desc: 'Every change is written to Write-Ahead Log first, then to data files. Double-write for durability.' },
        { label: 'Impact', desc: 'A table with 10 indexes has 11x write amplification. Each index also needs to maintain sort order (page splits).' },
      ],
    },
  ]

  return (
    <div>
      {/* Cards grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20,
      }}>
        {limits.map((limit, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveLimit(activeLimit === i ? null : i)}
            style={{
              background: activeLimit === i ? `${limit.color}15` : 'var(--bg-card)',
              border: `2px solid ${activeLimit === i ? limit.color : 'var(--border)'}`,
              borderRadius: 14, padding: 16, textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{limit.icon}</div>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: activeLimit === i ? limit.color : 'var(--text-primary)',
            }}>
              {limit.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded detail */}
      <AnimatePresence mode="wait">
        {activeLimit !== null && (
          <motion.div
            key={activeLimit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--bg-card)', border: `2px solid ${limits[activeLimit].color}40`,
              borderRadius: 16, padding: 24,
            }}>
              <div style={{
                fontSize: 18, fontWeight: 800, color: limits[activeLimit].color,
                fontFamily: 'var(--font-heading)', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>{limits[activeLimit].icon}</span> {limits[activeLimit].title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {limits[activeLimit].details.map((detail, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      padding: '14px 18px', borderRadius: 12,
                      background: `${limits[activeLimit].color}08`,
                      border: `1px solid ${limits[activeLimit].color}20`,
                    }}
                  >
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: limits[activeLimit].color,
                      marginBottom: 6,
                    }}>
                      {detail.label}
                    </div>
                    <div style={{
                      fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
                    }}>
                      {detail.desc}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CAP triangle */}
              {activeLimit === 3 && limits[activeLimit].capClassifications && (
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: '#8b5cf6',
                    fontFamily: 'var(--font-heading)', marginBottom: 12,
                  }}>
                    Pick 2 of 3 -- Database Classifications
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16,
                  }}>
                    {['C', 'A', 'P'].map((letter, i) => {
                      const labels = ['Consistency', 'Availability', 'Partition Tolerance']
                      const colors = ['#3b82f6', '#10b981', '#f59e0b']
                      return (
                        <div key={letter} style={{
                          width: 70, height: 70, borderRadius: 16,
                          background: `${colors[i]}20`, border: `3px solid ${colors[i]}`,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: colors[i] }}>{letter}</div>
                          <div style={{ fontSize: 8, fontWeight: 600, color: colors[i] }}>{labels[i]}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {limits[activeLimit].capClassifications.map((c, i) => (
                      <div key={i} style={{
                        padding: '8px 16px', borderRadius: 10,
                        background: `${c.color}15`, border: `1.5px solid ${c.color}`,
                        fontSize: 13, fontWeight: 700, color: c.color,
                      }}>
                        {c.db}: <strong>{c.choice}</strong>
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

/* ---- Scaling Decision Tree ---- */
function ScalingDecisionTree() {
  const [path, setPath] = useState([])
  const [currentNode, setCurrentNode] = useState('root')

  const tree = {
    root: {
      question: 'What is your bottleneck?',
      options: [
        { label: 'Read Throughput', next: 'read' },
        { label: 'Write Throughput', next: 'write' },
        { label: 'Storage', next: 'storage' },
        { label: 'Connections', next: 'connections' },
      ],
    },
    read: {
      question: 'What is your read pattern?',
      options: [
        { label: 'Simple key lookups', next: 'read_cache' },
        { label: 'Complex queries / analytics', next: 'read_replica' },
      ],
    },
    read_cache: {
      recommendation: 'Add a Caching Layer',
      details: 'Use Redis or Memcached in front of your database. Cache hit ratio of 90%+ means 10x fewer database reads.',
      effort: 2,
      risk: 1,
    },
    read_replica: {
      recommendation: 'Add Read Replicas',
      details: 'Route all SELECT queries to read replicas. Each replica doubles your read capacity. Watch for replication lag.',
      effort: 3,
      risk: 2,
    },
    write: {
      question: 'Can you batch or defer writes?',
      options: [
        { label: 'Yes, writes can be async', next: 'write_queue' },
        { label: 'No, writes must be immediate', next: 'write_shard' },
      ],
    },
    write_queue: {
      recommendation: 'Use a Write Queue (Kafka / RabbitMQ)',
      details: 'Buffer writes in a message queue. Workers consume and write to DB at a controlled rate. Smooths traffic spikes.',
      effort: 3,
      risk: 2,
    },
    write_shard: {
      recommendation: 'Shard Your Database',
      details: 'Split data across multiple database servers by a shard key. Each server handles a fraction of the total writes.',
      effort: 5,
      risk: 4,
    },
    storage: {
      question: 'What type of data is growing?',
      options: [
        { label: 'Hot data (frequently accessed)', next: 'storage_shard' },
        { label: 'Cold data (logs, archives)', next: 'storage_archive' },
      ],
    },
    storage_shard: {
      recommendation: 'Horizontal Sharding',
      details: 'Distribute hot data across multiple servers. Each shard stores a partition of the data and handles its own queries.',
      effort: 5,
      risk: 4,
    },
    storage_archive: {
      recommendation: 'Data Archival + Tiered Storage',
      details: 'Move old data to cheaper storage (S3, cold tables). Keep only recent data in the primary database. Use partitioning.',
      effort: 2,
      risk: 1,
    },
    connections: {
      question: 'Where are connections exhausted?',
      options: [
        { label: 'Too many app instances', next: 'conn_pool' },
        { label: 'Database server limit', next: 'conn_proxy' },
      ],
    },
    conn_pool: {
      recommendation: 'Implement Connection Pooling',
      details: 'Use SQLAlchemy pool, HikariCP, or equivalent. Reuse connections instead of creating new ones per request.',
      effort: 1,
      risk: 1,
    },
    conn_proxy: {
      recommendation: 'Add a Connection Proxy (PgBouncer / ProxySQL)',
      details: 'Multiplex 10,000 app connections into 100 database connections. Sits between app and database transparently.',
      effort: 2,
      risk: 1,
    },
  }

  const handleSelect = (option) => {
    setPath(prev => [...prev, { node: currentNode, selected: option.label }])
    setCurrentNode(option.next)
  }

  const handleReset = () => {
    setPath([])
    setCurrentNode('root')
  }

  const node = tree[currentNode]
  const isLeaf = !!node.recommendation

  return (
    <div>
      {/* Path breadcrumbs */}
      {path.length > 0 && (
        <div style={{
          display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20,
          flexWrap: 'wrap',
        }}>
          {path.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: '#10b98115', color: '#10b981',
                fontFamily: "'Fira Code', monospace",
              }}>
                {p.selected}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>&rarr;</span>
            </div>
          ))}
        </div>
      )}

      {/* Current node */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {!isLeaf ? (
            <div>
              <div style={{
                fontSize: 20, fontWeight: 800, color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)', marginBottom: 20, textAlign: 'center',
              }}>
                {node.question}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: node.options.length <= 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(200, 1fr))',
                gap: 12,
              }}>
                {node.options.map((option, i) => {
                  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
                  const c = colors[i % colors.length]
                  return (
                    <motion.button
                      key={option.label}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(option)}
                      style={{
                        padding: '20px 16px', borderRadius: 14,
                        border: `2px solid ${c}`, background: `${c}10`,
                        color: c, fontWeight: 700, fontSize: 15,
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        textAlign: 'center',
                      }}
                    >
                      {option.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{
              background: '#10b98110', border: '2px solid #10b98140',
              borderRadius: 16, padding: 24,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#10b981',
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
              }}>
                Recommendation
              </div>
              <div style={{
                fontSize: 22, fontWeight: 800, color: '#10b981',
                fontFamily: 'var(--font-heading)', marginBottom: 12,
              }}>
                {node.recommendation}
              </div>
              <div style={{
                fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20,
              }}>
                {node.details}
              </div>

              {/* Effort / Risk */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{
                  flex: 1, minWidth: 140, padding: '12px 16px', borderRadius: 12,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Implementation Effort</div>
                  <div style={{ fontSize: 18, color: '#f59e0b' }}>
                    {'★'.repeat(node.effort)}{'☆'.repeat(5 - node.effort)}
                  </div>
                </div>
                <div style={{
                  flex: 1, minWidth: 140, padding: '12px 16px', borderRadius: 12,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Risk Level</div>
                  <div style={{ fontSize: 18, color: node.risk >= 4 ? '#ef4444' : node.risk >= 3 ? '#f59e0b' : '#10b981' }}>
                    {'★'.repeat(node.risk)}{'☆'.repeat(5 - node.risk)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reset button */}
      {path.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          style={{
            marginTop: 20, padding: '10px 24px', borderRadius: 12,
            border: '2px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)', fontWeight: 600,
            cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          Start Over
        </motion.button>
      )}
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic16_Sharding() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* ---- Section 1: When One Server Isn't Enough ---- */}
      <SectionBlock title="When One Server Isn't Enough" icon="📐" color="#3b82f6">
        <Neuron
          mood="explaining"
          message="There is a ceiling to how big a single server can get. You can add more RAM, more CPU, faster disks -- but eventually, no machine on Earth is big enough. That is when you go from vertical to horizontal."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Database Scaling Ceiling">
            <ScalingCeiling />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 2: Read Replicas ---- */}
      <SectionBlock title="Read Replicas -- Scale Your Reads" icon="📖" color="#10b981">
        <Neuron
          mood="thinking"
          message="90% of most applications are reads. Why make one server handle everything? Send your reads to copies of the database. The primary only handles writes."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Read Replica Traffic Splitter">
            <ReadReplicaSplitter />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 3: Sharding Strategies ---- */}
      <SectionBlock title="Sharding -- Split Your Data" icon="🔪" color="#8b5cf6">
        <Neuron
          mood="explaining"
          message="Sharding means splitting your database into smaller pieces called shards. Each shard holds a subset of your data. The trick is choosing HOW to split -- range, hash, or directory."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Sharding Strategy Visualizer">
            <ShardingStrategyVisualizer />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 4: Sharding in Practice ---- */}
      <SectionBlock title="Sharding in Practice" icon="🔧" color="#f59e0b">
        <Neuron
          mood="happy"
          message="MongoDB has native sharding built in. PostgreSQL uses Citus extension. MySQL uses Vitess proxy. Each approach has different complexity and trade-offs."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="SQL vs NoSQL Sharding">
            <SQLvsNoSQLSharding />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 5: The Hard Limits ---- */}
      <SectionBlock title="The Hard Limits" icon="🚧" color="#dc2626">
        <Neuron
          mood="thinking"
          message="No database is perfect. PostgreSQL has MVCC bloat, MySQL has row size limits, MongoDB cannot do JOINs, and the CAP theorem says you cannot have everything. Know your limits."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Database Limitation Explorer">
            <LimitationExplorer />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 6: Scaling Decision Framework ---- */}
      <SectionBlock title="Scaling Decision Framework" icon="🗺️" color="#059669">
        <Neuron
          mood="excited"
          message="Do not shard on day one! Follow this decision tree: first optimize queries, then cache, then replicate, and only THEN shard. Each step has different effort and risk."
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Scaling Decision Tree">
            <ScalingDecisionTree />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 7: Hindi Summary ---- */}
      <SectionBlock title="Hindi Summary" icon="🇮🇳" color="#ff9933">
        <HindiExplainer
          concept="शार्डिंग और रेप्लिकेशन"
          english="Sharding & Replication"
          explanation="Sharding का मतलब है database को छोटे-छोटे टुकड़ों में बांटना — जैसे Swiggy अलग-अलग शहरों के orders अलग-अलग database में रखता है। Mumbai का data एक shard पर, Delhi का data दूसरे shard पर। इससे कोई एक server overload नहीं होता। Replication का मतलब है primary database की copies (replicas) बनाना — जैसे एक दुकान में 5 काउंटर लगाना। सब READ queries replicas पर जाती हैं, WRITE सिर्फ primary पर। CAP Theorem कहता है कि distributed system में तीन चीजों में से सिर्फ दो मिल सकती हैं: Consistency (सब को same data दिखे), Availability (हमेशा response मिले), Partition Tolerance (network split हो तो भी चले)। PostgreSQL CP है (consistent but may become unavailable), Cassandra AP है (always available but may show stale data)। Sharding तब करो जब caching, replicas, और query optimization से काम न चले — यह सबसे complex solution है।"
          terms={[
            { hindi: 'शार्डिंग', english: 'Sharding', meaning: 'Database को pieces में बांटना ताकि load distribute हो' },
            { hindi: 'रेप्लिकेशन', english: 'Replication', meaning: 'Primary database की copies बनाना reads scale करने के लिए' },
            { hindi: 'रेप्लिका लैग', english: 'Replication Lag', meaning: 'Primary और replica के बीच data sync में delay' },
            { hindi: 'शार्ड की', english: 'Shard Key', meaning: 'वह column जिसके basis पर data split होता है' },
            { hindi: 'कैप थीयरम', english: 'CAP Theorem', meaning: 'Consistency, Availability, Partition Tolerance में से 2 ही चुन सकते हो' },
          ]}
        />
      </SectionBlock>

    </div>
  )
}
