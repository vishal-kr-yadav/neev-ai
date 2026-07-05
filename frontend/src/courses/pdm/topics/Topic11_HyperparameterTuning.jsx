import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 11 — Hyperparameter Tuning
   Grid search, Bayesian optimization, cross-validation
================================================================ */

/* ---- Helper ---- */
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

function lerp(a, b, t) { return a + (b - a) * t }

/* ----------------------------------------------------------------
   SECTION 1: Parameters vs Hyperparameters
---------------------------------------------------------------- */
function ParametersVsHyperparameters() {
  const [maxDepth, setMaxDepth] = useState(5)
  const [minSamples, setMinSamples] = useState(10)
  const [trained, setTrained] = useState(false)
  const [training, setTraining] = useState(false)
  const [splits, setSplits] = useState([])

  const runTraining = () => {
    setTraining(true)
    setTrained(false)
    setSplits([])
    const newSplits = []
    let count = 0
    const interval = setInterval(() => {
      count++
      newSplits.push({
        id: count,
        depth: Math.floor(Math.random() * maxDepth) + 1,
        threshold: (Math.random() * 100).toFixed(2),
        feature: ['vibration', 'temperature', 'RPM', 'pressure', 'current'][Math.floor(Math.random() * 5)],
      })
      setSplits([...newSplits])
      if (count >= 8) {
        clearInterval(interval)
        setTraining(false)
        setTrained(true)
      }
    }, 250)
  }

  const paramRows = [
    { name: 'Split Thresholds', example: 'vibration > 3.7', who: 'Learned from data', icon: '📊' },
    { name: 'Feature at Each Node', example: 'use "temperature"', who: 'Learned from data', icon: '🌿' },
    { name: 'Node Probabilities', example: 'P(failure) = 0.82', who: 'Learned from data', icon: '📈' },
  ]

  const hyperRows = [
    { name: 'max_depth', value: maxDepth, who: 'Set by YOU', icon: '🏗️' },
    { name: 'min_samples_split', value: minSamples, who: 'Set by YOU', icon: '🔧' },
    { name: 'n_estimators', value: 100, who: 'Set by YOU', icon: '🌳' },
  ]

  return (
    <SectionBlock icon="⚖️" title="Parameters vs Hyperparameters" color="#4f46e5">
      <Neuron
        mood="explaining"
        message="Think of hyperparameters as the rules you set BEFORE a game starts — like 'max 5 rounds'. Parameters are the actual moves that happen DURING the game, determined by the play."
        size="small"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 28 }}>
        {/* Parameters */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: '2px solid #93c5fd',
          borderRadius: 18,
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 26 }}>🎓</span>
            <div>
              <div style={{ fontWeight: 800, color: '#1e40af', fontSize: 16 }}>Parameters</div>
              <div style={{ fontSize: 12, color: '#3b82f6' }}>LEARNED during training</div>
            </div>
          </div>
          {paramRows.map(r => (
            <motion.div
              key={r.name}
              animate={trained ? { scale: [1, 1.04, 1] } : {}}
              transition={{ duration: 0.4 }}
              style={{
                background: 'white',
                border: '1px solid #bfdbfe',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20 }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3a8a' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>e.g. {r.example}</div>
                <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, marginTop: 2 }}>
                  {trained ? `Just learned: ${splits[Math.floor(Math.random() * splits.length)]?.threshold ?? '—'}` : r.who}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hyperparameters */}
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
          border: '2px solid #c4b5fd',
          borderRadius: 18,
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 26 }}>🎛️</span>
            <div>
              <div style={{ fontWeight: 800, color: '#6b21a8', fontSize: 16 }}>Hyperparameters</div>
              <div style={{ fontSize: 12, color: '#8b5cf6' }}>Set BEFORE training — by YOU</div>
            </div>
          </div>
          {hyperRows.map(r => (
            <div key={r.name} style={{
              background: 'white',
              border: '1px solid #ddd6fe',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#4c1d95' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                  Current: {r.name === 'max_depth' ? maxDepth : r.name === 'min_samples_split' ? minSamples : r.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InteractiveDemo
        title="Build a Random Forest — Adjust Hyperparameters"
        instruction="Set the hyperparameters, then click Train to watch the parameters (split rules) get learned from data."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 24 }}>
          <div>
            <label style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
              max_depth: <span style={{ color: '#4f46e5' }}>{maxDepth}</span>
            </label>
            <input
              type="range" min={1} max={15} value={maxDepth}
              onChange={e => setMaxDepth(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#4f46e5', marginTop: 8 }}
            />
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Controls tree height — deeper = more complex splits
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
              min_samples_split: <span style={{ color: '#8b5cf6' }}>{minSamples}</span>
            </label>
            <input
              type="range" min={2} max={50} value={minSamples}
              onChange={e => setMinSamples(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#8b5cf6', marginTop: 8 }}
            />
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Min samples needed to create a split
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <motion.button
            onClick={runTraining}
            disabled={training}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 36px',
              background: training ? '#9ca3af' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', border: 'none', borderRadius: 30,
              fontWeight: 700, fontSize: 16, cursor: training ? 'not-allowed' : 'pointer',
            }}
          >
            {training ? 'Training...' : 'Train Random Forest'}
          </motion.button>
        </div>

        <AnimatePresence>
          {splits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                background: '#f0fdf4', border: '1px solid #86efac',
                borderRadius: 12, padding: 16,
              }}
            >
              <div style={{ fontWeight: 700, color: '#166534', marginBottom: 10, fontSize: 14 }}>
                Learned Split Rules (Parameters):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {splits.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: '#dcfce7', border: '1px solid #86efac',
                      borderRadius: 8, padding: '6px 12px',
                      fontSize: 12, color: '#166534', fontWeight: 600,
                    }}
                  >
                    if {s.feature} &gt; {s.threshold}
                  </motion.div>
                ))}
              </div>
              {trai !== null && trai !== undefined && null}
              {trained && (
                <div style={{ marginTop: 12, color: '#166534', fontWeight: 700, fontSize: 14 }}>
                  Model trained! These {splits.length} split thresholds were determined by the DATA,
                  but the max_depth={maxDepth} constraint was set BY YOU.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveDemo>

      <HindiExplainer
        concept="पैरामीटर vs हाइपरपैरामीटर"
        english="Parameters vs Hyperparameters"
        explanation="जब आप AI को train करते हैं तो दो तरह की settings होती हैं। Parameters वो चीज़ें हैं जो model खुद data से सीखता है (जैसे 'अगर vibration > 3.7 तो failure')। Hyperparameters वो rules हैं जो आप पहले से set करते हैं (जैसे 'पेड़ की maximum depth 5 रखो')।"
        example="जैसे cricket में rules पहले से तय होते हैं (22 गज की pitch, 6 गेंद का over — ये hyperparameters हैं), और match के दौरान खिलाड़ी अपनी strategy खुद बनाते हैं (ये parameters हैं)।"
        terms={[
          { hindi: 'पैरामीटर', english: 'Parameter', meaning: 'Model का वो हिस्सा जो data से सीखता है — जैसे split threshold' },
          { hindi: 'हाइपरपैरामीटर', english: 'Hyperparameter', meaning: 'आप training से पहले जो तय करते हैं — जैसे max_depth' },
          { hindi: 'रैंडम फ़ॉरेस्ट', english: 'Random Forest', meaning: 'कई decision trees मिलकर एक बड़ा model बनाते हैं' },
        ]}
      />
    </SectionBlock>
  )
}

/* ----------------------------------------------------------------
   SECTION 2: Grid Search
---------------------------------------------------------------- */
const GRID_N_EST = [50, 100, 200, 500]
const GRID_DEPTH = [3, 5, 8, 12]

function generateGridScore(nEst, depth) {
  const base = 0.72
  const nBonus = Math.log10(nEst / 50) * 0.06
  const dBonus = (depth <= 8 ? depth * 0.01 : 8 * 0.01 - (depth - 8) * 0.006)
  const noise = (Math.random() - 0.5) * 0.04
  return Math.min(0.97, Math.max(0.65, base + nBonus + dBonus + noise))
}

function GridSearch() {
  const [scores, setScores] = useState({})
  const [running, setRunning] = useState(false)
  const [current, setCurrent] = useState(null)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)

  const total = GRID_N_EST.length * GRID_DEPTH.length

  const runGridSearch = () => {
    if (running) return
    setScores({})
    setCurrent(null)
    setDone(false)
    setProgress(0)
    setRunning(true)

    const cells = []
    for (let di = 0; di < GRID_DEPTH.length; di++) {
      for (let ni = 0; ni < GRID_N_EST.length; ni++) {
        cells.push({ ni, di })
      }
    }

    cells.forEach((cell, idx) => {
      setTimeout(() => {
        const key = `${cell.ni}_${cell.di}`
        const score = generateGridScore(GRID_N_EST[cell.ni], GRID_DEPTH[cell.di])
        setCurrent(key)
        setScores(prev => ({ ...prev, [key]: score }))
        setProgress(idx + 1)
        if (idx === cells.length - 1) {
          setTimeout(() => { setCurrent(null); setRunning(false); setDone(true) }, 400)
        }
      }, idx * 200)
    })
  }

  const reset = () => {
    clearTimeout(timerRef.current)
    setScores({})
    setCurrent(null)
    setDone(false)
    setProgress(0)
    setRunning(false)
  }

  const bestKey = Object.entries(scores).reduce((best, [k, v]) => v > (scores[best] ?? 0) ? k : best, '')
  const bestScore = scores[bestKey] ?? 0

  const getColor = (score) => {
    if (!score) return 'var(--bg-secondary)'
    const t = (score - 0.65) / 0.32
    const r = Math.round(lerp(239, 16, t))
    const g = Math.round(lerp(68, 185, t))
    const b = Math.round(lerp(68, 129, t))
    return `rgb(${r},${g},${b})`
  }

  return (
    <SectionBlock icon="🔲" title="Grid Search — Try Every Combination" color="#0ea5e9">
      <Neuron
        mood="thinking"
        message="Grid search is like tuning a radio by trying EVERY possible frequency — methodical, exhaustive, guaranteed to find the best in the grid. But it takes time..."
        size="small"
      />

      <div style={{
        background: '#f0f9ff', border: '1px solid #bae6fd',
        borderRadius: 14, padding: '14px 20px', marginBottom: 24,
        fontSize: 15, color: '#0369a1', fontWeight: 600,
      }}>
        Searching: n_estimators {JSON.stringify(GRID_N_EST)} × max_depth {JSON.stringify(GRID_DEPTH)} =
        <span style={{ color: '#dc2626', fontWeight: 800 }}> {total} combinations</span>
        {' '}× 5-fold CV =
        <span style={{ color: '#dc2626', fontWeight: 800 }}> {total * 5} model trainings!</span>
      </div>

      <InteractiveDemo
        title="Run Grid Search"
        instruction="Click Run to watch each cell fill in with its cross-validated AUC score. Green = best."
      >
        {/* Axis labels */}
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
            n_estimators →
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600,
            padding: '8px 0', marginRight: 4,
          }}>
            max_depth →
          </div>
          <div style={{ flex: 1 }}>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_N_EST.length}, 1fr)`, gap: 8, marginBottom: 6 }}>
              {GRID_N_EST.map(n => (
                <div key={n} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#0369a1' }}>
                  {n}
                </div>
              ))}
            </div>
            {/* Grid rows */}
            {GRID_DEPTH.map((depth, di) => (
              <div key={depth} style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_N_EST.length}, 1fr)`, gap: 8, marginBottom: 8, alignItems: 'center' }}>
                {GRID_N_EST.map((nEst, ni) => {
                  const key = `${ni}_${di}`
                  const score = scores[key]
                  const isCurrent = current === key
                  const isBest = done && key === bestKey

                  return (
                    <motion.div
                      key={key}
                      animate={{
                        scale: isCurrent ? 1.1 : isBest ? [1, 1.08, 1] : 1,
                        boxShadow: isBest ? ['0 0 0px #10b981', '0 0 20px #10b981', '0 0 8px #10b981'] : isCurrent ? '0 0 12px #0ea5e9' : 'none',
                      }}
                      transition={{ duration: 0.4 }}
                      style={{
                        height: 72,
                        borderRadius: 12,
                        background: score ? getColor(score) : isCurrent ? '#bae6fd' : 'var(--bg-secondary)',
                        border: isBest ? '3px solid #10b981' : isCurrent ? '2px solid #0ea5e9' : '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'default',
                        transition: 'background 0.3s',
                      }}
                    >
                      {score ? (
                        <>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                            {score.toFixed(3)}
                          </div>
                          {isBest && (
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#dcfce7', marginTop: 2 }}>BEST</div>
                          )}
                        </>
                      ) : isCurrent ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          style={{ fontSize: 18 }}
                        >
                          ⚙️
                        </motion.div>
                      ) : (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>—</div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            ))}
            {/* Row labels overlay */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'absolute', right: -50 }}>
              {GRID_DEPTH.map(d => <div key={d} style={{ height: 72, display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{d}</div>)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            <span>Progress: {progress}/{total} combinations ({(progress * 5)} CV folds trained)</span>
            {done && <span style={{ color: '#10b981', fontWeight: 700 }}>Best AUC: {bestScore.toFixed(3)}</span>}
          </div>
          <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #10b981)', borderRadius: 6 }}
              animate={{ width: `${(progress / total) * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
          <motion.button
            onClick={runGridSearch}
            disabled={running}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 32px',
              background: running ? '#9ca3af' : 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
              color: 'white', border: 'none', borderRadius: 30,
              fontWeight: 700, fontSize: 15, cursor: running ? 'not-allowed' : 'pointer',
            }}
          >
            {running ? `Running... (${progress}/${total})` : 'Run Grid Search'}
          </motion.button>
          {(done || progress > 0) && (
            <motion.button
              onClick={reset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--text-secondary)', border: '1.5px solid var(--border)', borderRadius: 30,
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
              }}
            >
              Reset
            </motion.button>
          )}
        </div>
      </InteractiveDemo>

      <NeuronTip type="warning">
        Grid search scales badly! 4 hyperparameters with 5 values each = 5⁴ = 625 combinations × 5-fold CV = 3,125 model trainings. That's why smarter search strategies exist.
      </NeuronTip>

      <HindiExplainer
        concept="ग्रिड सर्च — हर combination try करो"
        english="Grid Search"
        explanation="Grid Search एक systematic तरीका है जिसमें हम सभी hyperparameters के सभी possible combinations try करते हैं। जैसे एक दुकानदार हर shelf की हर item check करता है — कोई भी miss नहीं होती। यह method thorough है लेकिन बहुत time-consuming हो सकती है।"
        example="मान लो तुम्हारी factory में एक machine calibrate करनी है। Grid Search वैसे है जैसे mechanic हर bolt को 1cm से 10cm तक हर possible size में try करे — guaranteed सही size मिलेगी, पर बहुत समय लगेगा।"
        terms={[
          { hindi: 'संयोजन', english: 'Combination', meaning: 'कई parameters की एक specific setting — जैसे n_estimators=100 AND max_depth=5' },
          { hindi: 'क्रॉस-वेलिडेशन', english: 'Cross-Validation', meaning: 'हर combination को multiple बार test करना ताकि reliable score मिले' },
          { hindi: 'खोज स्थान', english: 'Search Space', meaning: 'सभी possible hyperparameter values का set — जितना बड़ा, उतना slow Grid Search' },
        ]}
      />
    </SectionBlock>
  )
}

/* ----------------------------------------------------------------
   SECTION 3: Random Search
---------------------------------------------------------------- */
function RandomSearch() {
  const [trials, setTrials] = useState([])
  const [running, setRunning] = useState(false)
  const [best, setBest] = useState(null)
  const containerRef = useRef(null)

  const generateTrialScore = (x, y) => {
    // Sweet spot around (0.65, 0.55) in normalized [0,1] space
    const dx = x - 0.65, dy = y - 0.55
    const base = 0.97 * Math.exp(-(dx * dx + dy * dy) / 0.08)
    const secondary = 0.88 * Math.exp(-((x - 0.3) * (x - 0.3) + (y - 0.75) * (y - 0.75)) / 0.06)
    return Math.min(0.97, Math.max(0.61, base + secondary * 0.4 + (Math.random() - 0.5) * 0.04))
  }

  const addTrial = () => {
    const x = Math.random()
    const y = Math.random()
    const score = generateTrialScore(x, y)
    const newTrial = { id: Date.now(), x, y, score }
    setTrials(prev => {
      const updated = [...prev, newTrial]
      const bestT = updated.reduce((b, t) => t.score > b.score ? t : b, updated[0])
      setBest(bestT)
      return updated
    })
  }

  const runAll = () => {
    if (running) return
    setTrials([])
    setBest(null)
    setRunning(true)
    let count = 0
    const interval = setInterval(() => {
      count++
      const x = Math.random()
      const y = Math.random()
      const score = generateTrialScore(x, y)
      setTrials(prev => {
        const updated = [...prev, { id: count, x, y, score }]
        const bestT = updated.reduce((b, t) => t.score > b.score ? t : b, updated[0])
        setBest(bestT)
        return updated
      })
      if (count >= 16) {
        clearInterval(interval)
        setRunning(false)
      }
    }, 180)
  }

  const reset = () => {
    setTrials([])
    setBest(null)
    setRunning(false)
  }

  // Grid search baseline (for comparison)
  const gridBest = 0.891

  return (
    <SectionBlock icon="🎲" title="Random Search — Smart Sampling" color="#8b5cf6">
      <Neuron
        mood="excited"
        message="Instead of a rigid grid, random search throws darts randomly across the whole space. Sounds dumb — but it actually finds better results in the same number of tries!"
        size="small"
      />

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        background: '#faf5ff', border: '1px solid #ddd6fe',
        borderRadius: 14, padding: 20, marginBottom: 24,
      }}>
        <div>
          <div style={{ fontWeight: 700, color: '#6b21a8', marginBottom: 8 }}>Grid Search (16 trials)</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Tries 4 fixed values per axis<br />
            Samples only 4 unique depths<br />
            Samples only 4 unique n_estimators<br />
            Best AUC: <strong style={{ color: '#6b21a8' }}>{gridBest.toFixed(3)}</strong>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>Random Search (16 trials)</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Samples from the FULL continuous range<br />
            16 unique depth values (not just 4)<br />
            16 unique n_estimators values<br />
            Best AUC: <strong style={{ color: best ? '#10b981' : '#6b7280' }}>
              {best ? best.score.toFixed(3) : '?'}
            </strong>
          </div>
        </div>
      </div>

      <InteractiveDemo
        title="Random Search Visualization"
        instruction="Click 'Run 16 Trials' or click anywhere on the search space to add a random trial. Watch how it explores more of the space!"
      >
        {/* 2D scatter plot */}
        <div ref={containerRef} style={{ position: 'relative', height: 320, background: 'linear-gradient(135deg, #f0f9ff, #ede9fe)', borderRadius: 14, marginBottom: 16, overflow: 'hidden', cursor: 'crosshair' }}
          onClick={(e) => {
            if (running) return
            const rect = e.currentTarget.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width
            const y = 1 - (e.clientY - rect.top) / rect.height
            const score = generateTrialScore(x, y)
            const newTrial = { id: Date.now(), x, y, score }
            setTrials(prev => {
              const updated = [...prev, newTrial]
              const bestT = updated.reduce((b, t) => t.score > b.score ? t : b, updated[0])
              setBest(bestT)
              return updated
            })
          }}
        >
          {/* Axis labels */}
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
            n_estimators (50 → 500)
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 8, display: 'flex', alignItems: 'center', fontSize: 12, color: '#6b7280', fontWeight: 600, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            max_depth (2 → 15)
          </div>

          {/* Grid overlay (dotted) */}
          {[0.25, 0.5, 0.75].map(p => (
            <div key={`gx${p}`} style={{ position: 'absolute', left: `${p * 100}%`, top: 0, bottom: 0, borderLeft: '1px dashed rgba(100,100,200,0.2)', pointerEvents: 'none' }} />
          ))}
          {[0.25, 0.5, 0.75].map(p => (
            <div key={`gy${p}`} style={{ position: 'absolute', top: `${p * 100}%`, left: 0, right: 0, borderTop: '1px dashed rgba(100,100,200,0.2)', pointerEvents: 'none' }} />
          ))}

          {/* Trial dots */}
          <AnimatePresence>
            {trials.map((t, i) => {
              const isBestTrial = best && t.id === best.id
              const color = t.score > 0.90 ? '#10b981' : t.score > 0.83 ? '#3b82f6' : t.score > 0.75 ? '#f59e0b' : '#ef4444'
              return (
                <motion.div
                  key={t.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    position: 'absolute',
                    left: `${t.x * 100}%`,
                    bottom: `${t.y * 100}%`,
                    transform: 'translate(-50%, 50%)',
                    width: isBestTrial ? 28 : 20,
                    height: isBestTrial ? 28 : 20,
                    borderRadius: '50%',
                    background: color,
                    border: isBestTrial ? '3px solid white' : '2px solid white',
                    boxShadow: isBestTrial ? `0 0 16px ${color}` : `0 2px 8px ${color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 800, color: 'white',
                    zIndex: isBestTrial ? 10 : 1,
                    cursor: 'default',
                  }}
                  title={`AUC: ${t.score.toFixed(3)}`}
                >
                  {i + 1}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Legend */}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['#10b981', '>0.90'], ['#3b82f6', '>0.83'], ['#f59e0b', '>0.75'], ['#ef4444', '<0.75']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#374151', fontWeight: 600 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            onClick={runAll}
            disabled={running}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 32px',
              background: running ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: 'white', border: 'none', borderRadius: 30,
              fontWeight: 700, fontSize: 15, cursor: running ? 'not-allowed' : 'pointer',
            }}
          >
            {running ? 'Running...' : 'Run 16 Random Trials'}
          </motion.button>
          <motion.button
            onClick={addTrial}
            disabled={running}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
              color: 'white', border: 'none', borderRadius: 30,
              fontWeight: 600, fontSize: 15, cursor: 'pointer',
            }}
          >
            + Add Random Trial
          </motion.button>
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 20px', background: 'transparent',
              color: 'var(--text-secondary)', border: '1.5px solid var(--border)', borderRadius: 30,
              fontWeight: 600, fontSize: 15, cursor: 'pointer',
            }}
          >
            Reset
          </motion.button>
        </div>

        {trials.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 16, padding: 16,
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 12, fontSize: 14, color: '#166534', fontWeight: 600,
            }}
          >
            {trials.length} trials run.
            {best && (
              <> Best AUC found: <strong>{best.score.toFixed(3)}</strong> (n_est={Math.round(50 + best.x * 450)}, depth={Math.round(2 + best.y * 13)}).
                {best.score > gridBest && (
                  <span style={{ color: '#059669', fontWeight: 800 }}>
                    {' '}Better than grid search ({gridBest.toFixed(3)}) in the same number of trials!
                  </span>
                )}
              </>
            )}
          </motion.div>
        )}
      </InteractiveDemo>

      <NeuronTip type="tip">
        Random search is often 10-100x more efficient than grid search. By sampling randomly, it explores far more unique values per hyperparameter in the same number of trials.
      </NeuronTip>

      <HindiExplainer
        concept="रैंडम सर्च — अंदाज़े से खोजो"
        english="Random Search"
        explanation="Random Search में हम hyperparameters की random values try करते हैं — कोई fixed grid नहीं। यह surprising तरीके से Grid Search से better results देता है! क्योंकि यह पूरे search space को cover करता है, fixed points की जगह। कम trials में ज़्यादा unique values explore होती हैं।"
        example="जैसे cricket में जब batsman किसी specific shot की जगह spontaneously कुछ unexpected try करता है — sometimes वही shot सबसे ज़्यादा runs लाती है। Fixed pattern तोड़ने से surprise results मिलते हैं।"
        terms={[
          { hindi: 'यादृच्छिक नमूना', english: 'Random Sampling', meaning: 'बिना किसी pattern के space में random points choose करना' },
          { hindi: 'निरंतर श्रेणी', english: 'Continuous Range', meaning: 'Fixed values नहीं, बल्कि किसी भी value को pick करना — जैसे 1-500 में कोई भी number' },
          { hindi: 'कुशलता', english: 'Efficiency', meaning: 'कम trials में बेहतर result ढूंढना — Random Search इसी में आगे है' },
        ]}
      />
    </SectionBlock>
  )
}

/* ----------------------------------------------------------------
   SECTION 4: Bayesian Optimization (Optuna)
---------------------------------------------------------------- */
const OPTUNA_WIDTH = 300
const OPTUNA_HEIGHT = 240

function generateLandscape(nx, ny) {
  const landscape = []
  for (let j = 0; j < ny; j++) {
    const row = []
    for (let i = 0; i < nx; i++) {
      const x = i / (nx - 1)
      const y = j / (ny - 1)
      const peak1 = Math.exp(-((x - 0.7) ** 2 + (y - 0.6) ** 2) / 0.04)
      const peak2 = Math.exp(-((x - 0.3) ** 2 + (y - 0.2) ** 2) / 0.07) * 0.75
      const noise = Math.sin(x * 8) * Math.cos(y * 6) * 0.04
      row.push(Math.min(1, Math.max(0, peak1 * 0.97 + peak2 * 0.4 + noise + 0.25)))
    }
    landscape.push(row)
  }
  return landscape
}

function BayesianOpt() {
  const NX = 30, NY = 24
  const [landscape] = useState(() => generateLandscape(NX, NY))
  const [trials, setTrials] = useState([])
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [aucHistory, setAucHistory] = useState([])
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cw = canvas.width, ch = canvas.height
    const cellW = cw / NX, cellH = ch / NY
    landscape.forEach((row, j) => {
      row.forEach((v, i) => {
        const r = Math.round(lerp(16, 5, v))
        const g = Math.round(lerp(24, 150, v))
        const b = Math.round(lerp(90, 105, v))
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1)
      })
    })
  }, [landscape])

  const getLandscapeScore = (x, y) => {
    const xi = clamp(Math.floor(x * NX), 0, NX - 1)
    const yi = clamp(Math.floor(y * NY), 0, NY - 1)
    return 0.60 + landscape[yi][xi] * 0.37
  }

  const getNextBayesianPoint = (existingTrials) => {
    if (existingTrials.length < 3) {
      return { x: Math.random(), y: Math.random() }
    }
    // Simplified acquisition: sample 40 candidates, pick highest predicted value near best known
    const best = existingTrials.reduce((b, t) => t.score > b.score ? t : b, existingTrials[0])
    let bestCand = null, bestVal = -Infinity
    for (let k = 0; k < 40; k++) {
      const cx = clamp(best.x + (Math.random() - 0.5) * 0.5 * (1 - existingTrials.length / 30), 0, 1)
      const cy = clamp(best.y + (Math.random() - 0.5) * 0.5 * (1 - existingTrials.length / 30), 0, 1)
      const val = getLandscapeScore(cx, cy) + Math.random() * 0.05
      if (val > bestVal) { bestVal = val; bestCand = { x: cx, y: cy } }
    }
    return bestCand
  }

  const runOptuna = () => {
    if (running) return
    setTrials([])
    setAucHistory([])
    setRunning(true)
    setPhase('exploring')

    let count = 0
    const allTrials = []

    const addTrial = () => {
      const point = getNextBayesianPoint(allTrials)
      const score = getLandscapeScore(point.x, point.y)
      const trial = { id: count + 1, ...point, score }
      allTrials.push(trial)
      count++

      setTrials([...allTrials])
      setAucHistory(prev => [...prev, score])
      if (count < 4) setPhase('exploring')
      else setPhase('converging')

      if (count < 20) {
        setTimeout(addTrial, 280)
      } else {
        setRunning(false)
        setPhase('done')
      }
    }

    setTimeout(addTrial, 200)
  }

  const reset = () => {
    setTrials([])
    setAucHistory([])
    setPhase('idle')
    setRunning(false)
  }

  const bestTrial = trials.length > 0 ? trials.reduce((b, t) => t.score > b.score ? t : b, trials[0]) : null

  return (
    <SectionBlock icon="🧠" title="Bayesian Optimization — Learn While Searching" color="#ec4899">
      <Neuron
        mood="thinking"
        message="Bayesian optimization builds a MAP of where good results are. After each trial, it PREDICTS where the next best point is — like a detective following clues instead of checking every house."
        size="small"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Grid Search', trials: '80+', color: '#ef4444', icon: '🔲', desc: 'Tries every combination' },
          { label: 'Random Search', trials: '~30', color: '#f59e0b', icon: '🎲', desc: 'Random sampling' },
          { label: 'Bayesian (Optuna)', trials: '~20', color: '#10b981', icon: '🧠', desc: 'Learns from each trial' },
        ].map(m => (
          <div key={m.label} style={{
            background: `${m.color}12`, border: `1.5px solid ${m.color}44`,
            borderRadius: 14, padding: 16, textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{m.trials}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>trials to find optimum</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <InteractiveDemo
        title="Optuna-style Bayesian Optimization"
        instruction="Run 20 trials. Watch early trials explore randomly, then later trials converge around the promising region (brighter area)."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Landscape canvas */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--text-primary)' }}>
              Objective Landscape (brighter = higher AUC)
            </div>
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <canvas
                ref={canvasRef}
                width={OPTUNA_WIDTH}
                height={OPTUNA_HEIGHT}
                style={{ width: '100%', borderRadius: 12, border: '2px solid var(--border)', display: 'block' }}
              />
              {/* Trial dots on canvas */}
              {trials.map((t, i) => {
                const isBest = bestTrial && t.id === bestTrial.id
                return (
                  <motion.div
                    key={t.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      left: `${t.x * 100}%`,
                      top: `${t.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      width: isBest ? 18 : 13,
                      height: isBest ? 18 : 13,
                      borderRadius: '50%',
                      background: isBest ? '#fbbf24' : i < 3 ? '#60a5fa' : '#f472b6',
                      border: '2px solid white',
                      boxShadow: isBest ? '0 0 12px #fbbf24' : '0 1px 4px rgba(0,0,0,0.5)',
                      zIndex: isBest ? 10 : 1,
                      fontSize: 8, fontWeight: 800, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </motion.div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span>🔵 Early (random)</span>
              <span>🟣 Later (guided)</span>
              <span>🌕 Best found</span>
            </div>
          </div>

          {/* AUC history chart */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--text-primary)' }}>
              AUC Score by Trial (converges fast!)
            </div>
            <div style={{ height: OPTUNA_HEIGHT, background: '#f9fafb', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 12px', display: 'flex', alignItems: 'flex-end', gap: 3, overflow: 'hidden', position: 'relative' }}>
              {aucHistory.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                  Run optimization to see chart
                </div>
              )}
              {aucHistory.map((score, i) => {
                const normalised = (score - 0.60) / 0.37
                const runningBest = Math.max(...aucHistory.slice(0, i + 1))
                const isNewBest = score === runningBest
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, normalised * 85)}%` }}
                    style={{
                      flex: 1, borderRadius: '4px 4px 0 0',
                      background: isNewBest ? '#10b981' : '#93c5fd',
                      position: 'relative',
                    }}
                    title={`Trial ${i + 1}: AUC ${score.toFixed(3)}`}
                  >
                    {isNewBest && (
                      <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#065f46', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        ↑NEW
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981', display: 'inline-block' }} /> New best
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#93c5fd', display: 'inline-block' }} /> Trial
              </span>
            </div>

            {phase !== 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  marginTop: 12, padding: '10px 14px',
                  background: phase === 'converging' || phase === 'done' ? '#f0fdf4' : '#eff6ff',
                  border: `1px solid ${phase === 'converging' || phase === 'done' ? '#86efac' : '#bfdbfe'}`,
                  borderRadius: 10, fontSize: 13,
                  color: phase === 'converging' || phase === 'done' ? '#166534' : '#1e40af',
                  fontWeight: 600,
                }}
              >
                {phase === 'exploring' && `Exploring randomly... (${trials.length}/3 initial trials)`}
                {phase === 'converging' && `Gaussian process guiding search → converging on optimum!`}
                {phase === 'done' && bestTrial && `Done! Best AUC: ${bestTrial.score.toFixed(3)} found in just 20 trials!`}
              </motion.div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
          <motion.button
            onClick={runOptuna}
            disabled={running}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 36px',
              background: running ? '#9ca3af' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: 'white', border: 'none', borderRadius: 30,
              fontWeight: 700, fontSize: 15, cursor: running ? 'not-allowed' : 'pointer',
            }}
          >
            {running ? `Trial ${trials.length}/20...` : 'Run Bayesian Optimization'}
          </motion.button>
          {trials.length > 0 && !running && (
            <motion.button onClick={reset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-secondary)', border: '1.5px solid var(--border)', borderRadius: 30, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Reset
            </motion.button>
          )}
        </div>
      </InteractiveDemo>

      <NeuronTip type="deep">
        Optuna uses Tree-structured Parzen Estimator (TPE) — a Bayesian algorithm that models P(hyperparams | good_result) and P(hyperparams | bad_result) separately to guide exploration toward promising regions.
      </NeuronTip>

      <HindiExplainer
        concept="बेयेसियन अनुकूलन — सीखते हुए खोजो"
        english="Bayesian Optimization"
        explanation="Bayesian Optimization सबसे smart तरीका है। यह हर trial से सीखता है — 'पिछली बार यहाँ अच्छा result मिला था, तो उसके आस-पास और try करते हैं।' यह एक detective की तरह है जो clues follow करके सही जगह पहुँचता है, हर घर check करने की बजाय।"
        example="मान लो तुम्हें factory की एक machine का optimal temperature ढूंढना है। Bayesian method पहले कुछ random temperatures try करेगा, फिर जहाँ best performance मिला उसके आसपास search करेगा — बिना सारी temperatures try किए।"
        terms={[
          { hindi: 'अधिग्रहण फ़ंक्शन', english: 'Acquisition Function', meaning: 'वो formula जो decide करता है कि अगला trial कहाँ run करना है' },
          { hindi: 'गॉसियन प्रक्रिया', english: 'Gaussian Process', meaning: 'एक probabilistic model जो predict करता है कि किस hyperparameter से अच्छा result मिलेगा' },
          { hindi: 'अभिसरण', english: 'Convergence', meaning: 'जब model optimal solution के करीब पहुँच जाए और trials improve होना बंद हो जाएँ' },
        ]}
      />
    </SectionBlock>
  )
}

/* ----------------------------------------------------------------
   SECTION 5: Cross-Validation
---------------------------------------------------------------- */
function CrossValidation() {
  const [k, setK] = useState(5)
  const [activeFold, setActiveFold] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [foldScores, setFoldScores] = useState([])
  const [done, setDone] = useState(false)

  const N_BLOCKS = 100
  const blocks = Array.from({ length: N_BLOCKS }, (_, i) => i)

  const foldSize = Math.floor(N_BLOCKS / k)

  const getFoldForBlock = (blockIdx) => Math.floor(blockIdx / foldSize)

  const FOLD_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

  const generateFoldScore = (foldIdx) => {
    const base = 0.87 + (Math.random() - 0.5) * 0.06
    return Math.min(0.96, Math.max(0.78, base))
  }

  const runCV = () => {
    if (animating) return
    setActiveFold(null)
    setFoldScores([])
    setDone(false)
    setAnimating(true)

    const scores = []
    for (let f = 0; f < k; f++) {
      setTimeout(() => {
        setActiveFold(f)
        const score = generateFoldScore(f)
        scores.push(score)
        setFoldScores([...scores])
        if (f === k - 1) {
          setTimeout(() => {
            setAnimating(false)
            setDone(true)
            setActiveFold(null)
          }, 600)
        }
      }, f * 700)
    }
  }

  const mean = foldScores.length > 0 ? foldScores.reduce((a, b) => a + b, 0) / foldScores.length : null
  const std = foldScores.length > 1 ? Math.sqrt(foldScores.reduce((acc, v) => acc + (v - mean) ** 2, 0) / foldScores.length) : null

  const varianceNote = k <= 3 ? 'High variance (few folds)' : k <= 6 ? 'Moderate variance' : 'Low variance (many folds)'

  return (
    <SectionBlock icon="🔀" title="Cross-Validation — Get an Honest Score" color="#0ea5e9">
      <Neuron
        mood="explaining"
        message="A single train/test split is like judging a chef by ONE dish. Cross-validation makes them cook K times with different ingredients each time — then you average the scores for a fair assessment."
        size="small"
      />

      <InteractiveDemo
        title="K-Fold Cross-Validation Demo"
        instruction="Select K, then click Run CV. Watch each fold become the test set, one at a time."
      >
        {/* K selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>K =</span>
          {[3, 5, 10].map(kVal => (
            <motion.button
              key={kVal}
              onClick={() => { setK(kVal); setFoldScores([]); setDone(false); setActiveFold(null) }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              style={{
                padding: '8px 22px',
                background: k === kVal ? 'linear-gradient(135deg, #0ea5e9, #3b82f6)' : 'var(--bg-secondary)',
                color: k === kVal ? 'white' : 'var(--text-primary)',
                border: k === kVal ? 'none' : '1.5px solid var(--border)',
                borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: 'pointer',
              }}
            >
              {kVal}
            </motion.button>
          ))}
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {varianceNote}
          </span>
        </div>

        {/* Data blocks */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            100 sensor readings from machinery:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {blocks.map(i => {
              const fold = getFoldForBlock(i)
              const isTest = activeFold !== null && fold === activeFold
              const isTrainActive = activeFold !== null && fold !== activeFold
              const isPastTest = foldScores.length > fold && activeFold !== fold
              return (
                <motion.div
                  key={i}
                  animate={{
                    scale: isTest ? 1.3 : 1,
                    opacity: isTrainActive ? 0.45 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    width: 12, height: 18, borderRadius: 3,
                    background: isTest
                      ? FOLD_COLORS[fold % FOLD_COLORS.length]
                      : isPastTest
                        ? `${FOLD_COLORS[fold % FOLD_COLORS.length]}66`
                        : 'var(--bg-secondary)',
                    border: `1px solid ${isTest ? FOLD_COLORS[fold % FOLD_COLORS.length] : 'var(--border)'}`,
                    transition: 'background 0.3s',
                  }}
                  title={`Sample ${i + 1} — Fold ${fold + 1}`}
                />
              )
            })}
          </div>
        </div>

        {/* Fold scores */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {Array.from({ length: k }, (_, f) => (
            <motion.div
              key={f}
              animate={{ scale: activeFold === f ? 1.1 : 1 }}
              style={{
                padding: '10px 16px',
                background: activeFold === f ? FOLD_COLORS[f % FOLD_COLORS.length] : 'var(--bg-secondary)',
                border: `2px solid ${activeFold === f ? FOLD_COLORS[f % FOLD_COLORS.length] : 'var(--border)'}`,
                borderRadius: 12,
                textAlign: 'center',
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: activeFold === f ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}>
                Fold {f + 1}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: activeFold === f ? 'white' : foldScores[f] ? 'var(--text-primary)' : 'var(--border)' }}>
                {activeFold === f ? '...' : foldScores[f] ? foldScores[f].toFixed(3) : '—'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence>
          {done && mean !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#f0fdf4', border: '2px solid #86efac',
                borderRadius: 14, padding: 20, marginBottom: 20,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 18, color: '#166534', marginBottom: 8 }}>
                Cross-Validation Result: {mean.toFixed(3)} ± {std?.toFixed(3)}
              </div>
              <div style={{ fontSize: 14, color: '#166534', lineHeight: 1.7 }}>
                Your model's AUC is <strong>{mean.toFixed(3)}</strong> on average, with a spread of ±{std?.toFixed(3)} across folds.
                <br />
                This is more trustworthy than a single test score — you've seen how the model performs across {k} different scenarios.
                {k >= 10 && (
                  <><br /><span style={{ color: '#059669' }}>
                    K=10 gives the most reliable estimate, but needs 10x more training time!
                  </span></>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <motion.button
            onClick={runCV}
            disabled={animating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 32px',
              background: animating ? '#9ca3af' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: 'white', border: 'none', borderRadius: 30,
              fontWeight: 700, fontSize: 15, cursor: animating ? 'not-allowed' : 'pointer',
            }}
          >
            {animating ? `Testing Fold ${(activeFold ?? 0) + 1}/${k}...` : `Run ${k}-Fold CV`}
          </motion.button>
        </div>
      </InteractiveDemo>

      <NeuronTip type="example">
        In PdM, never trust a single test score. A compressor dataset might have "easy" months and "hard" months. K-fold CV ensures your model is tested on all conditions — giving you AUC = 0.89 ± 0.03 instead of a lucky 0.94.
      </NeuronTip>

      <HindiExplainer
        concept="क्रॉस-वेलिडेशन — एक से ज़्यादा बार परीक्षा"
        english="Cross-Validation"
        explanation="सिर्फ एक बार test करना fair नहीं है। Cross-Validation में data को K भागों में बांटते हैं, और हर बार एक अलग भाग को test set बनाते हैं। K=5 में model 5 बार test होता है, फिर average score निकालते हैं।"
        example="जैसे school में साल में एक ही exam की जगह हर महीने test होता है — तो पता चलता है student सच में कितना सीखा है, न कि बस एक दिन lucky था।"
        terms={[
          { hindi: 'फोल्ड', english: 'Fold', meaning: 'Data का एक भाग जो बारी-बारी test set बनता है' },
          { hindi: 'औसत', english: 'Mean', meaning: 'सभी folds के scores का average' },
          { hindi: 'विचलन', english: 'Standard Deviation', meaning: 'Scores में कितना उतार-चढ़ाव है' },
        ]}
      />
    </SectionBlock>
  )
}

/* ----------------------------------------------------------------
   SECTION 6: Tune Your PdM Model
---------------------------------------------------------------- */
function PdMTuningDashboard() {
  const [nEst, setNEst] = useState(200)
  const [maxDepth, setMaxDepth] = useState(6)
  const [lr, setLr] = useState(0.1)
  const [minChild, setMinChild] = useState(3)
  const [subsample, setSubsample] = useState(0.8)

  const PRESETS = {
    conservative: { nEst: 100, maxDepth: 4, lr: 0.05, minChild: 5, subsample: 0.7, label: 'Conservative', desc: 'Shallow, slow learner — less overfit risk' },
    aggressive: { nEst: 400, maxDepth: 12, lr: 0.3, minChild: 1, subsample: 0.9, label: 'Aggressive', desc: 'Deep, fast learner — high overfit risk' },
    balanced: { nEst: 200, maxDepth: 6, lr: 0.1, minChild: 3, subsample: 0.8, label: 'Balanced', desc: 'Recommended starting point' },
  }

  const applyPreset = (preset) => {
    const p = PRESETS[preset]
    setNEst(p.nEst); setMaxDepth(p.maxDepth); setLr(p.lr); setMinChild(p.minChild); setSubsample(p.subsample)
  }

  // Simulated metrics
  const computeMetrics = () => {
    const depthFactor = maxDepth / 15
    const estFactor = Math.log10(nEst) / Math.log10(500)
    const lrFactor = lr / 0.5
    const basAUC = 0.88

    const complexity = depthFactor * 0.6 + lrFactor * 0.3 + estFactor * 0.1
    const overfitRisk = Math.max(0, (maxDepth > 8 ? (maxDepth - 8) * 0.06 : 0) + (nEst > 300 ? (nEst - 300) / 200 * 0.04 : 0) + (lr > 0.25 ? (lr - 0.25) * 0.2 : 0))

    const auc = Math.min(0.97, basAUC + complexity * 0.07 - overfitRisk * 0.12 + (minChild > 5 ? 0.01 : 0) + subsample * 0.02)
    const f1 = Math.min(0.96, auc * 0.95 - overfitRisk * 0.05)
    const trainTime = Math.round(nEst * maxDepth * 0.3)

    return {
      auc: Math.max(0.70, auc),
      f1: Math.max(0.68, f1),
      trainTime,
      overfitRisk: Math.min(1, overfitRisk),
    }
  }

  const metrics = computeMetrics()
  const isOverfit = maxDepth > 10 && nEst > 300

  const sliders = [
    { label: 'n_estimators', value: nEst, set: setNEst, min: 50, max: 500, step: 10, color: '#3b82f6', desc: 'Number of trees' },
    { label: 'max_depth', value: maxDepth, set: setMaxDepth, min: 2, max: 15, step: 1, color: '#8b5cf6', desc: 'Maximum tree depth' },
    { label: 'learning_rate', value: lr, set: setLr, min: 0.01, max: 0.5, step: 0.01, color: '#f59e0b', desc: 'Step size for gradient boosting' },
    { label: 'min_child_weight', value: minChild, set: setMinChild, min: 1, max: 10, step: 1, color: '#10b981', desc: 'Minimum sum of weights in a leaf' },
    { label: 'subsample', value: subsample, set: setSubsample, min: 0.5, max: 1.0, step: 0.05, color: '#ec4899', desc: 'Fraction of samples per tree' },
  ]

  return (
    <SectionBlock icon="🎛️" title="Tune Your PdM Model — XGBoost Dashboard" color="#10b981">
      <Neuron
        mood="excited"
        message="This is the real-world workflow — adjust XGBoost hyperparameters and watch how AUC, F1, training time, and overfit risk change in real time!"
        size="small"
      />

      {/* Presets */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {Object.entries(PRESETS).map(([key, p]) => (
          <motion.button
            key={key}
            onClick={() => applyPreset(key)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 22px',
              background: key === 'balanced' ? 'linear-gradient(135deg, #10b981, #059669)' : key === 'aggressive' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white', border: 'none', borderRadius: 30,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            {p.label}
          </motion.button>
        ))}
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center', fontStyle: 'italic' }}>
          {Object.values(PRESETS).find(p => p.nEst === nEst && p.maxDepth === maxDepth)?.desc ?? 'Custom configuration'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Sliders */}
        <div>
          {sliders.map(s => (
            <div key={s.label} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{s.label}</label>
                <span style={{ fontWeight: 800, fontSize: 14, color: s.color }}>
                  {typeof s.value === 'number' && s.step < 1 ? s.value.toFixed(2) : s.value}
                </span>
              </div>
              <input
                type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                onChange={e => s.set(Number(e.target.value))}
                style={{ width: '100%', accentColor: s.color }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Live metrics panel */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
            Live Model Performance
          </div>

          {/* AUC */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>AUC Score</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: metrics.auc > 0.90 ? '#10b981' : metrics.auc > 0.83 ? '#f59e0b' : '#ef4444' }}>
                {metrics.auc.toFixed(3)}
              </span>
            </div>
            <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: metrics.auc > 0.90 ? '#10b981' : metrics.auc > 0.83 ? '#f59e0b' : '#ef4444', borderRadius: 6 }}
                animate={{ width: `${((metrics.auc - 0.60) / 0.37) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* F1 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>F1 Score</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: metrics.f1 > 0.88 ? '#10b981' : metrics.f1 > 0.80 ? '#f59e0b' : '#ef4444' }}>
                {metrics.f1.toFixed(3)}
              </span>
            </div>
            <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: metrics.f1 > 0.88 ? '#10b981' : metrics.f1 > 0.80 ? '#f59e0b' : '#ef4444', borderRadius: 6 }}
                animate={{ width: `${((metrics.f1 - 0.55) / 0.42) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Training time */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Training Time</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>~{metrics.trainTime}s</span>
            </div>
            <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: '#6366f1', borderRadius: 6 }}
                animate={{ width: `${Math.min(100, (metrics.trainTime / 3000) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Overfit risk gauge */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Overfitting Risk</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: metrics.overfitRisk > 0.6 ? '#ef4444' : metrics.overfitRisk > 0.3 ? '#f59e0b' : '#10b981' }}>
                {metrics.overfitRisk < 0.2 ? 'Low' : metrics.overfitRisk < 0.5 ? 'Medium' : 'High'}
              </span>
            </div>
            <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div
                style={{
                  height: '100%',
                  background: metrics.overfitRisk > 0.6 ? '#ef4444' : metrics.overfitRisk > 0.3 ? '#f59e0b' : '#10b981',
                  borderRadius: 6
                }}
                animate={{ width: `${metrics.overfitRisk * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Overfit warning */}
          <AnimatePresence>
            {isOverfit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: '#fef2f2', border: '2px solid #fca5a5',
                  borderRadius: 12, padding: '12px 16px',
                  fontSize: 13, color: '#991b1b', fontWeight: 600,
                }}
              >
                Warning: max_depth > 10 AND n_estimators > 300 — high overfitting risk!
                Your model memorizes training data but may fail on new machines.
                Try the "Balanced" preset.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <NeuronTip type="tip">
        Industry rule: start with the Balanced preset, then use Optuna to search around it. For PdM, a well-regularised model (low max_depth, moderate learning_rate) often beats an aggressive one because sensor data is noisy.
      </NeuronTip>

      <HindiExplainer
        concept="PdM मॉडल को ट्यून करना"
        english="Tuning Your PdM Model"
        explanation="XGBoost को tune करना एक cricket team selection जैसा है। n_estimators = team size (बड़ी team slower पर powerful), max_depth = each player की specialization level (बहुत deep = overfit), learning_rate = कितनी जल्दी सीखो (बहुत fast = unstable). Overfitting का मतलब है model training data रट लेता है पर नई machine पर fail होता है — जैसे student previous papers रटे पर exam में नए questions से घबरा जाए।"
        example="SteelForge factory की pump failure prediction के लिए: Balanced preset से शुरू करो (n_estimators=200, max_depth=6, learning_rate=0.1)। फिर Optuna से fine-tune करो। जब max_depth > 10 और n_estimators > 300 हो तो overfit का खतरा — model factory P-01 की हर noise को 'failure sign' मान लेगा।"
        terms={[
          { hindi: 'अति-अनुकूलन', english: 'Overfitting', meaning: 'Model training data पर perfect पर नए data पर fail — रटने वाला student' },
          { hindi: 'सीखने की दर', english: 'Learning Rate', meaning: 'हर step पर model कितना adjust करता है — बहुत fast = unstable, बहुत slow = never converges' },
          { hindi: 'नियमितीकरण', english: 'Regularization', meaning: 'Model को simple रखने की technique ताकि overfitting न हो' },
        ]}
      />
    </SectionBlock>
  )
}

/* ----------------------------------------------------------------
   SECTION 7: Hindi Summary
---------------------------------------------------------------- */
function HindiSummary() {
  return (
    <SectionBlock icon="हिं" title="Hindi Summary — हिंदी सारांश" color="#ff9933">
      <Neuron
        mood="waving"
        message="Hyperparameter tuning is like finding the perfect radio frequency — too low and you get static (underfitting), too high and it distorts (overfitting). The sweet spot is found by searching smartly!"
        size="small"
      />

      <HindiExplainer
        concept="Hyperparameter Tuning — सही Frequency खोजना"
        english="Hyperparameter Tuning"
        explanation="जैसे radio में सही frequency ढूंढनी पड़ती है — बहुत कम पर static (underfitting), बहुत ज़्यादा पर distortion (overfitting) — उसी तरह ML model के hyperparameters को tune करना पड़ता है। Grid Search हर frequency try करता है, Random Search random dial करता है, और Bayesian Optimization smart तरीके से सीखता जाता है।"
        example="Factory में machine बंद होने की prediction के लिए: XGBoost को tune करना = सही max_depth, n_estimators, learning_rate चुनना। Optuna इसे automatically करता है, और cross-validation बताता है कि model कितना reliable है।"
        terms={[
          { hindi: 'हाइपरपैरामीटर', english: 'Hyperparameter', meaning: 'Training से पहले set की जाने वाली setting — जैसे max_depth' },
          { hindi: 'ग्रिड खोज', english: 'Grid Search', meaning: 'सभी combinations try करना — धीमा पर पक्का' },
          { hindi: 'यादृच्छिक खोज', english: 'Random Search', meaning: 'Random combinations try करना — अक्सर Grid से बेहतर' },
          { hindi: 'बेयेसियन अनुकूलन', english: 'Bayesian Optimization', meaning: 'हर trial से सीखकर अगला trial smarter करना' },
          { hindi: 'क्रॉस-सत्यापन', english: 'Cross-Validation', meaning: 'Model को K अलग-अलग तरीकों से test करना' },
          { hindi: 'अति-अनुकूलन', english: 'Overfitting', meaning: 'Training data पर ज़्यादा fit होना — नए data पर fail' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
        {[
          { icon: '🔲', title: 'Grid Search', hindi: 'ग्रिड खोज', note: 'सभी combinations — पक्का पर महंगा', color: '#0ea5e9' },
          { icon: '🎲', title: 'Random Search', hindi: 'यादृच्छिक खोज', note: 'Smart sampling — तेज़ और अक्सर बेहतर', color: '#8b5cf6' },
          { icon: '🧠', title: 'Bayesian', hindi: 'बेयेसियन', note: 'Trial से सीखो — सबसे smart', color: '#ec4899' },
        ].map(item => (
          <div key={item.title} style={{
            background: `${item.color}10`, border: `1.5px solid ${item.color}40`,
            borderRadius: 16, padding: 18, textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 800, color: item.color, fontSize: 15 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>{item.hindi}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{item.note}</div>
          </div>
        ))}
      </div>
    </SectionBlock>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic11Content() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #ec4899 100%)',
          borderRadius: 24,
          padding: '40px 44px',
          marginBottom: 36,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          style={{
            position: 'absolute', top: -40, right: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, opacity: 0.75, textTransform: 'uppercase', marginBottom: 10 }}>
            Topic 11 — Predictive Maintenance
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}>
            Hyperparameter Tuning
          </h1>
          <p style={{ fontSize: 17, opacity: 0.88, maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
            Grid search, Bayesian optimization, and cross-validation — find the best settings for your
            predictive maintenance model without blindly guessing.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            {['Grid Search', 'Random Search', 'Bayesian Opt', 'Cross-Validation', 'XGBoost Tuning'].map(tag => (
              <span key={tag} style={{
                background: 'rgba(255,255,255,0.18)', borderRadius: 30,
                padding: '5px 14px', fontSize: 13, fontWeight: 600,
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Neuron intro */}
      <div style={{ marginBottom: 32 }}>
        <Neuron
          mood="excited"
          message="Imagine you're tuning a radio antenna — too short: no signal (underfitting). Too long: interference from everywhere (overfitting). The perfect length? That's what hyperparameter tuning finds. Let's search smartly!"
          size="large"
          typed
        />
      </div>

      <ParametersVsHyperparameters />
      <GridSearch />
      <RandomSearch />
      <BayesianOpt />
      <CrossValidation />
      <PdMTuningDashboard />
      <HindiSummary />

      {/* Footer summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 22, padding: '32px 40px', marginTop: 12,
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
          Key Takeaways
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { icon: '⚖️', text: 'Parameters are learned from data; hyperparameters are set by you before training.' },
            { icon: '🔲', text: 'Grid search is exhaustive but expensive — 4 params × 5 values = 625 combos.' },
            { icon: '🎲', text: 'Random search finds better results in the same number of trials by exploring more unique values.' },
            { icon: '🧠', text: 'Bayesian optimization (Optuna) learns from each trial and converges 4-5x faster than grid search.' },
            { icon: '🔀', text: 'Cross-validation gives honest, stable scores — always use it when selecting hyperparameters.' },
            { icon: '⚠️', text: 'max_depth > 10 + n_estimators > 300 = high overfit risk for noisy sensor data.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
